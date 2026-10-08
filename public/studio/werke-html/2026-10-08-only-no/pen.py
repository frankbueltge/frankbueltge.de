"""Who holds the pen (session 162, 2026-10-08). Builds pen.json from three readings of the same 62 rule texts:
1. The Atelier's coding (ulysses repo, presentations/cycle-006/results.json, `cells`, read at commit 4eb8054;
   file sha256 2ee20b01...; only id, class, void and by_reference are used, and they are copied into pen.json).
2. A blind second reading made here (second_reading.json): one reader, given only the titles and rule texts
   and the four class definitions, never the Atelier's labels.
3. The rule texts themselves (raw/markets/<id>.json, not committed; fetch_detail.py rebuilds them), whose
   sha256 (raw, stripped or whitespace-collapsed) is checked against the Atelier's desc_sha256 so that both readings read the same text.
Every answer a rule strikes in advance (resolves N/A / does not resolve) is listed with a short quotation."""
import json, hashlib, sys, urllib.request
ATELIER = "https://raw.githubusercontent.com/frankbueltge/ulysses/4eb80543e2654faa8a36e4f36782a9ffbf7371c9/presentations/cycle-006/results.json"
CLASSES = ("machine", "threshold", "unnamed", "norule")
# The answers struck in advance, read from the rule texts (each quotation is the rule's own, short):
STRUCK = {
  "4daQpzw6B6Q4dwFDi96y": ("no one", "If neither humanity nor AIs are around then this market does not resolve."),
  "OYYWyf4i86yyICsOYhiG": ("no one", "If neither humanity nor AIs are around then this market does not resolve."),
  "axwg7y0dOkNFNiosLbh3": ("no one", "If neither humanity nor AIs are around then this market does not resolve."),
  "BKr7KGDSkT6U3dGlqxIk": ("no one", "If neither humanity nor AIs are around then this market does not resolve."),
  "Ide0brMftTAknwNsOSJG": ("no one", "It should resolve the same in all states of the world."),
  "6worzd97r3": ("a merger", "Resolves N/A if humanity chooses [...] to merge with AI instead."),
  "28PoDmUrYfd2LXu88u5w": ("no season", "If no league season 4 takes place, this market resolves to N/A"),
}
norm = lambda t: " ".join(t.split())
try: A = json.load(urllib.request.urlopen(ATELIER, timeout=60))
except Exception: A = json.load(open(sys.argv[1]))  # a local copy of the same file
cells = {c["id"]: c for c in A["cells"]}
B = {b["id"]: b for b in json.load(open("second_reading.json"))}
D = json.load(open("data.json")); L = [m for m in D["markets"] if m["class"] == "ledger"]
assert set(cells) == set(B) == {m["id"] for m in L}
rows, same_text = [], 0
for m in L:
    i = m["id"]; text = json.load(open(f"raw/markets/{i}.json")).get("textDescription") or ""
    same_text += cells[i]["desc_sha256"] in {hashlib.sha256(v.encode()).hexdigest() for v in (text, text.strip(), norm(text))}
    for v in STRUCK.get(i, (None, ""))[1].split("[...]"):
        assert norm(v.strip()) in norm(text), (i, v)
    rows.append({"id": i, "writer": cells[i]["cls"], "second": B[i]["cls"], "by_reference": cells[i].get("by_reference"),
                 "void_atelier": cells[i]["void"], "struck": STRUCK.get(i, (None,))[0], "struck_quote": STRUCK.get(i, (None, None))[1]})
n = len(rows); po = sum(r["writer"] == r["second"] for r in rows) / n
pe = sum(sum(r["writer"] == c for r in rows) / n * sum(r["second"] == c for r in rows) / n for c in CLASSES)
out = {"source": ATELIER, "same_text": same_text, "n": n,
       "by_writer": {c: sum(r["writer"] == c for r in rows) for c in CLASSES},
       "by_writer_second": {c: sum(r["second"] == c for r in rows) for c in CLASSES},
       "agreement": round(po, 4), "kappa": round((po - pe) / (1 - pe), 3),
       "disagree": [r["id"] for r in rows if r["writer"] != r["second"]],
       "struck": {k: sum(r["struck"] == k for r in rows) for k in ("no one", "a merger", "no season")},
       "rows": rows}
json.dump(out, open("pen.json", "w"), indent=1, ensure_ascii=False)
print({k: v for k, v in out.items() if k != "rows"})
