import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PDF_ACT_MAPPINGS = [
  {
    pdfFileName: 'Hindu sucession act 1956 schedule.pdf',
    displayName: 'Hindu Succession Act 1956 Schedule',
    actSearchQuery: 'Hindu Succession Act, 1956'
  },
  {
    pdfFileName: 'indian christian marriage act shechdules .pdf',
    displayName: 'Indian Christian Marriage Act Schedules',
    actSearchQuery: 'Indian Christian Marriage Act, 1872'
  },
  {
    pdfFileName: 'parsi marriage and divorce act shechdules .pdf',
    displayName: 'Parsi Marriage and Divorce Act Schedules',
    actSearchQuery: 'Parsi Marriage and Divorce Act, 1936'
  },
  {
    pdfFileName: 'special marriage act shechdules .pdf',
    displayName: 'Special Marriage Act Schedules',
    actSearchQuery: 'Special Marriage Act, 1954'
  }
];

export async function seedPersonalActPdfs() {
  console.log('--- Seeding Personal Act PDFs ---');

  // 1. Find existing Personal category
  const personalBearerAct = await prisma.bearerAct.findFirst({
    where: {
      name: {
        equals: 'Personal',
        mode: 'insensitive'
      }
    },
    include: {
      acts: true
    }
  });

  if (!personalBearerAct) {
    throw new Error('Personal BearerAct category not found in database.');
  }

  console.log(`Found BearerAct: "${personalBearerAct.name}" (${personalBearerAct.id}) with ${personalBearerAct.acts.length} Acts.`);

  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const item of PDF_ACT_MAPPINGS) {
    // 2. Find matching Act within Personal BearerAct
    const normalizedQuery = item.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedAct = personalBearerAct.acts.find((act) => {
      const normHeading = act.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = act.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normalizedQuery) || normAct.includes(normalizedQuery);
    });

    if (!matchedAct) {
      throw new Error(`Could not find existing Act matching "${item.actSearchQuery}" under Personal BearerAct.`);
    }

    // 3. Check PDF file in local storage (or copy from fallback if present)
    let localFilePath = path.resolve(uploadDir, item.pdfFileName);
    if (!fs.existsSync(localFilePath)) {
      // Check fallback Downloads directory if available
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

  console.log('--- Completed Seeding Personal Act PDFs ---\n');
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('seedPersonalActPdfs.js')) {
  seedPersonalActPdfs()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
