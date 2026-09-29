import { PrismaClient } from '@prisma/client';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

const ACT_NAME = 'THE CENTRAL GOODS AND SERVICES TAX ACT, 2017';

async function testBearerActAPIs() {
  console.log('=== Testing Central Goods and Services Tax Act Controller APIs ===');

  const act = await prisma.act.findFirst({
    where: { heading: ACT_NAME },
    include: { bearerAct: true }
  });

  if (!act) {
    throw new Error(`Act "${ACT_NAME}" not found!`);
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
  console.log('   Act Year:', actData?.data?.data?.year);
  console.log('   Category:', actData?.data?.data?.bearerAct?.name);
  console.log('   Sections included in Act payload:', actData?.data?.data?.sections?.length);

  if (actData?.code !== 200 || !actData?.data?.success) {
    throw new Error('getSingleAct API failed!');
  }

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
  console.log('   Total pages:', page1Data?.data?.pagination?.totalPages);
  console.log('   First section:', page1Sections?.[0]?.section, '-', page1Sections?.[0]?.title);
  console.log('   Section 50:', page1Sections?.[49]?.section, '-', page1Sections?.[49]?.title);
  console.log('   Section 100:', page1Sections?.[99]?.section, '-', page1Sections?.[99]?.title);

  if (page1Data?.code !== 200 || page1Sections?.length !== 100) {
    throw new Error('getSectionsByAct Page 1 failed!');
  }

  // 3. Test getSectionsByAct (Page 2: 101-190)
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
  console.log('   Section 190 (Last):', page2Sections?.[page2Sections.length - 1]?.section, '-', page2Sections?.[page2Sections.length - 1]?.title);

  if (page2Data?.code !== 200 || page2Sections?.length !== 90) {
    throw new Error('getSectionsByAct Page 2 failed!');
  }

  const allSections = [...page1Sections, ...page2Sections];
  console.log(`\nCombined sections retrieved across pages: ${allSections.length}`);

  if (allSections.length !== 190) {
    throw new Error(`Total sections mismatch: expected 190, got ${allSections.length}`);
  }

  // Verify section order in API response
  for (let i = 1; i < allSections.length; i++) {
    if (allSections[i].sectionOrder <= allSections[i - 1].sectionOrder) {
      throw new Error(`API ordering failure at index ${i}: ${allSections[i - 1].section} (${allSections[i - 1].sectionOrder}) >= ${allSections[i].section} (${allSections[i].sectionOrder})`);
    }
  }
  console.log('✅ API returned all 190 sections in strictly ascending numerical/lettered order.');

  // 4. Test getSingleSection
  const testSection = page1Sections[0]; // Section 1
  let singleSecData = null;
  const mockReqSingle = { params: { id: testSection.id } };
  const mockResSingle = {
    status: (code) => ({
      json: (data) => {
        singleSecData = { code, data };
        return data;
      }
    })
  };

  await getSingleSection(mockReqSingle, mockResSingle, mockNext);
  console.log('\n4. getSingleSection (Section 1):');
  console.log('   Response status:', singleSecData?.code);
  console.log('   Section:', singleSecData?.data?.data?.section);
  console.log('   Title:', singleSecData?.data?.data?.title);
  console.log('   Chapter:', singleSecData?.data?.data?.chapterNo, '-', singleSecData?.data?.data?.chapterName);
  console.log('   Description preview:', singleSecData?.data?.data?.description?.substring(0, 80) + '...');

  if (singleSecData?.code !== 200 || singleSecData?.data?.data?.section !== 'Section 1') {
    throw new Error('getSingleSection API failed!');
  }

  console.log('\n✅ All Bearer Act Controller APIs verified successfully!');
}

testBearerActAPIs()
  .catch((e) => {
    console.error('API testing error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
