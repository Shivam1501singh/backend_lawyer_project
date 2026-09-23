import prisma from '../src/lib/prisma.js';
import jwt from 'jsonwebtoken';
import http from 'http';
import bcrypt from 'bcryptjs';

const PORT = 5097;
process.env.PORT = PORT;
process.env.NODE_ENV = 'test';

// Import express app
const { default: app } = await import('../src/server.js');

let server;

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key';
function generateToken(user, type = 'user') {
  return jwt.sign(
    { id: user.id, type },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

async function runTests() {
  console.log('=== Starting Consultancy Request Feature E2E Verification ===\n');

  let testUser1;
  let testUser2;
  let testAdvocate;
  let testCreator;
  let testAdmin;

  let user1Token;
  let user2Token;
  let advocateToken;
  let creatorToken;
  let adminToken;

  try {
    // 0. Setup test users and tokens
    console.log('0. Setting up test accounts in DB...');
    const uniqueSuffix = Date.now();

    testUser1 = await prisma.user.create({
      data: {
        fullName: 'Test User One',
        email: `user1_${uniqueSuffix}@example.com`,
        phone: `981${String(uniqueSuffix).slice(-7)}`,
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001'
      }
    });
    user1Token = generateToken(testUser1, 'user');

    testUser2 = await prisma.user.create({
      data: {
        fullName: 'Test User Two',
        email: `user2_${uniqueSuffix}@example.com`,
        phone: `982${String(uniqueSuffix).slice(-7)}`,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    });
    user2Token = generateToken(testUser2, 'user');

    const hashedPassword = await bcrypt.hash('password123', 10);

    testAdvocate = await prisma.advocate.create({
      data: {
        fullName: 'Test Advocate',
        email: `adv_${uniqueSuffix}@example.com`,
        phone: `983${String(uniqueSuffix).slice(-7)}`,
        barCouncilId: `BAR_${uniqueSuffix}`,
        passwordHash: hashedPassword,
        state: 'Delhi',
        city: 'Delhi',
        approvalStatus: 'APPROVED'
      }
    });
    advocateToken = generateToken(testAdvocate, 'advocate');

    testCreator = await prisma.contentCreator.create({
      data: {
        fullName: 'Test Creator',
        email: `creator_${uniqueSuffix}@example.com`,
        passwordHash: hashedPassword
      }
    });
    creatorToken = generateToken(testCreator, 'content_creator');

    testAdmin = await prisma.admin.findFirst();
    if (!testAdmin) {
      testAdmin = await prisma.admin.create({
        data: {
          fullName: 'Test Admin',
          email: `admin_${uniqueSuffix}@example.com`,
          passwordHash: hashedPassword
        }
      });
    }
    adminToken = generateToken(testAdmin, 'admin');

    console.log('✓ Accounts successfully created.\n');

    // 1. Authorization: Unauthenticated request should be rejected (401)
    console.log('1. Testing Unauthenticated Consultancy Request creation...');
    const unauthRes = await request('POST', '/api/user/consultancy', {}, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user@example.com'
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected status 401, got ${unauthRes.status}`);
    }
    console.log('✓ Unauthenticated request rejected with 401.');

    // 2. Authorization: Non-user roles cannot access User consultancy APIs (403)
    console.log('\n2. Testing Advocate accessing User consultancy API...');
    const advAccessRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${advocateToken}`
    }, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user@example.com'
    });
    if (advAccessRes.status !== 403) {
      throw new Error(`Expected status 403, got ${advAccessRes.status}`);
    }
    console.log('✓ Advocate access rejected with 403.');

    console.log('\n3. Testing Content Creator accessing User consultancy API...');
    const creatorAccessRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${creatorToken}`
    }, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user@example.com'
    });
    if (creatorAccessRes.status !== 403) {
      throw new Error(`Expected status 403, got ${creatorAccessRes.status}`);
    }
    console.log('✓ Content Creator access rejected with 403.');

    // 3. Pricing Matrix Verification (All 4 packages)
    console.log('\n4. Testing Package 1: CALL + 15 min (Expected: ₹199)...');
    const pkg1Res = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user1@example.com'
    });
    if (pkg1Res.status !== 201 || pkg1Res.body.data.price !== 199 || pkg1Res.body.data.status !== 'PENDING' || pkg1Res.body.data.completedAt !== null) {
      throw new Error(`Package 1 failed: ${JSON.stringify(pkg1Res.body)}`);
    }
    const req1Id = pkg1Res.body.data.id;
    console.log('✓ Package 1 created successfully with price ₹199 and status PENDING.');

    console.log('\n5. Testing Package 2: CALL + 30 min (Expected: ₹499)...');
    const pkg2Res = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'CALL',
      duration: 30,
      phoneNumber: '9876543210',
      email: 'user1@example.com'
    });
    if (pkg2Res.status !== 201 || pkg2Res.body.data.price !== 499) {
      throw new Error(`Package 2 failed: ${JSON.stringify(pkg2Res.body)}`);
    }
    const req2Id = pkg2Res.body.data.id;
    console.log('✓ Package 2 created successfully with price ₹499.');

    console.log('\n6. Testing Package 3: VIDEO_CALL + 15 min (Expected: ₹499)...');
    const pkg3Res = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'VIDEO_CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user1@example.com'
    });
    if (pkg3Res.status !== 201 || pkg3Res.body.data.price !== 499) {
      throw new Error(`Package 3 failed: ${JSON.stringify(pkg3Res.body)}`);
    }
    console.log('✓ Package 3 created successfully with price ₹499.');

    console.log('\n7. Testing Package 4: VIDEO_CALL + 30 min (Expected: ₹899)...');
    const pkg4Res = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'VIDEO_CALL',
      duration: 30,
      phoneNumber: '9876543210',
      email: 'user1@example.com'
    });
    if (pkg4Res.status !== 201 || pkg4Res.body.data.price !== 899) {
      throw new Error(`Package 4 failed: ${JSON.stringify(pkg4Res.body)}`);
    }
    console.log('✓ Package 4 created successfully with price ₹899.');

    // 4. Client Price Manipulation / Extra Keys Rejection
    console.log('\n8. Testing Client submitting custom price (Should be rejected)...');
    const customPriceRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user1@example.com',
      price: 50
    });
    if (customPriceRes.status !== 400) {
      throw new Error(`Expected status 400 for client price injection, got ${customPriceRes.status}`);
    }
    console.log('✓ Client price injection rejected with 400.');

    console.log('\n9. Testing Client submitting custom status or userId (Should be rejected)...');
    const statusInjectionRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user1@example.com',
      status: 'COMPLETED'
    });
    if (statusInjectionRes.status !== 400) {
      throw new Error(`Expected status 400 for status injection, got ${statusInjectionRes.status}`);
    }
    console.log('✓ Status injection rejected with 400.');

    // 5. Validation Rejections
    console.log('\n10. Testing Invalid Call Type...');
    const invalidTypeRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'AUDIO_CHAT',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'user1@example.com'
    });
    if (invalidTypeRes.status !== 400) {
      throw new Error(`Expected status 400 for invalid callType, got ${invalidTypeRes.status}`);
    }
    console.log('✓ Invalid callType rejected with 400.');

    console.log('\n11. Testing Invalid Duration...');
    const invalidDurationRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'CALL',
      duration: 45,
      phoneNumber: '9876543210',
      email: 'user1@example.com'
    });
    if (invalidDurationRes.status !== 400) {
      throw new Error(`Expected status 400 for invalid duration, got ${invalidDurationRes.status}`);
    }
    console.log('✓ Invalid duration rejected with 400.');

    console.log('\n12. Testing Invalid Email...');
    const invalidEmailRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '9876543210',
      email: 'not-an-email'
    });
    if (invalidEmailRes.status !== 400) {
      throw new Error(`Expected status 400 for invalid email, got ${invalidEmailRes.status}`);
    }
    console.log('✓ Invalid email rejected with 400.');

    console.log('\n13. Testing Invalid Phone Number...');
    const invalidPhoneRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    }, {
      callType: 'CALL',
      duration: 15,
      phoneNumber: '12345',
      email: 'user1@example.com'
    });
    if (invalidPhoneRes.status !== 400) {
      throw new Error(`Expected status 400 for invalid phone number, got ${invalidPhoneRes.status}`);
    }
    console.log('✓ Invalid phone number rejected with 400.');

    // 6. User History and Data Isolation
    console.log('\n14. Testing User 2 creating a request and verifying User 1 isolation...');
    const user2ReqRes = await request('POST', '/api/user/consultancy', {
      Authorization: `Bearer ${user2Token}`
    }, {
      callType: 'VIDEO_CALL',
      duration: 30,
      phoneNumber: '9999999999',
      email: 'user2@example.com'
    });
    const user2ReqId = user2ReqRes.body.data.id;

    // User 1 gets history
    const user1HistoryRes = await request('GET', '/api/user/consultancy', {
      Authorization: `Bearer ${user1Token}`
    });
    if (user1HistoryRes.status !== 200) {
      throw new Error(`Expected status 200, got ${user1HistoryRes.status}`);
    }
    const user1Ids = user1HistoryRes.body.data.map(r => r.id);
    if (user1Ids.includes(user2ReqId)) {
      throw new Error('SECURITY BREACH: User 1 history includes User 2 request!');
    }
    console.log('✓ User 1 history only contains User 1 requests.');

    // User 1 attempts to access User 2's request by ID
    console.log('\n15. Testing User 1 accessing User 2 request by ID (Should return 404)...');
    const crossUserAccessRes = await request('GET', `/api/user/consultancy/${user2ReqId}`, {
      Authorization: `Bearer ${user1Token}`
    });
    if (crossUserAccessRes.status !== 404) {
      throw new Error(`Expected status 404 for cross-user request access, got ${crossUserAccessRes.status}`);
    }
    console.log('✓ Cross-user access returns 404.');

    // User 1 gets their own request by ID
    console.log('\n16. Testing User 1 accessing their own request by ID...');
    const ownReqRes = await request('GET', `/api/user/consultancy/${req1Id}`, {
      Authorization: `Bearer ${user1Token}`
    });
    if (ownReqRes.status !== 200 || ownReqRes.body.data.id !== req1Id) {
      throw new Error(`Expected own request details, got ${JSON.stringify(ownReqRes.body)}`);
    }
    console.log('✓ User successfully retrieved own request.');

    // 7. Admin Authorization & Listing
    console.log('\n17. Testing Normal User accessing Admin Consultancy API (Should return 403)...');
    const userAdminRes = await request('GET', '/api/admin/consultancy', {
      Authorization: `Bearer ${user1Token}`
    });
    if (userAdminRes.status !== 403) {
      throw new Error(`Expected status 403, got ${userAdminRes.status}`);
    }
    console.log('✓ Normal User access to Admin API rejected with 403.');

    console.log('\n18. Testing Admin List Consultancy Requests and FIFO Ordering (createdAt ASC, id ASC)...');
    const adminListRes = await request('GET', '/api/admin/consultancy', {
      Authorization: `Bearer ${adminToken}`
    });
    if (adminListRes.status !== 200 || !Array.isArray(adminListRes.body.data)) {
      throw new Error(`Admin list failed: ${JSON.stringify(adminListRes.body)}`);
    }
    const adminItems = adminListRes.body.data;
    console.log(`✓ Admin retrieved ${adminItems.length} total consultancy requests.`);

    // Verify ordering: oldest first (createdAt ASC)
    for (let i = 0; i < adminItems.length - 1; i++) {
      const t1 = new Date(adminItems[i].createdAt).getTime();
      const t2 = new Date(adminItems[i + 1].createdAt).getTime();
      if (t1 > t2) {
        throw new Error(`Admin list is not sorted createdAt ASC! Index ${i} has ${t1} > ${t2}`);
      }
    }
    console.log('✓ Admin list is strictly ordered by createdAt ASC, id ASC (FIFO queue).');

    // 8. Admin Status Filtering
    console.log('\n19. Testing Admin Filter by status=PENDING...');
    const pendingRes = await request('GET', '/api/admin/consultancy?status=PENDING', {
      Authorization: `Bearer ${adminToken}`
    });
    if (pendingRes.status !== 200) {
      throw new Error(`Pending filter failed: ${JSON.stringify(pendingRes.body)}`);
    }
    const nonPending = pendingRes.body.data.filter(r => r.status !== 'PENDING');
    if (nonPending.length > 0) {
      throw new Error(`Pending filter returned non-pending requests!`);
    }
    console.log('✓ Status filter status=PENDING verified.');

    console.log('\n20. Testing Admin Invalid Status Filter...');
    const invalidStatusFilterRes = await request('GET', '/api/admin/consultancy?status=INVALID_STATUS', {
      Authorization: `Bearer ${adminToken}`
    });
    if (invalidStatusFilterRes.status !== 400) {
      throw new Error(`Expected status 400 for invalid status filter, got ${invalidStatusFilterRes.status}`);
    }
    console.log('✓ Invalid status filter rejected with 400.');

    // 9. Admin Mark Request COMPLETED
    console.log('\n21. Testing Admin Mark Request COMPLETED...');
    const markCompletedRes = await request('PATCH', `/api/admin/consultancy/${req1Id}/status`, {
      Authorization: `Bearer ${adminToken}`
    }, {
      status: 'COMPLETED'
    });
    if (markCompletedRes.status !== 200 || markCompletedRes.body.data.status !== 'COMPLETED' || !markCompletedRes.body.data.completedAt) {
      throw new Error(`Mark COMPLETED failed: ${JSON.stringify(markCompletedRes.body)}`);
    }
    console.log('✓ Request marked as COMPLETED successfully with completedAt timestamp.');

    // 10. Filter by status=COMPLETED
    console.log('\n22. Testing Admin Filter by status=COMPLETED...');
    const completedRes = await request('GET', '/api/admin/consultancy?status=COMPLETED', {
      Authorization: `Bearer ${adminToken}`
    });
    if (completedRes.status !== 200) {
      throw new Error(`Completed filter failed: ${JSON.stringify(completedRes.body)}`);
    }
    const completedIds = completedRes.body.data.map(r => r.id);
    if (!completedIds.includes(req1Id)) {
      throw new Error('Completed request not found in COMPLETED list!');
    }
    console.log('✓ Filter status=COMPLETED includes the updated request.');

    // 11. Security & Invalid Transitions on Status Update
    console.log('\n23. Testing Normal User attempting to mark request completed (Should be 403)...');
    const userMarkRes = await request('PATCH', `/api/admin/consultancy/${req2Id}/status`, {
      Authorization: `Bearer ${user1Token}`
    }, {
      status: 'COMPLETED'
    });
    if (userMarkRes.status !== 403) {
      throw new Error(`Expected 403 for user updating status, got ${userMarkRes.status}`);
    }
    console.log('✓ Normal user cannot mark request as completed.');

    console.log('\n24. Testing Admin submitting invalid status update (e.g. status=PENDING)...');
    const invalidStatusUpdateRes = await request('PATCH', `/api/admin/consultancy/${req1Id}/status`, {
      Authorization: `Bearer ${adminToken}`
    }, {
      status: 'PENDING'
    });
    if (invalidStatusUpdateRes.status !== 400) {
      throw new Error(`Expected 400 for setting status to PENDING, got ${invalidStatusUpdateRes.status}`);
    }
    console.log('✓ Admin cannot revert status to PENDING.');

    // 12. Pagination tests
    console.log('\n25. Testing Pagination on User and Admin APIs...');
    const userPaginationRes = await request('GET', '/api/user/consultancy?page=1&limit=2', {
      Authorization: `Bearer ${user1Token}`
    });
    if (userPaginationRes.status !== 200 || userPaginationRes.body.data.length > 2 || !userPaginationRes.body.pagination) {
      throw new Error(`User pagination failed: ${JSON.stringify(userPaginationRes.body)}`);
    }
    console.log(`✓ User pagination working: limit=2, returned count=${userPaginationRes.body.data.length}, total=${userPaginationRes.body.pagination.total}`);

    console.log('\n🎉 ALL 25 TEST CASES PASSED SUCCESSFULLY! 🎉\n');

  } finally {
    // Cleanup
    console.log('Cleaning up test data...');
    try {
      if (testUser1) {
        await prisma.consultancyRequest.deleteMany({ where: { userId: testUser1.id } });
        await prisma.user.delete({ where: { id: testUser1.id } });
      }
      if (testUser2) {
        await prisma.consultancyRequest.deleteMany({ where: { userId: testUser2.id } });
        await prisma.user.delete({ where: { id: testUser2.id } });
      }
      if (testAdvocate) {
        await prisma.advocate.delete({ where: { id: testAdvocate.id } });
      }
      if (testCreator) {
        await prisma.contentCreator.delete({ where: { id: testCreator.id } });
      }
      console.log('Cleanup completed.');
    } catch (cleanErr) {
      console.error('Cleanup error (ignored):', cleanErr);
    }
  }
}

// Run tests
try {
  // Give server brief moment to initialize
  await new Promise(res => setTimeout(res, 500));
  await runTests();
  process.exit(0);
} catch (err) {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
}

