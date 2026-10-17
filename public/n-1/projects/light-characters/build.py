"""Project 10: build rows.json (committed, derived) and index.html.
Usage: python3 build.py SCRATCHDIR   (needs rows_full.json from session1.py, pairs2_full.json from session2.py and the seven volumes)
Session 2 added the arcs: each great pair's shared field, and each great light's visible arc.
Session 3 added each great pair's last state (explore3.py's partition; needs pairs3_full.json from session3.py) and writes the work
page, within-sight-of-itself/index.html, from the same template with the study's blocks (<!--S--> ... <!--/S-->) taken out."""
import json, re, sys
import numpy as np
from lib2 import arcs, BINS

sc = sys.argv[1]
rawl = []
for v in range(110, 117):
    rawl += json.load(open(f"{sc}/lol{v}.json"))["ngalol"]
rows = json.load(open(f"{sc}/rows_full.json"))
assert len(rows) == len(rawl)
res = json.load(open("session1.json"))
res2 = json.load(open("session2.json"))
p2 = {(p["A"], p["B"]): p for p in json.load(open(f"{sc}/pairs2_full.json"))}
res3 = json.load(open("session3.json")); ex3 = json.load(open("explore3.json"))
from explore3 import state
p3 = {(p["A"], p["B"]): state(p) for p in json.load(open(f"{sc}/pairs3_full.json"))}


def intervals(mask):
    """Visible arc as [[from, to], ...] in degrees (clockwise), [] meaning all round."""
    if mask.all():
        return []
    out, i = [], 0
    m = np.concatenate([mask, mask])
    start = int(np.argmin(mask))  # begin at a dark bin so no run wraps
    run = None
    for k in range(start, start + BINS):
        if m[k] and run is None:
            run = k
        if not m[k] and run is not None:
            out.append([round(run * 360 / BINS % 360, 1), round(k * 360 / BINS % 360, 1)]); run = None
    if run is not None:
        out.append([round(run * 360 / BINS % 360, 1), round((start + BINS) * 360 / BINS % 360, 1)])
    return out

ex = json.load(open("explore1.json"))
T = [i for i, x in enumerate(rows) if x["kind"] == "rhythmic" and x["lat"] is not None]
pos_in_T = {ri: ti for ti, ri in enumerate(T)}
NM = 1.852

# committed rows: one per rhythmic light with a position (no text but the key and the NGA number)
out_rows = []
for ti, ri in enumerate(T):
    x = rows[ri]
    out_rows.append([x["v"], x["f"].replace("\n", " "), x["k"], x["p"], x["rg"], round(x["lat"], 3), round(x["lon"], 3),
                     x["twin_km"], x["twin_i"] if x["twin_i"] >= 0 else None])
json.dump({"columns": ["volume", "feature_number", "key", "period_s", "range_nm", "lat", "lon", "nearest_twin_km",
                       "nearest_twin_row"], "rows": out_rows}, open("rows.json", "w"), separators=(",", ":"))

PH = re.compile(r"(fl|ec|lt)\.\s*(\d+(?:\.\d+)?)\s*s", re.I)


def phases(ri):
    """On/off durations from the listed phase lines; synthesised (and flagged) when none are listed."""
    x, r = rows[ri], rawl[ri]
    seq = [(m.group(1).lower() != "ec", float(m.group(2))) for m in PH.finditer(r["characteristic"] or "")]
    if seq and abs(sum(d for _, d in seq) - x["p"]) < 0.6:
        return seq, False
    k, p = x["k"], x["p"]
    n = re.search(r"\((\d+)\)", k)
    n = int(n.group(1)) if n else 1
    if k.startswith("Iso"):
        return [(True, p / 2), (False, p / 2)], True
    if k.startswith("Oc"):
        return [(True, p - 1), (False, 1)], True
    on = 2.0 if k.startswith("L.Fl") else 0.5
    seq = []
    for i in range(n):
        seq += [(True, on), (False, 1.0 if i < n - 1 else max(0.5, p - n * on - (n - 1)))]
    return seq, True


def colour(k):
    c = re.findall(r"\b([WRGY])\.", k.replace("Fl.", "").replace("Oc.", "").replace("Iso.", "").replace("Al.", "").replace("Q.", ""))
    return c[0] if c else "W"


pts = []
for ti, ri in enumerate(T):
    x = rows[ri]
    pts.append([round(x["lat"], 2), round(x["lon"], 2), {"major": 3, "middle": 2, "minor": 1}.get(x["c"], 0)])
pairs, info = [], {}
for ti, ri in enumerate(T):
    x = rows[ri]
    if x["rg"] is None or x["twin_km"] is None or x["twin_km"] > x["rg"] * NM:
        continue
    tj = x["twin_i"]
    if x["c"] == "major":
        q = p2[(ti, tj)]
        pairs.append([ti, tj, 1, round(q["share"], 3) if q["share"] is not None else 0, 1 if q["shared"] == 0 else 0, q["rB_used"],
                      p3[(ti, tj)]])
    else:
        pairs.append([ti, tj, 0])
    if x["c"] == "major":
        for t in (ti, tj):
            if t not in info:
                r = rawl[T[t]]
                seq, synth = phases(T[t])
                info[t] = {"n": (r["name"] or "").replace("\n", " ").strip(" -")[:80], "f": rows[T[t]]["f"].replace("\n", " "),
                           "k": rows[T[t]]["k"], "p": rows[T[t]]["p"], "rg": rows[T[t]]["rg"], "c": colour(rows[T[t]]["k"]),
                           "s": [[1 if on else 0, d] for on, d in seq], "y": synth,
                           "a": intervals(arcs(r["remarks"])[0]), "la": rows[T[t]]["lat"], "lo": rows[T[t]]["lon"]}
major = res["classes"]["major"]; minor = res["classes"]["minor"]; allc = res["classes"]["all"]
n_major_pairs = sum(1 for p in pairs if p[2])
data = {"pts": pts, "pairs": pairs, "info": {str(k): v for k, v in info.items()}}

html = open("template.html").read()
fill = {
    "DATA": json.dumps(data, separators=(",", ":")),
    "N_LIGHTS": f'{res["counts"]["lights"]:,}',
    "N_RHYTHMIC": f'{res["rhythmic_with_position"]:,}',
    "N_RANGE": f'{allc["n"]:,}',
    "N_WITHIN": f'{allc["twin_within_range"]:,}',
    "PCT_ALL": f'{100 * allc["share"]:.0f}',
    "N_MAJOR": f'{major["n"]:,}',
    "N_MAJOR_WITHIN": f'{major["twin_within_range"]:,}',
    "PCT_MAJOR": f'{100 * major["share"]:.1f}',
    "PCT_MINOR": f'{100 * minor["share"]:.0f}',
    "R_MAJOR": f'{major["R"]:.2f}', "R_MINOR": f'{minor["R"]:.2f}',
    "R_MAJOR_2": f'{ex["by_grid"]["2"]["major"]["R"]:.2f}', "R_MINOR_2": f'{ex["by_grid"]["2"]["minor"]["R"]:.2f}',
    "N_PAIRS2": f'{res2["pairs"]:,}', "N_RESTR": f'{res2["restricted_any"]:,}', "PCT_RESTR": f'{100 * res2["restricted_share"]:.0f}',
    "N_KEEP": f'{res2["keep_shared"]:,}', "N_PARTED": f'{res2["parted"]:,}', "PCT_KEEP": f'{100 * res2["keep_share"]:.0f}',
    "N_WITHC": f'{res2["with_neighbour"]:,}', "N_KEEPC": f'{res2["neighbour_keep"]:,}',
    "PCT_KEEPC": f'{100 * res2["neighbour_keep_share"]:.0f}', "MED_SHARE": f'{100 * res2["median_shared_share"]:.0f}',
    "N_FIXED": f'{res["counts"]["kind_fixed"]:,}', "N_UNPARSED": f'{res["counts"]["kind_unparsed"]:,}',
}
P = ex3["partition"]
fill.update({"N_BOTH": f'{res3["both_stated"]:,}', "N_PH_PARTED": f'{res3["phase_parted"]:,}',
             "PCT_PH": f'{100 * res3["parted_share_of_both"]:.0f}', "N_PH_PERC": f'{res3["phase_parted_perceptible"]:,}',
             "N_MUTUAL": f'{res3["mutual"]:,}', "N_ROT": f'{ex3["parted_rotation_only"]}',
             "S_ARCS": str(P["arcs"]), "S_PHASE": str(P["phase"]), "S_ONEWAY": str(P["oneway"]), "S_LEADING": str(P["leading"]),
             "S_NOTHING": str(P["nothing"]), "S_NOTHING_SAME": str(ex3["remainder_rot_no_words_same_phase"]),
             "S_NOTHING_KM": f'{ex3["remainder_rot_no_words_median_km"]:.0f}', "S_NOTHING_10": str(ex3["remainder_rot_no_words_over_10km"])})
for k, v in fill.items():
    html = html.replace("{{" + k + "}}", v)
assert "{{" not in html
study = html.replace("<!--S-->", "").replace("<!--/S-->", "").replace("<!--W-->", "<!--").replace("<!--/W-->", "-->")
open("index.html", "w").write(study)
work = re.sub(r"<!--S-->.*?<!--/S-->", "", html, flags=re.S).replace("<!--W-->", "").replace("<!--/W-->", "")
assert "<!--S-->" not in work
import os
os.makedirs("within-sight-of-itself", exist_ok=True)
open("within-sight-of-itself/index.html", "w").write(work)
print(len(pts), "points", len(pairs), "pairs", n_major_pairs, "major", len(info), "with phases",
      sum(1 for v in info.values() if v["y"]), "synthesised", len(html) // 1024, "KB")
