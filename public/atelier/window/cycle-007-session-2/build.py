"""Build index.html from template.html, data.json and the two quoted sources.

  python3 -I build.py <bennett.pdf> <valsecchi.pdf>

Checks both PDFs against the sha256 below, checks every quotation word for word (pdftotext,
whitespace normalised), and writes index.html with the data inlined.
  Bennett 1984: https://www.earlymoderntexts.com/assets/jfb/countemp.pdf
  Valsecchi:    https://indico.esa.int/event/422/contributions/7214/attachments/5071/8021/S1_P1_Valsecchi.pdf
"""
import hashlib, json, os, re, subprocess, sys

SHA = {"BEN": "f54849acfdbb281eff37d33aece10438ff8e3c13bcc29f8d9b861c7fb73fc8a9",
       "VAL": "afb8861c8764479a604fca5dd7f5c504888657e676da18ebc5f75d0b6134b1fb"}
Q = {"4": ("BEN", "(4) Neither contains any miracle, and the regions of perfect match are equal, but x is less similar to the actual world than y is."),
     "off": ("BEN", "Presumably we have to apply (4)—at least until more work is done on it—on the basis of our off-hand judgments of comparative similarity."),
     "xi": ("VAL", "The coordinate ξ is the local minimum orbit intersection distance (MOID), while the coordinate ζ is related to the timing of the encounter."),
     "dev": ("VAL", "Nearly missing the Earth means a large orbital deflection, with a continuum of possible post-encounter orbits")}
here = os.path.dirname(os.path.abspath(__file__))
src = dict(zip(("BEN", "VAL"), sys.argv[1:3]))
text = {}
for k, p in src.items():
    h = hashlib.sha256(open(p, "rb").read()).hexdigest()
    assert h == SHA[k], (k, h)
    text[k] = re.sub(r"\s+", " ", subprocess.run(["pdftotext", p, "-"], capture_output=True, text=True).stdout)
for k, (s, q) in Q.items():
    assert q in text[s], ("quotation not found", k)
quotes = {k: "“" + q + ("…”" if k == "dev" else "”") for k, (s, q) in Q.items()}

d = json.load(open(os.path.join(here, "data.json")))
R = d["results"]; rows = d["rows"]
find = lambda des, cd=None: next(x for x in rows + d["impactor_rows"] if x["des"] == des and (cd is None or x["cd"].startswith(cd)))
G = [dict(find("2025 UC11"), short="Undecided: the orbit kept today misses Earth's orbit by 25 times the distance of the passage. The passage bent it, and the orbit from before is not in the record.", note=""),
     dict(find("2020 VT4"), short="Undecided: the orbit kept today misses Earth's orbit by six times the distance of the passage. The passage bent it.", note=""),
     dict(find("2024 UG9"), short="Timing-only: the orbits cross inside the target. Its timing alone kept it from a hit.", note=""),
     dict(find("2021 GS"), short="Timing-only, at two thirds of the way to the Moon: a far row in the record, and yet only timing kept it from a hit.", note=""),
     dict(find("2024 BX1", "1930"), short="Timing-only: this is the orbit that came down over Berlin on 21 January 2024. In 1930 it was a row 2.3 lunar distances out, with an uncertainty of more than a million kilometres.", note="")]
for g in G:
    g["note"] = {"timing": "On the record's own orbit, only timing kept it from a hit.",
                 "undecided": "On the record's own data, nobody can now say what it was near to.",
                 "geometry": "Its orbit would have had to differ."}[g["cls"]]
P = R["predictions"]; tc = R["three_classes"]; n = R["n_rows_le_1ld"]
F = [f"<b>The registered rule.</b> {P['P1']['value']} passages within one lunar distance were timing-only (P1 held). "
     f"Their share falls with distance, {P['P3']['value']} (P3 held), and yet {P['P4']['value']} of them lie beyond half the Moon's distance (P4 held). "
     f"Of the record's 10 nearest, only {P['P2']['value'].split(' of')[0]} were timing-only (P2 failed: I expected at least 6).",
     f"<b>The impactors.</b> All {R['impactor_rows']} earlier close-approach rows of the asteroids that later hit belong to orbits that cross inside the target, and all lie beyond one lunar distance (P5 held). "
     f"In the record they are far rows. In Lewis's order they are among the nearest.",
     f"<b>Found after the data, an estimate.</b> On {R['moid_now_exceeds_b']} of {n} rows, the orbit the record keeps today misses Earth's orbit by more than the passage missed Earth. "
     f"Allowing for how far a passage can bend its own orbit leaves {tc['timing']} timing-only, {tc['undecided']} undecided and {tc['geometry']} geometry. "
     f"Of the 10 nearest passages, {R['three_classes_nearest10']['undecided']} are undecided: for its nearest misses, the record no longer holds what they were near to."]
d.update(quotes=quotes, guess=G, findings=F, quotations_checked=len(Q))
html = open(os.path.join(here, "template.html")).read().replace("/*DATA*/null", json.dumps(d, separators=(",", ":"), ensure_ascii=False))
open(os.path.join(here, "index.html"), "w").write(html)
print("index.html", len(html), "bytes;", len(Q), "quotations checked")
