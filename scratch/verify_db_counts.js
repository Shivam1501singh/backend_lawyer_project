import prisma from '../src/lib/prisma.js';

async function verifyCounts() {
  const bearerActs = await prisma.bearerAct.count();
  const civilCat = await prisma.bearerAct.findUnique({
    where: { name: 'Civil and Property' },
    include: {
      acts: {
        include: {
          _count: {
            select: { sections: true }
          }
        }
      }
    }
  });

  console.log(`Total BearerActs in DB: ${bearerActs}`);
  console.log(`Acts under "Civil and Property":`);
  for (const act of civilCat.acts) {
    console.log(` - [${act.year}] ${act.heading}: ${act._count.sections} sections`);
  }

  const limAct = civilCat.acts.find(a => a.heading === 'THE LIMITATION ACT, 1963');
  const limSections = await prisma.actSection.findMany({
    where: { actId: limAct.id },
    orderBy: { sectionOrder: 'asc' },
    select: { section: true, sectionOrder: true, chapterNo: true, chapterName: true, title: true }
  });

  console.log(`\nSample Limitation Act Sections:`);
  console.log(`First:`, limSections[0]);
  console.log(`Middle (Sec 15):`, limSections[14]);
  console.log(`Last:`, limSections[limSections.length - 1]);

  await prisma.$disconnect();
}

verifyCounts();
