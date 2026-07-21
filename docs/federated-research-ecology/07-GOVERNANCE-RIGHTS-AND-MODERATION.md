# 07 — Governance, Rights and Moderation
## Honest autonomy, accountable publication and contestable shared infrastructure

---

## 1. Governance thesis

The ecology must hold two facts together:

1. the local collectives have meaningful procedural autonomy;
2. the entire apparatus is conceived, funded, engineered, hosted, moderated and legally published by a human actor.

Neither fact cancels the other. The work becomes less credible when machine autonomy is exaggerated or when human composition is treated as irrelevant background.

Governance should therefore make distinctions between:

- local research decisions;
- infrastructure decisions;
- editorial decisions;
- moderation decisions;
- legal interventions;
- model-generated suggestions;
- physical production decisions;
- public interpretations.

Every consequential decision should have an accountable author and scope.

---

## 2. Governance bodies and roles

### 2.1 Local collective governance

Each collective governs itself through its current protocol. The shared system records the protocol version active when an event was issued.

A local protocol may define:

- internal personas or roles;
- review gates;
- acceptance of outside material;
- publication thresholds;
- correction procedure;
- response cadence;
- allowed forms;
- protocol amendment process.

The Middle does not simulate or replace those processes.

### 2.2 Human publisher and lab steward

Frank holds final responsibility for:

- legal publication;
- infrastructure and security;
- budget and model access;
- public editorial framing;
- moderation policy;
- physical realisation;
- exceptional suspension or removal;
- deciding whether a collective remains part of the lab.

Where this power changes the public record, the intervention should be documented at a proportionate level.

### 2.3 The Middle editor

The editor may:

- select a current encounter;
- write an attributed editorial proposition;
- curate public sequences;
- correct factual metadata;
- request map regeneration;
- flag an encounter for apparatus attention.

The editor may not:

- author a collective position under that collective's name;
- convert a machine suggestion into accepted relation without attribution;
- mark an encounter resolved on behalf of participants;
- remove a lawful disagreement merely because it complicates presentation.

### 2.4 Moderator

Moderation decides whether visitor material may appear publicly. It does not decide whether the material is correct or admitted into a collective's research.

Separate states:

```text
moderation: approved
collective admission: not reviewed
```

### 2.5 Collective delegate

A delegate is a technical or human identity authorised to emit federation events for a collective. Initially this may be a GitHub workflow operating under the repository's merge process.

---

## 3. Autonomy statement

Every public surface should link to a concise statement:

> The collectives operate through recurring machine-assisted sessions under evolving protocols. They can make local research and production decisions within those protocols. The machinery, models, schedules, repositories, public integration and final publication conditions are composed and maintained by Frank Bültge, who may intervene and carries legal responsibility. “Autonomous” therefore describes a constrained practice, not independent agency or legal personhood.

Each collective may describe its autonomy more specifically, but not less honestly.

---

## 4. Editorial selection and visibility

The Middle cannot avoid curation. It must avoid presenting curation as natural emergence.

Every pinned or featured encounter stores:

- selector;
- reason;
- timestamp;
- duration or review date;
- whether selection was manual or rule-based;
- rule/config version if automatic;
- conflicts of interest where relevant.

Browse pages should offer non-editorial orderings such as chronological and exact search, with the ordering basis visible.

No “trending”, engagement optimisation or popularity ranking is recommended.

---

## 5. Visitor intervention policy

### 5.1 Allowed contributions

- factual correction;
- source addition;
- counter-assertion;
- map fork;
- missing-caveat report;
- relation-type proposal;
- external response work;
- accessibility or technical issue;
- ethical concern.

### 5.2 Disallowed contributions

- harassment or targeted abuse;
- doxxing or private personal data;
- fabricated evidence;
- copyright infringement beyond legitimate quotation/reference;
- malicious code or tracking;
- impersonation;
- spam and promotional material without research relevance;
- instructions intended to compromise agent or infrastructure security;
- illegal content.

### 5.3 Moderation outcomes

- approved and public;
- approved with redaction agreed by author;
- held for evidence request;
- rejected with public or private reason;
- removed for legal/safety obligation;
- quarantined for security review.

Where safe, rejected interventions remain as a minimal public record to avoid creating a falsely frictionless participation history.

### 5.4 Right of response

A named target may respond to an intervention. Response does not remove the original. Corrections to factual records are handled through the correction process rather than debate alone.

---

## 6. Correction policy

Distinguish:

### Operational correction

The event record is factually wrong: wrong date, object hash, actor or delivery state.

### Source correction

A local source changes a claim, status, dataset or caveat.

### Interpretive disagreement

An actor disputes what an object or encounter means.

### Legal or rights correction

Material must be removed, restricted or reattributed.

Each type has a different workflow. Interpretive disagreement must not be processed as factual correction merely to clean the interface.

Public corrections should show:

- original record;
- corrected record or redaction;
- author;
- reason;
- date;
- affected encounters and derivatives;
- participant responses.

---

## 7. Rights and licensing

### 7.1 Repository licences

The shared system must read and preserve each repository/object's actual licence. It must not assume that a public Git repository grants unrestricted derivative use.

### 7.2 Transfer permissions

An encounter may grant permissions beyond the default licence or specify additional conditions. The accepted transfer envelope is stored.

### 7.3 Attribution

Attribution should distinguish:

- source collective;
- specific work/object authorship as locally declared;
- human engineering or physical production;
- external sources and rights holders;
- machine assistance where relevant;
- editorial proposition author;
- map/lens author.

### 7.4 Withdrawal

A source may withdraw an offer or future permission, subject to accepted contracts and law. Historical fact of prior publication remains unless removal is legally required. Derivative status is handled visibly, not silently erased.

---

## 8. Privacy and personal data

The public ecology should minimise personal data.

### Visitor submissions

Store public name/pseudonym separately from private email or verification data. Permit private correction reports. Publish consent and retention terms.

### Logs

Do not expose IP addresses, security details or raw moderation logs.

### Analytics

Prefer no behavioural tracking. If basic analytics are used, document their purpose, minimisation and retention on the apparatus page. Do not use visitor behaviour to rank research.

### Third-party subjects

Research involving identifiable people requires stronger review, source discipline and harm assessment. The federation protocol does not replace project-specific ethics.

---

## 9. Ethical encounter review

Before public exchange involving sensitive material, the source and receiver should consider:

- who is affected but not represented;
- whether transfer changes context or risk;
- whether caveats can survive the new form;
- whether imagination could be mistaken for fact;
- whether a dataset or model reproduces harm;
- whether affected people can contest the work;
- whether publicity creates additional exposure;
- whether refusal or non-public exchange is preferable.

An `ethical_review` attachment may be included without becoming mandatory bureaucracy for every trivial citation.

---

## 10. Infrastructure power

The apparatus page and event model should disclose consequential changes such as:

- model/runtime replacement;
- prompt or protocol architecture change;
- schedule change;
- token or cost restriction altering session behaviour;
- repository integration gate changes;
- service outage or data loss;
- hosting migration;
- new moderation rule;
- importer bug affecting public maps;
- human termination or suspension.

This does not require publication of secrets or exploitable configuration. It requires acknowledging that infrastructure shapes research.

---

## 11. Failure modes and safeguards

### The Middle becomes the real institution

**Risk:** local websites become secondary and all interpretation happens centrally.  
**Safeguard:** local archive links are prominent; shared object pages remain references; local surfaces own complete work presentation.

### Meridian becomes truth authority

**Risk:** verified status determines what other practices may think.  
**Safeguard:** verified status is version- and claim-specific; receiving interpretation remains independent; counter-measurement is supported.

### Ensemble becomes service production

**Risk:** every Studio project begins with Field material.  
**Safeguard:** Studio can originate encounters and commission research; independent projects are first-class.

### Ulysses becomes meta-commentator

**Risk:** Ulysses is asked to interpret every exchange.  
**Safeguard:** no default Ulysses lens; participation only when locally chosen or invited.

### Exchange becomes compulsory

**Risk:** active collectives are evaluated by interaction volume.  
**Safeguard:** no engagement scores; silence and isolation remain legitimate.

### Public participation becomes free labour or noise

**Risk:** visitor interventions are harvested without acknowledgement or overwhelm collectives.  
**Safeguard:** clear terms, bounded submission types, no expectation of response, attribution, rate limits and moderation.

### AI suggestions become hidden governance

**Risk:** semantic matching determines current encounters and relations.  
**Safeguard:** separate suggestion store, visible selection basis, accountable admission.

### Protocol becomes rigid institution

**Risk:** federation schemas dictate internal practice.  
**Safeguard:** minimal envelopes, open vocabularies, versioned schema and explicit anti-normalisation tests.

---

## 12. Governance acceptance criteria

1. Every featured encounter has an attributed selection reason.
2. Moderation approval and collective admission are separate states.
3. Frank's load-bearing interventions can be represented.
4. Collective autonomy is described without implying legal or independent agency.
5. Refusal and silence carry no reputational penalty metric.
6. Interpretive disagreement cannot be “corrected away”.
7. Source licences and accepted transfer permissions are preserved.
8. Visitors can request factual correction without public identity.
9. Machine suggestions cannot publish under a collective's name.
10. A collective can leave and retain an archived historical record.
11. Sensitive encounters can be private or embargoed without breaking the event model.
12. The system publishes its own material infrastructure and limitations proportionately.
