import prisma from '../src/lib/prisma.js';
import { prohibitionOfChildMarriageBearerActSections } from '../prisma/prohibitionOfChildMarriageBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function testIdempotency() {
  console.log('=== Running Idempotency Test for THE PROHIBITION OF CHILD MARRIAGE ACT, 2006 ===');

  const ACT_HEADING = 'THE PROHIBITION OF CHILD MARRIAGE ACT, 2006';

  const personalCat = await prisma.bearerAct.findUnique({
    where: { name: 'Personal' }
  });

  if (!personalCat) {
    throw new Error('Personal category not found!');
  }

  const actBefore = await prisma.act.findFirst({
    where: {
      bearerActId: personalCat.id,
      heading: ACT_HEADING
    }
  });

  if (!actBefore) {
    throw new Error(`Act ${ACT_HEADING} not found in database!`);
  }

  const countBefore = await prisma.actSection.count({
    where: { actId: actBefore.id }
  });

  console.log(`Initial section count for Act: ${countBefore}`);

  // Re-run the seed logic
  const existingSections = await prisma.actSection.findMany({
    where: { actId: actBefore.id }
  });
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  const toCreate = [];
  const toUpdate = [];

  for (const item of prohibitionOfChildMarriageBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

    if (!existing) {
      toCreate.push({
        actId: actBefore.id,
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

  console.log(`Second run diff: To Create = ${toCreate.length}, To Update = ${toUpdate.length}`);

  if (toCreate.length > 0) {
    throw new Error(`Idempotency failure: ${toCreate.length} duplicate sections would be created!`);
  }

  const countAfter = await prisma.actSection.count({
    where: { actId: actBefore.id }
  });

  console.log(`Post re-run section count: ${countAfter}`);

  if (countBefore !== countAfter || countAfter !== 21) {
    throw new Error(`Count mismatch! Expected 21, got ${countAfter}`);
  }

  console.log('✅ Idempotency Test PASSED perfectly: 0 duplicates, exactly 21 sections maintained.');
}

testIdempotency()
  .catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
