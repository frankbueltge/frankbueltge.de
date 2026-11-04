// Study 16 page check: headless, 390 px light and 1100 px dark. Usage: node verify_browser.mjs
import { createRequire } from "module"; import path from "path"; import url from "url";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW || "playwright"); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const page_url = url.pathToFileURL(path.join(here, "index.html")).href;
const browser = await pw.chromium.launch();
let fail = 0, ran = 0;
const ok = (n, c) => { ran++; console.log((c ? "PASS " : "FAIL ") + n); if (!c) fail++; };
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(page_url); await p.waitForTimeout(2500);
  ok(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  ok(`${w} no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`${w} headline filled`, (await p.textContent("#b-lo")).includes("%") && (await p.textContent("#b-hi")).includes("%"));
  ok(`${w} auto-switch to within`, (await p.getAttribute("#m-in", "aria-pressed")) === "true");
  await p.click("#m-nat"); await p.waitForTimeout(700);
  ok(`${w} national tip`, (await p.textContent("#bars-tip")).startsWith("Ranked across"));
  ok(`${w} office options`, (await p.locator("#wfo option").count()) >= 70);
  const target = await p.locator("#strip rect").first().getAttribute("data-wfo"); await p.locator("#strip rect").first().dispatchEvent("click"); await p.waitForTimeout(200);
  ok(`${w} strip click opens office`, (await p.inputValue("#wfo")) === target && (await p.textContent("#strip-tip")).startsWith(target));
  ok(`${w} five predictions rows`, (await p.locator("#pred tbody tr").count()) === 5);
  ok(`${w} mix bars`, (await p.locator("#mix rect").count()) === 25);
  await p.screenshot({ path: path.join(process.env.SHOTS || here, `shot-${w}-${scheme}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(`${ran} of 18 checks ran, ${fail} failed`); process.exit(fail || ran !== 18 ? 1 : 0);
