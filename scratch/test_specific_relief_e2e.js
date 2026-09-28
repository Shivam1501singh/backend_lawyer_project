import prisma from '../src/lib/prisma.js';
import { specificReliefBearerActSections } from '../prisma/specificReliefBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runTests() {
  console.log('================================================================');
  console.log('  THE SPECIFIC RELIEF ACT, 1963 - COMPREHENSIVE VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Verify BearerAct: Civil and Property
  const bearerActs = await prisma.bearerAct.findMany({
    where: { name: 'Civil and Property' }
  });
  assert(bearerActs.length === 1, 'Exactly one "Civil and Property" BearerAct exists in DB');
  const civilBearerAct = bearerActs[0];

  // 2. Verify Act under Civil and Property
  const acts = await prisma.act.findMany({
    where: {
      bearerActId: civilBearerAct.id,
      heading: 'THE SPECIFIC RELIEF ACT, 1963'
    }
  });
  assert(acts.length === 1, 'Exactly one "THE SPECIFIC RELIEF ACT, 1963" Act exists under "Civil and Property"');
  const sraAct = acts[0];
  assert(sraAct.year === 1963, 'Act year is 1963');
  assert(sraAct.act === 'THE SPECIFIC RELIEF ACT, 1963', 'Act name is THE SPECIFIC RELIEF ACT, 1963');

  // 3. Verify Section Count
  const sections = await prisma.actSection.findMany({
    where: { actId: sraAct.id },
    orderBy: [
      { chapterNo: 'asc' },
      { sectionOrder: 'asc' }
    ]
  });
  assert(sections.length === 48, `Section count is 48 (actual: ${sections.length})`);
  assert(sections.length === specificReliefBearerActSections.length, `Section count matches seed dataset (${specificReliefBearerActSections.length})`);

  // 4. Verify Chapter Structure
  const chapterSet = new Set(sections.map(s => s.chapterNo));
  assert(chapterSet.size === 9, `Chapters count is 9 (actual: ${chapterSet.size})`);

  const chaptersExpected = [
    { no: 1, name: 'PRELIMINARY', count: 4 },
    { no: 2, name: 'RECOVERING POSSESSION OF PROPERTY', count: 4 },
    { no: 3, name: 'SPECIFIC PERFORMANCE OF CONTRACTS', count: 21 },
    { no: 4, name: 'RECTIFICATION OF INSTRUMENTS', count: 1 },
    { no: 5, name: 'RESCISSION OF CONTRACTS', count: 4 },
    { no: 6, name: 'CANCELLATION OF INSTRUMENTS', count: 3 },
    { no: 7, name: 'DECLARATORY DECREES', count: 2 },
    { no: 8, name: 'INJUNCTIONS GENERALLY', count: 2 },
    { no: 9, name: 'PERPETUAL INJUNCTIONS', count: 7 }
  ];

  for (const exp of chaptersExpected) {
    const chSections = sections.filter(s => s.chapterNo === exp.no);
    assert(chSections.length === exp.count, `Chapter ${exp.no} (${exp.name}) has ${exp.count} sections (actual: ${chSections.length})`);
    if (chSections.length > 0) {
      assert(chSections[0].chapterName === exp.name, `Chapter ${exp.no} name is "${exp.name}"`);
    }
  }

  // 5. Verify Section Ordering & Sequence
  let orderCorrect = true;
  for (let i = 0; i < sections.length - 1; i++) {
    const curr = sections[i];
    const next = sections[i + 1];
    if (curr.chapterNo < next.chapterNo) continue;
    if (curr.chapterNo === next.chapterNo) {
      if (curr.sectionOrder >= next.sectionOrder) {
        console.error(`Ordering failure at index ${i}: ${curr.section} (order: ${curr.sectionOrder}) >= ${next.section} (order: ${next.sectionOrder})`);
        orderCorrect = false;
      }
    }
  }
  assert(orderCorrect, 'All sections are sorted in correct numeric/alphabetic sectionOrder within chapters');

  // Verify key special sections
  const sec14 = sections.find(s => s.section === 'Section 14');
  const sec14A = sections.find(s => s.section === 'Section 14A');
  const sec15 = sections.find(s => s.section === 'Section 15');
  assert(sec14 && sec14A && sec15, 'Sections 14, 14A, and 15 are present');
  assert(sec14.sectionOrder < sec14A.sectionOrder, 'Section 14 comes before Section 14A');
  assert(sec14A.sectionOrder < sec15.sectionOrder, 'Section 14A comes before Section 15');

  const sec20 = sections.find(s => s.section === 'Section 20');
  const sec20A = sections.find(s => s.section === 'Section 20A');
  const sec20B = sections.find(s => s.section === 'Section 20B');
  const sec20C = sections.find(s => s.section === 'Section 20C');
  const sec21 = sections.find(s => s.section === 'Section 21');
  assert(sec20 && sec20A && sec20B && sec20C && sec21, 'Sections 20, 20A, 20B, 20C, and 21 are present');
  assert(sec20.sectionOrder < sec20A.sectionOrder, 'Section 20 comes before Section 20A');
  assert(sec20A.sectionOrder < sec20B.sectionOrder, 'Section 20A comes before Section 20B');
  assert(sec20B.sectionOrder < sec20C.sectionOrder, 'Section 20B comes before Section 20C');
  assert(sec20C.sectionOrder < sec21.sectionOrder, 'Section 20C comes before Section 21');

  // Verify repealed sections 43 and 44
  const sec43 = sections.find(s => s.section === 'Section 43');
  const sec44 = sections.find(s => s.section === 'Section 44');
  assert(sec43 && sec43.title === '[Repealed.]', 'Section 43 is present and marked [Repealed.]');
  assert(sec44 && sec44.title === '[Repealed.]', 'Section 44 is present and marked [Repealed.]');
  assert(sec44.description.includes('THE SCHEDULE'), 'Section 44 retains THE SCHEDULE text');

  // 6. Verify IPC/BNS Independence
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  assert(ipcCount > 0, `IPC dataset intact (count: ${ipcCount})`);
  assert(bnsCount > 0, `BNS dataset intact (count: ${bnsCount})`);

  // 7. Verify all Acts under Civil and Property
  const allCivilActs = await prisma.act.findMany({
    where: { bearerActId: civilBearerAct.id }
  });
  console.log(`\nActs under Civil and Property (${allCivilActs.length}):`);
  allCivilActs.forEach(a => console.log(`  - ${a.heading} (${a.year})`));
  assert(allCivilActs.length >= 3, 'Civil and Property contains at least 3 Acts');

  console.log(`\n================================================================`);
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
