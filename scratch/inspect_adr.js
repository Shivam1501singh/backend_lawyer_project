import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspect() {
  const bearerActs = await prisma.bearerAct.findMany({
    include: {
      acts: {
        include: {
          _count: { select: { sections: true } }
        }
      }
    }
  });
  console.log(JSON.stringify(bearerActs.map(b => ({
    id: b.id,
    name: b.name,
    acts: b.acts.map(a => ({ id: a.id, heading: a.heading, year: a.year, sectionsCount: a._count.sections }))
  })), null, 2));
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
