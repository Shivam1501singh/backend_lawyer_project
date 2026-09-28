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
const PORT = 5588;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for THE SALE OF GOODS ACT, 1930 at', BASE_URL);

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
    const sogAct = acts.find(a => a.heading === 'THE SALE OF GOODS ACT, 1930');
    assert(!!sogAct, 'The Sale of Goods Act is listed in Civil and Property category');
    assert(sogAct.year === 1930, 'The Sale of Goods Act year is 1930');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE SALE OF GOODS ACT, 1930'), 'The Sale of Goods Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${sogAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE SALE OF GOODS ACT, 1930', 'Act details heading is accurate');
    assert(singleActRes.data.data.sections.length === 67, `Act includes all 67 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${sogAct.id}/sections?page=1&limit=100`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(p1.data.data.length === 67, `Page 1 returned 67 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 67, `Total in pagination is 67 (actual: ${p1.data.pagination.total})`);

    // Check numerical ordering
    const sections = p1.data.data;
    let isSorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder > sections[i + 1].sectionOrder) {
        isSorted = false;
        console.error(`Ordering mismatch: ${sections[i].section} (${sections[i].sectionOrder}) before ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
      }
    }
    assert(isSorted, 'Sections are strictly sorted in correct numeric order');

    const sec1 = sections[0];
    assert(sec1.section === 'Section 1', `First section is Section 1 (actual: ${sec1.section})`);
    const sec64A = sections.find(s => s.section === 'Section 64A');
    assert(!!sec64A, 'Section 64A exists in returned sections');
    assert(sec64A.sectionOrder === 64.01, `Section 64A order is 64.01 (actual: ${sec64A.sectionOrder})`);
    const sec66 = sections[sections.length - 1];
    assert(sec66.section === 'Section 66', `Last section is Section 66 (actual: ${sec66.section})`);

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 data retrieved');
    assert(singleSecRes.data.data.chapterNo === 1, 'Section 1 chapterNo is 1');

    // 7. GET /api/bearer-acts/search?q=unpaid seller
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=unpaid seller...');
    const searchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=unpaid+seller&limit=50`);
    assert(searchRes.status === 200, 'Search endpoint returns 200');
    assert(searchRes.data.data.length > 0, `Search returned results (count: ${searchRes.data.data.length})`);
    const hasSogMatch = searchRes.data.data.some(
      item => item.act?.heading === 'THE SALE OF GOODS ACT, 1930' || item.title?.toLowerCase().includes('unpaid seller') || item.description?.toLowerCase().includes('unpaid seller')
    );
    assert(hasSogMatch, 'Search results contain Sale of Goods Act sections');

    // 8. GET /api/acts/:actId/search?q=stoppage
    console.log('\n[8] Testing GET /api/acts/:actId/search?q=stoppage...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${sogAct.id}/search?q=stoppage`);
    assert(actSearchRes.status === 200, 'Act search endpoint returns 200');
    assert(actSearchRes.data.data.results.length > 0, `Act search found stoppage sections (count: ${actSearchRes.data.data.results.length})`);

    // 9. Check IPC and BNS datasets
    console.log('\n[9] Verifying IPC and BNS records remain intact...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `IPC sections preserved: 576 (actual: ${ipcCount})`);
    assert(bnsCount === 358, `BNS sections preserved: 358 (actual: ${bnsCount})`);

    // 10. Check Idempotency and Counts
    console.log('\n[10] Verifying Act and Section database counts...');
    const sogActsCount = await prisma.act.count({
      where: {
        bearerActId: civilCat.id,
        heading: 'THE SALE OF GOODS ACT, 1930'
      }
    });
    assert(sogActsCount === 1, `Exactly 1 Sale of Goods Act record exists under Civil and Property (actual: ${sogActsCount})`);

    const sogSectionsCount = await prisma.actSection.count({
      where: {
        actId: sogAct.id
      }
    });
    assert(sogSectionsCount === 67, `Exactly 67 Sale of Goods Act section records exist (actual: ${sogSectionsCount})`);

    // Check distinct chapters
    const chapters = await prisma.actSection.findMany({
      where: { actId: sogAct.id },
      select: { chapterNo: true, chapterName: true },
      distinct: ['chapterNo']
    });
    assert(chapters.length === 7, `All 7 chapters are present (actual: ${chapters.length})`);

    console.log(`\n================================================================`);
    console.log(`  API TEST SUMMARY: ${passed + failed} TOTAL | ${passed} PASSED | ${failed} FAILED`);
    console.log(`================================================================\n`);
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runApiTests();
