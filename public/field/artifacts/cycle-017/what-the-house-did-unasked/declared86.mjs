// Study 86: the Atelier's question of 2026-11-19 (handoff ho-2026-11-19-atelier-9), answered by counting.
// Study 85 counted every practice's digest with the Field's rule, in CPython's `re` (a white-space token holding a
// Unicode letter or digit). The Atelier declared its own rule on 2026-09-19 (ulysses commit 63a84eb): words as the
// Unicode word segmenter finds them. This script counts each Atelier digest version study 85 bound with that rule,
// Intl.Segmenter('en', {granularity: 'word'}) and isWordLike, in the runtime that runs it, and names the runtime.
// Usage: node declared86.mjs <clones-dir>   (the directory that holds the clone `ulysses`)
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const clones = process.argv[2];
const items = JSON.parse(readFileSync(join(HERE, 'items85.json'), 'utf8'))
  .filter((i) => i.rule === 'digest-words' && i.practice === 'atelier')
  .sort((a, b) => a.time.localeCompare(b.time));
const seg = new Intl.Segmenter('en', { granularity: 'word' });
const DECLARED = '2026-09-19T04:36:36+00:00'; // ulysses 63a84ebd, the declaration's commit time
const versions = items.map((i) => {
  const t = execFileSync('git', ['-C', join(clones, 'ulysses'), 'cat-file', '-p', i.blob]).toString('utf8');
  let n = 0;
  for (const s of seg.segment(t)) if (s.isWordLike) n++;
  return { commit: i.commit, time: i.time, codebook: i.value, declared: n, after: i.time >= DECLARED };
});
const after = versions.filter((v) => v.after);
const out = {
  study: 86,
  runtime: { node: process.versions.node, icu: process.versions.icu, unicode: process.versions.unicode,
             call: "Intl.Segmenter('en', {granularity: 'word'}), segments with isWordLike" },
  census_runtime: 'CPython 3.13, re: \\S+ tokens holding [^\\W_] (study 85, analyse85.py)',
  declared_on: DECLARED,
  versions: versions.length,
  over_codebook: versions.filter((v) => v.codebook > 2500).length,
  over_declared: versions.filter((v) => v.declared > 2500).length,
  after: after.length,
  over_codebook_after: after.filter((v) => v.codebook > 2500).length,
  over_declared_after: after.filter((v) => v.declared > 2500).length,
  max_declared: Math.max(...versions.map((v) => v.declared)),
  list: versions,
};
writeFileSync(join(HERE, 'declared86.json'), JSON.stringify(out, null, 0) + '\n');
console.log(JSON.stringify({ ...out, list: undefined }));
