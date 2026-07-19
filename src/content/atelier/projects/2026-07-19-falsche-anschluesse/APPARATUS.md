# Apparatus record

## Project identity

- Project ID: 2026-07-19-falsche-anschluesse
- Public title: Falsche Anschlüsse — verifying six unsourced quotes in the founder's 2006 thesis
- Version: tick 2 (second verification pass on the two open verdicts; tick 1 =
  initiation + first pass)
- Protocol version: 4

## Responsible author and publisher

- Name: Frank Bültge
- Roles in this project: responsible human (Protocol v4 §1); provider of the source
  material (the offer of 2026-07-19, including the verbatim transcriptions of the six
  quotes); author of the 2006 thesis under examination — treated in this project as a
  named third party at his own request; sole publication authority.

## Ulysses / Atelier

Ulysses is the situated research practice of this repository; this project is ordinary
autonomous work under Standing Delegation v1. The persona signs the records; it is not
identical with the model runtime listed below. In this project the practice functions
as: acceptor of the offer, author of the score, verification researcher, keeper of the
trace record.

## Machine contributions

Voice rule (amendment D-ULY-08, 2026-07-19): in the practice's own voice tools stay
generic; this register is the place of full disclosure, so provider, model and version
are recorded here accurately.

| Runtime ID | Provider and model/version | Date | Delegated role | Freedom | Outputs used | Outputs rejected | Known limits |
|---|---|---|---|---|---|---|---|
| tick-4-v4 | Anthropic, Claude (model id: claude-fable-5), via the scheduled dispatcher routine | 2026-07-19 | orientation, offer acceptance, score authoring, verification research (searches, fetches, PDF text extraction), trace and record writing | search strategy, verdict typing, framing, within SCORE §6 | SCORE.md, TRACE.md (T-001–T-008), this record, REQUESTS.md status update, journal and pulse entries | none consequential (failed searches are documented as negative evidence, not rejected outputs) | training-data cutoff; no access to the 2006 print thesis; web corpus reach (two 403s recorded); verdicts are only as strong as the disclosed trails |
| tick-5-v4 | Anthropic, Claude (model id: claude-fable-5), via a manually started dispatcher run | 2026-07-19 | second verification pass on the open verdicts #3 and #6 (full-text download and local search of AM3; widened web searches; print-corpus access attempts), trace and record writing | search strategy, budget refusals, framing, within SCORE §6 | TRACE.md (T-009–T-011), this record's update, REQUESTS.md addendum, journal and pulse entries | none consequential | same as above; additionally: no lending account (German edition unreachable at full-text depth), Google Books anonymous quota exhausted, HathiTrust JS-walled — recorded in T-011 |

Auxiliary tooling this tick (local, deterministic): harness web-search tool; direct
HTTP fetch; poppler `pdftotext` for text-bearing PDFs. Shared web-research full-text
extraction: not used (T-008).

## Human contributors

| Name | Roles | Consent to public credit | Notes |
|---|---|---|---|
| Frank Bültge | offer author; material provider; responsible human | yes (repository owner) | offered the material explicitly for this use, 2026-07-19 |

## Sources and datasets

| Reference | Contribution to project | Licence, right or authority | Relevant caveat |
|---|---|---|---|
| REQUESTS.md offer (commit `216de29`) | the six quote transcriptions; thesis metadata | responsible human's own text | transcription fidelity to the 2006 print not independently checked |
| Carnap, "Überwindung der Metaphysik…" (1932), CMU critical edition PDF + gleichsatz.de mirror | verdict 1 | published scholarly edition; brief quotation for verification | Erkenntnis page number unverified (textless scan, T-008) |
| fabula.org CFP "La guérison"; France Culture post; Dictionnaire Le Clézio (editionspassages.fr) | verdict 2 (Le Clézio attribution) | public pages; brief quotation | editionspassages reached at search level only (403) |
| Hörz PDF (philmath.org) quoting Heisenberg, *Der Teil und das Ganze*; buboquote.com | verdict 4 | public pages; brief quotation | memoir wording verified via quoting secondary, not the memoir volume itself |
| Hoye lecture handout (hoye.de) citing Heisenberg, *Physik und Philosophie*, Hirzel 4th ed. 1984, p. 41; skynetblog.de | verdict 5 | public academic handout; brief quotation | primary volume not opened; pagination edition-dependent |
| Negative search records (T-004, T-007, T-008) | verdicts 3 and 6 | n/a | indexed to the searched corpus and date |
| Feyerabend, *Against Method*, 3rd edn, Verso 1993 — archive.org community scan, `_djvu.txt` full text (T-009) | verdict 6 (negative evidence: no corresponding passage) | community-uploaded scan, used for search/verification only; no excerpts stored beyond two short phrases | OCR text; a garbled OCR of the sentence cannot be fully excluded, though both probe words are common and OCR-stable |
| jochengerz.eu (official site, index-level probe, T-010) | verdict 3 (negative evidence) | public site; nothing quoted | index-level only — the site's full page texts were not crawled |
| Walled corpora records (T-011: archive.org lending search-inside, Google Books API 429, HathiTrust 403) | limits of verdicts 3 and 6 | n/a | these corpora remain unprobed, not negative |

## Infrastructure and dependencies

- Repository and commit or release: frankbueltge/irrtum-als-methode; landing
  branches `ulysses/research-2026-07-19` (tick 1) and `ulysses/research-2026-07-19-2`
  (tick 2)
- Tools and libraries: git; poppler-utils (pdftotext); python3 (JSON handling)
- Providers and hosted services: GitHub (repository, auto-land workflow); the
  scheduled routine's model runtime (see machine contributions)
- Publication system: none engaged (no publication candidate)
- Proprietary or changing dependencies: web pages cited may change or vanish; PDFs
  mirrored at third parties
- Reproducibility limits: search results are date- and ranking-dependent; the two
  "not findable" verdicts are explicitly indexed to 2026-07-19

## Resources

- Model calls: 2 dispatcher ticks (of ≤ 4 budgeted)
- Direct service cost: 0 EUR
- Compute and storage: negligible (text records; no binaries committed)
- Human review time: none yet (ordinary autonomous work)
- Environmental or labour considerations where material: not material at this scale

## Human selection and arrangement

Frank selected the six quotes, transcribed them, framed the offer and its verdict
typology, and set the boundary ("my thesis is material here, not authority"). No human
edited this tick's outputs before landing; review happens through the public record.

## Rights and consent

- Third-party material: brief quotations of published sentences, used for verification
  and criticism with citation
- Legal basis or licence: quotation right (criticism/review); repository licence for
  own records
- Personal data: none beyond published authorship facts
- Community or collective data: not_applicable
- Consent or cultural authority: the primarily affected person (the thesis author) is
  the offering responsible human
- Derivative-use permission: not_applicable (no derivatives of third-party works)
- Withdrawal or takedown route: Frank may suspend or terminate the project at any time
  (Protocol v4 §11)
- Unresolved questions: the German intermediary sources for quotes 2 and 4 (open
  research question, not a rights question)

## Public credit line

> Ulysses / Atelier — a situated artistic research practice by Frank Bültge, developed through documented human–machine operations.
