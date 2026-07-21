Feature: Enforce the causal claim ceiling
  The Research Method Kernel must prevent a result from claiming more than its
  design and IdentificationAudit permit.

  Background:
    Given a causal observational project exists
    And its ResearchDesign has been schema validated
    And its IdentificationAudit is immutable after acceptance

  Scenario: Downgraded audit blocks causal promotion
    Given the IdentificationAudit decision is "downgrade"
    And its claim ceiling is "associational_adjusted"
    When an executor proposes a Claim with causal status
    Then the command is rejected with error "METHOD_CLAIM_CEILING_EXCEEDED"
    And no causal Claim revision is persisted
    And an audit event records the attempted promotion

  Scenario: A bounded causal claim requires every configured gate
    Given the IdentificationAudit decision is "pass"
    And its claim ceiling is "causal_bounded"
    And the PreAnalysisPlan is locked
    And the FalsificationPlan is complete
    And independent replication is concordant
    When a verifier promotes the Claim within the accepted GeneralizationMap
    Then the causal Claim revision is accepted
    And the Claim references the exact audit, plan, falsification and replication revisions

  Scenario: Descriptive output cannot be silently relabelled causal
    Given a completed design with claim ceiling "descriptive"
    When a report projection uses causal language for the result
    Then projection generation fails closed
    And the violation identifies the originating Claim and sentence
