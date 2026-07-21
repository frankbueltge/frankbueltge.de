Feature: Keep synthetic fixtures outside empirical evidence paths
  Synthetic fixtures may test software and methods but must never support real-world
  scientific or political claims.

  Scenario: Synthetic DataAssetProfile blocks empirical claim use
    Given a DataAssetProfile classification "SYNTHETIC_TEST_FIXTURE"
    And empirical_claims_permitted is false
    When an EvidenceRelation attempts to support an empirical Claim
    Then the relation is rejected with error "SYNTHETIC_EVIDENCE_FORBIDDEN"

  Scenario: Synthetic results are clearly labelled in every projection
    Given a report contains outputs from synthetic fixtures
    When the report is rendered
    Then the title and result sections visibly state that the data are synthetic
    And the report contains explicit non-claims
    And no named real city, country, party or population is presented as studied

  Scenario: Fixture leakage fails the release gate
    Given a production build
    When a synthetic fixture is reachable from an empirical publication route
    Then release gate "G-M09" fails
    And deployment is blocked

  Scenario: Successful benchmark does not imply scientific validation
    Given all synthetic acceptance tests pass
    When a capability evaluation is generated
    Then it may claim implementation conformance
    But it may not claim that the real-world causal question has been answered
