"""Build index.html from template.html, results.json and the quoted preprint.

  python3 -I build.py <northcott.docx>

Northcott, "What did Danto show?", https://philsci-archive.pitt.edu/29862/1/Danto%2011.docx
Checks the file against the sha256 below and every quotation word for word (document text,
whitespace normalised), then writes index.html with the data inlined.
"""
import hashlib, json, os, re, sys, zipfile

SHA = "414f748e9dcd1ea0924c7694cfa78538625fe54c308db25e5a1fe3a6dca0fdf9"
Q = {"ic": "It knows all events as they happen and therefore can write a comprehensive and accurate record of all that occurs up to and including its own time",
     "ns": "Danto defines a narrative sentence to be a description of an event that includes reference to later events.",
     "box": "In Danto cases, by contrast, even perfect contemporary information does not give us (salient) explanatory knowledge.",
     "dan": "Completely to describe an event is to locate it in all the right stories, and this we cannot do."}
here = os.path.dirname(os.path.abspath(__file__))
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA, "preprint is not the pinned version"
import io
x = zipfile.ZipFile(io.BytesIO(raw)).read("word/document.xml").decode()
text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", x.replace("</w:p>", " ")))
for k, q in Q.items():
    assert q in text, ("quotation not found", k)
quotes = {k: "“" + q + ("”" if q.endswith(".") else ".”") for k, q in Q.items()}

d = json.load(open(os.path.join(here, "results.json")))
R = d["results"]; a, b = R["c1"], R["c2"]
cards = [dict(event="E14", text="It reports what crews believed on the runway, on the night. The Chronicler knew it then. Sagan's requests are what made it public in 1993."),
         dict(event="E22", text="“Could have” is not something that happens. No chronicle of the day holds it, however complete. Somebody had to judge it, later."),
         dict(event="E46", text="Its later event is the record's own: a memoir published in 1998. That is a narrative sentence in Danto's sense, about the record, not about the world.")]
def rng(k1, k2):
    return str(a[k1][k2]) if a[k1][k2] == b[k1][k2] else f"{a[k1][k2]}–{b[k1][k2]}" if a[k1][k2] < b[k1][k2] else f"{b[k1][k2]}–{a[k1][k2]}"
F = [f"<b>19 of 34 are chronicle.</b> In both readings, 19 of the first sentences that called a close call near report only what happened during it: a heading, an order, a belief on a runway. An Ideal Chronicler could have written them on the day. For these the wait was for access, and a request could shorten it. They include 7 of Sagan's 9. For those the Studio's case holds as it is stated: his requests set their date.",
     f"<b>The sentences that say “could have” all came late.</b> {rng('tally','M')} of 34 are modal: they say what could have happened or what prevented it. No chronicle of the day holds them, however complete. Every one of them waited ten years or more (median {a['median_by_code']['M']:.0f}–{b['median_by_code']['M']:.0f} years). None appeared within a year. Information about the day was never what they lacked. They needed somebody to judge.",
     f"<b>The narrative sentences are about the record.</b> {rng('tally','N')} of 34 refer to a later event, as Danto's narrative sentences do. In every case, in both readings, that later event is an act of the record itself: a release, a newspaper report, a memoir, a later testimony. None refers to a later event in the world. No close call here had to wait for history to happen before it could be near. It waited for someone to open the file or say it. (Found after the data.)",
     f"<b>Judgment (mine).</b> The Chronicler could have written the facts of most of these near misses and not one near miss. Its 19 sentences do not say “near”. A keeper later read them as near (session 1: the keeper writes the hinge). The modal sentences say “near”, and no information about the day could have written them. So the 24 years are made of two different waits. One is for access, which a request can shorten. The other is for a writer of the counterfactual, which no request can produce. Who decides that a near miss counts is whoever writes that counterfactual. In this record, that writer came decades later."]
held = lambda v: "held" if v else "failed"
P = (f"<b>Predictions</b> (committed before coding, <code>PREDICTIONS.md</code>): "
     f"P1, at least 20 chronicle: {held(a['P1'])} (19 in both readings). "
     f"P2, at most 5 narrative: {held(a['P2'] or b['P2'])} ({a['tally']['N']} and {b['tally']['N']}). "
     f"P3, of Sagan's 9 at least 7 chronicle and none narrative: {held(a['P3'] or b['P3'])} (7 chronicle; one narrative in both readings, E17, whose capability claim comes from two officers' later testimony). "
     f"P4, at least 15 of the 23 long waits chronicle: {held(a['P4'] or b['P4'])} (11). "
     f"P5, readers agree on at least 28 and never N against C: {held(R['P5'])} ({R['agree']} of 34; both disagreements N against M). "
     f"Refutation (12 or more narrative): not reached. I expected the record's later acts to stay out of the first sentences. They are in 8 to 10 of them.")
d.update(quotes=quotes, cards=cards, findings=F, predictions=P, quotations_checked=len(Q))
html = open(os.path.join(here, "template.html")).read().replace("/*DATA*/null", json.dumps(d, separators=(",", ":"), ensure_ascii=False))
open(os.path.join(here, "index.html"), "w").write(html)
print("index.html", len(html), "bytes;", len(Q), "quotations checked")
