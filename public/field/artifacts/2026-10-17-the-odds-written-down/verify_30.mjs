// Study 30 page check: headless, 390 px light and 1100 px dark. Usage: NODE_PATH=<dir with playwright> node verify_30.mjs
import { createRequire } from "module"; import path from "path"; import url from "url";
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
  ok(`${w}: study 28 figure still drawn`, await p.locator("#h28 circle.pt28").count() === 10);
  ok(`${w}: two view buttons`, await p.locator("#seg30 button").count() === 2);
  ok(`${w}: lift view: 18 dots, 16 whiskers`, await p.locator("#h30 circle.pt30").count() === 18 && await p.locator("#h30 line.w30").count() === 16);
  ok(`${w}: caption names 1.39 → 1.33`, (await p.textContent("#cap30")).includes("from 1.39, 1.57, 1.59 to 1.33, 1.50, 1.51"));
  await p.click("#seg30 button:nth-child(2)");
  ok(`${w}: split view: 17 dots (no hindsight at 0 h)`, await p.locator("#h30 circle.pt30").count() === 17);
  await p.locator("#h30 circle.pt30").nth(2).dispatchEvent("click");
  ok(`${w}: tapping a dot gives its counts`, (await p.textContent("#det30")).includes("picks with hindsight, decided at 1 d: 59 sequences, 19 hits; 2.40"));
  ok(`${w}: four predictions, four held`, (await p.locator("#pred30 tbody tr").count()) === 4 && (await p.locator("#pred30 td.held").count()) === 4);
  const bb = await p.locator("#h30").boundingBox();
  const ext = await p.evaluate(() => { const r = [...document.querySelectorAll("#h30 text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
  ok(`${w}: figure and its labels fit the viewport`, bb && bb.x >= 0 && bb.x + bb.width <= w + 1 && ext[0] >= 0 && ext[1] <= w + 1);
  await p.click("#seg30 button:nth-child(1)");
  await p.locator("#h30").scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s30_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#h30").boundingBox()).y - 80), width: w, height: 520 } });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
