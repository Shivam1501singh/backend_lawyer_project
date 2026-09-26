import prisma from '../src/lib/prisma.js';
import { uapaBearerActSections } from '../prisma/uapaBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let uapaAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967'
    }
  });

  if (!uapaAct) {
    uapaAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'UNLAWFUL ACTIVITIES (PREVENTION)',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!uapaAct) {
    uapaAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967',
        act: 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967',
        year: 1967
      }
    });
    console.log('Created Act: THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 with ID:', uapaAct.id);
  } else {
    uapaAct = await prisma.act.update({
      where: { id: uapaAct.id },
      data: {
        heading: 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967',
        act: 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967',
        year: 1967
      }
    });
    console.log('Synchronized Act: THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 with ID:', uapaAct.id);
  }

  const existingUapaSections = await prisma.actSection.findMany({
    where: { actId: uapaAct.id }
  });
  console.log(`Found ${existingUapaSections.length} existing UAPA sections in database.`);
  const uapaSectionMap = new Map(existingUapaSections.map(s => [s.section, s]));

  let createdUapaSectionCount = 0;
  let updatedUapaSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of uapaBearerActSections) {
    const existing = uapaSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: uapaAct.id,
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
    await prisma.actSection.createMany({
      data: toCreate
    });
    createdUapaSectionCount = toCreate.length;
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
    updatedUapaSectionCount = toUpdate.length;
  }

  console.log(`UAPA Bearer Act Sections seeded successfully: ${createdUapaSectionCount} created, ${updatedUapaSectionCount} updated across 4 chapters (Total: ${uapaBearerActSections.length}).`);

  // Verify
  const allSections = await prisma.actSection.findMany({
    where: { actId: uapaAct.id },
    orderBy: { sectionOrder: 'asc' }
  });
  console.log(`Total sections in DB for UAPA: ${allSections.length}`);
  console.log('Sample sections order:');
  allSections.slice(0, 10).forEach(s => console.log(` - ${s.section} (Order: ${s.sectionOrder}) [Ch. ${s.chapterNo} - ${s.chapterName}]: ${s.title}`));
  allSections.slice(-5).forEach(s => console.log(` - ${s.section} (Order: ${s.sectionOrder}) [Ch. ${s.chapterNo} - ${s.chapterName}]: ${s.title}`));
}

run()
  .catch(err => {
    console.error('Error running UAPA seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
