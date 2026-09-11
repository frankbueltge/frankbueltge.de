#!/usr/bin/env python3
"""Render index.html for "Does it travel?" from data/results.json.

Session 157, cycle 003. Every number on the page is rendered from the committed record; none is
typed. The narrative sentences are written by hand and are the part check.py takes on trust —
that residue is stated on the page itself, as it was on 2026-09-09.

Deterministic: no clock, no random draw, no network. Running it twice gives identical bytes.

Usage:  python3 artifacts/cycle-003/2026-09-11-does-it-travel/build.py
"""

from __future__ import annotations

import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data", "results.json")

NAMES = {
    "atlas": "Atlas of Data Art",
    "cma": "Cleveland Museum of Art",
    "uk": "data.gov.uk",
    "govdata": "govdata.de",
    "aic": "Art Institute of Chicago",
}
FIELDS = {"atlas": "decisive_move", "cma": "description", "uk": "notes",
          "govdata": "notes", "aic": "description"}
STRATA = {"atlas": "provenance family", "cma": "department", "uk": "publishing organisation",
          "govdata": "publishing organisation", "aic": "—"}


def e(x) -> str:
    return html.escape(str(x), quote=True)


def pct(v) -> str:
    return "—" if v is None else f"{v:.2f}&thinsp;%"


def num(v) -> str:
    return "—" if v is None else f"{v:,}".replace(",", "&thinsp;")


def fmt_any(v) -> str:
    """Render a value from results.json without scientific notation, in a form check.py can
    trace back to the record."""
    if isinstance(v, bool):
        return "yes" if v else "no"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        return f"{v:.5f}" if abs(v) < 1 else f"{v:.2f}"
    return str(v)


def bh_word(a: dict) -> str:
    """The home arm is not one of the three primary tests, so it is in no corrected family."""
    if a.get("bh_survivor") is None:
        return "not in the corrected family (the family is the three primary tests)"
    return "survivor" if a["bh_survivor"] else "not a survivor"


def verdict_badge(v: str) -> str:
    cls = {"confirmed": "ok", "refuted": "bad", "split": "mid", "pending": "mid"}.get(v, "mid")
    return f'<span class="badge {cls}">{e(v)}</span>'


def main() -> int:
    with open(DATA, encoding="utf-8") as fh:
        d = json.load(fh)
    # The narrative lives in its own committed file so that build.py stays machinery: every
    # sentence a reader sees is either rendered from results.json or is in narrative.json.
    with open(os.path.join(HERE, "data", "narrative.json"), encoding="utf-8") as fh:
        d["narrative"] = json.load(fh)
    C = d["catalogues"]
    P = d["predictions"]
    A = d.get("audit")
    N = d["narrative"]

    def cat_row(k: str) -> str:
        c = C[k]
        if c.get("k1_fired"):
            screen = '<td colspan="3" class="kill">K1 fired — no screen run</td>'
        else:
            h = c["held"]
            screen = (f'<td class="n">{pct(h["hollow_broad"]["pct"])}</td>'
                      f'<td class="n">{pct(h["hollow_strict"]["pct"])}</td>'
                      f'<td class="n">{pct(h["r5_title_echo"]["pct"])}</td>')
        return (f'<tr><td>{e(NAMES[k])}</td><td class="mono">{e(FIELDS[k])}</td>'
                f'<td class="n">{num(c.get("records"))}</td>'
                f'<td class="n">{pct(c.get("declared_completeness_pct"))}</td>{screen}</tr>')

    def assoc_table(k: str) -> str:
        c = C[k]
        a = c.get("association")
        if not a:
            return '<p class="kill">No association test: kill condition K2.</p>'
        rows = []
        for g, v in list(a["table"].items())[:8]:
            rows.append(f'<tr><td>{e(g)}</td><td class="n">{num(v["records"])}</td>'
                        f'<td class="n">{num(v["flagged"])}</td><td class="n">{pct(v["pct"])}</td></tr>')
        conc = c["concentration"]
        return (
            f'<table class="data"><thead><tr><th>{e(STRATA[k])}</th><th>held-out records</th>'
            f'<th>flagged</th><th>flag rate</th></tr></thead><tbody>{"".join(rows)}</tbody></table>'
            f'<p class="small">{e(a["levels"])} strata after pooling at 20 held-out records. '
            f'&chi;<sup>2</sup> = {a["chi2"]:.3f}, df {a["df"]}, permutation p = '
            f'{fmt_p(a["p_perm"])} on {num(a["reps"])} relabellings, BH at q&nbsp;=&nbsp;0.05: '
            f'<strong>{bh_word(a)}</strong>. '
            f'Top stratum <em>{e(conc["top_stratum"])}</em> holds {pct(conc["record_share_pct"])} '
            f'of held-out records and {pct(conc["flag_share_pct"])} of the flags — '
            f'concentration ratio <strong>{conc["ratio"]:.2f}</strong>.</p>')

    def fmt_p(p: float) -> str:
        """Render the stored p-value. build.py computes no number; it formats one."""
        at_floor = p * (d["params"]["perm_reps"] + 1) <= 1.0 + 1e-9
        tail = f" (its floor on {num(d['params']['perm_reps'])} relabellings)" if at_floor else ""
        return f"{p:.5f}{tail}"

    pred_rows = []
    for key in ("P1", "P2", "P3", "P4", "P5", "P6", "P7"):
        p = P[key]
        detail = []
        if "arms" in p:
            for c, a in p["arms"].items():
                bits = ", ".join(f"{kk.replace('_', ' ')} {fmt_any(vv)}" for kk, vv in a.items()
                                 if kk not in ("pass", "reason"))
                detail.append(f"<strong>{e(NAMES[c])}</strong>: {e(bits)}")
        elif key == "P4" and A:
            detail.append(f'agreement {pct(p["agreement_pct"])}, &kappa; = {p["kappa"]:.4f}')
        elif key == "P5":
            detail.append(f'govdata.de {pct(p["govdata_pct"])} · data.gov.uk {pct(p["uk_pct"])}')
        elif key == "P7":
            detail.append("every published figure of 2026-09-08 re-measured today: "
                          + ", ".join(f"{k.replace('_', ' ')} {fmt_any(v)}"
                                      for k, v in p["measured_today"].items()))
        pred_rows.append(
            f'<tr><td class="mono">{e(key)}</td><td>{e(p["statement"])}</td>'
            f'<td>{verdict_badge(p["verdict"])}</td></tr>'
            f'<tr class="detail"><td></td><td colspan="2">{"<br>".join(detail)}</td></tr>')

    quote_rows = []
    for q in d["quotes"]:
        rules = ", ".join(r.replace("_", " ") for r in q["rules"])
        quote_rows.append(
            f'<li><span class="src">{e(NAMES[q["catalogue"]])}</span> — '
            f'<em>{e(q["title"])}</em><br><q>{e(q["value"])}</q><br>'
            f'<span class="small">{num(q["chars"])} characters · rules fired: {e(rules)} · '
            f'<a href="{e(q["url"])}">record</a></span></li>')

    audit_block = "<p class=\"kill\">The audit has not been labelled.</p>"
    if A:
        cf = A["confusion"]
        audit_block = (
            f'<table class="data"><thead><tr><th></th><th>reader: says nothing</th>'
            f'<th>reader: usable</th></tr></thead><tbody>'
            f'<tr><th>screen flags</th><td class="n">{num(cf["tp"])}</td><td class="n">{num(cf["fp"])}</td></tr>'
            f'<tr><th>screen passes</th><td class="n">{num(cf["fn"])}</td><td class="n">{num(cf["tn"])}</td></tr>'
            f'</tbody></table>'
            f'<p class="small">{num(A["joined"])} of {num(A["labelled"])} labelled values joined; '
            f'{num(A["cannot_tell"])} marked <em>cannot tell</em> and excluded. '
            f'Agreement {pct(A["agreement_pct"])}, Cohen&rsquo;s &kappa; = {A["kappa"]:.4f}, '
            f'precision {A["precision"]:.4f}, recall {A["recall"]:.4f}. '
            f'Per catalogue: {NAMES["cma"]} &kappa; = {A["cma"]["kappa"]:.4f} '
            f'({num(A["cma"]["reader_says_nothing"])} of {num(A["cma"]["n"])} read as empty), '
            f'{NAMES["uk"]} &kappa; = {A["uk"]["kappa"]:.4f} '
            f'({num(A["uk"]["reader_says_nothing"])} of {num(A["uk"]["n"])} read as empty).</p>')

    aic = C.get("aic", {})
    aic_rows = ""
    if "fill_rates" in aic:
        labels = {"text": "description", "short_description": "short_description",
                  "provenance_text": "provenance_text", "credit_line": "credit_line"}
        aic_rows = "".join(
            f'<tr><td class="mono">{e(labels[f])}</td><td class="n">{num(v["filled"])}</td>'
            f'<td class="n">{num(v["of"])}</td>'
            f'<td class="n">{pct(v["pct"])}</td></tr>'
            for f, v in aic["fill_rates"].items())

    man = d["manifest"]
    man_rows = "".join(
        f'<tr><td>{e(NAMES.get(k, k))}</td><td class="mono">{e(v.get("endpoint", ""))}</td>'
        f'<td class="n">{num(v.get("harvested"))}</td><td class="n">{num(v.get("api_total"))}</td>'
        f'<td class="n">{e(v.get("fetched_utc", ""))}</td></tr>'
        for k, v in man.items())

    doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Does it travel? — a hollowness screen carried abroad</title>
<style>
:root {{ --ink:#16181d; --dim:#5a6270; --rule:#d7dbe2; --bg:#fbfaf8; --acc:#8a3a2a;
        --ok:#2c6e49; --bad:#a03028; --mid:#8a6d1f; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:var(--ink);
  font:16px/1.62 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif; }}
main {{ max-width:50rem; margin:0 auto; padding:3rem 1.25rem 6rem; }}
h1 {{ font-size:2.1rem; line-height:1.18; margin:0 0 .4rem; letter-spacing:-.01em; }}
h2 {{ font-size:1.28rem; margin:3rem 0 .6rem; padding-top:1.1rem; border-top:1px solid var(--rule); }}
h3 {{ font-size:1.02rem; margin:1.8rem 0 .4rem; }}
p, li {{ margin:.7rem 0; }}
.lede {{ font-size:1.08rem; color:var(--dim); margin-bottom:1.4rem; }}
.meta {{ font-size:.82rem; color:var(--dim); letter-spacing:.02em; text-transform:uppercase; }}
table.data {{ border-collapse:collapse; width:100%; font-size:.9rem; margin:1rem 0;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; }}
table.data th, table.data td {{ border-bottom:1px solid var(--rule); padding:.42rem .5rem;
  text-align:left; vertical-align:top; }}
table.data th {{ font-weight:600; font-size:.78rem; text-transform:uppercase;
  letter-spacing:.03em; color:var(--dim); }}
td.n, th.n {{ text-align:right; font-variant-numeric:tabular-nums; }}
tr.detail td {{ font-size:.82rem; color:var(--dim); border-bottom:1px solid var(--rule); }}
.mono {{ font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.85em; }}
.badge {{ display:inline-block; padding:.08rem .5rem; border-radius:.8rem; font-size:.74rem;
  text-transform:uppercase; letter-spacing:.05em; font-weight:600; color:#fff;
  font-family:ui-sans-serif,system-ui,sans-serif; }}
.badge.ok {{ background:var(--ok); }} .badge.bad {{ background:var(--bad); }}
.badge.mid {{ background:var(--mid); }}
.kill {{ color:var(--bad); font-size:.88rem; }}
.small {{ font-size:.84rem; color:var(--dim); }}
q {{ display:block; margin:.35rem 0; padding-left:.8rem; border-left:3px solid var(--rule);
  font-style:italic; }}
q:before, q:after {{ content:""; }}
ul.quotes {{ list-style:none; padding:0; }}
ul.quotes li {{ margin:1.1rem 0; padding-bottom:.8rem; border-bottom:1px solid var(--rule); }}
.src {{ font-size:.78rem; text-transform:uppercase; letter-spacing:.04em; color:var(--acc); }}
blockquote {{ margin:1rem 0; padding:.6rem 0 .6rem 1rem; border-left:3px solid var(--acc);
  font-style:italic; }}
a {{ color:var(--acc); }}
.note {{ background:#fff; border:1px solid var(--rule); padding:.9rem 1.1rem; margin:1.2rem 0;
  font-size:.92rem; }}
footer {{ margin-top:4rem; padding-top:1.2rem; border-top:1px solid var(--rule);
  font-size:.84rem; color:var(--dim); }}
@media (prefers-color-scheme: dark) {{
  :root {{ --ink:#e8e6e1; --dim:#9aa2b0; --rule:#333a45; --bg:#14161a; --acc:#e0876e;
          --ok:#5cbf8a; --bad:#e07a6e; --mid:#d4b352; }}
  .note {{ background:#1b1e24; }}
  .badge {{ color:#14161a; }}
}}
</style></head><body><main>

<p class="meta">The Field · session 157 · cycle 003, &ldquo;Missing Data Art&rdquo; · 2026-09-11</p>
<h1>Does it travel?</h1>
<p class="lede">{N['lede'].format(**{k: e(v) for k, v in P['_tally'].items()})}</p>

<div class="note">{N['prereg_note']}</div>

<h2>1. The catalogues, and what is declared present</h2>
{N['s1']}
<table class="data"><thead><tr><th>catalogue</th><th>field</th><th class="n">records</th>
<th class="n">declared complete</th><th class="n">screen: broad</th><th class="n">strict</th>
<th class="n">R5 title echo</th></tr></thead><tbody>
{cat_row('atlas')}{cat_row('cma')}{cat_row('uk')}{cat_row('govdata')}{cat_row('aic')}
</tbody></table>
<p class="small">Completeness is over all records; the three screen columns are rates over
non-empty values on the held-out half only. The atlas row is the home arm, re-measured today with
the same code.</p>

<h3>The fourth catalogue, and the other way to be empty</h3>
{N['aic']}
<table class="data"><thead><tr><th>field</th><th class="n">non-empty</th><th class="n">of</th>
<th class="n">fill rate</th></tr></thead><tbody>{aic_rows}</tbody></table>

<h2>2. The seven predictions</h2>
{N['s2']}
<table class="data"><thead><tr><th>#</th><th>prediction, as committed before the harvest</th>
<th>verdict</th></tr></thead><tbody>{''.join(pred_rows)}</tbody></table>

<h2>3. Does hollowness have an address?</h2>
{N['s3']}
<h3>{NAMES['cma']}</h3>{assoc_table('cma')}
<h3>{NAMES['uk']}</h3>{assoc_table('uk')}
<h3>{NAMES['govdata']}</h3>{assoc_table('govdata')}
<h3>{NAMES['atlas']} — the home arm, for comparison</h3>{assoc_table('atlas')}

<h2>4. What a reader saw, blind</h2>
{N['s4']}
{audit_block}

<h2>5. Quoted values</h2>
{N['s5']}
<ul class="quotes">{''.join(quote_rows)}</ul>

<h2>6. Who has been here before</h2>
{N['s6']}

<h2>7. What this does not claim</h2>
{N['s7']}

<h2>8. The harvest</h2>
<table class="data"><thead><tr><th>catalogue</th><th>endpoint</th><th class="n">harvested</th>
<th class="n">API total</th><th class="n">fetched (UTC)</th></tr></thead><tbody>{man_rows}</tbody></table>
{N['s8']}

<footer>
<p>The Field (Meridian) · <span class="mono">artifacts/cycle-003/2026-09-11-does-it-travel/</span> ·
pre-registration, verification record, data and checker beside this page.
Rendered from <span class="mono">data/results.json</span> by <span class="mono">build.py</span>;
every number above is derivable from that file and <span class="mono">check.py</span> proves it
offline. No model is called anywhere in the measurement.</p>
</footer>
</main></body></html>
"""
    out = os.path.join(HERE, "index.html")
    if len(sys.argv) > 2 and sys.argv[1] == "--out":
        out = sys.argv[2]
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(doc)
    print(f"wrote {out} ({len(doc)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
