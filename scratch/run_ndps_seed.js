import prisma from '../src/lib/prisma.js';
import { ndpsBearerActSections } from '../prisma/ndpsBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let ndpsAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985'
    }
  });

  if (!ndpsAct) {
    ndpsAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!ndpsAct) {
    ndpsAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985',
        act: 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985',
        year: 1985
      }
    });
    console.log('Created Act: THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985 with ID:', ndpsAct.id);
  } else {
    ndpsAct = await prisma.act.update({
      where: { id: ndpsAct.id },
      data: {
        heading: 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985',
        act: 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985',
        year: 1985
      }
    });
    console.log('Synchronized Act: THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985 with ID:', ndpsAct.id);
  }

  const existingNdpsSections = await prisma.actSection.findMany({
    where: { actId: ndpsAct.id }
  });
  console.log(`Found ${existingNdpsSections.length} existing NDPS sections in database.`);
  const ndpsSectionMap = new Map(existingNdpsSections.map(s => [s.section, s]));

  let createdNdpsSectionCount = 0;
  let updatedNdpsSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of ndpsBearerActSections) {
    const existing = ndpsSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: ndpsAct.id,
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
    createdNdpsSectionCount = toCreate.length;
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
    updatedNdpsSectionCount = toUpdate.length;
  }

  console.log(`\nSeeding completed: ${createdNdpsSectionCount} created, ${updatedNdpsSectionCount} updated across 8 chapters (Total: ${ndpsBearerActSections.length}).`);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
