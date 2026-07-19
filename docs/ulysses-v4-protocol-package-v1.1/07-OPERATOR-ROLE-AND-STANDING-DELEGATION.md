# Operator role and standing delegation
## The minimum human role required for Ulysses v4.1

## 1. Frank’s role

Frank Bültge is:

- founder and constitutional author of the practice;
- operator of the technical and financial apparatus;
- responsible publisher of the curated public surface;
- holder of intervention, correction, suspension and termination powers;
- and an optional artistic interlocutor.

He is not expected to be:

- the daily prompt writer;
- project manager for every line;
- reviewer of every score or branch;
- merger of routine research records;
- or the person who must rescue, archive or kill every weak attempt.

## 2. Expected interaction frequency

### Rare or periodic

Frank approves or revises the standing delegation, for example when budgets, providers, permissions or risk tolerance change.

### Occasional

Frank reviews a compact publication candidate containing:

- the work or preview;
- the concrete research problem;
- the most important sources and counterpositions;
- material changes and rejected lines;
- apparatus and rights summary;
- Ulysses’ recommendation.

The decision is `PUBLISH`, `REVISE_ONCE` or `DECLINE_PUBLICATION`.

### Exceptional

Frank decides mandate exceptions involving sensitive data, affected publics, unclear rights, substantial cost, new production access, irreversible action or protocol change.

## 3. Standing delegation principle

A single approved mandate should cover ordinary autonomous work for a defined period or until amended. It is a permission envelope, not a research agenda.

It must be permissive enough that Ulysses can genuinely work, but explicit enough to prevent hidden escalation.

## 4. Recommended initial defaults

These are starting values for Claude and Frank to confirm once, not fixed constitutional rules:

```yaml
mandate_version: 1
max_active_projects: 2
monthly_external_cost_eur: 50
per_project_external_cost_eur: 20
max_project_runtime_days: 30
project_self_initiation: allowed
safe_auto_land: allowed
curated_publication: human_only
protocol_amendment: human_only
sensitive_personal_data: prohibited_without_exception
production_secrets: prohibited
irreversible_actions: prohibited
```

The cost values should be changed to realistic limits before activation.

## 5. Escalation triggers

Human review is required when a project:

- exceeds cost or time limits;
- uses sensitive, confidential or community-governed material;
- makes claims about identifiable people that create meaningful risk;
- lacks clear rights for intended public use;
- requests production credentials or protected-path changes;
- proposes irreversible deletion or migration;
- creates a strong public factual claim outside the existing evidence envelope;
- or seeks to alter the protocol, mandate, authorship model or public identity.

## 6. No-response behaviour

A missing human response does not stop ordinary Ulysses work.

- Active mandate-compliant projects may continue.
- Completed weak projects may archive or terminate themselves.
- Publication candidates wait without becoming works.
- Escalated projects remain quarantined.
- Unrelated projects may proceed if capacity and budget remain.

This is the key operational distinction between human accountability and daily human control.
