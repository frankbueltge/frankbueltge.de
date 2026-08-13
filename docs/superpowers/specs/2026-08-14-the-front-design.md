# The Front: the half-life of a news story (design proposal, 2026-08-14)

**Status.** Proposal, not commissioned. From the 2026-08-13 brainstorm; working title;
wording gate applies.

**Candidate landing.** Lab experiment, counter-measurement adjacent (it measures editorial
attention allocation — the resource the rest of the lab's instruments compete for).

## 1. The claim

> A story does not end when it stops being true; it ends when it leaves the front page.
> The Front measures how long stories survive on the world's homepages — the half-life of
> editorial attention — and which stories the front pages drop while they are still
> unfolding.

Daily outputs: (1) the **half-life curve** — survival function of links on ~50,000
homepages (median hours from first front-page appearance to disappearance), overall and by
topic class; (2) **dropped-while-alive** — stories that left front pages while their
underlying event (per GDACS / event stream) was still active.

## 2. Prior art and daylight (USP duty)

From the 2026-08-13 passes:

- **GDELT Global Frontpage Graph (GFG)**: the data exists precisely for this — hourly
  scans of ~50k news homepages, every outlink, 580 billion rows, live (verified via
  BigQuery metadata 2026-08-13). GDELT published the dataset and announcement blog; no
  instrument.
- **PastPages / storytracker** (Ben Welsh): homepage screenshot archive + toolkit —
  archival and retrospective, project retired.
- **Chartbeat / NewsWhip**: commercial newsroom analytics measuring *audience* attention;
  internal, paywalled, per-client — not a public measure of *editorial* attention.
- Academic homepage-curation studies exist (one-shot corpora); no living public metric.

**Daylight verdict (provisional — same flag as the world chamber):** "half-life of news on
the world's front pages, published daily" appears unoccupied; the concept is adjacent to
much scholarship, so the formal §2 search is sealed before build (pre-registered terms:
"news homepage lifespan study", "story survival front page", "editorial agenda dynamics
dashboard", storytracker successors).

**Machine bar.** 50k homepages × 24 scans × every link, daily, forever. Yes.

## 3. Method v1

- **Nightly BigQuery step** (GCP G1 conditions apply — committed trace, partition filters,
  column pruning; `gfg_partitioned` is 86 TB *total*, so the query discipline is not
  optional but the daily partitions are modest): for the previous UTC day, per (domain,
  linked URL): first-seen hour, last-seen hour on the front page.
- **Survival computation** in the pipeline (not in BigQuery): Kaplan–Meier over link
  lifespans, censored at the day boundary (a story still on page at 23:00 is censored, not
  dead — the estimator handles this correctly and the method sheet says so in plain
  language). Published: median half-life, survival curve points, by outlet tier and
  region.
- **Dropped-while-alive:** join disappeared links against active GDACS episodes and the
  house pool's echo clusters — a story with an active event behind it that left the front
  pages is a record, with links.
- **Archive:** `src/data/front/<date>.json` + `latest.json`, immutable, nightly.

## 4. Honesty and limits

- Front pages are sampled hourly; sub-hour appearances are invisible. Lifespans are
  therefore lower-resolution than the claim "half-life" suggests — stated on the sheet,
  and the unit is hours, never minutes.
- A link leaving the homepage is not the story ending everywhere (apps, social, search
  keep serving it). The instrument measures the *front page* as the editorial statement
  it is — the page where a publication says what matters now.
- GFG's outlet list is GDELT's, with its documented Western/English skew; per-region
  curves are published so no single global number hides the skew.
- URL churn (same story, new URL) fragments lifespans; v1 does not stitch republications
  and says so (stitching via GSG embeddings is a named v2 candidate).

## 5. Gate check (Werkgruppe §2)

Provenance (BigQuery traces committed) ✓; a question ("how long does a story live, and
what gets dropped while still happening?") ✓; infrastructure disclosed (this is the most
query-cost-sensitive candidate — bytes billed published per run) ✓; leave-behind (open
pipeline, CC0 archive) ✓; proportionality (one daily query + local statistics) ✓.

## 6. Cost

The one candidate where cost needs a real check before commissioning: daily GFG partitions
are large. The spike (§8) measures actual bytes billed with full pruning; if a day's
disciplined query lands above the low single-digit € range, v1 narrows to a fixed outlet
panel (e.g. 2,000 homepages) and says so on the face of the instrument. Hard ceiling
stays the house's 10 €/month guideline.

## 7. Open questions

1. Bytes-billed reality of a pruned single-day GFG query (spike decides panel vs. full).
2. Topic classing in v1: none / GKG themes / echo clusters (recommendation: echo clusters
   — reuses house machinery, no new classifier).
3. Seal the §2 search (pre-registered above).

## 8. First spike

One hand-run query over one day with aggressive pruning; record bytes billed; compute the
survival curve for one day; sanity-check ten short-lived and ten long-lived links by
opening them. Half a day; the bytes-billed number is the go/no-go input.
