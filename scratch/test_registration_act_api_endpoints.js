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
const PORT = 5591;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for THE REGISTRATION ACT, 1908 at', BASE_URL);

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
    const regAct = acts.find(a => a.heading === 'THE REGISTRATION ACT, 1908');
    assert(!!regAct, 'THE REGISTRATION ACT, 1908 is listed in Civil and Property category');
    assert(regAct.year === 1908, 'THE REGISTRATION ACT, 1908 year is 1908');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE REGISTRATION ACT, 1908'), 'THE REGISTRATION ACT, 1908 found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${regAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE REGISTRATION ACT, 1908', 'Act details heading is accurate');
    assert(singleActRes.data.data.sections.length === 96, `Act includes all 96 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1, limit 100)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${regAct.id}/sections?page=1&limit=100`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(p1.data.data.length === 96, `Page 1 returned 96 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 96, `Total in pagination is 96 (actual: ${p1.data.pagination.total})`);

    // Check numerical ordering
    const sections = p1.data.data;
    let isSorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        isSorted = false;
        console.error(`Ordering mismatch: ${sections[i].section} (${sections[i].sectionOrder}) before ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
      }
    }
    assert(isSorted, 'Sections are strictly sorted in correct numeric order');

    const sec1 = sections[0];
    assert(sec1.section === 'Section 1', `First section is Section 1 (actual: ${sec1.section})`);
    const sec16A = sections.find(s => s.section === 'Section 16A');
    assert(!!sec16A, 'Section 16A exists in returned sections');
    assert(sec16A.sectionOrder === 16.01, `Section 16A order is 16.01 (actual: ${sec16A.sectionOrder})`);
    const sec23A = sections.find(s => s.section === 'Section 23A');
    assert(!!sec23A, 'Section 23A exists in returned sections');
    assert(sec23A.sectionOrder === 23.01, `Section 23A order is 23.01 (actual: ${sec23A.sectionOrder})`);
    const sec32A = sections.find(s => s.section === 'Section 32A');
    assert(!!sec32A, 'Section 32A exists in returned sections');
    assert(sec32A.sectionOrder === 32.01, `Section 32A order is 32.01 (actual: ${sec32A.sectionOrder})`);
    const sec93 = sections[sections.length - 1];
    assert(sec93.section === 'Section 93', `Last section is Section 93 (actual: ${sec93.section})`);

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 data retrieved');
    assert(singleSecRes.data.data.chapterNo === 1, 'Section 1 chapterNo is 1');

    // 7. GET /api/bearer-acts/search?q=compulsory
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=compulsory...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=compulsory&limit=50`);
    assert(globalSearchRes.status === 200, 'GET /api/bearer-acts/search returns 200');
    assert(globalSearchRes.data.data.length > 0, `Found sections with query "compulsory" (count: ${globalSearchRes.data.data.length})`);
    const foundRegCompulsory = globalSearchRes.data.data.some(
      item => item.act?.heading === 'THE REGISTRATION ACT, 1908' || item.actId === regAct.id
    );
    assert(foundRegCompulsory, 'Found Registration Act section in global bearer-acts search');

    // 8. GET /api/acts/:actId/search?q=refusal
    console.log('\n[8] Testing GET /api/acts/:actId/search?q=refusal...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${regAct.id}/search?q=refusal`);
    assert(actSearchRes.status === 200, 'GET /api/acts/:actId/search returns 200');
    assert(actSearchRes.data.data.results.length > 0, `Act-specific search returns sections (count: ${actSearchRes.data.data.results.length})`);
    assert(actSearchRes.data.data.act.heading === 'THE REGISTRATION ACT, 1908', 'Act-specific search includes Act header');
    const foundSec71 = actSearchRes.data.data.results.some(s => s.section === 'Section 71');
    assert(foundSec71, 'Search found Section 71 (Reasons for refusal to register)');

    // 9. Check IPC and BNS datasets
    console.log('\n[9] Verifying IPC and BNS records remain intact...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `IPC sections preserved: 576 (actual: ${ipcCount})`);
    assert(bnsCount === 358, `BNS sections preserved: 358 (actual: ${bnsCount})`);

    // 10. Check Idempotency and Counts
    console.log('\n[10] Verifying Act and Section database counts...');
    const regActsCount = await prisma.act.count({
      where: {
        bearerActId: civilCat.id,
        heading: 'THE REGISTRATION ACT, 1908'
      }
    });
    assert(regActsCount === 1, `Exactly 1 Registration Act record exists under Civil and Property (actual: ${regActsCount})`);

    const regSectionsCount = await prisma.actSection.count({
      where: {
        actId: regAct.id
      }
    });
    assert(regSectionsCount === 96, `Exactly 96 Registration Act section records exist (actual: ${regSectionsCount})`);

    console.log('\n================================================================');
    console.log(`  API TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during API tests:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runApiTests();
