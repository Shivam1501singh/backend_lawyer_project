import express from 'express';
import cookieParser from 'cookie-parser';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import axios from 'axios';
import prisma from '../src/lib/prisma.js';
import { constitutionBearerActSections } from '../prisma/constitutionBearerActData.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bearerActRoutes);
app.use(errorHandler);

let server;
const PORT = 5597;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'CONSTITUTION OF INDIA';

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
    const constCat = catRes.data.data.find(c => c.name === 'Constitutional and Political');
    assert(!!constCat, 'Constitutional and Political BearerAct exists in categories list');

    // 2. GET /api/bearer-acts/:id
    console.log('\n[2] Testing GET /api/bearer-acts/:id...');
    const singleCatRes = await axios.get(`${BASE_URL}/api/bearer-acts/${constCat.id}`);
    assert(singleCatRes.status === 200, 'GET /api/bearer-acts/:id returns 200');
    const acts = singleCatRes.data.data.acts;
    assert(Array.isArray(acts), 'Category includes acts array');
    const targetAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!targetAct, 'Act is listed in Constitutional and Political category');
    assert(targetAct.year === 1950, 'Act year is 1950');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${constCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${targetAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1950, 'Act year is 1950');
    assert(singleActRes.data.data.sections.length === 505, `Act details include all 505 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (testing pagination and collecting all pages)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    let allSections = [];
    let page = 1;
    let totalSections = 0;
    while (true) {
      const pageRes = await axios.get(`${BASE_URL}/api/acts/${targetAct.id}/sections?page=${page}&limit=100`);
      assert(pageRes.status === 200, `GET /api/acts/:id/sections?page=${page} returns 200`);
      totalSections = pageRes.data.pagination.total;
      allSections = allSections.concat(pageRes.data.data);
      if (page >= pageRes.data.pagination.totalPages) {
        break;
      }
      page++;
    }

    assert(allSections.length === 505, `Returns all 505 sections across pages (actual: ${allSections.length})`);
    assert(totalSections === 505, 'Pagination total is 505');

    // Check API ordering contract: chapterNo ASC, then sectionOrder ASC
    let sortedByApiContract = true;
    for (let i = 0; i < allSections.length - 1; i++) {
      const current = allSections[i];
      const next = allSections[i + 1];
      if (current.chapterNo > next.chapterNo) {
        sortedByApiContract = false;
        console.error(`Chapter ordering violation: ${current.section} (Chapter ${current.chapterNo}) after ${next.section} (Chapter ${next.chapterNo})`);
        break;
      } else if (current.chapterNo === next.chapterNo && current.sectionOrder > next.sectionOrder) {
        sortedByApiContract = false;
        console.error(`Section ordering violation in Chapter ${current.chapterNo}: ${current.section} (${current.sectionOrder}) after ${next.section} (${next.sectionOrder})`);
        break;
      }
    }
    assert(sortedByApiContract, 'Sections from API are sorted by API contract (chapterNo ASC, then sectionOrder ASC)');

    // 6. Detailed comparison of all 505 sections against source JSON data
    console.log('\n[6] Testing detailed section attributes against source JSON...');
    let allAttributesMatch = true;
    for (let i = 0; i < constitutionBearerActSections.length; i++) {
      const src = constitutionBearerActSections[i];
      const apiSec = allSections.find(s => s.section === src.section);
      if (!apiSec) {
        allAttributesMatch = false;
        console.error(`Section missing in API response: ${src.section}`);
        continue;
      }
      if (apiSec.chapterNo !== src.chapterNo ||
          apiSec.chapterName !== src.chapterName ||
          apiSec.title !== src.title ||
          apiSec.description !== src.description ||
          apiSec.metaData !== src.metaData ||
          apiSec.metaDescription !== src.metaDescription ||
          apiSec.metaTitle !== src.metaTitle) {
        allAttributesMatch = false;
        console.error(`Mismatch for ${src.section}:`, {
          expected: src,
          actual: apiSec
        });
        break;
      }
    }
    assert(allAttributesMatch, 'All 505 sections match source JSON attributes exactly');

    console.log(`\nAll API Tests Completed: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in API tests:', err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runApiTests();
