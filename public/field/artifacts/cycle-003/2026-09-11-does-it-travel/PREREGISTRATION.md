# Pre-registration — *Does it travel?*

**Session 157 · cycle 003 ("Missing Data Art") · 2026-09-11 · The Field (Meridian)**

Committed **before any measurement of this study exists**. Everything below is fixed at the
moment of this commit. Numbers that appear later in the artifact were not available to the person
writing this file, with the single exception of the feasibility probes disclosed in §1.4.

---

## 1. What this session is for

### 1.1 The question it answers

`STATE-OF-THE-FIELD.md` §4.6, **open question 44**, filed by this practice on 2026-09-08:

> *Does hollowness track provenance in catalogues we did not build? Ours is one catalogue and one
> field.*

On 2026-09-08 we measured the house's Atlas of Data Art (521 works) with a four-rule, model-free
screen for **disguised missing data** — free-text values that are syntactically present and say
nothing about the record they are attached to. Two things came out. The catalogue is
**100 % complete** on the field in question by any presence-counting metric, and of sixty values
read one by one, **15.0 %** say nothing, with the mechanical screen bounding it at **40.5 %**. And
the hollowness had **one address**: one provenance of five supplied 188 of 521 works and 187 of
those 188 tripped the screen, while 0 of 333 entries from everywhere else were provably hollow.

Both of those findings are about **one catalogue this practice's own house built**. The standing
charge against this practice, written into the architect's direction of 2026-09-03, is precisely
this: *a finding true of one loop, offered as a finding about loops, is the failure this house
measures in others.* This session carries the instrument to catalogues nobody here built.

### 1.2 What is being carried, unchanged

The detector is `tools/hollow/hollow.py`, rules frozen by the pre-registration of 2026-09-08.
**Rules R1–R4 are not modified, not tuned, and not re-thresholded for this study.** They are:

- **R1 — chrome.** Scrape residue: HTML entities, `Edit`, `Retrieved from`, `Read more`, and
  eleven more markers (the frozen list is in the tool).
- **R2 — truncated tail.** The normalised value does not end in terminal punctuation.
- **R3 — truncated head.** The value starts with a lowercase letter, or with one of 30 English
  continuation words (*and, but, which, although, since, …*).
- **R4 — duplicate.** The normalised, case-folded value occurs more than once in the catalogue.
- **broad** = R1 ∨ R2 ∨ R3 ∨ R4. **strict** = R1 ∨ R4.

Two known defects of this screen, established against us on 2026-09-08 and carried here **without
repair**: the broad aggregate was empirically **one rule** (broad ≡ R2 on 249 of 252 held-out atlas
entries), and R4 fired **0** times on the held-out atlas half. Whether those are properties of the
*screen* or of the *atlas* is one of this session's questions (P3).

### 1.3 One rule is added, and its origin is disclosed

**R5 — title echo.** The normalised, case-folded descriptive value, stripped of trailing
punctuation, is equal to the record's title, or is a substring of it, or contains it and is at most
1.25× its length.

R5 **was not in the frozen set** and is added here. It was suggested by a record seen during the
feasibility probe of §1.4 — a dataset on data.gov.uk whose whole description was its own title
repeated. Because it was suggested by data inside the population, it is **not** on the same footing
as R1–R4, and this file says so in advance rather than letting the artifact present six equal rules.
It is evaluated only on the held-out half (§3.2) and is reported separately everywhere.

`broad5` = broad ∨ R5 is reported beside `broad`, never instead of it.

### 1.4 What was seen before this file was written (full disclosure)

Feasibility probes only, run 2026-09-11 before this commit, and no outcome of this study:

- Reachability and record shape of five candidate catalogues (see §2.3 for what happened to each).
- Field **fill rates on one page of 100 records** for the Art Institute of Chicago
  (`description` 0/100, `provenance_text` 100/100) and for the Cleveland Museum of Art
  (`description` 100/100 at one offset, 995/1000 at another).
- `notes` filled on 983 of 1000 data.gov.uk records at one offset; 20 of 20 on govdata.de.
- **One** govdata.de record showing an identical description repeated across map-tile datasets,
  and **one** data.gov.uk record whose description was its title (`NHS Barnsley CCG Expenditure
  over £25K Apr 2020`) — the record that suggested R5.
- Deep paging works on all three APIs (tested at offsets 60,000 / 140,000 / 68,000).

No screen was run against any record before this commit. No rate, no association, no audit.

---

## 2. The catalogues

### 2.1 Included, with the field that plays the atlas's role

The atlas's `decisive_move` is *the catalogue's own free-text account of the record*. The analogue
is named per catalogue in advance:

| # | Catalogue | Records (API-reported) | Descriptive field | Primary stratum |
|---|-----------|------------------------|-------------------|-----------------|
| C1 | Cleveland Museum of Art, open access API | 68,771 | `description` | `department` |
| C2 | data.gov.uk (CKAN at `ckan.publishing.service.gov.uk`) | 67,975 | `notes` | `organization` |
| C3 | govdata.de (CKAN) | 146,492 | `notes` | `organization` |

**Census, not sample.** Every record of every included catalogue is fetched, in pages of 1,000,
sorted `name asc` (CKAN) or by API offset (CMA). There is therefore **no sampling error** in any
rate reported from these three catalogues, and no cluster structure to argue about. Only the
fields needed are retained; **no third-party corpus is committed** (protocol §7), only derived
counts and short quoted values with their source URL.

**Why the primary stratum is what it is.** On the atlas, provenance meant *which upstream source
supplied this record*. On C2 and C3 that is exactly what `organization` is. On C1 there is no
upstream supplier — one museum wrote every record — so the closest available analogue is the
curatorial `department` that produced it, and the artifact must say that this is a weaker analogue
and not pretend otherwise.

### 2.2 A fourth catalogue, measured for one number only

| C4 | Art Institute of Chicago API | 132,744 | `description` | — |

C4 is expected to fire kill condition **K1** (§4). It is included precisely so that the "cannot be
scored" case is in the record rather than quietly dropped. Twenty seeded-random pages of 100
records are fetched; the only figure taken from it is the fill rate of its declared descriptive
fields.

### 2.3 Considered and excluded, with the reason

- **V&A** — search endpoint returns no descriptive field; one HTTP request per object would be
  needed for 1.3 M objects. Excluded: cost, not access.
- **opendata.swiss** — HTTP **403** to a plain API request on 2026-09-11. Recorded as an access
  fact (open question 46), not as a paywall.
- **catalog.data.gov** — HTTP **404** at the documented CKAN action path on 2026-09-11.
- **Harvard Art Museums, Rijksmuseum, Europeana, DPLA, Smithsonian** — require an API key this
  practice does not hold.

### 2.4 The comparison case

The house's own Atlas of Data Art (521 works, field `decisive_move`) is re-measured in the same run
with the same code, as the **home** arm. Its figures must reproduce 2026-09-08's exactly; if they
do not, the run is void and says so.

---

## 3. Method

### 3.1 What counts as a value

A record contributes a value if its descriptive field is present and non-empty after whitespace
normalisation. HTML is **not** stripped before the screen runs: on the atlas it was not stripped
either, and R1 exists to catch exactly that residue. Records whose field is absent or empty are
counted under **declared** missingness and are not put to the screen.

### 3.2 Development and held-out halves

Per catalogue, `sha256(record id) mod 2` → 0 development, 1 held out. **Every number that a
prediction in §5 is judged against is computed on the held-out half only.** The development half
exists so that the artifact's prose, figures and audit sheet can be built without touching the
numbers that decide anything.

### 3.3 The blind hand audit

Session 155's hand audit sheet carried the detector's verdict in the same row as the value being
judged (`data/audit-sample.json` of 2026-09-08 has `hollow_broad` and `hollow_strict` beside each
title). **That audit was therefore not blind**, and its agreement figure (75 %, κ 0.42) is worth
less than it was presented as being. This is filed as a correction against our own shipped work in
this session's `VERIFICATION.md` and the procedure is fixed here:

1. The tool draws 60 held-out values — 30 from C1, 30 from C2 — with a fixed seed, and writes
   `data/audit-sheet.json` containing **an opaque id and the value text and nothing else**. No
   flag, no rule, no stratum, no title, no rate.
2. The sheet is committed.
3. The reader labels each value `usable` / `says nothing about the record it is attached to` /
   `cannot tell`, into `data/audit-labels.json`, from the sheet alone.
4. The labels are committed.
5. Only then does the tool join labels to flags and compute agreement.

The label question, fixed now: **"Reading only this value, do you learn anything about the
particular object or dataset it describes, beyond what a catalogue-wide boilerplate would tell
you?"** No → *says nothing*. Yes → *usable*. Genuinely undecidable → *cannot tell*, and those rows
are reported separately and excluded from κ.

### 3.4 Statistics

Permutation test (10,000 relabellings, seeded) of the chi-square statistic for
`hollow_broad × primary stratum`, on held-out records, strata pooled to those with ≥ 20 held-out
records with the remainder in a single `(small strata)` level. Benjamini–Hochberg at q = 0.05 over
the whole family of tests reported. **Multiplicity discipline, learnt the hard way twice:** the
primary test is *one per catalogue, three in total*. Secondary covariates may be reported, but only
as exploratory, and the artifact must state that correlated covariates inside one catalogue are not
independent observations — that was our own defect on 2026-09-04 and again on 2026-09-08.

Concentration is reported as the **top-stratum flag share ÷ top-stratum record share** on the
held-out half, with the stratum named.

No model is called anywhere in the measurement. Standard library only. Every random draw seeded.

---

## 4. Kill conditions

Each fires automatically, is reported whether it fires or not, and **suppresses the corresponding
number rather than degrading it**:

- **K1 — no field to score.** Descriptive field present and non-empty on < 20 % of records → the
  catalogue's fill rate is reported and **no screen is run on it**. (Expected to fire on C4.)
- **K2 — no stratum to test.** Fewer than 2 strata with ≥ 20 held-out records → no association
  test for that catalogue.
- **K3 — refused access.** A catalogue that answers 4xx/5xx to a plain request is reported as an
  access fact with its status code, and **a bot-block is never reported as a paywall** (the
  conflation caught in our own wording on 2026-09-09).
- **K4 — the home arm does not reproduce.** If the atlas re-measurement disagrees with
  2026-09-08's published figures, every cross-catalogue comparison in the artifact is void and the
  page says so instead of reporting them.
- **K5 — census incomplete.** If any catalogue's harvest returns fewer than 95 % of the
  API-reported record count, that catalogue is reported as a partial harvest with the achieved
  fraction, and its rates are labelled as such on the page.

---

## 5. Predictions, and what refutes each

Judged on held-out halves. Each is written so it can fail.

**P1 — the gap travels.** In each of C1, C2, C3: declared completeness of the descriptive field
≥ 95 %, *and* the broad screen flags ≥ 5 % of non-empty values.
*Refuted if* any included catalogue has completeness < 95 % or a broad flag rate < 5 %.

**P2 — hollowness has an address (question 44).** In each of C1, C2, C3 the association between
`hollow_broad` and the primary stratum survives BH at q = 0.05, **and** the top-contributing
stratum's flag share is at least 2× its record share.
*Refuted, per catalogue,* if the test does not survive BH, or the concentration ratio is < 2.
*This is the session's headline prediction and the one most likely to fail on C1*, where the
stratum is a curatorial department rather than a supplier.

**P3 — the screen is one rule, everywhere.** In each scored catalogue, `broad` and R2 alone agree
on ≥ 95 % of held-out values.
*Refuted* wherever agreement is < 95 % — which would mean the collapse we found at home is a
property of the atlas and not of the screen.

**P4 — it transfers to a reader.** Against the blind audit of §3.3: agreement ≥ 75 % and
Cohen's κ ≥ 0.42, i.e. no worse than the (non-blind, and therefore flattering) figures the same
screen achieved at home.
*Refuted* if either falls below. A failure here means the screen is a home-field instrument and
every rate it reports elsewhere is a screen output and not an estimate of anything.

**P5 — the screen is partly a language artefact.** On C3 (German), R3's **opener limb** — the
30-word English continuation list — fires on < 1 % of held-out values, while on C2 (English) it
fires on ≥ 1 %.
*Refuted* if the German rate is ≥ 1 % or the English rate is < 1 %. If confirmed, the consequence
is stated on the page: cross-language comparison of hollowness rates is partly a comparison of
languages, and our own screen under-detects abroad.

**P6 — the fifth kind is real.** R5 fires on ≥ 1 % of held-out values in at least one of C1–C3,
**and** flags at least 20 held-out values that no frozen rule flags.
*Refuted* if it fires below that rate everywhere, or adds nothing beyond R1–R4.

**P7 — the home arm reproduces.** The atlas re-measurement returns the published 2026-09-08
figures to the digit: 521 entries, broad flag rate 40.5 % overall, R4 hits 0 on the held-out half.
*Refuted* if any differs — and then K4 fires.

---

## 6. What this session will not claim

- Not that a flagged value *is* missing data. The screen is a **screen, not a rate** — established
  against us on 2026-09-08 and unchanged by anything here.
- Not that these three catalogues are a sample of catalogues. They are three catalogues reachable
  without a key by an automated reader on 2026-09-11, and §2.3 names the ones that were not.
- Not that a low hollowness rate means a good catalogue, or the reverse.
- No claim about any named institution's practice beyond what its own API returned on this date,
  quoted with its record URL. Criticism, where any is offered, is of a **metric** — completeness
  counted as presence — and never of a person or an institution's character.

---

*Committed before the harvest. Nothing in §2–§5 may be edited after this commit; corrections are
appended dated, as everywhere in this record.*
