import { PrismaClient } from '@prisma/client';
import { pmlaBearerActSections } from '../prisma/pmlaBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

const ACT_NAME = 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002';
const ACT_YEAR = 2002;
const CATEGORY_NAME = 'Economic, Trade, & Market Regulatory';

async function main() {
  console.log('================================================================');
  console.log(' TARGETED SEEDING & VERIFICATION FOR:');
  console.log(` ${ACT_NAME}`);
  console.log(` Target Category: "${CATEGORY_NAME}"`);
  console.log('================================================================\n');

  // Step 1: Validate JSON source data
  console.log('--- Step 1: Validating JSON Data ---');
  console.log(`Total sections in JSON: ${pmlaBearerActSections.length}`);
  const chaptersMap = new Map();
  for (let i = 0; i < pmlaBearerActSections.length; i++) {
    const item = pmlaBearerActSections[i];
    if (!item.section || !item.title || !item.description || item.chapterNo === undefined || !item.chapterName) {
      throw new Error(`Invalid JSON item at index ${i}: ${JSON.stringify(item)}`);
    }
    if (!chaptersMap.has(item.chapterNo)) {
      chaptersMap.set(item.chapterNo, item.chapterName);
    }
  }
  console.log(`Unique chapters found: ${chaptersMap.size}`);
  for (const [chNo, chName] of Array.from(chaptersMap.entries()).sort((a, b) => a[0] - b[0])) {
    console.log(`  Chapter ${chNo}: ${chName}`);
  }

  // Step 2: Verify BearerAct Category
  console.log('\n--- Step 2: Target Category Verification ---');
  let bearerAct = await prisma.bearerAct.findUnique({
    where: { name: CATEGORY_NAME }
  });

  if (!bearerAct) {
    console.log(`Category "${CATEGORY_NAME}" not found. Creating it...`);
    bearerAct = await prisma.bearerAct.create({
      data: { name: CATEGORY_NAME }
    });
  }
  console.log(`Found BearerAct: ${bearerAct.name} (ID: ${bearerAct.id})`);

  const existingActsBefore = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log(`Existing Acts under "${bearerAct.name}" before seed (${existingActsBefore.length}):`, existingActsBefore.map(a => a.heading));

  // Step 3: Seed Function (Idempotent)
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
            contains: 'PREVENTION OF MONEY-LAUNDERING',
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
      console.log('Act record created:', act.heading, `(ID: ${act.id})`);
    } else {
      act = await prisma.act.update({
        where: { id: act.id },
        data: {
          heading: ACT_NAME,
          act: ACT_NAME,
          year: ACT_YEAR
        }
      });
      console.log('Act record synchronized/updated:', act.heading, `(ID: ${act.id})`);
    }

    const existingSections = await prisma.actSection.findMany({
      where: { actId: act.id }
    });
    const sectionMap = new Map(existingSections.map(s => [s.section, s]));

    const toCreate = [];
    const toUpdate = [];

    for (const item of pmlaBearerActSections) {
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

  console.log('\n--- Step 3: Executing First Seed Run ---');
  const run1 = await performSeed();
  console.log(`Run 1 Result: ${run1.createdCount} sections created, ${run1.updatedCount} sections updated.`);

  console.log('\n--- Step 4: Executing Second Seed Run (Testing Idempotency & Duplicate Prevention) ---');
  const run2 = await performSeed();
  console.log(`Run 2 Result: ${run2.createdCount} sections created, ${run2.updatedCount} sections updated.`);

  if (run2.createdCount !== 0) {
    throw new Error(`Duplicate check FAILED: ${run2.createdCount} sections were created on rerun!`);
  }
  console.log('✅ Duplicate-check passed: 0 duplicate records created on rerun.');

  // Step 5: Verify Data Accuracy & Section Ordering
  console.log('\n--- Step 5: Verifying Chapter & Section Data & Sorting Order ---');
  const dbSections = await prisma.actSection.findMany({
    where: { actId: run1.act.id },
    orderBy: [
      { sectionOrder: 'asc' },
      { id: 'asc' }
    ]
  });

  console.log(`Total sections in DB: ${dbSections.length} (Expected: ${pmlaBearerActSections.length})`);
  if (dbSections.length !== pmlaBearerActSections.length) {
    throw new Error(`Count mismatch: expected ${pmlaBearerActSections.length}, got ${dbSections.length}`);
  }

  for (let i = 0; i < dbSections.length; i++) {
    const actual = dbSections[i];
    const expected = pmlaBearerActSections[i];

    if (actual.section !== expected.section) {
      throw new Error(`Order/Section mismatch at index ${i}: DB had "${actual.section}", expected "${expected.section}"`);
    }
    if (actual.title !== expected.title) {
      throw new Error(`Title mismatch at ${actual.section}: DB had "${actual.title}", expected "${expected.title}"`);
    }
    if (actual.chapterNo !== expected.chapterNo) {
      throw new Error(`ChapterNo mismatch at ${actual.section}: DB had ${actual.chapterNo}, expected ${expected.chapterNo}`);
    }
    if (actual.chapterName !== expected.chapterName) {
      throw new Error(`ChapterName mismatch at ${actual.section}: DB had "${actual.chapterName}", expected "${expected.chapterName}"`);
    }
    if (actual.description !== expected.description) {
      throw new Error(`Description mismatch at ${actual.section}`);
    }
    if (actual.metaData !== expected.metaData) {
      throw new Error(`MetaData mismatch at ${actual.section}`);
    }
    if (actual.metaDescription !== expected.metaDescription) {
      throw new Error(`MetaDescription mismatch at ${actual.section}`);
    }
    if (actual.metaTitle !== expected.metaTitle) {
      throw new Error(`MetaTitle mismatch at ${actual.section}`);
    }
  }
  console.log('✅ All 81 sections verified matching exact titles, chapters, text, and numerical ordering.');

  // Step 6: Testing Controller APIs
  console.log('\n--- Step 6: Testing Bearer Act APIs for PMLA ---');
  const mockNext = (err) => {
    if (err) throw err;
  };

  // Test 1: getSingleAct
  let actData = null;
  await getSingleAct(
    { params: { id: run1.act.id } },
    {
      status: (code) => ({
        json: (data) => {
          actData = { code, data };
          return data;
        }
      })
    },
    mockNext
  );

  console.log('1. getSingleAct:');
  console.log(`   Status: ${actData?.code}, Success: ${actData?.data?.success}`);
  console.log(`   Heading: "${actData?.data?.data?.heading}", Year: ${actData?.data?.data?.year}`);
  console.log(`   Category: "${actData?.data?.data?.bearerAct?.name}"`);
  console.log(`   Sections attached in Act payload: ${actData?.data?.data?.sections?.length}`);
  if (actData?.code !== 200 || !actData?.data?.success || actData?.data?.data?.sections?.length !== 81) {
    throw new Error('getSingleAct API test failed!');
  }

  // Test 2: getSectionsByAct (Pagination)
  let sectionsData = null;
  await getSectionsByAct(
    {
      params: { id: run1.act.id },
      query: { page: '1', limit: '100' }
    },
    {
      status: (code) => ({
        json: (data) => {
          sectionsData = { code, data };
          return data;
        }
      })
    },
    mockNext
  );

  const apiSections = sectionsData?.data?.data;
  console.log('2. getSectionsByAct:');
  console.log(`   Status: ${sectionsData?.code}, Success: ${sectionsData?.data?.success}`);
  console.log(`   Total items returned: ${apiSections?.length}`);
  console.log(`   Pagination total: ${sectionsData?.data?.pagination?.total}`);
  console.log(`   First section: ${apiSections?.[0]?.section} - ${apiSections?.[0]?.title}`);
  console.log(`   Last section: ${apiSections?.[apiSections.length - 1]?.section} - ${apiSections?.[apiSections.length - 1]?.title}`);

  if (sectionsData?.code !== 200 || apiSections?.length !== 81) {
    throw new Error('getSectionsByAct API test failed!');
  }

  // Verify numerical order in API response
  for (let i = 1; i < apiSections.length; i++) {
    if (apiSections[i].sectionOrder < apiSections[i - 1].sectionOrder) {
      throw new Error(`API ordering issue: ${apiSections[i-1].section} (${apiSections[i-1].sectionOrder}) vs ${apiSections[i].section} (${apiSections[i].sectionOrder})`);
    }
  }
  console.log('✅ API returned all 81 sections in strictly ordered sequence.');

  // Test 3: getSingleSection (Section 1)
  const sec1 = apiSections[0];
  let sec1Data = null;
  await getSingleSection(
    { params: { id: sec1.id } },
    {
      status: (code) => ({
        json: (data) => {
          sec1Data = { code, data };
          return data;
        }
      })
    },
    mockNext
  );
  console.log('3. getSingleSection (Section 1):');
  console.log(`   Status: ${sec1Data?.code}, Section: "${sec1Data?.data?.data?.section}"`);
  console.log(`   Title: "${sec1Data?.data?.data?.title}"`);
  console.log(`   Chapter: Chapter ${sec1Data?.data?.data?.chapterNo} - ${sec1Data?.data?.data?.chapterName}`);
  if (sec1Data?.code !== 200 || sec1Data?.data?.data?.section !== 'Section 1') {
    throw new Error('getSingleSection (Section 1) test failed!');
  }

  // Test 4: getSingleSection (Section 11A in Chapter 4)
  const sec11A = apiSections.find(s => s.section === 'Section 11A');
  let sec11AData = null;
  await getSingleSection(
    { params: { id: sec11A.id } },
    {
      status: (code) => ({
        json: (data) => {
          sec11AData = { code, data };
          return data;
        }
      })
    },
    mockNext
  );
  console.log('4. getSingleSection (Section 11A):');
  console.log(`   Status: ${sec11AData?.code}, Section: "${sec11AData?.data?.data?.section}"`);
  console.log(`   Title: "${sec11AData?.data?.data?.title}"`);
  console.log(`   Chapter: Chapter ${sec11AData?.data?.data?.chapterNo} - ${sec11AData?.data?.data?.chapterName}`);
  if (sec11AData?.code !== 200 || sec11AData?.data?.data?.section !== 'Section 11A') {
    throw new Error('getSingleSection (Section 11A) test failed!');
  }

  // Step 7: Check other Acts under category to confirm no unintended changes
  console.log('\n--- Step 7: Verifying Category Integrity ---');
  const allActsUnderCategory = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log(`Total Acts under "${bearerAct.name}": ${allActsUnderCategory.length}`);
  for (const a of allActsUnderCategory) {
    const count = await prisma.actSection.count({ where: { actId: a.id } });
    console.log(` - ${a.heading} (${a.year}): ${count} sections`);
  }

  console.log('\n================================================================');
  console.log(' ALL SEEDING, DEDUPLICATION, AND API TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

main()
  .catch((err) => {
    console.error('Fatal error during seed/test execution:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
