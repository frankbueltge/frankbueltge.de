"""Project 1 (Earth's rotation), session 3: first study, "the days, end to end".

Reads only committed files:
  material/earth-rotation/2026-09-25-session-2/bulletin-a-ut1.csv  (USNO Bulletin A,
      distribution unlimited; UT1-UTC and length-of-day excess, 19,624 days)
  the Bulletin C 53-72 issue dates, copied below from
      material/earth-rotation/2026-09-25-prospect/derived.txt (each "NO leap second")
and writes index.html beside this file (self-contained: nothing is fetched at runtime)
plus figures.txt (every number the page states, printed by this script).

The form: each measured day lasts, on the page's time axis, exactly its own
length-of-day excess (|LOD - 86400 s|). Laid end to end, the days since
1973-01-03 last as long as the sum of those excesses. Leap seconds, zero
crossings of UT1-UTC and the twenty "NO" bulletins are placed on the same axis,
against the days (the guard's constraint on form, JOURNAL.md session 2).

Run from the repository root: python3 projects/earth-rotation/study-1/build.py
"""
import csv
import datetime as dt
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = "material/earth-rotation/2026-09-25-session-2/bulletin-a-ut1.csv"

# Bulletin C 53-72, issue dates as printed in the prospect's derived.txt.
NOS = [("53", "2017-01-09"), ("54", "2017-07-06"), ("55", "2018-01-09"),
       ("56", "2018-07-05"), ("57", "2019-01-07"), ("58", "2019-07-04"),
       ("59", "2020-01-07"), ("60", "2020-07-07"), ("61", "2021-01-07"),
       ("62", "2021-07-05"), ("63", "2022-01-05"), ("64", "2022-07-05"),
       ("65", "2023-01-09"), ("66", "2023-07-04"), ("67", "2024-01-08"),
       ("68", "2024-07-04"), ("69", "2025-01-06"), ("70", "2025-07-07"),
       ("71", "2026-01-06"), ("72", "2026-07-06")]

rows = list(csv.DictReader(open(SRC)))
dates = [dt.date.fromisoformat(r["date"]) for r in rows]
assert all((b - a).days == 1 for a, b in zip(dates, dates[1:])), "series not contiguous"
ut1 = [float(r["ut1_minus_utc_s"]) for r in rows]

# The days used: those with a filled LOD, excluding the first row's 0.0000
# placeholder (the readme: LOD "NOT ALWAYS FILLED"; session 2's caveat).
days = []  # (date, lod_ms, ut1_s)
for i, r in enumerate(rows):
    if i == 0 or r["lod_excess_ms"] == "":
        continue
    days.append((dates[i], float(r["lod_excess_ms"]), ut1[i]))

# cumulative axis: start of each day, in seconds of |excess|
start = []
t = 0.0
for d, lod, u in days:
    start.append(t)
    t += abs(lod) / 1000.0
TOTAL = t
idx = {d: k for k, (d, _, _) in enumerate(days)}

leaps, crossings = [], []
gaps = []
for i in range(1, len(rows)):
    if dates[i] not in idx:
        continue
    if abs(ut1[i] - ut1[i - 1]) > 0.5:
        leaps.append(dates[i])
    elif (ut1[i] < 0) != (ut1[i - 1] < 0):
        crossings.append(dates[i])

last_leap = leaps[-1]
ax_gaps = [start[idx[b]] - start[idx[a]] for a, b in zip(leaps, leaps[1:])]
cal_gaps = [(b - a).days / 365.25 for a, b in zip(leaps, leaps[1:])]
t_since = TOTAL - start[idx[last_leap]]
cal_since = (days[-1][0] - last_leap).days + 1
cal_all = len(days)
pos_sum = sum(l for _, l, _ in days if l > 0) / 1000
neg_sum = -sum(l for _, l, _ in days if l < 0) / 1000
n_neg = sum(1 for _, l, _ in days if l < 0)
neg_since = [l for d, l, _ in days if l < 0 and d >= dt.date(2017, 1, 1)]
first, last = days[0][0], days[-1][0]

figs = [
    f"days used: {len(days)}, {first} to {last} (first row's LOD placeholder and the newest row's empty LOD excluded)",
    f"sum of |excess|, the axis: {TOTAL:.3f} s",
    f"  of which longer-than-86400 s days: {pos_sum:.3f} s; shorter days: {neg_sum:.3f} s ({n_neg} days)",
    f"  since the last leap second: {len(neg_since)} shorter days, {-sum(neg_since)/1000:.3f} s",
    f"leap seconds inside the used days: {len(leaps)}, last {last_leap}",
    f"  intervals between them: on the axis {min(ax_gaps):.2f}-{max(ax_gaps):.2f} s; in the calendar {min(cal_gaps):.1f}-{max(cal_gaps):.1f} years",
    f"UT1-UTC zero crossings inside the used days: {len(crossings)}, since the last leap second: "
    + ", ".join(str(c) for c in crossings if c > last_leap),
    f"consistency: change in UT1-UTC over the used days {days[-1][2]-days[0][2]:+.4f} s; "
    f"minus the summed excess plus the leap seconds {-sum(l for _, l, _ in days)/1000 + len(leaps):+.4f} s",
    f"since the last leap second: {cal_since} of {cal_all} calendar days "
    f"({100*cal_since/cal_all:.1f} %), {t_since:.3f} s of {TOTAL:.3f} s on the axis ({100*t_since/TOTAL:.1f} %)",
]
for c, d in NOS:
    dd = dt.date.fromisoformat(d)
    figs.append(f"  Bulletin C {c} ({d}) sits at {start[idx[dd]]:.3f} s")
open(os.path.join(HERE, "figures.txt"), "w").write("\n".join(figs) + "\n")
print("\n".join(figs))

# ---- static floor: SVG strips, binned on the axis (complete without JS) ----
W, H, MID = 1000, 160, 80
SC = 60 / 4.1  # px per ms, 4.1 ms the largest excess in the series


def strip(t_from, t_to, sid, hid, bins, label):
    span = t_to - t_from

    def x(tsec):
        return (tsec - t_from) / span * W

    acc = [[0.0, 0.0] for _ in range(bins)]  # (max + excess, max - excess) per bin, ms
    for k, (d, lod, u) in enumerate(days):
        if start[k] < t_from:
            continue
        b = min(bins - 1, int((start[k] - t_from) / span * bins))
        if lod >= 0:
            acc[b][0] = max(acc[b][0], lod)
        else:
            acc[b][1] = max(acc[b][1], -lod)
    parts = []
    for b, (p, n) in enumerate(acc):
        bx = b * W / bins
        if p > 0:
            parts.append(f'<rect class="up" x="{bx:.1f}" y="{MID - p*SC:.1f}" width="{W/bins:.2f}" height="{p*SC:.1f}"/>')
        if n > 0:
            parts.append(f'<rect class="dn" x="{bx:.1f}" y="{MID}" width="{W/bins:.2f}" height="{n*SC:.1f}"/>')
    for d in leaps:
        if start[idx[d]] >= t_from:
            xx = x(start[idx[d]])
            parts.append(f'<line class="leap" x1="{xx:.1f}" x2="{xx:.1f}" y1="6" y2="{H-6}"/>')
    for c, d in NOS:
        xx = x(start[idx[dt.date.fromisoformat(d)]])
        parts.append(f'<line class="no" x1="{xx:.1f}" x2="{xx:.1f}" y1="{MID+4}" y2="{H-10}"/>')
    for d in crossings:
        if start[idx[d]] >= t_from:
            parts.append(f'<circle class="cross" cx="{x(start[idx[d]]):.1f}" cy="{MID}" r="2.2"/>')
    return (f'<svg id="{sid}" class="strip" viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" '
            f'data-from="{t_from:.6f}" data-to="{t_to:.6f}" aria-label="{label}">'
            f'<line class="axis" x1="0" x2="{W}" y1="{MID}" y2="{MID}"/>' + "".join(parts) +
            f'<line id="{hid}" class="head" x1="0" x2="0" y1="0" y2="{H}" visibility="hidden"/></svg>')


svg = strip(0.0, TOTAL, "strip", "head", 500,
            f"{len(days)} days laid end to end, each as long as its own excess over 86,400 seconds; "
            f"{len(leaps)} leap seconds and 20 NO bulletins marked")
t_last = start[idx[last_leap]]
svg2 = strip(t_last, TOTAL, "strip2", "head2", 300,
             "the last stretch enlarged, from the last added second to the newest day: "
             "twenty NO bulletins and five crossings")
ticks = []
for y in (1975, 1985, 1995, 2005):
    ticks.append(f'<span style="left:{start[idx[dt.date(y, 1, 1)]]/TOTAL*100:.2f}%">{y}</span>')
ticks.append(f'<span class="end">{last.year}</span>')
ticks2 = ['<span class="start">2017</span>']
for y in (2020, 2023):
    ticks2.append(f'<span style="left:{(start[idx[dt.date(y, 1, 1)]]-t_last)/(TOTAL-t_last)*100:.2f}%">{y}</span>')
ticks2.append(f'<span class="end">{last.year}</span>')

# ---- data for the playhead and the sound: lod in units of 0.1 microsecond ----
data = {
    "first": first.isoformat(),
    "lod": [round(l * 10000) for _, l, _ in days],
    "ut1": [round(u * 10000) for _, _, u in days],
    "leaps": [idx[d] for d in leaps],
    "nos": [[c, idx[dt.date.fromisoformat(d)]] for c, d in NOS],
}

html = open(os.path.join(HERE, "template.html")).read()
html = (html.replace("{{SVG}}", svg).replace("{{TICKS}}", "".join(ticks))
        .replace("{{SVG2}}", svg2).replace("{{TICKS2}}", "".join(ticks2))
        .replace("{{DATA}}", json.dumps(data, separators=(",", ":")))
        .replace("{{TOTAL}}", f"{TOTAL:.1f}").replace("{{NDAYS}}", f"{len(days):,}")
        .replace("{{FIRST}}", first.strftime("%-d %B %Y")).replace("{{LAST}}", last.strftime("%-d %B %Y"))
        .replace("{{NLEAPS}}", str(len(leaps))).replace("{{TSINCE}}", f"{t_since:.1f}")
        .replace("{{CALPCT}}", f"{100*cal_since/cal_all:.0f}").replace("{{AXPCT}}", f"{100*t_since/TOTAL:.0f}")
        .replace("{{NEG}}", f"{-sum(neg_since)/1000:.2f}").replace("{{NNEG}}", f"{len(neg_since):,}"))
assert "{{" not in html
open(os.path.join(HERE, "index.html"), "w").write(html)
print(f"index.html: {len(html):,} bytes")
