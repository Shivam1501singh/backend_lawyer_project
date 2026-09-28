import prisma from '../src/lib/prisma.js';
import { specificReliefBearerActSections } from '../prisma/specificReliefBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function run() {
  console.log('--- Starting Dedicated THE SPECIFIC RELIEF ACT, 1963 Seeding ---');

  let civilAndPropertyBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Civil and Property' }
  });
  
  if (!civilAndPropertyBearerAct) {
    console.log('Civil and Property BearerAct not found by exact match, searching case-insensitively or creating...');
    civilAndPropertyBearerAct = await prisma.bearerAct.findFirst({
      where: {
        name: {
          contains: 'Civil and Property',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!civilAndPropertyBearerAct) {
    civilAndPropertyBearerAct = await prisma.bearerAct.create({
      data: { name: 'Civil and Property' }
    });
    console.log('Created BearerAct: Civil and Property with ID:', civilAndPropertyBearerAct.id);
  } else {
    console.log('Found existing Civil and Property BearerAct ID:', civilAndPropertyBearerAct.id);
  }

  let sraAct = await prisma.act.findFirst({
    where: {
      bearerActId: civilAndPropertyBearerAct.id,
      heading: 'THE SPECIFIC RELIEF ACT, 1963'
    }
  });

  if (!sraAct) {
    sraAct = await prisma.act.findFirst({
      where: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: {
          contains: 'Specific Relief',
          mode: 'insensitive'
        }
      }
    });
  }

  if (!sraAct) {
    sraAct = await prisma.act.create({
      data: {
        bearerActId: civilAndPropertyBearerAct.id,
        heading: 'THE SPECIFIC RELIEF ACT, 1963',
        act: 'THE SPECIFIC RELIEF ACT, 1963',
        year: 1963
      }
    });
    console.log('Created Act: THE SPECIFIC RELIEF ACT, 1963 with ID:', sraAct.id);
  } else {
    sraAct = await prisma.act.update({
      where: { id: sraAct.id },
      data: {
        heading: 'THE SPECIFIC RELIEF ACT, 1963',
        act: 'THE SPECIFIC RELIEF ACT, 1963',
        year: 1963
      }
    });
    console.log('Synchronized Act: THE SPECIFIC RELIEF ACT, 1963 with ID:', sraAct.id);
  }

  const existingSraSections = await prisma.actSection.findMany({
    where: { actId: sraAct.id }
  });
  console.log(`Found ${existingSraSections.length} existing SRA sections in database.`);
  const sraSectionMap = new Map(existingSraSections.map(s => [s.section, s]));

  let createdSectionCount = 0;
  let updatedSectionCount = 0;

  const toCreate = [];
  const toUpdate = [];

  for (const item of specificReliefBearerActSections) {
    const existing = sraSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: sraAct.id,
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
    createdSectionCount = toCreate.length;
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
    updatedSectionCount = toUpdate.length;
  }

  console.log(`Seeding complete: ${createdSectionCount} created, ${updatedSectionCount} updated across 9 chapters (Total: ${specificReliefBearerActSections.length}).`);
  
  // Verification check
  const allSectionsInDb = await prisma.actSection.findMany({
    where: { actId: sraAct.id },
    orderBy: { sectionOrder: 'asc' }
  });
  console.log(`Total sections in DB for THE SPECIFIC RELIEF ACT, 1963: ${allSectionsInDb.length}`);
  console.log('Sample first 3 sections:', allSectionsInDb.slice(0, 3).map(s => ({ section: s.section, order: s.sectionOrder, title: s.title })));
  console.log('Sample around 14/14A:', allSectionsInDb.filter(s => s.section.includes('14')).map(s => ({ section: s.section, order: s.sectionOrder })));
  console.log('Sample around 20/20A/20B/20C:', allSectionsInDb.filter(s => s.section.includes('20')).map(s => ({ section: s.section, order: s.sectionOrder })));
  console.log('Sample last 3 sections:', allSectionsInDb.slice(-3).map(s => ({ section: s.section, order: s.sectionOrder, title: s.title })));
}

run()
  .catch(err => {
    console.error('Error seeding THE SPECIFIC RELIEF ACT, 1963:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
