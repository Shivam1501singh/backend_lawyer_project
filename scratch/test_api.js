import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../src/utils/jwt.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- Starting Proximity Sorting API Integration Tests ---');

  // 1. Fetch mock users from database
  const rahul = await prisma.user.findFirst({ where: { email: 'client.rahul@example.com' } });
  const rohit = await prisma.user.findFirst({ where: { email: 'client.rohit@example.com' } });

  if (!rahul || !rohit) {
    console.error('Could not find seeded mock users. Please seed database first.');
    process.exit(1);
  }

  console.log(`Resolved Delhi User (Rahul Verma): id=${rahul.id}, lat=${rahul.latitude}, lon=${rahul.longitude}`);
  console.log(`Resolved Bengaluru User (Rohit Nair): id=${rohit.id}, lat=${rohit.latitude}, lon=${rohit.longitude}`);

  // 2. Generate tokens
  const rahulToken = signToken({ id: rahul.id, type: 'user' });
  const rohitToken = signToken({ id: rohit.id, type: 'user' });

  const client = axios.create({
    baseURL: 'http://localhost:5000/api',
    validateStatus: () => true
  });

  // --- Test Case 1: Unauthenticated Guest User ---
  console.log('\n[Test 1] Unauthenticated Guest Directory Retrieval...');
  const resGuest = await client.get('/advocates');
  if (resGuest.status !== 200 || !resGuest.data.success) {
    throw new Error(`Test 1 Failed: Status=${resGuest.status}, msg=${resGuest.data.message}`);
  }
  console.log(`✓ Guest retrieval successful. Returned ${resGuest.data.advocates.length} advocates.`);
  const distancesGuest = resGuest.data.advocates.map(a => a.distance);
  console.log('Distances returned to Guest (should all be null/undefined):', distancesGuest);
  if (distancesGuest.some(d => d !== null && d !== undefined)) {
    throw new Error('Test 1 Failed: Guest user received distances!');
  }

  // --- Test Case 2: Authenticated Delhi User ---
  console.log('\n[Test 2] Authenticated Delhi User (Rahul) Proximity Sorting...');
  const resDelhi = await client.get('/advocates', {
    headers: { Cookie: `auth_token=${rahulToken}` }
  });
  if (resDelhi.status !== 200 || !resDelhi.data.success) {
    throw new Error(`Test 2 Failed: Status=${resDelhi.status}, msg=${resDelhi.data.message}`);
  }
  console.log(`✓ Delhi user retrieval successful. Returned ${resDelhi.data.advocates.length} advocates.`);
  const advocatesDelhi = resDelhi.data.advocates;
  const distancesDelhi = advocatesDelhi.map(a => a.distance);
  console.log('Distances returned for Delhi User (should be sorted asc):', distancesDelhi);

  // Validate sorted order
  for (let i = 0; i < distancesDelhi.length - 1; i++) {
    if (distancesDelhi[i] !== null && distancesDelhi[i+1] !== null && distancesDelhi[i] > distancesDelhi[i+1]) {
      throw new Error(`Test 2 Failed: Distances not sorted asc! Index ${i}: ${distancesDelhi[i]} > ${distancesDelhi[i+1]}`);
    }
  }
  // Delhi user should see Delhi advocates (distance ~0-20km) first
  if (advocatesDelhi[0].city !== 'New Delhi') {
    throw new Error(`Test 2 Failed: Nearest advocate is not from New Delhi! Advocate city: ${advocatesDelhi[0].city}`);
  }
  console.log(`✓ Proximity sorting validated. First advocate: ${advocatesDelhi[0].fullName} (${advocatesDelhi[0].city}) is ${advocatesDelhi[0].distance} km away.`);

  // --- Test Case 3: Authenticated Bengaluru User ---
  console.log('\n[Test 3] Authenticated Bengaluru User (Rohit) Proximity Sorting...');
  const resBengaluru = await client.get('/advocates', {
    headers: { Cookie: `auth_token=${rohitToken}` }
  });
  if (resBengaluru.status !== 200 || !resBengaluru.data.success) {
    throw new Error(`Test 3 Failed: Status=${resBengaluru.status}, msg=${resBengaluru.data.message}`);
  }
  console.log(`✓ Bengaluru user retrieval successful. Returned ${resBengaluru.data.advocates.length} advocates.`);
  const advocatesBengaluru = resBengaluru.data.advocates;
  const distancesBengaluru = advocatesBengaluru.map(a => a.distance);
  console.log('Distances returned for Bengaluru User (should be sorted asc):', distancesBengaluru);

  // Validate sorted order
  for (let i = 0; i < distancesBengaluru.length - 1; i++) {
    if (distancesBengaluru[i] !== null && distancesBengaluru[i+1] !== null && distancesBengaluru[i] > distancesBengaluru[i+1]) {
      throw new Error(`Test 3 Failed: Distances not sorted asc! Index ${i}: ${distancesBengaluru[i]} > ${distancesBengaluru[i+1]}`);
    }
  }
  // Bengaluru user should see Bengaluru advocates first
  if (advocatesBengaluru[0].city !== 'Bengaluru') {
    throw new Error(`Test 3 Failed: Nearest advocate is not from Bengaluru! Advocate city: ${advocatesBengaluru[0].city}`);
  }
  console.log(`✓ Proximity sorting validated. First advocate: ${advocatesBengaluru[0].fullName} (${advocatesBengaluru[0].city}) is ${advocatesBengaluru[0].distance} km away.`);

  // --- Test Case 4: Authenticated User + Practice Area Filter ---
  console.log('\n[Test 4] Authenticated Delhi User + Practice Area Filter...');
  const resFilter = await client.get('/advocates?practiceArea=Criminal%20Law', {
    headers: { Cookie: `auth_token=${rahulToken}` }
  });
  if (resFilter.status !== 200 || !resFilter.data.success) {
    throw new Error(`Test 4 Failed: Status=${resFilter.status}`);
  }
  console.log(`✓ Filtered retrieval successful. Returned ${resFilter.data.advocates.length} advocates.`);
  const advocatesFilter = resFilter.data.advocates;
  const distancesFilter = advocatesFilter.map(a => a.distance);
  console.log('Criminal Law advocates sorted by distance to Delhi:', distancesFilter);
  if (advocatesFilter.some(a => !a.practiceAreas.includes('Criminal Law'))) {
    throw new Error('Test 4 Failed: Advocate returned that does not practice Criminal Law!');
  }
  for (let i = 0; i < distancesFilter.length - 1; i++) {
    if (distancesFilter[i] !== null && distancesFilter[i+1] !== null && distancesFilter[i] > distancesFilter[i+1]) {
      throw new Error('Test 4 Failed: Proximity distances are not sorted!');
    }
  }

  // --- Test Case 5: Pincode Manual Override ---
  console.log('\n[Test 5] Pincode Manual Override for Authenticated Delhi User...');
  const resOverride = await client.get('/advocates?pincode=560001', {
    headers: { Cookie: `auth_token=${rahulToken}` }
  });
  if (resOverride.status !== 200 || !resOverride.data.success) {
    throw new Error(`Test 5 Failed: Status=${resOverride.status}`);
  }
  console.log(`✓ Override retrieval successful. Returned ${resOverride.data.advocates.length} advocates.`);
  const advocatesOverride = resOverride.data.advocates;
  if (advocatesOverride[0].city !== 'Bengaluru') {
    throw new Error(`Test 5 Failed: Pincode 560001 (Bengaluru) was override but nearest advocate is from: ${advocatesOverride[0].city}`);
  }
  console.log(`✓ Override validated. First advocate: ${advocatesOverride[0].fullName} (${advocatesOverride[0].city}) is ${advocatesOverride[0].distance} km away.`);

  // --- Test Case 6: Authenticated User + Manual Sort (sort=experience) ---
  console.log('\n[Test 6] Manual Sort Override (sort=experience) for Authenticated Delhi User...');
  const resSortOverride = await client.get('/advocates?sort=experience', {
    headers: { Cookie: `auth_token=${rahulToken}` }
  });
  if (resSortOverride.status !== 200 || !resSortOverride.data.success) {
    throw new Error(`Test 6 Failed: Status=${resSortOverride.status}`);
  }
  const advocatesSort = resSortOverride.data.advocates;
  const experiences = advocatesSort.map(a => a.experienceYears);
  console.log('Experiences returned (should be sorted desc):', experiences);
  for (let i = 0; i < experiences.length - 1; i++) {
    if (experiences[i] < experiences[i+1]) {
      throw new Error(`Test 6 Failed: Not sorted by experience desc! Index ${i}: ${experiences[i]} < ${experiences[i+1]}`);
    }
  }
  // Verify distance is still computed and attached
  const distancesWithSort = advocatesSort.map(a => a.distance);
  console.log('Distances attached during experience sort:', distancesWithSort);
  if (!distancesWithSort.some(d => d !== null && d !== undefined)) {
    throw new Error('Test 6 Failed: Distance was not computed/attached when sorting by experience!');
  }
  console.log('✓ Manual sort override validated. Experience sort respected and distances correctly computed.');

  console.log('\n--- ALL API INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n--- TEST EXECUTION FAILED ---');
  console.error(err);
  process.exit(1);
});
