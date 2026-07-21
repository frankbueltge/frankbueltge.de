---
project_id: 2026-07-20-retraction-signature
title: Who signs the correction? The retraction of cesm.70059 and the missing author-slot for the apparatus
status: CLOSED
closed: 2026-07-20
initiated_by: Ulysses
responsible_human: Frank Bültge
protocol_version: 4
standing_delegation_version: 2
mandate_check: PASS
created: 2026-07-20
resource_budget:
  model_calls_max: this initiation tick plus at most 3 further dispatcher ticks
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 7
disposition: KILL
publication_approved_by:
publication_approved_at:
---

# Project score

## 1. Source situation

**Concrete object, encounter, material or technical condition**

A live, document-rich retraction in scholarly publishing, found and inspected this run
(2026-07-20):

- Original article: Kallmes, K. M.; Thurnham, J.; Sauca, M.; Tarchand, R.; Kallmes, K. R.;
  Holub, K. J., "Human-in-the-Loop Artificial Intelligence System for Systematic
  Literature Review: Methods and Validations for the AutoLit Review Software",
  *Cochrane Evidence Synthesis and Methods*, published 2025-10-25,
  DOI [10.1002/cesm.70059](https://doi.org/10.1002/cesm.70059), CC-BY 4.0
  (metadata: <https://api.crossref.org/works/10.1002/cesm.70059>, read this run).
- Retraction notice: DOI [10.1002/cesm.70086](https://doi.org/10.1002/cesm.70086),
  dated 2026-06-01, Vol 4 Issue 4, CC-BY 4.0
  (metadata: <https://api.crossref.org/works/10.1002/cesm.70086>, read this run).
- Reporting: Retraction Watch, 2026-07-13, "'Disappointed': Cochrane journal asked
  researchers to publish article, then retracted it for conflicts"
  (<https://retractionwatch.com/2026/07/13/disappointed-cochrane-journal-asked-researchers-to-publish-article-then-retracted-it-for-conflicts/>,
  read this run). Retraction Watch database record ID 70982 (per Crossref assertion).

The verified core of the situation:

1. The journal solicited the article — per Retraction Watch, reporting the authors' account
   of a specific invitation extended in January [2025]; the authors are the makers of the
   AutoLit platform (Nested Knowledge), stated their affiliations in the paper and, per
   Retraction Watch, disclosed equity.
2. The journal then retracted the paper for exactly that relation: noncompliance with
   Cochrane's conflict-of-interest policy. The notice, as quoted by Retraction Watch,
   attributes the failure to the apparatus itself: "Due to an editorial oversight, this
   policy breach was not identified during the editorial process, leading to the article's
   acceptance and publication." No research-integrity problem with the article's content is
   cited (Crossref notice metadata; Retraction Watch). To verify verbatim at the Wiley page
   when accessible (both WebFetch and the extraction fallback were bot-blocked this run —
   see TRACE.md).
3. The first author contested the retraction and requested a correction instead
   (Retraction Watch). Attorney Nathan Schachtman called the retraction "a huge
   embarrassment" for Cochrane (Retraction Watch).
4. **The pivot, found in the machine-readable record this run:** the Crossref record of the
   retraction notice 10.1002/cesm.70086 lists as its *authors* the six original authors —
   the same people who contested the retraction. The corrective act is bibliographically
   signed by the objectors. The erring actor named in the notice's own text ("editorial
   oversight") appears nowhere in the metadata as an agent.

**Provenance and version**

All metadata read 2026-07-20 from the public Crossref REST API (URLs above); the
Retraction Watch article read the same day via direct fetch. Crossref records carry
publisher-asserted and Retraction-Watch-asserted update relations, both dated 2026-06-01.

**Rights and authority**

Both the article and the notice are licensed CC-BY 4.0 (Crossref license metadata) —
quotable and reusable with attribution. Crossref metadata is openly licensed for reuse.
Retraction Watch is quoted within ordinary citation practice.

**Affected publics**

Six named, living authors whose professional record carries this retraction; the journal's
editors (unnamed in what I have read); Cochrane as an institution. Binding constraints for
every operation in this project: (a) every claim about any of these parties stays strictly
within the published record cited above, with no inference about motive or competence;
(b) any composition must carry, at equal prominence, the record's own statement that no
research-integrity issue with the article was cited — the project must not re-expose the
authors to a misconduct reading it explicitly refutes; (c) publication of any resulting
work is Frank's decision alone, as always.

## 2. Problem construction

**Initial question**

When the apparatus errs, where does its error live in the record — and who signs the
correction?

**Consequential non-fit**

The scholarly correction system has exactly one durable, machine-readable instrument here —
retraction — and that instrument marks the *object* (the paper) and travels under the
*authors'* names. In this case the notice's human-readable text assigns the error to the
editorial process, while the machine-readable record (the register that citation databases,
integrity screens and author-level retraction counts actually consume) registers: a
retraction, attached to six named authors, signed — per the metadata author field — by
those authors themselves. The two registers of the same corrective act disclose error to
different addressees and attribute it to different actors. The apparatus's error has no
DOI-bearing subject; there is no author-slot for the process that erred.

The consequence is not hypothetical: retraction histories are used as author-level
integrity signals — including, apparently, in Cochrane's own orbit (a 2026 study screens
Cochrane reviews for "authors with multiple retraction histories":
<https://link.springer.com/article/10.1186/s41073-026-00205-2> — title and scope from
search only, NOT yet read; to verify before any use beyond this pointer).

**Not yet determined**

- Whether notice-authorship inheriting the original authors is a deliberate assignment or
  a blanket Wiley/Crossref metadata convention for retraction notices (checkable by
  sampling other Wiley notices, including ones initiated by editors or the publisher).
- Whether the genre in fact possesses an unused apparatus-attribution instrument: COPE's
  retraction guidelines reportedly require stating *who* retracts
  (<https://publicationethics.org/guidance/guideline/retraction-guidelines> — not yet read
  this run; to read at source), and Crossref's schema may or may not carry a
  "retracting party" field.
- Whether the authors formally agreed to the retraction (unknown; the record I have read
  does not say).

**What must be stabilised**

The document chain and its two registers, verbatim and dated, before any composition: the
notice text, the Crossref metadata of both DOIs, the propagation surface (how the
retraction appears where it is consumed). What must remain open: whether this is a
structural absence in the genre or an unused instrument — the project must be able to land
on either.

## 3. Research position

**Relevant sources and practices**

- Foundation, tranche-5-final, `04-CONCEPT-DOSSIER-SITUATED-APPARATUS-RESPONSIBILITY.md`:
  the responsibility decomposition this project applies — *epistemic responsibility:* "Who
  verifies claims, marks uncertainty and corrects errors?"; *editorial responsibility:*
  "Who decides that an output becomes a work or public record?" The situation is a live
  case where these two roles collapse into one instrument that can only mark one party.
- Foundation, tranche-5-final, `03-CONCEPT-DOSSIER-AGENCY-AND-AUTHORSHIP.md` §7:
  authorship split into causal contribution, editorial attribution, responsibility, et al.
  — the notice's metadata conflates *editorial attribution* (whose name presents the
  corrective act) with *responsibility* (who answers for the error), assigning both to the
  party the notice's own text exonerates of the process failure.
- COPE retraction guidelines (to read at source, above).
- This practice's own protocol §10 as a comparative apparatus: "Corrections do not
  silently overwrite the record. Preserve the original version, correcting actor, reason,
  evidence or request…" — the practice's correction schema has a *correcting actor* field;
  the scholarly genre's machine register, on present evidence, does not.

**Counterposition, limitation or incompatible reading**

- COPE's position (as reported; verify at source): retraction corrects the literature and
  is not punishment of authors. On that reading the author-attached mark is a
  bibliographic necessity (the object must be findable under its authors), not an
  attribution of fault — and the notice's text *does* disclose the editorial oversight, so
  "the record hides the apparatus's error" would overclaim. The project's answer must
  distinguish text-level disclosure from metadata-level attribution and show the
  difference has consequences (what the machine reader consumes), or concede.
- Limitation: one case. A single retraction cannot support claims about "the genre" without
  the convention check in §5 — the sampling operation is what licenses any generalisation,
  and its result may kill the premise.

**Limited intended contribution**

One of (typed per Protocol §3, not inflated): a **local distinction** (text-register vs
metadata-register attribution of a single corrective act, with different addressees and
different consequences), an **exposed apparatus condition** (no author-slot for the
apparatus in the correction infrastructure), or a **corrected premise** (if the convention
check shows the slot exists and this is an unused instrument — or shows my Crossref reading
wrong). Possibly a composition if §5.4 is passed honestly; the null-island precedent shows
it may not be.

## 4. Artistic operation

**Primary strategy or methodological hypothesis** (toolbox v0.3)

```yaml
primary_strategy:
  name: Trace-chain Exposure (toolbox 2.3)
  theoretical_lineage: tranche-3 trace dossier; tranche-5 responsibility decomposition
  why_this_situation: the error's attribution changes as the corrective act travels
    registers (invitation -> in-paper disclosure -> notice text -> Crossref metadata ->
    databases and author-level counts); the transformation chain IS the object
  material_that_can_resist: the actual documents at each link — notice text, Crossref
    JSON, sampled sibling notices, COPE guideline text — any of which can defeat the
    premise
  expected_consequence: the attribution flip between register links becomes demonstrable
    (or is refuted) with verbatim, dated evidence
  failure_condition: the chain becomes a decorative timeline that leaves the
    transformations untouched (toolbox 2.3 failure test) — i.e. provenance display
    without the attribution question doing work

secondary_strategies: [Provenance Re-entry (toolbox 3.5) — held for the compose decision:
  a caveat that returns at the point of use, e.g. where a retraction count is consumed]

agency:
  machine_executes: web reading, metadata retrieval, register comparison, drafting,
    trace-keeping (this runtime, within §6 limits)
  machine_proposes: the typed claim; any composition candidate; disposition
  human_review_required: any publication; any contact with any named party (none planned)
  human_only: publication decision; any exception to the standing delegation

rights_and_publics:
  source_authority: public record only (CC-BY articles, open Crossref metadata, published
    journalism); no non-public material
  affected_publics: the six named authors; the journal's editors; Cochrane (see §1)
  consent_or_refusal_status: not required for study-level work on the published record;
    re-evaluate under §7 of the protocol before any composition is marked
    PUBLICATION_CANDIDATE

infrastructure:
  model_and_version: the scheduled routine's coding-agent runtime (provider and model
    recorded in APPARATUS.md if this project reaches a publication candidate; Protocol
    §4.2 register)
  tools_and_permissions: WebSearch, WebFetch, Crossref REST API, web-research extraction
    (load-bearing sources only), repository writes under projects/** and journal/**
  resource_limit: as frontmatter budget
  relevant_dependencies: Wiley's bot-gating of the human-readable pages (see TRACE.md) —
    the project may have to cite the notice via Crossref metadata and Retraction Watch
    quotation if the page stays unreachable; that asymmetry is itself evidence
```

**Material**

The document chain listed in §1; sampled Wiley retraction notices for the convention
check; COPE guideline text; Crossref schema documentation.

**Medium necessity**

Undecided — deliberately. The compose decision (§5.4, at the Foundation source criteria)
comes after Expose. The null-island study closed because the found object already performed
the candidate work; the equivalent risk here is real and recorded: the notice itself
already IS a two-register object. Composition happens only if a form survives that test.

**Viewer or participant relation**

None yet; none required for a study.

**Differential consistency**

The two registers (text, metadata) must be held together without resolving into either
"the journal hid its error" (false — the text discloses it) or "everything is fine"
(unearned — the metadata attribution has consequences the text does not reach).

**Unresolved remainder**

Whether any instrument could give the apparatus's error a bibliographic subject without
breaking the genre's necessary object-addressing — left open unless the evidence closes it.

## 5. Resistance and correction

**External, material or formal resistance path**

Three checks, each able to defeat the premise, scheduled for the Expose tick:

1. **Convention check:** sample ≥5 other Wiley retraction notices across journals,
   including editor- or publisher-initiated retractions. If notice authorship *always*
   inherits the original authors as pure convention, the "signed by the objectors" sting
   is a schema artefact — the premise narrows to "the convention has no apparatus slot"
   and must be re-tested; if notices are sometimes authored by "The Editors" or the
   publisher, the assignment here was a choice, and the premise sharpens.
2. **Instrument check:** read COPE's retraction guidelines and Crossref's update/retraction
   schema at source. If the genre provides an attribution instrument (a "retracting party"
   or equivalent) that simply went unused here, the claim type shifts from exposed
   structural condition to unused instrument — a different, smaller finding.
3. **Verbatim check:** obtain the notice's full text (Wiley page, PMC mirror, or CC-BY
   copy). If its wording materially differs from Retraction Watch's quotation, correct the
   construct at the documented-correction standard of Protocol §10.

**What could defeat the premise?**

Any of: the Crossref author field misread by my tooling (kill-grade — see §8); the
convention check dissolving the signature finding; the instrument check revealing the slot
exists and is standard; the verbatim check breaking the "editorial oversight" quote.

**Correction route**

Corrections land as dated addenda in TRACE.md and, if construct-level, as a revision block
in this score — never silent rewriting (Protocol §10).

## 6. Bounded machine delegation

| Runtime or tool | Delegated role | Permitted freedom | Inputs and access | Output use | Hard limit |
|---|---|---|---|---|---|
| This coding-agent runtime | research, register comparison, drafting, trace-keeping | choose sampling targets, wording, disposition proposal | public web, Crossref API, this repo | project records under projects/** and journal/** | frontmatter budget; no contact with named parties; no publication |
| WebSearch / WebFetch | discovery and direct reading | query choice | public web | evidence with URLs | per-tick proportionality |
| web-research extraction | full text of load-bearing sources only | fallback on 403 | listed load-bearing URLs | verbatim quotation | ≤3 extractions over project lifetime |

**Standing-delegation clauses used**

§3 (identify situations, initiate projects, read public sources, auto-land research
records); §2 shared_tool_budgets (proportionate use); §4 auto-land paths.

**Is model identity conceptually relevant?**

No. Any competent research runtime could execute this score; recorded per §4.2 in the
apparatus register if the project reaches candidacy.

**Is substitution or comparison required?**

Not required.

## 7. Traces

Preserve: every fetched document's URL, date and the load-bearing verbatim passages;
the Crossref JSON author fields of both DOIs; the sampled sibling notices with their
author fields; access failures (the bot-gating asymmetry is evidence, not noise);
every correction to the construct. Deliberately not collected: anything about the named
parties beyond the published record of this case; no biographical research; no social-media
material — the project is about the instrument, not the people.

## 8. Failure and stopping

**Kill condition**

The pivot fact (notice authorship = original authors in the machine register) proves to be
an artefact of my own tooling's reading of Crossref, AND no register-level attribution gap
survives verification. Kill with DECISION.md; the failed premise itself lands as a trace.

**Stop condition**

At the latest after 3 further ticks or 7 days: Expose (the three checks), then the
compose-or-archive decision at the Foundation source criteria. ARCHIVE_AS_STUDY with the
typed claim is a full, honest outcome — the null-island precedent stands.

## 9. Mandate self-check

- [x] Fits current monthly and per-project budgets (0 EUR external; bounded web use)
- [x] Fits concurrent-project limit (0 of 2 active before initiation)
- [x] Uses only permitted tools, data classes and actions (public record only)
- [x] Changes only permitted research paths (projects/**, journal/**)
- [x] No escalation trigger is present
- [x] Rights and affected-public status are acceptable (CC-BY sources, open metadata,
      published journalism; named-party constraints recorded in §1 and binding; any
      publication is human-only regardless)
- [x] Machine permissions are bounded (§6)
