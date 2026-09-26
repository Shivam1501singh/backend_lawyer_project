import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2ETests() {
  console.log('================================================================');
  console.log('   THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985 VERIFY');
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
    console.log('\n[Test 2] Verify THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985 exists under Criminal BearerAct...');
    const ndpsActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985'
      }
    });
    assert(ndpsActs.length === 1, `THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985 exists exactly once under Criminal (found: ${ndpsActs.length})`);
    const ndpsAct = ndpsActs[0];
    assert(ndpsAct.year === 1985, `Act year is 1985 (got: ${ndpsAct.year})`);
    assert(ndpsAct.act === 'THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985', `Act name matches`);

    // 3. Act Section Count & Chapter Verification
    console.log('\n[Test 3] Verify Act Sections and Chapters...');
    const sections = await prisma.actSection.findMany({
      where: { actId: ndpsAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });
    assert(sections.length === 129, `Total sections seeded is 129 (found: ${sections.length})`);

    const chapters = new Map();
    for (const s of sections) {
      if (!chapters.has(s.chapterNo)) {
        chapters.set(s.chapterNo, { name: s.chapterName, count: 0, sections: [] });
      }
      const ch = chapters.get(s.chapterNo);
      ch.count++;
      ch.sections.push(s.section);
    }
    assert(chapters.size === 8, `Total chapters is 8 (found: ${chapters.size})`);
    assert(chapters.get(1).count === 3, `Chapter 1 (PRELIMINARY) has 3 sections (found: ${chapters.get(1).count})`);
    assert(chapters.get(2).count === 4, `Chapter 2 (AUTHORITIES AND OFFICERS) has 4 sections (found: ${chapters.get(2).count})`);
    assert(chapters.get(3).count === 2, `Chapter 3 (NATIONAL FUND FOR CONTROL OF DRUG ABUSE) has 2 sections (found: ${chapters.get(3).count})`);
    assert(chapters.get(4).count === 9, `Chapter 4 (PROHIBITION, CONTROL AND REGULATION) has 9 sections (found: ${chapters.get(4).count})`);
    assert(chapters.get(5).count === 36, `Chapter 5 (OFFENCES AND PENALTIES) has 36 sections (found: ${chapters.get(5).count})`);
    assert(chapters.get(6).count === 33, `Chapter 6 (PROCEDURE) has 33 sections (found: ${chapters.get(6).count})`);
    assert(chapters.get(7).count === 26, `Chapter 7 (FORFEITURE OF ILLEGALLY ACQUIRED PROPERTY) has 26 sections (found: ${chapters.get(7).count})`);
    assert(chapters.get(8).count === 16, `Chapter 8 (MISCELLANEOUS) has 16 sections (found: ${chapters.get(8).count})`);

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

    // Verify specifically inserted alphanumeric sections
    const sec7 = sections.find(s => s.section === 'Section 7');
    const sec7A = sections.find(s => s.section === 'Section 7A');
    const sec7B = sections.find(s => s.section === 'Section 7B');
    const sec8 = sections.find(s => s.section === 'Section 8');
    const sec8A = sections.find(s => s.section === 'Section 8A');
    const sec9 = sections.find(s => s.section === 'Section 9');
    const sec9A = sections.find(s => s.section === 'Section 9A');
    assert(sec7 && sec7A && sec7B && sec7.sectionOrder < sec7A.sectionOrder && sec7A.sectionOrder < sec7B.sectionOrder, 'Section 7 < 7A < 7B ordering correct');
    assert(sec8 && sec8A && sec8.sectionOrder < sec8A.sectionOrder, 'Section 8 < 8A ordering correct');
    assert(sec9 && sec9A && sec9.sectionOrder < sec9A.sectionOrder, 'Section 9 < 9A ordering correct');

    const sec68H = sections.find(s => s.section === 'Section 68H');
    const sec68I = sections.find(s => s.section === 'Section 68-I');
    const sec68J = sections.find(s => s.section === 'Section 68J');
    assert(sec68H && sec68I && sec68J && sec68H.sectionOrder < sec68I.sectionOrder && sec68I.sectionOrder < sec68J.sectionOrder, 'Section 68H < 68-I < 68J ordering correct');

    // 5. Verify Unrelated Datasets Remain Intact
    console.log('\n[Test 5] Verify Unrelated Datasets remain intact...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount >= 500, `IPCSection table untouched (count: ${ipcCount})`);
    assert(bnsCount >= 350, `BNSSection table untouched (count: ${bnsCount})`);

    const allActs = await prisma.act.findMany({
      where: { bearerActId: criminalBearerAct.id }
    });
    console.log(`Acts under Criminal BearerAct: ${allActs.map(a => a.heading).join(', ')}`);
    assert(allActs.length >= 7, `All criminal acts present (count: ${allActs.length})`);

    console.log('\n================================================================');
    console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
