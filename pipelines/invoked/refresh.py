#!/usr/bin/env python3
"""
The Invoked Past — which yesterday the world cites today.

Reads every dated reference in ~24 h of the world's press and publishes the day's
histogram of invoked years: which pasts are made present, by whose newsrooms, and
how old today's historical memory is.

The sensor is GDELT's `V2.1ENHANCEDDATES`, added to GKG 2.1 in 2015 explicitly for
anniversary analysis and never given an instrument: a GDELT blog search for the
field returns nothing, and the legacy Analysis Service's anniversary visualiser is
retired. The nearest living neighbours are a paper (Candia et al. 2019, the
universal decay of collective memory) and an editorial page (Wikipedia's "On This
Day"). Spec: docs/superpowers/specs/2026-08-14-the-invoked-past-design.md, with the
go/no-go spike of 2026-08-14 (119,263 articles, 0 gaps).

Method v1 (2026-08-15):
  1. fetch the last 24 h of GDELT's raw 15-minute GKG 2.1 files (96 static
     downloads, shared fetch layer with pipelines/newspool — no API, no key),
  2. parse column 16 (`V2.1ENHANCEDDATES`), whose blocks are
     `resolution#month#day#year#offset` with, as measured against live data:
     1 = year only · 2 = month+year · 3 = full date · 4 = month/day without year,
  3. apply the four versioned cleaning rules (see RULES below) — every rule
     reports the mentions it removed, in the day file, every day,
  4. aggregate mentions per invoked year, normalised per 1,000 articles, with the
     source-country split from the committed GDELT domain lookup that The Balance
     already carries (one snapshot, shared — no second copy),
  5. record the age profile of the day's historical memory, descriptively,
  6. and, for the standout year only, publish the EVIDENCE from the same rows:
     GDELT's theme codes (column 7), the persons and organisations it extracted
     (11, 13), the real headlines of the invoking articles (PAGE_TITLE in 26),
     and the anniversary arithmetic. See why_block().

THE 2014 WALL (inherited, not ours). GDELT's extractor emits no year >= 2015 —
measured on the spike day as a clean cliff (2014: 1,736 mentions, 2015 and later:
zero) and re-measured here every night as `max_year_observed`. The instrument's
scope is therefore the press's memory of 1800–2014. Recent-decade invocation is
not available from this field and is NOT substituted from anywhere else: a
title-level extraction would be a different population, and blending populations
is how instruments start lying.

WHAT v1 DOES NOT CLAIM. Candia's biexponential decay law is this instrument's test
hypothesis, and testing it needs a time series this archive does not have on its
first day. `law_test` therefore ships as `pending`, saying what it still lacks.
The tracked-event register is likewise NOT founded on day one: this instrument's
first run fell on 15 August, and a single-day rule would have frozen India's
independence dates into the register as though they were the world's canon. It is
founded from the first REGISTER_MIN_DAYS of archive instead, and carries the
selection effect it cannot escape — the events were chosen *because* they were the
founding window's most-invoked dates, so that window is excluded from any fit.

WHY, WITH RECEIPTS — AND STILL NO NAMING (v1.1). v1 computed the standout year
carefully and then said nothing about why it stood out, on the grounds that the
instrument counts dates rather than events. That was one step too far: the reason
is measurable and sits in the same rows. What stays refused is the naming — this
file never asserts that 1947 means Indian independence, because no committed byte
supports it. It publishes the headlines that say so, and lets the reader read.

THE HEADLINE IS NOT THE MAXIMUM. The most-invoked year is almost always 2014, the
ceiling: attention decays with age, so the ramp is the law rather than the news.
The published finding is the year that BREAKS the ramp — see standout().

Output: src/data/invoked/latest.json (+ archive <date>.json). Git is the archive;
committed day files are immutable (main() refuses to overwrite).
"""
import csv
import html
import io
import json
import re
import sys
import time
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

METHOD_VERSION = "v1.1"
METHOD_SINCE = "2026-08-15"
# v1.1, same day: v1 found the standout year and then refused to say anything about WHY it
# stood out — an over-application of the no-unsourced-claims rule to evidence that lies in
# the very same rows. The finding is unchanged; the day now also carries the themes, names
# and headlines of the articles that did the invoking. The line that stays: this instrument
# never NAMES the event. It shows what the press wrote, and the reader reads it.
SLOTS_PER_DAY = 96
YEAR_MIN = 1800           # rule (a): plausible window; below this the field is noise
SELF_REF_DAYS = 2         # rule (b): drop the article's own publication date +/- this
REGISTER_SIZE = 20        # tracked-event register, frozen once founded
REGISTER_MIN_DAYS = 30    # ... and not founded before the archive has this many days
TOP_YEARS = 40            # years carried with a source-country split
EXACT_DATES_TOP = 200     # exact dates carried per day, so the register founding is reproducible
MIN_COUNTRY_SHARE = 3     # a country needs this many mentions of a year to be named
HEADLINES_PER_YEAR = 24   # evidence buffer per year; only the standout's survive into the file
WHY_MIN_ARTICLES = 15     # absolute floor, so a thin day cannot rank on two articles
WHY_MIN_SHARE = 0.08      # ... and a theme must reach this share of the year's articles.
                          # Lift alone crowns rarity: on 2026-08-15 an unfiltered ranking
                          # returned snow leopards and warts, each sitting on ~23 syndicated
                          # articles. With the share floor the same day returns Indians,
                          # sovereignty, Bharat, refugees, citizens, democracy.
WHY_MIN_LIFT = 2.0        # and be at least twice as common here as across the day
WHY_THEMES = 8            # themes, names and headlines published beside the standout
WHY_PERSONS = 6
WHY_HEADLINES = 5
STANDOUT_WINDOW = 5       # +/- years of neighbours forming a year's local baseline
STANDOUT_FLOOR = 30       # a year needs this many mentions before it can be the standout
STANDOUT_MIN_RATIO = 2.0  # ... and must at least double its neighbourhood, or it is just a big year

# Rule (d): years the spike's false-positive review found to be systematically wrong.
# The 2026-08-14 review inspected eight random samples and found all eight genuine, so
# v1 ships EMPTY on purpose. An empty stoplist is a measured result, not an oversight;
# entries get added only with the sample that justifies them.
STOPLIST_YEARS: set[int] = set()
STOPLIST_REASON = "empty in v1 — the 2026-08-14 false-positive review found no systematic offender"

# Measured against live GKG 2.1 data on 2026-08-15; GDELT's own codebook numbers these
# differently, so the mapping is stated here rather than assumed.
PAGE_TITLE = re.compile(r"<PAGE_TITLE>(.*?)</PAGE_TITLE>", re.S)

RESOLUTION = {"1": "year_only", "2": "month_year", "3": "full_date", "4": "month_day_no_year"}
YEAR_BEARING = {"1", "2", "3"}

RULES = {
    "a_year_window": f"year-resolution mentions only, {YEAR_MIN}..current year",
    "b_self_reference": f"drop dates equal to the article's own publication date +/- {SELF_REF_DAYS} days",
    "c_per_article_dedup": "identical dates counted once per article",
    "d_stoplist": STOPLIST_REASON,
}

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "data" / "invoked"
# Shared with The Balance: one committed GDELT snapshot, not two.
LOOKUP_CSV = Path(__file__).resolve().parents[1] / "balance" / "sources_by_country.csv"

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


def parse_dates(field: str) -> list[tuple[str, int, int, int]]:
    """`resolution#month#day#year#offset;...` -> [(resolution, month, day, year)]."""
    out = []
    for block in field.split(";"):
        parts = block.split("#")
        if len(parts) < 5 or parts[0] not in RESOLUTION:
            continue
        try:
            month, day, year = int(parts[1]), int(parts[2]), int(parts[3])
        except ValueError:
            continue
        out.append((parts[0], month, day, year))
    return out


def article_day(v21date: str) -> datetime | None:
    """The article's own publication slot, for the self-reference rule."""
    try:
        return datetime.strptime(v21date[:8], "%Y%m%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def harvest(lookup: dict) -> tuple[dict, dict]:
    """One pass over the day's slots. Returns aggregates and the disclosure stats."""
    slots = last_slots()
    this_year = datetime.now(timezone.utc).year

    seen_urls: set[str] = set()
    years = Counter()                                   # invoked year -> mentions
    year_by_country: dict[int, Counter] = defaultdict(Counter)
    exact_dates = Counter()                             # (y, m, d) -> mentions
    resolutions = Counter()
    removed = Counter()
    themes_overall = Counter()
    articles_with_themes = 0
    evidence: dict[int, dict] = defaultdict(
        lambda: {"articles": 0, "themes": Counter(), "persons": Counter(),
                 "orgs": Counter(), "headlines": []})
    max_year_observed = 0
    articles_scanned = 0
    articles_with_dates = 0
    articles_mapped = 0
    missing: list[str] = []

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
                    articles_scanned += 1
                    field = cols[16].strip()
                    if not field:
                        continue
                    articles_with_dates += 1
                    src = lookup.get(cols[3].lower())
                    if src:
                        articles_mapped += 1
                    pub = article_day(cols[1])

                    kept: set[tuple[str, int, int, int]] = set()
                    for res, month, day, year in parse_dates(field):
                        resolutions[RESOLUTION[res]] += 1
                        if year > max_year_observed:
                            max_year_observed = year
                        if res not in YEAR_BEARING:
                            removed["a_no_year_resolution"] += 1
                            continue                     # rule (a): needs a year
                        if not (YEAR_MIN <= year <= this_year):
                            removed["a_year_window"] += 1
                            continue
                        if year in STOPLIST_YEARS:
                            removed["d_stoplist"] += 1
                            continue
                        if pub and res == "3" and 1 <= month <= 12 and 1 <= day <= 31:
                            try:
                                ref = datetime(year, month, day, tzinfo=timezone.utc)
                            except ValueError:
                                ref = None
                            if ref and abs((ref - pub).days) <= SELF_REF_DAYS:
                                removed["b_self_reference"] += 1
                                continue
                        if (res, month, day, year) in kept:
                            removed["c_per_article_dedup"] += 1
                            continue
                        kept.add((res, month, day, year))

                    for res, month, day, year in kept:
                        years[year] += 1
                        if src:
                            year_by_country[year][src] += 1
                        if res == "3" and 1 <= month <= 12 and 1 <= day <= 31:
                            exact_dates[(year, month, day)] += 1

                    article_themes = {t.split(",")[0] for t in cols[7].split(";") if t}
                    if article_themes:
                        articles_with_themes += 1
                        themes_overall.update(article_themes)
                    exact_years = {y for r, _, _, y in kept if r == "3"}

                    # Evidence for the standout, gathered in the same pass because it lives in
                    # the same rows: the themes, names and headlines of the articles that did
                    # the invoking. Which year turns out to be the standout is only known at
                    # the end, so every year carries a buffer and all but one are discarded.
                    for year in {y for _, _, _, y in kept}:
                        ev = evidence[year]
                        ev["articles"] += 1
                        for t in article_themes:
                            ev["themes"][t] += 1
                        for p in cols[11].split(";"):
                            if p:
                                ev["persons"][p] += 1
                        for o in cols[13].split(";"):
                            if o:
                                ev["orgs"][o] += 1
                        if len(ev["headlines"]) < HEADLINES_PER_YEAR:
                            t = PAGE_TITLE.search(cols[26])
                            if t:
                                title = html.unescape(t.group(1)).strip()
                                if title:
                                    ev["headlines"].append(
                                        {"domain": cols[3], "title": title[:180], "url": cols[4],
                                         "exact": year in exact_years})
        if (k + 1) % 16 == 0:
            print(f"  {k + 1}/{len(slots)} slots, {sum(years.values())} mentions", file=sys.stderr)
        time.sleep(0.3)

    agg = {
        "years": years,
        "year_by_country": year_by_country,
        "exact_dates": exact_dates,
        "resolutions": resolutions,
        "evidence": evidence,
        "themes_overall": themes_overall,
        "articles_with_themes": articles_with_themes,
    }
    stats = {
        "mentions_raw": sum(resolutions.values()),
        "articles_scanned": articles_scanned,
        "articles_with_dates": articles_with_dates,
        "articles_with_dates_share": round(articles_with_dates / max(1, articles_scanned), 4),
        "articles_country_mapped": articles_mapped,
        "mentions_kept": sum(years.values()),
        "mentions_removed": dict(sorted(removed.items())),
        "resolutions": dict(sorted(resolutions.items())),
        "max_year_observed": max_year_observed,
        "slots_expected": len(slots),
        "slots_fetched": len(slots) - len(missing),
        "slots_missing": missing,
        "window": f"{slots[0]} .. {slots[-1]} UTC" if slots else "",
    }
    return agg, stats


def load_register() -> dict | None:
    """The frozen tracked-event register, or None before it is founded."""
    path = OUT_DIR / "register.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def archive_days() -> list[Path]:
    """Committed day files, oldest first. `latest.json` and `register.json` are not days."""
    return sorted(p for p in OUT_DIR.glob("????-??-??.json"))


def maybe_found_register(day: str) -> dict | None:
    """Found the tracked-event register from the archive — never from a single day.

    Founding on one day would freeze whatever that day happened to commemorate: this
    instrument's first run fell on 15 August, and a single-day rule would have carried
    India's independence dates into the register as if they were the world's canon. The
    register is therefore founded only once REGISTER_MIN_DAYS of archive exist, from the
    summed exact-date counts across them — reproducible by anyone from the committed files,
    because every day file carries its own `exact_dates_top`.
    """
    days = archive_days()
    if len(days) < REGISTER_MIN_DAYS:
        return None
    totals = Counter()
    for p in days:
        rec = json.loads(p.read_text(encoding="utf-8"))
        for entry in rec.get("exact_dates_top", []):
            totals[entry["date"]] += entry["mentions"]
    ranked = sorted(totals.items(), key=lambda kv: (-kv[1], kv[0]))[:REGISTER_SIZE]
    return {
        "founded": day,
        "rule": (f"the {REGISTER_SIZE} exact dates most invoked across the archive's first "
                 f"{len(days)} days, ties to the earlier date; frozen on founding, never re-ranked"),
        "founding_window": [days[0].stem, days[-1].stem],
        "selection_effect": (
            "These events were selected BECAUSE they were the most-invoked exact dates of the "
            "founding window. That window is therefore not a valid observation of their decay and "
            "is excluded from any fit; the series starts the day after founding."),
        "events": [{"date": d, "founding_mentions": n} for d, n in ranked],
    }


def build(agg: dict, stats: dict, names: dict, day: str, register: dict | None) -> dict:
    years: Counter = agg["years"]
    total = sum(years.values())
    per_k = (lambda n: round(n / max(1, stats["articles_scanned"]) * 1000, 3))

    top = sorted(years.items(), key=lambda kv: (-kv[1], kv[0]))[:TOP_YEARS]
    top_years = []
    for year, n in top:
        countries = [
            {"fips": f, "name": names.get(f, f), "mentions": c}
            for f, c in sorted(agg["year_by_country"][year].items(), key=lambda kv: (-kv[1], kv[0]))
            if c >= MIN_COUNTRY_SHARE
        ][:6]
        top_years.append({
            "year": year,
            "mentions": n,
            "per_1000_articles": per_k(n),
            "share": round(n / max(1, total), 4),
            "invoked_by": countries,
        })

    this_year = datetime.strptime(day, "%Y-%m-%d").year
    ages = Counter()
    for year, n in years.items():
        ages[this_year - year] += n
    buckets = [(0, 10), (11, 25), (26, 50), (51, 100), (101, 200), (201, 10_000)]
    age_profile = [
        {"from": lo, "to": (None if hi > 9_999 else hi),
         "mentions": sum(n for a, n in ages.items() if lo <= a <= hi),
         "share": round(sum(n for a, n in ages.items() if lo <= a <= hi) / max(1, total), 4)}
        for lo, hi in buckets
    ]

    tracked = None
    if register:
        counts = {e["date"]: 0 for e in register["events"]}
        for (y, m, d), n in agg["exact_dates"].items():
            key = f"{y:04d}-{m:02d}-{d:02d}"
            if key in counts:
                counts[key] = n
        tracked = {
            "founded": register["founded"],
            "founding_day_excluded": register["founded"] == day,
            "events": [{"date": e["date"], "mentions": counts[e["date"]],
                        "age_years": this_year - int(e["date"][:4])} for e in register["events"]],
        }

    head = standout(years, agg["year_by_country"], names, per_k)
    if head:
        head["why"] = why_block(head["year"], agg, day)

    return {
        "headline": head,
        "most_invoked": ({"year": top[0][0], "mentions": top[0][1],
                          "per_1000_articles": per_k(top[0][1])} if top else None),
        "years": [{"year": y, "mentions": n} for y, n in sorted(years.items())],
        "top_years": top_years,
        "age_profile": age_profile,
        "exact_dates_top": [
            {"date": f"{y:04d}-{m:02d}-{d:02d}", "mentions": n}
            for (y, m, d), n in sorted(agg["exact_dates"].items(), key=lambda kv: (-kv[1], kv[0]))[:EXACT_DATES_TOP]
        ],
        "tracked_events": tracked,
        "law_test": law_test_block(register, day),
    }


def standout(years: Counter, by_country: dict, names: dict, per_k) -> dict | None:
    """The day's finding: the year that stands out from the smooth decay of memory.

    The most-invoked year is not a finding — it is almost always the most recent year the
    extractor emits (2014, the inherited ceiling), because attention decays with age and the
    ramp is the law, not the news. What IS a finding on a single day is the year that breaks
    the ramp: one whose invocation towers over its own immediate neighbourhood, measured
    against the median of the +/- STANDOUT_WINDOW years around it, itself excluded.

    Scored by excess over that baseline in units of its own square root — a Poisson-style
    surprise — and NOT by plain ratio. A ratio alone crowns whatever sits in the thinnest
    neighbourhood: on this instrument's first day it preferred 1810 (73 mentions against a
    median of 6.5, and 65 of those 73 from a single country) to 1947 (915 against 113) on
    the anniversary of Indian independence. A year must still at least double its
    neighbourhood, so volume alone cannot win either. Ties break to the earlier year, so
    the rule is total.
    """
    if not years:
        return None
    # The domain's edges cannot be judged. Beyond the inherited 2014 ceiling every year is
    # structurally zero, so without this guard the ceiling year towers over a half-empty
    # neighbourhood and the headline becomes the artefact this measure exists to avoid.
    lo, hi = min(years), max(years)
    candidates = []
    for year, n in years.items():
        if n < STANDOUT_FLOOR:
            continue
        if year - STANDOUT_WINDOW < lo or year + STANDOUT_WINDOW > hi:
            continue
        neighbours = sorted(
            years.get(y, 0) for y in range(year - STANDOUT_WINDOW, year + STANDOUT_WINDOW + 1) if y != year
        )
        if not neighbours:
            continue
        mid = len(neighbours) // 2
        baseline = (neighbours[mid] if len(neighbours) % 2
                    else (neighbours[mid - 1] + neighbours[mid]) / 2)
        if baseline < 1 or n / baseline < STANDOUT_MIN_RATIO:
            continue
        candidates.append((round((n - baseline) / baseline ** 0.5, 1), -year, year, n, baseline))
    if not candidates:
        return None
    surprise, _, year, n, baseline = max(candidates)
    countries = by_country.get(year) or {}
    invoked_by = [
        {"fips": f, "name": names.get(f, f), "mentions": c}
        for f, c in sorted(countries.items(), key=lambda kv: (-kv[1], kv[0]))
        if c >= MIN_COUNTRY_SHARE
    ]
    mapped = sum(countries.values())
    return {
        "year": year,
        "mentions": n,
        "per_1000_articles": per_k(n),
        "neighbourhood_median": round(baseline, 1),
        "times_its_neighbourhood": round(n / baseline, 2),
        "surprise": surprise,
        # A year carried by a single country is more often an extraction artefact than a
        # memory: published so a reader can discount it without being told to.
        "top_country_share": (round(invoked_by[0]["mentions"] / mapped, 3) if invoked_by and mapped else None),
        "invoked_by": invoked_by[:6],
    }


def why_block(year: int, agg: dict, day: str) -> dict:
    """What the press was actually writing when it invoked this year.

    Everything here is measured from the same rows as the count: GDELT's own theme codes
    (column 7), the persons and organisations it extracted (11 and 13), and the real
    headlines of the articles (PAGE_TITLE in column 26). The anniversary flag is arithmetic
    — the most-invoked exact date inside the year against the record's own date — not a
    lookup.

    What this deliberately does NOT do is name the event. Calling 1947 "Indian
    independence" would be the one claim in this file that no committed byte supports; the
    receipts are published instead, and naming what they show is the reader's move. That is
    the difference between an instrument that shows its evidence and an oracle.
    """
    ev = agg["evidence"].get(year)
    inside = sorted(
        (((y, m, d), n) for (y, m, d), n in agg["exact_dates"].items() if y == year),
        key=lambda kv: (-kv[1], kv[0]),
    )
    top_dates = [{"date": f"{y:04d}-{m:02d}-{d:02d}", "mentions": n} for (y, m, d), n in inside[:5]]

    anniversary = None
    if top_dates:
        (y, m, d), n = inside[0]
        anniversary = {
            "date": top_dates[0]["date"],
            "mentions": n,
            "matches_today": f"{m:02d}-{d:02d}" == day[5:],
            "today": day,
        }

    if not ev:
        return {"articles": 0, "top_exact_dates": top_dates, "anniversary": anniversary,
                "themes": [], "persons": [], "organisations": [], "headlines": []}

    n_art = max(1, ev["articles"])
    return {
        "articles": ev["articles"],
        "top_exact_dates": top_dates,
        "anniversary": anniversary,
        # Ranked by LIFT, not by frequency: the commonest codes on any day are GDELT's
        # generic ones (TAX_FNCACT and friends), which say nothing about this year. Lift
        # asks how much MORE common a theme is among the articles invoking this year than
        # across the day's articles overall — a measure, so no curated stoplist is needed
        # and nothing is quietly dropped.
        "themes": themes_by_lift(ev["themes"], agg["themes_overall"],
                                 ev["articles"], agg["articles_with_themes"]),
        "persons": [{"name": c, "articles": k} for c, k in ev["persons"].most_common(WHY_PERSONS)],
        "organisations": [{"name": c, "articles": k} for c, k in ev["orgs"].most_common(WHY_PERSONS)],
        # Articles that named a full date inside the year first: "15 August 1947" is more
        # on the subject than a passing "1947". Order within each group stays first-seen.
        "headlines": [{k: v for k, v in h.items() if k != "exact"}
                      for h in sorted(ev["headlines"], key=lambda h: not h["exact"])][:WHY_HEADLINES],
    }


def themes_by_lift(in_year: Counter, overall: Counter, n_year: int, n_day: int) -> list[dict]:
    """The themes that are distinctive of this year, not the ones that are everywhere."""
    out = []
    for code, k in in_year.items():
        share = k / max(1, n_year)
        base = overall.get(code, 0) / max(1, n_day)
        if k < WHY_MIN_ARTICLES or share < WHY_MIN_SHARE or base <= 0:
            continue
        lift = share / base
        if lift < WHY_MIN_LIFT:
            continue
        out.append({"code": code, "articles": k, "share": round(share, 3),
                    "lift": round(lift, 1)})
    out.sort(key=lambda t: (-t["lift"], -t["articles"], t["code"]))
    return out[:WHY_THEMES]


def law_test_block(register: dict | None, day: str) -> dict:
    """Candia's biexponential is the test hypothesis, and it needs a series. Saying so is
    the finding on day one; producing a number from a single day would be theatre."""
    if register is None:
        have = len(archive_days()) + 1   # + the day this run is about to commit
        return {
            "status": "pending",
            "hypothesis": "Candia et al. 2019, biexponential decay of collective attention",
            "reason": (f"the tracked-event register is not founded yet: it needs {REGISTER_MIN_DAYS} "
                       f"archived days so that no single day's anniversaries can define it, and the "
                       f"archive holds {have}"),
            "register_days_needed": REGISTER_MIN_DAYS,
            "register_days_have": have,
            "first_possible": None,
        }
    start = datetime.strptime(register["founded"], "%Y-%m-%d") + timedelta(days=1)
    have = (datetime.strptime(day, "%Y-%m-%d") - start).days + 1
    return {
        "status": "pending",
        "hypothesis": "Candia et al. 2019, biexponential decay of collective attention",
        "reason": ("a decay curve needs a time series; this archive has "
                   f"{max(0, have)} valid observation day(s) since the register was founded "
                   "(founding day excluded by its own selection effect)"),
        "first_possible": (start + timedelta(days=29)).strftime("%Y-%m-%d"),
        "valid_days_so_far": max(0, have),
    }


def method_block() -> dict:
    return {
        "version": METHOD_VERSION,
        "since": METHOD_SINCE,
        "field": "GDELT GKG 2.1 column 16, V2.1ENHANCEDDATES",
        "resolution_codes": RESOLUTION,
        "rules": RULES,
        "stoplist_years": sorted(STOPLIST_YEARS),
        "year_window": [YEAR_MIN, "current year"],
        "register_size": REGISTER_SIZE,
        "register_min_days": REGISTER_MIN_DAYS,
        "standout": (f"the published finding is the year that most exceeds the median of the "
                     f"+/-{STANDOUT_WINDOW} years around it, scored as excess over that baseline in "
                     f"units of its square root (floor {STANDOUT_FLOOR} mentions, and at least "
                     f"{STANDOUT_MIN_RATIO}x the neighbourhood). Years within {STANDOUT_WINDOW} of "
                     f"the observed range's edges are not eligible, because beyond the inherited "
                     f"ceiling every year is structurally zero and the edge would always look "
                     f"surprising. Not the most-invoked year: that is the ceiling, not a finding. "
                     f"Not a plain ratio either: that crowns the thinnest neighbourhood."),
        "inherited_ceiling": (
            "GDELT's extractor emits no year >= 2015 (measured as a clean cliff on 2026-08-14 and "
            "re-measured nightly as max_year_observed). The instrument's scope is the press's "
            "memory of 1800-2014; recent-decade invocation is not available from this field and is "
            "not substituted from another population."),
        "why": ("beside the standout year the file publishes the evidence for it, all measured "
                "from the same rows: GDELT theme codes, extracted persons and organisations, the "
                "headlines of the invoking articles, and the anniversary arithmetic (the year's "
                "most-invoked exact date against the record's own date). The event is never "
                "named here — the receipts are shown and the naming is the reader's."),
        "stream": "GDELT English-monitored GKG 2.1 (translation stream not fetched — disclosed on the page)",
    }


def source_block(now: datetime) -> dict:
    return {
        "name": "GDELT Project — GKG 2.1 raw files (V2.1ENHANCEDDATES) + sourcesbycountry lookup",
        "url": "https://www.gdeltproject.org/",
        "license": "Open with attribution (citation + link)",
        "retrieved_utc": now.isoformat(timespec="seconds"),
    }


def main() -> int:
    lookup, names = load_lookup()
    agg, stats = harvest(lookup)
    now = datetime.now(timezone.utc)
    day = now.strftime("%Y-%m-%d")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    day_file = OUT_DIR / f"{day}.json"
    if day_file.exists():
        print(f"refusing to overwrite committed archive file {day_file.name}", file=sys.stderr)
        return 1

    if stats["slots_fetched"] == 0:
        record = {
            "generated_at": now.isoformat(timespec="seconds"), "date": day,
            "method": method_block(), "headline": None, "most_invoked": None, "years": [],
            "top_years": [], "age_profile": [], "exact_dates_top": [], "tracked_events": None,
            "law_test": {"status": "pending", "reason": "source unreachable"},
            "stats": stats, "source": source_block(now),
            "note": "Source unreachable — finding omitted (a gap is a gap, never bridged).",
        }
    else:
        register = load_register()
        if register is None:
            register = maybe_found_register(day)
            if register is not None:
                (OUT_DIR / "register.json").write_text(json.dumps(register, indent=1, ensure_ascii=False) + "\n")
                print(f"  founded tracked-event register: {len(register['events'])} events", file=sys.stderr)
        record = {"generated_at": now.isoformat(timespec="seconds"), "date": day,
                  "method": method_block()} | build(agg, stats, names, day, register) | {
            "stats": stats, "source": source_block(now)}

    day_file.write_text(json.dumps(record, indent=1, ensure_ascii=False) + "\n")
    (OUT_DIR / "latest.json").write_text(json.dumps(record, indent=1, ensure_ascii=False) + "\n")
    head = record.get("headline")
    print(f"INVOKED {day}: {len(record.get('years', []))} distinct years, "
          f"{stats['mentions_kept']} mentions, headline={head['year'] if head else 'none'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
