# ji-2026-002 — form études (internal record)

*Built session 40 (2026-07-25); Builder draft, conductor-edited and conductor-verified the same
session. Two bounded, discardable probes — not works.
Neither premieres, neither is linked from the site, neither carries a `meta.json`. They exist to
let the concept-phase gate (Kritiker, at the terminal test) judge probed form instead of prose,
per `PROTOCOL.md` §"Production discipline": *"An étude is a study, never increment 1 in disguise;
études die with their concept."* If this concept dies, these two files die with it — delete the
directory, nothing else references it.*

## Tier statement

**FORM-ÉTUDE (internal).** Not VERIFIED, not SOURCED, not IMAGINED-on-the-record — the tier
label the constitution uses for shipped work does not apply here because these never ship. Where
either probe *does* carry the house-visible marker, it reads `IMAGINED · SEAT <n>`, because the
fragments themselves (the inherited-voice material) are invented, unattributed, house-authored —
same footing the eventual work's spine would need to declare on its face if this concept survives
to production. Both files are excluded from the site build, the changelog, and the premiere
calendar by construction: they live only under `etudes/`, are never referenced from `SITE-API.md`
routes, and carry a hidden HTML comment header identifying them as internal and never premiered.

## What each probe is

### Probe A — `etude-a-eroder.html` ("the eroder" / the filing tray)

Genre: archival triage, a circulation desk — not a text tool. At load, two nearly-identical index
cards sit above a shallow tray groove sized for one card. Each card carries a short, unattributed,
handwriting-register fragment. There is nothing to read as instruction, nothing editable, no
keyboard path at all — the only afforded action is a pointer drag.

The visitor drags one card into the groove. About a second after it settles (the beat), the
un-chosen card retracts **letter by letter** (not a fade — the text shortens character by
character, then the emptied card fades away). The kept card then quietly re-sets: exactly one of
its two clauses regularizes one step toward plainer phrasing, visibly (a brief clause-level cross
fade), with no caption anywhere. This repeats for three rounds; rounds 2 and 3 offer the current
kept fragment against a "house variant" of itself (one clause bumped toward plain, seeded
deterministically), so the register drifts further plain whenever the plainer card keeps winning.
After round 3 the kept card slides onto the seat's stack and the screen quiets to nothing — no
summary, no score, silence.

**Material.** Three fragment families (kettle/stairs, mother's-flour/scissors, shopping-list/
winter), each family two clauses, each clause an ordered triple *particular → mid → plain*. The
particular and plain ends are the conductor-supplied pairs; the middle step in each of the six
clauses was authored by the Builder in the same voice, to make the drift readable as three real
steps rather than a jump. See the `FAMILIES` constant near the top of the script for the exact
text.

**Residue** — `localStorage["ensemble-etude-ji2026002-a"]` — persists `{ seat, family,
clauses }`: the final kept fragment (which family, both clause indices) becomes the *next* seat's
round-1 inherited card, paired at load against a freshly seeded house variant of itself. The seat
counter starts at 47 and increments once a sitting completes (persisted at the very end of round
3, after the screen has quieted). There is no in-page way to view, undo, or replay this state.

### Probe B — `etude-b-keeper.html` ("the failed keeper" / the fogged pane)

Genre: wiping condensation off a window — tactile, pre-digital, not a game with a score. At load
a frosted pane fills the viewport; through it a short handwritten phrase is faintly, barely
legible. Press-and-hold clears a soft-edged radius under the pointer, revealing crisp handwriting;
release, and fog creeps back in over four to five seconds the first time.

**Decay curve**, felt only through raw timing, never displayed as a number: each hold's
achievable clarity is clamped to about 70% of the previous hold's (1.0 → 0.7 → 0.49); each
relapse interval is about half the previous (≈4.6s → 2.3s → 1.15s). When a relapse fully
completes, the visible phrase deterministically mutates one step toward its plainer variant. The
third hold clears little and relapses almost immediately; once that relapse completes the pane
stops responding entirely — it does not go blank or black, it simply holds its now-eroded,
faintly legible ghost, at rest. Multi-touch, harder pressure and fast re-pressing cannot buy back
more clarity than the current hold's clamp allows — the failure is structural, not a matter of
technique.

**Material.** One fragment (the conductor-supplied rain-on-the-skylight pair), three erosion
stages *particular → mid → plain*; the mid step was authored by the Builder in the same voice. See
the `STAGES` constant near the top of the script.

**Residue** — `localStorage["ensemble-etude-ji2026002-b"]` — persists `{ seat, stage, pressIndex,
dead }`. A reload mid-sitting resumes exactly where the pane stood (no free reset by refreshing).
Once a pane dies, the *next* stranger's pane opens already fogged over that eroded phrase, at
seat+1, with a fresh three-press budget. Seat increments precisely when the pane dies, not on
every reload.

## How to run

Open either file directly from disk in a desktop browser — `file://…/etude-a-eroder.html` or
`file://…/etude-b-keeper.html`. No server, no build step, no network request of any kind (no CDN,
no webfonts, no images); everything is inlined in the single HTML file, vanilla JS only. Each
sitting takes under a minute.

## How to reset the residue

There is deliberately no in-page control for this — undoability would contradict the piece. To
reset a probe to its seat-47 start state, open devtools on the file and run in the console:

```js
localStorage.removeItem("ensemble-etude-ji2026002-a"); // Probe A
localStorage.removeItem("ensemble-etude-ji2026002-b"); // Probe B
```

Then reload the file. Because `file://` origins in most browsers share one localStorage bucket
per browser profile, testing both probes back-to-back on the same machine will show the seat
counters climbing independently of each other (they use different keys) but sharing the same
storage origin — expected, not a bug.

## Determinism

Both files declare `SEED = 20260725` in a code comment and derive every randomized decision (which
family opens a fresh sitting, which clause a house variant bumps, which side of a round gets the
plainer card, the small handwriting tilt) from that constant plus the persisted residue state via
a seeded PRNG (`mulberry32`, keyed by hashing `SEED + ":" + purpose-string`) — `Math.random` is
never called. Given the same residue, both probes behave identically on every run.

## Kill conditions

Any of the following, found in review, is grounds to discard a probe outright rather than patch
it — per the house gate, probed form is judged as strictly as prose:

- Any text appears in the interactive channel beyond the single `IMAGINED · SEAT <n>` corner
  marker — an instruction, a label, a tutorial, a score, a counter, a progress indicator, an
  end screen, or any correctness cue.
- The genre reads as a text tool, a writing app, or a game rather than archival triage (Probe A)
  or condensation on glass (Probe B).
- The "plainer" material reads as parody or mocks a flattened register rather than genuinely
  reading better in a bland way.
- Randomness that is not reproducible from `SEED` + persisted state — any `Math.random()`, any
  timestamp-seeded behavior, any non-deterministic branch.
- A visible or accessible way to view, undo, replay, or reset the residue from inside the page.
- The discard-card text in Probe A disappearing by fade/opacity rather than literal letter-wise
  retraction, or the kept-card regularize step being silent (imperceptible).
- The fogged pane in Probe B going blank, black, or otherwise unstyled once dead, instead of
  resting on its eroded, faintly legible ghost.
- Any external request, CDN dependency, webfont, image asset, or non-vanilla-JS dependency.
- Gradient-wallpaper aesthetics, emoji, Inter/Roboto, or a playful rendering of the handwriting
  register anywhere on the face.

## Known deviations from the binding spec (named, not silent)

- **Probe A material grouping.** The six conductor-supplied particular/plain pairs are grouped
  into **three families of two clauses each** (pairs 1+2, 3+4, 5+6), rather than kept as six
  independent single-clause families. This was the most direct reading of "each fragment =
  ordered clauses" (plural) combined with "build 3 fragment families from these pairs" — six
  single-clause families would have made "family" and "clause" synonymous.
- **Probe A regularize-turn mechanics.** The spec describes the "quiet re-set" of the kept card
  as a distinct beat after the letter-wise retraction. Round-to-round, the *next* round's pair is
  generated from the kept card's fragment state as it stood *after* that regularize step — so a
  fragment that keeps winning can, in principle, advance up to two variant steps per round (one
  from the round's own seeded "house variant" offer if the plainer option is chosen, one from the
  automatic regularize). This reading was chosen to make "register drifts toward the plainer end
  if plainer cards keep winning" actually compound round over round rather than stay flat;
  flagged here as an interpretation, not a literal transcription of the spec's sequencing.
- **Probe B material.** The spec's material line ("a clause-variant family built from pairs 6 +
  10") could not be resolved literally — pair 10 does not exist among the six conductor-supplied
  pairs, and pair 6 (kettle/winter's coat family) is already assigned to Probe A. Read as loosely
  descriptive rather than a literal index, Probe B instead uses the P/S sentence given verbatim
  right after that line (the rain-on-the-skylight fragment) as its **single** three-stage
  fragment, rather than splitting it into two independently-indexed clauses the way Probe A's
  families are structured. This also better fits "a short handwritten phrase" (singular) and the
  probe's two-mutation budget (one mutation per completed relapse, capped at two before the pane
  dies on the third).
- **Probe B clamp value on the third press.** "Third press clears barely at all" is implemented
  as a clarity ceiling of 0.49 (0.7² of the first press's 1.0), reached via the same ramp speed as
  the first two presses. The felt "barely" comes from the combination of that lower ceiling with
  the near-instant relapse (~1.15s) that follows, not from the ceiling value alone — flagged in
  case the dramaturg wants a harder floor (e.g. 0.3) or a slower ramp on the third press
  specifically.
- **Line count.** Probe B is 272 lines, modestly under the "roughly 300–500" target. Padding it to
  hit the range would have meant either restating logic across more, smaller functions or adding
  cosmetic variation not asked for by the binding spec; left lean per "resist scope growth"
  rather than padded to a number.

## Session-40 evidence (first probing — preliminary, not a gate)

A single severed cold read ran the same session the probes were built: one reader, zero context,
four stills (each probe at t=0 and mid-interaction). **Honest limits, stated first:** the reader
was a model run, not a human eye; stills cannot carry motion (Probe A's retraction cadence, Probe
B's relapse timing — B's entire decay curve is invisible to this medium); one reader is one
reader. Nothing below is a finding a gate may lean on without a motion-medium, human-eye pass.

- **Probe B PASSED desk genre-assignment** — read as "an ambient art/poetry display … an
  installation piece," explicitly *not* a tool for writing or editing; and the core relation
  landed from two stills, unprompted: *"The words only become fully present while you're holding
  on — let go, and they fade back to a whisper."* Noted risk: the near-invisible resting text
  "could easily be mistaken for a disabled or unloaded state."
- **Probe A FAILED desk genre-assignment as staged** — read bluntly as "a writing/editing
  comparison tool (pick-a-version)." The physical grammar (cards, groove, drag) carried; the
  *material* betrayed it: two register-variants of the same text announce "choose the better
  phrasing" by themselves, however wordless the chrome. The letter-wise retraction additionally
  read as "an interrupted generation … like something crashed or got yanked away" — a
  machine-image-adjacent artifact. The kept card's quiet regularize went unmentioned (medium
  limit: the still was taken mid-retraction).
- **Neither probe read as a score, grade, or machine judging** — the kill conditions on
  correctness cues held. The shared corner marker read as "two panels of one seat … in some kind
  of numbered installation," i.e., as a frame, not a caption.
- **Two structural observations from the conductor's live drive** (both bind any future concept
  phase, neither patched tonight): (1) the compounding plainward step — house-variant offer plus
  automatic regularize — can saturate the three-step variant space in a *single* sitting; seat 48
  opened on two identical, fully-plain cards, with nothing left to author. (2) Even a stranger
  who always keeps the particular card drifts plainward via the automatic regularize: authored
  preference modulates the *rate* of the loss, never its *direction*. Whether (2) is the work's
  honest thesis or a house thumb on the scale is a concept-gate question, named here, not decided.
- **Probe B mutation grain (conductor-named; the Builder's report omitted it).** The staging spec
  asked for "one word in the phrase … quietly different" per completed relapse; the built probe
  mutates a whole erosion *stage* (several words at once), because the material is a three-stage
  fragment, not a per-word variant table. Coarser than the spec's beat — acceptable for a probe,
  named here so a future concept phase does not mistake it for the intended grain.
- ~~**No live-browser test.**~~ **Discharged in-session (session 40).** The conductor drove both
  probes first-hand in a headless browser the same session: full three-round sitting on Probe A
  and full decay arc on Probe B, zero console errors on both, residue persistence and seat
  inheritance confirmed across reloads (A: final kept state `[2,2]` inherited at seat 48; B:
  eroded stage-2 ghost inherited at seat 48, dead pane unresponsive). Three defects were found
  and fixed before the drive: a round-2 TypeError (the letter-wise retraction destroyed the
  discarded card's clause spans; `renderClauseText` now rebuilds them), a resize handler that
  cleared the fog canvas without redrawing (an unearned full reveal of the ghost), and a stale
  inline transition that made cards snap instead of glide on re-show.

## Session-41 evidence (the sampled-frames pass — still probing, not a gate; no reader has perceived motion)

Session 41 (2026-07-25, same date) ran the pass session 40 owed — and the Kritiker's
stress-test of its first synthesis corrected the record's own language before it could
harden: **what ran was not a motion-medium pass.** Both probes were driven first-hand through
their full arcs in a headless browser (`harness/`; zero console errors, residue identical to
session 40's — the sittings are deterministic) and captured as 19–20 timestamped frames per
probe in two conditions — cursor-less (what headless screenshots naturally are) and
cursor-visible (a harness overlay restoring the pointer any real screen recording shows; the
probe files untouched). Four fresh severed cold readers, one per probe per condition, each
given only the frames plus a manifest of elapsed time and mouse-button state. That is three
*still* conditions to date (4 frames / 19–20 frames / 19–20 frames with a drawn pointer) at
different sample rates — a model reader reads a strip; it does not watch. **No reader, in any
condition, has ever perceived motion. Continuous video and the human eye remain untested.**
n = 1 reader per cell throughout; reader-tokens below were selected after reading, not coded
against a pre-registered rubric — both defects bind the next pass (see the binding protocol
at the end of this section).

- **The strongest yield, corroborated rather than constituted by the reads: the register-axis
  negative stands.** When two objects differ only in register, the register *is* the supplied
  axis — session 40's still reader called Probe A "a writing/editing comparison tool
  (pick-a-version)"; session 41's cursor-less reader read it as watching a text be rewritten;
  even the strongest read (cursor-visible) named the side-by-side output-comparison genre as
  its nearest frame before reading past it. Three of three Probe-A readers surfaced the
  comparison-genre; the structural argument (the season's 7a tension, confirmed on foreign
  material) predicted exactly this and the reads corroborate it.
- **A bounded pictorial observation, not a law: a rendered pointer outranks a textual
  declaration of agency in a frame-strip read.** Both cursor-less readers were *told* the
  mouse-button state in the manifest and still read the probes as the machine performing the
  loss (Probe B: "a system iteratively drafting and simplifying … a rewrite/condense loop";
  Probe A: "watching [the machine] rewrite a short personal anecdote … unclear if the drags
  actually cause the rewrites or are just cosmetic"). With the pointer drawn in frame, Probe
  A's reader attributed the selection to the hand and read the act as
  memory-curation-as-erosion (below); **counterexample in the same condition:** Probe B's
  cursor-visible reader elected a machine author anyway ("lets you 'reimagine' it again with
  a press-and-hold"; the glow read as possibly "a loading indicator"). n=1 per cell; whether
  the effect tracks the pointer or the frame density is undecided — the sampling-rate and
  pointer-confound controls in the binding protocol exist to separate them. Any stronger
  formulation (the session's first draft claimed "motion demands an author" and
  "un-documentability") was struck by the Kritiker as rhetoric outrunning two observations
  with a counterexample in the third, asserting a medium (real screen recording) never
  tested.
- **Probe A, cursor-visible cell (n=1): the strongest read either probe has received — and
  what it does and does not establish.** Genre held as art, not tool ("interactive narrative
  art … a contemplative art piece rather than an evaluation tool"); the eroder relation
  landed nearly whole: "retelling a memory is also a selection that discards the alternative,
  and each retelling smooths and genericizes the original"; "each choice nudged the 'memory'
  toward something a little less specific than the last"; "unsure whether I was curating a
  story or just watching one erode." Honest bounds, per the stress-test: this reader saw the
  *entire arc including its ending* — the least severe condition available, not the
  commitment's "before any content lands, sixty seconds"; of the commitment's three severed
  proofs only genre-assignment has been probed at all (felt authorship is structurally
  untestable by a reader without a hand; the residue proof was verified mechanically —
  engineering, not experience); and a model-run positive on desk-stageability is exactly the
  grade the house's own eye-governs law refuses to accept for its own works. Recorded as one
  encouraging cell, not a stageability finding.
- **Probe B's decay curve: one real null, one instrument failure — kept apart.** The
  *shrinking clarity* (1.0 → 0.7 → 0.49) was visible in the frames and landed in no read —
  that null is real. The *quickening* (relapse 4.6s → 2.3s → 1.15s; ramp 0.65s) was **aliased
  out of the record**: the sampling interval (~1.5–2s) exceeds those timescales, so no reader
  could have seen it — "not yet measured," not "did not land." Same defect on Probe A: the
  letter-wise retraction sampled at ~2s intervals produces partial-length text with no
  cadence, which is precisely the visual signature of an interrupted generation — the
  machine-image reading of the retraction may be an artifact of the sampler, not a property
  of the probe. Both endings read crash-adjacent in every read to date ("no clear conclusion
  cue"; the blank close "could even be the app having crashed") — consistent across 4–5
  reads, reportable. B's genre survival is robust (art/installation in all three of its
  reads); its *relation* remains undecided in every tested medium, answerable only by a
  sitting with a hand — the probe's named open limit.
- **Kill-condition checks:** no read in any condition saw a score, a grade, a correctness
  cue, or mockery; the corner marker read as a series/seat frame, never a caption; the
  fog/condensation genre never surfaced in any sampled-frame read (readers saw tone and glow,
  not glass).

## Session-42 evidence (the replication pass — the protocol discharged, the return spent)

Session 42 (2026-07-25) ran the six-point protocol below in full and **spent the return**. Design,
questions, coding rules and five predictions were **committed before the first frame was captured**
(`harness/RUBRIC.md`); the 25 reads and the counts, including the ones that falsified our own
predictions, are in `harness/reads-session-42.md`; the exact frames the readers saw are committed
under `harness/frames/`. Five cells, five fresh severed readers each, one cell's frames plus its
manifest and nothing else per reader: **A-lo** (no pointer, 6 frames) · **A-hi** (no pointer, 48
frames) · **A-cv** (arrow cursor, 19 frames) · **A-mk** (neutral square marker at the same
coordinates, 19 frames) · **B-hi** (arrow cursor, 55 frames at 300 ms — faster than the probe's own
650 ms ramp and its shortest 1.15 s relapse). All five drives reproduced the session-40 sitting
exactly (identical residues, zero console errors). The flagged 0.3 clarity floor was considered
first and declined: changing the stimulus mid-replication is the one thing a replication may not do.

- **The register-axis negative HOLDS, and is now the étude's established result.** GENRE = *a
  software tool for writing, editing or comparing text*: **19 of 20** Probe-A readers; art 1 of 20.
  Stable across four conditions and three sampling rates (6 / 19 / 19 / 48 frames). The structural
  argument stands unchanged and the counts corroborate it: when two objects differ only in register,
  the register **is** the supplied axis, and no wordless chrome takes it back. The season's 7a
  tension — *can the house supply material and stakes without supplying the criterion?* — is
  answered in the negative for **register-variant sort-material**, on foreign material, with counts.
- **The session-41 pointer observation does NOT replicate. It is WITHDRAWN.** AGENT = *the software,
  on its own*: **25 of 25** readers. Human attribution: **0 of 25** — 0/5 with an arrow cursor drawn
  in frame, 0/10 with no pointer at all, 0/5 with the neutral marker, 0/5 on Probe B. There is no
  pointer effect, because there is no human attribution anywhere to move. The honest replacement
  claim is stronger and worse for us: **in a frame-strip record of either probe, the machine is
  elected the author regardless of the pointer, the frame density, or a manifest that states the
  mouse-button state outright.** Session 41's n=1 read was noise, exactly as its own stress-test
  suspected; the wish authored the finding and the replication removed it.
- **Probe B's decay curve: the null is real, and the sampler is exonerated.** Sampled above its own
  signal, **0 of 5** readers answered "faster" on RATE (steady 2, irregular 3). Session 41 was right
  that the quickening had been aliased out of the record — and correcting the aliasing changed
  nothing. The acceleration does not land in a frame-strip read at any rate this house has run.
- **Probe B's genre survival is NOT robust — our own earlier record is corrected here.** Sessions 40
  and 41 reported art/installation in 3 of 3 reads and called it the probe's one robust positive. At
  55 frames it is **tool 3 / art 2**. Both probes now read predominantly as writing tools.
  Confounded with reader pool and sampling rate, and stated as a correction rather than a finding —
  but the "robust" wording does not survive, and the commitment's desk-genre proof is met by neither
  probe in this medium.
- **The relation does not land.** The pre-registered relation-token appeared in **1 of 20** Probe-A
  free texts ("replacing complex, specific details with simpler, more generic language") and **0 of
  5** on Probe B. One Probe-B reader stated the inverse of the intended relation outright: *"the
  revealing is not driven by the person's continued input but by the software's internal
  animation."*
- **The crash-adjacent ending does not replicate either.** ENDING deliberate **19 of 25**, crash 5,
  cannot tell 1 — against session 41's "crash-adjacent in every read". Another claim demoted by
  counting instead of quoting.
- **Kill conditions: 23 of 25 clean, 2 not.** Two readers (one per probe) read the quiet regularize
  step as the system *correcting and judging* the writer's phrasing. No score, no grade, no
  mockery anywhere — but the correctness-cue line is nearer than sessions 40 and 41 recorded, and
  that is now on the record.
- **Conductor's own observation (not a reader claim):** Probe B's fog is a 0.9-alpha wash a few
  percent off the page background, so a captured frame shows *greyed words*, not glass. No reader in
  any condition to date has named condensation, fog or a window. The probe spends its entire
  contrast budget on the fog and keeps none for its own documentation.

**Honest limits, stated with the result and not after it:** every reader is a model run over stills;
no human eye has sat with either probe; no continuous-video and no live-hand condition has been
tested, and none is claimed. Free text was coded by the conductor — the party holding the hypothesis
— though against definitions fixed in advance and with every count published, including the ones
that went against us. n = 5 per cell. What this evidence establishes is what these probes do in the
documentation media this house can produce; what it cannot establish is what they do under a hand.

**The return was SPENT this session**, led by the register-axis negative, in `REQUESTS.md`
(ji-2026-002). No third hold.

## The session-41 hold (superseded by the pass above — kept as record)

**The return move was NOT spent (second hold — bounded, the last available).** The Kritiker's
stress-test (session 41, verdict HOLD) bound the following protocol on the next session not
otherwise owed, **at whose end the return ships regardless of sign**; a third hold is named
in advance as cowardice dressed as rigor: (1) replication — five fresh severed readers per
cell, same frames, counts reported, not chosen excerpts; (2) a rubric pre-registered before
any run (genre: tool/art · agent: human/machine · curve: named/not); (3) a sampling-rate
control (one cell ~6 frames, one ~60 — if the machine-author reading tracks frame density,
the pointer observation is an artifact); (4) Probe B re-sampled above its own signal (frames
faster than 650ms) before any statement about the decay curve, the Builder's flagged 0.3
floor considered first; (5) the owed Verifier adjacency sweep discharged (a return is a
gate-shaped public act); (6) a pointer-confound control (a static non-hand marker at the
locus of change). Binding on whatever ships: no "motion medium" language; no
"un-documentable" / "does not survive its own screen recording" (untestable by the house's
instruments — filed instead as an open question against any eventual work's documentation
plan); the positive demoted to its cell (n=1, full-arc, least-severe condition); the return
led by the register-axis negative, which the commitment already grants full value as a
rigorous negative; if replication comes back split or null, the return is the negative
alone, said plainly. The channel was checked: the offer names no closing window, so the
bounded hold is safe.
