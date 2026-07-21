# Meridian Research Runtime (MRR) — Implementation Specification v0.2.0

This package extends MRR v0.1.1 from a federated research governance and evidence operating system into an executable research architecture through the **Research Method Kernel**.

## What remains unchanged

The v0.1.1 foundations remain normative:

- immutable, content-addressed research history;
- Research Scores and autonomy boundaries;
- local node sovereignty;
- signed Task Bundles;
- sandboxed execution;
- Evidence Crates;
- atomic Claims and source families;
- independent skepticism and verification;
- transfers, obligations, corrections, and projections;
- parallel operation with Meridian Classic.

## What v0.2 adds

- local versioned Method Profiles;
- QuestionModel and ambiguity handling;
- ConceptMeasurementCharter;
- Estimands and competing CausalModels;
- EvidenceMatrix and DataAssetProfile;
- ResearchDesign and IdentificationAudit;
- machine-enforced claim-language ceilings;
- immutable PreAnalysisPlans and explicit amendments;
- Analysis Compiler contracts;
- FalsificationPlan and kill conditions;
- ReplicationPlan with measured independence;
- GeneralizationMap and explicit non-claims;
- Adaptive ResearchDecision objects;
- a synthetic housing-affordability/political-support reference project;
- MethodBench and ten new hard release gates.

## Strategic rule

> A governed pipeline is not yet a research method. A research method is not yet a valid claim. Each transition must be explicit, testable, and reversible.

## Reading order

1. `AGENTS.md`
2. `UMSETZUNGSUPDATE_DE.md`
3. `CLAUDE_CODE_IMPLEMENTATION_HANDOFF_DE.md`
4. docs 00–07 for governance and evidence foundations
4. `docs/08_RESEARCH_METHOD_KERNEL.md`
5. docs 09–15 for method behavior
6. `docs/16_HOUSING_AFFORDABILITY_REFERENCE_PROJECT.md`
7. docs 17–19 for API, gates, and implementation
8. accepted ADRs
9. schemas, examples, acceptance features, and task packets

## First implementation target

Implement a deterministic single-node method slice on synthetic data. It must be capable of rejecting a causal claim, not only producing one.

## Validation

```bash
python tools/validate_package.py
```

The validator checks all v0.2 method examples against Draft 2020-12 JSON Schemas and parses all task packets.
