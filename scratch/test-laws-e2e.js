import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt.js';

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5001';

async function runE2ETests() {
  console.log('--- Starting Legal Acts / Laws E2E Tests ---');

  // 1. Setup Test Users
  const creatorPasswordHash = await bcrypt.hash('password123', 10);
  const contentCreator = await prisma.contentCreator.upsert({
    where: { email: 'law_creator_test@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Legal Content Creator',
      email: 'law_creator_test@example.com',
      passwordHash: creatorPasswordHash,
      isActive: true
    }
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'law_normal_user@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Normal User',
      email: 'law_normal_user@example.com',
      phone: '9888811111',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  });

  const advocate = await prisma.advocate.upsert({
    where: { email: 'law_advocate@example.com' },
    update: { isActive: true, status: 'ACTIVE' },
    create: {
      fullName: 'Lawyer Advocate',
      email: 'law_advocate@example.com',
      phone: '9888822222',
      barCouncilId: 'DL/77777/2026',
      passwordHash: 'dummyhash',
      state: 'Delhi',
      city: 'Delhi',
      status: 'ACTIVE',
      isActive: true
    }
  });

  // Clean up pre-existing test legal acts
  await prisma.legalAct.deleteMany({
    where: {
      sectionNo: { in: ['302', '304A', '103', '999Test'] }
    }
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

  let ipc302Id = null;
  let bns103Id = null;

  try {
    // Test 1: Content Creator creates IPC Section 302
    console.log('\n[Test 1] Content Creator creates IPC Section 302...');
    const resCreateIPC = await clientCreator.post('/api/content-creator/laws', {
      actType: 'IPC',
      sectionNo: '302',
      heading: 'Punishment for murder',
      paragraph: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
      explanation: 'This section explains the punishment applicable to a person who commits murder.',
      content: 'Detailed legal interpretations and precedents for IPC Section 302.',
      metaTitle: 'IPC Section 302 - Punishment for Murder',
      keywords: ['IPC Section 302', 'murder', 'Indian Penal Code'],
      metaDescription: 'Information about IPC Section 302 and punishment for murder.'
    });

    console.log('Status:', resCreateIPC.status, resCreateIPC.data.success);
    if (!resCreateIPC.data.success || !resCreateIPC.data.data.id || resCreateIPC.data.data.actType !== 'IPC') {
      throw new Error('Test 1 Failed: Could not create IPC 302');
    }
    ipc302Id = resCreateIPC.data.data.id;

    // Test 2: Content Creator creates BNS Section 103 (Same heading topic, different actType)
    console.log('\n[Test 2] Content Creator creates BNS Section 103...');
    const resCreateBNS = await clientCreator.post('/api/content-creator/laws', {
      actType: 'BNS',
      sectionNo: '103',
      heading: 'Punishment for murder under BNS',
      paragraph: 'Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine under Bharatiya Nyaya Sanhita.',
      explanation: 'BNS 103 corresponds to IPC 302 in the new criminal law code.',
      content: 'Comparative legal analysis between BNS 103 and IPC 302.',
      metaTitle: 'BNS Section 103 - Punishment for Murder',
      keywords: ['BNS Section 103', 'murder', 'Bharatiya Nyaya Sanhita'],
      metaDescription: 'Information about BNS Section 103 provisions.'
    });

    console.log('Status:', resCreateBNS.status, resCreateBNS.data.success);
    if (!resCreateBNS.data.success || !resCreateBNS.data.data.id || resCreateBNS.data.data.actType !== 'BNS') {
      throw new Error('Test 2 Failed: Could not create BNS 103');
    }
    bns103Id = resCreateBNS.data.data.id;

    // Test 3: Duplicate Section Protection (IPC + 302 should be rejected)
    console.log('\n[Test 3] Attempt duplicate create IPC Section 302...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        actType: 'IPC',
        sectionNo: '302',
        heading: 'Duplicate section',
        paragraph: 'Some paragraph text'
      });
      throw new Error('Test 3 Failed: Duplicate section should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('already exists')) {
        console.log('Passed duplicate check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 4: Invalid actType validation (abc)
    console.log('\n[Test 4] Attempt invalid actType (abc)...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        actType: 'abc',
        sectionNo: '999Test',
        heading: 'Test heading',
        paragraph: 'Test paragraph'
      });
      throw new Error('Test 4 Failed: Invalid actType should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed invalid actType check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 5: Missing compulsory field validation (heading missing)
    console.log('\n[Test 5] Attempt create with missing required field (heading)...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        actType: 'IPC',
        sectionNo: '304A',
        heading: '',
        paragraph: 'Paragraph text...'
      });
      throw new Error('Test 5 Failed: Missing required field should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed missing required field check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 6: Forbidden client-supplied fields (createdBy)
    console.log('\n[Test 6] Attempt create passing forbidden createdBy field...');
    try {
      await clientCreator.post('/api/content-creator/laws', {
        actType: 'IPC',
        sectionNo: '304A',
        heading: 'Causing death by negligence',
        paragraph: 'Whoever causes the death of any person by doing any rash or negligent act...',
        createdBy: 'hacker-id'
      });
      throw new Error('Test 6 Failed: Forbidden field should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed forbidden field check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 7: Edit Law Section (PATCH /api/content-creator/laws/:lawId) with partial updates
    console.log('\n[Test 7] Edit IPC 302 section with partial update...');
    const resEdit = await clientCreator.patch(`/api/content-creator/laws/${ipc302Id}`, {
      heading: 'Punishment for murder (Updated)',
      metaTitle: 'IPC Section 302 - Punishment for Murder (Updated SEO Title)'
    });
    console.log('Status:', resEdit.status, resEdit.data.success);
    if (resEdit.data.data.heading !== 'Punishment for murder (Updated)') {
      throw new Error('Test 7 Failed: Heading was not updated');
    }

    // Test 8: Authorization rule - Normal User cannot create or edit laws
    console.log('\n[Test 8] Normal User attempts to create law...');
    try {
      await clientUser.post('/api/content-creator/laws', {
        actType: 'IPC',
        sectionNo: '304A',
        heading: 'Unauthorized create',
        paragraph: 'Paragraph text'
      });
      throw new Error('Test 8 Failed: Normal User should be forbidden (403)');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 Forbidden check for Normal User:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 9: Authorization rule - Advocate cannot edit laws
    console.log('\n[Test 9] Advocate attempts to edit law...');
    try {
      await clientAdvocate.patch(`/api/content-creator/laws/${ipc302Id}`, {
        heading: 'Advocate edit attempt'
      });
      throw new Error('Test 9 Failed: Advocate should be forbidden (403)');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 Forbidden check for Advocate:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 10: Public Law View Endpoint (GET /api/laws/:lawId) - No Auth Required
    console.log('\n[Test 10] Public user retrieves IPC 302 by ID...');
    const resGetSingle = await clientPublic.get(`/api/laws/${ipc302Id}`);
    console.log('Status:', resGetSingle.status, resGetSingle.data.success);
    if (!resGetSingle.data.success || resGetSingle.data.data.id !== ipc302Id) {
      throw new Error('Test 10 Failed: Public retrieve single law failed');
    }
    // Verify internal fields like createdBy are NOT exposed
    if (resGetSingle.data.data.createdBy !== undefined) {
      throw new Error('Test 10 Failed: Sensitive createdBy field was exposed publicly!');
    }

    // Test 11: Public Law Listing Endpoint (GET /api/laws) with filtering & pagination
    console.log('\n[Test 11] Public user lists IPC laws...');
    const resListIPC = await clientPublic.get('/api/laws?actType=IPC&page=1&limit=15');
    console.log('List IPC response total:', resListIPC.data.pagination.total);
    if (!resListIPC.data.success || !resListIPC.data.data.some(l => l.id === ipc302Id)) {
      throw new Error('Test 11 Failed: IPC law listing did not return IPC 302');
    }

    console.log('\n[Test 11b] Public user lists BNS laws...');
    const resListBNS = await clientPublic.get('/api/laws?actType=BNS&page=1&limit=15');
    console.log('List BNS response total:', resListBNS.data.pagination.total);
    if (!resListBNS.data.success || !resListBNS.data.data.some(l => l.id === bns103Id)) {
      throw new Error('Test 11b Failed: BNS law listing did not return BNS 103');
    }

    // Test 12: Public Law Search Endpoint (GET /api/laws/search)
    console.log('\n[Test 12] Search for query "murder"...');
    const resSearchMurder = await clientPublic.get('/api/laws/search?q=murder');
    console.log('Search "murder" total results:', resSearchMurder.data.pagination.total);
    if (resSearchMurder.data.data.length < 2) {
      throw new Error('Test 12 Failed: Search "murder" should return both IPC 302 and BNS 103');
    }

    console.log('\n[Test 12b] Search for section "302" with actType=IPC...');
    const resSearch302 = await clientPublic.get('/api/laws/search?actType=IPC&q=302');
    console.log('Search "302" results count:', resSearch302.data.data.length);
    if (!resSearch302.data.data.some(l => l.sectionNo === '302' && l.actType === 'IPC')) {
      throw new Error('Test 12b Failed: Search IPC 302 failed');
    }

    // Cleanup Test Data
    console.log('\nCleaning up test records from DB...');
    await prisma.legalAct.deleteMany({
      where: { id: { in: [ipc302Id, bns103Id] } }
    });
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } });
    await prisma.user.delete({ where: { id: normalUser.id } });
    await prisma.advocate.delete({ where: { id: advocate.id } });

    console.log('\n=======================================');
    console.log('ALL LEGAL ACTS / LAWS E2E TESTS PASSED 🚀');
    console.log('=======================================');

  } catch (error) {
    console.error('\nE2E Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Cleanup on failure
    if (ipc302Id || bns103Id) {
      await prisma.legalAct.deleteMany({
        where: { id: { in: [ipc302Id, bns103Id].filter(Boolean) } }
      }).catch(() => {});
    }
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: normalUser.id } }).catch(() => {});
    await prisma.advocate.delete({ where: { id: advocate.id } }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
