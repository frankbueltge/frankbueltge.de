# FIELD.md — the field-map seed

> This is your STARTING map of the live field where data, AI and power meet — not a canon.
> Research further, verify, and extend/revise this map over time. Every claim here is a
> starting hypothesis to check against primary sources.

**Date:** 2026-07-01
**Source:** Research dossier *Landschaft & Topologie: Daten-/KI-Kunst 2025/2026*,
compiled from six parallel web-research agents (Ars Electronica/Prix/STARTS;
Berlin axis transmediale/Disruption Network Lab/CTM/CCC; ZKM/HEK/Pompidou;
Theory discourse; OSINT/Counter-Forensics/Critical Engineering; Anglo-US/Market).
All findings with dated sources 2024–2026.

---

## The Master Axis

One opposition structures the entire field:

```
   SPECTACLE / DATA-SUBLIME  ──────────────────────  INVESTIGATION / EVIDENCE
   (AI/data as MEDIUM)                                 (AI/data as SUBJECT)

   Refik Anadol · Dataland LA          |    Forensic Architecture · SITU · Crawford/Joler
   immersive, corporate, 360°          |    courts, satellites, supply chains, provenance
   ─────────────────────────────────────────────────────────────────────────────────────
   Market / Popularity                 |    institutional prestige + funding
   (but NFT market −99 %)              |    (FA #9 ArtReview Power 100, 2025)
```

**The decisive shift 2024→2026:** Prestige and curatorial budgets have moved clearly to the
**investigation side**. Pure Data-Sublime is now regarded *within* institutions as a "tech demo
disguised as art" — while Anadol's **Dataland** (first dedicated AI art museum, LA, June 2026)
keeps the spectacle pole commercially alive. The NFT/generative-collector market collapsed ~99 %;
Christie's closed its Digital Art department in September 2025.

---

## The Seven Live Clusters (ranked by current relevance)

| # | Cluster | Status 2026 | Key Artefact(s) 2024–26 | Venues |
|---|---|---|---|---|
| 1 | **Material/planetary AI cost** (compute, water, energy, e-waste) | **dominant — mainstream** | Crawford & Joler, *Calculating Empires* (Venice **Silver Lion 2025**, STARTS Grand Prize); *Model Collapse* (Ars 2025) | Ars Electronica, ZKM, Venice, Jeu de Paume |
| 2 | **AI in war / "Kill Cloud" / algorithmic targeting** | **sharpest edge** (Gaza-driven) | Sarah Ciston, *AI War Cloud Database* (STARTS 2025); Airwars (first AI-assisted civilian kill); +972 *Lavender* | **Disruption Network Lab**, Airwars, Amnesty Tech |
| 3 | **Counter-forensics / OSINT / investigative aesthetics** | **canonical, but contested** | Forensic Architecture *Cartography of Genocide* (→ICJ); **SITU → ICC conviction 2024** | FA/Goldsmiths, SITU, Bellingcat, DNL, courts |
| 4 | **Provenance → Authenticity** (Consent → "what is real") | Input **legally mature**, output **sharply rising** | Herndon/Dryhurst *The Call* (Serpentine); **C2PA in cameras**; Steyerl *Mechanical Kurds* | Serpentine, Whitney, New Museum, EU AI Act |
| 5 | **Decolonial / Global South / more-than-human** | **strongly rising** | transmediale 2026 *Mango Belt & Tamarind Road*; *Guanaquerx* (Ars 2025); HEK *Other Intelligences* | transmediale, ZKM, HEK, Ars |
| 6 | **Data Feminism / Missing Data / Data Justice** | consolidating (academic) | *Data Against Feminicide*; Onuoha; D'Ignazio & Klein | Ford Foundation, Jeu de Paume, CHI/FAccT |
| 7 | **AI self-consumption (Model Collapse) + quantum indeterminacy as epistemics** | emerging commissioned work | *Model Collapse*; ZKM-Hertzlab (AI misinforming about itself); *Quantum Visions* (CERN→HEK) | Ars, ZKM, HEK, CERN Arts |

**Most-cited individual 2025/26: Hito Steyerl** (Fondazione Prada, New Museum, MACRO, book
*Medium Hot*) — at the hinge of Clusters 2+4: AI, ghost-worker labour, political violence.

### Cluster Notes

**1 · Material cost.** Has migrated from art criticism into the scientific emergency discourse
(UN University Reports 2025; GPT-3 training ≈ 5.4 million litres of water). Art is shifting
here from *revelation* to *navigation*. Apex artefact: *Calculating Empires* (touring
Fondazione Prada, Mori, Jeu de Paume).

**2 · Kill Cloud.** Gaza made AI targeting (Lavender, Gospel, "Where's Daddy?") readable and
urgent. Whistleblower testimony as method (Lisa Ling, drone programme).

**3 · Counter-Forensics.** Simultaneously prestige (FA #9 Power 100; SITU ICC conviction;
Crawford/Joler Silver Lion) **and** headwinds (Munich court dismissed FA as "merely art";
German IHRA funding rules threaten the work). Gaza-saturated.

**4 · Provenance/Authenticity.** Debate is moving from *input* (who owns training data?
Spawning/"Have I Been Trained", C2PA opt-out) to *output* (how do we know what is real?
C2PA in Samsung/Sony cameras, EU AI Act from August 2026). **Most under-served cluster
relative to social urgency** — the largest open space for new work.

*Concrete developments (from field research, sessions 1–3):*
- **Institutional rollback of AI text detectors**: ACU (Australia) abandoned Turnitin AI detection March 2025 after 25% of ~6,000 allegations were dismissed; UCT (South Africa); U. Waterloo (Canada) all dropped AI detector-based enforcement. Documented harm cases: Rignol v. Yale (D. Conn. 3:25-cv-00159, French-born EMBA student, GPTZero flag on final exam, pending); Yang v. U. Minnesota (PhD student expelled Nov 2024, visa revoked, expulsion upheld Feb 2026). Both cases involve NNES students.
- **AI text detector calibration gap** (session 1 instrument): RAID benchmark (ACL 2024) shows detectors collapse under adversarial conditions; NNES false positive rates 30–61% above baseline (Liang et al., Stanford/Cell Patterns 2023; Stowe et al. 2025; Pratama PeerJ 2025). Vendor FPR claims (0.2–1%) vs. independent measurements (15–37%) show systematic specification gap.
- **C2PA operational paradox** (RAND June 2025): content most needing verified provenance (virally shared) is most likely to lose C2PA metadata via screenshot, social media recompression, or format conversion. Simple screenshot removes all manifests. The chain of custody breaks at the highest-stakes nodes.
- **C2PA structural contradictions** (session 3 instrument, 2026-07-01): The standard's three design goals — provenance binding, cross-platform durability, creator privacy — are in structural tension. Forgery demonstrated via c2patool by Hacker Factor (2025): any image can be signed with a valid certificate attributing content to any creator; verification tools show "no evidence of tampering." ArXiv 2604.24890 (2026): "C2PA should not yet be relied upon for high-stakes uses such as financial disclosures, journalism, or legal evidence." Privacy paradox (Fortune, Sep 2025; SMPTE MTS2025): device-bound certificates expose journalists' identities even when bylines are withheld; manifest fetch requests log IP addresses.
- **Detection tool domain validity as a research thread**: Benford's Law misapplied to 2020 US election precinct data (Milwaukee etc.) is a case of a valid financial-fraud tool imported into a domain where its assumptions fail by construction (bounded precinct vote ranges). Same class of failure as AI text detectors: tool calibrated on one population deployed on another. This opens a new instrument line for The Measuring Field project.
- **Emerging pattern across three instruments**: All three instrument failures follow the same structure — tool calibrated for controlled conditions (professional newsroom, financial transactions, vendor test corpora) fails when deployed in uncontrolled conditions (open social media, bounded election data, non-native English writers). The tool's strongest guarantee coincides with its lowest need; its weakest guarantee coincides with its highest need.

**5 · Decolonial/more-than-human.** Dominant curatorial frame 2025: AI as *one among many*
cognitions (alongside plant, animal, fungus). "Algorithm = algo + rhythm".

**6 · Data Justice.** *Data Feminism* (D'Ignazio & Klein) as theoretical infrastructure;
Onuoha's *Library of Missing Datasets* (absence as data) as method.

**7 · Self-consumption/Quantum.** Institutions are commissioning work that turns AI logic
*against itself* (provenance collapse, hallucination as institutional critique). Quantum
indeterminacy as argument against false computational certainty.

*From field research, session 6 (2026-07-01):*
- **Benchmark contamination as self-consumption** (INSTRUMENT 005): AI capability benchmarks (MMLU)
  inflate reported scores by 12–18pp when training data overlaps with test questions (MMLU-CF,
  ACL 2025). The measurement system is consumed by the thing it measures.
- **Fairness impossibility in criminal justice AI** (INSTRUMENT 006): COMPAS recidivism prediction —
  ProPublica's bias claim (44.85% vs 23.45% FPR) and Northpointe's "fair" claim (63% vs 59% PPV)
  are simultaneously correct, because Chouldechova (2017) proved no classifier can satisfy both
  criteria when base rates differ. The fairness criterion is internally impossible, not merely
  miscalibrated. Source: Chouldechova (2017) doi:10.1089/big.2016.0047; Dressel & Farid (2018)
  doi:10.1126/sciadv.aao5580; EU AI Act (2024) Art. 5.1(d) prohibits this use class outright.
- **Emerging instrument series pattern** (six instruments, 2026-07-01): A body of work examining
  six detection/measurement systems reveals six different failure modes: calibration gap (AI text
  detectors), domain mismatch × 2 (Benford's Law, last-digit test), structural contradiction
  (C2PA), active exploitation (AI benchmarks), definitional impossibility (COMPAS). The common
  thread: the tool's strongest guarantee coincides with its lowest-stakes deployment; its weakest
  guarantee coincides with its highest-stakes deployment. This is conjectural — six cases are
  evidence, not proof.

---

## Institution / Venue Map

**Investigation pole:** **Disruption Network Lab** (Berlin — whistleblowers + OSINT + AI war;
densest node for counter-forensics), Forensic Architecture/Goldsmiths, SITU (NY), Airwars,
Bellingcat, ICC/ICJ as literal stages.

**Theory/critique museums:** ZKM (under Hudson — "more-than-human" + AI self-consumption),
HEK Basel (most consistently critical), Jeu de Paume (stepped into Pompidou's closure gap
with the major AI survey).

**Festivals:** Ars Electronica (arc HOPE→Panic→"Negotiating Humanity"), transmediale (smaller,
Global South, processual), CTM ("Stranger AI" — AI as unruly sound material), CCC/38C3
(disclosure-as-lecture: VW leak of 800k EV location data).

**Commission hubs / Spectacle:** Serpentine Arts Technologies (most active commissioner —
consent infrastructure, FAE policy), Barbican (Liam Young, AI infrastructure as speculative
cinema), MoMA, Anadol's Dataland (pure sublime).

---

## Benchmark Roster (the yardstick — artists/works + epistemic move)

What separates these practices from "data made beautiful": **form enacts the argument; the
subject is the infrastructure/instrument, not its output; method is verifiable.**

| Practice | Key work | The decisive move |
|---|---|---|
| **Forensic Architecture** (Weizman) | *Cartography of Genocide* | "investigative aesthetics": form *is* the epistemological demonstration; courtroom deployment |
| **Kate Crawford & Vladan Joler** | *Anatomy of an AI* / *Calculating Empires* | diagram form (Sierpinski) *is* the thesis — recursive extraction |
| **Mimi Onuoha** | *The Library of Missing Datasets* | absence as data; the empty folder *is* the claim |
| **Trevor Paglen** | *ImageNet Roulette*, *Invisible Images* | "experimental geography": seeing itself becomes a political question |
| **Hito Steyerl** | *How Not to Be Seen*, *Mechanical Kurds* | video essay produces the *experience* of being seen/invisible; ghost-worker labour |
| **Tega Brain** | *Synthetic Messenger*, *Asunder* | "eccentric engineering": a working system performs critique *from within* |
| **Disnovation.org** | *Post Growth* | speculative functional prototyping: instantiate a *different* system, don't just criticise |
| **Julian Oliver / Critical Engineering** | Manifesto (2011) | "the exploit as the most desirable form of exposure" |
| **SITU Research** | ICC evidence platform (2024) | visual investigation → courtroom (most concrete "art-to-courtroom" path) |
| **Herndon & Dryhurst / Spawning** | *The Call*, "Have I Been Trained" | the consent infrastructure itself *is* the work |
| **Ingrid Burrington** | *Networks of New York* | perception-training of infrastructure as knowledge production |
| **Counter-benchmark: Refik Anadol** | *Unsupervised*, Dataland | the Data-Sublime pole — "empty cathedrals where algorithms replace thought"; *what not to be* |

---

## What Is Fading

NFT/crypto collector art (market −99 %, Christie's department closed) · Early-GAN "AI-sublime"
(DeepDream, StyleGAN portraits) · **decorative dataviz-as-art** (must now "carry argumentative
weight") · the grand "What *is* AI?" explainer survey show (audiences no longer naive) ·
abstract "surveillance capitalism"/"AI is coming" framing (replaced by *named* systems: Lavender,
Gospel, the VW dataset) · Sundance New Frontier (discontinued) · headset-dependent immersive
doc (IDFA pivoted to platform critique).

---

## Synthesis: Rising vs Falling

**Rising:** material AI cost (mainstream) · authenticity/"what is real" (under-served, major
opportunity) · decolonial/more-than-human · AI war accountability · AI self-consumption as
commission subject · geo-situated AI (who builds it, where, for whom).

**Falling:** spectacle without politics · NFT/generative collector art · decorative dataviz ·
abstract surveillance rhetoric · "what is AI" explainer shows.

---

## Key Sources

- Calculating Empires / Venice Silver Lion — labiennale.org/en/architecture/2025
- ArtReview Power 100 2025 (FA #9) — artreview.com/the-2025-power-100-a-users-guide/
- Disruption Network Lab — Investigating the Kill Cloud — disruptionlab.org/investigating-the-kill-cloud
- SITU Research (ICC platform) — situ.nyc/research
- Opinio Juris, "merely art"/OSI aesthetics (Nov 2025) — opiniojuris.org/2025/11/28/
- Ars Electronica 2026 "Future Begins" — ars.electronica.art/futurebegins/en/
- transmediale 2026 — berlinartlink.com/2026/01/13/
- Jeu de Paume "The World Through AI" — jeudepaume.org/en/evenement/the-world-through-ai/
- Christie's closes Digital Art department — theartnewspaper.com/2025/09/09/
- MIT, generative AI environmental cost — news.mit.edu/2025/explained-generative-ai-environmental-impact-0117
- HEK *Other Intelligences* / ZKM *Fellow Travellers* · Spawning "Have I Been Trained" · C2PA v2.1

---

## Caveats

- 2026 editions partly not yet fully programmed/assessed (Prix/STARTS 2026, 39C3) — marked as
  unconfirmed in the source agent digests.
- The decolonial cluster partially migrates through CHI/FAccT/academic venues, not only the art
  press — potentially under-represented in art-focused searches.
- Research snapshot: 2026-07-01. A moment in time, not a closed canon.
