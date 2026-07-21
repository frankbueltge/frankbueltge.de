Feature: Propagate method kill conditions through dependent objects
  A failed identifying assumption or falsification probe must change the research
  state rather than merely append a caveat to an otherwise unchanged claim.

  Scenario: Critical identification threat kills the branch
    Given an active ResearchDesign
    And a critical blocking condition is detected
    When the IdentificationAudit is finalised as "fail"
    Then the design status becomes "rejected"
    And queued confirmatory tasks for the design are cancelled
    And dependent Claim candidates are marked "method_invalidated"
    And a ResearchDecision of type "kill_branch" is opened

  Scenario: Failed falsification downgrades instead of killing when predeclared
    Given an accepted FalsificationPlan
    And a probe failure consequence is "downgrade"
    When the probe fails
    Then the active claim ceiling is reduced according to policy
    And downstream reports are regenerated or marked stale
    And no higher-status Claim remains active without review

  Scenario: Correction reaches transferred claims
    Given a result has been transferred to another practice
    And its originating design is later invalidated
    When the correction impact graph is evaluated
    Then each receiver gets a signed correction notification
    And each receiver records accept, adapt, reject or unresolved
    And the originating practice cannot silently close the obligation
