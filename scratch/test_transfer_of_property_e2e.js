import prisma from '../src/lib/prisma.js';
import { transferOfPropertyBearerActSections } from '../prisma/transferOfPropertyBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runTests() {
  console.log('================================================================');
  console.log('  THE TRANSFER OF PROPERTY ACT, 1882 - COMPREHENSIVE VERIFICATION');
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
      heading: 'THE TRANSFER OF PROPERTY ACT, 1882'
    }
  });
  assert(acts.length === 1, 'Exactly one "THE TRANSFER OF PROPERTY ACT, 1882" Act exists under "Civil and Property"');
  const tpaAct = acts[0];
  assert(tpaAct.year === 1882, 'Act year is 1882');
  assert(tpaAct.act === 'THE TRANSFER OF PROPERTY ACT, 1882', 'Act name is THE TRANSFER OF PROPERTY ACT, 1882');

  // 3. Verify Section Count
  const sections = await prisma.actSection.findMany({
    where: { actId: tpaAct.id },
    orderBy: [
      { chapterNo: 'asc' },
      { sectionOrder: 'asc' }
    ]
  });
  assert(sections.length === 148, `Section count is 148 (actual: ${sections.length})`);
  assert(sections.length === transferOfPropertyBearerActSections.length, `Section count matches seed dataset (${transferOfPropertyBearerActSections.length})`);

  // 4. Verify Chapter Structure
  const chapterSet = new Set(sections.map(s => s.chapterNo));
  assert(chapterSet.size === 8, `Chapters count is 8 (actual: ${chapterSet.size})`);

  const chaptersExpected = [
    { no: 1, name: 'PRELIMINARY', count: 4 },
    { no: 2, name: 'OF TRANSFERS OF PROPERTY BY ACT OF PARTIES', count: 50 },
    { no: 3, name: 'OF SALES OF IMMOVEABLE PROPERTY', count: 4 },
    { no: 4, name: 'OF MORTGAGES OF IMMOVEABLE PROPERTY AND CHARGES', count: 54 },
    { no: 5, name: 'OF LEASES OF IMMOVEABLE PROPERTY', count: 14 },
    { no: 6, name: 'OF EXCHANGES', count: 4 },
    { no: 7, name: 'OF GIFTS', count: 8 },
    { no: 8, name: 'OF TRANSFERS OF ACTIONABLE CLAIMS', count: 10 }
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
  const sec53 = sections.find(s => s.section === 'Section 53');
  const sec53A = sections.find(s => s.section === 'Section 53A');
  const sec54 = sections.find(s => s.section === 'Section 54');
  assert(sec53 && sec53A && sec54, 'Sections 53, 53A, and 54 are present');
  assert(sec53.sectionOrder < sec53A.sectionOrder, 'Section 53 comes before Section 53A');
  assert(sec53A.chapterNo === 2 && sec54.chapterNo === 3, 'Section 53A in Chapter II, Section 54 in Chapter III');

  const sec59A = sections.find(s => s.section === 'Section 59A');
  const sec60A = sections.find(s => s.section === 'Section 60A');
  const sec60B = sections.find(s => s.section === 'Section 60B');
  const sec63A = sections.find(s => s.section === 'Section 63A');
  const sec65A = sections.find(s => s.section === 'Section 65A');
  const sec67A = sections.find(s => s.section === 'Section 67A');
  const sec69A = sections.find(s => s.section === 'Section 69A');
  const sec114A = sections.find(s => s.section === 'Section 114A');
  const sec130A = sections.find(s => s.section === 'Section 130A');
  const sec135A = sections.find(s => s.section === 'Section 135A');
  assert(sec59A && sec60A && sec60B && sec63A && sec65A && sec67A && sec69A && sec114A && sec130A && sec135A, 'All amendment sections (59A, 60A, 60B, 63A, 65A, 67A, 69A, 114A, 130A, 135A) are present');

  // 6. Verify Repealed sections from PDF
  const sec74 = sections.find(s => s.section === 'Section 74');
  const sec80 = sections.find(s => s.section === 'Section 80');
  const sec85 = sections.find(s => s.section === 'Section 85');
  const sec97 = sections.find(s => s.section === 'Section 97');
  const sec99 = sections.find(s => s.section === 'Section 99');
  assert(sec74 && sec80 && sec85 && sec97 && sec99, 'Repealed sections (74, 80, 85, 97, 99) are accurately preserved from the PDF');

  // 7. Verify Idempotency - Simulate second run
  console.log('\n--- Testing Idempotency ---');
  const countBefore = await prisma.actSection.count({ where: { actId: tpaAct.id } });
  const actCountBefore = await prisma.act.count({ where: { bearerActId: civilBearerAct.id } });

  const tpaSectionMap = new Map(sections.map(s => [s.section, s]));
  const toUpdate = [];
  const toCreate = [];

  for (const item of transferOfPropertyBearerActSections) {
    const existing = tpaSectionMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      toCreate.push({
        actId: tpaAct.id,
        section: item.section,
        sectionOrder: sectionOrder,
        chapterNo: item.chapterNo,
        chapterName: item.chapterName,
        title: item.title,
        description: item.description,
        metaData: item.metaData,
        metaDescription: item.metaDescription,
        metaTitle: item.metaTitle
      });
    } else {
      toUpdate.push({
        id: existing.id,
        data: {
          sectionOrder: sectionOrder,
          chapterNo: item.chapterNo,
          chapterName: item.chapterName,
          title: item.title,
          description: item.description,
          metaData: item.metaData,
          metaDescription: item.metaDescription,
          metaTitle: item.metaTitle
        }
      });
    }
  }

  assert(toCreate.length === 0, `Idempotency: 0 new sections to create on second run`);
  assert(toUpdate.length === 148, `Idempotency: all 148 sections matched for sync on second run`);

  if (toUpdate.length > 0) {
    const updateChunkSize = 25;
    for (let i = 0; i < toUpdate.length; i += updateChunkSize) {
      const chunk = toUpdate.slice(i, i + updateChunkSize);
      await Promise.all(
        chunk.map(u =>
          prisma.actSection.update({
            where: { id: u.id },
            data: u.data
          })
        )
      );
    }
  }

  const countAfter = await prisma.actSection.count({ where: { actId: tpaAct.id } });
  const actCountAfter = await prisma.act.count({ where: { bearerActId: civilBearerAct.id } });
  assert(countBefore === countAfter && countAfter === 148, `Section count unchanged after re-run (${countBefore} -> ${countAfter})`);
  assert(actCountBefore === actCountAfter, `Act count unchanged after re-run (${actCountBefore} -> ${actCountAfter})`);

  // 8. Verify Search Functionality (Global Bearer Act search)
  console.log('\n--- Testing Search ---');
  const searchResultsAct = await prisma.act.findMany({
    where: {
      OR: [
        { heading: { contains: 'Transfer of Property', mode: 'insensitive' } },
        { act: { contains: 'Transfer of Property', mode: 'insensitive' } }
      ]
    }
  });
  assert(searchResultsAct.length >= 1, 'Act search matches "Transfer of Property"');

  const searchResultsSection = await prisma.actSection.findMany({
    where: {
      actId: tpaAct.id,
      OR: [
        { title: { contains: 'mortgage', mode: 'insensitive' } },
        { description: { contains: 'mortgage', mode: 'insensitive' } }
      ]
    }
  });
  assert(searchResultsSection.length > 0, `Section search for "mortgage" found ${searchResultsSection.length} sections`);

  // 9. Verify IPC and BNS Separation
  console.log('\n--- Testing IPC / BNS Module Integrity ---');
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  assert(ipcCount >= 500, `IPCSection table is intact with ${ipcCount} records`);
  assert(bnsCount >= 350, `BNSSection table is intact with ${bnsCount} records`);

  console.log('\n================================================================');
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
