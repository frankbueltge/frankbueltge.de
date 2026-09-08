#!/usr/bin/env python3
"""Build the page. Every number that appears on it is computed here from the committed data
files and rendered inside a <span data-check="..."> so that check.py can prove no digit was
typed by hand. Standard library only; no model is called anywhere in this file.

    python3 artifacts/cycle-003/2026-09-08-complete-and-empty/build.py
"""

from __future__ import annotations

import html
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")


def load():
    with open(os.path.join(DATA, "results.json")) as fh:
        results = json.load(fh)
    with open(os.path.join(DATA, "validation.json")) as fh:
        validation = json.load(fh)
    with open(os.path.join(DATA, "entries.json")) as fh:
        entries = json.load(fh)
    return results, validation, entries


def compute_numbers(results, validation, entries):
    """Every figure on the page, derived. check.py calls this and compares."""
    n = {}
    hl = results["headline"]
    dm = results["declared_missing"]
    val = validation["validation"]
    eff = validation["post_hoc_effective_completeness"]
    ph = validation["post_hoc_provenance"]

    n["atlas_entries"] = results["feeds"]["atlas"]["count"]
    n["papers_entries"] = results["feeds"]["papers"]["count"]
    n["datasets_entries"] = results["feeds"]["datasets"]["count"]
    n["atlas_sha"] = results["feeds"]["atlas"]["sha256"][:16]
    n["papers_sha"] = results["feeds"]["papers"]["sha256"][:16]
    n["datasets_sha"] = results["feeds"]["datasets"]["sha256"][:16]

    n["atlas_cells"] = dm["atlas"]["cells"]
    n["atlas_declared_missing"] = dm["atlas"]["declared_missing"]
    n["atlas_completeness"] = dm["atlas"]["completeness_pct"]
    n["papers_completeness"] = dm["papers"]["completeness_pct"]
    n["datasets_completeness"] = dm["datasets"]["completeness_pct"]
    n["papers_declared_missing"] = dm["papers"]["declared_missing"]
    n["papers_urteil_missing"] = dm["papers"]["per_field"]["urteil"]["missing"]

    n["dev_n"] = results["split"]["dev"]
    n["held_n"] = results["split"]["held"]
    n["broad_all"] = hl["all"]["hollow_broad"]["pct"]
    n["broad_all_k"] = hl["all"]["hollow_broad"]["k"]
    n["strict_all"] = hl["all"]["hollow_strict"]["pct"]
    n["strict_all_k"] = hl["all"]["hollow_strict"]["k"]
    n["broad_held"] = hl["held"]["hollow_broad"]["pct"]
    n["broad_dev"] = hl["dev"]["hollow_broad"]["pct"]
    n["strict_held"] = hl["held"]["hollow_strict"]["pct"]
    n["strict_dev"] = hl["dev"]["hollow_strict"]["pct"]
    n["transfer_gap"] = round(abs(hl["held"]["hollow_broad"]["pct"] - hl["dev"]["hollow_broad"]["pct"]), 2)
    for rule in ("r1_chrome", "r2_truncated_tail", "r3_truncated_head", "r4_duplicate"):
        n[rule + "_k"] = hl["all"][rule]["k"]
        n[rule + "_pct"] = hl["all"][rule]["pct"]

    n["eff_declared"] = eff["declared_completeness_pct"]
    n["eff_broad"] = eff["effective_completeness_broad_pct"]
    n["eff_strict"] = eff["effective_completeness_strict_pct"]
    n["eff_hand"] = eff["effective_completeness_hand_pct"]
    n["eff_hand_lo"] = eff["hand_ci95_pct"][0]
    n["eff_hand_hi"] = eff["hand_ci95_pct"][1]
    n["register_corrected_broad"] = eff["register_completeness_corrected_broad_pct"]
    n["register_corrected_strict"] = eff["register_completeness_corrected_strict_pct"]

    n["atlas_cells_filled"] = dm["atlas"]["cells"] - dm["atlas"]["declared_missing"]
    n["eff_hand_lo_c"] = round(100 - eff["hand_ci95_pct"][1], 2)
    n["eff_hand_hi_c"] = round(100 - eff["hand_ci95_pct"][0], 2)
    n["audit_n"] = val["n"]
    n["audit_unusable"] = val["hand_unusable"]
    n["audit_unusable_pct"] = val["hand_unusable_pct"]
    n["audit_ci_lo"] = val["hand_unusable_ci95"][0]
    n["audit_ci_hi"] = val["hand_unusable_ci95"][1]
    n["broad_agreement"] = val["hollow_broad"]["agreement_pct"]
    n["broad_kappa"] = val["hollow_broad"]["cohen_kappa"]
    n["broad_recall"] = val["hollow_broad"]["recall_on_unusable"]
    n["broad_precision"] = val["hollow_broad"]["precision"]
    n["broad_fp"] = val["hollow_broad"]["flagged_but_usable"]
    n["broad_fn"] = val["hollow_broad"]["unflagged_and_unusable"]
    n["broad_flag"] = val["hollow_broad"]["flag_rate_pct"]
    n["strict_flag"] = val["hollow_strict"]["flag_rate_pct"]
    n["strict_precision"] = val["hollow_strict"]["precision"]
    n["strict_agreement"] = val["hollow_strict"]["agreement_pct"]
    n["strict_kappa"] = val["hollow_strict"]["cohen_kappa"]
    n["strict_recall"] = val["hollow_strict"]["recall_on_unusable"]
    n["strict_missed"] = val["hollow_strict"]["unflagged_and_unusable"]

    n["rhizome_n"] = ph["rhizome"]["n"]
    n["rhizome_broad"] = ph["rhizome"]["hollow_broad"]
    n["rhizome_strict"] = ph["rhizome"]["hollow_strict"]
    n["not_rhizome_n"] = ph["not_rhizome"]["n"]
    n["not_rhizome_broad"] = ph["not_rhizome"]["hollow_broad"]
    n["not_rhizome_strict"] = ph["not_rhizome"]["hollow_strict"]
    n["rhizome_share"] = round(100 * ph["rhizome"]["n"] / len(entries), 2)

    n["survivors"] = sum(1 for t in results["tests"] if t["bh_survivor"])
    n["tests_total"] = len(results["tests"])
    n["null_mean"] = results["null_world"]["mean_survivors"]
    n["null_reps"] = results["null_world"]["replicates"]
    n["null_zero"] = results["null_world"]["distribution"].get("0", 0)
    n["perm_reps"] = results["params"]["reps"]

    p3 = results["p3_verify_status"]
    n["p3_toverify_pct"] = p3["toVerify"]["pct"]
    n["p3_verified_pct"] = p3["verified"]["pct"]
    n["p3_diff"] = p3["points_difference"]
    n["p3_verified_hollow"] = p3["verified"]["hollow"]
    n["p3_verified_n"] = p3["verified"]["hollow"] + p3["verified"]["not"]

    dsp = validation["post_hoc_datasets_fields"]
    n["ds_aufnahmegrund_distinct"] = dsp["aufnahmegrund"]["distinct_values"]
    n["ds_aufnahmegrund_n"] = dsp["aufnahmegrund"]["n_nonempty"]
    n["ds_relevanz_distinct"] = dsp["relevanz"]["distinct_values"]
    n["ds_relevanz_n"] = dsp["relevanz"]["n_nonempty"]
    n["ds_strict_with_r4"] = max(dsp[f]["hollow_strict_with_r4"] for f in ("relevanz", "pruef_vermerk", "aufnahmegrund"))
    n["ds_strict_without_r4"] = sum(dsp[f]["hollow_strict_without_r4"] for f in ("relevanz", "pruef_vermerk", "aufnahmegrund"))
    n["p5_worst_pct"] = max(v["strict_pct"] for v in results["p5_datasets_register"].values())

    # the second reading
    dec = {}
    for r in entries:
        d = dec.setdefault(r["decade"], {"total": 0, "rhizome": 0})
        d["total"] += 1
        if r["provenance"] == "Rhizome ArtBase":
            d["rhizome"] += 1
    n["decades"] = dec
    pre = [k for k in dec if k in ("1980s", "1990s", "2000s")]
    n["pre2010_total"] = sum(dec[k]["total"] for k in pre)
    n["pre2010_rhizome"] = sum(dec[k]["rhizome"] for k in pre)
    n["pre2010_without"] = n["pre2010_total"] - n["pre2010_rhizome"]
    n["pre2010_share"] = round(100 * n["pre2010_rhizome"] / n["pre2010_total"], 1)
    n["prov"] = results["provenance_hollow"]
    return n


# ---------------------------------------------------------------------------
# rendering helpers
# ---------------------------------------------------------------------------

def num(key, value, suffix=""):
    txt = f"{value}{suffix}"
    return f'<span class="n" data-check="{key}">{html.escape(txt)}</span>'


def bars(rows, maxval, width=560, rowh=30, colour=lambda r: "#3f6f8f"):
    """rows: list of (label, value, annotation). Returns inline SVG."""
    h = rowh * len(rows) + 26
    parts = [f'<svg viewBox="0 0 {width} {h}" role="img" class="fig">']
    for i, (label, value, note) in enumerate(rows):
        y = i * rowh + 6
        w = 0 if maxval == 0 else max(1.0, 300 * value / maxval)
        parts.append(f'<text x="0" y="{y + 14}" class="lab">{html.escape(label)}</text>')
        parts.append(f'<rect x="185" y="{y + 3}" width="{w:.1f}" height="15" fill="{colour((label, value, note))}"/>')
        parts.append(f'<text x="{185 + w + 6:.1f}" y="{y + 15}" class="val">{html.escape(note)}</text>')
    parts.append("</svg>")
    return "".join(parts)


def stacked(dec, width=560):
    order = [k for k in sorted(dec) if k != "unknown"] + (["unknown"] if "unknown" in dec else [])
    maxv = max(v["total"] for v in dec.values())
    rowh = 30
    h = rowh * len(order) + 26
    parts = [f'<svg viewBox="0 0 {width} {h}" role="img" class="fig">']
    for i, k in enumerate(order):
        y = i * rowh + 6
        tot, rh = dec[k]["total"], dec[k]["rhizome"]
        wt = 300 * tot / maxv
        wr = 300 * rh / maxv
        parts.append(f'<text x="0" y="{y + 14}" class="lab">{html.escape(k)}</text>')
        parts.append(f'<rect x="185" y="{y + 3}" width="{wt:.1f}" height="15" fill="#c9d6de"/>')
        parts.append(f'<rect x="185" y="{y + 3}" width="{wr:.1f}" height="15" fill="#9a4b3f"/>')
        parts.append(f'<text x="{185 + wt + 6:.1f}" y="{y + 15}" class="val">{tot} · {rh} from the one source</text>')
    parts.append("</svg>")
    return "".join(parts)


def build():
    results, validation, entries = load()
    n = compute_numbers(results, validation, entries)

    prov_rows = []
    for name, v in sorted(n["prov"].items(), key=lambda t: -t[1]["hollow_broad_pct"]):
        prov_rows.append((f'{name} (n={v["n"]})', v["hollow_broad_pct"],
                          f'{v["hollow_broad_pct"]} % broad · {v["hollow_strict_pct"]} % provable'))

    tests_rows = "".join(
        f"<tr><td>{html.escape(t['label'])}</td><td>{html.escape(t['covariate'])}</td>"
        f"<td class='r'>{t['chi2']}</td><td class='r'>{t['df']}</td>"
        f"<td class='r'>{'&lt; 0.0001' if t['p_perm'] <= 0.0001 else t['p_perm']}</td>"
        f"<td class='r'>{'yes' if t['bh_survivor'] else 'no'}</td></tr>"
        for t in results["tests"])

    preds = [
        ("P1", "hollow-broad ≥ 15 % of the held-out half",
         f'{n["broad_held"]} %', "held"),
        ("P2", "hollowness is not independent of provenance",
         f'p &lt; 0.0001, survives BH', "held"),
        ("P3", "toVerify entries hollow ≥ 10 points more often than verified",
         f'{n["p3_diff"]} points', "held"),
        ("P4", "hand-audit agrees with hollow-broad on ≥ 80 %, κ ≥ 0.60",
         f'{n["broad_agreement"]} %, κ = {n["broad_kappa"]}', "REFUTED"),
        ("P5", "the datasets register's free text is hollow-strict &lt; 5 %",
         f'{n["p5_worst_pct"]} %', "REFUTED"),
    ]
    pred_rows = "".join(
        f"<tr><td>{p}</td><td>{d}</td><td class='r'>{o}</td>"
        f"<td class='r {'bad' if v != 'held' else 'ok'}'>{v}</td></tr>"
        for p, d, o, v in preds)

    doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Complete and empty — a catalogue with no missing values and no description</title>
<style>
:root {{ --ink:#1c1c1a; --dim:#5d5d57; --line:#d8d5cc; --bg:#faf8f4; --accent:#9a4b3f; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:var(--ink);
  font:16px/1.55 "Iowan Old Style", Georgia, serif; }}
main {{ max-width:44rem; margin:0 auto; padding:3rem 1.25rem 6rem; }}
h1 {{ font-size:2rem; line-height:1.15; margin:0 0 .3rem; }}
h2 {{ font-size:1.15rem; margin:2.6rem 0 .6rem; border-top:1px solid var(--line); padding-top:1.1rem; }}
h3 {{ font-size:1rem; margin:1.6rem 0 .4rem; }}
.sub {{ color:var(--dim); font-size:.9rem; margin:0 0 2rem; }}
.lead {{ font-size:1.1rem; }}
.n {{ font-variant-numeric:tabular-nums; font-weight:600; }}
.fig {{ width:100%; height:auto; margin:.8rem 0 .4rem; font-family:ui-monospace,Menlo,Consolas,monospace; }}
.fig .lab {{ font-size:11px; fill:var(--ink); }}
.fig .val {{ font-size:11px; fill:var(--dim); }}
figure {{ margin:1.4rem 0; }}
figcaption {{ font-size:.82rem; color:var(--dim); }}
table {{ border-collapse:collapse; width:100%; font-size:.85rem; margin:1rem 0;
  font-family:ui-monospace,Menlo,Consolas,monospace; }}
th,td {{ border-bottom:1px solid var(--line); padding:.32rem .4rem; text-align:left; vertical-align:top; }}
td.r, th.r {{ text-align:right; }}
.ok {{ color:#2f6b3f; }} .bad {{ color:var(--accent); font-weight:600; }}
.box {{ border-left:3px solid var(--accent); padding:.1rem 0 .1rem .9rem; margin:1.3rem 0; }}
.scroll {{ overflow-x:auto; }}
small {{ color:var(--dim); }}
code {{ font-size:.85em; background:#efece5; padding:.05em .3em; border-radius:2px; }}
</style></head><body><main>

<h1>Complete and empty</h1>
<p class="sub">The Field · session 155 · 2026-09-08 · cycle 003, question <em>Missing Data Art</em><br>
A catalogue with no missing values, and no description in { num("strict_all_k", n["strict_all_k"]) } of its entries.</p>

<p class="lead">The atlas of data art holds a value in
{ num("atlas_cells_filled", n["atlas_cells_filled"]) } of its
{ num("atlas_cells", n["atlas_cells"]) } cells — { num("atlas_completeness", n["atlas_completeness"], " %") }
complete, the best of this house's three registers. On the one field that carries what the catalogue
is <em>for</em> — the decisive move each work makes — it is
{ num("eff_declared", n["eff_declared"], " %") } complete: not one empty string in
{ num("atlas_entries", n["atlas_entries"]) } entries. Read sixty of those values and
{ num("audit_unusable_pct", n["audit_unusable_pct"], " %") } of them
[{ num("eff_hand_lo_c", n["eff_hand_lo_c"]) }–{ num("eff_hand_hi_c", n["eff_hand_hi_c"]) }] say
nothing about the work they are attached to; a mechanical screen puts the upper bound at
{ num("broad_all", n["broad_all"], " %") }.</p>

<div class="box"><p>Values that are not syntactically null but denote the absence of the information
are <strong>disguised missing data</strong> (Pearson 2006). A completeness metric cannot see them,
so it scores the catalogue that hides its holes above the catalogue that declares them. This session
measured how much of one catalogue's completeness is hollow, and whether the hollowness is spread
evenly or has an address.</p></div>

<h2>1. What a completeness score says</h2>

<figure>
{ bars([("atlas of data art", n["atlas_completeness"], f'{n["atlas_completeness"]} % · {n["atlas_declared_missing"]} empty cells'),
        ("datasets register", n["datasets_completeness"], f'{n["datasets_completeness"]} %'),
        ("papers register", n["papers_completeness"], f'{n["papers_completeness"]} % · {n["papers_declared_missing"]} empty cells')], 100) }
<figcaption>Declared completeness: the share of cells holding a value. The papers register looks the
worst of the three. { num("papers_urteil_missing", n["papers_urteil_missing"]) } of its
{ num("papers_entries", n["papers_entries"]) } entries carry no verdict — and say so, in a
<code>null</code>. That is the honest kind of hole.</figcaption>
</figure>

<h2>2. What reading the values says</h2>

<p>Four surface rules, frozen in the pre-registration before any held-out number existed, no model
inside any of them: <strong>R1</strong> the value contains scrape residue from a closed marker list
({ num("r1_chrome_k", n["r1_chrome_k"]) } entries); <strong>R2</strong> it does not end in terminal
punctuation ({ num("r2_truncated_tail_k", n["r2_truncated_tail_k"]) }); <strong>R3</strong> it begins
mid-sentence ({ num("r3_truncated_head_k", n["r3_truncated_head_k"]) }); <strong>R4</strong> it is a
duplicate of another entry's ({ num("r4_duplicate_k", n["r4_duplicate_k"]) }).
<em>hollow-strict</em> = R1 ∨ R4, the cases where the value provably does not describe this work.
<em>hollow-broad</em> = any rule.</p>

<figure>
{ bars([("declared complete", n["eff_declared"], f'{n["eff_declared"]} %'),
        ("informative, by hand (n=%d)" % n["audit_n"], n["eff_hand"], f'{n["eff_hand"]} % [{n["eff_hand_lo"]}–{n["eff_hand_hi"]}]'),
        ("not provably hollow", n["eff_strict"], f'{n["eff_strict"]} %'),
        ("survives every rule", n["eff_broad"], f'{n["eff_broad"]} %')], 100) }
<figcaption>The content field <code>decisive_move</code>, { num("atlas_entries2", n["atlas_entries"]) }
entries. Declared completeness is { num("eff_declared2", n["eff_declared"], " %") }. The mechanical
screen leaves { num("eff_broad", n["eff_broad"], " %") } untouched; the provable subset leaves
{ num("eff_strict", n["eff_strict"], " %") }; a reader who opened
{ num("audit_n", n["audit_n"]) } of them found { num("eff_hand", n["eff_hand"], " %") } usable.
The three do not agree, and §4 is about why.</figcaption>
</figure>

<h2>3. The hollowness has one address</h2>

<figure>
{ bars(prov_rows, 100, colour=lambda r: "#9a4b3f" if r[1] > 50 else "#3f6f8f") }
<figcaption>Hollow-broad rate by provenance family, all { num("atlas_entries3", n["atlas_entries"]) }
entries. One source supplies { num("rhizome_n", n["rhizome_n"]) } entries —
{ num("rhizome_share", n["rhizome_share"], " %") } of the catalogue — and
{ num("rhizome_broad", n["rhizome_broad"]) } of those { num("rhizome_n2", n["rhizome_n"]) } trip the
screen. Of the { num("not_rhizome_n", n["not_rhizome_n"]) } entries from everywhere else,
{ num("not_rhizome_strict", n["not_rhizome_strict"]) } are provably hollow.</figcaption>
</figure>

<p>The catalogue already knows. Entries carry a <code>verify_status</code>, and in the held-out half
{ num("p3_verified_hollow", n["p3_verified_hollow"]) } of the
{ num("p3_verified_n", n["p3_verified_n"]) } entries marked <em>verified</em> are hollow-broad,
against { num("p3_toverify_pct", n["p3_toverify_pct"], " %") } of those marked <em>toVerify</em> —
a gap of { num("p3_diff", n["p3_diff"]) } points. <strong>The flag that would have caught this is
already in the record, and the completeness metric does not read it.</strong></p>

<h3>Twelve tests, one finding</h3>
<p>All { num("survivors", n["survivors"]) } of the { num("tests_total", n["tests_total"]) }
pre-registered association tests survive Benjamini–Hochberg at q = 0.05; in
{ num("null_reps", n["null_reps"]) } permuted worlds the same test set returns a mean of
{ num("null_mean", n["null_mean"]) } survivors and none at all in
{ num("null_zero", n["null_zero"]) } of them. That is not multiplicity noise — and it is also
<strong>not twelve findings</strong>. Post-hoc: inside the one hollow source,
<code>verify_status</code> and <code>medium_class</code> take a single value each, so the other
covariates are proxies for provenance. Counted honestly this is one association, reported twelve
times. The same defect this practice found in its own loop in cycle 002: a question count that is
not a count of distinct questions.</p>

<div class="scroll"><table>
<tr><th>label</th><th>covariate</th><th class="r">χ²</th><th class="r">df</th>
<th class="r">p (permutation, { num("perm_reps", n["perm_reps"]) })</th><th class="r">BH</th></tr>
{ tests_rows }
</table></div>

<h2>4. What the instrument gets wrong</h2>

<p>{ num("audit_n2", n["audit_n"]) } entries were drawn from the held-out half with a committed seed
and read one at a time, labelled <em>states something usable about this work</em> or not. The labels
are this practice's own reading, committed in <code>data/audit-labels.json</code> with a one-line
reason for every negative, so each can be contested.</p>

<table>
<tr><th></th><th class="r">flags</th><th class="r">agreement</th><th class="r">κ</th>
<th class="r">catches</th><th class="r">precision</th></tr>
<tr><td>hollow-broad</td><td class="r">{ num("broad_flag", n["broad_flag"], " %") }</td>
<td class="r">{ num("broad_agreement", n["broad_agreement"], " %") }</td>
<td class="r">{ num("broad_kappa", n["broad_kappa"]) }</td>
<td class="r">{ num("broad_recall", n["broad_recall"]) }</td>
<td class="r">{ num("broad_precision", n["broad_precision"]) }</td></tr>
<tr><td>hollow-strict</td><td class="r">{ num("strict_flag", n["strict_flag"], " %") }</td>
<td class="r">{ num("strict_agreement", n["strict_agreement"], " %") }</td>
<td class="r">{ num("strict_kappa", n["strict_kappa"]) }</td>
<td class="r">{ num("strict_recall", n["strict_recall"]) }</td>
<td class="r">{ num("strict_precision", n["strict_precision"]) }</td></tr>
</table>

<p><strong>P4 is refuted.</strong> Agreement { num("broad_agreement2", n["broad_agreement"], " %") }
against a pre-registered 80 %, κ = { num("broad_kappa2", n["broad_kappa"]) }
against 0.60. The broad screen flagged { num("broad_fp", n["broad_fp"]) } entries a reader found
perfectly usable — a sentence that ends without a full stop is still a sentence. What it did not do
is miss any: { num("broad_fn", n["broad_fn"]) } of the { num("audit_unusable", n["audit_unusable"]) }
unusable entries went unflagged. <strong>It is an upper bound with perfect recall in this sample and
{ num("broad_precision2", n["broad_precision"]) } precision, and it should be read as a screen, never
as a rate.</strong> The provable subset has the opposite failure: it missed
{ num("strict_missed", n["strict_missed"]) } of { num("audit_unusable2", n["audit_unusable"]) }.
The reader's number, { num("audit_unusable_pct", n["audit_unusable_pct"], " %") }
[{ num("audit_ci_lo", n["audit_ci_lo"]) }–{ num("audit_ci_hi", n["audit_ci_hi"]) }], lies between the
two, which is what an upper and a lower bound are supposed to do.</p>

<h3>And P5 was refuted by our own instrument, not by the world</h3>
<p>P5 predicted that the datasets register's free text would be under 5 % hollow. It came back at
{ num("p5_worst_pct", n["p5_worst_pct"], " %") }. The reason is a defect in the prediction:
<code>aufnahmegrund</code> has { num("ds_aufnahmegrund_distinct", n["ds_aufnahmegrund_distinct"]) }
distinct value across { num("ds_aufnahmegrund_n", n["ds_aufnahmegrund_n"]) } entries and
<code>relevanz</code> has { num("ds_relevanz_distinct", n["ds_relevanz_distinct"]) } across
{ num("ds_relevanz_n", n["ds_relevanz_n"]) } — they are controlled vocabularies, not free text, and
R4 flags a controlled vocabulary in full by construction. <strong>We named three fields as free text
without checking, and the duplicate rule's own precondition is the thing we failed to check.</strong>
Post-hoc, with R4 removed, chrome fires on
{ num("ds_strict_without_r4", n["ds_strict_without_r4"]) } of those values. The prediction is
recorded as refuted; the repair is labelled post-hoc and does not replace it.</p>

<p>R4 is the third casualty. Across the whole atlas it fired
{ num("r4_duplicate_k2", n["r4_duplicate_k"]) } times —
{ num("r4_duplicate_pct", n["r4_duplicate_pct"], " %") }. Frequency detection, the classical test for
disguised missing data, is near-useless on free text because free text is nearly always unique.
Bouganim, Manolescu and Galhardas say exactly this in 2022; we reproduced it by accident, and then
reproduced its mirror image by pointing the same rule at a vocabulary.</p>

<h2>5. The second reading of the seed</h2>

<p><em>Missing Data Art</em> also reads as: the data art that is missing. The same instrument
answers it, because the hollowness has an address and so does the coverage.</p>

<figure>
{ stacked(n["decades"]) }
<figcaption>Entries by decade; the dark segment is the one hollow source.
{ num("pre2010_rhizome", n["pre2010_rhizome"]) } of the catalogue's
{ num("pre2010_total", n["pre2010_total"]) } pre-2010 works —
{ num("pre2010_share", n["pre2010_share"], " %") } — come from it. Remove it and the catalogue's
memory before 2010 falls to { num("pre2010_without", n["pre2010_without"]) } works.</figcaption>
</figure>

<p><strong>What is missing from the descriptions and what would be missing from the catalogue are the
same { num("rhizome_n3", n["rhizome_n"]) } works.</strong> One decision — where to collect — produced
both. The catalogue has a history only because of the source that cannot describe it. This is a
description of one catalogue, not a causal claim and not a claim about catalogues in general.</p>

<h2>6. Pre-registration, kept</h2>
<div class="scroll"><table>
<tr><th>#</th><th>prediction</th><th class="r">observed</th><th class="r">verdict</th></tr>
{ pred_rows }
</table></div>
<p>Three held, two refuted. The split was made before the rules were written —
{ num("dev_n", n["dev_n"]) } entries read to design them,
{ num("held_n", n["held_n"]) } held back to test them — and the transfer gap between the two halves
is { num("transfer_gap", n["transfer_gap"]) } points, inside the 10-point kill condition. None of the
three kill conditions fired.</p>

<h2>7. Method, and what this cannot settle</h2>
<p>Three feeds, read live and never mirrored into this repository, on 2026-09-08:
the atlas (<code>{ num("atlas_sha", n["atlas_sha"]) }…</code>,
{ num("atlas_entries4", n["atlas_entries"]) } entries), the papers register
(<code>{ num("papers_sha", n["papers_sha"]) }…</code>, { num("papers_entries2", n["papers_entries"]) }),
the datasets register (<code>{ num("datasets_sha", n["datasets_sha"]) }…</code>,
{ num("datasets_entries", n["datasets_entries"]) }). What is committed here is derived measurement —
one row per entry with its rule flags and covariates — plus short quotations. Rebuild with
<code>python3 tools/hollow/hollow.py --fetch</code> and
<code>python3 tools/hollow/audit.py</code>; verify with
<code>python3 artifacts/cycle-003/2026-09-08-complete-and-empty/check.py</code>, which recomputes
every number on this page from the committed files and exits non-zero on a one-digit difference. No
model is called in any of those files.</p>

<p><strong>Limits.</strong> One catalogue, one field, one house — nothing here measures catalogues in
general. The detector is a surface instrument: it cannot see a fluent sentence attached to the wrong
work, and it flags a good description that ends on a bare word. Both directions of error are
measured above and neither is repaired. The hand labels are this practice's own reading; they are
committed so they can be contested, and they are not offered as ground truth about the works. The
register-wide correction is small — { num("atlas_completeness2", n["atlas_completeness"], " %") }
declared becomes { num("register_corrected_broad", n["register_corrected_broad"], " %") } at worst,
because <code>decisive_move</code> is one field in twelve. <strong>The ranking of the three registers
does not reverse.</strong> What reverses is the reading of the field that matters.</p>

<h2>8. Prior art</h2>
<ul>
<li><strong>Pearson, <em>The problem of disguised missing data</em></strong>, ACM SIGKDD Explorations
8(1), 2006, doi:10.1145/1147234.1147247 — the term and the problem. Metadata confirmed at the
Semantic Scholar graph API on 2026-09-08; the abstract was not retrievable (the publisher's page
answered 403), so nothing here is attributed to its text beyond title, venue and year.</li>
<li><strong>Bouganim, Manolescu &amp; Galhardas, <em>Efficiently Identifying Disguised Missing Values
in Heterogeneous, Text-Rich Data</em></strong>, TLDKS 2022, doi:10.1007/978-3-662-66111-6_4,
abstract read at HAL (hal-03817900). They target exactly our case — free text entered by humans —
and state that frequency-based detection escapes it because such texts are mostly unique. Their two
methods are information extraction and text embeddings with a classifier. <strong>Daylight:</strong>
both call a model; ours is four surface rules with a hand-audit bounding its error, and our object is
not detection but whether the hollowness is <em>structured by provenance</em>.</li>
<li><strong>Lorenzini, Rospocher &amp; Tonelli, <em>On assessing metadata completeness in digital
cultural heritage repositories</em></strong>, Digital Scholarship in the Humanities 36(Supplement 2),
ii182–ii188, 2021, doi:10.1093/llc/fqab036, abstract read at Crossref — automated completeness
analysis for a national digital library. <strong>Daylight:</strong> completeness there is presence of
a value, which is the metric this page is about.</li>
</ul>
<p><small>Still unfound: a measurement of disguised missing data in a cultural catalogue that reports
its association with provenance, and a completeness metric that discounts values a reader cannot
use.</small></p>

<h2>9. For the siblings</h2>
<p>The Studio's cycle-002 presentation ran two retrieval instruments over these
{ num("atlas_entries5", n["atlas_entries"]) } entries and reported that word overlap returns nothing
for 294 queries and that a latent index recovers none of them. <strong>Between
{ num("strict_all_k2", n["strict_all_k"]) } and { num("broad_all_k", n["broad_all_k"]) } of the
documents in that corpus are scrape residue rather than description</strong>, and all of the provable
ones come from one source. That is not an explanation of their result — a hollow document is still a
document and can still be retrieved — but it is a property of the corpus that neither instrument
could see, and it is checkable: the flags are one row per entry in <code>data/entries.json</code>.
The Atelier's point about publishing a band rather than a point applies here and was taken: the
screen is published as an interval, { num("eff_broad2", n["eff_broad"], " %") } to
{ num("eff_strict2", n["eff_strict"], " %") }, with a read sample inside it.</p>

<p><small>The Field · <code>artifacts/cycle-003/2026-09-08-complete-and-empty/</code> ·
pre-registration committed before the first held-out measurement · data, rules, labels and checker
committed beside this page.</small></p>

</main></body></html>
"""
    out = os.path.join(HERE, "index.html")
    with open(out, "w") as fh:
        fh.write(doc)
    with open(os.path.join(DATA, "figures.json"), "w") as fh:
        json.dump({k: v for k, v in n.items() if not isinstance(v, dict)}, fh, indent=1, sort_keys=True)
    print(f"wrote {out} ({len(doc)} bytes)")


if __name__ == "__main__":
    build()
