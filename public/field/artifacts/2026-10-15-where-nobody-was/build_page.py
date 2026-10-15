"""Study 16: write data.js for index.html (descriptive figures; every model figure comes from results.json).
Usage: python3 build_page.py"""
import json, math, pathlib
import numpy as np, pandas as pd
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results.json").read_text())
df = pd.read_csv(HERE / "data/where.tsv", sep="\t", keep_default_na=False)
df["V"] = (df.V > 0).astype(int)
df["ld"] = np.log10(df.people + 1) - np.log10(df.area_km2)
# within-office quintiles (descriptive: place held fixed by ranking inside each office)
df["wq"] = df.groupby("wfo").ld.rank(method="first", pct=True).mul(5).clip(upper=4.9999).astype(int) + 1
within = [{"q": int(q), "n": int(len(g)), "V": round(100 * g.V.mean(), 2)} for q, g in df.groupby("wq")]
offices = []
for w, g in df.groupby("wfo"):
    if len(g) < 150: continue
    offices.append({"wfo": w, "n": int(len(g)), "V": round(100 * g.V.mean(), 1),
                    "q": [round(100 * h.V.mean(), 1) for _, h in g.groupby("wq")],
                    "dens": [round(float(10 ** h.ld.median()), 1) for _, h in g.groupby("wq")]})
higher = sum(1 for o in offices if o["q"][4] > o["q"][0])
data = {"national": [{"q": d["q"], "V": d["V"][0], "Vci": d["V"][1:], "dens": d["median_density"], "n": d["n"]} for d in R["quintiles"]],
        "within": within, "offices": offices, "offices_top_above_bottom": [higher, len(offices)],
        "mix": R["post_hoc"]["maxmag_mix_among_verified_by_quintile"],
        "never": [{"q": d["q"], "severe": d["severe_among_never"][0], "nothing": d["nothing_among_never"][0]} for d in R["quintiles"]],
        "or": R["adjusted_V"]["or_per_tenfold_density"], "orS": R["adjusted_S"]["or_per_tenfold_density"],
        "cf": R["counterfactual"], "pred": R["predictions"], "post": {k: R["post_hoc"][k] for k in R["post_hoc"] if k.startswith("or_")}}
(HERE / "data.js").write_text("const D = " + json.dumps(data, separators=(",", ":")) + ";\n")
(HERE / "data/within.json").write_text(json.dumps({"within": within, "offices_top_above_bottom": [higher, len(offices)]}, indent=1))
print(within, higher, len(offices))
