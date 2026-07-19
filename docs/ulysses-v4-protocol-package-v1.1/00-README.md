# Ulysses Protocol v4 — implementation package v1.1

## Purpose

This package converts the completed five-tranche Research Foundation into a lean Ulysses operating model that can remain substantially autonomous without making Frank Bültge a daily project manager.

The decisive change is:

> Ulysses no longer operates as a generic nightly production routine. It works through bounded projects under a standing human delegation. It may initiate, execute, revise, archive and technically integrate ordinary research work autonomously inside that mandate. Curated publication, high-risk exceptions and constitutional changes remain human decisions.

The package is designed for direct implementation by Claude Code or another capable coding agent after repository inspection. It does not require a shadow run, a parallel v3/v4 programme, a new multi-agent system or daily human approvals.

## Package contents

1. `01-ULYSSES-RESEARCH-PROTOCOL-V4.md` — canonical protocol text.
2. `02-MIGRATION-PATCH.md` — exact conceptual and repository migration.
3. `03-CLAUDE-CODE-HANDOFF.md` — implementation brief ready to paste into Claude Code.
4. `04-ACCEPTANCE-TESTS.md` — completion criteria and practical tests.
5. `05-DECISION-LOG-PATCH.md` — decisions to add to the Research Ecology master log.
6. `06-PUBLIC-SURFACE-PATCH.md` — truthful public proposition and site-integration rules.
7. `07-OPERATOR-ROLE-AND-STANDING-DELEGATION.md` — Frank’s actual role and the durable mandate for Ulysses.
8. `08-CHANGELOG-V1.1.md` — concise record of the corrections made after the operator-role review.
9. `repo-overlay/` — proposed replacement and new files in repository-relative paths.

## Source of authority

Implementation order when sources conflict:

1. actual current repository, scheduler and deployment state;
2. later dated human-approved decisions;
3. this v1.1 package;
4. the complete Research Foundation;
5. older protocol and architecture documents for historical context.

Do not silently resolve conflicts. Record them and apply the newest explicit decision.

## Immediate decisions encoded here

```text
PROTOCOL V4: ACTIVATE AFTER MIGRATION CHECKS
PROTOCOL V3: PRESERVE, MARK SUPERSEDED
GENERIC NIGHTLY ULYSSES ROUTINE: STOP
OLD AUTO-LAND + SITE-DISPATCH COUPLING: REPLACE
SAFE AUTO-LAND OF REVERSIBLE RESEARCH RECORDS: ENABLE
PROJECT SELF-INITIATION WITHIN STANDING DELEGATION: ENABLE
CURATED PUBLICATION: EXPLICIT HUMAN DECISION ONLY
DAILY HUMAN PROJECT APPROVAL: NOT REQUIRED
PARALLEL OR SHADOW RUN: NOT REQUIRED
```

## Minimal target repository shape

```text
irrtum-als-methode/
  PROTOCOL.md
  README.md
  governance/
    STANDING-DELEGATION.md
  docs/
    RESEARCH-FOUNDATION-V1.md
  projects/
    _template/
      SCORE.md
      APPARATUS.md
      TRACE.md
      EXPOSITION.md
      DECISION.md
      PUBLICATION.example.json
    <project-id>/
  works/                         # historical and curated published works
  journal/                       # historical v1-v3 session record
  archive/protocols/
    PROTOCOL-v3-2026-07-16.md
  tools/
    validate_v4_projects.py
  .github/workflows/
    project-checks.yml
    research-auto-land.yml
```

The overlay is a proposal, not a blind copy instruction. Claude should adapt paths and the exact GitHub merge mechanism where the actual repository requires it, while preserving the conceptual boundaries.

## Included research reference

`foundation-reference/` contains the complete five-tranche packages used to derive Protocol v4. They are included for auditability and implementation context; they are not intended to be copied wholesale into the public repository.
