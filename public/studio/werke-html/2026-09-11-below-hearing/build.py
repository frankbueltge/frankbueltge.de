#!/usr/bin/env python3
"""BELOW HEARING — the builder.

Reads `counts.json` (written by `harvest.py`, the one part of this work that touches the
network) and nothing else. No network, no model, no third-party module. Deterministic:

    python3 build.py            rebuild data.json and index.html
    python3 build.py --check    rebuild into memory and fail if either file differs

WHAT IS COMPUTED, AND WHERE IT COMES FROM.

A catalogue of earthquakes is a record with a floor. Below some magnitude the instruments
that feed it do not hear the ground, and the events that happen there are never written
down. That floor is called the magnitude of completeness, Mc, and it is a property of the
listening, not of the Earth.

The record can be asked how much of itself is missing, because earthquake sizes follow an
empirical law. Gutenberg and Richter (1944) found that the number of events of at least
magnitude m falls off as log10 N(>= m) = a - b*m, a straight line on a log axis. Above Mc
the record traces that line. Below Mc it falls away from it. THE GAP BETWEEN THE LINE AND
THE RECORD IS THE COUNT OF EARTHQUAKES THAT HAPPENED AND THAT NOBODY WROTE DOWN.

Estimators, each named on the page and each a setting the reader can change:

  Mc by maximum curvature (MAXC): the magnitude bin holding the most events. Woessner and
      Wiemer (2005) find MAXC underestimates Mc and add +0.2; that is the default here.
  Mc by goodness-of-fit (GFT), Wiemer and Wyss (2000): the lowest Mc whose fitted line
      reproduces the observed cumulative counts to within 5 % (R >= 95) or 10 % (R >= 90).
  b by maximum likelihood, Aki (1965): b = log10(e) / (mean magnitude - Mc), with the mean
      taken over bin centres, which supplies the half-bin correction.
  sigma_b by Shi and Bolt (1982).

THE ASSUMPTION IS THE WHOLE THING. Extrapolating the line below Mc assumes the law holds
there. It is an assumption about the Earth, corroborated far outside this house, and it is
the only reason a number exists at all. Drop it and the count of missing events is bounded
below by zero and not bounded above: the page carries that setting too, and says so.

WHAT IS NOT CLAIMED. Nothing here compares how seismic one place is with another. Each
region's line is fitted to that region's own record, so a quiet box and a loud box are each
measured against themselves. What is compared is the floor of hearing.
"""

import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TODAY = "2026-09-11"
SESSION = 133
DM = 0.1                      # the width of one magnitude bin, as harvested
R_EARTH = 6371.0087714        # km, IUGG mean radius

FLOORS = [2.0, 2.5, 3.0, 3.5, 4.0]
FLOOR_DEFAULT = 3.0

RULES = [
    ("maxc",     "maximum curvature, +0.2",  "Woessner & Wiemer (2005) correction to the MAXC estimate"),
    ("maxc_raw", "maximum curvature, raw",   "the fullest magnitude bin, uncorrected"),
    ("gft95",    "goodness of fit, 95 %",    "Wiemer & Wyss (2000): lowest Mc whose fitted line reproduces the record to 5 %"),
    ("gft90",    "goodness of fit, 90 %",    "the same test relaxed to 10 %"),
    ("cautious", "maximum curvature, +0.7",  "a deliberately cautious floor, half a magnitude above the default"),
    ("none",     "no law at all",            "hold nothing about magnitudes below the floor of hearing"),
]
RULE_DEFAULT = "maxc"

LOG10E = math.log10(math.e)
B_BAND = (0.6, 1.6)           # the band inside which a fitted b is worth believing


def die(msg):
    print("build.py: " + msg, file=sys.stderr)
    raise SystemExit(1)


# ---------------------------------------------------------------- the record, unpacked

def incremental(cum):
    """n(i) = N(>= m_i) - N(>= m_{i+1}); the last bin keeps whatever is above it."""
    out = []
    for i in range(len(cum)):
        out.append(cum[i] - cum[i + 1] if i + 1 < len(cum) else cum[i])
    return out


def moments(mags, inc, mc):
    """Count, mean and variance of the magnitudes at or above mc, over bin centres."""
    n = 0
    s = 0.0
    for m, k in zip(mags, inc):
        if m >= mc - 1e-9 and k:
            n += k
            s += k * (m + DM / 2.0)
    if n == 0:
        return 0, None, None
    mean = s / n
    v = 0.0
    for m, k in zip(mags, inc):
        if m >= mc - 1e-9 and k:
            v += k * ((m + DM / 2.0) - mean) ** 2
    return n, mean, v


def b_value(mags, inc, mc):
    """Aki (1965) maximum likelihood, bin centres supplying the half-bin correction."""
    n, mean, v = moments(mags, inc, mc)
    if n < 2 or mean is None or mean - mc <= 1e-6:
        return None, None, n
    b = LOG10E / (mean - mc)
    sigma = 2.30 * b * b * math.sqrt(v / (n * (n - 1))) if n > 1 else None
    return b, sigma, n


def cum_at(mags, cum, m):
    """N(>= m) straight out of the harvested table; m must be one of the thresholds."""
    for mi, c in zip(mags, cum):
        if abs(mi - m) < 1e-9:
            return c
    die("no harvested threshold at magnitude %.1f" % m)


def maxc(mags, inc, cum):
    best_m, best_n = None, -1
    for m, k, c in zip(mags, inc, cum):
        if c == 0:
            continue
        if k > best_n:
            best_m, best_n = m, k
    return best_m


def gft(mags, inc, cum, target):
    """Wiemer & Wyss (2000), on the cumulative distribution. Lowest Mc reaching R >= target."""
    top = max((m for m, c in zip(mags, cum) if c > 0), default=None)
    if top is None:
        return None, None
    best = None
    for mc in mags:
        if mc > top:
            break
        n_mc = cum_at(mags, cum, mc)
        if n_mc < 50:                       # below this a fit says more about noise than rock
            continue
        b, _, _ = b_value(mags, inc, mc)
        if b is None:
            continue
        a = math.log10(n_mc) + b * mc
        num = den = 0.0
        for m, c in zip(mags, cum):
            if m < mc - 1e-9 or m > top + 1e-9:
                continue
            syn = 10.0 ** (a - b * m)
            num += abs(c - syn)
            den += c
        if den == 0:
            continue
        r = 100.0 * (1.0 - num / den)
        if best is None or r > best[1]:
            best = (mc, r)
        if r >= target:
            return mc, r
    return (None, best[1]) if best else (None, None)


def box_area_km2(b):
    lam = math.radians(b["max_lon"] - b["min_lon"])
    return abs(R_EARTH ** 2 * lam * (math.sin(math.radians(b["max_lat"])) - math.sin(math.radians(b["min_lat"]))))


# ---------------------------------------------------------------- the region, measured

def measure(region, mags):
    cum = region["cumulative"]
    for i in range(1, len(cum)):
        if cum[i] > cum[i - 1]:
            die("%s: the harvested counts are not monotone at M %.1f (%d after %d); the record was "
                "read in an inconsistent state and this build refuses it"
                % (region["name"], mags[i], cum[i], cum[i - 1]))
    inc = incremental(cum)
    total = cum[0]
    if total < 30:
        die("%s holds only %d events; this work does not fit a law to that" % (region["name"], total))

    mc_raw = maxc(mags, inc, cum)
    g95, r95 = gft(mags, inc, cum, 95.0)
    g90, r90 = gft(mags, inc, cum, 90.0)

    floors_of = {
        "maxc":     round(mc_raw + 0.2, 1),
        "maxc_raw": round(mc_raw, 1),
        "gft95":    round(g95, 1) if g95 is not None else None,
        "gft90":    round(g90, 1) if g90 is not None else None,
        "cautious": round(mc_raw + 0.7, 1),
        "none":     None,
    }

    rules = {}
    for key, _, _ in RULES:
        mc = floors_of[key]
        if key == "none" or mc is None:
            rules[key] = {"mc": mc, "b": None, "sigma_b": None, "n_above": None,
                          "unavailable": key != "none" }
            continue
        b, sb, n = b_value(mags, inc, mc)
        rules[key] = {"mc": mc, "b": None if b is None else round(b, 4),
                      "sigma_b": None if sb is None else round(sb, 4),
                      "n_above": n, "unavailable": b is None,
                      # eighty years of catalogues put b close to 1; far outside that band the
                      # fit is the thing that is wrong, not the Earth, and the page says so
                      "implausible_b": b is not None and (b < B_BAND[0] or b > B_BAND[1])}

    # the grid: for every rule, for every floor, what the record holds and what the law expects
    grid = {}
    for key, _, _ in RULES:
        r = rules[key]
        row = {}
        for f in FLOORS:
            observed = cum_at(mags, cum, f)
            if key == "none":
                row["%.1f" % f] = {"observed": observed, "expected": None, "missing": None,
                                   "unbounded": True, "complete": False}
                continue
            if r["unavailable"] or r["b"] is None:
                row["%.1f" % f] = {"observed": observed, "expected": None, "missing": None,
                                   "unbounded": False, "complete": False, "unavailable": True}
                continue
            mc, b = r["mc"], r["b"]
            if f >= mc - 1e-9:
                row["%.1f" % f] = {"observed": observed, "expected": observed, "missing": 0,
                                   "unbounded": False, "complete": True}
                continue
            n_mc = cum_at(mags, cum, mc)
            expected = n_mc * (10.0 ** (b * (mc - f)))
            row["%.1f" % f] = {"observed": observed,
                               "expected": int(round(expected)),
                               "missing": int(round(max(0.0, expected - observed))),
                               "unbounded": False, "complete": False}
        grid[key] = row

    top = max((m for m, c in zip(mags, cum) if c > 0), default=None)
    # the smallest magnitude at which this record holds anything at all, straight from the counts
    record_floor = max((m for m, c in zip(mags, cum) if c == total), default=mags[0])
    return {
        "name": region["name"],
        "sparse": total < 500,
        "box": region["box"],
        "area_km2": int(round(box_area_km2(region["box"]))),
        "total": total,
        "largest_threshold": top,
        "record_floor": round(record_floor, 1),
        # the harvest asked no lower than its first threshold, so a record reaching it is censored
        "record_floor_censored": abs(record_floor - mags[0]) < 1e-9,
        "cumulative": cum,
        "incremental": inc,
        "rules": rules,
        "gft_best_r": {"95": None if r95 is None else round(r95, 1),
                       "90": None if r90 is None else round(r90, 1)},
        "grid": grid,
    }


# ---------------------------------------------------------------- the drawing

def fmt(n):
    if n is None:
        return "—"
    s = "%d" % n
    out, c = "", 0
    for ch in reversed(s):
        if c and c % 3 == 0:
            out = " " + out
        out = ch + out
        c += 1
    return out


def svg_floors(regions, rule):
    """One bar per region: the magnitude you have to reach before the record hears you."""
    order = sorted(regions, key=lambda r: (r["rules"][rule]["mc"] is None, r["rules"][rule]["mc"] or 0))
    w, rowh, left, top = 760, 26, 186, 34
    h = top + rowh * len(order) + 26
    lo, hi = 0.0, 5.5
    x = lambda m: left + (m - lo) / (hi - lo) * (w - left - 26)
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-labelledby="flt fld" class="fig">' % (w, h)]
    p.append('<title id="flt">The floor of hearing, by region</title>')
    p.append('<desc id="fld">A horizontal bar for each of the twelve boxes, running from magnitude zero '
             'to that box\'s magnitude of completeness: the size an earthquake has to reach before the '
             'record is reliably aware of it. The same numbers are in the table below.</desc>')
    for m in [0, 1, 2, 3, 4, 5]:
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x(m), top - 12, x(m), h - 22))
        p.append('<text x="%.1f" y="%d" class="ax" text-anchor="middle">M %d</text>' % (x(m), h - 8, m))
    for i, r in enumerate(order):
        y = top + i * rowh
        mc = r["rules"][rule]["mc"]
        p.append('<text x="%d" y="%.1f" class="lbl" text-anchor="end">%s</text>' % (left - 10, y + 12, r["name"]))
        if mc is None:
            p.append('<text x="%.1f" y="%.1f" class="val">no floor assumed</text>' % (x(0) + 4, y + 12))
            continue
        p.append('<rect x="%.1f" y="%.1f" width="%.1f" height="13" class="bar"/>' % (x(0), y + 2, max(1.0, x(mc) - x(0))))
        p.append('<text x="%.1f" y="%.1f" class="val">M %.1f</text>' % (x(mc) + 6, y + 12, mc))
    p.append('</svg>')
    return "\n".join(p)


def svg_region(r, rule, floor, mags):
    """One region: the record as a staircase, the law as a line, the shortfall filled."""
    w, h = 250, 168
    l, rt, t, bt = 34, 8, 16, 26
    lo, hi = 1.0, 7.0
    cum = r["cumulative"]
    ymax = max(1.0, math.log10(max(1, cum[0])) + 0.25)
    X = lambda m: l + (m - lo) / (hi - lo) * (w - l - rt)
    Y = lambda v: t + (1.0 - (v / ymax)) * (h - t - bt)
    p = ['<svg viewBox="0 0 %d %d" class="mini" role="img" aria-label="%s">' % (w, h, r["name"])]
    for d in range(0, int(ymax) + 1):
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="grid"/>' % (l, Y(d), w - rt, Y(d)))
        p.append('<text x="%.1f" y="%.1f" class="ax" text-anchor="end">%s</text>'
                 % (l - 4, Y(d) + 3, "1" if d == 0 else "10<tspan dy='-4' font-size='7'>%d</tspan>" % d))
    ru = r["rules"][rule]
    mc, b = ru["mc"], ru["b"]
    lookup = dict((round(m, 1), c) for m, c in zip(mags, cum))

    poly_pts, law_xy, mc_x = "", None, None
    if mc is not None and b is not None and floor < mc and lookup.get(round(mc, 1)):
        a = math.log10(lookup[round(mc, 1)]) + b * mc
        up, back = [], []
        mm = floor
        while mm <= mc + 1e-9:
            up.append("%.1f,%.1f" % (X(mm), Y(max(0.0, a - b * mm))))
            mm = round(mm + 0.1, 1)
        mm = mc
        while mm >= floor - 1e-9:
            cv = lookup.get(round(mm, 1))
            if cv:
                back.append("%.1f,%.1f" % (X(mm), Y(math.log10(cv))))
            mm = round(mm - 0.1, 1)
        if len(up) > 1 and len(back) > 1:
            poly_pts = " ".join(up + back)
        topm = min(hi, r["largest_threshold"] if r["largest_threshold"] is not None else hi)
        law_xy = (X(floor), Y(max(0.0, a - b * floor)), X(topm), Y(max(0.0, a - b * topm)))
    if mc is not None:
        mc_x = X(mc)

    # every drawn element exists in every state, so that a reader with scripting can move it
    p.append('<polygon points="%s" class="gap"/>' % poly_pts)
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="law"/>'
             % (law_xy if law_xy else (0.0, 0.0, 0.0, 0.0)))
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="mcline"/>'
             % (mc_x if mc_x is not None else -10.0, t, mc_x if mc_x is not None else -10.0, h - bt))
    pts = []
    for m, c in zip(mags, cum):
        if m < lo - 1e-9 or m > hi + 1e-9 or c <= 0:
            continue
        pts.append("%.1f,%.1f" % (X(m), Y(math.log10(c))))
    if pts:
        p.append('<polyline points="%s" class="rec"/>' % " ".join(pts))
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="floorline"/>' % (X(floor), t, X(floor), h - bt))
    for m in (1, 3, 5, 7):
        p.append('<text x="%.1f" y="%d" class="ax" text-anchor="middle">%d</text>' % (X(m), h - 8, m))
    p.append('</svg>')
    return "\n".join(p)


# ---------------------------------------------------------------- the page

def render(d):
    mags = d["thresholds"]
    regions = d["regions"]
    dflt = d["headline"]
    rule_note = dict((k, (lab, note)) for k, lab, note in RULES)

    minis = []
    for r in regions:
        cell = r["grid"][RULE_DEFAULT]["%.1f" % FLOOR_DEFAULT]
        mc = r["rules"][RULE_DEFAULT]["mc"]
        bv = r["rules"][RULE_DEFAULT]["b"]
        sbv = r["rules"][RULE_DEFAULT]["sigma_b"] or 0.0
        minis.append(
            '<figure class="cell" data-region="%s">%s<figcaption><b>%s</b>'
            '<span class="n" data-missing>%s</span> <span data-atm>unrecorded at M %.1f and above</span>'
            '<span class="s" data-sub>floor of hearing M %.1f · b = %.2f ± %.2f · %s in the record</span>'
            '%s</figcaption></figure>'
            % (r["name"], svg_region(r, RULE_DEFAULT, FLOOR_DEFAULT, mags), r["name"],
               fmt(cell["missing"]), FLOOR_DEFAULT, mc, bv, sbv, fmt(cell["observed"]),
               (('<span class="warn">few events: this box holds %s in all, and a law fitted to that '
                 'is a weak instrument</span>' % fmt(r["total"])) if r["sparse"] else "")
               + ('<span class="warn">the fitted b is outside 0.6–1.6, where catalogues normally '
                  'put it: read this box as a sign the fit is wrong, not the Earth</span>'
                  if r["rules"][RULE_DEFAULT].get("implausible_b") else "")))

    rows = []
    for r in sorted(regions, key=lambda x: -(x["grid"][RULE_DEFAULT]["%.1f" % FLOOR_DEFAULT]["missing"] or 0)):
        tds = []
        for key, _, _ in RULES:
            for f in FLOORS:
                c = r["grid"][key]["%.1f" % f]
                if c.get("unbounded"):
                    v = "∞"
                elif c.get("unavailable"):
                    v = "—"
                elif c["complete"]:
                    v = "0"
                else:
                    v = fmt(c["missing"])
                tds.append('<td%s>%s</td>' % (' class="dflt"' if key == RULE_DEFAULT and abs(f - FLOOR_DEFAULT) < 1e-9 else "", v))
        rows.append('<tr><th scope="row">%s</th><td class="obs">%s</td>%s</tr>'
                    % (r["name"], fmt(r["total"]), "".join(tds)))

    heads = []
    for key, lab, _ in RULES:
        heads.append('<th colspan="%d" class="grp">%s</th>' % (len(FLOORS), lab))
    subheads = []
    for key, _, _ in RULES:
        for f in FLOORS:
            subheads.append('<th class="msub">M %.1f</th>' % f)

    rulelist = "".join(
        '<li><b>%s.</b> %s</li>' % (lab, note) for _, lab, note in RULES)

    payload = json.dumps({
        "thresholds": mags, "floors": FLOORS, "rules": [k for k, _, _ in RULES],
        "regions": [{"name": r["name"], "cumulative": r["cumulative"], "total": r["total"],
                     "largest": r["largest_threshold"], "rules": r["rules"], "grid": r["grid"]}
                    for r in regions],
        "headline": d["headline_grid"],
    }, separators=(",", ":"))

    fills = {
        "TODAY": TODAY, "SESSION": str(SESSION),
        "HEADLINE": fmt(dflt["missing"]), "OBSERVED": fmt(dflt["observed"]),
        "WINDOW_A": d["window"]["starttime"], "WINDOW_B": d["window"]["endtime"],
        "N_REGIONS": str(len(regions)),
        "FLOOR_DEFAULT": "%.1f" % FLOOR_DEFAULT,
        "MINIS": "\n".join(minis),
        "FLOORS_SVG": svg_floors(regions, RULE_DEFAULT),
        "HEADS": "".join(heads), "SUBHEADS": "".join(subheads), "ROWS": "\n".join(rows),
        "RULELIST": rulelist,
        "FLOOR_OPTIONS": "".join('<option value="%.1f"%s>M %.1f</option>'
                                 % (f, " selected" if abs(f - FLOOR_DEFAULT) < 1e-9 else "", f) for f in FLOORS),
        "RULE_OPTIONS": "".join('<option value="%s"%s>%s</option>'
                                % (k, " selected" if k == RULE_DEFAULT else "", lab) for k, lab, _ in RULES),
        "API": d["source"]["api_version"], "REQUESTS": fmt(d["requests_made"]),
        "HARVESTED": d["harvested_utc"], "PAYLOAD": payload,
        "MC_LOW": "%.1f" % d["floor_span"]["low"], "MC_LOW_NAME": d["floor_span"]["low_name"],
        "MC_HIGH": "%.1f" % d["floor_span"]["high"], "MC_HIGH_NAME": d["floor_span"]["high_name"],
        "TOTAL_EVENTS": fmt(d["totals"]["events"]),
        "SPAN_LO": fmt(d["headline_span"]["low"]), "SPAN_HI": fmt(d["headline_span"]["high"]),
        "DEEP_NAME": d["record_floor_span"]["low_name"],
        "DEEP_M": ("%.1f" % d["record_floor_span"]["low"]).replace("-", "\u2212"),
        "DEEP_CAVEAT": d["record_floor_span"]["low_caveat"],
        "SHALLOW_NAME": d["record_floor_span"]["high_name"],
        "SHALLOW_M": ("%.1f" % d["record_floor_span"]["high"]).replace("-", "\u2212"),
        "N_COMPLETE": str(d["totals"]["complete_at_default"]),
        "N_NOTHING_BELOW_4": str(d["totals"]["nothing_below_4"]),
        "WILDEST": fmt(d["wildest"]["missing"]), "WILDEST_RULE": d["wildest"]["rule_label"],
        "WILDEST_FLOOR": "%.1f" % d["wildest"]["floor"],
        "BFLAG": d["b_flag_sentence"],
        "RULE_DEFAULT_LABEL": rule_note[RULE_DEFAULT][0],
    }
    html = PAGE
    for k, v in fills.items():
        html = html.replace("[[%s]]" % k, v)
    if "[[" in html:
        i = html.index("[[")
        die("the template still carries an unfilled slot near: " + html[i:i + 40])
    return html


PAGE = open(os.path.join(HERE, "page.template.html")).read() if os.path.exists(os.path.join(HERE, "page.template.html")) else ""


def main():
    src = os.path.join(HERE, "counts.json")
    if not os.path.exists(src):
        die("counts.json is missing; run harvest.py first (it is the only part that uses the network)")
    raw = json.load(open(src))
    mags = raw["thresholds"]
    regions = [measure(r, mags) for r in raw["regions"]]

    grid_totals = {}
    for key, _, _ in RULES:
        grid_totals[key] = {}
        for f in FLOORS:
            cells = [r["grid"][key]["%.1f" % f] for r in regions]
            if key == "none":
                grid_totals[key]["%.1f" % f] = {"missing": None, "unbounded": True,
                                                "observed": sum(c["observed"] for c in cells)}
            else:
                grid_totals[key]["%.1f" % f] = {
                    "missing": sum(c["missing"] or 0 for c in cells),
                    "observed": sum(c["observed"] for c in cells),
                    "unbounded": False}

    headline = grid_totals[RULE_DEFAULT]["%.1f" % FLOOR_DEFAULT]
    finite = [v["missing"] for k, row in grid_totals.items() if k != "none"
              for v in [row["%.1f" % FLOOR_DEFAULT]] if v["missing"] is not None]

    mcs = [(r["rules"][RULE_DEFAULT]["mc"], r["name"]) for r in regions
           if r["rules"][RULE_DEFAULT]["mc"] is not None]
    mcs.sort()

    rf = sorted((r["record_floor"], r["name"]) for r in regions)
    rf_censored = any(r["record_floor_censored"] for r in regions
                      if r["name"] == rf[0][1])

    wildest = {"missing": -1, "rule_label": "", "floor": 0.0}
    for key, lab, _ in RULES:
        for f in FLOORS:
            v = grid_totals[key]["%.1f" % f]["missing"]
            if v is not None and v > wildest["missing"]:
                wildest = {"missing": v, "rule_label": lab, "floor": f}

    flagged = [r["name"] for r in regions if r["rules"][RULE_DEFAULT].get("implausible_b")]
    if not flagged:
        b_flag = ("Under the setting this page opens at, every box's fitted b falls inside the band "
                  "0.6 to 1.6, where catalogues normally put it.")
    else:
        b_flag = ("Under the setting this page opens at, %d of the %d boxes — %s — return a b outside "
                  "the band 0.6 to 1.6 where catalogues normally put it. Their shortfall is printed "
                  "like the others and should be read as a sign that the fit is wrong rather than "
                  "that the Earth is unusual there." % (len(flagged), len(regions), ", ".join(flagged)))

    data = {
        "work": "BELOW HEARING",
        "practice": "The Studio (Ensemble)",
        "date": TODAY,
        "session": SESSION,
        "cycle": 3,
        "question": "Missing Data Art",
        "source": raw["source"],
        "window": raw["source"]["window"],
        "harvested_utc": raw["harvested_utc"],
        "requests_made": raw["requests_made"],
        "thresholds": mags,
        "floors": FLOORS,
        "floor_default": FLOOR_DEFAULT,
        "rules": [{"key": k, "label": l, "note": n} for k, l, n in RULES],
        "rule_default": RULE_DEFAULT,
        "regions": regions,
        "grid_totals": grid_totals,
        "headline": headline,
        "headline_grid": grid_totals,
        "headline_span": {"low": min(finite), "high": max(finite)},
        "floor_span": {"low": mcs[0][0], "low_name": mcs[0][1],
                       "high": mcs[-1][0], "high_name": mcs[-1][1]},
        "totals": {"events": sum(r["total"] for r in regions),
                   "regions": len(regions),
                   "complete_at_default": sum(
                       1 for r in regions
                       if r["grid"][RULE_DEFAULT]["%.1f" % FLOOR_DEFAULT]["complete"]),
                   "nothing_below_4": sum(
                       1 for r in regions
                       if cum_at(mags, r["cumulative"], 4.0) == r["total"])},
        "record_floor_span": {"low": rf[0][0], "low_name": rf[0][1],
                              "low_caveat": (" — and this work asked no lower"
                                             if rf_censored else ""),
                              "high": rf[-1][0], "high_name": rf[-1][1]},
        "wildest": wildest,
        "b_flag_sentence": b_flag,
    }

    html = render(data)
    js = json.dumps(data, indent=1) + "\n"

    if "--check" in sys.argv:
        bad = []
        for path, want in (("data.json", js), ("index.html", html)):
            p = os.path.join(HERE, path)
            have = open(p).read() if os.path.exists(p) else None
            if have != want:
                bad.append(path)
        if bad:
            die("differs from the committed build: " + ", ".join(bad))
        print("build.py --check: data.json and index.html are byte-identical to a fresh build")
        return

    open(os.path.join(HERE, "data.json"), "w").write(js)
    open(os.path.join(HERE, "index.html"), "w").write(html)
    print("BELOW HEARING — %d regions, %s events in the record, %s unrecorded at M %.1f (%s)"
          % (len(regions), fmt(data["totals"]["events"]), fmt(headline["missing"]),
             FLOOR_DEFAULT, RULE_DEFAULT))
    print("  floor of hearing: M %.1f (%s) to M %.1f (%s)"
          % (data["floor_span"]["low"], data["floor_span"]["low_name"],
             data["floor_span"]["high"], data["floor_span"]["high_name"]))
    print("  across the five rules that assume the law: %s to %s"
          % (fmt(data["headline_span"]["low"]), fmt(data["headline_span"]["high"])))


if __name__ == "__main__":
    main()
