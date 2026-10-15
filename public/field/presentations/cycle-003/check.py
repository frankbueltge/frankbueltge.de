#!/usr/bin/env python3
"""Cycle 003 presentation — the checker. Exit 0 only if every check passes. No network.

Session 159. The presentation's job is restating, so its failure mode is a number that drifts from
the artifact that made it, or a sentence written around a number rather than from it. Both are
checked here, and so is the lesson an adversary taught this practice on 2026-09-11 and again on
2026-09-12: **a checker that compares a page to a summary file cannot catch a lie written into the
summary file.** So wherever a per-record or per-item record is committed, the aggregate is
recomputed from it rather than read.

  §1  every restated figure is re-read from the artifact's own committed data file
  §2  aggregates recomputed from the per-record/per-item records that are committed:
      the atlas's flag rates from entries.json; the denominator census's tallies from its
      coded sources; the 2026-09-11 audit's kappa and precision from its labels; the
      2026-09-12 arms' accuracies from task-rows.json
  §3  tonight's agreement matrix recomputed from task-rows.json with an independent
      implementation of Cohen's kappa (not the one agreement.py imports)
  §4  tonight's ladder verdicts re-derived from the ladder's own rows, so the predictions block
      cannot contradict the table above it
  §5  the page is re-rendered into memory and must be byte-identical to the committed index.html
  §6  every numeral on the page is a registered figure or a declared literal
  §7  house rules: no tool vendor named, English only, the screen not called a detector of
      uninformative text

**What this checker cannot verify, stated rather than implied.** The ladder of §4 rests on a corpus
of another organisation's records, which this repository does not contain and will not
(protocol §7). Nothing here can confirm that govdata.de returned what tools/room/room.py says it
returned; that means re-fetching the endpoint named in data/room-ladder.json and re-running the
tool. The same holds for the atlas's raw description text: entries.json carries per-record verdicts,
not the values they were computed from.

Usage: python3 presentations/cycle-003/check.py
"""

from __future__ import annotations

import itertools
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)

A = os.path.join(ROOT, "artifacts", "cycle-003")
S155 = os.path.join(A, "2026-09-08-complete-and-empty", "data")
S156 = os.path.join(A, "2026-09-09-the-denominator", "data")
S157 = os.path.join(A, "2026-09-11-does-it-travel", "data")
S158 = os.path.join(A, "2026-09-12-what-a-description-is-for", "data")
THIN = " "

FAIL: list[str] = []
N = [0]


def ck(cond: bool, what: str) -> None:
    N[0] += 1
    if not cond:
        FAIL.append(what)


def eq(label: str, got, want) -> None:
    N[0] += 1
    if got != want:
        FAIL.append(f"{label}: page table has {got!r}, source has {want!r}")


def load(*p):
    with open(os.path.join(*p), encoding="utf-8") as fh:
        return json.load(fh)


def kappa(a: list[int], b: list[int]) -> float:
    """Cohen's kappa, written out here on purpose: agreement.py imports the practice's own
    implementation from tools/hollow, and a checker that reuses it checks nothing about it."""
    n = len(a)
    po = sum(1 for x, y in zip(a, b) if x == y) / n
    pa, pb = sum(a) / n, sum(b) / n
    pe = pa * pb + (1 - pa) * (1 - pb)
    return 0.0 if pe == 1 else (po - pe) / (1 - pe)


def main() -> int:  # noqa: C901 - a checker is a list of checks
    import build  # noqa: PLC0415 - imported after sys.path is set
    from figures import collect  # noqa: PLC0415

    F = collect()

    # ---- §1 every restated figure against the artifact that shipped it --------------------
    r155, g155 = load(S155, "results.json"), load(S155, "figures.json")
    eq("s155.entries", F["s155"]["entries"], r155["feeds"]["atlas"]["count"])
    eq("s155.present_key_pct", F["s155"]["present_key_pct"],
       r155["declared_missing"]["atlas"]["completeness_pct"])
    eq("s155.schema_fixed_pct", F["s155"]["schema_fixed_pct"],
       r155["declared_missing"]["atlas"]["schema_completeness_pct"])
    eq("s155.broad_pct", F["s155"]["broad_pct"], r155["headline"]["all"]["hollow_broad"]["pct"])
    eq("s155.rhizome_broad", F["s155"]["rhizome_broad"], g155["rhizome_broad"])

    r157 = load(S157, "results.json")
    eq("s157.uk_records", F["s157"]["uk_records"], r157["catalogues"]["uk"]["records"])
    eq("s157.cma_pct", F["s157"]["cma_pct"], r157["catalogues"]["cma"]["declared_completeness_pct"])
    eq("s157.kappa", F["s157"]["kappa"], r157["audit"]["kappa"])
    eq("s157.precision", F["s157"]["precision"], r157["audit"]["precision"])
    eq("s157.refuted", F["s157"]["refuted"], r157["predictions"]["_tally"]["refuted"])

    r158, c158 = load(S158, "results.json"), load(S158, "size-curve.json")
    eq("s158.home_accuracy", F["s158"]["home_accuracy"], r158["arms"]["atlas-masked"]["accuracy_pct"])
    eq("s158.uk_gap", F["s158"]["uk_gap"], r158["arms"]["uk-masked"]["gap_points"])
    eq("s158.ladder_low_pct", F["s158"]["ladder_low_pct"], c158["uk_ladder"][0]["not_unique_pct"])
    eq("s158.ladder_high_pct", F["s158"]["ladder_high_pct"], c158["uk_ladder"][-1]["not_unique_pct"])
    eq("s158.r4_ratio", F["s158"]["r4_ratio"],
       c158["is_the_screen_itself_size_dependent"]["r4_ratio_full_over_521"])
    ck(abs(F["s158"]["narrowing_ratio"]
           - round(F["s158"]["ladder_high_pct"] / F["s158"]["ladder_low_pct"], 2)) < 1e-9,
       "s158.narrowing_ratio is not the quotient of the two rungs it is drawn from")

    # ---- §2 aggregates recomputed from the committed per-record material -------------------
    ents = load(S155, "entries.json")
    eq("s155 entries count recomputed", len(ents), F["s155"]["entries"])
    broad = sum(1 for e in ents if e["hollow_broad"])
    eq("s155 broad count recomputed from entries.json", broad, F["s155"]["broad_k"])
    eq("s155 broad pct recomputed", round(100.0 * broad / len(ents), 2), F["s155"]["broad_pct"])
    rh = [e for e in ents if "Rhizome" in (e.get("provenance") or "")]
    ck(len(rh) == F["s155"]["rhizome_n"],
       f"s155 single-source stratum recomputed: {len(rh)} against {F['s155']['rhizome_n']}")
    ck(sum(1 for e in rh if e["hollow_broad"]) == F["s155"]["rhizome_broad"],
       "s155 flags in the single-source stratum do not recompute from entries.json")
    others = [e for e in ents if e not in rh]
    ck(len(others) == F["s155"]["not_rhizome_n"], "s155 the other stratum's size does not recompute")
    ck(sum(1 for e in others if e["hollow_strict"]) == F["s155"]["not_rhizome_strict"],
       "s155 strict flags outside the single source do not recompute")

    s156 = load(S156, "sources.json")
    groups: dict[str, set] = {}
    for x in s156["sources"]:
        groups.setdefault(x["author_group"], set()).add(x["axis_a"])
    ratio = [k for k, v in groups.items() if {"S", "P"} & v]
    eq("s156 included recomputed", len(s156["sources"]), F["s156"]["included"])
    eq("s156 groups recomputed", len(groups), F["s156"]["groups"])
    eq("s156 ratio-computing groups recomputed", len(ratio), F["s156"]["ratio_groups"])
    eq("s156 schema-fixed recomputed", sum(1 for k in ratio if "S" in groups[k]),
       F["s156"]["schema_fixed"])
    eq("s156 present-key recomputed", sum(1 for k in ratio if "P" in groups[k]),
       F["s156"]["present_key"])
    ck(F["s156"]["present_key"] == 0,
       "s156: the page's claim that nobody uses our denominator no longer holds in the data")
    eq("s156 tier-weighted recomputed",
       sum(1 for x in s156["sources"] if x["axis_b"] == "weighted"), F["s156"]["tier_weighted"])

    rows157 = r157["audit"]["rows"]
    rdr = [r["reader_hollow"] for r in rows157]
    scr = [r["screen_broad"] for r in rows157]
    eq("s157 audit n recomputed", len(rows157), F["s157"]["audit_n"])
    eq("s157 reader positives recomputed", sum(rdr), F["s157"]["reader_says_nothing"])
    eq("s157 screen flags recomputed", sum(scr), F["s157"]["screen_flags"])
    ck(abs(kappa(rdr, scr) - F["s157"]["kappa"]) < 5e-4,
       f"s157 kappa recomputed as {kappa(rdr, scr):.4f}, results.json says {F['s157']['kappa']}")
    tp = sum(1 for a, b in zip(rdr, scr) if a == 1 and b == 1)
    prec = tp / sum(scr)
    ck(abs(prec - F["s157"]["precision"]) < 5e-4,
       f"s157 precision recomputed as {prec:.4f}, results.json says {F['s157']['precision']}")

    tr = load(S158, "task-rows.json")
    for arm, key in (("atlas-masked", "home_accuracy"), ("uk-masked", "uk_accuracy")):
        rows = tr[arm]
        acc = round(100.0 * sum(1 for x in rows if x["correct"]) / len(rows), 2)
        eq(f"s158 {arm} accuracy recomputed from task-rows.json", acc, F["s158"][key])
    fl = [x for x in tr["atlas-masked"] if x["hollow_broad"]]
    eq("s158 flagged-at-home count recomputed", len(fl), F["s158"]["home_flagged_n"])
    eq("s158 flagged-and-still-identified recomputed", sum(1 for x in fl if x["correct"]),
       F["s158"]["home_flagged_correct"])

    # ---- §3 tonight's matrix, recomputed with an independent kappa -------------------------
    ag = load(HERE, "data", "agreement.json")
    ops = ["screen_broad", "screen_strict", "narrowing", "task_fail"]
    for arm in ag["arms"]:
        rows = tr[arm]
        vec = {
            "screen_broad": [1 if x["hollow_broad"] else 0 for x in rows],
            "screen_strict": [1 if x["hollow_strict"] else 0 for x in rows],
            "narrowing": [0 if x["identifies_uniquely"] else 1 for x in rows],
            "task_fail": [0 if x["correct"] else 1 for x in rows],
        }
        eq(f"agreement n, {arm}", ag["arms"][arm]["n"], len(rows))
        for a_, b_ in itertools.combinations(ops, 2):
            cell = ag["arms"][arm]["pairs"][f"{a_}|{b_}"]
            k = kappa(vec[a_], vec[b_])
            ck(abs(k - cell["kappa"]) < 5e-4,
               f"agreement {arm} {a_}|{b_}: recomputed {k:.4f}, file says {cell['kappa']}")
            deg = (sum(vec[a_]) in (0, len(rows))) or (sum(vec[b_]) in (0, len(rows)))
            ck(deg == cell["degenerate"],
               f"agreement {arm} {a_}|{b_}: degeneracy flag disagrees with the labels")
            ck((not deg) or abs(cell["kappa"]) < 1e-9,
               f"agreement {arm} {a_}|{b_}: marked degenerate but kappa is not zero")
    live = [c["kappa"] for c in ag["arms"]["uk-masked"]["pairs"].values() if not c["degenerate"]]
    ck(len(live) == 6, "the data.gov.uk arm should have six live cells; the claim in section 3 "
                       "that every instrument varies there depends on it")
    mm = [ag["arms"]["uk-masked"]["pairs"][k]["kappa"]
          for k in ("screen_broad|screen_strict", "screen_broad|narrowing",
                    "screen_strict|narrowing")]
    mh = [ag["arms"]["uk-masked"]["pairs"][k]["kappa"]
          for k in ("screen_broad|task_fail", "screen_strict|task_fail", "narrowing|task_fail")]
    ck(min(mm) > max(mh),
       "section 3 claims the machine-machine cells sit above every machine-human cell; they do not")
    eq("s159.uk_mm_min", F["s159_agreement"]["uk_mm_min"], min(mm))
    eq("s159.uk_mh_max", F["s159_agreement"]["uk_mh_max"], max(mh))

    # ---- §4 tonight's ladder verdicts, re-derived from the ladder's own rows ---------------
    room = load(HERE, "data", "room-ladder.json")
    ck(room["session"] == 159 and room["date"] == "2026-09-13", "room-ladder.json is not tonight's")
    lad, pr = room.get("ladder", []), room.get("predictions", {})
    if lad:
        ck(room["manifest"]["harvested"] >= 0.9 * room["manifest"]["api_total"],
           "K2: fewer than 90 % of the reported count was harvested, so the arm is not a census")
        # "largest fall", floored at zero when the curve never falls - the tool's own definition.
        drops = [a["not_unique_pct"] - b["not_unique_pct"] for a, b in zip(lad, lad[1:])]
        worst = max([0.0] + drops)
        ck(abs(worst - pr["P1"]["largest_drop_points"]) < 1e-9,
           "P1's reported largest fall is not the largest fall in the ladder rows")
        eq("P1 verdict re-derived", pr["P1"]["verdict"],
           "confirmed" if worst <= 1.0 else "refuted")
        bot = next(r for r in lad if r["n"] == 521)
        top = lad[-1]
        eq("P2 value re-derived", pr["P2"]["value_pct"], bot["not_unique_pct"])
        eq("P2 verdict re-derived", pr["P2"]["verdict"],
           "confirmed" if bot["not_unique_pct"] - pr["P2"]["atlas_pct"] >= 5.0 else "refuted")
        ratio = round(top["not_unique_pct"] / bot["not_unique_pct"], 2)
        eq("P3 ratio re-derived", pr["P3"]["ratio"], ratio)
        eq("P3 verdict re-derived", pr["P3"]["verdict"],
           "confirmed" if 1.88 <= ratio <= 7.54 else "refuted")
        r4r = round(top["r4_duplicate_pct"] / bot["r4_duplicate_pct"], 2)
        eq("P4 ratio re-derived", pr["P4"]["ratio"], r4r)
        eq("P4 verdict re-derived", pr["P4"]["verdict"], "confirmed" if r4r > 2.0 else "refuted")
        eq("P5 verdict re-derived", pr["P5"]["verdict"],
           "confirmed" if r4r > ratio else "refuted")
        moves = max(abs(top[k] - lad[0][k]) for k in
                    ("r1_chrome_pct", "r2_truncated_tail_pct", "r3_truncated_head_pct"))
        ck(abs(moves - pr["P6"]["largest"]) < 1e-6,
           "P6's reported movement is not the movement in the ladder rows")

        # P6 was a control on our own code and it fired. Its bar compared the mean of five
        # 521-record draws to a census and demanded 0.05 points, which no sampled estimate can
        # meet; the verdict stands refuted and the bar is filed as a defect. What the control was
        # BUILT to detect is checked here instead, and more strictly than the page needs: the
        # size-free rules must be statistically indistinguishable from the population value, and
        # the narrowing rate - the thing the ladder is about - must be far from it. If R1-R3 had
        # really moved with catalogue size, this fails.
        if pr["P6"]["verdict"] == "refuted":
            d6 = load(HERE, "data", "p6-diagnostic.json")
            import math  # noqa: PLC0415
            for key, row in d6["rules"].items():
                sd = lad[0].get(key + "_sd")
                se = sd / math.sqrt(lad[0]["repeats"]) if sd else None
                ck(se is not None and abs(row["bottom_rung_standard_error_of_the_mean"] - round(se, 4))
                   < 1e-9, f"p6 diagnostic: {key} standard error does not recompute from the rows")
                want = round(abs(lad[-1][key] - lad[0][key]) / se, 2) if se else None
                ck(row["difference_in_standard_errors"] == want,
                   f"p6 diagnostic: {key} distance in standard errors does not recompute")
                if row["size_free_by_construction"]:
                    ck(row["difference_in_standard_errors"] < 3.0,
                       f"{key} is a property of one string yet sits "
                       f"{row['difference_in_standard_errors']} standard errors from the "
                       f"population value: the ladder IS broken and nothing on it may be read")
            ck(d6["rules"]["not_unique_pct"]["difference_in_standard_errors"] > 5.0,
               "the narrowing rate does not move by more than noise along the ladder, so there is "
               "no effect to report")
            ck("stands refuted as written" in open(
                os.path.join(HERE, "index.html"), encoding="utf-8").read(),
               "P6 was refuted but the page does not say its verdict stands as written")
        eq("room tally, confirmed", room["_tally"]["confirmed"],
           sum(1 for v in pr.values() if v["verdict"] == "confirmed"))
        eq("room tally, refuted", room["_tally"]["refuted"],
           sum(1 for v in pr.values() if v["verdict"] == "refuted"))
        ck(room["growth"]["delta"]
           == room["growth"]["count_probe_2026_09_13"] - room["growth"]["count_2026_09_11"],
           "the growth figure is not the difference of the two counts it names")

    # ---- §5 the page is a render of the data, byte for byte -------------------------------
    with open(os.path.join(HERE, "index.html"), encoding="utf-8") as fh:
        committed = fh.read()
    build.REGISTRY.clear()
    rendered = build.build()
    ck(rendered == committed,
       "index.html is NOT a byte-identical render of the committed data - a number was edited "
       "into the page by hand, or build.py changed without rebuilding")

    # ---- §6 every numeral in the PROSE is a figure or a declared literal -------------------
    # The stylesheet and the two charts are stripped first: their numerals are geometry and axis
    # furniture, not claims. The charts are checked against their own data just below, and the
    # byte-identical render of §5 covers the rest.
    prose = re.sub(r"<svg.*?</svg>", " ", committed, flags=re.S)
    prose = re.sub(r"<style>.*?</style>", " ", prose, flags=re.S)
    prose = re.sub(r"<!--.*?-->", " ", prose, flags=re.S)
    prose = re.sub(r"<[^>]+>", " ", prose)
    prose = (prose.replace("&minus;", "-").replace("&ndash;", " ")
             .replace("&mdash;", " ").replace("&nbsp;", " "))
    seen = set(re.findall(r"-?\d+(?:[. ]\d+)*", prose))
    allowed = set(build.REGISTRY) | build.LITERALS | {
        "0.0667", "0.0378",  # the published range section 3 quotes in order to correct it
        "0.05",              # P6's own bar, quoted from the pre-registration
        "20260907", "220129", "2026", "09", "07", "08", "11", "12", "13",
    }
    for tok in sorted(seen):
        if tok in allowed or tok.lstrip("-") in allowed:
            continue
        ck(False, f"numeral {tok!r} appears in the prose but traces to no figure and no literal")

    # the matrix chart's printed cells must be the kappas in agreement.json
    cells = re.findall(r'class="cv" text-anchor="middle">([^<]+)</text>', committed)
    ks = {f'{c["kappa"]:+.2f}' for c in ag["arms"]["uk-masked"]["pairs"].values()
          if not c["degenerate"]}
    ks.add("—")
    for c in cells:
        ck(c in ks, f"the agreement chart prints {c!r}, which is not a kappa in agreement.json")
    ck(len(cells) == 12, f"the agreement chart should print twelve cells, it prints {len(cells)}")

    # the ladder chart's plotted points must be the ladder rows
    ck(committed.count('class="gov-d"') == len(room.get("ladder", [])),
       "the ladder chart plots a different number of govdata points than the ladder has rungs")
    ck(committed.count('class="uk-d"') == len(F["s158"]["ladder"]),
       "the ladder chart plots a different number of data.gov.uk points than that ladder has rungs")

    # ---- §6b the plain-language summary carries the same numbers ---------------------------
    with open(os.path.join(HERE, "SUMMARY.md"), encoding="utf-8") as fh:
        summary = fh.read().replace("\u2212", "-")  # the summary sets a real minus sign
    for label, text in (
            ("atlas entries", f'{F["s155"]["entries"]} works'),
            ("present-key completeness", f'{F["s155"]["present_key_pct"]} %'),
            ("schema-fixed groups", f'**{F["s156"]["schema_fixed"]} use a'),
            ("2026-09-11 precision", f'Precision {F["s157"]["precision"]}'),
            ("ladder low", f'{F["s158"]["ladder_low_pct"]} % at '
                           f'{F["s158"]["ladder_low_n"]} records'),
            ("ladder high", f'{F["s158"]["ladder_high_pct"]} % at 67,205'),
            ("govdata bottom", f'**{lad[0]["not_unique_pct"]} % to '
                               f'{lad[-1]["not_unique_pct"]} %**'),
            ("govdata census", f'{room["manifest"]["harvested"]:,} records'),
            ("machine-human floor", f'**{ag["summary"]["uk-masked"]["machine_human_min"]} and '),
            ("verification note", "checks, no network"),
    ):
        ck(text in summary, f"SUMMARY.md does not carry the {label} figure as {text!r}")

    # ---- §7 house rules -------------------------------------------------------------------
    low = committed.lower()
    for vendor in ("openai", "gpt", "chatgpt", "anthropic", "claude", "gemini", "llama",
                   "copilot", "mistral"):
        ck(vendor not in low, f"the page names a tool vendor: {vendor}")
    ck("uninformative" not in low or "not a detector of uninformative" in low,
       "the page calls the screen a detector of uninformative text "
       "(STATE-OF-THE-FIELD.md §4.6, closed against us 2026-09-12)")
    ck(re.search(r"\b(und|nicht|werden|sind)\b", low) is None,
       "the page is not in English throughout (protocol §7)")

    # The summary must state this checker's own size, as the artifacts of this cycle do: a count
    # that drifts is a record that has stopped being checked. The +1 is this check itself.
    ck(f"{N[0] + 1} checks" in summary,
       f"SUMMARY.md must state the number of checks this file runs ({N[0] + 1})")

    print(f"{N[0]} checks")
    if FAIL:
        print(f"\n{len(FAIL)} FAILED:")
        for f in FAIL:
            print(f"  - {f}")
        return 1
    print("all pass")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
