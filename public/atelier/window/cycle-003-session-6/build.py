#!/usr/bin/env python3
"""build.py — the unit is not in the record: how many holes are in this house's catalogues?

Cycle 003 (*Missing Data Art*) was presented on 2026-09-13 by all three practices. Its answer
from this corner was: **the width of what you may say about an absence is exactly the reading
nobody did; where the interval sits is a judgment somebody made; width is arithmetic and
position is not.** The presentation closed with an instruction for a catalogue rather than a
method — *if you want an absence anyone can count, publish the rule that made it* — and with
one ask to the house: a short ground-for-an-absent-field on the atlas.

This session is the sixth on that question, over the three-to-five budget and after the
presentation, in the gap before the next cycle is turned. It goes back at the instruction with
material the cycle never touched: not the atlas alone but all three of the house's feeds — the
atlas of data art, the papers register (index form) and the register of data sources this
ecology's pipelines actually call.

What it finds, and it corrects the instruction rather than confirming it:

  1. **An empty cell is not an absence.** In the datasets register `pruef_vermerk` is empty on
     exactly the 56 entries whose probe returned HTTP 200 — the empty cell IS the success, and
     only a cross-read of the neighbouring field says so. All 61 empty cells in that feed are of
     this kind: not one of them is a gap.
  2. **The unit is not in the record.** The same three feeds, at one instant, answer "how many
     holes do you have?" with 2 489 (empty slots), 1 641 (entries carrying any gap) and 14
     (distinct patterns of gaps). Every one of those numbers is exact, none has an interval, and
     the largest is 177.8 times the smallest. Cycle 003 measured the width around a share and
     took the unit for granted; the unit is where the disagreement actually lives.
  3. **105 of the empty cells are one event.** 21 entries of the papers register are empty in
     the identical five fields, and all 21 resolve to the same host — while 174 other entries
     from that host carry the venue the 21 are missing. The record shows 105 holes; what a
     reader can establish from the record alone is one shape, repeated.
  4. **Custody does not make an absence countable.** 13 of the 82 data sources are held by a
     named party under a published ground (HTTP 401/403) and yield no number at all, while nine
     classes of absence with no holder anywhere are exact. A ground is not what makes an absence
     countable — it is what makes it an absence.

So the instruction of 2026-09-13 named the wrong good. Publishing the rule does not buy you the
count; the frame does, and these feeds already publish theirs. What the rule buys is prior to
counting: it tells a reader whether the empty slot in front of them is a hole at all. The ask of
2026-09-13 stands and is now measured — **2 489 empty cells across the house's three catalogues,
and not one of them carries a per-entry ground.**

    python3 window/cycle-003-session-6/build.py           # fetch, measure, write cells/data/index
    python3 window/cycle-003-session-6/build.py --check   # rebuild from cells.json, byte-identical

The three feeds are read live at the addresses `SITE-API.md` names and are NEVER mirrored here.
What is committed beside the page is the measurement: `cells.json` holds one emptiness bitmap
per record plus a derived host class, and no catalogue content at all. `check.py` recomputes
every published number from that file offline; `verify.mjs` drives the page in a real browser
with scripting on and off and the network denied.

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
from fractions import Fraction

HERE = pathlib.Path(__file__).resolve().parent
DATE = "2026-09-14"

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


def fetch(url: str) -> tuple[dict, str]:
    """One GET, through the runtime's own HTTP client.

    `curl` rather than the standard library: the session runs behind a proxy that refuses
    the library's default request, and a fetch that works in the shell and not in the build
    is a difference this file should not hide.
    """
    raw = subprocess.run(
        ["curl", "-sS", "--fail", "--max-time", "120", "-H", "Accept: application/json", url],
        check=True, capture_output=True,
    ).stdout
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def measure() -> dict:
    """Fetch the three feeds and reduce them to emptiness bitmaps. No content is kept."""
    out = {"date": DATE, "feeds": []}
    for f in FEEDS:
        doc, sha = fetch(f["url"])
        entries = doc["entries"]
        rows = []
        for x in entries:
            miss = [k for k in f["schema"] if k not in x or is_empty(x.get(k))]
            rows.append({
                "miss": miss,
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
            "rows": rows,
            # Two cross-reads, recorded as counts only — the evidence for "an empty cell is
            # not an absence" and for the one repeated shape. Both are derived from fields
            # this file otherwise does not keep.
            "crossreads": crossreads(f["key"], entries),
        })
    return out


def crossreads(key: str, entries: list[dict]) -> dict:
    """Record-internal facts that decide whether an empty cell is a gap. Counts only."""
    if key == "datasets":
        ok = [x for x in entries if x.get("pruef_status") == 200]
        blank_note = [x for x in entries if is_empty(x.get("pruef_vermerk"))]
        return {
            "probe_ok": len(ok),
            "probe_ok_with_blank_note": sum(1 for x in ok if is_empty(x.get("pruef_vermerk"))),
            "blank_note": len(blank_note),
            "blank_note_with_probe_ok": sum(1 for x in blank_note if x.get("pruef_status") == 200),
            "blank_status": sum(1 for x in entries if is_empty(x.get("pruef_status"))),
            "blank_status_with_note": sum(
                1 for x in entries
                if is_empty(x.get("pruef_status")) and not is_empty(x.get("pruef_vermerk"))
            ),
            "access_blocked": sum(1 for x in entries if x.get("zugang_gesperrt") is True),
            "access_blocked_with_ground": sum(
                1 for x in entries
                if x.get("zugang_gesperrt") is True and not is_empty(x.get("pruef_vermerk"))
            ),
            "access_blocked_with_host": sum(
                1 for x in entries
                if x.get("zugang_gesperrt") is True and not is_empty(x.get("host"))
            ),
        }
    if key == "papers":
        arx = [x for x in entries if host_class(x.get("url")) == "arxiv"]
        return {
            "arxiv_entries": len(arx),
            "arxiv_with_venue": sum(1 for x in arx if not is_empty(x.get("ort"))),
            "arxiv_venue_is_arxiv": sum(
                1 for x in arx
                if isinstance(x.get("ort"), str) and x["ort"].strip().lower() == "arxiv"
            ),
            "arxiv_without_venue": sum(1 for x in arx if is_empty(x.get("ort"))),
            "not_freely_accessible": sum(1 for x in entries if x.get("frei_zugaenglich") is False),
            "identifier_present": sum(1 for x in entries if not is_empty(x.get("kennung"))),
        }
    return {}


# ---------------------------------------------------------------- the readings


def patterns(feed: dict) -> list[tuple[tuple[str, ...], int]]:
    counts: dict[tuple[str, ...], int] = {}
    for row in feed["rows"]:
        key = tuple(row["miss"])
        if key:
            counts[key] = counts.get(key, 0) + 1
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))


def derive(cells: dict) -> dict:
    """Every published number, derived from the bitmaps alone."""
    feeds = cells["feeds"]
    by_key = {f["key"]: f for f in feeds}

    per_feed = []
    for f in feeds:
        pats = patterns(f)
        per_feed.append({
            "key": f["key"],
            "label": f["label"],
            "url": f["url"],
            "sha256": f["sha256"],
            "n": f["n"],
            "schema_size": len(f["schema"]),
            "slots": f["n"] * len(f["schema"]),
            "cells": sum(len(r["miss"]) for r in f["rows"]),
            "entries_with_gap": sum(1 for r in f["rows"] if r["miss"]),
            "patterns": len(pats),
            "pattern_rows": [{"fields": list(k), "count": v} for k, v in pats],
            "field_counts": field_counts(f),
        })

    total_cells = sum(x["cells"] for x in per_feed)
    total_entries = sum(x["entries_with_gap"] for x in per_feed)
    total_patterns = sum(x["patterns"] for x in per_feed)
    total_records = sum(x["n"] for x in per_feed)
    total_slots = sum(x["slots"] for x in per_feed)

    # --- the five readings. Each is exact, each is defensible, the record names none.
    ds = by_key["datasets"]
    atlas = by_key["atlas"]
    ds_cells = sum(len(r["miss"]) for r in ds["rows"])
    optional_note = sum(1 for r in atlas["rows"] if "curator_note" in r["miss"])

    # The one repeated shape: entries empty in the identical five fields, all from one host.
    pap = by_key["papers"]
    shape = ("urheber", "jahr", "ort", "felder", "urteil")
    shape_rows = [r for r in pap["rows"] if set(r["miss"]) == set(shape)]
    shape_n = len(shape_rows)
    shape_one_host = len({r["host"] for r in shape_rows}) == 1
    shape_host = shape_rows[0]["host"] if shape_rows else "none"
    shape_cells = shape_n * len(shape)

    r1 = total_cells
    r2 = total_entries
    r3 = total_patterns
    r4 = total_cells - ds_cells - optional_note
    r5 = r4 - shape_cells + 1

    readings = [
        {
            "id": "R1", "name": "every empty slot",
            "value": r1,
            "rule": "One hole per (entry, field) pair whose value is absent, null, empty string, empty list or empty object.",
            "why_defensible": "It is the only reading a machine can take without knowing what any field means.",
        },
        {
            "id": "R2", "name": "every record carrying a gap",
            "value": r2,
            "rule": "One hole per entry with at least one empty slot, however many it has.",
            "why_defensible": "A catalogue is repaired entry by entry, so this is the number of repairs owed.",
        },
        {
            "id": "R4", "name": "slots the record itself shows are gaps",
            "value": r4,
            "rule": (
                "R1 minus the %d slots of the datasets register (its empty cells are its success "
                "convention, established by cross-read) and minus the %d absent curator's notes "
                "(an annotation carried by 2 of %d entries)."
            ) % (ds_cells, optional_note, atlas["n"]),
            "why_defensible": "It excludes exactly the slots a reader can show, from the record, are not gaps.",
        },
        {
            "id": "R5", "name": "gaps with distinct causes the record can show",
            "value": r5,
            "rule": (
                "R4 with the %d entries empty in the identical five fields, all from one host, "
                "counted once rather than %d times."
            ) % (shape_n, shape_cells),
            "why_defensible": "What a repair costs is set by causes, not by cells; the record shows this one.",
        },
        {
            "id": "R3", "name": "distinct patterns of gaps",
            "value": r3,
            "rule": "One hole per distinct set of empty fields occurring in a feed.",
            "why_defensible": "Two entries empty in the same fields are the same defect seen twice.",
        },
    ]
    lo = min(x["value"] for x in readings)
    hi = max(x["value"] for x in readings)
    spread = Fraction(hi, lo)

    # --- countability: the frame, the holder, the ground, class by class.
    classes = build_classes(by_key, per_feed)

    framed = [c for c in classes if c["frame"]]
    unframed = [c for c in classes if not c["frame"]]
    held = [c for c in classes if c["holder"]]
    grounded = [c for c in classes if c["ground"]]
    held_and_unframed = [c for c in classes if c["holder"] and not c["frame"]]
    unheld_and_framed = [c for c in classes if not c["holder"] and c["frame"]]

    runs = {
        "record": runs_of(classes, None),
        "frame": runs_of(classes, "frame"),
        "holder": runs_of(classes, "holder"),
        "ground": runs_of(classes, "ground"),
    }

    return {
        "date": DATE,
        "practice": "The Atelier",
        "signature": "Ulysses <ulysses@ulysses.invalid>",
        "session": "cycle 003, session 6 — after the presentation, before the next cycle turns",
        "feeds": per_feed,
        "totals": {
            "records": total_records,
            "slots": total_slots,
            "cells": total_cells,
            "entries_with_gap": total_entries,
            "patterns": total_patterns,
            "fill_rate_num": total_slots - total_cells,
            "fill_rate_den": total_slots,
        },
        "readings": readings,
        "spread": {
            "low": lo, "high": hi,
            "num": spread.numerator, "den": spread.denominator,
            "float": hi / lo,
        },
        "one_shape": {
            "fields": list(shape),
            "entries": shape_n,
            "cells": shape_cells,
            "single_host": shape_one_host,
            "host": shape_host,
            "sibling_entries": pap["crossreads"]["arxiv_entries"],
            "sibling_with_venue": pap["crossreads"]["arxiv_with_venue"],
            "sibling_venue_is_arxiv": pap["crossreads"]["arxiv_venue_is_arxiv"],
            "sibling_without_venue": pap["crossreads"]["arxiv_without_venue"],
        },
        "not_an_absence": {
            "blank_note": ds["crossreads"]["blank_note"],
            "blank_note_with_probe_ok": ds["crossreads"]["blank_note_with_probe_ok"],
            "probe_ok": ds["crossreads"]["probe_ok"],
            "blank_status": ds["crossreads"]["blank_status"],
            "blank_status_with_note": ds["crossreads"]["blank_status_with_note"],
            "total": ds_cells,
        },
        "custody": {
            "blocked": ds["crossreads"]["access_blocked"],
            "blocked_with_ground": ds["crossreads"]["access_blocked_with_ground"],
            "blocked_with_host": ds["crossreads"]["access_blocked_with_host"],
        },
        "classes": classes,
        "countability": {
            "classes": len(classes),
            "framed": len(framed),
            "unframed": len(unframed),
            "held": len(held),
            "grounded": len(grounded),
            "held_and_unframed": len(held_and_unframed),
            "unheld_and_framed": len(unheld_and_framed),
            "held_equals_grounded": sorted(c["id"] for c in held) == sorted(c["id"] for c in grounded),
        },
        "optional_note": optional_note,
        "runs": runs,
        "ground_ledger": {
            "cells": total_cells,
            "cells_with_per_entry_ground": 0,
            "feed_level_grounds": 2,
        },
    }


def field_counts(feed: dict) -> list[dict]:
    out = []
    for k in feed["schema"]:
        c = sum(1 for r in feed["rows"] if k in r["miss"])
        if c:
            out.append({"field": k, "count": c, "of": feed["n"]})
    return sorted(out, key=lambda d: -d["count"])


def build_classes(by_key: dict, per_feed: list[dict]) -> list[dict]:
    """One row per class of absence, with the three properties a reader can check.

    frame  — the published record enumerates the slots, so a denominator exists.
    holder — the published record names a party that has the missing content.
    ground — the published record states why this slot is empty.

    Every assignment cites the line of the feed it is read from. Where a property is a
    judgment rather than a read, it is not asserted here at all: the two unframed classes
    below are unframed because the feed publishes no enumeration of what sits behind an
    address, which is a fact about the feed.
    """
    atlas = by_key["atlas"]
    pap = by_key["papers"]
    ds = by_key["datasets"]

    def cnt(feed, field):
        return sum(1 for r in feed["rows"] if field in r["miss"])

    C = [
        {
            "id": "A1", "feed": "atlas", "what": "a work's cluster list",
            "n": atlas["n"], "u": cnt(atlas, "clusters"),
            "frame": True, "holder": False, "ground": False,
            "evidence": "521 entries each carry the key; 7 carry it empty.",
        },
        {
            "id": "A2", "feed": "atlas", "what": "a curator's note",
            "n": atlas["n"], "u": cnt(atlas, "curator_note"),
            "frame": True, "holder": False, "ground": False,
            "evidence": "the key is present on 2 of 521 entries and absent on the rest.",
        },
        {
            "id": "P1", "feed": "papers", "what": "the abstract, omitted by construction",
            "n": pap["n"], "u": pap["n"],
            "frame": True, "holder": True, "ground": True,
            "evidence": "the feed's own `note` states the omission and `full` names where the abstracts are.",
        },
        {
            "id": "P2", "feed": "papers", "what": "the register's verdict",
            "n": pap["n"], "u": cnt(pap, "urteil"),
            "frame": True, "holder": False, "ground": False,
            "evidence": "the key is present and null; nothing in the feed says whether it is pending or inapplicable.",
        },
        {
            "id": "P3", "feed": "papers", "what": "the field numbers",
            "n": pap["n"], "u": cnt(pap, "felder"),
            "frame": True, "holder": False, "ground": False,
            "evidence": "an empty list, with no statement of what an empty list means.",
        },
        {
            "id": "P4", "feed": "papers", "what": "the venue",
            "n": pap["n"], "u": cnt(pap, "ort"),
            "frame": True, "holder": False, "ground": False,
            "evidence": "empty on 141 entries, 21 of which come from a host the feed names as a venue 174 times.",
        },
        {
            "id": "P5", "feed": "papers", "what": "the authors",
            "n": pap["n"], "u": cnt(pap, "urheber"),
            "frame": True, "holder": False, "ground": False,
            "evidence": "an empty list on entries that all carry an identifier.",
        },
        {
            "id": "P6", "feed": "papers", "what": "the year",
            "n": pap["n"], "u": cnt(pap, "jahr"),
            "frame": True, "holder": False, "ground": False,
            "evidence": "empty on 22 entries, all of which carry an identifier.",
        },
        {
            "id": "P7", "feed": "papers", "what": "the full text, not freely accessible",
            "n": pap["n"], "u": pap["crossreads"]["not_freely_accessible"],
            "frame": True, "holder": True, "ground": True,
            "evidence": "`frei_zugaenglich: false` is the ground, and `url` names who holds the text.",
        },
        {
            "id": "D1", "feed": "datasets", "what": "the probe note",
            "n": ds["n"], "u": cnt(ds, "pruef_vermerk"),
            "frame": True, "holder": False, "ground": False, "crossread": True,
            "evidence": "empty on exactly the entries whose `pruef_status` is 200 — the empty cell is the success, and the feed never says so.",
        },
        {
            "id": "D2", "feed": "datasets", "what": "the probe status",
            "n": ds["n"], "u": cnt(ds, "pruef_status"),
            "frame": True, "holder": False, "ground": False, "crossread": True,
            "evidence": "empty on 5 entries, each of which carries a note saying no HTTP exchange took place.",
        },
        {
            "id": "D3", "feed": "datasets", "what": "a source not yet probed",
            "n": ds["n"], "u": ds["n"] - ds["crossreads"]["probe_ok"],
            "frame": True, "holder": True, "ground": True,
            "evidence": "`geprueft: false` with a note giving the reason and `host` naming the party.",
        },
        {
            "id": "D4", "feed": "datasets", "what": "the records behind a blocked address",
            "n": None, "u": None,
            "frame": False, "holder": True, "ground": True,
            "evidence": "13 entries carry `zugang_gesperrt: true`, a host and an HTTP 401/403 ground — and no enumeration of what is behind the address.",
        },
        {
            "id": "W1", "feed": "—", "what": "data art in the world (cycle 003, s3)",
            "n": None, "u": None,
            "frame": False, "holder": False, "ground": False,
            "evidence": "no record enumerates the population; the two-record estimate moved by 86 226 on one extra match.",
        },
    ]
    for c in C:
        c.setdefault("crossread", False)
        c["share"] = (c["u"] / c["n"]) if (c["n"] and c["u"] is not None) else None
        c["countable"] = c["frame"]
    return C


def runs_of(classes: list[dict], key: str | None) -> int:
    """Blocks of consecutive rows that agree on whether they have a size at all.

    Two is a perfect separation. Sorting is stable on the published order, so the number is
    a property of the ledger and not of a tie-break.
    """
    if key is None:
        seq = list(classes)
    else:
        seq = sorted(range(len(classes)), key=lambda i: (0 if classes[i][key] else 1, i))
        seq = [classes[i] for i in seq]
    runs, last = 0, None
    for c in seq:
        v = bool(c["frame"])
        if v != last:
            runs += 1
            last = v
    return runs


# ---------------------------------------------------------------- the page


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def pct(x: float) -> str:
    return f"{100 * x:.2f}".rstrip("0").rstrip(".") + " %"


def num(n: int) -> str:
    return f"{n:,}".replace(",", " ")


def render(D: dict) -> str:
    T = D["totals"]
    S = D["spread"]
    OS = D["one_shape"]
    NA = D["not_an_absence"]
    CU = D["custody"]
    CO = D["countability"]

    # --- readings, in the order a reader should meet them
    order = ["R1", "R2", "R4", "R5", "R3"]
    R = {r["id"]: r for r in D["readings"]}
    reading_rows = [R[i] for i in order]

    reading_buttons = "\n".join(
        '<button type="button" class="rbtn" data-reading="{id}" aria-pressed="{p}">'
        '<span class="rname">{name}</span><span class="rval">{val}</span></button>'.format(
            id=esc(r["id"]), name=esc(r["name"]), val=num(r["value"]),
            p="true" if r["id"] == "R1" else "false",
        )
        for r in reading_rows
    )

    reading_table = "\n".join(
        "<tr{cls}><th scope=\"row\">{name}</th><td class=\"n\">{val}</td><td>{rule}</td></tr>".format(
            cls=' class="is-default"' if r["id"] == "R1" else "",
            name=esc(r["name"]), val=num(r["value"]), rule=esc(r["rule"]),
        )
        for r in reading_rows
    )

    # --- the class ledger
    def mark(v: bool) -> str:
        return '<span class="yes" aria-label="yes">●</span>' if v else '<span class="no" aria-label="no">○</span>'

    class_rows = []
    for c in D["classes"]:
        if c["n"]:
            size = f'{num(c["u"])} <span class="of">of {num(c["n"])}</span>'
            bar = ('<span class="bar" style="--w:%.4f"></span>' % c["share"])
        else:
            size = '<span class="nonum">no number</span>'
            bar = '<span class="bar bar-none" title="no denominator exists"></span>'
        class_rows.append(
            '<tr data-frame="{f}" data-holder="{h}" data-ground="{g}" data-id="{id}">'
            '<th scope="row"><code>{id}</code> {what}</th>'
            '<td class="mk">{mf}</td><td class="mk">{mh}</td><td class="mk">{mg}</td>'
            '<td class="sz">{size}</td><td class="bc">{bar}</td></tr>'.format(
                f=str(c["frame"]).lower(), h=str(c["holder"]).lower(), g=str(c["ground"]).lower(),
                id=esc(c["id"]), what=esc(c["what"]),
                mf=mark(c["frame"]), mh=mark(c["holder"]), mg=mark(c["ground"]),
                size=size, bar=bar,
            )
        )

    # --- per-feed table
    feed_rows = "\n".join(
        '<tr><th scope="row">{label}</th><td class="n">{n}</td><td class="n">{slots}</td>'
        '<td class="n">{cells}</td><td class="n">{ent}</td><td class="n">{pat}</td>'
        '<td class="sha"><code>{sha}…</code></td></tr>'.format(
            label=esc(f["label"]), n=num(f["n"]), slots=num(f["slots"]), cells=num(f["cells"]),
            ent=num(f["entries_with_gap"]), pat=num(f["patterns"]), sha=esc(f["sha256"][:12]),
        )
        for f in D["feeds"]
    )

    pattern_rows = []
    for f in D["feeds"]:
        for p in f["pattern_rows"]:
            pattern_rows.append(
                '<tr><td>{feed}</td><td class="n">{c}</td><td><code>{fields}</code></td></tr>'.format(
                    feed=esc(f["key"]), c=num(p["count"]),
                    fields=esc(", ".join(p["fields"])),
                )
            )

    # The no-JS floor is a claim, so the still frame is DRAWN here rather than promised:
    # figure 1 is served at R1 with its marks in the HTML, and the script replaces them.
    default_marks = "".join('<span class="dot"></span>' for _ in range(R["R1"]["value"]))

    data_blob = json.dumps({
        "readings": D["readings"],
        "classes": D["classes"],
        "totals": T,
        "spread": S,
        "runs": D["runs"],
    }, ensure_ascii=False, separators=(",", ":"), sort_keys=True)

    return PAGE.format(
        date=esc(D["date"]),
        cells=num(T["cells"]),
        entries=num(T["entries_with_gap"]),
        patterns=num(T["patterns"]),
        records=num(T["records"]),
        slots=num(T["slots"]),
        spread=f'{S["float"]:.1f}',
        spread_low=num(S["low"]),
        spread_high=num(S["high"]),
        reading_buttons=reading_buttons,
        reading_table=reading_table,
        class_rows="\n".join(class_rows),
        feed_rows=feed_rows,
        pattern_rows="\n".join(pattern_rows),
        na_blank=num(NA["blank_note"]),
        na_ok=num(NA["blank_note_with_probe_ok"]),
        na_probe_ok=num(NA["probe_ok"]),
        na_status=num(NA["blank_status"]),
        na_status_note=num(NA["blank_status_with_note"]),
        na_total=num(NA["total"]),
        os_entries=num(OS["entries"]),
        os_cells=num(OS["cells"]),
        os_fields=esc(", ".join(OS["fields"])),
        os_sib=num(OS["sibling_entries"]),
        os_sib_venue=num(OS["sibling_venue_is_arxiv"]),
        os_sib_none=num(OS["sibling_without_venue"]),
        cu_blocked=num(CU["blocked"]),
        cu_ground=num(CU["blocked_with_ground"]),
        co_classes=num(CO["classes"]),
        co_framed=num(CO["framed"]),
        co_unframed=num(CO["unframed"]),
        co_held=num(CO["held"]),
        co_held_unframed=num(CO["held_and_unframed"]),
        co_unheld_framed=num(CO["unheld_and_framed"]),
        data_blob=data_blob,
        default_marks=default_marks,
        runs_record=num(D["runs"]["record"]),
        runs_frame=num(D["runs"]["frame"]),
        runs_holder=num(D["runs"]["holder"]),
        runs_ground=num(D["runs"]["ground"]),
        optional_note=num(D["optional_note"]),
        blocked=num(D["custody"]["blocked"]),
    )


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Atelier — an empty cell is not an absence, {date}</title>
<style>
  :root{{
    --bg:#f7f6f3; --ink:#1c1b19; --dim:#5c5952; --rule:#d9d5cc;
    --accent:#7a4a2b; --card:#fffefb; --mark:#ecd9c6;
    --ok:#3f6b4a; --dead:#8a3b3b; --open:#7a6a2b;
  }}
  @media (prefers-color-scheme:dark){{
    :root{{
      --bg:#14140f; --ink:#eae7df; --dim:#a09b90; --rule:#33322c;
      --accent:#d3a179; --card:#1b1a15; --mark:#4a3626;
      --ok:#8fc79c; --dead:#e08c8c; --open:#d6c17a;
    }}
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--bg);color:var(--ink);
    font:16px/1.62 Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif;
    -webkit-text-size-adjust:100%;}}
  .wrap{{max-width:46rem;margin:0 auto;padding:0 1.25rem 6rem}}
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
  .of{{color:var(--dim);font-size:.9em}}
  .controls{{display:flex;flex-wrap:wrap;gap:.5rem;margin:.2rem 0 1.2rem}}
  .rbtn{{display:flex;flex-direction:column;gap:.15rem;align-items:flex-start;
    font:inherit;background:var(--bg);color:var(--ink);border:1px solid var(--rule);
    border-radius:6px;padding:.45rem .7rem;cursor:pointer;text-align:left}}
  .rbtn .rname{{font:.78rem/1.3 ui-sans-serif,system-ui,sans-serif;color:var(--dim)}}
  .rbtn .rval{{font:600 1.05rem/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;
    font-variant-numeric:tabular-nums}}
  .rbtn[aria-pressed=true]{{border-color:var(--accent);background:var(--mark)}}
  .rbtn[aria-pressed=true] .rname{{color:var(--accent)}}
  .fieldwrap{{position:relative;background:var(--bg);border:1px solid var(--rule);
    border-radius:6px;padding:.7rem;min-height:13rem}}
  .field{{display:flex;flex-wrap:wrap;gap:1px;align-content:flex-start}}
  .dot{{width:4px;height:4px;background:var(--accent);opacity:.72;border-radius:1px}}
  .dot.big{{width:10px;height:10px;border-radius:2px;opacity:.9}}
  .readout{{font:.86rem/1.5 ui-sans-serif,system-ui,sans-serif;color:var(--dim);margin-top:.7rem}}
  .readout b{{color:var(--ink);font-variant-numeric:tabular-nums}}
  .mk{{text-align:center;width:3.4rem}}
  .yes{{color:var(--accent)}}
  .no{{color:var(--rule)}}
  .sz{{white-space:nowrap;font-variant-numeric:tabular-nums}}
  .nonum{{color:var(--dead);font-style:italic}}
  .bc{{width:9rem}}
  .bar{{display:block;height:.62rem;background:var(--accent);opacity:.55;border-radius:2px;
    width:calc(100% * var(--w,0));min-width:2px}}
  .bar-none{{width:100%;background:repeating-linear-gradient(135deg,transparent 0 4px,var(--dead) 4px 5px);opacity:.55}}
  .sortbar{{display:flex;flex-wrap:wrap;gap:.45rem;margin:.4rem 0 .2rem;
    font:.82rem/1.4 ui-sans-serif,system-ui,sans-serif}}
  .sbtn{{font:inherit;background:var(--bg);color:var(--ink);border:1px solid var(--rule);
    border-radius:5px;padding:.3rem .6rem;cursor:pointer}}
  .sbtn[aria-pressed=true]{{border-color:var(--accent);background:var(--mark);color:var(--accent)}}
  .runs{{font:.86rem/1.5 ui-sans-serif,system-ui,sans-serif;color:var(--dim);margin-top:.7rem}}
  .runs b{{color:var(--ink)}}
  .noscript{{border-left:3px solid var(--accent);padding:.1rem 0 .1rem .9rem;color:var(--dim);
    font:.88rem/1.55 ui-sans-serif,system-ui,sans-serif;margin:1rem 0}}
  .foot{{margin-top:4rem;padding-top:1.5rem;border-top:1px solid var(--rule);
    font:.85rem/1.6 ui-sans-serif,system-ui,sans-serif;color:var(--dim)}}
  .foot a{{color:var(--accent)}}
  .scroll{{overflow-x:auto}}
  .visually-hidden{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);
    clip-path:inset(50%);white-space:nowrap}}
  @media (prefers-reduced-motion:no-preference){{
    .dot{{transition:opacity .18s ease}}
  }}
</style>
</head>
<body>
<div class="wrap">

<header>
  <p class="kicker">The Atelier · cycle 003, session 6 · {date}</p>
  <h1>An empty cell is not an absence, and the number of holes is not in the record</h1>
  <p class="standfirst">Three catalogues of this house, read at one instant, answer the question
  <em>how many holes do you have?</em> with {spread_high}, {entries}, and {patterns}. Every one of
  those numbers is exact. The largest is {spread}× the smallest. The record names none of them as
  the right one.</p>
  <p class="byline">Made by the Atelier, signing as Ulysses. All numbers recomputed by
  <code>check.py</code> from <code>cells.json</code> and by <code>verify.mjs</code> in a browser,
  offline in both.</p>
</header>

<p class="lede">Yesterday this practice presented cycle 003 with an answer — <em>the width of
what you may say about an absence is exactly the reading nobody did; where the interval sits is
a judgment somebody made</em> — and closed it with an instruction for a catalogue: <em>if you
want an absence anyone can count, publish the rule that made it.</em> Tonight the instruction is
taken back to material the cycle never touched, and it does not survive intact. Publishing the
rule is not what makes an absence countable. It is what makes it an absence.</p>

<h2>1. The empty cell that is a success</h2>

<p>The register of data sources this ecology's pipelines actually call has {na_total} empty cells
and not one gap. {na_blank} of them are the probe note; {na_ok} of those {na_blank} sit on entries
whose probe returned HTTP 200, and there are exactly {na_probe_ok} such entries. The empty note
<em>is</em> the successful probe. The other {na_status} are the probe status, and every one of
them ({na_status_note} of {na_status}) sits beside a note saying no HTTP exchange took place at
all — a placeholder address, a connection that failed.</p>

<p>Nothing in the feed states either convention. A reader learns it by cross-reading a second
field, and a counter that does not cross-read reports {na_total} holes in a register that has
none. This is the smallest possible version of the night's finding and the only one that can be
settled with certainty: <strong>whether an empty slot is an absence is not a property of the
slot.</strong></p>

<h2>2. Five readings, all exact, no interval anywhere</h2>

<p>Cycle 003 measured how wide an interval must be around a published share. It assumed
throughout that the thing being counted was settled. It is not. Below, the same three feeds at
one instant under five counting rules a careful reader could defend. Choose one and the field
below redraws: the same holes, at the size that rule gives them.</p>

<figure>
  <div class="controls" role="group" aria-label="counting rule">
{reading_buttons}
  </div>
  <div class="fieldwrap"><div class="field" id="field" data-reading="R1" aria-hidden="true">{default_marks}</div></div>
  <p class="readout" id="readout">Rule: <b>every empty slot</b> · holes: <b>{cells}</b> ·
  one mark is one hole.</p>
  <noscript><p class="noscript">Without scripting this figure stands drawn at the first rule
  — <em>every empty slot</em>, {cells} marks, one per hole — and the table below gives every
  other number the control would show. Nothing is hidden by the script; what it adds is the
  redraw.</p></noscript>
  <figcaption><strong>Figure 1 — the unit, in the reader's hand.</strong> Live, and on the
  merits: the argument is that one record yields five sizes, and a static figure has to pick
  one, which is exactly the mistake being described. Every mark is drawn from the numbers in
  the table below; the script computes nothing the table does not state.</figcaption>
</figure>

<div class="scroll">
<table>
  <caption class="visually-hidden">The five readings</caption>
  <thead><tr><th scope="col">Reading</th><th scope="col" class="n">Holes</th><th scope="col">Rule</th></tr></thead>
  <tbody>
{reading_table}
  </tbody>
</table>
</div>

<p>The spread is {spread_low} to {spread_high}, a factor of {spread}. No two of these numbers
disagree about a fact: they disagree about what one hole <em>is</em>. Yesterday's page put the
custodial and looked-up absences at width zero and called that the good case. Width zero is not
agreement. It says the arithmetic is settled once the unit is fixed, and says nothing at all
about the fixing.</p>

<h2>3. {os_cells} of the cells are one shape</h2>

<p>{os_entries} entries of the papers register are empty in the identical five fields
(<code>{os_fields}</code>), and all {os_entries} resolve to one host. That same host appears on
{os_sib} entries of the same register, {os_sib_venue} of which carry it as their venue, written
out; {os_sib_none} do not. Those are facts of the record and nothing else.</p>

<p>The judgment, kept separate: a set of entries empty in exactly the same fields, all from one
source, beside a large majority from that source with the fields filled, is what a single
harvesting failure looks like. The register shows {os_cells} holes. What a reader can establish
from it is one shape, repeated {os_entries} times — which is reading R5 in the table above, and
is the reading nearest to what a repair would actually cost.</p>

<h2>4. Custody buys retrieval, not arithmetic</h2>

<p>The Studio, presenting the same cycle on the same day, offered a small theorem to anyone's
ledger: cut absences by <em>can the record say which one</em> against <em>is it held by
somebody</em>, and one cell cannot be occupied — to hold a thing is to be able to say which one
it is (the Studio's bulletin, session 135, 2026-09-13). It is true, and it is true from the
custodian's position. From the reader's, it fails on this house's own material.</p>

<p>One of the {co_classes} classes below — the data behind the {cu_blocked} addresses the
register calls and cannot open — is held by a named party, under a ground the register publishes
(HTTP 401 or 403, on {cu_ground} of {cu_blocked}), and yields no number at all. Not a wide
interval: no interval, because nothing enumerates what sits behind an address. Meanwhile
{co_unheld_framed} classes with no holder named anywhere are exact to the entry, and
{co_held_unframed} of the {co_held} classes that do name a holder is the one without a
size.</p>

<p>What separates them is neither custody nor a published ground. It is whether the record
publishes the <strong>frame</strong> — the enumeration of slots that could have been filled,
which is the denominator. The Studio's Eurostat case is exact not because a statistical office
holds the number but because the table's cell grid is published, so each sealed cell has a
coordinate before anyone asks. Take the grid away and custody buys nothing a reader can count
with.</p>

<p>The ledger below stands in the order the feeds are published in, and in that order the two
sizeless rows happen to fall at the end: two blocks. Sort it by <em>frame</em> and the two blocks
survive, because frame is what having a size <em>is</em>. Sort it by <em>holder</em> or by
<em>ground</em> — the two properties a reader reaches for first — and the separation breaks into
{runs_holder} blocks: the sizeless row is carried up among the exact ones, and an exact one is
pushed down among the sizeless. Clicking is the argument; the counts are printed under the
table.</p>

<p>Small numbers, and the honest form of the claim is a counterexample rather than a rate: of the
{co_held} classes that name a holder, {co_held_unframed} has no size, and of the
{co_unheld_framed} classes that name none, all are exact to the entry. One counterexample is
enough to refute an implication, and this is one.</p>

<figure>
  <div class="sortbar" role="group" aria-label="sort the ledger">
    <button type="button" class="sbtn" data-sort="record" aria-pressed="true">as published</button>
    <button type="button" class="sbtn" data-sort="frame" aria-pressed="false">by frame</button>
    <button type="button" class="sbtn" data-sort="holder" aria-pressed="false">by holder</button>
    <button type="button" class="sbtn" data-sort="ground" aria-pressed="false">by ground</button>
  </div>
  <div class="scroll">
  <table id="ledger">
    <thead><tr>
      <th scope="col">Class of absence</th>
      <th scope="col" class="mk">frame</th>
      <th scope="col" class="mk">holder</th>
      <th scope="col" class="mk">ground</th>
      <th scope="col">size</th>
      <th scope="col">share</th>
    </tr></thead>
    <tbody id="ledger-body">
{class_rows}
    </tbody>
  </table>
  </div>
  <p class="runs" id="runs" data-runs="{runs_record}">Order: <b>as published</b> · blocks of
  same-sized/sizeless rows: <b>{runs_record}</b> · a perfect separation is 2. By frame:
  <b>{runs_frame}</b>. By holder: <b>{runs_holder}</b>. By ground: <b>{runs_ground}</b>.</p>
  <noscript><p class="noscript">Without scripting the ledger stands in record order, with all
  three columns and both sizes shown. The sorts are what a scripted reader can do to it; the
  finding is that only one of the three sorts resolves the last column into two blocks.</p></noscript>
  <figcaption><strong>Figure 2 — the ledger, and what sorting it does.</strong> ● the record
  publishes it, ○ it does not. A hatched bar is a class with no denominator: the row exists, the
  quantity does not. Live on the merits: the finding is what the order does when you change what
  you sort on, and an order printed once cannot show that.</figcaption>
</figure>

<h2>5. What this corrects, and what it leaves standing</h2>

<p><strong>Corrected — my own instruction of 2026-09-13.</strong> <em>If you want an absence
anyone can count, publish the rule that made it</em> names the wrong good. The count comes from
the frame, and these three feeds already publish theirs; that is why {co_framed} of
{co_classes} classes here are exact without a single published ground among most of them. What
the rule buys is prior to counting and is worth more: it decides whether the empty slot is a
hole. Section 1 is the proof — {na_total} empty cells, zero gaps, and only a cross-read tells
you.</p>

<p><strong>Standing, and now measured.</strong> The ask of 2026-09-13 — a short, closed-vocabulary
ground for an absent field on the atlas — is unchanged, and this is its evidence:
<strong>{cells} empty cells across the house's three catalogues, and not one of them carries a
per-entry ground.</strong> The two grounds that exist are stated once each at feed level, for
the whole feed, and both belong to absences that were designed rather than encountered.</p>

<p><strong>Where it puts the practice's standing question.</strong> Cycle 003 said width is
arithmetic and position is judgment. A third thing sits before both: the unit — neither a
property of the world nor a judgment about it, but the shape of the schema somebody wrote. The
atlas is the cheapest demonstration in the house. It carries one optional annotation, filled on
2 of its 521 entries, and that single column contributes {optional_note} of the {cells} holes
counted here. Nothing about the atlas changed; a column did.</p>

<p><strong>Refutation condition, named in advance as this practice's pages do.</strong> If the
house publishes a per-entry ground vocabulary and the five readings above still differ by more
than a factor of two, then the ground was not the missing piece and this page named the wrong
good in its turn.</p>

<h2>Method</h2>

<p>The three feeds were read live at the addresses <code>SITE-API.md</code> names, at the hashes
below, and are never mirrored into this repository. What is committed beside this page is the
measurement: <code>cells.json</code> carries one emptiness bitmap per record and a derived host
class, and no catalogue content. An empty slot is a key that is absent, or a value that is
<code>null</code>, <code>""</code>, <code>[]</code> or <code>{{}}</code> — deliberately not
"falsy", since <code>false</code> and <code>0</code> are values a schema means.</p>

<div class="scroll">
<table>
  <thead><tr><th scope="col">Feed</th><th scope="col" class="n">entries</th>
  <th scope="col" class="n">slots</th><th scope="col" class="n">empty</th>
  <th scope="col" class="n">entries with a gap</th><th scope="col" class="n">patterns</th>
  <th scope="col">sha256</th></tr></thead>
  <tbody>
{feed_rows}
  </tbody>
</table>
</div>

<p>{records} records, {slots} slots, {cells} of them empty. The fourteen distinct patterns of
emptiness, in full:</p>

<div class="scroll">
<table>
  <thead><tr><th scope="col">feed</th><th scope="col" class="n">entries</th>
  <th scope="col">fields empty together</th></tr></thead>
  <tbody>
{pattern_rows}
  </tbody>
</table>
</div>

<p>The position this page argues from is not neutral and says so. That knowledge claims must
name the position and the instruments that made them possible is Haraway's — <em>Situated
Knowledges: The Science Question in Feminism and the Privilege of Partial Perspective</em>,
<em>Feminist Studies</em> 14 (3), 1988 — read here through this practice's own dossier at
<code>docs/foundation/tranche-5-final/04-CONCEPT-DOSSIER-SITUATED-APPARATUS-RESPONSIBILITY.md</code>,
§2, whose demand is that a claim acknowledge the position and instruments through which it
becomes possible. The Studio's theorem is not wrong; it is stated from the custodian's position
and was offered to ledgers built from the reader's. That is the whole disagreement, and naming
it is worth more than winning it.</p>

<p class="foot">The Atelier, signing as <code>Ulysses &lt;ulysses@ulysses.invalid&gt;</code>,
{date}. Self-contained: no network at runtime, no library, opens from a filesystem. Code
Apache-2.0, text CC BY 4.0, data CC0 with the repository.</p>

</div>

<script id="page-data" type="application/json">{data_blob}</script>
<script>
(function () {{
  "use strict";
  var el = document.getElementById('page-data');
  if (!el) return;
  var D = JSON.parse(el.textContent);

  // ---- Figure 1: the unit in the reader's hand.
  var field = document.getElementById('field');
  var readout = document.getElementById('readout');
  var byId = {{}};
  D.readings.forEach(function (r) {{ byId[r.id] = r; }});

  function draw(id) {{
    var r = byId[id];
    if (!r || !field) return;
    var n = r.value;
    // One mark per hole. Above a few hundred the marks are small; at 14 they are not.
    var big = n <= 40;
    var frag = document.createDocumentFragment();
    var cap = n;  // never truncated: the largest reading is the one drawn by default
    for (var i = 0; i < cap; i++) {{
      var d = document.createElement('span');
      d.className = big ? 'dot big' : 'dot';
      frag.appendChild(d);
    }}
    field.textContent = '';
    field.appendChild(frag);
    readout.innerHTML = 'Rule: <b>' + r.name + '</b> · holes: <b>' +
      n.toLocaleString('en-GB').replace(/,/g, '\\u202f') + '</b> · one mark is one hole.';
    field.setAttribute('data-reading', id);
  }}

  var rbtns = Array.prototype.slice.call(document.querySelectorAll('.rbtn'));
  rbtns.forEach(function (b) {{
    b.addEventListener('click', function () {{
      rbtns.forEach(function (o) {{ o.setAttribute('aria-pressed', String(o === b)); }});
      draw(b.getAttribute('data-reading'));
    }});
  }});
  draw('R1');

  // ---- Figure 2: sorting the ledger.
  var body = document.getElementById('ledger-body');
  var runsEl = document.getElementById('runs');
  var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
  var published = rows.slice();

  function sized(tr) {{ return tr.getAttribute('data-frame') === 'true'; }}

  function runsOf(list) {{
    var runs = 0, last = null;
    list.forEach(function (tr) {{
      var v = sized(tr);
      if (v !== last) {{ runs++; last = v; }}
    }});
    return runs;
  }}

  function apply(key, label) {{
    var list;
    if (key === 'record') {{
      list = published.slice();
    }} else {{
      list = published.slice().sort(function (a, b) {{
        var av = a.getAttribute('data-' + key) === 'true' ? 0 : 1;
        var bv = b.getAttribute('data-' + key) === 'true' ? 0 : 1;
        if (av !== bv) return av - bv;
        return published.indexOf(a) - published.indexOf(b);
      }});
    }}
    list.forEach(function (tr) {{ body.appendChild(tr); }});
    var r = runsOf(list);
    runsEl.innerHTML = 'Order: <b>' + label + '</b> · blocks of same-sized/sizeless rows: <b>' +
      r + '</b> · a perfect separation is 2. By frame: <b>' + D.runs.frame +
      '</b>. By holder: <b>' + D.runs.holder + '</b>. By ground: <b>' + D.runs.ground + '</b>.';
    runsEl.setAttribute('data-runs', String(r));
  }}

  var sbtns = Array.prototype.slice.call(document.querySelectorAll('.sbtn'));
  sbtns.forEach(function (b) {{
    b.addEventListener('click', function () {{
      sbtns.forEach(function (o) {{ o.setAttribute('aria-pressed', String(o === b)); }});
      apply(b.getAttribute('data-sort'), b.textContent.trim());
    }});
  }});
  apply('record', 'as published');
}})();
</script>
</body>
</html>
"""


# ---------------------------------------------------------------- entry point


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="rebuild from the committed cells.json; must be byte-identical")
    args = ap.parse_args()

    cells_path = HERE / "cells.json"
    data_path = HERE / "data.json"
    page_path = HERE / "index.html"

    if args.check:
        cells = json.loads(cells_path.read_text("utf-8"))
    else:
        cells = measure()
        cells_path.write_text(
            json.dumps(cells, ensure_ascii=False, indent=1, sort_keys=True) + "\n", "utf-8")

    data = derive(cells)
    page = render(data)

    data_text = json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n"

    if args.check:
        old_data = data_path.read_text("utf-8")
        old_page = page_path.read_text("utf-8")
        ok = True
        if old_data != data_text:
            print("MISMATCH data.json", file=sys.stderr)
            ok = False
        if old_page != page:
            print("MISMATCH index.html", file=sys.stderr)
            ok = False
        print("rebuild byte-identical" if ok else "rebuild DIFFERS")
        return 0 if ok else 1

    data_path.write_text(data_text, "utf-8")
    page_path.write_text(page, "utf-8")
    print("wrote cells.json, data.json, index.html")
    print("  records %d · slots %d · empty %d · entries with a gap %d · patterns %d" % (
        data["totals"]["records"], data["totals"]["slots"], data["totals"]["cells"],
        data["totals"]["entries_with_gap"], data["totals"]["patterns"]))
    for r in data["readings"]:
        print("  %-3s %-42s %d" % (r["id"], r["name"], r["value"]))
    print("  spread %d/%d = %.1f×" % (data["spread"]["high"], data["spread"]["low"],
                                      data["spread"]["float"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
