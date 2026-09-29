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
  getSingleSection,
  searchGlobalBearerActs
} from '../src/controllers/bearerAct.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Helper to load JSON files from prisma directory
const loadJson = (filename) => {
  const filepath = path.join(__dirname, '../prisma', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
};

const TARGET_ACTS_CONFIG = [
  {
    heading: 'THE BANKING REGULATION ACT, 1949',
    act: 'THE BANKING REGULATION ACT, 1949',
    year: 1949,
    jsonFile: 'banking_regulation_act_1949.json',
    expectedSections: 133,
    expectedChapters: 11,
    searchTerms: ['THE BANKING REGULATION ACT', 'BANKING REGULATION ACT', 'BANKING REGULATION']
  },
  {
    heading: 'THE INSOLVENCY AND BANKRUPTCY CODE, 2016',
    act: 'THE INSOLVENCY AND BANKRUPTCY CODE, 2016',
    year: 2016,
    jsonFile: 'insolvency_and_bankruptcy_code_2016.json',
    expectedSections: 283,
    expectedChapters: 20,
    searchTerms: ['THE INSOLVENCY AND BANKRUPTCY CODE', 'INSOLVENCY AND BANKRUPTCY CODE', 'INSOLVENCY']
  },
  {
    heading: 'THE SECURITISATION AND RECONSTRUCTION OF FINANCIAL ASSETS AND ENFORCEMENT OF SECURITY INTEREST ACT, 2002',
    act: 'THE SECURITISATION AND RECONSTRUCTION OF FINANCIAL ASSETS AND ENFORCEMENT OF SECURITY INTEREST ACT, 2002',
    year: 2002,
    jsonFile: 'securitisation_and_reconstruction_of_financial_assets_and_enforcement_of_security_interest_act__2002.json',
    expectedSections: 48,
    expectedChapters: 6,
    searchTerms: ['THE SECURITISATION AND RECONSTRUCTION OF FINANCIAL ASSETS', 'SECURITISATION AND RECONSTRUCTION', 'SECURITISATION']
  }
];

// Helper key for section uniqueness: (section, title, truncated chapterNo)
const getSectionKey = (item) => {
  const chNo = typeof item.chapterNo === 'number' ? Math.trunc(item.chapterNo) : parseInt(item.chapterNo, 10);
  return `${item.section.trim()}:::${(item.title || '').trim()}:::${chNo}`;
};

export async function seedAndTestTargetInsolvencyActs() {
  console.log('================================================================');
  console.log(' SEEDING & TESTING: 3 ACTS (INSOLVENCY, BANKING & DEBT RECOVERY)');
  console.log(' 1. Banking Regulation Act, 1949');
  console.log(' 2. Insolvency and Bankruptcy Code, 2016');
  console.log(' 3. Securitisation and Reconstruction (SARFAESI) Act, 2002');
  console.log('================================================================\n');

  // Step 1: Validate Source JSON Files
  console.log('--- Step 1: Validating Source JSON Files ---');
  for (const actConfig of TARGET_ACTS_CONFIG) {
    actConfig.sections = loadJson(actConfig.jsonFile);
    console.log(`\nValidating "${actConfig.heading}":`);
    console.log(`  Source file: ${actConfig.jsonFile}`);
    console.log(`  Total sections in JSON: ${actConfig.sections.length} (Expected: ${actConfig.expectedSections})`);

    if (actConfig.sections.length !== actConfig.expectedSections) {
      throw new Error(`Section count mismatch for ${actConfig.heading}: expected ${actConfig.expectedSections}, got ${actConfig.sections.length}`);
    }

    const chaptersMap = new Map();
    const sectionKeys = new Set();
    for (let i = 0; i < actConfig.sections.length; i++) {
      const item = actConfig.sections[i];
      if (!item.section || item.chapterNo === undefined || !item.chapterName || item.description === undefined) {
        throw new Error(`Invalid JSON item at index ${i} for ${actConfig.heading}: ${JSON.stringify(item)}`);
      }
      const key = getSectionKey(item);
      if (sectionKeys.has(key)) {
        throw new Error(`Duplicate section key found in JSON for ${actConfig.heading}: ${key}`);
      }
      sectionKeys.add(key);

      const chKey = `${item.chapterNo}:::${item.chapterName}`;
      if (!chaptersMap.has(chKey)) {
        chaptersMap.set(chKey, { chapterNo: item.chapterNo, chapterName: item.chapterName });
      }
    }

    actConfig.chapterCount = chaptersMap.size;
    console.log(`  Unique chapters found: ${chaptersMap.size} (Expected: ${actConfig.expectedChapters})`);
    if (actConfig.chapterCount !== actConfig.expectedChapters) {
      throw new Error(`Chapter count mismatch for ${actConfig.heading}: expected ${actConfig.expectedChapters}, got ${actConfig.chapterCount}`);
    }

    for (const [chKey, chVal] of Array.from(chaptersMap.entries())) {
      console.log(`    Chapter ${chVal.chapterNo}: ${chVal.chapterName}`);
    }
  }

  // Step 2: Verify BearerAct Category
  console.log('\n--- Step 2: Target BearerAct Category Verification ---');
  const bearerAct = await prisma.bearerAct.findFirst({
    where: {
      OR: [
        { id: '8f12e880-7a6f-46a1-883d-cda11c938e64' },
        { name: 'Insolvency, Banking, & Debt Recovery' },
        { name: 'Insolvency, Banking & Debt Recovery' }
      ]
    },
    include: {
      acts: { select: { id: true, heading: true, year: true } }
    }
  });

  if (!bearerAct) {
    throw new Error('BearerAct category for "Insolvency, Banking, & Debt Recovery" not found!');
  }
  console.log(`Reusing BearerAct Category: "${bearerAct.name}" (ID: ${bearerAct.id})`);
  console.log(`Currently existing Acts in category before seed: ${bearerAct.acts.length}`);
  bearerAct.acts.forEach(a => console.log(`  - ${a.heading} (${a.year})`));

  // Step 3: Targeted Seed Function for a given Act
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
    const sectionMap = new Map(existingSections.map(s => [getSectionKey(s), s]));

    const toCreate = [];
    const toUpdate = [];
    const baseTime = Date.now();

    for (let i = 0; i < actConfig.sections.length; i++) {
      const item = actConfig.sections[i];
      const key = getSectionKey(item);
      const existing = sectionMap.get(key);
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
          metaTitle: item.metaTitle || null,
          createdAt: new Date(baseTime + i * 10)
        });
      } else {
        toUpdate.push({
          id: existing.id,
          data: {
            section: item.section,
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
  console.log('\n--- Step 4: Executing First Seed Run for the 3 Acts ---');
  const seededActs = [];
  for (const actConfig of TARGET_ACTS_CONFIG) {
    const result = await seedAct(actConfig);
    seededActs.push(result);
    console.log(`Result for ${actConfig.heading}: ${result.createdCount} sections created, ${result.updatedCount} sections updated.`);
  }

  // Step 5: Execute Second Seed Run (Testing Idempotency & Duplicate Prevention)
  console.log('\n--- Step 5: Executing Second Seed Run (Duplicate & Idempotency Check) ---');
  for (const actConfig of TARGET_ACTS_CONFIG) {
    const rerunResult = await seedAct(actConfig);
    console.log(`Rerun for ${actConfig.heading}: ${rerunResult.createdCount} created, ${rerunResult.updatedCount} updated.`);
    if (rerunResult.createdCount !== 0) {
      throw new Error(`Duplicate check FAILED for "${actConfig.heading}": ${rerunResult.createdCount} sections created on rerun!`);
    }
  }

  // Check Act record count under category: exactly 6 Acts
  const actsUnderCategoryAfterRerun = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    include: { _count: { select: { sections: true } } },
    orderBy: { year: 'asc' }
  });
  console.log(`Total Acts under category after seed: ${actsUnderCategoryAfterRerun.length}`);
  actsUnderCategoryAfterRerun.forEach(a => {
    console.log(`  - ${a.heading} (${a.year}): ${a._count.sections} sections`);
  });
  if (actsUnderCategoryAfterRerun.length !== 6) {
    throw new Error(`Expected exactly 6 Acts under category, found ${actsUnderCategoryAfterRerun.length}`);
  }
  console.log('Duplicate check PASSED: 0 duplicate sections, exactly 6 Acts exist under category.');

  // Step 6: Verify Database Records and Content Accuracy
  console.log('\n--- Step 6: Verifying Chapter & Section Data & Ordering for each Act ---');
  for (let idx = 0; idx < TARGET_ACTS_CONFIG.length; idx++) {
    const actConfig = TARGET_ACTS_CONFIG[idx];
    const seeded = seededActs[idx];

    // Verify BearerAct relationship
    const actWithBearer = await prisma.act.findUnique({
      where: { id: seeded.act.id },
      include: { bearerAct: true }
    });
    if (actWithBearer.bearerActId !== bearerAct.id || actWithBearer.bearerAct.name !== bearerAct.name) {
      throw new Error(`BearerAct relationship failed for ${actConfig.heading}!`);
    }

    const dbSections = await prisma.actSection.findMany({
      where: { actId: seeded.act.id },
      orderBy: [
        { createdAt: 'asc' }
      ]
    });

    console.log(`\nVerifying DB sections for ${actConfig.heading}:`);
    console.log(`  Expected sections: ${actConfig.sections.length}`);
    console.log(`  Actual DB sections: ${dbSections.length}`);

    if (dbSections.length !== actConfig.sections.length) {
      throw new Error(`Count mismatch for ${actConfig.heading}: expected ${actConfig.sections.length}, got ${dbSections.length}`);
    }

    // Verify unique chapters count
    const dbChapterPairs = new Set(dbSections.map(s => `${s.chapterNo}:::${s.chapterName}`));
    if (dbChapterPairs.size !== actConfig.chapterCount) {
      throw new Error(`Chapter count mismatch in DB for ${actConfig.heading}: expected ${actConfig.chapterCount}, got ${dbChapterPairs.size}`);
    }
    console.log(`  Unique chapters in DB: ${dbChapterPairs.size} (matches expected ${actConfig.chapterCount})`);

    // Verify exact content integrity & non-decreasing sectionOrder within chapters
    let prevChapter = -1;
    let lastOrder = -1;
    for (let i = 0; i < actConfig.sections.length; i++) {
      const expected = actConfig.sections[i];
      const actual = dbSections[i];

      if (actual.chapterNo !== prevChapter) {
        prevChapter = actual.chapterNo;
        lastOrder = -1;
      }

      if (actual.sectionOrder < lastOrder) {
        throw new Error(`Section ordering violation at ${actual.section}: current order ${actual.sectionOrder} < previous ${lastOrder}`);
      }
      lastOrder = actual.sectionOrder;

      if (actual.section !== expected.section) {
        throw new Error(`Section mismatch at index ${i} for ${actConfig.heading}: expected "${expected.section}", got "${actual.section}"`);
      }
      if (actual.title !== expected.title) {
        throw new Error(`Title mismatch at index ${i} (${expected.section}) for ${actConfig.heading}: expected "${expected.title}", got "${actual.title}"`);
      }
      if (actual.description !== expected.description) {
        throw new Error(`Description mismatch at index ${i} (${expected.section}) for ${actConfig.heading}`);
      }
      const expChapterNo = typeof expected.chapterNo === 'number' ? Math.trunc(expected.chapterNo) : parseInt(expected.chapterNo, 10);
      if (actual.chapterNo !== expChapterNo) {
        throw new Error(`ChapterNo mismatch at ${expected.section} for ${actConfig.heading}: expected ${expChapterNo}, got ${actual.chapterNo}`);
      }
      if (actual.chapterName !== expected.chapterName) {
        throw new Error(`ChapterName mismatch at ${expected.section} for ${actConfig.heading}`);
      }
      if ((actual.metaData || null) !== (expected.metaData || null)) {
        throw new Error(`MetaData mismatch at ${expected.section} for ${actConfig.heading}`);
      }
      if ((actual.metaDescription || null) !== (expected.metaDescription || null)) {
        throw new Error(`MetaDescription mismatch at ${expected.section} for ${actConfig.heading}`);
      }
      if ((actual.metaTitle || null) !== (expected.metaTitle || null)) {
        throw new Error(`MetaTitle mismatch at ${expected.section} for ${actConfig.heading}`);
      }
    }
    console.log(`  All ${dbSections.length} sections and ${dbChapterPairs.size} chapters verified with 100% exact text match and valid ordering!`);
  }

  // Step 7: Controller & API Endpoint Testing
  console.log('\n--- Step 7: Testing Controller API Endpoints ---');

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
  if (bearerActApiResponse?.code !== 200 || !bearerActApiResponse?.data?.success || bearerActApiResponse?.data?.data?.acts?.length !== 6) {
    throw new Error(`getSingleBearerAct API test failed! Expected 6 acts, got ${bearerActApiResponse?.data?.data?.acts?.length}`);
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
  if (actsListApiResponse?.code !== 200 || !actsListApiResponse?.data?.success || actsListApiResponse?.data?.data?.length !== 6) {
    throw new Error('getActsByBearerAct API test failed!');
  }

  // Test 7.3: For each of the 3 Acts test getSingleAct, getSectionsByAct, and getSingleSection
  for (let idx = 0; idx < TARGET_ACTS_CONFIG.length; idx++) {
    const actConfig = TARGET_ACTS_CONFIG[idx];
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

    // B. getSectionsByAct (Pagination page 1, limit 100 to retrieve sections)
    let sectionsPaginatedResp = null;
    await getSectionsByAct(
      {
        params: { id: seeded.act.id },
        query: { page: '1', limit: '100' }
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

    // C. getSingleSection (test first, middle, and last section)
    const firstSec = returnedAct.sections[0];
    const midSec = returnedAct.sections[Math.floor(returnedAct.sections.length / 2)];
    const lastSec = returnedAct.sections[returnedAct.sections.length - 1];

    for (const targetSec of [firstSec, midSec, lastSec]) {
      let singleSectionResp = null;
      await getSingleSection(
        { params: { id: targetSec.id } },
        {
          status: (code) => ({
            json: (data) => {
              singleSectionResp = { code, data };
              return data;
            }
          })
        },
        mockNext
      );

      if (singleSectionResp?.code !== 200 || !singleSectionResp?.data?.success) {
        throw new Error(`getSingleSection API failed for ${targetSec.section}`);
      }
      console.log(`   getSingleSection: Status 200, Verified "${singleSectionResp.data.data.section}" - "${singleSectionResp.data.data.title}"`);
    }
  }

  // Test 7.4: Global search
  console.log('\nTesting searchGlobalBearerActs for target acts:');
  const testSearches = [
    { query: 'Banking Regulation', expectedTerm: 'BANKING REGULATION' },
    { query: 'Insolvency and Bankruptcy', expectedTerm: 'INSOLVENCY' },
    { query: 'Securitisation and Reconstruction', expectedTerm: 'SECURITISATION' }
  ];

  for (const s of testSearches) {
    let searchResp = null;
    await searchGlobalBearerActs(
      { query: { q: s.query, page: '1', limit: '5' } },
      {
        status: (code) => ({
          json: (data) => {
            searchResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );

    if (searchResp?.code !== 200 || !searchResp?.data?.success) {
      throw new Error(`searchGlobalBearerActs failed for query "${s.query}"`);
    }
    console.log(`   Search "${s.query}": Status 200, Total Matches: ${searchResp.data.pagination.total}`);
    if (searchResp.data.pagination.total === 0) {
      throw new Error(`searchGlobalBearerActs returned 0 results for "${s.query}"`);
    }
  }

  console.log('\n================================================================');
  console.log(' ALL SEEDING, IDEMPOTENCY, AND API TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');

  await prisma.$disconnect();
}

seedAndTestTargetInsolvencyActs().catch(async (e) => {
  console.error('Execution FAILED with error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
