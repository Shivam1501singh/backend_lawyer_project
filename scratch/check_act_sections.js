import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.actSection.count();
  console.log(`Current ActSection count: ${count}`);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
