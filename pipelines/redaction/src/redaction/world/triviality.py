"""The triviality filter — the method core of the world chamber, versioned.

Separates the three classes the 2026-08-14 spike found in the GDG's title
rewrites, plus one disclosure class:

  trivial    — encoding/case/whitespace fixes, site-name affixes, truncations
  update     — running updates: only numbers changed (casualty counts revised)
  reframing  — content words exchanged in place: the register's material
  replaced   — almost no lexical continuity; page reuse cannot be excluded,
               so these are counted apart, never shown as reframings

Fully deterministic, no model in the loop — the filter itself must be
auditable (the MediaSpin taxonomy, ICWSM 2026, is the academic benchmark the
method sheet cites; this v1 is deliberately coarser and rule-based).
"""
from __future__ import annotations

import html
import re
import unicodedata
from collections import Counter
from dataclasses import dataclass

TRIVIAL = "trivial"
UPDATE = "update"
REFRAMING = "reframing"
REPLACED = "replaced"

# Affix separators publishers use for site names ("Story headline - CNN").
_SEPARATORS = (" - ", " | ", " – ", " — ", " :: ", " » ", " • ", " / ")

# A token that is a bare figure: digits with grouping/decimal/percent/time glue.
_NUMERIC = re.compile(r"^\d[\d.,:%]*$")

_WORD = re.compile(r"[^\W_]+", re.UNICODE)

# Continuity floor: below this token-set similarity a rewrite is a replacement.
_REPLACED_FLOOR = 0.2

# Rolling-coverage markers: a liveblog/ticker retitles itself all day — that
# is running coverage by form, never a silent reframing. Disclosed trade-off:
# a genuine headline containing "live" is misfiled as update (rare, accepted).
_TICKER = re.compile(r"\b(live|liveblog|live blog|highlights|as it happened)\b", re.I)

# Function words: exchanging them is copy-editing, not reframing. English only,
# matching the en-filtered stream.
STOPWORDS = frozenset(
    "a an the in on at of for to from by with as is are was were be been being "
    "and or but nor so yet after before over under into onto amid among per via "
    "its his her their this that these those it he she they we you i who whom "
    "up down out off about against between during without within than then "
    "will would could should may might must can cannot has have had do does "
    "did not no s t".split()
)


@dataclass(frozen=True)
class Verdict:
    cls: str
    reason: str
    removed: tuple[str, ...] = ()   # tokens only in the old title (original casing)
    added: tuple[str, ...] = ()     # tokens only in the new title (original casing)
    similarity: float = 1.0


def normalize(title: str) -> str:
    t = unicodedata.normalize("NFC", html.unescape(title))
    t = re.sub(r"<[^>]*>", "", t)  # GDG titles occasionally carry stray markup
    return re.sub(r"\s+", " ", t).strip()


def tokens(title: str) -> list[str]:
    return _WORD.findall(title)


def _fold(t: str) -> str:
    return t.casefold()


def _affix_cores(title: str) -> set[str]:
    """The title itself plus every variant with one leading/trailing affix
    segment removed — 'Headline - CNN' and 'CNN | Headline' both yield
    'Headline'. Only short affixes qualify; a long "affix" is content."""
    cores = {_fold(title)}
    for sep in _SEPARATORS:
        if sep not in title:
            continue
        head, _, tail = title.rpartition(sep)
        if head and len(tail) <= 40:
            cores.add(_fold(head))
        head, _, tail = title.partition(sep)
        if tail and len(head) <= 40:
            cores.add(_fold(tail))
    return cores


def _strip_ellipsis(t: str) -> str:
    return t.rstrip(".… ").strip()


def _multiset_diff(a: list[str], b: list[str]) -> tuple[str, ...]:
    """Tokens of `a` not covered by `b`, folded comparison, original casing kept."""
    budget = Counter(_fold(t) for t in b)
    out: list[str] = []
    for tok in a:
        f = _fold(tok)
        if budget[f] > 0:
            budget[f] -= 1
        else:
            out.append(tok)
    return tuple(out)


def classify(before: str, after: str) -> Verdict:
    b, a = normalize(before), normalize(after)

    if _fold(b) == _fold(a):
        reason = "identical after normalization" if b == a else "case only"
        return Verdict(TRIVIAL, reason)

    if _affix_cores(b) & _affix_cores(a):
        return Verdict(TRIVIAL, "site-name affix")

    # Truncation is trivial only when an ellipsis shows a display cut — a
    # headline *extended* by a clause is a content change, not a truncation.
    had_ellipsis = b != _strip_ellipsis(b) or a != _strip_ellipsis(a)
    sb, sa = _fold(_strip_ellipsis(b)), _fold(_strip_ellipsis(a))
    if had_ellipsis and sb and sa and (sb.startswith(sa) or sa.startswith(sb)):
        return Verdict(TRIVIAL, "truncation")

    tb, ta = tokens(b), tokens(a)
    removed = _multiset_diff(tb, ta)
    added = _multiset_diff(ta, tb)
    if not removed and not added:
        return Verdict(TRIVIAL, "punctuation/spacing only")

    union = {_fold(t) for t in tb} | {_fold(t) for t in ta}
    inter = {_fold(t) for t in tb} & {_fold(t) for t in ta}
    similarity = len(inter) / len(union) if union else 0.0

    if _TICKER.search(b) or _TICKER.search(a):
        return Verdict(UPDATE, "rolling coverage marker", removed, added, similarity)

    substantive = [t for t in (*removed, *added) if _fold(t) not in STOPWORDS]
    if not substantive:
        return Verdict(TRIVIAL, "function words only", removed, added, similarity)
    if all(_NUMERIC.match(t) for t in substantive):
        return Verdict(UPDATE, "only numbers changed", removed, added, similarity)

    if similarity < _REPLACED_FLOOR:
        return Verdict(REPLACED, "no lexical continuity", removed, added, similarity)

    return Verdict(REFRAMING, "content words exchanged", removed, added, similarity)
