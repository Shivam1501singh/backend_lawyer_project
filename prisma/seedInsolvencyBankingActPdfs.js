import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PDF_ACT_MAPPINGS = [
  {
    pdfFileName: 'factoring regulation act sechdules .pdf',
    displayName: 'Factoring Regulation Act Schedules',
    actSearchQuery: 'Factoring Regulation Act, 2011'
  },
  {
    pdfFileName: 'insolvency and bankruptcy code shechdules (1).pdf',
    fallbackSourceNames: ['insolvency and bankruptcy code shechdules (1).pdf', 'insolvency and bankruptcy code shechdules .pdf'],
    displayName: 'Insolvency and Bankruptcy Code Schedules',
    actSearchQuery: 'Insolvency and Bankruptcy Code, 2016'
  },
  {
    pdfFileName: 'reserve Bank of India act sechdules -compressed.pdf',
    displayName: 'Reserve Bank of India Act Schedules',
    actSearchQuery: 'Reserve Bank of India Act, 1934'
  },
  {
    pdfFileName: 'securitisation and reconstruction of financial assets and enforcement of security interest act sechdules .pdf',
    displayName: 'Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act Schedules',
    actSearchQuery: 'Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act, 2002'
  }
];

export async function seedInsolvencyBankingActPdfs() {
  console.log('--- Seeding Insolvency, Banking & Debt Recovery Act PDFs ---');

  // 1. Find existing Insolvency, Banking, & Debt Recovery category
  const bearerAct = await prisma.bearerAct.findFirst({
    where: {
      OR: [
        { name: { contains: 'Insolvency', mode: 'insensitive' } },
        { name: { contains: 'Banking', mode: 'insensitive' } },
        { name: { contains: 'Debt Recovery', mode: 'insensitive' } }
      ]
    },
    include: {
      acts: true
    }
  });

  if (!bearerAct) {
    throw new Error('Insolvency, Banking, & Debt Recovery BearerAct category not found in database.');
  }

  console.log(`Found BearerAct: "${bearerAct.name}" (${bearerAct.id}) with ${bearerAct.acts.length} Acts.`);

  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const item of PDF_ACT_MAPPINGS) {
    // 2. Find matching Act within Insolvency, Banking, & Debt Recovery BearerAct
    const normalizedQuery = item.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedAct = bearerAct.acts.find((act) => {
      const normHeading = act.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = act.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normalizedQuery) || normAct.includes(normalizedQuery) ||
             (normalizedQuery.includes('factoring') && normHeading.includes('factoring')) ||
             (normalizedQuery.includes('insolvency') && normHeading.includes('insolvency')) ||
             (normalizedQuery.includes('reservebank') && normHeading.includes('reservebank')) ||
             (normalizedQuery.includes('securitisation') && normHeading.includes('securitisation'));
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

  console.log('--- Completed Seeding Insolvency, Banking & Debt Recovery Act PDFs ---\n');
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('seedInsolvencyBankingActPdfs.js')) {
  seedInsolvencyBankingActPdfs()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
