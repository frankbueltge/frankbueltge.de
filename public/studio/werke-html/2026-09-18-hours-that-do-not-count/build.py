#!/usr/bin/env python3
"""Build data.json and index.html from counts.json.  No network, no library, deterministic.

    build.py           write data.json and index.html
    build.py --check   rebuild both and fail if one byte differs
"""
import json, os, sys, hashlib
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
COUNTS = os.path.join(HERE, "counts.json")
DATA = os.path.join(HERE, "data.json")
PAGE = os.path.join(HERE, "index.html")

H0 = datetime(2024, 1, 1)
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def g(n, dec=0):
    """thin-space grouped number, the house's typography"""
    if dec:
        s = ("%%.%df" % dec) % n
        a, b = s.split(".")
        neg = a.startswith("-")
        a = a.lstrip("-")
        out = ""
        while len(a) > 3:
            out = " " + a[-3:] + out
            a = a[:-3]
        return ("-" if neg else "") + a + out + "." + b
    n = int(round(n))
    s = str(abs(n))
    out = ""
    while len(s) > 3:
        out = " " + s[-3:] + out
        s = s[:-3]
    return ("-" if n < 0 else "") + s + out


def pc(x, dec=2):
    return g(100.0 * x, dec) + " %"


def hstamp(i):
    return (H0 + timedelta(hours=i)).strftime("%Y-%m-%d %H:%M")


def dstamp(i):
    return (H0 + timedelta(hours=i)).strftime("%-d %b %Y")


# ----------------------------------------------------------------- data.json
def build_data(c):
    t, cap, law, door = c["totals"], c["capture"], c["law"], c["two_doors"]
    st = c["stations"]
    wall = c["wall"]
    HOURS = c["source"]["hours_in_year"]

    worst = sorted(range(HOURS), key=lambda i: (-wall["hole"][i], i))[:24]
    complete = [i for i in range(HOURS) if wall["hole"][i] == 0]

    longest = sorted(st, key=lambda s: -s["longest_hole"])[:14]
    lh = []
    for s in longest:
        a, l = max(s["holes"], key=lambda h: h[1])
        lh.append({"code": s["code"], "name": s["name"], "type": s["type"],
                   "start": a, "len": l, "from": hstamp(a), "to": hstamp(a + l - 1),
                   "capture": s["capture_year"]})

    bands = []
    for lo, hi in ((0, 6), (6, 10), (10, 15)):
        for tenths in (False, True):
            gset = [s for s in st if lo <= s["mean_value"] < hi
                    and bool(s.get("tenths")) == tenths]
            if not gset:
                continue
            bands.append({
                "band": "%d–%d" % (lo, hi), "tenths": tenths, "n": len(gset),
                "runs": sum(len(s["flat_runs_ge12"]) for s in gset) / len(gset),
                "hours": sum(s["hours_in_flat_ge24"] for s in gset) / len(gset),
            })

    rl = {int(k): v for k, v in c["shape"]["hole_run_lengths"].items()}
    rl_bins = []
    for k in range(1, 13):
        rl_bins.append([str(k), rl.get(k, 0)])
    rl_bins.append(["13–23", sum(v for k, v in rl.items() if 13 <= k <= 23)])
    rl_bins.append(["24+", sum(v for k, v in rl.items() if k >= 24)])

    stations = [[s["code"], s["name"], s["city"], s["type"], s["network"],
                 round(s["capture_year"], 6), round(s["capture_span"], 6),
                 s["missing"], s["longest_hole"], s["exceedances"],
                 1 if s.get("tenths") else 0, round(s["mean_value"], 2),
                 len(s["flat_runs_ge12"])] for s in st]

    d = {
        "year": c["source"]["year"], "hours": HOURS, "days": c["source"]["days_in_year"],
        "component": c["source"]["component"], "scopes": c["source"]["scopes"],
        "fetched": "2026-09-18",
        "head": {
            "stations": t["stations_with_no2"],
            "listed_without": t["stations_listed_without_no2"],
            "present": t["present_hours"], "holes": t["hole_hours"],
            "runs": t["hole_runs"], "one_hour_runs": rl.get(1, 0),
            "span_hours": t["span_hours"],
            "capture_span": t["capture_span"], "capture_year": t["capture_year"],
            "median_capture_year": cap["median_year"],
            "stations_with_a_hole": t["stations_with_no2"] - t["stations_without_a_single_hole"],
            "stations_without_a_hole": t["stations_without_a_single_hole"],
            "below_90_year": cap["below_90_year"], "below_90_span": cap["below_90_span"],
            "exceedances": t["exceedance_hours"],
            "exceedance_stations": t["stations_with_any_exceedance"],
            "hours_per_exceedance": t["hole_hours"] / max(1, t["exceedance_hours"]),
            "tenths_stations": sum(1 for s in st if s.get("tenths")),
            "integer_networks": [r["network"] for r in c["resolution_by_network"]
                                 if r["with_decimals"] == 0],
            "hours_missing_somewhere": sum(1 for x in wall["hole"] if x),
            "complete_hours": len(complete),
        },
        "wall": {"hole": wall["hole"], "outside": wall["outside"], "flat": wall["flat24"]},
        "clock": c["shape"]["holes_by_hour_of_day"],
        "runlen": rl_bins,
        "capture_hist": cap["histogram_year"],
        "worst_hours": [[i, wall["hole"][i]] for i in worst],
        "complete_hours": [[i, hstamp(i)] for i in complete],
        "longest_holes": lh,
        "resolution": c["resolution_by_network"],
        "flat_bands": bands,
        "register": c["register_vs_record"],
        "door": {
            "checked": door["checked"], "with_max": door["with_max"],
            "without_max": door["without_max"], "agree": door["agree"],
            "max_above": door["max_above_hours"], "max_below": door["max_below_hours"],
            "max_but_no_hour": door["max_but_no_hour"],
            "min_hours_with_max": door["min_hours_with_max"],
            "with_hist": door["hours_hist_with_max"],
            "without_hist": door["hours_hist_without_max"],
            "offset": door["offset_agreement"],
            "below18_with_max": sum(door["hours_hist_with_max"][:18]),
            "below18_without_max": sum(door["hours_hist_without_max"][1:18]),
            "from18_without_max": sum(door["hours_hist_without_max"][18:]),
        },
        "law": law,
        "stations": stations,
        "no_no2": [[s["code"], s["name"], s["type"]] for s in c["stations_listed_without_no2"]],
        "worst_station": max(st, key=lambda s: s["exceedances"])["code"],
    }
    return d


# ------------------------------------------------------------------ drawing
def wall_svg(series, W=366, H=24, cw=3, ch=12, maxv=None):
    """366 days across, 24 hours of the day down; ink only where something is absent."""
    mx = maxv or max(series) or 1
    out = []
    for i, v in enumerate(series):
        if not v:
            continue
        day, hod = i // 24, i % 24
        lvl = min(6, 1 + int(6.0 * (v - 1) / mx))
        out.append('<rect class="w%d" x="%d" y="%d" width="%d" height="%d"/>'
                   % (lvl, day * cw, hod * ch, cw, ch))
    return "".join(out)


def bars_svg(vals, labels, w=1098, h=210, pad=26, cls="bar", fmt=g, hi=None):
    n = len(vals)
    mx = max(vals) or 1
    bw = (w - pad) / n
    out = []
    for i, v in enumerate(vals):
        bh = (h - 34) * v / mx
        c = cls + (" hi" if hi is not None and i == hi else "")
        out.append('<rect class="%s" x="%.2f" y="%.2f" width="%.2f" height="%.2f"/>'
                   % (c, pad + i * bw + 1, h - 34 - bh, bw - 2, bh))
        out.append('<text class="ax" x="%.2f" y="%d" text-anchor="middle">%s</text>'
                   % (pad + i * bw + bw / 2, h - 18, labels[i]))
    out.append('<text class="ax" x="0" y="14">%s</text>' % fmt(mx))
    out.append('<line class="grid" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (pad, h - 34, w, h - 34))
    return "".join(out)


def _ratio(bands):
    """cleanest band: hours inside long identical runs, whole numbers over tenths."""
    lo = [b for b in bands if b["band"] == "0\u20136"]
    a = next(b["hours"] for b in lo if not b["tenths"])
    b = next(x["hours"] for x in lo if x["tenths"])
    return a / b if b else float("inf")


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


# ------------------------------------------------------------------ the page
def build_page(c, d, data_text):
    hd = d["head"]
    law = d["law"]
    door = d["door"]
    HOURS = d["hours"]

    # month ticks for the wall
    ticks = []
    dd = H0
    for m in range(12):
        day = (datetime(2024, m + 1, 1) - H0).days
        ticks.append('<text class="ax" x="%d" y="10">%s</text>' % (day * 3 + 2, MONTHS[m]))
        if m:
            ticks.append('<line class="tick" x1="%d" y1="14" x2="%d" y2="302"/>'
                         % (day * 3, day * 3))
    hourlab = []
    for hh in (0, 6, 12, 18, 23):
        hourlab.append('<text class="ax hr" x="-6" y="%d" text-anchor="end">%02d</text>'
                       % (14 + hh * 12 + 9, hh))

    wall = wall_svg(d["wall"]["hole"])
    clock = bars_svg(d["clock"], ["%02d" % i for i in range(24)], hi=1)
    runl = bars_svg([v for _, v in d["runlen"]], [k for k, _ in d["runlen"]], h=190, pad=64)

    # capture strip: every station as a tick on a 0..100 axis
    strip = []
    for s in d["stations"]:
        x = 26 + (1098 - 26) * s[5]
        cl = "st" + ("  low" if s[5] < 0.9 else "")
        strip.append('<line class="%s" x1="%.2f" y1="26" x2="%.2f" y2="60"/>' % (cl, x, x))
    x90 = 26 + (1098 - 26) * 0.90
    strip.append('<line class="rule90" x1="%.2f" y1="20" x2="%.2f" y2="66"/>' % (x90, x90))
    strip.append('<text class="ax law" x="%.2f" y="14" text-anchor="end">the 90 %% '
                 'minimum data capture the directive requires →</text>' % (x90 - 6))
    for v in (0, .25, .5, .75, .90, 1.0):
        xx = 26 + (1098 - 26) * v
        cl = "ax law" if v == .90 else "ax"
        strip.append('<text class="%s" x="%.2f" y="84" text-anchor="middle">%d %%</text>'
                     % (cl, xx, int(round(v * 100))))
    strip = "".join(strip)

    # the second door: hours in a day against whether a maximum was published
    dw, dwo = door["with_hist"], door["without_hist"]
    doorbars = []
    mx = max(max(dw), max(dwo)) or 1
    import math
    for n in range(25):
        x = 40 + n * 42
        for v, cls, off in ((dw[n], "dmax", 0), (dwo[n], "dno", 19)):
            if v:
                bh = 150 * math.log10(1 + v) / math.log10(1 + mx)
                doorbars.append('<rect class="%s" x="%d" y="%.1f" width="17" '
                                'height="%.1f"/>' % (cls, x + off, 170 - bh, bh))
        doorbars.append('<text class="ax" x="%d" y="188" text-anchor="middle">%d</text>'
                        % (x + 18, n))
    doorbars.append('<line class="grid" x1="30" y1="170" x2="1090" y2="170"/>')
    doorbars.append('<line class="rule90" x1="%d" y1="8" x2="%d" y2="176"/>'
                    % (40 + 18 * 42 - 4, 40 + 18 * 42 - 4))
    doorbars = "".join(doorbars)

    rows_long = "".join(
        '<tr><td><b>%s</b><span>%s</span></td><td class="ty">%s</td><td class="n">%s</td>'
        '<td class="w">%s → %s</td><td class="n">%s</td></tr>'
        % (esc(h["code"]), esc(h["name"]), esc(h["type"]), g(h["len"]),
           esc(h["from"]), esc(h["to"]), pc(h["capture"], 1))
        for h in d["longest_holes"])

    rows_res = "".join(
        '<tr><td><b>%s</b><span>%s</span></td><td class="n">%d</td><td class="n">%d</td>'
        '<td class="n">%s</td></tr>'
        % (esc(r["network"]), esc(r["name"] or ""), r["stations"], r["with_decimals"],
           g(r["flat_runs_ge12"]))
        for r in d["resolution"])

    rows_band = "".join(
        '<tr><td>%s µg/m³</td><td>%s</td><td class="n">%d</td>'
        '<td class="n">%s</td><td class="n">%s</td></tr>'
        % (b["band"], "tenths" if b["tenths"] else "whole numbers", b["n"],
           g(b["runs"], 2), g(b["hours"], 1))
        for b in d["flat_bands"])

    rows_reg = "".join(
        '<tr><td><b>%s</b><span>%s</span></td><td>%s</td><td class="n">%s</td>'
        '<td class="n">%s</td></tr>'
        % (esc(r["code"]), esc(r["name"]),
           "the list says it starts" if r["kind"] == "starts_after"
           else "the list says it ended",
           esc(r["register"]), esc(r["record"]))
        for r in d["register"])

    complete_list = ", ".join(x[1] for x in d["complete_hours"])
    worst = d["worst_hours"][0]

    below18 = door["below18_with_max"]

    html = """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>THE HOURS THAT DO NOT COUNT — Ensemble</title>
<meta name="description" content="A year of German air drawn from nothing but its absences: %(holes)s hours with no measurement, and a law that does not count them.">
<style>
:root{--paper:#f2efe7;--ink:#20201d;--soft:#6d6759;--rule:#cfc9b8;--panel:#ece8dc;
--ink2:#4a463c;--hole:#1c1b18;--law:#a33718;--flat:#2f6b6b;--out:#8a7f66;--hi:#d69a12}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%%}
body{margin:0;background:var(--paper);color:var(--ink);
font:16px/1.55 "Iowan Old Style",Palatino,"Palatino Linotype","Book Antiqua",Georgia,serif}
header{max-width:1000px;margin:0 auto;padding:54px 20px 4px}
main{max-width:1000px;margin:0 auto;padding:0 20px 100px}
h1{font-size:clamp(32px,6.6vw,64px);line-height:.98;margin:0;letter-spacing:-.018em;
font-weight:600}
h1 span{color:var(--soft)}
.dek{font-size:clamp(16px,2.3vw,20px);color:var(--soft);margin:14px 0 0;max-width:46em}
.lede{font-size:clamp(18px,2.5vw,22px);line-height:1.44;margin:32px 0 0;max-width:34em}
h2{font-size:12.5px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;
margin:66px 0 6px;color:var(--soft);
font-family:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace}
h2 em{font-style:normal;color:var(--ink)}
p{max-width:38em}
.cap{color:var(--soft);font-size:15px;max-width:44em;margin:8px 0 18px}
figure{margin:0 0 8px}
svg{display:block;width:100%%;height:auto}
[hidden]{display:none!important}
.frame{background:#e7e3d6;border:1px solid var(--rule);padding:14px 10px 6px 34px;
overflow:hidden}
.w1{fill:#cbc5b4}.w2{fill:#a9a291}.w3{fill:#857e6d}.w4{fill:#5c5648}.w5{fill:#39352b}
.w6{fill:var(--hole)}
.ax{fill:var(--soft);font-size:11px;font-family:ui-monospace,Menlo,Consolas,monospace}
.hr{font-size:10.5px}
.tick{stroke:#d9d4c4;stroke-width:1}
.grid{stroke:var(--rule);stroke-width:1}
.bar{fill:#8b8472}.bar.hi{fill:var(--hole)}
.st{stroke:#9a9382;stroke-width:1.4}.st.low{stroke:var(--law);stroke-width:2}
.rule90{stroke:var(--law);stroke-width:1.5;stroke-dasharray:5 3}
.law{fill:var(--law);font-size:12px}
.dmax{fill:#8b8472}.dno{fill:var(--law)}
.nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(172px,1fr));gap:22px 26px;
margin:26px 0 0;padding:0;list-style:none}
.nums li{border-top:2px solid var(--ink);padding-top:8px}
.nums b{display:block;font-size:clamp(23px,4vw,33px);line-height:1.04;
font-variant-numeric:tabular-nums;font-weight:600}
.nums span{display:block;color:var(--soft);font-size:14.5px;margin-top:4px;line-height:1.36}
.panel{border:1px solid var(--rule);background:var(--panel);padding:16px 18px;margin:22px 0 0;
max-width:44em}
.panel p{margin:0 0 .7em;max-width:none}.panel p:last-child{margin:0}
.quote{border-left:3px solid var(--law);padding:2px 0 2px 16px;margin:20px 0;max-width:38em;
font-size:17.5px;line-height:1.45}
.quote cite{display:block;font-style:normal;font-size:14px;color:var(--soft);margin-top:8px;
font-family:ui-monospace,Menlo,Consolas,monospace}
table{border-collapse:collapse;width:100%%;margin:14px 0 0;font-size:14.5px}
th{text-align:left;font-weight:600;font-size:12px;letter-spacing:.09em;text-transform:uppercase;
color:var(--soft);border-bottom:1px solid var(--ink);padding:0 10px 5px 0;
font-family:ui-monospace,Menlo,Consolas,monospace}
td{border-bottom:1px solid var(--rule);padding:7px 10px 7px 0;vertical-align:baseline}
td b{font-weight:600;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}
td span{display:block;color:var(--soft);font-size:13.5px}
td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;
font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13.5px}
td.ty,td.w{color:var(--soft);font-size:13.5px}
td.w{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;white-space:nowrap}
.ctl{display:flex;flex-wrap:wrap;align-items:center;gap:9px 14px;margin:14px 0 0;
font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13.5px;color:var(--soft)}
.ctl button{font:inherit;color:var(--ink);background:#e3dfd1;border:1px solid var(--rule);
padding:5px 11px;cursor:pointer;border-radius:2px}
.ctl button[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.readout{margin:10px 0 0;min-height:2.6em;font-family:ui-monospace,Menlo,Consolas,monospace;
font-size:13.5px;color:var(--ink);max-width:56em}
.readout b{font-weight:600}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13.5px;color:var(--soft);
margin:10px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace}
.sw{display:inline-block;width:20px;height:9px;vertical-align:middle;margin-right:7px;
border:1px solid rgba(0,0,0,.16)}
.nojs{color:var(--soft);font-size:14px;margin-top:10px}
footer{border-top:1px solid var(--rule);margin-top:70px;padding-top:22px;color:var(--soft);
font-size:14.5px}
footer a{color:var(--ink2)}
ol.src{padding-left:1.2em;max-width:44em}
ol.src li{margin:0 0 9px}
@media (max-width:640px){.frame{padding-left:22px}td.w{font-size:11px;white-space:normal}}
@media (prefers-reduced-motion:no-preference){.pulse{transition:opacity .18s}}
</style></head>
<body>
<header>
<h1>THE HOURS<br>THAT <span>DO NOT</span> COUNT</h1>
<p class="dek">A year of German air drawn from nothing but its absences — and the rule
that decides how many absences a year is allowed to have.</p>
</header>
<main>

<p class="lede">In %(year)d, %(stations)s stations of the German air-quality network published
an hourly nitrogen-dioxide value %(present)s times. <b>%(holes)s hours have no value at
all.</b> European law asks that at least nine tenths of the hours be there, and says in the
same breath that losses to calibration and maintenance are not to be counted — and the
published record carries no field that says which hours those were.</p>

<ul class="nums">
<li><b>%(holes)s</b><span>hours with no measurement, inside the stations&#8217; own reporting
spans</span></li>
<li><b>%(runs)s</b><span>separate holes, of which <b>%(one_hour)s</b> are exactly one hour
long</span></li>
<li><b>%(stations_with_hole)s of %(stations)s</b><span>stations have at least one hole in the
year</span></li>
<li><b>%(exceed)s</b><span>hours above the %(limit)d µg/m³ hourly limit in the
whole country</span></li>
</ul>

<h2><em>1.</em> The wall — a year drawn only from what is missing</h2>
<p>Every hour of %(year)d, in order: <b>%(days)d days across, twenty-four hours of the day
down.</b> A cell is drawn only where at least one station has no value for that hour, and the
darker it is the more stations were silent at once. Nothing else is on the wall. The measured
year — all %(present)s values of it — is the paper.</p>
<figure class="frame"><svg viewBox="-24 0 1122 306" role="img"
 aria-label="The year 2024 as 366 days across and 24 hours of the day down; ink marks hours in which at least one station published no value.">
<g transform="translate(0,14)" id="wallg">%(wall)s</g>%(ticks)s%(hourlab)s
</svg></figure>
<div class="legend"><span><i class="sw" style="background:#cbc5b4"></i>1 station</span>
<span><i class="sw" style="background:#857e6d"></i>a few</span>
<span><i class="sw" style="background:#1c1b18"></i>up to %(worstn)d at once</span></div>
<div class="ctl" id="layers" hidden>
<span>Show:</span>
<button type="button" data-layer="hole" aria-pressed="true">no value</button>
<button type="button" data-layer="flat">no change (≥ 24 h identical)</button>
<button type="button" data-layer="outside">not reporting yet, or no longer</button>
</div>
<p class="readout" id="wallout"></p>
<p class="cap">Without a script the wall shows the first reading, complete. The darkest hour of
the year is <b>%(worst)s</b>, when %(worstn)d stations at once had no value. In
%(somewhere)s of the year&#8217;s %(hours)s hours at least one German station published
nothing; the %(complete)d hours in which every reporting station has a value are
%(complete_list)s.</p>

<h2><em>2.</em> The holes are one hour long, and they keep a clock</h2>
<p>Of the %(runs)s holes, <b>%(one_hour)s are a single hour</b> — %(one_hour_pc)s of them
— and only %(long_runs)s last a day or more. Sorted by the hour of the day they fall in,
they are not flat: the commonest hour to be missing is <b>01:00</b>, and the rarest is 06:00.</p>
<figure><svg viewBox="0 0 1098 210" role="img"
 aria-label="Missing hours by hour of day; the peak is at 01:00.">%(clock)s</svg></figure>
<p class="cap">Missing hours by hour of the day, all stations, whole year. The bar at 01:00 is
%(peak)s hours; at 06:00 it is %(trough)s.</p>
<figure><svg viewBox="0 0 1098 190" role="img"
 aria-label="How long a hole lasts: nearly all are one hour.">%(runl)s</svg></figure>
<p class="cap">How long a hole lasts, in hours. The last two columns gather 13–23 hours and
everything from a full day upward.</p>

<blockquote class="quote">The requirements for minimum data capture and time coverage do not
include losses of data due to the regular calibration or the normal maintenance of the
instrumentation.
<cite>Directive 2008/50/EC, Annex I, Section A — the same annex that sets the minimum data
capture for nitrogen dioxide at 90 %%</cite></blockquote>

<div class="panel"><p><b>This is the whole of the argument.</b> The law defines a quantity —
the share of hours that must be present — and then removes one class of absence from the
count. To compute it you must be able to say which hours were lost to calibration and which
were lost to something else. <b>The published record does not carry that distinction.</b> An
hour with no value looks exactly like an hour with no value. The hour-of-day profile above is
consistent with an overnight service cycle and equally consistent with several other things,
and this page asserts none of them: it reports that the number the directive asks for cannot be
computed from the record the directive produces, by anyone who is not inside the network.</p>
</div>

<h2><em>3.</em> Ninety per cent, station by station</h2>
<p>Each station is one tick, placed at the share of the calendar year for which it published a
value. The dashed line is the directive&#8217;s floor. <b>%(below90)s stations fall below
it</b> on the calendar year; measured instead over each station&#8217;s own first-to-last
reporting span — the more forgiving denominator, and the one that cannot punish a station
for being built in March — <b>%(below90span)s do.</b> The median station published
%(median)s of the year.</p>
<figure><svg viewBox="-12 0 1128 92" role="img"
 aria-label="Every station as a tick on a data-capture axis, with the 90 per cent line.">%(strip)s</svg></figure>
<p class="cap">Both denominators are stated because they disagree, and a share without its
denominator is not a measurement.</p>
<table><caption class="cap" style="text-align:left;caption-side:bottom">The fourteen longest
single holes in the year.</caption>
<thead><tr><th>Station</th><th>Kind</th><th class="n">Hours</th><th>From → to</th>
<th class="n">Year</th></tr></thead><tbody>%(rows_long)s</tbody></table>

<h2><em>4.</em> Eleven</h2>
<p>The hourly limit value for nitrogen dioxide is %(limit)d µg/m³, and a station
is allowed to pass it eighteen times a year. In the whole of Germany in %(year)d the record
contains <b>%(exceed)s hours above it</b>, all of them at one station, %(worst_station)s —
so no station comes near the allowance. Against those eleven hours stand %(holes)s hours with no
value: <b>%(per_exceed)s unmeasured hours for every hour over the limit.</b> That is not an
accusation and not an estimate of anything; it is the ratio between the two things this archive
can be asked about.</p>

<h2><em>5.</em> The second kind of absence: a change too small to write down</h2>
<p>%(tenths)s of the %(stations)s stations publish values with a decimal place. The other
%(integers)s publish whole numbers, and in %(nintnet)d of the seventeen networks not one station
publishes a tenth. Where the step is a whole microgram, a clean site returns the same integer
hour after hour — the longest such run in the year is <b>%(longflat)s consecutive hours of
the same number</b>. Every run of twelve hours or more in the whole country sits at a value of
8 µg/m³ or below.</p>
<p>So we went looking for stuck instruments and found a property of the record instead. Matched
on how much nitrogen dioxide a station actually sees, the stations that publish whole numbers
show far more stillness than the ones that publish tenths:</p>
<table><thead><tr><th>Station&#8217;s mean</th><th>Resolution</th><th class="n">Stations</th>
<th class="n">Runs ≥ 12 h</th><th class="n">Hours in runs ≥ 24 h</th>
</tr></thead><tbody>%(rows_band)s</tbody></table>
<p class="cap">Per station, whole year. In the cleanest band a whole-number station spends
%(flat_ratio)s times as many hours inside a run of identical values as a tenths station standing
in comparable air. <b>The change is not missing from the air. It is missing from the
record</b> — and which it is depends on which federal state the station stands in.</p>
<table><thead><tr><th>Network</th><th class="n">Stations</th><th class="n">…publishing
tenths</th><th class="n">Runs ≥ 12 h</th></tr></thead>
<tbody>%(rows_res)s</tbody></table>

<h2><em>6.</em> The third kind: a station that is not there</h2>
<p>%(listed_without)s stations that the network lists as active for measurement in %(year)d
return no nitrogen dioxide at all — they measure other things, and that is not a hole.
Nine stations are a different matter: the list and the archive disagree about when they
existed. Five are listed as beginning on 1 January 2026 while the archive holds an almost
complete %(year)d for them.</p>
<table><thead><tr><th>Station</th><th>The station list says</th><th class="n">Its date</th>
<th class="n">First or last hour in the archive</th></tr></thead>
<tbody>%(rows_reg)s</tbody></table>
<p class="cap">Both columns come from the same API on the same day, %(fetched)s: the left from
the station register&#8217;s own <span style="font-family:ui-monospace,Menlo,monospace">station
active from</span> and <span style="font-family:ui-monospace,Menlo,monospace">station active
to</span> fields, the right from the measurements it serves. No reason for the disagreement is
offered here, because the record gives none.</p>

<h2><em>7.</em> Asking the same archive twice</h2>
<p>The archive publishes a second number about each day: the daily maximum of that day&#8217;s
hourly values. It is computed, so it can be checked against the hours it is computed from.
<b>It agrees, every time.</b> All %(agree)s published maxima equal the largest hourly value the
first door shows for that day; none is higher, none lower, and not one day carries a maximum
without hours behind it. The second door hides nothing the first one shows.</p>
<p>What it does reveal is a rule nobody wrote down. Below, for every station-day, how many
hourly values it holds — dark where a daily maximum was published, red where none was:</p>
<figure><svg viewBox="0 0 1098 196" role="img"
 aria-label="Station-days by the number of hourly values they contain, split by whether a daily maximum was published.">%(doorbars)s</svg></figure>
<p class="cap">Logarithmic. <b>From eighteen hours upward — exactly three quarters of a day
— every one of %(from18)s station-days carries a maximum, without a single exception.</b>
Below eighteen the rule is not kept in either direction: %(below18)s days carry a maximum anyway,
one of them built on <b>%(minhours)d hours</b>, and %(below18no)s days with hours carry none.
Nothing in the published number says which it is. A daily maximum standing on four hours is
printed in the same characters as one standing on twenty-four.</p>

<h2><em>8.</em> What this does not show</h2>
<div class="panel">
<p><b>A missing hour here means exactly one thing:</b> the interface returned no one-hour mean
for that station, that component and that hour when it was asked on %(fetched)s. It does not
mean the instrument was off, and it does not mean the air went unmeasured — only that the
public record has no value there. The archive&#8217;s own interface description says data of the
current year are provisional and that final data appear in June of the following year, so
%(year)d, harvested now, is the final series.</p>
<p><b>No cause is inferred anywhere on this page.</b> Not for the peak at 01:00, not for the
%(longest)s-hour hole at Nauen, not for the nine register disagreements, not for the 130 days
that carry a maximum below the threshold. Each is stated as the record states it.</p>
<p><b>The comparison in section 5 is a controlled one and still not a proof.</b> Stations were
matched on their own annual mean, which is the obvious confounder, but they were not matched on
instrument, on siting or on how each network rounds before it publishes. What the table
establishes is that resolution and stillness move together once concentration is held roughly
fixed; it does not establish that any particular run is an artefact.</p>
<p><b>One component, one country, one year.</b> Nitrogen dioxide was chosen because it is the
component whose limit value is defined on the hour, so an unmeasured hour is the unit the law
itself works in. Nothing here is claimed of PM10, of ozone, of other member states, or of other
years.</p>
</div>

<h2><em>9.</em> Nearest works, and the daylight</h2>
<p>From the house&#8217;s Atlas of Data Art, opened at their own addresses on %(fetched)s:</p>
<ol class="src">
<li><b>The Year of Weather</b> — Open-weather (Soph Dyer and Sasha Engelmann), 2025.
Its page describes more than a hundred DIY satellite ground-station operators generating
&#8220;a living, collective record of planetary weather&#8221; as public environmental
knowledge comes under threat. <b>Daylight:</b> their record is assembled by volunteers from
outside the institution and its incompleteness is the condition it works in. This one is the
institution&#8217;s own record, complete to 97.8 %% and legally obliged to be complete to
90, and the question is not who is missing from the network but which hours the law agrees not
to count.</li>
<li><b>Garden of Eden</b> — Thorsten Kiesl, Harald Moser and Timm-Oliver Wilks, 2007.
Eight lettuces in airtight boxes, each standing for a city, the ozone inside each box driven in
real time by that city&#8217;s pollution level. <b>Daylight:</b> theirs makes a present
measurement felt in living tissue; this one draws only the hours in which no measurement was
made, and the material is a legal threshold rather than a concentration.</li>
<li><b>The Library of Missing Datasets</b> — Mimi Ọnụọha, 2016–ongoing.
Named here as the Atlas&#8217;s nearest entry to any work about absent data and deliberately not
answered a fourth time by this practice. Her folders are empty because nobody collected; these
hours are empty inside a series that was collected, is published, and is measured against a
number.</li>
<li><b>BELOW HEARING</b> — this practice, 2026-09-11, named because it is the closest
neighbour this room has itself made. There the absence sat below a sensor network&#8217;s
physical detection threshold. Here every instrument was in place and the hours are simply not
in the record, and the threshold that decides whether that matters is written in law rather
than in physics.</li>
</ol>

<h2><em>10.</em> How it was made</h2>
<ol class="src">
<li><b>Source.</b> Umweltbundesamt air-data API v3,
<span style="font-family:ui-monospace,Menlo,monospace">%(api)s</span> — endpoints
<span style="font-family:ui-monospace,Menlo,monospace">/stations/json</span> and
<span style="font-family:ui-monospace,Menlo,monospace">/measures/json</span>, component 5
(NO₂), scopes 2 (one-hour average) and 3 (daily maximum of the hourly values), the whole
of %(year)d. Read %(fetched)s. Data are published in CET throughout, so the year is exactly
%(hours)s hours with no daylight-saving seam.</li>
<li><b>Before anything was asked for.</b> The host&#8217;s
<span style="font-family:ui-monospace,Menlo,monospace">robots.txt</span> was read first. It does
not disallow <span style="font-family:ui-monospace,Menlo,monospace">/api/</span> and states no
crawl-delay; the www host that redirects to it asks for ten seconds, so the harvester waited
twelve between every request. %(reqs)d requests for the hourly year, %(reqsd)d for the daily
maxima, and no source file is mirrored into this repository — the cache lives outside it and
<span style="font-family:ui-monospace,Menlo,monospace">harvest.py --offline</span> rebuilds from
it without the network.</li>
<li><b>The law.</b> Directive 2008/50/EC of the European Parliament and of the Council of 21 May
2008, <a href="%(lawurl)s">Annex I, Section A</a> for the 90 %% minimum data capture and the
sentence quoted above, Annex XI for the %(limit)d µg/m³ hourly limit value and its
eighteen permitted exceedances. It is the directive in force for %(year)d; Directive (EU)
2024/2881 replaces it from 11 December 2026.</li>
<li><b>Arithmetic only.</b>
<span style="font-family:ui-monospace,Menlo,monospace">measure.py</span> turns the cache into
<span style="font-family:ui-monospace,Menlo,monospace">counts.json</span> and
<span style="font-family:ui-monospace,Menlo,monospace">build.py</span> turns that into this page
and into <span style="font-family:ui-monospace,Menlo,monospace">data.json</span>, which is
embedded in this document byte for byte. Nothing is modelled, imputed, smoothed or filled. No
model was called at any point.</li>
<li><b>Checked.</b> <span style="font-family:ui-monospace,Menlo,monospace">verify.mjs</span>
runs in a real browser with scripting off and on, with the network denied in both, and asserts
the drawing against the data rather than against itself.</li>
</ol>

<footer>
<p><b>THE HOURS THAT DO NOT COUNT</b> — Ensemble, the Studio, %(fetched)s. Cycle 003,
<i>Missing Data Art</i>. Text and figure CC BY 4.0; code Apache-2.0. The measurements are derived
from data published by the German Environment Agency (Umweltbundesamt) and are reproduced here
in aggregate with the source identified. No third-party code is embedded and no library is
loaded.</p>
</footer>
</main>
<script type="application/json" id="d">%(data)s</script>
<script>
(function(){
"use strict";
var D;try{D=JSON.parse(document.getElementById("d").textContent);}catch(e){return;}
var H0=Date.UTC(2024,0,1);
function stamp(i){var t=new Date(H0+i*3600000);
 var p=function(n){return(n<10?"0":"")+n;};
 return t.getUTCFullYear()+"-"+p(t.getUTCMonth()+1)+"-"+p(t.getUTCDate())+" "+p(t.getUTCHours())+":00";}
function grp(n){n=String(n);var o="";while(n.length>3){o="\\u202f"+n.slice(-3)+o;n=n.slice(0,-3);}return n+o;}

var g=document.getElementById("wallg"),out=document.getElementById("wallout"),
    bar=document.getElementById("layers");
if(!g||!out||!bar)return;
var LAY={hole:{s:D.wall.hole,t:"stations with no value"},
         flat:{s:D.wall.flat,t:"stations inside a run of 24 h or more of the identical value"},
         outside:{s:D.wall.outside,t:"stations not yet reporting, or no longer"}};
var cur="hole";
function draw(k){
 var s=LAY[k].s,mx=0,i;
 for(i=0;i<s.length;i++)if(s[i]>mx)mx=s[i];
 var f=document.createDocumentFragment();
 for(i=0;i<s.length;i++){
  var v=s[i];if(!v)continue;
  var lvl=Math.min(6,1+Math.floor(6*(v-1)/mx));
  var r=document.createElementNS("http://www.w3.org/2000/svg","rect");
  r.setAttribute("class","w"+lvl);
  r.setAttribute("x",(i/24|0)*3);r.setAttribute("y",(i%%24)*12);
  r.setAttribute("width",3);r.setAttribute("height",12);
  f.appendChild(r);
 }
 while(g.firstChild)g.removeChild(g.firstChild);
 g.appendChild(f);cur=k;
 out.innerHTML="<b>"+grp(s.reduce(function(a,b){return a+b;},0))+"</b> station-hours \\u00b7 "
  +LAY[k].t+" \\u00b7 darkest cell: "+mx+" at once. Point at the wall to read an hour.";
}
bar.hidden=false;
var btns=bar.querySelectorAll("button");
Array.prototype.forEach.call(btns,function(b){
 b.addEventListener("click",function(){
  Array.prototype.forEach.call(btns,function(x){x.setAttribute("aria-pressed",String(x===b));});
  draw(b.getAttribute("data-layer"));
 });
});
var svg=g.ownerSVGElement;
function at(ev){
 var pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
 var m=g.getScreenCTM();if(!m)return null;
 var p=pt.matrixTransform(m.inverse());
 var day=Math.floor(p.x/3),hod=Math.floor(p.y/12);
 if(day<0||day>=D.days||hod<0||hod>23)return null;
 return day*24+hod;
}
function say(i){
 if(i==null)return;
 var s=LAY[cur].s,v=s[i];
 out.innerHTML="<b>"+stamp(i)+"</b> \\u00b7 "+(v?grp(v):"no")+" "+
  (v===1?"station":"stations")+" \\u00b7 "+LAY[cur].t;
}
svg.addEventListener("mousemove",function(e){say(at(e));});
svg.addEventListener("touchstart",function(e){
 if(e.touches&&e.touches[0])say(at(e.touches[0]));},{passive:true});
svg.addEventListener("mouseleave",function(){draw(cur);});
draw("hole");
})();
</script>
</body></html>
""" % {
        "year": d["year"], "days": d["days"], "hours": g(d["hours"]),
        "stations": g(hd["stations"]), "present": g(hd["present"]),
        "holes": g(hd["holes"]), "runs": g(hd["runs"]),
        "one_hour": g(hd["one_hour_runs"]),
        "one_hour_pc": pc(hd["one_hour_runs"] / hd["runs"], 1),
        "long_runs": g(sum(v for k, v in
                           ((int(k), v) for k, v in c["shape"]["hole_run_lengths"].items())
                           if k >= 24)),
        "stations_with_hole": g(hd["stations_with_a_hole"]),
        "exceed": g(hd["exceedances"]), "limit": law["hourly_limit_value_no2"],
        "per_exceed": g(hd["hours_per_exceedance"], 0),
        "worst_station": esc(next(s[1] for s in d["stations"]
                                  if s[0] == d["worst_station"])),
        "wall": wall, "ticks": "".join(ticks), "hourlab": "".join(hourlab),
        "worst": hstamp(worst[0]), "worstn": worst[1],
        "somewhere": g(hd["hours_missing_somewhere"]),
        "complete": hd["complete_hours"], "complete_list": esc(complete_list),
        "clock": clock, "runl": runl,
        "peak": g(max(d["clock"])), "trough": g(min(d["clock"])),
        "below90": g(hd["below_90_year"]), "below90span": g(hd["below_90_span"]),
        "median": pc(hd["median_capture_year"], 2),
        "strip": strip, "rows_long": rows_long,
        "tenths": g(hd["tenths_stations"]),
        "integers": g(hd["stations"] - hd["tenths_stations"]),
        "nintnet": len(hd["integer_networks"]),
        "longflat": g(max(r["len"] for r in c["longest_flat_runs"])),
        "rows_band": rows_band, "rows_res": rows_res,
        "flat_ratio": g(_ratio(d["flat_bands"]), 1),
        "listed_without": g(hd["listed_without"]), "rows_reg": rows_reg,
        "agree": g(door["agree"]), "doorbars": doorbars,
        "from18": g(sum(door["with_hist"][18:])), "below18": g(below18),
        "below18no": g(door["below18_without_max"]),
        "minhours": door["min_hours_with_max"],
        "longest": g(max(h["len"] for h in d["longest_holes"])),
        "fetched": d["fetched"], "api": esc(c["source"]["api"]),
        "reqs": c["source"]["requests_hourly"], "reqsd": c["source"]["requests_daily"],
        "lawurl": esc(law["url"]),
        "data": data_text,
    }
    return html


def main():
    check = "--check" in sys.argv
    with open(COUNTS) as f:
        c = json.load(f)
    d = build_data(c)
    data_text = json.dumps(d, separators=(",", ":"), ensure_ascii=False)
    page = build_page(c, d, data_text)

    if check:
        ok = True
        for path, new in ((DATA, data_text), (PAGE, page)):
            old = open(path, encoding="utf-8").read()
            same = old == new
            print("%-12s %s  sha256 %s" % (os.path.basename(path),
                                           "identical" if same else "DIFFERS",
                                           hashlib.sha256(new.encode()).hexdigest()[:16]))
            ok = ok and same
        sys.exit(0 if ok else 1)

    with open(DATA, "w", encoding="utf-8") as f:
        f.write(data_text)
    with open(PAGE, "w", encoding="utf-8") as f:
        f.write(page)
    print("data.json  %d bytes" % len(data_text.encode()))
    print("index.html %d bytes" % len(page.encode()))


if __name__ == "__main__":
    main()
