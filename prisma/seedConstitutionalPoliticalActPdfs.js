import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PDF_ACT_MAPPINGS = [
  {
    pdfFileName: 'constitution of India sechdules .pdf',
    displayName: 'Constitution of India Schedules',
    actSearchQuery: 'Constitution of India'
  },
  {
    pdfFileName: 'lokpal and lokayuktas act sechdules .pdf',
    displayName: 'Lokpal and Lokayuktas Act Schedules',
    actSearchQuery: 'Lokpal and Lokayuktas Act, 2013'
  },
  {
    pdfFileName: 'right to information act sechdules .pdf',
    displayName: 'Right to Information Act Schedules',
    actSearchQuery: 'Right to Information Act, 2005'
  }
];

export async function seedConstitutionalPoliticalActPdfs() {
  console.log('--- Seeding Constitutional and Political Act PDFs ---');

  // 1. Find existing Constitutional and Political category
  const bearerAct = await prisma.bearerAct.findFirst({
    where: {
      OR: [
        { name: { equals: 'Constitutional and Political', mode: 'insensitive' } },
        { name: { contains: 'Constitutional', mode: 'insensitive' } }
      ]
    },
    include: {
      acts: true
    }
  });

  if (!bearerAct) {
    throw new Error('Constitutional and Political BearerAct category not found in database.');
  }

  console.log(`Found BearerAct: "${bearerAct.name}" (${bearerAct.id}) with ${bearerAct.acts.length} Acts.`);

  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const item of PDF_ACT_MAPPINGS) {
    // 2. Find matching Act within Constitutional and Political BearerAct
    const normalizedQuery = item.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedAct = bearerAct.acts.find((act) => {
      const normHeading = act.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = act.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        normHeading.includes(normalizedQuery) ||
        normAct.includes(normalizedQuery) ||
        (normalizedQuery.includes('constitution') && normHeading.includes('constitution')) ||
        (normalizedQuery.includes('lokpal') && normHeading.includes('lokpal')) ||
        (normalizedQuery.includes('righttoinformation') && normHeading.includes('righttoinformation'))
      );
    });

    if (!matchedAct) {
      throw new Error(`Could not find existing Act matching "${item.actSearchQuery}" under ${bearerAct.name} BearerAct.`);
    }

    // 3. Check PDF file in local storage (or copy from Downloads / fallback paths if present)
    const localFilePath = path.resolve(uploadDir, item.pdfFileName);
    if (!fs.existsSync(localFilePath)) {
      const candidatePaths = [
        path.resolve('/Users/admin/Downloads', item.pdfFileName),
        ...(item.fallbackSourceNames || []).map((name) => path.resolve('/Users/admin/Downloads', name)),
        ...(item.fallbackSourceNames || []).map((name) => path.resolve(uploadDir, name))
      ];

      let copied = false;
      for (const candPath of candidatePaths) {
        if (fs.existsSync(candPath)) {
          fs.copyFileSync(candPath, localFilePath);
          copied = true;
          console.log(`Copied ${candPath} -> ${localFilePath}`);
          break;
        }
      }

      if (!copied && !fs.existsSync(localFilePath)) {
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

  console.log('--- Completed Seeding Constitutional and Political Act PDFs ---\n');
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('seedConstitutionalPoliticalActPdfs.js')) {
  seedConstitutionalPoliticalActPdfs()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
