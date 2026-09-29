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

const ACT_HEADING = 'THE PARSI MARRIAGE AND DIVORCE ACT, 1936';

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
    const parsiAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!parsiAct, 'THE PARSI MARRIAGE AND DIVORCE ACT, 1936 is listed in Personal category');
    assert(parsiAct.year === 1936, 'Act year is 1936');

    // Verify previously seeded Personal acts remain intact
    const icmaAct = acts.find(a => a.heading === 'THE INDIAN CHRISTIAN MARRIAGE ACT, 1872');
    const divorceAct = acts.find(a => a.heading === 'THE DIVORCE ACT, 1869');
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaAct = acts.find(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaAct = acts.find(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    const mwpAct = acts.find(a => a.heading === 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986');
    const mwmpAct = acts.find(a => a.heading === 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019');
    const dmmAct = acts.find(a => a.heading === 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939');
    const hmgAct = acts.find(a => a.heading === 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956');

    assert(!!icmaAct, 'THE INDIAN CHRISTIAN MARRIAGE ACT, 1872 is preserved under Personal');
    assert(!!divorceAct, 'THE DIVORCE ACT, 1869 is preserved under Personal');
    assert(!!hmaAct, 'THE HINDU MARRIAGE ACT, 1955 is preserved under Personal');
    assert(!!hsaAct, 'THE HINDU SUCCESSION ACT, 1956 is preserved under Personal');
    assert(!!smaAct, 'THE SPECIAL MARRIAGE ACT, 1954 is preserved under Personal');
    assert(!!mwpAct, 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986 is preserved');
    assert(!!mwmpAct, 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019 is preserved');
    assert(!!dmmAct, 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939 is preserved');
    assert(!!hmgAct, 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 is preserved');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${parsiAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1936, 'Act year is 1936');
    assert(singleActRes.data.data.sections.length === 55, `Act details include all 55 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${parsiAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 55, `Returns all 55 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 55, 'Pagination total is 55');

    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        console.error(`Ordering violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted strictly by sectionOrder (1, 2, ..., 32, 32A, 32B, 33, ..., 53)');

    // Verify key sections
    assert(sections[0].section === 'Section 1' && sections[0].title === 'Short title, extent and commencement.', 'Section 1 is first with correct title');
    const sec32A = sections.find(s => s.section === 'Section 32A');
    assert(!!sec32A && sec32A.chapterNo === 4, 'Section 32A is present under Chapter 4');
    const sec32B = sections.find(s => s.section === 'Section 32B');
    assert(!!sec32B && sec32B.chapterNo === 4, 'Section 32B is present under Chapter 4');
    assert(sections[54].section === 'Section 53' && sections[54].title === '[Repealed.]', 'Section 53 is last with correct title and appended Schedules');

    // 6. Direct DB verification of chapters
    const distinctChapters = await prisma.actSection.groupBy({
      by: ['chapterNo', 'chapterName'],
      where: { actId: parsiAct.id },
      _count: { section: true },
      orderBy: { chapterNo: 'asc' }
    });
    console.log('\n[6] Chapters Breakdown:');
    distinctChapters.forEach(ch => {
      console.log(`  Chapter ${ch.chapterNo}: ${ch.chapterName} (${ch._count.section} sections)`);
    });
    assert(distinctChapters.length === 6, `6 distinct Chapters seeded (actual: ${distinctChapters.length})`);

    // 7. GET /api/sections/:id
    console.log('\n[7] Testing GET /api/sections/:id for Section 1...');
    const section1 = sections[0];
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${section1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 details match');
    assert(singleSecRes.data.data.description.includes('Parsi Marriage and Divorce Act, 1936'), 'Section 1 description verified');

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
