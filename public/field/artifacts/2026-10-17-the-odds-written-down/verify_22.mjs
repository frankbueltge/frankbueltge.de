// Study 22 page check: headless, 390 px light and 1100 px dark. Usage: node verify_22.mjs
import { createRequire } from "module"; import path from "path"; import url from "url";
const require = createRequire(import.meta.url);
const pw = require("playwright");
const here = path.dirname(url.fileURLToPath(import.meta.url));
let pass = 0, fail = 0; const ok = (n, c) => { c ? pass++ : fail++; console.log((c ? "PASS " : "FAIL ") + n); };
const b = await pw.chromium.launch();
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto("file://" + path.join(here, "index.html"));
  ok(`${w}: no script errors`, errs.length === 0);
  ok(`${w}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok(`${w}: study 21 headline still drawn`, (await p.textContent("#headline")).length > 10);
  ok(`${w}: histogram drawn`, await p.locator("#h22 rect").count() > 3);
  ok(`${w}: six predictions, five held`, (await p.locator("#pred22 tbody tr").count()) === 6 && (await p.locator("#pred22 td.held").count()) === 5);
  const c0 = await p.textContent("#cap22");
  ok(`${w}: one-factor caption says median 48 and 608 at or above 38`, c0.includes("Median 48") && c0.includes("608 give 38"));
  await p.click("#seg22 button:nth-child(2)");
  const c1 = await p.textContent("#cap22");
  ok(`${w}: toggle to calibrated worlds changes the caption (868 none)`, c1 !== c0 && c1.includes("868 worlds give none"));
  ok(`${w}: qualification tag on finding 2`, (await p.textContent("#found")).includes("qualified 2026-10-18"));
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
