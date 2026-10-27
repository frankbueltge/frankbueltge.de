"""Checks the paper's numbers against the study's results files: each figure below is recomputed from
artifacts/cycle-010/the-withheld-cell/data/results*.json and must appear in paper.md as printed.
Usage: python3 -I check.py"""
import json, pathlib
H = pathlib.Path(__file__).resolve().parent
D = H.parent.parent / "artifacts" / "cycle-010" / "the-withheld-cell" / "data"
r1, r2, r3, r4 = (json.load(open(D / f)) for f in ("results.json", "results-2.json", "results-3.json", "results-4.json"))
paper = " ".join((H / "paper.md").read_text(encoding="utf-8").split())
pc = lambda x, n=1: f"{100 * x:.{n}f} %"
ci = lambda a, n=2: f"{a[0]:.{n}f} to {a[1]:.{n}f}".replace("-", "−")
n = lambda x: f"{x:,}"
W, P, S = (r1["P1"]["counts"][k] for k in "WPS")
cntry = {c["geo"]: c for c in r1["countries"]}
reg = {c["geo"]: c for c in r2["regimes"]}
boot = r3["figure1_bootstrap"]
t4, a4 = r4["turnover"], r4["all19"]
claims = {
    "cells": n(W + P + S), "published": n(P), "withheld": n(W), "silent": n(S),
    "rate": pc(W / (W + P)), "empty declared": pc(r1["P1"]["withheld_share_of_empty"]),
    "1-2 firms": pc(r1["P5"]["bins"][0]["rate"]), "1-2 boot": f"{pc(boot[0]['boot'][0])[:-2]}–{pc(boot[0]['boot'][1])}",
    "1000+": pc(r1["P5"]["bins"][-1]["rate"]), "1000+ boot": f"{pc(boot[-1]['boot'][0])[:-2]}–{pc(boot[-1]['boot'][1])}",
    "rho size": f"{r1['P2']['rho']:.2f}".replace("-", "−"), "rho ci": ci(r1["P2"]["ci"]),
    "LU": pc(cntry["LU"]["rate"]), "IE": pc(cntry["IE"]["rate"]), "IT": pc(cntry["IT"]["rate"]),
    "class": pc(r1["P4"]["rates"]["class"]), "division": pc(r1["P4"]["rates"]["division"]),
    "count withheld": pc(r1["P6"]["rate"]),
    "IE ratio": f"{r2['P7']['IE']:.2f} ({r2['P7']['ci'][0]:.2f}–{r2['P7']['ci'][1]:.2f})",
    "large firm": f"{r2['P10']['ratio']:.2f}", "P11": f"{r2['P11']['in_1_2']} of {r2['P11']['band_known']}",
    "IE with count": f"{pc(reg['IE']['share_with_count'])} of its withheld figures together with the count ({n(reg['IE']['withheld_with_count'])} of {n(reg['IE']['withheld_with_count'] + reg['IE']['withheld_beside_count'])})",
    "kappa": f"κ = **{r3['agreement']['kappa']:.2f}**", "fisher": f"p = 0.0{round(r3['agreement']['fisher_two_sided_p'] * 1000):d}",
    "P13": f"only **{r3['P13']['yes']}** answer", "rho thr": f"ρ = {r3['P16']['rho']:.2f}".replace("-", "−"),
    "HR": pc(next(s for s in r3["P15"]["states"] if s["geo"] == "HR")["rate"]),
    "LV": pc(next(s for s in r3["P15"]["states"] if s["geo"] == "LV")["rate"]),
    "RO": pc(next(s for s in r3["P15"]["states"] if s["geo"] == "RO")["rate"]),
    "1 firm turnover": f"**{pc(t4['1'][0])}** of figures are withheld at one firm ({t4['1'][1]} of {t4['1'][1] + t4['1'][2]})",
    "2 firms turnover": f"**{pc(t4['2'][0])}** at two ({t4['2'][1]} of {t4['2'][1] + t4['2'][2]})",
    "diff boot": f"{100 * r4['turnover_diff_1_minus_2_boot'][0]:.1f} to +{100 * r4['turnover_diff_1_minus_2_boot'][1]:.1f} points".replace("-", "−"),
    "all19": f"{pc(a4['1'][0])} against {pc(a4['2'][0])}",
    "single published": f"the {r4['single_firm_turnover_published']['cells']} published single-firm",
}
fails = 0
for k, v in claims.items():
    ok = v in paper
    fails += not ok
    print(("PASS " if ok else "FAIL ") + f"{k}: {v}")
assert r4["source"]["sha256"] == r1["source"]["sha256"], "check 42 read another release"
print(f"{len(claims) - fails} of {len(claims)} passed; check 42 read the same release as study 39")
raise SystemExit(1 if fails else 0)
