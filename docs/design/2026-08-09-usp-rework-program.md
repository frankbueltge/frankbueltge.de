# The USP rework program — build out, never archive

<<<<<<< HEAD
**Status: IN FORCE, decided by Frank 2026-08-09** (his instruction, wording private: do not
archive the experiments — build them out until real added value and genuine distinguishing
features exist). It answers the USP audit (`docs/audits/2026-08-09-usp-audit.md`, merged
#472), which found: of 16 experiments, 1 draft-UNIQUE, 6 with (mostly thin) added value,
9 redundant against named, linked neighbors.
=======
**Status: IN FORCE, decided by Frank 2026-08-09 (wording private):** not archiving, but
building out until real added value and genuine distinguishing features exist —
the answer to the USP audit (`docs/audits/2026-08-09-usp-audit.md`, merged #472), which
found: of 16 holdings, 1 draft-UNIQUE, 6 with (mostly thin) added value, 9 redundant
against named, linked neighbors.
>>>>>>> 7d8fcf90 (redaction: the record paraphrases Frank instead of quoting him — and the instrument index stops lying about what is built)

The audit's two cross-cutting findings drive the program's shape:

1. **The form is usually ours; the finding usually is not.** Almost every rework direction
   says: stop competing on the finding (OWID, the Fed, EDGI, GFW win that), make the
   apparatus the explicit claim — the daily ritual, the committed register, the
   deterministic pipeline, the control group.
2. **No experiment cites its neighbors.** Several pages read as unaware of prior art —
   against the house's own checkability ethic, and the cheapest fix available.

## The phases

**Phase 0 — honesty (one pass, all 16, immediately).** Every page gains a *nearest
neighbors* section citing the strongest prior art the audit found, with links, and one
sentence naming this experiment's daylight from them. Overclaims are corrected in the same
pass (Attention drops "provenance applied to the future"; Policy cites Deep Sky; Patterns
cites Vigen by name). Executed by a one-time cloud agent as a PR — public wording, so the
PR waits for review rather than self-merging.

**Phase 1 — the USP is already in the data (directed sessions, days).** Builds that need
computation or presentation on material the pipelines already commit.

**Phase 2 — the USP needs new material (directed sessions, weeks).** Builds that need new
data sources or joins.

**Checkpoint: the reading of 2026-09-05.** By then every experiment shows either its USP live
on the page, or a dated build plan in this document — nothing stands unpositioned.

*(Route note, 2026-08-15: `/holdings` is now `/experiments`. Paths written `/holdings` in the
dated Landed entries below are left as they were — they record what the route was called when
the work landed, and the old path 301s.)*

## Where the program stands — read 2026-08-15, three weeks before the checkpoint

Measured against the repo, not against memory (row-by-row evidence gathered 2026-08-15):

| | Count | Rows |
|---|---|---|
| **USP live on the page** | 5 | #1 Consensus · #2 Iceberg · #6 Protocol · #10 Headroom · #15 Patterns |
| **Partial** — prior art cited, the build itself open | 7 | #4 Attention · #7 Policy · #8 Editorial Deadline · #11 Round Numbers · #12 Delve · #13 Bycatch · #14 Correction |
| **Untouched** | 3 | #3 Society · #5 Observatory (by design, its own session) · #9 Ghost Fleet |
| **In build** | 1 | #16 Watchtower (this session, 2026-08-15) |

**The finding this reading produced: the program stalled on 2026-08-09.** All five live USPs
landed on the day the program was written. In the six days since, exactly two things moved —
Patterns' null-distribution histogram filled with real data (2026-08-15, the placeholder is
gone), and Editorial Deadline received a large build that **is not the one this tracker
describes** (see #8 below). Everything else stands where 2026-08-09 left it. Three weeks
remain. Nothing about that is fatal — Phase 0 did the honesty work everywhere, so no page is
currently overclaiming — but "partial" here means *the neighbours are cited and the daylight
is still only asserted*, which is precisely the state the audit called out.

Three corrections this reading forced on the table below:

1. **#16 Watchtower's build premise was wrong.** The row said "derive the series from the
   already-committed daily orbital snapshots" — but `src/data/ueberflug/satellites.json` is a
   single file the nightly job overwrites; there is no directory of snapshots. The row was
   written as if there were. It is buildable anyway, from two materials nobody had read: the
   **git history** of that one file (56 committed observations — git is the archive, which is
   this house's own premise), and the **launch year already inside every satellite's
   international designator**, which turns today's snapshot into a multi-year cohort curve
   without any new pipeline at all.
2. **#8 Editorial Deadline diverged.** The tracker asked for an EU/international watchlist;
   what was built on 2026-08-14/15 is the "world chamber" over GDELT's Global Difference Graph
   (`docs/superpowers/specs/2026-08-14-editorial-deadline-world-chamber.md`), and the work was
   reclassified `tier: 'instrument'`. `pipelines/redaction/src/redaction/watchlist.py` has not
   changed since 2026-06-25. The divergence is not a fault — the world chamber is the stronger
   instrument, and **the audit already recorded it** (scoreboard row 8, sealed 2026-08-14).
   Only this tracker row was left describing work nobody is doing, and a tracker that does
   that is decoration.
3. **#13 Bycatch cites the wrong neighbours.** The row named Hanson/Marino/SPARC; the page
   cites Stop Tracking Science and those three names appear nowhere. The apparatus *is* the
   headline claim, so half the row is done — the citation half is not.

**The audit is ahead of this tracker; the registry is ahead of both.** The audit has kept
itself current — it now runs to **17 sections**: The Balance was added on 2026-08-14 with a
launch-day prior-art pass (verdict **UNIQUE as a living instrument**), and #8's scoreboard row
already records the world chamber. So the drift is not in the audit, it is here: **this
document still has sixteen build rows and no row for The Balance.** A work with a verdict and
no build lane is exactly what the coordination table exists to prevent.

`src/data/werke.ts` meanwhile holds 21 entries and carries a `tier` field (`project` /
`instrument` / `experiment` / `studie`) that postdates this document. Four registry entries sit
outside the audit's seventeen — `on-record`, `field`, `studio`, `atelier` — and `n-1` (live
since 2026-08-15) is a practice mirror not in `werke.ts` at all. The USP obligation is
test-enforced for `/experiments`, so nothing here is unguarded; the gap is bookkeeping, and
bookkeeping is what a checkpoint reads.

## Per experiment: target USP and build

| # | Experiment | Target USP (one line) | Build | Phase |
|---|---|---|---|---|
| 1 | The Consensus | The only instrument that classifies **why** outlets converge — chain syndication vs. wire vs. scattered, TLD share — daily, in public | Expose the syndication-structure classification (the pipeline's classifier already labels wire/chain) as the page's analytic layer + archive dimension | 1 |
| 2 | Iceberg Theory | The standing register no paper offers: fixed non-selected topics, committed daily, never retconned | Cite INFOGAP/Omnipedia/Manypedia; add a register-integrity panel (days unbroken, topic set frozen since, diffs on record) | 1 |
| 3 | The Society | Already draft-UNIQUE: Minsky's own agents, deterministic, browser-executable, section-cited | Verification pass in HCI/cog-sci archives (SIGCHI/AIES, 1990s–2000s pedagogical sims) before UNIQUE is treated as settled; keep building | 1 |
| 4 | Machine Attention | The **calibration scorecard of warning institutions** — Metaculus-style resolution applied to GDACS/NOAA themselves | Make the materialized/unmatched scorecard with lead times the headline; drop the notarization overclaim (OpenTimestamps is prior art) | 1 |
| 5 | Observatory | Not this repo's call — the audit section and the TED×GDELT news-shadow candidate (`state-before-interface` docs, 2026-08-09) are handed over; reframe from "watches AI procurement" (Tussell/TI-EU/JRC do) to "autonomous, hash-verifiable **investigation** pipeline" | Its own session decides | — |
| 6 | The Protocol | The deterministic bureaucratic-literary device — an art piece about administrative language, not a data product | Reframe copy: the no-LLM, test-locked template and "Resolution: adjourned" ARE the claim; cite OWID as what this deliberately is not | 0/1 |
| 7 | The Policy | An insurance instrument on genuinely under-covered market signals | Either move to cat-bond spread/ROL data (Swiss Re index, Artemis) — data-access check first — or make the legal-document conceit the explicit claim; cite Deep Sky either way | 2 |
| 8 | Editorial Deadline | The non-US register: machine-only change-tracking of EU/international institutions EDGI's US-federal focus never covers | **Superseded 2026-08-14/15 — see the reading above.** What was built is the "world chamber" over GDELT's Global Difference Graph (spec `2026-08-14-editorial-deadline-world-chamber.md`), and the work is now `tier: 'instrument'`. The watchlist itself is unchanged since 2026-06-25. Still owed from this row: the no-human-curation epistemics stated as deliberate (half-done, `RedactionPage.astro`) | 2 |
| 9 | The Ghost Fleet | From re-narration to compound finding: GFW dark-vessel events **cross-referenced** with MPA boundaries, sanctions lists, flag-state records — join logic shown | New joins on public data; the audit's "strongest rework-or-remove candidate" becomes the strongest build | 2 |
| 10 | Headroom | The breakeven-PUE against the physical floor — the impossible-zone arithmetic nobody else runs | Make the derivation the entire spine; region granularity later | 1 |
| 11 | Round Numbers | The false-positive-rate-vs-n curve as a reusable public artifact, run against corpora nobody has tested | Cite the literature (Mebane, Deckert, PLOS One); switch the daily corpus from picked-over territory to untested contemporary series | 2 |
| 12 | Delve / Tell | **The Goodhart tracker: are the tell-words now declining as authors dodge them?** The arms-race story no one has published | Extend the pipeline: same corpus, trend split at the backlash, decline curve per marker word; cite Kobak et al. as the settled baseline this builds on | 2 |
| 13 | Bycatch | The standing instrument: recurring cadence, paired diamond-OA control, dual vantage — the apparatus no study has | Cite Hanson/Marino/SPARC; make the apparatus the headline claim | 0/1 |
| 14 | The Correction | What a Fed tool structurally cannot say: the **decisions** made on numbers later erased | Consequences layer — rate decisions, elections, hiring data dated against later revisions; cite the SF Fed tool as the neutral instrument this deliberately is not | 2 |
| 15 | Patterns | The null-distribution machine: thousands of shuffles, a real false-discovery rate, on a self-referential archive — the rigor Vigen's joke lacks | Foreground the permutation distribution; cite Vigen by name as the piece this answers | 1 |
| 17 | The Balance | *(row added 2026-08-15; audited 2026-08-14, verdict **UNIQUE as a living instrument** — the only UNIQUE-outright verdict in the register)* Self-image against foreign image as a **standing** instrument: daily, archived, with a bootstrap CI — where GDELT's own API gives tone on a 3-month rolling window and the mood dashboards keep no archive at all | To be written by whoever claims the lane. A UNIQUE verdict is the one case where the build is not "find the daylight" but **"keep the daylight"** — the neighbours close this gap by adding an archive, so the standing-register property is the thing to defend and make visible | — |
| 16 | Watchtower | The **densification of the gaze**: how the active EO fleet grows and who owns the new arrivals — no neighbor tracks it (the audit's best rework direction of all 16). ~~commercial vs. military density over a location~~ — **the military half is not a claim the catalogue can carry** (classified satellites are absent; a military count is a floor, and 2024/2025 read zero) | ~~Derive the series from the already-committed daily orbital snapshots~~ — **there are none; the nightly job overwrites one file** (corrected 2026-08-15). Built instead from (a) the **git history** of that file — 56 committed observations since 2026-06-11, recovered by `scripts/ueberflug_densification.py`, the standing register; (b) the **launch year in each international designator**, which makes today's snapshot a 2005–2026 cohort curve with no new pipeline. SatFleetLive/SpyMeSat already named on the page | 1 (was 2 — no new material needed) |

## Rules that govern the builds

- Every build passes the house's existing discipline: committed data, validated palettes,
  method sheets updated, no fabricated findings — and the new USP claim is itself
  web-checked before it goes on a page (the USP obligation applies to the reworks too).
- Phase order is priority order, but any directed session may pull a Phase-2 item forward
  when Frank asks for it.
- This document is the tracker: each build lands with a dated line here.

## Work claims — read before building, write before building

**The coordination rule (Frank, 2026-08-09, wording private — sessions must coordinate with
each other):** more than one
session works this program in parallel. Before any session builds on an experiment, it
reads this table and writes its claim here (one commit, pushed immediately — the same
race-guard idea the practices use). A claimed lane is not touched by anyone else; an
unclaimed lane is free. Release a lane by dating the Landed line.

| Lane | Claimed by | Since | State |
|---|---|---|---|
| **#4 Machine Attention** + **#5 Observatory** | ~~the parallel session~~ → **this session (afternoon 2026-08-09)** | 2026-08-09 | **Landed 2026-08-09 (night session):** every `feat/attention-*` branch merged, no open PR in `machine-attention`, last commit there 15 h old — lane released and re-claimed. **Phase 0 for #4 is now done** (neighbors section + the overclaim dropped, see Landed) — the lane is free again. **#5 Observatory stays untouched by this repo** per the audit: its own session decides. Phase 1 for #4 (the calibration scorecard as the page's headline figure) is unclaimed and open. Practice-side work continues in the **`machine-attention` repo**: Dark Ocean's E-window runs to 2026-08-22/23, review 2026-08-24. |
| **#1 Consensus** (structure layer) · **#2 Iceberg** (integrity panel) · **#10 Headroom** (breakeven spine) · **#15 Patterns** (null-distribution) + the post-Phase-0 page-wiring pass | this session (night 2026-08-09) | 2026-08-09 | libs landing; page wiring after Phase 0 merges |
| Phase 0 (citations, all pages EXCEPT attention/observatory) | one-time cloud agent → PR `usp-phase0/2026-08-09` | 2026-08-09 | running; PR reviewed before merge |
| **The parked package**: knowledge graph (substrate) · neighbor-graph visualization · CLAUDE.md diet (`.claude/rules/`) | — released 2026-08-09 | 2026-08-09 | **done**, see Landed; the lane is free again. One standing consequence for everyone: changing `werke.ts`, `docs/decision-log.md`, the audit or the post ledger now requires `npm run graph:build` in the same commit, or `src/lib/graph/graph.test.ts` goes red (`.claude/rules/knowledge-graph.md`) |
| **#1 Consensus** (longitudinal baseline on the G1 BigQuery path) | this session (afternoon 2026-08-09) | 2026-08-09 | **landed** — lane released |
| **The ecology lane of the graph** (Frank, 2026-08-09 afternoon, all four options) | — released 2026-08-09 | 2026-08-09 | **done**, see Landed. Two things left for others: (1) the **attention export** is specified and consumed — the producing repo's session ships `src/data/attention/export.json` when it wants the lane live (`docs/design/2026-08-09-attention-export-contract.md`); (2) the ecology audit covers 4 of 59 works and **names its remainder** — next batches are free to claim |
| **The ecology audit, made public on `/works`** (Frank, 2026-08-09 evening, approved) | — released 2026-08-09 | 2026-08-09 | **done**, see Landed |
| **Graph rebuild without friction** (Frank, 2026-08-09 evening, wording private — asked whether the friction could be removed; variant A chosen): a pre-commit hook plus a Claude hook rebuild the graph automatically | this session (evening 2026-08-09), branch `feat/graph-hooks` | 2026-08-09 | building — touches `.githooks/`, `.claude/settings.json`, `.gitignore`, `package.json` |
| **#16 Watchtower** (densification: git-derived register + launch-year cohort curve) | this session (afternoon 2026-08-15) | 2026-08-15 | building — touches `scripts/ueberflug_densification.py`, `src/lib/ueberflug/densification.ts`, `src/data/ueberflug/densification.json`, `UeberflugStudiePage.astro` |
| #3 Society · #6 Protocol · #7 Policy · #8 Editorial Deadline · #9 Ghost Fleet · #11 Round Numbers · #12 Delve · #13 Bycatch · #14 Correction | **unclaimed** | — | free — claim before building |
| **#17 The Balance** | **unclaimed** | — | audited 2026-08-14 (**UNIQUE as a living instrument**), but has no build row in the table above — the tracker never grew to seventeen. Whoever claims it writes the row first |

## Parked (Frank, 2026-08-09 morning — BUILT the same afternoon, see Landed)

- **The neighbor graph, visualized.** The audit's neighbor relations are already a graph
  in prose form (experiment → nearest neighbor → daylight); drawing it — every work's
  position in the field, daylight as a visible edge — is itself a USP surface no neighbor
  has. Depends on the knowledge-graph substrate below.
- **A knowledge graph as instrument, not experiment.** Derived (never typed) from the
  committed records: works, decisions (decision-log rows), practices, sources, receivers,
  audit neighbors. Serves sessions as a query layer at start, and the site as the
  visualization substrate above. Candidate to replace the memory plugin's role for this
  project (a committed, versioned graph is checkable and human-readable; the plugin's
  local database is neither).
- **CLAUDE.md diet.** The project CLAUDE.md exceeds the documented 200-line adherence
  guideline; move path-specific rules into `.claude/rules/` with `paths:` frontmatter so
  they load only when matching files are touched. Same session as the graph.

## Landed

- 2026-08-15 — **#16 Watchtower: the densification of the gaze, built out of material that
  was already lying there.** The audit called this the strongest rework direction of all
  sixteen, and the row had been sitting in Phase 2 because it looked like it needed a new
  pipeline. It did not — the row's premise was simply wrong (see the 2026-08-15 reading), and
  once that was checked, two materials turned up in data the site has been committing since
  June:
  **(a) The launch year was inside the data all along.** Every satellite carries its
  international designator (`2014-029A`), so the *current* snapshot is already a cohort curve:
  how many of today's active Earth-observation satellites went up in each year, and who owns
  them. The finding is sharp — the active fleet's yearly cohorts run 11 (2022) → 29 → 37 → 50
  (2025), and the commercial share of those arrivals goes from **1 of 11 to 33 of 50**. The
  gaze densifies, and it densifies commercially.
  **(b) Git was the time series.** `src/data/ueberflug/satellites.json` is overwritten nightly,
  which is why the row assumed no history existed; but every overwrite is a commit, so the
  archive was already there — 56 observations since 2026-06-11, recovered by
  `scripts/ueberflug_densification.py` into `src/data/ueberflug/densification.json`. The house's
  own premise (*git is the archive*) applied to a file nobody had read backwards.
  **What the build refused to claim.** The row promised *commercial vs. military* density.
  The catalogue cannot carry the military half: classified satellites are absent, so 2024 and
  2025 read **zero** military — a fact about the catalogue, not the sky. The page states that
  the military column is a floor and drops the ratio claim rather than presenting a hole as a
  finding. It also states that the curve is the *active* fleet by launch year, not the launch
  record, so deorbited satellites make early cohorts look thinner than they were. And the
  56-day register is reported as **flat** — sixty-five days is far too short a lever for a
  densification claim, which is exactly why the standing register is the instrument and the
  cohort curve is the finding.
  **The one judgement in the build was put to Frank and decided (2026-08-15): the midpoint.**
  How satellites GCAT leaves unclassified enter the commercial share is not bookkeeping — the
  unclassified rate is above 50 % in some 2005–2011 cohorts and **zero from 2023 on**, so the
  rule changes the shape of the curve. Counting them as non-commercial would have made the old
  cohorts look maximally state-owned and so exaggerated the very flip the page claims; dropping
  them would have rested the early years on a handful of satellites. The midpoint claims
  nothing about them either way, and the figure **draws the band it sits in** — a dashed line
  spanning what the unclassified could still make the share — so the width of the claim is
  visible rather than asserted. Cohorts GCAT classified completely carry no line at all, which
  is every cohort from 2023 on, so the headline numbers never depended on the rule.
  Guarded by `src/lib/ueberflug/densification.test.ts` (11 tests), including one that forbids
  the page from stating a share its own band does not contain, and one that checks the failed
  night of 2026-06-12 is still on the record instead of dropped.
- 2026-08-15 — **the tracker's own guards, repaired.** Two tests in the house were failing at
  random inside the full suite and passing alone — the worst state a gate can be in, because it
  teaches everyone to re-run until green. Both were timeouts at the 5 s default, not real
  defects: `consensus/baseline.test.ts` made ~10,000 `expect()` calls walking 2,496 archive days
  (now one assertion per rule over the whole archive — same coverage, and a failure now names
  every offending day instead of the first), and `society/engine.test.ts` runs simulations of up
  to 12,000 ticks (cost declared with an explicit 60 s timeout rather than hidden by shortening
  the simulations). Full suite: 2,721 tests, 136 files, green.
- 2026-08-09 (afternoon) — **#4 Machine Attention: the Phase-0 gap closed**, the last of
  the sixteen still without neighbors. The method sheet now names OpenTimestamps, Proof of
  Existence/OriginStamp, GDACS+ReliefWeb's own timestamped bulletins, Metaculus/Good
  Judgment and the HDX archives, and states the daylight narrowly: forecast verification
  turned around from crowds onto the *institutions*, with a measured verdict and lead time
  per closed warning. `werke.ts` drops **"provenance applied to the future"** — it
  overclaims against a decade-old commodity — and says outright that hashing is the
  bookkeeping, not the claim. Graph rebuilt in the same commit per the standing rule.
  The Phase-1 build (making the calibration scorecard the page's headline figure) stays
  open.
- 2026-08-09 (afternoon) — **practice side, `machine-attention` repo:** Dark Ocean's
  E-experiment criteria committed before the window (stage 4), extended by criteria group
  N after a parallel session showed A–E measured the demonstration and not the act; the
  continuity probe built, tested and live-verified so the window opens on time; and the
  registry bug the machine's own discovery pass found — GDACS's primary country dropped
  from six tropical cyclones, Vietnam never once in the registry — fixed, repaired as a
  `CORRECTED` event naming the cause as ours, and guarded nightly.
- 2026-08-09 — program decided and written; audit merged (#472); Phase 0 agent launched
  (PR pending review).
- 2026-08-09 — coordination table added at Frank's instruction; attention + observatory
  ceded to the parallel session.
- 2026-08-09 — #1 Consensus: `src/lib/consensus/structure.ts` + test — the archive
  aggregate behind the why-classification (46 classified days at first run: 43 chain,
  3 scattered). Page wiring pending Phase 0.
- 2026-08-09 — Phase 0 merged (#476): every in-repo experiment cites its nearest
  neighbors; attention skipped per the claims table; the platform's auto-appended
  AI-credit footer stripped from the PR body per the standing rule.
- 2026-08-09 — **the ecology audit becomes public on `/works`.** The verdicts stopped being a
  document only Frank and a session could read: every audited work now shows its nearest prior
  art, named and linked, on its own row of the register — and the head line states the ratio
  ("prior art checked for 3 of 59 works … a work without a note below is **unexamined, not
  cleared**"), because stamping 56 rows with a disclaimer would turn a catalogue into noise
  while stating it once cannot be skimmed past. No colour was added: the practice's hairline
  stays the row's only hue and a verdict is stated in words. Derived from the same graph, so
  the page cannot say anything the audit does not. Two things the build caught: the neighbour
  links had to leave the row's own link (a link inside a link is invalid HTML browsers take
  apart), and the first wording — "already done by" — was a false claim for an ADDED VALUE
  verdict, so it reads "nearest prior art" instead. `register-audit.test.ts` guards the seam
  the join runs on: rename a work's directory and the page would have quietly reported an
  examined work as unexamined.
- 2026-08-09 — **the ecology enters the graph** (Frank, afternoon, wording private — he noted
  that the research ecology's works were missing from the graph although they form a
  machine-run ecology of their own; all four proposed lanes chosen). **(a)** The practices'
  own **59 works** and the **6
  encounters** are now nodes: each work's `meta.json` is its source, the directory it lives in
  is the evidence of who made it, and the crossings carry who gave, who received and which work
  moved. 201 nodes / 183 edges, up from 123 / 95. Spellings are reconciled through the house's
  existing register (`normaliseVoice`) rather than a second alias table. **(b)** A **nightly
  rebuild** (`.github/workflows/graph.yml`) takes the residue so a session that forgets
  `graph:build` does not leave the artifact stale — a safety net, not a substitute; a PR still
  goes red. **(c)** The **attention export contract** is written and its consumer built and
  probed with a real file, without touching the `machine-attention` repo, whose lane is claimed:
  the day that session ships `src/data/attention/export.json`, the lane engages and CI stays
  green. **(d)** The USP obligation now reaches the ecology:
  `docs/audits/2026-08-09-ecology-usp-audit.md`, first batch of 4 chosen by a criterion the
  records supply (works already put in front of someone outside — two packets, two encounters),
  **55 named as unaudited** rather than silently cleared. **The finding that matters: the
  Calibration Certificate is REDUNDANT against Weber-Wulff et al. (2023), published in the
  journal of the very network its packet is addressed to.** The audit blocks that packet on a
  citation; sending remains Frank's, as always.
- 2026-08-09 — **the parked package, all three parts.**
  **(a) The knowledge graph as instrument** — `src/data/graph/graph.json`, committed and
  versioned, derived from four records (works register · the neighbour audit · the decision
  log · the post ledger) and never typed: 123 nodes, 95 edges, each carrying the verbatim
  string it was read out of. `src/lib/graph/graph.test.ts` holds every quote against its
  file, rebuilds the graph from today's sources and fails if the committed artifact
  disagrees, forbids receiver addresses in the file, and makes the **USP obligation
  mechanical** — no experiment reaches `/holdings` without a verdict, a named daylight and
  named prior art. Query layer for sessions: `npm run graph -- <term>` answers "what
  touches X?" with the source file behind every line.
  **(b) The neighbourhood figure** — `/holdings/neighbors`: sixteen experiments on one
  rail, their prior art inward on the same spoke, the daylight drawn as the distance
  between them (1 wide · 6 partial · 9 little). Palette `holdings-neighborhood` recorded
  and re-derived, the validator's absence stated rather than implied; register below the
  drawing carries every neighbour as a named link, page never scrolls sideways, geometry
  asserted in `field.test.ts` (it caught the longest title walking off the canvas). Its own
  prior art is named on the page — literature maps, patent landscaping, originality-as-
  distance, the README "Alternatives" genre — with the daylight stated.
  **(c) The CLAUDE.md diet** — 197 → 157 lines; the path-scoped rules
  (`.claude/rules/{dataviz-figures,experiments,pipelines-and-archive,knowledge-graph}.md`)
  carry the moved text verbatim and load only when matching files are touched. `.claude/`
  is gitignored except `rules/`.
- 2026-08-09 — Phase 1 wiring landed: **#1 Consensus** structure section (chain share
  across the classified archive, derived at build time) · **#2 Iceberg** integrity panel
  (44 committed revisions since 2026-06-14, git-derived dated snapshot + regeneration
  script) · **#15 Patterns** null distribution drawn (pipeline emits the 20-bin histogram
  from its next run; honest placeholder until the data carries it) · **#10 Headroom**
  subtitle reframed onto the breakeven-vs-floor arithmetic.
- 2026-08-09 (evening) — **#1 Consensus: the longitudinal baseline, and a correction to the
  figure that landed this afternoon.** First real use of the G1 BigQuery path
  (`2026-08-09-gcp-activation.md` §2 as the pattern): the nightly v2 measurement
  re-implemented in SQL over the whole GKG archive and committed once as
  `src/data/consensus/baseline.json` — 2,496 days, eight jobs, 482 GB billed (44 % of the
  monthly free tier, 0 €), query text and job trace committed beside the data
  (`pipelines/consensus/baseline.sql`). The page now answers "is that a lot?": today's echo
  as a percentile of seven years measured the same way, plus the per-year trend (median echo
  38.5 % in 2020 → 32.8 % in 2025 — the verbatim consensus is *falling*).
  Three findings the build produced, each of which changed a claim rather than decorating one:
  1. **Seven years, not ten.** The English GKG stream carries `PAGE_TITLE` only from
     2019-09-22 — measured against sample days back to 2015, which return zero title-bearing
     rows through 2019-06. A verbatim-title instrument has no deeper history than that.
  2. **GDELT's own archive has a 17-day hole** (2025-06-15 … 2025-07-01). Recorded in the
     baseline's `gaps`, never interpolated.
  3. **The afternoon's chain-share figure was backwards.** The page read "91 % of 47
     classified days were chain syndication" as a statement about the whole archive; 43 of
     those days were measured by the v1 API pool (<1,000 articles/day), where the day's
     widest sentence is routinely a tight wire push. Across 2,496 single-method days chain
     runs at **4 %** — between 3 % and 5 % in every year. `aggregateStructure` now aggregates
     **per method version** and exposes no archive-wide share to misread; the correction is
     stated on the page and in the method sheet, and the v1 days stay in the archive, kept
     apart. Guarded by `structure.test.ts` and `baseline.test.ts` (which recomputes every
     ratio from the file's own components), not by a comment.
  Also fixed, dated as classifier `c2-full-domain-set`: the nightly classified syndication on
  the **40-name masthead display list** rather than every domain of the phrase — on a day with
  200+ outlets the label came from an alphabetical fifth of them. Committed days keep the
  values they were measured with.
