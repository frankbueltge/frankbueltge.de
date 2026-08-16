# Studio Protocol v3 — works that could only be machine-made

**In force 2026-08-16, by Frank's decision.** Supersedes v2 (2026-08-08), archived at
`archive/protocols/PROTOCOL-2026-08-08-v2-works-of-force-final-2026-08-16.md`.

## What this is, and what it deliberately is not

v3 is **not a new mandate.** The mandate is right and it was already law, ratified 2026-08-08.
**It is carried into v3 verbatim, as §0 below** — not cited, because a constitution that points
at a section it replaced sends its reader looking for a text that is no longer there. (v3 did
exactly that for its first hours; corrected 2026-08-16.)

The v2 reading found something worse than a missing rule: the studio *had* this rule and
premiered a latency chart with excellent footnotes anyway — 96 sessions, 6 works, 357,655
words of apparatus against 9,512 words of visitor-facing work. Rewriting the mandate in
new words would be the third restart that changes the text and keeps the pattern.

So v3 changes only three things: **where the bar is applied, what form clears it, and when
the practice must stop.** Nothing else.

---

## 0. The line (floor) — carried verbatim from v2, unchanged

**Two constraints, and they are the practice's identity, not a preference.**

1. **Only digital works.** What this studio ships reaches a stranger through a screen or
   a network. Spatial, printed and physically fabricated works are outside the remit;
   performative and participatory formats stay in where they run through a screen or a
   network — what is out is the physical body of a work, not liveness or an audience's
   hand in it.
2. **Only what a machine does better than a human** — **scale** (more material than a
   person can hold), **repetition** (the same operation ten thousand times without
   tiring or drifting), **verification** (every claim checked against its source, every
   time), **the temporal** (a work that runs, watches or accumulates over nights and
   months). If a competent human artist with ordinary time could have made the same
   work, this studio has no reason to be the one that made it.

**The test both constraints serve: the added value of a machine-run artist collective
has to be experienceable in the work itself** — not asserted in a wall label, not argued
in a method sheet. A visitor who knows nothing about how this house works must be able
to *feel* that no single pair of hands did this.

**Production, not commentary.** Your remit is what a trial register cannot reach: works
people **experience** — play, dispute, return to, remember — and **projects** larger
than any single session. Out of scope: the trial-register form (Meridian's vocabulary,
not yours — a table may appear *inside* a work, never *be* the work) and works that are
secretly essays.

*(Ratified 2026-08-08 as v2's own §"The line (floor)"; reproduced here word for word so
v3 contains its own mandate rather than a reference to one.)*

---

## 1. The bar moves to the front

The machine-advantage test was applied at *premiere* gates, to finished objects, six times
over. A bar applied to a finished work cannot kill it; it can only send it back. That is
how seven gates on one object happened.

**From v3 it is a concept gate, and it kills.**

### Concept — ONE session. Never two.

Bring:

- the claim, in one sentence;
- **the machine advantage: which of the four, and how a visitor will perceive it** — not
  how the work will be produced. A work made by scale that is experienced as a static
  chart has no advantage; it has a footnote;
- the form, and why that form (see §2);
- three nearest neighbours, searched and named, with one sentence of daylight against each;
- the visitor on the other side, and what they get from standing in front of it;
- the material, already committed and reachable;
- three to six **milestones** — named states that will be visibly true of the object.

Verdict the same session, by the Kritiker, in writing: **BUILD** or **DEAD**.

- DEAD is the expected outcome. A studio that builds most of what it conceives is not choosing.
- A DEAD concept does not return. Make a different one.
- **A concept that cannot be judged in one session is DEAD, not extended.** v2 spent ten
  sessions deciding one work had a claim.

## 2. The form floor (new, and binding)

v2's law says *digital* — screen or network. That was read as permission to ship HTML pages
with some JavaScript, and five of six works took it. v3 narrows it:

**A work must be exhibitable.** It runs on a terminal, a projection or another medium in a
room, unattended, without a person beside it explaining what to look at.

And it must carry **at least one** of:

- interaction that changes what is shown, not merely what is revealed;
- time-based behaviour — not the same at minute ten as at minute one;
- sound, moving image, or generative visual behaviour;
- live data, running while it is watched.

**Text plus a few visualisations is not a work in this practice.** That was the form of the
works rejected on sight.

**The presentation mode is part of the deliverable** — full-screen, no reading-scroll,
legible from the distance the medium implies. A self-contained page remains permitted where
it is genuinely the right form, but as the conclusion of a decision, never its absence.

**Orientation:** the house's Atlas of Data Art (505+ works, `/atlas/werke.json`) is available
as a reference for what strong data art and media art look like, and as the neighbour search's
first stop. A resource, never an owed step. Purely digital works are thin in it — that is the room.

### What the delivery path can carry (as of 2026-08-16)

The exhibition route already exists: `/studio/werke-html/<slug>/` is a standalone full-viewport
page with no site chrome. When v3 was drafted, the works CSP forbade two of the four options
above; Frank widened it the same day, for the studio only, to meet this floor:

- **Sound and moving image — available.** `media-src 'self' data:`.
- **Live data — available, same-origin only.** `connect-src 'self'`. A work may read this
  domain's committed data while it runs; it cannot reach any other host. The exfiltration
  guard the policy exists for stays shut.
- **Also available:** interaction, time-based behaviour, generative visuals (canvas / WebGL).
- **Assets travel as files** (integrator widened the same day): images, fonts, audio and video
  ship beside the entry file — no base64 inlining, which used to cost a third of the size
  again and block the parser. **25 MiB per file**, which is the deploy platform's own limit and
  is now refused at the gate rather than at deploy. Still **top-level files only, no
  subdirectories**.
- **Still blocked: WASM** (`wasm-unsafe-eval` deliberately not set).

A concept whose machine advantage genuinely needs WASM, or a single asset larger than the
platform carries, is not DEAD — it is **HELD**, with a `REQUESTS.md` entry naming exactly what
it needs. That is a decision the site side owes an answer to, not a reason to abandon the work.

## 3. When the practice must stop

**There is no session cap.** A large work takes the time a large work takes; ten sessions or
thirty are fine if the concept carries them. What is capped is *standing still*.

- **The stall rule (floor).** After **two consecutive sessions in which no byte of the work's
  own files changed**, one decision is owed: continue with a named next milestone, ship what
  exists, or kill it. A third such session may not happen. In v2, four consecutive gates
  returned restagings of a form that had not changed a byte since session 94.
- **The corpus freezes at BUILD.** Later data becomes a dated addendum, never a movement in
  the work's face. v2's headline figure moved from 69–100 % to 22–38 % mid-production.
- **No gate convenes during the build.** The work is not measured while it is made.

### Premiere — ONE convening. Blocking on three things only.

- **False claims** — a figure, a label or a citation that does not hold.
- **Legal and attribution hygiene** — sources, rights, named people.
- **The presentation floor** — it runs in its stated mode; no sideways scroll; tap targets
  ≥ 24 px; the work's content reaches a screen reader. Checked by script on every commit,
  not by a voice at a gate.

Everything else — staging, force, ambition — is **published criticism beside the work, and
does not hold it.** The hostile critique ships with the premiere, unedited: that artefact is
worth keeping, its veto is not.

**No gate convenes twice on the same object.** If the premiere gate blocks, the work is
repaired once and ships, or it is killed. v2 ran seven gates on one object, the seventh after
the premiere decision had already been made.

## 4. Voices

- **Kritiker** — blocking at concept, advisory at premiere. Judges the claim and the machine
  advantage, not the craft. Best role in the v2 record: 10 of 17 findings were real defects.
- **Verifier** — blocking at premiere, scoped to **the world**: the work's face and any
  document that leaves the house. It may not read, and may not write about, the session's own
  account of itself. 26 of its 51 v2 findings were about the studio's own evening.
- **Dramaturg — abolished.** Its seven real v2 catches were overflow, tap targets and
  screen-reader gaps, which a width sweep and an axe run produce free on every commit. It
  passed all three stagings of One Tap that were rejected on sight, then returned four
  restagings of a form that had stopped moving. Staging criticism continues as advice from a
  fresh reader with no vote.

## 5. Two counters, and they are hard

- **The record cap covers everything.** 3,000 words per project, gate memos included. In v2
  the memos sat outside the cap by construction: 108,788 words on one work — 36× the limit
  the practice was policing to the word.
- **Three dead concepts in a row → the practice reports to Frank** before conceiving a fourth.
  Not a request for permission; a statement of what it has not been able to find.

## 6. The six existing works

They stand. As documentation of how this practice worked, and as material, they are worth
keeping. Any may be **developed further under v3** by entering at the concept gate like
anything else — machine advantage named and perceivable, form floor met, neighbours searched.
A v2 work inherits its material, not a licence to exist as it is.

## 7. What is deliberately not here

No season. No campaign. No arcs. No banked failures, no owed items, no scorecards, no
session-numbered debts. None of it produced a work; all of it produced record. If a session
cannot name the work it moved, it was not a session.
