import prisma from '../src/lib/prisma.js';
import { corruptionAmendmentBearerActSections } from '../prisma/corruptionAmendmentBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let corruptionAmendmentAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018'
    }
  });

  if (!corruptionAmendmentAct) {
    corruptionAmendmentAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'PREVENTION OF CORRUPTION (AMENDMENT) ACT',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!corruptionAmendmentAct) {
    corruptionAmendmentAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018',
        act: 'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018',
        year: 2018
      }
    });
    console.log('Created Act: THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 with ID:', corruptionAmendmentAct.id);
  } else {
    corruptionAmendmentAct = await prisma.act.update({
      where: { id: corruptionAmendmentAct.id },
      data: {
        heading: 'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018',
        act: 'THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018',
        year: 2018
      }
    });
    console.log('Synchronized Act: THE PREVENTION OF CORRUPTION (AMENDMENT) ACT, 2018 with ID:', corruptionAmendmentAct.id);
  }

  const existingSections = await prisma.actSection.findMany({
    where: { actId: corruptionAmendmentAct.id }
  });
  console.log(`Found ${existingSections.length} existing Corruption Amendment Act sections in database.`);
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  let createdCount = 0;
  let updatedCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of corruptionAmendmentBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: corruptionAmendmentAct.id,
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
    createdCount = toCreate.length;
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
    updatedCount = toUpdate.length;
  }

  console.log(`Successfully finished! Created: ${createdCount}, Updated: ${updatedCount} (Total: ${corruptionAmendmentBearerActSections.length}).`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
