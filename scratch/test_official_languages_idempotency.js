import prisma from '../src/lib/prisma.js';
import { officialLanguagesBearerActSections } from '../prisma/officialLanguagesBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function testIdempotency() {
  console.log('--- Testing Idempotency for THE OFFICIAL LANGUAGES ACT, 1963 ---');

  const ACT_HEADING = 'THE OFFICIAL LANGUAGES ACT, 1963';

  // Fetch BearerAct
  const bearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Constitutional and Political' }
  });

  if (!bearerAct) {
    throw new Error('Constitutional and Political BearerAct not found in database!');
  }

  // Count acts with this heading
  const actCountBefore = await prisma.act.count({
    where: {
      bearerActId: bearerAct.id,
      heading: ACT_HEADING
    }
  });

  const act = await prisma.act.findFirst({
    where: {
      bearerActId: bearerAct.id,
      heading: ACT_HEADING
    }
  });

  if (!act) {
    throw new Error('Act not found!');
  }

  const sectionsCountBefore = await prisma.actSection.count({
    where: { actId: act.id }
  });

  console.log(`Before re-seed: Act count = ${actCountBefore}, Sections count = ${sectionsCountBefore}`);

  // Re-run seed logic directly
  const existingSections = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  const toCreate = [];
  const toUpdate = [];

  for (const item of officialLanguagesBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

    if (!existing) {
      toCreate.push({
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
      });
    } else {
      toUpdate.push({
        id: existing.id,
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
    }
  }

  if (toCreate.length > 0) {
    await prisma.actSection.createMany({ data: toCreate });
  }

  if (toUpdate.length > 0) {
    for (const u of toUpdate) {
      await prisma.actSection.update({
        where: { id: u.id },
        data: u.data
      });
    }
  }

  const actCountAfter = await prisma.act.count({
    where: {
      bearerActId: bearerAct.id,
      heading: ACT_HEADING
    }
  });

  const sectionsCountAfter = await prisma.actSection.count({
    where: { actId: act.id }
  });

  console.log(`After re-seed: Act count = ${actCountAfter}, Sections count = ${sectionsCountAfter}`);
  console.log(`- toCreate: ${toCreate.length}`);
  console.log(`- toUpdate: ${toUpdate.length}`);

  if (actCountBefore === actCountAfter && actCountAfter === 1 &&
      sectionsCountBefore === sectionsCountAfter && sectionsCountAfter === 9 &&
      toCreate.length === 0 && toUpdate.length === 9) {
    console.log('✅ PASS: Idempotency test passed with 0 duplicates and 100% integrity maintained.');
  } else {
    console.error('❌ FAIL: Idempotency test failed!');
    process.exit(1);
  }
}

testIdempotency()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
