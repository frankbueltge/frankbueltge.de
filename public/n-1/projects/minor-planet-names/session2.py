"""Project 9 session 2: the registered run (SESSION2.md).

Usage: python3 session2.py CACHE_DIR BULLETIN_TEXT_DIR
  CACHE_DIR: SBDB answers re-fetched with fetch.py; BULLETIN_TEXT_DIR: WGSBNBull_V00v_iii.txt (pdftotext -layout)
Writes session2_rows.json (numbers, years, flags, sections; no names, no text) and session2.json (counts, predictions).
"""
import json, os, re, statistics, sys
from session1 import clean, cite_year, years, student
from session2_lib import parse_cref, section_of, occasion_year, mpc_date

cache, btxt = sys.argv[1], sys.argv[2]
rows1 = {r["n"]: r for r in json.load(open("rows.json"))}
tables = json.load(open("tables2.json"))
_bt = {}


def bulletin(v, i):
    k = (v, i)
    if k not in _bt:
        p = os.path.join(btxt, f"WGSBNBull_V{v:03d}_{i:03d}.txt")
        _bt[k] = open(p, encoding="utf8").read() if os.path.exists(p) else None
    return _bt[k]


def earliest_year(ref):
    if not ref:
        return None, None
    m = re.match(r"MPC (\d+)", ref)
    if m:
        d = mpc_date(int(m.group(1)), tables["mpc_batches"])
        return (int(d[:4]) if d else None), d
    m = re.match(r"Bull\. (\d+), #(\d+)", ref)
    if m:
        d = tables["wgsbn_bulletins"].get(f"{int(m.group(1))}-{int(m.group(2))}")
        return (int(d[:4]) if d else None), d
    return None, None


rows = []
for n in json.load(open("sample.json"))["numbers"]:
    p = os.path.join(cache, f"{n}.json")
    if not os.path.exists(p):
        rows.append({"n": n, "fetched": False})
        continue
    di = json.load(open(p)).get("discovery") or {}
    text = clean(di.get("citation"))
    cref = di.get("cref") or ""
    cy = cite_year(cref)
    st, b, de = years(text, cy) if text else (None, None, None)
    r1 = rows1.get(n, {})
    mentor = bool(re.search(r"mentor", text, re.I)) if text else False
    r = {"n": n, "fetched": True, "cited": bool(text), "cite_year": cy, "wgsbn": None, "section": None,
         "earlier_ref": None, "earlier_date": None, "naming_year": cy, "status": st, "birth": b, "death": de,
         "student_v": bool(text) and student(text) and not mentor, "mentor": mentor,
         "same_as_s1": (r1.get("cite_year") == cy and r1.get("birth") == b and r1.get("death") == de and r1.get("cited") == bool(text))}
    w = parse_cref(cref)
    if text and w:
        r["wgsbn"] = list(w)
        t = bulletin(w[0], w[1])
        if t is None:
            r["section"] = "no bulletin"
        else:
            sec, ref = section_of(t, n)
            r["section"], r["earlier_ref"] = sec, ref
            if sec == "erratum":
                y, d = earliest_year(ref)
                r["earlier_date"] = d
                if y:
                    r["naming_year"] = y
    ny = r["naming_year"]
    r["age1"] = (cy - b) if (st == "living" and cy) else None
    r["age"] = (ny - b) if (st == "living" and ny) else None
    r["gap"] = (ny - de) if (st == "dead" and ny) else None
    r["occasion"] = occasion_year(text) if (text and (r["student_v"] or mentor)) else None
    r["lag"] = (ny - r["occasion"]) if (r["occasion"] and ny) else None
    r["age_occ"] = (r["occasion"] - b) if (r["occasion"] and st == "living" and b) else None
    rows.append(r)

json.dump(rows, open("session2_rows.json", "w"), indent=0)

f = [r for r in rows if r.get("fetched")]
cited = [r for r in f if r["cited"]]
w = [r for r in cited if r["wgsbn"]]
sec = {}
for r in w:
    sec[r["section"]] = sec.get(r["section"], 0) + 1
found = [r for r in w if r["section"] in ("new", "erratum", "other")]
err = [r for r in w if r["section"] == "erratum"]
band = lambda a: None if a is None else a // 5
liv = [r for r in cited if r["status"] == "living" and r["age1"] is not None]
moved = [r for r in liv if band(r["age"]) != band(r["age1"])]
stud = [r for r in cited if r["student_v"] and r["occasion"]]
lags = [r["lag"] for r in stud if r["lag"] is not None]
late = [r["lag"] for r in stud if r["lag"] is not None and r["naming_year"] and r["naming_year"] >= 2015]
early = [r["lag"] for r in stud if r["lag"] is not None and r["naming_year"] and r["naming_year"] < 2010]
ao = {}
for r in stud:
    if r["age_occ"] is not None:
        ao[r["age_occ"]] = ao.get(r["age_occ"], 0) + 1
top_ao = max(ao, key=ao.get) if ao else None
s20 = [r["age"] for r in cited if r["student_v"] and r["status"] == "living" and r["age"] is not None
       and r["naming_year"] and r["naming_year"] >= 2020]
out = {
    "fetched": len(f), "cited": len(cited), "same_as_session1": sum(r["same_as_s1"] for r in f),
    "wgsbn_cited": len(w), "sections": sec, "found": len(found), "erratum": len(err),
    "erratum_share_of_found": round(len(err) / len(found), 4) if found else None,
    "erratum_with_earlier_year": sum(1 for r in err if r["earlier_date"]),
    "living_with_age": len(liv), "moved_band": len(moved),
    "moved_share": round(len(moved) / len(liv), 4) if liv else None,
    "student_with_occasion": len(stud), "student_v": sum(r["student_v"] for r in cited),
    "mentor": sum(r["mentor"] for r in cited), "mentor_with_occasion": sum(1 for r in cited if r["mentor"] and r["occasion"]),
    "median_lag": statistics.median(lags) if lags else None,
    "lag_quartiles": statistics.quantiles(lags, n=4) if len(lags) > 3 else None,
    "lag_out_of_range": sum(1 for x in lags if x < 0 or x > 30),
    "median_lag_named_2015_on": statistics.median(late) if late else None, "n_2015_on": len(late),
    "median_lag_named_before_2010": statistics.median(early) if early else None, "n_before_2010": len(early),
    "age_at_occasion": dict(sorted(ao.items())), "top_age_at_occasion": top_ao,
    "median_age_student_named_2020_on": statistics.median(s20) if s20 else None, "n_student_named_2020_on": len(s20),
}
out["predictions"] = {
    "P7": out["erratum_share_of_found"] is not None and out["erratum_share_of_found"] <= 0.05,
    "P8": out["moved_share"] is not None and out["moved_share"] <= 0.02,
    "P9": out["median_lag"] is not None and out["median_lag"] >= 2,
    "P10": bool(late and early and statistics.median(late) > statistics.median(early)),
    "P11": top_ao == 17,
    "P12": out["median_age_student_named_2020_on"] is not None and out["median_age_student_named_2020_on"] >= 21,
}
json.dump(out, open("session2.json", "w"), indent=1)
print(json.dumps(out, indent=1))
