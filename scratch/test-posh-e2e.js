import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2ETests() {
  console.log('================================================================');
  console.log('   THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE ACT, 2013 VERIFY  ');
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
    console.log('\n[Test 2] Verify THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013 exists under Criminal BearerAct...');
    const poshActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013'
      }
    });
    assert(poshActs.length === 1, `THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013 exists exactly once under Criminal (found: ${poshActs.length})`);
    const poshAct = poshActs[0];
    assert(poshAct.year === 2013, `Act year is 2013 (got: ${poshAct.year})`);
    assert(poshAct.act === 'THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013', `Act name is THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013`);

    // 3. Act Section Count & Chapter Verification
    console.log('\n[Test 3] Verify Act Sections and Chapters...');
    const sections = await prisma.actSection.findMany({
      where: { actId: poshAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });
    assert(sections.length === 30, `Total sections seeded is 30 (found: ${sections.length})`);

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
    assert(chapters.get(2).count === 1, `Chapter 2 (CONSTITUTION OF INTERNAL COMPLAINTS COMMITTEE) has 1 section (found: ${chapters.get(2).count})`);
    assert(chapters.get(3).count === 4, `Chapter 3 (CONSTITUTION OF LOCAL COMPLAINTS COMMITTEE) has 4 sections (found: ${chapters.get(3).count})`);
    assert(chapters.get(4).count === 3, `Chapter 4 (COMPLAINT) has 3 sections (found: ${chapters.get(4).count})`);
    assert(chapters.get(5).count === 7, `Chapter 5 (INQUIRY INTO COMPLAINT) has 7 sections (found: ${chapters.get(5).count})`);
    assert(chapters.get(6).count === 1, `Chapter 6 (DUTIES OF EMPLOYER) has 1 section (found: ${chapters.get(6).count})`);
    assert(chapters.get(7).count === 1, `Chapter 7 (DUTIES AND POWERS OF DISTRICT OFFICER) has 1 section (found: ${chapters.get(7).count})`);
    assert(chapters.get(8).count === 10, `Chapter 8 (MISCELLANEOUS) has 10 sections (found: ${chapters.get(8).count})`);

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

    // Verify ordering sequence 1 to 30
    let sequential = true;
    for (let i = 0; i < sections.length; i++) {
      const expectedNum = i + 1;
      if (sections[i].section !== `Section ${expectedNum}`) {
        sequential = false;
        console.error(`Sequence mismatch at index ${i}: expected Section ${expectedNum}, got ${sections[i].section}`);
      }
    }
    assert(sequential, 'Sections 1 through 30 are strictly ordered monotonically from 1 to 30');

    // 5. Verify Unrelated Datasets Remain Intact
    console.log('\n[Test 5] Verify Unrelated Datasets remain intact...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    const actCount = await prisma.act.count();
    const bearerCount = await prisma.bearerAct.count();

    console.log(`- IPCSection records: ${ipcCount}`);
    console.log(`- BNSSection records: ${bnsCount}`);
    console.log(`- BearerAct records: ${bearerCount}`);
    console.log(`- Act records: ${actCount}`);

    assert(ipcCount >= 500, `IPCSection table preserved (${ipcCount} records)`);
    assert(bnsCount >= 350, `BNSSection table preserved (${bnsCount} records)`);
    assert(bearerCount === 13, `BearerAct table has 13 standard categories (${bearerCount} records)`);

  } catch (err) {
    console.error('Error during test execution:', err);
    failed++;
  } finally {
    console.log('\n================================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');
    await prisma.$disconnect();
    if (failed > 0) process.exit(1);
  }
}

runE2ETests();
