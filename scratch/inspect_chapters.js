import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const acts = await prisma.act.findMany({
    include: {
      bearerAct: true,
      _count: { select: { sections: true } }
    }
  });

  console.log('--- Existing Acts in Database ---');
  for (const act of acts) {
    console.log(`Act: "${act.heading}" (ID: ${act.id}, Year: ${act.year}, Bearer: "${act.bearerAct?.name}") -> Sections: ${act._count.sections}`);
  }

  // Check unique chapters in existing act sections
  for (const act of acts) {
    const chapters = await prisma.actSection.findMany({
      where: { actId: act.id },
      select: { chapterNo: true, chapterName: true },
      distinct: ['chapterNo', 'chapterName'],
      orderBy: { chapterNo: 'asc' }
    });
    console.log(`\nChapters for Act "${act.heading}": ${chapters.length}`);
    chapters.slice(0, 10).forEach(c => console.log(`  Ch ${c.chapterNo}: ${c.chapterName}`));
  }

  const ipcSecCount = await prisma.iPCSection.count();
  console.log(`\nStandalone IPCSection table count: ${ipcSecCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
