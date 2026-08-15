# Editorial Deadline, second chamber: the world's deletions (extension proposal, 2026-08-14)

**Status: BUILT since 2026-08-14** (updated 2026-08-15; the header still said "proposal, not
commissioned" a day after the chamber went in). Chamber 2 runs as a nightly BigQuery step in
the `redaction` workflow (`pipelines/redaction/src/redaction/world/`, 84 pipeline tests) and
renders on `/redaction` with method sheet v2; its §2 prior-art search was sealed before the
build, as this spec required, and the audit verdict is ADDED VALUE with named kill
conditions (decision-log 2026-08-14, addendum 2 below).

**Still open, and it needs Frank's hand:** the GitHub secret `GCP_SA_KEY` — a service
account with BigQuery Job User on the house project. Until it exists, the chamber degrades
honestly (`gdg.available=false`) and the deletion measurement runs without GCP.

Extends an **existing werk** — Editorial Deadline (`/redaction`, `pipelines/redaction/`) —
rather than founding a new one. Frank's own read (2026-08-13, wording private): something
similar already exists as an experiment, so this could simply be extended rather than
founded anew. This spec is that extension, made concrete.

## 1. What exists, and what the chamber adds

**Chamber 1 (exists).** Editorial Deadline watches a curated watchlist of official pages
via the Wayback Machine CDX API and shows, daily, the most substantive text *removed* from
a public record — struck through, verifiable in two clicks. Depth: few pages, precise
diffs, archival evidence. Its subline: "what is quietly removed from the official public
record."

**Chamber 2 (proposed).** The same gesture at the scale of the world's press, from
GDELT's **Global Difference Graph** (`gdelt-bq.gdeltv2.gdg_partitioned` — live, verified
2026-08-13): GDELT recrawls every article at +24 h and +1 week and records deletions,
redirects, and title/text rewrites. Chamber 2 publishes daily:

1. **The disappearance rate** — share of the world's news articles deleted within 24 h /
   one week (GDELT's own historical analysis: ~0.68 % within 24 h, ~1.5 % within a week,
   42 % of eventual deletions in the first day). A number nobody watches, published as a
   curve.
2. **The day's vanished headlines** — a bounded selection of deleted articles where **the
   house holds the receipt**: our nightly newspool archive committed the original title
   and first-seen timestamp *before* the article vanished. GDELT reports the deletion; our
   own git history proves what stood there. No other party can silently disagree with
   both.

The two chambers answer as one instrument: what is quietly removed — from the official
record (depth) and from the record of record (breadth).

## 2. Prior art and daylight (USP duty — needs completion before build)

Known neighbours from the 2026-08-13 pass:

- **NewsDiffs** (newsdiffs.org): tracked revisions of major US outlets' articles;
  effectively dead for years.
- **diffengine** (Ed Summers / Documenting the Now): per-outlet RSS diff bots posting
  edits to social accounts; per-outlet, curatorial, not metric, several instances dormant.
- **GDELT GDG itself**: publishes the *data* and one-off blog analyses; no living public
  instrument, no daily rate, no register.
- Chamber 1's own neighbours (Wayback-based government-page trackers, e.g. EDGI's work on
  environmental agency pages) remain as audited for the existing werk.

**Daylight, provisional:** a global daily *deletion-rate* instrument with receipt-backed
examples appears unoccupied. **Flag:** this candidate did not get the same depth of
verification as the others (the 2026-08-13 pass covered it summarily). Per the USP duty,
the formal nearest-neighbour search completes and is sealed **before** build — this spec
pre-registers the search terms: "news article deletion tracking", "stealth edit tracker
news", "memory hole news archive project", diffengine/NewsDiffs successors, academic work
on news unpublishing ("right to be forgotten" journalism studies).

**Machine bar.** Recrawl-scale change detection across the entire press is GDELT's
machine work; reading it daily and cross-proving against our own archived pool is ours.

## 3. Method v1

- **Nightly BigQuery step** (GCP G1 path, active since 2026-08-09): one partition-filtered
  query against `gdg_partitioned` for the previous UTC day — counts by change class
  (deleted / redirected / rewritten), plus the URL list of deletions. Committed trace as
  required: query text, job ID, bytes billed (`.claude/rules/pipelines-and-archive.md`).
- **Receipt join:** deletions ∩ our committed `pool.jsonl` URLs of the matching day →
  vanished articles with house-archived titles. Only receipt-backed items are shown as
  examples; the rate uses the full GDG count.
- **Selection rule for display** (mirrors chamber 1's salience logic): rank by domain
  spread of the headline's echo cluster (a vanished headline that 30 domains carried is a
  different event than a vanished local notice). The rule is versioned; no editorial
  hand-picking.
- **Archive:** `src/data/redaction/world/<date>.json`, immutable, no backfill; the
  existing chamber's archive is untouched. One shared page (`/redaction`) presents both
  chambers; site work reuses the existing werk components.

## 4. Honesty and limits

- **Deletion is not censorship.** Articles vanish for banal reasons — CMS migrations,
  paywalling, corrections policy, licence expiry (agency copy has contractual takedown
  clocks). The instrument counts disappearance and shows receipts; it does not assert
  motive. The method sheet says this in the first paragraph.
- GDELT's recrawl schedule (+24 h, +1 wk) bounds what "deleted" means here; a page that
  dies at hour 30 and returns at day 6 is disclosed as GDELT classifies it, with the
  classification linked.
- Receipt coverage is partial: our pool holds the English-monitored stream; GDG covers
  more. The share of deletions with receipts is published — the gap is a number, not a
  silence.
- Wayback and GDG can disagree; where both exist, both are linked.

## 5. Gate check (Werkgruppe §2)

The werk passed the gate once; the chamber inherits and re-answers: provenance (BigQuery
trace + pool manifests committed) ✓; a question ("how much of yesterday's press no longer
exists, and what did it say?") ✓; infrastructure disclosed (query bytes, costs on the
method sheet) ✓; leave-behind (open pipeline, CC0 archive) ✓; proportionality (one query,
one join, nightly) ✓.

## 6. Cost

`gdg_partitioned` is 1.72 TB total; a single-day partition with column pruning is on the
order of single-digit GB per query — ≈ zero € at the free tier, hard within the
10 €/month guideline. GDELT citation + link on the chamber's surface.

## 7. Open questions

1. Seal the §2 prior-art search (pre-registered above) — condition for build.
2. Display bound: how many vanished headlines per day (recommendation: 3, mirroring
   chamber 1's restraint).
3. Whether rewritten-title pairs (before/after) join v1 or wait — recommendation: wait;
   deletions first, rewrites are a different reading experience.

## 8. First spike

One query, one day, by hand: pull yesterday's deletions from `gdg_partitioned`, join
against yesterday's committed pool, count receipts, eyeball ten random "deleted" URLs to
verify they are actually gone (measure GDG's false-deletion rate for ourselves before
trusting it nightly). Half a day, ~0 €.

## Addendum (2026-08-14, same night): spike executed — the chamber changes shape

The §8 spike ran against `gdg_partitioned` on 2026-08-14 (queries, job IDs and bytes
billed below). Findings, in order of consequence:

1. **The deletion class no longer exists in the GDG.** Across 2026-07-14..2026-08-13 the
   table contains exactly four statuses: `UNCHANGED_CONTENT` (22.2M), `PAGE_TEXTCHANGE`
   (3.76M), `PAGE_TITLECHANGE` (1.43M), `HTTP_REDIRECT` (478k). No 404/410/deleted
   records at all. The 2018 announcement's deletion rates (0.68 %/24 h) describe a
   retired pipeline version — §1's "disappearance rate from GDG" is **not buildable**.
2. **The stronger material was sitting next to it: rewritten headlines with before/after.**
   `PAGE_TITLECHANGE` carries `page_title` → `title_new` pairs — ~53.6k/day (14.7k
   English). A hand sample shows exactly the three classes the instrument needs to
   separate: trivial (encoding fixes, appended site names), running updates (casualty
   counts revised), and genuine reframings (actor/framing words exchanged in place).
   **v1 pivots to the rewrite register**; the versioned triviality filter becomes the
   method core.
3. **Deletion measurement moves in-house, sampled.** Feasibility test: 300 random URLs
   from the committed 2026-08-12 pool, rechecked ~40 h later — 262 reachable, 11 gone
   (1× 404, 10× **HTTP 451** "Unavailable For Legal Reasons"), 16× 403 bot-walls
   (disclosed as an *unverifiable* class, not counted as gone), 5× other. Sampled daily
   recheck of our own pool gives a deletion rate with confidence interval at ~2 min
   runtime. Caveat recorded: 451 from a German vantage point may mean EU geo-blocking
   rather than takedown — needs per-domain classification or a second vantage before the
   451 share is headlined; it may also be the most interesting number in the instrument.

**GCP trace** (per `.claude/rules/pipelines-and-archive.md`): jobs
`spike_gdg_status_20260814` (26.2 MB), `spike_gdg_httpcode_20260814` (26.2 MB),
`spike_gdg_30d_20260814` (743.4 MB), `spike_gdg_lang_20260814` (30.4 MB),
`spike_gdg_titles3_20260814` (133.2 MB) — ≈ 0.96 GB total, ≈ 0.005 € equivalent, within
free tier. Partition filter `DATE(fetchdate_check)`; the table is DAY-partitioned on
`fetchdate_check` (not `_PARTITIONTIME`).

**Gate consequence**: the spike *passed* in the sense that matters — it replaced a stale
claim with buildable material before anything was built. §1/§3 are to be read through
this addendum; the pre-registered §2 prior-art search still seals before build.

## Addendum 2 (2026-08-14, afternoon): §2 search SEALED

The pre-registered nearest-neighbour search ran in full (Tavily web search, 2026-08-14,
nine queries — the five pre-registered angles plus two the addendum's pivot made due:
rewrite-register neighbours and HTTP-451 measurement). Query log and findings:

1. *"news article deletion tracking"* — no instrument; fact-checker how-tos (Wayback,
   archive.today) and news-archiving discourse only.
2. *diffengine/NewsDiffs successors* — **News Sniffer (newssniffer.co.uk) is alive and
   industrial**: 2.7M articles, 5.25M versions, updating by the minute. The 2026-08-13
   pass had only declared NewsDiffs dead and diffengine dormant; this is the seal's most
   consequential find. Shape: browsable per-article revision archive of a handful of UK
   feeds — no rate, no classification, no global scale, no deletion measurement.
3. *"stealth edit tracker news"* — diffengine lineage (DocNow) confirmed; no living
   successor instrument.
4. *"memory hole news archive project"* — preservation discourse (RJI's "Dodging the
   Memory Hole" forums, ended ~2017; Russ Kick's Memory Hole sites, dead) — archiving
   advocacy, not measurement.
5. *News unpublishing academia ("right to be forgotten" journalism studies)* — Dwyer
   (UNC), IJoC "Unpublishing the News" (2019), CJR "Into Oblivion": policy ethnography of
   why newsrooms delete; no counting, no register.
6. *Quantitative disappearance rates* — one-off studies: Pew "When Online Content
   Disappears" (2024; 38 % of 2013's pages gone), Harvard LIL's NYT link-rot study
   (2021). Measured once, not daily, never from a self-committed archive.
7. *Post-publication headline-edit research* — **MediaSpin dataset (ICWSM 2026)**:
   78,910 headline-edit pairs annotated for 13 bias types (LLM pipeline + expert
   validation). Dataset + paper, not a living instrument; the chamber's triviality
   filter should cite its taxonomy as the academic benchmark.
8. *GDG-based instruments* — GDELT's own blog analyses only; no third-party surface.
9. *HTTP-451 prevalence measurement* — RFC 7725 explicitly anticipates third-party
   censorship statistics; no one runs a daily 451 census for news articles.

**Build-time GCP trace** (schema/dialect verification during the build, same rules as
nightly): job `world_build_langcheck_20260814` (~26 MB — `page_lang` literal is `en`,
13,790 en title changes on 2026-08-13); first production-shaped runs
`world_gdg_counts_20260813` / `world_gdg_titles_20260813` (+ `_rN`/`_tN` reruns, later
ones cache hits at 0 bytes billed) — all on the house project, all within free tier.
The nightly step commits its own trace into every day's JSON.

**Sealed verdict** (mirrored in `docs/audits/2026-08-09-usp-audit.md` §8, which the
knowledge graph serves): **ADDED VALUE.** The gesture (watch news revisions) is occupied
by News Sniffer; the bias-in-edits analysis exists academically (MediaSpin); the
instrument form — daily global rate + classified reframing register + receipt-backed,
self-committed deletion sample with disclosed unverifiable classes — is unoccupied
worldwide. Kill conditions: News Sniffer ships a global daily metric surface, or
MediaSpin goes live as a public daily instrument. **Build condition met; the chamber may
be built in the addendum-1 shape.**
