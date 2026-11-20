// State 2: every reading of a unit the house never declared, run on one text.
// Usage: node readings.mjs <texts.json>   with texts.json = {id: text}
// prints {icu, unicode, browser, r: {id: {...readings}}}
//
// line   file      every line of the file (a final newline ends the last line, it does not open a new one)
//        text      every line holding a character other than white space (the Field's codebook, study 85)
//        block     every paragraph or list item: a run of lines with text, broken by a blank line, a heading, a
//                  list marker, a quotation mark or a table row
//        pairs     the house's own definition of 2026-11-13, "a line is a sentence or two", at its smallest: per
//                  block, the sentences taken two to a line (a line does not run across two blocks)
//        sentences the same definition at its largest: one sentence to a line
//                  (sentences by the Unicode default sentence boundaries, UAX #29, on each block with its wrapped
//                  lines joined; a segment counts if it holds a letter or a digit)
// word   declared  the rule this practice declared on 2026-09-19 for its digest: segments the Unicode default word
//                  boundaries mark word-like (Intl.Segmenter, the call of window/cycle-003-session-10/seg.mjs)
//        browser   the same call inside a browser engine
//        spaces    every run of characters between white space
//        field     every run between white space that holds a letter or a digit (the Field's codebook, study 85)
// char   points    Unicode code points
//        units     UTF-16 code units (what a script's .length returns)
//        bytes     UTF-8 bytes (what git stores)
//        graphemes user-perceived characters, by the Unicode default grapheme clusters (Intl.Segmenter)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const texts = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

function read(T) {
  const W = new Intl.Segmenter('en', { granularity: 'word' });
  const S = new Intl.Segmenter('en', { granularity: 'sentence' });
  const G = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const START = /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\|)/;
  const out = {};
  for (const [id, t] of Object.entries(T)) {
    const lines = t.replace(/\n$/, '').split('\n');
    const blocks = [];
    let cur = null;
    for (const l of lines) {
      if (!l.trim()) { cur = null; continue; }
      if (cur === null || START.test(l)) { cur = [l.trim()]; blocks.push(cur); } else cur.push(l.trim());
    }
    let pairs = 0, sentences = 0;
    for (const b of blocks) {
      let s = 0;
      for (const x of S.segment(b.join(' '))) if (/[\p{L}\p{N}]/u.test(x.segment)) s++;
      sentences += s; pairs += Math.ceil(s / 2);
    }
    let words = 0;
    for (const x of W.segment(t)) if (x.isWordLike) words++;
    let graphemes = 0;
    for (const _ of G.segment(t)) graphemes++;
    const toks = t.split(/\s+/).filter(Boolean);
    out[id] = {
      file: lines.length, text: lines.filter(l => l.trim()).length, block: blocks.length, pairs, sentences,
      declared: words, spaces: toks.length, field: toks.filter(x => /[\p{L}\p{N}]/u.test(x)).length,
      points: [...t].length, units: t.length, graphemes,
    };
  }
  return out;
}

const here = read(texts);
for (const [id, t] of Object.entries(texts)) here[id].bytes = Buffer.byteLength(t, 'utf8');
const { chromium } = require('playwright');
const b = await chromium.launch();
const p = await b.newPage();
const there = await p.evaluate(`(${read})(${JSON.stringify(texts)})`);
const browser = 'Chromium ' + b.version();
await b.close();
for (const id of Object.keys(here)) {
  here[id].browser = there[id].declared;
  here[id].browser_sentences = there[id].sentences;
  here[id].browser_graphemes = there[id].graphemes;
}
process.stdout.write(JSON.stringify({ icu: process.versions.icu ?? null, unicode: process.versions.unicode ?? null, browser, r: here }));
