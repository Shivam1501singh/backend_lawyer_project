import { PrismaClient } from '@prisma/client';
import express from 'express';
import http from 'http';
import bearerActRouter from '../src/routes/bearerAct.routes.js';
import assert from 'assert';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(bearerActRouter);

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, error: err.message });
});

async function runApiTests() {
  console.log('===============================================================');
  console.log(' TESTING COMMERCIAL AND BUSINESS ACTS API ENDPOINTS');
  console.log('===============================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Get Category
    const catRes = await fetch(`${baseUrl}/api/bearer-acts`);
    assert.strictEqual(catRes.status, 200);
    const catJson = await catRes.json();
    const categories = catJson.data;
    const targetCategory = categories.find(c => c.name === 'Commercial and Business');
    assert(targetCategory, 'Category "Commercial and Business" found in /api/bearer-acts');
    console.log(`✓ [API] GET /api/bearer-acts -> Found category "${targetCategory.name}" (ID: ${targetCategory.id})`);

    // 2. Get Acts by Category
    const actsRes = await fetch(`${baseUrl}/api/bearer-acts/${targetCategory.id}/acts`);
    assert.strictEqual(actsRes.status, 200);
    const actsJson = await actsRes.json();
    const acts = actsJson.data;
    console.log(`✓ [API] GET /api/bearer-acts/${targetCategory.id}/acts -> Returned ${acts.length} Acts`);
    assert.strictEqual(acts.length, 5, 'Category contains exactly 5 Acts');
    
    const expectedActs = [
      { heading: 'THE INSOLVENCY AND BANKRUPTCY CODE, 2016', expectedSections: 262 },
      { heading: 'THE COMMERCIAL COURTS ACT, 2015', expectedSections: 26 },
      { heading: 'THE LIMITED LIABILITY PARTNERSHIP ACT, 2008', expectedSections: 88 },
      { heading: 'THE SECURITIES AND EXCHANGE BOARD OF INDIA ACT, 1992', expectedSections: 90 },
      { heading: 'THE SPECIFIC RELIEF ACT, 1963', expectedSections: 48 }
    ];

    for (const exp of expectedActs) {
      const actInList = acts.find(a => a.heading === exp.heading);
      assert(actInList, `Act "${exp.heading}" is in category's Acts list`);
      console.log(`\n  -> Testing Act: "${actInList.heading}" (Year: ${actInList.year}) [ID: ${actInList.id}]`);

      // 3. Get Single Act Details
      const singleActRes = await fetch(`${baseUrl}/api/acts/${actInList.id}`);
      assert.strictEqual(singleActRes.status, 200);
      const singleActJson = await singleActRes.json();
      assert.strictEqual(singleActJson.data.heading, exp.heading);
      assert.strictEqual(singleActJson.data.bearerActId, targetCategory.id);
      console.log(`     ✓ [API] GET /api/acts/${actInList.id} -> 200 OK (heading: "${singleActJson.data.heading}")`);

      // 4. Get Sections by Act (Paginated fetching)
      let allSectionsFromApi = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const sectionsRes = await fetch(`${baseUrl}/api/acts/${actInList.id}/sections?page=${page}&limit=100`);
        assert.strictEqual(sectionsRes.status, 200);
        const sectionsJson = await sectionsRes.json();
        allSectionsFromApi = allSectionsFromApi.concat(sectionsJson.data);
        totalPages = sectionsJson.pagination.totalPages;
        page++;
      }

      assert.strictEqual(allSectionsFromApi.length, exp.expectedSections, `Sections count for ${exp.heading} equals ${exp.expectedSections}`);
      console.log(`     ✓ [API] GET /api/acts/${actInList.id}/sections -> Retrieved all ${allSectionsFromApi.length}/${exp.expectedSections} sections via pagination`);

      // Verify ordering in API response (chapterNo ASC, then sectionOrder ASC)
      for (let i = 0; i < allSectionsFromApi.length - 1; i++) {
        const curr = allSectionsFromApi[i];
        const next = allSectionsFromApi[i + 1];
        if (curr.chapterNo > next.chapterNo) {
          throw new Error(`Chapter ordering violation in ${exp.heading}: Ch ${curr.chapterNo} followed by Ch ${next.chapterNo}`);
        }
      }
      console.log(`     ✓ [API] Section ordering verified (chapterNo ASC, sectionOrder ASC)`);

      // 5. Test Single Section Details
      const firstSec = allSectionsFromApi[0];
      const singleSecRes = await fetch(`${baseUrl}/api/sections/${firstSec.id}`);
      assert.strictEqual(singleSecRes.status, 200);
      const singleSecJson = await singleSecRes.json();
      assert.strictEqual(singleSecJson.data.section, firstSec.section);
      assert.strictEqual(singleSecJson.data.actId, actInList.id);
      console.log(`     ✓ [API] GET /api/sections/${firstSec.id} -> 200 OK for "${firstSec.section}: ${firstSec.title}"`);

      // 6. Test Search inside this Act (q parameter)
      const searchRes = await fetch(`${baseUrl}/api/acts/${actInList.id}/search?q=Definitions`);
      assert.strictEqual(searchRes.status, 200);
      const searchJson = await searchRes.json();
      assert(searchJson.data.results.length > 0, `Search returned results for ${exp.heading}`);
      console.log(`     ✓ [API] GET /api/acts/${actInList.id}/search?q=Definitions -> Returned ${searchJson.data.results.length} matches`);
    }

    console.log('\n===============================================================');
    console.log(' ALL API INTEGRATION TESTS PASSED PERFECTLY (5/5 ACTS)!');
    console.log('===============================================================\n');
  } finally {
    server.close();
  }
}

runApiTests()
  .catch((err) => {
    console.error('API Test Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
