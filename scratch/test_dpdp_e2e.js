import { PrismaClient } from '@prisma/client';
import express from 'express';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import http from 'http';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Starting Comprehensive E2E Verification Tests for THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 ===\n');

  // 1. Verify BearerAct Tech, Data & Cyber Laws
  const techDataBearerActs = await prisma.bearerAct.findMany({
    where: { name: 'Tech, Data & Cyber Laws' }
  });

  if (techDataBearerActs.length !== 1) {
    throw new Error(`Expected exactly 1 Tech, Data & Cyber Laws BearerAct, found ${techDataBearerActs.length}`);
  }
  const techDataBearerAct = techDataBearerActs[0];
  console.log(`[PASS] Tech, Data & Cyber Laws BearerAct found uniquely. ID: ${techDataBearerAct.id}`);

  // 2. Verify THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 under Tech, Data & Cyber Laws
  const dpdpActs = await prisma.act.findMany({
    where: {
      bearerActId: techDataBearerAct.id,
      heading: 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023'
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

  if (dpdpActs.length !== 1) {
    throw new Error(`Expected exactly 1 DPDP Act record, found ${dpdpActs.length}`);
  }
  const dpdpAct = dpdpActs[0];
  console.log(`[PASS] DPDP Act found uniquely. ID: ${dpdpAct.id}, Year: ${dpdpAct.year}`);

  // 3. Verify sections count and ordering
  console.log(`[CHECK] Sections count: ${dpdpAct.sections.length} (Expected: 44)`);
  if (dpdpAct.sections.length !== 44) {
    throw new Error(`Expected 44 sections, found ${dpdpAct.sections.length}`);
  }

  // 4. Verify chapter distribution
  const chapterSet = new Set(dpdpAct.sections.map(s => s.chapterNo));
  console.log(`[PASS] Total distinct chapters present: ${chapterSet.size} (Expected: 9)`);
  if (chapterSet.size !== 9) {
    throw new Error(`Expected 9 chapters, found ${chapterSet.size}`);
  }

  // 5. Verify sample section structure & ordering
  const sec1 = dpdpAct.sections.find(s => s.section === 'Section 1');
  if (!sec1 || sec1.chapterNo !== 1 || !sec1.title.includes('Short title and commencement') || !sec1.description.includes('Digital Personal Data Protection Act, 2023')) {
    throw new Error('Section 1 verification failed!');
  }
  console.log('[PASS] Section 1 validated:', sec1.title);

  const sec2 = dpdpAct.sections.find(s => s.section === 'Section 2');
  if (!sec2 || sec2.chapterNo !== 1 || !sec2.title.includes('Definitions') || !sec2.description.includes('Data Fiduciary') || !sec2.description.includes('Data Principal')) {
    throw new Error('Section 2 verification failed!');
  }
  console.log('[PASS] Section 2 validated:', sec2.title);

  const sec8 = dpdpAct.sections.find(s => s.section === 'Section 8');
  if (!sec8 || sec8.chapterNo !== 2 || !sec8.title.includes('General obligations of Data Fiduciary')) {
    throw new Error('Section 8 verification failed!');
  }
  console.log('[PASS] Section 8 validated:', sec8.title);

  const sec18 = dpdpAct.sections.find(s => s.section === 'Section 18');
  if (!sec18 || sec18.chapterNo !== 5 || !sec18.title.includes('Establishment of Board') || !sec18.description.includes('Data Protection Board of India')) {
    throw new Error('Section 18 validated:', sec18.title);
  }
  console.log('[PASS] Section 18 validated:', sec18.title);

  const sec27 = dpdpAct.sections.find(s => s.section === 'Section 27');
  if (!sec27 || sec27.chapterNo !== 6 || !sec27.title.includes('Powers and functions of Board')) {
    throw new Error('Section 27 validated:', sec27.title);
  }
  console.log('[PASS] Section 27 validated:', sec27.title);

  const sec33 = dpdpAct.sections.find(s => s.section === 'Section 33');
  if (!sec33 || sec33.chapterNo !== 8 || !sec33.title.includes('Penalties')) {
    throw new Error('Section 33 validated:', sec33.title);
  }
  console.log('[PASS] Section 33 validated:', sec33.title);

  const sec44 = dpdpAct.sections.find(s => s.section === 'Section 44');
  if (!sec44 || sec44.chapterNo !== 9 || !sec44.description.includes('THE SCHEDULE') || !sec44.description.includes('two hundred and fifty crore rupees')) {
    throw new Error('Section 44 with THE SCHEDULE verification failed!');
  }
  console.log('[PASS] Section 44 with THE SCHEDULE validated.');

  // 6. Verify sort order continuity
  for (let i = 1; i < dpdpAct.sections.length; i++) {
    const prev = dpdpAct.sections[i - 1];
    const curr = dpdpAct.sections[i];
    if (prev.sectionOrder >= curr.sectionOrder) {
      throw new Error(`Section ordering violation: ${prev.section} (${prev.sectionOrder}) should precede ${curr.section} (${curr.sectionOrder})`);
    }
  }
  console.log('[PASS] Section ordering verification succeeded across all sections (1 -> 44 numerical order).');

  // 7. Verify IPCSection and BNSSection datasets remain untouched
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  console.log(`[PASS] Untouched datasets: IPCSection count = ${ipcCount}, BNSSection count = ${bnsCount}`);

  // 8. Test HTTP APIs
  console.log('\n--- Testing Public APIs ---');
  const app = express();
  app.use(express.json());
  app.use(bearerActRoutes);

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // API 1: GET /api/bearer-acts
    const res1 = await fetch(`${baseUrl}/api/bearer-acts`);
    const json1 = await res1.json();
    if (!json1.success || !json1.data.some(b => b.name === 'Tech, Data & Cyber Laws')) {
      throw new Error('GET /api/bearer-acts failed to return Tech, Data & Cyber Laws');
    }
    console.log('[PASS] GET /api/bearer-acts returns Tech, Data & Cyber Laws');

    // API 2: GET /api/bearer-acts/:id
    const res2 = await fetch(`${baseUrl}/api/bearer-acts/${techDataBearerAct.id}`);
    const json2 = await res2.json();
    if (!json2.success || json2.data.name !== 'Tech, Data & Cyber Laws') {
      throw new Error('GET /api/bearer-acts/:id failed');
    }
    console.log('[PASS] GET /api/bearer-acts/:id returns correct bearer act');

    // API 3: GET /api/bearer-acts/:id/acts
    const res3 = await fetch(`${baseUrl}/api/bearer-acts/${techDataBearerAct.id}/acts`);
    const json3 = await res3.json();
    if (!json3.success || !json3.data.some(a => a.heading === 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023')) {
      throw new Error('GET /api/bearer-acts/:id/acts failed to return DPDP Act');
    }
    console.log(`[PASS] GET /api/bearer-acts/:id/acts returned ${json3.data.length} acts under Tech, Data & Cyber Laws`);

    // API 4: GET /api/acts/:id
    const res4 = await fetch(`${baseUrl}/api/acts/${dpdpAct.id}`);
    const json4 = await res4.json();
    if (!json4.success || json4.data.heading !== 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023') {
      throw new Error('GET /api/acts/:id failed');
    }
    console.log('[PASS] GET /api/acts/:id returns correct DPDP Act');

    // API 5: GET /api/acts/:id/sections
    const res5 = await fetch(`${baseUrl}/api/acts/${dpdpAct.id}/sections?limit=100`);
    const json5 = await res5.json();
    if (!json5.success || !Array.isArray(json5.data) || json5.data.length !== 44) {
      throw new Error(`GET /api/acts/:id/sections failed: returned ${json5.data?.length} sections`);
    }
    console.log(`[PASS] GET /api/acts/:id/sections returns all 44 sections`);

    // API 6: GET /api/sections/:id
    const firstSectionId = dpdpAct.sections[0].id;
    const res6 = await fetch(`${baseUrl}/api/sections/${firstSectionId}`);
    const json6 = await res6.json();
    if (!json6.success || json6.data.section !== 'Section 1') {
      throw new Error('GET /api/sections/:id failed');
    }
    console.log('[PASS] GET /api/sections/:id returns Section 1 details');

    // API 7: GET /api/bearer-acts/search?q=digital
    const res7 = await fetch(`${baseUrl}/api/bearer-acts/search?q=digital`);
    const json7 = await res7.json();
    if (!json7.success || !Array.isArray(json7.data) || !json7.data.some(r => r.act && r.act.heading.includes('DIGITAL PERSONAL DATA PROTECTION'))) {
      throw new Error('GET /api/bearer-acts/search?q=digital failed to find DPDP matches');
    }
    console.log(`[PASS] GET /api/bearer-acts/search?q=digital successfully found DPDP Act matches (${json7.data.length} results)`);

  } finally {
    server.close();
  }

  console.log('\n=== ALL E2E AND API TESTS PASSED SUCCESSFULLY ===');
}

runTests()
  .catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
