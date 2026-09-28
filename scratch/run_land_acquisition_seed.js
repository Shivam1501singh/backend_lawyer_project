import prisma from '../src/lib/prisma.js';
import { landAcquisitionBearerActSections } from '../prisma/landAcquisitionBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE RIGHT TO FAIR COMPENSATION AND TRANSPARENCY IN LAND ACQUISITION, REHABILITATION AND RESETTLEMENT ACT, 2013 Seeding ---');

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

  const ACT_HEADING = 'THE RIGHT TO FAIR COMPENSATION AND TRANSPARENCY IN LAND ACQUISITION, REHABILITATION AND RESETTLEMENT ACT, 2013';

  let act = await prisma.act.findFirst({
    where: {
      bearerActId: civilAndPropertyBearerAct.id,
      heading: ACT_HEADING
    }
  });

  if (!act) {
    act = await prisma.act.findFirst({
      where: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: {
          contains: 'Land Acquisition',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!act) {
    act = await prisma.act.create({
      data: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 2013
      }
    });
    console.log('Created Act:', ACT_HEADING, 'with ID:', act.id);
  } else {
    act = await prisma.act.update({
      where: { id: act.id },
      data: {
        heading: ACT_HEADING,
        act: ACT_HEADING,
        year: 2013
      }
    });
    console.log('Found and updated Act:', ACT_HEADING, 'ID:', act.id);
  }

  // Fetch existing sections for this Act
  const existingSections = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  console.log(`Found ${existingSections.length} existing sections for this Act.`);

  const existingMap = new Map(existingSections.map(s => [s.section, s]));

  let toCreate = [];
  let toUpdate = [];

  for (const item of landAcquisitionBearerActSections) {
    const existing = existingMap.get(item.section);
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
    where: { actId: act.id }
  });

  console.log(`Final section count in DB: ${finalSectionsCount}`);
  console.log('--- Seeding Completed Successfully ---');
}

run()
  .catch(err => {
    console.error('Error seeding Land Acquisition Act:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
