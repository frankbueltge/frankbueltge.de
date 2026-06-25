"""Main-text extraction. Heuristic by nature (disclosed in the Methodenblatt;
version-pinned via the trafilatura dependency). Isolated behind one function so
it is swappable. Falls back to a stdlib tag-strip when trafilatura is absent."""
from __future__ import annotations

import re
from html.parser import HTMLParser

_WS = re.compile(r"\s+")


def _collapse(text: str) -> str:
    return _WS.sub(" ", text).strip()


class _Strip(HTMLParser):
    _SKIP = {"script", "style", "nav", "header", "footer", "aside", "noscript", "title", "head"}

    def __init__(self) -> None:
        super().__init__()
        self._skip = 0
        self._buf: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in self._SKIP:
            self._skip += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in self._SKIP and self._skip:
            self._skip -= 1

    def handle_data(self, data: str) -> None:
        if not self._skip:
            self._buf.append(data)

    def text(self) -> str:
        return _collapse(" ".join(self._buf))


def _fallback(html: str) -> str:
    p = _Strip()
    p.feed(html)
    return p.text()


def main_text(html: str) -> str:
    if not html or not html.strip():
        return ""
    try:
        import trafilatura

        out = trafilatura.extract(html, include_comments=False, include_tables=False)
        if out and out.strip():
            return _collapse(out)
    except Exception:
        pass
    return _fallback(html)
