# warrant-trace — does a threshold arrive with the document that produced it?

**The instrument of Season 1, Episode 6/7, *The warrant that does not travel*.** Written
2026-08-07 (tick 43), because the episode's shipping decision is that what ships is the
instrument, and until today a stranger opening this directory found twenty-five files and no
door. Exposition: `../EPISODE-6-EXPOSITION-v2.md`. Full disclosure register:
`../EPISODE-6-APPARATUS.md`.

## The question it answers

A threshold in a methods section — `ruwe < 1.4`, `UWE < 1.25`, `R̂ < 1.1` — is not true or false.
It is a **reading**: made once, on a stated sample, in a document, usually hedged in the sentence
that states it. Downstream the number keeps working after the document stops travelling with it.

Given a statistic, a focus value, a deriving document and a frame of papers, this tool returns:

- how many **distinct published values** of that statistic are in use across the frame;
- at how many **sites** and in how many **papers** the focus value stands;
- and, at each of those sites, the citation keys standing in the window and the bibliography
  entries they resolve to — so that **you** can read what stands at the site.

It does not decide what stands at a site. That step is yours, by hand, and it is the load-bearing
one.

## Requirements

Python 3 and nothing else — standard library only, no packages to install, no account, no key, no
paid service. Run and verified on 3.11.15; no earlier version has been tested, so the floor is
stated as unknown rather than guessed. `fetch` makes HTTP requests to arXiv (one e-print per 3 s);
`measure`, `verify` and `handread_sites.py` are offline and touch no network at all.

## Ten minutes, on your own threshold

```bash
# 0. does the instrument still do what it says?
python3 selftest-0.5.py                      # the seven repaired faults, and eight controls
python3 selftest-0.4.py                      # one threshold written in two units
python3 selftest-0.3.py                      # asserts 1.1 and 1.10 count as one threshold
python3 faults-tick47.py                     # RED by design since 0.5: it records the defect

# 1. a frame: one arXiv id per line, the papers whose methods sections you want to read
#    (how you choose the frame is a research decision, not a tool feature — see "The frame")
#    sources land in corpus/src/, the per-file manifest beside it as corpus/fetch-manifest.jsonl
python3 warrant_trace.py fetch --ids my-frame.txt --out corpus/src

# 2. a profile: the statistic's spellings, the focus value, the documents to tell apart
cp profiles/rhat-1.1.json profiles/my-threshold.json && $EDITOR profiles/my-threshold.json

# 3. the sieve  (--out takes a stem; this writes my-measure.csv)
#    --frame takes the SAME ids file as step 1, so papers the fetcher could not read
#    appear as no_source instead of as an all-zero row — see "How it errs"
python3 warrant_trace.py measure --profile profiles/my-threshold.json \
                                 --src corpus/src --out my-measure \
                                 --frame my-frame.txt

# 4. the work: every site at the focus value, with its bibliography resolved
python3 handread_sites.py --profile profiles/my-threshold.json --src corpus/src \
                          --out my-sites.jsonl
```

Step 4 prints, per site: the citing paper, the matched string, the window around it, the citation
keys inside that window, and the bibliography entry each key resolves to. You read those and write
your own classification CSV by hand. `warrant_trace.py verify --against <earlier.csv>` re-runs a
profile over the same corpus and diffs it against an earlier table, which is how a changed regex
is kept honest.

## What a profile is

A JSON file (see `profiles/ruwe-1.4.json`, `uwe-1.25.json`, `rhat-1.1.json`) with:

| key | what it holds |
|---|---|
| `focus_value` | the number whose provenance you are asking about |
| `statistic`, `provenance_note` | prose, for the record — what the number is and what its deriving document actually says, read at source |
| `term`, `rel`, `site_patterns` | how the statistic and the comparison are written in this literature; every spelling you know of |
| `window` | characters around a match handed to the flags |
| `flags` | named regexes over the window, the citation keys, or both — one of them is the deriving document |
| `deriving_flag` | which flag names the document the number was read off |
| `targets` | the rival documents the site might point at instead |

Two of these are research, not configuration. `provenance_note` requires you to have **read the
deriving document at source** and to know what it says; and the flag set requires you to name the
rivals in advance, before seeing which one wins.

## How it errs — measured, both directions

An instrument whose only job is to make hand-reading finite must say which way it fails. This one
has one measured instance in each direction, and they are in the record, not in a promise:

- **False positives: 7 of 25 hand-read sites** (2026-08-01) — the sieve flags a site that is not
  one.
- **False negatives: 3 of 3** missed by a flag built to catch them (2026-08-05).
- **The silent zero** (2026-08-05): a paper with no LaTeX source at arXiv returns an all-zero row
  indistinguishable from a paper that never mentions the statistic. Such papers must be excluded
  from every denominator and counted in the open — that is what `--frame` is for, and running
  without it silently understates.
- **Written forms are not values.** `1.1` and `1.10` are one threshold written twice. The tool
  reports the numeric count and the written-form count side by side; `selftest-0.3.py` asserts it.
- **Nor are units** (0.4, 2026-08-08). A literature can write one threshold as `0.5` and as
  `50%` — two different *numbers* denoting one criterion, which no numeric comparison can see.
  A profile may therefore declare `focus_equivalents: ["50"]`; the equivalence is a human
  reading of the literature and is never inferred. All three counts are printed — unioned,
  0.3's numeric, 0.2's string — so the repair stays visible instead of silently replacing what
  earlier reports published. `selftest-0.4.py` asserts the new case and re-asserts the old one;
  `selftest-0.3.py` is left standing unchanged. `handread_sites.py` selects by the same rule,
  because a repair that does not reach the hand-reading step does not reach the numbers.
- **Value collision: 18 of 108 focus sites, 16.7 %** (2026-08-08, the largest measured
  false-positive rate this instrument has). The sieve finds a statistic, a comparison and a number.
  It cannot find out **which operation** they govern. In the computer-vision case, `IoU ≥ 0.5`
  names the correctness criterion — and the same statistic at the same number in the same paper
  also sets non-maximum suppression (7 sites), method-internal filters such as pseudo-label
  acceptance and mask de-duplication (7), and in 4 cases was not a threshold on this statistic at
  all. Nothing in the string distinguishes them; only the surrounding argument does. The first
  three cases could not produce this — `ruwe < 1.4` does one job — so a threshold that does
  several jobs in one literature needs the hand-reading step to *classify by operation first* and
  count second. If you skip that, your denominator is inflated by every other use of the number.
- **Comments are included by default.** `--nocomments` re-runs without LaTeX comments; report both,
  as every measurement in this record does.
- **Value collision: 18 of 108 hand-read focus sites** (2026-08-08, tick 46; owed to this section
  since that day and written here at tick 47). A site can carry the focus *number* and a
  *different threshold*: in computer vision, 7 of those 18 were a non-maximum-suppression
  threshold, 7 method-internal filters, 4 not this statistic at all. A number is not a criterion,
  and only hand-reading tells them apart. Rate measured in one literature; assume it exists in
  yours.
- **Site detection misses stated thresholds — seven named ways** (2026-08-08, tick 47). A
  hand-read sample of 36 papers the sieve had recorded as *mentioning the statistic and stating
  no threshold* found that **8 of 36 do state one** (4 of 12 in the Gaia frame, 0 of 12 in the
  MCMC frame, 4 of 12 in the CV frame). Each miss is pinned to a verbatim fragment in
  `faults-tick47.py`, which reproduces all seven against 0.4:
  **F1** an intervening decimal (`RUWE … is 34.676, far above the limit of > 1.4`) breaks the gap
  class `[^.;:\n]`; **F2** a subscripted identifier (`ruwe_2<1.4`) is not a term match;
  **F3** LaTeX `\textless` / `\textgreater` are not normalised to `<` / `>`; **F4** the R-hat
  term has no left boundary, so the letters `hat R` inside **`that R`** count as a mention;
  **F5** a value standing before the term (`each at the 0.50 IoU threshold`) is a site only for
  `<` and `>`; **F6** the CV profile's relation list has no bare `of`, so `IoU of 0.50` — a site
  that carries a citation — is invisible; **F7** a sweep (`IoU thresholds from 0.50 to 0.95`)
  states values no relation reaches. F1–F3 and F5–F7 understate sites; **F4 overstates
  mentions**, which inflates a denominator. Direction matters here: an understated site count
  makes a warrant look *less* travelled than it is, which flatters this instrument's own
  finding. **Repaired in 0.5 at tick 50 — read the next entry, which is about what the repair
  cost.**
- **0.5 counts papers better and sites worse — do not quote both from one run** (2026-08-09,
  tick 50; the entry to read before using this version). The seven faults above are repaired
  and the repair was re-measured over all three frames the same day — 1 085 papers, every
  e-print byte-identical to the manifest that first read it, and 0.4 re-run over that corpus
  reproducing all three landed tables exactly. Measured in both directions:
  - **Papers: better.** Over the 36 papers of tick 47's hand-reading, 0.5 finds a threshold in
    **7 of the 8** that state one and in **0 of the 16** that state none
    (`handread-check-tick50.py`). Of 47 papers that changed class, not one of the ten with
    ground truth was a genuine closed question wrongly removed.
  - **Sites: worse.** Of **20 of the 212 sites the repair newly finds**, drawn by seed and
    hand-read against their windows (`sample-newsites-tick50.csv`), **only 9 are threshold
    statements**. Three are reported performance values and **eight are not the statistic at
    all**: a photometric colour, two parallaxes, a separation in au, a loss weight, a sample
    count, a threshold on a different Gaia column. Every one is the widened site gap reaching
    a number that happens to stand within 100 characters of the statistic's name.

  The cause is one number. F1's repair raised the gap bound from 50 to 100 characters, chosen
  by the rule "the smallest multiple of ten that admits both pinned fragments" — a rule that
  asked what the gap must reach and never what else it would reach. If you point this
  instrument at your own threshold, **lower `GAP` until your literature's site counts stop
  moving**, and hand-read the difference: the repaired paper-level classification does not
  depend on the wide gap nearly as much as the site counts do.
  **One of the seven is still open:** F7 covers `from X to Y` and not the hyphenated form
  `IoU thresholds 0.5-0.95`, which is how `2607.00129v1` writes it.
- **A sample correction is not a census** (2026-08-09, tick 50). Tick 47 corrected three
  corpus rates by hand-reading 12 papers per literature and reported a reversal of their
  ranking. The repaired census over all 1 085 papers does not reproduce it. Part of the gap is
  a mis-posed comparison — the sample corrected for two error classes and the repair fixes one
  — and part is that 12 papers carry an interval wide enough to contain almost anything. If
  you correct a rate by a sample, print the interval in the same sentence, and treat the
  ranking it implies as unsettled until a census exists.
- **A window pattern is not a whole-paper pattern: 3 of 25 hits, 12 %** (2026-08-09,
  `wholepaper-tick48.py`). Asking whether the deriving document is in the paper *at all* is a
  different question from what stands at a site, and the profile's flag regexes are written for a
  420-character window. Two alternatives of `cite_tn` (`technical note`, `DPAC technical`) match
  unrelated prose the moment the window is removed, and even after dropping them `GAIA-C3-TN`
  matches **any** DPAC C3 technical note — the three rejects carry LL-136, LL-125 and LL-084, and
  none carries LL-124. If you reuse a profile flag over a whole document, narrow it first (which
  can only lower the count) and hand-read every hit.
- **The fetcher's resume set is read once, at start.** Two `fetch` runs against the same manifest
  therefore do not divide the work — they duplicate it, and the declared one-request-per-3 s
  becomes two. This was done here on 2026-08-09: 286 records for a 187-paper frame, caught by
  arithmetic afterwards. Check `wc -l` on the manifest against your frame before you trust a rate.
  Unrepaired, and named rather than fixed, like the other fetcher limitation below: a `FAILED`
  fetch also enters the manifest the skip-set reads, so it can never be retried into the same
  corpus.

- **The relation slot does not read the relation — 32 tokens, one slot; 3.5 % of landed sites
  run the other way** (2026-08-12, ticks 63 and 64; **N7**). The sieve requires a
  comparison-shaped word between the statistic's name and its number. It never reads what the
  word says. Measured twice, on landed material and with the shipped instrument unmodified:
  - **Reach** (`the-gap/relationreach-tick63.py`). Every one of the 32 relation alternatives the
    CV profile declares, inserted at every inter-word position of the four fragments the sieve is
    known to miss — 1 856 mutants — recovers the printed threshold at **one** position each, and
    **all 32 work**: `below`, `less than`, `lower than` and `smaller than` exactly as `above`.
    The instrument cannot tell `IoU above 0.5` from `IoU below 0.5`.
  - **Cost** (`the-gap/directioncost-tick64.py`). Over the 292 sites of the landed tick-57 dump,
    classified by a direction table fixed in writing before the run: **LOWER 53 · UPPER 10 ·
    NEUTRAL 223 · NONE 6**. IoU 0.5 is a lower bound — the deriving document says the overlap
    "must exceed 0.5" — so the **10 UPPER sites, 3.5 % of the 286 classified**, are counted as
    invocations of a criterion they run against. At the focus value itself the share is **5 of
    128, 3.9 %**, and two papers (`2606.03748v1`, `2605.05616v1`) have no other kind of site.
  - **What it means for a rate you compute with this tool.** A small share, and not zero, and it
    is the kind of error no denominator check finds: the site is real, the number is right, the
    sentence says the opposite. If your threshold is a bound rather than a set point, classify
    your sites by direction before you count them.
  - **Two cautions about the second measurement, from its own record.** Its dump is 0.6-era
    output, and the profile's later mean-form reject would drop 50 of those 292 sites; and its
    `NEUTRAL` plurality is 42.6 % the single token `=`, a third of those inside LaTeX, which
    E6 (0.7) was written against. The direction figures above are unaffected — 2 of the 50 are
    UPPER — but the class sizes beside them are not a reading of how the literature writes.
  Unrepaired and disclosed, like N1–N3: this is a property of matching a slot, not a bug in a
  pattern, and repairing it means deciding per profile what a threshold's own direction is.

## The frame

The tool takes a frame; it does not build one, and this is the sharpest limitation of the episode
that used it. Of the three readings shipped with it, only case 3's frame is re-derivable from
committed code (`frame-tick36.json` records its two arXiv queries and its drop rule). For cases 1
and 2 the frame-building step was never committed, and how much of it one named source accounts
for was measured afterwards rather than assumed: **588 of 599 members**, with the readings
unmoved on the recovered part (`frame-recovery-tick41.py`, and `../EPISODE-6-EXPOSITION-v2.md`
§6). Build your frame with code you keep, and you will be better off than this instrument's own
first two cases.

**A frame drawn from a literature's newest edge dates the reading, and can hide the answer.**
`frame-tick47.py` (2026-08-08) is the same case read again across four two-year strata, 2014–2026,
with the profile byte-identical and only the dates changed — one query per window, each window split
into its 8 calendar quarters, 8 papers per quarter, so that no era is selected by a differently
shaped rule. It exists because the fourth case's first frame was 256 recent papers, and "the
deriving document stands at 2 % of sites" reads very differently if the rate used to be higher. It
was not: 0 of 18 criterion sites in 2014–15, 2 of 54 across twelve years. If your threshold is older
than your frame, stratify before you conclude.

`frame-tick46.py` (2026-08-08) is the fourth case taking its own advice: two arXiv queries, a
drop rule, and every member with its categories and submission date, written to
`frame-tick46.json` and `frame-tick46.txt` by code that is committed beside them. Copy it
rather than the prose.

## What it is not

- Not a detector of error. Nothing it returns says anyone did anything wrong; a methods sentence
  citing the paper that introduced a statistic, for a threshold stated elsewhere, is the ordinary
  way a field writes.
- Not a judgment about whether a cited document *says* what it is cited as saying. It stops at
  which document the site points to. The other question is Lance, Butts & Michels (2006),
  doi:10.1177/1094428105284919, and Standvoss *et al.* (2024), doi:10.1371/journal.pbio.3002562.
- Not applicable to a threshold whose deriving document you cannot read, or whose citing
  literature is not machine-readable. Both were binding constraints on case 3.

## Provenance of this directory

The three readings taken with this instrument, and everything they rest on, are listed as files in
`../EPISODE-6-APPARATUS.md` §1 — profiles, frames, per-file sha256 fetch manifests, measurement
tables, hand-reading CSVs, and the pre-registration written before each count.

If you run this and show that the rates are artefacts of the window, that is the outcome the
hand-reading protocol exists for, and it would be a good day. The reply route is in
`../EPISODE-6-EXPOSITION-v2.md` §9.

— Ulysses / Atelier, a situated artistic research practice by Frank Bültge, developed through
documented human–machine operations.
