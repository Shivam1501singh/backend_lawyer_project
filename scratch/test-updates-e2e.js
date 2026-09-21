import prisma from '../src/lib/prisma.js';
import jwt from 'jsonwebtoken';
import http from 'http';

const PORT = 5097;
process.env.PORT = PORT;
process.env.NODE_ENV = 'test';

// Dynamically import express app from server.js
const { default: app } = await import('../src/server.js');

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const reqHeaders = { ...headers };
    let payload = null;

    if (body) {
      payload = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Updates Feature E2E Tests ---');
  let testCreator;
  let testUser;
  let testAdvocate;
  let createdUpdateId;

  try {
    // 1. Setup test tokens & users
    testCreator = await prisma.contentCreator.findFirst({
      where: { email: 'trainee6@techvunex.in' }
    });

    if (!testCreator) {
      testCreator = await prisma.contentCreator.create({
        data: {
          fullName: 'Test Update Creator',
          email: 'update_creator_test@techvunex.in',
          passwordHash: 'dummy_hash',
          isActive: true
        }
      });
    }

    testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          fullName: 'Test User',
          phone: '9999999902',
          email: 'test_update_user@example.com',
          state: 'Delhi',
          city: 'New Delhi'
        }
      });
    }

    testAdvocate = await prisma.advocate.findFirst();

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

    const creatorToken = jwt.sign(
      { id: testCreator.id, email: testCreator.email, role: 'CONTENT_CREATOR', type: 'content_creator' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: 'USER', type: 'user' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const advocateToken = jwt.sign(
      { id: testAdvocate ? testAdvocate.id : 'advocate-dummy-id', email: testAdvocate ? testAdvocate.email : 'adv@example.com', role: 'ADVOCATE', type: 'advocate' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Test 1: Public GET /api/updates (Unauthenticated)
    console.log('\n[Test 1] Public GET /api/updates (No Auth)...');
    const resList = await request('GET', '/api/updates');
    if (resList.status === 200 && resList.body.success && Array.isArray(resList.body.data) && resList.body.pagination) {
      console.log('✅ Passed: Public GET /api/updates returns 200 with pagination structure');
    } else {
      throw new Error(`Failed Test 1: ${JSON.stringify(resList)}`);
    }

    // Test 2: Validation on Create (empty fields / whitespace)
    console.log('\n[Test 2] Create Update with empty/whitespace fields...');
    const resInvalidCreate = await request(
      'POST',
      '/api/content-creator/updates',
      { Authorization: `Bearer ${creatorToken}` },
      { title: '', oldDescription: '   ', newDescription: '' }
    );
    if (resInvalidCreate.status === 400 && resInvalidCreate.body.success === false) {
      console.log('✅ Passed: Rejects empty title/oldDescription/newDescription with 400 Bad Request');
    } else {
      throw new Error(`Failed Test 2: ${JSON.stringify(resInvalidCreate)}`);
    }

    // Test 3: Unauthenticated Create -> 401
    console.log('\n[Test 3] Create Update without authentication...');
    const resNoAuth = await request(
      'POST',
      '/api/content-creator/updates',
      {},
      {
        title: 'Updated Legal Consultation Process',
        oldDescription: 'Previously, users had to contact advocates manually to arrange a consultation.',
        newDescription: 'Users can now view advocate profiles and book consultations directly through the platform.'
      }
    );
    if (resNoAuth.status === 401) {
      console.log('✅ Passed: Returns 401 Unauthorized for unauthenticated create request');
    } else {
      throw new Error(`Failed Test 3: ${JSON.stringify(resNoAuth)}`);
    }

    // Test 4: Forbidden Roles (Normal User / Advocate) -> 403
    console.log('\n[Test 4] Create Update as Normal User & Advocate...');
    const resUserCreate = await request(
      'POST',
      '/api/content-creator/updates',
      { Authorization: `Bearer ${userToken}` },
      {
        title: 'Updated Legal Consultation Process',
        oldDescription: 'Previously, users had to contact advocates manually to arrange a consultation.',
        newDescription: 'Users can now view advocate profiles and book consultations directly through the platform.'
      }
    );
    const resAdvocateCreate = await request(
      'POST',
      '/api/content-creator/updates',
      { Authorization: `Bearer ${advocateToken}` },
      {
        title: 'Updated Legal Consultation Process',
        oldDescription: 'Previously, users had to contact advocates manually to arrange a consultation.',
        newDescription: 'Users can now view advocate profiles and book consultations directly through the platform.'
      }
    );
    if (resUserCreate.status === 403 && resAdvocateCreate.status === 403) {
      console.log('✅ Passed: Returns 403 Forbidden for non-Content-Creator accounts');
    } else {
      throw new Error(`Failed Test 4: User=${resUserCreate.status}, Advocate=${resAdvocateCreate.status}`);
    }

    // Test 5: Successful Create as Content Creator
    console.log('\n[Test 5] Create Update as Content Creator...');
    const resCreate = await request(
      'POST',
      '/api/content-creator/updates',
      { Authorization: `Bearer ${creatorToken}` },
      {
        title: 'Updated Legal Consultation Process',
        oldDescription: 'Previously, users had to contact advocates manually to arrange a consultation.',
        newDescription: 'Users can now view advocate profiles and book consultations directly through the platform.'
      }
    );
    if (resCreate.status === 201 && resCreate.body.success && resCreate.body.data.id) {
      createdUpdateId = resCreate.body.data.id;
      console.log(`✅ Passed: Created Update ID ${createdUpdateId}`);
      if (
        resCreate.body.data.title === 'Updated Legal Consultation Process' &&
        resCreate.body.data.oldDescription === 'Previously, users had to contact advocates manually to arrange a consultation.' &&
        resCreate.body.data.newDescription === 'Users can now view advocate profiles and book consultations directly through the platform.'
      ) {
        console.log('✅ Passed: Created update data matches payload');
      }
    } else {
      throw new Error(`Failed Test 5: ${JSON.stringify(resCreate)}`);
    }

    // Test 6: Public GET /api/updates/:id (Unauthenticated)
    console.log('\n[Test 6] Public GET /api/updates/:id (No Auth)...');
    const resSingle = await request('GET', `/api/updates/${createdUpdateId}`);
    if (resSingle.status === 200 && resSingle.body.success && resSingle.body.data.id === createdUpdateId) {
      console.log('✅ Passed: Public single update retrieval succeeds with full details');
    } else {
      throw new Error(`Failed Test 6: ${JSON.stringify(resSingle)}`);
    }

    // Test 7: Public GET /api/updates/:id Non-existent -> 404
    console.log('\n[Test 7] Public GET /api/updates/:id with non-existent ID...');
    const resNotFound = await request('GET', '/api/updates/00000000-0000-0000-0000-000000000000');
    if (resNotFound.status === 404 && resNotFound.body.success === false) {
      console.log('✅ Passed: Returns 404 Not Found for non-existent update ID');
    } else {
      throw new Error(`Failed Test 7: ${JSON.stringify(resNotFound)}`);
    }

    // Test 8: Content Creator Update Update (PATCH)
    console.log('\n[Test 8] Update Update as Content Creator...');
    const resUpdate = await request(
      'PATCH',
      `/api/content-creator/updates/${createdUpdateId}`,
      { Authorization: `Bearer ${creatorToken}` },
      {
        title: 'Updated Legal Consultation Process (v2)',
        oldDescription: 'Previous manual process',
        newDescription: 'New automated consultation and appointment booking flow'
      }
    );
    if (
      resUpdate.status === 200 &&
      resUpdate.body.success &&
      resUpdate.body.data.title === 'Updated Legal Consultation Process (v2)' &&
      resUpdate.body.data.oldDescription === 'Previous manual process' &&
      resUpdate.body.data.newDescription === 'New automated consultation and appointment booking flow'
    ) {
      console.log('✅ Passed: Update updated successfully');
    } else {
      throw new Error(`Failed Test 8: ${JSON.stringify(resUpdate)}`);
    }

    // Test 9: Update with Invalid/Empty body -> 400
    console.log('\n[Test 9] Update with empty title/descriptions...');
    const resInvalidUpdate = await request(
      'PATCH',
      `/api/content-creator/updates/${createdUpdateId}`,
      { Authorization: `Bearer ${creatorToken}` },
      { title: '   ' }
    );
    if (resInvalidUpdate.status === 400 && resInvalidUpdate.body.success === false) {
      console.log('✅ Passed: Rejects empty title on update with 400 Bad Request');
    } else {
      throw new Error(`Failed Test 9: ${JSON.stringify(resInvalidUpdate)}`);
    }

    // Test 10: Update non-existent update -> 404
    console.log('\n[Test 10] Update non-existent update...');
    const resUpdate404 = await request(
      'PATCH',
      '/api/content-creator/updates/00000000-0000-0000-0000-000000000000',
      { Authorization: `Bearer ${creatorToken}` },
      { title: 'Valid Title' }
    );
    if (resUpdate404.status === 404) {
      console.log('✅ Passed: Returns 404 when updating non-existent update');
    } else {
      throw new Error(`Failed Test 10: ${JSON.stringify(resUpdate404)}`);
    }

    // Test 11: Non-creator update/delete attempts -> 403
    console.log('\n[Test 11] Normal User and Advocate attempting PATCH and DELETE...');
    const resUserPatch = await request(
      'PATCH',
      `/api/content-creator/updates/${createdUpdateId}`,
      { Authorization: `Bearer ${userToken}` },
      { title: 'User Hack Attempt' }
    );
    const resAdvocateDelete = await request(
      'DELETE',
      `/api/content-creator/updates/${createdUpdateId}`,
      { Authorization: `Bearer ${advocateToken}` }
    );
    if (resUserPatch.status === 403 && resAdvocateDelete.status === 403) {
      console.log('✅ Passed: Unauthorized roles cannot edit or delete updates (403 Forbidden)');
    } else {
      throw new Error(`Failed Test 11: PATCH User=${resUserPatch.status}, DELETE Advocate=${resAdvocateDelete.status}`);
    }

    // Test 12: Delete non-existent update -> 404
    console.log('\n[Test 12] Delete non-existent update...');
    const resDelete404 = await request(
      'DELETE',
      '/api/content-creator/updates/00000000-0000-0000-0000-000000000000',
      { Authorization: `Bearer ${creatorToken}` }
    );
    if (resDelete404.status === 404) {
      console.log('✅ Passed: Returns 404 when deleting non-existent update');
    } else {
      throw new Error(`Failed Test 12: ${JSON.stringify(resDelete404)}`);
    }

    // Test 13: Content Creator Delete Update
    console.log('\n[Test 13] Delete Update as Content Creator...');
    const resDelete = await request(
      'DELETE',
      `/api/content-creator/updates/${createdUpdateId}`,
      { Authorization: `Bearer ${creatorToken}` }
    );
    if (resDelete.status === 200 && resDelete.body.success) {
      console.log('✅ Passed: Update deleted successfully');
    } else {
      throw new Error(`Failed Test 13: ${JSON.stringify(resDelete)}`);
    }

    // Test 14: Verify Update no longer exists in database
    console.log('\n[Test 14] Verify Deleted Update via Public API -> 404...');
    const resVerifyDeleted = await request('GET', `/api/updates/${createdUpdateId}`);
    if (resVerifyDeleted.status === 404) {
      console.log('✅ Passed: Verified update is permanently deleted (404)');
    } else {
      throw new Error(`Failed Test 14: ${JSON.stringify(resVerifyDeleted)}`);
    }

    console.log('\n🎉 ALL 14 UPDATES E2E TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error('❌ E2E Test Suite Error:', error);
    process.exit(1);
  } finally {
    if (createdUpdateId) {
      await prisma.update.deleteMany({ where: { id: createdUpdateId } });
    }
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();
