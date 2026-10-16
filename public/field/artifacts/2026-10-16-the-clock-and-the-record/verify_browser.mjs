// Study 18 page check: headless, 390 px light and 1100 px dark. Usage: node verify_browser.mjs
import { createRequire } from "module"; import path from "path"; import url from "url";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW || "playwright"); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const page_url = url.pathToFileURL(path.join(here, "index.html")).href;
const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || undefined });
let fail = 0, ran = 0;
const ok = (n, c) => { ran++; console.log((c ? "PASS " : "FAIL ") + n); if (!c) fail++; };
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(page_url); await p.waitForTimeout(1500);
  ok(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  ok(`${w} no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`${w} registered test shown`, (await p.textContent("#cells")).includes("128 of 238") && (await p.textContent("#cells")).includes("2415 of 4498"));
  ok(`${w} figure drawn`, (await p.locator("#fig circle").count()) > 20);
  ok(`${w} table three rows`, (await p.locator("#tab tbody tr").count()) === 3);
  await p.locator("#s").fill("20"); await p.locator("#s").dispatchEvent("input"); await p.waitForTimeout(200);
  ok(`${w} placebo slider gives registered placebo`, (await p.textContent("#cells")).includes("1921 of 3560"));
  await p.screenshot({ path: path.join(process.env.SHOTS || here, `shot-${w}.png`), fullPage: false });
  await ctx.close();
}
await browser.close();
console.log(`${ran - fail} of ${ran} passed`); process.exit(fail ? 1 : 0);
