// TASK 3 — STRIKE THE LEAKED DATES (Dramaturg §15 item 4 / D6: "nothing
// schedules the visitor"). Verifies, by searching the actual served HTML
// bytes (not by trusting the generator code), that data-date and data-docs
// are gone from the adopted build, and reports EXACTLY what (if anything)
// remains in the markup that could tell a visitor what day it is.
//
// Checked against the full 296-day / 55-unit adopted column, the largest
// and therefore most exposed markup this session produced.
const fs = require('fs');
const path = require('path');
const { buildColumnHtml } = require('./g-column-html.js');
const { buildColumnHtml: oldBuildColumnHtml } = require('./column-html.js');

const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-analysis.json'), 'utf8'));
const startDate = analysis.firstDate;
const endDate = analysis.lengths.l55.date;

const oldHtml = oldBuildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale: 1 }).html;
const newHtml = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale: 1 }).html;

function countMatches(str, re) {
  const m = str.match(re);
  return m ? m.length : 0;
}

const isoDateRe = /\d{4}-\d{2}-\d{2}/g;

// Baseline: the OLD (pre-adoption) markup, for contrast.
const oldReport = {
  bytes: oldHtml.length,
  dataDateOccurrences: countMatches(oldHtml, /data-date=/g),
  dataDocsOccurrences: countMatches(oldHtml, /data-docs=/g),
  isoDateStringOccurrences: countMatches(oldHtml, isoDateRe),
  sampleIsoDates: [...new Set((oldHtml.match(isoDateRe) || []))].slice(0, 5),
};

// New (adopted) markup.
const dataDateOccurrences = countMatches(newHtml, /data-date=/g);
const dataDocsOccurrences = countMatches(newHtml, /data-docs=/g);
const isoDateStringOccurrences = countMatches(newHtml, isoDateRe);

// Residual check: do the img src filenames themselves encode the order
// date? Court filenames follow MMDDYY...: e.g. "100625zr_3fbh.png" for
// 2025-10-06. Cross-check every distinct src filename's leading 6 digits
// against the actual corpus date for that record, to state plainly whether
// this is a real leak or a coincidence of naming.
const srcRe = /src="file:\/\/[^"]*\/([A-Za-z0-9_]+)\.png"/g;
const srcFiles = new Set();
let m;
while ((m = srcRe.exec(newHtml)) !== null) srcFiles.add(m[1]);

const byFileToDate = new Map();
for (const e of analysis.byDateOrder) {
  for (const f of e.files) byFileToDate.set(f.replace(/\.pdf$/, ''), e.date);
}

let filenameDateLeakCount = 0;
const filenameLeakSamples = [];
for (const stem of srcFiles) {
  const digits = stem.match(/^(\d{6})/);
  if (!digits) continue;
  const mmddyy = digits[1];
  const mm = mmddyy.slice(0, 2), dd = mmddyy.slice(2, 4), yy = mmddyy.slice(4, 6);
  const guessedIso = `20${yy}-${mm}-${dd}`;
  const actualDate = byFileToDate.get(stem);
  if (actualDate === guessedIso) {
    filenameDateLeakCount++;
    if (filenameLeakSamples.length < 5) filenameLeakSamples.push({ filenameStem: stem, encodedDate: guessedIso, matchesRecordDate: true });
  }
}

// What attributes/classes DOES remain on each slot div, verbatim, so the
// report can quote it exactly rather than describe it.
const firstOrderSlotMatch = newHtml.match(/<div class="slot order"[^>]*>/);
const firstBlankSlotMatch = newHtml.match(/<div class="slot blank"[^>]*>/);
const firstMultiSlotMatch = newHtml.match(/<div class="slot order multi"[^>]*>/);

const report = {
  builtRange: { startDate, endDate, dayCount: analysis.lengths.l55.spanDays },
  oldMarkupBaseline: oldReport,
  newMarkup: {
    bytes: newHtml.length,
    dataDateOccurrences,
    dataDocsOccurrences,
    isoDateStringOccurrences,
    strippedSuccessfully: dataDateOccurrences === 0 && dataDocsOccurrences === 0 && isoDateStringOccurrences === 0,
  },
  residualFilenameDateLeak: {
    distinctSrcFiles: srcFiles.size,
    filenamesWhoseLeading6DigitsEqualTheirOwnRecordDate: filenameDateLeakCount,
    samples: filenameLeakSamples,
    verdict: filenameDateLeakCount > 0
      ? 'THE FILE NAMES THEMSELVES ENCODE THE DATE (Court-assigned MMDDYY... convention), inside the img src attribute value. Stripping data-date/data-docs does not remove this — it was never in those attributes.'
      : 'no filename-encoded date pattern found',
  },
  verbatimRemainingSlotMarkup: {
    orderSlot: firstOrderSlotMatch ? firstOrderSlotMatch[0] : null,
    blankSlot: firstBlankSlotMatch ? firstBlankSlotMatch[0] : null,
    multiOrderSlot: firstMultiSlotMatch ? firstMultiSlotMatch[0] : null,
  },
};

fs.writeFileSync(path.join(__dirname, 'g3-measurements.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
