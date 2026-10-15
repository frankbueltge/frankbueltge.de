// experiment.mjs — the measurement behind "Call Without Response".
//
// Open thread F-031 (Session 16): the tail-density -> collapse law of "Attractor"
// (works/2026-07-04-attractor) was measured only on SYNTHETIC uniform-vocabulary sources at
// low/mid tail density; all four REAL anchors sat on the high-tail plateau (0.86-0.90). So the
// interesting non-linear part of the curve was evidenced by synthetic text alone.
//
// This experiment brings the law real, verifiable text whose whole form is REPETITION:
//   - a litany (call-and-response; each invocation answered "pray for us")
//   - a psalm with a refrain repeated 26 times ("for his mercy endureth for ever")
//   - a biblical anaphora ("a time to ... and a time to ...")
//   - a villanelle (two whole lines repeated in a fixed pattern)
// These are the oldest human technologies of repetition. We feed them to the same closed,
// self-consuming loop and ask: does the machine-measured law hold on text humans MADE repetitive?
//
// Same pipeline as S16: order-6 char Markov, L=1600, 12 generations, averaged over 6 PRNG seeds,
// mode "replace" (the closed loop; the real text is discarded after generation 0).
//
// Run: node experiment.mjs   (writes data.js for the HTML, prints the report)

import fs from "fs";
import { makeSource, meanCollapse } from "./engine.mjs";

const K = 6, GEN = 12, L = 1600;
const SEEDS = [1, 2, 3, 4, 5, 6];
const norm = (s) => s.replace(/\s+/g, " ").trim();

// Fill to length L by looping the unit. makeSource fills L by repeating a vocabulary; a litany /
// psalm / villanelle is a text MADE to be repeated, so looping it to L is the faithful analog and
// keeps the sample size M constant across all sources (the control the whole study rests on).
function toL(text, L) {
  const u = norm(text) + " ";
  let out = "";
  while (out.length < L) out += u;
  return out.slice(0, L);
}

// ----------------------------- the four verified real texts -----------------------------
// Sources are recorded in journal/2026-07-05.md. Public-domain / single-cited liturgical text.

// A. Litany of the Blessed Virgin Mary (Litany of Loreto), English.
//    Verbatim extraction from arlingtondiocese.org (.../Litany of Loreto English.pdf).
//    Note: the invocation list has known variants across sources; the load-bearing feature for a
//    tail measurement — the "pray for us" response after every line — is variant-invariant.
const litany = `Lord, have mercy. Lord, have mercy. Christ, have mercy. Christ, have mercy. Lord, have mercy. Lord, have mercy. Christ hear us. Christ graciously hear us. God, the Father of heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us. Holy Mary, pray for us. Holy Mother of God, pray for us. Most honored of virgins, pray for us. Mother of Christ, pray for us. Mother of the Church, pray for us. Mother of mercy, pray for us. Mother of divine grace, pray for us. Mother of hope, pray for us. Mother most pure, pray for us. Mother of chaste love, pray for us. Mother and virgin, pray for us. Sinless Mother, pray for us. Dearest of mothers, pray for us. Model of motherhood, pray for us. Mother of good counsel, pray for us. Mother of our Creator, pray for us. Mother of our Savior, pray for us. Virgin most wise, pray for us. Virgin rightly praised, pray for us. Virgin rightly renowned, pray for us. Virgin most powerful, pray for us. Virgin gentle in mercy, pray for us. Faithful Virgin, pray for us. Mirror of justice, pray for us. Throne of wisdom, pray for us. Cause of our joy, pray for us. Shrine of the Spirit, pray for us. Glory of Israel, pray for us. Vessel of selfless devotion, pray for us. Mystical Rose, pray for us. Tower of David, pray for us. Tower of ivory, pray for us. House of gold, pray for us. Ark of the covenant, pray for us. Gate of heaven, pray for us. Morning Star, pray for us. Health of the sick, pray for us. Refuge of sinners, pray for us. Solace of migrants, pray for us. Comfort of the troubled, pray for us. Help of Christians, pray for us. Queen of angels, pray for us. Queen of patriarchs, pray for us. Queen of prophets, pray for us. Queen of apostles, pray for us. Queen of martyrs, pray for us. Queen of confessors, pray for us. Queen of virgins, pray for us. Queen of all saints, pray for us. Queen conceived without sin, pray for us. Queen assumed into heaven, pray for us. Queen of the Rosary, pray for us. Queen of families, pray for us. Queen of peace, pray for us. Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, have mercy on us.`;

// B. Psalm 136, King James Version (public domain).
//    biblegateway.com (Psalm 136 KJV) + kingjamesbibleonline.org — agree verbatim.
const psalm136 = `O give thanks unto the LORD; for he is good: for his mercy endureth for ever. O give thanks unto the God of gods: for his mercy endureth for ever. O give thanks to the Lord of lords: for his mercy endureth for ever. To him who alone doeth great wonders: for his mercy endureth for ever. To him that by wisdom made the heavens: for his mercy endureth for ever. To him that stretched out the earth above the waters: for his mercy endureth for ever. To him that made great lights: for his mercy endureth for ever: The sun to rule by day: for his mercy endureth for ever: The moon and stars to rule by night: for his mercy endureth for ever. To him that smote Egypt in their firstborn: for his mercy endureth for ever: And brought out Israel from among them: for his mercy endureth for ever: With a strong hand, and with a stretched out arm: for his mercy endureth for ever. To him which divided the Red sea into parts: for his mercy endureth for ever: And made Israel to pass through the midst of it: for his mercy endureth for ever: But overthrew Pharaoh and his host in the Red sea: for his mercy endureth for ever. To him which led his people through the wilderness: for his mercy endureth for ever. To him which smote great kings: for his mercy endureth for ever: And slew famous kings: for his mercy endureth for ever: Sihon king of the Amorites: for his mercy endureth for ever: And Og the king of Bashan: for his mercy endureth for ever: And gave their land for an heritage: for his mercy endureth for ever: Even an heritage unto Israel his servant: for his mercy endureth for ever. Who remembered us in our low estate: for his mercy endureth for ever: And hath redeemed us from our enemies: for his mercy endureth for ever. Who giveth food to all flesh: for his mercy endureth for ever. O give thanks unto the God of heaven: for his mercy endureth for ever.`;

// C. Ecclesiastes 3:1-8, King James Version (public domain).
//    biblegateway.com + kingjamesbibleonline.org — agree verbatim.
const eccles = `To every thing there is a season, and a time to every purpose under the heaven: A time to be born, and a time to die; a time to plant, and a time to pluck up that which is planted; A time to kill, and a time to heal; a time to break down, and a time to build up; A time to weep, and a time to laugh; a time to mourn, and a time to dance; A time to cast away stones, and a time to gather stones together; a time to embrace, and a time to refrain from embracing; A time to get, and a time to lose; a time to keep, and a time to cast away; A time to rend, and a time to sew; a time to keep silence, and a time to speak; A time to love, and a time to hate; a time of war, and a time of peace.`;

// D. "The House on the Hill," Edwin Arlington Robinson (public domain).
//    poetryfoundation.org/poems/44976 + poets.org/poem/house-hill — agree.
const house = `They are all gone away, The House is shut and still, There is nothing more to say. Through broken walls and gray The winds blow bleak and shrill: They are all gone away. Nor is there one to-day To speak them good or ill: There is nothing more to say. Why is it then we stray Around the sunken sill? They are all gone away, And our poor fancy-play For them is wasted skill: There is nothing more to say. There is ruin and decay In the House on the Hill: They are all gone away, There is nothing more to say.`;

const reals = [
  { id: "litany",   label: "Litany of Loreto",      form: "call-and-response",  text: litany },
  { id: "psalm136", label: "Psalm 136 (KJV)",       form: "refrain ×26",   text: psalm136 },
  { id: "eccles",   label: "Ecclesiastes 3:1–8 (KJV)", form: "anaphora",    text: eccles },
  { id: "house",    label: "The House on the Hill",  form: "villanelle",         text: house },
];

// ----------------------------- the synthetic law (S16 sweep, regenerated) -----------------------------
const VOCABS = [2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];
const synth = VOCABS.map((v) => {
  const text = makeSource(v, 20260704, L);
  const avg = meanCollapse(text.slice(0, L), { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
  const g0 = avg[0].kgrams, g12 = avg[GEN].kgrams;
  return { id: `v${v}`, vocab: v, tailDensity: +(g0 / L).toFixed(4),
           kg0: +g0.toFixed(1), kg12: +g12.toFixed(1), magnitude: +(1 - g12 / g0).toFixed(4) };
}).sort((a, b) => a.tailDensity - b.tailDensity);

// predict synthetic magnitude at a tail density by linear interpolation on the sweep
function predict(td) {
  const xs = synth.map(r => r.tailDensity), ys = synth.map(r => r.magnitude);
  if (td <= xs[0]) return ys[0];
  if (td >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 0; i < xs.length - 1; i++)
    if (td >= xs[i] && td <= xs[i + 1]) {
      const f = (td - xs[i]) / (xs[i + 1] - xs[i]); return ys[i] + f * (ys[i + 1] - ys[i]);
    }
}

// ----------------------------- measure each real text (looped, and natural) -----------------------------
const realRows = reals.map((r) => {
  const looped = toL(r.text, L);
  const avg = meanCollapse(looped, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
  const g0 = avg[0].kgrams, g12 = avg[GEN].kgrams;
  const td = +(g0 / L).toFixed(4), mag = +(1 - g12 / g0).toFixed(4);
  const pred = +predict(td).toFixed(4);

  const nat = norm(r.text);
  const navg = meanCollapse(nat, { k: K, generations: GEN, len: nat.length, mode: "replace" }, SEEDS);
  const ntd = +(navg[0].kgrams / nat.length).toFixed(4), nmag = +(1 - navg[GEN].kgrams / navg[0].kgrams).toFixed(4);

  return {
    id: r.id, label: r.label, form: r.form, natLen: nat.length,
    tailDensity: td, kg0: +g0.toFixed(1), kg12: +g12.toFixed(1), magnitude: mag,
    predicted: pred, residual: +(mag - pred).toFixed(4),
    curve: avg.map(a => +a.kgrams.toFixed(1)),
    natTailDensity: ntd, natMagnitude: nmag,
    text: nat,
  };
});

// ----------------------------- report -----------------------------
console.log(`\n=== CALL WITHOUT RESPONSE — real repetitive text in the closed loop (k=${K}, L=${L}, gen=${GEN}, seeds=${SEEDS.length}) ===\n`);
console.log("SYNTHETIC LAW (S16 sweep):  tailDens -> magnitude");
console.log("  " + synth.map(r => `${r.tailDensity}->${r.magnitude}`).join("  "));
console.log("\nREAL TEXTS (looped to L):");
console.log("  source                    form               tailDens   kg0    kg12   magnitude  predicted  residual");
for (const r of realRows)
  console.log("  " + r.label.padEnd(25), r.form.padEnd(18),
    String(r.tailDensity).padStart(8), String(r.kg0).padStart(6), String(r.kg12).padStart(6),
    String(r.magnitude).padStart(10), String(r.predicted).padStart(10), String(r.residual).padStart(9));
console.log("\nSENSITIVITY (natural length, no looping):");
console.log("  source                    L(nat)  tailDens   magnitude");
for (const r of realRows)
  console.log("  " + r.label.padEnd(25), String(r.natLen).padStart(6),
    String(r.natTailDensity).padStart(8), String(r.natMagnitude).padStart(10));

// ----------------------------- emit data.js -----------------------------
const data = { meta: { k: K, L, generations: GEN, seeds: SEEDS }, synth, real: realRows };
fs.writeFileSync(new URL("./data.js", import.meta.url), "window.CWR = " + JSON.stringify(data) + ";\n");
console.log(`\nwrote data.js (${synth.length} synthetic points, ${realRows.length} real texts)\n`);
