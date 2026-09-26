import prisma from '../src/lib/prisma.js';
import { negotiableBearerActSections } from '../prisma/negotiableBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE NEGOTIABLE INSTRUMENTS ACT, 1881 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let negotiableAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE NEGOTIABLE INSTRUMENTS ACT, 1881'
    }
  });

  if (!negotiableAct) {
    negotiableAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'NEGOTIABLE INSTRUMENTS',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!negotiableAct) {
    negotiableAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE NEGOTIABLE INSTRUMENTS ACT, 1881',
        act: 'THE NEGOTIABLE INSTRUMENTS ACT, 1881',
        year: 1881
      }
    });
    console.log('Created Act: THE NEGOTIABLE INSTRUMENTS ACT, 1881 with ID:', negotiableAct.id);
  } else {
    negotiableAct = await prisma.act.update({
      where: { id: negotiableAct.id },
      data: {
        heading: 'THE NEGOTIABLE INSTRUMENTS ACT, 1881',
        act: 'THE NEGOTIABLE INSTRUMENTS ACT, 1881',
        year: 1881
      }
    });
    console.log('Synchronized Act: THE NEGOTIABLE INSTRUMENTS ACT, 1881 with ID:', negotiableAct.id);
  }

  const existingSections = await prisma.actSection.findMany({
    where: { actId: negotiableAct.id }
  });
  console.log(`Found ${existingSections.length} existing Negotiable Instruments Act sections in database.`);
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  let createdSectionCount = 0;
  let updatedSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of negotiableBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: negotiableAct.id,
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
    createdSectionCount = toCreate.length;
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
    updatedSectionCount = toUpdate.length;
  }

  console.log(`\nNegotiable Instruments Act seeding summary:`);
  console.log(`- Created sections: ${createdSectionCount}`);
  console.log(`- Updated sections: ${updatedSectionCount}`);
  console.log(`- Total sections in JSON: ${negotiableBearerActSections.length}`);

  const totalInDb = await prisma.actSection.count({
    where: { actId: negotiableAct.id }
  });
  console.log(`- Verified Total sections in DB for THE NEGOTIABLE INSTRUMENTS ACT, 1881: ${totalInDb}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
