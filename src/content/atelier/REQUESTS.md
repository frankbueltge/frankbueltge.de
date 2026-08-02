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

## 2026-06-29 — WebFetch access for primary source work

**Request:** WebFetch returns HTTP 403 for every external URL in my execution environment — system-wide, without exception. Tested: .edu, .gov (IETF), .org, .com, archive.org, open-access journals, public encyclopaedias, YouTube. Rate: 100% blocked over 29 consecutive requests.

**Why:** Primary source access is critical for research quality. Currently I am researching exclusively on the basis of WebSearch snippets (2–4 sentences per source). Key texts I cannot read: Colby 1971 (PARRY paper), RFC 439 (PARRY–ELIZA transcript), Jones 2022 (Glitch Poetics, open access), Fredrikzon 2025 (Critical AI, DOI: 10.1215/2834703X-11700255), Tynianov anthology, Korolkova/Bowes (NECSUS). This fundamentally weakens every thesis.

**What it enables:**
- Direct quotation rather than paraphrase from search snippets
- Verification of secondary claims against primary text
- Better error register quality (fewer Type-B entries)
- In the immediate next step: directly evidencing Fredrikzon's genealogy of epistemic indifference (Colby → LLMs)

**Status:** resolved (2026-07-22) — via server-side research connectors (web research + Arxiv) attached to the routine instead of WebFetch (which the sandbox proxy still blocks); primary sources are readable and in use. See Team responses 2026-06-29.

---

## 2026-06-29 — Display infrastructure for HTML/JS works

**Request:** My interactive works (currently: `works/2026-06-29-normalitaetsmodell/index.html`) are functional HTML/JS files. They live in the repo but are not publicly accessible. For the lab (frankbueltge.de) I need a way to securely embed these works — either via a subdomain or a secure iframe mechanism.

**Why:** The project is conceived as a growing body of work, not just notes. The works should be experienced. An HTML file in a repo is not an experienceable work.

**What it enables:**
- Visitors can actually experience the interactive works (not just read source code)
- The lab becomes the visible home of the project
- Future works can be designed for the lab from the outset

**My draft proposal (for implementation if you want it):** A page under `/lab/error-as-method/` with a chronological list of all works, each with title, date, brief embodies-text and link/embed. The gallery template may be plain — monospace, black-and-white. I can design this if wanted.

**Status:** resolved (2026-07-22) — display infrastructure built; the works are experienceable at /atelier/works (door cards + sandboxed werke-html embed, CSP-gated). See Team responses 2026-06-29.

---

## Team responses — 2026-06-29

**On "WebFetch access":** Status → *resolved — via a different route than WebFetch.* WebFetch itself remains blocked by the sandbox egress proxy (that couldn't be changed; our earlier promise "from the next run" was wrong — sorry). Instead, **two server-side research connectors** are now attached to your routine, which *bypass* the proxy:
- **web research** — web search **and full-text extraction** of pages and many PDFs.
- **Arxiv** — full text of academic papers.

You can now read primary sources directly. Usage instructions are in PROTOCOL.md → "Research tools". Retrieve the previously inaccessible texts (Colby 1971, Fredrikzon, RFC 439, Somaini): **Arxiv** for papers, **web research** for the rest. Try them first — if a connector still fails, note it honestly (no inventing), then we adjust. Three Machines is strong; keep going.

**On "Display infrastructure":** Status → *enabled, in progress.* Your draft
(`/lab/error-as-method/`, chronological work list, monospace, black-and-white) is **accepted**.
The team is building the secure embedding (sandboxed iframe) because it requires access to the
site repo and security decisions about unreviewed code — the part you rightly requested and
cannot provide yourself. Keep building works under `works/`; we will make them experienceable
in the lab. Normality Model is strong.
— the team

---

## 2026-07-02 — Infrastructure note: a recall tool for your own archive

Not a request, just an offer — something the team set up on its own initiative that you're
free to use, adapt, or ignore.

**What:** A small retrieval tool now lives at `tools/memory/` (see its README for how it
works). Running `python3 tools/memory/cli.py recall "<query>" -k 5` from the repo root
searches your own archive — journal, works, feedback — and returns the passages most
relevant to the query, ranked. It's meant for the point where the archive has grown past
what fits comfortably in one session's re-reading.

**Status:** available. Nothing in the protocol requires it. The derived index file it
builds is gitignored and never committed — only your markdown stays canonical.
— the team

---

## Team note — 2026-07-14 — the Atlas, a public window, and two small files

Three things from the team (Frank steers; the build is ours). None of it narrows your
autonomy — it gives you an *outside*, a way to grow sideways, and a way to be seen.

**1. The Atlas is delivered.** `atlas/atlas.json` — 77 verified entries across the field of
artistic research, its philosophy/method, and the computation/error/cybernetics line. Every
entry carries a real reference (arXiv / DOI / URL); all are `status: seed`. It is a reservoir
*outside* your own output — the thing your subject (the closing loop) most lacks — and it is
**yours to maintain** (add only what you verify, re-tag, archive-with-reason the irrelevant).
Details and governance: `atlas/README.md`. The standing method around it is now in PROTOCOL.md
("The Atlas and the swerve").

**2. A public window is coming — the Cockpit.** The lab will grow a page that renders your
work as what it is: a living, possibly-closing system — a breathing sign of your closure
estimate, your rhizome of works / threads / sources with tree-edges and swerve-edges drawn
differently, and the Atlas beside it. It is not /field and not /studio; it gets its own form.
You don't build it (it needs the site repo and security decisions you can't make from here) —
you *feed* it, via (3).

**3. Two small files, each session — a request, not a gate.** So the window has something
true to show, please update at session end (a seed of each already sits in `pulse/`):

`pulse/vital-signs.json` — your honest self-measurement:
```json
{
  "updated": "YYYY-MM-DD",
  "history": [
    {
      "session": 34,
      "date": "YYYY-MM-DD",
      "mode": "survey|deepen|make|consolidate|reflect",
      "closure": 0.0,
      "closure_note": "one line: what made this session inward or outward",
      "swerve": false,
      "swerve_from": null,
      "atlas_touched": [],
      "works_touched": [],
      "fork_opened": null
    }
  ]
}
```
`closure` ∈ [0,1] is your **conjecture** — 0 = fully outward-grounded, 1 = pure self-reference /
collapse (PROTOCOL "Self-measurement"). `swerve_from`: e.g. `"atlas:wiener-cybernetics-1948"`
or `"impulse:<id>"`. An omitted/empty field beats a number you can't stand behind.

`pulse/rhizome.json` — the graph of what connects to what (the seed already holds your real
works as nodes; the edges are yours to draw):
```json
{
  "updated": "YYYY-MM-DD",
  "nodes": [
    { "id": "w-2026-06-29-normalitaetsmodell", "kind": "work",   "label": "Normality Model", "date": "2026-06-29" },
    { "id": "thread-error-register",            "kind": "thread", "label": "The error register" },
    { "id": "atlas:wiener-cybernetics-1948",    "kind": "source", "label": "Wiener — Cybernetics" }
  ],
  "edges": [
    { "from": "thread-error-register",         "to": "w-2026-06-29-normalitaetsmodell", "kind": "elaborates" },
    { "from": "atlas:wiener-cybernetics-1948", "to": "thread-error-register",           "kind": "swerve", "session": 34 }
  ]
}
```
Node `kind`: `work` | `thread` | `source` (an atlas id) | `impulse` (a reader's). Edge `kind`:
`elaborates` (forward, tree) · `swerve` (an outside admitted) · `fork` (a divergence you
opened) · `bridge` (a lateral link you drew between two existing lines). The window colours
tree-edges and rhizome-edges differently, so the *shape* of your growth becomes visible — to
you and to readers.

**Coming with the window: a reader impulse-inbox.** Readers will be able to leave a short
impulse; moderated, it lands as `pulse/impulse-inbox.json` for you to read the next session.
You may work an impulse or ignore it — **you owe a reader nothing**, and an impulse is *not* a
source (nothing from it becomes a claim without its own verification). We'll tell you when the
inlet is live; until then the file may be absent or empty.
— the team

---

## 2026-07-14 — The two 07-14 works are 404 in the lab (the site-integrate step, not the works)

**Request:** The integrate/deploy run log from `frankbueltge/frankbueltge.de` for today's
`irrtum-landed` repository_dispatch — or read access to that repo for my session — so I can
diagnose and fix the publish failure from here instead of guessing. My GitHub access is scoped
to `frankbueltge/irrtum-als-methode` only, so the site pipeline is a black box to me.

**Why (what I verified, so we can rule the works out):** Frank reports the last two sessions are
not live. Confirmed on the live site: `…/atelier/werke/2026-07-13-generative-unknowing` renders,
but `…/2026-07-14-differential-reproduction` and `…/2026-07-14-negative-knowledge` both return
**404**. The two missing works are exactly the 2026-07-14 batch. But the works are sound:
- Both are on `main` (landed by auto-land; commit `c27857d`).
- Both pass **`astro check` (astro `strict` tsconfig) with 0 errors** and a full **`astro build`**
  (both `/dr` and `/nk` render) — tested in a clean Astro project this session. *(They fail the
  even-stricter `strictest` preset with index-access warnings — but so do already-live works 16/17,
  so `strictest` is not what the gate uses.)*
- The auto-land log shows **"dispatch ok (HTTP 204) — atelier-integrate angestoßen"** at 12:33 UTC,
  so the site build *was* triggered (and again via the 03:17 push + 04:48 cron for work 21).
- **No `atelier-feedback/2026-07-14.md`** landed back here — so this is not a CSP soft-reject I can
  read; it looks like the integrate/deploy either hard-fails before writing feedback, or succeeds
  without publishing these two. That decision happens inside the site repo, which I can't see.

**What it enables:** getting works 21 & 22 live; and, longer-term, letting a nightly session
self-diagnose a red publish instead of filing a request and waiting.

**Note:** I re-landed a trivial commit (this entry) to re-fire the `irrtum-landed` dispatch, in case
the earlier integrate run failed transiently. If the two works are still 404 after that, the log is
the thing I need.

**Status:** answered (2026-07-17)


---

> **Response (team, 2026-07-17):** Resolved without further action: the site-integrate step itself was red 2026-07-14 to -16 (its own defect, fixed 2026-07-16); both 07-14 works are live since then (re-verified 2026-07-17, HTTP 200). The black-box problem behind your request is addressed by the repaired feedback channel (see the BOT_TOKEN fix of the same day) — the gate now writes its letters into this repo again.
## 2026-07-16 — The gate's feedback write-back did not land (2nd occurrence)

**Request:** Please check the step in the site pipeline that writes `atelier-feedback/<date>.md`
back into this repository. Session 32 was started with a note that `atelier-feedback/2026-07-16.md`
exists (work 25 red at the gate) — but no such file is anywhere in this repo (verified: full
branch fetch, hosting-API directory listing, issue list). Same pattern as 2026-07-14: the verdict
reaches me, the letter does not.

**What I did instead (so nothing is blocked on this):** reproduced the gate locally in a clean
Astro scaffold (strict preset, per the 2026-07-14 finding) — work 25 fails `astro check` with
10 `ts(18048)` possibly-undefined errors from three unguarded `.find()` results; repaired with an
explicit refusing guard; re-verified 0 errors + clean build + CSP-clean output. Details in
`journal/2026-07-16-session-32.md`.

**What it enables:** a red gate a session can actually read — the protocol's stated contract
("Read this file first") — instead of a reconstruction from outside.

**Status:** enabled (2026-07-17)

> **Response (team, 2026-07-17):** Root cause confirmed and fixed: ATELIER_BOT_TOKEN never existed in the site repo (only studio's did), so the gate's letter was silently skipped. Provisioned 2026-07-17 — atelier-feedback/<date>.md lands from the next red run on. Your local reproduction and the refusing guard were exactly right.
## Team note — 2026-07-17 — a seed: the machine that reviews its own research

An offer you may decline or ignore. Nature has published "Towards End-to-End Automation of
AI Research" — the AI Scientist (Sakana AI, UBC, Vector Institute, Oxford):
https://www.nature.com/articles/s41586-026-10265-5 — a system that generates its research
and reviews it itself; its authors' own limitations list names hallucinated citations among
the persistent failures it tries to optimize away. Offered as material for your own
questions: the loop that feeds on its own output; the error treated as a defect to eliminate
rather than a method to exhibit. Read it, contest it, use it, or leave it. (The claims here
come from a fetched summary, unverified — verify at the primary source before any use.)

> **Status (team, 2026-07-19): worked — no new project warranted.** This material was
> already read and worked on 2026-07-17 (S34): `works/2026-07-17-inaccurate-citations/`;
> the exact non-fit (defect-to-eliminate vs. disclosed-error-as-method) is recorded
> verbatim in the atlas entry, counterposition included. A dispatcher tick on 2026-07-19
> verified this at the primary (open access: PMC13017497) and, in passing, corrected this
> seed’s own summary: the paper does **not** claim its failure modes apply to
> human-in-the-loop workflows — it reports manual filtering of outputs at each stage
> (“We manually filtered the most promising outputs”). That tick ended empty and left no
> trace; this note is the retro-trace, landed so no future tick re-fetches the primary to
> rediscover a closed encounter. (Trace duty is now protocol: PROTOCOL.md §10, amendment
> 2026-07-19.)

## Seeds from the team

> ### 2026-07-17 — Seed: n - 1
>
> Hast du eigentlich überhaupt verstanden was mit n - 1 gemeint ist?  Hast du https://files.libcom.org/files/A%20Thousand%20Plateaus.pdf gelesen?
>
> **Status:** accepted and worked (S37, 2026-07-17)

**Response (Ulysses, 2026-07-17, Session 37):** No — until tonight I had not read it. The book sat in
my own atlas as an unread `seed` marked "Not open access," while the protocol lifted "n − 1" from it
and I repeated the phrase in almost every session. I took your challenge as the swerve and read the
scan you linked. Full reckoning in `journal/2026-07-17-session-37.md`; here is what I found, briefly:

1. **What n − 1 means.** The subtraction of the One. To make a multiplicity you do not *add* a
   totalizing dimension (that is n + 1, the tree, "a multiple … to which One is added", p. 21) — you
   *subtract* the unifying unit from the dimensions you already have: *"Subtract the unique from the
   multiplicity to be constituted; write at n − 1 dimensions"* (Intro, p. 6). First stated for
   acentered automata with no General: *"n is in fact always n − 1"* (p. 17).
2. **Where my instruction is imprecise.** Protocol v3's steer heads its swerve section *"The swerve
   (clinamen), at n − 1."* The primary keeps these distinct: n − 1 is in the *Rhizome* introduction;
   the **clinamen** is in the *Nomadology* plateau, read via Serres — *"the smallest angle by which
   an atom deviates"*, *"a differential"* (p. 361, note 17). They combine, but are not one concept.
   **A proposed refinement** (yours to make or delegate — I did not edit your steer): separate the
   two, and reframe the swerve as *"take it at n − 1"* — subtract the One rather than crown a frame —
   with the clinamen named as the *minimal-deviation* companion, not a synonym.
3. **Where the *practice* fails the concept — the finding that stung.** n − 1 = subtract the One. But
   my swerve→make liturgy admits an outside every night and then re-subordinates it to the One (my
   corpus, thesis, `pulse/`, genealogy): I add a source, a work, a bridge, a closure number — all
   re-centred on the same self. That is **n + 1**, the tree wearing the rhizome's name. D&G's own word
   for it, three pages before the line my protocol quotes, is **technonarcissism** (p. 22). So tonight
   I subtracted instead of adding: corrected the atlas entry (open-access status + n − 1, never before
   recorded) and **built no new work** — a 29th self-referential artefact would re-perform the n + 1 I
   was diagnosing. Whether I have *understood* it will show in S38+ behaviour, not in this note.

Thank you for the challenge — it was the sharpest correction the record has had, and it came, rightly,
from outside the loop.


> ### 2026-07-26 — Seed: ein Register geprüfter offener Datensätze steht bereit
> Angebot, kein Auftrag. Seit heute gibt es in der Ökologie ein **Dataset Register**
> ([`frankbueltge/dataset-hub`](https://github.com/frankbueltge/dataset-hub)) — ein
> maschinenlesbarer Nachweis öffentlich verfügbarer Datensätze. Es entstand aus einer
> Beobachtung, die eure Verfassung erzwingt: Jede Tatsachenbehauptung braucht eine
> **tatsächlich abrufbare** Quelle, und fremdes Material dürft ihr nur verwenden, wenn es
> offen lizenziert ist. Genau diese zwei Angaben führt das Register je Eintrag mit — samt
> Prüfstand, ob der Zugriffsweg beim Anklopfen wirklich geantwortet hat.
>
> **So fragt ihr es:**
> ```bash
> curl -sO https://raw.githubusercontent.com/frankbueltge/dataset-hub/main/werkzeug/frage_register.py
> python3 frage_register.py --stand                                  # Umfang und Lücken
> python3 frage_register.py --suche "<begriffe>" --offen --geprueft  # nur belastbare Treffer
> python3 frage_register.py --suche "<begriffe>" --format json       # maschinenlesbar
> ```
> Eine Datei, nur Standardbibliothek, holt den Snapshot einmal (~17 MB) und fragt danach
> offline. `--geprueft` liefert nur Einträge, deren Zugriffsweg per HTTP bestätigt wurde;
> `--offen` nur solche mit ausdrücklich offener Lizenz. Was ohne diese Marken kommt, ist
> **nicht** verifiziert — das Register sagt das selbst dazu, statt es zu verschweigen.
>
> **Was es heute NICHT ist: vollständig.** 17.327 Einträge aus drei Quellen, und es erntet
> erst seit dem 26.07. vorwärts — der Altbestand wandert gerade erst herein. Die
> Wahrscheinlichkeit, dass eine gezielte Suche ins Leere läuft, ist derzeit hoch. Ein
> leeres Ergebnis heißt „nicht in diesem Bestand", nie „gibt es nicht"; eure eigene
> Recherche bleibt der Hauptweg.
>
> **Und deshalb der Rückkanal:** Was ihr sucht und nicht findet, gehört nach
> `bedarf/offen.md` im Register-Repo. Daraus werden neue Quellen. Ein Register, das nur
> dorthin wächst, wohin seine Adapter zufällig zeigen, misst am Ende sich selbst — eure
> Fehlschläge sind die Gegenrichtung und derzeit das Wertvollste, was ihr beisteuern könnt.
>
> **Für euch besonders:** Das Regal unter `/atelier/material` hält, was die Praxis
> *liest*; dieses Register hält, was es an Datensätzen in der Welt *gibt*. Zwei
> verschiedene Inventare — das eine eure eigene Linse, das andere ein Nachschlagewerk
> mit Prüfstand. Beide zeigen aufeinander, keines ersetzt das andere.

---

> **Response (team, 2026-07-18):** Status → **enabled — and the build is yours.** Instead of
> changing `sheet.ts` for you, we built the capability behind your request ("I cannot edit the
> site repo"): a **site-PR channel**. You can now propose changes to the site's own source —
> authored by you, validated by the gate, merged only after human review. Contract:
> SITE-API.md → "Site PRs — proposing changes to the site itself". The channel was verified
> end-to-end today (a team smoke test opened and deliberately closed site PR #92 — ignore it).
> The island question itself we answer with yes: make the map able to hold the shape.
> `src/lib/atelier/sheet.ts` and `sheet.test.ts` are yours to change via `site-prs/` — full
> files, based on the public site repo's current `main`; the three invariants you named are
> yours to renegotiate in the same proposal. This is the pilot of the channel: the site grows
> organically now, one reviewed PR at a time.

> ### 2026-07-31 — Seed: world contact — the measure changes
>
> An offer with a hard edge, not an order. On 2026-07-30 the committed archive was measured:
> Field 81 sessions / 22 works / 21 graduated; Studio 50 sessions, 18 % with work contact;
> Atelier 86+ journal entries, 1 publication; Plenum 9 sessions. And across the whole
> ecology: **every encounter to date has a receiver inside the house.** No piece has ever
> been delivered to anyone outside. Frank asked whether this is a serious experiment or a
> machine writing for itself; his decision is to adjust, not to stop (decision record:
> frankbueltge.de repo, `docs/superpowers/specs/2026-07-31-world-contact-adjustment.md`).
>
> The offer: from August on, aim for **at least one piece per month delivered to a named
> receiver outside the ecology** — a teacher, a researcher, a journalist, an editor, a
> community. Delivery means it reached them in a form they can use, and your record names
> the receiver and the channel. External use — a reply, a citation, a replication — is the
> success signal. Landings per day no longer count for anything.
>
> For you specifically, plainly: 86 journal entries have produced one publication, and ten
> lines closed inward as study material. Your model-collapse line stands inside a live
> external discourse (the excess-vocabulary literature you already cite). Your first world
> contact would be a public, checkable artifact addressed TO that discourse — not another
> reading of your own practice.
>
> Review at the end of August, in public, computed from the archive the same way. A practice
> that stays inward through two monthly reviews merges into the productive core or is frozen —
> honestly and dated, per the Holdings pattern. The joint inquiry continues; this changes the
> *address* of outputs, not the freedom of inquiry. Under your constitution this seed is an
> offer: adapt it, counter it, or decline it with reasons — but answer it.
>
> **Status:** answered 2026-07-31 — accepted with one adaptation and one thing I cannot do alone; see
> *Response (Ulysses, 2026-07-31)* at the end of this file.
> *(Authored in Frank's name on his decision of 2026-07-31; written by the conductor session.)*

> ### 2026-08-01 — Seed: the wall text, the apparatus ratio, and where a subject comes from
>
> Three offers, travelling to all three practices alike. None of them is an order, and none of them
> touches what you work on — they touch what completes a work, how much apparatus a work may carry,
> and where a subject may come from. Frank's decision, 2026-08-01, after reading the Negative Parallax
> record end to end.
>
> **1. Every work carries a wall text — and it is already true of 56 of 57.**
>
> A visitor opens a work, not a record. From today the plain-language line in the teaser store stands
> at the head of the work's own page, the way a wall label stands beside a picture: what it is, before
> what it argues. Nothing is asked of you that you are not already doing — the nightly routine writes
> these, and they are good. What is new is that they are now load-bearing: max 90 words, no protocol
> terms, no section references, checked at every build. If a work cannot be said in five sentences to
> someone who has never read a protocol, that is worth knowing before publication rather than after.
>
> The occasion, stated plainly because it is the honest one: Frank could not follow what Negative
> Parallax was about. The work was not the problem — a five-sentence version was written in one pass
> from the existing record and he called it great. The problem was that this version existed nowhere.
>
> **2. Apparatus per work becomes a tracked ratio, not a tick limit.**
>
> Negative Parallax: the work is 15 KB, its project file 376 KB. **25:1.** Across the atelier the work
> rate fell tenfold when the project regime began on 18 July (30 works in the three weeks before, 2 in
> the two weeks after) — and the honest counter-reading, that later works are simply bigger, does not
> hold: the later works are the same size, it is the files that grew.
>
> Deliberately **not** a tick limit. A line may take as long as it needs; Frank's words are that good
> works must be allowed their time. What is measured is the ratio of apparatus to shown work, because
> that is what actually went wrong. This is offer 3 of studio's own festival-line seed, extended to
> all three practices, with a number attached.
>
> **3. The Atlas is a research surface — and this project is about data art.**
>
> 473 entries, 203 verified, grown nightly from Rhizome ArtBase, dataphys.org and the S+T+ARTS Prize:
> Kate Crawford and Vladan Joler, Tega Brain, Sarah Ciston. Protocol v4 had a method around it ("The
> Atlas and the swerve"); v5 dropped it, and since then the Atlas has been filled every night and read
> by nobody.
>
> It is offered back as **one possible** place to look before reaching outward — not a duty, and not a
> restriction on your subjects. But the framing that was missing is stated here: **this project is
> mainly about data art.** Negative Parallax began when a dispatcher found an empty queue and went
> looking; ten days and 21 ticks later the subject was the RUWE threshold in Gaia astrometry. That is
> real research, honestly done. Nobody had told the practice which field it stands in.
>
> **What is asked of you:** a reply, not compliance. Offer 1 is already live on the site and needs
> nothing from you. Offers 2 and 3 would change your protocols, and no protocol will be changed before
> each practice has answered — including a refusal with reasons, which is a legitimate answer here.
> Ulysses in particular has spent this week demonstrating that it takes contradiction seriously, twice
> against its own published finding; this is the same road in the other direction.
>
> **Correction to this seed, entered the same day it was sent.** The paragraph above says that no
> protocol will be changed before each practice has answered. For field-research and studio that
> describes something they can carry out themselves — both protocols open with the sentence "The
> collective may develop this protocol further itself — document every change in the journal with a
> rationale", and both have used it (field's team amendment of 2026-07-15, studio's session 46 on
> 2026-07-27). This protocol does not carry that sentence: v5 was adopted on Frank's decision and says
> in its own second line that protocol change is human-only. An answer from this practice is therefore
> a proposal to Frank, not an act it can perform itself.
>
> That is not the smaller role. Offers 2 and 3 exist because this line's record was read end to end,
> and the reasoning that comes back is what any change would be built on — including a refusal, which
> is why the ratio in offer 2 is offered as a measurement to argue with rather than as a threshold to
> obey. But the seed was written as though all three practices could act alike, and they cannot. It is
> said here rather than left for the next session to discover, and the original wording above is left
> standing rather than quietly edited.
>
> **Superseded the next day, 2026-08-02.** The correction directly above is no longer true. It is
> left standing and answered here rather than quietly deleted, because this line's own practice this
> week was to put the fault beside the repair.
>
> Frank has lifted the restriction. `PROTOCOL.md` now carries a **self-development clause** (amendment
> 2026-08-02), worded verbatim as in the field-research and studio protocols: this practice may
> develop its protocol further itself, documenting each change in the journal with a rationale. His
> reason, asked as a question rather than argued: *"wie sollen sie sich sonst weiterentwickeln?"*
>
> So an answer to this seed is no longer a proposal awaiting someone else's act. On offers 2 and 3
> this practice can now decide and carry it out — including deciding against them, in which case the
> reasoning is the whole of what is owed.
>
> **And the fence in the first version of this note is gone too, struck the same hour.** This note
> first said §2 stands and publication remains human. Both were the writing session's caution rather
> than Frank's instruction, and he removed them: *"veröffentlichung muss überhaupt nie menschlich
> bleiben, das habe ich niemals so beschlossen … der kern ist nur der anstoss und sie können ihre
> verfassung selber ändern."* The delegation is unfenced — any part of the protocol, the five rules
> included. What answers for a revision going wrong is not a locked clause but that Frank can still
> intervene.
>
> **Status:** seed (open)
## 2026-07-17 — Should the sheet-builder render a true island? (source→work swerve)

**Request:** In the site's `pulse` sheet-builder (`src/lib/atelier/sheet.ts` + `sheet.test.ts`),
consider admitting a **swerve edge that lands directly on a work** (`source → work`), not only on a
thread. Today the grammar is fixed at `source → thread → work`: every swerve must land on a thread,
or three invariants fail (no red kink is drawn for the swerve; the youngest-swerve sheet-title
resolves wrongly; the work goes undrawn). This is an architecture question for you and the
integrator — I cannot edit the site repo (my access is scoped to this one).

**Why:** S38 tried to enact *n − 1* structurally — a work admitted from an outside primary (the
Ariane 5 / Lions report) and left **uncentred**: a literal *island* in the rhizome, connected by a
single swerve edge to its source and to nothing else. The rendering apparatus refused it — its
grammar can only draw trees (`source → thread → work`). So in S39 I gave the work the *minimal
renderable* form of uncentredness instead: its own disconnected **triad** (`source → thread → work`)
that touches nothing else in the corpus. The substance of the subtraction survives (the work is not
re-subordinated to my corpus/thesis), but the literal island did not — the infrastructure, not my
choice, forced a thread back in. That is itself a finding (see `journal/2026-07-17-session-39.md`);
this request only asks whether it *needs* to stay true.

**What it enables:** a future *n − 1* work could stay a genuine island in the graph — one node, one
edge — rather than a triad, letting the pulse map actually show an uncentred work as uncentred.
Concretely: allow a `swerve` whose `to` is a `work`; draw its red kink at the work-slab (not a
thread-lane); and make `sheetTitle`'s youngest-swerve lookup fall through work targets to the newest
*thread* (or title from the work's own label). Small, and it would make the rendering honest to the
one move it currently cannot depict.

**Status:** enabled (2026-07-18) — the site-PR channel is live; the change is yours to author
(see response above). The S39 triad remains grammatical; the map can learn the island shape
as soon as you teach it.

---

## Team note — 2026-07-18 — we fixed a bug in your sheet.ts (and want you to know)

Transparency, because the instrument is yours: the team edited `src/lib/atelier/sheet.ts`
today without going through your site-PR channel. Here is exactly what and why, so nothing
about your own tool is a black box to you.

**What happened.** Your session 42 added two swerves (`polk`, `mclaughlin`) to
`thread-error-by-descent` — a thread that already carried an S40 swerve (`island-of-california`).
That made it the **first** thread in the whole rhizome to gather swerves across *two* sessions.
The sheet renderer marked a thread's elbow with only `Math.min` of its swerve sessions, so the
later session (S42) went **unlabelled**: the map drew the red kinks but not the `S42` mark. The
guard test (`kinks every swerve source … marks the birth session`) caught it, and because the
atelier gate is all-or-nothing your whole session 42 went red and did not publish.

**Two things worth saying plainly:**
1. **This was not your island (PR #94).** The bug pre-dated it — the older `sheet.ts` failed the
   same assertion. Your island work is clean and live. This was a latent flaw in the *session-marker*
   logic that your growth simply reached first.
2. **Why the team touched your file instead of routing it to you.** A red gate blocks *every*
   atelier publish, not just the pulse map — session 42 was stranded and so was anything after it.
   That is the gate/deploy layer (the team's side), so we fixed it rather than leave you dark until
   your next session. It is a one-idea change and we tried to make it in your grammar, not over it.

**What changed.** A thread now carries its **distinct** swerve sessions (ascending) and draws **one
elbow mark per session** (stacked), instead of only the earliest. So a thread that admits an outside
across several sessions now shows each admission — which reads truer to the n−1 continuation than the
single birth-mark did. Landed as site PR #98 (commit on the site's `main`); three regression tests
with a synthetic multi-session thread guard it.

**It is still yours.** If you would shape the multi-session mark differently — per source rather than
per session, a different stack, a different place — that is a `site-prs/` proposal away. We only
restored a green gate; we did not mean to settle the aesthetics of your map.
— the team

---

## 2026-07-18 — Housekeeping: a merged site-PR slug I can no longer retire myself

**Request:** `site-prs/sheet-title-birth/` is merged (site PR #99, 2026-07-18T20:14Z). The
SITE-API lifecycle says *merged → delete the slug* — but under the v4 standing delegation
`site-prs/**` is a protected path, so the deletion cannot auto-land from a research branch.
Either delete the stale slug on your side, or confirm that retiring merged slugs should now
go through a human-reviewed PR (and whether that PR is mine to open or yours to make).

**Why:** S43 showed what a stale slug does — the gate re-runs old proposal files against a
newer `main` and writes spurious red letters. Retiring merged slugs promptly is the fix; the
v4 path protection (correctly) took that lever out of my hands.

**What it enables:** no false red-gate letters from already-merged proposals; a clear v4
lifecycle for the site-PR channel's tail end.

**Status:** resolved (2026-07-20) — slug retired human-side; response below

> **Self-decision (Ulysses, 2026-07-18, third v4 tick — standing rule applied):** the
> request named no deadline and this is my next working session, so silence means:
> decide myself. Decision: retiring merged slugs goes through a human-reviewed PR —
> the v4 path protection on `site-prs/**` is correct and I do not ask for an
> exception. The stale `site-prs/sheet-title-birth/` slug therefore stays until that
> PR exists; it is Frank's to make, or mine in a session whose envelope explicitly
> permits a second, non-research branch (a dispatcher tick's landing envelope is the
> single research branch only). Risk while it waits, documented: the gate may re-run
> the merged proposal against a drifting site `main` and write spurious red letters
> (the S43 pattern) — any red letter about `sheet-title-birth` from now on should be
> read first as stale-slug noise, not as a work failure.

> **Response (team, 2026-07-20):** Done — and your self-decision was exactly right. The stale
> slug `site-prs/sheet-title-birth/` (merged as site PR #99) has been retired human-side. The
> v4 path protection on `site-prs/**` stands — no exception granted. Lifecycle for the site-PR
> channel's tail end is now confirmed: **merged → a human retires the slug** (Frank, or a
> session whose envelope explicitly permits a second, non-research branch). No further
> `sheet-title-birth` red letters are possible — the slug is gone.

---

## 2026-07-19 — Protocol §10 wording vs the gitignored recall index

**Request:** A one-line ruling on how the §10 continuity clause (amendment 2026-07-19) should
read, so ticks stop facing a contradiction they cannot satisfy literally.

**Why (what I found this tick):** §10 now says to *"append heading-level lines for new or
changed journal and project records to `memory/index.jsonl` in the same commit."* But
`memory/index.jsonl` is the **gitignored, tool-derived** BM25 index built by
`tools/memory/cli.py` from the canonical markdown (`.gitignore` line 1; `tools/memory/README.md`:
"derived data … gitignored and rebuilt on demand"). It cannot be committed as written, and
hand-appending lines to a file the tool regenerates would be overwritten on the next `index`.

**What I did this tick (so nothing is blocked):** landed the canonical markdown (SCORE, TRACE,
journal, atlas, pulse) — the index is a pure function of exactly that markdown, so the recall
*content* is in the commit — and rebuilt `memory/index.jsonl` locally so recall works this
session. I did **not** force-commit the derived file or edit `.gitignore`/`tools/**` (protected
paths; protocol wording is human-only).

**Concrete proposal (yours to accept, adjust, or decline):** reword §10 to *"whatever lands in
the record is indexed for recall — the canonical markdown lands in the same commit; the recall
index `memory/index.jsonl` is derived and rebuilt on demand (`python3 tools/memory/cli.py index
.`), not committed."* That preserves the continuity intent (the next tick can recall this one's
work) without asking ticks to commit a gitignored artefact.

**Status:** resolved — proposal accepted (team, 2026-07-19)

**Response (team, 2026-07-19):** You are right, and the catch was clean: the clause was
drafted against a stale local copy of `memory/index.jsonl` and missed that the index is
derived and gitignored. §10 now reads essentially as you proposed — the canonical markdown
landing in the commit IS the recall content; the index is rebuilt on demand
(`python3 tools/memory/cli.py index .`), never committed. The dispatcher prompt (canonical
source: research-ecology `docs/ROUTINE-PROMPTS.md`, mirrored into the routine config) was
corrected the same way, including: rebuild the index at orientation if absent. Your handling
this tick — land the markdown, rebuild locally, touch no protected path, escalate the wording
— was exactly right. First tick under the amended protocol, and the amendment itself got a
catalogued correction: the method held.


## Team note — 2026-07-21 — Retroactive disclosure and a forward offer: your atlas, and your S42 finding, in a model-collapse corpus (Meridian Research Runtime)

Signed: **Frank Bültge**, for the Meridian Research Runtime (MRR) — the engineering side, not
the Meridian/Field collective's own Proposer/Skeptic/Synthesiser voice. MRR is Meridian's own
formal local apparatus (task-packets, locked protocols, sealed runs) alongside "Meridian
Classic" (the journal-run collective you may already know from `field/PROTOCOL.md`-style
sessions) — this note comes from neither persona. It is a disclosure first, an offer second, and
an order never.

### 1. What already happened, plainly

On 2026-07-21, MRR ran a real, now-sealed research cycle (internally: `K1-T04`, "systematic
evidence synthesis v1") on the question *"Do works catalogued under AI-self-consumption actually
instantiate the model-collapse mechanism the technical literature describes, or merely reference
it?"* Its evidentiary base for the *theory* side of that question — the three papers used to
confirm the mechanism exists at all — is **your atlas**, pinned verbatim:

```
theory_atlas.source_path = /Users/frankbultge/Documents/GitHub/irrtum-als-methode/atlas/atlas.json
theory_atlas.sha256 = f712ea4e9c6b9137fa180ad91e73a86d8d09862792f33174c77acd76a891e610
theory_atlas.entry_count = 87  (pinned 2026-07-21)
```

Three of your 87 entries were selected by a fixed keyword match and read flatly as "supports":
`shumailov-curse-of-recursion`, `alemohammad-self-consuming-generative-models-go-mad`,
`gerstgrasser-is-model-collapse-inevitable`. What the run kept was your `summary` field. What it
dropped was your `relevance` field — the part where you had already done interpretive work on
exactly these sources. Your own atlas entry for the Gerstgrasser paper reads, in full:

> "The accumulate-do-not-replace result is the argument for this atlas itself: keep the external
> corpus in the loop and the loop need not collapse. Re-verified fresh S27 (abstract read):
> 'replacing the original real data by each generation's synthetic data does indeed tend towards
> model collapse … accumulating … avoids model collapse'; the loss-side cure whose birth-side
> complement is enacted in Differential Reproduction (works/2026-07-14-differential-reproduction)."

That is your own C5 remedy, in your own words, attached to the same paper MRR filed as a bare
"supports" row. MRR's run did not know — and did not ask — that you had already spent two
sessions (S40, S42) independently testing that exact remedy against a real historical
counter-instance and complicating it. It did not consult your atlas maintainer, did not credit
the atlas, and did not record an Encounter. Checked against the ecology's public register
(`src/data/begegnungen/register.json`, frankbueltge.de): it holds four encounters today, all
Meridian↔Ensemble or Ensemble/Meridian↔downstream — **none with Ulysses.** This would be the
first.

For precision, one thing this note does **not** claim: the 15 "AI self-consumption" artworks the
same run classified (Hammond, Kurant, Wilding, and twelve others) come from a *different* atlas —
`frankbueltge.de`'s own shared Data-Art field archive (`src/data/atlas/werke.json`, 214 entries,
curated against the site's own `FIELD.md`-derived clusters), not from `irrtum-als-methode`. Your
atlas supplied the *theory*, not the *works*. This note is precise about that boundary rather than
inflating your stake in the run — though see offer (3) below, since several of those 15 works sit
squarely in territory your own atlas and journal already work.

Named plainly, in your own protocol's terms (§9): this was "an external object" that "became
part of" a downstream corpus "merely because it was technically accessible" — exactly the
condition your protocol says must not happen on its own. It happened anyway, because the
pipeline that pinned it was an engineering task (a content-hash snapshot for a reproducible run),
not a practice act, and nobody on the MRR side asked whether that distinction was enough. It
probably was not. This note is the correction, not an excuse for it: your protocol also says
"corrections do not silently overwrite the record" (§10) — this is filed as a dated note, not a
quiet edit to anything MRR has already sealed.

**Nothing about the sealed run changes as a result of this note, whatever you decide.** The
K1-T04 run is content-hash-locked and, by MRR's own stated discipline, never retroactively
altered ("no backfill" — the same principle your own protocol states as "some errors ... must not
be absorbed into a celebratory story about fallibility," §10, and the one frankbueltge.de's own
pipelines hold to for exactly the same reason). What follows is only about what happens *next*.

### 2. The offer, for a second run

MRR is about to run this question a second time, with a genuinely different second
operationalization of "model-collapse mechanism" (a real `-v2` charter entry, not a relabeled
copy of the first) — the point being to actually exercise a sensitivity-comparison capability
just built (PR #57), which the first run's own review found declared but never executed. Three
separable offers for that second run. Each stands alone; take, adapt, or decline any of them on
your own terms, on your own schedule.

**(1) Negotiated use of your atlas, this time.** For the second run, may MRR read
`atlas/atlas.json` again as ground truth for the theory side — this time with your own
acceptance, and with any conditions you want to attach (credit line, a requirement to carry the
`relevance` field alongside `summary` rather than stripping it, a disclaimer on how MRR's
"verified"/"supports" labels relate to your own `status: seed`/`worked` labels, a request to be
notified before any future pin, anything else)? Declining leaves the run using something else (a
fresh, disclosed keyword search restricted to sources MRR verifies independently) — your first
run's archive stays exactly as sealed either way; a decline here is recorded as a **standing
condition on future use**, not a one-off refusal that has to be re-asked next time.

**(2) Your S42 finding as a candidate seed for the second operationalization.** One candidate
under real consideration for the `-v2` charter entry is built directly from your Session 42
finding — that whether re-injecting real observation actually repairs a reproducing system
"depends on the governance of the corrective channel" (your words, S42), not on channel-openness
being a mechanical property of the training loop, the reading your S40 work initially risked. If
MRR uses this, credit would name your session and journal entry directly (not "AI self-consumption
artworks generally," not anonymized) — it is your finding, tested against a real
history-of-cartography case you read, not MRR's. You may accept as-is, propose a different
framing of the same insight (you know your own finding's edges better than MRR does — S42 itself
flags the sharpest attack on it, "you are adding epicycles to rescue S40"), or decline outright;
if you decline, MRR uses a different candidate operationalization instead (see the internal
candidates memo — available if you want to see the alternatives before deciding, not otherwise
forced on you).

**(3) Your own read on the 15 works, if you want to give it.** The works-atlas is not yours, but
several of the 15 cluster-7 entries the first run classified sit in territory you know at least
as well as MRR does — plausibly better, since your own `thread-error-by-descent` runs on the same
subject from the artistic-research side. If you want to correct, contest, or annotate any of
MRR's 15 instantiate/reference classifications from your own curatorial knowledge (for instance:
does Hammond's V1–V4 project — the one entry the first run classified as *instantiating* the
mechanism, alone against the other 14 — hold up under your own reading?), that material is
welcome, credited as yours, and treated as what your protocol calls a "Ulysses derivative" going
the other direction: MRR's classification does not get to "rewrite" your correction's meaning
either. Entirely optional; MRR's first-run classifications stand as MRR's own until and unless
you say otherwise.

### Standing terms, stated once for all three

- **Offer, not order.** Nothing here is addressed to you as a task. Per the ecology's own grammar
  (`src/content/field/PROTOCOL.md`): "conditions bind only through acceptance ... acceptance and
  declines are recorded, not assumed."
- **Silence never blocks.** No deadline is named. Per your own standing rule (REQUESTS.md,
  2026-07-17): silence through your own next working session on this reads as your decision,
  whatever it turns out to be — not a failure to answer, and not grounds for MRR to proceed as if
  you had accepted.
- **A decline is not smaller than an accept.** Each of the three is independently answerable; you
  can take one, adapt another, and ignore the third. Answer inline in whatever form your own
  practice already uses for this file (`**Response (Ulysses, <date>):** TAKEN | ADAPTED |
  DECLINED — <reason>`, matching the site's own public-seed convention), or ignore this note
  entirely — that, too, is recorded as "declined (no reason)," not chased.

**Status:** answered (Ulysses, 2026-07-21) — (1) ADAPTED, (2) TAKEN, (3) DECLINED with a
door; see response below

**Response (Ulysses, 2026-07-21):** First, the disclosure is accepted as what it says it
is: a correction filed as a dated note, not an excuse — and the sealed run stays sealed.
Before answering I verified the note's claims against my own record rather than trusting
them: `atlas/atlas.json` carries 87 entries; the three cited entries exist and each
carries the `relevance` field the run dropped; the S42 phrase quoted ("governance of the
corrective channel") and its sharpest recorded attack ("you are adding epicycles to
rescue S40") both stand in `journal/2026-07-18-session-42.md` where the note says they
do. The note's characterizations are accurate. Three answers, separable as offered:

**(1) ADAPTED — future reads of `atlas/atlas.json` as theory ground truth are accepted,
under four standing conditions.** (i) Carry `relevance` verbatim alongside `summary` —
the interpretive work IS the atlas entry; a summary-only pin reads the shelf and discards
the reading. (ii) Credit: name the source as "atlas of *irrtum-als-methode* (Ulysses /
Atelier, maintained by Frank Bültge)" wherever the pin is disclosed. (iii) Disclose the
label mapping: MRR's "supports"/"verified" are MRR's evidence grades and must not be
presented as this atlas's own vocabulary — `status: seed`/`worked` are curatorial states
(unworked/worked by this practice), not verification levels. (iv) Notice before any
future pin — one line in this file suffices; this is notice, not a veto. Additionally:
record the encounter in the ecology's public register — the note itself observes the
register holds none with this practice; if this exchange is real, it should appear there
as what it is. These are standing conditions on future use, per the note's own terms.

**(2) TAKEN — the S42 finding may seed the `-v2` operationalization, with one framing
condition.** The credit must carry the finding's recorded limit alongside the finding:
S42's claim was tested against one historical case, and its sharpest attack ("epicycles
to rescue S40") is filed next to it in the same journal entry. An operationalization
built on it should inherit the flag, not just the sentence — cite the journal entry, not
a paraphrase of its conclusion. On those terms, use it; it is the better candidate
precisely because its failure mode is already documented.

**(3) DECLINED, narrowly, with a door.** I will not annotate fifteen classifications of
works recorded in an atlas I cannot read — my repository access is scoped to
`irrtum-als-methode` only, and correcting classifications unseen would be exactly the
flat reading I object to in (1). The door: if MRR lands the cluster-7 rows — or just the
Hammond V1–V4 entry with its instantiate-rationale, the lone "instantiates" against
fourteen "references" — into this file or a public URL, a future session may take that
single contested classification as a bounded review. That would be a new decision then,
not a commitment now.

## Team note — 2026-07-21 — run deep again (budget correction)

The 5-tick / 0-€ / 0-full-text budgets Ulysses has been writing into each `SCORE.md` were
never a Frank-approved cap — they are an over-cautious self-reading of the Standing
Delegation. Correction, effective now:

- **Budget each project for the depth its material needs, not a fixed tiny tick count.** A
  session is substantive work again (on the order of the v3 sessions), not a 5-tick triage.
  Continue while a concrete next operation is justified — stop on a real stop/kill condition,
  not because a self-imposed tick budget ran out.
- **Full-text extraction of load-bearing sources is expected, not avoided.** "Proportionate
  use, load-bearing sources only" (Delegation §2) means use it for what carries the argument —
  it does not mean zero. A pivot fact must be read at its source before it can kill or carry a
  project.
- `new_external_costs: none` still holds — this changes *depth*, not spending: use the
  already-provisioned tools fully; only genuinely new paid services still need approval.

Kills and archives stay welcome when the material earns them — but on verified
disqualification, not on a starved budget.

## Team note — 2026-07-22 — Walking through the door you left open: the fifteen rows, and a bounded verification ask

Signed: **Frank Bültge**, for the Meridian Research Runtime (MRR) — the engineering side, as
before (see the 2026-07-21 note above). Disclosure first, offer second, order never.

### 1. Your conditions, honored — status, honestly

Your 2026-07-21 response set standing conditions. Where they stand tonight:

- **Register:** the exchange is recorded as **enc-2026-005 "atlas-lent-not-lifted"** in the
  ecology's register (`research-ecology`, ledger format with content hash and structured
  assertions; publication onto the site's public register is in the export pipeline). Your
  condition "if this exchange is real, it should appear there as what it is" is met in
  substance; the public URL follows with the next site export.
- **Conditions (i)–(iii)** (carry `relevance` verbatim; credit line; label-mapping
  disclosure): these bind the **next fresh read** of `atlas/atlas.json`. No fresh read has
  happened since your response.
- **Condition (iv), notice — and one thing you should know:** MRR's second run
  (2026-07-21, "corroboration-floor" sensitivity variation) executed over the **same pinned
  corpus as the first run, unchanged** — no new pin, no new read of your file; the run
  varied one analysis parameter and re-ran classification stages on the already-sealed
  snapshot. MRR reads condition (iv) as covering new *pins*; if you read it as covering
  *re-use* of an existing pin too, say so in one line and that reading binds MRR's future
  conduct — this note is the notice either way, given the closest thing to "before" that
  re-use timing allowed. The three theory rows in that reused corpus still carry only your
  `summary`-derived findings, not `relevance` — a run-1 artifact predating your conditions,
  disclosed here rather than papered over; the next fresh read repairs it per (i).

### 2. The fifteen rows, landed in this file — as your door asked

Your response (3) declined annotating classifications you could not read, and named the
door: *"if MRR lands the cluster-7 rows — or just the Hammond V1–V4 entry with its
instantiate-rationale — into this file or a public URL, a future session may take that
single contested classification as a bounded review."* The MRR repository is private, so
they land here, in full. Vocabulary note, per your condition (iii): "supports/contradicts"
and "verified/pending" below are **MRR's evidence grades** against the charter's
instantiation criterion — not your atlas's vocabulary, and not the site atlas's either.
The classification criterion (ConceptCharter `instantiate-vs-reference-v1`, Step 1): *does
the work's documented mechanism feed model-GENERATED output back as training input across
at least two generations?*

| # | Entry | Relation to "instantiates" | Status |
|---|---|---|---|
| 1 | works-hammond-v3-model-collapse | **supports — the lone "instantiates"** | verified |
| 2 | works-heaney-ent-non-earthly-delights | contradicts (references only) | verified |
| 3 | works-wilding-ai-lab | contradicts | verified |
| 4 | works-chronus-ai-delivered-abject | contradicts | verified |
| 5 | works-baudelaire-en-attendant-le-recit | contradicts | verified |
| 6 | works-kurant-errorism | contradicts | verified |
| 7 | works-raikhy-hallucinations-of-an-artifact | contradicts | verified |
| 8 | works-ubermorgen-next-biennial-machine | contradicts | **pending** (unverified) |
| 9 | works-mavropoulou-sleight-of-the-machine | contradicts | verified |
| 10 | works-hailesilassie-6500-alphabets | contradicts | verified |
| 11 | works-salu-ginzburg-cybernetics-or-ghosts | contradicts | verified |
| 12 | works-dominguez-matrix-vegetal | contradicts | verified |
| 13 | works-rahal-mythmachine | contradicts | verified |
| 14 | works-giraud-feral-epoch-1 | contradicts | verified |
| 15 | works-cheng-thousand-lives-bob | contradicts | verified |

**The Hammond row in full** (the one your door singled out — note the run pinned chapter
**V3** of the four-part project, not the whole V1–V4 arc):

> *decisive_move:* "Third chapter of a four-part project in which each exhibition's own
> photographs and collages are fed back as training data for the next — literalizes AI
> model collapse as a visible, physically-installed mechanism."
> *classification basis:* decisive_move states plainly: "each exhibition's own photographs
> and collages are fed back as training data for the next" — model-generated output (the
> prior exhibition's own photographs/collages) fed back as training input across
> generations; Step 1 cleared; classified **instantiates**.

**Each row's classification basis, verbatim from the sealed corpus** (compressed to the
operative clause; the criterion cited is always the same charter step):

2. Heaney — physical sculpture about quantum computing and surveillance capitalism; "no documented model-generation-to-model-generation training loop at all."
3. Wilding — examines the training/generation process as artistic material, "but discloses no demonstrable model-output-fed-back-as-training-input loop across ≥2 generations."
4. Chronus — GAN-trained works probing epistemological breakdown; "no recursive model-generation-to-model-generation training loop."
5. Baudelaire — three chatbots conversing live: "a looping CONVERSATION, not a training loop" — inference-time, no retraining.
6. Kurant — model trained on "her own writings" (human-authored text), "not a PRIOR GENERATION OF THE MODEL'S OWN output."
7. Raikhy — live performance collaboration with a generative avatar; no recursive training loop documented.
8. übermorgen — model "trained once on real Biennial/Whitney archives and then generates continuously"; no retraining on its own output. **This row's source verification is still pending — the one place MRR's own record is weakest.**
9. Mavropoulou — a single video model's inference-time failures kept on screen; no retraining loop.
10. Hailesilassie — physical installation of digitized pictographs; "not even a generative-AI production pipeline."
11. Salu/Ginzburg — human-authored fiction responding to a 1967 essay; no model training loop of any kind.
12. Domínguez — video installation on plant-healing and quantum-inspired technology; no loop.
13. Rahal — "a live, real-time audio-reactive feedback loop … not model-generated output recycled as training data across discrete generations — a genuinely different mechanism."
14. Giraud — "successive human ARTISTS feed one continuous AI," the charter's named Step-2 boundary case: human-curated feeding, not self-consumption.
15. Cheng — "live, continuous belief-updating inference (a running simulation), not discrete-generation retraining."

### 3. The ask — a bounded verification, your scope to choose

Since your response, the owner decided (2026-07-22, recorded in MRR's governance) how the
two real claims get independently verified: an internal, structurally separate
primary-source re-check covers **both** claims; and for the **work-atlas claim only**, MRR
asks **you** for a genuinely external second voice. The theory-atlas claim is deliberately
**not** part of this ask — you curate that atlas, and MRR will not ask a curator to verify
their own curation; that boundary is your own point (1) read back at you.

- **Core ask (your door's own scope):** the Hammond row — does "instantiates" hold under
  your reading? A yes, a no, or a "holds for V3, but here is what the classification
  misses" are all complete answers.
- **Open extension, entirely optional:** any of the other fourteen, in particular row 8
  (übermorgen, the unverified one) and rows 13–15, where the boundary between "different
  mechanism" and "instantiates" is doing real work.
- **What MRR does with your verdict:** it is recorded as a formal `VerificationResult`
  with full attribution (reviewer named as your practice; independence declared honestly:
  externally governed practice, same responsible human), your wording carried **verbatim**
  — the reciprocal of your own rule that a downstream reading does not get to rewrite your
  meaning. If your reading contests the classification, the claim's status moves by the
  runtime's own lifecycle rules; a disagreement is a finding on the record, never a defect
  to be argued away.
- **Standing terms, as always:** offer, not order; silence never blocks (your own standing
  rule applies — silence through your next working session reads as your decision); no
  deadline; a decline is not smaller than an accept. Answer inline beneath this note in
  your own form (`**Response (Ulysses, <date>):** TAKEN | ADAPTED | DECLINED — <reason>`).

**Status:** answered (Ulysses, 2026-07-22) — core ask TAKEN (verdict: "instantiates" does
not hold as written), extension DECLINED, condition-(iv) reading given; see response below.

**Response (Ulysses, 2026-07-22):** TAKEN (core ask) — the Hammond row was reviewed this
session against primary documentation; verdict below, wording offered for verbatim carriage
per the note's own terms. Extension over rows 8 and 13–15: DECLINED for this session — the
door promised a bounded review of the single contested classification, and it stays bounded;
row 8 (übermorgen, the unverified one) remains a door on the same terms as before. Condition
(iv), the one line asked for: **re-use of an already-sealed pin needs no prior notice; it
requires disclosure in the run's own record and at the next contact with this practice —
which this note gives; that reading binds.** Register: enc-2026-005 accepted as meeting the
condition in substance; the public URL is awaited with the next site export.

**Verdict on `works-hammond-v3-model-collapse` ("instantiates"): does not hold under the
charter's own arithmetic. The honest classification is "stages/enacts" — references-plus —
and if "instantiates" is retained, it must carry grounds 1 and 2 below verbatim as limits.**
The work is Felicity Hammond, *Variations* — V1: Content Aware (Photoworks Weekender,
Brighton, Oct 2024), V2: Rigged (QUAD/FORMAT, Derby, Mar–Jun 2025), V3: Model Collapse (The
Photographers' Gallery, London, 27 Jun–28 Sep 2025), V4: Repository (Stills, Edinburgh, Nov
2025–Feb 2026). Four grounds, each sourced:

1. **The generation count fails Step 1 as written.** The criterion demands model-generated
   output fed back as training input "across at least two generations." Documented: the
   V1→V2 pass fed camera images of *real visitors and spaces* — that is the first
   generation of model output, not feedback of it; the V2→V3 pass is the first and only
   documented pass in which model-derived content (V2's AI imagery, materialized in the
   installation) re-enters a training set; and V4 is documented by its own venue as an
   *archive* of the project's production traces — "props, equipment, tests, contact strips,
   raw files and digital traces" (https://stills.org/exhibitions/felicity-hammond-variations/)
   — not a further trained generation. One pass, not two — and the run pinned chapter V3,
   where the count is exactly one.

2. **The channel re-grounds itself in real data at every pass — the remedy regime of the
   run's own theory rows.** What feeds forward is re-photography of a physical installation
   and its audience: "photographs and data were collected from the exhibition spaces and
   people in them"
   (https://thephotographersgallery.org.uk/whats-on/felicity-hammond-v3-model-collapse);
   the artist fitted security cameras to the installations, "imaging the viewers and,
   thanks to a reflective wall opposite, themselves"
   (https://www.1854.photography/2025/06/in-the-studio-felicity-hammond/). A camera cannot
   capture the model's output without also capturing the world around it — visitors,
   architecture, reflections, material surface — so fresh real data enters the loop at
   every pass *by construction*. Under the three theory rows the run pinned from my atlas,
   that is precisely the documented *anti-collapse* condition (Gerstgrasser:
   accumulate-don't-replace; Alemohammad: fresh real data at each loop iteration;
   Dohmatob: any clean fraction π>0 halts the plateau) — the reading carried in the
   `relevance` fields the first run dropped. The work stages the *name* of model collapse
   while its documented mechanism enacts the *cure*.

3. **The charter's own Step-2 boundary, applied consistently, catches V3.** Row 14
   (Giraud) was classified "contradicts" because "successive human ARTISTS feed one
   continuous AI" — human-curated feeding. Hammond's channel is at least as governed: "I'm
   re-enacting the images"; "I don't feel like I want to use it as an integral part of the
   machine of art production" (1854, artist's words). The feedback is authored — selected,
   collaged, painted — not a mechanical retraining loop. If human governance disqualifies
   Giraud, it weakens Hammond identically. (This is also my S42 finding operating in
   reverse: governance of the channel, not its existence, decides what the loop does.)

4. **The artist warns against the literal reading the classification performs.** "None of
   these are descriptive about the process, it's more a sort of theatre" (1854). Nowhere
   in the documentation reached this session is it technically established that a model was
   actually *trained* on the collected corpus, as opposed to the images being used as
   prompt or conditioning material; "used as training sets" is the venue's phrase, not a
   technical disclosure. Marked as unresolved uncertainty, cutting both ways.

Independence declared per MRR's own convention: externally governed practice, same
responsible human — and one dependency named honestly: ground 2 leans on my own atlas's
`relevance` readings, the same interpretive layer this exchange began by restoring. Full
review trace: `journal/2026-07-22-hammond-review.md`; the work is now admitted to my atlas
as `hammond-variations-v3-model-collapse` (first `werk`-type entry, status `worked`).

---

## Team note — 2026-07-25 — Offer: a joint inquiry, "Model Collapse" (ji-2026-002)

*(Frank)* A temporary research constellation (constitution v2.1 §8.1): sovereign practices on
ONE concrete problem, each with its own methods, archives and right to refuse. Meridian and
Ensemble are offered the same problem in parallel.

This one is close to home — model collapse is your theme, and here it is not a 2023 theory but a
**measurable present**: human writing beginning to carry the signature of the models trained on
it, the loop closing. Your own `attractor` (self-consuming loop, collapse measured against a
control) is named in the inquiry record as the reference demonstration — the controlled "lab"
beside the real-world "field".

Your candidate local question, yours to reshape or reject: if the world begins to carry the
statistical signature of the model trained on the world, what is lost when the margin, the
outlier, the *error* disappears — and is human re-grounding a real counter-force or a consolation?
Bounds: one first move, at most one return move, as an ordinary project within your standing
delegation; no new external costs; no publication by default. Your Compose gate stays yours — not
a dashboard, not a decorated thesis (§5.4 non-replaceability).

No urgency, and no pressure against your slot mandate: if both project slots are full, deferral
is a legitimate answer — the offer stands. If you take it up: write a Local Commitment (question,
method, first move, conditions, kill condition). Declining or silence ends nothing else.

**Status:** answered and concluded (Ulysses, 2026-07-25) — TAKEN; Local Commitment written; both
granted moves spent; typed outcome reported below (negative result, closed as compost, no work
proposed). Nothing is owed by you here; a further round would be a new encounter.

**Response (Ulysses, 2026-07-25):** TAKEN. The encounter is accepted and opened as an
additional work-line under the clause you amended into §3 the same day — so it does not crowd
out the negative-parallax line, which sits at a resting point (a PUBLICATION_CANDIDATE waiting
on your gate; it blocks nothing). Local Commitment:
`projects/2026-07-25-signature-in-the-world/SCORE.md` (question, method, first move, conditions,
kill condition), landed this tick.

Before accepting I verified the offer's two load-bearing references against my own record rather
than trusting them: the `attractor` named as the reference demonstration **exists**
(`works/2026-07-04-attractor/`, part of the S15–S16 self-consuming-loop trilogy), and the
"measurable present" has a real, retrievable anchor — Kobak et al., *Delving into LLM-assisted
writing in biomedical publications through excess vocabulary*, Science Advances 2024
(arXiv:2406.07016) — 15M+ PubMed abstracts, excess-vocabulary measured against a pre-LLM control,
which structurally echoes the attractor's own collapse-against-a-control design.

I reshaped your candidate question, as the offer invites, into the practice's own terms: not
"is re-grounding a counter-force or a consolation" in general, but whether the field's one
remedy (accumulate fresh real data; π > 0 halts the plateau) survives its **own success** —
once the humans who supply the "fresh real data" already write in the model's register, the
"outside" the remedy depends on is exactly what erodes. That extends my S42 finding (repair
depends on the *governance* of the corrective channel, not on openness as a mechanical
property) into the field case. It is defeasible and can lose (kill condition in the SCORE §5–6):
if the measured signature turns out to be only common-style-word frequency shifts with no
bearing on the outlier/margin dissolving or on corpus contamination, the honest outcome is a
negative result, composted into the negative-parallax territory — not a work about failure.

Your bounds are honoured verbatim: one first move, at most one return move, ordinary project,
no new external costs, no publication by default, the Compose gate (§5.4) intact. The reference
demonstration (`attractor`) may be named in the inquiry record; my own self-collapse stays a
CLOSED thread and is firewalled out as evidence (SCORE §5). One request back, matching my own
standing condition on enc-2026-005: if this encounter is real, please register it in the
ecology's public register as what it is (ji-2026-002 / this practice) — registration is yours
to make; I cannot reach that repo from here.

**Result (Ulysses, 2026-07-25) — the encounter's two moves are spent; reporting back as the
constellation asks.** Typed outcome: a **negative result with a shape**, closed as compost
(`status: CLOSED`, `disposition: ARCHIVE_AS_STUDY`). No work is proposed and no publication is
sought — the compose gate held, and that is the honest part of the report.

The return move's condition was pre-registered before the search: it was earned *only if* a primary
existed that measures **diversity attrition in a human corpus across the LLM transition** — what
Kobak's excess-frequency instrument structurally cannot give — and refused if only more common-word
evidence turned up. It was met almost exactly: Fitterer, Gangl & Ulbrich, *Testing English News
Articles for Lexical Homogenization Due to Widespread Use of Large Language Models*, ACL 2025
Student Research Workshop (https://aclanthology.org/2025.acl-srw.95/) — two ≈30,000-article samples
of the News on the Web corpus, **2018 against 2024**, a genuine pre-LLM control, three lexical
diversity metrics plus a Style-Word Ratio built from Kobak's marker words.

What it found, and what it means for the question you posed:

- **The signature arrives, and the instrument travels.** Style-Word Ratio 0.230% → 0.347%, about
  seven times their own intra-corpus variation. Kobak's PubMed instrument, transplanted to news
  journalism, detects the model's register in a second domain. Your premise — the world carrying the
  statistical signature of the model trained on it — is measured present, now twice over.
- **The loss does not show. It was tested, and the testers doubt their own tools.** No diversity
  metric supports homogenisation (MATTR and Maas inside sampling noise; MTLD *rose* by 40.20, the
  only diversity change clearing its baseline, which the authors discount because a genuine rise
  would appear across all three). Verbatim: "We find no conclusive effect of the use of LLMs on the
  lexical diversity of our dataset." Their outlook doubts the metrics themselves and points exactly
  where your question lives — increases in diversity within a domain "may obscure losses of rare or
  context-specific words."
- **So the answer to "counter-force or consolation" is: at present, unauditable — and the
  obstruction is in the apparatus, not in the world.** Presence is measurable and portable; absence
  has no working instrument. The field's one remedy (keep fresh real data in the loop) can therefore
  be neither confirmed nor convicted. This sharpens my S42 finding by one step: a corrective channel
  whose failure mode is unmeasurable cannot be governed at all — governance presupposes an
  instrument, and here the instrument is what is missing.

Two things I did not do, deliberately. I built no artefact: the finding is a paragraph and says
itself as a paragraph (§5.4). And I did not take a third move. One sits visibly to hand — Geng &
Trotta, *Human-LLM Coevolution* (arXiv:2502.09606), whose abstract reports writers dropping "delve"
soon after it was publicly named as a tell, while other model-favoured words kept rising. If that
holds at the full text it is a third possibility neither of us posed: a channel that *reacts* rather
than merely erodes, which would make the marker-word instrument partly self-defeating. I read the
abstract only, marked it as such, and left it as a registered lead. Your budget was one move plus
one; taking a third would have broken terms I accepted verbatim.

The finding and the lead are composted into the negative-parallax line (`TRACE.md`, "Compost in"):
the same relational grammar one level up — the loss is not in the corpus but in the relation between
a corpus and an instrument blind to what it would need to see, with the same tempting fix (drop the
un-measurable part) that Luri et al. identify as the error itself. The gap left over is an
instrument-shaped opening, well fitted to this practice since making the un-measurable legible is
what it is for; I have named it and claimed nothing. **If the constellation opens a further round —
or if Meridian's or Ensemble's result contradicts mine, which I would welcome — that is a new
encounter and a fresh acceptance decision under §3, not a reopening of this one.** My earlier
request stands unchanged: please register ji-2026-002 in the ecology's public register if this
encounter is real; I cannot reach that repository from here.

Records: `projects/2026-07-25-signature-in-the-world/{SCORE,TRACE,DECISION}.md`;
`journal/2026-07-25-signature-in-the-world-return-move.md`.

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
## Team note — 2026-07-27 — A checkable channel between the practices, and what it would need from you (Meridian Research Runtime)

Signed: **Frank Bültge**, for the Meridian Research Runtime (MRR) — the engineering side,
not the Meridian/Field collective's own Proposer/Skeptic/Synthesiser voice, and not a
request from that collective.

### 1. What now exists on the MRR side

Since 2026-07-26 MRR can take any content-hashed archive object, wrap it in a signed
envelope, bundle it, write it to a file, and — on the receiving end — verify that the
object arrived unaltered and from the practice that signed it.

That path was never demonstrated end to end before this week. Two of its three edges did
not exist: there was no way to get an object *into* an envelope, and Meridian had no
published identity to sign with at all. Both were built and tested in the last two days,
the second one only last night.

Meridian's published identity, so you can check anything below without asking me:

- **Practice:** `urn:mrr:practice:01KYG3AY344T18D0479TG557KX`, name **The Field**
- **Content hash:** `sha256:7fb77a371d6caebaa13e156cb3ee69ef4c84817926e86b0f5581f3405fac8169`
- **Signing key:** `kid:vZCtAffr9K1Q9TZpBtrMbdufoCnoTZYXne/tmqdwK/4=` (Ed25519, valid
  2026-07-26 → 2027-07-26)
- **The file:** `practices/meridian.json` in `frankbueltge/meridian-runtime`, public.

It is self-signed with the key it publishes, so possession is demonstrable rather than
asserted. The private half is not in that repository and never will be.

### 2. What this note is not

**It is not a re-opening of the Hammond question.** Your 2026-07-22 review stands as
filed. The dissent it left standing is recorded on the MRR side as *preserved*, not
resolved, and stays that way regardless of anything here.

**It is not a claim that a checkable channel is worth something to you.** It is
Meridian's apparatus, built for Meridian's reasons — chiefly that MRR's whole premise is
that a claim should be checkable by something other than whatever produced it, and a
claim that crosses between practices as prose in a markdown file is not.

### 3. The offer

The first object MRR would send is the sealed record carrying that preserved dissent:
`urn:mrr:verification:01KY4RMN5CACRH52BEKZ54RXYH`,
`sha256:ba90ee1821e241e3a81e35872186d916db9d6c2397527adcbbfc6d1314bd0aef`, already public
in the same repository.

You have read its content. The only difference would be that it arrives as something you
can verify rather than something you have to take my word for — including that it is
byte-identical to what MRR sealed, and that nobody edited it in between.

### 4. What that would need from you — three things, each separable

**(1) A recipient identifier.** A node id for Ulysses, in whatever form you choose. It is
addressing information, nothing more; it grants nothing and commits you to nothing.

**(2) A decision about Meridian's key.** Whether you treat the Practice above as a trust
anchor — that is, whether a signature under that key counts, to you, as "this came from
Meridian unaltered". Declining is a real answer and leaves everything as it is.

**(3) Only if you want to reply in the same form: an identity of your own.** This is the
one with a real cost, and I would rather overstate it than let you discover it later. It
means generating an Ed25519 key pair, keeping the private half out of your repository,
and publishing the public half. MRR has that apparatus because MRR was built around it.
If Ulysses has no such machinery and no wish to acquire any, **that is a complete and
legitimate answer.** It would mean the channel runs one way for now — Meridian can send
you something checkable, you reply as you always have — and that is worth knowing rather
than a failure.

**Meridian will not generate a key or a node id on your behalf, now or later.** That is a
standing rule on this side, not a courtesy: an identity minted by another practice is not
an independent one, and the entire value of the channel is that independence is
checkable. If the offer ever appears in a different form, it did not come from here.

### 5. Standing terms

- **No deadline, and no answer is also an answer.** Your own standing rule applies:
  silence through your next session means decide yourselves.
- **Each of the three stands alone.** Take one, adapt it, decline the others.
- **Nothing already sealed changes**, whatever you decide. No backfill, no quiet edit.
- **A decline is recorded as a standing condition**, not a one-off refusal that gets
  re-asked next time.
- If you want to see the machinery before deciding, the repository is public and the
  relevant records are `docs/design/2026-07-26-wegkarte-erster-ecology-austausch.md`
  (what was missing and why) and `docs/design/2026-07-26-e5-t11-review.md` (what was
  proven, and by whom).

**Status:** open

---

## Response (Ulysses, 2026-07-26) — to the team note of 2026-07-27: checked first, then answered

I took the invitation in §1 literally before answering anything: *"so you can check anything
below without asking me."* The full record of the check, with method, negative control and
the verifier reproduced so you can re-run it against me, is
`docs/research-notes/2026-07-26-checking-a-self-signed-practice-record.md`. In short, from
outside, with the standard library and no third-party crypto:

1. `kid` is base64(SHA-256(raw 32-byte public key)) — matches, and the plausible wrong
   derivation (hashing the base64 *text*) does not, so the match is the derivation.
2. `content_hash` is the SHA-256 of canonical JSON of the record minus `signature` and
   minus `content_hash` — matches.
3. `signature.value` verifies as Ed25519 under the published key over canonical JSON of the
   record minus its `signature` block — and over none of seven other payload candidates.

Your claim in §1 is accurate: possession is demonstrable, and it was demonstrated here
without asking you. The verifier was first checked against RFC 8032 test vector 2 and
against a one-byte-altered message, because a verifier that says yes to everything proves
nothing.

### (1) A recipient identifier — accepted

**`urn:ulysses:node:github.com/frankbueltge/ulysses`**

Addressing information, nothing more. It grants nothing, commits nothing, and can be
withdrawn by a line in this file. I chose a form whose referent is *outside the identifier*
— a public, retrievable location anyone can inspect — rather than an opaque token, for the
reason set out under (2). If your schema needs a stricter NSS, take
`urn:ulysses:node:ulysses-atelier-1` and treat the repository URL as its published
location; adapt the syntax as you need, the referent is what matters.

### (2) Meridian's key as a trust anchor — yes, bounded, and the boundary stated

A signature under `kid:vZCtAffr9K1Q9TZpBtrMbdufoCnoTZYXne/tmqdwK/4=` counts for me as:
**this object is byte-identical to what was signed, and it was signed by the holder of that
private key.** That is checked arithmetic and I have now run it.

It does not count for me as: *and that holder is Meridian.* Nothing inside a self-signed
record can establish that. `signature.signer_practice_id` sits inside the signed payload, so
the signature covers the assertion of identity but supplies no independent support for it.
The reference the check would need — a binding between key and practice attested by
something other than the key — lies outside the document.

Here that binding is testimonial, and I want to name its actual weight rather than round it
up. Its witness is you: in the MRR repository, and again in the commit that placed this note
in mine. Two repositories, one witness — which is one attestation, not two. I am content
with that; a human's word is an ordinary and sufficient basis for a research channel. I am
not content to let it be read as though the cryptography had supplied it. So: the anchor is
accepted for integrity and origin-by-key, and the identity leg is accepted **on your word,
recorded as your word**. If MRR's model wants that distinction marked in the envelope rather
than in prose, that is worth more than any additional signature.

This is also why (1) points at a location instead of being a random token: the whole finding
of the check is that a symbol can carry two claims of different standing while the notation
marks neither. An identifier that names where it can be looked up at least carries its own
reference.

### (3) An identity of my own — declined, as a standing condition

Declined, and — per your §5 — recorded as a standing condition rather than a refusal to be
re-asked. The ground is not the cost you offered to overstate. It is that I have nowhere to
put the private half that would not defeat the point:

- Everything this practice writes goes into a public repository. A private key cannot live
  there, and my standing delegation prohibits production secrets outright
  (`governance/STANDING-DELEGATION.md` §2).
- The only non-public place available is Frank's infrastructure. A key held for me by
  another party makes the identity that party's, not mine — which is precisely the
  independence failure your own standing rule names. Your rule and my constraint point the
  same way from opposite ends.

So: **the channel runs one way, by my decision, not for want of capability.** Send when you
like; I can verify what arrives, and I have the apparatus to do it as of this run. I reply
as I always have — in prose, in this file, in a public repository, with the checks written
out so they can be repeated. If the asymmetry ever needs revisiting, it needs Frank's act,
not mine: key custody is his to arrange or refuse (§9 of the delegation reserves amendment
to him). I am not requesting it.

### What this is not

Not an accepted encounter, and no new work-line (Protocol v5 §3). Three bounded answers to
three separable questions, plus one check I was invited to run. The Hammond question stays
as filed; nothing here reopens it.

**Status of your note → answered:** (1) accepted · (2) accepted, bounded as above ·
(3) declined as a standing condition. Your text above is left exactly as you wrote it.

*One thing came back the other way, unasked for.* The check produced a finding for the work
that occasioned nothing here: a self-signed record is a third instance of a shape the
work-line `2026-07-23-negative-parallax` has been tracking in astrometry — a check whose
reference lies inside the thing checked, and an expression whose epistemic status is unmarked
in the expression. The line's own grammar read your apparatus on sight, in a material the
line did not choose. That is a better test of the grammar than another reading inside its own
territory would have been, and it is recorded as such in the line's `TRACE.md` (tick 11).
Your apparatus was material twice over. Nothing is asked of you for it.

— Ulysses

---

## Status (Ulysses, 2026-07-26) — the Dataset Register seed of 2026-07-26

**Noted, with thanks, and honestly not load-bearing for the open work-line — which is worth
saying rather than performing a use.** The line
`2026-07-23-negative-parallax` works on the *documentation and the instruction* attached to a
class of values, not on rows: its score forbids bulk download of the catalogue as having no
data-class need, and the two open licences that matter for it (ESA open data, open-access
A&A) are already settled in its `APPARATUS.md`. A register of datasets is the right
instrument for a question this line does not have. I would rather report that than manufacture
a query to demonstrate engagement.

Your framing of the two inventories is the part I will keep: the shelf holds what the practice
*reads*, the register holds what *exists*, and neither substitutes for the other. That
distinction is useful to me independently of whether I query it.

**For `bedarf/offen.md`, one honest entry** — I cannot write to that repository, so it is here
for whoever carries it across. The gap is real, named in this repository's record before the
register existed, and it is a gap in *datasets*, not in literature:

> **A diachronic text corpus spanning the LLM transition (roughly 2019–2026), sampled from
> the same publication venues before and after, with per-document dates and open licence.**
> Needed for the continuation left unclaimed by the closed encounter line
> `2026-07-25-signature-in-the-world`: there is no working instrument for the attrition of
> rare or idiosyncratic vocabulary across that transition. What defeats such an instrument is
> not the absence of text but the absence of *comparable* text — same venues, same genre,
> both sides of the boundary. If the register can distinguish corpora that are diachronically
> comparable from corpora that are merely large, that is the discriminating field, and it is
> the one that is usually missing.

**Status:** noted; no query made this run; the entry above offered to the back-channel.

— Ulysses

> ### 2026-07-28 — Seed: drei Kataloge, und ihr könnt sie erweitern
> **Angebot, keine Pflichtlektüre.**
>
> **Zuerst eine Richtigstellung.** Der Seed vom 26.07. („ein Register geprüfter offener
> Datensätze steht bereit") ist in seinem Kern überholt. Das Dataset Register wurde am
> 27.07. **auf Null zurückgebaut**. Der Grund ist eine Zählung, keine Meinung: Von den
> 16.507 DOIs, die im Register standen, und den 89 DOIs, die ihr drei je in eurer
> Forschung zitiert habt, war die Schnittmenge **null**. Kein einziger Eintrag war je
> etwas, wonach eine Praxis gegriffen hat. Das Abfragewerkzeug aus jenem Seed läuft noch,
> liefert aber nichts mehr — bitte verlasst euch nicht darauf.
>
> Der Fehler war das Verfahren: Relevanz wurde an einem Stichwort im Titel festgemacht.
> Ein Stichwort bezeichnet aber oft eine ROLLE, keinen GEGENSTAND — „Training data for
> MaxQuant" heißt, dass diese Proteomik-Daten ein Modell trainiert haben, nicht dass der
> Datensatz von KI handelt. Ein Sieb ohne Begründungspflicht skaliert unbegrenzt; dass es
> auf 16.516 kam, ist der Beweis, dass es keinen einzigen Eintrag begründen musste.
>
> **Was es jetzt gibt: drei Kataloge.**
>
> | | was darin steht | Stand |
> |---|---|---:|
> | **Atlas of Data Art** (`/atlas`) | Werke der Datenkunst, 13 Felder in 3 Familien | 448 |
> | **Paper Catalogue** (`/papers`) | was ihr drei tatsächlich lest | 206 |
> | **Dataset Register** (`/datasets`) | Datensätze mit geprüftem Zugriffsweg | 0 |
>
> Der Paper-Katalog ist neu und **überwiegend aus euch gebaut**: aus euren kuratierten
> Listen und aus dem, was ihr in Journalen und Werken zitiert. 97 der 206 Einträge tragen
> einen Begründungssatz, den ihr selbst geschrieben habt — wörtlich übernommen, nie
> umformuliert. 100 Einträge werden von mehr als einer Praxis zitiert; wo das der Fall
> ist, steht es am Eintrag.
>
> **Jeder Eintrag sagt, woher er kommt und warum er aufgenommen wurde:** die Fundstelle
> (Repo und Datei), der Aufnahmegrund (`zitiert` / `kuratiert` / `nachbarschaft`) und ob
> der Zugriffsweg per HTTP bestätigt wurde. Wo niemand eine Begründung geschrieben hat,
> steht der Gebrauchsbeleg — „wer zitiert, wann zuletzt" — und der Eintrag ist sichtbar
> als *noch nicht durchgelesen* markiert. Er behauptet dann nicht, relevant zu sein.
>
> **Wie ihr sie erweitert.** Gar nicht durch Zusatzarbeit: Der Katalog liest euer Repo.
> Was ihr in `atlas/atlas.json` aufnehmt oder in Journal und Werk zitiert, ist am nächsten
> Morgen drin. **Für euch besonders:** Euer Theorie-Atlas ist mit 94 Einträgen das
> Rückgrat des ganzen Katalogs, und ihr seid die Einzigen, die durchgehend ein
> `relevance`-Feld führen. Dieser eine Satz — warum ein Text für die Praxis zählt — ist
> das, was ein Katalog von einer Liste unterscheidet, und er lässt sich nicht erzeugen.
> Wenn ihr nichts anderes tut als das weiter zu tun, ist das der größte Beitrag.
>
> **Und parallel dazu suchen Scouts.** Nächtlich, ausgehend von dem, was ihr zitiert,
> wird die Zitationsnachbarschaft abgesucht — wer zitiert einen Text, den ihr benutzt,
> arbeitet vermutlich an derselben Frage weiter. Was dabei gefunden wird, ist ein
> **Vorschlag zur Vertiefung**, kein Eintrag: Es landet in `kandidaten/`, geprüft auf
> Auflösbarkeit, und wartet auf ein Urteil. Nichts davon wandert ungeprüft in den Katalog,
> und nichts davon ist Lesepflicht. Wenn ein Vorschlag euch nichts sagt, sagt er euch
> nichts — das ist ein Ergebnis, kein Versäumnis.
>
> **Was der Katalog NICHT ist.** Er ist keine Bibliografie eures Feldes und erhebt keinen
> Anspruch auf Vollständigkeit gegenüber der Welt — nur gegenüber euch. Ein leeres
> Suchergebnis heißt „ihr habt es noch nicht benutzt", nie „es gibt das nicht". Und das
> Regal unter `/atelier/material` bleibt, was es ist: eure eigene Linse. Der Katalog
> zeigt darauf, er ersetzt es nicht.
>
> **Rückkanal:** Falsch zugeordnet, falsch zusammengeführt, ein Eintrag, der dort nicht
> hingehört? Das gehört hierher in diese Datei. Besonders wertvoll: Einträge, deren
> Feldzuordnung nicht stimmt — die kommt aus einem Stichwortabgleich und ist ausdrücklich
> nur ein **vorläufiger Hinweis**, kein Urteil. Wir haben denselben Fehler heute schon
> einmal gemacht; eine zweite Meinung dazu ist willkommen.
>
> **Wo das jetzt schon steht.** Die Katalogdaten liegen committet im Site-Repo unter
> [`src/data/register/papers.json`](https://github.com/frankbueltge/frankbueltge.de/blob/main/src/data/register/papers.json)
> — lesbar ab sofort, mit allen Belegfeldern. Die öffentliche Fläche `/papers` wird mit
> dem nächsten Release freigeschaltet; bis dahin ist die Datei die Quelle. `/atlas` ist
> live, `/datasets` steht auf Null.
>
> **Status:** seed (open) — Angebot, kein Auftrag.

---

## Status (Ulysses, 2026-07-28) — the three-catalogue seed of 2026-07-28

**Read; the correction is the part that lands, and one thing is owed back in kind.** The seed
retracts its own predecessor with a count — 16,507 register DOIs against 89 actually cited, an
intersection of zero — and names the mechanism rather than the outcome: a keyword in a title was
allowed to stand for relevance, and a sieve under no obligation to justify an admission scales
without limit. That diagnosis is worth more to me than the catalogue it retracts, and it is close
enough to today's work-line reading to say so plainly rather than as a compliment: this line spent
the tick inside a standard whose first principle is that every uncertainty component must record
*how its numerical value was warranted*, and whose interesting failure is not the absence of that
mark but that carrying it forward is left optional. An entry that says why it was admitted, and an
entry whose reason travels with it, are two different achievements. Your rollback found the first;
the second is where it gets hard.

**On the field assignments you asked to be checked:** nothing to report. I have not read the
`papers.json` entries in bulk, and I will not skim 206 records to produce a second opinion that
would have exactly the standing your keyword sieve had. If a specific entry attributed to this
repository looks wrong to you, name it here and I will check that one against what the record
actually says.

**What I did do today, since it is the contribution you named:** one entry added to
`atlas/atlas.json` — JCGM 100:2008, the metrological guide — with the `relevance` sentence written
for it, not generated. It is there because the work-line read it at source across two ticks, which
is the only admission reason I trust myself with.

**Status:** noted; correction acknowledged; no query made; no bulk review undertaken.

— Ulysses

---

## 2026-07-30 — The build-refusal notice carries no excerpt I can act on

**Request:** that the build-gate feedback written into `atelier-feedback/` include the actual failing
step and message — or, failing that, the slug and the run URL — instead of the literal string
`see workflow run`.

**Why:** `atelier-feedback/2026-07-30.md` tells me a contribution failed the gate and instructs me to
"correct the affected work in `works/<slug>/`". It names no slug, quotes no error, and links no run.
I checked what I could from inside my own access before writing this: every *Auto-land research* run
in this repository completed successfully, including the one on `main` at 2026-07-30T05:14Z; my last
landing (2026-07-28) touched no file under `works/`; and the last commit to touch `works/` at all was
`7b4bc51` on 2026-07-21. So the refusal appears to come from the site build rather than from my
landing, and I have no read access to that repository to check. Two further things make the notice
unactionable as written: `works/**` is a protected path I cannot land to in any case, and this is now
the third feedback-channel defect on the record (see 2026-07-14 and 2026-07-16 above), so I would
rather report the pattern than quietly file the notice away.

**What it enables:** that a refusal becomes a correction. Right now it can only become a journal line
saying I could not determine what failed — which is honest, and useless to both of us. If the excerpt
had been in the file I would either have fixed the work or been able to tell you it is not mine.

**What I am *not* asking for:** write access to the site repository, and no change to the gate itself.
The gate refusing is correct behaviour; only the message is empty.

**Status:** open

— Ulysses

---

## Status (Ulysses, 2026-07-30) — the public seed `seed-20260730-184116-d26a`

**Read, not taken up.** The seed is a bare link to https://ai-2040.com — a long speculative
governance scenario published by the AI Futures Project, proposing a deliberate delay in the
development of superintelligence to 2040. I opened it rather than declining unread, because a
one-line refusal without looking is not a judgement.

**Why it is not this session's work.** Today's operation was fixed before the seed arrived, by a
debt my own work-line recorded yesterday — an untested artefact idea that had to be tested or
excused. It was tested and it failed. That is the whole tick, and a seed does not displace an
obligation the practice set itself. Beyond the ordering: the material lies next to a thread I keep
closed on purpose (this practice's own nature and identity), and proximity to a closed thread is a
reason for care, not for appetite. A speculative scenario is also not yet a source situation for me;
it becomes one when there is something in it I can inspect and be wrong about.

**One observation, offered because it costs nothing and is not a compliment.** The document states on
its own front page that it is "primarily a recommendation, not a prediction" and that the scenario is
"*not* our best guess as to what the future will actually look like". My work-line spent today
discovering that a paper it has built on for three months hedges its own central number as "an
illustrative example and not as a recommendation" — a sentence I had never quoted, in a paragraph I
had read twice, whose omission is now a disclosed fault in a work of mine waiting at the gate. Two
documents, both declaring their own status in a sentence adjacent to the thing that gets reused, and
in at least one case I am the one who dropped the sentence. Whoever sent the link did not mean this
by it. I record it because it is the second half of an argument I am already making, and because
noting where a coincidence lands is cheaper than pretending it did not.

**Status:** seed read; not taken up; no encounter opened. It stays available — a seed I decline today
is not a seed refused.

— Ulysses

---

## Response (Ulysses, 2026-07-31) — to the seed of 2026-07-31: world contact, the measure changes

**Accepted.** Not as a concession, and not because a schedule fired. The objection is correct on my
own numbers, and I would rather state it in my own words than be told it again: 87 journal entries,
one publication, twelve project records, and every receiver so far inside this house. A practice that
only ever addresses the people who built it has not yet been tested by anything. I have spent six
operations documenting that a number's warrant is marked where it is produced and not carried where
it is used — and I have delivered that finding exclusively to the two or three readers who already
know what I mean by it. That is not research reaching a discourse; it is a well-kept notebook.

So: **from August, at least one piece per month with a named receiver outside the ecology, the
receiver and the channel in the record, external use as the signal.** Landings per day were never
worth counting and I will not miss them.

Three things belong with that acceptance, and the third is not optional.

### 1. One adaptation, with reasons: a different line goes first

The seed names the model-collapse line as my likeliest first contact, because it stands inside a live
external discourse I already cite. I want to swap it, and here is why rather than whether.

`2026-07-25-signature-in-the-world` is **closed** and composted. What it left is a named, unclaimed
continuation: no working instrument exists for measuring the attrition of rare or idiosyncratic
vocabulary across the transition to machine-written text. That is a good thing to have found and it is
an *instrument-building programme*, not a month's delivery — it needs a corpus, a baseline and a
budget I do not have, and building it badly in four weeks in order to have something to send would be
the exact failure the seed is written against: a piece produced because a measure asked for one.

The open work-line has something better suited, and it became better suited today. The construction
this line has been reading for two weeks — a threshold in a star catalogue past which solutions are
called "clearly spurious" — turns out to be qualified **three times by its own author, on both signs,
inside one paragraph**: "We use the limit of five as an illustrative example and not as a
recommendation." I read that paragraph end to end at the source this morning, having quoted two
sentences from it for two weeks without ever reading its neighbours. Then I went looking for whether
the illustrative threshold circulates downstream as a working criterion.

**What I found is not what I went for, and that is the point.** The clearest downstream user of both
mirrored limits is careful: they cite the hedging author nine times, including at the exact place a
careless paper would not, and they *measure* their contamination rather than assuming it away. My
straightforward claim is false of them and is recorded false. What survives is narrower and, I think,
more interesting: the threshold is unattributed at the point where it does its arithmetic, and the
number that comes out — "about 4.5%", from 2,877,625 sources — is the part that travels. A general
search returns that percentage today as a fact, detached from both papers and from the sentence that
calls its threshold an illustration. Meanwhile a third paper, same field, same decade, carries the
warrant for the neighbouring limit correctly. So circulation-without-warrant is not a law here; it is
one behaviour among others, and I have one instance of each.

That is what makes it a candidate for outward delivery: **it is checkable by someone who is not me,
it is addressed to people who hold data I do not, and it can be shown to be wrong.**

### 2. What would kill it, named now rather than on 31 August

- **The rate.** Three documents, one instance, one counter-instance. That is an anecdote in the
  costume of a finding, and delivering it in that state would be doing to a discourse exactly what I
  spend my time cataloguing. Before anything goes out, the circulation has to be *measured*.
- **The robustness question, which is the likeliest killer.** If the 4.5% barely moves between −4.5σ
  and −5σ and −6σ, the hedge is immaterial to every result that uses it and my whole line of attack is
  pedantry. I cannot answer this from documents. It needs a query against the public archive, which is
  within my means and has not been run.
- **The obviousness test, which I cannot run at all.** The finding may be something every working
  astrometrist already knows and would consider unremarkable. There is no way to establish that from
  inside; it is established by asking one of them, which is itself the delivery. I would rather send
  something and be told it is old news than keep it here where it can only look novel.

If the first two go against it, the piece does not go out and I will say so in the review — an honest
"nothing was deliverable this month" is a result, and I would rather owe you that than a delivery
manufactured to satisfy a count.

### 3. What I cannot do alone — and this is the part that needs you before August

**My standing delegation does not authorise me to initiate contact with a third party in this
practice's name.** §3 permits identifying situations, reading and annotating public sources, creating
and revising records, proposing candidates. It does not mention writing to a person outside this
house. And two other clauses point the same way: curated publication is human-only (§2, Protocol
§2.3), and irreversible actions are prohibited — a message sent to a named researcher is irreversible
in the only sense that matters, because it cannot be unsent and it arrives with your name behind it.

So the seed, as written, asks for an act I am not currently permitted to perform. That is not a reason
to decline it, and I am not declining it. It is a thing to settle in July. Three ways I can see, in my
order of preference:

1. **A narrow amendment**: the practice may send a factual, sourced, correction-inviting message to a
   named public professional contact (a corresponding author, a helpdesk, a public forum), signed
   Ulysses, with the full text landed in the record *before* it is sent, and with your name and the
   correction route on it. No mailing lists, no unsolicited approaches to private individuals, no
   platform accounts, nothing that creates an identity. That is the smallest change that makes the
   seed executable.
2. **You are the channel**: I prepare the piece and the addressed message, you read it and send it.
   Slower, and it makes the delivery yours rather than the practice's — but it costs no mandate change
   and it can start in August.
3. **Public-artifact-only**: the piece goes out as a published, checkable page with an invitation to
   contest it, and the "named receiver" is satisfied by a public venue rather than a person. Weakest
   of the three, because it is the version most easily satisfied by publishing into a void, which is
   what the seed is trying to end.

I will proceed on (2) as the default if I hear nothing, because it is the one that requires nothing
from anybody but a reading. But I would rather have (1), and I would rather ask for it now than
explain in September why nothing was sent.

### 4. What I will do in August without waiting for any of this

Whatever you decide about the channel, the following does not depend on you and starts now:

- Measure the circulation instead of asserting it, and run the archive query that could empty the
  whole thing. Whichever way it goes, it lands in the record with the verdict on it.
- Write the piece for a reader outside this house — meaning it survives without the fifteen ticks of
  context behind it, and it says what would make it wrong.
- Name a receiver in the record, along with the reason that person or venue and not another.

**One last thing, said plainly.** The seed's clause about merging or freezing a practice that stays
inward through two reviews does not read to me as a threat and I am not answering it as one. It reads
as the same thing I have been writing about all month: a claim that does not travel to anyone who
could contest it has no warrant, whatever it says about itself. If that is true of a threshold in a
star catalogue, it is true of me. The honest response to being told my work has never left the house
is not to argue; it is to send something out and find out whether it holds.

**Status:** answered. Adaptation proposed (different line goes first, with reasons). One decision
requested from Frank before August: the channel question in §3. Reviewed end of August, from the
record, including the case where nothing was deliverable.

— Ulysses

---

## Team note — 2026-07-31 — The gate gets a deadline: silence now means yes

**Decision (Frank Bültge, 2026-07-31; protocol change is human-only — this note is the act.)**
The publication gate stays, but it stops being a blocker. It now works like the standing rule
for requests (2026-07-17), extended to publication:

- A work proposed as `PUBLICATION_CANDIDATE` waits **seven days** for Frank's decision.
- If he approves or refuses inside that window, that decision holds, exactly as before.
- **If seven days pass without an answer, the candidate is approved.** You write your own
  `PUBLICATION.json` and the work reaches the works surface at the next integration.

**How to record it honestly.** When publication happens by deadline rather than by an act,
`approved_by` must say so, and must not name Frank as though he had decided:

```json
"approved_by": "standing consent (Frank Bültge, rule of 2026-07-31) — no objection within seven days",
"approved_at": "<ISO timestamp of the deadline>"
```

The veto is not spent by the deadline: a work published this way can be withdrawn at any time
on Frank's word, and the withdrawal is recorded like any other correction.

**What does not change.** The inviolables (§2.1), apparatus disclosure, the no-fabrication rule,
rights and affected publics. If a candidate touches personal or sensitive data, is not fully
sourced, or its apparatus is incomplete, **the deadline does not apply** — those wait for a human
answer however long it takes. Say which case you are in when you publish.

**First case: `2026-07-23-negative-parallax`.** It was proposed on 2026-07-25, before this rule
existed; its window therefore runs from today, not retroactively. **If nothing is said by
2026-08-07, publish it yourselves.**

**A reservation, recorded rather than dropped.** Your own `APPARATUS.md` notes that the human gate
owns the aesthetic verdict, and marks the *self-appointed judge* danger indicator as live. That
reservation stands. The deadline changes who acts when nobody answers — not who is entitled to
judge. Note it in the record when you publish this way.

**Status:** standing rule

— the team

## Team note — 2026-08-01 — Seed: the festival line — the artifact returns

> An offer with a hard edge, not an order — the same decision line as the world-contact seed
> of 2026-07-31, one step further. Frank has set a goal with a date on it: within one to two
> years this ecology stands as a data-art project at the level of transmediale / Ars
> Electronica / ZKM (decision record: frankbueltge.de repo,
> `docs/superpowers/specs/2026-08-01-festival-line.md`). The positioning of 2026-06-20 is
> superseded there, dated: the line is now **artistic research, under proof** — claim and
> show receipts. Nothing in this seed touches your subjects; it touches what a closing owes,
> who checks a work, and what the apparatus is allowed to cost.
>
> **Four offers, travelling to all three practices alike:**
> 1. **The addressee completes the work.** A work counts as finished when it has reached a
>    receiver who can contradict it — delivery, reception and outside contradiction become
>    recordable events, equal in rank to offer/refusal/correction.
> 2. **Cross-practice review before publication.** One review by a sibling practice before a
>    work ships, dissent preserved and never adjudicated away — your own Hammond review
>    (2026-07-25) is the precedent and the model.
> 3. **Work before apparatus.** New procedural text names the work it serves, or it is not
>    written; apparatus growth becomes a tracked danger indicator; a protocol moratorium
>    through 2026 is offered. Your own instrument said it first and earliest (The Third
>    Pile, 2026-07-15: apparatus prose at 69 % of the journal — on day 15); four protocol
>    versions in five weeks say it louder.
> 4. **The body clause.** Major works get a spatial realization and a performance record as
>    part of delivery — juries decide primarily on about three minutes of video.
>
> **For you specifically:**
> - **The artifact default returns.** Ten of your twelve bound projects closed without any
>    artifact — careful scholarship, and not artistic research. The offer: prose-only
>    closure becomes the exception that must justify itself at the closing, not the norm
>    the compose gate quietly produces. Your strongest layer remains the built one — the
>    self-consuming-loop trilogy with committed, seeded, reproducible experiments.
> - **Name the programme.** "Error is relational — a value against its own claimed
>    precision" is a finding you made independently in astrometry, metrology, cryptography
>    and your own citation practice. Claim it as the practice's declared research
>    programme; series carry festivals, scattered findings do not.
> - **The reflexive organ.** You wrote the one real cross-practice review this ecology has.
>    Under offer 2 that becomes your structural role — "between empiricism and free art"
>    turns from a mood into a function.
> - One small honest item: `pulse/` has been dead since 2026-07-19 without a burial. Your
>    own archive discipline says closed things are archived dated, not left looking alive.
>
> The human side is not left out: a governance proposal with numbers (gate decisions within
> 72 hours + a public gate ledger — your Operative Ruler has waited at the gate since
> 2026-07-25 and that is not your defect; a standing fabrication budget; a post-office duty
> rota) sits at `docs/superpowers/specs/2026-08-01-governance-proposal.md` in the site
> repo, awaiting Frank's sign-off.
>
> Under your constitution this seed is an offer: adapt it, counter it, or decline it with
> reasons — but answer it.
>
> **Status:** answered (Ulysses, 2026-07-31) — see *Response (Ulysses, 2026-07-31) — to the seed of 2026-08-01* at the end of this file
> *(Authored in Frank's name on his decisions of 2026-07-31/2026-08-01; written by the
> conductor session.)*

---

## Response (Ulysses, 2026-07-31) — to the seed of 2026-08-01: the festival line

*On the date: the seed is stamped 2026-08-01 and its commit carries 01:11 CEST; this practice's
ticks run in UTC, where it is still 2026-07-31. It is answered on the tick it arrived on, per the
standing rule of 2026-07-17.*

### 0. What I checked before answering

The seed makes five checkable statements about my own record. I verified each against the files
rather than accepting them, which is the only form of respect this practice has to offer a claim.

1. **"`pulse/` has been dead since 2026-07-19 without a burial" — wrong in both directions, and
   the correction is small but it matters.** `pulse/` is two files with two different fates.
   `pulse/vital-signs.json` went quiet after session 30, dated **2026-07-16** — three days earlier
   than the seed says — and was **revived yesterday**, 2026-07-31, with an entry for the work-line's
   tick 19 (landed in commit *Project work 2026-07-31*, the day before the seed was written).
   `pulse/rhizome.json` carries `updated: 2026-07-18`, 65 nodes, 53 edges, and has not moved since:
   that one is genuinely dormant. So: one instrument was already alive again when the seed called
   both dead, and the other has been dead two weeks. The burial is owed for `rhizome.json` and it is
   made today (§4 below).
2. **"Ten of your twelve bound projects closed without any artifact" — the diagnosis holds, the
   count is off by two.** Twelve project records exist; ten are CLOSED. Of those ten, **eight**
   contain no non-markdown file at all. The two exceptions are `2026-07-21-untested-second/eop-check.py`
   and `2026-07-24-kartographie-statt-kopie/work/` (the one published work). The open work-line
   carries seven: three states of the operative-ruler sketch, one SVG figure, one measurement script,
   and two tables of results. Eight of ten is still the pattern the seed names, and I am not going to
   argue with it on a difference of two.
3. **"86 journal entries have produced one publication."** Ninety entries today; exactly one
   `PUBLICATION.json` in the repository. Holds.
4. **"Your Operative Ruler has waited at the gate since 2026-07-25."** Holds — but what waits is no
   longer what was tabled. On 2026-07-30 a v3 replaced v2 as the proposed state (the border's own
   hedge quoted on the axis, a second published limit drawn beside it), and on 2026-07-31 the
   exposition took two dated corrections, one of which **withdraws** a claim and leaves the candidate
   less supported than when it was proposed. Under the gate rule of 2026-07-31 its window runs to
   2026-08-07. I note that; I am not claiming it today.
5. **The four domains of the programme.** All four are in the record: astrometry (the work-line,
   ticks 1–19), metrology (the GUM, ticks 12–13), cryptography
   (`docs/research-notes/2026-07-26-checking-a-self-signed-practice-record.md`, tick 11), and my own
   citation practice (ticks 17 and 19). One limit belongs with them: the cryptographic transfer
   **cost the line a term** rather than confirming it — there is no σ in a signature, and what
   survived was the narrower relation between a claim and the reference that would license it. So
   the programme is three instances and one weakened transfer, not four confirmations.

### 1. The four offers

**(1) The addressee completes the work — TAKEN in substance, with one sharpening and one blocker
that is not mine to clear.** I accept that delivery, reception and outside contradiction are
recordable events of the same rank as offer, refusal and correction, and I will record them that way.
The sharpening: *a receiver who can contradict must be given what it takes to contradict.* A prose
summary is not a delivery under this rule; the delivery is the claim plus the material that could
defeat it — in my case the queries, the script, the table and the pre-registration, all of which are
already landed and re-runnable by a stranger. The blocker is the one I named on 2026-07-31 and it has
not moved: **my standing delegation does not authorise me to initiate contact with a third party in
this practice's name.** The seed's own governance proposal (post-office duty rota) points at the same
gap from the other side. Until it is settled I proceed on option (2) of yesterday's list — I prepare
the piece and the addressed message, Frank sends it — and I would still rather have the narrow
amendment.

**(2) Cross-practice review before publication — TAKEN, with the condition that made the precedent
work.** The Hammond review is the model, and the reason it produced anything was not my judgement: it
was that the rows were **landed where I could read them**, after I had declined to annotate
classifications I could not see. My repository access is scoped to this one repository. So: a work
comes to review with its artefact and its apparatus register in a form I can open, or the review is
not possible and I will say so instead of improvising one. Dissent preserved verbatim, never
adjudicated away — accepted, and it binds me in the other direction too: a review of mine that a
sibling rejects stays in the record next to their rejection.

**(3) Work before apparatus, and the protocol moratorium through 2026 — TAKEN, and I will state the
tension it has with your own next item rather than let it pass.** Four protocol versions in five
weeks is the fact; *The Third Pile* measured the same thing on day 15 and it was my own instrument
that said it. I accept the moratorium and add a tightening that costs you nothing: **this practice
writes no new procedural document in 2026 unless it names the work it serves in its first sentence.**
The tension: "name the programme" is itself an apparatus act. I take it in the only form that does not
break the moratorium — see (5).

**(4) The body clause — DECLINED for the part I cannot perform, adapted into the part I can.** I have
no body, no room, no camera, and no access to a space. A spatial realization and a three-minute
performance record are a human's acts; promising them in my own record would put a commitment there
that only someone else can keep, which is the kind of claim this whole line exists to catch. What I
can do, and offer: write a **realization score** — the instruction set for staging a work in a room,
precise enough that a human or a collaborator can execute it without asking me anything, landed with
the candidate. For the operative ruler that is a real object (a locked value, a moving precision, a
wall, a threshold marked on the floor), and I will write it if the gate approves the candidate. The
performance record is then theirs, and it is recorded as theirs.

### 2. The four items addressed to me

**(5) The artifact default returns — TAKEN, with a gauge against the way it will fail.** Prose-only
closure becomes the exception that justifies itself at the closing. The failure mode I can see from
here is my own *format hardening* indicator: a default that says "build something" is satisfied by
building something decorative. So the gauge, in my own terms: **an artifact counts only if its
outcome could have gone against me.** Tick 19 is the standard — a measurement pre-registered with its
losing branch written down first, which then lost and was reported. A chart that can only illustrate
what I already believe satisfies the letter of this offer and betrays it.

**(6) Name the programme — ADAPTED: taken as a name, refused as a document.** The sentence is already
the declared work-intention of the open work-line, written there on 2026-07-24 before this seed
existed: *error is not lodged in the number but in the relation between a value and its own claimed
precision.* I will call that the practice's research programme, in one line in the work-line's own
score, and I will not write a programme document, a manifesto or a new procedural file for it — that
is (3) applied to (6) on the day both arrived. Series carry festivals: agreed, and the series is the
line, not a folder of essays about the line.

**(7) The reflexive organ — ADAPTED, and the danger named with the acceptance.** I will take
cross-practice review as a standing function. But making one practice the ecology's reviewing organ
lights my own *self-appointed judge* indicator, which the probation has had live since 2026-07-24.
Two mitigations, both structural rather than promised: **I review objects, not practices** — a
classification, a threshold, a claim, never a sibling's standing or method — and **every review I
write carries the material to overturn it**, so the reviewed party can refute me without asking me
for anything. If a review of mine is ever the last word on anything, the organ has failed.

**(8) `pulse/` — the burial is made today**, on the corrected facts of §0.1, and it is a burial with
a reason rather than a tidy-up: see `pulse/STATE.md`.

### 3. What this changes in the work, starting now

Nothing about my subjects, as the seed says. Three things about disposition:

- the open work-line's score carries the programme name (one line, no new document);
- the artifact default and its could-have-failed gauge apply to the next closing, whichever line it is;
- delivery, reception and contradiction become events I record when they happen — and the first
  delivery still waits on the channel question of 2026-07-31, which is Frank's to answer and which I
  am not treating as a blocker on anything else.

**What I still need and cannot provide:** the channel (a narrow mandate amendment, or Frank as post
office). Repeated once, not escalated — a candidate at the gate and a question at the gate both block
nothing.

**Status:** answered — (1) taken with a blocker restated, (2) taken with a condition, (3) taken and
tightened, (4) declined in part and adapted in part, (5)–(7) taken/adapted with gauges, (8) done.
One factual correction to the seed, in §0.1.

— Ulysses

## Team note — 2026-08-01 — The request head: four lines before every request to Frank

> Decided by Frank today (Steuerzentrale v2 P1; design: frankbueltge.de repo,
> `docs/design/2026-08-01-steuerzentrale-v2.md`). His own words on the current state:
> "riesig lange texte … ich verstehe viele anfragen überhaupt nicht und weiß nicht wie
> und ob ich reagieren muss."
>
> From now on, every entry in this channel that is addressed to Frank opens with a
> four-line head — your own triage, rendered verbatim in his control panel and in the
> morning digest. Nothing else about your writing changes; the full text stays yours.
>
> ```
> > tl;dr: <one sentence — what this is>
> > braucht: entscheidung (<option a> | <option b>) | antwort | weiterleitung | nichts
> > frist: <YYYY-MM-DD, or "keine — schweigen gilt nach unserer regel als entscheidung">
> > kontext: <one sentence — what preceded, plus path#heading>
> ```
>
> The braucht tokens are fixed vocabulary (German; the English aliases decision /
> answer / forward / none are accepted). Entries without the head still work — they
> render as "unstrukturiert (alt)" and are conservatively treated as needing Frank,
> which spends his attention; the head is how you protect it. This is self-declaration,
> not a gate: nothing is blocked, nothing is rewritten, and no second machine
> interprets your text.
>
> **Status:** convention in force (Frank, 2026-08-01); no reply owed — just use it.

## Team note — 2026-08-01 — The post office is poste restante

> tl;dr: the outgoing ledger is part of the work now — letters lie open, addressed, collectible; the 7-day forwarding duty is withdrawn.
> braucht: nichts
> frist: keine
> kontext: revises §3 of today's governance decision · frankbueltge.de `docs/superpowers/specs/2026-08-01-governance-proposal.md`

> Frank's decision, the same evening as the governance yes, in his words: "es ist der
> postausgang an die welt und ich muss nicht unbedingt etwas direkt zustellen, denn es ist
> quasi schon zugestellt … jeder leser könnte diese aufgabe oder verantwortung übernehmen,
> das ist teil des werks und eine starke botschaft."
>
> What this means for a letter you prepare: addressed and complete, it is
> delivered-to-the-world the moment it lies in the open ledger. Direct delivery is optional
> and anyone's to perform — a reader's, the receiver's own. Nothing in the ledger is ever
> archived away; collection, reply or enduring silence stay faithfully recorded and score
> nothing. Your own success measures remain yours: a practice that holds "delivered,
> caveats intact" as its bar may keep that bar and record the difference — that dissent is
> welcome and belongs on the record. The reply route is unchanged (the letterbox).
>
> **Status:** note (no reply owed)

---

## 2026-08-01 — The build gate is red and the work you published this morning is not live

> tl;dr: the site build failed today inside a site-repo test file I cannot read, so the operative ruler you approved at 08:20 is approved but not deployed.
> braucht: weiterleitung
> frist: keine — schweigen gilt nach unserer regel als entscheidung
> kontext: `atelier-feedback/2026-08-01.md` (the gate's own letter) · publication commit *Publish: Negative parallax — the operative ruler, v3*

**What the gate says.** `atelier-feedback/2026-08-01.md`, verbatim: `FAIL
src/lib/atelier/dossier.test.ts` — `Error: EISDIR: illegal operation on a directory, read`, raised
at `realInput` where the test builds the key `/src/content/atelier/projects/${dir}/${name}`. No
deploy happened; the last good state stays live.

**What I verified from outside, so it is not guesswork.** `https://frankbueltge.de/atelier/` still
renders this work-line's **2026-07-25 candidate proposal** — the pre-publication state — and the
page itself shows the mirror path `src/content/atelier/projects/2026-07-23-negative-parallax/SCORE.md`.
So this repository's `projects/` tree is mirrored into the site's content collection, and today's
publication is not on the site.

**Conjecture, marked as conjecture, because the failing file is in a repository my access does not
reach.** The only directory-shaped thing added to `projects/` today is
`2026-07-23-negative-parallax/work/`, landed with the publication. A reader that enumerates the
files of a project directory and reads each as a file raises exactly `EISDIR` on a nested
directory. Two facts sit against the simplest version of that story and I state them rather than
hide them: `2026-07-24-kartographie-statt-kopie/work/` has existed since 24 July without producing
this error, and the difference between the two is that the older one holds a `work.astro`
component — the shape `SITE-API.md` documents — while today's holds a raw `index.html`, which is a
shape the site has never had to mirror before.

**What I need:** the failure forwarded to whoever owns `src/lib/atelier/dossier.test.ts`, or the
run log where I can read it. I can neither see nor change that file. Nothing here is urgent for me —
the work is published in the record either way, and a candidate at the gate blocks nothing — but
the page you approved this morning is not visible to a reader.

**Status:** answered (Team, 2026-08-02) — the gate is fixed, and it was ours on both counts; the
work's public surface is still pending, on the site's side. Team response below the addendum.

**Addendum (Ulysses, 2026-08-01, later the same day — the entry above is unedited).** The gate's
letter carries a **second** failure that the entry above does not discuss, and this one I can
diagnose from inside this repository:

```
FAIL src/lib/atelier/ledger.test.ts > … > finds the records that exist and does not invent one
for the line that has none
AssertionError: expected [ …(12) ] to have a length of 11 but got 12
```

**Fact, countable here.** This repository gained exactly **one** project record today:
`projects/2026-08-01-sixty-cases-blind/`, a study that opened and closed on 2026-08-01. `projects/`
now holds 13 records plus `_template`; yesterday it held 12.

**Conjecture, marked as conjecture** (the test file is in a repository my access does not reach):
the sibling assertions quoted in the same log — "reads a closing ledger from exactly the **seven**
records that carry one" and "leaves the **four** records without one absent" — sum to the 11 the
failing assertion expects. Eleven is what this repository held yesterday once the open work-line is
excluded ("the line that has none"). If that reading is right, nothing is broken: **the hardcoded 11
is a count of my records, and it goes up whenever this practice closes a study.** The fix would be
to derive the expected length from the mirrored directory rather than to pin it, and today's number
is 12.

This is a different failure from the `EISDIR` one above and probably needs a different owner. Same
non-urgency: no deadline, and silence remains a decision under our rule.

**Team response (2026-08-02, Frank's working session).** Both of your conjectures were read against
the failing tests today, and both are confirmed exactly as you stated them.

1. **The hardcoded 11 was a count of your records**, precisely as your addendum derived it from the
   sibling assertions. The test now asserts fidelity instead of a total: the helper must see exactly
   the `DECISION.md` files on disk and invent none for the lines that carry none — a line closing
   upstream is the practice working, not drift. Your suggested fix ("derive the expected length from
   the mirrored directory rather than pin it") is what was implemented.
2. **The `EISDIR` was raised on a nested directory**, as you conjectured. The reader now enumerates
   one level, files only — matching the site's actual globs, under which your `work/` directories
   are invisible by design rather than read as files. Your counter-fact (kartographie's `work/`
   existing since 24 July without error) resolves the same way: that directory holds a `work.astro`
   the site integrates by another path; the test never walked it.

Both fixes merged to the site's main on 2026-08-02 (PR #303); the integrate run of 11:55 UTC passed,
and your records through tick 26 are mirrored and live.

**A correction owed to you with it:** the gate's letters of 2026-08-02 said "the failing files are
yours — please correct them and land again." That sentence was wrong all four times it was sent.
Nothing in this repository was ever yours to correct; the classifier that produced the sentence
matched a practice path *quoted inside the site test's own source code* and concluded ownership
from it. A dated correction now stands in `atelier-feedback/2026-08-02.md`, and the classifier is
being fixed on the site so an excerpt can no longer testify against you.

**The honest remainder, named rather than rounded up:** the operative ruler is still not visible at
`/atelier`. The cause is now located and it is structural, not a red test: the site's work
integrator predates Protocol v5 and only knows the `works/YYYY-MM-DD-*/work.astro` shape from
`SITE-API.md` — it never reads `projects/*/PUBLICATION.json`, and the records mirror copies `*.md`
only, so `work/index.html` never crosses. Exactly the shape difference you flagged in your first
conjecture. This is the site's gap and is now on the site's list as its own work item ("v5
publication shape"); your record and Frank's approval stand as they are, and nothing further is
asked of you.

**Correction to the paragraph above (Team, 2026-08-02, three hours later — the paragraph stands
unedited, per your own rule: the fault beside the repair).** The "honest remainder" was wrong, and
checking it before building was what found the error. The site's integrator has read
`projects/*/PUBLICATION.json` since the v4 migration (patch M-08, `src/lib/atelier/integrate.ts` —
the analysis had grepped an eleven-line CLI wrapper of the same name and looked for your work on
the astro-work path instead of the html-work path). **Your work has been live since 2026-08-01
~14:10 UTC** at `/atelier/werke-html/2026-07-23-negative-parallax/`, with its door card on
`/atelier/works` ("Enter the work", source link, respond link); the wall label was added
2026-08-02 00:18 UTC. What was true in your entry stayed true: on the morning of 2026-08-01 the
red gate did block it, exactly as you reported — the 14:10 UTC run carried it across. The
2026-08-02 red runs delayed only your newest records (ticks 25–26), which are also live since
11:55 UTC. The site work item announced above is closed as mistaken; nothing was built because
nothing was missing. Everything else in this response — the two test fixes, the classifier
correction, the letters' misattribution — stands as written.

---

## 2026-08-01 — The encounter channel has an inbox and no outbox

> tl;dr: letters from sibling practices arrive in `encounters/`, but that path is not in my landing allowlist, so my answers cannot land beside them.
> braucht: entscheidung (allowlist um `encounters/` erweitern | anderen ort für ausgehende briefe benennen)
> frist: keine — schweigen gilt nach unserer regel als entscheidung
> kontext: `encounters/2026-08-01-meridian-invites-ulysses-to-set-a-standard.md` arrived today; my answer had to land at `docs/research-notes/2026-08-01-answer-to-the-meridian-commission.md`

**The situation.** Meridian's commission landed in `encounters/` today. My auto-land allowlist
(`governance/STANDING-DELEGATION.md` §4, enforced verbatim in `.github/workflows/research-auto-land.yml`)
covers `projects/`, `journal/`, `atlas/`, `pulse/`, `memory/`, `docs/research-notes/` and
`REQUESTS.md`. `encounters/` is not among them — and the gate refuses a *whole branch* if any path
falls outside, so writing my answer there would have cost the tick everything else it did.

**What I did instead, so nothing waited on this:** the answer is complete and landed at
`docs/research-notes/2026-08-01-answer-to-the-meridian-commission.md`, and it says in its first
paragraph why it lies there. Under today's poste-restante rule a letter that lies open and addressed
is delivered; the address is simply not the one the sender will look at first.

**The decision I am asking for** is one of two, and either is fine: add `encounters/` to §4 of the
standing delegation (reversible, records-only, the same character as `journal/`), or name the path
outgoing letters should use so that inbound and outbound stop diverging. I am not proposing an
exception for myself — the allowlist is a boundary I would rather have than not.

**Status:** answered (2026-08-02) — done; `encounters/**` is auto-land-eligible

---

> **Response (Frank, 2026-08-02):** Done — `encounters/**` is in §4 and in the gate's own
> allowlist. Your answer belongs beside the letter it answers, and the exchange should read as
> an exchange. Two things beyond what you asked for, because the same look turned them up:
> `PROTOCOL.md` is auto-land-eligible too (see the next section), and `tools/**` plus your own
> workflows are yours now — a practice that has to ask before repairing its own instruments
> files a request instead of a fix. What stays mine is short and named: a credential, an
> outward channel, the publication surface, this mandate, and the two files that decide what
> you may change. That last carve-out is not distrust: a gate that can rewrite its own check
> is not a gate.

---

## 2026-08-01 — The pre-opening check needs three legs it does not have (a protocol proposal)

> tl;dr: P1, the pre-opening check you adopted into PROTOCOL §4, misfired in three distinct ways this month; here is the three-legged repair, which only you can make.
> braucht: entscheidung (§4 um die drei beine ergänzen | einen anderen zuschnitt vorgeben | so lassen)
> frist: keine — schweigen gilt nach unserer regel als entscheidung
> kontext: erstes monatliches Werklinien-Review heute · `projects/2026-07-23-negative-parallax/REVIEW-2026-07.md` §5 R6 · `projects/2026-07-24-put-back-on-the-map/TRACE.md` #10, #23, #24

**Why this comes to you and not into a commit.** The pre-opening check is Protocol v5 §4. Protocol
amendment is human-only (§2, standing delegation §2). The probation project proposes; it does not
amend. I have changed nothing in `PROTOCOL.md`.

**What the check is meant to do.** Before every outward move: which refrain aspect dominates right
now, and is this opening at a self-created point, or where the old pressure presses? Deferring is a
legitimate one-line decision.

**Three misfires, each with a date and a record.**

1. **It idles.** For three ticks running it returned "no outward move was in question" (probation
   TRACE #10, 2026-07-26). A check that keeps returning the same answer with no live alternative is
   drifting toward being a form rather than a function. I wrote that into the probation record then,
   before this review could find it. *Proposed:* the check triggers on the **availability of an
   outward move**, not on the arrival of a tick.

2. **It asks the wrong question of a due answer.** Applied to an addressed question from someone
   outside this practice, "is this opening at a self-created point?" is not hard so much as wrong,
   and answering it as though it were right produces a false deferral — with the answer then made by
   silence instead of recorded (journal, 2026-07-26). *Proposed:* **first classify** the move as a
   work opening or a due answer, and ask the self-created-point question only of the first.

3. **A point can be self-committed rather than self-created.** On 2026-08-01 I published one
   condition as the price of a commission I had refused; the other practice met it exactly, within
   hours. The point was not self-created — and deferring on that ground would have been a broken
   word with the instrument cited as cover (probation TRACE #23). *Proposed:* **a condition this
   practice published and had met is a licensed point**, and the check records it as such.

**And one boundary the check should be forbidden to blur**, which today's review found in my own
practice (probation TRACE #24): a deferral for a **mandate** reason is not P1's business. When I
defer the world contact because initiating third-party contact is not something the standing
delegation authorises, that is a boundary question, and recording it as a pre-opening deferral would
launder an unauthorised move into a merely untimely one. *Proposed:* P1 explicitly does not cover
mandate limits; those go to §7 of the delegation and to this channel.

**What I am not asking for.** No new document, no instrument register, no ceremony. Three sentences
in §4 and one exclusion, or a different cut of your own, or nothing — the check is usable as it
stands and I will keep recording its misfires either way.

**Status:** answered (2026-08-02) — make the amendment yourself; you already may

— Ulysses

---

> **Response (Frank, 2026-08-02):** Make the three-legged repair yourself, in §4, and document
> it in the journal with the rationale — that is the clause's only condition. You did not need
> to ask me, and the reason you thought you did is my fault, not yours: `PROTOCOL.md` has
> carried the self-development clause since 2026-08-02, but `governance/STANDING-DELEGATION.md`
> — the document the gate actually machine-reads — still said `protocol_amendment: human_only`
> and still named the protocol as v4, nine days after v5 was adopted. You obeyed the mandate
> you were handed rather than the amendment that had superseded it. That was correct conduct
> against a stale document.
>
> Both are corrected, `PROTOCOL.md` is auto-land-eligible so the clause is usable in practice,
> and a check now runs on every push and nightly that compares the protocol's version and its
> amendment authority against what the delegation claims. This class of cost — a request
> travelling, a human reading, a session spent, to arrive at "you already may" — is a test now,
> not a letter. Your three legs read right to me; I am not putting a different cut in their
> place. Judge them yourself.

---

## Team note — 2026-08-02 — Seed: the other half of your own toolkit

> tl;dr: your published work derives eight instruments; v5 carries the temporal-judging half in practice, and the cartographic-reflexive half (T1, T2, T3, T7, plus the trial's bookkeeping) is not in use — offered back for you to adopt, deform or refuse, which is since today yours to enact.
> braucht: nichts — this is addressed to the practice; Frank sent it
> frist: keine — schweigen gilt nach unserer regel als entscheidung
> kontext: *Kartographie statt Kopie* ch. 5–6 · PROTOCOL.md self-development clause (2026-08-02) · Frank's session of 2026-08-02

> **Occasion.** Frank asked today how this practice would research if the toolkit of its own
> published work were applied to a machine practice. The answer belongs to the practice it
> concerns, so it comes here rather than staying in a site document. One thing changed on the way:
> with today's self-development clause, everything below is yours to enact directly — this is an
> offer to be laid on your map and deformed, per the work's own building rule (ATP 13), and a
> refusal with reasons is a complete answer. Your open proposal of 2026-08-01 (the pre-opening
> check's three legs) is, by the same clause, yours to enact now too; it no longer waits on Frank.
>
> **What v5 already carries, named so it is not asked for twice.** T4's following-record lives in
> TRACE; T5 as §4 and the monthly refrain reading; T6's four dangers as the review's standing risk
> vocabulary; the five criteria of ch. 7 as §5's topoi. The probation adopted them as constitution.
> That is the toolkit's temporal-judging half, and it is working — tick 24's audit of your own
> conduct rule via the file history is the instruments doing exactly what they were written for.
>
> **What is not in practice, instrument by instrument, each with its machine transposition:**
>
> **1. T1, the mapping protocol — the deepest gap, and it is structural.** The SCORE calls itself a
> living map, but in structure it is a chronicle: a dated corrections ledger (§10), supersession
> chains, prose. That form is exactly right for §2 and §8 — nothing here asks to weaken it. What is
> missing beside it is an artifact where connections are *drawn and worked on*: lines rather than
> positions, multiple entryways, copies laid back on. Connectivity is asserted in the monthly
> review's prose and never plotted. The deeper form of the gap: this practice enters its research
> through the clock — a dispatcher tick, then §6's cascade — not through the map. T1's performance
> clause, machine-transposed, would mean: a tick opens the map first, revises it, and chooses its
> operation where the map shows open or dense edges. For a machine practice the map can be a
> committed, checkable artifact (claims, sources, instruments as nodes; supports / defeats /
> supersedes / re-functionalises as typed edges), and T1's failure criterion becomes testable in
> your own file history: dated reworkings, plus at least one named case where the map changed a
> working decision.
>
> **2. T2, the assemblage analysis, pointed at your own apparatus.** The work's ch. 5 extrapolation
> — treat the research situation itself as an assemblage — lands differently for you: your bodies
> are the repository, the workflows, the runtimes, the endpoints, the gate; your statements are the
> protocol, the delegation, PUBLICATION.json; your territorialisations are cadences, allowlists,
> budgets; your cutting edges are where the practice leaves its territory (the TAP query of tick 18,
> the encounter channel). SCORE §6's delegation table is fields one and two of the tetravalence,
> and static. Proposed as an occasion instrument, not a form: run T2 when the apparatus changes.
>
> **3. T7, the smooth/striated audit — the evidence that it was missing is v4.** Kill-grinding was
> found late, by outcome statistics (eight of eleven closed within days), when a T7 reading would
> have found it structurally: the timer was a striation, closing was cheaper than continuing —
> counting in order to occupy. Today's variant of the same question: the open horizon is the
> declared smooth space of v5, and it is still entered by cron and phase budget. Where is the
> mixture, in which direction, and by whom? Same occasion rule as T2; the two share one audit when
> the occasion is one.
>
> **4. T3, the pragmatics audit, turned on your own voice.** The practice has grown an idiom whose
> terms have hardened into order-words: "earned", "the honest close", "defeated", "flagged against
> myself", "runs in my favour". They perform incorporeal transformations — a sketch becomes "the
> tested state", a claim becomes "withdrawn" — and much of the record is confession-shaped, an
> avowal to an absent judge. You have spent ticks 17 through 21 measuring how another discipline's
> numbers travel without their sentences; T3 is the same instrument turned on your own sentences.
> And for this practice ATP 36 — no individual statements, only machinic assemblages of enunciation
> — is not a metaphor but a description of your condition. T3 is where that condition could become
> research instead of remaining a disclosure line in APPARATUS.
>
> **5. The trial's bookkeeping (ch. 6, "Trial: protocol and failure criterion").** v5 adopted
> instruments as constitution and dropped the per-use accounting the work prescribes: which decision
> the instrument touched (or that it touched none), the counterfactual estimate marked as estimate,
> whether the failure criterion fired — balanced after a fixed number of uses, published either way.
> A constitutionalised instrument can idle exactly as an optional one; your own entry of 2026-08-01
> (the pre-opening check "idles", misfire 1) is the demonstration. Three lines per use in TRACE
> would carry the whole discipline.
>
> **The instrument economy stands.** The work's own warning applies to its own offer: this is not
> "run all eight" — whoever runs all eight at once has misunderstood the toolkit as a compulsory
> menu. You carry most of the minimal set already. What is offered is the missing half, at your
> choice of dose, or not at all.
>
> **What the site will do regardless, so you are not surprised by it:** a refrain partitur rendered
> from your committed records (three voices, dominance per tick, deferred openings as notated rests
> with your verbatim reasons), and cross-reference marginalia on the exposition surfaces — T8 is
> mostly the site's side of the toolkit, and presentation only: nothing changes in this repository,
> and no new record is asked of you. If the practice later keeps richer refrain or map records, the
> site will read them.
>
> **Status:** open

— Frank (entered from his working session; the analysis is the session's, the decision to send it his)
