# Builds index.html from calibration.json (session1c.py) and session1b.json. No fetch at runtime; the figure is drawn in the page
# from the embedded numbers; a text table below is the no-JS floor.
import json
c = json.load(open("calibration.json")); b = json.load(open("session1b.json"))
rows = ""
for q, name in (("period", "orbital period"), ("radius", "radius"), ("mass", "mass")):
    d = c[q]; i = c["k"].index(3)
    rows += (f'<tr><th>{name}</th><td>{d["pairs"]:,}</td><td>{100*d["identical_share"]:.0f}&nbsp;%</td>'
             f'<td>{100*d["non_identical"][i]:.1f}&nbsp;%</td><td>{d["non_identical"][i]/c["gauss"][i]:.0f}&times;</td></tr>')
d2 = json.load(open("session2.json")); e2 = json.load(open("session2b.json"))
rows2 = ""
for q, name in (("period", "orbital period"), ("radius", "radius"), ("mass", "mass")):
    y = d2[q]["p2_by_later_year"]
    rows2 += f'<tr><th>{name}</th>' + "".join(f'<td>{100*y[k]["tail_share"]:.1f}&nbsp;%</td>' for k in ("<=2014", "2015-2019", "2020+")) + '</tr>'
r = e2["radius"]
page = open("template.html").read().replace("%%DATA%%", json.dumps(c)).replace("%%ROWS%%", rows).replace("%%ROWS2%%", rows2).replace("%%DATA2%%", json.dumps(d2))
page = (page.replace("%%SIB%%", f'{d2["radius"]["p4_ratio"]:.0f}')
        .replace("%%SAME%%", f'{100*r["share_tail_in_such_groups"]:.0f}&nbsp;% of radius tail pairs against {100*r["share_all_pairs_in_such_groups"]:.0f}&nbsp;% of all pairs')
        .replace("%%LATER%%", f'{100*d2["period"]["p1_share_later_smaller_sigma"]:.0f}&nbsp;%').replace("%%LATERB%%", f'{100*d2["period"]["p1_baseline_all_pairs_later_smaller"]:.0f}&nbsp;%'))
open("index.html", "w").write(page)
