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
const PORT = 5575;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for THE TRANSFER OF PROPERTY ACT, 1882 at', BASE_URL);

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
    const tpaAct = acts.find(a => a.heading === 'THE TRANSFER OF PROPERTY ACT, 1882');
    assert(!!tpaAct, 'The Transfer of Property Act is listed in Civil and Property category');
    assert(tpaAct.year === 1882, 'The Transfer of Property Act year is 1882');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${civilCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE TRANSFER OF PROPERTY ACT, 1882'), 'The Transfer of Property Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${tpaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE TRANSFER OF PROPERTY ACT, 1882', 'Act details heading is accurate');
    assert(singleActRes.data.data.sections.length === 148, `Act includes all 148 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections (Paginated: page 1 and page 2)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const p1 = await axios.get(`${BASE_URL}/api/acts/${tpaAct.id}/sections?page=1&limit=100`);
    assert(p1.status === 200, 'GET /api/acts/:id/sections (page 1) returns 200');
    assert(p1.data.data.length === 100, `Page 1 returned 100 sections (actual: ${p1.data.data.length})`);
    assert(p1.data.pagination.total === 148, `Total in pagination is 148 (actual: ${p1.data.pagination.total})`);
    assert(p1.data.pagination.totalPages === 2, `Total pages in pagination is 2 (actual: ${p1.data.pagination.totalPages})`);

    const p2 = await axios.get(`${BASE_URL}/api/acts/${tpaAct.id}/sections?page=2&limit=100`);
    assert(p2.status === 200, 'GET /api/acts/:id/sections (page 2) returns 200');
    assert(p2.data.data.length === 48, `Page 2 returned 48 sections (actual: ${p2.data.data.length})`);

    // Check first and last section
    const sec1 = p1.data.data[0];
    assert(sec1.section === 'Section 1', `First section on page 1 is Section 1 (actual: ${sec1.section})`);
    const sec137 = p2.data.data[p2.data.data.length - 1];
    assert(sec137.section === 'Section 137', `Last section on page 2 is Section 137 (actual: ${sec137.section})`);

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section 1 data retrieved');
    assert(singleSecRes.data.data.chapterNo === 1, 'Section 1 chapterNo is 1');

    // 7. GET /api/bearer-acts/search?q=transfer
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=transfer...');
    const searchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=transfer&limit=50`);
    assert(searchRes.status === 200, 'Search endpoint returns 200');
    assert(searchRes.data.data.length > 0, `Search returned results (count: ${searchRes.data.data.length})`);
    const hasTpa = searchRes.data.data.some(r => 
      (r.type === 'ACT' && r.act.heading.includes('TRANSFER OF PROPERTY')) ||
      (r.type === 'ACT_SECTION' && r.actSection.section)
    );
    assert(hasTpa, 'Search results include Transfer of Property Act or sections');

    // 8. Test Content Creator auth protection
    console.log('\n[8] Testing Content Creator endpoint auth protection...');
    try {
      await axios.post(`${BASE_URL}/api/content-creator/bearer-acts`, {
        type: 'ACT_SECTION',
        operation: 'CREATE',
        data: {
          actId: tpaAct.id,
          section: 'Section 999',
          chapterNo: 1,
          chapterName: 'TEST',
          title: 'Test',
          description: 'Test'
        }
      });
      assert(false, 'Should reject unauthorized content creator request');
    } catch (err) {
      assert(err.response && err.response.status === 401, 'Content Creator write without auth rejected with 401 Unauthorized');
    }

    console.log(`\n================================================================`);
    console.log(`API TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================================================`);

  } catch (error) {
    console.error('Test execution error:', error.message);
    if (error.response) console.error('Response data:', error.response.data);
    failed++;
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
    if (failed > 0) process.exit(1);
  }
}

runApiTests();
