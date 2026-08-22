import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true // Don't throw on error status codes
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- Starting Aadhaar Lockout Verification Integration Test ---');

  // Step 1: Start registration to get a session ID
  const email = `test-advocate-${Date.now()}@example.com`;
  console.log(`\n[Step 1] Starting registration for: ${email}`);
  const startRes = await api.post('/auth/advocate/register/start', {
    fullName: 'Test Advocate',
    email
  });

  if (!startRes.data.success || !startRes.data.registrationId) {
    console.error('Failed to start registration:', startRes.data);
    process.exit(1);
  }

  const registrationId = startRes.data.registrationId;
  console.log('Registration Session ID:', registrationId);

  // Step 2: Test 1 - First Failed Attempt (Malformed Aadhaar format)
  console.log('\n[Step 2] Sending malformed Aadhaar number (5 digits)');
  const attempt1Res = await api.post('/auth/advocate/aadhaar/initiate', {
    registrationId,
    aadhaarNumber: '12345'
  });

  console.log('Response Status:', attempt1Res.status);
  console.log('Response Body:', attempt1Res.data);

  if (
    attempt1Res.status !== 400 ||
    attempt1Res.data.success !== false ||
    attempt1Res.data.remainingAttempts !== 2 ||
    attempt1Res.data.blocked !== false
  ) {
    console.error('FAIL: Test 1 (Malformed Aadhaar attempt counter incorrect)');
    process.exit(1);
  }
  console.log('PASS: Test 1 successful');

  // Step 3: Test 2 - Second Failed Attempt (Valid format but mock failure)
  console.log('\n[Step 3] Initiating Aadhaar verification for mock fail (123456789000)');
  const attempt2InitRes = await api.post('/auth/advocate/aadhaar/initiate', {
    registrationId,
    aadhaarNumber: '123456789000'
  });

  console.log('Initiate Status:', attempt2InitRes.status);
  console.log('Initiate Body:', attempt2InitRes.data);

  if (attempt2InitRes.status !== 200 || !attempt2InitRes.data.clientId) {
    console.error('FAIL: Failed to initiate verification');
    process.exit(1);
  }

  const clientIdFail = attempt2InitRes.data.clientId;

  console.log('Checking status with failed client ID:', clientIdFail);
  const attempt2VerifyRes = await api.post('/auth/advocate/aadhaar/verify', {
    registrationId,
    clientId: clientIdFail
  });

  console.log('Verify Status:', attempt2VerifyRes.status);
  console.log('Verify Body:', attempt2VerifyRes.data);

  if (
    attempt2VerifyRes.status !== 400 ||
    attempt2VerifyRes.data.success !== false ||
    attempt2VerifyRes.data.remainingAttempts !== 1 ||
    attempt2VerifyRes.data.blocked !== false
  ) {
    console.error('FAIL: Test 2 (Mock fail status check failed to decrement attempts)');
    process.exit(1);
  }
  console.log('PASS: Test 2 successful');

  // Step 4: Test 3 - Third Failed Attempt (Simulated provider failure)
  console.log('\n[Step 4] Initiating third Aadhaar verification for mock fail (123456789000)');
  const attempt3InitRes = await api.post('/auth/advocate/aadhaar/initiate', {
    registrationId,
    aadhaarNumber: '123456789000'
  });

  const clientIdFail3 = attempt3InitRes.data.clientId;

  console.log('Checking status with failed client ID:', clientIdFail3);
  const attempt3VerifyRes = await api.post('/auth/advocate/aadhaar/verify', {
    registrationId,
    clientId: clientIdFail3
  });

  console.log('Verify Status:', attempt3VerifyRes.status);
  console.log('Verify Body:', attempt3VerifyRes.data);

  if (
    attempt3VerifyRes.status !== 400 ||
    attempt3VerifyRes.data.success !== false ||
    attempt3VerifyRes.data.remainingAttempts !== 0 ||
    attempt3VerifyRes.data.blocked !== true ||
    !attempt3VerifyRes.data.blockedUntil
  ) {
    console.error('FAIL: Test 3 (Mock fail did not trigger 24-hour lockout after 3 attempts)');
    process.exit(1);
  }
  console.log('PASS: Test 3 successful (lockout active)');

  // Step 5: Test 4 - Fourth Attempt during active lockout (should fail instantly)
  console.log('\n[Step 5] Initiating valid Aadhaar verification (123456789012) during lockout');
  const attempt4Res = await api.post('/auth/advocate/aadhaar/initiate', {
    registrationId,
    aadhaarNumber: '123456789012'
  });

  console.log('Response Status:', attempt4Res.status);
  console.log('Response Body:', attempt4Res.data);

  if (
    attempt4Res.status !== 403 ||
    attempt4Res.data.success !== false ||
    attempt4Res.data.blocked !== true ||
    !attempt4Res.data.blockedUntil
  ) {
    console.error('FAIL: Test 4 (Request not blocked during active lockout)');
    process.exit(1);
  }
  console.log('PASS: Test 4 successful (request rejected due to block)');

  console.log('\n--- All Aadhaar Lockout Tests Passed Successfully! ---');
}

runTests();
