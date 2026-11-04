// Study 19 page check: headless, 390 px light and 1100 px dark. Usage: node verify_browser.mjs
import { createRequire } from "module"; import path from "path"; import url from "url"; import fs from "fs";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW || "playwright"); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const R = JSON.parse(fs.readFileSync(path.join(here, "data/results.json"), "utf8"));
const page_url = url.pathToFileURL(path.join(here, "index.html")).href;
const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || undefined });
let fail = 0, ran = 0;
const ok = (n, c) => { ran++; console.log((c ? "PASS " : "FAIL ") + n); if (!c) fail++; };
const near = (a, b, tol) => Math.abs(a / b - 1) < tol;
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(page_url); await p.waitForTimeout(1200);
  ok(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  ok(`${w} no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  for (const y of ["H", "D"]) {
    const c = await p.evaluate(y => compute(y, 1), y);
    ok(`${w} page recomputes ${y}: F, R, z_one, z_two within 0.5 % of Python`,
      near(c.F, R[y].F, .005) && near(c.R, R[y].R, .005) && near(c.z1, R[y].z_one, .005) && near(c.z2, R[y].z_two, .005));
  }
  ok(`${w} figure has five ratings`, (await p.locator("#fig rect.share").count()) === 5);
  ok(`${w} table six rows`, (await p.locator("#tab tbody tr").count()) === 6);
  ok(`${w} six predictions listed, five held`, (await p.locator("#pred li").count()) === 6 && (await p.textContent("#pred")).split("held.").length - 1 === 5);
  ok(`${w} default verdict: only both columns see it`, (await p.textContent("#verdict")).includes("only a scorer holding the second column"));
  await p.locator("#s").fill("0"); await p.locator("#s").dispatchEvent("input");
  ok(`${w} no effect gives zero fine`, (await p.textContent("#cells")).includes("0.000"));
  await p.locator("#s").fill("100"); await p.locator("#s").dispatchEvent("input");
  await p.click("#bD");
  ok(`${w} deaths view: neither sees it in 16 years`, (await p.textContent("#verdict")).startsWith("Neither"));
  await p.click("#bH");
  await p.screenshot({ path: path.join(process.env.SHOTS || here, `shot-${w}-${scheme}.png`), fullPage: false });
  await ctx.close();
}
await browser.close();
console.log(`${ran - fail} of ${ran} passed`); process.exit(fail ? 1 : 0);
