#!/usr/bin/env python3
"""
The Consensus — Gegenmessung I.

Misst den orchestrierten Konsens: wie viel des scheinbar unabhängigen
Nachrichten-Konsenses in Wahrheit EINE Quelle ist, wortgleich über nominell
unabhängige Medien kopiert.

Verfahren (deterministisch, kein LLM):
  1. acht breite Nachrichten-Beats über die GDELT DOC 2.0 API abrufen (frei, keine Auth),
  2. Artikel poolen (Dedupe nach URL),
  3. wortgleiche 6-Gramm-Phrasen je Titel über DISTINKTE Quell-Domains zählen,
  4. die Maschine wählt selbst: die Phrase mit der höchsten Domain-Streuung ist die
     "Schlagzeile des Tages" — der Satz, den die meisten "unabhängigen" Medien
     wortgleich brachten,
  5. Echo-Index = Anteil der Titel, die zu irgendeinem >=3-Domain-Echo-Cluster gehören.

Output: src/data/consensus/latest.json (+ Archiv <datum>.json). Git ist das Archiv.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

API = "https://api.gdeltproject.org/api/v2/doc/doc"
UA = "Mozilla/5.0 (frankbueltge.de The Consensus / counter-measurement research)"
BEATS = ["politics", "economy", "technology", "health", "science", "business", "sports", "weather"]
SHINGLE_N = 6          # 6-Wort-Phrasen — spezifisch genug, dass Treffer keine Floskeln sind
MIN_DOMAINS = 3        # ein "Echo" gilt ab drei verschiedenen Quellen
MAXRECORDS = 250
TIMESPAN = "24H"

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "data" / "consensus"


_last_call = [0.0]


def _pace(min_gap: float = 5.5) -> None:
    """GDELT erlaubt 1 Request / 5 s — vor jedem Aufruf aktiv takten statt nachträglich retryen."""
    wait = min_gap - (time.monotonic() - _last_call[0])
    if wait > 0:
        time.sleep(wait)
    _last_call[0] = time.monotonic()


def fetch(query: str, retries: int = 4) -> list[dict]:
    """Ein Beat über die GDELT DOC API; respektiert das 1-Request-/-5-s-Limit."""
    params = urllib.parse.urlencode(
        {
            "query": f'"{query}" sourcelang:english',
            "mode": "artlist",
            "format": "json",
            "maxrecords": MAXRECORDS,
            "timespan": TIMESPAN,
            "sort": "datedesc",
        }
    )
    url = f"{API}?{params}"
    for attempt in range(retries):
        _pace()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read().decode("utf-8", "replace")
        except Exception as e:  # Netz-/Timeout-Fehler: kurz warten, erneut
            print(f"  ! {query}: {e}", file=sys.stderr)
            time.sleep(6)
            continue
        if raw.lstrip().startswith("Please limit"):
            time.sleep(6)
            continue
        try:
            return json.loads(raw).get("articles", [])
        except json.JSONDecodeError:
            return []
    return []


def words(title: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", title.lower())


def shingles(ws: list[str], n: int = SHINGLE_N) -> list[str]:
    return [" ".join(ws[i : i + n]) for i in range(len(ws) - n + 1)]


def analyse(articles: list[dict]) -> dict:
    # phrase -> distinkte Domains; phrase -> Artikel-Indizes
    phrase_domains: dict[str, set] = defaultdict(set)
    phrase_arts: dict[str, set] = defaultdict(set)
    art_shingles: list[set] = []
    for i, a in enumerate(articles):
        sh = set(shingles(words(a.get("title", ""))))
        art_shingles.append(sh)
        dom = a.get("domain", "")
        for s in sh:
            phrase_domains[s].add(dom)
            phrase_arts[s].add(i)

    def top_story(banned_arts: set) -> dict | None:
        best = None
        for phrase, doms in phrase_domains.items():
            arts = phrase_arts[phrase] - banned_arts
            live_doms = {articles[i].get("domain", "") for i in arts}
            if len(live_doms) < MIN_DOMAINS:
                continue
            key = (len(live_doms), len(phrase))
            if best is None or key > best[0]:
                best = (key, phrase, arts, live_doms)
        if best is None:
            return None
        _, phrase, arts, doms = best
        titles = [articles[i].get("title", "") for i in arts]
        # repräsentative echte Schlagzeile: häufigster, sonst längster Titel
        rep = Counter(titles).most_common(1)[0][0] if titles else ""
        if list(titles).count(rep) == 1:
            rep = max(titles, key=len)
        return {
            "phrase": phrase,
            "sample_title": rep,
            "domain_count": len(doms),
            "mastheads": sorted(doms)[:40],
            "article_count": len(arts),
            "_arts": arts,
        }

    headline = top_story(set())
    runner_up = top_story(headline["_arts"]) if headline else None

    # Echo-Index: Anteil der Titel, die zu IRGENDEINEM >=3-Domain-Cluster gehören
    echo_phrases = {p for p, d in phrase_domains.items() if len(d) >= MIN_DOMAINS}
    echoed = sum(1 for sh in art_shingles if sh & echo_phrases)
    echo_index = round(echoed / len(articles), 3) if articles else 0.0

    for s in (headline, runner_up):
        if s:
            s.pop("_arts", None)
    return {"headline": headline, "runner_up": runner_up, "echo_index": echo_index}


def main() -> int:
    pooled: dict[str, dict] = {}
    per_beat = {}
    for beat in BEATS:
        arts = fetch(beat)
        per_beat[beat] = len(arts)
        for a in arts:
            url = a.get("url")
            if url and url not in pooled:
                pooled[url] = a
        print(f"  {beat}: {len(arts)} Artikel (Pool {len(pooled)})", file=sys.stderr)

    articles = list(pooled.values())
    result = analyse(articles)
    now = datetime.now(timezone.utc)
    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "date": now.strftime("%Y-%m-%d"),
        "echo_index": result["echo_index"],
        "headline": result["headline"],
        "runner_up": result["runner_up"],
        "stats": {
            "articles_scanned": len(articles),
            "domains_scanned": len({a.get("domain", "") for a in articles}),
            "beats": BEATS,
            "per_beat": per_beat,
            "shingle_n": SHINGLE_N,
            "min_domains": MIN_DOMAINS,
        },
        "source": {
            "name": "GDELT DOC 2.0 API",
            "url": "https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/",
            "license": "GDELT — open / frei nutzbar",
            "retrieved": now.strftime("%Y-%m-%d"),
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "latest.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    (OUT_DIR / f"{out['date']}.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    h = result["headline"]
    if h:
        print(f"\nSchlagzeile: \"{h['sample_title']}\"")
        print(f"  {h['domain_count']} verschiedene Medien, wortgleich. Echo-Index {result['echo_index']}")
    else:
        print("\nKein Echo-Cluster über der Schwelle gefunden.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
