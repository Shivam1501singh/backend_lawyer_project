import express from 'express';
import cookieParser from 'cookie-parser';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import axios from 'axios';
import prisma from '../src/lib/prisma.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';
import { hinduAdoptionsMaintenanceBearerActSections } from '../prisma/hinduAdoptionsMaintenanceBearerActData.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bearerActRoutes);
app.use(errorHandler);

let server;
const PORT = 5598;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE HINDU ADOPTIONS AND MAINTENANCE ACT, 1956';

async function runApiTests() {
  console.log('Testing Bearer Act API endpoints for', ACT_HEADING, 'at', BASE_URL);

  server = app.listen(PORT);

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
    // 1. GET /api/bearer-acts
    console.log('\n[1] Testing GET /api/bearer-acts...');
    const catRes = await axios.get(`${BASE_URL}/api/bearer-acts`);
    assert(catRes.status === 200, 'GET /api/bearer-acts returns 200');
    const personalCat = catRes.data.data.find(c => c.name === 'Personal');
    assert(!!personalCat, 'Personal BearerAct exists in categories list');

    // 2. GET /api/bearer-acts/:id
    console.log('\n[2] Testing GET /api/bearer-acts/:id...');
    const singleCatRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}`);
    assert(singleCatRes.status === 200, 'GET /api/bearer-acts/:id returns 200');
    const acts = singleCatRes.data.data.acts;
    assert(Array.isArray(acts), 'Category includes acts array');
    const hamaAct = acts.find(a => a.heading === ACT_HEADING);
    assert(!!hamaAct, 'THE HINDU ADOPTIONS AND MAINTENANCE ACT, 1956 is listed in Personal category');
    assert(hamaAct.year === 1956, 'Act year is 1956');

    // Verify previously seeded Personal acts remain intact
    const gwAct = acts.find(a => a.heading === 'THE GUARDIANS AND WARDS ACT, 1890');
    const parsiAct = acts.find(a => a.heading === 'THE PARSI MARRIAGE AND DIVORCE ACT, 1936');
    const icmaAct = acts.find(a => a.heading === 'THE INDIAN CHRISTIAN MARRIAGE ACT, 1872');
    const divorceAct = acts.find(a => a.heading === 'THE DIVORCE ACT, 1869');
    const hmaAct = acts.find(a => a.heading === 'THE HINDU MARRIAGE ACT, 1955');
    const hsaAct = acts.find(a => a.heading === 'THE HINDU SUCCESSION ACT, 1956');
    const smaAct = acts.find(a => a.heading === 'THE SPECIAL MARRIAGE ACT, 1954');
    const mwpAct = acts.find(a => a.heading === 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986');
    const mwmpAct = acts.find(a => a.heading === 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019');
    const dmmAct = acts.find(a => a.heading === 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939');
    const hmgAct = acts.find(a => a.heading === 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956');

    assert(!!gwAct, 'THE GUARDIANS AND WARDS ACT, 1890 is preserved under Personal');
    assert(!!parsiAct, 'THE PARSI MARRIAGE AND DIVORCE ACT, 1936 is preserved under Personal');
    assert(!!icmaAct, 'THE INDIAN CHRISTIAN MARRIAGE ACT, 1872 is preserved under Personal');
    assert(!!divorceAct, 'THE DIVORCE ACT, 1869 is preserved under Personal');
    assert(!!hmaAct, 'THE HINDU MARRIAGE ACT, 1955 is preserved under Personal');
    assert(!!hsaAct, 'THE HINDU SUCCESSION ACT, 1956 is preserved under Personal');
    assert(!!smaAct, 'THE SPECIAL MARRIAGE ACT, 1954 is preserved under Personal');
    assert(!!mwpAct, 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986 is preserved');
    assert(!!mwmpAct, 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON MARRIAGE) ACT, 2019 is preserved');
    assert(!!dmmAct, 'THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939 is preserved');
    assert(!!hmgAct, 'THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 is preserved');

    // 3. GET /api/bearer-acts/:id/acts
    console.log('\n[3] Testing GET /api/bearer-acts/:id/acts...');
    const actsRes = await axios.get(`${BASE_URL}/api/bearer-acts/${personalCat.id}/acts`);
    assert(actsRes.status === 200, 'GET /api/bearer-acts/:id/acts returns 200');
    assert(actsRes.data.data.some(a => a.heading === ACT_HEADING), 'Act found in acts endpoint');

    // 4. GET /api/acts/:id
    console.log('\n[4] Testing GET /api/acts/:id...');
    const singleActRes = await axios.get(`${BASE_URL}/api/acts/${hamaAct.id}`);
    assert(singleActRes.status === 200, 'GET /api/acts/:id returns 200');
    assert(singleActRes.data.data.heading === ACT_HEADING, 'Act details match heading');
    assert(singleActRes.data.data.year === 1956, 'Act year is 1956');
    assert(singleActRes.data.data.sections.length === 30, `Act details include all 30 sections (actual: ${singleActRes.data.data.sections.length})`);

    // 5. GET /api/acts/:id/sections
    console.log('\n[5] Testing GET /api/acts/:id/sections...');
    const sectionsRes = await axios.get(`${BASE_URL}/api/acts/${hamaAct.id}/sections?limit=100`);
    assert(sectionsRes.status === 200, 'GET /api/acts/:id/sections returns 200');
    const sections = sectionsRes.data.data;
    assert(sections.length === 30, `Returns all 30 sections (actual: ${sections.length})`);
    assert(sectionsRes.data.pagination.total === 30, 'Pagination total is 30');

    // 6. Verify section ordering and titles
    console.log('\n[6] Verifying numerical ordering and section contents...');
    let isOrdered = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].sectionOrder > sections[i + 1].sectionOrder) {
        isOrdered = false;
        console.error(`Ordering mismatch at index ${i}: ${sections[i].section} (${sections[i].sectionOrder}) > ${sections[i+1].section} (${sections[i+1].sectionOrder})`);
      }
    }
    assert(isOrdered, 'All sections are sorted in correct numeric sectionOrder');

    // Check specific critical sections
    const s1 = sections.find(s => s.section === 'Section 1');
    assert(s1 && s1.title === 'Short title and extent.' && s1.chapterNo === 1 && s1.chapterName === 'PRELIMINARY', 'Section 1 details match');

    const s5 = sections.find(s => s.section === 'Section 5');
    assert(s5 && s5.title === 'Adoptions to be regulated by this Chapter.' && s5.chapterNo === 2 && s5.chapterName === 'ADOPTION', 'Section 5 details match');

    const s18 = sections.find(s => s.section === 'Section 18');
    assert(s18 && s18.title === 'Maintenance of wife.' && s18.chapterNo === 3 && s18.chapterName === 'MAINTENANCE', 'Section 18 details match');

    const s29 = sections.find(s => s.section === 'Section 29');
    assert(s29 && s29.title === '[Repeals.]' && s29.chapterNo === 4 && s29.chapterName === 'REPEALS AND SAVINGS', 'Section 29 details match');

    const s30 = sections.find(s => s.section === 'Section 30');
    assert(s30 && s30.title === 'Savings.' && s30.chapterNo === 4 && s30.chapterName === 'REPEALS AND SAVINGS', 'Section 30 details match');

    // 7. Test Idempotency
    console.log('\n[7] Testing Idempotency by re-running seed operation...');
    const countBefore = await prisma.actSection.count({ where: { actId: hamaAct.id } });
    
    // Re-run the update logic
    for (const item of hinduAdoptionsMaintenanceBearerActSections) {
      const existing = await prisma.actSection.findFirst({
        where: { actId: hamaAct.id, section: item.section }
      });
      if (existing) {
        await prisma.actSection.update({
          where: { id: existing.id },
          data: {
            sectionOrder: calculateSectionOrder(item.sectionNo || item.section),
            chapterNo: item.chapterNo,
            chapterName: item.chapterName,
            title: item.title,
            description: item.description,
            metaData: item.metaData,
            metaDescription: item.metaDescription,
            metaTitle: item.metaTitle
          }
        });
      }
    }

    const countAfter = await prisma.actSection.count({ where: { actId: hamaAct.id } });
    assert(countBefore === 30 && countAfter === 30, `Idempotency confirmed: count before (${countBefore}) == count after (${countAfter})`);

  } catch (error) {
    console.error('Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status, error.response.data);
    }
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runApiTests();
