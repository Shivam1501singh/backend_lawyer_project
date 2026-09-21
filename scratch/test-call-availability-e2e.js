import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from '../src/config/passport.js';
import adminRoutes from '../src/routes/admin.routes.js';
import advocateAuthRoutes from '../src/routes/advocate.auth.routes.js';
import advocateProfileRoutes from '../src/routes/advocate.profile.routes.js';
import advocateRoutes from '../src/routes/advocate.routes.js';
import advocateStatusRoutes from '../src/routes/advocate.status.routes.js';
import userAuthRoutes from '../src/routes/user.auth.routes.js';
import savedLawyerRoutes from '../src/routes/savedLawyer.routes.js';
import { requireAuth, requireRole } from '../src/middleware/auth.middleware.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { getUserLikedAdvocates } from '../src/controllers/advocateLike.controller.js';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/admin', adminRoutes);
app.use('/api/auth/advocate', advocateAuthRoutes);
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/advocate/profile', advocateProfileRoutes);
app.use('/api/advocate', advocateStatusRoutes);
app.use('/api/advocates', advocateRoutes);
app.use('/api/saved-lawyers', savedLawyerRoutes);
app.get('/api/user/liked-advocates', requireAuth, requireRole('USER'), getUserLikedAdvocates);

app.use(errorHandler);

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data, headers: res.headers };
}

async function runTests() {
  console.log('--- Starting Call Availability Feature Tests ---');

  const testSuffix = Math.random().toString(36).substring(2, 8);
  const adminEmail = `admin.call.${testSuffix}@example.com`;
  const adv1Email = `adv1.call.${testSuffix}@example.com`;
  const adv2Email = `adv2.call.${testSuffix}@example.com`;
  const userEmail = `user.call.${testSuffix}@example.com`;
  const creatorEmail = `creator.call.${testSuffix}@example.com`;

  const password = 'Password@123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Start HTTP server on dynamic port
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Setup Admin in DB
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        fullName: `Admin ${testSuffix}`,
        passwordHash
      }
    });
    const adminToken = signToken({ id: admin.id, type: 'admin', role: 'ADMIN' });

    // 2. Setup User in DB
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
        fullName: `User ${testSuffix}`,
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        isActive: true,
        status: 'ACTIVE'
      }
    });
    const userToken = signToken({ id: user.id, type: 'user', role: 'USER' });

    // 3. Setup Content Creator in DB
    const creator = await prisma.contentCreator.create({
      data: {
        email: creatorEmail,
        fullName: `Creator ${testSuffix}`,
        passwordHash,
        isActive: true
      }
    });
    const creatorToken = signToken({ id: creator.id, type: 'content_creator', role: 'CONTENT_CREATOR' });

    // 4. Setup Advocate 1 (Pending approval)
    const adv1 = await prisma.advocate.create({
      data: {
        email: adv1Email,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        fullName: `Advocate One ${testSuffix}`,
        barCouncilId: `BAR-1-${testSuffix.toUpperCase()}`,
        passwordHash,
        state: 'Delhi',
        city: 'New Delhi',
        pincode: '110001',
        phoneVerified: true,
        emailVerified: true,
        isActive: true,
        status: 'ACTIVE',
        approvalStatus: 'PENDING',
        isOnline: false,
        lastSeenAt: null
      }
    });
    const adv1Token = signToken({ id: adv1.id, type: 'advocate', role: 'ADVOCATE' });

    // 5. Setup Advocate 2 (Pending approval)
    const adv2 = await prisma.advocate.create({
      data: {
        email: adv2Email,
        phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        fullName: `Advocate Two ${testSuffix}`,
        barCouncilId: `BAR-2-${testSuffix.toUpperCase()}`,
        passwordHash,
        state: 'Maharashtra',
        city: 'Mumbai',
        pincode: '400001',
        phoneVerified: true,
        emailVerified: true,
        isActive: true,
        status: 'ACTIVE',
        approvalStatus: 'PENDING',
        isOnline: false,
        lastSeenAt: null
      }
    });
    const adv2Token = signToken({ id: adv2.id, type: 'advocate', role: 'ADVOCATE' });

    console.log('✅ Created test users, admin, and advocates');

    // Test 1: New Advocate defaults to callAvailability = false
    console.log('\n--- Test 1: Default callAvailability is false ---');
    if (adv1.callAvailability !== false) {
      throw new Error(`Expected default callAvailability to be false, got ${adv1.callAvailability}`);
    }
    const pendingListRes = await request('/api/admin/advocates/pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundPendingAdv = pendingListRes.body.data?.find(a => a.id === adv1.id);
    if (!foundPendingAdv || foundPendingAdv.callAvailability !== false) {
      throw new Error(`Expected pending advocate in admin list to have callAvailability: false, got ${JSON.stringify(foundPendingAdv)}`);
    }
    console.log('✅ Default callAvailability is false and visible in Admin pending list');

    // Test 2: Advocate cannot set callAvailability during profile update
    console.log('\n--- Test 2: Advocate cannot modify callAvailability ---');
    const advUpdateAttempt = await request('/api/advocate/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adv1Token}` },
      body: { callAvailability: true, city: 'New Delhi' }
    });
    if (advUpdateAttempt.status !== 400) {
      throw new Error(`Expected 400 rejection when advocate attempts to set callAvailability, got ${advUpdateAttempt.status}`);
    }
    console.log('✅ Advocate profile update strictly rejects callAvailability field');

    // Test 3: Admin Approves Advocate 1 with callAvailability = true
    console.log('\n--- Test 3: Admin Approves with callAvailability: true ---');
    const approve1Res = await request(`/api/admin/advocates/${adv1.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        approvalStatus: 'APPROVED',
        callAvailability: true
      }
    });
    if (approve1Res.status !== 200 || approve1Res.body.data.callAvailability !== true || approve1Res.body.data.approvalStatus !== 'APPROVED') {
      throw new Error(`Admin approve with calls enabled failed: ${JSON.stringify(approve1Res.body)}`);
    }
    const dbAdv1 = await prisma.advocate.findUnique({ where: { id: adv1.id } });
    if (dbAdv1.callAvailability !== true || dbAdv1.approvalStatus !== 'APPROVED') {
      throw new Error(`DB Advocate 1 expected callAvailability: true and APPROVED, got ${JSON.stringify(dbAdv1)}`);
    }
    console.log('✅ Admin approved Advocate 1 with callAvailability: true');

    // Test 4: Admin Approves Advocate 2 with callAvailability = false
    console.log('\n--- Test 4: Admin Approves with callAvailability: false ---');
    const approve2Res = await request(`/api/admin/advocates/${adv2.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        approvalStatus: 'APPROVED',
        callAvailability: false
      }
    });
    if (approve2Res.status !== 200 || approve2Res.body.data.callAvailability !== false || approve2Res.body.data.approvalStatus !== 'APPROVED') {
      throw new Error(`Admin approve with calls disabled failed: ${JSON.stringify(approve2Res.body)}`);
    }
    const dbAdv2 = await prisma.advocate.findUnique({ where: { id: adv2.id } });
    if (dbAdv2.callAvailability !== false || dbAdv2.approvalStatus !== 'APPROVED') {
      throw new Error(`DB Advocate 2 expected callAvailability: false and APPROVED, got ${JSON.stringify(dbAdv2)}`);
    }
    console.log('✅ Admin approved Advocate 2 with callAvailability: false');

    // Test 5: Public Advocate APIs return callAvailability
    console.log('\n--- Test 5: Public Advocate APIs return callAvailability ---');
    // Public profile for Adv 1 (true)
    const publicAdv1Res = await request(`/api/advocates/${adv1.id}`);
    if (publicAdv1Res.status !== 200 || publicAdv1Res.body.advocate.callAvailability !== true) {
      throw new Error(`Public profile Adv 1 expected callAvailability: true, got ${JSON.stringify(publicAdv1Res.body)}`);
    }

    // Public profile for Adv 2 (false)
    const publicAdv2Res = await request(`/api/advocates/${adv2.id}`);
    if (publicAdv2Res.status !== 200 || publicAdv2Res.body.advocate.callAvailability !== false) {
      throw new Error(`Public profile Adv 2 expected callAvailability: false, got ${JSON.stringify(publicAdv2Res.body)}`);
    }

    // Public directory list
    const dirRes = await request(`/api/advocates?search=${testSuffix}`);
    const foundAdv1Dir = dirRes.body.advocates?.find(a => a.id === adv1.id);
    const foundAdv2Dir = dirRes.body.advocates?.find(a => a.id === adv2.id);
    if (!foundAdv1Dir || foundAdv1Dir.callAvailability !== true) {
      throw new Error(`Directory Adv 1 expected callAvailability: true, got ${JSON.stringify(foundAdv1Dir)}`);
    }
    if (!foundAdv2Dir || foundAdv2Dir.callAvailability !== false) {
      throw new Error(`Directory Adv 2 expected callAvailability: false, got ${JSON.stringify(foundAdv2Dir)}`);
    }

    // User saves lawyer and likes advocate
    await request('/api/saved-lawyers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { advocateId: adv1.id }
    });
    await request(`/api/advocates/${adv1.id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const savedListRes = await request('/api/saved-lawyers', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const savedAdv = savedListRes.body.advocates?.find(a => a.id === adv1.id);
    if (!savedAdv || savedAdv.callAvailability !== true) {
      throw new Error(`Saved lawyers expected callAvailability: true, got ${JSON.stringify(savedAdv)}`);
    }

    const likedListRes = await request('/api/user/liked-advocates', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const likedAdv = (likedListRes.body.data || likedListRes.body.advocates)?.find(a => a.id === adv1.id);
    if (!likedAdv || likedAdv.callAvailability !== true) {
      throw new Error(`Liked advocates expected callAvailability: true, got ${JSON.stringify(likedAdv)}`);
    }
    console.log('✅ Public profile, directory, saved lawyers, and liked advocates correctly return callAvailability');

    // Test 6: Admin Changes Call Availability for already approved advocate
    console.log('\n--- Test 6: Admin modifies callAvailability for approved advocate ---');
    // Change Adv 1 from true -> false
    const toggleOffRes = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { callAvailability: false }
    });
    if (toggleOffRes.status !== 200 || toggleOffRes.body.data.callAvailability !== false) {
      throw new Error(`Admin toggle call-availability to false failed: ${JSON.stringify(toggleOffRes.body)}`);
    }
    const verifyPubOff = await request(`/api/advocates/${adv1.id}`);
    if (verifyPubOff.body.advocate.callAvailability !== false) {
      throw new Error(`Public profile did not reflect toggle to false: ${JSON.stringify(verifyPubOff.body)}`);
    }

    // Change Adv 1 from false -> true
    const toggleOnRes = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { callAvailability: true }
    });
    if (toggleOnRes.status !== 200 || toggleOnRes.body.data.callAvailability !== true) {
      throw new Error(`Admin toggle call-availability to true failed: ${JSON.stringify(toggleOnRes.body)}`);
    }
    const verifyPubOn = await request(`/api/advocates/${adv1.id}`);
    if (verifyPubOn.body.advocate.callAvailability !== true) {
      throw new Error(`Public profile did not reflect toggle to true: ${JSON.stringify(verifyPubOn.body)}`);
    }

    // Also test changing via status route
    const statusUpdateRes = await request(`/api/admin/advocates/${adv1.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { callAvailability: false }
    });
    if (statusUpdateRes.status !== 200 || statusUpdateRes.body.data.callAvailability !== false) {
      throw new Error(`Admin status route callAvailability update failed: ${JSON.stringify(statusUpdateRes.body)}`);
    }
    console.log('✅ Admin successfully changed call availability on approved advocate and verified in public API');

    // Test 7: Authorization - Non-Admin Roles Rejected
    console.log('\n--- Test 7: Non-Admin authorization rejection ---');
    // Unauthenticated
    const unauthRes = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      body: { callAvailability: true }
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }

    // Normal User
    const userAttempt = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { callAvailability: true }
    });
    if (userAttempt.status !== 403) {
      throw new Error(`Expected 403 for Normal User request, got ${userAttempt.status}`);
    }

    // Advocate
    const advAttempt = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adv1Token}` },
      body: { callAvailability: true }
    });
    if (advAttempt.status !== 403) {
      throw new Error(`Expected 403 for Advocate request, got ${advAttempt.status}`);
    }

    // Content Creator
    const creatorAttempt = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${creatorToken}` },
      body: { callAvailability: true }
    });
    if (creatorAttempt.status !== 403) {
      throw new Error(`Expected 403 for Content Creator request, got ${creatorAttempt.status}`);
    }
    console.log('✅ Unauthenticated, Normal User, Advocate, and Content Creator correctly rejected with 401/403');

    // Test 8: Strict Zod validation on callAvailability
    console.log('\n--- Test 8: Strict Zod validation ---');
    const stringValRes = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { callAvailability: "true" }
    });
    if (stringValRes.status !== 400) {
      throw new Error(`Expected 400 for string callAvailability, got ${stringValRes.status}`);
    }

    const missingValRes = await request(`/api/admin/advocates/${adv1.id}/call-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {}
    });
    if (missingValRes.status !== 400) {
      throw new Error(`Expected 400 for missing callAvailability, got ${missingValRes.status}`);
    }
    console.log('✅ Strict Zod boolean validation verified');

    // Test 9: Online/Offline Status Independence
    console.log('\n--- Test 9: Online/Offline and Call Availability Independence ---');
    // Set callAvailability = true, but advocate is offline
    await prisma.advocate.update({
      where: { id: adv1.id },
      data: { callAvailability: true, isOnline: false, lastSeenAt: null }
    });
    const offlineAvailRes = await request(`/api/advocates/${adv1.id}`);
    if (offlineAvailRes.body.advocate.isOnline !== false || offlineAvailRes.body.advocate.callAvailability !== true) {
      throw new Error(`Expected isOnline: false & callAvailability: true, got ${JSON.stringify(offlineAvailRes.body.advocate)}`);
    }

    // Advocate logs in / heartbeat -> isOnline = true, callAvailability remains true
    await request('/api/advocate/heartbeat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adv1Token}` }
    });
    const onlineAvailRes = await request(`/api/advocates/${adv1.id}`);
    if (onlineAvailRes.body.advocate.isOnline !== true || onlineAvailRes.body.advocate.callAvailability !== true) {
      throw new Error(`Expected isOnline: true & callAvailability: true, got ${JSON.stringify(onlineAvailRes.body.advocate)}`);
    }
    console.log('✅ isOnline and callAvailability operate independently as designed');

    console.log('\n🎉 ALL CALL AVAILABILITY TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    // Cleanup
    try {
      await prisma.savedLawyer.deleteMany({ where: { advocate: { email: { in: [adv1Email, adv2Email] } } } });
      await prisma.advocateLike.deleteMany({ where: { advocate: { email: { in: [adv1Email, adv2Email] } } } });
      await prisma.advocate.deleteMany({ where: { email: { in: [adv1Email, adv2Email] } } });
      await prisma.user.deleteMany({ where: { email: userEmail } });
      await prisma.admin.deleteMany({ where: { email: adminEmail } });
      await prisma.contentCreator.deleteMany({ where: { email: creatorEmail } });
    } catch (e) {
      console.warn('Cleanup warning:', e.message);
    }
    if (server) {
      server.close();
    }
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  if (server) server.close();
  process.exit(1);
});
