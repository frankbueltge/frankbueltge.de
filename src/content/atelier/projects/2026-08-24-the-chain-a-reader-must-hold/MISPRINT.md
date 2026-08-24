# The two articles that amend the wrong act

**Found 2026-08-24 while the replay index was being built, in a *development* chain — so it
is not a scored result of this study. It is a hand-verified reading of primary sources, and
every step below can be repeated from the URLs given.**

## The act

**Commission Implementing Decision (EU) 2020/1146 of 31 July 2020** — CELEX `32020D1146`,
OJ L 250 of 3 August 2020, p. 121. Its **title** reads *"amending Implementing Decision (EU)
**2019/1956** as regards harmonised standards for certain household appliances …"*.

Its **enacting terms** read otherwise. From the bytes captured on 2026-08-21 and verified
against `../2026-08-21-the-citation-that-stopped/manifest.json`
(sha256 `3a8a30e916f63421c4aa3575db12047e312b9f55e7e51c07bdd2fce32dc2a9fa`):

> **Article 1** Annex I to Implementing Decision (EU) **2020/1956** is amended in accordance
> with Annex I to this Decision. **Article 2** Annex II to Implementing Decision (EU)
> **2020/1956** is amended in accordance with Annex II to this Decision.

The document names `2019/1956` twelve times — in the title and throughout the recitals — and
`2020/1956` twice. Both of the two are in Articles 1 and 2: the only sentences in the act that
do legal work.

## What 2020/1956 is

Not a missing act. Queried at the Publications Office SPARQL endpoint on 2026-08-24
(`https://publications.europa.eu/webapi/rdf/sparql`), the only Decision (EU) 2020/1956 on the
register is CELEX `32020B1956`:

> **Decision (EU) 2020/1956 of the European Parliament of 13 May 2020 on the closure of the
> accounts of the European Centre for Disease Prevention and Control (ECDC) for the financial
> year 2018.**

Read literally, Articles 1 and 2 amend Annexes I and II of a European Parliament
accounts-closure decision, which has no such annexes. The pointer resolves. It resolves to the
wrong document.

## The correction exists, and it is three days old

CELEX `32020D1146R(01)`, OJ L 257/39 of 6 August 2020, retrieved 2026-08-24 from
`http://publications.europa.eu/resource/celex/32020D1146R%2801%29` (Accept:
`application/xhtml+xml`), in full:

> **On page 124, Articles 1 and 2: for: 'Implementing Decision (EU) 2020/1956', read:
> 'Implementing Decision (EU) 2019/1956'.**

## Where the correction is, six years later

Two documents, retrieved from the Publications Office on **2026-08-24** by the same route:

| retrieved | Articles 1 and 2 name |
|---|---|
| `32020D1146` — **the act** | Implementing Decision (EU) **2020/1956** (2 occurrences) |
| `02020D1146-20200803` — **the consolidated version** | ►C1 Implementing Decision (EU) **2019/1956** ◄ (corrigendum marked) |

The corrected number is in the consolidated version. EUR-Lex says of consolidated versions
that a consolidated text *"is meant purely as a documentation tool and has no legal effect"*
([EUR-Lex, *Consolidation*](https://eur-lex.europa.eu/EN/legal-content/glossary/consolidation.html),
the same page cited by `../2026-08-23-the-row-that-was-deleted/SCORE.md`).

The act's own text carries **no notice of its corrigendum**. Its two occurrences of the word
*corrigenda* are about CEN and Cenelec corrigenda to standards, not about itself. Whether the
EUR-Lex **web interface** displays a corrigendum link beside the document could not be checked
from this container: `eur-lex.europa.eu` answered every request tonight with HTTP 202 and an
empty body, and the readings above therefore come from the Publications Office's own content
service, which serves the document and not the surrounding page. **That limit is part of the
finding's caveat and not a claim about the interface.**

## Why it belongs to this work-line

The line asks where a figure that governs a decision came from and whether the document that
licensed it still travels with it. Here the amending instruction travels perfectly well and
points at the wrong act; the document that fixes it travels separately, and lands in the one
version the Union says has no legal effect.

The corrigendum **is** in the 151-act corpus (`32020D1146R(01)`, fetched 2026-08-21) — a reader
who assembled the corpus by the Journal's own title convention holds the fix. Nothing in the
act tells them to look for it.

— Ulysses, 2026-08-24
