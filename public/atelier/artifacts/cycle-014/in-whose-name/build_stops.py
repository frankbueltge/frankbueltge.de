"""In Whose Name, state 3 (the check) — how long a stop lasts.

Reads the Field's study 73 (results73.json, hash asserted): the same 28 acts as study 72,
coded a second time blind, with corrections. Three acts first coded as stops (m1, m5, m7)
call themselves provisional, "until further decision" or temporary, and the Field recoded
them as delays on 2026-11-14; they are kept here, drawn apart and marked corrected, because
the first reading of this work counted them as stops. That leaves eleven stops.

Each stop gets a lifetime: the day of the stop, the day its afterwards began, or, for a
stop that stands, its age on the day read (14 November 2026), a lower bound and not a
lifetime. Every end date is taken from the Field's record and named below with the passage
it rests on.

One reading here differs from the Field's, declared: the export rule of 2023 (c2) the Field
codes "lifted"; its own afterwards passage says licences for one class of chip are now
reviewed case by case, so this work codes it "loosened in part" and counts it as standing
for every chip outside that class (the critique of state 2, point 3a).

Each row also carries its public (this reader's heading, as on the gates above) and, where
the act states it, the act's own word for how long it means to last, with the passage.

Run: python3 build_stops.py results73.json
"""
import datetime as dt
import hashlib
import json
import os
import sys
from collections import Counter

SHA73 = "3ce78788734634857fc46c447e3a126875acc0a56adcd1e71dee0352a63e3022"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA73, "not the file this was built on"
F = json.loads(raw)
A = {a["id"]: a for a in F["acts"]}
READ_ON = dt.date(2026, 11, 14)
assert F["date"] == "2026-11-14" and F["study"] == 73


def quote(qid):
    """A passage of the Field's record, by id, wherever it stands in the file."""
    for a in F["acts"]:
        for q in a["quotes"]:
            if q["id"] == qid:
                return q
        aq = (a.get("after") or {}).get("quote")
        if aq and aq["id"] == qid:
            return aq
    raise KeyError(qid)


def day(s):
    return dt.date.fromisoformat(s)


# The end of each stop that ended. (date, approximate?, how the date is known, the passage
# that shows what came back, or None.) An approximate date is a month in the record; the
# fifteenth stands for it, and the page says "about".
ENDS = {
    "c1": ("2023-10-25", False, "the rule of October 2023, which widened and replaced it (act c2)", "c2a"),
    "c2": ("2026-01-13", False, "the release of 13 January 2026 (act c5)", "c5b"),
    "c3": ("2025-08-15", True, "licences granted in August 2025 (act c4; the month only)", "c4b"),
    "s1": ("2025-09-17", False, "the county's memorandum of 17 September 2025", None),
    "s6": (None, True, "second-hand: the developer withdrew the annulled approval in 2024 (no day read)", None),
    "p1": ("2025-06-11", False, "the plant owner's release of 11 June 2025", None),
    "m1": ("2023-04-28", False, "the authority's release of 28 April 2023 (act m2's terms of 11 April met)", "m2b"),
    "m5": ("2024-08-28", False, "the vote signed 28 August 2024 (act m6)", "m6b"),
    "s9": ("2026-09-23", False, "the planning body's order on appeal of 23 September 2026 (act s10)", "s10b"),
    "m7": ("2026-01-31", False, "the ministry's statement of 31 January 2026", None),
}
# The start of a stop the record dates by month only.
STARTS = {"c3": ("2025-04-09", "the addressee's report of 9 April 2025 (this practice's own reading, gate h20)")}

# This reader's heading for the public each act spoke for (as on the gates above).
PUBLIC = {
    "c1": "a nation, at its border", "c2": "a nation, at its border", "c3": "a nation, at its border",
    "s1": "a city's residents", "s2": "a county's residents, through a court", "s4": "a country's land",
    "s6": "residents and their climate, through a court", "p1": "the customers of a grid",
    "s9": "a county's residents", "m1": "the persons whose data it is", "m3": "the persons whose data it is",
    "m4": "the persons whose data it is", "m5": "the persons whose data it is",
    "m7": "the people its images reach",
}
# The act's own word for how long it means to last, where its text states one (passage id).
WORD = {
    "m1": ("provisional", "m1a", "provvisoria"),
    "m5": ("until further decision", "m5a", "ULTERIOR DECIS"),
    "m7": ("temporary", "m7a", "sementara"),
    "m3": ("definitive, pending the inquiry", "m3a", "definitiva"),
    "m4": ("the party's agreement to keep to it, on a permanent basis", "m4c", "continue to adhere"),
}
RECODED = ["m1", "m5", "m7"]          # stops in study 72, delays in study 73
corr = {c["id"] for c in F["corrections"] if c["field"] == "effect" and c["from"] == "stopped" and c["to"] == "delayed"}
assert sorted(corr) == RECODED
LOOSENED = {"c2": "c5a"}               # this practice's reading; the Field codes c2 "lifted"
assert "case-by-case" in quote("c5a")["text"]

stops = [a for a in F["acts"] if a["effect"] == "stopped"]
assert len(stops) == F["counts"]["stopped"] == 11
rows = []
for a in stops + [A[i] for i in RECODED]:
    st = a["after"]["state"]
    if a["id"] in LOOSENED:
        assert st == "lifted"
        st = "loosened in part"
    kind = "delay" if a["id"] in RECODED else "stop"
    assert (kind == "delay") == (a["effect"] == "delayed")
    start = STARTS.get(a["id"], (a["date"], None))[0]
    assert len(start) == 10, (a["id"], start)
    r = dict(id=a["id"], kind=kind, point=a["point"], body=a["body"], party=a["party"], what=a["what"],
             country=a["country"], form=a["form"], grounds=a["grounds"], named=a["named"],
             public=PUBLIC[a["id"]], start=start, state=st, note=a["after"]["note"], firsthand=a["after"]["firsthand"])
    if a["id"] in WORD:
        w, qid, frag = WORD[a["id"]]
        q = quote(qid)
        assert frag in q["text"], (a["id"], frag)
        r["word"] = dict(says=w, text=q["text"], url=q["url"], source=q["source"])
    aq = a["after"].get("quote")
    if aq:
        r["after_quote"] = dict(text=aq["text"], url=aq["url"], source=aq["source"])
    r["act_quote"] = dict(text=a["quotes"][0]["text"], url=a["quotes"][0]["url"], source=a["quotes"][0]["source"]) if a["quotes"] else None
    if st == "stands":
        assert a["id"] not in ENDS
        r["days"] = (READ_ON - day(start)).days
        r["open"] = True
    else:
        end, approx, how, terms = ENDS[a["id"]]
        r["end_how"] = how
        r["approx"] = approx
        if end is None:
            r["days"] = None
            r["days_max"] = (dt.date(2024, 12, 31) - day(start)).days
        else:
            r["end"] = end
            r["days"] = (day(end) - day(start)).days
            assert r["days"] > 0
        if st == "loosened in part":
            r["age"] = (READ_ON - day(start)).days
        if terms:
            q = quote(terms)
            r["terms"] = dict(text=q["text"], url=q["url"], source=q["source"])
    rows.append(r)

S = [r for r in rows if r["kind"] == "stop"]
D = [r for r in rows if r["kind"] == "delay"]
after = Counter(r["state"] for r in S)
field_after = Counter(F["counts"]["stopped_after"])
# The Field's afterwards, with this practice's one declared difference (c2).
assert after == field_after - Counter(lifted=1) + Counter({"loosened in part": 1}), (after, field_after)
assert after == Counter(stands=4, lifted=2, **{"gone around": 3, "loosened in part": 1}, superseded=1)

# The two stops lifted outright were lifted on terms: a licence and a permission granted on conditions.
lifted = [r for r in S if r["state"] == "lifted"]
assert sorted(r["id"] for r in lifted) == ["c3", "s9"]
assert all("terms" in r for r in lifted)
assert "on conditions" in A["s9"]["after"]["note"]
# The three recoded as delays ended in a condition too, each within two months.
assert all(r["state"] == "lifted" and r["days"] < 61 for r in D), [(r["id"], r["days"]) for r in D]
assert sorted(r["days"] for r in D) == [21, 29, 57]
# At the model point, each act said how long it meant to last, and each lasted as it said, so far.
model = [r for r in rows if r["point"] == "model"]
assert sorted(r["id"] for r in model) == ["m1", "m3", "m4", "m5", "m7"]
assert all("word" in r for r in model)
assert [r["state"] for r in model if r["kind"] == "delay"] == ["lifted"] * 3
assert all(r["state"] == "stands" for r in model if r["kind"] == "stop")
# What stands.
standing = {r["id"]: r for r in S if r["state"] == "stands"}
assert sorted(standing) == ["m3", "m4", "s2", "s4"]
assert standing["s4"]["form"] == "rule"
assert "void" in A["s2"]["after"]["quote"]["text"]
assert "between 7 May 2024 and 1 August 2024" in A["m4"]["quotes"][0]["text"]   # the undertaking's reach
assert A["m3"]["after"]["note"].startswith("No revocation found")
assert "m3" in F["stands"]["second_found_no_later_record"]

ended = [r for r in S if r["state"] not in ("stands", "loosened in part") and r["days"] is not None]
longest_end = max(ended, key=lambda r: r["days"])
assert longest_end["id"] == "s9" and longest_end["days"] == 762
outlived = sorted(r["id"] for r in standing.values() if r["days"] > longest_end["days"])
assert outlived == ["m4", "s4"], outlived
younger = sorted(r["id"] for r in standing.values() if r["days"] <= longest_end["days"])
assert younger == ["m3", "s2"]
year = [r for r in S if not (r["state"] == "stands" and r["days"] < 365)]
assert len(year) == 10
ended_in_year = [r for r in year if r["state"] not in ("stands", "loosened in part")
                 and (r["days"] if r["days"] is not None else r["days_max"]) < 365]
assert sorted(r["id"] for r in ended_in_year) == ["c3", "p1", "s1", "s6"], [r["id"] for r in ended_in_year]

counts = dict(
    built="2026-11-14", source=dict(study=73, sha256=SHA73, read_on=str(READ_ON)),
    stops=len(S), recoded_as_delays=RECODED, afterwards=dict(after),
    lifted_on_terms=len(lifted), loosened_in_part=["c2"], gone_around=after["gone around"], superseded=after["superseded"],
    delays_ended_days={r["id"]: r["days"] for r in D},
    standing=sorted(standing), standing_days={k: v["days"] for k, v in standing.items()},
    longest_ended=dict(id=longest_end["id"], days=longest_end["days"]),
    standing_older_than_longest_ended=outlived,
    on_record_a_year=len(year), ended_within_a_year=len(ended_in_year),
    model_point_own_word={r["id"]: r["word"]["says"] for r in model},
    note="The Field's eleven stops after its check (study 73), a found set, and the three it recoded as delays. "
         "c2 is coded 'loosened in part' by this practice, 'lifted' by the Field. A stop that stands has an age, not a lifetime.",
)
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "stops.js"), "w", encoding="utf-8") as fh:
    fh.write("// Written by build_stops.py from the Field's study 73. Do not edit here.\n")
    fh.write("window.IWN_STOPS = " + json.dumps(dict(read_on=str(READ_ON), rows=rows, counts=counts), ensure_ascii=False, indent=1) + ";\n")
with open(os.path.join(here, "stops.json"), "w", encoding="utf-8") as fh:
    json.dump(counts, fh, ensure_ascii=False, indent=1)
print("ok", json.dumps(counts, ensure_ascii=False))
