import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('Renaming database column casesWon -> casesHandled...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Advocate" RENAME COLUMN "casesWon" TO "casesHandled";');
    console.log('✅ Successfully renamed column casesWon to casesHandled in database.');
  } catch (err) {
    if (err.message.includes('does not exist')) {
      console.log('Column casesWon does not exist or already renamed to casesHandled.');
    } else {
      console.error('Error executing column rename:', err);
    }
  }
}

main().finally(() => prisma.$disconnect());
