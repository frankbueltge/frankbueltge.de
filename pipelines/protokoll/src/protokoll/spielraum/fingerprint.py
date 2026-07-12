"""Fingerprint einer Report-Landingpage — NUR Regex, kein bs4/lxml (pyproject hat bewusst
nur httpx als Abhängigkeit).

Erfasst zwei Signale, die auf einen neuen/aktualisierten Bericht hindeuten:
  (a) href-Werte, die auf .pdf enden oder einen report-artigen Pfad enthalten
      (report|environmental|sustainability|data-index|fact-sheet, case-insensitiv);
  (b) Jahres-Tokens (2025–2039) und Fiskal-Tokens (FY25–FY29) im sichtbaren Text
      (Tags grob herausgeschnitten — kein echtes HTML-Parsing).

Grenze (bewusst in Kauf genommen): ein blankes Jahres-Token — z. B. „© 2026" im
Footer — matcht Regel (b) genauso wie ein echter Report-Verweis. Das kann einen
Fingerprint-Wechsel ohne neuen Report auslösen (falscher Alarm). Reine Nav-/Label-
Änderungen ohne Report-Link und ohne Jahres-/Fiskal-Token bewegen den Fingerprint
dagegen NICHT — das ist der Fall, den dieses Modul zuverlässig abdeckt.
"""
from __future__ import annotations

import hashlib
import re

_HREF_RE = re.compile(r'href\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
_REPORT_PATH_RE = re.compile(r"report|environmental|sustainability|data-index|fact-sheet",
                              re.IGNORECASE)
_TAG_RE = re.compile(r"<[^>]+>")
_YEAR_RE = re.compile(r"\b20(2[5-9]|3[0-9])\b")
_FISCAL_RE = re.compile(r"\bFY2[5-9]\b", re.IGNORECASE)


def extract_fingerprint(html: str) -> tuple[list[str], str]:
    hrefs: set[str] = set()
    for raw in _HREF_RE.findall(html):
        href = raw.split("?", 1)[0].strip().lower()  # Query-String abschneiden, normalisieren
        if href.endswith(".pdf") or _REPORT_PATH_RE.search(href):
            hrefs.add(href)

    text = _TAG_RE.sub(" ", html)  # grobe Tag-Entfernung, genug für Text-Tokens
    tokens: set[str] = set()
    tokens.update(m.group(0).lower() for m in _YEAR_RE.finditer(text))
    tokens.update(m.group(0).lower() for m in _FISCAL_RE.finditer(text))

    matches = sorted(hrefs | tokens)
    fingerprint = hashlib.sha256("\n".join(matches).encode("utf-8")).hexdigest()
    return matches, fingerprint
