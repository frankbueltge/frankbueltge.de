# Builds index.html from calibration.json (session1c.py) and session1b.json. No fetch at runtime; the figure is drawn in the page
# from the embedded numbers; a text table below is the no-JS floor.
import json
c = json.load(open("calibration.json")); b = json.load(open("session1b.json"))
rows = ""
for q, name in (("period", "orbital period"), ("radius", "radius"), ("mass", "mass")):
    d = c[q]; i = c["k"].index(3)
    rows += (f'<tr><th>{name}</th><td>{d["pairs"]:,}</td><td>{100*d["identical_share"]:.0f}&nbsp;%</td>'
             f'<td>{100*d["non_identical"][i]:.1f}&nbsp;%</td><td>{d["non_identical"][i]/c["gauss"][i]:.0f}&times;</td></tr>')
page = open("template.html").read().replace("%%DATA%%", json.dumps(c)).replace("%%ROWS%%", rows)
open("index.html", "w").write(page)
