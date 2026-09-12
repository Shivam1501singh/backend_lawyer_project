import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

async function runApprovalWorkflowTests() {
  console.log('--- Starting Advocate Profile Approval Workflow E2E Tests ---');

  // 0. Ensure server is reachable
  try {
    const health = await fetch(`${BASE_URL}/api/health`);
    const healthData = await health.json();
    console.log('Health check:', healthData);
  } catch (err) {
    console.error('Server is not running on', BASE_URL, '. Make sure dev server is started.');
    process.exit(1);
  }

  // --- TEST 1 — Register Advocate ---
  console.log('\n[Test 1] Registering a new Advocate...');
  const testPhone = `98888${Math.floor(10005 + Math.random() * 89999)}`;
  const testEmail = `test.advocate.${Date.now()}@example.com`;
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const barCouncilId = `BCI/TEST/${Date.now()}/2026`;

  const advocate1 = await prisma.advocate.create({
    data: {
      fullName: 'Rahul Sharma Test',
      phone: testPhone,
      email: testEmail,
      barCouncilId: barCouncilId,
      passwordHash: passwordHash,
      languagesSpoken: ['English', 'Hindi'],
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110001',
      phoneVerified: true,
      emailVerified: true,
      approvalStatus: 'PENDING',
      status: 'ACTIVE'
    }
  });

  console.log('Registered Advocate ID:', advocate1.id, 'Approval Status:', advocate1.approvalStatus);
  if (advocate1.approvalStatus !== 'PENDING') {
    throw new Error(`Test 1 Failed: Expected PENDING approvalStatus but got ${advocate1.approvalStatus}`);
  }

  // --- TEST 2 — Login Advocate ---
  console.log('\n[Test 2] Logging in as Advocate...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/advocate/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status, 'Response success:', loginData.success);
  if (!loginData.success || !loginData.token) {
    throw new Error('Test 2 Failed: Advocate login failed!');
  }
  const advocateToken = loginData.token;

  // Verify Advocate Profile endpoint returns approvalStatus
  const profileRes = await fetch(`${BASE_URL}/api/advocate/profile`, {
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  const profileData = await profileRes.json();
  console.log('Advocate profile status info:', profileData.advocate?.approvalStatus, profileData.advocate?.accountStatus);
  if (profileData.advocate?.approvalStatus !== 'PENDING' || profileData.advocate?.accountStatus !== 'ACTIVE') {
    throw new Error('Test 2 Failed: Advocate profile endpoint did not return correct approvalStatus and accountStatus');
  }

  // --- TEST 3 — Complete Profile ---
  console.log('\n[Test 3] Completing Advocate profile fields...');
  const updateRes = await fetch(`${BASE_URL}/api/advocate/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${advocateToken}`
    },
    body: JSON.stringify({
      experienceYears: 8,
      practiceAreas: ['Criminal Law', 'Civil Law'],
      bestPracticeArea: 'Criminal Law',
      about: 'Experienced criminal defense advocate with 8 years of practice. Specialized in high-profile criminal litigation, constitutional law, trial advocacy, bail applications, white-collar crime defense, appeals, criminal writs, and corporate investigations. Committed to providing top-quality legal representation, thorough legal research, diligent case preparation, strategic client advisory, and relentless defense across high courts and district courts in India.',
      completeAddress: 'Office 101, Delhi High Court Chamber',
      courtPractice: ['Delhi High Court', 'Supreme Court of India']
    })
  });
  const updateData = await updateRes.json();
  console.log('Profile update status:', updateRes.status, 'Message:', updateData.message);

  // Set profilePhotoUrl directly in DB (simulating photo upload)
  await prisma.advocate.update({
    where: { id: advocate1.id },
    data: { profilePhotoUrl: 'https://example.com/photo.jpg' }
  });

  // --- TEST 4 — Submit Profile for Approval ---
  console.log('\n[Test 4] Submitting Advocate profile for Admin approval...');
  const submitRes = await fetch(`${BASE_URL}/api/advocates/profile/submit-for-approval`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  const submitData = await submitRes.json();
  console.log('Submit status:', submitRes.status, 'Response:', submitData);
  if (!submitData.success || submitData.message !== 'Your profile has been submitted for admin approval') {
    throw new Error(`Test 4 Failed: Expected submission success message but got ${JSON.stringify(submitData)}`);
  }

  // --- TEST 5 — Normal User Searches Lawyers ---
  console.log('\n[Test 5] Searching lawyers as Normal User (Pending Advocate should NOT appear)...');
  const searchRes = await fetch(`${BASE_URL}/api/advocates?search=Rahul%20Sharma%20Test`);
  const searchData = await searchRes.json();
  const isPresentInSearch = searchData.advocates?.some(a => a.id === advocate1.id);
  console.log('Pending Advocate present in search listing?', isPresentInSearch);
  if (isPresentInSearch) {
    throw new Error('Test 5 Failed: Pending advocate appeared in Normal User lawyer search!');
  }

  // --- TEST 6 — Normal User Fetches Pending Advocate ---
  console.log('\n[Test 6] Fetching Pending Advocate public profile (Should return 404 Not Found)...');
  const fetchProfileRes = await fetch(`${BASE_URL}/api/advocates/${advocate1.id}`);
  console.log('Public profile status for pending advocate:', fetchProfileRes.status);
  if (fetchProfileRes.status !== 404) {
    throw new Error(`Test 6 Failed: Expected 404 Not Found but got status ${fetchProfileRes.status}`);
  }

  // --- ADMIN LOGIN ---
  console.log('\nLogging in as Admin...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'it2@techvunex.in', password: '123456' })
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.success || !adminLoginData.token) {
    throw new Error('Admin login failed!');
  }
  const adminToken = adminLoginData.token;

  // --- TEST 7 — Admin Views Pending Advocates ---
  console.log('\n[Test 7] Admin viewing pending advocates queue...');
  const pendingRes = await fetch(`${BASE_URL}/api/admin/advocates/pending`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const pendingData = await pendingRes.json();
  console.log('Pending count:', pendingData.data?.length);
  const pendingAdvocate = pendingData.data?.find(a => a.id === advocate1.id);
  if (!pendingAdvocate) {
    throw new Error('Test 7 Failed: Submitted advocate was not found in Admin pending queue!');
  }
  if (pendingAdvocate.passwordHash || pendingAdvocate.aadhaarNumber) {
    throw new Error('SECURITY VIOLATION: Password hash or Aadhaar number exposed in pending queue!');
  }

  // --- TEST 8 — Admin Reviews Profile ---
  console.log('\n[Test 8] Admin reviewing Advocate complete profile...');
  const reviewRes = await fetch(`${BASE_URL}/api/admin/advocates/${advocate1.id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const reviewData = await reviewRes.json();
  console.log('Admin review profile status:', reviewRes.status, 'Name:', reviewData.data?.fullName);
  if (!reviewData.success || reviewData.data?.id !== advocate1.id) {
    throw new Error('Test 8 Failed: Admin could not fetch advocate profile for review!');
  }
  if (reviewData.data?.passwordHash) {
    throw new Error('SECURITY VIOLATION: Password hash exposed in Admin review profile response!');
  }

  // --- TEST 9 — Admin Approves Advocate ---
  console.log('\n[Test 9] Admin approving Advocate profile...');
  const approveRes = await fetch(`${BASE_URL}/api/admin/advocates/${advocate1.id}/approve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const approveData = await approveRes.json();
  console.log('Approve status:', approveRes.status, 'Response:', approveData);
  if (!approveData.success || approveData.data?.approvalStatus !== 'APPROVED' || approveData.data?.accountStatus !== 'ACTIVE') {
    throw new Error(`Test 9 Failed: Expected approvalStatus=APPROVED and accountStatus=ACTIVE but got ${JSON.stringify(approveData)}`);
  }

  // --- TEST 10 — Normal User Searches Again ---
  console.log('\n[Test 10] Normal User searching lawyers again (Approved Advocate should appear)...');
  const searchRes2 = await fetch(`${BASE_URL}/api/advocates?search=Rahul%20Sharma%20Test`);
  const searchData2 = await searchRes2.json();
  const isPresentInSearch2 = searchData2.advocates?.some(a => a.id === advocate1.id);
  console.log('Approved Advocate present in search listing?', isPresentInSearch2);
  if (!isPresentInSearch2) {
    throw new Error('Test 10 Failed: Approved advocate did not appear in Normal User lawyer search!');
  }

  // --- TEST 11 — Normal User Fetches Profile ---
  console.log('\n[Test 11] Normal User fetching Approved Advocate profile...');
  const fetchProfileRes2 = await fetch(`${BASE_URL}/api/advocates/${advocate1.id}`);
  const fetchProfileData2 = await fetchProfileRes2.json();
  console.log('Public profile status for approved advocate:', fetchProfileRes2.status);
  if (fetchProfileRes2.status !== 200 || !fetchProfileData2.success) {
    throw new Error('Test 11 Failed: Approved advocate profile did not return 200 OK!');
  }
  if (fetchProfileData2.advocate.likeCount === undefined || fetchProfileData2.advocate.isLiked === undefined || !Array.isArray(fetchProfileData2.advocate.team)) {
    throw new Error('Test 11 Failed: Profile response missing likeCount, isLiked, or team fields!');
  }

  // --- TEST 12 — Booking/Connection ---
  console.log('\n[Test 12] Normal User creating case connection request for Approved Advocate...');
  let testUser = await prisma.user.findFirst({ where: { isActive: true } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        fullName: 'Test Client User',
        email: `client.${Date.now()}@example.com`,
        phone: `97777${Math.floor(10005 + Math.random() * 89999)}`,
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        emailVerified: true,
        phoneVerified: true
      }
    });
  }

  // --- TEST 13 — Admin Rejects Advocate ---
  console.log('\n[Test 13] Creating Advocate 2 and Admin rejecting profile...');
  const advocate2 = await prisma.advocate.create({
    data: {
      fullName: 'Rejected Advocate Test',
      phone: `96666${Math.floor(10005 + Math.random() * 89999)}`,
      email: `rejected.advocate.${Date.now()}@example.com`,
      barCouncilId: `BCI/REJ/${Date.now()}/2026`,
      passwordHash: passwordHash,
      languagesSpoken: ['English'],
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400001',
      profilePhotoUrl: 'https://example.com/photo2.jpg',
      bestPracticeArea: 'Corporate Law',
      experienceYears: 5,
      about: 'Corporate lawyer bio',
      phoneVerified: true,
      emailVerified: true,
      approvalStatus: 'PENDING',
      status: 'ACTIVE'
    }
  });

  const rejectRes = await fetch(`${BASE_URL}/api/admin/advocates/${advocate2.id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ reason: 'BAR ID verification information is incomplete' })
  });
  const rejectData = await rejectRes.json();
  console.log('Reject status:', rejectRes.status, 'Response:', rejectData);
  if (!rejectData.success || rejectData.data?.approvalStatus !== 'REJECTED' || rejectData.data?.rejectionReason !== 'BAR ID verification information is incomplete') {
    throw new Error(`Test 13 Failed: Expected approvalStatus=REJECTED with reason but got ${JSON.stringify(rejectData)}`);
  }

  // --- TEST 14 — Rejected Advocate Hidden ---
  console.log('\n[Test 14] Verifying Rejected Advocate is hidden from Normal User lawyer search and profile lookup...');
  const rejSearchRes = await fetch(`${BASE_URL}/api/advocates?search=Rejected%20Advocate%20Test`);
  const rejSearchData = await rejSearchRes.json();
  const isRejInSearch = rejSearchData.advocates?.some(a => a.id === advocate2.id);
  console.log('Rejected Advocate present in search?', isRejInSearch);
  if (isRejInSearch) {
    throw new Error('Test 14 Failed: Rejected advocate appeared in Normal User lawyer search!');
  }

  const rejProfileRes = await fetch(`${BASE_URL}/api/advocates/${advocate2.id}`);
  console.log('Public profile status for rejected advocate:', rejProfileRes.status);
  if (rejProfileRes.status !== 404) {
    throw new Error(`Test 14 Failed: Expected 404 for rejected advocate profile but got ${rejProfileRes.status}`);
  }

  // --- TEST 15 — Re-submit Rejected Profile ---
  console.log('\n[Test 15] Re-submitting rejected advocate profile...');
  const loginRes2 = await fetch(`${BASE_URL}/api/auth/advocate/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: advocate2.email, password: 'Password123!' })
  });
  const loginData2 = await loginRes2.json();
  const advocate2Token = loginData2.token;

  const resubmitRes = await fetch(`${BASE_URL}/api/advocates/profile/submit-for-approval`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${advocate2Token}` }
  });
  const resubmitData = await resubmitRes.json();
  console.log('Resubmit status:', resubmitRes.status, 'Response:', resubmitData);
  if (!resubmitData.success) {
    throw new Error(`Test 15 Failed: Resubmission failed with ${JSON.stringify(resubmitData)}`);
  }

  const checkAdv2 = await prisma.advocate.findUnique({ where: { id: advocate2.id } });
  console.log('Re-submitted Advocate status:', checkAdv2.approvalStatus, 'Rejection reason:', checkAdv2.rejectionReason);
  if (checkAdv2.approvalStatus !== 'PENDING' || checkAdv2.rejectionReason !== null) {
    throw new Error('Test 15 Failed: Re-submitted advocate approvalStatus should be PENDING with cleared rejectionReason!');
  }

  const checkAdv2Public = await fetch(`${BASE_URL}/api/advocates/${advocate2.id}`);
  if (checkAdv2Public.status !== 404) {
    throw new Error('Test 15 Failed: Re-submitted advocate must remain hidden (404) until approved again!');
  }

  // --- TEST 16 — Admin Blocks Approved Advocate ---
  console.log('\n[Test 16] Admin blocking Approved Advocate (APPROVED + BLOCKED)...');
  const blockRes = await fetch(`${BASE_URL}/api/admin/advocates/${advocate1.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'BLOCKED' })
  });
  const blockData = await blockRes.json();
  console.log('Block status:', blockRes.status, 'Response:', blockData);

  const blockSearchRes = await fetch(`${BASE_URL}/api/advocates?search=Rahul%20Sharma%20Test`);
  const blockSearchData = await blockSearchRes.json();
  const isBlockedInSearch = blockSearchData.advocates?.some(a => a.id === advocate1.id);
  console.log('Blocked Advocate present in search?', isBlockedInSearch);
  if (isBlockedInSearch) {
    throw new Error('Test 16 Failed: Approved + Blocked advocate appeared in Normal User lawyer search!');
  }

  const blockProfileRes = await fetch(`${BASE_URL}/api/advocates/${advocate1.id}`);
  console.log('Public profile status for blocked advocate:', blockProfileRes.status);
  if (blockProfileRes.status !== 404) {
    throw new Error(`Test 16 Failed: Expected 404 for blocked advocate profile but got ${blockProfileRes.status}`);
  }

  // --- TEST 17 — Admin Activates Advocate ---
  console.log('\n[Test 17] Admin activating Blocked Advocate (APPROVED + ACTIVE)...');
  const activateRes = await fetch(`${BASE_URL}/api/admin/advocates/${advocate1.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'ACTIVE' })
  });
  const activateData = await activateRes.json();
  console.log('Activate status:', activateRes.status, 'Response:', activateData);

  const activeSearchRes = await fetch(`${BASE_URL}/api/advocates?search=Rahul%20Sharma%20Test`);
  const activeSearchData = await activeSearchRes.json();
  const isActiveInSearch = activeSearchData.advocates?.some(a => a.id === advocate1.id);
  console.log('Activated Advocate present in search?', isActiveInSearch);
  if (!isActiveInSearch) {
    throw new Error('Test 17 Failed: Activated advocate did not reappear in Normal User lawyer search!');
  }

  console.log('\n===============================================================');
  console.log('  🎉 ALL 17 ADVOCATE APPROVAL WORKFLOW TESTS PASSED SUCCESSFULLY!  ');
  console.log('===============================================================\n');

  // Clean up test records
  await prisma.advocate.deleteMany({
    where: { id: { in: [advocate1.id, advocate2.id] } }
  }).catch(() => {});

  process.exit(0);
}

runApprovalWorkflowTests().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
