import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function runVerificationStatusTests() {
  console.log('--- Starting Advocate Verification Status API E2E Tests ---');

  // 0. Ensure server is reachable
  try {
    const health = await fetch(`${BASE_URL}/api/health`);
    const healthData = await health.json();
    console.log('Health check:', healthData);
  } catch (err) {
    console.error('Server is not running on', BASE_URL, '. Make sure dev server is started.');
    process.exit(1);
  }

  // --- TEST 1 — Unauthorized Access ---
  console.log('\n[Test 1] Fetching verification status without authentication (Should return 401 Unauthorized)...');
  const unauthRes = await fetch(`${BASE_URL}/api/advocate/profile/verification-status`);
  console.log('Unauth response status:', unauthRes.status);
  if (unauthRes.status !== 401) {
    throw new Error(`Test 1 Failed: Expected 401 Unauthorized but got status ${unauthRes.status}`);
  }

  // --- TEST 2 — Registered Advocate — NOT_SUBMITTED State ---
  console.log('\n[Test 2] Registered Advocate fetching status before profile submission (Should return NOT_SUBMITTED)...');
  const testPhone1 = `98888${Math.floor(10005 + Math.random() * 89999)}`;
  const testEmail1 = `advocate.notsubmitted.${Date.now()}@example.com`;
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const barCouncilId1 = `BCI/TEST/NS/${Date.now()}/2026`;

  const advocate1 = await prisma.advocate.create({
    data: {
      fullName: 'Vikram Seth',
      phone: testPhone1,
      email: testEmail1,
      barCouncilId: barCouncilId1,
      passwordHash: passwordHash,
      languagesSpoken: ['English', 'Hindi'],
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110001',
      experienceYears: 6,
      practiceAreas: ['Criminal Law'],
      bestPracticeArea: 'Criminal Law',
      about: 'Experienced advocate in criminal defense.',
      profilePhotoUrl: 'https://example.com/photo_vikram.jpg',
      phoneVerified: true,
      emailVerified: true,
      approvalStatus: 'PENDING',
      submittedForApprovalAt: null, // NOT submitted yet!
      status: 'ACTIVE'
    }
  });

  const loginRes1 = await fetch(`${BASE_URL}/api/auth/advocate/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail1, password: 'Password123!' })
  });
  const loginData1 = await loginRes1.json();
  if (!loginData1.success || !loginData1.token) {
    throw new Error('Test 2 Failed: Advocate login failed');
  }
  const token1 = loginData1.token;

  const statusRes1 = await fetch(`${BASE_URL}/api/advocate/profile/verification-status`, {
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const statusData1 = await statusRes1.json();
  console.log('Not-submitted advocate response:', statusRes1.status, statusData1);
  if (statusRes1.status !== 200 || !statusData1.success || statusData1.status !== 'NOT_SUBMITTED') {
    throw new Error(`Test 2 Failed: Expected status NOT_SUBMITTED but got ${JSON.stringify(statusData1)}`);
  }
  if (statusData1.profile) {
    throw new Error('Test 2 Failed: Profile preview must NOT be returned in NOT_SUBMITTED status!');
  }

  // --- TEST 3 — Profile Submitted — PENDING State ---
  console.log('\n[Test 3] Submitting Advocate profile for approval (Should return PENDING)...');
  const submitRes = await fetch(`${BASE_URL}/api/advocate/profile/submit-for-approval`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const submitData = await submitRes.json();
  console.log('Submit response:', submitRes.status, submitData);
  if (!submitData.success) {
    throw new Error(`Test 3 Failed: Could not submit profile for approval: ${JSON.stringify(submitData)}`);
  }

  const statusRes2 = await fetch(`${BASE_URL}/api/advocate/profile/verification-status`, {
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const statusData2 = await statusRes2.json();
  console.log('Pending advocate status response:', statusRes2.status, statusData2);
  if (statusRes2.status !== 200 || !statusData2.success || statusData2.status !== 'PENDING') {
    throw new Error(`Test 3 Failed: Expected status PENDING but got ${JSON.stringify(statusData2)}`);
  }
  if (statusData2.profile) {
    throw new Error('Test 3 Failed: Profile preview must NOT be returned in PENDING status!');
  }
  if (!statusData2.submittedAt) {
    throw new Error('Test 3 Failed: submittedAt timestamp should be included in PENDING state!');
  }

  // --- TEST 4 — Admin Approves Advocate — APPROVED State ---
  console.log('\n[Test 4] Admin approving Advocate profile (Should return APPROVED + profile preview)...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'it2@techvunex.in', password: '123456' })
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.success || !adminLoginData.token) {
    throw new Error('Admin login failed');
  }
  const adminToken = adminLoginData.token;

  const approveRes = await fetch(`${BASE_URL}/api/admin/advocates/${advocate1.id}/approve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const approveData = await approveRes.json();
  console.log('Approve response:', approveRes.status, approveData);

  const statusRes3 = await fetch(`${BASE_URL}/api/advocate/profile/verification-status`, {
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const statusData3 = await statusRes3.json();
  console.log('Approved advocate status response:', statusRes3.status, 'Status:', statusData3.status, 'Profile Name:', statusData3.profile?.fullName);
  if (statusRes3.status !== 200 || !statusData3.success || statusData3.status !== 'APPROVED' || !statusData3.profile) {
    throw new Error(`Test 4 Failed: Expected APPROVED status with profile preview but got ${JSON.stringify(statusData3)}`);
  }

  // Verify profile fields in APPROVED response
  const p = statusData3.profile;
  if (!p.id || !p.fullName || !p.barCouncilId || !p.email || !p.phone) {
    throw new Error('Test 4 Failed: Profile preview missing required advocate fields!');
  }
  if (p.passwordHash || p.aadhaarNumber || statusData3.passwordHash || statusData3.aadhaarNumber) {
    throw new Error('SECURITY VIOLATION: Sensitive authentication secrets exposed in verification-status response!');
  }

  // --- TEST 5 — Admin Rejects Advocate — REJECTED State ---
  console.log('\n[Test 5] Admin rejecting Advocate 2 profile (Should return REJECTED + rejectionReason)...');
  const testPhone2 = `97777${Math.floor(10005 + Math.random() * 89999)}`;
  const testEmail2 = `advocate.rejected.${Date.now()}@example.com`;
  const barCouncilId2 = `BCI/TEST/REJ/${Date.now()}/2026`;

  const advocate2 = await prisma.advocate.create({
    data: {
      fullName: 'Anita Roy',
      phone: testPhone2,
      email: testEmail2,
      barCouncilId: barCouncilId2,
      passwordHash: passwordHash,
      languagesSpoken: ['English'],
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400001',
      experienceYears: 4,
      practiceAreas: ['Corporate Law'],
      bestPracticeArea: 'Corporate Law',
      about: 'Corporate lawyer.',
      profilePhotoUrl: 'https://example.com/photo_anita.jpg',
      phoneVerified: true,
      emailVerified: true,
      approvalStatus: 'PENDING',
      submittedForApprovalAt: new Date(),
      status: 'ACTIVE'
    }
  });

  const rejectionReasonText = 'Please provide valid Bar Council information.';
  const rejectRes = await fetch(`${BASE_URL}/api/admin/advocates/${advocate2.id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ reason: rejectionReasonText })
  });
  const rejectData = await rejectRes.json();
  console.log('Reject response:', rejectRes.status, rejectData);

  const loginRes2 = await fetch(`${BASE_URL}/api/auth/advocate/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail2, password: 'Password123!' })
  });
  const loginData2 = await loginRes2.json();
  const token2 = loginData2.token;

  const statusRes4 = await fetch(`${BASE_URL}/api/advocate/profile/verification-status`, {
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const statusData4 = await statusRes4.json();
  console.log('Rejected advocate status response:', statusRes4.status, statusData4);
  if (statusRes4.status !== 200 || !statusData4.success || statusData4.status !== 'REJECTED') {
    throw new Error(`Test 5 Failed: Expected status REJECTED but got ${JSON.stringify(statusData4)}`);
  }
  if (statusData4.rejectionReason !== rejectionReasonText) {
    throw new Error(`Test 5 Failed: Expected rejectionReason="${rejectionReasonText}" but got "${statusData4.rejectionReason}"`);
  }
  if (statusData4.profile) {
    throw new Error('Test 5 Failed: Profile preview must NOT be returned in REJECTED status!');
  }

  // --- TEST 6 — Resubmit Rejected Profile ---
  console.log('\n[Test 6] Resubmitting rejected advocate profile (Should return PENDING)...');
  const resubmitRes = await fetch(`${BASE_URL}/api/advocate/profile/submit-for-approval`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const resubmitData = await resubmitRes.json();
  console.log('Resubmit response:', resubmitRes.status, resubmitData);

  const statusRes5 = await fetch(`${BASE_URL}/api/advocate/profile/verification-status`, {
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const statusData5 = await statusRes5.json();
  console.log('Resubmitted status response:', statusRes5.status, statusData5);
  if (statusRes5.status !== 200 || !statusData5.success || statusData5.status !== 'PENDING') {
    throw new Error(`Test 6 Failed: Expected status PENDING after resubmission but got ${JSON.stringify(statusData5)}`);
  }

  console.log('\n===============================================================');
  console.log('  🎉 ALL ADVOCATE VERIFICATION STATUS API TESTS PASSED!  ');
  console.log('===============================================================\n');

  // Clean up test advocates
  await prisma.advocate.deleteMany({
    where: { id: { in: [advocate1.id, advocate2.id] } }
  }).catch(() => {});

  process.exit(0);
}

runVerificationStatusTests().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
