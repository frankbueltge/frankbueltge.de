"""Study 34: write data-34.js for the page from data/results34.json and the Atelier's class chances.
Usage: python3 -I page_data34.py <the Atelier's plate4.json at ulysses 522c7c3>. No computation beyond selecting."""
import json, sys, pathlib, hashlib
HERE = pathlib.Path(__file__).resolve().parent
assert hashlib.sha256(open(sys.argv[1], "rb").read()).hexdigest() == \
    "220ff73b938b96eafff560dc362c1a21828e7526279cb32b87e7f876ad9a6c0a"
R = json.loads((HERE / "data/results34.json").read_text())
cls = json.load(open(sys.argv[1]))["classes"]
out = {k: R[k] for k in ("n_warnings", "deaths", "injuries", "P_met", "band", "r_central", "breakeven_hour_value",
                         "people", "predictions", "top10_share_V", "r_without_top10", "deaths_share_V", "sweep_span")}
out.update(R["page"])
out["classes"] = {k: {"n": v["n"], "hour": v["P_hour"], "later": v["P_later"]} for k, v in cls.items()}
(HERE / "data-34.js").write_text("window.S34=" + json.dumps(out, separators=(",", ":")) + ";\n")
print("data-34.js", len(out["classes"]), "classes")
