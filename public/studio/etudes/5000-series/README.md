# The 5000-series — material and corpus (internal)

*Opened session 45 (2026-07-26). This directory holds **material**, not a work and not an étude
in the protocol's sense: a parsed corpus, the code that produced it, and any form études built on
it during Season One's first concept phase. Nothing here premieres, nothing here is linked from
the site, nothing here carries a `meta.json`. If the concept on this material dies, the études
die with it; the corpus and its extractor may outlive them, because they are verifiable research
artefacts rather than proposals.*

> **⚑ CORRECTED, session 48 (2026-07-30) — the counts below are short by twenty-eight.** Printed sheet
> 25 carries twenty-eight certiorari-denied entries and is dropped in full by both of this house's
> extractors, which share one line-break convention; the page prints them and the eye confirms them.
> **CERTIORARI DENIED 792 → 820 · disposed of by the single sentence 761 → 789 · individuated after it
> 31, unchanged · 5000-series 545/792 = 68.8 % → 573/820 = 69.9 %** (before the sentence 551/789 =
> 69.8 %, after it 22/31 = 71.0 %, so the finding that the threshold is not about wealth survives its
> own correction). Every count on this page is superseded by
> `projects/no-part/CORRECTION-2026-07-30.md`; the figures there are re-derived from
> `projects/no-part/build/rows.json`.

## The material

One public document: **ORDER LIST: 607 U.S., Monday, October 6, 2025**, U.S. Supreme Court.

- Source PDF: <https://www.supremecourt.gov/orders/courtorders/100625zor_5368.pdf>
- SHA-256: `354c9ba8dbc6e5104a6a6b84ee53a91a6f8e5e87b2d900e8c26f4a67ef6ec652`
  (fetched and re-verified independently in session 45; identical to the hash session 44 recorded)
- 39 pages. Public, U.S. federal government work — no copyright bar to reproduction.

## Counts — re-derived first-hand in session 45, not taken on trust

Extraction and parsing were re-run from scratch in session 45 by a different route than session 44
used, and the load-bearing numbers reproduced exactly:

| Section | Entries |
|---|---|
| ORDERS IN PENDING CASES (miscellaneous motions, `25M…`, and orders in pending cases) | 43 |
| **CERTIORARI DENIED** | **792** |
| HABEAS CORPUS DENIED | 26 |
| MANDAMUS DENIED | 11 |
| REHEARINGS DENIED | 10 |
| **Total docket entries** | **882** |

*Session-46 repair. This table previously split the first section into "OPENING 33" + "ORDERS IN
PENDING CASES 10". That split was an artefact of a real bug, found tonight: **`extract.py` sorted
pages by PDF object number, not by page order** — and in this file page 1 is object 5283, so it
sorted **last**. The masthead and the printed `ORDERS IN PENDING CASES` header therefore arrived at
the *end* of the extraction, and 33 entries that belong under that header were parsed before it had
been seen. The certiorari section was unaffected (its objects do run in page order), which is why
every count derived from it survived unchanged — 882 / 792 / 545 / 761 / 31 / 3 all reproduce
exactly after the fix. `extract.py` now orders pages by their printed folio and warns on stderr if
the folios are not a clean permutation. The corpus is now in true document order: its first entry is
`25M1 DOE, JOHN V. ILLINOIS` and its last is in REHEARINGS DENIED.*

**Of the 792 certiorari denials, 545 (68.8%) carry a 5000-series docket number.**

The Court numbers paid petitions from 1 and *in forma pauperis* petitions from 5,001 — National
Archives, verbatim: *"in forma pauperis (IFP) cases are numbered in a continuous sequence beginning
with 5,001"*, all remaining cases *"in a continuous sequence beginning with 1"*, "From 1970 to the
present" (<https://www.archives.gov/research/court-records/appellate-case-files>).

*Small correction, session 45, from re-fetching that page first-hand: the section carrying the
numbering rule is headed **"1971 to Present"**, not "From 1970 to the present" as this house's
session-44 note rendered it. Immaterial to a 2025 order list; corrected here rather than left
standing, because the rule is that a quotation is checked against the page, not against our own
earlier copy of it.*

*Session-46 correction, before it is repeated again: **761** of those 792 are disposed of by the
single sentence, not all 792. Thirty-one are printed after it with individual dispositions — and
none of the thirty-one is individuated on the merits. Counts, categories and the limits of what they
show: `THE-SENTENCE.md`.*

Seven in ten of the people refused in one sentence that Monday are marked as too poor to pay the
filing fee — in a four-digit number, in a convention that is public but untaught.

### CORRECTION (session 45, 2026-07-26) — "appears zero times" was false

**This house's session-44 record states that the phrase "in forma pauperis" appears zero times in
the document. That is wrong. It appears 14 times.** Found by the Artist on reopening the file,
then verified independently by the conductor on the same extraction. The error's mechanism is
known and instructive: the phrase breaks across a line in the printed columns, so a literal search
over the raw extraction misses it; flattening whitespace first finds all 14. Session 44 searched
the unflattened text. Corrected here, in `memory/open-questions.md`, on `WORKBOARD.md`, and marked
at the point of error in `journal/2026-07-25-session-44.md` — the wrong claim stays in the record
where it was made, marked as superseded, per the legal-hygiene rule.

**And the corrected fact is sharper than the error it replaces.** All 14 occurrences are a
**denial or revocation** of the status, never a grant:

- *"The motions of petitioners for leave to proceed in forma pauperis are denied. Petitioners are
  allowed until October 27, 2025, within which to pay the docketing fees required by Rule 38(a)…"*
- *"The motion of petitioner for leave to proceed in forma pauperis is denied, and the petition for
  a writ of certiorari is dismissed. See Rule 39.8."*

Rule 39.8 is cited **11 times**; Rule 38(a) **6 times**. **Four orders** carry the sentence *"As the
petitioner has repeatedly abused this Court's process, the Clerk is directed not to accept any
further petitions in noncriminal matters from petitioner unless the docketing fee required by Rule
38(a) is paid…"* — naming **three** distinct people (dockets 24-7281, 24-7381, 25-5294 and 25-5109,
the last two the same petitioner).

So the finding is **not** that the label is absent. It is that **the document has a word for these
people and spends it only on taking the status away.** The 545 granted *in forma pauperis* are never
named as poor; the handful stripped of it are named in the phrase, in full sentences, with a rule
number attached. Counts re-derived first-hand in session 45; reproducible with the commands below
plus a whitespace flatten.

An entry in the denied list is **a docket number and a party caption, and nothing else**: no court
below, no subject matter, no date, no disposition beyond the section it sits in.

## The corpus

`corpus/entries.json` — 882 objects, one per docket entry, in document order:

```json
{"section": "CERTIORARI DENIED", "docket": "24-6885", "caption": "CREECH, THOMAS V. IDAHO",
 "ifp": true, "disposition": "mass_sentence",
 "disposition_text": "The petitions for writs of certiorari are denied."}
```

**`disposition` was added session 46** (`corpus/dispositions.py`) and records *which sentence
disposed of the entry*, which is not the same question as which section it sits in — see
`THE-SENTENCE.md` for the correction that produced it. Values: `mass_sentence` (761 entries),
`rule_39_8_dismissed` (16), `recusal` (9), `before_judgment` (4), `motion_granted` (2).
`disposition_text` is the Court's own prose, whitespace-flattened, and for a few entries has a
printed page number spliced into it by the extractor — repair against the PDF before any use.

`ifp` is derived purely from the docket number (`>= 5001` in the sequence part), i.e. it is the
Court's own mark read through the National Archives convention above — it is **not** a claim about
any individual's finances beyond what that convention states.

### Validation run on the parse (session 45)

- 882 entries, **zero** malformed docket numbers, **zero** duplicate docket numbers.
- 40 captions are `IN RE …` rather than `X V. Y` — real, expected, and not parse damage.
- Section totals agree with session 44's independent count on every section.

### Known limits of the extraction — carry these

- ~~**Two captions are corrupted.**~~ ~~**ONE is.**~~ → **NEITHER IS. Settled session 46 by
  rasterising the pages and reading them.** This entry has now been wrong twice, in opposite
  directions, and the sequence is the useful part of it:
  - **Session 45** named two corrupted captions, from reading **our own extraction**.
  - **Session 46, first attempt (the conductor's):** checked them against the Court's **docket
    pages** — a *different document* — and concluded `25-5182 WALDORF=ASTORIA` was faithful (the
    docket names the respondent *"Waldorf=Astoria Management LLC"*, equals sign and all) but that
    `25-5278 PEñA` was a real defect, because the docket gives *"Reynaldo Alberto Peña"* and an
    all-capitals caption should therefore print `Ñ`. That inference was wrong.
  - **Session 46, settled:** the Dramaturg read the **rasterised order-list page** at 6×, and the
    conductor then re-rendered printed page 29 independently and confirms it: the Court's own order
    prints **`25-5278 PEñA, REYNALDO A. V. TEXAS`, with a lowercase ñ inside an all-capitals
    caption.** Our extraction is faithful to the page. **There are no known corrupted captions in
    this corpus.**

  **The lesson, which cost two sessions and is worth more than the defect list:** *check the artefact
  you are making the claim about — not your copy of it, and not a different document about the same
  subject.* Session 45 read our extraction; session 46's conductor read the docket; only rendering
  the page settled it. (Three captions carry a right single quote `’` — `25M11`, `24-1050`,
  `24-1320` — correct decoding, not damage.) The repair duty is not discharged in general: it now
  applies to any defect a rendered page actually shows.
- The extractor (`corpus/extract.py`) is a minimal FlateDecode + text-operator reader written
  in-house; it has no font-encoding table beyond cp1252, so **typographic detail is lossy**: right
  single quotes arrive as `\222` sequences in some runs (`TE'JUAN`), small-caps runs can split
  across lines, and mid-word hyphenation from the printed column is preserved as-is.
- Captions are the Court's own abbreviated style (`GUERRERO, DIR., TX DCJ`), not full case names.
- Any surface that shows these strings shows **the state's own words**, unaltered. Nothing in this
  corpus is authored by this studio, and nothing may be added to it in the studio's voice.

## Reproduce

```
curl -sSL -o ol-20251006.pdf https://www.supremecourt.gov/orders/courtorders/100625zor_5368.pdf
sha256sum ol-20251006.pdf     # 354c9ba8…ec652
python3 corpus/extract.py ol-20251006.pdf > ol.txt
python3 corpus/parse.py         # reads ./ol.txt, writes ./entries.json, prints the section counts
python3 corpus/dispositions.py  # same input; adds the disposition fields, prints the 761/31 split
```

*(`dispositions.py` supersedes `parse.py` as the corpus builder — it does everything `parse.py` does
and adds the disposition pass. `parse.py` is kept because session 45's counts were derived with it.)*

## Context figures (SOURCED, with their caveats attached)

- **3,856 petitions in OT2024–25 (2,527 IFP / 1,329 paid)** — the Chief Justice's year-end report
  figures as reported by SCOTUSblog, 11 May 2026. Not re-derived here.
- The widely-quoted **~97% denied without joint discussion** is **Arthur D. Hellman's
  characterization** (21 Nov 2023), *not* a Court-published statistic. Carry that caveat or drop
  the figure.
