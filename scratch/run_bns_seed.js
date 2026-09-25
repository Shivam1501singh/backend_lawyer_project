import prisma from '../src/lib/prisma.js';
import { bnsBearerActSections } from '../prisma/bnsBearerActData.js';

async function run() {
  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  console.log('Criminal BearerAct:', criminalBearerAct.id);

  let bnsAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'The Bharatiya Nyaya Sanhita, 2023'
    }
  });

  if (!bnsAct) {
    bnsAct = await prisma.act.create({
      data: {
        bearerActId: criminalBearerAct.id,
        heading: 'The Bharatiya Nyaya Sanhita, 2023',
        act: 'The Bharatiya Nyaya Sanhita, 2023',
        year: 2023
      }
    });
    console.log('Created BNS Act:', bnsAct.id);
  }

  const existingBnsSections = await prisma.actSection.findMany({
    where: { actId: bnsAct.id }
  });
  const bnsSectionMap = new Map(existingBnsSections.map(s => [s.section, s]));

  const toCreate = [];
  const toUpdate = [];

  for (const item of bnsBearerActSections) {
    const existing = bnsSectionMap.get(item.section);
    if (!existing) {
      toCreate.push({
        actId: bnsAct.id,
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
    await prisma.actSection.createMany({ data: toCreate });
  }

  console.log('BNS Bearer Act Seeded successfully! Created:', toCreate.length, 'Updated:', toUpdate.length);
  await prisma.$disconnect();
}

run().catch(console.error);
