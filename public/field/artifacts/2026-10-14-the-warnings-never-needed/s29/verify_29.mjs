// Study 29 page check: headless, 390 px light and 1100 px dark. Usage: node s29/verify_29.mjs
import { createRequire } from "module"; import path from "path"; import url from "url";
const require = createRequire(import.meta.url);
const pw = require("playwright");
const here = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
let pass = 0, fail = 0; const ok = (n, c) => { c ? pass++ : fail++; console.log((c ? "PASS " : "FAIL ") + n); };
const b = await pw.chromium.launch();
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto("file://" + path.join(here, "index.html"));
  ok(`${w}: no script errors`, errs.length === 0);
  ok(`${w}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok(`${w}: study 27 still drawn`, (await p.locator("#s27f1 circle").count()) === 155);
  const head = await p.textContent("#s29 .big");
  ok(`${w}: headline says 155, 149 and 6`, head.includes("155") && head.includes("149 (96.1 %") && head.includes("6 have"));
  ok(`${w}: 155 dots by adjusted chance`, (await p.locator("#s29f1 circle").count()) === 155);
  ok(`${w}: five predictions, three held`, (await p.locator("#s29p tr").count()) === 5 && (await p.locator("#s29p td.held").count()) === 3);
  ok(`${w}: 50 domains, four differ`, (await p.locator("#s29d tr").count()) === 50 && (await p.locator("#s29d tr.differ").count()) === 4);
  ok(`${w}: 1893 opens by default, 37 of 364, adjusted 0.25`, (await p.textContent("#s29-read")).includes("37 of 364") && (await p.textContent("#s29-read")).includes("0.25"));
  await p.click("#s29 [data-a='10607']");
  ok(`${w}: 4 Dec 2025 holds no event`, (await p.textContent("#s29-read")).includes("no event of M1"));
  await p.click("#s29 [data-a='5404']");
  ok(`${w}: the offshore quake is behind`, (await p.textContent("#s29-read")).includes("behind this alert") && (await p.textContent("#s29-read")).includes("M5.58"));
  await p.click("#s29 [data-a='1893']");
  const box = await p.locator("#s29f2").boundingBox();
  await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.8);
  ok(`${w}: a chosen point is counted`, (await p.textContent("#s29-read")).includes("Your point"));
  ok(`${w}: a dated correction in study 27`, (await p.locator("#s27 p.small b", { hasText: "Corrected 2026-10-19 (study 29" }).count()) === 1);
  await p.locator("#s29").screenshot({ path: path.join(here, "s29", `shot-${w}-${scheme}.png`) });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
