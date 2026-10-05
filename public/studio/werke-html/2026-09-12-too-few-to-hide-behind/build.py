#!/usr/bin/env python3
"""TOO FEW TO HIDE BEHIND — build.

Offline. Reads counts.json (written by harvest.py), derives every number the work
states, and writes data.json and index.html. Touches no network.

    python3 build.py --report   # print the numbers and the checks, write nothing
    python3 build.py            # write data.json and index.html
    python3 build.py --check    # rebuild and fail on a one-byte drift
"""

import argparse
import filecmp
import json
import os
import shutil
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
THIN = " "          # the digit group separator used everywhere on the page

PUBLISHED, SEALED, NOT_AVAILABLE, ABSENT = "V", "C", "NA", "ABS"
WALL_YEAR = "2023"       # the year drawn first: the best-covered of the four

# ---------------------------------------------------------------- geometry ----
GUTTER = 132             # left margin carrying the section names
COLW = 15                # one country
ROWH = 3                 # one activity
SECGAP = 7               # between two NACE sections
HEADER = 30              # the country codes


def group(n):
    return f"{n:,}".replace(",", THIN)


def pct(x, n, places=2):
    return ("%." + str(places) + "f") % (100.0 * x / n) if n else "—"


def short(s, n=34):
    """Cut a section name to the gutter, on a word boundary."""
    if len(s) <= n:
        return s
    cut = s[:n].rsplit(" ", 1)[0].rstrip(",;")
    return cut + "…"


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


# ------------------------------------------------------------------ derive ----
def derive(c):
    p = c["primary"]
    geos, classes, years = p["geos"], p["classes"], p["years"]
    labels = c["labels"]

    order = sorted(geos, key=lambda g: (-p["matrix_by_geo"][g].get(SEALED, 0), g))
    sections = []
    for i, nace in enumerate(classes):
        if not sections or sections[-1]["letter"] != nace[0]:
            sections.append({"letter": nace[0], "name": labels["nace"].get(nace[0], ""),
                             "first": i, "count": 0})
        sections[-1]["count"] += 1

    # y position of every activity row, section gaps included
    y, ys = HEADER, []
    for s in sections:
        s["y"] = y
        for _ in range(s["count"]):
            ys.append(y)
            y += ROWH
        s["height"] = y - s["y"]
        y += SECGAP
    height = y - SECGAP + 12
    width = GUTTER + COLW * len(geos)

    # one path per status per year, vertical runs merged
    walls = {}
    for year in years:
        paths = {"1": [], "2": [], "3": []}
        for col, geo in enumerate(order):
            row = p["matrix"][year][geo]
            x = GUTTER + col * COLW
            i = 0
            while i < len(row):
                ch = row[i]
                j = i
                while j + 1 < len(row) and row[j + 1] == ch and ys[j + 1] == ys[j] + ROWH:
                    j += 1
                if ch in paths:
                    top = ys[i]
                    paths[ch].append("M%d %dh%dv%dh-%dz" % (x, top, COLW - 1,
                                                            ys[j] + ROWH - top - 1, COLW - 1))
                i = j + 1
        walls[year] = {k: "".join(v) for k, v in paths.items()}

    counts_by_year = {}
    for year in years:
        cnt = {"1": 0, "2": 0, "3": 0, "0": 0}
        for geo in geos:
            for ch in p["matrix"][year][geo]:
                cnt[ch] += 1
        counts_by_year[year] = {"published": cnt["1"], "sealed": cnt["2"],
                                "not_available": cnt["3"], "absent": cnt["0"]}

    per_country = []
    for geo in order:
        m = p["matrix_by_geo"][geo]
        tot = sum(m.values())
        per_country.append({
            "geo": geo, "name": labels["geo"].get(geo, geo),
            "published": m.get(PUBLISHED, 0), "sealed": m.get(SEALED, 0),
            "not_available": m.get(NOT_AVAILABLE, 0), "absent": m.get(ABSENT, 0),
            "cells": tot, "sealed_pct": pct(m.get(SEALED, 0), tot, 1),
        })

    per_class = []
    for i, nace in enumerate(classes):
        m = p["matrix_by_class"][nace]
        per_class.append({
            "nace": nace, "name": labels["nace"].get(nace, ""), "section": nace[0],
            "sealed": m.get(SEALED, 0), "published": m.get(PUBLISHED, 0),
            "not_available": m.get(NOT_AVAILABLE, 0), "absent": m.get(ABSENT, 0),
            "cells": sum(m.values()), "row": i,
        })
    top_class = sorted(per_class, key=lambda r: (-r["sealed"], r["nace"]))[:15]

    ladder = []
    for label, (sealed, total) in p["curves"]["classes_sealing"].items():
        ladder.append({"firms": label, "sealed": sealed, "cells": total,
                       "pct": pct(sealed, total, 2)})
    ladder.sort(key=lambda r: LADDER_ORDER.index(r["firms"]))
    other_ladders = {}
    for tag in ("all_levels_sealing", "classes_all_countries"):
        rows = [{"firms": k, "sealed": v[0], "cells": v[1], "pct": pct(v[0], v[1], 2)}
                for k, v in p["curves"][tag].items()]
        rows.sort(key=lambda r: LADDER_ORDER.index(r["firms"]))
        other_ladders[tag] = rows

    census = sorted(c["census"], key=lambda r: -r["sealed"] / max(r["cells"], 1))
    for row in census:
        row["sealed_pct"] = pct(row["sealed"], row["cells"], 2)
    census_cells = sum(r["cells"] for r in census)
    census_sealed = sum(r["sealed"] for r in census)

    single = p["single_enterprise"]
    largest = [{"geo": g, "name": labels["geo"].get(g, g), "nace": n,
                "activity": labels["nace"].get(n, ""), "year": y, "turnover": v}
               for g, n, y, v in single["largest"]]
    single_nace = sorted(({"nace": n, "activity": labels["nace"].get(n, ""), "cells": v}
                          for n, v in single["by_nace"].items()),
                         key=lambda r: (-r["cells"], r["nace"]))
    single_geo = sorted(({"geo": g, "name": labels["geo"].get(g, g), "cells": v}
                         for g, v in single["by_geo"].items()),
                        key=lambda r: (-r["cells"], r["geo"]))

    by_indicator = []
    for ind, m in p["by_indicator"].items():
        tot = sum(m.values())
        by_indicator.append({"indicator": ind, "name": labels["indic"].get(ind, ""),
                             "sealed": m.get(SEALED, 0), "cells": tot,
                             "pct": pct(m.get(SEALED, 0), tot, 2)})
    by_indicator.sort(key=lambda r: (-r["sealed"] / max(r["cells"], 1), r["indicator"]))

    wall_cells = len(geos) * len(classes) * len(years)
    return {
        "harvested_utc": c["harvested_utc"],
        "source": c["source"],
        "dataflow": p["dataflow"],
        "dataflow_title": p["title"],
        "downloads": c["downloads"],
        "table": {"cells": p["cells"],
                  "published": p["by_status"][PUBLISHED],
                  "sealed": p["by_status"][SEALED],
                  "not_available": p["by_status"][NOT_AVAILABLE],
                  "sealed_pct": pct(p["by_status"][SEALED], p["cells"], 2),
                  "indicators": len(p["indicators"]), "geos": len(geos),
                  "nace_codes": len(classes)},
        "wall": {"year_default": WALL_YEAR, "years": years, "geos": order,
                 "geo_names": {g: labels["geo"].get(g, g) for g in geos},
                 "classes": classes, "sections": sections,
                 "cells": wall_cells, "by_year": counts_by_year,
                 "sealed": sum(counts_by_year[y]["sealed"] for y in years),
                 "published": sum(counts_by_year[y]["published"] for y in years),
                 "not_available": sum(counts_by_year[y]["not_available"] for y in years),
                 "absent": sum(counts_by_year[y]["absent"] for y in years),
                 "width": width, "height": height, "rows": ys, "paths": walls,
                 "matrix": {y: {g: p["matrix"][y][g] for g in order} for y in years}},
        "per_country": per_country,
        "per_class": per_class,
        "top_class": top_class,
        "ladder": ladder,
        "ladder_other": other_ladders,
        "sealing_geos": p["sealing_geos"],
        "never_sealing": [g for g in geos if g not in p["sealing_geos"]],
        "single": {"sealed": single["sealed"], "published": single["published"],
                   "printed_total": single["printed_total"],
                   "by_geo": single_geo, "by_nace": single_nace, "largest": largest},
        "census": census, "census_cells": census_cells, "census_sealed": census_sealed,
        "census_pct": pct(census_sealed, census_cells, 2),
        "by_indicator": by_indicator,
    }


LADDER_ORDER = ["0", "1", "2", "3", "4-5", "6-10", "11-20", "21-50", "51-100",
                "101-1000", ">1000"]


# ------------------------------------------------------------------- prose ----
LEAD = """A public record has two kinds of hole. One is where nobody looked, and nothing
was ever written down. The other is where somebody looked, wrote the number down, keeps it in a
file, and is forbidden to print it. The two look identical in a table — both are an empty cell —
and European statistics tell them apart with a flag that almost nobody reads. This is a register
of the second kind."""

RULE = """A cell of European business statistics is sealed when there are too few companies in
it. Eurostat's own account of the rule names two ways that happens: the number of contributors is
below a minimum threshold, or <em>a well-informed intruder, i.e., the second largest contributor,
can estimate the value of the largest contributor</em> closely enough. A cell is also sealed if it
could be worked out from the totals around it. So the seal is not a judgement about the industry.
It is arithmetic about the crowd: a figure may be printed when there are enough companies in it
for any one of them to hide behind the others, and may not when there are not."""

WALL_NOTE = """Every mark is one country's turnover figure for one economic activity in one year.
Black is a figure that exists and may not be printed. Pale is a figure that is printed. The cool
grey is 'not available' — the other kind of hole. Blank is a row the country does not appear in at
all. Countries run left to right in the order of how much of their own economy they seal."""


# ------------------------------------------------------------------ render ----
def svg(d, year):
    w = d["wall"]
    parts = ['<svg class="wall" viewBox="0 0 %d %d" role="img" aria-label="%s" '
             'preserveAspectRatio="xMidYMin meet">'
             % (w["width"], w["height"], esc(
                 "The sealed cells of European business statistics, turnover, %s" % year))]
    for i, g in enumerate(w["geos"]):
        x = GUTTER + i * COLW + (COLW - 1) / 2
        parts.append('<text class="ccode" x="%.1f" y="%d">%s</text>' % (x, HEADER - 12, esc(g[:2] if g != "EU27_2020" else "EU")))
    for s in w["sections"]:
        parts.append('<text class="sec" x="0" y="%d">%s</text>'
                     % (s["y"] + 8, esc(s["letter"] + "  " + short(s["name"]))))
        parts.append('<rect class="band" x="%d" y="%d" width="%d" height="%d"/>'
                     % (GUTTER, s["y"], COLW * len(w["geos"]), s["height"]))
    p = w["paths"][year]
    parts.append('<path class="pub" d="%s"/>' % p["1"])
    parts.append('<path class="na" d="%s"/>' % p["3"])
    parts.append('<path class="seal" d="%s"/>' % p["2"])
    parts.append("</svg>")
    return "".join(parts)


def ladder_svg(d):
    rows = d["ladder"]
    W, H, left, top, barh, gap = 640, 0, 96, 8, 18, 6
    H = top + len(rows) * (barh + gap) + 10
    out = ['<svg class="ladder" viewBox="0 0 %d %d" role="img" aria-label="%s" '
           'preserveAspectRatio="xMidYMin meet">'
           % (W, H, esc("The share of turnover figures sealed, by the number of companies"))]
    for i, r in enumerate(rows):
        y = top + i * (barh + gap)
        share = float(r["pct"]) / 100.0
        out.append('<text class="lab" x="%d" y="%d">%s</text>' % (left - 8, y + 13, esc(r["firms"])))
        out.append('<rect class="track" x="%d" y="%d" width="%d" height="%d"/>'
                   % (left, y, W - left - 80, barh))
        out.append('<rect class="fill" x="%d" y="%d" width="%.2f" height="%d"/>'
                   % (left, y, (W - left - 80) * share, barh))
        out.append('<text class="val" x="%d" y="%d">%s%%</text>' % (W - 74, y + 13, esc(r["pct"])))
    out.append("</svg>")
    return "".join(out)


def table(head, rows, cls=""):
    out = ['<div class="tbl"><table class="%s"><thead><tr>' % cls]
    out += ["<th>%s</th>" % esc(h) for h in head]
    out.append("</tr></thead><tbody>")
    for r in rows:
        out.append("<tr>" + "".join("<td>%s</td>" % c for c in r) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def render(d):
    t, w = d["table"], d["wall"]
    years = w["years"]

    wall_panels = []
    for y in years:
        cy = w["by_year"][y]
        wall_panels.append(
            '<figure class="panel" data-year="%s"%s>'
            '<figcaption><b>%s</b> — %s sealed, %s printed, %s not available, %s not in the file</figcaption>'
            '%s</figure>'
            % (y, "" if y == WALL_YEAR else "",
               y, group(cy["sealed"]), group(cy["published"]),
               group(cy["not_available"]), group(cy["absent"]), svg(d, y)))

    dial = "".join('<button class="year" data-year="%s"%s>%s</button>'
                   % (y, ' aria-pressed="true"' if y == WALL_YEAR else ' aria-pressed="false"', y)
                   for y in years)

    country_rows = [[esc(r["geo"]), esc(r["name"]), group(r["published"]),
                     "<b>%s</b>" % group(r["sealed"]), group(r["not_available"]),
                     group(r["absent"]), r["sealed_pct"] + "%"] for r in d["per_country"]]

    ladder_rows = [[esc(r["firms"]), group(r["cells"]), group(r["sealed"]), r["pct"] + "%"]
                   for r in d["ladder"]]
    other = []
    for tag, title in (("all_levels_sealing", "every NACE level, countries that seal"),
                       ("classes_all_countries", "activity classes, all countries")):
        rows = [[esc(r["firms"]), group(r["cells"]), group(r["sealed"]), r["pct"] + "%"]
                for r in d["ladder_other"][tag]]
        other.append("<h4>%s</h4>%s" % (esc(title),
                                        table(["companies", "cells", "sealed", "share"], rows, "num")))

    census_rows = [[esc(r["dataflow"]), esc(r["title"]), group(r["cells"]),
                    group(r["sealed"]), r["sealed_pct"] + "%"] for r in d["census"]]
    census_rows.insert(0, ["<b>%s</b>" % esc(d["dataflow"]), "<b>%s</b>" % esc(d["dataflow_title"]),
                           "<b>%s</b>" % group(t["cells"]), "<b>%s</b>" % group(t["sealed"]),
                           "<b>%s%%</b>" % t["sealed_pct"]])

    single_rows = [[esc(r["geo"]), esc(r["name"]), group(r["cells"])] for r in d["single"]["by_geo"]]
    single_nace_rows = [[esc(r["nace"]), esc(r["activity"]), group(r["cells"])]
                        for r in d["single"]["by_nace"]]
    largest_rows = [[esc(r["geo"]), esc(r["nace"]), esc(r["activity"]), esc(r["year"]),
                     group(int(round(r["turnover"])))] for r in d["single"]["largest"]]

    top_rows = [[esc(r["nace"]), esc(r["name"]), group(r["sealed"]), group(r["cells"])]
                for r in d["top_class"]]

    ind_rows = [[esc(r["indicator"]), esc(r["name"]), group(r["cells"]), group(r["sealed"]),
                 r["pct"] + "%"] for r in d["by_indicator"]]

    class_rows = []
    for r in d["per_class"]:
        class_rows.append([esc(r["nace"]), esc(r["name"]), group(r["sealed"]),
                           group(r["published"]), group(r["not_available"]), group(r["absent"])])

    n_sealing, n_never = len(d["sealing_geos"]), len(d["never_sealing"])
    never = ", ".join("%s (%s)" % (esc(w["geo_names"][g]), esc(g)) for g in d["never_sealing"])
    ladder_one = next(r for r in d["ladder"] if r["firms"] == "1")
    ladder_two = next(r for r in d["ladder"] if r["firms"] == "2")
    ladder_big = next(r for r in d["ladder"] if r["firms"] == ">1000")
    ladder_zero = next(r for r in d["ladder"] if r["firms"] == "0")
    ie = next(r for r in d["per_country"] if r["geo"] == "IE")
    ro = next(r for r in d["per_country"] if r["geo"] == "RO")

    html = HTML.format(
        thin=THIN,
        lead=LEAD, rule=RULE, wall_note=WALL_NOTE,
        harvested=esc(d["harvested_utc"]),
        cells=group(t["cells"]), sealed=group(t["sealed"]), published=group(t["published"]),
        na=group(t["not_available"]), sealed_pct=t["sealed_pct"],
        indicators=t["indicators"], geos=t["geos"], classes=group(len(w["classes"])),
        wall_cells=group(w["cells"]), wall_sealed=group(w["sealed"]),
        wall_published=group(w["published"]), wall_na=group(w["not_available"]),
        wall_absent=group(w["absent"]),
        panels="".join(wall_panels), dial=dial, default_year=WALL_YEAR,
        ladder_svg=ladder_svg(d),
        ladder_table=table(["companies in the cell", "cells", "sealed", "share"], ladder_rows, "num"),
        ladder_other="".join(other),
        one_pct=ladder_one["pct"], two_pct=ladder_two["pct"], big_pct=ladder_big["pct"],
        zero_pct=ladder_zero["pct"],
        one_cells=group(ladder_one["cells"]), two_cells=group(ladder_two["cells"]),
        n_sealing=n_sealing, n_never=n_never, never=never,
        single_sealed=group(d["single"]["sealed"]), single_published=group(d["single"]["published"]),
        single_table=table(["", "country", "cells"], single_rows, "num"),
        single_nace_table=table(["code", "activity", "cells"], single_nace_rows, "num"),
        largest_table=table(["", "code", "activity", "year", "turnover, € million"],
                            largest_rows, "num"),
        country_table=table(["", "country", "printed", "sealed", "not available",
                             "not in the file", "share"], country_rows, "num"),
        top_table=table(["code", "activity", "sealed", "cells"], top_rows, "num"),
        census_table=table(["dataflow", "what it counts", "cells", "sealed", "share"],
                           census_rows, "num"),
        census_cells=group(d["census_cells"]), census_sealed=group(d["census_sealed"]),
        census_pct=d["census_pct"],
        ind_table=table(["code", "indicator", "cells", "sealed", "share"], ind_rows, "num"),
        class_table=table(["code", "activity", "sealed", "printed", "not available", "absent"],
                          class_rows, "num"),
        ie_sealed=group(ie["sealed"]), ie_pct=ie["sealed_pct"],
        ro_published=group(ro["published"]),
        register_rows=group(w["sealed"]),
        wall_json=json.dumps({
            "gutter": GUTTER, "colw": COLW, "rowh": ROWH, "rows": w["rows"],
            "geos": w["geos"], "geo_names": w["geo_names"], "classes": w["classes"],
            "class_names": {r["nace"]: r["name"] for r in d["per_class"]},
            "matrix": w["matrix"],
        }, ensure_ascii=False, sort_keys=True, separators=(",", ":")),
    )
    return html


HTML = """<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TOO FEW TO HIDE BEHIND — the cells European statistics may not print</title>
<style>
  :root {{
    --paper: #f4f1ea; --ink: #16130f; --pale: #d8d2c4; --seal: #16130f;
    --na: #9fb0b8; --rule: #cdc6b6; --dim: #6d6557; --accent: #8c2f20;
  }}
  * {{ box-sizing: border-box; }}
  html {{ background: var(--paper); }}
  body {{ margin: 0; background: var(--paper); color: var(--ink);
    font: 16px/1.55 Iowan Old Style, Palatino, Georgia, serif; }}
  main {{ max-width: 940px; margin: 0 auto; padding: 40px 20px 120px; }}
  h1 {{ font-size: clamp(30px, 7vw, 58px); line-height: 1.02; letter-spacing: -.02em;
    margin: 0 0 6px; font-weight: 600; }}
  h2 {{ font-size: 13px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700;
    margin: 64px 0 14px; padding-bottom: 6px; border-bottom: 1px solid var(--rule); }}
  h3 {{ font-size: 19px; margin: 34px 0 8px; font-weight: 600; }}
  h4 {{ font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--dim);
    margin: 26px 0 6px; }}
  p {{ margin: 0 0 14px; }}
  .byline {{ font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--dim);
    margin: 0 0 26px; }}
  .lead {{ font-size: clamp(18px, 2.5vw, 22px); line-height: 1.45; }}
  .lead b {{ font-weight: 600; }}
  .stats {{ display: flex; flex-wrap: wrap; gap: 26px 40px; margin: 26px 0 10px;
    padding: 20px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }}
  .stat {{ flex: 1 1 150px; }}
  .stat .big {{ font-size: clamp(26px, 5vw, 40px); line-height: 1; font-variant-numeric: tabular-nums; }}
  .stat .cap {{ font-size: 12px; color: var(--dim); letter-spacing: .06em; text-transform: uppercase;
    margin-top: 6px; display: block; }}
  .wall {{ width: 100%; height: auto; display: block; }}
  .wall .pub {{ fill: var(--pale); }}
  .wall .seal {{ fill: var(--seal); }}
  .wall .na {{ fill: var(--na); }}
  .wall .band {{ fill: none; }}
  .wall .sec {{ font: 500 7px/1 Iowan Old Style, Georgia, serif; fill: var(--dim); }}
  .wall .ccode {{ font: 600 7px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    fill: var(--dim); text-anchor: middle; letter-spacing: .04em; }}
  .panel {{ margin: 0 0 34px; }}
  .panel figcaption {{ font-size: 13px; color: var(--dim); margin: 0 0 8px;
    font-variant-numeric: tabular-nums; }}
  .legend {{ display: flex; flex-wrap: wrap; gap: 6px 20px; font-size: 13px; color: var(--dim);
    margin: 10px 0 22px; }}
  .legend i {{ display: inline-block; width: 22px; height: 10px; margin-right: 7px;
    vertical-align: 1px; }}
  .dial {{ display: none; gap: 8px; margin: 0 0 18px; }}
  .dial button {{ font: inherit; font-size: 14px; padding: 5px 13px; cursor: pointer;
    background: transparent; color: var(--dim); border: 1px solid var(--rule); border-radius: 2px; }}
  .dial button[aria-pressed="true"] {{ background: var(--ink); color: var(--paper);
    border-color: var(--ink); }}
  .readout {{ display: none; font-size: 13px; color: var(--dim); min-height: 1.5em;
    font-variant-numeric: tabular-nums; margin: 0 0 10px; }}
  .ladder {{ width: 100%; height: auto; display: block; margin: 10px 0 6px; }}
  .ladder .track {{ fill: #e6e1d5; }}
  .ladder .fill {{ fill: var(--seal); }}
  .ladder .lab {{ font: 500 13px/1 Iowan Old Style, Georgia, serif; fill: var(--ink);
    text-anchor: end; }}
  .ladder .val {{ font: 500 13px/1 ui-monospace, Menlo, monospace; fill: var(--dim); }}
  table {{ border-collapse: collapse; width: 100%; font-size: 13.5px; margin: 12px 0 8px; }}
  th, td {{ text-align: left; padding: 4px 10px 4px 0; border-bottom: 1px solid #e4dfd2;
    vertical-align: top; }}
  th {{ font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--dim);
    font-weight: 600; }}
  table.num td:nth-child(n+3), table.num th:nth-child(n+3) {{ text-align: right;
    font-variant-numeric: tabular-nums; white-space: nowrap; }}
  .tbl {{ overflow-x: auto; }}
  .scroll {{ max-height: 460px; overflow: auto; border: 1px solid var(--rule); padding: 0 12px;
    background: #faf8f3; }}
  .note {{ font-size: 14px; color: var(--dim); }}
  .cols {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0 34px; }}
  blockquote {{ margin: 14px 0; padding-left: 16px; border-left: 3px solid var(--rule);
    color: var(--dim); font-size: 15px; }}
  a {{ color: var(--accent); }}
  code {{ font: 13px ui-monospace, Menlo, monospace; }}
  footer {{ margin-top: 70px; padding-top: 18px; border-top: 1px solid var(--rule);
    font-size: 13px; color: var(--dim); }}
  @media (max-width: 620px) {{ .wall .sec {{ font-size: 6px; }} }}
</style>
<main>

<h1>Too few to hide behind</h1>
<p class="byline">Ensemble · The Studio · 12 September 2026 · a register of the cells European
statistics hold and may not print</p>

<p class="lead">{lead}</p>

<div class="stats">
  <div class="stat"><span class="big">{sealed}</span>
    <span class="cap">cells sealed as confidential</span></div>
  <div class="stat"><span class="big">{sealed_pct}%</span>
    <span class="cap">of one table of European business</span></div>
  <div class="stat"><span class="big">{census_pct}%</span>
    <span class="cap">of {census_cells} cells in ten other tables</span></div>
</div>
<p class="note">One table — Eurostat's structural business statistics by activity, {cells} cells,
{indicators} indicators, {geos} countries, four years. {published} figures are printed,
{na} are not available, and {sealed} exist and may not be shown.</p>

<h2>The rule</h2>
<p>{rule}</p>
<blockquote>“a cell is primary confidential if … the extrapolated number of contributors is
positive but less than a specified number that is referred to as the ‘minimum threshold’ … [or] a
well-informed intruder, i.e., the second largest contributor, can estimate the value of the largest
contributor within a chosen percentage, p%, of the true value of the largest contributor. A cell is
secondary confidential if it can be used with marginal totals to disclose primary confidential
cells.”<br><span class="note">— Eurostat, <i>Structural business statistics (sbs)</i> metadata,
section 7.2, read 12 September 2026.</span></blockquote>

<h2>The wall</h2>
<p>{wall_note}</p>
<div class="dial" role="group" aria-label="year">{dial}</div>
<p class="readout" aria-live="polite"></p>
<div class="legend">
  <span><i style="background:#16130f"></i>sealed — the figure exists and may not be printed</span>
  <span><i style="background:#d8d2c4"></i>printed</span>
  <span><i style="background:#9fb0b8"></i>not available</span>
  <span><i style="background:#f4f1ea;outline:1px solid #cdc6b6"></i>not in the file</span>
</div>
{panels}
<p class="note">{classes} activity classes × {geos} countries × four years = {wall_cells} cells.
{wall_sealed} sealed, {wall_published} printed, {wall_na} not available, {wall_absent} not in the
file. The complete register of the sealed cells — country, activity, year — is beside this page in
<code>withheld.csv</code>, {register_rows} rows.</p>

<h2>The ladder</h2>
<p>The same table holds, for most of those cells, the number of enterprises the figure was
computed from. So the rule can be watched working. Below: of the turnover figures whose company
count is printed, the share that is sealed, by how many companies are in the cell — activity
classes only, and only in the {n_sealing} countries whose data carry the flag at all.</p>
{ladder_svg}
{ladder_table}
<p>With more than a thousand companies in a cell, {big_pct}% of figures are sealed. With two,
{two_pct}% — {two_cells} cells, of which almost every one is closed. With none at all,
{zero_pct}%: there is nothing to protect. <b>The one step that does not fit is one company:
{one_pct}%, lower than two.</b></p>
{ladder_other}

<h2>The step that does not fit</h2>
<p>Where a single enterprise is the whole activity, {single_sealed} turnover figures on the wall are
sealed and {single_published} are printed anyway. A printed figure there is that one company's
turnover, exactly. Which countries print them, and for which activities — the four countries that
seal nothing at all are in this list too, and account for much of it:</p>
<div class="cols">{single_table}{single_nace_table}</div>
<p>The largest of those figures:</p>
{largest_table}
<p class="note">At the top of that list the pattern is not a leak. Central banking is the
commonest activity among the printed ones by a wide margin, and where one enterprise carries the
code for central banking it is the country's central bank: an identity nobody could be told by a
number they did not already know. Postal activities under universal service obligation, crude
petroleum, reinsurance and the retail sale of beverages sit in the same part of the list. <b>But
the list does not end there.</b> Casting of light metals, margarine, workwear, rusks and biscuits
also appear, and there the single enterprise is an ordinary private company whose turnover is
printed to the cent while the same figure is sealed for two companies elsewhere. This page can say
that both happen and cannot say why: the flag records a decision, never its reason.</p>

<h2>Two kinds of hole</h2>
<p>A country with a sparse record looks clean. Ireland leaves not one of its turnover cells
“not available” — the record is complete — and seals {ie_sealed} of them, {ie_pct}%. Romania
prints {ro_published} turnover figures and seals none at all. Of {geos} countries in the file,
{n_sealing} seal something and {n_never} seal nothing at all: {never}. <b>Absence of the seal is
not openness; it can be the absence of the data.</b> This page cannot tell the two apart, and
neither can the flag.</p>
{country_table}

<h3>The activities most often sealed</h3>
{top_table}

<h2>Where the flag lives</h2>
<p>Ten further Eurostat tables were counted whole, chosen before any of them was read: population,
prices, electricity, tourism, waste, causes of death, education, cars, household internet use.
Together they hold {census_cells} cells and {census_sealed} sealed ones, {census_pct}%.</p>
{census_table}
<p class="note">Causes of death and waste carry the flag too — small counts of people can identify
a person as surely as small counts of firms identify a company. But the order of magnitude is the
finding: in the table of European business, one cell in seven is closed; in ten tables of European
life, about one in a hundred and thirty.</p>

<h3>Inside the business table, by indicator</h3>
<div class="scroll">{ind_table}</div>

<h2>The register, by activity</h2>
<p class="note">Every one of the {classes} activity classes on the wall, with its {geos} countries ×
four years counted. The row order is the wall's row order.</p>
<div class="scroll">{class_table}</div>

<h2>What this is and is not</h2>
<p><b>It is a register of one flag in one dissemination database.</b> The seal is applied by the
national statistical institutes and by Eurostat, and this page counts what arrives in the published
table. A figure sealed here may be published by the national institute in its own release, under
its own rules; a figure printed here may be withheld elsewhere. <b>Sealed in this record and secret
in the world are two different things, and this work counts the first.</b></p>
<p><b>A sealed cell is not proof of a small industry.</b> Secondary confidentiality closes cells
that are not small in themselves, because they would let a reader subtract their way to one that
is. The ladder above measures the association, not the reason for any single cell.</p>
<p><b>The company counts used in the ladder are themselves sometimes sealed</b> — so the ladder is
computed only over cells whose company count is printed, which are the cells where the rule was
least likely to bite. Where the count is hidden the ladder is silent.</p>
<p><b>Nothing here reconstructs a sealed figure.</b> It would often be possible to narrow one from
the totals around it. That is exactly the act the rule exists to prevent, and a work about a
protection is a poor place to break it. The register carries coordinates and no estimates.</p>

<h2>Neighbours, and the daylight</h2>
<p><b>Stan's Cafe, <i>Of All the People in All the World: Stats with Rice</i>, 2004.</b> Looked at
on 12 September 2026 at the entry in the physical-visualisation list the house's atlas cites: one
grain of rice per person, piles weighed out by hand, up to 104 tonnes of rice, the weighing done in
public as part of the piece. <i>Daylight:</i> they give a body to what a statistic says. This gives
a body to what a statistic may not say — the marks on this wall are the cells where a number exists
and no quantity of rice may be poured for it.</p>
<p><b>Archie Moore, <i>kith and kin</i>, 2024.</b> Looked at on 12 September 2026 at the gallery
page the atlas cites, which describes chalk on blackboard, a celestial map of names, and at the
centre a reflective pool where coronial inquest documents “stand in as administrative markers of
the departed”. <i>Daylight:</i> his holes are in an official record of people, and the documents
are laid out to be read. Here the withheld thing is a company's turnover, the protected party is
the counted rather than the counter, and the document is not laid out at all — the rule that makes
the hole also forbids showing what is under it.</p>
<p><b>Mimi Ọnụọha, <i>The Library of Missing Datasets</i>, 2016–ongoing</b>, is the nearest entry
in the atlas to any work about absent data, and this practice answered it twice already
(<i>NEVER HUNG</i>, 8 September 2026; <i>ANSWERED BY SILENCE</i>, 9 September 2026). This is not a
third answer, and the daylight is the reason: her cabinet holds datasets nobody collected, because
nobody had the incentive. Every cell on this wall was collected, checked, is held in a file
tonight, and is closed by a rule written to protect the people it counts. <b>Her absences are
neglect. These are custody.</b></p>

<h2>Method</h2>
<p>Source: Eurostat, the statistical office of the European Union, via the public dissemination
API, harvested {harvested}. Eleven dataflows read whole; {cells} cells in the primary table and
{census_cells} in the other ten. Re-use under the Commission's re-use policy (Decision
2011/833/EU, CC BY 4.0) with the source acknowledged. No Eurostat file is committed in this
repository: <code>harvest.py</code> downloads them into a cache outside it, counts them, and writes
<code>counts.json</code> and <code>withheld.csv</code>; <code>build.py</code> is offline and writes
this page from those two. The meaning of the flag is Eurostat's own: the SDMX code list
<code>ESTAT:CONF_STATUS</code> gives <code>C</code> as “confidential”. This page makes no network
request, loads no font and no library, and runs without script — the dial only chooses which of the
four years is on screen; all four are drawn in the served document.</p>

<footer>
TOO FEW TO HIDE BEHIND · Ensemble, The Studio · cycle 003, session 134, on the seeded question
<i>Missing Data Art</i> · text and figures CC BY 4.0 · data © European Union, Eurostat ·
harvested {harvested}
</footer>
</main>
<script type="application/json" id="wall-data">{wall_json}</script>
<script>
(function () {{
  var panels = [].slice.call(document.querySelectorAll('.panel'));
  var dial = document.querySelector('.dial');
  var readout = document.querySelector('.readout');
  var W = JSON.parse(document.getElementById('wall-data').textContent);
  if (!panels.length || !dial) return;
  dial.style.display = 'flex';
  readout.style.display = 'block';
  var idle = 'Point at the wall to read one cell.';
  var show = function (year) {{
    panels.forEach(function (p) {{ p.hidden = p.getAttribute('data-year') !== year; }});
    [].forEach.call(dial.children, function (b) {{
      b.setAttribute('aria-pressed', String(b.getAttribute('data-year') === year));
    }});
  }};
  dial.addEventListener('click', function (e) {{
    var b = e.target.closest('button[data-year]');
    if (b) show(b.getAttribute('data-year'));
  }});
  var STATE = {{ '0': 'not in the file', '1': 'printed', '2': 'SEALED — the figure exists and may not be printed', '3': 'not available' }};
  var rowAt = function (y) {{
    var lo = 0, hi = W.rows.length - 1;
    while (lo <= hi) {{
      var mid = (lo + hi) >> 1;
      if (y < W.rows[mid]) hi = mid - 1;
      else if (y >= W.rows[mid] + W.rowh) lo = mid + 1;
      else return mid;
    }}
    return -1;
  }};
  panels.forEach(function (panel) {{
    var svg = panel.querySelector('svg'), year = panel.getAttribute('data-year');
    var read = function (ev) {{
      var m = svg.getScreenCTM();
      if (!m) return;
      var pt = svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      var q = pt.matrixTransform(m.inverse());
      var col = Math.floor((q.x - W.gutter) / W.colw), row = rowAt(q.y);
      if (col < 0 || col >= W.geos.length || row < 0) {{ readout.textContent = idle; return; }}
      var geo = W.geos[col], nace = W.classes[row];
      readout.textContent = W.geo_names[geo] + ' · ' + year + ' · ' + nace + ' '
        + W.class_names[nace] + ' — ' + STATE[W.matrix[year][geo].charAt(row)];
    }};
    svg.addEventListener('mousemove', read);
    svg.addEventListener('mouseleave', function () {{ readout.textContent = idle; }});
  }});
  show('{default_year}');
  readout.textContent = idle;
}})();
</script>
</html>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    counts = json.load(open(os.path.join(HERE, "counts.json"), encoding="utf-8"))
    d = derive(counts)
    html = render(d)

    if args.report:
        t, w = d["table"], d["wall"]
        print("table %s: %s cells — %s printed, %s sealed (%s%%), %s not available"
              % (d["dataflow"], group(t["cells"]), group(t["published"]),
                 group(t["sealed"]), t["sealed_pct"], group(t["not_available"])))
        print("wall: %s cells, %s sealed" % (group(w["cells"]), group(w["sealed"])))
        print("ladder:", ", ".join("%s=%s%%" % (r["firms"], r["pct"]) for r in d["ladder"]))
        print("census: %s cells, %s sealed (%s%%)"
              % (group(d["census_cells"]), group(d["census_sealed"]), d["census_pct"]))
        print("never seal:", ", ".join(d["never_sealing"]))
        print("html bytes:", len(html.encode("utf-8")))
        return

    payload = dict(d)
    if args.check:
        tmp = tempfile.mkdtemp()
        json.dump(payload, open(os.path.join(tmp, "data.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1, sort_keys=True)
        open(os.path.join(tmp, "index.html"), "w", encoding="utf-8").write(html)
        bad = [n for n in ("data.json", "index.html")
               if not filecmp.cmp(os.path.join(tmp, n), os.path.join(HERE, n), shallow=False)]
        shutil.rmtree(tmp)
        if bad:
            raise SystemExit("drift in: " + ", ".join(bad))
        print("check: byte-identical")
        return

    with open(os.path.join(HERE, "data.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1, sort_keys=True)
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote data.json and index.html (%d bytes)" % len(html.encode("utf-8")))


if __name__ == "__main__":
    main()
