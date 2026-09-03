"""Wikipedia — the most-read articles of the newest published day, in six languages.

English and German first, because the rest of the house reads in those two and `as_of` is
taken from the English edition; then French, Spanish, Japanese and Portuguese, so that what
is read in one language can be told apart from what is read everywhere.

The Wikimedia top-pageviews endpoint publishes a day with a lag, so the newest available of
the last four days is used and named in `as_of`. Namespace pages, a small stoplist of
perennials and — once the archive holds enough days — anything that sits in the top list
most days are dropped: the instrument wants what surfaces, not what is always there."""
from __future__ import annotations

from datetime import timedelta
from urllib.parse import quote

from trending.archive import wikipedia_presence
from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

LANGS = ("en", "de", "fr", "es", "ja", "pt")
BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/{lang}.wikipedia/all-access"
LOOKBACK_DAYS = 4
# The canonical main-page titles AND the bare redirects that point at them: de.wikipedia's
# top list carries "Hauptseite" beside "Wikipedia:Hauptseite", and a redirect collects
# hundreds of thousands of views of its own. The day's self-check caught this on the first
# real run of the six-language reader (2026-09-03, wikipedia_filter_held), which is what a
# rubric is for.
SKIP_EXACT = frozenset({"Main_Page", "Wikipedia:Hauptseite", "Wikipédia:Accueil_principal",
                        "Wikipedia:Portada", "メインページ", "Wikipédia:Página_principal", "-",
                        "Hauptseite", "Accueil_principal", "Portada", "Página_principal",
                        "Main_page", "Wikipedia:Main_Page", "Wikipedia:メインページ"})
# Every edition's own namespace names, so that a search page or a portal is never mistaken
# for something the world read today.
SKIP_PREFIXES = ("Special:", "Spezial:", "Spécial:", "Especial:", "特別:",
                 "Wikipedia:", "Wikipédia:", "Portal:", "Portail:",
                 "File:", "Datei:", "Fichier:", "Archivo:", "Ficheiro:", "ファイル:",
                 "Help:", "Hilfe:", "Aide:", "Ayuda:", "Ajuda:",
                 "Talk:", "Diskussion:", "Discussion:", "Discusión:", "Discussão:", "ノート:",
                 "User:", "Benutzer:", "Utilisateur:", "Usuario:", "Usuário:", "利用者:",
                 "Template:", "Vorlage:", "Modèle:", "Plantilla:", "Predefinição:",
                 "MediaWiki:", "Category:", "Kategorie:", "Catégorie:", "Categoría:",
                 "Categoria:", "カテゴリ:")


def _newest_day(ctx: Context, lang: str):
    last: Exception | None = None
    for back in range(1, LOOKBACK_DAYS + 1):
        day = ctx.today - timedelta(days=back)
        url = f"{BASE.format(lang=lang)}/{day.year}/{day.month:02d}/{day.day:02d}"
        try:
            data = fetch(url, client=ctx.client, expect="json")
        except SourceUnavailable as exc:
            last = exc
            continue
        return day, data["items"][0]["articles"]
    raise SourceUnavailable(
        f"{lang}: no published day in the last {LOOKBACK_DAYS} (last: {last})"[:160])


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    as_of: str | None = None
    novelty_days = int(ctx.rules.get("novelty_days", 14))
    max_presence = int(ctx.rules.get("novelty_max_presence", 7))
    top_n = int(ctx.rules.get("wikipedia_top", 50))
    for lang in LANGS:
        try:
            day, articles = _newest_day(ctx, lang)
        except SourceUnavailable as exc:
            notes.append(str(exc)[:160])
            continue
        presence = None
        if len(ctx.archive) >= novelty_days:
            presence = wikipedia_presence(ctx.archive[-novelty_days:], lang)
        kept = []
        for art in articles:
            name = art.get("article") or ""
            if not name or name in SKIP_EXACT or name.startswith(SKIP_PREFIXES):
                continue
            if name in ctx.stoplist:
                continue
            if presence is not None and presence.get(name, 0) >= max_presence:
                continue
            kept.append(art)
            if len(kept) >= top_n:
                break
        for rank, art in enumerate(kept, 1):
            name = art["article"]
            signals.append(Signal(
                source="wikipedia", label=name.replace("_", " "), rank=rank,
                magnitude=int(art.get("views") or 0), magnitude_unit="views",
                url=f"https://{lang}.wikipedia.org/wiki/{quote(name)}", geo=lang,
                meta={"lang": lang, "as_of": day.isoformat(), "rank_raw": art.get("rank"),
                      "article": name},
            ))
        if as_of is None or lang == "en":
            as_of = day.isoformat()
    return SourceResult(signals, as_of=as_of, notes=notes)


SPEC = SourceSpec(
    id="wikipedia", name="Wikipedia — most-read articles (Wikimedia Pageviews API)",
    url="https://wikimedia.org/api/rest_v1/",
    licence="CC0 (pageview counts); article titles CC BY-SA 4.0",
    fetch=fetch_source,
)
