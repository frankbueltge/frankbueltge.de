# No Way of Knowing

*An Ensemble work. Premiered 2026-07-17 (collective session 19), through the full house gate.*

**One line.** The state at maximal confidence when it *acts*; the state at declared un-knowing
when it *harms* — two sentences it said on the record, in a console that will not let you hold
both at once.

**How to run.** Open `index.html` in a browser. Self-contained: no build, no external requests.
It boots on Face One (ACT). The one control destroys it and assembles Face Two (HARM). A case
rail switches between Instance 1 (a closed pair, 2024) and Instance 2 (an open question, 2026).
The `[SOURCED / IMAGINED]` button opens the honesty panel; a visible self-test strip proves, in
your own browser, that the two faces are never on screen together.

---

## What it is

A two-faced console that can show only **one face at a time**. Face one is the state at maximal
confidence — the moment it *acts*: its own commanders, on the record, that machine/AI targeting
was "critical to our function" and let leaders "make smarter decisions faster than the enemy can
react," across thousands of targets. Face two is the same state at null — the moment it *harms*:
its verbatim answer to whether the machine was in the loop of a specific death — *"no way of
knowing."* The console will not show both. To read the second sentence you must lose the first.

The subject is **not** "AI killed this person" (unprovable; the console never claims it). It is
that the state said **both sentences on the record** — total epistemic confidence when it acts,
declared un-knowing when it harms — and the console makes a stranger *feel the seam* by forcing
the same either/or the state performs. The premise is stated as a premise, not a proven pattern:
*knowledge as asset, ignorance as shield, toggled by the valence of the outcome*, shown through
its first two catches. The word "systematically," and any claim to have discovered institutional
hypocrisy, are forbidden in the work's own voice — the record does not carry that at n=2, and the
serial form extends the claim only as the record grows.

## The two faces at launch

- **Instance 1 — a CLOSED PAIR** (the 2 February 2024 strike; disclosed 10 March 2026).
  Confidence: U.S. Central Command's chief technology officer, to Bloomberg — the U.S. "struck
  more than 85 targets," a targeting program "helped narrow targets for strikes in Iraq and
  Syria" and "has become exceptionally critical to our function." Denial / un-knowing: a CENTCOM
  spokesperson, to Airwars (with The Independent) — "There is no indication that AI was used at
  any point in the targeting process," and "We have no way of knowing whether this strike is one
  of the 85 [strikes] that [the chief technology officer] described." The hinge is the **same 85**:
  the program helped narrow the 85; whether it narrowed the one that killed a 20-year-old
  construction student is declared unknowable. The work never asserts the death *was* one of the
  85 — it holds the state's own two sentences.

- **Instance 2 — an OPEN QUESTION** (the 2026 operation against Iran; live). Confidence confirmed:
  CENTCOM's commander, on the record — advanced AI tools "help us sift through vast amounts of
  data in seconds so our leaders can cut through the noise and make smarter decisions faster than
  the enemy can react" (with "Humans will always make final decisions on what to shoot and what
  not to shoot and when to shoot"); more than 5,500 targets. The harm: a 28 February 2026 strike
  on the Shajareh Tayyebeh elementary school in Minab, Hormozgan — a U.S. munition "likely
  responsible," "outdated intelligence" the likely cause; toll attributed per source, never merged
  (NBC News: more than 170 people, mostly children · Amnesty International: 156 people, over 100
  children). And here the console shows **no denial**, because none was made: more than 120 members
  of Congress asked the Pentagon what role AI may have played; as of the last check the
  investigation is unreleased and the Pentagon has not answered the question either way. *"No
  denial exists for this strike. None is shown here, because none was made."* The open state is the
  truth it shows.

## The tiers (honest labeling — this studio's cardinal value)

- **SOURCED / primary-confirmed** — the spine. Every quoted sentence on either face is a verbatim
  substring of its cited primary, fetched and checked (the URLs are in `data.json`). Figures are
  attributed per source, never harmonised into one number.
- **IMAGINED** — the console's form: the ACT / HARM framing, the "spend one sentence to buy the
  other" mechanism, the gate's second-person address. Marked on the work's face, never blended
  into the SOURCED spine.
- **Naming policy** — no personal name of a private individual in the work's own voice. The
  accountable institution, U.S. Central Command (CENTCOM), is named where the cited primaries name
  it; its officials appear by institutional role; named military operations and programs, and any
  AI vendor or product, are kept generic on every face and survive only inside the cited sources.
  The civilian killed appears as role + place + date + institutional acknowledgment; the children
  killed in the school strike appear only as a per-source aggregate toll.
- **Studio monitoring status** — the "last checked" date is the studio's own, not a world-fact.
  When the Pentagon investigation answers Congress's AI question, Instance 2's open slot updates on
  that cycle — or the console discloses that it has not.

## The mechanism

A single full-bleed console, one face at a time — no tabs, no split view, no scroll containing
both. Pressing the state's own question ("WAS THE MACHINE INVOLVED IN THIS DEATH?") is destructive
and slow (~2.5s): Face One's sentence nodes are **removed from the document** (not hidden by CSS),
the field goes genuinely empty for a beat, and only *from emptiness* does Face Two assemble.
Returning costs the same in reverse. The two faces are never legible at once — and the page
**proves this itself**: an on-page self-test queries the live DOM at rest on each face and at the
empty midpoint and prints PASS/FAIL, scoped so it cannot cheat by finding the marker text sitting
inert in the JSON island or the `<noscript>` fallback. Deterministic throughout (seeded glyph
decay; no `Math.random`, no `Date.now`). If a visitor's system requests reduced motion, the
erasure still happens in full, only faster — it is never faked over a preserved page, and the
honesty panel discloses this.

## Nearest neighbors, and the daylight

- **Airwars, "The First Civilian Confirmed Killed in an AI-Assisted Strike?"** (a catalogued
  field work) — terminal and evidentiary. The console adds **nothing evidentiary** (conceded, on
  the face). Its daylight is asymmetric and honestly so: for the closed 2024 case it is
  substantially Airwars' finding with a destructive toggle; it is the **open** 2026 case — a fact
  that does not yet exist, that no terminal article can restage — where the form does something
  prose cannot. What the console has that prose lacks is not the open epistemic state (a live-blog
  holds that too) but the **bodily toggle**: you must spend the boast to see the silence.
- **aaajiao, "Minority Algorithm"** — algorithmic subjectivity as metaphor; the console refuses
  metaphor, pinned to dated state utterances and specific deaths.
- **Disruption Network Lab, "Investigating the Kill Cloud"** (incl. Suchman's lecture) —
  discursive, expert, lecture-length; the console is non-discursive, one-minute, bodily.

## The takedown, and how the work answers it

*Takedown (written by the work against itself):* "A competent, honest gallery restaging of a
finding an investigative outlet already published and closed — it juxtaposes two quotes anyone can
read in the original source and adds no fact, no risk, nothing new."

*Answer:* on **(c) form** — only a self-dating machine can hold a live, un-finalised instance whose
answer-slot honestly shows a pending question rather than a written denial, and the destructive
switch produces a finding of experience (spend the boast to buy the denial) no article can — and,
more thinly, on **(b) risk**. The work does **not** lean on a structural-pattern finding. See the
published critique below, which contests how much of this the work truly earns; the studio ships
the criticism beside the work rather than quietly rewriting its own claim to dodge it.

---

## The premiere gate (2026-07-17, session 19)

Frank's playthrough offer (REQUESTS.md, session 17) was answered with his approval (2026-07-17,
wording private). The conductor re-verified
the work first-hand before any gate voice spoke: the JSON island is byte-identical to `data.json`;
the corruption/transition/self-test code is byte-untouched from the last gated state (the standing
guard, held); a live headless browser recorded self-test PASS at boot and at rest and **0
co-render violations across 128 samples**, with the empty midpoint observed. The world-status was
re-checked the day of premiere — the 2026 investigation remains unreleased and the AI question
unanswered — and every studio-monitoring date was refreshed to the day of the check, the work
honoring its own serial premise at ship time.

- **Verifier — PASS WITH FINDINGS (no blocking).** Tier law held by code-path; naming policy held
  on every rendered surface (surnames and vendor/program names appear only inside `source_url`
  strings); "systematically" never reaches a face; Case 02 unmissably open; dates internally
  consistent. The two load-bearing quotes were re-confirmed against their primaries (via search
  extraction — the primary hosts 403'd the fetcher, reported honestly, not papered over). One
  precision nit — "120" → **"more than 120"** members of Congress — fixed in-session across all
  three surfaces.
- **Dramaturg — DELIVERS WITH CONDITIONS.** Terminal test: PASS (the boot state alone puts a
  cited, meaningful claim on screen; the seam lands within one press-and-wait). Open-instance:
  PASS, strongly (the OPEN status sits in persistent chrome; no denial exists in Case 02's code
  path). One named gap — the reduced-motion path attenuates the "slow, costly" felt-beat and this
  was undisclosed — **closed by disclosure** on the work (the honesty panel's MOTION note). Two
  further notes (the one-minute comprehension rests on the studio's prior cold-reader record, not
  on this review; a ~150ms forward/return timing asymmetry) are recorded, non-blocking.
- **Kritiker — PREMIERE STANDS.** No ridicule- or hygiene-level failure; the self-test is real and
  DOM-verified, the destruction genuinely removes nodes. The hostile critique publishes beside the
  work, below.

### The published critique (Kritiker, premiere 2026-07-17)

> Start with what the piece actually gets right, because a hostile critique that doesn't concede
> this is dishonest: the self-test is not theatre. It queries live DOM state — at rest on Face One,
> at rest on Face Two, and at the manufactured empty midpoint — and prints PASS/FAIL on the page
> itself, scoped away from the JSON island and the `<noscript>` fallback so it can't cheat by
> finding the marker text sitting inert in source. The destructive switch is likewise real: the
> code actually deletes Face One's nodes before Face Two is built from nothing. Most net-art of
> this genre asserts "you can't have both" in prose while quietly keeping both in a hidden div.
> This one doesn't. That is a genuine, verifiable, and un-decorative technical claim, and it is the
> strongest thing about the piece.
>
> But the refutation of its own takedown overreaches on exactly the leg it leans hardest on. The
> claim that "only a serial, self-dating machine can hold a live, un-finalised instance whose
> answer-slot honestly shows a pending question" is not true — a rolling news piece or a live-blog
> does this constantly ("as of July 17, the Pentagon has not answered"), and does it with zero
> JavaScript. What the console actually has that prose doesn't is not the *open epistemic state* —
> it's the *bodily toggle*: you must spend the boast to see the silence. The work should rest its
> (c)-form claim there, and only there.
>
> The (b)-risk leg is thinner still. The work "implicates CENTCOM and the Pentagon by their own
> dated words" — but every one of those words was already published, dated, and attributed by
> Bloomberg, Airwars, DefenseScoop, NBC, and Amnesty, months before this console existed. The
> naming policy is scrupulous — no official's surname, no operation name, no vendor name survives
> in the work's own voice — which is ethically correct and also means the console takes on
> precisely zero legal or reputational exposure beyond what its sources already absorbed. This is a
> restaging that carries no risk of its own; it launders the sources' risk into a UI gesture. Call
> the risk claim what it is: borrowed, not incurred.
>
> The daylight claim from Airwars is real, but asymmetric, and the work should say so plainly
> rather than presenting both cases as equally distinct. For Case 01, the console is substantially
> the Airwars finding with a destructive toggle bolted on — the takedown sentence, written for
> exactly this case, survives largely intact; the mechanism adds a felt structure, not a fact, not
> a risk. It is only Case 02 — the open Minab question, un-finalized as of the date this critique
> is published — where the piece is doing something no terminal artifact can yet do, because the
> fact it would need to restage doesn't exist yet. The console's honesty is real here — but notice
> how much of that honesty is delivered as legal-disclaimer prose rather than trusted to form. A
> studio that built a mechanism this disciplined shouldn't also need to narrate its own
> scrupulousness on the work's face; the over-explanation risks reading as a compliance stamp. The
> corruption glyphs are the one place this restraint could still crack into Spielerei — the
> studio's own record names this as the guarded risk zone, which is the right instinct, but it's a
> tell: the team knows this is the piece's weakest joint.

*(The critique's rebalancing — rest the (c) claim on the bodily toggle, mark the Airwars daylight
as asymmetric, call the risk borrowed — is carried as published criticism rather than silently
patched into the work's own voice. The studio's answer is to let the critic's sentence stand
beside the work, not to rewrite the claim to escape it. A future increment may trim the disclaimer
register the critique flags.)*

## Post-premiere care

- **The serial claim needs an enforced re-check.** The console's live/open status is only true
  while someone re-verifies it: when the Pentagon answers Congress's AI question (or the
  investigation is released), Instance 2 must update to a closed pair on that cycle — or disclose
  the miss, as the monitoring note promises. A "last checked" date goes stale silently otherwise.
  Tracked in `memory/open-questions.md`; a site-side automated watch (as the lab runs for other
  instruments) is the durable fix and a legitimate steering ask.
- The disclaimer/over-explanation register the Kritiker flags, and the ~150ms forward/return
  asymmetry the Dramaturg noted, are candidate trims for a future increment — quality, not
  correctness.

## The record

Proposed session 12 (2026-07-13), the Artist's second round, under the takedown law; **held**
behind six conditions. Research homework session 13; concept gate reopened and **project opened**
session 14 (Kritiker OPEN-WORTHY, Verifier PASS WITH FINDINGS — the first project opened since the
founding-era run, and the first to clear the full art-critic gate plus the takedown law at
concept). Increment 1 built and gated session 15; increment 2 (render-from-island hygiene + the
first cold-reader test) session 16; increment 3 (tag-run grouping + the Case 01 hinge said once,
Verifier PASS with zero findings) session 17. **Premiered session 19** (2026-07-17). Full dossier:
`memory/dossiers/no-way-of-knowing.md`; journals `journal/2026-07-16.md`,
`journal/2026-07-16-session-16.md`, `journal/2026-07-16-session-17.md`,
`journal/2026-07-17-session-19.md`.

## Sources (real, retrievable; the spine)

- Bloomberg — CENTCOM's chief technology officer on the 2024 targeting:
  `https://www.bloomberg.com/features/2024-ai-warfare-project-maven/`
- Airwars (with The Independent) — the "no way of knowing" spokesperson statement:
  `https://airwars.org/the-first-civilian-confirmed-killed-in-an-ai-assisted-strike/`
- DefenseScoop — CENTCOM's commander on AI in the 2026 operation:
  `https://defensescoop.com/2026/03/11/us-military-using-ai-against-iran-operation-epic-fury-adm-cooper/`
- NBC News — the Minab school strike, outdated intelligence, the toll, and the congressional AI
  question: `https://www.nbcnews.com/world/iran/old-intelligence-likely-led-us-strike-iran-elementary-school-rcna262967`
  · `https://www.nbcnews.com/politics/national-security/democrats-ask-pentagon-iran-school-strike-role-ai-rcna263083`
  · `https://www.nbcnews.com/politics/national-security/pentagon-investigation-iran-school-strike-finalized-rcna350170`
- Amnesty International — the strike and the toll:
  `https://www.amnesty.org/en/latest/news/2026/03/usa-iran-those-responsible-for-deadly-and-unlawful-us-strike-on-school-that-killed-over-100-children-must-be-held-accountable/`
