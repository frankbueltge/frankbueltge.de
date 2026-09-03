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
| `src/data/trending/audience/YYYY-MM-DD.json` | `trending-audience/2`, `day` = the measured day (run day − 1) | once; skipped if it already exists |

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
(Cloudflare GraphQL `httpRequestsAdaptiveGroups`, zone scope, one 24-hour window, sampled —
`sample_interval_avg` is committed beside the counts), plus, when the plan serves those
dimensions, the ten most frequent countries and referring hosts; a dimension the plan refuses
is `null` with the reason in `extra_note`, never a zero. The half records
`status: "unavailable"` with a note when its credentials are missing or its call fails; its
numeric fields are then `null` and its collections empty. Nothing is estimated.

There is no browser-beacon half. A client-side beacon needs JavaScript, so it cannot see a
crawler, and crawlers are most of what this page is measured by; the site's own privacy-friendly
beacon stays in place for its own purpose. Contract `trending-audience/2` since 2026-09-03;
committed v1 files keep their string and are read as they are.

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

## The watchlist governs itself now (2026-09-02)

The list of tracked terms lives in the repository at `src/data/trending/watchlist.json`, not in
the installed package, and the nightly run writes it. Discovery reads the house's own committed
day files as its primary corpus — twenty sources, so an arc in culture, politics, sport or
markets can be seen at all — and keeps the four live archives (Hacker News, dev.to, arXiv,
GitHub) for depth while the archive is young.

A proposal is taken onto the list by the machine when it stood among the candidates on
`promote_days` consecutive runs including today, carried at least `promote_min_platforms`
platforms each time, was never struck before, and the list has room (`promote_max_terms`); at
most `promote_max_per_run` enter per night, and a promoted term is counted from the next run,
never backfilled. In the other direction, a term the machine promoted and the world dropped
again is let go: `quiet_since` records the first quiet or fading run, and after
`retire_quiet_days` of unbroken silence the entry is struck with the reason in the file. A term
a person put on the list is never struck this way.

A struck entry stays in the file as a tombstone carrying `retired` and `retired_note`, so
nothing the machine proposes can resurrect it. Both movements are recorded in the day's arcs
file under `promoted` and `let_go`, and the self-check counts the promotions against the
ceiling.

## The rule on trial (`src/data/trending/eval/`)

The convergence rule makes one decision over and over: are these two signals the same topic?
`src/trending/evaluate.py` puts that decision on trial against judgements written down by hand.

```bash
python -m trending.evaluate propose --repo-root . --date 2026-09-02 --labeller "who judges"
#   → src/data/trending/eval/<date>-pairs.json: every pair the rule joined, plus a
#     deterministic sample of near misses (pairs sharing a word that were not joined).
#     Judge each by setting "same_topic" to true or false. Nothing is judged for you, and an
#     existing sheet is never overwritten.
python -m trending.evaluate score --repo-root .   # → eval/scorecard.json, and the errors
python -m trending.evaluate sweep --repo-root .   # the same labels against a range of thresholds
```

The criterion is written into every sheet before the judging starts, together with who judged:
two signals are the same topic when a reader looking for one would want the other. The score
re-runs the rule rather than reading the sheet's own verdict, so the same labels can measure a
changed threshold — which is why they are kept. Pairs sharing no word are left out: they are
the overwhelming majority and judging them teaches nothing.

A judgement is editorial, not a measurement. The sheet names the labeller, anyone may overrule
a single label, and git keeps the change.

**First measurement, 2026-09-02** (55 judged pairs of the day's 8 sources): precision 1.0,
recall 0.652, f1 0.789 — no pair joined that should not have been, eight of twenty-three true
joins missed. The sweep showed the threshold is not what binds: from `jaccard_min` 0.35 to 0.8
nothing changes at all, and only 0.3 buys a false join without buying a single catch. The
misses come from the shape of the rule, not its number — two outlets describing one event share
only common nouns ("Nepal mountain collapse causes floods" against "missing tourists make
contact as Nepal floods"), and a one-word label like a hashtag can only match another label
exactly. Weighting a shared word by how rare it is in the day would address both and stays
deterministic; it is not built, and the labelled set is what will decide it.
