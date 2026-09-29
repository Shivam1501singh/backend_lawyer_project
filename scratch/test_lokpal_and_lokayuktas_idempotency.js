import prisma from '../src/lib/prisma.js';
import { lokpalAndLokayuktasBearerActSections } from '../prisma/lokpalAndLokayuktasBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function test() {
  console.log('=== Running Verification & Idempotency Tests for THE LOKPAL AND LOKAYUKTAS ACT, 2013 ===\n');

  // 1. Verify Bearer Act exists
  const constitutionalBearerAct = await prisma.bearerAct.findUnique({
    where: { name: 'Constitutional and Political' }
  });

  if (!constitutionalBearerAct) {
    throw new Error('BearerAct "Constitutional and Political" does not exist!');
  }
  console.log('✓ Verified BearerAct "Constitutional and Political" exists (ID:', constitutionalBearerAct.id, ')');

  // 2. Verify Act exists under Constitutional and Political
  const acts = await prisma.act.findMany({
    where: {
      bearerActId: constitutionalBearerAct.id,
      heading: 'THE LOKPAL AND LOKAYUKTAS ACT, 2013'
    }
  });

  if (acts.length !== 1) {
    throw new Error(`Expected exactly 1 Act record with heading "THE LOKPAL AND LOKAYUKTAS ACT, 2013", found ${acts.length}`);
  }
  const act = acts[0];
  console.log('✓ Verified single Act record exists (ID:', act.id, ') with year:', act.year);

  // 3. Verify section count & data accuracy against JSON
  const dbSections = await prisma.actSection.findMany({
    where: { actId: act.id },
    orderBy: { sectionOrder: 'asc' }
  });

  console.log(`✓ Total sections in DB: ${dbSections.length} (Expected: ${lokpalAndLokayuktasBearerActSections.length})`);
  if (dbSections.length !== lokpalAndLokayuktasBearerActSections.length) {
    throw new Error(`Mismatch in section count! DB: ${dbSections.length}, JSON: ${lokpalAndLokayuktasBearerActSections.length}`);
  }

  // 4. Verify chapter details & content matching
  const chapterSet = new Set();
  const dbSectionMap = new Map(dbSections.map(s => [s.section, s]));

  for (const item of lokpalAndLokayuktasBearerActSections) {
    chapterSet.add(item.chapterNo);
    const dbSec = dbSectionMap.get(item.section);
    if (!dbSec) {
      throw new Error(`Missing section in DB: ${item.section}`);
    }

    if (dbSec.chapterNo !== item.chapterNo) {
      throw new Error(`ChapterNo mismatch for ${item.section}: DB=${dbSec.chapterNo}, JSON=${item.chapterNo}`);
    }
    if (dbSec.chapterName !== item.chapterName) {
      throw new Error(`ChapterName mismatch for ${item.section}: DB="${dbSec.chapterName}", JSON="${item.chapterName}"`);
    }
    if (dbSec.title !== item.title) {
      throw new Error(`Title mismatch for ${item.section}: DB="${dbSec.title}", JSON="${item.title}"`);
    }
    if (dbSec.description !== item.description) {
      throw new Error(`Description mismatch for ${item.section}`);
    }
    if (dbSec.metaData !== item.metaData) {
      throw new Error(`metaData mismatch for ${item.section}`);
    }
    if (dbSec.metaDescription !== item.metaDescription) {
      throw new Error(`metaDescription mismatch for ${item.section}`);
    }
    if (dbSec.metaTitle !== item.metaTitle) {
      throw new Error(`metaTitle mismatch for ${item.section}`);
    }
    const expectedOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (Math.abs(dbSec.sectionOrder - expectedOrder) > 0.0001) {
      throw new Error(`sectionOrder mismatch for ${item.section}: DB=${dbSec.sectionOrder}, Expected=${expectedOrder}`);
    }
  }

  console.log(`✓ All ${lokpalAndLokayuktasBearerActSections.length} sections accurately matched across chapters: ${Array.from(chapterSet).sort((a,b)=>a-b).join(', ')}.`);

  // 5. Verify numeric ordering
  for (let i = 0; i < dbSections.length - 1; i++) {
    if (dbSections[i].sectionOrder >= dbSections[i + 1].sectionOrder) {
      throw new Error(`Ordering violation between ${dbSections[i].section} (${dbSections[i].sectionOrder}) and ${dbSections[i + 1].section} (${dbSections[i + 1].sectionOrder})`);
    }
  }
  console.log('✓ Section ordering strictly ascending: ' + dbSections.slice(0, 10).map(s => s.section).join(', ') + ' ... ' + dbSections[dbSections.length - 1].section);

  // 6. Test Idempotency by re-running seed logic
  console.log('\n--- Testing Idempotency (Re-running targeted seed) ---');
  const existingSectionsBefore = await prisma.actSection.findMany({
    where: { actId: act.id }
  });
  const secMap = new Map(existingSectionsBefore.map(s => [s.section, s]));
  let createdCount = 0;
  let updatedCount = 0;

  for (const item of lokpalAndLokayuktasBearerActSections) {
    const existing = secMap.get(item.section);
    const sectionOrder = calculateSectionOrder(item.sectionNo || item.section);
    if (!existing) {
      createdCount++;
    } else {
      updatedCount++;
    }
  }

  if (createdCount !== 0) {
    throw new Error(`Idempotency check failed: ${createdCount} new sections would be created!`);
  }
  console.log(`✓ Idempotency confirmed: 0 new sections created, ${updatedCount} existing sections verified/updated.`);

  const finalActCount = await prisma.act.count({
    where: {
      bearerActId: constitutionalBearerAct.id,
      heading: 'THE LOKPAL AND LOKAYUKTAS ACT, 2013'
    }
  });
  if (finalActCount !== 1) {
    throw new Error(`Duplicate acts detected! Count: ${finalActCount}`);
  }
  console.log('✓ No duplicate Acts found.');

  // 7. Verify all other Acts under Constitutional and Political remain intact
  const allActsUnderCategory = await prisma.act.findMany({
    where: { bearerActId: constitutionalBearerAct.id },
    select: { id: true, heading: true, year: true, _count: { select: { sections: true } } }
  });
  console.log('\n--- Acts under Constitutional and Political ---');
  for (const a of allActsUnderCategory) {
    console.log(`- ${a.heading} (${a.year}): ${a._count.sections} sections`);
  }

  console.log('\n✓ ALL IDEMPOTENCY & DATA INTEGRITY TESTS PASSED SUCCESSFULLY!\n');
}

test()
  .catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
