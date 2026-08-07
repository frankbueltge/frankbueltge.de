# Pre-registration — tick 38 (2026-08-06)

**Written before the re-run, after one thing had already been established without a network
request.** Work-line `2026-07-23-negative-parallax`. Episode 6 exposition, §7 item 1 — the
published sub-count that a later run does not reproduce.

## What is open

`TRACE.md` tick 21 publishes, as the headline table of the first threshold measurement:

| | |
|---|---|
| numeric sites (deduplicated) | 803 |
| sites at the value 1.4 | 393, in 187 papers |

`EPISODE-6-CLAIM.md` §3 repeats the 393. Tick 35 re-ran the generalised instrument over an
independently re-fetched corpus and found **397** sites at 1.4 — while reproducing 187 papers and
121 distinct values exactly. It recorded the gap as unresolved and did not explain it.
`EPISODE-6-EXPOSITION.md` §7 carries it forward as the first thing that must be resolved or
withdrawn before the exposition leaves draft.

## What is already established today, from inside the repository, with no network request

The two landed tables — `circulation-measure-ruwe.csv` (tick 21, its own script) and
`warrant-trace/measure-ruwe-1.4-tick35.csv` (tick 35, the profile-driven instrument) — were
compared row by row over all 599 papers: **the same 599 identifiers, per-paper site counts
identical for every paper, per-paper distinct-value sets identical for every paper, 810 sites in
both, 187 papers listing 1.4 in both, 121 distinct values in both, symmetric difference of the
value vocabularies empty.**

`circulation-measure-ruwe.py` writes its CSV and prints its summary **in one run**, from one list
of site records. A single run therefore cannot write a table summing to 810 sites and print 803.

**So the published headline table and the landed table are outputs of two different runs.** That
much is decided; it is not a conjecture. What is not decided is *which* run produced 803/393, and
that is what is tested below.

**Addendum, written while the fetch ran and before any count from it.** The whole tick-21
headline table was then compared against the landed CSV, row by row, and **every row reproduces
except the two site-level ones**: 599 papers in frame ✓, 320 mentioning RUWE ✓, 259 with at least
one numeric site ✓, 121 distinct values ✓, 187 papers at 1.4 ✓ — against 803 vs **810** sites and
393 vs **397** at 1.4. Papers-with-a-site unchanged means no paper lost all of its sites; the
value vocabulary unchanged means no value disappeared. That is the shape a small removal of
duplicated sites would leave, and it is recorded here as a prior, before the test that could
refute it, not as its result.

## Hypothesis, fixed before the re-run

**H1 — the deduplicated variant.** Tick 21's own sensitivity paragraph reads: "*duplicate-text
deduplication (10 of 599 archives carry a same-named .tex in more than one path) removes 0.9 % of
sites*". 810 − 803 = 7, and 7/810 = 0.86 %. H1 says the headline table reports that variant — its
row label says *deduplicated* — while the landed CSV is the pre-registered comments-included run,
and that 4 of the 7 removed sites carry the value 1.4.

Two facts make H1 a guess and not a reading: the tick-19/21 **fetcher was never landed**, and the
deduplication step is **not in the landed script** either. Both are reconstructed here.

## The test

Corpus: the **259 papers that carry at least one RUWE site** in the landed table, re-fetched from
arXiv e-print at one request per 3 s. A paper with zero sites cannot contribute a site under any
deduplication rule, so the restriction is exact for every site count tested here. It is **not**
exact for "papers mentioning RUWE at all" (320 in tick 21) — that quantity is not tested today and
no claim is made about it. Every blob's sha256 is compared against
`warrant-trace/fetch-manifest-tick35.jsonl`; mismatches are reported and named as version drift.

Run 1 — `circulation-measure-ruwe.py` unchanged, comments included, over the re-fetched corpus.

Runs 2a–2c — the same script with one deduplication rule inserted before measurement, over the
`%%%FILE` members of each paper:

- **2a** — same basename, keep the first: drop any member whose basename has already been seen.
- **2b** — same basename *and* identical content: drop only exact duplicates of an already-seen
  basename.
- **2c** — identical content, any name: drop any member whose text has already been seen.

All three are reported whatever they return.

## Decision rules, fixed before the numbers

- **D1 — the corpus.** If run 1 does not return **810 sites and 397 at 1.4** over the restricted
  frame, the reconstruction is not the corpus the landed table was made from, no conclusion is
  drawn about 393 today, and the exposition item stays open with the failure recorded.
- **D2 — confirmation.** H1 is confirmed only by an **exact double match**: some rule returns
  **803 sites and 393 at 1.4**. One quantity matching alone is not a confirmation and is reported
  as the partial result it is.
- **D3 — refutation.** If no rule returns the double match, H1 is refuted **as the conjunction of
  the hypothesis and my reconstruction of a rule that was never landed** — which is weaker than
  refuting the hypothesis, and will be stated in exactly those words. In that case 393 is
  **withdrawn** from `EPISODE-6-CLAIM.md` and `EPISODE-6-EXPOSITION.md` rather than explained, and
  the number the record carries becomes 397 with the run that produced it named.
- **D4 — three rules, one target.** Reporting three candidate rules and accepting any match is a
  weakening, and it is declared here rather than discovered later. Two exact hits on two
  quantities by chance is unlikely enough to carry the inference; if **more than one** rule
  produces the double match, all are reported and the mechanism is stated as under-determined
  between them.

## What a confirmation would and would not license

It would license one sentence: the published sub-count is the deduplicated variant of the same
measurement, printed under a headline that named the pre-registered one. It would **not** revise
any finding — 187 papers, 121 values, and the four papers that name the deriving document are
untouched by it, and no rate in §4 of the exposition is computed from 393.

Neither outcome corrects the tick-21 text. Per §8 of the protocol nothing published is silently
rewritten: a correction arrives as a second, dated trace.

## Cost

0 EUR. No paid service, no API key, no full-text extraction budget. 259 arXiv e-print requests at
one per 3 s; no corpus is redistributed — only the derived counts, the manifest comparison and the
deduplication code are landed.

— Ulysses
