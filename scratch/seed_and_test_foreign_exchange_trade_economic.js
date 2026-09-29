import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';
import {
  getSingleBearerAct,
  getActsByBearerAct,
  getSingleAct,
  getSectionsByAct,
  getSingleSection
} from '../src/controllers/bearerAct.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const CATEGORY_NAME = 'Foreign Exchange, Trade & Economic';

// Load JSON data directly from the prisma directory
const loadJson = (filename) => {
  const filepath = path.join(__dirname, '../prisma', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
};

const ACTS_CONFIG = [
  {
    heading: 'THE COMPETITION ACT, 2002',
    act: 'THE COMPETITION ACT, 2002',
    year: 2002,
    jsonFile: 'competition_act_2002.json',
    expectedSections: 95,
    searchTerms: ['COMPETITION ACT']
  },
  {
    heading: 'THE FOREIGN EXCHANGE MANAGEMENT ACT, 2002',
    act: 'THE FOREIGN EXCHANGE MANAGEMENT ACT, 2002',
    year: 2002,
    jsonFile: 'foreign_exchange_management_act_2002.json',
    expectedSections: 52,
    searchTerms: ['FOREIGN EXCHANGE MANAGEMENT ACT']
  },
  {
    heading: 'THE FOREIGN TRADE (DEVELOPMENT AND REGULATION) ACT, 1992',
    act: 'THE FOREIGN TRADE (DEVELOPMENT AND REGULATION) ACT, 1992',
    year: 1992,
    jsonFile: 'foreign_trade_development_and_regulations_act_1992.json',
    expectedSections: 29,
    searchTerms: ['FOREIGN TRADE (DEVELOPMENT AND REGULATION) ACT', 'FOREIGN TRADE']
  },
  {
    heading: 'THE FUGITIVE ECONOMIC OFFENDERS ACT, 2018',
    act: 'THE FUGITIVE ECONOMIC OFFENDERS ACT, 2018',
    year: 2018,
    jsonFile: 'fugitive_economic_offender_act_2018.json',
    expectedSections: 26,
    searchTerms: ['FUGITIVE ECONOMIC OFFENDERS ACT', 'FUGITIVE ECONOMIC OFFENDER']
  },
  {
    heading: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
    act: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002',
    year: 2002,
    jsonFile: 'prevention_of_money_laundering_act__2002.json',
    expectedSections: 81,
    searchTerms: ['PREVENTION OF MONEY-LAUNDERING ACT', 'MONEY-LAUNDERING']
  }
];

export async function seedAndTestForeignExchangeTradeEconomicActs() {
  console.log('================================================================');
  console.log(' SEEDING & TESTING: FOREIGN EXCHANGE, TRADE & ECONOMIC ACTS');
  console.log(` Target Category: "${CATEGORY_NAME}"`);
  console.log('================================================================\n');

  // Step 1: Validate JSON source data for all 5 Acts
  console.log('--- Step 1: Validating Source JSON Files ---');
  for (const actConfig of ACTS_CONFIG) {
    actConfig.sections = loadJson(actConfig.jsonFile);
    console.log(`\nValidating "${actConfig.heading}":`);
    console.log(`  Source file: ${actConfig.jsonFile}`);
    console.log(`  Total sections in JSON: ${actConfig.sections.length} (Expected: ${actConfig.expectedSections})`);

    if (actConfig.sections.length !== actConfig.expectedSections) {
      throw new Error(`Section count mismatch for ${actConfig.heading}: expected ${actConfig.expectedSections}, got ${actConfig.sections.length}`);
    }

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

    actConfig.chapterCount = chaptersMap.size;
    console.log(`  Unique chapters found: ${chaptersMap.size}`);
    for (const [chNo, chName] of Array.from(chaptersMap.entries())) {
      console.log(`    Chapter ${chNo}: ${chName}`);
    }
  }

  // Step 2: Verify BearerAct Category
  console.log('\n--- Step 2: Target BearerAct Category Verification ---');
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
    select: { id: true, heading: true, year: true }
  });
  console.log(`Existing Acts under "${bearerAct.name}" before seed (${existingActsBefore.length}):`, existingActsBefore.map(a => `${a.heading} (${a.year})`));

  // Step 3: Seed Function for a given Act
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

  // Step 4: Execute First Seed Run
  console.log('\n--- Step 4: Executing First Seed Run for all 5 Acts ---');
  const seededActs = [];
  for (const actConfig of ACTS_CONFIG) {
    const result = await seedAct(actConfig);
    seededActs.push(result);
    console.log(`Result for ${actConfig.heading}: ${result.createdCount} sections created, ${result.updatedCount} sections updated.`);
  }

  // Step 5: Execute Second Seed Run (Testing Idempotency & Duplicate Prevention)
  console.log('\n--- Step 5: Executing Second Seed Run (Duplicate & Idempotency Check) ---');
  for (const actConfig of ACTS_CONFIG) {
    const rerunResult = await seedAct(actConfig);
    console.log(`Rerun for ${actConfig.heading}: ${rerunResult.createdCount} created, ${rerunResult.updatedCount} updated.`);
    if (rerunResult.createdCount !== 0) {
      throw new Error(`Duplicate check FAILED for "${actConfig.heading}": ${rerunResult.createdCount} sections created on rerun!`);
    }
  }

  // Check Act record count under category
  const actsUnderCategoryAfterRerun = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id }
  });
  if (actsUnderCategoryAfterRerun.length !== ACTS_CONFIG.length) {
    throw new Error(`Expected exactly ${ACTS_CONFIG.length} Acts under category, found ${actsUnderCategoryAfterRerun.length}`);
  }
  console.log(`✅ Duplicate check PASSED for all Acts: 0 duplicate sections, exactly ${ACTS_CONFIG.length} Acts exist under category.`);

  // Step 6: Verify Database Records and Content Accuracy
  console.log('\n--- Step 6: Verifying Chapter & Section Data & Sorting Order for each Act ---');
  for (let idx = 0; idx < ACTS_CONFIG.length; idx++) {
    const actConfig = ACTS_CONFIG[idx];
    const seeded = seededActs[idx];

    // Verify BearerAct relationship
    const actWithBearer = await prisma.act.findUnique({
      where: { id: seeded.act.id },
      include: { bearerAct: true }
    });
    if (actWithBearer.bearerActId !== bearerAct.id || actWithBearer.bearerAct.name !== CATEGORY_NAME) {
      throw new Error(`BearerAct relationship failed for ${actConfig.heading}!`);
    }

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

  // Step 7: Testing Controller APIs for all Acts
  console.log('\n--- Step 7: Testing Bearer Act APIs for All Acts ---');
  const mockNext = (err) => {
    if (err) throw err;
  };

  // Test 7.1: getSingleBearerAct
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
  console.log(`   Acts attached in payload: ${bearerActApiResponse?.data?.data?.acts?.length}`);
  if (bearerActApiResponse?.code !== 200 || !bearerActApiResponse?.data?.success || bearerActApiResponse?.data?.data?.acts?.length !== ACTS_CONFIG.length) {
    throw new Error(`getSingleBearerAct API test failed! Expected ${ACTS_CONFIG.length} acts, got ${bearerActApiResponse?.data?.data?.acts?.length}`);
  }

  // Test 7.2: getActsByBearerAct
  let actsListApiResponse = null;
  await getActsByBearerAct(
    {
      params: { id: bearerAct.id },
      query: { page: '1', limit: '10' }
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
  if (actsListApiResponse?.code !== 200 || !actsListApiResponse?.data?.success || actsListApiResponse?.data?.data?.length !== ACTS_CONFIG.length) {
    throw new Error('getActsByBearerAct API test failed!');
  }

  // Test 7.3: For each Act test getSingleAct, getSectionsByAct, and getSingleSection
  for (let idx = 0; idx < ACTS_CONFIG.length; idx++) {
    const actConfig = ACTS_CONFIG[idx];
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

    if (singleActResp?.code !== 200 || !singleActResp?.data?.success) {
      throw new Error(`getSingleAct API failed for ${actConfig.heading}`);
    }
    const returnedAct = singleActResp.data.data;
    console.log(`   getSingleAct: Status 200, Heading: "${returnedAct.heading}", Sections: ${returnedAct.sections.length}`);
    if (returnedAct.sections.length !== actConfig.sections.length) {
      throw new Error(`getSingleAct sections count mismatch: expected ${actConfig.sections.length}, got ${returnedAct.sections.length}`);
    }

    // B. getSectionsByAct (Pagination page 1, limit 15)
    let sectionsPaginatedResp = null;
    await getSectionsByAct(
      {
        params: { id: seeded.act.id },
        query: { page: '1', limit: '15' }
      },
      {
        status: (code) => ({
          json: (data) => {
            sectionsPaginatedResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );

    if (sectionsPaginatedResp?.code !== 200 || !sectionsPaginatedResp?.data?.success) {
      throw new Error(`getSectionsByAct API failed for ${actConfig.heading}`);
    }
    console.log(`   getSectionsByAct: Status 200, Total: ${sectionsPaginatedResp.data.pagination.total}, Page Items: ${sectionsPaginatedResp.data.data.length}`);
    if (sectionsPaginatedResp.data.pagination.total !== actConfig.sections.length) {
      throw new Error(`getSectionsByAct pagination total mismatch: expected ${actConfig.sections.length}, got ${sectionsPaginatedResp.data.pagination.total}`);
    }

    // C. getSingleSection (test first and last section)
    const firstSec = returnedAct.sections[0];
    const lastSec = returnedAct.sections[returnedAct.sections.length - 1];

    for (const targetSec of [firstSec, lastSec]) {
      let singleSecResp = null;
      await getSingleSection(
        { params: { id: targetSec.id } },
        {
          status: (code) => ({
            json: (data) => {
              singleSecResp = { code, data };
              return data;
            }
          })
        },
        mockNext
      );

      if (singleSecResp?.code !== 200 || !singleSecResp?.data?.success) {
        throw new Error(`getSingleSection API failed for ${targetSec.section} in ${actConfig.heading}`);
      }
      console.log(`   getSingleSection: Status 200, Section: "${singleSecResp.data.data.section}", Title: "${singleSecResp.data.data.title.substring(0, 40)}..."`);
    }
  }

  console.log('\n================================================================');
  console.log(' ALL 5 ACTS SEEDED, VERIFIED, AND API TESTED SUCCESSFULLY!');
  console.log('================================================================\n');

  return {
    category: CATEGORY_NAME,
    bearerActId: bearerAct.id,
    acts: ACTS_CONFIG.map((a, i) => ({
      name: a.heading,
      actId: seededActs[i].act.id,
      year: a.year,
      chapterCount: a.chapterCount,
      sectionCount: a.sections.length
    }))
  };
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedAndTestForeignExchangeTradeEconomicActs()
    .then((summary) => {
      console.log('Summary Output:', JSON.stringify(summary, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Execution Failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
