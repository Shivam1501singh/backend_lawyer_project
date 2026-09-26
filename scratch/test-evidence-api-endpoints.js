import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testEvidenceEndpoints() {
  console.log('Testing Bearer Act endpoints for Indian Evidence Act at', BASE_URL);

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
    const evidenceAct = acts.find(a => a.heading === 'THE INDIAN EVIDENCE ACT, 1872');
    assert(!!evidenceAct, 'THE INDIAN EVIDENCE ACT, 1872 is listed in Criminal category');
    assert(evidenceAct.year === 1872, 'Evidence Act year is 1872');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === 'THE INDIAN EVIDENCE ACT, 1872'), 'Evidence Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${evidenceAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === 'THE INDIAN EVIDENCE ACT, 1872', 'Single act heading matches');
    assert(singleActRes.data.data.sections.length === 185, `Single act includes 185 sections (found: ${singleActRes.data.data.sections.length})`);

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
    const sectionsPage1 = await axios.get(`${BASE_URL}/api/acts/${evidenceAct.id}/sections?page=1&limit=10`);
    assert(sectionsPage1.status === 200, 'GET /api/acts/:id/sections returns 200');
    assert(sectionsPage1.data.data.length === 10, 'Page 1 has 10 sections');
    assert(sectionsPage1.data.pagination.total === 185, 'Total count is 185');
    assert(sectionsPage1.data.pagination.totalPages === 19, 'Total pages is 19');
    assert(sectionsPage1.data.data[0].section === 'Section 1', 'First section is Section 1');
    assert(sectionsPage1.data.data[9].section === 'Section 10', '10th section is Section 10');

    // 6. GET /api/sections/:id
    console.log('\n[6] Testing GET /api/sections/:id...');
    const sec1 = actSections.find(s => s.section === 'Section 1');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200');
    assert(singleSecRes.data.data.section === 'Section 1', 'Section name is Section 1');
    assert(singleSecRes.data.data.chapterName === 'PRELIMINARY', 'Chapter name is PRELIMINARY');

    // 7. GET /api/bearer-acts/search?q=Evidence
    console.log('\n[7] Testing GET /api/bearer-acts/search?q=Evidence...');
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Evidence`);
    assert(globalSearchRes.status === 200, 'GET /api/bearer-acts/search returns 200');
    const evidenceActMatch = globalSearchRes.data.data.find(r => r.type === 'ACT' && r.act.heading === 'THE INDIAN EVIDENCE ACT, 1872');
    assert(!!evidenceActMatch, 'Global search finds THE INDIAN EVIDENCE ACT, 1872');

    // 8. GET /api/acts/:actId/search?q=electronic
    console.log('\n[8] Testing GET /api/acts/:actId/search?q=electronic...');
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${evidenceAct.id}/search?q=electronic`);
    assert(actSearchRes.status === 200, 'GET /api/acts/:actId/search returns 200');
    assert(actSearchRes.data.data.results.length > 0, 'Act search finds sections with "electronic"');
    assert(actSearchRes.data.data.results.some(s => s.section === 'Section 65B'), 'Found Section 65B in search results');

    console.log(`\nAll API tests completed: ${passed} PASSED, ${failed} FAILED`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('API test failed with error:', err.response?.data || err.message);
    process.exit(1);
  }
}

testEvidenceEndpoints();
