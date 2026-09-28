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
const PORT = 5594;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE CODE OF CIVIL PROCEDURE, 1908';

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
    const civilCat = catRes.data.data.find(c => c.name === 'Civil and Property');
    assert(!!civilCat, 'Civil and Property BearerAct exists in categories list');

    // 2. GET /api/bearer-acts/:id
    console.log('\n[2] Testing GET /api/bearer-acts/:id...');
    const singleCatRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}`);
    assert(singleCatRes.status === 200, 'GET /api/bearer-acts/:id returns 200');
    const acts = singleCatRes.data.data.acts;
    assert(Array.isArray(acts), 'Category includes acts array');
    const cpcAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!cpcAct, 'Act is listed in Civil and Property category');
    assert(cpcAct.year === 1908, 'Act year is 1908');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const actRes = await axios.get(`${BASE_URL}/api/acts/${cpcAct.id}`);
    assert(actRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(actRes.data.data.heading === ACT_HEADING, 'Act heading matches');
    assert(actRes.data.data.year === 1908, 'Act year matches 1908');
    assert(actRes.data.data.sections.length === 171, `Act details include all 171 sections (actual: ${actRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1 & page 2, limit 100)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${cpcAct.id}/sections?page=1&limit=100`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections page 1 returns 200');
    assert(p1.data.data.length === 100, `Page 1 returned 100 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 171, `Total in pagination is 171 (actual: ${p1.data.pagination.total})`);
    assert(p1.data.pagination.totalPages === 2, `Total pages is 2 (actual: ${p1.data.pagination.totalPages})`);

    const p2 = await axios.get(`${BASE_URL}/api/acts/${cpcAct.id}/sections?page=2&limit=100`);
    assert(p2.status === 200, 'GET /api/acts/:id/sections page 2 returns 200');
    assert(p2.data.data.length === 71, `Page 2 returned 71 sections (actual: ${p2.data.data.length})`);

    const allSections = [...p1.data.data, ...p2.data.data];
    assert(allSections.length === 171, 'Combined paginated sections return 171 items');

    // Verify ordering in API response
    let apiOrderCorrect = true;
    for (let i = 0; i < allSections.length - 1; i++) {
      if (allSections[i].sectionOrder >= allSections[i + 1].sectionOrder) {
        apiOrderCorrect = false;
        console.error(`Ordering mismatch in API response: ${allSections[i].section} (${allSections[i].sectionOrder}) vs ${allSections[i + 1].section} (${allSections[i + 1].sectionOrder})`);
      }
    }
    assert(apiOrderCorrect, 'API sections are strictly ordered by sectionOrder ascending');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const testSec = allSections.find(s => s.section === 'Section 9');
    assert(!!testSec, 'Section 9 exists in section list');
    const secDetailRes = await axios.get(`${BASE_URL}/api/sections/${testSec.id}`);
    assert(secDetailRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(secDetailRes.data.data.section === 'Section 9', 'Section field matches Section 9');
    assert(secDetailRes.data.data.title.includes('Courts to try all civil suits unless barred'), 'Title matches');
    assert(secDetailRes.data.data.description.includes('cognizance is either expressly or impliedly barred'), 'Description contains legal text');

    // 7. GET /api/bearer-acts/search?q=... (Global search)
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=res judicata...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=res%20judicata`);
    assert(globalSearchRes.status === 200, 'GET /api/bearer-acts/search returns 200');
    assert(globalSearchRes.data.data.length > 0, 'Global search returns results');
    const cpcResult = globalSearchRes.data.data.some(s => s.act && s.act.heading === ACT_HEADING);
    assert(cpcResult, 'CPC Act found in global bearer acts search for "res judicata"');

    // 8. GET /api/acts/:actId/search?q=... (Act-specific search)
    console.log('\n[8] Testing GET /api/acts/:actId/search?q=interpleader...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${cpcAct.id}/search?q=interpleader`);
    assert(actSearchRes.status === 200, 'GET /api/acts/:actId/search returns 200');
    assert(actSearchRes.data.data.results.length > 0, 'Act-specific search returns results for "interpleader"');
    const sec88 = actSearchRes.data.data.results.find(r => r.section === 'Section 88');
    assert(!!sec88, 'Section 88 found in act search results for "interpleader"');

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
  } catch (error) {
    console.error('API endpoint test failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status, 'data:', error.response.data);
    }
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runApiTests();
