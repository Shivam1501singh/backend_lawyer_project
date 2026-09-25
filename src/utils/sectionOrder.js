/**
 * Utility to calculate a numerical sort order for legal section identifiers.
 * 
 * Examples:
 * - "1" -> 1
 * - "2" -> 2
 * - "9" -> 9
 * - "10" -> 10
 * - "29" -> 29
 * - "29A" -> 29.01
 * - "153" -> 153
 * - "153A" -> 153.01
 * - "153AA" -> 153.0101
 * - "153B" -> 153.02
 * - "171-I" -> 171.09
 * - "376A" -> 376.01
 * - "376AB" -> 376.0102
 * - "376B" -> 376.02
 */
export function calculateSectionOrder(sectionNo) {
  if (sectionNo === null || sectionNo === undefined) return 0;
  
  const str = String(sectionNo).trim().replace(/^section\s+/i, '');
  const match = str.match(/^(\d+)(.*)$/);
  
  if (!match) {
    // If no leading number, fallback to high value
    return 999999;
  }
  
  const base = parseInt(match[1], 10);
  const suffix = match[2].toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (!suffix) {
    return base;
  }
  
  let frac = 0;
  let factor = 1 / 100;
  
  for (let i = 0; i < suffix.length; i++) {
    const code = suffix.charCodeAt(i);
    let val = 0;
    if (code >= 65 && code <= 90) {
      // A -> 1, B -> 2, ..., Z -> 26
      val = code - 64;
    } else if (code >= 48 && code <= 57) {
      // 0-9 -> 27-36
      val = code - 48 + 27;
    }
    frac += val * factor;
    factor /= 100;
  }
  
  // Return floating point representation with high precision
  return parseFloat((base + frac).toFixed(8));
}
