import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import http from 'http';
import { signToken } from '../src/utils/jwt.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function ensureServerRunning() {
  await import('../src/server.js');
  // Wait 1 second for DB connection and server start
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function runE2ETests() {
  console.log('--- Starting Unified BNSS & BSA Legal-Content Module E2E Tests ---');

  await ensureServerRunning();

  // 1. Setup Test Users
  const timestamp = Date.now().toString().slice(-6);
  const creatorPasswordHash = await bcrypt.hash('password123', 10);
  const contentCreator = await prisma.contentCreator.upsert({
    where: { email: `bnss_bsa_creator_${timestamp}@example.com` },
    update: { isActive: true },
    create: {
      fullName: 'Legal Content Creator',
      email: `bnss_bsa_creator_${timestamp}@example.com`,
      passwordHash: creatorPasswordHash,
      isActive: true
    }
  });

  const normalUser = await prisma.user.upsert({
    where: { email: `bnss_bsa_user_${timestamp}@example.com` },
    update: { isActive: true },
    create: {
      fullName: 'Normal User',
      email: `bnss_bsa_user_${timestamp}@example.com`,
      phone: `91${timestamp}`,
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  });

  const advocate = await prisma.advocate.upsert({
    where: { email: `bnss_bsa_advocate_${timestamp}@example.com` },
    update: { isActive: true, status: 'ACTIVE' },
    create: {
      fullName: 'Lawyer Advocate',
      email: `bnss_bsa_advocate_${timestamp}@example.com`,
      phone: `92${timestamp}`,
      barCouncilId: `DL/${timestamp}/2026`,
      passwordHash: 'dummyhash',
      state: 'Delhi',
      city: 'Delhi',
      status: 'ACTIVE',
      isActive: true
    }
  });

  // Clean up any test BNSS & BSA records
  await prisma.bNSS.deleteMany({
    where: { sectionNo: { in: ['1', '2', '3A', '103', 'TEST_DUP'] } }
  });
  await prisma.bSA.deleteMany({
    where: { sectionNo: { in: ['1', '2', '3A', '103', 'TEST_DUP'] } }
  });

  const creatorToken = signToken({ id: contentCreator.id, type: 'content_creator' });
  const userToken = signToken({ id: normalUser.id, type: 'user' });
  const advocateToken = signToken({ id: advocate.id, type: 'advocate' });

  const clientCreator = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${creatorToken}` }
  });

  const clientUser = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${userToken}` }
  });

  const clientAdvocate = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${advocateToken}` }
  });

  const clientPublic = axios.create({
    baseURL: BASE_URL
  });

  let bnssSec1Id = null;
  let bsaSec1Id = null;
  let bnssSec2Id = null;

  try {
    // ----------------------------------------------------
    // Test 1: Content Creator creates BNSS section 1
    // ----------------------------------------------------
    console.log('\n[Test 1] Content Creator creates BNSS section 1...');
    const resCreateBNSS = await clientCreator.post('/api/content-creator/laws', {
      lawType: 'BNSS',
      sectionNo: '1',
      heading: 'Short title, extent and commencement of BNSS',
      sectionText: 'This Act may be called the Bharatiya Nagarik Suraksha Sanhita, 2023. It extends to the whole of India.',
      explanation: 'Explanation for BNSS preliminary section.',
      illustration: 'Illustration of jurisdiction application.'
    });

    console.log('Status:', resCreateBNSS.status, resCreateBNSS.data.success);
    if (!resCreateBNSS.data.success || resCreateBNSS.data.data.lawType !== 'BNSS' || resCreateBNSS.data.data.sectionNo !== '1') {
      throw new Error('Test 1 Failed: Could not create BNSS section 1');
    }
    bnssSec1Id = resCreateBNSS.data.data.id;

    // Verify in DB directly: exists in BNSS table, NOT in BSA table
    const dbBNSS = await prisma.bNSS.findUnique({ where: { id: bnssSec1Id } });
    const dbBSA_BNSSId = await prisma.bSA.findUnique({ where: { id: bnssSec1Id } });
    if (!dbBNSS || dbBSA_BNSSId) {
      throw new Error('Test 1 DB Verification Failed: Record not correctly isolated in BNSS table');
    }
    console.log('Test 1 Passed: BNSS section 1 stored in BNSS table.');

    // ----------------------------------------------------
    // Test 2: Content Creator creates BSA section 1 (Same sectionNo 1)
    // ----------------------------------------------------
    console.log('\n[Test 2] Content Creator creates BSA section 1 (same sectionNo 1 in separate BSA table)...');
    const resCreateBSA = await clientCreator.post('/api/content-creator/laws', {
      lawType: 'BSA',
      sectionNo: '1',
      heading: 'Short title, application and commencement of BSA',
      sectionText: 'This Act may be called the Bharatiya Sakshya Adhiniyam, 2023. It applies to all judicial proceedings in or before any Court.',
      explanation: 'Explanation for BSA evidence provisions.',
      illustration: 'Illustration of evidence applicability.'
    });

    console.log('Status:', resCreateBSA.status, resCreateBSA.data.success);
    if (!resCreateBSA.data.success || resCreateBSA.data.data.lawType !== 'BSA' || resCreateBSA.data.data.sectionNo !== '1') {
      throw new Error('Test 2 Failed: Could not create BSA section 1');
    }
    bsaSec1Id = resCreateBSA.data.data.id;

    // Verify in DB directly: exists in BSA table, NOT in BNSS table
    const dbBSA = await prisma.bSA.findUnique({ where: { id: bsaSec1Id } });
    const dbBNSS_BSAId = await prisma.bNSS.findUnique({ where: { id: bsaSec1Id } });
    if (!dbBSA || dbBNSS_BSAId) {
      throw new Error('Test 2 DB Verification Failed: Record not correctly isolated in BSA table');
    }
    console.log('Test 2 Passed: BSA section 1 stored in BSA table without conflict with BNSS section 1.');

    // ----------------------------------------------------
    // Test 3: Duplicate Section Protection within same law
    // ----------------------------------------------------
    console.log('\n[Test 3] Attempt duplicate creation of BNSS section 1...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        lawType: 'BNSS',
        sectionNo: '1',
        heading: 'Duplicate BNSS Heading',
        sectionText: 'Duplicate section text'
      });
      throw new Error('Test 3 Failed: Duplicate BNSS section should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('already exists')) {
        console.log('Passed duplicate BNSS check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Duplicate check in BSA
    console.log('\n[Test 3b] Attempt duplicate creation of BSA section 1...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        lawType: 'BSA',
        sectionNo: '1',
        heading: 'Duplicate BSA Heading',
        sectionText: 'Duplicate section text'
      });
      throw new Error('Test 3b Failed: Duplicate BSA section should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('already exists')) {
        console.log('Passed duplicate BSA check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // Test 4: Invalid lawType Validation (reject IPC, BNS, OTHER)
    // ----------------------------------------------------
    console.log('\n[Test 4] Attempt invalid lawType "IPC" / "OTHER"...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        lawType: 'IPC',
        sectionNo: '99',
        heading: 'Invalid Law',
        sectionText: 'Invalid text'
      });
      throw new Error('Test 4 Failed: lawType "IPC" should be rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed invalid lawType check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // Test 5: Forbidden Fields Check (id, createdAt)
    // ----------------------------------------------------
    console.log('\n[Test 5] Attempt to supply forbidden field "id" / "createdAt"...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        lawType: 'BNSS',
        id: 'fake-id',
        sectionNo: '2',
        heading: 'Definitions',
        sectionText: 'Definitions under BNSS'
      });
      throw new Error('Test 5 Failed: Client-provided "id" should be rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('cannot be provided')) {
        console.log('Passed forbidden field check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Create a second BNSS section for pagination & search tests
    const resCreateBNSS2 = await clientCreator.post('/api/content-creator/laws', {
      lawType: 'BNSS',
      sectionNo: '2',
      heading: 'Definitions and interpretations in criminal procedure',
      sectionText: 'In this Sanhita, unless the context otherwise requires, arrest and investigation definitions apply.',
      explanation: null,
      illustration: null
    });
    bnssSec2Id = resCreateBNSS2.data.data.id;

    // ----------------------------------------------------
    // Test 6: Role Restrictions - Normal User and Advocate rejected (403)
    // ----------------------------------------------------
    console.log('\n[Test 6] Normal User attempts to create law entry...');
    try {
      await clientUser.post('/api/content-creator/laws', {
        lawType: 'BNSS',
        sectionNo: '3A',
        heading: 'Construction of references',
        sectionText: 'Text...'
      });
      throw new Error('Test 6 Failed: Normal User should be forbidden (403)');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 Forbidden check for Normal User');
      } else {
        throw err;
      }
    }

    console.log('\n[Test 6b] Advocate attempts to create law entry...');
    try {
      await clientAdvocate.post('/api/content-creator/laws', {
        lawType: 'BNSS',
        sectionNo: '3A',
        heading: 'Construction of references',
        sectionText: 'Text...'
      });
      throw new Error('Test 6b Failed: Advocate should be forbidden (403)');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 Forbidden check for Advocate');
      } else {
        throw err;
      }
    }

    console.log('\n[Test 6c] Unauthenticated client attempts to create law entry...');
    try {
      await clientPublic.post('/api/content-creator/laws', {
        lawType: 'BNSS',
        sectionNo: '3A',
        heading: 'Construction of references',
        sectionText: 'Text...'
      });
      throw new Error('Test 6c Failed: Unauthenticated client should be rejected (401)');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('Passed 401 Unauthorized check for unauthenticated request');
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // Test 7: Edit Section (PATCH /api/content-creator/laws/:id)
    // ----------------------------------------------------
    console.log('\n[Test 7] Edit BNSS Section 1...');
    const resEditBNSS = await clientCreator.patch(`/api/content-creator/laws/${bnssSec1Id}`, {
      lawType: 'BNSS',
      heading: 'Short title, extent and commencement of BNSS (Updated)',
      explanation: 'Updated explanation on BNSS applicability'
    });
    console.log('Status:', resEditBNSS.status, resEditBNSS.data.success);
    if (resEditBNSS.data.data.heading !== 'Short title, extent and commencement of BNSS (Updated)') {
      throw new Error('Test 7 Failed: BNSS heading was not updated');
    }

    console.log('\n[Test 7b] Edit BSA Section 1...');
    const resEditBSA = await clientCreator.patch(`/api/content-creator/laws/${bsaSec1Id}`, {
      lawType: 'BSA',
      heading: 'Short title, application and commencement of BSA (Updated)',
      illustration: 'Updated illustration of electronic records'
    });
    console.log('Status:', resEditBSA.status, resEditBSA.data.success);
    if (resEditBSA.data.data.heading !== 'Short title, application and commencement of BSA (Updated)') {
      throw new Error('Test 7b Failed: BSA heading was not updated');
    }

    // ----------------------------------------------------
    // Test 8: Public List (GET /api/laws?lawType=BNSS & GET /api/laws?lawType=BSA)
    // ----------------------------------------------------
    console.log('\n[Test 8] Public client reads BNSS list...');
    const resListBNSS = await clientPublic.get('/api/laws?lawType=BNSS&page=1&limit=10');
    console.log('Public BNSS count:', resListBNSS.data.pagination.total);
    if (!resListBNSS.data.success || !resListBNSS.data.data.some(s => s.id === bnssSec1Id)) {
      throw new Error('Test 8 Failed: BNSS list did not include BNSS section 1');
    }
    // Ensure BSA section 1 is NOT present in BNSS list
    if (resListBNSS.data.data.some(s => s.id === bsaSec1Id)) {
      throw new Error('Test 8 Failed: BNSS list contained BSA section 1!');
    }

    console.log('\n[Test 8b] Public client reads BSA list...');
    const resListBSA = await clientPublic.get('/api/laws?lawType=BSA&page=1&limit=10');
    console.log('Public BSA count:', resListBSA.data.pagination.total);
    if (!resListBSA.data.success || !resListBSA.data.data.some(s => s.id === bsaSec1Id)) {
      throw new Error('Test 8b Failed: BSA list did not include BSA section 1');
    }
    // Ensure BNSS section 1 is NOT present in BSA list
    if (resListBSA.data.data.some(s => s.id === bnssSec1Id)) {
      throw new Error('Test 8b Failed: BSA list contained BNSS section 1!');
    }

    // ----------------------------------------------------
    // Test 9: Public Single Section (GET /api/laws/:id?lawType=...)
    // ----------------------------------------------------
    console.log('\n[Test 9] Public client fetches single BNSS section...');
    const resSingleBNSS = await clientPublic.get(`/api/laws/${bnssSec1Id}?lawType=BNSS`);
    console.log('Status:', resSingleBNSS.status, resSingleBNSS.data.data.heading);
    if (resSingleBNSS.data.data.sectionNo !== '1' || resSingleBNSS.data.data.lawType !== 'BNSS') {
      throw new Error('Test 9 Failed: Single BNSS fetch mismatch');
    }

    console.log('\n[Test 9b] Public client fetches single BSA section...');
    const resSingleBSA = await clientPublic.get(`/api/laws/${bsaSec1Id}?lawType=BSA`);
    console.log('Status:', resSingleBSA.status, resSingleBSA.data.data.heading);
    if (resSingleBSA.data.data.sectionNo !== '1' || resSingleBSA.data.data.lawType !== 'BSA') {
      throw new Error('Test 9b Failed: Single BSA fetch mismatch');
    }

    // Test 404 when looking for BNSS ID in BSA
    console.log('\n[Test 9c] Query BSA with BNSS ID (should return 404)...');
    try {
      await clientPublic.get(`/api/laws/${bnssSec1Id}?lawType=BSA`);
      throw new Error('Test 9c Failed: BNSS ID in BSA table should have returned 404');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('Passed 404 table separation check for get single law');
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // Test 10: Public Search (GET /api/laws/search?lawType=...&q=...)
    // ----------------------------------------------------
    console.log('\n[Test 10] Public search in BNSS for query "arrest"...');
    const resSearchBNSS = await clientPublic.get('/api/laws/search?lawType=BNSS&q=arrest');
    console.log('BNSS search results total:', resSearchBNSS.data.pagination.total);
    if (!resSearchBNSS.data.data.some(s => s.id === bnssSec2Id)) {
      throw new Error('Test 10 Failed: Search in BNSS did not find section containing "arrest"');
    }

    console.log('\n[Test 10b] Public search in BSA for query "judicial"...');
    const resSearchBSA = await clientPublic.get('/api/laws/search?lawType=BSA&q=judicial');
    console.log('BSA search results total:', resSearchBSA.data.pagination.total);
    if (!resSearchBSA.data.data.some(s => s.id === bsaSec1Id)) {
      throw new Error('Test 10b Failed: Search in BSA did not find section containing "judicial"');
    }

    // Ensure search respects lawType boundary
    console.log('\n[Test 10c] Public search in BSA for query "arrest" (should be 0 matches in BSA)...');
    const resSearchBSA_Arrest = await clientPublic.get('/api/laws/search?lawType=BSA&q=arrest');
    if (resSearchBSA_Arrest.data.data.some(s => s.id === bnssSec2Id)) {
      throw new Error('Test 10c Failed: BSA search leaked BNSS record!');
    }
    console.log('Passed lawType isolation in search.');

    // ----------------------------------------------------
    // Test 11: Delete Section (DELETE /api/content-creator/laws/:id?lawType=...)
    // ----------------------------------------------------
    console.log('\n[Test 11] Content Creator deletes BNSS Section 2...');
    const resDeleteBNSS2 = await clientCreator.delete(`/api/content-creator/laws/${bnssSec2Id}?lawType=BNSS`);
    console.log('Status:', resDeleteBNSS2.status, resDeleteBNSS2.data.message);

    const checkBNSS2InDb = await prisma.bNSS.findUnique({ where: { id: bnssSec2Id } });
    if (checkBNSS2InDb) {
      throw new Error('Test 11 Failed: BNSS Section 2 still exists in DB after deletion');
    }
    console.log('Passed BNSS Section deletion.');

    console.log('\n[Test 11b] Content Creator deletes BSA Section 1...');
    const resDeleteBSA1 = await clientCreator.delete(`/api/content-creator/laws/${bsaSec1Id}?lawType=BSA`);
    console.log('Status:', resDeleteBSA1.status, resDeleteBSA1.data.message);

    const checkBSA1InDb = await prisma.bSA.findUnique({ where: { id: bsaSec1Id } });
    if (checkBSA1InDb) {
      throw new Error('Test 11b Failed: BSA Section 1 still exists in DB after deletion');
    }
    console.log('Passed BSA Section deletion.');

    // Clean up remaining test data
    console.log('\n[Cleanup] Cleaning up all test records...');
    await prisma.bNSS.deleteMany({ where: { id: { in: [bnssSec1Id, bnssSec2Id].filter(Boolean) } } });
    await prisma.bSA.deleteMany({ where: { id: { in: [bsaSec1Id].filter(Boolean) } } });
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } });
    await prisma.user.delete({ where: { id: normalUser.id } });
    await prisma.advocate.delete({ where: { id: advocate.id } });

    console.log('\n======================================================');
    console.log('ALL BNSS & BSA LEGAL CONTENT TESTS PASSED 🚀');
    console.log('======================================================');

  } catch (error) {
    console.error('\nE2E Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Cleanup on failure
    await prisma.bNSS.deleteMany({ where: { id: { in: [bnssSec1Id, bnssSec2Id].filter(Boolean) } } }).catch(() => {});
    await prisma.bSA.deleteMany({ where: { id: { in: [bsaSec1Id].filter(Boolean) } } }).catch(() => {});
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: normalUser.id } }).catch(() => {});
    await prisma.advocate.delete({ where: { id: advocate.id } }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runE2ETests();
