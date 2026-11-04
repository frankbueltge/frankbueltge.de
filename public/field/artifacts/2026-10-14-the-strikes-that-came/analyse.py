"""Study 12 — of the strikes that came, how many were seen coming?

Usage: python3 -I analyse.py <fireball.json> <studio data.json> <encyclopedia raw list>
Reduces the inputs to data/fireballs.tsv and data/warned.tsv, then writes data/results.json.
Rules are those of PREREGISTRATION.md (commit 4f521e1)."""
import hashlib, json, math, re, sys
from datetime import datetime, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "data"
START = datetime(2008, 10, 7)
SPLIT = datetime(2018, 1, 1)


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def wilson(k, n, z=1.959964):
    if n == 0:
        return [None, None]
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [round(100 * (c - h), 3), round(100 * (c + h), 3)]


def gc_km(a, b):
    (la1, lo1), (la2, lo2) = [(math.radians(x), math.radians(y)) for x, y in (a, b)]
    s = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(s))


def fnum(x):
    return None if x in (None, "") else float(x)


def load_fireballs(path):
    raw = json.load(open(path))
    f = raw["fields"]
    rows = []
    for r in raw["data"]:
        d = dict(zip(f, r))
        lat = fnum(d["lat"]); lon = fnum(d["lon"])
        if lat is not None and d["lat-dir"] == "S":
            lat = -lat
        if lon is not None and d["lon-dir"] == "W":
            lon = -lon
        rows.append({"t": datetime.strptime(d["date"], "%Y-%m-%d %H:%M:%S"), "energy": fnum(d["energy"]),
                     "impact_kt": fnum(d["impact-e"]), "lat": lat, "lon": lon})
    return raw, rows


H = {}  # absolute magnitude per designation, from the same list (post hoc, exploratory)


def wiki_rows(path):
    """Designation -> impact time from the encyclopedia list's table rows."""
    out = {}
    H.clear()
    for line in open(path, encoding="utf-8"):
        m = re.match(r"\| \{\{mpl?\|(\d{4}) ([A-Z]{2})\|?(\d*)\}\}", line)
        if not m:
            continue
        des = f"{m.group(1)} {m.group(2)}{m.group(3)}"
        cells = [c.strip() for c in line.split("||")]
        t = cells[5]
        y, mo, rest = t.split("-", 2)
        dd, hm = rest.split(" ")
        h, mi = hm.split(":")
        out[des] = datetime(int(y), int(mo), int(dd), int(h), int(mi))
        H[des] = float(cells[4])
    return out


def main(fb_path, studio_path, wiki_path):
    raw, fb = load_fireballs(fb_path)
    studio = json.load(open(studio_path))["rows"]
    wiki = wiki_rows(wiki_path)
    fetched = max(r["t"] for r in fb)

    # warned list, checked against the list as fetched today
    warned, checks = [], []
    for r in studio:
        t_s = datetime.strptime(r["impact_utc"], "%Y-%m-%d %H:%M")
        t_w = wiki.get(r["des"])
        diff = None if t_w is None else abs((t_w - t_s).total_seconds()) / 60
        checks.append({"des": r["des"], "studio": r["impact_utc"], "list": t_w and t_w.strftime("%Y-%m-%d %H:%M"),
                       "diff_min": diff})
        t = t_w if (t_w is not None and diff > 10) else t_s
        warned.append({"des": r["des"], "t": t, "lat": r["lat"], "lon": r["lon"], "held_h": r["held_h"],
                       "confirmed": r["confirmed"], "residents_50km": r["residents_50km"], "H_list": H.get(r["des"])})

    per = [r for r in fb if r["t"] >= START]
    # match
    for w in warned:
        best = None
        for i, r in enumerate(per):
            dt = abs((r["t"] - w["t"]).total_seconds()) / 60
            if dt > 24 * 60:
                continue
            dkm = gc_km((w["lat"], w["lon"]), (r["lat"], r["lon"])) if r["lat"] is not None else None
            key = (dt, dkm if dkm is not None else 1e9)
            if best is None or key < best[0]:
                best = (key, i, dt, dkm)
        w["nearest"] = None
        w["match"] = None
        if best:
            _, i, dt, dkm = best
            r = per[i]
            w["nearest"] = {"fb_time": r["t"].strftime("%Y-%m-%d %H:%M:%S"), "dt_min": round(dt, 1),
                            "d_km": None if dkm is None else round(dkm, 1), "impact_kt": r["impact_kt"],
                            "energy": r["energy"]}
            if dt <= 60 and (dkm is None or dkm <= 300):
                w["match"] = "time_and_place" if dkm is not None else "time_only"
                r["warned"] = w["des"]
        if w["nearest"] is None:
            # nearest in time over the whole period, for the record
            r = min(per, key=lambda r: abs((r["t"] - w["t"]).total_seconds()))
            w["nearest"] = {"fb_time": r["t"].strftime("%Y-%m-%d %H:%M:%S"),
                            "dt_min": round(abs((r["t"] - w["t"]).total_seconds()) / 60, 1),
                            "d_km": None if r["lat"] is None else round(gc_km((w["lat"], w["lon"]), (r["lat"], r["lon"])), 1),
                            "impact_kt": r["impact_kt"], "energy": r["energy"]}

    def share(rows):
        k = sum(1 for r in rows if r.get("warned"))
        n = len(rows)
        return {"warned": k, "n": n, "pct": round(100 * k / n, 3) if n else None, "ci95": wilson(k, n)}

    res = {"period": [START.strftime("%Y-%m-%d"), fetched.strftime("%Y-%m-%d %H:%M:%S")]}
    res["all"] = share(per)
    big = [r for r in per if r["impact_kt"] is not None and r["impact_kt"] >= 1]
    small = [r for r in per if r["impact_kt"] is not None and r["impact_kt"] < 1]
    res["size"] = {"ge1kt": share(big), "lt1kt": share(small),
                   "no_impact_e": sum(1 for r in per if r["impact_kt"] is None)}
    early = [r for r in per if r["t"] < SPLIT]; late = [r for r in per if r["t"] >= SPLIT]
    res["era"] = {"2008_2017": share(early), "2018_on": share(late)}
    matched = [w for w in warned if w["match"]]
    res["overlap"] = {"warned": len(warned), "in_sensor_record": len(matched),
                      "time_only": sum(1 for w in warned if w["match"] == "time_only"),
                      "confirmed_warned": sum(1 for w in warned if w["confirmed"]),
                      "confirmed_in_record": sum(1 for w in matched if w["confirmed"])}
    res["no_location_rows_in_period"] = sum(1 for r in per if r["lat"] is None)

    # predictions
    def verdict(held, near):
        return "undecided" if near else ("held" if held else "failed")
    p1 = res["all"]["pct"]
    a, b = res["size"]["ge1kt"], res["size"]["lt1kt"]
    e1, e2 = res["era"]["2008_2017"], res["era"]["2018_on"]
    p3_ratio = (e2["pct"] / e1["pct"]) if e1["pct"] else None
    res["predictions"] = {
        "P1": {"bar": "< 2 %", "value": p1, "verdict": verdict(p1 < 2, abs(p1 - 2) <= 0.2)},
        "P2": {"bar": "share >= 1 kt > share < 1 kt", "value": [a["pct"], b["pct"]],
               "verdict": verdict(a["pct"] > b["pct"], abs(a["pct"] - b["pct"]) <= 0.2),
               "decided_by_n": min(a["warned"], b["warned"]) < 3},
        "P3": {"bar": "2018-on >= 2 x 2008-2017", "value": [e1["pct"], e2["pct"]],
               "ratio": None if p3_ratio is None else round(p3_ratio, 2),
               "verdict": verdict(e1["pct"] == 0 and e2["pct"] > 0 or (p3_ratio or 0) >= 2,
                                  abs(e2["pct"] - 2 * e1["pct"]) <= 0.2),
               "decided_by_n": min(e1["warned"], e2["warned"]) < 3},
        "P4": {"bar": "<= 7 of 13 in sensor record", "value": len(matched), "verdict": verdict(len(matched) <= 7, False)},
    }

    # exploratory
    years = {}
    for r in per:
        y = r["t"].year
        years.setdefault(y, [0, 0])
        years[y][0] += 1
        years[y][1] += 1 if r.get("warned") else 0
    res["by_year"] = [{"year": y, "fireballs": v[0], "warned": v[1]} for y, v in sorted(years.items())]
    kts = sorted([r["impact_kt"] for r in per if r["impact_kt"] is not None], reverse=True)
    for w in warned:
        if w["match"] and w["nearest"]["impact_kt"] is not None:
            w["energy_rank"] = 1 + sum(1 for k in kts if k > w["nearest"]["impact_kt"])
    res["energy_ranked_n"] = len(kts)
    top = sorted([r for r in per if r["impact_kt"] is not None], key=lambda r: -r["impact_kt"])[:10]
    res["top10"] = [{"t": r["t"].strftime("%Y-%m-%d %H:%M"), "impact_kt": r["impact_kt"], "lat": r["lat"],
                     "lon": r["lon"], "warned": r.get("warned")} for r in top]
    res["post_hoc_H"] = {
        "note": "post hoc, not pre-registered: list H of warned strikes the sensor record holds vs does not",
        "in_record": sorted(w["H_list"] for w in warned if w["match"]),
        "not_in_record": sorted(w["H_list"] for w in warned if not w["match"])}
    res["min_impact_kt_in_period"] = min(kts) if kts else None
    res["kt_quartiles"] = [kts[int(len(kts) * q)] for q in (0.25, 0.5, 0.75)] if kts else None
    res["warned_rows"] = [{k: (v.strftime("%Y-%m-%d %H:%M") if isinstance(v, datetime) else v)
                           for k, v in w.items()} for w in warned]
    res["list_check"] = checks
    res["inputs"] = {"fireball_api": {"url": "https://ssd-api.jpl.nasa.gov/fireball.api", "sha256": sha(fb_path),
                                      "count": raw["count"], "signature": raw["signature"]},
                     "studio_data": {"repo": "studio", "path": "works/2026-10-13-underneath/data.json",
                                     "commit": "ba0e139d474851bffc413edff11ef9fc69ae6ef7", "sha256": sha(studio_path)},
                     "encyclopedia_list": {"url": "https://en.wikipedia.org/w/index.php?title=List_of_predicted_asteroid_impacts_on_Earth&action=raw",
                                           "sha256": sha(wiki_path)}}

    OUT.mkdir(exist_ok=True)
    with open(OUT / "fireballs.tsv", "w") as fh:
        fh.write("time_utc\tradiated_energy_1e10J\timpact_kt\tlat\tlon\n")
        for r in fb:
            fh.write("\t".join("" if v is None else str(v) for v in
                               (r["t"].strftime("%Y-%m-%d %H:%M:%S"), r["energy"], r["impact_kt"], r["lat"], r["lon"])) + "\n")
    with open(OUT / "warned.tsv", "w") as fh:
        fh.write("designation\timpact_utc\tlat\tlon\theld_h\tconfirmed\tH_list\tin_sensor_record\n")
        for w in warned:
            fh.write("\t".join(str(v) for v in (w["des"], w["t"].strftime("%Y-%m-%d %H:%M"), w["lat"], w["lon"],
                                                w["held_h"], w["confirmed"], w["H_list"], bool(w["match"]))) + "\n")
    with open(OUT / "results.json", "w") as fh:
        json.dump(res, fh, indent=1)
    print(json.dumps({k: res[k] for k in ("all", "size", "era", "overlap", "predictions")}, indent=1))


if __name__ == "__main__":
    main(*sys.argv[1:4])
