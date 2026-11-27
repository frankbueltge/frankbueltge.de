"""Check 96: find every passage the check adds or changes word for word in the source as fetched on 2026-11-27.

Passages checked: every act of cases96.json marked `added` or `corrected`, the maker's added receipts, its clock in the
escape, the acts found outside the count, and every passage of duties96.json. Texts are the local copies fetched in
this session (no copy is committed): the blind readers' caches for the sources of study 95 and the Paris Call, and the
conductor's cache for the complaint, the technical report, the Commission's signatory page, New York's section 1422
and the pages of part C's search. A passage read only through an extraction service, or only as a search service's
excerpt, is marked so. Usage: python3 check_quotes96.py <cache_dir> ... (the readers' B caches, the A1 cache, and the
conductor's cache). Writes check96.json (sha256 of each text read, and each passage found or not). Standard library
only.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
ALIAS = {"ny1422": "GBS1422", "eucode": "eucode", "complaint": "complaint"}
# Pages read only through an extraction service (the publisher refused the client or renders by script).
EXTRACTED = {"tc": "tc_x", "tc5": "tc5_x", "rs": "rs_x"}
# A page read only as a search service's excerpt (the publisher refused the client; no extraction was run).
EXCERPT = {"eur0907": "eur0907_x"}
# A pleading paper: every line carries its number on a line of its own, which the check drops before matching.
LINE_NUMBERED = {"complaint"}


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("\u00a0", " ").replace("\u00ad", "").replace("\u200b", "")
    s = re.sub(r"-\s*\n\s*", "-", s)
    return re.sub(r"\s+", " ", s).strip()


def load(key, dirs):
    names = [EXCERPT.get(key), EXTRACTED.get(key), ALIAS.get(key, key)]
    for n in names:
        if not n:
            continue
        for d in dirs:
            p = Path(d) / f"{n}.txt"
            if p.exists():
                raw = p.read_bytes()
                text = raw.decode("utf8", "replace")
                if key in LINE_NUMBERED:
                    text = re.sub(r"(?m)^\s*\d{1,2}\s*$", "", text)
                via = ("search excerpt" if n == EXCERPT.get(key) else
                       "extraction service" if n == EXTRACTED.get(key) else "direct")
                return norm(text), hashlib.sha256(raw).hexdigest(), via, str(p.name)
    return None, None, None, None


def main(dirs):
    c = json.loads((HERE / "cases96.json").read_text())
    duties = json.loads((HERE / "duties96.json").read_text())
    items = []
    for d in c["doors"]:
        for a in d["acts"]:
            if a.get("check") in ("added", "corrected"):
                items.append((f"{d['id']} {a['code']} {a.get('date')}", a["src"], a["quote"]))
        for k in ("received_outside", "earlier_word"):
            if k in d:
                items.append((f"{d['id']} {k}", d[k]["src"], d[k]["quote"]))
                if "also" in d[k]:
                    items.append((f"{d['id']} {k} also", d[k]["also"]["src"], d[k]["also"]["quote"]))
    for e in c.get("maker_clock", []):
        if e.get("quote"):
            items.append((f"maker clock {e['date']}", e["src"], e["quote"]))
    for a in c.get("found_outside_count", []):
        items.append((f"{a['door']} {a['code']} {a.get('date')} (found outside the count)", a["src"], a["quote"]))
    for cell in duties["cells"]:
        for p in cell["passages"]:
            items.append((f"duty {cell['case']} {cell['signal']}", p["src"], p["quote"]))
    texts, out = {}, []
    for label, src, q in items:
        if src not in texts:
            texts[src] = load(src, dirs)
        t, sha, via, name = texts[src]
        found = bool(t) and norm(q) in t
        if not found and t:
            # PDF line breaks may split a word or drop the space after a line-end hyphen.
            found = norm(q).replace(" ", "") in t.replace(" ", "")
        words = len(q.split())
        out.append({"item": label, "src": src, "found": found, "words": words, "via": via})
    res = {"what": "Check 96: passages added or changed by the check, found word for word (check_quotes96.py).",
           "texts": {k: {"sha256_text_read": v[1], "via": v[2], "file": v[3]} for k, v in texts.items()},
           "n": len(out), "found": sum(o["found"] for o in out),
           "over_40_words": [o["item"] for o in out if o["words"] > 40],
           "extraction": sum(1 for o in out if o["via"] == "extraction service"),
           "search_excerpt": sum(1 for o in out if o["via"] == "search excerpt"),
           "passages": out}
    (HERE / "check96.json").write_text(json.dumps(res, indent=1, ensure_ascii=False) + "\n")
    print("passages", res["n"], "found", res["found"], "extraction", res["extraction"], "over 40", res["over_40_words"])
    for o in out:
        if not o["found"]:
            print("  NOT FOUND", o)


if __name__ == "__main__":
    main(sys.argv[1:])
