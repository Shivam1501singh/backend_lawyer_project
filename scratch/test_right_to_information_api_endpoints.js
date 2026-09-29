import express from 'express';
import cookieParser from 'cookie-parser';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import axios from 'axios';
import prisma from '../src/lib/prisma.js';
import { rightToInformationBearerActSections } from '../prisma/rightToInformationBearerActData.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bearerActRoutes);
app.use(errorHandler);

let server;
const PORT = 5599;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE RIGHT TO INFORMATION ACT, 2005';

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
    assert(targetAct.year === 2005, 'Act year is 2005');

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
    assert(singleActRes.data.data.year === 2005, 'Act year is 2005');
    assert(singleActRes.data.data.sections.length === 31, `Act details include all 31 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${targetAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 31, `Returns all 31 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 31, 'Pagination total is 31');

    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        console.error(`Ordering violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted strictly by sectionOrder (1 through 31)');

    // 6. Detailed comparison of all 31 sections against source JSON data
    console.log('\n[6] Testing detailed section attributes against source JSON...');
    for (let i = 0; i < rightToInformationBearerActSections.length; i++) {
      const src = rightToInformationBearerActSections[i];
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
