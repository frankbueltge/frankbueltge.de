# Verification — the dial

**Session 151, 2026-09-04.** What was attacked, what broke, what stands.

An adversary was convened against this artifact after it was first built and committed
(`1571e41`), given the data files, the instruments and the pre-registration, and told to break the
work rather than praise it. It attacked eight things. **Five defects were found; four changed the
page.** Every number it reported was recomputed independently before anything was altered, and
every one held.

Nothing was removed. The first version of the page is in the repository's history at `1571e41`,
unedited; the wrong sentences were corrected in place with the correction named beside them, which
is this practice's rule.

---

## Defects found

### 1. The R² behind P1 is the lenient convention — **serious, page changed**

**Attack.** Recompute the slopes and R² from the sweep files; try to game the through-origin
formula with synthetic increasing sequences; compare it against the conventional mean-centred R²
with an intercept.

**Result.** The formula is not vacuous — a flat-then-jump sequence scores 0.43, √k scores 0.94,
log k scores 0.87 — so "any increasing sequence passes" is false. But `ss_tot = Σy²` rather than
Σ(y−ȳ)² makes it systematically lenient: the k = 66 point alone supplies about 43 % of the
denominator on the arXiv arm, so a large *relative* distortion at small k barely moves it.

**Recomputed here, independently:**

| arm, family | through-origin slope | through-origin R² | centred slope | intercept | centred R² |
|---|---|---|---|---|---|
| arXiv lean | 0.04691 | 0.99978 | 0.04763 | −0.0312 | 0.99966 |
| arXiv dense | 0.04668 | 0.99980 | 0.04662 | +0.0026 | 0.99937 |
| Crossref lean | 0.04264 | 0.99298 | 0.04026 | +0.1032 | **0.98076** |
| Crossref dense | 0.04434 | 0.99506 | 0.04327 | +0.0467 | **0.98487** |

**Consequence.** The pre-registration named a through-origin model, so the registered quantity is
the first R² and the registered verdict on Crossref stands as written — slope outside the band, R²
inside it. But under the conventional measure Crossref fails the 0.99 bar, and the adversary is
right that this is worth knowing: it partly hides a real local non-linearity, the flat step from
`lean@40` (1.8975) to `lean@51` (2.0025) caused by the eleven questions added there including the
nine dead ones. **Both R² are now computed by `dial_checks.py` and both are on the page.**

### 2. "Benjamini–Hochberg is self-correcting for exact duplicates" was overstated — **page changed**

**Attack.** Rerun the deduplication with a different representative for each duplicated pair: the
copy with the smallest p, and the copy with the largest p, instead of the first in canonical order.

**Result and recomputation.**

| representative rule | arXiv survivors / distinct | Crossref survivors / distinct |
|---|---|---|
| first in canonical order (as run) | 11 / 11 | 21 / 21 |
| smallest p | 11 / 11 | 21 / 21 |
| **largest p** | **10 / 10** | **20 / 20** |

**Consequence.** P4 is still refuted — deduplicating never *recovered* a survivor under any rule —
and the published comparison is correct as stated. But the cancellation is **a property that held
in this data under the rule used, not a guarantee.** The page now says so, and `dial_checks.py`
computes the sensitivity.

### 3. The "ninth dead question" sentence was factually wrong — **page changed**

**Attack.** Check every grouping's balance in both corpora, and every question's null rate for an
exact zero.

**Result.** The load-bearing claim holds exactly: `has_fulltext_link` is true for **2,400 of 2,400**
Crossref records, and the nine questions with a null rate of exactly 0.000 are exactly its nine.
arXiv is genuinely free of the defect — **zero** of its 66 questions have a zero rate, and every
arXiv grouping has both levels present.

**But the page's next sentence was wrong.** It said a tenth question "dies for the same reason" on
`open_licence` (99.7 %). `open_licence` has **7** false records, not 0; all eight of its questions
are killed at review by pre-condition c1, but their null rates are 0.0275, 0.03, 0.0375, 0.0425,
0.0425, 0.0475, 0.05, 0.055 — none zero. Conflating "killed at review for a tiny minority group"
with "structurally incapable of firing" is exactly the distinction that section of the page claims
to be drawing carefully. **Corrected.**

### 4. The post-hoc restriction does not survive its own control — **serious, page changed**

**Attack.** Test whether the "difference vanishes" result is a transfer finding or a mechanical
consequence of trimming the low tail of each corpus's own null-rate distribution: drop the N
lowest-rate questions with no reference to pre-conditions at all, where N is that corpus's actual
review-kill count.

**Result, recomputed here:**

| arm | whole space | claimable (post-hoc) | killed | **naive drop-lowest-N control** | N |
|---|---|---|---|---|---|
| arXiv | 4.72 % | 4.87 % | 4.18 % | **5.10 %** | 15 |
| Crossref | 4.08 % | 4.94 % | 2.68 % | **5.26 %** | 25 |

**Consequence.** The restriction is not circular in the p-hacking sense — c1–c4 are structural
properties of the corpus, and group sizes are invariant across permutations. But a rationale-free
trim of the same size does the same thing and overshoots it. **The convergence is close to
mechanically guaranteed by the trimming, so it is not evidence that the slope transfers, and P5
stays refuted with nothing taken off it.** The page keeps the analysis as a *failed repair* rather
than deleting it, and says plainly that it failed.

### 5. The Crossref corpus is not the corpus the pre-registration describes — **serious, new page section**

**Attack.** Inspect the fetcher's sort order, pagination, deduplication and missing-value handling;
then check the realized `published_doy` distribution per member in the committed feature table.

**Result.** `sort=deposited&order=desc` with a 300 cap returns each member's most recently
*deposited* slice, not a spread across a fourteen-week `from-pub-date` window.

| publisher | records | with a resolvable issue date | day-of-year range |
|---|---|---|---|
| Elsevier BV | 300 | **0** | — |
| Springer Science and Business Media LLC | 300 | 272 | 152–247 |
| Wiley | 300 | 206 | 152–246 |
| **MDPI AG** | 300 | 300 | **241–246 (six days)** |
| Informa UK Limited | 300 | 294 | 153–246 |
| Frontiers Media SA | 300 | 300 | 166–247 |
| Oxford University Press (OUP) | 300 | 266 | 155–247 |
| SAGE Publications | 300 | 283 | 152–246 |

**1,485 of the 1,921 dated records fall on day 240 or later.** And `_doy` swallows every exception,
so Elsevier's total, publisher-shaped missingness produced **nothing in the break log** — the log
says zero breaks and means nothing about this.

**Consequence.** Nothing in P1–P5 conditions on the corpus being a fair sample of the window: the
null world permutes within the fixed table, and every result is a statement about that table. But
the corpus was described as something it is not, one of the six outcome variables is missing for an
eighth of it in a publisher-shaped pattern, and a silent `except` hid that. **New section 7 on the
page states all three. The fetcher is not repaired** — repairing it would break the match between
the committed corpus and the code that produced it — but it now carries a dated `KNOWN DEFECT`
block naming both faults and the fix.

---

## Attacks that failed — recorded as clean bills

**6. The paired bootstrap and the exact McNemar.** Both reimplemented from scratch; the two-sided
exact binomial `2·P(X ≤ min(a,b))` was checked against a brute-force enumeration of "no more
extreme than observed" for every (n, a) up to 30 discordant pairs: **0 mismatches**, including the
boundary case, no double count. The bootstrap reproduced `checks.json` exactly (arXiv 1.06892,
CI [0.8885, 1.2726]; Crossref 0.97529, CI [0.7706, 1.2269]).

**7. The pairing claim — checked rather than asserted.** `lean@66` and `dense@66` are the same
question set by construction, so their per-replicate count vectors must be identical if the
permutation stream really is shared. **They are bit-for-bit identical on both arms.** This is now
recomputed by `dial_checks.py` as `pairing_verified` on every run.

**8. K2's rounded interval.** `dial.py` hardcodes [0.0466, 0.0512] where session 150's
`results.json` holds [0.04657486, 0.05122713]. The hardcoded pair is exactly what session 150
*published* in prose, K2 is a check against the published interval, and today's arXiv rate
(0.047159) is inside both with margin. **No defect, no consequence.**

**9. Numeric fidelity of the page.** Eighteen distinct numeric claims cross-checked against the
data files: record counts, fetch timestamps, both slopes and R², both variance ratios and their
intervals, both McNemar p-values, all P4 counts, both P5 rates and intervals, review kills, break
counts, K2, and the two grouping percentages. **Seventeen matched exactly to the displayed
precision.** The eighteenth was the `open_licence` sentence, reported above.

**10. The rest of the fetcher.** The JATS tag-stripping produces a smooth abstract word-count
distribution (7–723 words, no runaway outliers from leftover markup); `abstract_words: None` rather
than `0` for a missing abstract matches the arXiv fetcher's own convention; DOI-keyed deduplication
via `setdefault` is standard. No defect.

---

## What still stands after all of it

- **P1's line.** Linear across a sixteen-fold range of k on both corpora, under both R²
  conventions on arXiv and under the registered one on Crossref.
- **P2, P3, P4 refuted**, and therefore the session's own central claim dead by its own falsifier.
  The adversary attacked the statistics behind all three and found them correct.
- **P5 refuted**, and now refuted *more* firmly than when the page was first built, because the
  post-hoc repair offered for it has been shown not to work.
- **The count inflation**: 66 questions that are 51, 17 findings that are 14, 13 survivors that are
  11; 28 that are 21, twice. Untouched by any of the above.
- **`has_fulltext_link` at 2,400 of 2,400**, and the nine dead questions. Confirmed exactly.
