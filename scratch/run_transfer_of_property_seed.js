import prisma from '../src/lib/prisma.js';
import { transferOfPropertyBearerActSections } from '../prisma/transferOfPropertyBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE TRANSFER OF PROPERTY ACT, 1882 Seeding ---');

  let civilAndPropertyBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Civil and Property' }
  });
  
  if (!civilAndPropertyBearerAct) {
    console.log('Civil and Property BearerAct not found by exact match, searching case-insensitively or creating...');
    civilAndPropertyBearerAct = await prisma.bearerAct.findFirst({
      where: {
        name: {
          contains: 'Civil and Property',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!civilAndPropertyBearerAct) {
    civilAndPropertyBearerAct = await prisma.bearerAct.create({
      data: { name: 'Civil and Property' }
    });
    console.log('Created BearerAct: Civil and Property with ID:', civilAndPropertyBearerAct.id);
  } else {
    console.log('Found existing Civil and Property BearerAct ID:', civilAndPropertyBearerAct.id);
  }

  let tpaAct = await prisma.act.findFirst({
    where: {
      bearerActId: civilAndPropertyBearerAct.id,
      heading: 'THE TRANSFER OF PROPERTY ACT, 1882'
    }
  });

  if (!tpaAct) {
    tpaAct = await prisma.act.findFirst({
      where: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: {
          contains: 'Transfer of Property',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!tpaAct) {
    tpaAct = await prisma.act.create({
      data: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: 'THE TRANSFER OF PROPERTY ACT, 1882',
        act: 'THE TRANSFER OF PROPERTY ACT, 1882',
        year: 1882
      }
    });
    console.log('Created Act: THE TRANSFER OF PROPERTY ACT, 1882 with ID:', tpaAct.id);
  } else {
    tpaAct = await prisma.act.update({
      where: { id: tpaAct.id },
      data: {
        heading: 'THE TRANSFER OF PROPERTY ACT, 1882',
        act: 'THE TRANSFER OF PROPERTY ACT, 1882',
        year: 1882
      }
    });
    console.log('Synchronized Act: THE TRANSFER OF PROPERTY ACT, 1882 with ID:', tpaAct.id);
  }

  const existingTpaSections = await prisma.actSection.findMany({
    where: { actId: tpaAct.id }
  });
  console.log(`Found ${existingTpaSections.length} existing TPA sections in database.`);
  const tpaSectionMap = new Map(existingTpaSections.map(s => [s.section, s]));

  let createdTpaSectionCount = 0;
  let updatedTpaSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of transferOfPropertyBearerActSections) {
    const existing = tpaSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: tpaAct.id,
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
    createdTpaSectionCount = toCreate.length;
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
    updatedTpaSectionCount = toUpdate.length;
  }

  console.log(`THE TRANSFER OF PROPERTY ACT, 1882 Bearer Act Sections seeded: ${createdTpaSectionCount} created, ${updatedTpaSectionCount} updated across 8 chapters (Total: ${transferOfPropertyBearerActSections.length}).`);

  // Verification queries
  const finalCount = await prisma.actSection.count({
    where: { actId: tpaAct.id }
  });
  console.log(`Final section count in DB for TPA: ${finalCount}`);

  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
