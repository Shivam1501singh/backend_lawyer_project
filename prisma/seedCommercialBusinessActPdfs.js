import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PDF_ACT_MAPPINGS = [
  {
    pdfFileName: 'commercial court act shechdules .pdf',
    displayName: 'Commercial Courts Act Schedules',
    actSearchQuery: 'Commercial Courts Act, 2015'
  },
  {
    pdfFileName: 'companies act shechdules .pdf',
    displayName: 'Companies Act Schedules',
    actSearchQuery: 'Companies Act, 2013'
  },
  {
    pdfFileName: 'insolvency and bankruptcy code shechdules .pdf',
    displayName: 'Insolvency and Bankruptcy Code Schedules',
    actSearchQuery: 'Insolvency and Bankruptcy Code, 2016'
  },
  {
    pdfFileName: 'limited liability partnership act shechdules .pdf',
    displayName: 'Limited Liability Partnership Act Schedules',
    actSearchQuery: 'Limited Liability Partnership Act, 2008'
  }
];

export async function seedCommercialBusinessActPdfs() {
  console.log('--- Seeding Commercial & Business Act PDFs ---');

  // 1. Find existing Commercial and Business category
  const commercialBearerAct = await prisma.bearerAct.findFirst({
    where: {
      OR: [
        { name: { equals: 'Commercial and Business', mode: 'insensitive' } },
        { name: { equals: 'Commercial & Business', mode: 'insensitive' } }
      ]
    },
    include: {
      acts: true
    }
  });

  if (!commercialBearerAct) {
    throw new Error('Commercial and Business BearerAct category not found in database.');
  }

  console.log(`Found BearerAct: "${commercialBearerAct.name}" (${commercialBearerAct.id}) with ${commercialBearerAct.acts.length} Acts.`);

  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const item of PDF_ACT_MAPPINGS) {
    // 2. Find matching Act within Commercial and Business BearerAct
    const normalizedQuery = item.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    let matchedAct = commercialBearerAct.acts.find((act) => {
      const normHeading = act.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = act.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normalizedQuery) || normAct.includes(normalizedQuery);
    });

    if (!matchedAct && normalizedQuery.includes('companiesact2013')) {
      // Find or create Companies Act under Commercial and Business category if missing
      matchedAct = await prisma.act.findFirst({
        where: {
          bearerActId: commercialBearerAct.id,
          heading: { contains: 'Companies', mode: 'insensitive' }
        }
      });
      if (!matchedAct) {
        matchedAct = await prisma.act.create({
          data: {
            bearerActId: commercialBearerAct.id,
            heading: 'THE COMPANIES ACT, 2013',
            act: 'THE COMPANIES ACT, 2013',
            year: 2013
          }
        });
        console.log(`Created Act record: "${matchedAct.heading}" under "${commercialBearerAct.name}"`);
      }
    }

    if (!matchedAct) {
      throw new Error(`Could not find existing Act matching "${item.actSearchQuery}" under Commercial and Business BearerAct.`);
    }

    // 3. Check PDF file in local storage (or copy from Downloads if needed)
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

  console.log('--- Completed Seeding Commercial & Business Act PDFs ---\n');
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('seedCommercialBusinessActPdfs.js')) {
  seedCommercialBusinessActPdfs()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
