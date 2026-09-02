"""User-agent classification: a closed vocabulary, first match wins, only the matched
table token is ever stored. A browser is a class, never a string."""
from __future__ import annotations

import re

CLASSES = ("browser", "search", "ai-retrieval", "ai-user-fetch", "ai-training", "other-bot")

TABLE: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("ai-user-fetch", ("ChatGPT-User", "Claude-User", "Perplexity-User", "meta-externalfetcher",
                       "MistralAI-User")),
    ("ai-retrieval", ("OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "DuckAssistBot",
                      "YouBot")),
    ("ai-training", ("GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Bytespider",
                     "meta-externalagent", "Diffbot", "Amazonbot", "cohere-ai", "PanguBot",
                     "Timpibot", "ImagesiftBot", "omgili", "Applebot-Extended",
                     "Google-Extended")),
    ("search", ("Googlebot", "Bingbot", "Applebot", "DuckDuckBot", "YandexBot", "Baiduspider",
                "Slurp", "SeznamBot", "PetalBot", "Qwantify")),
    # Named readers and HTTP libraries first, the generic words last: "Feedly" must not be
    # recorded as "feed", nor "node-fetch" as "fetch" — the archive holds the most specific
    # token the table knows.
    ("other-bot", ("python-requests", "Go-http-client", "node-fetch", "Feedly", "Inoreader",
                   "NewsBlur", "Miniflux", "libwww", "httpx", "curl/", "Wget", "axios", "okhttp",
                   "crawler", "spider", "crawl", "bot", "fetch", "feed")),
)

_ARCHIVE = re.compile(r"^/trending/\d{4}-\d{2}-\d{2}/?$")


def classify(user_agent: str | None) -> tuple[str, str | None]:
    """→ (class, table token or None). Never returns any part of the input string."""
    low = (user_agent or "").lower()
    for cls, toks in TABLE:
        for tok in toks:
            if tok.lower() in low:
                return cls, tok
    return "browser", None


def path_kind(path: str | None) -> str:
    p = (path or "").split("?", 1)[0]
    if p in ("/trending", "/trending/"):
        return "page"
    if _ARCHIVE.match(p):
        return "archive"
    if p.endswith(".json"):
        return "json"
    if p.endswith("feed.xml"):
        return "feed"
    if p.endswith("latest.md"):
        return "md"
    return "other"
