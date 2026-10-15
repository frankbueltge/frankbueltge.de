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

# --- session 3 (appended): table with inline bars from session3.json
s3 = json.load(open("session3.json")); page = open("index.html").read()
def pc(x): return f'{100*x:.1f}&nbsp;%'
def cell(v): return f'<td>{pc(v["tail_share"])}<div style="height:8px;background:var(--p);width:{min(100,v["tail_share"]*500):.0f}%"></div><span class="src">{v["pairs"]:,} pairs</span></td>'
rows3 = "".join(f'<tr><th>{n}</th>' + "".join(cell(s3["p1_by_method"][m][k]) for k in ("<=2014", "2015-2019", "2020+")) + '</tr>' for m, n in (("Transit", "found by transit"), ("Radial Velocity", "found by radial velocity")))
g = s3["p2_gap"]; l = s3["p3_planets_le10_papers"]; p = s3["p4"]; T = s3["p1_by_method"]["Transit"]; R = s3["p1_by_method"]["Radial Velocity"]
rep = {"%%ROWS3%%": rows3, "%%T1%%": f'{pc(T["2020+"]["tail_share"])} for 2020 on against {pc(T["2015-2019"]["tail_share"])} for 2015&ndash;2019',
       "%%RV%%": f'{pc(R["<=2014"]["tail_share"])}, {pc(R["2015-2019"]["tail_share"])}, {pc(R["2020+"]["tail_share"])} by era', "%%GAP1%%": pc(g["gap<=1"]["tail_share"]), "%%GAP5%%": pc(g["gap>=5"]["tail_share"]),
       "%%LE10%%": f'{pc(l["2020+"]["tail_share"])} for 2020 on against {pc(l["2015-2019"]["tail_share"])}', "%%SIG1%%": pc(p["later_sigma_lt_third"]["tail_share"]), "%%SIG2%%": pc(p["similar"]["tail_share"]), "%%SIG3%%": pc(p["later_sigma_gt_3x"]["tail_share"])}
for k, v in rep.items(): page = page.replace(k, v)
open("index.html", "w").write(page)
