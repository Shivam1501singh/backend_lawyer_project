import prisma from '../src/lib/prisma.js';
import { itBearerActSections } from '../prisma/itBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE INFORMATION TECHNOLOGY ACT, 2000 Seeding ---');

  let techDataBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Tech, Data & Cyber Laws' }
  });
  
  if (!techDataBearerAct) {
    console.log('Tech, Data & Cyber Laws BearerAct not found by exact match, searching case-insensitively or creating...');
    techDataBearerAct = await prisma.bearerAct.findFirst({
      where: {
        name: {
          contains: 'Tech',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!techDataBearerAct) {
    techDataBearerAct = await prisma.bearerAct.create({
      data: { name: 'Tech, Data & Cyber Laws' }
    });
    console.log('Created BearerAct: Tech, Data & Cyber Laws with ID:', techDataBearerAct.id);
  } else {
    console.log('Found existing Tech, Data & Cyber Laws BearerAct ID:', techDataBearerAct.id);
  }

  let itAct = await prisma.act.findFirst({
    where: {
      bearerActId: techDataBearerAct.id,
      heading: 'THE INFORMATION TECHNOLOGY ACT, 2000'
    }
  });

  if (!itAct) {
    itAct = await prisma.act.findFirst({
      where: {
        bearerActId: techDataBearerAct.id,
        heading: {
          contains: 'INFORMATION TECHNOLOGY',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!itAct) {
    itAct = await prisma.act.create({
      data: {
        bearerActId: techDataBearerAct.id,
        heading: 'THE INFORMATION TECHNOLOGY ACT, 2000',
        act: 'THE INFORMATION TECHNOLOGY ACT, 2000',
        year: 2000
      }
    });
    console.log('Created Act: THE INFORMATION TECHNOLOGY ACT, 2000 with ID:', itAct.id);
  } else {
    itAct = await prisma.act.update({
      where: { id: itAct.id },
      data: {
        heading: 'THE INFORMATION TECHNOLOGY ACT, 2000',
        act: 'THE INFORMATION TECHNOLOGY ACT, 2000',
        year: 2000
      }
    });
    console.log('Synchronized Act: THE INFORMATION TECHNOLOGY ACT, 2000 with ID:', itAct.id);
  }

  const existingItSections = await prisma.actSection.findMany({
    where: { actId: itAct.id }
  });
  console.log(`Found ${existingItSections.length} existing IT Act sections in database.`);
  const itSectionMap = new Map(existingItSections.map(s => [s.section, s]));

  let createdItSectionCount = 0;
  let updatedItSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of itBearerActSections) {
    const existing = itSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: itAct.id,
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
    createdItSectionCount = toCreate.length;
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
    updatedItSectionCount = toUpdate.length;
  }

  console.log(`THE INFORMATION TECHNOLOGY ACT, 2000 Sections seeded successfully: ${createdItSectionCount} created, ${updatedItSectionCount} updated across 14 chapters (Total: ${itBearerActSections.length}).`);
  console.log('--- Completed Dedicated IT Act Seeding ---');
}

run()
  .catch((e) => {
    console.error('Error during dedicated IT Act seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
