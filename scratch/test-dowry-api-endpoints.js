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
const PORT = 5561;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act endpoints for THE DOWRY PROHIBITION ACT, 1961 at', BASE_URL);

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
    const dowryAct = acts.find(a => a.heading === 'THE DOWRY PROHIBITION ACT, 1961');
    assert(!!dowryAct, 'Dowry Prohibition Act is listed in Criminal category');
    assert(dowryAct.year === 1961, 'Dowry Prohibition Act year is 1961');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE DOWRY PROHIBITION ACT, 1961'), 'Dowry Prohibition Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${dowryAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE DOWRY PROHIBITION ACT, 1961', 'Single act heading matches');
    assert(singleActRes.data.data.sections.length === 13, 'Single act includes all 13 sections');

    // 5. GET /api/acts/:id/sections (check pagination and ordering)
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${dowryAct.id}/sections?limit=50`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(sectionsRes.data.data.length === 13, 'Returns 13 sections in data');
    assert(sectionsRes.data.pagination.total === 13, 'Total count in pagination is 13');

    // Verify ordering
    const sections = sectionsRes.data.data;
    const expectedOrder = [
      'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 4A',
      'Section 5', 'Section 6', 'Section 7', 'Section 8', 'Section 8A',
      'Section 8B', 'Section 9', 'Section 10'
    ];
    const actualOrder = sections.map(s => s.section);
    assert(JSON.stringify(actualOrder) === JSON.stringify(expectedOrder), 'Sections returned in correct numeric order');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const targetSection = sections.find(s => s.section === 'Section 4A');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${targetSection.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.title === 'Ban on advertisement', 'Section 4A title matches');
    assert(singleSecRes.data.data.actId === dowryAct.id, 'Parent actId matches');

    // 7. Generic Search
    console.log('\n[7] Testing Bearer Act search endpoints...');
    const searchDowry = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Dowry`);
    assert(searchDowry.status === 200, 'Search "Dowry" returns 200');
    assert(searchDowry.data.data.some(r => r.type === 'ACT' && r.act.heading.includes('DOWRY')), 'Act found in search "Dowry"');

    const searchProhibition = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Prohibition`);
    assert(searchProhibition.status === 200, 'Search "Prohibition" returns 200');
    assert(searchProhibition.data.data.some(r => r.type === 'ACT' && r.act.heading.includes('DOWRY')), 'Act found in search "Prohibition"');

    const search1961 = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=1961`);
    assert(search1961.status === 200, 'Search "1961" returns 200');
    assert(search1961.data.data.some(r => r.type === 'ACT' && r.act.year === 1961), 'Act found in search "1961"');

    const searchSection = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=advertisement`);
    assert(searchSection.status === 200, 'Search "advertisement" returns 200');
    assert(searchSection.data.data.some(r => r.type === 'SECTION' && r.section.section === 'Section 4A'), 'Section 4A found in section search');

    console.log(`\n================================================================`);
    console.log(`API TEST RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`================================================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API Test execution error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

runApiTests();
