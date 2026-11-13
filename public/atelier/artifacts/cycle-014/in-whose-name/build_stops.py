"""In Whose Name, state 2 — how long a stop lasts.

Reads the Field's study 72 (results72.json, hash asserted), takes its fourteen acts that
stopped something, and gives each a lifetime: the day of the stop, the day its afterwards
began (lifted, gone around, superseded), or, for a stop that stands, its age on the day the
Field read it (13 November 2026), which is a lower bound and not a lifetime. Every date of
an end is taken from the Field's record (an act's own date, or the quoted afterwards source)
and named below with the passage it rests on. Writes stops.js (read by the page) and
stops.json (the counts the page states).

Run: python3 build_stops.py results72.json
"""
import datetime as dt
import hashlib
import json
import os
import sys
from collections import Counter

SHA72 = "a94d5700bbbf1562c46ff1cae4c1ad40a673796bdc36623fd1aa94e6dd874239"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA72, "not the file this was built on"
F = json.loads(raw)
A = {a["id"]: a for a in F["acts"]}
READ_ON = dt.date(2026, 11, 13)
assert F["date"] == "2026-11-13"


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

stops = [a for a in F["acts"] if a["effect"] == "stopped"]
assert len(stops) == F["counts"]["stopped_all"] == 14

rows = []
for a in stops:
    st = a["after"]["state"]
    start = STARTS.get(a["id"], (a["date"], None))[0]
    assert len(start) == 10, (a["id"], start)
    r = dict(id=a["id"], point=a["point"], body=a["body"], party=a["party"], what=a["what"],
             country=a["country"], form=a["form"], grounds=a["grounds"], named=a["named"],
             start=start, state=st, note=a["after"]["note"], firsthand=a["after"]["firsthand"])
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
            # Withdrawn some time in 2024: the end lies between the day of the stop and the year's last day.
            r["days"] = None
            r["days_max"] = (dt.date(2024, 12, 31) - day(start)).days
        else:
            r["end"] = end
            r["days"] = (day(end) - day(start)).days
            assert r["days"] > 0
        if terms:
            q = quote(terms)
            r["terms"] = dict(text=q["text"], url=q["url"], source=q["source"])
    rows.append(r)

# The record's own counts.
after = Counter(r["state"] for r in rows)
assert after == Counter(F["counts"]["stopped_after"]), (after, F["counts"]["stopped_after"])
assert after == Counter(stands=4, lifted=6, **{"gone around": 3}, superseded=1)

# Every stop that was lifted was lifted on terms: the record names what came back.
lifted = [r for r in rows if r["state"] == "lifted"]
assert sorted(r["id"] for r in lifted) == ["c2", "c3", "m1", "m5", "m7", "s9"]
assert all("terms" in r or r["id"] == "m7" for r in lifted)
assert "secara bersyarat" in A["m7"]["after"]["quote"]["text"]   # "conditionally"
assert "on conditions" in A["m7"]["after"]["note"]
# The stops that stand: what each one addresses.
standing = {r["id"]: r for r in rows if r["state"] == "stands"}
assert sorted(standing) == ["m3", "m4", "s2", "s4"]
assert standing["s4"]["form"] == "rule"
assert "void" in A["s2"]["after"]["quote"]["text"]
assert "undertaking" in A["m4"]["after"]["quote"]["text"]
assert A["m3"]["after"]["note"].startswith("No revocation found")

ended = [r for r in rows if r["state"] != "stands" and r["days"] is not None]
longest_end = max(ended, key=lambda r: r["days"])
assert longest_end["id"] == "c2"
outlived = sorted(r["id"] for r in standing.values() if r["days"] > longest_end["days"])
assert outlived == ["m4", "s4"], outlived
short = sorted(ended, key=lambda r: r["days"])
assert [r["id"] for r in short[:3]] == ["m7", "m1", "s1"]
assert [r["days"] for r in short[:3]] == [21, 29, 42]
# Within the first year: of the stops on record a full year (all but s2), how many had ended.
year = [r for r in rows if not (r["state"] == "stands" and r["days"] < 365)]
assert len(year) == 13
ended_in_year = [r for r in year if r["state"] != "stands" and (r["days"] if r["days"] is not None else r["days_max"]) < 365]
assert sorted(r["id"] for r in ended_in_year) == ["c3", "m1", "m5", "m7", "p1", "s1", "s6"], [r["id"] for r in ended_in_year]

counts = dict(
    built="2026-11-13", source=dict(study=72, sha256=SHA72, read_on=str(READ_ON)),
    stops=len(rows), afterwards=dict(after),
    lifted_on_terms=len(lifted), gone_around=after["gone around"], superseded=after["superseded"],
    standing=sorted(standing), standing_days={k: v["days"] for k, v in standing.items()},
    longest_ended=dict(id=longest_end["id"], days=longest_end["days"]),
    standing_older_than_longest_ended=outlived,
    shortest=[(r["id"], r["days"]) for r in short[:3]],
    on_record_a_year=len(year), ended_within_a_year=len(ended_in_year),
    note="The Field's fourteen stops, a found set. A stop that stands has an age, not a lifetime: its end, if any, is not yet written.",
)
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "stops.js"), "w", encoding="utf-8") as fh:
    fh.write("// Written by build_stops.py from the Field's study 72. Do not edit here.\n")
    fh.write("window.IWN_STOPS = " + json.dumps(dict(read_on=str(READ_ON), rows=rows, counts=counts), ensure_ascii=False, indent=1) + ";\n")
with open(os.path.join(here, "stops.json"), "w", encoding="utf-8") as fh:
    json.dump(counts, fh, ensure_ascii=False, indent=1)
print("ok", json.dumps(counts, ensure_ascii=False))
