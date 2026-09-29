import { PrismaClient } from '@prisma/client';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

async function testIncomeTaxAPIs() {
  console.log('=== Testing Income Tax Act Controller APIs ===');

  const act = await prisma.act.findFirst({
    where: { heading: 'THE INCOME-TAX ACT, 2025 (AS AMENDED BY FINANCE ACT, 2026)' },
    include: { bearerAct: true }
  });

  if (!act) {
    throw new Error('Act "THE INCOME-TAX ACT, 2025 (AS AMENDED BY FINANCE ACT, 2026)" not found in DB!');
  }

  console.log(`Found Act: "${act.heading}" under BearerAct: "${act.bearerAct.name}" (ID: ${act.id})`);

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
  console.log('   Act name:', actData?.data?.data?.act);
  console.log('   Year:', actData?.data?.data?.year);
  console.log('   Sections included in Act:', actData?.data?.data?.sections?.length);

  // 2. Test getSectionsByAct across pages
  const allSections = [];
  const limit = 100;
  const totalPages = Math.ceil(536 / limit);

  for (let p = 1; p <= totalPages; p++) {
    let pData = null;
    const mockReq = {
      params: { id: act.id },
      query: { page: String(p), limit: String(limit) }
    };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          pData = { code, data };
          return data;
        }
      })
    };
    await getSectionsByAct(mockReq, mockRes, mockNext);
    const pageItems = pData?.data?.data || [];
    console.log(`\n2. getSectionsByAct (Page ${p}): returned ${pageItems.length} items (Total: ${pData?.data?.pagination?.total})`);
    allSections.push(...pageItems);
  }

  console.log(`\nTotal sections retrieved via getSectionsByAct: ${allSections.length}`);

  // Check section ordering
  for (let i = 0; i < allSections.length; i++) {
    const s = allSections[i];
    const expectedSecNum = i + 1;
    if (s.section !== `Section ${expectedSecNum}`) {
      throw new Error(`Section ordering error: index ${i} expected "Section ${expectedSecNum}", got "${s.section}"`);
    }
  }
  console.log('   ✅ All 536 sections returned in exact sequential numeric order (Section 1 to Section 536)');

  // 3. Test getSingleSection (First section: Section 1)
  const firstSectionId = allSections[0]?.id;
  let singleSecData1 = null;
  const mockReqSec1 = { params: { id: firstSectionId } };
  const mockResSec1 = {
    status: (code) => ({
      json: (data) => {
        singleSecData1 = { code, data };
        return data;
      }
    })
  };
  await getSingleSection(mockReqSec1, mockResSec1, mockNext);
  console.log('\n3. getSingleSection (Section 1):');
  console.log('   Response status:', singleSecData1?.code);
  console.log('   Section:', singleSecData1?.data?.data?.section);
  console.log('   Title:', singleSecData1?.data?.data?.title);
  console.log('   Chapter:', `Chapter ${singleSecData1?.data?.data?.chapterNo}: ${singleSecData1?.data?.data?.chapterName}`);

  // 4. Test getSingleSection (Boundary section: Section 250 - End of Part 1)
  const sec250Id = allSections[249]?.id;
  let singleSecData250 = null;
  const mockReqSec250 = { params: { id: sec250Id } };
  const mockResSec250 = {
    status: (code) => ({
      json: (data) => {
        singleSecData250 = { code, data };
        return data;
      }
    })
  };
  await getSingleSection(mockReqSec250, mockResSec250, mockNext);
  console.log('\n4. getSingleSection (Section 250 - Part 1 boundary):');
  console.log('   Response status:', singleSecData250?.code);
  console.log('   Section:', singleSecData250?.data?.data?.section);
  console.log('   Title:', singleSecData250?.data?.data?.title);
  console.log('   Chapter:', `Chapter ${singleSecData250?.data?.data?.chapterNo}: ${singleSecData250?.data?.data?.chapterName}`);

  // 5. Test getSingleSection (Boundary section: Section 251 - Start of Part 2)
  const sec251Id = allSections[250]?.id;
  let singleSecData251 = null;
  const mockReqSec251 = { params: { id: sec251Id } };
  const mockResSec251 = {
    status: (code) => ({
      json: (data) => {
        singleSecData251 = { code, data };
        return data;
      }
    })
  };
  await getSingleSection(mockReqSec251, mockResSec251, mockNext);
  console.log('\n5. getSingleSection (Section 251 - Part 2 boundary):');
  console.log('   Response status:', singleSecData251?.code);
  console.log('   Section:', singleSecData251?.data?.data?.section);
  console.log('   Title:', singleSecData251?.data?.data?.title);
  console.log('   Chapter:', `Chapter ${singleSecData251?.data?.data?.chapterNo}: ${singleSecData251?.data?.data?.chapterName}`);

  // 6. Test getSingleSection (Last section: Section 536)
  const lastSectionId = allSections[535]?.id;
  let singleSecData536 = null;
  const mockReqSec536 = { params: { id: lastSectionId } };
  const mockResSec536 = {
    status: (code) => ({
      json: (data) => {
        singleSecData536 = { code, data };
        return data;
      }
    })
  };
  await getSingleSection(mockReqSec536, mockResSec536, mockNext);
  console.log('\n6. getSingleSection (Section 536 - Last section):');
  console.log('   Response status:', singleSecData536?.code);
  console.log('   Section:', singleSecData536?.data?.data?.section);
  console.log('   Title:', singleSecData536?.data?.data?.title);
  console.log('   Chapter:', `Chapter ${singleSecData536?.data?.data?.chapterNo}: ${singleSecData536?.data?.data?.chapterName}`);

  if (
    actData?.data?.data?.sections?.length === 536 &&
    allSections.length === 536 &&
    singleSecData1?.data?.data?.section === 'Section 1' &&
    singleSecData250?.data?.data?.section === 'Section 250' &&
    singleSecData251?.data?.data?.section === 'Section 251' &&
    singleSecData536?.data?.data?.section === 'Section 536'
  ) {
    console.log('\n✅ All Act details and Act sections API tests passed successfully!');
  } else {
    throw new Error('API test verification failed!');
  }
}

testIncomeTaxAPIs()
  .catch((e) => {
    console.error('API testing error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
