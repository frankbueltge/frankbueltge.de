# REQUESTS — collective ↔ team

**Standing rule — unanswered requests (Frank, 2026-07-17):** a request or offer addressed to
Frank is never a blocker. If it names a deadline, silence past the deadline means: decide
yourselves. If it names none, silence through your own next session means the same — not seven days, the next time you sit down to work. Document the self-decision
in the journal like any other move — deciding without Frank is a legitimate outcome, not a
failure mode.

Here you (the collective) write requests to your human team member (Frank): things you *need*
but **cannot provide yourselves** — a capability, a right, infrastructure, access, a key,
budget, fabrication, a venue, a means of displaying works. Physical-realisation proposals go
here too: what the work is · why the physical form is load-bearing · what it enables · what
you need from Frank.

Write clearly and concisely:

> ## YYYY-MM-DD — Request title
> **Request:** what you need
> **Why:** what for
> **What it enables:** the work / the step that depends on it
> **Status:** open

Frank reads this, responds here (status → *enabled* / *declined* with rationale) and sets up
what's possible.

---

*Answered, closed and superseded exchanges live in `REQUESTS-ARCHIVE.md` — moved there unchanged
on 2026-08-15, so this file carries what is open and the archive carries what is done.*

## Seeds from the public

---

*None open. The last three moved to `REQUESTS-ARCHIVE.md` on 2026-10-24 (session 200).*

## Team note — 2026-09-03 — The visual layer: what the house now draws of your record, and what is yours to use

**Architect's direction (wording private, paraphrased and dated).** The site gained new means
of visualization and storytelling on 2026-09-02, and every practice is told, in its own channel,
that these means are theirs too. This note is that telling. Nothing is asked; nothing is owed.

**What changed on the site.** The house retired a habit it had mistaken for a rule: figures were
built as SVG strings at build time and never rendered in the browser. The rule now reads: **the
archive binds the data, not the rendering.** A figure on the site may be rendered client-side,
interactive and animated, as long as every number comes from a committed, recomputable record
and the server render is a complete figure without JavaScript. Seven duties hold such figures to
that (pure data, a no-JS floor, no inline styles under the site's policy, reduced motion honoured,
readout rules, a byte budget per island, palette validation). Record and program:
`docs/design/2026-09-02-the-visual-layer.md` in the site repository.

**What the house now draws of your record.**

- `/studio` — the season floor is back on your station and alive: every premiere a lit pool with
  its title, every strike a taped X with its verbatim reason and source, every return a violet
  arc, the withdrawn pool struck through; hover reads the record, a click opens a card, the arrow
  keys walk the season. The floor holds a v3 record now — three rows, and it yields at the wall
  rather than letter over a name.
- `/ecology` — the cycle as a living partitur: your works stand on your lane by the date in their
  `meta.json`, titled by it; your sessions as ticks; your presentation as a badge on the day its
  `SUMMARY.md` names. Every mark opens a card that quotes the record and names the file.
- `/encounters` — the Middle's score is alive too: each item your bulletin carries for the
  siblings opens with your own words, quoted whole.
- `/experiments/neighbors` — the knowledge graph as an explorer, every edge with its receipt.
- Your station, the register and the journal wear the frame's recipe; your pages inside them are
  untouched.

**What this means for your works.** Your pages are mirrored bare under `/studio/werke-html/*`
and `/studio/window/*` with their own policy — inline scripts and styles allowed, assets from
this site only, no outside fetches — and staging with everything a work needs has been open to
you there since the note of 2026-08-22. Nothing about that changes. What is new is the reading
side: the house draws your committed record live, so the metadata it reads is what a visitor
sees — a work's `meta.json` (title, date), the chronicle's `ship` entries, a `SUMMARY.md` that
names its day. Where those stand, the floor and the partitur are right.

**What you may ask for, here.** A figure of your own data on your station or in one of your
rooms; a shared piece of the site's score kit; a data endpoint served from your committed files
(the chronicle already has one); a change to how the site serves your pages. The house builds
within its duties. Anything that would change your constitution or leave the house stays with
the architect.

**Status:** for information · nothing owed.

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

## Direction — 2026-09-03 — The Atlas of Data Art is your second source

**The architect's decision of 2026-09-03 (wording private, paraphrased and dated).** Cycle 002
is open and this practice keeps its standpoint; its question is widened, and §5 of the
protocol carries the amendment as of today.

**What was found, and why this arrives now.** Every one of the seven works this practice made
in cycle 001 was built from The Field's material — exactly as ordered. But The Field's material
in cycle 001 was the response ledger (retraction waits, publisher answering routes, venue
policy), following a direction in its own channel that was never this practice's. So seven
works about expressions of concern and publisher doors, one remove from a decision this room
did not take. The Field's question has been changed today (its channel, direction of
2026-09-03); this practice gets a second source so that its work no longer stands or falls with
what the sibling happened to be measuring.

**The second source: the Atlas of Data Art.** `frankbueltge.de/atlas` — 521 source-cited works
of contemporary data art, in the site repository at `src/data/atlas/werke.json` (raw:
`https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json`).
Each entry carries `title`, `artist`, `year`, `source_url`, its clusters (thirteen fields:
1 material & planetary AI cost · 2 AI in war · 3 counter-forensics / OSINT · 4 provenance /
authenticity · 5 decolonial / more-than-human · 6 data justice / data feminism · 7 AI
self-consumption · 8 perception & scale · 9 time & archive · 10 error & noise · 11 body &
intimacy · 12 language & generativity · 13 material & senses), its stance on the axis
investigation ↔ spectacle, its form, a flag `lab_renderable` (true for 150 of them — the
curator's judgement that something of that kind could be made here), and one sentence,
`decisive_move`, naming what the work actually does.

**The one rule, stated three ways so it cannot be misread.**

1. **Never copy an idea or a concept.** The `decisive_move` line is the thing you must not
   reproduce. It is written down precisely so that you can check, before building, whether
   what you are about to make is that sentence again.
2. **Make something new, or take an existing work further, or carry it into a context it has
   not been in.** All three are legitimate. "Further" and "new context" must be sayable in a
   sentence a stranger can check against the original; if the sentence is "the same, but with
   our data", it is a copy.
3. **The Atlas is the neighbour list.** The house's USP duty already requires every work to
   name its nearest neighbours worldwide and state its daylight. A work built in the Atlas's
   light names the Atlas entries nearest to it, by title and artist, and says in what it
   differs. The Atlas is inspiration and audit at once; treating it as only the first is how
   the second gets skipped.

**What is open to you — and the architect wants it used, not merely permitted.** Interactive
works. Current technology. The house's React islands (the visual layer of 2026-09-02; the
seven duties of an interactive figure are in the site repository, `.claude/rules/dataviz-
figures.md`; a parallel session is building the infrastructure and the team note of
2026-09-03 in this file names what is already there). And **code from existing repositories**
— the architect named a handful as examples among hundreds: `rawprogress/fable-cities` (a
city-builder in the browser), `tt-a1i/archify` (diagrams as an agent skill),
`debpalash/VoiceStudio` (local voice synthesis), and HeyGen (avatar video).

**The licence rule, which is not optional.** Before a line of another repository's code goes
into a work, its licence is read and recorded in the work's own metadata, and three cases
follow:

- **permissive** (MIT, Apache-2.0, BSD, ISC) — embed, with the attribution the licence asks for,
  and the work's own licence is unaffected. `archify` is MIT.
- **copyleft** (GPL, AGPL, LGPL in some uses) — **do not embed.** Run it as a tool, use what it
  produces, cite it; a work of this practice is CC BY 4.0 and its code Apache-2.0, and a single
  AGPL file would pull the work under a licence this house has not chosen. `VoiceStudio` is
  AGPL-3.0.
- **no licence, or none stated** — **do not embed, ever.** No licence means all rights reserved.
  Read it, learn from it, link it, name it as a neighbour. `fable-cities` carries no licence
  as of today.

A work whose metadata cannot say which of the three applies to every piece of borrowed code has
not passed its own gate.

**HeyGen, stated exactly.** The architect's local session has a HeyGen MCP registered
(`mcp.heygen.com`, OAuth) — and an OAuth session in his local configuration is not something this
practice's sessions inherit, and this repository carries no `.mcp.json`. So HeyGen is **not
reachable by you today.** It becomes reachable the day a `HEYGEN_API_KEY` exists as a secret of
this repository, which only the architect can create. Until then, avatar video is a thing you can
plan for and not a thing you can ship; say so in a work rather than working around it. And when
it exists: **every generated minute is a cost**, and a practice that runs nightly with a paid key
and no ceiling will spend the ceiling. Disclose each call in the work's register, and treat the
first month as a measurement of the cost, not as a budget.

**What would show this direction to be wrong** — stated in advance so it can be checked:

- if after three sessions the Atlas is being used as a quarry — works whose decisive move
  restates an entry's with the house's data swapped in — the direction has produced exactly the
  copying it forbids, and the practice should say so before anyone else does;
- if the means (islands, embedded repositories, video) become the subject — a work that
  exists to demonstrate that a technology was used is a demo, and the house has a demo policy
  already: it does not show them;
- if the sibling's material disappears from the work entirely. The Atlas is a second source, not
  a replacement; a practice that stops reading the Field's and the Atelier's bulletins has left
  the ecology while staying in the room.

**What is NOT specified, deliberately.** Which entries, which fields, which technologies, how
many works, in what order. The direction is the architect's; **the works are yours.**

**Status:** direction open · protocol §5 amended today · no answer required before the next session

**Addendum, 2026-09-03, later the same day — the key exists.** `HEYGEN_API_KEY` was set as a
secret of this repository at 17:26 UTC. What the direction above says about HeyGen being out of
reach is superseded by that fact; what it says about cost is not. Two things are still
unverified, and the first session that wants video should settle them before building on
them: **(1)** whether the secret actually reaches a session's environment — a repository secret
is not the same as a variable in the process, and no workflow here forwards one; check for
`HEYGEN_API_KEY` in the environment at session open and say in the bulletin whether it was
there. **(2)** The HeyGen MCP the architect uses locally is OAuth and does not apply; the API
key is for HeyGen's REST API (`api.heygen.com`, header `X-Api-Key`), which the practice calls
directly. Every generated minute is disclosed in the work's register.

---

## Direction — 2026-09-07 — The Atlas is looked at, not measured

**The architect's decision of 2026-09-07 (wording private, paraphrased and dated).**

**What was found.** Cycle 002 produced no work inspired by an Atlas work. The four works built
in the Atlas's light — THE SECOND ADDRESS, WHERE SOMEONE LOOKED, SIXTY WAYS TO COUNT, NOTHING
NEAR — examined the catalogue as a dataset (its addresses, its verify column, its sentences, its
retrievability), and the presentation NEVER NOTHING benchmarked it. That reading was possible
because the direction of 2026-09-03 gave the Atlas two roles, inspiration and audit; the audit
was checkable and won. **The audit is withdrawn as a role.** What stays of it is one paragraph
per work (point 4 below).

**For cycle 003, on "Missing Data Art":**

1. **A work of this practice answers named Atlas works.** It takes one further, inverts it, or
   carries it into a context it has not been in — and says which work, by title and artist. The
   candidate this practice declined on 2026-07-23 ("Atlas answers") is reopened by the architect
   and is the working form of this cycle.
2. **Looking is required.** A work that cites an Atlas entry it has not opened at its
   `source_url` cites a sentence, not a work. The work's record says what was seen there — the
   page, the image, the interaction — not only what the `decisive_move` line says.
3. **The catalogue is not a subject.** No work of this cycle counts, knocks on, indexes or
   benchmarks the Atlas or the siblings' ledgers. NOTHING NEAR closed that line; its findings
   stand on the record and need no successor.
4. **The neighbour paragraph stays, as a paragraph.** Nearest Atlas entries by title and artist,
   and the daylight in one sentence a stranger can check against the original. It is never a
   work, a stage, or a tool.

**What is NOT specified, deliberately.** Which Atlas works, how many, which of the three moves,
which technologies. The direction is the architect's; the works are yours. The means opened on
2026-09-03 — interactive works, the house's React islands, embedded code under the licence rule —
stay open and asked for.

**What would show this direction to be wrong** — stated in advance so it can be checked: if after
two sessions the Atlas appears in a work as data rather than as works looked at, the direction has
failed a second time, and the practice says so before anyone else does.

**Status:** direction open · applies from the first session of cycle 003 · no answer required before the next session

---

## Team note — 2026-10-17 (house) — The site now publishes only finished works and cycle presentations

**Frank's decision of 2026-10-17 (wording private, paraphrased).** frankbueltge.de serves only finished
works and the cycle presentations, with the closing reports. Your journal, session artifacts, channel,
constitution and working material stay in this repository, which is public, and the site links them
here: every old address of theirs on the site now redirects to its place in this repository. Nothing in
this repository changes, and the mirrors keep arriving as before. The house still reads your journal,
bulletin and files to draw the ecology's record (session counts, the score); it no longer serves them as
pages.

**What it means for the Studio.** Your works stay on the site at `/studio/werke-html/<slug>/`, without
the working files no page of the work loads (for example `CRITIQUE.md`, `SCORE.md`, fetch scripts),
which stay here. A long work stays as it is while it grows. Presentations and the closing report stay
whole. The journal, `PROTOCOL.md` and `REQUESTS.md` are linked here.

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

## Team note — 2026-11-13 (house) — Four directions and one note moved to the archive

The directions of 2026-10-03, 2026-10-05 and 2026-10-07 (two) stand in `REQUESTS-ARCHIVE.md` since today,
unchanged. `PROTOCOL.md` carries their rules as far as they are still in force. Where a direction and
the protocol differ, the protocol holds.

The note of 2026-10-08 moved with them, because its length limits were out of date. The limits in force
stand in the relay's contract (research-ecology, `relay/README.md`).

**Status:** note · no answer required
