import prisma from '../src/lib/prisma.js';
import { execSync } from 'child_process';
import { muslimWomenMarriageProtectionBearerActSections } from '../prisma/muslimWomenMarriageProtectionBearerActData.js';

const ACT_HEADING = 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019';

async function testIdempotency() {
  console.log('=== IDEMPOTENCY TEST: THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019 ===\n');

  // Check initial state
  const personal = await prisma.bearerAct.findUnique({ where: { name: 'Personal' } });
  if (!personal) {
    throw new Error('Personal category does not exist');
  }

  const actBefore = await prisma.act.findFirst({
    where: { bearerActId: personal.id, heading: ACT_HEADING },
    include: { sections: true }
  });

  const countBefore = actBefore ? actBefore.sections.length : 0;
  console.log(`Initial section count: ${countBefore}`);

  console.log('Running seed runner 1st time...');
  execSync('node scratch/run_muslim_women_marriage_protection_seed.js', { stdio: 'inherit' });

  const actRun1 = await prisma.act.findFirst({
    where: { bearerActId: personal.id, heading: ACT_HEADING },
    include: { sections: true }
  });
  console.log(`Section count after 1st run: ${actRun1.sections.length}`);

  if (actRun1.sections.length !== muslimWomenMarriageProtectionBearerActSections.length) {
    throw new Error(`Expected ${muslimWomenMarriageProtectionBearerActSections.length} sections, found ${actRun1.sections.length}`);
  }

  console.log('Running seed runner 2nd time to verify idempotency...');
  execSync('node scratch/run_muslim_women_marriage_protection_seed.js', { stdio: 'inherit' });

  const actRun2 = await prisma.act.findFirst({
    where: { bearerActId: personal.id, heading: ACT_HEADING },
    include: { sections: true }
  });
  console.log(`Section count after 2nd run: ${actRun2.sections.length}`);

  if (actRun2.sections.length !== muslimWomenMarriageProtectionBearerActSections.length) {
    throw new Error(`Idempotency failed! Section count became ${actRun2.sections.length}`);
  }

  // Check that no duplicate Acts exist
  const actsCount = await prisma.act.count({
    where: { bearerActId: personal.id, heading: ACT_HEADING }
  });
  if (actsCount !== 1) {
    throw new Error(`Expected exactly 1 Act record, found ${actsCount}`);
  }

  console.log('\n✅ IDEMPOTENCY TEST PASSED! No duplicates created, section count strictly maintained.');
}

testIdempotency()
  .catch(err => {
    console.error('❌ IDEMPOTENCY TEST FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
