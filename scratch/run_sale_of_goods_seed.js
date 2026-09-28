import prisma from '../src/lib/prisma.js';
import { saleOfGoodsBearerActSections } from '../prisma/saleOfGoodsBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE SALE OF GOODS ACT, 1930 Seeding ---');

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

  let sogAct = await prisma.act.findFirst({
    where: {
      bearerActId: civilAndPropertyBearerAct.id,
      heading: 'THE SALE OF GOODS ACT, 1930'
    }
  });

  if (!sogAct) {
    sogAct = await prisma.act.findFirst({
      where: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: {
          contains: 'Sale of Goods',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!sogAct) {
    sogAct = await prisma.act.create({
      data: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: 'THE SALE OF GOODS ACT, 1930',
        act: 'THE SALE OF GOODS ACT, 1930',
        year: 1930
      }
    });
    console.log('Created Act: THE SALE OF GOODS ACT, 1930 with ID:', sogAct.id);
  } else {
    sogAct = await prisma.act.update({
      where: { id: sogAct.id },
      data: {
        heading: 'THE SALE OF GOODS ACT, 1930',
        act: 'THE SALE OF GOODS ACT, 1930',
        year: 1930
      }
    });
    console.log('Found and updated Act: THE SALE OF GOODS ACT, 1930 ID:', sogAct.id);
  }

  // Fetch existing sections for this Act
  const existingSections = await prisma.actSection.findMany({
    where: { actId: sogAct.id }
  });
  console.log(`Found ${existingSections.length} existing sections for THE SALE OF GOODS ACT, 1930.`);

  const existingMap = new Map(existingSections.map(s => [s.section, s]));

  let toCreate = [];
  let toUpdate = [];

  for (const item of saleOfGoodsBearerActSections) {
    const existing = existingMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

    if (!existing) {
      toCreate.push({
        actId: sogAct.id,
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

  console.log(`To create: ${toCreate.length} sections, To update: ${toUpdate.length} sections.`);

  if (toCreate.length > 0) {
    const insertChunkSize = 50;
    for (let i = 0; i < toCreate.length; i += insertChunkSize) {
      const chunk = toCreate.slice(i, i + insertChunkSize);
      await prisma.actSection.createMany({
        data: chunk
      });
    }
    console.log(`Created ${toCreate.length} sections.`);
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
    console.log(`Updated ${toUpdate.length} sections.`);
  }

  const finalSectionsCount = await prisma.actSection.count({
    where: { actId: sogAct.id }
  });

  console.log(`Final section count in DB for THE SALE OF GOODS ACT, 1930: ${finalSectionsCount}`);
  console.log('--- Seeding Completed Successfully ---');
}

run()
  .catch(err => {
    console.error('Error seeding Sale of Goods Act:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
