import prisma from '../src/lib/prisma.js';
import { bnssBearerActSections } from '../prisma/bnssBearerActData.js';

async function run() {
  console.log('--- Starting Dedicated BNSS Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let bnssAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'The Bharatiya Nagarik Suraksha Sanhita, 2023'
    }
  });

  if (!bnssAct) {
    bnssAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'Bharatiya Nagarik Suraksha Sanhita',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!bnssAct) {
    bnssAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'The Bharatiya Nagarik Suraksha Sanhita, 2023',
        act: 'The Bharatiya Nagarik Suraksha Sanhita, 2023',
        year: 2023
      }
    });
    console.log('Created BNSS Act:', bnssAct.id);
  } else {
    bnssAct = await prisma.act.update({
      where: { id: bnssAct.id },
      data: {
        heading: 'The Bharatiya Nagarik Suraksha Sanhita, 2023',
        act: 'The Bharatiya Nagarik Suraksha Sanhita, 2023',
        year: 2023
      }
    });
    console.log('Synchronized BNSS Act:', bnssAct.id);
  }

  const existingBnssSections = await prisma.actSection.findMany({
    where: { actId: bnssAct.id }
  });
  console.log(`Found ${existingBnssSections.length} existing BNSS sections in database.`);
  const bnssSectionMap = new Map(existingBnssSections.map(s => [s.section, s]));

  let createdBnssSectionCount = 0;
  let updatedBnssSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of bnssBearerActSections) {
    const existing = bnssSectionMap.get(item.section);
    if (!existing) {
      toCreate.push({
        actId: bnssAct.id,
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
    createdBnssSectionCount = toCreate.length;
    console.log(`Created ${createdBnssSectionCount} BNSS sections.`);
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
    updatedBnssSectionCount = toUpdate.length;
    console.log(`Updated ${updatedBnssSectionCount} BNSS sections.`);
  }

  console.log(`BNSS Bearer Act Sections seeded: ${createdBnssSectionCount} created, ${updatedBnssSectionCount} updated across 39 chapters (Total: ${bnssBearerActSections.length}).`);
  console.log('--- BNSS Seeding Complete! ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
