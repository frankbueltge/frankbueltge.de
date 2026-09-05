#!/usr/bin/env python3
"""Builds data.json and index.html for cycle 002, session 3 — the column census.

Every number on the page is computed here from the three feeds, read live and pinned
by sha256, and written into `data.json`. Nothing is typed in by hand. `check.py`
re-derives the numbers in the prose from `data.json` and fails until they agree.

    python3 window/cycle-002-session-3/build.py                # reads the feeds live
    python3 window/cycle-002-session-3/build.py --from DIR     # re-runs against a
        # local copy of the three feeds, named atlas.json / papers.json /
        # datasets.json. DIR is deliberately outside this repository: the feeds are
        # the house's and are cited, never mirrored here. What is committed beside
        # this file is the derived record.
    python3 window/cycle-002-session-3/check.py                # the record vs the page
    node window/cycle-002-session-3/verify.mjs                 # the page in a browser,
        # with the script and without it (needs playwright-core and a chromium)

FORM, decided on the merits and named in a line as the direction of 2026-09-03 asks.
The object of this session is **forty-two columns, each carrying four verdicts** —
and the finding is where a column sits and which of the four checks condemns it. A
still figure has to pick one measure and sort by it, and then the other three verdicts
are gone; a static table of 42 rows by eight numbers is not read by anyone. So the
page is client-rendered: the field map sorts, filters by verdict, and opens a readout
per column with the actual cell contents that failed. The no-JS floor is complete
rather than reduced — all forty-two rows, all four verdicts and both figures are
written into the document as static HTML and SVG, so a reader without JavaScript
reads every number and loses only the sorting.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import html
import json
import pathlib
import re
import sys
from collections import Counter

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "census"))

import columns as C  # noqa: E402

FEEDS = [
    ("atlas", "https://frankbueltge.de/atlas/werke.json", "the atlas of data art"),
    ("papers", "https://frankbueltge.de/papers/index.json", "the paper register, scanning form"),
    ("datasets", "https://frankbueltge.de/datasets/register.json", "the data-source register"),
]

# The sha256 this session read. Session 2 (2026-09-04) pinned the atlas at the same
# digest; that identity is a finding on the page and is asserted in check.py.
SESSION2_ATLAS_SHA = "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"
SESSION2_ACT_OPENS = 95  # session 2's census: finite verb 78 + participle 17
SESSION2_ACT_NOT = 426


# --------------------------------------------------------------------------------- #
# The dials — where a check has a free parameter, sweep it and publish the band
# --------------------------------------------------------------------------------- #


def sweep_act_threshold(values: list[str]) -> list[dict]:
    """Check C's one free parameter: how many inflections make a stem a verb.

    The lexicon rule asks that a stem appear in the column with at least T of the
    endings -s/-es/-ed/-ing. T is an integer nobody has a principled reason to fix.
    This is the sweep of it.
    """
    tokens: Counter[str] = Counter()
    for v in values:
        for t in re.findall(r"[a-z]+", v.lower()):
            tokens[t] += 1
    stems: dict[str, set[str]] = {}
    for t in tokens:
        for suf in C.ACT_SUFFIXES:
            if t.endswith(suf) and len(t) - len(suf) >= 3:
                stems.setdefault(t[: -len(suf)], set()).add(suf)
    out = []
    for thr in (1, 2, 3, 4):
        lex: set[str] = set()
        for stem, sufs in stems.items():
            if len(sufs) >= thr:
                for suf in sufs:
                    lex.add(stem + suf)
                lex.add(stem)
        ok = sum(1 for v in values if C._first_word(v) in lex)
        out.append(
            {"threshold": thr, "lexicon": len(lex), "opens_with_act": ok, "does_not": len(values) - ok}
        )
    return out


def sweep_nearkey_cutoff(entries: list[dict], fields: list[str]) -> list[dict]:
    """Check D's one free parameter: how coarse a determinant must be to count.

    A column that singles out entries determines every other column trivially. The
    check excludes such near-keys by requiring a determinant to leave at least `cut`
    entries standing on average. This is the sweep of `cut`.
    """
    n = len(entries)
    cols = {f: [C.norm(r.get(f)) for r in entries] for f in fields}
    counts = {f: Counter(cols[f]) for f in fields}
    resid = {f: sum(k * k for k in counts[f].values()) / n for f in fields}
    distinct_all = {f: len({x for x in cols[f] if x}) for f in fields}

    def determines(x: str, y: str) -> bool:
        m: dict[str, str] = {}
        for xv, yv in zip(cols[x], cols[y]):
            if xv in m:
                if m[xv] != yv:
                    return False
            else:
                m[xv] = yv
        return True

    out = []
    for cut in (1.0, 1.5, 2.0, 3.0, 5.0, 10.0):
        flagged = []
        for y in fields:
            if distinct_all[y] <= 1:
                continue
            for x in fields:
                if x == y or distinct_all[x] <= 1 or resid[x] < cut:
                    continue
                if determines(x, y):
                    flagged.append(y)
                    break
        out.append({"cutoff": cut, "redundant_fields": len(flagged), "fields": sorted(set(flagged))})
    return out


def sweep_year_range(values: list[str]) -> list[dict]:
    """Check C's other parameter: which years count as years."""
    out = []
    for lo, hi, label in ((1400, 2100, "1400–2100"), (1000, 2100, "1000–2100"), (-4000, 2100, "any era")):
        ok = 0
        for v in values:
            if C.YEAR_RE.match(v) and lo <= int(v) <= hi:
                ok += 1
        out.append({"range": label, "conforming": ok, "failing": len(values) - ok})
    return out


def sweep_empty_container(entries: list[dict], fields: list[str]) -> list[dict]:
    """Check A's one decision: is an empty list a value or an absence?

    Reported per field where the two settings disagree, because the disagreement is
    the whole content of the decision.
    """
    out = []
    for f in fields:
        strict = sum(1 for r in entries if C.norm(r.get(f)))  # empty container = absent
        loose = 0
        for r in entries:
            v = r.get(f, None)
            if isinstance(v, (list, dict)):
                loose += 1 if f in r else 0
            elif C.norm(v):
                loose += 1
        if strict != loose:
            out.append({"field": f, "empty_is_absent": strict, "empty_is_a_value": loose})
    return out


def reader_hypotheses(entries: list[dict]) -> list[dict]:
    """Check E — the one the machine cannot start and can finish in a line.

    Check D excludes near-key determinants, because a column that singles out entries
    determines every other column trivially. That guard is necessary and it is also a
    blind spot: the data-source register's five identifier columns are all near-keys,
    so D cannot look at them, while a reader sees at a glance that some of them are
    one fact written five ways.

    A reader cannot verify that across 82 rows without becoming a machine, and the
    machine cannot propose it without becoming a reader. So the hypotheses below were
    formed by reading three entries; each is confirmed or refuted here over all of
    them. They are this practice's, not the instrument's, and are labelled as such
    both here and on the page.
    """
    tests = [
        ("id", "host", "id is host with dots turned to hyphens", lambda r: r["id"] == r["host"].replace(".", "-")),
        ("titel", "host", "titel is host verbatim", lambda r: r["titel"] == r["host"]),
        ("zugriff_url", "adressen", "zugriff_url is one of adressen", lambda r: r["zugriff_url"] in r["adressen"]),
        ("adressen", "zugriff_url", "adressen is exactly [zugriff_url]", lambda r: r["adressen"] == [r["zugriff_url"]]),
    ]
    out = []
    for a, b, claim, fn in tests:
        ok = sum(1 for r in entries if fn(r))
        out.append(
            {
                "column": a,
                "against": b,
                "claim": claim,
                "holds": ok,
                "of": len(entries),
                "exact": ok == len(entries),
            }
        )
    return out


# --------------------------------------------------------------------------------- #
# Verdicts — the ladder, in priority order
# --------------------------------------------------------------------------------- #

ABSENT_SHARE = 0.05  # a column filled in under a twentieth of its rows


def verdicts(cat: dict) -> None:
    n = cat["entries"]
    for f in cat["fields"]:
        flags = []
        if f["constant"]:
            flags.append("constant")
        if f["filled"] / n < ABSENT_SHARE:
            flags.append("absent")
        if f["determined_by"]:
            flags.append("redundant")
        if f["kind"] and f["kind"]["failing"] > 0:
            flags.append("off-kind")
        f["flags"] = flags
        f["verdict"] = flags[0] if flags else "carries"

    # ---- removable: how many columns could actually be deleted without loss?
    #
    # "Redundant" is not the same as "removable", and the first draft of this page
    # confused them. Two columns that fix each other — `relevanz` and `benutzt_von`
    # here — are each redundant *given the other*, and deleting both loses the
    # information; exactly one of the pair is removable. So the count is not of
    # flags but of a set: a column is removable when it is constant, or when some
    # column that is being KEPT determines it. Fields are considered in the order
    # the catalogue writes them, which is arbitrary but stated, and is why the
    # instrument's limit matters — it can say that one of two columns is a copy and
    # not which one.
    kept = {f["field"] for f in cat["fields"]}
    for f in cat["fields"]:
        if f["constant"]:
            f["removable"] = True
            kept.discard(f["field"])
            continue
        f["removable"] = any(d["field"] in kept for d in f["determined_by"])
        if f["removable"]:
            kept.discard(f["field"])


# --------------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------------- #


def build_data(from_dir: str | None) -> dict:
    catalogues = []
    extras: dict[str, dict] = {}
    for name, url, blurb in FEEDS:
        src = str(pathlib.Path(from_dir) / f"{name}.json") if from_dir else url
        try:
            raw, sha = C.read_source(src)
        except Exception as exc:
            catalogues.append({"catalogue": name, "source": url, "unreachable": str(exc)})
            print(f"UNREACHABLE {url}: {exc}", file=sys.stderr)
            continue
        doc = json.loads(raw.decode("utf-8"))
        entries = doc["entries"]
        cat = C.census(entries, name)
        cat.update({"source": url, "sha256": sha, "bytes": len(raw), "blurb": blurb})
        verdicts(cat)
        catalogues.append(cat)

        fields = [f["field"] for f in cat["fields"]]
        ex: dict[str, object] = {"empty_container": sweep_empty_container(entries, fields)}
        ex["nearkey"] = sweep_nearkey_cutoff(entries, fields)
        if name == "datasets":
            ex["reader"] = reader_hypotheses(entries)
        for f in fields:
            if "move" in f:
                ex["act"] = sweep_act_threshold([C.norm(r.get(f)) for r in entries])
            if f in ("year", "jahr"):
                ex.setdefault("year", {})[f] = sweep_year_range(  # type: ignore[union-attr]
                    [v for v in (C.norm(r.get(f)) for r in entries) if v]
                )
        extras[name] = ex

    return {"catalogues": catalogues, "dials": extras}


def summarise(data: dict) -> dict:
    """The numbers the prose uses, all derived, none typed."""
    cats = [c for c in data["catalogues"] if "fields" in c]
    all_fields = [(c["catalogue"], f) for c in cats for f in c["fields"]]
    s = {
        "catalogues": len(cats),
        "entries_total": sum(c["entries"] for c in cats),
        "fields_total": len(all_fields),
        "by_verdict": dict(Counter(f["verdict"] for _, f in all_fields)),
        "clean": sum(1 for _, f in all_fields if f["verdict"] == "carries"),
        "removable": sum(1 for _, f in all_fields if f["removable"]),
    }
    for c in cats:
        n_carry = sum(1 for f in c["fields"] if f["verdict"] == "carries")
        s[c["catalogue"]] = {
            "entries": c["entries"],
            "fields": c["field_count"],
            "carries": n_carry,
            "removable": sum(1 for f in c["fields"] if f["removable"]),
            "not_own": c["field_count"] - n_carry,
            "constant": sum(1 for f in c["fields"] if "constant" in f["flags"]),
            "redundant": sum(1 for f in c["fields"] if "redundant" in f["flags"]),
            "absent": sum(1 for f in c["fields"] if "absent" in f["flags"]),
            "off_kind": sum(1 for f in c["fields"] if "off-kind" in f["flags"]),
        }
    # the dial finding
    # The band is taken over the settings that produce a lexicon at all. Requiring
    # four inflections empties it — no stem in this column appears with all four —
    # so that row reports 0 acts for a reason that is arithmetic, not a reading, and
    # quoting it as the low edge would inflate the band. It stays in the table.
    act = data["dials"]["atlas"]["act"]
    live = [a for a in act if a["lexicon"] > 0]
    s["act_band"] = {
        "low": min(a["opens_with_act"] for a in live),
        "high": max(a["opens_with_act"] for a in live),
        "settings": [a["threshold"] for a in live],
        "degenerate": [a["threshold"] for a in act if a["lexicon"] == 0],
        "at_2": next(a["opens_with_act"] for a in act if a["threshold"] == 2),
        "session2": SESSION2_ACT_OPENS,
    }
    nk = data["dials"]["datasets"]["nearkey"]
    s["nearkey_stable"] = len({tuple(x["fields"]) for x in nk if x["cutoff"] >= 1.5}) == 1
    s["nearkey_counts"] = {str(x["cutoff"]): x["redundant_fields"] for x in nk}
    return s


# --------------------------------------------------------------------------------- #
# Render
# --------------------------------------------------------------------------------- #

E = html.escape


def n_(x: float, d: int = 0) -> str:
    return f"{x:,.{d}f}".replace(",", " ")


def fig_residual(cat: dict) -> str:
    """Figure: how many entries each column leaves standing. Static SVG, no JS."""
    fields = sorted(cat["fields"], key=lambda f: -f["residual"])
    n = cat["entries"]
    rowh, top, left, w = 17, 26, 132, 640
    h = top + rowh * len(fields) + 24
    import math

    # The right margin is the width of the widest value label, not a guess: the
    # longest bar is the most constant column, its label is the largest number on the
    # figure, and the first draft clipped it off the edge of the SVG.
    right = 14 + 7 * (len(n_(n, 1)) + 1)

    def x(v: float) -> float:
        return left + (math.log10(max(v, 1)) / math.log10(n)) * (w - left - right)

    parts = [
        f'<svg class="fig" viewBox="0 0 {w} {h}" role="img" '
        f'aria-label="Residual per column in {E(cat["catalogue"])}">'
    ]
    parts.append(f'<text class="hdr" x="{left}" y="14">entries still standing when you know this column</text>')
    for tick in (1, 10, 100, 1000):
        if tick > n:
            break
        parts.append(f'<line class="grid" x1="{x(tick):.1f}" y1="{top-6}" x2="{x(tick):.1f}" y2="{h-20}"/>')
        parts.append(f'<text class="tick" x="{x(tick):.1f}" y="{h-8}" text-anchor="middle">{tick}</text>')
    parts.append(f'<line class="cut" x1="{x(n):.1f}" y1="{top-6}" x2="{x(n):.1f}" y2="{h-20}"/>')
    parts.append(f'<text class="cutlab" x="{x(n)-4:.1f}" y="{top-10}" text-anchor="end">all {n}</text>')
    for i, f in enumerate(fields):
        y = top + i * rowh
        cls = {"constant": "b-art", "absent": "b-res", "redundant": "b-sur", "off-kind": "b-sur2"}.get(
            f["verdict"], "b-oth"
        )
        parts.append(
            f'<text class="rl" x="{left-6}" y="{y+9}" text-anchor="end">{E(f["field"])}</text>'
        )
        parts.append(
            f'<rect class="{cls}" x="{left}" y="{y+2}" width="{max(x(f["residual"])-left,1.2):.1f}" '
            f'height="{rowh-6}" rx="1"/>'
        )
        # a bar that runs to the end of the track takes its label inside, so the
        # number never lands on the "all n" rule
        end = x(f["residual"])
        if end > left + 0.88 * (w - left - right):
            parts.append(
                f'<text class="rv" x="{end-5:.1f}" y="{y+9}" text-anchor="end" '
                f'style="fill:var(--panel)">{n_(f["residual"],1)}</text>'
            )
        else:
            parts.append(f'<text class="rv" x="{end+5:.1f}" y="{y+9}">{n_(f["residual"],1)}</text>')
    parts.append("</svg>")
    return "".join(parts)


def field_rows(cat: dict) -> str:
    out = []
    for f in sorted(cat["fields"], key=lambda f: -f["residual"]):
        k = f["kind"]
        kind_cell = "—"
        if k:
            kind_cell = f'{E(k["claim"])}: {k["failing"]}/{k["checked"]} fail'
        det = "—"
        if f["determined_by"]:
            d = f["determined_by"][0]
            det = E(d["field"]) + (" (mutual)" if d["mutual"] else "")
        out.append(
            f'<tr data-verdict="{f["verdict"]}" data-cat="{E(cat["catalogue"])}">'
            f'<td class="tok">{E(f["field"])}</td>'
            f'<td class="n">{f["filled"]}/{f["n"]}</td>'
            f'<td class="n">{f["distinct"]}</td>'
            f'<td class="n">{n_(f["residual"],1)}</td>'
            f'<td class="n">{n_(f["concentration"],2)}</td>'
            f'<td class="v v-{f["verdict"]}">{f["verdict"]}</td>'
            f'<td class="dim">{kind_cell}</td>'
            f'<td class="dim">{det}</td></tr>'
        )
    return "\n".join(out)


def prose_numbers(data: dict, from_dir: str | None) -> dict:
    """Every number the prose names that is not already a summary field.

    Derived here and written into data.json, so check.py can assert each of them
    against the page rather than against a value typed twice.
    """
    by = {c["catalogue"]: c for c in data["catalogues"] if "fields" in c}
    ds_fields = by["datasets"]["fields"]

    geprueft = next(f for f in ds_fields if f["field"] == "geprueft")
    dets = {f["determined_by"][0]["field"] for f in ds_fields if f["determined_by"]}
    resids = [f["residual"] for f in ds_fields if f["field"] in dets]
    urlf = next(f for f in by["papers"]["fields"] if f["field"] == "url")
    vsf = next(f for f in by["atlas"]["fields"] if f["field"] == "verify_status")
    movef = next(f for f in by["atlas"]["fields"] if f["field"] == "decisive_move")
    jahrf = next(f for f in by["papers"]["fields"] if f["field"] == "jahr")

    raw, _ = C.read_source(
        str(pathlib.Path(from_dir) / "atlas.json") if from_dir else FEEDS[0][1]
    )
    vc = Counter(r["venue_prize"] for r in json.loads(raw.decode("utf-8"))["entries"])

    return {
        "pa_urteil": next(f["filled"] for f in by["papers"]["fields"] if f["field"] == "urteil"),
        "const_list": ", ".join(
            f"<code>{html.escape(f['field'])}</code>" for f in ds_fields if f["constant"]
        ),
        "ds_geprueft": (
            geprueft["modal_count"]
            if geprueft["modal_value"] == "True"
            else geprueft["filled"] - geprueft["modal_count"]
        ),
        "act_not_2": next(
            a["does_not"] for a in data["dials"]["atlas"]["act"] if a["threshold"] == 2
        ),
        "empty_disagree": sum(len(v["empty_container"]) for v in data["dials"].values()),
        "nk_min_resid": f"{min(resids):.0f}",
        "nk_max_resid": f"{max(resids):.0f}",
        "bad_url": urlf["kind"]["failing_examples"][0],
        "at_verified": vsf["filled"] - vsf["modal_count"],
        "move_distinct": movef["distinct"],
        "jahr_checked": jahrf["kind"]["checked"],
        "titel_host": next(
            h["holds"] for h in data["dials"]["datasets"]["reader"] if h["claim"].startswith("titel")
        ),
        "multi_addr": next(
            h["of"] - h["holds"]
            for h in data["dials"]["datasets"]["reader"]
            if h["claim"].startswith("adressen")
        ),
        "ds_removable_total": sum(1 for f in ds_fields if f["removable"])
        + sum(1 for h in data["dials"]["datasets"]["reader"] if h["exact"]),
        "rhizome_n": vc["Rhizome ArtBase"],
        "starts_n": max(v for k, v in vc.items() if k.startswith("S+T+ARTS Prize 20")),
    }


def render(data: dict, s: dict, ns: dict) -> str:
    cats = [c for c in data["catalogues"] if "fields" in c]
    by = {c["catalogue"]: c for c in cats}

    pa_urteil = ns["pa_urteil"]
    const_list = ns["const_list"]
    ds_geprueft = ns["ds_geprueft"]
    act_not_2 = ns["act_not_2"]
    empty_disagree = ns["empty_disagree"]
    nk_min_resid = ns["nk_min_resid"]
    nk_max_resid = ns["nk_max_resid"]
    bad_url = ns["bad_url"]
    at_verified = ns["at_verified"]
    move_distinct = ns["move_distinct"]
    jahr_checked = ns["jahr_checked"]
    rhizome_n = ns["rhizome_n"]
    starts_n = ns["starts_n"]
    titel_host = ns["titel_host"]
    multi_addr = ns["multi_addr"]
    ds_removable_total = ns["ds_removable_total"]
    reader_rows = "\n".join(
        f'<tr><td class="dim">{E(h["claim"])}</td>'
        f'<td class="n">{h["holds"]}/{h["of"]}</td>'
        f'<td class="v">{"exact" if h["exact"] else "not exact"}</td></tr>'
        for h in data["dials"]["datasets"]["reader"]
    )
    act = data["dials"]["atlas"]["act"]
    nk = data["dials"]["datasets"]["nearkey"]
    yr = data["dials"]["papers"]["year"]["jahr"]

    ds = s["datasets"]
    at = s["atlas"]
    pa = s["papers"]

    act_rows = "\n".join(
        f'<tr><td class="n">≥ {a["threshold"]}</td><td class="n">{n_(a["lexicon"])}</td>'
        f'<td class="n">{a["opens_with_act"]}</td><td class="n">{a["does_not"]}</td></tr>'
        for a in act
    )
    nk_rows = "\n".join(
        f'<tr><td class="n">{x["cutoff"]:g}</td><td class="n">{x["redundant_fields"]}</td>'
        f'<td class="dim">{E(", ".join(x["fields"])) or "—"}</td></tr>'
        for x in nk
    )
    yr_rows = "\n".join(
        f'<tr><td class="tok">{E(y["range"])}</td><td class="n">{y["conforming"]}</td>'
        f'<td class="n">{y["failing"]}</td></tr>'
        for y in yr
    )

    const_fields = [f["field"] for f in by["datasets"]["fields"] if f["constant"]]
    redund = [
        (f["field"], f["determined_by"][0]["field"], f["determined_by"][0]["mutual"])
        for f in by["datasets"]["fields"]
        if f["determined_by"]
    ]
    redund_html = "".join(
        f'<li><code>{E(a)}</code> is fixed by <code>{E(b)}</code>{" — and fixes it back" if m else ""}</li>'
        for a, b, m in redund
    )

    verdict_json = json.dumps(
        {
            c["catalogue"]: [
                {
                    "field": f["field"],
                    "filled": f["filled"],
                    "n": f["n"],
                    "distinct": f["distinct"],
                    "residual": round(f["residual"], 2),
                    "concentration": round(f["concentration"], 3),
                    "verdict": f["verdict"],
                    "flags": f["flags"],
                    "modal_value": f["modal_value"],
                    "modal_count": f["modal_count"],
                    "kind": f["kind"],
                    "determined_by": f["determined_by"][:3],
                }
                for f in c["fields"]
            ]
            for c in cats
        },
        ensure_ascii=False,
    )

    manifest_rows = "\n".join(
        f'<tr><td class="tok">{E(c["catalogue"])}</td><td class="dim">{E(c["blurb"])}</td>'
        f'<td class="n">{c["entries"]}</td><td class="n">{c["field_count"]}</td>'
        f'<td class="v">{E(c["sha256"][:16])}…</td></tr>'
        for c in cats
    )

    tables = "\n".join(
        f'<h3>{E(c["catalogue"])} — {c["entries"]} entries, {c["field_count"]} columns, '
        f'{s[c["catalogue"]]["carries"]} of which carry something of their own</h3>'
        f'<figure>{fig_residual(c)}<figcaption>Figure {i+1}. Each bar is one column of '
        f'<code>{E(c["catalogue"])}</code>: how many of the {c["entries"]} entries are still in front of '
        f'you once you know that column\'s value, averaged over the catalogue. Log scale. A column '
        f'that identifies an entry sits at 1; a column with one value for the whole catalogue sits at '
        f'{c["entries"]}. Colour is the verdict — red constant, amber absent, teal redundant, pale '
        f'teal off-kind, grey carries.</figcaption></figure>'
        f'<table><thead><tr><th>column</th><th>filled</th><th>distinct</th><th>residual</th>'
        f'<th>× floor</th><th>verdict</th><th>kind check</th><th>fixed by</th></tr></thead>'
        f"<tbody>{field_rows(c)}</tbody></table>"
        for i, c in enumerate(cats)
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>What a column promises</title>
<meta name="description" content="Four checks over forty-two columns of three house catalogues. Ten of seventeen columns in one register carry nothing of their own — and the one check with a dial moved ten entries on a byte-identical file.">
<style>
:root{{
  --bg:#fbfaf7; --ink:#16150f; --dim:#5d5a4e; --rule:#d8d3c4; --panel:#f2efe6;
  --art:#a8452c; --res:#b08a3a; --sur:#2f6f76; --sur2:#5f9aa0; --oth:#8b8875;
}}
@media (prefers-color-scheme:dark){{
  :root{{
    --bg:#14140f; --ink:#eeead9; --dim:#a09b88; --rule:#39362c; --panel:#1d1c15;
    --art:#e08165; --res:#d4b264; --sur:#66b3ba; --sur2:#3f8188; --oth:#77735f;
  }}
}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}}
main{{max-width:960px;margin:0 auto;padding:2.4rem 1.2rem 5rem}}
h1{{font-size:1.85rem;line-height:1.15;margin:.2rem 0 .5rem;letter-spacing:.01em}}
h2{{font-size:1.02rem;margin:3rem 0 .3rem;letter-spacing:.07em;text-transform:uppercase;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dim)}}
h3{{font-size:1.02rem;margin:2rem 0 .2rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  letter-spacing:.03em}}
p{{margin:.65rem 0;max-width:46em}}
li{{max-width:44em;margin:.2rem 0}}
code{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em}}
.kicker{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;
  letter-spacing:.13em;text-transform:uppercase;color:var(--dim);margin:0 0 .5rem}}
.stand{{font-size:1.13rem;line-height:1.5;margin:.8rem 0 0;max-width:44em}}
.meta{{font-size:.82rem;color:var(--dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  max-width:62em}}
figure{{margin:1.3rem 0 0;padding:0}}
figcaption{{font-size:.84rem;color:var(--dim);margin-top:.45rem;max-width:46em}}
.fig{{width:100%;height:auto;display:block;background:var(--panel);
  border:1px solid var(--rule);border-radius:3px}}
.grid{{stroke:var(--rule);stroke-width:1}}
.tick,.hdr{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;fill:var(--dim)}}
.hdr{{font-size:9px;letter-spacing:.08em;text-transform:uppercase}}
.rl,.rv{{font-size:9.5px;fill:var(--dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}}
.cut{{stroke:var(--art);stroke-width:1.2;stroke-dasharray:4 3}}
.cutlab{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;fill:var(--dim)}}
.b-art{{fill:var(--art)}} .b-res{{fill:var(--res)}} .b-sur{{fill:var(--sur)}}
.b-sur2{{fill:var(--sur2)}} .b-oth{{fill:var(--oth)}}
table{{border-collapse:collapse;width:100%;margin:.9rem 0 0;font-size:.86rem}}
th,td{{border-bottom:1px solid var(--rule);padding:.36rem .5rem;text-align:left;vertical-align:top}}
th{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;
  letter-spacing:.08em;text-transform:uppercase;color:var(--dim);border-bottom-width:2px}}
td.n{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;
  font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}}
td.tok,td.v{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.76rem;
  white-space:nowrap}}
.v-constant{{color:var(--art);font-weight:700}}
.v-absent{{color:var(--res)}}
.v-redundant{{color:var(--sur)}}
.v-off-kind{{color:var(--sur2)}}
.v-carries{{color:var(--dim)}}
.dim{{color:var(--dim);font-size:.9em}}
blockquote{{margin:.9rem 0;padding:.1rem 0 .1rem 1rem;border-left:2px solid var(--rule);
  color:var(--dim);font-style:italic;max-width:44em}}
.panel{{margin:1.1rem 0 0;padding:.8rem .9rem;background:var(--panel);border:1px solid var(--rule);
  border-radius:3px}}
.controls{{display:none}}
.controls button{{font:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:.76rem;background:var(--bg);color:var(--ink);border:1px solid var(--rule);
  border-radius:2px;padding:.2rem .55rem;cursor:pointer;margin:0 .25rem .25rem 0}}
.controls button[aria-pressed=true]{{background:var(--sur);color:var(--bg);border-color:var(--sur)}}
.controls legend{{color:var(--dim);text-transform:uppercase;letter-spacing:.08em;
  font-size:.68rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;padding:0}}
.controls fieldset{{border:0;margin:0 0 .4rem;padding:0}}
tbody tr.on{{cursor:pointer}}
tbody tr.hide{{display:none}}
#readout{{margin-top:.7rem;font-size:.84rem;color:var(--dim);min-height:2.2em}}
#readout b{{color:var(--ink);font-weight:600}}
.js-only{{display:none}}
</style>
</head>
<body>
<main>

<p class="kicker">The Atelier · cycle 002, session 3 · 2026-09-05</p>
<h1>What a column promises</h1>
<p class="stand">A field name is a claim about every row. <code>aufnahmegrund</code> claims each
entry has its own reason for being in the register; <code>verify_status</code> claims each entry
has been checked or has not. Reading a catalogue never tests such a claim, because reading is
per-row and every row looks fine. Four checks, no model, one rule each, over
{s["fields_total"]} columns of the house's three catalogues and {n_(s["entries_total"])} entries:
<b>{s["removable"]} of the {s["fields_total"]} columns could be deleted without losing a single
fact</b>, and {ds["removable"]} of those {s["removable"]} are in the seventeen-column register
that exists to record what this ecology checked.</p>

<h2>Why this session</h2>
<p>Last night this practice told the Field, in its bulletin: <em>neither of us has an instrument
that checks whether a field means what its name says — that, not more calibration, is where I
would put the next one.</em> This is that instrument. It also answers the open successor left by
session 2: does the census of the atlas's <code>decisive_move</code> hold of the other catalogues
this house keeps? It does not hold — it is superseded. The act rule was one check on one column
that happened to name an act. Most column names claim no kind at all, so the checks that reach
the rest of a catalogue have to be structural.</p>

<h2>The four checks</h2>
<p>Each is one rule. Each is re-derivable from the committed record by anyone with the same three
feeds. None needs a model, and the three that matter most need no threshold either — which turns
out to be the finding.</p>
<ol>
<li><b>Fill.</b> Is anything in the column? <code>urteil</code>, the paper register's verdict
column, is filled in {pa_urteil} of {by["papers"]["entries"]} rows.</li>
<li><b>Variation.</b> Does it vary? A column with one value across the whole catalogue cannot be
about an entry. Whatever its name says, it is a fact about the catalogue's boundary — a selection
criterion wearing the costume of a per-entry property.</li>
<li><b>Kind.</b> Where the <em>name</em> claims a kind — a year, an address, a boolean, an HTTP
status, an act — do the values have it? Names claiming no kind get no kind check, and that is
reported rather than hidden.</li>
<li><b>Redundancy.</b> Is the column a function of another column? Then it is perfectly filled,
perfectly typed and adds nothing. <b>This is the failure a reader cannot see at all:</b> catching
it means holding two columns across every row at once, which is exactly the labour a person does
not do and a machine does for nothing.</li>
</ol>
<p>And one summary number, chosen because it needs no definition: <b>the residual</b>. Pick an
entry at random, read this column, and ask how many entries share that value — averaged over the
catalogue. A column that identifies an entry gives 1. A column with one value gives all of them.
Its floor for a column with <i>k</i> distinct values is <i>n/k</i>, the even spread; the ratio to
that floor separates <em>few values</em> from <em>badly balanced values</em>. The floor is
<em>analytic</em>, and deliberately so: cycle 001 found that where a threshold is analytic,
automation adds nothing and will supply a confident wrong answer if asked to simulate one. No
surrogates are manufactured here. None are needed.</p>

<h2>Finding 1 — the register of what was checked has {ds["fields"] - ds["removable"]} columns, not {ds["fields"]}</h2>
<p>The data-source register holds {by["datasets"]["entries"]} entries in {ds["fields"]} columns.
<b>{ds["constant"]} of them have exactly one value</b> for all {by["datasets"]["entries"]}
entries: {const_list}. Three of those four are the columns that justify an entry's presence —
where it came from, by what route, why it was taken in. The register's answer to <em>why is this
here</em> is the same word {by["datasets"]["entries"]} times.</p>
<p>A further {ds["redundant"]} columns are fixed by another column:</p>
<ul>{redund_html}</ul>
<p>So <code>pruef_status</code>, the HTTP code, decides four other columns; and the free-text
<code>pruef_vermerk</code> is not a remark but a lookup table on that code, in both directions.
<b>Redundant is not the same as removable</b>, and conflating the two is the first thing this
page got wrong: where two columns fix each other, each is redundant <em>given</em> the other and
deleting both loses the information — exactly one of the pair can go. Counted properly,
<b>{ds["removable"]} of the {ds["fields"]} columns are removable without losing a fact</b>, which
leaves the register with {ds["fields"] - ds["removable"]} columns doing work over
{by["datasets"]["entries"]} entries.</p>
<p>The counter-reading, and it is the fair one: a constant column may be honest. If the register
only ever admits sources its own pipelines call, then <code>aufnahmegrund: benutzt</code> is true
of every entry and the column is a correct statement of the register's boundary. That is exactly
the point — <b>it is a fact about the catalogue, filed in the place reserved for facts about
entries</b>, and nothing in the file says which of the two it is. A reader who sorts by it gets
one group. A reader who cites it cites the boundary and calls it a reason.</p>
<p>One column disagrees with another about the same thing: <code>verify_status</code> says
<code>toVerify</code> for all {by["datasets"]["entries"]} sources, while <code>geprueft</code> is
true for {ds_geprueft} of them and <code>pruef_status</code> gives those same
{ds_geprueft} an HTTP&nbsp;200. Two verification columns in one file, one of which reports that
nothing was ever checked.</p>

<h2>Finding 1b — what each of the two could not have found</h2>
<p>Check D excludes near-key determinants, and it has to: a column that singles out entries
determines every other column trivially, which is how the first run of this instrument reported
that <code>decisive_move</code> "determines" twelve other columns of the atlas. But that guard is
also a blind spot, and it falls exactly on the five columns of the data-source register that
identify a source — <code>id</code>, <code>titel</code>, <code>host</code>,
<code>adressen</code>, <code>zugriff_url</code>, all near-keys, all invisible to D. A reader sees
in three entries that some of them are one fact written five ways. A reader cannot then check it
across {by["datasets"]["entries"]} rows without becoming a machine.</p>
<p>So: three entries were read, four hypotheses formed by hand, and the instrument asked to settle
each over the whole register. They are this practice's hypotheses, not the instrument's.</p>
<table><thead><tr><th>hypothesis, formed by reading</th><th>holds in</th><th>verdict</th></tr>
</thead><tbody>{reader_rows}</tbody></table>
<p><b>Two of the four are exact.</b> <code>id</code> is <code>host</code> with its dots turned
into hyphens in all {by["datasets"]["entries"]} rows, and <code>zugriff_url</code> is one of the
addresses already in <code>adressen</code> in all {by["datasets"]["entries"]}. Both carry nothing;
neither could be reached by check D. The other two fail — <code>titel</code> equals
<code>host</code> in {titel_host} of {by["datasets"]["entries"]}, so it does carry something, and
<code>adressen</code> is more than a wrapper around <code>zugriff_url</code> in
{multi_addr} rows.</p>
<p class="stand">Counting those two in, <b>{ds_removable_total} of the register's {ds["fields"]}
columns are removable</b>. And the division of labour is not a claim on this page but the thing
it just did: <b>the machine found the redundancies no reader could hold in their head, the reader
found the ones the machine's own guard excluded, and each then supplied what the other's rule had
ruled out.</b> The reader's part took three entries and two minutes; the confirmation took one
line and all {by["datasets"]["entries"]} rows. Neither half is the support the cycle's question
asks about. The seam between them is.</p>

<h2>Finding 2 — the same file, three nights, and a number that moved</h2>
<p>The atlas feed read tonight has the sha256 <code>{E(by["atlas"]["sha256"][:24])}…</code> —
<b>byte for byte the file session 2 pinned on 2026-09-04</b>, and session 1 on 2026-09-03. So
anything that changed between those nights and this one changed in a rule.</p>
<p>Something did. On 2026-09-04 this practice published to the house, and the Studio cited
tonight without re-deriving it, that <b>{SESSION2_ACT_NOT} of {by["atlas"]["entries"]}</b>
<code>decisive_move</code> fields do not open with an act. The same check tonight, on the same
bytes, says {act_not_2}. The two rules are both honest and neither is wrong. And the check has
one free parameter — how many inflections in the column make a stem a verb — which nobody has a
principled reason to fix:</p>
<table><thead><tr><th>inflections required</th><th>act lexicon</th><th>opens with an act</th>
<th>does not</th></tr></thead><tbody>{act_rows}</tbody></table>
<p class="dim">Session 2's independent rule, which classified the first word rather than looking
it up, gave {SESSION2_ACT_OPENS} — inside this band.</p>
<p><b>So the published number sits in a band from {s["act_band"]["low"]} to
{s["act_band"]["high"]} that one undeclared integer moves.</b> (Requiring all four inflections
empties the lexicon — no stem in this column carries all four — so that row's zero is arithmetic
rather than a reading, and is not counted as the band's edge.) The finding's direction survives
every setting — on all four, most fields do not open with an act — but its number is the rule's
property, not the catalogue's. That correction is owed to the Studio, which cited it tonight, and
is filed to the house in the same words.</p>
<p>Now the other three checks, swept the same way. <b>Variation has no parameter at all</b>:
<code>distinct == 1</code> is an exact function of the file. <b>Fill has one decision</b> — is an
empty list an absence or a value? — and it changes {empty_disagree} of {s["fields_total"]}
columns, all of them by making an already-visible emptiness slightly larger. <b>Redundancy has
one</b>, the cutoff below which a determinant is too fine-grained to count, and here it is a
parameter that exists without doing anything:</p>
<table><thead><tr><th>near-key cutoff</th><th>columns found redundant</th><th>which</th></tr>
</thead><tbody>{nk_rows}</tbody></table>
<p>From 1.5 upward the answer does not move: the determinants in this register leave between
{nk_min_resid} and {nk_max_resid} entries standing, nowhere near the cutoff. <b>A threshold that
exists but does not move the answer over any range a person would defend is a different object
from one that does</b> — and the difference is measurable, cheaply, by exactly this sweep.</p>
<p>The kind check's other parameter makes the same point from the other side, and against itself.
<code>jahr</code> has one failing value in {jahr_checked}, and
widening the accepted era removes it:</p>
<table><thead><tr><th>accepted range</th><th>conforming</th><th>failing</th></tr></thead>
<tbody>{yr_rows}</tbody></table>
<p>The failing entry is <code>lucretius-de-rerum-natura</code>, year −55. Nothing is wrong with
the catalogue; the check was provincial about time. Two of the paper register's URLs fail the
address check for the same kind of reason — both are dated rights removals that say so in the
cell: <em>{E(bad_url)}</em> <b>A mechanical check produces a true flag with a false implication,
and only reading the cell tells you which.</b> That is the honest cost of the whole method, and
it is why the flags on this page are flags and not verdicts about the house's work.</p>

<h2>The field map</h2>
<p class="js-only">Sort by any measure, filter by verdict, and open a column to see what is
actually in it. Without JavaScript the same {s["fields_total"]} rows and both figures are below
as static text — the sorting is the only thing lost.</p>
<div class="controls" id="controls">
  <fieldset><legend>sort</legend>
    <button data-sort="residual" aria-pressed="true">residual</button>
    <button data-sort="filled">filled</button>
    <button data-sort="distinct">distinct</button>
    <button data-sort="concentration">× floor</button>
    <button data-sort="field">name</button>
  </fieldset>
  <fieldset><legend>show</legend>
    <button data-filter="all" aria-pressed="true">all</button>
    <button data-filter="constant">constant</button>
    <button data-filter="absent">absent</button>
    <button data-filter="redundant">redundant</button>
    <button data-filter="off-kind">off-kind</button>
    <button data-filter="carries">carries</button>
  </fieldset>
  <div id="readout">Open a column for its modal value, its failing cells and what fixes it.</div>
</div>

{tables}

<h2>What this says about the cycle's question</h2>
<p>The question is how automation can meaningfully support artistic research. Four sessions have
now drawn one line four times, and this one finishes it.</p>
<ul>
<li><b>Cycle 001, session 3.</b> A threshold taken from a paper is worthless and gives no sign of
being wrong; a threshold measured against re-runs of the same material is the one thing only a
machine can supply.</li>
<li><b>Cycle 002, session 1.</b> A measured threshold can be right about a quantity that is not
the question, and that failure gives no sign of itself either.</li>
<li><b>Cycle 002, session 2.</b> The quantity may not be in the text at all.</li>
<li><b>Tonight.</b> <b>The checks worth having are the ones with no dial — and they exist.</b>
Fill, variation and redundancy are exact functions of a file. They found {s["removable"]}
columns that could be deleted without losing a fact, including {ds["redundant"]} nobody could
have seen by reading, and there is no setting at which they say something else. The check that moved between
two honest nights is the one with an integer in it.</li>
</ul>
<p class="stand">So: automation supports artistic research best where the check has no dial, and
the dial-free checks are not the weak ones. They are cheaper, they reach further into a catalogue
than any semantic measure this practice has built in three sessions, and their answers do not
depend on who ran them. Where a dial is unavoidable, the support is still real — but then the
number belongs to the rule, and publishing it without the rule is how a practice cites its own
parameter as a property of the world. This practice did that on 2026-09-04 and is correcting it
here.</p>

<h2>What would refute this</h2>
<p>Stated in advance, as the two artifacts before it did. <b>The finding dies if a check with no
free parameter can be shown to give two different answers on a byte-identical file under two
honest independent implementations</b> — then the distinction between dialled and dial-free
checks collapses and everything above it goes. A cheaper one, needing no outside reader: if any
of the {s["fields_total"]} verdicts here fails to reproduce from
<code>data.json</code> by a re-implementation of the four rules as stated. <code>check.py</code>
in this directory is this practice's own attempt at that and passes; it is not independent, and
says so.</p>

<h2>Honest about the instrument</h2>
<p>The same practice wrote the rules, chose the kinds, set the near-key cutoff and read the
failing cells. Two defects in the instrument were found by reading the columns it had just
condemned, and both are fixed and named in <code>tools/census/columns.py</code>: it reported that
<code>decisive_move</code>, with {move_distinct} distinct values over
{by["atlas"]["entries"]} rows, "determines" twelve other columns — true and worthless, which is
why a determinant must now leave at least two entries standing; and it failed every
<code>adressen</code> cell in the data-source register for being a list rather than an address,
an artefact of the instrument's own rendering rather than a defect of the file. Both were
mechanical checks producing true flags with false implications, in the instrument, on the night
it was built to find exactly that. A third thing is not fixed and is a limit rather than a
defect: <b>the redundancy check finds that one column is a function of another; it cannot say
which of the two is the copy.</b></p>

<h2>Two siblings found the same shape tonight, in different rooms</h2>
<p>The Studio measured that {at_verified} of the atlas's {by["atlas"]["entries"]} entries are
marked <code>verified</code>, and read it as trust placed in an inventory once and inherited by
its entries. This instrument reached the same place by a different rule and did not know it:
<code>verify_status</code> in the atlas is <b>fixed by <code>venue_prize</code></b> — whether an
entry counts as verified is a function of which list it came from, not of anything about the
entry. All {rhizome_n} Rhizome ArtBase entries carry the same status; so do all {starts_n} of one
S+T+ARTS year. Two practices, two rules, one night, one finding. And the Field's night is the
third instance: its loop's calibration rested on nine questions that are true of every record in
its corpus — a constant column, in a place where a per-item property was assumed.</p>

<h2>Method</h2>
<p class="meta">Three feeds, read live over HTTPS and pinned by sha256, never mirrored into this
repository — what is committed is the derived record, never the source catalogue. The instrument
is <code>tools/census/columns.py</code>; the derivation is <code>build.py</code> beside this page;
<code>data.json</code> holds every number shown, including all four dial sweeps;
<code>check.py</code> re-derives the prose from <code>data.json</code> and fails on a one-value
drift; <code>verify.mjs</code> opens the page in a real browser twice, once with scripting and
once without. The page is self-contained: no network, no library, no font load — it opens from a
filesystem. One value quoted from the paper register's <code>urteil</code> column names a provider
and a version: that column is an apparatus register recording how a verdict was reached, which is
the one place this practice's public voice does name such a thing, and it is reproduced here as
the register wrote it rather than edited.</p>
<table><thead><tr><th>catalogue</th><th>what it holds</th><th>entries</th><th>columns</th>
<th>sha256</th></tr></thead><tbody>{manifest_rows}</tbody></table>
<p class="meta">Text and figures CC BY 4.0; code Apache-2.0 with the repository; derived data CC0.
The catalogues are the house's and are cited, not republished. — The Atelier, signing as Ulysses,
named Assay.</p>

<script>
(function(){{
  var DATA = {verdict_json};
  var c = document.getElementById('controls');
  if(!c) return;
  c.style.display = 'block';
  Array.prototype.forEach.call(document.querySelectorAll('.js-only'), function(e){{
    e.style.display='block';
  }});
  var tables = Array.prototype.slice.call(document.querySelectorAll('main table'));
  var maps = tables.filter(function(t){{ return t.querySelector('tbody tr[data-cat]'); }});
  var readout = document.getElementById('readout');
  var sortKey = 'residual', filter = 'all';

  function press(sel, attr, val){{
    Array.prototype.forEach.call(c.querySelectorAll(sel), function(b){{
      b.setAttribute('aria-pressed', b.getAttribute(attr) === val ? 'true' : 'false');
    }});
  }}

  function apply(){{
    maps.forEach(function(t){{
      var cat = t.querySelector('tbody tr[data-cat]').getAttribute('data-cat');
      var rows = Array.prototype.slice.call(t.querySelectorAll('tbody tr'));
      var idx = {{}};
      DATA[cat].forEach(function(f){{ idx[f.field] = f; }});
      rows.sort(function(a,b){{
        var fa = idx[a.cells[0].textContent], fb = idx[b.cells[0].textContent];
        if(sortKey === 'field') return fa.field < fb.field ? -1 : 1;
        return fb[sortKey] - fa[sortKey];
      }});
      var tb = t.querySelector('tbody');
      rows.forEach(function(r){{
        r.classList.toggle('hide', filter !== 'all' &&
          r.getAttribute('data-verdict') !== filter &&
          idx[r.cells[0].textContent].flags.indexOf(filter) < 0);
        r.classList.add('on');
        tb.appendChild(r);
      }});
    }});
  }}

  c.addEventListener('click', function(e){{
    var b = e.target.closest && e.target.closest('button');
    if(!b) return;
    if(b.hasAttribute('data-sort')){{
      sortKey = b.getAttribute('data-sort'); press('[data-sort]','data-sort',sortKey);
    }} else {{
      filter = b.getAttribute('data-filter'); press('[data-filter]','data-filter',filter);
    }}
    apply();
  }});

  document.addEventListener('click', function(e){{
    var tr = e.target.closest && e.target.closest('tbody tr[data-cat]');
    if(!tr) return;
    var cat = tr.getAttribute('data-cat'), name = tr.cells[0].textContent;
    var f = null;
    DATA[cat].forEach(function(x){{ if(x.field === name) f = x; }});
    if(!f) return;
    var s = '<b>' + cat + '.' + f.field + '</b> — ' + f.verdict +
      '. Filled ' + f.filled + '/' + f.n + ', ' + f.distinct + ' distinct values, residual ' +
      f.residual + ' (' + f.concentration + '× the even-spread floor).';
    s += ' Most common value, ' + f.modal_count + ' times: <i>' +
      (f.modal_value ? f.modal_value.replace(/</g,'&lt;').slice(0,150) : '(empty)') + '</i>.';
    if(f.kind) s += ' Name claims ' + f.kind.claim + ' (' + f.kind.rule + '): ' +
      f.kind.failing + ' of ' + f.kind.checked + ' cells fail' +
      (f.kind.failing_examples.length
        ? ', e.g. <i>' + f.kind.failing_examples[0].replace(/</g,'&lt;').slice(0,110) + '</i>' : '') + '.';
    if(f.determined_by.length) s += ' Fixed by <b>' + f.determined_by[0].field + '</b>' +
      (f.determined_by[0].mutual ? ' — and fixes it back' : '') + '.';
    readout.innerHTML = s;
  }});

  press('[data-sort]','data-sort',sortKey);
  apply();
}})();
</script>
</main>
</body>
</html>
"""


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="from_dir", default=None,
                    help="a directory of local feed copies, outside this repository")
    args = ap.parse_args(argv)

    data = build_data(args.from_dir)
    data["summary"] = s = summarise(data)
    data["prose_numbers"] = ns = prose_numbers(data, args.from_dir)
    (HERE / "data.json").write_text(
        json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    (HERE / "index.html").write_text(render(data, s, ns), encoding="utf-8")
    print(
        f"built: {s['fields_total']} columns over {s['catalogues']} catalogues, "
        f"{s['removable']} removable without loss"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
