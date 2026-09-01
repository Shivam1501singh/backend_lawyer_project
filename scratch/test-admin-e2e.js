import prisma from '../src/lib/prisma.js';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting Admin End-to-End Verification Tests ---');

  // 1. Test Admin Login (Success)
  console.log('\n1. Testing Admin Login (it2@techvunex.in / 123456)...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'it2@techvunex.in', password: '123456' })
  });

  const adminLoginData = await adminLoginRes.json();
  console.log('Status:', adminLoginRes.status);
  console.log('Response:', JSON.stringify(adminLoginData, null, 2));

  if (!adminLoginData.success || !adminLoginData.token) {
    throw new Error('Admin login failed!');
  }
  const adminToken = adminLoginData.token;

  // 2. Test Admin Login (Invalid Password)
  console.log('\n2. Testing Admin Login with Invalid Password...');
  const invalidLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'it2@techvunex.in', password: 'wrongpassword' })
  });
  console.log('Status:', invalidLoginRes.status, 'Body:', await invalidLoginRes.json());

  // 3. Test Create Content Creator (Admin Auth)
  console.log('\n3. Testing Admin Create Content Creator...');
  const testCreatorEmail = `testcreator_${Date.now()}@example.com`;
  const createCreatorRes = await fetch(`${BASE_URL}/api/admin/content-creators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Test Creator',
      email: testCreatorEmail,
      password: 'password123',
      bio: 'Bio for test creator'
    })
  });
  const createCreatorData = await createCreatorRes.json();
  console.log('Status:', createCreatorRes.status);
  console.log('Response:', JSON.stringify(createCreatorData, null, 2));

  // Verify password hash is not returned
  if (createCreatorData.contentCreator?.passwordHash || createCreatorData.contentCreator?.password) {
    throw new Error('SECURITY VIOLATION: Password returned in create Content Creator response!');
  }

  // 4. Test Duplicate Content Creator (Conflict 409)
  console.log('\n4. Testing Duplicate Content Creator Creation (Conflict 409)...');
  const dupCreatorRes = await fetch(`${BASE_URL}/api/admin/content-creators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Test Creator',
      email: testCreatorEmail,
      password: 'password123'
    })
  });
  console.log('Status:', dupCreatorRes.status, 'Body:', await dupCreatorRes.json());

  // 5. Test List Content Creators (Admin Auth)
  console.log('\n5. Testing Admin List Content Creators...');
  const listCreatorsRes = await fetch(`${BASE_URL}/api/admin/content-creators`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listCreatorsData = await listCreatorsRes.json();
  console.log('Status:', listCreatorsRes.status, 'Count:', listCreatorsData.contentCreators?.length);

  // 6. Test List Advocates (Admin Auth)
  console.log('\n6. Testing Admin List Advocates...');
  const listAdvocatesRes = await fetch(`${BASE_URL}/api/admin/advocates`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listAdvocatesData = await listAdvocatesRes.json();
  console.log('Status:', listAdvocatesRes.status, 'Count:', listAdvocatesData.advocates?.length);
  if (!listAdvocatesData.advocates || listAdvocatesData.advocates.length === 0) {
    throw new Error('No advocates found for Admin listing!');
  }

  const targetAdvocate = listAdvocatesData.advocates[0];
  console.log(`Target Advocate for Block/Activate: ID=${targetAdvocate.id}, Name=${targetAdvocate.name}`);

  // 7. Test Admin Block Advocate
  console.log(`\n7. Testing Admin Block Advocate (ID=${targetAdvocate.id})...`);
  const blockRes = await fetch(`${BASE_URL}/api/admin/advocates/${targetAdvocate.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'BLOCKED' })
  });
  const blockData = await blockRes.json();
  console.log('Status:', blockRes.status);
  console.log('Response:', JSON.stringify(blockData, null, 2));

  // 8. CRITICAL: Test Blocked Advocate is Hidden from Normal User Lawyer Discovery
  console.log('\n8. Testing Blocked Advocate is Hidden from User Directory (GET /api/advocates)...');
  const directoryRes = await fetch(`${BASE_URL}/api/advocates?limit=100`);
  const directoryData = await directoryRes.json();
  const isPresentInDirectory = directoryData.advocates?.some(a => a.id === targetAdvocate.id);
  console.log(`Blocked Advocate present in Normal User Directory? ${isPresentInDirectory}`);
  if (isPresentInDirectory) {
    throw new Error('CRITICAL FAILURE: Blocked Advocate appeared in Normal User directory listing!');
  }

  // 9. Test Direct Profile Access for Blocked Advocate returns 404
  console.log(`\n9. Testing Public Profile for Blocked Advocate (GET /api/advocates/${targetAdvocate.id})...`);
  const publicProfileRes = await fetch(`${BASE_URL}/api/advocates/${targetAdvocate.id}`);
  console.log('Status:', publicProfileRes.status, 'Body:', await publicProfileRes.json());
  if (publicProfileRes.status !== 404) {
    throw new Error('CRITICAL FAILURE: Blocked Advocate profile returned 200 OK instead of 404 Not Found!');
  }

  // 10. Test Admin Activate Advocate
  console.log(`\n10. Testing Admin Activate Advocate (ID=${targetAdvocate.id})...`);
  const activateRes = await fetch(`${BASE_URL}/api/admin/advocates/${targetAdvocate.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'ACTIVE' })
  });
  const activateData = await activateRes.json();
  console.log('Status:', activateRes.status);
  console.log('Response:', JSON.stringify(activateData, null, 2));

  // 11. Verify Activated Advocate is visible again
  console.log('\n11. Testing Activated Advocate is Visible in Directory (GET /api/advocates)...');
  const directoryRes2 = await fetch(`${BASE_URL}/api/advocates?limit=100`);
  const directoryData2 = await directoryRes2.json();
  const isPresentInDirectory2 = directoryData2.advocates?.some(a => a.id === targetAdvocate.id);
  console.log(`Activated Advocate present in Normal User Directory? ${isPresentInDirectory2}`);
  if (!isPresentInDirectory2) {
    throw new Error('Activated Advocate did not reappear in Directory listing!');
  }

  // 12. Test Invalid Status Update
  console.log('\n12. Testing Invalid Advocate Status (e.g. "INVALID_STATUS")...');
  const invalidStatusRes = await fetch(`${BASE_URL}/api/admin/advocates/${targetAdvocate.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'SUSPENDED' })
  });
  console.log('Status:', invalidStatusRes.status, 'Body:', await invalidStatusRes.json());

  // 13. Test Unauthenticated Access to Admin API (401 Unauthorized)
  console.log('\n13. Testing Unauthenticated Request to GET /api/admin/advocates...');
  const unauthRes = await fetch(`${BASE_URL}/api/admin/advocates`);
  console.log('Status:', unauthRes.status, 'Body:', await unauthRes.json());
  if (unauthRes.status !== 401) {
    throw new Error('Unauthenticated request did not return 401!');
  }

  // 14. Test Content Creator Login & Blog Functionality
  console.log('\n14. Testing Content Creator Login & Public Blog APIs...');
  const creatorLoginRes = await fetch(`${BASE_URL}/api/content-creator/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'trainee6@techvunex.in', password: '1234' })
  });
  const creatorLoginData = await creatorLoginRes.json();
  console.log('Content Creator Login Status:', creatorLoginRes.status);
  const creatorToken = creatorLoginData.token;

  // Attempt Content Creator accessing Admin API (Forbidden 403)
  console.log('\n15. Testing Content Creator accessing Admin API (GET /api/admin/advocates)...');
  const forbiddenRes = await fetch(`${BASE_URL}/api/admin/advocates`, {
    headers: { 'Authorization': `Bearer ${creatorToken}` }
  });
  console.log('Status:', forbiddenRes.status, 'Body:', await forbiddenRes.json());
  if (forbiddenRes.status !== 403) {
    throw new Error('Non-admin user accessing Admin API did not return 403 Forbidden!');
  }

  // 16. Test Public Blogs List
  console.log('\n16. Testing Public Blogs List (GET /api/blogs)...');
  const blogsRes = await fetch(`${BASE_URL}/api/blogs`);
  const blogsData = await blogsRes.json();
  console.log('Status:', blogsRes.status, 'Blogs count:', blogsData.blogs?.length);

  console.log('\n✅ ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ E2E TEST FAILED:', err);
  process.exit(1);
});
