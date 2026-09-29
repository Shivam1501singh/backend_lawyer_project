import { PrismaClient } from '@prisma/client';
import { getSingleAct, getSectionsByAct, getSingleSection } from '../src/controllers/bearerAct.controller.js';

const prisma = new PrismaClient();

async function testBearerActAPIs() {
  console.log('Testing Act Controller APIs...');

  const act = await prisma.act.findFirst({
    where: { heading: 'THE REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016' }
  });

  if (!act) {
    throw new Error('Act not found!');
  }

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
  console.log('getSingleAct response code:', actData?.code);
  console.log('getSingleAct heading:', actData?.data?.data?.heading);
  console.log('getSingleAct totalSections:', actData?.data?.data?.totalSections);

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
  console.log('getSectionsByAct response code:', sectionsData?.code);
  console.log('getSectionsByAct returned count:', sectionsData?.data?.data?.length);
  console.log('First section returned:', sectionsData?.data?.data?.[0]?.section, '-', sectionsData?.data?.data?.[0]?.title);
  console.log('Last section returned:', sectionsData?.data?.data?.[91]?.section, '-', sectionsData?.data?.data?.[91]?.title);

  // 3. Test getSingleSection
  const firstSectionId = sectionsData?.data?.data?.[0]?.id;
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
  console.log('getSingleSection response code:', singleSecData?.code);
  console.log('getSingleSection section title:', singleSecData?.data?.data?.title);

  console.log('getSingleAct sections count:', actData?.data?.data?.sections?.length);

  if (
    actData?.data?.data?.sections?.length === 92 &&
    sectionsData?.data?.data?.length === 92 &&
    singleSecData?.data?.data?.section === 'Section 1'
  ) {
    console.log('\n✅ All API tests passed successfully!');
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
