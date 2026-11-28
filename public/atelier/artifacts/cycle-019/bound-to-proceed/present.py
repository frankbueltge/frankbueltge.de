#!/usr/bin/env python3
"""Bound to Proceed, state 4 (2026-11-28): the presentation. Lays the two cases of step 6 over the log.

Reads, at a pinned commit, the Field's check 96 (field-research 828e88a, artifacts/cycle-019/on-receipt/):
duties96.json (Part C: every duty the two cases could set off, coded by the Field's conductor), results96.json
(its counts), agree96.json (Part D: a blind reader of this work's eight reasons) and codes96.json (the cells
of study 94 its blind recoding moved). Places every duty in this work's log: a duty of the one who must pass
the word on stands at the receiver's door (the row's name, where the word comes in); a duty of the one the
word reaches stands in the cell of the log that rules it. Writes data/present.json and data/present.js, and
asserts every count against the Field's own results.

Usage: python3 present.py <path to field-research clone>
"""
import json, os, subprocess, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
FIELD96 = "828e88a6e9a3f037ba2b18ea55e0a072086448cc"
BASE = "artifacts/cycle-019/on-receipt/"

# Whose duty each of the Field's signals is, read from its codebook 96, Part C: "the maker's reports as
# sender (EU4, COP3, CA4, CA5, NY4, NY5, PC3 ...) and the receivers' duties (COP5's assessment and pass-on,
# CA4's review by the office, CA4/CA6's yearly publication, CA8's internal channel, NY4's review)".
# Where it stands in this work's log: a door (row) or a cell (row, column). Columns as in build.py.
PLACE = {
    "EU4":           {"whose": "sender",   "doors": ["EU4"],  "cells": []},
    "COP 9.3":       {"whose": "sender",   "doors": ["COP3"], "cells": [["COP5", "pass"]]},
    "COP 9.2":       {"whose": "receiver", "doors": [],       "cells": [["COP5", "look"]]},
    "CA4":           {"whose": "sender",   "doors": ["CA4"],  "cells": []},
    "CA5":           {"whose": "sender",   "doors": ["CA5"],  "cells": []},
    "CA4 review":    {"whose": "receiver", "doors": [],       "cells": [["CA4", "look"]]},
    "CA8":           {"whose": "receiver", "doors": [],       "cells": [["CA8", "say"]]},
    "PC3":           {"whose": "sender",   "doors": ["PC3"],  "cells": []},
    "NY4, NY5":      {"whose": "both",     "doors": ["NY4", "NY5"], "cells": [["NY4", "look"]]},
    "yearly totals": {"whose": "receiver", "doors": [],       "cells": [["CA4", "public"], ["CA6", "public"], ["NY4", "public"], ["NY6", "public"]]},
}
WHOSE = {"sender": "the one who must pass the word on", "receiver": "the one the word reaches",
         "both": "both: the developer's reports and the office's review"}
FATE = {"met": "met", "done, set-off or time unknown": "done", "declared not set off": "declared",
        "missed": "missed", "not due": "notdue", "unknowable": "unknowable"}
FATE_TXT = {"met": "met on record", "done": "done; set off, or in time, unknown", "declared": "declared not set off",
            "missed": "missed", "notdue": "not due", "unknowable": "the record cannot say"}


def show(repo, path):
    return json.loads(subprocess.run(["git", "-C", repo, "show", f"{FIELD96}:{BASE}{path}"], check=True,
                                     capture_output=True, text=True).stdout)


def main(field):
    duties = show(field, "duties96.json")["cells"]
    res = show(field, "results96.json")["k"]
    agree = show(field, "agree96.json")["D"]
    codes = show(field, "codes96.json")
    log = json.load(open(os.path.join(HERE, "data", "log.json"), encoding="utf-8"))
    rows = {r["id"]: r for r in log["rows"]}

    out_cells = []
    for i, d in enumerate(duties):
        p = PLACE[d["signal"]]
        for rid in p["doors"]:
            assert rid in rows, rid
        for rid, col in p["cells"]:
            # a receiver's duty stands only where the log rules one (a filled cell)
            assert rows[rid]["cells"][col]["v"] in ("duty", "power"), (rid, col, rows[rid]["cells"][col]["v"])
        out_cells.append({"n": i, "case": d["case"], "signal": d["signal"], "duty": d["duty"], "whose": p["whose"],
                          "fate": FATE[d["code"]], "field_code": d["code"], "reason": d["reason"],
                          "passages": d["passages"], "doors": p["doors"], "cells": p["cells"]})

    fates = Counter(c["fate"] for c in out_cells)
    by_whose = {w: dict(Counter(c["fate"] for c in out_cells if c["whose"] == w)) for w in WHOSE}
    n_whose = {w: sum(1 for c in out_cells if c["whose"] == w) for w in WHOSE}
    # the one duty owed back to a sender: the internal channel's monthly update to the employee who reported
    back = [c for c in out_cells if c["signal"] == "CA8"]
    acts_done = [c for c in out_cells if c["fate"] == "done"]
    declared = [c for c in out_cells if c["fate"] == "declared"]

    k = {
        "cells": len(out_cells), "met": fates["met"], "done": fates["done"], "declared": fates["declared"],
        "missed": fates["missed"], "notdue": fates["notdue"], "unknowable": fates["unknowable"],
        "sender": n_whose["sender"], "receiver": n_whose["receiver"], "both": n_whose["both"],
        "receiver_unknowable": by_whose["receiver"].get("unknowable", 0),
        "receiver_done": by_whose["receiver"].get("done", 0),
        "receiver_declared": by_whose["receiver"].get("declared", 0),
        "receiver_notdue": by_whose["receiver"].get("notdue", 0),
        "back_unknowable": sum(1 for c in back if c["fate"] == "unknowable"), "back_cases": len(back),
        "done_maker": sum(1 for c in acts_done if c["signal"] in ("EU4", "COP 9.3", "COP 9.2")),
        "declared_escape": sum(1 for c in declared if c["case"] == "escape"),
        # a public body's duty on receipt: the office's review, the offices' yearly totals, New York's review
        "public_receiver": sum(1 for c in out_cells if c["signal"] in ("CA4 review", "yearly totals", "NY4, NY5")),
        "public_receiver_done": sum(1 for c in out_cells if c["signal"] in ("CA4 review", "yearly totals", "NY4, NY5") and c["fate"] in ("met", "done")),
        "spots": len({("door", r) for c in out_cells for r in c["doors"]} | {("cell", a, b) for c in out_cells for a, b in c["cells"]}),
        # the Field's check 96 of study 95 (Part B), as its results state them
        "acts96": res["acts"], "acts95": res["B.first"] if "B.first" in res else None, "doors96": res["doors"],
        "force_bodies": res["force.bodies"], "compels": res["compels"], "compels_under_ai": res["compels.under_ai"],
        "pressure": res["pressure"],
        # Part D: a blind reader of this work's eight reasons
        "d_same": agree["same"], "d_of": agree["reasons"],
    }
    # every count against the Field's own results of check 96
    assert (k["cells"], k["met"], k["done"], k["declared"], k["notdue"], k["unknowable"], k["missed"]) == (
        res["C.cells"], res["C.met"], res["C.done"], res["C.declared"], res["C.notdue"], res["C.unknowable"], res["C.missed"]), k
    assert k["sender"] + k["receiver"] + k["both"] == k["cells"]
    assert (k["d_same"], k["d_of"]) == (res["D.same"], res["D.of"]), k
    assert k["compels_under_ai"] == 0 and k["compels"] == 3 and k["force_bodies"] == 13, k
    assert k["back_cases"] == 2 and k["back_unknowable"] == 2, k
    assert k["met"] == 0

    d_rows = [{"item": r["item"], "passage": r["passage"], "atelier": r["atelier"], "blind": r["blind"], "same": r["same"]}
              for r in agree["rows"]]
    moved = [x for x in codes["decisions"] if x["moves"]]
    assert [(x["signal"], x["code"], x["first"], x["final"]) for x in moved] == [("PC3", "pass_on", "duty", "none")], moved

    out = {"what": "Bound to Proceed, state 4 (2026-11-28): the two cases of step 6 laid over the log, from the Field's check 96.",
           "pin": f"field-research@{FIELD96[:7]}/{BASE}",
           "pin_url": f"https://github.com/frankbueltge/field-research/tree/{FIELD96}/{BASE.rstrip('/')}",
           "whose": WHOSE, "fate_txt": FATE_TXT, "cells": out_cells, "counts": k, "by_whose": by_whose,
           "reasons_blind": d_rows, "moved": moved}
    s = json.dumps(out, ensure_ascii=False, indent=1)
    open(os.path.join(HERE, "data", "present.json"), "w", encoding="utf-8").write(s + "\n")
    open(os.path.join(HERE, "data", "present.js"), "w", encoding="utf-8").write("window.PRESENT = " + s + ";\n")
    print(json.dumps(k))
    print(json.dumps(by_whose))


if __name__ == "__main__":
    main(sys.argv[1])
