import { PrismaClient } from '@prisma/client';
import { arbitrationConciliationBearerActSections } from '../prisma/arbitrationConciliationBearerActData.js';
import { legalServicesAuthoritiesBearerActSections } from '../prisma/legalServicesAuthoritiesBearerActData.js';
import { mediationBearerActSections } from '../prisma/mediationBearerActData.js';
import { indiaInternationalArbitrationCentreBearerActSections } from '../prisma/indiaInternationalArbitrationCentreBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';
import {
  getSingleBearerAct,
  getActsByBearerAct,
  getSingleAct,
  getSectionsByAct,
  getSingleSection
} from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

const CATEGORY_NAME = 'Arbitration & Alternative Dispute Resolution (ADR)';

const ACTS_CONFIG = [
  {
    heading: 'ARBITRATION AND CONCILIATION ACT, 1996',
    act: 'ARBITRATION AND CONCILIATION ACT, 1996',
    year: 1996,
    sections: arbitrationConciliationBearerActSections,
    searchTerms: ['ARBITRATION AND CONCILIATION ACT', 'ARBITRATION & CONCILIATION']
  },
  {
    heading: 'LEGAL SERVICES AUTHORITIES ACT, 1987',
    act: 'LEGAL SERVICES AUTHORITIES ACT, 1987',
    year: 1987,
    sections: legalServicesAuthoritiesBearerActSections,
    searchTerms: ['LEGAL SERVICES AUTHORITIES ACT']
  },
  {
    heading: 'THE MEDIATION ACT, 2023',
    act: 'THE MEDIATION ACT, 2023',
    year: 2023,
    sections: mediationBearerActSections,
    searchTerms: ['MEDIATION ACT']
  },
  {
    heading: 'INDIA INTERNATIONAL ARBITRATION CENTRE ACT, 2019',
    act: 'INDIA INTERNATIONAL ARBITRATION CENTRE ACT, 2019',
    year: 2019,
    sections: indiaInternationalArbitrationCentreBearerActSections,
    searchTerms: ['INDIA INTERNATIONAL ARBITRATION CENTRE']
  }
];

async function main() {
  console.log('================================================================');
  console.log(' TARGETED SEEDING & VERIFICATION FOR 4 ADR ACTS');
  console.log(` Target Category: "${CATEGORY_NAME}"`);
  console.log('================================================================\n');

  // Step 1: Validate JSON source data for all 4 Acts
  console.log('--- Step 1: Validating JSON Data for 4 Acts ---');
  for (const actConfig of ACTS_CONFIG) {
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
    for (const [chNo, chName] of Array.from(chaptersMap.entries()).sort((a, b) => a[0] - b[0])) {
      console.log(`    Chapter ${chNo}: ${chName}`);
    }
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

      if (!existing) {
        toCreate.push({
          actId: act.id,
          section: item.section,
          sectionOrder: sectionOrder,
          chapterNo: item.chapterNo,
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
            chapterNo: item.chapterNo,
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
  console.log('\n--- Step 4: Executing First Seed Run for all 4 Acts ---');
  const seededActs = [];
  for (const actConfig of ACTS_CONFIG) {
    const result = await seedAct(actConfig);
    seededActs.push(result);
    console.log(`Result for ${actConfig.heading}: ${result.createdCount} sections created, ${result.updatedCount} sections updated.`);
  }

  // Step 5: Execute Second Seed Run (Idempotency & Duplicate Check)
  console.log('\n--- Step 5: Executing Second Seed Run (Testing Idempotency & Duplicate Prevention) ---');
  for (const actConfig of ACTS_CONFIG) {
    const rerunResult = await seedAct(actConfig);
    console.log(`Rerun for ${actConfig.heading}: ${rerunResult.createdCount} created, ${rerunResult.updatedCount} updated.`);
    if (rerunResult.createdCount !== 0) {
      throw new Error(`Duplicate check FAILED for "${actConfig.heading}": ${rerunResult.createdCount} sections created on rerun!`);
    }
  }
  console.log('✅ Duplicate check PASSED for all 4 Acts: 0 duplicates created on rerun.');

  // Step 6: Verify Database Records and Content Accuracy
  console.log('\n--- Step 6: Verifying Chapter & Section Data & Sorting Order for each Act ---');
  for (let idx = 0; idx < ACTS_CONFIG.length; idx++) {
    const actConfig = ACTS_CONFIG[idx];
    const seeded = seededActs[idx];

    const dbSections = await prisma.actSection.findMany({
      where: { actId: seeded.act.id },
      orderBy: [
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

      if (actual.section !== expected.section) {
        throw new Error(`Section mismatch at index ${i} in ${actConfig.heading}: DB had "${actual.section}", expected "${expected.section}"`);
      }
      if (actual.title !== expected.title) {
        throw new Error(`Title mismatch at ${actual.section} in ${actConfig.heading}: DB had "${actual.title}", expected "${expected.title}"`);
      }
      if (actual.chapterNo !== expected.chapterNo) {
        throw new Error(`ChapterNo mismatch at ${actual.section} in ${actConfig.heading}: DB had ${actual.chapterNo}, expected ${expected.chapterNo}`);
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
    console.log(`  ✅ All ${dbSections.length} sections verified matching exact titles, chapters, text, and numerical ordering.`);
  }

  // Step 7: Testing Controller APIs for all 4 Acts
  console.log('\n--- Step 7: Testing Bearer Act APIs for All 4 Acts ---');
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
  if (bearerActApiResponse?.code !== 200 || !bearerActApiResponse?.data?.success || bearerActApiResponse?.data?.data?.acts?.length !== 4) {
    throw new Error(`getSingleBearerAct API test failed! Expected 4 acts, got ${bearerActApiResponse?.data?.data?.acts?.length}`);
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
  if (actsListApiResponse?.code !== 200 || !actsListApiResponse?.data?.success || actsListApiResponse?.data?.data?.length !== 4) {
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

    // D. getSingleSection (Middle/Alphanumeric or specific section if exists)
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

  // Step 8: Category and Database Integrity Check
  console.log('\n--- Step 8: Verifying All Acts Under Category & Database Integrity ---');
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
  console.log(' ALL 4 ADR ACTS SEEDED, DEDUPLICATED, AND TESTED SUCCESSFULLY!');
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
