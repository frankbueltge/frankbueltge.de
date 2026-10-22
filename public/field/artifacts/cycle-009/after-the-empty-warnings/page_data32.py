"""Study 32: write data-32.js for the page from data/results32.json and data/officeyears32.tsv
(office-years with at least 10 judged warnings). No computation beyond selecting and rounding."""
import csv, json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results32.json").read_text())
oy = [[r["office"], int(r["year"]), int(r["warnings"]), int(r["empty_office"]), int(r["empty_final"]), int(r["empty_office_filled"])]
      for r in csv.DictReader(open(HERE / "data/officeyears32.tsv"), delimiter="\t") if int(r["warnings"]) >= 10]
R["officeyears"] = oy
(HERE / "data-32.js").write_text("window.S32=" + json.dumps(R, separators=(",", ":")) + ";\n")
print("data-32.js", len(oy), "office-years")
