import { execSync } from 'child_process';
import prisma from '../src/lib/prisma.js';

const ACT_HEADING = 'THE DOWRY PROHIBITION ACT, 1961';

async function testIdempotency() {
  console.log('Testing Idempotency for THE DOWRY PROHIBITION ACT, 1961...');

  // Get initial state
  const personal = await prisma.bearerAct.findUnique({
    where: { name: 'Personal' }
  });

  const initialActs = await prisma.act.findMany({
    where: {
      bearerActId: personal.id,
      heading: ACT_HEADING
    },
    include: {
      sections: true
    }
  });

  console.log(`Initial: ${initialActs.length} Act record(s), ${initialActs[0]?.sections.length || 0} sections.`);

  // Execute seed script a 2nd time
  console.log('\nRunning scratch/run_dowry_seed.js again...');
  const output = execSync('node scratch/run_dowry_seed.js', { encoding: 'utf-8' });
  console.log(output);

  // Check state again
  const postActs = await prisma.act.findMany({
    where: {
      bearerActId: personal.id,
      heading: ACT_HEADING
    },
    include: {
      sections: true
    }
  });

  console.log(`Post re-seed: ${postActs.length} Act record(s), ${postActs[0]?.sections.length || 0} sections.`);

  let passed = true;
  if (postActs.length !== 1) {
    console.error(`❌ FAIL: Expected exactly 1 Act record, found ${postActs.length}`);
    passed = false;
  } else {
    console.log(`✅ PASS: Exactly 1 Act record exists under Personal`);
  }

  if (postActs[0]?.sections.length !== 13) {
    console.error(`❌ FAIL: Expected 13 sections, found ${postActs[0]?.sections.length}`);
    passed = false;
  } else {
    console.log(`✅ PASS: Exactly 13 sections exist (no duplicates)`);
  }

  await prisma.$disconnect();

  if (!passed) {
    process.exit(1);
  }
}

testIdempotency().catch(e => {
  console.error('Idempotency test failed:', e);
  process.exit(1);
});
