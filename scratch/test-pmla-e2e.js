import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2ETests() {
  console.log('================================================================');
  console.log('   THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 - VERIFICATION   ');
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
    console.log('\n[Test 2] Verify THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 exists under Criminal BearerAct...');
    const pmlaActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002'
      }
    });
    assert(pmlaActs.length === 1, `THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 exists exactly once under Criminal (found: ${pmlaActs.length})`);
    const pmlaAct = pmlaActs[0];
    assert(pmlaAct.year === 2002, `Act year is 2002 (got: ${pmlaAct.year})`);
    assert(pmlaAct.act === 'THE PREVENTION OF MONEY-LAUNDERING ACT, 2002', `Act name is THE PREVENTION OF MONEY-LAUNDERING ACT, 2002`);

    // 3. Act Section Count & Chapter Verification
    console.log('\n[Test 3] Verify Act Sections and Chapters...');
    const sections = await prisma.actSection.findMany({
      where: { actId: pmlaAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });
    assert(sections.length === 81, `Total sections seeded is 81 (found: ${sections.length})`);

    const chapters = new Map();
    for (const s of sections) {
      if (!chapters.has(s.chapterNo)) {
        chapters.set(s.chapterNo, { name: s.chapterName, count: 0, sections: [] });
      }
      const ch = chapters.get(s.chapterNo);
      ch.count++;
      ch.sections.push(s.section);
    }
    assert(chapters.size === 10, `Total chapters is 10 (found: ${chapters.size})`);
    assert(chapters.get(1).count === 2, `Chapter 1 (PRELIMINARY) has 2 sections (found: ${chapters.get(1).count})`);
    assert(chapters.get(2).count === 2, `Chapter 2 (OFFENCE OF MONEY-LAUNDERING) has 2 sections (found: ${chapters.get(2).count})`);
    assert(chapters.get(3).count === 8, `Chapter 3 (ATTACHMENT, ADJUDICATION AND CONFISCATION) has 8 sections (found: ${chapters.get(3).count})`);
    assert(chapters.get(4).count === 6, `Chapter 4 (OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES) has 6 sections (found: ${chapters.get(4).count})`);
    assert(chapters.get(5).count === 9, `Chapter 5 (SUMMONS, SEARCHES AND SEIZURES, ETC.) has 9 sections (found: ${chapters.get(5).count})`);
    assert(chapters.get(6).count === 18, `Chapter 6 (APPELLATE TRIBUNAL) has 18 sections (found: ${chapters.get(6).count})`);
    assert(chapters.get(7).count === 5, `Chapter 7 (SPECIAL COURTS) has 5 sections (found: ${chapters.get(7).count})`);
    assert(chapters.get(8).count === 7, `Chapter 8 (AUTHORITIES) has 7 sections (found: ${chapters.get(8).count})`);
    assert(chapters.get(9).count === 9, `Chapter 9 (RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY) has 9 sections (found: ${chapters.get(9).count})`);
    assert(chapters.get(10).count === 15, `Chapter 10 (MISCELLANEOUS) has 15 sections (found: ${chapters.get(10).count})`);

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
    const sec11 = sections.find(s => s.section === 'Section 11');
    const sec11A = sections.find(s => s.section === 'Section 11A');
    assert(sec11 && sec11A && sec11.sectionOrder < sec11A.sectionOrder, 'Section 11 < Section 11A ordering correct');

    const sec12 = sections.find(s => s.section === 'Section 12');
    const sec12A = sections.find(s => s.section === 'Section 12A');
    const sec12AA = sections.find(s => s.section === 'Section 12AA');
    const sec13 = sections.find(s => s.section === 'Section 13');
    assert(sec12 && sec12A && sec12AA && sec13 &&
      sec12.sectionOrder < sec12A.sectionOrder &&
      sec12A.sectionOrder < sec12AA.sectionOrder &&
      sec12AA.sectionOrder < sec13.sectionOrder, 'Section 12 < Section 12A < Section 12AA < Section 13 ordering correct');

    const sec58 = sections.find(s => s.section === 'Section 58');
    const sec58A = sections.find(s => s.section === 'Section 58A');
    const sec58B = sections.find(s => s.section === 'Section 58B');
    const sec59 = sections.find(s => s.section === 'Section 59');
    assert(sec58 && sec58A && sec58B && sec59 &&
      sec58.sectionOrder < sec58A.sectionOrder &&
      sec58A.sectionOrder < sec58B.sectionOrder &&
      sec58B.sectionOrder < sec59.sectionOrder, 'Section 58 < Section 58A < Section 58B < Section 59 ordering correct');

    const sec72 = sections.find(s => s.section === 'Section 72');
    const sec72A = sections.find(s => s.section === 'Section 72A');
    const sec73 = sections.find(s => s.section === 'Section 73');
    assert(sec72 && sec72A && sec73 &&
      sec72.sectionOrder < sec72A.sectionOrder &&
      sec72A.sectionOrder < sec73.sectionOrder, 'Section 72 < Section 72A < Section 73 ordering correct');

    // 5. Verify Unrelated Datasets Intact
    console.log('\n[Test 5] Verify Unrelated Legal Datasets remain untouched...');
    const ipcCount = await prisma.iPCSection.count();
    assert(ipcCount === 576, `IPCSection table untouched (count: ${ipcCount})`);

    const bnsCount = await prisma.bNSSection.count();
    assert(bnsCount === 358, `BNSSection table untouched (count: ${bnsCount})`);

    const totalBearerActs = await prisma.bearerAct.count();
    assert(totalBearerActs === 13, `Total BearerAct categories is 13 (found: ${totalBearerActs})`);

    const criminalActs = await prisma.act.findMany({
      where: { bearerActId: criminalBearerAct.id }
    });
    console.log('Criminal BearerAct Acts:', criminalActs.map(a => a.heading));
    assert(criminalActs.length >= 5, `Criminal BearerAct contains all expected Acts (found: ${criminalActs.length})`);

    // 6. Test Search Queries
    console.log('\n[Test 6] Verify Search Queries...');
    const searchTerms = ['Money', 'Money-Laundering', 'Prevention', 'Special Court', 'provisional attach'];
    for (const term of searchTerms) {
      const results = await prisma.actSection.findMany({
        where: {
          actId: pmlaAct.id,
          OR: [
            { section: { contains: term, mode: 'insensitive' } },
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { chapterName: { contains: term, mode: 'insensitive' } }
          ]
        }
      });
      assert(results.length > 0, `Search for "${term}" returned ${results.length} results in PMLA`);
    }

    console.log('\n================================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
