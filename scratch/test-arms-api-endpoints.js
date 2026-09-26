import express from 'express';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import axios from 'axios';
import prisma from '../src/lib/prisma.js';

const app = express();
app.use(express.json());
app.use(bearerActRoutes);
app.use(errorHandler);

let server;
const PORT = 5562;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act endpoints for THE ARMS ACT, 1959 at', BASE_URL);

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
    const criminalCat = catRes.data.data.find(c => c.name === 'Criminal');
    assert(!!criminalCat, 'Criminal BearerAct exists in categories list');

    // 2. GET /api/bearer-acts/:id
    console.log('\n[2] Testing GET /api/bearer-acts/:id...');
    const singleCatRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalCat.id}`);
    assert(singleCatRes.status === 200, 'GET /api/bearer-acts/:id returns 200');
    const acts = singleCatRes.data.data.acts;
    assert(Array.isArray(acts), 'Category includes acts array');
    const armsAct = acts.find(a => a.heading === 'THE ARMS ACT, 1959');
    assert(!!armsAct, 'The Arms Act is listed in Criminal category');
    assert(armsAct.year === 1959, 'The Arms Act year is 1959');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE ARMS ACT, 1959'), 'The Arms Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${armsAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE ARMS ACT, 1959', 'Single act heading matches');
    assert(singleActRes.data.data.sections.length === 48, 'Single act includes all 48 sections');

    // 5. GET /api/acts/:id/sections (check pagination and ordering)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${armsAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(sectionsRes.data.data.length === 48, 'Returns 48 sections in data');
    assert(sectionsRes.data.pagination.total === 48, 'Total count in pagination is 48');

    // Verify ordering
    const sections = sectionsRes.data.data;
    const expectedOrder = [
      'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5',
      'Section 6', 'Section 7', 'Section 8', 'Section 9', 'Section 10',
      'Section 11', 'Section 12', 'Section 13', 'Section 14', 'Section 15',
      'Section 16', 'Section 17', 'Section 18', 'Section 19', 'Section 20',
      'Section 21', 'Section 22', 'Section 23', 'Section 24', 'Section 24A',
      'Section 24B', 'Section 25', 'Section 26', 'Section 27', 'Section 28',
      'Section 29', 'Section 30', 'Section 31', 'Section 32', 'Section 33',
      'Section 34', 'Section 35', 'Section 36', 'Section 37', 'Section 38',
      'Section 39', 'Section 40', 'Section 41', 'Section 42', 'Section 43',
      'Section 44', 'Section 45', 'Section 46'
    ];
    const actualOrder = sections.map(s => s.section);
    assert(JSON.stringify(actualOrder) === JSON.stringify(expectedOrder), 'Sections returned in correct numeric order');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const targetSection = sections.find(s => s.section === 'Section 24A');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${targetSection.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.title === 'Prohibition as to possession of notified arms in disturbed areas, etc.', 'Section 24A title matches');
    assert(singleSecRes.data.data.actId === armsAct.id, 'Parent actId matches');

    // 7. Generic Search
    console.log('\n[7] Testing Bearer Act search endpoints...');
    const searchArms = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Arms`);
    assert(searchArms.status === 200, 'Search "Arms" returns 200');
    assert(searchArms.data.data.some(r => r.type === 'ACT' && r.act.heading.includes('ARMS')), 'Act found in search "Arms"');

    const searchFirearms = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=firearms`);
    assert(searchFirearms.status === 200, 'Search "firearms" returns 200');
    assert(searchFirearms.data.data.some(r => r.type === 'SECTION' && r.section.title.toLowerCase().includes('firearms')), 'Section found in search "firearms"');

    const search1959 = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=1959`);
    assert(search1959.status === 200, 'Search "1959" returns 200');
    assert(search1959.data.data.some(r => r.type === 'ACT' && r.act.year === 1959), 'Act found in search "1959"');

    console.log('\n================================================================');
    console.log(`API Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API Test Error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runApiTests();
