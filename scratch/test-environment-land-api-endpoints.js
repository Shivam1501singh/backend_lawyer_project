import prisma from '../src/lib/prisma.js';
import {
  getSingleBearerAct,
  getActsByBearerAct,
  getSingleAct,
  getSectionsByAct,
  getSingleSection
} from '../src/controllers/bearerAct.controller.js';

const CATEGORY_NAME = 'Environment and Land';

async function runApiTests() {
  console.log('================================================================');
  console.log(' TESTING BEARER ACT CONTROLLER API ENDPOINTS');
  console.log('================================================================\n');

  const category = await prisma.bearerAct.findUnique({
    where: { name: CATEGORY_NAME }
  });

  if (!category) {
    throw new Error(`Category "${CATEGORY_NAME}" not found!`);
  }

  const mockNext = (err) => {
    if (err) throw err;
  };

  // 1. Test getSingleBearerAct
  let bearerActResp = null;
  await getSingleBearerAct(
    { params: { id: category.id } },
    {
      status: (code) => ({
        json: (data) => {
          bearerActResp = { code, data };
          return data;
        }
      })
    },
    mockNext
  );

  console.log('1. getSingleBearerAct:');
  console.log(`   Status: ${bearerActResp?.code}, Name: "${bearerActResp?.data?.data?.name}", Acts count: ${bearerActResp?.data?.data?.acts?.length}`);
  if (bearerActResp?.code !== 200 || bearerActResp?.data?.data?.acts?.length !== 4) {
    throw new Error('getSingleBearerAct test failed!');
  }

  // 2. Test getActsByBearerAct
  let actsResp = null;
  await getActsByBearerAct(
    {
      params: { id: category.id },
      query: { page: '1', limit: '10' }
    },
    {
      status: (code) => ({
        json: (data) => {
          actsResp = { code, data };
          return data;
        }
      })
    },
    mockNext
  );

  console.log('\n2. getActsByBearerAct:');
  console.log(`   Status: ${actsResp?.code}, Total acts returned: ${actsResp?.data?.data?.length}`);
  if (actsResp?.code !== 200 || actsResp?.data?.data?.length !== 4) {
    throw new Error('getActsByBearerAct test failed!');
  }

  // 3. Test Act & Section APIs for each of the 4 acts
  for (const act of actsResp.data.data) {
    console.log(`\n3. Testing APIs for Act "${act.heading}" (${act.year}):`);

    // a) getSingleAct
    let singleActResp = null;
    await getSingleAct(
      { params: { id: act.id } },
      {
        status: (code) => ({
          json: (data) => {
            singleActResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );

    const sections = singleActResp?.data?.data?.sections;
    console.log(`   - getSingleAct: Status ${singleActResp?.code}, Sections: ${sections?.length}`);
    if (singleActResp?.code !== 200 || !sections || sections.length === 0) {
      throw new Error(`getSingleAct failed for ${act.heading}!`);
    }

    // b) getSectionsByAct
    let sectionsResp = null;
    await getSectionsByAct(
      {
        params: { id: act.id },
        query: { page: '1', limit: '100' }
      },
      {
        status: (code) => ({
          json: (data) => {
            sectionsResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );

    console.log(`   - getSectionsByAct: Status ${sectionsResp?.code}, Count: ${sectionsResp?.data?.data?.length}, Total: ${sectionsResp?.data?.pagination?.total}`);
    if (sectionsResp?.code !== 200 || sectionsResp?.data?.data?.length !== sections.length) {
      throw new Error(`getSectionsByAct failed for ${act.heading}!`);
    }

    // c) getSingleSection
    const sampleSection = sections[0];
    let singleSecResp = null;
    await getSingleSection(
      { params: { id: sampleSection.id } },
      {
        status: (code) => ({
          json: (data) => {
            singleSecResp = { code, data };
            return data;
          }
        })
      },
      mockNext
    );

    console.log(`   - getSingleSection (${sampleSection.section}): Status ${singleSecResp?.code}, Title: "${singleSecResp?.data?.data?.title}"`);
    if (singleSecResp?.code !== 200 || singleSecResp?.data?.data?.id !== sampleSection.id) {
      throw new Error(`getSingleSection failed for ${sampleSection.section}!`);
    }
  }

  console.log('\n================================================================');
  console.log(' ALL CONTROLLER API TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runApiTests()
  .catch(err => {
    console.error('API Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
