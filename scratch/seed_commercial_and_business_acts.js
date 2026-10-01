import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

const prisma = new PrismaClient();

const CATEGORY_NAME = 'Commercial and Business';

const ACTS_CONFIG = [
  {
    heading: 'THE INSOLVENCY AND BANKRUPTCY CODE, 2016',
    act: 'THE INSOLVENCY AND BANKRUPTCY CODE, 2016',
    year: 2016,
    file: 'prisma/the_insolvency_and_bankruptcy_code__2016.json',
    expectedSections: 262
  },
  {
    heading: 'THE COMMERCIAL COURTS ACT, 2015',
    act: 'THE COMMERCIAL COURTS ACT, 2015',
    year: 2015,
    file: 'prisma/commercial_courts_act_2015.json',
    expectedSections: 26
  },
  {
    heading: 'THE LIMITED LIABILITY PARTNERSHIP ACT, 2008',
    act: 'THE LIMITED LIABILITY PARTNERSHIP ACT, 2008',
    year: 2008,
    file: 'prisma/limited_liability_partnership_act_2008.json',
    expectedSections: 88
  },
  {
    heading: 'THE SECURITIES AND EXCHANGE BOARD OF INDIA ACT, 1992',
    act: 'THE SECURITIES AND EXCHANGE BOARD OF INDIA ACT, 1992',
    year: 1992,
    file: 'prisma/securities_and_exchange_board_of_india_act_1992.json',
    expectedSections: 90
  },
  {
    heading: 'THE SPECIFIC RELIEF ACT, 1963',
    act: 'THE SPECIFIC RELIEF ACT, 1963',
    year: 1963,
    file: 'prisma/Specific_relief_act_1963.json',
    expectedSections: 48
  }
];

export async function seedCommercialAndBusinessActs() {
  console.log('===============================================================');
  console.log(' SEEDING 5 ACTS UNDER CATEGORY: "Commercial and Business"');
  console.log('===============================================================\n');

  // Step 1: Verify JSON Data Files
  console.log('--- Step 1: Verifying JSON Source Files ---');
  const loadedData = [];
  for (const actConfig of ACTS_CONFIG) {
    const raw = fs.readFileSync(actConfig.file, 'utf8');
    const sections = JSON.parse(raw);
    console.log(`✓ [${actConfig.heading}] Loaded ${sections.length} sections from ${actConfig.file}`);
    if (sections.length !== actConfig.expectedSections) {
      throw new Error(`Section count mismatch in ${actConfig.file}: expected ${actConfig.expectedSections}, got ${sections.length}`);
    }
    
    // Validate each section object
    const chaptersMap = new Map();
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (!s.section || !s.title || !s.description || s.chapterNo === undefined || !s.chapterName) {
        throw new Error(`Invalid section structure at index ${i} in ${actConfig.file}`);
      }
      const chNoInt = typeof s.chapterNo === 'number' ? Math.trunc(s.chapterNo) : parseInt(s.chapterNo, 10);
      if (isNaN(chNoInt) || chNoInt < 0) {
        throw new Error(`Invalid chapterNo "${s.chapterNo}" for ${s.section} in ${actConfig.file}`);
      }
      if (!chaptersMap.has(s.chapterName)) {
        chaptersMap.set(s.chapterName, chNoInt);
      }
    }
    console.log(`  -> Validated ${chaptersMap.size} unique chapters.`);
    loadedData.push({ config: actConfig, sections, chaptersMap });
  }

  // Step 2: Target Category Verification
  console.log('\n--- Step 2: Target Category Verification ---');
  const bearerAct = await prisma.bearerAct.findUnique({
    where: { name: CATEGORY_NAME }
  });

  if (!bearerAct) {
    throw new Error(`Category "${CATEGORY_NAME}" not found in BearerAct table!`);
  }
  console.log(`✓ Found BearerAct Category: "${bearerAct.name}" (ID: ${bearerAct.id})`);

  // Step 3: Targeted Seeding Function
  const seedActs = async () => {
    const results = [];

    for (const { config, sections } of loadedData) {
      // Find or create the Act under this specific BearerAct category
      let act = await prisma.act.findFirst({
        where: {
          bearerActId: bearerAct.id,
          heading: config.heading
        }
      });

      if (!act) {
        act = await prisma.act.create({
          data: {
            bearerActId: bearerAct.id,
            heading: config.heading,
            act: config.act,
            year: config.year
          }
        });
        console.log(`  + Created Act: "${act.heading}" (${act.year}) [ID: ${act.id}]`);
      } else {
        act = await prisma.act.update({
          where: { id: act.id },
          data: {
            heading: config.heading,
            act: config.act,
            year: config.year
          }
        });
        console.log(`  ~ Updated/Matched Act: "${act.heading}" (${act.year}) [ID: ${act.id}]`);
      }

      // Fetch existing sections for this Act
      const existingSections = await prisma.actSection.findMany({
        where: { actId: act.id }
      });
      const sectionMap = new Map(existingSections.map(s => [s.section, s]));

      const toCreate = [];
      const toUpdate = [];

      for (const item of sections) {
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

      results.push({
        act,
        createdCount: toCreate.length,
        updatedCount: toUpdate.length,
        totalExpected: sections.length
      });
    }

    return results;
  };

  console.log('\n--- Step 3: Executing Targeted Seed (Pass 1) ---');
  const pass1Results = await seedActs();
  for (const res of pass1Results) {
    console.log(`  -> ${res.act.heading}: ${res.createdCount} created, ${res.updatedCount} updated.`);
  }

  // Step 4: Testing Idempotency
  console.log('\n--- Step 4: Testing Idempotency (Pass 2) ---');
  const pass2Results = await seedActs();
  for (const res of pass2Results) {
    console.log(`  -> ${res.act.heading}: ${res.createdCount} created, ${res.updatedCount} updated.`);
    if (res.createdCount !== 0) {
      throw new Error(`Idempotency failure on ${res.act.heading}: ${res.createdCount} records created on rerun!`);
    }
  }
  console.log('✓ Idempotency verified: 0 duplicate records created on rerun.');

  // Step 5: Comprehensive Data Integrity & Ordering Verification
  console.log('\n--- Step 5: Verifying Section Counts, Ordering, & Data Integrity ---');
  for (const { config, sections, chaptersMap } of loadedData) {
    const actInDb = await prisma.act.findFirst({
      where: {
        bearerActId: bearerAct.id,
        heading: config.heading
      },
      include: {
        sections: {
          orderBy: [
            { chapterNo: 'asc' },
            { sectionOrder: 'asc' },
            { id: 'asc' }
          ]
        }
      }
    });

    if (!actInDb) {
      throw new Error(`Act not found in database: ${config.heading}`);
    }

    if (actInDb.sections.length !== config.expectedSections) {
      throw new Error(`Count mismatch for ${config.heading}: expected ${config.expectedSections}, found in DB ${actInDb.sections.length}`);
    }

    // Verify ordering and content
    // Map sections by section string
    const dbSectionMap = new Map(actInDb.sections.map(s => [s.section, s]));
    for (let i = 0; i < sections.length; i++) {
      const expected = sections[i];
      const actual = dbSectionMap.get(expected.section);

      if (!actual) {
        throw new Error(`Missing section ${expected.section} in database for ${config.heading}`);
      }

      const expectedChapterNo = typeof expected.chapterNo === 'number' ? Math.trunc(expected.chapterNo) : parseInt(expected.chapterNo, 10);
      if (actual.chapterNo !== expectedChapterNo) {
        throw new Error(`ChapterNo mismatch for ${expected.section} in ${config.heading}: expected ${expectedChapterNo}, got ${actual.chapterNo}`);
      }

      if (actual.chapterName !== expected.chapterName) {
        throw new Error(`ChapterName mismatch for ${expected.section} in ${config.heading}: expected "${expected.chapterName}", got "${actual.chapterName}"`);
      }

      if (actual.title !== expected.title) {
        throw new Error(`Title mismatch for ${expected.section} in ${config.heading}: expected "${expected.title}", got "${actual.title}"`);
      }

      if (actual.description !== expected.description) {
        throw new Error(`Description mismatch for ${expected.section} in ${config.heading}`);
      }

      if ((expected.metaData || null) !== (actual.metaData || null)) {
        throw new Error(`metaData mismatch for ${expected.section} in ${config.heading}`);
      }
    }

    console.log(`✓ [${config.heading}] Verified ${actInDb.sections.length} sections, ${chaptersMap.size} chapters in DB with 100% data integrity.`);
  }

  // Step 6: Verify Category Relationships
  console.log('\n--- Step 6: Verifying Category Relationships ---');
  const allActsUnderCategory = await prisma.act.findMany({
    where: { bearerActId: bearerAct.id },
    select: { id: true, heading: true, year: true }
  });
  console.log(`Total Acts under "${bearerAct.name}" category: ${allActsUnderCategory.length}`);
  for (const a of allActsUnderCategory) {
    const sCount = await prisma.actSection.count({ where: { actId: a.id } });
    console.log(` - ${a.heading} (${a.year}): ${sCount} sections`);
  }

  console.log('\n===============================================================');
  console.log(' SEEDING & VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('===============================================================\n');

  return { bearerAct, acts: allActsUnderCategory };
}

if (process.argv[1] && process.argv[1].endsWith('seed_commercial_and_business_acts.js')) {
  seedCommercialAndBusinessActs()
    .catch((err) => {
      console.error('Fatal error during seeding:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
