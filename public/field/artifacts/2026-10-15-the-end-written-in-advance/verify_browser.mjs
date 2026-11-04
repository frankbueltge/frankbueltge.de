// Study 17 page check: headless, 390 px light and 1100 px dark. Usage: node verify_browser.mjs
import { createRequire } from "module"; import path from "path"; import url from "url";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW || "playwright"); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const page_url = url.pathToFileURL(path.join(here, "index.html")).href;
const browser = await pw.chromium.launch();
let fail = 0, ran = 0; const N = 22;
const ok = (n, c) => { ran++; console.log((c ? "PASS " : "FAIL ") + n); if (!c) fail++; };
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(page_url); await p.waitForTimeout(2000);
  ok(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  ok(`${w} no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`${w} key figures filled`, (await p.textContent("#k1")).includes("16,756") && (await p.textContent("#k3")).includes("99.4"));
  ok(`${w} five predictions, one failed`, (await p.locator("#pred tbody tr").count()) === 5 && (await p.locator("#pred td.failed").count()) === 1);
  ok(`${w} histogram drawn`, (await p.locator("#hist rect[data-bin]").count()) > 20);
  await p.selectOption("#code", "CAE"); await p.waitForTimeout(200);
  ok(`${w} filter to child abduction`, (await p.textContent("#code-n")).startsWith("3,266"));
  await p.locator("#hist rect[data-bin]").last().dispatchEvent("click");
  ok(`${w} histogram tip`, /warnings declared/.test(await p.textContent("#hist-tip")));
  ok(`${w} scatter: 35 late dots`, (await p.locator("#scat circle.late").count()) === 35);
  ok(`${w} scatter: 5,694 early dots`, (await p.locator("#scat circle.early").count()) === 5694);
  ok(`${w} 183 accounts`, (await p.locator("#acc rect.acc-hit").count()) === 183);
  await p.locator("#acc rect.acc-hit").nth(182).dispatchEvent("click");
  ok(`${w} account tip`, /^Account [0-9a-f]{10}: /.test(await p.textContent("#acc-tip")));
  await p.screenshot({ path: path.join(process.env.SHOTS || here, `shot-${w}-${scheme}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(`${ran} of ${N} checks ran, ${fail} failed`); process.exit(fail || ran !== N ? 1 : 0);
