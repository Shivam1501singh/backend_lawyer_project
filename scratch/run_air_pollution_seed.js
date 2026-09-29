import prisma from '../src/lib/prisma.js';
import { airPollutionBearerActSections } from '../prisma/airPollutionBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981 Seeding ---');

  const category = await prisma.bearerAct.findUnique({
    where: { name: 'Environment and Land' }
  });
  if (!category) {
    throw new Error('Environment and Land BearerAct not found in database!');
  }
  console.log('Found Environment and Land BearerAct ID:', category.id);

  let act = await prisma.act.findFirst({
    where: {
      bearerActId: category.id,
      heading: 'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981'
    }
  });

  if (!act) {
    act = await prisma.act.findFirst({
      where: {
        bearerActId: category.id,
        heading: {
          contains: 'AIR (PREVENTION AND CONTROL OF POLLUTION) ACT',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!act) {
    act = await prisma.act.create({
      data: {
        bearerActId: category.id,
        heading: 'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981',
        act: 'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981',
        year: 1981
      }
    });
    console.log('Created Act: THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981 with ID:', act.id);
  } else {
    act = await prisma.act.update({
      where: { id: act.id },
      data: {
        heading: 'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981',
        act: 'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981',
        year: 1981
      }
    });
    console.log('Synchronized Act: THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981 with ID:', act.id);
  }

  const existingSections = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  console.log(`Found ${existingSections.length} existing sections in database.`);
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  let createdCount = 0;
  let updatedCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of airPollutionBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    const chapterNoInt = typeof item.chapterNo === 'number' ? Math.trunc(item.chapterNo) : parseInt(item.chapterNo, 10);

    if (!existing) {
      toCreate.push({
        actId: act.id,
        section: item.section,
        sectionOrder: sectionOrder,
        chapterNo: chapterNoInt,
        chapterName: item.chapterName,
        title: item.title,
        description: item.description,
        metaData: item.metaData || null,
        metaDescription: item.metaDescription || null,
        metaTitle: item.metaTitle || null
      });
    } else {
      toUpdate.push({
        id: existing.id,
        data: {
          sectionOrder: sectionOrder,
          chapterNo: chapterNoInt,
          chapterName: item.chapterName,
          title: item.title,
          description: item.description,
          metaData: item.metaData || null,
          metaDescription: item.metaDescription || null,
          metaTitle: item.metaTitle || null
        }
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.actSection.createMany({
      data: toCreate
    });
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

  console.log(`--- Seeding Finished Successfully ---`);
  console.log(`Total sections in dataset: ${airPollutionBearerActSections.length}`);
  console.log(`Created: ${createdCount}, Updated: ${updatedCount}`);

  const finalSectionsCount = await prisma.actSection.count({
    where: { actId: act.id }
  });
  console.log(`Total sections now in DB for THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981: ${finalSectionsCount}`);
}

run()
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
