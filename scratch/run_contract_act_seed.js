import prisma from '../src/lib/prisma.js';
import { contractBearerActSections } from '../prisma/contractBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE INDIAN CONTRACT ACT, 1872 Seeding ---');

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

  let contractAct = await prisma.act.findFirst({
    where: {
      bearerActId: civilAndPropertyBearerAct.id,
      heading: 'THE INDIAN CONTRACT ACT, 1872'
    }
  });

  if (!contractAct) {
    contractAct = await prisma.act.findFirst({
      where: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: {
          contains: 'Indian Contract Act',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!contractAct) {
    contractAct = await prisma.act.create({
      data: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: 'THE INDIAN CONTRACT ACT, 1872',
        act: 'THE INDIAN CONTRACT ACT, 1872',
        year: 1872
      }
    });
    console.log('Created Act: THE INDIAN CONTRACT ACT, 1872 with ID:', contractAct.id);
  } else {
    contractAct = await prisma.act.update({
      where: { id: contractAct.id },
      data: {
        heading: 'THE INDIAN CONTRACT ACT, 1872',
        act: 'THE INDIAN CONTRACT ACT, 1872',
        year: 1872
      }
    });
    console.log('Synchronized Act: THE INDIAN CONTRACT ACT, 1872 with ID:', contractAct.id);
  }

  const existingContractSections = await prisma.actSection.findMany({
    where: { actId: contractAct.id }
  });
  console.log(`Found ${existingContractSections.length} existing Contract Act sections in database.`);
  const contractSectionMap = new Map(existingContractSections.map(s => [s.section, s]));

  let createdSectionCount = 0;
  let updatedSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of contractBearerActSections) {
    const existing = contractSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: contractAct.id,
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

  console.log(`THE INDIAN CONTRACT ACT, 1872 Bearer Act Sections seeded: ${createdSectionCount} created, ${updatedSectionCount} updated across 12 chapters (Total: ${contractBearerActSections.length}).`);

  // Verification queries
  const finalCount = await prisma.actSection.count({
    where: { actId: contractAct.id }
  });
  console.log(`Final section count in DB for Contract Act: ${finalCount}`);

  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
