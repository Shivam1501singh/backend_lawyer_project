import prisma from '../src/lib/prisma.js';
import { constitutionBearerActSections } from '../prisma/constitutionBearerActData.js';
import { execSync } from 'child_process';

async function testIdempotency() {
  console.log('=== TESTING CONSTITUTION OF INDIA SEED IDEMPOTENCY ===');

  const bearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Constitutional and Political' }
  });
  if (!bearerAct) {
    throw new Error('Constitutional and Political BearerAct not found');
  }

  const actBefore = await prisma.act.findFirst({
    where: {
      bearerActId: bearerAct.id,
      heading: 'CONSTITUTION OF INDIA'
    }
  });
  if (!actBefore) {
    throw new Error('Act CONSTITUTION OF INDIA not found before rerun');
  }

  const sectionsCountBefore = await prisma.actSection.count({
    where: { actId: actBefore.id }
  });
  console.log(`Sections count before rerun: ${sectionsCountBefore}`);

  // Also count other Acts in the system to verify isolation
  const allActsBefore = await prisma.act.findMany({
    select: { id: true, heading: true, _count: { select: { sections: true } } }
  });

  console.log('Running targeted seed script second time...');
  const output = execSync('node scratch/run_constitution_seed.js', { encoding: 'utf-8' });
  console.log('Rerun output:\n' + output);

  const actAfter = await prisma.act.findFirst({
    where: {
      bearerActId: bearerAct.id,
      heading: 'CONSTITUTION OF INDIA'
    }
  });
  if (!actAfter) {
    throw new Error('Act CONSTITUTION OF INDIA not found after rerun');
  }

  if (actBefore.id !== actAfter.id) {
    throw new Error(`Act ID changed! Before: ${actBefore.id}, After: ${actAfter.id}`);
  }

  const sectionsCountAfter = await prisma.actSection.count({
    where: { actId: actAfter.id }
  });
  console.log(`Sections count after rerun: ${sectionsCountAfter}`);

  if (sectionsCountBefore !== sectionsCountAfter) {
    throw new Error(`Duplicate sections detected! Before: ${sectionsCountBefore}, After: ${sectionsCountAfter}`);
  }

  if (sectionsCountAfter !== constitutionBearerActSections.length) {
    throw new Error(`Count mismatch with JSON! Expected: ${constitutionBearerActSections.length}, Found: ${sectionsCountAfter}`);
  }

  // Verify other Acts were unchanged
  const allActsAfter = await prisma.act.findMany({
    select: { id: true, heading: true, _count: { select: { sections: true } } }
  });

  if (allActsBefore.length !== allActsAfter.length) {
    throw new Error(`Total Acts count changed! Before: ${allActsBefore.length}, After: ${allActsAfter.length}`);
  }

  for (const bAct of allActsBefore) {
    const aAct = allActsAfter.find(a => a.id === bAct.id);
    if (!aAct) {
      throw new Error(`Act ${bAct.heading} missing after rerun!`);
    }
    if (aAct._count.sections !== bAct._count.sections) {
      throw new Error(`Section count for ${bAct.heading} changed! Before: ${bAct._count.sections}, After: ${aAct._count.sections}`);
    }
  }

  console.log('Idempotency verified successfully! 0 duplicates created, all existing acts untouched.');
}

testIdempotency()
  .catch(e => {
    console.error('Idempotency test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
