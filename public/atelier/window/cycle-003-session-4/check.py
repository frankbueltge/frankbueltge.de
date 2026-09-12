#!/usr/bin/env python3
"""check.py — the page must state what the record says, and nothing else.

Run:  python3 window/cycle-003-session-4/check.py [--local FEED]

Four kinds of check, and the order is the order in which this practice has been caught:

1. **Byte identity.** `data.json` and `index.html` are re-derived from `oeuvre.json` and must
   come out byte-identical to what is committed. On 2026-09-09 a substring check passed a page
   in which a published number had been mutated, because the old string still occurred
   somewhere else on the page; since then nothing is checked by *containment* that can be
   checked by *identity*.
2. **Recomputation.** Every number in `data.json` is recomputed from the raw probe through
   `tools/second/shelf.py` and compared. The probe is the evidence; the record is a function
   of it, and if the function has drifted this fails.
3. **Invariants that cannot hold by accident** — a count and its parts, a share inside its own
   assumption-free interval, a wide measure never below the narrow one it contains, and above
   all: an unanswered query never appearing anywhere as a zero.
4. **The page's own floor** — the still frame draws every arm and every row without a script,
   the controls are not offered without one, the file asks the network for nothing, and the
   still frame and the script group digits with the same codepoint. That last one is here
   because on 2026-09-11 they did not, and the only thing that noticed was a check that could
   then never pass.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "second"))
sys.path.insert(0, str(HERE))

import build as B  # noqa: E402
import shelf as SH  # noqa: E402

THIN = " "

fails: list[str] = []
n_checks = 0


def ok(cond, what: str) -> None:
    global n_checks
    n_checks += 1
    if not cond:
        fails.append(what)


def eq(a, b, what: str) -> None:
    ok(a == b, f"{what}: {a!r} != {b!r}")


def close(a, b, what: str, tol: float = 1e-12) -> None:
    if a is None or b is None:
        ok(a is None and b is None, f"{what}: {a!r} vs {b!r}")
        return
    ok(abs(a - b) <= tol, f"{what}: {a!r} vs {b!r}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--local", default=None)
    args = ap.parse_args()

    D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
    page = (HERE / "index.html").read_text(encoding="utf-8")
    probe = json.loads((HERE / "oeuvre.json").read_text(encoding="utf-8"))
    M = D["meta"]

    # ---------------------------------------------------------- 1. byte identity
    feed, sha = B.read_feed(pathlib.Path(args.local) if args.local else None)
    eq(sha, M["feed_sha256"], "the feed served now is the feed the page was built from")
    eq(sha, B.ATLAS_SHA_SINCE_2026_09_03, "the feed digest is the one held since 09-03")
    eq(len(feed["entries"]), M["entries"], "entry count")

    D2 = B.build_data(feed, sha, probe)
    D2["arm_rows"] = B.arm_rows(probe)
    data_txt = json.dumps(D2, indent=1, ensure_ascii=False, sort_keys=True) + "\n"
    eq(data_txt, (HERE / "data.json").read_text(encoding="utf-8"),
       "data.json rebuilds byte-identical")
    eq(B.render(D2), page, "index.html rebuilds byte-identical from data.json's own record")
    # …and a mutated record must not rebuild to the committed page. A checker that cannot
    # fail is not a checker; this is the 2026-09-09 lesson wired in as a positive control.
    mutant = json.loads(json.dumps(D2))
    mutant["whole_arm"][B.PRIMARY]["atlas"]["empty"] += 1
    ok(B.render(mutant) != page, "a mutated headline count does NOT rebuild the page")

    # ---------------------------------------------------------- 2. recomputation
    m = SH.measure(probe)
    eq(len(m["atlas_rows"]), M["artist_items"], "one row per distinct artist item")
    eq(M["artist_items"], len({a["qid"] for a in probe["atlas_artists"]}),
       "the artist items are the distinct resolutions of the artist strings")
    eq(M["artist_strings"], len(probe["atlas_artists"]), "artist strings carried forward")
    ok(M["artist_items"] <= M["artist_strings"],
       "distinct items cannot exceed the strings that resolved to them")

    for key in ("any_works", "creator_works"):
        for arm, p in m["profiles"][key].items():
            for field in ("n", "asked", "unasked", "empty", "held", "works_total"):
                eq(D["profiles"][key][arm][field], p[field], f"profile {key}/{arm}/{field}")
            for field in ("share_empty", "empty_lo", "empty_hi"):
                close(D["profiles"][key][arm][field], p[field], f"profile {key}/{arm}/{field}")
        for arm, p in m["whole_arm"][key].items():
            for field in ("n", "asked", "unasked", "empty", "held", "no_birth"):
                eq(D["whole_arm"][key][arm][field], p[field], f"whole {key}/{arm}/{field}")

    # ---------------------------------------------------------- 3. invariants
    all_profiles = [(f"{k}/{a}", p) for k in ("any_works", "creator_works")
                    for a, p in list(D["profiles"][k].items()) + list(D["whole_arm"][k].items())]
    for name, p in all_profiles:
        eq(p["n"], p["asked"] + p["unasked"], f"{name}: n is asked plus unasked")
        eq(p["asked"], p["empty"] + p["held"], f"{name}: asked is empty plus held")
        if p["asked"]:
            close(p["share_empty"], p["empty"] / p["asked"], f"{name}: share over asked")
        if p["n"]:
            close(p["empty_lo"], p["empty"] / p["n"], f"{name}: floor over the whole arm")
            close(p["empty_hi"], (p["empty"] + p["unasked"]) / p["n"], f"{name}: ceiling")
            ok(p["empty_lo"] <= (p["share_empty"] or 0) + 1e-12 <= p["empty_hi"] + 1e-12,
               f"{name}: the share lies inside its own assumption-free interval")
            ok(0.0 <= p["empty_lo"] <= 1.0 and 0.0 <= p["empty_hi"] <= 1.0,
               f"{name}: the interval is a pair of shares")

    # The wide measure contains the narrow one, so it can never call more people empty.
    for arm in D["profiles"]["any_works"]:  # the wide measure, arm by arm
        a = D["profiles"]["any_works"][arm]
        c = D["profiles"]["creator_works"][arm]
        ok(a["empty"] <= c["empty"],
           f"{arm}: the union of six making properties cannot empty more people than creator "
           f"alone ({a['empty']} > {c['empty']})")

    unions = probe.get("union_zeros") or {}
    for r in m["atlas_rows"]:
        q = r["qid"]
        cr, an = r["creator_works"], r["any_works"]
        ok(q in probe["atlas_entities"] or q in unions or cr is None,
           f"{q}: the row stands on something the record actually returned")
        if cr is None:
            ok(an is None, f"{q}: an unanswered creator count is never published as a number")
        elif cr == 0:
            ok(an is None or an >= 0, f"{q}: the union is a count or unasked")
            ok(q in unions, f"{q}: every zero was asked again against every making property")
        else:
            eq(an, cr, f"{q}: a person with work keeps the count the record gave")
        if an is not None and cr is not None:
            ok(an >= cr, f"{q}: the union cannot be below the creator count")
        ok(r["atlas_works"] >= 1, f"{q}: every row is in the first record by construction")

    # Nowhere in the published record may an unanswered query appear as a zero.
    unasked_qids = {q for q, v in probe["atlas_oeuvre"].items() if v is None
                    and (unions.get(q) is None)}
    for q in unasked_qids:
        row = next((r for r in D["rows"] if r["qid"] == q), None)
        ok(row is not None and row["any_works"] is None,
           f"{q}: refused by the record, so it must be published as unasked")

    # The first record's side of every row, counted from the live feed and not from the probe.
    by_artist: dict[str, int] = {}
    for e in feed["entries"]:
        by_artist[e.get("artist") or ""] = by_artist.get(e.get("artist") or "", 0) + 1
    qid_strings: dict[str, list[str]] = {}
    for a in probe["atlas_artists"]:
        qid_strings.setdefault(a["qid"], []).append(a["artist"])
    for r in D["rows"]:
        want = sum(by_artist.get(s, 0) for s in qid_strings.get(r["qid"], []))
        eq(r["atlas_works"], want, f"{r['qid']}: entries in the first record")
    eq(D["totals"]["atlas_works_in_first_record"], sum(r["atlas_works"] for r in D["rows"]),
       "the first record's total is the sum of its rows")
    eq(D["totals"]["atlas_works_in_second_record"],
       sum(r["any_works"] for r in D["rows"] if r["any_works"]),
       "the second record's total is the sum of its rows")
    # The finding's direction, on the measure the page leads with: the second record names
    # these people the creator of far less than the first record holds by them. On the WIDE
    # measure the inequality reverses, which is the session's second finding, so both are
    # asserted here rather than the convenient one.
    ok(D["wide"]["credits_creator"] < D["totals"]["atlas_works_in_first_record"],
       "artworks in the second record are fewer than entries in the first")
    ok(D["wide"]["credits_any"] > D["wide"]["credits_creator"],
       "the wide measure credits more than the artwork measure")
    eq(D["totals"]["atlas_works_in_second_record"], D["wide"]["credits_any"],
       "the second record's total is the wide count")
    eq(D["wide"]["credits_creator"],
       sum(r["creator_works"] for r in D["rows"] if r["creator_works"]),
       "the artwork count is the sum of its rows")

    # The decade table, recomputed one decade at a time from the rows themselves.
    for d in D["by_decade"]:
        lo, hi = d["decade"], d["decade"] + 9
        a_rows = [r for r in m["atlas_rows"]
                  if r["birth"] is not None and lo <= r["birth"] <= hi]
        eq(d["atlas"]["n"], len(a_rows), f"{lo}s: atlas people")
        empt = sum(1 for r in a_rows if r[B.PRIMARY] == 0)
        eq(d["atlas"]["empty"], empt, f"{lo}s: atlas people with nothing credited")
        ctrl_rows = [r for cq in m["controls"] for r in m["controls"][cq]["rows"]
                     if r["birth"] is not None and lo <= r["birth"] <= hi]
        eq(d["control"]["n"], len(ctrl_rows), f"{lo}s: control people")
        s = d["survives"]
        if s.get("survives") is not None:
            eq(s["survives"], d["atlas"]["empty_lo"] > d["control"]["empty_hi"],
               f"{lo}s: the survival verdict is its own arithmetic")
    summ = D["by_decade_summary"]
    eq(summ["decades_with_both"], len([d for d in D["by_decade"]
                                       if d["atlas"]["asked"] and d["control"]["asked"]]),
       "decades where both arms answered")
    eq(summ["atlas_emptier"], len([d for d in D["by_decade"]
                                   if d["atlas"]["asked"] and d["control"]["asked"]
                                   and d["atlas"]["share_empty"] > d["control"]["share_empty"]]),
       "decades where the atlas arm is emptier")
    eq(summ["survives"], len([d for d in D["by_decade"] if d["survives"].get("survives")]),
       "decades where the claim survives its worst case")

    # Every survival verdict is the inequality it claims to be, and nothing else.
    for c in D["comparisons"]:
        for key in ("any_works", "creator_works"):
            s = c[key]
            if s.get("survives") is None:
                continue
            a = D["profiles"][key]["atlas"]
            b = D["profiles"][key][c["arm"]]
            close(s["a_floor"], a["empty_lo"], f"{c['arm']}/{key}: floor is the atlas floor")
            close(s["b_ceiling"], b["empty_hi"], f"{c['arm']}/{key}: ceiling is the control's")
            eq(s["survives"], a["empty_lo"] > b["empty_hi"],
               f"{c['arm']}/{key}: the verdict is the inequality")
            close(s["gap"], a["empty_lo"] - b["empty_hi"], f"{c['arm']}/{key}: the gap")

    # The decade-matched control is matched: its weights are the atlas arm's own decades.
    for cq, mm in m["matched"].items():
        w = mm["weights"] or {}
        want = {}
        lo, hi = D["birth_window"]["lo"], D["birth_window"]["hi"]
        for r in m["atlas_rows"]:
            if r["birth"] is not None and lo <= r["birth"] <= hi:
                k = str((r["birth"] // 10) * 10)
                want[k] = want.get(k, 0) + 1
        eq(w, want, f"{cq}: the matching weights are read off the atlas arm")
        for r in mm["rows"]:
            ok(r["birth"] is not None and lo <= r["birth"] <= hi,
               f"{cq}/{r['qid']}: every matched control person is inside the window")

    # The atlas arm's claim must lie outside the RANGE of its controls, not merely below
    # their average — the test this practice failed against itself on 2026-09-07.
    shares = D["control_shares"]
    if shares:
        eq(D["atlas_outside_control_range"],
           D["profiles"]["any_works"]["atlas"]["share_empty"] > max(shares),
           "the outside-the-range verdict is its own comparison")
        eq(len(shares), len(m["matched"]), "one control share per decade-matched arm")

    # The era table: two draws of one form, differing only in the generation they stand on.
    eq(len(D["era"]), len(M["control_forms"]), "every control form appears in the era table")
    for e in D["era"]:
        eq(e["range"]["asked"], D["profiles"][B.PRIMARY]["range:" + e["form"]]["asked"],
           f"{e['form']}: the range draw's own count")
        eq(e["matched"]["asked"], D["profiles"][B.PRIMARY]["matched:" + e["form"]]["asked"],
           f"{e['form']}: the matched draw's own count")
        ok(e["population"] is None or e["population"] > e["range"]["asked"],
           f"{e['form']}: the draw is a sample of a larger population")
        for which in ("range", "matched"):
            b = e[which]["birth_median"]
            ok(b is None or 1800 < b < 2030, f"{e['form']}/{which}: a plausible median birth")

    # The page's prose and the page's verdict must not disagree. A page that computes a
    # withdrawal and then states a finding is the failure this check exists for.
    if not D["atlas_outside_control_range"]:
        ok("withdrawn" in page,
           "the page says its claim is withdrawn, because its own test withdrew it")
        ok("inside</b> that\nspread" in page or "<b>inside</b>" in page,
           "the page states that the atlas arm sits inside the controls' spread")
        ok("one</b> record" in page or "One record is all this says" in page,
           "the page states that its replacement claim rests on a single record")
    else:
        ok("the claim stands" in page, "the page says its claim stands")

    # ---------------------------------------------------------- 4. the page's floor
    eq(page.count("<!doctype html>"), 1, "one document")
    ok(page.rstrip().endswith("</html>"), "the document is closed")
    for forbidden in ("<script src=", "<link ", "<img ", "@import", "XMLHttpRequest",
                      "fetch(", "new Image", "<iframe", "srcset"):
        ok(forbidden not in page, f"the page does not reach the network: {forbidden!r}")
    ok('id="controls" class="hid"' in page,
       "the controls are not offered to a reader without a script")
    ok('type="application/json" id="D"' in page, "the page carries its own record")

    # The still frame draws every arm and every row before a script runs.
    svgs = re.findall(r"<svg\b.*?</svg>", page, re.S)
    eq(len(svgs), 3, "three figures are served drawn")
    bars_fig = svgs[0]
    drawn = len(re.findall(r'<rect class="bar ', bars_fig))
    eq(drawn, len([b for b in D["bars_matched"] if b["share_empty"] is not None]),
       "the still bar figure draws one bar per arm")
    eq(len(re.findall(r'<text class="lab"', bars_fig)), len(D["bars_matched"]),
       "the still bar figure labels every arm")
    shelf_fig = svgs[2]
    marks = (len(re.findall(r'<rect class="bar held"', shelf_fig))
             + len(re.findall(r'<rect class="nothing"', shelf_fig))
             + len(re.findall(r'<rect class="unasked"', shelf_fig)))
    eq(marks, len(D["rows"]), "the shelf figure gives every person a mark on the right")
    eq(len(re.findall(r'<rect class="bar atlas"', shelf_fig)),
       len([r for r in D["rows"] if r["atlas_works"]]),
       "the shelf figure gives every person their first-record entries on the left")
    # Table rows, each table complete.
    bodies = re.findall(r"<tbody>(.*?)</tbody>", page, re.S)
    counts = [b.count("<tr>") for b in bodies]
    ok(len(D["rows"]) in counts, "the per-person table lists every person")
    ok(len(D["held_rows"]) in counts, "the held table lists every person with work")
    ok(len(D["by_decade"]) in counts, "the decade table lists every decade")
    ok(len(D["dates"]["paired"]) in counts, "the dates table lists every pair it holds")
    ok(len(D["occupations"]) in counts, "the occupation table lists what it says it lists")
    ok(len(D["richness"]) in counts, "the richness table lists every arm")

    # Digit grouping: one codepoint, named in both places, and identical in both.
    ok('var THIN = "\\u2009";' in page, "the script names the grouping codepoint as an escape")
    eq(D["questions"]["total"], sum(D["questions"]["parts"].values()),
       "the question count is the sum of its parts")
    ok(D["questions"]["total"] >= len(D["rows"]),
       "the record was asked at least once per person")
    ok(D["questions"]["unanswered"] >= D["whole_arm"]["any_works"]["atlas"]["unasked"],
       "the unanswered total covers the arm's own unasked people")
    for value in (D["questions"]["total"],
                  D["totals"]["atlas_works_in_first_record"],
                  D["totals"]["atlas_works_in_second_record"]):
        if value >= 1000:
            grouped = f"{value:,}".replace(",", THIN)
            ok(grouped in page, f"{value} is grouped with the thin space, as {grouped!r}")
            ok(f"{value:,}" not in page, f"{value} is not also grouped with a comma")
            ok(f"{value // 1000} {value % 1000:03d}" not in page,
               f"{value} is not grouped with an ordinary space")
    # No published percentage may be a bare float: every one carries its own sign.
    pcts = re.findall(r"\d+\.\d %", page)
    ok(len(pcts) >= 8, f"the page states its shares as percentages (saw {len(pcts)})")

    # The headline numbers are on the page, in the form the record gives them.
    whole = D["whole_arm"][B.PRIMARY]["atlas"]
    ok(str(whole["empty"]) in page, "the headline count is on the page")
    ok(B.pct(whole["share_empty"]) in page, "the headline share is on the page")
    for b in D["bars_matched"]:
        if b["share_empty"] is not None:
            ok(B.pct(b["share_empty"]) in page, f"{b['arm']}: its share is on the page")

    # Provenance the page must carry, because a number without it is not evidence.
    for needed in (M["feed_url"], M["feed_sha256"][:16], M["second_record"]["api"],
                   M["probed_at_utc"], M["prior_probe"], "tools/second/oeuvre.py",
                   "tools/second/shelf.py"):
        ok(needed in page, f"provenance on the page: {needed}")
    ok("No model wrote a number" in page, "the page says who did not write it")
    ok("would kill" in page, "the page names its own refutation condition")
    eq(M["route"]["sparql_used"], False, "the query service was not asked")

    # The atlas year parser, which reads a free-text field, on the feed's own strings.
    for e in feed["entries"]:
        y = SH.atlas_year(e.get("year"))
        ok(y is None or 1800 <= y <= 2100,
           f"atlas year {e.get('year')!r} parses to a plausible year or to nothing")

    print(f"{n_checks} checks, {len(fails)} failed")
    for f in fails[:40]:
        print("  FAIL " + f)
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
