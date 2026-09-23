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
  console.log('=== STARTING BEARER ACTS E2E TEST SUITE ===\n');
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

  // Find or create test users
  let creator = await prisma.contentCreator.findFirst({
    where: { email: 'trainee6@techvunex.in' }
  });

  if (!creator) {
    creator = await prisma.contentCreator.create({
      data: {
        email: 'test.creator.bearer@example.com',
        fullName: 'Test Content Creator',
        passwordHash: 'dummy'
      }
    });
  }

  let user = await prisma.user.findFirst();
  let advocate = await prisma.advocate.findFirst();

  const creatorToken = signToken({ id: creator.id, type: 'content_creator', role: 'CONTENT_CREATOR' });
  const userToken = signToken({ id: user.id, type: 'user', role: 'USER' });
  const advocateToken = signToken({ id: advocate.id, type: 'advocate', role: 'ADVOCATE' });

  let testBearerActId;
  let testActId;
  let testSectionId;

  try {
    // -------------------------------------------------------------
    // 1. Authorization: Reject Unauthenticated Write
    // -------------------------------------------------------------
    console.log('\n--- 1. Security & Role Authorization ---');
    try {
      await axios.post(`${BASE_URL}/api/content-creator/bearer-acts`, {
        type: 'BEARER_ACT',
        operation: 'CREATE',
        data: { name: 'Unauthorized Category' }
      });
      assert(false, 'Unauthenticated write should have been rejected');
    } catch (err) {
      assert(err.response?.status === 401, 'Unauthenticated write rejected with 401');
    }

    // -------------------------------------------------------------
    // 2. Authorization: Reject Normal User Write
    // -------------------------------------------------------------
    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'BEARER_ACT',
          operation: 'CREATE',
          data: { name: 'User Created Category' }
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      assert(false, 'User write should have been rejected');
    } catch (err) {
      assert(err.response?.status === 403, 'Normal User write rejected with 403 Forbidden');
    }

    // -------------------------------------------------------------
    // 3. Authorization: Reject Advocate Write
    // -------------------------------------------------------------
    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'BEARER_ACT',
          operation: 'CREATE',
          data: { name: 'Advocate Created Category' }
        },
        { headers: { Authorization: `Bearer ${advocateToken}` } }
      );
      assert(false, 'Advocate write should have been rejected');
    } catch (err) {
      assert(err.response?.status === 403, 'Advocate write rejected with 403 Forbidden');
    }

    // -------------------------------------------------------------
    // 4. Invalid Operation & Entity Type Validation
    // -------------------------------------------------------------
    console.log('\n--- 2. Request Validation & Rejections ---');
    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'INVALID_TYPE',
          operation: 'CREATE',
          data: { name: 'Test' }
        },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      assert(false, 'Invalid entity type should have failed');
    } catch (err) {
      assert(err.response?.status === 400, 'Invalid entity type rejected with 400 Bad Request');
    }

    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'BEARER_ACT',
          operation: 'DELETE',
          data: { name: 'Test' }
        },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      assert(false, 'DELETE operation should have failed');
    } catch (err) {
      assert(err.response?.status === 400, 'Invalid operation (DELETE) rejected with 400 Bad Request');
    }

    // -------------------------------------------------------------
    // 5. Create Bearer Act Category (Content Creator)
    // -------------------------------------------------------------
    console.log('\n--- 3. Content Creator: BearerAct Operations ---');
    const uniqueCategoryName = `Test Legal Category ${Date.now()}`;
    const createCatRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'BEARER_ACT',
        operation: 'CREATE',
        data: { name: uniqueCategoryName }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );

    assert(createCatRes.status === 201, 'BearerAct created with 201 Created');
    assert(createCatRes.data.data.name === uniqueCategoryName, 'BearerAct name matches input');
    testBearerActId = createCatRes.data.data.id;

    // -------------------------------------------------------------
    // 6. Duplicate Bearer Act Category Prevention
    // -------------------------------------------------------------
    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'BEARER_ACT',
          operation: 'CREATE',
          data: { name: uniqueCategoryName }
        },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      assert(false, 'Duplicate category creation should have failed');
    } catch (err) {
      assert(err.response?.status === 400, 'Duplicate BearerAct rejected with 400 Bad Request');
      assert(err.response?.data.message.includes('already exists'), 'Error message states category already exists');
    }

    // -------------------------------------------------------------
    // 7. Update Bearer Act Category
    // -------------------------------------------------------------
    const updatedCategoryName = `${uniqueCategoryName} (Updated)`;
    const updateCatRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'BEARER_ACT',
        operation: 'UPDATE',
        data: {
          id: testBearerActId,
          name: updatedCategoryName
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );

    assert(updateCatRes.status === 200, 'BearerAct updated with 200 OK');
    assert(updateCatRes.data.data.name === updatedCategoryName, 'BearerAct updated name matches');

    // -------------------------------------------------------------
    // 8. Act Operations: Parent Validation
    // -------------------------------------------------------------
    console.log('\n--- 4. Content Creator: Act Operations ---');
    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'ACT',
          operation: 'CREATE',
          data: {
            bearerActId: '00000000-0000-0000-0000-000000000000',
            heading: 'Non-existent Parent Act',
            act: 'Non-existent Act',
            year: 2026
          }
        },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      assert(false, 'Act with non-existent parent should fail');
    } catch (err) {
      assert(err.response?.status === 404, 'Act creation with invalid bearerActId rejected with 404 Not Found');
    }

    // Invalid year check
    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'ACT',
          operation: 'CREATE',
          data: {
            bearerActId: testBearerActId,
            heading: 'Invalid Year Act',
            act: 'Invalid Year Act',
            year: 99
          }
        },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      assert(false, 'Act with invalid 2-digit year should fail');
    } catch (err) {
      assert(err.response?.status === 400, 'Act creation with invalid year rejected with 400 Bad Request');
    }

    // -------------------------------------------------------------
    // 9. Create Act under Bearer Act
    // -------------------------------------------------------------
    const createActRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'ACT',
        operation: 'CREATE',
        data: {
          bearerActId: testBearerActId,
          heading: 'Test Criminal Procedure Code',
          act: 'Test Criminal Procedure Code',
          year: 1973
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );

    assert(createActRes.status === 201, 'Act created with 201 Created');
    assert(createActRes.data.data.bearerActId === testBearerActId, 'Act associated with correct bearerActId');
    assert(createActRes.data.data.year === 1973, 'Act year is 1973');
    testActId = createActRes.data.data.id;

    // -------------------------------------------------------------
    // 10. Update Act
    // -------------------------------------------------------------
    const updateActRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'ACT',
        operation: 'UPDATE',
        data: {
          id: testActId,
          heading: 'Test Criminal Procedure Code (Amended)'
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );

    assert(updateActRes.status === 200, 'Act updated with 200 OK');
    assert(updateActRes.data.data.heading === 'Test Criminal Procedure Code (Amended)', 'Act heading updated');
    assert(updateActRes.data.data.year === 1973, 'Unmodified field (year) preserved');

    // -------------------------------------------------------------
    // 11. Section Operations: Parent Validation
    // -------------------------------------------------------------
    console.log('\n--- 5. Content Creator: ActSection Operations ---');
    try {
      await axios.post(
        `${BASE_URL}/api/content-creator/bearer-acts`,
        {
          type: 'SECTION',
          operation: 'CREATE',
          data: {
            actId: '00000000-0000-0000-0000-000000000000',
            section: 'Section 1',
            chapterNo: 1,
            chapterName: 'Preliminary',
            title: 'Title',
            description: 'Desc'
          }
        },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
      assert(false, 'Section with non-existent parent should fail');
    } catch (err) {
      assert(err.response?.status === 404, 'Section creation with invalid actId rejected with 404 Not Found');
    }

    // -------------------------------------------------------------
    // 12. Create Section under Act
    // -------------------------------------------------------------
    const createSecRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'SECTION',
        operation: 'CREATE',
        data: {
          actId: testActId,
          section: 'Section 1',
          chapterNo: 1,
          chapterName: 'Preliminary',
          title: 'Short title, extent and commencement',
          description: 'This Act may be called the Code of Criminal Procedure...',
          metaData: 'Chapter 1 section metadata',
          metaDescription: 'SEO description for Section 1',
          metaTitle: 'Section 1 - CrPC'
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );

    assert(createSecRes.status === 201, 'Section created with 201 Created');
    assert(createSecRes.data.data.actId === testActId, 'Section associated with correct actId');
    assert(createSecRes.data.data.chapterNo === 1, 'Section chapterNo is 1');
    testSectionId = createSecRes.data.data.id;

    // -------------------------------------------------------------
    // 13. Update Section
    // -------------------------------------------------------------
    const updateSecRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'SECTION',
        operation: 'UPDATE',
        data: {
          id: testSectionId,
          title: 'Short title, extent and commencement (Updated)',
          description: 'Updated detailed legal description content'
        }
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );

    assert(updateSecRes.status === 200, 'Section updated with 200 OK');
    assert(updateSecRes.data.data.title === 'Short title, extent and commencement (Updated)', 'Section title updated');
    assert(updateSecRes.data.data.chapterNo === 1, 'Section chapterNo preserved');

    // -------------------------------------------------------------
    // 14. Public Read Operations (Without Auth)
    // -------------------------------------------------------------
    console.log('\n--- 6. Public Read Operations (No Auth Required) ---');

    // GET /api/bearer-acts
    const publicCategoriesRes = await axios.get(`${BASE_URL}/api/bearer-acts?page=1&limit=20`);
    assert(publicCategoriesRes.status === 200, 'GET /api/bearer-acts returns 200 OK without auth');
    assert(Array.isArray(publicCategoriesRes.data.data), 'GET /api/bearer-acts returns an array of categories');
    assert(publicCategoriesRes.data.pagination.total >= 13, 'GET /api/bearer-acts has >= 13 categories seeded');

    // GET /api/bearer-acts/:id
    const singleCatRes = await axios.get(`${BASE_URL}/api/bearer-acts/${testBearerActId}`);
    assert(singleCatRes.status === 200, 'GET /api/bearer-acts/:id returns 200 OK without auth');
    assert(singleCatRes.data.data.id === testBearerActId, 'Single category ID matches');
    assert(Array.isArray(singleCatRes.data.data.acts), 'Single category includes related acts array');
    assert(singleCatRes.data.data.acts.length >= 1, 'Related acts includes created act');

    // GET /api/bearer-acts/:id/acts
    const catActsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${testBearerActId}/acts?page=1&limit=10`);
    assert(catActsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200 OK without auth');
    assert(Array.isArray(catActsRes.data.data), 'Returns array of acts for category');
    assert(catActsRes.data.data.some((a) => a.id === testActId), 'Category acts list contains testActId');

    // GET /api/acts/:id
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${testActId}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200 OK without auth');
    assert(singleActRes.data.data.id === testActId, 'Single act ID matches');
    assert(Array.isArray(singleActRes.data.data.sections), 'Single act includes related sections array');
    assert(singleActRes.data.data.sections.length >= 1, 'Related sections includes created section');

    // GET /api/acts/:id/sections
    const actSectionsRes = await axios.get(`${BASE_URL}/api/acts/${testActId}/sections?page=1&limit=10`);
    assert(actSectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200 OK without auth');
    assert(Array.isArray(actSectionsRes.data.data), 'Returns array of sections for act');
    assert(actSectionsRes.data.data.some((s) => s.id === testSectionId), 'Act sections list contains testSectionId');

    // GET /api/sections/:id
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${testSectionId}`);
    assert(singleSecRes.status === 200, 'GET /api/sections/:id returns 200 OK without auth');
    assert(singleSecRes.data.data.id === testSectionId, 'Single section ID matches');
    assert(singleSecRes.data.data.section === 'Section 1', 'Single section details match');

    // -------------------------------------------------------------
    // 15. Not Found 404 tests for Public Read
    // -------------------------------------------------------------
    console.log('\n--- 7. Public Read 404 Verification ---');
    try {
      await axios.get(`${BASE_URL}/api/bearer-acts/00000000-0000-0000-0000-000000000000`);
      assert(false, 'Non-existent category should return 404');
    } catch (err) {
      assert(err.response?.status === 404, 'Non-existent category returns 404 Not Found');
    }

    try {
      await axios.get(`${BASE_URL}/api/acts/00000000-0000-0000-0000-000000000000`);
      assert(false, 'Non-existent act should return 404');
    } catch (err) {
      assert(err.response?.status === 404, 'Non-existent act returns 404 Not Found');
    }

    try {
      await axios.get(`${BASE_URL}/api/sections/00000000-0000-0000-0000-000000000000`);
      assert(false, 'Non-existent section should return 404');
    } catch (err) {
      assert(err.response?.status === 404, 'Non-existent section returns 404 Not Found');
    }

  } catch (unexpectedError) {
    console.error('Unexpected test error:', unexpectedError);
    failed++;
  } finally {
    // Cleanup test data
    console.log('\n--- Cleanup ---');
    if (testBearerActId) {
      try {
        await prisma.bearerAct.delete({
          where: { id: testBearerActId }
        });
        console.log(`Cleaned up test BearerAct: ${testBearerActId}`);
      } catch (cleanErr) {
        console.error('Error during test data cleanup:', cleanErr.message);
      }
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
