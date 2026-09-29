import { PrismaClient } from '@prisma/client';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

async function testBearerActAPIs() {
  console.log('=== Testing Code on Wages Act Controller APIs ===');

  const act = await prisma.act.findFirst({
    where: { heading: 'THE CODE ON WAGES, 2019' },
    include: { bearerAct: true }
  });

  if (!act) {
    throw new Error('Act "THE CODE ON WAGES, 2019" not found!');
  }

  console.log(`Found Act: ${act.heading} under BearerAct: ${act.bearerAct.name}`);

  // 1. Test getSingleAct
  let actData = null;
  const mockReqAct = { params: { id: act.id } };
  const mockResAct = {
    status: (code) => ({
      json: (data) => {
        actData = { code, data };
        return data;
      }
    })
  };

  await getSingleAct(mockReqAct, mockResAct);
  console.log('1. getSingleAct:');
  console.log('   Response status:', actData?.code);
  console.log('   Heading:', actData?.data?.data?.heading);
  console.log('   Sections included in Act:', actData?.data?.data?.sections?.length);

  // 2. Test getSectionsByAct
  let sectionsData = null;
  const mockReqSections = {
    params: { id: act.id },
    query: { limit: '100' }
  };
  const mockResSections = {
    status: (code) => ({
      json: (data) => {
        sectionsData = { code, data };
        return data;
      }
    })
  };

  await getSectionsByAct(mockReqSections, mockResSections);
  const returnedSections = sectionsData?.data?.data;
  console.log('\n2. getSectionsByAct:');
  console.log('   Response status:', sectionsData?.code);
  console.log('   Returned count:', returnedSections?.length);
  console.log('   First section:', returnedSections?.[0]?.section, '-', returnedSections?.[0]?.title);
  console.log('   Section 10:', returnedSections?.[9]?.section, '-', returnedSections?.[9]?.title);
  console.log('   Last section:', returnedSections?.[68]?.section, '-', returnedSections?.[68]?.title);

  // Check ordering of all sections
  for (let i = 0; i < returnedSections.length; i++) {
    const s = returnedSections[i];
    const expectedSecNum = i + 1;
    if (s.section !== `Section ${expectedSecNum}`) {
      throw new Error(`Section ordering error: index ${i} expected Section ${expectedSecNum}, got ${s.section}`);
    }
  }
  console.log('   ✅ All 69 sections returned in exact ascending numeric order (Section 1 to Section 69)');

  // 3. Test getSingleSection
  const firstSectionId = returnedSections?.[0]?.id;
  let singleSecData = null;
  const mockReqSingleSec = { params: { id: firstSectionId } };
  const mockResSingleSec = {
    status: (code) => ({
      json: (data) => {
        singleSecData = { code, data };
        return data;
      }
    })
  };

  await getSingleSection(mockReqSingleSec, mockResSingleSec);
  console.log('\n3. getSingleSection:');
  console.log('   Response status:', singleSecData?.code);
  console.log('   Section:', singleSecData?.data?.data?.section);
  console.log('   Title:', singleSecData?.data?.data?.title);
  console.log('   Chapter:', `Chapter ${singleSecData?.data?.data?.chapterNo}: ${singleSecData?.data?.data?.chapterName}`);

  // Validation
  if (
    actData?.data?.data?.sections?.length === 69 &&
    returnedSections?.length === 69 &&
    singleSecData?.data?.data?.section === 'Section 1' &&
    returnedSections[0].section === 'Section 1' &&
    returnedSections[68].section === 'Section 69'
  ) {
    console.log('\n✅ All Act and Sections API tests passed successfully!');
  } else {
    throw new Error('API test verification failed!');
  }
}

testBearerActAPIs()
  .catch((e) => {
    console.error('API testing error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
