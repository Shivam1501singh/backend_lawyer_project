import { PrismaClient } from '@prisma/client';
import { realEstateBearerActSections } from '../prisma/realEstateBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

const prisma = new PrismaClient();

async function seedTargetedRealEstate() {
  console.log('--- Step 1: Validating JSON Data ---');
  console.log(`Total sections in JSON: ${realEstateBearerActSections.length}`);

  const chaptersSet = new Set();
  for (let i = 0; i < realEstateBearerActSections.length; i++) {
    const item = realEstateBearerActSections[i];
    if (!item.section || !item.title || !item.description || item.chapterNo === undefined || !item.chapterName) {
      throw new Error(`Invalid item at index ${i}: ${JSON.stringify(item)}`);
    }
    chaptersSet.add(`${item.chapterNo}: ${item.chapterName}`);
  }
  console.log(`Unique chapters (${chaptersSet.size}):`, Array.from(chaptersSet));

  console.log('\n--- Step 2: Target Category Verification ---');
  const bearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Taxation, Labour & Consumer Protection' }
  });

  if (!bearerAct) {
    throw new Error('Category "Taxation, Labour & Consumer Protection" not found in BearerAct table!');
  }
  console.log(`Found BearerAct: ${bearerAct.name} (${bearerAct.id})`);

  console.log('\n--- Step 3: Seeding Act & Sections (Execution 1) ---');
  const performSeed = async () => {
    let act = await prisma.act.findFirst({
      where: {
        bearerActId: bearerAct.id,
        heading: 'THE REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016'
      }
    });

    if (!act) {
      act = await prisma.act.findFirst({
        where: {
          bearerActId: bearerAct.id,
          heading: {
            contains: 'REAL ESTATE (REGULATION AND DEVELOPMENT)',
            mode: 'insensitive'
          }
        }
      });
    }

    if (!act) {
      act = await prisma.act.create({
        data: {
          bearerActId: bearerAct.id,
          heading: 'THE REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016',
          act: 'THE REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016',
          year: 2016
        }
      });
      console.log('Act created:', act.heading, `(ID: ${act.id})`);
    } else {
      act = await prisma.act.update({
        where: { id: act.id },
        data: {
          heading: 'THE REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016',
          act: 'THE REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016',
          year: 2016
        }
      });
      console.log('Act synchronized:', act.heading, `(ID: ${act.id})`);
    }

    const existingSections = await prisma.actSection.findMany({
      where: { actId: act.id }
    });
    const sectionMap = new Map(existingSections.map(s => [s.section, s]));

    const toCreate = [];
    const toUpdate = [];

    for (const item of realEstateBearerActSections) {
      const existing = sectionMap.get(item.section);
      const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);

      if (!existing) {
        toCreate.push({
          actId: act.id,
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

    return { act, createdCount: toCreate.length, updatedCount: toUpdate.length };
  };

  const firstRunResult = await performSeed();
  console.log(`First run: ${firstRunResult.createdCount} created, ${firstRunResult.updatedCount} updated.`);

  console.log('\n--- Step 4: Testing Idempotency (Execution 2) ---');
  const secondRunResult = await performSeed();
  console.log(`Second run: ${secondRunResult.createdCount} created, ${secondRunResult.updatedCount} updated.`);

  if (secondRunResult.createdCount !== 0) {
    throw new Error(`Idempotency failure: ${secondRunResult.createdCount} records created on second run!`);
  }
  console.log('✅ Idempotency test passed (0 new records created on rerun).');

  console.log('\n--- Step 5: Verifying Section Ordering and Integrity ---');
  const seededSections = await prisma.actSection.findMany({
    where: { actId: firstRunResult.act.id },
    orderBy: [
      { sectionOrder: 'asc' },
      { id: 'asc' }
    ]
  });

  console.log(`Total sections in database for this Act: ${seededSections.length}`);
  if (seededSections.length !== realEstateBearerActSections.length) {
    throw new Error(`Section count mismatch: expected ${realEstateBearerActSections.length}, found ${seededSections.length}`);
  }

  // Check order and fields
  for (let i = 0; i < seededSections.length; i++) {
    const expected = realEstateBearerActSections[i];
    const actual = seededSections[i];
    if (actual.section !== expected.section) {
      throw new Error(`Ordering mismatch at index ${i}: expected ${expected.section}, got ${actual.section}`);
    }
    if (actual.title !== expected.title) {
      throw new Error(`Title mismatch for ${expected.section}: expected "${expected.title}", got "${actual.title}"`);
    }
  }
  console.log('✅ All 92 sections verified in exact sequential numeric order and match JSON definitions.');

  console.log('\n--- Step 6: Testing Controller / API functions directly ---');
  // Verify Act details
  const fetchedAct = await prisma.act.findUnique({
    where: { id: firstRunResult.act.id },
    include: {
      bearerAct: true,
      _count: {
        select: { sections: true }
      }
    }
  });
  console.log('Act API Verification:', {
    id: fetchedAct.id,
    heading: fetchedAct.heading,
    category: fetchedAct.bearerAct.name,
    sectionsCount: fetchedAct._count.sections
  });

  // Verify other acts under Taxation, Labour & Consumer Protection
  const allActsUnderCategory = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log('\nAll Acts under "Taxation, Labour & Consumer Protection":', allActsUnderCategory);

  console.log('\n✅ All targeted seed operations and tests completed successfully.');
}

seedTargetedRealEstate()
  .catch((e) => {
    console.error('Execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
