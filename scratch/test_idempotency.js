import { PrismaClient } from '@prisma/client';
import { armsAmendmentBearerActSections } from '../prisma/armsAmendmentBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

const prisma = new PrismaClient();

async function testIdempotency() {
  console.log('Testing Idempotency for THE ARMS (AMENDMENT) ACT, 2019...');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });

  const actsBefore = await prisma.act.findMany({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE ARMS (AMENDMENT) ACT, 2019'
    }
  });

  if (actsBefore.length !== 1) {
    throw new Error(`Expected exactly 1 Act record, found ${actsBefore.length}`);
  }

  const act = actsBefore[0];
  const sectionsBefore = await prisma.actSection.findMany({
    where: { actId: act.id }
  });

  console.log(`Before re-seed: ${actsBefore.length} Act, ${sectionsBefore.length} Sections.`);

  // Simulate idempotent seed
  const existingArmsAmendmentSections = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  const armsAmendmentSectionMap = new Map(existingArmsAmendmentSections.map(s => [s.section, s]));

  let createdCount = 0;
  let updatedCount = 0;
  const armsAmendmentToCreate = [];
  const armsAmendmentToUpdate = [];

  for (const item of armsAmendmentBearerActSections) {
    const existing = armsAmendmentSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      armsAmendmentToCreate.push({
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
      armsAmendmentToUpdate.push({
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

  if (armsAmendmentToCreate.length > 0) {
    await prisma.actSection.createMany({
      data: armsAmendmentToCreate
    });
    createdCount = armsAmendmentToCreate.length;
  }

  if (armsAmendmentToUpdate.length > 0) {
    const updateChunkSize = 25;
    for (let i = 0; i < armsAmendmentToUpdate.length; i += updateChunkSize) {
      const chunk = armsAmendmentToUpdate.slice(i, i + updateChunkSize);
      await Promise.all(
        chunk.map(u =>
          prisma.actSection.update({
            where: { id: u.id },
            data: u.data
          })
        )
      );
    }
    updatedCount = armsAmendmentToUpdate.length;
  }

  console.log(`Re-seed result: ${createdCount} created, ${updatedCount} updated.`);

  const actsAfter = await prisma.act.findMany({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE ARMS (AMENDMENT) ACT, 2019'
    }
  });

  const sectionsAfter = await prisma.actSection.findMany({
    where: { actId: act.id }
  });

  if (actsAfter.length !== 1 || sectionsAfter.length !== 11) {
    throw new Error(`Idempotency failure! Acts: ${actsAfter.length}, Sections: ${sectionsAfter.length}`);
  }

  if (createdCount !== 0 || updatedCount !== 11) {
    throw new Error(`Expected 0 created and 11 updated, got ${createdCount} created, ${updatedCount} updated`);
  }

  console.log('[PASS] Full Idempotency Verified: 0 duplicates created, exactly 11 sections updated.');
  await prisma.$disconnect();
}

testIdempotency().catch((e) => {
  console.error('Idempotency test failed:', e);
  process.exit(1);
});
