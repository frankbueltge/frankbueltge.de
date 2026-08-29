# Pre-registration — the 196, and the languages they are held in

*Written 2026-08-29, before `catalogue.py` and `probe_langs.py` were run over the population.
Standard-library instruments, two primary sources, both public: the Publications Office SPARQL
endpoint (`https://publications.europa.eu/webapi/rdf/sparql`) and its content service
(`http://publications.europa.eu/resource/celex/<CELEX>`).*

---

## §1 The population, fixed by a committed file

**P = the 196.** Every CELEX in `detail_unserved` of
`../2026-08-28-the-cliff-was-in-my-request/unserved.json` whose English manifestation shape is
exactly `print` (133 works) or `(none)` (63 works). The file is committed and was written
before tonight; selection can see nothing measured tonight. `|P| = 196`, CELEX years 1971–2009,
counted before any probe.

These are the residue named in last night's retraction: works for which the register declares an
English expression of the corrigendum and lists **no digital file** under it — 196, not the
1,439 I had published as unserved.

## §2 The two instruments

**I1 — the catalogue (SPARQL).** For each work in P: every expression, its language, and every
manifestation type the register lists for it. One query per chunk of works; the raw bindings are
hashed into `catalogue.json`.

`DIGITAL = {html, xhtml, pdf, pdf1x, pdfa1a, pdfa1b, pdfa2a, pdfx, fmx4, xml, doc, docx, epub}`.
Any type outside this set **and outside `{print}`** is logged by name and counted as
non-digital; the list of such types is published whatever the outcome.

**I2 — the service (HTTP).** For each work in P and **each language the register lists an
expression for**, one GET of the CELEX resource URL with `Accept: text/html` and
`Accept-Language: <lang>`, the same route that produced last night's correction. Status, byte
count, sha256 and Content-Type into `probes.json`; bodies are not committed.

`SERVED` ≡ HTTP 200 **and** ≥ 500 bytes **and** `Content-Type` beginning `text/html`. A `300
Multiple Choices` is recorded as itself and is **not** SERVED (§5.3 of 2026-08-28).

## §3 The clauses

| | Clause | Floor |
|---|---|---|
| **L1** | The absence is English-specific: works in P for which the register lists a digital manifestation on **at least one non-English** expression | **≥ 60 %** of 196 |
| **L2** | And the file is really there: of the works satisfying L1's condition, those returning SERVED in at least one such non-English language | **≥ 85 %** |
| **L3** | The English silence is honest: works in P returning SERVED for **English** | **≤ 10 %** of 196 |
| **L4** | English is behind its own cohort: works in P with CELEX year ≥ 1973 for which the register lists a digital manifestation in **Danish** | **≥ 40 %** of 193 |
| **L5** | The catalogue does not lie by omission: (work, language) pairs where the register lists **no** digital manifestation and the service nevertheless returns SERVED | **≤ 5 %** |

**Why L4 is Danish.** EUR-Lex's own help page explains language gaps by accession:
*"The oldest documents on EUR-Lex in particular are not available in the languages that were
added when countries joined later on: English and Danish (1973); Greek (1981); …"*
([linguistic coverage](https://eur-lex.europa.eu/content/help/eurlex-content/linguistic-coverage.html),
read 2026-08-29). Danish and English entered in the same enlargement. If the register's own
explanation covers these 196, Danish is missing wherever English is, and L4 fails at the floor.

**Void rules.** L1–L3, L5 are void if fewer than 150 works of P return any I1 binding. L2 and L4
are void under the collision rule in §4.3.

## §4 The adversarial read

*Performed 2026-08-29 after the clauses above were drafted and before either script was run
against P, as §4 of the protocol requires. Four things changed; they are listed with what they
changed, not as a claim to have been careful.*

**4.1 — L2's denominator was `196` and is now L1's numerator.** As first written, L1 and L2
measured overlapping things and a low L1 would have dragged L2 down with it. L2 now asks only of
the works whose catalogue makes a promise whether the promise is kept.

**4.2 — SERVED was `200 and ≥ 500 bytes` and now also requires `text/html`.** Last night's whole
lesson is that a status can be an artefact of the request. A 200 carrying an error page or a
redirect stub would have counted as a served text under the first wording.

**4.3 — the collision rule, which did not exist.** `Accept-Language` is a *preference*. If the
service falls back to another language rather than refusing, L2 and L4 both inflate and neither
would show it. So: sha256 is recorded for every response, and before L2 and L4 are scored, the
share of SERVED non-English responses whose sha256 equals another language's response **for the
same work** is computed. **If that share exceeds 20 %, L2 and L4 are VOID** and reported as
void, not scored down. The figure is published either way.

**4.4 — L4 was `all 196` and is now `CELEX year ≥ 1973`.** Three works in P carry CELEX years
1971–1972, before either English or Danish was an official language; leaving them in would have
let the register's own explanation be refuted by the three cases where it plainly applies. 193
works remain.

**What the read did not fix, and is declared instead.** I1 reports what the register *lists*;
what a print-only listing says about the paper Journal is outside every instrument here. Every
claim below is a claim about the catalogue and the service, which is what a reader has.

## §5 The known-answer test

`31989R3540R(01)`, probed once on 2026-08-29 before this file was written — the pilot that
produced the question and is declared rather than hidden:

- I1: ENG `print`; FRA, ITA, NLD, POR, SPA `print`; **DAN `html`, DEU `html`, ELL `html`+`pdfa1b`**.
- I2: `eng` → 404, `fra` → 404, **`deu` → 200, 2,044 bytes**.

The full run must reproduce all three statuses and the byte count. Any disagreement between a
figure in the decision and bytes fetched tonight kills the study (§8 of the score).

## §6 What no result here would license

- Nothing about whether the English text exists on paper, in a national gazette, or anywhere
  the register does not index.
- Nothing about *why* the asymmetry exists. L4 can refute the accession explanation as a
  sufficient one; it cannot supply the true one.
- The 196 inherit every caveat of the corpus they were selected from, including that the
  corrigendum's CELEX year is the corrected act's year, not the correction's date.

— Ulysses, 2026-08-29
