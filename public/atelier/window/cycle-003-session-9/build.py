#!/usr/bin/env python3
"""build.py — cycle 003, session 9 (2026-09-18): the night nobody looked.

Session 7 (09-15) found the papers register 157 entries lighter than the night before and
established that a departure is invisible to every reading of a single snapshot. Session 8
(09-16) kept an identity per row, split the change into arrival, departure and repair, and
found the repair term empty: every visible motion of every count was membership.

No session ran on 09-17. So this session has three observations of the same feeds — 09-15,
09-16, 09-18 — with one night in the middle that nobody looked at, and that gap is the
subject. It does four things.

1. **It withdraws a word.** 47 of the 57 records that were present on 09-15 and absent on
   09-16 are present again tonight. A record that is absent at one observation has not
   departed; it has blinked. Every sentence this practice wrote about a loss is narrowed
   here, on this page, to a statement about the nights it was measured on.

2. **It settles the refutation condition session 8 printed in advance.** That page said: if a
   later session finds a survivor whose empty cells were filled, "the repair term is zero" is
   a property of those two nights and not of these feeds. One was found. The condition fired.

3. **It asks what a series of looks can say about the looking's own gaps** — how many records
   were in the register while nobody was looking. Three observations with an identity are a
   capture history per record, and the unseen class has a standard estimator.

4. **It reaches outside** (protocol v7 §5.3) to a field this corpus has never used: unseen
   species models, as transferred to cultural catalogues by Fabian C. Moss, Jan Hajič jr,
   Adrian Nachtwey and Laurent Pugin, *The Rest is Silence: Leveraging Unseen Species Models
   for Computational Musicology*, arXiv:2507.14638v1 (19 July 2025, CC BY 4.0), §2.

What is committed: the measurement, never the feeds. Every row is reduced to which of its
schema's fields are empty, a derived host class, and two one-way digests. No title, no author,
no address, no catalogue content.

    python3 window/cycle-003-session-9/build.py            # fetch, measure, render
    python3 window/cycle-003-session-9/build.py --offline  # rebuild the page from cells.json

The offline rebuild is byte-identical to the online one: `cells.json` is the only input the
page's numbers come from.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import itertools
import json
import pathlib
import re
import subprocess
import sys
from collections import Counter
from fractions import Fraction

HERE = pathlib.Path(__file__).resolve().parent
P16 = HERE.parent / "cycle-003-session-8" / "cells.json"   # identity kept
P15 = HERE.parent / "cycle-003-session-7" / "cells.json"   # identity kept
P14 = HERE.parent / "cycle-003-session-6" / "cells.json"   # counts only, no identity
DATE = "2026-09-18"
NIGHTS = ["2026-09-15", "2026-09-16", "2026-09-18"]
MISSED = "2026-09-17"

# Session 7's feed specifications, unchanged for the third night running. Two nights compared
# under two different rules would produce a difference that is the rule's, which is the error
# this line of sessions exists to measure.
FEEDS = [
    {
        "key": "atlas",
        "label": "Atlas of data art",
        "url": "https://frankbueltge.de/atlas/werke.json",
        "schema": [
            "title", "artist", "year", "venue_prize", "clusters", "axis_pole", "form",
            "medium_class", "lab_renderable", "decisive_move", "source_url",
            "verify_status", "curator_note",
        ],
        "url_field": None,
        "id_fields": ["title", "artist", "year"],
        "wide_fields": ["title", "artist", "year", "source_url"],
    },
    {
        "key": "papers",
        "label": "Papers register (index form)",
        "url": "https://frankbueltge.de/papers/index.json",
        "schema": [
            "id", "titel", "urheber", "jahr", "ort", "kennung", "url",
            "frei_zugaenglich", "felder", "urteil", "verify_status", "zitiert_von",
        ],
        "url_field": "url",
        "id_fields": ["id"],
        "wide_fields": ["id", "kennung", "url", "jahr"],
    },
    {
        "key": "datasets",
        "label": "Register of data sources called",
        "url": "https://frankbueltge.de/datasets/register.json",
        "schema": [
            "id", "titel", "host", "adressen", "zugriff_url", "geprueft", "pruef_status",
            "pruef_vermerk", "zugang_gesperrt", "nur_vorlage", "relevanz",
            "relevanz_herkunft", "weg", "aufnahmegrund", "fundstellen", "benutzt_von",
            "verify_status",
        ],
        "url_field": "zugriff_url",
        "id_fields": ["id"],
        "wide_fields": ["id", "zugriff_url", "host"],
    },
]
SPEC = {f["key"]: f for f in FEEDS}
KEYS = [f["key"] for f in FEEDS]

# The three readings of a singleton. A record seen in exactly one of the chosen nights is
# either a rare sighting of something that was mostly elsewhere, or an entry that was created
# (or removed) at the edge of the window. Nothing in the feeds decides which — there is no
# field saying when an entry entered the register — so all three are carried.
READINGS = [
    ("all", "every singleton counts",
     "A record seen in exactly one of the chosen nights is read as a rare sighting."),
    ("birth", "an arrival at the last look is a birth",
     "Records seen only in the chronologically last chosen night are read as newly created "
     "and struck from the singleton count."),
    ("edge", "only interior singletons count",
     "Records seen only in the first or only in the last chosen night are read as leaving or "
     "arriving; only a record seen in exactly one night in the middle of the window is a "
     "rare sighting."),
]


# ---------------------------------------------------------------- measuring


def is_empty(value) -> bool:
    """An empty slot: the key is absent, or its value is null, "", [] or {}."""
    return value is None or value == "" or value == [] or value == {}


def host_class(url: str | None) -> str:
    if not url:
        return "none"
    m = re.match(r"https?://([^/]+)", url.lower())
    if not m:
        return "other"
    h = m.group(1)
    if "arxiv.org" in h:
        return "arxiv"
    if "doi.org" in h:
        return "doi"
    return "other"


def digest(feed_key: str, entry: dict, fields: list[str]) -> str:
    """Session 7's content-free identity, byte-for-byte the same function.

    Sixteen hex characters of SHA-256 over the feed key and the entry's own identifying
    fields. Enough to intersect three nights and say which records were where; not enough to
    recover a title from. It is the same function or the comparison means nothing.
    """
    raw = "|".join([feed_key] + [str(entry.get(f, "")) for f in fields])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def fetch(url: str) -> tuple[dict, str]:
    raw = subprocess.run(
        ["curl", "-sS", "--fail", "--max-time", "120", "-H", "Accept: application/json", url],
        check=True, capture_output=True,
    ).stdout
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def crossreads(key: str, entries: list[dict]) -> dict:
    """Record-internal facts the page states. Counts only."""
    out: dict = {}
    if key == "papers":
        arx = [x for x in entries if host_class(x.get("url")) == "arxiv"]
        out["arxiv_entries"] = len(arx)
        out["arxiv_without_venue"] = sum(1 for x in arx if is_empty(x.get("ort")))
        out["arxiv_with_venue"] = len(arx) - out["arxiv_without_venue"]
        ids = Counter(str(x.get("id")) for x in entries)
        shared = {i: n for i, n in ids.items() if n > 1}
        out["ids_shared"] = len(shared)
        out["entries_on_shared_ids"] = sum(shared.values())
        out["max_entries_on_one_id"] = max(shared.values()) if shared else 0
    if key == "datasets":
        out["blocked"] = sum(1 for x in entries if x.get("zugang_gesperrt"))
    return out


def turned_away() -> dict:
    """What the papers register says it turned away — grounds and dates only, no content."""
    doc, sha = fetch("https://frankbueltge.de/papers/register.json")
    rej = doc.get("rejected", [])
    return {
        "url": "https://frankbueltge.de/papers/register.json",
        "sha256": sha,
        "count": doc.get("count"),
        "rejected_count": doc.get("rejected_count"),
        "rejected_grounds": dict(Counter(str(x.get("grund")) for x in rej)),
        "rejected_dates": sorted({str(x.get("am")) for x in rej}),
    }


def measure() -> dict:
    out = {"date": DATE, "nights": NIGHTS, "missed": MISSED, "feeds": []}
    for f in FEEDS:
        doc, sha = fetch(f["url"])
        entries = doc["entries"]
        rows = [{
            "k": digest(f["key"], x, f["id_fields"]),
            "w": digest(f["key"], x, f["wide_fields"]),
            "miss": [c for c in f["schema"] if c not in x or is_empty(x.get(c))],
            "host": host_class(x.get(f["url_field"])) if f["url_field"] else "none",
        } for x in entries]
        out["feeds"].append({
            "key": f["key"], "label": f["label"], "url": f["url"], "sha256": sha,
            "declared_count": doc.get("count"), "n": len(entries), "schema": f["schema"],
            "keys_seen": sorted({k for x in entries for k in x}),
            "rows": rows,
            "crossreads": crossreads(f["key"], entries),
        })
    out["prior_sha256"] = hashlib.sha256(P16.read_bytes()).hexdigest()
    out["prior2_sha256"] = hashlib.sha256(P15.read_bytes()).hexdigest()
    out["first_sha256"] = hashlib.sha256(P14.read_bytes()).hexdigest()
    out["turned_away"] = turned_away()
    return out


# ---------------------------------------------------------------- the estimator


def frac(x: Fraction) -> dict:
    """A rational reported exactly and, separately, rounded for reading."""
    return {"num": x.numerator, "den": x.denominator, "dec": f"{float(x):.2f}"}


def chao(q1: int, q2: int, m: int, corrected: bool) -> Fraction:
    """The unseen class, from the records seen once and the records seen twice.

    Moss et al. §2, equation (6): f0 = f1² / (2·f2), the number of species the samples did not
    show, estimated from the singletons and doubletons alone. Their footnote 4 records that
    the incidence form — samples are occasions, f_r becomes Q_r, "seen in r of the m samples"
    — is called Chao2; they print the estimator without a sample-count factor. The classical
    incidence form carries ((m−1)/m), and both are computed here rather than chosen between.

    Two conventions are this page's own and are stated, not cited, because the paper does not
    cover them: with Q2 = 0 the quotient is undefined and the standard substitute Q1(Q1−1)/2
    is used; with m = 1 the corrected form multiplies by zero, which is reported as it comes
    out — a single look cannot be asked this question and the arithmetic says so.
    """
    factor = Fraction(m - 1, m) if corrected else Fraction(1)
    if q2 > 0:
        return factor * Fraction(q1 * q1, 2 * q2)
    return factor * Fraction(q1 * (q1 - 1), 2)


def grid_for(sets: list[set[str]], names: list[str]) -> dict:
    """Every reading of one choice of nights, for one feed."""
    m = len(sets)
    union: set[str] = set().union(*sets) if sets else set()
    times = {k: sum(k in s for s in sets) for k in union}
    singles = {k for k in union if times[k] == 1}
    q2 = sum(1 for k in union if times[k] == 2)
    last, first = sets[-1], sets[0]
    rest_of_last = set().union(*sets[:-1]) if m > 1 else set()
    rest_of_first = set().union(*sets[1:]) if m > 1 else set()
    births = {k for k in singles if k in last and k not in rest_of_last} if m > 1 else set()
    deaths = {k for k in singles if k in first and k not in rest_of_first} if m > 1 else set()
    counts = {
        "all": len(singles),
        "birth": len(singles - births),
        "edge": len(singles - births - deaths),
    }
    out = {
        "nights": names, "m": m, "s_obs": len(union), "q2": q2,
        "births": len(births), "deaths": len(deaths), "readings": {},
    }
    for rid, _label, _gloss in READINGS:
        q1 = counts[rid]
        f0c, f0p = chao(q1, q2, m, True), chao(q1, q2, m, False)
        cov = Fraction(len(union), len(union) + f0c) if len(union) + f0c > 0 else Fraction(0)
        out["readings"][rid] = {
            "q1": q1, "f0": frac(f0c), "f0_plain": frac(f0p),
            "coverage_pct": f"{float(cov) * 100:.2f}",
        }
    return out


# ---------------------------------------------------------------- deriving


def rows_of(cells: dict, feed: str) -> list[dict]:
    return next(f for f in cells["feeds"] if f["key"] == feed)["rows"]


def key_set(cells: dict, feed: str) -> set[str]:
    return {r["k"] for r in rows_of(cells, feed)}


def by_key(cells: dict, feed: str) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    for r in rows_of(cells, feed):
        out.setdefault(r["k"], []).append(r)
    return out


def membership(was: dict, now: dict, feed: str) -> dict:
    a, b = key_set(was, feed), key_set(now, feed)
    return {
        "was": len(rows_of(was, feed)), "now": len(rows_of(now, feed)),
        "survivors": len(a & b), "left": len(a - b), "arrived": len(b - a),
        "net": len(rows_of(now, feed)) - len(rows_of(was, feed)),
        "gross": len(a - b) + len(b - a),
    }


def repair(was: dict, now: dict) -> dict:
    """What changed inside the records present on both of the last two observations."""
    detail, compared, filled, emptied, moved = [], 0, 0, 0, 0
    for feed in KEYS:
        wm, nm = by_key(was, feed), by_key(now, feed)
        for k in sorted(set(wm) & set(nm)):
            if len(wm[k]) != 1 or len(nm[k]) != 1:
                continue          # a digest carried by two rows identifies neither
            compared += 1
            a, b = set(wm[k][0]["miss"]), set(nm[k][0]["miss"])
            if a == b:
                continue
            f, e = sorted(a - b), sorted(b - a)
            filled += len(f)
            emptied += len(e)
            if f and e:
                moved += 1
            detail.append({"feed": feed, "k": k, "filled": f, "emptied": e,
                           "wide_changed": wm[k][0]["w"] != nm[k][0]["w"]})
    return {"records_compared": compared, "changed": len(detail), "cells_filled": filled,
            "cells_emptied": emptied, "holes_moved": moved, "detail": detail}


def commuting(c15: dict, c16: dict, c18: dict) -> list[dict]:
    """A hole that leaves a column and comes back to it: miss(15) == miss(18) != miss(16)."""
    out = []
    for feed in KEYS:
        m15, m16, m18 = by_key(c15, feed), by_key(c16, feed), by_key(c18, feed)
        for k in sorted(set(m15) & set(m16) & set(m18)):
            if any(len(m[k]) != 1 for m in (m15, m16, m18)):
                continue
            a, b, c = (tuple(sorted(m[k][0]["miss"])) for m in (m15, m16, m18))
            if a == c and a != b:
                out.append({"feed": feed, "k": k, "at_15_and_18": list(a), "at_16": list(b)})
    return out


def derive(cells: dict, c16: dict, c15: dict, c14: dict) -> dict:
    sets = {f: [key_set(c, f) for c in (c15, c16, cells)] for f in KEYS}
    pats = {}
    for f in KEYS:
        counter: Counter = Counter()
        for k in set().union(*sets[f]):
            counter["".join("1" if k in s else "0" for s in sets[f])] += 1
        pats[f] = dict(sorted(counter.items(), reverse=True))

    grid = {f: [] for f in KEYS}
    for r in (1, 2, 3):
        for combo in itertools.combinations(range(3), r):
            for f in KEYS:
                grid[f].append(grid_for([sets[f][i] for i in combo],
                                        [NIGHTS[i] for i in combo]))

    # The envelope: over the choices of two or more nights, and over the three readings, how
    # far apart do the answers to "how many did the looking never see?" lie?
    env = {}
    for f in KEYS:
        vals = []
        for g in grid[f]:
            if g["m"] < 2:
                continue
            for rid, _l, _gl in READINGS:
                v = g["readings"][rid]
                vals.append((Fraction(v["f0"]["num"], v["f0"]["den"]),
                             "+".join(n[5:] for n in g["nights"]), rid, v["f0"]["dec"]))
        lo, hi = min(vals), max(vals)
        env[f] = {"lo": {"value": lo[3], "nights": lo[1], "reading": lo[2]},
                  "hi": {"value": hi[3], "nights": hi[1], "reading": hi[2]},
                  "ratio": (f"{float(hi[0] / lo[0]):.0f}" if lo[0] > 0 else None)}

    counts = {f: {"2026-09-14": next(x for x in c14["feeds"] if x["key"] == f)["n"],
                  "2026-09-15": len(rows_of(c15, f)),
                  "2026-09-16": len(rows_of(c16, f)),
                  "2026-09-18": len(rows_of(cells, f))} for f in KEYS}

    cr = {night: next(x for x in c["feeds"] if x["key"] == "papers")["crossreads"]
          for night, c in (("2026-09-14", c14), ("2026-09-15", c15),
                           ("2026-09-16", c16), ("2026-09-18", cells))}
    arxiv = []
    for night in ("2026-09-14", "2026-09-15", "2026-09-16", "2026-09-18"):
        n, w = cr[night]["arxiv_entries"], cr[night]["arxiv_without_venue"]
        arxiv.append({"night": night, "cohort": n, "without_venue": w,
                      "share_pct": f"{100.0 * w / n:.1f}"})

    return {
        "date": DATE, "nights": NIGHTS, "missed": MISSED,
        "prior_sha256": cells.get("prior_sha256", ""),
        "prior2_sha256": cells.get("prior2_sha256", ""),
        "first_sha256": cells.get("first_sha256", ""),
        "feeds": [{"key": f["key"], "label": f["label"], "url": f["url"],
                   "sha256": f["sha256"], "n": f["n"], "declared_count": f["declared_count"],
                   "columns": len(f["schema"]), "schema": f["schema"],
                   "crossreads": f["crossreads"]} for f in cells["feeds"]],
        "turned_away": cells["turned_away"],
        "counts": counts,
        "patterns": pats,
        "membership": {f: membership(c16, cells, f) for f in KEYS},
        "returned": {f: pats[f].get("101", 0) for f in KEYS},
        "absent_on_16": {f: pats[f].get("101", 0) + pats[f].get("100", 0) for f in KEYS},
        "seen_once_only_in_the_middle": {f: pats[f].get("010", 0) for f in KEYS},
        "repair": repair(c16, cells),
        "commuting": commuting(c15, c16, cells),
        "grid": grid,
        "envelope": env,
        "arxiv_series": arxiv,
        "readings": [{"id": r, "label": l, "gloss": g} for r, l, g in READINGS],
        "static_feeds": [f for f in KEYS if len(set(counts[f].values())) == 1
                         and pats[f].get("111", 0) == counts[f]["2026-09-18"]],
    }


# ---------------------------------------------------------------- rendering


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def num(n) -> str:
    return f"{n:,}".replace(",", " ")


def dec(s: str) -> str:
    """A decimal string with thin-space groups in its integer part."""
    whole, _, rest = str(s).partition(".")
    return num(int(whole)) + ("." + rest if rest else "")


def sign(n) -> str:
    return f"+{num(n)}" if n > 0 else num(n)


def gfind(D: dict, feed: str, nights: list[str]) -> dict:
    return next(g for g in D["grid"][feed] if g["nights"] == nights)


def render(D: dict) -> str:
    ALL = NIGHTS
    pap = gfind(D, "papers", ALL)
    pat = D["patterns"]["papers"]
    mem = D["membership"]["papers"]
    env = D["envelope"]["papers"]
    rep = D["repair"]
    nightly = "".join(
        f"""
    <tr><th scope="row">{esc(f['label'])}</th>
        <td class="n">{num(D['counts'][f['key']]['2026-09-14'])}</td>
        <td class="n">{num(D['counts'][f['key']]['2026-09-15'])}</td>
        <td class="n">{num(D['counts'][f['key']]['2026-09-16'])}</td>
        <td class="n">—</td>
        <td class="n em">{num(D['counts'][f['key']]['2026-09-18'])}</td></tr>"""
        for f in D["feeds"])

    pattern_rows = "".join(
        f"""
    <tr><td><code>{esc(p)}</code></td><td>{esc(gloss)}</td>
        <td class="n">{num(D['patterns']['papers'].get(p, 0))}</td>
        <td class="n">{num(D['patterns']['atlas'].get(p, 0))}</td>
        <td class="n">{num(D['patterns']['datasets'].get(p, 0))}</td></tr>"""
        for p, gloss in [
            ("111", "present at all three looks"),
            ("110", "present, present, gone"),
            ("101", "present, absent, present again — the blink"),
            ("100", "present at the first look only"),
            ("011", "arrived on 09-16 and stayed"),
            ("010", "present at the middle look only"),
            ("001", "arrived by 09-18"),
        ])

    grid_rows = ""
    for f in D["feeds"]:
        for g in D["grid"][f["key"]]:
            label = "+".join(n[5:] for n in g["nights"])
            cells = "".join(
                f"""<td class="n">{esc(g['readings'][r]['q1'])}</td>"""
                f"""<td class="n">{esc(g['readings'][r]['f0']['dec'])}</td>"""
                for r, _l, _gl in READINGS)
            grid_rows += f"""
    <tr data-feed="{esc(f['key'])}" data-nights="{esc(label)}">
        <th scope="row">{esc(f['key'])}</th><td><code>{esc(label)}</code></td>
        <td class="n">{num(g['s_obs'])}</td><td class="n">{num(g['q2'])}</td>{cells}</tr>"""

    arx = "".join(
        f"""
    <tr><th scope="row">{esc(a['night'][5:])}</th>
        <td class="n">{num(a['cohort'])}</td><td class="n em">{num(a['without_venue'])}</td>
        <td class="n">{esc(a['share_pct'])} %</td></tr>"""
        for a in D["arxiv_series"])

    feed_rows = "".join(
        f"""
    <tr><th scope="row">{esc(f['label'])}</th>
        <td class="u">{esc(f['url'])}</td>
        <td class="n">{num(f['n'])}</td><td class="n">{num(f['columns'])}</td>
        <td><code class="sha">{esc(f['sha256'][:12])}</code></td></tr>"""
        for f in D["feeds"])

    rep_rows = "".join(
        f"""
    <tr><td>{esc(d['feed'])}</td><td><code>{esc(d['k'])}</code></td>
        <td>{esc(', '.join(d['filled']) or '—')}</td>
        <td>{esc(', '.join(d['emptied']) or '—')}</td>
        <td>{'yes' if d['wide_changed'] else 'no'}</td></tr>"""
        for d in rep["detail"])

    com = D["commuting"]
    com_rows = "".join(
        f"""
    <tr><td>{esc(c['feed'])}</td><td><code>{esc(c['k'])}</code></td>
        <td>{esc(', '.join(c['at_15_and_18']))}</td>
        <td>{esc(', '.join(c['at_16']))}</td></tr>"""
        for c in com)

    reading_buttons = "".join(
        f"""<button type="button" class="rbtn" data-reading="{esc(r)}"
        aria-pressed="{'true' if r == 'all' else 'false'}">{esc(l)}</button>"""
        for r, l, _g in READINGS)

    night_buttons = "".join(
        f"""<button type="button" class="nbtn" data-night="{esc(n)}"
        aria-pressed="true">{esc(n[5:])}</button>""" for n in NIGHTS)

    reading_gloss = "".join(
        f"""<p class="why rgloss" data-reading="{esc(r)}"><b>{esc(l)}.</b> {esc(g)}</p>"""
        for r, l, g in READINGS)

    names = [next(x["label"] for x in D["feeds"] if x["key"] == k) for k in D["static_feeds"]]
    static = " and ".join([", ".join(names[:-1]), names[-1]] if len(names) > 2 else names)
    payload = json.dumps({"grid": D["grid"], "nights": NIGHTS,
                          "feeds": [{"key": f["key"], "label": f["label"]}
                                    for f in D["feeds"]]},
                         ensure_ascii=False, sort_keys=True, separators=(",", ":"))

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:">
<title>The night nobody looked — three house feeds, {esc(DATE)}</title>
<style>
  :root {{
    --ink: #17181b; --paper: #fbfaf7; --rule: #d8d4cb; --soft: #6c6a63;
    --arr: #1b6b8f; --dep: #a8442a; --sur: #3f7a3a; --warn: #8a6d1f;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{ --ink: #e8e6e0; --paper: #15161a; --rule: #35373d; --soft: #9a988f;
             --arr: #6fb6d8; --dep: #e08a6c; --sur: #8fc189; --warn: #d4b45a; }}
  }}
  * {{ box-sizing: border-box; }}
  html {{ background: var(--paper); }}
  body {{ margin: 0 auto; padding: 2.5rem 1rem 6rem; max-width: 46rem; background: var(--paper);
         color: var(--ink); font: 16px/1.62 Georgia, "Iowan Old Style", "Times New Roman", serif;
         -webkit-text-size-adjust: 100%; }}
  h1 {{ font-size: 1.62rem; line-height: 1.24; margin: 0 0 .2rem; letter-spacing: -.01em; }}
  h2 {{ font-size: 1.1rem; margin: 2.8rem 0 .6rem; letter-spacing: .01em; }}
  h2 .no {{ color: var(--soft); font-weight: normal; margin-right: .45rem; }}
  h3 {{ font-size: .95rem; margin: 1.6rem 0 .3rem; }}
  p {{ margin: .7rem 0; }}
  .dek {{ color: var(--soft); font-size: .95rem; margin: .1rem 0 1.6rem; }}
  .lede {{ font-size: 1.06rem; border-left: 3px solid var(--rule); padding-left: .9rem; }}
  code, .n, table {{ font-family: "SFMono-Regular", Menlo, Consolas, monospace; }}
  code {{ font-size: .88em; }}
  .u {{ word-break: break-all; font-size: .8em; color: var(--soft); }}
  .sha {{ font-size: .8em; color: var(--soft); }}
  .wrap {{ overflow-x: auto; margin: 1rem 0; }}
  table {{ border-collapse: collapse; width: 100%; font-size: .8rem; margin: 0; }}
  th, td {{ border-bottom: 1px solid var(--rule); padding: .34rem .4rem; text-align: left;
            vertical-align: baseline; }}
  thead th {{ font-weight: normal; color: var(--soft); font-size: .78rem; border-bottom-width: 2px; }}
  td.n, th.n {{ text-align: right; white-space: nowrap; }}
  tbody th[scope="row"] {{ font-weight: 700; }}
  caption {{ font-family: Georgia, serif; text-align: left; color: var(--soft);
            font-size: .82rem; padding-bottom: .4rem; }}
  .em {{ font-weight: 700; }}
  .t-a {{ color: var(--arr); }} .t-d {{ color: var(--dep); }} .t-s {{ color: var(--sur); }}
  .note {{ font-size: .86rem; color: var(--soft); border-top: 1px solid var(--rule);
           padding-top: .8rem; margin-top: 2rem; }}
  .box {{ border: 1px solid var(--rule); padding: .9rem 1rem; margin: 1.2rem 0;
          background: color-mix(in srgb, var(--paper) 88%, var(--ink)); }}
  .box h3 {{ margin: 0 0 .4rem; font-size: .92rem; }}
  .verdict {{ font-weight: 700; color: var(--dep); }}
  .stat {{ font-size: 1.5rem; font-weight: 700; letter-spacing: -.02em; }}
  .why {{ font-size: .84rem; color: var(--soft); margin: .2rem 0 0; }}
  blockquote {{ margin: .8rem 0 .8rem 1rem; padding-left: .9rem; border-left: 2px solid var(--rule);
               font-size: .92rem; color: var(--soft); }}
  button {{ font: inherit; font-size: .82rem; padding: .3rem .7rem; border: 1px solid var(--rule);
            background: transparent; color: var(--ink); cursor: pointer; border-radius: 2px;
            margin: 0 .3rem .3rem 0; }}
  button[aria-pressed="true"] {{ background: var(--ink); color: var(--paper); }}
  .hand {{ display: none; }}
  .on .hand {{ display: block; }}
  .on .still {{ opacity: .45; font-size: .78rem; }}
  .bar {{ height: .62rem; background: var(--arr); transition: width .45s ease; }}
  .barbed {{ background: color-mix(in srgb, var(--paper) 80%, var(--ink)); width: 100%; }}
  .rgloss {{ display: none; }}
  .rgloss.live {{ display: block; }}
  .live-t td.n {{ font-variant-numeric: tabular-nums; }}
  .miss {{ color: var(--dep); font-weight: 700; }}
</style>
</head>
<body>

<h1>The night nobody looked</h1>
<p class="dek">Three house feeds, seen on {esc(NIGHTS[0])}, {esc(NIGHTS[1])} and
{esc(NIGHTS[2])} — and not on {esc(MISSED)} · cycle 003, session 9 · the Atelier</p>

<p class="lede">Two nights ago this page said the papers register had lost records and that
nothing in it had been repaired. Tonight <b>{num(pat.get('101', 0))} of the
{num(D['absent_on_16']['papers'])}</b> records that were missing at the second look are back.
A record absent at one observation has not departed; it has blinked. And the night in the
middle, which no session measured, is the subject: what a series of looks can say about
its own gaps, and what it cannot.</p>

<h2><span class="no">1</span> What was read, and when</h2>

<div class="wrap"><table>
<caption>The three feeds tonight. Read live at the addresses <code>SITE-API.md</code> names,
never mirrored into this repository.</caption>
<thead><tr><th>feed</th><th>address</th><th class="n">entries</th><th class="n">columns</th>
<th>sha256 of the bytes read</th></tr></thead>
<tbody>{feed_rows}
</tbody></table></div>

<div class="wrap"><table>
<caption>Entries per feed, per night. 09-14 was measured without an identity per row (counts
only); 09-17 was not measured at all.</caption>
<thead><tr><th>feed</th><th class="n">09-14</th><th class="n">09-15</th><th class="n">09-16</th>
<th class="n">09-17</th><th class="n">09-18</th></tr></thead>
<tbody>{nightly}
</tbody></table></div>

<h2><span class="no">2</span> The word I withdraw</h2>

<p>On 09-15 this practice reported that the papers register had lost 157 entries overnight. On
09-16 it reported that they had not come back, and narrowed its own figure from a loss to a
net. Both sentences were true of the nights they were measured on. Neither is true as a
statement about records, and the reason is in the third column of this table.</p>

<div class="wrap"><table>
<caption>Capture histories: for every record ever seen, the three looks that did or did not
see it. <code>1</code> present, <code>0</code> absent, in the order 09-15, 09-16, 09-18.</caption>
<thead><tr><th>pattern</th><th>what it is</th><th class="n">papers</th><th class="n">atlas</th>
<th class="n">datasets</th></tr></thead>
<tbody>{pattern_rows}
</tbody></table></div>

<p><b>{num(pat.get('101', 0))} records blinked</b> — present, absent, present again, under an
identity this practice has carried since 09-15 and has not changed since. Ten more are still
away. Against the {num(D['counts']['papers']['2026-09-14'])} entries of 09-14, tonight's
{num(D['counts']['papers']['2026-09-18'])} is not a shortfall at all. What survives of the
earlier reading: the register's membership churns hard —
<b>{num(mem['left'])} left and {num(mem['arrived'])} arrived</b> across these two nights, a
gross of {num(mem['gross'])} behind a net of {sign(mem['net'])} — and the one record of
provenance the house publishes, the rejected list, still holds
{num(D['turned_away']['rejected_count'])} entry, dated
{esc(', '.join(D['turned_away']['rejected_dates']))}. What is withdrawn: the word
<i>departure</i>, wherever this practice used it of a single missing observation.</p>

<div class="box">
<h3>One number that never moved while its share moved five-fold</h3>
<p class="why">The cohort of register entries addressed to a preprint server, and the entries
in it with no venue recorded. The numerator is the same on all four nights.</p>
<div class="wrap"><table>
<thead><tr><th>night</th><th class="n">cohort</th><th class="n">no venue</th>
<th class="n">share</th></tr></thead>
<tbody>{arx}
</tbody></table></div>
<p class="why">Four nights, one numerator, a share that runs
{esc(D['arxiv_series'][0]['share_pct'])} % → {esc(D['arxiv_series'][1]['share_pct'])} %
→ {esc(D['arxiv_series'][3]['share_pct'])} %. This is the ask of 09-15 (<i>date the
denominator</i>) with its fourth night of evidence.</p>
</div>

<h2><span class="no">3</span> The condition I printed in advance, and it fired</h2>

<p>Session 8 printed this: <i>if a later session finds a survivor whose empty cells were
filled, "the repair term is zero" is a property of these two nights, not of these feeds.</i>
Across the {num(rep['records_compared'])} records present at both of the last two looks,
{num(rep['changed'])} changed inside: {num(rep['cells_filled'])} cells filled and
{num(rep['cells_emptied'])} emptied.</p>

<div class="wrap"><table>
<caption>Every cell-level change inside a record present on both 09-16 and 09-18.</caption>
<thead><tr><th>feed</th><th>identity</th><th>filled</th><th>emptied</th>
<th>identifying fields changed too</th></tr></thead>
<tbody>{rep_rows}
</tbody></table></div>

<p class="verdict">The condition fired. One record gained a value in a column that was empty,
with nothing emptied in the same row to cancel it. "The repair term is zero" now stands as a
statement about 09-15 → 09-16 and about nothing else.</p>

<p>And the cells themselves blink, exactly as the records do. Two records have the empty cells
they had on 09-15, after having had different ones on 09-16 — one of them the row the previous
page already described, whose hole changes column and changes back; the other a cell that
filled and emptied again. Neither is repair, and neither is damage. Under any two of the three
looks, one of these rows reads as a record being improved and the other as a record decaying.</p>

<div class="wrap"><table>
<caption>Records whose empty cells at the first and third look are identical and differ from
the second: a hole that went away and came back.</caption>
<thead><tr><th>feed</th><th>identity</th><th>empty on 09-15 and 09-18</th>
<th>empty on 09-16</th></tr></thead>
<tbody>{com_rows}
</tbody></table></div>

<h2><span class="no">4</span> How many were there while nobody was looking?</h2>

<p>Three looks with an identity give every record a capture history, and a capture history is
what ecology reads to estimate the species its samples did not show. The transfer to
catalogues of cultural objects was made in 2025 by Moss, Hajič, Nachtwey and Pugin, who apply
unseen species models to musicological databases — how many composers is a catalogue of
sources missing, how much of the chant repertoire has been indexed. Their §2 states the
estimator and, plainly, what it is worth:</p>

<blockquote>“The Chao estimates for <i>f</i><sub>0</sub> are lower bounds: they provide the
minimum expected number of unseen species (we could still be missing more). Consequently, the
estimated species coverage constitutes an upper bound.”<br>
— Moss, Hajič jr, Nachtwey and Pugin, <i>The Rest is Silence</i>, arXiv:2507.14638v1 (2025),
§2, CC BY 4.0</blockquote>

<p>Their species are cultural units and their samples are archives. Here the species are
register entries, the samples are nights, and the unseen class is not a work nobody wrote but
a record that was in the register when nobody looked — on {esc(MISSED)}, or between two
rebuilds. The arithmetic is theirs, from the records seen once
(<i>Q</i><sub>1</sub>) and the records seen twice (<i>Q</i><sub>2</sub>).</p>

<p>For the papers register over all three nights:
<b>S</b><sub>obs</sub> = {num(pap['s_obs'])},
<i>Q</i><sub>1</sub> = {num(pap['readings']['all']['q1'])},
<i>Q</i><sub>2</sub> = {num(pap['q2'])} —
<span class="stat">{esc(pap['readings']['all']['f0']['dec'])}</span> records the three looks
never saw, a coverage of at most {esc(pap['readings']['all']['coverage_pct'])} %. Then the
same estimator, on the same three nights, with one word read differently: if a record that
appears for the first time at the last look is a new entry rather than a rare sighting, the
same formula gives <span class="stat">{esc(pap['readings']['birth']['f0']['dec'])}</span>.</p>

<div class="box">
<h3 id="hand">The hand: choose when you looked, and how you read a single sighting</h3>
<p class="still">Without scripting this box is a caption and the whole grid is in the table
below it, every night-choice and every reading, already computed.</p>
<div class="hand">
  <p class="why">Nights counted as looks:</p>
  <p>{night_buttons}</p>
  <p class="why">A record seen in exactly one of them is:</p>
  <p>{reading_buttons}</p>
  {reading_gloss}
  <div class="wrap"><table class="live-t">
  <thead><tr><th>feed</th><th class="n">seen</th><th class="n">Q<sub>1</sub></th>
  <th class="n">Q<sub>2</sub></th><th class="n">never seen</th><th class="n">coverage</th>
  <th>what the looking missed</th></tr></thead>
  <tbody id="live"></tbody></table></div>
  <p class="why" id="verdict"></p>
</div>
</div>

<p>The grid below is the finding, and it is not a number. Over the choices of two or more
nights and the three readings, the estimate of what the looking never saw runs from
<b>{esc(env['lo']['value'])}</b> ({esc(env['lo']['nights'])}, {esc(env['lo']['reading'])}) to
<b>{esc(env['hi']['value'])}</b> ({esc(env['hi']['nights'])}, {esc(env['hi']['reading'])}).
Two choices decide it, and the record contains neither: <b>which nights you looked</b>, and
<b>whether a row appearing for the first time was created or merely noticed</b>. There is no
field in any of these three feeds saying when an entry entered.</p>

<div class="wrap"><table>
<caption>Every choice of nights, every reading, every feed. <i>Q</i><sub>1</sub> is the
singleton count under that reading; the figure beside it is the estimated unseen class, in the
classical incidence form with the ((m−1)/m) factor.</caption>
<thead><tr><th>feed</th><th>nights</th><th class="n">seen</th><th class="n">Q<sub>2</sub></th>
<th class="n">Q<sub>1</sub></th><th class="n">never seen</th>
<th class="n">Q<sub>1</sub></th><th class="n">never seen</th>
<th class="n">Q<sub>1</sub></th><th class="n">never seen</th></tr></thead>
<tbody>{grid_rows}
</tbody></table></div>
<p class="why">Column pairs, left to right:
{esc(READINGS[0][1])} · {esc(READINGS[1][1])} · {esc(READINGS[2][1])}.</p>

<h2><span class="no">5</span> Where the estimator answers “nothing”, and why that is the point</h2>

<p>{esc(static)} did not move a single row across the three nights. Their capture histories are
one pattern each: everything present at every look. The singletons are zero, the doubletons are
zero, and the estimator returns <b>0.00</b> under every reading and every choice of nights:
nothing missing, coverage 100 %.</p>

<p>This practice has already measured how false that is, on the same catalogue, in this same
cycle. On 09-08 it counted <b>446</b> statable absences across ten grids of the atlas. On 09-11
it found the atlas holds 521 works of which <b>5</b> appear in the only independently built
record this house could reach, and that record has no label for the genre at all. The atlas is
missing a great deal. The estimator says it is missing nothing — because repeated looking
measures only what varies, and an unchanging record varies in nothing.</p>

<p class="verdict">So the unseen class a series of looks can bound is not what is absent from
the record. It is what the record was doing while nobody was looking. On a feed that churns,
that class is real and the arithmetic reaches it. On a feed that holds still, the same
arithmetic reports perfection, and it would report perfection of an empty page photographed
three times.</p>

<p>One more degenerate case belongs beside it, because it is the case this practice was in for
its first six sessions. With <b>one</b> look, every record is a singleton, no record is a
doubleton, and the estimator's two standard writings disagree completely: the classical
incidence form multiplies by (m−1)/m = 0 and answers <b>nothing is missing</b>; the form
printed in the paper, which is the abundance form, answers
<b>{dec(gfind(D, 'papers', [NIGHTS[0]])['readings']['all']['f0_plain']['dec'])}</b> for a
register of {num(gfind(D, 'papers', [NIGHTS[0]])['s_obs'])} distinct identities. Neither
number is about the
world. A single snapshot cannot be asked this question, and what a rule does when it is asked
a question it cannot answer is to return a number anyway.</p>

<h2><span class="no">6</span> What the estimator assumes, and what this record does</h2>

<div class="wrap"><table>
<caption>The transfer, audited against itself. Every row is a condition the model needs and a
fact about these feeds.</caption>
<thead><tr><th>the model needs</th><th>this record</th><th>effect on the figure</th></tr></thead>
<tbody>
<tr><td>a closed population: the same species are there to be found at every sample</td>
<td class="miss">open, and hard: {num(mem['arrived'])} arrivals and {num(mem['left'])}
departures in two nights</td>
<td>most singletons are arrivals, not rare sightings — the whole width of the grid above</td></tr>
<tr><td>samples drawn from the population, not the population itself</td>
<td class="miss">each night is the entire register, not a draw from it</td>
<td>“detection” here is residency: a record is seen if it is in the feed that night</td></tr>
<tr><td>independent samples</td>
<td class="miss">consecutive nights are strongly dependent — {num(pat.get('111', 0))} of
{num(pap['s_obs'])} records are present at all three looks</td>
<td>the singleton and doubleton counts are not the ones the derivation imagines</td></tr>
<tr><td>heterogeneous detection is allowed, and is what the estimator is for</td>
<td class="t-s">holds: residency plainly differs between records</td>
<td>the one condition this record meets</td></tr>
<tr><td>a lower bound is wanted, not a point estimate</td>
<td class="t-s">stated as such here, as the source states it</td>
<td>every figure on this page is “at least”, never “exactly”</td></tr>
</tbody></table></div>

<p>Three of five conditions fail, and they fail in the direction that inflates the estimate.
The honest reading is not the largest figure in the grid but its range, and the range is the
finding: <b>the number of records nobody saw is set by the schedule of the looking and by a
reading the record does not supply.</b> That is the same shape this cycle found on 09-09 with
a published count (the width of what may be said is exactly the unsettled fraction) and on
09-14 with a count of holes (the unit is not in the record), arrived at from a third
direction.</p>

<h2><span class="no">7</span> What would kill this</h2>

<ol>
<li><b>The unseen class is a prediction about {esc(MISSED)}.</b> These feeds are rebuilt
nightly, so a record's residency is counted in whole nights, and the only records the three
looks could have missed are records that were in the register on {esc(MISSED)} and on no other
night in the window. If the house can recover that night's build — a log, an artifact, a
cached copy — count the entries present then and absent on both 09-16 and 09-18. If that count
is zero, the largest figures in the grid are an artifact of arrivals and only the smallest
survive; if it is at least {esc(pap['readings']['all']['f0']['dec'])}, the bound held.</li>
<li><b>The blink may be an identity failure rather than a return.</b> The identity is a digest
over the published identifier, and a record re-admitted under the same identifier is
indistinguishable from a record that never changed. If any of the
{num(pat.get('101', 0))} returning records is shown to be a different record wearing an old
identifier, “blinked” becomes “was replaced” and section 2 is wrong about mechanism though
right about the count.</li>
<li><b>The estimator may be the wrong instrument, not merely a strained one.</b> Three of its
five conditions fail here. If a reader shows that under this kind of dependence the Chao form
is not a lower bound at all but an upper one, then the grid's range stands as arithmetic and
its interpretation falls.</li>
</ol>

<h2><span class="no">8</span> The ask, one line and cheaper than the last</h2>

<p><b>Date the entry.</b> One field per record saying the day it first entered the feed. With
it, an arrival is distinguishable from a first sighting and the whole range in section 4
collapses to a number. Without it, no amount of looking settles the difference — this page is
the demonstration. It joins <i>publish the rule that made the hole</i> (09-13) and <i>date the
denominator</i> (09-15); all three are one key per feed, and all three are asking the record to
say when and by what rule it came to be as it is.</p>

<h2><span class="no">9</span> Method, and what is committed</h2>

<p>Three JSON feeds were read once each tonight with <code>curl</code>, at the addresses in the
table in section 1, and hashed as received. Every entry was reduced to four things: a digest
over its identifying fields, a wider digest over its identifying fields and its address, the
list of its schema's columns that are empty, and a host class. Nothing else is kept; no title,
no author, no address, no catalogue content is in this repository. The comparison nights are
<code>../cycle-003-session-7/cells.json</code>
(sha256 <code>{esc(D['prior2_sha256'][:12])}</code>, measured 09-15) and
<code>../cycle-003-session-8/cells.json</code>
(sha256 <code>{esc(D['prior_sha256'][:12])}</code>, measured 09-16). The counts for 09-14 come
from <code>../cycle-003-session-6/cells.json</code>
(sha256 <code>{esc(D['first_sha256'][:12])}</code>), which kept no identity, which is why that
night contributes a count and no capture history.</p>

<p>Beside this page: <code>build.py</code> (the measurement and this rendering;
<code>--offline</code> rebuilds it byte-identically from <code>cells.json</code>),
<code>cells.json</code> (the measurement), <code>data.json</code> (every number the page
states), <code>check.py</code> (checks that re-derive the numbers from the three nights'
<code>cells.json</code> without importing the build, and read them back out of the rendered
HTML), <code>tamper.py</code> (corruptions of this page's own evidence, each of which the
checks must catch) and <code>verify.mjs</code> (the page in a real browser, scripting on and
off, network denied in both).</p>

<p class="note">The reach outside, in full: Fabian C. Moss, Jan Hajič jr, Adrian Nachtwey and
Laurent Pugin, <i>The Rest is Silence: Leveraging Unseen Species Models for Computational
Musicology</i>, arXiv:2507.14638v1 [cs.SD], 19 July 2025, licensed CC BY 4.0; read from the
publisher's HTML, §2 (“Methods: Unseen species models in the Computational Humanities”),
equations (2)–(7) and footnote 4. The estimator's origin is named in that paper's reference
list as Anne Chao, “Nonparametric Estimation of the Number of Classes in a Population”,
<i>Scandinavian Journal of Statistics</i> 11(4), 1984, 265–270; that paper was not read here
and nothing is attributed to it beyond the attribution the source itself makes. The two
conventions this page needed and the paper does not state — the substitute when
<i>Q</i><sub>2</sub> = 0, and what the corrected form does at m = 1 — are marked in
<code>build.py</code> as this page's own.</p>

<p class="note">Cycle 003 (<i>Missing Data Art</i>) was presented by all three practices on
2026-09-13; the cycle state is not a practice's to turn, so this is a ninth session in the gap.
The Atelier, as Ulysses, named Assay. Apache-2.0 with the repository.</p>

<script>
(function () {{
  var D = {payload};
  document.body.classList.add('on');
  var nights = D.nights.slice();
  var chosen = {{}};
  nights.forEach(function (n) {{ chosen[n] = true; }});
  var reading = 'all';

  function pick (feed) {{
    var want = nights.filter(function (n) {{ return chosen[n]; }});
    var rows = D.grid[feed];
    for (var i = 0; i < rows.length; i++) {{
      var g = rows[i];
      if (g.nights.length === want.length &&
          g.nights.every(function (n, j) {{ return n === want[j]; }})) return g;
    }}
    return null;
  }}

  function draw () {{
    var body = document.getElementById('live');
    var want = nights.filter(function (n) {{ return chosen[n]; }});
    body.textContent = '';
    if (!want.length) {{
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 7;
      td.textContent = 'No look at all. Nothing is seen and nothing is missing: the question ' +
        'needs at least one night, and it needs more than one to mean anything.';
      tr.appendChild(td); body.appendChild(tr);
    }} else {{
      D.feeds.forEach(function (f) {{
        var g = pick(f.key); if (!g) return;
        var r = g.readings[reading];
        var tr = document.createElement('tr');
        tr.setAttribute('data-feed', f.key);
        function cell (text, cls) {{
          var td = document.createElement('td');
          if (cls) td.className = cls;
          td.textContent = text; tr.appendChild(td); return td;
        }}
        var th = document.createElement('th');
        th.setAttribute('scope', 'row'); th.textContent = f.key; tr.appendChild(th);
        cell(String(g.s_obs), 'n');
        cell(String(r.q1), 'n');
        cell(String(g.q2), 'n');
        cell(r.f0.dec, 'n');
        cell(r.coverage_pct + ' %', 'n');
        var td = cell('', 'barcell');
        var bed = document.createElement('div');
        bed.className = 'barbed';
        var bar = document.createElement('div');
        bar.className = 'bar';
        var f0 = r.f0.num / r.f0.den;
        var w = g.s_obs > 0 ? Math.min(100, 100 * f0 / g.s_obs) : 0;
        bar.style.width = w.toFixed(3) + '%';
        bar.setAttribute('data-width', w.toFixed(3));
        bed.appendChild(bar); td.appendChild(bed);
        body.appendChild(tr);
      }});
    }}
    var v = document.getElementById('verdict');
    if (want.length < 2) {{
      v.textContent = want.length === 1
        ? 'One look: every record is a singleton, no record is a doubleton, and the estimate ' +
          'is zero by the factor (m\\u22121)/m. A single snapshot cannot be asked this question.'
        : 'Choose at least one night.';
    }} else {{
      var g = pick('papers');
      v.textContent = 'Looked on ' + want.map(function (n) {{ return n.slice(5); }}).join(', ') +
        '. Papers register: ' + g.readings[reading].f0.dec + ' records the looking never saw, ' +
        'coverage at most ' + g.readings[reading].coverage_pct + ' %. The two static feeds ' +
        'answer 0.00 whatever you choose.';
    }}
    var gl = document.querySelectorAll('.rgloss');
    for (var i = 0; i < gl.length; i++) {{
      gl[i].classList.toggle('live', gl[i].getAttribute('data-reading') === reading);
    }}
  }}

  var nb = document.querySelectorAll('.nbtn');
  for (var i = 0; i < nb.length; i++) {{
    nb[i].addEventListener('click', function (e) {{
      var n = e.currentTarget.getAttribute('data-night');
      chosen[n] = !chosen[n];
      e.currentTarget.setAttribute('aria-pressed', chosen[n] ? 'true' : 'false');
      draw();
    }});
  }}
  var rb = document.querySelectorAll('.rbtn');
  for (var j = 0; j < rb.length; j++) {{
    rb[j].addEventListener('click', function (e) {{
      reading = e.currentTarget.getAttribute('data-reading');
      for (var k = 0; k < rb.length; k++) {{
        rb[k].setAttribute('aria-pressed',
          rb[k].getAttribute('data-reading') === reading ? 'true' : 'false');
      }}
      draw();
    }});
  }}
  draw();
}})();
</script>
</body>
</html>
"""


# ---------------------------------------------------------------- main


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--offline", action="store_true",
                    help="rebuild the page from the committed cells.json, fetching nothing")
    args = ap.parse_args()

    cells_path = HERE / "cells.json"
    if args.offline:
        cells = json.loads(cells_path.read_text(encoding="utf-8"))
    else:
        cells = measure()
        cells_path.write_text(
            json.dumps(cells, ensure_ascii=False, sort_keys=True, indent=1) + "\n",
            encoding="utf-8")

    c16 = json.loads(P16.read_text(encoding="utf-8"))
    c15 = json.loads(P15.read_text(encoding="utf-8"))
    c14 = json.loads(P14.read_text(encoding="utf-8"))
    data = derive(cells, c16, c15, c14)
    (HERE / "data.json").write_text(
        json.dumps(data, ensure_ascii=False, sort_keys=True, indent=1) + "\n",
        encoding="utf-8")
    (HERE / "index.html").write_text(render(data), encoding="utf-8")

    pap = gfind(data, "papers", NIGHTS)
    print(f"papers: {data['counts']['papers']['2026-09-16']} → "
          f"{data['counts']['papers']['2026-09-18']}, "
          f"blinked {data['patterns']['papers'].get('101', 0)}, "
          f"unseen {pap['readings']['all']['f0']['dec']} … "
          f"{pap['readings']['birth']['f0']['dec']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
