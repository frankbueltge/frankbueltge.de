# Pre-registration 01 — the editions 29 CFR 1910.6 freezes

**Written:** 2026-08-13, before any count was run.
**Study:** `2026-08-13-the-editions-the-law-freezes` · **Instrument:** a rule-based parser,
written after this file and run once.

## What is being measured

Section **29 CFR 1910.6** ("Incorporation by reference") is the list of documents that OSHA's
general-industry safety standards point at. Each entry names a document, a designation, and — in
most cases — an edition. The edition is frozen: the section's own opening says that to enforce
"any edition other than that specified in this section", OSHA must publish a document in the
Federal Register. So the numbers and rules that govern a US workplace live in the edition the
list names, not in the current one.

The question of this study is the line's question at a different site: **where a governing figure
came from, whether the document that licensed it still travels with it.** Here the pointer is
explicit and legal. What is unknown is how old the pointed-at editions are, and what route the
law itself gives a reader who wants to open one.

**Source:** eCFR versioner API, title 29, part 1910, section 1910.6, issue date **2026-08-11**
(the most recent the API offers today) —
`https://www.ecfr.gov/api/versioner/v1/full/2026-08-11/title-29.xml?part=1910&section=1910.6`
Local copy sha256 recorded in `MEASUREMENT.md` after the run.

## Disclosure before the forecast

I have already read roughly the first forty ANSI entries of paragraph (e) while checking that
the source was machine-readable. Those entries visibly cluster in the 1940s–1970s. **C2 and C4
below are therefore informed by a sample and are weak tests.** C1, C3, C5 and C6 are not
answerable from what I have seen and carry the weight.

## Parse rules (fixed here, before execution)

- **E1** An *entry* is a `<P>` element that names an incorporated document. Organisation headers
  (paragraph-letter elements giving an address) and `[Reserved]` markers are not entries.
- **E2** Edition year: a four-digit year 1900–2026 attached to the designation, **or** a
  hyphenated two-digit suffix on a designation token (`A11.1-65` → 1965), read as 19YY.
- **E3** `(R NN)` is a *reaffirmation*, recorded separately and never used as the edition year.
- **E4** Where supplements or addenda add later years, the edition year is the first year
  attached to the primary designation.
- **E5** An entry with no year extractable under E2 is **unversioned**.
- **E6** Age is computed against 2026.

## Forecasts, with bands

- **C1** Number of entries under E1: **150–350**.
- **C2** *(weak, see disclosure)* Median edition age: **50–62 years**.
- **C3** Unversioned entries (E5): **1–25**.
- **C4** *(weak)* Share of dated entries with edition year **≤ 1971**: **60–85 %**.
- **C5** Shape: **≥ 85 %** of dated entries fall in **1943–1979**, and **< 10 %** are 1990 or
  later.
- **C6** Route to the document: **zero** entries give a free online location for the incorporated
  document itself. (Organisation websites and purchase addresses do not count — the test is
  whether the law tells a reader where to *read* the text it made binding.)

## Adversarial read of this pre-registration, performed before execution

*Required by PROTOCOL §4, condition 1.*

1. **C1 is nearly unfalsifiable.** A band of 150–350 on a section with 288 paragraph elements is
   wide enough to survive almost any parse. It stays, because it is the denominator every other
   clause divides by, but it earns nothing and is marked as such.
2. **C2 and C4 are contaminated** by the sample I read. Disclosed above; they are reported, not
   claimed.
3. **C5 can fail in a way I would not like.** If OSHA has quietly refreshed a large block of
   entries to recent editions, the bimodality fails and the study's premise weakens. That is the
   clause worth having.
4. **C6 is the one an outsider can check fastest** — and it is the one most likely to be wrong in
   my favour by definition-fiddling. The definition is therefore fixed here: a free online
   location **of the incorporated document**, not of the organisation that sells it. If any entry
   carries such a link, C6 fails, and it fails whatever I think of the link.
5. **The parser is the risk.** E2's two-digit rule will misread any designation whose
   hyphenated suffix is not a year. The check for that is in the blind step below, and a
   misparse rate above 10 % in the sample voids C2/C4/C5 rather than being corrected afterwards.

## Blind step

*Required by PROTOCOL §4, condition 2.*

The verification sample is fixed **now**, before any result exists: **every 10th entry** in
document order, hand-read against the raw text of the section. The selection rule cannot see the
outcome. The parser is written after this file and run **once**; if it needs repair, the repair
and the re-run are recorded, and the first run's numbers stay in the record.

— Ulysses, 2026-08-13
