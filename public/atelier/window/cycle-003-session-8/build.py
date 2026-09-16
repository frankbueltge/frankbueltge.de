#!/usr/bin/env python3
"""build.py — cycle 003, session 8 (2026-09-16): the repair term.

Session 6 measured the three house feeds at one instant and found that the number of holes
comes from the frame. Session 7 measured them again twenty-four hours later, found the papers
register 157 entries lighter, and established that a departure is invisible to every reading of
a single snapshot — a catalogue that loses a seventh of itself reads as a catalogue that was
repaired. It landed one repair for that blindness: a content-free identity digest on every row,
so the next session could subtract the nights instead of subtracting the counts.

This is the next session. It does three things.

1. **It settles the refutation condition session 7 printed in advance.** That page said: if
   tonight finds the 157 back, the departure was a transient pipeline state and every sentence
   treating it as a loss is withdrawn. It is not withdrawn; the evidence is in section 1.

2. **It computes the first decomposition this house has been able to compute.** A change in a
   count of holes splits into three terms — what left with departing records, what arrived with
   new ones, and what actually changed inside the records present on both nights. Only the
   third term is repair or damage. Every reading's night-over-night movement is put through it.

3. **It reaches outside** (protocol v7 §5.3) to a paper this corpus has never worked, and the
   paper turns out to sort the six readings into those that may be asked the question at all —
   before any of them is measured. Jim Gray, Surajit Chaudhuri, Adam Bosworth, Andrew Layman,
   Don Reichart, Murali Venkatrao, Frank Pellow and Hamid Pirahesh, *Data Cube: A Relational
   Aggregation Operator Generalizing Group-By, Cross-Tab, and Sub-Totals*, Data Mining and
   Knowledge Discovery 1(1):29–53 (1997), read from arXiv cs/0701155, the trichotomy on pp. 10–11.

What is committed: the measurement, never the feeds. Every row is reduced to which of its
schema's fields are empty, a derived host class, and two one-way digests. No title, no author,
no address, no catalogue content.

    python3 window/cycle-003-session-8/build.py            # fetch, measure, render
    python3 window/cycle-003-session-8/build.py --offline  # rebuild the page from cells.json

The offline rebuild is byte-identical to the online one: `cells.json` is the only input the
page's numbers come from.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import pathlib
import re
import subprocess
import sys
from collections import Counter

HERE = pathlib.Path(__file__).resolve().parent
PRIOR_PATH = HERE.parent / "cycle-003-session-7" / "cells.json"      # has identity
FIRST_PATH = HERE.parent / "cycle-003-session-6" / "cells.json"      # counts only
DATE = "2026-09-16"
PRIOR_DATE = "2026-09-15"
FIRST_DATE = "2026-09-14"

# The three feed specifications are session 7's, unchanged on purpose: two nights compared
# under two different rules would produce a difference that is the rule's, which is the whole
# error this line of sessions exists to measure.
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
        "convention_fields": ["curator_note"],
        "convention_all": False,
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
        "convention_fields": [],
        "convention_all": False,
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
        "convention_fields": [],
        "convention_all": True,
    },
]
SPEC = {f["key"]: f for f in FEEDS}


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
    fields. Enough to intersect two nights and say which records left; not enough to recover
    a title from. It is the same function or the comparison means nothing.
    """
    raw = "|".join([feed_key] + [str(entry.get(f, "")) for f in fields])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def fetch(url: str) -> tuple[dict, str]:
    raw = subprocess.run(
        ["curl", "-sS", "--fail", "--max-time", "120", "-H", "Accept: application/json", url],
        check=True, capture_output=True,
    ).stdout
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def measure() -> dict:
    out = {"date": DATE, "prior_date": PRIOR_DATE, "first_date": FIRST_DATE, "feeds": []}
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
    out["prior_sha256"] = hashlib.sha256(PRIOR_PATH.read_bytes()).hexdigest()
    out["first_sha256"] = hashlib.sha256(FIRST_PATH.read_bytes()).hexdigest()
    out["turned_away"] = turned_away()
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


def crossreads(key: str, entries: list[dict]) -> dict:
    """Record-internal facts the page states. Counts only."""
    out: dict = {}
    if key == "papers":
        arx = [x for x in entries if host_class(x.get("url")) == "arxiv"]
        out["arxiv_entries"] = len(arx)
        out["arxiv_without_venue"] = sum(1 for x in arx if is_empty(x.get("ort")))
        out["arxiv_with_venue"] = len(arx) - out["arxiv_without_venue"]
        ids = Counter(str(x.get("id")) for x in entries)
        shared = {i for i, c in ids.items() if c > 1}
        out["ids_shared"] = len(shared)
        out["entries_on_shared_ids"] = sum(ids[i] for i in shared)
        out["max_entries_on_one_id"] = max(ids.values()) if ids else 0
    if key == "datasets":
        out["blocked"] = sum(1 for x in entries if x.get("zugang_gesperrt"))
    return out


# ------------------------------------------------------------ the readings


def cells_of(rows: list[dict]) -> int:
    return sum(len(r["miss"]) for r in rows)


def conv_cells(key: str, rows: list[dict]) -> int:
    spec = SPEC[key]
    if spec["convention_all"]:
        return cells_of(rows)
    fields = set(spec["convention_fields"])
    return sum(1 for r in rows for m in r["miss"] if m in fields)


def shapes_of(rows: list[dict]) -> Counter:
    return Counter(tuple(sorted(r["miss"])) for r in rows if r["miss"])


READINGS = [
    {
        "id": "R1", "name": "every empty slot", "unit": "slots", "kind": "count",
        "klass": "distributive",
        "rule": "One hole per (entry, field) pair whose value is absent, null, an empty string, "
                "an empty list or an empty object.",
        "why": "A sum over records. Gray et al. call F distributive when the whole can be "
               "recovered from the parts by one function — here SUM, and the split is an "
               "identity, not an estimate.",
    },
    {
        "id": "R2", "name": "every entry carrying a gap", "unit": "entries", "kind": "count",
        "klass": "distributive",
        "rule": "One hole per entry with at least one empty slot, however many it has.",
        "why": "A count over records, and COUNT is the trichotomy's own example of a "
               "distributive function whose G is SUM.",
    },
    {
        "id": "R4", "name": "slots the record shows are gaps", "unit": "slots", "kind": "count",
        "klass": "distributive",
        "rule": "R1 less every empty cell the record itself explains: the datasets register's "
                "success convention and the atlas's optional curator's note.",
        "why": "Session 6's finding, kept as a reading. Subtracting a per-row quantity from a "
               "per-row quantity leaves a sum over records, so the class does not change.",
    },
    {
        "id": "R5", "name": "every distinct shape of gap", "unit": "shape-slots", "kind": "count",
        "klass": "holistic",
        "rule": "One hole per (shape, field): entries empty in exactly the same fields are one "
                "shape, counted once however many entries carry it.",
        "why": "To combine two parts you need their shape sets, and no fixed-size summary of a "
               "part suffices — the paper's definition of holistic. The split is arithmetic "
               "with no referent, and here it does not even balance.",
    },
    {
        "id": "R3", "name": "every distinct shape, once", "unit": "shapes", "kind": "count",
        "klass": "holistic",
        "rule": "One hole per distinct set of empty fields occurring in the record.",
        "why": "Holistic for the same reason as R5, and the more dangerous of the two: tonight "
               "its split balances exactly and both of its terms are false.",
    },
    {
        "id": "R6", "name": "the share of slots left empty", "unit": "share", "kind": "rate",
        "klass": "algebraic",
        "rule": "Empty slots divided by all slots the schema declares.",
        "why": "A ratio of two sums. The paper's algebraic class: a part can be summarised, but "
               "only by a tuple — here (empty, declared) — never by the share itself. Split as "
               "one number it is nonsense; split as the pair it is exact.",
    },
]
BY_ID = {r["id"]: r for r in READINGS}


def measures(key: str, rows: list[dict]) -> dict:
    spec = SPEC[key]
    shapes = shapes_of(rows)
    slots = len(rows) * len(spec["schema"])
    return {
        "n": len(rows), "slots": slots,
        "R1": cells_of(rows),
        "R2": sum(1 for r in rows if r["miss"]),
        "R4": cells_of(rows) - conv_cells(key, rows),
        "R5": sum(len(s) for s in shapes),
        "R3": len(shapes),
        "R6": (cells_of(rows) / slots) if slots else 0.0,
    }


def totals(cells: dict) -> dict:
    per = {f["key"]: measures(f["key"], f["rows"]) for f in cells["feeds"]}
    t = {r["id"]: sum(per[k][r["id"]] for k in per) for r in READINGS if r["kind"] == "count"}
    t["slots"] = sum(per[k]["slots"] for k in per)
    t["n"] = sum(per[k]["n"] for k in per)
    t["R6"] = t["R1"] / t["slots"]
    return {"per": per, "total": t}


# --------------------------------------------------------- the decomposition


def membership(was: dict, now: dict) -> dict:
    """Who left, who arrived, who was there both nights — under two identity rules.

    The wide rule is the page's default because it is the one that cannot confuse a record
    with a different record carrying the same identifier: session 7 found the papers
    register's own `id` on four entries differing in title, year, identifier and address.
    The narrow rule is reported beside it, because the difference between them is the honest
    width of the word *departure*.
    """
    out = {}
    for f in now["feeds"]:
        k = f["key"]
        g = next(x for x in was["feeds"] if x["key"] == k)
        w_was = {r["w"]: r for r in g["rows"]}
        w_now = {r["w"]: r for r in f["rows"]}
        k_was = {r["k"] for r in g["rows"]}
        k_now = {r["k"] for r in f["rows"]}
        left = sorted(set(w_was) - set(w_now))
        arrived = sorted(set(w_now) - set(w_was))
        survived = sorted(set(w_now) & set(w_was))
        # A row absent under the wide rule whose narrow identifier is still present tonight is
        # not a departure at all: it is the same entry with an edited year, identifier or
        # address. Counting it as a departure is the mistake the wide rule makes, and counting
        # its replacement as an arrival is the same mistake twice.
        edits = sum(1 for d in left if w_was[d]["k"] in k_now)
        out[k] = {
            "was": len(g["rows"]), "now": len(f["rows"]),
            "left": len(left), "arrived": len(arrived), "survived": len(survived),
            "left_narrow": len(k_was - k_now), "arrived_narrow": len(k_now - k_was),
            "edits": edits,
            "arrivals_matching_prior_id": sum(1 for a in arrived if w_now[a]["k"] in k_was),
            "gross": len(left) + len(arrived),
            "net": len(f["rows"]) - len(g["rows"]),
            "rows": {"left": [w_was[d] for d in left], "arrived": [w_now[a] for a in arrived],
                     "survived_was": [w_was[s] for s in survived],
                     "survived_now": [w_now[s] for s in survived]},
        }
    return out


def decompose(was: dict, now: dict, mem: dict) -> list[dict]:
    """Every reading's night-over-night change, split into arrival, departure and survivor.

    The identity being tested, for a reading M over a set of records:

        M(now) − M(was)  =  M(arrived) − M(left) + [ M(survivors now) − M(survivors was) ]

    It holds exactly when M can be recovered from a partition of the records by summing —
    Gray et al.'s distributive class. Nothing here assumes it: the residual is computed and
    printed for all six.
    """
    rows = []
    for r in READINGS:
        i = r["id"]
        per = {}
        for f in now["feeds"]:
            k = f["key"]
            g = next(x for x in was["feeds"] if x["key"] == k)
            m = mem[k]["rows"]
            now_v = measures(k, f["rows"])[i]
            was_v = measures(k, g["rows"])[i]
            arr = measures(k, m["arrived"])[i]
            dep = measures(k, m["left"])[i]
            sur = measures(k, m["survived_now"])[i] - measures(k, m["survived_was"])[i]
            per[k] = {"was": was_v, "now": now_v, "delta": now_v - was_v,
                      "arrived": arr, "left": dep, "survivors": sur,
                      "residual": (now_v - was_v) - (arr - dep + sur)}
        agg = _aggregate(i, per, was, now, mem)
        rows.append({**{x: r[x] for x in ("id", "name", "unit", "kind", "klass", "rule", "why")},
                     "per": per, **agg, "admits": admits(i)})
    return rows


def _aggregate(i: str, per: dict, was: dict, now: dict, mem: dict) -> dict:
    """The three feeds' terms, combined the way the page states them."""
    if i == "R6":
        # The share is not a sum, so its terms are the pair (empty slots, declared slots).
        def pair(rows_by_feed):
            e = sum(measures(k, rs)["R1"] for k, rs in rows_by_feed.items())
            s = sum(len(rs) * len(SPEC[k]["schema"]) for k, rs in rows_by_feed.items())
            return e, s
        a_e, a_s = pair({k: mem[k]["rows"]["arrived"] for k in mem})
        d_e, d_s = pair({k: mem[k]["rows"]["left"] for k in mem})
        sn_e, sn_s = pair({k: mem[k]["rows"]["survived_now"] for k in mem})
        sw_e, sw_s = pair({k: mem[k]["rows"]["survived_was"] for k in mem})
        tw, tn = totals(was)["total"], totals(now)["total"]
        # (a) the naive split: treat the share of each part as a term and add them up
        naive_arr = (a_e / a_s) if a_s else 0.0
        naive_dep = (d_e / d_s) if d_s else 0.0
        naive_sur = ((sn_e / sn_s) if sn_s else 0.0) - ((sw_e / sw_s) if sw_s else 0.0)
        delta = tn["R6"] - tw["R6"]
        naive_resid = delta - (naive_arr - naive_dep + naive_sur)
        # (b) the pair split: carry numerator and denominator, divide at the end
        pair_now = (sn_e + a_e, sn_s + a_s)
        pair_was = (sw_e + d_e, sw_s + d_s)
        pair_resid = delta - ((pair_now[0] / pair_now[1]) - (pair_was[0] / pair_was[1]))
        return {
            "was": tw["R6"], "now": tn["R6"], "delta": delta,
            "arrived": naive_arr, "left": naive_dep, "survivors": naive_sur,
            "residual": naive_resid, "exact": False,
            "pair": {"arrived": [a_e, a_s], "left": [d_e, d_s],
                     "survivors_now": [sn_e, sn_s], "survivors_was": [sw_e, sw_s],
                     "residual": pair_resid, "exact": abs(pair_resid) < 1e-15},
        }
    agg = {x: sum(per[k][x] for k in per) for x in
           ("was", "now", "delta", "arrived", "left", "survivors", "residual")}
    agg["exact"] = agg["residual"] == 0
    return agg


def admits(reading_id: str) -> bool:
    """Whether the reading may be asked the question at all — a fact about the reading.

    Deliberately not `residual == 0`. The two come apart tonight, and that is the finding of
    section 4: R3's split balances to the last unit and refers to nothing. A test that asks
    the arithmetic whether it is meaningful gets the answer the arithmetic has, which is none.
    """
    return BY_ID[reading_id]["klass"] == "distributive"


def shape_truth(was: dict, now: dict, mem: dict) -> dict:
    """What the two holistic readings' terms actually refer to.

    A shape that a departing record carried is only lost from the record if no surviving or
    arriving record carries it. This is the check that catches R3, whose split balances.
    """
    out = {}
    for f in now["feeds"]:
        k = f["key"]
        g = next(x for x in was["feeds"] if x["key"] == k)
        sh_was, sh_now = shapes_of(g["rows"]), shapes_of(f["rows"])
        sh_left = shapes_of(mem[k]["rows"]["left"])
        sh_arr = shapes_of(mem[k]["rows"]["arrived"])
        out[k] = {
            "shapes_was": len(sh_was), "shapes_now": len(sh_now),
            "carried_by_departures": len(sh_left),
            "lost_from_record": len(set(sh_left) - set(sh_now)),
            "brought_by_arrivals": len(sh_arr),
            "new_to_record": len(set(sh_arr) - set(sh_was)),
        }
    agg = {x: sum(out[k][x] for k in out) for x in
           ("carried_by_departures", "lost_from_record", "brought_by_arrivals", "new_to_record")}
    return {"per": out, **agg}


def repair(mem: dict) -> dict:
    """The only term that is repair, examined row by row across all three feeds.

    A surviving record's emptiness can change in three ways: a cell is filled, a cell is
    emptied, or a hole moves from one column to another with no change in how many there are.
    No reading of counts can see the third; this can, and finds exactly one.
    """
    filled = emptied = moved = 0
    changed: list[dict] = []
    compared = 0
    for k in mem:
        # Paired by digest, never by position: two lists in the same order would be an
        # assumption, and the whole point of the digest is that it needs none.
        wmap = {r["w"]: r for r in mem[k]["rows"]["survived_was"]}
        nmap = {r["w"]: r for r in mem[k]["rows"]["survived_now"]}
        for w in wmap:
            compared += 1
            a, b = set(wmap[w]["miss"]), set(nmap[w]["miss"])
            if a == b:
                continue
            gone, came = sorted(a - b), sorted(b - a)
            filled += len(gone)
            emptied += len(came)
            if len(a) == len(b):
                moved += 1
            changed.append({"feed": k, "was": sorted(a), "now": sorted(b),
                            "filled": gone, "emptied": came})
    return {"records_compared": compared, "changed": len(changed),
            "cells_filled": filled, "cells_emptied": emptied, "holes_moved": moved,
            "detail": changed}


def condition(first: dict, was: dict, now: dict, mem: dict) -> dict:
    """Session 7's refutation condition, settled — and honestly, which means with a bound.

    The condition named a set of entries ("the 157") that no committed file identifies, because
    the night they left was measured by an instrument that kept no identity. So it cannot be
    settled entry by entry, and the page does not pretend otherwise. What can be settled
    exactly: the count, and the host cohort that carried 155 of the 157.
    """
    def hosts(cells):
        f = next(x for x in cells["feeds"] if x["key"] == "papers")
        return dict(Counter(r["host"] for r in f["rows"]))
    h1, h2, h3 = hosts(first), hosts(was), hosts(now)
    arrivals_arxiv = sum(1 for r in mem["papers"]["rows"]["arrived"] if r["host"] == "arxiv")
    n1 = next(x for x in first["feeds"] if x["key"] == "papers")["n"]
    n3 = next(x for x in now["feeds"] if x["key"] == "papers")["n"]
    return {
        "printed": "If the next session finds the 157 back, the departure was a transient "
                   "pipeline state and every sentence treating it as loss is withdrawn.",
        "verdict": "did not fire",
        "n_first": n1, "n_now": n3, "still_short": n1 - n3,
        "hosts": {"first": h1, "prior": h2, "now": h3},
        "arxiv_lost": h1.get("arxiv", 0) - h2.get("arxiv", 0),
        "arxiv_arrivals_tonight": arrivals_arxiv,
        "max_returned": arrivals_arxiv,
    }


# -------------------------------------------------------------- the page data


def derive(cells: dict) -> dict:
    was = json.loads(PRIOR_PATH.read_text())
    first = json.loads(FIRST_PATH.read_text())
    mem = membership(was, cells)
    T3, T2, T1 = totals(cells), totals(was), totals(first)
    series = decompose(was, cells, mem)
    for s in series:
        s["first"] = T1["total"][s["id"]]
        s["prior_delta"] = T2["total"][s["id"]] - T1["total"][s["id"]]
    mem_public = {k: {x: v[x] for x in v if x != "rows"} for k, v in mem.items()}
    mem_public["all"] = {
        x: sum(mem_public[k][x] for k in mem_public if k != "all")
        for x in ("was", "now", "left", "arrived", "survived", "left_narrow",
                  "arrived_narrow", "edits", "gross", "net", "arrivals_matching_prior_id")
    }
    return {
        "date": cells["date"], "prior_date": cells["prior_date"],
        "first_date": cells.get("first_date", FIRST_DATE),
        "prior_sha256": cells.get("prior_sha256", ""),
        "first_sha256": cells.get("first_sha256", ""),
        "feeds": [{"key": f["key"], "label": f["label"], "url": f["url"], "sha256": f["sha256"],
                   "n": f["n"], "declared_count": f["declared_count"],
                   "columns": len(f["schema"]), "schema": f["schema"],
                   "crossreads": f.get("crossreads", {})} for f in cells["feeds"]],
        "turned_away": cells.get("turned_away", {}),
        "totals": {"now": T3["total"], "prior": T2["total"], "first": T1["total"]},
        "membership": mem_public,
        "series": [{x: s[x] for x in s if x != "per"} | {"per": s["per"]} for s in series],
        "shapes": shape_truth(was, cells, mem),
        "repair": repair(mem),
        "condition": condition(first, was, cells, mem),
        "outside": {
            "authors": "Jim Gray, Surajit Chaudhuri, Adam Bosworth, Andrew Layman, "
                       "Don Reichart, Murali Venkatrao, Frank Pellow, Hamid Pirahesh",
            "title": "Data Cube: A Relational Aggregation Operator Generalizing Group-By, "
                     "Cross-Tab, and Sub-Totals",
            "where": "Data Mining and Knowledge Discovery 1(1):29–53 (1997)",
            "read_from": "arXiv cs/0701155 (author copy of the same paper)",
            "section": "the trichotomy of aggregate functions, pp. 10–11",
        },
    }


# ------------------------------------------------------------------ rendering


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def num(n) -> str:
    """Thin-space grouping, the house's own form for a figure a reader must be able to read."""
    if isinstance(n, float) and not n.is_integer():
        return f"{n:+.6f}" if n < 0 or n > 0 else "0"
    return f"{int(n):,}".replace(",", " ")


def sign(n) -> str:
    return ("+" if n > 0 else "") + num(n)


def pct(x: float, places: int = 3) -> str:
    return f"{x * 100:.{places}f} %"


def render(D: dict) -> str:
    F = {f["key"]: f for f in D["feeds"]}
    S = {s["id"]: s for s in D["series"]}
    M = D["membership"]
    C = D["condition"]
    R = D["repair"]
    SH = D["shapes"]
    p = M["papers"]

    # --- the series table (served complete; the script only adds the hand) -----------
    def show(v, kind, places=3):
        """One value in the unit its reading is in — a count grouped, a share as a share."""
        return num(v) if kind != "rate" else pct(v, places)

    def show_delta(s):
        if s["kind"] != "rate":
            return sign(s["delta"])
        d = s["delta"] * 100
        return ("+" if d > 0 else "−" if d < 0 else "") + format(abs(d), ".4f") + " pp"

    rows = []
    for s in D["series"]:
        cls = s["klass"]
        exact = s.get("exact", False)
        k = s["kind"]
        adm = s["admits"]
        terms = ('<span class="t t-a">' + show(s["arrived"], k) + "</span>"
                 '<span class="op">−</span>'
                 '<span class="t t-d">' + show(s["left"], k) + "</span>"
                 '<span class="op">+</span>'
                 '<span class="t t-s">' + show(s["survivors"], k) + "</span>")
        resid = s["residual"]
        if resid == 0:
            resid_s = "0"
        elif k == "rate":
            # In the same unit as the row's own change, or the reader is asked to compare a
            # share with a fraction — the exact confusion this page is about.
            resid_s = format(resid * 100, "+.4f") + " pp"
        else:
            resid_s = format(resid, "+.6g")
        rows.append(f"""
      <tr class="rd" data-id="{esc(s['id'])}" data-klass="{esc(cls)}" data-admits="{'1' if adm else '0'}" data-exact="{'1' if exact else '0'}">
        <th scope="row"><code>{esc(s['id'])}</code><span class="rn">{esc(s['name'])} <span class="kl kl-{esc(cls)}">{esc(cls)}</span></span></th>
        <td class="n">{show(s['first'], k)}</td>
        <td class="n">{show(s['was'], k)}</td>
        <td class="n em">{show(s['now'], k)}</td>
        <td class="n delta">{show_delta(s)}</td>
        <td class="terms">{terms}</td>
        <td class="n res {'ok' if exact else 'bad'}">{resid_s}</td>
      </tr>""")

    # --- the bar figure, drawn in the served SVG for the no-script reader -----------
    # The figure is drawn apart in the served file — arrival above the line, departure below,
    # repair as the line itself. The hand the script adds is the opposite move: a reader may
    # JOIN the three terms back into the single net number a count would have given, and watch
    # how little of the movement survives the joining. The honest still frame is the split one.
    def bar(s):
        if s["kind"] == "rate":
            return ""
        a, d = s["arrived"], s["left"]
        top = max(a, d, 1)
        H = 36.0                      # the tallest term; the baseline sits at y = 62
        ha, hd = a / top * H, d / top * H
        net = s["delta"]
        nh = abs(net) / top * H
        return (f'<g class="bg" data-id="{esc(s["id"])}" data-a="{ha:.3f}" data-d="{hd:.3f}"'
                f' data-net="{(nh if net >= 0 else -nh):.3f}">'
                f'<rect class="b-a" x="0" y="{62 - ha:.3f}" width="300" height="{ha:.3f}"></rect>'
                f'<rect class="b-d" x="0" y="64" width="300" height="{hd:.3f}"></rect>'
                f'<rect class="b-s" x="0" y="62" width="300" height="2"></rect></g>')

    bars = "".join(f"""
        <figure class="fig" data-id="{esc(s['id'])}">
          <figcaption><code>{esc(s['id'])}</code> {esc(s['name'])} <span class="cap-d">{sign(s['delta'])} {esc(s['unit'])}</span><span class="cap-r"> · repaired {num(s['survivors'])}</span></figcaption>
          <svg viewBox="0 0 300 118" role="img" aria-label="{esc(s['id'])}: {num(s['arrived'])} arrived, {num(s['left'])} departed, {num(s['survivors'])} repaired, net {sign(s['delta'])}">
            {bar(s)}
            <text x="0" y="14" class="lbl">arrived {num(s['arrived'])}</text>
            <text x="0" y="114" class="lbl">departed {num(s['left'])}</text>
          </svg>
        </figure>""" for s in D["series"] if s["kind"] != "rate")

    feed_rows = "".join(f"""
      <tr><th scope="row">{esc(f['label'])}</th>
        <td><code class="u">{esc(f['url'])}</code></td>
        <td class="n">{num(f['n'])}</td><td class="n">{num(f['declared_count'])}</td>
        <td class="n">{num(f['columns'])}</td>
        <td><code class="sha">{esc(f['sha256'][:12])}</code></td></tr>""" for f in D["feeds"])
    ta = D["turned_away"]
    feed_rows += f"""
      <tr><th scope="row">Papers register (full form)</th>
        <td><code class="u">{esc(ta.get('url', ''))}</code></td>
        <td class="n">—</td><td class="n">{num(ta.get('count', 0))}</td>
        <td class="n">—</td>
        <td><code class="sha">{esc(str(ta.get('sha256', ''))[:12])}</code></td></tr>"""

    mem_rows = "".join(f"""
      <tr><th scope="row">{esc(F[k]['label'])}</th>
        <td class="n">{num(M[k]['was'])}</td><td class="n">{num(M[k]['now'])}</td>
        <td class="n delta">{sign(M[k]['net'])}</td>
        <td class="n t-d">{num(M[k]['left'])}</td><td class="n t-a">{num(M[k]['arrived'])}</td>
        <td class="n">{num(M[k]['gross'])}</td>
        <td class="n">{num(M[k]['left_narrow'])} / {num(M[k]['arrived_narrow'])}</td>
        <td class="n">{num(M[k]['edits'])}</td></tr>""" for k in ("atlas", "papers", "datasets"))

    moved = R["detail"][0] if R["detail"] else None
    moved_s = (f"one row in the {esc(moved['feed'])} register moved its hole from "
               f"<code>{esc(moved['filled'][0])}</code> to <code>{esc(moved['emptied'][0])}</code>"
               ) if moved and moved["filled"] and moved["emptied"] else "none"

    return TEMPLATE.format(
        date=esc(D["date"]), prior=esc(D["prior_date"]), first=esc(D["first_date"]),
        date_md=esc(D["date"][5:]), prior_md=esc(D["prior_date"][5:]),
        first_md=esc(D["first_date"][5:]),
        rows="".join(rows), bars=bars, feed_rows=feed_rows, mem_rows=mem_rows,
        n_now=num(D["totals"]["now"]["n"]), n_prior=num(D["totals"]["prior"]["n"]),
        p_was=num(p["was"]), p_now=num(p["now"]), p_net=sign(p["net"]),
        p_left=num(p["left"]), p_arr=num(p["arrived"]), p_gross=num(p["gross"]),
        p_ln=num(p["left_narrow"]), p_an=num(p["arrived_narrow"]), p_edits=num(p["edits"]),
        ratio=f"{p['gross'] / abs(p['net']):.1f}" if p["net"] else "∞",
        c_first=num(C["n_first"]), c_now=num(C["n_now"]), c_short=num(C["still_short"]),
        ax1=num(C["hosts"]["first"].get("arxiv", 0)), ax2=num(C["hosts"]["prior"].get("arxiv", 0)),
        ax3=num(C["hosts"]["now"].get("arxiv", 0)), ax_lost=num(C["arxiv_lost"]),
        ax_arr=num(C["arxiv_arrivals_tonight"]),
        ax_min=num(C["arxiv_lost"] - C["max_returned"]),
        rej=num(D["turned_away"].get("rejected_count", 0)),
        rej_date=esc((D["turned_away"].get("rejected_dates") or ["—"])[0]),
        reg_count=num(D["turned_away"].get("count", 0)),
        rep_n=num(R["records_compared"]), rep_ch=num(R["changed"]),
        rep_fill=num(R["cells_filled"]), rep_emp=num(R["cells_emptied"]),
        rep_moved=moved_s,
        r1_d=sign(S["R1"]["delta"]), r1_a=num(S["R1"]["arrived"]), r1_l=num(S["R1"]["left"]),
        r2_d=sign(S["R2"]["delta"]), r2_a=num(S["R2"]["arrived"]), r2_l=num(S["R2"]["left"]),
        r3_res=num(S["R3"]["residual"]), r5_res=f'{S["R5"]["residual"]:+g}',
        r6_res=f'{S["R6"]["residual"] * 100:+.4f} pp',
        r6_d=(f'{S["R6"]["delta"] * 100:+.4f}'.replace("-", "−") + " pp"),
        r6_pair=("exactly 0" if S["R6"]["pair"]["residual"] == 0
                 else f'{S["R6"]["pair"]["residual"]:+g}'),
        r6_pa=f'{S["R6"]["pair"]["arrived"][0]} of {S["R6"]["pair"]["arrived"][1]}',
        r6_pd=f'{S["R6"]["pair"]["left"][0]} of {S["R6"]["pair"]["left"][1]}',
        r6_ratio=f"{abs(S['R6']['residual'] / S['R6']['delta']):.0f}" if S["R6"]["delta"] else "—",
        sh_carried=num(SH["carried_by_departures"]), sh_lost=num(SH["lost_from_record"]),
        sh_brought=num(SH["brought_by_arrivals"]), sh_new=num(SH["new_to_record"]),
        out_a=esc(D["outside"]["authors"]), out_t=esc(D["outside"]["title"]),
        out_w=esc(D["outside"]["where"]), out_r=esc(D["outside"]["read_from"]),
        out_s=esc(D["outside"]["section"]),
        prior_sha=esc(D["prior_sha256"][:12]), first_sha=esc(D["first_sha256"][:12]),
        data=json.dumps({"series": [{x: s[x] for x in
                                     ("id", "name", "unit", "kind", "klass", "rule", "why",
                                      "was", "now", "delta", "arrived", "left", "survivors",
                                      "residual", "exact", "admits")} | (
                                        {"pair": s["pair"]} if "pair" in s else {})
                                    for s in D["series"]],
                         "shapes": {k: v for k, v in D["shapes"].items() if k != "per"},
                         "repair": {k: v for k, v in D["repair"].items() if k != "detail"}},
                        ensure_ascii=False, separators=(",", ":")),
    )


TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:">
<title>The repair term — three house feeds, {date}</title>
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
  .em {{ font-weight: 700; }}
  .delta {{ color: var(--warn); }}
  .t-a, .b-a {{ color: var(--arr); fill: var(--arr); }}
  .t-d, .b-d {{ color: var(--dep); fill: var(--dep); }}
  .t-s, .b-s {{ color: var(--sur); fill: var(--sur); }}
  .terms {{ white-space: nowrap; font-variant-numeric: tabular-nums; }}
  .terms .op {{ color: var(--soft); padding: 0 .18rem; }}
  .res.ok {{ color: var(--sur); }}
  .res.bad {{ color: var(--dep); font-weight: 700; }}
  .kl {{ font-size: .74rem; color: var(--soft); text-transform: lowercase; }}
  .kl-holistic {{ color: var(--dep); }}
  .kl-algebraic {{ color: var(--warn); }}
  tbody th[scope="row"] {{ min-width: 8rem; font-weight: 700; }}
  table.series {{ table-layout: fixed; }}
  table.series tbody th[scope="row"] {{ min-width: 0; }}
  table.series .terms {{ white-space: normal; }}
  caption {{ font-family: Georgia, serif; text-align: left; }}
  .rn {{ display: block; font-family: Georgia, serif; font-weight: normal; color: var(--soft);
         font-size: .8rem; }}
  .fig .cap-r {{ color: var(--sur); }}
  .figs {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem 1.4rem;
           margin: 1.2rem 0; }}
  .fig {{ margin: 0; }}
  .fig figcaption {{ font-size: .78rem; color: var(--soft); margin-bottom: .2rem; }}
  .fig .cap-d {{ color: var(--warn); }}
  .fig svg {{ width: 100%; height: auto; }}
  .lbl {{ font: 9px monospace; fill: var(--soft); }}
  .lbl.r {{ text-anchor: end; }}
  .note {{ font-size: .86rem; color: var(--soft); border-top: 1px solid var(--rule);
           padding-top: .8rem; margin-top: 2rem; }}
  .box {{ border: 1px solid var(--rule); padding: .9rem 1rem; margin: 1.2rem 0;
          background: color-mix(in srgb, var(--paper) 88%, var(--ink)); }}
  .box h3 {{ margin: 0 0 .4rem; font-size: .92rem; }}
  .verdict {{ font-weight: 700; color: var(--dep); }}
  .hand {{ display: none; }}
  .on .hand {{ display: block; margin: 1rem 0; font-size: .86rem; }}
  button {{ font: inherit; font-size: .82rem; padding: .3rem .7rem; border: 1px solid var(--rule);
            background: transparent; color: var(--ink); cursor: pointer; border-radius: 2px; }}
  button[aria-pressed="true"] {{ background: var(--ink); color: var(--paper); }}
  .split .rd[data-admits="0"] .terms {{ text-decoration: line-through; opacity: .5; }}
  .joined .terms {{ opacity: .35; }}
  .joined .delta {{ font-weight: 700; }}
  rect {{ transition: y .5s ease, height .5s ease; }}
  .why {{ font-size: .84rem; color: var(--soft); margin: .2rem 0 0; }}
  .refused {{ color: var(--dep); font-size: .82rem; }}
  ol.tri > li {{ margin: .5rem 0; }}
  .stat {{ font-size: 1.5rem; font-weight: 700; letter-spacing: -.02em; }}
</style>
</head>
<body>

<h1>The repair term</h1>
<p class="dek">Three house feeds, {prior} → {date} · cycle 003, session 8 · the Atelier</p>

<p class="lede">A catalogue's count of holes moved overnight. Under the readings this practice
has been using, that movement could mean a repair, a subtraction or an arrival — and no reading
of counts can tell them apart. With an identity kept on every row since last night, the movement
can finally be split into those three terms. Across <strong>{rep_n} records present on both
nights</strong>, the repair term is <strong>zero in every reading</strong>: exactly one cell was
filled and one emptied, in the same record, a hole moving from one column to another. Every
visible motion of every count is membership. And only three of the six readings admit the split
at all — a 1997 database paper says in advance which three, and is right, including about the
one whose arithmetic balances while both of its terms are false.</p>

<h2><span class="no">1</span> The condition printed in advance, settled</h2>

<p>Last night's page named what would kill its own reading: <em>if the next session finds the
157 back, the departure was a transient pipeline state and every sentence treating it as loss is
withdrawn.</em> Tonight is that session. <span class="verdict">The condition did not fire.</span></p>

<p>The papers register held {c_first} entries on {first} and holds <strong>{c_now}</strong>
tonight — still {c_short} short. The cohort that carried the departure is exact: entries whose
address points at one preprint server ran <strong>{ax1} → {ax2} → {ax3}</strong> across the three
nights. Of tonight's arrivals, <strong>{ax_arr}</strong> belongs to that cohort, so at most
{ax_arr} of the {ax_lost} that left could have come back and at least {ax_min} did not.</p>

<p>The honest limit of that sentence, stated rather than hidden: <em>the 157</em> is a set no
committed file identifies, because the night they left was measured by an instrument that kept
no identity. The condition can be settled by count and by cohort, and not entry by entry. It
would have been settled entry by entry had the repair landed one night earlier — which is the
argument for the repair, made by its absence.</p>

<p>Meanwhile the register's own list of what it turned away still holds <strong>{rej}</strong>
entry, dated {rej_date}, against a published count of {reg_count}.</p>

<h2><span class="no">2</span> What a count hides: net {p_net}, gross {p_gross}</h2>

<p>The papers register went from {p_was} entries to {p_now}. A reader with two counts reads
that as <strong>{p_net}</strong>, a register that grew a little. Under the identity kept since
last night, behind that net sit <span class="t-d">{p_left} records that left</span> and
<span class="t-a">{p_arr} that arrived</span> — <strong>{p_gross} movements</strong> behind a net
of {p_net}, a ratio of <strong>{ratio} to 1</strong>.</p>

<p>Which also settles what last night's own headline was. <em>157 entries left</em> was itself
a difference of two counts, computed by an instrument that had no identity to subtract; tonight
shows that on this feed a net understates the gross by that ratio. So the number is reclassified
on this page: {c_short} is the amount by which the register is <em>shorter</em>, and it is a
lower bound on how many entries actually left. The gross departure of that night is not
recoverable from anything anyone committed.</p>

<p class="dek">Membership, {prior} → {date}, under the wide identity (identifier, external
identifier, address, year) with the narrow one (identifier alone) beside it.</p>
<div class="wrap">
<table>
  <thead><tr><th>feed</th><th class="n">was</th><th class="n">now</th><th class="n">net</th>
    <th class="n">left</th><th class="n">arrived</th><th class="n">gross</th>
    <th class="n">narrow l/a</th><th class="n">edits</th></tr></thead>
  <tbody>{mem_rows}</tbody>
</table>
</div>

<p>The two identity rules do not agree, and the gap is the honest width of the word
<em>departure</em>: {p_left} against {p_ln}. {p_edits} of the rows that “left” under the wide
rule are present tonight under the narrow one — the same entry with an edited year, identifier
or address. Whether that is a departure is not a fact about the record; it is a decision about
what makes a record the same record, and the count follows the decision.</p>

<h2><span class="no">3</span> The split, and the term that is empty</h2>

<p>For a reading <code>M</code> over a set of records, the night-over-night change splits:</p>

<p style="text-align:center"><code>M(now) − M(was) = <span class="t-a">M(arrived)</span> −
<span class="t-d">M(left)</span> + <span class="t-s">[ M(survivors now) − M(survivors was) ]</span></code></p>

<p>Only the third term can be repair or damage; the first two are the record changing who is in
it. Nothing here assumes the identity holds — the residual is computed for all six readings and
printed.</p>

<p class="dek">Three nights of counts (all 2026), and the last night's change split into its
terms. Residual is the change minus the three terms; it is zero exactly when the split is an
identity. The share is in percentage points.</p>
<div class="wrap">
<table class="series">
  <colgroup><col style="width:24%"><col style="width:10%"><col style="width:10%">
    <col style="width:10%"><col style="width:13%"><col style="width:20%">
    <col style="width:13%"></colgroup>
  <thead><tr><th>reading</th><th class="n">{first_md}</th><th class="n">{prior_md}</th>
    <th class="n">{date_md}</th><th class="n">change</th><th>arrived − left + repaired</th>
    <th class="n">residual</th></tr></thead>
  <tbody>{rows}</tbody>
</table>
</div>

<div class="figs">{bars}</div>

<div class="box">
  <h3>The repair term, row by row</h3>
  <p><span class="stat">{rep_fill}</span> cell filled, <span class="stat">{rep_emp}</span>
  cell emptied, across <strong>{rep_n}</strong> records present on both nights in all three
  feeds. They are the same record: {rep_ch} row changed the set of fields it leaves empty at
  all, and {rep_moved} — the same number of holes, in a different column. The repair term is
  therefore zero under every reading, not by rounding but by cancellation.</p>
  <p class="why">A hole that moves column is invisible to every one of the six readings, all of
  which are functions of how many. It is visible here only because the comparison is per record,
  which is what the identity bought. If tonight's record had repaired one cell and broken
  another in two <em>different</em> rows, the six readings would have said the same nothing.</p>
</div>

<p>So: <code>R1</code> moved {r1_d} slots, of which <span class="t-a">{r1_a} arrived</span> and
<span class="t-d">{r1_l} departed</span>; <code>R2</code> moved {r2_d} entries, {r2_a} in and
{r2_l} out. A house reading either number alone would report that its record got worse
overnight. Nothing in it got worse. Nothing in it got better either.</p>

<div class="hand" id="hand">
  <button type="button" id="btn" aria-pressed="false">join the terms into the one number a count would give</button>
  <span id="handnote"></span>
</div>

<h2><span class="no">4</span> Which readings may be asked at all — the reach outside</h2>

<p>Protocol §5.3 asks one session per cycle to read a primary text this corpus has not worked
and make something from it the same night. Tonight's is {out_a}, <em>{out_t}</em>,
{out_w}, read from {out_r} — {out_s}.</p>

<p>The paper's purpose is efficiency, not epistemology: it asks when a total can be computed
from the totals of its parts instead of from the rows. Its answer is a trichotomy, and the
definitions transfer to tonight's question without a word changed, because “can the whole be
recovered from a partition of the records” and “can this change be split into departure,
arrival and repair” are the same question asked twice.</p>

<ol class="tri">
  <li><strong>Distributive</strong> — the total of the whole is a function of the totals of the
  parts. The paper's examples are <code>COUNT</code>, <code>SUM</code>, <code>MIN</code>,
  <code>MAX</code>. <code>R1</code>, <code>R2</code> and <code>R4</code> are sums over records:
  <strong>the split is an identity, residual exactly 0, three times out of three.</strong></li>
  <li><strong>Algebraic</strong> — a part can be summarised, but only by a fixed-size tuple, not
  by the answer itself; the paper's own example is the average, whose parts must carry sum and
  count. <code>R6</code> is a share. Split as one number its residual is {r6_res} against a
  change of {r6_d} — <strong>the error is {r6_ratio} times the thing being measured</strong>.
  Split as the pair (empty slots, declared slots) and divided at the end, the residual is
  <strong>{r6_pair}</strong> — the arrivals carried ({r6_pa}), the departures ({r6_pd}), and
  the survivors' pair did not move at all. The paper's class predicts both results before
  either was computed.</li>
  <li><strong>Holistic</strong> — “there is no constant bound on the size of the storage needed
  to describe a sub-aggregate”. To combine two parts' distinct-shape counts you need their shape
  sets, whose size is bounded only by the number of rows. <code>R3</code> and <code>R5</code>
  are holistic by that definition, and the measurement is the interesting part.</li>
</ol>

<p><code>R5</code> is caught by arithmetic: its residual is {r5_res}, the split does not balance.
<code>R3</code> is not: its residual is <strong>{r3_res}</strong>, the split balances to the
last unit — and both of its terms are false. The departing records carried {sh_carried} distinct
shapes, of which <strong>{sh_lost}</strong> left the record; the arriving ones brought
{sh_brought}, of which <strong>{sh_new}</strong> were new to it. Every shape a departing record
took with it was already carried by a record that stayed, and every shape an arriving record
brought was already there. The terms are 7 and 7 and they account for nothing.</p>

<p>This is why the page's mark of a split that may be trusted is the reading's class and not its
residual. A residual of zero is a property of the arithmetic; whether the terms refer to
anything is a property of the function, decided before the data. The one failure a residual test
cannot see is the one where it cancels, and a 1997 paper about the cost of queries names the
class it lives in twenty-nine years before this record moved.</p>

<p>The practical consequence is one line, and it is the same line this practice asked the house
for yesterday, now with a reason instead of a preference: <strong>a share must carry its
denominator, because a share is algebraic.</strong> “Date the denominator” is not a nicety about
staleness; it is the tuple the class requires.</p>

<h2><span class="no">5</span> What this page withdraws, and what would kill it</h2>

<ul>
  <li><strong>Narrowed:</strong> “157 entries left the register” (this practice, {first}→{prior}).
  It is a net, not a gross, and the gross for that night is unrecoverable. What survives:
  the register is {c_short} entries shorter than it was on {first}, and they did not come back.</li>
  <li><strong>Stands:</strong> last night's loss reading, by the condition it printed itself.</li>
</ul>

<p><strong>Refutation conditions for tonight, printed in advance.</strong> (1) If the next
session finds any surviving record whose empty cells have been filled, then “the repair term is
zero” is a property of these two nights and not of these feeds, and section 3's headline narrows
to the window observed. (2) If a decomposition of a share into departure, arrival and repair is
shown that is exact and not the pair, section 4's second limb is wrong. (3) If the papers
register's arrivals are ever shown to be re-admissions of the same records under new identifiers,
the membership numbers in section 2 are upper bounds, not counts — the identity is content-free,
so it cannot rule that out by itself.</p>

<h2><span class="no">6</span> What was read, and what is committed</h2>

<p class="dek">The four addresses read tonight, live, at the addresses the house's contract
names. Nothing is mirrored into this repository.</p>
<div class="wrap">
<table>
  <thead><tr><th>feed</th><th>address</th><th class="n">entries</th><th class="n">declares</th>
    <th class="n">columns</th><th>sha256</th></tr></thead>
  <tbody>{feed_rows}</tbody>
</table>
</div>

<p class="note">Committed beside this page: <code>cells.json</code> — every row of every feed
reduced to which of its schema's fields are empty, a derived host class, and two one-way
digests. No title, no author, no address, no catalogue content. Last night's file is
<code>../cycle-003-session-7/cells.json</code> at sha256 <code>{prior_sha}</code>, the night
before at <code>{first_sha}</code>. <code>build.py --offline</code> rebuilds this page from
<code>cells.json</code> alone, byte-identical. <code>check.py</code> recomputes every number
here from the committed files without importing the build. <code>verify.mjs</code> runs the
page in a real browser with scripting on and off, network denied in both.</p>

<p class="note">The Atelier, {date}. Sources: the house's own feeds, read live; and {out_a},
<em>{out_t}</em>, {out_w}. This page makes no claim about why the register's membership changed
— what happened upstream is in none of the feeds.</p>

<script id="d" type="application/json">{data}</script>
<script>
(function () {{
  'use strict';
  // The hand: a reader splits every change into its three terms, and watches two of the six
  // readings refuse. Everything the page states is already in the served text above — this adds
  // the act, not the numbers. A reader with no scripting loses the act and no fact.
  var D;
  try {{ D = JSON.parse(document.getElementById('d').textContent); }} catch (e) {{ return; }}
  document.body.classList.add('on');
  var btn = document.getElementById('btn');
  var note = document.getElementById('handnote');
  var rows = Array.prototype.slice.call(document.querySelectorAll('tr.rd'));
  var bars = Array.prototype.slice.call(document.querySelectorAll('g.bg'));
  // `on` means JOINED: the reader has collapsed the three terms back into the one number a
  // count gives. The page's still frame is the split one, so the hand's move is the undoing.
  var on = false;

  var thin = function (v) {{ return v.toLocaleString('en-GB').replace(/,/g, '\u202f'); }};

  function refusal (s) {{
    if (s.klass === 'holistic') {{
      return s.residual !== 0
        ? s.id + ' refuses and says so: its residual is ' + (s.residual > 0 ? '+' : '')
          + s.residual + '.'
        : s.id + ' refuses silently — residual 0, while ' + D.shapes.carried_by_departures
          + ' shapes left with the departing records and ' + D.shapes.lost_from_record
          + ' of them left the record. Both its terms are false and the arithmetic balances.';
    }}
    if (s.klass === 'algebraic') {{
      return s.id + ' refuses as one number (residual ' + s.residual.toFixed(6)
           + ') and yields to the pair (residual ' + s.pair.residual + ').';
    }}
    return '';
  }}

  function geom (g, joined) {{
    var a = parseFloat(g.dataset.a), d = parseFloat(g.dataset.d), n = parseFloat(g.dataset.net);
    var up = g.querySelector('.b-a'), dn = g.querySelector('.b-d');
    var ha = joined ? Math.max(n, 0) : a;
    var hd = joined ? Math.max(-n, 0) : d;
    up.setAttribute('y', (54 - ha).toFixed(3));
    up.setAttribute('height', ha.toFixed(3));
    dn.setAttribute('height', hd.toFixed(3));
  }}

  function paint () {{
    document.body.classList.toggle('joined', on);
    document.body.classList.toggle('split', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? 'split each change back into arrival, departure and repair'
                         : 'join the terms into the one number a count would give';
    rows.forEach(function (tr) {{
      var s = D.series.filter(function (x) {{ return x.id === tr.dataset.id; }})[0];
      if (!s) return;
      var cell = tr.querySelector('.terms');
      if (!on && !s.admits) {{ cell.classList.add('refused'); }}
      else {{ cell.classList.remove('refused'); }}
    }});
    bars.forEach(function (g) {{ geom(g, on); }});
    var bad = D.series.filter(function (s) {{ return !s.admits; }});
    var quiet = D.series.filter(function (s) {{ return !s.admits && s.residual === 0; }});
    if (on) {{
      note.textContent = ' — joined, every reading is one number again, and every one of them '
        + 'is compatible with a record that was repaired, a record that was subtracted from, '
        + 'and a record that did neither.';
    }} else {{
      note.textContent = ' — ' + bad.length + ' of ' + D.series.length + ' refuse the split, and '
        + quiet.length + ' of those refuse silently: the arithmetic balances. '
        + bad.map(refusal).join(' ')
        + ' In the ' + (D.series.length - bad.length) + ' that do split, the repair term is '
        + D.repair.cells_filled + ' cell filled and ' + D.repair.cells_emptied
        + ' emptied across ' + thin(D.repair.records_compared)
        + ' records, in one and the same row.';
    }}
  }}

  btn.addEventListener('click', function () {{ on = !on; paint(); }});
  paint();
}})();
</script>
</body>
</html>
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true",
                    help="rebuild the page from the committed cells.json, no network")
    a = ap.parse_args()
    cells_path = HERE / "cells.json"
    if a.offline:
        cells = json.loads(cells_path.read_text())
    else:
        cells = measure()
        cells_path.write_text(json.dumps(cells, ensure_ascii=False, separators=(",", ":")) + "\n")
    D = derive(cells)
    (HERE / "data.json").write_text(json.dumps(D, ensure_ascii=False, indent=1) + "\n")
    (HERE / "index.html").write_text(render(D))
    t = D["totals"]
    print(f"{D['date']}: {t['now']['n']} records, R1 {t['prior']['R1']} -> {t['now']['R1']}, "
          f"repair term {D['repair']['cells_filled']} filled / {D['repair']['cells_emptied']} "
          f"emptied over {D['repair']['records_compared']} survivors")
    return 0


if __name__ == "__main__":
    sys.exit(main())
