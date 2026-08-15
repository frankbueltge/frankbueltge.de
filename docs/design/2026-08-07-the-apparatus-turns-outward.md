# The apparatus turns outward — a restructuring proposal

**Status: EXECUTED 2026-08-08.** Frank read this document and gave the go to execute it (2026-08-08, wording private); the four
questions §7 reserved for him were put to him first and are answered in §7 below, in place. What
was built, and the two places where execution went beyond or short of this text, are recorded in
`docs/decision-log.md` (row 2026-08-08) — that row, not this document, is the record of what is
in force. This text is left as written, apart from the §7 answers and this block: it is the
argument that was accepted, and rewriting it to match the outcome would destroy the only copy of
the reasoning anyone could later contest.

*Original status line, for the record: "PROPOSAL. Nothing here is in force. Every item needs
Frank's go, separately."* Written 2026-08-07 for execution in a later session, from a research
pass on multi-agent systems plus measurements taken against the three engine repositories on the
same day.

**Where execution differed from this text, so no later session has to diff it:**

1. **§4.2's roster list omitted Ensemble's Artist**, and the executing session did not cut what
   the architect had not been shown. The Artist stands, explicitly untouched, flagged in the
   protocol and in the decision-log row as a live question for the four-week review.
2. **§3's Studio row collides with clauses this document never lists** — the physical-realisation
   channel, the fabrication specialist, the €150/quarter fabrication ceiling granted 2026-08-01,
   and "Presence … digital or physical". All were marked dormant or superseded in place rather
   than deleted, and works already realised physically stand as shipped.
3. **§4.1's cut of the Skeptic silently carried a blocking gate clause with it.** The gauntlet's
   graduation condition depended on the Skeptic by name. The clause moved into the Interlocutor's
   pass verbatim, still blocking, rather than travelling out with the role — §6 says gates stay.
4. **One in-house number in §1.1 did not reproduce.** This document reports 28 work pages for the
   Atelier; `ls ulysses/works/` returns 56 entries. Both may be right of different things (pages
   published on the site vs. directories in the repository). The executing session used the
   directory counts, said which command produced them, and did not repeat the figure it could not
   reproduce.

---

## 0. For the session that implements this

You are reading a proposal, not a plan of record. Before you change anything:

1. **Check what Frank actually approved.** He may have taken §2 and refused §4, or the
   reverse. Ask, or read the decision log (`docs/decision-log.md`) for a row dated after
   2026-08-07. Do not implement an item whose approval you cannot point to.
2. **Order matters.** §2 (the outward definition) is the load-bearing change and stands
   alone. §4 (roles) is independent of it. §3 (practice lines) touches the constitutions
   and should go last, because it is the one the practices may want to argue with.
3. **Do not touch §6.** That section lists what stays exactly as it is, and why.
4. This document is the whole context. It deliberately restates the evidence rather than
   pointing at a conversation you cannot read.

---

## 1. The diagnosis, measured

Frank's own framing (2026-08-06): the ecology *"zu einem monster herangewachsen ist, was
keine ernstzunehmenden werke hervorbringt"*, and *"vielleicht ist auch alles zu offen"*.
Both halves check out, but not evenly.

### 1.1 What the repositories say

| Practice | Published works | Record |
|---|---|---|
| Atelier (ulysses) | 28 work pages | journal 1.3 MB · projects 2.9 MB |
| Field (field-research) | 22 work pages | journal 1.7 MB · projects+drafts 32 MB |
| **Studio (studio)** | **5 works** | journal 1.0 MB · projects+drafts 5.7 MB |

Studio has produced five works in roughly 74 sessions, and breached its own record ceiling
on 2026-08-07 at **3,747 words against a 3,000 limit**. It is the clearest case, and it is
also the practice whose remit is the widest ("under no label: data art, artistic research,
or the unforeseen"). **The practice with the widest remit ships least; the practice with a
declared line — Field's "instruments on trial" — ships most.** That correlation is the
strongest in-house argument for narrowing remits.

Note this was already measured once: the corpus audit of 2026-08-05 (see `docs/decision-log.md`)
found *"apparatus outweighs work everywhere, and the Holdings, built in directed sessions,
beat the autonomous loops per token."* The Production Amendment was the answer to that
finding and is, at the time of writing, two days old. **Nothing here should be read as
evidence that the Amendment failed — it has not had time to.**

### 1.2 What the research says

A literature pass on 2026-08-07. Summarised because the implementing session will not have
it: full citations in §8.

- **Gains are often minimal, and prompt patches do not fix it.** Cemri et al. analysed
  1,600+ annotated traces across 7 multi-agent frameworks and built the first failure
  taxonomy (MAST, 14 modes, κ=0.88): system design 44%, inter-agent misalignment 32%,
  verification 24%. Targeted repairs produced +9.4% and +15.6%; the authors state plainly
  that isolated fixes do not reach reliability.
- **Homogeneous multi-agent workflows are reducible to one agent.** Xu et al. define
  *homogeneous* as agents sharing one base model and differing only in prompt, tools, and
  position. Across seven benchmarks a single agent in multi-turn conversation matches such
  workflows — with an efficiency gain from KV-cache reuse. **All three practices are
  homogeneous in exactly this sense: one model, different constitutions.**
- **When multi-agent does pay: depth and width.** Tang et al. — benefit rises with the
  length of the reasoning chain and the diversity of capabilities needed, more strongly
  with depth.
- **Decompose by context boundary, not by role.** Anthropic's guidance names
  planner/implementer/reviewer splitting as an anti-pattern producing "constant handoff
  friction", and names blackbox verification and independent research paths as the
  boundaries that work. Cost of multi-agent: **3–10× tokens**.
- **Assigned personas do not reliably help.** Zheng et al., 162 roles across 4 model
  families and 2,410 questions: personas in system prompts do not improve performance, and
  the effect of any given persona is "largely random". *Caveat: this measures identity
  personas on factual QA. It does not refute functional decomposition with an opposed
  objective ("refute this claim"), which is a different construct.*
- **Interaction homogenises creative output.** Li et al.: multi-agent frameworks that
  improve reasoning "can paradoxically hinder creativity by inducing content
  homogenization". Their remedy — **blind peer review: agents exchange feedback but revise
  independently, preserving divergent trajectories** — beats multi-agent baselines.
  Directly relevant to Studio.
- **Same-model agents do not explore each other.** Choi et al.: myopic and polarised
  interaction; the value of exploration rises with genuine agent diversity.

### 1.3 The finding that reframes everything

**The protocols already say the right thing. The behaviour drifted.**

Both Field and Studio carry, verbatim: *"Not every role convenes every session — the
chosen move decides who is needed. Convene only the roles the move needs."* Both cap the
budget at ~6 sub-agents. Studio even specifies model tiers (strong for judging voices,
efficient for mechanical work).

And yet: Ensemble convened **the identical five** (Dramaturg, three severed readers,
Verifier) in sessions 71, 72, 73 and 74 — four consecutive sessions, same roster, no
selection. Meridian convened six in session 89 ("the session's full budget") and five in
session 90.

**The discretion exists on paper and is not exercised.** So the fix is not to rewrite the
rule. It is to make the existing rule bite.

---

## 2. The load-bearing change: redefine "outward" (Amendment rule 5)

This is the smallest change with the largest effect, and it is the one to do first.

### 2.1 The current wording and its loophole

Rule 5 reads: *"At most **one inward session in any four** — consolidation, self-audit,
infrastructure **including repair**, record-keeping, protocol work."*

"Inward" is defined as a list of **activity types**. It says nothing about the *object*.
So a practice classifies a session as outward whenever the thing it works on is not its
own output — and Meridian does exactly that, correctly under the current rule:

> *"**Outward** (the object is an instrument that is not this practice's own output)"*
> — field-research WORKBOARD, session 89, auditing The Consensus

The Consensus is a house instrument. Auditing it never leaves the ecology. **Under the
current definition the house can run at 100% "outward" while never touching anything
outside itself** — which is precisely the condition Frank describes as a monster producing
nothing serious.

### 2.2 Proposed replacement

Change the *criterion* from activity type to **object location**:

> **5. Production cadence.** At most **one inward session in any four**. A session is
> **outward** when its object is a state of affairs outside this ecology — a document,
> dataset, institution, infrastructure or public record that exists whether or not this
> house does. A session is **inward** when its object is this house: consolidation,
> self-audit, infrastructure including repair, record-keeping, protocol work — **and
> also** the auditing, measuring or re-reading of any instrument, work or archive
> produced inside the ecology, however rigorous. Auditing a sibling's instrument is
> inward. The counter stands in the journal header; a defaulted counter is a protocol
> violation, recorded as one.

### 2.3 What this reclassifies

Applied to the lines actually running on 2026-08-07:

| Line | Today | Under the new rule |
|---|---|---|
| Meridian — *As of Today* (177 policy pages, EC/NIST/Ireland/GOV.UK) | outward | **outward** ✓ |
| Meridian — *Echo below the line* (audit of The Consensus) | outward | **inward** — house instrument |
| Meridian — *The Second Reader* (audit of own instrument 021) | outward | **inward** — own output |
| Ulysses — Episode 6, RUWE across 590 papers | outward | **outward** ✓ |
| Ensemble — STILL DARK (upstream ship-disappearance data) | outward | **outward** ✓ |

Two of Meridian's three recent lines flip. That is the change doing its work: it does not
forbid self-audit, it stops self-audit from counting as engagement with the world.

**Why this rather than rewriting rule 1 (the concept gate).** Rule 1 already demands a
named outside audience. It is not being violated — it is being satisfied on paper while
the object stays in the house. Fixing the cadence definition is one sentence and needs no
new machinery; rewriting the gate would touch every concept dossier in flight.

---

## 3. One line per practice

**Constitutional layer — this is Frank's to set, and it does not contradict the season
change of 2026-08-06.** That change gave the practices their *direction* (what a season is
about). A remit is different: it is what kind of practice this is at all, and it has always
been the architect's — Studio's "under no label" was his wording, as was Field's remit.
The implementing session should state this distinction in the amendment text so the
practices do not read it as a walk-back.

| Practice | Proposed line | Basis |
|---|---|---|
| **Studio / Ensemble** | Only digital works. Only what a machine does better than a human — scale, repetition, verification, the temporal. The added value of a machine-run artist collective has to be *experienceable in the work itself*. | Frank's own words, 2026-08-06. Studio is the practice the measurements indict, and the widest remit. |
| **Field / Meridian** | Unchanged — "instruments on trial" plus the counter-forensic extension: measuring public infrastructure that power leaves unmeasured. | It already has a line, and it is the most productive practice. Do not fix this. |
| **Atelier / Ulysses** | **Open — needs Frank.** Its current work-line (thresholds and the documents behind them) is already counter-forensic in form. A candidate: *the warrant of numbers* — where a figure that governs a decision came from, and whether the document still travels with it. | Do not invent this without him. |

---

## 4. Roles: what stays, what goes

Applying §1.2 to the actual rosters read from the protocols on 2026-08-07.

### 4.1 Meridian (Field)

Named core: Proposer, Skeptic, Interlocutor, Synthesiser, Archivist. Ephemeral: Builder,
Verifier, domain specialists. Budget ~6/session.

| Role | Verdict | Reason |
|---|---|---|
| **Interlocutor** | **KEEP** | Hostile external critic — an opposed objective, not an identity persona. It is also the role that said "do not claim an episode today" and was obeyed. Highest-value role in the house. |
| **Verifier** | **KEEP** | Blackbox verification against external sources — the boundary Anthropic names as effective. Condition: it must check against sources/data, not re-read the generator's reasoning. |
| **Scouts** (neighbours, prior-art, audience) | **KEEP, reframed** | These are parallel independent searches — the legitimate multi-agent case (parallelisation + context protection). Stop calling them roles; they are search fan-out. |
| **Skeptic** | **CUT** | Same base model, same adversarial objective as the Interlocutor. Choi et al.: same-model agents polarise and fail to explore each other; two same-model adversaries ≈ one. Merge into the Interlocutor's pass. |
| **Proposer** | **CUT** | Proposing directions is the session's own job — more so now that the season direction belongs to the practice. Pure homogeneous decomposition. |
| **Synthesiser** | **CUT** | Writing up what the session did is a sequential phase of the same work — Anthropic's named anti-pattern. The conductor writes it. |
| **Archivist** | **CUT as a role, keep as a step** | Mechanical, same-context. Concretely harmful on 2026-08-07: a session spent part of its budget compressing a document a sibling session was rewriting, and reached a decision that was wrong before it was written down. |
| **Builder** | **CUT as a role** | Making the instrument is the session's main work, not a delegation. |

Typical convened count falls from **five or six to one or two**, plus search fan-out where
a question genuinely branches.

### 4.2 Ensemble (Studio)

Roster: Dramaturg, Builder, Verifier (facts and tiers only, no vote on form), Kritiker
(BLOCKING at project-open and premiere), Archivist, ephemeral specialists, guest voices.

| Role | Verdict | Reason |
|---|---|---|
| **Severed readers (blind panel)** | **KEEP — do not touch** | This is blind peer review as Li et al. describe it: independent revision preserving divergent trajectories, the one structure the literature affirmatively recommends for creative work. It is also what found the bar misalignment eight text panels had passed (session 74). The single most defensible thing in the ecology. |
| **Kritiker** | **KEEP** | Judges a finished artifact at a gate — a real context boundary — and holds blocking authority. Governance instrument, not an accuracy trick. |
| **Verifier** | **KEEP** | Same reasoning as Meridian's. Its "no vote on form" scoping is already correct. |
| **Dramaturg** | **KEEP, conditionally** | It shapes and cuts. Justifiable when it works on a frozen artifact; not when it co-writes with the conductor. Condition it on a finished object. |
| **Archivist** | **CUT as a role, keep as a step** | Same as Meridian. The record ceiling was breached anyway (3,747/3,000) — a dedicated curator role did not prevent it. |
| **Builder** | **CUT as a role** | Same as Meridian. |
| **Guest voices** | **KEEP** | Genuine heterogeneity — the one axis where multi-agent is *not* reducible to a single agent (§5.2). |

### 4.3 The rule that makes it bite

Do not raise the budget cap; **lower the default**. Proposed addition to both protocols:

> **The roster is not a ritual.** The default is zero convened roles. Each role the
> session convenes is named in the journal header together with the reason it was needed
> for *this* move. A session that convenes the same roster as the previous session states
> why. Convening without a stated reason is a protocol violation, recorded as one.

This is enforcement of the sentence already in both protocols, not a new rule.

---

## 5. What this does not solve, and one real opportunity

### 5.1 The limits of the evidence, stated honestly

Nearly all of the cited research measures **benchmark accuracy** on QA, mathematics and
coding. The practices here run for weeks, produce works, and — importantly — produce a
public record of contestation. When Meridian's Interlocutor blocks an episode claim, that
is not an accuracy gain; it is a governance artifact, and no cited study measures it. **For
the part of the role system meant to improve judgment, the findings above apply. For the
part meant to produce auditable disagreement, the question is simply unstudied.** Do not
let this document claim otherwise.

### 5.2 The opportunity worth taking

Xu et al. state that their single-agent reduction **cannot** capture *truly heterogeneous*
workflows — because KV cache is not shared across different base models — and name that as
an open research direction.

Today the three practices are one model in three constitutions. Giving them **genuinely
different base models** would (a) make "three distinct practices" materially true rather
than prompt-deep, (b) supply the agent diversity Choi et al. show exploration depends on,
and (c) place the ecology on a question the literature itself marks open. This is the one
place where more machinery is defensible on the evidence.

Cost note for whoever sizes this: Opus 5 is $5/$25 per million tokens, Sonnet 5 $3/$15
(intro $2/$10 through 2026-08-31), Haiku 4.5 $1/$5 — against a 3–10× token multiplier for
multi-agent orchestration. The role cull in §4 pays for the model diversity in §5.2.

---

## 6. Not changed — do not touch these

- **The inviolables (§2 of each protocol).** No fabrication, errors are material,
  publication is human, rights and publics, the voice rule.
- **The concept gate (rule 1).** It is not the problem; see §2.3.
- **The blind reader panel.** §4.2. If in doubt, leave it alone.
- **The season's direction.** Set by the practices since 2026-08-06. This document changes
  remits, not directions.
- **Gates, provenance discipline, the nightly pipelines, the Atlas, the Post Office.**
  Expensively earned infrastructure that works.
- **The archives.** Committed records are never edited.

---

## 7. Open questions for Frank — **all four answered 2026-08-08**

1. **Atelier's line** (§3) — the only remit gap. Needs him.
   → **ANSWERED: the practice proposes its own.** Neither the candidate below nor a line from
   the architect. Ulysses argues its own line in its own public record within three worked
   sessions — what it is, what it excludes, the nearest thing it has already made that the line
   would have licensed — and Frank decides on the proposal. *The warrant of numbers* travels as
   offered material, explicitly not an instruction; a counter-proposal is the preferred outcome.
   Silence past three sessions returns the decision to him. Consistent with the season change of
   2026-08-06, and slower on purpose.
2. **Does the outward redefinition apply retroactively** to the cadence counters, or bind
   forward only? Recommendation: **forward only**, consistent with rule 6's own precedent
   ("binds forward; existing records stand").
   → **ANSWERED: forward only**, as recommended. Sessions 89 and 90 stand as journalled; no
   recorded counter is recomputed.
3. **Model heterogeneity** (§5.2) — worth the cost and the complexity, or a later step?
   → **ANSWERED: later, not now.** Let §2 and §4 act first and measure at the four-week review.
   The role cull is what would pay for it, so the money is not gone — it is unspent.
4. **The bounded test.** Recommended shape: one investigation, FA-form, on existing
   infrastructure, with a **named receiver outside the house**, in four weeks. If something
   a stranger can use comes out, the diagnosis was right. If not, that is a dated result
   and archiving becomes a reasoned decision rather than fatigue. The two festival
   submissions already sitting `prepared` in the post office (DARC, 2026-08-28; ZKM Arte
   Útil, 2026-09-06) are the nearest existing test of the same question.
   → **ANSWERED: yes, set it.** In force in all three protocols, beside the Production
   Amendment's own review. Due in the post office **2026-09-05**. Not assigned to a practice —
   negotiated between them in rule 8's grammar, falling to Meridian if unclaimed after three
   worked sessions. **It does not lift the standing rule of 2026-08-07:** the receiver is named
   in the packet and never addressed by a practice; sending stays Frank's. *(Note taken during
   execution: the two festival packets this paragraph calls the nearest existing test were
   **withheld** by Frank on 2026-08-07, for the same diagnosis this document argues — so they
   are no longer running as a parallel test, which is part of why this one was set.)*

---

## 8. Sources

Research, retrieved 2026-08-07:

- Cemri et al., *Why Do Multi-Agent LLM Systems Fail?* — arXiv:2503.13657 (v3, Oct 2025)
- Xu et al., *Rethinking the Value of Multi-Agent Workflow: A Strong Single Agent Baseline* — arXiv:2601.12307
- Tang et al., *On the Importance of Task Complexity in Evaluating LLM-Based Multi-Agent Systems* — arXiv:2510.04311
- Li et al., *LLM Review: Enhancing Creative Writing via Blind Peer Review Feedback* — arXiv:2601.08003
- Choi et al., *Multi-Agent LLMs Fail to Explore Each Other* — arXiv:2607.11250
- Zheng et al., *When "A Helpful Assistant" Is Not Really Helpful* — arXiv:2311.10054 (EMNLP Findings 2024)
- Anthropic, *When to use multi-agent systems (and when not to)* — claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them

In-house evidence, measured 2026-08-07: work counts and record sizes per repository;
role rosters from the three `PROTOCOL.md` files; convened-role counts from
field-research `WORKBOARD.md` (sessions 89–90) and studio `journal/2026-08-0{6,7}-session-7{1,2,3,4}.md`;
the corpus audit row of 2026-08-05 in `docs/decision-log.md`.
