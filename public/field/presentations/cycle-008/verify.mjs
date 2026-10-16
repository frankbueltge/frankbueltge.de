// Cycle-008 presentation page check: headless, 390 px light and 1100 px dark. Usage: node verify.mjs
import { createRequire } from "module"; import path from "path"; import url from "url"; import fs from "fs";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW || "playwright"); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const R7 = JSON.parse(fs.readFileSync(path.join(here, "../../artifacts/2026-10-16-the-fine-for-working/data/results.json"), "utf8"));
const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || undefined });
let fail = 0, ran = 0;
const ok = (n, c) => { ran++; console.log((c ? "PASS " : "FAIL ") + n); if (!c) fail++; };
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(url.pathToFileURL(path.join(here, "index.html")).href); await p.waitForTimeout(1000);
  ok(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  ok(`${w} no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`${w} ledger has 8 cells`, (await p.locator("#ledger button").count()) === 8);
  await p.locator("#ledger button").nth(0).click();
  ok(`${w} ledger cell shows study 1 share`, (await p.textContent("#cellnote")).includes("53.7 %"));
  let drawn = 0;
  for (let i = 0; i < 7; i++) { await p.locator("#steps button").nth(i).click(); drawn += (await p.locator("#sfig rect.bar").count()) > 0 ? 1 : 0; }
  ok(`${w} all seven study figures draw`, drawn === 7);
  const z = await p.evaluate(() => fine("H", 16));
  ok(`${w} study 7 recomputed in page within 0.5 % of Python`, Math.abs(z.z1_16 / R7.H.z_one - 1) < .005 && Math.abs(z.z2_16 / R7.H.z_two - 1) < .005);
  await p.locator("#yr").fill("96"); await p.locator("#yr").dispatchEvent("input");
  const txt = await p.textContent("#sfig");
  ok(`${w} at 96 years the warner's column reaches about z = 2`, /z = 2\.0\d|z = 1\.99/.test(txt));
  await p.locator("#yr").fill("16"); await p.locator("#yr").dispatchEvent("input");
  await p.screenshot({ path: path.join(process.env.SHOTS || here, `pres-${w}-${scheme}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(`${ran - fail} of ${ran} passed`); process.exit(fail ? 1 : 0);
