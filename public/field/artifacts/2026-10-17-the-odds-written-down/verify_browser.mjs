// Study 21 page check: headless, 390 px light and 1100 px dark. Usage: node verify_browser.mjs
import { createRequire } from "module"; import path from "path"; import url from "url"; import fs from "fs";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW || "playwright"); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const R = JSON.parse(fs.readFileSync(path.join(here, "data", "results.json"), "utf8"));
const X = JSON.parse(fs.readFileSync(path.join(here, "data", "explore.json"), "utf8"));
const page_url = url.pathToFileURL(path.join(here, "index.html")).href;
const N = (fs.readFileSync(url.fileURLToPath(import.meta.url), "utf8").match(/^\s*ok\(`/gm) || []).length * 2;
const browser = await pw.chromium.launch();
let fail = 0, ran = 0;
const ok = (n, c) => { ran++; console.log((c ? "PASS " : "FAIL ") + n); if (!c) fail++; };
const P = R.primary_1week_M_ge_Mcat;
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(page_url); await p.waitForTimeout(1200);
  ok(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  ok(`${w} no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const t = await p.locator("#tiles .cell b").allTextContents();
  ok(`${w} registered tiles equal results.json`, t[0] === P.expected.toFixed(1) && t[1] === String(P.observed) && t[2] === (P.observed / P.expected).toFixed(2));
  ok(`${w} five bands drawn`, (await p.locator("#rel circle.band").count()) === 5);
  ok(`${w} six predictions`, (await p.locator("#pred tbody tr").count()) === 6);
  ok(`${w} four failed, as computed`, (await p.locator("#pred td.failed").count()) === 4);
  const wt = await p.locator("#wtiles .cell b").allTextContents();
  ok(`${w} warnings at 50 % equal results.json`, wt[0] === String(R.as_warnings_p_ge_half.cells));
  await p.locator("#segR button").nth(3).click(); await p.waitForTimeout(100);
  const t3 = await p.locator("#tiles .cell b").allTextContents();
  ok(`${w} 3x circle equals explore.json`, t3[1] === String(X.by_radius_primary["3"].observed) && (await p.textContent("#rnote")).includes("exploratory"));
  await p.locator("#segR button").nth(0).click(); await p.locator("#segF button").nth(1).click(); await p.waitForTimeout(100);
  const tb = await p.locator("#tiles .cell b").allTextContents();
  ok(`${w} below-floor equals results.json`, tb[1] === String(R.below_Mcat_1week.observed));
  await p.locator("#segF button").nth(0).click(); await p.locator("#thr").fill("20"); await p.waitForTimeout(100);
  ok(`${w} threshold moves`, (await p.textContent("#thrv")) === "20 %" && (await p.locator("#wtiles .cell b").first().textContent()) !== wt[0]);
  await p.locator("#thr").fill("50");
  await p.screenshot({ path: path.join(process.env.SHOTS || here, `shot-${w}-${scheme}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(`${ran} of ${N} checks ran, ${fail} failed`); process.exit(fail || ran !== N ? 1 : 0);
