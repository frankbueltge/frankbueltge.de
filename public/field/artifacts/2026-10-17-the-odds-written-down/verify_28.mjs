// Study 28 page check: headless, 390 px light and 1100 px dark. Usage: NODE_PATH=<dir with playwright> node verify_28.mjs
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
  ok(`${w}: study 26 figure still drawn`, await p.locator("#h26 line[stroke-width='12']").count() === 3);
  ok(`${w}: four view buttons`, await p.locator("#seg28 button").count() === 4);
  ok(`${w}: both: ten dots with whiskers`, await p.locator("#h28 circle.pt28").count() === 10 && await p.locator("#h28 line.w28").count() === 10);
  ok(`${w}: SR_h printed 0.67 (0.48–0.92)`, (await p.textContent("#cap28")).includes("0.67 of the later rate (0.48–0.92)") && (await p.textContent("#srh28")) === "0.67");
  await p.click("#seg28 button:nth-child(2)");
  ok(`${w}: first hour alone: five dots`, await p.locator("#h28 circle.pt28").count() === 5);
  await p.click("#seg28 button:nth-child(4)");
  ok(`${w}: six-hour split: two dots, 22 of 13.74 and 22 of 33.52`, await p.locator("#h28 circle.pt28").count() === 2 && (await p.textContent("#cap28")).includes("22 of 13.74") && (await p.textContent("#cap28")).includes("22 of 33.52"));
  ok(`${w}: five predictions, three held`, (await p.locator("#pred28 tbody tr").count()) === 5 && (await p.locator("#pred28 td.held").count()) === 3);
  const bb = await p.locator("#h28").boundingBox();
  const ext = await p.evaluate(() => { const r = [...document.querySelectorAll("#h28 text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
  ok(`${w}: figure and its labels fit the viewport`, bb && bb.x >= 0 && bb.x + bb.width <= w + 1 && ext[0] >= 0 && ext[1] <= w + 1);
  await p.click("#seg28 button:nth-child(1)");
  await p.locator("#h28").scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s28_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#h28").boundingBox()).y - 80), width: w, height: 520 } });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
