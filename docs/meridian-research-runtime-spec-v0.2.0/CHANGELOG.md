# Changelog

## v0.2.0 — 2026-07-21

### Added

- Research Method Kernel and local Method Profiles.
- Question, concept, measurement, estimand, causal-model, design, identification, pre-analysis, falsification, replication, generalization, and research-decision contracts.
- New JSON Schemas and schema-valid housing reference examples.
- Method API and domain events.
- MethodBench families and hard gates G-M01 through G-M10.
- Synthetic housing-affordability/political-support vertical slice specification.
- Task packets M0-T01 through M7-T01.
- Acceptance feature fixtures.
- ADR-0003 and ADR-0004.

### Changed

- Integrated workflow now places method compilation before executable analysis.
- Claim Service must enforce method-specific claim ceilings.
- Implementation plan delays model-assisted autonomous research until deterministic method gates pass.
- Top-level agent instructions now prohibit direct raw-question execution, silent plan mutation, causal overclaiming, and synthetic evidence leakage.

### Preserved

- All v0.1.1 governance, federation, evidence, security, correction, and parallel-operation requirements.
