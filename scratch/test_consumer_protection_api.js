import { PrismaClient } from '@prisma/client';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

async function testBearerActAPIs() {
  console.log('=== Testing Consumer Protection Act Controller APIs ===');

  const act = await prisma.act.findFirst({
    where: { heading: 'THE CONSUMER PROTECTION ACT, 2019' },
    include: { bearerAct: true }
  });

  if (!act) {
    throw new Error('Act "THE CONSUMER PROTECTION ACT, 2019" not found!');
  }

  console.log(`Found Act: ${act.heading} under BearerAct: ${act.bearerAct.name} (ID: ${act.id})`);

  const mockNext = (err) => {
    if (err) throw err;
  };

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

  await getSingleAct(mockReqAct, mockResAct, mockNext);
  console.log('\n1. getSingleAct:');
  console.log('   Response status:', actData?.code);
  console.log('   Heading:', actData?.data?.data?.heading);
  console.log('   Sections included in Act:', actData?.data?.data?.sections?.length);

  // 2. Test getSectionsByAct (Page 1: 1-100)
  let page1Data = null;
  const mockReqPage1 = {
    params: { id: act.id },
    query: { page: '1', limit: '100' }
  };
  const mockResPage1 = {
    status: (code) => ({
      json: (data) => {
        page1Data = { code, data };
        return data;
      }
    })
  };

  await getSectionsByAct(mockReqPage1, mockResPage1, mockNext);
  const page1Sections = page1Data?.data?.data;
  console.log('\n2. getSectionsByAct (Page 1):');
  console.log('   Response status:', page1Data?.code);
  console.log('   Page 1 count:', page1Sections?.length);
  console.log('   Total reported in pagination:', page1Data?.data?.pagination?.total);
  console.log('   First section:', page1Sections?.[0]?.section, '-', page1Sections?.[0]?.title);
  console.log('   Section 50:', page1Sections?.[49]?.section, '-', page1Sections?.[49]?.title);
  console.log('   Section 100:', page1Sections?.[99]?.section, '-', page1Sections?.[99]?.title);

  // 3. Test getSectionsByAct (Page 2: 101-107)
  let page2Data = null;
  const mockReqPage2 = {
    params: { id: act.id },
    query: { page: '2', limit: '100' }
  };
  const mockResPage2 = {
    status: (code) => ({
      json: (data) => {
        page2Data = { code, data };
        return data;
      }
    })
  };

  await getSectionsByAct(mockReqPage2, mockResPage2, mockNext);
  const page2Sections = page2Data?.data?.data;
  console.log('\n3. getSectionsByAct (Page 2):');
  console.log('   Response status:', page2Data?.code);
  console.log('   Page 2 count:', page2Sections?.length);
  console.log('   Section 101:', page2Sections?.[0]?.section, '-', page2Sections?.[0]?.title);
  console.log('   Section 107:', page2Sections?.[6]?.section, '-', page2Sections?.[6]?.title);

  const allSections = [...page1Sections, ...page2Sections];
  console.log(`\nCombined sections retrieved across pages: ${allSections.length}`);

  // Check ordering of all sections
  for (let i = 0; i < allSections.length; i++) {
    const s = allSections[i];
    const expectedSecNum = i + 1;
    if (s.section !== `Section ${expectedSecNum}`) {
      throw new Error(`Section ordering error: index ${i} expected Section ${expectedSecNum}, got ${s.section}`);
    }
  }
  console.log('   ✅ All 107 sections returned in exact ascending numeric order (Section 1 to Section 107)');

  // 4. Test getSingleSection (First section)
  const firstSectionId = page1Sections?.[0]?.id;
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

  await getSingleSection(mockReqSingleSec, mockResSingleSec, mockNext);
  console.log('\n4. getSingleSection (Section 1):');
  console.log('   Response status:', singleSecData?.code);
  console.log('   Section:', singleSecData?.data?.data?.section);
  console.log('   Title:', singleSecData?.data?.data?.title);
  console.log('   Chapter:', `Chapter ${singleSecData?.data?.data?.chapterNo}: ${singleSecData?.data?.data?.chapterName}`);

  // Test getSingleSection (Last section)
  const lastSectionId = page2Sections?.[6]?.id;
  let lastSecData = null;
  const mockReqLastSec = { params: { id: lastSectionId } };
  const mockResLastSec = {
    status: (code) => ({
      json: (data) => {
        lastSecData = { code, data };
        return data;
      }
    })
  };

  await getSingleSection(mockReqLastSec, mockResLastSec, mockNext);
  console.log('\n5. getSingleSection (Section 107):');
  console.log('   Response status:', lastSecData?.code);
  console.log('   Section:', lastSecData?.data?.data?.section);
  console.log('   Title:', lastSecData?.data?.data?.title);
  console.log('   Chapter:', `Chapter ${lastSecData?.data?.data?.chapterNo}: ${lastSecData?.data?.data?.chapterName}`);

  // Validation
  if (
    actData?.data?.data?.sections?.length === 107 &&
    allSections.length === 107 &&
    singleSecData?.data?.data?.section === 'Section 1' &&
    lastSecData?.data?.data?.section === 'Section 107' &&
    allSections[0].section === 'Section 1' &&
    allSections[106].section === 'Section 107'
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
