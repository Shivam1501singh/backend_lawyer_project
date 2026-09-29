import { PrismaClient } from '@prisma/client';
import { incomeTaxBearerActSections } from '../prisma/incomeTaxBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

const prisma = new PrismaClient();

const ACT_NAME = 'THE INCOME-TAX ACT, 2025 (AS AMENDED BY FINANCE ACT, 2026)';
const ACT_YEAR = 2025;
const CATEGORY_NAME = 'Taxation, Labour & Consumer Protection';

async function main() {
  console.log(`Starting targeted seed for "${ACT_NAME}"...`);

  const bearerAct = await prisma.bearerAct.findUnique({
    where: { name: CATEGORY_NAME }
  });

  if (!bearerAct) {
    throw new Error(`BearerAct category "${CATEGORY_NAME}" not found`);
  }

  let act = await prisma.act.findFirst({
    where: {
      bearerActId: bearerAct.id,
      heading: ACT_NAME
    }
  });

  if (!act) {
    act = await prisma.act.create({
      data: {
        bearerActId: bearerAct.id,
        heading: ACT_NAME,
        act: ACT_NAME,
        year: ACT_YEAR
      }
    });
    console.log(`Created Act: ${act.heading} (${act.id})`);
  } else {
    act = await prisma.act.update({
      where: { id: act.id },
      data: {
        heading: ACT_NAME,
        act: ACT_NAME,
        year: ACT_YEAR
      }
    });
    console.log(`Updated Act: ${act.heading} (${act.id})`);
  }

  const existingSections = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  const sectionMap = new Map(existingSections.map(s => [s.section, s]));

  const toCreate = [];
  const toUpdate = [];

  for (const item of incomeTaxBearerActSections) {
    const existing = sectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

    const recordData = {
      sectionOrder: sectionOrder,
      chapterNo: item.chapterNo,
      chapterName: item.chapterName,
      title: item.title,
      description: item.description,
      metaData: item.metaData || null,
      metaDescription: item.metaDescription || null,
      metaTitle: item.metaTitle || null
    };

    if (!existing) {
      toCreate.push({
        actId: act.id,
        section: item.section,
        ...recordData
      });
    } else {
      toUpdate.push({
        id: existing.id,
        data: recordData
      });
    }
  }

  if (toCreate.length > 0) {
    const chunkSize = 50;
    for (let i = 0; i < toCreate.length; i += chunkSize) {
      await prisma.actSection.createMany({
        data: toCreate.slice(i, i + chunkSize)
      });
    }
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
  }

  console.log(`Seed complete. Created: ${toCreate.length}, Updated: ${toUpdate.length}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
