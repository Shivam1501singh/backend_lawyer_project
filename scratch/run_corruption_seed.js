import prisma from '../src/lib/prisma.js';
import { corruptionBearerActSections } from '../prisma/corruptionBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE PREVENTION OF CORRUPTION ACT, 1988 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let corruptionAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PREVENTION OF CORRUPTION ACT, 1988'
    }
  });

  if (!corruptionAct) {
    corruptionAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'PREVENTION OF CORRUPTION ACT',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!corruptionAct) {
    corruptionAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE PREVENTION OF CORRUPTION ACT, 1988',
        act: 'THE PREVENTION OF CORRUPTION ACT, 1988',
        year: 1988
      }
    });
    console.log('Created Act: THE PREVENTION OF CORRUPTION ACT, 1988 with ID:', corruptionAct.id);
  } else {
    corruptionAct = await prisma.act.update({
      where: { id: corruptionAct.id },
      data: {
        heading: 'THE PREVENTION OF CORRUPTION ACT, 1988',
        act: 'THE PREVENTION OF CORRUPTION ACT, 1988',
        year: 1988
      }
    });
    console.log('Synchronized Act: THE PREVENTION OF CORRUPTION ACT, 1988 with ID:', corruptionAct.id);
  }

  const existingCorruptionSections = await prisma.actSection.findMany({
    where: { actId: corruptionAct.id }
  });
  console.log(`Found ${existingCorruptionSections.length} existing Corruption Act sections in database.`);
  const corruptionSectionMap = new Map(existingCorruptionSections.map(s => [s.section, s]));

  let createdCorruptionSectionCount = 0;
  let updatedCorruptionSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of corruptionBearerActSections) {
    const existing = corruptionSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: corruptionAct.id,
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
    await prisma.actSection.createMany({
      data: toCreate
    });
    createdCorruptionSectionCount = toCreate.length;
  }

  if (toUpdate.length > 0) {
    const updateChunkSize = 25;
    for (let i = 0; i < toUpdate.length; i += updateChunkSize) {
      const chunk = toUpdate.slice(i, i + updateChunkSize);
      await Promise.all(
        chunk.map(u =>
          prisma.actSection.update({
            where: { id: u.id },
            data: u.data
          })
        )
      );
    }
    updatedCorruptionSectionCount = toUpdate.length;
  }

  console.log(`\nCorruption Act seeding summary:`);
  console.log(`- Created sections: ${createdCorruptionSectionCount}`);
  console.log(`- Updated sections: ${updatedCorruptionSectionCount}`);
  console.log(`- Total sections in JSON: ${corruptionBearerActSections.length}`);

  const totalInDb = await prisma.actSection.count({
    where: { actId: corruptionAct.id }
  });
  console.log(`- Verified Total sections in DB for THE PREVENTION OF CORRUPTION ACT, 1988: ${totalInDb}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
