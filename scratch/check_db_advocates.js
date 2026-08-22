import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('Fetching latest advocates from database...');
  const advocates = await prisma.advocate.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  if (advocates.length === 0) {
    console.log('No advocates found in database.');
    return;
  }

  advocates.forEach(adv => {
    console.log(`\nName: ${adv.fullName}`);
    console.log(`Email: ${adv.email}`);
    console.log(`Aadhaar Verified: ${adv.aadhaarVerified}`);
    console.log(`Aadhaar Verification ID: ${adv.aadhaarVerificationId}`);
    console.log(`Aadhaar Verified At: ${adv.aadhaarVerifiedAt}`);
    console.log(`Attempts: ${adv.aadhaarVerificationAttempts}`);
    console.log(`Blocked Until: ${adv.aadhaarBlockedUntil}`);
  });
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
