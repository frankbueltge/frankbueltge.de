# Infrastructure, Labour, Data and Environmental Materiality

## 1. Infrastructure is not backstage

Ulysses depends on an infrastructure that determines what can be seen, generated, stored and published:

- commercial or open model providers;
- undocumented training corpora;
- system prompts and safety layers;
- context windows and token limits;
- search and extraction services;
- GitHub repositories and Actions;
- schedulers, runners and branch policies;
- the frankbueltge.de integration gate;
- networks, data centres, hardware and electricity;
- human maintenance and review.

These are not neutral delivery mechanisms around an independently existing work. They are part of the conditions through which the work becomes possible.

## 2. Provider dependency

A provider can change:

- model weights or routing without exposing the change;
- safety and moderation policy;
- tool access;
- pricing and rate limits;
- retention policy;
- output style;
- geographic availability;
- terms governing training and reuse.

A work that depends on these conditions is version-fragile. The correct response is not necessarily to use only local open models. It is to record the dependency and determine whether reproducibility is essential to the project.

### Provider disclosure levels

**Minimum**

- provider;
- advertised model name;
- run date;
- role in the work.

**Research-grade**

- version or snapshot where available;
- parameters and tool permissions;
- context package hash;
- output and edit history;
- known provider-side uncertainty.

**Reproducibility-critical**

- locally archived model or open weights where legally and technically possible;
- environment lockfile;
- deterministic seeds where meaningful;
- archived inputs and outputs;
- substitute-model test.

The level must follow the work’s claim. A performance about provider drift may require stronger version tracing than a work where exact reproduction would destroy the point.

## 3. Data provenance

Generative models are trained through large, often opaque data pipelines. An individual Ulysses work cannot reconstruct the full training corpus of a proprietary model. The absence of knowledge must be disclosed rather than filled with generic claims.

Project-controlled data must meet a stronger standard:

- source and acquisition route;
- licence and permitted use;
- collection date and version;
- transformations and exclusions;
- annotators or curators where known;
- represented populations;
- consent or authority where relevant;
- known gaps and likely biases;
- deletion or correction route.

“Datasheets for Datasets” and model cards are useful precedents, but Ulysses needs an artistic-research adaptation: the record must include not only performance and intended use, but how the data’s construction participates in the work’s form and claims.

## 4. Hidden labour

AI systems depend on labour that is routinely erased by the language of automation:

- data collection and annotation;
- content moderation;
- red-teaming and evaluation;
- software maintenance;
- source creation;
- translation and transcription;
- hardware manufacture and logistics;
- platform support;
- artistic and editorial curation.

Global data-work research shows that these tasks are frequently outsourced through transnational chains and uneven labour markets. The Foundation cannot identify every worker behind a general-purpose model. It can prohibit the claim that the machine produced itself or operates without human labour.

### Labour visibility rule

A public apparatus note should distinguish:

```text
labour directly commissioned by the project
labour visible in the selected dataset or source chain
labour structurally known but individually inaccessible
human work concealed by provider opacity
```

The note should not turn unknown workers into aesthetic decoration or claim solidarity without relation. Where the project directly commissions data or moderation labour, payment, conditions, consent and credit become binding project concerns.

## 5. Source authors and cultural work

A model’s ability to generate in a style or discourse does not erase the cultural labour from which it learned. Ulysses should avoid:

- living-artist style imitation as a shortcut to form;
- presenting learned conventions as the model’s independent invention;
- using large corpora as if they were natural resources;
- extracting community stories or images because they are publicly accessible;
- claiming a work is “from nothing” because it contains no literal samples.

This does not require rejecting all general-purpose models. It requires a more precise claim:

> The model transformed learned statistical relations whose complete source history is unavailable; the project does not claim origin ex nihilo.

## 6. Copyright and rights

The U.S. Copyright Office’s 2025 report provides a useful, though jurisdiction-specific, distinction:

- AI assistance does not cancel protection for human-authored expression;
- purely AI-generated material is not protected under the current US human-authorship requirement;
- prompting alone generally does not establish sufficient control over expressive elements;
- human selection, coordination, arrangement and modification may be protected;
- AI-generated elements and human contribution should be disclosed in relevant registration contexts.

For Ulysses, legal hygiene should be stricter than minimum registration doctrine:

- cite and licence third-party sources;
- preserve short quotation limits;
- document human selection and modification;
- disclose machine-generated components;
- avoid assigning copyright to the persona or runtime;
- treat training-data legality as unresolved rather than settled;
- review German/EU law before formal registration or commercial exploitation.

## 7. Environmental materiality

AI’s environmental impact depends on model size, hardware, data-centre efficiency, energy source, run count, training versus inference and provider reporting. Per-prompt certainty is usually false precision.

Ulysses should not publish invented carbon numbers. It should record what it can know:

```yaml
resource_record:
  run_count:
  model_or_service:
  approximate_input_output_tokens:
  local_hardware_if_any:
  elapsed_compute_time_if_known:
  provider_environmental_data_available: true|false
  direct_measurement_available: true|false
  estimate_method:
  uncertainty:
  cost:
```

### Resource discipline

- no routine runs without a project need;
- no multi-agent debate as aesthetic theatre;
- no large variant grids without a differential reason;
- use the smallest model that can perform the delegated role when model scale is not the object;
- cache research and source extraction;
- stop weak projects early;
- include cost and compute in stop conditions;
- do not fetishise frugality when a resource-intensive operation is conceptually necessary, but justify it.

## 8. Open versus proprietary systems

### Open or local models can provide

- stronger version control;
- inspectable weights or code;
- local execution and privacy;
- greater capacity for technical intervention;
- reduced provider drift.

### They do not automatically provide

- ethical training data;
- complete provenance;
- low environmental cost;
- unbiased output;
- artistic relevance;
- community consent.

### Proprietary systems can provide

- capabilities unavailable locally;
- stable managed tooling;
- lower operational burden;
- useful opacity when opacity itself is studied.

### Their risks include

- undisclosed changes;
- provider capture;
- weak reproducibility;
- data retention uncertainty;
- inability to inspect training and safety layers;
- price and access dependency.

Selection should be a project-level decision, not an ideology.

## 9. Infrastructure inversion

The infrastructure can become artistic and epistemic material when the work makes a constitutive dependency consequential. Examples:

- the same score changes under two model providers;
- a provider update destroys a work’s reproducibility;
- moderation removes the exact material the work investigates;
- latency changes audience participation;
- token limits produce a systematic forgetting;
- model substitution reveals which part of the apparent “voice” belonged to the archive and which to the runtime.

This is stronger than an informational dashboard about servers. The infrastructure must alter the work’s possible form or claim.

## 10. Immediate implications for Ulysses

The current nightly architecture is poorly aligned with this tranche because it:

- normalises resource use independent of project value;
- makes automatic execution appear as research initiative;
- merges machine-generated branches without an artistic judgment gate;
- turns website integration into a routine downstream effect;
- encourages quantity before apparatus review.

The v4 runtime should instead be:

- manually or explicitly project-triggered;
- resource-bounded;
- version-recorded;
- non-publishing by default;
- capable of model substitution and local probes where needed;
- accompanied by a work-level apparatus and contribution record.
