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
const PORT = 5578;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for THE LIMITATION ACT, 1963 at', BASE_URL);

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
    const limitationAct = acts.find(a => a.heading === 'THE LIMITATION ACT, 1963');
    assert(!!limitationAct, 'The Limitation Act is listed in Civil and Property category');
    assert(limitationAct.year === 1963, 'The Limitation Act year is 1963');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE LIMITATION ACT, 1963'), 'The Limitation Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${limitationAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE LIMITATION ACT, 1963', 'Act details heading is accurate');
    assert(singleActRes.data.data.sections.length === 32, `Act includes all 32 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${limitationAct.id}/sections?page=1&limit=50`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(p1.data.data.length === 32, `Page 1 returned 32 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 32, `Total in pagination is 32 (actual: ${p1.data.pagination.total})`);

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
    const sec32 = sections[sections.length - 1];
    assert(sec32.section === 'Section 32', `Last section is Section 32 (actual: ${sec32.section})`);

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 data retrieved');
    assert(singleSecRes.data.data.chapterNo === 1, 'Section 1 chapterNo is 1');

    // 7. GET /api/bearer-acts/search?q=limitation
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=limitation...');
    const searchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=limitation&limit=50`);
    assert(searchRes.status === 200, 'Search endpoint returns 200');
    assert(searchRes.data.data.length > 0, `Search returned results (count: ${searchRes.data.data.length})`);
    const hasLimitationMatch = searchRes.data.data.some(
      item => item.act?.heading === 'THE LIMITATION ACT, 1963' || item.title?.includes('limitation') || item.description?.includes('limitation')
    );
    assert(hasLimitationMatch, 'Search results contain Limitation Act sections');

    // 8. GET /api/acts/:actId/search?q=easement
    console.log('\n[8] Testing GET /api/acts/:actId/search?q=easement...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${limitationAct.id}/search?q=easement`);
    assert(actSearchRes.status === 200, 'Act search endpoint returns 200');
    assert(actSearchRes.data.data.results.length > 0, `Act search found easement sections (count: ${actSearchRes.data.data.results.length})`);

    // 9. Check IPC and BNS datasets
    console.log('\n[9] Verifying IPC and BNS records remain intact...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `IPC sections preserved: 576 (actual: ${ipcCount})`);
    assert(bnsCount === 358, `BNS sections preserved: 358 (actual: ${bnsCount})`);

    // 10. Check Idempotency and Counts
    console.log('\n[10] Verifying Act and Section database counts...');
    const limitationActsCount = await prisma.act.count({
      where: {
        bearerActId: civilCat.id,
        heading: 'THE LIMITATION ACT, 1963'
      }
    });
    assert(limitationActsCount === 1, `Exactly 1 Limitation Act record exists under Civil and Property (actual: ${limitationActsCount})`);

    const limitationSectionsCount = await prisma.actSection.count({
      where: {
        actId: limitationAct.id
      }
    });
    assert(limitationSectionsCount === 32, `Exactly 32 Limitation Act section records exist (actual: ${limitationSectionsCount})`);

    // Check distinct chapters
    const chapters = await prisma.actSection.findMany({
      where: { actId: limitationAct.id },
      select: { chapterNo: true, chapterName: true },
      distinct: ['chapterNo']
    });
    assert(chapters.length === 5, `All 5 chapters are present (actual: ${chapters.length})`);

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
