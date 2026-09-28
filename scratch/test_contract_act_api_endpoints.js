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
const PORT = 5576;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for THE INDIAN CONTRACT ACT, 1872 at', BASE_URL);

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
    const contractAct = acts.find(a => a.heading === 'THE INDIAN CONTRACT ACT, 1872');
    assert(!!contractAct, 'The Indian Contract Act is listed in Civil and Property category');
    assert(contractAct.year === 1872, 'The Indian Contract Act year is 1872');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE INDIAN CONTRACT ACT, 1872'), 'The Indian Contract Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${contractAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE INDIAN CONTRACT ACT, 1872', 'Act details heading is accurate');
    assert(singleActRes.data.data.sections.length === 268, `Act includes all 268 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1, 2, 3)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${contractAct.id}/sections?page=1&limit=100`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections (page 1) returns 200');
    assert(p1.data.data.length === 100, `Page 1 returned 100 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 268, `Total in pagination is 268 (actual: ${p1.data.pagination.total})`);
    assert(p1.data.pagination.totalPages === 3, `Total pages in pagination is 3 (actual: ${p1.data.pagination.totalPages})`);

    const p2 = await axios.get(`${BASE_URL}/api/acts/${contractAct.id}/sections?page=2&limit=100`);
    assert(p2.status === 200, 'GET /api/acts/:id/sections (page 2) returns 200');
    assert(p2.data.data.length === 100, `Page 2 returned 100 sections (actual: ${p2.data.data.length})`);

    const p3 = await axios.get(`${BASE_URL}/api/acts/${contractAct.id}/sections?page=3&limit=100`);
    assert(p3.status === 200, 'GET /api/acts/:id/sections (page 3) returns 200');
    assert(p3.data.data.length === 68, `Page 3 returned 68 sections (actual: ${p3.data.data.length})`);

    // Check first and last section
    const sec1 = p1.data.data[0];
    assert(sec1.section === 'Section 1', `First section on page 1 is Section 1 (actual: ${sec1.section})`);
    const sec266 = p3.data.data[p3.data.data.length - 1];
    assert(sec266.section === 'Section 266', `Last section on page 3 is Section 266 (actual: ${sec266.section})`);

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 data retrieved');
    assert(singleSecRes.data.data.chapterNo === 1, 'Section 1 chapterNo is 1');

    // 7. GET /api/bearer-acts/search?q=contract
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=contract...');
    const searchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=contract&limit=50`);
    assert(searchRes.status === 200, 'Search endpoint returns 200');
    assert(searchRes.data.data.length > 0, `Search returned results (count: ${searchRes.data.data.length})`);
    const hasContract = searchRes.data.data.some(r => 
      (r.type === 'ACT' && r.act.heading.includes('CONTRACT')) ||
      (r.type === 'SECTION' && r.section.section)
    );
    assert(hasContract, 'Search results include Indian Contract Act or its sections');

    // 8. GET /api/bearer-acts/search?q=proposal
    console.log('\n[8] Testing GET /api/bearer-acts/search?q=proposal&limit=50');
    const searchPropRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=proposal&limit=50`);
    assert(searchPropRes.status === 200, 'Search for "proposal" returns 200');
    assert(searchPropRes.data.data.some(r => r.type === 'SECTION' && (r.section.title.toLowerCase().includes('proposal') || r.section.description.toLowerCase().includes('proposal'))), 'Search returns relevant section-level content for "proposal"');

    console.log(`\n================================================================`);
    console.log(`  API TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================================================`);
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
    failed++;
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
    if (failed > 0) process.exit(1);
  }
}

runApiTests();
