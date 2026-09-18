import prisma from '../src/lib/prisma.js';
import axios from 'axios';
import { signToken } from '../src/utils/jwt.js';

const PORT = 5096;
const BASE_URL = `http://localhost:${PORT}`;

async function runSeedVerification() {
  console.log('--- Starting User Rights Seed Verification ---');

  const expectedTitles = [
    'Children Rights',
    'Consumer Rights',
    'Tenant Rights',
    'Employee Rights',
    'Women Rights',
    'Digital and Privacy Rights'
  ];

  // 1. Check direct database records
  console.log('\n[Step 1] Checking seeded User Rights in database...');
  const dbRights = await prisma.userRight.findMany({
    where: {
      title: { in: expectedTitles }
    }
  });

  console.log(`Found ${dbRights.length} seeded rights in DB.`);
  if (dbRights.length !== 6) {
    throw new Error(`Expected 6 seeded rights in DB, but found ${dbRights.length}`);
  }

  for (const title of expectedTitles) {
    const item = dbRights.find(r => r.title === title);
    if (!item) {
      throw new Error(`Missing expected right in DB: ${title}`);
    }
    if (!item.description || !item.photo || !item.createdBy) {
      throw new Error(`Incomplete record for ${title}: ${JSON.stringify(item)}`);
    }
    console.log(`✅ Verified DB record: "${item.title}"`);
  }

  // 2. Setup API clients
  const creator = await prisma.contentCreator.findUnique({
    where: { email: 'trainee6@techvunex.in' }
  });
  const creatorToken = signToken({ id: creator.id, type: 'content_creator' });

  const clientCreator = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${creatorToken}` }
  });

  const clientPublic = axios.create({
    baseURL: BASE_URL
  });

  // 3. Check Public API GET /api/user-rights
  console.log('\n[Step 2] Testing Public API GET /api/user-rights...');
  const resList = await clientPublic.get('/api/user-rights?page=1&limit=20');
  if (resList.status !== 200 || !resList.data.success || !Array.isArray(resList.data.data)) {
    throw new Error(`Failed to fetch public user rights: ${JSON.stringify(resList.data)}`);
  }

  const returnedTitles = resList.data.data.map(r => r.title);
  console.log('Public list contains titles:', returnedTitles);
  for (const title of expectedTitles) {
    if (!returnedTitles.includes(title)) {
      throw new Error(`Public API list missing seeded title: ${title}`);
    }
  }
  console.log('✅ All 6 seeded categories present in public list API!');

  // 4. Check Public Single Record API GET /api/user-rights/:id
  console.log('\n[Step 3] Testing Public Single API GET /api/user-rights/:id for each seeded right...');
  for (const dbRight of dbRights) {
    const resSingle = await clientPublic.get(`/api/user-rights/${dbRight.id}`);
    if (resSingle.status !== 200 || !resSingle.data.success || resSingle.data.data.id !== dbRight.id) {
      throw new Error(`Failed single item fetch for ${dbRight.title}`);
    }
    console.log(`✅ Single fetch verified: ${resSingle.data.data.title} (${resSingle.data.data.id})`);
  }

  // 5. Test Non-Destructive Seed with Custom Record
  console.log('\n[Step 4] Creating custom Content Creator User Right to verify non-destruction...');
  const customRightRes = await clientCreator.post('/api/content-creator/user-rights', {
    title: 'Custom Test Right To Clean Energy',
    description: 'Every community has the right to clean, renewable, and sustainable energy.'
  });

  const customRightId = customRightRes.data.data.id;
  console.log(`Created custom right ID: ${customRightId}`);

  // 6. Verify custom right is in DB
  const checkCustom = await prisma.userRight.findUnique({ where: { id: customRightId } });
  if (!checkCustom) {
    throw new Error('Custom right was not found in DB');
  }

  // Clean up custom test right
  await prisma.userRight.delete({ where: { id: customRightId } });
  console.log('Cleaned up custom test record.');

  console.log('\n🎉 USER RIGHTS SEED VERIFICATION COMPLETE AND SUCCESSFUL! 🎉\n');
}

runSeedVerification()
  .catch(err => {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
