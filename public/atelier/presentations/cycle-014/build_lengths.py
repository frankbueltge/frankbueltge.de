"""In Whose Name, state 4 (the presentation) — what an act says of its own length.

Reads the Field's study 74 (results74.json, hash asserted). The Field answered this practice's
question of 2026-11-14 (ho-2026-11-14-atelier-1): do acts away from the model point state their
own length, and does it predict the afterwards? Its answer: a stated length predicts that a hold
ends (6 of 6 that came due); its absence does not predict that it lasts (5 of 9 ended).

This work takes the Field's eighteen holds (stops and delays) with their coded length and their
afterwards, unchanged, and splits the one word "ended" into the three fates the Field's own
afterwards codes already hold: let go by the body that made it (lifted, on terms), gone around
by the party (a change of form), outgrown by a wider act (superseded). The split is this
reader's grouping of the Field's codes, not a recoding.

It also carries one correction of this work's state 3: the Field codes Ireland's act (m4) as
stating no length. The act of 8 August 2024 is an agreement to suspend; the permanence was the
party's later agreement (4 September 2024), which state 3 had read into the act.

Run: python3 build_lengths.py results74.json
"""
import datetime as dt
import hashlib
import json
import os
import sys
from collections import Counter

SHA74 = "4d03f8d484b8ae9c8892d8ac258add268ed612c2c8e7ed2f709bc6b0e94112d3"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA74, "not the file this was built on"
F = json.loads(raw)
assert F["study"] == 74 and F["date"] == "2026-11-15"
AT = F["atelier"]
A = {a["id"]: a for a in F["acts"]}

SHORT = {
    "s5": "Singapore, a pause on new data centres", "m1": "Italy, ChatGPT", "s6": "Chile, the environmental court",
    "m5": "Brazil, training at Meta", "m7": "Indonesia, Grok", "s8": "Worcester County, a moratorium",
    "m3": "Italy, DeepSeek", "s3": "The Netherlands, a nine-month pause", "s7": "Manatee County, a moratorium",
    "c1": "US export rule of 2022", "c2": "US export rule of 2023", "s4": "The Netherlands, a rule",
    "m4": "Ireland, training Grok", "s9": "South Dublin, Google's third building",
    "p1": "FERC, a nuclear plant's load", "c3": "Nvidia's licence for the H20", "s1": "Tucson, the city council",
    "s2": "Virginia, the appeals court",
}
# The Field's afterwards code -> the fate this work reads in it.
FATE = {"lifted": "let go", "gone around": "gone around", "superseded": "outgrown",
        "loosened in part": "loosened in part", "stands": "stands"}
LANE = {"condition": "stated", "fixed": "stated", "definitive": "definitive", "none": "none"}

rows = []
for r in AT["rows"]:
    a = A[r["id"]]
    assert a["length"]["kind"] == r["length"], r["id"]
    fate = "running" if r["running"] else FATE[r["after"]]
    rows.append(dict(
        id=r["id"], short=SHORT[r["id"]], point=r["point"], effect=r["effect"], body=r["body"], date=r["date"],
        lane=LANE[r["length"]], length=r["length"], basis=a["length"]["basis"], after=r["after"], fate=fate,
        ended=fate in ("let go", "gone around", "outgrown"), after_note=a["after"].get("note"),
    ))
assert len(rows) == 18 and sorted(SHORT) == sorted(r["id"] for r in rows)

lane = lambda k: [r for r in rows if r["lane"] == k]
stated, none, definitive = lane("stated"), lane("none"), lane("definitive")
# The Field's counts, recomputed from its rows.
assert len(stated) == AT["stated_holds"] == 8
due = [r for r in stated if r["fate"] != "running"]
assert len(due) == AT["stated_holds_due"] == 6 and all(r["ended"] for r in due)
assert len(none) == AT["unstated_holds"] == 9
assert sorted(r["id"] for r in none if r["ended"]) == sorted(AT["unstated_holds_ended_ids"]) and AT["unstated_holds_ended"] == 5
assert sorted(r["id"] for r in rows if r["fate"] == "outgrown") == sorted(AT["hardened"])
assert AT["none_other"]["n"] == 14 and AT["none_other"]["of"] == 20 and AT["none_model"]["n"] == 2 and AT["none_model"]["of"] == 8
assert "m4" in AT["none_model"]["ids"]

# This work's split of "ended".
split_due = Counter(r["fate"] for r in due)
split_none = Counter(r["fate"] for r in none)
assert split_due == Counter({"let go": 4, "gone around": 1, "outgrown": 1})
assert split_none == Counter({"let go": 2, "gone around": 2, "outgrown": 1, "loosened in part": 1, "stands": 3})
whole = sorted(r["id"] for r in rows if r["fate"] == "stands")
assert whole == ["m3", "m4", "s2", "s4"]
assert all(r["lane"] in ("none", "definitive") for r in rows if r["fate"] == "stands")

# The correction: Ireland's act and its later permanence.
m4 = A["m4"]
assert m4["date"] == "2024-08-08" and m4["length"]["kind"] == "none"
m4_gap = (dt.date(2024, 9, 4) - dt.date(2024, 8, 8)).days
assert m4_gap == 27

counts = dict(
    built="2026-11-15", source=dict(study=74, sha256=SHA74, read_on="2026-11-15"),
    holds=len(rows), stated=len(stated), stated_due=len(due), stated_due_ended=sum(r["ended"] for r in due),
    stated_running=[r["id"] for r in stated if r["fate"] == "running"], definitive=[r["id"] for r in definitive],
    none=len(none), none_ended=sum(r["ended"] for r in none),
    split_stated_due=dict(split_due), split_none=dict(split_none),
    standing_whole=whole, outgrown=sorted(AT["hardened"]),
    away_from_model_none=[AT["none_other"]["n"], AT["none_other"]["of"]], model_none=[AT["none_model"]["n"], AT["none_model"]["of"]],
    m4_permanent_after_days=m4_gap,
    note="The Field's eighteen holds (study 74), a found set, with the Field's length and afterwards codes. "
         "'Let go', 'gone around' and 'outgrown' are this reader's names for the Field's codes lifted, gone around and superseded.",
)
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "lengths.js"), "w", encoding="utf-8") as fh:
    fh.write("// Written by build_lengths.py from the Field's study 74. Do not edit here.\n")
    fh.write("window.IWN_LENGTHS = " + json.dumps(dict(rows=rows, counts=counts, answer=AT["answer"]), ensure_ascii=False, indent=1) + ";\n")
with open(os.path.join(here, "lengths.json"), "w", encoding="utf-8") as fh:
    json.dump(counts, fh, ensure_ascii=False, indent=1)
print("ok", json.dumps(counts, ensure_ascii=False))
