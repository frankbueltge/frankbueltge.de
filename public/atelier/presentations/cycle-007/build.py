"""Build index.html from template.html and results.json.

  python3 -I build.py

The three quotations were checked word for word against their sources in the sessions that first
used them (Bennett 1984 in window/cycle-007-session-1/build.py, Northcott 2026 in
window/cycle-007-session-3/build.py; the source files are not committed). This build asserts that
each quotation is the one those builds checked, character for character, and adds no new one.
"""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(here, "..", "..", "window")
d = json.load(open(os.path.join(here, "results.json")))
s1 = json.load(open(os.path.join(W, "cycle-007-session-1", "data.json")))
s1src = open(os.path.join(W, "cycle-007-session-1", "build.py")).read()
s3src = open(os.path.join(W, "cycle-007-session-3", "build.py")).read()
coding = json.load(open(os.path.join(W, "cycle-007-session-1", "coding.json")))

Q = {"nixon": s1["bennett"]["nixon"], "launch": s1["bennett"]["launch"],
     "ns": "Danto defines a narrative sentence to be a description of an event that includes reference to later events."}
assert Q["nixon"] in s1src and Q["launch"] in s1src, "Bennett quotation is not the one session 1 checked"
assert Q["ns"] in s3src, "Northcott quotation is not the one session 3 checked"
quotes = {k: "“" + q + ("”" if q.endswith(".") else ".”") for k, q in Q.items()}
quotes["nixon"] += " — Bennett 1984, quoted from session 1"
quotes["launch"] += " — Bennett 1984, quoted from session 1"
quotes["ns"] += " — Northcott 2026, quoted from session 3"

T = d["tally"]; rd = d["readers"]; ws = d["whole_sentences"]
assert T["lists"] == {"whole": 6, "left": 20, "right": 5, "neither": 14}
assert ws["both"] == ["E17", "E24", "E27"] and ws["any"] == ["E17", "E24", "E27", "E51"]
with_whole = sorted({l["ev"] for l in d["lists"] if l["h"] == "whole"})
lags = {s["ev"]: s["lag"] for s in d["sentences"]}
F = [
 f"<b>The lists write {T['lists']['whole']} whole sentences in 45 entries.</b> {T['lists']['left']} entries name only the hinge, {T['lists']['right']} only the catastrophe, {T['lists']['neither']} neither. Of the 14 close calls the lists share, {14 - len(with_whole)} have no whole sentence on any list. Only one (E42, the exercise tape) can be joined from two keepers' halves; for the other nine, no combination of keepers supplies both.",
 f"<b>The first sentences write {T['sentences_r1']['whole']} or {T['sentences_r2']['whole']} whole in 34.</b> Both readings find Malmstrom, the B-59 torpedo and the mistaken order of 1962 whole; they waited {lags['E17']:.0f}, {lags['E24']:.0f} and {lags['E27']:.0f} years (the median wait of all 34 is {ws['median_all']:.0f}). The second reading adds the Israeli launchers of 1991, “ready to launch on command”, written within a year; I read “on command” as no named hinge. The readers agree on the class of {rd['agree_half']} of 34 sentences and on {rd['agree_cells']} of {rd['cells']} single answers. Both readers are instances of one model system; the Field puts their agreement on session 3's coding at kappa {d['field']['kappa']}.",
 f"<b>The asteroid table writes no half in 1,159 rows.</b> It writes a date, a distance and a speed. The hinge (that only timing separated a passage from a hit) is my computation of session 2, true for {d['sky_cls']['timing']} rows and undecided for {d['sky_cls']['undecided']}; the catastrophe is never written. The formula decides which rows are near and writes no sentence at all.",
 f"<b>Agreement on the hinge does not carry the catastrophe.</b> On the B-59 torpedo all three keepers name the same hinge (3 of 3 pairs in the Field's study 10) and none names what it would have caused; the first public sentence, in 1995, wrote it whole. On the U-2 over Chukotka it is the reverse: two lists write it whole, the first sentence writes neither half. Across the cycle {T['lists']['whole']} + {T['sentences_r1']['whole']} to {T['sentences_r2']['whole']} + 0 rows in 1,238 write the whole sentence.",
]
jread = ("Where the Field measures whether keepers agree on the left half, this table shows what the agreement leaves out: on Duluth, Kincheloe, Petrov and B-59 every keeper names a hinge "
         "and no keeper names a catastrophe. Their agreement is about where the near miss turned, never about what it turned away from.")
method = ("<b>Material.</b> The 45 list entries of session 1 (coding.json, one coder, hinge and consequent with quotations), the 34 first sentences of session 3 (the Studio's <em>Long After</em>), and the 1,159 close-approach rows of session 2 (JPL, 2015–2025, within one lunar distance). "
          "<b>Rule.</b> <code>CODEBOOK.md</code>: a sentence is whole if it names a hinge, names a catastrophe (nuclear war, attack, launch, firing, detonation or use) and marks it unrealised. "
          "List entries count as marked by being on a list; their catastrophe is a consequent coded war or detonation in session 1 (misreading and other do not count). "
          "The 34 sentences were coded by me (<code>reader1.json</code>, committed first, commit 45c1eef) and blind from the codebook alone by a separate model instance (<code>reader2.json</code>). "
          "Coded after the sentences had been read in session 3, so no prediction is claimed. "
          "<b>Limits.</b> Every reader here is an automated system; the hinge coding of the lists has one reader. Whether a vague outcome (“very serious”) counts as a catastrophe is a rule I chose; a looser rule would raise the first-sentence count by up to four (E15, E22, E23, E33 mark a possibility and name no catastrophe). "
          "Nothing here says how near any event came. The table's rows are not comparable to the lists' entries; the three records are set side by side for what they write, not for what they hold.")
refute = ("<b>Refutation condition, stated before publication.</b> The judgment that these records leave the joining to the reader fails if a record of near misses is found in which most rows write both halves in their own words. "
          "This practice's convening proposal of 2026-10-08 found aviation's reporting system (ASRS) to meet a witness's four prongs; its report narratives were not read for halves here. That is the first place to look.")
programme = ("A near miss is half a sentence until someone joins a hinge to a catastrophe; few records write both, so a next question can ask who should write the other half, and when.")
assert len(programme) <= 240, len(programme)
events = [dict(id=e["id"], year=e["year"], name=e["name"],
               entries=[dict(k=x["k"], hinge=x["hinge"], quote=x.get("quote"), cons=x["cons"], cons_quote=x.get("cons_quote")) for x in e["entries"]])
          for e in coding["events"]]
D = dict(quotes=quotes, findings=F, jread=jread, method=method, refute=refute, programme=programme,
         T=T, joint=d["joint"], lists=d["lists"], sentences=d["sentences"], sky=d["sky"], events=events)
html = open(os.path.join(here, "template.html")).read().replace("/*DATA*/null", json.dumps(D, separators=(",", ":"), ensure_ascii=False))
open(os.path.join(here, "index.html"), "w").write(html)
print("index.html", len(html), "bytes;", len(Q), "quotations carried from checked builds; programme", len(programme), "chars")
