import { indianStampBearerActSections } from '../prisma/indianStampBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

console.log('Verifying all 95 section orders:');
const ordered = indianStampBearerActSections.map(s => ({
  section: s.section,
  sectionNo: s.sectionNo,
  chapterNo: s.chapterNo,
  order: calculateSectionOrder(s.sectionNo)
}));

for (let i = 0; i < ordered.length; i++) {
  console.log(`${i + 1}. [Ch ${ordered[i].chapterNo}] ${ordered[i].section} -> order: ${ordered[i].order}`);
  if (i > 0 && ordered[i].order <= ordered[i - 1].order) {
    console.error(`SORT ERROR: ${ordered[i].section} (${ordered[i].order}) is not greater than ${ordered[i - 1].section} (${ordered[i - 1].order})`);
  }
}
