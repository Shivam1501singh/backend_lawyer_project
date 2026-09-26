import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5999;
const baseUrl = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('=== Starting Verification Tests for THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 ===\n');

  // 1. Verify BearerAct Criminal
  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });

  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found!');
  }
  console.log(`[PASS] Criminal BearerAct found. ID: ${criminalBearerAct.id}`);

  // 2. Verify THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 under Criminal
  const corruptionAmendmentAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018'
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

  if (!corruptionAmendmentAct) {
    throw new Error('THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 Act not found under Criminal!');
  }
  console.log(`[PASS] THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 Act found. ID: ${corruptionAmendmentAct.id}, Year: ${corruptionAmendmentAct.year}`);

  // 3. Verify sections count and ordering
  console.log(`[CHECK] Sections count: ${corruptionAmendmentAct.sections.length} (Expected: 19)`);
  if (corruptionAmendmentAct.sections.length !== 19) {
    throw new Error(`Expected 19 sections, found ${corruptionAmendmentAct.sections.length}`);
  }

  const expectedSections = [
    { sec: 'Section 1', order: 1, title: 'Short title and commencement' },
    { sec: 'Section 2', order: 2, title: 'Amendment of section 2' },
    { sec: 'Section 3', order: 3, title: 'Amendment of section 4' },
    { sec: 'Section 4', order: 4, title: 'Substitution of new sections for sections 7, 8, 9 and 10' },
    { sec: 'Section 5', order: 5, title: 'Amendment of section 11' },
    { sec: 'Section 6', order: 6, title: 'Substitution of new section for section 12' },
    { sec: 'Section 7', order: 7, title: 'Amendment of section 13' },
    { sec: 'Section 8', order: 8, title: 'Substitution of new section for section 14' },
    { sec: 'Section 9', order: 9, title: 'Amendment of section 15' },
    { sec: 'Section 10', order: 10, title: 'Amendment of section 16' },
    { sec: 'Section 11', order: 11, title: 'Amendment of section 17' },
    { sec: 'Section 12', order: 12, title: 'Insertion of new section 17A' },
    { sec: 'Section 13', order: 13, title: 'Insertion of new Chapter IVA' },
    { sec: 'Section 14', order: 14, title: 'Amendment of section 19' },
    { sec: 'Section 15', order: 15, title: 'Substitution of new section for section 20' },
    { sec: 'Section 16', order: 16, title: 'Amendment of section 23' },
    { sec: 'Section 17', order: 17, title: 'Omission of section 24' },
    { sec: 'Section 18', order: 18, title: 'Insertion of new section 29A' },
    { sec: 'Section 19', order: 19, title: 'Amendment of Act 15 of 2003' }
  ];

  corruptionAmendmentAct.sections.forEach((s, idx) => {
    const exp = expectedSections[idx];
    if (s.section !== exp.sec || s.sectionOrder !== exp.order || s.title !== exp.title) {
      throw new Error(`Mismatch at index ${idx}: expected ${JSON.stringify(exp)}, got ${s.section}, ${s.sectionOrder}, ${s.title}`);
    }
    console.log(`  Section ${s.sectionOrder}: ${s.section} - ${s.title} (Order: ${s.sectionOrder}, Chapter: ${s.chapterNo})`);
  });
  console.log('[PASS] All 19 sections verified and numerically ordered.');

  // 4. Verify 1988 Corruption Act is preserved and separate
  const corruption1988Act = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PREVENTION OF CORRUPTION ACT, 1988'
    },
    include: {
      sections: true
    }
  });
  if (!corruption1988Act) {
    throw new Error('THE PREVENTION OF CORRUPTION ACT, 1988 not found!');
  }
  console.log(`[PASS] THE PREVENTION OF CORRUPTION ACT, 1988 preserved as separate Act. ID: ${corruption1988Act.id}, Sections: ${corruption1988Act.sections.length}`);
  if (corruption1988Act.id === corruptionAmendmentAct.id) {
    throw new Error('1988 Act and 2018 Amendment Act have the same ID!');
  }

  // 5. Verify IPC and BNS independent tables
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  console.log(`[PASS] Independent IPCSection count: ${ipcCount}, BNSSection count: ${bnsCount}`);

  // 6. Test APIs via HTTP
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
  const foundAmendmentAct = r2.data.data.find(a => a.id === corruptionAmendmentAct.id);
  const found1988Act = r2.data.data.find(a => a.id === corruption1988Act.id);
  if (!foundAmendmentAct) throw new Error('THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 not returned in acts list');
  if (!found1988Act) throw new Error('THE PREVENTION OF CORRUPTION ACT, 1988 not returned in acts list');
  console.log(`[PASS] GET /api/bearer-acts/:id/acts returned ${r2.data.data.length} acts including both 1988 and 2018 Corruption Acts`);

  // API Test 3: GET /api/acts/:id
  const r3 = await fetchJson(`${baseUrl}/api/acts/${corruptionAmendmentAct.id}`);
  if (r3.status !== 200 || !r3.data.success || r3.data.data.heading !== 'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018') {
    throw new Error('GET /api/acts/:id failed');
  }
  console.log(`[PASS] GET /api/acts/:id returned act: ${r3.data.data.heading}`);

  // API Test 4: GET /api/acts/:id/sections
  const r4 = await fetchJson(`${baseUrl}/api/acts/${corruptionAmendmentAct.id}/sections?limit=50`);
  if (r4.status !== 200 || !r4.data.success || r4.data.data.length !== 19) {
    throw new Error(`GET /api/acts/:id/sections failed (returned ${r4.data.data?.length})`);
  }
  // Verify ordering in API response
  for (let i = 0; i < 19; i++) {
    if (r4.data.data[i].sectionOrder !== i + 1) {
      throw new Error(`API returned incorrect order at index ${i}: ${r4.data.data[i].sectionOrder}`);
    }
  }
  console.log(`[PASS] GET /api/acts/:id/sections returned 19 sections in strict numeric order (1..19)`);

  // API Test 5: GET /api/sections/:id
  const firstSectionId = corruptionAmendmentAct.sections[0].id;
  const r5 = await fetchJson(`${baseUrl}/api/sections/${firstSectionId}`);
  if (r5.status !== 200 || !r5.data.success || r5.data.data.section !== 'Section 1') {
    throw new Error('GET /api/sections/:id failed');
  }
  console.log(`[PASS] GET /api/sections/:id returned section: ${r5.data.data.section} - ${r5.data.data.title}`);

  // Search Test 1: GET /api/bearer-acts/search?q=corruption
  const s1 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=corruption`);
  if (s1.status !== 200 || !s1.data.success) throw new Error('Search query "corruption" failed');
  console.log(`[PASS] Search "corruption" returned ${s1.data.data.length} results.`);

  // Search Test 2: GET /api/bearer-acts/search?q=undue+advantage
  const s2 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=undue+advantage`);
  if (s2.status !== 200 || !s2.data.success) throw new Error('Search query "undue advantage" failed');
  const undueMatch = s2.data.data.find(r => r.type === 'SECTION' && r.section.actId === corruptionAmendmentAct.id);
  if (!undueMatch) throw new Error('Search "undue advantage" did not match Corruption Amendment Act');
  console.log(`[PASS] Search "undue advantage" matched: ${undueMatch.section.section} - ${undueMatch.section.title}`);

  // Search Test 3: GET /api/bearer-acts/search?q=commercial+organisation
  const s3 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=commercial+organisation`);
  if (s3.status !== 200 || !s3.data.success) throw new Error('Search query "commercial organisation" failed');
  const commMatch = s3.data.data.find(r => r.type === 'SECTION' && r.section.actId === corruptionAmendmentAct.id);
  if (!commMatch) throw new Error('Search "commercial organisation" did not match Corruption Amendment Act');
  console.log(`[PASS] Search "commercial organisation" matched: ${commMatch.section.section} - ${commMatch.section.title}`);

  // Search Test 4: Act Sections search: GET /api/acts/:actId/search?q=prescribed
  const s4 = await fetchJson(`${baseUrl}/api/acts/${corruptionAmendmentAct.id}/search?q=prescribed`);
  if (s4.status !== 200 || !s4.data.success) throw new Error('Act sections search failed');
  if (!s4.data.data.results || s4.data.data.results.length === 0) throw new Error('Act search "prescribed" returned 0 results');
  console.log(`[PASS] Act sections search within Corruption Amendment Act for "prescribed" returned ${s4.data.data.results.length} matching sections.`);

  await prisma.$disconnect();
  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
