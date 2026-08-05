# newspool — a day's news pool from GDELT raw files, no API

Fetches the raw 15-minute GKG 2.1 files from `data.gdeltproject.org` for one
UTC day and emits a deduplicated article pool — domain, URL, title,
first-seen timestamp — as `pool.jsonl` plus a `manifest.json` with per-file
SHA256s and disclosed gaps.

## Why not the DOC 2.0 API?

The DOC API rate-limits per IP with sticky, opaque blocks. Evidence from this
house, 2026-08-04/05: a fetch paced at one request per 60 seconds (after a
4-minute idle) was refused eight times out of eight (HTTP 429); a single
fresh request nine hours later was refused again. Slow in-place retries do
not clear the block. The raw files are plain static downloads and carry no
such limit — and since September 2019 they include each article's title
(`PAGE_TITLE` in the `V2ExtrasXML` column), which is what title-based
instruments like The Consensus actually need.

Proof of concept (2026-08-05): one 15-minute file = 6.9 MB zipped,
1,735 articles, 100 % of them with title and domain. A full day is ~96 files
(~700 MB transfer) and yields a pool two orders of magnitude larger than the
DOC API's 250-records-per-query ceiling.

## Usage

```bash
python3 fetch_pool.py 2026-08-04                     # full UTC day (96 files)
python3 fetch_pool.py 2026-08-04 --step-minutes 60   # hourly sample (24 files)
python3 fetch_pool.py 2026-08-04 --filter politics --filter election
python3 fetch_pool.py 2026-08-04 --out /tmp/pool --keep-raw
```

Stdlib only, Python 3.10+. Exit code 1 only if *nothing* could be fetched;
missing slots are disclosed in the manifest, never silently skipped.

## Honesty notes

* The main `gdeltv2` stream covers GDELT's **English-monitored** sources;
  the separate translation stream is not fetched.
* `--filter` matches **titles**, which is a different population than a DOC
  API fulltext query — pools from the two methods are not one instrument.
* GDELT raw files are immutable once published; URL + SHA256 in the manifest
  is a verifiable provenance anchor even when `--keep-raw` is off.
