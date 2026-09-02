import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt.js';

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5001';

async function runE2ETests() {
  console.log('--- Starting Advocate Team Mate E2E Tests ---');

  // 1. Setup Test Data
  const advocateA = await prisma.advocate.upsert({
    where: { email: 'team_test_advocate_a@example.com' },
    update: { status: 'ACTIVE', isActive: true, barCouncilId: 'DL/10001/2026' },
    create: {
      fullName: 'Advocate Alpha',
      email: 'team_test_advocate_a@example.com',
      phone: '9888811111',
      barCouncilId: 'DL/10001/2026',
      passwordHash: 'dummyhash',
      state: 'Delhi',
      city: 'New Delhi',
      status: 'ACTIVE',
      isActive: true,
      experienceYears: 12,
      bestPracticeArea: 'Civil Law'
    }
  });

  const advocateB = await prisma.advocate.upsert({
    where: { email: 'team_test_advocate_b@example.com' },
    update: { status: 'ACTIVE', isActive: true, barCouncilId: 'DL/10002/2026' },
    create: {
      fullName: 'Advocate Beta',
      email: 'team_test_advocate_b@example.com',
      phone: '9888822222',
      barCouncilId: 'DL/10002/2026',
      passwordHash: 'dummyhash',
      state: 'Delhi',
      city: 'New Delhi',
      status: 'ACTIVE',
      isActive: true,
      experienceYears: 8,
      bestPracticeArea: 'Criminal Law'
    }
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'team_test_user@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Normal User',
      email: 'team_test_user@example.com',
      phone: '9888833333',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  });

  // Clean up any old test requests and team relationships
  const canonicalPair = [advocateA.id, advocateB.id].sort();
  await prisma.advocateTeamMate.deleteMany({
    where: {
      advocateId: canonicalPair[0],
      teamMateId: canonicalPair[1]
    }
  });
  await prisma.advocateTeamRequest.deleteMany({
    where: {
      OR: [
        { requesterAdvocateId: advocateA.id, targetAdvocateId: advocateB.id },
        { requesterAdvocateId: advocateB.id, targetAdvocateId: advocateA.id }
      ]
    }
  });

  const tokenAdvocateA = signToken({ id: advocateA.id, type: 'advocate' });
  const tokenAdvocateB = signToken({ id: advocateB.id, type: 'advocate' });
  const tokenUser = signToken({ id: normalUser.id, type: 'user' });

  const clientA = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${tokenAdvocateA}` }
  });

  const clientB = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${tokenAdvocateB}` }
  });

  const clientUser = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${tokenUser}` }
  });

  try {
    // Test 1: Search Advocate B by BAR ID
    console.log('\n[Test 1] Advocate A searches Advocate B by BAR ID (DL/10002/2026)...');
    const searchRes = await clientA.get('/api/advocates/search?barId=DL/10002/2026');
    console.log('Search Response:', searchRes.status, searchRes.data.advocate.fullName);
    if (!searchRes.data.success || searchRes.data.advocate.id !== advocateB.id) {
      throw new Error('Test 1 Failed: BAR ID Search returned incorrect advocate.');
    }

    // Test 2: Search Non-Existent BAR ID
    console.log('\n[Test 2] Advocate A searches non-existent BAR ID...');
    try {
      await clientA.get('/api/advocates/search?barId=DL/99999/9999');
      throw new Error('Test 2 Failed: Non-existent BAR ID should return 404.');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('Passed 404 check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 3: Cannot add self as team mate
    console.log('\n[Test 3] Advocate A attempts to add self as team mate...');
    try {
      await clientA.post(`/api/advocates/${advocateA.id}/team-request`);
      throw new Error('Test 3 Failed: Self-add should be rejected!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed 400 self-add check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 4: Cannot add BLOCKED advocate
    console.log('\n[Test 4] Advocate A attempts to add BLOCKED advocate...');
    await prisma.advocate.update({
      where: { id: advocateB.id },
      data: { status: 'BLOCKED' }
    });
    try {
      await clientA.post(`/api/advocates/${advocateB.id}/team-request`);
      throw new Error('Test 4 Failed: Blocked advocate request should be rejected!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 blocked advocate check:', err.response.data.message);
      } else {
        throw err;
      }
    }
    // Restore Advocate B status to ACTIVE
    await prisma.advocate.update({
      where: { id: advocateB.id },
      data: { status: 'ACTIVE' }
    });

    // Test 5: Initiate Team Request (Send OTP)
    console.log('\n[Test 5] Advocate A initiates team request to Advocate B...');
    const reqRes = await clientA.post(`/api/advocates/${advocateB.id}/team-request`);
    console.log('Team Request Response:', reqRes.status, reqRes.data);
    if (!reqRes.data.success || !reqRes.data.data.requestId || reqRes.data.data.maskedPhone !== '******2222') {
      throw new Error('Test 5 Failed: Team request initiation failed.');
    }
    const requestId = reqRes.data.data.requestId;

    // Test 6: Duplicate Pending Request Rejection
    console.log('\n[Test 6] Advocate A attempts duplicate pending team request...');
    try {
      await clientA.post(`/api/advocates/${advocateB.id}/team-request`);
      throw new Error('Test 6 Failed: Duplicate pending request should return 409 Conflict!');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('Passed 409 duplicate request check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 7: Verify with Incorrect OTP
    console.log('\n[Test 7] Advocate A submits incorrect OTP (000000)...');
    try {
      await clientA.post(`/api/advocates/team-request/${requestId}/verify`, { otp: '000000' });
      throw new Error('Test 7 Failed: Incorrect OTP should fail!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed 400 invalid OTP check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 8: Verify with Correct OTP
    console.log('\n[Test 8] Advocate A submits correct OTP (123456)...');
    // Set known test OTP hash for verification test
    await prisma.advocateTeamRequest.update({
      where: { id: requestId },
      data: { otpHash: await bcrypt.hash('123456', 10) }
    });
    const verifyRes = await clientA.post(`/api/advocates/team-request/${requestId}/verify`, { otp: '123456' });
    console.log('Verify Response:', verifyRes.status, verifyRes.data);
    if (!verifyRes.data.success || verifyRes.data.data.verified !== true) {
      throw new Error('Test 8 Failed: Verification failed.');
    }

    // Test 9: Get Team Mates for Advocate A
    console.log('\n[Test 9] Advocate A calls GET /api/advocates/team-mates...');
    const teamA = await clientA.get('/api/advocates/team-mates');
    console.log('Advocate A Team Mates count:', teamA.data.teamMates.length);
    if (!teamA.data.teamMates.some(t => t.id === advocateB.id)) {
      throw new Error('Test 9 Failed: Advocate B is not in Advocate A team list.');
    }

    // Test 10: Get Team Mates for Advocate B (Mutual Relationship)
    console.log('\n[Test 10] Advocate B calls GET /api/advocates/team-mates...');
    const teamB = await clientB.get('/api/advocates/team-mates');
    console.log('Advocate B Team Mates count:', teamB.data.teamMates.length);
    if (!teamB.data.teamMates.some(t => t.id === advocateA.id)) {
      throw new Error('Test 10 Failed: Advocate A is not in Advocate B team list (Mutual failure).');
    }

    // Test 11: Attempt duplicate team request for already existing team mate
    console.log('\n[Test 11] Attempt team request for already existing team mate...');
    try {
      await clientA.post(`/api/advocates/${advocateB.id}/team-request`);
      throw new Error('Test 11 Failed: Request to existing team mate should fail with 409!');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('Passed 409 existing team mate check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 12: Remove Team Mate
    console.log('\n[Test 12] Advocate A removes Advocate B from team...');
    const removeRes = await clientA.delete(`/api/advocates/team-mates/${advocateB.id}`);
    console.log('Remove Response:', removeRes.status, removeRes.data);
    if (!removeRes.data.success) {
      throw new Error('Test 12 Failed: Removal failed.');
    }

    // Verify team list after removal
    const teamAAfter = await clientA.get('/api/advocates/team-mates');
    if (teamAAfter.data.teamMates.some(t => t.id === advocateB.id)) {
      throw new Error('Test 12 Failed: Advocate B still present after removal.');
    }

    // Test 13: Remove Team Mate again (404 Not Found)
    console.log('\n[Test 13] Advocate A attempts to remove non-existent team mate...');
    try {
      await clientA.delete(`/api/advocates/team-mates/${advocateB.id}`);
      throw new Error('Test 13 Failed: Removal of non-existent team mate should return 404!');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('Passed 404 check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Test 14: Non-Advocate Role Authorization Rejection
    console.log('\n[Test 14] Normal USER attempts to access Advocate search endpoint...');
    try {
      await clientUser.get('/api/advocates/search?barId=DL/10001/2026');
      throw new Error('Test 14 Failed: Normal user should get 403 Forbidden!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 role authorization check:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Clean up test data
    await prisma.advocateTeamMate.deleteMany({
      where: {
        advocateId: canonicalPair[0],
        teamMateId: canonicalPair[1]
      }
    });
    await prisma.advocateTeamRequest.deleteMany({
      where: {
        OR: [
          { requesterAdvocateId: advocateA.id, targetAdvocateId: advocateB.id },
          { requesterAdvocateId: advocateB.id, targetAdvocateId: advocateA.id }
        ]
      }
    });
    await prisma.advocate.deleteMany({
      where: { id: { in: [advocateA.id, advocateB.id] } }
    });
    await prisma.user.delete({ where: { id: normalUser.id } });

    console.log('\n=============================================');
    console.log('ALL ADVOCATE TEAM MATE E2E TESTS PASSED 🚀');
    console.log('=============================================');

  } catch (error) {
    console.error('\nE2E Test Failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    // Clean up on failure
    await prisma.advocateTeamMate.deleteMany({
      where: {
        advocateId: canonicalPair[0],
        teamMateId: canonicalPair[1]
      }
    }).catch(() => {});
    await prisma.advocateTeamRequest.deleteMany({
      where: {
        OR: [
          { requesterAdvocateId: advocateA.id, targetAdvocateId: advocateB.id },
          { requesterAdvocateId: advocateB.id, targetAdvocateId: advocateA.id }
        ]
      }
    }).catch(() => {});
    await prisma.advocate.deleteMany({
      where: { id: { in: [advocateA.id, advocateB.id] } }
    }).catch(() => {});
    await prisma.user.delete({ where: { id: normalUser.id } }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
