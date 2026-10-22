// Studies 31-38 page check: headless, 390 px light and 1100 px dark. Usage: NODE_PATH=<dir with playwright> node verify.mjs
import { createRequire } from "module"; import path from "path"; import url from "url"; import fs from "fs";
const require = createRequire(import.meta.url);
const pw = require("playwright");
const here = path.dirname(url.fileURLToPath(import.meta.url));
const R = JSON.parse(fs.readFileSync(path.join(here, "data/results31.json"), "utf8"));
const s32 = fs.readFileSync(path.join(here, "data-32.js"), "utf8"), R2 = JSON.parse(s32.slice(s32.indexOf("{"), s32.lastIndexOf("}") + 1));
const R3 = JSON.parse(fs.readFileSync(path.join(here, "data/results33.json"), "utf8"));
const R4 = JSON.parse(fs.readFileSync(path.join(here, "data/results34.json"), "utf8"));
const R5 = JSON.parse(fs.readFileSync(path.join(here, "data/results35.json"), "utf8"));
const R6 = JSON.parse(fs.readFileSync(path.join(here, "data/results36.json"), "utf8"));
const R7 = JSON.parse(fs.readFileSync(path.join(here, "data/results37.json"), "utf8"));
const R8 = JSON.parse(fs.readFileSync(path.join(here, "data/results38.json"), "utf8"));
let pass = 0, fail = 0; const ok = (n, c) => { c ? pass++ : fail++; console.log((c ? "PASS " : "FAIL ") + n); };
const b = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
for (const [w, scheme] of [[390, "light"], [1100, "dark"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto("file://" + path.join(here, "index.html"));
  ok(`${w}: no script errors`, errs.length === 0);
  ok(`${w}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok(`${w}: across view: 5 rows`, await p.locator("#forest circle.pt").count() === 5);
  ok(`${w}: injuries: one filled dot (office, year before)`, await p.locator("#forest circle.pt.above").count() === 1);
  await p.locator("#forest g.row").nth(0).dispatchEvent("click");
  ok(`${w}: tap gives the replication's numbers`, (await p.textContent("#det")).includes(`${R.fits.past_inj.irr.toFixed(2)} per standard deviation (95 % interval ${R.fits.past_inj.lo.toFixed(2)}–${R.fits.past_inj.hi.toFixed(2)})`));
  await p.click("#seg-y button[data-v=fat]");
  ok(`${w}: deaths: past and future filled, the unconverged state fit dashed`, await p.locator("#forest circle.pt.above").count() === 2 && await p.locator("#forest circle.pt.nc").count() === 1);
  await p.locator("#forest g.row").nth(2).dispatchEvent("click");
  ok(`${w}: state deaths fit flagged as not converged`, (await p.textContent("#det")).includes("did not converge"));
  await p.click("#seg-v button[data-v=within]");
  ok(`${w}: within view: 2 rows`, await p.locator("#forest circle.pt").count() === 2);
  await p.click("#seg-y button[data-v=inj]");
  await p.locator("#forest g.row").nth(0).dispatchEvent("click");
  ok(`${w}: within injuries: 1.01 and 22 offices left out`, (await p.textContent("#det")).includes("1.01 per standard deviation") && (await p.textContent("#det")).includes("22 offices"));
  await p.click("#seg-y button[data-v=fat]");
  await p.locator("#forest g.row").nth(0).dispatchEvent("click");
  ok(`${w}: within deaths shows the corrected interval and says so`, (await p.textContent("#det")).includes("1.15 per standard deviation (95 % interval 0.95–1.40)") && (await p.textContent("#det")).includes("corrected 2026-10-20"));
  await p.click("#seg-y button[data-v=inj]");
  ok(`${w}: the old interval is struck, not deleted`, (await p.locator("del").count()) === 2 && (await p.textContent("body")).includes("0.43–3.05"));
  ok(`${w}: scatter: one dot per office-year`, await p.locator("#oy circle.dot").count() === R2.officeyears.length);
  await p.locator("#oy circle.dot").nth(0).dispatchEvent("click");
  const oy0 = R2.officeyears[0];
  ok(`${w}: tapped office-year reports its counts`, (await p.textContent("#oydet")).startsWith(`${oy0[0]}, ${oy0[1]}: ${oy0[2]} warnings`));
  ok(`${w}: paired forest: 4 office + 5 final dots`, await p.locator("#pair circle.pt.office").count() === 4 && await p.locator("#pair circle.pt.final").count() === 5);
  await p.locator("#pair g.row").nth(0).dispatchEvent("click");
  const fp = R2.fits.final_past_inj.z_ffp;
  ok(`${w}: paired row gives both records`, (await p.textContent("#pairdet")).includes(`Final database: ${fp.irr.toFixed(2)} (${fp.lo.toFixed(2)}–${fp.hi.toFixed(2)})`) && (await p.textContent("#pairdet")).includes(`office's verdict: ${R.fits.past_inj.irr.toFixed(2)}`));
  await p.click("#seg-y2 button[data-v=fat]");
  await p.locator("#pair g.row").nth(2).dispatchEvent("click");
  ok(`${w}: paired within deaths carries the correction`, (await p.textContent("#pairdet")).includes("0.95–1.40") && (await p.textContent("#pairdet")).includes("corrected"));
  ok(`${w}: seven predictions of study 32, five held`, (await p.locator("#pred32 tbody tr").count()) === 7 && (await p.locator("#pred32 td.held").count()) === 5);
  for (const id of ["#oy", "#pair"]) {
    const bx = await p.locator(id).boundingBox();
    const ex = await p.evaluate(s => { const r = [...document.querySelectorAll(s + " text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; }, id);
    ok(`${w}: ${id} and its labels fit the viewport and the figure`, bx && bx.x >= 0 && bx.x + bx.width <= w + 1 && ex[0] >= bx.x - 1 && ex[1] <= bx.x + bx.width + 1);
  }
  // study 33
  ok(`${w}: parts forest: 5 year-before + 5 year-after + 2 within dots`, await p.locator("#parts circle.pt.final").count() === 7 && await p.locator("#parts circle.pt.office").count() === 5);
  await p.locator("#parts g.row").nth(2).dispatchEvent("click");
  const ex = R3.fits.wexp_excess_past_inj.z_excess_past, exf = R3.fits.wexp_excess_future_inj.z_excess_future;
  ok(`${w}: "beyond the words" row gives both windows from results33.json`, (await p.textContent("#partsdet")).includes(`Year before: ${ex.irr.toFixed(2)} (${ex.lo.toFixed(2)}–${ex.hi.toFixed(2)})`) && (await p.textContent("#partsdet")).includes(`year after: ${exf.irr.toFixed(2)}`));
  await p.locator("#parts g.row").nth(6).dispatchEvent("click");
  const tk = R3.fits.taken_past_fe_inj.z_taken_past;
  ok(`${w}: within-office taken-back row: ${tk.irr} and 4 offices left out`, (await p.textContent("#partsdet")).includes(`${tk.irr.toFixed(2)} (${tk.lo.toFixed(2)}–${tk.hi.toFixed(2)})`) && (await p.textContent("#partsdet")).includes("4 offices"));
  await p.click("#seg-y3 button[data-v=fat]");
  ok(`${w}: deaths: three within/unconverged dots dashed or not, never a bar for an unconverged fit`, await p.locator("#parts circle.pt.nc").count() === Object.entries(R3.fits).filter(([k, v]) => ["excess_past_fe_fat", "taken_past_fe_fat"].includes(k) && !v.converged).length);
  await p.locator("#parts g.row").nth(5).dispatchEvent("click");
  ok(`${w}: unconverged within-office deaths fit says so`, (await p.textContent("#partsdet")).includes("did not converge"));
  await p.click("#seg-y3 button[data-v=inj]");
  ok(`${w}: seven predictions of study 33, three held`, (await p.locator("#pred33 tbody tr").count()) === 7 && (await p.locator("#pred33 td.held").count()) === 3);
  {
    const bx = await p.locator("#parts").boundingBox();
    const ex2 = await p.evaluate(() => { const r = [...document.querySelectorAll("#parts text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
    ok(`${w}: #parts and its labels fit the viewport and the figure`, bx && bx.x >= 0 && bx.x + bx.width <= w + 1 && ex2[0] >= bx.x - 1 && ex2[1] <= bx.x + bx.width + 1);
    await p.locator("#parts").scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s33_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#parts").boundingBox()).y - 60), width: w, height: 620 } });
  }
  // study 34
  ok(`${w}: price: six class dots`, await p.locator("#price circle.pt").count() === 6);
  ok(`${w}: central B / L from results34.json (later record)`, (await p.textContent("#pricedet")).includes(`B / L = ${R4.r_central.later.toFixed(2)}`) && (await p.textContent("#pricedet")).includes("above the band"));
  ok(`${w}: later record's own break-even, $7.09 (correction of 10-22)`, (await p.textContent("#pricedet")).includes("less than $7.09."));
  await p.click("#seg-rec button[data-v=hour]");
  ok(`${w}: hour's ledger B / L`, (await p.textContent("#pricedet")).includes(`B / L = ${R4.r_central.hour.toFixed(2)}`));
  ok(`${w}: hour's ledger own break-even, $7.14 (correction of 10-22)`, (await p.textContent("#pricedet")).includes("less than $7.14."));
  ok(`${w}: section 7 carries the dated correction of the band`, (await p.textContent("body")).includes("corrected 2026-10-22 (the Atelier’s offer"));
  await p.click("#seg-rec button[data-v=later]");
  await p.locator("#s-v").fill("7");
  ok(`${w}: an hour at $7 puts B / L inside the band`, (await p.textContent("#pricedet")).includes("inside the band"));
  await p.locator("#s-v").fill("5");
  ok(`${w}: an hour at $5 puts it below the band`, (await p.textContent("#pricedet")).includes("below the band") && await p.locator("#price circle.pt.above").count() === 5);
  await p.click("#s-reset");
  await p.check("#s-whole");
  ok(`${w}: the whole warning matches the registered bound`, (await p.textContent("#pricedet")).includes(`B / L = ${R4.sweep_later.h[1].toFixed(2)}`) && await p.locator("#s-min").isDisabled());
  await p.click("#s-reset");
  ok(`${w}: reset restores central`, (await p.textContent("#pricedet")).includes(`B / L = ${R4.r_central.later.toFixed(2)}`));
  ok(`${w}: five predictions of study 34, three held`, (await p.locator("#pred34 tbody tr").count()) === 5 && (await p.locator("#pred34 td.held").count()) === 3);
  {
    const bx = await p.locator("#price").boundingBox();
    const ex4 = await p.evaluate(() => { const r = [...document.querySelectorAll("#price text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
    ok(`${w}: #price and its labels fit the viewport and the figure`, bx && bx.x >= 0 && bx.x + bx.width <= w + 1 && ex4[0] >= bx.x - 1 && ex4[1] <= bx.x + bx.width + 1);
    await p.locator("#price").scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s34_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#price").boundingBox()).y - 260), width: w, height: 700 } });
  }
  // study 35
  ok(`${w}: villages: three rows`, await p.locator("#villages circle.pt").count() === 3);
  const f5 = R5.fits.inj.run3;
  ok(`${w}: villages: run-3 injuries from results35.json`, (await p.textContent("#villdet")).includes(`${f5.irr.toFixed(2)} (95 % interval ${f5.lo.toFixed(2)}–${f5.hi.toFixed(2)})`));
  ok(`${w}: villages: both prices inside at the defaults`, (await p.textContent("#villdet")).includes("cannot tell the two readers apart") && (await p.textContent("#villdet")).includes(`charges ${R5.prices.inj.habit.toFixed(2)}`));
  await p.locator("#s-b").fill("0");
  ok(`${w}: villages: total disbelief still inside`, (await p.textContent("#villdet")).includes(`charges ${R5.explore.habit_price_total_disbelief_inj.toFixed(2)}`) && (await p.textContent("#villdet")).includes("cannot tell"));
  await p.click("#seg-v35 button[data-v=fat]");
  ok(`${w}: villages: deaths from results35.json`, (await p.textContent("#villdet")).includes(`${R5.fits.fat.run3.irr.toFixed(2)} (95 % interval`));
  ok(`${w}: six predictions, five held (study 35)`, (await p.locator("#pred35 tbody tr").count()) === 6 && (await p.locator("#pred35 td.held").count()) === 5);
  {
    const bx = await p.locator("#villages").boundingBox();
    const ex = await p.evaluate(() => { const r = [...document.querySelectorAll("#villages text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
    ok(`${w}: #villages and its labels fit the viewport and the figure`, bx && bx.x >= 0 && bx.x + bx.width <= w + 1 && ex[0] >= bx.x - 1 && ex[1] <= bx.x + bx.width + 1);
    await p.locator("#s-b").fill("0.27");
    await p.click("#seg-v35 button[data-v=inj]");
    await p.locator("#villages").scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s35_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#villages").boundingBox()).y - 200), width: w, height: 620 } });
  }
  // study 36 (coda)
  ok(`${w}: coda: four sets and thirty leave-outs`, await p.locator("#loo g.set circle.pt").count() === 4 && await p.locator("#loo circle.dot").count() === 30);
  const j6 = R6.sets.without_joplin.inj;
  ok(`${w}: coda: Joplin set aside from results36.json`, (await p.textContent("#loodet")).includes(`With Joplin set aside: ${j6.irr.toFixed(2)} (${j6.lo.toFixed(2)}–${j6.hi.toFixed(2)})`));
  const ij = R6.loo.findIndex(x => x.om === 296616);
  await p.locator("#loo circle.dot").nth(ij).dispatchEvent("click");
  ok(`${w}: coda: tapping Joplin's dot names it and its ratio`, (await p.textContent("#loodet")).includes("MO, 2011-05-22") && (await p.textContent("#loodet")).includes(`becomes ${R6.loo[ij].inj_run3.irr.toFixed(2)}`));
  await p.click("#seg-v36 button[data-v=fat]");
  ok(`${w}: coda: deaths without Joplin`, (await p.textContent("#loodet")).includes(`becomes ${R6.sets.without_joplin.fat.irr.toFixed(2)}`));
  ok(`${w}: five predictions, five held (study 36)`, (await p.locator("#pred36 tbody tr").count()) === 5 && (await p.locator("#pred36 td.held").count()) === 5);
  ok(`${w}: section 8's deaths ratio carries its dated qualification`, (await p.textContent("#s35 ~ p.small")).includes("qualified 2026-10-22"));
  {
    const bx = await p.locator("#loo").boundingBox();
    const ex = await p.evaluate(() => { const r = [...document.querySelectorAll("#loo text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
    ok(`${w}: #loo and its labels fit the viewport and the figure`, bx && bx.x >= 0 && bx.x + bx.width <= w + 1 && ex[0] >= bx.x - 1 && ex[1] <= bx.x + bx.width + 1);
    await p.click("#seg-v36 button[data-v=inj]");
    await p.locator("#loo").scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s36_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#loo").boundingBox()).y - 260), width: w, height: 700 } });
  }
  // study 37 (second coda)
  ok(`${w}: second coda: 40 leave-outs, 10 of them new`, await p.locator("#pull circle.dot37").count() === 40 && await p.locator("#pull circle.dot37.new").count() === 10);
  ok(`${w}: second coda opens on Louisiana from results37.json`, (await p.textContent("#pulldet")).includes("LA, 2016-02-23, EF2") && (await p.textContent("#pulldet")).includes(`expected ${R7.named.louisiana.mu.toFixed(1)}`) && (await p.textContent("#pulldet")).includes("becomes 1.30"));
  const iok = 30 + R7.refits.findIndex(x => x.om === 315890);
  await p.locator("#pull circle.dot37").nth(iok).dispatchEvent("click");
  const ok7 = R7.refits.find(x => x.om === 315890).refit;
  ok(`${w}: tapping Oklahoma gives its full refit and interval`, (await p.textContent("#pulldet")).includes(`becomes ${ok7.irr.toFixed(2)}`) && (await p.textContent("#pulldet")).includes(`${ok7.lo.toFixed(2)}–${ok7.hi.toFixed(2)}`));
  for (const v of ["surprise", "u", "inj"]) {
    await p.click(`#seg-x37 button[data-v=${v}]`);
    const bx = await p.locator("#pull").boundingBox();
    const ex = await p.evaluate(() => { const r = [...document.querySelectorAll("#pull text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
    ok(`${w}: #pull (${v}) and its labels fit the viewport and the figure`, bx && bx.x >= 0 && bx.x + bx.width <= w + 1 && ex[0] >= bx.x - 1 && ex[1] <= bx.x + bx.width + 1);
  }
  ok(`${w}: four predictions, three held (study 37)`, (await p.locator("#pred37 tbody tr").count()) === 4 && (await p.locator("#pred37 td.held").count()) === 3);
  {
    await p.click("#seg-x37 button[data-v=u]");
    await p.locator("#pull circle.dot37").nth(R7.loo36.findIndex(x => x.om === 613559)).dispatchEvent("click");
    await p.locator("#pull").scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s37_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#pull").boundingBox()).y - 300), width: w, height: 760 } });
    await p.click("#seg-x37 button[data-v=inj]");
  }
  // study 38 (third coda)
  ok(`${w}: third coda: eleven tornadoes, one contradicted`, (await p.locator("#tab38 tbody tr").count()) === 11 && (await p.locator("#tab38 td.failed").count()) === 1 && (await p.textContent("#tab38")).includes("OK, 2011-05-24, EF2"));
  ok(`${w}: third coda: four predictions, four held`, (await p.locator("#pred38 tbody tr").count()) === 4 && (await p.locator("#pred38 td.held").count()) === 4);
  ok(`${w}: third coda opens on the record as is`, (await p.textContent("#rec38det")).includes(`${R8.fits.full.irr.toFixed(2)} (95 % interval ${R8.fits.full.lo.toFixed(2)}–${R8.fits.full.hi.toFixed(2)})`) && (await p.locator("#rec38 circle.pt.above").count()) === 1);
  for (const [mc, la, k] of [["office", "split", "mcloud_1_injured"], ["office", "one", "both"], ["db", "one", "louisiana_one_track"], ["db", "split", "full"]]) {
    await p.click(`#seg-mc38 button[data-v=${mc}]`); await p.click(`#seg-la38 button[data-v=${la}]`);
    const f = R8.fits[k], t = await p.textContent("#rec38det");
    const bx = await p.locator("#rec38").boundingBox();
    const ex = await p.evaluate(() => { const r = [...document.querySelectorAll("#rec38 text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
    ok(`${w}: switches ${mc}/${la} give ${k}'s refit, and the figure fits`, t.includes(`${f.irr.toFixed(2)} (95 % interval ${f.lo.toFixed(2)}–${f.hi.toFixed(2)})`) &&
      (la === "split" || t.includes(`expects ${(f.mu_louisiana).toFixed(1)} injured`)) && bx.x >= 0 && bx.x + bx.width <= w + 1 && ex[0] >= bx.x - 1 && ex[1] <= bx.x + bx.width + 1);
  }
  {
    await p.click("#seg-mc38 button[data-v=office]"); await p.click("#seg-la38 button[data-v=one]");
    await p.locator("#rec38").scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s38_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#rec38").boundingBox()).y - 200), width: w, height: 760 } });
    await p.click("#seg-mc38 button[data-v=db]"); await p.click("#seg-la38 button[data-v=split]");
  }
  ok(`${w}: tercile table 3 rows`, await p.locator("#terc tbody tr").count() === 3);
  ok(`${w}: six predictions, six held`, (await p.locator("#pred tbody tr").count()) === 6 && (await p.locator("#pred td.held").count()) === 6);
  const bb = await p.locator("#forest").boundingBox();
  const ext = await p.evaluate(() => { const r = [...document.querySelectorAll("#forest text")].map(t => t.getBoundingClientRect()); return [Math.min(...r.map(x => x.left)), Math.max(...r.map(x => x.right))]; });
  ok(`${w}: figure and its labels fit the viewport`, bb && bb.x >= 0 && bb.x + bb.width <= w + 1 && ext[0] >= 0 && ext[1] <= w + 1);
  await p.click("#seg-v button[data-v=across]");
  await p.locator("#forest").scrollIntoViewIfNeeded();
  await p.locator("#pair").scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s32_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#oy").boundingBox()).y - 40), width: w, height: 1000 } });
  await p.locator("#forest").scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `s31_${w}.png`), clip: { x: 0, y: Math.max(0, (await p.locator("#forest").boundingBox()).y - 80), width: w, height: 520 } });
  await p.close();
}
await b.close(); console.log(`${pass} of ${pass + fail} passed`); process.exit(fail ? 1 : 0);
