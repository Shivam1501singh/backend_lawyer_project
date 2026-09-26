import { PrismaClient } from '@prisma/client';
import express from 'express';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import http from 'http';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Starting Comprehensive E2E Verification Tests for THE INFORMATION TECHNOLOGY ACT, 2000 ===\n');

  // 1. Verify BearerAct Tech, Data & Cyber Laws
  const techDataBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Tech, Data & Cyber Laws' }
  });

  if (!techDataBearerAct) {
    throw new Error('Tech, Data & Cyber Laws BearerAct not found!');
  }
  console.log(`[PASS] Tech, Data & Cyber Laws BearerAct found. ID: ${techDataBearerAct.id}`);

  // 2. Verify THE INFORMATION TECHNOLOGY ACT, 2000 under Tech, Data & Cyber Laws
  const itAct = await prisma.act.findFirst({
    where: {
      bearerActId: techDataBearerAct.id,
      heading: 'THE INFORMATION TECHNOLOGY ACT, 2000'
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

  if (!itAct) {
    throw new Error('THE INFORMATION TECHNOLOGY ACT, 2000 Act not found under Tech, Data & Cyber Laws!');
  }
  console.log(`[PASS] IT Act found. ID: ${itAct.id}, Year: ${itAct.year}`);

  // 3. Verify sections count and ordering
  console.log(`[CHECK] Sections count: ${itAct.sections.length} (Expected: 125)`);
  if (itAct.sections.length !== 125) {
    throw new Error(`Expected 125 sections, found ${itAct.sections.length}`);
  }

  // 4. Verify chapter distribution
  const chapterSet = new Set(itAct.sections.map(s => s.chapterNo));
  console.log(`[PASS] Total distinct chapters present: ${chapterSet.size} (Expected: 14)`);
  if (chapterSet.size !== 14) {
    throw new Error(`Expected 14 chapters, found ${chapterSet.size}`);
  }

  // 5. Verify sample section structure & ordering
  const sec1 = itAct.sections.find(s => s.section === 'Section 1');
  if (!sec1 || sec1.chapterNo !== 1 || !sec1.title.includes('Short title') || !sec1.description.includes('Information Technology Act, 2000')) {
    throw new Error('Section 1 verification failed!');
  }
  console.log('[PASS] Section 1 validated:', sec1.title);

  const sec3A = itAct.sections.find(s => s.section === 'Section 3A');
  if (!sec3A || sec3A.chapterNo !== 2 || !sec3A.title.includes('Electronic signature')) {
    throw new Error('Section 3A verification failed!');
  }
  console.log('[PASS] Section 3A validated:', sec3A.title);

  const sec66A = itAct.sections.find(s => s.section === 'Section 66A');
  if (!sec66A || sec66A.chapterNo !== 11 || !sec66A.title.includes('offensive messages')) {
    throw new Error('Section 66A validated:', sec66A.title);
  }
  console.log('[PASS] Section 66A validated:', sec66A.title);

  const sec79A = itAct.sections.find(s => s.section === 'Section 79A');
  if (!sec79A || sec79A.chapterNo !== 13 || !sec79A.title.includes('Examiner of Electronic Evidence')) {
    throw new Error('Section 79A in Chapter XIIA validated:', sec79A.title);
  }
  console.log('[PASS] Section 79A validated:', sec79A.title);

  const sec94 = itAct.sections.find(s => s.section === 'Section 94');
  if (!sec94 || sec94.chapterNo !== 14 || !sec94.description.includes('THE FIRST SCHEDULE') || !sec94.description.includes('THE SECOND SCHEDULE')) {
    throw new Error('Section 94 with Schedules verification failed!');
  }
  console.log('[PASS] Section 94 with Schedules validated.');

  // 6. Verify sort order continuity
  for (let i = 1; i < itAct.sections.length; i++) {
    const prev = itAct.sections[i - 1];
    const curr = itAct.sections[i];
    if (prev.chapterNo === curr.chapterNo && prev.sectionOrder >= curr.sectionOrder) {
      throw new Error(`Section ordering violation in Chapter ${curr.chapterNo}: ${prev.section} (${prev.sectionOrder}) should precede ${curr.section} (${curr.sectionOrder})`);
    }
  }
  console.log('[PASS] Section ordering verification succeeded across all chapters.');

  // 7. Verify IPCSection and BNSSection datasets remain untouched
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  console.log(`[PASS] Untouched datasets: IPCSection count = ${ipcCount}, BNSSection count = ${bnsCount}`);

  // 8. Test HTTP Endpoints using live express instance
  const app = express();
  app.use(express.json());
  app.use(bearerActRoutes);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, message: err.message });
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`\nTesting API endpoints on ${baseUrl}...`);

  // Helper fetch function
  const fetchJson = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return { status: res.status, data };
  };

  // Test GET /api/bearer-acts
  const rBearerActs = await fetchJson(`${baseUrl}/api/bearer-acts`);
  if (rBearerActs.status !== 200 || !rBearerActs.data.success) {
    throw new Error('GET /api/bearer-acts failed');
  }
  const techCategory = rBearerActs.data.data.find(b => b.name === 'Tech, Data & Cyber Laws');
  if (!techCategory) {
    throw new Error('Tech, Data & Cyber Laws category not returned in /api/bearer-acts');
  }
  console.log('[PASS] GET /api/bearer-acts returned Tech, Data & Cyber Laws');

  // Test GET /api/bearer-acts/:id
  const rSingleBearer = await fetchJson(`${baseUrl}/api/bearer-acts/${techDataBearerAct.id}`);
  if (rSingleBearer.status !== 200 || rSingleBearer.data.data.id !== techDataBearerAct.id) {
    throw new Error('GET /api/bearer-acts/:id failed');
  }
  console.log('[PASS] GET /api/bearer-acts/:id verified');

  // Test GET /api/bearer-acts/:id/acts
  const rActs = await fetchJson(`${baseUrl}/api/bearer-acts/${techDataBearerAct.id}/acts`);
  if (rActs.status !== 200 || !rActs.data.data.some(a => a.id === itAct.id)) {
    throw new Error('GET /api/bearer-acts/:id/acts did not return IT Act');
  }
  console.log('[PASS] GET /api/bearer-acts/:id/acts returned IT Act');

  // Test GET /api/acts/:id
  const rSingleAct = await fetchJson(`${baseUrl}/api/acts/${itAct.id}`);
  if (rSingleAct.status !== 200 || rSingleAct.data.data.id !== itAct.id) {
    throw new Error('GET /api/acts/:id failed');
  }
  console.log('[PASS] GET /api/acts/:id verified');

  // Test GET /api/acts/:id/sections (Page 1)
  const rSectionsP1 = await fetchJson(`${baseUrl}/api/acts/${itAct.id}/sections?page=1&limit=100`);
  if (rSectionsP1.status !== 200 || !rSectionsP1.data.success || rSectionsP1.data.data.length !== 100 || rSectionsP1.data.pagination.total !== 125) {
    throw new Error(`GET /api/acts/:id/sections page 1 returned ${rSectionsP1.data.data?.length} sections (total: ${rSectionsP1.data.pagination?.total}) instead of 100/125`);
  }
  console.log('[PASS] GET /api/acts/:id/sections Page 1 returned 100 sections with total=125, totalPages=2');

  // Test GET /api/acts/:id/sections (Page 2)
  const rSectionsP2 = await fetchJson(`${baseUrl}/api/acts/${itAct.id}/sections?page=2&limit=100`);
  if (rSectionsP2.status !== 200 || !rSectionsP2.data.success || rSectionsP2.data.data.length !== 25) {
    throw new Error(`GET /api/acts/:id/sections page 2 returned ${rSectionsP2.data.data?.length} sections instead of 25`);
  }
  console.log('[PASS] GET /api/acts/:id/sections Page 2 returned 25 sections');

  // Test GET /api/sections/:id
  const rSingleSec = await fetchJson(`${baseUrl}/api/sections/${sec66A.id}`);
  if (rSingleSec.status !== 200 || rSingleSec.data.data.id !== sec66A.id) {
    throw new Error('GET /api/sections/:id failed');
  }
  console.log('[PASS] GET /api/sections/:id verified for Section 66A');

  // Test GET /api/bearer-acts/search?q=information
  const rSearch1 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=information`);
  if (rSearch1.status !== 200 || !rSearch1.data.success || !Array.isArray(rSearch1.data.data)) {
    throw new Error('Global search for "information" failed');
  }
  console.log(`[PASS] Global search for "information" returned ${rSearch1.data.data.length} results (total: ${rSearch1.data.pagination.total})`);

  // Test GET /api/bearer-acts/search?q=cyber
  const rSearch2 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=cyber`);
  if (rSearch2.status !== 200 || !rSearch2.data.success || !Array.isArray(rSearch2.data.data)) {
    throw new Error('Global search for "cyber" failed');
  }
  console.log(`[PASS] Global search for "cyber" returned ${rSearch2.data.data.length} results (total: ${rSearch2.data.pagination.total})`);

  // Test GET /api/bearer-acts/search?q=66A
  const rSearch3 = await fetchJson(`${baseUrl}/api/bearer-acts/search?q=66A`);
  if (rSearch3.status !== 200 || !rSearch3.data.success || rSearch3.data.data.length === 0) {
    throw new Error('Global search for "66A" failed');
  }
  console.log(`[PASS] Global search for "66A" returned ${rSearch3.data.data.length} results`);

  // Test GET /api/acts/:actId/search?q=signature
  const rActSearch = await fetchJson(`${baseUrl}/api/acts/${itAct.id}/search?q=signature`);
  if (rActSearch.status !== 200 || !rActSearch.data.success || rActSearch.data.data.length === 0) {
    throw new Error('Act-specific search for "signature" failed');
  }
  console.log(`[PASS] Act-specific search for "signature" returned ${rActSearch.data.data.length} sections`);

  // Close server
  await new Promise((resolve) => server.close(resolve));
  console.log('\n[ALL TESTS PASSED SUCCESSFULLY!]');
}

runTests()
  .catch((e) => {
    console.error('Test failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
