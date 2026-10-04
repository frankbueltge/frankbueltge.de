// test.mjs — locks the Session-16 findings so a later self (or the build gate) can re-verify them.
// Run: node test.mjs   (exit 0 = all findings still hold on this engine)
import { collapseSeries, makeSource, meanCollapse } from "./engine.mjs";

const K = 6, GEN = 12, L = 1600, SEEDS = [1, 2, 3, 4, 5, 6];
let fail = 0;
const ok = (name, cond, detail = "") => { console.log((cond ? "ok   " : "FAIL ") + name + (detail ? "  " + detail : "")); if (!cond) fail++; };
const mag = (src) => { const a = meanCollapse(src, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS); return 1 - a[GEN].kgrams / a[0].kgrams; };
const floor = (src) => meanCollapse(src, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS)[GEN].kgrams;

// 1. determinism
const r1 = collapseSeries("the quick brown fox jumps over the lazy dog. " .repeat(40), { seed: 42 });
const r2 = collapseSeries("the quick brown fox jumps over the lazy dog. " .repeat(40), { seed: 42 });
ok("determinism (same seed => same run)", JSON.stringify(r1) === JSON.stringify(r2));

// 2. threshold: a two-word source does NOT collapse (loop is net-generative); a rich one does
const mLow = mag(makeSource(2, 20260704, L)), mHigh = mag(makeSource(377, 20260704, L));
ok("sparse source has magnitude < 0 (enrichment)", mLow < 0, `mag=${mLow.toFixed(3)}`);
ok("rich source has magnitude > 0.7 (collapse)", mHigh > 0.7, `mag=${mHigh.toFixed(3)}`);

// 3. rising-then-saturating law: mid < high, and high tail sources saturate (within a narrow band)
const m8 = mag(makeSource(8, 20260704, L)), m55 = mag(makeSource(55, 20260704, L)), m233 = mag(makeSource(233, 20260704, L));
ok("magnitude rises with tail density (v8 < v55)", m8 < m55, `${m8.toFixed(3)} < ${m55.toFixed(3)}`);
ok("saturation: v55 and v233 within 0.1", Math.abs(m55 - m233) < 0.1, `|${m55.toFixed(3)}-${m233.toFixed(3)}|`);

// 4. shared floor: sources spanning a wide start-richness end in a narrow band, decoupled from start
const floors = [21, 55, 144, 377].map((v) => floor(makeSource(v, 20260704, L)));
ok("floor band is narrow (max/min < 2.2)", Math.max(...floors) / Math.min(...floors) < 2.2,
   `floors=[${floors.map((f) => f.toFixed(0)).join(", ")}]`);

// 5. re-opening the exit: accumulation collapses less than replacement
const src = makeSource(377, 20260704, L);
const rep = meanCollapse(src, { k: K, generations: GEN, len: L, mode: "replace" }, SEEDS);
const acc = meanCollapse(src, { k: K, generations: GEN, len: L, mode: "accumulate" }, SEEDS);
const magRep = 1 - rep[GEN].kgrams / rep[0].kgrams;
const magAcc = 1 - acc[GEN].kgrams / acc[0].kgrams;
ok("accumulate collapses less than replace", magAcc < magRep - 0.2, `acc=${magAcc.toFixed(3)} < rep=${magRep.toFixed(3)}`);

console.log(fail ? `\n${fail} FINDING(S) NO LONGER HOLD` : "\nall findings hold");
process.exit(fail ? 1 : 0);
