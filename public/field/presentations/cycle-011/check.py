"""Checks the paper's numbers against the study's results files: each figure below is recomputed from
artifacts/cycle-011/the-blank-and-the-cuts/results*.json and must appear in paper.md as printed.
Usage: python3 -I check.py"""
import json, pathlib
H = pathlib.Path(__file__).resolve().parent
A = H.parent.parent / "artifacts" / "cycle-011" / "the-blank-and-the-cuts"
r43, r44, r45, r46 = (json.load(open(A / f)) for f in ("results.json", "results44.json", "results45.json", "results46.json"))
paper = " ".join((H / "paper.md").read_text(encoding="utf-8").split())
pc = lambda x, n=2: f"{100 * x:.{n}f} %"
m = lambda x: f"{x / 1e6:.1f} million"
rho = lambda x: f"{x:.2f}".replace("-", "−")
ci = lambda a: f"{rho(a[0])} to {rho(a[1])}"
s3, s4, s5 = r43["scores"], r44["scores"], r45["scores"]
Y = {y["year"]: y for y in r43["by_year"]}
NC = {y["year"]: y for y in r43["posthoc_without_cadre_harmonise"]["by_year"]}
pre = [NC[y]["blank"] / NC[y]["people"] for y in range(2021, 2025)]
claims = {
    "P1": f"**{s3['P1']['value']:,}**", "P1 against": f"{s3['P1']['against']:,}",
    "P2 share": f"**{pc(s3['P2']['value'])}**", "P2 ratio": f"**{s3['P2']['ratio']:.2f} times**",
    "P2 pooled": pc(s3["P2"]["against"]), "CH": f"**{(Y[2025]['blank'] - NC[2025]['blank']) / 1e6:.1f} million**",
    "IPC 2025": f"**{pc(NC[2025]['blank'] / NC[2025]['people'])}**",
    "IPC range": f"**{100 * min(pre):.2f}–{pc(max(pre))}**",
    "P3": f"**ρ(Δcoverage, Δblank share) = {rho(s3['P3']['rho'])}** ({ci(s3['P3']['ci95'])}",
    "P4": f"**{pc(s3['P4']['share'], 1)}**", "P5": f"{s3['P5']['value']} country analyses against a 2022–24 mean of {s3['P5']['against']:.1f}",
    "drops": f"**{s4['R2']['n']}** drops", "R2": f"**{s4['R2']['F']} of {s4['R2']['n']} ({round(100 * s4['R2']['F_share'])} %)**",
    "R2 N": f"{s4['R2']['N']} are never", "R4": f"**{s4['R4']['value']}** drops", "R5": f"**{s4['R5']['value']}** analyses",
    "R5 mean": f"**{s4['R5']['against']:.1f}**", "R3": f"against {round(100 * s4['R3']['F2021_24'])} % in 2021–24",
    "D1": f"**ρ = {rho(s5['D1']['rho'])}** ({ci(s5['D1']['ci95'])}", "loo": ci(r45["posthoc"]["D1_loo_range"][::-1]).replace(" to ", " and "),
    "real": f"ρ = {rho(r45['posthoc']['realised_us_cut']['rho'])} ({ci(r45['posthoc']['realised_us_cut']['ci95'])})",
    "D2": f"**ρ = {rho(s5['D2']['rho'])}**, {ci(s5['D2']['ci95'])}", "D3": f"**ρ = {rho(s5['D3']['rho'])}** ({ci(s5['D3']['ci95'])}",
    "D5": f"**{s5['D5']['F_loose']} of {s5['D5']['n']} ({round(100 * s5['D5']['F_share_loose'])} %)**",
    "floor": f"**ρ = {rho(r46['D1_floor'])}** among the six, **{r46['D1_above']:.2f}** among the five",
    "floor n": f"Six of the 11 countries", "above fell": f"four had a smaller blank share",
}
assert len(r46["floor"]) == 6 and r46["above_fell"] == 4 and r46["above_rose"] == 1 and r46["floor_rose"] == 0
held = sum(bool(s3[k]["held"]) for k in s3) + sum(bool(s4[k]["held"]) for k in s4) + sum(bool(s5[k]["held"]) for k in s5)
claims["held"] = f"**{held} of 15**"
fails = 0
for k, v in claims.items():
    ok = v in paper
    fails += not ok
    print(("PASS " if ok else "FAIL ") + f"{k}: {v}")
print(f"{len(claims) - fails} of {len(claims)} passed")
raise SystemExit(1 if fails else 0)
