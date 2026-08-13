# The Quieting: where the observers fell silent (design proposal, 2026-08-14)

**Status.** Proposal, not commissioned. From the 2026-08-13 "Verwandlungen" set and its
dedicated prior-art pass. Working title; wording gate applies.

**Candidate landing.** Lab experiment, science-leaning (the baseline model is the work —
a natural Field/Meridian affinity; any engine involvement is an offer, not an assignment).

## 1. The claim

> Hundreds of thousands of volunteers report birds, fungi and insects every day — a steady
> hum of directed attention at the natural world. Where crisis strikes, the hum stops.
> The Quieting detects, daily, where citizen observation has fallen below its own seasonal
> baseline — the map of where ordinary attention ended, drawn from its absence.

The instrument does not read the observations; it reads the *missing* observations. The
model is the seismic quieting of 2020 (Lecocq et al., Science): the signal is the silence.

## 2. Prior art and daylight (USP duty)

Verified 2026-08-13 (dedicated pass), including one **premise correction** that shapes the
whole method:

- **Ukraine (war)**: documented collapse — iNaturalist observations fell ~80–90 % in
  March 2022, recovery tracked liberated territory (Citizen Science: Theory & Practice
  2024; GBIF's own reporting). **War silences observers.**
- **COVID (lockdowns)**: the literature cuts the other way — US eBird submissions *rose*
  29 % in 2020 (yard birding), an India study found minimal participation impact.
  **Lockdowns redistribute observers; they do not silence them.** A naive anomaly
  detector would have called 2020 "silence" and been wrong.
- **Existing instruments**: none. GBIF shows aggregate yearly trends; eBird/iNaturalist
  surface observations, never absences; every crisis-gap analysis found is a
  retrospective paper.

**Daylight verdict**: no living counterpart; the retrospective literature simultaneously
validates the signal (war) and supplies the failure mode (redistribution). The method has
to clear that bar visibly, or the instrument is a false-alarm generator.

**Machine bar.** Daily anomaly detection over global observation streams against
per-cell seasonal baselines: machine-only.

## 3. Method v1

- **Stream**: iNaturalist first (open API, AWS Open Data bulk exports, licence-friendly
  aggregate use). eBird is named but deferred — its data-redistribution terms need
  clearing before any derived densities are committed to a public archive (open question
  §7.1).
- **Unit**: grid cells (v1: ~50 km hexes) × day. Per cell: observation count, observer
  count (distinct submitters), both mattering — fewer observations from the same many
  observers is a different event than observers disappearing.
- **Baseline**: per cell, per day-of-year, from the trailing 3 years of the public
  archive: expected count distribution (negative binomial fit — citizen data is
  overdispersed; the method sheet says why in one sentence). Anomaly = observed count
  below a low quantile of its own baseline for ≥ N consecutive days (v1: 7).
- **Redistribution guard** (the COVID lesson, structural): a cell only enters the quiet
  register if the *observers* are gone, not merely relocated — the detector checks
  whether the cell's recent observers appear elsewhere in the window. Relocation is
  classified "shifted", not "quiet", and shown separately.
- **Context join**: quiet cells are cross-referenced against GDACS episodes and the news
  pool — "known crisis here" vs. "no reported crisis here". The second class is the
  instrument's discovery channel and is presented with maximal caution (a data outage or
  app-usage change is likelier than an unreported crisis; candidate explanations are
  listed, never resolved by assertion).
- **Archive**: `src/data/quieting/<date>.json`, immutable, nightly. Cell level only —
  never individual observers: aggregates with a minimum observer count (v1: ≥ 5 baseline
  observers per cell) so no person's absence is individually legible.

## 4. Honesty and limits

- **The structural limit is the epistemology, stated on the face of the instrument**: it
  only detects silence where there were voices. Kharkiv can go dark; the Sahel was never
  lit. It maps the crises of the well-observed world, and says so in its first sentence.
- Platform effects (app releases, outages, school holidays, bioblitz events) mimic
  quieting; the baseline absorbs seasonal rhythm, the rest lands in the candidate
  explanations. iNaturalist API/platform status is checked before any daily record is
  interpreted (an API outage day is a disclosed gap, not a world event).
- Privacy: aggregate cells with observer-count floors; no user identifiers stored or
  published; obscured-location observations (iNaturalist's own privacy mechanism for
  sensitive species) are respected as delivered.
- The instrument never claims *what* silenced a cell — it presents the silence, its
  duration, and the context candidates.

## 5. Gate check (Werkgruppe §2)

Provenance (API/export snapshots with retrieval stamps) ✓; a question ("where has ordinary
attention to nature stopped, against its own baseline?") ✓; infrastructure disclosed
(fetch volumes, baseline model, thresholds versioned) ✓; leave-behind (open pipeline,
baseline datasets, CC0 aggregates — subject to §7.1 licence check for any eBird layer) ✓;
proportionality (one nightly batch, modest fetches against bulk exports) ✓.

## 6. Cost

Zero paid services. iNaturalist bulk via AWS Open Data; API for the daily increment
within public rate limits. Attribution: iNaturalist and, per record licence classes, the
aggregate licence note on the method sheet.

## 7. Open questions

1. eBird terms: whether derived cell densities may be publicly re-archived (ask; do not
   assume). v1 ships on iNaturalist alone if unclear.
2. Cell size / consecutive-day threshold: the backtest (§8) tunes both against the two
   known ground truths (Ukraine 2022 = must fire; COVID 2020 = must *not* fire as
   "quiet", must classify "shifted").
3. Whether the "no reported crisis" discovery channel is public from v1 or held back
   until the false-alarm rate is measured over 60 live days (recommendation: held back —
   the register launches with known-context cells only).

## 8. First spike

Backtest, no live pipeline: build baselines from the public historical exports for
2019–2023, run the detector over March 2022 (Ukraine) and April 2020 (global lockdowns).
Go criterion: Ukraine cells fire as "quiet", lockdown cells classify as "shifted" or stay
below threshold. If the detector cannot separate the two known cases, the premise
correction was not engineered in, and the instrument waits.
