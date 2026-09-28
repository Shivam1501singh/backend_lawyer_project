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
const PORT = 5577;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for THE SPECIFIC RELIEF ACT, 1963 at', BASE_URL);

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
    const sraAct = acts.find(a => a.heading === 'THE SPECIFIC RELIEF ACT, 1963');
    assert(!!sraAct, 'The Specific Relief Act is listed in Civil and Property category');
    assert(sraAct.year === 1963, 'The Specific Relief Act year is 1963');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE SPECIFIC RELIEF ACT, 1963'), 'The Specific Relief Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${sraAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE SPECIFIC RELIEF ACT, 1963', 'Act details heading is accurate');
    assert(singleActRes.data.data.sections.length === 48, `Act includes all 48 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${sraAct.id}/sections?page=1&limit=50`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(p1.data.data.length === 48, `Page 1 returned 48 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 48, `Total in pagination is 48 (actual: ${p1.data.pagination.total})`);

    // Check first and last section
    const sec1 = p1.data.data[0];
    assert(sec1.section === 'Section 1', `First section on page 1 is Section 1 (actual: ${sec1.section})`);
    const sec44 = p1.data.data[p1.data.data.length - 1];
    assert(sec44.section === 'Section 44', `Last section on page 1 is Section 44 (actual: ${sec44.section})`);

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 data retrieved');
    assert(singleSecRes.data.data.chapterNo === 1, 'Section 1 chapterNo is 1');

    // 7. GET /api/bearer-acts/search?q=specific
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=specific...');
    const searchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=specific&limit=50`);
    assert(searchRes.status === 200, 'Search endpoint returns 200');
    assert(searchRes.data.data.length > 0, `Search returned results (count: ${searchRes.data.data.length})`);
    const hasSraMatch = searchRes.data.data.some(
      item => item.act?.heading === 'THE SPECIFIC RELIEF ACT, 1963' || item.title?.includes('Specific') || item.description?.includes('Specific')
    );
    assert(hasSraMatch, 'Search results contain Specific Relief Act sections');

    console.log(`\n================================================================`);
    console.log(`  API TEST SUMMARY: ${passed + failed} TOTAL | ${passed} PASSED | ${failed} FAILED`);
    console.log(`================================================================\n`);
  } catch (err) {
    console.error('API Test Error:', err?.response?.data || err.message);
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
