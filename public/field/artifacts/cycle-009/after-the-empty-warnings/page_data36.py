"""Study 36: write data-36.js for the page from data/results36.json and data/results35.json. No computation beyond selecting."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results36.json").read_text())
P = json.loads((HERE / "data/results35.json").read_text())["prices"]
out = {"sets": R["sets"], "studio": {k: v for k, v in R["studio"].items() if k != "joplin_row"}, "predictions": R["predictions"],
       "loo": [{k: x[k] for k in ("om", "date", "st", "inj", "fat", "cat")} | {"r_inj": x["inj_run3"]["irr"], "r_fat": x["fat_run3"]["irr"]} for x in R["loo"]],
       "prices": P}
(HERE / "data-36.js").write_text("window.S36=" + json.dumps(out, separators=(",", ":")) + ";\n")
print("data-36.js written")
