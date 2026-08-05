#!/usr/bin/env python3
"""newspool — fetch a day's news-article pool from GDELT raw files, no API.

Why this exists (2026-08-05): the GDELT DOC 2.0 API rate-limits per IP with
sticky, opaque blocks — on 2026-08-04/05 it refused every request of a paced,
conservative fetch (HTTP 429, eight refusals across three passes, then again
from a fresh session nine hours later). The raw 15-minute files on
data.gdeltproject.org carry no such limit: they are plain static files, and
since September 2019 the GKG 2.1 stream includes each article's title
(PAGE_TITLE inside the V2ExtrasXML column). This tool downloads those files
for one UTC day and emits a deduplicated article pool: domain, url, title,
first-seen timestamp.

Scope and honesty:
  * The main gdeltv2 stream covers GDELT's English-monitored sources; the
    separately published translation stream is NOT fetched here.
  * An optional --filter matches keywords against TITLES only. That is not
    the same population as a DOC API fulltext query — do not compare pools
    across the two methods as if they were one instrument.
  * Missing 15-minute slots are recorded in the manifest as gaps, never
    silently skipped: a missing slot is a disclosed gap, not a smaller day.
  * The manifest records each file's SHA256 so a reader can re-fetch and verify;
    GDELT's raw files are immutable once published.

Usage:
  python3 fetch_pool.py 2026-08-04                       # full UTC day, 96 files
  python3 fetch_pool.py 2026-08-04 --step-minutes 60     # hourly sample, 24 files
  python3 fetch_pool.py 2026-08-04 --filter politics --filter election
  python3 fetch_pool.py 2026-08-04 --out /tmp/pool --keep-raw

Output: <out>/pool.jsonl (one article per line) + <out>/manifest.json.
Stdlib only; Python 3.10+.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
import sys
import time
import urllib.error
import urllib.request
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

TOOL_VERSION = "newspool v1 (2026-08-05)"
BASE = "http://data.gdeltproject.org/gdeltv2"  # same host the protokoll adapter uses
UA = {"User-Agent": "frankbueltge.de newspool (research; github.com/frankbueltge)"}
GKG_COLUMNS = 27  # GKG 2.1 codebook; V2ExtrasXML is the last column
PAGE_TITLE_RE = re.compile(r"<PAGE_TITLE>(.*?)</PAGE_TITLE>", re.S)
FETCH_PAUSE_S = 0.5  # politeness between static-file downloads; not a rate limit


def slots_for_day(day: datetime, step_minutes: int) -> list[str]:
    """All YYYYMMDDHHMMSS slot stamps of one UTC day at the given stride."""
    out = []
    t = day.replace(hour=0, minute=0, second=0, microsecond=0)
    end = t + timedelta(days=1)
    while t < end:
        out.append(t.strftime("%Y%m%d%H%M%S"))
        t += timedelta(minutes=step_minutes)
    return out


def fetch_slot(stamp: str, retries: int = 3) -> bytes | None:
    """One 15-minute GKG zip, or None if the slot is absent (disclosed gap).

    A 404 is taken as the slot not existing — GDELT occasionally skips
    intervals — and is not retried; network errors get short retries.
    """
    url = f"{BASE}/{stamp}.gkg.csv.zip"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            print(f"  ! {stamp}: HTTP {e.code} (attempt {attempt + 1})", file=sys.stderr)
        except Exception as e:  # noqa: BLE001 — network/timeout; retried below
            print(f"  ! {stamp}: {e} (attempt {attempt + 1})", file=sys.stderr)
        if attempt < retries - 1:
            time.sleep(5 * (attempt + 1))
    return None


def parse_gkg(raw_zip: bytes) -> list[dict]:
    """Extract (seen, domain, url, title) rows from one GKG zip."""
    rows = []
    with zipfile.ZipFile(io.BytesIO(raw_zip)) as z:
        name = z.namelist()[0]
        with z.open(name) as f:
            for line in io.TextIOWrapper(f, encoding="utf-8", errors="replace"):
                cols = line.rstrip("\n").split("\t")
                if len(cols) < GKG_COLUMNS:
                    continue
                seen, domain, url = cols[1], cols[3], cols[4]
                m = PAGE_TITLE_RE.search(cols[26])
                if not (m and domain and url.startswith("http")):
                    continue
                title = html.unescape(m.group(1)).strip()
                if title:
                    rows.append({"seen": seen, "domain": domain, "url": url, "title": title})
    return rows


def title_matches(title: str, needles: list[str]) -> bool:
    low = title.lower()
    return any(re.search(rf"\b{re.escape(n.lower())}\b", low) for n in needles)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("date", help="UTC day, YYYY-MM-DD")
    ap.add_argument("--step-minutes", type=int, default=15, choices=(15, 30, 60),
                    help="sampling stride across the day (default 15 = every file)")
    ap.add_argument("--filter", action="append", default=[],
                    help="keep only titles containing this word (repeatable, OR-joined)")
    ap.add_argument("--out", default=None, help="output directory (default pool-<date>/)")
    ap.add_argument("--keep-raw", action="store_true",
                    help="also store the downloaded zips next to the pool")
    args = ap.parse_args()

    day = datetime.strptime(args.date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    out_dir = Path(args.out or f"pool-{args.date}")
    out_dir.mkdir(parents=True, exist_ok=True)
    if args.keep_raw:
        (out_dir / "raw").mkdir(exist_ok=True)

    slots = slots_for_day(day, args.step_minutes)
    pooled: dict[str, dict] = {}  # url -> first-seen row; slots arrive chronologically
    files, missing = [], []
    for i, stamp in enumerate(slots):
        raw = fetch_slot(stamp)
        if raw is None:
            missing.append(stamp)
            print(f"  gap {stamp} (slot absent after retries)", file=sys.stderr)
            continue
        digest = hashlib.sha256(raw).hexdigest()
        rows = parse_gkg(raw)
        if args.keep_raw:
            (out_dir / "raw" / f"{stamp}.gkg.csv.zip").write_bytes(raw)
        kept = 0
        for row in rows:
            if args.filter and not title_matches(row["title"], args.filter):
                continue
            kept += 1
            pooled.setdefault(row["url"], row)
        files.append({"slot": stamp, "sha256": digest, "rows": len(rows), "kept": kept})
        print(f"  {stamp}: {len(rows)} rows, {kept} kept, pool {len(pooled)}"
              f" ({i + 1}/{len(slots)})", file=sys.stderr)
        time.sleep(FETCH_PAUSE_S)

    pool = list(pooled.values())
    with (out_dir / "pool.jsonl").open("w", encoding="utf-8") as f:
        for row in pool:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    manifest = {
        "tool": TOOL_VERSION,
        "fetched_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": f"{BASE}/<slot>.gkg.csv.zip",
        "stream": "gdeltv2 English-monitored GKG 2.1 (translation stream not fetched)",
        "date": args.date,
        "step_minutes": args.step_minutes,
        "title_filter": args.filter,
        "slots_expected": len(slots),
        "slots_fetched": len(files),
        "slots_missing": missing,
        "articles": len(pool),
        "files": files,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"POOL {len(pool)} articles, {len(files)}/{len(slots)} slots, "
          f"{len(missing)} gaps -> {out_dir}")
    return 0 if files else 1  # nothing fetched at all = failure, gaps alone are not


if __name__ == "__main__":
    sys.exit(main())
