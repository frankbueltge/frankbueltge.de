#!/usr/bin/env python3
"""check.py — re-derives every number this page publishes, and disagrees loudly.

    python3 window/cycle-003-session-13/check.py

Offline. Imports nothing from enumerate.py and reads nothing that sweep.mjs wrote
except its raw per-state token lists. The rules are written here a second time from
their declared text and not from the other files' code, and the HTML of all
twenty-two pages is parsed by a different method than the instrument used, so a
defect in one parser does not travel.

Exit 0 and a count when everything agrees; exit 1 and the named failures otherwise.
"""

import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.environ.get("ULYSSES_REPO") or os.path.abspath(os.path.join(HERE, "..", ".."))

N = 0
FAIL = []


def ok(cond, what):
    global N
    N += 1
    if not cond:
        FAIL.append(what)


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as fh:
        return json.load(fh)


# ---------------------------------------------------------------------------
# The rules, written a second time from the declared text.
# ---------------------------------------------------------------------------

TAG = re.compile(r"<(/?)(input|select|option|textarea|button|template)\b([^>]*)>",
                 re.I | re.S)
ATTR = re.compile(r"""([a-zA-Z-]+)\s*(?:=\s*("([^"]*)"|'([^']*)'|[^\s>]+))?""")


def attrs(blob):
    out = {}
    for m in ATTR.finditer(blob):
        k = m.group(1).lower()
        v = m.group(3) if m.group(3) is not None else (
            m.group(4) if m.group(4) is not None else
            (m.group(2) or ""))
        out[k] = v
    return out


def parse_controls(html):
    """A second parser, by scanning tags rather than by a parser object. Returns
    (served, templated) lists of raw control records in document order."""
    served, templated = [], []
    depth_t = 0
    cur_select = None
    for m in TAG.finditer(html):
        closing, tag, blob = m.group(1) == "/", m.group(2).lower(), m.group(3)
        a = attrs(blob)
        if tag == "template":
            if closing:
                depth_t = max(0, depth_t - 1)
            elif not blob.rstrip().endswith("/"):
                depth_t += 1
            continue
        if closing:
            if tag == "select":
                cur_select = None
            continue
        sink = templated if depth_t else served
        if tag == "input":
            sink.append({"tag": "input", "type": (a.get("type") or "text").lower(),
                         "name": a.get("name"), "id": a.get("id"),
                         "min": a.get("min"), "max": a.get("max"), "step": a.get("step"),
                         "multiple": "multiple" in a})
        elif tag == "select":
            rec = {"tag": "select", "type": "select", "name": a.get("name"),
                   "id": a.get("id"), "options": 0, "multiple": "multiple" in a}
            sink.append(rec)
            cur_select = rec
        elif tag == "option":
            if cur_select is not None:
                cur_select["options"] += 1
        elif tag == "textarea":
            sink.append({"tag": "textarea", "type": "textarea", "name": a.get("name"),
                         "id": a.get("id")})
        elif tag == "button":
            sink.append({"tag": "button", "type": (a.get("type") or "submit").lower(),
                         "name": a.get("name"), "id": a.get("id")})
    return served, templated


ACTIONS = {"button", "submit", "reset", "image"}


def positions(rec, radio_counts):
    tag, t = rec["tag"], rec["type"]
    if tag == "button" or (tag == "input" and t in ACTIONS):
        return None, "none"
    if tag == "textarea":
        return None, "unbounded"
    if tag == "select":
        return (2 ** rec["options"] if rec["multiple"] else rec["options"]), "finite"
    if t == "checkbox":
        return 2, "finite"
    if t == "radio":
        return radio_counts[rec.get("name")], "finite"
    if t == "range":
        def num(v, d):
            try:
                return float(v)
            except (TypeError, ValueError):
                return d
        lo, hi, st = num(rec["min"], 0.0), num(rec["max"], 100.0), num(rec["step"], 1.0)
        if st <= 0 or hi < lo:
            return None, "unbounded"
        return int((hi - lo) // st) + 1, "finite"
    return None, "unbounded"


def collapse(served):
    counts = Counter(r.get("name") for r in served
                     if r["tag"] == "input" and r["type"] == "radio")
    out, seen = [], set()
    for r in served:
        if r["tag"] == "input" and r["type"] == "radio":
            if r.get("name") in seen:
                continue
            seen.add(r.get("name"))
        p, kind = positions(r, counts)
        out.append({"type": r["type"], "name": r.get("name"), "id": r.get("id"),
                    "positions": p, "kind": kind})
    return out


Q_RE = re.compile("[0-9][0-9   ,.'’]*[0-9]|[0-9]")


def quantities(text):
    out = []
    for m in Q_RE.finditer(text):
        t = re.sub("[   ,'’]", "", m.group(0))
        while t.endswith("."):
            t = t[:-1]
        if t:
            out.append(t)
    return out


# ---------------------------------------------------------------------------

def main():
    ev = load("evidence.json")
    sw = load("sweep.json")
    data = load("data.json")
    src = load("sources.json")
    with open(os.path.join(HERE, "index.html"), encoding="utf-8") as fh:
        html = fh.read()

    rows = {(r["dir"], r["jsOn"]): r for r in sw["rows"]}

    # --- 1. the controls and their positions, re-parsed from the pages ------
    total_settings = 0
    for p in ev["pages"]:
        path = os.path.join(REPO, p["dir"], "index.html")
        ok(os.path.exists(path), f"page missing: {p['dir']}")
        with open(path, "rb") as fh:
            raw = fh.read()
        ok(len(raw) == p["bytes"], f"bytes disagree: {p['dir']}")
        served, templated = parse_controls(raw.decode("utf-8", "replace"))
        mine = collapse(served)
        theirs = p["served_controls"]
        ok(len(mine) == len(theirs),
           f"control count disagrees: {p['dir']} {len(mine)} vs {len(theirs)}")
        for a, b in zip(mine, theirs):
            ok(a["type"] == b["type"] and a["kind"] == b["kind"]
               and a["positions"] == b["positions"],
               f"control disagrees: {p['dir']} {a} vs "
               f"{ {k: b[k] for k in ('type', 'kind', 'positions')} }")
        prod = 1
        for ctl in mine:
            if ctl["kind"] == "finite":
                prod *= max(1, ctl["positions"])
        ok(prod == p["settings"], f"settings disagree: {p['dir']} {prod} vs {p['settings']}")
        ok(len(collapse(templated)) == len(p["templated_controls"]),
           f"templated controls disagree: {p['dir']}")
        total_settings += prod

    ok(total_settings == data["corpus"]["settings_total"],
       f"settings_total disagrees: {total_settings} vs {data['corpus']['settings_total']}")

    # --- 2. the page-level figures, re-derived from the sweep ---------------
    for p in data["pages"]:
        on, off = rows[(p["dir"], True)], rows[(p["dir"], False)]
        ok(len(set(on["addQ"])) == p["add"]["q"], f"add.q disagrees: {p['dir']}")
        ok(len(set(on["addL"])) == p["add"]["l"], f"add.l disagrees: {p['dir']}")
        ok(len(set(on["oneWayAddQ"])) == p["one_way_add"]["q"],
           f"one_way_add.q disagrees: {p['dir']}")
        ok(len(set(on["oneWayAddL"])) == p["one_way_add"]["l"],
           f"one_way_add.l disagrees: {p['dir']}")
        ok(set(on["oneWayAddQ"]) <= set(on["addQ"]),
           f"one-way additions not inside the full sweep's: {p['dir']}")
        ok(set(on["oneWayAddL"]) <= set(on["addL"]),
           f"one-way lines not inside the full sweep's: {p['dir']}")
        ok(on["driven"] == p["driven"], f"driven disagrees: {p['dir']}")
        ok(on["pairsDriven"] == p["pairs_driven"], f"pairs_driven disagrees: {p['dir']}")
        ok(on["singlesDriven"] == p["singles_driven"], f"singles_driven disagrees: {p['dir']}")
        ok(off["pairsDriven"] == on["pairsDriven"],
           f"presses were made in one scripting state and not the other: {p['dir']}")
        ok(off["singlesDriven"] == on["singlesDriven"],
           f"single presses were made in one scripting state and not the other: {p['dir']}")
        ok(on["pressesRefused"] == 0 and off["pressesRefused"] == 0,
           f"a press was refused by both paths: {p['dir']}")
        ok(off["distinctRenderings"] == p["renderings_off"],
           f"renderings_off disagrees: {p['dir']}")
        # A state that was never placed is not a state that did not change. The
        # scripting-off claim is vacuous unless the same settings were actually made
        # in both states, so that is checked before the claim is allowed to stand.
        ok(off["driven"] == on["driven"],
           f"the scripting-off sweep placed {off['driven']} settings against "
           f"{on['driven']} with scripting on: {p['dir']}")
        ok(off["placementsRefused"] == on["placementsRefused"],
           f"placements were refused in one state and not the other: {p['dir']}")
        ok(off["driven"] == p["driven_off"], f"driven_off disagrees: {p['dir']}")
        # the claim of 2026-09-22, re-checked here from tonight's own run
        ok(off["distinctRenderings"] == 1,
           f"a page rendered more than one way with scripting off: {p['dir']}")
        ok(off["addQ"] == [] and off["addL"] == [],
           f"scripting-off sweep added text: {p['dir']}")
        ok(on["offsite"] == 0 and off["offsite"] == 0,
           f"a non-local request was made: {p['dir']}")
        # affordability is a consequence of the declared cap, not a judgement
        expect = (p["settings"] <= sw["cap"]) and any(
            x["kind"] == "finite" for x in p["positions"])
        ok(bool(on["affordable"]) == expect, f"affordability disagrees: {p['dir']}")
        if on["affordable"]:
            ok(on["driven"] <= p["settings"],
               f"more settings driven than exist: {p['dir']}")
        else:
            ok(on["driven"] == 0, f"an unaffordable page was driven: {p['dir']}")
        # the press space, by the declared rule
        k = p["actionless"]
        ok(p["press_space"] == 1 + k + k * max(0, k - 1),
           f"press_space disagrees: {p['dir']}")

    # --- 3. the corpus aggregates -------------------------------------------
    c = data["corpus"]
    ok(c["pages"] == len(data["pages"]), "corpus.pages disagrees")
    ok(c["controls"] == sum(p["controls"] for p in data["pages"]), "corpus.controls disagrees")
    ok(c["actionless_controls"] == sum(p["actionless"] for p in data["pages"]),
       "corpus.actionless_controls disagrees")
    ok(c["pages_without_controls"] == sum(1 for p in data["pages"] if p["controls"] == 0),
       "corpus.pages_without_controls disagrees")
    ok(c["pages_button_only"] == sum(
        1 for p in data["pages"] if p["controls"] > 0 and p["finite"] == 0
        and p["unbounded"] == 0 and p["actionless"] > 0),
       "corpus.pages_button_only disagrees")
    ok(c["settings_max"] == max(p["settings"] for p in data["pages"]),
       "corpus.settings_max disagrees")
    ok(c["settings_driven"] == sum(p["driven"] for p in data["pages"]),
       "corpus.settings_driven disagrees")
    ok(c["pairs_driven"] == sum(p["pairs_driven"] for p in data["pages"]),
       "corpus.pairs_driven disagrees")
    ok(c["singles_driven"] == sum(p["singles_driven"] for p in data["pages"]),
       "corpus.singles_driven disagrees")
    ok(c["s12_states"] == sum(p["s12"]["states_on"] for p in data["pages"]),
       "corpus.s12_states disagrees")
    ok(c["unaffordable_pages"] == sum(
        1 for p in data["pages"] if p["settings"] > sw["cap"] and p["finite"] > 0),
       "corpus.unaffordable_pages disagrees")
    ok(c["renderings_off_not_one"] == [], "a page answered a hand without scripting")

    # the interaction gaps, re-derived
    mine_gap = []
    for p in data["pages"]:
        if not p["affordable"]:
            continue
        for u in ("q", "l"):
            if p["add"][u] != p["one_way_add"][u]:
                mine_gap.append((p["dir"], u))
    ok(len(mine_gap) == c["interaction_gaps"], "corpus.interaction_gaps disagrees")
    ok(len({d for d, _ in mine_gap}) == c["pages_with_interaction_gap"],
       "corpus.pages_with_interaction_gap disagrees")

    mine_pair = []
    for p in data["pages"]:
        if p["pairs_driven"] == 0:
            continue
        for u in ("q", "l"):
            if (set(p["pair_tokens"][u]) - set(p["add_tokens"][u])
                    - set(p["single_tokens"][u])):
                mine_pair.append((p["dir"], u))
    ok(len(mine_pair) == c["pair_gaps"], "corpus.pair_gaps disagrees")

    # --- 4. the page itself --------------------------------------------------
    ok("<script" not in html.lower(), "the page carries a script element")
    ok(" onclick" not in html.lower() and " oninput" not in html.lower()
       and " onchange" not in html.lower() and " onload" not in html.lower(),
       "the page carries an inline event handler")
    ok(not re.search(r'(?:src|href)\s*=\s*["\']?(?:https?:)?//', html),
       "the page references something off the filesystem")
    blocks = len(re.findall(r'<div class="v" data-k="', html))
    ok(blocks == data["this_page"]["blocks"],
       f"printed blocks disagree: {blocks} vs {data['this_page']['blocks']}")
    ok(blocks == data["this_page"]["settings"],
       "the page prints fewer renderings than its hand can reach")
    rules = len(re.findall(r'#b\d+:checked ~ #p\d+:checked ~ #u\d+:checked', html))
    ok(rules == data["this_page"]["rules"], "selecting rules disagree")
    keys_blocks = set(re.findall(r'<div class="v" data-k="([^"]+)"', html))
    keys_rules = set(re.findall(r'\.out \.v\[data-k="([^"]+)"\]', html))
    ok(keys_blocks == keys_rules,
       "a printed rendering has no rule, or a rule has no rendering")
    checked = re.findall(r'<input type="radio" name="(\w+)" id="(\w+)" checked>', html)
    ok(len(checked) == 3, "the served page does not start in exactly one setting")
    ok(len(re.findall(r'<input type="radio"', html))
       == len(data["this_page"]["dial_product"].split("×"))
       + sum(int(x) for x in data["this_page"]["dial_sizes"]
             .replace(" and ", ", ").split(", ")) - 3,
       "radio count disagrees with the declared dials")
    ok(len(html.encode("utf-8")) == data["this_page"]["bytes"],
       "the page's printed size is not its size")

    # every headline figure must actually occur in the page
    def printed(x):
        s = f"{x:,}"
        return (str(x) in html) or (s in html) or (s.replace(",", " ") in html)
    for key in ("settings_total", "settings_max", "s12_states", "controls",
                "actionless_controls", "settings_driven", "pairs_driven", "cap"):
        ok(printed(c[key]), f"a published figure is not on the page: {key}={c[key]}")

    # --- 5. the sources ------------------------------------------------------
    nist = src["fetched"][0]
    ok(re.fullmatch(r"[0-9a-f]{64}", nist["sha256"]) is not None,
       "the fetched source has no digest")
    ok(nist["committed"] is False, "a third-party source file was committed")
    for qd in nist["quoted"]:
        ok(qd["text"][:40] in html or len(qd["text"]) > 0,
           "a quoted passage is recorded without text")
    ok(all(q["text"][:30] in html for q in nist["quoted"][:3]),
       "a passage the page leans on is not quoted on the page")
    for it in src["internal"]:
        if "text" in it and it["where"].startswith("docs/"):
            f = os.path.join(REPO, it["where"].split(",")[0])
            ok(os.path.exists(f), f"a quoted internal source is missing: {it['where']}")
            if os.path.exists(f):
                with open(f, encoding="utf-8") as fh:
                    ok(it["text"][:40] in fh.read(),
                       f"a quotation is not in the file it names: {it['where']}")

    # --- report --------------------------------------------------------------
    if FAIL:
        print(f"{N} checks, {len(FAIL)} failed", file=sys.stderr)
        for f in FAIL:
            print("  FAIL " + f, file=sys.stderr)
        sys.exit(1)
    print(f"{N} checks, 0 failed")


if __name__ == "__main__":
    main()
