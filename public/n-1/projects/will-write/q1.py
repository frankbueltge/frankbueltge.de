"""Project 8, session 2, Q1: the return path (SESSION2.md). For session 1's bill-debate promises in 2010, 2015, 2020, 2025, find the
bill on the Bills API and its "Will write letters" (publication type 44). Raw answers cached in scratch (argument 1); the repository
gets q1_rows.json: promise id, house, date, bill name, bill id, and the type-44 publications' ids and dates (titles carry names and
are not committed). Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import json, re, sys, time, urllib.parse, urllib.request
from datetime import date, timedelta

API = "https://bills-api.parliament.uk/api/v1"
YEARS = [2010, 2015, 2020, 2025]
WINDOW = 60
CACHE = {}


def get(path, params=None):
    url = API + path + ("?" + urllib.parse.urlencode(params, doseq=True) if params else "")
    if url in CACHE:
        return CACHE[url]
    for attempt in range(6):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                d = json.load(r)
            time.sleep(0.3)
            CACHE[url] = d
            return d
        except Exception as e:
            print("retry", attempt, url, e, file=sys.stderr)
            time.sleep(2 ** (attempt + 1))
    raise RuntimeError(url)


def bill_name(debate):
    t = re.sub(r"\[[^\]]*\]", "", debate)
    m = re.search(r"^(.*?\bBill)\b", t)
    return re.sub(r"\s+", " ", m.group(1)).strip().replace("\u2019", "'") if m else None


def norm(title):
    t = re.sub(r"\[[^\]]*\]|\([^)]*HL[^)]*\)", "", title).strip().replace("\u2019", "'")
    t = re.sub(r"\bAct\s+\d{4}$", "Bill", t)
    return re.sub(r"\s+", " ", t).strip().lower()


def sittings(bill_id):
    out, skip = [], 0
    while True:
        d = get(f"/Bills/{bill_id}/Stages", {"Take": 100, "Skip": skip})
        for s in d["items"]:
            out += [x["date"][:10] for x in s.get("stageSittings", []) if x.get("date")]
        skip += 100
        if skip >= d["totalResults"]:
            return sorted(out)


def main(scratch):
    global CACHE
    try:
        CACHE = json.load(open(scratch))
    except OSError:
        CACHE = {}
    rows = [r for r in json.load(open("session1_rows.json")) if r["promise"] and r["bill"] and r["year"] in YEARS]
    out = []
    for r in rows:
        name = bill_name(r["debate"])
        rec = {"id": r["id"], "house": r["house"], "year": r["year"], "date": r["date"], "bill_name": name,
               "bill_id": None, "candidates": 0, "letters": [], "letter_back": None, "letter_on_bill": None}
        if name:
            hits = get("/Bills", {"SearchTerm": name, "Take": 50})["items"]
            cands = [h for h in hits if norm(h["shortTitle"]) == name.lower()]
            rec["candidates"] = len(cands)
            best = None
            for h in cands:
                s = sittings(h["billId"])
                if s and s[0] <= r["date"] <= s[-1]:
                    gap = 0
                elif s:
                    gap = min(abs((date.fromisoformat(x) - date.fromisoformat(r["date"])).days) for x in (s[0], s[-1]))
                else:
                    continue
                # SESSION2.md: the promise date must fall within the bill's sittings; nearest wins among those
                if gap == 0 and (best is None or best[0] > 0):
                    best = (gap, h["billId"])
            if best:
                rec["bill_id"] = best[1]
                pubs = get(f"/Bills/{best[1]}/Publications")["publications"]
                lt = [p for p in pubs if p["publicationType"]["id"] == 44]
                rec["letters"] = [{"pub": p["id"], "date": p["displayDate"][:10], "house": p.get("house")} for p in lt]
                d0 = date.fromisoformat(r["date"])
                rec["letter_on_bill"] = bool(lt)
                rec["letter_back"] = any(d0 <= date.fromisoformat(p["displayDate"][:10]) <= d0 + timedelta(days=WINDOW) for p in lt)
        out.append(rec)
        json.dump(CACHE, open(scratch, "w"))
    json.dump(out, open("q1_rows.json", "w"), indent=0)
    m = [x for x in out if x["bill_id"]]
    print(len(out), "promises;", len(m), "matched")


if __name__ == "__main__":
    main(sys.argv[1])
