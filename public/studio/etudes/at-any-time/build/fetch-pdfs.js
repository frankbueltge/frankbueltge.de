// Fetches every "Miscellaneous Order" PDF named in orders-2025-term.json to
// the scratchpad cache (never into the repository — see REPORT.md). Skips
// files already cached with a matching size. No randomness; re-running is a
// no-op once the cache is warm.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CORPUS_PATH = path.resolve(__dirname, '..', '..', '..', 'projects', 'at-any-time', 'material', 'orders-2025-term.json');
const CACHE_DIR = '/tmp/claude-0/-home-user-studio/98d41e62-3b71-5f78-9da1-5a51086e8713/scratchpad/pdfs';

async function main() {
  const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
  const misc = corpus.records.filter(r => r.kind === 'Miscellaneous Order');
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  let fetched = 0, cached = 0, failed = [];
  const manifest = [];
  for (const r of misc) {
    const dest = path.join(CACHE_DIR, r.file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      cached++;
      const data = fs.readFileSync(dest);
      manifest.push({ file: r.file, date: r.date, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex'), url: r.url });
      continue;
    }
    try {
      const res = await fetch(r.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      fetched++;
      console.log(`fetched ${r.file} (${buf.length} bytes)`);
      manifest.push({ file: r.file, date: r.date, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex'), url: r.url });
    } catch (e) {
      console.error(`FAILED ${r.file}: ${e.message}`);
      failed.push({ file: r.file, url: r.url, error: e.message });
    }
  }
  fs.writeFileSync(path.join(CACHE_DIR, 'manifest.json'), JSON.stringify({ fetched, cached, failed, records: manifest }, null, 2));
  console.log(`\nDone: ${fetched} fetched, ${cached} already cached, ${failed.length} failed (of ${misc.length} total).`);
  if (failed.length) process.exitCode = 1;
}
main();
