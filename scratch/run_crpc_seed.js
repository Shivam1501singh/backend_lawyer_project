import prisma from '../src/lib/prisma.js';
import { crpcBearerActSections } from '../prisma/crpcBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE CODE OF CRIMINAL PROCEDURE, 1973 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let crpcAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE CODE OF CRIMINAL PROCEDURE, 1973'
    }
  });

  if (!crpcAct) {
    crpcAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'CODE OF CRIMINAL PROCEDURE, 1973',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!crpcAct) {
    crpcAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE CODE OF CRIMINAL PROCEDURE, 1973',
        act: 'THE CODE OF CRIMINAL PROCEDURE, 1973',
        year: 1973
      }
    });
    console.log('Created Act: THE CODE OF CRIMINAL PROCEDURE, 1973 with ID:', crpcAct.id);
  } else {
    crpcAct = await prisma.act.update({
      where: { id: crpcAct.id },
      data: {
        heading: 'THE CODE OF CRIMINAL PROCEDURE, 1973',
        act: 'THE CODE OF CRIMINAL PROCEDURE, 1973',
        year: 1973
      }
    });
    console.log('Synchronized Act: THE CODE OF CRIMINAL PROCEDURE, 1973 with ID:', crpcAct.id);
  }

  const existingSections = await prisma.actSection.findMany({
    where: { actId: crpcAct.id }
  });
  console.log(`Found ${existingSections.length} existing CrPC sections in database.`);
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  let createdCount = 0;
  let updatedCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of crpcBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: crpcAct.id,
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
    const insertChunkSize = 50;
    for (let i = 0; i < toCreate.length; i += insertChunkSize) {
      const chunk = toCreate.slice(i, i + insertChunkSize);
      await prisma.actSection.createMany({
        data: chunk
      });
    }
    createdCount = toCreate.length;
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
    updatedCount = toUpdate.length;
  }

  console.log(`Seeding summary for CrPC: ${createdCount} created, ${updatedCount} updated across 39 chapters (Total: ${crpcBearerActSections.length}).`);

  // Verification
  const totalCount = await prisma.actSection.count({
    where: { actId: crpcAct.id }
  });
  console.log(`Final verified section count for CrPC in DB: ${totalCount}`);
}

run()
  .catch((e) => {
    console.error('Error in CrPC seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
