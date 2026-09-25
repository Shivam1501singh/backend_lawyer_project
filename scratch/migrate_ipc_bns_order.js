import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

async function migrateExistingData() {
  console.log('--- Starting Fast IPC and BNS Section Data Normalization & Migration ---');

  // 1. Normalize and migrate IPC Sections
  const ipcSections = await prisma.iPCSection.findMany();
  console.log(`Found ${ipcSections.length} IPC Sections in database to normalize/update...`);

  if (ipcSections.length > 0) {
    const cases = ipcSections.map(s => {
      const order = calculateSectionOrder(s.sectionNo);
      return `WHEN id = '${s.id}' THEN ${order}`;
    }).join(' ');

    const ids = ipcSections.map(s => `'${s.id}'`).join(',');
    await prisma.$executeRawUnsafe(`
      UPDATE "IPCSection"
      SET "sectionOrder" = CASE ${cases} END
      WHERE id IN (${ids});
    `);
    console.log(`Successfully updated ${ipcSections.length} IPC Section records with sectionOrder via batch SQL.`);
  }

  // 2. Normalize and migrate BNS Sections
  const bnsSections = await prisma.bNSSection.findMany();
  console.log(`Found ${bnsSections.length} BNS Sections in database to normalize/update...`);

  if (bnsSections.length > 0) {
    const cases = bnsSections.map(s => {
      const order = calculateSectionOrder(s.sectionNo);
      return `WHEN id = '${s.id}' THEN ${order}`;
    }).join(' ');

    const ids = bnsSections.map(s => `'${s.id}'`).join(',');
    await prisma.$executeRawUnsafe(`
      UPDATE "BNSSection"
      SET "sectionOrder" = CASE ${cases} END
      WHERE id IN (${ids});
    `);
    console.log(`Successfully updated ${bnsSections.length} BNS Section records with sectionOrder via batch SQL.`);
  }

  // 3. Verification check
  const top15Ipc = await prisma.iPCSection.findMany({
    take: 15,
    orderBy: { sectionOrder: 'asc' },
    select: { sectionNo: true, sectionOrder: true, heading: true }
  });
  console.log('\nTop 15 IPC Sections ordered by sectionOrder:');
  console.log(top15Ipc.map(s => `${s.sectionNo} (order: ${s.sectionOrder}) -> ${s.heading.slice(0, 30)}...`).join('\n'));

  const top15Bns = await prisma.bNSSection.findMany({
    take: 15,
    orderBy: { sectionOrder: 'asc' },
    select: { sectionNo: true, sectionOrder: true, heading: true }
  });
  console.log('\nTop 15 BNS Sections ordered by sectionOrder:');
  console.log(top15Bns.map(s => `${s.sectionNo} (order: ${s.sectionOrder}) -> ${s.heading.slice(0, 30)}...`).join('\n'));

  console.log('\n--- Migration & Normalization Completed Successfully ---');
  await prisma.$disconnect();
}

migrateExistingData().catch(async (err) => {
  console.error('Migration error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
