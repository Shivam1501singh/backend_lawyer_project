import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PDF_ACT_MAPPINGS = [
  {
    pdfFileName: 'bhartiya nagarik suraksha sanhita shechdule.pdf',
    displayName: 'bhartiya nagarik suraksha sanhita shechdule',
    actSearchQuery: 'Bharatiya Nagarik Suraksha Sanhita'
  },
  {
    pdfFileName: 'bhartiya sakshya Adhiniyam first schedule.pdf',
    displayName: 'bhartiya sakshya Adhiniyam first schedule',
    actSearchQuery: 'Bharatiya Sakshya Adhiniyam'
  },
  {
    pdfFileName: 'NDPS act schedule.pdf',
    displayName: 'NDPS act schedule',
    actSearchQuery: 'Narcotic Drugs and Psychotropic Substances Act'
  },
  {
    pdfFileName: 'prevention of money laundering act schedule.pdf',
    displayName: 'prevention of money laundering act schedule',
    actSearchQuery: 'Prevention of Money-Laundering Act'
  },
  {
    pdfFileName: 'protection of children from sexual offences act schedule.pdf',
    displayName: 'protection of children from sexual offences act schedule',
    actSearchQuery: 'Protection of Children from Sexual Offences Act'
  }
];

export async function seedCriminalActPdfs() {
  console.log('--- Seeding Criminal Act PDFs ---');

  // 1. Find existing Criminal category
  const criminalBearerAct = await prisma.bearerAct.findFirst({
    where: {
      name: {
        equals: 'Criminal',
        mode: 'insensitive'
      }
    },
    include: {
      acts: true
    }
  });

  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct category not found in database.');
  }

  console.log(`Found Criminal BearerAct: ${criminalBearerAct.name} (${criminalBearerAct.id}) with ${criminalBearerAct.acts.length} Acts.`);

  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const item of PDF_ACT_MAPPINGS) {
    // 2. Find matching Act within Criminal BearerAct
    const normalizedQuery = item.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedAct = criminalBearerAct.acts.find((act) => {
      const normHeading = act.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = act.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normalizedQuery) || normAct.includes(normalizedQuery);
    });

    if (!matchedAct) {
      throw new Error(`Could not find existing Act matching "${item.actSearchQuery}" under Criminal BearerAct.`);
    }

    // 3. Check PDF file in local storage
    const localFilePath = path.resolve(uploadDir, item.pdfFileName);
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`PDF file not found at path: ${localFilePath}`);
    }

    const stats = fs.statSync(localFilePath);
    const relativePath = path.relative(process.cwd(), localFilePath);

    // 4. Check for duplicate attachment
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

  console.log('--- Completed Seeding Criminal Act PDFs ---\n');
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('seedCriminalActPdfs.js')) {
  seedCriminalActPdfs()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
