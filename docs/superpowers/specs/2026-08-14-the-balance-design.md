# The Balance: the emotional trade balance of the world's press (design proposal, 2026-08-14)

**Status.** Proposal, not commissioned. Written on Frank's request ("lass doch alle specs
mal abarbeiten", 2026-08-13 late) after the GDELT capability review and two prior-art
research passes of 2026-08-13. Nothing here is built; no werk entry, no naming decision.
All names in this document are working titles — final wording passes the wording gate
(`src/config/naming.ts`, `docs/wording-kanon.md`).

**Candidate landing.** Lab experiment on frankbueltge.de, counter-measurement line
(Meridian's core remit since v2 — any engine involvement travels as a seed/offer under the
practice constitution, never as a decree from this spec).

**Occasion.** The Consensus reads ~116k articles/day from ~6,200 domains out of GDELT's
raw 15-minute GKG 2.1 files and currently uses 4 of 27 columns. The unused `V2GCAM` column
carries 2,989 emotion/theme dimensions from 40 dictionaries (16 languages native, 65 more
machine-translated); `V2ENHANCEDLOCATIONS` carries every place an article mentions. Frank's
question — "can we draw a per-country mood picture with history?" — is answerable from data
the house already downloads nightly. The prior-art pass showed the naive answer is taken;
this spec describes the version that is not.

## 1. The claim

> Every day, each country runs an emotional trade balance in the world's press: what its
> own newsrooms transmit about it, against what the world's newsrooms transmit about it.
> The Balance measures both sides, publishes the difference, and archives it forever.

Three measurements per country and day, from the same article pool:

1. **Self-image**: emotion profile of articles *from* country C *about* country C
   (source country = C, mentioned location includes C).
2. **Foreign image**: emotion profile of articles *about* C from everywhere else
   (source country ≠ C, mentioned location includes C).
3. **The balance**: the per-emotion difference — who exports fear, who imports pity,
   whose self-image and foreign image diverge furthest today.

Plus dyads: for high-volume country pairs, X→Y against Y→X. The per-country mood
timelines Frank asked for (anxious / angry / sad / hopeful, with history) fall out of
measurement 1 and 2 as a by-product — framed strictly as the weather of the *press*.

## 2. Prior art and daylight (USP duty)

Verified 2026-08-13 (research pass, live checks):

- **GDELT itself**: per-country *tone* timeline in one URL (DOC 2.0 API `timelinetone` +
  `sourcecountry:`), rolling ~3-month window, tone only — no GCAM emotions exposed, no
  frozen snapshots. https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
- **moodglobe.com** (live 2025/26): GDELT tone world map, 15-min refresh, no emotions, no
  archive, anonymous method.
- **worldmoodtracker.com** (live): nearest neighbour — daily happy/worried/angry/sad/neutral
  labels for 133+ countries; undisclosed model, 30-day window, no data download, nothing
  citable.
- **Hedonometer** (hedonometer.org): the famous daily-mood chair, empty since 2023-05-26
  (Twitter API shutdown; verified against its own API). Its labMT dictionaries live on
  inside GCAM.
- **Gallup Global Emotions / World Happiness Report**: annual *surveys* of how people feel —
  different genus (population, not press), and the natural yearly ground-truth comparison.
- **Dyadic angle**: academically proven measurable (Makarin et al., "The War of Ideas:
  Institutions and Global Media Bias", dyadic GDELT tone), no living public instrument
  anywhere. The asymmetry framing ("emotional trade balance", self- vs. foreign image as a
  daily ledger) is unclaimed.
- **RavenPack / Bloomberg**: country sentiment in real time — paywalled finance products,
  no public archive.

**Daylight verdict.** A tone-coloured country map is a commodity (twice productized, free
API underneath). Unclaimed: (a) the dyadic asymmetry as a living instrument, (b) per-emotion
multi-dictionary measurement with disclosed method, (c) a citable, immutable daily archive
(GDELT's API forgets after ~3 months; no neighbour freezes snapshots), (d) the published
divergence between press weather and Gallup's surveyed national mood. The Balance leads
with (a) and carries (b)–(d).

**Machine bar.** Reading 116k+ articles/day across 65 languages and computing a full
country×country emotion matrix daily is not a human-feasible practice.

## 3. Method v1

**Pool.** The nightly raw-file fetch The Consensus already performs (96 × 15-minute GKG 2.1
files), extended by the **translation stream** (`<stamp>.translation.gkg.csv.zip`, same
host, same format) — without it, a "world" balance is an anglophone balance. If the
translation stream is deferred to v2, the anglophone skew is disclosed on the face of the
instrument, not in a footnote.

**Per-article extraction** (extends `pipelines/newspool/fetch_pool.py` behind a flag, so
The Consensus' existing behaviour is untouched):

- `V2SOURCECOMMONNAME` (domain) → source country via a **committed snapshot** of
  `gdelt-bq.extra.sourcesbycountry` (37,802 domains; refreshed deliberately, versioned,
  with GDELT attribution — never fetched at site runtime).
- `V2ENHANCEDLOCATIONS` → set of mentioned countries (country-level resolution only in v1).
- `V2GCAM` (sparse `key:value` pairs) → a **fixed, versioned dimension set**, not all 2,989:
  one dimension per target emotion, chosen from documented dictionaries (working set:
  LIWC anxiety / anger / sadness; WordNet Affect joy; ANEW valence; Moral Foundations
  care/harm; labMT happiness), each named with its `DictionaryID.DimensionID` code in the
  method sheet. `wc:` (word count) is the normalizer.
- `V1.5TONE` tone as the compatibility measure (comparable to neighbours, never the headline).

**Aggregation.** Per country and day, for SELF and FOREIGN pools separately: matches per
1,000 words per dimension, winsorized mean across articles, with `n` (article count)
always published. Below a minimum `n` (v1: 25 articles per pool) the finding is withheld —
"no finding today" is a disclosed state, never interpolated (house rule: a gap is a gap).

**Baseline and drift.** Headline values are **z-scores against a rolling 90-day
per-country baseline**, raw rates published alongside. Reason: news negativity has a
documented secular drift (Rozado et al. 2022, PLOS ONE — 23M headlines, rising
anger/fear/sadness since 2000); an instrument that shows raw sadness forever shows "sadder
than last year" for structural reasons. The drift itself is disclosed on the method sheet.

**Dyads.** X→Y emotion vector for all ordered pairs with `n ≥ 25` on the day; published as
the day's widest asymmetries, full matrix in the archive JSON.

**Archive.** `src/data/balance/<date>.json` + `latest.json`, committed nightly by the
pipeline (same pattern and author as the protokoll pipelines). Immutable once committed;
no backfill; method version stamped in every record (the Consensus v1→v2 break is the
model for disclosing method changes).

**Gallup layer (yearly).** When Gallup Global Emotions publishes, the instrument commits
one comparison record: press-weather aggregates vs. surveyed emotions per country, with
the divergence shown — the honesty layer as a feature.

## 4. Honesty and limits

- **Framing is binding:** the instrument measures *portrayal* — "the emotional weather of
  the press", never "how country X feels". Every surface says so. This is also why the
  balance framing is load-bearing: portrayal-vs-portrayal is exactly what tone measures.
- Document-level GCAM cannot attach emotion to a specific mentioned country within one
  article; co-mention noise is real. v1 mitigates by requiring the location match and
  discloses the limit; entity-level sentiment is explicitly out of scope (GDELT's GEG
  entity-sentiment tables are frozen since 2019 — verified).
- Machine translation degrades dictionary matching unevenly across languages; per-language
  `n` is published so the reader can see whose voice carries a country's self-image.
- Syndication inflates pools (The Consensus exists because of this). v1 dedupes by URL as
  the pool does; echo-cluster weighting (down-weighting verbatim copies using Consensus
  clusters) is a named v2 candidate, not silently applied.
- GDELT's source list is not the world's press; coverage bias is documented in the
  academic critiques and named on the method sheet.

## 5. Gate check (Werkgruppe §2)

1. *Real data, open provenance* — raw-file URLs + SHA256 manifests (newspool pattern),
   committed lookup snapshots, GCAM codebook linked. ✓
2. *A question, not an effect* — "whose self-image and foreign image diverge, in which
   emotion, since when?" is a checkable claim per day. ✓
3. *Infrastructure as part of the statement* — fetch volume, compute footprint, and the
   withheld-finding thresholds are on the method sheet. ✓
4. *Leave-behind* — open pipeline code, versioned archive JSONs (CC0 per house licence),
   documented dimension set. ✓
5. *Proportionality* — one nightly batch, static site, no live cloud reads. ✓

## 6. Cost and infrastructure

- v1 runs entirely on raw-file downloads (no new services). Translation stream roughly
  doubles nightly transfer (~1.4 GB total) — GitHub Actions capacity, zero cost.
- Optional BigQuery use (historical backfill of *baselines only*, never of daily records)
  falls under the GCP conditions in `.claude/rules/pipelines-and-archive.md`: committed
  trace (query text, job ID, bytes billed), GDELT citation + link, cost discipline
  (partition filters; well under the 10 €/month guideline).
- GDELT licence: open with attribution — "GDELT Project, https://www.gdeltproject.org/"
  on every surface that shows the data.

## 7. Open questions

1. Dimension set: which exact GCAM codes make the v1 emotion set (needs a one-day
   empirical check of coverage/sparsity per dimension before freezing).
2. Translation stream in v1 or disclosed-skew v1 without it? (Recommendation: fetch it —
   the instrument's claim is about the *world's* press.)
3. Minimum-`n` threshold: 25 is a guess; the spike (§8) calibrates it.
4. Whether the mood-timeline by-product gets its own surface or stays a view within
   The Balance (recommendation: one werk, two views — avoids a commodity-map sibling).

## 8. First spike (before any commitment)

One afternoon, zero new infrastructure: extend the newspool parser behind a flag to emit
GCAM + locations for **one** UTC day; join against the sourcesbycountry snapshot; compute
SELF/FOREIGN vectors for the top-40 countries; check (a) per-pool `n` distributions,
(b) whether the asymmetry signal clears the co-mention noise floor, (c) dimension
sparsity. The spike's output decides §7.1–.3 and whether the instrument is commissioned.
