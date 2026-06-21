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
import math
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
CACHE = Path("/tmp/consensus_corpus.json")  # roher Pool — erlaubt Offline-Reprocess ohne GDELT


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


def parse_seen(s: str):
    """GDELT seendate, z. B. '20260621T143000Z' → datetime (UTC). None bei Fehlformat."""
    m = re.match(r"(\d{8})T(\d{6})Z?", s or "")
    if not m:
        return None
    try:
        return datetime.strptime(m.group(1) + m.group(2), "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def words(title: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", title.lower())


def shingles(ws: list[str], n: int = SHINGLE_N) -> list[str]:
    return [" ".join(ws[i : i + n]) for i in range(len(ws) - n + 1)]


SOFT_TAU = 0.72  # Cosinus-Schwelle für „paraphrasierte" Koordination (v2)


def country_tld(domain: str) -> str:
    """Letztes Domain-Segment als grobes Länder-/Markt-Signal (uk, com, ie, de …)."""
    return domain.rsplit(".", 1)[-1] if "." in domain else domain


def classify_syndication(mastheads: list[str], span_hours, domain_count: int) -> dict:
    """v3 — symbolische, regelbasierte Klassifikation aus der Graph-STRUKTUR (auditierbar).

    Wire-/Ketten-Syndizierung: homogene TLD + enges Zeitfenster (eine Gruppe, ein Push).
    Verstreute Platzierung: heterogene TLDs über mehrere Märkte (Cross-Outlet-Aufnahme).
    """
    if not mastheads:
        return {"label": "unknown", "top_tld": "", "tld_share": 0.0, "distinct_tlds": 0}
    tlds = [country_tld(m) for m in mastheads]
    top_tld, top_n = Counter(tlds).most_common(1)[0]
    tld_share = round(top_n / len(tlds), 2)
    distinct = len(set(tlds))
    tight = span_hours is not None and span_hours <= 6
    if tld_share >= 0.8 and tight:
        label = "wire/chain syndication"  # eine Gruppe, ein Push
    elif distinct >= 3:
        label = "scattered placement"  # über mehrere Märkte aufgenommen
    else:
        label = "mixed"
    return {"label": label, "top_tld": top_tld, "tld_share": tld_share, "distinct_tlds": distinct}


def tfidf_vectors(titles: list[str]) -> list[dict]:
    """v2 — L2-normierte TF-IDF-Vektoren je Titel (reines Python, kein Modell/Key)."""
    df: Counter = Counter()
    tfs = []
    for t in titles:
        tf = Counter(words(t))
        tfs.append(tf)
        for w in tf:
            df[w] += 1
    n = max(1, len(titles))
    idf = {w: math.log((n + 1) / (c + 1)) + 1.0 for w, c in df.items()}
    vecs = []
    for tf in tfs:
        v = {w: f * idf[w] for w, f in tf.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        vecs.append({w: x / norm for w, x in v.items()})
    return vecs


def cosine(a: dict, b: dict) -> float:
    if len(a) > len(b):
        a, b = b, a
    return sum(x * b.get(w, 0.0) for w, x in a.items())


def soft_clusters(
    articles: list[dict], vecs: list[dict], seed_groups: list | None = None, tau: float = SOFT_TAU
) -> list[list[int]]:
    """Near-Duplicate-Cluster (paraphrasiert) via Union-Find; Blocking über geteilte Tokens.

    seed_groups (die verbatim-Cluster) werden zuerst geunioned, damit wortgleiche Artikel
    garantiert zusammenbleiben (soft ⊇ verbatim) — TF-IDF mergt nur Paraphrasen obendrauf.
    """
    n = len(articles)
    parent = list(range(n))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a: int, b: int) -> None:
        if find(a) != find(b):
            parent[find(a)] = find(b)

    for g in seed_groups or []:
        for k in range(1, len(g)):
            union(g[0], g[k])

    tok_docs: dict[str, list[int]] = defaultdict(list)
    for i, a in enumerate(articles):
        for w in set(words(a.get("title", ""))):
            tok_docs[w].append(i)
    checked: set = set()
    for w, idxs in tok_docs.items():
        if len(idxs) > 60:  # sehr häufige Tokens überspringen (Blocking gegen O(n²))
            continue
        for x in range(len(idxs)):
            for y in range(x + 1, len(idxs)):
                i, j = idxs[x], idxs[y]
                key = (i, j) if i < j else (j, i)
                if key in checked:
                    continue
                checked.add(key)
                if find(i) != find(j) and cosine(vecs[i], vecs[j]) >= tau:
                    parent[find(i)] = find(j)
    groups: dict[int, list[int]] = defaultdict(list)
    for i in range(n):
        groups[find(i)].append(i)
    return [g for g in groups.values() if len({articles[i].get("domain", "") for i in g}) >= MIN_DOMAINS]


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
        # Symbolische Provenienz: wer brachte den Satz ZUERST, wie kaskadierte das Echo.
        # (seendate = wann GDELT den Artikel zuerst sah — Proxy für Publikation, nicht Grundwahrheit.)
        seen = []
        for i in arts:
            sd = parse_seen(articles[i].get("seendate", ""))
            if sd:
                seen.append((sd, articles[i].get("domain", "")))
        seen.sort()
        first_dom, first_at, span_h, cascade = "", "", None, []
        if seen:
            first_at, first_dom = seen[0][0].isoformat(timespec="minutes"), seen[0][1]
            span_h = round((seen[-1][0] - seen[0][0]).total_seconds() / 3600, 1)
            seen_doms: set = set()
            for sd, dom in seen:  # Kaskade: erste 12 NEUEN Domains in zeitlicher Reihenfolge
                if dom not in seen_doms:
                    seen_doms.add(dom)
                    cascade.append({"at": sd.isoformat(timespec="minutes"), "domain": dom})
                if len(cascade) >= 12:
                    break
        return {
            "phrase": phrase,
            "sample_title": rep,
            "domain_count": len(doms),
            "mastheads": sorted(doms)[:40],
            "article_count": len(arts),
            "first_domain": first_dom,
            "first_seen": first_at,
            "span_hours": span_h,
            "cascade": cascade,
            "_arts": arts,
        }

    headline = top_story(set())
    runner_up = top_story(headline["_arts"]) if headline else None

    # Echo-Index (verbatim): Anteil der Titel, die zu IRGENDEINEM >=3-Domain-Cluster gehören
    echo_phrases = {p for p, d in phrase_domains.items() if len(d) >= MIN_DOMAINS}
    echoed = sum(1 for sh in art_shingles if sh & echo_phrases)
    echo_index = round(echoed / len(articles), 3) if articles else 0.0

    # v2 — paraphrasierte Koordination (TF-IDF/Cosinus); v3 — symbolische Klassifikation
    vecs = tfidf_vectors([a.get("title", "") for a in articles])
    seed_groups = [list(phrase_arts[p]) for p in echo_phrases]  # verbatim-Cluster als Seed
    soft = soft_clusters(articles, vecs, seed_groups=seed_groups)
    soft_idx = {i for g in soft for i in g}
    soft_echo_index = round(len(soft_idx) / len(articles), 3) if articles else 0.0

    def enrich(story: dict | None) -> None:
        if not story:
            return
        story["syndication"] = classify_syndication(
            story["mastheads"], story.get("span_hours"), story["domain_count"]
        )
        arts = story.get("_arts", set())
        # weiches Cluster, das die Schlagzeile enthält → zusätzliche Domains durch Paraphrase
        host = max(soft, key=lambda g: len(set(g) & arts), default=None)
        if host and (set(host) & arts):
            soft_doms = {articles[i].get("domain", "") for i in host}
            story["soft_domain_count"] = len(soft_doms)
            story["soft_echo_extra"] = max(0, len(soft_doms) - story["domain_count"])
        else:
            story["soft_domain_count"] = story["domain_count"]
            story["soft_echo_extra"] = 0

    enrich(headline)
    enrich(runner_up)
    for s in (headline, runner_up):
        if s:
            s.pop("_arts", None)
    return {
        "headline": headline,
        "runner_up": runner_up,
        "echo_index": echo_index,
        "soft_echo_index": soft_echo_index,
    }


def main() -> int:
    reprocess = "--reprocess" in sys.argv
    if reprocess and CACHE.exists():
        cached = json.loads(CACHE.read_text())
        articles, per_beat = cached["articles"], cached["per_beat"]
        print(f"Reprocess aus Cache: {len(articles)} Artikel (kein GDELT-Abruf).", file=sys.stderr)
    else:
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
        CACHE.write_text(json.dumps({"articles": articles, "per_beat": per_beat}))
    result = analyse(articles)
    now = datetime.now(timezone.utc)
    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "date": now.strftime("%Y-%m-%d"),
        "echo_index": result["echo_index"],
        "soft_echo_index": result["soft_echo_index"],
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
