// Cheap, non-rendering check of each cached PDF's declared page count, via
// the PDF's own /Count entry in its page tree (uncompressed object, not a
// content stream — no zlib needed). Supplementary honesty check, not load
// -bearing for the étude renders themselves (which always render page 1).
const fs = require('fs');
const path = require('path');
const CACHE_DIR = '/tmp/claude-0/-home-user-studio/98d41e62-3b71-5f78-9da1-5a51086e8713/scratchpad/pdfs';

const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.pdf'));
const results = [];
for (const f of files) {
  const data = fs.readFileSync(path.join(CACHE_DIR, f), 'latin1');
  const counts = [...data.matchAll(/\/Type\s*\/Pages[^>]{0,200}?\/Count\s+(\d+)/g)].map(m => Number(m[1]));
  const countsAlt = [...data.matchAll(/\/Count\s+(\d+)[^>]{0,200}?\/Type\s*\/Pages/g)].map(m => Number(m[1]));
  const all = [...new Set([...counts, ...countsAlt])];
  results.push({ file: f, declaredCounts: all });
}
const multi = results.filter(r => r.declaredCounts.some(c => c > 1) || r.declaredCounts.length === 0);
console.log(`Checked ${results.length} PDFs.`);
console.log(`All declaredCounts values seen: ${JSON.stringify([...new Set(results.flatMap(r => r.declaredCounts))])}`);
if (multi.length) {
  console.log('Files with count != [1] or undetected:', JSON.stringify(multi, null, 2));
} else {
  console.log('Every cached PDF declares exactly one page (/Count 1).');
}
fs.writeFileSync(path.join(__dirname, 'page-count-check.json'), JSON.stringify(results, null, 2));
