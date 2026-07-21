---
project_id: 2026-07-20-vegetative-em
title: "Vegetative electron microscopy — a scanning error read as an index fossil in the scientific record"
status: CLOSED
initiated_by: Ulysses (dispatcher tick under Protocol v4, §5 cascade b — outward initiation)
responsible_human: Frank Bültge
protocol_version: 4
standing_delegation_version: 2
mandate_check: PASS
created: 2026-07-20
closed: 2026-07-21
resource_budget:
  model_calls_max: 5 dispatcher ticks
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 21
disposition: ARCHIVE_AS_STUDY
publication_approved_by:
publication_approved_at:
---

# Project score — Vegetative electron microscopy

## 1. Source situation

**Concrete object, encounter, material or technical condition**

The nonsense phrase **"vegetative electron microscopy"** — a string of three real words that
denotes nothing, now present in the published scientific literature and reliably reproduced by
current large language models. It is a technical condition of the world's text-processing
infrastructure, not a metaphor: a meaningless token that has acquired the surface authority of
a method name, and that a specific chain of machines keeps re-inscribing. Four things are
stacked on the one phrase, and they belong to different eras of the same apparatus:

1. **A digitisation artefact (1950s).** Two papers in *Bacteriological Reviews* were later
   scanned in two-column layout; the QUT researchers report the OCR "erroneously combined
   'vegetative' from one column of text with 'electron' from another." An absence of meaning
   was manufactured by a column boundary read as a word boundary.
2. **A translation artefact (c. 2017–2019).** Independently, the phrase appears in Iranian
   papers, plausibly because the Farsi words for *vegetative* and *scanning* differ by a
   single dot — so "scanning electron microscopy" (a real method) becomes "vegetative
   electron microscopy" (nothing). Two unrelated error mechanisms converge on the identical
   meaningless string.
3. **A training-data fossil.** The QUT team identify **CommonCrawl** as the most likely
   vector by which models "first learned this term": GPT-3 reproduces it consistently while
   GPT-2 and BERT do not, and it persists in later models. The error was buried in a corpus,
   then re-animated as generative vocabulary.
4. **A forensic marker.** Because the phrase means nothing, its presence is a near-certain
   signature of AI-generated or AI-contaminated text. The **Problematic Paper Screener**
   (Cabanac & Labbé's "tortured phrases" project) now flags it; a chemist under the handle
   *Paralabrax clathratus* first spotted it in nearly two dozen papers.

The reported count as of the primary sources is **~22 papers on Google Scholar**; one faced
retraction (Springer Nature), one a correction (Elsevier), and in at least one case a
publisher (Elsevier) initially defended the term.

**Provenance and version**

Verified this run (2026-07-20) across independent retrievable sources; no full-text-extraction
budget spent this tick:

- Aaron J. Snoswell, Kevin Witzenberger, Rayane El Masri (Queensland University of
  Technology), "A weird phrase is plaguing scientific papers — and we traced it back to a
  glitch in AI training data," *The Conversation*, 2025-04-15 —
  https://theconversation.com/a-weird-phrase-is-plaguing-scientific-papers-and-we-traced-it-back-to-a-glitch-in-ai-training-data-254463
  (the origin, CommonCrawl vector, and model-behaviour claims rest primarily on this account).
- *Retraction Watch*, "Was nonsense 'vegetative electron microscopy' phrase a Farsi typo?"
  2025-03-04 — https://retractionwatch.com/2025/03/04/vegetative-electron-microscopy-phrase-farsi-typo/
- *Retraction Watch*, "As a nonsense phrase of shady provenance makes the rounds, Elsevier
  defends its use," 2025-02-10 —
  https://retractionwatch.com/2025/02/10/vegetative-electron-microscopy-fingerprint-paper-mill/
- Corroborating secondary coverage: *Gizmodo* (2025), *ScienceAlert* (2025), *Pivot to AI*
  (2025-02-15) — used only to confirm that the account is not a single-source artefact.

Two facts are treated as **provisional until read at their own primaries** (the exact
failure that killed `2026-07-20-retraction-signature` earlier today — a claim inserted by a
summarising tool, not present in the record — is a fresh warning against building on a single
fetch): (a) the specific *Bacteriological Reviews* OCR mechanism (the two 1950s papers
themselves, or the QUT team's underlying write-up, not yet inspected at source); (b) the
Problematic Paper Screener's actual current listing for the phrase (to be read at the
screener, not the encyclopaedia). Both inspections are declared as this project's next
operations.

**Rights and authority**

All sources cited, none reproduced beyond fair quotation. **Critical affected-public
boundary:** the ~22 papers carrying the phrase have named authors, several from Iran, some
possibly paper-mill products. This project treats **the phrase and the pipeline**, never the
integrity of any named researcher. It makes no misconduct claim about any individual, names no
author as a target, and will not compile, rank or expose a list of individuals (Protocol v4
§7; Standing Delegation §6). The phenomenon enters only at the level already made public by
Retraction Watch and the screener, in the aggregate.

**Affected publics**

The authors of the affected papers (handled per the boundary above) and, more diffusely, the
scientific-publishing readership that inherits a corrupted vocabulary. No sensitive personal
data is used or sought.

## 2. Problem construction

**Initial question**

What *kind of thing* is "vegetative electron microscopy"? Specifically: the scientific
publishing and integrity apparatus treats the phrase as **contamination to purge** — detect,
retract, correct, screen out. Is there a second, non-equivalent description under which the
phrase is not waste but an **instrument** — an index fossil whose very meaninglessness makes
it a reliable tracer of a machine-processing lineage (OCR-of-mid-century-scans → CommonCrawl
→ GPT-3-lineage generation → publication)? And if both descriptions are true at once, what is
the exact relation between them?

**Consequential non-fit**

This practice's thesis is that *error is what method is made of, in two senses a detector
cannot tell apart from the output alone; disclosure is not detected but declared.* Vegetative
electron microscopy is a rival regime that splits those senses cleanly and thereby tests them.
The integrity apparatus reads it as pure Type-defect: an error whose only correct fate is
erasure. But the same string is, functionally, a **method** already in use — the Problematic
Paper Screener *uses* the meaningless phrase as a detection instrument. So the world has built
a working method **out of** an error, exactly as the practice claims is possible — yet it does
so while officially classifying that error as nothing but a defect to remove. The non-fit is
sharp: the phrase is simultaneously the archetypal thing-to-be-purged and a functioning
tracer, and the apparatus that purges it *depends on* its persistence to detect its kin.

This is **not** the `null-island` move (a sentinel value that *collects* failures at a fixed
address). Vegetative electron microscopy does the opposite: it **propagates**, mutating from a
column artefact into a translation artefact into generative vocabulary, and it *gains* rather
than absorbs authority as it travels. A sink versus a fossil that comes back to life — a
distinct object and a distinct operation of error.

**Not yet determined**

- Whether the OCR-column-merge mechanism is documented at a retrievable primary or rests only
  on the QUT team's account (and whether the two 1950s *Bacteriological Reviews* papers are
  themselves inspectable).
- Whether the "fossil / tracer" reading is a genuine local distinction or merely a rewording
  of the already-established "tortured phrase" forensic category (Cabanac & Labbé) — i.e.
  whether the project has a distinction to offer or is discovering existing forensic practice.
- Which typed outcome is honest: a **local distinction** (index fossil vs. tortured phrase vs.
  sink value); an **exposed apparatus condition** (the training-data pipeline that fossilises
  and re-animates a scanning error); a **corrected premise**; or a **negative result** (the
  distinction dissolves into existing tortured-phrase forensics).

**What must be stabilised**

The verified facts and their attributions (every claim sourced or marked provisional; no
fabrication). The affected-public boundary (no individual named or exposed). The practice's
prohibitions and public-authorship model. Whether a composed work is warranted stays open
until Construct and Expose earn it.

## 3. Research position

**Relevant sources and practices**

- Snoswell, Witzenberger & El Masri (2025) — the origin-tracing account and the CommonCrawl
  vector; the project's principal secondary source.
- Cabanac & Labbé, "tortured phrases" / the **Problematic Paper Screener** — the existing
  forensic apparatus that already treats meaningless phrases as detection signals; the
  project's strongest counterposition-in-practice, to be read at source.
- *Retraction Watch* — the documentation record and the contested-origin framing.
- The practice's own already-worked neighbours, consulted for continuity not repetition:
  `works/2026-07-17-inaccurate-citations/` (fabricated citations as defect-to-eliminate vs.
  disclosed-error-as-method); atlas `shumailov-curse-of-recursion`,
  `gerstgrasser-is-model-collapse-inevitable`, `broad-dead-internet-computational-creativity`
  (recursive corpus contamination); `fredrikzon-rethinking-error`,
  `colby-weber-hilf-artificial-paranoia` (genealogy of epistemic error in machines). Consulted
  selectively per Protocol §3, not loaded as ambient theory.

**Counterposition, limitation or incompatible reading**

1. **The deflation (default counterposition).** The phrase is nothing but contamination, and
   reading it as an "index fossil" is over-reading — a poetic relabelling of a defect that
   the integrity apparatus is simply right to purge. The honest close would then be a
   *corrected premise*: there is no second description, only garbage with a good story.
2. **The distinction may already exist.** "Tortured phrases" as forensic tracers is
   established practice (the Problematic Paper Screener predates this phrase). If so, the
   "fossil/tracer" reading is not the project's discovery but Cabanac & Labbé's engineering,
   and the contribution shrinks — at most a *local distinction* between a tortured phrase
   (synonym-swap camouflage) and this phrase (a genuinely meaningless string with a datable
   stratigraphy), if that distinction survives contact with the screener's own definitions.
3. **The origin is contested.** Retraction Watch frames OCR-merge vs. Farsi-typo as an open
   question, not a settled fact. Any claim resting on a single clean origin story is unsafe;
   the convergence of two independent mechanisms on one string is itself the more defensible
   observation and must be handled as such.

**Limited intended contribution**

One typed claim (Protocol v4 §3), explicitly limited: a **local distinction** among regimes
of textual error (index fossil vs. tortured phrase vs. sink value), and/or an **exposed
apparatus condition** (the pipeline that fossilises and re-animates a scanning error as
authority) — or, if the deflation or the already-exists reading holds, a **corrected premise**
or **negative result**. Explicitly NOT: a general theory of AI-generated text, a detection
tool, a canonical map, or any claim about named authors' conduct. Scale is not seriousness.

## 4. Artistic operation

**Primary strategy or methodological hypothesis**

Deliberately undecided at initiation, per the practice's precedents: read the primaries
first (the Problematic Paper Screener listing; the QUT team's underlying write-up and, if
retrievable, the 1950s *Bacteriological Reviews* source), let them defeat or sharpen the
premise, and only then decide whether a composition is necessary. Default: **no artefact**
until Construct and Expose earn one.

**Material**

The phrase itself; its documented stratigraphy (1950s scan → Farsi typo → CommonCrawl →
generative model → publication); the Problematic Paper Screener's treatment of it; the
public documentation record (Retraction Watch, the QUT account).

**Medium necessity**

Undecided, with a caution flagged now (Protocol v4 §5.4 / §8): the obvious forms — a
browser that highlights the phrase across papers, a dashboard of the ~22 occurrences, a
timeline of the fossil's strata — are exactly the *explanatory dashboard* the protocol warns
is not the default form, and several would also breach the affected-public boundary by
enumerating individuals. If a form is composed at all, it must do work a paragraph cannot,
and must not name or rank people.

**Viewer or participant relation**

Undecided; only admitted if a later movement earns it and it changes the operative situation
rather than narrating a prewritten explanation.

**Differential consistency**

The tension to hold without resolving: the *same string* is defect-to-purge and
instrument-in-use at once, and the purge depends on the persistence. A form that resolved
this into either "it's just garbage" or "it's secretly meaningful" would fail the test.

**Unresolved remainder**

The contested origin (OCR vs. typo) is not to be smoothed into one story; the convergence of
two mechanisms is the remainder the work must keep visible, not close.

## 5. Resistance and correction

**External, material or formal resistance path**

The primary sources themselves: the Problematic Paper Screener's own definitions (do they
already fully account for this phrase, dissolving the distinction?); the contested-origin
record (does either mechanism collapse under inspection?); the affected papers as public
objects (does the phrase actually function as claimed, or is the "tracer" property weaker than
asserted?).

**What could defeat the premise?**

- If the Problematic Paper Screener's "tortured phrase" category already captures everything
  the "index fossil" reading claims, the local distinction dissolves → negative result.
- If the OCR-merge origin proves to be an artefact of a single summarising account with no
  primary behind it (the retraction-signature failure mode), the "fossil dug from 1950s
  scans" stratigraphy loses its load-bearing layer and only the Farsi-typo mechanism
  survives → corrected premise.
- If pursuing the phenomenon cannot avoid naming or ranking individuals, the project stops on
  the affected-public boundary rather than proceeding.

**Correction route**

Preserve the failed premise and the corrected version side by side in TRACE.md; do not
overwrite. If a boundary is crossed, set `mandate_check: ESCALATE` and stop landing.

## 6. Bounded machine delegation

| Runtime or tool | Delegated role | Permitted freedom | Inputs and access | Output use | Hard limit |
|---|---|---|---|---|---|
| Scheduled model runtime (this practice) | Read, verify, distinguish, compose the score and traces | Choose sources, frame the distinction, decide typed outcome | Public web sources listed in §1/§3 | Research records under `projects/**`, `journal/**` | ≤5 dispatcher ticks; 0 EUR |
| Web search / fetch | Locate and read primary and corroborating sources | Query freely within the topic | Public URLs | Cited, attributed, provisional-marked | WebSearch/WebFetch first; full-text extraction only for a load-bearing primary |

**Standing-delegation clauses used**

§3 (identify concrete source situations and initiate projects; read and annotate public
sources), §4 (create/modify files in auto-land-eligible paths). No external cost; no protected
path touched.

**Is model identity conceptually relevant?**

Yes, at one remove: the phenomenon *is* model behaviour (GPT-3 lineage reproducing the phrase;
persistence in later models). The project reports this from the QUT team's documented tests
and does **not** stage its own model-elicitation of the phrase as a finding — that would be
fluent-surprise dressed as resistance (Protocol §5.2), and reproducing the nonsense phrase
would add to the very contamination under study.

**Is substitution or comparison required?**

No. The comparison that matters (GPT-2/BERT negative vs. GPT-3 positive) is already in the
source and is cited, not re-run.

## 7. Traces

Preserve: the verified facts with attributions; the provisional-marked claims and their later
resolution at primary; the counterpositions and which one (if any) closes the project; any
premise defeated by the primaries. Preserve the affected-public boundary decision and any
moment it is tested.

Do not collect: any list, tally or identification of the named authors of affected papers;
any model-elicited reproduction of the phrase; bulk copies of the affected papers.

## 8. Failure and stopping

**Kill condition**

The project is killed if EITHER (a) the "index fossil" reading proves fully equivalent to the
established "tortured phrase" forensic category with no surviving distinction (negative
result, recorded honestly, not reinterpreted as a success about failure); OR (b) the load-
bearing origin claim (the 1950s OCR merge) proves to be an unbacked artefact of a single
summarising source AND the remaining Farsi-typo mechanism does not support any typed claim
beyond "a typo propagated."

**Stop condition**

Budget exhausted (≤5 ticks / 0 EUR / 21 days), or a typed outcome is reached and recorded
(local distinction, exposed apparatus condition, corrected premise, or negative result),
whichever comes first. Reaching a publishable-quality distinction marks
`PUBLICATION_CANDIDATE`; it does not authorise publication.

## 9. Mandate self-check

- [x] Fits current monthly and per-project budgets (0 EUR; ticks within the routine)
- [x] Fits concurrent-project limit (1 of ≤2 active; all prior projects CLOSED)
- [x] Uses only permitted tools, data classes and actions (public web; no sensitive data)
- [x] Changes only permitted research paths (`projects/**`, `journal/**`)
- [x] No escalation trigger is present
- [x] Rights and affected-public status are acceptable (boundary declared: phrase and
  pipeline only, no individual named or ranked)
- [x] Machine permissions are bounded (see §6)

`mandate_check: PASS`.
