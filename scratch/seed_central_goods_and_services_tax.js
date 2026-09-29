import { PrismaClient } from '@prisma/client';
import { centralGoodsAndServicesTaxBearerActSections } from '../prisma/centralGoodsAndServicesTaxBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

const prisma = new PrismaClient();

const ACT_NAME = 'THE CENTRAL GOODS AND SERVICES TAX ACT, 2017';
const ACT_YEAR = 2017;
const CATEGORY_NAME = 'Taxation, Labour & Consumer Protection';

export async function seedTargetedCentralGoodsAndServicesTax() {
  console.log('=== Step 1: Validating JSON Data ===');
  console.log(`Total sections in JSON: ${centralGoodsAndServicesTaxBearerActSections.length}`);

  const chaptersMap = new Map();
  for (let i = 0; i < centralGoodsAndServicesTaxBearerActSections.length; i++) {
    const item = centralGoodsAndServicesTaxBearerActSections[i];
    if (!item.section || !item.title || !item.description || item.chapterNo === undefined || !item.chapterName) {
      throw new Error(`Invalid item at index ${i}: ${JSON.stringify(item)}`);
    }
    if (!chaptersMap.has(item.chapterNo)) {
      chaptersMap.set(item.chapterNo, item.chapterName);
    }
  }
  console.log(`Unique chapters (${chaptersMap.size}):`);
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
  console.log(`Found BearerAct: ${bearerAct.name} (${bearerAct.id})`);

  // Record other acts in this category beforehand to verify they are unaffected
  const beforeOtherActs = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log(`Existing Acts under "${bearerAct.name}" before seed (${beforeOtherActs.length}):`, beforeOtherActs.map(a => a.heading));

  console.log('\n=== Step 3: Seeding Act & Sections (Execution 1) ===');
  const performSeed = async () => {
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
            contains: 'CENTRAL GOODS AND SERVICES TAX',
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

    const existingSections = await prisma.actSection.findMany({
      where: { actId: act.id }
    });
    const sectionMap = new Map(existingSections.map(s => [s.section, s]));

    const toCreate = [];
    const toUpdate = [];

    for (const item of centralGoodsAndServicesTaxBearerActSections) {
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
  console.log(`First run result: ${firstRunResult.createdCount} created, ${firstRunResult.updatedCount} updated.`);

  console.log('\n=== Step 4: Testing Idempotency (Execution 2) ===');
  const secondRunResult = await performSeed();
  console.log(`Second run result: ${secondRunResult.createdCount} created, ${secondRunResult.updatedCount} updated.`);

  if (secondRunResult.createdCount !== 0) {
    throw new Error(`Idempotency failure: ${secondRunResult.createdCount} records created on rerun!`);
  }
  console.log('✅ Idempotency test passed (0 new records created on rerun).');

  console.log('\n=== Step 5: Verifying Section Ordering, Integrity, and Chapter Structure ===');
  const seededSections = await prisma.actSection.findMany({
    where: { actId: firstRunResult.act.id },
    orderBy: [
      { sectionOrder: 'asc' },
      { id: 'asc' }
    ]
  });

  console.log(`Total sections in database for ${ACT_NAME}: ${seededSections.length}`);
  if (seededSections.length !== centralGoodsAndServicesTaxBearerActSections.length) {
    throw new Error(`Section count mismatch: expected ${centralGoodsAndServicesTaxBearerActSections.length}, found ${seededSections.length}`);
  }

  // Check order, headings, and descriptions
  for (let i = 0; i < seededSections.length; i++) {
    const expected = centralGoodsAndServicesTaxBearerActSections[i];
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
    if (actual.description !== expected.description) {
      throw new Error(`Description mismatch for ${expected.section}`);
    }
  }
  console.log(`✅ All ${seededSections.length} sections verified in exact sequential numeric order and perfectly match JSON definitions.`);

  console.log('\n=== Step 6: Verifying Category & Other Acts Integrity ===');
  const afterActsUnderCategory = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log(`Total Acts under "${bearerAct.name}" now: ${afterActsUnderCategory.length}`);
  for (const a of afterActsUnderCategory) {
    const sectionCount = await prisma.actSection.count({ where: { actId: a.id } });
    console.log(` - ${a.heading} (${a.year}): ${sectionCount} sections`);
  }

  console.log('\n✅ Targeted seeding and data verification completed successfully.');
  return { act: firstRunResult.act, totalSections: seededSections.length, totalChapters: chaptersMap.size };
}

if (process.argv[1] && process.argv[1].endsWith('seed_central_goods_and_services_tax.js')) {
  seedTargetedCentralGoodsAndServicesTax()
    .catch((e) => {
      console.error('Execution error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
