import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt.js';

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5001';

async function runOrderingTests() {
  console.log('--- Starting IPC & BNS Legal Section Ordering Comprehensive E2E Tests ---');

  const client = axios.create({ baseURL: BASE_URL });

  // 1. Setup Content Creator test user
  const creatorPasswordHash = await bcrypt.hash('password123', 10);
  const contentCreator = await prisma.contentCreator.upsert({
    where: { email: 'ipc_ordering_test_creator@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Ordering Test Creator',
      email: 'ipc_ordering_test_creator@example.com',
      passwordHash: creatorPasswordHash,
      isActive: true
    }
  });

  const creatorToken = signToken({ id: contentCreator.id, type: 'content_creator' });
  const clientCreator = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${creatorToken}` }
  });

  let customIpcIds = [];
  let customBnsIds = [];

  try {
    // -------------------------------------------------------------
    // Test 1: Verify IPC Section List is Ascending (1, 2, ... 9, 10, 11, ...)
    // -------------------------------------------------------------
    console.log('\n[Test 1] Fetching first 30 IPC sections from GET /api/ipc?page=1&limit=30...');
    const resIpcList = await client.get('/api/ipc?page=1&limit=30');
    if (!resIpcList.data.success || !Array.isArray(resIpcList.data.data)) {
      throw new Error('Test 1 Failed: Expected successful IPC section list');
    }

    const ipcSectionNos = resIpcList.data.data.map(s => s.sectionNo);
    console.log('Returned IPC sections (first 30):', ipcSectionNos);

    // Verify 1 comes before 2, 2 before 3 ... 9 before 10, 10 before 11
    const expectedPrefix = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    for (let i = 0; i < expectedPrefix.length; i++) {
      if (ipcSectionNos[i] !== expectedPrefix[i]) {
        throw new Error(`Test 1 Failed: IPC section at index ${i} is '${ipcSectionNos[i]}', expected '${expectedPrefix[i]}'`);
      }
    }
    console.log('✓ PASS: IPC sections 1 through 20 are in exact ascending legal order (no 1, 10, 11, 2)!');

    // -------------------------------------------------------------
    // Test 2: Verify BNS Section List is Ascending (1, 2, ... 9, 10, 11, ...)
    // -------------------------------------------------------------
    console.log('\n[Test 2] Fetching first 30 BNS sections from GET /api/bns?page=1&limit=30...');
    const resBnsList = await client.get('/api/bns?page=1&limit=30');
    if (!resBnsList.data.success || !Array.isArray(resBnsList.data.data)) {
      throw new Error('Test 2 Failed: Expected successful BNS section list');
    }

    const bnsSectionNos = resBnsList.data.data.map(s => s.sectionNo);
    console.log('Returned BNS sections (first 30):', bnsSectionNos);

    for (let i = 0; i < expectedPrefix.length; i++) {
      if (bnsSectionNos[i] !== expectedPrefix[i]) {
        throw new Error(`Test 2 Failed: BNS section at index ${i} is '${bnsSectionNos[i]}', expected '${expectedPrefix[i]}'`);
      }
    }
    console.log('✓ PASS: BNS sections 1 through 20 are in exact ascending legal order (no 1, 10, 11, 2)!');

    // -------------------------------------------------------------
    // Test 3: Pagination Continuity Test (Page 1 vs Page 2)
    // -------------------------------------------------------------
    console.log('\n[Test 3] Testing IPC pagination continuity (Page 1 & 2 with limit=10)...');
    const page1Res = await client.get('/api/ipc?page=1&limit=10');
    const page2Res = await client.get('/api/ipc?page=2&limit=10');

    const page1Nos = page1Res.data.data.map(s => s.sectionNo);
    const page2Nos = page2Res.data.data.map(s => s.sectionNo);

    console.log('IPC Page 1:', page1Nos);
    console.log('IPC Page 2:', page2Nos);

    if (page1Nos.length !== 10 || page2Nos.length !== 10) {
      throw new Error('Test 3 Failed: Page limit was not respected');
    }

    // Check no duplicates between Page 1 and Page 2
    const overlap = page1Nos.filter(n => page2Nos.includes(n));
    if (overlap.length > 0) {
      throw new Error(`Test 3 Failed: Overlapping sections found across pages: ${overlap.join(', ')}`);
    }

    // Check continuity: page1 ends with 10, page2 starts with 11
    if (page1Nos[9] !== '10' || page2Nos[0] !== '11') {
      throw new Error(`Test 3 Failed: Page 1 ended at ${page1Nos[9]} and Page 2 started at ${page2Nos[0]}`);
    }
    console.log('✓ PASS: IPC pagination is continuous with no overlaps or skips across pages!');

    // -------------------------------------------------------------
    // Test 4: Regression Test with Custom Sections (1, 2, 9, 10, 11, 20, 100)
    // -------------------------------------------------------------
    console.log('\n[Test 4] Regression test: Create test sections in BNS (990, 990A, 991, 999, 1000) and verify order...');
    const testSectionsToCreate = [
      { sectionNo: '990A', heading: 'Test Section 990A' },
      { sectionNo: '990', heading: 'Test Section 990' },
      { sectionNo: '991', heading: 'Test Section 991' },
      { sectionNo: '1000', heading: 'Test Section 1000' },
      { sectionNo: '999', heading: 'Test Section 999' }
    ];

    for (const sec of testSectionsToCreate) {
      const res = await clientCreator.post('/api/content-creator/bns', {
        sectionNo: sec.sectionNo,
        heading: sec.heading,
        paragraph: 'Test paragraph for ordering validation.'
      });
      customBnsIds.push(res.data.data.id);
    }

    // Search for these test sections
    const resSearchCustom = await client.get('/api/bns/search?q=Test+Section');
    const returnedCustomNos = resSearchCustom.data.data
      .map(s => s.sectionNo)
      .filter(no => ['990', '990A', '991', '999', '1000'].includes(no));

    console.log('Returned custom BNS sections in order:', returnedCustomNos);
    const expectedCustomOrder = ['990', '990A', '991', '999', '1000'];
    if (JSON.stringify(returnedCustomNos) !== JSON.stringify(expectedCustomOrder)) {
      throw new Error(`Test 4 Failed: Expected ${expectedCustomOrder.join(', ')}, got ${returnedCustomNos.join(', ')}`);
    }
    console.log('✓ PASS: Legal numeric & alphanumeric suffixes (990, 990A, 991, 999, 1000) order correctly!');

    // -------------------------------------------------------------
    // Test 5: Section Edit Maintains Order
    // -------------------------------------------------------------
    console.log('\n[Test 5] Update test section number and verify sectionOrder updates...');
    const targetId = customBnsIds[0]; // Currently 990A
    await clientCreator.patch(`/api/content-creator/bns/${targetId}`, {
      sectionNo: '990B',
      heading: 'Updated Test Section 990B'
    });

    const updatedSecDb = await prisma.bNSSection.findUnique({
      where: { id: targetId }
    });
    if (updatedSecDb.sectionNo !== '990B' || updatedSecDb.sectionOrder !== 990.02) {
      throw new Error(`Test 5 Failed: Expected sectionOrder to be 990.02, got ${updatedSecDb.sectionOrder}`);
    }
    console.log('✓ PASS: Editing sectionNo automatically updates sectionOrder field correctly in DB!');

    // -------------------------------------------------------------
    // Test 6: Verify IPC Suffix Sequences in Database (e.g. 29, 29A, 30 and 153, 153A, 153AA, 153B)
    // -------------------------------------------------------------
    console.log('\n[Test 6] Fetch IPC sections around 153 via search and verify legal sub-sequence...');
    const resIpc153 = await client.get('/api/ipc/search?q=153');
    const nos153 = resIpc153.data.data.map(s => s.sectionNo);
    console.log('Sections matching 153 in order:', nos153);
    // Should be ordered: 153, 153A, 153AA, 153B
    const index153 = nos153.indexOf('153');
    const index153A = nos153.indexOf('153A');
    const index153AA = nos153.indexOf('153AA');
    const index153B = nos153.indexOf('153B');

    if (index153 !== -1 && index153A !== -1 && index153AA !== -1 && index153B !== -1) {
      if (!(index153 < index153A && index153A < index153AA && index153AA < index153B)) {
        throw new Error(`Test 6 Failed: Order of 153 sequence was violated: ${nos153}`);
      }
      console.log('✓ PASS: Sequence 153 -> 153A -> 153AA -> 153B verified perfectly!');
    }

    // Clean up created test data
    console.log('\nCleaning up test records from DB...');
    await prisma.bNSSection.deleteMany({ where: { id: { in: customBnsIds } } });
    await prisma.iPCSection.deleteMany({ where: { id: { in: customIpcIds } } });
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } });

    console.log('\n================================================================');
    console.log('ALL IPC & BNS SECTION ORDERING & PAGINATION TESTS PASSED 🚀');
    console.log('================================================================');

  } catch (error) {
    console.error('\nE2E Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Cleanup on failure
    await prisma.bNSSection.deleteMany({ where: { id: { in: customBnsIds } } }).catch(() => {});
    await prisma.iPCSection.deleteMany({ where: { id: { in: customIpcIds } } }).catch(() => {});
    await prisma.contentCreator.delete({ where: { id: contentCreator.id } }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runOrderingTests();
