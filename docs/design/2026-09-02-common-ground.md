# Common Ground — a trending ledger built for machine readers, with its own audience counted

**Date:** 2026-09-02 · **Status:** DECIDED (Frank's go, wording private) · **Route:** `/trending`
· **Register:** `src/data/werke.ts`, id `trending`, line NIGHTLY LEDGER · **Audit:**
`docs/audits/2026-08-09-usp-audit.md` §19 · **Pipeline:** `pipelines/trending` · **Workflow:**
`.github/workflows/trending.yml` (Trending nightly, 06:40 UTC, commits as Morgenlese)

## 1. Occasion

An SEO experiment, in Frank's framing (wording private): a page on this site that is fetched
very often because it is useful — to people who publish with AI every day, and to the AI agents
that fetch pages on their behalf — fed by a daily routine that finds what is hot and prepares it
for machine readers. The house already had the shape: nightly pipelines that commit dated JSON,
static pages that read them, a USP duty, and a rule set for counting readers without identifying
them (`.claude/rules/runtime-and-works.md`). This experiment reuses all of it and adds nothing
that runs at request time.

## 2. Hypothesis

A daily page that (a) cross-checks what several independent platforms surface at the same time,
(b) archives every day as recomputable open data, (c) is delivered in the forms machine readers
use (JSON, Markdown, RSS, `llms.txt`), and (d) publishes which machines read it, will be fetched
by search engines and AI agents at a rate that grows from zero to a level no other page of this
site reaches — and the growth will be visible in a committed series rather than claimed.

## 3. What "very many" means — milestones and the kill reading

| When | Expectation | Read from |
|---|---|---|
| ≤ 7 days after ship | the first AI-agent fetch of `/trending*` (any class other than `browser`, `search`, `other-bot`) | `src/data/trending/audience/*.json`, `edge.classes` |
| 30 days | ≥ 100 machine fetches per day (search + AI classes) | same |
| 90 days | ≥ 1 000 requests per day across all classes | same, `edge.total` |
| 60 days (kill reading) | if `ai-retrieval` + `ai-user-fetch` + `ai-training` stay at zero over the whole series, the audience half has failed; the convergence half alone does not carry the entry — rework or archive | same |

The audience is read from Cloudflare's edge analytics for the day before (sampled; the
`sample_interval_avg` is committed beside every count) and, optionally, from the self-hosted
Umami for browser pageviews. Both halves fail closed to `unavailable` with a note when their
credentials are missing; the page then says the counter is in standby and estimates nothing.

## 4. Pre-registered neighbour search (run 2026-09-02, before the build)

Search terms, verbatim:

1. `daily trending topics aggregator cross-platform Google Trends Wikipedia Reddit Bluesky "trending" dashboard open data API 2026`
2. `"what's trending today" site with daily archive of trends across Google Wikipedia Bluesky Hacker News open JSON API CC0 "convergence"`
3. `"trending" cross-platform aggregator public page daily archive Google Trends Wikipedia Hacker News Bluesky Mastodon open data JSON API 2026`
4. `which AI crawlers fetch my page daily public dashboard site publishes its own AI bot traffic per crawler open data`

Every neighbour cited in the audit was fetched the same day; three candidates were dropped
because they did not resolve (a redirect loop, a 403 wall, an unresolvable host). The verdict
is ADDED VALUE, provisional: each half is occupied on its own, the union is not.

## 5. The crawler exception (Frank's decision, 2026-09-02, wording private)

The site's crawler policy of 2026-07-26 is "cite, don't train" (`docs/design/2026-07-26-crawler-politik.md`).
For `/trending*` — CC0 data built for machine readers, containing no text of Frank's and no
personal data — training crawlers are admitted too. Declared in `public/robots.txt` (an
`Allow: /trending` and a per-group `Content-Signal … ai-train=yes` inside each training-crawler
group; the site default stays `ai-train=no`) and in `public/llms.txt`. The edge still has the
last word: the same crawlers are on *Block* in Cloudflare's AI Crawl Control, so the exception
takes effect only after the dashboard actions in §7. Until then the audience file will show
their requests under `other_status`, which is the honest reading of a policy declared but not
yet enforced.

## 6. Cost ceiling

Nothing paid. GitHub Actions minutes for one ~60-second run a day; Cloudflare's Free plan
(analytics retention seven days, 24-hour query window — which is why the audience is read once
a night and committed); the existing Umami instance. If the day file's size becomes a repository
problem (it is generated JSON of 100–200 KB), the Wikipedia cut moves from fifty to twenty-five
per language — a rule change on the method sheet, never a rewrite of a committed day.

## 7. What waits for Frank

- Cloudflare API token with **Zone · Analytics · Read** for frankbueltge.de → repository secret
  `CF_ANALYTICS_TOKEN`; the zone id → repository variable `CF_ZONE_ID`.
- AI Crawl Control → Crawlers: GPTBot, ClaudeBot, CCBot, meta-externalagent, Bytespider and
  Diffbot from *Block* to *Allow*; then one WAF custom rule (Block) with the expression
  `(http.user_agent contains "GPTBot" or http.user_agent contains "ClaudeBot" or http.user_agent contains "CCBot" or http.user_agent contains "meta-externalagent" or http.user_agent contains "Bytespider" or http.user_agent contains "Diffbot") and not starts_with(http.request.uri.path, "/trending")`,
  so the rest of the site keeps its policy at the edge while `/trending*` is open.
- Optional: a view-only Umami user → `UMAMI_API_URL`, `UMAMI_USERNAME`, `UMAMI_PASSWORD`.
- Optional: `INDEXNOW_KEY` (`openssl rand -hex 16`) → the deploy writes the key file and pings
  IndexNow after every deploy; without it both steps exit silently.
- Everything that leaves the house waits for his button, as always: a Show HN or r/datasets
  post for the JSON, awesome-list and public-API directory submissions, Search Console, and
  publishing an MCP server (buildable here first).

## 8. What this is not

No language model writes anything on the page: every label is a source's own label, every count
a source's own count, the cross-check a token rule on the method sheet. No article bodies are
committed — titles, URLs and counts only (`no-committed-sources.yml`). No request-time code, no
database, no wrangler configuration (`docs/design/2026-08-03-two-deployers-one-project.md`).

## 9. Layer 2 — Arcs (added 2026-09-02, Frank's go, wording private)

### What it is

A term tracker with a discovery pass, beside the day ledger. Layer 1 answers "what converged
today"; layer 2 answers "which words are building, and how fast". A watchlist of terms
(`pipelines/trending/src/trending/data/watchlist.json`) is searched once a night on each
platform's own search API; every term gets a mention count per platform over three windows, a
status, a first-seen date and up to a dozen receipts — the titles, links and dates the counts
were made from. The run also reads a thirty-day corpus of titles, extracts bigrams and
trigrams, and publishes the strongest n-grams that are *not* on the watchlist as candidates.
Each tracked term becomes a page at `/trending/topics/<slug>`; the hub lists them all at
`/trending/topics/`, with the candidates under "what the machine noticed".

### Why

The day ledger records spikes. An editorial reader — someone deciding what to write next week,
not what happened yesterday — needs the other movement: terms that build over weeks in blogs,
forums, papers and code long before a search-trend surface ever shows them. That movement is
sold, not published: every neighbour scores it behind a subscription and keeps the evidence
(audit §19 (b), (c)). Counting the mentions ourselves, in the open, with the links we counted,
is the part nobody occupies — and it is measurable, so it can fail in public.

### Contract, in short

`src/data/trending/terms/YYYY-MM-DD.json`, `$contract: "trending-terms/1"`, one file per run
day, never rewritten. Envelope: `date`, `generated_at`, `pipeline_version`, `method_version`,
`windows` (one day, seven days, thirty days), one `sources` report per platform searched with
`status` `ok | partial | unavailable` and a note. Then `terms[]`, in watchlist order: `slug`,
`term`, `aliases`, `added`, `origin` (`editorial | discovered`), `note`, an optional
`wikipedia_article`, `counts` per platform per window with a `capped` flag where a feed truncates,
`total` per window (Wikipedia pageviews excluded from it, being a different unit), `ratio`,
`status`, `first_seen` and `receipts` (at most twelve, newest first, deduped by URL). Then
`candidates[]` and a `summary`. Platforms, in fixed order: Hacker News (Algolia search), Google
News (RSS search), GitHub (repository search), arXiv (API), Reddit (search RSS), Wikipedia
pageviews. All keyless except GitHub, which uses the workflow's own token when present and
throttles when not. A platform that fails becomes a note with `unavailable`, never a crash and
never an estimate.

### Status rule

Six thresholds, all in `pipelines/trending/src/trending/data/rules.json` and printed on the
method sheet, evaluated in one fixed order: too few mentions in the last seven days → **quiet**;
otherwise a seven-day total that outruns the pace of the three weeks before it by the rising
factor → **rising**, and **emerging** instead when the term's first receipt is recent; a
seven-day total that falls below the fading factor of that same prior pace → **fading**;
neither, with enough mentions over thirty days → **established**; anything left → **quiet**.
The prior pace is the thirty-day total minus the seven-day total, spread over the twenty-three
days between them and scaled to seven. No model, no smoothing, no hand-tuning per term: the
same arithmetic for every word, and the numbers it ran on are in the file beside the verdict.

### Discovery rule

The corpus is titles only (plus a short GitHub description), thirty days, four platforms: Hacker
News front-page stories, dev.to top articles, arXiv in four computer-science categories, and the
most-starred repositories created in the window. Tokenised by the same rule the convergence
layer uses, then bigrams and trigrams over adjacent kept tokens. Each n-gram is counted in
*documents*, not occurrences, separately for the recent half and the prior half of the window and
normalised per day; the ratio between those rates ranks it, after n-grams are dropped for being
too rare, single-platform, blocklisted as generic (`ngram_blocklist.json`), a substring of a term
already watched, or built from very short tokens. Top thirty are published. Nothing is invented:
a candidate always carries the platforms it appeared on and one sample document.

### Watchlist governance — humans add, the machine proposes

The machine may only ever *propose*. Promotion from candidate to tracked term is an edit to
`watchlist.json` by a person, and the file records who decided what and when: `added` (the date),
`origin` (`editorial` for a human seed, `discovered` for a promoted candidate), and `note` (the
occasion in one line). A term is never added by a threshold, a score or a pipeline run, and no
run removes one. This is the same rule the Atlas-Scout works under — a nightly reader may grow a
catalogue's *candidates*, never its canon — and it is why the candidate list is published rather
than silently consumed: a reader can see what was offered and declined. Retiring a term is also a
human edit; the committed day files that mention it stay exactly as they were, because a
committed dated file is never rewritten.

### Why this is the SEO/GEO layer

One stable landing page per tracked term, refreshed daily, at a URL that does not move: that is
the shape both a search index and a retrieval agent reward. A term page answers a real long-tail
question ("is *loop engineering* actually growing?") with a number, a date, a rule and a list of
sources — the kind of page that gets cited rather than skimmed, and the kind an agent can quote
without hallucinating. The day ledger is one URL that changes completely every morning; the arcs
are dozens of URLs that each accumulate history at one address. Every term page ships a JSON
edition beside it, a `DefinedTerm` inside a `Dataset` in JSON-LD, and a line in `llms.txt`.
Growth is read from the same audience files as layer 1 (§3) — if the term pages draw no machine
readers either, the kill reading of §3 covers them.

### Pre-registered neighbour search for layer 2 (run 2026-09-02, before the build)

Search terms, verbatim:

1. `open source trend tracker per term hacker news github arxiv mentions over time`
2. `emerging topics tracker open data receipts`
3. `exploding topics open source alternative`

Findings went into audit §19 (b): Exploding Topics sharpened, and Glimpse, Treendly, Google
Trends' rising related searches and TopicRadar added. The one stronger find was **TopicRadar**,
a paid closed-source Apify actor over seven developer platforms — it holds the receipts and
gives them only to the caller. Search 3 returned no open-source per-term tracker at all;
the nearest free things are Google Trends itself and `pytrends`, a client for it. **Dropped
for not resolving:** TrendHunter (`https://www.trendhunter.com/`, HTTP 403 bot wall to both a
plain request and a fetch) — an editorial trend-report business in any case, not a measurement.
Every other neighbour above was fetched on 2026-09-02 and returned HTTP 200.
