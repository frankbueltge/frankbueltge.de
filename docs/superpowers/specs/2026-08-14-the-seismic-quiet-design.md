# The Seismic Quiet: the loudness of humanity, daily (design proposal, 2026-08-14)

**Status.** Proposal, not commissioned. From the 2026-08-13 brainstorm (first candidate
set, V5) — the piece whose build principle ("a sensor built for X measures Y") seeded the
whole "Verwandlungen" series. Working title; wording gate applies.

**Candidate landing.** Lab experiment, science-leaning.

## 1. The claim

> Seismometers were built to hear the Earth. Above a few Hertz, what they mostly hear is
> us — traffic, industry, footfall. In 2020 the world's lockdowns made the planet
> measurably quieter, and science noticed once, wrote it up, and moved on. The Seismic
> Quiet keeps listening: a daily index of anthropogenic seismic noise — how loud humanity
> is, where, and when it falls silent.

Daily outputs: per-station and aggregated **high-frequency noise levels** against each
station's own weekly rhythm (weekday/weekend/holiday structure is the signature of the
human source), plus a register of stations that went unusually quiet or loud.

## 2. Prior art and daylight (USP duty)

From the 2026-08-13 passes:

- **Lecocq et al. 2020 (Science)**: the canonical "2020 seismic noise quiet period" —
  global analysis, 268 stations, open toolbox (SeismoRMS notebooks). A retrospective
  study; **no standing public dashboard survived from that era** (verified in the
  live-sources pass: the raw station data remain open, the instrument chair is empty).
- **Raspberry Shake StationView / ShakeNet**: live waveform displays of the community
  network — displays, not an anthropogenic-noise instrument; and the community network's
  true real-time streams sit behind participant/commercial terms, while its FDSN archive
  serves data ≥ 30 min delayed (fine for a daily instrument).
- **FDSN networks (IRIS/EarthScope, ORFEUS/EIDA, GEOFON …)**: fully open station
  waveforms — infrastructure, no instrument.

**Daylight verdict**: the method is published, the toolbox is open, the chair has been
empty since the papers were written. Novelty is the *standing daily practice* plus the
archive, not the technique — the method sheet credits SeismoRMS explicitly.

**Machine bar.** Continuous waveform ingestion and PSD computation across a global
station panel, every day: machine-only.

## 3. Method v1

- **Panel**: a fixed, versioned set of stations (v1: ~50) chosen by rule — urban-adjacent
  (the subject is human noise), long uptime history, open FDSN access, geographic spread.
  Broad-band professional stations first (delay-free, well-calibrated); Raspberry Shake
  archive channels as a labelled second tier.
- **Computation**: the published SeismoRMS approach — daily probabilistic power spectral
  density per station, displacement RMS in the anthropogenic band (~4–14 Hz), normalized
  against that station's own baseline (median weekday/weekend curves from a trailing
  year). The band, the windows, and every deviation from the published notebooks are on
  the method sheet.
- **Index**: per station, today's noise as % of its own baseline for that weekday-type;
  aggregated regionally with station count disclosed. Never a single world number without
  its dispersion.
- **Quiet/loud register**: stations beyond threshold for ≥ 3 days, with candidate
  explanations listed (holiday calendars joined automatically — Eid, Lunar New Year,
  Christmas are the expected findings that *validate* the instrument annually; the
  unexpected ones are the point).
- **Archive**: `src/data/seismicquiet/<date>.json`, immutable, nightly. Station metadata
  (network, licence, citation) per record — FDSN networks require per-network citation,
  which the record carries.

## 4. Honesty and limits

- Instrument response, sensor swaps, and station maintenance masquerade as loudness
  changes; the panel rule prefers stations with published response files, and station
  metadata changes void the affected baseline (disclosed gap, baseline restart — never
  silent bridging).
- Weather is a confounder (wind/sea microseism leaks into the band at some sites); the
  band choice and per-station validation in the spike address it; residual weather
  sensitivity is named per station.
- The index measures noise *at the stations*, i.e. mostly cities that happen to host
  seismometers — "the loudness of humanity" is metonymic and the sheet says so.
- Data gaps at source networks are disclosed gaps (house rule), never interpolated.

## 5. Gate check (Werkgruppe §2)

Provenance (FDSN requests logged with time windows; response files versioned) ✓; a
question ("how loud is humanity today against its own rhythm, and where did it fall
silent?") ✓; infrastructure disclosed (fetch volumes per station-day on the sheet) ✓;
leave-behind (open pipeline, panel definition, CC0 daily aggregates; waveforms stay at
their networks under their licences) ✓; proportionality (≈50 station-days of waveform per
night, single-band processing) ✓.

## 6. Cost

Zero paid services; FDSN endpoints are open with fair-use norms (nightly, paced, ~50
stations is modest). No GCP needed.

## 7. Open questions

1. Panel composition and size vs. nightly runtime (spike measures minutes-per-station).
2. Whether Raspberry Shake archive channels enter v1 or wait (their calibration
   uncertainty vs. their urban density — recommendation: two labelled tiers from day
   one, aggregated separately).
3. Holiday-calendar source (versioned dataset choice).

## 8. First spike

Two days: run the SeismoRMS pipeline for five candidate stations over the last 90 days;
verify the weekday/weekend signature is visible at each; measure runtime and data volume;
confirm one known public holiday appears as a dip. Stations that show no human rhythm
leave the panel — the spike writes the panel rule from evidence.
