process.env.NODE_ENV = 'test';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import app from '../src/server.js';
import { signToken } from '../src/utils/jwt.js';


const prisma = new PrismaClient();
let server;
let BASE_URL;

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      console.log(`Test server running at ${BASE_URL}`);
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

async function runTests() {
  console.log('=== STARTING ACT PDF MANAGEMENT E2E TEST SUITE ===\n');
  await startServer();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Setup Content Creator & Regular User tokens
    let creator = await prisma.contentCreator.findFirst();
    if (!creator) {
      creator = await prisma.contentCreator.create({
        data: {
          email: `test.creator.${Date.now()}@example.com`,
          fullName: 'PDF Test Content Creator',
          passwordHash: 'dummy'
        }
      });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `test.user.${Date.now()}@example.com`,
          phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
          fullName: 'Test User',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        }
      });
    }

    const creatorToken = signToken({ id: creator.id, type: 'content_creator', role: 'CONTENT_CREATOR' });
    const userToken = signToken({ id: user.id, type: 'user', role: 'USER' });

    // 2. Setup Test Bearer Act & Act
    const testBearerAct = await prisma.bearerAct.create({
      data: {
        name: `Test PDF Bearer Act Category ${Date.now()}`
      }
    });

    const testAct = await prisma.act.create({
      data: {
        bearerActId: testBearerAct.id,
        heading: 'The Test PDF Act 2026',
        act: 'TEST_PDF_ACT',
        year: 2026
      }
    });

    console.log(`Created Test Act with ID: ${testAct.id}\n`);

    // -------------------------------------------------------------
    // Test 1: Upload Authorization checks
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: Upload Authorization ---');

    // 1a. Unauthenticated upload attempt
    try {
      const form = new FormData();
      form.append('pdfs', Buffer.from('%PDF-1.4 test content'), {
        filename: 'test_unauth.pdf',
        contentType: 'application/pdf'
      });
      await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, form, {
        headers: form.getHeaders()
      });
      assert(false, 'Unauthenticated upload should fail with 401');
    } catch (err) {
      assert(err.response && err.response.status === 401, 'Unauthenticated upload rejected with 401');
    }

    // 1b. Regular USER upload attempt (forbidden role)
    try {
      const form = new FormData();
      form.append('pdfs', Buffer.from('%PDF-1.4 test content'), {
        filename: 'test_user_forbidden.pdf',
        contentType: 'application/pdf'
      });
      await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${userToken}`
        }
      });
      assert(false, 'Regular USER role upload should fail with 403');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Regular USER upload rejected with 403 Forbidden');
    }

    // -------------------------------------------------------------
    // Test 2: Validation of invalid inputs
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Validation & Error Handling ---');

    // 2a. Invalid Act ID (Non-existent Act)
    try {
      const form = new FormData();
      form.append('pdfs', Buffer.from('%PDF-1.4 test content'), {
        filename: 'valid.pdf',
        contentType: 'application/pdf'
      });
      await axios.post(`${BASE_URL}/api/content-creator/acts/non-existent-act-uuid-12345/pdfs`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${creatorToken}`
        }
      });
      assert(false, 'Upload to non-existent Act should fail with 404');
    } catch (err) {
      assert(err.response && err.response.status === 404, 'Upload to non-existent Act returns 404');
    }

    // 2b. Invalid file type (e.g. .txt or image instead of .pdf)
    try {
      const form = new FormData();
      form.append('pdfs', Buffer.from('This is a text file, not a PDF'), {
        filename: 'invalid_file.txt',
        contentType: 'text/plain'
      });
      await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${creatorToken}`
        }
      });
      assert(false, 'Upload of non-PDF file should fail with 400');
    } catch (err) {
      assert(err.response && err.response.status === 400, 'Non-PDF file rejected with 400 Bad Request');
    }

    // 2c. Empty upload (no files attached)
    try {
      const form = new FormData();
      await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${creatorToken}`
        }
      });
      assert(false, 'Upload without files should fail with 400');
    } catch (err) {
      assert(err.response && err.response.status === 400, 'Empty upload rejected with 400');
    }

    // -------------------------------------------------------------
    // Test 3: Multiple PDF Uploads by Content Creator
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Valid Multiple PDF Uploads ---');

    const formMulti = new FormData();
    const pdf1Content = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Test Act Volume 1) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const pdf2Content = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Test Act Volume 2 Amendments) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    formMulti.append('pdfs', pdf1Content, {
      filename: 'The_Test_Act_2026_Vol1.pdf',
      contentType: 'application/pdf'
    });
    formMulti.append('pdfs', pdf2Content, {
      filename: 'The_Test_Act_2026_Amendments.pdf',
      contentType: 'application/pdf'
    });

    const uploadRes = await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, formMulti, {
      headers: {
        ...formMulti.getHeaders(),
        Authorization: `Bearer ${creatorToken}`
      }
    });

    assert(uploadRes.status === 201, 'Multiple PDF upload succeeds with 201 Created');
    assert(uploadRes.data.success === true, 'Response indicates success');
    assert(Array.isArray(uploadRes.data.data) && uploadRes.data.data.length === 2, 'Returned 2 uploaded PDF records');
    
    const uploadedPdf1 = uploadRes.data.data[0];
    const uploadedPdf2 = uploadRes.data.data[1];

    assert(uploadedPdf1.actId === testAct.id, 'Uploaded PDF 1 has correct actId');
    assert(uploadedPdf1.fileName === 'The_Test_Act_2026_Vol1.pdf', 'Uploaded PDF 1 has correct fileName');
    assert(uploadedPdf1.viewUrl.includes('/view'), 'Uploaded PDF 1 contains valid viewUrl');
    assert(uploadedPdf1.downloadUrl.includes('/download'), 'Uploaded PDF 1 contains valid downloadUrl');
    assert(fs.existsSync(uploadedPdf1.filePath), 'Uploaded PDF 1 physically exists on local disk');

    // -------------------------------------------------------------
    // Test 4: Public Read APIs (No Auth Required)
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Public PDF Read APIs ---');

    // 4a. Get all PDFs for an Act
    const listRes = await axios.get(`${BASE_URL}/api/acts/${testAct.id}/pdfs`);
    assert(listRes.status === 200, 'GET /api/acts/:actId/pdfs returns 200');
    assert(listRes.data.success === true, 'List response indicates success');
    assert(listRes.data.data.length >= 2, 'List returns attached PDFs');
    assert(listRes.data.act.id === testAct.id, 'List response contains Act metadata');

    // 4b. Get single PDF details
    const singleRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${uploadedPdf1.id}`);
    assert(singleRes.status === 200, 'GET /api/acts/pdfs/:id returns 200');
    assert(singleRes.data.data.id === uploadedPdf1.id, 'Single PDF details match requested ID');
    assert(singleRes.data.data.act && singleRes.data.data.act.id === testAct.id, 'Single PDF details include parent Act');

    // 4c. Non-existent PDF details
    try {
      await axios.get(`${BASE_URL}/api/acts/pdfs/non-existent-pdf-uuid-999`);
      assert(false, 'Non-existent PDF should return 404');
    } catch (err) {
      assert(err.response && err.response.status === 404, 'Non-existent PDF returns 404');
    }

    // 4d. Non-existent Act PDF list
    try {
      await axios.get(`${BASE_URL}/api/acts/non-existent-act-uuid-999/pdfs`);
      assert(false, 'Non-existent Act PDF list should return 404');
    } catch (err) {
      assert(err.response && err.response.status === 404, 'Non-existent Act PDF list returns 404');
    }

    // 4e. Verify Act details endpoint also includes pdfs array
    const actWithPdfsRes = await axios.get(`${BASE_URL}/api/acts/${testAct.id}`);
    assert(actWithPdfsRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(Array.isArray(actWithPdfsRes.data.data.pdfs) && actWithPdfsRes.data.data.pdfs.length >= 2, 'Act details includes attached pdfs array');

    // -------------------------------------------------------------
    // Test 5: Public PDF Viewing & Downloading (No Auth)
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Public PDF Viewing & Downloading ---');

    // 5a. Inline View PDF
    const viewRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${uploadedPdf1.id}/view`, {
      responseType: 'arraybuffer'
    });
    assert(viewRes.status === 200, 'GET /api/acts/pdfs/:id/view returns 200');
    assert(viewRes.headers['content-type'] === 'application/pdf', 'View sets Content-Type to application/pdf');
    assert(viewRes.headers['content-disposition'].includes('inline'), 'View sets Content-Disposition to inline');
    assert(viewRes.data.toString().startsWith('%PDF-1.4'), 'View returned valid PDF binary stream');

    // 5b. Download PDF
    const downloadRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${uploadedPdf1.id}/download`, {
      responseType: 'arraybuffer'
    });
    assert(downloadRes.status === 200, 'GET /api/acts/pdfs/:id/download returns 200');
    assert(downloadRes.headers['content-type'] === 'application/pdf', 'Download sets Content-Type to application/pdf');
    assert(downloadRes.headers['content-disposition'].includes('attachment'), 'Download sets Content-Disposition to attachment');

    // -------------------------------------------------------------
    // Test 6: Predefined PDF Support & Duplicate Prevention
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Predefined PDF Support & Idempotency ---');

    const uploadsDir = path.resolve('uploads/acts');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const predefinedFileName = `predefined_${testAct.id}.pdf`;
    const predefinedFilePath = path.join(uploadsDir, predefinedFileName);
    fs.writeFileSync(predefinedFilePath, '%PDF-1.4 Predefined Act PDF Document Sample');

    // 6a. Attach Predefined PDF
    const attachRes1 = await axios.post(
      `${BASE_URL}/api/content-creator/acts/${testAct.id}/predefined-pdfs`,
      { fileName: predefinedFileName },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    assert(attachRes1.status === 201, 'First attachment of predefined PDF returns 201 Created');
    assert(attachRes1.data.isDuplicate === false, 'Indicates isDuplicate === false');
    assert(attachRes1.data.data.fileName === predefinedFileName, 'Predefined PDF attached with correct name');

    // 6b. Duplicate Attachment Prevention
    const attachRes2 = await axios.post(
      `${BASE_URL}/api/content-creator/acts/${testAct.id}/predefined-pdfs`,
      { fileName: predefinedFileName },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    assert(attachRes2.status === 200, 'Second attachment attempt returns 200 OK (idempotent)');
    assert(attachRes2.data.isDuplicate === true, 'Duplicate attachment flagged (isDuplicate === true)');

    // Verify DB count of this predefined PDF for testAct is exactly 1
    const dbPdfCount = await prisma.actPdf.count({
      where: {
        actId: testAct.id,
        fileName: predefinedFileName
      }
    });
    assert(dbPdfCount === 1, 'Database contains exactly 1 attachment record (no duplicate created)');

    // 6c. Predefined Sync API
    const syncRes = await axios.post(
      `${BASE_URL}/api/content-creator/acts/predefined-pdfs/sync`,
      {},
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    assert(syncRes.status === 200, 'Predefined sync API returns 200');
    assert(syncRes.data.success === true, 'Predefined sync returns success');

    // -------------------------------------------------------------
    // Test 7: Clean-up / Delete API
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: PDF Deletion ---');

    const deleteRes = await axios.delete(
      `${BASE_URL}/api/content-creator/acts/pdfs/${uploadedPdf2.id}`,
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    assert(deleteRes.status === 200, 'DELETE /api/content-creator/acts/pdfs/:id returns 200');

    const deletedCheck = await prisma.actPdf.findUnique({
      where: { id: uploadedPdf2.id }
    });
    assert(!deletedCheck, 'Deleted PDF record no longer exists in DB');

    // Clean up test Act & Bearer Act
    await prisma.act.delete({ where: { id: testAct.id } });
    await prisma.bearerAct.delete({ where: { id: testBearerAct.id } });
    if (fs.existsSync(predefinedFilePath)) fs.unlinkSync(predefinedFilePath);

    console.log('\n========================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

  } catch (err) {
    console.error('Unhandled test execution error:', err.response?.data || err.message || err);
    failed++;
  } finally {
    await closeServer();
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
