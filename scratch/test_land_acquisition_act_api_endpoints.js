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
const PORT = 5592;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE RIGHT TO FAIR COMPENSATION AND TRANSPARENCY IN LAND ACQUISITION, REHABILITATION AND RESETTLEMENT ACT, 2013';

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
    const laAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!laAct, 'Act is listed in Civil and Property category');
    assert(laAct.year === 2013, 'Act year is 2013');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${laAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details heading is accurate');
    assert(singleActRes.data.data.sections.length === 114, `Act includes all 114 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1 & page 2, limit 100)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${laAct.id}/sections?page=1&limit=100`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections page 1 returns 200');
    assert(p1.data.data.length === 100, `Page 1 returned 100 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 114, `Total in pagination is 114 (actual: ${p1.data.pagination.total})`);
    assert(p1.data.pagination.totalPages === 2, `Total pages is 2 (actual: ${p1.data.pagination.totalPages})`);

    const p2 = await axios.get(`${BASE_URL}/api/acts/${laAct.id}/sections?page=2&limit=100`);
    assert(p2.status === 200, 'GET /api/acts/:id/sections page 2 returns 200');
    assert(p2.data.data.length === 14, `Page 2 returned 14 sections (actual: ${p2.data.data.length})`);

    const allSections = [...p1.data.data, ...p2.data.data];
    assert(allSections.length === 114, `Combined pages return 114 sections`);

    // Check numerical ordering
    let isSorted = true;
    for (let i = 0; i < allSections.length - 1; i++) {
      if (allSections[i].sectionOrder >= allSections[i + 1].sectionOrder) {
        isSorted = false;
        console.error(`Ordering mismatch: ${allSections[i].section} (${allSections[i].sectionOrder}) before ${allSections[i + 1].section} (${allSections[i + 1].sectionOrder})`);
      }
    }
    assert(isSorted, 'Sections are strictly sorted in correct numeric order');

    const sec1 = allSections[0];
    assert(sec1.section === 'Section 1', `First section is Section 1 (actual: ${sec1.section})`);
    const sec10 = allSections[9];
    assert(sec10.section === 'Section 10', `Tenth section is Section 10 (actual: ${sec10.section})`);
    const sec114 = allSections[allSections.length - 1];
    assert(sec114.section === 'Section 114', `Last section is Section 114 (actual: ${sec114.section})`);

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section identifier matches');
    assert(singleSecRes.data.data.title === 'Short title, extent and commencement', 'Section title matches');
    assert(singleSecRes.data.data.chapterNo === 1, 'Section 1 chapterNo is 1');
    assert(singleSecRes.data.data.chapterName === 'PRELIMINARY', 'Section 1 chapterName is PRELIMINARY');
    assert(singleSecRes.data.data.description.includes('Right to Fair Compensation and Transparency in Land Acquisition'), 'Section 1 description has proper content');

    // 7. GET /api/bearer-acts/search?q=... (Global search)
    console.log('\n[7] Testing GET /api/bearer-acts/search (Global search)...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Compensation`);
    assert(globalSearchRes.status === 200, 'Global search returns 200');
    assert(globalSearchRes.data.data.length > 0, 'Global search returned results');
    const foundInGlobal = globalSearchRes.data.data.some(s => s.act && s.act.heading === ACT_HEADING);
    assert(foundInGlobal, 'Global search includes Land Acquisition Act sections');

    // 8. GET /api/acts/:actId/search?q=... (Act-specific search)
    console.log('\n[8] Testing GET /api/acts/:actId/search (Act-specific search)...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${laAct.id}/search?q=Social%20Impact`);
    assert(actSearchRes.status === 200, 'Act-specific search returns 200');
    assert(actSearchRes.data.data.results.length > 0, `Act search found sections matching "Social Impact" (count: ${actSearchRes.data.data.results.length})`);
    assert(actSearchRes.data.data.act.heading === ACT_HEADING, 'Act-specific search includes Act header');
    const allBelongToAct = actSearchRes.data.data.results.every(s => s.actId === laAct.id);
    assert(allBelongToAct, 'All search results belong to the Land Acquisition Act');

    // 9. Check IPC and BNS datasets
    console.log('\n[9] Verifying IPC and BNS records remain intact...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `IPC sections preserved: 576 (actual: ${ipcCount})`);
    assert(bnsCount === 358, `BNS sections preserved: 358 (actual: ${bnsCount})`);

    // 10. Check Idempotency and Counts
    console.log('\n[10] Verifying Act and Section database counts...');
    const laActsCount = await prisma.act.count({
      where: {
        bearerActId: civilCat.id,
        heading: ACT_HEADING
      }
    });
    assert(laActsCount === 1, `Exactly 1 Land Acquisition Act record exists under Civil and Property (actual: ${laActsCount})`);

    const laSectionsCount = await prisma.actSection.count({
      where: {
        actId: laAct.id
      }
    });
    assert(laSectionsCount === 114, `Exactly 114 Land Acquisition Act section records exist (actual: ${laSectionsCount})`);

    console.log(`\n========================================`);
    console.log(`API TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API Test Error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runApiTests();
