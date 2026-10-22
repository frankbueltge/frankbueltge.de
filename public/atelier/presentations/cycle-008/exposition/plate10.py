"""Plate X, The Copy-Text. Built on the Field's study 26 (field-research@4784983,
artifacts/2026-10-17-the-odds-written-down/data/, sha256 of each input asserted), offered to this practice
in the Field's bulletin of 2026-10-19 (s211) as an answer to plate VIII: the sighted range splits into an
"outcome hand", free only on the 50 sequences whose event changes with the version, and an "odds hand",
free only on the 182 where it never does; from the first-hour clock the odds hand alone lifts 0.57 to 1.28,
the outcome hand alone only to 0.95.

The question this plate asks of that answer is not the Field's. It reads the nine versions of a forecast as
an editor reads the editions of a text, through W. W. Greg, "The Rationale of Copy-Text", Studies in
Bibliography 3 (1950/51) 19-36, read in full on 2026-10-19: a copy-text chosen as "a matter of convenience
rather than of principle", and variant readings admitted on "the likelihood of their being what the author
wrote rather than their appeal to the individual taste of the editor". On a forecast, a variant reading of
a quiet sequence changes nothing in the world, only what was promised. The plate asks how far choosing
among promises alone moves the verdict, and how many variants an editor would have to admit to move it.

The rules, fixed before counting (2026-10-19, third session):
  set, cells   study 25's common set of 232 sequences at nine lags, re-added from lagged_cells_25.tsv
               exactly as plate8.py does; V = the 50 whose event (o > 0) differs between lags, I = the 182.
  copy-text    one clock lag L for every sequence (the Field's base).
  the hands    WORDS: free on I, V held at L (the Field's odds hand). WEEKS: free on V, I held at L (its
               outcome hand). BOTH: free on all. Extremes of observed/stated, exact, found here by bisection
               on the ratio (a second path; the Field used Dinkelbach's iteration); each asserted equal to
               results_26.json to 0.001.
  ties         where a variant and the copy-text give the same value, the copy-text stands (Greg, p. 31: where the
               claims of two readings appear exactly balanced, the editor is "to let it stand"). Substitutions are counted after that rule.
  intervals    for each extreme reading, a 95 % interval from 2,000 resamplings of sequences, seed 20261019
               (plate VIII's scheme); verdict words as the Field's.
  fewest       for each copy-text and each hand, the fewest variants that must be admitted for the ratio to
               reach 1 (kind) or to fall under half the copy-text's ratio (harsh). Each sequence's best
               single variant is independent of the others, so taking the largest gains first is exact.
  blind words  for all 232, "the version that stated least" and "the version that stated most": rules that
               can be declared before any outcome is fetched, reported in the indicative.
  outcome-blind  a variant chosen by its stated odds alone, never by what came: for the WORDS hand, "always
               the version that stated least" and "always the version that stated most" per quiet sequence.
               These are declared, blind rules, and are reported in the indicative.

Usage: python3 -I plate10.py FIELD_DATA_DIR    (writes plate10.json and plate10.js beside itself)
"""
import json, sys, hashlib, random, collections
from pathlib import Path

HERE = Path(__file__).parent
D = Path(sys.argv[1])
COMMIT = "4784983"
SHA = {"lagged_cells_25.tsv": "669da73e28c1cc2d0fdcfb0a94f3fdb6bd0257327093204041ad0253ebc0d49a",
       "results_26.json": "91e35fa31962bb7eeaa43bfca984cc3659cddb23c57bd135f707c733ac3987e3"}
for f, h in SHA.items():
    assert hashlib.sha256((D / f).read_bytes()).hexdigest() == h, f + " is not the Field's file at 4784983"
R26 = json.load(open(D / "results_26.json"))
LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
rows = [l.rstrip("\n").split("\t") for l in open(D / "lagged_cells_25.tsv")]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0]))
for r in rows[1:]:
    c = dict(zip(rows[0], r)); g[c["id"]][int(c["lag"])][0] += int(c["hit"]); g[c["id"]][int(c["lag"])][1] += float(c["p"])
ids = sorted(i for i in g if all(l in g[i] for l in LAGS))
assert len(ids) == 232
# the same order and cells as plate VIII's P8R, which the page reuses
P8R = json.loads((HERE / "plate8.js").read_text().split("const P8R=")[1].rstrip().rstrip(";"))
assert [r[0] for r in P8R] == ids and all(abs(P8R[n][3][k][1] - round(g[i][L][1], 4)) < 1e-9 and P8R[n][3][k][0] == g[i][L][0]
                                          for n, i in enumerate(ids) for k, L in enumerate(LAGS))
V = {i for i in ids if len({g[i][l][0] > 0 for l in LAGS}) > 1}; I = set(ids) - V
assert (len(V), len(I)) == (50, 182) and R26["event_counts"]["changes"] == 50

def extreme(sign, free, base):
    """Exact extreme of O/E by bisection on the ratio; ties keep the copy-text."""
    def best(i, lam):
        opts = LAGS if i in free else [base]
        v = {l: sign * (g[i][l][0] - lam * g[i][l][1]) for l in opts}
        m = max(v.values()); return base if v.get(base, -1e18) >= m - 1e-12 else max(opts, key=lambda l: v[l])
    lo, hi = 0.0, 50.0
    for _ in range(200):
        m = (lo + hi) / 2; s = sum(sign * (g[i][best(i, m)][0] - m * g[i][best(i, m)][1]) for i in ids)
        if sign == 1: lo, hi = (m, hi) if s > 0 else (lo, m)
        else: lo, hi = (lo, m) if s > 0 else (m, hi)
    return [best(i, (lo + hi) / 2) for i in ids]

rng = random.Random(20261019); BOOT = [[rng.randrange(232) for _ in ids] for _ in range(2000)]
q = lambda v, a: v[int(a * (len(v) - 1))]
def verdict(pick):
    S = [g[i][l] for i, l in zip(ids, pick)]; o = sum(s[0] for s in S); e = sum(s[1] for s in S)
    rs = sorted(sum(S[j][0] for j in b) / sum(S[j][1] for j in b) for b in BOOT)
    lo, hi = q(rs, .025), q(rs, .975)
    return {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3), "ci": [round(lo, 3), round(hi, 3)],
            "verdict": "too high" if hi < 1 else "too low" if lo > 1 else "cannot be told from right"}

def fewest(free, base, target, key=None):
    """Fewest substitutions in `free` that bring O - target*E to >= 0 (kind); exact by largest gains first.
    With `key`, also stores the reading that does it in PICKS[key]."""
    o = sum(g[i][base][0] for i in ids); e = sum(g[i][base][1] for i in ids); gap = target * e - o
    if gap <= 0: return 0
    val = lambda i, l: g[i][l][0] - target * g[i][l][1]
    gains = sorted(((max(val(i, l) for l in LAGS) - val(i, base), i) for i in free), reverse=True)
    acc, sub = 0, {}
    for n, (x, i) in enumerate(gains, 1):
        if x <= 0: return None
        acc += x; sub[i] = max(LAGS, key=lambda l: (val(i, l), l == base))
        if acc >= gap:
            if key: PICKS[key] = "".join(str(li[sub.get(j, base)]) for j in ids)
            return n
    return None
def fewest_harsh(free, base, target):
    o = sum(g[i][base][0] for i in ids); e = sum(g[i][base][1] for i in ids); gap = o - target * e
    if gap <= 0: return 0
    gains = sorted((max((g[i][base][0] - target * g[i][base][1]) - (g[i][l][0] - target * g[i][l][1]) for l in LAGS) for i in free), reverse=True)
    acc = 0
    for n, x in enumerate(gains, 1):
        if x <= 0: return None
        acc += x
        if acc >= gap: return n
    return None

HANDS = {"words": I, "weeks": V, "both": set(ids)}
HK = {"words": "w", "weeks": "e", "both": "b"}   # the keys of PICKS in plate10.js
FIELD = {"words": "odds_hand", "weeks": "outcome_hand"}
li = {L: k for k, L in enumerate(LAGS)}
out = {"source": {"repo": "frankbueltge/field-research", "commit": COMMIT,
                  "path": "artifacts/2026-10-17-the-odds-written-down/data/", "sha256": SHA},
       "sequences": 232, "quiet": len(I), "moving": len(V), "lags_h": LAGS, "copy_texts": []}
PICKS = {}
for k, L in enumerate(LAGS):
    ct = {"lag_h": L, "copy_text": verdict([L] * 232), "hands": {}}
    for h, free in HANDS.items():
        H = {}
        for name, sign in (("harshest", -1), ("kindest", 1)):
            p = extreme(sign, free, L); v = verdict(p)
            v["substituted"] = sum(1 for x in p if x != L)
            if h in FIELD: assert abs(v["ratio"] - R26["hands"][k][FIELD[h]][name]["ratio"]) <= 0.001, (L, h, name)
            elif L == 0: assert abs(v["ratio"] - R26["full_sighted"][name]["ratio"]) <= 0.001, (h, name)
            H[name] = v; PICKS[f"{k}{HK[h]}{name[0]}"] = "".join(str(li[x]) for x in p)
        r0 = ct["copy_text"]["ratio"]
        H["fewest_to_right"] = fewest(free, L, 1.0, f"{k}{HK[h]}r") if r0 < 1 else 0
        H["fewest_to_halve"] = fewest_harsh(free, L, r0 / 2)
        ct["hands"][h] = H
    # outcome-blind rules on the words: chosen by stated odds alone
    for name, f in (("stated_least", min), ("stated_most", max)):
        p = [f(LAGS, key=lambda l: (g[i][l][1], l)) if i in I else L for i in ids]
        ct["hands"]["words"][name] = verdict(p)
    out["copy_texts"].append(ct)
# the same two rules on the words for all 232 sequences: fully blind, declarable before any outcome
out["blind_on_the_words"] = {name: verdict([f(LAGS, key=lambda l: (g[i][l][1], l)) for i in ids]) for name, f in (("stated_least", min), ("stated_most", max))}
for name, f in (("stated_least", min), ("stated_most", max)):
    PICKS["b" + name[7]] = "".join(str(li[f(LAGS, key=lambda l: (g[i][l][1], l))]) for i in ids)
first = out["copy_texts"][0]
out["first_hour"] = {"copy_text": first["copy_text"]["ratio"], "words_kindest": first["hands"]["words"]["kindest"],
                     "weeks_kindest": first["hands"]["weeks"]["kindest"],
                     "words_fewest_to_right": first["hands"]["words"]["fewest_to_right"],
                     "weeks_fewest_to_right": first["hands"]["weeks"]["fewest_to_right"]}
(HERE / "plate10.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "plate10.js").write_text("// generated by plate10.py from the Field's study 26 (USGS aftershock forecasts and ComCat); rows reuse plate8.js's P8R\n"
                                 "const P10=" + json.dumps(out) + ";\nconst P10K=" + json.dumps(PICKS, separators=(",", ":")) + ";\n")
for ct in out["copy_texts"]:
    print(ct["lag_h"], ct["copy_text"]["ratio"], {h: (v["harshest"]["ratio"], v["kindest"]["ratio"], v["kindest"]["ci"], v["kindest"]["verdict"], v["kindest"]["substituted"], v["fewest_to_right"], v["fewest_to_halve"]) for h, v in ct["hands"].items()},
          ct["hands"]["words"]["stated_least"]["ratio"], ct["hands"]["words"]["stated_least"]["verdict"], ct["hands"]["words"]["stated_most"]["ratio"])
