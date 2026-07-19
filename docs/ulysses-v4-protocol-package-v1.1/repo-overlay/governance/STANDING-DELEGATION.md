# Standing Delegation — Ulysses / Atelier

**Status:** DRAFT — confirm limits before activation  
**Mandate version:** 1  
**Responsible human:** Frank Bültge  
**Protocol:** Ulysses Research Protocol v4

## 1. Purpose

This mandate authorises ordinary autonomous Ulysses research without project-specific human approval. It is not a thematic agenda and does not determine which artistic questions Ulysses must pursue.

## 2. Capacity and budget

```yaml
max_active_projects: 2
monthly_external_cost_eur: 50
per_project_external_cost_eur: 20
max_project_runtime_days: 30
```

Replace these provisional values before activation.

## 3. Permitted autonomous actions

- identify concrete source situations and initiate projects;
- read and annotate permitted public or locally provided sources;
- use approved model and coding runtimes;
- create and modify files in auto-land-eligible research paths;
- run tests, builds and non-production fixtures;
- perform bounded project-local automation;
- revise, archive or kill ordinary projects;
- mark work as a publication candidate;
- auto-land validated reversible research records.

## 4. Auto-land-eligible paths

Initial allowlist, to adapt after repository audit:

```text
projects/**
atlas/**
docs/research-notes/**
```

Project work artefacts should remain inside `projects/<project-id>/` until human publication approval.

## 5. Protected paths and actions

Human review is required for:

```text
PROTOCOL.md
governance/**
.github/workflows/**
tools/**
works/**
site integration or deployment files
production infrastructure and secrets
PUBLICATION.json creation or modification
irreversible deletion or migration
```

## 6. Data and rights boundaries

Ordinary autonomous work may use public, licensed, project-owned or otherwise authorised material. Sensitive personal data, confidential material, community-governed material, unclear derivative rights or meaningful affected-public risk require escalation.

## 7. Escalation

Set `mandate_check: ESCALATE` and quarantine the branch when any budget, permission, rights, data, public-risk or protected-path boundary is crossed.

## 8. No-response behaviour

Human non-response does not pause unrelated ordinary work. Publication candidates wait; escalated projects remain quarantined; active projects may proceed within remaining capacity and budget.

## 9. Amendment

Only the responsible human may activate, amend, pause or revoke this mandate. Every version remains archived.
