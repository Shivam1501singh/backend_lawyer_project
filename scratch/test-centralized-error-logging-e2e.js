import prisma from '../src/lib/prisma.js';
import { sanitizeText, determineStatusCode, logApiError } from '../src/services/errorLogger.service.js';
import bcrypt from 'bcryptjs';
import { spawn } from 'child_process';

let PORT = process.env.PORT || 5099;
let BASE_URL = `http://localhost:${PORT}`;
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
  console.log(`Starting background server on port ${PORT}...`);
  serverProcess = spawn('node', ['src/server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'inherit'
  });

  // Wait for server to start
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const healthy = await checkHealth(BASE_URL);
    if (healthy) {
      console.log(`Server started successfully on ${BASE_URL}\n`);
      return;
    }
  }
  throw new Error(`Failed to start server on ${BASE_URL}`);
}

async function stopServer() {
  if (serverProcess) {
    console.log('Stopping test server process...');
    serverProcess.kill('SIGTERM');
  }
}

async function waitForErrorLog(whereClause, retries = 15, delayMs = 300) {
  for (let i = 0; i < retries; i++) {
    const log = await prisma.errorLog.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    if (log) return log;
    await new Promise(r => setTimeout(r, delayMs));
  }
  return null;
}

async function runCentralizedErrorLoggingTests() {
  console.log('--- Starting Centralized Error Logging System E2E & Unit Test Suite ---');

  // Verify server health or spawn server on port 5099
  let healthy = await checkHealth(BASE_URL);
  if (!healthy) {
    await startServer();
  } else {
    console.log(`✅ Server health verified on ${BASE_URL}\n`);
  }

  // ==========================================
  // UNIT TEST: Sensitive Data Redaction & Sanitization
  // ==========================================
  console.log('[Unit Test] Sensitive Data Redaction & Aadhaar Sanitization');
  const sensitiveErrorString = 'Aadhaar 1234-5678-9012 failed verification. Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.signature. Password password: MySecretPass123!';
  const sanitized = sanitizeText(sensitiveErrorString);
  console.log('Original:', sensitiveErrorString);
  console.log('Sanitized:', sanitized);

  if (sanitized.includes('1234-5678-9012') || sanitized.includes('123456789012')) {
    throw new Error('Aadhaar redaction failed! Plaintext Aadhaar still visible.');
  }
  if (!sanitized.includes('XXXX-XXXX-9012')) {
    throw new Error('Aadhaar redaction format incorrect! Expected XXXX-XXXX-9012');
  }
  if (sanitized.includes('eyJhbGciOiJIUzI1Ni')) {
    throw new Error('JWT token redaction failed! JWT still visible.');
  }
  if (sanitized.includes('MySecretPass123!')) {
    throw new Error('Password redaction failed! Password still visible.');
  }
  console.log('✅ [Unit Test] Sensitive Data Sanitization Passed\n');


  // ==========================================
  // TEST 1 — 500 Server Error Database Logging
  // ==========================================
  console.log('[Test 1] 500 Server Error Database Logging');
  const test500Url = `/api/test-500-error-${Date.now()}`;
  const mock500Err = new Error('Database query connection timeout error');
  mock500Err.name = 'DatabaseError';

  await logApiError(mock500Err, {
    originalUrl: test500Url,
    path: test500Url,
    method: 'POST',
    ip: '192.168.1.50'
  });

  const log500 = await waitForErrorLog({ url: test500Url });

  if (!log500) {
    throw new Error(`Test 1 Failed: ErrorLog record for ${test500Url} not found in DB`);
  }
  console.log('Retrieved 500 ErrorLog:', {
    id: log500.id,
    ipAddress: log500.ipAddress,
    method: log500.method,
    url: log500.url,
    statusCode: log500.statusCode,
    errorName: log500.errorName,
    errorMessage: log500.errorMessage,
    date: log500.date,
    time: log500.time
  });

  if (log500.statusCode !== 500 || log500.method !== 'POST' || log500.ipAddress !== '192.168.1.50' || !log500.date || !log500.time) {
    throw new Error('Test 1 Failed: Fields in 500 ErrorLog record do not match expected values.');
  }
  console.log('✅ [Test 1] 500 Server Error Logging Passed\n');


  // ==========================================
  // TEST 2 — 404 Unmatched Route Error
  // ==========================================
  console.log('[Test 2] 404 Route Not Found Logging');
  const test404Path = `/api/nonexistent-route-${Date.now()}`;
  const res404 = await fetch(`${BASE_URL}${test404Path}`);
  const data404 = await res404.json();

  console.log('404 API Response:', data404);
  if (res404.status !== 404) {
    throw new Error(`Test 2 Failed: Expected 404 HTTP status, got ${res404.status}`);
  }

  const log404 = await waitForErrorLog({ url: test404Path });

  if (!log404) {
    throw new Error(`Test 2 Failed: ErrorLog for 404 route ${test404Path} not found in DB`);
  }
  console.log('Retrieved 404 ErrorLog from DB:', {
    id: log404.id,
    url: log404.url,
    method: log404.method,
    statusCode: log404.statusCode,
    errorMessage: log404.errorMessage
  });

  if (log404.statusCode !== 404 || log404.method !== 'GET') {
    throw new Error('Test 2 Failed: 404 ErrorLog fields invalid.');
  }
  console.log('✅ [Test 2] 404 Route Not Found Logging Passed\n');


  // ==========================================
  // TEST 3 — 400 Validation / Controlled Error
  // ==========================================
  console.log('[Test 3] 400 Validation / Controlled Error Logging');
  const res400 = await fetch(`${BASE_URL}/api/auth/user/login/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}) // Empty body triggers validation / controlled 400 error
  });
  const data400 = await res400.json();
  console.log('400 API Response:', data400);

  if (res400.status !== 400 || data400.success !== false) {
    throw new Error(`Test 3 Failed: Expected 400 status on invalid body, got ${res400.status}`);
  }

  const log400 = await waitForErrorLog({ url: '/api/auth/user/login/send-otp' });


  if (!log400) {
    throw new Error('Test 3 Failed: ErrorLog record for validation/controlled error not created');
  }
  console.log('Retrieved 400 ErrorLog:', {
    id: log400.id,
    url: log400.url,
    statusCode: log400.statusCode,
    errorMessage: log400.errorMessage
  });

  if (log400.statusCode !== 400) {
    throw new Error(`Test 3 Failed: Expected statusCode 400 in DB, got ${log400.statusCode}`);
  }
  console.log('✅ [Test 3] 400 Validation / Controlled Error Logging Passed\n');


  // ==========================================
  // TEST 4 — Authenticated User Error
  // ==========================================
  console.log('[Test 4] Authenticated User Error Logging');
  const authPhone = `98888${Math.floor(10000 + Math.random() * 89999)}`;
  const authEmail = `autherr.${Date.now()}@example.com`;
  const passHash = await bcrypt.hash('Password123!', 10);

  const testAdvocate = await prisma.advocate.create({
    data: {
      fullName: 'Error Logger Test Advocate',
      phone: authPhone,
      email: authEmail,
      barCouncilId: `BCI/ERR/${Date.now()}`,
      passwordHash: passHash,
      languagesSpoken: ['English'],
      state: 'Delhi',
      city: 'Delhi',
      phoneVerified: true,
      emailVerified: true,
      approvalStatus: 'APPROVED'
    }
  });

  // Login advocate
  const loginRes = await fetch(`${BASE_URL}/api/auth/advocate/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: authEmail, password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // Trigger error while authenticated (bio < 50 words triggers 400 error)
  const authErrPath = '/api/advocate/profile';
  const authErrRes = await fetch(`${BASE_URL}${authErrPath}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ bio: 'Too short' })
  });
  const authErrData = await authErrRes.json();
  console.log('Authenticated Error API Response:', authErrData);

  const authErrorLog = await waitForErrorLog({
    url: authErrPath,
    userId: testAdvocate.id
  });

  if (!authErrorLog) {
    throw new Error(`Test 4 Failed: ErrorLog for user ID ${testAdvocate.id} not found in DB`);
  }

  console.log('Retrieved Authenticated ErrorLog:', {
    id: authErrorLog.id,
    userId: authErrorLog.userId,
    userType: authErrorLog.userType,
    statusCode: authErrorLog.statusCode,
    errorMessage: authErrorLog.errorMessage
  });

  if (authErrorLog.userId !== testAdvocate.id || !authErrorLog.userType) {
    throw new Error('Test 4 Failed: userId or userType missing from authenticated ErrorLog.');
  }

  // Cleanup test advocate
  await prisma.advocate.delete({ where: { id: testAdvocate.id } });
  console.log('✅ [Test 4] Authenticated User Error Logging Passed\n');


  // ==========================================
  // TEST 5 — Unauthenticated Error
  // ==========================================
  console.log('[Test 5] Unauthenticated Request Error Logging');
  const unauthPath = '/api/saved-lawyers';
  const unauthRes = await fetch(`${BASE_URL}${unauthPath}`);
  const unauthData = await unauthRes.json();

  console.log('Unauthenticated Error Response:', unauthData);

  const unauthLog = await waitForErrorLog({ url: unauthPath });

  if (!unauthLog) {
    throw new Error('Test 5 Failed: Unauthenticated error was not logged in DB.');
  }

  console.log('Retrieved Unauthenticated ErrorLog:', {
    id: unauthLog.id,
    userId: unauthLog.userId,
    userType: unauthLog.userType,
    statusCode: unauthLog.statusCode
  });

  if (unauthLog.userId !== null) {
    throw new Error('Test 5 Failed: userId should be null for unauthenticated requests.');
  }
  console.log('✅ [Test 5] Unauthenticated Error Logging Passed\n');


  // ==========================================
  // TEST 6 — Fail-Safe Error Logger Isolation
  // ==========================================
  console.log('[Test 6] Fail-Safe DB Logging Failure Fallback');
  const mockReq = {
    originalUrl: '/api/fail-safe-test',
    method: 'GET',
    ip: '127.0.0.1'
  };

  const originalCreate = prisma.errorLog.create;
  prisma.errorLog.create = async () => {
    throw new Error('Simulated Database Down Exception');
  };

  try {
    await logApiError(new Error('API failure with broken DB logger'), mockReq);
    console.log('logApiError executed safely without throwing exception when DB is down.');
  } catch (err) {
    prisma.errorLog.create = originalCreate;
    throw new Error(`Test 6 Failed: logApiError threw exception during DB failure: ${err.message}`);
  } finally {
    prisma.errorLog.create = originalCreate;
  }
  console.log('✅ [Test 6] Fail-Safe Error Logger Isolation Passed\n');


  // ==========================================
  // TEST 7 — E2E Aadhaar Redaction Verification in DB
  // ==========================================
  console.log('[Test 7] E2E Aadhaar Number Redaction Verification in DB');
  const aadhaarTestUrl = `/api/aadhaar-redaction-test-${Date.now()}`;
  const errWithAadhaar = new Error('Aadhaar validation failed for number 987654321098 and OTP hash $2a$10$abcdef');

  await logApiError(errWithAadhaar, {
    originalUrl: aadhaarTestUrl,
    method: 'POST',
    ip: '127.0.0.1'
  });

  const aadhaarLog = await waitForErrorLog({ url: aadhaarTestUrl });

  if (!aadhaarLog) {
    throw new Error('Test 7 Failed: Aadhaar error log record not found');
  }

  console.log('Retrieved Aadhaar ErrorLog Message:', aadhaarLog.errorMessage);
  if (aadhaarLog.errorMessage.includes('987654321098')) {
    throw new Error('Test 7 Failed: Plaintext Aadhaar number found in database ErrorLog record!');
  }
  if (!aadhaarLog.errorMessage.includes('XXXX-XXXX-1098')) {
    throw new Error('Test 7 Failed: Redacted Aadhaar format XXXX-XXXX-1098 missing from DB log.');
  }
  console.log('✅ [Test 7] E2E Aadhaar Redaction Verification Passed\n');

  console.log('🎉 ALL 7 CENTRALIZED ERROR LOGGING TESTS PASSED SUCCESSFULLY! 🎉');
}

runCentralizedErrorLoggingTests()
  .then(async () => {
    await stopServer();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n❌ Centralized Error Logger Test Suite Failed:', err);
    await stopServer();
    process.exit(1);
  });
