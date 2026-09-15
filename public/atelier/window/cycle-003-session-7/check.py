#!/usr/bin/env python3
"""check.py — recompute every number this page publishes, from the committed files alone.

Offline and independent of `build.py`: it imports nothing from it and reimplements the six
readings, the two nights and the load-bearing cells of the ledger from `cells.json` (tonight's
bitmaps) and `../cycle-003-session-6/cells.json` (last night's, this practice's own committed
record). It also reads `index.html` as text and asserts that what the page serves — including
the still frame a reader without scripting gets — carries the numbers the data file states.

    python3 window/cycle-003-session-7/check.py

Exit 0 and a count of checks, or exit 1 and the first failures. Author: the Atelier.
"""

from __future__ import annotations

import json
import hashlib
import pathlib
import re
import sys
from collections import Counter

HERE = pathlib.Path(__file__).resolve().parent
PRIOR = HERE.parent / "cycle-003-session-6" / "cells.json"

CONVENTION = {           # what each feed's record itself shows is not a gap
    "atlas": {"fields": {"curator_note"}, "all": False},
    "papers": {"fields": set(), "all": False},
    "datasets": {"fields": set(), "all": True},
}

FAIL: list[str] = []
N = 0


def check(label: str, cond: bool) -> None:
    global N
    N += 1
    if not cond:
        FAIL.append(label)


def eq(label: str, got, want) -> None:
    global N
    N += 1
    if got != want:
        FAIL.append(f"{label}: got {got!r}, want {want!r}")


# ------------------------------------------------------------- the readings


def readings(feed: dict) -> dict:
    """The six readings for one feed, computed from its bitmap alone."""
    rows = feed["rows"]
    k = len(feed["schema"])
    cells = sum(len(r["miss"]) for r in rows)
    conv = CONVENTION[feed["key"]]
    if conv["all"]:
        conv_cells = cells
    else:
        conv_cells = sum(1 for r in rows for m in r["miss"] if m in conv["fields"])
    shapes = Counter(tuple(sorted(r["miss"])) for r in rows if r["miss"])
    return {
        "n": len(rows), "slots": len(rows) * k,
        "R1": cells,
        "R2": sum(1 for r in rows if r["miss"]),
        "R4": cells - conv_cells,
        "R5": sum(len(s) for s in shapes),
        "R3": len(shapes),
        "R6": cells / (len(rows) * k),
    }


def totals(cells: dict) -> dict:
    per = {f["key"]: readings(f) for f in cells["feeds"]}
    out = {r: sum(per[k][r] for k in per) for r in ("R1", "R2", "R4", "R5", "R3")}
    out["slots"] = sum(per[k]["slots"] for k in per)
    out["n"] = sum(per[k]["n"] for k in per)
    out["R6"] = out["R1"] / out["slots"]
    return out, per


def main() -> int:
    now = json.loads((HERE / "cells.json").read_text())
    was = json.loads(PRIOR.read_text())
    D = json.loads((HERE / "data.json").read_text())
    page = (HERE / "index.html").read_text()

    # --- the committed bitmaps are what they claim to be ---------------------
    eq("prior file sha256 recorded", now.get("prior_sha256"),
       hashlib.sha256(PRIOR.read_bytes()).hexdigest())
    for f in now["feeds"]:
        eq(f"{f['key']}: rows match n", len(f["rows"]), f["n"])
        eq(f"{f['key']}: feed declares its own count", f["declared_count"], f["n"])
        eq(f"{f['key']}: every key of the schema is a key the feed actually shows",
           [k for k in f["schema"] if k not in f["keys_seen"]], [])
        eq(f"{f['key']}: no key outside the schema appeared",
           [k for k in f["keys_seen"] if k not in f["schema"]], [])
        check(f"{f['key']}: every miss field belongs to the schema",
              all(m in f["schema"] for r in f["rows"] for m in r["miss"]))
        check(f"{f['key']}: no catalogue content is committed",
              all(set(r) <= {"k", "w", "miss", "host"} for r in f["rows"]))
        # the session's repair: two content-free identities on every row
        check(f"{f['key']}: every row carries both digests",
              all(re.fullmatch(r"[0-9a-f]{16}", r["k"]) and re.fullmatch(r"[0-9a-f]{16}", r["w"])
                  for r in f["rows"]))
        eq(f"{f['key']}: the wide digest separates every entry",
           len({r["w"] for r in f["rows"]}), f["n"])
    check("last night's file carries no digests (the defect this session repairs)",
          all("k" not in r for f in was["feeds"] for r in f["rows"]))

    # --- the register's own identifier does not identify ----------------------
    ident = D["identity"]
    for f in now["feeds"]:
        eq(f"{f['key']}: collisions on the record's own identifier",
           ident["id_collisions"][f["key"]], len(f["rows"]) - len({r["k"] for r in f["rows"]}))
        eq(f"{f['key']}: no collision on the wide identity",
           ident["wide_collisions"][f["key"]], 0)
    eq("the papers register's identifier collides", ident["id_collisions"]["papers"], 3)
    eq("one identifier is carried by four entries",
       ident["worst_id"]["entries_sharing_one_id"], 4)
    check("and those entries differ in fields that matter",
          set(ident["worst_id"]["fields_that_differ"]) >= {"titel", "kennung", "url"})

    # --- the six readings on both nights -------------------------------------
    t_now, per_now = totals(now)
    t_was, per_was = totals(was)
    for d in D["directions"]:
        eq(f"tonight {d['id']}", d["now"], t_now[d["id"]])
        eq(f"last night {d['id']}", d["was"], t_was[d["id"]])
        want = "down" if d["now"] < d["was"] else ("up" if d["now"] > d["was"] else "flat")
        eq(f"direction {d['id']}", d["dir"], want)
    eq("three readings fall", sum(1 for d in D["directions"] if d["dir"] == "down"), 3)
    eq("two readings do not move", sum(1 for d in D["directions"] if d["dir"] == "flat"), 2)
    eq("one reading rises", sum(1 for d in D["directions"] if d["dir"] == "up"), 1)

    # the numbers session 6 published, recomputed here under tonight's general rules
    s6 = D["session6_published"]
    for r in ("R1", "R2", "R4", "R3"):
        eq(f"session 6's {r} reproduced", t_was[r], s6[r])
    check("session 6's fifth reading was hand-fitted and is NOT reproduced",
          t_was["R5"] != s6["R5_hand_fitted"])

    # --- the departure --------------------------------------------------------
    dep = D["departure"]
    eq("papers last night", dep["was"], per_was["papers"]["n"])
    eq("papers tonight", dep["now"], per_now["papers"]["n"])
    eq("entries gone", dep["gone"], dep["was"] - dep["now"])
    eq("157 entries gone", dep["gone"], 157)
    hn = Counter(r["host"] for r in next(f for f in now["feeds"] if f["key"] == "papers")["rows"])
    hw = Counter(r["host"] for r in next(f for f in was["feeds"] if f["key"] == "papers")["rows"])
    for h in ("arxiv", "doi", "other"):
        eq(f"hosts tonight: {h}", dep["hosts_now"].get(h, 0), hn[h])
        eq(f"hosts last night: {h}", dep["hosts_was"].get(h, 0), hw[h])
        eq(f"host movement: {h}", dep["host_delta"].get(h, 0), hn[h] - hw[h])
    eq("the host movements sum to the departure",
       sum(dep["host_delta"].values()), -dep["gone"])
    eq("the atlas did not move", per_now["atlas"], per_was["atlas"])
    eq("the atlas's bytes did not move",
       next(f for f in now["feeds"] if f["key"] == "atlas")["sha256"],
       next(f for f in was["feeds"] if f["key"] == "atlas")["sha256"])
    check("the papers feed's bytes did move",
          next(f for f in now["feeds"] if f["key"] == "papers")["sha256"] !=
          next(f for f in was["feeds"] if f["key"] == "papers")["sha256"])

    # --- what the register says it turned away --------------------------------
    ta = now.get("turned_away", {})
    eq("the full feed declares the same count", ta.get("count"), per_now["papers"]["n"])
    eq("the full feed's rejections are carried", D["departure"]["turned_away"], ta)
    eq("the rejected list holds one entry", ta.get("rejected_count"), 1)
    eq("and it is older than both nights", ta.get("rejected_dates"), ["2026-07-30"])
    check("the departures are not in the record as rejections",
          ta.get("rejected_count", 0) < dep["gone"])

    # --- the share that moved without a cell moving ---------------------------
    ax = D["arxiv"]
    cn = next(f for f in now["feeds"] if f["key"] == "papers")["crossreads"]
    cw = next(f for f in was["feeds"] if f["key"] == "papers")["crossreads"]
    eq("arXiv entries tonight", ax["now_entries"], cn["arxiv_entries"])
    eq("arXiv entries last night", ax["was_entries"], cw["arxiv_entries"])
    eq("arXiv entries without a venue tonight", ax["now_without"], cn["arxiv_without_venue"])
    eq("the numerator did not move", ax["now_without"], ax["was_without"])
    check("the denominator did move", ax["now_entries"] != ax["was_entries"])
    eq("tonight's share", round(ax["now_share"], 9),
       round(cn["arxiv_without_venue"] / cn["arxiv_entries"], 9))
    check("the share moved by more than a factor of four",
          ax["now_share"] / ax["was_share"] > 4)

    # --- the ledger: verdicts recomputed from the cells -----------------------
    ids = [r["id"] for r in D["readings"]]
    eq("six readings", len(ids), 6)
    counts = Counter()
    for s in D["statements"]:
        vals = [c["v"] for c in s["cells"].values() if c["v"] is not None]
        want = ("blind" if not vals else
                "certain" if all(vals) else
                "refuted" if not any(vals) else "contingent")
        eq(f"{s['id']} verdict", s["verdict"], want)
        eq(f"{s['id']} evaluable", s["evaluable"], len(vals))
        eq(f"{s['id']} true_under", s["true_under"], sum(1 for v in vals if v))
        eq(f"{s['id']} has a cell for every reading", sorted(s["cells"]), sorted(ids))
        for r, c in s["cells"].items():
            if c["v"] is None:
                check(f"{s['id']}/{r} says why it cannot be evaluated", bool(c.get("why")))
        counts[s["verdict"]] += 1
    eq("fourteen statements", len(D["statements"]), 14)
    for k, v in D["verdicts"].items():
        eq(f"verdict tally: {k}", v, counts.get(k, 0))
    eq("exactly one statement no reading reaches", counts["blind"], 1)
    eq("three statements are this practice's own",
       sum(1 for s in D["statements"] if s["practice"]), 3)

    # --- the load-bearing cells, recomputed independently ---------------------
    st = {s["id"]: s for s in D["statements"]}
    eq("S9 under empty slots (the house is missing less)",
       st["S9"]["cells"]["R1"]["v"], t_now["R1"] < t_was["R1"])
    eq("S9 under the share (it is missing more)",
       st["S9"]["cells"]["R6"]["v"], t_now["R6"] < t_was["R6"])
    check("S9 is contingent because the count and the share disagree",
          st["S9"]["cells"]["R1"]["v"] is True and st["S9"]["cells"]["R6"]["v"] is False)
    eq("S10 under empty slots", st["S10"]["cells"]["R1"]["v"],
       per_now["papers"]["R1"] < per_was["papers"]["R1"])
    eq("S12: every entry of the register carries a gap tonight",
       st["S12"]["cells"]["R2"]["v"], per_now["papers"]["R2"] == per_now["papers"]["n"])
    check("S12 was false last night", per_was["papers"]["R2"] != per_was["papers"]["n"])
    eq("S12 is reached by exactly one reading", st["S12"]["evaluable"], 1)
    check("S13 is reached by no reading",
          all(c["v"] is None for c in st["S13"]["cells"].values()))
    eq("S14 is refuted", st["S14"]["verdict"], "refuted")
    eq("S11 is certain and the bytes agree with it", st["S11"]["verdict"], "certain")

    # --- the page serves what the data states ---------------------------------
    def served(n: int) -> str:
        return f"{n:,}".replace(",", " ")

    for n in (dep["gone"], dep["was"], dep["now"], t_now["R1"], t_was["R1"],
              ax["now_entries"], ax["was_entries"], ax["now_without"]):
        check(f"the page serves {n}", served(n) in page)
    check("the page names its outside source",
          "Libkin" in page and "PODS'14" in page)
    check("the page names the certain-answers definition",
          "certain(" in page and "[[" in page)
    check("the page prints its refutation condition in advance",
          "Refutation condition" in page)
    check("the page carries no external resource",
          not re.search(r'(src|href)="https?://', page))
    check("the page fetches nothing",
          "fetch(" not in page and "XMLHttpRequest" not in page)
    check("the page carries no external stylesheet or script tag",
          not re.search(r'<(script|link)[^>]*\s(src|href)=', page))
    # the no-JS floor: the served figure is drawn, not promised
    eq("the still frame draws last night's register",
       len(re.findall(r'<span class="dot [ado]"></span>', page)), dep["was"])
    eq("the ledger is served whole",
       len(re.findall(r'<tr data-verdict=', page)), len(D["statements"]))
    eq("every ledger cell is served",
       len(re.findall(r'<td class="mk', page)), len(D["statements"]) * 6)

    print(f"{N} checks", "— all pass" if not FAIL else f"— {len(FAIL)} FAILED")
    for f in FAIL[:20]:
        print("  ✗", f)
    return 1 if FAIL else 0


if __name__ == "__main__":
    raise SystemExit(main())
