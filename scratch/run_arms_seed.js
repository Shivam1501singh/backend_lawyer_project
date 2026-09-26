import prisma from '../src/lib/prisma.js';
import { armsBearerActSections } from '../prisma/armsBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE ARMS ACT, 1959 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let armsAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE ARMS ACT, 1959'
    }
  });

  if (!armsAct) {
    armsAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'ARMS ACT',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!armsAct) {
    armsAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE ARMS ACT, 1959',
        act: 'THE ARMS ACT, 1959',
        year: 1959
      }
    });
    console.log('Created Act: THE ARMS ACT, 1959 with ID:', armsAct.id);
  } else {
    armsAct = await prisma.act.update({
      where: { id: armsAct.id },
      data: {
        heading: 'THE ARMS ACT, 1959',
        act: 'THE ARMS ACT, 1959',
        year: 1959
      }
    });
    console.log('Synchronized Act: THE ARMS ACT, 1959 with ID:', armsAct.id);
  }

  const existingArmsSections = await prisma.actSection.findMany({
    where: { actId: armsAct.id }
  });
  console.log(`Found ${existingArmsSections.length} existing Arms Act sections in database.`);
  const armsSectionMap = new Map(existingArmsSections.map(s => [s.section, s]));

  let createdArmsSectionCount = 0;
  let updatedArmsSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of armsBearerActSections) {
    const existing = armsSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: armsAct.id,
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
    createdArmsSectionCount = toCreate.length;
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
    updatedArmsSectionCount = toUpdate.length;
  }

  console.log(`\nArms Act seeding summary:`);
  console.log(`- Created sections: ${createdArmsSectionCount}`);
  console.log(`- Updated sections: ${updatedArmsSectionCount}`);
  console.log(`- Total sections in JSON: ${armsBearerActSections.length}`);

  const totalInDb = await prisma.actSection.count({
    where: { actId: armsAct.id }
  });
  console.log(`- Verified Total sections in DB for THE ARMS ACT, 1959: ${totalInDb}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
