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
const PORT = 5597;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986';

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
    const mwprdaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!mwprdaAct, 'Act is listed in Personal category');
    assert(mwprdaAct.year === 1986, 'Act year is 1986');

    // Verify other Personal acts remain intact
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaAct = acts.find(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaAct = acts.find(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    const hmgaAct = acts.find(a => a.heading === 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956');
    const dmmaAct = acts.find(a => a.heading === 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939');
    assert(!!hmaAct, 'THE HINDU MARRIAGE ACT, 1955 is preserved under Personal');
    assert(!!hsaAct, 'THE HINDU SUCCESSION ACT, 1956 is preserved under Personal');
    assert(!!smaAct, 'THE SPECIAL MARRIAGE ACT, 1954 is preserved under Personal');
    assert(!!hmgaAct, 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 is preserved under Personal');
    assert(!!dmmaAct, 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939 is preserved under Personal');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${mwprdaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1986, 'Act year is 1986');
    assert(singleActRes.data.data.sections.length === 7, `Act details include all 7 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${mwprdaAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 7, `Returns all 7 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 7, 'Pagination total is 7');

    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        console.error(`Ordering violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted strictly by sectionOrder (1 through 7)');

    // Verify first and last section
    assert(sections[0].section === 'Section 1' && sections[0].title === 'Short title and extent', 'Section 1 is first with correct title');
    assert(sections[6].section === 'Section 7' && sections[6].title === 'Transitional provisions', 'Section 7 is last with correct title');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const sec3 = sections.find(s => s.section === 'Section 3');
    assert(!!sec3, 'Found Section 3 in sections list');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec3.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.title === 'Mahr or other properties of Muslim woman to be given to her at the time of divorce', 'Section 3 title matches');
    assert(singleSecRes.data.data.description.includes('Mahr or other properties of Muslim woman'), 'Section 3 description contains legal content');

    // 7. GET /api/bearer-acts/search?q=
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=iddat`);
    assert(globalSearchRes.status === 200, 'Global search returns 200');
    assert(globalSearchRes.data.data.length > 0, 'Search returns results for "iddat"');
    const foundMwprdaInSearch = globalSearchRes.data.data.some(item => item.act && item.act.heading === ACT_HEADING);
    assert(foundMwprdaInSearch, 'Global search finds matches in THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986');

    // 8. GET /api/acts/:actId/search?q=
    console.log('\n[8] Testing GET /api/acts/:actId/search?q=...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${mwprdaAct.id}/search?q=Wakf`);
    assert(actSearchRes.status === 200, 'Act-specific search returns 200');
    assert(actSearchRes.data.data.results.length > 0, 'Act search finds sections mentioning "Wakf"');
    assert(actSearchRes.data.data.results.some(s => s.section === 'Section 4'), 'Search specifically locates Section 4');

    // 9. Verify legacy IPC and BNS records remain intact
    console.log('\n[9] Testing legacy IPC / BNS data preservation...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount > 0, `IPCSection table has data (${ipcCount} records)`);
    assert(bnsCount > 0, `BNSSection table has data (${bnsCount} records)`);

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log(`========================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runApiTests();
