// experiment.mjs — the measurement behind the work "Attractor".
// Question (open thread F-030, Session 15): does a source text's own TAIL STRUCTURE
// govern how far/fast it collapses under recursive self-training? And does keeping a
// small proportion pi of the real source in the loop arrest the collapse, as the 2024
// follow-up literature (Dohmatob et al.; Gerstgrasser et al.) predicts?
//
// Independent variable : source tail density = distinct-6-grams(gen0) / L
// Dependent variables  : collapse magnitude = 1 - distinct(gen12)/distinct(gen0)
//                        floor = distinct-6-grams(gen12)  (the attractor)
// Controls             : L fixed for every source; averaged over 6 PRNG seeds.
//
// Run: node experiment.mjs   (writes data.js for the HTML, prints the report)

import fs from "fs";
import { collapseSeries, makeSource, meanCollapse, distinctKgrams } from "./engine.mjs";

const K = 6, GEN = 12, L = 1600;
const SEEDS = [1, 2, 3, 4, 5, 6];
const norm = (s) => s.replace(/\s+/g, " ").trim();

// ---- real anchors: the project's own registers, sliced from committed files (verifiable) ----
const repo = "/home/user/irrtum-als-methode/";
function slice(path, from) {
  const t = norm(fs.readFileSync(repo + path, "utf8"));
  return t.slice(from, from + L).padEnd(L, " ").slice(0, L);
}
const anchors = [
  { id: "protocol", label: "protocol (normative)", kind: "real", text: slice("PROTOCOL.md", 400) },
  { id: "journal", label: "journal (discursive)", kind: "real", text: slice("journal/2026-07-03-sitzung-15.md", 1200) },
  { id: "register", label: "error register (tabular)", kind: "real", text: slice("works/fehlerkataster-013.md", 300) },
  { id: "readme", label: "readme (descriptive)", kind: "real", text: slice("README.md", 120) },
];

// ---- synthetic sweep: tail density set by vocabulary size (uniform sampling, clean knob) ----
const VOCABS = [2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];
const synth = VOCABS.map((v) => ({
  id: `v${v}`, label: `vocab ${v}`, kind: "synthetic", vocab: v,
  text: makeSource(v, 20260704, L),
}));

const sources = [...synth, ...anchors];

// ---- measure every source under pure replacement (the closed loop), averaged over seeds ----
const rows = sources.map((s) => {
  const avg = meanCollapse(s.text, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
  const g0 = avg[0].kgrams, g12 = avg[GEN].kgrams;
  return {
    id: s.id, label: s.label, kind: s.kind,
    tailDensity: +(g0 / L).toFixed(4),
    kg0: +g0.toFixed(1), kg12: +g12.toFixed(1),
    magnitude: +(1 - g12 / g0).toFixed(4),
    curve: avg.map((a) => +a.kgrams.toFixed(1)),
    text: s.text,
  };
});

// ---- replace vs. accumulate: does keeping the real data in the loop arrest collapse? ----
// (Gerstgrasser et al. 2024: replacing data collapses; accumulating it does not.)
// Two representative sources: the heaviest-tail synthetic and the discursive real text.
const mixTargets = [
  { id: "v377", src: synth.find((s) => s.id === "v377").text, label: "vocab 377 (synthetic, heavy tail)" },
  { id: "journal", src: anchors.find((a) => a.id === "journal").text, label: "journal (real, discursive)" },
];
const mix = mixTargets.map((t) => ({
  id: t.id, label: t.label,
  runs: ["replace", "accumulate"].map((mode) => {
    const avg = meanCollapse(t.src, { k: K, generations: GEN, len: L, mode }, SEEDS);
    return { mode, curve: avg.map((a) => +a.kgrams.toFixed(1)),
             magnitude: +(1 - avg[GEN].kgrams / avg[0].kgrams).toFixed(4) };
  }),
}));

// ---------- report ----------
console.log(`\n=== ATTRACTOR — collapse vs. source tail density (K=${K}, L=${L}, gen=${GEN}, seeds=${SEEDS.length}) ===\n`);
console.log("source                     kind        tailDens   kg(0)   kg(12)   magnitude");
for (const r of [...rows].sort((a, b) => a.tailDensity - b.tailDensity)) {
  console.log(
    r.label.padEnd(26), r.kind.padEnd(10),
    String(r.tailDensity).padStart(7), String(r.kg0).padStart(8),
    String(r.kg12).padStart(8), String(r.magnitude).padStart(10)
  );
}
const floors = rows.map((r) => r.kg12);
console.log(`\nfloor (distinct 6-grams at gen 12): min ${Math.min(...floors).toFixed(1)}  max ${Math.max(...floors).toFixed(1)}  mean ${(floors.reduce((a,b)=>a+b,0)/floors.length).toFixed(1)}`);

console.log(`\n=== REPLACE vs ACCUMULATE: does keeping the real data hold the loop open? ===`);
for (const m of mix) {
  console.log(`\n${m.label}:`);
  console.log("  mode         kg(0)   kg(12)   collapse-magnitude");
  for (const run of m.runs) {
    console.log("  " + run.mode.padEnd(12), String(run.curve[0]).padStart(6), String(run.curve[GEN]).padStart(8), String(run.magnitude).padStart(12));
  }
}

// ---------- emit data.js for the HTML (self-contained, exact source texts) ----------
const data = {
  meta: { k: K, L, generations: GEN, seeds: SEEDS },
  rows: rows.map(({ text, ...r }) => ({ ...r, text })), // keep text for the live in-browser run
  mix,
};
fs.writeFileSync(
  new URL("./data.js", import.meta.url),
  "window.ATTRACTOR = " + JSON.stringify(data) + ";\n"
);
console.log("\nwrote data.js (" + rows.length + " sources)\n");
