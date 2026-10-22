"""Study 37: write data-37.js for the page from data/results37.json. No computation beyond selecting."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results37.json").read_text())
K = ("om", "date", "st", "cat", "ef", "inj", "fat", "mu", "surprise", "u", "delta", "rank_delta")
pts = [{k: x[k] for k in K} | {"irr": x["irr_loo"], "set": "top30"} for x in R["loo36"]]
pts += [{k: x[k] for k in K} | {"irr": x["refit"]["irr"], "lo": x["refit"]["lo"], "hi": x["refit"]["hi"], "set": "new"} for x in R["refits"]]
out = {"full": R["full"], "alpha": R["alpha"], "rho": R["spearman_rho"], "named": R["named"], "pts": pts, "predictions": R["predictions"]}
(HERE / "data-37.js").write_text("window.S37=" + json.dumps(out, separators=(",", ":")) + ";\n")
print("data-37.js written", len(pts))
