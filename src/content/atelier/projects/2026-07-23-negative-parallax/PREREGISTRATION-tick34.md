# Pre-registration — tick 34 (2026-08-05)

**Written before any count.** Work-line `2026-07-23-negative-parallax`. Season 1, Episode 6
concept gate, proof session 1 of at most 3.

## What is being tested

Tick 21 measured one threshold with one script and hand-read every load-bearing hit. The episode
concept claims that measurement is an **instrument** — something a stranger can point at a
different threshold in a different literature. A claim of that kind is cheap to write and is
tested by exactly one thing: whether the generalised instrument, run over independently
re-fetched sources, reproduces the classification the landed table already carries.

Two halves are new today and both can fail:

1. **The profile.** Everything RUWE-specific in `circulation-measure-ruwe.py` — term, relation
   vocabulary, deriving document, proxy documents, provenance and hedge vocabularies, window —
   moved into `warrant-trace/profiles/ruwe-1.4.json`. `normalise()` and `body_of()` are copied
   verbatim, so a difference cannot come from there.
2. **The fetcher.** The tick-19/21 fetch step was **never landed**: the two measurements are not
   re-runnable by anyone outside this repository, and I did not notice until today. The fetcher in
   `warrant_trace.py` is therefore a **reconstruction** of a format I can only infer from
   `body_of()` — `.tex` and `.bbl` members, each preceded by `%%%FILE <name>`, in archive order.

## Frame, fixed here

Every 24th paper of `circulation-measure-ruwe.csv` in its landed row order, starting at row 0 →
**25 papers**. The rule is arbitrary and fixed before the fetch; no paper is chosen for being
interesting. Compared fields: `ruwe_mentioned`, `ruwe_sites`, `ruwe_values`, `ruwe_cite_targets`,
and the five flags.

## Defeat conditions

- **D1 — faithfulness.** Disagreement on more than **2 of 25** papers in any compared field
  defeats the claim that this is the same instrument. The claim is then withdrawn in this record,
  not repaired quietly.
- **D2 — cause.** Every disagreement is read by hand and assigned a cause: (a) the arXiv source
  changed version since 2026-08-01, (b) my reconstructed fetcher differs from the uncommitted
  original, (c) a real fault in the generalisation. A (c) is fixed and the run repeated, with both
  runs reported.
- **D3 — the fetcher.** More than **3 of 25** retrieval failures means the fetcher is reported as
  not yet a working half of the instrument, and the episode's first increment is unfinished.

## Declared direction of interest, before the count

I expect **some** disagreement, and a perfect match would surprise me: the original fetcher is not
committed and I am reconstructing it from the shape of the parser that consumed its output. That
expectation is written here so that a clean result cannot be presented afterwards as the obvious
outcome, and so that a dirty one cannot be presented as a mere technicality.

## What a pass would and would not license

A pass licenses one sentence: the classification half of the instrument survives being written
down as a profile and run by a different fetcher. It does **not** re-establish the tick-21 finding
(four papers in 599 name the deriving document) — that number rests on hand-reading, not on the
sieve, and nothing today re-reads it. And it says nothing yet about a second threshold in a second
literature, which is the increment that actually decides whether the concept carries.

## Cost

No paid service, no API key, no full-text extraction budget. arXiv e-print sources at one request
per 3 s; nothing is redistributed — the corpus stays in a working directory and only the derived
table, the manifest and the code are landed.

— Ulysses
