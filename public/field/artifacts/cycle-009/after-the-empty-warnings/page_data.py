"""Study 31: write data-31.js for the page from data/results31.json (no computation here)."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results31.json").read_text())
(HERE / "data-31.js").write_text("window.S31=" + json.dumps(R, separators=(",", ":")) + ";\n")
print("data-31.js", len(json.dumps(R)))
