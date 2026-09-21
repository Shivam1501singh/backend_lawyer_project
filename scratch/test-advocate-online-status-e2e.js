import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from '../src/config/passport.js';
import advocateAuthRoutes from '../src/routes/advocate.auth.routes.js';
import advocateProfileRoutes from '../src/routes/advocate.profile.routes.js';
import advocateRoutes from '../src/routes/advocate.routes.js';
import advocateStatusRoutes from '../src/routes/advocate.status.routes.js';
import userAuthRoutes from '../src/routes/user.auth.routes.js';
import savedLawyerRoutes from '../src/routes/savedLawyer.routes.js';
import { requireAuth, requireRole } from '../src/middleware/auth.middleware.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { logout as advocateLogout } from '../src/controllers/advocate.auth.controller.js';
import { getUserLikedAdvocates } from '../src/controllers/advocateLike.controller.js';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth/advocate', advocateAuthRoutes);
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/advocate/profile', advocateProfileRoutes);
app.use('/api/advocate', advocateStatusRoutes);
app.use('/api/advocates', advocateRoutes);
app.use('/api/saved-lawyers', savedLawyerRoutes);
app.get('/api/user/liked-advocates', requireAuth, requireRole('USER'), getUserLikedAdvocates);
app.post('/api/advocate/logout', requireAuth, advocateLogout);

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
  console.log('--- Starting Advocate Online/Offline Status Feature Tests ---');

  const testSuffix = Math.random().toString(36).substring(2, 8);
  const advEmail = `adv.online.${testSuffix}@example.com`;
  const advPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const advBarId = `BAR-ONL-${testSuffix.toUpperCase()}`;
  const password = 'Password@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const userEmail = `user.online.${testSuffix}@example.com`;
  const userPhone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;

  // Start HTTP server on dynamic port
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Setup Test Advocate in DB
    const createdAdvocate = await prisma.advocate.create({
      data: {
        email: advEmail,
        phone: advPhone,
        fullName: `Advocate Online ${testSuffix}`,
        barCouncilId: advBarId,
        passwordHash,
        state: 'Delhi',
        city: 'New Delhi',
        pincode: '110001',
        phoneVerified: true,
        emailVerified: true,
        isActive: true,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        isOnline: false,
        lastSeenAt: null
      }
    });

    // 2. Setup Test User in DB
    const createdUser = await prisma.user.create({
      data: {
        email: userEmail,
        phone: userPhone,
        fullName: `User ${testSuffix}`,
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        isActive: true,
        status: 'ACTIVE'
      }
    });

    console.log('✅ Created test advocate and user');

    // Test 1: Advocate Login sets isOnline: true and lastSeenAt: recent
    console.log('\n--- Test 1: Advocate Login sets isOnline & lastSeenAt ---');
    const loginRes = await request('/api/auth/advocate/login', {
      method: 'POST',
      body: { email: advEmail, password }
    });
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Advocate login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const advToken = loginRes.body.token;

    const advAfterLogin = await prisma.advocate.findUnique({ where: { id: createdAdvocate.id } });
    if (!advAfterLogin.isOnline || !advAfterLogin.lastSeenAt) {
      throw new Error(`Expected isOnline: true and lastSeenAt to be set after login, got isOnline=${advAfterLogin.isOnline}, lastSeenAt=${advAfterLogin.lastSeenAt}`);
    }
    console.log(`✅ Advocate login set isOnline: ${advAfterLogin.isOnline}, lastSeenAt: ${advAfterLogin.lastSeenAt.toISOString()}`);

    // Test 2: Heartbeat API POST /api/advocate/heartbeat
    console.log('\n--- Test 2: Heartbeat API ---');
    const heartbeatRes = await request('/api/advocate/heartbeat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${advToken}` }
    });
    if (heartbeatRes.status !== 200 || !heartbeatRes.body.success || !heartbeatRes.body.data.isOnline) {
      throw new Error(`Heartbeat failed: ${JSON.stringify(heartbeatRes.body)}`);
    }
    if (!heartbeatRes.body.data.lastSeenAt) {
      throw new Error('Heartbeat response missing lastSeenAt');
    }
    console.log(`✅ Heartbeat success: isOnline=${heartbeatRes.body.data.isOnline}, lastSeenAt=${heartbeatRes.body.data.lastSeenAt}`);

    // Test 3: Manual Online/Offline PATCH /api/advocate/online-status (switch offline)
    console.log('\n--- Test 3: Manual Switch Offline ---');
    const offlineRes = await request('/api/advocate/online-status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${advToken}` },
      body: { isOnline: false }
    });
    if (offlineRes.status !== 200 || offlineRes.body.data.isOnline !== false) {
      throw new Error(`Manual switch offline failed: ${JSON.stringify(offlineRes.body)}`);
    }
    const advAfterOffline = await prisma.advocate.findUnique({ where: { id: createdAdvocate.id } });
    if (advAfterOffline.isOnline !== false) {
      throw new Error(`Database isOnline should be false, got ${advAfterOffline.isOnline}`);
    }
    console.log('✅ Manual switch offline verified in DB');

    // Test 4: Manual Online/Offline PATCH /api/advocate/online-status (switch online)
    console.log('\n--- Test 4: Manual Switch Online ---');
    const onlineRes = await request('/api/advocate/online-status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${advToken}` },
      body: { isOnline: true }
    });
    if (onlineRes.status !== 200 || onlineRes.body.data.isOnline !== true) {
      throw new Error(`Manual switch online failed: ${JSON.stringify(onlineRes.body)}`);
    }
    console.log('✅ Manual switch online verified');

    // Test 5: Validation errors on PATCH /api/advocate/online-status
    console.log('\n--- Test 5: Validation errors on online-status endpoint ---');
    const invalidValRes1 = await request('/api/advocate/online-status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${advToken}` },
      body: { isOnline: "true" } // string instead of boolean
    });
    if (invalidValRes1.status !== 400) {
      throw new Error(`Expected 400 for string isOnline, got ${invalidValRes1.status}`);
    }

    const invalidValRes2 = await request('/api/advocate/online-status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${advToken}` },
      body: {} // missing isOnline
    });
    if (invalidValRes2.status !== 400) {
      throw new Error(`Expected 400 for missing isOnline, got ${invalidValRes2.status}`);
    }
    console.log('✅ Strict Zod validation correctly rejected non-boolean and missing isOnline');

    // Test 6: Public APIs return effective isOnline: true when recent
    console.log('\n--- Test 6: Public profile and directory return isOnline: true when active ---');
    const publicProfileRes = await request(`/api/advocates/${createdAdvocate.id}`);
    if (publicProfileRes.status !== 200 || publicProfileRes.body.advocate.isOnline !== true) {
      throw new Error(`Public profile expected isOnline: true, got ${JSON.stringify(publicProfileRes.body)}`);
    }
    if (!publicProfileRes.body.advocate.lastSeenAt) {
      throw new Error('Public profile missing lastSeenAt');
    }

    const dirRes = await request(`/api/advocates?search=${testSuffix}`);
    const foundInDir = dirRes.body.advocates?.find(a => a.id === createdAdvocate.id);
    if (!foundInDir || foundInDir.isOnline !== true) {
      throw new Error(`Directory expected isOnline: true for active advocate, got ${JSON.stringify(foundInDir)}`);
    }
    console.log(`✅ Public profile & directory returned isOnline=true with lastSeenAt`);

    // Test 7: Automatic Offline Detection when heartbeat expired
    console.log('\n--- Test 7: Automatic Offline Detection after timeout ---');
    // Set lastSeenAt to 5 minutes ago (300 seconds > 120s timeout)
    const fiveMinutesAgo = new Date(Date.now() - 300 * 1000);
    await prisma.advocate.update({
      where: { id: createdAdvocate.id },
      data: { isOnline: true, lastSeenAt: fiveMinutesAgo }
    });

    const expiredProfileRes = await request(`/api/advocates/${createdAdvocate.id}`);
    if (expiredProfileRes.status !== 200 || expiredProfileRes.body.advocate.isOnline !== false) {
      throw new Error(`Expected isOnline: false due to expired heartbeat, got isOnline=${expiredProfileRes.body.advocate?.isOnline}`);
    }

    const expiredDirRes = await request(`/api/advocates?search=${testSuffix}`);
    const foundExpiredInDir = expiredDirRes.body.advocates?.find(a => a.id === createdAdvocate.id);
    if (!foundExpiredInDir || foundExpiredInDir.isOnline !== false) {
      throw new Error(`Directory expected isOnline: false after timeout, got ${JSON.stringify(foundExpiredInDir)}`);
    }
    console.log('✅ Expired heartbeat dynamically calculated as isOnline: false');

    // Test 8: Authorization - Non-advocate and unauthenticated rejection
    console.log('\n--- Test 8: Authorization Checks ---');
    // Unauthenticated heartbeat
    const unauthHb = await request('/api/advocate/heartbeat', { method: 'POST' });
    if (unauthHb.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated heartbeat, got ${unauthHb.status}`);
    }

    // User token
    const userToken = signToken({ id: createdUser.id, type: 'user' });

    // Normal user attempting advocate heartbeat
    const userHb = await request('/api/advocate/heartbeat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (userHb.status !== 403) {
      throw new Error(`Expected 403 for user attempting advocate heartbeat, got ${userHb.status}`);
    }

    // Normal user attempting advocate online-status
    const userStatus = await request('/api/advocate/online-status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { isOnline: true }
    });
    if (userStatus.status !== 403) {
      throw new Error(`Expected 403 for user attempting advocate online-status, got ${userStatus.status}`);
    }
    console.log('✅ Unauthenticated and unauthorized roles rejected with 401 / 403');

    // Test 9: Saved Lawyer & Liked Advocate effective status
    console.log('\n--- Test 9: Saved & Liked Advocates effective online status ---');
    // Set advocate back to online with recent timestamp
    await prisma.advocate.update({
      where: { id: createdAdvocate.id },
      data: { isOnline: true, lastSeenAt: new Date() }
    });

    // User saves lawyer
    await request('/api/saved-lawyers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { advocateId: createdAdvocate.id }
    });

    // User likes advocate
    await request(`/api/advocates/${createdAdvocate.id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });

    // Check listSavedLawyers
    const savedListRes = await request('/api/saved-lawyers', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const savedAdv = savedListRes.body.advocates?.find(a => a.id === createdAdvocate.id);
    if (!savedAdv || savedAdv.isOnline !== true) {
      throw new Error(`Expected saved lawyer to have isOnline: true, got ${JSON.stringify(savedAdv)}`);
    }

    // Check getUserLikedAdvocates
    const likedListRes = await request('/api/user/liked-advocates', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const likedAdv = (likedListRes.body.data || likedListRes.body.advocates)?.find(a => a.id === createdAdvocate.id);
    if (!likedAdv || likedAdv.isOnline !== true) {
      throw new Error(`Expected liked advocate to have isOnline: true, got ${JSON.stringify(likedAdv)}`);
    }
    console.log('✅ Saved and Liked advocate lists return effective isOnline & lastSeenAt');

    // Test 10: Advocate Logout sets isOnline: false
    console.log('\n--- Test 10: Advocate Logout ---');
    const logoutRes = await request('/api/advocate/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${advToken}` }
    });
    if (logoutRes.status !== 200) {
      throw new Error(`Advocate logout failed: ${JSON.stringify(logoutRes.body)}`);
    }

    const advAfterLogout = await prisma.advocate.findUnique({ where: { id: createdAdvocate.id } });
    if (advAfterLogout.isOnline !== false) {
      throw new Error(`Expected isOnline: false after logout, got ${advAfterLogout.isOnline}`);
    }
    console.log('✅ Advocate logout successfully set isOnline: false');

    // Test 11: Blocked & Pending Deletion exclusion rules
    console.log('\n--- Test 11: Blocked & Pending Deletion Exclusion Rules ---');
    // Set advocate to BLOCKED and isOnline: true
    await prisma.advocate.update({
      where: { id: createdAdvocate.id },
      data: { status: 'BLOCKED', isOnline: true, lastSeenAt: new Date() }
    });

    const blockedProfileRes = await request(`/api/advocates/${createdAdvocate.id}`);
    if (blockedProfileRes.status !== 404) {
      throw new Error(`Expected 404 for BLOCKED advocate, got ${blockedProfileRes.status}`);
    }

    // Set advocate to PENDING deletion
    await prisma.advocate.update({
      where: { id: createdAdvocate.id },
      data: { status: 'ACTIVE', deletionStatus: 'PENDING', isOnline: true, lastSeenAt: new Date() }
    });
    const pendingDelProfileRes = await request(`/api/advocates/${createdAdvocate.id}`);
    if (pendingDelProfileRes.status !== 404) {
      throw new Error(`Expected 404 for PENDING_DELETION advocate, got ${pendingDelProfileRes.status}`);
    }
    console.log('✅ Blocked and Pending Deletion advocates remain excluded from discovery regardless of online status');

    console.log('\n🎉 ALL ADVOCATE ONLINE/OFFLINE STATUS TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    // Clean up test data
    try {
      await prisma.savedLawyer.deleteMany({ where: { advocate: { email: advEmail } } });
      await prisma.advocateLike.deleteMany({ where: { advocate: { email: advEmail } } });
      await prisma.advocate.deleteMany({ where: { email: advEmail } });
      await prisma.user.deleteMany({ where: { email: userEmail } });
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
