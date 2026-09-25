import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import http from 'http';
import app from '../src/server.js';
import { signToken } from '../src/utils/jwt.js';

const TEST_PORT = process.env.PORT || 5009;
const BASE_URL = `http://localhost:${TEST_PORT}`;
const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING BSA SEEDING COMPREHENSIVE VERIFICATION ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check BearerAct "Criminal"
    const criminalBearerAct = await prisma.bearerAct.findUnique({
      where: { name: 'Criminal' }
    });
    assert(criminalBearerAct !== null, 'BearerAct "Criminal" exists');

    // 2. Check BSA Act under "Criminal"
    const bsaActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'The Bharatiya Sakshya Adhiniyam, 2023'
      }
    });
    assert(bsaActs.length === 1, `Exactly 1 BSA Act found under Criminal (count: ${bsaActs.length})`);

    const bsaAct = bsaActs[0];
    assert(bsaAct.year === 2023, `BSA Act year is 2023 (found: ${bsaAct.year})`);
    assert(bsaAct.act === 'The Bharatiya Sakshya Adhiniyam, 2023', `BSA Act act name matches PDF (found: ${bsaAct.act})`);

    // 3. Verify co-existence with BNS and BNSS under Criminal
    const allCriminalActs = await prisma.act.findMany({
      where: { bearerActId: criminalBearerAct.id }
    });
    const bnsAct = allCriminalActs.find(a => a.heading === 'The Bharatiya Nyaya Sanhita, 2023');
    const bnssAct = allCriminalActs.find(a => a.heading === 'The Bharatiya Nagarik Suraksha Sanhita, 2023');
    assert(bnsAct !== undefined, 'BNS Act still exists under Criminal BearerAct');
    assert(bnssAct !== undefined, 'BNSS Act still exists under Criminal BearerAct');

    // 4. Check ActSection count under BSA Act
    const sections = await prisma.actSection.findMany({
      where: { actId: bsaAct.id },
      orderBy: { chapterNo: 'asc' }
    });
    assert(sections.length === 170, `Exact 170 sections seeded for BSA Act (found: ${sections.length})`);

    // 5. Verify all 12 Chapters
    const uniqueChapters = [...new Set(sections.map(s => s.chapterNo))].sort((a, b) => a - b);
    assert(uniqueChapters.length === 12, `Exact 12 chapters represented (found: ${uniqueChapters.length})`);
    assert(uniqueChapters[0] === 1 && uniqueChapters[11] === 12, 'Chapters span from 1 to 12');

    // 6. Verify Section 1 and Section 170
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1 && sec1.chapterNo === 1 && sec1.chapterName === 'PRELIMINARY' && sec1.title === 'Short title, application and commencement', 'Section 1 details match PDF exactly');

    const sec2 = sections.find(s => s.section === 'Section 2');
    assert(sec2 && sec2.chapterNo === 1 && sec2.title === 'Definitions' && sec2.description.includes('"conclusive proof"'), 'Section 2 Definitions match PDF');

    const sec63 = sections.find(s => s.section === 'Section 63');
    assert(sec63 && sec63.chapterNo === 5 && sec63.title === 'Admissibility of electronic records', 'Section 63 Admissibility of electronic records matches PDF');

    const sec121 = sections.find(s => s.section === 'Section 121');
    assert(sec121 && sec121.chapterNo === 8 && sec121.chapterName === 'ESTOPPEL' && sec121.title === 'Estoppel', 'Section 121 Estoppel matches PDF');

    const sec170 = sections.find(s => s.section === 'Section 170');
    assert(sec170 && sec170.chapterNo === 12 && sec170.chapterName === 'REPEAL AND SAVINGS' && sec170.title === 'Repeal and savings' && sec170.description.includes('The Indian Evidence Act, 1872 is hereby repealed'), 'Section 170 Repeal and savings matches PDF');

    // 7. Verify all sections 1..170 are strictly sequential
    const secNumbers = sections.map(s => parseInt(s.section.replace('Section ', ''), 10)).sort((a, b) => a - b);
    let isSequential = true;
    for (let i = 0; i < 170; i++) {
      if (secNumbers[i] !== i + 1) {
        isSequential = false;
        break;
      }
    }
    assert(isSequential, 'Sections 1 through 170 are strictly contiguous and sequential without gaps or duplicates');

    // 8. Verify Search and Public Read APIs
    // 8.1 Public Read: List Bearer Acts
    const listRes = await axios.get(`${BASE_URL}/api/bearer-acts`);
    assert(listRes.status === 200 && listRes.data.success, 'GET /api/bearer-acts returns 200');
    const criminalInList = listRes.data.data.find(b => b.name === 'Criminal');
    assert(criminalInList && criminalInList.id === criminalBearerAct.id, 'GET /api/bearer-acts contains Criminal BearerAct');

    // 8.2 Public Read: Single Bearer Act
    const singleBearerRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalBearerAct.id}`);
    assert(singleBearerRes.status === 200 && singleBearerRes.data.data.name === 'Criminal', 'GET /api/bearer-acts/:id returns Criminal');

    // 8.3 Public Read: Acts under Criminal
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalBearerAct.id}/acts`);
    assert(actsRes.status === 200 && Array.isArray(actsRes.data.data), 'GET /api/bearer-acts/:id/acts returns array');
    const bsaInActs = actsRes.data.data.find(a => a.id === bsaAct.id);
    assert(bsaInActs && bsaInActs.heading === 'The Bharatiya Sakshya Adhiniyam, 2023', 'BSA Act is present under Criminal Acts list');

    // 8.4 Public Read: Single BSA Act
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${bsaAct.id}`);
    assert(singleActRes.status === 200 && singleActRes.data.data.heading === 'The Bharatiya Sakshya Adhiniyam, 2023', 'GET /api/acts/:id returns BSA Act');

    // 8.5 Public Read: Sections by BSA Act
    const actSectionsRes = await axios.get(`${BASE_URL}/api/acts/${bsaAct.id}/sections?limit=100`);
    assert(actSectionsRes.status === 200 && actSectionsRes.data.pagination.total === 170, `GET /api/acts/:id/sections returns total count 170 (found: ${actSectionsRes.data.pagination.total})`);
    assert(actSectionsRes.data.data.length === 100, `GET /api/acts/:id/sections?limit=100 returns page 1 with 100 sections (found: ${actSectionsRes.data.data.length})`);

    // 8.6 Public Read: Single Section
    const sampleSec = actSectionsRes.data.data.find(s => s.section === 'Section 63');
    assert(sampleSec !== undefined, 'Found Section 63 in section list');
    const singleSecRes = await axios.get(`${BASE_URL}/api/sections/${sampleSec.id}`);
    assert(singleSecRes.status === 200 && singleSecRes.data.data.title === 'Admissibility of electronic records', 'GET /api/sections/:id returns Section 63');

    // 8.7 Search API: Global Search
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=estoppel`);
    assert(globalSearchRes.status === 200 && globalSearchRes.data.success, 'GET /api/bearer-acts/search?q=estoppel returns 200');
    const hasBsaMatch = globalSearchRes.data.data.some(item => item.act && item.act.heading.includes('Bharatiya Sakshya Adhiniyam'));
    assert(hasBsaMatch, 'Global search returns results from BSA');

    // 8.8 Search API: Act-Specific Search
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${bsaAct.id}/search?q=estoppel`);
    assert(actSearchRes.status === 200 && actSearchRes.data.success, 'GET /api/acts/:actId/search?q=estoppel returns 200');
    const results = actSearchRes.data.data.results;
    assert(results.length > 0, `Act-specific search finds matching BSA sections (count: ${results.length})`);
    const onlyBsa = results.every(s => s.actId === bsaAct.id);
    assert(onlyBsa, 'Act-specific search returns ONLY sections belonging to BSA Act');

    // 8.9 Content Creator API: Authorization and Write Compatibility
    let contentCreator = await prisma.contentCreator.findFirst();
    if (!contentCreator) {
      contentCreator = await prisma.contentCreator.create({
        data: {
          fullName: 'Test Content Creator',
          email: 'creator.test@example.com',
          passwordHash: 'dummy'
        }
      });
    }

    const token = signToken({ id: contentCreator.id, role: 'CONTENT_CREATOR', type: 'content_creator' });
    const updateRes = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'ACT',
        operation: 'UPDATE',
        data: {
          id: bsaAct.id,
          heading: 'The Bharatiya Sakshya Adhiniyam, 2023',
          act: 'The Bharatiya Sakshya Adhiniyam, 2023',
          year: 2023
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    assert(updateRes.status === 200 && updateRes.data.success, 'Content Creator single write endpoint updates BSA Act successfully');

  } catch (err) {
    console.error('Verification Error:', err.response?.data || err.message);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n=== VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
