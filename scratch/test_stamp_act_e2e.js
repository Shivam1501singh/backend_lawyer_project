import prisma from '../src/lib/prisma.js';
import { indianStampBearerActSections } from '../prisma/indianStampBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2EValidation() {
  console.log('================================================================');
  console.log('  STARTING E2E VALIDATION FOR THE INDIAN STAMP ACT, 1899');
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
    assert(civilCategory.acts.length >= 6, `Civil and Property has at least 6 Acts (actual: ${civilCategory.acts.length})`);

    // 2. Verify THE INDIAN STAMP ACT, 1899 Act record
    const stampAct = civilCategory.acts.find(a => a.heading === 'THE INDIAN STAMP ACT, 1899');
    assert(!!stampAct, 'THE INDIAN STAMP ACT, 1899 exists under Civil and Property');
    assert(stampAct.year === 1899, `Act year is 1899 (actual: ${stampAct.year})`);

    // 3. Verify total sections count
    const sections = await prisma.actSection.findMany({
      where: { actId: stampAct.id },
      orderBy: { sectionOrder: 'asc' }
    });
    assert(sections.length === 95, `Exactly 95 sections in DB for Indian Stamp Act (actual: ${sections.length})`);

    // 4. Verify numeric ordering
    let isSorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder >= sections[i + 1].sectionOrder) {
        isSorted = false;
        console.error(`Order violation: ${sections[i].section} (${sections[i].sectionOrder}) >= ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
      }
    }
    assert(isSorted, 'All 95 sections are in strict increasing numeric order');

    // 5. Verify special sections (3, 3-A, 3-AA, 6-A, 10-A, 11-A, 19-A, 23-A, 47-A, 48-A, 54-A, 54-B, 64-A, 64-B, 73-A, 76-A, 77-A)
    const checkSections = [
      { sec: 'Section 3', order: 3 },
      { sec: 'Section 3-A', order: 3.01 },
      { sec: 'Section 3-AA', order: 3.0101 },
      { sec: 'Section 6-A', order: 6.01 },
      { sec: 'Section 10-A', order: 10.01 },
      { sec: 'Section 11-A', order: 11.01 },
      { sec: 'Section 19-A', order: 19.01 },
      { sec: 'Section 23-A', order: 23.01 },
      { sec: 'Section 47-A', order: 47.01 },
      { sec: 'Section 48-A', order: 48.01 },
      { sec: 'Section 54-A', order: 54.01 },
      { sec: 'Section 54-B', order: 54.02 },
      { sec: 'Section 64-A', order: 64.01 },
      { sec: 'Section 64-B', order: 64.02 },
      { sec: 'Section 73-A', order: 73.01 },
      { sec: 'Section 76-A', order: 76.01 },
      { sec: 'Section 77-A', order: 77.01 }
    ];

    for (const c of checkSections) {
      const found = sections.find(s => s.section === c.sec);
      assert(!!found && found.sectionOrder === c.order, `${c.sec} exists with expected order ${c.order} (actual: ${found?.sectionOrder})`);
    }

    // 6. Verify distinct chapters
    const chapters = await prisma.actSection.findMany({
      where: { actId: stampAct.id },
      select: { chapterNo: true, chapterName: true },
      distinct: ['chapterNo'],
      orderBy: { chapterNo: 'asc' }
    });
    assert(chapters.length === 8, `All 8 chapters are present (actual: ${chapters.length})`);
    const expectedChapters = [
      { no: 1, name: 'PRELIMINARY' },
      { no: 2, name: 'STAMP DUTIES' },
      { no: 3, name: 'ADJUDICATION AS TO STAMPS' },
      { no: 4, name: 'INSTRUMENT NOT DULY STAMPED' },
      { no: 5, name: 'ALLOWANCE FOR STAMPS IN CERTAIN CASES' },
      { no: 6, name: 'REFERENCE AND REVISION' },
      { no: 7, name: 'CRIMINAL OFFENCES AND PROCEDURE' },
      { no: 8, name: 'SUPPLEMENTARY PROVISIONS' }
    ];
    let chaptersMatch = true;
    for (let i = 0; i < expectedChapters.length; i++) {
      if (chapters[i]?.chapterNo !== expectedChapters[i].no || chapters[i]?.chapterName !== expectedChapters[i].name) {
        chaptersMatch = false;
        console.error(`Chapter mismatch at index ${i}: expected ${JSON.stringify(expectedChapters[i])}, got ${JSON.stringify(chapters[i])}`);
      }
    }
    assert(chaptersMatch, 'All 8 chapter numbers and names match the PDF exactly');

    // 7. Verify other Acts under Civil and Property
    const tpaAct = civilCategory.acts.find(a => a.heading === 'THE TRANSFER OF PROPERTY ACT, 1882');
    assert(!!tpaAct, 'Transfer of Property Act remains intact');
    const tpaSections = await prisma.actSection.count({ where: { actId: tpaAct.id } });
    assert(tpaSections === 148, `Transfer of Property has 148 sections (actual: ${tpaSections})`);

    const contractAct = civilCategory.acts.find(a => a.heading === 'THE INDIAN CONTRACT ACT, 1872');
    assert(!!contractAct, 'Indian Contract Act remains intact');
    const contractSections = await prisma.actSection.count({ where: { actId: contractAct.id } });
    assert(contractSections === 268, `Indian Contract Act has 268 sections (actual: ${contractSections})`);

    const sraAct = civilCategory.acts.find(a => a.heading === 'THE SPECIFIC RELIEF ACT, 1963');
    assert(!!sraAct, 'Specific Relief Act remains intact');
    const sraSections = await prisma.actSection.count({ where: { actId: sraAct.id } });
    assert(sraSections === 48, `Specific Relief Act has 48 sections (actual: ${sraSections})`);

    const limAct = civilCategory.acts.find(a => a.heading === 'THE LIMITATION ACT, 1963');
    assert(!!limAct, 'Limitation Act remains intact');
    const limSections = await prisma.actSection.count({ where: { actId: limAct.id } });
    assert(limSections === 32, `Limitation Act has 32 sections (actual: ${limSections})`);

    const sogAct = civilCategory.acts.find(a => a.heading === 'THE SALE OF GOODS ACT, 1930');
    assert(!!sogAct, 'Sale of Goods Act remains intact');
    const sogSections = await prisma.actSection.count({ where: { actId: sogAct.id } });
    assert(sogSections === 67, `Sale of Goods Act has 67 sections (actual: ${sogSections})`);

    // 8. Verify legacy IPC and BNS datasets
    const ipcCount = await prisma.iPCSection.count();
    const bnsCount = await prisma.bNSSection.count();
    assert(ipcCount === 576, `Legacy IPC sections intact: 576 (actual: ${ipcCount})`);
    assert(bnsCount === 358, `Legacy BNS sections intact: 358 (actual: ${bnsCount})`);

    console.log(`\n================================================================`);
    console.log(`  E2E VALIDATION RESULT: ${passed + failed} TOTAL | ${passed} PASSED | ${failed} FAILED`);
    console.log(`================================================================\n`);
  } catch (err) {
    console.error('E2E Validation error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runE2EValidation();
