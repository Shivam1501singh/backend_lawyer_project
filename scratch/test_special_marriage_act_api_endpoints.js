import express from 'express';
import cookieParser from 'cookie-parser';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import axios from 'axios';
import prisma from '../src/lib/prisma.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bearerActRoutes);
app.use(errorHandler);

let server;
const PORT = 5598;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE SPECIAL MARRIAGE ACT, 1954';

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for', ACT_HEADING, 'at', BASE_URL);

  server = app.listen(PORT);

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
    // 1. GET /api/bearer-acts
    console.log('\n[1] Testing GET /api/bearer-acts...');
    const catRes = await axios.get(`${BASE_URL}/api/bearer-acts`);
    assert(catRes.status === 200, 'GET /api/bearer-acts returns 200');
    const personalCat = catRes.data.data.find(c => c.name === 'Personal');
    assert(!!personalCat, 'Personal BearerAct exists in categories list');

    // 2. GET /api/bearer-acts/:id
    console.log('\n[2] Testing GET /api/bearer-acts/:id...');
    const singleCatRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}`);
    assert(singleCatRes.status === 200, 'GET /api/bearer-acts/:id returns 200');
    const acts = singleCatRes.data.data.acts;
    assert(Array.isArray(acts), 'Category includes acts array');
    const smaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!smaAct, 'Act is listed in Personal category');
    assert(smaAct.year === 1954, 'Act year is 1954');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${smaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1954, 'Act year is 1954');
    assert(singleActRes.data.data.sections.length === 57, `Act details include all 57 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${smaAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 57, `Returns all 57 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 57, 'Pagination total is 57');

    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        console.error(`Ordering violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted strictly by sectionOrder');

    // Verify key lettered sections ordering (e.g., 21, 21A, 22; 27, 27A, 28; 39, 39A, 40, 40A, 40B, 40C, 41)
    const sec21Idx = sections.findIndex(s => s.section === 'Section 21');
    const sec21AIdx = sections.findIndex(s => s.section === 'Section 21A');
    const sec22Idx = sections.findIndex(s => s.section === 'Section 22');
    assert(sec21Idx < sec21AIdx && sec21AIdx < sec22Idx, 'Section 21 -> Section 21A -> Section 22 order is correct');

    const sec27Idx = sections.findIndex(s => s.section === 'Section 27');
    const sec27AIdx = sections.findIndex(s => s.section === 'Section 27A');
    const sec28Idx = sections.findIndex(s => s.section === 'Section 28');
    assert(sec27Idx < sec27AIdx && sec27AIdx < sec28Idx, 'Section 27 -> Section 27A -> Section 28 order is correct');

    const sec39Idx = sections.findIndex(s => s.section === 'Section 39');
    const sec39AIdx = sections.findIndex(s => s.section === 'Section 39A');
    const sec40Idx = sections.findIndex(s => s.section === 'Section 40');
    const sec40AIdx = sections.findIndex(s => s.section === 'Section 40A');
    const sec40BIdx = sections.findIndex(s => s.section === 'Section 40B');
    const sec40CIdx = sections.findIndex(s => s.section === 'Section 40C');
    const sec41Idx = sections.findIndex(s => s.section === 'Section 41');
    assert(
      sec39Idx < sec39AIdx && sec39AIdx < sec40Idx && sec40Idx < sec40AIdx && sec40AIdx < sec40BIdx && sec40BIdx < sec40CIdx && sec40CIdx < sec41Idx,
      'Section 39 -> 39A -> 40 -> 40A -> 40B -> 40C -> 41 order is correct'
    );

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const firstSection = sections[0];
    const sectionDetailRes = await axios.get(`${BASE_URL}/api/sections/${firstSection.id}`);
    assert(sectionDetailRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(sectionDetailRes.data.data.section === 'Section 1', 'Section 1 details returned');
    assert(sectionDetailRes.data.data.title === 'Short title, extent and commencement', 'Section 1 title returned correctly');

    // 7. GET /api/bearer-acts/search?q=... (Global search)
    console.log('\n[7] Testing global search GET /api/bearer-acts/search?q=solemnization...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=solemnization`);
    assert(globalSearchRes.status === 200, 'GET /api/bearer-acts/search returns 200');
    assert(globalSearchRes.data.data.length > 0, 'Global search returns results');
    assert(
      globalSearchRes.data.data.some(
        r => r.act?.heading === ACT_HEADING || r.section?.title?.toLowerCase().includes('solemnization') || r.section?.description?.toLowerCase().includes('solemnization')
      ),
      'Global search found Special Marriage Act results'
    );

    // 8. GET /api/acts/:actId/search?q=... (Act specific search)
    console.log('\n[8] Testing Act-specific search GET /api/acts/:actId/search?q=restitution...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${smaAct.id}/search?q=restitution`);
    assert(actSearchRes.status === 200, 'GET /api/acts/:actId/search returns 200');
    const actSearchResults = actSearchRes.data.data.results;
    assert(Array.isArray(actSearchResults) && actSearchResults.length > 0, 'Act-specific search returns results');
    assert(actSearchResults.some(s => s.section === 'Section 22' || s.title?.includes('Restitution')), 'Act-specific search found Section 22');

    // 9. Verify legacy IPC and BNS tables data
    console.log('\n[9] Verifying legacy IPC and BNS data untouched...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount > 0, `Legacy IPCSection count preserved (${ipcCount})`);
    assert(bnsCount > 0, `Legacy BNSSection count preserved (${bnsCount})`);

    // 10. Verify other Acts under Personal category
    console.log('\n[10] Verifying other Acts under Personal category preserved...');
    const personalActs = await prisma.act.findMany({
      where: { bearerActId: personalCat.id }
    });
    const hmaExists = personalActs.some(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaExists = personalActs.some(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaExists = personalActs.some(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    assert(hmaExists, 'THE HINDU MARRIAGE ACT, 1955 exists under Personal');
    assert(hsaExists, 'THE HINDU SUCCESSION ACT, 1956 exists under Personal');
    assert(smaExists, 'THE SPECIAL MARRIAGE ACT, 1954 exists under Personal');

  } catch (err) {
    console.error('Error running API tests:', err.response?.data || err.message);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
    console.log(`\n================================`);
    console.log(`API Tests Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runApiTests();
