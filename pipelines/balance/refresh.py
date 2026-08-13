#!/usr/bin/env python3
"""
The Balance — Counter-Measurement III.

Measures the emotional trade balance of the world's press: for each country,
how its own newsrooms write about it (self-image) against how the rest of the
world's newsrooms write about it (foreign image) — per emotion, daily.

The instrument measures PORTRAYAL, never population mood: document-level tone
and dictionary emotion rates are properties of the writing press. That framing
is the method, not a caveat (spec: docs/superpowers/specs/2026-08-14-the-balance-design.md,
calibration addendum of the same date; go/no-go spike passed on 2026-08-12 data
with 61 qualifying countries, 44 of them significant on a core dimension).

Method v1 (2026-08-14):
  1. fetch the last 24 h of GDELT's raw 15-minute GKG 2.1 files (96 static
     downloads, shared fetch layer with pipelines/newspool — no API, no key),
  2. map each article's source domain to a country via the committed
     sources_by_country.csv snapshot (GDELT lookup, 37,802 domains),
  3. read the countries an article mentions from V1LOCATIONS, its tone from
     V1.5TONE, and a fixed dimension set from V2GCAM (codes in DIMENSIONS —
     chosen by measured coverage, see the spec addendum),
  4. for every country with >= MIN_POOL articles in BOTH pools: mean per
     dimension in each pool plus a bootstrap 95% CI of the gap,
  5. the machine picks the day's headline deterministically: the widest
     significant tone gap.

Pools below MIN_POOL are withheld, never extrapolated (a gap is a gap).
Absolute values only in v1: anomaly z-scores need a rolling baseline, which
begins accumulating with this archive — the page says so.

Output: src/data/balance/latest.json (+ archive <date>.json). Git is the
archive; committed day files are immutable (main() refuses to overwrite).
"""
import csv
import html
import io
import json
import random
import sys
import time
import zipfile
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

METHOD_VERSION = "v1"
METHOD_SINCE = "2026-08-14"
SLOTS_PER_DAY = 96
MIN_POOL = 25          # articles per pool below which a country's balance is withheld
MIN_WORDS = 100        # GCAM rates on very short documents are noise
BOOT_N = 800           # bootstrap resamples for the gap CI
BOOT_CAP = 2000        # per-pool subsample cap for the bootstrap (disclosed in method)

# Fixed v1 dimension set — codes from the GCAM master codebook, chosen by measured
# coverage on 2026-08-12 (spec addendum): ANEW/labMT are dense scored backbones,
# LIWC rates are the discrete-emotion core. Rates are matches per 1,000 words.
DIMENSIONS = {
    "tone": {"kind": "tone", "label": "Tone", "source": "V1.5TONE"},
    "valence": {"kind": "score", "code": "v19.1", "label": "Valence (ANEW)"},
    "happiness": {"kind": "score", "code": "v21.1", "label": "Happiness (labMT)"},
    "anxiety": {"kind": "rate", "code": "c5.33", "label": "Anxiety (LIWC)"},
    "anger": {"kind": "rate", "code": "c5.32", "label": "Anger (LIWC)"},
    "sadness": {"kind": "rate", "code": "c5.31", "label": "Sadness (LIWC)"},
}
GCAM_CODES = {d["code"] for d in DIMENSIONS.values() if "code" in d} | {"wc"}

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "data" / "balance"
LOOKUP_CSV = Path(__file__).resolve().parent / "sources_by_country.csv"

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "newspool"))
from fetch_pool import fetch_slot  # noqa: E402


def last_slots(n: int = SLOTS_PER_DAY) -> list[str]:
    """The n most recent COMPLETED 15-minute slots, oldest first (consensus pattern)."""
    now = datetime.now(timezone.utc)
    newest = now.replace(minute=(now.minute // 15) * 15, second=0, microsecond=0) - timedelta(minutes=15)
    return [(newest - timedelta(minutes=15 * i)).strftime("%Y%m%d%H%M%S") for i in range(n)][::-1]


def load_lookup() -> tuple[dict, dict]:
    """domain -> FIPS, FIPS -> display name; from the committed GDELT snapshot."""
    domain_to_fips, fips_to_name = {}, {}
    with open(LOOKUP_CSV, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["Domain"] and row["FIPS"]:
                domain_to_fips[row["Domain"].lower()] = row["FIPS"]
                fips_to_name.setdefault(row["FIPS"], row["CountryName"])
    return domain_to_fips, fips_to_name


def parse_gcam(field: str) -> dict:
    out = {}
    for pair in field.split(","):
        k, _, v = pair.partition(":")
        if k in GCAM_CODES and v:
            try:
                out[k] = float(v)
            except ValueError:
                pass
    return out


def mentioned_countries(v1locations: str) -> set[str]:
    """FIPS codes of every country a mentioned location belongs to (city counts for
    its country: a Berlin mention is coverage about Germany)."""
    out = set()
    for block in v1locations.split(";"):
        parts = block.split("#")
        if len(parts) >= 3 and parts[2]:
            out.add(parts[2])
    return out


def fetch_articles(lookup: dict) -> tuple[list[dict], dict]:
    slots = last_slots()
    seen_urls: set[str] = set()
    articles: list[dict] = []
    missing: list[str] = []
    domains_seen: set[str] = set()
    domains_mapped: set[str] = set()
    scanned = 0
    for k, stamp in enumerate(slots):
        raw = fetch_slot(stamp)
        if raw is None:
            missing.append(stamp)
            print(f"  gap {stamp} (slot absent after retries)", file=sys.stderr)
            continue
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            with z.open(z.namelist()[0]) as f:
                for line in io.TextIOWrapper(f, encoding="utf-8", errors="replace"):
                    cols = line.rstrip("\n").split("\t")
                    if len(cols) < 27 or not cols[4].startswith("http") or cols[4] in seen_urls:
                        continue
                    seen_urls.add(cols[4])
                    scanned += 1
                    dom = cols[3].lower()
                    domains_seen.add(dom)
                    src = lookup.get(dom)
                    if not src:
                        continue
                    domains_mapped.add(dom)
                    gcam = parse_gcam(cols[17])
                    wc = gcam.get("wc", 0)
                    if wc < MIN_WORDS or not cols[15] or not cols[9]:
                        continue
                    try:
                        tone = float(cols[15].split(",")[0])
                    except ValueError:
                        continue
                    articles.append({
                        "src": src,
                        "about": mentioned_countries(cols[9]),
                        "tone": tone,
                        "valence": gcam.get("v19.1"),
                        "happiness": gcam.get("v21.1"),
                        "anxiety": gcam.get("c5.33", 0.0) / wc * 1000,
                        "anger": gcam.get("c5.32", 0.0) / wc * 1000,
                        "sadness": gcam.get("c5.31", 0.0) / wc * 1000,
                    })
        if (k + 1) % 16 == 0:
            print(f"  {k + 1}/{len(slots)} slots, kept {len(articles)}", file=sys.stderr)
        time.sleep(0.3)
    stats = {
        "articles_scanned": scanned,
        "articles_mapped": len(articles),
        "mapping_rate": round(len(domains_mapped) / max(1, len(domains_seen)), 3),
        "domains_seen": len(domains_seen),
        "slots_expected": len(slots),
        "slots_fetched": len(slots) - len(missing),
        "slots_missing": missing,
        "window": f"{slots[0]} .. {slots[-1]} UTC",
    }
    return articles, stats


def boot_ci(rng: random.Random, xs: list[float], ys: list[float]) -> tuple[float, float]:
    """Bootstrap 95% CI of mean(xs) - mean(ys), pools subsampled to BOOT_CAP."""
    if len(xs) > BOOT_CAP:
        xs = rng.sample(xs, BOOT_CAP)
    if len(ys) > BOOT_CAP:
        ys = rng.sample(ys, BOOT_CAP)
    diffs = []
    for _ in range(BOOT_N):
        bx = [xs[rng.randrange(len(xs))] for _ in range(len(xs))]
        by = [ys[rng.randrange(len(ys))] for _ in range(len(ys))]
        diffs.append(sum(bx) / len(bx) - sum(by) / len(by))
    diffs.sort()
    return diffs[int(0.025 * BOOT_N)], diffs[int(0.975 * BOOT_N)]


def compute(articles: list[dict], names: dict, day: str) -> tuple[list[dict], dict | None]:
    self_pool: dict[str, list] = defaultdict(list)
    foreign_pool: dict[str, list] = defaultdict(list)
    for a in articles:
        for c in a["about"]:
            (self_pool if a["src"] == c else foreign_pool)[c].append(a)

    rng = random.Random(f"balance-{day}")  # deterministic per day: reruns reproduce the file
    rows = []
    for c in sorted(set(self_pool) & set(foreign_pool)):
        ns, nf = len(self_pool[c]), len(foreign_pool[c])
        if ns < MIN_POOL or nf < MIN_POOL:
            continue
        dims = {}
        for key in DIMENSIONS:
            xs = [a[key] for a in self_pool[c] if a[key] is not None]
            ys = [a[key] for a in foreign_pool[c] if a[key] is not None]
            if len(xs) < MIN_POOL or len(ys) < MIN_POOL:
                continue
            lo, hi = boot_ci(rng, xs, ys)
            # Significance derives from the ROUNDED bounds — the published record must be
            # self-consistent: a reader checking the printed interval reaches the same call.
            lo, hi = round(lo, 3), round(hi, 3)
            dims[key] = {
                "self": round(sum(xs) / len(xs), 3),
                "foreign": round(sum(ys) / len(ys), 3),
                "gap_ci95": [lo, hi],
                "significant": bool(lo > 0 or hi < 0),
            }
        if dims:
            rows.append({"fips": c, "name": names.get(c, c), "n_self": ns, "n_foreign": nf, "dims": dims})

    # Headline: widest significant tone gap; ties break on FIPS for determinism.
    headline = None
    candidates = [r for r in rows if r["dims"].get("tone", {}).get("significant")]
    if candidates:
        top = max(candidates, key=lambda r: (abs(r["dims"]["tone"]["self"] - r["dims"]["tone"]["foreign"]), r["fips"]))
        t = top["dims"]["tone"]
        headline = {
            "fips": top["fips"],
            "name": top["name"],
            "n_self": top["n_self"],
            "n_foreign": top["n_foreign"],
            "tone_self": t["self"],
            "tone_foreign": t["foreign"],
            "gap": round(t["self"] - t["foreign"], 3),
            "gap_ci95": t["gap_ci95"],
            # positive gap: its own press writes brighter about it than the world does
            "direction": "self_brighter" if t["self"] > t["foreign"] else "world_brighter",
        }
    rows.sort(key=lambda r: -abs(r["dims"].get("tone", {}).get("self", 0) - r["dims"].get("tone", {}).get("foreign", 0)))
    return rows, headline


def main() -> int:
    lookup, names = load_lookup()
    articles, stats = fetch_articles(lookup)
    now = datetime.now(timezone.utc)
    day = now.strftime("%Y-%m-%d")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    day_file = OUT_DIR / f"{day}.json"
    if day_file.exists():
        print(f"refusing to overwrite committed archive file {day_file.name}", file=sys.stderr)
        return 1

    if stats["slots_fetched"] == 0:
        record = {
            "generated_at": now.isoformat(timespec="seconds"),
            "date": day,
            "method": method_block(),
            "headline": None,
            "countries": [],
            "stats": stats,
            "source": source_block(now),
            "note": "Source unreachable — finding omitted (a gap is a gap, never bridged).",
        }
    else:
        rows, headline = compute(articles, names, day)
        record = {
            "generated_at": now.isoformat(timespec="seconds"),
            "date": day,
            "method": method_block(),
            "headline": headline,
            "countries": rows,
            "stats": stats,
            "source": source_block(now),
        }

    day_file.write_text(json.dumps(record, indent=1, ensure_ascii=False) + "\n")
    (OUT_DIR / "latest.json").write_text(json.dumps(record, indent=1, ensure_ascii=False) + "\n")
    print(f"BALANCE {day}: {len(record['countries'])} countries, "
          f"headline={record['headline']['name'] if record['headline'] else 'none'}")
    return 0


def method_block() -> dict:
    return {
        "version": METHOD_VERSION,
        "since": METHOD_SINCE,
        "min_pool": MIN_POOL,
        "min_words": MIN_WORDS,
        "bootstrap": {"resamples": BOOT_N, "subsample_cap": BOOT_CAP},
        "dimensions": {k: {kk: vv for kk, vv in v.items() if kk != "kind"} | {"unit": ("tone -100..+100" if v["kind"] == "tone" else "dictionary score" if v["kind"] == "score" else "matches per 1,000 words")} for k, v in DIMENSIONS.items()},
        "stream": "GDELT English-monitored GKG 2.1 (translation stream not yet fetched — disclosed on the page)",
    }


def source_block(now: datetime) -> dict:
    return {
        "name": "GDELT Project — GKG 2.1 raw files + sourcesbycountry lookup",
        "url": "https://www.gdeltproject.org/",
        "license": "Open with attribution (citation + link)",
        "retrieved_utc": now.isoformat(timespec="seconds"),
    }


if __name__ == "__main__":
    sys.exit(main())
