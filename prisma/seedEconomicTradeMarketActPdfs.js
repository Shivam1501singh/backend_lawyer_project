import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PDF_ACT_MAPPINGS = [
  {
    pdfFileName: 'prevention of money laundering act sechdules .pdf',
    displayName: 'Prevention of Money Laundering Act Schedules',
    actSearchQuery: 'Prevention of Money-Laundering Act, 2002'
  }
];

export async function seedEconomicTradeMarketActPdfs() {
  console.log('--- Seeding Economic, Trade, & Market Regulatory Act PDFs ---');

  // 1. Find existing Economic, Trade, & Market Regulatory category
  const bearerAct = await prisma.bearerAct.findFirst({
    where: {
      OR: [
        { name: { equals: 'Economic, Trade, & Market Regulatory', mode: 'insensitive' } },
        { name: { equals: 'Economic, Trade & Market Regulatory', mode: 'insensitive' } }
      ]
    },
    include: {
      acts: true
    }
  });

  if (!bearerAct) {
    throw new Error('Economic, Trade, & Market Regulatory BearerAct category not found in database.');
  }

  console.log(`Found BearerAct: "${bearerAct.name}" (${bearerAct.id}) with ${bearerAct.acts.length} Acts.`);

  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const item of PDF_ACT_MAPPINGS) {
    // 2. Find matching Act within Economic, Trade, & Market Regulatory BearerAct
    const normalizedQuery = item.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedAct = bearerAct.acts.find((act) => {
      const normHeading = act.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = act.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normalizedQuery) || normAct.includes(normalizedQuery) ||
             (normalizedQuery.includes('moneylaundering') && normHeading.includes('moneylaundering'));
    });

    if (!matchedAct) {
      throw new Error(`Could not find existing Act matching "${item.actSearchQuery}" under ${bearerAct.name} BearerAct.`);
    }

    // 3. Check PDF file in local storage (or copy from Downloads if present)
    const localFilePath = path.resolve(uploadDir, item.pdfFileName);
    if (!fs.existsSync(localFilePath)) {
      const fallbackPath = path.resolve('/Users/admin/Downloads', item.pdfFileName);
      if (fs.existsSync(fallbackPath)) {
        fs.copyFileSync(fallbackPath, localFilePath);
      } else {
        throw new Error(`PDF file not found at path: ${localFilePath}`);
      }
    }

    const stats = fs.statSync(localFilePath);
    const relativePath = path.relative(process.cwd(), localFilePath);

    // 4. Check for duplicate attachment (idempotent)
    const existing = await prisma.actPdf.findFirst({
      where: {
        actId: matchedAct.id,
        OR: [
          { fileName: item.pdfFileName },
          { filePath: relativePath },
          { filePath: localFilePath },
          { displayName: item.displayName }
        ]
      }
    });

    if (existing) {
      console.log(`ℹ️ [DUPLICATE] PDF already attached to "${matchedAct.heading}": ${existing.displayName} (ID: ${existing.id})`);
      results.push({
        status: 'SKIPPED_DUPLICATE',
        actId: matchedAct.id,
        actHeading: matchedAct.heading,
        pdf: existing
      });
      continue;
    }

    // 5. Create ActPdf database record
    const created = await prisma.actPdf.create({
      data: {
        actId: matchedAct.id,
        displayName: item.displayName,
        fileName: item.pdfFileName,
        filePath: relativePath,
        fileSize: stats.size,
        mimeType: 'application/pdf'
      }
    });

    console.log(`✅ [CREATED] Attached "${created.displayName}" to "${matchedAct.heading}" (ID: ${created.id}, Size: ${created.fileSize} bytes)`);
    results.push({
      status: 'CREATED',
      actId: matchedAct.id,
      actHeading: matchedAct.heading,
      pdf: created
    });
  }

  console.log('--- Completed Seeding Economic, Trade, & Market Regulatory Act PDFs ---\n');
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('seedEconomicTradeMarketActPdfs.js')) {
  seedEconomicTradeMarketActPdfs()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
