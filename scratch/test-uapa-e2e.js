import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2ETests() {
  console.log('================================================================');
  console.log('   THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. BearerAct Verification
    console.log('[Test 1] Verify Criminal BearerAct exists exactly once...');
    const criminalBearerActs = await prisma.bearerAct.findMany({
      where: { name: 'Criminal' }
    });
    assert(criminalBearerActs.length === 1, `Criminal BearerAct exists exactly once (found: ${criminalBearerActs.length})`);
    const criminalBearerAct = criminalBearerActs[0];

    // 2. Act Verification
    console.log('\n[Test 2] Verify THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 exists under Criminal BearerAct...');
    const uapaActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967'
      }
    });
    assert(uapaActs.length === 1, `THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 exists exactly once under Criminal (found: ${uapaActs.length})`);
    const uapaAct = uapaActs[0];
    assert(uapaAct.year === 1967, `Act year is 1967 (got: ${uapaAct.year})`);
    assert(uapaAct.act === 'THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967', `Act name matches`);

    // 3. Act Section Count & Chapter Verification
    console.log('\n[Test 3] Verify Act Sections and Chapters...');
    const sections = await prisma.actSection.findMany({
      where: { actId: uapaAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });
    assert(sections.length === 22, `Total sections seeded is 22 (found: ${sections.length})`);

    const chapters = new Map();
    for (const s of sections) {
      if (!chapters.has(s.chapterNo)) {
        chapters.set(s.chapterNo, { name: s.chapterName, count: 0, sections: [] });
      }
      const ch = chapters.get(s.chapterNo);
      ch.count++;
      ch.sections.push(s.section);
    }
    assert(chapters.size === 4, `Total chapters is 4 (found: ${chapters.size})`);
    assert(chapters.get(1).count === 3, `Chapter 1 (PRELIMINARY) has 3 sections (found: ${chapters.get(1).count})`);
    assert(chapters.get(2).count === 7, `Chapter 2 (UNLAWFUL ASSOCIATIONS) has 7 sections (found: ${chapters.get(2).count})`);
    assert(chapters.get(3).count === 5, `Chapter 3 (OFFENCES AND PENALTIES) has 5 sections (found: ${chapters.get(3).count})`);
    assert(chapters.get(4).count === 7, `Chapter 4 (MISCELLANEOUS) has 7 sections (found: ${chapters.get(4).count})`);

    // 4. Numeric Section Ordering Verification
    console.log('\n[Test 4] Verify Numeric Section Ordering...');
    let orderCorrect = true;
    for (let i = 1; i < sections.length; i++) {
      const prev = sections[i - 1];
      const curr = sections[i];
      if (prev.chapterNo === curr.chapterNo && prev.sectionOrder > curr.sectionOrder) {
        orderCorrect = false;
        console.error(`Order violation in Chapter ${curr.chapterNo}: ${prev.section} (${prev.sectionOrder}) comes before ${curr.section} (${curr.sectionOrder})`);
      }
    }
    assert(orderCorrect, 'All sections within every chapter are strictly in ascending numeric order');

    // Verify specifically Section 2 vs Section 2A vs Section 3
    const sec1 = sections.find(s => s.section === 'Section 1');
    const sec2 = sections.find(s => s.section === 'Section 2');
    const sec2A = sections.find(s => s.section === 'Section 2A');
    const sec3 = sections.find(s => s.section === 'Section 3');
    assert(sec1 && sec2 && sec2A && sec1.sectionOrder < sec2.sectionOrder && sec2.sectionOrder < sec2A.sectionOrder, 'Section 1 < 2 < 2A ordering correct');
    assert(sec2A && sec3 && sec2A.sectionOrder < sec3.sectionOrder, 'Section 2A < Section 3 ordering correct');

    // 5. Existing modules integrity check
    console.log('\n[Test 5] Verify existing IPCSection and BNSSection datasets remain untouched...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `IPCSection table untouched (count: ${ipcCount})`);
    assert(bnsCount === 358, `BNSSection table untouched (count: ${bnsCount})`);

    // Verify other Acts under Criminal remain intact
    const allCriminalActs = await prisma.act.findMany({
      where: { bearerActId: criminalBearerAct.id }
    });
    console.log(`Acts under Criminal: ${allCriminalActs.map(a => a.heading).join(' | ')}`);
    assert(allCriminalActs.length >= 7, `Multiple Acts under Criminal intact (count: ${allCriminalActs.length})`);

    console.log(`\n================================================================`);
    console.log(`E2E Verification Results: ${passed} Passed, ${failed} Failed`);
    console.log(`================================================================`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Error during E2E verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
