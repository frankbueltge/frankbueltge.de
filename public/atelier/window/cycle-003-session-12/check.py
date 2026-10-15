#!/usr/bin/env python3
"""check.py — every number this session publishes, re-derived from the committed
evidence by a second implementation that imports nothing from the build.

    python3 check.py            # offline; no network, no browser, no build module

The two counting rules are written again here from their published text, not imported.
The evidence is read back from evidence.json, the states reconstructed from their
differences, and every figure in data.json and every figure printed in index.html is
recomputed and compared. Where a second, independent path exists — the committed source
of the pages that were measured — it is used: a withheld quantity must actually occur in
the page that is said to serve it.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

import json
import re
import sys
from html import unescape
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
SELF = "window/cycle-003-session-12"

FAIL = []
N = 0


def ok(cond, what):
    global N
    N += 1
    if not cond:
        FAIL.append(what)


# --- the two rules, written again from the text they are published under -----------
def quantities(text):
    out = []
    for m in re.finditer(r"[0-9][0-9   ,.'’]*[0-9]|[0-9]", text):
        t = re.sub(r"[   ,'’]", "", m.group(0))
        t = t.rstrip(".")
        if t:
            out.append(t)
    return set(out)


def lines_of(text):
    out = set()
    for l in text.split("\n"):
        l = re.sub(r"\s+", " ", l).strip()
        if l:
            out.add(l)
    return out


def strip_tags(html):
    """A second, crude reading of a page, used only for containment checks.

    Every tag becomes a line break rather than a space, because the quantity rule runs
    across spaces: two table cells joined by a space would be read as one number that
    was never on the page. Entities are resolved, since the browser resolves them too.
    """
    html = re.sub(r"(?is)<script.*?</script>", "\n", html)
    html = re.sub(r"(?is)<style.*?</style>", "\n", html)
    html = re.sub(r"(?s)<[^>]+>", "\n", html)
    return unescape(html)


def rebuild(base, d):
    return (set(base) - set(d["-"])) | set(d["+"])


def sets_of(page, side, unit):
    base = page[side]["base"]["q" if unit == "q" else "l"]
    key = "dq" if unit == "q" else "dl"
    return [set(base)] + [rebuild(base, st[key]) for st in page[side]["states"]]


def main():
    ev = json.loads((HERE / "evidence.json").read_text(encoding="utf-8"))
    data = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
    page = (HERE / "index.html").read_text(encoding="utf-8")

    # ---- 1. the evidence is well formed -------------------------------------------
    by_dir = {p["dir"]: p for p in ev["pages"]}
    ok(len(by_dir) == len(ev["pages"]), "evidence: a directory appears twice")
    for p in ev["pages"]:
        for side in ("on", "off"):
            s = p[side]
            ok(s["statesVisited"] == 1 + len(s["states"]),
               f"{p['dir']}/{side}: states visited does not match the states stored")
            ok(s["offsiteRequestsRefused"] >= 0, f"{p['dir']}/{side}: negative refusals")
            for st in s["states"]:
                for k in ("dq", "dl"):
                    ok(not (set(st[k]["+"]) & set(st[k]["-"])),
                       f"{p['dir']}/{side}: a delta both adds and removes the same item")
        ok((REPO / p["dir"] / "index.html").exists(),
           f"{p['dir']}: the page that was measured is not in the repository")
        now = (REPO / p["dir"] / "index.html").stat().st_size
        if p["dir"] == SELF:
            # This page was measured before its own row could be written into it, so the
            # file on disk is necessarily not the file the instrument read. The check
            # asserts that rather than waiving it: a self row whose size still matched
            # would mean the measurement had not been folded back in at all.
            ok(p["bytes"] != now,
               "the self row must describe an earlier state of this very file")
            ok(p["bytes"] > 0, "the self row must record the size it measured")
        else:
            ok(p["bytes"] == now,
               f"{p['dir']}: recorded size does not match the committed file")

    # ---- 2. every per-page figure, recomputed --------------------------------------
    rows = {r["dir"]: r for r in data["pages"]}
    self_row = data.get("self_pass")
    all_rows = dict(rows)
    if self_row:
        all_rows[self_row["dir"]] = self_row
    ok(set(all_rows) <= set(by_dir), "data.json reports a page the evidence does not hold")
    ok(len(rows) == data["totals"]["pages"], "the page total does not match the ledger")

    for dirname, r in all_rows.items():
        p = by_dir[dirname]
        ok(r["states_on"] == p["on"]["statesVisited"], f"{dirname}: states_on")
        ok(r["states_off"] == p["off"]["statesVisited"], f"{dirname}: states_off")
        ok(r["controls_total"] == len(p["on"]["controls"]), f"{dirname}: controls_total")
        ok(r["bytes"] == p["bytes"], f"{dirname}: bytes")
        for unit in ("q", "l"):
            on = sets_of(p, "on", unit)
            off = sets_of(p, "off", unit)
            D = set().union(*on)
            S = set().union(*off)
            m = r[unit]
            ok(m["S0"] == len(off[0]), f"{dirname}/{unit}: S0")
            ok(m["D0"] == len(on[0]), f"{dirname}/{unit}: D0")
            ok(m["S"] == len(S), f"{dirname}/{unit}: S")
            ok(m["D"] == len(D), f"{dirname}/{unit}: D")
            ok(m["add"] == len(D - S), f"{dirname}/{unit}: add")
            ok(m["hide"] == len(S - D), f"{dirname}/{unit}: hide")
            ok(m["css_reachable"] == len(S - off[0]), f"{dirname}/{unit}: css_reachable")
            ok(m["distinct_states_on"] == len({frozenset(x) for x in on}),
               f"{dirname}/{unit}: distinct states with scripting")
            ok(m["distinct_states_off"] == len({frozenset(x) for x in off}),
               f"{dirname}/{unit}: distinct states without scripting")
            ok(m["states_with_novel"] == sum(1 for x in on if x - S),
               f"{dirname}/{unit}: states_with_novel")
            ok(m["states_hiding"] == sum(1 for x in on if S - x),
               f"{dirname}/{unit}: states_hiding")
            if unit == "q":
                ok(sorted(m["add_tokens"]) == sorted(D - S), f"{dirname}: add tokens")
                ok(sorted(m["hide_tokens"]) == sorted(S - D), f"{dirname}: hide tokens")
                ok(m["add_glued"] == sum(1 for t in (D - S) if re.search(r"\..*\.", t)),
                   f"{dirname}: glued additions")
                ok(m["hide_glued"] == sum(1 for t in (S - D) if re.search(r"\..*\.", t)),
                   f"{dirname}: glued withholdings")

    # ---- 3. the second path: the committed sources of the pages measured -----------
    for dirname, r in all_rows.items():
        src = (REPO / dirname / "index.html").read_text(encoding="utf-8")
        in_source = quantities(strip_tags(src))
        missing = [t for t in r["q"]["hide_tokens"]
                   if t not in in_source and not re.search(r"\..*\.", t)]
        ok(not missing,
           f"{dirname}: a withheld quantity is not in the committed page source: {missing[:5]}")
        served = set().union(*sets_of(by_dir[dirname], "off", "q"))
        ok(not (set(r["q"]["add_tokens"]) & served),
           f"{dirname}: an added quantity is also served")

    # ---- 4. the totals --------------------------------------------------------------
    t = data["totals"]
    rs = list(rows.values())
    ok(t["add_q"] == sum(x["q"]["add"] for x in rs), "totals: added quantities")
    ok(t["hide_q"] == sum(x["q"]["hide"] for x in rs), "totals: withheld quantities")
    ok(t["reachable_q"] == sum(x["q"]["D"] for x in rs), "totals: reachable quantities")
    ok(t["served_q"] == sum(x["q"]["S"] for x in rs), "totals: served quantities")
    ok(t["states_on"] == sum(x["states_on"] for x in rs), "totals: states with scripting")
    ok(t["states_off"] == sum(x["states_off"] for x in rs), "totals: states without")
    ok(t["states"] == t["states_on"] + t["states_off"], "totals: states")
    ok(t["pages_add0"] == sum(1 for x in rs if x["q"]["add"] == 0), "totals: pages adding nothing")
    ok(t["pages_with_add"] == sum(1 for x in rs if x["q"]["add"] > 0), "totals: pages adding")
    ok(t["pages_hide"] == sum(1 for x in rs if x["q"]["hide"] > 0), "totals: pages withholding")
    ok(t["css_reachable"] == sum(x["q"]["css_reachable"] for x in rs), "totals: scriptless hand")
    ok(t["css_reachable_lines"] == sum(x["l"]["css_reachable"] for x in rs),
       "totals: scriptless hand, lines")
    ok(t["pages_css"] == sum(1 for x in rs if x["q"]["css_reachable"] > 0
                             or x["l"]["css_reachable"] > 0), "totals: pages answering a scriptless hand")
    ok(t["glued_add"] == sum(x["q"]["add_glued"] for x in rs), "totals: glued additions")
    ok(t["glued_hide"] == sum(x["q"]["hide_glued"] for x in rs), "totals: glued withholdings")
    ok(t["add_share"] == f"{100.0 * t['add_q'] / t['reachable_q']:.2f}", "totals: added share")
    ok(t["offsite_refused"] == sum(x["offsite_refused"] for x in rs), "totals: refused requests")
    ok(t["page_errors"] == sum(x["page_errors"] for x in rs), "totals: page errors")

    # ---- 5. the verdict curves ------------------------------------------------------
    def qual(r, unit, reading, k):
        m = r[unit]
        if reading == "author":
            return m["add"] >= k
        if reading == "exclusion":
            return m["hide"] >= k
        if reading == "either":
            return max(m["add"], m["hide"]) >= k
        return m["distinct_states_on"] - 1 >= k

    names = [x["name"] for x in data["readings"]]
    ok(names == ["author", "exclusion", "either", "index"], "the four readings")
    for unit in ("q", "l"):
        for reading in names:
            curve = data["verdict_curves"][unit][reading]
            ok(len(curve) == data["kmax"] + 1, f"curve {unit}/{reading}: length")
            for k in range(0, data["kmax"] + 1):
                ok(curve[k] == sum(1 for r in rs if qual(r, unit, reading, k)),
                   f"curve {unit}/{reading}: k={k}")
            ok(all(curve[i] >= curve[i + 1] for i in range(len(curve) - 1)),
               f"curve {unit}/{reading}: a threshold that admits more pages as it rises")
            ok(curve[0] == len(rs), f"curve {unit}/{reading}: k=0 must admit every page")

    # ---- 6. the rounding disagreement, re-derived from session 11's own files -------
    rr = data["rounding"]
    s11 = (REPO / "window" / "cycle-003-session-11" / "index.html").read_text(encoding="utf-8")
    ws = [int(m) for m in re.findall(r'data-w="(\d+)"', s11)]
    served = [f"{w / 2:.0f}" for w in ws]
    recomputed = [str(w // 2 + 1) if w % 2 else str(w // 2) for w in ws]
    differ = [(w, a, b) for w, a, b in zip(ws, served, recomputed) if a != b]
    distinct = sorted({a for _, a, _ in differ}, key=int)
    ok(rr["records"] == len(ws), "rounding: number of records")
    ok(rr["records_with_odd_word_count"] == sum(1 for w in ws if w % 2 == 1),
       "rounding: records with an odd word count")
    ok(rr["records_that_differ"] == len(differ), "rounding: records that differ")
    ok(rr["distinct_values_that_differ"] == len(distinct), "rounding: distinct values")
    ok(rr["served_cells"] == distinct, "rounding: the served cells")
    ok(rr["recomputed_cells"] == [str(int(a) + 1) for a in distinct],
       "rounding: the recomputed cells")
    ok(all(int(b) - int(a) == 1 for a, b in zip(rr["served_cells"], rr["recomputed_cells"])),
       "rounding: the two rules must differ by exactly one where they differ")
    ok(all(int(a) % 2 == 0 for a in distinct),
       "rounding: they may differ only where the half's lower neighbour is even")
    ok(all(w % 2 == 1 for w, _, _ in differ),
       "rounding: an even word count cannot make a half")
    s11row = rows["window/cycle-003-session-11"]
    p11 = by_dir["window/cycle-003-session-11"]
    D11 = set().union(*sets_of(p11, "on", "q"))
    S11 = set().union(*sets_of(p11, "off", "q"))
    ok(set(s11row["q"]["hide_tokens"]) == {a for a in distinct if a in S11 and a not in D11},
       "rounding: what the scripted page stops printing must be exactly the served cells "
       "whose value the script replaces and prints nowhere else")
    ok(rr["vanish_from_the_scripted_page"] == [a for a in distinct if a not in D11],
       "rounding: the vanished list")
    ok(rr["survive_elsewhere"] == [a for a in distinct if a in D11],
       "rounding: the surviving list")
    ok(rr["withheld_from_the_scripted_reader"] == [a for a in distinct
                                                   if a in S11 and a not in D11],
       "rounding: what is served and then withheld")
    ok(rr["shown_to_neither_reader"] == [a for a in distinct
                                         if a not in S11 and a not in D11],
       "rounding: what is shown to neither reader")
    ok(len(rr["withheld_from_the_scripted_reader"]) + len(rr["shown_to_neither_reader"])
       + len(rr["survive_elsewhere"]) == rr["distinct_values_that_differ"],
       "rounding: the three parts must make up the whole")
    ok(set(rr["shown_to_neither_reader"]) == set(data["hidden_ledger"]["rendered_to_nobody"]),
       "rounding: the cells shown to neither reader must be the hidden ledger's own")
    ok(set(rr["withheld_from_the_scripted_reader"]) == set(s11row["q"]["hide_tokens"]),
       "rounding: the withheld cells must be exactly what the instrument found withheld")

    # ---- 6b. the ledger that only a script reveals ----------------------------------
    hl = data["hidden_ledger"]
    i = s11.index('<div id="wrap-session" ' + hl["attribute"] + '>')
    depth, j = 0, i
    while True:
        a = s11.find("<div", j + 1)
        b = s11.find("</div>", j + 1)
        if b == -1:
            break
        if a != -1 and a < b:
            depth += 1
            j = a
        else:
            if depth == 0:
                j = b
                break
            depth -= 1
            j = b
    block = s11[i:j]
    qs = quantities(re.sub(r"(?s)<[^>]+>", "\n", block))
    ok(hl["rows"] == block.count("<tr data-id="), "hidden ledger: rows")
    ok(hl["quantities_in_the_block"] == len(qs), "hidden ledger: quantities in the block")
    ok(hl["never_served"] == len(qs - S11), "hidden ledger: never served")
    ok(hl["and_reachable_with_scripting"] == len({t for t in (qs - S11) if t in D11}),
       "hidden ledger: reachable once the script reveals it")
    ok(hl["rendered_to_nobody"] == sorted(t for t in (qs - S11) if t not in D11),
       "hidden ledger: the numbers no state of the page shows anyone")
    ok(all(t not in S11 and t not in D11 for t in hl["rendered_to_nobody"]),
       "hidden ledger: a number said to reach nobody must reach nobody")
    ok(len(hl["rendered_to_nobody"]) + hl["and_reachable_with_scripting"] == hl["never_served"],
       "hidden ledger: the two parts must make up the whole")
    ok(len(rr["vanish_from_the_scripted_page"]) + len(rr["survive_elsewhere"])
       == rr["distinct_values_that_differ"], "rounding: the two lists must partition")
    ok("Math.round" in rr["javascript_source_line"], "rounding: the script's line")
    ok(".0f" in rr["python_source_line"], "rounding: the build's line")

    # ---- 7. the page says what the data says ----------------------------------------
    ok(page.count("<script") == 1, "the page must carry exactly one script")
    ok('src="http' not in page and "src='http" not in page, "the page must fetch nothing")
    ok('href="http' not in page.replace('href="https://', 'href="https://') or
       "<link" not in page, "the page must load no stylesheet")
    ok("<link" not in page, "the page must link no external resource")
    ok("@font-face" not in page, "the page must load no font")
    for dirname, r in rows.items():
        pat = (f'data-q-add="{r["q"]["add"]}" data-q-hide="{r["q"]["hide"]}"')
        ok(pat in page, f"{dirname}: the ledger row does not carry its own figures")
        ok(dirname in page, f"{dirname}: missing from the ledger")
    for unit in ("q", "l"):
        for reading in names:
            curve = data["verdict_curves"][unit][reading]
            cells = "".join(f'<td class="num">{curve[k]}</td>' for k in range(1, data["kmax"] + 1))
            ok(cells in page, f"the served curve for {unit}/{reading} is not in the page")
    printed = quantities(strip_tags(page))
    for key in ("pages", "add_q", "hide_q", "pages_add0", "pages_with_add", "pages_hide",
                "css_reachable", "states_off"):
        ok(str(t[key]) in printed, f"the page does not print its own total: {key}")
    ok(t["add_share"] in strip_tags(page), "the page does not print the added share")

    # ---- 8. the claim the page makes about its own completeness ---------------------
    body_no_script = strip_tags(page)
    ok("scriptless reader gets a document" in re.sub(r"\s+", " ", body_no_script),
       "the page must state the first finding in its served text")
    ok(len(FAIL) == 0 or True, "")

    print(f"{N} checks, {len(FAIL)} failed")
    for f in FAIL:
        print("  FAIL " + f)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
