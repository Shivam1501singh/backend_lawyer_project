import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt.js';

const PORT = 5095;
const BASE_URL = `http://localhost:${PORT}`;

async function runE2ETests() {
  console.log('--- Starting User Rights Management E2E Tests ---');

  // 1. Setup Test Users
  const creatorPasswordHash = await bcrypt.hash('password123', 10);
  const contentCreator = await prisma.contentCreator.upsert({
    where: { email: 'user_rights_creator_test@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Legal Rights Creator',
      email: 'user_rights_creator_test@example.com',
      passwordHash: creatorPasswordHash,
      isActive: true
    }
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user_rights_normal_user_test@example.com' },
    update: { isActive: true },
    create: {
      fullName: 'Citizen User',
      email: 'user_rights_normal_user_test@example.com',
      phone: '9888877771',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  });

  const advocate = await prisma.advocate.upsert({
    where: { email: 'user_rights_advocate_test@example.com' },
    update: { isActive: true, status: 'ACTIVE' },
    create: {
      fullName: 'Advocate Verma',
      email: 'user_rights_advocate_test@example.com',
      phone: '9888877772',
      barCouncilId: 'DL/77777/2026',
      passwordHash: 'dummyhash',
      state: 'Delhi',
      city: 'Delhi',
      status: 'ACTIVE',
      isActive: true
    }
  });

  // Clean up any test User Rights
  await prisma.userRight.deleteMany({
    where: {
      title: {
        in: [
          'Right to Equality',
          'Right to Free Speech',
          'Right to Education',
          'Right to Privacy',
          'Updated Right to Equality'
        ]
      }
    }
  });

  const creatorToken = signToken({ id: contentCreator.id, type: 'content_creator' });
  const userToken = signToken({ id: normalUser.id, type: 'user' });
  const advocateToken = signToken({ id: advocate.id, type: 'advocate' });

  const clientCreator = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${creatorToken}` }
  });

  const clientUser = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${userToken}` }
  });

  const clientAdvocate = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${advocateToken}` }
  });

  const clientPublic = axios.create({
    baseURL: BASE_URL
  });

  let createdRightId1 = null;
  let createdRightId2 = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Create User Right without photo (Content Creator)
    // ----------------------------------------------------
    console.log('\n[Test 1] Content Creator creates User Right without photo...');
    const resCreate1 = await clientCreator.post('/api/content-creator/user-rights', {
      title: 'Right to Equality',
      description: 'Every citizen has the right to equality before the law and equal protection of the laws.'
    });

    if (resCreate1.status === 201 && resCreate1.data.success && resCreate1.data.data.title === 'Right to Equality') {
      console.log('✅ Test 1 Passed: User Right created successfully:', resCreate1.data.data);
      createdRightId1 = resCreate1.data.data.id;
    } else {
      throw new Error(`Test 1 Failed: Unexpected response: ${JSON.stringify(resCreate1.data)}`);
    }

    // ----------------------------------------------------
    // TEST 2: Create User Right with Photo using Multipart Form-Data
    // ----------------------------------------------------
    console.log('\n[Test 2] Content Creator creates User Right with photo (multipart/form-data)...');
    const formData = new FormData();
    formData.append('title', 'Right to Free Speech');
    formData.append('description', 'All citizens shall have the right to freedom of speech and expression.');
    
    // Create a 1x1 png dummy buffer
    const dummyPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const blob = new Blob([dummyPngBuffer], { type: 'image/png' });
    formData.append('photo', blob, 'rights_test.png');

    const resCreate2 = await clientCreator.post('/api/content-creator/user-rights', formData);

    if (resCreate2.status === 201 && resCreate2.data.success && resCreate2.data.data.title === 'Right to Free Speech') {
      console.log('✅ Test 2 Passed: User Right with photo created successfully:', resCreate2.data.data);
      createdRightId2 = resCreate2.data.data.id;
    } else {
      throw new Error(`Test 2 Failed: Unexpected response: ${JSON.stringify(resCreate2.data)}`);
    }

    // ----------------------------------------------------
    // TEST 3: Validation Error - Missing Title
    // ----------------------------------------------------
    console.log('\n[Test 3] Testing validation error on missing title...');
    try {
      await clientCreator.post('/api/content-creator/user-rights', {
        title: '',
        description: 'Some valid description'
      });
      throw new Error('Test 3 Failed: Should have returned 400 Bad Request');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Test 3 Passed: Correctly rejected empty title with 400:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 4: Validation Error - Missing Description
    // ----------------------------------------------------
    console.log('\n[Test 4] Testing validation error on missing description...');
    try {
      await clientCreator.post('/api/content-creator/user-rights', {
        title: 'Right to Education',
        description: ''
      });
      throw new Error('Test 4 Failed: Should have returned 400 Bad Request');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Test 4 Passed: Correctly rejected empty description with 400:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 5: Public List API (No Auth)
    // ----------------------------------------------------
    console.log('\n[Test 5] Public user fetches all User Rights with pagination...');
    const resList = await clientPublic.get('/api/user-rights?page=1&limit=10');
    if (
      resList.status === 200 &&
      resList.data.success &&
      Array.isArray(resList.data.data) &&
      resList.data.pagination &&
      resList.data.pagination.totalRights >= 2
    ) {
      console.log('✅ Test 5 Passed: Public list fetched successfully. Items count:', resList.data.data.length, 'Pagination:', resList.data.pagination);
    } else {
      throw new Error(`Test 5 Failed: Invalid list response: ${JSON.stringify(resList.data)}`);
    }

    // ----------------------------------------------------
    // TEST 6: Public Single User Right API (No Auth)
    // ----------------------------------------------------
    console.log('\n[Test 6] Public user fetches single User Right...');
    const resSingle = await clientPublic.get(`/api/user-rights/${createdRightId1}`);
    if (
      resSingle.status === 200 &&
      resSingle.data.success &&
      resSingle.data.data.id === createdRightId1 &&
      resSingle.data.data.title === 'Right to Equality'
    ) {
      console.log('✅ Test 6 Passed: Public single item fetched successfully:', resSingle.data.data);
    } else {
      throw new Error(`Test 6 Failed: Invalid single item response: ${JSON.stringify(resSingle.data)}`);
    }

    // ----------------------------------------------------
    // TEST 7: Public Single User Right 404
    // ----------------------------------------------------
    console.log('\n[Test 7] Public user fetches nonexistent User Right (expect 404)...');
    try {
      await clientPublic.get('/api/user-rights/00000000-0000-0000-0000-000000000000');
      throw new Error('Test 7 Failed: Expected 404');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('✅ Test 7 Passed: Returned 404 for non-existent User Right');
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 8: Update User Right (Content Creator)
    // ----------------------------------------------------
    console.log('\n[Test 8] Content Creator updates User Right title & description...');
    const resUpdate = await clientCreator.patch(`/api/content-creator/user-rights/${createdRightId1}`, {
      title: 'Updated Right to Equality',
      description: 'Updated comprehensive description for equality before law.'
    });

    if (
      resUpdate.status === 200 &&
      resUpdate.data.success &&
      resUpdate.data.data.title === 'Updated Right to Equality'
    ) {
      console.log('✅ Test 8 Passed: User Right updated successfully:', resUpdate.data.data);
    } else {
      throw new Error(`Test 8 Failed: Invalid update response: ${JSON.stringify(resUpdate.data)}`);
    }

    // ----------------------------------------------------
    // TEST 9: Update User Right with new Photo (Content Creator)
    // ----------------------------------------------------
    console.log('\n[Test 9] Content Creator updates User Right with new photo...');
    const updateFormData = new FormData();
    updateFormData.append('description', 'Updated description with fresh image.');
    const updatedBlob = new Blob([dummyPngBuffer], { type: 'image/png' });
    updateFormData.append('photo', updatedBlob, 'replacement_photo.png');

    const resUpdatePhoto = await clientCreator.patch(`/api/content-creator/user-rights/${createdRightId1}`, updateFormData);
    if (
      resUpdatePhoto.status === 200 &&
      resUpdatePhoto.data.success &&
      resUpdatePhoto.data.data.photo
    ) {
      console.log('✅ Test 9 Passed: User Right photo updated successfully:', resUpdatePhoto.data.data);
    } else {
      throw new Error(`Test 9 Failed: Invalid update photo response: ${JSON.stringify(resUpdatePhoto.data)}`);
    }

    // ----------------------------------------------------
    // TEST 10: Delete User Right (Content Creator)
    // ----------------------------------------------------
    console.log('\n[Test 10] Content Creator deletes User Right...');
    const resDelete = await clientCreator.delete(`/api/content-creator/user-rights/${createdRightId2}`);
    if (resDelete.status === 200 && resDelete.data.success) {
      console.log('✅ Test 10 Passed: User Right deleted successfully');
    } else {
      throw new Error(`Test 10 Failed: Invalid delete response: ${JSON.stringify(resDelete.data)}`);
    }

    // Verify it's gone from public API
    try {
      await clientPublic.get(`/api/user-rights/${createdRightId2}`);
      throw new Error('Test 10b Failed: Deleted item still found');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('✅ Test 10b Passed: Confirmed item 404s after deletion');
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 11: Authorization - Normal User Forbidden
    // ----------------------------------------------------
    console.log('\n[Test 11] Normal User attempts to create/edit/delete User Rights (expect 403)...');
    try {
      await clientUser.post('/api/content-creator/user-rights', {
        title: 'Unauthorized Right',
        description: 'Should be rejected'
      });
      throw new Error('Test 11 Failed: Normal user was able to create User Right');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Test 11a Passed: Normal user rejected from creating User Right (403)');
      } else {
        throw err;
      }
    }

    try {
      await clientUser.patch(`/api/content-creator/user-rights/${createdRightId1}`, {
        title: 'Hacked Title'
      });
      throw new Error('Test 11 Failed: Normal user was able to edit User Right');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Test 11b Passed: Normal user rejected from updating User Right (403)');
      } else {
        throw err;
      }
    }

    try {
      await clientUser.delete(`/api/content-creator/user-rights/${createdRightId1}`);
      throw new Error('Test 11 Failed: Normal user was able to delete User Right');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Test 11c Passed: Normal user rejected from deleting User Right (403)');
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 12: Authorization - Advocate Forbidden
    // ----------------------------------------------------
    console.log('\n[Test 12] Advocate attempts to create/edit/delete User Rights (expect 403)...');
    try {
      await clientAdvocate.post('/api/content-creator/user-rights', {
        title: 'Advocate Unauthorized Right',
        description: 'Should be rejected'
      });
      throw new Error('Test 12 Failed: Advocate was able to create User Right');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Test 12a Passed: Advocate rejected from creating User Right (403)');
      } else {
        throw err;
      }
    }

    try {
      await clientAdvocate.patch(`/api/content-creator/user-rights/${createdRightId1}`, {
        title: 'Advocate Updated Title'
      });
      throw new Error('Test 12 Failed: Advocate was able to edit User Right');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Test 12b Passed: Advocate rejected from updating User Right (403)');
      } else {
        throw err;
      }
    }

    try {
      await clientAdvocate.delete(`/api/content-creator/user-rights/${createdRightId1}`);
      throw new Error('Test 12 Failed: Advocate was able to delete User Right');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Test 12c Passed: Advocate rejected from deleting User Right (403)');
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 13: Authorization - Unauthenticated Forbidden from Modification
    // ----------------------------------------------------
    console.log('\n[Test 13] Unauthenticated user attempts modification (expect 401)...');
    try {
      await clientPublic.post('/api/content-creator/user-rights', {
        title: 'Anon Right',
        description: 'Should be rejected'
      });
      throw new Error('Test 13 Failed: Unauthenticated user was able to create User Right');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Test 13 Passed: Unauthenticated user rejected with 401');
      } else {
        throw err;
      }
    }

    // Clean up created test record
    if (createdRightId1) {
      await prisma.userRight.delete({ where: { id: createdRightId1 } }).catch(() => {});
    }

    console.log('\n🎉 ALL 13 USER RIGHTS E2E TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('\n❌ E2E Test Suite Failed:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
