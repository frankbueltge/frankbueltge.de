// Bound to Proceed — reads every asserted figure and quotation from the rendered page and checks it
// against data/log.json and sources.json. Run: node check_page.mjs  (needs a headless browser library on NODE_PATH)
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const LOG = JSON.parse(readFileSync(path.join(here, "data/log.json"), "utf8"));
const SRC = JSON.parse(readFileSync(path.join(here, "sources.json"), "utf8"));
const QUOTE = Object.fromEntries(SRC.quotes.map((q) => [q.id, q]));

let checks = 0, fails = 0;
function ok(cond, what) { checks++; if (!cond) { fails++; console.log("FAIL", what); } }
function norm(s) {
  return s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/[­​]/g, "")
    .replace(/\s+/g, " ").trim();
}
// a page quotation may be a contiguous excerpt of the source passage; a passage found across a page break
// (several parts) is compared without the dash the text layer dropped between its parts
function sameQuote(id, pageText) {
  const q = QUOTE[id]; if (!q || q.found === "missing") return false;
  const a = norm(q.quote), b = norm(pageText);
  if (b.length >= 20 && a.includes(b)) return true;
  const nd = (s) => s.replace(/ - /g, " ").replace(/\s+/g, " ");
  return (q.parts || 1) > 1 && nd(a) === nd(b);
}
function unwrap(t) { return t.trim().replace(/^“/, "").replace(/”$/, ""); }
const PROTOCOL = norm(readFileSync(path.join(here, "../../../PROTOCOL.md"), "utf8"));
function at(obj, p) { return p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj); }

// log.js carries exactly log.json
const js = readFileSync(path.join(here, "data/log.js"), "utf8");
ok(JSON.stringify(JSON.parse(js.slice(js.indexOf("{"), js.lastIndexOf("}") + 1))) === JSON.stringify(LOG), "log.js equals log.json");

// every quotation in the data was found in its source
ok(SRC.counts.missing === 0, "no quotation missing from its source");
const dataQuotes = [];
for (const r of LOG.rows) for (const c of LOG.columns) for (const q of r.cells[c].quotes || []) if (q.id) dataQuotes.push(q);
for (const s of LOG.night) for (const q of s.quotes) if (q.id) dataQuotes.push(q);
for (const q of dataQuotes) {
  if (q.source === "protocol") ok(PROTOCOL.includes(norm(q.text)), "constitution sentence " + q.id);
  else ok(sameQuote(q.id, q.text), "data quote " + q.id);
}

// the claims the buttons make, from the data
const C = LOG.counts;
const empty = LOG.rows.filter((r) => r.cells.why.v === "none").length;
ok(empty === (C.sea_rows - C.sea_why) + C.receivers + (C.house_rows - C.house_why), "empty why column = sea + all AI + architect");
ok(C.say_duty_public === 0 && C.when_public === 0 && C.why === 0 && C.silent_named_public === 0, "public-bodies sentence holds");
ok(LOG.night.filter((s) => s.master_receives).length === C.night_master_receipts, "night: master receipts");
const hc = LOG.house.counts;
ok(LOG.house.points.length === hc.handoffs, "house: points = handoffs");
for (const st of ["taken", "declined", "lapsed", "open"]) ok(LOG.house.points.filter((p) => p.status === st).length === hc[st], "house: " + st);
ok(LOG.house.points.filter((p) => p.correction).length === hc.corrections, "house: corrections");

const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("file://" + path.join(here, "index.html"));
  await page.waitForTimeout(300);

  // figures typed into the prose
  const ks = await page.$$eval("[data-k]", (els) => els.map((e) => [e.getAttribute("data-k"), e.textContent.trim()]));
  for (const [k, t] of ks) {
    const v = at(LOG, k);
    const good = typeof v === "number" ? Number(t.replace(/,/g, "")) === v : String(v) === t;
    ok(v !== undefined && good, `${width}px data-k ${k}: page "${t}" vs data "${v}"`);
  }

  // quotations in the prose
  const qs = await page.$$eval("q[data-q]", (els) => els.map((e) => [e.getAttribute("data-q"), e.textContent]));
  for (const [id, t] of qs) ok(sameQuote(id, t), `${width}px quote ${id}`);

  // the log: drawn cells against the data
  const drawn = await page.evaluate(() => {
    const n = (s) => document.querySelectorAll("#log " + s).length;
    return { duty: n("rect.c-duty"), recommended: n("rect.c-rec"), power: n("rect.c-power"), silence: n("rect.c-silence"),
      owed: n("rect.c-owed"), rows: n("g.row") };
  });
  for (const v of ["duty", "recommended", "power", "silence"]) {
    const want = LOG.rows.reduce((a, r) => a + LOG.columns.filter((c) => r.cells[c].v === v).length, 0);
    ok(drawn[v] === want, `${width}px cells ${v}: ${drawn[v]} vs ${want}`);
  }
  ok(drawn.owed === empty, `${width}px owed cells ${drawn.owed} vs ${empty}`);
  ok(drawn.rows === LOG.rows.length, `${width}px rows`);

  // every cell's panel shows its label and its quotations (1100 only; same script at 390)
  if (width === 1100) {
    const panels = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll("#log g.row").forEach((g) => {
        const hits = g.querySelectorAll("rect.hit");
        hits.forEach((h, i) => { h.dispatchEvent(new MouseEvent("click", { bubbles: true })); out.push([g.getAttribute("data-id"), i, document.getElementById("det").textContent]); });
      });
      return out;
    });
    const byId = Object.fromEntries(LOG.rows.map((r) => [r.id, r]));
    for (const [id, i, text] of panels) {
      const cl = byId[id].cells[LOG.columns[i]];
      const t = norm(text);
      ok(cl.v === "none" || t.includes(norm(cl.label)), `panel ${id}/${LOG.columns[i]} label`);
      for (const q of cl.quotes || []) ok(t.includes(norm(q.text)), `panel ${id}/${LOG.columns[i]} quote`);
    }
  }

  // buttons
  await page.click("#b-rule");
  const say = await page.$eval("#say", (e) => e.textContent);
  ok(say.includes(` ${empty} of ${LOG.rows.length} rows`), `${width}px rule sentence: ${say}`);
  ok(await page.$eval("#log", (e) => e.classList.contains("ruled")), `${width}px log ruled`);
  await page.click("#b-public");
  const say2 = await page.$eval("#say", (e) => e.textContent);
  ok(say2.includes(`The ${C.public_bodies} public bodies`), `${width}px public sentence`);
  const dimmed = await page.$$eval("#log g.row.dim", (e) => e.length);
  ok(dimmed === C.receivers - C.public_bodies, `${width}px dimmed rows ${dimmed}`);

  // the night
  const night = await page.evaluate(() => ({ st: document.querySelectorAll("#night circle.st").length,
    m: document.querySelectorAll("#night circle.st.m").length, owed: document.querySelectorAll("#night rect.owedn").length }));
  ok(night.st === LOG.night.length, `${width}px night stations`);
  ok(night.m === C.night_master_receipts && night.owed === C.night_master_receipts, `${width}px night owed cells`);
  await page.click("#b-night");
  ok((await page.$eval("#nsay", (e) => e.textContent)).includes(`each of the ${C.night_master_receipts} times`), `${width}px night sentence`);
  const nq = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("#night circle.hit").forEach((h) => {
      h.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      document.querySelectorAll("#ndet blockquote[data-quote]").forEach((b) => out.push([b.getAttribute("data-quote"), b.textContent]));
    });
    return out;
  });
  ok(nq.length === LOG.night.reduce((a, s) => a + s.quotes.length, 0), `${width}px night panel quotes count`);
  for (const [id, t] of nq) ok(sameQuote(id, unwrap(t)), `${width}px night quote ${id}`);

  // the house's log
  const strip = await page.evaluate(() => {
    const o = {}; document.querySelectorAll("#strip circle[data-status]").forEach((c) => { o[c.dataset.status] = (o[c.dataset.status] || 0) + 1; });
    o.cor = document.querySelectorAll("#strip circle.p-cor").length; return o;
  });
  for (const st of ["taken", "declined", "lapsed", "open"]) ok((strip[st] || 0) === hc[st], `${width}px strip ${st}`);
  ok(strip.cor === hc.corrections, `${width}px strip corrections`);

  // no horizontal scroll at phone width; no script errors
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= width, `${width}px no horizontal scroll (${sw})`);
  ok(errors.length === 0, `${width}px no script errors: ${errors.join(" | ")}`);
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ checks, fails }));
process.exit(fails ? 1 : 0);
