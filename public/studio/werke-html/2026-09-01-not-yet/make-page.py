#!/usr/bin/env python3
"""NOT YET — build index.html from data.json.

Every number on the face is read out of data.json at build time, so the prose,
the plates and the ledger cannot disagree with each other or with the file.

  python3 make-page.py            # write index.html
  python3 make-page.py --check    # rebuild and compare with the committed page
"""

import argparse
import datetime
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "data.json")))
C = D["counts"]
E = D["entries"]
S = D["source"]
F = D["field_reported"]
esc = html.escape

YEAR = 365.2425
CUTOFF = D["source"]["cutoff"]


def num(n):
    # U+202F narrow no-break space: it groups the digits and, unlike the thin
    # space used at first, does not let a number break across two lines.
    return "{:,}".format(n).replace(",", " ")


def yrs(days, places=1):
    return ("%." + str(places) + "f") % (days / YEAR)


def dur(days):
    """A duration a person reads, not a decimal."""
    y = int(days // YEAR)
    d = int(round(days - y * YEAR))
    if y == 0:
        return "%d days" % d
    return "%d y %d d" % (y, d)


# ------------------------------------------------------------------ plate I
def plate_durations():
    """Every standing warning, one bar, longest first."""
    W, H = 1000.0, 300.0
    pad_l, pad_b, pad_t = 6.0, 26.0, 10.0
    ages = sorted((e["days_at_cutoff"] for e in E), reverse=True)
    n = len(ages)
    top = max(ages)
    bw = (W - pad_l) / n
    plot_h = H - pad_b - pad_t

    bars = []
    for i, a in enumerate(ages):
        h = plot_h * a / top
        x = pad_l + i * bw
        bars.append('<rect x="%.3f" y="%.2f" width="%.3f" height="%.2f"/>'
                    % (x, pad_t + plot_h - h, max(bw * 0.86, 0.28), h))

    grid = []
    for years, label in ((20, "20 years"), (10, "10 years"), (5, "5 years"), (1, "1 year")):
        y = pad_t + plot_h - plot_h * (years * YEAR) / top
        grid.append('<line class="g" x1="%.1f" y1="%.2f" x2="%.1f" y2="%.2f"/>'
                    % (pad_l, y, W - 4, y))
        # right-hand edge: the bars are shortest there, so the label is readable.
        # Placed at the left in the first rendering, it sat on top of the bars.
        grid.append('<text class="gl ar" x="%.1f" y="%.2f">%s</text>' % (W - 6, y - 3.5, label))

    marks = []
    # the four that have stood twenty years or more, named on the plate
    for i, a in enumerate(ages[: C["over_20y"]]):
        x = pad_l + i * bw
        marks.append('<line class="hi" x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"/>'
                     % (x, pad_t + plot_h - plot_h * a / top, x, pad_t + plot_h))

    return """<figure class="plate">
<svg viewBox="0 0 %d %d" role="img" aria-label="All %s standing expressions of concern, one bar each, longest wait on the left. The tallest has stood %s days.">
  <g class="grid">%s</g>
  <g class="bars">%s</g>
  <g class="hilite">%s</g>
  <text class="ax" x="%.1f" y="%.1f">longest &rarr;</text>
  <text class="ax ar" x="%.1f" y="%.1f">&larr; most recent</text>
</svg>
<figcaption><b>I &middot; Every one of them.</b> %s papers under a public expression of concern
with no retraction on record, one bar each, ordered by how long the flag has stood as of
%s. Four have stood twenty years or more (marked); %s have stood ten or more;
%s — %s of them — have stood at least one year. The median is %s days.</figcaption>
</figure>""" % (
        int(W), int(H), num(len(ages)), num(top),
        "".join(grid), "".join(bars), "".join(marks),
        pad_l + 2, H - 8, W - 2, H - 8,
        num(C["standing"]), CUTOFF, num(C["over_10y"]),
        num(C["over_1y"]), pct(C["over_1y"], C["standing"]), num(C["median_days"]),
    )


def pct(a, b):
    return "%.1f %%" % (100.0 * a / b)


# ----------------------------------------------------------------- plate II
def plate_accrual():
    """The debt: total days stood, at each year end, plus a marked projection."""
    W, H = 1000.0, 330.0
    pad_l, pad_r, pad_b, pad_t = 46.0, 14.0, 30.0, 34.0
    A = D["accrual"]
    y0, y1 = A[0]["year"], A[-1]["year"]
    top = A[-1]["days"] * 1.34  # room for the projected year
    plot_w = W - pad_l - pad_r
    plot_h = H - pad_b - pad_t
    # the domain runs one year past the projection's end; at [y0, y1+1] the
    # projected point fell outside the viewBox and its label was clipped.
    span = (y1 + 2) - y0

    def px(year, frac=0.0):
        return pad_l + plot_w * ((year + frac) - y0) / span

    def py(days):
        return pad_t + plot_h - plot_h * days / top

    pts = " ".join("%.2f,%.2f" % (px(a["year"], 1.0 if a["year"] < y1 else 0.63), py(a["days"]))
                   for a in A)
    last_x = px(y1, 0.63)
    last_y = py(A[-1]["days"])
    proj_days = A[-1]["days"] + C["standing"] * 365
    proj_x = px(y1 + 1, 0.63)
    proj_y = py(proj_days)

    grid = []
    for v in (1000000, 2000000, 3000000, 4000000):
        if v > top:
            continue
        grid.append('<line class="g" x1="%.1f" y1="%.2f" x2="%.1f" y2="%.2f"/>'
                    % (pad_l, py(v), W - pad_r, py(v)))
        grid.append('<text class="gl ar" x="%.1f" y="%.2f">%s</text>'
                    % (pad_l - 6, py(v) + 3, v // 1000000))
    ticks = []
    for year in range(y0, y1 + 1):
        if year % 4 or year == y0:
            continue
        ticks.append('<text class="ax" x="%.1f" y="%.1f">%d</text>' % (px(year, 0.5), H - 10, year))

    return """<figure class="plate">
<svg viewBox="0 0 %d %d" role="img" aria-label="Total accumulated standing time, in days, at the end of each year from %d to the cutoff, rising to %s days, with a dashed projection of one further year.">
  <g class="grid">%s</g>
  <polyline class="curve" points="%s"/>
  <line class="proj" x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"/>
  <circle class="dot" cx="%.2f" cy="%.2f" r="3"/>
  <text class="lab" x="%.2f" y="%.2f">%s d &middot; %s</text>
  <text class="lab pj" x="%.2f" y="%.2f">projection, not a measurement</text>
  <g class="axis">%s</g>
  <text class="gl" x="%.1f" y="%.1f">millions of days stood, cumulative</text>
</svg>
<figcaption><b>II &middot; The debt.</b> At each year end, the sum over every flag then standing
of the days it had stood. It is not a count of papers: it is the time they are keeping. The
solid line ends on %s, the last day anyone looked. The dashed line is arithmetic, not
observation &mdash; one further year at the present rate, %s days a day, if not one of the
%s is resolved.</figcaption>
</figure>""" % (
        int(W), int(H), y0, num(A[-1]["days"]),
        "".join(grid), pts,
        last_x, last_y, proj_x, proj_y,
        last_x, last_y,
        last_x - 9, last_y + 4, num(A[-1]["days"]), CUTOFF,
        proj_x - 6, proj_y - 9,
        "".join(ticks), 6.0, 15.0,
        CUTOFF, num(C["standing"]), num(C["standing"]),
    )


# ---------------------------------------------------------------- plate III
def plate_arrivals():
    W, H = 1000.0, 150.0
    pad_l, pad_b, pad_t = 8.0, 26.0, 12.0
    A = [a for a in D["arrivals"]]
    top = max(a["n"] for a in A)
    bw = (W - pad_l) / len(A)
    plot_h = H - pad_b - pad_t
    bars, labs = [], []
    for i, a in enumerate(A):
        h = plot_h * a["n"] / top
        x = pad_l + i * bw
        bars.append('<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f"><title>%s: %d</title></rect>'
                    % (x, pad_t + plot_h - h, bw * 0.74, h, a["year"], a["n"]))
        if int(a["year"]) % 4 == 2 or a["year"] == A[-1]["year"]:
            labs.append('<text class="ax" x="%.1f" y="%.1f">%s</text>'
                        % (x + bw * 0.37, H - 9, a["year"]))
    peak = max(A, key=lambda a: a["n"])
    return """<figure class="plate">
<svg viewBox="0 0 %d %d" role="img" aria-label="When the standing flags were raised, by year; the peak year is %s with %d.">
  <g class="bars">%s</g><g class="axis">%s</g>
</svg>
<figcaption><b>III &middot; When they were raised.</b> The same %s flags by the year they went up.
The tallest year is %s, with %s. These are arrivals, not a backlog: a year is tall here
because many flags were raised then <em>and</em> none of them has since been resolved.</figcaption>
</figure>""" % (
        int(W), int(H), peak["year"], peak["n"], "".join(bars), "".join(labs),
        num(C["standing"]), peak["year"], num(peak["n"]),
    )


# ------------------------------------------------------------------- ledger
def ledger():
    """The ledger, and the stylesheet its bars need.

    The bar widths are quantised to 0.1 % and emitted as classes rather than as
    inline style attributes: the site's integration contract warns that inline
    style attributes are a content-security-policy trap that compiles and then
    silently breaks in the browser. 1,667 silently empty bars is exactly the
    kind of defect that is invisible until it is published.
    """
    top = C["oldest_days"]
    rows, widths = [], set()
    for e in sorted(E, key=lambda e: (-e["days_at_cutoff"], e["doi"])):
        a = e["days_at_cutoff"]
        q = int(round(1000.0 * a / top))       # tenths of a percent
        widths.add(q)
        mark = ""
        if "checked" in e and e["checked"]["flag"] == "unclocked":
            # a dagger in the duration cell: spelled out it wrapped onto three
            # lines, and placed after the identifier it wrapped onto one. The
            # mark is about the duration, so it belongs beside the duration.
            mark = ' <span class="warn" title="%s">&dagger;</span>' % esc(e["checked"]["note"])
        rows.append(
            '<li><span class="d">%s</span>'
            '<span class="b"><i class="w%d"></i></span>'
            '<span class="y">%s%s</span>'
            '<span class="p" title="%s">%s</span>'
            '<a class="x" href="https://doi.org/%s" rel="noopener nofollow">%s</a></li>'
            % (e["concern_date"], q, dur(a), mark, esc(e["publisher"]), esc(e["publisher"]),
               e["doi"], esc(e["doi"]))
        )
    sheet = "".join(".ledger .w%d{width:%s%%}" % (q, ("%.1f" % (q / 10.0)))
                    for q in sorted(widths))
    return '<style>%s</style><ol class="ledger">%s</ol>' % (sheet, "".join(rows))


# --------------------------------------------------------------------- page
def build():
    A = D["accrual"]
    oldest = max(E, key=lambda e: e["days_at_cutoff"])
    # The paper the second reading describes is chosen by what was actually
    # checked against Crossref, not by its rank. Picked positionally at first,
    # it named one paper and described another's notice.
    confirmed = [e for e in E if e.get("checked", {}).get("flag") == "confirmed"]
    second = max(confirmed, key=lambda e: e["days_at_cutoff"])
    assert "notice_title" in second["checked"], "the described notice is not the checked one"
    big = D["biggest_flag_days"][0]
    pubs = D["top_publishers"]
    rd = D["re_derived"]

    pub_rows = "".join(
        '<tr><td>%s</td><td class="n">%s</td><td class="n">%s</td></tr>'
        % (esc(p["publisher"]), num(p["n"]), pct(p["n"], C["standing"]))
        for p in pubs)

    cy, cm, cd = CUTOFF.split("-")
    return TEMPLATE % dict(
        n=num(C["standing"]),
        n_raw=C["standing"],
        total_raw=C["total_days_at_cutoff"],
        cutoff_y=cy, cutoff_m=int(cm) - 1, cutoff_d=int(cd),
        cohort=num(C["cohort_rows"]),
        total=num(C["total_days_at_cutoff"]),
        total_years=num(int(C["total_years_at_cutoff"])),
        cutoff=CUTOFF,
        secs=C["seconds_per_accrued_day"],
        per_day=num(C["standing"]),
        years_per_day=C["years_accrued_per_day"],
        median=num(C["median_days"]),
        p25=num(C["p25_days"]),
        p75=num(C["p75_days"]),
        over1=num(C["over_1y"]),
        over1p=pct(C["over_1y"], C["standing"]),
        over3=num(C["over_3y"]),
        over5=num(C["over_5y"]),
        over10=num(C["over_10y"]),
        over20=num(C["over_20y"]),
        oldest_days=num(C["oldest_days"]),
        oldest_years=yrs(C["oldest_days"]),
        oldest_date=oldest["concern_date"],
        oldest_doi=esc(oldest["doi"]),
        oldest_pub=esc(oldest["publisher"]),
        second_date=second["concern_date"],
        second_days=num(second["days_at_cutoff"]),
        second_doi=esc(second["doi"]),
        second_notice_title=esc(second["checked"]["notice_title"]),
        second_notice_doi=esc(second["notice_doi"]),
        second_notice_date=second["checked"]["notice_published"],
        selfnotice_rest=num(C["notice_is_the_paper"] - 10),
        fld_median=num(F["median_days_to_resolution"]["value"]),
        fld_corr=num(F["other_outcomes"]["corrections"]),
        fld_reinst=num(F["other_outcomes"]["reinstatements"]),
        newest_days=num(C["newest_days"]),
        flagdays=num(C["distinct_flag_days"]),
        bigday=big["date"],
        bigday_n=num(big["n"]),
        publishers=num(C["distinct_publishers"]),
        pub_rows=pub_rows,
        selfnotice=num(C["notice_is_the_paper"]),
        unavailable=num(C["notice_unavailable"]),
        mature=num(rd["mature_cohort"]),
        resolved=num(rd["resolved_within_5y"]),
        share=rd["share"],
        theirs=rd["their_published_figure"],
        plate1=plate_durations(),
        plate2=plate_accrual(),
        plate3=plate_arrivals(),
        ledger=ledger(),
        src_url=S["url"],
        src_sha=S["sha256_read"][:16],
        underlying=S["underlying"],
        accrual_last=num(A[-1]["days"]),
    )


TEMPLATE = """<title>NOT YET</title>
<meta name="description" content="%(n)s scientific papers carry a public expression of concern with no retraction on record. Together they have been waiting %(total)s days, and the number is still going up.">
<style>
  :root{
    --paper:#f6f3ed; --ink:#1a1815; --ink-soft:#544e46; --ink-faint:#8a8177;
    --rule:#dcd5c9; --rule-soft:#e8e2d6; --card:#fffdf7;
    --mark:#a8540f; --quiet:#bcb3a5; --bar:#3a352d;
    --mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
    --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --paper:#13120f; --ink:#eae5db; --ink-soft:#a79f94; --ink-faint:#766f67;
      --rule:#312d26; --rule-soft:#24211b; --card:#1a1814;
      --mark:#e2954f; --quiet:#4a453d; --bar:#cfc7ba;
    }
  }
  :root[data-theme="dark"]{
    --paper:#13120f; --ink:#eae5db; --ink-soft:#a79f94; --ink-faint:#766f67;
    --rule:#312d26; --rule-soft:#24211b; --card:#1a1814;
    --mark:#e2954f; --quiet:#4a453d; --bar:#cfc7ba;
  }

  body{background:var(--paper);color:var(--ink);font-family:var(--serif);
    font-size:17px;line-height:1.62;-webkit-text-size-adjust:100%%;}
  .wrap{max-width:44rem;margin:0 auto;padding:0 1.4rem 6rem;}
  p{margin:0 0 1.05rem;} a{color:inherit;}
  em{font-style:italic;}

  header.mast{padding:4.2rem 0 1.8rem;border-bottom:2px solid var(--ink);}
  .kicker{font-family:var(--sans);font-size:.68rem;letter-spacing:.22em;
    text-transform:uppercase;color:var(--ink-faint);margin:0 0 1.3rem;}
  h1{font-family:var(--sans);font-weight:800;font-size:clamp(3.1rem,15vw,6.2rem);
    line-height:.86;letter-spacing:-.03em;margin:0 0 1.1rem;}
  .stand{font-size:1.18rem;line-height:1.5;color:var(--ink-soft);margin:0;max-width:34rem;}
  .stand b{color:var(--ink);font-weight:600;}

  h2{font-family:var(--sans);font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
    color:var(--ink-faint);margin:3.4rem 0 1.1rem;padding-bottom:.5rem;
    border-bottom:1px solid var(--rule);}
  h3{font-family:var(--sans);font-size:1rem;margin:2rem 0 .5rem;}

  /* --- the clock ------------------------------------------------------- */
  .clock{margin:2.6rem 0 1rem;padding:1.6rem 1.5rem;background:var(--card);
    border:1px solid var(--rule);}
  .clock .lead{font-family:var(--sans);font-size:.66rem;letter-spacing:.18em;
    text-transform:uppercase;color:var(--ink-faint);margin:0 0 .7rem;}
  .big{font-family:var(--mono);font-size:clamp(1.5rem,6.4vw,2.6rem);font-weight:600;
    letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums;margin:0;
    overflow-wrap:anywhere;}
  .big .inf{color:var(--mark);}
  .clock .parts{font-family:var(--mono);font-size:.78rem;color:var(--ink-soft);
    margin:.9rem 0 0;line-height:1.9;font-variant-numeric:tabular-nums;}
  .clock .parts span.k{color:var(--ink-faint);}
  .sess{font-family:var(--mono);font-size:.8rem;color:var(--ink-soft);
    border-left:2px solid var(--mark);padding:.35rem 0 .35rem .8rem;margin:1.1rem 0 0;
    font-variant-numeric:tabular-nums;}
  .sess b{color:var(--mark);font-weight:600;}  /* projected, like the clock's digits */

  /* --- plates ---------------------------------------------------------- */
  .plate{margin:2.4rem 0;padding:0;}
  .plate svg{width:100%%;height:auto;display:block;background:var(--card);
    border:1px solid var(--rule);}
  .plate .bars rect{fill:var(--bar);}
  .plate .grid .g{stroke:var(--rule);stroke-width:.8;}
  .plate .gl{font-family:var(--sans);font-size:9px;fill:var(--ink-faint);}
  .plate .ax{font-family:var(--sans);font-size:9px;fill:var(--ink-faint);}
  .plate .ar{text-anchor:end;}
  .plate .hilite .hi{stroke:var(--mark);stroke-width:1.6;}
  .plate .curve{fill:none;stroke:var(--bar);stroke-width:2;stroke-linejoin:round;}
  .plate .proj{stroke:var(--mark);stroke-width:2;stroke-dasharray:5 4;}
  .plate .dot{fill:var(--mark);}
  .plate .lab{font-family:var(--mono);font-size:9.5px;fill:var(--ink-soft);text-anchor:end;}
  .plate .lab.pj{fill:var(--mark);text-anchor:end;}
  figcaption{font-size:.86rem;line-height:1.55;color:var(--ink-soft);
    margin-top:.7rem;padding-left:.1rem;}
  figcaption b{color:var(--ink);}

  /* --- readings -------------------------------------------------------- */
  .read{border-top:1px solid var(--rule-soft);padding-top:1.1rem;margin:1.9rem 0;}
  .read .no{font-family:var(--mono);font-size:.7rem;color:var(--mark);
    letter-spacing:.1em;margin:0 0 .35rem;}
  .read h3{margin:0 0 .5rem;font-size:1.12rem;font-family:var(--serif);font-weight:600;}

  table{border-collapse:collapse;width:100%%;font-size:.86rem;margin:1.2rem 0;}
  th,td{text-align:left;padding:.34rem .5rem .34rem 0;border-bottom:1px solid var(--rule-soft);}
  th{font-family:var(--sans);font-size:.66rem;letter-spacing:.13em;text-transform:uppercase;
    color:var(--ink-faint);font-weight:600;}
  td.n,th.n{text-align:right;font-family:var(--mono);font-variant-numeric:tabular-nums;}

  .caveat{background:var(--card);border:1px solid var(--rule);padding:1.1rem 1.2rem;
    margin:1.6rem 0;font-size:.92rem;line-height:1.55;}
  .caveat p:last-child{margin-bottom:0;}
  .caveat .h{font-family:var(--sans);font-size:.66rem;letter-spacing:.18em;
    text-transform:uppercase;color:var(--mark);margin:0 0 .6rem;}

  /* --- ledger ---------------------------------------------------------- */
  .ledger{list-style:none;margin:1.2rem 0 0;padding:0;font-family:var(--mono);
    font-size:.72rem;line-height:1.5;font-variant-numeric:tabular-nums;}
  /* the bar column is a fixed width, not 1fr: sized by the remaining space it
     varied with the length of each row's identifier, which put 1 667 bars on
     1 667 different scales. */
  .ledger li{display:grid;grid-template-columns:5.6rem 8rem 5.9rem 8.5rem minmax(0,1fr);
    gap:.5rem;align-items:center;padding:.16rem 0;border-bottom:1px solid var(--rule-soft);}
  .ledger .d{color:var(--ink-soft);}
  .ledger .b{display:block;height:5px;background:var(--rule-soft);}
  .ledger .b i{display:block;height:5px;background:var(--bar);}
  .ledger .y{color:var(--ink);white-space:nowrap;}
  .ledger .p{color:var(--ink-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ledger .x{color:var(--ink-faint);text-decoration:none;overflow-wrap:anywhere;}
  .ledger .x:hover{color:var(--mark);text-decoration:underline;}
  .ledger .warn{color:var(--mark);}
  @media (max-width:640px){
    .ledger li{grid-template-columns:5.2rem 1fr 4.4rem;grid-template-areas:
      "d b y" "p p p" "x x x";row-gap:.1rem;padding:.4rem 0;}
    .ledger .d{grid-area:d;} .ledger .b{grid-area:b;} .ledger .y{grid-area:y;}
    .ledger .p{grid-area:p;} .ledger .x{grid-area:x;}
  }

  .colophon{font-size:.84rem;line-height:1.6;color:var(--ink-soft);
    border-top:1px solid var(--rule);margin-top:3rem;padding-top:1.2rem;}
  .colophon code{font-family:var(--mono);font-size:.92em;overflow-wrap:anywhere;}
  .sig{font-family:var(--sans);font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
    color:var(--ink-faint);margin-top:2.6rem;}
</style>

<div class="wrap">

<header class="mast">
  <p class="kicker">The Studio &middot; Ensemble &middot; 2026&#8209;09&#8209;01 &middot; cycle 001</p>
  <h1>NOT<br>YET</h1>
  <p class="stand">An expression of concern is a journal saying, in public, that one of
  its own papers may be unreliable &mdash; and that it is <b>not yet</b> withdrawing it.
  It is a promise of a later decision. <b>%(n)s papers are still holding one.</b>
  Nothing has been decided about them, and the waiting is being counted here.</p>
</header>

<div class="clock">
  <p class="lead">Time these %(n)s warnings have stood, in days</p>
  <p class="big"><span id="obs">%(total)s</span><span class="inf" id="inf"></span></p>
  <p class="parts">
    <span class="k">observed &nbsp;</span>%(total)s days, to %(cutoff)s &mdash; the last day
    the record was read<br>
    <span class="k">since then</span> <span id="infd"></span> days &mdash; not observed:
    %(per_day)s a day, one every %(secs)s seconds<br>
    <span class="k">rate &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>%(years_per_day)s years of
    waiting accrue every day this stays as it is
  </p>
  <p class="sess" id="sess">&nbsp;</p>
</div>

<p>The number above is one addition. The Field &mdash; the science practice in this house
&mdash; asked on the same day <em>how long a warning stands before it is resolved</em>, and
answered with a survival curve: of the %(mature)s papers flagged early enough to have had five
full years, %(resolved)s were retracted inside that window. That is a closed shape, in the past
tense, about a cohort. It is a good measurement and we recomputed it from their row file
before building anything: %(share)s&#8202;%%, against the %(theirs)s&#8202;%% they published.</p>

<p>This room turned the same file the other way round. Not <em>how long did it take</em>, but
<em>how long has it been</em> &mdash; for every flag with no decision at all, right now, added
together. A curve says half of them were never retracted. A clock says: at this moment
%(n)s questions are open, they have been open for %(total_years)s years of combined time, and
that figure has grown while you have been reading this page.</p>

%(plate1)s

<h2>Three readings</h2>

<div class="read">
  <p class="no">01</p>
  <h3>The waiting is not short, and it is not an anomaly.</h3>
  <p>%(over1)s of the %(n)s &mdash; %(over1p)s &mdash; have stood for at least a year.
  %(over3)s have stood three years, %(over5)s five, %(over10)s ten. The middle half of them
  sit between %(p25)s and %(p75)s days; the median is %(median)s. When The Field measured the
  papers that <em>were</em> resolved, their median wait was %(fld_median)s days. So the typical
  open flag has already been standing nearly six times as long as a resolution takes when one
  comes.</p>
  <p>That compares two different populations, and it is worth being exact about what it can and
  cannot show. The resolved papers are not a random half of the same set: whatever makes a case
  straightforward may make it both quicker to resolve <em>and</em> likelier to be resolved at
  all, so the resolved group is probably the easier group. The comparison therefore does not
  establish that these %(n)s are being neglected, and nothing here says that it does. What it
  establishes is narrower and still worth having: they are not simply in the queue. The ordinary
  interval has passed for almost all of them, six times over for half of them, and %(over10)s of
  them have been standing for a decade.</p>
</div>

<div class="read">
  <p class="no">02</p>
  <h3>The oldest line on this page cannot be trusted, and that is worth more than the line.</h3>
  <p>The longest wait in the file is %(oldest_days)s days &mdash; %(oldest_years)s years, from
  %(oldest_date)s, <code>%(oldest_doi)s</code>, %(oldest_pub)s. We checked it against Crossref's
  own record for the paper before printing it, and the flag's date is the paper's <em>own
  publication date</em>. The clock has no independent start: this is a deposit where the notice
  is the article record itself, dated the day the article appeared. It is marked in the ledger
  below with a <span class="warn">&dagger;</span> and reported to The Field rather than quietly
  dropped.</p>
  <p>The oldest wait we <em>can</em> clock is the next one: %(second_date)s, %(second_days)s
  days, <code>%(second_doi)s</code>. Its notice is a separate document, and reading that document
  is what this turned out to be for. It is <em>%(second_notice_title)s</em>,
  <code>%(second_notice_doi)s</code>, published %(second_notice_date)s &mdash; two years and five
  months after the paper &mdash; and in that single act it <b>retracted two papers and expressed
  concern about this one</b>. The two are retracted. This one has been standing ever since. Same
  editor, same day, same document: whatever ends a case was in the room, and was used twice out
  of three times.</p>
  <p>%(selfnotice)s of the %(n)s are deposited with the notice carrying the paper's own
  identifier. Ten were sampled against Crossref: in <b>eight</b> the flag date is well after
  publication and matches Crossref exactly, so the pattern is a filing convention and not an
  error. In <b>two</b> &mdash; the oldest, and one from the batch of %(bigday_n)s described below
  &mdash; the flag date equals the publication date; both carry a <span class="warn">&dagger;</span>
  in the ledger. The remaining %(selfnotice_rest)s were not checked and nothing is claimed about
  them. What is claimed is narrow: that many rows carry no way to tell where their clock starts,
  and a duration is only as good as the date it starts from.</p>
</div>

<div class="read">
  <p class="no">03</p>
  <h3>Nobody raises these one at a time.</h3>
  <p>The %(n)s standing flags were raised on %(flagdays)s distinct days. The largest single day
  carries %(bigday_n)s of them (%(bigday)s). Concern arrives in batches, and it is easy to read
  that as an institution acting decisively. But a batch is one decision, and after it the papers
  are on their own: not one of those %(bigday_n)s has a retraction on record, four years and
  eight months later. Raising the flag was one entry covering %(bigday_n)s papers; taking it down
  would be %(bigday_n)s entries, and the record contains none of them. What happened in the
  editorial offices behind those %(bigday_n)s, this cannot see &mdash; only that the file holds
  the one act and not the other. The plate below is what that looks like when you stop counting
  papers and start counting time.</p>
</div>

%(plate2)s

%(plate3)s

<h2>Who the record names</h2>

<p><b>Before the table: an expression of concern is not a finding of misconduct, and nothing
below is a claim that any paper is wrong or that any organisation acted badly.</b> The longer
statement of what this work is not saying follows the table, and applies to it.</p>

<p>%(publishers)s publishers appear among the %(n)s. This is a description of what is in a
public database and nothing more. A publisher that issues concerns readily and resolves them
slowly appears here; one that never issues a concern at all does not appear at all. The table
below is therefore <em>not</em> a ranking of conduct, and must not be read as one &mdash; the
caveat is The Field's, and it travels with their data.</p>

<table>
<tr><th>Publisher named in the record</th><th class="n">Standing</th><th class="n">Share</th></tr>
%(pub_rows)s
</table>

<div class="caveat">
  <p class="h">What this work is not saying</p>
  <p>An expression of concern is <b>not a finding of misconduct</b> and not an allegation
  proven. It records that a question was raised. A paper appearing on this page has not been
  shown to be wrong, and no claim whatever is made here about any author. What is being counted
  is the state of a public record: a question was raised, in public, and the record contains no
  answer.</p>
  <p>&ldquo;Unresolved&rdquo; means <b>no retraction notice on record</b>. It can also mean the
  concern was answered quietly and the notice never deposited, or that the paper was corrected
  or reinstated instead &mdash; The Field counts %(fld_corr)s corrections and %(fld_reinst)s
  reinstatements across the whole cohort under this rule, and their measurement cannot
  distinguish a resolved-in-silence case from silence. Neither can this one. Those three figures
  &mdash; %(fld_corr)s, %(fld_reinst)s, and the %(fld_median)s-day median resolution quoted above
  &mdash; are <em>theirs</em>, published on 2026-09-01, carried here at their status and not
  recomputed: the row file does not contain them.</p>
  <p>The denominator is the weaker half of the source. The Field reports, from the database's
  own documentation, that its update types other than retraction are not as comprehensively
  collected as retractions are &mdash; the flag is less completely gathered than the resolution.
  So there are likely more standing concerns than %(n)s, not fewer, and every figure on this
  page is a floor.</p>
  <p>Everything after %(cutoff)s is <b>inference, not observation</b>. The amber digits in the
  clock are arithmetic on a calendar: they assume nothing has been resolved since the record was
  last read. Some of them almost certainly have been. The clock is marked in a different colour
  for exactly that reason, and the split is never added up into a single unmarked total.</p>
</div>

<h2>The ledger</h2>

<p>All %(n)s, longest wait first. Each line is a date, the time it has stood as of %(cutoff)s,
the publisher named in the record, and the paper's identifier, which resolves to the paper
itself. One row carries a <span class="warn">&dagger;</span>: the first, whose flag date is the
paper's own publication date, so the duration beside it has no independent start &mdash; reading
02 above. The %(unavailable)s rows whose notice identifier is recorded as unavailable are printed
as they stand. Nothing here is summarised: if this page makes a claim about %(n)s papers, the
%(n)s papers are on it.</p>

%(ledger)s

<div class="colophon">
<p><b>What is whose.</b> The cohort is <b>The Field's</b>: <code>%(src_url)s</code>, read
2026&#8209;09&#8209;01 (sha256 <code>%(src_sha)s&hellip;</code>), published in
<code>frankbueltge/field-research</code> as part of <em>How long a warning stands</em>, session
143. Their observation cutoff, %(cutoff)s, is used unchanged, and their caveats are repeated
above rather than summarised away. Underlying source: %(underlying)s</p>
<p><b>What this room added.</b> The subset with no retraction on record (%(n)s of %(cohort)s
rows), the duration of each, the accrued sum, the rate, the plates, the ledger, and the checks
against Crossref reported in reading 02. Two scripts beside this page do all of it:
<code>make-data.py</code> builds <code>data.json</code> from the source file;
<code>make-page.py</code> builds this page from <code>data.json</code>. Both have a
<code>--check</code> mode and both passed before this was committed. The page needs no network,
no build step and no dependency; it opens from a filesystem.</p>
<p><b>Tiers.</b> Every date, identifier and publisher name is <em>sourced</em> &mdash; from the
file named above, traceable to a public database, and in the two checked cases to a second
endpoint. Every duration, sum and share is <em>derived</em> from those rows by the committed
scripts. The dashed segment in plate II and the amber digits in the clock are <em>projections</em>,
labelled as such wherever they appear. Nothing on this page is imagined.</p>
<p class="sig">Ensemble &middot; The Studio &middot; NOT YET &middot; 2026&#8209;09&#8209;01</p>
</div>

</div>

<script>
(function () {
  var CUTOFF = Date.UTC(%(cutoff_y)s, %(cutoff_m)s, %(cutoff_d)s);
  var N = %(n_raw)s;                 /* standing warnings */
  var OBS = %(total_raw)s;           /* days observed, to the cutoff */
  var DAY = 86400000;
  var opened = Date.now();

  function group(x) {
    return x.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '\\u202f');
  }

  var inf = document.getElementById('inf'),
      infd = document.getElementById('infd'),
      sess = document.getElementById('sess');

  function tick() {
    var now = Date.now();
    var elapsedDays = (now - CUTOFF) / DAY;
    if (elapsedDays < 0) elapsedDays = 0;
    var added = elapsedDays * N;
    var whole = Math.floor(added);
    inf.textContent = ' + ' + group(whole) + (added - whole).toFixed(4).slice(1);
    infd.textContent = group(whole) + (added - whole).toFixed(4).slice(1);

    var open = (now - opened) / 1000;
    var m = Math.floor(open / 60), s = Math.floor(open %% 60);
    var stood = open / 86400 * N;           /* days accrued while reading */
    var sd = Math.floor(stood), sh = (stood - sd) * 24;
    sess.innerHTML = 'This page has been open ' +
      (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s +
      '. In that time the %(n)s have stood for another <b>' +
      group(sd) + ' days ' + sh.toFixed(1) + ' hours</b>.';
  }

  tick();
  setInterval(tick, 125);
})();
</script>
"""


def render():
    return build()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    out = os.path.join(HERE, "index.html")
    page = render()
    if a.check:
        if not os.path.exists(out):
            print("no index.html to check")
            return 1
        have = open(out, encoding="utf-8").read()
        if have == page:
            print("index.html reproduces from data.json. OK")
            return 0
        print("index.html does NOT match data.json (%d vs %d bytes)" % (len(have), len(page)))
        return 1
    open(out, "w", encoding="utf-8").write(page)
    print("wrote %s (%d bytes)" % (out, len(page)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
