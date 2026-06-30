# Tools on Trial — design (Project B)

Design spec · 2026-07-01 · Status: researched, launch-ready (awaiting Frank's go on direction)

> Synthesised from two agent feasibility studies (detector-audit; statistical-forensics-on-trial).
> Decision for Frank in §6: build directly, or leave as a seed for the autonomous engine (already
> seeded in `field-research/REQUESTS.md`), or both.

## Concept

A daily, reproducible instrument that **audits whether the detection/forensic tools themselves
actually work** — measuring how often they are *wrong* on data of known provenance. The reflexive
move the field rewards: **test the tool, not the world.** Directly extends *The Round Number*
(Benford flags clean data) and *Patterns* (the instrument proves its own limits) into a body of
work; sits in the OSINT/counter-forensics cluster **without** the Gaza-stakes barrier.

Fits the lab's pattern exactly: a Python pipeline commits versioned JSON snapshots into the repo
(git is the archive), a nightly GitHub Action runs it, an Astro work renders the accumulating
record. Accumulation *is* the work.

## Two tracks

### Track A — Statistical fraud-tests on trial (recommended v1, **zero secrets**)

Put audit-grade digit tests on trial each night.

- **Tests:** Benford first-digit (χ² + MAD), second-digit (χ²), last-digit uniformity (χ²).
  ~80 lines of `scipy.stats`; `benford_py` optional.
- **Defendants (known-clean, keyless APIs):** World Bank Indicators API (GDP, population, CO₂,
  life expectancy — cross-sectional, 7 orders of magnitude, textbook-legitimate) and Eurostat
  (`pip install eurostat`: gov debt, HICP). Rotating 7-day schedule.
- **Controls (generated inline):** *synthetic-Benford* (should always pass) and *synthetic-human*
  (first digits biased 5–9, last digits avoid 0/5 — should always fail) — proves the tests have
  real discriminating power, so the instrument is balanced, not just nihilist.
- **The exhibit:** Greece 1999–2009 fiscal data (documented manipulation; Rauch et al. 2011 found
  the largest Benford deviation in the eurozone). Use a **static snapshot / the published Rauch
  distribution** (the live Eurostat API now serves *restated* values). Framed as historical, not a
  live accusation.
- **The thesis:** Deckert, Myagkov & Ordeshook (2011, *Political Analysis*) — Benford's first-digit
  on elections performs "essentially equivalent to a toss of a coin." The accumulator turns this
  into a dated conviction record: *"the last-digit test convicted X% of provably-clean official
  datasets as suspicious"*; plus the **χ²-vs-MAD conflict rate** (the two standard statistics for
  the same test frequently disagree).
- **Cost/secrets:** none. Runtime < 60 s. Data sources keyless.

### Track B — AI-detector audit (Phase 2, **needs API keys**)

Audit AI-content detectors against known-provenance corpora.

- **Image:** `umm-maybe/AI-image-detector` (free, open weights, HF API) + **Hive** (free dev tier,
  100 req/day) against a committed immutable ArtiFact subset (~250 img). Text: **GPTZero** (free
  tier, 10k words/mo) + the RoBERTa baseline (free, expected to fail — the dead canary) against a
  day-seeded **RAID** sample (MIT-licensed).
- **Daily output:** per-detector confusion matrix + TPR/FPR + the single **"worst failure of the
  day"** (e.g. *"this detector is 97% certain this real photograph is AI"*) as the exhibit.
- **Secrets (Frank):** `HIVE_API_KEY`, `GPTZERO_API_KEY` as repo secrets. Watch rate limits
  (alternate detectors across nights). Corpus tops out at 2022–23 generators — state that gap
  explicitly.

## Architecture

| Layer | Choice |
|---|---|
| Pipeline | `pipelines/tools-on-trial/` (Python 3.12), one adapter per source, assembler, git committer — mirrors `pipelines/protokoll/` |
| Schedule | nightly GitHub Action (Track A keyless; Track B gated on secrets present) |
| Data out | `src/data/<slug>/register.json` (accumulator) + per-day `YYYY-MM-DD.json` |
| Site | one Astro work rendering the conviction record (sparkline of false-positive rate over time + the day's worst call) |
| Deps | `requests`, `numpy`, `scipy`, `eurostat` |

Accumulator schema (Track A, abbreviated — full shape in the feasibility study): per-trial
`{date, series:{source,indicator,n,span}, tests:{benford_first_chi2,benford_first_mad,…:{stat,p,flagged}}, synthetic_benford:{…}, synthetic_human:{…}, verdict:{clean_flagged, tests_disagreeing}}` plus
`cumulative:{trial_count, false_positive_rates, detection_rates_on_synthetic_fraud, chi2_mad_conflict_rate}`.

## Messlatte fit

- **Instrument-as-subject** ✓ (the tool is the defendant, not the world).
- **Form enacts the argument** ✓ (it *convicts provably-clean data live*, doesn't describe).
- **Accumulation** ✓ (a dated conviction record; failure streaks become events).
- **Interlocutors** ✓ (keyless open data + reproducible corpora → others can replicate and dispute;
  publish the method).
- **Real stakes / honest** ✓ (balanced by synthetic controls + the Greece exhibit; reflexive, not
  exculpatory — must be explicit in copy).

## Risks

- **χ²/N sensitivity:** χ² over-rejects at large N, powerless at small N — gate the "conviction"
  verdict to 100 ≤ N ≤ 10 000, flag otherwise. (P-hacking-adjacent if ignored — the very critique
  the lab is exposed to.)
- **Greece restatement:** use the static Rauch 2011 distribution, not the live (restated) API.
- **Framing:** always run the known-clean series first and establish the false-positive rate before
  showing any flagged real entity; "the test is wrong, not Country X."
- **Detector churn / rate limits (Track B):** record detector version per run; alternate detectors
  across nights.

## §6 — Decision for Frank

1. **Build directly, Track A first** (recommended) — zero secrets, fully buildable now, strongest
   reflexive fit, extends Round Number. Then add Track B when you drop in `HIVE_API_KEY` +
   `GPTZERO_API_KEY`.
2. **Leave as an engine seed** — already seeded in `field-research/REQUESTS.md`; the autonomous
   engine may pick it up on its own.
3. **Both** — build Track A as a directed lab instrument *and* let the engine riff on the idea.

If (1): next step is brainstorming → plan → TDD build of the `pipelines/tools-on-trial/` adapter
set, exactly like the other nightly pipelines.

## Sources

Both feasibility studies (2026-07-01) cite: Deckert/Myagkov/Ordeshook 2011 (Political Analysis);
Rauch et al. 2011 (German Economic Review); Winter et al. 2012 (IEEE, model-based digit analysis);
World Bank / Eurostat / FRED APIs; RAID (ACL 2024, MIT); ArtiFact; GenImage; Binoculars (ICML
2024); Mozilla Foundation detector evaluation; GPTZero & Hive docs. Full URLs in the session record.
