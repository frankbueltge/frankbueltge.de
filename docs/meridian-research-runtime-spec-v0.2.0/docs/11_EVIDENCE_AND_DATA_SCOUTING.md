# 11 — Evidence and data scouting

## 1. Separation of discovery, extraction, and verification

Searching is not evidence. The Evidence Scout has three stages:

1. discovery — identify candidate sources;
2. extraction — structure study characteristics and claims;
3. verification — retrieve the source, anchor exact passages or tables, and validate the extracted record.

A model may perform discovery and draft extraction. Verification follows the v0.1.1 independent-review rules.

## 2. EvidenceMatrix

Each study row records:

- stable source identifier and source family;
- publication and version status;
- country, cities, and period;
- unit and sample;
- exposure and outcome operationalizations;
- party or ideology taxonomy;
- design and estimator;
- target estimand;
- identification assumptions;
- effect estimates and uncertainty;
- diagnostics;
- limitations;
- replication status;
- direct relevance to each project estimand;
- exact evidence anchors;
- verification status.

The matrix MUST include null, contradictory, replication, and method-critical studies. Ranking only by semantic similarity is prohibited.

## 3. Search strategy object

The project stores:

- databases and indexes searched;
- exact query strings;
- date and language limits;
- inclusion and exclusion criteria;
- snowballing method;
- grey-literature policy;
- preprint policy;
- deduplication logic;
- screening decisions;
- unresolved access failures.

Search updates create new revisions; old result sets remain reproducible.

## 4. Source-family analysis

Multiple publications may derive from the same dataset, working paper, press release, policy report, or research team. The scout creates `SourceFamily` links and records:

- common origin;
- shared data;
- shared model or code;
- direct derivation;
- overlapping authorship;
- unknown dependence.

Source-family counts are separate from citation counts.

## 5. DataAssetProfile

A data profile records:

- owner and authoritative location;
- access route and credentials class;
- license and permitted purpose;
- data classification;
- temporal coverage and frequency;
- geographic units and boundary versions;
- observational unit;
- variables and definitions;
- revision history;
- expected update cadence;
- missingness and suppression;
- sampling and weighting;
- known measurement changes;
- join keys and crosswalks;
- direct identifiers and re-identification risk;
- cost and latency;
- suitability for each estimand and design;
- local-node residency requirement.

### 5.1 Data is not assumed available

A catalog entry or paper citation is not proof that usable data can be acquired. The profile distinguishes:

```text
candidate
metadata_verified
access_requested
access_granted
sample_inspected
quality_audited
analysis_ready
rejected
unavailable
```

## 6. Geographic and temporal harmonization

For city research, the Data Scout MUST inspect:

- municipal mergers and boundary changes;
- election-district changes;
- inconsistent definitions of metropolitan area;
- annual versus election-period alignment;
- lag structure between exposure and outcome;
- crosswalk quality;
- population-weighted versus area-weighted transformation;
- missing small-area values;
- comparability across countries.

A harmonized paneuropean file is a result of research, not an assumed input.

## 7. Feasibility decision

After scouting, the Adaptive Research Manager may:

- proceed with the full scope;
- narrow countries, cities, period, or population;
- split the project into comparable country modules;
- switch from causal estimation to evidence synthesis;
- request primary data collection;
- stop for insufficient data.

The Runtime MUST prefer an honest scope reduction to fabricated harmonization.

## 8. Normative requirements

- **MRR-MTH-060**: Evidence discovery, extraction, and verification MUST be represented as separate states.
- **MRR-MTH-061**: Every verified study record MUST reference an exact source version and at least one anchor where technically possible.
- **MRR-MTH-062**: The EvidenceMatrix MUST record design, estimand, identification assumptions, operationalizations, scope, limitations, and replication status.
- **MRR-MTH-063**: Null and contradictory findings MUST be eligible for inclusion under the same relevance rules as positive findings.
- **MRR-MTH-064**: Search strategies MUST be versioned and reproducible.
- **MRR-MTH-065**: Screening exclusions MUST record a reason category.
- **MRR-MTH-066**: Citation count MUST NOT be presented as independent evidence count.
- **MRR-MTH-067**: Data availability MUST NOT be inferred from metadata or a publication alone.
- **MRR-MTH-068**: Every analysis data asset MUST reach `analysis_ready` through documented access and quality states.
- **MRR-MTH-069**: A `DataAssetProfile` MUST declare temporal coverage, geography, unit, variables, access, license, data class, missingness, revision history, and joinability.
- **MRR-MTH-070**: Geographic crosswalks MUST be versioned artifacts with quantified or categorized uncertainty.
- **MRR-MTH-071**: Temporal alignment rules MUST be explicit and included in the pre-analysis plan.
- **MRR-MTH-072**: Restricted data MUST remain on its owning node unless an approved transfer explicitly permits export.
- **MRR-MTH-073**: The Data Scout MUST be able to return `unavailable` without substituting synthetic or approximate data as empirical evidence.
- **MRR-MTH-074**: Scope reduction due to data limitations MUST create a new question or score revision when it materially changes the target population or claim.
- **MRR-MTH-075**: Dataset construction steps MUST be reproducible and produce a run manifest and evidence crate.

## 9. Reference outputs

The housing reference project includes:

- an empty but schema-valid EvidenceMatrix fixture demonstrating required fields;
- candidate DataAssetProfiles with no false assertion of access;
- a synthetic analysis-ready dataset used only for software acceptance;
- explicit labels preventing synthetic fixtures from becoming empirical evidence.
