"""Counting phrases over a corpus of titles — the arithmetic under discovery.

A document here is a title, plus for a repository its short description (never more than the
200 characters the day file already keeps, and never an article body). It is tokenised by the
same disclosed rule the convergence uses (`normalize.tokens`: diacritics folded, casefolded,
hyphens split, function words dropped) and turned into the set of its bigrams and trigrams
over adjacent kept tokens.

Two properties matter for the record and are enforced here, not left to the caller:
counting is by DOCUMENT — a phrase repeated in one title counts once — and documents are
deduped by url, so a story two platforms carry counts once per platform and never twice for
the same link. No model, no embeddings, no weighting: a count is a count.
"""
from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass, field

from trending.normalize import tokens

SIZES = (2, 3)
MIN_TOKEN_CHARS = 3  # "ai", "ml", "js" never form a phrase on their own


def phrases(text: str, *, sizes: tuple[int, ...] = SIZES,
            min_token_chars: int = MIN_TOKEN_CHARS) -> set[str]:
    """The distinct bigrams and trigrams of one document, as space-joined phrases.

    A phrase that contains a token shorter than `min_token_chars` is dropped whole: the
    two-letter words of this field ("ai", "ml") pair with everything and would flood the
    ranking with noise.
    """
    toks = tokens(text)
    out: set[str] = set()
    for n in sizes:
        for i in range(len(toks) - n + 1):
            window = toks[i:i + n]
            if any(len(t) < min_token_chars for t in window):
                continue
            out.add(" ".join(window))
    return out


@dataclass(frozen=True)
class Document:
    """One corpus item as its platform lists it. Titles, urls and dates only."""
    platform: str
    title: str
    url: str
    date: str  # YYYY-MM-DD
    extra: str = ""  # repository description, already truncated by the caller
    # What makes two items the same item. Defaults to the url, which is right for a live
    # feed; the archive sets `date|url`, because the same link listed on ten days is ten
    # sightings and collapsing them would erase exactly the persistence being measured.
    key: str = ""

    @property
    def text(self) -> str:
        return f"{self.title} {self.extra}".strip()

    @property
    def dedupe_key(self) -> str:
        return self.key or self.url


@dataclass
class Tally:
    """One phrase, counted in two windows. `platforms` and `sample` come from the recent
    window: what the machine noticed *now*, and one link that shows what it means."""
    ngram: str
    docs_recent: int = 0
    docs_prior: int = 0
    platforms: set[str] = field(default_factory=set)
    sample: Document | None = None


def tally(docs: Iterable[Document], *, recent_from: str,
          sizes: tuple[int, ...] = SIZES,
          min_token_chars: int = MIN_TOKEN_CHARS) -> dict[str, Tally]:
    """Count documents per phrase in the recent window (`date >= recent_from`) and the prior
    one. Documents are deduped by their key (the url unless the caller says otherwise), the
    newest kept; the sample of a phrase is the newest recent document carrying it."""
    counted: dict[str, Tally] = {}
    seen: set[str] = set()
    for doc in sorted(docs, key=lambda d: (d.date, d.url), reverse=True):
        if doc.dedupe_key in seen:
            continue
        seen.add(doc.dedupe_key)
        recent = doc.date >= recent_from
        for ngram in phrases(doc.text, sizes=sizes, min_token_chars=min_token_chars):
            item = counted.get(ngram)
            if item is None:
                item = counted[ngram] = Tally(ngram=ngram)
            if recent:
                item.docs_recent += 1
                item.platforms.add(doc.platform)
                if item.sample is None:
                    item.sample = doc
            else:
                item.docs_prior += 1
    return counted
