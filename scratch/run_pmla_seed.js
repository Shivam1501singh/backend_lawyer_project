import prisma from '../src/lib/prisma.js';
import { pmlaBearerActSections } from '../prisma/pmlaBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let pmlaAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002'
    }
  });

  if (!pmlaAct) {
    pmlaAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'MONEY-LAUNDERING',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!pmlaAct) {
    pmlaAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
        act: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
        year: 2002
      }
    });
    console.log('Created Act: THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 with ID:', pmlaAct.id);
  } else {
    pmlaAct = await prisma.act.update({
      where: { id: pmlaAct.id },
      data: {
        heading: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
        act: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
        year: 2002
      }
    });
    console.log('Synchronized Act: THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 with ID:', pmlaAct.id);
  }

  const existingPmlaSections = await prisma.actSection.findMany({
    where: { actId: pmlaAct.id }
  });
  console.log(`Found ${existingPmlaSections.length} existing PMLA sections in database.`);
  const pmlaSectionMap = new Map(existingPmlaSections.map(s => [s.section, s]));

  let createdPmlaSectionCount = 0;
  let updatedPmlaSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of pmlaBearerActSections) {
    const existing = pmlaSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: pmlaAct.id,
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
    createdPmlaSectionCount = toCreate.length;
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
    updatedPmlaSectionCount = toUpdate.length;
  }

  console.log(`--- Seeding Finished Successfully ---`);
  console.log(`Total sections in dataset: ${pmlaBearerActSections.length}`);
  console.log(`Created: ${createdPmlaSectionCount}, Updated: ${updatedPmlaSectionCount}`);

  // Verification queries
  const finalSectionsCount = await prisma.actSection.count({
    where: { actId: pmlaAct.id }
  });
  console.log(`Total sections now in DB for THE PREVENTION OF MONEY-LAUNDERING ACT, 2002: ${finalSectionsCount}`);
}

run()
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
