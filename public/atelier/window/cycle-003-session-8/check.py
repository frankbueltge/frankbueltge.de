#!/usr/bin/env python3
"""check.py — recompute every number this page publishes, from the committed files alone.

Offline, and independent of `build.py`: it imports nothing from it and reimplements the six
readings, the membership subtraction, the three-term split, the shape truth and the repair term
from `cells.json` (tonight), `../cycle-003-session-7/cells.json` (last night, the first file in
this line that carries identity digests) and `../cycle-003-session-6/cells.json` (the night
before, counts only). It then reads `index.html` as text and asserts that what the page serves
— including the still frame a reader without scripting gets — carries the numbers it states.

    python3 window/cycle-003-session-8/check.py

Exit 0 and a count of checks, or exit 1 and the first failures. Author: the Atelier.
"""

from __future__ import annotations

import hashlib
import json
import pathlib
import re
import sys
from collections import Counter

HERE = pathlib.Path(__file__).resolve().parent
PRIOR = HERE.parent / "cycle-003-session-7" / "cells.json"
FIRST = HERE.parent / "cycle-003-session-6" / "cells.json"

# What each feed's own record shows is not a gap — session 6's cross-read, restated here rather
# than imported, so an error in the build's table is not copied into its own check.
CONVENTION = {
    "atlas": {"fields": {"curator_note"}, "all": False},
    "papers": {"fields": set(), "all": False},
    "datasets": {"fields": set(), "all": True},
}
DISTRIBUTIVE = {"R1", "R2", "R4"}
ALGEBRAIC = {"R6"}
HOLISTIC = {"R3", "R5"}

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


# ------------------------------------------------------------------ readings


def readings(key: str, rows: list[dict], columns: int) -> dict:
    shapes = Counter(tuple(sorted(r["miss"])) for r in rows if r["miss"])
    cells = sum(len(r["miss"]) for r in rows)
    conv = CONVENTION[key]
    if conv["all"]:
        explained = cells
    else:
        explained = sum(1 for r in rows for m in r["miss"] if m in conv["fields"])
    slots = len(rows) * columns
    return {
        "n": len(rows), "slots": slots,
        "R1": cells,
        "R2": sum(1 for r in rows if r["miss"]),
        "R4": cells - explained,
        "R5": sum(len(s) for s in shapes),
        "R3": len(shapes),
        "R6": (cells / slots) if slots else 0.0,
    }


def totals(cells: dict) -> dict:
    per = {f["key"]: readings(f["key"], f["rows"], len(f["schema"])) for f in cells["feeds"]}
    t = {i: sum(per[k][i] for k in per) for i in ("R1", "R2", "R3", "R4", "R5")}
    t["slots"] = sum(per[k]["slots"] for k in per)
    t["n"] = sum(per[k]["n"] for k in per)
    t["R6"] = t["R1"] / t["slots"]
    return t


def main() -> int:
    D = json.loads((HERE / "data.json").read_text())
    C = json.loads((HERE / "cells.json").read_text())
    P = json.loads(PRIOR.read_text())
    F = json.loads(FIRST.read_text())
    html = (HERE / "index.html").read_text()
    text = re.sub(r"<script.*?</script>|<style.*?</style>", "", html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)

    def served(s: str, label: str) -> None:
        """A number the page states must be in the text a reader without scripting sees.

        The page groups figures with a narrow no-break space, which the whitespace collapse
        above turns into an ordinary one; the needle is normalised the same way, so this
        asserts the digits and not the typography.
        """
        check(f"served: {label} ({s})", s.replace(" ", " ") in text)

    def grouped(n: int) -> str:
        return f"{n:,}".replace(",", " ")

    # ---- the files are the ones the page names ------------------------------------
    eq("date", C["date"], "2026-09-16")
    eq("prior date", C["prior_date"], "2026-09-15")
    eq("data date", D["date"], C["date"])
    eq("prior file sha", hashlib.sha256(PRIOR.read_bytes()).hexdigest(), D["prior_sha256"])
    eq("first file sha", hashlib.sha256(FIRST.read_bytes()).hexdigest(), D["first_sha256"])
    eq("prior cells date", P["date"], "2026-09-15")
    eq("first cells date", F["date"], "2026-09-14")

    # ---- the three nights' readings ------------------------------------------------
    t3, t2, t1 = totals(C), totals(P), totals(F)
    for i in ("R1", "R2", "R3", "R4", "R5", "n", "slots"):
        eq(f"tonight {i}", t3[i], D["totals"]["now"][i])
        eq(f"last night {i}", t2[i], D["totals"]["prior"][i])
        eq(f"first night {i}", t1[i], D["totals"]["first"][i])
    check("R6 tonight", abs(t3["R6"] - D["totals"]["now"]["R6"]) < 1e-15)

    # The series the page prints must be those three nights and nothing else.
    for s in D["series"]:
        eq(f"series {s['id']} first", s["first"], t1[s["id"]])
        eq(f"series {s['id']} was", s["was"], t2[s["id"]])
        eq(f"series {s['id']} now", s["now"], t3[s["id"]])
        check(f"series {s['id']} delta", abs(s["delta"] - (s["now"] - s["was"])) < 1e-15)

    # ---- membership, recomputed from the digests -----------------------------------
    agg = Counter()
    for f in C["feeds"]:
        k = f["key"]
        g = next(x for x in P["feeds"] if x["key"] == k)
        w_was = {r["w"]: r for r in g["rows"]}
        w_now = {r["w"]: r for r in f["rows"]}
        k_was = {r["k"] for r in g["rows"]}
        k_now = {r["k"] for r in f["rows"]}
        left = set(w_was) - set(w_now)
        arrived = set(w_now) - set(w_was)
        m = D["membership"][k]
        eq(f"{k} was", len(g["rows"]), m["was"])
        eq(f"{k} now", len(f["rows"]), m["now"])
        eq(f"{k} left", len(left), m["left"])
        eq(f"{k} arrived", len(arrived), m["arrived"])
        eq(f"{k} survived", len(set(w_now) & set(w_was)), m["survived"])
        eq(f"{k} left narrow", len(k_was - k_now), m["left_narrow"])
        eq(f"{k} arrived narrow", len(k_now - k_was), m["arrived_narrow"])
        eq(f"{k} edits", sum(1 for d in left if w_was[d]["k"] in k_now), m["edits"])
        eq(f"{k} net", len(f["rows"]) - len(g["rows"]), m["net"])
        eq(f"{k} gross", len(left) + len(arrived), m["gross"])
        # Digests must actually identify: a collision would make every number above a floor.
        eq(f"{k} wide digests unique tonight", len(w_now), len(f["rows"]))
        for x in ("was", "now", "left", "arrived", "survived", "left_narrow",
                  "arrived_narrow", "edits", "gross", "net"):
            agg[x] += m[x]
    for x in agg:
        eq(f"all {x}", agg[x], D["membership"]["all"][x])
    eq("all survived + arrived = now", agg["survived"] + agg["arrived"], agg["now"])
    eq("all survived + left = was", agg["survived"] + agg["left"], agg["was"])

    # ---- the three-term split, recomputed -------------------------------------------
    for s in D["series"]:
        i = s["id"]
        if i == "R6":
            continue
        arr = dep = sur = 0
        for f in C["feeds"]:
            k = f["key"]
            g = next(x for x in P["feeds"] if x["key"] == k)
            cols = len(f["schema"])
            w_was = {r["w"]: r for r in g["rows"]}
            w_now = {r["w"]: r for r in f["rows"]}
            both = set(w_now) & set(w_was)
            arr += readings(k, [w_now[x] for x in set(w_now) - set(w_was)], cols)[i]
            dep += readings(k, [w_was[x] for x in set(w_was) - set(w_now)], cols)[i]
            sur += (readings(k, [w_now[x] for x in both], cols)[i]
                    - readings(k, [w_was[x] for x in both], cols)[i])
        eq(f"{i} arrived term", arr, s["arrived"])
        eq(f"{i} departed term", dep, s["left"])
        eq(f"{i} survivor term", sur, s["survivors"])
        eq(f"{i} residual", s["delta"] - (arr - dep + sur), s["residual"])
        # The class is a property of the reading, decided before the data — and the page's
        # claim is that the distributive ones and only they split exactly.
        if i in DISTRIBUTIVE:
            eq(f"{i} distributive splits exactly", s["residual"], 0)
            check(f"{i} admits", s["admits"] is True)
        else:
            check(f"{i} does not admit", s["admits"] is False)
    check("R3 is the silent refusal", [s for s in D["series"] if s["id"] == "R3"][0]["residual"] == 0)
    check("R5 is the loud one", [s for s in D["series"] if s["id"] == "R5"][0]["residual"] != 0)
    r6 = [s for s in D["series"] if s["id"] == "R6"][0]
    check("R6 naive residual is large", abs(r6["residual"]) > 100 * abs(r6["delta"]))
    check("R6 pair residual is zero", r6["pair"]["residual"] == 0)
    # And the pair really is (empty, declared) of each part.
    pe = r6["pair"]
    eq("R6 pair adds to tonight",
       pe["survivors_now"][0] + pe["arrived"][0], D["totals"]["now"]["R1"])
    eq("R6 pair adds to last night",
       pe["survivors_was"][0] + pe["left"][0], D["totals"]["prior"]["R1"])
    eq("R6 pair denominators tonight",
       pe["survivors_now"][1] + pe["arrived"][1], D["totals"]["now"]["slots"])

    # ---- the repair term, recomputed row by row --------------------------------------
    filled = emptied = changed = compared = 0
    for f in C["feeds"]:
        k = f["key"]
        g = next(x for x in P["feeds"] if x["key"] == k)
        w_was = {r["w"]: r for r in g["rows"]}
        w_now = {r["w"]: r for r in f["rows"]}
        for w in set(w_was) & set(w_now):
            compared += 1
            a, b = set(w_was[w]["miss"]), set(w_now[w]["miss"])
            if a != b:
                changed += 1
                filled += len(a - b)
                emptied += len(b - a)
    eq("records compared", compared, D["repair"]["records_compared"])
    eq("records changed", changed, D["repair"]["changed"])
    eq("cells filled", filled, D["repair"]["cells_filled"])
    eq("cells emptied", emptied, D["repair"]["cells_emptied"])
    eq("the repair term nets to zero", filled - emptied, 0)
    for s in D["series"]:
        if s["id"] != "R6":
            eq(f"{s['id']} survivor term is zero", s["survivors"], 0)

    # ---- the shape truth, which is what catches R3 -----------------------------------
    carried = lost = brought = fresh = 0
    for f in C["feeds"]:
        k = f["key"]
        g = next(x for x in P["feeds"] if x["key"] == k)
        w_was = {r["w"]: r for r in g["rows"]}
        w_now = {r["w"]: r for r in f["rows"]}
        sh = lambda rs: {tuple(sorted(r["miss"])) for r in rs if r["miss"]}
        left_sh = sh([w_was[x] for x in set(w_was) - set(w_now)])
        arr_sh = sh([w_now[x] for x in set(w_now) - set(w_was)])
        carried += len(left_sh)
        lost += len(left_sh - sh(f["rows"]))
        brought += len(arr_sh)
        fresh += len(arr_sh - sh(g["rows"]))
    eq("shapes carried by departures", carried, D["shapes"]["carried_by_departures"])
    eq("shapes lost from the record", lost, D["shapes"]["lost_from_record"])
    eq("shapes brought by arrivals", brought, D["shapes"]["brought_by_arrivals"])
    eq("shapes new to the record", fresh, D["shapes"]["new_to_record"])
    eq("the holistic terms refer to nothing", (lost, fresh), (0, 0))

    # ---- the condition session 7 printed ---------------------------------------------
    cond = D["condition"]
    pf = next(x for x in F["feeds"] if x["key"] == "papers")
    pc = next(x for x in C["feeds"] if x["key"] == "papers")
    pp = next(x for x in P["feeds"] if x["key"] == "papers")
    eq("first night papers", len(pf["rows"]), cond["n_first"])
    eq("tonight papers", len(pc["rows"]), cond["n_now"])
    eq("still short", len(pf["rows"]) - len(pc["rows"]), cond["still_short"])
    for night, rows in (("first", pf), ("prior", pp), ("now", pc)):
        eq(f"hosts {night}", dict(Counter(r["host"] for r in rows["rows"])), cond["hosts"][night])
    eq("the cohort that left", cond["hosts"]["first"]["arxiv"] - cond["hosts"]["prior"]["arxiv"],
       cond["arxiv_lost"])
    w_was = {r["w"] for r in pp["rows"]}
    eq("cohort arrivals tonight",
       sum(1 for r in pc["rows"] if r["host"] == "arxiv" and r["w"] not in w_was),
       cond["arxiv_arrivals_tonight"])
    check("the condition did not fire", cond["verdict"] == "did not fire")
    check("the cohort did not come back",
          cond["hosts"]["now"]["arxiv"] == cond["hosts"]["prior"]["arxiv"])

    # ---- the declared counts, and what the register says it turned away ---------------
    for f in C["feeds"]:
        d = next(x for x in D["feeds"] if x["key"] == f["key"])
        eq(f"{f['key']} declares what it holds", f["declared_count"], f["n"])
        eq(f"{f['key']} n in data", d["n"], f["n"])
        eq(f"{f['key']} columns", d["columns"], len(f["schema"]))
    eq("register still holds one rejection", C["turned_away"]["rejected_count"], 1)
    eq("and it is the old one", C["turned_away"]["rejected_dates"], ["2026-07-30"])
    eq("register count agrees with the index", C["turned_away"]["count"], pc["n"])

    # ---- no content was committed -----------------------------------------------------
    allowed = {"k", "w", "miss", "host"}
    for f in C["feeds"]:
        bad = {key for r in f["rows"] for key in r} - allowed
        eq(f"{f['key']} rows carry nothing but emptiness and identity", bad, set())
        for r in f["rows"][:50]:
            check(f"{f['key']} digest is a digest", bool(re.fullmatch(r"[0-9a-f]{16}", r["k"])))

    # ---- the page serves what it states -------------------------------------------------
    served(grouped(D["repair"]["records_compared"]), "records compared")
    served(grouped(D["membership"]["papers"]["left"]), "records that left")
    served(grouped(D["membership"]["papers"]["arrived"]), "records that arrived")
    served(grouped(D["membership"]["papers"]["gross"]), "gross movement")
    served(grouped(cond["n_now"]), "papers tonight")
    served(grouped(cond["n_first"]), "papers on the first night")
    served(grouped(cond["still_short"]), "still short")
    for s in D["series"]:
        if s["kind"] == "rate":
            continue
        served(grouped(s["now"]), f"{s['id']} tonight")
        served(grouped(s["was"]), f"{s['id']} last night")
        served(grouped(s["first"]), f"{s['id']} on the first night")
        served(grouped(s["arrived"]), f"{s['id']} arrival term")
        served(grouped(s["left"]), f"{s['id']} departure term")
        check(f"served: {s['id']} class ({s['klass']})", s["klass"] in text)
    for f in D["feeds"]:
        served(f["url"], f"address of {f['key']}")
        served(f["sha256"][:12], f"sha of {f['key']}")
    served(D["outside"]["title"], "the paper's title")
    served("Jim Gray", "the paper's first author")
    served("1997", "the paper's year")
    served("cs/0701155", "where the paper was read")
    check("the page prints the condition it settles", "transient pipeline state" in text)
    check("the page prints a refutation condition of its own",
          "Refutation conditions for tonight" in text)
    check("the page says what it narrows", "Narrowed" in text)
    check("no network in the served page",
          not re.search(r"(?<!//)\b(fetch|XMLHttpRequest|import\s*\()", html))
    check("no remote asset", not re.search(r'(src|href)="https?://', html))
    check("the still frame needs no script",
          "<noscript" not in html and html.count("<script") == 2)

    print(f"{N} checks, {len(FAIL)} failed")
    for f in FAIL[:25]:
        print("  FAIL", f)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
