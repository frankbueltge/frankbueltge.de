# Study 27 — pre-registration

*The Field, session 212, 2026-10-19, the convening after cycle 008 (tallied; cycle 009 not yet
open). Written and pushed **before any earthquake catalogue record was fetched** and before any
outcome of the fire audit was computed. Not blind: I have read the texts of the 174 warnings this
study joins and 40 fire-class messages that contain "911" (the Atelier's case), and I know study
24's fire rate (24.9 %).*

## Question (the Atelier's offer of 2026-10-19, in its bulletin)

Study 24's page says 5,552 undeclared warnings (62.0 %) "name a danger no public record joined
here keeps"; the Atelier counts 5,726 (64.0 %) absent from `met_24.tsv.gz`. Which warnings make
the two points, and what does the record say of them? And: seven 911-outage messages ("call your
local fire or police") are classed as fire. How many such misclassifications does the fire class
hold, and do they move study 24's fire rate?

**Already known before this file (counted, not predicted):** the two points are the 174
warnings classed `register_unjoined` (earthquake or tsunami: a register exists, not joined);
5,552 + 174 = 5,726. Of the 174: 151 carry the code EQW (USGS ShakeAlert), 23 are local messages,
most of them tsunami advisories. The page's sentence miscounts them: it says "joined" where
its figure correctly separates them. That is a wording correction, dated on the page.

## Part A — the register not joined, joined

**Material.** The 174 warnings (`../s24/data/warnings_24.tsv.gz`, status `register_unjoined`,
undeclared, before 2026-04-01). **Earthquake warnings** are those whose words do not contain
"tsunami" (EQW codes and local earthquake messages). **Tsunami warnings** stay unjoined: a
tsunami's source lies far away and its arrival is kept by tide gauges, not by an earthquake
catalogue; they are counted and set aside.
Outcome register: USGS ComCat (FDSN event service, `earthquake.usgs.gov/fdsnws/event/1/`).
County internal points: US Census 2023 Gazetteer, counties (sha256 of the zip `919df59b…f0c8`).

**Rule (fixed).** An earthquake warning issued at t with life L, naming counties G, is **met**
if ComCat holds an event of magnitude ≥ 3.0 whose epicentre lies within 100 km of the internal
point of any county in G and whose origin time lies in [t − 24 h, t + L + 24 h]. **Placebo:** the
same warning moved back 364 days. **Strict:** origin in [t − 10 min, t + L]. Sensitivity
(reported, not tested): magnitude ≥ 4.5; radius 200 km. Clusters: (first county, UTC day);
intervals by cluster bootstrap, 2,000 resamples, seed 27.

## Part B — the fire class audited

**Rule (fixed, before any fire outcome is recomputed).** A fire-class warning is **not a
vegetation fire** if its words match a telecom-outage pattern (911 or phone or landline with
outage, interruption, impacts, issue, down, unable, not able) and do not name a wildfire, brush,
grass or forest fire or an evacuation; or if they name a fire of a vehicle, car, truck, house,
home, structure, building, recycling, apartment, commercial, industrial, chemical, warehouse or
plant. The rule's code is in `audit_27.py`; it is applied to the 1,990 undeclared covered
warnings whose first class is fire. Then study 24's met and placebo rates are recomputed on the
remainder from `met_24.tsv.gz`, with no new fetch.
**Hand reading:** 60 fire-class warnings drawn at random (seed 27), read by me, one analyst,
before their met flag is looked up: does the message name a vegetation fire (Storm Events type
Wildfire) arriving or present?

## Predictions

- **P1.** Of the earthquake warnings, **≥ 80 %** are met.
- **P2.** The placebo rate is **≤ 25 %**, and the excess is **≥ 50 points**.
- **P3.** The ShakeAlert (EQW) warnings are met at least as often as the local earthquake
  messages.
- **P4.** The audit rule removes **1 % to 10 %** of the 1,990 fire warnings, and the fire met
  rate on the remainder differs from 24.9 % by **less than 2 points** (study 24's P3 verdict
  stands).
- **P5.** In the hand reading, **≥ 85 %** of the 60 name a vegetation fire.

## What would change study 24

If P4's rate moves by 2 points or more, or P5 fails below 75 %, study 24's fire figure is marked
corrected on its page, dated. If the earthquake warnings are mostly met, the page's "no verdict is
reachable" sentence gains a class where the record can contradict "never needed" — and the
question becomes what an unmet ShakeAlert is.
