# Editorial Deadline, second chamber: the world's deletions (extension proposal, 2026-08-14)

**Status.** Proposal, not commissioned. Extends an **existing werk** — Editorial Deadline
(`/redaction`, `pipelines/redaction/`) — rather than founding a new one. Frank's own read
(2026-08-13): "v3 haben wir doch ähnlich schon als experiment … das könnte man einfach
erweitern/ergänzen." This spec is that extension, made concrete.

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
