import http from 'http';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import app from '../src/server.js';
import { seedCivilPropertyActPdfs } from '../prisma/seedCivilPropertyActPdfs.js';

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
    pdfFileName: 'limitation act schedule.pdf',
    displayName: 'Limitation Act Schedule',
    actSearchQuery: 'Limitation Act, 1963',
    actHeading: 'THE LIMITATION ACT, 1963',
    expectedSize: 240854
  },
  {
    pdfFileName: 'right to fair compensation and transparency in land acquisition, rehabilitation and resettlement act shechdules.pdf',
    displayName: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act Schedules',
    actSearchQuery: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013',
    actHeading: 'THE RIGHT TO FAIR COMPENSATION AND TRANSPARENCY IN LAND ACQUISITION, REHABILITATION AND RESETTLEMENT ACT, 2013',
    expectedSize: 766263
  },
  {
    pdfFileName: 'specific relief act schedule .pdf',
    displayName: 'Specific Relief Act Schedule',
    actSearchQuery: 'Specific Relief Act, 1963',
    actHeading: 'THE SPECIFIC RELIEF ACT, 1963',
    expectedSize: 300300
  },
  {
    pdfFileName: 'transfer of property act schedule .pdf',
    displayName: 'Transfer of Property Act Schedule',
    actSearchQuery: 'Transfer of Property Act, 1882',
    actHeading: 'THE TRANSFER OF PROPERTY ACT, 1882',
    expectedSize: 675547
  }
];

async function runVerification() {
  console.log('================================================================');
  console.log('  CIVIL & PROPERTY ACT PDF SEEDING & API VERIFICATION SUITE');
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
    // 1. Verify Civil and Property BearerAct exists
    const civilBearerAct = await prisma.bearerAct.findFirst({
      where: {
        OR: [
          { name: { equals: 'Civil and Property', mode: 'insensitive' } },
          { name: { equals: 'Civil & Property', mode: 'insensitive' } }
        ]
      },
      include: {
        acts: {
          include: { pdfs: true }
        }
      }
    });

    assert(!!civilBearerAct, 'Civil and Property BearerAct category exists in database');

    // 2. Verification per PDF
    console.log('\n--- 1. Database & File Storage Verification ---');
    for (const expected of EXPECTED_PDFS) {
      console.log(`\nVerifying PDF: "${expected.pdfFileName}" -> Act: "${expected.actHeading}"`);

      // Find the Act under Civil and Property BearerAct
      const act = civilBearerAct.acts.find(
        (a) => a.heading.toLowerCase() === expected.actHeading.toLowerCase()
      );
      assert(!!act, `Act "${expected.actHeading}" found in Civil and Property BearerAct`);

      // Check attached PDF in database
      const attachedPdf = act?.pdfs?.find((p) => p.fileName === expected.pdfFileName);
      assert(!!attachedPdf, `PDF record exists in database for actId ${act?.id}`);

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

        // Verify Public API: GET /api/acts/:id (Act with pdfs)
        const actDetailRes = await axios.get(`${BASE_URL}/api/acts/${act.id}`);
        assert(actDetailRes.status === 200, `GET /api/acts/${act.id} returns 200 OK`);
        const pdfInActDetail = actDetailRes.data.data.pdfs?.find((p) => p.id === attachedPdf.id);
        assert(!!pdfInActDetail, `PDF included in GET /api/acts/${act.id} response`);

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

    // 3. Verify other Acts in Civil and Property do NOT have unintended PDFs
    console.log('\n--- 2. Scope & Isolation Verification ---');
    const actsWithoutUploadedPdf = civilBearerAct.acts.filter(
      (a) => !EXPECTED_PDFS.some((exp) => exp.actHeading.toLowerCase() === a.heading.toLowerCase())
    );
    for (const act of actsWithoutWithoutUploadedPdfs(actsWithoutUploadedPdf)) {
      assert(
        act.pdfs.length === 0,
        `Act "${act.heading}" has 0 attached PDFs (no unintended seeding)`
      );
    }

    // 4. Verify Idempotency (Rerunning seed does not create duplicate attachments)
    console.log('\n--- 3. Idempotency & Duplicate Prevention Test ---');
    const pdfCountBefore = await prisma.actPdf.count();
    console.log(`Total ActPdf count before re-seed: ${pdfCountBefore}`);

    const reseedResults = await seedCivilPropertyActPdfs();
    const pdfCountAfter = await prisma.actPdf.count();
    console.log(`Total ActPdf count after re-seed: ${pdfCountAfter}`);

    assert(
      pdfCountBefore === pdfCountAfter,
      `Re-running seed did not create duplicates (Count: ${pdfCountBefore} -> ${pdfCountAfter})`
    );

    const allSkipped = reseedResults.every((r) => r.status === 'SKIPPED_DUPLICATE');
    assert(allSkipped, 'All 4 PDFs correctly identified as duplicates and skipped on re-run');

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

function actsWithoutWithoutUploadedPdfs(acts) {
  return acts;
}

runVerification();
