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
const PORT = 5596;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019';

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
    const mwprAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!mwprAct, 'Act is listed in Personal category');
    assert(mwprAct.year === 2019, 'Act year is 2019');

    // Verify previously seeded Personal acts remain intact
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaAct = acts.find(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaAct = acts.find(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    const hmgaAct = acts.find(a => a.heading === 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956');
    const dmmaAct = acts.find(a => a.heading === 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939');
    const mwprdaAct = acts.find(a => a.heading === 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986');
    assert(!!hmaAct, 'THE HINDU MARRIAGE ACT, 1955 is preserved under Personal');
    assert(!!hsaAct, 'THE HINDU SUCCESSION ACT, 1956 is preserved under Personal');
    assert(!!smaAct, 'THE SPECIAL MARRIAGE ACT, 1954 is preserved under Personal');
    assert(!!hmgaAct, 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 is preserved under Personal');
    assert(!!dmmaAct, 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939 is preserved under Personal');
    assert(!!mwprdaAct, 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986 is preserved under Personal');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${mwprAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 2019, 'Act year is 2019');
    assert(singleActRes.data.data.sections.length === 8, `Act details include all 8 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${mwprAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 8, `Returns all 8 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 8, 'Pagination total is 8');

    // Check ordering
    let sorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        sorted = false;
        console.error(`Ordering violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        break;
      }
    }
    assert(sorted, 'Sections from API are sorted strictly by sectionOrder (1 through 8)');

    // Verify first and last section
    assert(sections[0].section === 'Section 1' && sections[0].title === 'Short title, extent and commencement', 'Section 1 is first with correct title');
    assert(sections[0].chapterNo === 1 && sections[0].chapterName === 'PRELIMINARY', 'Section 1 has chapter 1 PRELIMINARY');
    assert(sections[2].section === 'Section 3' && sections[2].chapterNo === 2 && sections[2].chapterName === 'DECLARATION OF TALAQ TO BE VOID AND ILLEGAL', 'Section 3 has chapter 2 DECLARATION OF TALAQ TO BE VOID AND ILLEGAL');
    assert(sections[4].section === 'Section 5' && sections[4].chapterNo === 3 && sections[4].chapterName === 'PROTECTION OF RIGHTS OF MARRIED MUSLIM WOMEN', 'Section 5 has chapter 3 PROTECTION OF RIGHTS OF MARRIED MUSLIM WOMEN');
    assert(sections[7].section === 'Section 8' && sections[7].title === 'Repeal and savings', 'Section 8 is last with correct title');

    // 6. Test specific section endpoint if exists or check single section structure
    console.log('\n[6] Testing section content accuracy against PDF...');
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1.description.includes('This Act may be called the Muslim Women (Protection of Rights on Marriage) Act, 2019.'), 'Section 1 content matches PDF');
    assert(sec1.description.includes('19th day of September, 2018'), 'Section 1 commencement date matches PDF');

    const sec3 = sections.find(s => s.section === 'Section 3');
    assert(sec3.description.includes('Any pronouncement of talaq by a Muslim husband upon his wife'), 'Section 3 content matches PDF');

    const sec4 = sections.find(s => s.section === 'Section 4');
    assert(sec4.description.includes('imprisonment for a term which may extend to three years'), 'Section 4 content matches PDF');

    const sec7 = sections.find(s => s.section === 'Section 7');
    assert(sec7.description.includes('(a) an offence punishable under this Act shall be cognizable'), 'Section 7 content matches PDF');

    console.log(`\n=== API TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API Test error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

runApiTests();
