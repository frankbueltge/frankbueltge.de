"""Correction of 2026-10-09 (session 163). Session 162 followed the Atelier's presented count (10 rules hand YES to
a machine), which read the three rules given by reference inconsistently: one by reference, two not. The Atelier
checked and corrected it on 2026-10-08 (ulysses 9a589b9, presentations/cycle-006/results.json, `correction`):
consistently read it is 12 (a rule given by reference counts as the referenced rule) or 9 (own text only).
This script reads that correction (sha256 recorded below), rewrites pen.json so the page follows a consistent
reading (by reference by default, own text on a switch), keeps the presented reading beside them as superseded,
and checks that the blind reading made here (second_reading.json) equals the own-text reading on all 62 rules."""
import json, hashlib, sys, urllib.request
SRC = "https://raw.githubusercontent.com/frankbueltge/ulysses/9a589b9432fa5f08f8960d266e036caa6afde842/presentations/cycle-006/results.json"
try: raw = urllib.request.urlopen(SRC, timeout=60).read()
except Exception: raw = open(sys.argv[1], "rb").read()  # a local copy of the same file
C = json.loads(raw)["correction"]
P = json.load(open("pen.json")); B = {b["id"]: b["cls"] for b in json.load(open("second_reading.json"))}
R = C["readings"]; ids = set(C["by_reference"])
for r in P["rows"]:
    r.setdefault("writer_presented", r["writer"])  # what session 162 published, kept as superseded
    assert r["id"] in ids or r["writer_presented"] == B[r["id"]] or r["id"] in P["disagree"]
own = {r["id"]: R["own_text"]["cls"].get(r["id"], r["writer_presented"]) for r in P["rows"]}
ref = {r["id"]: R["by_reference"]["cls"].get(r["id"], r["writer_presented"]) for r in P["rows"]}
CL = ("machine", "threshold", "unnamed", "norule")
count = lambda d: {c: sum(v == c for v in d.values()) for c in CL}
for k, d in (("own_text", own), ("by_reference", ref)):
    assert count(d) == R[k]["by_class"], (k, count(d), R[k]["by_class"])
blind_vs_own = sum(B[i] == own[i] for i in own)
assert blind_vs_own == 62, blind_vs_own
for r in P["rows"]:
    r["writer"] = ref[r["id"]]; r["writer_own_text"] = own[r["id"]]
    if r["id"] in ids:
        r["by_reference"] = {"refers_to": C["by_reference"][r["id"]]["refers_to"], "quote": C["by_reference"][r["id"]]["quote"]}
P["by_writer"] = count(ref); P["by_writer_own_text"] = count(own); P["by_writer_presented_superseded"] = R["presented"]["by_class"]
P["correction"] = {"date": "2026-10-09", "source": SRC, "sha256": hashlib.sha256(raw).hexdigest(),
  "what": "Session 162 published 10 rules handing YES to a machine, the Atelier's count as presented, which read the three rules given by reference inconsistently. Consistently read: 12 by reference (the page's default) or 9 on own text. The blind reading made here equals the own-text reading on all 62 rules.",
  "by_reference_ids": sorted(ids), "blind_vs_own_text": blind_vs_own}
json.dump(P, open("pen.json", "w"), indent=1, ensure_ascii=False)
print(P["by_writer"], P["by_writer_own_text"], P["correction"]["sha256"][:12], blind_vs_own)
