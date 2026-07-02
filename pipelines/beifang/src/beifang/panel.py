"""Einmal-Werkzeug: baut data/panel.json (Spec §3) aus Crossref-Abfragen.

Panel-Änderungen sind bewusste, committete Edits mit Log-Eintrag — nie automatisch.
Aufruf: pipelines/beifang/.venv/bin/python -m beifang.panel
"""
from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx

from beifang.classify import registrable_domain

DATA_DIR = Path(__file__).resolve().parent / "data"
PANEL_PATH = DATA_DIR / "panel.json"
API = "https://api.crossref.org"
USER_AGENT = "frankbueltge.de beifang-pipeline (hello@frankbueltge.de)"
CRITERION = ("Verlagsgruppe: je Verlag die 10 jüngsten Artikel des OA-Flaggschiff-Journals "
             "(Crossref, type journal-article) zum Aufnahmezeitpunkt. Kontrollgruppe: je Diamond-OA-Journal "
             "der jüngste Artikel; kommges fest: der Anlass-Artikel (Fadeeva et al. 2024).")

# (publisher-key, Crossref-Member-ID, Member-Name-Substring, Journal, ISSN, erwartete Domain, Anzahl)
VERLAGE = [
    ("elsevier", 78, "Elsevier", "Heliyon", "2405-8440", "sciencedirect.com", 10),
    ("springer-nature", 297, "Springer", "Scientific Reports", "2045-2322", "nature.com", 10),
    ("wiley", 311, "Wiley", "Advanced Science", "2198-3844", "wiley.com", 10),
    ("taylor-francis", 301, "Informa", "Cogent Social Sciences", "2331-1886", "tandfonline.com", 10),
    ("sage", 179, "SAGE", "SAGE Open", "2158-2440", "sagepub.com", 10),
]

# (journal-key, ISSN | None, fixe URL | None) — Diamond-OA-Kandidaten; bei ISSN wird der
# jüngste Artikel via Crossref gezogen und die Landing-Domain durch Redirect-Auflösung bestimmt.
KONTROLLE = [
    ("kommges", None, "https://journals.sub.uni-hamburg.de/hup2/kommges/article/view/1643"),
    ("first-monday", "1396-0466", None),
    ("internet-policy-review", "2197-6775", None),
    ("glossa", "2397-1835", None),
    ("joss", "2475-9066", None),
    ("jdsr", "2003-1998", None),
    ("jtei", "2162-5603", None),
    ("dhq", "1938-4122", None),
    ("olh", "2056-6700", None),
    ("computational-linguistics", "1530-9312", None),
]

# Dokumentierte Panel-Entscheidungen (landen in panel["log"]) — Tausche gegen die
# ursprünglichen Kandidaten, weil deren DOIs nicht bei Crossref registriert sind.
LOG = [
    {"date": "2026-07-02", "action": "swap",
     "note": ("Kontrolle: weizenbaum-journal (ISSN 2748-5625) -> jdsr (Journal of Digital Social "
              "Research, ISSN 2003-1998). Grund: WJDS-DOIs sind DataCite-registriert "
              "(Präfix 10.34669; Crossref /journals/2748-5625/works: 404, works-Filter issn: "
              "0 Treffer) — die Panel-Methodik ist Crossref-basiert. JDSR ist Diamond-OA "
              "(verlagsunabhängig, Umeå/DIGSUM, Hosting Kungliga biblioteket/publicera.kb.se, "
              "laut Journal-Site keine Gebühren) und thematisch äquivalent (digitale Gesellschaft).")},
    {"date": "2026-07-02", "action": "swap",
     "note": ("Kontrolle: zfdg (ISSN 2510-1358) -> jtei (Journal of the Text Encoding Initiative, "
              "ISSN 2162-5603). Grund: ZfdG-DOIs sind DataCite-registriert (Präfix 10.17175; "
              "Crossref /journals/2510-1358/works: 404, works-Filter issn: 0 Treffer). JTEI ist "
              "Diamond-OA (TEI-Konsortium, Hosting OpenEdition, laut Editorial Policies keine "
              "APCs) und thematisch äquivalent (Digital Humanities).")},
]


def load_panel() -> dict:
    return json.loads(PANEL_PATH.read_text(encoding="utf-8"))


def _latest_dois(client: httpx.Client, issn: str, rows: int) -> list[str]:
    # Maßvolle Retries: Crossref antwortet gelegentlich transient mit 5xx.
    for attempt in range(3):
        r = client.get(f"{API}/journals/{issn}/works",
                       params={"rows": rows, "sort": "published", "order": "desc",
                               "filter": "type:journal-article"})
        if r.status_code >= 500 and attempt < 2:
            time.sleep(5 * (attempt + 1))
            continue
        r.raise_for_status()
        return [it["DOI"] for it in r.json()["message"]["items"]][:rows]
    raise AssertionError("unreachable")


def _resolve_domain(client: httpx.Client, url: str) -> str:
    r = client.get(url, follow_redirects=True, timeout=45.0)
    return registrable_domain(r.url.host or "")


def main() -> int:
    today = datetime.now(timezone.utc).date().isoformat()
    entries: list[dict] = []
    with httpx.Client(headers={"User-Agent": USER_AGENT}, timeout=45.0) as client:
        for key, member_id, name_sub, journal, issn, domain, n in VERLAGE:
            member = client.get(f"{API}/members/{member_id}"); member.raise_for_status()
            assert name_sub.lower() in member.json()["message"]["primary-name"].lower(), \
                f"Member {member_id} ist nicht {name_sub}"
            for i, doi in enumerate(_latest_dois(client, issn, n), start=1):
                entries.append({"id": f"{key}-{i:02d}", "group": "verlag", "publisher": key,
                                "journal": journal, "issn": issn, "doi": doi,
                                "url": f"https://doi.org/{doi}", "expected_domain": domain,
                                "added": today})
        for key, issn, fixed_url in KONTROLLE:
            if fixed_url:
                entries.append({"id": f"{key}-01", "group": "kontrolle", "publisher": key,
                                "journal": key, "issn": issn, "doi": None, "url": fixed_url,
                                "expected_domain": _resolve_domain(client, fixed_url), "added": today})
                continue
            doi = _latest_dois(client, issn, 1)[0]
            url = f"https://doi.org/{doi}"
            entries.append({"id": f"{key}-01", "group": "kontrolle", "publisher": key,
                            "journal": key, "issn": issn, "doi": doi, "url": url,
                            "expected_domain": _resolve_domain(client, url), "added": today})
    panel = {"version": today, "criterion": CRITERION, "log": LOG, "entries": entries}
    PANEL_PATH.write_text(json.dumps(panel, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                          encoding="utf-8")
    for e in entries:
        print(f"{e['id']:28s} {e['expected_domain']:24s} {e['url']}")
    print(f"\ngeschrieben: {PANEL_PATH} ({len(entries)} Einträge)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
