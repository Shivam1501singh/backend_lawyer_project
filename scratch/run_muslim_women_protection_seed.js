import prisma from '../src/lib/prisma.js';
import { muslimWomenProtectionBearerActSections } from '../prisma/muslimWomenProtectionBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986 Seeding ---');

  let personalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Personal' }
  });
  
  if (!personalBearerAct) {
    console.log('Personal BearerAct not found by exact match, searching case-insensitively or creating...');
    personalBearerAct = await prisma.bearerAct.findFirst({
      where: {
        name: {
          contains: 'Personal',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!personalBearerAct) {
    personalBearerAct = await prisma.bearerAct.create({
      data: { name: 'Personal' }
    });
    console.log('Created BearerAct: Personal with ID:', personalBearerAct.id);
  } else {
    console.log('Found existing Personal BearerAct ID:', personalBearerAct.id);
  }

  const ACT_HEADING = 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986';

  let act = await prisma.act.findFirst({
    where: {
      bearerActId: personalBearerAct.id,
      heading: ACT_HEADING
    }
  });

  if (!act) {
    act = await prisma.act.findFirst({
      where: {
        bearerActId: personalBearerAct.id,
        heading: {
          contains: 'Muslim Women (Protection of Rights on Divorce)',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!act) {
    act = await prisma.act.create({
      data: {
        bearerActId: personalBearerAct.id,
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 1986
      }
    });
    console.log('Created Act:', act.heading, 'ID:', act.id);
  } else {
    act = await prisma.act.update({
      where: { id: act.id },
      data: {
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 1986
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

  for (const item of muslimWomenProtectionBearerActSections) {
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

  console.log(`--- Finished Seeding ---`);
  console.log(`Created: ${createdCount} sections`);
  console.log(`Updated: ${updatedCount} sections`);
  console.log(`Total sections in dataset: ${muslimWomenProtectionBearerActSections.length}`);

  const totalInDb = await prisma.actSection.count({
    where: { actId: act.id }
  });
  console.log(`Verified total sections in database for this Act: ${totalInDb}`);
}

run()
  .catch((e) => {
    console.error('Error during dedicated seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
