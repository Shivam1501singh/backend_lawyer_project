import { PrismaClient } from '@prisma/client';
import { foreignExchangeManagementBearerActSections } from '../prisma/foreignExchangeManagementBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

const ACT_NAME = 'THE FOREIGN EXCHANGE MANAGEMENT ACT, 1999';
const ACT_YEAR = 1999;
const CATEGORY_NAME = 'Economic, Trade, & Market Regulatory';

export async function seedTargetedForeignExchangeManagementAct() {
  console.log('=== Step 1: Validating JSON Data ===');
  console.log(`Total sections in JSON: ${foreignExchangeManagementBearerActSections.length}`);

  const chaptersMap = new Map();
  for (let i = 0; i < foreignExchangeManagementBearerActSections.length; i++) {
    const item = foreignExchangeManagementBearerActSections[i];
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
            contains: 'FOREIGN EXCHANGE MANAGEMENT ACT',
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

    for (const item of foreignExchangeManagementBearerActSections) {
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
  if (seededSections.length !== foreignExchangeManagementBearerActSections.length) {
    throw new Error(`Section count mismatch: expected ${foreignExchangeManagementBearerActSections.length}, found ${seededSections.length}`);
  }

  for (let i = 0; i < seededSections.length; i++) {
    const expected = foreignExchangeManagementBearerActSections[i];
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
    if (actual.metaData !== expected.metaData) {
      throw new Error(`MetaData mismatch for ${expected.section}`);
    }
    if (actual.metaDescription !== expected.metaDescription) {
      throw new Error(`MetaDescription mismatch for ${expected.section}`);
    }
    if (actual.metaTitle !== expected.metaTitle) {
      throw new Error(`MetaTitle mismatch for ${expected.section}`);
    }
  }
  console.log(`✅ All ${seededSections.length} sections verified in exact sequential order and perfectly match JSON definitions.`);

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

  console.log('\n=== Step 7: Testing Controller APIs ===');
  const mockNext = (err) => {
    if (err) throw err;
  };

  // Test getSingleAct
  let actData = null;
  await getSingleAct({ params: { id: firstRunResult.act.id } }, {
    status: (code) => ({
      json: (data) => {
        actData = { code, data };
        return data;
      }
    })
  }, mockNext);

  if (actData?.code !== 200 || !actData?.data?.success) {
    throw new Error('getSingleAct API failed!');
  }
  console.log('✅ getSingleAct API passed (status 200)');

  // Test getSectionsByAct
  let sectionsData = null;
  await getSectionsByAct({ params: { id: firstRunResult.act.id }, query: { page: '1', limit: '100' } }, {
    status: (code) => ({
      json: (data) => {
        sectionsData = { code, data };
        return data;
      }
    })
  }, mockNext);

  if (sectionsData?.code !== 200 || sectionsData?.data?.data?.length !== foreignExchangeManagementBearerActSections.length) {
    throw new Error(`getSectionsByAct API failed: expected ${foreignExchangeManagementBearerActSections.length}, got ${sectionsData?.data?.data?.length}`);
  }
  console.log(`✅ getSectionsByAct API passed (status 200, returned ${sectionsData?.data?.data?.length} sections)`);

  // Test getSingleSection
  const firstSec = sectionsData.data.data[0];
  let singleSecData = null;
  await getSingleSection({ params: { id: firstSec.id } }, {
    status: (code) => ({
      json: (data) => {
        singleSecData = { code, data };
        return data;
      }
    })
  }, mockNext);

  if (singleSecData?.code !== 200 || singleSecData?.data?.data?.section !== 'Section 1') {
    throw new Error('getSingleSection API failed!');
  }
  console.log('✅ getSingleSection API passed (status 200, Section 1 verified)');

  console.log('\n✅ Targeted seeding, verification, and API testing completed successfully.');
  return { act: firstRunResult.act, totalSections: seededSections.length, totalChapters: chaptersMap.size };
}

if (process.argv[1] && process.argv[1].endsWith('seed_foreign_exchange_management.js')) {
  seedTargetedForeignExchangeManagementAct()
    .catch((e) => {
      console.error('Execution error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
