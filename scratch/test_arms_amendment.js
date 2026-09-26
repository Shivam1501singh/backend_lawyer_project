import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5999;
const baseUrl = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('=== Starting Verification Tests for THE ARMS (AMENDMENT) ACT, 2019 ===\n');

  // 1. Verify BearerAct Criminal
  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });

  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found!');
  }
  console.log(`[PASS] Criminal BearerAct found. ID: ${criminalBearerAct.id}`);

  // 2. Verify THE ARMS (AMENDMENT) ACT, 2019 under Criminal
  const armsAmendmentAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE ARMS (AMENDMENT) ACT, 2019'
    },
    include: {
      sections: {
        orderBy: [
          { chapterNo: 'asc' },
          { sectionOrder: 'asc' }
        ]
      }
    }
  });

  if (!armsAmendmentAct) {
    throw new Error('THE ARMS (AMENDMENT) ACT, 2019 Act not found under Criminal!');
  }
  console.log(`[PASS] THE ARMS (AMENDMENT) ACT, 2019 Act found. ID: ${armsAmendmentAct.id}, Year: ${armsAmendmentAct.year}`);

  // 3. Verify sections count and ordering
  console.log(`[CHECK] Sections count: ${armsAmendmentAct.sections.length} (Expected: 11)`);
  if (armsAmendmentAct.sections.length !== 11) {
    throw new Error(`Expected 11 sections, found ${armsAmendmentAct.sections.length}`);
  }

  const expectedSections = [
    { sec: 'Section 1', order: 1, title: 'Short title and commencement' },
    { sec: 'Section 2', order: 2, title: 'Amendment of section 2' },
    { sec: 'Section 3', order: 3, title: 'Amendment of section 3' },
    { sec: 'Section 4', order: 4, title: 'Amendment of section 5' },
    { sec: 'Section 5', order: 5, title: 'Amendment of section 6' },
    { sec: 'Section 6', order: 6, title: 'Amendment of section 8' },
    { sec: 'Section 7', order: 7, title: 'Amendment of section 13' },
    { sec: 'Section 8', order: 8, title: 'Amendment of section 15' },
    { sec: 'Section 9', order: 9, title: 'Amendment of section 25' },
    { sec: 'Section 10', order: 10, title: 'Amendment of section 27' },
    { sec: 'Section 11', order: 11, title: 'Amendment of section 44' }
  ];

  armsAmendmentAct.sections.forEach((s, idx) => {
    const exp = expectedSections[idx];
    if (s.section !== exp.sec || s.sectionOrder !== exp.order || s.title !== exp.title) {
      throw new Error(`Mismatch at index ${idx}: expected ${JSON.stringify(exp)}, got ${s.section}, ${s.sectionOrder}, ${s.title}`);
    }
    console.log(`  Section ${s.sectionOrder}: ${s.section} - ${s.title} (Order: ${s.sectionOrder}, Chapter: ${s.chapterNo})`);
  });
  console.log('[PASS] All 11 sections verified and numerically ordered.');

  // 4. Verify IPC and BNS independent tables
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  console.log(`[PASS] Independent IPCSection count: ${ipcCount}, BNSSection count: ${bnsCount}`);

  // 5. Test APIs via HTTP
  await import('../src/server.js');
  await new Promise(r => setTimeout(r, 1000));

  console.log(`\nTesting API endpoints on ${baseUrl}...`);

  async function fetchJson(url) {
    const res = await fetch(url);
    const data = await res.json();
    return { status: res.status, data };
  }

  // API Test 1: GET /api/bearer-acts
  const r1 = await fetchJson(`${baseUrl}/api/bearer-acts`);
  if (r1.status !== 200 || !r1.data.success) throw new Error('GET /api/bearer-acts failed');
  console.log(`[PASS] GET /api/bearer-acts (Status: ${r1.status})`);

  // API Test 2: GET /api/bearer-acts/:criminalId/acts
  const r2 = await fetchJson(`${baseUrl}/api/bearer-acts/${criminalBearerAct.id}/acts`);
  if (r2.status !== 200 || !r2.data.success) throw new Error('GET /api/bearer-acts/:id/acts failed');
  const foundAct = r2.data.data.find(a => a.id === armsAmendmentAct.id);
  if (!foundAct) throw new Error('THE ARMS (AMENDMENT) ACT, 2019 not returned in acts list');
  console.log(`[PASS] GET /api/bearer-acts/:id/acts returned ${r2.data.data.length} acts including THE ARMS (AMENDMENT) ACT, 2019`);

  // API Test 3: GET /api/acts/:id
  const r3 = await fetchJson(`${baseUrl}/api/acts/${armsAmendmentAct.id}`);
  if (r3.status !== 200 || !r3.data.success || r3.data.data.heading !== 'THE ARMS (AMENDMENT) ACT, 2019') {
    throw new Error('GET /api/acts/:id failed');
  }
  console.log(`[PASS] GET /api/acts/:id returned act: ${r3.data.data.heading}`);

  // API Test 4: GET /api/acts/:id/sections
  const r4 = await fetchJson(`${baseUrl}/api/acts/${armsAmendmentAct.id}/sections?limit=50`);
  if (r4.status !== 200 || !r4.data.success || r4.data.data.length !== 11) {
    throw new Error(`GET /api/acts/:id/sections failed (returned ${r4.data.data?.length})`);
  }
  // Verify ordering in API response
  for (let i = 0; i < 11; i++) {
    if (r4.data.data[i].sectionOrder !== i + 1) {
      throw new Error(`API returned incorrect order at index ${i}: ${r4.data.data[i].sectionOrder}`);
    }
  }
  console.log(`[PASS] GET /api/acts/:id/sections returned 11 sections in strict numeric order (1..11)`);

  // API Test 5: GET /api/sections/:id
  const firstSectionId = armsAmendmentAct.sections[0].id;
  const r5 = await fetchJson(`${baseUrl}/api/sections/${firstSectionId}`);
  if (r5.status !== 200 || !r5.data.success || r5.data.data.section !== 'Section 1') {
    throw new Error('GET /api/sections/:id failed');
  }
  console.log(`[PASS] GET /api/sections/:id returned section: ${r5.data.data.section} - ${r5.data.data.title}`);

  // Search Test 1: GET /api/bearer-acts/search?q=arms
  const s1 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=arms`);
  if (s1.status !== 200 || !s1.data.success) throw new Error('Search query "arms" failed');
  console.log(`[PASS] Search "arms" returned ${s1.data.data.length} results.`);

  // Search Test 2: GET /api/bearer-acts/search?q=celebratory+gunfire
  const s2 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=celebratory+gunfire`);
  if (s2.status !== 200 || !s2.data.success) throw new Error('Search query "celebratory gunfire" failed');
  const celebratoryMatch = s2.data.data.find(r => r.type === 'SECTION' && r.section.actId === armsAmendmentAct.id);
  if (!celebratoryMatch) throw new Error('Search "celebratory gunfire" did not match Section 9 of Arms Amendment Act');
  console.log(`[PASS] Search "celebratory gunfire" matched: ${celebratoryMatch.section.section} - ${celebratoryMatch.section.title}`);

  // Search Test 3: GET /api/bearer-acts/search?q=illicit+trafficking
  const s3 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=illicit+trafficking`);
  if (s3.status !== 200 || !s3.data.success) throw new Error('Search query "illicit trafficking" failed');
  const illicitMatch = s3.data.data.find(r => r.type === 'SECTION' && r.section.actId === armsAmendmentAct.id);
  if (!illicitMatch) throw new Error('Search "illicit trafficking" did not match Arms Amendment Act');
  console.log(`[PASS] Search "illicit trafficking" matched: ${illicitMatch.section.section} - ${illicitMatch.section.title}`);

  // Search Test 4: Act Sections search: GET /api/acts/:actId/search?q=licence
  const s4 = await fetchJson(`${baseUrl}/api/acts/${armsAmendmentAct.id}/search?q=licence`);
  if (s4.status !== 200 || !s4.data.success) throw new Error('Act sections search failed');
  if (!s4.data.data.results || s4.data.data.results.length === 0) throw new Error('Act search "licence" returned 0 results');
  console.log(`[PASS] Act sections search within Arms Amendment Act for "licence" returned ${s4.data.data.results.length} matching sections.`);

  await prisma.$disconnect();
  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
