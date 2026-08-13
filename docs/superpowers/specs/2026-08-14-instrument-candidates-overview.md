# Instrument candidates 2026-08: overview and map (2026-08-14)

**Status.** Index document for ten proposals, none commissioned. Frank's request
(2026-08-13, late): "lass doch alle specs mal abarbeiten, gründlich und step by step."
Every candidate below has its own spec; every spec ends in a cheap spike whose result —
not this document — decides whether the instrument is commissioned.

**Provenance.** Two brainstorm rounds on 2026-08-13, grounded in four research passes run
the same day: (1) GDELT ecosystem inventory (BigQuery tables verified live via `bq`
against `gdelt-bq`), (2) mood-map prior art, (3) open live-data-source map 2026,
(4) dedicated prior-art verification for the five "Verwandlungen" candidates. The
load-bearing findings and URLs are embedded in each spec's §2 — the specs are
self-contained; no session artifact is required reading.

**The seed observation.** The Consensus reads ~116k articles/day from GDELT's raw
15-minute GKG 2.1 files and uses 4 of 27 columns. Several candidates below need **no new
data at all** — they read more columns from files the house already fetches nightly.

## The ten candidates

| Spec | Claim in one line | Landing | Verdict (2026-08-13 passes) |
|---|---|---|---|
| `2026-08-14-the-balance-design.md` | Self-image vs. foreign image per country, per emotion, daily | Lab, counter-measurement | Daylight (dyadic ledger unclaimed; naive tone map is taken) |
| `2026-08-14-the-unwitnessed-design.md` | Attention per casualty; the register of uncovered crises | Lab, counter-measurement | Daylight (annual NGO PDFs exist; no living instrument) |
| `2026-08-14-editorial-deadline-world-chamber.md` | The world's news deletions, with house-held receipts | **Extension of existing werk** `/redaction` | Provisional daylight — §2 search pre-registered, seals before build |
| `2026-08-14-the-front-design.md` | Half-life of a story on 50k front pages | Lab | Provisional daylight — same condition |
| `2026-08-14-the-invoked-past-design.md` | Which past the press summons today; memory decay under proof | Lab | **Widest verified daylight** (GDELT built the field, never the tool) |
| `2026-08-14-tomorrows-names-proposal.md` | Cert birth vs. news birth: the future's head start | **Offer to Machine Attention** (sister chamber to The Foreknown) | Clearest novelty of the set |
| `2026-08-14-the-quieting-design.md` | Citizen-science silence as crisis shadow | Lab, science-leaning | Daylight, with engineered premise correction (war silences; lockdowns redistribute) |
| `2026-08-14-the-thinning-sky-design.md` | Upper-atmosphere climate read from falling satellites | Lab, science-leaning | Daylight on framing; narrowest window (active research race) |
| `2026-08-14-the-seismic-quiet-design.md` | Daily loudness of humanity from open seismometers | Lab, science-leaning | Daylight (2020 papers left an empty chair) |
| `2026-08-14-the-hum-design.md` | Open ENF archive: the grid timestamps every recording | Lab — **blocked** (data licensing) | Daylight behind a licence wall; paths out documented |

## Recommended order (a recommendation, not a decision)

1. **The Invoked Past** — cheapest (same files, zero new sources), widest verified
   daylight, and a published law (Candia 2019) to test against: the cleanest "under
   proof" piece. Spike: one afternoon.
2. **Editorial Deadline, world chamber** — smallest build (extends a standing werk),
   receipt mechanism is unique to this house. Condition: seal its §2 search first.
   Spike: half a day, ~0 €.
3. **The Balance** — the largest claim and the answer to the original mood-picture
   question; commission after its calibration spike.
4. **The Unwitnessed** — strongest moral fit with the counter-measurement line; matcher
   precision is the gate.
5. **Tomorrow's Names** — hand to Machine Attention through its own channel; the lab
   does not build the strong version.
6. The remaining four hold as documented candidates: The Quieting and The Seismic Quiet
   behind their backtest/panel spikes, The Thinning Sky behind its noise-floor spike
   (and with its time-boxed window named), The Hum behind its licence blocker.

## Standing rules that apply to every candidate

- **USP duty**: each spec's §2 names neighbours and daylight; where marked provisional,
  the sealed search happens before build (`.claude/rules/experiments.md`; the
  `/experiments` test suite enforces verdict + daylight + neighbours for anything that
  ships).
- **Machine bar**: each spec answers "could only a machine do this?" in §2.
- **Git is the archive**: every instrument commits immutable daily JSON; no runtime cloud
  reads; disclosed gaps, no backfill, no silent method changes (Consensus v1→v2 is the
  precedent for dated breaks).
- **GCP steps** (world chamber, The Front, optional backfills) run under the conditions
  in `.claude/rules/pipelines-and-archive.md`: committed trace, source licence notices,
  cost discipline (10 €/month guideline).
- **Wording**: all names here are working titles; final naming passes the wording gate.
- **Nothing here leaves the house by itself**: the two candidates that imply outbound
  contact (The Hum's liaison letters; Tomorrow's Names' handover) route through the Post
  Office and Frank's button, per standing rule.
