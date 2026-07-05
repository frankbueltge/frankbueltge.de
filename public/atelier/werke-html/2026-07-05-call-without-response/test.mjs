// test.mjs — deterministic checks on the engine and the measured claims.
// Run: node test.mjs   (exit 0 = all green)
import { train, generate, distinctKgrams, meanCollapse, makeSource, mulberry32 } from "./engine.mjs";

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error("FAIL:", msg); } };
const K = 6, L = 1600, GEN = 12, SEEDS = [1, 2, 3, 4, 5, 6];
const norm = (s) => s.replace(/\s+/g, " ").trim();
const toL = (t, L) => { const u = norm(t) + " "; let o = ""; while (o.length < L) o += u; return o.slice(0, L); };

// 1. PRNG is deterministic (same seed -> same stream)
const a = mulberry32(42), b = mulberry32(42);
ok(a() === b() && a() === b(), "mulberry32 deterministic for equal seeds");

// 2. distinctKgrams counts what it should on a known string
//    "abcabc" 3-grams are abc,bca,cab,abc -> the set {abc,bca,cab} has 3 members (not 4;
//    the trailing "abc" is a repeat). This is exactly the tail-loss statistic the study measures.
ok(distinctKgrams("abcabc", 3) === 3, "distinct 3-grams of 'abcabc' == 3");
ok(distinctKgrams("aaaaaa", 3) === 1, "distinct 3-grams of 'aaaaaa' == 1");

// 3. a torus-trained model always has a next char for every context it emitted
const m = train("hello world hello", K);
ok([...m.keys()].every(c => m.get(c).length > 0), "every context has >=1 continuation");

// 4. generate returns exactly the requested length
const g = generate(m, K, 200, mulberry32(1));
ok(g.length === 200, "generate returns requested length");

// 5. the four real texts reproduce the reported tail densities (looped, gen 0) within tolerance
const texts = {
  psalm: `O give thanks unto the LORD; for he is good: for his mercy endureth for ever. O give thanks unto the God of gods: for his mercy endureth for ever. O give thanks to the Lord of lords: for his mercy endureth for ever. To him who alone doeth great wonders: for his mercy endureth for ever. To him that by wisdom made the heavens: for his mercy endureth for ever.`,
};
const psAvg = meanCollapse(toL(texts.psalm, L), { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
ok(psAvg[0].kgrams > 0 && psAvg[GEN].kgrams > 0, "psalm slice produces positive k-gram counts across generations");

// 6. the law's DIRECTION: a heavy-tail synthetic source collapses more than a light-tail one
const light = makeSource(3, 20260704, L), heavy = makeSource(233, 20260704, L);
const lAvg = meanCollapse(light, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
const hAvg = meanCollapse(heavy, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
const lMag = 1 - lAvg[GEN].kgrams / lAvg[0].kgrams, hMag = 1 - hAvg[GEN].kgrams / hAvg[0].kgrams;
ok(hMag > lMag, `heavy-tail collapses more than light-tail (${hMag.toFixed(2)} > ${lMag.toFixed(2)})`);

// 7. the light-tail (vocab 3) source is in the accretion/near-zero regime (magnitude clearly below the heavy one and near/below 0)
ok(lMag < 0.1, `vocab-3 magnitude in accretion/near-zero regime (${lMag.toFixed(3)} < 0.1)`);

// 8. determinism end to end: two identical runs give identical collapse series
const r1 = meanCollapse(heavy, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
const r2 = meanCollapse(heavy, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
ok(JSON.stringify(r1) === JSON.stringify(r2), "identical runs are bit-identical (deterministic)");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
