import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function runAadhaarStorageTests() {
  console.log('--- Starting Advocate Original Aadhaar Storage E2E Tests ---');

  // 0. Health check
  try {
    const health = await fetch(`${BASE_URL}/api/health`);
    const healthData = await health.json();
    console.log('Health check:', healthData);
  } catch (err) {
    console.error('Server is not running on', BASE_URL);
    process.exit(1);
  }

  // Clean up any left-over test Advocates from previous test runs
  const plainAadhaar = '123456789012';
  await prisma.advocate.deleteMany({
    where: { OR: [{ aadhaarNumber: plainAadhaar }, { email: { contains: 'advocate.aadhaar' } }, { email: { contains: 'dup.aadhaar' } }] }
  }).catch(() => {});

  // --- TEST 1 — Aadhaar Verification & Registration with Plain Text Storage ---
  console.log('\n[Test 1] Registering Advocate with Aadhaar verification...');
  const testPhone = `98888${Math.floor(10005 + Math.random() * 89999)}`;
  const testEmail = `advocate.aadhaar.${Date.now()}@example.com`;
  const barCouncilId = `BCI/AADHAAR/${Date.now()}/2026`;

  // Step 1: Start Registration
  const startRes = await fetch(`${BASE_URL}/api/auth/advocate/register/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Aadhaar Test Advocate',
      email: testEmail,
      gender: 'Male'
    })
  });
  const startData = await startRes.json();
  console.log('Start registration status:', startRes.status, 'Session ID:', startData.registrationId);
  if (!startData.success || !startData.registrationId) {
    throw new Error('Test 1 Failed: Could not start registration session.');
  }
  const regId = startData.registrationId;

  // Mark session email/phone verified & set photo in DB directly for test stability
  await prisma.registrationSession.update({
    where: { id: regId },
    data: {
      emailVerified: true,
      phone: testPhone,
      phoneVerified: true,
      profilePhotoUrl: 'https://example.com/photo_aadhaar.jpg'
    }
  });

  // Generate Aadhaar OTP via Sandbox
  console.log('\nGenerating Aadhaar OTP for plain text number:', plainAadhaar);
  const genAadhaarRes = await fetch(`${BASE_URL}/api/auth/advocate/aadhaar/otp/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: regId, aadhaar_number: plainAadhaar })
  });
  const genAadhaarData = await genAadhaarRes.json();
  console.log('Generate Aadhaar OTP status:', genAadhaarRes.status, genAadhaarData);
  if (!genAadhaarData.success || !genAadhaarData.reference_id) {
    throw new Error('Test 1 Failed: Sandbox Aadhaar OTP generation failed.');
  }
  const refId = genAadhaarData.reference_id;

  // Check RegistrationSession DB directly for plain text storage
  const sessionDb1 = await prisma.registrationSession.findUnique({ where: { id: regId } });
  console.log('RegistrationSession stored aadhaarNumber:', sessionDb1.aadhaarNumber);
  if (sessionDb1.aadhaarNumber !== plainAadhaar) {
    throw new Error(`Test 1 Failed: Expected session aadhaarNumber to be plain text '${plainAadhaar}' but got '${sessionDb1.aadhaarNumber}'`);
  }

  // Verify Aadhaar OTP
  const verifyAadhaarRes = await fetch(`${BASE_URL}/api/auth/advocate/aadhaar/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: regId, reference_id: refId, otp: '123456' })
  });
  const verifyAadhaarData = await verifyAadhaarRes.json();
  console.log('Verify Aadhaar response:', verifyAadhaarData);
  if (!verifyAadhaarData.success || !verifyAadhaarData.aadhaarVerified) {
    throw new Error('Test 1 Failed: Aadhaar verification failed.');
  }

  // Complete Advocate Registration
  const completeRes = await fetch(`${BASE_URL}/api/auth/advocate/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationId: regId,
      barCouncilId: barCouncilId,
      aadhaarNumber: plainAadhaar,
      password: 'Password123!',
      languagesSpoken: ['English', 'Hindi'],
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110001'
    })
  });
  const completeData = await completeRes.json();
  console.log('Complete registration response:', completeData);
  if (!completeData.success || !completeData.advocateId) {
    throw new Error('Test 1 Failed: Complete Advocate registration failed.');
  }
  const advocateId = completeData.advocateId;

  // --- TEST 2 — Direct Database Inspection for Original Aadhaar Number ---
  console.log('\n[Test 2] Querying database directly to inspect Advocate record...');
  const storedAdvocate = await prisma.advocate.findUnique({ where: { id: advocateId } });
  console.log('Stored Advocate ID:', storedAdvocate.id);
  console.log('Stored Advocate aadhaarNumber:', storedAdvocate.aadhaarNumber);

  if (storedAdvocate.aadhaarNumber !== plainAadhaar) {
    throw new Error(`Test 2 Failed: Expected stored aadhaarNumber='${plainAadhaar}' but found '${storedAdvocate.aadhaarNumber}'`);
  }

  if (storedAdvocate.aadhaarNumber.includes(':')) {
    throw new Error('Test 2 Failed: Stored Aadhaar number contains encryption IV delimiter!');
  }

  if (storedAdvocate.aadhaarNumber.startsWith('$2b$')) {
    throw new Error('Test 2 Failed: Stored Aadhaar number is a bcrypt hash!');
  }

  // --- TEST 3 — Duplicate Aadhaar Prevention ---
  console.log('\n[Test 3] Testing duplicate Aadhaar prevention...');
  // Start another session
  const startRes2 = await fetch(`${BASE_URL}/api/auth/advocate/register/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Duplicate Aadhaar Advocate',
      email: `dup.aadhaar.${Date.now()}@example.com`,
      gender: 'Female'
    })
  });
  const startData2 = await startRes2.json();
  const regId2 = startData2.registrationId;

  const testPhone2 = `97777${Math.floor(10005 + Math.random() * 89999)}`;
  await prisma.registrationSession.update({
    where: { id: regId2 },
    data: {
      emailVerified: true,
      phone: testPhone2,
      phoneVerified: true,
      profilePhotoUrl: 'https://example.com/photo2.jpg'
    }
  });

  // Verify Aadhaar for second session
  const gen2 = await fetch(`${BASE_URL}/api/auth/advocate/aadhaar/otp/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: regId2, aadhaar_number: plainAadhaar })
  });
  const genData2 = await gen2.json();
  await fetch(`${BASE_URL}/api/auth/advocate/aadhaar/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: regId2, reference_id: genData2.reference_id, otp: '123456' })
  });

  // Complete registration with duplicate Aadhaar number
  const completeDupRes = await fetch(`${BASE_URL}/api/auth/advocate/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationId: regId2,
      barCouncilId: `BCI/DUP/${Date.now()}/2026`,
      aadhaarNumber: plainAadhaar,
      password: 'Password123!',
      languagesSpoken: ['English'],
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400001'
    })
  });
  const completeDupData = await completeDupRes.json();
  console.log('Duplicate complete registration status:', completeDupRes.status, completeDupData);
  if (completeDupRes.status === 200 || completeDupData.success) {
    throw new Error('Test 3 Failed: Duplicate Aadhaar registration was incorrectly allowed!');
  }
  if (!completeDupData.message?.includes('Aadhaar number already exists')) {
    throw new Error(`Test 3 Failed: Expected duplicate Aadhaar error message but got: ${completeDupData.message}`);
  }

  // --- TEST 4 — Privacy & Public API Exclusion ---
  console.log('\n[Test 4] Verifying Aadhaar number privacy in Advocate profile APIs...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/advocate/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const advocateToken = loginData.token;

  // Profile Endpoint
  const profileRes = await fetch(`${BASE_URL}/api/advocate/profile`, {
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  const profileData = await profileRes.json();
  console.log('Profile endpoint aadhaarNumber exposed?', profileData.advocate?.aadhaarNumber !== undefined);
  if (profileData.advocate?.aadhaarNumber !== undefined) {
    throw new Error('Test 4 Failed: aadhaarNumber exposed in GET /api/advocate/profile');
  }

  // Verification Status Endpoint
  const statusRes = await fetch(`${BASE_URL}/api/advocate/profile/verification-status`, {
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  const statusData = await statusRes.json();
  console.log('Verification status response status:', statusRes.status, 'Status:', statusData.status);
  if (statusData.aadhaarNumber !== undefined || (statusData.profile && statusData.profile.aadhaarNumber !== undefined)) {
    throw new Error('Test 4 Failed: aadhaarNumber exposed in verification-status endpoint!');
  }

  console.log('\n===============================================================');
  console.log('  🎉 ALL ADVOCATE ORIGINAL AADHAAR STORAGE TESTS PASSED!  ');
  console.log('===============================================================\n');

  // Clean up test advocates & sessions
  await prisma.advocate.deleteMany({
    where: { id: advocateId }
  }).catch(() => {});

  await prisma.registrationSession.deleteMany({
    where: { id: regId2 }
  }).catch(() => {});

  process.exit(0);
}

runAadhaarStorageTests().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
