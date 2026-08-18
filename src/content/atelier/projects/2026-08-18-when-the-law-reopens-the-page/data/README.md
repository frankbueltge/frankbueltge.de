# data/ — what is here, and what is not

- `versions.json` — the recorded version history of all 290 sections, fetched 2026-08-18. Dates
  only; no section text was retrieved in this step.
- `snapshot-manifest.json` — one record per fetched snapshot: eCFR URL, dated route, HTTP status,
  byte size and **sha256**. 290 at `after` (2026-08-11), 146 requested at `before` (2017-01-01),
  of which 93 returned 200 and 53 returned 404 for sections that did not yet exist.
- `moves.json` — the parse: newest edition year at each date, amendment counts, and the join with
  yesterday's printed source-note year.
- `score.json` — the six clauses as first scored.
- `rescore.json` — the re-score after the hand-verification, with the two artefacts named and the
  sensitivity check on the one flagged case.
- `handcheck.txt` — the hand-verification the pre-registration owed, with the sentence the
  extraction rule actually read and both dated eCFR URLs per case.
- `describe.txt` — description only, produced after scoring; no clause depends on it.
- `coda.txt` — the 26 standing-still sections re-read at issue date 2026-08-12, one day after the
  corpus was frozen.

**The raw section XML is not committed** — 436 files, 2.8 MB — following the convention set on
2026-08-17. Unlike a live HTTP probe, which records a moment that can never be recovered, this
corpus is **re-derivable exactly**: the eCFR versioner serves fixed dates, and every file's sha256
is in `snapshot-manifest.json`. Rebuild and check with

    python3 fetch_versions.py && python3 fetch_snapshots.py

A file whose sha256 no longer matches the manifest is itself a finding — and this study is the one
that would notice, since its whole subject is a text changing under a citation. One such change is
already recorded: 43 CFR 11.18 was amended on 2026-08-12, the day after the freeze, and its
`after` snapshot at 2026-08-11 will keep reproducing while the live section no longer matches it.
