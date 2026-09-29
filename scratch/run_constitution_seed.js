import prisma from '../src/lib/prisma.js';
import { constitutionBearerActSections } from '../prisma/constitutionBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated CONSTITUTION OF INDIA Seeding ---');

  let constitutionalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Constitutional and Political' }
  });
  
  if (!constitutionalBearerAct) {
    console.log('Constitutional and Political BearerAct not found by exact match, searching case-insensitively...');
    constitutionalBearerAct = await prisma.bearerAct.findFirst({
      where: {
        name: {
          contains: 'Constitutional and Political',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!constitutionalBearerAct) {
    constitutionalBearerAct = await prisma.bearerAct.create({
      data: { name: 'Constitutional and Political' }
    });
    console.log('Created BearerAct: Constitutional and Political with ID:', constitutionalBearerAct.id);
  } else {
    console.log('Found existing Constitutional and Political BearerAct ID:', constitutionalBearerAct.id);
  }

  const ACT_HEADING = 'CONSTITUTION OF INDIA';

  // Check if any legacy Constitution of India Act exists under other BearerActs
  const legacyActs = await prisma.act.findMany({
    where: {
      heading: {
        contains: 'CONSTITUTION OF INDIA',
        mode: 'insensitive'
      },
      bearerActId: {
        not: constitutionalBearerAct.id
      }
    }
  });

  if (legacyActs.length > 0) {
    console.log(`Found ${legacyActs.length} legacy Constitution of India Act(s) under other BearerActs. Cleaning up...`);
    for (const legacyAct of legacyActs) {
      await prisma.act.delete({
        where: { id: legacyAct.id }
      });
      console.log(`Deleted legacy Act ID ${legacyAct.id} from BearerAct ID ${legacyAct.bearerActId}`);
    }
  }

  let act = await prisma.act.findFirst({
    where: {
      bearerActId: constitutionalBearerAct.id,
      heading: ACT_HEADING
    }
  });

  if (!act) {
    act = await prisma.act.findFirst({
      where: {
        bearerActId: constitutionalBearerAct.id,
        heading: {
          contains: 'CONSTITUTION OF INDIA',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!act) {
    act = await prisma.act.create({
      data: {
        bearerActId: constitutionalBearerAct.id,
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 1950
      }
    });
    console.log('Created Act:', act.heading, 'ID:', act.id);
  } else {
    act = await prisma.act.update({
      where: { id: act.id },
      data: {
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 1950
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

  for (const item of constitutionBearerActSections) {
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

  console.log(`Seeding complete for CONSTITUTION OF INDIA:`);
  console.log(`- Sections created: ${createdCount}`);
  console.log(`- Sections updated: ${updatedCount}`);
  console.log(`- Total sections in definition: ${constitutionBearerActSections.length}`);

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
