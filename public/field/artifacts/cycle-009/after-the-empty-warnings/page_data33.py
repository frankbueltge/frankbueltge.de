"""Study 33: write data-33.js for the page from data/results33.json. No computation beyond selecting."""
import json, math, pathlib
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results33.json").read_text())
for f in R["fits"].values():   # JSON for the page: a non-finite bound becomes null
    for e, x in f.items():
        if e.startswith("z_"):
            for k in ("lo", "hi"):
                if not math.isfinite(x[k]): x[k] = None
(HERE / "data-33.js").write_text("window.S33=" + json.dumps({k: R[k] for k in ("n", "fits", "predictions", "corr", "outcomes")},
                                                          separators=(",", ":")) + ";\n")
print("data-33.js", len(R["fits"]), "fits")
