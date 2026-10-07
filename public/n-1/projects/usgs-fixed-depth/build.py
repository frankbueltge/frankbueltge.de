import json
cells = open("cells.json").read(); h = json.load(open("headline.json"))
n = h["n"]; p10 = 100 * h["d10"] / n; p35 = 100 * h["d35"] / n
page = open("template.html").read()
for k, v in {"%%CELLS%%": cells, "%%N%%": f"{n:,}", "%%P10%%": f"{p10:.1f}", "%%P35%%": f"{p35:.1f}",
             "%%D10%%": f"{h['d10']:,}", "%%D35%%": f"{h['d35']:,}",
             "%%ERRD%%": f"{100*h['share_err_1.6_to_2.0']['d10']:.1f}", "%%ERRS%%": f"{100*h['share_err_1.6_to_2.0']['solved']:.1f}",
             "%%MEDD%%": str(h["median_depthError"]["d10"]), "%%MEDS%%": str(h["median_depthError"]["solved"])}.items():
    page = page.replace(k, v)
open("index.html", "w").write(page)
