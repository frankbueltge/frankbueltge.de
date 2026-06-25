"""Symbolic, auditable salience: does the removed text carry weight?

No LLM. Every weight is disclosed and versioned (SALIENCE_VERSION). The salience
GATES the daily ranking: a content-empty boilerplate removal scores 0 and can
never win, however many tokens it spans.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

WEIGHTS: dict[str, int] = {
    "number": 2,
    "date": 2,
    "named_entity": 1,
    "negation": 2,
    "commitment_verb": 3,
}
CAP = 5  # occurrences of one signal counted at most CAP times

_NUMBER = re.compile(
    r"(?<!\w)\d[\d.,]*\s?(?:%|percent|prozent|mio|million|millionen|mrd|billion|bn)?",
    re.I,
)
_DATE = re.compile(
    r"\b(?:19|20)\d{2}\b"
    r"|\b\d{1,2}\.\s?\d{1,2}\.\s?(?:19|20)\d{2}\b"
    r"|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec"
    r"|januar|februar|märz|mai|juni|juli|oktober|dezember)\b",
    re.I,
)
_NEGATION = re.compile(
    r"\b(?:no|not|never|none|kein|keine|keinen|nicht|niemals)\b", re.I
)
_COMMIT = re.compile(
    r"\b(?:will|shall|must|commit|commits|committed|pledge|pledged|pledges"
    r"|wird|werden|muss|müssen|soll|sollen|verpflichtet)\b",
    re.I,
)
_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")
_CAPWORD = re.compile(r"[A-ZÄÖÜ][\wÄÖÜäöüß]+")


@dataclass(frozen=True)
class Salience:
    score: int = 0
    signals: list[str] = field(default_factory=list)


def _named_entity_count(text: str) -> int:
    """Capitalised words that are not sentence-initial (a deliberately simple,
    auditable heuristic for named entities)."""
    n = 0
    for sent in _SENT_SPLIT.split(text):
        words = sent.split()
        for w in words[1:]:  # skip the first word of each sentence
            if _CAPWORD.match(w):
                n += 1
    return n


def score(text: str) -> Salience:
    counts = {
        "number": len(_NUMBER.findall(text)),
        "date": len(_DATE.findall(text)),
        "negation": len(_NEGATION.findall(text)),
        "commitment_verb": len(_COMMIT.findall(text)),
        "named_entity": _named_entity_count(text),
    }
    signals = sorted(k for k, v in counts.items() if v > 0)
    total = sum(WEIGHTS[k] * min(counts[k], CAP) for k in signals)
    return Salience(score=total, signals=signals)
