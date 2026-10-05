import http from 'http';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import app from '../src/server.js';
import { seedCriminalActPdfs } from '../prisma/seedCriminalActPdfs.js';

const prisma = new PrismaClient();
let server;
let BASE_URL;

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      console.log(`Verification test server running at ${BASE_URL}\n`);
      resolve();
    });
  });
}

async function closeServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

const EXPECTED_PDFS = [
  {
    pdfFileName: 'bhartiya nagarik suraksha sanhita shechdule.pdf',
    displayName: 'bhartiya nagarik suraksha sanhita shechdule',
    actHeading: 'The Bharatiya Nagarik Suraksha Sanhita, 2023',
    expectedSize: 1192709
  },
  {
    pdfFileName: 'bhartiya sakshya Adhiniyam first schedule.pdf',
    displayName: 'bhartiya sakshya Adhiniyam first schedule',
    actHeading: 'The Bharatiya Sakshya Adhiniyam, 2023',
    expectedSize: 176464
  },
  {
    pdfFileName: 'NDPS act schedule.pdf',
    displayName: 'NDPS act schedule',
    actHeading: 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985',
    expectedSize: 352012
  },
  {
    pdfFileName: 'prevention of money laundering act schedule.pdf',
    displayName: 'prevention of money laundering act schedule',
    actHeading: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
    expectedSize: 353738
  },
  {
    pdfFileName: 'protection of children from sexual offences act schedule.pdf',
    displayName: 'protection of children from sexual offences act schedule',
    actHeading: 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012',
    expectedSize: 26176
  }
];

async function runVerification() {
  console.log('================================================================');
  console.log('  CRIMINAL ACT PDF SEEDING & API VERIFICATION SUITE');
  console.log('================================================================\n');

  await startServer();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Verify Criminal BearerAct exists
    const criminalBearerAct = await prisma.bearerAct.findFirst({
      where: { name: { equals: 'Criminal', mode: 'insensitive' } },
      include: {
        acts: {
          include: { pdfs: true }
        }
      }
    });

    assert(!!criminalBearerAct, 'Criminal BearerAct category exists in database');

    // 2. Verification per PDF
    console.log('\n--- 1. Database & File Storage Verification ---');
    for (const expected of EXPECTED_PDFS) {
      console.log(`\nVerifying PDF: "${expected.pdfFileName}" -> Act: "${expected.actHeading}"`);

      // Find the Act under Criminal BearerAct
      const act = criminalBearerAct.acts.find(
        (a) => a.heading.toLowerCase() === expected.actHeading.toLowerCase()
      );
      assert(!!act, `Act "${expected.actHeading}" found in Criminal BearerAct`);

      // Check attached PDF in database
      const attachedPdf = act.pdfs.find((p) => p.fileName === expected.pdfFileName);
      assert(!!attachedPdf, `PDF record exists in database for actId ${act.id}`);

      if (attachedPdf) {
        // Verify displayName
        assert(
          attachedPdf.displayName === expected.displayName,
          `displayName matches "${expected.displayName}" (actual: "${attachedPdf.displayName}")`
        );

        // Verify local file exists on disk
        const fullDiskPath = path.resolve(process.cwd(), attachedPdf.filePath);
        const fileExists = fs.existsSync(fullDiskPath);
        assert(fileExists, `File exists on disk at "${attachedPdf.filePath}"`);

        if (fileExists) {
          const stats = fs.statSync(fullDiskPath);
          assert(
            stats.size === expected.expectedSize,
            `File size matches ${expected.expectedSize} bytes (actual: ${stats.size})`
          );
        }

        // Verify Public API: GET /api/acts/:actId/pdfs
        const listRes = await axios.get(`${BASE_URL}/api/acts/${act.id}/pdfs`);
        assert(listRes.status === 200, `GET /api/acts/${act.id}/pdfs returns 200 OK`);
        assert(listRes.data.success === true, `API response success is true`);
        const apiPdf = listRes.data.data.find((p) => p.id === attachedPdf.id);
        assert(!!apiPdf, `PDF found in public API response for Act`);
        assert(
          apiPdf?.displayName === expected.displayName,
          `API response returns correct displayName "${expected.displayName}"`
        );
        assert(
          apiPdf?.fileName === expected.pdfFileName,
          `API response returns correct fileName "${expected.pdfFileName}"`
        );

        // Verify Public API: GET /api/acts/pdfs/:id (Single PDF details)
        const singleRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${attachedPdf.id}`);
        assert(singleRes.status === 200, `GET /api/acts/pdfs/${attachedPdf.id} returns 200 OK`);
        assert(
          singleRes.data.data.displayName === expected.displayName,
          `Single PDF API returns correct displayName`
        );

        // Verify Public API: GET /api/acts/pdfs/:id/view (Streaming/Inline)
        const viewRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${attachedPdf.id}/view`, {
          responseType: 'arraybuffer'
        });
        assert(viewRes.status === 200, `GET /api/acts/pdfs/${attachedPdf.id}/view returns 200 OK`);
        assert(
          viewRes.headers['content-type'] === 'application/pdf',
          `View endpoint returns content-type application/pdf`
        );
        assert(
          viewRes.data.length === expected.expectedSize,
          `View endpoint streams complete PDF binary (${viewRes.data.length} bytes)`
        );

        // Verify Public API: GET /api/acts/pdfs/:id/download (Attachment)
        const downloadRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${attachedPdf.id}/download`, {
          responseType: 'arraybuffer'
        });
        assert(downloadRes.status === 200, `GET /api/acts/pdfs/${attachedPdf.id}/download returns 200 OK`);
        assert(
          downloadRes.data.length === expected.expectedSize,
          `Download endpoint returns full PDF file`
        );
      }
    }

    // 3. Verify Idempotency (Rerunning seed does not create duplicate attachments)
    console.log('\n--- 2. Idempotency & Duplicate Prevention Test ---');
    const pdfCountBefore = await prisma.actPdf.count();
    console.log(`Total ActPdf count before re-seed: ${pdfCountBefore}`);

    const reseedResults = await seedCriminalActPdfs();
    const pdfCountAfter = await prisma.actPdf.count();
    console.log(`Total ActPdf count after re-seed: ${pdfCountAfter}`);

    assert(
      pdfCountBefore === pdfCountAfter,
      `Re-running seed did not create duplicates (Count: ${pdfCountBefore} -> ${pdfCountAfter})`
    );

    const allSkipped = reseedResults.every((r) => r.status === 'SKIPPED_DUPLICATE');
    assert(allSkipped, 'All 5 PDFs correctly identified as duplicates and skipped on re-run');

  } catch (error) {
    console.error('Verification suite error:', error.response?.data || error.message);
    failed++;
  } finally {
    await closeServer();
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
