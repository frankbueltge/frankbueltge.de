"""Session 2: when a language is complete. Usage: python3 -I session2.py UCDDIR CLDRDIR  (writes session2.json)
UCDDIR holds DerivedAge.txt, Scripts.txt, PropertyValueAliases.txt (UCD 18.0, as fetched in session 1);
CLDRDIR is the extracted cldr-common-48.2.zip (common/main/*.xml, common/supplemental/*.xml)."""
import sys, os, re, json, collections, unicodedata
import xml.etree.ElementTree as ET
ucd, cldr = sys.argv[1], sys.argv[2]
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
for a, b, v in ranges(os.path.join(ucd, "DerivedAge.txt")):
    for c in range(a, b+1): age[c] = YEAR[v]
scr = {}
for a, b, v in ranges(os.path.join(ucd, "Scripts.txt")):
    for c in range(a, b+1): scr[c] = v
# script first year (as in session 1: scripts with assigned code points, script != Unknown)
first = {}
for c, s in scr.items():
    if c in age and s != "Unknown": first[s] = min(first.get(s, 9999), age[c])
code = {}
for line in open(os.path.join(ucd, "PropertyValueAliases.txt"), encoding="utf8"):
    p = [x.strip() for x in line.split("#")[0].strip().split(";")]
    if p and p[0] == "sc" and len(p) >= 3: code[p[1]] = p[2]
COMP = {"Hans": "Han", "Hant": "Han", "Jpan": "Han", "Kore": "Hangul", "Hanb": "Han"}
def script_first(c4):
    name = COMP.get(c4) or code.get(c4)
    return first.get(name), name
# ---- UnicodeSet subset parser
ESC = re.compile(r"\\u\{([0-9A-Fa-f ]+)\}|\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})|\\x\{([0-9A-Fa-f]+)\}|\\x([0-9A-Fa-f]{2})|\\(.)", re.S)
def parse_set(s):
    s = s.strip()
    assert s.startswith("[") and s.endswith("]"), s[:30]
    s = s[1:-1]
    cps, bad = set(), []
    i = 0; items = []  # items: ('c', cp) or ('seq', [cp...]) or ('-',)
    while i < len(s):
        ch = s[i]
        if ch.isspace(): i += 1; continue
        if ch == "{":
            j = s.index("}", i); inner = s[i+1:j]
            seq = []
            for m in ESC.finditer(inner):
                pass
            k = 0
            while k < len(inner):
                m = ESC.match(inner, k)
                if m:
                    if m.group(1): seq += [int(x, 16) for x in m.group(1).split()]
                    elif m.group(2): seq.append(int(m.group(2), 16))
                    elif m.group(3): seq.append(int(m.group(3), 16))
                    elif m.group(4): seq.append(int(m.group(4), 16))
                    elif m.group(5): seq.append(int(m.group(5), 16))
                    else: seq.append(ord(m.group(6)))
                    k = m.end()
                else: seq.append(ord(inner[k])); k += 1
            items.append(("seq", seq)); i = j+1; continue
        if ch == "\\":
            m = ESC.match(s, i)
            if m:
                if m.group(1):
                    for x in m.group(1).split(): items.append(("c", int(x, 16)))
                elif m.group(2): items.append(("c", int(m.group(2), 16)))
                elif m.group(3): items.append(("c", int(m.group(3), 16)))
                elif m.group(4): items.append(("c", int(m.group(4), 16)))
                elif m.group(5): items.append(("c", int(m.group(5), 16)))
                else: items.append(("c", ord(m.group(6))))
                i = m.end(); continue
        if ch == "-" and items and items[-1][0] == "c": items.append(("-",)); i += 1; continue
        if ch in "[]:^" : bad.append(ch); i += 1; continue
        items.append(("c", ord(ch))); i += 1
    k = 0
    while k < len(items):
        it = items[k]
        if it[0] == "c" and k+2 < len(items)+0 and k+2 <= len(items)-1 and items[k+1][0] == "-" and items[k+2][0] == "c":
            for c in range(it[1], items[k+2][1]+1): cps.add(c)
            k += 3; continue
        if it[0] == "c": cps.add(it[1])
        elif it[0] == "seq": cps.update(it[1])
        k += 1
    return cps, bad
# ---- units
main = os.path.join(cldr, "common", "main")
ls = ET.parse(os.path.join(cldr, "common", "supplemental", "likelySubtags.xml")).getroot()
likely = {e.get("from"): e.get("to") for e in ls.iter("likelySubtag")}
units = {}; no_own = []; failed_chars = 0; total_chars = 0; unparsed = []
for fn in sorted(os.listdir(main)):
    m = re.match(r"^([a-z]{2,3})(?:_([A-Z][a-z]{3}))?\.xml$", fn)
    if not m: continue
    uid = fn[:-4]; lang, sc = m.group(1), m.group(2)
    root = ET.parse(os.path.join(main, fn)).getroot()
    ex = [e for e in root.iter("exemplarCharacters") if e.get("type") is None]
    if not ex: no_own.append(uid); continue
    if not sc:
        t = likely.get(lang, "").split("_")
        sc = t[1] if len(t) >= 2 and len(t[1]) == 4 else None
    try: cps, bad = parse_set(ex[0].text)
    except Exception as e: unparsed.append((uid, str(e)[:60])); continue
    total_chars += len(cps)
    miss = {c for c in cps if c not in age}
    failed_chars += len(miss) + len(bad)
    units[uid] = {"id": uid, "script_code": sc, "cps": cps, "missing": sorted(miss), "badtokens": bad}
# ---- measures
rows = []
for uid, u in units.items():
    cps = {c for c in u["cps"] if c in age}
    if not cps: continue
    nfc = max(age[c] for c in cps)
    nfd_cps = set()
    for c in cps: nfd_cps.update(ord(x) for x in unicodedata.normalize("NFD", chr(c)))
    nfd = max(age.get(c, 9999) for c in nfd_cps)
    if nfd == 9999: nfd = max(age[c] for c in nfd_cps if c in age)
    # EXPLORATORY (not registered): per character the earlier of "the precomposed code point" and "its canonical decomposition"
    def best_year(c):
        d = [ord(x) for x in unicodedata.normalize("NFD", chr(c))]
        return min(age[c], max(age.get(x, 0) for x in d)) if all(x in age for x in d) else age[c]
    best = max(best_year(c) for c in cps)
    sf, sname = script_first(u["script_code"]) if u["script_code"] else (None, None)
    bind = sorted(c for c in cps if age[c] == nfc)
    rows.append({"id": uid, "script": u["script_code"], "ucd_script": sname, "n_chars": len(cps), "complete_nfc": nfc, "complete_nfd": nfd, "complete_best": best,
                 "script_first": sf, "wait_nfc": (nfc - sf) if sf else None, "wait_nfd": (nfd - sf) if sf else None, "wait_best": (best - sf) if sf else None,
                 "binding_cps": ["U+%04X" % c for c in bind[:6]], "binding_n": len(bind)})
rowd = {r["id"]: r for r in rows}
usable = [r for r in rows if r["script_first"]]
out = {"parser": {"units_parsed": len(units), "files_without_own_main_set": len(no_own), "unparsed_files": unparsed, "chars_total": total_chars,
                  "chars_failed": failed_chars, "failed_share": round(failed_chars/total_chars, 5),
                  "units_with_missing": {u["id"]: u["missing"][:5] for u in units.values() if u["missing"]},
                  "units_with_bad_tokens": {u["id"]: u["badtokens"][:5] for u in units.values() if u["badtokens"]},
                  "host_unicodedata_version": unicodedata.unidata_version},
       "units_measured": len(rows), "units_with_script_first": len(usable)}
# predictions
n = len(usable)
p1 = sum(1 for r in usable if r["complete_nfc"] <= 1999)
p2 = sum(1 for r in usable if r["wait_nfc"] > 0)
p4n = sum(1 for r in usable if r["wait_nfd"] > 0)
out["P1"] = {"units": n, "complete_by_1999_nfc": p1, "share": round(p1/n, 4), "threshold": 0.7}
out["P2"] = {"units": n, "wait_gt0_nfc": p2, "share": round(p2/n, 4), "threshold": 0.10}
out["P4"] = {"wait_gt0_nfc": p2, "wait_gt0_nfd": p4n, "reduction": round(1-p4n/p2, 4) if p2 else None, "threshold": 1/3}
# EXPLORATORY
out["exploratory_best"] = {"wait_gt0": sum(1 for r in usable if r["wait_best"] > 0), "wait_ge5": sum(1 for r in usable if r["wait_best"] >= 5),
    "complete_by_1999": sum(1 for r in usable if r["complete_best"] <= 1999), "wait_best_hist": dict(sorted(collections.Counter(r["wait_best"] for r in usable).items()))}
# population
sd = ET.parse(os.path.join(cldr, "common", "supplemental", "supplementalData.xml")).getroot()
w = collections.Counter(); unm = collections.Counter(); tot = 0.0
for t in sd.iter("territory"):
    pop = t.get("population")
    if not pop: continue
    pop = float(pop)
    for lp in t.iter("languagePopulation"):
        wt = pop*float(lp.get("populationPercent", "0"))/100; typ = lp.get("type"); tot += wt
        m = re.match(r"^([a-z]{2,3})(?:_([A-Z][a-z]{3}))?", typ)
        lang, sc = m.group(1), m.group(2)
        key = None
        if typ in rowd and rowd[typ]["script_first"]: key = typ
        elif lang in rowd and rowd[lang]["script_first"]:
            lsc = rowd[lang]["script"]
            if sc is None or sc == lsc: key = lang
        if key: w[key] += wt
        else: unm[typ] += wt
covered = sum(w.values())
out["population"] = {"total_modelled_speakers_billions": round(tot/1e9, 3), "matched_share": round(covered/tot, 4), "unmatched_share": round(sum(unm.values())/tot, 4),
                     "top_unmatched_millions": {k: round(v/1e6, 1) for k, v in unm.most_common(15)}}
p3 = sum(v for k, v in w.items() if rowd[k]["complete_nfc"] <= 1999)
out["P3"] = {"weight_complete_by_1999_share_of_matched": round(p3/covered, 4), "threshold": 0.9}
wait5 = [r for r in usable if r["wait_nfc"] >= 5]
big3 = {"Latn", "Cyrl", "Arab"}
out["exploratory_weight"] = {"weight_wait_gt0_nfc_millions": round(sum(v for k, v in w.items() if rowd[k]["wait_nfc"] > 0)/1e6, 1),
    "weight_wait_gt0_best_millions": round(sum(v for k, v in w.items() if rowd[k]["wait_best"] > 0)/1e6, 1), "matched_millions": round(covered/1e6, 1),
    "weight_complete_after_1999_nfc_millions": round(sum(v for k, v in w.items() if rowd[k]["complete_nfc"] > 1999)/1e6, 1),
    "weight_complete_after_1999_best_millions": round(sum(v for k, v in w.items() if rowd[k]["complete_best"] > 1999)/1e6, 1),
    "top_late_by_weight_nfc": [(k, rowd[k]["script"], rowd[k]["script_first"], rowd[k]["complete_nfc"], rowd[k]["complete_best"], round(v/1e6, 1)) for k, v in sorted(w.items(), key=lambda kv: -kv[1]) if rowd[k]["complete_nfc"] > 1999][:12]}
out["P5"] = {"units_wait_ge5": len(wait5), "in_other_than_latn_cyrl_arab": sum(1 for r in wait5 if r["script"] not in big3),
             "scripts_of_wait_ge5": dict(collections.Counter(r["script"] for r in wait5).most_common())}
# curves: weighted by year
yrs = sorted(set(YEAR.values()))
cur = {}
for y in yrs:
    cur[y] = {"script_present": round(sum(v for k, v in w.items() if rowd[k]["script_first"] <= y)/covered, 4),
              "complete_nfd": round(sum(v for k, v in w.items() if rowd[k]["complete_nfd"] <= y)/covered, 4),
              "complete_nfc": round(sum(v for k, v in w.items() if rowd[k]["complete_nfc"] <= y)/covered, 4),
              "complete_best": round(sum(v for k, v in w.items() if rowd[k]["complete_best"] <= y)/covered, 4),
              "units_complete_nfc": round(sum(1 for r in usable if r["complete_nfc"] <= y)/n, 4),
              "units_script_present": round(sum(1 for r in usable if r["script_first"] <= y)/n, 4)}
out["curves_by_year"] = cur
# distributions
out["complete_year_hist_nfc"] = dict(sorted(collections.Counter(r["complete_nfc"] for r in usable).items()))
out["wait_hist_nfc"] = dict(sorted(collections.Counter(r["wait_nfc"] for r in usable).items()))
bys = collections.defaultdict(list)
for r in usable: bys[r["script"]].append(r)
out["by_script"] = {s: {"units": len(v), "first": v[0]["script_first"], "complete_nfc_years": dict(sorted(collections.Counter(r["complete_nfc"] for r in v).items())),
                        "weight_millions": round(sum(w.get(r["id"], 0) for r in v)/1e6, 1)} for s, v in sorted(bys.items(), key=lambda kv: -len(kv[1]))}
out["rows"] = sorted(usable, key=lambda r: (-r["wait_nfc"], r["id"]))
for r in out["rows"]: r["weight_millions"] = round(w.get(r["id"], 0)/1e6, 2)
json.dump(out, open("session2.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: out[k] for k in ["exploratory_best", "exploratory_weight", "parser", "units_measured", "units_with_script_first", "P1", "P2", "P3", "P4", "P5", "population"]}, indent=1, ensure_ascii=False)[:4500])
# specimens: for the page, each unit's main-set code points with release year (aggregates of CLDR's own lists; Unicode License v3)
spec = {r["id"]: {"s": r["script"], "f": r["script_first"], "w": r["weight_millions"], "c": [[c, age[c]] for c in sorted(units[r["id"]]["cps"]) if c in age]} for r in out["rows"]}
json.dump(spec, open("session2_specimens.json", "w"), ensure_ascii=False, separators=(",", ":"))
