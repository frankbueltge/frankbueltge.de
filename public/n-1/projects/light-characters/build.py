"""Project 10, session 1: build rows.json (committed, derived) and index.html.
Usage: python3 build.py SCRATCHDIR   (needs rows_full.json from session1.py and the seven volumes)"""
import json, re, sys

sc = sys.argv[1]
rawl = []
for v in range(110, 117):
    rawl += json.load(open(f"{sc}/lol{v}.json"))["ngalol"]
rows = json.load(open(f"{sc}/rows_full.json"))
assert len(rows) == len(rawl)
res = json.load(open("session1.json"))
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
    pairs.append([ti, tj, 1 if x["c"] == "major" else 0])
    if x["c"] == "major":
        for t in (ti, tj):
            if t not in info:
                r = rawl[T[t]]
                seq, synth = phases(T[t])
                info[t] = {"n": (r["name"] or "").replace("\n", " ").strip(" -")[:80], "f": rows[T[t]]["f"].replace("\n", " "),
                           "k": rows[T[t]]["k"], "p": rows[T[t]]["p"], "rg": rows[T[t]]["rg"], "c": colour(rows[T[t]]["k"]),
                           "s": [[1 if on else 0, d] for on, d in seq], "y": synth}
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
    "N_FIXED": f'{res["counts"]["kind_fixed"]:,}', "N_UNPARSED": f'{res["counts"]["kind_unparsed"]:,}',
}
for k, v in fill.items():
    html = html.replace("{{" + k + "}}", v)
assert "{{" not in html
open("index.html", "w").write(html)
print(len(pts), "points", len(pairs), "pairs", n_major_pairs, "major", len(info), "with phases",
      sum(1 for v in info.values() if v["y"]), "synthesised", len(html) // 1024, "KB")
