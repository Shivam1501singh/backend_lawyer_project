import prisma from '../src/lib/prisma.js';
import { dissolutionOfMuslimMarriagesBearerActSections } from '../prisma/dissolutionOfMuslimMarriagesBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function testIdempotency() {
  console.log('Testing seeding idempotency for THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939...');

  const personalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Personal' }
  });

  if (!personalBearerAct) {
    throw new Error('Personal BearerAct not found');
  }

  const act = await prisma.act.findFirst({
    where: {
      bearerActId: personalBearerAct.id,
      heading: 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939'
    }
  });

  if (!act) {
    throw new Error('Act THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939 not found');
  }

  const initialCount = await prisma.actSection.count({
    where: { actId: act.id }
  });
  console.log(`Initial sections count in DB: ${initialCount}`);

  // Re-run the update logic as done in seed
  const existingSections = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of dissolutionOfMuslimMarriagesBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

    if (!existing) {
      await prisma.actSection.create({
        data: {
          actId: act.id,
          section: item.section,
          sectionOrder: sectionOrder,
          chapterNo: item.chapterNo,
          chapterName: item.chapterName,
          title: item.title,
          description: item.description,
          metaData: item.metaData,
          metaDescription: item.metaDescription,
          metaTitle: item.metaTitle
        }
      });
      createdCount++;
    } else {
      await prisma.actSection.update({
        where: { id: existing.id },
        data: {
          sectionOrder: sectionOrder,
          chapterNo: item.chapterNo,
          chapterName: item.chapterName,
          title: item.title,
          description: item.description,
          metaData: item.metaData,
          metaDescription: item.metaDescription,
          metaTitle: item.metaTitle
        }
      });
      updatedCount++;
    }
  }

  const afterCount = await prisma.actSection.count({
    where: { actId: act.id }
  });
  console.log(`After re-seed sections count in DB: ${afterCount}`);
  console.log(`Created: ${createdCount}, Updated: ${updatedCount}`);

  if (initialCount === 6 && afterCount === 6 && createdCount === 0 && updatedCount === 6) {
    console.log('✅ Idempotency test passed: Exact 6 sections preserved without duplicates.');
  } else {
    console.error('❌ Idempotency test failed!');
    process.exit(1);
  }
}

testIdempotency()
  .catch(e => {
    console.error('Idempotency test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
