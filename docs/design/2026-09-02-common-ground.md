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

> The second half of that paragraph is superseded on 2026-09-03: the measurement is taken at
> the edge alone, and the sentence is kept as it stood rather than rewritten. See §12.

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
  `(http.user_agent contains "GPTBot" or http.user_agent contains "ClaudeBot" or http.user_agent contains "CCBot" or http.user_agent contains "meta-externalagent" or http.user_agent contains "Bytespider" or http.user_agent contains "Diffbot") and not starts_with(http.request.uri.path, "/trending") and not http.request.uri.path in {"/robots.txt" "/llms.txt"} and not starts_with(http.request.uri.path, "/sitemap")`,
  so the rest of the site keeps its policy at the edge while `/trending*` is open.
- ~~Optional: a view-only Umami user → `UMAMI_API_URL`, `UMAMI_USERNAME`, `UMAMI_PASSWORD`.~~
  Withdrawn 2026-09-03: nothing waits for these, because this measurement no longer reads a
  browser beacon (§12). Umami itself stays embedded site-wide and unaffected.
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
(`src/data/trending/watchlist.json` since the amendment of 2026-09-02 below; it lived in the
pipeline package on the first day) is searched once a night on each
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
`candidates[]`, `promoted[]` and `let_go[]` (both added by the amendment of 2026-09-02, both
optional with an empty list as the default, so every file committed before that day still parses),
and a `summary`. Platforms, in fixed order: Hacker News (Algolia search), Google
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

### Discovery rule (corpus superseded 2026-09-02 — see the governance amendment below)

The n-gram arithmetic below still stands. The CORPUS does not: discovery reads the house's own
committed day files as of 2026-09-02, with the four platforms named here kept beside them for
depth. Why, and what it reads instead, is in the amendment.

The corpus is titles only (plus a short GitHub description), thirty days, four platforms: Hacker
News front-page stories, dev.to top articles, arXiv in four computer-science categories, and the
most-starred repositories created in the window. Tokenised by the same rule the convergence
layer uses, then bigrams and trigrams over adjacent kept tokens. Each n-gram is counted in
*documents*, not occurrences, separately for the recent half and the prior half of the window and
normalised per day; the ratio between those rates ranks it, after n-grams are dropped for being
too rare, single-platform, blocklisted as generic (`ngram_blocklist.json`), a substring of a term
already watched, or built from very short tokens. Top thirty are published. Nothing is invented:
a candidate always carries the platforms it appeared on and one sample document.

### Watchlist governance — humans add, the machine proposes (SUPERSEDED 2026-09-02, see the amendment below)

> The machine may only ever *propose*. Promotion from candidate to tracked term is an edit to
> `watchlist.json` by a person, and the file records who decided what and when: `added` (the date),
> `origin` (`editorial` for a human seed, `discovered` for a promoted candidate), and `note` (the
> occasion in one line). A term is never added by a threshold, a score or a pipeline run, and no
> run removes one. This is the same rule the Atlas-Scout works under — a nightly reader may grow a
> catalogue's *candidates*, never its canon — and it is why the candidate list is published rather
> than silently consumed: a reader can see what was offered and declined. Retiring a term is also a
> human edit; the committed day files that mention it stay exactly as they were, because a
> committed dated file is never rewritten.

The paragraph above is the rule this layer was built with on 2026-09-02. It stood for one day and
is kept here unedited, because nothing in this house is silently rewritten. What replaces it:

### Watchlist governance, amended 2026-09-02 — the machine adds, the machine lets go of what it added, a person overrides both (Frank's decision, wording private)

**The reversal.** The default is turned around: a candidate is now promoted onto the watchlist by
the run itself, and a person *prunes*. Five conditions, all committed in
`pipelines/trending/src/trending/data/rules.json` and printed on the method sheet, and all five
must hold: the n-gram was proposed on `promote_days` consecutive days (default three, including
today); on at least two platforms each time; it was never retired before; the run has not already
promoted three terms in this one pass; and the watchlist stays under its ceiling of thirty-five
tracked terms, because every tracked term costs requests in the nightly. The run writes what it
promoted into the day file as `promoted[]` — the term, the consecutive days, the platforms, the
pace and a one-line note — and a promoted term is searched from the *next* run on, so the file
that promotes it carries the evidence and no counts. The hub says that in those words rather than
showing a row of zeros nobody measured.

**The other direction, symmetrical.** The run also lets go of what it added: a term with `origin:
"discovered"` that has been quiet or fading on every run for `retire_quiet_days` (default
twenty-one) is struck automatically, and the striking appears in the day file as `let_go[]` with
the days it stood still and the reason. A term a person put on the list (`origin: "editorial"`) is
never struck this way. A person overrides both directions — striking a term the run promoted, or
seeding one the run would never have found.

**Tombstones.** A struck term keeps its line in `src/data/trending/watchlist.json` and gains
`retired` (the day) and, where there is one, `retired_note` (the reason). The tombstone is not
bookkeeping: it is the mechanism. Because the line stays, the discovery pass can never re-promote
a term that was struck, whoever struck it, and the pruning cannot be undone by tomorrow's
threshold. Deleting the line would undo the striking rather than record it. The committed day
files that mention a struck term stay exactly as they were, because a committed dated file is
never rewritten.

**The live watchlist as a committed file.** `src/data/trending/watchlist.json` holds the list the
nightly reads: `{ term, slug, aliases[], added, origin, note, wikipedia_article|null }` per entry,
plus `retired` and `retired_note` on a struck one. It is the one file of this contract that is
rewritten rather than dated — the dated record of every change is in the day files (`promoted[]`,
`let_go[]`) and in the `origin`/`added`/`note` of every term of every run.

**Why.** Two reasons, both failures of the first design rather than second thoughts about it.
(1) *The surface was watching a fixed list, not finding trends.* With promotion behind a hand
edit, `/trending/topics` published exactly the twenty phrases someone had thought of, refreshed
daily — an editorial watchlist with a counter attached. The candidate list underneath it made the
gap visible: the machine kept noticing words that then waited for an editor who had no reason to
act on them. A surface called "trends in the making" that can only ever contain what an editor
already had in mind is answering a different question than the one it advertises. (2) *The
discovery corpus was too narrow to see anything outside technology.* It read four live tech
platforms — a link aggregator's front page, a developer blog, machine-learning preprints, new
repositories — so every candidate it could ever propose was a technology phrase, and the layer
could not have found an arc in culture, politics, sport, apps or markets even in principle.
Discovery now reads the house's own committed day files instead, which since 2026-09-02 carry
twenty sources (search interest in ten countries, news, forums, encyclopaedia reading in six
languages, app and game charts, model releases, prediction markets), with the four live archives
kept beside them for depth while the archive is young. Reading our own archive also means the
discovery evidence is checkable after the fact: the day file that proposed a term is committed,
so anyone can recount the three days that promoted it.

**What the reversal costs, and why that is acceptable.** A rule that promotes by itself will put
words on the list no editor would have chosen; the ceiling, the three-a-run cap and the
tombstones are what keep that from becoming noise, and the pruning is a published act with a
date and a reason rather than a silent deletion. The Atlas-Scout comparison in the superseded
paragraph does not carry over: a catalogue's canon is a claim about works, while this watchlist is
a claim about nothing except which phrases are being counted — a term on it is not an
endorsement, and its own numbers are what decide whether it stays.

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

## 10. The self-check — the first loop around the pipeline (Frank's go, 2026-09-02, wording private)

The run now grades its own record before writing it: a rubric in `pipelines/trending/src/trending/quality.py`
(day: sources answering, signals present, no giant cluster, labels sane, topic ids unique, Wikipedia
filter held, size within bounds; arcs: platforms answering, windows nesting, statuses named, receipts
complete, candidates bounded, size within bounds), thresholds under the `quality_*` keys of
`rules.json`, the verdict written into the record as `quality` with the rubric version. One repair is
allowed on the spot — a source that did not answer is asked once more after a pause. Everything else is
recorded as it is: a failed check does not stop the file, the workflow log carries a warning, and the
day page and the topics hub show the grade beside the date, spelling out every failed check. This is
the first of the three loop stages named in the decision of 2026-09-02: observe the output, judge it,
mend the one thing that can be mended, publish the verdict. The second stage — adapting the committed
knobs to the audience series — waits for an audience series to exist.

## 11. The rule on trial — a labelled set and a score (2026-09-02, Frank's go, wording private)

The convergence rule makes one decision over and over: are these two signals the same topic?
Until now that decision was defended by argument. It is now defended against judgements written
down by hand, in the form the neighbourhood calls a task-owned evaluator: the metric and the
labels belong to this experiment, not to a harness.

**The instrument.** `pipelines/trending/src/trending/evaluate.py` draws a sheet from a committed
day — every pair the rule joined, plus a deterministic sample of near misses, meaning pairs that
share a word and were *not* joined — and writes it to
`src/data/trending/eval/<date>-pairs.json` with `same_topic: null` on every entry. A person fills
those in. The criterion is written into the sheet before the judging starts: two signals are the
same topic when a reader looking for one would want the other; sharing only a word, a genre or a
place is not enough. The sheet also names the labeller, because a judgement is editorial and not
a measurement, and anyone may overrule a single label with git keeping the change. Pairs that
share no word at all are left off the sheet: they are the overwhelming majority and judging them
teaches nothing.

`score` re-runs the rule against the labels rather than reading the sheet's own verdict, which is
the whole reason to keep them — the same labels can measure a changed threshold. `sweep` reports
the same labels against a range of thresholds and writes nothing: a threshold is changed by a
person editing `rules.json`, with the table as the reason.

**First measurement, day of 2026-09-02, 55 judged pairs across the day's eight sources:**

| | |
|---|---|
| precision | 1.0 (no pair joined that a reader would call two topics) |
| recall | 0.652 (eight of twenty-three true joins missed) |
| f1 | 0.789 |

**And the first thing it refuted.** The sweep shows the threshold is not what binds: between
`jaccard_min` 0.35 and 0.8 the score does not move at all, and 0.3 buys one false join without
buying a single catch. So the misses are the shape of the rule, not its number. Two of them name
the shape exactly: two outlets describing one event share only common nouns ("Nepal mountain
collapse causes floods" against "Some missing tourists make contact as Nepal floods"), and a
one-word label such as a hashtag can only ever match another label exactly ("usps" against "USPS
mail ballot handling"). Weighting a shared word by how rare it is in the day would address both
and would stay deterministic and disclosable. It is not built. The labelled set is what will
decide it, which is the point of having one.

**One honest limit of the measure.** It scores the pair decision, not the cluster. Because the
clustering is a union of pairs, a missed pair can still land in the right cluster through a third
signal — the Apple Maps and MapQuest headlines were not joined to each other, yet both were
joined to the Lake Ontario article and so ended in one topic. A cluster-level measure would need
labels of a different kind and is not claimed here.

## 12. The audience is counted at the edge, not in the browser (2026-09-03, Frank's decision, wording private)

**What was red.** The audience file had two halves. `edge` came from Cloudflare's edge
analytics and saw every request, crawlers included. `umami` came from the site's own
client-side beacon — and it had read `unavailable` on both committed days, which the page
dutifully printed as a standby column, as though a number were on its way.

**The reason it is retired here is structural, not practical.** It is not that the beacon's
credentials are missing and could be supplied. A client-side beacon is JavaScript: it fires
only for a reader that executes JavaScript. Almost no crawler does — and the readers this page
was built for (§2, §3: search indexers and AI retrieval agents) are exactly those crawlers.
Umami additionally drops known bot user agents server-side, so even a crawler that did execute
the script would be discarded before it was counted. The beacon therefore cannot answer the
question `/trending` asks, in principle and not by accident, and a half that will report
"unavailable" for ever implies that something is missing when nothing is. What is left is what
the edge already answers completely: every request that arrived, classified by its own declared
user agent.

**What is not retired.** Umami stays embedded site-wide, unchanged: cookieless, without
fingerprinting, first-party through the `/stats` proxy to the self-hosted instance, named in the
privacy policy (`src/data/legal.ts`) and described in `.claude/rules/runtime-and-works.md`. It
measures human reach for the site as a whole, which is a different question from who fetches
one page. This decision touches one measurement — the audience file of the trending ledger —
and nothing else.

**The contract, in short.** `src/data/trending/audience/YYYY-MM-DD.json`, `$contract:
"trending-audience/2"`. Envelope unchanged: `day`, `generated_at`. One half, `edge`, with the
keys it already had — `status` (`ok | unavailable`), `note`, `source`, `window`,
`sample_interval_avg`, `total`, `paths`, `classes`, `bots[]` — and three new ones:

- `countries`: the top ten visitor countries by requests, or `null`.
- `referers`: the top ten referring hosts by requests, or `null` — host names only, never a
  full URL, and a request that declares no referrer is in no row, so the rows do not sum to the
  day's total.
- `extra_note`: why `countries` / `referers` are `null`, when they are; empty otherwise.

There is no `umami` key. `null` in either dimension means "not available on this plan, see
`extra_note`" and is never rendered as a zero: the page prints the reason in the provenance line
of the audience table instead of drawing an empty table.

**Unverified at the time of writing.** Whether the Free plan exposes `clientCountryName` and
`refererHost` on `httpRequestsAdaptiveGroups` at zone scope could not be confirmed — the test
token had expired. So the pipeline *asks* for both dimensions and records the refusal in
`extra_note` rather than assuming either way, and the surface is built for both outcomes. The
first committed `/2` file is what settles it.

**The two `/1` files stay untouched.** `2026-09-01.json` and `2026-09-02.json` keep their
`umami` half exactly as committed — a dated file in this house is never rewritten. Everything
that reads these files therefore accepts both contracts: `src/lib/trending/schema.ts` takes
`trending-audience/1` or `/2` with `umami` optional, and the surface shows the beacon column
only while a file that has that half is in the drawn window, with a dash for the days that never
had it. Once the two old days fall out of the thirty-day window the column disappears on its
own, rather than standing there reading "unavailable" for ever.

**Evidence.** `src/lib/trending/types.ts`, `src/lib/trending/schema.ts`,
`src/lib/trending/view.ts` (`audienceHasUmami`, `audienceDimensionRows`,
`audienceMissingDimensions`), `src/lib/trending/markdown.ts`,
`src/components/pages/TrendingAudience.astro`, `src/components/pages/MethodenblattTrending.astro`
§2 and §4, `pipelines/trending/src/trending/audience.py`, `public/llms.txt`.
