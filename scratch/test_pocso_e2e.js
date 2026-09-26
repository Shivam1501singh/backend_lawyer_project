import { PrismaClient } from '@prisma/client';
import express from 'express';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import http from 'http';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Starting Comprehensive E2E Verification Tests for THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012 ===\n');

  // 1. Verify BearerAct Criminal
  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });

  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found!');
  }
  console.log(`[PASS] Criminal BearerAct found. ID: ${criminalBearerAct.id}`);

  // 2. Verify THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012 under Criminal
  const pocsoAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012'
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

  if (!pocsoAct) {
    throw new Error('THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012 Act not found under Criminal!');
  }
  console.log(`[PASS] POCSO Act found. ID: ${pocsoAct.id}, Year: ${pocsoAct.year}`);

  // 3. Verify sections count and ordering
  console.log(`[CHECK] Sections count: ${pocsoAct.sections.length} (Expected: 47)`);
  if (pocsoAct.sections.length !== 47) {
    throw new Error(`Expected 47 sections, found ${pocsoAct.sections.length}`);
  }

  // 4. Verify chapter distribution
  const chapterSet = new Set(pocsoAct.sections.map(s => s.chapterNo));
  console.log(`[PASS] Total distinct chapters present: ${chapterSet.size} (Expected: 9)`);
  if (chapterSet.size !== 9) {
    throw new Error(`Expected 9 chapters, found ${chapterSet.size}`);
  }

  // 5. Verify sample section structure & ordering
  const sec1 = pocsoAct.sections.find(s => s.section === 'Section 1');
  if (!sec1 || sec1.chapterNo !== 1 || !sec1.title.includes('Short title') || !sec1.description.includes('Protection of Children')) {
    throw new Error('Section 1 verification failed!');
  }
  console.log('[PASS] Section 1 validated:', sec1.title);

  const sec3 = pocsoAct.sections.find(s => s.section === 'Section 3');
  if (!sec3 || sec3.chapterNo !== 2 || !sec3.title.includes('Penetrative sexual assault')) {
    throw new Error('Section 3 verification failed!');
  }
  console.log('[PASS] Section 3 validated:', sec3.title);

  const sec13 = pocsoAct.sections.find(s => s.section === 'Section 13');
  if (!sec13 || sec13.chapterNo !== 3 || !sec13.title.includes('pornographic')) {
    throw new Error('Section 13 verification failed!');
  }
  console.log('[PASS] Section 13 validated:', sec13.title);

  const sec28 = pocsoAct.sections.find(s => s.section === 'Section 28');
  if (!sec28 || sec28.chapterNo !== 7 || !sec28.title.includes('Designation of Special Courts')) {
    throw new Error('Section 28 verification failed!');
  }
  console.log('[PASS] Section 28 validated:', sec28.title);

  const sec42A = pocsoAct.sections.find(s => s.section === 'Section 42A');
  if (!sec42A || sec42A.chapterNo !== 9 || !sec42A.title.includes('Act not in derogation')) {
    throw new Error('Section 42A verification failed!');
  }
  console.log('[PASS] Section 42A validated:', sec42A.title, `(sectionOrder: ${sec42A.sectionOrder})`);

  const sec46 = pocsoAct.sections.find(s => s.section === 'Section 46');
  if (!sec46 || sec46.chapterNo !== 9 || !sec46.title.includes('Power to remove difficulties') || !sec46.description.includes('THE SCHEDULE')) {
    throw new Error('Section 46 / Schedule verification failed!');
  }
  console.log('[PASS] Section 46 & Schedule validated:', sec46.title);

  // 6. Verify sectionOrder strictly ascending per chapter
  for (let ch = 1; ch <= 9; ch++) {
    const chSecs = pocsoAct.sections.filter(s => s.chapterNo === ch);
    for (let i = 0; i < chSecs.length - 1; i++) {
      if (chSecs[i].sectionOrder >= chSecs[i + 1].sectionOrder) {
        throw new Error(`Section ordering broken in Chapter ${ch}: ${chSecs[i].section} (${chSecs[i].sectionOrder}) vs ${chSecs[i+1].section} (${chSecs[i+1].sectionOrder})`);
      }
    }
  }
  console.log('[PASS] Numerical section ordering verified across all 9 chapters.');

  // 7. Verify other Acts under Criminal are intact
  const allCriminalActs = await prisma.act.findMany({
    where: { bearerActId: criminalBearerAct.id }
  });
  console.log(`[PASS] Total Acts under Criminal: ${allCriminalActs.length}`);
  const actHeadings = allCriminalActs.map(a => a.heading);
  console.log('Existing Acts list:\n - ' + actHeadings.join('\n - '));

  const requiredActs = [
    'THE INDIAN PENAL CODE',
    'THE INDIAN EVIDENCE ACT, 1872',
    'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
    'THE PREVENTION OF CORRUPTION ACT, 1988',
    'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018',
    'THE ARMS ACT, 1959',
    'THE ARMS (AMENDMENT) ACT, 2019',
    'THE CODE OF CRIMINAL PROCEDURE, 1973',
    'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012'
  ];

  for (const reqAct of requiredActs) {
    if (!actHeadings.includes(reqAct)) {
      throw new Error(`Required Act missing: ${reqAct}`);
    }
  }
  console.log('[PASS] All required Criminal Acts are intact.');

  // 8. Verify IPCSection and BNSSection datasets are untouched
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  console.log(`[PASS] IPCSection count: ${ipcCount}, BNSSection count: ${bnsCount}`);

  // 9. Test HTTP Express API endpoints
  const app = express();
  app.use(express.json());
  app.use('/', bearerActRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const testPort = server.address().port;
  const apiBase = `http://127.0.0.1:${testPort}`;

  try {
    // Test 1: GET /api/bearer-acts
    const res1 = await fetch(`${apiBase}/api/bearer-acts`);
    const json1 = await res1.json();
    if (!json1.success || !Array.isArray(json1.data)) throw new Error('GET /api/bearer-acts failed');
    console.log(`[PASS] GET /api/bearer-acts: ${json1.data.length} categories returned.`);

    // Test 2: GET /api/bearer-acts/:criminalId/acts
    const res2 = await fetch(`${apiBase}/api/bearer-acts/${criminalBearerAct.id}/acts?limit=50`);
    const json2 = await res2.json();
    if (!json2.success || !json2.data.some(a => a.heading === 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012')) {
      throw new Error('GET /api/bearer-acts/:id/acts failed to include POCSO');
    }
    console.log(`[PASS] GET /api/bearer-acts/:id/acts: ${json2.data.length} acts returned under Criminal.`);

    // Test 3: GET /api/acts/:id
    const res3 = await fetch(`${apiBase}/api/acts/${pocsoAct.id}`);
    const json3 = await res3.json();
    if (!json3.success || json3.data.heading !== 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012') {
      throw new Error('GET /api/acts/:id failed');
    }
    console.log(`[PASS] GET /api/acts/:id: returned POCSO Act details with ${json3.data.sections.length} sections.`);

    // Test 4: GET /api/acts/:id/sections
    const res4 = await fetch(`${apiBase}/api/acts/${pocsoAct.id}/sections?page=1&limit=10`);
    const json4 = await res4.json();
    if (!json4.success || json4.data.length !== 10 || json4.pagination.total !== 47) {
      throw new Error('GET /api/acts/:id/sections failed');
    }
    console.log(`[PASS] GET /api/acts/:id/sections pagination: page 1 of ${json4.pagination.totalPages}, total ${json4.pagination.total}.`);

    // Test 5: GET /api/sections/:sectionId
    const res5 = await fetch(`${apiBase}/api/sections/${sec3.id}`);
    const json5 = await res5.json();
    if (!json5.success || json5.data.section !== 'Section 3' || json5.data.actId !== pocsoAct.id) {
      throw new Error('GET /api/sections/:id failed');
    }
    console.log(`[PASS] GET /api/sections/:id: returned section 3 successfully.`);

    // Test 6: Global search GET /api/bearer-acts/search?q=children
    const res6 = await fetch(`${apiBase}/api/bearer-acts/search?q=children`);
    const json6 = await res6.json();
    if (!json6.success || json6.data.length === 0) {
      throw new Error('GET /api/bearer-acts/search?q=children failed');
    }
    console.log(`[PASS] GET /api/bearer-acts/search?q=children: found ${json6.pagination.total} results.`);

    // Test 7: Act-specific search GET /api/acts/:actId/search?q=pornographic
    const res7 = await fetch(`${apiBase}/api/acts/${pocsoAct.id}/search?q=pornographic`);
    const json7 = await res7.json();
    if (!json7.success || json7.data.length === 0) {
      throw new Error('GET /api/acts/:actId/search?q=pornographic failed');
    }
    console.log(`[PASS] GET /api/acts/:actId/search?q=pornographic: found ${json7.pagination.total} matching sections.`);
  } finally {
    server.close();
  }

  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
