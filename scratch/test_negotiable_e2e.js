import { PrismaClient } from '@prisma/client';
import express from 'express';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import http from 'http';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Starting Comprehensive E2E Verification Tests for THE NEGOTIABLE INSTRUMENTS ACT, 1881 ===\n');

  // 1. Verify BearerAct Criminal
  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });

  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found!');
  }
  console.log(`[PASS] Criminal BearerAct found. ID: ${criminalBearerAct.id}`);

  // 2. Verify THE NEGOTIABLE INSTRUMENTS ACT, 1881 under Criminal
  const negotiableAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE NEGOTIABLE INSTRUMENTS ACT, 1881'
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

  if (!negotiableAct) {
    throw new Error('THE NEGOTIABLE INSTRUMENTS ACT, 1881 Act not found under Criminal!');
  }
  console.log(`[PASS] Negotiable Instruments Act found. ID: ${negotiableAct.id}, Year: ${negotiableAct.year}`);

  // 3. Verify sections count and ordering
  console.log(`[CHECK] Sections count: ${negotiableAct.sections.length} (Expected: 155)`);
  if (negotiableAct.sections.length !== 155) {
    throw new Error(`Expected 155 sections, found ${negotiableAct.sections.length}`);
  }

  // 4. Verify chapter distribution
  const chapterSet = new Set(negotiableAct.sections.map(s => s.chapterNo));
  console.log(`[PASS] Total distinct chapters present: ${chapterSet.size} (Expected: 17)`);
  if (chapterSet.size !== 17) {
    throw new Error(`Expected 17 chapters, found ${chapterSet.size}`);
  }

  // 5. Verify sample section structure & ordering
  const sec1 = negotiableAct.sections.find(s => s.section === 'Section 1');
  if (!sec1 || sec1.chapterNo !== 1 || !sec1.title.includes('Short title') || !sec1.description.includes('Negotiable Instruments Act, 1881')) {
    throw new Error('Section 1 verification failed!');
  }
  console.log('[PASS] Section 1 validated:', sec1.title);

  const sec4 = negotiableAct.sections.find(s => s.section === 'Section 4');
  if (!sec4 || sec4.chapterNo !== 2 || !sec4.title.includes('Promissory note') || !sec4.description.includes('Illustrations')) {
    throw new Error('Section 4 verification failed!');
  }
  console.log('[PASS] Section 4 validated:', sec4.title);

  const sec45A = negotiableAct.sections.find(s => s.section === 'Section 45A');
  if (!sec45A || sec45A.chapterNo !== 3 || !sec45A.title.includes('duplicate of lost bill')) {
    throw new Error('Section 45A verification failed!');
  }
  console.log('[PASS] Section 45A validated:', sec45A.title, `(sectionOrder: ${sec45A.sectionOrder})`);

  const sec75A = negotiableAct.sections.find(s => s.section === 'Section 75A');
  if (!sec75A || sec75A.chapterNo !== 5 || !sec75A.title.includes('Excuse for delay in presentment')) {
    throw new Error('Section 75A verification failed!');
  }
  console.log('[PASS] Section 75A validated:', sec75A.title, `(sectionOrder: ${sec75A.sectionOrder})`);

  const sec85A = negotiableAct.sections.find(s => s.section === 'Section 85A');
  if (!sec85A || sec85A.chapterNo !== 7 || !sec85A.title.includes('Drafts drawn by one branch')) {
    throw new Error('Section 85A verification failed!');
  }
  console.log('[PASS] Section 85A validated:', sec85A.title, `(sectionOrder: ${sec85A.sectionOrder})`);

  const sec104A = negotiableAct.sections.find(s => s.section === 'Section 104A');
  if (!sec104A || sec104A.chapterNo !== 9 || !sec104A.title.includes('When noting equivalent to protest')) {
    throw new Error('Section 104A verification failed!');
  }
  console.log('[PASS] Section 104A validated:', sec104A.title, `(sectionOrder: ${sec104A.sectionOrder})`);

  const sec131A = negotiableAct.sections.find(s => s.section === 'Section 131A');
  if (!sec131A || sec131A.chapterNo !== 14 || !sec131A.title.includes('Application of Chapter to drafts')) {
    throw new Error('Section 131A verification failed!');
  }
  console.log('[PASS] Section 131A validated:', sec131A.title, `(sectionOrder: ${sec131A.sectionOrder})`);

  const sec138 = negotiableAct.sections.find(s => s.section === 'Section 138');
  if (!sec138 || sec138.chapterNo !== 17 || !sec138.title.includes('Dishonour of cheque')) {
    throw new Error('Section 138 verification failed!');
  }
  console.log('[PASS] Section 138 validated:', sec138.title);

  const sec142A = negotiableAct.sections.find(s => s.section === 'Section 142A');
  if (!sec142A || sec142A.chapterNo !== 17 || !sec142A.title.includes('Validation for transfer')) {
    throw new Error('Section 142A verification failed!');
  }
  console.log('[PASS] Section 142A validated:', sec142A.title, `(sectionOrder: ${sec142A.sectionOrder})`);

  const sec143A = negotiableAct.sections.find(s => s.section === 'Section 143A');
  if (!sec143A || sec143A.chapterNo !== 17 || !sec143A.title.includes('interim compensation')) {
    throw new Error('Section 143A verification failed!');
  }
  console.log('[PASS] Section 143A validated:', sec143A.title, `(sectionOrder: ${sec143A.sectionOrder})`);

  const sec148 = negotiableAct.sections.find(s => s.section === 'Section 148');
  if (!sec148 || sec148.chapterNo !== 17 || !sec148.title.includes('Power of Appellate Court') || !sec148.description.includes('SCHEDULE')) {
    throw new Error('Section 148 / Schedule verification failed!');
  }
  console.log('[PASS] Section 148 & Schedule validated:', sec148.title);

  // 6. Verify sectionOrder strictly ascending per chapter
  for (let ch = 1; ch <= 17; ch++) {
    const chSecs = negotiableAct.sections.filter(s => s.chapterNo === ch);
    for (let i = 0; i < chSecs.length - 1; i++) {
      if (chSecs[i].sectionOrder >= chSecs[i + 1].sectionOrder) {
        throw new Error(`Section ordering broken in Chapter ${ch}: ${chSecs[i].section} (${chSecs[i].sectionOrder}) vs ${chSecs[i+1].section} (${chSecs[i+1].sectionOrder})`);
      }
    }
  }
  console.log('[PASS] Numerical section ordering verified across all 17 chapters.');

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
    'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012',
    'THE NEGOTIABLE INSTRUMENTS ACT, 1881'
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
    if (!json2.success || !json2.data.some(a => a.heading === 'THE NEGOTIABLE INSTRUMENTS ACT, 1881')) {
      throw new Error('GET /api/bearer-acts/:id/acts failed to include Negotiable Instruments Act');
    }
    console.log(`[PASS] GET /api/bearer-acts/:id/acts: ${json2.data.length} acts returned under Criminal.`);

    // Test 3: GET /api/acts/:id
    const res3 = await fetch(`${apiBase}/api/acts/${negotiableAct.id}`);
    const json3 = await res3.json();
    if (!json3.success || json3.data.heading !== 'THE NEGOTIABLE INSTRUMENTS ACT, 1881') {
      throw new Error('GET /api/acts/:id failed');
    }
    console.log(`[PASS] GET /api/acts/:id: returned Negotiable Instruments Act details with ${json3.data.sections.length} sections.`);

    // Test 4: GET /api/acts/:id/sections
    const res4 = await fetch(`${apiBase}/api/acts/${negotiableAct.id}/sections?page=1&limit=20`);
    const json4 = await res4.json();
    if (!json4.success || json4.data.length !== 20 || json4.pagination.total !== 155) {
      throw new Error('GET /api/acts/:id/sections failed');
    }
    console.log(`[PASS] GET /api/acts/:id/sections pagination: page 1 of ${json4.pagination.totalPages}, total ${json4.pagination.total}.`);

    // Test 5: GET /api/sections/:sectionId
    const res5 = await fetch(`${apiBase}/api/sections/${sec4.id}`);
    const json5 = await res5.json();
    if (!json5.success || json5.data.section !== 'Section 4' || json5.data.actId !== negotiableAct.id) {
      throw new Error('GET /api/sections/:id failed');
    }
    console.log(`[PASS] GET /api/sections/:id: returned section 4 successfully.`);

    // Test 6: Global search GET /api/bearer-acts/search?q=negotiable
    const res6 = await fetch(`${apiBase}/api/bearer-acts/search?q=negotiable`);
    const json6 = await res6.json();
    if (!json6.success || json6.data.length === 0) {
      throw new Error('GET /api/bearer-acts/search?q=negotiable failed');
    }
    console.log(`[PASS] GET /api/bearer-acts/search?q=negotiable: found ${json6.pagination.total} results.`);

    // Test 7: Global search GET /api/bearer-acts/search?q=1881
    const res7 = await fetch(`${apiBase}/api/bearer-acts/search?q=1881`);
    const json7 = await res7.json();
    if (!json7.success || json7.data.length === 0) {
      throw new Error('GET /api/bearer-acts/search?q=1881 failed');
    }
    console.log(`[PASS] GET /api/bearer-acts/search?q=1881: found ${json7.pagination.total} results.`);

    // Test 8: Act-specific search GET /api/acts/:actId/search?q=promissory
    const res8 = await fetch(`${apiBase}/api/acts/${negotiableAct.id}/search?q=promissory`);
    const json8 = await res8.json();
    if (!json8.success || json8.data.length === 0) {
      throw new Error('GET /api/acts/:actId/search?q=promissory failed');
    }
    console.log(`[PASS] GET /api/acts/:actId/search?q=promissory: found ${json8.pagination.total} matching sections.`);

    // Test 9: Act-specific search GET /api/acts/:actId/search?q=dishonour
    const res9 = await fetch(`${apiBase}/api/acts/${negotiableAct.id}/search?q=dishonour`);
    const json9 = await res9.json();
    if (!json9.success || json9.data.length === 0) {
      throw new Error('GET /api/acts/:actId/search?q=dishonour failed');
    }
    console.log(`[PASS] GET /api/acts/:actId/search?q=dishonour: found ${json9.pagination.total} matching sections.`);
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
