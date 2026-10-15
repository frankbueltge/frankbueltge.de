"""How near — analysis. Run: python3 -I analyse.py <mongodump_full_snapshot/>
Reads the AIID snapshot's CSET annotator CSVs, the final CSETv1 CSV and incidents.csv.
Writes data.json: the pairs, the near-language test (PREDICTIONS.md), and the incidents any
reader called a near miss, with title, description and each reader's own note (CC BY-SA 4.0)."""
import csv, hashlib, json, os, re, sys

csv.field_size_limit(10**9)
D = sys.argv[1]
NEAR = "AI tangible harm near-miss"
LEX = re.compile(r"\b(nearly|almost|narrowly|near[- ]?miss(es)?|close call|could have|would have|averted|avoided|barely|prevented)\b", re.I)

def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()

def rows(name):
    p = os.path.join(D, name)
    with open(p, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f)), sha(p)

inc, inc_sha = rows("incidents.csv")
text = {int(r["incident_id"]): (r["title"].strip(), r["description"].strip()) for r in inc}

final_rows, final_sha = rows("classifications_CSETv1.csv")
final = {}
for r in final_rows:
    final[int(r["Incident ID"])] = {"level": r["AI Harm Level"].strip(), "tangible": r["Tangible Harm"].strip(),
                                   "note": r["AI Tangible Harm Level Notes"].strip()}

ann, hashes = {}, {"incidents.csv": inc_sha, "classifications_CSETv1.csv": final_sha}
for k in (1, 2, 3):
    name = f"classifications_CSETv1_Annotator-{k}.csv"
    rs, h = rows(name)
    hashes[name] = h
    for r in rs:
        i = int(r["Incident ID"])
        lvl = r["AI Harm Level"].strip()
        if not lvl:
            continue
        ann.setdefault(i, []).append({"ns": k, "annotator": r["Annotator"].strip(), "level": lvl,
                                      "note": r["AI Tangible Harm Level Notes"].strip()})

pairs = []
for i in sorted(ann):
    a = sorted(ann[i], key=lambda x: x["ns"])
    if len(a) < 2:
        continue
    t = text.get(i, ("", ""))
    pairs.append({"id": i, "a": a[0], "b": a[1], "near_language": bool(LEX.search(t[0] + " " + t[1])),
                  "words": sorted({m.group(0).lower() for m in LEX.finditer(t[0] + " " + t[1])})})

def tally(ps):
    either = [p for p in ps if NEAR in (p["a"]["level"], p["b"]["level"])]
    both = [p for p in either if p["a"]["level"] == p["b"]["level"] == NEAR]
    return {"pairs": len(ps), "either_near": len(either), "both_near": len(both),
            "rate_either": round(len(either) / len(ps), 4) if ps else None,
            "share_both_of_either": round(len(both) / len(either), 4) if either else None}

L = [p for p in pairs if p["near_language"]]
N = [p for p in pairs if not p["near_language"]]
tL, tN = tally(L), tally(N)
calls_without_words = sum((p["a"]["level"] == NEAR) + (p["b"]["level"] == NEAR) for p in N)
res = {
    "pairs": len(pairs), "near_language": tL, "no_near_language": tN,
    "P1_share_near_language": round(len(L) / len(pairs), 4),
    "P1_holds": len(L) / len(pairs) < 0.25,
    "P2_ratio": round(tL["rate_either"] / tN["rate_either"], 3) if tN["rate_either"] else None,
    "P3_difference": (round(tL["share_both_of_either"] - tN["share_both_of_either"], 4)
                      if tL["share_both_of_either"] is not None and tN["share_both_of_either"] is not None else None),
    "P4_near_calls_on_texts_without_near_language": calls_without_words,
}
res["P2_holds"] = res["P2_ratio"] is not None and res["P2_ratio"] >= 1.5
res["P3_holds"] = res["P3_difference"] is not None and res["P3_difference"] < 0.25
res["P4_holds"] = calls_without_words >= 1

# the incidents any reader (or the final record) called a near miss: the material of the instrument
ids = sorted({i for i, a in ann.items() if any(x["level"] == NEAR for x in a)} |
             {i for i, f in final.items() if f["level"] == NEAR})
cases = []
for i in ids:
    t = text.get(i, ("", ""))
    cases.append({"id": i, "title": t[0], "description": t[1],
                  "readers": [{"annotator": x["annotator"], "level": x["level"], "note": x["note"]} for x in sorted(ann.get(i, []), key=lambda x: x["ns"])],
                  "final": final.get(i), "near_language": bool(LEX.search(t[0] + " " + t[1])),
                  "words": sorted({m.group(0).lower() for m in LEX.finditer(t[0] + " " + t[1])})})

json.dump({"built": "2026-10-09", "snapshot": "backup-20261005101424",
           "snapshot_sha256": "46af6f306e09a2a0cbe18d50d6c81fd362047876572e5fc4022bc0dd4419e378",
           "files_sha256": hashes, "lexicon": LEX.pattern, "results": res,
           "pairs_by_language": [{"id": p["id"], "near_language": p["near_language"], "a": p["a"]["level"], "b": p["b"]["level"]} for p in pairs],
           "cases": cases,
           "licence": "Incident titles, descriptions and annotator notes: AI Incident Database, CC BY-SA 4.0."},
          open("data.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(res, indent=1)); print(len(cases), "cases")

# --- Exploratory, not in PREDICTIONS.md: where the counterfactual sentence sits. ---
# (a) the full source reports each incident cites (reports.csv `text`), (b) the reader's own note.
rep, rep_sha = rows("reports.csv")
rtext = {}
for r in rep:
    try:
        rtext[int(r["report_number"])] = r["title"] + " " + r["text"]
    except ValueError:
        pass
cites = {int(r["incident_id"]): json.loads(r["reports"] or "[]") for r in inc}

def report_hits(i):
    ns = cites.get(i, [])
    hit = [n for n in ns if n in rtext and LEX.search(rtext[n])]
    return len(hit), len([n for n in ns if n in rtext])

def ex(ps):
    out = {"pairs": len(ps), "either_near": 0, "both_near": 0}
    for p in ps:
        out["either_near"] += NEAR in (p["a"]["level"], p["b"]["level"])
        out["both_near"] += p["a"]["level"] == p["b"]["level"] == NEAR
    return out

RL = [p for p in pairs if report_hits(p["id"])[0] > 0]
RN = [p for p in pairs if report_hits(p["id"])[0] == 0]
calls = []
for i, a in ann.items():
    for x in a:
        if x["level"] == NEAR:
            calls.append({"id": i, "annotator": x["annotator"], "note_has_counterfactual": bool(LEX.search(x["note"])),
                          "note_empty": not x["note"], "description_has": bool(LEX.search(" ".join(text.get(i, ("", ""))))),
                          "reports_with": report_hits(i)[0], "reports": report_hits(i)[1]})
exploratory = {
    "reports_csv_sha256": rep_sha,
    "pairs_whose_reports_carry_near_language": ex(RL), "pairs_whose_reports_do_not": ex(RN),
    "near_miss_calls": len(calls),
    "calls_note_has_counterfactual": sum(c["note_has_counterfactual"] for c in calls),
    "calls_note_empty": sum(c["note_empty"] for c in calls),
    "calls_description_has": sum(c["description_has"] for c in calls),
    "calls_any_report_has": sum(c["reports_with"] > 0 for c in calls),
    "calls": sorted(calls, key=lambda c: (c["id"], c["annotator"])),
}
d = json.load(open("data.json"))
d["files_sha256"]["reports.csv"] = rep_sha
d["exploratory"] = exploratory
for c in d["cases"]:
    h, n = report_hits(c["id"])
    c["reports_with_near_language"], c["reports"] = h, n
json.dump(d, open("data.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in exploratory.items() if k != "calls"}, indent=1))
