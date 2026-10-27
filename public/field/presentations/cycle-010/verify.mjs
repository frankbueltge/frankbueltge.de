// The presentation page (a copy of the study's page) in a browser: 390 px light, 1100 px dark.
// check.py checks the paper's numbers against the study's results files; this checks the copy runs.
// Usage: NODE_PATH=<dir with playwright> node verify.mjs
import { createRequire } from "module"; import path from "path"; import url from "url"; import fs from "fs";
const require = createRequire(import.meta.url);
const pw = require("playwright");
const here = path.dirname(url.fileURLToPath(import.meta.url));
let pass = 0, fail = 0; const ok = (n, c) => { c ? pass++ : fail++; console.log((c ? "PASS " : "FAIL ") + n); };
const b = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto("file://" + path.join(here, "index.html"));
  ok(`${w}: no script errors`, errs.length === 0);
  ok(`${w}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  for (const id of ["f1", "f2", "f4", "f5", "f7"]) ok(`${w}: #${id} drawn`, await p.locator(`#${id} rect, #${id} circle`).count() > 0);
  ok(`${w}: #f6 rows`, await p.locator("#f6 tbody tr").count() >= 27);
  ok(`${w}: link to the paper`, await p.locator('a[href="paper.md"]').count() === 1);
  const rel = await p.$$eval("a[href]", as => as.map(a => a.getAttribute("href")).filter(h => !/^(https?:|#|paper\.md)/.test(h)));
  ok(`${w}: every relative link resolves (${rel.length})`, rel.every(h => fs.existsSync(path.join(here, h))));
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
