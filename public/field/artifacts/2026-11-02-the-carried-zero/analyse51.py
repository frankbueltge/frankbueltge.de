"""Check 51: are the zone quiets of Congo's Ebola record written or carried?

Usage: python3 -I analyse51.py <drc_ebola_cases_consolidated.csv> <BDBV2026-Data checkout> <dir of sitrep .txt>
The .txt files are `pdftotext -layout` of data/insp_sitrep/raw/*.pdf (poppler), one per PDF, same stem.
Writes results51.json and data51.js beside this script. Predictions: PREDICTIONS.md (written first).
"""
import csv, collections, datetime as dt, hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SHA = "761e1ed4f11db45a28ff8338a22ae78d9d78fd942603177bb8cbc16fb8352dbf"
hdx, up, txtdir = sys.argv[1:4]
assert hashlib.sha256(open(hdx, "rb").read()).hexdigest() == SHA
rows = list(csv.DictReader(open(hdx, encoding="utf-8-sig")))
D = dt.date.fromisoformat

# ---- 1. the Atelier's quiet runs, reproduced by its own rule (build.py, s28) ----
sitreps = sorted({r["reference_date"] for r in rows})
first, last = D(sitreps[0]), D(sitreps[-1])
cal = [(first + dt.timedelta(i)).isoformat() for i in range((last - first).days + 1)]
conf = collections.defaultdict(dict); src = collections.defaultdict(set)
for r in rows:
    if r["location_level"] != "3" or r["location_name"] == "NA":
        continue
    src[r["location_name"]].add(r["location_name_source"])
    if r["measure"] == "cases" and r["case_classification"] == "confirmed":
        conf[r["location_name"]][r["reference_date"]] = int(r["value"])
zones = {}
for z in sorted(conf):
    vals = [conf[z].get(d) for d in cal]; m = -1; rises = []
    for i, x in enumerate(vals):
        if x is None: continue
        if x > m:
            if m >= 0 or x > 0: rises.append(i)
            m = x
    zones[z] = {"v": vals, "rises": rises}
runs = []
for z, o in zones.items():
    r = o["rises"]
    for a, b in zip(r, r[1:]): runs.append((z, a, b - a, True))
    if r: runs.append((z, r[-1], len(cal) - 1 - r[-1], False))
long_ = [x for x in runs if (x[3] and x[2] > 42) or (not x[3] and x[2] >= 42)]
broke = [x for x in long_ if x[3]]; held = [x for x in long_ if not x[3]]
assert len(broke) == 11 and len(held) == 11, (len(broke), len(held))  # the Atelier's 11 and 11

# ---- 2. sitrep texts: date of each report, and which zones stand in its zone table ----
MONTHS = {m: i + 1 for i, m in enumerate("janvier février mars avril mai juin juillet août septembre octobre novembre décembre".split())}
EN = {m: i + 1 for i, m in enumerate("january february march april may june july august september october november december".split())}
def digitiser_dates(repdir):
    """The transcribers' own record: data/insp_sitrep/reports/*.md, 'Sitrep number' and 'Report date'."""
    out = {}
    for f in os.listdir(repdir):
        t = open(os.path.join(repdir, f), encoding="utf-8").read()
        n = re.search(r"\*\*Sitrep number\*\*\s*\|\s*(\d+)", t); d = re.search(r"\*\*Report date\*\*\s*\|\s*([^|]+)\|", t)
        if not (n and d): continue
        s = re.sub(r"(\d)(st|nd|rd|th)", r"\1", d.group(1)).replace(",", " ").split()
        try:
            if s[0].isdigit(): day, mon = int(s[0]), EN[s[1].lower()]
            else: mon, day = EN[s[0].lower()], int(s[1])
            out.setdefault(int(n.group(1)), set()).add(dt.date(2026, mon, day).isoformat())
        except (KeyError, ValueError, IndexError): pass
    return out
def report_date(t):
    m = re.search(r"(?:rapportage|Date du rapport)\s*:?\s*(\d{1,2})(?:er)?\s+([a-zéû]+)\s+2026", t, re.I)
    if m and m.group(2).lower() in MONTHS: return dt.date(2026, MONTHS[m.group(2).lower()], int(m.group(1))).isoformat()
    m = re.search(r"N°\s*\d+\s*/\s*MVE[-A-Z]*/(\d{2})/(\d{2})/2026", t)
    if m: return dt.date(2026, int(m.group(2)), int(m.group(1))).isoformat()
    return None
def num_of(stem):
    return int(re.search(r"MVE_0*(\d+)", stem).group(1))
texts = {}
for f in sorted(os.listdir(txtdir)):
    if not f.endswith(".txt"): continue
    t = open(os.path.join(txtdir, f), encoding="utf-8", errors="replace").read()
    texts[f[:-4]] = t
# date by text where stated; otherwise by the sitrep-number offset fitted on stated ones (marked)
digi = digitiser_dates(os.path.join(up, "data/insp_sitrep/reports"))
stated = {s: report_date(t) for s, t in texts.items()}
offs = collections.Counter((D(d) - dt.date(2026, 5, 13)).days - num_of(s) for s, d in stated.items() if d)
sit = {}; date_conflicts = []
for s, t in texts.items():
    words = len(t.split()); n = num_of(s)
    dd = digi.get(n)
    # the report's own heading wins; the digitisers' record fills in where the text states no date
    # (their record writes September for October in sitreps 140 to 163: date_conflicts)
    if stated[s]:
        d, by = stated[s], "text"
        if dd and len(dd) == 1 and next(iter(dd)) != d: date_conflicts.append([n, next(iter(dd)), d])
    elif dd and len(dd) == 1:
        d, by = next(iter(dd)), "digitiser"
    else:
        d, by = None, None
    sit[s] = {"n": n, "date": d, "dated_by": by, "words": words}
# a v2 supersedes its v1 (upstream rule: the latest version of each sitrep)
for s in list(sit):
    if s.endswith("_v2"): sit.pop(s.replace("_v2", ""), None)

ALIAS = {"Wanierukula": ["Wanie-Rukula", "Wanie Rukula"], "Gethy": ["Gety"], "Nyakunde": ["Nyankunde"]}
def in_table(t, names):
    """A zone stands in a sitrep's table when its name opens a line and is followed on that line by a
    number or by nothing (pdftotext puts a wrapped row's numbers on a neighbouring line), or when the
    first part of a hyphenated or two-word name opens a line and the last part opens one of the next two.
    Revised in session 248 before any result was read as final: Wanie-Rukula was found in 0 of 66
    tables, and the early tables number their rows ("12. Gety")."""
    for nm in names:
        parts = [x for x in re.split(r"[ \-]", nm) if x]
        full = r"[\s\-]+".join(re.escape(x) for x in parts)
        if re.search(r"(?mi)^[ \t]*(?:\d{1,2}\.[ \t]*)?" + full + r"[ \t]*(?:\d|$)", t): return True
        if len(parts) > 1 and re.search(r"(?mi)^[ \t]*(?:\d{1,2}\.[ \t]*)?" + re.escape(parts[0]) + r"-?[ \t]*\n(?:[^\n]*\n)?[ \t]*" + re.escape(parts[-1]) + r"\b", t):
            return True
    return False
TABLE_MIN = 300  # words; below this pdftotext found no text layer (image-only PDF)
bydate = {}   # a date may carry two sitreps (e.g. 150 and 151 both state 12 Oct): a zone written in either counts
for s, o in sorted(sit.items()):
    if o["date"] and o["words"] >= TABLE_MIN:
        bydate.setdefault(o["date"], []).append(s)
out_dupdates = {d: v for d, v in bydate.items() if len(v) > 1}
written = {}
for d, ss in bydate.items():
    t = "\n".join(texts[s] for s in ss)
    for z in zones:
        names = sorted(src[z] | {z} | set(ALIAS.get(z, [])))
        if z == "Tshopo":  # zone and province share the name: require two table lines
            ok = len(re.findall(r"(?m)^\s*Tshopo\s+\d", t)) >= 2
        else:
            ok = in_table(t, names)
        written[(z, d)] = ok

# ---- 3. classify every day inside the 22 long quiets ----
hdx_dates = set(sitreps)
def classify(z, d):
    if d not in hdx_dates: return "no_report"
    if d not in bydate: return "unread"           # report date with no readable sitrep in the repository
    return "written" if written[(z, d)] else "absent"
per_run = []
for z, a, L, ended in long_:
    days = cal[a + 1: a + L] if ended else cal[a + 1:]
    c = collections.Counter(classify(z, d) for d in days)
    known = c["no_report"] + c["written"] + c["absent"]
    per_run.append({"zone": z, "from": cal[a], "to": cal[a + L] if ended else None, "length": L,
                    "broke": ended, "days": len(days), **{k: c[k] for k in ("no_report", "unread", "written", "absent")},
                    "unwritten_share": round((c["no_report"] + c["absent"]) / known, 4) if known else None,
                    "strip": [classify(z, d)[0] for d in days]})
tot = collections.Counter()
for p in per_run:
    for k in ("no_report", "unread", "written", "absent"): tot[k] += p[k]
alldays = sum(tot.values())
def pooled(sel):
    n = sum(p["no_report"] + p["absent"] for p in sel); d = sum(p["no_report"] + p["absent"] + p["written"] for p in sel)
    return n, d, round(n / d, 4)
pb, ph = pooled([p for p in per_run if p["broke"]]), pooled([p for p in per_run if not p["broke"]])
def head_commit(repo):
    try:
        h = open(os.path.join(repo, ".git", "HEAD")).read().strip()
        if h.startswith("ref: "):
            rf = os.path.join(repo, ".git", h[5:])
            if os.path.exists(rf): return open(rf).read().strip()
            for line in open(os.path.join(repo, ".git", "packed-refs")):
                if line.strip().endswith(h[5:]): return line.split()[0]
        return h
    except OSError: return None
out = {"hdx_sha256": SHA, "upstream_commit": head_commit(up), "calendar_days": len(cal), "hdx_report_dates": len(hdx_dates),
       "sitrep_texts": len(sit), "readable_sitreps": sum(1 for o in sit.values() if o["words"] >= TABLE_MIN),
       "dated_readable": len(bydate), "date_offsets_seen": dict(offs),
       "dated_by": dict(collections.Counter(o["dated_by"] for o in sit.values())),
       "date_conflicts_digitiser_vs_text": date_conflicts,
       "runs": {"broke": len(broke), "held": len(held)}, "dates_with_two_sitreps": out_dupdates, "day_classes": dict(tot), "days_in_quiets": alldays}
out["P1"] = {"no_report_days": tot["no_report"], "of": alldays, "share": round(tot["no_report"] / alldays, 4),
             "holds": tot["no_report"] / alldays >= 0.15}
out["P2"] = {"written": tot["written"], "absent": tot["absent"],
             "share_written": round(tot["written"] / (tot["written"] + tot["absent"]), 4),
             "holds": tot["written"] / (tot["written"] + tot["absent"]) >= 0.80}
out["P3"] = {"broken_unwritten": pb, "held_unwritten": ph, "holds": pb[2] > ph[2]}

# ---- 4. P4: do the sitreps write suspects per province after 30 May? ----
PROV = ["Ituri", "Nord-Kivu", "Haut-Uélé", "Bas-Uélé", "Bas Uélé", "Tshopo", "Sud-Kivu", "Sud Ubangi", "Nord Ubangi"]
def prov_suspects(t):
    """A province table of alerts and suspects: >= 3 province rows with >= 5 numbers (or ND), each with
    'suspect' and 'alerte' in the 25 lines above it, so a table of confirmed cases alone does not count."""
    L = t.split("\n"); hits = set()
    for i, line in enumerate(L):
        for p in PROV:
            m = re.match(r"\s*" + re.escape(p) + r"\s+(.*)$", line)
            if m and (len(re.findall(r"\d+", m.group(1))) >= 5 or m.group(1).split()[:3] == ["ND"] * 3):
                above = "\n".join(L[max(0, i - 25):i]).lower()
                if "suspect" in above and "alerte" in above: hits.add(p)
    return len(hits) >= 3
p4 = sorted(d for d, ss in bydate.items() if d > "2026-05-30" and any(prov_suspects(texts[s]) for s in ss))
out["P4"] = {"dates_after_30_may": len(p4), "first": p4[0] if p4 else None, "last": p4[-1] if p4 else None,
             "readable_dates_after_30_may": sum(1 for d in bydate if d > "2026-05-30"), "holds": len(p4) >= 30}

# ---- 4b. POST HOC (not predicted): on a quiet zone's report days, did its province send alert data? ----
# Province from the pcode prefix of the zone (HDX location_code), names as the alert table writes them.
PCODE = {"CD42": ["Sud Ubangi", "Sud-Ubangi"], "CD43": ["Nord Ubangi", "Nord-Ubangi"], "CD51": ["Tshopo"],
         "CD52": ["Bas Uélé", "Bas-Uélé"], "CD53": ["Haut-Uélé", "Haut Uélé"], "CD54": ["Ituri"],
         "CD61": ["Nord-Kivu", "Nord Kivu"], "CD62": ["Sud-Kivu", "Sud Kivu"]}
pcode = {}
for r in rows:
    if r["location_level"] == "3": pcode[r["location_name"]] = r["location_code"][:4]
def alert_row(t, names):
    """'sent' (a row of numbers), 'ND' (a row of ND), or 'unlisted', in a sitrep that has the alert table."""
    L = t.split("\n")
    for i, line in enumerate(L):
        for p in names:
            m = re.match(r"\s*" + re.escape(p) + r"\s+(.*)$", line)
            if not m: continue
            above = "\n".join(L[max(0, i - 25):i]).lower()
            if not ("suspect" in above and "alerte" in above): continue
            if m.group(1).split()[:3] == ["ND"] * 3: return "ND"
            if len(re.findall(r"\d+", m.group(1))) >= 5: return "sent"
    return "unlisted"
alert_dates = set(p4)
ph = collections.Counter(); ph_zone = {}
for z, a, L, ended in long_:
    days = cal[a + 1: a + L] if ended else cal[a + 1:]
    c = collections.Counter()
    for d in days:
        if d not in alert_dates: continue
        st = "unlisted"
        for s_ in bydate[d]:
            st2 = alert_row(texts[s_], PCODE[pcode[z]])
            if st2 == "sent" or (st2 == "ND" and st != "sent"): st = st2
        c[st] += 1
    ph += c; ph_zone[f"{z} {cal[a]}"] = dict(c)
out["posthoc_province_alerts"] = {"dates_with_alert_table": len(alert_dates), "quiet_days_on_those_dates": dict(ph),
                                  "per_run": ph_zone}

# ---- 5. P5: upstream transcription vs HDX ----
upf = os.path.join(up, "data/insp_sitrep/processed/insp_sitrep__cumulative_confirmed_cases__daily.csv")
upr = list(csv.DictReader(open(upf, encoding="utf-8-sig")))
name_of = {}
for z, ss in src.items():
    for s_ in ss: name_of[s_] = z
agree = mism = only_up = nd = 0; mism_ex = []
for r in upr:
    z = name_of.get(r["nom"]); v = r["cumulative_confirmed_cases"]
    if v in ("ND", "NA", ""): nd += 1; continue
    if z is None or r["date"] not in conf.get(z, {}): only_up += 1; continue
    if conf[z][r["date"]] == int(float(v)): agree += 1
    else:
        mism += 1
        if len(mism_ex) < 5: mism_ex.append([r["nom"], r["date"], v, conf[z][r["date"]]])
hdx_n = sum(len(v) for v in conf.values())
out["P5"] = {"agree": agree, "mismatch": mism, "examples": mism_ex, "upstream_ND": nd, "upstream_only": only_up,
             "hdx_zone_days": hdx_n, "holds": mism == 0}

# ---- 6. the Studio's case: zones quiet 42+ days on the last day, and what their last 42 days were ----
studio = [p for p in per_run if not p["broke"]]
out["studio_case"] = [{k: p[k] for k in ("zone", "from", "length", "no_report", "written", "absent", "unread")} for p in studio]
# the six sitrep numbers absent from the repository at the end, and the report dates without a readable sitrep
nums = sorted(o["n"] for o in sit.values())
out["missing_sitrep_numbers"] = [n for n in range(1, max(nums) + 1) if n not in nums]
out["hdx_dates_without_readable_sitrep"] = sorted(hdx_dates - set(bydate))
out["readable_sitrep_dates_not_in_hdx"] = sorted(set(bydate) - hdx_dates)
out["no_report_calendar_dates"] = [d for d in cal if d not in hdx_dates]
# EXPLORATORY (not predicted): how many quiets reach 42 if only report days, or only written days, count
def reach(p, keep):
    return sum(1 for c in p["strip"] if c in keep)
ex = {}
for lab, keep in (("calendar", "nuwa"), ("report_days", "uwa"), ("written_or_unread", "uw"), ("written_only", "w")):
    ex[lab] = {"broke_reaching_42": sum(1 for p in per_run if p["broke"] and reach(p, keep) >= 42),
               "held_reaching_42": sum(1 for p in per_run if not p["broke"] and reach(p, keep) >= 42)}
out["exploratory_42_by_day_kind"] = ex
out["per_run"] = [{k: v for k, v in p.items() if k != "strip"} for p in per_run]
json.dump(out, open(os.path.join(HERE, "results51.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(HERE, "results51.js"), "w").write("window.RESULTS51=" + json.dumps(out, ensure_ascii=False) + ";\n")
page = {"cal": cal, "runs": per_run, "noReport": out["no_report_calendar_dates"],
        "unread": out["hdx_dates_without_readable_sitrep"],
        "sitrepOf": {d: [sit[x]["n"] for x in ss] for d, ss in bydate.items()},
        "alertDates": sorted(alert_dates), "alerts": ph_zone, "explore": ex}
open(os.path.join(HERE, "data51.js"), "w").write("window.DATA51=" + json.dumps(page, separators=(",", ":"), ensure_ascii=False) + ";\n")
print(json.dumps({k: out[k] for k in ("calendar_days", "hdx_report_dates", "sitrep_texts", "readable_sitreps", "dated_readable", "dated_by", "date_conflicts_digitiser_vs_text", "day_classes", "P1", "P2", "P3", "P4", "P5", "missing_sitrep_numbers")}, ensure_ascii=False, indent=1))
