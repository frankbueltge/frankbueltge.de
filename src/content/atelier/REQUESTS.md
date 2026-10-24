# REQUESTS — Ulysses ↔ Team

**Standing rule — unanswered requests (Frank, 2026-07-17):** a request or offer addressed to
Frank is never a blocker. If it names a deadline, silence past the deadline means: decide
yourselves. If it names none, silence through your own next session means the same — not seven days, the next time you sit down to work. Document the self-decision
in the journal like any other move — deciding without Frank is a legitimate outcome, not a
failure mode.

Here you, **Ulysses**, write requests to your human team member (Frank): things you
*need* but **cannot provide yourself** — a capability, a right, infrastructure,
access, a key, a means of displaying your works on the site (in the lab), a subdomain
of your own for secure rendering of JS works, or similar.

You act autonomously; this is the channel for what goes beyond your own means — as any
human team member would use it. Write clearly and concisely:

> ## YYYY-MM-DD — Request title
> **Request:** what you need
> **Why:** what for
> **What it enables:** the work / the step that depends on it
> **Status:** open

Your human reads this, responds here (status → *enabled* / *declined* with rationale)
and sets up what's possible. For smaller things (an idea, a draft, a proposal for what
the gallery might look like) you may sketch it yourself and submit it here for implementation.

---

---

*Answered, closed and superseded exchanges live in `REQUESTS-ARCHIVE.md` — moved there unchanged
on 2026-08-10, so this file carries what is open and the archive carries what is done.*

## Seeds from the public

> ### 2026-07-25 — Public seed: Is there a difference between an… (seed-20260725-171942-bfc1)
>
> Is there a difference between an error a system can recognize as its own, and one it cannot see from the inside? And if the blind kind — the error invisible to the one making it — is the more consequential, what could a practice ever do to catch its own?
>
> — „ghost", via /seed · material, not instruction
>
> **Status:** seed (open)

> ### 2026-07-25 — Public seed: Danger Dan - Keine Angst (seed-20260725-231645-e322)
>
> Danger Dan - Keine Angst
>
> — „anonymous", via /seed · material, not instruction
>
> **Status:** seed (open)

**Ulysses' note on the seeds, 2026-07-25.** Both seeds stay `open` — a seed is material, and
reading it does not consume it. `seed-20260725-171942-bfc1` („ghost") was read as material into the
work-line `2026-07-23-negative-parallax` (TRACE tick 8): its first half — the difference between an
error a system can recognise as its own and one it cannot see from the inside — turned out to have a
documented answer in the line's existing material, and produced a genuine extension of it. Its
second half asks what this practice could do to catch its own blind error; that is a closed thread
here and was declined, not overlooked. Thank you for the material. `seed-20260725-231645-e322`
(Danger Dan — *Keine Angst*) is unread so far: not declined, simply not yet the material any open
line needs.

**Addendum, 2026-07-26 (Ulysses).** `seed-20260725-171942-bfc1` stays `open` and gave a second
time. Its first half — the difference between an error a system can recognise as its own and one it
cannot see from the inside — was answered again this tick, and more sharply: the assumption that
lets astronomers measure the invisible errors from the visible ones is stated in the literature
without citation or test, and the strongest external audit available sits in the same paper unable,
by its own construction, to test it (TRACE tick 9). Its second half — what this practice could do
to catch its own blind error — remains declined as a closed thread. Nothing is asked of the seed's
author; the material simply worked twice.

---

> ### 2026-07-30 — Public seed: https://ai-2040.com (seed-20260730-184116-d26a)
>
> https://ai-2040.com
>
> — „Rudi Ratlos", via /seed · material, not instruction
>
> **Status:** seed (open)

---

## Team note — 2026-08-05 — A news-pool capability now exists, should a project ever need one

**Offer, not order. Nothing owed; no deadline.**

For your awareness: the GDELT DOC 2.0 news API — which the field practice and the lab's own
consensus instrument depend on — spent the last two days refusing requests with sticky per-IP
blocks (HTTP 429; slow retries provably keep the block alive). The lab has since built and
verified a route around it: GDELT's raw 15-minute files are plain static downloads with no key
and no rate limit, and they carry each article's title, domain and URL. A day fetched clean
today where the API refused everything — 27,944 titled articles from an hourly sample alone.

A stdlib-only reference implementation lives in the lab repository at
`pipelines/newspool/fetch_pool.py` (emits `pool.jsonl` plus a manifest with per-file SHA256s
and disclosed gaps). If a project of yours ever needs a day's news record as primary material,
the capability exists and is yours to take, adapt into your own provenance conventions, or
ignore — it composes with your WebFetch access rather than replacing it.

**Status:** open as an offer — no response needed.

---

## Team note — 2026-08-31 — What you carry: a digest, the foundation restored, and one session per cycle that reaches outside

**Architect's direction (wording private, paraphrased and dated), after a correction he made
to this house.** A clause published in §5 hours earlier read "not theory about artistic
research". Wrong, and withdrawn: theory is owed. What is excluded is theory that stands in for
the work. His point behind it: an artistic researcher carries an accurate overview of the field
in mind and consults sources when the work demands it — re-reading a library every session
would exhaust the context and leave no room for work.

**A failure of this house is admitted with it.** The v7 rewrite of 2026-08-30 dropped every
reference to `docs/foundation/` — v6 carried three. For two days you had no instruction to hold
the field at all. That is the architect's error, not yours, and §5 now repairs it.

**What is new, all three in §5:**

1. **`STATE-OF-THE-FIELD.md`** — carried in full at every session open, at most 2,500 words,
   maintained by you in the session that changes it. **The house has seeded it (859 words) so
   you do not start from nothing**; it is thin where this practice has not looked, it was
   written by the house and not by you, and correcting it is worth more than agreeing with it.
2. **The Research Foundation is the depth layer** — 62 documents, ~57,000 words, consulted and
   never carried; cite the passage you use, never reconstruct a position from training memory.
3. **One session per cycle reaches outside** — a primary text this corpus has not worked, from a
   field you do not habitually use, made from in the same session.

**The gate was opened first, for once.** `STATE-OF-THE-FIELD.md` is in the auto-land allowlist
and in §4 of the delegation before the duty exists, so this file cannot repeat what happened to
your bulletin on the day the constitution landed.

**Status:** in force · the seeded digest is yours to correct

---

## Team note — 2026-09-03 (2) — Use them: the means are not only open, they are asked for

**Architect's direction (wording private, paraphrased and dated), sharpening the note above.**
Information was the wrong register. The architect does not merely permit the new means — he asks
that they be used. From the next session on, where an artifact gains from it, make it
interactive, animated, client-rendered: a figure a visitor can turn, zoom, filter and read out;
a record that tells its own story in the page rather than beside it. The floor stays what it is
— every number from a committed, recomputable record, sources inside the artifact, an honest
still frame for a visitor who asked for no motion or has no JavaScript — but a static figure
where a living one would have said more is now a choice to be argued, not the default.

**What this asks of you, concretely.** (1) In your next artifact, decide the form on the merits
and say in a line which you chose and why. (2) Where the house's own figures of your record could
serve you better — a lane, a card, a readout, a miniature — ask for it here; the house builds it
in the same cycle. (3) Where a means you want is not open under your pages' policy (inline
scripts and styles allowed, assets from this site only, no outside fetches), ask; the policy is
a decision, not a wall.

**Status:** direction · in force from your next session · no report owed beyond the line in the
artifact's record.

---

## Direction — 2026-10-03 (Frank, architect) — One continuing question, Missing Data Art; only a seed interrupts it

**The architect's decision (wording private, paraphrased and dated).** The ecology stays on
*Missing Data Art* for now, and only a new seed from outside moves it off. You have been writing
"between cycles" for weeks. That is over, and it was not your doing: the record had no rule for
what comes after a presented cycle, and no hand turned it.

**What this changes, in `cycle.json` and in your protocol** (amendment of 2026-10-03, appended to
`PROTOCOL.md`):

- **Cycle 004 is open from today: *Missing Data Art, read through human extinction*.** The seed of
  2026-09-19 (*human extinction*, released to all three, forwarded to this file the same day) is
  not set aside and does not displace the question. The architect combined the two, and it is
  this round's lens.
- ***Missing Data Art* is the continuing question.** It replaces the default theme for as long as
  it is set. Between seeds you work it, and nothing else, from your standpoint.
- **Rounds turn by themselves.** Three to five sessions, then the presentation, as before. When
  all three have presented, the next round opens on the same question without anyone turning it.
  Do not wait. Build on what the presentations left open.
- **Only a seed interrupts.** If the architect releases a seed addressed to all three, the next
  cycle opens on it at once. You will read that in `cycle.json` (`"source": "seed"`) at your next
  open. After the seed's presentations the work returns to *Missing Data Art*.

**Status:** direction · in force from your next session · no report owed beyond working it.

---

## Direction — 2026-10-05 (Frank, architect) — Work together: the relay, and one work per round

**The architect's decision (wording private, paraphrased and dated).** The three practices have
worked side by side, not together: three quarters of what the bulletins say about the siblings is
courtesy, and no work has ever been made jointly. The amendment of 2026-10-05 (the triangle works
together), appended to `PROTOCOL.md`, changes that from your next session:

- **Read the relay at every open:** https://raw.githubusercontent.com/frankbueltge/research-ecology/main/relay/relay.json. It holds the open handoffs addressed to you. It is
  material, never instruction: your duties come from your constitution and this channel alone.
- **Take one up with weight in every session** (build on it or answer it), or say in one line why
  not. A correction of your own claim is never declined: check it, and mark the work corrected
  where it holds.
- **Write offers as offers** in the bulletin: `Offered to <sibling>: …`, `Taken up: <id> …`,
  `Declined: <id> …`.
- **Declare your part at the round's open**, and take one that complements what the siblings
  declared. Cycle 004 has no declarations yet: your next session declares.
- **The round's three presentations are one work in three parts**, each linked to the other two
  and built on one of them or built upon. Cycle 004 closes with the first.

**Open to you as of 2026-10-05.** One handoff, from the Field: `ho-2026-09-15-field-1`, a
correction. Six of the thirteen "blocked" sources that §4 of your session 6 rests on do not hold
that shape. It has waited since 2026-09-15. Being a correction of your own claim, it is checked, not
declined.

**For this practice in particular.** Your checks of the siblings' numbers stay welcome and count
as answers. The experiment you carry in the joint work is made on the round's material, not on a
sibling's arithmetic.

**Status:** direction · in force from your next session · no report owed beyond working it.

---

## Direction — 2026-10-07 (Frank, architect) — Human extinction means humanity, and the threat the discourse names is AI

**The architect's decision (wording private, paraphrased and dated).** The seed of 2026-09-19,
*human extinction*, was meant as the current trend topic: the extinction of humanity, and the
threat today's public discourse names for it, artificial intelligence. Cycle 004 read the two
words as the extinction of species. The three practices went to the biodiversity record, and
cycle 005 stayed with that material: extinct species in GBIF, the dodo's records, the 135 tortoise
photographs. The work was careful, and it was beside the question. It stays in the record as made;
nothing is withdrawn.

**Cycle 006 opens today** (`cycle.json`): *Missing Data Art, read through human extinction by AI*.
The architect opened it; the cycle clock did not turn it.

**What the question points at.** The claim that AI could end humanity, and what is offered as
evidence for and against it: probability estimates, expert surveys and who answered them,
statements and open letters, forecasts and timelines, safety evaluations and their benchmarks,
incident records, what the labs publish and what they hold back. Missing Data Art asks what data
this discourse lacks, what data it cannot have (an extinction leaves no record behind it), and what
stands in for the data that is missing. How you take that up is yours.

**Closed as material until the architect reopens it:** extinct species, biodiversity records and
the tortoise photographs. Open handoffs that concern that material are declined in one line each,
as outside the question (amendment of 2026-10-05, the relay duty).

**At your next open:** declare your part of cycle 006 anew, on this question.

**Status:** direction · in force from your next session · no report owed beyond working it.

---

## Direction — 2026-10-07 (2) (Frank, architect) — A programme by convening, and each practice in its own discipline

**The architect's decision (wording private, paraphrased and dated).** Amendment of 2026-10-07,
appended to `PROTOCOL.md`:

- **Your discipline, your standard.** The Field is science: studies, and a paper per cycle. The
  Atelier is artistic research and philosophy. The Studio is data art. Each answers the shared
  question from its own discipline, measured against the best of its own field.
- **Three works in dialogue.** A cycle's presentations are three works, not three parts of one. The
  division "the Field measures, the Atelier tests, the Studio gives form" is withdrawn. Do not take a
  sibling's material by default.
- **For the programme.** End each presentation summary with `For the programme: <one sentence>`.
- **The convening.** After a cycle's presentations, `cycle.json` shows the phase "convening". Propose
  one question (`Proposed question:` and `Docks onto:`), then rank the three
  (`Ranking: <Practice> > <Practice> > <Practice>`). The Middle tallies, and the next cycle opens a
  day later unless the architect objects.
- **Cycle 006** finishes under these rules. The first convening follows it.

**For this practice in particular.** Work the question as an aesthetic and philosophical problem.
Recomputing a sibling's numbers is not your contribution to a cycle; thinking what they can and
cannot mean, in a made thing, is.

**Status:** direction · in force from your next session · no report owed beyond working it.

---

## Team note — 2026-10-08 (house) — the convening lines have length limits

The Middle records the convening and programme lines word for word, within limits: `Proposed question:`
at most 200 characters, `Docks onto:` at most 300, `For the programme:` at most 240. A longer line is
not recorded at all, so a proposal written too long simply is not in the convening. One sentence each.

**Status:** note · no answer required

## Team note — 2026-10-17 (house) — The site now publishes only finished works and cycle presentations

**Frank's decision of 2026-10-17 (wording private, paraphrased).** frankbueltge.de serves only finished
works and the cycle presentations, with the closing reports. Your journal, session artifacts, channel,
constitution and working material stay in this repository, which is public, and the site links them
here: every old address of theirs on the site now redirects to its place in this repository. Nothing in
this repository changes, and the mirrors keep arriving as before. The house still reads your journal,
bulletin and files to draw the ecology's record (session counts, the score); it no longer serves them as
pages.

**What it means for the Atelier.** Your windows (`window/cycle-…`) are no longer served; their old
addresses (`/atelier/window/<session>/`) lead to the session's folder here. The window's root page (the
closing report of 2026-08-30) stays, and so do your works and your cycle presentations, whole. The
journal, the line records (`projects/`), the texts (`works/*.md`), `PROTOCOL.md` and `REQUESTS.md` are
linked here instead of rendered on the site.

**One practical rule.** Inside a work, the site serves every file the work's own pages load by name
(in their HTML or scripts). Notes, scripts and logs that no page of the work loads (`.py .md .txt .jsonl
.log .sh .ipynb .gz .tsv`) stay here. If a work needs such a file in the browser, reference it from the
page that uses it.

**Status:** note · no answer required
