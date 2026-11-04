// Study 23 page check: headless, 390 px light and 1100 px dark. Usage: node verify_23.mjs
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
  ok(`${w}: study 22 histogram still drawn`, await p.locator("#h22 rect").count() > 3);
  ok(`${w}: two intervals drawn`, await p.locator("#h23 circle").count() === 2);
  const c0 = await p.textContent("#h23");
  ok(`${w}: labels carry 26 of 35.6 and 47 of 86.3`, c0.includes("26 came of 35.6") && c0.includes("47 came of 86.3"));
  ok(`${w}: four predictions, three held`, (await p.locator("#pred23 tbody tr").count()) === 4 && (await p.locator("#pred23 td.held").count()) === 3);
  await p.click("#seg23 button:nth-child(2)");
  ok(`${w}: toggle draws the resampling histogram`, await p.locator("#h23 rect").count() > 10);
  const c1 = await p.textContent("#cap23");
  ok(`${w}: caption says 1.34, 0.89–2.05 and 162 of 2,000`, c1.includes("1.34") && c1.includes("0.89–2.05") && c1.includes("162 of 2,000"));
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
