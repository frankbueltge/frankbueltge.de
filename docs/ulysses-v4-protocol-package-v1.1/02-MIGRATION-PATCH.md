# Ulysses v3 → v4 migration patch v1.1
## Direct migration with standing delegation and safe research auto-land

**Migration target:** `frankbueltge/irrtum-als-methode` and the corresponding Atelier integration on `frankbueltge.de`  
**Migration mode:** direct replacement with historical preservation  
**Parallel v3/v4 operation:** not required

## 1. Current coupling to replace

The old workflow combines three materially different operations:

```text
clock-triggered session
→ research branch
→ automatic merge
→ site dispatch
→ public appearance
```

The problem is not automatic integration itself. The problem is that a clock-triggered run, a green build, repository integration and public legitimacy are coupled into one pipeline.

Protocol v4 replaces this with:

```text
standing human delegation
→ Ulysses-initiated bounded project
→ autonomous research and project judgement
→ validated auto-land of reversible research records
→ optional publication candidate
→ occasional human publication decision
```

## 2. Migration principles

1. Preserve v3 history; do not rewrite it as if v4 had always governed the practice.
2. Stop the generic nightly production routine.
3. Replace the old auto-land workflow rather than banning all automatic integration.
4. Separate research archive, technical integration and curated publication.
5. Do not require Frank to approve every score, run, merge, archive or kill decision.
6. Keep publication, high-risk exceptions and constitutional changes human-accountable.
7. Keep the technical implementation small, reversible and inexpensive.

## 3. Exact migration sequence

### M-01 — Freeze the old coupling

Before editing content:

- disable the external generic nightly Ulysses routine;
- identify any secondary cron, Claude routine, GitHub dispatch or server job capable of starting generic sessions;
- pause the old `.github/workflows/auto-land.yml` during migration;
- confirm that no run is writing while migration occurs;
- inventory outstanding `ulysses/*` and `claude/*` branches and preserve them before destructive action.

Do not require a human artistic review of every legacy branch merely to migrate. Claude may classify and safely preserve ordinary branches; ask Frank only about destructive deletion, publication ambiguity, rights-sensitive material or a branch that changes protocol/infrastructure.

### M-02 — Preserve Protocol v3 exactly

Copy the pre-migration root `PROTOCOL.md` to:

```text
archive/protocols/PROTOCOL-v3-2026-07-16.md
```

Add a short supersession header without rewriting the body.

### M-03 — Install the standing delegation

Add:

```text
governance/STANDING-DELEGATION.md
```

Start with the supplied template. Resolve actual monthly limits, concurrent-project limits, permitted models/tools, protected paths and escalation triggers with Frank once. The result should be durable and not require daily renewal.

### M-04 — Activate Protocol v4 and public copy

Replace root `PROTOCOL.md` and `README.md` using the overlay as the baseline. Preserve:

- Ulysses as a practice rather than a persistent artificial person;
- project rather than generic session;
- self-initiation within standing delegation;
- bounded project-level permissions;
- external or material resistance;
- work/exposition distinction;
- safe auto-land for research history;
- human-only curated publication.

### M-05 — Replace the old auto-land workflow

Remove the old `.github/workflows/auto-land.yml` because it couples branch origin, merge and site dispatch.

Add:

```text
.github/workflows/project-checks.yml
.github/workflows/research-auto-land.yml
```

The replacement auto-land must:

- run only on the declared Ulysses research branch namespace or explicit project dispatch;
- validate project records and repository tests;
- enforce an allowlist of reversible research paths;
- reject protected-path changes such as protocol, governance, workflows, deployment, secrets, curated `works/` publication and site integration;
- reject `ESCALATE` or `QUARANTINED` projects;
- never create `PUBLICATION.json` or human approval metadata;
- merge safely under a single concurrency lock;
- never authorise or select an Atelier work merely because research landed. A generic technical rebuild may occur if the existing deployment architecture requires it, but the importer must remain publication-neutral.

Claude may implement this as direct merge, PR auto-merge or a bot account, whichever best fits the actual repository. The epistemic boundary matters more than the exact GitHub mechanism.

### M-06 — Add project records and validator

Install the templates and validator from the overlay. A score records the standing-delegation version and a machine-verifiable mandate check. It does not contain a mandatory human initiation decision.

Ulysses may autonomously:

- create a project;
- continue it inside budget;
- archive it as a study;
- kill it;
- mark it as a publication candidate;
- and auto-land eligible records.

### M-07 — Separate project outcome from publication

A `DECISION.md` records who made which decision and under what authority.

Allowed autonomous project outcomes include:

```text
ARCHIVE_AS_STUDY
KILL
PUBLICATION_CANDIDATE
ESCALATE
```

Only the responsible human can authorise:

```text
PUBLISH
REVISE_ONCE
DECLINE_PUBLICATION
```

`PUBLICATION.json` exists only after `PUBLISH` and must include human approval metadata.

### M-08 — Patch Atelier integration

The site integrator becomes a projection of explicit publication decisions.

Curated works surface rule:

```text
include a v4 work only when:
- PUBLICATION.json exists and is valid;
- status is PUBLISHED_WORK;
- approved_by and approved_at are present;
- work_path, exposition_path and apparatus_path resolve;
- project validation passes.
```

The public GitHub repository may contain active projects, studies and failures, clearly labelled as research records. They do not automatically enter the Atelier works gallery.

### M-09 — Remove obsolete public claims

Update claims that imply current nightly production, unedited automatic publication, sovereign machine authorship or that every repository result is a work.

## 4. Runtime model after migration

No generic daily or nightly routine is required. A lightweight dispatcher may continue or resume only active projects that declare a `next_action`, remain within budget and are authorised by the standing delegation. A project may also be event-triggered or manually seeded.

The runtime must not generate new projects merely because a schedule fired. It may discover and initiate a project when it finds a concrete source situation and can write a valid score within the mandate.

## 5. Rollback

Rollback restores technical operability, not the superseded coupling.

If v4 code breaks:

- restore the repository and site build;
- keep the generic nightly routine disabled;
- keep curated publication gated by `PUBLICATION.json`;
- temporarily pause safe auto-land if necessary;
- repair v4 without restarting session-based production.

## 6. Migration completion

Migration is complete when the acceptance tests pass, the standing delegation is approved once, safe auto-land is operating, and the old merge-to-publication coupling is gone.
