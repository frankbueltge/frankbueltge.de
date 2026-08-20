# The Thinning Sky: climate change, weighed with falling satellites (design proposal, 2026-08-14)

**Status.** Proposal, not commissioned. From the 2026-08-13 "Verwandlungen" set and its
dedicated prior-art pass. Working title; wording gate applies.

**Candidate landing.** Lab experiment, science-leaning; pairs naturally with the house's
existing climate line (the GISTEMP hero) — the same subject, measured from the opposite
side of the sky.

## 1. The claim

> CO₂ warms the ground and cools the upper atmosphere. The thermosphere is contracting;
> the air at satellite altitudes is thinning; satellites fall more slowly, and debris
> stays up longer. The Thinning Sky reads the drag on public satellite orbits as a daily
> thermometer for a layer of Earth no weather balloon reaches — and shows what the
> thinning does to the orbits we depend on.

Daily outputs: (1) today's thermospheric density estimate derived from drag on a fixed
panel of tracked objects, shown **inside** the multi-decade curve it extends; (2) the
consequence meter — modelled extra orbital lifetime for a reference debris object versus
a fixed historical atmosphere.

## 2. Prior art and daylight (USP duty)

Verified 2026-08-13 (dedicated pass). The honest structure: **the science is fully taken;
the instrument is not; the window is the narrowest of all candidates.**

- **Science (taken, and load-bearing for us)**: Emmert et al. 2012 (Nature Geoscience,
  CO₂ in the thermosphere), Emmert 2015 (−2.0 ± 0.5 %/decade at 400 km, orbit-derived),
  Emmert 2021 (53-year density series from ~7,700 objects' TLEs, matching CO₂-cooling
  models), Brown et al. 2021 (projections), Parker/Brown/Linares 2025 (Nature
  Sustainability: 50–66 % orbital carrying-capacity loss by 2100).
- **Living neighbours**: the **Thermosphere Climate Index** (NASA SABER-based, daily on
  spaceweather.com) — closest in framing, but IR-radiance-based, solar-cycle-oriented, no
  secular-trend extraction, no debris consequence. TU Delft's density archive
  (CHAMP/GOCE/GRACE/Swarm) — an actively updated *archive*, not an instrument, no climate
  framing.
- **The race**: near-real-time TLE-derived density is an active 2025–2026 research front
  (JSWSC 2026 method paper; Kyoto's Starlink-ephemeris tomography, Aug 2026). Agencies
  will likely operationalize it — as *space weather*. The climate + debris framing on
  open data remains unclaimed, but the plumbing will be commoditized under us.

**Daylight verdict**: real but time-boxed; the differentiator is the framing (climate
record + consequence) and the archive, not the density estimation itself.

**Machine bar.** Daily SGP4 propagation and drag estimation over thousands of public
orbits, against solar-activity covariates: machine-only.

## 3. Method v1

- **Data**: CelesTrak GP element sets (all catalogued objects, daily, open, keyless);
  NOAA SWPC F10.7 and Ap indices (solar and geomagnetic activity, open); a fixed,
  versioned **panel** of drag-sensitive objects (near-circular, 350–500 km, long history,
  stable attitude profile — selection rule published, not curated by hand).
- **Estimation**: per panel object, decay of mean motion between element sets → ballistic
  drag proxy; panel-aggregated into a daily density index at reference altitude. This is
  deliberately the *simple, reproducible* estimator (the Emmert lineage), not a research
  contribution — the method sheet cites the real papers and says plainly that the
  instrument popularizes a known measurement, it does not improve it.
- **Solar honesty**: the solar cycle moves density by an order of magnitude more than the
  climate trend. The daily number is therefore always shown against its solar context
  (F10.7 on the same chart), and the secular statement is only ever made by the
  multi-decade curve (seeded from the published Emmert series with citation, extended
  forward by the instrument's own daily estimates — the seam between literature values
  and house measurements is drawn on the chart, dated, never blended).
- **Consequence meter**: for a standard reference object (published parameters), modelled
  deorbit time under today's atmosphere vs. the 1980s baseline atmosphere — "debris
  launched today outlives its 1980s twin by X years". Model and assumptions on the sheet.
- **Archive**: `src/data/thinningsky/<date>.json`, immutable, nightly.

## 4. Honesty and limits

- TLE/GP data are estimates with known noise; panel aggregation and outlier rules are
  versioned. Manoeuvring objects (station-keeping, Starlink) are excluded by the panel
  rule; the exclusion list is published.
- The instrument never claims to *detect* the climate trend from its own short archive —
  it *extends* a published 50-year curve and shows today's point in that context. A fresh
  trend claim from months of data would be exactly the kind of unearned claim the house
  bans.
- If an agency ships an operational NRT density product, the instrument links it and
  keeps its own claim (climate framing + consequence + archive) — or retires visibly if
  the claim is genuinely absorbed. Named upfront because the risk is real (§2).

## 5. Gate check (Werkgruppe §2)

Provenance (CelesTrak/SWPC snapshots committed with retrieval stamps; Emmert series
cited) ✓; a question ("is the sky thinning on schedule, and what does that do to what we
leave up there?") ✓; infrastructure disclosed ✓; leave-behind (open pipeline, panel
definition as reusable dataset, CC0 daily records — literature seed values carry their
citation, not CC0) ✓; proportionality (daily fetch of public element sets, local
computation) ✓.

## 6. Cost

Zero paid services. CelesTrak asks for considerate access (daily bulk GP fetch is within
its published norms; the fetch schedule goes on the method sheet). No GCP needed.

## 7. Open questions

1. Panel selection rule details (altitude band, eccentricity cap, history length) — the
   spike measures how many objects survive the rule and how noisy the daily index is.
2. Reference-atmosphere choice for the consequence meter (recommendation: NRLMSIS with
   fixed 1980s solar-mean inputs; alternatives listed on the sheet).
3. Cadence honesty: daily point vs. weekly aggregate if daily noise swamps legibility
   (spike decides; a noisy daily number would be theatre).

## 8. First spike

Two days: pull 90 days of GP history for a candidate panel (~200 objects), compute the
daily drag index, overlay F10.7, and check (a) index noise floor, (b) correlation with
published density behaviour over the same window. If the panel index cannot follow known
solar-driven density events, the estimator is not ready and the instrument waits.
