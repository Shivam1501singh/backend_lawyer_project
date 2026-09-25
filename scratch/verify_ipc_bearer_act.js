import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BASE_URL = `http://localhost:5000`;

async function main() {
  console.log('===============================================================');
  console.log('=== STARTING COMPREHENSIVE IPC BEARER ACT VERIFICATION SUITE ===');
  console.log('===============================================================\n');

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
    // ----------------------------------------------------------------
    // 1. BearerAct "Criminal"
    // ----------------------------------------------------------------
    console.log('--- 1. BearerAct "Criminal" Checks ---');
    const criminalBearerAct = await prisma.bearerAct.findUnique({
      where: { name: 'Criminal' }
    });
    assert(criminalBearerAct !== null, 'BearerAct "Criminal" exists');

    // ----------------------------------------------------------------
    // 2. Acts under "Criminal" BearerAct
    // ----------------------------------------------------------------
    console.log('\n--- 2. Acts under Criminal BearerAct ---');
    const acts = await prisma.act.findMany({
      where: { bearerActId: criminalBearerAct.id }
    });
    console.log(`Found ${acts.length} Acts under Criminal:`);
    acts.forEach(a => console.log(`  - "${a.heading}" (Year: ${a.year})`));

    const ipcAct = acts.find(a => a.heading === 'THE INDIAN PENAL CODE');
    assert(ipcAct !== undefined, 'THE INDIAN PENAL CODE Act exists under Criminal BearerAct');
    assert(ipcAct.year === 1860, `IPC Act year is 1860 (found: ${ipcAct.year})`);
    assert(ipcAct.heading === 'THE INDIAN PENAL CODE', `IPC Act heading is 'THE INDIAN PENAL CODE' (found: ${ipcAct.heading})`);

    const bnsAct = acts.find(a => a.heading === 'The Bharatiya Nyaya Sanhita, 2023');
    const bnssAct = acts.find(a => a.heading === 'The Bharatiya Nagarik Suraksha Sanhita, 2023');
    const bsaAct = acts.find(a => a.heading === 'The Bharatiya Sakshya Adhiniyam, 2023');

    assert(bnsAct !== undefined, 'BNS Act exists and is preserved under Criminal');
    assert(bnssAct !== undefined, 'BNSS Act exists and is preserved under Criminal');
    assert(bsaAct !== undefined, 'BSA Act exists and is preserved under Criminal');

    // ----------------------------------------------------------------
    // 3. ActSection IPC Records
    // ----------------------------------------------------------------
    console.log('\n--- 3. IPC ActSection Records ---');
    const ipcSections = await prisma.actSection.findMany({
      where: { actId: ipcAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });

    assert(ipcSections.length === 576, `Exact 576 sections seeded for IPC Act (found: ${ipcSections.length})`);

    // Verify 26 Chapters
    const uniqueChapters = [...new Set(ipcSections.map(s => s.chapterNo))].sort((a, b) => a - b);
    assert(uniqueChapters.length === 26, `Exact 26 chapters represented (found: ${uniqueChapters.length})`);
    assert(uniqueChapters[0] === 1 && uniqueChapters[25] === 26, 'Chapters span from 1 to 26');

    // Verify key sections
    const sec1 = ipcSections.find(s => s.section === 'Section 1');
    assert(sec1 && sec1.chapterNo === 1 && sec1.chapterName === 'INTRODUCTION' && sec1.title === 'Title and extent of operation of the Code', 'Section 1 details match PDF exactly');

    const sec120A = ipcSections.find(s => s.section === 'Section 120A');
    assert(sec120A && sec120A.chapterNo === 6 && sec120A.chapterName === 'CRIMINAL CONSPIRACY' && sec120A.title === 'Definition of criminal conspiracy', 'Section 120A (Chapter VA) matches PDF');

    const sec300 = ipcSections.find(s => s.section === 'Section 300');
    assert(sec300 && sec300.chapterNo === 18 && sec300.chapterName === 'OF OFFENCES AFFECTING THE HUMAN BODY' && sec300.title === 'Murder' && sec300.description.includes('Exception 1'), 'Section 300 Murder matches PDF');

    const sec498A = ipcSections.find(s => s.section === 'Section 498A');
    assert(sec498A && sec498A.chapterNo === 23 && sec498A.chapterName === 'OF CRUELTY BY HUSBAND OR RELATIVES OF HUSBAND', 'Section 498A (Chapter XXA) matches PDF');

    const sec511 = ipcSections.find(s => s.section === 'Section 511');
    assert(sec511 && sec511.chapterNo === 26 && sec511.chapterName === 'OF ATTEMPTS TO COMMIT OFFENCES', 'Section 511 (Chapter XXIII) matches PDF');

    // ----------------------------------------------------------------
    // 4. Section Ordering Validation (Ascending Legal Order)
    // ----------------------------------------------------------------
    console.log('\n--- 4. Section Ordering Validation ---');
    const first20Sections = ipcSections.slice(0, 20).map(s => s.section);
    console.log('First 20 sections in order:', first20Sections);

    const expectedFirst20 = [
      'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5',
      'Section 6', 'Section 7', 'Section 8', 'Section 9', 'Section 10',
      'Section 11', 'Section 12', 'Section 13', 'Section 14', 'Section 15',
      'Section 16', 'Section 17', 'Section 18', 'Section 19', 'Section 20'
    ];

    let orderOk = true;
    for (let i = 0; i < expectedFirst20.length; i++) {
      if (first20Sections[i] !== expectedFirst20[i]) {
        orderOk = false;
        break;
      }
    }
    assert(orderOk, 'IPC Sections 1..20 are strictly in natural ascending order (Section 10 comes AFTER Section 9, not before Section 2)');

    // ----------------------------------------------------------------
    // 5. Separation from standalone IPCSection table
    // ----------------------------------------------------------------
    console.log('\n--- 5. Dataset Separation Checks ---');
    const standaloneIpcCount = await prisma.iPCSection.count();
    assert(standaloneIpcCount === 576, `Standalone IPCSection table remains intact with ${standaloneIpcCount} records`);

    // Verify foreign key integrity
    const allActIds = (await prisma.act.findMany({ select: { id: true } })).map(a => a.id);
    const orphanCount = await prisma.actSection.count({
      where: { actId: { notIn: allActIds } }
    });
    assert(orphanCount === 0, 'No orphan ActSection records exist');

    // ----------------------------------------------------------------
    // 6. Generic Bearer Act APIs
    // ----------------------------------------------------------------
    console.log('\n--- 6. Generic Bearer Act HTTP Endpoints ---');

    // GET /api/bearer-acts
    const resBearerActs = await axios.get(`${BASE_URL}/api/bearer-acts`);
    assert(resBearerActs.status === 200 && resBearerActs.data.success, 'GET /api/bearer-acts returned 200');

    // GET /api/bearer-acts/:id
    const resSingleBearer = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalBearerAct.id}`);
    assert(resSingleBearer.status === 200 && resSingleBearer.data.data.acts.some(a => a.id === ipcAct.id), 'GET /api/bearer-acts/:id includes IPC Act');

    // GET /api/bearer-acts/:id/acts
    const resActs = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalBearerAct.id}/acts`);
    assert(resActs.status === 200 && resActs.data.data.some(a => a.id === ipcAct.id), 'GET /api/bearer-acts/:id/acts includes IPC Act');

    // GET /api/acts/:id
    const resSingleAct = await axios.get(`${BASE_URL}/api/acts/${ipcAct.id}`);
    assert(resSingleAct.status === 200 && resSingleAct.data.data.sections.length === 576, 'GET /api/acts/:id returns IPC Act with all 576 sections');

    // GET /api/acts/:id/sections (Pagination check)
    const resPage1 = await axios.get(`${BASE_URL}/api/acts/${ipcAct.id}/sections?page=1&limit=10`);
    const resPage2 = await axios.get(`${BASE_URL}/api/acts/${ipcAct.id}/sections?page=2&limit=10`);

    const p1Sections = resPage1.data.data.map(s => s.section);
    const p2Sections = resPage2.data.data.map(s => s.section);

    assert(p1Sections.length === 10 && p1Sections[0] === 'Section 1' && p1Sections[9] === 'Section 10', 'Page 1 has Section 1 through Section 10');
    assert(p2Sections.length === 10 && p2Sections[0] === 'Section 11' && p2Sections[9] === 'Section 20', 'Page 2 has Section 11 through Section 20');

    // GET /api/sections/:id
    const resSingleSec = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(resSingleSec.status === 200 && resSingleSec.data.data.title === sec1.title, 'GET /api/sections/:id returns Section 1 details');

    // ----------------------------------------------------------------
    // 7. Search APIs
    // ----------------------------------------------------------------
    console.log('\n--- 7. Search APIs ---');

    // Global Bearer Act search
    const resGlobalSearch = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=INDIAN PENAL CODE`);
    assert(resGlobalSearch.status === 200 && resGlobalSearch.data.data.some(r => r.type === 'ACT' && r.act.id === ipcAct.id), 'Global search finds THE INDIAN PENAL CODE Act');

    // Act-specific search for IPC
    const resActSearch = await axios.get(`${BASE_URL}/api/acts/${ipcAct.id}/search?q=Murder`);
    assert(resActSearch.status === 200 && resActSearch.data.data.results.length > 0, 'Act-specific search finds Murder in IPC');
    const allResultsAreIpc = resActSearch.data.data.results.every(r => r.actId === ipcAct.id);
    assert(allResultsAreIpc, 'All act-specific search results belong strictly to IPC Act and not BNS/BNSS/BSA');

    // ----------------------------------------------------------------
    // 8. Legacy Standalone IPC Endpoints Regression Check
    // ----------------------------------------------------------------
    console.log('\n--- 8. Legacy Standalone IPC Endpoints Regression Check ---');
    const resLegacyIpc = await axios.get(`${BASE_URL}/api/ipc?page=1&limit=10`);
    assert(resLegacyIpc.status === 200 && resLegacyIpc.data.success && resLegacyIpc.data.data.length === 10, 'GET /api/ipc returns 200 with 10 sections');
    assert(resLegacyIpc.data.data[0].sectionNo === '1' && resLegacyIpc.data.data[9].sectionNo === '10', 'Legacy IPC section order is 1..10');

    const resLegacySearch = await axios.get(`${BASE_URL}/api/ipc/search?q=theft`);
    assert(resLegacySearch.status === 200 && resLegacySearch.data.success && resLegacySearch.data.data.length > 0, 'GET /api/ipc/search returns search results');

    console.log('\n===============================================================');
    console.log(`=== VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    console.log('===============================================================');

  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message || err);
    failed++;
  } finally {
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

main();
