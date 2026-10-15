"""Project 9 session 1: parse cached SBDB answers by the rules registered in SELECTION.md.

Usage: python3 session1.py CACHE_DIR  -> session1_rows.json (no names, no citation text), session1.json (counts)
"""
import html, json, os, re, statistics, sys

LIFESPAN = re.compile(r"\(\s*(\d{3,4})\s*[-–—]\s*(\d{3,4})\s*\)")
BORN = re.compile(r"\(\s*(?:b\.|born)\s*(\d{4})\s*\)")
OPEN = re.compile(r"\(\s*(\d{4})\s*[-–—]\s*\)")
STUDENT = ["science talent search", "science and engineering fair", "isef", "broadcom masters", "science fair",
           "high school", "secondary school", "middle school", "young scientist"]


def clean(c):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", c or ""))).strip()


def cite_year(cref):
    if not cref:
        return None
    m = re.search(r"MPC batch dated (\d{4})-\d\d-\d\d", cref)
    if m:
        return int(m.group(1))
    m = re.match(r"(\d{4})\d{4}/", cref)
    if m:
        return int(m.group(1))
    m = re.search(r"WGSBN Bull\.\s*(\d+)", cref)
    if m:
        return 2020 + int(m.group(1))
    return None


def years(text, cy):
    """First of the registered patterns to occur decides. Returns (status, birth, death)."""
    hits = []
    for m in LIFESPAN.finditer(text):
        b, d = int(m.group(1)), int(m.group(2))
        if b < d and (cy is None or d <= cy):
            hits.append((m.start(), "dead", b, d))
            break
    for pat in (BORN, OPEN):
        m = pat.search(text)
        if m:
            hits.append((m.start(), "living", int(m.group(1)), None))
    if not hits:
        return None, None, None
    hits.sort()
    return hits[0][1:]


def student(text):
    t = text.lower()
    return any(k in t for k in STUDENT)


if __name__ == "__main__":
    cache = sys.argv[1]
    nums = json.load(open("sample.json"))["numbers"]
    rows = []
    for n in nums:
        p = os.path.join(cache, f"{n}.json")
        if not os.path.exists(p):
            rows.append({"n": n, "fetched": False})
            continue
        d = json.load(open(p))
        di = d.get("discovery") or {}
        text = clean(di.get("citation"))
        cy = cite_year(di.get("cref"))
        st, b, de = years(text, cy) if text else (None, None, None)
        disc = (di.get("date") or "")[:4]
        rows.append({"n": n, "fetched": True, "cited": bool(text), "cite_year": cy,
                     "cref_kind": (None if not di.get("cref") else "wgsbn" if "WGSBN" in di["cref"] else
                                   "batch" if "batch" in di["cref"] else "arc" if re.match(r"\d{8}/", di["cref"]) else "other"),
                     "disc_year": int(disc) if disc.isdigit() else None,
                     "status": st, "birth": b, "death": de,
                     "age": (cy - b) if (st == "living" and cy) else None,
                     "gap": (cy - de) if (st == "dead" and cy) else None,
                     "student": student(text) if text else False,
                     "len": len(text)})
    json.dump(rows, open("session1_rows.json", "w"), indent=0)

    f = [r for r in rows if r.get("fetched")]
    cited = [r for r in f if r["cited"]]
    liv = [r for r in cited if r["status"] == "living" and r["age"] is not None]
    dead = [r for r in cited if r["status"] == "dead" and r["gap"] is not None]
    ages = [r["age"] for r in liv]
    bands = {}
    for a in ages:
        k = f"{(a // 5) * 5}-{(a // 5) * 5 + 4}"
        bands[k] = bands.get(k, 0) + 1
    top = max(bands, key=bands.get) if bands else None
    nonstud = [r["age"] for r in liv if not r["student"]]
    gaps = [r["gap"] for r in dead]
    def share(lo, hi):
        c = [r for r in cited if r["cite_year"] and lo <= r["cite_year"] <= hi]
        s = sum(r["student"] for r in c)
        return s, len(c), (s / len(c) if c else None)
    s0212 = share(2002, 2012)
    s20 = share(2020, 2100)
    out = {
        "fetched": len(f), "cited": len(cited), "cite_year_unknown": sum(1 for r in cited if r["cite_year"] is None),
        "living_with_age": len(liv), "dead_with_gap": len(dead),
        "no_years": sum(1 for r in cited if r["status"] is None),
        "age_bands": dict(sorted(bands.items(), key=lambda kv: int(kv[0].split('-')[0]))),
        "share_19_or_under": (sum(a <= 19 for a in ages) / len(ages)) if ages else None,
        "top_band": top,
        "median_age_nonstudent_living": statistics.median(nonstud) if nonstud else None,
        "median_age_living": statistics.median(ages) if ages else None,
        "median_gap_dead": statistics.median(gaps) if gaps else None,
        "student_2002_2012": s0212, "student_2020_on": s20,
        "share_cited": len(cited) / 3000,
    }
    out["predictions"] = {
        "P1": out["share_19_or_under"] is not None and out["share_19_or_under"] >= 0.30,
        "P2": top == "15-19",
        "P3": out["median_age_nonstudent_living"] is not None and out["median_age_nonstudent_living"] >= 55,
        "P4": out["median_gap_dead"] is not None and out["median_gap_dead"] > 50,
        "P5": bool(s0212[2] is not None and s20[2] is not None and s0212[2] >= 0.25 and s20[2] < 0.10),
        "P6": out["share_cited"] >= 0.70,
    }
    json.dump(out, open("session1.json", "w"), indent=1)
    print(json.dumps(out, indent=1))
