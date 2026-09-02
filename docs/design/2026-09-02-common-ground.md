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
