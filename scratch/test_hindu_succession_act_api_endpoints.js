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
const PORT = 5597;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE HINDU SUCCESSION ACT, 1956';

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
    const hsaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!hsaAct, 'Act is listed in Personal category');
    assert(hsaAct.year === 1956, 'Act year is 1956');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${hsaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1956, 'Act year is 1956');
    assert(singleActRes.data.data.sections.length === 31, `Act details include all 31 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${hsaAct.id}/sections?limit=50`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 31, `Returns all 31 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 31, 'Pagination total is 31');
    
    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted by sectionOrder');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const firstSection = sections[0];
    const sectionDetailRes = await axios.get(`${BASE_URL}/api/sections/${firstSection.id}`);
    assert(sectionDetailRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(sectionDetailRes.data.data.section === 'Section 1', 'Section 1 details returned');
    assert(sectionDetailRes.data.data.title === 'Short title and extent', 'Section 1 title returned correctly');

    // 7. GET /api/bearer-acts/search?q=... (Global search)
    console.log('\n[7] Testing global search GET /api/bearer-acts/search?q=coparcenary...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=coparcenary`);
    assert(globalSearchRes.status === 200, 'GET /api/bearer-acts/search returns 200');
    assert(globalSearchRes.data.data.length > 0, 'Global search returns results');
    const hsaResult = globalSearchRes.data.data.some(s => s.act && s.act.heading === ACT_HEADING);
    assert(hsaResult, 'Hindu Succession Act found in global bearer acts search for "coparcenary"');

    // 8. GET /api/acts/:actId/search?q=... (Act-specific search)
    console.log('\n[8] Testing Act-specific search GET /api/acts/:actId/search?q=stridhana...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${hsaAct.id}/search?q=stridhana`);
    assert(actSearchRes.status === 200, 'GET /api/acts/:actId/search returns 200');
    assert(actSearchRes.data.data.results.length > 0, 'Act-specific search returns results for "stridhana"');
    const sec14 = actSearchRes.data.data.results.find(r => r.section === 'Section 14');
    assert(!!sec14, 'Section 14 found in act search results for "stridhana"');

    // 9. Verify IPC and BNS records remain intact
    console.log('\n[9] Verifying IPC and BNS records remain intact...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `IPC sections preserved: 576 (actual: ${ipcCount})`);
    assert(bnsCount === 358, `BNS sections preserved: 358 (actual: ${bnsCount})`);

    console.log(`\n================================`);
    console.log(`API ENDPOINT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API Test Error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

runApiTests();
