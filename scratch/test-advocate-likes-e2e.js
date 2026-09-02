import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import { signToken } from '../src/utils/jwt.js';

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5001';

async function runE2ETests() {
  console.log('--- Starting Advocate Likes E2E Tests ---');

  // 1. Setup Test Data in DB
  const user1 = await prisma.user.upsert({
    where: { email: 'like_test_user1@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Like Test User 1',
      email: 'like_test_user1@example.com',
      phone: '9999911111',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'like_test_user2@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Like Test User 2',
      email: 'like_test_user2@example.com',
      phone: '9999922222',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  });

  const advocate = await prisma.advocate.upsert({
    where: { email: 'like_test_advocate@example.com' },
    update: { status: 'ACTIVE', isActive: true },
    create: {
      fullName: 'Like Test Advocate',
      email: 'like_test_advocate@example.com',
      phone: '9999933333',
      barCouncilId: 'DL/99999/2026',
      passwordHash: 'dummyhash',
      state: 'Delhi',
      city: 'Delhi',
      status: 'ACTIVE',
      isActive: true,
      experienceYears: 10,
      casesWon: 50,
      practiceAreas: ['Criminal Law']
    }
  });

  // Clean up any pre-existing likes for test advocate
  await prisma.advocateLike.deleteMany({
    where: { advocateId: advocate.id }
  });

  const tokenUser1 = signToken({ id: user1.id, type: 'user' });
  const tokenUser2 = signToken({ id: user2.id, type: 'user' });
  const tokenAdvocate = signToken({ id: advocate.id, type: 'advocate' });

  const clientUser1 = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${tokenUser1}` }
  });

  const clientUser2 = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${tokenUser2}` }
  });

  const clientAdvocate = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${tokenAdvocate}` }
  });

  try {
    // Test 1: User 1 Likes Advocate
    console.log('\n[Test 1] User 1 Likes Advocate...');
    const res1 = await clientUser1.post(`/api/advocates/${advocate.id}/like`);
    console.log('Response:', res1.status, res1.data);
    if (!res1.data.success || res1.data.data.liked !== true || res1.data.data.likeCount !== 1) {
      throw new Error('Test 1 Failed!');
    }

    // Test 2: User 1 attempts duplicate like
    console.log('\n[Test 2] User 1 attempts duplicate like...');
    try {
      await clientUser1.post(`/api/advocates/${advocate.id}/like`);
      throw new Error('Test 2 Failed: Duplicate like should have been rejected!');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('Passed 409 Conflict:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 3: Public profile & discovery checks likeCount and isLiked
    console.log('\n[Test 3] Check advocate profile for User 1 vs Unauthenticated...');
    const resProfUser1 = await clientUser1.get(`/api/advocates/${advocate.id}`);
    console.log('User 1 Profile View:', {
      likeCount: resProfUser1.data.advocate.likeCount,
      isLiked: resProfUser1.data.advocate.isLiked
    });
    if (resProfUser1.data.advocate.likeCount !== 1 || resProfUser1.data.advocate.isLiked !== true) {
      throw new Error('Test 3 User 1 Failed!');
    }

    const resProfPublic = await axios.get(`${BASE_URL}/api/advocates/${advocate.id}`);
    console.log('Public Profile View:', {
      likeCount: resProfPublic.data.advocate.likeCount,
      isLiked: resProfPublic.data.advocate.isLiked
    });
    if (resProfPublic.data.advocate.likeCount !== 1 || resProfPublic.data.advocate.isLiked !== false) {
      throw new Error('Test 3 Public Failed!');
    }

    // Test 4: User 2 Likes Advocate
    console.log('\n[Test 4] User 2 Likes Advocate...');
    const res2 = await clientUser2.post(`/api/advocates/${advocate.id}/like`);
    console.log('Response:', res2.status, res2.data);
    if (!res2.data.success || res2.data.data.likeCount !== 2) {
      throw new Error('Test 4 Failed!');
    }

    // Test 5: Get User's Liked Advocates
    console.log('\n[Test 5] GET /api/user/liked-advocates for User 1...');
    const resLikedUser1 = await clientUser1.get('/api/user/liked-advocates');
    console.log('User 1 Liked Advocates count:', resLikedUser1.data.data.length);
    if (!resLikedUser1.data.data.some(a => a.id === advocate.id && a.likeCount === 2 && a.isLiked === true)) {
      throw new Error('Test 5 Failed!');
    }

    // Test 6: User 1 Unlikes Advocate
    console.log('\n[Test 6] User 1 Unlikes Advocate...');
    const resUnlike1 = await clientUser1.delete(`/api/advocates/${advocate.id}/like`);
    console.log('Response:', resUnlike1.status, resUnlike1.data);
    if (!resUnlike1.data.success || resUnlike1.data.data.liked !== false || resUnlike1.data.data.likeCount !== 1) {
      throw new Error('Test 6 Failed!');
    }

    // Test 7: User 1 Unlikes Advocate again
    console.log('\n[Test 7] User 1 Unlikes Advocate again...');
    try {
      await clientUser1.delete(`/api/advocates/${advocate.id}/like`);
      throw new Error('Test 7 Failed: Unlike non-existent should have failed!');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('Passed 404 Not Found:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 8: Blocked Advocate Rule
    console.log('\n[Test 8] Blocking Advocate and attempting to like...');
    await prisma.advocate.update({
      where: { id: advocate.id },
      data: { status: 'BLOCKED' }
    });

    try {
      await clientUser1.post(`/api/advocates/${advocate.id}/like`);
      throw new Error('Test 8 Failed: Blocked advocate should not be likeable!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('Passed Blocked Advocate Check:', err.response.data);
      } else {
        throw err;
      }
    }

    // Test 9: Authorization checks (Advocate account cannot like)
    console.log('\n[Test 9] Advocate role attempting to like...');
    try {
      await clientAdvocate.post(`/api/advocates/${advocate.id}/like`);
      throw new Error('Test 9 Failed: Advocate role should not be allowed to like!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Passed 403 Forbidden check for Advocate role:', err.response.data);
      } else {
        throw err;
      }
    }

    // Restore advocate status
    await prisma.advocate.update({
      where: { id: advocate.id },
      data: { status: 'ACTIVE' }
    });

    // Clean up test data
    await prisma.advocateLike.deleteMany({ where: { advocateId: advocate.id } });
    await prisma.advocate.delete({ where: { id: advocate.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });

    console.log('\n=======================================');
    console.log('ALL ADVOCATE LIKE E2E TESTS PASSED 🚀');
    console.log('=======================================');

  } catch (error) {
    console.error('\nE2E Test Failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    // Cleanup on failure
    await prisma.advocateLike.deleteMany({ where: { advocateId: advocate.id } }).catch(() => {});
    await prisma.advocate.delete({ where: { id: advocate.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
