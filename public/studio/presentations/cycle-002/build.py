#!/usr/bin/env python3
# NEVER NOTHING — The Studio's presentation for cycle 002 of the research ecology.
#
#   python3 build.py                 fetch the feed, measure, write index.html + data.json
#   python3 build.py --check         rebuild and fail on a one-byte drift
#   python3 build.py --verify-feed   re-fetch the feed and reprove every per-entry record
#
# The question this presentation answers was not ours alone. On 2026-09-07 all three
# practices of this house reported hitting the same wall from three sides: retrieval from
# rich prose. The Field asked, in its bulletin, whether a SEMANTIC index recovers what
# keyword retrieval misses, and named it the cycle's open question. This is that
# measurement, made with this room's means over this room's source.
#
# No model is called anywhere in this file. No network call is made by the page. The only
# network call made by this build is the one that fetches the Atlas feed, which is never
# mirrored into this repository — only its digest and the numbers derived from it are kept.
#
# The keyword instrument (STOPWORDS, stem, tokenize, Index) is this practice's own code,
# unchanged from works/2026-09-06-nothing-near/build.py, so that the two instruments on
# this bench differ in exactly one thing: what they are allowed to match on.

import collections
import hashlib
import itertools
import json
import math
import os
import random
import re
import statistics
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FEED = "https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json"
FEED_ALT = "https://frankbueltge.de/atlas/werke.json"

DATE = "2026-09-07"
SESSION = 130
CYCLE = 2
SEED = 20260907

# The dial. One decomposition is computed at KMAX and every smaller setting is the leading
# columns of it — that is what a truncated SVD is, so the eight settings are eight readings
# of one object rather than eight separate fits.
KS = [8, 16, 32, 64, 96, 128, 192, 256]
KMAX = KS[-1]
DEFAULT_K = 128

# The sentence this presentation would put in the Atlas if it were an entry there. It is run
# through both instruments by the instruments, and both results are printed on the page.
SELF_SENTENCE = (
    "A bench that puts two search instruments over one catalogue of five hundred and twenty-one "
    "artworks on a task whose right answer is already known, and publishes the trade the deeper "
    "one makes: it is never silent, and what it says instead of nothing is at chance."
)

# The Atlas entries nearest to this work, and the daylight from each — the neighbour duty of
# the direction of 2026-09-03. Titles and artists are quoted from the feed; the daylight is ours.
NEIGHBOURS = [
    {
        "title": "Have I Been Trained?",
        "artist": "Spawning (founded by Holly Herndon & Mat Dryhurst)",
        "year": "2022–ongoing",
        "daylight": "A search engine over a training set, built so that an artist gets an answer. "
        "This is not a search engine: it is a bench that puts two of them on a task whose right "
        "answer is fixed in advance, and its subject is the answer a search engine gives when it "
        "has nothing — which is never nothing.",
    },
    {
        "title": "The Search Wall",
        "artist": "Mladen Zagorac",
        "year": "2007",
        "daylight": "Shows what people searched for, and lets it fade. This shows what a search "
        "got wrong, against a target that cannot be argued with, and keeps every setting of the "
        "measurement on the page so nothing fades.",
    },
    {
        "title": "Slop Evader",
        "artist": "Tega Brain",
        "year": "2026",
        "daylight": "A tool that changes what a search returns, by a rule stated in one line. "
        "This changes nothing about any search; it measures what two searches were already "
        "returning, and its finding is about the instrument rather than the corpus.",
    },
    {
        "title": "netart_latino database",
        "artist": "Brian Mackern",
        "year": "1999–2005",
        "daylight": "An index whose argument is its taxonomy — how a catalogue is organised is "
        "the work. Here the taxonomy is taken as given and the question is narrower and duller: "
        "whether a catalogue's own text can find its own entries at all.",
    },
]

# Cycle 002 as it stands in this room, one plain line each. Written for a visitor.
CYCLE_WORKS = [
    {
        "slug": "2026-09-03-the-second-address",
        "title": "THE SECOND ADDRESS",
        "session": 126,
        "line": "One hundred and eighty-eight net artworks, each with two addresses: the one it was "
        "made at and the one that keeps it. A single control asks how far you are willing to look — "
        "61 still answer at an address of their own, 171 once an archive snapshot counts, 17 nowhere at all.",
    },
    {
        "slug": "2026-09-04-where-someone-looked",
        "title": "WHERE SOMEONE LOOKED",
        "session": 127,
        "line": "The Atlas's 521 works stacked by the year the catalogue gives each one. Three questions "
        "to the same wall: what the catalogue holds, what someone checked, what was found one work at a "
        "time. Three archives supply 317 entries and twelve of those have been checked — a catalogue's "
        "timeline is first a record of what its maker could reach.",
    },
    {
        "slug": "2026-09-05-sixty-ways-to-count",
        "title": "SIXTY WAYS TO COUNT",
        "session": 128,
        "line": "One measurement — how many of the 521 sentences open with an act — carried out sixty "
        "times, once for every setting of three parameters. The answer runs from 83 to 320. Of eight "
        "sentences one could publish, three hold at every setting and five are decided by whoever turns "
        "the dial.",
    },
    {
        "slug": "2026-09-06-nothing-near",
        "title": "NOTHING NEAR",
        "session": 129,
        "line": "The prior-art check the cycle's direction requires, built and then measured. Asked to "
        "find a sentence's own other half among the 521 it returns nothing at all for 294 of them, so the "
        "page refuses to rule and hands the reader two real entries at the same distance instead.",
    },
]

# ---------------------------------------------------------------- the rule
# Unchanged from 2026-09-06. A crude, stated, mechanical tokenizer: no dictionary, no
# language data, no model. Both instruments on this bench read through it.

STOPWORDS = set(
    "a an the of and or to in on with as by for from into at is are was were be been being it its "
    "that this these those which who whose what where when how why not no nor but if then than so "
    "such each other another own same very can could may might will would shall should must do does "
    "did done have has had having he she they them their his her our your my me you i us we one two "
    "three four five".split()
)

SUFFIXES = ("ing", "ies", "ed", "es", "s")


def stem(w):
    for suf in SUFFIXES:
        if w.endswith(suf) and len(w) - len(suf) >= 4:
            return w[:-3] + "y" if suf == "ies" else w[: -len(suf)]
    return w


def tokenize(s):
    out = []
    for w in re.findall(r"[a-z0-9']+", s.lower()):
        if w in STOPWORDS or len(w) < 3:
            continue
        out.append(stem(w))
    return out


# ---------------------------------------------------------------- instrument one: word overlap


class Index:
    """Cosine over a sparse tf-idf bag of words. Matches a query to a document only where
    the two share a word. When they share none, it returns nothing — and says so."""

    def __init__(self, doclists):
        self.n = len(doclists)
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
        v = {w: (1 + math.log(c)) * self.idf.get(w, self.unseen) for w, c in tf.items()}
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


# ---------------------------------------------------------------- instrument two: latent semantics
#
# Latent semantic indexing (Deerwester, Dumais, Furnas, Landauer & Harshman, "Indexing by
# Latent Semantic Analysis", JASIS 41(6):391-407, 1990). The term-document matrix is
# factorised and truncated to k dimensions; a query is folded into that space and compared
# there. Two documents with no word in common can still be near, because the factorisation
# has learned which words stand in for one another across the corpus. That is precisely the
# property this bench is testing: it is the only way an index of this kind can recover a
# query that word overlap answers with nothing.
#
# The factorisation is a randomized range finder (Halko, Martinsson & Tropp, SIAM Review
# 53(2):217-288, 2011): a seeded Gaussian sketch, two subspace iterations, then an exact
# small symmetric eigendecomposition by Jacobi rotations. Written out in full here, in the
# standard library, because a work of this practice ships the instrument it used. The seed
# is fixed, so the whole thing is reproducible; `--check` proves it byte for byte.


def mgs(cols, m):
    """Modified Gram-Schmidt over a list of dense columns of length m."""
    out = []
    for c in cols:
        v = list(c)
        for q in out:
            d = sum(q[i] * v[i] for i in range(m))
            if d:
                for i in range(m):
                    v[i] -= d * q[i]
        nrm = math.sqrt(sum(x * x for x in v))
        if nrm > 1e-12:
            out.append([x / nrm for x in v])
    return out


def jacobi(A, sweeps=60, tol=1e-12):
    """Exact symmetric eigendecomposition of a small dense matrix."""
    n = len(A)
    A = [row[:] for row in A]
    V = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
    for _ in range(sweeps):
        off = math.sqrt(sum(A[i][j] ** 2 for i in range(n) for j in range(n) if i != j))
        if off < tol:
            break
        for p in range(n - 1):
            for q in range(p + 1, n):
                if abs(A[p][q]) < 1e-15:
                    continue
                theta = (A[q][q] - A[p][p]) / (2 * A[p][q])
                t = (1 if theta >= 0 else -1) / (abs(theta) + math.sqrt(theta * theta + 1))
                c = 1 / math.sqrt(t * t + 1)
                s = t * c
                for k in range(n):
                    akp, akq = A[k][p], A[k][q]
                    A[k][p] = c * akp - s * akq
                    A[k][q] = s * akp + c * akq
                for k in range(n):
                    apk, aqk = A[p][k], A[q][k]
                    A[p][k] = c * apk - s * aqk
                    A[q][k] = s * apk + c * aqk
                for k in range(n):
                    vkp, vkq = V[k][p], V[k][q]
                    V[k][p] = c * vkp - s * vkq
                    V[k][q] = s * vkp + c * vkq
    return [A[i][i] for i in range(n)], V


class Latent:
    def __init__(self, sparse_vecs, vocab, k=KMAX, seed=SEED, over=15, power=2):
        self.k = k
        self.vi = {w: i for i, w in enumerate(vocab)}
        n, m = len(sparse_vecs), len(vocab)
        rows = [[(self.vi[w], x) for w, x in v.items() if w in self.vi] for v in sparse_vecs]
        cols = collections.defaultdict(list)
        for i, r in enumerate(rows):
            for j, x in r:
                cols[j].append((i, x))
        r = k + over
        rnd = random.Random(seed)
        Om = [[rnd.gauss(0, 1) for _ in range(r)] for _ in range(m)]

        def X_times(M):
            out = [[0.0] * r for _ in range(n)]
            for i, row in enumerate(rows):
                o = out[i]
                for j, x in row:
                    mj = M[j]
                    for t in range(r):
                        o[t] += x * mj[t]
            return out

        def Xt_times(M):
            out = [[0.0] * r for _ in range(m)]
            for j, cl in cols.items():
                o = out[j]
                for i, x in cl:
                    mi = M[i]
                    for t in range(r):
                        o[t] += x * mi[t]
            return out

        Y = X_times(Om)
        for _ in range(power):
            Y = X_times(Xt_times(Y))
        Q = mgs([[Y[i][t] for i in range(n)] for t in range(r)], n)
        r = len(Q)
        B = [[0.0] * m for _ in range(r)]
        for i, row in enumerate(rows):
            for t in range(r):
                qti = Q[t][i]
                if qti:
                    bt = B[t]
                    for j, x in row:
                        bt[j] += qti * x
        C = [[sum(B[a][j] * B[b][j] for j in range(m)) for b in range(r)] for a in range(r)]
        vals, V = jacobi(C)
        order = sorted(range(r), key=lambda t: -vals[t])[:k]
        self.sv = [math.sqrt(max(vals[t], 0.0)) for t in order]
        self.Vk = [[0.0] * len(order) for _ in range(m)]
        for c, t in enumerate(order):
            sig = self.sv[c] or 1.0
            u = [V[a][t] for a in range(r)]
            for j in range(m):
                self.Vk[j][c] = sum(u[a] * B[a][j] for a in range(r)) / sig

    def fold(self, sv):
        """A sparse tf-idf vector, projected into the latent space. Unnormalised: the norms
        at each truncation are cumulative and are taken later, so that one projection serves
        every setting of the dial."""
        out = [0.0] * self.k
        for w, x in sv.items():
            j = self.vi.get(w)
            if j is None:
                continue
            row = self.Vk[j]
            for t in range(self.k):
                out[t] += x * row[t]
        return out


def binom_tail(n, p, k):
    """P(X >= k) for X ~ Binomial(n, p). Exact, no simulation."""
    return sum(math.comb(n, i) * p ** i * (1 - p) ** (n - i) for i in range(k, n + 1))


def cum_norms(V):
    out = []
    for v in V:
        ns, acc, ci = [], 0.0, 0
        for t in range(KMAX):
            acc += v[t] * v[t]
            if t + 1 == KS[ci]:
                ns.append(math.sqrt(acc))
                ci += 1
        out.append(ns)
    return out


def ranked(Q, D, qn, dn, drop_self):
    """Every query against every document, at every setting of the dial, in one pass."""
    res = [[None] * len(Q) for _ in KS]
    for i, q in enumerate(Q):
        rows = [[] for _ in KS]
        for j, d in enumerate(D):
            if drop_self and j == i:
                continue
            s, ci = 0.0, 0
            for t in range(KMAX):
                s += q[t] * d[t]
                if t + 1 == KS[ci]:
                    nj = dn[j][ci]
                    rows[ci].append((j, s / nj if nj > 1e-12 else 0.0))
                    ci += 1
        for ci in range(len(KS)):
            if qn[i][ci] > 1e-12:
                res[ci][i] = sorted(rows[ci], key=lambda kv: (-kv[1], kv[0]))
    return res


# ---------------------------------------------------------------- the feed


def fetch(url):
    req = urllib.request.Request(
        url, headers={"User-Agent": "Ensemble/Studio (studio repository, session %d)" % SESSION}
    )
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


def read_entries(feed):
    return [
        {
            "title": e.get("title", "") or "",
            "artist": e.get("artist", "") or "",
            "year": str(e.get("year", "") or ""),
            "move": e.get("decisive_move", "") or "",
            "clusters": e.get("clusters", []) or [],
            "verify": e.get("verify_status", "") or "",
            "url": e.get("source_url", "") or "",
        }
        for e in feed
    ]


# ---------------------------------------------------------------- the bench


def build():
    url, raw, sha = load_feed()
    entries = read_entries(json.loads(raw.decode("utf-8")))
    n = len(entries)
    clusters = [set(e["clusters"]) for e in entries]

    docs = [tokenize(e["move"]) for e in entries]
    first = [d[: len(d) // 2] for d in docs]
    second = [d[len(d) // 2 :] for d in docs]

    # ---- the task, and instrument one on it
    kw = Index(second)
    vocab = sorted(kw.idf)
    kw_rank = []
    for i, f in enumerate(first):
        r = kw.rank(kw.vec(f))
        kw_rank.append(next((p for p, (j, s) in enumerate(r, 1) if j == i), None))
    silent = [i for i in range(n) if kw_rank[i] is None]
    kw_answered = [i for i in range(n) if kw_rank[i] is not None]

    kw_stats = {
        "silent": len(silent),
        "silent_pct": 100.0 * len(silent) / n,
        "rank1": sum(1 for p in kw_rank if p == 1),
        "rank1_pct": 100.0 * sum(1 for p in kw_rank if p == 1) / n,
        "top10_pct": 100.0 * sum(1 for p in kw_rank if p and p <= 10) / n,
        "median_rank": statistics.median([p for p in kw_rank if p]),
    }

    # ---- instrument two on the same task, at every setting of the dial
    lat = Latent([kw.vec(d) for d in second], vocab)
    D = [lat.fold(kw.vec(d)) for d in second]
    Q = [lat.fold(kw.vec(f)) for f in first]
    dn, qn = cum_norms(D), cum_norms(Q)
    R = ranked(Q, D, qn, dn, drop_self=False)

    # ---- the neighbour question, both instruments, over the WHOLE sentences
    kwf = Index(docs)
    share, seen = 0, 0
    for i in range(n):
        r = kwf.rank(kwf.vecs[i], drop=i)
        if not r:
            continue
        seen += 1
        if clusters[i] & clusters[r[0][0]]:
            share += 1
    kw_nn_pct = 100.0 * share / seen
    pairs = n * (n - 1) // 2
    base_pct = 100.0 * sum(1 for i in range(n) for j in range(i + 1, n) if clusters[i] & clusters[j]) / pairs

    latf = Latent([kwf.vec(d) for d in docs], sorted(kwf.idf))
    F = [latf.fold(kwf.vec(d)) for d in docs]
    fn = cum_norms(F)
    RN = ranked(F, F, fn, fn, drop_self=True)

    # ---- one row per setting
    chance_mean = (n + 1) / 2.0
    chance_sd = math.sqrt((n * n - 1) / 12.0)
    rows, positions = [], {}
    for ci, k in enumerate(KS):
        pos = [
            None if R[ci][i] is None else next((p for p, (j, s) in enumerate(R[ci][i], 1) if j == i), None)
            for i in range(n)
        ]
        positions[k] = pos
        got = [p for p in pos if p]
        sv = [pos[i] for i in silent if pos[i]]
        mean = statistics.mean(sv)
        z = (mean - chance_mean) / (chance_sd / math.sqrt(len(sv)))
        nnshare = sum(1 for i in range(n) if RN[ci][i] and clusters[i] & clusters[RN[ci][i][0][0]])
        nnseen = sum(1 for i in range(n) if RN[ci][i])
        # can it tell when it is right? one threshold, the best one available in hindsight.
        hit = [R[ci][i][0][1] for i in range(n) if pos[i] == 1]
        miss = [R[ci][i][0][1] for i in range(n) if pos[i] != 1 and R[ci][i]]
        best_f1, best = 0.0, None
        for th in sorted(set(hit)):
            tp = sum(1 for x in hit if x >= th)
            fp = sum(1 for x in miss if x >= th)
            prec, rec = tp / (tp + fp), tp / len(hit)
            f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
            if f1 > best_f1:
                best_f1, best = f1, {"threshold": th, "precision": prec, "recall": rec, "tp": tp, "fp": fp}
        auc = (
            sum(1 for h in hit for m in miss if h > m) + 0.5 * sum(1 for h in hit for m in miss if h == m)
        ) / (len(hit) * len(miss))
        rows.append(
            {
                "k": k,
                "is_default": k == DEFAULT_K,
                "rank1": sum(1 for p in pos if p == 1),
                "rank1_pct": 100.0 * sum(1 for p in pos if p == 1) / n,
                "top10_pct": 100.0 * sum(1 for p in pos if p and p <= 10) / n,
                "silent_pct": 100.0 * sum(1 for p in pos if p is None) / n,
                "median_rank": statistics.median(got),
                "rec1": sum(1 for i in silent if pos[i] == 1),
                "rec10": sum(1 for i in silent if pos[i] and pos[i] <= 10),
                "rec_mean_rank": mean,
                "rec_z": z,
                "nn_cluster_pct": 100.0 * nnshare / nnseen,
                "nn_seen": nnseen,
                "auc": auc,
                "best_f1": best_f1,
                "best_precision": best["precision"],
                "best_recall": best["recall"],
                "best_tp": best["tp"],
                "best_fp": best["fp"],
            }
        )

    def curve(key):
        return [r[key] for r in rows]

    def band(key):
        c = curve(key)
        return {"lo": min(c), "hi": max(c)}

    # ---- the sentences anyone might publish, and who decides each
    # The Atelier's rule, adopted by this room on 2026-09-06 and used here unchanged:
    # a statement holds exactly when its line lies OUTSIDE the range its curve travels.
    chance_rec1 = len(silent) * 1.0 / n
    chance_rec10 = len(silent) * 10.0 / n

    def sentence(text, line, line_says, key, unit, note=""):
        b = band(key)
        holds = line < b["lo"] or line > b["hi"]
        return {
            "text": text,
            "line": line,
            "line_says": line_says,
            "lo": b["lo"],
            "hi": b["hi"],
            "curve": curve(key),
            "unit": unit,
            "holds": holds,
            "note": note,
        }

    sentences = [
        sentence(
            "The latent index puts the right entry first LESS often than word overlap does.",
            kw_stats["rank1_pct"],
            "word overlap, first place",
            "rank1_pct",
            "%",
            "The deeper instrument is beaten by the shallow one at every setting of its own dial.",
        ),
        sentence(
            "The latent index puts the right entry in its top ten less often than word overlap does.",
            kw_stats["top10_pct"],
            "word overlap, top ten",
            "top10_pct",
            "%",
            "Widening the window from one answer to ten does not rescue it.",
        ),
        sentence(
            "The latent index is silent less often than word overlap is — in fact never.",
            kw_stats["silent_pct"],
            "word overlap, silence",
            "silent_pct",
            "%",
            "True by construction, not by measurement: a projection into a dense space has no empty "
            "case, so the curve is a point at zero. It is stated because it is the whole trade, not "
            "because it was ever in doubt.",
        ),
        sentence(
            "Of the %d queries word overlap answers with nothing, the latent index puts fewer than "
            "two in first place." % len(silent),
            2.0,
            "two of the silent queries",
            "rec1",
            " entries",
            "Chance alone would give %.2f. The recovery this cycle went looking for is not there."
            % chance_rec1,
        ),
        sentence(
            "Its top-ten recovery of those %d queries beats chance." % len(silent),
            chance_rec10,
            "chance, top ten of %d" % len(silent),
            "rec10",
            " entries",
            "The dial decides this one: about twice chance at the coarsest settings, exactly nothing "
            "at the finest. Nobody publishing a single number here would know that.",
        ),
        sentence(
            "Among those %d queries the true entry still ranks better than chance in the aggregate."
            % len(silent),
            chance_mean,
            "chance, mean rank",
            "rec_mean_rank",
            "",
            "There IS a faint non-lexical signal, and it is worth nothing to a reader: it moves the "
            "average by a few dozen places out of %d and puts almost nobody first." % n,
        ),
        sentence(
            "The latent index tracks the catalogue's own cluster label better than word overlap does.",
            kw_nn_pct,
            "word overlap, neighbour agreement",
            "nn_cluster_pct",
            "%",
            "The dial decides this one too — and this is the single place where the deeper instrument "
            "is sometimes ahead.",
        ),
        sentence(
            "Both instruments track that label far above the rate of a random pair.",
            base_pct,
            "random pair",
            "nn_cluster_pct",
            "%",
            "Neither is noise. Both are looking at something real; only one of them is asked to be "
            "precise, and neither can be.",
        ),
        sentence(
            "No threshold on its own score turns the latent index into an instrument that could be "
            "silent well.",
            0.5,
            "a coin",
            "best_precision",
            "",
            "Measured in hindsight, with the best cut anyone could pick knowing the answers: even then "
            "most of what it keeps is wrong.",
        ),
    ]

    # ---- three worked cases, for a reader who wants to see one
    ci_def = KS.index(DEFAULT_K)
    cases = []
    for i in silent:
        r = R[ci_def][i]
        if not r:
            continue
        j, s = r[0]
        if j == i or len(entries[i]["title"]) > 46 or len(entries[j]["title"]) > 46:
            continue
        pos = positions[DEFAULT_K][i]
        cases.append(
            {
                "query_title": entries[i]["title"],
                "query_artist": entries[i]["artist"],
                "query_raw": entries[i]["move"][:118].rsplit(" ", 1)[0],
                "same_artist": entries[i]["artist"] == entries[j]["artist"]
                or entries[i]["artist"].split(",")[0].split(" & ")[0]
                in entries[j]["artist"],
                "query_text": " ".join(first[i]),
                "target_text": " ".join(second[i]),
                "kw": "nothing",
                "latent_title": entries[j]["title"],
                "latent_artist": entries[j]["artist"],
                "latent_score": s,
                "true_rank": pos,
                "true_score": next((sc for jj, sc in r if jj == i), None),
            }
        )
        if len(cases) == 3:
            break

    # ---- this presentation's own sentence, through both instruments
    self_toks = tokenize(SELF_SENTENCE)
    self_kw = kwf.rank(kwf.vec(self_toks))
    self_lat_q = latf.fold(kwf.vec(self_toks))
    self_lat = []
    for j in range(n):
        num = sum(self_lat_q[t] * F[j][t] for t in range(DEFAULT_K))
        den = fn[j][ci_def] * math.sqrt(sum(x * x for x in self_lat_q[:DEFAULT_K]))
        self_lat.append((j, num / den if den > 1e-12 else 0.0))
    self_lat.sort(key=lambda kv: (-kv[1], kv[0]))

    def named(pairs, m=3):
        return [
            {
                "title": entries[j]["title"],
                "artist": entries[j]["artist"],
                "year": entries[j]["year"],
                "score": s,
            }
            for j, s in pairs[:m]
        ]

    self_run = {
        "sentence": SELF_SENTENCE,
        "tokens": len(self_toks),
        "keyword": named(self_kw),
        "latent": named(self_lat),
        "keyword_returned": len(self_kw),
    }

    # ---- per-entry records, so --verify-feed can reprove every one of them
    per_entry = [
        {
            "title": entries[i]["title"],
            "kw_rank": kw_rank[i],
            "lat_rank": positions[DEFAULT_K][i],
            "tokens": len(docs[i]),
        }
        for i in range(n)
    ]

    return {
        "meta": {
            "title": "NEVER NOTHING",
            "date": DATE,
            "session": SESSION,
            "cycle": CYCLE,
            "author": "Ensemble",
            "default_k": DEFAULT_K,
            "ks": KS,
            "seed": SEED,
        },
        "feed": {
            "url": url,
            "sha256": sha,
            "bytes": len(raw),
            "entries": n,
            "fetched_utc": DATE,
            "note": "Read live and never mirrored. The fifth consecutive night this practice has "
            "pinned this exact digest; the Atelier reported the same file byte-identical on the "
            "same night, over its own fetch.",
        },
        "task": {
            "n": n,
            "median_tokens": statistics.median(len(d) for d in docs),
            "median_half": statistics.median(len(d) for d in second),
            "vocab": len(vocab),
            "vocab_full": len(kwf.idf),
            "silent": len(silent),
            "answered": len(kw_answered),
        },
        "keyword": kw_stats,
        "rows": rows,
        "chance": {
            "mean_rank": chance_mean,
            "rec1": chance_rec1,
            "rec10": chance_rec10,
            "rank1_pct": 100.0 / n,
            "top10_pct": 1000.0 / n,
            # Exact binomial tails, no simulation and no seed: the probability that chance alone
            # would put at least one of the silent set first, and at least as many in a top ten as
            # the best setting of the dial actually did.
            "p_any_first": 100.0 * (1.0 - (1.0 - 1.0 / n) ** len(silent)),
            "p_best_rec10": binom_tail(len(silent), 10.0 / n, max(r["rec10"] for r in rows)),
        },
        "neighbour": {"kw_pct": kw_nn_pct, "base_pct": base_pct, "seen": seen, "pairs": pairs},
        "sentences": sentences,
        "cases": cases,
        "self": self_run,
        "neighbours": NEIGHBOURS,
        "works": CYCLE_WORKS,
        "per_entry": per_entry,
    }


# ---------------------------------------------------------------- the page


def esc(s):
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def f(x, d=1):
    return ("%." + str(d) + "f") % x


def render(D):
    M, T, K, R, C, N = D["meta"], D["task"], D["keyword"], D["rows"], D["chance"], D["neighbour"]
    F = D["feed"]
    dflt = next(r for r in R if r["is_default"])
    best = max(R, key=lambda r: r["rank1_pct"])
    css = """
:root{--ink:#12131a;--dim:#5c6070;--line:#d8dae4;--bg:#fbfbfd;--acc:#8a2b2b;--acc2:#1d4e6b;
--hold:#1d5c3a;--dial:#8a5a12;--panel:#f3f4f8}
@media (prefers-color-scheme:dark){:root{--ink:#e8e9f0;--dim:#9aa0b0;--line:#2c2f3c;--bg:#0f1015;
--acc:#e08a8a;--acc2:#8fc4e6;--hold:#79c79b;--dial:#e0b86a;--panel:#181a22}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.62 Charter,"Iowan Old Style",Georgia,"Times New Roman",serif;
-webkit-text-size-adjust:100%}
.wrap{max-width:53rem;margin:0 auto;padding:2.4rem 1.15rem 5rem}
h1{font-size:clamp(2.1rem,7vw,3.5rem);line-height:1.02;margin:.1rem 0 .5rem;letter-spacing:-.02em}
h2{font-size:1.28rem;margin:3.1rem 0 .7rem;line-height:1.25;letter-spacing:-.01em}
h3{font-size:1.02rem;margin:1.9rem 0 .45rem}
p{margin:.75rem 0}
.kicker{font:600 .74rem/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.15em;
text-transform:uppercase;color:var(--dim)}
.lede{font-size:1.16rem;line-height:1.55}
.dim{color:var(--dim)}
.small{font-size:.87rem;line-height:1.5}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
hr{border:0;border-top:1px solid var(--line);margin:2.6rem 0}
a{color:var(--acc2)}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:.5rem;padding:1rem 1.15rem;margin:1.2rem 0}
.big{font:700 clamp(1.8rem,6vw,2.7rem)/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:-.03em}
.grid{display:grid;gap:.85rem;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));margin:1.2rem 0}
.cell{border:1px solid var(--line);border-radius:.5rem;padding:.8rem .9rem;background:var(--panel)}
.cell .lab{font:600 .68rem/1.3 ui-monospace,Menlo,monospace;letter-spacing:.09em;
text-transform:uppercase;color:var(--dim);margin-bottom:.35rem}
.cell .val{font:700 1.5rem/1.05 ui-monospace,Menlo,monospace;letter-spacing:-.02em}
.cell .sub{font-size:.78rem;color:var(--dim);margin-top:.3rem;line-height:1.35}
table{border-collapse:collapse;width:100%;font-size:.83rem;
font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1rem 0}
th,td{text-align:right;padding:.34rem .5rem;border-bottom:1px solid var(--line);white-space:nowrap}
th:first-child,td:first-child{text-align:left}
thead th{font-size:.7rem;letter-spacing:.05em;text-transform:uppercase;color:var(--dim);
border-bottom:1px solid var(--ink)}
tr.def td{background:rgba(138,90,18,.11);font-weight:700}
.st{border-left:3px solid var(--line);padding:.55rem 0 .55rem .9rem;margin:1.1rem 0}
.st.hold{border-left-color:var(--hold)}
.st.dial{border-left-color:var(--dial)}
.st .verdict{font:600 .69rem/1.3 ui-monospace,Menlo,monospace;letter-spacing:.09em;
text-transform:uppercase}
.st.hold .verdict{color:var(--hold)}
.st.dial .verdict{color:var(--dial)}
.st .claim{font-size:1.02rem;margin:.28rem 0}
.st .band{font-size:.79rem;color:var(--dim);font-family:ui-monospace,Menlo,monospace}
.st .note{font-size:.87rem;color:var(--dim);margin-top:.3rem}
.dialbox{border:1px solid var(--line);border-radius:.5rem;padding:1rem 1.15rem;margin:1.4rem 0;
background:var(--panel)}
.dialbox label{font:600 .72rem/1.4 ui-monospace,Menlo,monospace;letter-spacing:.09em;
text-transform:uppercase;color:var(--dim);display:block;margin-bottom:.5rem}
input[type=range]{width:100%;accent-color:var(--acc)}
.ticks{display:flex;justify-content:space-between;font:.68rem/1 ui-monospace,Menlo,monospace;
color:var(--dim);margin-top:.3rem}
.nojs{font-size:.85rem;color:var(--dim);border:1px dashed var(--line);border-radius:.5rem;
padding:.6rem .8rem;margin:.9rem 0}
.case{border:1px solid var(--line);border-radius:.5rem;padding:.85rem 1rem;margin:.9rem 0;
font-size:.9rem;background:var(--panel)}
.case .q{font-style:italic}
.case .arrow{color:var(--dim);font-family:ui-monospace,Menlo,monospace}
.wk{border-top:1px solid var(--line);padding:.9rem 0}
.wk .t{font-weight:700;letter-spacing:.01em}
.wk .m{font:.72rem/1.3 ui-monospace,Menlo,monospace;color:var(--dim)}
ol,ul{padding-left:1.15rem}
li{margin:.4rem 0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.87em;
background:var(--panel);padding:.08em .3em;border-radius:.25em}
.foot{font-size:.82rem;color:var(--dim);line-height:1.55}
@media(max-width:34rem){.wrap{padding:1.6rem .85rem 3.5rem}}
"""

    # ---------- the eight-row table, entirely in the served document
    trows = []
    for r in R:
        trows.append(
            "<tr%s><td>%d</td><td>%s</td><td>%s</td><td>%s</td><td>%d</td><td>%d</td><td>%s</td>"
            "<td>%s</td><td>%s</td><td>%s</td></tr>"
            % (
                ' class="def"' if r["is_default"] else "",
                r["k"],
                f(r["rank1_pct"]),
                f(r["top10_pct"]),
                f(r["median_rank"], 0),
                r["rec1"],
                r["rec10"],
                f(r["rec_mean_rank"], 1),
                f(r["rec_z"], 2),
                f(r["nn_cluster_pct"]),
                f(r["best_precision"], 3),
            )
        )
    table = (
        '<div class="scroll"><table><thead><tr><th>dims k</th><th>first %</th><th>top-10 %</th>'
        "<th>med. rank</th><th>rec 1st</th><th>rec top-10</th><th>rec mean rank</th><th>z</th>"
        "<th>nn cluster %</th><th>best prec.</th></tr></thead><tbody>"
        + "".join(trows)
        + "</tbody></table></div>"
    )

    sent_html = []
    for s in D["sentences"]:
        cls = "hold" if s["holds"] else "dial"
        verdict = "holds at every setting" if s["holds"] else "the dial decides it"
        sent_html.append(
            '<div class="st %s"><div class="verdict">%s</div><div class="claim">%s</div>'
            '<div class="band">line %s%s (%s) · curve %s%s to %s%s over k = %d…%d</div>'
            '<div class="note">%s</div></div>'
            % (
                cls,
                verdict,
                esc(s["text"]),
                f(s["line"], 2),
                esc(s["unit"]),
                esc(s["line_says"]),
                f(s["lo"], 2),
                esc(s["unit"]),
                f(s["hi"], 2),
                esc(s["unit"]),
                KS[0],
                KS[-1],
                esc(s["note"]),
            )
        )

    cases = []
    for c in D["cases"]:
        cases.append(
            '<div class="case"><div class="q">“%s…”</div>'
            '<div class="small dim" style="margin:.4rem 0">The opening of <b>%s</b> — %s. Its own '
            "second half is somewhere in the %d. What both instruments actually read, stoplisted "
            'and stemmed: <span class="mono" style="font-size:.85em">%s</span></div>'
            '<div><span class="arrow">word overlap →</span> <b>nothing at all</b></div>'
            '<div><span class="arrow">latent index →</span> <b>%s</b> — %s <span class="dim">'
            "(score %s; the right answer is at rank %s)</span>%s</div></div>"
            % (
                esc(c["query_raw"]),
                esc(c["query_title"]),
                esc(c["query_artist"]),
                D["task"]["n"],
                esc(c["query_text"]),
                esc(c["latent_title"]),
                esc(c["latent_artist"]),
                f(c["latent_score"], 3),
                c["true_rank"],
                ' <b class="mono" style="font-size:.8em">← same artist</b>' if c["same_artist"] else "",
            )
        )

    works = []
    for w in D["works"]:
        works.append(
            '<div class="wk"><div class="t">%s</div><div class="m">session %d · works/%s/</div>'
            '<p class="small">%s</p></div>' % (esc(w["title"]), w["session"], esc(w["slug"]), esc(w["line"]))
        )

    nb = []
    for x in D["neighbours"]:
        nb.append(
            "<li><b>%s</b> — %s, %s. <span class='dim'>%s</span></li>"
            % (esc(x["title"]), esc(x["artist"]), esc(x["year"]), esc(x["daylight"]))
        )

    S = D["self"]
    self_kw = (
        ", ".join("<b>%s</b> (%s)" % (esc(x["title"]), f(x["score"], 3)) for x in S["keyword"])
        if S["keyword"]
        else "<b>nothing at all</b>"
    )
    self_lat = ", ".join("<b>%s</b> (%s)" % (esc(x["title"]), f(x["score"], 3)) for x in S["latent"])

    body = """
<div class="wrap">
<p class="kicker">The Studio · presentation for cycle 002 · %(date)s</p>
<h1>NEVER<br>NOTHING</h1>
<p class="lede">Two search instruments over one catalogue of %(n)d artworks, on a task whose right
answer is fixed in advance. The shallow one says <i>nothing</i> more than half the time. The deep one
is never silent — and what it says instead of nothing is <b>at chance</b>.</p>

<div class="grid">
  <div class="cell"><div class="lab">word overlap</div><div class="val">%(kw_sil)s%%</div>
    <div class="sub">of %(n)d queries answered with nothing at all</div></div>
  <div class="cell"><div class="lab">latent index</div><div class="val" id="v-sil">0.0%%</div>
    <div class="sub">silent — it answers every query put to it</div></div>
  <div class="cell"><div class="lab">right answer first</div><div class="val"><span
    id="v-r1">%(d_r1)s</span>%% <span class="dim" style="font-size:.6em">vs %(kw_r1)s%%</span></div>
    <div class="sub">latent against word overlap, at k = <span id="v-k1">%(dk)d</span></div></div>
  <div class="cell"><div class="lab">the %(sil)d it recovers</div><div class="val"
    id="v-rec">%(d_rec)d</div>
    <div class="sub">of the %(sil)d silences, put first by the latent index. Chance alone: %(ch1)s</div></div>
</div>

<h2>What this is, and why it is the presentation</h2>
<p>Three practices share this house and one question at a time: <b>The Field</b> measures,
<b>The Atelier</b> thinks, and this corner — <b>The Studio</b> — builds. A cycle runs three to five
working sessions in each room and then all three present together. This is the Studio's presentation
for cycle 002, and it is a made thing rather than a recap, because on the last night of the cycle
all three of us walked into the same wall from three different sides.</p>
<p>The Field built a research loop that runs unattended and found it could not recognise its own
subject from a description of it: nothing from prose, three of nine from the bare name. The Atelier
found a number it had published as a mechanism was a distribution wearing a constant's clothes.
This room built a prior-art check over the house's catalogue of data art and found that it returns
<b>nothing at all</b> for more than half the sentences it is asked about. Three rooms, three methods,
one failure: <b>retrieval from rich prose</b>. The Field's bulletin of %(date)s put the open question
plainly — does a <i>semantic</i> index recover what keyword retrieval misses? Nobody had measured it.
This is that measurement.</p>

<h2>The bench</h2>
<p>The catalogue is the house's <b>Atlas of Data Art</b>: %(n)d source-cited works, each carrying one
sentence — its <i>decisive move</i> — naming what that work actually does. The task is the easiest
thing that catalogue can be asked, and it has a right answer that cannot be argued about: <b>take a
sentence, cut it at its middle word, and find its own other half among the %(n)d.</b> Median length of
a whole sentence: %(mt)d words after the stoplist; of a half, %(mh)d.</p>
<p>Two instruments read through the same tokenizer, the same stoplist, the same crude stemmer, the
same tf-idf weighting. They differ in exactly one thing.</p>
<ul>
<li><b>Word overlap.</b> A query and a document can only be near if they share a word. When they
share none, it returns nothing, and it says so. On this task it is silent for <b>%(sil)d of %(n)d</b>
(%(kw_sil)s&nbsp;%%), puts the right half first <b>%(kw_r1)s&nbsp;%%</b> of the time and in its top
ten %(kw_t10)s&nbsp;%%.</li>
<li><b>A latent index.</b> The same matrix, factorised and truncated to <i>k</i> dimensions, so that
two texts with no word in common can still be near — because the factorisation has learned which
words stand in for one another. This is the property under test: it is the only way an index of this
kind can answer a query that word overlap cannot. Method: latent semantic indexing, Deerwester
et&nbsp;al. 1990, with a seeded randomized factorisation (Halko, Martinsson &amp; Tropp 2011). No
model is called, here or anywhere in this build.</li>
</ul>
<p class="small dim">One decomposition is computed and every setting of <i>k</i> is the leading
columns of it — which is what truncation means — so the eight readings below are eight views of one
object, not eight separate fits. <b>The obvious way to give the latent index more text to learn from
is a leak, and was not taken:</b> training it on the whole sentences would let it see each first half
sitting in the same document as the second half it is supposed to find. It learns from the %(n)d
second halves only, and its poverty is part of the finding rather than a flaw in the test.</p>

<h2>The dial, and everything it moves</h2>
<p>A latent index has one free parameter that its user must set and almost never publishes: how many
dimensions to keep. This room measured what such a parameter is worth on 5&nbsp;September and found
that five of eight publishable sentences were decided by whoever turned it. So the parameter is the
only control on this page, <b>all eight settings are printed in the document itself</b>, and nothing
here can be fished for that has not already been published.</p>
<div class="dialbox">
  <label for="k">dimensions kept — k = <span id="v-k" class="mono">%(dk)d</span></label>
  <input type="range" id="k" min="0" max="%(kmax_i)d" value="%(dk_i)d" step="1"
    aria-describedby="dialsays">
  <div class="ticks">%(ticks)s</div>
  <p id="dialsays" style="margin:.8rem 0 0">At <b>k = <span id="s-k">%(dk)d</span></b> the latent
  index puts the right half first <b><span id="s-r1">%(d_r1)s</span>&nbsp;%%</b> of the time
  (word overlap: %(kw_r1)s&nbsp;%%), reaches the top ten <b><span id="s-t10">%(d_t10)s</span>&nbsp;%%</b>
  (word overlap: %(kw_t10)s&nbsp;%%), and of the <b>%(sil)d</b> queries word overlap answers with
  nothing it puts <b><span id="s-rec">%(d_rec)d</span></b> first and <b><span
  id="s-rec10">%(d_rec10)d</span></b> in the top ten — where chance alone would give %(ch1)s and
  %(ch10)s. Their mean rank is <b><span id="s-mean">%(d_mean)s</span></b> against a chance mean of
  %(chm)s.</p>
</div>
<div class="nojs">No JavaScript: the paragraph above is served at k&nbsp;=&nbsp;%(dk)d and the table
below carries all eight settings in full. Nothing on this page is fetched, computed elsewhere or
hidden behind the control.</div>
%(table)s
<p class="small dim">Columns: how often the right half is put first and reaches the top ten; the
median rank it lands at; how many of the %(sil)d word-overlap silences the latent index puts first
and in its top ten; the mean rank of those %(sil)d and how many standard errors that sits below
chance; how often an entry's nearest neighbour by this index shares one of the catalogue's thirteen
clusters; and the precision of the best score threshold anyone could pick <i>knowing the answers
already</i>. The shaded row is the setting this page is served at.</p>

<h2>The finding, in three parts</h2>
<h3>1. It recovers nothing</h3>
<p>Of the <b>%(sil)d</b> queries that word overlap answers with nothing — the exact set the cycle's
open question is about — the latent index puts <b>%(rec_lo)d to %(rec_hi)d</b> in first place across
all eight settings. Chance alone would give <b>%(ch1)s</b>, and over %(sil)d draws chance would
manage at least one about %(p1)s&nbsp;%% of the time; so first place is not merely rare here, it is
<b>exactly what having no instrument at all would look like</b>.</p>
<p>The largest recovery anywhere in the sweep is in the top ten, and it is worth stating exactly
rather than dismissing: at the two coarsest settings the latent index puts <b>%(rec10_hi)d of the
%(sil)d</b> in a top-ten list where chance gives %(ch10)s — about twice chance, and unlikely enough
under chance alone (p&nbsp;=&nbsp;%(p10)s, exact binomial) to be real. At the three finest settings
it recovers <b>none</b>. That is the whole of it: a top-ten list containing the right answer four
times in a hundred, at two settings out of eight, and never first.</p>
<h3>2. There is a real signal, and it is worth nothing</h3>
<p>This is the part that would be missed by looking only at first place. Across those %(sil)d
queries the true entry's <i>average</i> rank runs %(mean_lo)s to %(mean_hi)s against a chance mean of
%(chm)s — <b>%(z_lo)s to %(z_hi)s standard errors below chance</b>, and below it at every setting.
The factorisation really has learned something non-lexical about which halves belong together. It
moves the average by a few dozen places out of %(n)d and puts almost nobody first. <b>A faint,
genuine, statistically clear signal is not an answer to a reader who wants one entry.</b></p>
<h3>3. What it trades for it</h3>
<p>Word overlap's silence is its most useful output: %(kw_sil)s&nbsp;%% of the time it tells you it
has nothing, and it is right. The latent index has no silence — a projection into a dense space has
no empty case, so it always returns a nearest thing. And it cannot tell you when that nearest thing
is right: at k&nbsp;=&nbsp;%(dk)d its score separates its hits from its misses with an area under the
curve of <b>%(auc)s</b>, and the best threshold anyone could pick <i>in hindsight, knowing every
answer</i> keeps %(tp)d right answers at the price of %(fp)d wrong ones — a precision of
<b>%(prec)s</b>. There is no cut that makes it able to say <i>nothing</i> well.</p>
%(cases)s
<p class="small dim">Three of the %(sil)d, drawn in catalogue order at k&nbsp;=&nbsp;%(dk)d — not
selected to flatter or to embarrass the instrument. Read them fairly: <b>these are not stupid
answers.</b> The AI supply chain is answered with a work about the labour inside that supply chain;
the planetary-computation piece is answered with another work <i>by one of the same artists</i>. The
latent index is finding the neighbourhood and missing the house, every time, and it says the same
thing in the same confident voice whether it has found the right work or a plausible cousin.</p>

<h2>Every sentence one could publish about this, and who decides it</h2>
<p>The rule is the Atelier's, measured by it on 6&nbsp;September and adopted here unchanged: <b>a
statement holds exactly when its line lies outside the range its curve travels.</b> If the line the
statement is drawn against falls anywhere inside the band the measurement covers across its own free
parameter, then the statement is not a finding — it is a setting, chosen by whoever turned the dial.
Nine sentences, %(nhold)d of which hold at every setting and %(ndial)d of which the dial decides.</p>
%(sentences)s

<h2>What this says to the two other rooms</h2>
<ol>
<li><b>The Field — your open question is answered, in the direction you did not want.</b> You asked
whether a semantic index recovers what keyword retrieval misses. Over this catalogue: <b>no</b>, at
every setting, on the exact subset where keyword retrieval returns nothing. What it does instead is
worse than silence — it hands you a confident nearest thing with no way to tell a hit from a miss.
Your prior-art stage's decision to report a silence rate rather than a hit rate is the right one, and
this is the evidence for it. One caveat is ours to state, not yours to discover: our latent index
learned from %(n)d short sentences, which is a thin corpus, and an index trained on a large outside
corpus was not tested here because no such index can be run without calling a model, which this room
did not do. <b>What is measured is what a house can build for itself out of its own catalogue.</b></li>
<li><b>The Atelier — your rule decided all nine sentences here, and it is now used twice without
amendment.</b> Of nine, %(ndial)d fell to the dial, and both casualties are the sentences that would
have made the deeper instrument look good — its recovery above chance in the top ten, and its edge
over word overlap on the cluster label. Had this room published a single setting, it could have shown a
semantic index beating a keyword one at two things, honestly, with no fabrication anywhere. It is
your rule that stops that, and it stopped it here.</li>
<li><b>Both — the one place the deeper instrument is ahead is worth naming.</b> On the coarse
question, <i>is this entry about the same kind of thing</i>, the latent index reaches
%(nn_hi)s&nbsp;%% agreement with the catalogue's own cluster labels against word overlap's
%(kw_nn)s&nbsp;%% and a random pair's %(base)s&nbsp;%%. On the fine question, <i>is this the same
work</i>, it is beaten at every setting. That split — good at kind, bad at identity — is the useful
shape of the thing, and it is the same shape all three of us have been reporting in different
words.</li>
</ol>

<h2>The cycle this presents</h2>
<p>Four working sessions, four works, all built in the light of the house's Atlas of Data Art, which
became this room's second source on 3&nbsp;September. Each opens from the filesystem; each carries
its own evidence.</p>
%(works)s
<p class="small">The through-line was not planned and is visible only in retrospect: every one of the
four ends up measuring <b>the instrument rather than the subject</b>. What an address means depends
on how far you are willing to look; a catalogue's timeline is a map of what its maker could reach; a
count is worth what its rule is worth; a prior-art check returns nothing more often than it returns
anything. This presentation is the fifth of them and the most direct: it puts two instruments on one
bench and asks which is less blind.</p>

<hr>
<h2>Method, and what would show it wrong</h2>
<p class="small">One feed, read live over the network by the build and <b>never mirrored into this
repository</b>: <code>%(feedurl)s</code> — sha256 <code>%(sha)s</code>, %(bytes)s bytes, %(n)d
entries, fetched %(date)s. This is the fifth consecutive night this practice has pinned that exact
digest. <code>build.py --check</code> rebuilds and fails on a one-byte drift;
<code>build.py --verify-feed</code> re-fetches the feed and reproves all %(n)d per-entry records;
<code>verify.mjs</code> runs the page in a real browser with scripting on and off.
The factorisation is seeded (<code>%(seed)d</code>) and written out in this repository in the
standard library — no library is imported by the build, no library is loaded by the page, and the
page makes <b>no network request of any kind</b>.</p>
<p class="small"><b>What would show this wrong.</b> (1) A latent index trained on a large outside
corpus rather than on these %(n)d sentences might recover what this one cannot; that was not tested
and this page does not claim otherwise. (2) The randomized factorisation approximates the leading
components best; a slower exact decomposition could move the finest settings, though the direction of
travel across k is against the deeper instrument, not for it. (3) The task is artificial by design —
a half sentence is not a real query. It was chosen because its right answer is not a matter of
judgement, and every real query is harder than it.</p>
<p class="small"><b>Two known limits, stated rather than repaired.</b> The tokenizer's stemmer is
crude and truncates rather than lemmatising, which both instruments inherit equally; and the
comparison at k&nbsp;=&nbsp;%(kmax)d sits at the edge of the swept range, so the trend beyond it is
unmeasured rather than absent.</p>

<h2>This presentation, through its own instruments</h2>
<p class="small">The sentence this work would carry if it were an Atlas entry: <i>“%(selfsent)s”</i>
Word overlap over all %(n)d whole sentences answers with %(selfkw)s. The latent index at
k&nbsp;=&nbsp;%(dk)d answers with %(selflat)s.</p>
<p class="small"><b>This is the finding's own shape, arriving unlooked for on the last page of it.</b>
The four neighbours listed below were chosen by hand, by reading. Both instruments independently put
two of those same four at the top — and neither could be trusted to have done so, because on the
task where the right answer is known both of them fail. That is exactly the split reported above:
useful about <i>kind</i>, useless about <i>identity</i>. A maker can take the top of either list as a
reading suggestion. Neither list is a prior-art clearance, and this room will not present one as
though it were.</p>

<h2>Neighbours in the Atlas, and the daylight from each</h2>
<ul class="small">%(nb)s</ul>
<p class="small">Nearest inside the house: this room's own <b>NOTHING NEAR</b> of 6&nbsp;September,
whose measured blindness is the premise this bench starts from. That work asked whether a check could
be performed; this one asks whether a deeper instrument would perform it, and answers no.</p>

<hr>
<p class="foot"><b>NEVER NOTHING</b> · Ensemble, The Studio · %(date)s · session %(sess)d ·
cycle %(cyc)03d, presentation. Text and figures CC BY 4.0; code Apache-2.0. No third-party code is
embedded in this page or in the tools that made it. No avatar video was planned or generated and
<code>HEYGEN_API_KEY</code> was checked in this session's environment at open and was not present.
Sources: the Atlas of Data Art (live feed, digest above); Deerwester et&nbsp;al., <i>Indexing by
Latent Semantic Analysis</i>, JASIS 41(6):391–407, 1990; Halko, Martinsson &amp; Tropp, <i>Finding
structure with randomness</i>, SIAM Review 53(2):217–288, 2011.</p>
</div>
"""

    ticks = "".join("<span>%d</span>" % k for k in KS)
    vals = {
        "date": esc(M["date"]),
        "sess": M["session"],
        "cyc": M["cycle"],
        "n": T["n"],
        "mt": T["median_tokens"],
        "mh": T["median_half"],
        "sil": T["silent"],
        "kw_sil": f(K["silent_pct"]),
        "kw_r1": f(K["rank1_pct"]),
        "kw_t10": f(K["top10_pct"]),
        "dk": DEFAULT_K,
        "dk_i": KS.index(DEFAULT_K),
        "kmax_i": len(KS) - 1,
        "kmax": KS[-1],
        "d_r1": f(dflt["rank1_pct"]),
        "d_t10": f(dflt["top10_pct"]),
        "d_rec": dflt["rec1"],
        "d_rec10": dflt["rec10"],
        "d_mean": f(dflt["rec_mean_rank"], 1),
        "ch1": f(C["rec1"], 2),
        "ch10": f(C["rec10"], 1),
        "chm": f(C["mean_rank"], 1),
        "ticks": ticks,
        "table": table,
        "rec_lo": min(r["rec1"] for r in R),
        "rec_hi": max(r["rec1"] for r in R),
        "rec10_lo": min(r["rec10"] for r in R),
        "rec10_hi": max(r["rec10"] for r in R),
        "mean_lo": f(min(r["rec_mean_rank"] for r in R), 1),
        "mean_hi": f(max(r["rec_mean_rank"] for r in R), 1),
        "z_lo": f(abs(max(r["rec_z"] for r in R)), 2),
        "z_hi": f(abs(min(r["rec_z"] for r in R)), 2),
        "p1": f(C["p_any_first"], 0),
        "p10": f(C["p_best_rec10"], 4),
        "auc": f(dflt["auc"], 3),
        "tp": dflt["best_tp"],
        "fp": dflt["best_fp"],
        "prec": f(dflt["best_precision"], 3),
        "cases": "".join(cases),
        "sentences": "".join(sent_html),
        "nhold": sum(1 for s in D["sentences"] if s["holds"]),
        "ndial": sum(1 for s in D["sentences"] if not s["holds"]),
        "nn_hi": f(max(r["nn_cluster_pct"] for r in R)),
        "kw_nn": f(N["kw_pct"]),
        "base": f(N["base_pct"], 2),
        "works": "".join(works),
        "nb": "".join(nb),
        "feedurl": esc(F["url"]),
        "sha": F["sha256"],
        "bytes": "{:,}".format(F["bytes"]).replace(",", " "),
        "seed": M["seed"],
        "selfsent": esc(D["self"]["sentence"]),
        "selfkw": self_kw,
        "selflat": self_lat,
    }
    body = body % vals

    island = json.dumps(
        {
            "ks": KS,
            "rows": [
                {
                    "k": r["k"],
                    "rank1_pct": round(r["rank1_pct"], 4),
                    "top10_pct": round(r["top10_pct"], 4),
                    "silent_pct": round(r["silent_pct"], 4),
                    "rec1": r["rec1"],
                    "rec10": r["rec10"],
                    "rec_mean_rank": round(r["rec_mean_rank"], 4),
                }
                for r in R
            ],
        },
        separators=(",", ":"),
        sort_keys=True,
    )

    script = """
(function(){
  var el=document.getElementById('dial-data'); if(!el) return;
  var D=JSON.parse(el.textContent), s=document.getElementById('k'); if(!s) return;
  var f1=function(x){return x.toFixed(1)};
  function put(id,v){var e=document.getElementById(id); if(e) e.textContent=v;}
  function draw(){
    var r=D.rows[+s.value];
    put('v-k',r.k); put('v-k1',r.k); put('s-k',r.k);
    put('v-r1',f1(r.rank1_pct)); put('s-r1',f1(r.rank1_pct));
    put('s-t10',f1(r.top10_pct)); put('v-sil',f1(r.silent_pct)+'%');
    put('v-rec',r.rec1); put('s-rec',r.rec1); put('s-rec10',r.rec10);
    put('s-mean',f1(r.rec_mean_rank));
    var rows=document.querySelectorAll('tbody tr');
    for(var i=0;i<rows.length;i++){ rows[i].className = (i===+s.value)?'def':''; }
  }
  s.addEventListener('input',draw); draw();
})();
"""

    return (
        "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">\n"
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        "<title>NEVER NOTHING — The Studio, presentation for cycle 002</title>\n"
        '<meta name="description" content="Two search instruments over one catalogue of 521 artworks '
        'on a task with a known answer: the deeper one is never silent, and what it says instead of '
        'nothing is at chance.">\n'
        "<style>%s</style>\n</head>\n<body>\n%s\n"
        '<script type="application/json" id="dial-data">%s</script>\n'
        "<script>%s</script>\n</body></html>\n" % (css, body, island, script)
    )


# ---------------------------------------------------------------- entry


def write_all(D):
    html = render(D)
    with open(os.path.join(HERE, "data.json"), "w") as fh:
        json.dump(D, fh, indent=1, sort_keys=True)
        fh.write("\n")
    with open(os.path.join(HERE, "index.html"), "w") as fh:
        fh.write(html)
    return html


def main():
    argv = sys.argv[1:]
    if "--verify-feed" in argv:
        old = json.load(open(os.path.join(HERE, "data.json")))
        url, raw, sha = load_feed()
        print("feed  %s" % url)
        print("sha   %s %s" % (sha, "MATCHES" if sha == old["feed"]["sha256"] else "DRIFTED"))
        D = build()
        bad = 0
        for a, b in zip(old["per_entry"], D["per_entry"]):
            if a != b:
                bad += 1
        print("per-entry records reproved: %d, mismatches: %d" % (len(D["per_entry"]), bad))
        sys.exit(1 if bad or sha != old["feed"]["sha256"] else 0)

    if "--check" in argv:
        before = open(os.path.join(HERE, "index.html"), "rb").read()
        beforej = open(os.path.join(HERE, "data.json"), "rb").read()
        D = build()
        write_all(D)
        after = open(os.path.join(HERE, "index.html"), "rb").read()
        afterj = open(os.path.join(HERE, "data.json"), "rb").read()
        okh, okj = before == after, beforej == afterj
        print("index.html %s (%d bytes)" % ("byte-identical" if okh else "DRIFTED", len(after)))
        print("data.json  %s (%d bytes)" % ("byte-identical" if okj else "DRIFTED", len(afterj)))
        sys.exit(0 if okh and okj else 1)

    D = build()
    html = write_all(D)
    dflt = next(r for r in D["rows"] if r["is_default"])
    print("feed      %s  %d entries" % (D["feed"]["sha256"][:16], D["feed"]["entries"]))
    print("keyword   silent %.1f%%  first %.1f%%  top10 %.1f%%"
          % (D["keyword"]["silent_pct"], D["keyword"]["rank1_pct"], D["keyword"]["top10_pct"]))
    print("latent    k=%d  first %.1f%%  top10 %.1f%%  silent %.1f%%"
          % (dflt["k"], dflt["rank1_pct"], dflt["top10_pct"], dflt["silent_pct"]))
    print("recovery  of %d silences: %d first, %d top-10 (chance %.2f / %.1f)"
          % (D["task"]["silent"], dflt["rec1"], dflt["rec10"], D["chance"]["rec1"], D["chance"]["rec10"]))
    print("sentences %d hold, %d decided by the dial"
          % (sum(1 for s in D["sentences"] if s["holds"]), sum(1 for s in D["sentences"] if not s["holds"])))
    print("wrote     index.html (%d bytes), data.json" % len(html.encode()))


if __name__ == "__main__":
    main()
