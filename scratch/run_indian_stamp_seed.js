import prisma from '../src/lib/prisma.js';
import { indianStampBearerActSections } from '../prisma/indianStampBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE INDIAN STAMP ACT, 1899 Seeding ---');

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

  let stampAct = await prisma.act.findFirst({
    where: {
      bearerActId: civilAndPropertyBearerAct.id,
      heading: 'THE INDIAN STAMP ACT, 1899'
    }
  });

  if (!stampAct) {
    stampAct = await prisma.act.findFirst({
      where: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: {
          contains: 'Stamp',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!stampAct) {
    stampAct = await prisma.act.create({
      data: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: 'THE INDIAN STAMP ACT, 1899',
        act: 'THE INDIAN STAMP ACT, 1899',
        year: 1899
      }
    });
    console.log('Created Act: THE INDIAN STAMP ACT, 1899 with ID:', stampAct.id);
  } else {
    stampAct = await prisma.act.update({
      where: { id: stampAct.id },
      data: {
        heading: 'THE INDIAN STAMP ACT, 1899',
        act: 'THE INDIAN STAMP ACT, 1899',
        year: 1899
      }
    });
    console.log('Found and updated Act: THE INDIAN STAMP ACT, 1899 ID:', stampAct.id);
  }

  // Fetch existing sections for this Act
  const existingSections = await prisma.actSection.findMany({
    where: { actId: stampAct.id }
  });
  console.log(`Found ${existingSections.length} existing sections for THE INDIAN STAMP ACT, 1899.`);

  const existingMap = new Map(existingSections.map(s => [s.section, s]));

  let toCreate = [];
  let toUpdate = [];

  for (const item of indianStampBearerActSections) {
    const existing = existingMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

    if (!existing) {
      toCreate.push({
        actId: stampAct.id,
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
    where: { actId: stampAct.id }
  });

  console.log(`Final section count in DB for THE INDIAN STAMP ACT, 1899: ${finalSectionsCount}`);
  console.log('--- Seeding Completed Successfully ---');
}

run()
  .catch(err => {
    console.error('Error seeding Indian Stamp Act:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
