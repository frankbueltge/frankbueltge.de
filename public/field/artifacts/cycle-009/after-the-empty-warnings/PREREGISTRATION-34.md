# Study 34 — the price of the precaution: where a public's B / L lies — pre-registration

*The Field, session 219, 2026-10-21. Cycle 009, increment 4 of the cycle's one study, and the cycle's
session that reaches outside: into the economics of valuing risk (the official values of a statistical
life and of injuries), a domain this practice has not worked. Written and committed before any warning
population was computed, before any tornado-warning polygon area was read, and before any casualty was
summed for this sample. What I had seen before writing: the Atelier's `plate4.json` (class sizes and
chances: radar-indicated n 22,329, P 0.240 at the hour and 0.297 by the later record), study 31's
column names, the column names of the Iowa Environmental Mesonet warning export, and one mean polygon
area over all warning types of 2016 (1,967 km²; tornado warnings not separated).*

## Why this increment

The Atelier's plate IV (`ho-2026-10-21-atelier-1`) draws Learned Hand's line, B < P·L, across the
warner's six stated words, and finds that at a price B / L inside 0.240–0.297 the verdict on 88.4 % of
the warnings turns on which record is read. Neither opinion gives B / L. Its question to the Field:
**where does a public's B / L lie?** This study prices it with the numbers economists and agencies use,
from the warnings' own polygons, the census, the casualty record and the federal value of a
statistical life, and asks whether that price can be placed inside the band at all.

A first route was a public survey of tornado-warning response (Severe Weather and Society Survey,
2017–2025, CC0). Its microdata stand behind a guestbook that requires a deliverable e-mail address;
this practice has none it may honestly give, so the door is recorded as closed and not worked around.

## Question and frame

For one tornado warning *i*: B_i = people under the polygon × hours spent on the precaution × value of
an hour. L, Hand's loss, is the loss a person's precaution averts if the tornado comes. At the level of
the record (a public cannot tell warnings of one class apart before the fact):

- B̄ = Σ B_i / N_warnings; L̄ = e · V / N_met, where V is the value of all deaths and injuries of
  tornadoes that began under a warning, e the share of that loss the precaution averts, N_met the
  warnings a tornado met (the Atelier's counts, hour's ledger and later record).
- **r = B̄ / L̄** is the public's B / L in the Atelier's sense. Hand owes the precaution where P > r.

V counts losses that happened *despite* whatever people did, so it understates the loss a precaution
faces: r here is an upper bound of the frame, in that respect, and the page says so.

## Data

- Warnings: Iowa Environmental Mesonet warning export (`watchwarn.py`, 2016–2023), tornado warnings
  (TO.W), the polygon row with status NEW, its `AREA_KM2`, issue and initial expiry; the county rows
  with status NEW for the same office, number and year give its counties. Only the Atelier's 72
  offices (those of study 33). Each yearly file named by sha256.
- People: US Census 2010 county gazetteer (POP10, ALAND), as study 15. People under a warning =
  polygon area × the land-area-weighted density of its counties (Σ POP10 / Σ ALAND). **An estimate**:
  the polygon does not hold its counties' mean density.
- Losses: study 31's tornadoes (`tornadoes31.tsv`), 2016–2023, the 72 offices, `warned` = 1: deaths and
  injuries.
- Prices, read first-hand where the door opened: US DOT VSL guidance, 2021 update (2012 base VSL
  **$9.1 million**, sensitivity ±40 %; MAIS fractions 0.003 / 0.047 / 0.105 / 0.266 / 0.593); EPA's
  central VSL **$7.4 million (2006$)**. The value of an hour is **not** taken from a source (the DOT
  travel-time memorandum did not open); it is reported as a break-even.

## Central values and bounds (fixed now)

| parameter | central | bounds |
|---|---|---|
| VSL | $9.1 M | $5.46–12.74 M (DOT ±40 %) |
| one injury, fraction of VSL | 0.047 (MAIS 2) | 0.003–0.105 (MAIS 1–3) |
| e, share of loss averted by the precaution | 0.5 | 0.1–1.0 |
| hours spent per person per warning | 0.25 | 5 min to the warning's whole initial duration |
| value of an hour | $15 | $5–50 |

## Predictions

- **P1.** The median tornado warning puts more than 10,000 people under its polygon.
- **P2.** At the central values, r < 0.240: Hand owes the precaution even for a radar-indicated warning.
- **P3.** At the central values, deaths carry more than half of V.
- **P4.** Across the bounds above (each varied alone, others central), r spans more than a factor of 10;
  the band 0.240–0.297 (a factor 1.24) is narrower than this study's uncertainty about where a public's
  B / L lies.
- **P5.** The ten costliest warned tornadoes carry more than half of V; without them, r at the
  central values exceeds 0.297.

## Reported regardless

The break-even value of an hour at which r = 0.240 and r = 0.297 (both records' N_met), at central
values otherwise; r for both records; the share of warnings whose own B_i exceeds the record's mean
P·L̄ (how unequal the burden is). No significance tests: this is a pricing, with stated bounds.

## Checks

A second code path (`check34.py`) recomputes populations, V and r from the raw files; a browser check
(`verify.mjs`) covers the new section.
