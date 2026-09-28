import prisma from '../src/lib/prisma.js';
import { registrationBearerActSections } from '../prisma/registrationBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE REGISTRATION ACT, 1908 Seeding ---');

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

  let registrationAct = await prisma.act.findFirst({
    where: {
      bearerActId: civilAndPropertyBearerAct.id,
      heading: 'THE REGISTRATION ACT, 1908'
    }
  });

  if (!registrationAct) {
    registrationAct = await prisma.act.findFirst({
      where: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: {
          contains: 'Registration',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!registrationAct) {
    registrationAct = await prisma.act.create({
      data: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: 'THE REGISTRATION ACT, 1908',
        act: 'THE REGISTRATION ACT, 1908',
        year: 1908
      }
    });
    console.log('Created Act: THE REGISTRATION ACT, 1908 with ID:', registrationAct.id);
  } else {
    registrationAct = await prisma.act.update({
      where: { id: registrationAct.id },
      data: {
        heading: 'THE REGISTRATION ACT, 1908',
        act: 'THE REGISTRATION ACT, 1908',
        year: 1908
      }
    });
    console.log('Found and updated Act: THE REGISTRATION ACT, 1908 ID:', registrationAct.id);
  }

  // Fetch existing sections for this Act
  const existingSections = await prisma.actSection.findMany({
    where: { actId: registrationAct.id }
  });
  console.log(`Found ${existingSections.length} existing sections for THE REGISTRATION ACT, 1908.`);

  const existingMap = new Map(existingSections.map(s => [s.section, s]));

  let toCreate = [];
  let toUpdate = [];

  for (const item of registrationBearerActSections) {
    const existing = existingMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

    if (!existing) {
      toCreate.push({
        actId: registrationAct.id,
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
    where: { actId: registrationAct.id }
  });

  console.log(`Final section count in DB for THE REGISTRATION ACT, 1908: ${finalSectionsCount}`);
  console.log('--- Seeding Completed Successfully ---');
}

run()
  .catch(err => {
    console.error('Error seeding Registration Act:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
