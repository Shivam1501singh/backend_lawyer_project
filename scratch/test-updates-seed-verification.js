import prisma from '../src/lib/prisma.js';
import http from 'http';

const PORT = 5094;
process.env.PORT = PORT;
process.env.NODE_ENV = 'test';

// Dynamically import express app from server.js
const { default: app } = await import('../src/server.js');

function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const req = http.request(
      url,
      {
        method,
        headers: { 'Content-Type': 'application/json' }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

function countWords(str) {
  return (str || '').trim().split(/\s+/).filter(Boolean).length;
}

async function runVerification() {
  console.log('--- Starting Updates Seed Verification ---');

  const expectedUpdateTitles = [
    'Important Changes in Consumer Law',
    'New Digital Privacy Regulations',
    'Recent Developments in Property and Land-Record Rules'
  ];

  try {
    // 1. Direct DB verification
    console.log('\n[Check 1] Checking Updates in database...');
    const allDbUpdates = await prisma.update.findMany({
      where: { title: { in: expectedUpdateTitles } }
    });

    console.log(`Found ${allDbUpdates.length} matching updates in database.`);
    if (allDbUpdates.length !== 3) {
      throw new Error(`Expected exactly 3 demo updates, but found ${allDbUpdates.length}`);
    }

    for (const u of allDbUpdates) {
      const oldWords = countWords(u.oldDescription);
      const newWords = countWords(u.newDescription);
      console.log(`- "${u.title}" (ID: ${u.id})`);
      console.log(`  * oldDescription: ${oldWords} words`);
      console.log(`  * newDescription: ${newWords} words`);
      if (oldWords < 50 || newWords < 50) {
        throw new Error(`Update "${u.title}" descriptions are too short (old: ${oldWords}, new: ${newWords}).`);
      }
    }
    console.log('✅ Passed: All 3 demo updates exist in DB with rich, informative old & new descriptions.');

    // 2. Public API: GET /api/updates
    console.log('\n[Check 2] Testing Public GET /api/updates...');
    const resList = await request('GET', '/api/updates?limit=10');
    if (resList.status !== 200 || !resList.body.success || !Array.isArray(resList.body.data)) {
      throw new Error(`GET /api/updates failed: ${JSON.stringify(resList)}`);
    }

    const returnedTitles = resList.body.data.map(u => u.title);
    for (const expectedTitle of expectedUpdateTitles) {
      if (!returnedTitles.includes(expectedTitle)) {
        throw new Error(`Missing expected update "${expectedTitle}" in GET /api/updates response.`);
      }
    }
    console.log(`✅ Passed: Public GET /api/updates returned all 3 seeded demo updates (Total in response: ${resList.body.data.length}).`);

    // 3. Public API: GET /api/updates/:id for each update
    console.log('\n[Check 3] Testing Public GET /api/updates/:id for each demo update...');
    for (const u of allDbUpdates) {
      const resSingle = await request('GET', `/api/updates/${u.id}`);
      if (resSingle.status !== 200 || !resSingle.body.success || resSingle.body.data.id !== u.id) {
        throw new Error(`GET /api/updates/${u.id} failed: ${JSON.stringify(resSingle)}`);
      }
      if (resSingle.body.data.title !== u.title) {
        throw new Error(`Title mismatch for ${u.id}: expected "${u.title}", got "${resSingle.body.data.title}"`);
      }
      if (!resSingle.body.data.oldDescription || !resSingle.body.data.newDescription) {
        throw new Error(`Missing oldDescription or newDescription in GET /api/updates/${u.id}`);
      }
      console.log(`✅ Passed: GET /api/updates/${u.id} returned "${u.title}" with valid oldDescription & newDescription.`);
    }

    // 4. Check for no duplicate titles in database
    console.log('\n[Check 4] Checking for duplicate update titles in database...');
    for (const title of expectedUpdateTitles) {
      const count = await prisma.update.count({
        where: { title }
      });
      if (count !== 1) {
        throw new Error(`Found ${count} copies of update with title "${title}". Expected exactly 1.`);
      }
    }
    console.log('✅ Passed: Zero duplicate records found for all 3 demo updates.');

    console.log('\n🎉 ALL UPDATES SEED VERIFICATION CHECKS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error('❌ Verification Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runVerification();
