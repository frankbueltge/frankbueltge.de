#!/usr/bin/env python3
"""Check 82 (session 280, 2026-11-19): build the reading sheets for the blind second coding.

The sheets carry only what a second coder needs and nothing of the first coding: for study 80 the
candidate sentences (id, page, section, text, the reference numbers in the sentence with the report's
asterisk); for study 81 each source (reference number, the report's asterisk, its list entry, its
address) with the measured sentences that rest on it; for step 3's nine each case (incident number,
title, the maker's page). No code, note, quote or reason of the first coding is copied.

Run from this folder: python3 sheet82.py  -> sheets/*.json
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.dirname(HERE)
OUT = os.path.join(HERE, "sheets")


def load_js(path):
    text = open(path, encoding="utf-8").read()
    return json.loads(text[text.index("=") + 1:].rstrip().rstrip(";"))


def main():
    os.makedirs(OUT, exist_ok=True)
    sents = json.load(open(os.path.join(WORK, "sentences80.json"), encoding="utf-8"))
    cands = [s for s in sents["sentences"] if s.get("candidate")]
    assert len(cands) == 211, len(cands)
    blind80 = [{"id": s["id"], "page": s["page"], "section": s["section"], "text": s["text"],
                "refs": s["refs"]} for s in cands]
    half = (len(blind80) + 1) // 2
    for name, part in (("s80-a", blind80[:half]), ("s80-b", blind80[half:])):
        json.dump({"sheet": name, "what": "Study 80, second coding: candidate sentences of the "
                   "International AI Safety Report 2026 body, to be coded under CODEBOOK.md part A.",
                   "items": part}, open(os.path.join(OUT, name + ".json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)

    d81 = load_js(os.path.join(WORK, "data81.js"))
    rows = {r["id"]: r for r in d81["rows"]}
    weight = {}
    for s in d81["sources"]:
        u = (s["url"] or "").lower()
        weight[s["ref"]] = 3.0 if "system-card" in u or "model-cards" in u or "anthropic.com" in u else (
            1.5 if ("arxiv" in u or "openreview" in u or "aclanthology" in u or "medrxiv" in u) else 1.0)
    order = sorted(d81["sources"], key=lambda s: (-weight[s["ref"]], int(s["ref"])))
    n_sheets = 8
    loads = [0.0] * n_sheets
    sheets = [[] for _ in range(n_sheets)]
    for s in order:
        k = loads.index(min(loads))
        loads[k] += weight[s["ref"]]
        sheets[k].append({
            "ref": s["ref"],
            "report_asterisk": bool(s["industry"]),
            "entry": s["entry"],
            "url": s["url"],
            "sentences": [{"id": i, "page": rows[i]["page"], "text": rows[i]["text"]}
                          for i in s["cited_by"]],
        })
    for k, part in enumerate(sheets, 1):
        part.sort(key=lambda x: int(x["ref"]))
        json.dump({"sheet": f"s81-{k}", "what": "Study 81, second coding: sources behind the measured "
                   "sentences of the International AI Safety Report 2026, to be coded under CODEBOOK.md "
                   "part B.", "items": part},
                  open(os.path.join(OUT, f"s81-{k}.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)

    c81 = json.load(open(os.path.join(WORK, "coding81.json"), encoding="utf-8"))
    nine = [{"aiid": c["aiid"], "title": c["title"], "url": c["url"]} for c in c81["nine"]]
    assert len(nine) == 9
    json.dump({"sheet": "nine", "what": "Step 3's nine losses of control of 2026, to be coded under "
               "CODEBOOK.md part C.", "canary": c81["canary"], "items": nine},
              open(os.path.join(OUT, "nine.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("sheets:", sorted(os.listdir(OUT)), "loads:", [round(x, 1) for x in loads],
          "sizes:", [len(p) for p in sheets])


if __name__ == "__main__":
    main()
