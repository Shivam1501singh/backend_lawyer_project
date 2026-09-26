import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2ETests() {
  console.log('================================================================');
  console.log('          THE ARMS ACT, 1959 VERIFICATION');
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
    console.log('\n[Test 2] Verify THE ARMS ACT, 1959 exists under Criminal BearerAct...');
    const armsActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE ARMS ACT, 1959'
      }
    });
    assert(armsActs.length === 1, `THE ARMS ACT, 1959 exists exactly once under Criminal (found: ${armsActs.length})`);
    const armsAct = armsActs[0];
    assert(armsAct.year === 1959, `Act year is 1959 (got: ${armsAct.year})`);
    assert(armsAct.act === 'THE ARMS ACT, 1959', `Act name matches`);

    // 3. Act Section Count & Chapter Verification
    console.log('\n[Test 3] Verify Act Sections and Structure...');
    const sections = await prisma.actSection.findMany({
      where: { actId: armsAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });
    assert(sections.length === 48, `Total sections seeded is 48 (found: ${sections.length})`);

    // Check chapters
    const chapters = [...new Set(sections.map(s => s.chapterNo))].sort((a, b) => a - b);
    assert(JSON.stringify(chapters) === JSON.stringify([1, 2, 3, 4, 5, 6]), `All 6 chapters (1 through 6) present: ${chapters.join(', ')}`);

    // 4. Numeric Section Ordering Verification
    console.log('\n[Test 4] Verify Section Ordering...');
    const expectedSectionNumbers = [
      'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5',
      'Section 6', 'Section 7', 'Section 8', 'Section 9', 'Section 10',
      'Section 11', 'Section 12', 'Section 13', 'Section 14', 'Section 15',
      'Section 16', 'Section 17', 'Section 18', 'Section 19', 'Section 20',
      'Section 21', 'Section 22', 'Section 23', 'Section 24', 'Section 24A',
      'Section 24B', 'Section 25', 'Section 26', 'Section 27', 'Section 28',
      'Section 29', 'Section 30', 'Section 31', 'Section 32', 'Section 33',
      'Section 34', 'Section 35', 'Section 36', 'Section 37', 'Section 38',
      'Section 39', 'Section 40', 'Section 41', 'Section 42', 'Section 43',
      'Section 44', 'Section 45', 'Section 46'
    ];
    const actualSectionNumbers = sections.map(s => s.section);
    const orderMatches = JSON.stringify(actualSectionNumbers) === JSON.stringify(expectedSectionNumbers);
    assert(orderMatches, `Section order matches legal order:\nExpected: ${expectedSectionNumbers.join(', ')}\nActual:   ${actualSectionNumbers.join(', ')}`);

    for (let i = 0; i < sections.length - 1; i++) {
      assert(sections[i].sectionOrder < sections[i + 1].sectionOrder,
        `sectionOrder is strictly increasing: ${sections[i].section} (${sections[i].sectionOrder}) < ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
    }

    // 5. Verification of Specific Section Contents from PDF
    console.log('\n[Test 5] Verify Section Contents against PDF...');
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1.title === 'Short title, extent and commencement', 'Section 1 title correct');
    assert(sec1.chapterNo === 1 && sec1.chapterName === 'PRELIMINARY', 'Section 1 chapter correct');
    assert(sec1.description.includes('Arms Act, 1959'), 'Section 1 description contains Short title');

    const sec2 = sections.find(s => s.section === 'Section 2');
    assert(sec2.title === 'Definitions and interpretation', 'Section 2 title correct');
    assert(sec2.description.includes('“prohibited arms”'), 'Section 2 contains prohibited arms definition');

    const sec3 = sections.find(s => s.section === 'Section 3');
    assert(sec3.title === 'Licence for acquisition and possession of firearms and ammunition', 'Section 3 title correct');
    assert(sec3.chapterNo === 2 && sec3.chapterName.includes('ACQUISITION, POSSESSION'), 'Section 3 chapter correct');

    const sec24A = sections.find(s => s.section === 'Section 24A');
    assert(sec24A.title === 'Prohibition as to possession of notified arms in disturbed areas, etc.', 'Section 24A title correct');
    assert(sec24A.chapterNo === 4, 'Section 24A is in Chapter 4');

    const sec24B = sections.find(s => s.section === 'Section 24B');
    assert(sec24B.title === 'Prohibition as to carrying of notified arms in or through public places in disturbed areas etc.', 'Section 24B title correct');

    const sec25 = sections.find(s => s.section === 'Section 25');
    assert(sec25.title === 'Punishment for certain offences', 'Section 25 title correct');
    assert(sec25.chapterNo === 5 && sec25.chapterName === 'OFFENCES AND PENALTIES', 'Section 25 chapter correct');

    const sec34 = sections.find(s => s.section === 'Section 34');
    assert(sec34.title === 'Sanction of Central Government for warehousing of arms', 'Section 34 title correct');
    assert(sec34.chapterNo === 6 && sec34.chapterName === 'MISCELLANEOUS', 'Section 34 chapter correct');

    const sec46 = sections.find(s => s.section === 'Section 46');
    assert(sec46.title === 'Repeal of Act 11 of 1878', 'Section 46 title correct');
    assert(sec46.description.includes('The Indian Arms Act, 1878'), 'Section 46 description correct');

    // 6. Non-interference Verification
    console.log('\n[Test 6] Verify IPC and BNS records are untouched...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount > 0, `IPCSection table preserved with ${ipcCount} records`);
    assert(bnsCount > 0, `BNSSection table preserved with ${bnsCount} records`);

    console.log('\n================================================================');
    console.log(`E2E Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
