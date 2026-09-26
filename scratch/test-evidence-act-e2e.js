import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2ETests() {
  console.log('================================================================');
  console.log('   THE INDIAN EVIDENCE ACT, 1872 - COMPREHENSIVE VERIFICATION   ');
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
    console.log('\n[Test 2] Verify THE INDIAN EVIDENCE ACT, 1872 exists under Criminal BearerAct...');
    const evidenceActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE INDIAN EVIDENCE ACT, 1872'
      }
    });
    assert(evidenceActs.length === 1, `THE INDIAN EVIDENCE ACT, 1872 exists exactly once under Criminal (found: ${evidenceActs.length})`);
    const evidenceAct = evidenceActs[0];
    assert(evidenceAct.year === 1872, `Act year is 1872 (got: ${evidenceAct.year})`);
    assert(evidenceAct.act === 'THE INDIAN EVIDENCE ACT, 1872', `Act name is THE INDIAN EVIDENCE ACT, 1872`);

    // 3. Act Section Count & Chapter Verification
    console.log('\n[Test 3] Verify Act Sections and Chapters...');
    const sections = await prisma.actSection.findMany({
      where: { actId: evidenceAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });
    assert(sections.length === 185, `Total sections seeded is 185 (found: ${sections.length})`);

    const chapters = new Map();
    for (const s of sections) {
      if (!chapters.has(s.chapterNo)) {
        chapters.set(s.chapterNo, { name: s.chapterName, count: 0, sections: [] });
      }
      const ch = chapters.get(s.chapterNo);
      ch.count++;
      ch.sections.push(s.section);
    }
    assert(chapters.size === 11, `Total chapters is 11 (found: ${chapters.size})`);
    assert(chapters.get(1).count === 4, `Chapter 1 has 4 sections (found: ${chapters.get(1).count})`);
    assert(chapters.get(2).count === 55, `Chapter 2 has 55 sections (found: ${chapters.get(2).count})`);
    assert(chapters.get(3).count === 3, `Chapter 3 has 3 sections (found: ${chapters.get(3).count})`);
    assert(chapters.get(4).count === 2, `Chapter 4 has 2 sections (found: ${chapters.get(4).count})`);
    assert(chapters.get(5).count === 40, `Chapter 5 has 40 sections (found: ${chapters.get(5).count})`);
    assert(chapters.get(6).count === 10, `Chapter 6 has 10 sections (found: ${chapters.get(6).count})`);
    assert(chapters.get(7).count === 18, `Chapter 7 has 18 sections (found: ${chapters.get(7).count})`);
    assert(chapters.get(8).count === 3, `Chapter 8 has 3 sections (found: ${chapters.get(8).count})`);
    assert(chapters.get(9).count === 17, `Chapter 9 has 17 sections (found: ${chapters.get(9).count})`);
    assert(chapters.get(10).count === 32, `Chapter 10 has 32 sections (found: ${chapters.get(10).count})`);
    assert(chapters.get(11).count === 1, `Chapter 11 has 1 section (found: ${chapters.get(11).count})`);

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

    // Verify specifically alphanumeric sections positioning
    const sec22 = sections.find(s => s.section === 'Section 22');
    const sec22A = sections.find(s => s.section === 'Section 22A');
    const sec23 = sections.find(s => s.section === 'Section 23');
    assert(sec22.sectionOrder < sec22A.sectionOrder && sec22A.sectionOrder < sec23.sectionOrder, 'Section 22 < Section 22A < Section 23 ordering correct');

    const sec65 = sections.find(s => s.section === 'Section 65');
    const sec65A = sections.find(s => s.section === 'Section 65A');
    const sec65B = sections.find(s => s.section === 'Section 65B');
    const sec66 = sections.find(s => s.section === 'Section 66');
    assert(sec65.sectionOrder < sec65A.sectionOrder && sec65A.sectionOrder < sec65B.sectionOrder && sec65B.sectionOrder < sec66.sectionOrder, 'Section 65 < Section 65A < Section 65B < Section 66 ordering correct');

    // 5. Existing Data Regression Verification
    console.log('\n[Test 5] Verify regression safety for existing legal models...');
    const ipcCount = await prisma.iPCSection.count();
    assert(ipcCount === 576, `Existing IPCSection count unchanged (expected: 576, found: ${ipcCount})`);

    const bnsCount = await prisma.bNSSection.count();
    assert(bnsCount === 358, `Existing BNSSection count unchanged (expected: 358, found: ${bnsCount})`);

    const allCriminalActs = await prisma.act.findMany({
      where: { bearerActId: criminalBearerAct.id },
      select: { heading: true, _count: { select: { sections: true } } }
    });
    console.log('Acts currently under Criminal BearerAct:');
    allCriminalActs.forEach(a => console.log(` - ${a.heading}: ${a._count.sections} sections`));
    assert(allCriminalActs.length === 5, `Criminal BearerAct contains 5 Acts (found: ${allCriminalActs.length})`);

    // 6. Search Simulation
    console.log('\n[Test 6] Verify Search queries for Evidence Act...');
    const evidenceSearch = await prisma.act.findMany({
      where: {
        OR: [
          { heading: { contains: 'Evidence', mode: 'insensitive' } },
          { act: { contains: 'Evidence', mode: 'insensitive' } }
        ]
      }
    });
    assert(evidenceSearch.some(a => a.heading === 'THE INDIAN EVIDENCE ACT, 1872'), 'Search for "Evidence" returns THE INDIAN EVIDENCE ACT, 1872');

    const secSearch = await prisma.actSection.findMany({
      where: {
        actId: evidenceAct.id,
        OR: [
          { section: { contains: '65B', mode: 'insensitive' } },
          { title: { contains: 'electronic records', mode: 'insensitive' } }
        ]
      }
    });
    assert(secSearch.some(s => s.section === 'Section 65B'), 'Section search for "65B" / "electronic records" returns Section 65B');

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error in verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
