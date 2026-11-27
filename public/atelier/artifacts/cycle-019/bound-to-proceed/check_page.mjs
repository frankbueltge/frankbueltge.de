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
const CASES = JSON.parse(readFileSync(path.join(here, "data/cases.json"), "utf8"));
const Q2 = {};
for (const s of CASES.stations) for (const p of s.passages) Q2[p.id] = p;
const CHECK = JSON.parse(readFileSync(path.join(here, "data/check.json"), "utf8"));
const ALL = Object.assign({}, LOG, { cases: CASES, check: CHECK });
// a passage of the check (state 3) is a contiguous excerpt of a passage check.py found word for word
function sameQuote3(id, pageText) {
  const q = CHECK.passages[id]; if (!q || q.found !== "exact") return false;
  const b = norm(pageText);
  return b.length >= 20 && norm(q.text).includes(b);
}
// a section III quotation is a contiguous excerpt of a passage cases.py found word for word in its source
function sameQuote2(id, pageText) {
  const q = Q2[id]; if (!q || q.found !== "exact") return false;
  const b = norm(pageText);
  return b.length >= 20 && norm(q.text).includes(b);
}

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
function C_PUBLIC() { return C.public_bodies; }
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
    const v = at(ALL, k);
    const good = typeof v === "number" ? Number(t.replace(/,/g, "")) === v : String(v) === t;
    ok(v !== undefined && good, `${width}px data-k ${k}: page "${t}" vs data "${v}"`);
  }

  // quotations in the prose
  const qs = await page.$$eval("q[data-q]", (els) => els.map((e) => [e.getAttribute("data-q"), e.textContent]));
  for (const [id, t] of qs) ok(sameQuote(id, t), `${width}px quote ${id}`);

  for (const [id, t] of await page.$$eval("q[data-q2]", (els) => els.map((e) => [e.getAttribute("data-q2"), e.textContent]))) ok(sameQuote2(id, t), `${width}px case quote ${id}`);

  // the check (state 3): every passage it quotes, the list against its data
  for (const [id, t] of await page.$$eval("q[data-q3]", (els) => els.map((e) => [e.getAttribute("data-q3"), e.textContent]))) ok(sameQuote3(id, t), `${width}px check quote ${id}`);
  const items = await page.$$eval("#checklist li[data-check]", (els) => els.map((e) => [e.getAttribute("data-check"), e.getAttribute("data-verdict")]));
  ok(items.length === CHECK.items.length && items.every(([id, v], i) => CHECK.items[i].id === id && CHECK.items[i].verdict === v), `${width}px checklist ${items.length} items`);
  for (const v of Object.keys(CHECK.counts.verdicts)) ok(items.filter((x) => x[1] === v).length === CHECK.counts.verdicts[v], `${width}px verdicts ${v}`);
  ok(Object.values(CHECK.passages).every((q) => q.found === "exact"), "every passage of the check found");
  ok(CHECK.counts.law_public + CHECK.counts.voluntary_public === C_PUBLIC(), "public bodies: under a law + voluntary = all");
  const cues = await page.$$eval(".swipe", (els) => els.map((e) => getComputedStyle(e).display !== "none"));
  ok(cues.length === 2 && cues.every((v) => v === (width < 640)), `${width}px swipe cues shown only on a phone`);
  const labs = await page.$$eval('#log g.row[data-band="ai"] text.nm', (els) => els.map((e) => e.textContent));
  ok(new Set(labs).size === labs.length, `${width}px every AI row's label and instrument differ from every other row's`);

  // section III: the word in 2026
  const K = CASES.counts;
  const marks = await page.evaluate(() => { const o = {}; document.querySelectorAll("#cases [data-kind]").forEach((m) => { o[m.dataset.kind] = (o[m.dataset.kind] || 0) + 1; }); return o; });
  ok((marks.received || 0) === K.receipts_no_record && (marks.acted || 0) === K.acted && (marks.told || 0) === K.told && (marks.reason || 0) === K.reason_stations, `${width}px case marks ${JSON.stringify(marks)}`);
  ok(K.receipts_no_record + K.acted + K.told + K.reason_stations === K.stations && CASES.stations.length === K.stations, "case stations add up");
  ok(CASES.reasons.length === K.reasons && CASES.reasons.filter((r) => r.names === "a circumstance").length === K.reasons_circumstance, "case reasons");
  ok(CASES.quotes.exact === CASES.quotes.n && Object.values(Q2).every((q) => q.found === "exact"), "every case passage found");
  const cs = await page.evaluate(() => ({ owed: document.querySelectorAll("#cases rect.owedn").length, lag: document.querySelectorAll("#cases path.lag").length }));
  ok(cs.owed === K.receipts_no_record && cs.lag === K.reason_stations, `${width}px sea boxes and lags`);
  const lagsData = CASES.stations.filter((s) => s.kind === "reason").map((s) => Math.round((Date.parse(s.written) - Date.parse(s.received)) / 864e5));
  ok(Math.min(...lagsData) === K.reason_lag_min && Math.max(...lagsData) === K.reason_lag_max && lagsData.filter((d) => d === 0).length === K.reasons_at_the_hour, "reason lags");
  await page.click("#b-sea26");
  const csay = await page.$eval("#csay", (e) => e.textContent);
  ok(csay.includes(`each of the ${K.receipts_no_record} words`) && csay.includes(`The ${K.reasons} reasons`) && csay.includes(`${K.reason_lag_min} to ${K.reason_lag_max} days`), `${width}px sea sentence: ${csay}`);
  ok(await page.$eval("#cases", (e) => e.classList.contains("ruled")), `${width}px cases ruled`);
  // a click at a mark's centre reaches that mark, not a neighbour's hit area
  const reach = await page.evaluate(() => [...document.querySelectorAll("#cases circle.hit")].map((h) => {
    h.scrollIntoView({ block: "center", inline: "center" });
    const r = h.getBoundingClientRect();
    return [h.getAttribute("aria-label"), document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === h];
  }));
  for (const [lab, own] of reach) ok(own, `${width}px mark reached at its centre: ${lab}`);
  const cq = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("#cases circle.hit").forEach((h) => {
      h.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      document.querySelectorAll("#cdet blockquote[data-quote2]").forEach((b) => out.push([b.getAttribute("data-quote2"), b.textContent]));
    });
    return out;
  });
  ok(cq.length === CASES.stations.reduce((a, s) => a + s.passages.length, 0), `${width}px case panel quotes count ${cq.length}`);
  for (const [id, t] of cq) ok(sameQuote2(id, unwrap(t)), `${width}px case panel quote ${id}`);
  await page.click("#b-reasons");
  const rows = await page.$$eval("#reasons tr[data-reason]", (e) => e.length);
  ok(rows === K.reasons && (await page.$eval("#reasons", (e) => !e.hidden)), `${width}px reasons table ${rows}`);
  const asked = await page.$$eval("#reasons tr[data-reason] td.asked", (els) => els.map((e) => e.textContent));
  const want = { "none": "nothing: given by choice", "a hearing": "legislators, at a hearing", "a law's report": "a report the law asks for every three months, which asks for no reason", "an executive order": "the Governor's executive order of 18 September" };
  ok(asked.length === K.reasons && asked.every((t, i) => t === want[CASES.reasons[i].asked]), `${width}px reasons: what asked for each`);
  ok(asked.filter((t) => t === want.none).length === K.reasons_by_choice, `${width}px reasons by choice`);
  const rw = await page.$eval("#reasons", (e) => [e.scrollWidth, e.clientWidth]);
  ok(width > 640 || rw[0] <= rw[1] + 1, `${width}px reasons fit the screen (${rw})`);
  for (const [id, t] of await page.$$eval("#reasons q[data-q]", (els) => els.map((e) => [e.getAttribute("data-q"), e.textContent]))) ok(sameQuote(id, t), `${width}px reasons ref ${id}`);

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
  ok(say2.includes(`The ${C.public_bodies} public bodies`) && say2.includes(`the ${CHECK.counts.law_public} a law names`), `${width}px public sentence`);
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
