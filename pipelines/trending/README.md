# trending — the morning reader behind Common Ground (`/trending`)

Every morning this package reads what the web is searching, reading and posting about from
twenty public sources that need no key, keeps what converges across independent platforms by a
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

The day's broad publics first: `google_trends` (daily search trends RSS, US · GB · CA · AU ·
IN · DE · BR · FR · JP · MX), `wikipedia` (most-read articles of the day before, `en` · `de` ·
`fr` · `es` · `ja` · `pt`, with a four-day lookback for the publication lag), `hackernews`
(front page), `bluesky` (trending topics), `mastodon` (trending tags and links),
`google_news` (top stories), `reddit` (r/popular, optional), `github` (most-starred
repositories created in the last seven days).

Then twelve narrower publics, the places where a term surfaces before it reaches a headline:
`huggingface` (trending models on the Hub, by downloads), `lobsters` (hottest stories, by
points), `devto` (top articles of the last day, by reactions), `stackoverflow` (hot questions,
by score — the keyless Stack Exchange quota is 300 requests a day and one is spent here),
`pypi` (most-downloaded packages of the last month, from the published top list derived from
the official download statistics; monthly, CC BY 4.0, optional), `producthunt` (newest
products, optional), `techmeme` (the editorially curated technology front page, optional),
`arxiv` (newest preprints in cs.AI · cs.CL · cs.LG · cs.SE, one request, optional),
`appstore` (top free apps, US and DE, from Apple's Marketing Tools RSS), `steam` (store top
sellers, optional), `coingecko` (trending searches, optional), `polymarket` (open markets by
24-hour volume, optional).

Every one of them is keyless, reads one endpoint per run (`appstore` two, one per storefront)
and keeps at most one request per half second. `optional` marks a feed that blocks or changes
shape without notice: it becomes an `unavailable` line in the day's `sources[]`, never a
crash.

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

## Layer 2 — the arcs (`src/data/trending/terms/YYYY-MM-DD.json`, contract `trending-terms/1`)

Beside the day's spikes the run tracks the slower arcs: a watched list of terms
(`src/trending/data/watchlist.json`) whose mentions in the last one, seven and thirty days
are counted per platform — Hacker News (Algolia search), Google News (RSS search), GitHub
(repositories created in the window), arXiv, Reddit (optional; its search feed often refuses)
and, when the watchlist names an article, Wikipedia pageviews. A term is searched as a quoted
phrase together with its aliases; platforms whose syntax knows OR get one request per term.
Every count comes with receipts (title, URL, date) and a `capped` flag where a feed stops
short of the window. The status — emerging, rising, established, fading, quiet — follows the
thresholds in `rules.json` (`min_mentions_d7`, `rising_ratio`, `fading_ratio`,
`emerging_days`, `established_d30`) and is spelled out on the method sheet.

The same step runs a discovery pass over a thirty-day corpus of titles (Hacker News stories
with fifty or more points, dev.to's top articles, arXiv's four computer-science categories in
equal date slices, GitHub's most-starred new repositories) and proposes bigrams and trigrams
whose document count in the recent fourteen days outpaces the sixteen before, provided at
least two platforms carry them (`discover_*` in `rules.json`, drop rules in
`ngram_blocklist.json`). Proposals are recorded under `candidates` and shown on the site;
nothing enters the watchlist without a human editing the file — the `added`, `origin` and
`note` fields say when and why.

```bash
python -m trending.discover --repo-root . --days 30   # print the candidate table, write nothing
python -m trending.terms --repo-root .                # today's arcs record only
python -m trending.run --repo-root . --skip-terms     # the day file without the arcs
```

`GITHUB_TOKEN` (optional) lifts GitHub's search limit from ten to thirty requests a minute;
the nightly workflow passes the built-in token.

## The self-check (`quality` in both records)

Before a record is written the run grades it against a rubric (`src/trending/quality.py`) and
writes the grade into the file under `quality` — rubric version, pass count and one line per
check. A source that did not answer is asked once more after a pause (`quality_retry`,
`quality_retry_delay_s`); nothing else is repaired. A failed check never stops the file: it
is written, the workflow log carries a warning, and the page spells the failure out. The
thresholds are the `quality_*` keys in `rules.json`; the checks are listed on the method sheet
(`/werke/trending`, section 8).
