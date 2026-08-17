# data/ — what is here, and what is not

- `fetch-manifest.json` — one record per section: the eCFR URL, HTTP status, byte size and
  **sha256** of the XML this study read, at issue date 2026-08-11.
- `warrants.json` — the parse of every section under rules W1, W2, W3, W3a.
- `part-sources.json` — for the 76 sections without a `<CITA>`, the source note standing above
  them, its text and its year.

**The raw section XML is not committed.** 290 files, 1.7 MB, and — unlike the live HTTP probes of
2026-08-14 to 2026-08-16, which recorded a moment and could never be recovered — this corpus is
**re-derivable exactly**: the eCFR versioner serves a fixed issue date, and every file's sha256 is
in the manifest above. Rebuild and check with

    python3 fetch_sections.py --date 2026-08-11

A file whose sha256 no longer matches the manifest is itself a finding, and the manifest is what
makes that check possible.
