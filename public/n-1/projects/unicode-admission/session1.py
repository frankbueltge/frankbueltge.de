"""Session 1: the order of admission. Usage: python3 -I session1.py SRCDIR  (writes session1.json)
Reads DerivedAge.txt, Scripts.txt, PropertyValueAliases.txt, supplementalData.xml, likelySubtags.xml from SRCDIR."""
import sys, re, json, os, collections
import xml.etree.ElementTree as ET
src = sys.argv[1]
# release years: the 'Year' column of https://www.unicode.org/versions/enumeratedversions.html, fetched 2026-10-09 (enumeratedversions.html)
YEAR = {"1.1":1993,"2.0":1996,"2.1":1998,"3.0":1999,"3.1":2001,"3.2":2002,"4.0":2003,"4.1":2005,"5.0":2006,"5.1":2008,"5.2":2009,
        "6.0":2010,"6.1":2012,"6.2":2012,"6.3":2013,"7.0":2014,"8.0":2015,"9.0":2016,"10.0":2017,"11.0":2018,"12.0":2019,"12.1":2019,
        "13.0":2020,"14.0":2021,"15.0":2022,"15.1":2023,"16.0":2024,"17.0":2025,"18.0":2026}
def ranges(path):
    for line in open(path, encoding="utf8"):
        line = line.split("#")[0].strip()
        if not line: continue
        cp, val = [x.strip() for x in line.split(";")[:2]]
        a, _, b = cp.partition("..")
        yield int(a, 16), int(b or a, 16), val
age = {}
for a, b, v in ranges(os.path.join(src, "DerivedAge.txt")):
    for c in range(a, b+1): age[c] = v
scr = {}
for a, b, v in ranges(os.path.join(src, "Scripts.txt")):
    for c in range(a, b+1): scr[c] = v
assigned = [c for c in age if c in scr and scr[c] != "Unknown"]
unk = [c for c in age if scr.get(c, "Unknown") == "Unknown"]
# short codes: PropertyValueAliases 'sc ; Latn ; Latin'
code = {}
for line in open(os.path.join(src, "PropertyValueAliases.txt"), encoding="utf8"):
    line = line.split("#")[0].strip()
    p = [x.strip() for x in line.split(";")]
    if p and p[0] == "sc" and len(p) >= 3: code[p[2]] = p[1]
EXCL = {"Common", "Inherited", "Unknown"}
by = collections.defaultdict(list)
for c in assigned: by[scr[c]].append(age[c])
rows = []
for s, vs in by.items():
    cnt = collections.Counter(vs); n = len(vs)
    yrs = sorted(YEAR[v] for v in cnt)
    first, last = min(YEAR[v] for v in cnt), max(YEAR[v] for v in cnt)
    top_v, top_n = cnt.most_common(1)[0]
    firstv = min(cnt, key=lambda v: (YEAR[v], tuple(map(int, v.split(".")))))
    rows.append({"script": s, "code": code.get(s), "n": n, "first_release": firstv, "first_year": first, "last_year": last, "span_years": last-first,
                 "releases": len(cnt), "top_release_share": round(top_n/n, 4), "first_release_share": round(cnt[firstv]/n, 4),
                 "by_year": dict(sorted(collections.Counter(YEAR[v] for v in vs).items()))})
big = [r for r in rows if r["n"] >= 50 and r["script"] not in EXCL]
out = {"total_assigned_in_18_0": len(age), "assigned_with_script_not_unknown": len(assigned), "assigned_script_unknown": len(unk),
       "scripts_total": len(rows), "scripts_ge50_excluding_common_inherited": len(big)}
# P1
p1 = sum(1 for r in big if r["top_release_share"] >= 0.9)
out["P1"] = {"scripts": len(big), "whole_entry_ge90pct_one_release": p1, "share": round(p1/len(big), 4), "threshold": 0.6}
# P2
bs = sorted(big, key=lambda r: -r["span_years"])
maxspan = max(r["span_years"] for r in big)
out["P2_ties"] = {"max_span": maxspan, "scripts_at_max_span": sum(1 for r in big if r["span_years"] == maxspan),
                  "han_span": next(r["span_years"] for r in big if r["script"] == "Han"), "han_releases": next(r["releases"] for r in big if r["script"] == "Han")}
out["P2"] = {"top5_by_span": [(r["script"], r["span_years"], r["first_year"], r["last_year"], r["n"]) for r in bs[:8]],
             "latin_rank": next(i+1 for i, r in enumerate(bs) if r["script"] == "Latin"), "han_rank": next(i+1 for i, r in enumerate(bs) if r["script"] == "Han")}
# P4 (interpretation fixed before the run: scripts first assigned 2010..2019, >=50 cps; 'only release' = no assignment in any later release year before 2020)
c4 = [r for r in big if 2010 <= r["first_year"] <= 2019]
only = [r for r in c4 if all(y == r["first_year"] or y >= 2020 for y in map(int, r["by_year"]))]
out["P4"] = {"scripts_first_2010_2019": len(c4), "untouched_until_2020": len(only), "share": round(len(only)/len(c4), 4) if c4 else None,
             "list": [(r["script"], r["first_year"], list(r["by_year"].items())) for r in c4]}
# population side (CLDR modelled; estimate)
sd = ET.parse(os.path.join(src, "supplementalData.xml")).getroot()
ls = ET.parse(os.path.join(src, "likelySubtags.xml")).getroot()
likely = {e.get("from"): e.get("to") for e in ls.iter("likelySubtag")}
def script_of(lang):
    m = re.match(r"^([a-z]{2,3})(?:_([A-Z][a-z]{3}))?", lang)
    if not m: return None
    if m.group(2): return m.group(2)
    t = likely.get(m.group(1))
    if t:
        parts = t.split("_")
        if len(parts) >= 2 and len(parts[1]) == 4: return parts[1]
    return None
w = collections.Counter(); miss = collections.Counter(); tot = 0.0
for t in sd.iter("territory"):
    pop = t.get("population")
    if not pop: continue
    pop = float(pop)
    for lp in t.iter("languagePopulation"):
        wt = pop*float(lp.get("populationPercent", "0"))/100
        sc = script_of(lp.get("type"))
        tot += wt
        if sc is None: miss[lp.get("type")] += wt
        else: w[sc] += wt
short2long = {v: k for k, v in code.items()}
firstyear_by_code = {r["code"]: r for r in rows}
COMP = {"Hans": "Hani", "Hant": "Hani", "Jpan": "Hani", "Kore": "Hang"}  # composite -> the UCD script whose first year is used (Jpan also Hira, Kana: all 1993)
for k, v in COMP.items(): firstyear_by_code[k] = firstyear_by_code[v]
known = sum(w.values())
pre = sum(v for k, v in w.items() if k in firstyear_by_code and firstyear_by_code[k]["first_year"] <= 1996)
out["P3_run1_note"] = "run 1 left Hans/Hant/Jpan/Kore unresolved (0.8083 lower bound); run 2 maps them via COMP (composite codes absent from Scripts.txt)"
out["P3"] = {"total_weight_billions": round(tot/1e9, 3), "script_unresolved_share": round(sum(miss.values())/tot, 4),
             "share_of_resolved_weight_first_assigned_le_1996": round(pre/known, 4), "threshold": 0.8,
             "resolved_scripts_not_in_ucd": {k: round(v/1e6, 2) for k, v in w.items() if k not in firstyear_by_code}}
# table of weight by script with first year and share arrived in first release
tab = []
for k, v in sorted(w.items(), key=lambda kv: -kv[1])[:25]:
    r = firstyear_by_code.get(k)
    tab.append({"code": k, "script": r["script"] if r else None, "weight_millions": round(v/1e6, 1), "first_year": r["first_year"] if r else None,
                "n_cps": r["n"] if r else None, "first_release_share": r["first_release_share"] if r else None})
out["top_scripts_by_modelled_weight"] = tab
# EXPLORATORY (not registered): year by which 50 % and 90 % of each script's present code points had been assigned
def cum_year(r, q):
    t = 0
    for y, n in r["by_year"].items():
        t += n
        if t >= q*r["n"]: return int(y)
for r in rows: r["year50"] = cum_year(r, .5); r["year90"] = cum_year(r, .9); r["share_by_1996"] = round(sum(n for y, n in r["by_year"].items() if int(y) <= 1996)/r["n"], 4)
rowd = {r["script"]: r for r in rows}
ex = []
for k, v in sorted(w.items(), key=lambda kv: -kv[1])[:20]:
    r = firstyear_by_code.get(k)
    ex.append({"code": k, "ucd_script": r["script"], "weight_millions": round(v/1e6, 1), "n": r["n"], "year50": r["year50"], "year90": r["year90"], "share_by_1996": r["share_by_1996"]})
out["exploratory_top20_weight"] = ex
# composition of each release year: what the code points are
first_year_of = {r["script"]: r["first_year"] for r in rows}
comp = collections.defaultdict(lambda: collections.Counter())
for c in age:
    y = YEAR[age[c]]; s_ = scr.get(c)
    if s_ is None: comp[y]["unscripted (private use, surrogates, noncharacters, controls without script)"] += 1
    elif s_ in ("Common", "Inherited"): comp[y]["Common/Inherited"] += 1
    elif s_ == "Han": comp[y]["Han"] += 1
    elif first_year_of[s_] == y: comp[y]["scripts new this year"] += 1
    else: comp[y]["additions to scripts already present"] += 1
out["composition_by_year"] = {str(y): dict(c) for y, c in sorted(comp.items())}
# EXPLORATORY 2: which scripts carry modelled population at all, and when each of those first appeared
wscripts = {firstyear_by_code[k]["script"] for k in w if k in firstyear_by_code}
cp_w = sum(r["n"] for r in big if r["script"] in wscripts); cp_nw = sum(r["n"] for r in big if r["script"] not in wscripts)
late = []
for k, v in w.items():
    r = firstyear_by_code.get(k)
    if r and r["first_year"] > 1993 and k not in COMP: late.append((k, r["script"], r["first_year"], round(v/1e6, 1)))
late.sort(key=lambda x: (x[2], -x[3]))
out["exploratory2"] = {"ucd_scripts_ge50_with_modelled_weight": len(wscripts & {r["script"] for r in big}), "ucd_scripts_ge50_without": len(big) - len(wscripts & {r["script"] for r in big}),
  "code_points_in_scripts_with_weight": cp_w, "code_points_in_scripts_without_weight": cp_nw, "share_weighted_scripts_first_year_after_1993": round(sum(v for k, v in w.items() if firstyear_by_code.get(k) and firstyear_by_code[k]["first_year"] > 1993)/known, 4),
  "weight_millions_first_after_1993": round(sum(v for k, v in w.items() if firstyear_by_code.get(k) and firstyear_by_code[k]["first_year"] > 1993)/1e6, 1), "late_scripts_with_weight": late}
# cumulative share curves for the figure: top-20 weight scripts + a few
curves = {}
yrs_all = sorted(set(YEAR.values()))
for k in [x["code"] for x in ex]:
    r = firstyear_by_code[k]
    if r["script"] in curves: continue
    t = 0; cur = {}
    for y in yrs_all:
        t += r["by_year"].get(y, 0); cur[y] = round(t/r["n"], 4)
    curves[r["script"]] = {"n": r["n"], "curve": cur}
out["curves"] = curves
out["rows_ge50"] = sorted(big, key=lambda r: (r["first_year"], r["script"]))
# per-year totals (all scripts) and by Common
yr = collections.Counter(YEAR[age[c]] for c in age)
out["assigned_per_release_year"] = dict(sorted(yr.items()))
json.dump(out, open("session1.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: out[k] for k in ["total_assigned_in_18_0","scripts_total","scripts_ge50_excluding_common_inherited","P1","P2","P3"]}, indent=1))
print(json.dumps(out["P4"], indent=0)[:1500]); print(json.dumps(tab[:14]))
