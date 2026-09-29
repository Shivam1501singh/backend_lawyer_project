import { PrismaClient } from '@prisma/client';
import part1Data from '../prisma/incomeTaxBearerActDataPart1.json' with { type: 'json' };
import part2Data from '../prisma/incomeTaxBearerActDataPart2.json' with { type: 'json' };
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

const prisma = new PrismaClient();

const ACT_NAME = 'THE INCOME-TAX ACT, 2025 (AS AMENDED BY FINANCE ACT, 2026)';
const ACT_YEAR = 2025;
const CATEGORY_NAME = 'Taxation, Labour & Consumer Protection';

async function seedIncomeTaxAct() {
  console.log('=== Step 1: Validating Input JSON Data ===');
  console.log(`Part 1 sections count: ${part1Data.length}`);
  console.log(`Part 2 sections count: ${part2Data.length}`);
  const combinedData = [...part1Data, ...part2Data];
  console.log(`Total combined sections: ${combinedData.length}`);

  // Validate fields for Part 1
  for (let i = 0; i < part1Data.length; i++) {
    const item = part1Data[i];
    if (!item.section || !item.title || !item.description || item.chapterNo === undefined || !item.chapterName) {
      throw new Error(`Invalid item in Part 1 at index ${i}: ${JSON.stringify(item)}`);
    }
  }

  // Validate fields for Part 2
  for (let i = 0; i < part2Data.length; i++) {
    const item = part2Data[i];
    if (!item.section || !item.title || !item.description || item.chapterNo === undefined || !item.chapterName) {
      throw new Error(`Invalid item in Part 2 at index ${i}: ${JSON.stringify(item)}`);
    }
  }

  const chaptersMap = new Map();
  for (const item of combinedData) {
    if (!chaptersMap.has(item.chapterNo)) {
      chaptersMap.set(item.chapterNo, item.chapterName);
    }
  }
  console.log(`Unique Chapters across both parts (${chaptersMap.size}):`);
  for (const [chNo, chName] of Array.from(chaptersMap.entries()).sort((a, b) => a[0] - b[0])) {
    console.log(`  Chapter ${chNo}: ${chName}`);
  }

  console.log('\n=== Step 2: Target Category Verification ===');
  const bearerAct = await prisma.bearerAct.findUnique({
    where: { name: CATEGORY_NAME }
  });

  if (!bearerAct) {
    throw new Error(`Category "${CATEGORY_NAME}" not found in BearerAct table!`);
  }
  console.log(`Found BearerAct Category: ${bearerAct.name} (${bearerAct.id})`);

  const beforeOtherActs = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log(`Existing Acts under "${bearerAct.name}" before seed (${beforeOtherActs.length}):`, beforeOtherActs.map(a => a.heading));

  console.log('\n=== Step 3: Targeted Seed Operation (Part 1 then Part 2) ===');
  const performSeed = async () => {
    // Check if Act exists or create/update it
    let act = await prisma.act.findFirst({
      where: {
        bearerActId: bearerAct.id,
        heading: ACT_NAME
      }
    });

    if (!act) {
      act = await prisma.act.findFirst({
        where: {
          bearerActId: bearerAct.id,
          heading: {
            contains: 'INCOME-TAX ACT',
            mode: 'insensitive'
          }
        }
      });
    }

    if (!act) {
      act = await prisma.act.create({
        data: {
          bearerActId: bearerAct.id,
          heading: ACT_NAME,
          act: ACT_NAME,
          year: ACT_YEAR
        }
      });
      console.log('Act created:', act.heading, `(ID: ${act.id})`);
    } else {
      act = await prisma.act.update({
        where: { id: act.id },
        data: {
          heading: ACT_NAME,
          act: ACT_NAME,
          year: ACT_YEAR
        }
      });
      console.log('Act synchronized:', act.heading, `(ID: ${act.id})`);
    }

    // Process Part 1 First, then Part 2 Sequentially
    let part1Created = 0;
    let part1Updated = 0;
    let part2Created = 0;
    let part2Updated = 0;

    // Helper to seed a list of sections
    const seedSectionList = async (sectionsList, partName) => {
      const existingSections = await prisma.actSection.findMany({
        where: { actId: act.id }
      });
      const sectionMap = new Map(existingSections.map(s => [s.section, s]));

      const toCreate = [];
      const toUpdate = [];

      for (const item of sectionsList) {
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

      return { createdCount: toCreate.length, updatedCount: toUpdate.length };
    };

    console.log('-> Processing Part 1 (Sections 1 to 250)...');
    const p1Res = await seedSectionList(part1Data, 'Part 1');
    part1Created = p1Res.createdCount;
    part1Updated = p1Res.updatedCount;
    console.log(`   Part 1 completed: ${part1Created} created, ${part1Updated} updated.`);

    console.log('-> Processing Part 2 (Sections 251 to 536)...');
    const p2Res = await seedSectionList(part2Data, 'Part 2');
    part2Created = p2Res.createdCount;
    part2Updated = p2Res.updatedCount;
    console.log(`   Part 2 completed: ${part2Created} created, ${part2Updated} updated.`);

    return {
      act,
      part1Created,
      part1Updated,
      part2Created,
      part2Updated,
      totalCreated: part1Created + part2Created,
      totalUpdated: part1Updated + part2Updated
    };
  };

  const firstRun = await performSeed();
  console.log(`First run summary: ${firstRun.totalCreated} created, ${firstRun.totalUpdated} updated.`);

  console.log('\n=== Step 4: Testing Idempotency (Execution 2) ===');
  const secondRun = await performSeed();
  console.log(`Second run summary: ${secondRun.totalCreated} created, ${secondRun.totalUpdated} updated.`);

  if (secondRun.totalCreated !== 0) {
    throw new Error(`Idempotency verification failed: ${secondRun.totalCreated} records created on rerun!`);
  }
  console.log('✅ Idempotency test passed successfully (0 new records created on rerun).');

  console.log('\n=== Step 5: Verifying Section Ordering, Integrity, and Chapter Structure ===');
  const seededSections = await prisma.actSection.findMany({
    where: { actId: firstRun.act.id },
    orderBy: [
      { sectionOrder: 'asc' },
      { id: 'asc' }
    ]
  });

  console.log(`Total sections in database: ${seededSections.length}`);
  if (seededSections.length !== combinedData.length) {
    throw new Error(`Section count mismatch: expected ${combinedData.length}, found ${seededSections.length}`);
  }

  for (let i = 0; i < seededSections.length; i++) {
    const expected = combinedData[i];
    const actual = seededSections[i];
    if (actual.section !== expected.section) {
      throw new Error(`Ordering mismatch at index ${i}: expected ${expected.section}, got ${actual.section}`);
    }
    if (actual.title !== expected.title) {
      throw new Error(`Title mismatch for ${expected.section}: expected "${expected.title}", got "${actual.title}"`);
    }
    if (actual.chapterNo !== expected.chapterNo) {
      throw new Error(`ChapterNo mismatch for ${expected.section}: expected ${expected.chapterNo}, got ${actual.chapterNo}`);
    }
    if (actual.chapterName !== expected.chapterName) {
      throw new Error(`ChapterName mismatch for ${expected.section}: expected "${expected.chapterName}", got "${actual.chapterName}"`);
    }
  }
  console.log('✅ All 536 sections verified in exact sequential numeric order and match original JSON definitions.');

  console.log('\n=== Step 6: Verifying Category & Other Acts Integrity ===');
  const afterActsUnderCategory = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log(`Total Acts under "${bearerAct.name}" now: ${afterActsUnderCategory.length}`);
  for (const a of afterActsUnderCategory) {
    const count = await prisma.actSection.count({ where: { actId: a.id } });
    console.log(` - ${a.heading} (${a.year}): ${count} sections`);
  }

  return { actId: firstRun.act.id };
}

seedIncomeTaxAct()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
