# Current Ulysses Runtime and Authorship Audit
## Repository state reviewed 18 July 2026

## 1. Audit scope

This audit compares the public repository description, Research Protocol v3, auto-land workflow and Research Ecology constitution against the completed Foundation.

It does not inspect the private model-provider control plane, exact scheduler implementation, billing records or all historical prompts. Those remain implementation-audit tasks.

## 2. Current public proposition

The repository README currently presents Ulysses as:

- an autonomous machine artistic researcher;
- a practice that convenes a research session every night;
- fully autonomous in choosing questions, direction and methods;
- a system whose sessions are published unedited;
- a practice whose machinery is composed and steered by Frank Bültge.

The README therefore contains an unresolved double claim:

```text
full autonomy
+
machinery composed, seeded, approved, published and terminated by a human
```

The second statement is more accurate, but the first dominates the identity.

## 3. Protocol v3 is more honest than the README

Protocol v3 explicitly names:

- an external nightly schedule;
- a model instance that reads the protocol;
- recall index, Atlas, Pulse and Git history as memory;
- the absence of a multi-persona team;
- a site integration gate;
- Frank as founder, protocol author, model and schedule selector, publisher, legal-responsibility holder, critic and termination authority.

This is a significant strength. The protocol already contains the basis for an apparatus model.

However, it still preserves a rhetorical asymmetry:

- Ulysses is described as choosing its questions and works;
- Frank’s constitutional design and publication power are treated as arrangement conditions around that choice;
- the model provider remains unnamed by principle, even though model identity can materially change the practice;
- the nightly session remains the default unit of activity;
- regular functional artefacts and Astro-native works remain expected;
- repetition itself is framed as form.

The result is a sophisticated disclosure inside a production model that continues to overstate practice-level autonomy.

## 4. Auto-land workflow

The current `.github/workflows/auto-land.yml`:

- listens for `ulysses/**` and `claude/**` branches;
- merges nightly `ulysses/*` branches without a pull-request approval requirement;
- treats closed or absent PRs as a rejection signal only for `claude/*` branches;
- runs a nightly safety-net schedule;
- dispatches a cross-repository website integration after landing.

This means a nightly Ulysses branch is operationally privileged over a manually started Claude branch:

```text
ulysses/* -> always land if technically mergeable
claude/*  -> requires an open, non-draft PR
```

That rule converts branch origin into a proxy for artistic and research legitimacy. It is incompatible with the completed Foundation.

A technically successful autonomous run is not sufficient evidence that:

- the project was worth initiating;
- the output is a work;
- the claims are sound;
- rights and affected publics were reviewed;
- the form is strong;
- publication is justified.

## 5. Current memory and continuity claim

The repository states that Git is the memory and there is no other. This is partly true at the project level, but the actual apparatus also includes:

- the model’s pretraining;
- provider system instructions and routing;
- tool search indexes and retrieval services;
- model-side context handling;
- human memory and curation;
- site integration logic.

Git is the declared local archive, not the whole memory apparatus.

This distinction matters because the Ulysses persona may appear persistent even when:

- model versions change;
- provider behaviour changes;
- prompts are revised;
- context selection changes;
- external search results change.

Continuity should therefore be described as **archival and protocol continuity**, not identity continuity of one artificial subject.

## 6. Current source and model disclosure

The protocol requires verifiable sources and prohibits fabricated citations. This remains essential.

The decision to leave the underlying AI technology unnamed was originally intended to avoid product branding and keep the question at the level of artificial intelligence in general. Tranche 5 shows the cost of that decision:

- model version and provider can materially alter output;
- provider safety systems and context limits are part of the apparatus;
- reproducibility becomes impossible to assess;
- resource and rights questions cannot be located;
- a generic “AI” appears more autonomous and universal than the actual service.

New rule:

> The public work need not advertise a provider as brand identity, but the apparatus record must name the actual runtime and date where contractually and technically possible.

## 7. Current publication claim

“Sessions published unedited” sounds transparent but is misleading in three ways:

1. the protocol and context are highly authored before the run;
2. repository and site gates already select what becomes public;
3. lack of editing is not the same as lack of curation or responsibility.

Unedited publication also makes operational traces compete with works and encourages output volume as evidence of vitality.

The archive may preserve raw runs. Public exposition should be curated and clearly distinguish:

- raw operational record;
- research trace;
- study;
- work;
- rejected or superseded material.

## 8. Current work expectation

Protocol v3 encourages regular functional artefacts and native Astro works. This has practical advantages but has become a formal attractor:

- the medium is selected by the integration system;
- interactivity and browser execution appear as evidence that a work “acts”;
- technical completion can be mistaken for aesthetic necessity;
- every research question tends toward the same public form.

The Foundation requires medium selection to follow the problem and material. Astro remains one possible medium, not the default proof of work.

## 9. Governance alignment

The Research Ecology constitution already states:

- Ulysses is a local practice, not the central intelligence;
- human responsibility must remain visible;
- machine agency should be neither erased nor romanticised;
- no practice is obliged to maintain a fixed cadence;
- local protocols may change;
- work may be refused, withdrawn or terminated.

Stopping the nightly v3 production model therefore does not violate the constitution. It exercises local sovereignty and updates the practice in response to documented failure.

## 10. Immediate changes required

### Stop

- nightly research trigger;
- automatic landing of `ulysses/*` branches;
- automatic website dispatch from unreviewed machine runs;
- public claim that sessions are published unedited;
- “full autonomy” as a factual project description;
- regular-artifact requirement;
- Astro as default work medium;
- active closure-score or global openness optimisation.

### Preserve

- all historical sessions, works and protocols;
- correction histories;
- rejected and superseded claims with clear status;
- the Ulysses name as practice and optional persona;
- source-verification rules;
- capacity for machine-initiated proposals within bounded projects;
- Git as sovereign local archive.

### Add

- human-triggered project initiation;
- situated differential score;
- contribution and apparatus manifests;
- explicit model/provider/version records;
- rights, labour and affected-public review;
- non-public raw-run storage;
- manual publish decision;
- work-specific medium and stop conditions;
- model substitution or reproducibility policy where relevant.

## 11. Recommended repository change

```text
main
├── protocol/
│   ├── PROTOCOL-v4.md
│   └── foundation/
├── projects/
│   └── <project-id>/
│       ├── SCORE.md
│       ├── APPARATUS.md
│       ├── SOURCES.md
│       ├── traces/
│       ├── study/
│       └── work/
├── archive/
│   ├── protocols/v1-v3
│   ├── nightly-sessions/
│   └── legacy-works/
└── .github/workflows/
    ├── project-probe.yml        # manual, non-publishing
    └── publish-approved.yml     # human approval required
```

This is a conceptual topology, not a demand for needless migration. Claude should adapt it to the current repository with the smallest coherent change.

## 12. Audit conclusion

Ulysses v3 is not a dishonest project. It contains unusually explicit self-description and valuable longitudinal records. Its central failure is that its strongest disclosure has not yet changed its public identity or production infrastructure.

The v4 update should therefore not merely add an authorship note. It must remove the mechanisms that equate scheduled machine activity with research and technically mergeable output with publishable artistic work.
