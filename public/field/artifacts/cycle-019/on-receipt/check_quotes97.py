"""Reading 97: find every passage of codes97.json word for word in the source as fetched on 2026-11-28.

Passages checked: the received word and every act of the two doors Part A adds, the maker's two added acts, the five
maker words of Part B, every passage of the four duties, the passages on the model's standing, and the passages the
paper quotes beyond the codes. Texts are the
conductor's local copies fetched in this session (no copy is committed): PDFs turned to text (pdftotext, zero-width
spaces removed) and read as `<key>.plain.txt`, and three pages read only through an extraction service because the
publisher refused this client or answered with an empty body (`<key>_x.txt`), which are marked so. Usage:
python3 check_quotes97.py <cache_dir>. Writes check97.json (sha256 of each text read and of the fetched bytes where
kept, and each passage found or not). Standard library only.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
# Pages read only through an extraction service.
EXTRACTED = {"eorel": "eorel_x", "euact": "euact_x", "sb53": "sb53_x"}


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace(" ", " ").replace("­", "").replace("​", "")
    s = re.sub(r"-\s*\n\s*", "-", s)
    return re.sub(r"\s+", " ", s).strip()


def load(key, d):
    d = Path(d)
    for name, via in ((EXTRACTED.get(key), "extraction service"), (f"{key}.plain", "direct")):
        if not name:
            continue
        p = d / f"{name}.txt"
        if p.exists():
            raw = p.read_bytes()
            fetched = d / f"{key}.raw"
            return (norm(raw.decode("utf8", "replace")), hashlib.sha256(raw).hexdigest(),
                    hashlib.sha256(fetched.read_bytes()).hexdigest() if via == "direct" and fetched.exists() else None,
                    via, p.name)
    return None, None, None, None, None


def main(d):
    c = json.loads((HERE / "codes97.json").read_text())
    items = []
    for door in c["new_doors"]:
        r = door["received"]
        items.append((f"{door['id']} received", r["src"], r["quote"]))
        for a in door["acts"]:
            items.append((f"{door['id']} {a['code']} {a['date']}", a["src"], a["quote"]))
            if "quote2" in a:
                items.append((f"{door['id']} {a['code']} {a['date']} (second passage)", a["quote2"]["src"],
                              a["quote2"]["quote"]))
    for a in c["maker_added"]:
        items.append((f"E-MAKER {a['code']} {a['date']} (added)", a["src"], a["quote"]))
    for k, w in c["words"].items():
        items.append((f"word {k} {w['date']}", w.get("src", "oaitr"), w["quote"]))
    for k, duty in c["duties"].items():
        for i, p in enumerate(duty["passages"], 1):
            items.append((f"duty {k} passage {i}", p["src"], p["quote"]))
    for i, p in enumerate(c["model_passages"], 1):
        items.append((f"model passage {i}", p["src"], p["quote"]))
    for i, p in enumerate(c.get("paper_passages", []), 1):
        items.append((f"paper passage {i}", p["src"], p["quote"]))
    texts, out = {}, []
    for label, src, q in items:
        if src not in texts:
            texts[src] = load(src, d)
        t, sha, sha_fetched, via, name = texts[src]
        found = bool(t) and norm(q) in t
        if not found and t:
            # PDF line breaks may split a word or drop the space after a line-end hyphen.
            found = norm(q).replace(" ", "") in t.replace(" ", "")
        out.append({"item": label, "src": src, "found": found, "words": len(q.split()), "via": via})
    res = {"what": "Reading 97: passages of codes97.json found word for word (check_quotes97.py).",
           "texts": {k: {"sha256_text_read": v[1], "sha256_fetched": v[2], "via": v[3], "file": v[4]}
                     for k, v in texts.items()},
           "n": len(out), "found": sum(o["found"] for o in out),
           "over_40_words": [o["item"] for o in out if o["words"] > 40],
           "extraction": sum(1 for o in out if o["via"] == "extraction service"),
           "passages": out}
    (HERE / "check97.json").write_text(json.dumps(res, indent=1, ensure_ascii=False) + "\n")
    print("passages", res["n"], "found", res["found"], "extraction", res["extraction"], "over 40", res["over_40_words"])
    for o in out:
        if not o["found"]:
            print("  NOT FOUND", o)


if __name__ == "__main__":
    main(sys.argv[1])
