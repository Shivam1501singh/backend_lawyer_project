import fs from 'fs';

const rawIpc = JSON.parse(fs.readFileSync('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/ipcData.json', 'utf8'));

const chapters = [
  { no: 1, roman: "I", name: "INTRODUCTION", start: "1", end: "5" },
  { no: 2, roman: "II", name: "GENERAL EXPLANATIONS", start: "6", end: "52A" },
  { no: 3, roman: "III", name: "OF PUNISHMENTS", start: "53", end: "75" },
  { no: 4, roman: "IV", name: "GENERAL EXCEPTIONS", start: "76", end: "106" },
  { no: 5, roman: "V", name: "OF ABETMENT", start: "107", end: "120" },
  { no: 6, roman: "VA", name: "CRIMINAL CONSPIRACY", start: "120A", end: "120B" },
  { no: 7, roman: "VI", name: "OF OFFENCES AGAINST THE STATE", start: "121", end: "130" },
  { no: 8, roman: "VII", name: "OF OFFENCES RELATING TO THE ARMY, NAVY AND AIR FORCE", start: "131", end: "140" },
  { no: 9, roman: "VIII", name: "OF OFFENCES AGAINST THE PUBLIC TRANQUILLITY", start: "141", end: "160" },
  { no: 10, roman: "IX", name: "OF OFFENCES BY OR RELATING TO PUBLIC SERVANTS", start: "161", end: "171" },
  { no: 11, roman: "IXA", name: "OF OFFENCES RELATING TO ELECTIONS", start: "171A", end: "171-I" },
  { no: 12, roman: "X", name: "OF CONTEMPTS OF THE LAWFUL AUTHORITY OF PUBLIC SERVANTS", start: "172", end: "190" },
  { no: 13, roman: "XI", name: "OF FALSE EVIDENCE AND OFFENCES AGAINST PUBLIC JUSTICE", start: "191", end: "229A" },
  { no: 14, roman: "XII", name: "OF OFFENCES RELATING TO COIN AND GOVERNMENT STAMPS", start: "230", end: "263A" },
  { no: 15, roman: "XIII", name: "OF OFFENCES RELATING TO WEIGHTS AND MEASURES", start: "264", end: "267" },
  { no: 16, roman: "XIV", name: "OF OFFENCES AFFECTING THE PUBLIC HEALTH, SAFETY, CONVENIENCE, DECENCY AND MORALS", start: "268", end: "294A" },
  { no: 17, roman: "XV", name: "OF OFFENCES RELATING TO RELIGION", start: "295", end: "298" },
  { no: 18, roman: "XVI", name: "OF OFFENCES AFFECTING THE HUMAN BODY", start: "299", end: "377" },
  { no: 19, roman: "XVII", name: "OF OFFENCES AGAINST PROPERTY", start: "378", end: "462" },
  { no: 20, roman: "XVIII", name: "OF OFFENCES RELATING TO DOCUMENTS AND TO PROPERTY MARKS", start: "463", end: "489E" },
  { no: 21, roman: "XIX", name: "OF THE CRIMINAL BREACH OF CONTRACTS OF SERVICE", start: "490", end: "492" },
  { no: 22, roman: "XX", name: "OF OFFENCES RELATING TO MARRIAGE", start: "493", end: "498" },
  { no: 23, roman: "XXA", name: "OF CRUELTY BY HUSBAND OR RELATIVES OF HUSBAND", start: "498A", end: "498A" },
  { no: 24, roman: "XXI", name: "OF DEFAMATION", start: "499", end: "502" },
  { no: 25, roman: "XXII", name: "OF CRIMINAL INTIMIDATION, INSULT AND ANNOYANCE", start: "503", end: "510" },
  { no: 26, roman: "XXIII", name: "OF ATTEMPTS TO COMMIT OFFENCES", start: "511", end: "511" }
];

// Let's create an explicit list of sections with their chapter index
const sectionChapterMap = {};

let currentChapterIdx = 0;

for (let i = 0; i < rawIpc.length; i++) {
  const sec = rawIpc[i];
  const secNo = sec.sectionNo;
  
  // Find which chapter this belongs to
  // If we reach the start of next chapter, advance
  if (currentChapterIdx + 1 < chapters.length && chapters[currentChapterIdx + 1].start === secNo) {
    currentChapterIdx++;
  }
  
  const ch = chapters[currentChapterIdx];
  sectionChapterMap[secNo] = ch;
}

// Build the final Bearer Act format for each section
const ipcBearerActSections = rawIpc.map((item) => {
  const ch = sectionChapterMap[item.sectionNo];
  if (!ch) {
    throw new Error(`No chapter found for section ${item.sectionNo}`);
  }

  // Combine paragraph, explanation, and content into full legal description
  const parts = [];
  if (item.paragraph && item.paragraph.trim()) {
    parts.push(item.paragraph.trim());
  }
  if (item.explanation && item.explanation.trim()) {
    parts.push(item.explanation.trim());
  }
  if (item.content && item.content.trim()) {
    parts.push(item.content.trim());
  }

  const description = parts.join('\n\n');

  return {
    section: `Section ${item.sectionNo}`,
    sectionNo: item.sectionNo,
    chapterNo: ch.no,
    chapterRoman: ch.roman,
    chapterName: ch.name,
    title: item.heading,
    description: description,
    metaData: `Chapter ${ch.roman} ${ch.name}`,
    metaDescription: `THE INDIAN PENAL CODE Section ${item.sectionNo} - ${item.heading}`,
    metaTitle: `Section ${item.sectionNo} - THE INDIAN PENAL CODE`
  };
});

console.log(`Successfully mapped ${ipcBearerActSections.length} sections across ${chapters.length} chapters.`);
console.log('Sample Section 1:', JSON.stringify(ipcBearerActSections[0], null, 2));
console.log('Sample Section 120A (Ch VA):', JSON.stringify(ipcBearerActSections.find(s => s.sectionNo === '120A'), null, 2));
console.log('Sample Section 498A (Ch XXA):', JSON.stringify(ipcBearerActSections.find(s => s.sectionNo === '498A'), null, 2));
console.log('Sample Section 511 (Ch XXIII):', JSON.stringify(ipcBearerActSections.find(s => s.sectionNo === '511'), null, 2));

// Verify all chapters are populated
const chapterCounts = {};
for (const s of ipcBearerActSections) {
  chapterCounts[s.chapterNo] = (chapterCounts[s.chapterNo] || 0) + 1;
}
console.log('\nSections per chapter:');
chapters.forEach(c => {
  console.log(`Ch ${c.no} (${c.roman} - ${c.name}): ${chapterCounts[c.no] || 0} sections`);
});

// Write to prisma/ipcBearerActData.json and prisma/ipcBearerActData.js
fs.writeFileSync(
  '/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/ipcBearerActData.json',
  JSON.stringify(ipcBearerActSections, null, 2),
  'utf8'
);

const jsContent = `// IPC Bearer Act Data with Full Chapter and Section Structure
export const ipcBearerActSections = ${JSON.stringify(ipcBearerActSections, null, 2)};
`;

fs.writeFileSync(
  '/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/ipcBearerActData.js',
  jsContent,
  'utf8'
);

console.log('\nSaved prisma/ipcBearerActData.json and prisma/ipcBearerActData.js successfully!');
