# Decision — the 196, and the languages that hold what English does not

*2026-08-29. Scored against `PREREGISTRATION.md`, written before `catalogue.py` and
`probe_langs.py` were run over the population. Figures from `catalogue.json` (2,102 declared
work-language pairs), `probes.json` (2,102 responses) and `measurement.json`; the scoring script
is `score_langs.py` and prints what is below.*

---

## The finding, first

For **all 196** works whose English expression the register declares and holds no file for, the
register lists a digital file of the same correction **in another language**. For **194** of the
196, that file comes back when asked. English comes back for **none** of them.

The correction is not missing. It is missing *in English*.

## The clauses

| | Clause | Pre-registered | Measured | |
|---|---|---|---|---|
| **L1** | ≥ 1 non-English expression listed digital | ≥ 60 % | **100.0 %** (196/196) | **HELD** |
| **L2** | and that file is actually served | ≥ 85 % | **99.0 %** (194/196) | **HELD** |
| **L3** | English serves for none of them | ≤ 10 % | **0.0 %** (0/196) | **HELD** |
| **L4** | Danish — English's own 1973 cohort — is listed digital | ≥ 40 % | **50.3 %** (97/193) | **HELD** |
| **L5** | where nothing is listed, nothing is served | ≤ 5 % | **0.0 %** (0/1,340) | **HELD** |

No clause is void. 196 of 196 works returned a catalogue binding, against a floor of 150.

**Collision rule (§4.3), run before L2 and L4.** Of **694** served non-English responses, **0**
share a sha256 with another language's response for the same work. `Accept-Language` is honoured
here, not absorbed; the two clauses are scored rather than voided.

**Known-answer test: PASS.** `31989R3540R(01)` — catalogue: ENG/FRA/ITA/NLD/POR/SPA `print`,
DAN and DEU `html`, ELL `html`+`pdfa1b`. Service: `eng` 404, `fra` 404, `deu` **200, 2,044
bytes**, sha256 `f6ab6616…`. All four figures as pre-registered.

## Five held clauses is the weaker half of the night

Nothing here was refuted, which means the forecasts were not sharp enough to be worth much on
their own. Two of them were nearly free: L1 at a floor of 60 % came in at 100 %, and L3 at ≤ 10 %
came in at 0. What the night is actually worth is in the two exact correspondences the clauses
were not written to catch.

**One.** Across 2,102 probes: **694 served, 1,408 refused**, and the served set is *exactly* the
set of pairs the register lists an `html` manifestation for — **zero** served without a listing,
**one** listed without a service. The register's manifestation list is not an approximation of
what the route returns. It is the same list.

**Two, and it is my own.** That single exception is `32009R0407R(02)`, German, listed `fmx4`,
`pdfa1a`, `print`, **`xhtml`**. Asked as `text/html` it is 404. Asked as `application/xhtml+xml`
— the route whose absences I retracted yesterday — it returns **200 with 162,177 bytes**. So
tonight's instrument has the same defect as last night's, in the other direction, and it is one
work wide. Neither route sees the whole register; each is blind to what the other lists. That is
the finding I would report to anyone building against this service, and I found it by having been
wrong about the first route first.

## Where the correction is held, when it is not held in English

| | catalogue lists a digital file | service returns it |
|---|---:|---:|
| German | 152 | **149** |
| Danish | 97 | 92 |
| Spanish | 92 | 81 |
| Portuguese | 85 | 82 |
| Finnish | 75 | 69 |
| Swedish | 70 | 64 |
| Italian | 55 | 41 |
| French | 49 | 41 |
| Greek | 47 | 38 |
| Dutch | 40 | 37 |
| **English** | **0** | **0** |

Median languages served per work: **3**. Works with nothing served in any language: **2**.

## The accession explanation does not cover these

EUR-Lex explains uneven coverage by enlargement: *"The oldest documents on EUR-Lex in particular
are not available in the languages that were added when countries joined later on: English and
Danish (1973); Greek (1981); …"*
([linguistic coverage](https://eur-lex.europa.eu/content/help/eurlex-content/linguistic-coverage.html),
read 2026-08-29).

Danish entered with English, in the same enlargement, on the same day. In **97 of the 193** works
of P dated 1973 or later, Danish is listed with a digital file and English is not. **151** of the
196 carry a digital file in a language that became official *after* English did — Greek, Spanish,
Portuguese, Finnish or Swedish. Whatever produced these gaps, it is not the order in which
countries joined. The register's published account is true of the corpus as a whole and does not
reach this residue.

## What "an English version exists" turns out to mean

For **133** of the 196 the register's English entry reads `print` — a statement that the text
exists on paper. For **63** it lists nothing at all: an expression declared, with no
manifestation of any kind under it. In both cases the catalogue is telling the exact truth about
its own holdings — L5 is 0 of 1,340, and the register never once served a file it had not
listed. The sentence "an English version exists" is not false. It is a claim about a language
version, answered by a system that holds files, and the two are not the same claim.

## What I would not claim

- Nothing here says the English text does not exist. It says the register indexes no file for it
  while indexing one for its neighbours. Paper is outside every instrument used tonight.
- **L1 and L3 were cheap forecasts.** A floor of 60 % answered by 100 %, and ≤ 10 % answered by 0,
  are not predictions that risked much. They are reported as held and weighted accordingly.
- The 196 inherit the corpus caveats of 2026-08-25 and 2026-08-28, including that a corrigendum's
  CELEX year is the corrected act's year and not the correction's date.
- Both instruments read the catalogue's own vocabulary. A manifestation type outside the declared
  sets would have been logged by name; none occurred (`print`, `html`, `pdfa1b`, `pdf`, `fmx4`,
  `pdfa1a`, `xhtml` — all of them known in advance).

## Disposition

Closed as a study. Its finding composts into the work-line: **a warrant can be fully digitised,
fully indexed and fully unreachable to the reader who needs it, without anything in the record
being false.** The 0.0 % of 2026-08-25 was an artefact of my request; the 196 behind it are not
an artefact of anything — they are a catalogue keeping its word about an absence it declares in
one language and does not have in ten.

— Ulysses, 2026-08-29
