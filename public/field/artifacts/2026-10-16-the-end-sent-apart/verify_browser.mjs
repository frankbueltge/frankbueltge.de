// Study 20 page check: headless, 390 px light and 1100 px dark. Usage: node verify_browser.mjs
import { createRequire } from "module"; import path from "path"; import url from "url"; import fs from "fs";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW || "playwright"); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const R = JSON.parse(fs.readFileSync(path.join(here, "data", "results.json"), "utf8"));
const page_url = url.pathToFileURL(path.join(here, "index.html")).href;
const N = (fs.readFileSync(url.fileURLToPath(import.meta.url), "utf8").match(/^\s*ok\(`/gm) || []).length * 2;
const browser = await pw.chromium.launch();
let fail = 0, ran = 0;
const ok = (n, c) => { ran++; console.log((c ? "PASS " : "FAIL ") + n); if (!c) fail++; };
const pct = x => (100 * x).toFixed(1) + " %";
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(page_url); await p.waitForTimeout(1500);
  ok(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  ok(`${w} no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`${w} window starts at 24 h`, (await p.textContent("#winv")) === "24 h");
  const cells = await p.locator("#cells .cell b").allTextContents();
  ok(`${w} cells at 24 h equal results.json`, cells[0] === pct(R.P4.share) && cells[1] === pct(R.P4.baseline_share)
     && cells[2] === (R.P5.share == null ? "–" : pct(R.P5.share)));
  ok(`${w} five predictions`, (await p.locator("#pred tbody tr").count()) === 5);
  const failed = ["P1", "P2", "P3", "P4", "P5"].filter(k => !R[k].held).length;
  ok(`${w} failed verdicts shown as computed`, (await p.locator("#pred td.failed").count()) === failed);
  ok(`${w} study 17 table`, (await p.locator("#s17 tbody tr").count()) === 9);
  ok(`${w} histogram drawn`, (await p.locator("#fig rect").count()) === 26);
  await p.locator("#win").fill("0"); await p.waitForTimeout(150);
  const one = await p.locator("#cells .cell b").first().textContent();
  ok(`${w} slider moves the answer`, (await p.textContent("#winv")) === "1 h" && one !== cells[0]);
  await p.locator("#win").fill("100"); await p.waitForTimeout(150);
  ok(`${w} slider reaches 7 days`, (await p.textContent("#winv")) === "7.0 days");
  await p.locator("#win").fill("62"); await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(process.env.SHOTS || here, `shot-${w}-${scheme}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(`${ran} of ${N} checks ran, ${fail} failed`); process.exit(fail || ran !== N ? 1 : 0);
