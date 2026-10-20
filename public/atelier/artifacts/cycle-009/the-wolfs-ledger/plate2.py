"""Plate II, The Run Before. The Wolf's Ledger, cycle 009, increment 2 (2026-10-20, second session).

Question of the cycle (cycle.json): when a warning turns out never needed, who pays for it, and does a
record of false alarms make the next warning less believed?

Plate I found that a village that keeps only outcomes charges the honest warner the liar's price. This
plate asks what part of that charge the warner could have controlled at all. Nagel ("Moral Luck", 1979)
names four kinds of luck; two bear on a warning. Luck in how things turn out: the same warning is "empty"
or "met" by what the sky does. Luck in one's circumstances: "the kind of problems and situations one
faces". A public that discounts a warning by the run of empty ones before it (plate I's habit, Vernon
Jones's cause) charges the warner and the people under its next warning for the order in which empties and
hits happened to fall. Nagel's proposed repair, which he then shows we do not live by, is to "concentrate
moral assessment on the actual decision in light of the probabilities". For a warner that is its rate.

Material: the Studio's TAKE COVER, AGAIN (studio@77470cc, works/2026-10-20-take-cover-again/data.js and
summary.json, sha256 asserted; offered to this practice as relay handoff ho-2026-10-20-studio-2): 53,267
National Weather Service tornado warnings 2008-2026, met or empty by each office's own verification, and
every county each warning touched. The Studio counted that 9,427 of 30,093 met county warnings came after
three or more empty ones there. This plate reuses that count and does not rescore it.

Text: T. Nagel, "Moral Luck", from Mortal Questions (1979), read in full on 2026-10-20 in a course reprint
(rintintin.colorado.edu/~vancecd/phil1100/Nagel1.pdf, running heads pp. 203-212; sha256 asserted, not
committed). Every quotation on the page must occur verbatim in it (whitespace and the reprint's running
heads folded). B. Williams, "Moral Luck" (PAS suppl. vol. 50, 1976), was not reached; nothing rests on it.

The rules, fixed before anything below was computed (2026-10-20):
  unit       a county entry: one warning in one county's sequence (the Studio's `counties`), in order of issue.
  run        for a met entry, the number of empty entries directly before it in that county (the Studio's rule;
             its counts are asserted, uncapped here).
  charge     what a habituated public withholds from the met warning: 1 - h^run, h = 0.6 (plate I's declared
             habit; the visitor may move it). A declared toy, not an estimate of any public.
  the deal   what the warner controls, read as generously as the record allows: how many of its warnings in a
             county in a year are met. A deal keeps those counts and shuffles which entries are met, within
             each county-year; the run and charge are then read off the whole sequence again. 200 deals,
             seed 20261020.
  luck share for each met entry, its expected charge over the deals (what its county-year's rate predicts) and
             its actual charge; the luck share is 1 - R^2 of the actual on the expected: the part of the charge
             the rate does not explain. Also the share of the charge's variance between offices (the office
             that issued the met warning), which is the most a "who warned" reading could explain.
  predictions (P1) under the deals the share of met entries after three or more empty ones is higher than the
             observed 31.3 %: tornadoes come in outbreaks, so real hits cluster and the real runs before them are
             shorter than chance. (P2) the luck share is above one half. (P3) the share of the charge's variance
             between offices is below one tenth.

Usage: python3 -I plate2.py STUDIO_WORK_DIR NAGEL_PDF_TXT   (the text as pdftotext writes it;
       writes plate2.json and plate2.js beside itself)
"""
import json, sys, re, hashlib, random, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
W, NT = Path(sys.argv[1]), Path(sys.argv[2])
SHA = {"data.js": "f3f2e758c5a96906a1d9e5c2f5adf99ee36e8590c5b6f6753004062836ac9626",
       "summary.json": "18e823f2a15a338d03b597e5a87bf42d3c785518e6a802477b0753b181611f25"}
for f, h in SHA.items():
    assert hashlib.sha256((W / f).read_bytes()).hexdigest() == h, f + " is not the Studio's file at 77470cc"
s = (W / "data.js").read_text()
D = json.loads(s[s.index("=") + 1:].strip().rstrip(";"))
SUM = json.loads((W / "summary.json").read_text())

# --- the quotations
raw = NT.read_text(encoding="utf-8")
lines = [l for l in raw.splitlines() if not re.fullmatch(r"\s*\d*\s*", l) and not re.fullmatch(r"\s*(\d+ Thomas Nagel|Moral luck)\s*", l)]
fold = lambda t: re.sub(r"\s+", " ", t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')).strip()
NAG = fold(" ".join(lines))
QUOTES = {
    "def": "Where a significant aspect of what someone does depends on factors beyond his control, yet we continue to treat him in that respect as an object of moral judgment, it can be called moral luck.",
    "circ": "luck in one's circumstances – the kind of problems and situations one faces.",
    "known": "It is possible also to assess the decision from the point of view of what could be known at the time, but this is not the end of the story.",
    "subtract": "it seems rational to subtract the effects of occurrences subsequent to the choice, that were merely possible at the time, and concentrate moral assessment on the actual decision in light of the probabilities.",
    "actual": "We judge people for what they actually do or fail to do, not just for what they would have done if circumstances had been different.",
    "driver": "The driver, if he is entirely without fault, will feel terrible about his role in the event, but will not have to reproach himself.",
    "fate": "It amounts to holding them responsible for the contributions of fate as well as for their own",
    "shrink": "The area of genuine agency, and therefore of legitimate moral judgment, seems to shrink under this scrutiny to an extensionless point.",
}
for k, q in QUOTES.items():
    assert fold(q) in NAG, "not verbatim in Nagel: " + k

# --- the record
T0 = dt.datetime(2008, 1, 1, tzinfo=dt.timezone.utc)
year = [(T0 + dt.timedelta(minutes=m)).year for m in D["issue"]]
MET, WFO = D["met"], D["wfo"]
H = 0.6
def runs_of(seq_met):
    out, run = [], 0
    for m in seq_met:
        if m: out.append(run); run = 0
        else: run += 1
    return out

obs = collections.Counter()
entries = []  # (county index, position, run, wfo)
for ci, (u, name, seq) in enumerate(D["counties"]):
    run = 0
    for p, i in enumerate(seq):
        if MET[i]:
            obs[run] += 1; entries.append((ci, p, run, WFO[i])); run = 0
        else:
            run += 1
n_met = sum(obs.values())
assert n_met == SUM["county_entries_met"] == 30093
capped = collections.Counter({min(k, 10): 0 for k in range(11)})
for k, v in obs.items(): capped[min(k, 10)] += v
assert {str(k): v for k, v in sorted(capped.items())} == SUM["fable_runs_before_met"]
after3 = sum(v for k, v in obs.items() if k >= 3)
assert after3 == SUM["fable_met_after_3plus_empty"] == 9427

# --- the deals
rng = random.Random(20261020)
NDEAL = 200
exp_charge = [0.0] * len(entries)
deal_after3, deal_hist = [], collections.Counter()
for d in range(NDEAL):
    k = 0; a3 = 0
    for ci, (u, name, seq) in enumerate(D["counties"]):
        lab = [MET[i] for i in seq]
        blocks = collections.defaultdict(list)
        for p, i in enumerate(seq): blocks[year[i]].append(p)
        new = lab[:]
        for ps in blocks.values():
            vals = [lab[p] for p in ps]; rng.shuffle(vals)
            for p, v in zip(ps, vals): new[p] = v
        # expected charge for the observed met entries: the charge a met entry at that position would carry
        # if the deal put a hit there is not defined when it doesn't; use the county-year's met entries instead
        run = 0; rs = []
        for p, m in enumerate(new):
            if m: rs.append((p, run)); run = 0
            else: run += 1
        for p, r in rs:
            deal_hist[min(r, 10)] += 1
            if r >= 3: a3 += 1
        # pair the deal's hits with the observed hits of the same county-year, in order
        byyear = collections.defaultdict(list)
        for p, r in rs: byyear[year[seq[p]]].append(r)
        ob = collections.defaultdict(list)
        while k < len(entries) and entries[k][0] == ci:
            ob[year[seq[entries[k][1]]]].append(k); k += 1
        for y, ks in ob.items():
            rr = byyear[y]; assert len(rr) == len(ks)
            for kk, r in zip(ks, rr): exp_charge[kk] += (1 - H ** r) / NDEAL
    deal_after3.append(a3 / n_met)
assert k == len(entries)

act = [1 - H ** e[2] for e in entries]
mean = lambda v: sum(v) / len(v)
ma, me = mean(act), mean(exp_charge)
sxy = sum((a - ma) * (b - me) for a, b in zip(act, exp_charge)); sxx = sum((b - me) ** 2 for b in exp_charge)
syy = sum((a - ma) ** 2 for a in act)
r2 = sxy * sxy / (sxx * syy)
by_office = collections.defaultdict(list)
for e, a in zip(entries, act): by_office[e[3]].append(a)
between = sum(len(v) * (mean(v) - ma) ** 2 for v in by_office.values()) / syy
da = sorted(deal_after3)
res = {
    "observed_after3": after3 / n_met, "deal_after3_mean": mean(deal_after3), "deal_after3_lo": da[4], "deal_after3_hi": da[-5],
    "observed_mean_run": mean([e[2] for e in entries]), "charge_mean": ma, "expected_charge_mean": me,
    "r2_rate": r2, "luck_share": 1 - r2, "between_office_share": between,
}
pred = {"P1": res["deal_after3_lo"] > res["observed_after3"], "P2": res["luck_share"] > 0.5, "P3": between < 0.1}

# --- what the page needs: counties with at least 20 entries, each as its sequence, with years
pick = [ci for ci, c in enumerate(D["counties"]) if len(c[2]) >= 20]
counties = []
for ci in pick:
    u, name, seq = D["counties"][ci]
    counties.append([u, name, D["wfos"][WFO[seq[0]]], "".join(str(MET[i]) for i in seq), [year[i] - 2008 for i in seq]])
shown_runs = collections.Counter(); longest = (-1, None)
for c in counties:
    run = 0
    for ch in c[3]:
        if ch == "1":
            shown_runs[min(run, 10)] += 1
            if run > longest[0]: longest = (run, c[0])
            run = 0
        else: run += 1
office_stats = {}
for w, v in by_office.items():
    office_stats[D["wfos"][w]] = {"met_entries": len(v), "charge_mean": round(mean(v), 4)}
out = {
    "_note": "Plate II of The Wolf's Ledger. Generated by plate2.py; rules and predictions in its header.",
    "studio": {"commit": "77470cc", "path": "works/2026-10-20-take-cover-again/", "sha256": SHA, "handoff": "ho-2026-10-20-studio-2"},
    "nagel_txt_sha256": hashlib.sha256(raw.encode("utf-8")).hexdigest(),
    "quotes": QUOTES, "h": H, "deals": NDEAL, "seed": 20261020,
    "met_entries": n_met, "after3": after3, "runs": {str(k): v for k, v in sorted(obs.items())},
    "deal_runs_mean": {str(k): round(v / NDEAL, 2) for k, v in sorted(deal_hist.items())},
    "results": {k: round(v, 4) for k, v in res.items()}, "predictions": pred,
    "office_spread": [round(min(v["charge_mean"] for v in office_stats.values() if v["met_entries"] >= 100), 4),
                      round(max(v["charge_mean"] for v in office_stats.values() if v["met_entries"] >= 100), 4)],
    "offices_100plus": sum(1 for v in office_stats.values() if v["met_entries"] >= 100),
    "counties_shown": len(counties), "shown_runs": {str(k): v for k, v in sorted(shown_runs.items())},
    "longest_run": {"run": longest[0], "county": longest[1]},
}
(HERE / "plate2.json").write_text(json.dumps(out, indent=1))
with open(HERE / "plate2.js", "w") as f:
    f.write("// generated by plate2.py from the Studio's TAKE COVER, AGAIN (studio@77470cc) and Nagel 1979\n")
    f.write("const P2=" + json.dumps(out, separators=(",", ":")) + ";\n")
    f.write("const P2C=" + json.dumps(counties, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("met_entries", "after3", "results", "predictions", "office_spread", "offices_100plus", "counties_shown")}, indent=1))
