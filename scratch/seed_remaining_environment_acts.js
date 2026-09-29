import { PrismaClient } from '@prisma/client';
import { indianForestBearerActSections } from '../prisma/indianForestBearerActData.js';
import { biologicalDiversityBearerActSections } from '../prisma/biologicalDiversityBearerActData.js';
import { nationalGreenTribunalBearerActSections } from '../prisma/nationalGreenTribunalBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';
import {
  getSingleBearerAct,
  getActsByBearerAct,
  getSingleAct,
  getSectionsByAct,
  getSingleSection
} from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

const CATEGORY_NAME = 'Environment and Land';

const PREVIOUS_FOUR_ACTS = [
  'THE ENVIRONMENT (PROTECTION) ACT, 1986',
  'THE WATER (PREVENTION AND CONTROL OF POLLUTION) ACT, 1974',
  'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981',
  'THE WILD LIFE (PROTECTION) ACT, 1972'
];

const NEW_ACTS_CONFIG = [
  {
    heading: 'THE INDIAN FOREST ACT, 1927',
    act: 'THE INDIAN FOREST ACT, 1927',
    year: 1927,
    sections: indianForestBearerActSections,
    searchTerms: ['INDIAN FOREST ACT', 'FOREST ACT']
  },
  {
    heading: 'THE BIOLOGICAL DIVERSITY ACT, 2002',
    act: 'THE BIOLOGICAL DIVERSITY ACT, 2002',
    year: 2002,
    sections: biologicalDiversityBearerActSections,
    searchTerms: ['BIOLOGICAL DIVERSITY ACT', 'BIODIVERSITY ACT']
  },
  {
    heading: 'THE NATIONAL GREEN TRIBUNAL ACT, 2010',
    act: 'THE NATIONAL GREEN TRIBUNAL ACT, 2010',
    year: 2010,
    sections: nationalGreenTribunalBearerActSections,
    searchTerms: ['NATIONAL GREEN TRIBUNAL ACT', 'GREEN TRIBUNAL ACT']
  }
];

async function main() {
  console.log('================================================================');
  console.log(' SEEDING REMAINING 3 ACTS – ENVIRONMENT AND LAND');
  console.log(` Target Category: "${CATEGORY_NAME}"`);
  console.log('================================================================\n');

  // Step 1: Validate JSON source data for the 3 new Acts
  console.log('--- Step 1: Validating JSON Data for 3 Remaining Acts ---');
  const actStats = [];
  for (const actConfig of NEW_ACTS_CONFIG) {
    console.log(`\nValidating "${actConfig.heading}" (${actConfig.year}):`);
    console.log(`  Total sections in JSON: ${actConfig.sections.length}`);
    const chaptersMap = new Map();

    for (let i = 0; i < actConfig.sections.length; i++) {
      const item = actConfig.sections[i];
      if (!item.section || !item.title || !item.description || item.chapterNo === undefined || !item.chapterName) {
        throw new Error(`Invalid JSON item at index ${i} for ${actConfig.heading}: ${JSON.stringify(item)}`);
      }
      if (!chaptersMap.has(item.chapterNo)) {
        chaptersMap.set(item.chapterNo, item.chapterName);
      }
    }

    console.log(`  Unique chapters found: ${chaptersMap.size}`);
    for (const [chNo, chName] of Array.from(chaptersMap.entries())) {
      console.log(`    Chapter ${chNo}: ${chName}`);
    }

    actStats.push({
      heading: actConfig.heading,
      year: actConfig.year,
      chapterCount: chaptersMap.size,
      sectionCount: actConfig.sections.length
    });
  }

  // Step 2: Verify BearerAct Category & Check existing database records
  console.log('\n--- Step 2: Target Category & Database Records Check Before Seeding ---');
  let bearerAct = await prisma.bearerAct.findUnique({
    where: { name: CATEGORY_NAME }
  });

  if (!bearerAct) {
    console.log(`Category "${CATEGORY_NAME}" not found. Creating it...`);
    bearerAct = await prisma.bearerAct.create({
      data: { name: CATEGORY_NAME }
    });
  }
  console.log(`Found BearerAct: "${bearerAct.name}" (ID: ${bearerAct.id})`);

  const existingActsBefore = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    include: {
      _count: { select: { sections: true } }
    },
    orderBy: { year: 'asc' }
  });

  console.log(`Existing Acts under "${bearerAct.name}" before seed (${existingActsBefore.length}):`);
  for (const a of existingActsBefore) {
    console.log(`  - ${a.heading} (${a.year}) [ID: ${a.id}]: ${a._count.sections} sections`);
  }

  // Snapshot previous 4 acts to guarantee no modification
  const previousActsSnapshot = new Map(
    existingActsBefore
      .filter(a => PREVIOUS_FOUR_ACTS.includes(a.heading))
      .map(a => [a.heading, { id: a.id, year: a.year, sectionCount: a._count.sections }])
  );

  console.log(`\nVerified ${previousActsSnapshot.size} previously seeded Acts to protect:`, Array.from(previousActsSnapshot.keys()));

  // Step 3: Targeted Seed Function for an Act
  const seedAct = async (actConfig) => {
    let act = await prisma.act.findFirst({
      where: {
        bearerActId: bearerAct.id,
        heading: actConfig.heading
      }
    });

    if (!act) {
      for (const term of actConfig.searchTerms) {
        act = await prisma.act.findFirst({
          where: {
            bearerActId: bearerAct.id,
            heading: {
              contains: term,
              mode: 'insensitive'
            }
          }
        });
        if (act) break;
      }
    }

    if (!act) {
      act = await prisma.act.create({
        data: {
          bearerActId: bearerAct.id,
          heading: actConfig.heading,
          act: actConfig.act,
          year: actConfig.year
        }
      });
      console.log(`Act record created: "${act.heading}" (ID: ${act.id})`);
    } else {
      act = await prisma.act.update({
        where: { id: act.id },
        data: {
          heading: actConfig.heading,
          act: actConfig.act,
          year: actConfig.year
        }
      });
      console.log(`Act record synchronized: "${act.heading}" (ID: ${act.id})`);
    }

    const existingSections = await prisma.actSection.findMany({
      where: { actId: act.id }
    });
    const sectionMap = new Map(existingSections.map(s => [s.section, s]));

    const toCreate = [];
    const toUpdate = [];

    for (const item of actConfig.sections) {
      const existing = sectionMap.get(item.section);
      const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
      const chapterNoInt = typeof item.chapterNo === 'number' ? Math.trunc(item.chapterNo) : parseInt(item.chapterNo, 10);

      if (!existing) {
        toCreate.push({
          actId: act.id,
          section: item.section,
          sectionOrder: sectionOrder,
          chapterNo: chapterNoInt,
          chapterName: item.chapterName,
          title: item.title,
          description: item.description,
          metaData: item.metaData || null,
          metaDescription: item.metaDescription || null,
          metaTitle: item.metaTitle || null
        });
      } else {
        toUpdate.push({
          id: existing.id,
          data: {
            sectionOrder: sectionOrder,
            chapterNo: chapterNoInt,
            chapterName: item.chapterName,
            title: item.title,
            description: item.description,
            metaData: item.metaData || null,
            metaDescription: item.metaDescription || null,
            metaTitle: item.metaTitle || null
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

  // Step 4: Execute Targeted Seed for the 3 Remaining Acts
  console.log('\n--- Step 4: Executing Targeted Seed Run for 3 Remaining Acts ---');
  const seededActs = [];
  for (const actConfig of NEW_ACTS_CONFIG) {
    const result = await seedAct(actConfig);
    seededActs.push(result);
    console.log(`Result for ${actConfig.heading}: ${result.createdCount} sections created, ${result.updatedCount} sections updated.`);
  }

  // Step 5: Execute Idempotency & Duplicate Check
  console.log('\n--- Step 5: Executing Duplicate Check (Testing Idempotency) ---');
  for (const actConfig of NEW_ACTS_CONFIG) {
    const rerunResult = await seedAct(actConfig);
    console.log(`Rerun for ${actConfig.heading}: ${rerunResult.createdCount} created, ${rerunResult.updatedCount} updated.`);
    if (rerunResult.createdCount !== 0) {
      throw new Error(`Duplicate check FAILED for "${actConfig.heading}": ${rerunResult.createdCount} sections created on rerun!`);
    }
  }
  console.log('✅ Duplicate check PASSED for all 3 Acts: 0 duplicates created on rerun.');

  // Step 6: Verify Exact Chapter & Section Counts, Content, and Ordering in DB
  console.log('\n--- Step 6: Verifying Chapter & Section Data & Sorting Order for each Act ---');
  for (let idx = 0; idx < NEW_ACTS_CONFIG.length; idx++) {
    const actConfig = NEW_ACTS_CONFIG[idx];
    const seeded = seededActs[idx];

    const dbSections = await prisma.actSection.findMany({
      where: { actId: seeded.act.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' },
        { id: 'asc' }
      ]
    });

    console.log(`\nVerifying DB sections for ${actConfig.heading}:`);
    console.log(`  Expected sections: ${actConfig.sections.length}`);
    console.log(`  Actual DB sections: ${dbSections.length}`);

    if (dbSections.length !== actConfig.sections.length) {
      throw new Error(`Count mismatch for ${actConfig.heading}: expected ${actConfig.sections.length}, got ${dbSections.length}`);
    }

    for (let i = 0; i < dbSections.length; i++) {
      const actual = dbSections[i];
      const expected = actConfig.sections[i];
      const expectedChapterNo = typeof expected.chapterNo === 'number' ? Math.trunc(expected.chapterNo) : parseInt(expected.chapterNo, 10);

      if (actual.section !== expected.section) {
        throw new Error(`Section mismatch at index ${i} in ${actConfig.heading}: DB had "${actual.section}", expected "${expected.section}"`);
      }
      if (actual.title !== expected.title) {
        throw new Error(`Title mismatch at ${actual.section} in ${actConfig.heading}: DB had "${actual.title}", expected "${expected.title}"`);
      }
      if (actual.chapterNo !== expectedChapterNo) {
        throw new Error(`ChapterNo mismatch at ${actual.section} in ${actConfig.heading}: DB had ${actual.chapterNo}, expected ${expectedChapterNo}`);
      }
      if (actual.chapterName !== expected.chapterName) {
        throw new Error(`ChapterName mismatch at ${actual.section} in ${actConfig.heading}: DB had "${actual.chapterName}", expected "${expected.chapterName}"`);
      }
      if (actual.description !== expected.description) {
        throw new Error(`Description mismatch at ${actual.section} in ${actConfig.heading}`);
      }
      if (actual.metaData !== (expected.metaData || null)) {
        throw new Error(`MetaData mismatch at ${actual.section} in ${actConfig.heading}`);
      }
      if (actual.metaDescription !== (expected.metaDescription || null)) {
        throw new Error(`MetaDescription mismatch at ${actual.section} in ${actConfig.heading}`);
      }
      if (actual.metaTitle !== (expected.metaTitle || null)) {
        throw new Error(`MetaTitle mismatch at ${actual.section} in ${actConfig.heading}`);
      }
    }
    console.log(`  ✅ All ${dbSections.length} sections verified matching exact titles, chapters, text, and ordering.`);
  }

  // Step 7: Verify Previous 4 Acts Remained Completely Untouched
  console.log('\n--- Step 7: Verifying Previous 4 Acts are Unchanged ---');
  for (const prevHeading of PREVIOUS_FOUR_ACTS) {
    const snap = previousActsSnapshot.get(prevHeading);
    if (!snap) {
      console.warn(`Note: Previously seeded act "${prevHeading}" was not present before this run.`);
      continue;
    }
    const currentAct = await prisma.act.findUnique({
      where: { id: snap.id },
      include: { _count: { select: { sections: true } } }
    });
    if (!currentAct) {
      throw new Error(`Previously seeded Act "${prevHeading}" was deleted or missing!`);
    }
    if (currentAct._count.sections !== snap.sectionCount) {
      throw new Error(`Previously seeded Act "${prevHeading}" section count changed! Was ${snap.sectionCount}, now ${currentAct._count.sections}`);
    }
    console.log(`  ✅ Unchanged: "${currentAct.heading}" (${currentAct.year}) with ${currentAct._count.sections} sections.`);
  }

  // Step 8: Testing Controller APIs for the 3 New Acts and Category
  console.log('\n--- Step 8: Testing Bearer Act APIs ---');
  const mockNext = (err) => {
    if (err) throw err;
  };

  // Test 8.1: getSingleBearerAct
  let bearerActApiResponse = null;
  await getSingleBearerAct(
    { params: { id: bearerAct.id } },
    {
      status: (code) => ({
        json: (data) => {
          bearerActApiResponse = { code, data };
          return data;
        }
      })
    },
    mockNext
  );

  console.log('\n1. getSingleBearerAct:');
  console.log(`   Status: ${bearerActApiResponse?.code}, Success: ${bearerActApiResponse?.data?.success}`);
  console.log(`   Category Name: "${bearerActApiResponse?.data?.data?.name}"`);
  console.log(`   Total Acts attached in payload: ${bearerActApiResponse?.data?.data?.acts?.length}`);
  if (bearerActApiResponse?.code !== 200 || !bearerActApiResponse?.data?.success) {
    throw new Error('getSingleBearerAct API test failed!');
  }

  // Test 8.2: getActsByBearerAct
  let actsListApiResponse = null;
  await getActsByBearerAct(
    {
      params: { id: bearerAct.id },
      query: { page: '1', limit: '20' }
    },
    {
      status: (code) => ({
        json: (data) => {
          actsListApiResponse = { code, data };
          return data;
        }
      })
    },
    mockNext
  );

  console.log('\n2. getActsByBearerAct:');
  console.log(`   Status: ${actsListApiResponse?.code}, Success: ${actsListApiResponse?.data?.success}`);
  console.log(`   Total Acts: ${actsListApiResponse?.data?.data?.length}`);
  if (actsListApiResponse?.code !== 200 || !actsListApiResponse?.data?.success) {
    throw new Error('getActsByBearerAct API test failed!');
  }

  // Test 8.3: For each of the 3 Acts test getSingleAct, getSectionsByAct, and getSingleSection
  for (let idx = 0; idx < NEW_ACTS_CONFIG.length; idx++) {
    const actConfig = NEW_ACTS_CONFIG[idx];
    const seeded = seededActs[idx];

    console.log(`\nTesting API endpoints for Act: "${actConfig.heading}" (ID: ${seeded.act.id})`);

    // A. getSingleAct
    let singleActResp = null;
    await getSingleAct(
      { params: { id: seeded.act.id } },
      {
        status: (code) => ({
          json: (data) => {
            singleActResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );

    console.log(`   a) getSingleAct: Status ${singleActResp?.code}, Sections count in payload: ${singleActResp?.data?.data?.sections?.length}`);
    if (singleActResp?.code !== 200 || singleActResp?.data?.data?.sections?.length !== actConfig.sections.length) {
      throw new Error(`getSingleAct failed for ${actConfig.heading}!`);
    }

    // B. getSectionsByAct (Pagination)
    let sectionsResp = null;
    await getSectionsByAct(
      {
        params: { id: seeded.act.id },
        query: { page: '1', limit: '100' }
      },
      {
        status: (code) => ({
          json: (data) => {
            sectionsResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );

    const apiSections = sectionsResp?.data?.data;
    console.log(`   b) getSectionsByAct: Status ${sectionsResp?.code}, Items returned: ${apiSections?.length}, Total: ${sectionsResp?.data?.pagination?.total}`);
    console.log(`      First section: ${apiSections?.[0]?.section} - ${apiSections?.[0]?.title}`);
    console.log(`      Last section: ${apiSections?.[apiSections.length - 1]?.section} - ${apiSections?.[apiSections.length - 1]?.title}`);

    if (sectionsResp?.code !== 200 || apiSections?.length !== actConfig.sections.length) {
      throw new Error(`getSectionsByAct failed for ${actConfig.heading}!`);
    }

    // Check ordering in API response (controller sorts by chapterNo asc, sectionOrder asc)
    for (let i = 1; i < apiSections.length; i++) {
      const prev = apiSections[i - 1];
      const curr = apiSections[i];
      if (curr.chapterNo < prev.chapterNo || (curr.chapterNo === prev.chapterNo && curr.sectionOrder < prev.sectionOrder)) {
        throw new Error(`Section ordering issue in ${actConfig.heading}: Section ${prev.section} (Ch ${prev.chapterNo}, order ${prev.sectionOrder}) vs Section ${curr.section} (Ch ${curr.chapterNo}, order ${curr.sectionOrder})`);
      }
    }
    console.log(`      ✅ Sections properly ordered by chapter & sectionOrder.`);

    // C. getSingleSection (First section)
    const firstSection = apiSections[0];
    let firstSecResp = null;
    await getSingleSection(
      { params: { id: firstSection.id } },
      {
        status: (code) => ({
          json: (data) => {
            firstSecResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );
    console.log(`   c) getSingleSection (${firstSection.section}): Status ${firstSecResp?.code}, Title: "${firstSecResp?.data?.data?.title}"`);
    if (firstSecResp?.code !== 200 || firstSecResp?.data?.data?.section !== firstSection.section) {
      throw new Error(`getSingleSection failed for ${firstSection.section} in ${actConfig.heading}!`);
    }

    // D. getSingleSection (Middle section)
    const midSection = apiSections[Math.floor(apiSections.length / 2)];
    let midSecResp = null;
    await getSingleSection(
      { params: { id: midSection.id } },
      {
        status: (code) => ({
          json: (data) => {
            midSecResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );
    console.log(`   d) getSingleSection (${midSection.section}): Status ${midSecResp?.code}, Title: "${midSecResp?.data?.data?.title}"`);
    if (midSecResp?.code !== 200 || midSecResp?.data?.data?.section !== midSection.section) {
      throw new Error(`getSingleSection failed for ${midSection.section} in ${actConfig.heading}!`);
    }
  }

  // Step 9: Final Category Summary
  console.log('\n--- Step 9: Final Category Summary ---');
  const allActsUnderCategory = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    include: {
      _count: { select: { sections: true } }
    },
    orderBy: { year: 'asc' }
  });

  console.log(`Total Acts under "${bearerAct.name}": ${allActsUnderCategory.length}`);
  for (const a of allActsUnderCategory) {
    console.log(` - ${a.heading} (${a.year}): ${a._count.sections} sections (ID: ${a.id})`);
  }

  console.log('\n================================================================');
  console.log(' ALL 3 REMAINING ACTS SEEDED, VERIFIED, TESTED SUCCESSFULLY!');
  console.log('================================================================');
}

main()
  .catch((err) => {
    console.error('Fatal error during execution:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
