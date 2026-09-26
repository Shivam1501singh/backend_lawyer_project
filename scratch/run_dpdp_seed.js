import prisma from '../src/lib/prisma.js';
import { dpdpBearerActSections } from '../prisma/dpdpBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 Seeding ---');

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

  let dpdpAct = await prisma.act.findFirst({
    where: {
      bearerActId: techDataBearerAct.id,
      heading: 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023'
    }
  });

  if (!dpdpAct) {
    dpdpAct = await prisma.act.findFirst({
      where: {
        bearerActId: techDataBearerAct.id,
        heading: {
          contains: 'DIGITAL PERSONAL DATA PROTECTION',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!dpdpAct) {
    dpdpAct = await prisma.act.create({
      data: {
        bearerActId: techDataBearerAct.id,
        heading: 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023',
        act: 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023',
        year: 2023
      }
    });
    console.log('Created Act: THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 with ID:', dpdpAct.id);
  } else {
    dpdpAct = await prisma.act.update({
      where: { id: dpdpAct.id },
      data: {
        heading: 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023',
        act: 'THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023',
        year: 2023
      }
    });
    console.log('Synchronized Act: THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 with ID:', dpdpAct.id);
  }

  const existingDpdpSections = await prisma.actSection.findMany({
    where: { actId: dpdpAct.id }
  });
  console.log(`Found ${existingDpdpSections.length} existing DPDP Act sections in database.`);
  const dpdpSectionMap = new Map(existingDpdpSections.map(s => [s.section, s]));

  let createdDpdpSectionCount = 0;
  let updatedDpdpSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of dpdpBearerActSections) {
    const existing = dpdpSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: dpdpAct.id,
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
    createdDpdpSectionCount = toCreate.length;
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
    updatedDpdpSectionCount = toUpdate.length;
  }

  console.log(`THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 Bearer Act Sections seeded: ${createdDpdpSectionCount} created, ${updatedDpdpSectionCount} updated across 9 chapters (Total: ${dpdpBearerActSections.length}).`);
}

run()
  .catch((e) => {
    console.error('Error during DPDP seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
