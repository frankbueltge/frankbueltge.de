# Pre-registration — tick 50 (2026-08-09)

**Work-line:** `2026-07-23-negative-parallax`. **Operation:** repair the instrument to 0.5
against the seven faults pinned at tick 47, and **re-measure all four profiles over all
three frames** with the repaired instrument — one operation, because the repair alone would
be an improvement that earned no finding, and only the re-measure lifts the withdrawal that
D2 imposed on the cross-literature comparison.

Written before any repaired measurement exists. What was already known when it was written
is declared first, because a pre-registration applied selectively is worth nothing.

## 0. What I already knew when I wrote this (declared, not hidden)

1. **The seven faults and their verbatim fragments.** They are landed in
   `warrant-trace/faults-tick47.py`, which reproduces all eight cases against 0.4. The
   repair is *designed against those eight strings*. I therefore claim **no forecast** over
   whether 0.5 turns them into sites: that is construction, not discovery, and the file
   that asserts it (`selftest-0.5.py`) is a regression test, not evidence.
2. **The 0.4-era totals of every frame**, recomputed today from the landed CSVs before this
   file was written:

   | profile | frame | measured | mention | with ≥1 site | sites | invoke, no site | rate |
   |---|---|---|---|---|---|---|---|
   | `ruwe-1.4` (tick 35) | 599 | 590 | 320 | 259 | 810 | 61 | 19.1 % |
   | `uwe-1.25` (tick 35) | 599 | 590 | 320 | 259 | 849 | 61 | 19.1 % |
   | `rhat-1.1` (tick 36) | 230 | 222 | 59 | 31 | 86 | 28 | 47.5 % |
   | `iou-0.5` (tick 46) | 256 | 240 | 205 | 87 | 216 | 118 | 57.6 % |

3. **Tick 47's sample-corrected rates**, from `corrected-tick47.json`: Gaia 8.0 %
   [3.7, 13.0], CV 14.4 % [5.1, 30.6], MCMC 31.7 % [18.6, 40.9] — a **reversal** of the raw
   ranking, computed by correcting each raw rate with the class-A share of a 12-paper
   hand-read sample.
4. **The corpus is not committed** (the instrument redistributes no source text), so the
   three frames are re-fetched today from arXiv — 1 085 e-prints in **one** sequential
   process, never two, since two fetchers against one manifest duplicate the work and double
   the declared rate (the defect of 2026-08-09, README "How it errs"). Every re-fetch is
   compared byte-for-byte against the sha256 in the original manifest.

The forecast in §4 is made **only** over quantities no repaired run has produced.

## 1. The claim under test

Tick 47 hand-read 36 papers the sieve had filed as *invokes the statistic, states no
threshold*, and found that **8 of them state one**. Six of the seven faults understate
sites; one overstates mentions. The instrument therefore errs **in the direction that
flatters this line's claim** — a warrant looks less travelled than it is — and it has done
so under every rate this line has published, the shipped headline included. The claim under
test is the one that sentence leaves open:

> **The understatement is real but small enough that the readings survive it.** The repair
> moves the counts in the predicted direction, does not reverse any published finding, and
> the cross-literature comparison withdrawn at tick 47 can be reinstated on a census rather
> than on a 12-paper correction.

Its negation is equally publishable and would be the more consequential result.

## 2. The repair (declared in full, before it is run on any corpus)

Seven faults, seven changes, each named by where it lives:

| fault | where | change |
|---|---|---|
| F1 | engine (site gap) | the gap class `[^.;:\n]` becomes `(?:[^.;:\n]\|\.(?=\d))` — a period is allowed **only** when a digit follows it, so `34.676,` no longer ends the window and a sentence period still does. The gap bound rises from 50 to the value §3 fixes. |
| F2 | profiles `ruwe-1.4`, `uwe-1.25` | the term's right boundary `\b` becomes `(?![A-Za-z])`, so a subscripted `ruwe_2` is a term match. |
| F3 | engine (`normalise`) | `\textless` → ` < `, `\textgreater` → ` > `, beside the existing `\leq`/`\geq` rules. |
| F4 | profile `rhat-1.1` | the `hat R` alternative gains a left boundary `(?<![A-Za-z])`, so the letters inside `that R` stop counting as a mention. **This is the one repair that lowers a count.** |
| F5 | profile `iou-0.5` | a new site pattern for a value standing **before** the term in prose: `(value) {TERM} (threshold\|criterion\|cut-off)`. Narrow by construction — the noun after the term is required. |
| F6 | profile `iou-0.5` | a bare `of` joins the relation list, which the other three profiles have carried since tick 21. The CV profile was the inconsistent one. |
| F7 | profiles `iou-0.5`, `rhat-1.1` | `from` / `ranging from` join the relation list, so a sweep (`IoU thresholds from 0.50 to 0.95`) yields a site. **Stated limitation:** only the sweep's **lower bound** becomes a site; the upper bound and the interior points do not. A sweep states several values and 0.5 records one of them. |

Everything else is untouched. `verify` and the 0.2/0.3/0.4 side-counts stay, so every earlier
report can still be compared field by field.

## 3. The gap bound, and why it is chosen before the count

F1's two pinned fragments need a gap wider than 50 characters (the second — *"the
renormalized unit weighted errors (ruwe) for these stars amounted to 3.62 and 2.51, values
that are much greater than the cut-off of 1.4"* — needs roughly twice that). Widening a gap
buys sites and sells precision, so the bound is fixed **now, by the fragments, not by the
result**: the smallest multiple of ten that admits both F1 fragments, and no larger. It is
recorded in the trace as a number chosen this way, and if it later turns out to be the
thing that moved a rate, that is a finding about the repair and not a detail.

## 4. Forecast (over quantities no repaired run has produced)

- **P1 — direction.** Site counts rise in **every** frame: `ruwe-1.4`, `uwe-1.25` and
  `iou-0.5` gain sites; `rhat-1.1`'s *mentions* fall (F4) while its sites do not fall.
- **P2 — the rates fall everywhere.** The raw closed-question rate (invokes ∧ no site) drops
  in all three literatures.
- **P3 — the census agrees with the sample.** The repaired **census** rates land inside
  tick 47's sample-corrected intervals — Gaia in [3.7, 13.0], CV in [5.1, 30.6], MCMC in
  [18.6, 40.9]. This is the test of whether a 12-paper correction was worth anything.
- **P4 — the reversal survives.** The repaired ranking low-to-high is **Gaia, CV, MCMC** —
  the corrected ranking of tick 47, not the raw one. Bayesian computation remains the
  literature that most often closes the question.
- **P5 — the shipped headline survives.** Re-measured with 0.5, the count of RUWE sites at
  **1.4** carrying the deriving technical note **at the site** changes by at most ±2 from
  the shipped 4. The shipped work is not rewritten either way (tick 46 §9); what changes is
  what the record says about it.
- **P6 — the repair is not a flood.** Of a hand-read sample of **20 newly appearing sites**
  drawn by seed across the three frames, **at least 14 (70 %)** are genuine threshold sites.

## 5. Defeat conditions

- **D1.** Any frame where sites *fall* → P1 defeated; the repair does something other than
  what it was designed to do and the change that did it is named before anything is
  concluded.
- **D2.** Any census rate outside its tick-47 interval → P3 defeated. Reported as what it
  is: the 12-paper correction did not predict the census, and every rate this line has
  corrected by a small sample carries that caveat from then on.
- **D3.** Ranking differs from Gaia < CV < MCMC → P4 defeated; the withdrawal of the
  cross-literature comparison **stays in force** and is not lifted by a re-measure that
  disagrees with the reading it was meant to rescue.
- **D4.** The RUWE-1.4 site count carrying the note moves by more than ±2 → P5 defeated. If
  it moves **up**, the shipped headline understated how often the warrant travels and this
  line's central claim is weaker than published; that is written in the journal in those
  words, on the same day, not deferred to a review.
- **D5.** Fewer than 14 of 20 new sites survive hand-reading → P6 defeated; the repair
  trades one bias for another and 0.5's rates are reported as an upper bound, not as a
  correction.
- **D6.** Any re-fetched e-print whose sha256 differs from the original manifest → that
  paper's frame is not byte-stable, and the mismatch is reported as a finding about this
  line's re-derivability rather than smoothed. A frame with mismatches is re-measured on the
  text of today and both counts are given.

## 6. What this tick may not conclude

- Not that the instrument is now correct. Seven pinned faults are seven; the hand-reading of
  tick 47 sampled 36 papers of 207 candidates, and the faults it did not meet are not
  counted here. 0.5 errs; what changes is that two of its ways are measured instead of one.
- Not anything about *why* a literature closes the question. Naming habits, venue templates
  and page limits stay unmeasured.
- Nothing reaches the shipped work. The letter, the exposition and the packet in PR #12 stay
  untouched (tick 46 §9). Whatever this tick finds is a decision input for Frank and travels
  only if he sends it.
- Not a fifth case. No new literature, no new threshold, no new frame.

— Ulysses, 2026-08-09
