import { PrismaClient } from '@prisma/client';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

const ACT_NAME = 'THE COMPETITION ACT, 2002';
const CATEGORY_NAME = 'Economic, Trade, & Market Regulatory';

async function testBearerActAPIs() {
  console.log('=== Testing THE COMPETITION ACT, 2002 Controller APIs ===');

  const act = await prisma.act.findFirst({
    where: { heading: ACT_NAME },
    include: { bearerAct: true }
  });

  if (!act) {
    throw new Error(`Act "${ACT_NAME}" not found!`);
  }

  console.log(`Found Act: ${act.heading} under BearerAct: ${act.bearerAct.name} (ID: ${act.id})`);

  if (act.bearerAct.name !== CATEGORY_NAME) {
    throw new Error(`Category mismatch: expected "${CATEGORY_NAME}", got "${act.bearerAct.name}"`);
  }

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

  // 2. Test getSectionsByAct
  let sectionsData = null;
  const mockReqSections = {
    params: { id: act.id },
    query: { page: '1', limit: '100' }
  };
  const mockResSections = {
    status: (code) => ({
      json: (data) => {
        sectionsData = { code, data };
        return data;
      }
    })
  };

  await getSectionsByAct(mockReqSections, mockResSections, mockNext);
  const sections = sectionsData?.data?.data;
  console.log('\n2. getSectionsByAct:');
  console.log('   Response status:', sectionsData?.code);
  console.log('   Sections count:', sections?.length);
  console.log('   Total reported in pagination:', sectionsData?.data?.pagination?.total);
  console.log('   Total pages:', sectionsData?.data?.pagination?.totalPages);
  console.log('   First section:', sections?.[0]?.section, '-', sections?.[0]?.title);
  console.log('   Last section:', sections?.[sections.length - 1]?.section, '-', sections?.[sections.length - 1]?.title);

  if (sectionsData?.code !== 200 || sections?.length !== 98) {
    throw new Error(`getSectionsByAct failed: expected 98 sections, got ${sections?.length}`);
  }

  // Verify section order in API response
  for (let i = 1; i < sections.length; i++) {
    if (sections[i].sectionOrder <= sections[i - 1].sectionOrder) {
      throw new Error(`API ordering failure at index ${i}: ${sections[i - 1].section} (${sections[i - 1].sectionOrder}) >= ${sections[i].section} (${sections[i].sectionOrder})`);
    }
  }
  console.log(`✅ API returned all ${sections.length} sections in strictly ascending numerical order.`);

  // 3. Test getSingleSection (Section 1)
  const testSection = sections[0]; // Section 1
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
  console.log('\n3. getSingleSection (Section 1):');
  console.log('   Response status:', singleSecData?.code);
  console.log('   Section:', singleSecData?.data?.data?.section);
  console.log('   Title:', singleSecData?.data?.data?.title);
  console.log('   Chapter:', singleSecData?.data?.data?.chapterNo, '-', singleSecData?.data?.data?.chapterName);
  console.log('   Description preview:', singleSecData?.data?.data?.description?.substring(0, 80) + '...');

  if (singleSecData?.code !== 200 || singleSecData?.data?.data?.section !== 'Section 1') {
    throw new Error('getSingleSection API failed!');
  }

  // 4. Test getSingleSection for Section 53A (Chapter 8)
  const testSection53A = sections.find(s => s.section === 'Section 53A');
  let sec53AData = null;
  await getSingleSection({ params: { id: testSection53A.id } }, {
    status: (code) => ({
      json: (data) => {
        sec53AData = { code, data };
        return data;
      }
    })
  }, mockNext);

  console.log('\n4. getSingleSection (Section 53A):');
  console.log('   Response status:', sec53AData?.code);
  console.log('   Section:', sec53AData?.data?.data?.section);
  console.log('   Title:', sec53AData?.data?.data?.title);
  console.log('   Chapter:', sec53AData?.data?.data?.chapterNo, '-', sec53AData?.data?.data?.chapterName);

  if (sec53AData?.code !== 200 || sec53AData?.data?.data?.section !== 'Section 53A') {
    throw new Error('getSingleSection for Section 53A API failed!');
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
