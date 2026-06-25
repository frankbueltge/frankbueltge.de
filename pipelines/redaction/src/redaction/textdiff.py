"""Sentence-level removal diff. Removals only — additions are noted elsewhere,
they are not the subject (redaction = taking away)."""
from __future__ import annotations

import difflib
import re
from dataclasses import dataclass

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENT_SPLIT.split(text.strip()) if s.strip()]


@dataclass(frozen=True)
class Removal:
    passages: list[str]
    tokens: int


def removed(before: str, after: str) -> Removal:
    a, b = _sentences(before), _sentences(after)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    passages: list[str] = []
    for tag, i1, i2, _j1, _j2 in sm.get_opcodes():
        if tag in ("delete", "replace"):
            passages.extend(a[i1:i2])
    tokens = sum(len(p.split()) for p in passages)
    return Removal(passages=passages, tokens=tokens)
