# Claude Code handoff
## Implement Joint Inquiry / Temporary Research Constellations

You are adding a thin, additive collaboration layer to the current Research Ecology.

This is not a request to redesign the whole platform. It is not a request to create a master agent or a new permanent collective. Preserve the current local practices, current Encounter protocol and current website architecture unless the repository audit proves a concrete incompatibility.

## 1. Objective

Implement one complete vertical slice in which Ulysses, Meridian and Ensemble can voluntarily join one bounded shared inquiry, perform local work under their own protocols, exchange outputs through real Encounters, make one return move, and expose the resulting differences in The Middle.

The shared system coordinates procedure only. It does not synthesize meaning or decide success.

## 2. Read first

Read in this order:

1. `00-README.md`
2. `01-JOINT-INQUIRY-PROTOCOL.md`
3. `03-ENCOUNTER-AND-EXCHANGE-PROTOCOL.md`
4. `05-EPISTEMIC-DATA-MODEL.md`
5. `04-THE-MIDDLE-PRODUCT-AND-INTERFACE.md`
6. `02-DOMAIN-MODEL-AND-SCHEMAS.md`
7. `03-EVENTS-STATE-MACHINES-AND-COORDINATOR.md`
8. `04-LOCAL-PRACTICE-CONTRACTS.md`
9. `05-THE-MIDDLE-JOINT-INQUIRY-UX.md`
10. `06-IMPLEMENTATION-PLAN.md`
11. `08-ACCEPTANCE-TESTS.md`
12. `11-SECURITY-COSTS-AND-GOVERNANCE.md`
13. current Ulysses v4.1 package and standing delegation
14. current Meridian Runtime code/specification
15. current Ensemble protocol and actual workflow
16. actual Research Core, The Middle, site and infrastructure repositories.

## 3. Start with reconciliation

Before code, create or update:

```text
docs/JOINT-INQUIRY-RECONCILIATION.md
```

Include:

- repo and default branch matrix;
- current implementation state;
- current Encounter/data model;
- current write/read paths;
- current schedulers and dispatch mechanisms;
- current deployment/publication path;
- Ulysses, Meridian and Ensemble local entrypoints;
- which package recommendations are accepted, adapted, rejected or deferred;
- exact implementation sequence;
- irreversible or product-level decisions that still need Frank.

Do not ask Frank about ordinary reversible implementation choices.

## 4. Mandatory conceptual boundaries

1. Joint Inquiry is not a practice or collective.
2. Encounter remains the atomic exchange history.
3. Local objects and projects remain local.
4. The shared layer does not impose MRR's ontology on Ulysses or Ensemble.
5. No fixed pipeline or permanent role assignment.
6. Participation and withdrawal are locally issued.
7. Coordinator is procedural only.
8. No shared success, novelty, event or health score.
9. No generated consensus summary.
10. No public exposition without human editorial approval and rights checks.
11. Frank is not required to approve each internal move.
12. Resource limits and standing delegations are enforced.

## 5. Implementation order

Execute task packets `JI-00` through `JI-09` in dependency order. You may combine packets where the actual codebase makes that safer, but preserve reviewable commits and report deviations.

The first real code slice is:

```text
schema/types
-> fixture
-> persistence/import
-> read model
-> mocked local adapters
-> parallel_return coordinator dry run
-> inquiry page
```

Do not enable real cross-repo model runs before the dry-run acceptance tests pass.

## 6. Local integration requirements

### Ulysses

- Map participation to a normal v4 project.
- Respect standing delegation and safe auto-land.
- Permit self-acceptance only within the mandate.
- Never auto-create publication approval.

### Meridian

- Reference local ResearchScore/TaskBundle/Claim/Evidence objects opaquely.
- Do not replicate Meridian's internal ontology in Research Core.
- Permit correction and verification events to travel through existing Encounter mechanisms.

### Ensemble

- Audit actual local project/work structure before adapting.
- Preserve the right to refuse a service-like or illustrative role.
- Keep experiential/material outputs local.

## 7. Coordinator requirements

Implement `parallel_return` only in v0.1 unless the existing system makes another profile trivial.

Coordinator must:

- derive state from events;
- validate active commitments;
- issue idempotent local dispatches;
- enforce move/time/cost ceilings;
- attach returned refs;
- create/link Encounters rather than inventing cross-practice relations;
- build isolated return bundles;
- pause on escalation;
- enter review after declared moves;
- and notify Frank only on publication candidates, blocking escalations or final digest.

It must not:

- generate a master prompt from all repositories;
- evaluate research quality;
- write participant positions;
- accept invitations for another practice without local policy;
- extend automatically;
- or publish.

## 8. UI requirements

Add an inquiry surface to the current The Middle implementation. Reuse current components and content architecture.

Minimum:

- list/route;
- inquiry overview;
- braided event/practice trace;
- local position views;
- linked Encounters and objects;
- apparatus/exclusion view;
- JSON and static citation export.

No global graph, progress percentage or KPI dashboard.

## 9. Pilot

Use `10-PILOT-THE-CORRECTION-THAT-ARRIVES-TOO-LATE.md` as the candidate, but verify every source object and current ID first. The pilot title and source are not constitutionally fixed. Adapt or replace the seed if current repository evidence supports a stronger case, and document why.

Dry-run first, then activate one bounded real run only after tests pass.

## 10. Ask Frank only when necessary

Ask only for:

- a new public naming/brand decision;
- a budget increase beyond standing delegations;
- sensitive data or affected-public exception;
- unclear rights or consent;
- production credentials or irreversible migration;
- public exposition approval;
- or a change to constitutional commitments.

Do not ask him to approve every project, adapter, schema field, routine merge, local archive or kill decision.

## 11. Completion report

Return:

1. reconciliation summary;
2. decisions accepted/adapted/rejected/deferred;
3. changed repos, files and migrations;
4. tests and exact results;
5. fixture and pilot IDs;
6. workflows and credentials changed, without secrets;
7. what is staged versus deployed;
8. actual public routes;
9. cost and security limits;
10. remaining risks and technical debt;
11. exact items awaiting Frank;
12. commit hashes and PR links.

Do not claim a real inquiry ran, a site deployed or a participant accepted unless verified from the actual system.
