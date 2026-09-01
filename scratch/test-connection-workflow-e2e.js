import prisma from '../src/lib/prisma.js';
import { signToken } from '../src/utils/jwt.js';

const BASE_URL = 'http://localhost:5000';

async function runE2ETests() {
  console.log('====================================================');
  console.log('Starting Case Connection Request Workflow E2E Tests');
  console.log('====================================================');

  // Fetch test entities from database
  const user = await prisma.user.findFirst();
  const advocates = await prisma.advocate.findMany({ where: { status: 'ACTIVE' }, take: 3 });
  const admin = await prisma.admin.findFirst();

  if (!user || advocates.length < 2 || !admin) {
    throw new Error('Database does not have required test data (user, active advocates, admin). Run seed first.');
  }

  const activeAdvocate1 = advocates[0];
  const activeAdvocate2 = advocates[1];

  console.log(`Test Entities Loaded:
- User: ${user.fullName} (${user.id})
- Advocate 1: ${activeAdvocate1.fullName} (${activeAdvocate1.id})
- Advocate 2: ${activeAdvocate2.fullName} (${activeAdvocate2.id})
- Admin: ${admin.fullName} (${admin.id})
`);

  // Generate tokens
  const userToken = signToken({ id: user.id, type: 'user', role: 'USER' });
  const advocate1Token = signToken({ id: activeAdvocate1.id, type: 'advocate', role: 'ADVOCATE' });
  const advocate2Token = signToken({ id: activeAdvocate2.id, type: 'advocate', role: 'ADVOCATE' });
  const adminToken = signToken({ id: admin.id, type: 'admin', role: 'ADMIN' });

  // ----------------------------------------------------
  // STEP 1: User Submits Connection Request (PENDING)
  // ----------------------------------------------------
  console.log('\n--- Step 1: User Submits Connection Request ---');
  const createRes = await fetch(`${BASE_URL}/api/lawyers/${activeAdvocate1.id}/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      note: 'Need assistance with property dispute.',
      description: 'My family has received a notice regarding property division and I require legal counsel on the next steps.'
    })
  });

  const createData = await createRes.json();
  console.log('Create Response Status:', createRes.status);
  console.log('Create Response Body:', JSON.stringify(createData, null, 2));

  if (createRes.status !== 201 || !createData.data?.id || createData.data.status !== 'PENDING') {
    throw new Error('Step 1 Failed: User connection request creation failed!');
  }
  const requestId = createData.data.id;

  // ----------------------------------------------------
  // STEP 2: Verify Selected Lawyer Has NO Access (PENDING)
  // ----------------------------------------------------
  console.log('\n--- Step 2: Verify Selected Advocate Cannot Access Pending Request ---');
  const advConnectionsRes1 = await fetch(`${BASE_URL}/api/advocate/case-connections`, {
    headers: { 'Authorization': `Bearer ${advocate1Token}` }
  });
  const advConnectionsData1 = await advConnectionsRes1.json();
  console.log('Advocate Connections Count (while PENDING):', advConnectionsData1.connections?.length);
  const pendingCaseFound = advConnectionsData1.connections?.some(c => c.requestId === requestId);
  if (pendingCaseFound) {
    throw new Error('CRITICAL SECURITY VIOLATION: Pending case appeared in Advocate case connections!');
  }

  // ----------------------------------------------------
  // STEP 3: Duplicate Pending Request Prevention (409 Conflict)
  // ----------------------------------------------------
  console.log('\n--- Step 3: Test Duplicate Pending Request Prevention (409 Conflict) ---');
  const dupRes = await fetch(`${BASE_URL}/api/lawyers/${activeAdvocate1.id}/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      note: 'Duplicate request attempt.',
      description: 'This is a second request while the first is pending.'
    })
  });
  console.log('Duplicate Request Status:', dupRes.status);
  const dupData = await dupRes.json();
  console.log('Duplicate Request Body:', dupData);
  if (dupRes.status !== 409) {
    throw new Error(`Step 3 Failed: Duplicate request returned status ${dupRes.status} instead of 409 Conflict!`);
  }

  // ----------------------------------------------------
  // STEP 4: Admin Views Pending Requests
  // ----------------------------------------------------
  console.log('\n--- Step 4: Admin Views Pending Requests ---');
  const adminListRes = await fetch(`${BASE_URL}/api/admin/case-requests?status=PENDING`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminListData = await adminListRes.json();
  console.log('Admin List Status:', adminListRes.status, 'Pending Count:', adminListData.requests?.length);
  const foundInAdminList = adminListData.requests?.find(r => r.id === requestId);
  if (!foundInAdminList) {
    throw new Error('Step 4 Failed: Submitted request not found in Admin pending requests list!');
  }

  const adminGetRes = await fetch(`${BASE_URL}/api/admin/case-requests/${requestId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Admin Get Detail Status:', adminGetRes.status);

  // ----------------------------------------------------
  // STEP 5: Admin Approves / Connects Request
  // ----------------------------------------------------
  console.log('\n--- Step 5: Admin Connects Case Request ---');
  const connectRes = await fetch(`${BASE_URL}/api/admin/case-requests/${requestId}/connect`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const connectData = await connectRes.json();
  console.log('Admin Connect Status:', connectRes.status);
  console.log('Admin Connect Response:', JSON.stringify(connectData, null, 2));
  if (connectRes.status !== 200 || connectData.data?.status !== 'CONNECTED') {
    throw new Error('Step 5 Failed: Admin connect request failed!');
  }
  const connectionId = connectData.data.connectionId;

  // ----------------------------------------------------
  // STEP 6: Verify Assigned Advocate NOW Has Access
  // ----------------------------------------------------
  console.log('\n--- Step 6: Verify Assigned Advocate NOW Has Access ---');
  const advConnectionsRes2 = await fetch(`${BASE_URL}/api/advocate/case-connections`, {
    headers: { 'Authorization': `Bearer ${advocate1Token}` }
  });
  const advConnectionsData2 = await advConnectionsRes2.json();
  console.log('Advocate Connections Count (after CONNECTED):', advConnectionsData2.connections?.length);
  const connectedCaseFound = advConnectionsData2.connections?.some(c => c.requestId === requestId);
  if (!connectedCaseFound) {
    throw new Error('Step 6 Failed: Connected case not found in assigned Advocate list!');
  }

  const advDetailRes = await fetch(`${BASE_URL}/api/advocate/case-connections/${connectionId}`, {
    headers: { 'Authorization': `Bearer ${advocate1Token}` }
  });
  console.log('Advocate Get Detail Status:', advDetailRes.status);
  const advDetailData = await advDetailRes.json();
  console.log('Advocate Detail User Name:', advDetailData.connection?.user?.fullName);

  // ----------------------------------------------------
  // STEP 7: Verify ANOTHER Advocate Cannot Access Connection (403 Forbidden)
  // ----------------------------------------------------
  console.log('\n--- Step 7: Verify Unassigned Advocate Cannot Access Connection (403 Forbidden) ---');
  const adv2Res = await fetch(`${BASE_URL}/api/advocate/case-connections/${connectionId}`, {
    headers: { 'Authorization': `Bearer ${advocate2Token}` }
  });
  console.log('Unassigned Advocate Status:', adv2Res.status, 'Body:', await adv2Res.json());
  if (adv2Res.status !== 403) {
    throw new Error(`Step 7 Failed: Unassigned advocate received status ${adv2Res.status} instead of 403 Forbidden!`);
  }

  // ----------------------------------------------------
  // STEP 8: User Tracks Connection Status
  // ----------------------------------------------------
  console.log('\n--- Step 8: User Tracks Connected Request ---');
  const userTrackRes = await fetch(`${BASE_URL}/api/user/case-requests/${requestId}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const userTrackData = await userTrackRes.json();
  console.log('User Track Status:', userTrackRes.status, 'Request Status:', userTrackData.request?.status);
  if (userTrackData.request?.status !== 'CONNECTED') {
    throw new Error('Step 8 Failed: User tracking did not return CONNECTED status!');
  }

  // ----------------------------------------------------
  // STEP 9: Test Rejection Flow
  // ----------------------------------------------------
  console.log('\n--- Step 9: Test Rejection Flow ---');
  const create2Res = await fetch(`${BASE_URL}/api/lawyers/${activeAdvocate2.id}/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      note: 'Need help with consumer complaint.',
      description: 'Defective product received from seller who refuses refund.'
    })
  });
  const create2Data = await create2Res.json();
  const request2Id = create2Data.data.id;

  const rejectRes = await fetch(`${BASE_URL}/api/admin/case-requests/${request2Id}/reject`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Admin Reject Status:', rejectRes.status, 'Body:', await rejectRes.json());

  // Verify Advocate 2 cannot see rejected request
  const adv2ListRes = await fetch(`${BASE_URL}/api/advocate/case-connections`, {
    headers: { 'Authorization': `Bearer ${advocate2Token}` }
  });
  const adv2ListData = await adv2ListRes.json();
  const rejectedFound = adv2ListData.connections?.some(c => c.requestId === request2Id);
  if (rejectedFound) {
    throw new Error('CRITICAL VIOLATION: Rejected case appeared in Advocate case connections!');
  }

  // ----------------------------------------------------
  // STEP 10: Test Blocked Advocate Connection Rejection (400 Bad Request)
  // ----------------------------------------------------
  console.log('\n--- Step 10: Test Blocked Lawyer Connection Rejection (400 Bad Request) ---');
  // Block Advocate 2
  await fetch(`${BASE_URL}/api/admin/advocates/${activeAdvocate2.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'BLOCKED' })
  });

  const blockedConnectRes = await fetch(`${BASE_URL}/api/lawyers/${activeAdvocate2.id}/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      note: 'Attempting connection to blocked lawyer.',
      description: 'Should fail.'
    })
  });
  console.log('Blocked Lawyer Connect Status:', blockedConnectRes.status, 'Body:', await blockedConnectRes.json());
  if (blockedConnectRes.status !== 400) {
    throw new Error('Step 10 Failed: Connection attempt to BLOCKED advocate did not return 400 Bad Request!');
  }

  // Unblock Advocate 2 back to ACTIVE
  await fetch(`${BASE_URL}/api/admin/advocates/${activeAdvocate2.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'ACTIVE' })
  });

  // ----------------------------------------------------
  // STEP 11: Authorization Restrictions
  // ----------------------------------------------------
  console.log('\n--- Step 11: Testing Authorization Restrictions ---');
  const unauthRes = await fetch(`${BASE_URL}/api/admin/case-requests`);
  console.log('Unauthenticated Status:', unauthRes.status);
  if (unauthRes.status !== 401) throw new Error('Unauthenticated request did not return 401!');

  const userForbiddenRes = await fetch(`${BASE_URL}/api/admin/case-requests`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  console.log('User accessing Admin API Status:', userForbiddenRes.status);
  if (userForbiddenRes.status !== 403) throw new Error('Normal User accessing Admin API did not return 403!');

  console.log('\n====================================================');
  console.log('✅ ALL CASE CONNECTION E2E VERIFICATION TESTS PASSED!');
  console.log('====================================================');
  process.exit(0);
}

runE2ETests().catch(err => {
  console.error('❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
