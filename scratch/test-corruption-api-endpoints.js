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
const PORT = 5563;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act endpoints for THE PREVENTION OF CORRUPTION ACT, 1988 at', BASE_URL);

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
    const corruptionAct = acts.find(a => a.heading === 'THE PREVENTION OF CORRUPTION ACT, 1988');
    assert(!!corruptionAct, 'The Prevention of Corruption Act is listed in Criminal category');
    assert(corruptionAct.year === 1988, 'The Prevention of Corruption Act year is 1988');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE PREVENTION OF CORRUPTION ACT, 1988'), 'The Prevention of Corruption Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${corruptionAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE PREVENTION OF CORRUPTION ACT, 1988', 'Single Act heading matches');
    assert(singleActRes.data.data.year === 1988, 'Single Act year matches');

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${corruptionAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 35, `Sections count is 35 (received ${sections.length})`);
    
    // Check ordering
    let properlyOrdered = true;
    for (let i = 1; i < sections.length; i++) {
      if (sections[i].chapterNo < sections[i - 1].chapterNo || 
         (sections[i].chapterNo === sections[i - 1].chapterNo && sections[i].sectionOrder < sections[i - 1].sectionOrder)) {
        properlyOrdered = false;
        break;
      }
    }
    assert(properlyOrdered, 'Sections are strictly numerically ordered');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const firstSection = sections[0];
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${firstSection.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'First section is Section 1');
    assert(singleSecRes.data.data.chapterNo === 1, 'First section chapter is 1');
    assert(singleSecRes.data.data.chapterName === 'PRELIMINARY', 'First section chapterName is PRELIMINARY');

    // Check Section 7A
    const sec7A = sections.find(s => s.section === 'Section 7A');
    assert(!!sec7A, 'Section 7A exists');
    assert(sec7A.sectionOrder === 7.01, `Section 7A order is 7.01 (received ${sec7A?.sectionOrder})`);

    // Check Section 18A
    const sec18A = sections.find(s => s.section === 'Section 18A');
    assert(!!sec18A, 'Section 18A exists');
    assert(sec18A.chapterNo === 5, 'Section 18A chapter is 5 (IVA)');
    assert(sec18A.chapterName === 'ATTACHMENT AND FORFEITURE OF PROPERTY', 'Section 18A chapterName is ATTACHMENT AND FORFEITURE OF PROPERTY');

    // 7. GET /api/bearer-acts/search?q=corruption
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=corruption...');
    const searchRes1 = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=corruption`);
    assert(searchRes1.status === 200, 'Search endpoint returns 200');
    assert(searchRes1.data.data.some(r => r.type === 'ACT' && r.act.heading.includes('PREVENTION OF CORRUPTION')), 'Search finds Prevention of Corruption Act');

    // 8. GET /api/bearer-acts/search?q=1988
    console.log('\n[8] Testing GET /api/bearer-acts/search?q=1988...');
    const searchRes2 = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=1988`);
    assert(searchRes2.status === 200, 'Search by year 1988 returns 200');
    assert(searchRes2.data.data.some(r => r.type === 'ACT' && r.act.year === 1988), 'Search finds Act with year 1988');

    // 9. GET /api/acts/:actId/search?q=commercial
    console.log('\n[9] Testing GET /api/acts/:actId/search?q=commercial...');
    const searchRes3 = await axios.get(`${BASE_URL}/api/acts/${corruptionAct.id}/search?q=commercial`);
    assert(searchRes3.status === 200, 'Act sections search returns 200');
    assert(searchRes3.data.data.results && searchRes3.data.data.results.length > 0, 'Act sections search finds matching sections');

    console.log(`\n====================================================`);
    console.log(`API TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================\n`);

  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
    failed++;
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

runApiTests();
