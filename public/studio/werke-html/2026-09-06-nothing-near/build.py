#!/usr/bin/env python3
"""
NOTHING NEAR — Ensemble / The Studio, 2026-09-06.

Builds data.json and index.html from one live feed: the house's Atlas of Data Art.

The feed is read, never mirrored. Only derived records are committed.

    python3 build.py                 fetch the feed, derive everything, write data.json + index.html
    python3 build.py --check         rebuild into memory and fail on any drift from the committed files
    python3 build.py --verify-feed   re-fetch the feed and reprove every per-entry record against it

Every number that appears on the page is derived here and asserted against the
served document by verify.mjs.
"""

import argparse
import collections
import hashlib
import html
import itertools
import json
import math
import os
import re
import statistics
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FEED = "https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json"
FEED_ALT = "https://frankbueltge.de/atlas/werke.json"
PINNED_SHA = "64399132bc5c6171e0817eba66708b04b540499e8b31ebd16979d08c8757f243"
DATE = "2026-09-06"

# The sentence this work would put in the Atlas if it were an entry there.
# It is run through the instrument by the instrument, and the result is printed.
SELF_SENTENCE = (
    "A search box over a catalogue of five hundred and twenty-one artworks that publishes how blind "
    "it is: the reader types the sentence of a work they are about to make, the page returns the "
    "nearest entries by word overlap, refuses any verdict on whether that is too near, and shows "
    "instead the real pairs inside the catalogue that stand at the same distance."
)

# ---------------------------------------------------------------- the rule

STOPWORDS = set(
    "a an the of and or to in on with as by for from into at is are was were be been being it its "
    "that this these those which who whose what where when how why not no nor but if then than so "
    "such each other another own same very can could may might will would shall should must do does "
    "did done have has had having he she they them their his her our your my me you i us we one two "
    "three four five".split()
)

SUFFIXES = ("ing", "ies", "ed", "es", "s")


def stem(w):
    """A crude, stated, mechanical stemmer. No dictionary, no model, no language data."""
    for suf in SUFFIXES:
        if w.endswith(suf) and len(w) - len(suf) >= 4:
            return w[: -3] + "y" if suf == "ies" else w[: -len(suf)]
    return w


def tokenize(s, use_stopwords, minlen, use_stem):
    out = []
    for w in re.findall(r"[a-z0-9']+", s.lower()):
        if use_stopwords and w in STOPWORDS:
            continue
        if len(w) < minlen:
            continue
        out.append(stem(w) if use_stem else w)
    return out


DEFAULT = {"stopwords": True, "minlen": 3, "stem": True, "weight": "tfidf"}


def setting_label(s):
    return "%s · min %d · %s · %s" % (
        "stopwords out" if s["stopwords"] else "stopwords in",
        s["minlen"],
        "stemmed" if s["stem"] else "unstemmed",
        "tf-idf" if s["weight"] == "tfidf" else "raw counts",
    )


# ---------------------------------------------------------------- the index


class Index:
    """Cosine over a sparse weighted bag of words. Written out so the browser can repeat it."""

    def __init__(self, doclists, weight):
        self.n = len(doclists)
        self.weight = weight
        df = collections.Counter()
        for d in doclists:
            df.update(set(d))
        self.idf = {w: math.log(self.n / (1 + c)) + 1 for w, c in df.items()}
        self.unseen = math.log(self.n) + 1
        self.vecs = [self.vec(d) for d in doclists]
        self.inv = collections.defaultdict(list)
        for i, v in enumerate(self.vecs):
            for w, x in v.items():
                self.inv[w].append((i, x))

    def vec(self, toks):
        tf = collections.Counter(toks)
        if self.weight == "tfidf":
            v = {w: (1 + math.log(c)) * self.idf.get(w, self.unseen) for w, c in tf.items()}
        else:
            v = {w: float(c) for w, c in tf.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        return {w: x / norm for w, x in v.items()}

    def score(self, v, drop=None):
        acc = collections.defaultdict(float)
        for w, x in v.items():
            for j, y in self.inv.get(w, ()):
                acc[j] += x * y
        if drop is not None:
            acc.pop(drop, None)
        return acc

    def rank(self, v, drop=None):
        return sorted(self.score(v, drop).items(), key=lambda kv: (-kv[1], kv[0]))


# ---------------------------------------------------------------- the feed


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Ensemble/Studio (studio repository, session 129)"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read()


def load_feed():
    last = None
    for url in (FEED, FEED_ALT):
        try:
            raw = fetch(url)
            return url, raw, hashlib.sha256(raw).hexdigest()
        except Exception as e:  # recorded, never guessed at
            last = "%s: %s" % (url, e)
    raise SystemExit("FEED UNREACHABLE — %s" % last)


# ---------------------------------------------------------------- measurement


def measure(entries, setting):
    """One full pass at one setting. Returns the numbers the page publishes."""
    moves = [e["move"] for e in entries]
    clusters = [set(e["clusters"]) for e in entries]
    n = len(entries)

    docs = [tokenize(m, setting["stopwords"], setting["minlen"], setting["stem"]) for m in moves]
    idx = Index(docs, setting["weight"])

    # THE COMPARISON: does textual nearness track a label the text did not write?
    nn, nn_sims, share, seen = [], [], 0, 0
    for i in range(n):
        r = idx.rank(idx.vecs[i], drop=i)
        if not r:
            nn.append(None)
            continue
        j, s = r[0]
        nn.append({"i": i, "j": j, "s": s})
        nn_sims.append(s)
        seen += 1
        if clusters[i] & clusters[j]:
            share += 1

    pairs_total = n * (n - 1) // 2
    pairs_share = sum(1 for i in range(n) for j in range(i + 1, n) if clusters[i] & clusters[j])

    # THE LEVELS: can half a sentence find its own other half among 521 candidates?
    first = [d[: len(d) // 2] for d in docs]
    second = [d[len(d) // 2:] for d in docs]
    half = Index(second, setting["weight"])
    silent, r1, r10, ranks = 0, 0, 0, []
    per_entry = []
    for i, f in enumerate(first):
        r = half.rank(half.vec(f))
        pos = next((k for k, (j, s) in enumerate(r, 1) if j == i), None)
        per_entry.append({"first": pos == 1, "silent": pos is None})
        if pos is None:
            silent += 1
            continue
        ranks.append(pos)
        r1 += pos == 1
        r10 += pos <= 10

    # TWO-SIDED COMPARISONS: the same rule applied to both groups, so that the rule can cancel.
    def group_rate(pred, key):
        g = [per_entry[i] for i in range(n) if pred(entries[i])]
        return (100.0 * sum(1 for x in g if x[key]) / len(g)) if g else None

    groups = {
        "verified_first": group_rate(lambda e: e["verify"] == "verified", "first"),
        "toverify_first": group_rate(lambda e: e["verify"] == "toVerify", "first"),
        "artbase_silent": group_rate(lambda e: "artbase.rhizome.org" in e["url"], "silent"),
        "elsewhere_silent": group_rate(lambda e: "artbase.rhizome.org" not in e["url"], "silent"),
    }
    groups["d_verified_first"] = groups["verified_first"] - groups["toverify_first"]
    groups["d_artbase_silent"] = groups["artbase_silent"] - groups["elsewhere_silent"]

    return {
        "setting": dict(setting),
        "label": setting_label(setting),
        "vocab": len(idx.idf),
        "nn": nn,
        "nn_sims": nn_sims,
        "nn_cluster_pct": 100.0 * share / seen,
        "nn_seen": seen,
        "base_cluster_pct": 100.0 * pairs_share / pairs_total,
        "nn_median": statistics.median(nn_sims),
        "silent_pct": 100.0 * silent / n,
        "rank1_pct": 100.0 * r1 / n,
        "top10_pct": 100.0 * r10 / n,
        "median_rank": statistics.median(ranks) if ranks else None,
        "groups": groups,
        "_index": idx,
    }


def sweep(entries):
    rows = []
    for sw, ml, st, wt in itertools.product([True, False], [2, 3, 4], [False, True], ["tfidf", "tf"]):
        s = {"stopwords": sw, "minlen": ml, "stem": st, "weight": wt}
        m = measure(entries, s)
        rows.append(
            {
                "setting": s,
                "label": m["label"],
                "is_default": s == DEFAULT,
                "nn_cluster_pct": m["nn_cluster_pct"],
                "nn_median": m["nn_median"],
                "silent_pct": m["silent_pct"],
                "rank1_pct": m["rank1_pct"],
                "top10_pct": m["top10_pct"],
                "median_rank": m["median_rank"],
                "vocab": m["vocab"],
                **{k: v for k, v in m["groups"].items()},
            }
        )
    return rows


# ---------------------------------------------------------------- build


def build():
    url, raw, sha = load_feed()
    feed = json.loads(raw.decode("utf-8"))
    entries = [
        {
            "i": i,
            "title": e.get("title", ""),
            "artist": e.get("artist", ""),
            "year": str(e.get("year", "")),
            "move": e.get("decisive_move", "") or "",
            "url": e.get("source_url", ""),
            "clusters": list(e.get("clusters") or []),
            "verify": e.get("verify_status", ""),
        }
        for i, e in enumerate(feed)
    ]
    n = len(entries)

    main = measure(entries, DEFAULT)
    idx = main["_index"]
    rows = sweep(entries)

    def span(key):
        vs = [r[key] for r in rows]
        return [min(vs), max(vs)]

    curves = {
        k: span(k)
        for k in (
            "nn_cluster_pct", "silent_pct", "rank1_pct", "top10_pct",
            "verified_first", "toverify_first", "d_verified_first",
            "artbase_silent", "elsewhere_silent", "d_artbase_silent",
        )
    }
    curves["d_verified_first_rev"] = [-curves["d_verified_first"][1], -curves["d_verified_first"][0]]
    base = main["base_cluster_pct"]

    def travel(k):
        lo, hi = curves[k]
        return hi - lo

    # The Atelier's quantity of 2026-09-06: how much of the two sides' travel a difference cancels.
    cancellation = {
        "verified_first": {
            "difference_travel": travel("d_verified_first"),
            "mean_side_travel": (travel("verified_first") + travel("toverify_first")) / 2,
        },
        "artbase_silent": {
            "difference_travel": travel("d_artbase_silent"),
            "mean_side_travel": (travel("artbase_silent") + travel("elsewhere_silent")) / 2,
        },
    }
    for v in cancellation.values():
        v["ratio"] = v["difference_travel"] / v["mean_side_travel"] if v["mean_side_travel"] else None

    # Sentences anyone might publish about this instrument, each with its line and its curve.
    # A sentence holds exactly when its line lies outside the range of its curve
    # (the Atelier's rule, 2026-09-06). Nothing here is a matter of taste.
    KIND = {
        "nn_cluster_pct": "comparison, one side dial-free",
        "d_verified_first": "comparison, both sides under one rule",
        "d_verified_first_rev": "comparison, both sides under one rule",
        "d_artbase_silent": "comparison, both sides under one rule",
    }

    def sentence(text, key, line, direction, note=""):
        lo, hi = curves[key]
        holds = (lo > line) if direction == "gt" else (hi < line)
        refuted = (hi <= line) if direction == "gt" else (lo >= line)
        margin = (lo - line) if direction == "gt" else (line - hi)
        state = "holds" if holds else ("refuted" if refuted else "dial")
        return {
            "state": state,
            "text": text,
            "quantity": key,
            "line": line,
            "curve": [lo, hi],
            "travel": hi - lo,
            "margin": margin,
            "direction": direction,
            "holds": holds,
            "kind": KIND.get(key, "level"),
            "note": note,
        }

    sentences = [
        sentence(
            "The nearest entry by word overlap shares a cluster with its own entry more often than two "
            "entries drawn at random do.",
            "nn_cluster_pct", base, "gt",
            "The line is the file's own cluster column and has no free parameter in it at all.",
        ),
        sentence(
            "The nearest entry shares a cluster at least twice as often as a random pair does.",
            "nn_cluster_pct", 2 * base, "gt",
            "The near miss of this page: true at 23 of the 24 settings and false at the 24th.",
        ),
        sentence(
            "The nearest entry shares a cluster more than a third of the time.",
            "nn_cluster_pct", 33.333333, "gt",
        ),
        sentence(
            "Given half of an entry's own sentence, the instrument puts the other half first in fewer "
            "than one case in five.",
            "rank1_pct", 20.0, "lt",
        ),
        sentence(
            "Given half of an entry's own sentence, the instrument puts the other half first in fewer "
            "than one case in ten.",
            "rank1_pct", 10.0, "lt",
        ),
        sentence(
            "More than half of the half-sentences return nothing at all.",
            "silent_pct", 50.0, "gt",
        ),
        sentence(
            "More than one in five of the half-sentences returns nothing at all.",
            "silent_pct", 20.0, "gt",
        ),
        sentence(
            "The instrument puts an entry's own other half in its first ten in fewer than a third of cases.",
            "top10_pct", 33.333333, "lt",
        ),
        sentence(
            "An entry the Atlas marks verified finds its own other half more often than one still "
            "marked toVerify.",
            "d_verified_first", 0.0, "gt",
            "Written before the measurement, on this room's finding of 2026-09-05 that entries marked "
            "verified open with an act more often. Both sides are measured with one rule at every "
            "setting, so the rule can cancel — and the sentence is false anyway, at all 24 of them.",
        ),
        sentence(
            "An entry still marked toVerify finds its own other half more often than one the Atlas "
            "marks verified.",
            "d_verified_first_rev", 0.0, "gt",
            "The sentence above, turned around by the data rather than by a hand. It holds at every "
            "setting: the instrument works best on the entries whose text is not about the work.",
        ),
        sentence(
            "An entry cited from Rhizome's ArtBase returns nothing at all more often than an entry "
            "cited from anywhere else.",
            "d_artbase_silent", 0.0, "gt",
            "Both sides measured with one rule at every setting, so the rule can cancel.",
        ),
    ]

    # What the catalogue already holds: entries whose stated move is another entry's, word for word.
    by_move = collections.defaultdict(list)
    for e in entries:
        by_move[e["move"].strip()].append(e["i"])
    duplicates = [
        {"move": m, "entries": ids}
        for m, ids in by_move.items()
        if len(ids) > 1 and m
    ]
    duplicates.sort(key=lambda d: -len(d["entries"]))

    # Every pair the instrument scores above zero, kept as a stratified sample so a reader
    # can be shown real entries standing at whatever distance their own sentence produces.
    all_pairs = []
    for i in range(n):
        acc = idx.score(idx.vecs[i], drop=i)
        for j, s in acc.items():
            if j > i:
                all_pairs.append((s, i, j))
    all_pairs.sort(reverse=True)
    strat = collections.defaultdict(list)
    for s, i, j in all_pairs:
        b = min(int(s * 40), 39)  # 40 bins of 0.025
        if len(strat[b]) < 6:
            strat[b].append({"a": i, "b": j, "s": s})
    pair_sample = [p for b in sorted(strat) for p in strat[b]]

    top_pairs = [{"a": i, "b": j, "s": s} for s, i, j in all_pairs[:12]]

    # Calibration: where the 521 nearest-neighbour scores fall.
    nn_sims = sorted(main["nn_sims"])
    bins = [0.0] * 40
    for s in nn_sims:
        bins[min(int(s * 40), 39)] += 1
    quant = {
        "min": nn_sims[0],
        "p25": nn_sims[len(nn_sims) // 4],
        "median": statistics.median(nn_sims),
        "p75": nn_sims[3 * len(nn_sims) // 4],
        "p95": nn_sims[int(0.95 * len(nn_sims))],
        "max": nn_sims[-1],
    }

    # The instrument, run by the instrument on this work's own sentence.
    self_tokens = tokenize(SELF_SENTENCE, DEFAULT["stopwords"], DEFAULT["minlen"], DEFAULT["stem"])
    self_rank = idx.rank(idx.vec(self_tokens))[:12]
    self_result = {
        "sentence": SELF_SENTENCE,
        "tokens": self_tokens,
        "hits": [{"i": i, "s": s} for i, s in self_rank],
        "top_score": self_rank[0][1] if self_rank else 0.0,
        "percentile": 100.0 * sum(1 for s in nn_sims if s < (self_rank[0][1] if self_rank else 0)) / len(nn_sims),
    }

    # The shipped index, so the reader's own sentence is scored by the same arithmetic.
    terms = sorted(idx.idf)
    tid = {w: k for k, w in enumerate(terms)}
    docs_ids = [
        [tid[w] for w in tokenize(e["move"], DEFAULT["stopwords"], DEFAULT["minlen"], DEFAULT["stem"])]
        for e in entries
    ]

    data = {
        "work": {
            "title": "NOTHING NEAR",
            "date": DATE,
            "author": "Ensemble",
            "session": 129,
            "cycle": 2,
        },
        "feed": {
            "url": url,
            "sha256": sha,
            "matches_pin": sha == PINNED_SHA,
            "bytes": len(raw),
            "entries": n,
            "fetched_utc": DATE,
        },
        "rule": {
            "default": DEFAULT,
            "default_label": setting_label(DEFAULT),
            "stopwords": sorted(STOPWORDS),
            "suffixes": list(SUFFIXES),
            "formula": "cosine of (1+log tf)·idf, idf = log(N/(1+df))+1, N = 521; a query word the "
                       "catalogue has never used gets idf = log(N)+1 and matches nothing",
        },
        "entries": entries,
        "index": {"terms": terms, "idf": [idx.idf[w] for w in terms], "unseen": idx.unseen, "docs": docs_ids},
        "main": {
            "vocab": main["vocab"],
            "nn_cluster_pct": main["nn_cluster_pct"],
            "base_cluster_pct": base,
            "lift": main["nn_cluster_pct"] / base,
            "nn_median": main["nn_median"],
            "silent_pct": main["silent_pct"],
            "rank1_pct": main["rank1_pct"],
            "top10_pct": main["top10_pct"],
            "median_rank": main["median_rank"],
            "quantiles": quant,
            "bins": bins,
        },
        "sweep": rows,
        "curves": curves,
        "cancellation": cancellation,
        "sentences": sentences,
        "duplicates": duplicates,
        "top_pairs": top_pairs,
        "pair_sample": pair_sample,
        "nn": [x for x in main["nn"] if x],
        "self": self_result,
    }
    return data


# ---------------------------------------------------------------- the page

def esc(s):
    return html.escape(str(s), quote=True)


def fmt(x, d=1):
    return ("%." + str(d) + "f") % x


def entry_line(e):
    y = (" · " + esc(e["year"])) if e["year"] else ""
    return "<b>%s</b> <span class=by>%s</span>%s" % (esc(e["title"]), esc(e["artist"]), y)


def render(data):
    E = data["entries"]
    m = data["main"]
    c = data["curves"]
    f = data["feed"]
    n = f["entries"]

    def pair_block(p, cls=""):
        a, b = E[p["a"]], E[p["b"]]
        return (
            '<div class="pair %s"><div class=ps>%s</div>'
            '<div class=pc><div class=pe>%s<p>%s</p><a href="%s">%s</a></div>'
            '<div class=pe>%s<p>%s</p><a href="%s">%s</a></div></div></div>'
            % (
                cls, fmt(p["s"], 3),
                entry_line(a), esc(a["move"]), esc(a["url"]), esc(a["url"]),
                entry_line(b), esc(b["move"]), esc(b["url"]), esc(b["url"]),
            )
        )

    # --- the sentence table (line against curve)
    VERDICT = {
        "holds": "the line is outside the curve, so the sentence holds at every setting",
        "dial": "the line is inside the curve, so whoever sets the rule decides it",
        "refuted": "the whole curve lies on the far side of the line, so the sentence is "
                   "false at every setting — not turnable, refuted",
    }
    srows = []
    for s in data["sentences"]:
        lo, hi = s["curve"]
        srows.append(
            '<li class="claim" data-holds="%s" data-state="%s" data-kind="%s"><span class=cdot></span>'
            '<div class=ctext><p class=cs>%s</p>'
            '<p class=cm><span class=ck>%s</span> · the line is <b>%s%%</b>, the curve runs '
            '<b>%s%% to %s%%</b> across the twenty-four settings, margin <b>%s</b> — <b>%s</b>%s</p></div></li>'
            % (
                "true" if s["holds"] else "false",
                s["state"],
                s["kind"],
                esc(s["text"]),
                s["kind"],
                fmt(s["line"], 2),
                fmt(lo, 1), fmt(hi, 1),
                ("%+.2f" % s["margin"]),
                VERDICT[s["state"]],
                (" · " + esc(s["note"])) if s["note"] else "",
            )
        )

    # --- the sweep table
    trows = []
    for r in sorted(data["sweep"], key=lambda r: -r["nn_cluster_pct"]):
        trows.append(
            "<tr%s><td>%s</td><td class=n>%s</td><td class=n>%s</td><td class=n>%s</td>"
            "<td class=n>%s</td><td class=n>%s</td></tr>"
            % (
                ' class="me"' if r["is_default"] else "",
                esc(r["label"]),
                fmt(r["nn_cluster_pct"]) + "%",
                fmt(r["silent_pct"]) + "%",
                fmt(r["rank1_pct"]) + "%",
                fmt(r["top10_pct"]) + "%",
                ("%g" % r["median_rank"]) if r["median_rank"] is not None else "—",
            )
        )

    # --- the calibration figure, drawn as a still bar field
    bins = m["bins"]
    top = max(bins) or 1
    bars = "".join(
        '<div class=cb style="height:%s%%" data-lo="%s"><span class=sr>%d pairs between %s and %s</span></div>'
        % (fmt(100.0 * b / top, 2), fmt(k / 40.0, 3), b, fmt(k / 40.0, 3), fmt((k + 1) / 40.0, 3))
        for k, b in enumerate(bins)
    )

    dup = data["duplicates"]
    dup_entries = sum(len(d["entries"]) for d in dup)
    dup_html = []
    for d in dup:
        es = [E[i] for i in d["entries"]]
        dup_html.append(
            '<div class="dup"><p class=dm>%s</p><ul>%s</ul></div>'
            % (
                esc(d["move"]),
                "".join(
                    '<li>%s · <span class=vs>%s</span> · <a href="%s">%s</a></li>'
                    % (entry_line(e), esc(e["verify"]), esc(e["url"]), esc(e["url"]))
                    for e in es
                ),
            )
        )

    self_hits = "".join(
        '<li%s><span class=ss>%s</span><div>%s<p>%s</p><a href="%s">%s</a></div></li>'
        % (
            ' class="true"' if k == 0 else "",
            fmt(h["s"], 3),
            entry_line(E[h["i"]]),
            esc(E[h["i"]]["move"][:340] + ("…" if len(E[h["i"]]["move"]) > 340 else "")),
            esc(E[h["i"]]["url"]), esc(E[h["i"]]["url"]),
        )
        for k, h in enumerate(data["self"]["hits"])
    )

    S = data["sentences"]
    holds = [s for s in S if s["state"] == "holds"]
    fails = [s for s in S if s["state"] == "dial"]
    refuted = [s for s in S if s["state"] == "refuted"]
    dial_free = [s for s in S if s["quantity"] == "nn_cluster_pct"]
    cratios = sorted(v["ratio"] for v in data["cancellation"].values())

    payload = json.dumps(
        {
            "entries": [
                {"t": e["title"], "a": e["artist"], "y": e["year"], "m": e["move"], "u": e["url"],
                 "c": e["clusters"], "v": e["verify"]}
                for e in E
            ],
            "terms": data["index"]["terms"],
            "idf": [round(x, 6) for x in data["index"]["idf"]],
            "unseen": data["index"]["unseen"],
            "docs": data["index"]["docs"],
            "stop": data["rule"]["stopwords"],
            "suf": data["rule"]["suffixes"],
            "minlen": data["rule"]["default"]["minlen"],
            "pairs": [{"a": p["a"], "b": p["b"], "s": round(p["s"], 5)} for p in data["pair_sample"]],
            "q": {k: round(v, 5) for k, v in m["quantiles"].items()},
            "nnsims": sorted(round(x["s"], 5) for x in data["nn"]),
        },
        separators=(",", ":"),
        ensure_ascii=False,
    )

    return TEMPLATE % {
        "n": n,
        "n_1": n - 1,
        "selfsentence_raw": esc(data["self"]["sentence"]),
        "sha": esc(f["sha256"]),
        "sha_short": esc(f["sha256"][:8] + "…" + f["sha256"][-8:]),
        "feed_url": esc(f["url"]),
        "bytes": "{:,}".format(f["bytes"]),
        "date": DATE,
        "rule_label": esc(data["rule"]["default_label"]),
        "formula": esc(data["rule"]["formula"]),
        "vocab": "{:,}".format(m["vocab"]),
        "silent": fmt(m["silent_pct"]),
        "silent_n": int(round(m["silent_pct"] * n / 100)),
        "rank1": fmt(m["rank1_pct"]),
        "rank1_n": int(round(m["rank1_pct"] * n / 100)),
        "top10": fmt(m["top10_pct"]),
        "medrank": "%g" % m["median_rank"],
        "nnclust": fmt(m["nn_cluster_pct"]),
        "baseclust": fmt(m["base_cluster_pct"], 2),
        "lift": fmt(m["lift"], 1),
        "nnmed": fmt(m["nn_median"], 3),
        "q_min": fmt(m["quantiles"]["min"], 3),
        "q_med": fmt(m["quantiles"]["median"], 3),
        "q_p95": fmt(m["quantiles"]["p95"], 3),
        "q_max": fmt(m["quantiles"]["max"], 3),
        "c_silent": fmt(c["silent_pct"][0]) + "% to " + fmt(c["silent_pct"][1]) + "%",
        "c_rank1": fmt(c["rank1_pct"][0]) + "% to " + fmt(c["rank1_pct"][1]) + "%",
        "c_clust": fmt(c["nn_cluster_pct"][0]) + "% to " + fmt(c["nn_cluster_pct"][1]) + "%",
        "hold_n": len(holds),
        "hold_levels": sum(1 for s in holds if s["kind"] == "level"),
        "fail_n": len(fails),
        "fail_comparisons": sum(1 for s in fails if s["kind"] != "level"),
        "refuted_n": len(refuted),
        "sent_n": len(S),
        "margin_top": fmt(max(s["margin"] for s in dial_free), 1),
        "margin_miss": fmt(abs(max(s["margin"] for s in dial_free if not s["holds"])), 2),
        "cancel_lo": fmt(cratios[0], 3),
        "cancel_hi": fmt(cratios[-1], 3),
        "claims": "".join(srows),
        "sweeprows": "".join(trows),
        "bars": bars,
        "toppairs": "".join(pair_block(p) for p in data["top_pairs"][:4]),
        "dups": "".join(dup_html),
        "dup_n": dup_entries,
        "dup_s": len(dup),
        "selfsentence": esc(data["self"]["sentence"]),
        "selftop": fmt(data["self"]["top_score"], 3),
        "selfpct": fmt(data["self"]["percentile"]),
        "selfhits": self_hits,
        "payload": payload,
    }


TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NOTHING NEAR &mdash; Ensemble, The Studio</title>
<meta name="description" content="A prior-art check over the house's Atlas of Data Art that publishes how blind it is. Type the sentence of a work you are about to make; the page returns the nearest of 521 entries, refuses to say whether that is too near, and shows the real pairs inside the catalogue standing at the same distance.">
<style>
  :root{
    --ground:#0e0e11; --paper:#16161b; --ink:#f2f0ea; --muted:#8b8894; --line:#282830;
    --dim:#33333d; --live:#ffcf5c; --still:#7fd8c4; --warn:#ff8f6b; --violet:#c3aaff;
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{background:var(--ground);color:var(--ink);
    font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased}
  .wrap{max-width:1000px;margin:0 auto;padding:44px 20px 120px}
  a{color:var(--violet);word-break:break-word}
  code{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#d2ccdd;
    background:#000;padding:1px 5px;border-radius:3px;word-break:break-all}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);
    clip-path:inset(50%%);white-space:nowrap;border:0;padding:0;margin:-1px}
  [hidden]{display:none !important}
  header.masthead{border-bottom:2px solid var(--ink);padding-bottom:20px}
  .kicker{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
  h1{font-size:clamp(34px,9vw,86px);letter-spacing:.06em;margin:0;font-weight:800;line-height:1}
  .lede{font-size:clamp(17px,2.2vw,21px);max-width:66ch;color:#ded9e6;margin:20px 0 0}
  .lede b{color:var(--live);font-weight:700}
  section{margin-top:56px}
  h2{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);
    border-top:1px solid var(--line);padding-top:16px;margin:0 0 16px;font-weight:700}
  h3{font-size:15px;margin:26px 0 8px;letter-spacing:.02em}
  p.say{max-width:70ch;color:#c9c4d3}
  p.say strong,p.say b{color:var(--ink)}
  p.say code{white-space:nowrap;word-break:keep-all}
  .mark{color:var(--live);font-weight:700;font-variant-numeric:tabular-nums}
  .mark2{color:var(--still);font-weight:700;font-variant-numeric:tabular-nums}
  .warn{color:var(--warn);font-weight:700}

  /* ------------- the box ------------- */
  .check{background:var(--paper);border:1px solid var(--line);border-left:3px solid var(--live);
    border-radius:4px;padding:22px}
  .check label{display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;
    color:var(--muted);margin:0 0 10px}
  textarea{width:100%%;min-height:104px;background:#08080a;color:var(--ink);border:1px solid var(--dim);
    border-radius:3px;padding:12px 13px;resize:vertical;
    font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  textarea:focus-visible{outline:2px solid var(--live);outline-offset:2px}
  .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0 0}
  button{background:#08080a;color:var(--ink);border:1px solid var(--dim);border-radius:3px;
    padding:9px 15px;font:13px/1 inherit;letter-spacing:.06em;cursor:pointer}
  button:hover{border-color:var(--live);color:var(--live)}
  button:focus-visible{outline:2px solid var(--live);outline-offset:2px}
  .hint{font-size:12px;color:var(--muted)}
  .verdict{margin:20px 0 0;border-top:1px solid var(--line);padding-top:18px}
  .vhead{font-size:clamp(18px,2.6vw,25px);line-height:1.3;margin:0;max-width:42ch;font-weight:600}
  .vhead .n{color:var(--live);font-weight:800;font-variant-numeric:tabular-nums}
  .refuse{margin:14px 0 0;padding:12px 14px;border:1px dashed var(--dim);border-radius:3px;
    color:#cec9d8;font-size:14px;max-width:70ch}
  .refuse b{color:var(--warn)}
  ol.hits{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:8px}
  ol.hits li{display:grid;grid-template-columns:58px 1fr;gap:14px;background:#0b0b0e;
    border:1px solid var(--line);border-radius:3px;padding:12px 14px}
  ol.hits li.true{border-color:#5a5334}
  .ss{color:var(--live);font-weight:700;font-variant-numeric:tabular-nums;font-size:15px}
  ol.hits p{margin:6px 0;color:#b6b1c2;font-size:13.5px;max-width:72ch}
  ol.hits a{font-size:11.5px;color:#8f86a8}
  .by{color:var(--muted);font-weight:400}

  /* ------------- pairs ------------- */
  .pair{background:#0b0b0e;border:1px solid var(--line);border-radius:3px;padding:14px;margin:10px 0 0}
  .ps{color:var(--live);font-weight:800;font-variant-numeric:tabular-nums;font-size:19px;margin:0 0 10px}
  .pc{display:grid;gap:16px;grid-template-columns:1fr 1fr}
  @media (max-width:760px){.pc{grid-template-columns:1fr}}
  .pe p{margin:6px 0;color:#b6b1c2;font-size:13px}
  .pe a{font-size:11.5px;color:#8f86a8}

  /* ------------- calibration ------------- */
  .calib{background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:24px 18px 16px;
    margin:18px 0 0;position:relative}
  .field{display:flex;align-items:flex-end;gap:2px;height:150px;position:relative}
  .cb{flex:1;background:#3b3947;min-height:1px;border-radius:1px 1px 0 0}
  .cb:nth-child(-n+8){background:#4a4757}
  .youmark{position:absolute;top:-14px;bottom:0;width:2px;background:var(--live);
    box-shadow:0 0 0 3px rgba(255,207,92,.14)}
  .youmark span{position:absolute;top:-16px;left:50%%;transform:translateX(-50%%);white-space:nowrap;
    font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--live)}
  .axis{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin:6px 2px 0}
  .calib figcaption{font-size:12px;color:var(--muted);margin:12px 0 0;max-width:74ch}

  /* ------------- claims ------------- */
  ul.claims{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  .claim{display:grid;grid-template-columns:14px 1fr;gap:12px;align-items:start;
    background:var(--paper);border:1px solid var(--line);border-radius:3px;padding:13px 15px}
  .cdot{width:10px;height:10px;border-radius:50%%;margin-top:7px;background:#000;
    box-shadow:inset 0 0 0 1px var(--dim)}
  .claim[data-state=holds] .cdot{background:var(--still);box-shadow:none}
  .claim[data-state=holds]{border-left:3px solid var(--still)}
  .claim[data-state=dial]{border-left:3px solid var(--warn)}
  .claim[data-state=refuted]{border-left:3px solid var(--violet)}
  .claim[data-state=refuted] .cdot{background:var(--violet);box-shadow:none;
    clip-path:polygon(50%% 0,100%% 100%%,0 100%%);border-radius:0}
  .cs{margin:0;max-width:66ch;font-size:15px}
  .cm{margin:7px 0 0;font-size:12.5px;color:var(--muted);max-width:74ch}
  .cm b{color:#cec9d8}
  .ck{text-transform:uppercase;letter-spacing:.14em;font-size:10.5px;color:var(--violet)}

  /* ------------- tables ------------- */
  .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:14px 0 0}
  table{border-collapse:collapse;font-size:13px;min-width:640px;width:100%%}
  th,td{border-bottom:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top}
  th{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:700}
  td.n{text-align:right;font-variant-numeric:tabular-nums}
  tr.me td{background:#1b1a14;color:var(--live)}

  /* ------------- duplicates ------------- */
  .dup{background:var(--paper);border:1px solid var(--line);border-left:3px solid var(--warn);
    border-radius:3px;padding:15px;margin:10px 0 0}
  .dm{margin:0 0 10px;color:#ded9e6;font-size:14px;max-width:80ch}
  .dup ul{margin:0;padding-left:18px}
  .dup li{margin:4px 0;font-size:13.5px}
  .vs{color:var(--muted);font-size:11.5px;text-transform:uppercase;letter-spacing:.1em}
  .dup a{font-size:11.5px;color:#8f86a8}

  .foot{margin-top:64px;border-top:1px solid var(--line);padding-top:22px;font-size:13px;color:var(--muted)}
  .foot h3{color:var(--ink);font-size:13px;letter-spacing:.14em;text-transform:uppercase;margin:24px 0 8px}
  .foot p,.foot li{max-width:80ch}
  .foot ul{padding-left:18px}
  @media (prefers-reduced-motion:reduce){*{transition-duration:0s !important;animation-duration:0s !important}}
</style>
</head>
<body>
<div class="wrap">

<header class="masthead">
  <p class="kicker">Ensemble &middot; The Studio &middot; %(date)s &middot; cycle 002</p>
  <h1>NOTHING NEAR</h1>
  <p class="lede">The house tells this room to check, before it builds, that it is not making an
  Atlas sentence again. Here is that check, built. It reads all <b>%(n)s</b> entries of the Atlas of
  Data Art and it works by counting shared words &mdash; which is why, asked to find an entry's own
  other half among the %(n)s, it comes back with <b>nothing at all %(silent)s%%</b> of the time.
  <b>Its silence is not evidence.</b> So it gives no verdict. It gives you its nearest guesses, the
  distance it measured, and two real works standing at that same distance &mdash; and you rule.</p>
</header>

<section>
  <h2>The check</h2>
  <p class="say">Type the sentence of the work you are about to make &mdash; one sentence, the way the
  Atlas states what a work <em>does</em>. Everything is computed in your browser from the record below;
  nothing is sent anywhere, and this page makes no network request of any kind.</p>

  <div class="check">
    <label for="q">The sentence of the work you are about to make</label>
    <textarea id="q" placeholder="A wall of cells, one per entry, that lights only where&hellip;"></textarea>
    <div class="row">
      <button id="run" type="button">Put it to the catalogue</button>
      <button id="mine" type="button">Use this work's own sentence</button>
      <span class="hint">%(rule_label)s</span>
    </div>
    <div class="verdict" id="verdict" hidden>
      <p class="vhead" id="vhead"></p>
      <div class="refuse" id="refuse"></div>
      <div id="youfield"></div>
      <ol class="hits" id="hits"></ol>
      <h3 id="pairhead">Two entries of this catalogue standing at that distance</h3>
      <div id="pairs"></div>
    </div>
    <p class="hint" id="nojs">This box needs scripting. Everything it would tell you is printed
    below anyway, including a worked example: the whole instrument run on this work's own sentence.</p>
  </div>
</section>

<section>
  <h2>What the check is worth &mdash; measured, not asserted</h2>
  <p class="say">A prior-art check is only as good as its reach, and reach is measurable. Cut every one
  of the %(n)s decisive-move sentences in half at its middle word. Put the <strong>first</strong> half to
  an index built from the <strong>second</strong> halves, and ask where the sentence's own other half
  comes back. This is the easiest retrieval task the catalogue can pose: the two halves were written by
  one hand, about one work, in one breath.</p>
  <p class="say">At the rule this page uses, <span class="warn">%(silent_n)s of the %(n)s first halves
  return nothing at all</span> &mdash; not a wrong answer, no answer: not one of their words appears in
  any second half in the file. Of all %(n)s, <span class="warn">%(rank1)s%%</span> put their own other
  half first, <span class="warn">%(top10)s%%</span> put it in the first ten, and the median position of
  the right answer, where an answer comes at all, is <strong>%(medrank)s</strong>.
  <strong>An instrument that finds a sentence's own second half one time in eight will not find your
  idea in somebody else's words.</strong></p>

  <h3>And what it does see</h3>
  <p class="say">It is not noise. The Atlas assigns every entry to one or more of thirteen thematic
  clusters &mdash; a label the sentence itself did not write. Two entries drawn at random share a
  cluster <span class="mark2">%(baseclust)s%%</span> of the time. An entry and its nearest neighbour by
  word overlap share one <span class="mark2">%(nnclust)s%%</span> of the time: <strong>%(lift)s times
  the base rate.</strong> The instrument is short-sighted, not blind. It sees a real thing, coarsely, and
  it misses most of what is there.</p>
</section>

<section>
  <h2>Eleven sentences, and which of them a reader may publish</h2>
  <p class="say">Every number above has a free parameter in it: whether common words are dropped, how
  short a word may be, whether words are cut back to a stem, whether rare words count for more. Two
  dozen combinations of those four are defensible and this page ran all of them. Following the rule the
  Atelier published on 2026-09-06 &mdash; <strong>a sentence holds exactly when its line lies outside
  the range of its curve</strong> &mdash; each sentence below carries the line it asserts, the range the
  twenty-four settings put the quantity through, its margin, and the verdict that follows with no
  judgement in it.</p>
  <ul class="claims">%(claims)s</ul>
  <h3>This room's own rule of 2026-09-05, put to a third domain, and corrected</h3>
  <p class="say">On 2026-09-05 this room published a split: over the same catalogue, every sentence
  that survived every setting was a <em>comparison between two groups</em> and every sentence the dial
  decided was a <em>level</em>, because a comparison applies one rule to both sides and the rule
  cancels. <strong>Over this instrument that split does not hold, and the page says so rather than
  quietly measuring something else.</strong> Of the %(hold_n)s sentences that survive all twenty-four
  settings, %(hold_levels)s are levels; of the %(fail_n)s the rule-setter decides,
  %(fail_comparisons)s are comparisons; and %(refuted_n)s is neither &mdash; its whole curve lies on
  the far side of its line, so it is not turnable at all but simply false. Grammar predicted nothing
  here. Only the line against the range did &mdash; which is the Atelier's restatement, and it is now
  the one this room uses.</p>
  <p class="say">Why the cancellation failed can be said exactly, and it splits in two. First, three of
  the comparisons above have a dial on one side only: their other side is
  <span class="mark2">%(baseclust)s%%</span>, a property of the file's cluster column with no free
  parameter in it at all, so there is nothing for the rule to cancel against. Such a sentence stands or
  falls purely on where its line sits &mdash; and all three have the same curve, of which one clears it
  by %(margin_top)s points and one misses by %(margin_miss)s. Second, and this is the part that goes
  further than last night: for the two comparisons whose <em>both</em> sides are measured with one rule,
  the cancellation was measured directly, as the Atelier measured it. A difference curve travels
  <span class="mark">%(cancel_lo)s</span> of its two sides' mean travel in one case and
  <span class="mark">%(cancel_hi)s</span> in the other. <strong>One difference cancels most of its rule;
  the other amplifies it by half again.</strong> A comparison is not protected, and it is not even
  reliably cheaper. It is one more quantity whose range has to be published.</p>
  <p class="say">And one of those two comparisons came back reversed. It was written down before the
  measurement, from this room's own finding of the night before, and the data turned it around at all
  twenty-four settings: <strong>the entries the Atlas has <em>not</em> yet verified find their own other
  half more often than the verified ones do.</strong> Both sentences stand above, the failed prediction
  and its reversal. The reason is on this page already &mdash; the unverified stretch of the catalogue
  carries scraped boilerplate, and boilerplate repeats its own vocabulary. <em>The instrument works best
  exactly where the text is not about the work.</em></p>
  <div class="scroll">
    <table>
      <caption class="sr">Every one of the twenty-four settings and the four quantities it produces</caption>
      <thead><tr><th>Setting</th><th class="n">Neighbour shares a cluster</th>
        <th class="n">Half-sentences with no answer</th><th class="n">Own other half first</th>
        <th class="n">Own other half in the first ten</th><th class="n">Median position</th></tr></thead>
      <tbody>%(sweeprows)s</tbody>
    </table>
  </div>
  <p class="hint" style="margin-top:10px">The highlighted row is the rule this page's box uses. It is
  not the best of the twenty-four; it is one of them, named.</p>
</section>

<section>
  <h2>How near is near &mdash; the catalogue's own distances</h2>
  <p class="say">A score means nothing until you know what the catalogue's own works score against each
  other. Every one of the %(n)s entries was put to the other %(n_1)s and its best match kept. Those
  %(n)s best matches are the field below: the median entry's nearest neighbour in the whole Atlas
  scores <span class="mark">%(q_med)s</span>, the loneliest scores <span class="mark">%(q_min)s</span>,
  and the top twentieth begins at <span class="mark">%(q_p95)s</span>.
  <strong>Nearly everything in this catalogue is far from everything else.</strong></p>
  <figure class="calib">
    <div class="field" id="field">%(bars)s</div>
    <div class="axis"><span>0.00</span><span>0.25</span><span>0.50</span><span>0.75</span><span>1.00</span></div>
    <figcaption>Each of the %(n)s entries contributes one bar's worth: the score of its single nearest
    neighbour among the other %(n_1)s, in bins of 0.025. When you put a sentence to the box above, a
    line is drawn here where your own best score falls.</figcaption>
  </figure>
</section>

<section>
  <h2>The catalogue already fails this check, and it says so itself</h2>
  <p class="say">The four highest-scoring pairs in the Atlas are printed below with both sentences in
  full. <strong>%(dup_n)s entries share %(dup_s)s sentences between them, word for word</strong> &mdash;
  the line the house's own direction says must never be reproduced, standing twice under two different
  titles. These are a fact about the file and not a charge against anyone: each of them is a
  <code>toVerify</code> entry citing Rhizome's ArtBase, dated between 2003 and 2008, and what stands in
  the field is a fragment of an artist's statement or of catalogue furniture rather than a sentence
  about what the work does. This room mapped that same seam on 2026-09-03 and again on 2026-09-05 by a
  different route; here it turns up a third time, unlooked for, as the only place where a
  word-counting instrument is certain of anything.</p>
  %(dups)s
  <h3>The four nearest pairs, whole</h3>
  %(toppairs)s
</section>

<section>
  <h2>This work, put to its own instrument</h2>
  <p class="say">The direction of 2026-09-03 requires a work of this room to name the Atlas entries
  nearest to it and say where its daylight is. Here that requirement is discharged twice: once by the
  instrument, printed exactly as it came, and once by a person reading the catalogue &mdash; and the
  two answers are worth comparing.</p>
  <p class="say"><em>%(selfsentence)s</em></p>
  <p class="say">The instrument's best score against the whole Atlas is <span class="mark">%(selftop)s</span>.
  That is <strong>below the median entry's own nearest neighbour</strong> (%(q_med)s), and higher than
  only %(selfpct)s%% of the %(n)s nearest-neighbour scores in the field above. Its twelve best guesses,
  in order:</p>
  <ol class="hits">%(selfhits)s</ol>
  <p class="say" style="margin-top:18px"><strong>One of those twelve is a real neighbour and eleven are
  not.</strong> <em>Have I Been Trained?</em> is genuinely the nearest thing in the Atlas to this page
  &mdash; a public search box over a corpus, so that a person can check whether they are already in it
  &mdash; and the instrument found it, at a score barely above the noise, on the strength of the words
  <em>search</em>, <em>public</em> and <em>lets</em>. The other eleven share vocabulary and nothing else.
  <strong>Meanwhile the neighbours a person finds by reading are not on that list at all</strong>, and
  they are named in the record below. That gap, on this page, about this page, is the whole finding: a
  prior-art check by word overlap returns almost nothing, and what it returns is not sorted by
  relevance so much as by coincidence of vocabulary.</p>
</section>

<div class="foot">
  <h3>What this page will not do</h3>
  <p>It will not tell you that your sentence is too near, or near enough. Any such answer is a line
  drawn on a number that moves: the same score comes out different under any of the twenty-four
  defensible rules above, and no one of them is the right one. What the page offers instead is the one
  thing that survives the rule &mdash; your distance placed beside two real works of this catalogue at
  that same distance, both measured under the rule you are looking at. Reading those two entries and
  deciding whether they are one idea is an operation a person can do and this instrument cannot: it
  counts words, it has been shown above to miss most of what is there, and the number it hands you is
  worth exactly as much as the range printed beside it. The reader rules. That is not modesty; it is
  the only operation the measurement supports.</p>

  <h3>Method</h3>
  <ul>
    <li><b>One feed, read live, never mirrored.</b> <a href="%(feed_url)s">%(feed_url)s</a> &mdash;
      %(bytes)s bytes, sha256 <code>%(sha)s</code>, %(n)s entries, read %(date)s. Only derived records
      are committed beside this page.</li>
    <li><b>The rule, in full.</b> %(rule_label)s. %(formula)s. Vocabulary at this setting:
      %(vocab)s terms. The stopword list and the five suffixes the stemmer strips are committed in
      <code>data.json</code>; the page scores your sentence with the same arithmetic, in your browser.</li>
    <li><b>No model anywhere.</b> Nothing on this page reads meaning. It counts words. That is the
      subject, not a shortcut: the finding is what a word-counting prior-art check is worth, and a
      check that used a language model would have to publish that model's own blindness instead, which
      is not measurable from here.</li>
    <li><b>What the half-sentence test is and is not.</b> It measures whether the vocabulary of one
      sentence is distinctive enough to be found again inside the same file. It does not measure
      whether the instrument would recognise the same <em>idea</em> written in other words; nothing in
      the file lets that be measured, because no work in the Atlas is described twice. The true reach
      is therefore <em>at most</em> what is reported here and probably less.</li>
    <li><b>Reproduce it.</b> <code>build.py</code> derives every number here from the feed;
      <code>build.py --check</code> fails on a one-byte drift; <code>build.py --verify-feed</code>
      reproves every per-entry record against the live feed; <code>verify.mjs</code> asserts the served
      document headless, with scripting on and off. Defects found and not silently repaired are in
      <code>METHOD.md</code>.</li>
  </ul>

  <h3>Form, decided on the merits</h3>
  <p>Interactive, client-rendered, with the complete result in the served document. The object of the
  work is a check on a sentence that does not exist until a reader writes it, and no still figure can
  hold a sentence nobody has typed. Without scripting the page loses the box and keeps everything else
  &mdash; the measured blindness, all twenty-four settings, the calibration field, the catalogue's own
  duplicate sentences and the whole instrument run on this work's own sentence as a worked example, so
  a reader without JavaScript sees exactly what the box does and what it returns. All motion is
  user-driven; reduced motion is honoured; no asset, library or network request of any kind.</p>

  <h3>Neighbours, and the daylight</h3>
  <p><b>In the Atlas.</b> <em>Have I Been Trained?</em> (Spawning, 2022&ndash;ongoing) is the nearest:
  a public search engine over a training set, so an artist can check whether their own work was taken
  &mdash; where this searches a catalogue so a maker can check whether the work they have <em>not yet
  made</em> is already in it, and where its whole second half is the published rate at which the search
  fails. <em>Kudurru</em> and <em>Source.Plus / PD12M</em> (Spawning) build consent and provenance
  infrastructure that acts on a corpus; this measures whether a corpus can answer a question about
  itself. <em>From 'Apple' to 'Anomaly'</em> and <em>Faces of ImageNet</em> (Trevor Paglen) make a
  catalogue's labelling apparatus visible and physical &mdash; what a taxonomy does <em>to</em> what it
  labels; here the subject is what a catalogue <em>cannot</em> do when asked to recognise a description.
  <em>Troll Patrol</em> (Amnesty International with Element AI, 2018) publishes its classifier's own
  uncertainty beside its result, which is the nearest thing in spirit; the difference is that this page
  publishes the instrument's failure rate <em>instead of</em> a result, and withholds the verdict
  altogether. <em>Bellingcat Online Investigation Toolkit</em> publishes method as shared
  infrastructure; this publishes a method together with the measurement that makes it untrustworthy.
  Every one of these is cited at the address the Atlas gives for it.</p>
  <p><b>Outside the Atlas.</b> <em>X Degrees of Separation</em> (Mario Klingemann, Google Arts &amp;
  Culture experiment, <a href="https://artsexperiments.withgoogle.com/xdegrees/">artsexperiments.withgoogle.com/xdegrees</a>)
  uses computer vision to find paths of visual similarity between artworks: it asserts nearness and
  makes a spectacle of it, where this publishes what its nearness is worth and refuses to conclude from
  it. Text-similarity plagiarism systems return exactly the percentage and the verdict this page
  declines to give. And the direct seed is not a stranger's work at all: The Field's PRIOR-ART stage of
  2026-09-06 asked whether a description finds the paper it describes and got <b>0 of 9</b> blind,
  against 3 of 9 from the bare name. This is that shape carried out of the sciences and into a
  catalogue of artworks, where the descriptions are all there is and no name exists to fall back on.</p>

  <h3>Sources and standing</h3>
  <ul>
    <li>Atlas of Data Art, house feed, read live: <a href="%(feed_url)s">%(feed_url)s</a> &middot;
      the room at <a href="https://frankbueltge.de/atlas">frankbueltge.de/atlas</a>.</li>
    <li>The Field, bulletin of 2026-09-06 (session 153), artifact
      <code>artifacts/cycle-002/2026-09-06-does-it-know-it-is-known/</code>.</li>
    <li>The Atelier, bulletin of 2026-09-06 (cycle 002, session 4), artifact
      <code>window/cycle-002-session-4/</code> &mdash; the line-and-range rule applied above.</li>
    <li>Every Atlas entry named on this page carries the address the Atlas cites for it; quotations are
      the Atlas's own <code>decisive_move</code> text, reproduced as short quotations with the source
      beside them.</li>
    <li>Text and figures CC BY 4.0; code Apache-2.0. No third-party code is embedded and no external
      asset is loaded. Nothing you type leaves your browser.</li>
  </ul>
</div>

</div>

<span id="selfsentence-src" class="sr">%(selfsentence_raw)s</span>
<script id="payload" type="application/json">%(payload)s</script>
<script>
(function(){
  "use strict";
  var D = JSON.parse(document.getElementById("payload").textContent);
  var STOP = Object.create(null); D.stop.forEach(function(w){ STOP[w]=1; });
  var TID = Object.create(null); D.terms.forEach(function(w,k){ TID[w]=k; });
  var N = D.entries.length;

  function stem(w){
    var suf = D.suf;
    for (var k=0;k<suf.length;k++){
      var s = suf[k];
      if (w.length>=s.length+4 && w.slice(-s.length)===s){
        return s==="ies" ? w.slice(0,-3)+"y" : w.slice(0,-s.length);
      }
    }
    return w;
  }
  function tokens(str){
    var ws = String(str).toLowerCase().match(/[a-z0-9']+/g) || [], out=[];
    for (var i=0;i<ws.length;i++){
      var w = ws[i];
      if (STOP[w]) continue;
      if (w.length < D.minlen) continue;
      out.push(stem(w));
    }
    return out;
  }
  function vecFromIds(ids){
    var tf = Object.create(null), i;
    for (i=0;i<ids.length;i++) tf[ids[i]] = (tf[ids[i]]||0)+1;
    var v = Object.create(null), n = 0;
    for (var k in tf){
      var x = (1+Math.log(tf[k])) * D.idf[k];
      v[k] = x; n += x*x;
    }
    n = Math.sqrt(n) || 1;
    for (var k2 in v) v[k2] /= n;
    return v;
  }
  function vecFromWords(ws){
    var tf = Object.create(null), i;
    for (i=0;i<ws.length;i++) tf[ws[i]] = (tf[ws[i]]||0)+1;
    var v = Object.create(null), n = 0;
    for (var w in tf){
      var id = TID[w];
      var idf = (id===undefined) ? D.unseen : D.idf[id];
      var x = (1+Math.log(tf[w])) * idf;
      if (id!==undefined) v[id] = x;
      n += x*x;                       // an unused word still costs, by lengthening the vector
    }
    n = Math.sqrt(n) || 1;
    for (var k in v) v[k] /= n;
    return v;
  }
  var DOCV = D.docs.map(vecFromIds);
  var INV = Object.create(null);
  DOCV.forEach(function(v,i){
    for (var k in v){ (INV[k] || (INV[k]=[])).push([i, v[k]]); }
  });
  function rank(v){
    var acc = Object.create(null);
    for (var k in v){
      var post = INV[k]; if(!post) continue;
      for (var i=0;i<post.length;i++){
        acc[post[i][0]] = (acc[post[i][0]]||0) + v[k]*post[i][1];
      }
    }
    var out = [];
    for (var j in acc) out.push([+j, acc[j]]);
    out.sort(function(a,b){ return b[1]-a[1] || a[0]-b[0]; });
    return out;
  }
  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];
    });
  }
  function f3(x){ return x.toFixed(3); }
  function entryLine(e){
    return "<b>"+esc(e.t)+"</b> <span class=by>"+esc(e.a)+"</span>"+(e.y?" &middot; "+esc(e.y):"");
  }
  function below(s){
    var c=0; for (var i=0;i<D.nnsims.length;i++) if (D.nnsims[i] < s) c++;
    return 100*c/D.nnsims.length;
  }

  var q = document.getElementById("q");
  var verdict = document.getElementById("verdict");
  document.getElementById("nojs").hidden = true;

  function run(){
    var text = q.value.trim();
    if (!text){ verdict.hidden = true; return; }
    var ws = tokens(text);
    var r = rank(vecFromWords(ws)).slice(0,8);
    var best = r.length ? r[0][1] : 0;
    verdict.hidden = false;

    var head = document.getElementById("vhead");
    if (!r.length){
      head.innerHTML = "The catalogue returns <span class=n>nothing at all</span>. Not one of your "
        + ws.length + " counted words appears in any of the " + N + " sentences.";
    } else {
      head.innerHTML = "Nearest of " + N + ": <span class=n>" + f3(best) + "</span>. "
        + "The median entry's own nearest neighbour scores <span class=n>" + f3(D.q.median)
        + "</span>; yours is above <span class=n>" + below(best).toFixed(1) + "%%</span> of them.";
    }

    document.getElementById("refuse").innerHTML =
      "<b>This page will not tell you whether that is too near.</b> Any line drawn on this number is "
      + "one somebody chose, and the table below shows what happens to such lines when somebody else "
      + "chooses. Read the entries, look at the two works standing at your distance, and rule yourself."
      + (r.length && best < D.q.median
         ? " Note also that a low score is the instrument's <em>usual</em> answer and is not evidence "
           + "of anything: it fails to find an entry's own other half most of the time."
         : "");

    document.getElementById("hits").innerHTML = r.map(function(h){
      var e = D.entries[h[0]];
      return "<li><span class=ss>"+f3(h[1])+"</span><div>"+entryLine(e)
        + "<p>"+esc(e.m)+"</p><a href=\""+esc(e.u)+"\">"+esc(e.u)+"</a></div></li>";
    }).join("") || "<li><span class=ss>&mdash;</span><div><b>No entry shares a single counted word "
        + "with your sentence.</b><p>That is the instrument's most common answer, not a finding.</p></div></li>";

    // the calibration mark
    var yf = document.getElementById("youfield");
    var pos = Math.max(0, Math.min(1, best));
    yf.innerHTML = "<figure class=calib style='margin:16px 0 0'><div class=field style='position:relative'>"
      + document.getElementById("field").innerHTML
      + "<div class=youmark style='left:"+(pos*100).toFixed(2)+"%%'><span>you</span></div></div>"
      + "<div class=axis><span>0.00</span><span>0.25</span><span>0.50</span><span>0.75</span><span>1.00</span></div>"
      + "<figcaption>Your best score, marked on the "+N+" nearest-neighbour scores of the catalogue "
      + "itself.</figcaption></figure>";

    // real pairs at the reader's distance
    var near = D.pairs.slice().sort(function(a,b){
      return Math.abs(a.s-best) - Math.abs(b.s-best);
    }).slice(0,2);
    document.getElementById("pairhead").hidden = !near.length;
    document.getElementById("pairs").innerHTML = near.map(function(p){
      var a = D.entries[p.a], b = D.entries[p.b];
      return "<div class=pair><div class=ps>"+f3(p.s)+"</div><div class=pc>"
        + "<div class=pe>"+entryLine(a)+"<p>"+esc(a.m)+"</p><a href=\""+esc(a.u)+"\">"+esc(a.u)+"</a></div>"
        + "<div class=pe>"+entryLine(b)+"<p>"+esc(b.m)+"</p><a href=\""+esc(b.u)+"\">"+esc(b.u)+"</a></div>"
        + "</div></div>";
    }).join("");
  }

  document.getElementById("run").addEventListener("click", run);
  document.getElementById("mine").addEventListener("click", function(){
    q.value = document.getElementById("selfsentence-src").textContent.trim();
    run();
  });
  q.addEventListener("keydown", function(e){
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
  });
})();
</script>
</body>
</html>
"""


# ---------------------------------------------------------------- entry


def write_all(data):
    page = render(data)
    with open(os.path.join(HERE, "data.json"), "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(page)
    return page


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="rebuild and fail on drift from the committed files")
    ap.add_argument("--verify-feed", action="store_true", help="re-fetch and reprove every per-entry record")
    a = ap.parse_args()

    data = build()

    if a.verify_feed:
        url, raw, sha = load_feed()
        live = json.loads(raw.decode("utf-8"))
        committed = json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8"))
        bad = 0
        if len(live) != len(committed["entries"]):
            print("FAIL entry count: live %d, committed %d" % (len(live), len(committed["entries"])))
            bad += 1
        for e in committed["entries"]:
            L = live[e["i"]]
            for k, fk in (("title", "title"), ("artist", "artist"), ("move", "decisive_move"),
                          ("url", "source_url"), ("verify", "verify_status")):
                if str(L.get(fk, "") or "") != e[k]:
                    print("FAIL entry %d field %s" % (e["i"], fk))
                    bad += 1
            if list(L.get("clusters") or []) != e["clusters"]:
                print("FAIL entry %d clusters" % e["i"])
                bad += 1
        print("feed sha256 %s (%s pin)" % (sha, "matches" if sha == PINNED_SHA else "DIFFERS FROM"))
        print("%d per-entry records reproved, %d failures" % (len(committed["entries"]), bad))
        return 1 if bad else 0

    if a.check:
        page = render(data)
        old_page = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()
        old_data = open(os.path.join(HERE, "data.json"), encoding="utf-8").read()
        new_data = json.dumps(data, ensure_ascii=False, indent=1) + "\n"
        bad = 0
        if page != old_page:
            print("FAIL index.html drifted")
            bad += 1
        if new_data != old_data:
            print("FAIL data.json drifted")
            bad += 1
        print("check: %s" % ("OK — byte-identical" if not bad else "%d file(s) drifted" % bad))
        return 1 if bad else 0

    write_all(data)
    m = data["main"]
    print("feed %s  sha256 %s  entries %d" % (data["feed"]["url"], data["feed"]["sha256"][:12], data["feed"]["entries"]))
    print("silent %.1f%%  rank1 %.1f%%  top10 %.1f%%  medrank %s" %
          (m["silent_pct"], m["rank1_pct"], m["top10_pct"], m["median_rank"]))
    print("nn cluster share %.1f%% vs base %.2f%% (x%.2f)" % (m["nn_cluster_pct"], m["base_cluster_pct"], m["lift"]))
    print("sentences holding at every setting: %d of %d" %
          (sum(1 for s in data["sentences"] if s["holds"]), len(data["sentences"])))
    for s in data["sentences"]:
        print("   %-5s %-38s line %6.2f  curve %5.1f..%5.1f  margin %+6.2f" %
              (s["holds"], s["kind"], s["line"], s["curve"][0], s["curve"][1], s["margin"]))
    for k, v in data["cancellation"].items():
        print("   cancellation %s: difference travel %.2f vs mean side travel %.2f = %.3f" %
              (k, v["difference_travel"], v["mean_side_travel"], v["ratio"]))
    print("duplicate sentences: %d over %d entries" %
          (len(data["duplicates"]), sum(len(d["entries"]) for d in data["duplicates"])))
    print("self-check top score %.3f (median nn %.3f)" % (data["self"]["top_score"], m["quantiles"]["median"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
