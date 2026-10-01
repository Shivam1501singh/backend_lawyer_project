import fs from 'fs';
import path from 'path';

// Let's load the 258 sections that matched from insolvency_and_bankruptcy_code_2016.json and add 55, 56, 57, 58 from prompt
const existing = JSON.parse(fs.readFileSync('prisma/insolvency_and_bankruptcy_code_2016.json', 'utf8'));
const existingMap = new Map();
existing.forEach(s => existingMap.set(s.sectionNo, s));

const sections55to58 = [
  {
    "section": "Section 55",
    "sectionNo": "55",
    "chapterNo": 4,
    "chapterName": "FAST TRACK CORPORATE INSOLVENCY RESOLUTION PROCESS",
    "title": "Fast track corporate insolvency resolution process",
    "description": "(1) A corporate insolvency resolution process carried out in accordance with this Chapter shall be called as fast track corporate insolvency resolution process.\n(2) An application for fast track corporate insolvency resolution process may be made in respect of the following corporate debtors, namely:—\n(a) a corporate debtor with assets and income below a level as may be notified by the Central Government; or\n(b) a corporate debtor with such class of creditors or such amount of debt as may be notified by the Central Government; or\n(c) such other category of corporate persons as may be notified by the Central Government.",
    "metaData": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016",
    "metaDescription": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016 Section 55 - Fast track corporate insolvency resolution process",
    "metaTitle": "Section 55 - THE INSOLVENCY AND BANKRUPTCY CODE, 2016"
  },
  {
    "section": "Section 56",
    "sectionNo": "56",
    "chapterNo": 4,
    "chapterName": "FAST TRACK CORPORATE INSOLVENCY RESOLUTION PROCESS",
    "title": "Time period for completion of fast track corporate insolvency resolution process",
    "description": "(1) Subject to the provisions of sub-section (3), the fast track corporate insolvency resolution process shall be completed within a period of ninety days from the insolvency commencement date.\n(2) The resolution professional shall file an application to the Adjudicating Authority to extend the period of the fast track corporate insolvency resolution process beyond ninety days if instructed to do so by a resolution passed at a meeting of the committee of creditors and supported by a vote of seventy five per cent. of the voting share.\n(3) On receipt of an application under sub-section (2), if the Adjudicating Authority is satisfied that the subject matter of the case is such that fast track corporate insolvency resolution process cannot be completed within a period of ninety days, it may, by order, extend the duration of such process beyond the said period of ninety days by such further period, as it thinks fit, but not exceeding forty-five days:\nProvided that any extension of the fast track corporate insolvency resolution process under this section shall not be granted more than once.",
    "metaData": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016",
    "metaDescription": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016 Section 56 - Time period for completion of fast track corporate insolvency resolution process",
    "metaTitle": "Section 56 - THE INSOLVENCY AND BANKRUPTCY CODE, 2016"
  },
  {
    "section": "Section 57",
    "sectionNo": "57",
    "chapterNo": 4,
    "chapterName": "FAST TRACK CORPORATE INSOLVENCY RESOLUTION PROCESS",
    "title": "Manner of initiating fast track corporate insolvency resolution process",
    "description": "An application for fast track corporate insolvency resolution process may be filed by a creditor or corporate debtor as the case may be, along with—\n(a) the proof of the existence of default as evidenced by records available with an information utility or such other means as may be specified by the Board; and\n(b) such other information as may be specified by the Board to establish that the corporate debtor is eligible for fast track corporate insolvency resolution process.",
    "metaData": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016",
    "metaDescription": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016 Section 57 - Manner of initiating fast track corporate insolvency resolution process",
    "metaTitle": "Section 57 - THE INSOLVENCY AND BANKRUPTCY CODE, 2016"
  },
  {
    "section": "Section 58",
    "sectionNo": "58",
    "chapterNo": 4,
    "chapterName": "FAST TRACK CORPORATE INSOLVENCY RESOLUTION PROCESS",
    "title": "Applicability of Chapter II to this Chapter",
    "description": "The process for conducting a corporate insolvency resolution process under Chapter II and the provisions relating to offences and penalties under Chapter VII shall apply to this Chapter as the context may require.",
    "metaData": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016",
    "metaDescription": "THE INSOLVENCY AND BANKRUPTCY CODE, 2016 Section 58 - Applicability of Chapter II to this Chapter",
    "metaTitle": "Section 58 - THE INSOLVENCY AND BANKRUPTCY CODE, 2016"
  }
];

sections55to58.forEach(s => existingMap.set(s.sectionNo, s));

const expectedSectionNos = [];
for (let i = 1; i <= 255; i++) {
  expectedSectionNos.push(String(i));
  if (i === 12) expectedSectionNos.push('12A');
  if (i === 25) expectedSectionNos.push('25A');
  if (i === 29) expectedSectionNos.push('29A');
  if (i === 32) expectedSectionNos.push('32A');
  if (i === 235) expectedSectionNos.push('235A');
  if (i === 238) expectedSectionNos.push('238A');
  if (i === 240) expectedSectionNos.push('240A');
}

const finalSections = expectedSectionNos.map(secNo => {
  const item = existingMap.get(secNo);
  if (!item) throw new Error('Missing ' + secNo);
  return item;
});

console.log('Total verified sections:', finalSections.length);
fs.writeFileSync('prisma/the_insolvency_and_bankruptcy_code__2016.json', JSON.stringify(finalSections, null, 2));
console.log('Successfully saved prisma/the_insolvency_and_bankruptcy_code__2016.json');
