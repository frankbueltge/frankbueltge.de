# Instrument candidates 2026-08: overview and map (2026-08-14)

**Status (updated 2026-08-15).** Index document for ten proposals, of which **three are
built**: The Balance is live at `/balance` and Editorial Deadline's world chamber runs as
chamber 2 of `/redaction` (both 2026-08-14, the day after this index was written), and
**The Invoked Past** is live at `/invoked-past` (2026-08-15), commissioned off its own
spike as recommended. The other seven are open. Each has its own spec; every spec ends in
a cheap spike whose result — not this document — decides whether the instrument is
commissioned. Frank's request (2026-08-13, late, wording private): work through all the
specs, thoroughly and step by step.

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

| Spec | Claim in one line | Landing | Verdict (2026-08-13 passes) | State (2026-08-15) |
|---|---|---|---|---|
| `2026-08-14-the-balance-design.md` | Self-image vs. foreign image per country, per emotion, daily | Lab, counter-measurement | Daylight (dyadic ledger unclaimed; naive tone map is taken) | **BUILT** — live at `/balance` |
| `2026-08-14-the-unwitnessed-design.md` | Attention per casualty; the register of uncovered crises | Lab, counter-measurement | Daylight (annual NGO PDFs exist; no living instrument) | Open |
| `2026-08-14-editorial-deadline-world-chamber.md` | The world's news deletions, with house-held receipts | **Extension of existing werk** `/redaction` | Provisional daylight — §2 search pre-registered, seals before build | **BUILT** — chamber 2 of `/redaction`; §2 sealed first; running nightly with BigQuery traces since 2026-08-14 |
| `2026-08-14-the-front-design.md` | Half-life of a story on 50k front pages | Lab | Provisional daylight — same condition | Open — §2 seal still owed |
| `2026-08-14-the-invoked-past-design.md` | Which past the press summons today; memory decay under proof | Lab | **Widest verified daylight** (GDELT built the field, never the tool) | **BUILT** — live at `/invoked-past` |
| `2026-08-14-tomorrows-names-proposal.md` | Cert birth vs. news birth: the future's head start | **Offer to Machine Attention** (sister chamber to The Foreknown) | Clearest novelty of the set | Open — handover not yet made |
| `2026-08-14-the-quieting-design.md` | Citizen-science silence as crisis shadow | Lab, science-leaning | Daylight, with engineered premise correction (war silences; lockdowns redistribute) | Open — behind its backtest spike |
| `2026-08-14-the-thinning-sky-design.md` | Upper-atmosphere climate read from falling satellites | Lab, science-leaning | Daylight on framing; narrowest window (active research race) | Open — behind its noise-floor spike |
| `2026-08-14-the-seismic-quiet-design.md` | Daily loudness of humanity from open seismometers | Lab, science-leaning | Daylight (2020 papers left an empty chair) | Open — behind its panel spike |
| `2026-08-14-the-hum-design.md` | Open ENF archive: the grid timestamps every recording | Lab — **blocked** (data licensing) | Daylight behind a licence wall; paths out documented | **Blocked** — licence |

## Already built

Three of the ten have shipped, all from the recommended order as it originally stood:

- **Editorial Deadline, world chamber** (was #2) — the §2 search was sealed before the
  build, as the condition required; verdict ADDED VALUE with named kill conditions. Runs
  nightly, with `GCP_SA_KEY` in place since the first night and a BigQuery trace in every
  record (corrected 2026-08-22; this line said the secret was outstanding for eight days).
- **The Balance** (was #3) — live at `/balance` with its method sheet.
- **The Invoked Past** (was #1, 2026-08-15) — live at `/invoked-past`, and now leading
  `/experiments` by recency. Its spike had already run on 2026-08-14, so what remained was
  the build. Two design refusals came out of it and are recorded in the decision log: the
  headline is the year that breaks the decay ramp, never the most-invoked year (that is the
  inherited 2014 ceiling), and the tracked-event register is not founded until 30 archived
  days exist, because founding it on 15 August would have frozen one anniversary as canon.

## Recommended order for the remaining seven (a recommendation, not a decision)

1. **The Unwitnessed** — strongest moral fit with the counter-measurement line; matcher
   precision is the gate.
2. **Tomorrow's Names** — hand to Machine Attention through its own channel; the lab
   does not build the strong version.
3. **The Front** — the half-life of editorial attention, on the same sealing condition as
   the world chamber: its §2 search is pre-registered but not yet run. *(This candidate was
   missing from the ordered list until 2026-08-15 — an oversight in the index, not a
   judgement about the piece; it was in the table from the start.)*
4. The remaining four hold as documented candidates: The Quieting and The Seismic Quiet
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
