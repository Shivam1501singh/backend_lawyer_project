import prisma from '../src/lib/prisma.js';
import { execSync } from 'child_process';
import { immigrationAndForeignersBearerActSections } from '../prisma/immigrationAndForeignersBearerActData.js';

async function testIdempotency() {
  console.log('--- Testing Idempotency for THE IMMIGRATION AND FOREIGNERS ACT, 2025 ---');

  const ACT_HEADING = 'THE IMMIGRATION AND FOREIGNERS ACT, 2025';

  const constitutionalBearerAct = await prisma.bearerAct.findFirst({
    where: {
      name: {
        contains: 'Constitutional and Political',
        mode: 'insensitive'
      }
    }
  });

  if (!constitutionalBearerAct) {
    throw new Error('Constitutional and Political BearerAct not found!');
  }

  // Check counts before
  const actBefore = await prisma.act.findFirst({
    where: {
      bearerActId: constitutionalBearerAct.id,
      heading: ACT_HEADING
    }
  });

  const countBefore = actBefore ? await prisma.actSection.count({ where: { actId: actBefore.id } }) : 0;
  console.log(`Pre-reseed count: ${countBefore}`);

  // Run seed script again
  console.log('Running run_immigration_and_foreigners_seed.js again...');
  execSync('node scratch/run_immigration_and_foreigners_seed.js', { stdio: 'inherit' });

  // Check counts after
  const actsAfter = await prisma.act.findMany({
    where: {
      bearerActId: constitutionalBearerAct.id,
      heading: ACT_HEADING
    }
  });

  if (actsAfter.length !== 1) {
    throw new Error(`Expected exactly 1 Act record, found ${actsAfter.length}`);
  }

  const countAfter = await prisma.actSection.count({ where: { actId: actsAfter[0].id } });
  console.log(`Post-reseed count: ${countAfter}`);

  if (countAfter !== immigrationAndForeignersBearerActSections.length) {
    throw new Error(`Expected ${immigrationAndForeignersBearerActSections.length} sections, got ${countAfter}`);
  }

  if (countBefore > 0 && countAfter !== countBefore) {
    throw new Error(`Idempotency violated: before was ${countBefore}, after is ${countAfter}`);
  }

  // Verify no duplicate section names
  const allSections = await prisma.actSection.findMany({
    where: { actId: actsAfter[0].id }
  });

  const sectionSet = new Set();
  for (const sec of allSections) {
    if (sectionSet.has(sec.section)) {
      throw new Error(`Duplicate section found: ${sec.section}`);
    }
    sectionSet.add(sec.section);
  }

  console.log('✅ Idempotency test passed: No duplicates created, exact section count preserved.');
}

testIdempotency()
  .catch(err => {
    console.error('❌ Idempotency test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
