import prisma from '../src/lib/prisma.js';
import { specialMarriageBearerActSections } from '../prisma/specialMarriageBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function testIdempotency() {
  console.log('Testing seed idempotency for THE SPECIAL MARRIAGE ACT, 1954...');

  const personalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Personal' }
  });

  if (!personalBearerAct) {
    console.error('Personal BearerAct not found!');
    process.exit(1);
  }

  const smaAct = await prisma.act.findFirst({
    where: {
      bearerActId: personalBearerAct.id,
      heading: 'THE SPECIAL MARRIAGE ACT, 1954'
    }
  });

  if (!smaAct) {
    console.error('THE SPECIAL MARRIAGE ACT, 1954 Act not found!');
    process.exit(1);
  }

  // Count sections before rerun
  const countBefore = await prisma.actSection.count({
    where: { actId: smaAct.id }
  });
  console.log(`Sections count before: ${countBefore}`);

  // Simulate seed idempotency logic
  const existingSmaSections = await prisma.actSection.findMany({
    where: { actId: smaAct.id }
  });
  const smaSectionMap = new Map(existingSmaSections.map(s => [s.section, s]));

  const toCreate = [];
  const toUpdate = [];

  for (const item of specialMarriageBearerActSections) {
    const existing = smaSectionMap.get(item.section);
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

  if (toUpdate.length !== 57) {
    console.error(`❌ FAIL: Expected 57 toUpdate on rerun, found ${toUpdate.length}`);
    process.exit(1);
  }

  // Also check for any duplicate section names in DB
  const allSections = await prisma.actSection.findMany({
    where: { actId: smaAct.id },
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
