import prisma from '../src/lib/prisma.js';
import http from 'http';

const PORT = 5096;
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
  return str.trim().split(/\s+/).filter(Boolean).length;
}

async function runVerification() {
  console.log('--- Starting Guides Seed Verification ---');

  const expectedGuideTitles = [
    'How to File a Complaint',
    'How to Send a Legal Notice',
    'How to Find the Right Lawyer',
    'How to File for Divorce',
    'How to Register Property'
  ];

  try {
    // 1. Direct DB verification
    console.log('\n[Check 1] Checking Guides in database...');
    const allDbGuides = await prisma.guide.findMany({
      where: { title: { in: expectedGuideTitles } }
    });

    console.log(`Found ${allDbGuides.length} matching guides in database.`);
    if (allDbGuides.length !== 5) {
      throw new Error(`Expected exactly 5 demo guides, but found ${allDbGuides.length}`);
    }

    for (const g of allDbGuides) {
      const words = countWords(g.description);
      console.log(`- "${g.title}": ${words} words (ID: ${g.id})`);
      if (words < 200) {
        throw new Error(`Guide "${g.title}" description is too short (${words} words).`);
      }
    }
    console.log('✅ Passed: All 5 demo guides exist in DB with rich, detailed descriptions.');

    // 2. Public API: GET /api/guides
    console.log('\n[Check 2] Testing Public GET /api/guides...');
    const resList = await request('GET', '/api/guides?limit=10');
    if (resList.status !== 200 || !resList.body.success || !Array.isArray(resList.body.data)) {
      throw new Error(`GET /api/guides failed: ${JSON.stringify(resList)}`);
    }

    const returnedTitles = resList.body.data.map(g => g.title);
    for (const expectedTitle of expectedGuideTitles) {
      if (!returnedTitles.includes(expectedTitle)) {
        throw new Error(`Missing expected guide "${expectedTitle}" in GET /api/guides response.`);
      }
    }
    console.log(`✅ Passed: Public GET /api/guides returned all 5 seeded demo guides (Total in response: ${resList.body.data.length}).`);

    // 3. Public API: GET /api/guides/:id for each guide
    console.log('\n[Check 3] Testing Public GET /api/guides/:id for each demo guide...');
    for (const g of allDbGuides) {
      const resSingle = await request('GET', `/api/guides/${g.id}`);
      if (resSingle.status !== 200 || !resSingle.body.success || resSingle.body.data.id !== g.id) {
        throw new Error(`GET /api/guides/${g.id} failed: ${JSON.stringify(resSingle)}`);
      }
      if (resSingle.body.data.title !== g.title) {
        throw new Error(`Title mismatch for ${g.id}: expected "${g.title}", got "${resSingle.body.data.title}"`);
      }
      console.log(`✅ Passed: GET /api/guides/${g.id} returned "${g.title}" successfully.`);
    }

    // 4. Check for no duplicate titles in database
    console.log('\n[Check 4] Checking for duplicate guide titles in database...');
    for (const title of expectedGuideTitles) {
      const count = await prisma.guide.count({
        where: { title }
      });
      if (count !== 1) {
        throw new Error(`Found ${count} copies of guide with title "${title}". Expected exactly 1.`);
      }
    }
    console.log('✅ Passed: Zero duplicate records found for all 5 demo guides.');

    console.log('\n🎉 ALL GUIDES SEED VERIFICATION CHECKS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error('❌ Verification Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runVerification();
