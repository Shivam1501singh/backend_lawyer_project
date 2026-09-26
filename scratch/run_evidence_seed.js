import prisma from '../src/lib/prisma.js';
import { evidenceBearerActSections } from '../prisma/evidenceBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE INDIAN EVIDENCE ACT, 1872 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let evidenceAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE INDIAN EVIDENCE ACT, 1872'
    }
  });

  if (!evidenceAct) {
    evidenceAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'INDIAN EVIDENCE ACT',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!evidenceAct) {
    evidenceAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE INDIAN EVIDENCE ACT, 1872',
        act: 'THE INDIAN EVIDENCE ACT, 1872',
        year: 1872
      }
    });
    console.log('Created Act: THE INDIAN EVIDENCE ACT, 1872 with ID:', evidenceAct.id);
  } else {
    evidenceAct = await prisma.act.update({
      where: { id: evidenceAct.id },
      data: {
        heading: 'THE INDIAN EVIDENCE ACT, 1872',
        act: 'THE INDIAN EVIDENCE ACT, 1872',
        year: 1872
      }
    });
    console.log('Synchronized Act: THE INDIAN EVIDENCE ACT, 1872 with ID:', evidenceAct.id);
  }

  const existingEvidenceSections = await prisma.actSection.findMany({
    where: { actId: evidenceAct.id }
  });
  console.log(`Found ${existingEvidenceSections.length} existing Indian Evidence Act sections in database.`);
  const evidenceSectionMap = new Map(existingEvidenceSections.map(s => [s.section, s]));

  let createdEvidenceSectionCount = 0;
  let updatedEvidenceSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of evidenceBearerActSections) {
    const existing = evidenceSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: evidenceAct.id,
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
    createdEvidenceSectionCount = toCreate.length;
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
    updatedEvidenceSectionCount = toUpdate.length;
  }

  console.log(`--- Seeding Finished Successfully ---`);
  console.log(`Total sections in dataset: ${evidenceBearerActSections.length}`);
  console.log(`Created: ${createdEvidenceSectionCount}, Updated: ${updatedEvidenceSectionCount}`);

  // Verification queries
  const finalSectionsCount = await prisma.actSection.count({
    where: { actId: evidenceAct.id }
  });
  console.log(`Total sections now in DB for THE INDIAN EVIDENCE ACT, 1872: ${finalSectionsCount}`);
}

run()
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
