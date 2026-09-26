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
const PORT = 5560;
const BASE_URL = `http://localhost:${PORT}`;

async function runApiTests() {
  console.log('Testing Bearer Act endpoints for THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 at', BASE_URL);

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
    const uapaAct = acts.find(a => a.heading === 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967');
    assert(!!uapaAct, 'UAPA Act is listed in Criminal category');
    assert(uapaAct.year === 1967, 'UAPA Act year is 1967');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967'), 'UAPA Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${uapaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967', 'Single act heading matches');
    assert(singleActRes.data.data.sections.length === 22, `Single act includes 22 sections (found: ${singleActRes.data.data.sections.length})`);

    // Verify ordering of sections in singleActRes
    const actSections = singleActRes.data.data.sections;
    let orderValid = true;
    for (let i = 1; i < actSections.length; i++) {
      if (actSections[i - 1].chapterNo === actSections[i].chapterNo &&
          actSections[i - 1].sectionOrder > actSections[i].sectionOrder) {
        orderValid = false;
        console.error(`Ordering mismatch: ${actSections[i-1].section} (${actSections[i-1].sectionOrder}) before ${actSections[i].section} (${actSections[i].sectionOrder})`);
      }
    }
    assert(orderValid, 'Sections in GET /api/acts/:id are strictly in ascending numeric order');

    // 5. GET /api/acts/:id/sections (pagination)
    console.log('\n[5] Testing GET /api/acts/:id/sections (page=1, limit=10)...');
    const sectionsPage1 = await axios.get(`${BASE_URL}/api/acts/${uapaAct.id}/sections?page=1&limit=10`);
    assert(sectionsPage1.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(sectionsPage1.data.data.length === 10, 'Page 1 has 10 sections');
    assert(sectionsPage1.data.pagination.total === 22, 'Total count is 22');
    assert(sectionsPage1.data.pagination.totalPages === 3, 'Total pages is 3');
    assert(sectionsPage1.data.data[0].section === 'Section 1', 'First section is Section 1');
    assert(sectionsPage1.data.data[1].section === 'Section 2', 'Second section is Section 2');
    assert(sectionsPage1.data.data[2].section === 'Section 2A', 'Third section is Section 2A');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const sec1 = actSections.find(s => s.section === 'Section 1');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section name is Section 1');
    assert(singleSecRes.data.data.chapterName === 'PRELIMINARY', 'Chapter name is PRELIMINARY');

    // 7. GET /api/bearer-acts/search with various queries
    const searchQueries = ['Unlawful', 'Activities', 'Prevention', 'Tribunal', 'Sovereignty', 'Association'];
    for (const q of searchQueries) {
      console.log(`\n[7] Testing GET /api/bearer-acts/search?q=${encodeURIComponent(q)}...`);
      const searchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=${encodeURIComponent(q)}`);
      assert(searchRes.status === 200, `Search for "${q}" returns 200`);
      assert(searchRes.data.success === true, `Search for "${q}" successful`);
      const items = searchRes.data.data;
      assert(Array.isArray(items) && items.length > 0, `Search for "${q}" returns matching results (count: ${items.length})`);
      const acts = items.filter(i => i.type === 'ACT');
      const sections = items.filter(i => i.type === 'ACT_SECTION');
      console.log(` - Query "${q}" matched: ${acts.length} acts, ${sections.length} sections, total items returned: ${items.length}`);
    }

    console.log('\n================================================================');
    console.log(`Bearer Act API Tests Finished: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================');
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Error during API tests:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

runApiTests();
