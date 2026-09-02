"""Label normalisation for the convergence rule.

A label becomes a list of comparable tokens: accents folded, case folded, underscores and
hyphens split, spaceless CamelCase hashtags split, function words and one-character tokens
dropped. The rule is deliberately simple and disclosed: no model, no embeddings."""
from __future__ import annotations

import re
import unicodedata

from trending.data import load_json

STOPWORDS: frozenset[str] = frozenset(load_json("stopwords.json"))

_CAMEL = re.compile(r"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])")
_WORD = re.compile(r"[^\W_]+", re.UNICODE)


def fold(text: str) -> str:
    """Strip diacritics: 'Páez' → 'Paez', 'Bültge' → 'Bultge'."""
    decomposed = unicodedata.normalize("NFKD", text)
    return "".join(c for c in decomposed if not unicodedata.combining(c))


def tokens(label: str) -> list[str]:
    s = fold(label).replace("_", " ").replace("-", " ")
    if " " not in s.strip():
        s = _CAMEL.sub(" ", s)  # 'TextureTuesday' → 'Texture Tuesday'
    words = _WORD.findall(s.casefold())
    return [w for w in words if len(w) > 1 and w not in STOPWORDS]


def slug(label: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", fold(label).casefold()).strip("-")
    return s[:80] or "topic"


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)
