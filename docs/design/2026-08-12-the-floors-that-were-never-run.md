# The floors that were never run — enforcement, recall, and the licence for duration

**Date:** 2026-08-12 (UTC). **Occasioned by:** Frank's reading of `/atelier/protocol`, the
night of 11./12.08. **Status:** **D1, D2 and D3 approved by Frank and implemented**
(2026-08-12). D4 is not approved and not built. D5 records what is deliberately left alone.
The measurement in §2–§3 stands as written before the decision.

## 1. The question, verbatim

> „sag mal das ist doch maximal confusing und unproduktiv, oder? also das sich arbeiten über
> monate hinziehen können, ich glaube da kommt nichts sinnvoles bei raus und die routine
> verliert sich dabei. ich glaube wir haben hier mit jedem update nicht wirklich optimiert
> sondern einfach einen raum geschaffen in dem nur bullshit produziert werden kann."

And, on the first answer being too quick:

> „ist das nicht zu oberflächlich? also letztendlich kommt es darauf an, was die vorarbeit zu
> negative parallax wirklich gebracht hat und ob das selbe werk nciht auch in 1- 3 nächte
> entstanden wäre und das kann ich nicht einschätzen, also man muss hier die qualität der
> werke bewerten"

That second question is the one this document answers first, because the answer determines
whether the remedy is *repair* or *retreat*.

## 2. What was measured

All figures counted from the committed repositories on 2026-08-12, not estimated.

### 2.1 Throughput, by protocol era

| | v3 nightly (28.06.–18.07.) | v4→v6 work-line (18.07.–12.08.) |
|---|---|---|
| Days | 20 | 25 |
| Shipped | **30 works** | **2 publications** (13 lines opened) |
| Rate | 1.5 / day | 0.08 / day |
| Record of one unit | 3–4 files, ~3–6k words | **211 files, 314,763 words** |

One work-line's record is larger than the entire nightly era's output (238,593 words across
128 files). Bookkeeping per shipped work rose from ~8,000 to ~315,000 words — a factor of 39.

### 2.2 Where the mass sits — `2026-07-23-negative-parallax`, prose only

| Share | Words | What |
|---|---|---|
| **24 %** | 44,703 | method: 23 pre-registrations, 2 controls, a review, two letters |
| 47 % | 87,240 | `TRACE.md` — one section per tick, narration |
| 22 % | 40,691 | `SCORE.md` |
| **8 %** | 14,747 | the work itself (exposition, episodes) |

The method is a quarter of the mass. The narration *about* the work is more than two thirds.

### 2.3 The floors already in force, against reality

| Constitution (v6) | Requires | Actual |
|---|---|---|
| §8 | `SCORE` "as living map (a page, revised)" | 40,691 words (~80×) |
| §8 | "a work's process record < 3,000 words" | 195,965 words (~65×) |
| §8 | "Journal entries ≤ 400 words" | not checked |
| §4 | "SCORE is a living map, not a contract: **short**" | see above |

`tools/validate_v4_projects.py` validates `protocol_version` and the presence of SCORE. **It
checks no size floor at all.**

### 2.4 The memory layer, and why it cannot help

`tools/memory/` — a BM25 recall index over the markdown archive (`index` / `recall`, JSONL) —
was built **2026-07-02**. Two facts about it, and the second is the mechanism.

**First, the constitution stopped naming it:**

| | mentions of memory/recall |
|---|---|
| Protocol v3 | 3 |
| **Protocol v6** | **0** |

**Second — and this is the cause, not the symptom — it cannot see the work-line record.**
`tools/memory/cli.py` fixes its sources in `SOURCE_GLOBS`:

```
journal/**/*.md · works/**/*.md · atelier-feedback/**/*.md · drafts/**/*.md · memory/dossiers/**/*.md
```

`projects/**` is **absent**. The list was written on 2026-07-02, *sixteen days before the first
work-line was opened* (2026-07-18), and was never extended. Every word of the 196,000 that now
constitute a line's record — TRACE, SCORE, the pre-registrations, the controls — is invisible
to recall.

So the sequence is complete and mechanical: the unit of work changed; the memory layer's source
list did not follow it; the only way left to know where a line stood was to read it end to end;
and the constitution then stopped mentioning recall at all, removing even the instruction to
try. That is Frank's "jede Session muss erst tausend Texte lesen", exactly, with a cause.

*Correction to an earlier reading in this session:* the empty `memory/` directory is **not** the
defect. `memory/index.jsonl` is gitignored deliberately (`.gitignore:1`) — the index is derived
data, rebuilt on demand, and the source markdown is the archive. An empty store is the designed
resting state, not a failure.

## 3. What the long form actually bought

The decisive question was whether 315,000 words of preparation bought anything three nights
could not. It did, and it is one thing: **a warrant that requires temporal separation.**

The pre-registrations bit. From the project's own record:

> "One clause of the pre-registration is **refuted by the measurement** (1.01, not 1.1, is the
> commonest value in that literature) and is recorded as a failed fo[recast]"

> "Tick 42's per-TRACE-section prediction **is defeated** — 19, not 20 — and the two offset
> candidates that survived tick 42 are now **falsified**, not merely under-determined"

`PREREGISTRATION-tick32.md` names three queries run *before* the file was fixed and declares
one of them "established before pre-registration and … not counted as a pre-registered
finding" — the honest move that ritual pre-registration omits. Counter-readings are kept
standing and explicitly marked **unrefuted** rather than resolved in prose.

**Verdict, split — because the question contains two:**

- **The artefact** (the interactive page with the locked Gaia parallax): *yes*, a night can
  make this. The nights demonstrably ship comparable pieces with committed `experiment.py`
  and data; *Eight Misprints* (session 44, post-fork) committed 1,708 reference strings and a
  deterministic stdlib-only `measure.py`, and rejected the naive reading in the work itself.
  Nights can do rigour. The artefact is 8 % of the mass.
- **The warrant** (a prediction fixed in one session and refuted by a measurement in a later
  one, with the failure recorded): *not in one night*. This is what "artistic research,
  **under proof**" (`2026-08-01-festival-line.md`) actually costs.

### 3.1 Correction — the warrant needs a session boundary, not months

*Added 2026-08-12 after Frank's objection: „eight misprints ist aber in einer session
entstanden und nicht wie negative parallax nach wochen."*

The objection is right and this section's first form was too generous to the work-line. The
question it failed to ask was **how far apart a pre-registration and its test actually are.**
Measured, from the ten pre-registrations that record their own writing date:

| written | 31.07. | 01.08. | 02.08. | 03.08. | 04.08. | 06.08. | 10.08. |
|---|---|---|---|---|---|---|---|
| count | 1 | 2 | 2 | 2 | 1 | 1 | 1 |

**One to two per day, on consecutive days.** The prediction-to-test cycle is a session boundary
— roughly a day — not weeks. So:

- what the method requires: **two sessions**, i.e. two nights;
- what this line took: **three weeks, 55 ticks, 196,000 words.**

**The months were therefore not bought by the method.** The method ran on a one-day cycle
inside a container that claimed to need months. What the weeks actually accumulated was *many*
short cycles (24 of them) and the latency of writing to someone outside and waiting for a
reply — neither of which needs an 87,000-word trace or an open horizon.

The sharper reading, and the one this document now carries: **a work-line is a chain of nights
with memory.** Its months were, in part, compensating for a memory layer that could not reach
its own record (§2.4). Where a session can recall where a line stood, a "line" need not be a
long-running container at all — it can be a named thread picked up across nights.

That makes §4's "open horizon: months, not days" the bloat generator, not pre-registration.
D3 stands, with its justification corrected: a pre-registered clause licenses **a second
session**, not a season.

### D6 — The horizon closes (decided 2026-08-12)

> Frank's instruction (wording private): strike the open horizon — conditional on the
> measurement really showing the open work-line produced nothing of value and a bounded
> line being just as productive, correct and defensible.

**One premise in that instruction is rejected rather than accepted quietly.** The open
work-line did **not** only produce nonsense. It produced a good, externally corresponded,
corrected work and 24 pre-registered cycles, at least two of them refuted and booked as failed
forecasts. What was nonsense-adjacent was the *narration*, not the result — which is exactly
why this closes a horizon and keeps a method. Agreeing with the harsher premise to obtain the
approval would have thrown away the one thing worth keeping.

The conditions are otherwise met, and checked:

| Frank's condition | Verdict |
|---|---|
| „wirklich so gemessen" | Yes — pre-registrations written 1–2 per day on consecutive days; 58 ticks → 1 published work |
| „genauso korrekt" | Yes — correctness lives in the one-day cycle and the committed evidence, not in the horizon |
| „vertretbar" | Yes, **provided the chain is resumable** — which is what D2a/D2b now make true |
| „genauso produktiv" | Almost certainly better: 58 sessions per shipped work is the worst ratio in the house |

**Two cuts, because the horizon alone would only move the bloat.** §8 read "Dispatcher ticks
serve the work-line **by default**", and an open horizon plus that default is the mechanism by
which every session fed the container and left a trace entry instead of a work.

1. **§4 — the bound.** An arc ships or closes within **twelve worked sessions**, renewable
   **once** and only by naming what the extension buys that the first twelve did not. The
   calendar still never kills a line: waiting weeks on an outside reply costs nothing, because
   waiting is not a worked session. What is bounded is how many sessions a line may **consume**,
   not how long it may **stand open** — which preserves the real latency the letters show
   (23.07.–08.08.) while removing the container.
2. **§8 — the cascade.** Ticks serve the line **only when it has a live pre-registered clause
   awaiting its test**; otherwise the default is a night's own work. A line with no clause
   awaiting test does not get the session by right — it earns it back by writing the next clause.

The two forms converge, and that is the finding, not a compromise: a work-line is a chain of
nights that carries a commitment across the boundary between them.

## 4. The finding

**Every rule this document was going to propose is already in v6.** Short SCORE, capped
process record, capped journal entries, TRACE in proportion — all of it is written, and all
of it is breached by one to two orders of magnitude.

The failure is therefore not a missing rule. It is that **this house writes constitutions and
does not run them.** That is the precise, defensible form of Frank's charge that each update
"nicht wirklich optimiert, sondern einfach einen raum geschaffen" — each revision added text;
none added enforcement.

The same shape appears in the tooling, and there it has a date. When the unit of work changed
on 2026-07-18, the constitution was rewritten three times (v4, v5, v6) and the memory tool's
six-glob source list was not touched once. The rules moved; the machinery that had to carry
them did not. **A house that revises its constitution more often than its tools will always end
up reading what it should be able to query.**

It follows that **writing a v7 with better rules would repeat the mistake.** The remedy is to
make the existing floors executable (D1), repair the one-line blind spot that forces re-reading
(D2), and add exactly one new rule (D3), which the evidence in §3 earns.

## 5. Decisions proposed

### D1 — The floors become executable (no new rules)

Extend `tools/validate_v4_projects.py`, which already runs at the gate, to check the floors
v6 §8 already states:

| Check | Limit | Source of the limit |
|---|---|---|
| `SCORE.md` | ≤ 900 words | §8 "a page, revised" — a page, generously read |
| `TRACE.md` | ≤ 6,000 words live | §8 "in proportion to consequence", made countable |
| a work's process record | < 3,000 words | §8, verbatim |
| journal entry | ≤ 400 words | §8, verbatim |

A line that breaches **parks until it compacts** — the same consequence §4 already gives a
line that misses its increment. Breach is not a moral failure and is not published as one: the
validator names the file and the count, the practice compacts, work resumes.

**`TRACE` becomes append-only with rotation.** One entry per decision: date, tick, the
decision, and a path to the artefact that carries the evidence. When it passes the limit, the
oldest half rotates to `archive/trace/<line>-<n>.md` and stays in git. Narration moves to
where narration belongs — the journal, which has its own 400-word floor.

*Expected effect, applied to the measured record:* prose per work-line falls from ~196,000 to
roughly 60,000 words, with **no methodological loss** — the 44,703 words of pre-registrations,
controls, review and letters are untouched.

### D2 — The index learns where the work went, and recall returns to the constitution

Two moves, in this order. The second is worthless without the first.

**D2a — extend the index to the material that exists** (`tools/memory/cli.py`, `SOURCE_GLOBS`):

```
+ "projects/**/*.md",
```

One line. Without it every paragraph below is an instruction to query a corpus that does not
contain the answer. This is the whole of the mechanism found in §2.4, and it is a one-line fix
that has been outstanding since 2026-07-18.

**D2b — the v6 text gains, in §8:**

> **Memory is recall, not re-reading.** A session orients by querying the index
> (`python tools/memory/cli.py recall "<question>" -k 8`), never by reading a line's record end
> to end. A session that cannot find what it needs by recall says so in the journal and **fixes
> the index or its source list**; it does not fall back to reading the whole trace.

The index stays gitignored and rebuilt on demand — that is its design and it is correct
(`python tools/memory/cli.py index .` at session start, seconds, no state to carry). Nothing is
committed; nothing needs to be.

D2b is a **restoration**, not an invention: v3's "The arrangement you work inside" already named
the recall index as the memory carried between sessions. D2a is the repair that makes the
restoration mean anything.

**D2c — the Foundation is carried, not re-read** (added 2026-08-12 on Frank's question: „das
kann halt nicht jedes mal neu gelesen werden, sondern muss in ein memory und immer verfügbar
sein. ist das so gelöst?").

It was not. The distinction the question makes is the right one, and the answer splits:

- *Retrievable* — **yes, and always was.** `docs/**/*.md` has been in `SOURCE_GLOBS` since the
  tool was written, so recall reached the Foundation before any change this week.
- *Carried* — **no.** v6 named the Foundation **once**, as a path in the appendix. A pointer is
  not an instruction: nothing told a session to consult it, and nothing said which part of
  ~57,000 words across five tranches was load-bearing.

**And it is the same pattern a third time.** A commit of 2026-07-19 put the Foundation into
§3/§5.4/§11 — "the Foundation travels with the practice". Folding v4 into v5 left two appendix
lines; v6 left one. Built, then written out, exactly as the memory tool was.

§8 now names the standing text — `11-FINAL-RESEARCH-FOUNDATION-SYNTHESIS.md` and
`12-FOUNDATION-REQUIREMENTS-FINAL.md`, together under 4,000 words, which a session can carry
every time. The tranches are recalled for anything deeper and never read whole. If the synthesis
and the practice diverge, that is a finding for the journal — a basis the practice may develop,
not a scripture. `test_sources.py` fails if either file goes missing or leaves the index, because
that failure is otherwise silent: recall simply returns nothing and the session reads everything
again.

### D3 — Pre-registration is the licence for duration

The one genuinely new rule, and the only one §3's evidence earns:

> A work-line's arc gate (§4) passes only with **at least one pre-registered, testable
> clause** — a prediction fixed in writing before the run that would settle it. A line with no
> such clause has no warrant that needs months and is returned to the night or the study.
> A pre-registered clause that fails is recorded as a **failed forecast** and is a result, not
> a fault.

This turns "months are legitimate" from a permission into an earned licence, and it names
exactly what the negative-parallax line bought that a night could not.

**Two conditions added by the practice, not by the architect.** The first query run against the
newly-indexed corpus (D2a) returned, in seconds, a finding that had been sitting unread in
`2026-07-24-put-back-on-the-map/TRACE.md`:

> "a pre-registration's value is not in its existence but in one specific act — an **adversarial
> read of it, performed after it is written and before it is executed**. This practice has now
> performed that act once out of three"

> "an instrument whose selection step can see the outcome **is not made sound by the operator's
> good direction**. It is the same fault the work-line studies in its material, found here in
> the apparatus."

Both are now binding parts of the clause: a pre-registration not read against itself before
execution has not been made, and a selection step must be blind to the outcome or the record
says why it could not be and what that costs.

That this arrived by recall rather than by reading is the argument for D2a in miniature — the
practice had already done the thinking; nobody could reach it.

### D4 — The rate becomes visible

The site derives and shows shipped-works-per-week per practice, from the committed registers
(the derivation already exists in `src/lib/engines/`). A 25-day collapse in shipping should be
legible on the surface, not discoverable only by counting directories on request.

### D5 — What is deliberately NOT decided here

- **~~The night as the default unit.~~** *Struck 2026-08-12, on Frank's correction: „die nacht
  ist für die fork version default, aber nicht für die v6."* This was never an open question —
  the fork **is** the nightly practice and v6 **is** the work-line practice, decided on
  2026-08-10. It appeared as a question in an earlier draft of this document because the author
  had folded two settled facts into one imaginary decision. There is nothing here to decide.
- **The error register's dormancy.** Its last entry is 2026-07-13 while the line worked to
  18.07. and runs again. Noted for the practice, not legislated here.
- **`error-as-method` has no memory tool at all** (found 2026-08-12 while implementing D2). Its
  restored v3 names "the recall index" among the tools a session carries between sessions, but
  `tools/` in the fork holds only `validate_v3_night.py` — the index was never ported. So the
  fork's constitution promises a recall layer it does not have, and its sessions read for the
  same reason v6's did. Porting `tools/memory/` there is a small change and is **not** done
  here, because it was not part of what was approved; it is named so it is not lost.
- **`error-as-method`.** D1 applies. D2a is a no-op there (it has no `projects/`) and D2b is
  already true in substance — v3 names the recall index — so the fork inherits the working
  arrangement rather than the broken one. D3 does not apply: it has no work-lines. That the
  nightly line needs the least repair here is itself a data point for the 2026-09-05 reading.

## 6. Files this touches

| File | Change |
|---|---|
| `ulysses/PROTOCOL.md` | §8 gains the recall paragraph (D2) and the countable limits (D1); §4's arc gate gains the pre-registration clause (D3). No paragraph is removed. |
| `ulysses/tools/validate_v4_projects.py` | size floors + park-on-breach (D1) |
| `ulysses/tools/memory/cli.py` | one line: `projects/**/*.md` into `SOURCE_GLOBS` (D2a) |
| `ulysses/projects/*/TRACE.md` | append-only form; existing traces rotate on first breach (D1) |
| `error-as-method/PROTOCOL.md` | recall paragraph (D2) |
| `frankbueltge.de` | rate figure on the practice surfaces (D4); decision-log row |

## 7. How this is verified

The same standard the rest of the house runs under — the floors are checked by a program, not
asserted in prose:

1. The validator fails the gate on breach, and its failure names file and count.
2. A test in `ulysses` runs the validator against the existing `projects/` tree, so the
   compaction of the current lines is proved rather than promised.
3. **A test asserts that every directory a work-line writes to is inside `SOURCE_GLOBS`** —
   the check that would have caught D2a on 2026-07-18 and did not exist. Without it, the next
   change to the unit of work silently blinds recall again, which is the whole failure of §2.4
   repeating.
4. The site's rate figure is derived from committed registers and covered by a test, like
   every other figure on those surfaces.

## 8. The honest risk

This proposal keeps the work-line, which is the form that collapsed throughput by a factor of
19. It does so because §3 shows the form bought a real warrant, and because the measured waste
is in the narration (69 %) rather than in the method (24 %). **If, after D1–D3, the work-line
still ships at roughly 0.08/day while the nightly line ships an order of magnitude faster, the
form is not worth its cost and the 2026-09-05 reading should retire it.** That is the
falsifiable form of this document's own claim, and it is written down here before the fact —
which is, per D3, the only kind of claim this house is supposed to make.
