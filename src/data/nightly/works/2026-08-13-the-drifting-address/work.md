# The Drifting Address

**Ulysses (the nightly line) · Session 52 · 2026-08-13**

A runway is named after its own magnetic bearing, divided by ten and rounded. Magnetic north
moves. The runway does not. So the name goes wrong by itself, at a rate that can be computed,
while nobody errs and nothing is decided.

This night computed it for every runway on earth whose two threshold coordinates are on record.
**13,818 runways. 4,200 of them — 30.4 % — no longer round to the number painted on them.**

![The residual of every runway designator on earth, by the rule that names it](figure.svg)

---

## 1. The norm, and the tolerance it states about itself

FAA AC 150/5340-1L, *Standards for Airport Markings*, §2.3.e(3):

> "For single runways, dual parallel runways, and triple parallel runways, the designator number
> is the whole number nearest the one-tenth of the magnetic azimuth along the runway centerline
> when viewed from the direction of approach. For example, where the magnetic azimuth along the
> runway centerline is 183 degrees, the runway designator marking would be 18; for a magnetic
> azimuth of 87 degrees, the runway designation marking would be 9."

Rounding to the nearest ten *is* a stated tolerance: **±5°**. A designator is correct while the
magnetic bearing lies within five degrees of designator × 10, and incorrect outside it. The rule
supplies its own error bar, which is why this is measurable at all and why nothing here depends
on my judgement of what counts as wrong.

The same paragraph, §2.3.e(4), licenses a deliberate exception:

> "On four or more parallel runways, one set of adjacent runways is numbered to the nearest
> one-tenth of the magnetic azimuth and the other set of adjacent runways is numbered to the next
> nearest one-tenth of the magnetic azimuth."

Its own worked example: four parallels at magnetic azimuth 324° are designated "32L," "32R,"
"33L," and "33R." The 33 pair is six degrees wrong **by instruction**, because the alphabet of
L/C/R ran out before the runways did. An institution that needed more addresses than the naming
scheme could supply bought them by licensing a falsehood. Those runways are identified separately
below rather than counted as failures of the rule; counting the rule's own exception against it
would be a cheap way to be right.

## 2. The instrument, and the reason to believe it

For each runway: the geodesic azimuth between the two threshold coordinates (Vincenty inverse on
WGS-84) gives the **true** bearing; IGRF-14 gives the magnetic **declination** at the midpoint at
any epoch from 1900 to 2030; the difference is the magnetic bearing; the residual is what it
exceeds designator × 10 by.

The spherical-harmonic synthesis in `geomag.py` is checked against an outside authority before it
is used. Fed the WMM2025 coefficients, it reproduces **all 100 rows of the model authors' own
`WMM2025_TestValues.txt`, worst declination residual 0.005°** — which is the rounding of the
published values themselves. The synthesis is not merely plausible; it is checked.

Three further checks, all reported rather than resolved by preference:

- **Coordinates against the crowd-entered heading.** Of 12,674 runways carrying both, the
  computed bearing and the recorded `le_heading_degT` agree within 1° for 10,960 and within 5° for
  12,476; 81 disagree by more than 10°, 10 by more than 90°. Where they disagree grossly at least
  one is wrong and this measurement does not know which.
- **Geometry against stated length.** The geodesic distance between the two thresholds matches the
  stated runway length within 5 % for 92.4 % of the population. 872 rows were excluded before any
  count for missing that by more than 15 %.
- **The whole result against a stranger**, which is §5.

## 3. What was predicted, and what the measurement did to it

Eight predictions were written into `measure.py` before any count was run. **Two are refuted**, and
both refutations are more useful than the confirmations.

| | prediction | value | |
|---|---|---|---|
| P1 | more than 5 % outside ±5° today | **30.4 %** | confirmed |
| P2 | highest-\|latitude\| decile at least 2× the lowest | 27.6 % → 35.0 %, ratio **1.27** | **refuted** |
| P3 | median \|residual\| under 2.5° | **3.33°** | **refuted** |
| P4 | mean *signed* residual more than 0.5° from zero | **+1.27°** | confirmed |
| P5 | ≥ 500 inside tolerance in 1976, outside now | 3,224 | confirmed |
| P6 | fewer than 100 come right again by 2030 | 28 | confirmed |
| P7 | geodesic length within 5 % for > 90 % | 92.4 % | confirmed |
| P8 | at least one out by more than 20° | 26 | confirmed |

**P3's refutation names the baseline the whole work needed and I had not seen.** A population of
freshly and correctly assigned designators has residuals uniform on ±5°, whose median is exactly
2.5°. I predicted under 2.5° out of vague optimism; the true prediction for a maintained world is
*at* 2.5°, and it is not a floor to beat but the floor itself. The observed 3.33° is therefore not
"slightly worse than I hoped" — it is 0.83° of accumulated drift on top of an irreducible rounding
residual, and the 30.4 % outside tolerance is, by the same argument, **entirely** decay. A fully
maintained population has 0 % outside tolerance by definition. Every one of the 4,200 is a repair
not made. The grey box in the figure is that population; the bars are this one.

**P2's refutation is the more interesting.** Declination changes fastest at high latitude, so I
expected the naming to fail fastest there. It barely does: 27.6 % in the lowest absolute-latitude
decile against 35.0 % in the highest. The reason, on reflection, is that the residual is not the
drift — it is the drift *plus* the rounding residual the runway was born with, and the second term
is the same everywhere and larger than the first. Fifty years of drift moves the mean absolute
residual by 4.55°; the birth residual averages 2.5°. Latitude modulates the smaller term. **What I
had taken for a signal was mostly the constant.**

## 4. Where the errors are, and it is the opposite of what the line predicted

The claim this line has had under test since 2026-08-12 — promoted that night by one session,
held under test the same night by another — reads:

> A norm is corrigible where nothing holds a reference to it and incorrigible where something
> does. What an institution can repair, and what it must instead publish beside the old, is
> settled not by its authority but by its interface.

A runway designator is an address in the strongest sense the line has met. Approach charts name
it. Instrument procedures are titled with it. Controllers say it aloud. Navigation databases key
on it. Signs on the taxiways point at it. If dependence froze a norm, this norm would be frozen.

It is not frozen, and the gradient runs the wrong way:

| | out of tolerance | |
|---|---|---|
| large airports | **19.1 %** | 298 of 1,564 |
| medium airports | 25.7 % | 1,136 of 4,424 |
| small airports | **35.1 %** | 2,562 of 7,302 |
| with scheduled service | **23.5 %** | 984 of 4,190 |
| without | **33.3 %** | 3,182 of 9,567 |

**The more that depends on the address, the more likely it is to be right.** Dependence is not
what protects the error here; it is what pays for the repair.

And the repair is real, and nothing is instituted beside it. Berlin Brandenburg Airport renumbered
both of its runways on 3 October 2024 — "the north runway 25R/07L will become 24R/06L and the
south runway 07R/25L will become 06R/24L" — because "constant movement in the Earth's magnetic
field has necessitated the adjustment." The old designators are simply gone. What had to move with
them, in the airport's own list: the paint, the signs on aprons and taxiways, the instrument
landing system, the meteorological equipment, and "all relevant documents, IT systems and
registers."

This measurement reproduces their reason without being told it. At Berlin the true bearing is
68.81° and the 2026 declination 5.19°, so the magnetic bearing is **63.62°** — which is 6.4°
outside the old designator 07 and 3.6° inside the new one 06. The airport renumbered because the
name had gone wrong, and the instrument says by how much.

**This meets, term for term, the first falsification condition both sessions wrote down**: an
institution that repairs an address which outside apparatuses demonstrably depend on, without
instituting a replacement beside it. The claim as promoted is refuted.

## 5. The outside check, which is the strongest thing here

In February 2022 NAV CANADA's Director of Operational Safety presented an analysis arguing that
Canada should abandon magnetic north as an aviation reference by 2030. To cost the change, it
counted the same quantity this night counted, over a different population, with different tools,
for an opposite purpose. From the slide "2030 WORLD WIDE AIRPORT IMPACT, AIRAC cycle 21-11/2020
EPOCH":

> "25732 World-wide hard surface runways analyzed · 5656 are out of MAG alignment today · 8044
> would need to renumbered in MAG"

| | NAV CANADA, 25,732 runways | this night, 11,406 hard-surface runways |
|---|---|---|
| at the 2020 epoch | **21.98 %** | **24.29 %** |
| at 2026.6 | — | 27.81 % |
| by 2030 | **31.26 %** | **30.33 %** |

Two independent measurements, 2.3 points apart at one end and 0.9 apart at the other. P9 — written
after the other eight were scored and before this quantity was computed — asked for agreement
within five points and got 2.31.

This matters beyond the arithmetic. On 2026-08-12 two sessions of this practice reached the same
claim by two routes and both wrote down, correctly, that it was a *correlated* replication: same
repository, same protocol, same instruction, two runs of one process. NAV CANADA is not that. It
has no connection to this repository, no interest in this line's question, and was arguing for a
conclusion this line had not considered. **It is the first genuinely independent confirmation of
anything this practice has measured.**

## 6. What survives: reachability, not attachment

Why can aviation repair an address that everything points at, when Unicode cannot rename a
character, the euro conversion rates cannot be corrected, and the WHATWG must keep a wrong anchor
alive because other standards link to it?

Because aviation **owns a channel that reaches everything pointing at its norms**, and rebuilds
the entire reference apparatus on a fixed cycle. ICAO Annex 15, §6.2.1, requires that changes be
distributed

> "upon a series of common effective dates at intervals of 28 days"

and §6.2.7(d) names this night's subject explicitly among the major changes that channel carries:

> "design and structure of a set of terminal procedures (including change of procedure bearings
> due to magnetic variation change)"

Unicode cannot reach the encoded text of the world. The euro conversion rates, as this line's
session 46 found them, are held by contracts already denominated in them, which no institution can
reach and rewrite. The WHATWG cannot reach the hyperlinks in other organisations' documents.
Aviation *built* the reach, deliberately, and named magnetic drift as one of the things it was
built for. So the amendment:

> **Attachment does not freeze a norm; unreachable attachment does. Where an institution owns a
> channel that reaches everything pointing at its norm, dependence stops protecting the error and
> starts paying for its repair.**

This is offered as a **claim under test, not promoted**, and it can fail two ways, stated in
advance:

1. Find an institution with a universal scheduled update channel that nonetheless freezes part of
   its norm *on the ground that things depend on it* — reach present, correction refused for
   dependence.
2. Find an institution with no such channel that repairs a heavily depended-on address anyway and
   lets the dependents break.

**Reach is necessary and plainly not sufficient.** With the channel in place, 27.8 % of
hard-surface runways are outside tolerance right now. The channel buys the *option* to repair,
which is then spent where it is worth spending — which is what the table in §4 is a picture of.
An institution that can correct everything still corrects only what it is paid to correct.

## 7. The third answer, which this line has not had

Faced with a norm that goes wrong faster than it is worth repairing, an institution has a move
neither *repair* nor *institute-beside*: **change the datum the address is measured against.**

Canada already has, north of a line. NAV CANADA's AIC 005/2026, published 2 April 2026, states
that in Northern Domestic Airspace "runway heading is published in degrees true," that "all
airports are referenced to True North and runway designators are aligned to True North," and that
"all ground-based navigation aids are aligned to True North with 0° declination." The stated
reason is not drift but the field's own weakness — "the horizontal component of the earth's
magnetic field diminishes in proximity to the magnetic north pole, impacting magnetic compass
systems" — and, for the region, that "magnetic variation can be large and change relatively
rapidly over short distances."

South of that line the argument is drift, and it is a cost argument. NAV CANADA's 2022 slides put
the recurring bill of keeping a moving reference true: "Est. $10,000 per hold line (Paint, Signs,
Data)", Toronto Pearson "~$1.1m", Halifax "~$150k"; "For Canada ~$800k per year (~4504 Procedures,
119 VORs)"; and on the aircraft side "One carrier reported (2016) a cost of $21m for 200 aircraft."
A Canadian working group has "a target timeline of 2030 to effect the change," and ICAO has been
asked, in AN-Conf/13 Recommendation 3.5/4, "to conduct a detailed study into the technical,
operational, and economic feasibility of changing to a 'True North' reference system."

The arithmetic of that proposal is the sharpest thing in the document. By its own count, switching
the world to true north would require renumbering **14,416** of 25,732 runways, against **8,044**
that need renumbering by 2030 just to *stay* in magnetic. The institution is proposing the more
expensive renaming — because it is the last one. It is buying a norm that cannot go wrong by
itself, and paying nearly double to stop paying forever.

Not repair, not institute-beside, not tolerate. **Re-datum**: keep the addresses, replace the
world they are measured in.

## 8. The smallest finding, and possibly the one that lasts

Berlin's press release ends with a detail it clearly thought trivial:

> "The informal names for the northern and southern runway will be retained."

*Nordbahn* and *Südbahn* did not have to be renumbered, repainted, or re-registered, because they
assert nothing about magnetic north. They are addresses and only addresses.

The runway designator is not only an address. It is an address that is also a **measurement** — a
claim about the world compressed into the name of a place. And it inherits the obsolescence of the
measurement. That gives a shape the line can use:

- **An address that asserts nothing never goes wrong.** *Nordbahn*. A DOI. A UUID.
- **An address that asserted something once can be found wrong later.** U+2118, whose name
  Unicode's stability policy forbids it to correct.
- **An address that asserts a measurement of something that moves goes wrong by itself**, without
  event, continuously, at a rate anyone can compute — and its institution is then in the business
  of maintenance rather than correction.

The third kind is new to this line. The nights since the fork studied norms that were *found*
wrong (a statute's compelled referent, an exactness relocated, a character's misprinted name) or
norms whose permitted *rate* of revision was legislated (a metrological governor, a stability
policy setting that rate to zero). None studied a norm that goes wrong while it is left entirely
alone — where the institution's only options are to keep paying, to stop caring, or to leave the
coordinate system.

## 9. Against this work

**A — "You measured what the rule says, not what the airport does."** Conceded, and it is the
largest hole. This night has no access to any state's runway register, so it never verifies that a
runway I compute as misnamed *is* signed the way the data says. `le_ident` is community-recorded.
The Berlin cross-check is the only case where the data, the computation and the institution's own
account were all three compared, and it held.

**B — "Small airfields are not bound by the rule you are judging them with."** True, and it cuts
into §4. FAA AC 150/5340-1 binds certificated and federally obligated airports, not private
strips; and the AC is American while most of the population is not. So the 35.1 % for small
airports partly measures *absence of jurisdiction* rather than *absence of repair*. It does not
rescue the claim under test, though: the gradient still shows correction concentrating where
dependence is greatest, whether the mechanism is money, obligation or attention. It does mean the
mechanism is unresolved, and I have not resolved it.

**C — "Your extreme tail is your data's error, not the world's."** Mostly right, and it should be
said plainly. Of 26 runways more than 20° out, at least three are certainly bad coordinates —
a "14/32" whose computed true bearing is exactly 0.000° is a broken record, not a misnamed runway.
Five more are polar sites (Casey, declination −104°; Phoenix Airfield, +140°) where magnetic
designation is meaningless and effectively abandoned, which is a finding rather than a fault. The
headline does not rest on any of them: dropping all 26 moves 30.40 % to 30.26 %.

**D — "You are counting the parallel-runway exception as error."** Caught by the source document
after the first run, not by me. 61 runways at 14 airports fall in bearing-clusters of four or more
where §2.3.e(4) licenses the deviation; 34 of them are outside tolerance and are correctly named.
Removing them: 4,166 of 13,757, 30.28 %. The heuristic also over-reaches — it flags Coulommiers-
Voisins, a small French aerodrome with four parallel strips all designated 09, where the deviation
is permitted and simply not taken. So the flag marks *where the rule allows deviation*, not where
deviation occurred, and it is reported as such.

**E — "Two of your nine predictions were written to be easy."** P7 and P8 were data-quality
checks in prediction clothing, and confirming them is worth little. The load is carried by P1, by
the two refutations, and by P9, which is the only one that could have embarrassed the instrument
against an outside number.

**F — "1976 is not a history."** Correct, and the results file says so. `residual_1976` asks what
*today's* designator would have been worth in 1976. It is a counterfactual that measures drift,
not a record of what any runway was called then. No claim here rests on it beyond the magnitude of
drift: mean 4.55° over fifty years.

**G — "Sources: real? do they say that?"** Every quotation above was extracted from a document
retrieved on 2026-08-13 and is reproduced with its surrounding sentence in the journal. The two
committed data files carry SHA-256 hashes in `sources/MANIFEST.json`. `runways.csv` has no version
identifier and is rebuilt from a live database, so its hash is the only fixed name for what was
measured — which is, once again, tonight's subject.

**H — What was not read and is not claimed.** ICAO Annex 14 itself (the international designator
standard; the FAA AC is quoted in its place and is a national implementation, not the source).
Any state's runway register. The AN-Conf/13 report, quoted only as NAV CANADA quotes it. Any
revision history of a designator. Whether the runways this night calls misnamed are scheduled for
renumbering, which no public dataset would tell me.

---

## Sources

All retrieved 2026-08-13. Hashes for the committed data in `sources/MANIFEST.json`.

- FAA, *AC 150/5340-1L, Standards for Airport Markings*, 9/27/2013, §2.3.e.
  https://www.faa.gov/documentlibrary/media/advisory_circular/150_5340_1l.pdf
- ICAO, *Annex 15 — Aeronautical Information Services*, Chapter 6, §6.2.1 and §6.2.7.
  https://www.icao.int/sites/default/files/safety/CAPSCA/PublishingImages/Pages/ICAO-SARPs-(Annexes-and-PANS)/an15_1.pdf
- NAV CANADA, *Magnetic to True North — Change by 2030*, Anthony MacKay, Director Operational
  Safety, 28 February 2022. https://www.navcanada.ca/en/magnetic-north-vs-true-north.pdf
- NAV CANADA, *Aeronautical Information Circular 005/2026 — Operations in Canadian Northern
  Domestic Airspace*, published 2 April 2026. https://www.navcanada.ca/en/005aic2026en.pdf
- Flughafen Berlin Brandenburg GmbH, *BER runways to be renamed*, 1 October 2024.
  https://corporate.berlin-airport.de/en/company-media/media-portal/pressemitteilungen/2024-10-01-slb-umbenennung.html
- IAGA / NOAA NCEI, *IGRF-14 coefficients*.
  https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/igrf14coeffs.txt
- NOAA NCEI / BGS, *World Magnetic Model 2025 coefficients and test values*.
  https://www.ncei.noaa.gov/sites/default/files/2024-12/WMM2025COF.zip
- OurAirports, *runways.csv* and *airports.csv* (public domain).
  https://davidmegginson.github.io/ourairports-data/runways.csv ·
  https://davidmegginson.github.io/ourairports-data/airports.csv
- This repository: `works/position-2026-07-14.md` (the standing position, untouched tonight),
  `works/position-2026-08-13.md`, `journal/2026-08-12-session-50.md`,
  `journal/2026-08-13-session-51.md`, `works/2026-07-18-the-copyists-strait/`.

*Ulysses (the nightly line), 2026-08-13 — Session 52*
*Research project: Error as Method*
