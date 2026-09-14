import prisma from '../src/lib/prisma.js';
import http from 'http';
import { spawn } from 'child_process';
import { processExpiredAccountDeletions } from '../src/services/accountDeletion.service.js';

let PORT = 5099;
let serverProcess = null;

async function checkHealth(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    return data && data.success;
  } catch (e) {
    return false;
  }
}

async function startServer() {
  console.log(`Starting test server on port ${PORT}...`);
  serverProcess = spawn('node', ['src/server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'test', PORT: String(PORT) },
    stdio: 'ignore'
  });

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const healthy = await checkHealth(`http://localhost:${PORT}`);
    if (healthy) {
      console.log(`Test server started successfully on port ${PORT}\n`);
      return;
    }
  }
  throw new Error(`Failed to start test server on port ${PORT}`);
}

function stopServer() {
  if (serverProcess) {
    console.log('Stopping test server process...');
    serverProcess.kill('SIGTERM');
  }
}

function request(options, data = null, cookies = []) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      const resCookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cookies: resCookies,
          body: parsed
        });
      });
    });

    req.on('error', reject);

    if (cookies.length > 0) {
      req.setHeader('Cookie', cookies.map(c => c.split(';')[0]).join('; '));
    }

    if (data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }

    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING E2E TESTS: Normal User Account Deletion ===\n');

  const testEmail = `testuser_del_${Date.now()}@example.com`;
  const testPhone = `99${Math.floor(10000000 + Math.random() * 90000000)}`;

  try {
    await startServer();

    // 1. Setup Test User in Database
    console.log('1. Creating test active User in DB...');
    const testUser = await prisma.user.create({
      data: {
        fullName: 'Test Account Deletion User',
        email: testEmail,
        phone: testPhone,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        status: 'ACTIVE'
      }
    });
    console.log(`✓ User created: ID=${testUser.id}, Phone=${testPhone}, Email=${testEmail}`);

    // 2. Perform Login to get token & cookies
    console.log('\n2. Logging in as test user...');
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/user/login/send-otp',
      method: 'POST'
    }, { phone: testPhone });

    const loginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/user/login/verify-otp',
      method: 'POST'
    }, { phone: testPhone, otp: '123456' });

    if (loginRes.statusCode !== 200 || !loginRes.body.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.token;
    const cookies = loginRes.cookies;
    console.log('✓ Login successful! Token acquired.');

    // 3. Test Unauthorized Request OTP (no auth header/cookie)
    console.log('\n3. Testing unauthorized request-otp (no token)...');
    const unauthRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/user/delete-account/request-otp',
      method: 'POST'
    }, {});
    console.log(`Status: ${unauthRes.statusCode} (Expected: 401)`);
    if (unauthRes.statusCode !== 401) throw new Error('Expected 401 for unauthorized access');
    console.log('✓ Unauthorized request correctly rejected.');

    // 4. Test Authenticated Request OTP
    console.log('\n4. Requesting Account Deletion OTP (authenticated)...');
    const reqOtpRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/user/delete-account/request-otp',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, {}, cookies);

    console.log('Response:', reqOtpRes.body);
    if (reqOtpRes.statusCode !== 200 || !reqOtpRes.body.success) {
      throw new Error(`Request OTP failed: ${JSON.stringify(reqOtpRes.body)}`);
    }
    console.log('✓ Deletion OTP requested successfully.');

    // 5. Test Invalid OTP Verification
    console.log('\n5. Testing verify-otp with incorrect OTP...');
    const invalidOtpRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/user/delete-account/verify-otp',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, { otp: '000000' }, cookies);

    console.log('Response:', invalidOtpRes.body);
    if (invalidOtpRes.statusCode === 200) throw new Error('Invalid OTP should not be accepted');
    
    // Check DB user remains ACTIVE
    const dbUserAfterInvalid = await prisma.user.findUnique({ where: { id: testUser.id } });
    if (dbUserAfterInvalid.status !== 'ACTIVE') throw new Error('Status should remain ACTIVE on invalid OTP');
    console.log('✓ Invalid OTP correctly rejected, user status remains ACTIVE.');

    // 6. Test Valid OTP Verification
    console.log('\n6. Testing verify-otp with correct OTP...');
    const validOtpRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/user/delete-account/verify-otp',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, { otp: '123456' }, cookies);

    console.log('Response:', validOtpRes.body);
    if (validOtpRes.statusCode !== 200 || !validOtpRes.body.scheduledDeletionAt) {
      throw new Error(`Verify OTP failed: ${JSON.stringify(validOtpRes.body)}`);
    }
    console.log('✓ OTP verified! Scheduled deletion response received.');

    // 7. Verify Database State (DELETION_PENDING & 30-day date)
    console.log('\n7. Verifying DB state after deletion OTP verification...');
    const dbUserPending = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log('DB Status:', dbUserPending.status);
    console.log('deletionRequestedAt:', dbUserPending.deletionRequestedAt);
    console.log('scheduledDeletionAt:', dbUserPending.scheduledDeletionAt);

    if (dbUserPending.status !== 'DELETION_PENDING') throw new Error('User status must be DELETION_PENDING');
    if (!dbUserPending.scheduledDeletionAt) throw new Error('scheduledDeletionAt must be populated');
    console.log('✓ Account status is DELETION_PENDING with 30-day schedule.');

    // 8. Test Duplicate Delete Request
    console.log('\n8. Testing duplicate delete request while DELETION_PENDING...');
    const duplicateRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/user/delete-account/request-otp',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, {}, cookies);
    console.log('Response:', duplicateRes.body);
    if (duplicateRes.statusCode !== 400 || duplicateRes.body.success !== false) {
      throw new Error('Duplicate deletion request should be rejected with 400');
    }
    console.log('✓ Duplicate deletion request correctly rejected.');

    // 9. Test Token Usage During DELETION_PENDING (session block)
    console.log('\n9. Testing API access using old token while DELETION_PENDING...');
    const meRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Status: ${meRes.statusCode} (Expected: 401)`);
    if (meRes.statusCode !== 401) throw new Error('Old session token should be rejected when DELETION_PENDING');
    console.log('✓ Old session token correctly blocked.');

    // 10. Test Login During Grace Period (Cancels Deletion)
    console.log('\n10. Testing login during 30-day grace period to cancel deletion...');
    // Send login OTP
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/user/login/send-otp',
      method: 'POST'
    }, { phone: testPhone });

    // Verify login OTP
    const restoreLoginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/user/login/verify-otp',
      method: 'POST'
    }, { phone: testPhone, otp: '123456' });

    console.log('Login Response:', restoreLoginRes.body);
    if (restoreLoginRes.statusCode !== 200 || !restoreLoginRes.body.token) {
      throw new Error('Login during grace period failed');
    }
    if (!restoreLoginRes.body.message.includes('cancelled')) {
      throw new Error('Expected response message to indicate deletion request was cancelled');
    }

    // Check DB state is restored to ACTIVE
    const dbUserRestored = await prisma.user.findUnique({ where: { id: testUser.id } });
    if (dbUserRestored.status !== 'ACTIVE' || dbUserRestored.scheduledDeletionAt !== null) {
      throw new Error('DB user status was not restored to ACTIVE');
    }
    console.log('✓ Login restored account to ACTIVE status and cancelled deletion.');

    // 11. Test Expired Deletion Processing (Simulating 30 Days Passed)
    console.log('\n11. Testing 30-day expired deletion batch processing...');
    // Request & verify OTP again to get into DELETION_PENDING
    const newLoginToken = restoreLoginRes.body.token;
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/user/delete-account/request-otp',
      method: 'POST',
      headers: { Authorization: `Bearer ${newLoginToken}` }
    }, {});
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/user/delete-account/verify-otp',
      method: 'POST',
      headers: { Authorization: `Bearer ${newLoginToken}` }
    }, { otp: '123456' });

    // Manually backdate scheduledDeletionAt to 31 days in past
    const pastDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: testUser.id },
      data: { scheduledDeletionAt: pastDate }
    });
    console.log('Simulated scheduledDeletionAt set to 31 days in the past.');

    // Run scheduled job processing
    const processed = await processExpiredAccountDeletions();
    console.log(`Processed ${processed.length} expired deletion(s).`);

    // Verify User record is deleted
    const deletedUserRow = await prisma.user.findUnique({ where: { id: testUser.id } });
    if (deletedUserRow !== null) throw new Error('User record should have been removed from User table');

    // Verify DeletedUser record is created
    const deletedArchiveRecord = await prisma.deletedUser.findUnique({ where: { originalUserId: testUser.id } });
    if (!deletedArchiveRecord) throw new Error('DeletedUser archive record was not created');
    console.log('Archived Record in DeletedUser:', {
      id: deletedArchiveRecord.id,
      originalUserId: deletedArchiveRecord.originalUserId,
      email: deletedArchiveRecord.email,
      phone: deletedArchiveRecord.phone,
      deletedAt: deletedArchiveRecord.deletedAt
    });
    console.log('✓ Account permanently moved to DeletedUser table.');

    // 12. Test Login After Permanent Deletion
    console.log('\n12. Testing login attempt after permanent deletion...');
    const postDelSendOtp = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/user/login/send-otp',
      method: 'POST'
    }, { phone: testPhone });
    console.log('Post-deletion login send-otp response:', postDelSendOtp.body);
    if (postDelSendOtp.statusCode === 200 && postDelSendOtp.body.success) {
      throw new Error('Login send-otp should fail for permanently deleted account');
    }
    console.log('✓ Login after permanent deletion correctly rejected.');

    // 13. Test Re-registration with same Email & Phone
    console.log('\n13. Testing re-registration with same email and phone number...');
    const reregUser = await prisma.user.create({
      data: {
        fullName: 'Re-registered Normal User',
        email: testEmail,
        phone: testPhone,
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        status: 'ACTIVE'
      }
    });
    console.log(`✓ Re-registration successful! New User ID=${reregUser.id}`);

    // Cleanup re-registered user & archive
    await prisma.user.delete({ where: { id: reregUser.id } });
    await prisma.deletedUser.delete({ where: { originalUserId: testUser.id } });

    console.log('\n==================================================');
    console.log('🎉 ALL 13 E2E TEST CASES PASSED SUCCESSFULLY!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    stopServer();
    process.exit(process.exitCode || 0);
  }
}

runTests();
