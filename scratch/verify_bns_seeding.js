import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import http from 'http';
import app from '../src/server.js';
import { signToken } from '../src/utils/jwt.js';

const prisma = new PrismaClient();
let server;
let BASE_URL;

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      console.log(`Test server running at ${BASE_URL}`);
      resolve();
    });
  });
}

async function closeServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

async function main() {
  console.log('=== STARTING BNS SEEDING COMPREHENSIVE VERIFICATION ===\n');

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

    // 2. Check BNS Act under "Criminal"
    const bnsActs = await prisma.act.findMany({
      where: {
        bearerActId: criminalBearerAct.id,
        heading: 'The Bharatiya Nyaya Sanhita, 2023'
      }
    });
    assert(bnsActs.length === 1, `Exactly 1 BNS Act found under Criminal (count: ${bnsActs.length})`);

    const bnsAct = bnsActs[0];
    assert(bnsAct.year === 2023, `BNS Act year is 2023 (found: ${bnsAct.year})`);
    assert(bnsAct.act === 'The Bharatiya Nyaya Sanhita, 2023', `BNS Act act name matches PDF (found: ${bnsAct.act})`);

    // 3. Check ActSection count under BNS Act
    const sections = await prisma.actSection.findMany({
      where: { actId: bnsAct.id },
      orderBy: { chapterNo: 'asc' }
    });
    assert(sections.length === 358, `Exact 358 sections seeded for BNS Act (found: ${sections.length})`);

    // 4. Verify all 20 Chapters
    const uniqueChapters = [...new Set(sections.map(s => s.chapterNo))].sort((a, b) => a - b);
    assert(uniqueChapters.length === 20, `Exact 20 chapters represented (found: ${uniqueChapters.length})`);
    assert(uniqueChapters[0] === 1 && uniqueChapters[19] === 20, 'Chapters span from 1 to 20');

    // 5. Verify Section 1 and Section 358
    const sec1 = sections.find(s => s.section === 'Section 1');
    assert(sec1 && sec1.chapterNo === 1 && sec1.chapterName === 'PRELIMINARY' && sec1.title === 'Short title, commencement and application', 'Section 1 details match PDF exactly');

    const sec4 = sections.find(s => s.section === 'Section 4');
    assert(sec4 && sec4.chapterNo === 2 && sec4.description.includes('(f) Community Service.'), 'Section 4 includes Community Service punishment');

    const sec114 = sections.find(s => s.section === 'Section 114');
    assert(sec114 && sec114.title === 'Hurt' && sec114.description.includes('causes bodily pain, disease or infirmity'), 'Section 114 Hurt description complete');

    const sec358 = sections.find(s => s.section === 'Section 358');
    assert(sec358 && sec358.chapterNo === 20 && sec358.chapterName === 'REPEAL AND SAVINGS' && sec358.title === 'Repeal and savings', 'Section 358 details match PDF exactly');

    // 6. Verify Search and Public Read APIs
    await startServer();

    // 6.1 Public Read: List Bearer Acts
    const listRes = await axios.get(`${BASE_URL}/api/bearer-acts`);
    assert(listRes.status === 200 && listRes.data.success, 'GET /api/bearer-acts returns 200');
    const criminalInList = listRes.data.data.find(b => b.name === 'Criminal');
    assert(criminalInList !== undefined, 'Criminal category in public read list');

    // 6.2 Public Read: Get Acts under Criminal
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${criminalBearerAct.id}/acts`);
    assert(actsRes.status === 200 && actsRes.data.success, 'GET /api/bearer-acts/:id/acts returns 200');
    const bnsInActs = actsRes.data.data.find(a => a.id === bnsAct.id);
    assert(bnsInActs && bnsInActs.heading === 'The Bharatiya Nyaya Sanhita, 2023', 'BNS Act retrieved under Criminal');

    // 6.3 Public Read: Get Sections of BNS Act
    const secRes = await axios.get(`${BASE_URL}/api/acts/${bnsAct.id}/sections?limit=50`);
    assert(secRes.status === 200 && secRes.data.success, 'GET /api/acts/:id/sections returns 200');
    assert(secRes.data.pagination.total === 358, `Total sections pagination count is 358 (found: ${secRes.data.pagination.total})`);

    // 6.4 Global Search: Find BNS content
    const globalSearchRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Bharatiya Nyaya Sanhita`);
    assert(globalSearchRes.status === 200 && globalSearchRes.data.success, 'GET /api/bearer-acts/search?q=Bharatiya Nyaya Sanhita returns 200');
    assert(globalSearchRes.data.data.some(item => item.type === 'ACT' && item.act.id === bnsAct.id), 'Global search finds BNS Act');

    // 6.5 Global Search: Find specific BNS section
    const globalSearchHurtRes = await axios.get(`${BASE_URL}/api/bearer-acts/search?q=Community Service`);
    assert(globalSearchHurtRes.status === 200 && globalSearchHurtRes.data.success, 'GET /api/bearer-acts/search finds BNS section content');
    assert(globalSearchHurtRes.data.data.some(item => item.type === 'SECTION' && item.act.id === bnsAct.id), 'Global search finds BNS section under BNS Act');

    // 6.6 Act-Specific Search: Find section within BNS Act
    const actSearchRes = await axios.get(`${BASE_URL}/api/acts/${bnsAct.id}/search?q=culpable homicide`);
    assert(actSearchRes.status === 200 && actSearchRes.data.success, 'GET /api/acts/:actId/search returns 200');
    assert(actSearchRes.data.data.results.length > 0, `Act search returned ${actSearchRes.data.data.results.length} results for "culpable homicide"`);
    assert(actSearchRes.data.data.results.every(r => r.actId === bnsAct.id), 'All search results belong exclusively to BNS Act');

    // 7. Content Creator Compatibility
    let creator = await prisma.contentCreator.findFirst();
    if (!creator) {
      creator = await prisma.contentCreator.create({
        data: {
          email: 'creator.verify@example.com',
          fullName: 'Verify Creator',
          passwordHash: 'dummy'
        }
      });
    }
    const creatorToken = signToken({ id: creator.id, type: 'content_creator', role: 'CONTENT_CREATOR' });

    const creatorReadRes = await axios.get(`${BASE_URL}/api/sections/${sec1.id}`);
    assert(creatorReadRes.status === 200 && creatorReadRes.data.data.title === 'Short title, commencement and application', 'Public & Creator read single section works');

    console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===\n`);
  } catch (err) {
    console.error('Verification failed with exception:', err);
    failed++;
  } finally {
    await closeServer();
    await prisma.$disconnect();
    if (failed > 0) {
      process.exit(1);
    }
  }
}

main();
