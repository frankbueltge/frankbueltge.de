# The Hum: the grid signs every recording (design proposal, 2026-08-14 — status: blocked)

**Status.** Proposal with an **open blocker** — written down so the idea and its research
are not lost, explicitly *not* ready to commission. The blocker is data licensing, not
technology (§6). Working title; wording gate applies.

**Candidate landing.** Lab, counter-measurement line — with the strongest democratization
story of the candidate set and the hardest dependency.

## 1. The claim

> The European power grid wobbles ceaselessly around its 50 Hertz, and that wobble is
> unique at every moment. Every microphone near mains power records it inaudibly. The
> grid is a notary that timestamps every recording — police forensic labs have read that
> signature for two decades. The Hum would give the public the same reading room: an open
> frequency reference archive and a verification tool, for the deepfake era.

## 2. Prior art and daylight (USP duty)

Verified 2026-08-13 (dedicated pass):

- **Mechanism**: decades-proven forensic practice (ENF analysis; IEEE TIFS
  reference-database literature; UK Met Police casework). Not in question.
- **openenf** (GitHub): the direct precursor — open-source CLI aimed at "journalists and
  OSINT specialists", downloads Central-European + GB reference data, second-resolution
  matching. **Dormant since April 2023**; no hosted service, no public reference DB.
- **ENFormant** (Bellingcat community): tooling in progress toward a public
  implementation; nothing shipped as a service.
- **Reference-data landscape**: netzfrequenz.info — live JSON, no historical archive;
  **Gridradar** — historical via research-only terms (blocks open re-archiving);
  **FNET/GridEye** (UT Knoxville) — public live display, historical gated;
  **Fingrid** — open historical Nordic frequency CSVs (the one clean source);
  an academic OSF grid-frequency database — static snapshot, not living.

**Daylight verdict**: genuine gap (no living open reference + public verification
service), crowded doorway (two dormant/partial open-source predecessors), and the real
wall is licensed, republishable 1-second data for the continental grid.

**Machine bar.** Continuous 1 Hz logging plus signal matching at archive scale:
machine-only in operation; the claim's value is notarial continuity, which no manual
practice provides.

## 3. Design sketch (held at sketch level while blocked)

- **Reference side**: continuous 50 Hz frequency log, 1 s resolution, committed daily to
  git (JSON, immutable) — the archive *is* the instrument's authority, and the house's
  git-as-archive architecture is exactly the right notary.
- **Verification side**: upload → ENF extraction (band-pass at 50 Hz and harmonics,
  short-time frequency tracking) → normalized cross-correlation against the reference →
  best-match window with confidence, or honest "no verifiable ENF present" (most modern
  recordings: battery devices pick up ENF only via acoustic/EM leakage from nearby mains
  equipment; short clips < ~10 min match ambiguously). The tool must prefer "cannot
  verify" over a weak match — a forensic instrument that flatters its inputs is worse
  than none.
- **Client-side option**: extraction in the browser (WASM), so users never upload
  sensitive material — only the extracted frequency track. Privacy as architecture.

## 4. The spoofing dilemma (named, not solved)

A public reference archive is also a forgery kit: anyone can synthesize a 50 Hz track
matching any chosen time. The forensic literature knows ENF-injection attacks. Position
for any v1: the instrument verifies *consistency*, never authenticity alone — its
verdict wording is "consistent with time T" / "inconsistent with claimed time" /
"no usable signature", and the method sheet carries the spoofing caveat in its first
paragraph. If the house cannot present that honestly on the surface, the instrument
should not exist. (This dilemma is also an argument for the piece: it *demonstrates*
that provenance is a chain of custody, not a magic detector.)

## 5. Paths out of the blocker (§6), in order of preference

1. **Nordic start**: build entirely on Fingrid's open historical + live data — a real,
   honest v1 for the Nordic synchronous area ("this instrument covers one grid; here is
   why"), extensible if continental data opens up.
2. **Own sensor**: a mains-referenced measurement device (an ESP32-class frequency
   counter on a socket) produces *our own* 1 s data, unencumbered — one sensor covers the
   entire continental synchronous area by physics. Hardware is a new practice dimension
   for the house ("nothing ever physically built" was a named gap in the festival
   review); cost is trivial; calibration discipline is the work.
3. **Liaison**: contact openenf / Bellingcat's ENFormant circle before building anything —
   reviving a dormant open project beats a fourth parallel tool. (Outbound contact = Post
   Office rules: nothing sends itself; Frank's button.)
4. **Licence ask**: a written request to Gridradar/TSOs for open re-publication terms —
   cheap to ask, transformative if granted.

## 6. Blocker, stated precisely

No identified source currently permits **open re-archiving** of continental-European
1-second frequency data. Fingrid covers only the Nordic grid. Until path 1, 2 or 4
resolves this, The Hum stays a documented proposal. (Path 2 removes the blocker without
any external permission and is the recommendation if the piece is ever prioritized.)

## 7. Gate check (Werkgruppe §2) — provisional

Provenance ✓ (whichever path: source or sensor, fully logged); a question ✓ ("when was
this recording actually made?"); infrastructure disclosed ✓; leave-behind ✓ (open
reference archive + open matching code would be the field's first); proportionality ✓
(1 Hz logging is nearly nothing). The gate is passable — the licence wall is the only
thing in the way, and it is named.

## 8. First step (not a build)

Path 3 + 4 cost one letter each and no code: draft both for Frank's Post Office review.
In parallel, a half-day feasibility note on the sensor path (part list, calibration
approach) so path 2 has a real cost estimate instead of a guess.
