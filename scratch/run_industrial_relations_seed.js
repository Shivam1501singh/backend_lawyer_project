import prisma from '../src/lib/prisma.js';
import { industrialRelationsBearerActSections } from '../prisma/industrialRelationsBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE INDUSTRIAL RELATIONS CODE, 2020 Seeding ---');

  let taxationLabourBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Taxation, Labour & Consumer Protection' }
  });
  
  if (!taxationLabourBearerAct) {
    console.log('Taxation, Labour & Consumer Protection BearerAct not found by exact match, searching case-insensitively...');
    taxationLabourBearerAct = await prisma.bearerAct.findFirst({
      where: {
        name: {
          contains: 'Taxation, Labour & Consumer Protection',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!taxationLabourBearerAct) {
    taxationLabourBearerAct = await prisma.bearerAct.create({
      data: { name: 'Taxation, Labour & Consumer Protection' }
    });
    console.log('Created BearerAct: Taxation, Labour & Consumer Protection with ID:', taxationLabourBearerAct.id);
  } else {
    console.log('Found existing Taxation, Labour & Consumer Protection BearerAct ID:', taxationLabourBearerAct.id);
  }

  const ACT_HEADING = 'THE INDUSTRIAL RELATIONS CODE, 2020';

  // Check if any legacy Industrial Relations Code exists under other BearerActs
  const legacyActs = await prisma.act.findMany({
    where: {
      heading: {
        contains: 'INDUSTRIAL RELATIONS CODE',
        mode: 'insensitive'
      },
      bearerActId: {
        not: taxationLabourBearerAct.id
      }
    }
  });

  if (legacyActs.length > 0) {
    console.log(`Found ${legacyActs.length} legacy Industrial Relations Act(s) under other BearerActs. Cleaning up...`);
    for (const legacyAct of legacyActs) {
      await prisma.act.delete({
        where: { id: legacyAct.id }
      });
      console.log(`Deleted legacy Act ID ${legacyAct.id} from BearerAct ID ${legacyAct.bearerActId}`);
    }
  }

  let act = await prisma.act.findFirst({
    where: {
      bearerActId: taxationLabourBearerAct.id,
      heading: ACT_HEADING
    }
  });

  if (!act) {
    act = await prisma.act.findFirst({
      where: {
        bearerActId: taxationLabourBearerAct.id,
        heading: {
          contains: 'INDUSTRIAL RELATIONS CODE',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!act) {
    act = await prisma.act.create({
      data: {
        bearerActId: taxationLabourBearerAct.id,
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 2020
      }
    });
    console.log('Created Act:', act.heading, 'ID:', act.id);
  } else {
    act = await prisma.act.update({
      where: { id: act.id },
      data: {
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 2020
      }
    });
    console.log('Synchronized Act:', act.heading, 'ID:', act.id);
  }

  const existingSections = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  console.log(`Found ${existingSections.length} existing sections in database for this Act.`);

  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  const toCreate = [];
  const toUpdate = [];

  for (const item of industrialRelationsBearerActSections) {
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

  let createdCount = 0;
  let updatedCount = 0;

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

  console.log(`Seeding complete for THE INDUSTRIAL RELATIONS CODE, 2020:`);
  console.log(`- Sections created: ${createdCount}`);
  console.log(`- Sections updated: ${updatedCount}`);
  console.log(`- Total sections in definition: ${industrialRelationsBearerActSections.length}`);

  const totalInDb = await prisma.actSection.count({
    where: { actId: act.id }
  });
  console.log(`- Total sections in database for Act: ${totalInDb}`);
}

run()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
