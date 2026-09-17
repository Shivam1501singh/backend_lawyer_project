import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import { signToken } from '../src/utils/jwt.js';

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5000';

async function runTests() {
  console.log('=== Testing GET /api/advocates/team-mates for experience and barId ===');

  try {
    // 1. Setup Test Advocates
    const advMain = await prisma.advocate.upsert({
      where: { email: 'test_main_advocate@example.com' },
      update: { status: 'ACTIVE', isActive: true, approvalStatus: 'APPROVED', barCouncilId: 'MAIN/BAR/001', experienceYears: 15 },
      create: {
        fullName: 'Main Advocate',
        email: 'test_main_advocate@example.com',
        phone: '9900011111',
        barCouncilId: 'MAIN/BAR/001',
        passwordHash: 'dummyhash',
        state: 'Delhi',
        city: 'New Delhi',
        pincode: '110001',
        status: 'ACTIVE',
        isActive: true,
        approvalStatus: 'APPROVED',
        experienceYears: 15,
        bestPracticeArea: 'Corporate Law'
      }
    });

    const advMember1 = await prisma.advocate.upsert({
      where: { email: 'test_member1_advocate@example.com' },
      update: { status: 'ACTIVE', isActive: true, approvalStatus: 'APPROVED', barCouncilId: 'MEM1/BAR/002', experienceYears: 8 },
      create: {
        fullName: 'Rahul Sharma',
        email: 'test_member1_advocate@example.com',
        phone: '9900022222',
        barCouncilId: 'MEM1/BAR/002',
        passwordHash: 'dummyhash',
        state: 'Delhi',
        city: 'New Delhi',
        pincode: '110001',
        status: 'ACTIVE',
        isActive: true,
        approvalStatus: 'APPROVED',
        experienceYears: 8,
        bestPracticeArea: 'Criminal Law'
      }
    });

    const advMember2 = await prisma.advocate.upsert({
      where: { email: 'test_member2_advocate@example.com' },
      update: { status: 'ACTIVE', isActive: true, approvalStatus: 'APPROVED', barCouncilId: 'MEM2/BAR/003', experienceYears: 3 },
      create: {
        fullName: 'Priya Singh',
        email: 'test_member2_advocate@example.com',
        phone: '9900033333',
        barCouncilId: 'MEM2/BAR/003',
        passwordHash: 'dummyhash',
        state: 'Maharashtra',
        city: 'Mumbai',
        pincode: '400001',
        status: 'ACTIVE',
        isActive: true,
        approvalStatus: 'APPROVED',
        experienceYears: 3,
        bestPracticeArea: 'Family Law'
      }
    });

    // 2. Clear old team connections
    const pair1 = [advMain.id, advMember1.id].sort();
    const pair2 = [advMain.id, advMember2.id].sort();

    await prisma.advocateTeamMate.deleteMany({
      where: {
        OR: [
          { advocateId: pair1[0], teamMateId: pair1[1] },
          { advocateId: pair2[0], teamMateId: pair2[1] }
        ]
      }
    });

    // 3. Connect advMember1 and advMember2 to advMain
    await prisma.advocateTeamMate.createMany({
      data: [
        { advocateId: pair1[0], teamMateId: pair1[1] },
        { advocateId: pair2[0], teamMateId: pair2[1] }
      ]
    });

    // 4. Authenticate as Main Advocate
    const token = signToken({ id: advMain.id, type: 'advocate' });
    const client = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 5. Call GET /api/advocates/team-mates
    console.log('Making request to GET /api/advocates/team-mates...');
    const response = await client.get('/api/advocates/team-mates');

    console.log('Status Code:', response.status);
    console.log('Response Body:', JSON.stringify(response.data, null, 2));

    if (!response.data.success) {
      throw new Error('Expected response.data.success to be true');
    }

    const { teamMates } = response.data;
    if (!Array.isArray(teamMates) || teamMates.length !== 2) {
      throw new Error(`Expected 2 team mates, got ${teamMates?.length}`);
    }

    // Verify Member 1 fields
    const m1 = teamMates.find(m => m.id === advMember1.id);
    if (!m1) throw new Error('Member 1 not found in teamMates');
    console.log('\nChecking Member 1 (Rahul Sharma):');
    console.log('- experience:', m1.experience, '(Expected: 8)');
    console.log('- barId:', m1.barId, '(Expected: MEM1/BAR/002)');
    console.log('- barCouncilId:', m1.barCouncilId, '(Expected: MEM1/BAR/002)');
    console.log('- fullName:', m1.fullName);

    if (m1.experience !== 8) throw new Error(`Member 1 experience mismatch: expected 8, got ${m1.experience}`);
    if (m1.barId !== 'MEM1/BAR/002') throw new Error(`Member 1 barId mismatch: expected MEM1/BAR/002, got ${m1.barId}`);
    if (m1.barCouncilId !== 'MEM1/BAR/002') throw new Error(`Member 1 barCouncilId mismatch: expected MEM1/BAR/002, got ${m1.barCouncilId}`);

    // Verify Member 2 fields
    const m2 = teamMates.find(m => m.id === advMember2.id);
    if (!m2) throw new Error('Member 2 not found in teamMates');
    console.log('\nChecking Member 2 (Priya Singh):');
    console.log('- experience:', m2.experience, '(Expected: 3)');
    console.log('- barId:', m2.barId, '(Expected: MEM2/BAR/003)');
    console.log('- barCouncilId:', m2.barCouncilId, '(Expected: MEM2/BAR/003)');
    console.log('- fullName:', m2.fullName);

    if (m2.experience !== 3) throw new Error(`Member 2 experience mismatch: expected 3, got ${m2.experience}`);
    if (m2.barId !== 'MEM2/BAR/003') throw new Error(`Member 2 barId mismatch: expected MEM2/BAR/003, got ${m2.barId}`);
    if (m2.barCouncilId !== 'MEM2/BAR/003') throw new Error(`Member 2 barCouncilId mismatch: expected MEM2/BAR/003, got ${m2.barCouncilId}`);

    // Clean up
    await prisma.advocateTeamMate.deleteMany({
      where: {
        OR: [
          { advocateId: pair1[0], teamMateId: pair1[1] },
          { advocateId: pair2[0], teamMateId: pair2[1] }
        ]
      }
    });

    console.log('\n✅ ALL VERIFICATION CHECKS PASSED!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
