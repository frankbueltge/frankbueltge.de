"""Session 3: when was the last letter asked for? Usage:
python3 -I session3.py REGDIR DOCDIR UnicodeData.txt  (writes session3.json next to this file)
REGDIR holds Register-<year>.html saved as R<year>.html (1993-2021); DOCDIR caches fetched documents.
Method and predictions: SESSION3.md (committed before this script was run)."""
import sys, os, re, json, html, subprocess, statistics, urllib.request, collections
REG, DOC, UD = sys.argv[1], sys.argv[2], sys.argv[3]
# optional 4th argument: a JSON list of [document number, code point] pairs read by eye and found to name another character
# (verification pass, exploratory; the registered run is the one without it)
EXCLUDE = {tuple(x) for x in json.load(open(sys.argv[4]))} if len(sys.argv) > 4 else set()
OUTNAME = "session3_verified.json" if EXCLUDE else "session3.json"
HERE = os.path.dirname(os.path.abspath(__file__))
s2 = json.load(open(os.path.join(HERE, "session2.json")))
names = {}
for line in open(UD, encoding="utf8"):
    f = line.split(";")
    names[int(f[0], 16)] = f[1]

ALIAS = {"Arabic": "arabic|kashmiri|pashto|persian|farsi|azerbaijani|luri|malay|jawi|saraiki|khowar|uzbek",
         "Bengali": "bengali|bangla", "Cherokee": "cherokee", "Coptic": "coptic",
         "Cyrillic": "cyrillic|abkhaz|abkhazian|chechen|church slavonic|old church slavonic",
         "Devanagari": "devanagari|sindhi", "Ethiopic": "ethiopic|ethiopian|ge'ez|geez", "Kannada": "kannada",
         "Latin": "latin|bassa|ngomba", "Myanmar": "myanmar|burmese|shan", "Oriya": "oriya|odia",
         "Telugu": "telugu|kui|kuvi", "Tibetan": "tibetan", "Adlam": "adlam", "Deseret": "deseret"}
CAP = 60

def strip(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def pdate(s, year):
    s = s.strip()
    m = re.match(r"(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m: return "%s-%02d-%02d" % (m.group(1), int(m.group(2)), int(m.group(3)))
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{2,4})", s)
    if m:
        y = int(m.group(3)); y = y + 1900 if y < 100 else y
        return "%d-%02d-%02d" % (y, int(m.group(1)), int(m.group(2)))
    return None

# 1. register rows
rows = []
for year in range(1993, 2022):
    t = open(os.path.join(REG, "R%d.html" % year), encoding="utf8", errors="replace").read()
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S | re.I):
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S | re.I)
        if len(tds) < 4: continue
        num = strip(tds[0])
        if not re.search(r"\d{2}-\d{3}", num): continue
        href = re.search(r'href="([^"]+)"', tds[0])
        url = None
        if href:
            h = href.group(1)
            url = h if h.startswith("http") else "https://www.unicode.org/L2/L%d/%s" % (year, h)
        date = pdate(strip(tds[3]), year) or pdate(strip(tds[2]), year)
        rows.append({"num": num, "title": strip(tds[1]), "date": date or "%d-00-00" % year, "date_parsed": bool(date),
                     "reg_year": year, "url": url})
print("register rows", len(rows), "with link", sum(1 for r in rows if r["url"]), "date unparsed", sum(1 for r in rows if not r["date_parsed"]))

# 2. events (as in SESSION3.md)
units = [u for u in s2["rows"] if (u["wait_best"] or 0) > 0]
ev = collections.OrderedDict()
for u in units:
    ev.setdefault((u["ucd_script"], u["complete_best"], tuple(u["binding_cps"])), []).append(u)
print("units", len(units), "events", len(ev))

# 3. candidates per script, earliest first, cap 60 (cap over the widest window the script's events need)
def text_of(r):
    if not r["url"]: return None, "no link"
    fn = os.path.join(DOC, re.sub(r"[^A-Za-z0-9.]+", "_", r["num"]) + "_" + os.path.basename(r["url"])[:60])
    if not os.path.exists(fn):
        try:
            req = urllib.request.Request(r["url"], headers={"User-Agent": "Mozilla/5.0"})
            data = urllib.request.urlopen(req, timeout=60).read()
            open(fn, "wb").write(data)
        except Exception as e:
            return None, "fetch failed: %s" % type(e).__name__
    data = open(fn, "rb").read()
    if data[:4] == b"%PDF":
        try:
            out = subprocess.run(["pdftotext", "-q", fn, "-"], capture_output=True, timeout=120).stdout.decode("utf8", "replace")
        except Exception as e:
            return None, "pdftotext failed"
    else:
        out = strip(data.decode("utf8", "replace"))
    if len(out.strip()) < 50: return None, "no text (scan?)"
    return out, "ok"

scripts = sorted({k[0] for k in ev})
cand, texts, status = {}, {}, {}
for sc in scripts:
    last = max(k[1] for k in ev if k[0] == sc)
    pat = re.compile(r"\b(" + ALIAS[sc] + r")\b", re.I)
    c = sorted([r for r in rows if pat.search(r["title"]) and r["reg_year"] <= last], key=lambda r: (r["date"], r["num"]))
    cand[sc] = {"n_candidates": len(c), "read": c[:CAP]}
    for r in c[:CAP]:
        if r["num"] not in texts:
            texts[r["num"]], status[r["num"]] = text_of(r)
    print(sc, "candidates", len(c), "read", len(c[:CAP]), "ok", sum(1 for r in c[:CAP] if status[r["num"]] == "ok"))

def norm(s): return re.sub(r"\s+", " ", s).upper()

# 4. hits
out_events = []
for (sc, yr, cps), us in ev.items():
    keys = []
    for cp in cps:
        n = int(cp[2:], 16)
        keys.append(("cp", re.compile(r"U\+0*%X\b" % n, re.I)))
        keys.append(("name", names[n]))
    first = None
    for r in cand[sc]["read"]:
        if r["reg_year"] > yr: continue
        t = texts.get(r["num"])
        if not t: continue
        T = norm(t)
        for kind, k in keys:
            if kind == "cp" and (r["num"], "U+" + k.pattern.split("0*")[1].split("\\")[0].zfill(4)) in EXCLUDE: continue
            hit = k.search(t) if kind == "cp" else (k in T)
            if hit:
                first = {"num": r["num"], "title": r["title"], "date": r["date"], "url": r["url"], "matched": kind,
                         "key": k.pattern if kind == "cp" else k}
                break
        if first: break
    window = [r for r in cand[sc]["read"] if r["reg_year"] <= yr]
    e = {"script": sc, "complete": yr, "binding_cps": list(cps), "units": [u["id"] for u in us],
         "script_first": us[0]["script_first"], "candidates_in_window": len([r for r in rows if r["reg_year"] <= yr and re.search(r"\b(" + ALIAS[sc] + r")\b", r["title"], re.I)]),
         "read_in_window": len(window), "unreadable_in_window": sum(1 for r in window if status[r["num"]] != "ok"),
         "earliest_three": [(r["num"], r["date"], r["title"]) for r in window[:3]], "first_asking": first}
    if first:
        ay = int(first["date"][:4])
        e["before_asking"] = ay - e["script_first"]; e["after_asking"] = yr - ay
    out_events.append(e)

hits = [e for e in out_events if e["first_asking"]]
res = {"register_rows": len(rows), "rows_with_link": sum(1 for r in rows if r["url"]), "events": len(out_events),
       "status_counts": collections.Counter(status.values()), "candidates": {k: v["n_candidates"] for k, v in cand.items()}}
res["P1"] = {"hits": len(hits), "share": round(len(hits) / len(out_events), 3), "held": len(hits) / len(out_events) >= 0.6}
aa = [e["after_asking"] for e in hits]
res["P2"] = {"after_asking": aa, "median": statistics.median(aa) if aa else None, "held": bool(aa) and statistics.median(aa) <= 2}
p3 = []
for e in hits:
    for u in e["units"]:
        w = next(x for x in units if x["id"] == u)
        if w["wait_best"] >= 10: p3.append((u, e["before_asking"], e["after_asking"]))
res["P3"] = {"units": p3, "before_gt_after": sum(1 for _, b, a in p3 if b > a),
             "held": bool(p3) and sum(1 for _, b, a in p3 if b > a) > len(p3) / 2}
bn = next(e for e in out_events if "bn" in e["units"])
res["P4"] = {"first_asking": bn["first_asking"], "held": bool(bn["first_asking"]) and int(bn["first_asking"]["date"][:4]) <= 2003}
res["events_detail"] = out_events
res["candidates_read"] = {sc: [{"num": r["num"], "date": r["date"], "title": r["title"], "url": r["url"], "status": status[r["num"]]}
                               for r in v["read"]] for sc, v in cand.items()}
json.dump(res, open(os.path.join(HERE, OUTNAME), "w"), indent=1, default=list)
for k in ("P1", "P2", "P3", "P4"): print(k, json.dumps(res[k], default=list)[:400])
