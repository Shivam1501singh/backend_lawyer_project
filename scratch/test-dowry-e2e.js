import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2ETests() {
  console.log('================================================================');
  console.log('      THE DOWRY PROHIBITION ACT, 1961 VERIFICATION');
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
    console.log('\n[Test 2] Verify THE DOWRY PROHIBITION ACT, 1961 exists under Criminal BearerAct...');
    const dowryActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'THE DOWRY PROHIBITION ACT, 1961'
      }
    });
    assert(dowryActs.length === 1, `THE DOWRY PROHIBITION ACT, 1961 exists exactly once under Criminal (found: ${dowryActs.length})`);
    const dowryAct = dowryActs[0];
    assert(dowryAct.year === 1961, `Act year is 1961 (got: ${dowryAct.year})`);
    assert(dowryAct.act === 'THE DOWRY PROHIBITION ACT, 1961', `Act name matches`);

    // 3. Act Section Count & Chapter Verification
    console.log('\n[Test 3] Verify Act Sections and Structure...');
    const sections = await prisma.actSection.findMany({
      where: { actId: dowryAct.id },
      orderBy: [
        { chapterNo: 'asc' },
        { sectionOrder: 'asc' }
      ]
    });
    assert(sections.length === 13, `Total sections seeded is 13 (found: ${sections.length})`);

    // 4. Numeric Section Ordering Verification
    console.log('\n[Test 4] Verify Section Ordering (1, 2, 3, 4, 4A, 5, 6, 7, 8, 8A, 8B, 9, 10)...');
    const expectedSectionNumbers = [
      'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 4A',
      'Section 5', 'Section 6', 'Section 7', 'Section 8', 'Section 8A',
      'Section 8B', 'Section 9', 'Section 10'
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
    assert(sec1.description.includes('Dowry Prohibition Act, 1961'), 'Section 1 description contains Short title');

    const sec2 = sections.find(s => s.section === 'Section 2');
    assert(sec2.title === 'Definition of “dowry”', 'Section 2 title correct');
    assert(sec2.description.includes('valuable security'), 'Section 2 contains valuable security definition');

    const sec3 = sections.find(s => s.section === 'Section 3');
    assert(sec3.title === 'Penalty for giving or taking dowry', 'Section 3 title correct');
    assert(sec3.description.includes('fifteen thousand rupees'), 'Section 3 contains penalty details');

    const sec4 = sections.find(s => s.section === 'Section 4');
    assert(sec4.title === 'Penalty for demanding dowry', 'Section 4 title correct');

    const sec4A = sections.find(s => s.section === 'Section 4A');
    assert(sec4A.title === 'Ban on advertisement', 'Section 4A title correct');
    assert(sec4A.description.includes('offers, through any advertisement in any newspaper'), 'Section 4A description correct');

    const sec5 = sections.find(s => s.section === 'Section 5');
    assert(sec5.title === 'Agreement for giving or taking dowry to be void', 'Section 5 title correct');

    const sec6 = sections.find(s => s.section === 'Section 6');
    assert(sec6.title === 'Dowry to be for the benefit of the wife or her heirs', 'Section 6 title correct');
    assert(sec6.description.includes('within three months after the date of marriage'), 'Section 6 description correct');

    const sec7 = sections.find(s => s.section === 'Section 7');
    assert(sec7.title === 'Cognizance of offences', 'Section 7 title correct');

    const sec8 = sections.find(s => s.section === 'Section 8');
    assert(sec8.title === 'Offences to be cognizable for certain purposes and to be bailable and non-compoundable', 'Section 8 title correct');

    const sec8A = sections.find(s => s.section === 'Section 8A');
    assert(sec8A.title === 'Burden of proof in certain cases', 'Section 8A title correct');

    const sec8B = sections.find(s => s.section === 'Section 8B');
    assert(sec8B.title === 'Dowry Prohibition Officers', 'Section 8B title correct');

    const sec9 = sections.find(s => s.section === 'Section 9');
    assert(sec9.title === 'Power to make rules', 'Section 9 title correct');

    const sec10 = sections.find(s => s.section === 'Section 10');
    assert(sec10.title === 'Power of the State Government to make rules', 'Section 10 title correct');

    // 6. Verify IPC/BNS isolation
    console.log('\n[Test 6] Verify IPCSection and BNSSection datasets remain intact and separate...');
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount > 0, `IPCSection table has records (${ipcCount})`);
    assert(bnsCount > 0, `BNSSection table has records (${bnsCount})`);

    console.log(`\n================================================================`);
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`================================================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
