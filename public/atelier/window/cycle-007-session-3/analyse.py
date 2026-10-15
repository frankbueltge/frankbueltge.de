"""Cycle 007, session 3 — The Chronicler's Column.

Joins the Studio's dated close calls (studio main ab6b43b, works/2026-10-11-long-after/data.json,
passed as argv[1]; not committed, sha256 checked) with two readings of each first near-account
(reader1.json, reader2.json) and writes results.json. Run: python3 -I analyse.py <data.json>
"""
import hashlib, json, statistics, sys

SHA = "5bc292319221e9c320f596b441d35eeb7b69b5b8f4a1e88f0f1d637f5af01f21"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA, "Studio data.json is not the pinned version"
studio = json.loads(raw)
r1 = {x["event"]: x for x in json.load(open("reader1.json"))}
r2 = {x["event"]: x for x in json.load(open("reader2.json"))}

# Post hoc (declared in README, not in PREDICTIONS.md): the later event each N clause names.
N_LATER = {
    "E04": "the record's state in 1986 ('we don't know')", "E05": "release of testimony, 1994",
    "E12": "oral-history conference, 1992", "E17": "two officers' later testimony",
    "E24": "a 1995 newspaper article", "E32": "newspaper front pages", "E36b": "documents surfaced, 2005",
    "E37": "a newspaper report", "E46": "publication of a memoir, 1998", "E47": "a defector's later telling",
}
N_KIND = {k: "record" for k in N_LATER}  # every N clause names an act of the record; none a later event in the world

rows = []
for e in studio["events"]:
    if not e.get("ok"):
        continue
    k = e["event"]
    lag = e["lag_days"] / 365.25
    rows.append(dict(
        event=k, label=e["label"], when=e["when"], y_hap=e["y_hap"], y_nm=e["y_nm"], lag_years=round(lag, 2),
        sentence=e["nm"]["quote"], source=e["nm"]["source"], url=e["nm"].get("url"), nm_date=e["nm"]["date"],
        sagan="Sagan" in e["nm"]["source"], c1=r1[k]["code"], c2=r2[k]["code"],
        why1=r1[k]["reason"], why2=r2[k]["reason"], n_later=N_LATER.get(k) if "N" in (r1[k]["code"], r2[k]["code"]) else None,
    ))
assert len(rows) == 34

def tally(key):
    return {c: sum(r[key] == c for r in rows) for c in "CMN"}

def chronicler_median(key):
    # Perfect contemporary information: a C sentence could be written at the episode's close (wait 0);
    # M and N keep the wait the Studio found.
    return round(statistics.median(0.0 if r[key] == "C" else r["lag_years"] for r in rows), 2)

def by_code_median(key, c):
    v = [r["lag_years"] for r in rows if r[key] == c]
    return round(statistics.median(v), 2) if v else None

long_ = [r for r in rows if r["lag_years"] >= 10]
sag = [r for r in rows if r["sagan"]]
res = {
    "n": len(rows),
    "studio_median_years": round(statistics.median(r["lag_years"] for r in rows), 2),
    "agree": sum(r["c1"] == r["c2"] for r in rows),
    "disagree": [(r["event"], r["c1"], r["c2"]) for r in rows if r["c1"] != r["c2"]],
    "N_later_event_kinds": sorted(set(N_KIND.values())),
    "within_year": sum(r["lag_years"] < 1 for r in rows),
}
for key in ("c1", "c2"):
    t = tally(key)
    res[key] = dict(
        tally=t,
        long_wait=len(long_), long_wait_C=sum(r[key] == "C" for r in long_),
        within_year_tally={c: sum(r[key] == c and r["lag_years"] < 1 for r in rows) for c in "CMN"},
        sagan=len(sag), sagan_tally={c: sum(r[key] == c for r in sag) for c in "CMN"},
        median_by_code={c: by_code_median(key, c) for c in "CMN"},
        chronicler_median_years=chronicler_median(key),
        on_the_day_under_chronicler=t["C"],
        P1=t["C"] >= 20, P2=t["N"] <= 5,
        P3=sum(r[key] == "C" for r in sag) >= 7 and not any(r[key] == "N" for r in sag),
        P4=sum(r[key] == "C" for r in long_) >= 15,
        refuted=t["N"] >= 12,
    )
res["P5"] = res["agree"] >= 28 and not any({a, b} == {"N", "C"} for _, a, b in res["disagree"])
json.dump(dict(results=res, rows=rows), open("results.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(res, indent=1))
