"""raw/ -> data.json. Joins each close approach within one lunar distance (JPL CAD) to the first
observation of its object (JPL SBDB), classes it, and checks the hand-kept impact list against both.
Run after fetch.py: python3 build_data.py"""
import datetime as dt, json, re, statistics
LD_KM, AU_KM, RE_KM, GEO_KM = 384400.0, 149597870.7, 6371.0, 42164.0
FETCH = dt.date.fromisoformat(json.load(open("raw-manifest.json"))["files"]["raw/cad_1ld.json"]["fetched_utc"][:10])
MON = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}
def cadrows(p):
    d = json.load(open(p)); return [dict(zip(d["fields"], r)) for r in d["data"]]
def cdate(s):  # "2026-Oct-09 15:43"
    day, hm = s.split(); y, m, d = day.split("-")
    return dt.datetime(int(y), MON[m], int(d), *map(int, hm.split(":")))
neo = json.load(open("raw/neo_obs.json")); first = {r[0]: r for r in neo["data"]}
def cls(a, f):
    if a.date() > FETCH: return "ahead"           # computed passage still to come
    return "after" if f > a.date() else ("day" if f == a.date() else "before")
rows, lags, dminre = [], [], []
for r in cadrows("raw/cad_1ld.json"):
    a = cdate(r["cd"]); n = first[r["des"]]; f = dt.date.fromisoformat(n[2]); k = cls(a, f)
    au = lambda x: float(r[x]) * AU_KM
    if k == "after": lags.append((f - a.date()).days)
    if au("dist_min") < RE_KM: dminre.append({"des": r["des"], "when": a.isoformat(timespec="minutes"), "dist_km": round(au("dist")),
                                              "dist_min_km": round(au("dist_min")), "dist_max_km": round(au("dist_max")), "first_obs": n[2], "class": k})
    rows.append([r["des"], a.isoformat(timespec="minutes"), round(au("dist") / LD_KM, 5), round(au("dist_min") / LD_KM, 5),
                 round(au("dist_max") / LD_KM, 5), round(float(r["v_rel"]), 2), float(r["h"]) if r["h"] else None, n[2], k])
rows.sort(key=lambda x: x[1])
past = [x for x in rows if x[8] != "ahead"]
C = lambda xs, k: sum(1 for x in xs if x[8] == k)
since = [x for x in past if x[1] >= "1990"]
# the record's own line, 0.05 au, counted the same way (past only)
c005 = {"after": 0, "day": 0, "before": 0}
for r in cadrows("raw/cad_005.json"):
    a = cdate(r["cd"])
    if a.date() > FETCH: continue
    c005[cls(a, dt.date.fromisoformat(first[r["des"]][2]))] += 1
# the hand-kept list of impacts seen before they struck
wt = open("raw/impacts.wikitext", encoding="utf-8").read()
imp = []
for m in re.finditer(r"^\| (\d{4}-\d\d-\d\d \d\d:\d\d) *\|\| (\d{4}-\d\d-\d\d) \|\| (?:\{\{mpl\|(\d{4} [A-Z]{2})\|(\d+)\}\}|\[\[(\d{4} [A-Z]{2}\d*)\]\])", wt, re.M):
    des = m.group(5) or (m.group(3) + m.group(4))
    cols = wt[m.start():wt.find("\n", m.start())].split("||")
    loc = re.sub(r"<br ?/>", " ", re.sub(r"^\s*align=\"?center\"?\s*\|", "", cols[11])) if len(cols) > 11 else ""
    loc = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", loc).strip().rstrip(",")
    imp.append({"des": des, "place": loc, "impact_utc": m.group(1), "found": m.group(2), "in_neo_catalogue": des in first,
                "rows_in_close_approach_record_1ld": sum(1 for x in rows if x[0] == des)})
r005 = cadrows("raw/cad_005.json")
for i in imp:
    t = dt.datetime.fromisoformat(i["impact_utc"])
    own = [x for x in r005 if x["des"] == i["des"]]
    i["earlier_rows_005au"] = [[cdate(x["cd"]).isoformat(timespec="minutes"), round(float(x["dist"]) * AU_KM)] for x in own]
    i["rows_within_3_days_of_impact"] = sum(1 for x in own if abs((cdate(x["cd"]) - t).total_seconds()) < 3 * 86400)
closest_unseen = min((x for x in past if x[8] == "after"), key=lambda x: x[2])
longest = max((x for x in past if x[8] == "after"), key=lambda x: (dt.date.fromisoformat(x[7]) - dt.date.fromisoformat(x[1][:10])).days)
S = {"fetched": FETCH.isoformat(), "rows": len(rows), "past": len(past), "ahead": C(rows, "ahead"),
     "after": C(past, "after"), "day": C(past, "day"), "before": C(past, "before"),
     "since1990": {"n": len(since), "after": C(since, "after"), "day": C(since, "day"), "before": C(since, "before")},
     "pre1990": {"n": len(past) - len(since), "after": C(past, "after") - C(since, "after")},
     "lag_days": {"median": statistics.median(lags), "le1": sum(l <= 1 for l in lags), "le7": sum(l <= 7 for l in lags), "gt365": sum(l > 365 for l in lags)},
     "closest_unseen": {"des": closest_unseen[0], "when": closest_unseen[1], "km": round(closest_unseen[2] * LD_KM), "first_obs": closest_unseen[7]},
     "longest_lag": {"des": longest[0], "when": longest[1], "first_obs": longest[7]},
     "objects": len({x[0] for x in rows}), "line_005au": c005, "dist_min_inside_earth": dminre,
     "impacts": imp, "impacts_with_a_row_for_their_day": sum(1 for i in imp if i["rows_within_3_days_of_impact"]),
     "impacts_with_earlier_rows": sum(1 for i in imp if i["earlier_rows_005au"])}
json.dump({"summary": S, "const": {"LD_KM": LD_KM, "RE_KM": RE_KM, "GEO_KM": GEO_KM},
           "fields": ["des", "utc", "dist_ld", "dist_min_ld", "dist_max_ld", "v_rel_kms", "H", "first_obs", "class"], "rows": rows},
          open("data.json", "w"), separators=(",", ":"))
print(json.dumps(S, indent=1))
