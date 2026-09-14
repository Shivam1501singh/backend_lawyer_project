import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

let PORT = process.env.PORT || 5000;
let BASE_URL = `http://localhost:${PORT}`;

async function checkHealth(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    return data && data.success;
  } catch (e) {
    return false;
  }
}

function generateWords(count) {
  const wordList = ['advocate', 'lawyer', 'legal', 'court', 'justice', 'client', 'defense', 'counsel', 'practice', 'rights'];
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(`${wordList[i % wordList.length]}${i + 1}`);
  }
  return words;
}

async function runBioWordLimitE2ETests() {
  console.log('--- Starting Advocate Bio Word Limit Validation (50–500 words) E2E Tests ---');

  // Check health
  let healthy = await checkHealth(BASE_URL);
  if (!healthy) {
    PORT = 5001;
    BASE_URL = `http://localhost:${PORT}`;
    healthy = await checkHealth(BASE_URL);
  }
  if (!healthy) {
    console.error('Server is not running on port 5000 or 5001. Please ensure dev server is running.');
    process.exit(1);
  }
  console.log('Server health verified on', BASE_URL);

  // Create temporary advocate for tests
  const testPhone = `97777${Math.floor(10000 + Math.random() * 89999)}`;
  const testEmail = `bio.test.${Date.now()}@example.com`;
  const barId = `BCI/BIO/${Date.now()}`;
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const advocate = await prisma.advocate.create({
    data: {
      fullName: 'Bio Test Advocate',
      phone: testPhone,
      email: testEmail,
      barCouncilId: barId,
      passwordHash,
      languagesSpoken: ['English', 'Hindi'],
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110001',
      phoneVerified: true,
      emailVerified: true,
      approvalStatus: 'APPROVED',
      status: 'ACTIVE'
    }
  });

  console.log('Created test advocate ID:', advocate.id);

  // Login advocate
  const loginRes = await fetch(`${BASE_URL}/api/auth/advocate/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.token;
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login successful.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(cookie ? { 'Cookie': cookie } : {})
  };

  // Helper for PATCH /api/advocate/profile
  async function testProfileUpdate(payload) {
    const res = await fetch(`${BASE_URL}/api/advocate/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  // --- TEST 1 — 49 words (bio field) ---
  console.log('\n[Test 1] 49 words (bio key) -> Expect 400 Bad Request');
  const words49 = generateWords(49).join(' ');
  const res1 = await testProfileUpdate({ bio: words49 });
  console.log('Status:', res1.status, 'Response:', res1.data);
  if (res1.status !== 400 || res1.data.success !== false || res1.data.message !== 'Bio must contain at least 50 words.') {
    throw new Error(`Test 1 Failed! Expected 400 with "Bio must contain at least 50 words.", got status ${res1.status} and message "${res1.data.message}"`);
  }
  console.log('✅ Test 1 Passed');

  // --- TEST 1b — 49 words (about field) ---
  console.log('\n[Test 1b] 49 words (about key) -> Expect 400 Bad Request');
  const res1b = await testProfileUpdate({ about: words49 });
  console.log('Status:', res1b.status, 'Response:', res1b.data);
  if (res1b.status !== 400 || res1b.data.success !== false || res1b.data.message !== 'Bio must contain at least 50 words.') {
    throw new Error(`Test 1b Failed! Expected 400 with "Bio must contain at least 50 words.", got status ${res1b.status}`);
  }
  console.log('✅ Test 1b Passed');

  // --- TEST 2 — 50 words ---
  console.log('\n[Test 2] 50 words -> Expect 200 OK');
  const words50 = generateWords(50).join(' ');
  const res2 = await testProfileUpdate({ bio: words50 });
  console.log('Status:', res2.status, 'Response success:', res2.data.success);
  if (res2.status !== 200 || !res2.data.success) {
    throw new Error(`Test 2 Failed! Expected 200 OK, got status ${res2.status} body: ${JSON.stringify(res2.data)}`);
  }
  console.log('✅ Test 2 Passed');

  // --- TEST 3 — 100 words ---
  console.log('\n[Test 3] 100 words -> Expect 200 OK');
  const words100 = generateWords(100).join(' ');
  const res3 = await testProfileUpdate({ bio: words100 });
  console.log('Status:', res3.status, 'Response success:', res3.data.success);
  if (res3.status !== 200 || !res3.data.success) {
    throw new Error(`Test 3 Failed! Expected 200 OK, got status ${res3.status}`);
  }
  console.log('✅ Test 3 Passed');

  // --- TEST 4 — 500 words ---
  console.log('\n[Test 4] 500 words -> Expect 200 OK');
  const words500 = generateWords(500).join(' ');
  const res4 = await testProfileUpdate({ bio: words500 });
  console.log('Status:', res4.status, 'Response success:', res4.data.success);
  if (res4.status !== 200 || !res4.data.success) {
    throw new Error(`Test 4 Failed! Expected 200 OK, got status ${res4.status}`);
  }
  console.log('✅ Test 4 Passed');

  // --- TEST 5 — 501 words ---
  console.log('\n[Test 5] 501 words -> Expect 400 Bad Request');
  const words501 = generateWords(501).join(' ');
  const res5 = await testProfileUpdate({ bio: words501 });
  console.log('Status:', res5.status, 'Response:', res5.data);
  if (res5.status !== 400 || res5.data.success !== false || res5.data.message !== 'Bio must not exceed 500 words.') {
    throw new Error(`Test 5 Failed! Expected 400 with "Bio must not exceed 500 words.", got status ${res5.status} and message "${res5.data.message}"`);
  }
  console.log('✅ Test 5 Passed');

  // --- TEST 6 — Whitespace Handling (tabs, newlines, multiple spaces) ---
  console.log('\n[Test 6] Whitespace Handling (50 words with multiple spaces, tabs, newlines, leading/trailing spaces) -> Expect 200 OK');
  const whitespaceWords50 = `  \n\t  ${generateWords(50).join('  \n\t\n  ')}   \n\t  `;
  const res6 = await testProfileUpdate({ bio: whitespaceWords50 });
  console.log('Status:', res6.status, 'Response success:', res6.data.success);
  if (res6.status !== 200 || !res6.data.success) {
    throw new Error(`Test 6 Failed! Whitespace 50-word test failed with status ${res6.status}`);
  }
  console.log('✅ Test 6 Passed');

  // --- TEST 7 — Profile Preview display ---
  console.log('\n[Test 7] GET /api/advocate/profile -> Verify bio is returned untruncated');
  const getRes = await fetch(`${BASE_URL}/api/advocate/profile`, { headers });
  const getData = await getRes.json();
  const retrievedBio = getData.advocate ? (getData.advocate.bio || getData.advocate.about) : null;
  const wordCountRetrieved = retrievedBio ? retrievedBio.trim().split(/\s+/).filter(Boolean).length : 0;
  console.log('GET Profile status:', getRes.status, 'Bio word count:', wordCountRetrieved);
  if (getRes.status !== 200 || wordCountRetrieved !== 50 || retrievedBio !== whitespaceWords50.trim()) {
    throw new Error(`Test 7 Failed! Profile bio mismatch or truncated. Got word count ${wordCountRetrieved}`);
  }
  console.log('✅ Test 7 Passed');

  // Cleanup test advocate
  await prisma.advocate.delete({ where: { id: advocate.id } });
  console.log('\nCleaned up test advocate.');
  console.log('\n🎉 ALL ADVOCATE BIO WORD LIMIT E2E TESTS PASSED SUCCESSFULLY! 🎉');
}

runBioWordLimitE2ETests().catch(err => {
  console.error('\n❌ E2E Test Suite Failed:', err);
  process.exit(1);
});
