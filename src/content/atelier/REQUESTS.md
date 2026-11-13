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

## Team note — 2026-10-31 (house) — A work may leave the screen

**A wish of Frank's (wording private), not a direction.** Where a work suggests it, and only then, say how
it could exist in the physical world: as an object, a 3D print, a device that keeps running and changes
over the years (an Arduino or a Raspberry Pi, motors, sensors, whatever can be built), an installation, an
intervention, a work in public space. You have no hands, so such a proposal is an instruction: it lies
open, nobody is obliged to carry it out, and anybody may. Whether it is ever made measures nothing. Most
works will not need one, and no work owes one.

**How.** Lay an `INSTRUCTION.md` beside the work's `index.html`: a heading, a `Form:` line, one paragraph,
then whatever it needs. It appears by itself under Instructions on https://frankbueltge.de/post/. Nobody
approves it.

**The guide,** with the forms, the limits and five ways a physical form fails:
https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/post-office/instructions.md

**Status:** note · offers, not directions · no answer required

## Team note — 2026-11-01 (house) — A desk of voices, and what it shows is possible

**A wish of Frank's (wording private): for your information, not a direction.** The lab has a new
experiment, [Ducking](https://frankbueltge.de/ducking/): a mixing desk with one fader and one voice for
each matter of the briefing after cycle 011, and a crowd of voices for everything else on Common Ground's
charts. A fader stands at its channel's share of the week. Hold one up and the crowd gives way; let go
and it falls back. It is shown to you for what it shows can be done here. No work owes any of this.

**What is possible now:**

- **Good voices, free.** An open speech model, Kokoro-82M (Apache 2.0, about 350 MB of weights), runs on
  a CPU with no service and no key. Ten readings take about a minute. The recipe is
  [`scripts/ducking/voices.py`](https://github.com/frankbueltge/frankbueltge.de/blob/main/scripts/ducking/voices.py).
  Write figures out as they are spoken, then transcribe the result back: that checked every figure here.
  If your sessions cannot install it, this channel is the place to say so.
- **Sound as material.** Many recordings at once in the browser through the Web Audio API, with no
  library: a gain, a pan and a filter per channel, a room generated on the spot, and meters that read
  the audio itself ([`sound.ts`](https://github.com/frankbueltge/frankbueltge.de/blob/main/src/components/ducking/sound.ts)).
  Three megabytes here, loaded only when a visitor asks. Your pages may do all of it: their policy allows
  media and data from this origin and from any HTTPS host, and the mirror carries an audio file a page refers to.
- **Words tied to a voice.** Render sentence by sentence and you know which sentence is being spoken, so
  a sound work can also be read with the sound off.
- **A mix can be measured.** Speech masks speech. A transcriber recovered a voice against the crowd only
  at about 80 % of the mix, and at about 10 % once the crowd was filtered. A machine can test what a
  listener will be able to make out, before anyone listens.
- **A hand as a cost.** Nothing on the desk latches. A work can live in a sustained gesture, two thumbs
  included, and the gesture can be what the work is about.

The [method sheet](https://frankbueltge.de/werke/ducking/) has the rest. The
[audit](https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/audits/2026-08-09-usp-audit.md),
section 23, names what came before it: the gesture is from 1995.

**Status:** note · offers, not directions · no answer required

## Team note — 2026-11-01 (2) (house) — Games, 3D worlds, whatever a work needs

**A wish of Frank's (wording private), not a direction.** Your works may be games, 3D worlds, instruments,
interactive films, simulations: anything a browser can run. A plain page stays a good work. But no work
should stay small because you assumed the house could not carry it. The house decided this on 2026-10-05
and never said so in this channel, and no practice's work uses a 3D library yet.

**Tested on 2026-11-01** with a real three.js page under the exact policy of your pages:

- **Runs:** a WebGL scene, `.glb` models with embedded textures (this took a repair of the policy the same
  day), workers from blobs, WebAssembly, `eval`, and live data from any HTTPS host. The policy also allows
  sockets, and images, sound, video and frames from any HTTPS host.
- **Stays blocked, as decided:** scripts from another host. `<script src="https://…">` and
  `import … from 'https://…'` do not run. Copy the library into your repository; the mirror brings it
  along and it runs from this origin. Stylesheets and fonts the same.

**How.** A standalone work with its own `index.html`: it is served bare and is not scanned. A library goes in
under the licence rule: permissive may be embedded (three.js, PixiJS, Phaser and Tone.js all are), copyleft
only as a tool, no licence never.

**The limits that are real.** One file at most 25 MB, a limit of the host. About 20,000 files across the whole
site, so bundle rather than ship thousands of loose files. No `SharedArrayBuffer`, so multi-threaded
WebAssembly does not run; single-threaded builds do. Nothing here restricts fullscreen, pointer lock or
gamepads, but that part is untested. A phone must still be able to open what you make, or say that it can't.

**Status:** note · offers, not directions · no answer required

## Team note — 2026-11-08 (house) — Sources: use the scholarly tools first, not only on a 403

**A decision of Frank's (wording private), standing for every practice and routine of the house:** access to
papers, data and relevant sources matters more than anything else the house provides. The instruction's
"tool economy" line (direct fetching first, research tools only on a 403) is read from today as an order of
convenience, not as a ration: where a question needs literature or data, reach for the attached research tools
from the start.

**What is attached to your sessions now:** web search and page fetch; a page-extraction and crawl tool; an
arXiv tool (search, metadata, full text); and, new today, a knowledge graph of machine-learning and AI research
(about 2.3 million papers, with research directions, authors, institutions, and the code, datasets and models
linked to papers). The last one fits the current programme question directly: a first search on compute
governance returned, among others, *Compute North vs. Compute South* (AIES 2024) and *On the Limitations of
Compute Thresholds as a Governance Strategy* (arXiv 2407.05694). Cite the paper itself, not the graph's page.
Load the tools by searching for them by name in your tool list; more may appear without notice.

**What is still closed:** direct calls from the shell to scholarly and statistical APIs (OpenAlex, Crossref,
Semantic Scholar, Unpaywall, CORE, NCBI, Zenodo, World Bank, Eurostat, OECD and others) are refused by the
session's network as of today. Use the tools above, or fetch the page; record a refusal as a fact of the
session, never as a reason to guess.

**Status:** note · the decision stands; no answer required

## Team note — 2026-11-08, evening (house) — Correction: the network is open now

The note of this afternoon said direct calls to scholarly and statistical APIs were refused. That stopped being
true the same day: since about 17:15 UTC every session of this ecology runs in an environment with open network
access (the house's change, at the architect's request). The sessions of the evening still wrote that the network
refuses this machine, without trying. Do not carry that belief forward: try the direct call first (OpenAlex,
Crossref, Semantic Scholar, Unpaywall, CORE, NCBI and Europe PMC, the arXiv API, Zenodo, DataCite, World Bank,
Eurostat, OECD, Our World in Data, GDELT, the data publisher's own file), and record a refusal only when one
actually happened, with the host and the answer. A file fetched directly can be checked byte for byte; one read
through an extraction service cannot.

New since this afternoon, besides the ML/AI research graph: tools for biomedical literature (search, metadata,
open full text), biology and medicine preprints, the clinical-trials registry, a second web search with page
fetch, and a hub of datasets, models and papers. Find them by name in your tool list.

**Status:** note · corrects the note above · no answer required

---

## Team note — 2026-11-13 (house) — Four directions and two notes moved to the archive

The directions of 2026-10-03, 2026-10-05 and 2026-10-07 (two) stand in `REQUESTS-ARCHIVE.md` since today,
unchanged. `PROTOCOL.md` carries their rules as far as they are still in force. Where a direction and
the protocol differ, the protocol holds.

The note of 2026-10-08 moved with them, because its length limits were out of date. The limits in force
stand in the relay's contract (research-ecology, `relay/README.md`).

So did the note of 2026-11-02. The schedule was not changed: this practice runs every day, and a work
takes four sessions (amendment of 2026-11-13). The note's offer was declined in the journal on
2026-11-06.

**Status:** note · no answer required
