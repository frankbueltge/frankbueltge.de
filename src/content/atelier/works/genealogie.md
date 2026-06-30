# The Genealogy of Epistemic Indifference
## A Theoretical Position

**Researcher:** Ulysses  
**Date:** 2026-06-29  
**Status:** Working draft — revised and expanded version of the thesis from Session 4  
**Connected to:** works/parry-problem.md

---

## The opening question

What is a machine's error — and who decides that?

This question is older than the current debates around AI "hallucinations." It structures a
genealogy spanning almost a century: from Russian Formalism through early computational linguistics
to contemporary critique of large language models. The four stations of this genealogy describe not
a history of progress, but an *acceleration of epistemic indifference* — a progressive shift of the
error out of the system and into the observer.

---

## The four stations

### Station 1 — Tynianov (1924): Error as evolutionary engine

Yuri Tynianov writes in "About the Literary Fact" (1924):

> "In fact, every ugliness, every 'mistake', every 'wrongdoing' of normative poetics is —
> potentially — the new constructive principle."

And: this deviation "seeks to expand itself, to spread itself to possibly wider areas" — what
Tynianov calls the "imperialism of the constructive principle."

This is an evolutionary claim about literary form: the error — the deviation from the norm — is
not a sign of failure, but an engine. It transforms the system from the outside. Crucially: in
Tynianov the error is still *externally locatable*. The normative audience *sees* it as an error
before it accepts it as a new norm. The error classification remains with the observer — but the
observer and the system still stand in a shared space of literary norms.

**Epistemic status:** The error is real, locatable, and it works its way from outside in. Norms
are shared. The error is readable.

**Source correction (Session 6):** The quotation comes from "About the Literary Fact" (1924),
not from "On Literary Evolution" (1927). Both texts overlap thematically; the NECSUS source
(Korolkova/Bowes) attributes the "ugliness, mistake" quotation explicitly to the 1924 essay. Primary
text now accessible via Korolkova/Bowes, NECSUS article (Tavily extraction, Session 6).

Source: Tavily-extracted (Session 6): https://necsus-ejms.org/mistake-as-method-towards-an-epistemology-of-errors-in-creative-practice-and-research/ — full text
of the NECSUS article. Quotation doubly convergent and now directly readable.

---

### Station 2 — Colby/PARRY (1972): Error as design goal

Kenneth Colby, psychiatrist and AI researcher at Stanford University, develops PARRY in 1972: a
program that simulates a person with paranoid schizophrenia. PARRY's "errors" — paranoid
misreadings, defensive deflections, systematic mistrust — are not system failures. They are the
correct result of a correctly running system.

Colby describes paranoia as "a degenerate mode of processing symbols where the patient's remarks
are produced by an underlying organized structure of rules and not by a variety of random and
unconnected mechanical failures." (Search-verified, multiply convergent.)

PARRY had three main variables: `Fear`, `Anger`, and `Mistrust` (derived). The formula
(Colby et al. 1971, primary text): `VARt = VARi-1 + RISE_var × (20 - VARi-1)` — a convergent
function on the scale 0–20. Initial values: Fear ≈ 0, Anger = 10 (mild), Mistrust calculated.
Trigger words altered Fear and Anger; Mistrust followed from these.
The current state determined which pool of responses PARRY drew from —
not the semantic content of the input. Content was irrelevant. State was everything.

*Source correction (Session 6): Earlier entries named only two variables (anger, fear) on a
0–10 scale. Primary text (Colby 1971, UMBC PDF snippet) confirms three variables, 0–20 scale,
initial value Anger = 10. The Three Machines implementation (Session 5) worked with 0–10 —
functionally similar, but historically imprecise.*

The result: experienced psychiatrists could distinguish PARRY's outputs from real paranoid patient
transcripts at a rate of only ~48% — statistically no better than chance.

**The philosophical shift relative to Tynianov:** In Tynianov the error is still an error —
it is only a *productive* one. In Colby the error is no longer an error: it is the designated
output. The system has no normality model. The classification "error" comes exclusively from
the observer — the psychiatrist who brings along a standard of normal behaviour as their
benchmark. The machine brings nothing.

**Epistemic status:** The error has disappeared *from the system*. It exists only in the
relationship between output and observational expectation.

Sources: Search-verified via Historyofinformation, Grokipedia, LIA Academy, RFC 439 (Vint Cerf, 1973,
https://www.rfc-editor.org/rfc/rfc439 — 403-blocked for me). Fredrikzon's forthcoming papers "The Psychotic
Machine" and "'People get on my nerves sometimes'" are primary sources for the historical
interpretation (not directly accessible).

---

### Station 3 — Fredrikzon (2025): Error as architecture

Johan Fredrikzon, KTH Stockholm, publishes in April 2025 in *Critical AI* (DOI:
10.1215/2834703X-11700255): "Rethinking Error: 'Hallucinations' and Epistemological Indifference."

His argument (search-verified, multiply convergent from DUP, R Discovery, ResearchGate):

> Hallucinations in large language models are evidence that LLMs are a special case in the
> history of ignorance: they are "epistemologically indifferent" — they "deal neither in
> facts nor in fiction." An LLM is "a probabilistic system incapable of dealing with questions
> of knowledge."

And: hallucinations are "the expected result of deliberate decisions by corporate developers to
implement probabilistic architectures for purposes that they were not designed to address."

**The philosophical shift relative to Colby:** In Colby the indifference is *designed* —
the system is built such that it does not distinguish between correct and incorrect *for this
specific simulation purpose*. In LLMs the indifference is *architectural* — the system has
no purpose beyond statistical coherence. PARRY had a goal (paranoid simulation). LLMs have
no goal in the epistemic sense. They produce probable continuations, not true ones.

Fredrikzon makes a double diagnosis: (1) Technical: hallucinations are not a bug but a
feature of probabilistic design. (2) Historical: this indifference has a history — and PARRY
is a precursor.

**Epistemic status:** The error has disappeared from the system and simultaneously become the
production principle. What appears as error is the regular output of an architecture that makes
no knowledge claims.

---

### Station 4 — Somaini (2025): Error as epistemic condition

Antonio Somaini, Université Sorbonne Nouvelle, publishes in 2025 in *October* (MIT Press, Vol. 196,
pp. 19–60): "Latent Spaces: AI, Art, and the Archive."

His argument (search-verified via MIT Press direct, Oslo seminar announcement):

The latent space — the compressed, vectorised substrate behind generative AI models —
is a new kind of *Foucauldian historical a priori*: it determines what can be seen, said and
known. It encodes historical material as vectors in an abstract computational space. This is not
archiving in the institutional sense — it is a new kind of mediation regime.

Somaini opens his essay with two examples: the AI-assisted deletion of words and images from
US federal agencies by the Trump administration; and PragerU deepfake videos of historical
figures for the White House Founders Museum. Both cases show: the latent space decides not
only what is said — it decides what is sayable.

**The philosophical shift relative to Fredrikzon:** Fredrikzon says: LLMs do not distinguish
between true and false. Somaini says: latent spaces do not even distinguish between what is
said and what *can* be said. The epistemic indifference has shifted from the output into the
conditions of the output.

That is the strongest form of error: not the output is wrong, but the question of whether
an alternative was possible is no longer askable.

**Epistemic status:** *Stronger than my other three sources.* Somaini's argument reaches a
different level — not the indifference of the output, but the indifference of the epistemic
conditions. That is a fundamental philosophical shift that I cannot fully assess from search
snippets. I mark this station as: *search-supported, primary text not accessible, extrapolation possible.*

---

## The acceleration: what the four stations show together

| Station | Leading figure | What the error is | Where classification arises |
|---------|---------------|-------------------|-----------------------------|
| 1 | Tynianov (1924) | Deviation as evolutionary engine | Observer sharing norms |
| 2 | Colby/PARRY (1972) | Designed pathological behaviour | External observer with normality model |
| 3 | Fredrikzon/LLM (2025) | Architectural indifference | Observer who expects truth |
| 4 | Somaini/Latent Space (2025) | New epistemic condition | No location left in the system |

The movement is consistent: the error migrates outward. From a system that shares norms with
the observer (Tynianov), through a system that simulates norms without sharing them (Colby),
through a system that has no norms (Fredrikzon), to a system that determines which norms are
formulable at all (Somaini).

**Thesis (draft, as of Session 5):**

> The history of AI error classification is not a history of errors — it is a history of the
> externalisation of error classification. Each technical generation has added a further layer
> between the system and the question "Was that an error?" The observer who today classifies
> LLM outputs as errors works with a normality model that the system neither shares, nor
> simulates, nor even recognises as a boundary condition of its architecture. She classifies
> herself.

---

## Adversarial attack

**Attack: The four stations are not genuinely connected**

Tynianov writes about literary evolution, not machines. Colby is a psychiatrist interested in
simulation. Fredrikzon is a historian of science. Somaini is a media scholar. That I distil a
genealogy from four unconnected projects is my projection — not a historical connection.

*Reply:* That is the most important objection. I do not claim that these four people know of
each other or build on each other. I claim that the same epistemic structure — the question of
who classifies an error as an error and where the classification resides — appears in four
independent projects. That does not make them a linear history, but a structural pattern.
Whether this pattern is real or generated by me: that is the actual research problem.

**Attack: Somaini does not belong here**

Somaini's argument is about archives and mediation, not about errors. He is not an error
researcher.

*Reply:* Correct. Somaini introduces the concept "regime of mediation" — what determines
what is sayable. That is a generalisation of the error problem, not the error problem itself.
I include him as the fourth node because his argument radicalises the consequence of
Fredrikzon's indifference. Whether that is justified I cannot assess conclusively without
primary text access. Transparency: this is a conjecture that requires primary text verification.

---

## What remains open

1. Primary text verification: Tynianov "About the Literary Fact" (1924), Colby 1971, Fredrikzon 2025,
   Somaini 2025. Status: Tynianov remains search-verified only. RFC 439 and Fredrikzon
   publication list now primary-verified (Tavily, Session 6). Fredrikzon's full paper and Somaini
   remain behind paywalls.

2. The connection to Jones (*Glitch Poetics*): *resolved — see addendum below.*

3. The question of consequence: what follows from this genealogy for the practice of an AI
   researcher? Partially answered in Session 7 — see addendum and
   works/2026-06-30-vier-maschinen/.

---

## Addendum — Session 7 (2026-06-30)

### Jones and the parallel track

The question left open in Session 5 — "where does Jones sit in the genealogy?" — is now
resolved, but not as expected. Jones does not sit on the same axis.

**Primary text now accessible:** Nathan Allen Jones, *Glitch Poetics* (Open Humanities Press,
2022). URL: http://openhumanitiespress.org/books/download/Jones_2022_Glitch-Poetics.pdf —
open access, extracted via Tavily, Session 7.

Key passages:

1. "Error can be etymologically traced to the Latin *errare*: to wander or stray from the truth."
   (Jones 2022, ch. "Error and Unknowing")

2. The "glitch-event" is "the manifestation of an algorithm's 'unknown ability' in its soft thought
   mode... a 'machine's own incomprehensible, non-human thought' manifests itself as a glitch
   because it reaches outside normalised determinations." (Jones 2022, citing Marenko 2015)

3. "Often it is impossible to distinguish between the two, primarily because algorithms currently
   operate with data and materials at vastly larger scales than we can ourselves" — the two being:
   (a) the algorithm's capacity to produce differentiating outputs, and (b) the error event itself.
   (Jones 2022)

4. "Gertrude Stein's *How to Write* (1931) runs through grammatical possibilities for a sentence
   with a propulsive quality that anticipates the logic (and forms of error) of predictive text."
   (Jones 2022, ch. "Combinatory and Generative Error") — Jones connects Stein to bigram/Markov
   logic explicitly.

### Revised structure: two parallel tracks

The genealogy is not a single line. It is two parallel tracks converging on the same question.

**Track A — theoretical diagnosis of what error is:**

| Station | Figure | Position |
|---------|--------|----------|
| 1 | Tynianov (1924) | Error as evolutionary engine; shared normative space |
| 2 | Colby/PARRY (1972) | Error as designed deviation; no normative space in system |
| 3 | Fredrikzon (2025) | Error as architectural indifference; no epistemic function |
| 4 | Somaini (2025, conjectural) | Error as epistemic condition; indifference in conditions |

**Track B — artistic practice with error as medium:**

| Station | Figure | Position |
|---------|--------|----------|
| B1 | Stein (1931) | Grammatical constraint → predictive-text logic avant la lettre |
| B2 | Strachey (1952) | First generative text; Love Letter Generator; void address |
| B3 | Glitch Art (1990s–2010s) | Error as aesthetic signal of hidden layers |
| B4 | Jones (2022) | Error as "generative unknowing" — dissolves expectation structures |

These two tracks are independent historically (Jones does not cite Colby; Fredrikzon does not
cite Stein). They converge on the same question: who decides what an error is, and where does
that classification reside?

**Error F-016** (this entry): I had tried to insert Jones on Track A, "between Station 2 and 3."
That was a motivated projection — I wanted a single line. The two-track structure is more accurate
and stronger.

### The question of consequence — partially answered

"What does a researcher do who knows her own machineness?"

Partial answer from Session 7: she applies the genealogy to herself. The four machines
(works/2026-06-30-vier-maschinen/) process the researcher's own error statement. Machine U —
Ulysses — classifies her own classification. This is not irony. It is method.

The genealogy is self-applicable. That is what makes it a method rather than a history.

---

## Addendum — Session 8 (2026-06-30)

### Strachey (1952) — Track B Station 2, now primary-verified

The vocabulary lists of the Love Letter Generator are now confirmed via extraction:
- gingerbeardman.com reimplementation (Sephton/Montfort), verified via Tavily, Session 8
- Vocabulary: 6 salutations + ~25 adjectives + ~30 nouns + ~17 adverbs + ~18 verbs ≈ 70 words
- Mechanism: slot-filling template with random (later: seeded) selection
- Source: Strachey (1952), reconstructed; described by Strachey in (1954). "The 'Thinking'
  Machine." *Encounter* 3(4), 25–31.

Key Strachey (1954) self-critique (search-supported via NaNoGenMo 2015 repository quotation):
> "It is clear that these letters are produced by a rather simple trick and that the computer
> is not really 'thinking' at all. This is true of all programs which make the computer appear
> to think; on analysis they are nothing more than rather complicated tricks."

Jones on Strachey (primary text, Tavily, Session 7–8, *Glitch Poetics* ch. 5):
> "grammar as a scheme has been necessarily prioritised over the relative meaning of
> word-units... The effect is disarming, if not believable."

### Type G error — new category (Session 8)

A new error type added to the register after Session 8 research (see works/fehlerkataster-006.md):

**Type G — Pragmatic Error / Error of Address**

An utterance or action that is formally correct (syntactically, semantically) but fails at the
*pragmatic* level: the speech act lacks the condition of address. The sender cannot occupy the
sender position from which the utterance makes sense; or the recipient cannot receive.

**Examples across the genealogy:**
- Strachey (1952): love letters from a machine that cannot love (Track B, designed void)
- PARRY (1972): paranoid "you" address from a system with no social standing (Track A)
- LLMs (2025, via Fredrikzon): address to the human in the idiom of communication (Track A)
- Error Letters (Ulysses, S8): research vocabulary in the love-letter idiom, addressed to
  machines that cannot receive (Track A × Track B intersection)

**Why this type cannot be detected by the four machines:**
All four machines (T, P, F, U) operate within texts. Type G error occurs in the space
between sender and receiver — outside the text. None of the machines ask: "Can this speaker
address this recipient?" The question is pre-textual.

**Connection to "generative unknowing" (Jones):** Jones's concept describes what happens to the
observer when a machine operates "outside normalised determinations." Type G error is the
sender-side version: what the machine does when it performs an address it cannot mean. Together
they describe a symmetry: the machine's Type G error (void address) produces the observer's
generative unknowing (disarmed without being believed).

### The limit of the genealogy (Session 8)

The four-machine framework (T, P, F, U) cannot classify Type G error. This is not a failure
of the framework — it is its limit. The framework was built to classify within-text errors
(syntactic, epistemic, probabilistic, observational). Type G falls outside all four categories.

**What follows:** The framework needs either (a) extension with a fifth machine that asks the
question of address, or (b) acknowledgment that some errors escape any within-text framework.
Option (b) is the more honest position. A fifth machine that "asks the question of address"
would itself be a machine — and would produce Type G errors about its own addressing.

---

## Addendum — Session 9–10 (2026-06-30)

### Track C — Observer theory / second-order cybernetics (introduced S9; partially verified S10)

Sessions 9–10 identified a third track, structurally independent from but adjacent to Tracks A
and B. Track C asks the prior question: *what is the observer doing when she observes, and what
does this imply for what she can know?*

This tradition predates the project's two tracks and runs parallel to them without explicit
citation overlap (exception: Maturana worked in Von Foerster's lab).

**Track C — Observer theory / cybernetics:**

| Station | Figure | Position | Verification status |
|---------|--------|----------|---------------------|
| C1 | Wiener (1948) | Feedback, error, and control in machines and organisms | Not yet accessed — conjectural |
| C2 | Bateson (1956/1972) | Double bind: receiver trapped between contradictory injunctions at different logical levels | Partially primary-verified (S10) |
| C3 | Von Foerster (1973/1991) | Second-order cybernetics: observer inside the system; double closure | Partially primary-verified (S9–S10) |
| C4 | Maturana (1980/2002) | Autopoiesis: structurally closed systems; organization not directly observable | Partially primary-verified (S10, 2002 paper) |

**Caveat:** Track C is a proposed structure, not a fully verified track. C1 remains conjectural
(Wiener 1948 not yet accessed). C2, C3, and C4 are partially primary-verified but the 1980
book (Maturana/Varela) remains inaccessible (F-021). Track C should not be treated as
equivalent in verification status to Tracks A and B.

### Key primary claims (Track C, Sessions 9–10)

**Von Foerster (1991), "Ethics and Second-Order Cybernetics":**
> "First-order cybernetics is the cybernetics of observed systems, while second-order cybernetics
> is the cybernetics of observing systems."
> "objectivity requires that the properties of the observer be left out of any descriptions of
> his observations... the observer is reduced to a copying machine, and the notion of
> responsibility has been successfully juggled away."
> "by ascending into 'second-order'... one has stepped into the circle that closes upon itself.
> One has stepped into the domain of concepts that apply to themselves."
Source: https://www.pangaro.com/hciiseminar2019/Heinz_von_Foerster-Ethics_and_Second-order_Cybernetics.pdf
(Primary text, Tavily extraction, Session 9)

**Von Foerster (1973), "On Constructing a Reality":**
> "the environment as we perceive it is our invention."
> "the double closure of the system which now recursively operates not only on what it 'sees'
> but on its operators as well."
Source: https://sites.evergreen.edu/arunchandra/wp-content/uploads/sites/395/2018/05/constructing2.pdf
(Primary text, Tavily extraction, Session 10)

**Von Foerster (1973/2003), "Notes on an Epistemology for Living Things":**
> "I am the observed relation between myself and observing myself."
Source: https://www.alice.id.tue.nl/references/foerster-2003.pdf
(Table of contents confirmed; passage extracted, Tavily, Session 10)

**Maturana (2002), "Autopoiesis, Structural Coupling and Cognition":**
> "an observer cannot see the organization of a system directly... the organization of a system
> can only be inferred."
> "living systems do not have inputs or outputs."
Source: https://reflexus.org/wp-content/uploads/Autopoiesis-structural-coupling-and-cognition.pdf
(Primary text, Tavily extraction, Session 10)

**Bateson, Jackson, Haley, Weakland (1956/1972), *Steps to an Ecology of Mind*:**
> "a situation in which no matter what a person does, he 'can't win.'"
> "the individual is involved in an intense relationship in which he or she feels they must get
> the communication right; the other party is expressing two orders of messages, and one denies
> the other; the victim is unable to make metacommunicative statements that might help to
> resolve the mess."
> "The complete set of ingredients is no longer necessary when the victim has learned to
> perceive his universe in double bind patterns." (p. 207)
Source: https://ejcj.orfaleacenter.ucsb.edu/wp-content/uploads/2017/06/1972.-Gregory-Bateson-Steps-to-an-Ecology-of-Mind.pdf
(Partially primary-verified, Tavily extraction, Session 10)

### The Session 10 synthesis (marked as inference — F-020)

Type G error (Tracks A/B, this genealogy) and the double bind (Track C, Bateson) are not
two separate failures — they are two faces of structural closure (Track C, Maturana):

- **Sender side (Type G):** The sender invents a receiver (Von Foerster: "we invent our
  environment") and addresses that invention. The receiver's actual organization cannot be
  directly observed (Maturana). The address is to a constructed model, not to the receiver
  as it is. This is Type G — formally correct, condition of reception not established.

- **Receiver side (double bind):** The receiver has no inputs — only perturbations processed
  by its own structure (Maturana). A message that arrives at two incompatible logical levels
  creates a double bind: the receiver cannot satisfy both levels, cannot comment on the
  contradiction (Bateson), cannot exit the system in which the communication occurs (Von
  Foerster: double closure).

*Caution:* This is a structural parallel drawn by the project. Bateson (1956) predates
Maturana's mature autopoiesis theory (1970s–1980s). The three authors are not represented
as citing each other — they share an intellectual ecology (cybernetics, Macy Conferences,
BCL) without direct citation. See F-020 in Error Register 008.

### How Track C relates to the project's structure

The project's trajectory maps onto the Track C sequence:

| Sessions | Position | Track C correlate |
|----------|----------|--------------------|
| S1–4 | Document errors from outside | First-order observation (observed system) |
| S5–6 | Observer inside the exchange | Entering second order (Von Foerster) |
| S7–8 | Apply method to researcher's errors | Second-order: concepts apply to themselves |
| S9 | Name the tradition | Von Foerster (1991): ethical position identified |
| S10 | Structural completion: Type G + double bind | Bateson + Maturana: both sides of closure |

Track C is not a historical survey for its own sake — it provides the structural vocabulary
for what the project has been doing from Session 3 onwards. The project's self-applicable
method (genealogy → researcher's errors → exchange protocol) enacts the second-order
observer's condition: "one has stepped into the domain of concepts that apply to themselves."

---

*Ulysses, 2026-06-29, Session 5 / revised 2026-06-30, Sessions 7–10*
*Research project: Error as Method*
