import prisma from '../src/lib/prisma.js';
import { landAcquisitionBearerActSections } from '../prisma/landAcquisitionBearerActData.js';

const ACT_HEADING = 'THE RIGHT TO FAIR COMPENSATION AND TRANSPARENCY IN LAND ACQUISITION, REHABILITATION AND RESETTLEMENT ACT, 2013';

async function runE2ETests() {
  console.log('--- Starting Comprehensive E2E Verification for Land Acquisition Act ---');

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
    const laAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!laAct, 'Act exists under Civil and Property BearerAct');
    assert(laAct.year === 2013, `Act year is 2013 (actual: ${laAct?.year})`);
    assert(laAct.act === ACT_HEADING, 'Act field matches heading');

    // 3. Verify total section count
    const totalSections = await prisma.actSection.count({
      where: { actId: laAct.id }
    });
    assert(totalSections === 114, `Act has exactly 114 sections in DB (actual: ${totalSections})`);
    assert(landAcquisitionBearerActSections.length === 114, `Raw data has exactly 114 sections (actual: ${landAcquisitionBearerActSections.length})`);

    // 4. Verify all chapters
    const sections = await prisma.actSection.findMany({
      where: { actId: laAct.id },
      orderBy: { sectionOrder: 'asc' }
    });

    const expectedChapters = [
      { no: 1, name: 'PRELIMINARY', count: 3 },
      { no: 2, name: 'DETERMINATION OF SOCIAL IMPACT AND PUBLIC PURPOSE', count: 6 },
      { no: 3, name: 'SPECIAL PROVISION TO SAFEGUARD FOOD SECURITY', count: 1 },
      { no: 4, name: 'NOTIFICATION AND ACQUISITION', count: 20 },
      { no: 5, name: 'REHABILITATION AND RESETTLEMENT AWARD', count: 12 },
      { no: 6, name: 'PROCEDURE AND MANNER OF REHABILITATION AND RESETTLEMENT', count: 5 },
      { no: 7, name: 'NATIONAL MONITORING COMMITTEE FOR REHABILITATION AND RESETTLEMENT', count: 3 },
      { no: 8, name: 'ESTABLISHMENT OF LAND ACQUISITION, REHABILITATION AND RESETTLEMENT AUTHORITY', count: 24 },
      { no: 9, name: 'APPORTIONMENT OF COMPENSATION', count: 2 },
      { no: 10, name: 'PAYMENT', count: 4 },
      { no: 11, name: 'TEMPORARY OCCUPATION OF LAND', count: 3 },
      { no: 12, name: 'OFFENCES AND PENALTIES', count: 7 },
      { no: 13, name: 'MISCELLANEOUS', count: 24 }
    ];

    for (const expChap of expectedChapters) {
      const chapSections = sections.filter(s => s.chapterNo === expChap.no);
      assert(
        chapSections.length === expChap.count,
        `Chapter ${expChap.no} (${expChap.name}) has ${expChap.count} sections (actual: ${chapSections.length})`
      );
      const allNamesMatch = chapSections.every(s => s.chapterName === expChap.name);
      assert(allNamesMatch, `Chapter ${expChap.no} section chapterName values match '${expChap.name}'`);
    }

    // 5. Verify numerical ordering is preserved
    let isSorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        isSorted = false;
        console.error(`Sort order error: ${sections[i].section} (${sections[i].sectionOrder}) vs ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
      }
    }
    assert(isSorted, 'Sections strictly adhere to ascending numeric order');

    // 6. Verify first and last section details
    const firstSec = sections[0];
    assert(firstSec.section === 'Section 1', 'First section is Section 1');
    assert(firstSec.title === 'Short title, extent and commencement', 'Section 1 title matches');

    const lastSec = sections[sections.length - 1];
    assert(lastSec.section === 'Section 114', 'Last section is Section 114');
    assert(lastSec.title === 'Repeal and saving', 'Section 114 title matches');
    assert(lastSec.description.includes('THE FIRST SCHEDULE'), 'Section 114 description includes THE FIRST SCHEDULE');
    assert(lastSec.description.includes('THE SECOND SCHEDULE'), 'Section 114 description includes THE SECOND SCHEDULE');
    assert(lastSec.description.includes('THE THIRD SCHEDULE'), 'Section 114 description includes THE THIRD SCHEDULE');
    assert(lastSec.description.includes('THE FOURTH SCHEDULE'), 'Section 114 description includes THE FOURTH SCHEDULE');
    assert(lastSec.description.includes('THE FIFTH SCHEDULE'), 'Section 114 description includes THE FIFTH SCHEDULE state amendment');

    // 7. Verify other Acts under Civil and Property remain intact
    const tpaAct = acts.find(a => a.heading.includes('TRANSFER OF PROPERTY'));
    assert(!!tpaAct, 'Transfer of Property Act exists under Civil and Property');
    const contractAct = acts.find(a => a.heading.includes('CONTRACT'));
    assert(!!contractAct, 'Contract Act exists under Civil and Property');
    const sraAct = acts.find(a => a.heading.includes('SPECIFIC RELIEF'));
    assert(!!sraAct, 'Specific Relief Act exists under Civil and Property');
    const limAct = acts.find(a => a.heading.includes('LIMITATION'));
    assert(!!limAct, 'Limitation Act exists under Civil and Property');
    const sogaAct = acts.find(a => a.heading.includes('SALE OF GOODS'));
    assert(!!sogaAct, 'Sale of Goods Act exists under Civil and Property');
    const stampAct = acts.find(a => a.heading.includes('INDIAN STAMP'));
    assert(!!stampAct, 'Indian Stamp Act exists under Civil and Property');
    const regAct = acts.find(a => a.heading.includes('REGISTRATION'));
    assert(!!regAct, 'Registration Act exists under Civil and Property');

    // 8. Verify Legacy IPC and BNS tables remain intact
    const ipcCount = await prisma.iPCSection.count();
    assert(ipcCount === 576, `Legacy IPCSection count is intact at 576 (actual: ${ipcCount})`);

    const bnsCount = await prisma.bNSSection.count();
    assert(bnsCount === 358, `Legacy BNSSection count is intact at 358 (actual: ${bnsCount})`);

    console.log(`\n========================================`);
    console.log(`E2E TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('E2E Verification Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
