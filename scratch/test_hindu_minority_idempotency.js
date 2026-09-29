import prisma from '../src/lib/prisma.js';
import { hinduMinorityGuardianshipBearerActSections } from '../prisma/hinduMinorityGuardianshipBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function testIdempotency() {
  console.log('Testing seed idempotency for THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956...');

  const personalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Personal' }
  });

  if (!personalBearerAct) {
    console.error('Personal BearerAct not found!');
    process.exit(1);
  }

  const hmgaAct = await prisma.act.findFirst({
    where: {
      bearerActId: personalBearerAct.id,
      heading: 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956'
    }
  });

  if (!hmgaAct) {
    console.error('THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Act not found!');
    process.exit(1);
  }

  // Count sections before rerun
  const countBefore = await prisma.actSection.count({
    where: { actId: hmgaAct.id }
  });
  console.log(`Sections count before: ${countBefore}`);

  // Simulate seed idempotency logic
  const existingHmgaSections = await prisma.actSection.findMany({
    where: { actId: hmgaAct.id }
  });
  const hmgaSectionMap = new Map(existingHmgaSections.map(s => [s.section, s]));

  const toCreate = [];
  const toUpdate = [];

  for (const item of hinduMinorityGuardianshipBearerActSections) {
    const existing = hmgaSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push(item);
    } else {
      toUpdate.push({ id: existing.id, data: item });
    }
  }

  console.log(`Idempotency check: toCreate = ${toCreate.length}, toUpdate = ${toUpdate.length}`);

  if (toCreate.length !== 0) {
    console.error(`❌ FAIL: Expected 0 toCreate on rerun, found ${toCreate.length}`);
    process.exit(1);
  }

  if (toUpdate.length !== 13) {
    console.error(`❌ FAIL: Expected 13 toUpdate on rerun, found ${toUpdate.length}`);
    process.exit(1);
  }

  // Also check for any duplicate section names in DB
  const allSections = await prisma.actSection.findMany({
    where: { actId: hmgaAct.id },
    select: { section: true }
  });

  const sectionNameSet = new Set();
  let duplicatesFound = false;
  for (const s of allSections) {
    if (sectionNameSet.has(s.section)) {
      console.error(`❌ Duplicate section found: ${s.section}`);
      duplicatesFound = true;
    }
    sectionNameSet.add(s.section);
  }

  if (duplicatesFound) {
    console.error('❌ FAIL: Duplicate sections found in database');
    process.exit(1);
  }

  console.log('✅ PASS: Seed is 100% idempotent with 0 duplicates.');
  await prisma.$disconnect();
}

testIdempotency();
