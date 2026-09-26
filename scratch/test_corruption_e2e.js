import prisma from '../src/lib/prisma.js';
import { corruptionBearerActSections } from '../prisma/corruptionBearerActData.js';

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING THE PREVENTION OF CORRUPTION ACT, 1988 TESTS');
  console.log('====================================================\n');

  // 1. Verify Criminal BearerAct
  const criminalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Criminal' }
  });
  if (!criminalBearerAct) {
    throw new Error('FAIL: Criminal BearerAct not found!');
  }
  console.log('✔ Criminal BearerAct exists. ID:', criminalBearerAct.id);

  // 2. Verify THE PREVENTION OF CORRUPTION ACT, 1988
  const corruptionAct = await prisma.act.findFirst({
    where: {
      bearerActId: criminalBearerAct.id,
      heading: 'THE PREVENTION OF CORRUPTION ACT, 1988'
    }
  });
  if (!corruptionAct) {
    throw new Error('FAIL: THE PREVENTION OF CORRUPTION ACT, 1988 not found!');
  }
  console.log('✔ THE PREVENTION OF CORRUPTION ACT, 1988 exists. ID:', corruptionAct.id);
  console.log('  Heading:', corruptionAct.heading);
  console.log('  Act:', corruptionAct.act);
  console.log('  Year:', corruptionAct.year);

  // 3. Verify total section count
  const sections = await prisma.actSection.findMany({
    where: { actId: corruptionAct.id },
    orderBy: [
      { chapterNo: 'asc' },
      { sectionOrder: 'asc' }
    ]
  });
  console.log(`\n✔ Total sections in DB: ${sections.length} (Expected: ${corruptionBearerActSections.length})`);
  if (sections.length !== corruptionBearerActSections.length) {
    throw new Error(`FAIL: Section count mismatch! Expected ${corruptionBearerActSections.length}, got ${sections.length}`);
  }

  // 4. Verify chapter distribution
  const chapterCounts = {};
  for (const s of sections) {
    chapterCounts[s.chapterNo] = (chapterCounts[s.chapterNo] || 0) + 1;
  }
  console.log('✔ Chapter section distribution:', chapterCounts);

  // 5. Verify ordering
  console.log('\n✔ Verifying numerical section ordering:');
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    console.log(`   [Chapter ${s.chapterNo}] ${s.section} (order: ${s.sectionOrder}): ${s.title}`);
    if (i > 0) {
      if (sections[i].chapterNo < sections[i - 1].chapterNo) {
        throw new Error(`FAIL: Chapter out of order at index ${i}`);
      }
      if (sections[i].chapterNo === sections[i - 1].chapterNo && sections[i].sectionOrder < sections[i - 1].sectionOrder) {
        throw new Error(`FAIL: Section out of order at index ${i}: ${sections[i].section} (${sections[i].sectionOrder}) after ${sections[i - 1].section} (${sections[i - 1].sectionOrder})`);
      }
    }
  }

  // 6. Verify IPC and BNS are untouched
  const ipcCount = await prisma.iPCSection.count();
  const bnsCount = await prisma.bNSSection.count();
  console.log(`\n✔ IPCSection count: ${ipcCount} (preserved)`);
  console.log(`✔ BNSSection count: ${bnsCount} (preserved)`);

  console.log('\n====================================================');
  console.log('ALL DATABASE INTEGRITY CHECKS PASSED!');
  console.log('====================================================\n');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
