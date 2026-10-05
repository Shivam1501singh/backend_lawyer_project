import fs from 'fs';
import path from 'path';
import http from 'http';
import prisma from '../src/lib/prisma.js';
import app from '../src/server.js';
import { seedCommercialBusinessActPdfs } from '../prisma/seedCommercialBusinessActPdfs.js';

const EXPECTED_MAPPINGS = [
  {
    actSearchQuery: 'Commercial Courts Act, 2015',
    pdfFileName: 'commercial court act shechdules .pdf',
    displayName: 'Commercial Courts Act Schedules'
  },
  {
    actSearchQuery: 'Companies Act, 2013',
    pdfFileName: 'companies act shechdules .pdf',
    displayName: 'Companies Act Schedules'
  },
  {
    actSearchQuery: 'Insolvency and Bankruptcy Code, 2016',
    pdfFileName: 'insolvency and bankruptcy code shechdules .pdf',
    displayName: 'Insolvency and Bankruptcy Code Schedules'
  },
  {
    actSearchQuery: 'Limited Liability Partnership Act, 2008',
    pdfFileName: 'limited liability partnership act shechdules .pdf',
    displayName: 'Limited Liability Partnership Act Schedules'
  }
];

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE COMMERCIAL & BUSINESS ACT PDF TESTS');
  console.log('========================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details}`);
    }
  }

  // 1. Run seed first
  console.log('--- Step 1: Running Seeder ---');
  await seedCommercialBusinessActPdfs();

  // 2. Verify Commercial & Business BearerAct
  console.log('\n--- Step 2: Verifying Database Records ---');
  const commercialBearer = await prisma.bearerAct.findFirst({
    where: {
      OR: [
        { name: { equals: 'Commercial and Business', mode: 'insensitive' } },
        { name: { equals: 'Commercial & Business', mode: 'insensitive' } }
      ]
    },
    include: {
      acts: {
        include: {
          pdfs: true
        }
      }
    }
  });

  assert(!!commercialBearer, 'Commercial and Business BearerAct category exists in database');

  // 3. Check each expected mapping
  for (const expected of EXPECTED_MAPPINGS) {
    const normQuery = expected.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const act = commercialBearer.acts.find((a) => {
      const normHeading = a.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAct = a.act.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normQuery) || normAct.includes(normQuery);
    });

    assert(!!act, `Found Act for "${expected.actSearchQuery}": "${act?.heading}"`);

    const pdf = act?.pdfs.find((p) => p.displayName === expected.displayName);
    assert(!!pdf, `PDF record exists with displayName "${expected.displayName}"`);

    if (pdf) {
      assert(pdf.fileName === expected.pdfFileName, `fileName matches exact file name: "${expected.pdfFileName}"`);
      assert(pdf.actId === act.id, `actId foreign key matches "${act.id}"`);

      // 4. Local file existence & readable
      const diskPath = path.resolve(process.cwd(), pdf.filePath);
      const fileExists = fs.existsSync(diskPath);
      assert(fileExists, `Physical file exists at: "${diskPath}"`);

      if (fileExists) {
        const stats = fs.statSync(diskPath);
        assert(stats.size > 0 && stats.size === pdf.fileSize, `File size matches stored size (${stats.size} bytes)`);
      }
    }
  }

  // 5. Verify non-target Commercial & Business Acts (like SEBI, Specific Relief)
  const nonTargetActs = commercialBearer.acts.filter((a) => {
    return !EXPECTED_MAPPINGS.some((m) => {
      const normQuery = m.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normHeading = a.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normHeading.includes(normQuery);
    });
  });

  for (const act of nonTargetActs) {
    assert(act.pdfs.length === 0, `Non-target Commercial & Business act "${act.heading}" has 0 PDFs attached`);
  }

  // 6. Test idempotency
  console.log('\n--- Step 3: Testing Seed Idempotency ---');
  const seedResults = await seedCommercialBusinessActPdfs();
  const allDuplicates = seedResults.every((r) => r.status === 'SKIPPED_DUPLICATE');
  assert(allDuplicates, 'Re-running seedCommercialBusinessActPdfs is fully idempotent (all skipped as duplicate)');

  // 7. Test Public Express API endpoints
  console.log('\n--- Step 4: Testing Public API Endpoints via Express ---');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    for (const expected of EXPECTED_MAPPINGS) {
      const normQuery = expected.actSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
      const act = commercialBearer.acts.find((a) => {
        const normHeading = a.heading.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normHeading.includes(normQuery);
      });
      const pdf = act?.pdfs.find((p) => p.displayName === expected.displayName);

      // GET /api/acts/:actId/pdfs
      const resActPdfs = await fetch(`${baseUrl}/api/acts/${act.id}/pdfs`);
      assert(resActPdfs.status === 200, `GET /api/acts/${act.id}/pdfs returns 200 OK`);
      const dataActPdfs = await resActPdfs.json();
      assert(dataActPdfs.success === true, `API response has success: true`);
      assert(dataActPdfs.data.some((p) => p.displayName === expected.displayName), `API includes "${expected.displayName}"`);

      // GET /api/acts/pdfs/:id
      const resSinglePdf = await fetch(`${baseUrl}/api/acts/pdfs/${pdf.id}`);
      assert(resSinglePdf.status === 200, `GET /api/acts/pdfs/${pdf.id} returns 200 OK`);
      const dataSinglePdf = await resSinglePdf.json();
      assert(dataSinglePdf.data.displayName === expected.displayName, `Single PDF response displayName matches "${expected.displayName}"`);
      assert(dataSinglePdf.data.viewUrl.includes(`/api/acts/pdfs/${pdf.id}/view`), `viewUrl is properly generated`);
      assert(dataSinglePdf.data.downloadUrl.includes(`/api/acts/pdfs/${pdf.id}/download`), `downloadUrl is properly generated`);

      // GET /api/acts/pdfs/:id/view
      const resView = await fetch(`${baseUrl}/api/acts/pdfs/${pdf.id}/view`);
      assert(resView.status === 200, `GET /api/acts/pdfs/${pdf.id}/view returns 200 OK`);
      assert(resView.headers.get('content-type')?.includes('application/pdf'), `View response Content-Type is application/pdf`);
      const viewBuffer = await resView.arrayBuffer();
      assert(viewBuffer.byteLength === pdf.fileSize, `View response stream byte length (${viewBuffer.byteLength}) matches file size (${pdf.fileSize})`);

      // GET /api/acts/pdfs/:id/download
      const resDownload = await fetch(`${baseUrl}/api/acts/pdfs/${pdf.id}/download`);
      assert(resDownload.status === 200, `GET /api/acts/pdfs/${pdf.id}/download returns 200 OK`);
      assert(resDownload.headers.get('content-disposition')?.includes('attachment'), `Download response Content-Disposition header indicates attachment`);
      const downloadBuffer = await resDownload.arrayBuffer();
      assert(downloadBuffer.byteLength === pdf.fileSize, `Download response stream byte length (${downloadBuffer.byteLength}) matches file size (${pdf.fileSize})`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n========================================================');
  console.log(`🏁 TESTS FINISHED: ${passedCount}/${totalCount} assertions passed`);
  console.log('========================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
