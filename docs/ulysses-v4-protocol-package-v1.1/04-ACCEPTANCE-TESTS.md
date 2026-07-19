# Ulysses v4 package revision 1.1 — acceptance tests

## A. Old coupling removed

- [ ] The generic nightly production routine is disabled and its former location documented.
- [ ] The old workflow that couples research-branch landing to site dispatch is removed.
- [ ] No clock-triggered run creates a project merely because the schedule fired.

## B. Standing delegation

- [ ] `governance/STANDING-DELEGATION.md` exists, is versioned and names the responsible human.
- [ ] It defines monthly and per-project budgets, concurrent-project limits, allowed tools/data/actions, protected paths and escalation triggers.
- [ ] A mandate-compliant score can become active without project-specific human approval.
- [ ] A mandate violation produces `ESCALATE` or `QUARANTINED`, not silent continuation.

## C. Safe auto-land

- [ ] A replacement research auto-land workflow exists.
- [ ] It validates project records and repository tests.
- [ ] It allows only declared reversible research paths.
- [ ] It refuses changes to protocol, governance, workflows, deployment, secrets, curated works publication and site integration.
- [ ] It refuses unresolved escalation/quarantine states.
- [ ] It serialises writes to `main` or uses an equivalently safe merge mechanism.
- [ ] It never creates `PUBLICATION.json`, human approval metadata or a curated-work selection event.

**Practical tests:**

1. Push a valid project-only branch and confirm it lands automatically.
2. Push a branch changing `PROTOCOL.md` and confirm auto-land refuses it.
3. Push a project marked `ESCALATE` and confirm it remains for review.
4. Confirm an ordinary research auto-land cannot make the project appear as a curated Atelier work, even if a generic site rebuild occurs.

## D. Autonomous project lifecycle

- [ ] Ulysses can create a score, research, revise, archive and kill work within mandate and budget.
- [ ] `ARCHIVE_AS_STUDY` and `KILL` do not require human approval.
- [ ] A strong project can become `PUBLICATION_CANDIDATE` without being published.
- [ ] Lack of an immediate human response does not block unrelated ordinary research.
- [ ] Resource exhaustion, stop condition or kill condition closes or pauses the project automatically.

## E. Publication boundary

- [ ] Technical integration and curated publication are separate operations.
- [ ] `PUBLISH` requires `APPARATUS.md`, `EXPOSITION.md`, `DECISION.md` and valid `PUBLICATION.json`.
- [ ] `PUBLICATION.json` requires a named human approver and timestamp.
- [ ] A model-generated or missing human approval fails validation.
- [ ] Active, study, killed and candidate projects do not appear in the curated works gallery.

## F. Human workload

- [ ] Frank is not required to approve every score.
- [ ] Frank is not required to merge routine research records.
- [ ] Frank is not required to decide routine archive/kill outcomes.
- [ ] Frank is contacted only for publication, mandate exceptions, high-risk matters or constitutional changes.

## G. History and public truthfulness

- [ ] Protocol v3 is archived unchanged apart from a supersession header.
- [ ] Historical sessions and works remain available.
- [ ] Public copy no longer claims current generic nightly production or automatic unedited publication.
- [ ] Automatically landed repository material is visibly labelled by project state and not misrepresented as curated work.

## H. Cost and security

- [ ] Model-call and service-cost limits are enforceable.
- [ ] Production secrets are unavailable to ordinary project runs.
- [ ] Destructive actions and protected infrastructure require escalation.
- [ ] Logs contain enough information to audit cost and permissions without exposing secrets.
