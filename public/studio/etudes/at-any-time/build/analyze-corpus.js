// Pure analysis of the real corpus index — no rendering, no network.
// Filters kind === "Miscellaneous Order", derives every number the two
// études need: distinct dates, calendar span, gaps between consecutive
// distinct dates, multi-order days, and the exact cutoff dates for the
// 2/8/25/55-unit lengths. Deterministic: same JSON in, same numbers out.
const fs = require('fs');
const path = require('path');

const CORPUS_PATH = path.resolve(__dirname, '..', '..', '..', 'projects', 'at-any-time', 'material', 'orders-2025-term.json');
const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));

const misc = corpus.records.filter(r => r.kind === 'Miscellaneous Order');

// Group by date, preserving the JSON's own record order within a date
// (this IS the re-runnable "stacking order" rule — see REPORT.md).
const byDate = new Map();
for (const r of misc) {
  if (!byDate.has(r.date)) byDate.set(r.date, []);
  byDate.get(r.date).push(r);
}
const distinctDates = [...byDate.keys()].sort(); // ISO dates sort lexically = chronologically

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00Z');
  const db = new Date(b + 'T00:00:00Z');
  return Math.round((db - da) / 86400000);
}

const firstDate = distinctDates[0];
const lastDate = distinctDates[distinctDates.length - 1];
const totalSpanDays = daysBetween(firstDate, lastDate) + 1; // inclusive of both ends

// Gaps between consecutive distinct order-dates.
const gaps = [];
for (let i = 1; i < distinctDates.length; i++) {
  gaps.push({
    from: distinctDates[i - 1],
    to: distinctDates[i],
    gapDays: daysBetween(distinctDates[i - 1], distinctDates[i]), // date2-date1; 1 = adjacent days, 0 blank days between
  });
}
const gapValues = gaps.map(g => g.gapDays).sort((a, b) => a - b);
const maxGap = gapValues[gapValues.length - 1];
const medianGap = gapValues.length % 2 === 1
  ? gapValues[(gapValues.length - 1) / 2]
  : (gapValues[gapValues.length / 2 - 1] + gapValues[gapValues.length / 2]) / 2;

const multiOrderDays = [...byDate.entries()].filter(([, recs]) => recs.length > 1);

function cutoff(n) {
  const d = distinctDates[n - 1];
  return { n, date: d, spanDays: daysBetween(firstDate, d) + 1, docCount: distinctDates.slice(0, n).reduce((s, dd) => s + byDate.get(dd).length, 0) };
}

const report = {
  totalMiscOrders: misc.length,
  distinctDatesCount: distinctDates.length,
  firstDate,
  lastDate,
  totalSpanDays,
  multiOrderDaysCount: multiOrderDays.length,
  multiOrderDays: multiOrderDays.map(([d, recs]) => ({ date: d, count: recs.length, files: recs.map(r => r.file) })),
  gapMax: maxGap,
  gapMedian: medianGap,
  gapDistribution: gaps.map(g => g.gapDays).reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {}),
  gapMaxInstance: gaps.find(g => g.gapDays === maxGap),
  gapMedianInstance: gaps.find(g => g.gapDays === medianGap) || null,
  lengths: { l2: cutoff(2), l8: cutoff(8), l25: cutoff(25), l55: cutoff(distinctDates.length) },
};

fs.writeFileSync(path.join(__dirname, 'corpus-analysis.json'), JSON.stringify({ ...report, distinctDates, byDateOrder: [...byDate.entries()].map(([d, recs]) => ({ date: d, files: recs.map(r => r.file) })) }, null, 2));
console.log(JSON.stringify(report, null, 2));
