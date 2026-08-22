import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../src/utils/jwt.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- Starting Saved Lawyers Feature Integration Tests ---');

  // 1. Fetch mock users & advocates from database
  const rahul = await prisma.user.findFirst({ where: { email: 'client.rahul@example.com' } });
  const rohit = await prisma.user.findFirst({ where: { email: 'client.rohit@example.com' } });
  
  // Clean up any previously saved lawyers for these test users
  if (rahul) {
    await prisma.savedLawyer.deleteMany({ where: { userId: rahul.id } });
  }
  if (rohit) {
    await prisma.savedLawyer.deleteMany({ where: { userId: rohit.id } });
  }

  const advocates = await prisma.advocate.findMany({ where: { isActive: true }, take: 2 });

  if (!rahul || !rohit || advocates.length < 2) {
    console.error('Could not find enough seeded mock users or advocates. Please seed database first.');
    process.exit(1);
  }

  const adv1 = advocates[0];
  const adv2 = advocates[1];

  console.log(`Resolved User A (Rahul Verma): id=${rahul.id}`);
  console.log(`Resolved User B (Rohit Nair): id=${rohit.id}`);
  console.log(`Resolved Advocate 1: id=${adv1.id}, name=${adv1.fullName}`);
  console.log(`Resolved Advocate 2: id=${adv2.id}, name=${adv2.fullName}`);

  // 2. Generate tokens
  const tokenA = signToken({ id: rahul.id, type: 'user' });
  const tokenB = signToken({ id: rohit.id, type: 'user' });

  const client = axios.create({
    baseURL: 'http://localhost:5000/api',
    validateStatus: () => true
  });

  // --- Test Case 1: Unauthorized Access Check ---
  console.log('\n[Test 1] Unauthorized access to saved-lawyers...');
  const resUnauthGet = await client.get('/saved-lawyers');
  if (resUnauthGet.status !== 401) {
    throw new Error(`Test 1 Failed: Expected status 401 on unauthenticated GET, got ${resUnauthGet.status}`);
  }
  const resUnauthPost = await client.post('/saved-lawyers', { advocateId: adv1.id });
  if (resUnauthPost.status !== 401) {
    throw new Error(`Test 1 Failed: Expected status 401 on unauthenticated POST, got ${resUnauthPost.status}`);
  }
  const resUnauthDelete = await client.delete(`/saved-lawyers/${adv1.id}`);
  if (resUnauthDelete.status !== 401) {
    throw new Error(`Test 1 Failed: Expected status 401 on unauthenticated DELETE, got ${resUnauthDelete.status}`);
  }
  console.log('✓ Unauthorized access successfully blocked with 401.');

  // --- Test Case 2: Save Valid Lawyer ---
  console.log('\n[Test 2] User A saves Advocate 1...');
  const resSave1 = await client.post('/saved-lawyers', { advocateId: adv1.id }, {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  if (resSave1.status !== 201 || !resSave1.data.success) {
    throw new Error(`Test 2 Failed: Expected status 201, got ${resSave1.status}. Message: ${resSave1.data.message}`);
  }
  console.log('✓ Advocate 1 saved successfully.');

  // --- Test Case 3: Duplicate Save Protection ---
  console.log('\n[Test 3] User A attempts to save Advocate 1 again...');
  const resSaveDuplicate = await client.post('/saved-lawyers', { advocateId: adv1.id }, {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  if (resSaveDuplicate.status !== 400 || resSaveDuplicate.data.success) {
    throw new Error(`Test 3 Failed: Expected status 400 for duplicate save, got ${resSaveDuplicate.status}`);
  }
  if (resSaveDuplicate.data.message !== 'Lawyer is already saved') {
    throw new Error(`Test 3 Failed: Unexpected message: ${resSaveDuplicate.data.message}`);
  }
  console.log('✓ Duplicate save prevented and handled with controlled error message.');

  // --- Test Case 4: Retrieve Saved Lawyers List & Verify Fields ---
  console.log('\n[Test 4] User A retrieves their saved lawyers list...');
  const resGetSaved = await client.get('/saved-lawyers', {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  if (resGetSaved.status !== 200 || !resGetSaved.data.success) {
    throw new Error(`Test 4 Failed: Expected status 200, got ${resGetSaved.status}`);
  }
  const savedList = resGetSaved.data.advocates;
  if (savedList.length !== 1 || savedList[0].id !== adv1.id) {
    throw new Error(`Test 4 Failed: Expected 1 saved lawyer with id ${adv1.id}, got ${JSON.stringify(savedList)}`);
  }
  // Verify standard fields are present
  const savedAdv = savedList[0];
  if (!savedAdv.fullName || !savedAdv.city || !savedAdv.state || savedAdv.isSaved !== true) {
    throw new Error(`Test 4 Failed: Saved advocate profile missing essential public fields. Object: ${JSON.stringify(savedAdv)}`);
  }
  // Verify sensitive fields are not leaked
  if (savedAdv.aadhaarNumber || savedAdv.passwordHash) {
    throw new Error('Test 4 Failed: Sensitive data leaked in saved lawyers list response!');
  }
  console.log('✓ Retrieved saved lawyers list successfully. Profile fields verified.');

  // --- Test Case 5: User Isolation Check ---
  console.log('\n[Test 5] User B retrieves their saved list (should be empty)...');
  const resGetSavedB = await client.get('/saved-lawyers', {
    headers: { Cookie: `auth_token=${tokenB}` }
  });
  if (resGetSavedB.status !== 200 || !resGetSavedB.data.success) {
    throw new Error(`Test 5 Failed: Expected status 200, got ${resGetSavedB.status}`);
  }
  if (resGetSavedB.data.advocates.length !== 0) {
    throw new Error('Test 5 Failed: User B returned saves belonging to User A!');
  }
  console.log('✓ User B saved list is empty. User isolation verified.');

  // --- Test Case 6: isSaved Status in Directory & Profile APIs ---
  console.log('\n[Test 6] Verify isSaved status on general advocate listing and profile...');
  // A. Directory listing for User A
  const resDirA = await client.get(`/advocates?search=${encodeURIComponent(adv1.fullName)}`, {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  const dirAdvA = resDirA.data.advocates.find(a => a.id === adv1.id);
  if (!dirAdvA || dirAdvA.isSaved !== true) {
    throw new Error(`Test 6 Failed: Advocate 1 should have isSaved=true for User A in listing. Got: ${dirAdvA?.isSaved}`);
  }
  
  // B. Directory listing for User B
  const resDirB = await client.get(`/advocates?search=${encodeURIComponent(adv1.fullName)}`, {
    headers: { Cookie: `auth_token=${tokenB}` }
  });
  const dirAdvB = resDirB.data.advocates.find(a => a.id === adv1.id);
  if (!dirAdvB || dirAdvB.isSaved !== false) {
    throw new Error(`Test 6 Failed: Advocate 1 should have isSaved=false for User B in listing. Got: ${dirAdvB?.isSaved}`);
  }

  // C. Profile view for User A
  const resProfileA = await client.get(`/advocates/${adv1.id}`, {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  if (resProfileA.data.advocate.isSaved !== true) {
    throw new Error(`Test 6 Failed: Profile view for User A should show isSaved=true. Got: ${resProfileA.data.advocate.isSaved}`);
  }
  
  // D. Profile view for Guest User
  const resProfileGuest = await client.get(`/advocates/${adv1.id}`);
  if (resProfileGuest.data.advocate.isSaved !== false) {
    throw new Error(`Test 6 Failed: Profile view for Guest should show isSaved=false. Got: ${resProfileGuest.data.advocate.isSaved}`);
  }
  console.log('✓ isSaved status field successfully integrated on both directory and profile endpoints.');

  // --- Test Case 7: Remove Saved Lawyer ---
  console.log('\n[Test 7] User A removes Advocate 1 from saved list...');
  const resRemove = await client.delete(`/saved-lawyers/${adv1.id}`, {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  if (resRemove.status !== 200 || !resRemove.data.success) {
    throw new Error(`Test 7 Failed: Expected status 200, got ${resRemove.status}`);
  }
  // Verify list is now empty
  const resGetSavedAfter = await client.get('/saved-lawyers', {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  if (resGetSavedAfter.data.advocates.length !== 0) {
    throw new Error('Test 7 Failed: Saved list is not empty after removal!');
  }
  // Verify Advocate 1 still exists in database
  const advRecord = await prisma.advocate.findUnique({ where: { id: adv1.id } });
  if (!advRecord || !advRecord.isActive) {
    throw new Error('Test 7 Failed: The advocate record was deleted from the database! Only saved relation should be deleted.');
  }
  console.log('✓ Advocate 1 removed successfully. General advocate record remains untouched.');

  // --- Test Case 8: Remove Unsaved Lawyer ---
  console.log('\n[Test 8] User A attempts to remove Advocate 1 again (not saved)...');
  const resRemoveUnsaved = await client.delete(`/saved-lawyers/${adv1.id}`, {
    headers: { Cookie: `auth_token=${tokenA}` }
  });
  if (resRemoveUnsaved.status !== 400 || resRemoveUnsaved.data.success) {
    throw new Error(`Test 8 Failed: Expected status 400 on deleting unsaved lawyer, got ${resRemoveUnsaved.status}`);
  }
  if (resRemoveUnsaved.data.message !== 'Saved lawyer not found') {
    throw new Error(`Test 8 Failed: Unexpected message: ${resRemoveUnsaved.data.message}`);
  }
  console.log('✓ Unsaved deletion handled gracefully with controlled error.');

  console.log('\n--- ALL SAVED LAWYERS FEATURE INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n--- TEST EXECUTION FAILED ---');
  console.error(err);
  process.exit(1);
});
