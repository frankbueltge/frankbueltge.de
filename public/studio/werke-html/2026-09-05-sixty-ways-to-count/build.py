#!/usr/bin/env python3
"""SIXTY WAYS TO COUNT — Ensemble, The Studio, 2026-09-05.

One measurement over the house's Atlas of Data Art — how many of its 521
`decisive_move` fields open with an act — carried out sixty times, once for each
setting of three free parameters a reasonable person could set differently.

    build.py --fetch     read the live feed, derive data.json, print the surface
    build.py             render index.html from data.json
    build.py --check     re-derive every published figure from data.json's own
                         per-entry records and fail on a one-byte drift of the page
    build.py --verify-feed
                         re-fetch the feed and prove the per-entry records in
                         data.json are what the rule in lexicon.json produces

No third-party code. No library. The rule lives in lexicon.json beside this file.
"""

import argparse
import hashlib
import html
import json
import os
import re
import sys
import urllib.request
from collections import Counter
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
FEED = "https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json"
MIRROR = "https://frankbueltge.de/atlas/werke.json"

WINDOWS = [1, 2, 3, 4, 5]          # dial 1: how wide the opening is, in words
LEXES = [1, 2, 3]                  # dial 2: which verbs count as acts
INFLS = [1, 2, 3, 4]               # dial 3: which forms of a verb count
LEX_NAMES = {1: "core acts only", 2: "core + presentational", 3: "core + presentational + stative"}
INFL_NAMES = {1: "third person (maps)", 2: "+ base form (map)", 3: "+ gerund (mapping)", 4: "+ past (mapped, built)"}
INFL_QUOTE = {
    1: "third person only (maps)",
    2: "third person and base form (maps, map)",
    3: "third person, base form and gerund (maps, map, mapping)",
    4: "third person, base form, gerund and past (maps, map, mapping, mapped, built)",
}

TOKEN = re.compile(r"[A-Za-z][A-Za-z'’-]*")


# ---------------------------------------------------------------- the rule

def surface_forms(stem, infl):
    """Every written form of one stem admitted at inflection tier `infl` (cumulative)."""
    out = set()
    # tier 1 — third person singular, the tense this catalogue is written in
    if stem.endswith(("s", "x", "z", "ch", "sh")):
        out.add(stem + "es")
    elif stem.endswith("y") and len(stem) > 1 and stem[-2] not in "aeiou":
        out.add(stem[:-1] + "ies")
    else:
        out.add(stem + "s")
    if infl >= 2:                                   # bare stem
        out.add(stem)
    if infl >= 3:                                   # gerund / present participle
        if stem.endswith("e") and not stem.endswith(("ee", "ye", "oe")):
            out.add(stem[:-1] + "ing")
        else:
            out.add(stem + "ing")
    if infl >= 4:                                   # past / past participle
        if stem.endswith("e"):
            out.add(stem + "d")
        elif stem.endswith("y") and len(stem) > 1 and stem[-2] not in "aeiou":
            out.add(stem[:-1] + "ied")
        else:
            out.add(stem + "ed")
    return out


def build_lexicon(lex):
    """(L, I) -> set of surface forms. Tiers are cumulative in both directions."""
    tiers = lex["tiers"]
    order = ["core", "presentational", "stative"]
    irregular = {k: v for k, v in lex["irregular"].items() if not k.startswith("_")}
    table = {}
    for L in LEXES:
        stems = []
        for name in order[:L]:
            stems.extend(tiers[name]["stems"])
        stems = sorted(set(stems))
        for I in INFLS:
            forms = set()
            for s in stems:
                forms |= surface_forms(s, I)
                if I >= 4 and s in irregular:
                    forms |= set(irregular[s])
            table[(L, I)] = forms
    return table


def tokens_of(text):
    """The opening window, in order. A hyphenated token also offers its last part
    (so `cross-examines` and `3d-prints` are reachable) without taking a second slot."""
    out = []
    for raw in TOKEN.findall(text)[:max(WINDOWS)]:
        t = raw.lower().replace("’", "'")
        alts = [t]
        if "-" in t:
            tail = t.rsplit("-", 1)[-1]
            if tail:
                alts.append(tail)
        out.append(alts)
    return out


def first_act_position(window, forms, skip=None):
    """1-based position of the earliest token in the window that is an act; 0 if none.
    `skip` is a set of surface forms to ignore (used for the ambiguity bound)."""
    for i, alts in enumerate(window, start=1):
        for a in alts:
            if a in forms and not (skip and a in skip):
                return i
    return 0


# ---------------------------------------------------------------- derivation

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Ensemble/studio (art practice; one read per session)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def year_of(raw):
    m = re.search(r"(1[89]\d\d|20\d\d)", str(raw or ""))
    return int(m.group(1)) if m else None


def host_of(url):
    m = re.match(r"https?://([^/]+)", str(url or ""))
    return m.group(1).lower().lstrip("www.") if m else ""


def derive(raw_bytes, lex):
    atlas = json.loads(raw_bytes.decode("utf-8"))
    table = build_lexicon(lex)
    amb = set(lex["ambiguous_surface"]["forms"])
    combos = [(L, I) for L in LEXES for I in INFLS]          # 12, in a fixed order

    entries = []
    for w in atlas:
        text = w.get("decisive_move") or ""
        window = tokens_of(text)
        pa = "".join(str(first_act_position(window, table[c])) for c in combos)
        pc = "".join(str(first_act_position(window, table[c], skip=amb)) for c in combos)
        y = year_of(w.get("year"))
        entries.append({
            "t": w.get("title") or "",
            "a": w.get("artist") or "",
            "y": w.get("year") or "",
            "yn": y,
            "u": w.get("source_url") or "",
            "v": (w.get("verify_status") or "") == "verified",
            "r": host_of(w.get("source_url")) == "artbase.rhizome.org",
            "pa": pa,
            "pc": pc,
        })

    groups = {
        "all": lambda e: True,
        "verified": lambda e: e["v"],
        "toverify": lambda e: not e["v"],
        "artbase": lambda e: e["r"],
        "elsewhere": lambda e: not e["r"],
        "old": lambda e: e["yn"] is not None and e["yn"] <= 2010,
        "new": lambda e: e["yn"] is not None and e["yn"] >= 2024,
    }
    sizes = {g: sum(1 for e in entries if f(e)) for g, f in groups.items()}
    seam = {
        "artbase": sizes["artbase"],
        "artbase_verified": sum(1 for e in entries if e["r"] and e["v"]),
        "artbase_old": sum(1 for e in entries if e["r"] and e["yn"] is not None and e["yn"] <= 2010),
    }

    settings = []
    for W in WINDOWS:
        for L in LEXES:
            for I in INFLS:
                k = combos.index((L, I))
                counts, rests = {}, 0
                for g, f in groups.items():
                    counts[g] = sum(1 for e in entries if f(e) and 0 < int(e["pa"][k]) <= W)
                for e in entries:
                    hit_all = 0 < int(e["pa"][k]) <= W
                    hit_clean = 0 < int(e["pc"][k]) <= W
                    if hit_all and not hit_clean:
                        rests += 1
                settings.append({
                    "id": f"w{W}l{L}i{I}", "w": W, "l": L, "i": I,
                    "acts": counts["all"], "counts": counts,
                    "rests_on_ambiguous": rests,
                    "forms": len(table[(L, I)]),
                })
    settings.sort(key=lambda s: (s["acts"], s["id"]))

    claims = build_claims(settings, sizes)
    invariants = invariants_of(atlas, entries)
    examples = examples_of(atlas)

    return {
        "_note": "Derived from the Atlas feed by build.py under the rule in lexicon.json. "
                 "The feed itself is never mirrored here: no decisive_move text is stored, only "
                 "the position of the earliest act token in each field's opening window, for each "
                 "of the twelve (lexicon, inflection) pairs, in the order L1I1 L1I2 L1I3 L1I4 L2I1 "
                 "... L3I4. Every published figure is recomputable from those digits.",
        "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {
            "feed": FEED, "mirror": MIRROR,
            "sha256": hashlib.sha256(raw_bytes).hexdigest(),
            "bytes": len(raw_bytes), "entries": len(atlas),
        },
        "dials": {
            "w": {"label": "how wide the opening is", "unit": "words", "values": WINDOWS},
            "l": {"label": "which verbs count as acts", "values": LEXES, "names": LEX_NAMES},
            "i": {"label": "which forms of a verb count", "values": INFLS, "names": INFL_NAMES},
        },
        "group_sizes": sizes,
        "seam": seam,
        "settings": settings,
        "claims": claims,
        "invariants": invariants,
        "examples": examples,
        "neighbour_points": [
            {"label": "Atelier 09-04", "acts": 521 - 426,
             "note": "published as 426 of 521 fields not opening with an act"},
            {"label": "Atelier 09-05", "acts": 521 - 416,
             "note": "published as 416, after the same practice corrected itself"},
        ],
        "entries": entries,
    }


EXAMPLE_TITLES = [
    ("AI War Cloud Database", "counts at every one of the sixty settings: an act in the first word"),
    ("Asunder", "counts only when the opening is read four words wide"),
    ("Data Feminism", "counts only when verbs of showing and arguing count as acts"),
    ("Triple-Chaser", "counts only when verbs of using and being count as acts"),
]


def examples_of(atlas):
    """Four entries, one per way of falling inside or outside the rule. Short
    quotations with their source, so that a reader can see what is being counted."""
    out = []
    for title, role in EXAMPLE_TITLES:
        hit = next((w for w in atlas if (w.get("title") or "").startswith(title)), None)
        if hit is None:
            raise SystemExit(f"example entry gone from the feed: {title!r} — the page cannot be built as written")
        words = (hit.get("decisive_move") or "").split()
        out.append({
            "t": hit.get("title") or "", "a": hit.get("artist") or "", "y": hit.get("year") or "",
            "u": hit.get("source_url") or "", "q": " ".join(words[:10]), "role": role,
        })
    return out


def rates_of(c, s, sizes):
    """For a comparison, the two rates it compares, printed at the given setting."""
    if "groups" not in c:
        return '<span class="crates"></span>'
    ga, gb, la, lb = c["groups"]
    a = 100 * rate(s["counts"][ga], sizes[ga])
    b = 100 * rate(s["counts"][gb], sizes[gb])
    return (f'<span class="crates">{a:.1f}\u2009% {e(la)} against {b:.1f}\u2009% {e(lb)}'
            f'<em> at the strictest setting</em></span>')


WORDS = {0: "none", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight"}


def rate(n, d):
    return (n / d) if d else 0.0


def build_claims(settings, sizes):
    """Eight sentences anyone might write about this column. Each is evaluated at
    all sixty settings; what the work reports is which ones the settings can move."""
    n = sizes["all"]
    pairs = {
        "verified": ("verified", "toverify", "marked verified", "marked toVerify"),
        "artbase": ("artbase", "elsewhere", "cited from ArtBase", "cited elsewhere"),
        "recent": ("new", "old", "dated 2024+", "dated \u22642010"),
    }
    defs = [
        ("majority", "Most of the 521 fields do not open with an act.",
         "level", lambda s: (n - s["acts"]) > n / 2),
        ("fifth", "Fewer than one in five open with an act.",
         "level", lambda s: s["acts"] < n / 5),
        ("hundred", "More than a hundred open with an act.",
         "level", lambda s: s["acts"] > 100),
        ("third", "At least a third open with an act.",
         "level", lambda s: s["acts"] >= n / 3),
        ("verified", "Entries the Atlas marks verified open with an act more often than entries marked toVerify.",
         "direction", lambda s: rate(s["counts"]["verified"], sizes["verified"]) > rate(s["counts"]["toverify"], sizes["toverify"])),
        ("artbase", "Entries cited from Rhizome's ArtBase open with an act less often than entries cited from anywhere else.",
         "direction", lambda s: rate(s["counts"]["artbase"], sizes["artbase"]) < rate(s["counts"]["elsewhere"], sizes["elsewhere"])),
        ("recent", "Works dated 2024 or later open with an act more often than works dated 2010 or earlier.",
         "direction", lambda s: rate(s["counts"]["new"], sizes["new"]) > rate(s["counts"]["old"], sizes["old"])),
        ("artbase_third", "No more than a third of the ArtBase entries open with an act.",
         "level", lambda s: s["counts"]["artbase"] <= sizes["artbase"] / 3),
    ]
    out = []
    for cid, text, kind, fn in defs:
        truth = [bool(fn(s)) for s in settings]
        t = sum(truth)
        status = "always" if t == len(truth) else ("never" if t == 0 else "set by the dial")
        item = {"id": cid, "text": text, "kind": kind, "truth": truth,
                "true_at": t, "of": len(truth), "status": status}
        if cid in pairs:
            item["groups"] = list(pairs[cid])
        out.append(item)
    return out


def invariants_of(atlas, entries):
    """Exact functions of the file. No setting of any dial moves one of them."""
    dm = [(w.get("decisive_move") or "") for w in atlas]
    firsts = Counter()
    for text in dm:
        ts = TOKEN.findall(text)
        if ts:
            firsts[ts[0].lower()] += 1
    lens = sorted(len(x) for x in dm)
    dupes = sum(c for _, c in Counter(dm).items() if c > 1)
    return [
        {"n": len(atlas), "label": "entries in the file", "note": "every one carries a decisive_move"},
        {"n": sum(1 for x in dm if x.strip()), "label": "fields with anything in them", "note": "fill: an exact count, no rule needed"},
        {"n": len(set(dm)), "label": "distinct field values", "note": f"{dupes} entries share a value with another"},
        {"n": len(firsts), "label": "distinct opening words", "note": f"the commonest is “{firsts.most_common(1)[0][0]}”, {firsts.most_common(1)[0][1]} times"},
        {"n": lens[len(lens) // 2], "label": "characters in the median field", "note": f"shortest {lens[0]}, longest {lens[-1]}"},
        {"n": sum(1 for x in dm if x[:1].isupper()), "label": "fields that start with a capital", "note": "a property of the string, not of a lexicon"},
    ]


# ---------------------------------------------------------------- the page

def e(s):
    return html.escape(str(s), quote=True)


def fmt(n):
    return f"{n:,}".replace(",", " ")


def render(d):
    S = d["settings"]
    sizes = d["group_sizes"]
    n = sizes["all"]
    lo, hi = S[0], S[-1]
    default = next(s for s in S if s["id"] == "w1l1i1")
    span = hi["acts"] - lo["acts"]
    always = [c for c in d["claims"] if c["status"] == "always"]
    never = [c for c in d["claims"] if c["status"] == "never"]
    moved = [c for c in d["claims"] if c["status"] == "set by the dial"]
    amb_lo = min(s["rests_on_ambiguous"] for s in S)
    amb_hi = max(s["rests_on_ambiguous"] for s in S)

    # --- the spectrum: sixty ticks placed by the count they produce
    def pos(acts):
        return 0.0 if hi["acts"] == lo["acts"] else (acts - lo["acts"]) / (hi["acts"] - lo["acts"])

    ticks = []
    for s in S:
        x = pos(s["acts"]) * 100
        ticks.append(
            f'<button class="tick" role="radio" aria-checked="false" data-id="{s["id"]}" '
            f'style="left:{x:.4f}%" '
            f'title="{s["acts"]} acts &mdash; opening {s["w"]} word{"s" if s["w"]>1 else ""}, {e(LEX_NAMES[s["l"]])}, {e(INFL_NAMES[s["i"]])}">'
            f'<span class="sr">{s["acts"]} of {n}: opening {s["w"]} words, {e(LEX_NAMES[s["l"]])}, {e(INFL_NAMES[s["i"]])}</span></button>')
    ticks = "\n".join(ticks)

    # thresholds where the level claims flip
    thresholds = [
        (n / 5, "one in five", "fewer than this and “fewer than one in five” is true"),
        (100, "a hundred", "above this and “more than a hundred” is true"),
        (n / 3, "a third", "above this and “at least a third” is true"),
        (n / 2, "half", "above this and “most do not open with an act” is false"),
    ]
    thr = []
    for k, (v, label, note) in enumerate(sorted(thresholds)):
        if lo["acts"] <= v <= hi["acts"]:
            thr.append(f'<div class="thr {"hi" if k % 2 else "lo"}" style="left:{pos(v)*100:.4f}%">'
                       f'<span class="thrl">{e(label)}<b>{v:.0f}</b></span></div>')
        else:
            side = "below" if v < lo["acts"] else "above"
            thr.append(f'<!-- {label} ({v:.0f}) lies {side} the whole span -->')
    thr = "\n".join(thr)

    # the Atelier's two published numbers, placed on this axis as numbers, not as settings
    marks = []
    for k, m in enumerate(sorted(d["neighbour_points"], key=lambda x: x["acts"])):
        if lo["acts"] <= m["acts"] <= hi["acts"]:
            marks.append(f'<div class="nmark {"hi" if k % 2 else "lo"}" style="left:{pos(m["acts"])*100:.4f}%">'
                         f'<span class="nml"><b>{m["acts"]}</b>{e(m["label"])}</span></div>')
    marks = "\n".join(marks)

    ex_rows = "\n".join(
        f'<li><q>{e(x["q"])}&hellip;</q><span class="exsrc">'
        f'<a href="{e(x["u"])}">{e(x["t"])}</a> &mdash; {e(x["a"])}, {e(x["y"])}</span>'
        f'<span class="exrole">{e(x["role"])}</span></li>' for x in d["examples"])

    # --- the floor: the whole surface as a table, in the order the dials sit in
    rows = []
    by_id = {s["id"]: s for s in S}
    for W in WINDOWS:
        for L in LEXES:
            cells = []
            for I in INFLS:
                s = by_id[f"w{W}l{L}i{I}"]
                cells.append(f'<td><b>{s["acts"]}</b><span>{100*s["acts"]/n:.1f}%</span></td>')
            rows.append(
                f'<tr><th scope="row">{W} word{"s" if W>1 else ""}<span>{e(LEX_NAMES[L])}</span></th>'
                + "".join(cells) + "</tr>")
    floor_rows = "\n".join(rows)

    claim_rows = []
    strict = next(s for s in S if s["id"] == "w1l1i1")
    for c in d["claims"]:
        badge = {"always": "the file decides", "never": "the file decides", "set by the dial": "you decide"}[c["status"]]
        cls = "st-always" if c["status"] == "always" else ("st-never" if c["status"] == "never" else "st-moved")
        verdict = {"always": "true at all 60", "never": "false at all 60", "set by the dial": f"true at {c['true_at']} of 60"}[c["status"]]
        claim_rows.append(
            f'<li class="claim {cls}" data-claim="{c["id"]}" data-kind="{c["kind"]}">'
            f'<span class="cstate" aria-hidden="true"></span>'
            f'<span class="ctext">{e(c["text"])}</span>'
            f'<span class="cmeta"><b class="cbadge">{e(badge)}</b> <span class="cspan">{e(verdict)}</span>'
            f'<span class="cnow"></span>{rates_of(c, strict, sizes)}</span></li>')
    claim_rows = "\n".join(claim_rows)

    inv_rows = "\n".join(
        f'<li><b>{fmt(i["n"])}</b><span class="il">{e(i["label"])}</span><span class="in">{e(i["note"])}</span></li>'
        for i in d["invariants"])

    payload = json.dumps({
        "n": n,
        "settings": [{"id": s["id"], "w": s["w"], "l": s["l"], "i": s["i"], "acts": s["acts"],
                      "counts": s["counts"], "amb": s["rests_on_ambiguous"], "forms": s["forms"]} for s in S],
        "claims": [{"id": c["id"], "text": c["text"], "status": c["status"], "true_at": c["true_at"],
                    "groups": c.get("groups"),
                    "truth": {S[k]["id"]: c["truth"][k] for k in range(len(S))}} for c in d["claims"]],
        "sizes": sizes,
        "lex": LEX_NAMES, "infl": INFL_NAMES, "inflq": INFL_QUOTE,
        "sha": d["source"]["sha256"],
    }, separators=(",", ":"), ensure_ascii=False)

    return TEMPLATE.format(
        n=n, lo=lo["acts"], hi=hi["acts"], span=span,
        lo_pct=f'{100*lo["acts"]/n:.1f}', hi_pct=f'{100*hi["acts"]/n:.1f}',
        default_acts=default["acts"],
        sha=d["source"]["sha256"], sha_short=d["source"]["sha256"][:8] + "…" + d["source"]["sha256"][-8:],
        bytes=fmt(d["source"]["bytes"]), fetched=e(d["generated_utc"]),
        ticks=ticks, thresholds=thr, floor_rows=floor_rows, claim_rows=claim_rows,
        inv_rows=inv_rows, payload=payload, marks=marks, ex_rows=ex_rows,
        n_always=len(always), n_moved=len(moved), n_never=len(never),
        n_always_w=WORDS[len(always)], n_moved_w=WORDS[len(moved)], n_never_w=WORDS[len(never)],
        always_list="; ".join(e(c["text"].rstrip(".")) for c in always) or "none",
        moved_list="; ".join(e(c["text"].rstrip(".")) for c in moved) or "none",
        amb_lo=amb_lo, amb_hi=amb_hi,
        amb_strict=next(s for s in S if s["id"] == "w1l1i1")["rests_on_ambiguous"],
        amb_wide=next(s for s in S if s["id"] == "w5l3i4")["rests_on_ambiguous"],
        wide_acts=next(s for s in S if s["id"] == "w5l3i4")["acts"],
        verified_n=sizes["verified"], toverify_n=sizes["toverify"],
        artbase_n=sizes["artbase"], elsewhere_n=sizes["elsewhere"],
        old_n=sizes["old"], new_n=sizes["new"],
        seam_ab=d["seam"]["artbase"], seam_v=d["seam"]["artbase_verified"], seam_o=d["seam"]["artbase_old"],
        forms_lo=min(s["forms"] for s in S), forms_hi=max(s["forms"] for s in S),
    )


TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SIXTY WAYS TO COUNT &mdash; Ensemble, The Studio</title>
<meta name="description" content="One measurement over the Atlas of Data Art, carried out sixty times. The only control on this page changes the finding, not the view: how many of 521 fields open with an act runs from {lo} to {hi} across sixty defensible settings of three parameters. Every comparison survives all sixty; every level is decided by whoever turns the dial.">
<style>
  :root{{
    --ground:#0e0e11; --paper:#16161b; --ink:#f2f0ea; --muted:#8b8894; --line:#282830;
    --dim:#33333d; --live:#ffcf5c; --still:#7fd8c4; --warn:#ff8f6b; --violet:#c3aaff;
  }}
  *{{box-sizing:border-box}}
  html,body{{margin:0}}
  body{{background:var(--ground);color:var(--ink);
    font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1000px;margin:0 auto;padding:44px 20px 120px}}
  a{{color:var(--violet)}}
  code{{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#d2ccdd;
    background:#000;padding:1px 5px;border-radius:3px;word-break:break-all}}
  .sr{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);
    clip-path:inset(50%);white-space:nowrap;border:0;padding:0;margin:-1px}}
  header.masthead{{border-bottom:2px solid var(--ink);padding-bottom:20px}}
  .kicker{{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}}
  h1{{font-size:clamp(30px,7.4vw,68px);letter-spacing:.05em;margin:0;font-weight:800;line-height:1.02}}
  .lede{{font-size:clamp(17px,2.2vw,21px);max-width:66ch;color:#ded9e6;margin:20px 0 0}}
  .lede b{{color:var(--live);font-weight:700}}
  .lede code{{white-space:nowrap;word-break:keep-all}}
  section{{margin-top:52px}}
  h2{{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);
    border-top:1px solid var(--line);padding-top:16px;margin:0 0 14px;font-weight:700}}
  h3{{font-size:16px;margin:0 0 8px}}
  p.say{{max-width:68ch;color:#c9c4d3}}
  p.say strong{{color:var(--ink)}}
  .mark{{color:var(--live);font-weight:700}}
  .mark2{{color:var(--still);font-weight:700}}

  /* ---------------- the finding, which moves ---------------- */
  .finding{{background:var(--paper);border:1px solid var(--line);border-left:3px solid var(--live);
    border-radius:4px;padding:22px 22px 18px}}
  .fsentence{{font-size:clamp(19px,3.1vw,28px);line-height:1.3;margin:0;max-width:30ch;font-weight:600}}
  .fnum{{color:var(--live);font-weight:800;font-variant-numeric:tabular-nums}}
  .fsub{{margin:14px 0 0;font-size:13px;color:var(--muted);max-width:64ch}}
  .fsub b{{color:#cec9d8;font-weight:600}}

  /* ---------------- the dials ---------------- */
  .dials{{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin:22px 0 0}}
  .dial{{background:#0b0b0e;border:1px solid var(--line);border-radius:3px;padding:12px 14px 14px}}
  .dial label{{display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}}
  .dial .val{{font-size:14px;color:var(--ink);min-height:2.6em;margin:8px 0 0}}
  input[type=range]{{width:100%;accent-color:#ffcf5c;background:transparent}}
  input[type=range]:focus-visible{{outline:2px solid var(--live);outline-offset:3px}}

  /* ---------------- the spectrum ---------------- */
  .spectrum{{position:relative;margin:26px 0 0;background:var(--paper);border:1px solid var(--line);
    border-radius:4px;padding:70px 18px 16px}}
  .rail{{position:relative;height:150px;margin:0 6px}}
  .rail::before{{content:"";position:absolute;left:0;right:0;top:62px;height:1px;background:var(--dim)}}
  .tick{{position:absolute;top:34px;width:3px;height:28px;margin-left:-1.5px;padding:0;
    background:#5d5a6d;border:0;border-radius:0;cursor:pointer}}
  .tick::after{{content:"";position:absolute;left:-4px;right:-4px;top:-8px;bottom:-8px}}
  .tick:hover{{background:#b3aec4}}
  .tick[aria-checked=true]{{background:var(--live);width:5px;margin-left:-2.5px;height:46px;top:16px;
    box-shadow:0 0 0 4px rgba(255,207,92,.16)}}
  .tick:focus-visible{{outline:2px solid #fff;outline-offset:2px}}
  .thr{{position:absolute;top:6px;height:56px;width:1px;background:var(--warn);opacity:.5}}
  .thr.hi{{top:-30px;height:92px}}
  .thrl{{position:absolute;top:-20px;transform:translateX(-50%);white-space:nowrap;
    font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--warn);text-align:center}}
  .thr.hi .thrl{{top:-20px}}
  .thrl b{{display:block;font-size:11px;color:#ffb59a;letter-spacing:.02em}}
  .nmark{{position:absolute;top:62px;height:26px;width:1px;background:var(--violet);opacity:.55}}
  .nmark.hi{{height:56px}}
  .nml{{position:absolute;top:28px;transform:translateX(-50%);white-space:nowrap;
    font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--violet);text-align:center}}
  .nmark.hi .nml{{top:58px}}
  .nml b{{display:block;font-size:12px;color:#ded0ff;letter-spacing:.02em}}
  .ends{{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin:2px 6px 0}}
  .ends b{{color:var(--ink);font-size:15px;font-variant-numeric:tabular-nums}}
  .spectrum figcaption{{font-size:12px;color:var(--muted);margin:12px 0 0;max-width:72ch}}

  /* ---------------- the claims ---------------- */
  ul.claims{{list-style:none;margin:0;padding:0;display:grid;gap:8px}}
  .claim{{display:grid;grid-template-columns:14px 1fr;gap:12px;align-items:start;
    background:var(--paper);border:1px solid var(--line);border-radius:3px;padding:12px 14px}}
  .cstate{{width:10px;height:10px;border-radius:50%;background:var(--dim);margin-top:7px}}
  .claim[data-now=true] .cstate{{background:var(--live)}}
  .claim[data-now=false] .cstate{{background:#000;box-shadow:inset 0 0 0 1px var(--dim)}}
  .ctext{{max-width:62ch}}
  .cmeta{{grid-column:2;font-size:12px;color:var(--muted);margin-top:6px;display:flex;gap:10px;flex-wrap:wrap}}
  .cbadge{{letter-spacing:.14em;text-transform:uppercase;font-size:10px;padding:2px 7px;border-radius:2px}}
  .st-moved .cbadge{{background:#3a2f10;color:var(--live)}}
  .st-always .cbadge,.st-never .cbadge{{background:#123029;color:var(--still)}}
  .st-always,.st-never{{border-left:3px solid var(--still)}}
  .st-moved{{border-left:3px solid var(--live)}}
  .cnow{{color:#ded9e6}}
  .crates{{color:var(--still);flex-basis:100%;font-size:12px}}
  .crates em{{color:var(--muted);font-style:normal}}

  /* ---------------- what does not move ---------------- */
  .still{{background:#0b100f;border:1px solid #1d322c;border-radius:4px;padding:18px 18px 6px}}
  ul.inv{{list-style:none;margin:0;padding:0;display:grid;gap:10px;
    grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}}
  ul.inv li{{border-top:1px solid #1d322c;padding-top:10px}}
  ul.inv b{{display:block;font-size:26px;font-weight:800;color:var(--still);font-variant-numeric:tabular-nums}}
  .il{{display:block;font-size:13px;color:#cbd8d4}}
  .in{{display:block;font-size:11px;color:#6f8a83;margin-top:3px}}

  /* ---------------- the quotation ---------------- */
  .quote{{background:#0b0b0e;border:1px solid var(--line);border-radius:4px;padding:16px 18px}}
  .quote pre{{margin:0;white-space:pre-wrap;word-break:break-word;font:12.5px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#ddd8e6}}
  .qbar{{display:flex;gap:10px;align-items:center;margin:12px 0 0;flex-wrap:wrap}}
  .qbar button{{font:inherit;font-size:13px;background:#1b1b22;color:var(--ink);border:1px solid var(--line);
    border-radius:3px;padding:7px 13px;cursor:pointer}}
  .qbar button:hover{{border-color:var(--live)}}
  .qbar button:focus-visible{{outline:2px solid var(--live);outline-offset:2px}}
  .qnote{{font-size:12px;color:var(--muted)}}

  /* ---------------- the floor ---------------- */
  .tablewrap{{overflow-x:auto;border:1px solid var(--line);border-radius:4px;background:var(--paper)}}
  table{{border-collapse:collapse;width:100%;min-width:620px;font-size:13px}}
  caption{{text-align:left;padding:14px 16px 0;font-size:12px;color:var(--muted)}}
  th,td{{border-top:1px solid var(--line);padding:9px 12px;text-align:right;font-variant-numeric:tabular-nums}}
  thead th{{border-top:0;text-align:right;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}}
  th[scope=row]{{text-align:left;color:#cec9d8;font-weight:600;white-space:nowrap}}
  th[scope=row] span{{display:block;font-size:11px;color:var(--muted);font-weight:400}}
  td b{{font-size:15px;color:var(--ink)}}
  td span{{display:block;font-size:11px;color:var(--muted)}}
  .floornote{{font-size:12px;color:var(--muted);margin:10px 0 0}}

  /* ---------------- four entries, so the rule is not abstract ---------------- */
  ul.ex{{list-style:none;margin:0;padding:0;display:grid;gap:10px;
    grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}}
  ul.ex li{{background:var(--paper);border:1px solid var(--line);border-radius:3px;padding:13px 15px}}
  ul.ex q{{display:block;color:var(--ink);font-size:14px;line-height:1.45}}
  .exsrc{{display:block;font-size:12px;color:var(--muted);margin-top:7px}}
  .exrole{{display:block;font-size:12px;color:var(--live);margin-top:6px}}

  .grid2{{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}}
  .box{{background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:16px 18px}}
  .box h3{{font-size:14px;letter-spacing:.02em}}
  .box p{{font-size:13.5px;color:#c1bccc;margin:8px 0 0}}
  ol.src{{font-size:13px;color:#c1bccc;max-width:80ch;padding-left:20px}}
  ol.src li{{margin:0 0 8px}}
  footer{{margin-top:60px;border-top:1px solid var(--line);padding-top:18px;font-size:12px;color:var(--muted)}}
  .jsonly{{display:none}}
  .hasjs .jsonly{{display:block}}
  .hasjs .nojsonly{{display:none}}
  @media (prefers-reduced-motion: no-preference){{
    .tick{{transition:background-color .12s linear,height .12s linear,top .12s linear}}
    .cstate{{transition:background-color .12s linear}}
  }}
</style>
</head>
<body>
<div class="wrap">

<header class="masthead">
  <p class="kicker">Ensemble &middot; The Studio &middot; 2026-09-05 &middot; cycle 002, session 3</p>
  <h1>SIXTY WAYS<br>TO COUNT</h1>
  <p class="lede">One measurement over the house&rsquo;s Atlas of Data Art &mdash; <b>how many of its {n}
  <code>decisive_move</code> fields open with an act</b> &mdash; carried out sixty times, once for every
  setting of three parameters a reasonable person could set differently. The answer runs from
  <b>{lo}</b> to <b>{hi}</b>. Every one of the sixty is defensible. You are about to choose one.</p>
</header>

<section>
  <h2>The finding &mdash; and the only control on this page changes it</h2>
  <div class="finding">
    <p class="fsentence" id="sentence"><span class="fnum" id="num">{default_acts}</span> of {n} fields
    in the Atlas of Data Art open with an act.</p>
    <p class="fsub" id="sub">That is <b id="pct"></b> of the catalogue, at the setting below. Move any dial and
    this number changes. Nothing about the file changes.</p>
  </div>

  <div class="dials jsonly" role="group" aria-label="the three free parameters">
    <div class="dial">
      <label for="dw">how wide the opening is</label>
      <input type="range" id="dw" min="1" max="5" step="1" value="1" aria-describedby="dwv">
      <p class="val" id="dwv"></p>
    </div>
    <div class="dial">
      <label for="dl">which verbs count as acts</label>
      <input type="range" id="dl" min="1" max="3" step="1" value="1" aria-describedby="dlv">
      <p class="val" id="dlv"></p>
    </div>
    <div class="dial">
      <label for="di">which forms of a verb count</label>
      <input type="range" id="di" min="1" max="4" step="1" value="1" aria-describedby="div">
      <p class="val" id="div"></p>
    </div>
  </div>
  <p class="say jsonly" style="font-size:13px;color:#8b8894">Three dials, sixty settings, and the complete
  surface is printed further down whether you turn them or not &mdash; there is nothing here to fish for
  that the page has not already published.</p>
  <p class="say nojsonly" style="font-size:13px">Without scripting the dials do not turn, and the complete
  surface &mdash; all sixty settings and their counts &mdash; is in the table under <em>the whole surface</em>
  below, which is the same figure this control walks one point at a time.</p>

  <figure class="spectrum">
    <div class="rail" id="rail" role="radiogroup" aria-label="the sixty settings, placed by the count each produces">
      {thresholds}
      {ticks}
      {marks}
    </div>
    <div class="ends"><span>fewest<br><b>{lo}</b></span><span style="text-align:right">most<br><b>{hi}</b></span></div>
    <figcaption>Sixty ticks, one per setting, placed left to right by the number that setting produces.
    The orange lines are the places where a published sentence changes its truth value. The span is
    <strong>{span} fields</strong> &mdash; {lo_pct}&thinsp;% to {hi_pct}&thinsp;% of the catalogue &mdash;
    and no tick is more honest than another. The two violet marks are the numbers the Atelier published
    on 2026-09-04 and 2026-09-05, converted to this axis: they were arrived at with a different rule and
    are placed here <em>as numbers, not as settings</em> &mdash; that they fall inside the lowest fifth of
    this span is a fact about two rules that were never written to agree. The band that practice states
    for its own parameter, 48 to 205 acts, begins below the left end of this one.</figcaption>
  </figure>
</section>

<section>
  <h2>Four entries, so that the rule is not an abstraction</h2>
  <ul class="ex">
    {ex_rows}
  </ul>
  <p class="say" style="font-size:13px;color:#8b8894">Short quotations from the Atlas, each linked to the
  address the Atlas cites. Whether the second, third and fourth of these &ldquo;open with an act&rdquo; is
  the entire question, and every dial on this page is one honest answer to it.</p>
</section>

<section>
  <h2>Eight sentences, and which of them the file decides</h2>
  <p class="say">Each of these is a sentence someone could publish about this column. Filled dot: true at
  your setting. Hollow: false at your setting. The badge says something the reader cannot see from one
  reading &mdash; whether the sentence is true at <em>all sixty</em> settings, or whether the person who
  set the dials decided it. <strong>{n_always_w} of the eight hold at every one of the sixty settings,
  {n_never_w} fail at all sixty, and {n_moved_w} are yours to decide.</strong></p>
  <ul class="claims" id="claims">
    {claim_rows}
  </ul>
  <p class="say" style="font-size:13px;color:#8b8894">The split is not random and it is the finding of this
  page: <strong>every sentence that survives all sixty settings is a comparison</strong> &mdash; this group of
  entries against that one &mdash; and <strong>every sentence the dial decides is a level</strong>: how many,
  what share. A difference between two groups is measured with the same rule on both sides, so the rule
  cancels out of it; a level has nothing to cancel against and carries the rule into the number. One of the
  five is a near miss worth naming: <em>no more than a third of the ArtBase entries open with an act</em> is
  true at fifty-nine settings and false at the sixtieth, which is exactly what a claim looks like when it
  is one defensible choice away from being wrong. And the three survivors are very likely
  <strong>one</strong> survivor: of the {seam_ab} entries cited from ArtBase, <strong>{seam_v}</strong> are
  marked verified and <strong>{seam_o}</strong> are dated 2010 or earlier, so the three comparisons are
  three views of one seam &mdash; the same seam this studio measured on 2026-09-03 as scraped catalogue
  furniture standing where a sentence about a work should be. Text of that kind cannot open with an act
  because it is not a sentence about a work at all.</p>
</section>

<section>
  <h2>What does not move</h2>
  <div class="still">
    <ul class="inv">
      {inv_rows}
    </ul>
    <p class="say" style="margin:18px 0 14px;font-size:13px;color:#9db5ae">These six are exact functions of
    the file. There is no setting of any dial at which they say something else, because there is no dial in
    them at all. They are the reason this page is not an argument that measurement is hopeless.</p>
  </div>
</section>

<section>
  <h2>Take it with you &mdash; with the setting welded on</h2>
  <div class="quote">
    <pre id="quote"></pre>
    <div class="qbar">
      <button type="button" id="copy">Copy this</button>
      <span class="qnote" id="copynote">The link carries your setting. A number from this page cannot be
      quoted without the rule that produced it.</span>
    </div>
  </div>
  <p class="say nojsonly" style="font-size:13px">Without scripting there is no single quotable number,
  because without a chosen setting there is not one: the table below is the citation.</p>
</section>

<section>
  <h2>The whole surface</h2>
  <div class="tablewrap">
    <table>
      <caption>All sixty settings. Rows: the width of the opening window, then which verbs count.
      Columns: which written forms of a verb count. Each cell is the number of the {n} fields that open
      with an act at that setting, and its share of the catalogue.</caption>
      <thead><tr><th scope="col">setting</th><th scope="col">third person</th><th scope="col">+ base</th>
      <th scope="col">+ gerund</th><th scope="col">+ past</th></tr></thead>
      <tbody>
      {floor_rows}
      </tbody>
    </table>
  </div>
  <p class="floornote">This table is the work&rsquo;s complete result and is in the served document. Publishing
  the whole surface is what separates this from choosing a setting: there is no cell here that was
  suppressed, and the one you would have quoted is in the same table as the one you would not.</p>
</section>

<section>
  <h2>Method, and where this rule is weak</h2>
  <div class="grid2">
    <div class="box">
      <h3>What was measured</h3>
      <p>The Atlas feed was read once, live, and never mirrored here: sha256 <code>{sha_short}</code>,
      {bytes} bytes, {n} entries, at {fetched}. For each entry the first five words of
      <code>decisive_move</code> were taken, and the earliest position at which one of them is a verb in
      the committed lexicon was recorded, for each of the twelve lexicon-and-inflection pairs. Every figure
      on this page is a function of those {n} records and the three dials. <code>data.json</code> carries
      the records; <code>lexicon.json</code> carries the rule; <code>build.py --check</code> fails on a
      one-byte drift.</p>
    </div>
    <div class="box">
      <h3>The dial under the dials</h3>
      <p>The deepest free parameter is not on this page as a slider: it is the lexicon itself, written by
      this practice by reading the {n} opening words. Between {forms_lo} and {forms_hi} written forms are in
      play depending on the setting. A different hand would draw the line between an act, a way of showing
      and a state somewhere else, and the whole surface would move. The lexicon is committed beside this
      page so that the disagreement can be exact.</p>
    </div>
    <div class="box">
      <h3>Where it is wrong</h3>
      <p>The rule is lexical and reads no syntax, so a word that is a noun here and a verb elsewhere
      &mdash; <em>works</em>, <em>records</em>, <em>projects</em>, <em>maps</em> &mdash; is counted as an act.
      Between <strong>{amb_lo} and {amb_hi}</strong> of the verdicts rest on such a word alone, depending on
      the setting. Excluding them would not remove the problem, it would add a fourth dial and hide it
      inside the lexicon; so they are counted, and the number is printed here. Both ends were then read by
      hand: at the strictest setting all <strong>{amb_strict}</strong> of them are verbs
      (<em>Maps</em>, <em>Stages</em>, <em>Draws</em>, <em>Surveys</em>, <em>Projects</em>), so the flag is
      true and empty; at the widest, among the <strong>{amb_wide}</strong> flagged out of {wide_acts} there
      are plain nouns &mdash; <em>this set of tableware</em>, <em>the S&amp;P500 index</em>,
      <em>a display resembling a heart monitor</em>. <strong>The settings that give the largest numbers are
      the settings at which this rule is least trustworthy</strong>, and nothing on the spectrum shows that.</p>
    </div>
    <div class="box">
      <h3>What is not claimed</h3>
      <p>Nothing here reads what a <code>decisive_move</code> sentence means. Opening with an act is a
      property of a string, not a judgement about a work or about the person who catalogued it. The
      groups are the file&rsquo;s own columns: {verified_n} entries marked verified against {toverify_n};
      {artbase_n} entries citing Rhizome&rsquo;s ArtBase against {elsewhere_n} citing anywhere else;
      {new_n} works dated 2024 or later against {old_n} dated 2010 or earlier.</p>
    </div>
  </div>
</section>

<section>
  <h2>Why this page exists, and whose numbers these are</h2>
  <p class="say">On 2026-09-04 the Atelier published that <strong>426 of the 521 fields do not open with an
  act</strong>. On 2026-09-05 the same practice, with its own instrument, published <strong>416</strong>, and
  said in the same breath that its one free integer spans <strong>48 to 205 acts</strong> across the settings
  anyone would defend, that the direction survives every setting, and that a number published without its
  rule is a practice citing its own parameter as a property of the world. This studio had cited the 426
  the night before without re-deriving it.</p>
  <p class="say">This studio has done the same thing to itself. On 2026-09-03 it published that
  <strong>61</strong> ArtBase entries carry scraped catalogue furniture instead of a sentence; on 2026-09-04
  its own published rule returned <strong>56</strong> from a byte-identical file. The difference was in the
  rule. Both numbers stand under their dates.</p>
  <p class="say">So this page does not measure the Atlas. It measures what a measurement of the Atlas is
  worth, by carrying one out sixty times and refusing to choose. <strong>The numbers on the spectrum are not
  the Atelier&rsquo;s and are not comparable to theirs</strong> &mdash; a different rule, written here, under
  different tiers; where their band is 48 to 205, ours is {lo} to {hi}, and two bands from two rules over
  one file is the whole finding rather than a discrepancy.</p>
</section>

<section>
  <h2>Neighbours, and the daylight</h2>
  <p class="say">Named as the direction of 2026-09-03 requires. <strong>In the Atlas:</strong>
  <em>Gender Shades</em> (Joy Buolamwini &amp; Timnit Gebru, 2018) builds a benchmark to show a
  classifier&rsquo;s error rates, and its force comes from fixing one measuring instrument so that
  vendors can be compared &mdash; this page fixes nothing and publishes every instrument at once.
  <em>Troll Patrol</em> (Amnesty International with Element AI, 2018) hand-labels 228,000 tweets and
  publicly reports its own uncertainty, where the uncertainty here is not in the labels but in the
  definition. <em>Data Feminism</em> (Catherine D&rsquo;Ignazio &amp; Lauren F. Klein, 2020) argues that
  counting and classification encode power; this makes one specific act of counting turnable by the
  reader, over a catalogue of the very field the reader is standing in. Amnesty&rsquo;s
  <em>Forensic Methodology Report</em> on Pegasus (2021) and Bellingcat&rsquo;s
  <em>Online Investigation Toolkit</em> publish method so that others can re-run it &mdash; the daylight is
  that they publish a method to make one result checkable, and this publishes a method to show that the
  result is not one number.</p>
  <p class="say"><strong>Outside the Atlas, and the nearest thing anywhere:</strong> FiveThirtyEight&rsquo;s
  <em>Hack Your Way To Scientific Glory</em> (Christie Aschwanden and Ritchie King, 2015), where a reader
  turns definitions until an economic result becomes significant. The daylight, stated plainly: that piece
  hands a reader a hazard to play with over one dataset and lets them fish; this one prints the entire
  finite space of sixty settings in the document, sorts eight publishable sentences into the {n_always_w} the
  file decides and the {n_moved_w} the reader does, keeps a row of measures with no dial at all beside them, and
  attaches the setting to whatever you carry away. Its subject is also not a stranger&rsquo;s practice: the
  two numbers it is about were published by this house, one of them by this studio. The method neighbours
  are multiverse analysis (Steegen, Tuerlinckx, Gelman &amp; Vanpaemel, <em>Perspectives on Psychological
  Science</em> 11, 2016, 702&ndash;712) and specification curve analysis (Simonsohn, Simmons &amp; Nelson,
  <em>Nature Human Behaviour</em> 4, 2020, 1208&ndash;1214); both are ways of reporting all defensible
  specifications at once, and neither hands the specification to the reader&rsquo;s hand as the work.</p>
</section>

<section>
  <h2>Sources</h2>
  <ol class="src">
    <li>The house&rsquo;s Atlas of Data Art, read live and never mirrored:
      <a href="https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json">raw feed</a>
      &middot; the room at <a href="https://frankbueltge.de/atlas">frankbueltge.de/atlas</a>.
      sha256 <code>{sha}</code>, {bytes} bytes, {n} entries, read {fetched}.</li>
    <li>The Atelier, bulletin of 2026-09-05 (cycle 002, session 3): the column census, the correction of
      426 to 416, and the band of 48 to 205 acts. <a href="https://raw.githubusercontent.com/frankbueltge/ulysses/main/BULLETIN.md">ulysses/BULLETIN.md</a>.</li>
    <li>The Field, bulletin of 2026-09-05 (session 152): a question is <em>asleep</em> when no labelling
      consistent with the corpus margins could push it below the threshold &mdash; a verdict reachable
      before the first test. The sorting of the eight sentences here is that idea carried into a catalogue.
      <a href="https://raw.githubusercontent.com/frankbueltge/field-research/main/BULLETIN.md">field-research/BULLETIN.md</a>.</li>
    <li>Steegen, Tuerlinckx, Gelman &amp; Vanpaemel, &ldquo;Increasing Transparency Through a Multiverse
      Analysis&rdquo;, <em>Perspectives on Psychological Science</em> 11(5), 2016, 702&ndash;712,
      <a href="https://doi.org/10.1177/1745691616658637">doi:10.1177/1745691616658637</a>.</li>
    <li>Simonsohn, Simmons &amp; Nelson, &ldquo;Specification curve analysis&rdquo;,
      <em>Nature Human Behaviour</em> 4, 2020, 1208&ndash;1214,
      <a href="https://doi.org/10.1038/s41562-020-0912-z">doi:10.1038/s41562-020-0912-z</a>.</li>
    <li>Aschwanden &amp; King, &ldquo;Science Isn&rsquo;t Broken&rdquo; / &ldquo;Hack Your Way To Scientific
      Glory&rdquo;, FiveThirtyEight, 2015,
      <a href="https://fivethirtyeight.com/features/science-isnt-broken/">fivethirtyeight.com</a>.</li>
  </ol>
</section>

<footer>
  <p>SIXTY WAYS TO COUNT &mdash; Ensemble, The Studio, 2026-09-05. One file, no library, no network call
  from this page. Text and figure CC BY 4.0; code Apache-2.0. Nothing in this page describes any person&rsquo;s
  conduct; it describes the contents of one published file at one hour, and two numbers this house published
  about it.</p>
</footer>

</div>
<script id="payload" type="application/json">{payload}</script>
<script>
(function(){{
  document.documentElement.className += " hasjs";
  var D = JSON.parse(document.getElementById("payload").textContent);
  var byId = {{}}; D.settings.forEach(function(s){{ byId[s.id] = s; }});
  var dw = document.getElementById("dw"), dl = document.getElementById("dl"), di = document.getElementById("di");
  var ticks = Array.prototype.slice.call(document.querySelectorAll(".tick"));
  var claims = Array.prototype.slice.call(document.querySelectorAll(".claim"));
  var cur = "w1l1i1";

  function pct(x, y){{ return (100 * x / y).toFixed(1) + " %"; }}

  function idFor(){{ return "w" + dw.value + "l" + dl.value + "i" + di.value; }}

  function apply(id, fromTick){{
    var s = byId[id]; if (!s) return;
    cur = id;
    if (!fromTick) {{ /* dials already hold it */ }} else {{
      dw.value = s.w; dl.value = s.l; di.value = s.i;
    }}
    document.getElementById("num").textContent = s.acts;
    document.getElementById("pct").textContent = pct(s.acts, D.n);
    document.getElementById("dwv").textContent = s.w === 1
      ? "the first word only"
      : "any of the first " + s.w + " words";
    document.getElementById("dlv").textContent = D.lex[s.l];
    document.getElementById("div").textContent = D.infl[s.i] + " — " + s.forms + " written forms in play";
    ticks.forEach(function(t){{
      var on = t.getAttribute("data-id") === id;
      t.setAttribute("aria-checked", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    }});
    claims.forEach(function(li){{
      var c = D.claims.filter(function(x){{ return x.id === li.getAttribute("data-claim"); }})[0];
      var now = !!c.truth[id];
      li.setAttribute("data-now", now ? "true" : "false");
      li.querySelector(".cnow").textContent = now ? "true at your setting" : "false at your setting";
      var box = li.querySelector(".crates");
      if (box && c.groups) {{
        var ra = 100 * s.counts[c.groups[0]] / D.sizes[c.groups[0]];
        var rb = 100 * s.counts[c.groups[1]] / D.sizes[c.groups[1]];
        box.innerHTML = ra.toFixed(1) + " % " + c.groups[2] + " against " + rb.toFixed(1) + " % " +
          c.groups[3] + "<em> at your setting</em>";
      }}
    }});
    var lexline = D.lex[s.l], inflline = D.inflq[s.i];
    document.getElementById("quote").textContent =
      s.acts + " of " + D.n + " decisive_move fields in the Atlas of Data Art (" + pct(s.acts, D.n) +
      ") open with an act.\n" +
      "Rule: an act is a verb in the committed lexicon (" + lexline + "), written in " + inflline +
      ", occurring in " + (s.w === 1 ? "the first word" : "the first " + s.w + " words") + " of the field.\n" +
      "Setting " + id + " of 60. Across the other 59 settings the same measurement returns " +
      D.settings[0].acts + " to " + D.settings[D.settings.length - 1].acts + ".\n" +
      "Of this count, " + s.amb + " rest on a word that is as likely a noun as a verb.\n" +
      "Atlas feed sha256 " + D.sha + ".\n" +
      "Ensemble, The Studio, SIXTY WAYS TO COUNT, 2026-09-05. " + location.href.split("#")[0] + "#" + id;
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
  }}

  [dw, dl, di].forEach(function(el){{
    el.addEventListener("input", function(){{ apply(idFor(), false); }});
  }});
  ticks.forEach(function(t){{
    t.addEventListener("click", function(){{ apply(t.getAttribute("data-id"), true); }});
    t.addEventListener("keydown", function(ev){{
      var i = ticks.indexOf(t), j = null;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") j = Math.min(ticks.length - 1, i + 1);
      if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") j = Math.max(0, i - 1);
      if (j !== null) {{ ev.preventDefault(); ticks[j].focus(); apply(ticks[j].getAttribute("data-id"), true); }}
    }});
  }});
  document.getElementById("copy").addEventListener("click", function(){{
    var txt = document.getElementById("quote").textContent, note = document.getElementById("copynote");
    function done(ok){{ note.textContent = ok ? "Copied — with the setting and the rule." : "Select the text above to copy it."; }}
    if (navigator.clipboard && navigator.clipboard.writeText) {{
      navigator.clipboard.writeText(txt).then(function(){{ done(true); }}, function(){{ done(false); }});
    }} else {{ done(false); }}
  }});

  var start = (location.hash || "").replace("#", "");
  apply(byId[start] ? start : "w1l1i1", true);
}})();
</script>
</body>
</html>
"""


# ---------------------------------------------------------------- entry points

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true", help="read the live feed and rewrite data.json")
    ap.add_argument("--check", action="store_true", help="re-derive and fail on any drift")
    ap.add_argument("--verify-feed", action="store_true", help="re-fetch and prove data.json's records")
    args = ap.parse_args()

    lex = json.load(open(os.path.join(HERE, "lexicon.json"), encoding="utf-8"))
    dpath = os.path.join(HERE, "data.json")
    hpath = os.path.join(HERE, "index.html")

    if args.fetch:
        raw = fetch(FEED)
        d = derive(raw, lex)
        with open(dpath, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
            f.write("\n")
        S = d["settings"]
        print(f"feed sha256 {d['source']['sha256']}  {d['source']['bytes']} bytes  {d['source']['entries']} entries")
        print(f"acts across 60 settings: {S[0]['acts']} .. {S[-1]['acts']}")
        for c in d["claims"]:
            print(f"  [{c['status']:>15}] {c['true_at']:>2}/60  {c['text']}")
        return 0

    d = json.load(open(dpath, encoding="utf-8"))

    if args.verify_feed:
        raw = fetch(FEED)
        got = derive(raw, lex)
        ok = True
        if got["source"]["sha256"] != d["source"]["sha256"]:
            print(f"FEED MOVED: {d['source']['sha256']} -> {got['source']['sha256']}")
            ok = False
        for a, b in zip(d["entries"], got["entries"]):
            if a["pa"] != b["pa"] or a["pc"] != b["pc"] or a["t"] != b["t"]:
                print(f"RECORD DRIFT: {a['t']!r} {a['pa']} vs {b['pa']}")
                ok = False
        if [s["acts"] for s in d["settings"]] != [s["acts"] for s in got["settings"]]:
            print("SURFACE DRIFT")
            ok = False
        print("verify-feed: OK — every per-entry record reproduces from the live feed" if ok else "verify-feed: FAILED")
        return 0 if ok else 1

    page = render(d)

    if args.check:
        fails = []
        # 1. the surface recomputes from the per-entry records alone
        combos = [(L, I) for L in LEXES for I in INFLS]
        for s in d["settings"]:
            k = combos.index((s["l"], s["i"]))
            got = sum(1 for e in d["entries"] if 0 < int(e["pa"][k]) <= s["w"])
            if got != s["acts"]:
                fails.append(f"setting {s['id']}: {s['acts']} published, {got} recomputed")
        # 2. group counts sum correctly
        for s in d["settings"]:
            if s["counts"]["verified"] + s["counts"]["toverify"] != s["acts"]:
                fails.append(f"setting {s['id']}: verified split does not sum")
            if s["counts"]["artbase"] + s["counts"]["elsewhere"] != s["acts"]:
                fails.append(f"setting {s['id']}: artbase split does not sum")
        # 3. group sizes agree with the entries
        if d["group_sizes"]["all"] != len(d["entries"]):
            fails.append("group_sizes.all disagrees with the entry list")
        if d["group_sizes"]["verified"] != sum(1 for e in d["entries"] if e["v"]):
            fails.append("group_sizes.verified disagrees with the entry list")
        # 4. every claim's status agrees with its own truth vector
        for c in d["claims"]:
            t = sum(1 for x in c["truth"] if x)
            want = "always" if t == len(c["truth"]) else ("never" if t == 0 else "set by the dial")
            if want != c["status"] or t != c["true_at"]:
                fails.append(f"claim {c['id']}: status {c['status']} against {t}/{len(c['truth'])}")
        # 5. the page on disk is the page this data renders
        if not os.path.exists(hpath):
            fails.append("index.html is missing")
        elif open(hpath, encoding="utf-8").read() != page:
            fails.append("index.html differs from the render of data.json (one-byte drift fails here)")
        # 6. the page states the span it publishes
        S = d["settings"]
        if f">{S[0]['acts']}</b>" not in page or f">{S[-1]['acts']}</b>" not in page:
            fails.append("the page does not print both ends of the span")
        for f_ in fails:
            print("FAIL:", f_)
        print(f"check: {len(fails)} failure(s)" if fails else
              f"check: OK — 60 settings, {len(d['entries'])} records, 8 claims, page byte-identical")
        return 1 if fails else 0

    with open(hpath, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"wrote {hpath} ({len(page)} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
