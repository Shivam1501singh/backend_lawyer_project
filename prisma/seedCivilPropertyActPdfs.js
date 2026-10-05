import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PDF_ACT_MAPPINGS = [
  {
    pdfFileName: 'limitation act schedule.pdf',
    displayName: 'Limitation Act Schedule',
    actSearchQuery: 'Limitation Act, 1963'
  },
  {
    pdfFileName: 'right to fair compensation and transparency in land acquisition, rehabilitation and resettlement act shechdules.pdf',
    displayName: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act Schedules',
    actSearchQuery: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013'
  },
  {
    pdfFileName: 'specific relief act schedule .pdf',
    displayName: 'Specific Relief Act Schedule',
    actSearchQuery: 'Specific Relief Act, 1963'
  },
  {
    pdfFileName: 'transfer of property act schedule .pdf',
    displayName: 'Transfer of Property Act Schedule',
    actSearchQuery: 'Transfer of Property Act, 1882'
  }
];

export async function seedCivilPropertyActPdfs() {
  console.log('--- Seeding Civil & Property Act PDFs ---');

  // 1. Find existing Civil & Property category
  const civilBearerAct = await prisma.bearerAct.findFirst({
    where: {
      OR: [
        { name: { equals: 'Civil and Property', mode: 'insensitive' } },
        { name: { equals: 'Civil & Property', mode: 'insensitive' } }
      ]
    },
    include: {
      acts: true
    }
  });

  if (!civilBearerAct) {
    throw new Error('Civil and Property BearerAct category not found in database.');
  }

  console.log(`Found BearerAct: "${civilBearerAct.name}" (${civilBearerAct.id}) with ${civilBearerAct.acts.length} Acts.`);

  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const item of PDF_ACT_MAPPINGS) {
    // 2. Find matching Act within Civil and Property BearerAct
    const normalizedQuery = item.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedAct = civilBearerAct.acts.find((act) => {
      const normHeading = act.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = act.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normalizedQuery) || normAct.includes(normalizedQuery);
    });

    if (!matchedAct) {
      throw new Error(`Could not find existing Act matching "${item.actSearchQuery}" under Civil and Property BearerAct.`);
    }

    // 3. Check PDF file in local storage
    const localFilePath = path.resolve(uploadDir, item.pdfFileName);
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`PDF file not found at path: ${localFilePath}`);
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

  console.log('--- Completed Seeding Civil & Property Act PDFs ---\n');
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('seedCivilPropertyActPdfs.js')) {
  seedCivilPropertyActPdfs()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
