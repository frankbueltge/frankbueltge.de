#!/usr/bin/env python3
"""
The Consensus — Gegenmessung I.

Measures orchestrated consensus: how much of the seemingly independent news
consensus is in truth ONE source, copied word-for-word across nominally
independent outlets.

Method v2 (deterministic, no LLM; dated break 2026-08-06):
  1. fetch the last 24 h of GDELT's raw 15-minute GKG 2.1 files (96 static
     downloads from data.gdeltproject.org — no API, no key, no rate limit),
  2. pool articles (title from PAGE_TITLE, dedupe by URL),
  3. count verbatim 6-gram title phrases across DISTINCT source domains,
  4. the machine picks its own headline: the phrase with the widest domain
     spread is the "sentence of the day" — the one most "independent"
     outlets ran word-for-word,
  5. echo index = share of titles belonging to any >=3-domain echo cluster.

Method history — the break is disclosed, not smoothed over:
  * v1 (2026-06-22 .. 2026-08-05): pool = 8 beat queries against the GDELT
    DOC 2.0 API, max 250 articles each. The API's sticky per-IP 429 blocks
    finally broke 5 of 8 beats on 2026-08-05, and its artlist titles turn
    out to be degraded strings (dropped apostrophes, truncation) — a real
    material defect for a verbatim-matching instrument.
  * v2 (since 2026-08-06): pool = the full English-monitored raw stream
    (~100k+ articles/day) with faithful page titles. A same-window
    comparison on 2026-08-05 measured echo_index 0.313 (raw, 114,207
    articles) vs 0.300 (API, 727 articles) — the quotient survives the pool
    change; the material is truer. The soft (paraphrase) pass is SUSPENDED
    in v2: its token blocking was calibrated for ~2k pools and does not
    survive 100k+; committed v1 days keep their soft values, v2 days carry
    none until the pass is rebuilt for full-stream scale.

Output: src/data/consensus/latest.json (+ archive <date>.json). Git is the
archive; committed day files are immutable and never backfilled or
overwritten across method versions (main() refuses).

Evidence track (2026-08-04): each story carries `articles` — per distinct
domain the earliest article URL GDELT saw — so the site can link every
masthead to the article that carried the sentence.
"""
import json
import math
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

SHINGLE_N = 6          # 6-word phrases — specific enough that a match is no stock phrase
MIN_DOMAINS = 3        # an "echo" starts at three distinct sources
SLOTS_PER_DAY = 96     # 24 h of 15-minute GKG files
METHOD_VERSION = "v2-raw-files"
METHOD_SINCE = "2026-08-06"
SOFT_PASS_ENABLED = False  # suspended in v2 — token blocking was calibrated for ~2k pools
# The syndication classifier is versioned separately from the pool method: c2 classifies on
# every domain of the phrase, c1 (implicit, unrecorded) classified on the 40-name display list.
CLASSIFIER_VERSION = "c2-full-domain-set"
CLASSIFIER_SINCE = "2026-08-09"

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src" / "data" / "consensus"
CACHE = Path("/tmp/consensus_corpus.json")  # raw pool — allows offline reprocess without GDELT

# The raw-file fetch layer is shared with pipelines/newspool (single source of truth).
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "newspool"))
from fetch_pool import fetch_slot, parse_gkg  # noqa: E402


def last_slots(n: int = SLOTS_PER_DAY) -> list[str]:
    """The n most recent COMPLETED 15-minute slot stamps, oldest first.

    The newest included slot is one stride behind the current quarter hour —
    the file for the running quarter may not be published yet, and a
    predictable window beats a racy one.
    """
    now = datetime.now(timezone.utc)
    newest = now.replace(minute=(now.minute // 15) * 15, second=0, microsecond=0) - timedelta(minutes=15)
    return [(newest - timedelta(minutes=15 * i)).strftime("%Y%m%d%H%M%S") for i in range(n)][::-1]


def fetch_articles() -> tuple[list[dict], dict]:
    """Pool the last 24 h of raw GKG files: url-deduped articles + fetch stats.

    A slot that stays absent after retries is a DISCLOSED gap in the stats
    (lab rule: a gap is recorded, never bridged into a quieter-looking day).
    """
    slots = last_slots()
    pooled: dict[str, dict] = {}
    missing: list[str] = []
    for k, stamp in enumerate(slots):
        raw = fetch_slot(stamp)
        if raw is None:
            missing.append(stamp)
            print(f"  gap {stamp} (slot absent after retries)", file=sys.stderr)
            continue
        for row in parse_gkg(raw):
            if row["url"] not in pooled:
                s = row["seen"]
                pooled[row["url"]] = {
                    "url": row["url"],
                    "domain": row["domain"],
                    "title": row["title"],
                    "seendate": f"{s[:8]}T{s[8:]}Z",
                }
        if (k + 1) % 16 == 0:
            print(f"  {k + 1}/{len(slots)} slots, pool {len(pooled)}", file=sys.stderr)
        time.sleep(0.3)  # politeness between static-file downloads
    fetch_stats = {
        "slots_expected": len(slots),
        "slots_fetched": len(slots) - len(missing),
        "slots_missing": missing,
        "window": f"{slots[0]} .. {slots[-1]} UTC",
    }
    return list(pooled.values()), fetch_stats


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
        # Evidence track (added 2026-08-04): one retrievable article URL per domain —
        # the earliest GDELT saw — so every masthead chip on the site can link to the
        # article that actually carried the sentence. Without this the claim
        # "word-for-word across N outlets" was asserted, not checkable.
        per_dom: dict[str, dict] = {}
        for i in arts:
            a = articles[i]
            dom, art_url = a.get("domain", ""), a.get("url", "")
            if not dom or not art_url:
                continue
            sd = parse_seen(a.get("seendate", ""))
            at = sd.isoformat(timespec="minutes") if sd else ""
            prev = per_dom.get(dom)
            if prev is None or (at and (not prev["at"] or at < prev["at"])):
                per_dom[dom] = {"domain": dom, "url": art_url, "at": at}
        evidence = sorted(per_dom.values(), key=lambda e: (e["at"] or "9999", e["domain"]))[:40]
        return {
            "phrase": phrase,
            "sample_title": rep,
            "domain_count": len(doms),
            "mastheads": sorted(doms)[:40],
            "_doms": sorted(doms),  # full set for the classifier; mastheads stay a display list
            "articles": evidence,
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

    # Paraphrase pass (TF-IDF/cosine) — SUSPENDED in v2: the token blocking
    # (>60 docs skipped) was calibrated for ~2k-article pools and degenerates
    # on the 100k+ raw stream. Suspended openly rather than run meaninglessly;
    # committed v1 days keep their soft values. soft_echo_index is None until
    # the pass is rebuilt for full-stream scale (e.g. MinHash/LSH).
    soft: list[list[int]] = []
    soft_echo_index: float | None = None
    if SOFT_PASS_ENABLED:
        vecs = tfidf_vectors([a.get("title", "") for a in articles])
        seed_groups = [list(phrase_arts[p]) for p in echo_phrases]
        soft = soft_clusters(articles, vecs, seed_groups=seed_groups)
        soft_idx = {i for g in soft for i in g}
        soft_echo_index = round(len(soft_idx) / len(articles), 3) if articles else 0.0

    def enrich(story: dict | None) -> None:
        if not story:
            return
        # Classify on ALL the phrase's domains, not on the 40-name display list.
        # Dated fix, 2026-08-09 (classifier c2): `mastheads` is truncated to 40 for the
        # page, and enrich() used to hand that truncated list to the classifier — so on a
        # day whose widest sentence ran across 200+ outlets, the TLD share and the label
        # were computed from an alphabetical slice of a fifth of them. Committed days keep
        # the values they were measured with (the archive is not rewritten); days from here
        # carry `classifier: c2` and are the ones comparable with the BigQuery baseline,
        # which has always classified on the full set (src/data/consensus/baseline.json).
        story["syndication"] = classify_syndication(
            story.get("_doms") or story["mastheads"], story.get("span_hours"), story["domain_count"]
        )
        if not SOFT_PASS_ENABLED:
            return  # v2: no paraphrase fields — absent, not zero-faked
        arts = story.get("_arts", set())
        # soft cluster containing the headline → extra domains via paraphrase
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
            s.pop("_doms", None)
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
        articles, fetch_stats = cached["articles"], cached["fetch_stats"]
        print(f"Reprocess from cache: {len(articles)} articles (no GDELT fetch).", file=sys.stderr)
    else:
        articles, fetch_stats = fetch_articles()
        CACHE.write_text(json.dumps({"articles": articles, "fetch_stats": fetch_stats}))
    result = analyse(articles)
    now = datetime.now(timezone.utc)
    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "date": now.strftime("%Y-%m-%d"),
        "method": {
            "version": METHOD_VERSION,
            "since": METHOD_SINCE,
            "classifier": CLASSIFIER_VERSION,
            "classifier_since": CLASSIFIER_SINCE,
            "soft_pass": "suspended — token blocking was calibrated for ~2k pools; "
                         "rebuild for full-stream scale pending",
        },
        "echo_index": result["echo_index"],
        "headline": result["headline"],
        "runner_up": result["runner_up"],
        "stats": {
            "articles_scanned": len(articles),
            "domains_scanned": len({a.get("domain", "") for a in articles}),
            "shingle_n": SHINGLE_N,
            "min_domains": MIN_DOMAINS,
            **fetch_stats,
        },
        "source": {
            "name": "GDELT GKG 2.1 raw files (15-minute stream)",
            "url": "https://blog.gdeltproject.org/gkg-2-0-now-includes-page-titles/",
            "license": "GDELT — open / frei nutzbar",
            "retrieved": now.strftime("%Y-%m-%d"),
        },
    }
    if result["soft_echo_index"] is not None:
        out["soft_echo_index"] = result["soft_echo_index"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    day_path = OUT_DIR / f"{out['date']}.json"
    if day_path.exists():
        prev = json.loads(day_path.read_text())
        prev_version = (prev.get("method") or {}).get("version", "v1-doc-api")
        if prev_version != METHOD_VERSION:
            # Archive files are immutable record: never replace a committed day
            # measured under another method version (would rewrite history).
            print(f"REFUSED: {day_path.name} exists with method {prev_version}; "
                  f"not overwriting with {METHOD_VERSION}.", file=sys.stderr)
            return 1
    (OUT_DIR / "latest.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    day_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    h = result["headline"]
    if h:
        print(f"\nHeadline: \"{h['sample_title']}\"")
        print(f"  {h['domain_count']} distinct outlets, word-for-word. Echo index {result['echo_index']}")
    else:
        print("\nNo echo cluster above threshold.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
