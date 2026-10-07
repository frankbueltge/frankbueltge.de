"""Build index.html from tortoise135.json, unseen.json and results.json. Stdlib only."""
import json
S = json.load(open("tortoise135.json"))["rows"]; R = json.load(open("results.json"))
rows = [{"o": r["obs"], "odd": r["odd"]} for r in S]
data = {"rows": rows, "bbar": R["seen"]["bbar"], "bstar": R["seen"]["bstar"], "w": R["seen"]["wilson"], "sweep": R["sweep"]}
d = R["seen"]["deff_at"]["0.05"]; p = R["permutation"]; u = R["unseen"]; dr = R["draws"]
sub = {"__DATA__": json.dumps(data).replace("</", "<\\/"), "__BBAR__": "%.2f" % R["seen"]["bbar"], "__BSTAR__": "%.2f" % R["seen"]["bstar"],
       "__NEFF__": "%.0f" % d["neff_bstar"], "__NDIFF__": "%.1f" % (100 * R["predictions"]["P1"]["neff_diff_at_0.05"]),
       "__BOOT_LO__": "%.1f" % (100 * R["bootstrap"]["lo"]), "__BOOT_HI__": "%.1f" % (100 * R["bootstrap"]["hi"]),
       "__RHOHAT__": "%.2f" % p["observed"]["rho"], "__RHOLO__": "%.2f" % p["rho_range_95"][0], "__RHOHI__": "+%.2f" % p["rho_range_95"][1],
       "__YP__": "%.2f" % p["year_two_sided_p"], "__UBBAR__": "%.2f" % u["bbar"], "__UBSTAR__": "%.2f" % u["bstar"], "__URATIO__": "%.1f" % u["bstar_over_bbar"],
       "__FR05__": "%.2f" % dr["frames"]["halfwidth_ratio_at"]["0.05"], "__OB05__": "%.2f" % dr["observers"]["halfwidth_ratio_at"]["0.05"],
       "__OB10__": "%.2f" % dr["observers"]["halfwidth_ratio_at"]["0.1"]}
html = open("template.html").read()
for k, v in sub.items(): html = html.replace(k, v)
assert "__" not in html.replace("__proto__", ""), [x for x in html.split() if "__" in x][:5]
open("index.html", "w").write(html); print(len(html))
