// Study 27 page check: headless, 390 px light and 1100 px dark. Usage: node s27/verify_27.mjs
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
  ok(`${w}: study 24 still drawn`, (await p.locator("#s24f2 circle").count()) === 8 && (await p.textContent("#s24-b")) === "10.8 %");
  const head = await p.textContent("#s27 .big");
  ok(`${w}: headline says 155, 136 (87.7 %), 28 and 3 alerts`, head.includes("155") && head.includes("136 (87.7 %") && head.includes("28 (18.1 %)") && head.includes("3 alerts"));
  ok(`${w}: 155 dots and 19 tsunami squares`, (await p.locator("#s27f1 circle").count()) === 155 && (await p.locator("#s27f1 rect").count()) === 19);
  ok(`${w}: five predictions, three held`, (await p.locator("#s27p tr").count()) === 5 && (await p.locator("#s27p td.held").count()) === 3);
  await p.click("#s27 [data-r=live_r200]");
  ok(`${w}: 200 km toggle reads 151`, (await p.textContent("#s27f1 text:first-of-type")) !== null && (await p.locator("#s27f1").textContent()).includes("151 of 155"));
  await p.click("#s27 [data-r=live_m45]");
  ok(`${w}: M4.5 toggle reads 113`, (await p.locator("#s27f1").textContent()).includes("113 of 155"));
  ok(`${w}: 60 hand squares`, (await p.locator("#s27f2 rect").count()) === 60);
  ok(`${w}: two dated corrections in study 24`, (await p.locator("#s24 p.small b", { hasText: "Corrected 2026-10-19" }).count()) === 2);
  await p.click("#s27 [data-r=live]");
  await p.locator("#s27f1 circle").first().click();
  ok(`${w}: a dot tells its message`, (await p.textContent("#s27t1")).includes('"'));
  await p.locator("#s27").screenshot({ path: path.join(here, "s27", `shot-${w}-${scheme}.png`) });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
