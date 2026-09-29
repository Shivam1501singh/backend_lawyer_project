import express from 'express';
import cookieParser from 'cookie-parser';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import axios from 'axios';
import prisma from '../src/lib/prisma.js';
import { industrialRelationsBearerActSections } from '../prisma/industrialRelationsBearerActData.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bearerActRoutes);
app.use(errorHandler);

let server;
const PORT = 5598;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE INDUSTRIAL RELATIONS CODE, 2020';

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
    const taxCat = catRes.data.data.find(c => c.name === 'Taxation, Labour & Consumer Protection');
    assert(!!taxCat, 'Taxation, Labour & Consumer Protection BearerAct exists in categories list');

    // 2. GET /api/bearer-acts/:id
    console.log('\n[2] Testing GET /api/bearer-acts/:id...');
    const singleCatRes = await axios.get(`${BASE_URL}/api/bearer-acts/${taxCat.id}`);
    assert(singleCatRes.status === 200, 'GET /api/bearer-acts/:id returns 200');
    const acts = singleCatRes.data.data.acts;
    assert(Array.isArray(acts), 'Category includes acts array');
    const targetAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!targetAct, 'Act is listed in Taxation, Labour & Consumer Protection category');
    assert(targetAct.year === 2020, 'Act year is 2020');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${taxCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${targetAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 2020, 'Act year is 2020');
    assert(singleActRes.data.data.sections.length === 104, `Act details include all 104 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (page 1 and page 2, limit max 100)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const page1Res = await axios.get(`${BASE_URL}/api/acts/${targetAct.id}/sections?page=1&limit=100`);
    assert(page1Res.status === 200, 'GET /api/acts/:id/sections?page=1&limit=100 returns 200');
    const page2Res = await axios.get(`${BASE_URL}/api/acts/${targetAct.id}/sections?page=2&limit=100`);
    assert(page2Res.status === 200, 'GET /api/acts/:id/sections?page=2&limit=100 returns 200');

    assert(page1Res.data.pagination.total === 104, 'Pagination total is 104');
    assert(page1Res.data.data.length === 100, 'Page 1 has 100 sections');
    assert(page2Res.data.data.length === 4, 'Page 2 has 4 sections');

    const sections = [...page1Res.data.data, ...page2Res.data.data];
    assert(sections.length === 104, `Combined pages return all 104 sections (actual: ${sections.length})`);

    // Check API ordering contract: chapterNo ASC, then sectionOrder ASC
    let sortedByApiContract = true;
    for (let i = 0; i < sections.length - 1; i++) {
      const current = sections[i];
      const next = sections[i + 1];
      if (current.chapterNo > next.chapterNo) {
        sortedByApiContract = false;
        console.error(`Chapter ordering violation: ${current.section} (Chapter ${current.chapterNo}) after ${next.section} (Chapter ${next.chapterNo})`);
        break;
      } else if (current.chapterNo === next.chapterNo && current.sectionOrder >= next.sectionOrder) {
        sortedByApiContract = false;
        console.error(`Section ordering violation in Chapter ${current.chapterNo}: ${current.section} (${current.sectionOrder}) after ${next.section} (${next.sectionOrder})`);
        break;
      }
    }
    assert(sortedByApiContract, 'Sections from API are sorted by API contract (chapterNo ASC, then sectionOrder ASC)');

    // 6. Detailed comparison of all 104 sections against source JSON data
    console.log('\n[6] Testing detailed section attributes against source JSON...');
    for (let i = 0; i < industrialRelationsBearerActSections.length; i++) {
      const src = industrialRelationsBearerActSections[i];
      const apiSec = sections.find(s => s.section === src.section);
      assert(!!apiSec, `Section ${src.section} present in API response`);
      if (apiSec) {
        assert(apiSec.chapterNo === src.chapterNo, `${src.section} chapterNo matches (${src.chapterNo})`);
        assert(apiSec.chapterName === src.chapterName, `${src.section} chapterName matches`);
        assert(apiSec.title === src.title, `${src.section} title matches "${src.title}"`);
        assert(apiSec.description === src.description, `${src.section} description matches exactly`);
        assert(apiSec.metaData === src.metaData, `${src.section} metaData matches`);
        assert(apiSec.metaDescription === src.metaDescription, `${src.section} metaDescription matches`);
        assert(apiSec.metaTitle === src.metaTitle, `${src.section} metaTitle matches`);
      }
    }

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
