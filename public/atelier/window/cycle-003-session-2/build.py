#!/usr/bin/env python3
"""build.py — cycle 003, session 2: the number was an endpoint.

The reach-outside session of this cycle (PROTOCOL v7 §5.2.3). The primary text is
Charles F. Manski, *Inference with Imputed Data: The Allure of Making Stuff Up*
(arXiv:2205.07388, May 2022, 19 pp.), read in full on 2026-09-09 — econometrics of
partial identification, a field this practice has never worked. What it supplies is the
one thing last night's session did not have: an exact interval for a quantity that
cannot be observed completely, and a rule for saying which assumption bought which
contraction of it.

The material is the same file as last night's, at the same digest: the house's
`/atlas/werke.json`, read live and never mirrored, and this practice's own committed
reading of the 55 entries two word-screens flagged
(`window/cycle-003-session-1/reading.json`). Nothing new is read from the world.

    python3 window/cycle-003-session-2/build.py            # fetches the feed
    python3 window/cycle-003-session-2/build.py --local F  # from a saved copy
    python3 window/cycle-003-session-2/build.py --check     # rebuild must be byte-identical

Writes `data.json` (every number the page states) and `index.html` (self-contained: no
network at runtime, no library, opens from a filesystem). Verified by `check.py` against
the record and by `verify.mjs` in a real browser with scripting on and off.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import math
import pathlib
import re
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SESSION_1 = ROOT / "window" / "cycle-003-session-1"
sys.path.insert(0, str(ROOT / "tools" / "absence"))

import identify as ID  # noqa: E402

FEED_URL = "https://frankbueltge.de/atlas/werke.json"
ATLAS_SHA_SINCE_2026_09_03 = (
    "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"
)
DATE = "2026-09-09"
QUESTION = "Missing Data Art"
SEED_ID = "seed-20260907-220129-aa5f"
TITLE = "The number was an endpoint, not an estimate"

# The two screens, copied from session 1's build rather than imported, so that this
# artifact is readable on its own — and asserted below to reproduce that session's
# committed counts exactly. If a copy ever drifts from the record, the build fails.
WORDS_ABSENCE = [
    "missing", "absence", "absent", "gap", "gaps", "erasure", "erased", "unrecorded",
    "undocumented", "uncounted", "no data", "silence", "silenced", "omitted",
    "omission", "blank", "void", "deleted", "deletion", "disappeared",
    "disappearance", "invisible", "unseen", "untold", "lost", "forgotten",
    "redacted", "redaction", "withheld", "censored", "censorship", "suppressed",
    "refusal", "opacity", "unknown", "excluded", "exclusion", "uncollected",
    "non-counting", "not collected", "never recorded",
]
WORDS_COUNTER = [
    "counterdata", "counter-data", "undercount", "undercounted", "underreported",
    "unregistered", "unnamed", "denied", "refuse", "refuses", "refused", "refusing",
    "freedom of information", "foia", "declassified", "classified", "shadow",
    "off the record", "no record", "without papers", "stateless", "not exist",
    "does not exist", "never collected", "left uncollected", "statelessness",
    "disappearances", "archival silence", "under-representation", "underrepresented",
    "not represented", "no dataset", "anonymised", "anonymized", "withdraw",
    "opt out", "opting out",
]

# The primary text of the reach-outside, and the passages this page actually uses.
# Short quotations with their source, as §7 of the protocol requires; no source file is
# committed to this repository.
SOURCE = {
    "author": "Charles F. Manski",
    "work": "Inference with Imputed Data: The Allure of Making Stuff Up",
    "year": 2022,
    "venue": "arXiv:2205.07388 [econ.EM], 15 May 2022, 19 pp.",
    "url": "https://arxiv.org/abs/2205.07388",
    "read": "2026-09-09, in full, from the publisher's PDF",
    "field": "econometrics — partial identification of probability distributions",
}
QUOTES = [
    {
        "at": "abstract",
        "text": "There is no panacea for missing data. What one can learn about a "
                "population parameter depends on the assumptions one finds credible to "
                "maintain.",
        "used_for": "the whole shape of this page: an interval per assumption set, "
                    "rather than one number per method.",
    },
    {
        "at": "§1",
        "text": "Inference without assumptions requires contemplation of all logically "
                "possible distributions of the missing data. Doing so yields the set of "
                "all possible values of P(y|x), its identification region.",
        "used_for": "the definition of the widest bar in figure 1.",
    },
    {
        "at": "§3.1.1, of the assumption that missing values are distributed like the "
              "observed ones",
        "text": "Equation (7a) is an untestable assumption.",
        "used_for": "the status badge on the recall rung — and the reason the "
                    "second-detector arithmetic of figure 2 is worth having, since it "
                    "is the one thing here that does bear on the unread entries.",
    },
    {
        "at": "§4",
        "text": "Section 3.1 showed that assumption-free interval estimation is simple "
                "with missing outcome data.",
        "used_for": "the claim that the widest bar cost one line of arithmetic.",
    },
]
DUNCAN_DAVIS = {
    "authors": "Otis Dudley Duncan and Beverly Davis",
    "work": "An Alternative to Ecological Correlation",
    "year": 1953,
    "venue": "American Sociological Review 18, 665–666",
    "known_from": "Manski (2022) §3.2.2, which restates their interval as its "
                  "equation (19); the 1953 paper itself was not read for this session "
                  "and nothing here rests on its wording.",
}

PALETTE = {
    "ink": "#141414", "paper": "#faf9f7", "rule": "#d9d5cd", "mid": "#6b6660",
    "occupied": "#2f4858", "mark": "#b4451f", "soft": "#8a9ba8",
    "band": "#c9d3d9", "dead": "#efece6",
}


# --------------------------------------------------------------------------------- #
# The feed and the practice's own record
# --------------------------------------------------------------------------------- #


def read_feed(local: pathlib.Path | None) -> tuple[dict, str]:
    if local is not None:
        raw = local.read_bytes()
    else:
        req = urllib.request.Request(
            FEED_URL,
            headers={"User-Agent": "ulysses-atelier-research/1.0 (+https://frankbueltge.de)"},
        )
        with urllib.request.urlopen(req, timeout=60) as r:  # noqa: S310 — a pinned https feed
            raw = r.read()
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest()


def word_pattern(words: list[str]) -> re.Pattern:
    return re.compile(r"\b(" + "|".join(re.escape(w) for w in words) + r")\b", re.I)


def screen(entries: list[dict], words: list[str]) -> set[int]:
    pat = word_pattern(words)
    out = set()
    for i, e in enumerate(entries):
        text = f"{e.get('decisive_move') or ''} || {e.get('title') or ''}"
        if pat.search(text):
            out.add(i)
    return out


def pct(x: float, places: int = 1) -> str:
    return f"{100 * x:.{places}f} %"


def pts(x: float, places: int = 2) -> str:
    return f"{100 * x:.{places}f} points"


def esc(s: object) -> str:
    return html.escape(str(s), quote=False)


# --------------------------------------------------------------------------------- #
# Figures
# --------------------------------------------------------------------------------- #

RUNG_LABEL = {
    "": "nothing assumed",
    "recall": "the screens see everything",
    "floor": "the two screens are independent detectors",
    "monotone": "the unscreened rate is no higher",
    "floor+recall": "independent detectors + the screens see everything",
    "monotone+recall": "no higher + the screens see everything",
    "floor+monotone": "independent detectors + no higher",
    "floor+monotone+recall": "all three at once",
}
# Shorter forms, for the figure's left gutter only. The table and the readout carry the
# labels above; a figure that wraps its own axis labels is a figure nobody reads.
FIG_LABEL = {
    "": "nothing assumed",
    "recall": "screens see everything",
    "floor": "independent detectors",
    "monotone": "unscreened rate no higher",
    "floor+recall": "independent + sees everything",
    "monotone+recall": "no higher + sees everything",
    "floor+monotone": "independent + no higher",
    "floor+monotone+recall": "all three at once",
}
RUNG_STATUS = {
    "recall": ("untestable", "No screen can show that a further word list would find "
                             "nothing. Manski's equation (7a) is the same shape."),
    "floor": ("bias direction known", "Two absence-vocabulary lists trip together more "
                                      "often than independence allows, which biases the "
                                      "estimate downwards — so it is a floor."),
    "monotone": ("weak, and stated", "78 words fired on 55 entries; that an entry none "
                                     "of them touched is of the kind at a HIGHER rate "
                                     "than one they did would be remarkable."),
}


def bar_figure(regs: list[dict], n: int, published: float, w: int = 780) -> str:
    """Figure 1's still frame: every one of the eight compositions, on one axis."""
    left, right, top, row, gap = 240, 96, 26, 22, 6
    inner = w - left - right
    h = top + len(regs) * (row + gap) + 34
    x = lambda v: left + v * inner  # noqa: E731
    parts = [
        f'<svg class="ladder" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
        f'role="img" aria-label="the identification region for the fraction, under '
        f'each of eight compositions of three assumptions">'
    ]
    for frac, lab in ((0.0, "0 %"), (0.25, "25"), (0.5, "50"), (0.75, "75"), (1.0, "100 %")):
        parts.append(f'<line class="ax" x1="{x(frac):.1f}" y1="{top - 8}" '
                     f'x2="{x(frac):.1f}" y2="{h - 26}"/>')
        parts.append(f'<text class="slab" x="{x(frac):.1f}" y="{h - 12}">{lab}</text>')
    parts.append(f'<line class="pub" x1="{x(published):.1f}" y1="{top - 12}" '
                 f'x2="{x(published):.1f}" y2="{h - 26}"/>')
    parts.append(f'<text class="publab" x="{x(published) + 4:.1f}" y="{top - 14}">'
                 f'published 09-08: {pct(published)}</text>')
    for k, r in enumerate(regs):
        y = top + k * (row + gap)
        key = "+".join(r["assume"])
        parts.append(f'<text class="axlab" x="{left - 10}" y="{y + row - 7}">'
                     f'{esc(FIG_LABEL[key])}</text>')
        if not r["feasible"]:
            parts.append(f'<rect class="dead" x="{left}" y="{y}" width="{inner}" '
                         f'height="{row}"/>')
            parts.append(f'<text class="deadlab" x="{left + 8}" y="{y + row - 6}">'
                         f'no value of the fraction satisfies these together</text>')
            continue
        bw = max(1.6, (r["hi"] - r["lo"]) * inner)
        parts.append(f'<rect class="band" x="{x(r["lo"]):.1f}" y="{y}" '
                     f'width="{bw:.1f}" height="{row}"/>')
        # The width goes inside a bar wide enough to hold it and outside a narrow one, so
        # that no label ever lands on the gutter that carries the composition's name.
        label = f"{pts(r['hi'] - r['lo'])} wide"
        if bw > 8 * len(label):
            tx, anchor, cls = x(r["hi"]) - 7, "end", "wlab in"
        else:
            tx, anchor, cls = x(r["hi"]) + 7, "start", "wlab"
        parts.append(f'<text class="{cls}" x="{tx:.1f}" y="{y + row - 6}" '
                     f'text-anchor="{anchor}">{label}</text>')
    parts.append("</svg>")
    return "".join(parts)


def detector_figure(cap: dict, w: int = 640) -> str:
    """Figure 2: what two disjoint word lists caught, and what neither of them did."""
    blocks = [
        ("screen 1 only", cap["a1"] - cap["both"], "seen"),
        ("both screens", cap["both"], "seen"),
        ("screen 2 only", cap["a2"] - cap["both"], "seen"),
        ("neither screen", cap["unseen_lp"], "unseen"),
    ]
    total = sum(b[1] for b in blocks)
    left, right, top, hgt = 20, 20, 34, 58
    inner = w - left - right
    h = top + hgt + 62
    parts = [
        f'<svg class="detect" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" '
        f'aria-label="the works of the kind each screen caught, and the number the '
        f'two-detector arithmetic says neither caught">'
    ]
    xx = float(left)
    for k, (lab, cnt, kind) in enumerate(blocks):
        bw = inner * cnt / total
        mid = xx + bw / 2
        # Two of the four blocks are narrow, so their names are set on alternating rows
        # with a leader down to the block rather than overprinting each other.
        ly = top + hgt + (16 if k % 2 == 0 else 30)
        parts.append(f'<rect class="{kind}" x="{xx:.1f}" y="{top}" width="{bw:.1f}" '
                     f'height="{hgt}"/>')
        parts.append(f'<text class="n" x="{mid:.1f}" y="{top + 34}">'
                     f'{"" if kind == "seen" else "≈"}{cnt:.0f}</text>')
        parts.append(f'<line class="lead" x1="{mid:.1f}" y1="{top + hgt + 2}" '
                     f'x2="{mid:.1f}" y2="{ly - 8:.1f}"/>')
        parts.append(f'<text class="slab" x="{mid:.1f}" y="{ly:.1f}">{esc(lab)}</text>')
        xx += bw
    parts.append(f'<text class="note" x="{left}" y="{top - 12}">'
                 f'22 read as being of the kind · Lincoln–Petersen total '
                 f'{cap["lincoln_petersen"]:.1f} · Chapman {cap["chapman"]:.1f}</text>')
    parts.append(f'<text class="note" x="{left}" y="{top + hgt + 50}">'
                 f'the fourth block is not observed; positive dependence between the two '
                 f'lists makes it a floor</text>')
    parts.append("</svg>")
    return "".join(parts)


def width_figure(split: dict, w: int = 640) -> str:
    """Figure 3: the 90 points of width, attributed to the two halves of the catalogue."""
    left, right, top, hgt = 20, 20, 40, 46
    inner = w - left - right
    h = top + hgt + 30
    total = split["free_all"]
    parts = [
        f'<svg class="width" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" '
        f'aria-label="the width of the assumption-free interval, split into the part '
        f'contributed by verified entries and by unverified ones">'
    ]
    xx = float(left)
    for key, lab, kind in (("free_verified", "entries somebody has checked", "seen"),
                           ("free_unverified", "entries nobody has checked", "unseen2")):
        cnt = split[key]
        bw = inner * cnt / total
        parts.append(f'<rect class="{kind}" x="{xx:.1f}" y="{top}" width="{bw:.1f}" '
                     f'height="{hgt}"/>')
        parts.append(f'<text class="n" x="{xx + bw / 2:.1f}" y="{top + 21}">'
                     f'{pts(cnt / split["n"])}</text>')
        parts.append(f'<text class="n" x="{xx + bw / 2:.1f}" y="{top + 37}">'
                     f'{cnt} entries free</text>')
        parts.append(f'<text class="slab" x="{xx + bw / 2:.1f}" y="{top + hgt + 16}">'
                     f'{esc(lab)}</text>')
        xx += bw
    parts.append(f'<text class="note" x="{left}" y="{top - 14}">'
                 f'the assumption-free interval is {pts(total / split["n"])} wide, and '
                 f'none of that is sampling error — every entry was read</text>')
    parts.append("</svg>")
    return "".join(parts)


# --------------------------------------------------------------------------------- #
# The record
# --------------------------------------------------------------------------------- #


def compute(entries: list[dict], sha: str) -> dict:
    n = len(entries)
    s1, s2 = screen(entries, WORDS_ABSENCE), screen(entries, WORDS_COUNTER)
    reading = json.loads((SESSION_1 / "reading.json").read_text(encoding="utf-8"))
    verdicts = {r["index_in_feed"]: r for r in reading["verdicts"]}
    read = set(verdicts)

    # The copied screens must reproduce session 1's committed record exactly.
    if read != (s1 | s2):
        raise SystemExit("the screens no longer flag the entries session 1 read")
    if reading["feed_sha256"] != sha:
        raise SystemExit(f"the feed moved: read at {reading['feed_sha256']}, now {sha}")

    yes = {i for i, r in verdicts.items() if r["verdict"] == "yes"}
    no = {i for i, r in verdicts.items() if r["verdict"] == "no"}
    bor = {i for i, r in verdicts.items() if r["verdict"] == "borderline"}
    unscreened = set(range(n)) - read
    ver = {i for i, e in enumerate(entries) if e.get("verify_status") == "verified"}
    unv = set(range(n)) - ver

    cap = ID.capture(a1=len(yes & s1), a2=len(yes & s2), both=len(yes & s1 & s2))
    cap_b = ID.capture(a1=len((yes | bor) & s1), a2=len((yes | bor) & s2),
                       both=len((yes | bor) & s1 & s2))
    screened_rate_max = (len(yes) + len(bor)) / len(read)
    regs = ID.ladder(n, len(yes), len(bor), len(unscreened),
                     cap.lincoln_petersen, screened_rate_max)

    def half(H: set[int]) -> dict:
        return {
            "n": len(H), "read": len(H & read), "yes": len(H & yes), "no": len(H & no),
            "borderline": len(H & bor), "unscreened": len(H - read),
            "free": len(H & bor) + len(H - read),
            "rate_read": (len(H & yes) / len(H & read)) if (H & read) else None,
        }

    hv, hu = half(ver), half(unv)
    corr = {
        # Last night's number, and the same statistic asked of the right reference set.
        "filed_2026_09_08": ID.hyper_ge(n, len(ver), len(yes), len(yes & ver)),
        "conditioned_on_read": ID.hyper_ge(len(read), len(read & ver), len(yes),
                                           len(yes & ver)),
        "fisher_on_read": ID.fisher_one_sided(len(ver & yes), len(ver & no),
                                              len(unv & yes), len(unv & no)),
        "screen_bias": ID.hyper_ge(n, len(ver), len(read), len(read & ver)),
        "cells": [len(ver & yes), len(ver & no), len(unv & yes), len(unv & no)],
        "verified_share_all": len(ver) / n,
        "verified_share_read": len(read & ver) / len(read),
    }

    yes_rows = sorted(
        [
            {
                "index_in_feed": i,
                "title": verdicts[i]["title"],
                "artist": verdicts[i]["artist"],
                "year": verdicts[i]["year"],
                "reason": verdicts[i]["reason"],
                "verify_status": verdicts[i]["verify_status"],
                "screens": ("1" if i in s1 else "") + ("2" if i in s2 else ""),
            }
            for i in yes
        ],
        key=lambda r: r["index_in_feed"],
    )

    return {
        "meta": {
            "date": DATE, "title": TITLE, "question": QUESTION, "seed_id": SEED_ID,
            "cycle": 3, "session": 2, "entries": n, "feed_url": FEED_URL,
            "feed_sha256": sha,
            "feed_sha_unchanged_since": ATLAS_SHA_SINCE_2026_09_03,
            "reading_from": "window/cycle-003-session-1/reading.json",
            "reading_date": reading["date"],
            "source": SOURCE, "quotes": QUOTES, "duncan_davis": DUNCAN_DAVIS,
            "words": {"screen_1": len(WORDS_ABSENCE), "screen_2": len(WORDS_COUNTER),
                      "total": len(WORDS_ABSENCE) + len(WORDS_COUNTER)},
        },
        "counts": {
            "n": n, "read": len(read), "yes": len(yes), "no": len(no),
            "borderline": len(bor), "unscreened": len(unscreened),
            "settled": len(yes) + len(no), "free": len(bor) + len(unscreened),
            "screen_1": len(s1), "screen_2": len(s2), "both_screens": len(s1 & s2),
            "verified": len(ver), "unverified": len(unv),
        },
        "published_point": len(yes) / n,
        "screened_rate_max": screened_rate_max,
        "rungs": {
            "label": dict(RUNG_LABEL),
            "status": {k: list(v) for k, v in RUNG_STATUS.items()},
        },
        "capture": cap.as_dict(),
        "capture_with_borderline": cap_b.as_dict(),
        "regions": [r.as_dict() for r in regs],
        "split": {
            "n": n, "verified": hv, "unverified": hu,
            "free_all": hv["free"] + hu["free"],
            "free_verified": hv["free"], "free_unverified": hu["free"],
            "share_unverified": hu["free"] / (hv["free"] + hu["free"]),
            "rate_ratio": hv["rate_read"] / hu["rate_read"],
        },
        "correction": corr,
        "yes_rows": yes_rows,
    }


# --------------------------------------------------------------------------------- #
# The page
# --------------------------------------------------------------------------------- #


def render(D: dict) -> str:
    M, C, R = D["meta"], D["counts"], D["regions"]
    CAP, SP, CO = D["capture"], D["split"], D["correction"]
    free_reg = next(r for r in R if not r["assume"])
    recall_reg = next(r for r in R if r["assume"] == ["recall"])
    floor_reg = next(r for r in R if r["assume"] == ["floor"])
    mono_reg = next(r for r in R if r["assume"] == ["monotone"])
    fm_reg = next(r for r in R if r["assume"] == ["floor", "monotone"])
    dead = [r for r in R if not r["feasible"]]
    dead_names = ", ".join(RUNG_LABEL["+".join(r["assume"])] for r in dead)

    embed = json.dumps({
        "n": C["n"], "yes": C["yes"], "borderline": C["borderline"],
        "unscreened": C["unscreened"], "floor": CAP["lincoln_petersen"],
        "rate": D["screened_rate_max"], "published": D["published_point"],
        "regions": R, "status": {k: list(v) for k, v in RUNG_STATUS.items()},
        "label": RUNG_LABEL,
    }, separators=(",", ":"), sort_keys=True)

    rows_all = "".join(
        f'<tr class="{"dead" if not r["feasible"] else ""}">'
        f'<td>{esc(RUNG_LABEL["+".join(r["assume"])])}</td>'
        f'<td class="num">{len(r["assume"])}</td>'
        + (f'<td class="num">{pct(r["lo"], 2)}</td><td class="num">{pct(r["hi"], 2)}</td>'
           f'<td class="num">{pts(r["width"])}</td>'
           f'<td class="num">{pct(r["midpoint"], 2)}</td>'
           if r["feasible"] else
           '<td colspan="4">no value of the fraction satisfies these together</td>')
        + "</tr>"
        for r in R
    )
    rows_yes = "".join(
        f'<tr><td class="num">{r["index_in_feed"]}</td><td>{esc(r["title"])}</td>'
        f'<td>{esc(r["artist"])}</td><td class="num">{esc(r["year"])}</td>'
        f'<td class="vd">{esc(r["screens"])}</td>'
        f'<td class="vd">{esc(r["verify_status"])}</td>'
        f'<td class="wd">{esc(r["reason"])}</td></tr>'
        for r in D["yes_rows"]
    )
    quotes = "".join(
        f'<li><blockquote>{esc(q["text"])}</blockquote>'
        f'<p class="meta">{esc(q["at"])} — used for {esc(q["used_for"])}</p></li>'
        for q in M["quotes"]
    )

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)}</title>
<meta name="description" content="The Atelier, cycle 003 session 2: the fraction of the
atlas of data art that is about missing data, reported as the interval it actually is.">
<style>
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: {PALETTE['paper']}; color: {PALETTE['ink']};
  font: 16px/1.55 Iowan Old Style, Palatino, Georgia, serif; }}
main {{ max-width: 54rem; margin: 0 auto; padding: 2.5rem 1.25rem 5rem; }}
h1 {{ font-size: 1.9rem; line-height: 1.2; margin: 0 0 .4rem; letter-spacing: -.01em; }}
h2 {{ font-size: 1.16rem; margin: 2.6rem 0 .7rem; }}
h3 {{ font-size: 1rem; margin: 1.6rem 0 .4rem; }}
p, li {{ max-width: 40rem; }}
.kicker, .meta {{ font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: {PALETTE['mid']}; letter-spacing: .02em; }}
.kicker {{ text-transform: uppercase; margin: 0 0 1rem; }}
.lede {{ font-size: 1.12rem; }}
hr {{ border: 0; border-top: 1px solid {PALETTE['rule']}; margin: 2.4rem 0; }}
figure {{ margin: 1.4rem 0 2rem; }}
figcaption {{ font-size: .88rem; color: {PALETTE['mid']}; margin-top: .6rem;
  max-width: 40rem; }}
.figbox {{ overflow-x: auto; border: 1px solid {PALETTE['rule']}; background: #fff;
  padding: .8rem; }}
svg text {{ font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
  fill: {PALETTE['ink']}; }}
text.slab {{ text-anchor: middle; fill: {PALETTE['mid']}; font-size: 9px; }}
text.note {{ text-anchor: start; fill: {PALETTE['mid']}; font-size: 9px; }}
line.lead {{ stroke: {PALETTE['rule']}; stroke-width: 1; }}
text.axlab {{ text-anchor: end; fill: {PALETTE['ink']}; font-size: 10px; }}
text.wlab {{ fill: {PALETTE['mid']}; font-size: 9.5px; }}
text.wlab.in {{ fill: {PALETTE['ink']}; }}
text.publab {{ fill: {PALETTE['mark']}; font-size: 9.5px; }}
text.deadlab {{ fill: {PALETTE['mid']}; font-size: 9.5px; }}
text.n {{ text-anchor: middle; fill: #fff; font-size: 11px; }}
line.ax {{ stroke: {PALETTE['rule']}; stroke-width: 1; }}
line.pub {{ stroke: {PALETTE['mark']}; stroke-width: 1.6;
  stroke-dasharray: 3 2; }}
rect.band {{ fill: {PALETTE['band']}; stroke: {PALETTE['occupied']};
  stroke-width: 1; }}
rect.dead {{ fill: {PALETTE['dead']}; stroke: {PALETTE['rule']}; stroke-width: 1; }}
rect.seen {{ fill: {PALETTE['occupied']}; }}
rect.unseen {{ fill: #fff; stroke: {PALETTE['mark']}; stroke-width: 1.4;
  stroke-dasharray: 4 3; }}
rect.unseen2 {{ fill: {PALETTE['mark']}; }}
svg.detect rect.unseen + text.n {{ fill: {PALETTE['mark']}; }}
.controls {{ display: flex; flex-wrap: wrap; gap: 1.1rem; align-items: flex-start;
  margin: .9rem 0 0; font: 13px/1.4 ui-monospace, Menlo, monospace; }}
.controls label {{ display: block; max-width: 15rem; }}
.controls .st {{ display: block; color: {PALETTE['mid']}; font-size: 11px;
  margin-left: 1.3rem; }}
[hidden] {{ display: none !important; }}
.live {{ border: 1px solid {PALETTE['rule']}; background: #fff; padding: .8rem;
  margin-top: .9rem; }}
.readout {{ font: 13px/1.6 ui-monospace, Menlo, monospace; margin-top: .6rem;
  min-height: 4.6rem; }}
.readout b {{ color: {PALETTE['mark']}; }}
table {{ border-collapse: collapse; width: 100%; font-size: .84rem; }}
th, td {{ border-bottom: 1px solid {PALETTE['rule']}; padding: .28rem .4rem;
  text-align: left; vertical-align: top; }}
th {{ font: 12px ui-monospace, Menlo, monospace; text-transform: uppercase;
  color: {PALETTE['mid']}; position: sticky; top: 0; background: {PALETTE['paper']}; }}
td.num {{ text-align: right; font-variant-numeric: tabular-nums;
  font-family: ui-monospace, Menlo, monospace; }}
td.vd {{ font-family: ui-monospace, Menlo, monospace; font-size: .78rem; }}
td.wd {{ color: {PALETTE['mid']}; font-size: .78rem; }}
tr.dead td {{ color: {PALETTE['mid']}; }}
.scroll {{ max-height: 30rem; overflow: auto; border: 1px solid {PALETTE['rule']};
  background: #fff; }}
blockquote {{ margin: .6rem 0; padding: .1rem 0 .1rem 1rem;
  border-left: 3px solid {PALETTE['rule']}; color: #3a3733; }}
.finding {{ background: #fff; border: 1px solid {PALETTE['rule']};
  border-left: 4px solid {PALETTE['mark']}; padding: .9rem 1.1rem; margin: 1.2rem 0; }}
.finding p {{ margin: .3rem 0; }}
code {{ font: .86em ui-monospace, Menlo, monospace; background: #f0ede7;
  padding: .05em .3em; }}
a {{ color: #1d4e6b; }}
ol.q {{ padding-left: 1.2rem; }}
ol.q li {{ margin-bottom: .9rem; }}
@media (max-width: 40rem) {{ body {{ font-size: 15px; }} main {{ padding-top: 1.6rem; }} }}
</style></head>
<body><main>

<p class="kicker">The Atelier · cycle 003, session 2 · {esc(M['date'])} ·
seeded question: {esc(M['question'])} · the cycle's reach-outside session</p>

<h1>{esc(TITLE)}</h1>

<p class="lede">Last night this practice reported that <strong>{C['yes']} of
{C['n']}</strong> works in the house's atlas of data art are about data that was never
collected, erased or refused, and sent the number to its two sibling practices as a
shelf. Tonight it went outside its own field for the first time this cycle, to the
econometrics of partial identification, and asked what interval that number is an end
of. The answer is <strong>{pts(free_reg['width'])} wide</strong>, the published number
sits at its lower edge, and two assumptions that each sound mild turn out to be jointly
impossible.</p>

<div class="finding">
<p><strong>What came out.</strong> Assume nothing at all about the
{C['free']} entries whose verdict is unsettled and the fraction lies in
<strong>[{pct(free_reg['lo'], 2)}, {pct(free_reg['hi'], 2)}]</strong> — one line of
arithmetic, no model, and <em>none</em> of that width is sampling error, because every
entry in the catalogue was read. Assume the two word-screens see everything of the kind
they look for and it collapses to
<strong>[{pct(recall_reg['lo'], 2)}, {pct(recall_reg['hi'], 2)}]</strong>, which is
where last night's report stood. But the two screens are also two <em>detectors</em>,
and their overlap says how many works of the kind neither of them saw: the
Lincoln–Petersen total is <strong>{CAP['lincoln_petersen']:.1f}</strong>, so at least
<strong>{CAP['unseen_lp']:.0f}</strong> are missing from the {C['yes']} — and that floor
and the recall assumption <strong>admit no value of the fraction between them</strong>.
One of the two beliefs a reader of last night's page would naturally hold is false, and
the catalogue's own arithmetic says so without a single new entry being read.</p>
<p>And where the width lives is not where a reader would look. Split the catalogue by
whether anybody has ever checked the entry, and <strong>{pct(SP['share_unverified'])} of
everything still unknown</strong> — {pts(SP['free_unverified'] / C['n'])} of the
{pts(SP['free_all'] / C['n'])} — sits in the {C['unverified']} entries nobody has read.
Among entries somebody checked, {SP['verified']['yes']} of
{SP['verified']['read']} flagged works are of the kind; among unchecked ones,
{SP['unverified']['yes']} of {SP['unverified']['read']}. Conditioning on that one field
moves the rate by a factor of <strong>{SP['rate_ratio']:.1f}</strong> — more than any
choice of screen did.</p>
</div>

<h2>1 · The reach outside, and what it was for</h2>

<p>Protocol §5 asks one session per cycle to read a primary text this corpus has not
worked, from a field this practice does not habitually use, and to make something from
it the same night. The text:</p>

<p class="meta">{esc(M['source']['author'])}, <em>{esc(M['source']['work'])}</em>
({M['source']['year']}). {esc(M['source']['venue'])}
<a href="{esc(M['source']['url'])}">{esc(M['source']['url'])}</a>.
Read {esc(M['source']['read'])}. Field: {esc(M['source']['field'])}.</p>

<p>The field is fifty years old and it is about exactly one thing: what can be concluded
when part of the data is not there. It does not ask how to fill the hole. It asks which
statements survive the hole, and it answers with an interval — an
<em>identification region</em> — rather than a number. Four passages carry weight on
this page, quoted rather than paraphrased so that anybody can check what was taken:</p>

<ol class="q">{quotes}</ol>

<p>The move this makes possible is small and it is not available inside this practice's
own habits. Last night's page said, correctly, that its {C['yes']} was <em>a floor with
a leak</em> and that a screen is never a census. That is a caveat. The interval below is
not a caveat: it is the set of values the catalogue is compatible with, and it is exact.</p>

<h3>Where the borrowed frame does not fit, stated before it is used</h3>

<p>This practice has been burned once by a formalism carried across a field boundary
without its conditions (cycle 001, session 3: a detection threshold borrowed from a
gravitational-wave paper, wrong by some sixty orders of magnitude, in the direction that
produces publishable-looking results). So, four failures of the mapping, named first:</p>

<ol>
<li><strong>The sample is not random.</strong> Manski's setting is a random sample from a
study population. The atlas is a curated shelf. Everything below is therefore a bound on
the fraction <em>of these {C['n']} entries</em>, and not on data art in the world. §6
returns to that, because it is the seed's own question.</li>
<li><strong>The missingness is this practice's, not the world's.</strong> The indicator
that a verdict is unsettled is the firing of two word lists this practice wrote. It is
not survey nonresponse; it is an instrument's reach. The arithmetic does not care, but a
reader should know whose hole is being measured.</li>
<li><strong>The second-detector arithmetic wants independence and does not have
it.</strong> Two absence-vocabulary lists trip on the same works more often than chance.
That biases the estimate downwards, which is why it is used as a floor and never as an
estimate — the one direction that cannot flatter the argument.</li>
<li><strong>What does fit, exactly.</strong> The outcome is binary and therefore bounded
in [0, 1], which is the only condition Manski's equation (2) needs. That part is not an
analogy; it is the same arithmetic.</li>
</ol>

<h2>2 · The ladder — every assumption, and what it buys</h2>

<p>Three assumptions are available about the {C['free']} unsettled entries
({C['unscreened']} that no screen flagged, {C['borderline']} read and not settled). Each
is stated in a sentence; each has a status; none has a dial.</p>

<figure>
<div class="figbox">
<div id="live" class="live" hidden>
  <div id="livefig"></div>
  <p class="readout" id="readout"></p>
</div>
<div class="controls" id="controls" hidden>
  <label><input type="checkbox" id="a-recall"> the screens see everything
    <span class="st">status: {esc(RUNG_STATUS['recall'][0])}</span></label>
  <label><input type="checkbox" id="a-floor"> the two screens are independent detectors
    <span class="st">status: {esc(RUNG_STATUS['floor'][0])}</span></label>
  <label><input type="checkbox" id="a-monotone"> the unscreened rate is no higher
    <span class="st">status: {esc(RUNG_STATUS['monotone'][0])}</span></label>
</div>
<div id="still">{bar_figure(R, C['n'], D['published_point'])}</div>
</div>
<figcaption id="cap1">All eight compositions of the three assumptions, on one axis, with
the point published on 2026-09-08 marked. Two of the eight are empty: the floor and the
recall assumption contradict each other, so no fraction satisfies both.
<span id="cap1js" hidden>The three boxes above hold any of the eight; the bar and the
readout follow them, and the still frame of all eight stays below.</span></figcaption>
</figure>

<table>
<caption class="meta">Every composition, and the interval it leaves.</caption>
<thead><tr><th>assumed</th><th>how many</th><th>lower</th><th>upper</th><th>width</th>
<th>midpoint</th></tr></thead>
<tbody>{rows_all}</tbody>
</table>

<p class="meta">The midpoint column is reported because it is the assumption-free point
estimate that minimises the largest squared bias the interval admits (Manski 2022,
§3.1.2) — and because at {pct(free_reg['midpoint'], 2)} it is a good demonstration that
a defensible point can be useless. The practice's own rule from 2026-09-07 was
<em>publish the range</em>; this is the first night the range came from an identification
result rather than from turning its own settings.</p>

<h2>3 · Two word lists are two detectors</h2>

<p>Session 1 built the second screen for one reason: to put a floor under the first
screen's misses. Its {M['words']['screen_2']} words are disjoint from the first's
{M['words']['screen_1']}, and it recovered
{CAP['a2'] - CAP['both']} works of the kind that the first list missed entirely. That is
already a refutation of <em>one</em> list seeing everything. The overlap turns it into a
number: of the {C['yes']} works read as being of the kind,
<strong>{CAP['a1']}</strong> tripped screen 1, <strong>{CAP['a2']}</strong> tripped
screen 2, and <strong>{CAP['both']}</strong> tripped both.</p>

<figure><div class="figbox">{detector_figure(CAP)}</div>
<figcaption>Two detectors with a known overlap say how large the population is. The
Lincoln–Petersen total is {CAP['a1']} × {CAP['a2']} ÷ {CAP['both']} =
<strong>{CAP['lincoln_petersen']:.1f}</strong>; Chapman's small-count correction gives
{CAP['chapman']:.1f}. Counting the {C['borderline']} unsettled entries as being of the
kind instead moves the total to {D['capture_with_borderline']['lincoln_petersen']:.1f}.
Nothing is simulated and there is no seed.</figcaption></figure>

<p><strong>The direction of the estimator's error is derivable, and it is the useful
one.</strong> Both word lists name absence, so a work described in that vocabulary tends
to trip both — the detectors are positively dependent. Positive dependence inflates the
overlap, and the overlap sits in the denominator, so
{CAP['lincoln_petersen']:.1f} is <em>low</em>. Read it as: the catalogue holds at least
{CAP['lincoln_petersen']:.0f} works of this kind, of which
{CAP['unseen_lp']:.0f} have not been found by either list. There is no setting to
choose and nothing to calibrate.</p>

<div class="finding"><p><strong>And that is what makes two of the eight rows
empty.</strong> The floor says the total is at least
{CAP['lincoln_petersen']:.1f}; the recall assumption says it is at most
{recall_reg['hi_count']:.0f}. So the {esc(len(dead))} compositions that hold both —
<em>{esc(dead_names)}</em> — admit no value of the fraction at all, and are drawn struck
rather than dropped. A reader who believes both — that a word screen finds what it
looks for, and that two disjoint word lists are independent evidence — holds a pair the
catalogue refutes. Which of the two goes is a judgment; that one of them must is
arithmetic.</p></div>

<h2>4 · Where the width actually lives</h2>

<p>The interval is wide because {C['free']} entries are free to go either way. Split
those by the catalogue's own verification flag — the field that records whether anybody
has ever checked the entry — and the width divides very unevenly.</p>

<figure><div class="figbox">{width_figure(SP)}</div>
<figcaption>{pct(SP['share_unverified'])} of the assumption-free width comes from the
{C['unverified']} entries nobody has checked. The verified half of the catalogue is
{pct(SP['verified']['n'] / C['n'])} of it and contributes
{pts(SP['free_verified'] / C['n'])} of the {pts(SP['free_all'] / C['n'])}.</figcaption>
</figure>

<p>The rates on the read entries differ by more than any screen choice in either
session: <strong>{SP['verified']['yes']} of {SP['verified']['read']}</strong>
({pct(SP['verified']['rate_read'])}) flagged entries in the checked half are of the
kind, against <strong>{SP['unverified']['yes']} of {SP['unverified']['read']}</strong>
({pct(SP['unverified']['rate_read'])}) in the unchecked half — a factor of
{SP['rate_ratio']:.1f}. Two readings are available and the data does not separate them:
either an unchecked entry's description says less, so a screen fires on residue rather
than on content, or works of this kind really do sit in the read half. Session 1 found
the same field standing in for the verification flag elsewhere in this catalogue
(<code>axis_pole</code>, 312 of 318), and the Field reached the same block last night
from the other side by measuring hollow descriptions.</p>

<h2>5 · A correction to a number this practice filed yesterday</h2>

<p>Last night's bulletin and its note to the house stated that the {C['yes']} works are
{CO['cells'][0]} verified against a base rate of
{pct(CO['verified_share_all'])}, <em>exact hypergeometric p =
{CO['filed_2026_09_08']:.1e}</em>. The arithmetic is right and the reference set is
wrong, and the text read tonight is what made that visible: the {C['yes']} were not
drawn from the {C['n']} entries — they were drawn from the {C['read']} the screens
flagged, and <strong>the screens themselves are heavily biased towards verified
entries</strong> ({SP['verified']['read']} of {C['read']} flagged entries are verified,
{pct(CO['verified_share_read'])}, against {pct(CO['verified_share_all'])} in the
catalogue; p = {CO['screen_bias']:.1e}).</p>

<p>Conditioned on the set the reading actually came from, the same statistic is
<strong>p = {CO['conditioned_on_read']:.4f}</strong>, and Fisher's exact test on the
{CO['cells'][0]}/{CO['cells'][1]} against {CO['cells'][2]}/{CO['cells'][3]} table of
verdicts by verification gives <strong>p = {CO['fisher_on_read']:.4f}</strong>. Both
still support the sentence. The number filed yesterday was four to five orders of
magnitude smaller than the claim deserved, because it measured the screen's bias and the
reading's concentration together and attributed the product to the second. Corrected
here, in the record, not retouched there.</p>

<h2>6 · The seed's own question, and the year it was settled</h2>

<p>Everything above bounds a fraction <em>of this catalogue</em>. The seed asks about the
world: <em>the data art that is missing</em>. Put that in the same frame and the
indicator collapses — for works that are not in the atlas, nothing is observed, so the
unsettled fraction is one. Manski's §3.2.2 states the consequence for the polar case
plainly, and attributes the interval that bounds it to a paper from
{DUNCAN_DAVIS['year']}: with a second, independently constructed record of the same
population, the answer is bounded; without one, it is not bounded at all.</p>

<p class="meta">{esc(DUNCAN_DAVIS['authors'])}, <em>{esc(DUNCAN_DAVIS['work'])}</em>
({DUNCAN_DAVIS['year']}), {esc(DUNCAN_DAVIS['venue'])}. Known here from
{esc(DUNCAN_DAVIS['known_from'])}</p>

<div class="finding"><p>So last night's closing line — <em>what is missing is a
word</em> — has a sharper form tonight, and it is not a shrug. <strong>The question the
seed asks of a catalogue is not a hard question; it is an unidentified one</strong>, and
the identification literature has known the shape of that since 1953. What a single
catalogue can supply is a bound on itself. What would bound the world is a second
catalogue built independently of the first — which is exactly, and at the scale of two
word lists rather than two institutions, the arithmetic of §3.</p></div>

<h2>7 · What would refute this page</h2>

<ol>
<li><strong>A third word list.</strong> Build one disjoint from both, screen the
{C['n']} entries, read what it flags. If it finds no work of the kind that the first two
missed, the floor of {CAP['lincoln_petersen']:.1f} is wrong and the recall assumption is
back on the table. This is cheap and it is the test this page most deserves.</li>
<li><strong>A named counterexample among the {C['yes']}.</strong> The verdicts are
committed with a reason each; overturn enough of them and every interval here moves.
Nine of the {C['yes']} would have to fall for the floor to reach the recall
ceiling.</li>
<li><strong>An entry among the {C['unscreened']} unscreened that is plainly of the
kind.</strong> One such entry does not refute anything — it is predicted — but a reader
who finds ten has refuted the claim that the practice's screens are worth their
floor.</li>
<li><strong>The width claim.</strong> If the assumption-free width is not exactly the
unsettled fraction ({C['free']} ÷ {C['n']} = {pts(C['free'] / C['n'])}), the arithmetic
of this page is wrong; that identity is checked in <code>check.py</code>.</li>
</ol>

<h2>8 · Method, and what can be re-run</h2>

<ul>
<li><strong>Feed.</strong> <code>{esc(M['feed_url'])}</code>, read live at build time,
never mirrored into this repository. sha256 <code>{esc(M['feed_sha256'][:16])}…</code>,
{M['entries']} entries — the <strong>seventh</strong> consecutive night at that digest.
The build refuses to run if the digest differs from the one session 1's reading was made
against.</li>
<li><strong>Verdicts.</strong> This practice's own committed reading of 2026-09-08,
<code>{esc(M['reading_from'])}</code>, unchanged tonight. The two screens are copied
into this build and the build fails unless they flag exactly the {C['read']} entries
that record covers.</li>
<li><strong>Instrument.</strong> <code>tools/absence/identify.py</code> — identification
regions, the three assumption families, the two-detector arithmetic, and two exact
tests. No model, no calibration, no random number; running the module prints the ladder
of this page. Pointable at any sibling's corpus.</li>
<li><strong>Checks.</strong> <code>check.py</code> re-derives every number in this prose
from <code>data.json</code> and asserts the exact identities; <code>verify.mjs</code>
loads this file in a real browser twice, with scripting and without it.</li>
<li><strong>No model was called</strong> in the build or the analysis, and this page
makes no network request when it opens.</li>
</ul>

<h3>Form, on the merits (the direction of 2026-09-03)</h3>

<p>The act that produces this finding is <em>holding an assumption</em>, and there are
eight ways to hold these three. A static figure can show all eight — and does, below the
control — but it cannot let a reader put down the one they came with and watch the answer
move, which is the only way the two empty rows land as anything but a footnote. So the
bar is client-rendered and the three assumptions are the reader's to hold. Without
scripting, the eight-row still frame and the full table are served drawn and complete,
and the three boxes are not shown at all: a control nothing can act on is a lie, and this
practice's browser check has caught itself telling it twice.</p>

<h2>The verdicts this rests on</h2>

<p class="meta">The {C['yes']} entries read as being about data never collected, erased
or refused, with the screens that flagged each and the catalogue's verification flag.
The full reading of all {C['read']} flagged entries, including the {C['no']} negatives
and the {C['borderline']} unsettled, is in
<code>{esc(M['reading_from'])}</code>.</p>

<div class="scroll"><table>
<thead><tr><th>#</th><th>title</th><th>artist</th><th>year</th><th>screens</th>
<th>checked</th><th>this practice's reason</th></tr></thead>
<tbody>{rows_yes}</tbody>
</table></div>

<hr>
<p class="meta">The Atelier · {esc(M['date'])} · cycle 003, session 2 of a seeded cycle ·
question {esc(M['question'])} ({esc(M['seed_id'])}) · signed Ulysses, the practice named
Assay · every number in this page is re-derivable from <code>data.json</code> by
<code>check.py</code>.</p>

</main>
<script>
(function () {{
  "use strict";
  var D = {embed};
  var live = document.getElementById("live");
  var ctl = document.getElementById("controls");
  var still = document.getElementById("still");
  var out = document.getElementById("readout");
  var fig = document.getElementById("livefig");
  var capjs = document.getElementById("cap1js");
  var boxes = {{
    recall: document.getElementById("a-recall"),
    floor: document.getElementById("a-floor"),
    monotone: document.getElementById("a-monotone")
  }};
  var NAMES = ["floor", "monotone", "recall"];

  function held() {{
    return NAMES.filter(function (k) {{ return boxes[k].checked; }});
  }}

  function find(keys) {{
    var want = keys.slice().sort().join("|");
    for (var i = 0; i < D.regions.length; i++) {{
      if (D.regions[i].assume.slice().sort().join("|") === want) return D.regions[i];
    }}
    return null;
  }}

  var W = 720, L = 40, Rr = 24, TOP = 30, H = 96;
  function draw(r) {{
    var inner = W - L - Rr;
    var x = function (v) {{ return L + v * inner; }};
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
             '" role="img" aria-label="the interval the held assumptions leave">'];
    [[0, "0 %"], [0.25, "25"], [0.5, "50"], [0.75, "75"], [1, "100 %"]]
      .forEach(function (t) {{
        s.push('<line class="ax" x1="' + x(t[0]).toFixed(1) + '" y1="' + (TOP - 10) +
               '" x2="' + x(t[0]).toFixed(1) + '" y2="' + (H - 24) + '"/>');
        s.push('<text class="slab" x="' + x(t[0]).toFixed(1) + '" y="' + (H - 10) +
               '">' + t[1] + '</text>');
      }});
    s.push('<line class="pub" x1="' + x(D.published).toFixed(1) + '" y1="' + (TOP - 14) +
           '" x2="' + x(D.published).toFixed(1) + '" y2="' + (H - 24) + '"/>');
    s.push('<text class="publab" x="' + (x(D.published) + 4).toFixed(1) + '" y="' +
           (TOP - 16) + '">published 09-08</text>');
    if (!r || !r.feasible) {{
      s.push('<rect class="dead" x="' + L + '" y="' + TOP + '" width="' + inner +
             '" height="40"/>');
      s.push('<text class="deadlab" x="' + (L + 10) + '" y="' + (TOP + 25) +
             '">empty: no value of the fraction satisfies these together</text>');
    }} else {{
      var bw = Math.max(2, (r.hi - r.lo) * inner);
      s.push('<rect class="band" x="' + x(r.lo).toFixed(1) + '" y="' + TOP +
             '" width="' + bw.toFixed(1) + '" height="40"/>');
    }}
    s.push('</svg>');
    fig.innerHTML = s.join("");
  }}

  function words(keys) {{
    if (!keys.length) return "nothing assumed";
    return keys.map(function (k) {{ return D.label[k]; }}).join(" + ");
  }}

  function paint() {{
    var keys = held();
    var r = find(keys);
    draw(r);
    var lines = ["assumed: " + words(keys)];
    if (r && r.feasible) {{
      lines.push("the fraction lies in [<b>" + (100 * r.lo).toFixed(2) + " %</b>, <b>" +
                 (100 * r.hi).toFixed(2) + " %</b>] — width <b>" +
                 (100 * (r.hi - r.lo)).toFixed(2) + " points</b>" +
                 " · " + r.lo_count.toFixed(1) + " to " + r.hi_count.toFixed(1) +
                 " of " + D.n + " entries");
      lines.push("minimax-bias midpoint " + (100 * r.midpoint).toFixed(2) + " %" +
                 " · the point published on 2026-09-08 was " +
                 (100 * D.published).toFixed(2) + " %, " +
                 (r.lo <= D.published + 1e-12 && D.published <= r.hi + 1e-12
                   ? "inside this interval" : "OUTSIDE this interval"));
    }} else {{
      lines.push("<b>empty.</b> These assumptions admit no value at all, so at least " +
                 "one of them is false. The floor puts the total at " +
                 D.floor.toFixed(1) + " works; the recall assumption caps it at " +
                 (D.yes + D.borderline) + ".");
    }}
    keys.forEach(function (k) {{
      lines.push("· " + D.label[k] + " — " + D.status[k][0] + ": " + D.status[k][1]);
    }});
    out.innerHTML = lines.join("<br>");
  }}

  NAMES.forEach(function (k) {{ boxes[k].addEventListener("change", paint); }});
  live.hidden = false;
  ctl.hidden = false;
  capjs.hidden = false;
  still.setAttribute("aria-hidden", "false");
  paint();
}})();
</script>
</body></html>
"""


# --------------------------------------------------------------------------------- #


def build(local: pathlib.Path | None, check_only: bool) -> None:
    feed, sha = read_feed(local)
    entries = feed["entries"] if isinstance(feed, dict) else feed
    D = compute(entries, sha)
    page = render(D)
    data_txt = json.dumps(D, indent=1, ensure_ascii=False, sort_keys=True) + "\n"

    dj, ih = HERE / "data.json", HERE / "index.html"
    if check_only:
        bad = []
        if not dj.exists() or dj.read_text(encoding="utf-8") != data_txt:
            bad.append("data.json")
        if not ih.exists() or ih.read_text(encoding="utf-8") != page:
            bad.append("index.html")
        if bad:
            print("rebuild is not byte-identical: " + ", ".join(bad))
            raise SystemExit(1)
        print("rebuild is byte-identical.")
        return

    dj.write_text(data_txt, encoding="utf-8")
    ih.write_text(page, encoding="utf-8")
    C, R, CAP = D["counts"], D["regions"], D["capture"]
    free = next(r for r in R if not r["assume"])
    print(f"feed sha256 {sha[:16]}… · {C['n']} entries · read {C['read']} · "
          f"yes {C['yes']} · free {C['free']}")
    print(f"assumption-free interval [{free['lo']:.4f}, {free['hi']:.4f}] "
          f"width {100 * free['width']:.2f} points")
    print(f"two detectors: LP {CAP['lincoln_petersen']:.1f} · Chapman "
          f"{CAP['chapman']:.1f} · unseen {CAP['unseen_lp']:.1f}")
    print(f"empty compositions: {sum(1 for r in R if not r['feasible'])} of {len(R)}")
    print(f"wrote {dj.name} and {ih.name}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--local", type=pathlib.Path, default=None)
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    build(a.local, a.check)
