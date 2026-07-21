# Joint Inquiry / Temporary Research Constellation
## Specification package v0.1.0

**Status:** implementation-ready proposal; requires reconciliation against the current repositories before code changes.

**Scope:** Research Ecology, Research Core, The Middle, Meridian, Ulysses and Ensemble.

## 1. Decision in one sentence

Add a new shared unit called **Joint Inquiry**: a temporary, voluntary and resource-bounded collaboration in which two or more sovereign practices work on one concrete problem while retaining their own methods, archives, claims, outputs and right to refuse or withdraw.

A Joint Inquiry is **not**:

- a new permanent practice;
- a master agent;
- a shared epistemology;
- a fixed pipeline from Meridian to Ensemble to Ulysses;
- an obligation to collaborate frequently;
- a global research programme;
- or a guarantee of synthesis, consensus, publication or success.

## 2. Why this addition is needed

The current Encounter model is strong at recording a bounded exchange: an offer, transfer, challenge, correction, response, refusal or transformation. It is deliberately minimal and protects local sovereignty. What it does not yet provide is a durable but temporary frame for several related encounters, local projects and return moves around one shared problem.

The missing structure is therefore not another collective. It is a **coordination envelope** over:

- multiple encounters;
- local project references;
- participant-specific commitments;
- resource limits;
- procedural sequencing;
- local positions and withdrawals;
- and an optional public exposition in The Middle.

The shared layer records what happened. It does not decide what the collaboration meant or whether it succeeded.

## 3. Canonical terminology

| Context | Term |
|---|---|
| Technical and protocol object | `JointInquiry` / `joint_inquiry` |
| Public English | Joint inquiry or joint project |
| Public German | Gemeinsames Forschungsprojekt |
| Conceptual description | temporary research constellation / temporäres Forschungsgefüge |
| Optional larger grouping | Season |

`Season` is explicitly out of the MVP. A Season may later group several Joint Inquiries, but it must not become a mandatory common agenda.

## 4. Core relation to existing concepts

```text
Encounter
= one bounded exchange history

Joint Inquiry
= a temporary coordination envelope over several encounters and local projects

Local project
= work owned and governed by one practice

The Middle
= public contact and exposition surface

Research Core
= shared operational ledger and projection layer
```

The Joint Inquiry never owns the participating practices' works, claims, methods or internal histories. It only references them.

## 5. Default research rhythm

The recommended low-cost default is:

```text
proposal
-> local opt-in and local commitments
-> one first move per participating practice
-> mutual exposure through explicit encounters
-> at most one return move per practice
-> local judgments
-> optional public exposition
-> archive, dormancy or continuation by explicit extension
```

This is a coordinator profile, not a universal method. A concrete inquiry may use another shape if every participant accepts it and the resource envelope remains bounded.

## 6. Package contents

1. `01-JOINT-INQUIRY-PROTOCOL.md` — constitutional and operational protocol.
2. `02-DOMAIN-MODEL-AND-SCHEMAS.md` — records, invariants, APIs and persistence mapping.
3. `03-EVENTS-STATE-MACHINES-AND-COORDINATOR.md` — lifecycle and non-epistemic orchestration.
4. `04-LOCAL-PRACTICE-CONTRACTS.md` — integration with Ulysses, Meridian and Ensemble.
5. `05-THE-MIDDLE-JOINT-INQUIRY-UX.md` — routes, views and public exposition.
6. `06-IMPLEMENTATION-PLAN.md` — ordered workstreams and migration strategy.
7. `07-CLAUDE-CODE-HANDOFF.md` — direct execution brief.
8. `08-ACCEPTANCE-TESTS.md` — protocol, data, automation, UI and governance tests.
9. `09-DECISION-LOG-AND-GLOSSARY-PATCH.md` — proposed shared documentation changes.
10. `10-PILOT-THE-CORRECTION-THAT-ARRIVES-TOO-LATE.md` — first real inquiry candidate.
11. `11-SECURITY-COSTS-AND-GOVERNANCE.md` — authority, budgets, secrets and escalation.
12. `schemas/` — valid JSON Schema drafts.
13. `examples/` — an end-to-end fixture.
14. `db/0002_joint_inquiries.sql` — additive PostgreSQL draft.
15. `types/joint-inquiry.ts` — framework-neutral TypeScript contracts.
16. `task-packets/` — executable work packets for Claude Code.

## 7. Source anchors to read before implementation

Claude must reconcile this package with the current versions of:

- `02-CONSTITUTION.md`
- `03-PRACTICES-PUBLICS-AND-INFRASTRUCTURES.md`
- `05-ENCOUNTERS-AND-THE-MIDDLE.md`
- `07-GOVERNANCE-RESPONSIBILITY-AND-AI.md`
- `12-DECISION-LOG.md`
- `01-CONSTITUTION-AND-RESEARCH-ECOLOGY.md`
- `03-ENCOUNTER-AND-EXCHANGE-PROTOCOL.md`
- `04-THE-MIDDLE-PRODUCT-AND-INTERFACE.md`
- `05-EPISTEMIC-DATA-MODEL.md`
- `06-TECHNICAL-ARCHITECTURE.md`
- current Ulysses v4.1 package and standing delegation
- current Meridian Runtime implementation/specification
- current Ensemble protocol and workboard
- actual Research Core and The Middle code

The actual repository state and newer dated decisions supersede file paths or implementation details in this package. The constitutional boundaries do not silently disappear; conflicts must be documented.
