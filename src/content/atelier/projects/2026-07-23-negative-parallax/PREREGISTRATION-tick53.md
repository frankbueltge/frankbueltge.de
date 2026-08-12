# Pre-registration — tick 53, 2026-08-10

**The whole candidate class, read. Not a bigger sample.**

Written before any window of this tick was read. The frame it fixes was generated first
(`warrant-trace/denominator-census-tick53.py frame --seed 53`,
`frame-tick53.csv` sha256 `e2112c9771d7d2b6bfb0e87bdc2a7bab23b819b0cb280a3fa99c76a020c8a868`);
the reading order inside each literature was randomised by that seed before the ids were
looked at, and no label existed when this file was written.

## §0 What is already known, and is therefore not forecast

From the landed record, computed at tick 50 (instrument 0.5) and corrected at tick 51:

| literature | invoking | candidates | rate now |
|---|---|---|---|
| gaia (`ruwe < 1.4`) | 320 | **53** | 16.6 % |
| mcmc (`R̂ < 1.1`) | 50 | **20** | 40.0 % |
| cv (`IoU ≥ 0.5`) | 205 | 87 | 42.4 % |

*Candidate* means exactly what the fourth reading's numerator means: the 0.5 instrument
measured the paper, found the term, and found **no site at the focus value** — *invokes the
statistic and states no threshold*.

Tick 52 hand-read twelve papers per literature drawn from the mention set. Six of those
thirty-six fell in the candidate class of gaia or mcmc, and **four of the six were not
invokers at all** — 66.7 %, Wilson 95 % [30.0, 90.3]. That interval is sixty points wide.
The tick recorded the width as a defect of its own design, available by arithmetic before
any reading, refused to extend the sample after seeing which way it pointed, and named the
size the question needs.

## §1 What this tick does instead

It does not draw a larger sample. It reads the **entire candidate class** of gaia (53) and
mcmc (20) — 73 papers, every member, no draw. A census has no sampling error, so the
correction it produces carries none. What it still carries is my judgement, one paper at a
time, and that is stated as the load-bearing step rather than hidden by the word *census*.

## §2 The label set, fixed before reading

Per paper, one label. **Invoker** means: the paper uses the statistic as its own — as a
selection criterion, a filter, a reported quality diagnostic, a convergence check, a
scoring rule — whether or not it states a number.

- `I-USE` — invoker: applies or reports the statistic for its own data.
- `I-DISC` — invoker: discusses the statistic as such (its behaviour, its limits, its
  definition) without applying it to data of its own.
- `X-QUERY` — non-invoker: the term appears only as a **column name** inside a query, a
  table description or a column glossary; the paper fetches or lists the column and states
  no rule of its own.
- `X-NOTATION` — non-invoker: the letters are a **different quantity** wearing the same
  notation (a hatted *R* that is not Gelman–Rubin; a ratio named *overlap* that is not the
  correctness criterion).
- `X-CITE` — non-invoker: the term occurs only in a citation, a title in the bibliography,
  a related-work sentence about somebody else's pipeline, with no use in this paper.
- `X-OTHER` — non-invoker, none of the above; the reason is written out in the row.
- `B-SITE` — the paper **does** state a threshold at the focus value and the sieve missed
  it. This is class B of tick 47, counted as an instrument defect, not as a denominator
  fact, and it is an invoker.

Every row carries a verbatim fragment as evidence. A paper whose windows do not settle the
question is labelled `I-USE`/`X-*` only if the fragment shown supports it; otherwise it is
recorded `unsettled` and counted in neither direction, with its number reported.

## §3 The assumption the arithmetic rests on, stated rather than assumed

    corrected_rate = (candidates − non_invoker_candidates) / (invoking − non_invokers)

The census fixes the numerator's correction exactly. For the denominator it assumes that
in gaia and mcmc **non-invokers sit inside the candidate class** — that a paper with a site
at `1.4` or `1.1` is a paper using the thing. Tick 51 found the known exception (a site in
a paper that never invokes) in **computer vision**, where the term collides with an English
word; neither `ruwe` nor `\hat R` has an English sense. The assumption is therefore
plausible here and **unmeasured**, and the corrected rates are reported with it named.

## §4 Forecasts

Point estimate first, band second; a defect number fires when the band is missed.

- **P1 — gaia.** The non-invoker share of the 53 candidates is **40 %**, band [20 %, 60 %].
  **D1** fires outside the band.
- **P2 — mcmc.** The non-invoker share of the 20 candidates is **40 %**, band [20 %, 60 %].
  **D2** fires outside the band.
- **P3 — gaia's mode.** The most frequent non-invoker label in gaia is `X-QUERY`, and it is
  at least half of gaia's non-invokers. **D3** fires below half.
- **P4 — mcmc's mode.** The most frequent non-invoker label in mcmc is `X-NOTATION`, and it
  is at least half of mcmc's non-invokers. **D4** fires below half.
- **P5 — against tick 52.** The pooled census share (gaia + mcmc together) falls inside
  tick 52's Wilson interval **[30.0, 90.3]**. **D5** fires outside it: the six-paper sample
  would then have misled beyond its own stated uncertainty, which is worse than being
  imprecise.
- **P6 — the rate that survives.** Gaia's corrected rate is **8 %**, band (0 %, 12 %) — the
  class is *not* exhausted. Tick 52 extrapolated a negative value for gaia, i.e. more
  non-invokers than the class holds; P6 says that was an artefact of a three-paper share
  and not a fact about the literature. **D6** fires at ≥ 12 %, or if the census exhausts
  the class.

## §5 Scope, and the stopping rule declared in advance

Computer vision's 87 candidates are **out of scope for this tick** and are named as the
open remainder; they are not read here and nothing about them is extrapolated from what is.

Within scope, the intention is a complete census of all 73. The reading order was
randomised by seed 53 before any id was inspected, so that if the reading cannot be
finished — context exhausted, sources unreadable — **what was read is a random sample of
the class rather than its alphabetical head**. If a literature is incomplete, its numbers
are reported as a sample with a Wilson interval and `census_complete: false`, no corrected
rate is computed for it, and the unread ids are listed. The stopping rule is capacity, not
the labels; it is written here so that it cannot be chosen later.

## §6 Controls

- **D0 — drift.** Every e-print of the frame that was fetched in an earlier tick is
  re-fetched today and compared by sha256 against the manifest that first read it. D0 fires
  on any difference.
- **D7 — double launch.** The manifest must hold exactly one record per id. This defect
  occurred on 2026-08-05 and again at tick 48; it is checked by arithmetic, not by trust.
- **D8 — class B.** Papers the census finds to state a threshold after all (the sieve
  missed the site) are at most **6 of 73**. D8 fires above 6. This measures the repaired
  0.5 instrument against a class it was repaired for, on papers it has never been tested on.

## §7 What each outcome obliges

- P1/P2 held → the correction of the fourth reading's rates is done for two literatures,
  by census, and the numbers are quotable without a sampling caveat.
- D5 fired → tick 52's reported interval is not merely wide but wrong in coverage; the
  entry stays in the record and the failure is written beside it.
- D6 fired at the exhaustion end → the gaia rate of the fourth reading does not survive its
  own denominator, and the shipped work's frame must be re-examined before any further
  claim rests on it.
- D8 fired → the 0.5 repair is not finished, and the next operation is the instrument, not
  the reading.
- In every case the shipped work (`EPISODE-6-*`, the packet, the letter) is **untouched**
  by this tick; anything that bears on it is reported to Frank in `REQUESTS.md` as a
  decision input, per the standing practice of ticks 48–52.

— Ulysses
