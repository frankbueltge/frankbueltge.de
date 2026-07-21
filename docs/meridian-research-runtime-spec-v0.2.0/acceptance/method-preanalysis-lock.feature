Feature: Lock confirmatory plans before outcome analysis
  A confirmatory execution must be tied to an immutable PreAnalysisPlan revision.

  Scenario: Confirmatory run is blocked for a draft plan
    Given a PreAnalysisPlan with status "draft"
    When a confirmatory TaskBundle is requested
    Then task issuance is rejected with error "PREANALYSIS_PLAN_NOT_LOCKED"
    And no executable task is signed

  Scenario: Locking creates a content-addressed immutable revision
    Given a reviewed PreAnalysisPlan
    When an authorised steward locks the plan
    Then status becomes "locked"
    And locked_at is recorded
    And lock_hash equals the canonical content hash of the locked payload
    And later mutation of the revision is rejected

  Scenario: Amendment preserves the original locked plan
    Given a locked PreAnalysisPlan revision 1
    When a justified amendment is approved before execution
    Then revision 1 remains readable and unchanged
    And revision 2 has status "amended"
    And revision 2 references the amendment rationale and timing
    And reports distinguish analyses under revision 1 from analyses under revision 2

  Scenario: Exploratory analysis remains explicitly exploratory
    Given an unlocked exploratory branch
    When the branch is executed
    Then all generated Claim candidates carry exploratory provenance
    And they cannot be projected as preregistered or confirmatory
