// Study 25 page check: headless, 390 px light and 1100 px dark. Usage: NODE_PATH=<dir with playwright> node verify_25.mjs
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
  ok(`${w}: study 23 figure still drawn`, await p.locator("#h23 circle").count() === 2);
  ok(`${w}: nine points drawn`, await p.locator("#h25 circle.pt").count() === 9);
  ok(`${w}: one orange point (too high)`, await p.locator('#h25 circle.pt[fill="var(--a)"]').count() === 1);
  ok(`${w}: caption opens on the first forecast, 49 of 88.3`, (await p.textContent("#cap25")).includes("49 came of 88.3"));
  await p.locator("#h25 circle.pt").nth(1).click();
  ok(`${w}: tapping the 6 h point reads 46 of 50.6`, (await p.textContent("#cap25")).includes("46 came of 50.6"));
  await p.click("#set25 button:nth-child(2)");
  ok(`${w}: common set reads 232 sequences`, (await p.textContent("#cap25")).includes("232 sequences"));
  ok(`${w}: five predictions, four held`, (await p.locator("#pred25 tbody tr").count()) === 5 && (await p.locator("#pred25 td.held").count()) === 4);
  await p.click("#seg25 button:nth-child(2)");
  const t = await p.textContent("#h25");
  ok(`${w}: readers view carries 0.56–0.94, 0.22–1.34 and 0.01–3.52`, t.includes("0.56–0.94") && t.includes("0.22–1.34") && t.includes("0.01–3.52"));
  ok(`${w}: narrowed tag on finding 1`, (await p.textContent("#found")).includes("narrowed 2026-10-19"));
  const bb = await p.locator("#h25").boundingBox();
  ok(`${w}: figure fits the viewport`, bb && bb.x >= 0 && bb.x + bb.width <= w + 1);
  await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s25_${w}.png`), fullPage: false, clip: { x: 0, y: Math.max(0, (await p.locator("#h25").boundingBox()).y - 60), width: w, height: 600 } });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
