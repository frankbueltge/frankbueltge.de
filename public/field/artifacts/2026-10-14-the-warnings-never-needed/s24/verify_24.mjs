// Study 24 page check: headless, 390 px light and 1100 px dark. Usage: node s24/verify_24.mjs
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
  ok(`${w}: study 14 figure still drawn`, await p.locator("#fig1 rect").count() > 20);
  const head = await p.textContent("#s24 .big");
  ok(`${w}: headline says 8,948, 3,222 and 1,216 (37.7 %)`, head.includes("8,948") && head.includes("3,222") && head.includes("1,216 (37.7 %)"));
  ok(`${w}: five predictions, three held`, (await p.locator("#s24p tr").count()) === 5 && (await p.locator("#s24p td.held").count()) === 3);
  ok(`${w}: class rows drawn with the check row`, (await p.locator("#s24f2 circle").count()) === 8);
  await p.click("#s24 [data-w=met_strict]");
  ok(`${w}: window toggle reads 972`, (await p.textContent("#s24t1")).includes("972 of 3,222"));
  await p.click("#s24 [data-w=met_72]");
  ok(`${w}: window toggle reads 1,313`, (await p.textContent("#s24t1")).includes("1,313 of 3,222"));
  ok(`${w}: fire examples shown`, (await p.locator("#s24ex li").count()) === 8);
  ok(`${w}: bound text says 10.8 %`, (await p.textContent("#s24-b")) === "10.8 %");
  await p.locator("#s24").screenshot({ path: path.join(here, "s24", `shot-${w}-${scheme}.png`) });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
