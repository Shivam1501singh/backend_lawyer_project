import prisma from '../src/lib/prisma.js';
import { environmentProtectionBearerActSections } from '../prisma/environmentProtectionBearerActData.js';
import { waterPollutionBearerActSections } from '../prisma/waterPollutionBearerActData.js';
import { airPollutionBearerActSections } from '../prisma/airPollutionBearerActData.js';
import { wildLifeProtectionBearerActSections } from '../prisma/wildLifeProtectionBearerActData.js';

const CATEGORY_NAME = 'Environment and Land';

const ACTS_CONFIG = [
  {
    heading: 'THE ENVIRONMENT (PROTECTION) ACT, 1986',
    act: 'THE ENVIRONMENT (PROTECTION) ACT, 1986',
    year: 1986,
    sections: environmentProtectionBearerActSections
  },
  {
    heading: 'THE WATER (PREVENTION AND CONTROL OF POLLUTION) ACT, 1974',
    act: 'THE WATER (PREVENTION AND CONTROL OF POLLUTION) ACT, 1974',
    year: 1974,
    sections: waterPollutionBearerActSections
  },
  {
    heading: 'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981',
    act: 'THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981',
    year: 1981,
    sections: airPollutionBearerActSections
  },
  {
    heading: 'THE WILD LIFE (PROTECTION) ACT, 1972',
    act: 'THE WILD LIFE (PROTECTION) ACT, 1972',
    year: 1972,
    sections: wildLifeProtectionBearerActSections
  }
];

async function runTests() {
  console.log('================================================================');
  console.log(' RUNNING END-TO-END VERIFICATION FOR ENVIRONMENT AND LAND ACTS');
  console.log('================================================================\n');

  // 1. Verify Category
  const category = await prisma.bearerAct.findUnique({
    where: { name: CATEGORY_NAME },
    include: {
      acts: {
        include: {
          _count: { select: { sections: true } }
        },
        orderBy: { year: 'asc' }
      }
    }
  });

  if (!category) {
    throw new Error(`Category "${CATEGORY_NAME}" not found!`);
  }

  console.log(`[PASS] BearerAct Category exists: "${category.name}" (ID: ${category.id})`);
  console.log(`[PASS] Total Acts under Category: ${category.acts.length} (Expected: ${ACTS_CONFIG.length})`);

  if (category.acts.length !== ACTS_CONFIG.length) {
    throw new Error(`Expected ${ACTS_CONFIG.length} acts under "${CATEGORY_NAME}", found ${category.acts.length}`);
  }

  // 2. Verify Each Act and its sections
  for (const actConfig of ACTS_CONFIG) {
    const act = category.acts.find(a => a.heading === actConfig.heading && a.year === actConfig.year);
    if (!act) {
      throw new Error(`Act "${actConfig.heading}" (${actConfig.year}) not found under "${CATEGORY_NAME}"`);
    }

    console.log(`\nVerifying Act: "${act.heading}" (${act.year}) [ID: ${act.id}]`);
    console.log(`  Act section count in DB: ${act._count.sections} (Expected: ${actConfig.sections.length})`);

    if (act._count.sections !== actConfig.sections.length) {
      throw new Error(`Section count mismatch for "${act.heading}": DB has ${act._count.sections}, expected ${actConfig.sections.length}`);
    }

    const sections = await prisma.actSection.findMany({
      where: { actId: act.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' },
        { id: 'asc' }
      ]
    });

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const expected = actConfig.sections[i];
      const expectedChNo = typeof expected.chapterNo === 'number' ? Math.trunc(expected.chapterNo) : parseInt(expected.chapterNo, 10);

      if (s.section !== expected.section) {
        throw new Error(`Section label mismatch at index ${i}: DB had "${s.section}", expected "${expected.section}"`);
      }
      if (s.title !== expected.title) {
        throw new Error(`Title mismatch at "${s.section}": DB had "${s.title}", expected "${expected.title}"`);
      }
      if (s.chapterNo !== expectedChNo) {
        throw new Error(`ChapterNo mismatch at "${s.section}": DB had ${s.chapterNo}, expected ${expectedChNo}`);
      }
      if (s.chapterName !== expected.chapterName) {
        throw new Error(`ChapterName mismatch at "${s.section}": DB had "${s.chapterName}", expected "${expected.chapterName}"`);
      }
      if (s.description !== expected.description) {
        throw new Error(`Description mismatch at "${s.section}"`);
      }
      if (s.metaData !== (expected.metaData || null)) {
        throw new Error(`MetaData mismatch at "${s.section}"`);
      }
    }

    console.log(`  [PASS] All ${sections.length} sections accurately seeded and ordered.`);
  }

  console.log('\n================================================================');
  console.log(' ALL E2E TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runTests()
  .catch(err => {
    console.error('E2E Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
