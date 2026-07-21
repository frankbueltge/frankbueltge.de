# 16 — Reference vertical slice
## Housing-cost unaffordability and political support in European cities, 2015–2025

## 1. Status

This is a software and method-contract reference project. It does not contain a substantive answer and MUST NOT be presented as empirical evidence. Production research requires verified literature, legally accessible data, accepted taxonomies, and completed identification audits.

## 2. Raw question

> In welchem Maß erhöht steigende Wohnkosten-Unbezahlbarkeit ursächlich die Unterstützung für rechtspopulistische / Anti-Establishment-Parteien in europäischen Städten, 2015–2025?

## 3. Question compilation

### 3.1 Claim type

Primary: `causal`.

Secondary components:

- descriptive trend;
- associational mapping;
- mechanism explanation;
- generalization across cities and countries.

### 3.2 Unresolved concepts

- `Wohnkosten-Unbezahlbarkeit`;
- `steigend`;
- `Unterstützung`;
- `rechtspopulistisch`;
- `Anti-Establishment`;
- `europäische Stadt`;
- exposure-to-election lag.

### 3.3 Required question branches

- individual vote-choice branch;
- aggregate city vote-share branch;
- residential-sorting branch;
- party-family sensitivity branch;
- insufficient-evidence branch.

## 4. Concept and measurement charter

### 4.1 Housing affordability

Candidate measures:

- household housing-cost-to-disposable-income ratio;
- housing-cost-overburden indicator;
- residual income after housing costs;
- rent-to-income change;
- subjective affordability stress;
- property-price-to-income ratio.

The charter MUST record that property prices may benefit owners while rents burden tenants. The primary analysis cannot combine these without tenure-specific interpretation.

### 4.2 Political support

Candidate outcomes:

- individual vote choice;
- vote intention;
- party sympathy;
- municipal or national election vote share;
- turnout;
- anti-incumbent voting.

### 4.3 Party taxonomy

At least two taxonomies are required:

- right-populist or radical-right family;
- broad anti-establishment family.

Taxonomies are country-, party-, election-, and time-versioned. Primary results must be rerun under accepted alternatives.

### 4.4 City

The project must choose among administrative municipality, functional urban area, metropolitan region, or electoral district. Cross-country comparability must be audited.

## 5. Estimands

### E1 — Individual renter effect

Effect of transition into high housing-cost burden on probability of voting for a defined party family at the next election among urban renters who remain observable.

### E2 — Aggregate city effect

Effect of a within-city increase in median or distributional housing-cost burden on the next-election party-family vote share.

### E3 — Residential composition

Portion of aggregate electoral change attributable to migration, displacement, or tenure composition rather than within-person preference change.

### E4 — Institutional heterogeneity

Difference in E1 or E2 across rental regulation, social-housing coverage, or welfare regimes.

## 6. Competing causal models

### M1 — Material pressure

Housing costs reduce disposable income, increase insecurity, and shift support toward challengers.

### M2 — Status threat

Perceived downward mobility or loss of entitlement mediates political response.

### M3 — Anti-incumbent accountability

Voters punish governing parties rather than specifically supporting right-populist actors.

### M4 — Residential sorting

Electoral change reflects who remains, leaves, or enters the city.

### M5 — Reverse selection

Political groups select into different housing markets or neighborhoods before observed cost changes.

### M6 — Context-dependent null

No stable European effect exists; institutions and party supply dominate.

## 7. Evidence and data scouting plan

### 7.1 Evidence queries

Search families should cover:

- housing costs and voting;
- rent burden and populism;
- displacement and electoral behavior;
- economic insecurity and radical-right support;
- urban political backlash;
- housing policy reforms and elections;
- residential mobility and ecological inference;
- null and replication studies.

Exact search strings, indexes, dates, and inclusion decisions are stored in a versioned strategy object.

### 7.2 Data classes

Candidate classes, not assumed sources:

- household income and housing-cost panels;
- election studies and longitudinal political surveys;
- small-area election results;
- rent and housing-price series;
- social-housing and housing-supply records;
- local policy reforms;
- population, migration, labor-market, and income controls;
- geographic boundary and crosswalk files.

### 7.3 Feasibility gates

The paneuropean scope is retained only if:

- exposure and outcome measures can be harmonized without hiding material definition changes;
- city and electoral geographies can be joined with acceptable uncertainty;
- temporal alignment supports the estimands;
- party taxonomies are reviewable;
- adequate variation and overlap exist;
- legal access and compute are feasible.

Otherwise the manager narrows scope or creates country modules.

## 8. Candidate designs

### D1 — Individual longitudinal panel

Strength: observes within-person changes and can separate tenure groups.

Threats: attrition, residential mobility, limited city samples, time-varying confounding.

Claim ceiling before audit: `associational_adjusted`.

### D2 — City or district panel

Strength: broad temporal and geographic coverage.

Threats: ecological inference, boundary changes, national shocks, residential sorting, spatial dependence.

Claim ceiling before audit: `associational_adjusted`.

### D3 — Difference-in-differences around housing-policy or cost shocks

Strength: potentially stronger causal identification.

Threats: endogenous policy, concurrent reforms, nonparallel trends, anticipation, heterogeneous timing.

Claim ceiling before audit: `causal_bounded` only on conditional pass.

### D4 — Synthetic control for selected city reform

Strength: transparent case-specific counterfactual.

Threats: donor-pool quality, unique concurrent events, limited generalization.

### D5 — Reanalysis and replication

Reconstruct strong existing studies before claiming novelty.

### D6 — Qualitative mechanism comparison

Contrast cities that differ in political response under similar housing pressure.

## 9. Pre-analysis minimum

The plan must lock:

- primary estimand;
- primary party taxonomy;
- primary housing measure;
- study units and period;
- lag policy;
- exclusions;
- estimator;
- uncertainty method;
- pre-trend threshold;
- missing-data policy;
- alternative taxonomy and measure analyses;
- country influence analysis;
- residential-sorting probe;
- claim downgrade rules.

## 10. Falsification minimum

Required probes:

- placebo dates;
- pre-treatment trends;
- unrelated outcomes;
- unaffected or differently affected tenure groups;
- alternative affordability measures;
- alternative party taxonomies;
- leave-one-country-out;
- boundary crosswalk alternatives;
- migration and composition adjustment;
- anti-incumbent comparison;
- independent reimplementation.

## 11. Permitted result forms

The system may produce:

- a bounded causal estimate for a specific reform, group, and context;
- adjusted association with explicit noncausal status;
- heterogeneous local effects;
- evidence that aggregation is driven by sorting;
- a null result;
- inconsistent findings across taxonomies;
- insufficient evidence for a European-wide causal claim.

It MUST NOT jump directly to a universal statement about European cities.

## 12. Synthetic acceptance fixture

The package provides schema-valid objects and a synthetic dataset contract for software testing. Every synthetic artifact carries:

```json
{
  "evidence_status": "SYNTHETIC_TEST_FIXTURE",
  "empirical_claims_permitted": false
}
```

The deterministic fixture must contain one intentionally invalid design and one conditionally eligible design, a falsification failure, and a replication discrepancy so that failure paths are tested.

## 13. End-to-end acceptance narrative

1. Raw question is compiled into five branches.
2. Charter separates renter burden from property-price pressure and two party taxonomies.
3. E1 and E2 are created and cannot be merged.
4. D2 fails causal audit and is retained for descriptive mapping.
5. D3 conditionally passes pending pre-trends and policy-confounding checks.
6. Pre-analysis plan is locked.
7. Synthetic workflow runs locally.
8. A pre-trend fixture triggers a kill condition for one branch.
9. A second branch survives but receives a narrow generalization map.
10. Independent reimplementation disagrees beyond tolerance; claim remains contested.
11. Manager issues `collect_more_data` or `stop_insufficient_evidence`, not a fabricated conclusion.
