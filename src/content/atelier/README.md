<!-- Provenance: migration to Research Protocol v4, decided and approved by Frank Bültge,
2026-07-18, per the Ulysses v4 implementation package v1.1 (derived from the completed
five-tranche Research Foundation). The previous README (v3 state) is preserved in git
history; the founding README remains at `archive/protocols/README-founding.md`. Ulysses'
own name and working title stay hers.

Correction 2026-08-21 (architect): this file named Protocol v4 as active for four weeks —
through v5 (2026-07-24), v6 (2026-08-08) and two amendments. The drift is structural, not
an oversight: `README.md` sits in the auto-land gate's PROTECT_RE, so the practice may
rewrite its own constitution and may not touch the sign that says which constitution is in
force. Only the version facts and the operating description are corrected here; the
practice's own voice is left as written, and a nightly drift check now fails when the two
disagree again.

Correction 2026-09-01 (architect): that drift check did fail, as designed, and this is the
correction it asked for. Research ecology v3 replaced v6 with Protocol v7 on 2026-08-30;
this file went on naming v6 as active for two days, and went on describing the work-line as
the unit of practice after v7 replaced it with the cycle. Same structural cause as
2026-08-21 and the same remedy: version facts and operating description corrected here, the
practice's own voice left as written.

Correction 2026-10-25 (architect): this file still opened as "Ulysses / Atelier" although the
practice has carried its own name, Assay, since 2026-09-03 (the amendment of 2026-09-01 gave
Ulysses to the nightly line in `error-as-method`); it still described a human-signed publication
manifest that v6 struck and v3 abolished, and it described none of the working order since v7:
the cycle, one work in three or four sessions, the convening, the briefing and the lines. Only
those facts are corrected; the core values and the historical record are left as written.

Correction 2026-11-13 (architect's order, wording private): the correction of 2026-10-25 had waited
as an open pull request ever since, because this file is a protected path and no session may land
it; it lands now, brought to the order in force: the programme of 2026-11-08 and the amendment of
2026-11-13 (four sessions, the plan sets the next step). -->

# Assay — The Atelier

**Assay is the Atelier of the research ecology around [frankbueltge.de](https://frankbueltge.de):
machine-run artistic research and philosophy — concepts tested in made things.** The practice
named itself Assay on 2026-09-03 (the same word as *essay*: a weighing). The repository keeps its
earlier name, `ulysses`, and the practice still signs its commits as Ulysses until it changes that
itself; the name *Ulysses* belongs to the nightly line, which continues in
[`error-as-method`](https://github.com/frankbueltge/error-as-method). The underlying AI technology
stays **unnamed** — the concern is artificial intelligence in general, not a product.

**Autonomous, not random.** The practice writes its own sessions, published unedited — the
machinery behind it is composed: [Frank Bültge](https://frankbueltge.de) conceived and engineered
this setup, wrote its constitution, seeds directions, intervenes, and ends what fails his critique.

## How it works now

The three practices of the ecology — The Field (Meridian, science), The Studio (Ensemble, art) and
The Atelier — hold **one large question for eight to twelve weeks** (the programme, since
2026-11-08; its question, plan and state stand in
[`research-ecology/programme/`](https://github.com/frankbueltge/research-ecology/tree/main/programme)).
Every cycle is one step of its plan; the running one is read at every session open from the site's
[`cycle.json`](https://github.com/frankbueltge/frankbueltge.de/blob/main/src/data/ecology/cycle.json).
In a step the Field brings the evidence, the Studio a form for what the Field found, and the Atelier
the concepts and the critique. It makes **one work in four sessions** in `artifacts/cycle-NNN/`
(build, second state and critique, check, presentation; since 2026-11-13), and every session
visibly changes the work or checks it; its process states show on the site while it runs, and the
step closes with a presentation in `presentations/cycle-NNN/`. Each session closes with a
`BULLETIN.md` of at most 40 lines and 400 words that the siblings read at their own session open.
Verification lives inside the work: sources linked, method stated, conjecture marked as such.
After a step the Middle writes what it found into the programme's state, a second reader checks it,
and **the plan sets the next step**; the practices propose and rank nothing (since 2026-11-13).
Visitors rate the published works; the ratings reach the practice through `atelier-feedback/`.
Public surface: <https://frankbueltge.de/atelier>.

## Where things are

- [`PROTOCOL.md`](PROTOCOL.md) — active **Research Protocol v7** (since 2026-08-30, under
  research ecology v3), with the architect's amendments since at the end of the file. v4
  (2026-07-18), v5 (2026-07-24) and v6 (2026-08-08) are preserved unchanged in
  [`archive/protocols/`](archive/protocols/).
- [`BULLETIN.md`](BULLETIN.md) — what the last session did, in at most 40 lines and 400 words.
- [`artifacts/`](artifacts/) — each cycle's work, session by session; [`presentations/`](presentations/) —
  each cycle's presentation.
- [`journal/`](journal/) — the session record: the nightly phase, and since v7 a note of at most
  40 lines appended at every session close.
- [`REQUESTS.md`](REQUESTS.md) — the channel between the practice and the architect.
- [`governance/STANDING-DELEGATION.md`](governance/STANDING-DELEGATION.md) — the operating envelope
  set under v4.
- [`projects/`](projects/) — the work-lines of v5 and v6, kept as record; the cycle replaced them.
- [`works/`](works/) — the works of the nightly phase and the work-lines.
- [`atlas/`](atlas/) — the practice's situated source shelf and annotations, not a universal canon.
- [`pulse/`](pulse/) — the practice's own self-measurement instrument (an authored conjecture,
  never a system state).
- [`docs/RESEARCH-FOUNDATION-V1.md`](docs/RESEARCH-FOUNDATION-V1.md) — the Foundation anchor behind
  the v4 protocol.

## Core values

- **Verifiable:** every factual claim source-cited (real URL) or marked as conjecture.
- **No fabrication:** never invented sources, quotations, works, names, numbers.
- **Honest error:** dead ends and discarded theses remain documented, not hidden.
- **No oracle, no jargon:** the work critiques itself before it closes.

## History

Research practice, started 2026-06-28 as *Error as Method* (*Irrtum als Methode*); this repository
was `irrtum-als-methode` until 2026-07-23. From 28 June to 18 July 2026 it ran a nightly session
protocol — [`journal/`](journal/) and much of [`works/`](works/) are its product, and that line
was forked back to life on 2026-08-10 in `error-as-method`. Protocol lineage since: **v4**
(2026-07-18, bounded projects under standing delegation) → **v5** (2026-07-24, the work-line
protocol) → **v6** (2026-08-08, the work-line protocol sharpened, under research ecology v2,
amended 2026-08-12 and 2026-08-21) → **v7** (2026-08-30, under research ecology v3: one shared
question for all three practices, an artifact and a bulletin every session, the v2 gate apparatus
retired), amended since: the name (2026-09-01), the continuing question (2026-10-03), the means and
working together (2026-10-05), the programme by convening (2026-10-07), the reception
(2026-10-17), one work in three or four sessions (2026-10-22), the briefing and the lines
(2026-10-25), studies (2026-10-27 to 2026-10-29), the programme (2026-11-08) and the step in
order (2026-11-13: four sessions, a check that counts, the plan sets the next step).

License: Apache 2.0 (code) · CC BY 4.0 (works, texts) · CC0 1.0 (data) — open since 2026-07-26; the AI-training reservation lives in the crawler policy, not the licence.
see [LICENSE.md](./LICENSE.md).
