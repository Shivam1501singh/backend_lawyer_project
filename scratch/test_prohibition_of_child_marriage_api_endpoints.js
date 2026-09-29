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

const ACT_HEADING = 'THE PROHIBITION OF CHILD MARRIAGE ACT, 2006';

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
    const pcmaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!pcmaAct, 'Act is listed in Personal category');
    assert(pcmaAct.year === 2006, 'Act year is 2006');

    // Verify other Personal acts remain intact
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaAct = acts.find(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaAct = acts.find(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    const hmgaAct = acts.find(a => a.heading === 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956');
    const dvAct = acts.find(a => a.heading === 'THE PROTECTION OF WOMEN FROM DOMESTIC VIOLENCE ACT, 2005');
    assert(!!hmaAct, 'THE HINDU MARRIAGE ACT, 1955 is preserved under Personal');
    assert(!!hsaAct, 'THE HINDU SUCCESSION ACT, 1956 is preserved under Personal');
    assert(!!smaAct, 'THE SPECIAL MARRIAGE ACT, 1954 is preserved under Personal');
    assert(!!hmgaAct, 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 is preserved under Personal');
    assert(!!dvAct, 'THE PROTECTION OF WOMEN FROM DOMESTIC VIOLENCE ACT, 2005 is preserved under Personal');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${pcmaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 2006, 'Act year is 2006');
    assert(singleActRes.data.data.sections.length === 21, `Act details include all 21 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${pcmaAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 21, `Returns all 21 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 21, 'Pagination total is 21');

    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        console.error(`Ordering violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted strictly by sectionOrder (1 through 21)');

    // Verify first and last section
    assert(sections[0].section === 'Section 1' && sections[0].title === 'Short title, extent and commencement.', 'Section 1 is first with correct title');
    assert(sections[20].section === 'Section 21' && sections[20].title === 'Repeal and savings.', 'Section 21 is last with correct title');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const sec3 = sections.find(s => s.section === 'Section 3');
    assert(!!sec3, 'Found Section 3 in sections array');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec3.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 3', 'Section identifier matches Section 3');
    assert(singleSecRes.data.data.title === 'Child marriages to be voidable at the option of contracting party being a child.', 'Section 3 title matches PDF');
    assert(singleSecRes.data.data.description.includes('decree of nullity'), 'Section 3 description contains expected text');

    // 7. GET /api/bearer-acts/search?q=solemnising
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=solemnising...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=solemnising`);
    assert(globalSearchRes.status === 200, 'Global search returns 200');
    assert(globalSearchRes.data.data.some(r => r.act.heading === ACT_HEADING), 'Global search finds THE PROHIBITION OF CHILD MARRIAGE ACT, 2006');

    // 8. GET /api/acts/:actId/search?q=injunction
    console.log('\n[8] Testing GET /api/acts/:actId/search?q=injunction...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${pcmaAct.id}/search?q=injunction`);
    assert(actSearchRes.status === 200, 'Act search returns 200');
    assert(actSearchRes.data.data.results.some(s => s.section === 'Section 13'), 'Act search finds Section 13 for query "injunction"');

    // 9. Legacy IPC/BNS datasets verification
    console.log('\n[9] Testing legacy datasets preservation...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount > 500, `IPCSection table preserved with ${ipcCount} records`);
    assert(bnsCount > 350, `BNSSection table preserved with ${bnsCount} records`);

  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runApiTests();
