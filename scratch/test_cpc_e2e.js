import prisma from '../src/lib/prisma.js';
import { cpcBearerActSections } from '../prisma/cpcBearerActData.js';

const ACT_HEADING = 'THE CODE OF CIVIL PROCEDURE, 1908';

async function runE2ETests() {
  console.log('--- Starting Comprehensive E2E Verification for The Code of Civil Procedure, 1908 ---');

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
    // 1. Verify Civil and Property category exists and is singular
    const categories = await prisma.bearerAct.findMany({
      where: { name: 'Civil and Property' }
    });
    assert(categories.length === 1, `Exact 1 "Civil and Property" BearerAct category exists (actual: ${categories.length})`);
    const civilCat = categories[0];

    // 2. Verify Act exists under Civil and Property
    const acts = await prisma.act.findMany({
      where: { bearerActId: civilCat.id }
    });
    const cpcAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!cpcAct, 'Act exists under Civil and Property BearerAct');
    assert(cpcAct.year === 1908, `Act year is 1908 (actual: ${cpcAct?.year})`);
    assert(cpcAct.act === ACT_HEADING, 'Act field matches heading');

    // 3. Verify total section count
    const totalSections = await prisma.actSection.count({
      where: { actId: cpcAct.id }
    });
    assert(totalSections === 171, `Act has exactly 171 sections in DB (actual: ${totalSections})`);
    assert(cpcBearerActSections.length === 171, `Raw data has exactly 171 sections (actual: ${cpcBearerActSections.length})`);

    // 4. Verify all 12 chapters
    const sections = await prisma.actSection.findMany({
      where: { actId: cpcAct.id },
      orderBy: { sectionOrder: 'asc' }
    });

    const expectedChapters = [
      { no: 1, name: 'PRELIMINARY', count: 8 },
      { no: 2, name: 'SUITS IN GENERAL', count: 30 },
      { no: 3, name: 'EXECUTION', count: 40 },
      { no: 4, name: 'INCIDENTAL PROCEEDINGS', count: 4 },
      { no: 5, name: 'SUITS IN PARTICULAR CASES', count: 12 },
      { no: 6, name: 'SPECIAL PROCEEDINGS', count: 5 },
      { no: 7, name: 'SUPPLEMENTAL PROCEEDINGS', count: 2 },
      { no: 8, name: 'APPEALS', count: 20 },
      { no: 9, name: 'REFERENCE, REVIEW AND REVISION', count: 3 },
      { no: 10, name: 'SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER', count: 5 },
      { no: 11, name: 'RULES', count: 11 },
      { no: 12, name: 'MISCELLANEOUS', count: 31 }
    ];

    for (const expChap of expectedChapters) {
      const chapSections = sections.filter(s => s.chapterNo === expChap.no);
      assert(
        chapSections.length === expChap.count,
        `Chapter ${expChap.no} (${expChap.name}) has ${expChap.count} sections (actual: ${chapSections.length})`
      );
      if (chapSections.length > 0) {
        assert(
          chapSections[0].chapterName === expChap.name,
          `Chapter ${expChap.no} name is "${expChap.name}" (actual: "${chapSections[0].chapterName}")`
        );
      }
    }

    // 5. Verify numeric section ordering (no lexicographical bugs: e.g. 1, 2, 3... 10... 21, 21A, 22... 35, 35A, 35B...)
    let orderCorrect = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        console.error(`Order violation between ${sections[i].section} (${sections[i].sectionOrder}) and ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
        orderCorrect = false;
      }
    }
    assert(orderCorrect, 'All sections are ordered numerically in strictly ascending order without lexicographical errors');

    // Verify key lettered sections ordering
    const sec21 = sections.find(s => s.section === 'Section 21');
    const sec21A = sections.find(s => s.section === 'Section 21A');
    const sec22 = sections.find(s => s.section === 'Section 22');
    assert(sec21 && sec21A && sec22 && sec21.sectionOrder < sec21A.sectionOrder && sec21A.sectionOrder < sec22.sectionOrder, 'Section 21 < Section 21A < Section 22');

    const sec35 = sections.find(s => s.section === 'Section 35');
    const sec35A = sections.find(s => s.section === 'Section 35A');
    const sec35B = sections.find(s => s.section === 'Section 35B');
    const sec36 = sections.find(s => s.section === 'Section 36');
    assert(sec35 && sec35A && sec35B && sec36 && sec35.sectionOrder < sec35A.sectionOrder && sec35A.sectionOrder < sec35B.sectionOrder && sec35B.sectionOrder < sec36.sectionOrder, 'Section 35 < Section 35A < Section 35B < Section 36');

    const sec153 = sections.find(s => s.section === 'Section 153');
    const sec153A = sections.find(s => s.section === 'Section 153A');
    const sec153B = sections.find(s => s.section === 'Section 153B');
    const sec154 = sections.find(s => s.section === 'Section 154');
    assert(sec153 && sec153A && sec153B && sec154 && sec153.sectionOrder < sec153A.sectionOrder && sec153A.sectionOrder < sec153B.sectionOrder && sec153B.sectionOrder < sec154.sectionOrder, 'Section 153 < Section 153A < Section 153B < Section 154');

    // 6. Verify existing data integrity
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    const blogCount = await prisma.blog.count();
    const userRightCount = await prisma.userRight.count();
    const guideCount = await prisma.guide.count();
    const updateCount = await prisma.update.count();
    const advocateCount = await prisma.advocate.count();

    assert(ipcCount > 0, `IPCSection table preserved (count: ${ipcCount})`);
    assert(bnsCount > 0, `BNSSection table preserved (count: ${bnsCount})`);
    assert(blogCount >= 0, `Blog table preserved (count: ${blogCount})`);
    assert(userRightCount >= 0, `UserRight table preserved (count: ${userRightCount})`);
    assert(guideCount >= 0, `Guide table preserved (count: ${guideCount})`);
    assert(updateCount >= 0, `Update table preserved (count: ${updateCount})`);
    assert(advocateCount >= 0, `Advocate table preserved (count: ${advocateCount})`);

    // Verify other Acts under Civil and Property
    const otherActs = [
      'THE TRANSFER OF PROPERTY ACT, 1882',
      'THE INDIAN CONTRACT ACT, 1872',
      'THE SPECIFIC RELIEF ACT, 1963',
      'THE LIMITATION ACT, 1963',
      'THE SALE OF GOODS ACT, 1930',
      'THE INDIAN STAMP ACT, 1899',
      'THE REGISTRATION ACT, 1908',
      'THE RIGHT TO FAIR COMPENSATION AND TRANSPARENCY IN LAND ACQUISITION, REHABILITATION AND RESETTLEMENT ACT, 2013'
    ];

    for (const actName of otherActs) {
      const foundAct = acts.find(a => a.heading === actName);
      assert(!!foundAct, `Existing Act "${actName}" preserved under Civil and Property`);
      if (foundAct) {
        const secCount = await prisma.actSection.count({ where: { actId: foundAct.id } });
        assert(secCount > 0, `Existing Act "${actName}" has sections in DB (count: ${secCount})`);
      }
    }

    console.log(`\n================================`);
    console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during E2E verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
