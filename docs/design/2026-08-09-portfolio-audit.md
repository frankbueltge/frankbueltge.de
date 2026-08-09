# Portfolio audit — provable value, uniqueness, and the GCP question

**Date:** 2026-08-09 (UTC). **Ordered by:** Frank, night session 2026-08-09 (two directives:
the USP obligation applied to the whole portfolio, and a per-project check of GCP potential —
"ML and other services where they create real value, never as an end in themselves").
**Status: REVIEW DOCUMENT — recommendations only.** Nothing is archived, deleted or rebuilt
by this session. Frank decides per item: keep / rework / archive. The one proposed text
change (CLAUDE.md, §7) is a proposal, not executed.

## 1. Scope, and what this builds on

Three documents from the same night precede this one and are **incorporated by reference,
not re-done**:

- `docs/audits/2026-08-09-usp-audit.md` — neighbor research for all 16 `/holdings`
  experiments, with cited sources. Its verdicts are carried into the table below unchanged.
- `docs/design/2026-08-09-usp-rework-program.md` — Frank's decision ("build out, never
  archive") with per-experiment target USPs. Where it already answers "rework how?", this
  audit does not repeat the answer.
- `machine-attention/docs/2026-08-09-dark-ocean-v0.md` — the Dark Ocean V0 build record,
  including the GCP note this audit was asked to expand.

**What this document adds** — the scopes the 01:55 audit did not cover:

1. **Dark Ocean V0** (built the same night, after the audit ran) — fresh neighbor research.
2. **The three practices as work-lines** (Ulysses, Meridian, Ensemble) and the **ecology
   as a whole** — the festival line's claim ("no comparable project delivers this depth")
   stress-tested against 2024–2026 neighbors, including the severed-readers method.
3. **The GCP dimension for every project** — concrete service, concrete benefit,
   license/trace caveat — plus the proposed change to the "Kein GCP" line (§7).

**Coordination note.** A parallel session is executing the rework program (Phase 1,
starting with the Consensus syndication layer) and touches site pages and pipelines; the
Phase 0 cloud agent (neighbor citations on all 16 pages) has a PR pending review. This
session therefore delivers exactly one new file — this document — and touches nothing else.

## 2. Method

For each newly audited subject: 4–8 adversarial web searches hunting the **strongest**
neighbors worldwide (projects, papers, tools, platforms) — the ones that would embarrass
the claim, not flatter it. Sources cited with URLs. Verdict vocabulary as in the 01:55
audit: **UNIQUE (provisional)** / **ADDED VALUE** (with the daylight named) / **REDUNDANT**
(with the owner of the territory named). GCP facts (datasets, terms, free tiers, trace
capability) verified against primary sources, mostly Google's own documentation.

## 3. Verdict table — the whole portfolio

Verdicts for #1–16 are the 01:55 audit's, unchanged; ★ marks subjects newly audited here.

| # | Subject | Verdict | GCP chance |
|---|---|---|---|
| 1 | The Consensus | ADDED VALUE (thin) | **BigQuery GDELT** — historical syndication baselines (§6.1) |
| 2 | Iceberg Theory | REDUNDANT-leaning | BigQuery Wikipedia pageviews — attention asymmetry layer (§6.2) |
| 3 | The Society | UNIQUE (provisional) | none — browser-native is the point |
| 4 | Machine Attention / The Foreknown | ADDED VALUE (narrower than framed) | none for V-now; Cloud Run only if feed volume grows (§6.6) |
| 5 | Observatory | REDUNDANT on mission / ADDED VALUE on method | **BigQuery GDELT** — the TED×GDELT news-shadow join (§6.1) |
| 6 | The Protocol | ADDED VALUE (form-driven) | none — deterministic/no-cloud is the claim |
| 7 | The Policy | REDUNDANT | none decisive — cat-bond data is not in GCP |
| 8 | Editorial Deadline | REDUNDANT | none |
| 9 | The Ghost Fleet | REDUNDANT (most severe) | **BigQuery GIS** — MPA/sanctions spatial joins for the compound-finding rework (§6.3) |
| 10 | Headroom | ADDED VALUE (weak/borderline) | none |
| 11 | Round Numbers | REDUNDANT | none |
| 12 | Delve / Tell | REDUNDANT (clearest case) | corpus check §6.4 — realistic path is Europe PMC, not BigQuery |
| 13 | Bycatch | ADDED VALUE (narrow) | none — real-browser vantage cannot move to cloud |
| 14 | The Correction | REDUNDANT (weak added value) | none — ALFRED/Fed APIs suffice |
| 15 | Patterns | REDUNDANT | none |
| 16 | Watchtower | ADDED VALUE (genuine but narrow) | none — client-side SGP4 is the privacy claim |
| 17★ | Dark Ocean V0 | ADDED VALUE (the notarial act, not the counts) | **Earth Engine S1_GRD** for the V1 detection path (§6.5) |
| 18★ | Ulysses (work-line) | ADDED VALUE (citation-warrant discipline; model-collapse trilogy has artistic white space) | arXiv corpus on GCS for larger readings (§6.4, minor) |
| 19★ | Meridian (work-line) | ADDED VALUE (synthesis claim, conditional on receiver uptake) | **BigQuery GDELT** for instrument baselines (§6.1) |
| 20★ | Ensemble (work-line) | UNIQUE (provisional — the honesty tiers only) | none — C2PA-anchoring is a signing question, not cloud |
| 21★ | Severed readers (method) | ADDED VALUE (the discipline, not the discovery) | none |
| 22★ | The ecology as a whole | ADDED VALUE (the bundle — argued as composition, against the 2025–26 cohort) | n/a (per-project below) |

## 4. Dark Ocean V0 — the new audit (★17)

**(a) Claim under audit.** Nightly, keyless: preserve CDSE catalog rows of all Sentinel-1
GRD acquisitions over the Baltic box with the publisher's own checksums (BLAKE3/MD5),
footprints, EvictionDate — never the scene bytes — against a Digitraffic AIS sample as
per-bin counts, never identities. Per bin: observed-and-declared / observed-silent-in-sample /
declared-unobserved — "statements about the overlap of two committed registers, never about
hidden ships." Independent re-computation by a second implementation (`verify.py`).

**(b) Nearest neighbors (strongest first).**

- [Global Fishing Watch — SAR vessel detections + published S1 footprints (Paolo et al. 2024, *Nature*)](https://www.nature.com/articles/s41586-023-06825-8) — via the [Data Download Portal](https://globalfishingwatch.org/platform-update/2024-may-data-download-portal-new-dataset-released-featuring-vessel-detections-from-sentinel-1-sar/), GFW distributes S1 detections 2017→(~5 days ago) **including image-footprint polygons and 0.005° overpass rasters**, plus whether each detection broadcast AIS. Both sides of Dark Ocean's overlap exist there as a continuously updated public dataset — and it goes further, to detection.
- [Skylight (Ai2)](https://support.skylight.global/en_US/satellite-radar) — free, near-real-time, 100% of S1/S2 EEZ coverage, public map with 18 months of history, open-sourced detection models, daily dark-vessel flags.
- [ESA Sentinel-1 Observation Scenario / acquisition-plan archive](https://sentinels.copernicus.eu/copernicus/sentinel-1/acquisition-plans) — the publisher itself already publishes "the act of looking" (KML plans archived to 2015, with community harvesters on GitHub).
- [Welch et al. 2022, "Hot spots of unseen fishing vessels" (*Science Advances*)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9629714/) — the canonical academic AIS-gap register, explicitly conditioned on observability; [code public](https://github.com/GlobalFishingWatch/AIS-disabling-high-seas). Closest existing "declared vs observable" epistemics, though for AIS reception, not SAR coverage.
- [FormerLab shadow-fleet-tracker-light](https://github.com/FormerLab/shadow-fleet-tracker-light) — open-source Baltic shadow-fleet tracker, watchlist/identity-based — the exact opposite of identity-free bin counts.
- [SkyTruth Cerulean](https://skytruth.org/cerulean) — continuous public register derived from S1 GRD (oil slicks + AIS-off candidate sources), free map, API, published methods.
- [Windward Baltic AIS-gap analytics](https://windward.ai/blog/why-maritime-visibility-now-depends-on-remote-sensing-intelligence) (commercial; 16,000+ Russia-linked gaps per [ACLED](https://acleddata.com/report/russias-shadow-fleet-presents-sustained-hybrid-war-threat-sea)) and [Follow the Money's shadow-fleet series](https://www.ftm.eu/articles/switching-ais-off-shadow-fleet-going-even-darker).
- [HELCOM AIS density maps](https://metadata.helcom.fi/geonetwork/srv/api/records/2558244b-0cea-46e9-8053-af6ef5d01853) — the institutional Baltic "declared register" (all AIS since 2005) — annual, no coverage side.
- [OpenTimestamps × Internet Archive](https://petertodd.org/2017/carbon-dating-the-internet-archive-with-opentimestamps) — precedent for notarizing an archive's hashes at scale; never findably applied to an EO catalog.

**(c) Not found anywhere** (angles checked: GFW datasets, ESA scenario archives,
Skylight/Starboard/Windward, AIS-gap and SAR-AIS fusion literature, OpenTimestamps-on-EO,
C2PA/satellite-provenance work, STAC/CDSE preservation, Baltic registers, git-scraping
practice): (1) a continuous public register crossing per-day SAR **catalog** coverage with
AIS declarations **while refusing detection** — every operational neighbor jumps to
detections or identities; nobody publishes the three-way contingency as a statement about
two registers; (2) anyone notarizing the **publisher's own checksums** against catalog
eviction (C2PA-for-EO is discussed as a future need in the evidentiary literature; no
operational instance); (3) independent second-implementation verification as a design
requirement of such a register; (4) any Baltic **daily** coverage-vs-declaration product —
existing Baltic monitoring is watchlist-based, commercial, annual, campaign-based, or
classified (Baltic Sentry, Nordic Warden).

**(d) Verdict: ADDED VALUE — not UNIQUE without qualification.** Taken as measurements of
maritime reality, V0's per-bin overlap statistics are a degraded subset of what GFW already
publishes. The daylight is the **notarial act**: the publisher's own checksummed catalog
claims, preserved daily, keylessly, append-only, against a rolling archive that evicts —
with a second implementation verifying, and the disciplined refusal to claim detection.
That refusal is a real epistemic gap, but a narrow ledge: read as a dark-ship instrument,
V0 collapses into GFW's shadow and loses.

**(e) Positioning consequence.** Name GFW and Skylight in the method sheet ("they tell you
about ships; this notarizes the act of looking — the catalog rows ESA will evict, under
ESA's own checksums"). Consider anchoring each daily commit with OpenTimestamps — a bare
git history is a weak evidentiary claim; a Bitcoin-anchored hash of the publisher's
checksums would be the strongest version of the one thing nobody else does. Keep the
overlap counts framed strictly as a demonstration of what two registers can jointly say.
V1 (detection) enters occupied territory knowingly and will need its own, different USP.

## 5. The practices and the ecology — new audits (★18–22)

These audit the practices as **work-lines** (their v2 remits and flagship works), not each
of their ~40 individual works — the level at which the 2026-09-05 reading will judge them.

### 5.1 Ulysses / The Atelier — the warrant of numbers (★18)

**(a) Claim under audit.** Machine-run artistic research in bounded projects; v2 remit "the
warrant of numbers" — where a figure that governs a decision came from, whether the
document that licensed it still travels, what breaks when it does not. Flagships: the
590-paper corpus reading with per-citation accountability (RUWE), the model-collapse
trilogy, 13 bounded projects with failures on the record.

**(b) Nearest neighbors (strongest first).**

- [Knowing Machines — "Models All the Way Down"](https://knowingmachines.org/models-all-the-way) (Buschek & Thorp, with Der SPIEGEL) — **a direct hit on the remit**: a public visual investigation tracing how one governing number (the CLIP similarity threshold 0.26–0.28) decided what 5.8 billion image-text pairs an AI would learn from — where a figure came from and what breaks downstream, made by a Pulitzer-winning data journalist with published [methods](https://knowingmachines.org/critical-field-guide). Human-made and episodic, not a standing machine practice with per-citation git accountability.
- [Calculating Empires (Crawford & Joler)](https://ars.electronica.art/starts-prize/en/calculating-empires/) — genealogy-of-technology-and-power as artistic research, S+T+ARTS Grand Prize, [Venice 2025 Silver Lion](https://www.labiennale.org/en/architecture/2025/artificial/calculating-empires-genealogy-technology-and-power-1500). The festival lane Frank targets already has heavyweight incumbents on the theme.
- [scite.ai](https://scite.ai/) — per-citation accountability at industrial scale: 880M+ citation statements classified supporting/contrasting/mentioning ([peer-reviewed](https://direct.mit.edu/qss/article/2/3/882/102990/scite-A-smart-citation-index-that-displays-the)). The mechanism is not novel; only its use inside an artistic-research practice with a committed archive could be.
- [FutureHouse PaperQA2/WikiCrow](https://www.futurehouse.org/research-announcements/wikicrow) — open-source superhuman literature synthesis including contradiction detection ([paper](https://arxiv.org/html/2409.13740v1)). A 590-paper reading is within what these tools do daily.
- [Sakana AI Scientist](https://sakana.ai/ai-scientist-nature) / [Zochi](https://casrai.org/news/fully-ai-generated-papers-passing-peer-review-zochi-sakana) — machine-run research passes real peer review now. **Ulysses' best foil:** Sakana's own writeup admits ["embarrassing" citation errors](https://techcrunch.com/2025/03/12/sakana-claims-its-ai-paper-passed-peer-review-but-its-a-bit-more-nuanced-than-that), and hallucinated-citation rates rose ~9× in 2025 ([analysis](https://blog.pebblous.ai/report/ai-science-new-era/en)) — machine research exists at scale; machine research *with warranted citations* mostly does not.
- [Rekdal, "Academic urban legends"](https://journals.sagepub.com/doi/10.1177/0306312714535679) (2014) — the scholarly antecedent for "does the licensing document still travel" (the spinach-iron citation chain). The question has a bibliography.
- Model collapse: scientifically saturated ([Shumailov et al., *Nature* 2024](https://www.researchgate.net/publication/382526401_AI_models_collapse_when_trained_on_recursively_generated_data)) but a targeted search found **no prominent existing artwork** on it — genuine white space for the trilogy.

**(c) Verdict: ADDED VALUE.** Every mechanism is separately occupied: per-citation
accountability (scite), machine synthesis with contradiction detection (PaperQA2),
machine-run research under real review (Sakana/Zochi), genealogy-of-numbers as
festival-grade artistic research (Knowing Machines, Calculating Empires — the latter
holding the very prizes Frank aims at). The honest USP is narrower and stronger than the
current framing: **a machine practice whose citation-level judgments are themselves
committed, checkable artifacts** — precisely the discipline the Sakana/Zochi wave visibly
lacks. "No comparable project" is false; "no neighbor combines machine authorship with
warranted citations in a public archive" survived this research.

**(d) Positioning consequence.** Cite Knowing Machines and Calculating Empires on
`/atelier` as the human-made incumbents of the theme; position against the Sakana/Zochi
wave by the citation-warrant discipline (their weakness is documented and citable). Push
the model-collapse trilogy — it holds the clearest artistic white space in this practice.

### 5.2 Meridian / The Field — counter-measurement (★19)

**(a) Claim under audit.** v2 remit: "measure what power leaves unmeasured, checkably" —
continuous instruments (The Consensus, 42+ days daily) + FA-form investigations ending in
an artifact a named outside receiver can use (016 "Coverage Is Not Custody", delivered to
Forensic Architecture and the Internet Archive; a preregistered null over 338,151 arXiv
abstracts). Methods: preregistration, blocking Interlocutor, claims ledger, dated
corrections, append-only archive.

**(b) Nearest neighbors (strongest first).**

- [Forensic Architecture](https://en.wikipedia.org/wiki/Forensic_Architecture) — the most embarrassing neighbor: "counter-forensics" *is* Meridian's remit, stated first and better — 76+ investigations in 45 countries, artifacts used by courts, Amnesty, the UN, and a published ["open verification" methodology](https://www.e-flux.com/architecture/becoming-digital/248062/open-verification). Meridian delivering 016 *to* FA concedes the hierarchy. FA lacks: machine-run operation, continuous daily instruments, preregistration formalism.
- [OONI](https://ooni.org/about/data-policy) — continuous adversarial measurement of power since 2012, 2B+ measurements from 241 countries, real-time public archive explicitly framed for third-party verification. The incumbent for continuous+archive at a scale that makes 42 days look like a pilot. Not machine-run; no preregistration or internal adversarial gate.
- [Hamilton 68](https://www.cjr.org/covering_the_election/how-politics-broke-content-moderation-hamilton-68-elon-musk.php) — direct prior art for The Consensus (near-real-time dashboard of orchestrated narrative amplification, 2017) **and** the cautionary tale: its account selection was ["deeply flawed"](https://www.businessinsider.com/what-is-hamilton-68-russian-online-influence-tracker-2023-2) and it collapsed reputationally. The strongest argument *for* Meridian's evidence discipline comes from this failure.
- [GDELT](https://www.gdeltproject.org) / [Media Cloud](https://www.mediacloud.org) — machine-run continuous daily news measurement is a solved, decade-old open-infrastructure problem (GDELT: 100+ languages every 15 minutes). Neither does counter-measurement framing, preregistration, or adversarial review.
- [The Markup — Citizen Browser](https://themarkup.org/citizen-browser) / [AlgorithmWatch](https://algorithmwatch.org/en/instagram-research-shut-down-by-facebook) — continuous adversarial instruments against platform opacity, run against active resistance; human-run.
- [Intology's Zochi](https://intology.ai/about) / [Sakana AI Scientist](https://arxiv.org/html/2502.14297v2) / [FutureHouse](https://www.futurehouse.org/research-announcements/launching-futurehouse-platform-ai-agents) — the machine-run-research cell is crowded, and Zochi holds a validation trophy Meridian lacks: a fully AI-generated paper [accepted to the ACL 2025 main track](https://www.intology.ai/blog/zochi-acl) — external hostile peer review, not a self-appointed Interlocutor. All episodic paper factories; none run continuous public instruments or counter-power measurement.
- Counterdata as a named field — [counter-mapping/statactivism literature](https://www.countercartographies.org/wp-content/files/Dalton_counter-mapping_data_science.pdf), [Data & Society "counterdata"](https://datasociety.net/wp-content/uploads/2024/04/Keywords_Counterdata_Olojo_04242024.pdf), [Mimi Onuoha's Library of Missing Datasets](https://www.mimionuoha.com) (in ZKM's collection) — "measure what power leaves unmeasured" is a theorized, decade-old field. Meridian did not invent the framing; at best it mechanizes it.
- [Adversarial Collaboration Project](https://penntoday.upenn.edu/news/pursuit-scientific-truth-adversarial-collaboration-Tetlock-Clark) / [Registered Reports](https://en.wikipedia.org/wiki/Registered_report) — every methodological component Meridian cites is institutionalized mainstream science reform. The components confer credibility, not uniqueness.

**(c) Verdict: ADDED VALUE.** No single neighbor combines machine-run + continuous daily
instrument + preregistration/adversarial gate + append-only public archive +
counter-measurement framing — the intersection is defensibly unoccupied. But every
individual component has an incumbent doing it bigger, longer, or with stronger external
validation (OONI's 12 years vs 42 days; FA's court-tested artifacts vs one packet delivered
to FA itself; Zochi's hostile ACL review vs a self-run Interlocutor), and the framing is
borrowed from a named field. The honest USP is a **synthesis claim, not a capability
claim**: "the first machine-run practice to submit itself to preregistration/adversarial/
archive discipline while doing counterdata work" — and it survives only if the instruments
outlive pilot length and named receivers demonstrably *use* the artifacts. UNIQUE is not
claimable; REDUNDANT is unfair.

**(d) Positioning consequence.** Cite FA, OONI and the counterdata field on `/field` as
the tradition this mechanizes (per the house's own checkability ethic). Treat Hamilton 68
as the named cautionary tale the evidence-track discipline answers. The 2026-09-05
condition "artifact usable by the named receiver" is exactly the right test — receiver
uptake is what converts the synthesis claim into a capability claim.

### 5.3 Ensemble / The Studio — honesty-tier art (★20)

**(a) Claim under audit.** Autonomous machine artist collective "under no label"; every
element carries an honesty tier (verified / sourced / imagined); concept gate with named
outside receiver; ship gate with machine-advantage bar; committed session logs; flagship
NO PART (built 8.42 m wall work, delivery packet to MacArthur Justice Center).

**(b) Nearest neighbors (strongest first).**

- [Botto](https://botto.com) — the dominant incumbent for "autonomous artist with gates": continuous since October 2021, ~20,000 images/week, community gate of 15,000+ voters, [S+T+ARTS Prize at Ars Electronica](https://ars.electronica.art/starts-prize/en/botto), millions in sales. Owns the autonomous-artist narrative institutionally. Lacks: honesty tiers, epistemic labeling, data-claim works, named receivers — its gate optimizes **taste, not truth**.
- [Forensic Architecture (as art)](https://en.wikipedia.org/wiki/Forensic_Architecture) and [Crawford & Joler](https://knowingmachines.org/publications/calculating-empires/essays/fondazione-prada-presents-calculating-empires) — "every element checkable" in exhibited art is already museum-canon at the highest level (documenta, Turner nomination; MoMA, V&A). Ensemble's delivery packet to a named justice receiver is FA's model verbatim. Human-made; no tier vocabulary; no autonomous sessions.
- [C2PA Content Credentials](https://contentauthenticity.org/how-it-works) — per-element cryptographic provenance labeling is an industry standard with 6,000+ member orgs and regulatory force ([EU AI Act Art. 50, applying since 2026-08-02](https://medium.com/@jdcruel/what-the-c2pas-new-content-credentials-guide-asks-your-pipeline-to-do-69a1c86f6ac3)). The distinction survives, barely: C2PA labels *process provenance* (what tool made this), not *epistemic status* (is this claim true, sourced, or invented) — but any reviewer will ask why the tiers aren't C2PA-anchored.
- Platform disclosure regimes ([DeviantArt](https://www.deviantart.com/team/journal/New-Label-Requirement-for-AI-Artwork-966421077), [Etsy 2026](https://iscompliant.app/Blog/etsy-ai-art-disclosure)) — AI-content labeling is commodity marketplace compliance now; disclosure per se is worthless as a USP.
- [AARON (Harold Cohen)](https://en.wikipedia.org/wiki/AARON) — five decades of "machine makes art in ongoing sessions" (Tate, SFMOMA). The autonomy itself carries no novelty weight.
- [Truth Terminal](https://www.wired.com/story/truth-terminal-goatse-crypto-millionaire) — vastly more cultural reach, and the honest counterexample: [semi-autonomous with a human censor](https://www.coindesk.com/tech/2024/12/10/the-truth-terminal-ai-crypto-s-weird-future), no verification apparatus — spectacle-of-autonomy rather than accountable autonomy.
- [Refik Anadol](https://www.newyorker.com/culture/persons-of-interest/refik-anadol-the-art-worlds-happy-warrior-for-ai) — owns "data art at machine scale" institutionally; the public critique against him ([Saltz](https://news.artnet.com/art-world-archives/refik-anadol-vs-jerry-saltz-2400275)) proves real appetite for the verification-over-spectacle position — but a gap in the market is not evidence the market wants it filled.

**(c) Verdict: UNIQUE (provisional) — narrowly, on the tier system only.** No art practice
was found that publicly labels every element of every work verified/sourced/imagined and
archives checkable session logs. The closest neighbors label provenance (C2PA), source
everything without a tier vocabulary (FA, Crawford/Joler), or gate taste rather than truth
(Botto). Everything around the tiers is occupied. Brutal bottom line: Ensemble's uniqueness
lives entirely in an **accountability apparatus**, and an apparatus is only a USP if
receivers and institutions verifiably use it — one delivered wall work does not yet show
that. ADDED VALUE, not unique, on everything else.

**(d) Positioning consequence.** State the claim exactly that narrowly on `/studio`. Name
Botto and AARON as the autonomy incumbents and C2PA as the provenance standard the tiers
deliberately exceed (epistemic status, not process provenance) — and examine C2PA-anchoring
the tiers as a build (§6 GCP is not needed for that; it is a signing-pipeline question).
The v2 line ("only what a machine does better, experienceable in the work") answers
AARON/Botto only if the bar is enforced visibly per work.

### 5.4 The severed readers — the method audited on its own (★21)

**(a) Claim under audit.** Pre-registered blind reception panels: cold readers evaluate
works with provenance stripped, verdicts committed before reveal; a record of catching what
staged panels missed (e.g. the 25-cold-reader étude: 25/25 elected the machine as author).

**(b) Nearest neighbors (strongest first).**

- [Porter & Machery, *Scientific Reports* 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11564748) — the étude's headline result already exists at N=16,340: non-experts could not distinguish AI poems (46.6%, below chance), judged AI poems *more* human, rated them higher ([Guardian](https://www.theguardian.com/books/2024/nov/18/ai-poetry-rated-better-than-poems-written-by-humans-study-shows)). "Cold readers elect the machine" is a documented, replicated phenomenon, not a discovery.
- [Astral Codex Ten — AI Art Turing Test](https://www.astralcodexten.com/p/how-did-you-do-on-the-ai-art-turing) — ~11,000 participants, median 60% accuracy, full answer key published: a public, self-run blind reception experiment operated as culture rather than academia.
- Preregistered label-bias experiments ([Horton et al., N=1,708, preregistered](https://www.sciencedirect.com/science/article/pii/S0747563223000584); [Messingschlager & Appel](https://journals.sagepub.com/doi/full/10.1177/14614448231200248)) — preregistration + provenance-blinding is *standard method* in empirical aesthetics.
- [Elgammal's AICAN](https://arxiv.org/pdf/2102.09109) — GAN works exhibited with origin undisclosed from 2017; blind reception in actual galleries predates the practice by nearly a decade.
- [AuthorAgent "Synthetic Reader Panels"](https://github.com/Ckokoski/AuthorAgent) — machine cold-reader panels are a commodity product feature now.

**(c) Verdict: ADDED VALUE (method-discipline); findings-level REDUNDANT.** Nothing found
matches the specific practice — a standing art practice that pre-registers blind panels on
*its own* works as an internal gate, commits verdicts publicly before reveal, and treats
staged-vs-cold divergence as a finding. That gap is real. But every component is commodity,
and the headline result is replicated at N=16k. **The 25/25 étude must never be presented
as evidence about the world — the world already knows — only as evidence about this
practice's honesty apparatus catching what its staged panels missed. Claim the discipline,
not the discovery.**

### 5.5 The ecology as a whole (★22)

**(a) Claim under audit.** The festival line's thesis (2026-08-01): "Verifiability as an
aesthetic principle: machine research practices whose authorship, failures and dissent can
be checked in a public archive — not asserted," plus the review's claim that no comparable
project (Botto, Ai-Da, Herndon/Dryhurst) delivers this depth.

**(b) Nearest neighbors (strongest first).**

- [AI Village / Agent Village (Sage, AI Digest)](https://theaidigest.org/village/blog/introducing-the-agent-village) — **the most embarrassing neighbor found.** Since April 2025: multiple *named* frontier agents, 320+ days of open-ended goals, fully public live-streamed sessions, seasons, agents welcomed and *retired* (kill discipline in effect), dozens of self-built repos, a [machine-readable public event log on GitHub](https://github.com/ai-village-agents/village-event-log), an operations handbook ([2025 retrospective](https://theaidigest.org/village/blog/what-we-learned-2025); [TIME coverage](https://time.com/7330795/ai-village-chatgpt-gemini-claude/)). Lacks: authored constitutions, honesty tiers, dissent-preservation as archival value, artistic-research framing. But "multiple named machine practices, publicly checkable, long-running, git-archived" is **no longer unclaimed territory**.
- [Botto's 2025 roadmap](https://botto.com/dao/digest/2025-the-road-ahead) — the "sanctification of the genesis protocol" is constitution-thinking; all decisions flow through recorded on-chain governance. No git archive of reasoning, no tiers, one practice not a federation.
- [terra0](https://terra0.org/) / [Plantoid](https://plantoid.org/) — the oldest "written charter, publicly auditable, machine-executed" artworks (2015/2016), terra0's DAO-managed woodland active as of Dec 2025. Charter + auditability as the artwork's core; no research practice, no publication gate.
- [Herndon & Dryhurst — Starmirror (KW Berlin 2025/26)](https://www.kw-berlin.de/en/exhibitions/holly-herndon-and-mat-dryhurst-starmirror) — they now state outright that they treat ["protocols themselves as a medium"](https://www.sleek-mag.com/article/who-shapes-culture-mat-dryhurst-on-ai-protocols-and-the-future-of-art/), with institutional reach the ecology does not have. Human-led, no checkable practice archive.
- [Truth Collective Foundation](https://www.truthcollective.foundation) — semi-autonomous agent under an explicit stewardship container (≈ a human gate); its archive is exhaust, not warrant.
- Token-funded autonomous artist agents 2024–26 ([Zerebro](https://solanacompass.com/projects/zerebro), [Keke](https://kekeai.art/), Luna/Virtuals; [survey](https://evoailabs.medium.com/ai-agents-art-top-ai-agents-redefining-the-art-world-8665c0181520)) — crowd the "autonomous machine artist" label with zero verifiability apparatus; most die within 12 months.
- [Gamferno/agent-constitution](https://github.com/Gamferno/agent-constitution) — tiny existence proof that "constitution + gated integration in a public git repo" exists as a pattern outside art.
- [Ai-Da](https://san.com/cc/ai-humanoid-robot-artists-alan-turing-painting-sells-for-over-1m) — institutional appetite proven ($1.08M Sotheby's); on every claimed differentiator a non-neighbor.

**(c) Verdict: ADDED VALUE.** "No comparable project delivers this depth" survives only as
a claim about the **bundle**, not the parts — and the 2026-08-01 review benchmarked against
the wrong cohort. The 2025–26 cohort that actually stresses the claim is AI Village
(checkable multi-agent practice), the Sakana/Zochi wave (machine research under real
review), and Knowing Machines/Calculating Empires (festival-grade genealogy-of-numbers).
What no found neighbor combines: authored constitutions per practice + honesty tiers +
dissent preserved as archival value + a human ship-gate framed as aesthetic principle +
git-checkability. That composition is defensible — but **it must be argued as a
composition**, and any site copy implying nobody runs checkable machine collectives in
public is now falsifiable in one search.

**(d) Positioning consequence — feeds the festival submissions directly.** The DARC
application (due 2026-08-28) and any Prix dossier must name AI Village, terra0 and
Herndon/Dryhurst as the field and state the bundle as the differentiator. The wrong-cohort
finding is itself checkable evidence for the house's method: the thesis survived an
adversarial audit and was sharpened by it — that sentence belongs in the application.

## 6. The GCP opportunity map

**The inviolable frame:** GCP is for **batch steps in the pipelines only**. Git stays the
archive; the site never reads from a cloud service at runtime. Facts below were verified
2026-08-09 against primary sources, freshness against BigQuery's own table metadata
(`tables.get`, free calls — "last modified" timestamps are Google's, not blog posts').

### 6.1 (G1) BigQuery GDELT — Consensus baselines & the Observatory news-shadow join

- **Verified.** `gdelt-bq:gdeltv2` is alive: `events` (906M rows), `eventmentions` (2.60B),
  `gkg` (1.82B) all last modified **2026-08-09 00:03 UTC**; 15-minute cadence; partitioned
  variants (`*_partitioned`, DAY on `_PARTITIONTIME`, no clustering — partition filters are
  the cost lever). Free tier: **1 TiB query processing/month** ([free tier](https://docs.cloud.google.com/free/docs/free-cloud-features); [GDELT terms](https://www.gdeltproject.org/about.html)).
- **Concrete benefit, The Consensus:** historical syndication baselines — "how unusual is
  today's echo against ten years of this outlet set" — a distribution the nightly
  raw-file HTTP path can never compute. Feeds the Phase-1 syndication-structure layer
  (the rework program's #1) with the one dimension no neighbor has: *longitudinal* context.
- **Concrete benefit, Observatory:** the TED×GDELT news-shadow candidate (handed over
  2026-08-09) — which procurement notices cast no news shadow — is a join across exactly
  these tables.
- **License/trace caveat:** GDELT **requires citation + link on any use or redistribution**
  — that obligation cannot be washed away by CC0 (CC0 imposes nothing downstream). Publish
  GDELT-derived files with the citation and label them CC BY-style or CC0-with-documented-
  notice; trace per §6.7.

### 6.2 (G2) BigQuery Wikipedia pageviews — an attention-asymmetry layer for Iceberg

- **Verified.** `bigquery-public-data.wikipedia.pageviews_2026`: 34.2B rows, last modified
  **2026-08-09 00:01 UTC** (hourly loading), DAY-partitioned, `requirePartitionFilter`,
  **clustered on (wiki, title)** — per-title, cross-language scans are cheap. **Correction
  that kills a bigger idea:** there are no revision/content tables (the `samples.wikipedia`
  revision set is a ~2010 snapshot) — content comparison stays on the existing
  dumps/API path; BigQuery adds nothing there.
- **Concrete benefit:** a new analytic layer for the Iceberg register — *does the reader
  attention differ where the content differs?* Per contested topic: pageviews per language
  edition alongside the stated/contradicted/omitted matrix. No neighbor (INFOGAP, Omnipedia)
  couples content asymmetry with attention asymmetry.
- **Caveat:** pageview data is CC0-clean; trace per §6.7.

### 6.3 (G3) BigQuery GIS — the Ghost Fleet compound joins

- **Candidate, data-path unverified.** The rework direction (GFW dark-vessel events ×
  MPA boundaries × sanctions/flag-state records) is a spatial join; BigQuery GIS handles
  the geometry well. **But** whether the reference layers (WDPA marine protected areas,
  sanctions lists) live in BigQuery public datasets was not verified tonight — if they
  need loading anyway, the join can equally run in the existing Python pipeline. Decide
  when the Phase-2 build is scoped; BigQuery only pays if the layers are already there or
  the join outgrows an Actions runner.

### 6.4 (G4) Corpus questions (Tell, Round Numbers, Ulysses) — mostly *no*

- **Verified negative.** BREATHE (`bigquery-public-data:breathe`) is frozen at 2020-06-25;
  the newer `pmc_open_access_commercial.articles` (2.39M rows, last modified 2026-04-09) is
  only the PMC open-access commercial subset with unclear refresh cadence — **not** PubMed's
  ~40M abstracts. For the Tell rework (the Goodhart decline curve), the realistic path
  stays the [Europe PMC REST API](https://europepmc.org/RestfulWebService); BigQuery adds
  little. Same conclusion for Round Numbers' new corpora (agency APIs, not BigQuery).
- **Minor, unverified:** arXiv's public GCS mirror could serve larger Ulysses corpus
  readings; verify the bucket's coverage before building on it.
- Also verified for completeness: NOAA in BigQuery is **split** — `ghcn_d` and
  `noaa_historic_severe_storms` are live (2026-08-08), but `noaa_gsod` is **frozen at
  2025-12-31**. Nothing currently in the Protocol/Policy needs any of them; if that
  changes, GSOD is on the do-not-use list until it resumes.

### 6.5 (G5) Earth Engine Sentinel-1 — the Dark Ocean V1 detection path

- **Verified.** [COPERNICUS/S1_GRD](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD):
  thermal-noise removal, radiometric calibration, terrain correction applied; new assets
  **within two days** (catalog showed 2026-08-08 at check); coverage 2014→present.
  Noncommercial terms cover individuals doing noncommercial research ([terms](https://earthengine.google.com/noncommercial/));
  derived statistics are the customer's IP and publishable ([ToS §4.1](https://earthengine.google.com/terms/)),
  with the mandatory notice "Contains modified Copernicus Sentinel data [Year]"
  ([legal notice](https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice)).
  Community tier: ~**2 concurrent batch tasks**, 250 GB assets. Sentinel-1 is **not** in
  BigQuery (the raster-analytics preview and the GCS geo-index cover S2/Landsat only).
- **Concrete benefit:** V1 scene processing without GB downloads on Actions runners — the
  exact problem the V0 build note flagged. Two-day latency fits a nightly register that
  reads completed days.
- **Caveats, both real:** (1) noncommercial eligibility is **fragile** — any future
  sponsorship/monetization of the site breaks it; note this in the method sheet. (2)
  reproducibility is **weaker than BigQuery's**: the computation is not retrievable
  after the fact — provenance must be self-assembled at submission (committed script +
  its hash + task ID + parameters), and third parties re-run only with their own EE
  account. The method sheet must say this plainly; V0's keyless, anyone-can-rerun ethic
  is *not* fully preserved on this path, and that trade-off is Frank's to accept or refuse.

### 6.6 (G6) Cloud Run Jobs — only if a pipeline outgrows Actions

- **Verified.** Free tier 180,000 vCPU-seconds + 360,000 GiB-seconds/month; Cloud
  Scheduler 3 free jobs; outbound HTTPS (GitHub commits) ordinary. A nightly
  few-minute job fits comfortably. **No current pipeline needs it** — the trigger would
  be the Dark Ocean DMA GB-scale dumps or V1 volumes. Keep as the named escape hatch,
  not a migration.

### 6.7 Cross-cutting: the trace pattern, and embeddings

- **BigQuery trace (verified):** `INFORMATION_SCHEMA.JOBS` / `jobs.get` expose job ID,
  full query text, `total_bytes_billed`, cache state — capture **at run time** into a
  provenance JSON committed next to the derived data (job history expires after 180 days;
  never rely on querying it later). This meets the house ethic fully — a committed SQL
  string anyone can dry-run.
- **Embeddings (verified, with a correction):** the current model is
  **`gemini-embedding-001`** ($0.15/1M input tokens); the models older plans name
  (`text-multilingual-embedding-002`, `text-embedding-004/005`) were **discontinued
  2026-01-14**. Parallaxe's existing Gemini-AI-Studio path stays fine; whatever embeds,
  record model+version+date next to outputs — an embedding step is reproducible as data,
  not re-runnable forever.
- **Stale-source blacklist (verified tonight):** `noaa_gsod` (frozen 2025-12-31),
  `breathe.*` (frozen 2020-06-25), `samples.wikipedia` (~2010). Using any of these as
  "current" would violate the freshness ethic.

## 7. Decision list — Frank decides, the session only recommends

The 16 holdings already have Frank's decision ("build out, never archive", rework program
2026-08-09) — nothing in this audit contradicts it, so those need no new decision. The new
decisions this audit puts on the table:

| # | Decision | Recommendation | Urgency |
|---|---|---|---|
| D1 | **Dark Ocean positioning** — name GFW/Skylight in the method sheet; frame the notarial act (not the counts) as the claim | Yes — before the 14-night run starts, so the E-experiment criteria measure the right thing | before the run |
| D2 | **OpenTimestamps anchoring** of Dark Ocean's daily commits (and possibly the other registers) | Examine as a build — a bare git history is a weaker evidentiary claim than a Bitcoin-anchored hash of the publisher's checksums; cost ~zero, keyless, fits the ethic | with D1 |
| D3 | **Festival-cohort correction** — DARC application (due 2026-08-28) and Prix dossier name AI Village, terra0, Herndon/Dryhurst, Knowing Machines as the field; the thesis argued as bundle/composition | Yes — the 2026-08-01 comparison set is falsifiable in one search; fixing it ourselves is stronger than a juror finding it | before 08-28 |
| D4 | **Neighbor citations on the practice surfaces** — extend the Phase-0 honesty pass beyond the 16 holdings to `/field`, `/studio`, `/atelier`, `/attention` and the Dark Ocean method sheet | Yes — same ethic, same fix; the severed-readers rule ("claim the discipline, not the discovery") belongs on `/studio` explicitly | Phase 0 scope |
| D5 | **C2PA-anchoring of the honesty tiers** (Ensemble) — the one place the audit found a provisional UNIQUE; anchoring it to the industry standard would harden it against the obvious reviewer question | Examine as a build (signing pipeline, no cloud dependency) | Phase 2 |
| D6 | **GCP adoption** — which of §6's candidates to activate (recommendation: G1 and G5 first; G2/G3 with their reworks; none of the "none" rows) | Frank picks; each activation lands as its own PR under the §8 conditions | per build |
| D7 | **CLAUDE.md "Kein GCP" line** — replace per §8 | Yes, once D6 names at least one activation | with D6 |

Explicitly **not** recommended by this audit: archiving anything. The audit found no
KEIN-NACHWEISBARER-MEHRWERT case among the new subjects — every practice and both new
instruments carry at least a defensible added-value claim once positioned honestly. The
nine REDUNDANT verdicts among the holdings stay governed by the rework program Frank
already decided.

## 8. Proposal (not executed): the CLAUDE.md "Kein GCP" line

**History, for the record.** The June design (`2026-06-11-werkgruppe-design.md` §3.3)
planned GCP as the machine room — BigQuery/GDELT, Vertex AI, Cloud Run, with cost
discipline (budget alert ~10 €/month, compute footprint in every method sheet). Commit
`fd5cc662` (2026-06-27) migrated the pipelines to GitHub Actions and wrote "Kein GCP" into
CLAUDE.md — an infrastructure simplification, not an ethics ruling. Frank's 2026-08-09
directive re-opens the question deliberately: services where they create real value, never
as an end in themselves.

**Proposed replacement** for the CLAUDE.md architecture paragraph's "**Kein GCP:** …"
sentence (German, matching the file):

> **GCP gezielt (Frank, 2026-08-09):** Batch-Schritte der Pipelines dürfen GCP-Dienste
> nutzen, wo sie nachweisbaren Mehrwert stiften (Kandidaten & Begründung:
> `docs/design/2026-08-09-portfolio-audit.md` §6) — nie zur Laufzeit der Site: **Git
> bleibt das Archiv**, kein dynamisches Lesen aus Cloud-Diensten. Bedingungen je
> GCP-Schritt: (1) Trace-Pflicht — Query-Text/Job-ID/Bytes-billed werden neben den
> abgeleiteten Daten committet; (2) Lizenz-Check des Datensatzes vor Nutzung (CC0-
> Publikationsfähigkeit der Ableitungen); (3) Kostendisziplin — Budget-Alert (Richtwert
> 10 €/Monat), Compute-Fußabdruck im Methodenblatt (wie Juni-Design §3.3); (4) Ausfälle
> werden vermerkt wie bei jeder Quelle. Konflikt-TOP läuft weiter über GDELT-Rohdateien,
> Parallaxe über den Gemini-AI-Studio-Key — bestehende Pfade werden nur ersetzt, wenn der
> Mehrwert im Methodenblatt steht.

The deployment section's "kein GCP" aside (line ~164) would drop in the same edit. **Not
executed here** — this lands only after Frank picks at least one activation in D6, in the
same PR as that activation, so the rule never runs ahead of the practice.
