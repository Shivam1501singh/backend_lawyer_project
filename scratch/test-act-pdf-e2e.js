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
      form.append('displayName', 'Bare Act 2026');
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
      form.append('displayName', 'Bare Act 2026');
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

    // 2a. Missing displayName rejected
    try {
      const form = new FormData();
      form.append('pdfs', Buffer.from('%PDF-1.4 test content'), {
        filename: 'valid.pdf',
        contentType: 'application/pdf'
      });
      await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${creatorToken}`
        }
      });
      assert(false, 'Upload without displayName should fail with 400');
    } catch (err) {
      assert(err.response && err.response.status === 400, 'Upload without displayName rejected with 400 Bad Request');
    }

    // 2b. Empty displayName rejected
    try {
      const form = new FormData();
      form.append('displayName', '   ');
      form.append('pdfs', Buffer.from('%PDF-1.4 test content'), {
        filename: 'valid.pdf',
        contentType: 'application/pdf'
      });
      await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${creatorToken}`
        }
      });
      assert(false, 'Upload with empty displayName should fail with 400');
    } catch (err) {
      assert(err.response && err.response.status === 400, 'Upload with empty displayName rejected with 400 Bad Request');
    }

    // 2c. Invalid Act ID (Non-existent Act)
    try {
      const form = new FormData();
      form.append('displayName', 'Bare Act 2026');
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

    // 2d. Invalid file type (e.g. .txt or image instead of .pdf)
    try {
      const form = new FormData();
      form.append('displayName', 'Invalid File');
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

    // 2e. Empty upload (no files attached)
    try {
      const form = new FormData();
      form.append('displayName', 'Empty File');
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
    // Test 3: Upload Single and Multiple PDFs with Display Name
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Valid PDF Uploads with Display Name ---');

    // 3a. Single PDF upload with displayName
    const formSingle = new FormData();
    formSingle.append('displayName', 'Official Bare Act Full Text (English)');
    formSingle.append('pdf', Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Bare Act) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'), {
      filename: 'The_Test_Act_2026_Full.pdf',
      contentType: 'application/pdf'
    });

    const singleUploadRes = await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, formSingle, {
      headers: {
        ...formSingle.getHeaders(),
        Authorization: `Bearer ${creatorToken}`
      }
    });

    assert(singleUploadRes.status === 201, 'Single PDF upload with displayName succeeds with 201 Created');
    assert(singleUploadRes.data.data[0].displayName === 'Official Bare Act Full Text (English)', 'Uploaded single PDF has correct displayName in response');

    const uploadedPdf1 = singleUploadRes.data.data[0];

    // 3b. Multiple PDF upload with displayName
    const formMulti = new FormData();
    formMulti.append('displayName', 'Amendments & Schedules');
    const pdf2Content = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Amendments) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const pdf3Content = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Schedules) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    formMulti.append('pdfs', pdf2Content, {
      filename: 'The_Test_Act_2026_Amendments.pdf',
      contentType: 'application/pdf'
    });
    formMulti.append('pdfs', pdf3Content, {
      filename: 'The_Test_Act_2026_Schedules.pdf',
      contentType: 'application/pdf'
    });

    const multiUploadRes = await axios.post(`${BASE_URL}/api/content-creator/acts/${testAct.id}/pdfs`, formMulti, {
      headers: {
        ...formMulti.getHeaders(),
        Authorization: `Bearer ${creatorToken}`
      }
    });

    assert(multiUploadRes.status === 201, 'Multiple PDF upload succeeds with 201 Created');
    assert(multiUploadRes.data.data.length === 2, 'Returned 2 uploaded PDF records');
    assert(multiUploadRes.data.data[0].displayName.includes('Amendments & Schedules'), 'Multi PDF 1 has displayName');
    assert(multiUploadRes.data.data[1].displayName.includes('Amendments & Schedules'), 'Multi PDF 2 has displayName');

    const uploadedPdf2 = multiUploadRes.data.data[0];

    // -------------------------------------------------------------
    // Test 4: Public Read APIs Return Display Name
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Public PDF Read APIs (Display Name Verification) ---');

    // 4a. Get all PDFs for an Act
    const listRes = await axios.get(`${BASE_URL}/api/acts/${testAct.id}/pdfs`);
    assert(listRes.status === 200, 'GET /api/acts/:actId/pdfs returns 200');
    assert(listRes.data.success === true, 'List response indicates success');
    assert(listRes.data.data.length >= 3, 'List returns attached PDFs');
    assert(listRes.data.data.every(p => !!p.displayName), 'All returned PDFs have displayName field populated');

    // 4b. Get single PDF details
    const singleRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${uploadedPdf1.id}`);
    assert(singleRes.status === 200, 'GET /api/acts/pdfs/:id returns 200');
    assert(singleRes.data.data.id === uploadedPdf1.id, 'Single PDF details match requested ID');
    assert(singleRes.data.data.displayName === 'Official Bare Act Full Text (English)', 'Single PDF details return correct displayName');
    assert(singleRes.data.data.act && singleRes.data.data.act.id === testAct.id, 'Single PDF details include parent Act');

    // 4c. Verify Act details endpoint includes pdfs with displayName
    const actWithPdfsRes = await axios.get(`${BASE_URL}/api/acts/${testAct.id}`);
    assert(actWithPdfsRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(Array.isArray(actWithPdfsRes.data.data.pdfs) && actWithPdfsRes.data.data.pdfs.length >= 3, 'Act details includes attached pdfs array');
    assert(actWithPdfsRes.data.data.pdfs.some(p => p.displayName === 'Official Bare Act Full Text (English)'), 'Act details contains PDF with displayName');

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

    // 5b. Download PDF
    const downloadRes = await axios.get(`${BASE_URL}/api/acts/pdfs/${uploadedPdf1.id}/download`, {
      responseType: 'arraybuffer'
    });
    assert(downloadRes.status === 200, 'GET /api/acts/pdfs/:id/download returns 200');
    assert(downloadRes.headers['content-type'] === 'application/pdf', 'Download sets Content-Type to application/pdf');
    assert(downloadRes.headers['content-disposition'].includes('attachment'), 'Download sets Content-Disposition to attachment');

    // -------------------------------------------------------------
    // Test 6: Predefined PDF Support & Idempotency
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Predefined PDF Support with Display Name ---');

    const uploadsDir = path.resolve('uploads/acts');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const predefinedFileName = `predefined_${testAct.id}.pdf`;
    const predefinedFilePath = path.join(uploadsDir, predefinedFileName);
    fs.writeFileSync(predefinedFilePath, '%PDF-1.4 Predefined Act PDF Document Sample');

    // 6a. Attach Predefined PDF with custom displayName
    const attachRes1 = await axios.post(
      `${BASE_URL}/api/content-creator/acts/${testAct.id}/predefined-pdfs`,
      { fileName: predefinedFileName, displayName: 'Predefined Bare Act Copy' },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    assert(attachRes1.status === 201, 'First attachment of predefined PDF returns 201 Created');
    assert(attachRes1.data.isDuplicate === false, 'Indicates isDuplicate === false');
    assert(attachRes1.data.data.displayName === 'Predefined Bare Act Copy', 'Predefined PDF attached with custom displayName');

    // 6b. Duplicate Attachment Prevention
    const attachRes2 = await axios.post(
      `${BASE_URL}/api/content-creator/acts/${testAct.id}/predefined-pdfs`,
      { fileName: predefinedFileName, displayName: 'Predefined Bare Act Copy' },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    assert(attachRes2.status === 200, 'Second attachment attempt returns 200 OK (idempotent)');
    assert(attachRes2.data.isDuplicate === true, 'Duplicate attachment flagged (isDuplicate === true)');

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

    // Clean up test Act & Bearer Act & files
    await prisma.act.delete({ where: { id: testAct.id } });
    await prisma.bearerAct.delete({ where: { id: testBearerAct.id } });
    if (fs.existsSync(predefinedFilePath)) fs.unlinkSync(predefinedFilePath);

    // Clean up any remaining test pdf files in uploads/acts
    const actFiles = fs.readdirSync(uploadsDir);
    for (const file of actFiles) {
      if (file.endsWith('.pdf')) {
        try { fs.unlinkSync(path.join(uploadsDir, file)); } catch (e) {}
      }
    }

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
