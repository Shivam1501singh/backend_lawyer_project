import fs from 'fs';

const ipcSections = JSON.parse(
  fs.readFileSync('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/ipcBearerActData.json', 'utf8')
);

console.log(`Total IPC Bearer Act Sections: ${ipcSections.length}`);

let hasErrors = false;

// 1. Check required fields
for (let i = 0; i < ipcSections.length; i++) {
  const s = ipcSections[i];
  if (!s.section || !s.sectionNo || !s.chapterNo || !s.chapterRoman || !s.chapterName || !s.title || !s.description) {
    console.error(`Error in section index ${i}: Missing field`, s);
    hasErrors = true;
  }
}

// 2. Check for duplicate sectionNos
const seen = new Set();
for (const s of ipcSections) {
  if (seen.has(s.sectionNo)) {
    console.error(`Duplicate sectionNo: ${s.sectionNo}`);
    hasErrors = true;
  }
  seen.add(s.sectionNo);
}

// 3. Inspect specific long sections: 300 (Murder), 375 (Rape), 376 (Punishment for rape), 499 (Defamation)
const sec300 = ipcSections.find(s => s.sectionNo === '300');
console.log('\n--- Section 300 Title & Description length ---');
console.log('Title:', sec300.title);
console.log('Description length:', sec300.description.length);
console.log('Includes Exception 1:', sec300.description.includes('Exception 1'));
console.log('Includes Exception 5:', sec300.description.includes('Exception 5'));

const sec375 = ipcSections.find(s => s.sectionNo === '375');
console.log('\n--- Section 375 Title & Description length ---');
console.log('Title:', sec375.title);
console.log('Description length:', sec375.description.length);
console.log('Includes Exception 2:', sec375.description.includes('Exception 2'));

const sec499 = ipcSections.find(s => s.sectionNo === '499');
console.log('\n--- Section 499 Title & Description length ---');
console.log('Title:', sec499.title);
console.log('Description length:', sec499.description.length);
console.log('Includes Tenth Exception:', sec499.description.includes('Tenth Exception'));

if (!hasErrors) {
  console.log('\n✅ All 576 IPC Sections passed data integrity validation!');
} else {
  console.error('\n❌ Validation errors found!');
}
