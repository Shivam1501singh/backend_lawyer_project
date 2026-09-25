import prisma from '../src/lib/prisma.js';
import { bsaBearerActSections } from '../prisma/bsaBearerActData.js';

async function run() {
  console.log('--- Starting Dedicated BSA Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let bsaAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'The Bharatiya Sakshya Adhiniyam, 2023'
    }
  });

  if (!bsaAct) {
    bsaAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'Bharatiya Sakshya Adhiniyam',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!bsaAct) {
    bsaAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'The Bharatiya Sakshya Adhiniyam, 2023',
        act: 'The Bharatiya Sakshya Adhiniyam, 2023',
        year: 2023
      }
    });
    console.log('Created BSA Act:', bsaAct.id);
  } else {
    bsaAct = await prisma.act.update({
      where: { id: bsaAct.id },
      data: {
        heading: 'The Bharatiya Sakshya Adhiniyam, 2023',
        act: 'The Bharatiya Sakshya Adhiniyam, 2023',
        year: 2023
      }
    });
    console.log('Synchronized BSA Act:', bsaAct.id);
  }

  const existingBsaSections = await prisma.actSection.findMany({
    where: { actId: bsaAct.id }
  });
  console.log(`Found ${existingBsaSections.length} existing BSA sections in database.`);
  const bsaSectionMap = new Map(existingBsaSections.map(s => [s.section, s]));

  let createdBsaSectionCount = 0;
  let updatedBsaSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of bsaBearerActSections) {
    const existing = bsaSectionMap.get(item.section);
    if (!existing) {
      toCreate.push({
        actId: bsaAct.id,
        section: item.section,
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
    await prisma.actSection.createMany({
      data: toCreate
    });
    createdBsaSectionCount = toCreate.length;
    console.log(`Created ${createdBsaSectionCount} BSA sections.`);
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
    updatedBsaSectionCount = toUpdate.length;
    console.log(`Updated ${updatedBsaSectionCount} BSA sections.`);
  }

  console.log(`BSA Bearer Act Sections seeded: ${createdBsaSectionCount} created, ${updatedBsaSectionCount} updated across 12 chapters (Total: ${bsaBearerActSections.length}).`);
  console.log('--- BSA Seeding Complete! ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
