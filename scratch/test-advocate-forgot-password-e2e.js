import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5001';

async function runE2ETests() {
  console.log('--- Starting Advocate Forgot / Reset Password E2E Tests ---');

  const oldPassword = 'OldPassword123!';
  const newPassword = 'NewPassword123!';
  const oldPasswordHash = await bcrypt.hash(oldPassword, 10);

  // 1. Setup Test Advocate in DB
  const advocate = await prisma.advocate.upsert({
    where: { email: 'reset_advocate_test@example.com' },
    update: { passwordHash: oldPasswordHash, isActive: true, status: 'ACTIVE' },
    create: {
      fullName: 'Advocate Reset Tester',
      email: 'reset_advocate_test@example.com',
      phone: '9777711111',
      barCouncilId: 'DL/97777/2026',
      passwordHash: oldPasswordHash,
      state: 'Delhi',
      city: 'Delhi',
      status: 'ACTIVE',
      isActive: true
    }
  });

  const client = axios.create({
    baseURL: BASE_URL
  });

  try {
    // Test 1: Request OTP via Email
    console.log('\n[Test 1] Request reset OTP via Email...');
    const resReqEmail = await client.post('/api/advocate/forgot-password', {
      email: advocate.email
    });
    console.log('Status:', resReqEmail.status, resReqEmail.data.message);
    if (!resReqEmail.data.success) {
      throw new Error('Test 1 Failed: Could not request email OTP');
    }

    // Retrieve active OTP from DB for verification test
    const resetRecordEmail = await prisma.advocatePasswordReset.findFirst({
      where: { advocateId: advocate.id, target: advocate.email, usedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    if (!resetRecordEmail) {
      throw new Error('Test 1 Failed: Reset record not found in DB');
    }

    // Test 2: Verify Incorrect OTP
    console.log('\n[Test 2] Verify incorrect OTP...');
    try {
      await client.post('/api/advocate/verify-reset-otp', {
        email: advocate.email,
        otp: '000000'
      });
      throw new Error('Test 2 Failed: Incorrect OTP should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('Invalid OTP')) {
        console.log('Passed incorrect OTP check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 3: Request OTP via Phone (Invalidates Email reset request)
    console.log('\n[Test 3] Request reset OTP via Phone...');
    const resReqPhone = await client.post('/api/advocate/forgot-password', {
      phone: advocate.phone
    });
    console.log('Status:', resReqPhone.status, resReqPhone.data.message);

    // Get plain OTP from dev environment logic or DB (In DEV mode, generateSecureOtp returns 123456)
    const plainOtp = process.env.NODE_ENV !== 'production' ? '123456' : '123456';

    // Test 4: Verify Phone OTP
    console.log('\n[Test 4] Verify valid Phone OTP...');
    const resVerify = await client.post('/api/advocate/verify-reset-otp', {
      phone: advocate.phone,
      otp: plainOtp
    });
    console.log('Status:', resVerify.status, resVerify.data.message);
    if (!resVerify.data.success || !resVerify.data.resetToken) {
      throw new Error('Test 4 Failed: Could not verify phone OTP');
    }
    const resetToken = resVerify.data.resetToken;

    // Test 5: Reset Password with Mismatched Passwords
    console.log('\n[Test 5] Reset password with mismatched passwords...');
    try {
      await client.post('/api/advocate/reset-password', {
        resetToken,
        newPassword: newPassword,
        confirmPassword: 'DifferentPassword123!'
      });
      throw new Error('Test 5 Failed: Password mismatch should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed password mismatch check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 6: Reset Password Successfully
    console.log('\n[Test 6] Reset password successfully...');
    const resReset = await client.post('/api/advocate/reset-password', {
      resetToken,
      newPassword: newPassword,
      confirmPassword: newPassword
    });
    console.log('Status:', resReset.status, resReset.data.message);
    if (!resReset.data.success) {
      throw new Error('Test 6 Failed: Could not reset password');
    }

    // Test 7: Attempt reusing single-use resetToken
    console.log('\n[Test 7] Attempt reusing reset token...');
    try {
      await client.post('/api/advocate/reset-password', {
        resetToken,
        newPassword: newPassword,
        confirmPassword: newPassword
      });
      throw new Error('Test 7 Failed: Reusing reset token should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('Invalid or expired')) {
        console.log('Passed reused reset token check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 8: Login with Old Password (Should Fail)
    console.log('\n[Test 8] Attempt login with OLD password...');
    try {
      await client.post('/api/auth/advocate/login', {
        email: advocate.email,
        password: oldPassword
      });
      throw new Error('Test 8 Failed: Login with old password should have failed');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('Passed old password rejection check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 9: Login with NEW Password (Should Succeed)
    console.log('\n[Test 9] Attempt login with NEW password...');
    const resLogin = await client.post('/api/auth/advocate/login', {
      email: advocate.email,
      password: newPassword
    });
    console.log('Status:', resLogin.status, resLogin.data.message);
    if (!resLogin.data.success || !resLogin.data.token) {
      throw new Error('Test 9 Failed: Could not login with new password');
    }

    // Cleanup Test Data
    console.log('\nCleaning up test records from DB...');
    await prisma.advocatePasswordReset.deleteMany({ where: { advocateId: advocate.id } });
    await prisma.advocate.delete({ where: { id: advocate.id } });

    console.log('\n======================================================');
    console.log('ALL ADVOCATE FORGOT / RESET PASSWORD TESTS PASSED 🚀');
    console.log('======================================================');

  } catch (error) {
    console.error('\nE2E Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Cleanup on failure
    await prisma.advocatePasswordReset.deleteMany({ where: { advocateId: advocate.id } }).catch(() => {});
    await prisma.advocate.delete({ where: { id: advocate.id } }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
