import prisma from '../src/lib/prisma.js';
import axios from 'axios';

const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}`;

function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

async function runDetailedVerification() {
  console.log('--- Starting Detailed User Rights (500-Word Content) Verification ---');

  const expectedCategories = [
    {
      title: 'Children Rights',
      expectedHeadings: ['## Overview', '## Right to Education', '## Right to Protection From Abuse and Exploitation', '## Right to Health and Development', '## Protection Against Child Labour']
    },
    {
      title: 'Consumer Rights',
      expectedHeadings: ['## Overview', '## Right to Safety', '## Right to Information', '## Right to Choose', '## Right to Seek Redressal']
    },
    {
      title: 'Tenant Rights',
      expectedHeadings: ['## Overview', '## Rental Agreement', '## Rent and Security Deposit', '## Privacy and Peaceful Possession', '## Notice and Eviction']
    },
    {
      title: 'Employee Rights',
      expectedHeadings: ['## Overview', '## Wages and Payment', '## Workplace Safety', '## Equality and Non-Discrimination', '## Protection Against Workplace Harassment']
    },
    {
      title: 'Women Rights',
      expectedHeadings: ['## Overview', '## Right to Equality', '## Protection From Violence', '## Rights in the Workplace', '## Property and Financial Rights']
    },
    {
      title: 'Digital and Privacy Rights',
      expectedHeadings: ['## Overview', '## Right to Privacy', '## Personal Data', '## Consent and Data Handling', '## Online Safety']
    }
  ];

  // 1. Direct DB verification of word count & subheadings
  console.log('\n[Step 1] Verifying DB records, word counts, and subheadings...');
  for (const cat of expectedCategories) {
    const record = await prisma.userRight.findFirst({
      where: { title: cat.title }
    });

    if (!record) {
      throw new Error(`Category "${cat.title}" not found in database!`);
    }

    const words = countWords(record.description);
    console.log(`\n• Category: "${cat.title}"`);
    console.log(`  - Word Count: ${words} words`);

    if (words < 400 || words > 600) {
      throw new Error(`Category "${cat.title}" word count (${words}) is outside the expected 400-600 word range.`);
    }

    for (const h of cat.expectedHeadings) {
      if (!record.description.includes(h)) {
        throw new Error(`Category "${cat.title}" missing expected subheading "${h}"`);
      }
    }
    console.log(`  - Subheadings Verified: ${cat.expectedHeadings.length} subheadings present.`);
    console.log(`  - Photo URL: ${record.photo}`);
  }

  // 2. Public API verification
  console.log('\n[Step 2] Testing Public API GET /api/user-rights...');
  const clientPublic = axios.create({ baseURL: BASE_URL });

  const resList = await clientPublic.get('/api/user-rights?page=1&limit=10');
  if (resList.status !== 200 || !resList.data.success || !Array.isArray(resList.data.data)) {
    throw new Error('Public list API failed');
  }

  console.log(`Public list returned ${resList.data.data.length} records.`);
  for (const item of resList.data.data) {
    const words = countWords(item.description);
    console.log(`  ✓ Public List Item "${item.title}" -> ${words} words`);
  }

  // 3. Public Single API verification
  console.log('\n[Step 3] Testing Public Single Record API GET /api/user-rights/:id...');
  for (const item of resList.data.data) {
    const resSingle = await clientPublic.get(`/api/user-rights/${item.id}`);
    if (resSingle.status !== 200 || !resSingle.data.success || resSingle.data.data.id !== item.id) {
      throw new Error(`Single API failed for "${item.title}"`);
    }
    const singleWords = countWords(resSingle.data.data.description);
    console.log(`  ✓ Single API "${resSingle.data.data.title}" -> ${singleWords} words, photo: ${resSingle.data.data.photo ? 'present' : 'null'}`);
  }

  console.log('\n🎉 ALL DETAILED USER RIGHTS CONTENT VERIFICATIONS PASSED! 🎉\n');
}

runDetailedVerification()
  .catch((err) => {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
