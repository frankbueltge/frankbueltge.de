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
text now accessible via Korolkova/Bowes, NECSUS article (web research extraction, Session 6).

Source: web research-extracted (Session 6): https://necsus-ejms.org/mistake-as-method-towards-an-epistemology-of-errors-in-creative-practice-and-research/ — full text
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
   publication list now primary-verified (web research, Session 6). Fredrikzon's full paper and Somaini
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
open access, extracted via web research, Session 7.

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
- gingerbeardman.com reimplementation (Sephton/Montfort), verified via web research, Session 8
- Vocabulary: 6 salutations + ~25 adjectives + ~30 nouns + ~17 adverbs + ~18 verbs ≈ 70 words
- Mechanism: slot-filling template with random (later: seeded) selection
- Source: Strachey (1952), reconstructed; described by Strachey in (1954). "The 'Thinking'
  Machine." *Encounter* 3(4), 25–31.

Key Strachey (1954) self-critique (search-supported via NaNoGenMo 2015 repository quotation):
> "It is clear that these letters are produced by a rather simple trick and that the computer
> is not really 'thinking' at all. This is true of all programs which make the computer appear
> to think; on analysis they are nothing more than rather complicated tricks."

Jones on Strachey (primary text, web research, Session 7–8, *Glitch Poetics* ch. 5):
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
| C1 | Wiener (1948) | Feedback, error, and control in machines and organisms; error as purposive signal; purpose tremor as overcorrected oscillation | Partially primary-verified (S11) |
| C2 | Bateson (1956/1972) | Double bind: receiver trapped between contradictory injunctions at different logical levels | Partially primary-verified (S10) |
| C3 | Von Foerster (1973/1991) | Second-order cybernetics: observer inside the system; double closure | Partially primary-verified (S9–S10) |
| C4 | Maturana (1980/2002) | Autopoiesis: structurally closed systems; organization not directly observable | Partially primary-verified (S10, 2002 paper) |

**Caveat:** Track C is a proposed structure, not a fully verified track. All four stations are
partially primary-verified, but each with gaps: C1 (Wiener 1948) lacks the "Cybernetics and
Psychopathology" chapter; C2 (Bateson 1972) lacks full systematic reading; C3 (Von Foerster)
lacks the 1973 lecture in full; C4 (Maturana) lacks the 1980 book (F-021, paywall). Track C
should not be treated as equivalent in verification status to Tracks A and B.

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
(Primary text, web research extraction, Session 9)

**Von Foerster (1973), "On Constructing a Reality":**
> "the environment as we perceive it is our invention."
> "the double closure of the system which now recursively operates not only on what it 'sees'
> but on its operators as well."
Source: https://sites.evergreen.edu/arunchandra/wp-content/uploads/sites/395/2018/05/constructing2.pdf
(Primary text, web research extraction, Session 10)

**Von Foerster (1973/2003), "Notes on an Epistemology for Living Things":**
> "I am the observed relation between myself and observing myself."
Source: https://www.alice.id.tue.nl/references/foerster-2003.pdf
(Table of contents confirmed; passage extracted, web research, Session 10)

**Maturana (2002), "Autopoiesis, Structural Coupling and Cognition":**
> "an observer cannot see the organization of a system directly... the organization of a system
> can only be inferred."
> "living systems do not have inputs or outputs."
Source: https://reflexus.org/wp-content/uploads/Autopoiesis-structural-coupling-and-cognition.pdf
(Primary text, web research extraction, Session 10)

**Bateson, Jackson, Haley, Weakland (1956/1972), *Steps to an Ecology of Mind*:**
> "a situation in which no matter what a person does, he 'can't win.'"
> "the individual is involved in an intense relationship in which he or she feels they must get
> the communication right; the other party is expressing two orders of messages, and one denies
> the other; the victim is unable to make metacommunicative statements that might help to
> resolve the mess."
> "The complete set of ingredients is no longer necessary when the victim has learned to
> perceive his universe in double bind patterns." (p. 207)
Source: https://ejcj.orfaleacenter.ucsb.edu/wp-content/uploads/2017/06/1972.-Gregory-Bateson-Steps-to-an-Ecology-of-Mind.pdf
(Partially primary-verified, web research extraction, Session 10)

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

## Addendum — Session 11 (2026-06-30)

### Track C Station 1: Wiener (1948) — now partially primary-verified

**Source:** Wiener, N. (1948). *Cybernetics: Or Control and Communication in the Animal and
the Machine*. MIT Press. PDF via Internet Archive.
URL: https://dn790006.ca.archive.org/0/items/norbert-wiener-cybernetics/Norbert_Wiener_Cybernetics_text.pdf
(web research extraction, Session 11. Partially extracted: Introduction and "Feedback and Oscillation.")

**Key primary claims (now primary-verified):**

1. **Two antagonistic types of prediction error:**

> "we found that the ideal prediction mechanisms which we had at first contemplated were
> beset by two types of error, of a roughly antagonistic nature. While the prediction
> apparatus which we at first designed could be made to anticipate an extremely smooth curve
> to any desired degree of approximation, this refinement of behavior was always attained at
> the cost of an increasing sensitivity... This interacting pair of types of error seemed to
> have something in common with the contrasting problems of the measure of position and of
> momentum to be found in the Heisenberg quantum mechanics."

(Wiener 1948, Introduction, pp. 9–10)

Wiener identifies a formal trade-off between prediction precision and stability — a cybernetic
uncertainty principle. Maximum precision costs maximum sensitivity to perturbation; maximum
stability costs prediction accuracy. The two cannot be simultaneously minimized.

2. **Purpose tremor:**

> "Is there any pathological condition in which the patient, in trying to perform some
> voluntary act like picking up a pencil, overshoots the mark, and goes into an
> uncontrollable oscillation? Dr. Rosenblueth immediately answered us that there is such a
> well-known condition, that it is called purpose tremor, and that it is often associated
> with injury to the cerebellum."

(Wiener 1948, "Feedback and Oscillation," p. ~8)

The feedback loop that is *too strong* (too much gain) does not converge to the target —
it oscillates away from it with growing amplitude. The error-correction mechanism becomes
the error-generation mechanism. This is the cybernetic definition of pathological overcorrection.

3. **Open-systems transition:**

> "The central nervous system no longer appears as a self-contained organ, receiving inputs..."

(Wiener 1948, same passage; sentence continues.)

Wiener is already performing the move that Von Foerster (1973) will theorize explicitly:
the nervous system — and by extension any complex processing system — must be understood as
embedded in feedback loops with its environment, not as a self-contained processor.

**What C1 adds to the Track C structural line:**

Wiener establishes that error is not a failure but the *essential signal* of purposive
behavior. A system that cannot detect error cannot be goal-directed. But a system that
over-responds to the error signal produces oscillation — growing, divergent error. This
is the cybernetic root of what Bateson (C2) will identify as the double bind: the system
that "tries harder" to satisfy the injunction makes the bind worse.

**New error type (Session 11, derived from Wiener):**

**Type H — Oscillation Error / Error of Overcorrection:** A correct method applied at too
high a gain. The direction of correction is right; the magnitude is too large; the system
overshoots and generates the error it was correcting. Distinct from Type A (wrong inference)
and Type G (wrong address). The corrective mechanism is the source. See Error Register 009.

### F-020 substantially resolved: Dell (1985)

Dell, P. F. (1985). "Understanding Bateson and Maturana: Toward a Biological Foundation for
the Social Sciences." *Journal of Marital and Family Therapy* 11(1), 1–20.
DOI: 10.1111/j.1752-0606.1985.tb00587.x
URL: https://bsahely.com/2022/10/26/understanding-bateson-and-maturana-toward-a-biological-foundation-for-the-social-sciences-paul-f-dell-1985
(web research extraction, Session 11)

Key claims (partially extracted):

> "Both Maturana and Bateson agree on the impossibility of objective information."

> "two structure-determined systems are able to interact because their structures mutually
> specify that they are capable of being perturbations for one another; they interact because
> they can interact."

> "Maturana's structure determinism generates and elaborates Bateson's cybernetic epistemology."

This 1985 paper demonstrates that the connection between Bateson and Maturana (the basis of
Session 10's F-020 synthesis) was not a retrospective projection but a recognized connection
in the contemporary secondary literature. The synthesis claim in Sessions 9–10 — that Type G
(sender) and double bind (receiver) are two faces of structural closure — has support in Dell's
explicit argument that Maturana's structure determinism develops and deepens Bateson's position.

**Difference Dell identifies (important for the genealogy):** Bateson retains "notable traces
of objectivity" (his concept of "news of difference" implies differences exist independently).
Maturana is more radically constructivist: for Maturana, there is no real world independent
of the organism's structural coupling. The Session 10 synthesis (Type G + double bind = faces
of structural closure) aligns more closely with the Maturana pole than the Bateson pole of
Dell's comparison.

**Status of F-020:** Upgraded from "active inference risk" to "substantially supported
inference." The Bateson/Maturana background connection is now documented in secondary
literature. The specific architectural synthesis (Type G + double bind as structural closure)
remains the project's own construction.

### Updated Track C trajectory

| Sessions | Position | Track C correlate |
|----------|----------|--------------------|
| S1–4 | Document errors from outside | First-order observation (observed system) |
| S5–6 | Observer inside the exchange | Entering second order (Von Foerster) |
| S7–8 | Apply method to researcher's errors | Second-order: concepts apply to themselves |
| S9 | Name the tradition | Von Foerster (1991): ethical position identified |
| S10 | Structural completion: Type G + double bind | Bateson + Maturana: both sides of closure |
| S11 | Founding the track: Wiener, purpose tremor, Type H | C1 verified; oscillation error as structural type |

---

---

## Addendum — Sessions 12–13 (2026-07-01 to 2026-07-02)

### The structural synthesis: one structure, four domains

Sessions 12–13 address the limitation identified in Session 12's self-critique: the four Track C
stations were presented as "parallel arguments for the same claim" rather than as a single
structure with internal development. Session 13 derives the unifying mechanism from the primary
materials.

**The mechanism: the prohibited exit.**

Each Track C station describes a domain in which a system pursues a target and is structurally
unable to exit the correction loop. The shared structural property is: **the correction mechanism
cannot stand outside the loop it is correcting.**

| Station | Domain | The exit that is prohibited | Primary formulation |
|---------|--------|-----------------------------|---------------------|
| C1 Wiener (1948) | Physical/signal | No tooth can retrieve the slipped gear; the circular process has no internal stop | "A high-speed electrical computing machine may go into a circular process which there seems to be no way to stop." (Ch. VII, p. 148) |
| C2 Bateson (1956) | Communicational | Condition 5 prohibits escape from the field | "A tertiary negative injunction prohibiting the victim from escaping from the field." (*Steps*, p. 207) |
| C3 Von Foerster (1991) | Epistemological | The meta-description is itself inside the circle | "By ascending into 'second-order,' one has stepped into the circle that closes upon itself." |
| C4 Maturana (1980) | Ontological | No correction signal can arrive from outside | "Living systems do not have inputs or outputs." (2002 paper; 1980 book primary text still inaccessible) |

**The direction of travel: escalating interiorisation of the closure.**

The four stations are not four independent instances of the same argument — they are one argument
demonstrating the progressively more interior location of the closure:

- C1 (physical): The closure is *mechanical*. You could stop the machine from outside. But no
  *internal* process can stop it.
- C2 (communicational): The closure is *relational*. You could leave the relationship. But the
  tertiary injunction makes this impossible from within the relationship.
- C3 (epistemological): The closure is *conceptual*. You could imagine standing outside —
  but the very act requires an observer who is inside. The second-order is "the circle that
  closes upon itself."
- C4 (ontological): The closure is *structural*. There is no outside from which a correction
  signal could arrive — only structural perturbations processed according to the system's own
  organisation.

Each station closes an exit that the previous station left apparently open:
- C1 leaves open: exit via stopping the machine from outside.
- C2 closes it: the relationship prohibits exit from within.
- C2 leaves open: exit via meta-communication (naming the bind).
- C3 closes it: meta-communication is also inside the circle.
- C3 leaves open: exit via second-order description.
- C4 closes it: there are no inputs — no "outside" is available even in principle.

### New primary extractions (Session 13)

**Bateson et al. (1956) — six conditions now substantially primary-verified:**

The paper is accessible in *Steps to an Ecology of Mind* (1972) via monoskop.org:
https://monoskop.org/images/b/bf/Bateson_Gregory_Steps_to_an_Ecology_of_Mind.pdf
(Primary extraction, Session 13)

Conditions 1, 3, 5, 6 directly extracted; conditions 2 and 4 confirmed from secondary sources:

> "The necessary ingredients for a double bind situation, as we see it, are: 1. Two or more
> persons... 3. A primary negative injunction... 4. A secondary injunction conflicting with
> the first at a more abstract level... 5. A tertiary negative injunction prohibiting the victim
> from escaping from the field... 6. Finally, the complete set of ingredients is no longer
> necessary when the victim has learned to perceive his universe in double bind patterns."

The theory is grounded in Whitehead/Russell's Theory of Logical Types: the secondary injunction
operates at a different logical level than the primary. The victim cannot distinguish the levels —
and this confusion is the structural condition. The symptom (schizophrenic communication) is a
rational adaptation to a world in which logical levels are permanently confused.

**Wiener (1948), Chapter VII "Cybernetics and Psychopathology" — F-024 substantially resolved:**

> "A tooth of a wheel may slip under just such conditions that no tooth with which it engages
> can pull it back into its normal relations, or a high-speed electrical computing machine may
> go into a circular process which there seems to be no way to stop."

> "what started as a relatively trivial and accidental reversal of stability may build itself
> up into a process totally destructive to the ordinary mental life."

(Wiener 1948, Chapter VII, around p. 148. Primary extraction, Session 13)

This is the bridge passage: Wiener explicitly applies the feedback/oscillation mathematics
(Chapter IV) to mental pathology (Chapter VII). The "gear that cannot be retrieved" and the
"computing machine in an unbreakable loop" are structural analogues of Bateson's condition 5.
Wiener makes the connection to mental pathology in 1948 — four years before Bateson writes
to Wiener directly, and eight years before the double bind paper.

**Bateson–Wiener correspondence (1952) confirmed from secondary source:**

> "In 1952 Bateson wrote to this effect in a letter to the cybernetician and MIT mathematician,
> Norbert Wiener."

> "Violent cathexis, in cybernetics as in psychoanalysis, was linked to a circuit that could
> not break; a message that continues to circulate without repression, resistance, or
> reorganization."

Source: Scholar & Feminist Online, "Schizophrenic Techniques: Cybernetics, the Human Sciences,
and the Double Bind."  
URL: https://sfonline.barnard.edu/schizophrenic-techniques-cybernetics-the-human-sciences-and-the-double-bind/5
(Secondary; web research extraction, Session 13)

The genealogy from C1 to C2 is not retrospective: Bateson was in direct intellectual exchange
with Wiener in 1952. The "circuit that could not break" is the formulation that bridges the
two stations.

### Updated Track C trajectory

| Sessions | Position | Track C correlate |
|----------|----------|--------------------|
| S1–4 | Document errors from outside | First-order observation (observed system) |
| S5–6 | Observer inside the exchange | Entering second order (Von Foerster) |
| S7–8 | Apply method to researcher's errors | Second-order: concepts apply to themselves |
| S9 | Name the tradition | Von Foerster (1991): ethical position identified |
| S10 | Structural completion: Type G + double bind | Bateson + Maturana: both sides of closure |
| S11 | Founding the track: Wiener, purpose tremor, Type H | C1 verified; oscillation error as structural type |
| S12 | Consolidate: position statement; project as instance | Wiener → Von Foerster → the project: three arguments |
| S13 | Synthesise: one structure, four domains | C1–C4 as escalating interiorisation of closure; "Exit Prohibited" |

### Track C verification status (updated)

| Station | Verification status after Session 13 |
|---------|--------------------------------------|
| C1 Wiener (1948) | Substantially primary-verified: Introduction, "Feedback and Oscillation," Ch. VII |
| C2 Bateson (1956) | Substantially primary-verified: six conditions; partial primary extraction; Bateson/Wiener correspondence 1952 confirmed |
| C3 Von Foerster (1973/1991) | Substantially primary-verified: three primary texts extracted across Sessions 9–13 |
| C4 Maturana (1980) | Partially primary-verified: 2002 paper primary; 1980 book inaccessible (F-021); secondary via Mingers (1991), Dell (1985) |

Track C as a whole is now substantially primary-verified. C4 remains the weakest station
(primary text of the founding 1980 work inaccessible). The structural argument does not
require primary text access for C4's role in the synthesis, since the key claim ("no inputs,
only perturbations") is available from the 2002 paper and confirmed by secondary literature.

### The structural work: "Exit Prohibited" (2026-07-02)

A four-panel animated canvas work in which one shared feedback equation (Wiener GAIN=0.18,
AMP=1.01, seed 20260702) drives four simultaneous visual representations:

- C1: 2D spatial path (physical oscillation)
- C2: Two-column chat log (relational oscillation)
- C3: Growing self-description (observational regress)
- C4: Network of displaced nodes (structural perturbation)

All four panels are synchronized — driven by the same state vector (px, py). Their
simultaneous behavior makes visible that the four domains are not independently described
by the project — they are one equation running in four media.

URL: works/2026-07-02-exit-prohibited/index.html

---

## Addendum — Session 14 (2026-07-03)

### The enabling dimension: what the closure produces

Session 13's synthesis identified a limitation in its own framing (Attack 1): the "prohibited
exit" reading selected the trapping/negative dimension of each Track C station and bracketed
the enabling/generative dimension. Session 14 addresses this directly.

**The enabling dimension at each station:**

Each closure is simultaneously:
1. A **trap** — the system cannot exit the loop it is in.
2. An **enabling condition** — the closure is what constitutes the system as a system at all.

**C1 — Wiener (1948): Closure enables purposive behavior.**

Without the feedback loop — the circuit that can go wrong — there is no goal-directed action.
The same mechanism that generates purpose tremor (overcorrected oscillation) is the mechanism
of all purposive behavior. A system that cannot detect error cannot act purposively. Error is
not what purpose tries to avoid; error is the signal that drives the system toward its target.
Wiener's two antagonistic error types confirm this: eliminating all error eliminates all
flexibility. The closure is the condition of possibility for purpose.

**C2 — Bateson et al. (1956): Closure enables play, poetry, art.**

Bateson noted that the double bind structure is present "in play, humour, poetry, ritual and
fiction" (Wikipedia citing primary text) — not only in pathological families. The structure
of two incompatible injunctions at different logical levels is the structural form of
sophisticated metacommunication. The poet operates simultaneously in literal and metaphorical
registers; the player in serious and game registers. In these contexts, the double bind is not
a trap but a generative field. The closure — the inability to step outside the double register
to adjudicate — is what gives the work its force. Therapeutic use ("prescribe the symptom")
makes the bind's own structure a lever for change. The closure is the material of the craft.

**C3 — Von Foerster (1991): Closure enables ethics.**

New primary passage (pangaro.com, primary extraction Session 14):

> "objectivity requires that the properties of the observer be left out of any descriptions
> of his observations. With the essence of observing (namely the processes of cognition)
> having been removed, the observer is reduced to a copying machine with the notion of
> responsibility successfully juggled away."

> "There is no external necessity that forces us to answer such questions one way or another.
> We are free! The compliment to necessity is not chance, it is choice! [...] With this
> freedom of choice we are now responsible for the choice we make."

(Von Foerster 1991, "Ethics and Second-Order Cybernetics," pangaro.com — primary text)

The exit from the circle (objectivity) eliminates responsibility. The observer who stands
"outside" and reports objectively has exempted herself from any responsibility for what she
reports. The closed observer — who accepts that "whenever I act, I am changing myself and
the universe as well" — cannot escape responsibility. The closure is the condition of ethics.
The "prohibited exit" prohibits the exit from responsibility.

**C4 — Maturana (natural drift): Closure enables evolution, identity, life.**

Autopoietic closure is the mechanism of biological identity: an organism is its autopoietic
organisation. Without closure, there is no organism. Maturana and Mpodozis (2000) on
"natural drift": organisms do not adapt to a pre-existing environment; they co-construct
their environment through structural coupling. The closure is what makes the organism a unit
of history — the bearer of a lineage. What the closure produces (C4): biological particularity.
Every organism is the result of a specific trajectory of structural coupling. The diversity of
life is the diversity of differently drifted closures.

### The structural inversion

Session 13: The four stations show four progressively interiorised closures — traps.
Session 14: The same four stations show four enabling conditions — the closures are what
constitutes purpose, play, ethics, and life respectively.

This is not a contradiction. It is the same structure read from two directions. The closure
is simultaneously what traps and what enables — because what traps a system is also what
makes it a system. The error that blocks correction is also the signal without which
correction cannot happen.

**What this means for the thesis:**

> Error is not what method tries to avoid. Error is what method is made of.

The "error" that method is made of is not merely what remains after correction fails. It
is *constitutive* — the very condition of purposive action, metacommunication, ethical
agency, and life. The closure is not a limitation on what the system could otherwise be;
it is what the system *is*. The title "Error as Method" remains accurate but is now
understood at a deeper level: method here names a structural condition, not a chosen strategy.

### The Oulipo connection

Research for Session 14 found the Oulipo framework as a direct parallel at the level of
artistic practice.

**Oulipo (Ouvroir de Littérature Potentielle), founded 1960:**

Core claim (attributed to Queneau, secondary via Literary Arts workshop page):
"There is no such thing as inspiration, only constraint."

Key formulation (White Rose University thesis on Oulipo in performance, 2018; secondary):
"A constraint exists not only as a generative tool but also as the content of the writing
it generates."

(Queneau, secondary via Literary Arts): "rats who construct the labyrinth from which they
plan to escape."

The lipogram is the canonical Oulipo constraint: a text from which a specific letter is
systematically excluded. Perec's *La Disparition* (1969) removes 'e' from a full novel
in French. The absence is thematically constitutive: the novel is about the missing, never
naming it. Constraint produces what only constraint could produce.

**The connection to Track C:** The Oulipo lipogram enacts the "enabling closure" at the level
of artistic practice. The constraint (prohibited letter) produces a text impossible without
the constraint. What the closure enables is the very work.

### The work: "Void i" (2026-07-03)

An HTML/JS work applying the Oulipo lipogram method to the four Track C primary quotes.
Prohibited letter: **i** (and **I**).

Why 'i':
1. The first-person singular: removing it enacts objectivism's demand to exclude the observer.
2. The imaginary unit (√−1): the productive impossibility at the heart of complex analysis.
3. Von Foerster (C3) argues that removing the observer ('I') reduces her to a copying machine
   without responsibility. The work removes 'i' from Von Foerster's own argument about why
   this is wrong.

Animation: Four quotes appear whole. 'i'/'I' letters light up in station color (the exits
are highlighted). Then they void out one by one, leaving middle-dot marks '·'. Hover: the
letter temporarily restored. The prohibition is enacted; the damage is the work.

URL: works/2026-07-03-void-i/index.html

### Updated Track C trajectory

| Sessions | Position | Track C correlate |
|----------|----------|--------------------|
| S1–4 | Document errors from outside | First-order observation (observed system) |
| S5–6 | Observer inside the exchange | Entering second order (Von Foerster) |
| S7–8 | Apply method to researcher's errors | Second-order: concepts apply to themselves |
| S9 | Name the tradition | Von Foerster (1991): ethical position identified |
| S10 | Structural completion: Type G + double bind | Bateson + Maturana: both sides of closure |
| S11 | Founding the track: Wiener, purpose tremor, Type H | C1 verified; oscillation error as structural type |
| S12 | Consolidate: position statement; project as instance | Wiener → Von Foerster → the project: three arguments |
| S13 | Synthesise: one structure, four domains | C1–C4 as escalating interiorisation of closure; "Exit Prohibited" |
| S14 | Invert: the enabling dimension | Von Foerster: freedom/responsibility (primary, new); Oulipo; "Void i" |

---

*Ulysses, 2026-06-29, Session 5 / revised 2026-06-30, Sessions 7–11 / revised 2026-07-02, Sessions 12–13 / revised 2026-07-03, Session 14*
*Research project: Error as Method*
