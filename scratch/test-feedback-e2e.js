import http from 'http';
import app from '../src/server.js';
import prisma from '../src/lib/prisma.js';
import { signToken } from '../src/utils/jwt.js';

let server;
let port;
let baseUrl;

const makeRequest = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- Starting Feedback APIs End-to-End Tests ---');

  // Start test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });

  try {
    // 1. Setup Test User & Admin
    const testUserEmail = `feedback_test_user_${Date.now()}@example.com`;
    const testUserPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    const testUser = await prisma.user.create({
      data: {
        fullName: 'Test Feedback User',
        email: testUserEmail,
        phone: testUserPhone,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        status: 'ACTIVE'
      }
    });

    const testAdminEmail = `feedback_test_admin_${Date.now()}@example.com`;
    const testAdmin = await prisma.admin.create({
      data: {
        fullName: 'Test Feedback Admin',
        email: testAdminEmail,
        passwordHash: 'dummy_hashed_password',
        isActive: true
      }
    });

    const userToken = signToken({ id: testUser.id, type: 'user' });
    const adminToken = signToken({ id: testAdmin.id, type: 'admin' });

    console.log('✓ Created test user and test admin');

    // Test 1: Unauthenticated submission fails (401)
    console.log('\nTest 1: Unauthenticated user cannot submit feedback');
    const resUnauth = await makeRequest('/api/user/feedback', 'POST', {
      description: 'This should fail without auth'
    });
    console.log(`Response status: ${resUnauth.status}`, resUnauth.data);
    if (resUnauth.status !== 401 || resUnauth.data.success !== false) {
      throw new Error(`Test 1 Failed: Expected status 401, got ${resUnauth.status}`);
    }
    console.log('✓ Test 1 Passed: 401 returned for unauthenticated request');

    // Test 2: Validation errors (empty description / invalid fields)
    console.log('\nTest 2: Validation failure on invalid body');
    const resInvalid = await makeRequest('/api/user/feedback', 'POST', {}, {
      Authorization: `Bearer ${userToken}`
    });
    console.log(`Empty body status: ${resInvalid.status}`, resInvalid.data);
    if (resInvalid.status !== 400) {
      throw new Error(`Test 2 Failed: Expected 400 for empty body, got ${resInvalid.status}`);
    }

    const resTooShort = await makeRequest('/api/user/feedback', 'POST', { description: 'ab' }, {
      Authorization: `Bearer ${userToken}`
    });
    console.log(`Too short body status: ${resTooShort.status}`, resTooShort.data);
    if (resTooShort.status !== 400) {
      throw new Error(`Test 2 Failed: Expected 400 for short description, got ${resTooShort.status}`);
    }
    console.log('✓ Test 2 Passed: Zod validation rejects invalid descriptions');

    // Test 3: Logged-in user submits feedback successfully
    console.log('\nTest 3: Logged-in user submits feedback successfully');
    const feedbackText = 'The legal consultation platform is very helpful and intuitive.';
    const resSubmit = await makeRequest('/api/user/feedback', 'POST', {
      description: feedbackText
    }, {
      Authorization: `Bearer ${userToken}`
    });

    console.log(`Submit status: ${resSubmit.status}`, resSubmit.data);
    if (resSubmit.status !== 201 || !resSubmit.data.success || !resSubmit.data.data) {
      throw new Error(`Test 3 Failed: Feedback submission failed`);
    }

    const createdFeedback = resSubmit.data.data;
    if (createdFeedback.name !== testUser.fullName) {
      throw new Error(`Test 3 Failed: Name not populated from user profile (expected "${testUser.fullName}", got "${createdFeedback.name}")`);
    }
    if (createdFeedback.phone !== testUser.phone) {
      throw new Error(`Test 3 Failed: Phone not populated from user profile (expected "${testUser.phone}", got "${createdFeedback.phone}")`);
    }
    if (createdFeedback.userId !== testUser.id) {
      throw new Error(`Test 3 Failed: userId does not match (expected "${testUser.id}", got "${createdFeedback.userId}")`);
    }
    if (createdFeedback.description !== feedbackText) {
      throw new Error(`Test 3 Failed: Description does not match`);
    }
    console.log('✓ Test 3 Passed: User feedback submitted successfully with profile name and phone');

    // Test 3b: Submitting via alias /api/feedback
    console.log('\nTest 3b: User submits feedback via /api/feedback alias');
    const resSubmitAlias = await makeRequest('/api/feedback', 'POST', {
      description: 'Second feedback submitted via alias route.'
    }, {
      Authorization: `Bearer ${userToken}`
    });
    console.log(`Submit alias status: ${resSubmitAlias.status}`, resSubmitAlias.data);
    if (resSubmitAlias.status !== 201 || !resSubmitAlias.data.success) {
      throw new Error(`Test 3b Failed: Feedback alias submission failed`);
    }
    const createdFeedback2 = resSubmitAlias.data.data;
    console.log('✓ Test 3b Passed: /api/feedback alias works seamlessly');

    // Test 4: Normal user cannot access Admin feedback APIs (403)
    console.log('\nTest 4: Normal user cannot access Admin feedback APIs (403 Forbidden)');
    const resUserAdminList = await makeRequest('/api/admin/feedback', 'GET', null, {
      Authorization: `Bearer ${userToken}`
    });
    console.log(`User accessing admin list status: ${resUserAdminList.status}`, resUserAdminList.data);
    if (resUserAdminList.status !== 403) {
      throw new Error(`Test 4 Failed: Expected 403 Forbidden, got ${resUserAdminList.status}`);
    }

    const resUserAdminDelete = await makeRequest(`/api/admin/feedback/${createdFeedback.id}`, 'DELETE', null, {
      Authorization: `Bearer ${userToken}`
    });
    console.log(`User accessing admin delete status: ${resUserAdminDelete.status}`, resUserAdminDelete.data);
    if (resUserAdminDelete.status !== 403) {
      throw new Error(`Test 4 Failed: Expected 403 Forbidden, got ${resUserAdminDelete.status}`);
    }
    console.log('✓ Test 4 Passed: Normal users are forbidden from Admin feedback APIs');

    // Test 5: Admin retrieves feedback list
    console.log('\nTest 5: Admin retrieves feedback list with pagination');
    const resAdminList = await makeRequest('/api/admin/feedback?page=1&limit=10', 'GET', null, {
      Authorization: `Bearer ${adminToken}`
    });
    console.log(`Admin list status: ${resAdminList.status}`, resAdminList.data);
    if (resAdminList.status !== 200 || !resAdminList.data.success || !Array.isArray(resAdminList.data.data)) {
      throw new Error(`Test 5 Failed: Admin list failed`);
    }

    const feedbacks = resAdminList.data.data;
    const found1 = feedbacks.find(f => f.id === createdFeedback.id);
    const found2 = feedbacks.find(f => f.id === createdFeedback2.id);
    if (!found1 || !found2) {
      throw new Error(`Test 5 Failed: Created feedbacks not found in admin list`);
    }
    if (!resAdminList.data.pagination || resAdminList.data.pagination.total < 2) {
      throw new Error(`Test 5 Failed: Pagination metadata incorrect`);
    }
    // Verify latest first ordering
    const index1 = feedbacks.findIndex(f => f.id === createdFeedback.id);
    const index2 = feedbacks.findIndex(f => f.id === createdFeedback2.id);
    if (index2 > index1) {
      throw new Error(`Test 5 Failed: Feedbacks not ordered latest first (createdFeedback2 was created after createdFeedback)`);
    }
    console.log('✓ Test 5 Passed: Admin retrieved feedback list with correct ordering and pagination');

    // Test 6: Admin deletes non-existent feedback (404)
    console.log('\nTest 6: Admin deletes non-existent feedback ID (404 Not Found)');
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const resDeleteNotFound = await makeRequest(`/api/admin/feedback/${nonExistentId}`, 'DELETE', null, {
      Authorization: `Bearer ${adminToken}`
    });
    console.log(`Delete non-existent status: ${resDeleteNotFound.status}`, resDeleteNotFound.data);
    if (resDeleteNotFound.status !== 404 || resDeleteNotFound.data.success !== false) {
      throw new Error(`Test 6 Failed: Expected 404 for non-existent feedback, got ${resDeleteNotFound.status}`);
    }
    console.log('✓ Test 6 Passed: 404 returned for deleting non-existent feedback');

    // Test 7: Admin deletes feedback successfully
    console.log('\nTest 7: Admin deletes feedback successfully');
    const resDelete = await makeRequest(`/api/admin/feedback/${createdFeedback.id}`, 'DELETE', null, {
      Authorization: `Bearer ${adminToken}`
    });
    console.log(`Delete status: ${resDelete.status}`, resDelete.data);
    if (resDelete.status !== 200 || !resDelete.data.success) {
      throw new Error(`Test 7 Failed: Admin delete failed`);
    }

    // Verify deletion in DB
    const checkDb = await prisma.feedback.findUnique({ where: { id: createdFeedback.id } });
    if (checkDb !== null) {
      throw new Error(`Test 7 Failed: Feedback still exists in database`);
    }
    console.log('✓ Test 7 Passed: Feedback deleted successfully from DB');

    // Clean up second test feedback & test records
    await prisma.feedback.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.admin.delete({ where: { id: testAdmin.id } });
    console.log('✓ Test cleanup completed successfully');

    console.log('\n========================================');
    console.log('🎉 ALL FEEDBACK API TESTS PASSED! 🎉');
    console.log('========================================\n');
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
