// Study 26 page check: headless, 390 px light and 1100 px dark. Usage: NODE_PATH=<dir with playwright> node verify_26.mjs
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
  ok(`${w}: study 25 figure still drawn`, await p.locator("#h25 circle.pt").count() === 9);
  ok(`${w}: nine clock buttons`, await p.locator("#base26 button").count() === 9);
  ok(`${w}: three bars`, await p.locator("#h26 line[stroke-width='12']").count() === 3);
  ok(`${w}: first-hour caption says the odds hand reaches further`, (await p.textContent("#cap26")).includes("odds hand reaches further"));
  ok(`${w}: first-hour odds hand reads 47 of 36.85`, (await p.textContent("#cap26")).includes("47 of 36.85"));
  await p.click("#base26 button:nth-child(4)");
  ok(`${w}: at 24 h the outcome hand reaches further on both sides`, (await p.textContent("#cap26")).includes("outcome hand reaches further on both sides"));
  ok(`${w}: five predictions, three held`, (await p.locator("#pred26 tbody tr").count()) === 5 && (await p.locator("#pred26 td.held").count()) === 3);
  ok(`${w}: Studio table has nine rows, first 49 of 88.3`, (await p.locator("#stu26 tbody tr").count()) === 9 && (await p.textContent("#stu26 tbody tr")).includes("49 of 88.3"));
  ok(`${w}: seven versions seen before issue`, (await p.textContent("#seen26")) === "7");
  const bb = await p.locator("#h26").boundingBox();
  const tx = await p.evaluate(() => Math.min(...[...document.querySelectorAll("#h26 text")].map(t => t.getBoundingClientRect().left)));
  const tr = await p.evaluate(() => Math.max(...[...document.querySelectorAll("#h26 text")].map(t => t.getBoundingClientRect().right)));
  ok(`${w}: figure and its labels fit the viewport`, bb && bb.x >= 0 && bb.x + bb.width <= w + 1 && tx >= 0 && tr <= w + 1);
  await p.locator("#h26").scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s26_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#h26").boundingBox()).y - 80), width: w, height: 520 } });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
