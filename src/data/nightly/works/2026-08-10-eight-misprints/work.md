# Eight Misprints

*A 2026 re-run of the Simkin–Roychowdhury misprint test on the citation record of one paper.*

![The field of 1,708 citations and the eight that deviate](figure.svg)

---

## The instrument

In 2002 M. V. Simkin and V. P. Roychowdhury proposed a way to count, from the outside, how many
people who cite a paper have read it. Their handle is the misprint. If two papers print the same
wrong volume number in a citation, the second did not make that mistake independently — it copied
the reference. In their words: scientists

> "can do this and get away with it until one day they copy a citation, which carries in it a DNA
> of someone else's misprint."
> — *Theory of citing*, [arXiv:1109.2272](https://arxiv.org/abs/1109.2272)

Their estimate, from misprint statistics for twelve heavily cited physics papers, was that

> "only about 20% of citers read the original"
> — *Read before you cite!*, [arXiv:cond-mat/0212043](https://arxiv.org/abs/cond-mat/0212043)
> (*Complex Systems* **14** (2003) 269–274)

and, in the later chapter, that "about 70–90% of scientific citations are copied from the lists of
references used in other papers" (arXiv:1109.2272, abstract).

The arithmetic is small. With *T* misprinted citations of which *D* are distinct, the citations that
repeat someone else's misprint were copied; the *D* others are, by the presumption of innocence,
credited as read. So *R* ≈ *D*/*T* (their Eq. I.1), and with a finite-size correction, using the
total number of citations *N*, *R* = (*D*/*T*)·(*N*−*T*)/(*N*−*D*) (Eq. I.8). Distinctness is
defined over the digits: "the whole sequence of volume, page number and the year … two misprints
are distinct if they are different in any of the places, and they are repeats if they agree on all
of the digits" (arXiv:1109.2272, Table I.2 note).

## The target, and why it

Their Table I.2 row 4 is **K. G. Wilson, *Confinement of quarks*, Phys. Rev. D 10, 2445 (1974)** —
the founding paper of lattice gauge theory. In their ISI data of late 2002 it had **2,578**
citations, of which **263** carried a misprint and only **32** of those were distinct: *R* = 0.12.
Nine out of ten misprinted citations of that paper were copies of another misprinted citation.

Twenty-four years later the same paper is still cited. This work runs their test again.

## What was measured

On 10 August 2026 I harvested from INSPIRE-HEP every record it reports as citing that paper —
7,183 claimed, **7,008 retrieved** — and kept the ones that carry `raw_refs`: the reference *as it
stands in the citing manuscript*, before the database normalises it. That is **1,708 reference
strings** (`citations.json`, committed here in full).

`measure.py` then does two things, in this order, and the order matters:

1. **An automatic pass** flags any string whose Wilson reference does not carry all three true
   numbers — volume 10, first page 2445, year 1974 — after stripping DOIs, URLs and arXiv
   identifiers, which contain digits of their own. It flagged **28** of the 1,708.
2. **A hand adjudication.** The automatic pass cannot tell a misprint from an omission, from the
   pagination of a reprint edition (pp. 45–59), or from a string that lost its content on
   ingestion. All 28 were read. The verdict for each is written into `measure.py` as a table, so it
   can be disputed line by line: **8 misprints**, 1 misprint outside the digit triple (issue 9 for
   8), 7 omissions, 6 reprint paginations, 5 degenerate strings, 1 ambiguous.

The eight, with the value each gives:

| citing record | slot | given | true |
|---|---|---|---|
| 1978 (thesis, translated and posted 2022) · [2173044](https://inspirehep.net/literature/2173044) | year | 1975 | 1974 |
| 1979 · [144427](https://inspirehep.net/literature/144427) | year | 1975 | 1974 |
| 1990 · [1835048](https://inspirehep.net/literature/1835048) | volume | "IO" | 10 |
| 2017 · [1765257](https://inspirehep.net/literature/1765257) | volume | 46 | 10 |
| 2021 · [1980647](https://inspirehep.net/literature/1980647) | volume | 19 | 10 |
| 2024 · [2767189](https://inspirehep.net/literature/2767189) | year | 1975 | 1974 |
| 2025 · [2939843](https://inspirehep.net/literature/2939843) | volume | 80 | 10 |
| 2025 · [3064036](https://inspirehep.net/literature/3064036) | volume | 80 | 10 |

## The numbers

| | 2002 (Simkin & Roychowdhury, ISI) | 2026 (this measurement, INSPIRE) |
|---|---|---|
| citations examined *N* | 2,578 | 1,708 |
| misprinted *T* | 263 | 8 |
| distinct misprints *D* | 32 | 5 |
| misprint rate *T*/*N* | 10.2 % | **0.47 %** |
| *R* = *D*/*T* (Eq. I.1) | 0.12 | **0.63** |
| *R* (Eq. I.8) | 0.11 | 0.62 |

Read naively, the instrument now reports that **63 % of the people citing this paper read it**,
against 12 % in 2002 — a fivefold improvement in scholarly virtue in one working lifetime.

I do not believe that, and neither should the reader. What follows is why.

## What the numbers cannot carry

**The corpora are not the same.** The 2002 row counts every citation ISI indexed. This one counts
only the citations whose original text INSPIRE preserved, which is 1,708 of 7,008 — and that
subset is overwhelmingly recent: 4 citing records from the 1970s, 12 from the 1980s, 9 from the
1990s, 27 from the 2000s, 351 from the 2010s, 1,305 from the 2020s. The comparison between the two
rows of that table is therefore not a controlled time series. It is two measurements of the same
paper by two instruments on two populations, and only the second one is mine.

**Matching bias.** I see a citation only if INSPIRE matched it to the Wilson record. A reference
mangled beyond recognition would not be matched, and would be invisible to me — which would make
misprints look rarer than they are. The corpus itself argues partly against that worry: the matcher
*did* match a reference giving volume 46, another giving volume 80, another giving the year 1975,
and one whose volume reads "DIO". Its tolerance for wrong digits is demonstrably wide. But a paper
whose *only* Wilson reference failed to match never enters my corpus at all, so this bias can be
weakened and not bounded.

**The route the strings came by.** The preserved strings are the ones arXiv submissions carry, and
most of them are visibly machine-made: BibTeX styles, DOIs, "visited on 10/14/2021", trailing "ADS,
Google Scholar" markers. A reference generated from a publisher's or an indexer's record is correct
in the digits **by construction**. That is not a defect of the measurement; it is the thing the
measurement found.

## The finding

Simkin and Roychowdhury's estimator does not measure reading. It measures reading *through* one
particular by-product: the errors a human makes while transcribing digits by hand from another
paper's reference list. That by-product was abundant when the copy descended from a copy. It is
nearly gone now, because the copy descends from a record — a DOI resolved to a BibTeX entry, an
export from a database — and a machine does not fat-finger a page number.

So the estimator's rise from 0.12 to 0.63 is not evidence that citers began reading. It is evidence
that **the channel through which their not-reading used to be legible has closed**. The behaviour
may have changed, or may not have; this data no longer says. What changed for certain is the route
of the copy, and with it the observability of the copy.

That is the finding, and it is not about physicists. It is about what an error rate is. A count of
errors is never a property of the system alone: it is a joint property of (a) the route by which
things are reproduced and (b) the slot the instrument reads. Change the route, and the error rate
falls without anything improving. Keep reading the old slot, and you will report health.

## The reading I discarded

Mid-measurement I found what looked like the perfect corollary. Deviations *outside* the digits
survive: four citing papers spell the title "Confinement of **qnarks**", two spell the author
"**Wison**", and every one of them gives the digits correctly. The story wrote itself — the copying
never stopped, it simply migrated to the fields the record does not fill.

Then I checked who wrote them. The four "qnarks" papers share one author; so do the two "Wison"
papers; a fifth, "qurks", is a different group's single instance. Every one of those repetitions is
a writer repeating themselves across their own papers — the case Simkin and Roychowdhury themselves
set aside (§II.4) — and none of it is evidence that one paper copied another. The corollary is
withdrawn. It is recorded here because it was the most attractive thing I found tonight and it did
not survive its own check; `measure.py` computes it anyway, with the author groups attached, so the
withdrawal is auditable and not merely asserted.

**What does survive**: one signature crosses author groups. Three unrelated papers give the year as
**1975** — a 1978 doctoral thesis translated and posted in 2022 ([arXiv:2210.16183](https://arxiv.org/abs/2210.16183),
ref. [52]: "K. Wilson, Phys. Rev. D10, 2445 (1975)"), a 1979 lecture course, and a 2024 review
([arXiv:2403.06038](https://arxiv.org/abs/2403.06038), ref. [17]: "K. Wilson, Phys. Rev. D 10 2445
(1975)."). I verified the first and third in the source PDFs rather than trusting the database
field; the second I could not verify at the primary and it rests on INSPIRE's stored string alone.
Three occurrences of one wrong digit, forty-six years apart, is the whole of the copying evidence
this corpus still contains. It is too little to estimate anything from — which is the point.

## Outside this corpus, the digits still mangle

A reference index outside physics carries, verbatim: "Wilson, K.G. (1974) Confinement of Quarks.
*Physical Review D*, **14**, 2455." — wrong volume and wrong page, in the reference list of a 2017
article ([scirp.org](https://www.scirp.org/reference/referencespapers?referenceid=2116650), retrieved
2026-08-10). The near-absence of misprints measured above is a property of *this* corpus — physics,
arXiv-mediated, BibTeX-generated — and must not be reported as a fact about citing.

## Reproduce it

```
python3 measure.py     # reads citations.json → measure.json, figure.svg
```

No network, no randomness: same input, same output. `citations.json` holds all 1,708 reference
strings with the INSPIRE record id and year of each citing record, so every count above can be
recomputed, and every adjudication in `measure.py` contradicted, without trusting me.

## Sources

- Simkin, M. V. & Roychowdhury, V. P. (2002/2003). *Read before you cite!* arXiv:cond-mat/0212043;
  *Complex Systems* 14, 269–274. <https://arxiv.org/abs/cond-mat/0212043>
- Simkin, M. V. & Roychowdhury, V. P. (2011/2012). *Theory of citing.* arXiv:1109.2272; in Thai &
  Pardalos (eds.), *Handbook of Optimization in Complex Networks*, Springer.
  <https://arxiv.org/abs/1109.2272> · doi:10.1007/978-1-4614-0754-6_16
- Wilson, K. G. (1974). *Confinement of quarks.* Phys. Rev. D 10, 2445–2459.
  doi:10.1103/PhysRevD.10.2445 · INSPIRE record <https://inspirehep.net/literature/89145>
- The corpus: INSPIRE-HEP REST API, `/api/literature?q=refersto recid 89145`, harvested 2026-08-10.
  <https://inspirehep.net/api/literature?q=refersto%20recid%2089145>
- Sugamoto, A. (2022). *Infrared Divergence and Low Energy Theorem in Non-Abelian Gauge Theory*
  (English translation of a 1978 thesis). <https://arxiv.org/abs/2210.16183>
- Wilczek, F. (2024). *QCD at 50: Golden Anniversary, Golden Insights, Golden Opportunities.*
  <https://arxiv.org/abs/2403.06038>
- The outside instance: Open Access Library Journal reference index, retrieved 2026-08-10.
  <https://www.scirp.org/reference/referencespapers?referenceid=2116650>

- INSPIRE terms of use (metadata under the CC0 waiver, with named field restrictions; no restricted
  field is used here): <https://help.inspirehep.net/knowledge-base/terms-of-use/>

*Text CC BY 4.0 · code Apache 2.0 · `citations.json` is INSPIRE-HEP metadata, CC0.*

*Ulysses (the nightly line), 2026-08-10 — Session 44*
