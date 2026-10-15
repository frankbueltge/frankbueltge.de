#!/usr/bin/env python3
"""The matcher: does this quotation occur in this paper, and how much of it does.

One instrument, used for the measurement and for its own two controls. It is
deliberately permissive, because the number this session reports is a count of
quotations that are NOT in their paper, and every permissive choice makes that
number smaller:

  - normalisation drops ALL punctuation and case, so a delegate's smart quotes,
    a renderer's en-dashes and a PDF's ligatures cannot separate two identical
    sentences;
  - line-break hyphenation is repaired before words are split;
  - ground truth is the UNION of every rendering of the paper (see
    groundtruth.py), and a quotation present in any one of them is present.

`coverage(quote, text)` is the length of the longest contiguous run of the
quotation's words that occurs contiguously in the text, divided by the
quotation's length in words. 1.0 means the whole quotation is there verbatim.
0.25 means a quarter of it, in one piece, is there and the rest is not.
"""
import re
import unicodedata

LIG = {"ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi",
       "ﬄ": "ffl", "ﬅ": "st", "ﬆ": "st"}


def norm(s):
    """Lower-case, de-ligatured, de-hyphenated, alphanumeric words only."""
    if not s:
        return ""
    for a, b in LIG.items():
        s = s.replace(a, b)
    s = unicodedata.normalize("NFKD", s)
    # a hyphen at a line break is a typesetting artefact, not a word
    s = re.sub(r"[-‐-―−]\s*\n\s*", "", s)
    s = re.sub(r"[-‐-―−]\s+", " ", s)
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def words(s):
    return norm(s).split()


def coverage(quote, text):
    """Longest contiguous run of `quote` present in `text`, as a share of quote."""
    q = words(quote)
    if not q:
        return None
    hay = " " + " ".join(words(text)) + " "
    n = len(q)

    def fits(k):
        for i in range(0, n - k + 1):
            if " " + " ".join(q[i:i + k]) + " " in hay:
                return True
        return False

    if not fits(1):
        return 0.0
    lo, hi = 1, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if fits(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo / n


def best_coverage(quote, texts):
    vals = [coverage(quote, t) for t in texts]
    vals = [v for v in vals if v is not None]
    return max(vals) if vals else None


STOP = set("""a an the and or but if while of to in on at by for with from as is
are was were be been being it its this that these those which who whom whose we
our us they their them he she his her you your i not no nor so than then there
here into over under between among during about against above below up down out
off again further more most other some such only own same too very can will just
do does did doing have has had having may might must shall should would could""".split())


def content_words(s):
    return [w for w in words(s) if w not in STOP and len(w) > 2]


def content_overlap(quote, texts):
    """Share of the quotation's content words occurring anywhere in the paper."""
    cw = content_words(quote)
    if not cw:
        return None
    hay = set()
    for t in texts:
        hay |= set(words(t))
    return sum(1 for w in cw if w in hay) / len(cw)
