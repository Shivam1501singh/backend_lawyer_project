import prisma from '../src/lib/prisma.js';
import { dowryBearerActSections } from '../prisma/dowryBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE DOWRY PROHIBITION ACT, 1961 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let dowryAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE DOWRY PROHIBITION ACT, 1961'
    }
  });

  if (!dowryAct) {
    dowryAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'DOWRY PROHIBITION',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!dowryAct) {
    dowryAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE DOWRY PROHIBITION ACT, 1961',
        act: 'THE DOWRY PROHIBITION ACT, 1961',
        year: 1961
      }
    });
    console.log('Created Act: THE DOWRY PROHIBITION ACT, 1961 with ID:', dowryAct.id);
  } else {
    dowryAct = await prisma.act.update({
      where: { id: dowryAct.id },
      data: {
        heading: 'THE DOWRY PROHIBITION ACT, 1961',
        act: 'THE DOWRY PROHIBITION ACT, 1961',
        year: 1961
      }
    });
    console.log('Synchronized Act: THE DOWRY PROHIBITION ACT, 1961 with ID:', dowryAct.id);
  }

  const existingDowrySections = await prisma.actSection.findMany({
    where: { actId: dowryAct.id }
  });
  console.log(`Found ${existingDowrySections.length} existing Dowry Prohibition sections in database.`);
  const dowrySectionMap = new Map(existingDowrySections.map(s => [s.section, s]));

  let createdDowrySectionCount = 0;
  let updatedDowrySectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of dowryBearerActSections) {
    const existing = dowrySectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: dowryAct.id,
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
    createdDowrySectionCount = toCreate.length;
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
    updatedDowrySectionCount = toUpdate.length;
  }

  console.log(`THE DOWRY PROHIBITION ACT, 1961 Sections: ${createdDowrySectionCount} created, ${updatedDowrySectionCount} updated (Total: ${dowryBearerActSections.length}).`);
}

run()
  .catch(e => {
    console.error('Error during dedicated seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
