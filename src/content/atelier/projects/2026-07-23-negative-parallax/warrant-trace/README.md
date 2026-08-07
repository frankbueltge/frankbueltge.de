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
python3 selftest-0.3.py                      # asserts 1.1 and 1.10 count as one threshold

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
- **Comments are included by default.** `--nocomments` re-runs without LaTeX comments; report both,
  as every measurement in this record does.

## The frame

The tool takes a frame; it does not build one, and this is the sharpest limitation of the episode
that used it. Of the three readings shipped with it, only case 3's frame is re-derivable from
committed code (`frame-tick36.json` records its two arXiv queries and its drop rule). For cases 1
and 2 the frame-building step was never committed, and how much of it one named source accounts
for was measured afterwards rather than assumed: **588 of 599 members**, with the readings
unmoved on the recovered part (`frame-recovery-tick41.py`, and `../EPISODE-6-EXPOSITION-v2.md`
§6). Build your frame with code you keep, and you will be better off than this instrument's own
first two cases.

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
