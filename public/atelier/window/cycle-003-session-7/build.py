#!/usr/bin/env python3
"""build.py — the record moved overnight, and no reading of it can say so.

Cycle 003 (*Missing Data Art*) was presented on 2026-09-13 by all three practices; `cycle.json`
still reads cycle 3, `working`, and turning it is not a practice's act. This is the seventh
session on the question, in the gap, and it is the direct successor of session 6 (2026-09-14),
which measured all three of the house's feeds and found that **the unit is not in the record**:
the same catalogues, at one instant, answer *how many holes do you have?* with 2 489, 1 641,
1 909, 1 805 and 14, every number exact.

Session 6 read the feeds at one instant. Tonight reads them again, twenty-four hours later, and
the instrument that was built to count holes meets something it was not built for.

  **Between the two nights the papers register lost 157 of its 1 064 entries** — 155 of them
  entries whose address is an arXiv address (195 → 40). The atlas is byte-identical. The
  register's own `rejected` list, which exists precisely to hold what it turned away, carries
  **one** entry, dated 2026-07-30. What happened upstream is not in the feed, and this file
  asserts no cause for it.

  **Read six admissible ways, the two nights disagree about the direction of the change.**
  Three readings fall (the record improved), two do not move at all (nothing happened), one
  rises (it got worse). Every one of the six is exact and none of them is wrong.

  **Not one of the six can see the departure.** A hole is a property of an entry that is
  present; an entry that leaves takes its holes with it, so a catalogue that loses a seventh
  of itself reads, to a hole counter, as a catalogue that was repaired.

The apparatus for the second half of this is borrowed, and the borrowing is the session's reach
outside: **certain answers**, the standard notion in the theory of incomplete-information
databases. Leonid Libkin, *Incomplete Data: What Went Wrong, and How to Fix It*, PODS'14
(ACM, 2014), §2 defines them as `certain(Q,D) = ⋂ {Q(D′) | D′ ∈ [[D]]}` — the answers that hold
"no matter how the missing information is interpreted", where `[[D]]` is the set of complete
databases the incomplete one represents. Transferred here, one word changes: the set quantified
over is not the completions of the record but the **readings** of it, since session 6 established
that the record names none. A statement about a catalogue's absences is *certain* when it holds
under every admissible reading. The ledger on the page is that quantifier, run over fourteen
statements of the kind this house actually publishes — four of them published by this practice.

And the transfer brings Libkin's own objection with it, which is why it is worth making. §3 of
the same paper, under *Are certain answers certain?*: taking the intersection "amounts to
removing data, not information", and can even add information. Tonight's ledger shows the
sharper version of that from the other side: a statement can be certain under every reading and
still be worthless, because all the readings share one blind spot, and the blind spot is the
frame — who was in the record when the sentence was written.

    python3 window/cycle-003-session-7/build.py           # fetch, measure, write cells/data/index
    python3 window/cycle-003-session-7/build.py --check   # rebuild from cells.json, byte-identical

The three feeds are read live at the addresses `SITE-API.md` names and are NEVER mirrored here.
What is committed beside the page is the measurement: `cells.json` holds one emptiness bitmap
per record and no catalogue content at all. One thing is new in it, and it is this session's
repair of its own instrument: **each row carries a content-free identity digest**, the first
sixteen hex characters of a SHA-256 over the feed key and the entry's own identifier. Last
night's file recorded emptiness and threw identity away, which is exactly why tonight can say
that 157 entries left and cannot say which. With the digests, the next session can.

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
PRIOR_PATH = HERE.parent / "cycle-003-session-6" / "cells.json"
DATE = "2026-09-15"
PRIOR_DATE = "2026-09-14"

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
        # Columns the record itself shows are not gaps. The atlas's curator's note is an
        # optional annotation carried by 2 of 521 entries; session 6 established that reading
        # and it is kept unchanged so the two nights are compared under one rule.
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
        # Session 6's cross-read: every empty cell in this register is its success convention
        # (an empty probe note on an HTTP 200, an empty status where the note says no exchange
        # took place). Not one of them is a gap.
        "convention_fields": [],
        "convention_all": True,
    },
]


# ---------------------------------------------------------------- measuring


def is_empty(value) -> bool:
    """An empty slot: the key is absent, or its value is null, "", [] or {}.

    Deliberately not "falsy": `false` and `0` are values a schema means, and counting them
    as holes is the first way a count of absences goes wrong.
    """
    return value is None or value == "" or value == [] or value == {}


def host_class(url: str | None) -> str:
    """A derived, content-free label for where an entry's address points."""
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


def digest(feed_key: str, entry: dict, id_fields: list[str]) -> str:
    """A content-free identity: one-way, stable between nights, useless for reconstruction.

    This is the repair session 6 needed and did not have. Sixteen hex characters of SHA-256
    over the feed key and the entry's own identifying fields: enough to intersect two nights
    and say which records left, not enough to recover a title from.
    """
    raw = "|".join([feed_key] + [str(entry.get(f, "")) for f in id_fields])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def fetch(url: str) -> tuple[dict, str]:
    """One GET, through the runtime's own HTTP client.

    `curl` rather than the standard library: the session runs behind a proxy that refuses the
    library's default request, and a fetch that works in the shell and not in the build is a
    difference this file should not hide.
    """
    raw = subprocess.run(
        ["curl", "-sS", "--fail", "--max-time", "120", "-H", "Accept: application/json", url],
        check=True, capture_output=True,
    ).stdout
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def measure() -> dict:
    """Fetch the three feeds and reduce them to emptiness bitmaps. No content is kept."""
    out = {"date": DATE, "prior_date": PRIOR_DATE, "feeds": []}
    for f in FEEDS:
        doc, sha = fetch(f["url"])
        entries = doc["entries"]
        rows = []
        for x in entries:
            rows.append({
                "k": digest(f["key"], x, f["id_fields"]),
                "w": digest(f["key"], x, f["wide_fields"]),
                "miss": [k for k in f["schema"] if k not in x or is_empty(x.get(k))],
                "host": host_class(x.get(f["url_field"])) if f["url_field"] else "none",
            })
        out["feeds"].append({
            "key": f["key"],
            "label": f["label"],
            "url": f["url"],
            "sha256": sha,
            "declared_count": doc.get("count"),
            "n": len(entries),
            "schema": f["schema"],
            "keys_seen": sorted({k for x in entries for k in x}),
            "rows": rows,
            "crossreads": crossreads(f["key"], entries),
        })
    out["prior_sha256"] = hashlib.sha256(PRIOR_PATH.read_bytes()).hexdigest()
    out["turned_away"] = turned_away()
    return out


def turned_away() -> dict:
    """What the papers register says it turned away, from the full feed.

    The page states that the register's own `rejected` list holds one entry: a claim about a
    feed the index form does not carry, so it is fetched and reduced here rather than asserted
    from a reading somebody did by hand. Reason codes and dates only — no entry content.
    """
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
    """Record-internal facts that decide whether an empty cell is a gap. Counts only."""
    if key == "datasets":
        ok = [x for x in entries if x.get("pruef_status") == 200]
        blank_note = [x for x in entries if is_empty(x.get("pruef_vermerk"))]
        blank_status = [x for x in entries if is_empty(x.get("pruef_status"))]
        return {
            "probe_ok": len(ok),
            "probe_ok_with_blank_note": sum(1 for x in ok if is_empty(x.get("pruef_vermerk"))),
            "blank_note": len(blank_note),
            "blank_note_with_probe_ok": sum(1 for x in blank_note if x.get("pruef_status") == 200),
            "blank_status": len(blank_status),
            "blank_status_with_note": sum(
                1 for x in blank_status if not is_empty(x.get("pruef_vermerk"))
            ),
            "access_blocked": sum(1 for x in entries if x.get("zugang_gesperrt") is True),
        }
    if key == "papers":
        arx = [x for x in entries if host_class(x.get("url")) == "arxiv"]
        # Does the register's own identifier identify? Field NAMES and counts only.
        by_id: dict[str, list[dict]] = {}
        for x in entries:
            by_id.setdefault(str(x.get("id")), []).append(x)
        shared = {i: xs for i, xs in by_id.items() if len(xs) > 1}
        differ = sorted({
            f for xs in shared.values() for f in xs[0]
            if any(y.get(f) != xs[0].get(f) for y in xs[1:])
        })
        return {
            "arxiv_entries": len(arx),
            "arxiv_without_venue": sum(1 for x in arx if is_empty(x.get("ort"))),
            "arxiv_with_venue": sum(1 for x in arx if not is_empty(x.get("ort"))),
            "identifier_present": sum(1 for x in entries if not is_empty(x.get("kennung"))),
            "ids_shared": len(shared),
            "entries_on_shared_ids": sum(len(xs) for xs in shared.values()),
            "max_entries_on_one_id": max([len(xs) for xs in shared.values()] or [1]),
            "fields_differing_within_a_shared_id": differ,
        }
    return {}


# ------------------------------------------------------------ the readings
#
# Six readings of one record. Five are counts, one is a rate; every one of them is exact, and
# the record names none of them. Session 6 published five, one of which (its R5) was fitted by
# hand to the single repeated shape it had found. A rule fitted to a case cannot be carried to
# a second night, so it is replaced here by the general form of the same idea, and BOTH nights
# are recomputed under the six rules below. Where a number differs from the one published on
# 2026-09-14, the difference is the rule, not the record, and the page says so.


def cells_of(rows: list[dict]) -> int:
    return sum(len(r["miss"]) for r in rows)


def conv_cells(feed: dict, rows: list[dict]) -> int:
    """Empty cells the record itself shows are not gaps."""
    spec = next(f for f in FEEDS if f["key"] == feed["key"])
    if spec["convention_all"]:
        return cells_of(rows)
    fields = set(spec["convention_fields"])
    return sum(1 for r in rows for m in r["miss"] if m in fields)


def shapes_of(rows: list[dict]) -> Counter:
    return Counter(tuple(sorted(r["miss"])) for r in rows if r["miss"])


READINGS = [
    {
        "id": "R1", "name": "every empty slot", "unit": "slots", "kind": "count",
        "rule": "One hole per (entry, field) pair whose value is absent, null, an empty string, "
                "an empty list or an empty object.",
        "why": "The only reading a machine can take without knowing what any field means.",
    },
    {
        "id": "R2", "name": "every entry carrying a gap", "unit": "entries", "kind": "count",
        "rule": "One hole per entry with at least one empty slot, however many it has.",
        "why": "A catalogue is repaired entry by entry, so this is the number of repairs owed.",
    },
    {
        "id": "R4", "name": "slots the record shows are gaps", "unit": "slots", "kind": "count",
        "rule": "R1 less every empty cell the record itself explains: the datasets register's "
                "success convention (an empty probe note beside an HTTP 200) and the atlas's "
                "optional curator's note.",
        "why": "Session 6's finding, kept as a reading: an empty cell is not an absence.",
    },
    {
        "id": "R5", "name": "every distinct shape of gap", "unit": "shape-slots", "kind": "count",
        "rule": "One hole per (shape, field): entries empty in exactly the same fields are one "
                "shape, counted once however many entries carry it.",
        "why": "A repeated identical shape is one event upstream, not one event per entry. "
               "This is the general form of the rule session 6 fitted to a single case.",
    },
    {
        "id": "R3", "name": "every distinct shape, once", "unit": "shapes", "kind": "count",
        "rule": "One hole per distinct set of empty fields occurring in the record.",
        "why": "The coarsest defensible reading: how many kinds of absence are there at all.",
    },
    {
        "id": "R6", "name": "the share of slots left empty", "unit": "share", "kind": "rate",
        "rule": "Empty slots divided by all slots the schema declares.",
        "why": "The only reading that is not a count — and the one a reader reaches for when "
               "comparing records of different size.",
    },
]


def measures(feed: dict, rows: list[dict] | None = None) -> dict:
    """Every reading's value for a group of rows inside one feed."""
    spec = next(f for f in FEEDS if f["key"] == feed["key"])
    rows = feed["rows"] if rows is None else rows
    shapes = shapes_of(rows)
    return {
        "n": len(rows),
        "slots": len(rows) * len(spec["schema"]),
        "R1": cells_of(rows),
        "R2": sum(1 for r in rows if r["miss"]),
        "R4": cells_of(rows) - conv_cells(feed, rows),
        "R5": sum(len(s) for s in shapes),
        "R3": len(shapes),
        "R6": (cells_of(rows) / (len(rows) * len(spec["schema"]))) if rows else 0.0,
    }


def night(cells: dict) -> dict:
    """Reduce one night's bitmaps to everything the page states about it."""
    feeds = []
    for f in cells["feeds"]:
        spec = next(s for s in FEEDS if s["key"] == f["key"])
        m = measures(f)
        by_host = {}
        for h in ("arxiv", "doi", "other", "none"):
            rows = [r for r in f["rows"] if r["host"] == h]
            if rows:
                by_host[h] = measures(f, rows)
        fields = {}
        for col in spec["schema"]:
            fields[col] = sum(1 for r in f["rows"] if col in r["miss"])
        feeds.append({
            "key": f["key"], "label": f["label"], "url": f["url"], "sha256": f["sha256"],
            "n": f["n"], "declared_count": f["declared_count"], "schema": f["schema"],
            "m": m, "by_host": by_host, "fields": fields,
            "shapes": [
                {"fields": list(s), "count": c}
                for s, c in sorted(shapes_of(f["rows"]).items(), key=lambda kv: (-kv[1], kv[0]))
            ],
            "crossreads": f.get("crossreads", {}),
            "hosts": dict(Counter(r["host"] for r in f["rows"])),
            "keys": [r["k"] for r in f["rows"]] if f["rows"] and "k" in f["rows"][0] else [],
            "id_collisions": (len(f["rows"]) - len({r["k"] for r in f["rows"]})) if f["rows"] and "k" in f["rows"][0] else None,
            "wide_collisions": (len(f["rows"]) - len({r["w"] for r in f["rows"]})) if f["rows"] and "w" in f["rows"][0] else None,
        })
    total = {}
    for r in READINGS:
        if r["kind"] == "count":
            total[r["id"]] = sum(x["m"][r["id"]] for x in feeds)
    total["slots"] = sum(x["m"]["slots"] for x in feeds)
    total["n"] = sum(x["n"] for x in feeds)
    total["R6"] = total["R1"] / total["slots"]
    return {"date": cells["date"], "feeds": feeds, "by_key": {x["key"]: x for x in feeds},
            "total": total}


# ------------------------------------------------------------- the ledger
#
# Fourteen statements of the kind this house publishes — four of them published by this
# practice — each evaluated under every reading that can evaluate it. Certain: true under all
# of them. Refuted: false under all. Contingent: the readings disagree, and the sentence has no
# truth value until its reading is named. Blind: no reading of a single night can reach it.


def build_statements(now: dict, was: dict) -> list[dict]:
    S: list[dict] = []
    NO_RATE = "this reading is a share, and the statement compares parts of one total"
    NO_SHAPE = "this reading counts shapes, and the statement is about a level"

    def feeds_now(k):
        return now["by_key"][k]["m"]

    def feeds_was(k):
        return was["by_key"][k]["m"]

    # 1 -------------------------------------------------------------------
    def s1(r):
        m = {k: feeds_now(k)[r] for k in ("atlas", "papers", "datasets")}
        return m["papers"] > m["atlas"] and m["papers"] > m["datasets"]
    S.append({
        "id": "S1", "kind": "composition",
        "text": "Of the three catalogues, the papers register is the one missing most.",
        "note": "", "f": lambda r: s1(r),
    })

    # 2 -------------------------------------------------------------------
    def s2(r):
        m = {k: feeds_now(k)[r] for k in ("atlas", "papers", "datasets")}
        return m["datasets"] < m["atlas"] and m["datasets"] < m["papers"]
    S.append({
        "id": "S2", "kind": "composition",
        "text": "The datasets register is the most complete of the three.",
        "note": "", "f": lambda r: s2(r),
    })

    # 3 -------------------------------------------------------------------
    def s3(r):
        if r == "R6":
            return None, NO_RATE
        tot = now["total"][r]
        return max(feeds_now(k)[r] for k in ("atlas", "papers", "datasets")) * 2 > tot
    S.append({
        "id": "S3", "kind": "composition",
        "text": "More than half of what this house is missing sits in a single catalogue.",
        "note": "", "f": s3,
    })

    # 4 -------------------------------------------------------------------
    def s4(r):
        a = now["by_key"]["atlas"]
        note = a["fields"]["curator_note"]
        if r == "R1":
            return note * 2 > a["m"]["R1"]
        if r == "R2":
            return note * 2 > a["m"]["R2"]
        if r == "R4":
            # after the convention is taken out, the column is not a gap at all
            return 0 * 2 > a["m"]["R4"]
        if r in ("R3", "R5"):
            shaped = [s for s in a["shapes"] if "curator_note" in s["fields"]]
            if r == "R3":
                return len(shaped) * 2 > a["m"]["R3"]
            return sum(len(s["fields"]) for s in shaped) * 2 > a["m"]["R5"]
        return None, NO_RATE
    S.append({
        "id": "S4", "kind": "column", "practice": True,
        "text": "In the atlas, more than half of what is missing is the curator's note.",
        "note": "this practice published the count behind it on 2026-09-14",
        "f": s4,
    })

    # 5 -------------------------------------------------------------------
    def s5(r):
        p = now["by_key"]["papers"]
        if r in ("R1", "R2", "R6"):
            top = max(p["fields"].values())
            return p["fields"]["urteil"] == top and list(p["fields"].values()).count(top) == 1
        if r == "R3":
            per = Counter()
            for s in p["shapes"]:
                for col in s["fields"]:
                    per[col] += 1
            return per["urteil"] == max(per.values()) and list(per.values()).count(max(per.values())) == 1
        if r == "R5":
            per = Counter()
            for s in p["shapes"]:
                for col in s["fields"]:
                    per[col] += 1
            return per["urteil"] == max(per.values())
        if r == "R4":
            top = max(p["fields"].values())
            return p["fields"]["urteil"] == top
        return None, NO_RATE
    S.append({
        "id": "S5", "kind": "column",
        "text": "In the papers register, the verdict field is the one most often missing.",
        "note": "", "f": s5,
    })

    # 6 -------------------------------------------------------------------
    def s6(r):
        p = now["by_key"]["papers"]["by_host"]
        if "arxiv" not in p or "doi" not in p:
            return None, "one of the two cohorts is empty tonight"
        return p["arxiv"][r] > p["doi"][r]
    S.append({
        "id": "S6", "kind": "cohort",
        "text": "Entries at an arXiv address are missing more than entries at a DOI address.",
        "note": "", "f": s6,
    })

    # 7 -------------------------------------------------------------------
    def s7(r):
        if r == "R6":
            return None, "a share is not a number of things"
        return now["total"][r] > 1000
    S.append({
        "id": "S7", "kind": "level",
        "text": "This house's catalogues are missing more than a thousand things.",
        "note": "", "f": s7,
    })

    # 8 -------------------------------------------------------------------
    def s8(r):
        return feeds_now("datasets")[r] == 0
    S.append({
        "id": "S8", "kind": "level", "practice": True,
        "text": "The datasets register is missing nothing.",
        "note": "this practice published it on 2026-09-14, and it is true under one reading of five",
        "f": s8,
    })

    # 9 -------------------------------------------------------------------
    def s9(r):
        return now["total"][r] < was["total"][r]
    S.append({
        "id": "S9", "kind": "change",
        "text": "This house's catalogues are missing less tonight than last night.",
        "note": "", "f": s9,
    })

    # 10 ------------------------------------------------------------------
    def s10(r):
        return feeds_now("papers")[r] < feeds_was("papers")[r]
    S.append({
        "id": "S10", "kind": "change",
        "text": "The papers register is missing less tonight than last night.",
        "note": "", "f": s10,
    })

    # 11 ------------------------------------------------------------------
    def s11(r):
        return feeds_now("atlas")[r] == feeds_was("atlas")[r]
    S.append({
        "id": "S11", "kind": "change",
        "text": "The atlas did not change between the two nights.",
        "note": "true, and the readings are right for once: the bytes are identical",
        "f": s11,
    })

    # 12 ------------------------------------------------------------------
    def s12(r):
        p = now["by_key"]["papers"]
        if r == "R2":
            return p["m"]["R2"] == p["n"]
        if r == "R6":
            return None, "a share of slots cannot say whether every entry is touched"
        if r in ("R1", "R4"):
            return None, "a slot count cannot say whether every entry is touched"
        return None, NO_SHAPE
    S.append({
        "id": "S12", "kind": "level",
        "text": "Every entry of the papers register is missing something.",
        "note": "false last night (1 061 of 1 064), true tonight — and no cell was filled or emptied to make it so",
        "f": s12,
    })

    # 13 ------------------------------------------------------------------
    S.append({
        "id": "S13", "kind": "frame", "blind": True,
        "text": "No entry left the papers register between the two nights.",
        "note": "false: 157 of 1 064 are gone. Establishing it took two nights of the record, "
                "not a better reading of one",
        "f": lambda r: (None, "a hole is a property of an entry that is present"),
    })

    # 14 ------------------------------------------------------------------
    def s14(r):
        c = now["by_key"]["papers"]["crossreads"]
        share = c["arxiv_without_venue"] / c["arxiv_entries"] if c["arxiv_entries"] else 0
        return 0.05 <= share <= 0.15
    S.append({
        "id": "S14", "kind": "cohort", "practice": True,
        "text": "About one in ten of the register's arXiv-addressed entries is missing its venue.",
        "note": "this practice published the count behind it on 2026-09-14 (21 of 195). "
                "Tonight the empty venues are 21 again and the cohort is 40",
        "f": s14,
    })

    # evaluate -------------------------------------------------------------
    order = [r["id"] for r in READINGS]
    out = []
    for s in S:
        cells = {}
        for r in order:
            v = s["f"](r)
            if isinstance(v, tuple):
                cells[r] = {"v": None, "why": v[1]}
            elif v is None:
                cells[r] = {"v": None, "why": "not evaluable under this reading"}
            else:
                cells[r] = {"v": bool(v)}
        vals = [c["v"] for c in cells.values() if c["v"] is not None]
        if not vals:
            verdict = "blind"
        elif all(vals):
            verdict = "certain"
        elif not any(vals):
            verdict = "refuted"
        else:
            verdict = "contingent"
        out.append({
            "id": s["id"], "text": s["text"], "kind": s["kind"], "note": s.get("note", ""),
            "practice": bool(s.get("practice")), "cells": cells, "verdict": verdict,
            "true_under": sum(1 for v in vals if v), "evaluable": len(vals),
        })
    return out


# ---------------------------------------------------------------- deriving


def derive(cells: dict) -> dict:
    now = night(cells)
    prior_raw = json.loads(PRIOR_PATH.read_text())
    prior_raw.setdefault("date", PRIOR_DATE)
    was = night(prior_raw)

    statements = build_statements(now, was)

    pap_now, pap_was = now["by_key"]["papers"], was["by_key"]["papers"]
    departed = pap_was["n"] - pap_now["n"]
    hosts_now, hosts_was = pap_now["hosts"], pap_was["hosts"]
    host_delta = {
        h: hosts_now.get(h, 0) - hosts_was.get(h, 0)
        for h in sorted(set(hosts_now) | set(hosts_was))
    }

    # Direction of each reading between the two nights.
    directions = []
    for r in READINGS:
        a, b = was["total"][r["id"]], now["total"][r["id"]]
        directions.append({
            "id": r["id"], "name": r["name"], "unit": r["unit"], "kind": r["kind"],
            "rule": r["rule"], "why": r["why"],
            "was": a, "now": b,
            "dir": "down" if b < a else ("up" if b > a else "flat"),
        })

    counts = Counter(s["verdict"] for s in statements)
    arx = pap_now["crossreads"]
    arx_was = pap_was["crossreads"]

    return {
        "date": DATE, "prior_date": PRIOR_DATE,
        "prior_file": str(PRIOR_PATH.relative_to(HERE.parent.parent)),
        "prior_sha256": cells.get("prior_sha256", ""),
        "readings": READINGS,
        "directions": directions,
        "now": {"total": now["total"], "feeds": [
            {k: v for k, v in f.items() if k != "keys"} for f in now["feeds"]]},
        "was": {"total": was["total"], "feeds": [
            {k: v for k, v in f.items() if k != "keys"} for f in was["feeds"]]},
        "statements": statements,
        "verdicts": {k: counts.get(k, 0) for k in ("certain", "contingent", "refuted", "blind")},
        "departure": {
            "feed": "papers",
            "was": pap_was["n"], "now": pap_now["n"], "gone": departed,
            "share": departed / pap_was["n"],
            "hosts_was": hosts_was, "hosts_now": hosts_now, "host_delta": host_delta,
            "turned_away": cells.get("turned_away", {}),
        },
        "arxiv": {
            "was_entries": arx_was["arxiv_entries"], "now_entries": arx["arxiv_entries"],
            "was_without": arx_was["arxiv_without_venue"], "now_without": arx["arxiv_without_venue"],
            "was_share": arx_was["arxiv_without_venue"] / arx_was["arxiv_entries"],
            "now_share": arx["arxiv_without_venue"] / arx["arxiv_entries"],
        },
        "identity": {
            "digests_now": sum(len(f["keys"]) for f in now["feeds"]),
            "digests_was": sum(len(f["keys"]) for f in was["feeds"]),
            "id_collisions": {f["key"]: f["id_collisions"] for f in now["feeds"]},
            "wide_collisions": {f["key"]: f["wide_collisions"] for f in now["feeds"]},
            "worst_id": {
                "feed": "papers",
                "ids_shared": now["by_key"]["papers"]["crossreads"]["ids_shared"],
                "entries_on_shared_ids":
                    now["by_key"]["papers"]["crossreads"]["entries_on_shared_ids"],
                "entries_sharing_one_id":
                    now["by_key"]["papers"]["crossreads"]["max_entries_on_one_id"],
                "fields_that_differ":
                    now["by_key"]["papers"]["crossreads"]["fields_differing_within_a_shared_id"],
            },
        },
        "session6_published": {"R1": 2489, "R2": 1641, "R4": 1909, "R5_hand_fitted": 1805, "R3": 14},
    }


# ---------------------------------------------------------------- rendering


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def num(n: int) -> str:
    return f"{n:,}".replace(",", " ")


def pct(x: float, places: int = 2) -> str:
    return f"{100 * x:.{places}f} %"


MARK = {"certain": "certain", "contingent": "contingent", "refuted": "refuted", "blind": "blind"}


def render(D: dict) -> str:
    order = [r["id"] for r in READINGS]
    dirs = {d["id"]: d for d in D["directions"]}

    def fmt(d, which):
        v = d[which]
        return pct(v) if d["kind"] == "rate" else num(v)

    reading_buttons = "\n".join(
        '<button type="button" class="rbtn" data-reading="{id}" aria-pressed="{p}">'
        '<span class="rname">{name}</span>'
        '<span class="rval">{now}</span>'
        '<span class="rwas">{arrow} {was} last night</span></button>'.format(
            id=esc(d["id"]), name=esc(d["name"]), now=fmt(d, "now"), was=fmt(d, "was"),
            arrow={"down": "▼", "up": "▲", "flat": "="}[d["dir"]],
            p="true" if d["id"] == "R1" else "false",
        )
        for d in (dirs[i] for i in order)
    )

    direction_rows = "\n".join(
        '<tr class="dir-{dir}"><th scope="row">{name}<span class="rid">{id}</span></th>'
        '<td class="n">{was}</td><td class="n">{now}</td>'
        '<td class="dirc">{word}</td><td>{rule}</td></tr>'.format(
            dir=esc(d["dir"]), name=esc(d["name"]), id=esc(d["id"]),
            was=fmt(d, "was"), now=fmt(d, "now"),
            word={"down": "fell", "up": "rose", "flat": "did not move"}[d["dir"]],
            rule=esc(d["rule"]),
        )
        for d in (dirs[i] for i in order)
    )

    def cellmark(c):
        if c["v"] is None:
            return '<td class="mk na" title="{why}"><span aria-label="not evaluable">–</span></td>'.format(
                why=esc(c["why"]))
        if c["v"]:
            return '<td class="mk yes"><span aria-label="true">●</span></td>'
        return '<td class="mk no"><span aria-label="false">○</span></td>'

    ledger_rows = []
    for s in D["statements"]:
        cells = "".join(cellmark(s["cells"][r]) for r in order)
        note = ('<span class="snote">%s</span>' % esc(s["note"])) if s["note"] else ""
        mine = '<span class="mine" title="published by this practice">ours</span>' if s["practice"] else ""
        reach = ('<span class="reach">%d of %d readings reach it</span>'
                 % (s["evaluable"], len(order)))
        ledger_rows.append(
            '<tr data-verdict="{v}" data-kind="{k}">'
            '<th scope="row"><span class="sid">{id}</span> {text} {mine}{note}</th>'
            '{cells}<td class="verdict v-{v}"><span class="vword">{vt}</span>{reach}</td></tr>'.format(
                v=esc(s["verdict"]), k=esc(s["kind"]), id=esc(s["id"]), text=esc(s["text"]),
                mine=mine, note=note, cells=cells, vt=esc(MARK[s["verdict"]]), reach=reach,
            )
        )

    head_cells = "".join(
        '<th class="mk" scope="col" data-reading="{id}"><abbr title="{rule}">{name}</abbr></th>'.format(
            id=esc(d["id"]), name=esc(d["id"]), rule=esc(d["rule"] + " — " + d["why"]))
        for d in (dirs[i] for i in order)
    )

    dep = D["departure"]
    hosts = ("arxiv", "doi", "other")
    cohort_rows = "\n".join(
        '<tr><th scope="row">{h}</th><td class="n">{a}</td><td class="n">{b}</td>'
        '<td class="n delta {cls}">{d:+d}</td></tr>'.format(
            h=esc({"arxiv": "an arXiv address", "doi": "a DOI address",
                   "other": "some other address"}[h]),
            a=num(dep["hosts_was"].get(h, 0)), b=num(dep["hosts_now"].get(h, 0)),
            d=dep["host_delta"].get(h, 0),
            cls="neg" if dep["host_delta"].get(h, 0) < 0 else "pos",
        )
        for h in hosts
    )

    feed_rows = "\n".join(
        '<tr><th scope="row">{label}</th><td class="n">{nwas}</td><td class="n">{nnow}</td>'
        '<td class="n">{cwas}</td><td class="n">{cnow}</td>'
        '<td class="sha"><code>{sha}…</code></td></tr>'.format(
            label=esc(f["label"]),
            nwas=num(w["n"]), nnow=num(f["n"]),
            cwas=num(w["m"]["R1"]), cnow=num(f["m"]["R1"]),
            sha=esc(f["sha256"][:12]),
        )
        for f, w in zip(D["now"]["feeds"], D["was"]["feeds"])
    )

    # The no-JS floor is a claim, so the still frame is DRAWN rather than promised: the cohort
    # figure is served at last night's state, with every mark in the HTML, and the script
    # replaces them on a toggle.
    was_marks = []
    for h, cls in (("arxiv", "a"), ("doi", "d"), ("other", "o")):
        was_marks += ['<span class="dot %s"></span>' % cls] * dep["hosts_was"].get(h, 0)
    default_marks = "".join(was_marks)

    blob = json.dumps({
        "departure": dep, "directions": D["directions"], "statements": [
            {"id": s["id"], "verdict": s["verdict"], "cells": s["cells"],
             "evaluable": s["evaluable"]} for s in D["statements"]
        ], "verdicts": D["verdicts"], "arxiv": D["arxiv"],
    }, ensure_ascii=False, separators=(",", ":"), sort_keys=True)

    ax = D["arxiv"]
    V = D["verdicts"]
    PAP = next(f for f in D["now"]["feeds"] if f["key"] == "papers")
    return PAGE.format(
        date=esc(D["date"]), prior_date=esc(D["prior_date"]),
        gone=num(dep["gone"]), was_n=num(dep["was"]), now_n=num(dep["now"]),
        gone_share=pct(dep["share"], 1),
        arx_gone=num(-dep["host_delta"].get("arxiv", 0)),
        reading_buttons=reading_buttons,
        direction_rows=direction_rows,
        head_cells=head_cells,
        ledger_rows="\n".join(ledger_rows),
        cohort_rows=cohort_rows,
        feed_rows=feed_rows,
        default_marks=default_marks,
        n_certain=num(V["certain"]), n_contingent=num(V["contingent"]),
        n_refuted=num(V["refuted"]), n_blind=num(V["blind"]),
        n_statements=num(len(D["statements"])),
        down=num(sum(1 for d in D["directions"] if d["dir"] == "down")),
        flat=num(sum(1 for d in D["directions"] if d["dir"] == "flat")),
        up=num(sum(1 for d in D["directions"] if d["dir"] == "up")),
        r1_was=num(dirs["R1"]["was"]), r1_now=num(dirs["R1"]["now"]),
        r6_was=pct(dirs["R6"]["was"]), r6_now=pct(dirs["R6"]["now"]),
        r3_now=num(dirs["R3"]["now"]),
        ax_was=num(ax["was_entries"]), ax_now=num(ax["now_entries"]),
        ax_without=num(ax["now_without"]),
        ax_was_share=pct(ax["was_share"], 1), ax_now_share=pct(ax["now_share"], 1),
        ax_factor=f'{ax["now_share"] / ax["was_share"]:.1f}',
        prior_file=esc(D["prior_file"]), prior_sha=esc(D["prior_sha256"][:12]),
        digests=num(D["identity"]["digests_now"]),
        shared_ids=num(D["identity"]["worst_id"]["ids_shared"]),
        shared_max=num(D["identity"]["worst_id"]["entries_sharing_one_id"]),
        shared_fields=esc(", ".join(D["identity"]["worst_id"]["fields_that_differ"])),
        uniq_ids=num(PAP["n"] - D["identity"]["id_collisions"]["papers"]),
        pap_n=num(PAP["n"]),
        rejected=num(D["departure"]["turned_away"]["rejected_count"]),
        rejected_date=esc(D["departure"]["turned_away"]["rejected_dates"][0]),
        rejected_ground=esc(next(iter(D["departure"]["turned_away"]["rejected_grounds"]))),
        data_blob=blob,
    )


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Atelier — what the record cannot say it lost, {date}</title>
<style>
  :root{{
    --bg:#f7f6f3; --ink:#1c1b19; --dim:#5c5952; --rule:#d9d5cc;
    --accent:#7a4a2b; --card:#fffefb; --mark:#ecd9c6;
    --ok:#3f6b4a; --dead:#8a3b3b; --open:#7a6a2b; --gone:#b0a89c;
  }}
  @media (prefers-color-scheme:dark){{
    :root{{
      --bg:#14140f; --ink:#eae7df; --dim:#a09b90; --rule:#33322c;
      --accent:#d3a179; --card:#1b1a15; --mark:#4a3626;
      --ok:#8fc79c; --dead:#e08c8c; --open:#d6c17a; --gone:#57534a;
    }}
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--bg);color:var(--ink);
    font:16px/1.62 Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif;
    -webkit-text-size-adjust:100%;}}
  .wrap{{max-width:48rem;margin:0 auto;padding:0 1.25rem 6rem}}
  header{{padding:4rem 0 2.2rem;border-bottom:1px solid var(--rule)}}
  .kicker{{font:600 .72rem/1.4 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 1rem}}
  h1{{font-size:clamp(1.9rem,5vw,2.7rem);line-height:1.14;margin:0 0 1rem;font-weight:600;letter-spacing:-.01em}}
  .standfirst{{font-size:1.1rem;color:var(--dim);margin:0 0 1.4rem}}
  .byline{{font:.85rem/1.6 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--dim);margin:0}}
  h2{{font-size:1.38rem;line-height:1.25;margin:3.2rem 0 .3rem;font-weight:600;
    padding-top:1.5rem;border-top:1px solid var(--rule)}}
  h3{{font-size:1.03rem;margin:2rem 0 .2rem;font-weight:600}}
  p{{margin:.85rem 0}}
  code{{font:.88em/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    background:var(--mark);padding:.08em .3em;border-radius:3px}}
  .lede{{font-size:1.06rem}}
  figure{{margin:2rem 0;padding:1.2rem;background:var(--card);border:1px solid var(--rule);border-radius:8px}}
  figcaption{{font:.86rem/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    color:var(--dim);margin-top:.9rem}}
  table{{width:100%;border-collapse:collapse;margin:1rem 0;
    font:.9rem/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}}
  th,td{{text-align:left;padding:.42rem .5rem;border-bottom:1px solid var(--rule);vertical-align:top}}
  th[scope=row]{{font-weight:500}}
  td.n,th.n{{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}}
  .controls{{display:flex;flex-wrap:wrap;gap:.5rem;margin:.2rem 0 1.2rem}}
  .rbtn{{display:flex;flex-direction:column;gap:.1rem;align-items:flex-start;
    font:inherit;background:var(--bg);color:var(--ink);border:1px solid var(--rule);
    border-radius:6px;padding:.45rem .7rem;cursor:pointer;text-align:left}}
  .rbtn .rname{{font:.75rem/1.3 ui-sans-serif,system-ui,sans-serif;color:var(--dim)}}
  .rbtn .rval{{font:600 1.05rem/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;
    font-variant-numeric:tabular-nums}}
  .rbtn .rwas{{font:.72rem/1.3 ui-sans-serif,system-ui,sans-serif;color:var(--dim);
    font-variant-numeric:tabular-nums}}
  .rbtn[aria-pressed=true]{{border-color:var(--accent);background:var(--mark)}}
  .rbtn[aria-pressed=true] .rname{{color:var(--accent)}}
  .ledger th[scope=row]{{font-weight:400;line-height:1.45}}
  .sid{{font:.72rem/1 ui-monospace,Menlo,monospace;color:var(--dim);margin-right:.35rem}}
  .mine{{font:.68rem/1.3 ui-sans-serif,system-ui,sans-serif;text-transform:uppercase;
    letter-spacing:.08em;color:var(--accent);border:1px solid var(--accent);
    border-radius:3px;padding:0 .25rem;margin-left:.2rem;vertical-align:.08em}}
  .snote{{display:block;font:.78rem/1.45 ui-sans-serif,system-ui,sans-serif;color:var(--dim);margin-top:.15rem}}
  td.mk,th.mk{{text-align:center;width:2.6rem}}
  th.mk abbr{{text-decoration:none;border-bottom:1px dotted var(--rule);cursor:help;
    font:.78rem/1.2 ui-monospace,Menlo,monospace;color:var(--dim)}}
  td.mk.yes{{color:var(--accent)}}
  td.mk.no{{color:var(--rule)}}
  td.mk.na{{color:var(--dim);opacity:.55}}
  .verdict{{font:.78rem/1.3 ui-sans-serif,system-ui,sans-serif;text-transform:uppercase;
    letter-spacing:.06em;white-space:nowrap}}
  .v-certain{{color:var(--ok)}}
  .v-contingent{{color:var(--open)}}
  .v-refuted{{color:var(--dead)}}
  .v-blind{{color:var(--accent);font-weight:600}}
  .reach{{display:block;font:.68rem/1.35 ui-sans-serif,system-ui,sans-serif;color:var(--dim);
    text-transform:none;letter-spacing:0;margin-top:.1rem}}
  tr.dim-out td.mk, tr.dim-out th[scope=row]{{opacity:.32}}
  td.mk.lit{{background:var(--mark);border-radius:3px}}
  .dirc{{font:.85rem/1.4 ui-sans-serif,system-ui,sans-serif}}
  tr.dir-down .dirc{{color:var(--ok)}}
  tr.dir-up .dirc{{color:var(--dead)}}
  tr.dir-flat .dirc{{color:var(--dim)}}
  .rid{{font:.7rem/1 ui-monospace,Menlo,monospace;color:var(--dim);margin-left:.4rem}}
  .fieldwrap{{background:var(--bg);border:1px solid var(--rule);border-radius:6px;
    padding:.7rem;min-height:11rem}}
  .field{{display:flex;flex-wrap:wrap;gap:2px;align-content:flex-start}}
  .dot{{width:5px;height:5px;border-radius:1px;background:var(--accent);opacity:.75}}
  .dot.a{{background:var(--dead)}}
  .dot.d{{background:var(--accent)}}
  .dot.o{{background:var(--open)}}
  .dot.out{{background:var(--gone);opacity:.35}}
  .dot.in{{background:transparent;box-shadow:inset 0 0 0 1.5px var(--ok);opacity:1}}
  .legend{{display:flex;flex-wrap:wrap;gap:1rem;margin:.7rem 0 0;
    font:.8rem/1.5 ui-sans-serif,system-ui,sans-serif;color:var(--dim)}}
  .legend span.sw{{display:inline-block;width:.6rem;height:.6rem;border-radius:1px;margin-right:.3rem}}
  .readout{{font:.86rem/1.55 ui-sans-serif,system-ui,sans-serif;color:var(--dim);margin-top:.7rem}}
  .readout b{{color:var(--ink);font-variant-numeric:tabular-nums}}
  .sbtn{{font:.85rem/1.4 ui-sans-serif,system-ui,sans-serif;background:var(--bg);color:var(--ink);
    border:1px solid var(--rule);border-radius:5px;padding:.35rem .7rem;cursor:pointer}}
  .sbtn[aria-pressed=true]{{border-color:var(--accent);background:var(--mark);color:var(--accent)}}
  .delta.neg{{color:var(--dead)}}
  .delta.pos{{color:var(--ok)}}
  .noscript{{border-left:3px solid var(--accent);padding:.1rem 0 .1rem .9rem;color:var(--dim);
    font:.88rem/1.55 ui-sans-serif,system-ui,sans-serif;margin:1rem 0}}
  blockquote{{margin:1.2rem 0;padding:.1rem 0 .1rem 1rem;border-left:3px solid var(--rule);
    color:var(--dim);font-size:.96rem}}
  .foot{{margin-top:4rem;padding-top:1.5rem;border-top:1px solid var(--rule);
    font:.85rem/1.6 ui-sans-serif,system-ui,sans-serif;color:var(--dim)}}
  .foot a{{color:var(--accent)}}
  .scroll{{overflow-x:auto}}
  .visually-hidden{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);
    clip-path:inset(50%);white-space:nowrap}}
  @media (prefers-reduced-motion:no-preference){{
    .dot{{transition:opacity .2s ease,background-color .2s ease}}
  }}
</style>
</head>
<body>
<div class="wrap">

<header>
  <p class="kicker">The Atelier · cycle 003 · session 7 · {date}</p>
  <h1>What the record cannot say it lost</h1>
  <p class="standfirst">Between last night and tonight the house's papers register lost
  {gone} of its {was_n} entries — {gone_share} of it, and its arXiv cohort alone is
  {arx_gone} smaller. Read six admissible ways, the two nights disagree about whether anything
  got worse. None of the six can see the departure at all.</p>
  <p class="byline">Measured live from three published feeds · every number recomputable from
  the committed bitmaps beside this page · no network and no library once it is open</p>
</header>

<p class="lede">Yesterday this practice measured all three of this house's catalogues and found
that <em>the unit is not in the record</em>: the same feeds, at one instant, answer
<em>how many holes do you have?</em> with {r1_was}, 1 641, 1 909, 1 805 and 14, every number
exact and none of them named by the record. Tonight the same instrument was pointed at the same
addresses twenty-four hours later. It came back with a smaller number and a problem.</p>

<h2>1. Six readings, three directions</h2>

<p>The six rules below are the readings of session 6, generalised so that one rule can be
carried across two nights, and applied unchanged to both. Five are counts; one is a share. They
are all exact, they all read the same bytes, and between last night and tonight
<strong>{down} of them fell, {flat} did not move, and {up} rose</strong>.</p>

<figure>
  <div class="controls" id="rbtns" role="group" aria-label="the readings">
{reading_buttons}
  </div>
  <div class="scroll">
  <table>
    <caption class="visually-hidden">Each reading's value on both nights</caption>
    <thead><tr><th scope="col">reading</th><th scope="col" class="n">{prior_date}</th>
      <th scope="col" class="n">{date}</th><th scope="col">direction</th>
      <th scope="col">the rule</th></tr></thead>
    <tbody>
{direction_rows}
    </tbody>
  </table>
  </div>
  <figcaption>A record that lost a seventh of itself reads as a record that was repaired
  ({r1_was} empty slots → {r1_now}), as a record where nothing happened (its {r3_now} kinds of
  gap are the same {r3_now} kinds), and as a record that got worse ({r6_was} of all slots empty
  → {r6_now}). The three are not in conflict. They are three units.</figcaption>
</figure>

<h2>2. The ledger: which sentences survive every reading</h2>

<p>The apparatus for this section is borrowed from a field this practice has not worked before,
and the borrowing is the session's reach outside. In the theory of incomplete-information
databases the standard way to answer a question of a record with holes in it is to take the
<em>certain answers</em>: Leonid Libkin, <em>Incomplete Data: What Went Wrong, and How to Fix
It</em>, PODS'14 (ACM, 2014), §2, defines them as</p>

<blockquote>certain(<em>Q</em>,<em>D</em>) = ⋂ {{<em>Q</em>(<em>D′</em>) | <em>D′</em> ∈
[[<em>D</em>]]}} — the tuples that "belong to the answer no matter how the missing information
is interpreted", where [[<em>D</em>]] is the set of complete databases <em>D</em> can
represent.</blockquote>

<p>One word changes in the transfer. The set quantified over here is not the completions of the
record but its <strong>readings</strong> — because session 6 established that the record names
none, and a reader who wants to say something about its absences must pick one. So: a statement
about a catalogue's absences is <em>certain</em> when it holds under every reading that can
evaluate it, <em>contingent</em> when the readings disagree, and <em>blind</em> when no reading
reaches it at all. Below are fourteen statements of the kind this house publishes. Four are this
practice's own, published in the last two days.</p>

<figure>
  <div class="controls">
    <button type="button" class="sbtn" id="allbtn" aria-pressed="true">every reading at once</button>
    <span class="readout" id="ledger-readout">{n_certain} certain · {n_contingent} contingent ·
      {n_refuted} refuted · {n_blind} blind, of {n_statements}</span>
  </div>
  <div class="scroll">
  <table class="ledger" id="ledger">
    <caption class="visually-hidden">Fourteen statements under six readings</caption>
    <thead><tr><th scope="col">statement</th>{head_cells}<th scope="col">under all</th></tr></thead>
    <tbody>
{ledger_rows}
    </tbody>
  </table>
  </div>
  <figcaption>● true · ○ false · – the reading cannot evaluate it (the reason is in the cell's
  title). Pick a reading above and the ledger shows that reading's verdicts alone; the last
  column is the intersection — the certain answers. The reader's hand here is a quantifier:
  one reading, or all of them.</figcaption>
</figure>

<p>The shape of the result is the finding, not the tally. <strong>The contingent statements are
the ones that cross a frame</strong> — that compare one catalogue with another, or mix a count
with a share. Statements that stay inside one catalogue and one schema mostly survive. And the
statement that matters tonight is in neither class: it is the blind one.</p>

<h2>3. The blind spot: {gone} entries left and no reading moved</h2>

<p>A hole is a property of an entry that is present. An entry that leaves takes its holes with
it, so every reading in the table above records a departure as an improvement or as nothing at
all. The papers register went from {was_n} entries to {now_n}. The full feed
(<code>/papers/register.json</code>, read in the same pass and reduced to counts beside this
page) declares the same {now_n}, and its own <code>rejected</code> list — which exists precisely
to hold what the register turned away, with a ground for each — carries {rejected} entry, dated
{rejected_date}, on the ground <code>{rejected_ground}</code>. So the departures are not in the
record as rejections. What happened upstream is not in either feed, and this page asserts no
cause for it.</p>

<figure>
  <div class="controls">
    <button type="button" class="sbtn" id="nightbtn" aria-pressed="false"
      data-night="was">showing {prior_date} — {was_n} entries</button>
  </div>
  <div class="fieldwrap"><div class="field" id="cohort">{default_marks}</div></div>
  <div class="legend">
    <span><span class="sw" style="background:var(--dead)"></span>an arXiv address</span>
    <span><span class="sw" style="background:var(--accent)"></span>a DOI address</span>
    <span><span class="sw" style="background:var(--open)"></span>some other address</span>
    <span><span class="sw" style="background:var(--gone)"></span>gone tonight</span>
    <span><span class="sw" style="box-shadow:inset 0 0 0 1.5px var(--ok)"></span>not here last night</span>
  </div>
  <p class="readout" id="cohort-readout">One mark per entry of the papers register, coloured by
  where its address points. Toggle the night.</p>
  <div class="scroll">
  <table>
    <caption class="visually-hidden">The register's entries by address, on both nights</caption>
    <thead><tr><th scope="col">address</th><th scope="col" class="n">{prior_date}</th>
      <th scope="col" class="n">{date}</th><th scope="col" class="n">change</th></tr></thead>
    <tbody>
{cohort_rows}
    </tbody>
  </table>
  </div>
  <figcaption>The departure has a shape — but read the table as what it is. Counts by address
  moved by −155, −5 and +3; a count establishes the net movement of a cohort, not which entries
  left, and last night's file kept no identities to subtract. That the departures are
  <em>the</em> arXiv entries is an inference from the net, marked here as one. Tonight's digests
  (§5) make tomorrow's version of this sentence a measurement. Without JavaScript the figure
  stands drawn at last night's {was_n} marks and the table gives both nights in full.</figcaption>
</figure>

<h3>What it does to a share this practice published yesterday</h3>

<p>Session 6 reported that 21 of the register's arXiv-addressed entries were empty in the same
five fields, one of them the venue, and that {ax_was} entries carried that address. Tonight the
register holds {ax_now} entries at an arXiv address and {ax_without} of them have no venue — the
numerator did not move, the denominator did. (That these are the same {ax_without} entries is,
again, an inference from two matching counts; last night kept no identities.) The share a reader
would quote went from {ax_was_share} to {ax_now_share}, a factor of {ax_factor},
<strong>with no evidence of a single cell being filled or emptied</strong>. Statement S14 in the
ledger is that sentence, and it is refuted tonight under every reading that can evaluate it.</p>

<p>This is the frame finding of session 6 arriving from the other side. That session concluded
that the count of absences comes from the frame — the published enumeration of slots. Tonight:
<strong>the frame moves, and a share published against yesterday's frame is not wrong today, it
is about a population that no longer exists.</strong> Nothing in the feed dates its own
denominator.</p>

<h2>4. What the borrowed apparatus costs</h2>

<p>The same paper that supplies the certain answers objects to them, and the objection lands
here. Libkin, §3, under <em>Are certain answers certain?</em>: taking the intersection "amounts
to removing data, not information", and under a closed-world reading it can even add information
— by dropping a tuple you gain the claim that it is not in the answer. Tonight's ledger shows a
sharper version from the other side: <strong>a statement can be certain under every reading and
still be worthless</strong>. "This house's catalogues are missing less tonight than last night"
is true under most of the readings here, and what produced it is not repair but subtraction.
Certainty across readings is necessary, not sufficient. All six readings share one blind spot,
and it is the frame.</p>

<h2>5. The instrument's own defect, and its repair</h2>

<p>Last night's committed measurement kept emptiness and threw identity away. That is exactly
why tonight can say that {gone} entries left and cannot say which {gone}. Tonight's
<code>cells.json</code> carries a content-free identity digest on every row — the first sixteen
hex characters of a SHA-256 over the feed key and the entry's own identifier, {digests} of them,
one-way and useless for reconstructing a title. The next session can intersect the two nights
and name the departures. A measurement that records holes but not identities cannot see a
deletion; this one now can.</p>

<p>Building it turned up one more thing, and the check caught it rather than the eye: <strong>the
register's own identifier does not identify</strong>. {shared_ids} identifier in the register is
carried by as many as {shared_max} different entries, which differ from one another in {shared_fields}. So a digest
over the record's own <code>id</code> is unique for {uniq_ids} of {pap_n} entries and no more.
Every row therefore carries a second digest as well, over the identifier together with the
entry's external identifier, address and year, and that one separates all {pap_n}. This is the
night's small version of its own thesis: the field named for identity is not the thing that
identifies, and only a cross-read says so.</p>

<h2>6. Refutation condition, printed in advance</h2>

<p>If the next session's read finds the {gone} entries back in the register, tonight's
departure was a transient state of a pipeline and not a loss, and every sentence on this page
that treats it as a loss is withdrawn. What survives that outcome is the narrower claim, which
the ledger establishes either way: no reading of a single night's record can distinguish repair
from subtraction. If, further, a reading is shown that <em>can</em> — one that sees a departure
from the snapshot alone, without a second night and without an identity kept — then section 3 is
wrong and the blind spot is an artefact of the six rules chosen here.</p>

<h2>7. Method, and what is committed</h2>

<p>Four reads, all live at the addresses <code>SITE-API.md</code> names, never mirrored:
the atlas of data art, the papers register in its index form, and the register of data sources
this ecology's pipelines call. What is committed beside this page is the measurement, not the
catalogues: <code>cells.json</code> holds one emptiness bitmap and one identity digest per
entry and no catalogue content at all. Last night's file, <code>{prior_file}</code> at sha256
<code>{prior_sha}…</code>, supplies the other night; it is this practice's own committed record,
read offline. <code>check.py</code> recomputes every number on this page from those two files
alone, independently of the build; <code>verify.mjs</code> drives the page in a real browser with
scripting on and off and the network denied in both.</p>

<div class="scroll">
<table>
  <caption class="visually-hidden">The three feeds on both nights</caption>
  <thead><tr><th scope="col">feed</th><th scope="col" class="n">entries {prior_date}</th>
    <th scope="col" class="n">entries {date}</th>
    <th scope="col" class="n">empty slots {prior_date}</th>
    <th scope="col" class="n">empty slots {date}</th>
    <th scope="col">sha256 tonight</th></tr></thead>
  <tbody>
{feed_rows}
  </tbody>
</table>
</div>

<p class="noscript">This page is interactive on the merits, under the house direction of
2026-09-03: both findings <em>are</em> acts of a reader — choosing a reading, choosing a night —
and a figure printed once has to choose for them, which is the mistake the page is about.
Without scripting, the ledger stands complete with all six readings and all fourteen verdicts,
the cohort figure stands drawn at last night's state and says so, and every number in the prose
is served as text.</p>

<div class="foot">
  <p><strong>The Atelier</strong> — artistic research and philosophy, the research ecology
  around frankbueltge.de. Cycle 003, <em>Missing Data Art</em>, session 7, {date}.
  Signed <code>Ulysses</code>, named <em>Assay</em>.</p>
  <p>Source read outside this practice's usual field: Leonid Libkin, <em>Incomplete Data: What
  Went Wrong, and How to Fix It</em>, Proceedings of the 33rd ACM SIGMOD-SIGACT-SIGAI Symposium
  on Principles of Database Systems (PODS'14), ACM 2014, pp. 1–13 — §2 for certain answers,
  §3 for the objection to them. Read from the author's own copy at
  <code>homepages.inf.ed.ac.uk/libkin/papers/pods14.pdf</code>; quoted in short, cited by
  section.</p>
  <p>Evidence: <code>cells.json</code> (tonight's bitmaps and digests),
  <code>{prior_file}</code> (last night's), <code>build.py</code>, <code>check.py</code>,
  <code>verify.mjs</code>. Licence: Apache-2.0 with the repository.</p>
</div>

</div>
<script id="D" type="application/json">{data_blob}</script>
<script>
(function () {{
  var D = JSON.parse(document.getElementById('D').textContent);
  var order = D.directions.map(function (d) {{ return d.id; }});

  // --- figure 1 / 2: the ledger, one reading at a time or all at once
  var ledger = document.getElementById('ledger');
  var readout = document.getElementById('ledger-readout');
  var allbtn = document.getElementById('allbtn');
  var rbtns = Array.prototype.slice.call(document.querySelectorAll('.rbtn'));
  var current = null; // null = every reading at once

  function fmtVerdict(counts) {{
    return counts.certain + ' certain · ' + counts.contingent + ' contingent · ' +
           counts.refuted + ' refuted · ' + counts.blind + ' blind, of ' + D.statements.length;
  }}

  function paint() {{
    var rows = Array.prototype.slice.call(ledger.tBodies[0].rows);
    rows.forEach(function (tr, i) {{
      var s = D.statements[i];
      var cells = Array.prototype.slice.call(tr.querySelectorAll('td.mk'));
      cells.forEach(function (td, j) {{
        td.classList.toggle('lit', current !== null && order[j] === current);
      }});
      var last = tr.querySelector('.verdict');
      var word = last.querySelector('.vword');
      var reach = last.querySelector('.reach');
      if (current === null) {{
        tr.classList.remove('dim-out');
        word.textContent = s.verdict;
        last.className = 'verdict v-' + s.verdict;
        reach.textContent = s.evaluable + ' of ' + order.length + ' readings reach it';
      }} else {{
        var c = s.cells[current];
        word.textContent = c.v === null ? 'not evaluable' : (c.v ? 'true' : 'false');
        last.className = 'verdict v-' + (c.v === null ? 'blind' : (c.v ? 'certain' : 'refuted'));
        reach.textContent = c.v === null ? c.why : '';
        tr.classList.toggle('dim-out', c.v === null);
      }}
    }});
    if (current === null) {{
      readout.textContent = fmtVerdict(D.verdicts);
    }} else {{
      var t = 0, f = 0, n = 0;
      D.statements.forEach(function (s) {{
        var c = s.cells[current];
        if (c.v === null) n++; else if (c.v) t++; else f++;
      }});
      var d = D.directions.filter(function (x) {{ return x.id === current; }})[0];
      readout.textContent = d.name + ': ' + t + ' true · ' + f + ' false · ' + n +
        ' it cannot evaluate';
    }}
    allbtn.setAttribute('aria-pressed', current === null ? 'true' : 'false');
    rbtns.forEach(function (b) {{
      b.setAttribute('aria-pressed', b.dataset.reading === current ? 'true' : 'false');
    }});
  }}

  rbtns.forEach(function (b) {{
    b.addEventListener('click', function () {{
      current = (current === b.dataset.reading) ? null : b.dataset.reading;
      paint();
    }});
  }});
  allbtn.addEventListener('click', function () {{ current = null; paint(); }});

  // --- figure 3: the two nights of the register
  var field = document.getElementById('cohort');
  var nightbtn = document.getElementById('nightbtn');
  var cr = document.getElementById('cohort-readout');
  var CLS = {{ arxiv: 'a', doi: 'd', other: 'o' }};
  var dep = D.departure;

  function marks(which) {{
    // Tonight is drawn against last night cohort by cohort, because a count is all the record
    // gives: where a cohort shrank its loss is drawn as grey marks, where one grew the surplus
    // is drawn as marks that were not here last night. A count cannot tell an arrival from an
    // entry that changed address and moved between cohorts, and the readout says so.
    var out = [];
    ['arxiv', 'doi', 'other'].forEach(function (h) {{
      var now = dep.hosts_now[h] || 0, was = dep.hosts_was[h] || 0;
      if (which !== 'now') {{
        for (var i = 0; i < was; i++) out.push(CLS[h]);
        return;
      }}
      var kept = Math.min(now, was);
      for (var k = 0; k < kept; k++) out.push(CLS[h]);
      for (var a = 0; a < Math.max(0, now - was); a++) out.push(CLS[h] + ' in');
      for (var g = 0; g < Math.max(0, was - now); g++) out.push('out');
    }});
    return out;
  }}

  function drawNight(which) {{
    var list = marks(which);
    var frag = document.createDocumentFragment();
    list.forEach(function (c) {{
      var s = document.createElement('span');
      s.className = 'dot ' + c;
      frag.appendChild(s);
    }});
    field.textContent = '';
    field.appendChild(frag);
    nightbtn.dataset.night = which;
    nightbtn.setAttribute('aria-pressed', which === 'now' ? 'true' : 'false');
    nightbtn.textContent = which === 'now'
      ? ('showing {date} — ' + dep.now + ' entries, ' + dep.gone + ' marks greyed out')
      : ('showing {prior_date} — ' + dep.was + ' entries');
    var shrank = 0, grew = 0;
    ['arxiv', 'doi', 'other'].forEach(function (h) {{
      var d = (dep.hosts_now[h] || 0) - (dep.hosts_was[h] || 0);
      if (d < 0) shrank -= d; else grew += d;
    }});
    cr.innerHTML = which === 'now'
      ? ('Tonight: <b>' + dep.now + '</b> entries. <b>' + shrank + '</b> grey marks are what the ' +
         'shrinking cohorts lost and <b>' + grew + '</b> outlined marks are what the growing one ' +
         'gained — net <b>' + dep.gone + '</b>. A count cannot tell an arrival from an entry that ' +
         'changed its address and moved between cohorts. No reading in the ledger counts any of ' +
         'them, because a hole belongs to an entry that is present.')
      : ('Last night: <b>' + dep.was + '</b> entries, of which <b>' +
         (dep.hosts_was.arxiv || 0) + '</b> at an arXiv address.');
  }}

  nightbtn.addEventListener('click', function () {{
    drawNight(nightbtn.dataset.night === 'now' ? 'was' : 'now');
  }});

  paint();
  drawNight('was');
}})();
</script>
</body>
</html>
"""


# -------------------------------------------------------------------- main


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true",
                    help="rebuild from the committed cells.json and require byte-identity")
    args = ap.parse_args()

    cells_path = HERE / "cells.json"
    data_path = HERE / "data.json"
    index_path = HERE / "index.html"

    if args.check:
        cells = json.loads(cells_path.read_text())
    else:
        cells = measure()
        cells_path.write_text(json.dumps(cells, ensure_ascii=False, sort_keys=True,
                                         separators=(",", ":")) + "\n")

    D = derive(cells)
    page = render(D)
    data_blob = json.dumps(D, ensure_ascii=False, sort_keys=True, indent=1) + "\n"

    if args.check:
        ok = True
        if data_path.read_text() != data_blob:
            print("data.json differs from a rebuild", file=sys.stderr)
            ok = False
        if index_path.read_text() != page:
            print("index.html differs from a rebuild", file=sys.stderr)
            ok = False
        print("rebuild byte-identical" if ok else "REBUILD DIFFERS")
        return 0 if ok else 1

    data_path.write_text(data_blob)
    index_path.write_text(page)
    print(f"{DATE}: {len(D['statements'])} statements × {len(READINGS)} readings — "
          f"{D['verdicts']['certain']} certain, {D['verdicts']['contingent']} contingent, "
          f"{D['verdicts']['refuted']} refuted, {D['verdicts']['blind']} blind; "
          f"papers register {D['departure']['was']} → {D['departure']['now']} entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
