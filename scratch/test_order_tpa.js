import { transferOfPropertyBearerActSections } from '../prisma/transferOfPropertyBearerActData.js';
import { calculateSectionOrder } from '../src/utils/sectionOrder.js';

console.log(`Total sections: ${transferOfPropertyBearerActSections.length}`);

const mapped = transferOfPropertyBearerActSections.map(s => ({
  section: s.section,
  sectionNo: s.sectionNo,
  chapterNo: s.chapterNo,
  order: calculateSectionOrder(s.sectionNo || s.section)
}));

// Sort by chapterNo, then sectionOrder
mapped.sort((a, b) => {
  if (a.chapterNo !== b.chapterNo) return a.chapterNo - b.chapterNo;
  return a.order - b.order;
});

console.log("Order sample (first 10):", mapped.slice(0, 10));
console.log("Order sample around 53A:", mapped.filter(s => s.section.includes('53')));
console.log("Order sample around 59A-60B:", mapped.filter(s => s.section.includes('59') || s.section.includes('60')));
console.log("Order sample around 114A:", mapped.filter(s => s.section.includes('114')));
console.log("Order sample around 130A-135A:", mapped.filter(s => s.section.includes('130') || s.section.includes('135')));
console.log("Last 5:", mapped.slice(-5));
