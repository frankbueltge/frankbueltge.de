# Housing affordability × political support — synthetic reference project

This directory is the executable reference thread for the Meridian Research Method Kernel v0.2.0.

It demonstrates how an open causal question is compiled into method objects before any analysis task is issued. All data and results are synthetic test fixtures. They are not evidence about European cities, housing markets, voters or parties.

## Object sequence

1. `research-score.json`
2. `method-profile.json`
3. `question-model.json`
4. `concept-measurement-charter.json`
5. `estimand.json`
6. `causal-model.json`
7. `evidence-matrix.json`
8. `data-asset-profile.json`
9. `research-design.json`
10. `identification-audit.json`
11. `pre-analysis-plan.json`
12. `falsification-plan.json`
13. `replication-plan.json`
14. `generalization-map.json`
15. `research-decision.json`

The reference instance deliberately ends with `stop_insufficient_evidence`: the implementation succeeds only if it blocks a real-world causal conclusion while preserving all research artefacts and the downgrade rationale.
