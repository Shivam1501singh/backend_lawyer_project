import prisma from '../src/lib/prisma.js';
import { pocsoBearerActSections } from '../prisma/pocsoBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012 Seeding ---');

  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('Criminal BearerAct not found in database!');
  }
  console.log('Found Criminal BearerAct ID:', criminalBearerAct.id);

  let pocsoAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012'
    }
  });

  if (!pocsoAct) {
    pocsoAct = await prisma.act.findFirst({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: {
          contains: 'PROTECTION OF CHILDREN FROM SEXUAL OFFENCES',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!pocsoAct) {
    pocsoAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012',
        act: 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012',
        year: 2012
      }
    });
    console.log('Created Act: THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012 with ID:', pocsoAct.id);
  } else {
    pocsoAct = await prisma.act.update({
      where: { id: pocsoAct.id },
      data: {
        heading: 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012',
        act: 'THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012',
        year: 2012
      }
    });
    console.log('Synchronized Act: THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012 with ID:', pocsoAct.id);
  }

  const existingPocsoSections = await prisma.actSection.findMany({
    where: { actId: pocsoAct.id }
  });
  console.log(`Found ${existingPocsoSections.length} existing POCSO Act sections in database.`);
  const pocsoSectionMap = new Map(existingPocsoSections.map(s => [s.section, s]));

  let createdPocsoSectionCount = 0;
  let updatedPocsoSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of pocsoBearerActSections) {
    const existing = pocsoSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: pocsoAct.id,
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
    createdPocsoSectionCount = toCreate.length;
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
    updatedPocsoSectionCount = toUpdate.length;
  }

  console.log(`\nPOCSO Act seeding summary:`);
  console.log(`- Created sections: ${createdPocsoSectionCount}`);
  console.log(`- Updated sections: ${updatedPocsoSectionCount}`);
  console.log(`- Total sections in JSON: ${pocsoBearerActSections.length}`);

  const totalInDb = await prisma.actSection.count({
    where: { actId: pocsoAct.id }
  });
  console.log(`- Verified Total sections in DB for THE PROTECTION OF CHILDREN FROM SEXUAL OFFENCES ACT, 2012: ${totalInDb}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
