"""Joins the Field's study-7 events (pinned commit) with the dated sources in research.json and their
checks in verification.json. Writes data.json. Run: python3 -I build_data.py"""
import json, csv, io, urllib.request, statistics, datetime as dt
FIELD = "https://raw.githubusercontent.com/frankbueltge/field-research/580708b7b367edbf55f63cbfa0a8153124a26df2/artifacts/2026-10-10-who-keeps-the-close-calls/data/"
get = lambda f: urllib.request.urlopen(FIELD + f, timeout=60).read().decode()
events = [e for e in json.loads(get("events.json")) if e["in_window"]]
entries = list(csv.DictReader(io.StringIO(get("entries.tsv")), delimiter="\t"))
R = {r["event"]: r for r in json.load(open("research.json"))}
V = json.load(open("verification.json"))
OKV = ("quote found", "quote found (opening)")
COPIES = json.load(open("overrides.json"))["_copies"]
O = {k: v for k, v in json.load(open("overrides.json")).items() if not k.startswith("_")}

def frac(s, floor=None):
    """Date string -> fractional year at the START of the stated period (YYYY, YYYY-MM or YYYY-MM-DD)."""
    p = [int(x) for x in s[:10].split("-")]
    d = dt.date(p[0], p[1] if len(p) > 1 else 1, p[2] if len(p) > 2 else 1)
    y = d.year + (d.toordinal() - dt.date(d.year, 1, 1).toordinal()) / 365.25
    return max(y, floor) if floor is not None else y

def lagtext(days):
    if days < 1: return "the same day"
    if days < 60: return f"{round(days)} days"
    if days < 730: return f"{round(days / 30.44)} months"
    return f"{round(days / 365.25)} years"

out = []
for e in events:
    dates = sorted(x["date"] for x in entries if x["event"] == e["event"] and x["date"][:4].isdigit())
    when = dates[0] if dates else str(e["year"])
    yh = frac(when)
    r, v = R.get(e["event"], {}), V.get(e["event"], {})
    occ, nm = r.get("occurrence_public"), r.get("nearmiss_public")
    for s, k in ((occ, "occurrence_public"), (nm, "nearmiss_public")):
        if s: s["check"] = "checked: " + v.get(k, "not run") if v.get(k) in OKV else "not checked: " + v.get(k, "no source")
    o = O.get(e["event"], {})
    for s in (occ, nm):
        for pre, rep in COPIES.items():
            if s and (s.get("url") or "").startswith(pre):
                s["url"] = rep; s["check"] += " (against a full-text copy, not linked; the link is a catalogue search)"
    nm_ok = bool(nm and nm.get("date") and v.get("nearmiss_public") in OKV and not o.get("exclude"))
    if o.get("exclude") and nm: nm["check"] = "set aside: " + o["exclude"]
    occ_ok = bool(occ and occ.get("date") and v.get("occurrence_public") in OKV)
    rec = {"event": e["event"], "when": when, "y_hap": round(yh, 4), "label": list(e["labels"].values())[0],
           "occurrence": e["occurrence"], "keepers": e["keepers"], "occ": occ, "nm": nm, "note": r.get("note", ""), "ok": nm_ok}
    if nm_ok:
        yn = frac(nm["date"], yh)
        yo = min(frac(occ["date"], yh), yn) if occ_ok else yn
        rec.update(y_nm=round(yn, 4), y_occ=round(yo, 4), lag_days=round((yn - yh) * 365.25, 1), occ_checked=occ_ok)
        coarse = len(nm["date"]) < 10 or len(when) < 10
        rec["lag_text"] = "within the year" if coarse and rec["lag_days"] < 365.25 else lagtext(rec["lag_days"])
    out.append(rec)

ok = [x for x in out if x["ok"]]
lags = sorted(x["lag_days"] / 365.25 for x in ok)
ast = json.load(open("../2026-10-10-after-it-passed/data.json"))
alags = []
for row in ast["rows"]:
    if row[8] == "after":
        a, f = dt.date.fromisoformat(row[1][:10]), dt.date.fromisoformat(row[7])
        alags.append((f - a).days)
summary = {"events": len(out), "dated_checked": len(ok), "unchecked": len(out) - len(ok),
           "lag_median_years": round(statistics.median(lags)) if lags else None,
           "lag_years_quartiles": [round(q, 1) for q in statistics.quantiles(lags, n=4)] if len(lags) > 3 else None,
           "within_a_year": sum(l < 1 for l in lags), "ten_years_or_more": sum(l >= 10 for l in lags),
           "after_1991": sum(x["y_nm"] >= 1992 for x in ok),
           "occ_same_year": sum(x["occ_checked"] and x["y_occ"] - x["y_hap"] < 1 for x in ok),
           "sagan_1993": sum("Sagan" in (x["nm"].get("source") or "") and x["nm"]["date"].startswith("1993") for x in ok),
           "asteroid_late_n": len(alags), "asteroid_lag_median_days": statistics.median(alags)}
json.dump({"summary": summary, "events": out, "asteroid_lags_days": alags}, open("data.core.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(summary, indent=1))
