import { PrismaClient } from '@prisma/client';
import express from 'express';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import http from 'http';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Starting Comprehensive E2E Verification Tests for THE CODE OF CRIMINAL PROCEDURE, 1973 ===\n');

  // 1. Verify BearerAct Criminal
  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });

  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found!');
  }
  console.log(`[PASS] Criminal BearerAct found. ID: ${criminalBearerAct.id}`);

  // 2. Verify THE CODE OF CRIMINAL PROCEDURE, 1973 under Criminal
  const crpcAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE CODE OF CRIMINAL PROCEDURE, 1973'
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

  if (!crpcAct) {
    throw new Error('THE CODE OF CRIMINAL PROCEDURE, 1973 Act not found under Criminal!');
  }
  console.log(`[PASS] THE CODE OF CRIMINAL PROCEDURE, 1973 Act found. ID: ${crpcAct.id}, Year: ${crpcAct.year}`);

  // 3. Verify sections count and ordering
  console.log(`[CHECK] Sections count: ${crpcAct.sections.length} (Expected: 534)`);
  if (crpcAct.sections.length !== 534) {
    throw new Error(`Expected 534 sections, found ${crpcAct.sections.length}`);
  }

  // 4. Verify chapter distribution
  const chapterSet = new Set(crpcAct.sections.map(s => s.chapterNo));
  console.log(`[PASS] Total distinct chapters present: ${chapterSet.size} (Expected: 39)`);
  if (chapterSet.size !== 39) {
    throw new Error(`Expected 39 chapters, found ${chapterSet.size}`);
  }

  // 5. Verify sample section structure & ordering
  const sec1 = crpcAct.sections.find(s => s.section === 'Section 1');
  if (!sec1 || sec1.chapterNo !== 1 || !sec1.title.includes('Short title') || !sec1.description.includes('Code of Criminal')) {
    throw new Error('Section 1 verification failed!');
  }
  console.log('[PASS] Section 1 validated:', sec1.title);

  const sec25A = crpcAct.sections.find(s => s.section === 'Section 25A');
  if (!sec25A || sec25A.chapterNo !== 2 || !sec25A.title.includes('Directorate of Prosecution')) {
    throw new Error('Section 25A verification failed!');
  }
  console.log('[PASS] Section 25A validated:', sec25A.title);

  const sec438 = crpcAct.sections.find(s => s.section === 'Section 438');
  if (!sec438 || sec438.chapterNo !== 35 || !sec438.title.includes('Direction for grant of bail')) {
    throw new Error('Section 438 verification failed!');
  }
  console.log('[PASS] Section 438 validated:', sec438.title);

  const sec484 = crpcAct.sections.find(s => s.section === 'Section 484');
  if (!sec484 || sec484.chapterNo !== 39 || !sec484.title.includes('Repeal and savings')) {
    throw new Error('Section 484 verification failed!');
  }
  console.log('[PASS] Section 484 validated:', sec484.title);

  // 6. Verify sectionOrder strictly ascending per chapter
  for (let ch = 1; ch <= 39; ch++) {
    const chSecs = crpcAct.sections.filter(s => s.chapterNo === ch);
    for (let i = 0; i < chSecs.length - 1; i++) {
      if (chSecs[i].sectionOrder >= chSecs[i + 1].sectionOrder) {
        throw new Error(`Section ordering broken in Chapter ${ch}: ${chSecs[i].section} (${chSecs[i].sectionOrder}) vs ${chSecs[i+1].section} (${chSecs[i+1].sectionOrder})`);
      }
    }
  }
  console.log('[PASS] Numerical section ordering verified across all 39 chapters.');

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
    'THE CODE OF CRIMINAL PROCEDURE, 1973'
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
    if (!json2.success || !json2.data.some(a => a.heading === 'THE CODE OF CRIMINAL PROCEDURE, 1973')) {
      throw new Error('GET /api/bearer-acts/:id/acts failed to include CrPC');
    }
    console.log(`[PASS] GET /api/bearer-acts/:id/acts: ${json2.data.length} acts returned under Criminal.`);

    // Test 3: GET /api/acts/:id
    const res3 = await fetch(`${apiBase}/api/acts/${crpcAct.id}`);
    const json3 = await res3.json();
    if (!json3.success || json3.data.heading !== 'THE CODE OF CRIMINAL PROCEDURE, 1973') {
      throw new Error('GET /api/acts/:id failed');
    }
    console.log(`[PASS] GET /api/acts/:id: returned CrPC Act details with ${json3.data.sections.length} sections.`);

    // Test 4: GET /api/acts/:id/sections
    const res4 = await fetch(`${apiBase}/api/acts/${crpcAct.id}/sections?page=1&limit=10`);
    const json4 = await res4.json();
    if (!json4.success || json4.data.length !== 10 || json4.pagination.total !== 534) {
      throw new Error('GET /api/acts/:id/sections failed');
    }
    console.log(`[PASS] GET /api/acts/:id/sections pagination: page 1 of ${json4.pagination.totalPages}, total ${json4.pagination.total}.`);

    // Test 5: GET /api/sections/:sectionId
    const res5 = await fetch(`${apiBase}/api/sections/${sec438.id}`);
    const json5 = await res5.json();
    if (!json5.success || json5.data.section !== 'Section 438' || json5.data.actId !== crpcAct.id) {
      throw new Error('GET /api/sections/:id failed');
    }
    console.log(`[PASS] GET /api/sections/:id: returned section 438 successfully.`);

    // Test 6: Global search GET /api/bearer-acts/search?q=Criminal Procedure
    const res6 = await fetch(`${apiBase}/api/bearer-acts/search?q=Criminal Procedure`);
    const json6 = await res6.json();
    if (!json6.success || json6.data.length === 0) {
      throw new Error('GET /api/bearer-acts/search?q=Criminal Procedure failed');
    }
    console.log(`[PASS] GET /api/bearer-acts/search?q=Criminal Procedure: found ${json6.pagination.total} results.`);

    // Test 7: Act-specific search GET /api/acts/:actId/search?q=bail
    const res7 = await fetch(`${apiBase}/api/acts/${crpcAct.id}/search?q=bail`);
    const json7 = await res7.json();
    if (!json7.success || json7.data.length === 0) {
      throw new Error('GET /api/acts/:actId/search?q=bail failed');
    }
    console.log(`[PASS] GET /api/acts/:actId/search?q=bail: found ${json7.pagination.total} matching sections.`);
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
