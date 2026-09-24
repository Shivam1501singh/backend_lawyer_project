import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import app from '../src/server.js';
import { signToken } from '../src/utils/jwt.js';

const prisma = new PrismaClient();
let server;
let BASE_URL;

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      console.log(`Test server running at ${BASE_URL}`);
      resolve();
    });
  });
}

async function closeServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

async function runTests() {
  console.log('=== STARTING BEARER ACTS SEARCH E2E TEST SUITE ===\n');
  await startServer();

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

  // Find or create test content creator for test fixture creation
  let creator = await prisma.contentCreator.findFirst({
    where: { email: 'trainee6@techvunex.in' }
  });

  if (!creator) {
    creator = await prisma.contentCreator.create({
      data: {
        email: 'test.creator.search@example.com',
        fullName: 'Test Search Content Creator',
        passwordHash: 'dummy'
      }
    });
  }

  const creatorToken = signToken({ id: creator.id, type: 'content_creator', role: 'CONTENT_CREATOR' });

  // Test data variables
  let testCat1Id, testCat2Id;
  let testAct1Id, testAct2Id;
  let testSec1AId, testSec1BId, testSec2AId;

  try {
    // -------------------------------------------------------------
    // Setup Test Data (2 categories, 2 acts, 3 sections)
    // -------------------------------------------------------------
    console.log('--- Setting up Isolated Search Test Fixtures ---');

    // Category 1: "Searchable Criminal Category"
    const cat1Res = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'BEARER_ACT',
        operation: 'CREATE',
        data: { name: `Searchable Criminal Category ${Date.now()}` }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    testCat1Id = cat1Res.data.data.id;
    const cat1Name = cat1Res.data.data.name;

    // Category 2: "Searchable Commercial Category"
    const cat2Res = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'BEARER_ACT',
        operation: 'CREATE',
        data: { name: `Searchable Commercial Category ${Date.now()}` }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    testCat2Id = cat2Res.data.data.id;
    const cat2Name = cat2Res.data.data.name;

    // Act 1 under Cat 1: "Searchable Penal Statute" (1988)
    const act1Res = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'ACT',
        operation: 'CREATE',
        data: {
          bearerActId: testCat1Id,
          heading: 'Searchable Penal Statute',
          act: 'Searchable Penal Code Act',
          year: 1988
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    testAct1Id = act1Res.data.data.id;

    // Act 2 under Cat 2: "Searchable Business Statute" (2013)
    const act2Res = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'ACT',
        operation: 'CREATE',
        data: {
          bearerActId: testCat2Id,
          heading: 'Searchable Business Statute',
          act: 'Searchable Companies Act',
          year: 2013
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    testAct2Id = act2Res.data.data.id;

    // Section 1A under Act 1
    const sec1ARes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'SECTION',
        operation: 'CREATE',
        data: {
          actId: testAct1Id,
          section: 'Section 420A',
          chapterNo: 17,
          chapterName: 'Offences Against Property',
          title: 'Dishonest Inducement of Property Delivery',
          description: 'Whoever cheats and thereby dishonestly induces any person to deliver property...',
          metaData: 'Cheating fraud property criminal deception',
          metaDescription: 'Detailed criminal offense definitions and punishment guidelines',
          metaTitle: 'Section 420A Property Cheating Offence'
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    testSec1AId = sec1ARes.data.data.id;

    // Section 1B under Act 1
    const sec1BRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'SECTION',
        operation: 'CREATE',
        data: {
          actId: testAct1Id,
          section: 'Section 302B',
          chapterNo: 16,
          chapterName: 'Offences Affecting Human Body',
          title: 'Punishment for Culpable Homicide',
          description: 'Whoever commits murder shall be punished with death or imprisonment...',
          metaData: 'Homicide murder bodily harm',
          metaDescription: 'Punishment for murder and criminal liability',
          metaTitle: 'Section 302B Murder'
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    testSec1BId = sec1BRes.data.data.id;

    // Section 2A under Act 2 (Commercial / Business)
    const sec2ARes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'SECTION',
        operation: 'CREATE',
        data: {
          actId: testAct2Id,
          section: 'Section 135C',
          chapterNo: 9,
          chapterName: 'Corporate Social Responsibility',
          title: 'Corporate CSR Mandate and Property Allocation',
          description: 'Every qualifying company shall allocate corporate funds and property assets for social welfare...',
          metaData: 'CSR corporate business funds compliance',
          metaDescription: 'Corporate social responsibility compliance rules',
          metaTitle: 'Section 135C CSR Mandate'
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    testSec2AId = sec2ARes.data.data.id;

    console.log('Fixtures created successfully.\n');

    // -------------------------------------------------------------
    // PART 1: Global Search Validation & Error Handling
    // -------------------------------------------------------------
    console.log('--- PART 1: Global Search - Query Validation & Error Cases ---');

    // Missing 'q' query parameter
    try {
      await axios.get(`${BASE_URL}/api/bearer-acts/search`);
      assert(false, 'Missing query param q should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Missing query parameter q rejected with 400 Bad Request');
    }

    // Empty 'q' query parameter
    try {
      await axios.get(`${BASE_URL}/api/bearer-acts/search?q=`);
      assert(false, 'Empty query param ?q= should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Empty query string ?q= rejected with 400 Bad Request');
      assert(err.response?.data.message.includes('required') || err.response?.data.message.includes('characters'), 'Helpful validation message returned');
    }

    // Whitespace-only 'q' query parameter
    try {
      await axios.get(`${BASE_URL}/api/bearer-acts/search?q=%20%20%20`);
      assert(false, 'Whitespace query param should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Whitespace-only query string rejected with 400 Bad Request');
    }

    // Single character query (minimum 2 chars required)
    try {
      await axios.get(`${BASE_URL}/api/bearer-acts/search?q=a`);
      assert(false, '1-character query should fail');
    } catch (err) {
      assert(err.response?.status === 400, '1-character query rejected with 400 Bad Request (min 2 chars required)');
    }

    // -------------------------------------------------------------
    // PART 2: Global Search - Public Access & Functionality
    // -------------------------------------------------------------
    console.log('\n--- PART 2: Global Search - Public Access & Field Matching ---');

    // 1. Search by Bearer Act Name
    const res1 = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Criminal`);
    assert(res1.status === 200, 'Global search is publicly accessible (200 OK without token)');
    assert(res1.data.success === true, 'Global search returns success: true');
    assert(Array.isArray(res1.data.data), 'Global search returns data array');
    assert(res1.data.pagination && typeof res1.data.pagination.total === 'number', 'Global search contains pagination metadata');
    const matchedBearerAct = res1.data.data.find(item => item.type === 'BEARER_ACT' && item.bearerAct.id === testCat1Id);
    assert(!!matchedBearerAct, 'Global search finds BearerAct by name (type: BEARER_ACT)');
    assert(matchedBearerAct.bearerAct.name === cat1Name, 'BearerAct details are included');

    // 2. Search by Partial Bearer Act Name
    const resPartial = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Commer`);
    const matchedPartialCat = resPartial.data.data.find(item => item.type === 'BEARER_ACT' && item.bearerAct.id === testCat2Id);
    assert(!!matchedPartialCat, 'Global search matches partial BearerAct name ("Commer" -> Commercial)');

    // 3. Search by Act Heading
    const res2 = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Penal%20Statute`);
    const matchedAct = res2.data.data.find(item => item.type === 'ACT' && item.act.id === testAct1Id);
    assert(!!matchedAct, 'Global search finds Act by heading (type: ACT)');
    assert(matchedAct.bearerAct && matchedAct.bearerAct.id === testCat1Id, 'Act result contains parent BearerAct hierarchy');
    assert(matchedAct.act.heading === 'Searchable Penal Statute', 'Act fields correctly populated');

    // 4. Search by Act Name
    const resActName = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Companies%20Act`);
    const matchedActByName = resActName.data.data.find(item => item.type === 'ACT' && item.act.id === testAct2Id);
    assert(!!matchedActByName, 'Global search finds Act by act name field');

    // 5. Search by Act Year
    const resYear = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=1988`);
    const matchedActByYear = resYear.data.data.find(item => item.type === 'ACT' && item.act.id === testAct1Id);
    assert(!!matchedActByYear, 'Global search finds Act by year (1988)');

    // 6. Search by Section Number
    const resSecNo = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=420A`);
    const matchedSecByNo = resSecNo.data.data.find(item => item.type === 'SECTION' && item.section.id === testSec1AId);
    assert(!!matchedSecByNo, 'Global search finds Section by section number (420A)');
    assert(matchedSecByNo.bearerAct && matchedSecByNo.bearerAct.id === testCat1Id, 'Section result includes parent BearerAct');
    assert(matchedSecByNo.act && matchedSecByNo.act.id === testAct1Id, 'Section result includes parent Act');
    assert(matchedSecByNo.section.section === 'Section 420A', 'Section details correctly populated');

    // 7. Search by Chapter Name
    const resChap = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Offences%20Against%20Property`);
    const matchedSecByChap = resChap.data.data.find(item => item.type === 'SECTION' && item.section.id === testSec1AId);
    assert(!!matchedSecByChap, 'Global search finds Section by chapterName');

    // 8. Search by Section Title
    const resTitle = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Culpable%20Homicide`);
    const matchedSecByTitle = resTitle.data.data.find(item => item.type === 'SECTION' && item.section.id === testSec1BId);
    assert(!!matchedSecByTitle, 'Global search finds Section by title');

    // 9. Search by Section Description
    const resDesc = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=dishonestly%20induces`);
    const matchedSecByDesc = resDesc.data.data.find(item => item.type === 'SECTION' && item.section.id === testSec1AId);
    assert(!!matchedSecByDesc, 'Global search finds Section by description');

    // 10. Search by MetaData, MetaDescription, MetaTitle
    const resMeta = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=deception`);
    const matchedSecByMeta = resMeta.data.data.find(item => item.type === 'SECTION' && item.section.id === testSec1AId);
    assert(!!matchedSecByMeta, 'Global search finds Section by metaData keyword');

    const resMetaDesc = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=liability`);
    const matchedSecByMetaDesc = resMetaDesc.data.data.find(item => item.type === 'SECTION' && item.section.id === testSec1BId);
    assert(!!matchedSecByMetaDesc, 'Global search finds Section by metaDescription');

    const resMetaTitle = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Mandate`);
    const matchedSecByMetaTitle = resMetaTitle.data.data.find(item => item.type === 'SECTION' && item.section.id === testSec2AId);
    assert(!!matchedSecByMetaTitle, 'Global search finds Section by metaTitle');

    // -------------------------------------------------------------
    // PART 3: Case-Insensitivity & Deterministic Hierarchy Ordering
    // -------------------------------------------------------------
    console.log('\n--- PART 3: Global Search - Case-Insensitivity & Hierarchy Ordering ---');

    const resUpper = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=PROPERTY`);
    const resLower = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=property`);
    const resMixed = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=PrOpErTy`);

    assert(resUpper.data.pagination.total === resLower.data.pagination.total, 'Case-insensitive: UPPER vs lower return identical total count');
    assert(resLower.data.pagination.total === resMixed.data.pagination.total, 'Case-insensitive: mixed vs lower return identical total count');

    // Check result ordering: BearerAct -> Act -> Section
    const typeOrder = resLower.data.data.map(item => item.type);
    let orderValid = true;
    let seenAct = false;
    let seenSection = false;
    for (const t of typeOrder) {
      if (t === 'BEARER_ACT') {
        if (seenAct || seenSection) orderValid = false;
      } else if (t === 'ACT') {
        seenAct = true;
        if (seenSection) orderValid = false;
      } else if (t === 'SECTION') {
        seenSection = true;
      }
    }
    assert(orderValid, 'Global search results are deterministically ordered (BEARER_ACT -> ACT -> SECTION)');

    // -------------------------------------------------------------
    // PART 4: Global Search - Pagination Verification
    // -------------------------------------------------------------
    console.log('\n--- PART 4: Global Search - Pagination Verification ---');

    const page1Res = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=property&page=1&limit=2`);
    assert(page1Res.status === 200, 'Page 1 request successful');
    assert(page1Res.data.data.length <= 2, 'Page 1 returns at most limit (2) items');
    assert(page1Res.data.pagination.page === 1, 'Pagination page is 1');
    assert(page1Res.data.pagination.limit === 2, 'Pagination limit is 2');
    assert(page1Res.data.pagination.totalPages >= 2, 'Pagination totalPages computed correctly');

    if (page1Res.data.pagination.totalPages > 1) {
      const page2Res = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=property&page=2&limit=2`);
      assert(page2Res.status === 200, 'Page 2 request successful');
      assert(page2Res.data.data.length > 0, 'Page 2 returns items');
      assert(page2Res.data.pagination.page === 2, 'Pagination page is 2');
      // Ensure no duplicates between page 1 and page 2
      const page1Ids = page1Res.data.data.map(i => (i.bearerAct || i.act || i.section).id);
      const page2Ids = page2Res.data.data.map(i => (i.bearerAct || i.act || i.section).id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      assert(overlap.length === 0, 'Pagination slices database records without duplication between pages');
    }

    // -------------------------------------------------------------
    // PART 5: Act-Specific Search Validation & Error Handling
    // -------------------------------------------------------------
    console.log('\n--- PART 5: Act-Specific Search - Validation & Error Handling ---');

    // Invalid Act ID (404 Not Found)
    try {
      await axios.get(`${BASE_URL}/api/acts/00000000-0000-0000-0000-000000000000/search?q=property`);
      assert(false, 'Search with non-existent actId should return 404');
    } catch (err) {
      assert(err.response?.status === 404, 'Non-existent actId returns 404 Not Found');
      assert(err.response?.data.message === 'Act not found', 'Returns "Act not found" message');
    }

    // Missing query param on Act-specific search
    try {
      await axios.get(`${BASE_URL}/api/acts/${testAct1Id}/search`);
      assert(false, 'Missing query on Act-specific search should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Missing query param on Act search returns 400 Bad Request');
    }

    // Empty query param on Act-specific search
    try {
      await axios.get(`${BASE_URL}/api/acts/${testAct1Id}/search?q=`);
      assert(false, 'Empty query on Act-specific search should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Empty query param on Act search returns 400 Bad Request');
    }

    // Single character query on Act-specific search
    try {
      await axios.get(`${BASE_URL}/api/acts/${testAct1Id}/search?q=z`);
      assert(false, '1-character query on Act-specific search should fail');
    } catch (err) {
      assert(err.response?.status === 400, '1-character query on Act search returns 400 Bad Request');
    }

    // -------------------------------------------------------------
    // PART 6: Act-Specific Search - Isolation & Field Matching
    // -------------------------------------------------------------
    console.log('\n--- PART 6: Act-Specific Search - Scope & Act Isolation ---');

    // Search for "property" in Act 1
    // Act 1 has Section 420A (contains property). Act 2 has Section 135C (also contains property).
    const act1SearchRes = await axios.get(`${BASE_URL}/api/acts/${testAct1Id}/search?q=property`);
    assert(act1SearchRes.status === 200, 'Act-specific search returns 200 OK without auth');
    assert(act1SearchRes.data.success === true, 'Act-specific search returns success: true');
    assert(act1SearchRes.data.data.act.id === testAct1Id, 'Response includes target Act details');
    assert(act1SearchRes.data.data.act.heading === 'Searchable Penal Statute', 'Act heading is accurate');
    assert(Array.isArray(act1SearchRes.data.data.results), 'Results array present');

    const act1ResultIds = act1SearchRes.data.data.results.map(r => r.id);
    assert(act1ResultIds.includes(testSec1AId), 'Act 1 search matches Section 420A');
    assert(!act1ResultIds.includes(testSec2AId), 'CRITICAL: Act 1 search DOES NOT include Section 135C from Act 2 (Strict Act Isolation)');

    // Search for "property" in Act 2
    const act2SearchRes = await axios.get(`${BASE_URL}/api/acts/${testAct2Id}/search?q=property`);
    assert(act2SearchRes.status === 200, 'Act 2 search returns 200 OK');
    const act2ResultIds = act2SearchRes.data.data.results.map(r => r.id);
    assert(act2ResultIds.includes(testSec2AId), 'Act 2 search matches Section 135C');
    assert(!act2ResultIds.includes(testSec1AId), 'CRITICAL: Act 2 search DOES NOT include Section 420A from Act 1 (Strict Act Isolation)');

    // Search by chapterName within Act 1
    const actChapRes = await axios.get(`${BASE_URL}/api/acts/${testAct1Id}/search?q=Human%20Body`);
    assert(actChapRes.data.data.results.some(r => r.id === testSec1BId), 'Act-specific search finds Section by chapterName');

    // Search by description within Act 1
    const actDescRes = await axios.get(`${BASE_URL}/api/acts/${testAct1Id}/search?q=imprisonment`);
    assert(actDescRes.data.data.results.some(r => r.id === testSec1BId), 'Act-specific search finds Section by description');

    // Act-specific search pagination
    const actPagRes = await axios.get(`${BASE_URL}/api/acts/${testAct1Id}/search?q=offences&page=1&limit=1`);
    assert(actPagRes.data.data.results.length === 1, 'Act-specific pagination limit=1 respected');
    assert(actPagRes.data.pagination.page === 1, 'Act-specific pagination page is 1');
    assert(actPagRes.data.pagination.limit === 1, 'Act-specific pagination limit is 1');
    assert(actPagRes.data.pagination.total === 2, 'Act-specific total matches 2 sections in Act 1');
    assert(actPagRes.data.pagination.totalPages === 2, 'Act-specific totalPages is 2');

    // -------------------------------------------------------------
    // PART 7: Security & SQL Injection Protection
    // -------------------------------------------------------------
    console.log('\n--- PART 7: Security & Parameterization Verification ---');

    // Test with SQL injection payloads - should be treated as literal search strings and return empty / safe results
    const sqlPayloads = [
      "' OR 1=1 --",
      "\" OR '1'='1",
      "'; DROP TABLE \"ActSection\"; --",
      "UNION SELECT * FROM \"User\" --"
    ];

    for (const payload of sqlPayloads) {
      const sqlRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=${encodeURIComponent(payload)}`);
      assert(sqlRes.status === 200, `Safe handling of SQL payload: ${payload}`);
      assert(sqlRes.data.success === true, 'SQL injection query returns standard safe JSON response');
    }

  } catch (unexpectedError) {
    console.error('Unexpected test failure:', unexpectedError.response?.data || unexpectedError);
    failed++;
  } finally {
    // -------------------------------------------------------------
    // Cleanup Test Data
    // -------------------------------------------------------------
    console.log('\n--- Test Cleanup ---');
    try {
      if (testCat1Id) {
        await prisma.bearerAct.delete({ where: { id: testCat1Id } });
        console.log(`Cleaned up test category 1: ${testCat1Id}`);
      }
      if (testCat2Id) {
        await prisma.bearerAct.delete({ where: { id: testCat2Id } });
        console.log(`Cleaned up test category 2: ${testCat2Id}`);
      }
    } catch (cleanErr) {
      console.error('Cleanup error:', cleanErr.message);
    }

    await prisma.$disconnect();
    await closeServer();

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
