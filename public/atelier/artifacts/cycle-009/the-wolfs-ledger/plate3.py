"""Plate III, The Stated Word. The Wolf's Ledger, cycle 009, increment 3 (2026-10-20, third session).

Question of the cycle (cycle.json): when a warning turns out never needed, who pays for it, and does a
record of false alarms make the next warning less believed?

Plate II ended on Nagel's repair: to judge "the actual decision in light of the probabilities". It needs a
stated chance, and the record of outcomes keeps none. This plate asks whether the warning itself keeps one.
Since 2012 the National Weather Service's tornado warnings carry coded tag lines written by the warner at
the hour of issue: a basis (RADAR INDICATED or OBSERVED) and, optionally, a damage threat (CONSIDERABLE,
CATASTROPHIC). The Service's own instruction defines them (NWSI 10-511, 26 Jan 2023). None of them is a
probability. The plate asks whether they work as one: whether a reader who holds the warner to what it
said, rather than to what the sky did, has anything to hold.

Material:
  - the Studio's TAKE COVER, AGAIN: data.js (sha256 asserted; byte-identical to plate II's studio@77470cc)
    and toll.js at studio@157af4b (sha256 asserted). data.js gives every tornado warning 2008-2026 with the
    office's own verdict at the hour (met / empty). toll.js gives, for each warning, the tornadoes of the
    Storm Prediction Center's final database (2008-2024) whose track touched its polygon and began from 15
    minutes before issue to expiry: the record written later. Offered to this practice in the Studio's
    bulletin of 2026-10-20 (s188): '"never needed" written twice'.
  - the tag lines: the Iowa Environmental Mesonet's storm-based warning archive, one CSV per year 2008-2024
    (cgi-bin/request/gis/watchwarn.py, phenomena TO, significance W, polygons only), rows with status NEW.
    Raw files stay outside the repository; their sha256 go to plate3.json.
    (Correction, same session, after the first run: the archive returns county rows beside the polygons,
    with empty tag lines; the first run did not drop them and so left 2,184 warnings out as ambiguous.
    The rule below says "NEW polygon"; the script now keeps gtype P only, as the rule always said.)
  - the text: NWSI 10-511 (weather.gov/media/directives/010_pdfs/pd01005011curr.pdf, sha256 asserted, not
    committed; a US government work). Every quotation on the page must occur verbatim in it (whitespace
    folded).

The rules, fixed before anything below was computed (2026-10-20, third session):
  join       a Studio warning is matched to the tag row of the same office whose NEW polygon was issued in
             the same minute. Unmatched or doubly matched warnings are counted and left out.
  era        warnings issued 2015-01-01 or later whose expiry falls inside the final database's years (the
             Studio's `end`): tags are written on most warnings from 2015, and the later record stops at 2024.
  the word   CAT: damage threat CATASTROPHIC, or flagged a tornado emergency. OC: OBSERVED + CONSIDERABLE.
             RC: RADAR INDICATED + CONSIDERABLE. O: OBSERVED, base. R: RADAR INDICATED, base. N: no tag, or
             POSSIBLE. Ordered by what the instruction says each one asserts: R < O, R < RC, O < OC < CAT.
  verdicts   hour: the office's own (data.js `met`). later: at least one tornado of the final database under
             the warning (toll.js `wt`).
  the chance a word's chance is its class's hit rate over the era, at the hour, nationally. It is read off
             outcomes, pooled over everyone who wrote the word: a reference class chosen by the warner's own
             words, at the hour, before the outcome (plates X and XII's condition).
  the charge for an office, outcome reading: its share of empty warnings. Word reading: its empties minus the
             empties its own words predicted (the sum of 1 - chance over its warnings), per warning. This is
             what is left for the warner's decision once it is held to what it said.
  predictions (P1) the words are a chance in rank: at the hour, hit rate R < O, R < RC, O < OC < CAT.
             (P2) the words state too little to absolve: across offices with at least 100 era warnings, the
             share of the variance of the empty share that the word-expected empty share explains (R^2) is
             below one quarter. (P3) the word predicts the later verdict: of warnings empty at the hour, the
             final database fills those that said OBSERVED (O, OC, CAT) at least 1.5 times as often as those
             that said RADAR INDICATED (R, RC).

Usage: python3 -I plate3.py STUDIO_WORK_DIR IEM_CSV_DIR NWSI_TXT
       (NWSI_TXT is the directive as `pdftotext -layout` writes it; writes plate3.json and plate3.js here)
"""
import json, sys, re, csv, hashlib, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
W, RAW, NT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
SHA = {"data.js": "f3f2e758c5a96906a1d9e5c2f5adf99ee36e8590c5b6f6753004062836ac9626",
       "toll.js": "cc9ba3f43261abcb605db39513bb1e2b8842487f4213ee2e827285c93fbbcd0b"}
for f, h in SHA.items():
    assert hashlib.sha256((W / f).read_bytes()).hexdigest() == h, f + " is not the Studio's file at 157af4b"


def js(p):
    s = p.read_text()
    return json.loads(s[s.index("=") + 1:].strip().rstrip(";"))


D, TL = js(W / "data.js"), js(W / "toll.js")
T0 = dt.datetime(2008, 1, 1)
n = len(D["issue"])
assert n == 53267 and TL["win"] == 15 and TL["last"] == "2024-12-29"

# --- the text: quotations asserted verbatim
fold = lambda s: re.sub(r"\s+", " ", s.replace("’", "'").replace("“", '"').replace("”", '"'))
TXT = fold(NT.read_text())
QUOTES = {
    "base": "This terminology refers to the default or uncategorized threshold for a warning.",
    "issue": "WFOs should issue TORs when there is radar indication and/or reliable reports of a tornado or developing tornado.",
    "considerable": "In situations when a tornado is occurring, whether from high confidence in evidential features in radar data and/or visual confirmation through reliable sources, WFOs have the option to express that the threat is considerable.",
    "catastrophic": "it should never be a single forecaster's choice, but rather a team decision with input from all relevant office staff.",
    "pathcast": "should use terms of uncertainty appropriate to the state of the science",
    "tags": "These outputs are linked to choices made within the WarnGen product generation application and are not editable in the warning text.",
}
for k, q in QUOTES.items():
    assert fold(q) in TXT, "not verbatim in NWSI 10-511: " + k
for word in ("probability", "percent"):
    assert word not in TXT.lower(), word  # the instruction states no chance anywhere

# --- the tag lines
raw = {}
tag = {}
dup = set()
for p in sorted(RAW.glob("ww_*.csv")):
    b = p.read_bytes()
    raw[p.name] = {"bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    for r in csv.DictReader(b.decode().splitlines()):
        if r["status"] != "NEW" or r["phenomena"] != "TO" or r["significance"] != "W" or r["gtype"] != "P":
            continue
        m = int((dt.datetime.strptime(r["utc_issue"], "%Y-%m-%d %H:%M") - T0).total_seconds() // 60)
        k = (r["wfo"], m)
        if k in tag and tag[k] != (r["tornadotag"], r["damagetag"], r["is_emergency"]):
            dup.add(k)
        tag[k] = (r["tornadotag"], r["damagetag"], r["is_emergency"])


def word(t):
    tt, dg, em = t
    if dg == "CATASTROPHIC" or em == "True":
        return "CAT"
    if tt == "OBSERVED":
        return "OC" if dg == "CONSIDERABLE" else "O"
    if tt == "RADAR INDICATED":
        return "RC" if dg == "CONSIDERABLE" else "R"
    return "N"


ERA0 = int((dt.datetime(2015, 1, 1) - T0).total_seconds() // 60)
filled = {int(k) for k, v in TL["wt"].items() if v}
rows, unmatched, ambiguous = [], 0, 0
for i in range(n):
    if D["issue"][i] < ERA0 or D["issue"][i] + D["dur"][i] > TL["end"]:
        continue
    k = (D["wfos"][D["wfo"][i]], D["issue"][i])
    if k in dup:
        ambiguous += 1; continue
    if k not in tag:
        unmatched += 1; continue
    rows.append((i, D["wfo"][i], word(tag[k]), D["met"][i], 1 if i in filled else 0))
ORDER = ["R", "O", "RC", "OC", "CAT", "N"]

# --- the classes
cls = {}
for c in ORDER:
    rs = [r for r in rows if r[2] == c]
    e = [r for r in rs if not r[3]]; m = [r for r in rs if r[3]]
    cls[c] = {"n": len(rs), "hit_hour": sum(r[3] for r in rs) / len(rs), "hit_later": sum(r[4] for r in rs) / len(rs),
              "empty_hour": len(e), "empty_filled_later": sum(r[4] for r in e),
              "met_hour": len(m), "met_unfilled_later": sum(1 - r[4] for r in m)}
h = {c: cls[c]["hit_hour"] for c in ORDER}
P1 = h["R"] < h["O"] and h["R"] < h["RC"] and h["O"] < h["OC"] < h["CAT"]

# --- the offices
byo = collections.defaultdict(list)
for r in rows:
    byo[r[1]].append(r)
off = []
for o, rs in byo.items():
    k = len(rs)
    emp = sum(1 - r[3] for r in rs)
    exp = sum(1 - h[r[2]] for r in rs)
    off.append({"wfo": D["wfos"][o], "n": k, "far": emp / k, "far_words": exp / k, "excess": (emp - exp) / k,
                "far_later": sum(1 - r[4] for r in rs) / k,
                "said_obs": sum(r[2] in ("O", "OC", "CAT") for r in rs) / k,
                "said_none": sum(r[2] == "N" for r in rs) / k})
big = [x for x in off if x["n"] >= 100]


def r2(xs, ys):
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs); syy = sum((y - my) ** 2 for y in ys)
    return sxy * sxy / (sxx * syy)


R2 = r2([x["far_words"] for x in big], [x["far"] for x in big])
P2 = R2 < 0.25
fill = lambda cs: (sum(cls[c]["empty_filled_later"] for c in cs) / sum(cls[c]["empty_hour"] for c in cs))
f_obs, f_radar = fill(("O", "OC", "CAT")), fill(("R", "RC"))
P3 = f_obs >= 1.5 * f_radar
# how far the office ranking moves between the two readings
rank = lambda key: {x["wfo"]: i for i, x in enumerate(sorted(big, key=lambda x: (x[key], x["wfo"])))}
ra, rb = rank("far"), rank("excess")
moves = sorted(((abs(ra[w] - rb[w]), w) for w in ra), reverse=True)
r2_later = r2([x["far"] for x in big], [x["far_later"] for x in big])

out = {
    "rules_sha256": hashlib.sha256(Path(__file__).read_text().split('"""')[1].encode()).hexdigest(),
    "studio": {"commit": "157af4b", "sha256": SHA}, "iem_csv": raw,
    "join": {"era_warnings": len(rows) + unmatched + ambiguous, "matched": len(rows), "unmatched": unmatched,
             "ambiguous": ambiguous},
    "classes": cls, "order": ORDER,
    "predictions": {"P1": {"held": P1, "hit_hour": h},
                    "P2": {"held": P2, "r2": R2, "offices": len(big)},
                    "P3": {"held": P3, "filled_obs": f_obs, "filled_radar": f_radar, "ratio": f_obs / f_radar}},
    "offices": sorted(big, key=lambda x: x["wfo"]),
    "rank_moves": {"median": sorted(m for m, _ in moves)[len(moves) // 2], "largest": moves[:5]},
    "r2_hour_vs_later": r2_later,
    "totals": {"empty_hour": sum(1 - r[3] for r in rows), "empty_filled_later": sum(r[4] for r in rows if not r[3]),
               "said_obs_share": sum(r[2] in ("O", "OC", "CAT") for r in rows) / len(rows)},
    "quotes": QUOTES,
}
(HERE / "plate3.json").write_text(json.dumps(out, indent=1))
# the page: per office, its era warnings in order as word code + hour + later
code = {c: i for i, c in enumerate(ORDER)}
seq = collections.defaultdict(list)
for i, o, c, mh, ml in sorted(rows, key=lambda r: (r[1], D["issue"][r[0]])):
    seq[D["wfos"][o]].append([D["issue"][i], code[c] * 4 + mh * 2 + ml])
page = {"order": ORDER, "chance": h, "classes": cls, "t0": D["t0"],
        "offices": {x["wfo"]: {k: x[k] for k in ("n", "far", "far_words", "excess", "far_later")} for x in big},
        "seq": {w: v for w, v in seq.items() if w in {x["wfo"] for x in big}},
        "P": {k: v["held"] for k, v in out["predictions"].items()}, "r2": R2, "fill": [f_obs, f_radar],
        "join": out["join"], "move_median": out["rank_moves"]["median"]}
(HERE / "plate3.js").write_text("window.P3=" + json.dumps(page, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("join", "predictions", "rank_moves", "r2_hour_vs_later", "totals")}, indent=1))
for c in ORDER:
    print(c, {k: (round(v, 3) if isinstance(v, float) else v) for k, v in cls[c].items()})
