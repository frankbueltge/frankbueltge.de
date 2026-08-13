# The Unwitnessed: attention per casualty, live (design proposal, 2026-08-14)

**Status.** Proposal, not commissioned. From the 2026-08-13 brainstorm and prior-art pass;
working title only (wording gate applies). Nothing built.

**Candidate landing.** Lab experiment, counter-measurement line — the most literal fit the
line has: it measures what the attention economy leaves in the dark.

## 1. The claim

> Not every death gets the same amount of world. The Unwitnessed measures, every day, how
> much press attention each ongoing disaster receives per person affected — and names the
> crises that received none at all.

Two daily outputs: (1) an **attention quotient** per active disaster — articles within the
event window per reported casualty/affected count, by event and by world region; (2) the
**register of the unwitnessed** — events above a severity floor whose coverage in the
day's 116k-article pool is zero or near-zero. The second list is the instrument's point.

## 2. Prior art and daylight (USP duty)

Verified 2026-08-13:

- **Eisensee & Strömberg, "News Droughts, News Floods, and U.S. Disaster Relief"** (QJE
  2007): the canonical study — coverage drives relief, and coverage is allocated by
  newsworthiness, not need. One-shot, academic, two decades old.
- **CARE "Suffering in Silence"** (10th edition, 2025): the ten most under-reported
  humanitarian crises — *annual PDF*, built on a commercial media-monitoring contract.
- **NRC Neglected Displacement Crises**: annual list; media attention one of four criteria.
- **EU ECHO Forgotten Crisis Assessment**: institutional index since 2004 (European Media
  Monitor + aid data + expert judgement) — steers budget, annual, not public-facing-live.
- **"Hierarchy of death"**: established journalism-studies concept with rich empirical
  literature, no instrument.
- **Media Cloud**: open research *platform* for attention analysis — a tool, not a claim.

**Daylight verdict.** The mechanism is proven, the moral case is made annually in PDF form
by NGOs — and **no living, daily, public instrument exists anywhere**. The daylight is the
cadence (daily vs. annual), the openness (reproducible pipeline vs. commercial monitoring
contract), and the archive.

**Machine bar.** Matching every GDACS event against 116k daily articles in a rolling
window, every night, indefinitely — machine-only practice.

## 3. Method v1

**Event side.** GDACS (gdacs.org) GeoJSON/RSS feed — multi-hazard alerts (earthquake,
cyclone, flood, drought, volcano, wildfire) with severity class, affected-population
estimate, country, episode ID; open, keyless, live. Committed as a daily snapshot (source
of record for "what happened"). EM-DAT is named as the scholarly cross-check but is not a
live dependency. Note: machine-attention's Foreknown already notarizes GDACS alerts — same
feed, different question; a shared fetch is an implementation option, never a coupling of
the two houses' claims.

**Attention side.** The house's existing nightly article pool (titles, domains, URLs,
timestamps). v1 matching: event country names + hazard lexicon + place names from the
GDACS record against titles, within a window from event onset to +72 h (and per-day
thereafter while the episode stays active). Matching is deliberately conservative and
fully disclosed; borderline matches count as non-matches (undercounting attention makes
the instrument *less* dramatic, which is the honest direction for this claim).

**The quotient.** Per event-day: matched articles / max(reported affected, floor). Both
numerator and denominator published raw; the quotient never hides its inputs. Casualty
figures are early, revised, and political — every record carries the GDACS episode
timestamp it used, and revisions produce *new* daily records, never edits of old ones.

**Register of the unwitnessed.** Events at GDACS Orange/Red with zero matched articles in
72 h enter the register, with the event's own severity data alongside the zero. The
register is cumulative and never retro-edited; if coverage arrives on day 4, the record
shows "unwitnessed for 3 days", which is itself the finding.

**Archive.** `src/data/unwitnessed/<date>.json` + `latest.json`, nightly commit,
immutable, no backfill. Method version stamped.

## 4. Honesty and limits

- **The instrument measures the pool it reads.** GDELT's English-monitored stream (plus
  translation stream if/when The Balance brings it in) is not "the world's press"; the
  method sheet says whose attention is being measured. An event invisible in this pool may
  be covered in local media GDELT misses — the claim is always "unwitnessed *by this
  pool*", displayed as such.
- Title-based matching undercounts (body-text mentions are invisible). Disclosed;
  undercounting biases against the instrument's own drama, which is acceptable.
- Affected-population estimates in the first 72 h are noisy; the quotient's denominator
  is labelled with its retrieval time. No smoothing, no interpolation.
- Comparing quotients across hazard types is treacherous (a drought's "affected" is not an
  earthquake's "killed") — v1 compares within hazard type and across time, never a single
  cross-hazard league table.

## 5. Gate check (Werkgruppe §2)

1. Open provenance — GDACS snapshots + pool manifests committed. ✓
2. A question — "which suffering got no witness this week, and how large was it?" ✓
3. Infrastructure disclosed — fetch volumes, matching rules, thresholds on the method
   sheet. ✓
4. Leave-behind — open pipeline, CC0 archive, documented matching lexicon. ✓
5. Proportionality — one nightly batch over feeds already open. ✓

## 6. Cost and infrastructure

Zero new paid services. GDACS is keyless; the article pool exists. No BigQuery required
for v1. GDACS attribution on every surface; GDELT citation per house licence rules.

## 7. Open questions

1. Matching lexicon quality per hazard type — the spike calibrates precision on two weeks
   of history.
2. Whether "affected" or "killed" anchors the quotient per hazard type (recommendation:
   hazard-specific, both shown).
3. Relationship to machine-attention's GDACS ingestion: shared fetch code or fully
   separate (recommendation: separate v1, revisit after both run).

## 8. First spike

One day: fetch 14 days of GDACS history, run the conservative matcher against the
committed article pools of the same days (they exist in git), and hand-check every
zero-coverage Orange/Red event the matcher reports. If the false-zero rate (event actually
covered, matcher missed it) exceeds ~1 in 10, the matcher — not the world — is the
headline, and v1 waits.
