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

const ACT_HEADING = 'THE INDIAN CHRISTIAN MARRIAGE ACT, 1872';

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
    const icmaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!icmaAct, 'Act is listed in Personal category');
    assert(icmaAct.year === 1872, 'Act year is 1872');

    // Verify other Personal acts remain intact
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaAct = acts.find(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaAct = acts.find(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    assert(!!hmaAct, 'THE HINDU MARRIAGE ACT, 1955 is preserved under Personal');
    assert(!!hsaAct, 'THE HINDU SUCCESSION ACT, 1956 is preserved under Personal');
    assert(!!smaAct, 'THE SPECIAL MARRIAGE ACT, 1954 is preserved under Personal');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${icmaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1872, 'Act year is 1872');
    assert(singleActRes.data.data.sections.length === 88, `Act details include all 88 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${icmaAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 88, `Returns all 88 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 88, 'Pagination total is 88');

    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        console.error(`Ordering violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted strictly by sectionOrder (1 through 88)');

    // Verify first, middle, and last section
    assert(sections[0].section === 'Section 1' && sections[0].title === 'Short title. Extent.', 'Section 1 is first with correct title');
    assert(sections[37].section === 'Section 38' && sections[37].chapterNo === 6, 'Section 38 is under Chapter 6 (Part V)');
    assert(sections[87].section === 'Section 88' && sections[87].title === 'Non-validation of marriages within prohibited degrees', 'Section 88 is last with correct title');

    // 6. Direct DB verification of chapters and distinct chapters count
    const distinctChapters = await prisma.actSection.groupBy({
      by: ['chapterNo', 'chapterName'],
      where: { actId: icmaAct.id },
      _count: { section: true },
      orderBy: { chapterNo: 'asc' }
    });
    console.log('\n[6] Chapters Breakdown:');
    distinctChapters.forEach(ch => {
      console.log(`  Chapter ${ch.chapterNo}: ${ch.chapterName} (${ch._count.section} sections)`);
    });
    assert(distinctChapters.length === 9, `9 distinct Parts/Chapters seeded (actual: ${distinctChapters.length})`);

    // 7. GET /api/sections/:id
    console.log('\n[7] Testing GET /api/sections/:id for Section 1...');
    const section1 = sections[0];
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${section1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 details match');
    assert(singleSecRes.data.data.description.includes('Indian Christian Marriage Act, 1872'), 'Section 1 description verified');

    console.log(`\n========================================`);
    console.log(`API Tests Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API Test Error:', err.message, err.response?.data || '');
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runApiTests();
