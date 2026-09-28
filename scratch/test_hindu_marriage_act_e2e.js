import prisma from '../src/lib/prisma.js';
import { hinduMarriageBearerActSections } from '../prisma/hinduMarriageBearerActData.js';

const ACT_HEADING = 'THE HINDU MARRIAGE ACT, 1955';

async function runE2ETests() {
  console.log('--- Starting Comprehensive E2E Verification for The Hindu Marriage Act, 1955 ---');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Personal category exists and is singular
    const categories = await prisma.bearerAct.findMany({
      where: { name: 'Personal' }
    });
    assert(categories.length === 1, `Exact 1 "Personal" BearerAct category exists (actual: ${categories.length})`);
    const personalCat = categories[0];

    // 2. Verify Act exists under Personal
    const acts = await prisma.act.findMany({
      where: { bearerActId: personalCat.id }
    });
    const hmaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!hmaAct, 'Act exists under Personal BearerAct');
    assert(hmaAct.year === 1955, `Act year is 1955 (actual: ${hmaAct?.year})`);
    assert(hmaAct.act === ACT_HEADING, 'Act field matches heading');

    // 3. Verify total section count
    const totalSections = await prisma.actSection.count({
      where: { actId: hmaAct.id }
    });
    assert(totalSections === 37, `Act has exactly 37 sections in DB (actual: ${totalSections})`);
    assert(hinduMarriageBearerActSections.length === 37, `Raw data has exactly 37 sections (actual: ${hinduMarriageBearerActSections.length})`);

    // 4. Verify all 6 chapters
    const sections = await prisma.actSection.findMany({
      where: { actId: hmaAct.id },
      orderBy: { sectionOrder: 'asc' }
    });

    const expectedChapters = [
      { no: 1, name: 'PRELIMINARY', count: 4 },
      { no: 2, name: 'HINDU MARRIAGES', count: 4 },
      { no: 3, name: 'RESTITUTION OF CONJUGAL RIGHTS AND JUDICIAL SEPARATION', count: 2 },
      { no: 4, name: 'NULLITY OF MARRIAGE AND DIVORCE', count: 10 },
      { no: 5, name: 'JURISDICTION AND PROCEDURE', count: 15 },
      { no: 6, name: 'SAVINGS AND REPEALS', count: 2 }
    ];

    for (const exp of expectedChapters) {
      const chSections = sections.filter(s => s.chapterNo === exp.no);
      assert(
        chSections.length === exp.count,
        `Chapter ${exp.no} (${exp.name}) has ${exp.count} sections (actual: ${chSections.length})`
      );
      assert(
        chSections.every(s => s.chapterName === exp.name),
        `All sections in chapter ${exp.no} have chapterName "${exp.name}"`
      );
    }

    // 5. Verify numeric ordering
    let orderCorrect = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        console.error(`Order mismatch at index ${i}: ${sections[i].section} (${sections[i].sectionOrder}) >= ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        orderCorrect = false;
      }
    }
    assert(orderCorrect, 'All sections are strictly ascending by sectionOrder');

    // Verify key section orders
    const sec13 = sections.find(s => s.section === 'Section 13');
    const sec13A = sections.find(s => s.section === 'Section 13A');
    const sec13B = sections.find(s => s.section === 'Section 13B');
    const sec14 = sections.find(s => s.section === 'Section 14');
    assert(sec13.sectionOrder < sec13A.sectionOrder && sec13A.sectionOrder < sec13B.sectionOrder && sec13B.sectionOrder < sec14.sectionOrder,
      'Section 13 < 13A < 13B < 14 ordering correct');

    const sec21 = sections.find(s => s.section === 'Section 21');
    const sec21A = sections.find(s => s.section === 'Section 21A');
    const sec21B = sections.find(s => s.section === 'Section 21B');
    const sec21C = sections.find(s => s.section === 'Section 21C');
    const sec22 = sections.find(s => s.section === 'Section 22');
    assert(sec21.sectionOrder < sec21A.sectionOrder && sec21A.sectionOrder < sec21B.sectionOrder && sec21B.sectionOrder < sec21C.sectionOrder && sec21C.sectionOrder < sec22.sectionOrder,
      'Section 21 < 21A < 21B < 21C < 22 ordering correct');

    const sec28 = sections.find(s => s.section === 'Section 28');
    const sec28A = sections.find(s => s.section === 'Section 28A');
    const sec29 = sections.find(s => s.section === 'Section 29');
    assert(sec28.sectionOrder < sec28A.sectionOrder && sec28A.sectionOrder < sec29.sectionOrder,
      'Section 28 < 28A < 29 ordering correct');

    // 6. Verify sample section contents against PDF
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1.title === 'Short title and extent', 'Section 1 title matches PDF');
    assert(sec1.description.includes('This Act may be called the Hindu Marriage Act, 1955'), 'Section 1 description matches PDF');

    const sec5 = sections.find(s => s.section === 'Section 5');
    assert(sec5.title === 'Conditions for a Hindu marriage', 'Section 5 title matches PDF');
    assert(sec5.description.includes('neither party has a spouse living at the time of the marriage'), 'Section 5 description matches PDF');

    const sec6 = sections.find(s => s.section === 'Section 6');
    assert(sec6.title === '[Guardianship in marriage.]', 'Section 6 title matches PDF');
    assert(sec6.description.includes('Omitted by the Child Marriage Restraint (Amendment) Act, 1978'), 'Section 6 description matches PDF');

    const sec13B_sec = sections.find(s => s.section === 'Section 13B');
    assert(sec13B_sec.title === 'Divorce by mutual consent', 'Section 13B title matches PDF');
    assert(sec13B_sec.description.includes('living separately for a period of one year or more'), 'Section 13B description matches PDF');

    const sec30 = sections.find(s => s.section === 'Section 30');
    assert(sec30.title === '[Repeals]', 'Section 30 title matches PDF');
    assert(sec30.description.includes('Rep. by the Repealing and Amending Act, 1960'), 'Section 30 description matches PDF');

    // 7. Verify unrelated datasets are intact
    const ipcSectionCount = await prisma.iPCSection.count();
    const bnsSectionCount = await prisma.bNSSection.count();
    assert(ipcSectionCount > 0, `IPC legacy sections preserved (count: ${ipcSectionCount})`);
    assert(bnsSectionCount > 0, `BNS legacy sections preserved (count: ${bnsSectionCount})`);

    console.log(`\n=== Test Summary: ${passed} passed, ${failed} failed ===`);
  } catch (err) {
    console.error('Error during E2E test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
