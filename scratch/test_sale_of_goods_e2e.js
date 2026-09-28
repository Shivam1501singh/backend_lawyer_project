import prisma from '../src/lib/prisma.js';
import { saleOfGoodsBearerActSections } from '../prisma/saleOfGoodsBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function runE2EValidation() {
  console.log('================================================================');
  console.log('  STARTING E2E VALIDATION FOR THE SALE OF GOODS ACT, 1930');
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
    assert(civilCategory.acts.length >= 5, `Civil and Property has at least 5 Acts (actual: ${civilCategory.acts.length})`);

    // 2. Verify THE SALE OF GOODS ACT, 1930 Act record
    const sogAct = civilCategory.acts.find(a => a.heading === 'THE SALE OF GOODS ACT, 1930');
    assert(!!sogAct, 'THE SALE OF GOODS ACT, 1930 exists under Civil and Property');
    assert(sogAct.year === 1930, `Act year is 1930 (actual: ${sogAct.year})`);

    // 3. Verify total sections count
    const sections = await prisma.actSection.findMany({
      where: { actId: sogAct.id },
      orderBy: { sectionOrder: 'asc' }
    });
    assert(sections.length === 67, `Exactly 67 sections in DB for Sale of Goods Act (actual: ${sections.length})`);

    // 4. Verify numeric ordering
    let isSorted = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder > sections[i + 1].sectionOrder) {
        isSorted = false;
        console.error(`Order violation: ${sections[i].section} (${sections[i].sectionOrder}) > ${sections[i + 1].section} (${sections[i + 1].sectionOrder})`);
      }
    }
    assert(isSorted, 'All 67 sections are in strict numeric order');

    // 5. Verify Section 1, Section 64, Section 64A, Section 65, Section 66
    const sec1 = sections[0];
    assert(sec1.section === 'Section 1' && sec1.sectionOrder === 1, 'First section is Section 1 with order 1');
    
    const idx64 = sections.findIndex(s => s.section === 'Section 64');
    const idx64A = sections.findIndex(s => s.section === 'Section 64A');
    const idx65 = sections.findIndex(s => s.section === 'Section 65');
    const idx66 = sections.findIndex(s => s.section === 'Section 66');

    assert(idx64 !== -1 && idx64A !== -1 && idx65 !== -1 && idx66 !== -1, 'Sections 64, 64A, 65, 66 exist');
    assert(idx64 < idx64A && idx64A < idx65 && idx65 < idx66, `Order is 64 -> 64A -> 65 -> 66 (indices: ${idx64}, ${idx64A}, ${idx65}, ${idx66})`);
    assert(sections[idx64A].sectionOrder === 64.01, `Section 64A order is 64.01 (actual: ${sections[idx64A].sectionOrder})`);

    // 6. Verify distinct chapters
    const chapters = await prisma.actSection.findMany({
      where: { actId: sogAct.id },
      select: { chapterNo: true, chapterName: true },
      distinct: ['chapterNo'],
      orderBy: { chapterNo: 'asc' }
    });
    assert(chapters.length === 7, `All 7 chapters are present (actual: ${chapters.length})`);
    const expectedChapters = [
      { no: 1, name: 'PRELIMINARY' },
      { no: 2, name: 'FORMATION OF THE CONTRACT' },
      { no: 3, name: 'EFFECTS OF THE CONTRACT' },
      { no: 4, name: 'PERFORMANCE OF THE CONTRACT' },
      { no: 5, name: 'RIGHTS OF UNPAID SELLER AGAINST THE GOODS' },
      { no: 6, name: 'SUITS FOR BREACH OF THE CONTRACT' },
      { no: 7, name: 'MISCELLANEOUS' }
    ];
    let chaptersMatch = true;
    for (let i = 0; i < expectedChapters.length; i++) {
      if (chapters[i]?.chapterNo !== expectedChapters[i].no || chapters[i]?.chapterName !== expectedChapters[i].name) {
        chaptersMatch = false;
        console.error(`Chapter mismatch at index ${i}: expected ${JSON.stringify(expectedChapters[i])}, got ${JSON.stringify(chapters[i])}`);
      }
    }
    assert(chaptersMatch, 'All 7 chapter numbers and names match the PDF exactly');

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
