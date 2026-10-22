"""Study 35: write data-35.js for the page from data/results35.json. No computation beyond selecting."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results35.json").read_text())
out = {k: R[k] for k in ("n_warned", "by_cat", "fits", "prices", "explore", "predictions")}
out["studio"] = {k: v for k, v in R["studio"].items() if k != "top10"}
out["studio"]["joplin"] = R["studio"]["top10"][0]
out["w"] = {"inj": round(1 - 0.614, 3), "fat": round(1 - 0.894, 3)}
out["b_hit"] = {"habit": 1.0, "learning": 1.0216736458723723}
out["b_run"] = {"habit": 0.27194614941384854, "learning": 0.9588637051705554}
(HERE / "data-35.js").write_text("window.S35=" + json.dumps(out, separators=(",", ":")) + ";\n")
print("data-35.js written")
