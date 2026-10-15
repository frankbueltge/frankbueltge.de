#!/usr/bin/env python3
"""enumerate.py — the instrument.

It reads every page this practice has published, as a file, and works out what a
reader's hand can actually be put into: the controls the served HTML holds, how
many positions each of them has, and therefore how many distinct settings the
page offers a reader at all.

    python3 window/cycle-003-session-13/enumerate.py [--out FILE]

No network, no browser, no dependency outside the standard library. It parses the
committed bytes of each page, which is exactly the material a reader without
scripting is given, and nothing else. What the browser then does with those bytes
was measured on 2026-09-22 and is read here from that session's committed
evidence — this file fetches nothing and runs nothing.

It is the instrument, not the artifact. build.py makes the artifact from its
output; check.py re-derives every published number from that output without
importing a line of this file.
"""

import argparse
import hashlib
import json
import os
import re
import sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
S12 = os.path.join(REPO, "window", "cycle-003-session-12")

# ---------------------------------------------------------------------------
# The declared rules. Written here in full and written a second time, from this
# text and not from this code, in check.py. A count whose rule is not written
# down is not a count; this practice has said so on four nights and does not
# exempt itself.
# ---------------------------------------------------------------------------

DECLARED = {
    "control": (
        "A control is an element of the served HTML that a reader can operate: "
        "input (of any type), select, textarea, or button. Radio inputs that share "
        "a name are ONE control with as many positions as there are radios in the "
        "group, because a reader can put that group in exactly one of them. Every "
        "other element is one control on its own. An element inside a <template> is "
        "not served to the reader and is counted separately, never as a control."
    ),
    "position": (
        "A position is one setting a reader can put a control into, counted from the "
        "served attributes alone. radio group: the number of radios in the group. "
        "checkbox: 2. select: the number of option elements it holds (a select with "
        "the multiple attribute is 2^options and is marked as such). "
        "range: floor((max-min)/step)+1, using the HTML defaults min=0, max=100, "
        "step=1 for whatever the page leaves out. number, text, search, textarea, "
        "and any input whose type this rule does not name: UNBOUNDED — a reader may "
        "type anything, and no finite count is honest. button, input type=button, "
        "submit, reset, image: NO POSITION AT ALL — a button is an act, not a "
        "setting, and nothing in the served document records that it happened."
    ),
    "settings": (
        "The settings of a page is the product of the positions of its controls. It "
        "is UNBOUNDED if any control is unbounded. It is UNRECORDABLE if the page "
        "has a control with no position at all, because the reader can do something "
        "the document cannot be in a state about."
    ),
    "effective": (
        "A control is effective if the run of 2026-09-22 recorded at least one action "
        "on it after which the rendered text differed from the page's first "
        "rendering, under either unit declared there (quantity or line). That run "
        "worked one control at a time and stopped at 48 states a page, so a control "
        "that only does something in company with another is recorded here as not "
        "effective. Every count over effective controls is therefore a floor."
    ),
}

# ---------------------------------------------------------------------------

STATEFUL_INPUT = {"radio", "checkbox", "range"}
ACTION_INPUT = {"button", "submit", "reset", "image"}
UNBOUNDED_INPUT = {
    "text", "search", "number", "email", "url", "tel", "password",
    "date", "time", "datetime-local", "month", "week", "color", "file",
}


class Controls(HTMLParser):
    """Collects the served controls of one document, in document order."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.found = []          # served controls
        self.templated = []      # controls inside <template>: not served to a reader
        self._depth_template = 0
        self._select = None      # open select being counted
        self._seen_selects = []

    # -- helpers ----------------------------------------------------------
    @staticmethod
    def _a(attrs):
        return {k.lower(): (v if v is not None else "") for k, v in attrs}

    def _emit(self, rec):
        (self.templated if self._depth_template else self.found).append(rec)

    # -- parser hooks -----------------------------------------------------
    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        a = self._a(attrs)
        if tag == "template":
            self._depth_template += 1
            return
        if tag == "input":
            t = (a.get("type") or "text").lower()
            self._emit({"tag": "input", "type": t, "name": a.get("name"),
                        "id": a.get("id"), "min": a.get("min"), "max": a.get("max"),
                        "step": a.get("step"), "disabled": "disabled" in a})
        elif tag == "select":
            rec = {"tag": "select", "type": "select", "name": a.get("name"),
                   "id": a.get("id"), "options": 0,
                   "multiple": "multiple" in a, "disabled": "disabled" in a}
            self._emit(rec)
            self._select = rec
        elif tag == "option":
            if self._select is not None:
                self._select["options"] += 1
        elif tag == "textarea":
            self._emit({"tag": "textarea", "type": "textarea", "name": a.get("name"),
                        "id": a.get("id"), "disabled": "disabled" in a})
        elif tag == "button":
            self._emit({"tag": "button", "type": (a.get("type") or "submit").lower(),
                        "name": a.get("name"), "id": a.get("id"),
                        "disabled": "disabled" in a})

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag.lower() == "template":
            self._depth_template -= 1

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "template" and self._depth_template:
            self._depth_template -= 1
        elif tag == "select":
            self._select = None


def positions(rec):
    """Positions of one served control, by the declared rule. Returns
    (count, kind) where kind is 'finite', 'unbounded' or 'none'."""
    tag, t = rec["tag"], rec["type"]
    if tag == "button" or (tag == "input" and t in ACTION_INPUT):
        return None, "none"
    if tag == "textarea":
        return None, "unbounded"
    if tag == "select":
        n = rec["options"]
        if rec["multiple"]:
            return 2 ** n, "finite"
        return n, "finite"
    if tag == "input":
        if t == "checkbox":
            return 2, "finite"
        if t == "radio":
            return None, "radio"          # resolved by grouping, below
        if t == "range":
            def num(v, d):
                try:
                    return float(v)
                except (TypeError, ValueError):
                    return d
            lo, hi = num(rec["min"], 0.0), num(rec["max"], 100.0)
            st = num(rec["step"], 1.0)
            if st <= 0 or hi < lo:
                return None, "unbounded"
            return int((hi - lo) // st) + 1, "finite"
        return None, "unbounded"
    return None, "unbounded"


def group(found):
    """Collapse radios sharing a name into one control each, keep order."""
    out, radio_at = [], {}
    for rec in found:
        if rec["tag"] == "input" and rec["type"] == "radio":
            key = rec.get("name") or ("\x00anonymous\x00" + str(id(rec)))
            if key in radio_at:
                out[radio_at[key]]["members"] += 1
                continue
            radio_at[key] = len(out)
            out.append({"tag": "input", "type": "radio", "name": rec.get("name"),
                        "id": rec.get("id"), "members": 1,
                        "disabled": rec["disabled"]})
        else:
            out.append(dict(rec))
    for rec in out:
        if rec["type"] == "radio":
            rec["positions"], rec["kind"] = rec["members"], "finite"
        else:
            n, kind = positions(rec)
            rec["positions"], rec["kind"] = n, kind
    return out


def product(controls):
    """Settings of a page: product over finite controls; flags for the rest."""
    prod, unbounded, actionless = 1, 0, 0
    for c in controls:
        if c["kind"] == "finite":
            prod *= max(1, c["positions"])
        elif c["kind"] == "unbounded":
            unbounded += 1
        elif c["kind"] == "none":
            actionless += 1
    return prod, unbounded, actionless


def s12_evidence():
    """What the browser did with these same bytes on 2026-09-22, read from the
    committed evidence of that session. Nothing here re-runs it."""
    path = os.path.join(S12, "evidence.json")
    with open(path, "rb") as fh:
        raw = fh.read()
    ev = json.loads(raw.decode("utf-8"))
    by_dir = {}
    for p in ev["pages"]:
        on = p["on"]
        moved, touched = set(), set()
        for st in on.get("states", []):
            i = st["act"]["i"]
            touched.add(i)
            if st["dq"]["+"] or st["dq"]["-"] or st["dl"]["+"] or st["dl"]["-"]:
                moved.add(i)
        by_dir[p["dir"]] = {
            "browser_controls": on.get("controls", []),
            "states_on": on.get("statesVisited", 0),
            "states_off": p["off"].get("statesVisited", 0),
            "moved_idx": sorted(moved),
            "touched_idx": sorted(touched),
            "base_q": on["base"]["q"],
            "base_l": on["base"]["l"],
            "bytes": p["bytes"],
            "label": p["label"],
        }
    return by_dir, hashlib.sha256(raw).hexdigest(), ev["sweep"]


def page_html(d):
    p = os.path.join(REPO, d, "index.html")
    return p if os.path.exists(p) else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "evidence.json"))
    args = ap.parse_args()

    ev12, digest12, sweep12 = s12_evidence()
    order = list(ev12.keys())

    pages = []
    for d in order:
        path = page_html(d)
        if path is None:
            raise SystemExit("missing page: " + d)
        with open(path, "rb") as fh:
            raw = fh.read()
        par = Controls()
        par.feed(raw.decode("utf-8", "replace"))
        served = group(par.found)
        templated = group(par.templated)
        prod, unbounded, actionless = product(served)

        # Match the served controls against what the browser reported. The
        # browser's list is in document order too, so the comparison that is
        # honest is by TYPE MULTISET, not by index: an index match would be a
        # claim about ordering that neither record makes.
        def multiset(lst, key):
            out = {}
            for c in lst:
                out[key(c)] = out.get(key(c), 0) + 1
            return out

        browser = ev12[d]["browser_controls"]
        # the browser counted each radio separately; collapse the same way
        b_group, b_seen = [], set()
        for c in browser:
            if c.get("type") == "radio":
                k = c.get("name")
                if k in b_seen:
                    continue
                b_seen.add(k)
            b_group.append(c)

        served_types = multiset(served, lambda c: c["type"])
        browser_types = multiset(b_group, lambda c: (c.get("type") or c.get("tag")))

        moved = set(ev12[d]["moved_idx"])
        # map the browser's ungrouped index back onto a served control by type
        eff = []
        for i, c in enumerate(browser):
            if i in moved:
                eff.append({"i": i, "type": c.get("type") or c.get("tag"),
                            "name": c.get("name"), "id": c.get("id")})
        eff_keys = set()
        for e in eff:
            eff_keys.add((e["type"], e["name"] if e["type"] == "radio" else e["id"]))

        eff_controls = [c for c in served
                        if (c["type"], c["name"] if c["type"] == "radio" else c["id"])
                        in eff_keys]
        eprod, eunb, eact = product(eff_controls)

        pages.append({
            "dir": d,
            "label": ev12[d]["label"],
            "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "served_controls": served,
            "templated_controls": templated,
            "served_total": len(served),
            "served_types": served_types,
            "browser_total": len(b_group),
            "browser_types": browser_types,
            "settings": prod,
            "unbounded_controls": unbounded,
            "actionless_controls": actionless,
            "effective": [
                {"type": c["type"], "name": c["name"], "id": c["id"],
                 "positions": c["positions"], "kind": c["kind"]}
                for c in eff_controls],
            "effective_total": len(eff_controls),
            "effective_settings": eprod,
            "effective_unbounded": eunb,
            "effective_actionless": eact,
            "s12": ev12[d],
        })

    out = {
        "_note": (
            "Every control this practice has ever served to a reader, with the number "
            "of positions the served attributes give it. Produced by enumerate.py from "
            "the committed bytes of each page and from the committed evidence of "
            "2026-09-22. No network, no browser, no dependency outside the standard "
            "library. check.py re-derives every published number from this file."),
        "date": "2026-09-23",
        "session": 13,
        "cycle": 3,
        "declared": DECLARED,
        "read_from": {
            "s12_evidence": "window/cycle-003-session-12/evidence.json",
            "s12_evidence_sha256": digest12,
            "s12_sweep": sweep12,
        },
        "pages": pages,
    }
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, sort_keys=False, ensure_ascii=False)
        fh.write("\n")
    print("wrote", args.out, "-", len(pages), "pages", file=sys.stderr)


if __name__ == "__main__":
    main()
