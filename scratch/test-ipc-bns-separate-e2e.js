import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt.js';

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5001';

async function runE2ETests() {
  console.log('--- Starting Separate IPC and BNS Legal Content E2E Tests ---');

  // 1. Setup Test Users
  const creatorPasswordHash = await bcrypt.hash('password123', 10);
  const contentCreator = await prisma.contentCreator.upsert({
    where: { email: 'ipc_bns_creator_test@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Legal Content Creator',
      email: 'ipc_bns_creator_test@example.com',
      passwordHash: creatorPasswordHash,
      isActive: true
    }
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'ipc_bns_user_test@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Normal User',
      email: 'ipc_bns_user_test@example.com',
      phone: '9888833333',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  });

  const advocate = await prisma.advocate.upsert({
    where: { email: 'ipc_bns_advocate_test@example.com' },
    update: { isActive: true, status: 'ACTIVE' },
    create: {
      fullName: 'Lawyer Advocate',
      email: 'ipc_bns_advocate_test@example.com',
      phone: '9888844444',
      barCouncilId: 'DL/88888/2026',
      passwordHash: 'dummyhash',
      state: 'Delhi',
      city: 'Delhi',
      status: 'ACTIVE',
      isActive: true
    }
  });

  // Clean up pre-existing test IPC & BNS sections
  await prisma.iPCSection.deleteMany({
    where: { sectionNo: { in: ['302', '304A', '420', '999Test'] } }
  });
  await prisma.bNSSection.deleteMany({
    where: { sectionNo: { in: ['302', '103', '105', '999Test'] } }
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
  let bns302Id = null;

  try {
    // Test 1: Content Creator creates IPC Section 302
    console.log('\n[Test 1] Content Creator creates IPC Section 302...');
    const resCreateIPC = await clientCreator.post('/api/content-creator/ipc', {
      sectionNo: '302',
      heading: 'Punishment for murder under IPC',
      paragraph: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
      explanation: 'IPC Section 302 details life imprisonment or capital punishment for murder.',
      content: 'Detailed IPC case precedents and legal commentary.',
      metaTitle: 'IPC Section 302 - Punishment for Murder',
      keywords: ['IPC Section 302', 'murder', 'IPC'],
      metaDescription: 'Information about IPC Section 302.'
    });

    console.log('Status:', resCreateIPC.status, resCreateIPC.data.success);
    if (!resCreateIPC.data.success || !resCreateIPC.data.data.id || resCreateIPC.data.data.sectionNo !== '302') {
      throw new Error('Test 1 Failed: Could not create IPC 302');
    }
    ipc302Id = resCreateIPC.data.data.id;

    // Test 2: Content Creator creates BNS Section 302 (Same sectionNo 302 in BNSSection table without collision!)
    console.log('\n[Test 2] Content Creator creates BNS Section 302 (independent table)...');
    const resCreateBNS = await clientCreator.post('/api/content-creator/bns', {
      sectionNo: '302',
      heading: 'Snatching under Bharatiya Nyaya Sanhita',
      paragraph: 'Whoever commits snatching shall be punished with imprisonment of either description for a term which may extend to three years.',
      explanation: 'BNS 302 covers the offense of snatching in the new criminal code.',
      content: 'Detailed statutory explanation of BNS Section 302.',
      metaTitle: 'BNS Section 302 - Snatching',
      keywords: ['BNS Section 302', 'snatching', 'BNS'],
      metaDescription: 'Information about BNS Section 302.'
    });

    console.log('Status:', resCreateBNS.status, resCreateBNS.data.success);
    if (!resCreateBNS.data.success || !resCreateBNS.data.data.id || resCreateBNS.data.data.sectionNo !== '302') {
      throw new Error('Test 2 Failed: Could not create BNS 302');
    }
    bns302Id = resCreateBNS.data.data.id;

    // Test 3: Duplicate Section Protection within IPC (IPC 302 duplicate rejected)
    console.log('\n[Test 3] Attempt duplicate create IPC Section 302...');
    try {
      await clientCreator.post('/api/content-creator/ipc', {
        sectionNo: '302',
        heading: 'Duplicate IPC Section 302',
        paragraph: 'Paragraph text...'
      });
      throw new Error('Test 3 Failed: Duplicate IPC section should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('already exists')) {
        console.log('Passed duplicate IPC check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 4: Forbidden field check (attempt to supply actType to IPC API)
    console.log('\n[Test 4] Attempt to supply forbidden actType field to IPC API...');
    try {
      await clientCreator.post('/api/content-creator/ipc', {
        actType: 'IPC',
        sectionNo: '304A',
        heading: 'Causing death by negligence',
        paragraph: 'Paragraph text...'
      });
      throw new Error('Test 4 Failed: actType field should be rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('cannot be provided')) {
        console.log('Passed forbidden field check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 5: Edit IPC Section (PATCH /api/content-creator/ipc/:ipcId)
    console.log('\n[Test 5] Edit IPC Section 302 with partial update...');
    const resEditIPC = await clientCreator.patch(`/api/content-creator/ipc/${ipc302Id}`, {
      heading: 'Punishment for murder under IPC (Updated Title)',
      metaTitle: 'Updated IPC Section 302 Guide'
    });
    console.log('Status:', resEditIPC.status, resEditIPC.data.success);
    if (resEditIPC.data.data.heading !== 'Punishment for murder under IPC (Updated Title)') {
      throw new Error('Test 5 Failed: IPC Heading was not updated');
    }

    // Test 6: Role Restrictions - Normal User cannot create or edit IPC or BNS
    console.log('\n[Test 6] Normal User attempts to create IPC section...');
    try {
      await clientUser.post('/api/content-creator/ipc', {
        sectionNo: '420',
        heading: 'Cheating',
        paragraph: 'Paragraph text'
      });
      throw new Error('Test 6 Failed: Normal User should be forbidden (403)');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 Forbidden check for Normal User:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 7: Public IPC List & Single View (GET /api/ipc & GET /api/ipc/:ipcId)
    console.log('\n[Test 7] Public user fetches IPC list...');
    const resListIPC = await clientPublic.get('/api/ipc?page=1&limit=15');
    console.log('Public IPC count:', resListIPC.data.pagination.total);
    if (!resListIPC.data.success || !resListIPC.data.data.some(s => s.id === ipc302Id)) {
      throw new Error('Test 7 Failed: IPC list did not return IPC 302');
    }
    // Ensure BNS 302 is NOT in IPC list!
    if (resListIPC.data.data.some(s => s.id === bns302Id)) {
      throw new Error('Test 7 Failed: IPC list contained BNS section record!');
    }

    console.log('\n[Test 7b] Public user fetches BNS list...');
    const resListBNS = await clientPublic.get('/api/bns?page=1&limit=15');
    console.log('Public BNS count:', resListBNS.data.pagination.total);
    if (!resListBNS.data.success || !resListBNS.data.data.some(s => s.id === bns302Id)) {
      throw new Error('Test 7b Failed: BNS list did not return BNS 302');
    }
    // Ensure IPC 302 is NOT in BNS list!
    if (resListBNS.data.data.some(s => s.id === ipc302Id)) {
      throw new Error('Test 7b Failed: BNS list contained IPC section record!');
    }

    // Test 8: Public IPC Search (GET /api/ipc/search?q=murder)
    console.log('\n[Test 8] Search IPC for query "murder"...');
    const resSearchIPC = await clientPublic.get('/api/ipc/search?q=murder');
    console.log('IPC search result count:', resSearchIPC.data.pagination.total);
    if (!resSearchIPC.data.data.some(s => s.id === ipc302Id)) {
      throw new Error('Test 8 Failed: IPC search did not find IPC 302');
    }
    // Verify BNS record is NOT returned in IPC search
    if (resSearchIPC.data.data.some(s => s.id === bns302Id)) {
      throw new Error('Test 8 Failed: IPC search returned BNS record!');
    }

    // Test 9: Public BNS Search (GET /api/bns/search?q=snatching)
    console.log('\n[Test 9] Search BNS for query "snatching"...');
    const resSearchBNS = await clientPublic.get('/api/bns/search?q=snatching');
    console.log('BNS search result count:', resSearchBNS.data.pagination.total);
    if (!resSearchBNS.data.data.some(s => s.id === bns302Id)) {
      throw new Error('Test 9 Failed: BNS search did not find BNS 302');
    }
    // Verify IPC record is NOT returned in BNS search
    if (resSearchBNS.data.data.some(s => s.id === ipc302Id)) {
      throw new Error('Test 9 Failed: BNS search returned IPC record!');
    }

    // Cleanup Test Data
    console.log('\nCleaning up test records from DB...');
    await prisma.iPCSection.deleteMany({ where: { id: { in: [ipc302Id].filter(Boolean) } } });
    await prisma.bNSSection.deleteMany({ where: { id: { in: [bns302Id].filter(Boolean) } } });
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } });
    await prisma.user.delete({ where: { id: normalUser.id } });
    await prisma.advocate.delete({ where: { id: advocate.id } });

    console.log('\n======================================================');
    console.log('ALL SEPARATE IPC AND BNS LEGAL CONTENT TESTS PASSED 🚀');
    console.log('======================================================');

  } catch (error) {
    console.error('\nE2E Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Cleanup on failure
    await prisma.iPCSection.deleteMany({ where: { id: { in: [ipc302Id].filter(Boolean) } } }).catch(() => {});
    await prisma.bNSSection.deleteMany({ where: { id: { in: [bns302Id].filter(Boolean) } } }).catch(() => {});
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: normalUser.id } }).catch(() => {});
    await prisma.advocate.delete({ where: { id: advocate.id } }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
