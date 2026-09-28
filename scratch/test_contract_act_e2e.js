import prisma from '../src/lib/prisma.js';
import { contractBearerActSections } from '../prisma/contractBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runTests() {
  console.log('================================================================');
  console.log('  THE INDIAN CONTRACT ACT, 1872 - COMPREHENSIVE VERIFICATION');
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
      heading: 'THE INDIAN CONTRACT ACT, 1872'
    }
  });
  assert(acts.length === 1, 'Exactly one "THE INDIAN CONTRACT ACT, 1872" Act exists under "Civil and Property"');
  const contractAct = acts[0];
  assert(contractAct.year === 1872, 'Act year is 1872');
  assert(contractAct.act === 'THE INDIAN CONTRACT ACT, 1872', 'Act name is THE INDIAN CONTRACT ACT, 1872');

  // 3. Verify Section Count
  const sections = await prisma.actSection.findMany({
    where: { actId: contractAct.id },
    orderBy: [
      { chapterNo: 'asc' },
      { sectionOrder: 'asc' }
    ]
  });
  assert(sections.length === 268, `Section count is 268 (actual: ${sections.length})`);
  assert(sections.length === contractBearerActSections.length, `Section count matches seed dataset (${contractBearerActSections.length})`);

  // 4. Verify Chapter Structure
  const chapterSet = new Set(sections.map(s => s.chapterNo));
  assert(chapterSet.size === 12, `Chapters count is 12 (actual: ${chapterSet.size})`);

  const chaptersExpected = [
    { no: 1, name: 'PRELIMINARY', count: 2 },
    { no: 2, name: 'OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS', count: 7 },
    { no: 3, name: 'OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS', count: 22 },
    { no: 4, name: 'OF CONTINGENT CONTRACTS', count: 6 },
    { no: 5, name: 'OF THE PERFORMANCE OF CONTRACTS', count: 31 },
    { no: 6, name: 'OF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT', count: 5 },
    { no: 7, name: 'OF THE CONSEQUENCES OF BREACH OF CONTRACT', count: 3 },
    { no: 8, name: 'SALE OF GOODS [Repealed.]', count: 48 },
    { no: 9, name: 'OF INDEMNITY AND GUARANTEE', count: 24 },
    { no: 10, name: 'OF BAILMENT', count: 35 },
    { no: 11, name: 'AGENCY', count: 57 },
    { no: 12, name: 'OF PARTNERSHIP [Repealed.]', count: 28 }
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
  const sec19 = sections.find(s => s.section === 'Section 19');
  const sec19A = sections.find(s => s.section === 'Section 19A');
  const sec20 = sections.find(s => s.section === 'Section 20');
  assert(sec19 && sec19A && sec20, 'Sections 19, 19A, and 20 are present');
  assert(sec19.sectionOrder < sec19A.sectionOrder, 'Section 19 comes before Section 19A');
  assert(sec19A.sectionOrder < sec20.sectionOrder, 'Section 19A comes before Section 20');

  const sec178 = sections.find(s => s.section === 'Section 178');
  const sec178A = sections.find(s => s.section === 'Section 178A');
  const sec179 = sections.find(s => s.section === 'Section 179');
  assert(sec178 && sec178A && sec179, 'Sections 178, 178A, and 179 are present');
  assert(sec178.sectionOrder < sec178A.sectionOrder, 'Section 178 comes before Section 178A');
  assert(sec178A.sectionOrder < sec179.sectionOrder, 'Section 178A comes before Section 179');

  // Verify repealed chapters
  const sec76 = sections.find(s => s.section === 'Section 76');
  const sec123 = sections.find(s => s.section === 'Section 123');
  assert(sec76 && sec123, 'Repealed Sale of Goods sections 76 and 123 are preserved');
  assert(sec76.description.includes('Rep.'), 'Section 76 has repealed note');

  const sec239 = sections.find(s => s.section === 'Section 239');
  const sec266 = sections.find(s => s.section === 'Section 266');
  assert(sec239 && sec266, 'Repealed Partnership sections 239 and 266 are preserved');
  assert(sec266.description.includes('SCHEDULE'), 'Section 266 includes SCHEDULE note');

  // 6. Verify IPC / BNS separation and integrity
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  assert(ipcCount > 0, `IPCSection dataset is intact with ${ipcCount} records`);
  assert(bnsCount > 0, `BNSSection dataset is intact with ${bnsCount} records`);

  // 7. Verify other Acts under Civil and Property
  const tpaAct = await prisma.act.findFirst({
    where: {
      bearerActId: civilBearerAct.id,
      heading: 'THE TRANSFER OF PROPERTY ACT, 1882'
    }
  });
  assert(!!tpaAct, 'The Transfer of Property Act, 1882 remains intact under Civil and Property');
  const tpaSectionsCount = await prisma.actSection.count({
    where: { actId: tpaAct.id }
  });
  assert(tpaSectionsCount === 148, `TPA section count remains 148 (actual: ${tpaSectionsCount})`);

  console.log(`\n================================================================`);
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
