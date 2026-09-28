import prisma from '../src/lib/prisma.js';
import { registrationBearerActSections } from '../prisma/registrationBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2EValidation() {
  console.log('================================================================');
  console.log('  STARTING E2E VALIDATION FOR THE REGISTRATION ACT, 1908');
  console.log('================================================================');

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
    // 1. Verify Civil and Property BearerAct
    const civilCategory = await prisma.bearerAct.findUnique({
      where: { name: 'Civil and Property' },
      include: { acts: true }
    });
    assert(!!civilCategory, 'Civil and Property BearerAct exists in DB');
    assert(civilCategory.acts.length >= 7, `Civil and Property has at least 7 Acts (actual: ${civilCategory.acts.length})`);

    // 2. Verify THE REGISTRATION ACT, 1908 Act record
    const regAct = civilCategory.acts.find(a => a.heading === 'THE REGISTRATION ACT, 1908');
    assert(!!regAct, 'THE REGISTRATION ACT, 1908 exists under Civil and Property');
    assert(regAct.year === 1908, `Act year is 1908 (actual: ${regAct.year})`);

    // 3. Verify total sections count
    const sections = await prisma.actSection.findMany({
      where: { actId: regAct.id },
      orderBy: { sectionOrder: 'asc' }
    });
    assert(sections.length === 96, `Exactly 96 sections in DB for Registration Act (actual: ${sections.length})`);

    // 4. Verify numeric ordering
    let isSorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        isSorted = false;
        console.error(`Order violation: ${sections[i].section} (${sections[i].sectionOrder}) >= ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
      }
    }
    assert(isSorted, 'All 96 sections are in strict increasing numeric order');

    // 5. Verify lettered sections (16A, 23A, 32A)
    const checkSections = [
      { sec: 'Section 16', order: 16 },
      { sec: 'Section 16A', order: 16.01 },
      { sec: 'Section 17', order: 17 },
      { sec: 'Section 23', order: 23 },
      { sec: 'Section 23A', order: 23.01 },
      { sec: 'Section 24', order: 24 },
      { sec: 'Section 32', order: 32 },
      { sec: 'Section 32A', order: 32.01 },
      { sec: 'Section 33', order: 33 },
      { sec: 'Section 93', order: 93 }
    ];

    for (const c of checkSections) {
      const found = sections.find(s => s.section === c.sec);
      assert(!!found && found.sectionOrder === c.order, `${c.sec} exists with expected order ${c.order} (actual: ${found?.sectionOrder})`);
    }

    // 6. Verify distinct chapters (Parts I through XV)
    const chapters = await prisma.actSection.findMany({
      where: { actId: regAct.id },
      select: { chapterNo: true, chapterName: true },
      distinct: ['chapterNo'],
      orderBy: { chapterNo: 'asc' }
    });
    assert(chapters.length === 15, `All 15 chapters/parts are present (actual: ${chapters.length})`);
    
    const expectedChapters = [
      { no: 1, name: 'PRELIMINARY' },
      { no: 2, name: 'OF THE REGISTRATION-ESTABLISHMENT' },
      { no: 3, name: 'OF REGISTRABLE DOCUMENTS' },
      { no: 4, name: 'OF THE TIME OF PRESENTATION' },
      { no: 5, name: 'OF THE PLACE OF REGISTRATION' },
      { no: 6, name: 'OF PRESENTING DOCUMENTS FOR REGISTRATION' },
      { no: 7, name: 'OF ENFORCING THE APPEARANCE OF EXECUTANTS AND WITNESSES' },
      { no: 8, name: 'OF PRESENTING WILLS AND AUTHORITIES TO ADOPT' },
      { no: 9, name: 'OF THE DEPOSIT OF WILLS' },
      { no: 10, name: 'OF THE EFFECTS OF REGISTRATION AND NON-REGISTRATION' },
      { no: 11, name: 'OF THE DUTIES AND POWERS OF REGISTERING OFFICERS' },
      { no: 12, name: 'OF REFUSAL TO REGISTER' },
      { no: 13, name: 'OF THE FEES FOR REGISTRATION, SEARCHES AND COPIES' },
      { no: 14, name: 'OF PENALTIES' },
      { no: 15, name: 'MISCELLANEOUS' }
    ];
    let chaptersMatch = true;
    for (let i = 0; i < expectedChapters.length; i++) {
      if (chapters[i]?.chapterNo !== expectedChapters[i].no || chapters[i]?.chapterName !== expectedChapters[i].name) {
        chaptersMatch = false;
        console.error(`Chapter mismatch at index ${i}: expected (${expectedChapters[i].no}, ${expectedChapters[i].name}), got (${chapters[i]?.chapterNo}, ${chapters[i]?.chapterName})`);
      }
    }
    assert(chaptersMatch, 'All 15 chapter numbers and names match the expected structure');

    // 7. Verify sample section content
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1.title === 'Short title, extent and commencement', `Section 1 title: ${sec1.title}`);
    assert(sec1.description.includes('Registration Act, 1908'), 'Section 1 description contains Registration Act, 1908');

    const sec17 = sections.find(s => s.section === 'Section 17');
    assert(sec17.title === 'Documents of which registration is compulsory', `Section 17 title: ${sec17.title}`);
    assert(sec17.description.includes('instruments of gift of immovable property'), 'Section 17 description verified');

    const sec93 = sections.find(s => s.section === 'Section 93');
    assert(sec93.description.includes('THE SCHEDULE'), 'Section 93 description includes THE SCHEDULE');

    // 8. Verify other Civil and Property Acts are intact
    const expectedOtherActs = [
      'THE TRANSFER OF PROPERTY ACT, 1882',
      'THE INDIAN CONTRACT ACT, 1872',
      'THE SPECIFIC RELIEF ACT, 1963',
      'THE LIMITATION ACT, 1963',
      'THE SALE OF GOODS ACT, 1930',
      'THE INDIAN STAMP ACT, 1899'
    ];
    for (const actName of expectedOtherActs) {
      const foundAct = civilCategory.acts.find(a => a.heading === actName);
      assert(!!foundAct, `Existing act intact: ${actName}`);
      if (foundAct) {
        const count = await prisma.actSection.count({ where: { actId: foundAct.id } });
        assert(count > 0, `${actName} has ${count} sections in DB`);
      }
    }

    // 9. Verify legacy IPC and BNS datasets remain intact
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `Legacy IPCSection table untouched: exactly 576 sections (actual: ${ipcCount})`);
    assert(bnsCount === 358, `Legacy BNSSection table untouched: exactly 358 sections (actual: ${bnsCount})`);

    console.log('================================================================');
    console.log(`  E2E VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in E2E validation:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2EValidation();
