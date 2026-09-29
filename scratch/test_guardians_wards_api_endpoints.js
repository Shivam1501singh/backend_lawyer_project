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
const PORT = 5599;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE GUARDIANS AND WARDS ACT, 1890';

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
    const gwAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!gwAct, 'THE GUARDIANS AND WARDS ACT, 1890 is listed in Personal category');
    assert(gwAct.year === 1890, 'Act year is 1890');

    // Verify previously seeded Personal acts remain intact
    const parsiAct = acts.find(a => a.heading === 'THE PARSI MARRIAGE AND DIVORCE ACT, 1936');
    const icmaAct = acts.find(a => a.heading === 'THE INDIAN CHRISTIAN MARRIAGE ACT, 1872');
    const divorceAct = acts.find(a => a.heading === 'THE DIVORCE ACT, 1869');
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaAct = acts.find(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaAct = acts.find(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    const mwpAct = acts.find(a => a.heading === 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986');
    const mwmpAct = acts.find(a => a.heading === 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019');
    const dmmAct = acts.find(a => a.heading === 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939');
    const hmgAct = acts.find(a => a.heading === 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956');

    assert(!!parsiAct, 'THE PARSI MARRIAGE AND DIVORCE ACT, 1936 is preserved under Personal');
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
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${gwAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1890, 'Act year is 1890');
    assert(singleActRes.data.data.sections.length === 55, `Act details include all 55 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${gwAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 55, `Returns all 55 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 55, 'Pagination total is 55');

    // Check ordering
    let sorted = true;
    for (let i = 1; i < sections.length; i++) {
      if (sections[i].sectionOrder < sections[i - 1].sectionOrder) {
        sorted = false;
        console.error(`Sort error: section ${sections[i].section} (order ${sections[i].sectionOrder}) came after ${sections[i - 1].section} (order ${sections[i - 1].sectionOrder})`);
      }
    }
    assert(sorted, 'Sections are sorted correctly by sectionOrder');

    // Spot check section 4A and 34A ordering
    const sec4Index = sections.findIndex(s => s.section === 'Section 4');
    const sec4AIndex = sections.findIndex(s => s.section === 'Section 4A');
    const sec5Index = sections.findIndex(s => s.section === 'Section 5');
    assert(sec4Index < sec4AIndex && sec4AIndex < sec5Index, 'Section 4A is ordered between Section 4 and Section 5');

    const sec34Index = sections.findIndex(s => s.section === 'Section 34');
    const sec34AIndex = sections.findIndex(s => s.section === 'Section 34A');
    const sec35Index = sections.findIndex(s => s.section === 'Section 35');
    assert(sec34Index < sec34AIndex && sec34AIndex < sec35Index, 'Section 34A is ordered between Section 34 and Section 35');

    // 6. Check specific section content fidelity
    console.log('\n[6] Spot-checking section content...');
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1 && sec1.chapterNo === 1 && sec1.chapterName === 'PRELIMINARY' && sec1.title === 'Title, extent and commencement.', 'Section 1 verified');

    const sec4 = sections.find(s => s.section === 'Section 4');
    assert(sec4 && sec4.description.includes('“minor” means a person who'), 'Section 4 definition verified');

    const sec53 = sections.find(s => s.section === 'Section 53');
    assert(sec53 && sec53.chapterNo === 4 && sec53.description.includes('THE SCHEDULE.—[Enactments repealed.]'), 'Section 53 and Schedule verified');

    // 7. Check chapter distribution
    const chapter1 = sections.filter(s => s.chapterNo === 1);
    const chapter2 = sections.filter(s => s.chapterNo === 2);
    const chapter3 = sections.filter(s => s.chapterNo === 3);
    const chapter4 = sections.filter(s => s.chapterNo === 4);

    assert(chapter1.length === 5, `Chapter I has 5 sections (actual: ${chapter1.length})`);
    assert(chapter2.length === 15, `Chapter II has 15 sections (actual: ${chapter2.length})`);
    assert(chapter3.length === 24, `Chapter III has 24 sections (actual: ${chapter3.length})`);
    assert(chapter4.length === 11, `Chapter IV has 11 sections (actual: ${chapter4.length})`);

    console.log(`\n========================================`);
    console.log(`API Tests Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runApiTests();
