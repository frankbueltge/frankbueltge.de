# trending — the morning reader behind Common Ground (`/trending`)

Every morning this package reads what the web is searching, reading and posting about from
eight public sources that need no key, keeps what converges across independent platforms by a
disclosed token rule, and writes one day file into the site. A day later the same run asks
Cloudflare's edge analytics who fetched `/trending` the day before and writes that as a second
file — classes and bot names only, never a raw user agent. Git is the archive: a committed day
is never rewritten.

No language model is involved anywhere. Every label is a source's own label, every count a
source's own count.

## What it writes

| File | Contract | Written |
|---|---|---|
| `src/data/trending/YYYY-MM-DD.json` | `trending-day/1` | once per run day; refused if it already exists |
| `src/data/trending/audience/YYYY-MM-DD.json` | `trending-audience/1`, `day` = the measured day (run day − 1) | once; skipped if it already exists |

The site serves `/trending/latest.json` from the newest committed day; no second copy is
committed.

The day file carries `sources[]` (one report per source, in the fixed order below, with
`status` ∈ `ok | partial | unavailable` and a note), `signals` (per source, the items as
fetched, in stable order), `topics[]` (only the clusters that converge on two or more
platforms, ordered by score then label, with `platforms`, `first_seen`, `days_hot`, links and
the Wikipedia article when one is in the cluster — a singleton is the signal itself and is
not repeated) and a `summary` (`topics_total` counts every cluster, singletons included;
`top_labels` are the three headline labels, converging topics first).

The audience file carries `edge` (Cloudflare GraphQL `httpRequestsAdaptiveGroups`, zone
scope, one 24-hour window, sampled — `sample_interval_avg` is committed beside the counts)
and `umami` (browser pageviews from the self-hosted Umami). Either half records
`status: "unavailable"` with a note when its credentials are missing or its call fails; its
numeric fields are then `null` and its collections empty. Nothing is estimated.

## Sources, in order

`google_trends` (daily search trends RSS, US · GB · CA · AU · IN · DE), `wikipedia`
(most-read articles of the day before, `en` and `de`, with a four-day lookback for the
publication lag), `hackernews` (front page), `bluesky` (trending topics), `mastodon`
(trending tags and links), `google_news` (top stories), `reddit` (r/popular, optional),
`github` (most-starred repositories created in the last seven days).

Titles, URLs and counts only — never article bodies.

## The convergence rule

Labels are tokenised (diacritics stripped, casefolded, hashtags split, stopwords dropped).
Two short labels match by an exact single token, by Jaccard overlap of at least the committed
threshold, or by containment of a two-token label; a short label attaches to a headline when
all of its tokens occur in it; two headlines match by Jaccard. Clusters are scored by the number
of distinct platforms, then by rank heat; the label comes from the highest-priority source in
the cluster. Thresholds and the Wikipedia stoplist live in `src/trending/data/*.json` so they
can be tuned without touching code; the method sheet at `/werke/trending` states the rule in
prose.

## Running

```bash
cd pipelines/trending
python3.12 -m venv .venv && . .venv/bin/activate
pip install -e ".[dev]"
pytest -q                                   # offline; every HTTP call is a MockTransport

cd ../..
python -m trending.run --repo-root .        # today's ledger + yesterday's audience
python -m trending.run --repo-root . --date 2026-09-02 --skip-audience
```

Exit codes: `0` on success (also when the day file already exists — it is left untouched),
`2` on a malformed `--date`.

## Environment

| Variable | Used for | Missing |
|---|---|---|
| `CF_ANALYTICS_TOKEN` | Cloudflare API token, *Zone · Analytics · Read* | `edge.status = unavailable` |
| `CF_ZONE_ID` | the zone id of frankbueltge.de | same |
| `UMAMI_API_URL`, `UMAMI_USERNAME`, `UMAMI_PASSWORD` | a view-only user of the self-hosted Umami | `umami.status = unavailable` |

The nightly workflow is `.github/workflows/trending.yml` (06:40 UTC, commits as Morgenlese).
Design and measurement: `docs/design/2026-09-02-common-ground.md`.
