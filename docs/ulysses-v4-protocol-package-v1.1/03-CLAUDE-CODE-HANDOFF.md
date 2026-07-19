# Claude Code handoff — Ulysses v4 package revision 1.1
## Implement standing delegation, autonomous project work and safe auto-land

You are implementing an immediate operating-model migration for `frankbueltge/irrtum-als-methode` and its integration into `frankbueltge.de/atelier`.

This is a young artistic research experiment, not a high-traffic product migration. Do not build a prolonged parallel run, a governance bureaucracy or a system that requires Frank to approve daily work.

## 1. Objective

Replace the old session-based, generic nightly, merge-and-publish coupling with:

> Ulysses is a situated artistic research practice by Frank Bültge. A standing human delegation defines budget, permissions and escalation boundaries. Inside that envelope Ulysses may initiate, execute, revise, archive, kill and technically integrate projects autonomously. Curated publication, rights-sensitive exceptions, substantial new costs and protocol changes remain human decisions.

## 2. Read first

Read in this order:

1. `00-README.md`
2. `01-ULYSSES-RESEARCH-PROTOCOL-V4.md`
3. `07-OPERATOR-ROLE-AND-STANDING-DELEGATION.md`
4. `02-MIGRATION-PATCH.md`
5. `04-ACCEPTANCE-TESTS.md`
6. `06-PUBLIC-SURFACE-PATCH.md`
7. the final Research Foundation files
8. current repository and deployment files before applying the overlay.

The overlay is a proposal. Adapt it to the actual codebase, but preserve the authority boundaries.

## 3. Required audit

Before changes, report concisely:

- default branch and latest commit;
- active workflows and triggers;
- actual location of the generic nightly routine;
- current branch and site-integration contracts;
- outstanding research branches and PRs;
- current public-work selection rules;
- protected infrastructure and secret boundaries;
- existing tests and deployment commands.

Do not stop at GitHub if the scheduler is external.

## 4. Required implementation

### A. Stop the generic nightly production routine

Disable unattended recurrence whose only reason to run is the clock. Preserve any project-local or event-driven mechanism that can be safely adapted to active v4 projects.

### B. Preserve v3

Archive the exact pre-migration protocol with a supersession header. Preserve historical sessions and works.

### C. Install standing delegation

Add `governance/STANDING-DELEGATION.md`. Resolve the small number of actual limits with Frank once. Do not require project-specific score approval after the mandate is active.

### D. Activate v4

Replace root protocol and README. Add project templates, validator and Foundation anchor.

### E. Replace old auto-land

Delete the old workflow that couples `ulysses/*` merge and site dispatch. Add a safe research auto-land mechanism that:

- validates;
- permits only allowlisted reversible research paths;
- rejects protected paths and escalation states;
- serialises merges;
- preserves clear project status;
- does not publish, select a curated work or create human approval metadata. A generic technical rebuild is acceptable only when the importer ignores non-published project states.

Choose direct merge, PR auto-merge or bot merge based on the actual repository. Document the choice.

### F. Enable autonomous project lifecycle

Within the standing delegation, Ulysses may:

- discover a concrete source situation;
- write and activate a score;
- perform multiple bounded operations;
- revise while budget and stop conditions permit;
- archive or kill weak projects;
- mark strong work as `PUBLICATION_CANDIDATE`;
- auto-land ordinary research records.

Do not add a requirement that Frank approve every score, branch, merge, study or termination.

### G. Keep curated publication human-only

A public Atelier work requires `PUBLICATION.json` with explicit human approval. No model or workflow may populate those fields. Candidate work can wait indefinitely without blocking other research.

### H. Patch public language and site integration

Separate historical v1-v3 import from v4 publication manifests. Do not present active projects, studies, failures or candidates as curated works, although they may remain visible in the public repository or a separately labelled research-log surface.

## 5. Frank’s expected workload

The implementation is wrong if it requires Frank to:

- approve each project;
- inspect each research branch;
- merge routine records;
- monitor daily runs;
- decide every archive or kill action;
- or respond before Ulysses can continue ordinary work.

Frank should normally act only when:

- setting or changing the standing delegation;
- reviewing a publication candidate;
- deciding a legal, ethical, financial or infrastructure exception;
- correcting, suspending or terminating the practice;
- or amending the protocol/public authorship model.

## 6. Explicit non-goals

Do not build:

- a multi-agent council;
- a novelty, event, closure or health score;
- a global knowledge graph;
- a compulsory daily session;
- a 17-stage workflow;
- automatic curated publication;
- automatic permission expansion;
- or a requirement for daily human review.

Autonomous project discovery is allowed only when a concrete source situation and valid mandate-compliant score exist. Random topic generation to keep the system busy is not allowed.

## 7. Minimum tests

Prove:

- generic nightly production no longer runs;
- a valid mandate-compliant project can self-initiate without human approval;
- allowed research paths auto-land after validation;
- protected-path changes and escalation states do not auto-land;
- auto-land never causes a non-approved project to appear on the curated works surface;
- studies and killed projects can integrate without human review;
- a publication candidate can wait without blocking research;
- curated publication fails without human approval metadata;
- v3 history and historical works still build;
- total unattended model spend is bounded by the mandate.

## 8. Ask Frank only when necessary

Ask Frank only for decisions that change:

- public authorship or legal responsibility;
- monthly budget or infrastructure boundaries;
- rights, consent or sensitive material use;
- production credentials;
- irreversible deletion;
- or Protocol v4’s conceptual commitments.

Make ordinary reversible implementation choices yourself. Begin with the audit and implement in the same workstream.
