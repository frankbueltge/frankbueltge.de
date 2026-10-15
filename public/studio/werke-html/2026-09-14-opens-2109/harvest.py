#!/usr/bin/env python3
"""OPENS 01/01/2109 — the harvest.

Reads The National Archives' Discovery catalogue (Kew, UK) through its public search API
and writes ONE file into this repository: counts.json, the measurement.

Nothing of the catalogue is mirrored here. The raw pages land in a cache OUTSIDE the
repository (--cache, default ~/.cache/studio-tna) and counts.json holds counts, a length
histogram, an opening-year timetable and a small number of individual entries quoted as
evidence — references, titles and dates, with the source named, which is what the Open
Government Licence asks for.

  python3 harvest.py              # fetch (about 140 requests), write the cache and counts.json
  python3 harvest.py --offline    # recount from the cache without touching the network

The catalogue data is Crown copyright, licensed under the Open Government Licence v3.0
(https://www.nationalarchives.gov.uk/legal/copyright/, read 2026-09-14).
"""
import argparse, hashlib, json, os, re, sys, time, urllib.parse, urllib.request
from collections import Counter
from datetime import date, timedelta

API = "https://discovery.nationalarchives.gov.uk/API/search/records"
UA = "studio-research/1.0 (+https://frankbueltge.de/studio)"

# The eight departments pulled COMPLETE, and why these eight. FCO is the spine: the largest
# closed holding in the catalogue that is a record of decisions rather than of persons. The
# other seven are every department of comparable kind small enough to pull whole in one
# session — the two giants (WO 2 304 722, AIR 585 248) are service records and are left to
# their own work. The choice is stated so the frame can be checked; it is not a sample.
DEPTS = ["FCO", "PREM", "DEFE", "T", "CJ", "LCO", "CABE", "FO"]
RETAINED_OF = "FCO"        # the same department's retained records, for the residue
KEEP = ("id", "reference", "department", "title", "coveringDates", "numEndDate",
        "closureStatus", "closureType", "closureCode", "openingDate", "catalogueLevel")


def fetch(params, tries=4):
    url = API + "?" + urllib.parse.urlencode(params)
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json",
                                                       "User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:            # a refusal is retried before it is recorded
            last = e
            time.sleep(2.0 * (i + 1))
    raise RuntimeError(f"{url}\n  {last}")


def cache_path(cache, name):
    return os.path.join(cache, name + ".json")


def pull(cache, dept, status, offline):
    """Every closed (or retained) record of one department, by cursor, in reference order."""
    name = f"{dept}_{status}"
    path = cache_path(cache, name)
    if offline or os.path.exists(path):
        if not os.path.exists(path):
            sys.exit(f"--offline: {path} is not in the cache")
        return json.load(open(path))
    p = {"sps.searchQuery": "*", "sps.heldByCode": "TNA", "sps.resultsPageSize": 1000,
         "sps.closureStatuses": status, "sps.departments": dept,
         "sps.batchStartMark": "*", "sps.sortByOption": "REFERENCE_ASCENDING"}
    out, seen, reported = [], set(), None
    while True:
        d = json.loads(fetch(p))
        if reported is None:
            reported = d["count"]
        recs = d.get("records") or []
        new = [r for r in recs if r["id"] not in seen]
        for r in new:
            seen.add(r["id"])
            out.append({k: r.get(k) for k in KEEP})
        print(f"  {name}: {len(out)}/{reported}", flush=True)
        mark = d.get("nextBatchMark") or ""
        if not mark or not recs or not new:
            break
        p["sps.batchStartMark"] = mark
        time.sleep(0.15)
    blob = {"department": dept, "status": status, "reported": reported, "records": out}
    json.dump(blob, open(path, "w"))
    return blob


def whole_catalogue(cache, offline):
    """The closure facet over the entire TNA holding — five numbers, one request."""
    path = cache_path(cache, "_facet")
    if offline or os.path.exists(path):
        return json.load(open(path))
    d = json.loads(fetch({"sps.searchQuery": "*", "sps.heldByCode": "TNA",
                          "sps.resultsPageSize": 1}))
    blob = {"total": d["count"],
            "by_status": {b["code"]: b["count"] for b in d.get("closureStatuses") or []},
            "by_department": {b["code"]: b["count"] for b in (d.get("departments") or [])}}
    json.dump(blob, open(path, "w"))
    return blob


def closed_facet(cache, offline):
    path = cache_path(cache, "_facet_closed")
    if offline or os.path.exists(path):
        return json.load(open(path))
    d = json.loads(fetch({"sps.searchQuery": "*", "sps.heldByCode": "TNA",
                          "sps.closureStatuses": "C", "sps.resultsPageSize": 1}))
    blob = {"total": d["count"],
            "by_department": {b["code"]: b["count"] for b in (d.get("departments") or [])}}
    json.dump(blob, open(path, "w"))
    return blob


def dept_title(cache, dept, offline):
    """The department's own top-level catalogue entry — its name in the catalogue's words."""
    path = cache_path(cache, f"_name_{dept}")
    if offline or os.path.exists(path):
        return json.load(open(path))
    d = json.loads(fetch({"sps.searchQuery": "*", "sps.heldByCode": "TNA",
                          "sps.departments": dept, "sps.catalogueLevels": "Level1",
                          "sps.resultsPageSize": 1}))
    r = (d.get("records") or [{}])[0]
    blob = {"title": (r.get("title") or "").strip(), "context": (r.get("context") or "").strip()}
    json.dump(blob, open(path, "w"))
    return blob


YEAR = re.compile(r"(\d{4})")


def opening_year(r):
    m = YEAR.search(r.get("openingDate") or "")
    return int(m.group(1)) if m else None


def end_year(r):
    v = r.get("numEndDate")
    if not v:
        return None
    s = str(v)
    return int(s[:4]) if len(s) >= 4 else None


def exact_date(r):
    """The last day of the record, and the day it opens — both as (y, m, d), or None."""
    v, od = r.get("numEndDate"), (r.get("openingDate") or "").strip()
    if not v or len(str(v)) != 8 or len(od) != 10:
        return None
    s = str(v)
    try:
        return ((int(s[:4]), int(s[4:6]), int(s[6:8])),
                (int(od[6:10]), int(od[3:5]), int(od[0:2])))
    except ValueError:
        return None


def classify_break(r, code):
    """Why an entry does not fit the rule. Three shapes, and they are different mistakes.

    day_exact  — it fits a stricter version: the record's own last day, plus the code in
                 years, plus one day. These are the entries that do not open on 1 January.
    year_in_code — somebody typed the opening YEAR into the field that wants a duration.
    unexplained  — neither.
    """
    pair = exact_date(r)
    if pair:
        (ey, em, ed), (oy, om, od_) = pair
        try:
            due = date(ey + code, em, ed) + timedelta(days=1)
            if (due.year, due.month, due.day) == (oy, om, od_):
                return "day_exact"
        except ValueError:
            pass
    oy = opening_year(r)
    if oy is not None and code == oy:
        return "year_in_code"
    return "unexplained"


def measure(blob):
    R = blob["records"]
    years, lengths, codes = Counter(), Counter(), Counter()
    dated = law_hold = law_break = 0
    breaks = Counter()
    undated, mis_keyed, off_new_year = [], [], []
    for r in R:
        oy, ey = opening_year(r), end_year(r)
        code = r.get("closureCode")
        code = int(code) if code and str(code).strip().isdigit() else None
        if oy is None:
            undated.append(r)
            continue
        dated += 1
        years[oy] += 1
        if code is not None:
            codes[code] += 1
        if ey is not None and code is not None:
            if oy == ey + code + 1:
                law_hold += 1
                lengths[oy - ey] += 1
            else:
                law_break += 1
                kind = classify_break(r, code)
                breaks[kind] += 1
                mis_keyed.append(dict(r, _why=kind))
        d = (r.get("openingDate") or "")[:5]
        if d and d != "01/01":
            off_new_year.append(r)
    return {"n": len(R), "reported": blob["reported"], "dated": dated,
            "undated": len(R) - dated,
            "years": {str(k): v for k, v in sorted(years.items())},
            "lengths": {str(k): v for k, v in sorted(lengths.items())},
            "codes": {str(k): v for k, v in sorted(codes.items())},
            "law_hold": law_hold, "law_break": law_break,
            "break_kinds": dict(breaks),
            "_undated": undated, "_mis_keyed": mis_keyed, "_off_new_year": off_new_year}


# An entry whose TITLE is the statement that the title is withheld. The catalogue writes
# these in square brackets; the three spellings below are every form found in the eight
# departments read, matched on the whole title or on a bracketed fragment inside it.
WITHHELD_TITLE = re.compile(r"\[(?:title|name|names)\s+withheld\]|^title withheld$", re.I)
# ... and the sharper case: the WHOLE title is that statement, so the entry says only that
# something is here and it may not be said what. A name struck out of an otherwise written
# title ("Colombia: application for political asylum [Name withheld]") is a different thing
# and is counted apart.
WHOLLY_WITHHELD = re.compile(r"^\[?(?:title|name|names)\s+withheld\]?\.?$", re.I)


def quote(r):
    """One catalogue entry as evidence: the fields a reader needs to go and check it."""
    return {"reference": r.get("reference"), "title": (r.get("title") or "").strip(),
            "covering": (r.get("coveringDates") or "").strip(),
            "opens": (r.get("openingDate") or "").strip(),
            "code": r.get("closureCode"), "department": r.get("department")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true")
    ap.add_argument("--cache", default=os.path.expanduser("~/.cache/studio-tna"))
    a = ap.parse_args()
    os.makedirs(a.cache, exist_ok=True)

    facet = whole_catalogue(a.cache, a.offline)
    cfacet = closed_facet(a.cache, a.offline)

    depts, per_dept = {}, {}
    for d in DEPTS:
        blob = pull(a.cache, d, "C", a.offline)
        m = measure(blob)
        per_dept[d] = m
        depts[d] = {k: v for k, v in m.items() if not k.startswith("_")}
        depts[d]["name"] = dept_title(a.cache, d, a.offline)["title"]
        depts[d]["closed_in_catalogue"] = cfacet["by_department"].get(d)

    ret_blob = pull(a.cache, RETAINED_OF, "R", a.offline)
    ret = measure(ret_blob)

    # the timetable: every opening year, all eight departments summed
    timetable = Counter()
    for d, m in per_dept.items():
        for y, n in m["years"].items():
            timetable[int(y)] += n

    all_lengths = Counter()
    for m in per_dept.values():
        for k, v in m["lengths"].items():
            all_lengths[int(k)] += v

    # the residue, named: every closed record with no opening date, and the retained
    undated_closed = [quote(r) for m in per_dept.values() for r in m["_undated"]]
    undated_closed.sort(key=lambda q: q["reference"] or "")
    mis_keyed = [quote(r) | {"why": r.get("_why")}
                 for m in per_dept.values() for r in m["_mis_keyed"]]
    break_kinds = Counter()
    for m in per_dept.values():
        break_kinds.update(m["break_kinds"])
    off_new_year = [quote(r) for m in per_dept.values() for r in m["_off_new_year"]]

    # the entries the catalogue will not name: a record exists, it is counted, and where it
    # is closed rather than retained it also carries the date on which it acquires a title.
    withheld = {"closed": 0, "closed_dated": 0, "retained": 0, "by_department": {},
                "spellings": {}, "examples": [],
                "wholly_closed": 0, "wholly_closed_dated": 0, "wholly_retained": 0}
    for d in DEPTS + [RETAINED_OF]:
        status = "R" if d == RETAINED_OF and d in withheld["by_department"] else "C"
        for st in (["C", "R"] if d == RETAINED_OF else ["C"]):
            if d != RETAINED_OF and st == "R":
                continue
            blob = pull(a.cache, d, st, True)
            for r in blob["records"]:
                t = (r.get("title") or "").strip()
                if not WITHHELD_TITLE.search(t):
                    continue
                key = "retained" if st == "R" else "closed"
                withheld[key] += 1
                if st == "C" and opening_year(r):
                    withheld["closed_dated"] += 1
                if WHOLLY_WITHHELD.match(t):
                    withheld["wholly_" + key] += 1
                    if st == "C" and opening_year(r):
                        withheld["wholly_closed_dated"] += 1
                withheld["by_department"].setdefault(d + "/" + st, 0)
                withheld["by_department"][d + "/" + st] += 1
                withheld["spellings"][t if len(t) < 40 else t[:40]] = \
                    withheld["spellings"].get(t if len(t) < 40 else t[:40], 0) + 1
                if st == "C" and opening_year(r) and WHOLLY_WITHHELD.match(t) \
                        and len(withheld["examples"]) < 10:
                    withheld["examples"].append(quote(r))
    withheld["spellings"] = dict(sorted(withheld["spellings"].items(),
                                        key=lambda kv: -kv[1])[:8])
    withheld["total"] = withheld["closed"] + withheld["retained"]

    # the longest closures, as entries a reader can look up
    longest = []
    for d, m in per_dept.items():
        blob = pull(a.cache, d, "C", True)
        for r in blob["records"]:
            oy, ey = opening_year(r), end_year(r)
            if oy and ey:
                longest.append((oy - ey, oy, quote(r)))
    longest.sort(key=lambda t: (-t[0], t[2]["reference"] or ""))
    latest = sorted(longest, key=lambda t: (-t[1], t[2]["reference"] or ""))

    out = {
        "_": "OPENS 01/01/2109 — the measurement. Source: The National Archives, Discovery "
             "catalogue (discovery.nationalarchives.gov.uk), read 2026-09-14. Crown copyright, "
             "Open Government Licence v3.0. Nothing of the catalogue is mirrored here beyond "
             "the entries quoted as evidence.",
        "fetched_utc": time.strftime("%Y-%m-%d", time.gmtime()) if not a.offline
                       else json.load(open(cache_path(a.cache, "_stamp")))["fetched_utc"],
        "api": API,
        "catalogue": facet,
        "closed_catalogue": cfacet,
        "departments": depts,
        "retained": {k: v for k, v in ret.items() if not k.startswith("_")},
        "retained_of": RETAINED_OF,
        "retained_name": depts[RETAINED_OF]["name"],
        "timetable": {str(k): v for k, v in sorted(timetable.items())},
        "lengths": {str(k): v for k, v in sorted(all_lengths.items())},
        "undated_closed": undated_closed,
        "retained_undated_sample": [quote(r) for r in ret["_undated"][:24]],
        "break_kinds": dict(break_kinds),
        "withheld_titles": withheld,
        "mis_keyed": mis_keyed,
        "off_new_year": off_new_year,
        "longest": [t[2] | {"length": t[0]} for t in longest[:12]],
        "latest": [t[2] | {"length": t[0]} for t in latest[:12]],
    }
    if not a.offline:
        json.dump({"fetched_utc": out["fetched_utc"]},
                  open(cache_path(a.cache, "_stamp"), "w"))
    here = os.path.dirname(os.path.abspath(__file__))
    txt = json.dumps(out, indent=1, ensure_ascii=False, sort_keys=False) + "\n"
    open(os.path.join(here, "counts.json"), "w").write(txt)
    print(f"counts.json  {len(txt)} bytes  sha256 "
          f"{hashlib.sha256(txt.encode()).hexdigest()[:16]}…")


if __name__ == "__main__":
    main()
