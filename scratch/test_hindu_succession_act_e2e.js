import prisma from '../src/lib/prisma.js';
import { hinduSuccessionBearerActSections } from '../prisma/hinduSuccessionBearerActData.js';

const ACT_HEADING = 'THE HINDU SUCCESSION ACT, 1956';

async function runE2ETests() {
  console.log('--- Starting Comprehensive E2E Verification for The Hindu Succession Act, 1956 ---');

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
    const hsaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!hsaAct, 'Act exists under Personal BearerAct');
    assert(hsaAct.year === 1956, `Act year is 1956 (actual: ${hsaAct?.year})`);
    assert(hsaAct.act === ACT_HEADING, 'Act field matches heading');

    // 3. Verify total section count
    const totalSections = await prisma.actSection.count({
      where: { actId: hsaAct.id }
    });
    assert(totalSections === 31, `Act has exactly 31 sections in DB (actual: ${totalSections})`);
    assert(hinduSuccessionBearerActSections.length === 31, `Raw data has exactly 31 sections (actual: ${hinduSuccessionBearerActSections.length})`);

    // 4. Verify all 4 chapters
    const sections = await prisma.actSection.findMany({
      where: { actId: hsaAct.id },
      orderBy: { sectionOrder: 'asc' }
    });

    const expectedChapters = [
      { no: 1, name: 'PRELIMINARY', count: 4 },
      { no: 2, name: 'INTESTATE SUCCESSION', count: 25 },
      { no: 3, name: 'TESTAMENTARY SUCCESSION', count: 1 },
      { no: 4, name: 'REPEALS', count: 1 }
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
    assert(orderCorrect, 'All sections are strictly ascending by sectionOrder (1, 2, 3, ..., 31)');

    // 6. Verify sample section contents against PDF
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1.title === 'Short title and extent', 'Section 1 title matches PDF');
    assert(sec1.description.includes('This Act may be called the Hindu Succession Act, 1956'), 'Section 1 description matches PDF');

    const sec6 = sections.find(s => s.section === 'Section 6');
    assert(sec6.title === 'Devolution of interest in coparcenary property', 'Section 6 title matches PDF');
    assert(sec6.description.includes('Mitakshara coparcenary property'), 'Section 6 description matches PDF');

    const sec14 = sections.find(s => s.section === 'Section 14');
    assert(sec14.title === 'Property of a female Hindu to be her absolute property', 'Section 14 title matches PDF');
    assert(sec14.description.includes('held by her as full owner thereof and not as a limited owner'), 'Section 14 description matches PDF');

    const sec30 = sections.find(s => s.section === 'Section 30');
    assert(sec30.title === 'Testamentary succession', 'Section 30 title matches PDF');
    assert(sec30.description.includes('Any Hindu may dispose of by will or other testamentary disposition'), 'Section 30 description matches PDF');

    const sec31 = sections.find(s => s.section === 'Section 31');
    assert(sec31.title === '[Repeals.]', 'Section 31 title matches PDF');
    assert(sec31.description.includes('THE SCHEDULE') && sec31.description.includes('HEIRS IN CLASS I AND CLASS II'), 'Section 31 includes THE SCHEDULE text as per repo standard');

    // 7. Verify unrelated datasets are intact
    const ipcSectionCount = await prisma.iPCSection.count();
    const bnsSectionCount = await prisma.bNSSection.count();
    assert(ipcSectionCount > 0, `IPC legacy sections preserved (count: ${ipcSectionCount})`);
    assert(bnsSectionCount > 0, `BNS legacy sections preserved (count: ${bnsSectionCount})`);

    // Verify other Acts under Personal (e.g. Hindu Marriage Act) are intact
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    assert(!!hmaAct, 'THE HINDU MARRIAGE ACT, 1955 is preserved under Personal');
    if (hmaAct) {
      const hmaSections = await prisma.actSection.count({ where: { actId: hmaAct.id } });
      assert(hmaSections === 37, `Hindu Marriage Act sections preserved (count: ${hmaSections})`);
    }

    console.log(`\n=== Test Summary: ${passed} passed, ${failed} failed ===`);
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
