"""Session 4: did the WG2 register hold an earlier asking? Usage:
python3 -I session4.py WG2DIR DOCDIR UnicodeData.txt [EXCLUDE.json]
WG2DIR holds Register-<n>.html saved as W<n>.html (n = 1750, 2000, ... 5000); DOCDIR caches fetched documents.
EXCLUDE.json: [document number, code point] pairs read in context and found to name another character.
Without it the script writes session4_raw.json; with it, session4.json (the registered, verified result; SESSION4.md).
Method and predictions: SESSION4.md (committed before this script was run)."""
import sys, os, re, json, html, subprocess, statistics, urllib.request, collections, concurrent.futures, tempfile, shutil
WG, DOC, UD = sys.argv[1], sys.argv[2], sys.argv[3]
EXCLUDE = {tuple(x) for x in json.load(open(sys.argv[4]))} if len(sys.argv) > 4 else None
OUTNAME = "session4.json" if EXCLUDE is not None else "session4_raw.json"
EXCLUDE = EXCLUDE or set()
HERE = os.path.dirname(os.path.abspath(__file__))
s2 = json.load(open(os.path.join(HERE, "session2.json")))
s3 = json.load(open(os.path.join(HERE, "session3_verified.json")))
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
RANGES = range(1750, 5250, 250)  # 14 registers, N1750-N5249 (Register-5250 answers 404)

def strip(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

# 1. WG2 register rows
rows = []
for n0 in RANGES:
    t = open(os.path.join(WG, "W%d.html" % n0), encoding="utf8", errors="replace").read()
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S | re.I):
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S | re.I)
        if len(tds) < 4: continue
        num = strip(tds[0])
        if not re.match(r"\d{4}", num): continue
        href = re.search(r'href="([^"]+)"', tds[0])
        url = href.group(1) if href else None
        m = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", strip(tds[3]))
        date = "%s-%02d-%02d" % (m.group(1), int(m.group(2)), int(m.group(3))) if m else None
        rows.append({"num": "WG2 N" + num, "title": strip(tds[1]), "date": date, "url": url})
print("WG2 rows", len(rows), "with link", sum(1 for r in rows if r["url"]), "no date", sum(1 for r in rows if not r["date"]),
      "private", sum(1 for r in rows if r["url"] and "wg2-private" in r["url"]))

# 2. events (as session3.py)
units = [u for u in s2["rows"] if (u["wait_best"] or 0) > 0]
ev = collections.OrderedDict()
for u in units:
    ev.setdefault((u["ucd_script"], u["complete_best"], tuple(u["binding_cps"])), []).append(u)
s3ev = {(e["script"], e["complete"], tuple(e["binding_cps"])): e for e in s3["events_detail"]}
assert len(ev) == 28 and all(k in s3ev for k in ev), "events differ from session 3"

# 3. candidates and text
def fname(r): return os.path.join(DOC, re.sub(r"[^A-Za-z0-9.]+", "_", r["num"]) + "_" + os.path.basename(r["url"])[:60])

def fetch(r):
    if not r["url"]: return "no link"
    if "wg2-private" in r["url"]: return "private"
    fn = fname(r)
    if os.path.exists(fn): return "cached"
    try:
        req = urllib.request.Request(r["url"].replace("http://", "https://"), headers={"User-Agent": "Mozilla/5.0"})
        open(fn, "wb").write(urllib.request.urlopen(req, timeout=60).read())
        return "fetched"
    except Exception as e:
        return "fetch failed: %s" % type(e).__name__

def text_of(r, st):
    if st not in ("cached", "fetched"): return None, st
    fn = fname(r)
    data = open(fn, "rb").read()
    txt = fn + ".txt"
    if data[:4] == b"%PDF":
        out = subprocess.run(["pdftotext", "-q", fn, "-"], capture_output=True, timeout=120).stdout.decode("utf8", "replace")
    elif data[:4] in (b"\xd0\xcf\x11\xe0", b"PK\x03\x04") or data[:5] == b"{\\rtf":
        if not os.path.exists(txt):
            d = tempfile.mkdtemp()
            subprocess.run(["soffice", "--headless", "--convert-to", "txt:Text (encoded):UTF8", "--outdir", d, fn],
                           capture_output=True, timeout=180)
            outs = [x for x in os.listdir(d) if x.endswith(".txt")]
            if outs: shutil.copy(os.path.join(d, outs[0]), txt)
            shutil.rmtree(d, ignore_errors=True)
        out = open(txt, encoding="utf8", errors="replace").read() if os.path.exists(txt) else ""
    else:
        out = strip(data.decode("utf8", "replace"))
    if len(out.strip()) < 50: return None, "no text"
    return out, "ok"

scripts = sorted({k[0] for k in ev})
cand = {}
for sc in scripts:
    last = max(k[1] for k in ev if k[0] == sc)
    pat = re.compile(r"\b(" + ALIAS[sc] + r")\b", re.I)
    c = sorted([r for r in rows if r["date"] and pat.search(r["title"]) and int(r["date"][:4]) <= last], key=lambda r: (r["date"], r["num"]))
    cand[sc] = {"n_candidates": len(c), "read": c[:CAP]}
todo = {r["num"]: r for v in cand.values() for r in v["read"]}
with concurrent.futures.ThreadPoolExecutor(8) as ex:
    fst = dict(zip(todo, ex.map(fetch, todo.values())))
texts, status = {}, {}
for k, r in todo.items():
    texts[k], status[k] = text_of(r, fst[k])
for sc in scripts:
    print(sc, "candidates", cand[sc]["n_candidates"], "read", len(cand[sc]["read"]),
          "ok", sum(1 for r in cand[sc]["read"] if status[r["num"]] == "ok"))

def norm(s): return re.sub(r"\s+", " ", s).upper()

# 4. hits; every code-point-only hit carries its context for reading (SESSION4.md)
out_events, to_read = [], []
for (sc, yr, cps), us in ev.items():
    first, cphits = None, []
    for r in cand[sc]["read"]:
        if int(r["date"][:4]) > yr: continue
        t = texts.get(r["num"])
        if not t: continue
        T = norm(t)
        found = None
        for cp in cps:
            n = int(cp[2:], 16)
            if names[n] in T:
                found = {"matched": "name", "key": names[n]}; break
        if not found:
            for cp in cps:
                n = int(cp[2:], 16)
                m = re.search(r"U\+0*%X\b" % n, t, re.I)
                if m and (r["num"], cp) not in EXCLUDE:
                    ctx = re.sub(r"\s+", " ", t[max(0, m.start() - 150): m.end() + 150])
                    found = {"matched": "cp", "key": cp, "context": ctx}
                    to_read.append({"num": r["num"], "cp": cp, "name": names[n], "context": ctx})
                    break
        if found:
            first = dict(num=r["num"], title=r["title"], date=r["date"], url=r["url"], **found); break
    l2 = s3ev[(sc, yr, cps)]["first_asking"]
    window = [r for r in cand[sc]["read"] if int(r["date"][:4]) <= yr]
    e = {"script": sc, "complete": yr, "binding_cps": list(cps), "units": [u["id"] for u in us], "script_first": us[0]["script_first"],
         "wg2_candidates_read": len(window), "wg2_unreadable": sum(1 for r in window if status[r["num"]] != "ok"),
         "l2_first": l2, "wg2_first": first}
    dates = [x["date"] for x in (l2, first) if x]
    if dates:
        ay = int(min(dates)[:4])
        e["combined_year"] = ay
        e["moved_earlier_years"] = (int(l2["date"][:4]) - int(first["date"][:4])) if (l2 and first) else None
        e["before_asking"] = ay - e["script_first"]; e["after_asking"] = yr - ay
    out_events.append(e)

l2hit = [e for e in out_events if e["l2_first"]]
nol2 = [e for e in out_events if not e["l2_first"]]
res = {"wg2_rows": len(rows), "wg2_rows_with_link": sum(1 for r in rows if r["url"]), "events": len(out_events),
       "status_counts": collections.Counter(status.values()), "candidates": {k: v["n_candidates"] for k, v in cand.items()},
       "excluded": sorted(list(x) for x in EXCLUDE)}
moved = [e for e in l2hit if e["moved_earlier_years"] and e["moved_earlier_years"] >= 1]
res["P1"] = {"l2_events": len(l2hit), "moved_earlier": [(e["script"], e["complete"], e["moved_earlier_years"]) for e in moved],
             "held": len(moved) <= 5}
new = [e for e in nol2 if e["wg2_first"]]
res["P2"] = {"no_l2_events": len(nol2), "wg2_new": [(e["script"], e["complete"], e["wg2_first"]["num"]) for e in new], "held": len(new) >= 2}
p3, tb, ta = [], 0, 0
for e in out_events:
    if "combined_year" not in e: continue
    for u in e["units"]:
        w = next(x for x in units if x["id"] == u)
        tb += e["before_asking"]; ta += e["after_asking"]
        if w["wait_best"] >= 10: p3.append((u, e["before_asking"], e["after_asking"]))
res["P3"] = {"units": p3, "before_gt_after": sum(1 for _, b, a in p3 if b > a), "held": bool(p3) and sum(1 for _, b, a in p3 if b > a) > len(p3) / 2}
res["P4"] = {"units_with_asking": sum(len(e["units"]) for e in out_events if "combined_year" in e), "before_years": tb, "after_years": ta,
             "held": tb >= 2 * ta}
res["events_detail"] = out_events
res["cp_hits_to_read"] = to_read
res["candidates_read"] = {sc: [{"num": r["num"], "date": r["date"], "title": r["title"], "url": r["url"], "status": status[r["num"]]}
                               for r in v["read"]] for sc, v in cand.items()}
json.dump(res, open(os.path.join(HERE, OUTNAME), "w"), indent=1, default=list)
for k in ("P1", "P2", "P3", "P4"): print(k, json.dumps(res[k], default=list)[:500])
