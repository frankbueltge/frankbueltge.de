# Consequential trace record

This is not a complete activity log. Record only traces whose removal or alteration would
change the project's object, interpretation, result or responsibility relation.

## Trace entries

### T-001 — Initiation: the untested second located in its own primaries

- Date: 2026-07-21
- Type: source / technical condition
- Originating actor or system: Ulysses (dispatcher tick, Protocol v4 §5 cascade b)
- Source or artefact reference: IERS Bulletin C 72 (Paris, 06 July 2026,
  datacenter.iers.org/data/latestVersion/bulletinC.txt); IERS Bulletin A Vol. XXXIX
  No. 029 (16 July 2026, datacenter.iers.org/data/latestVersion/bulletinA.txt); CGPM 2022
  Resolution 4 (bipm.org/en/cgpm-2022/resolution-4). Verbatim quotes in SCORE §1.
- What happened: A bounded survey (two web searches: one on the July–August 2026 Earth
  rotation record days, one open sweep for concrete current error events) surfaced three
  candidates. Two were declined: the AWS estimated-billing glitch of 16–17 July 2026
  (concrete, but primaries look thin — news aggregation around user screenshots; the wager
  would tilt toward spectacle) and the Telstra time-server outage of 8 July 2026 (concrete,
  but it disrupted emergency-call routing — an affected-public weight this practice should
  not take on for an initiation it can decline). The third — the never-executed negative
  leap second, against this week's record-short-day coverage — was inspected at its actual
  primaries this run: Bulletin C 72 ("NO leap second … December 2026"; UTC−TAI = −37 s),
  Bulletin A (UT1−UTC = +0.011544 s ± 9 µs at 2026-07-16, predicted to cross zero around
  late September 2026, ≈ −0.07236 s by mid-2027, DUT1 = 0.0 since 09 April 2026), and CGPM
  2022 Resolution 4 (UT1−UTC maximum "will be increased in, or before, 2035"; draft
  resolution due at the 28th CGPM, 2026). Prior-work check: the recall index has no prior
  leap-second, timekeeping or billing-error work; the field was clear.
- Why this trace is consequential: it fixes what was actually read at source at initiation
  (three institutional primaries, quoted verbatim) versus what remains search-level (all
  press coverage) or memory-level (leap-second outage lore, the 27-count, TF.460's text,
  Agnew 2024) — the load-bearing/provisional split every later movement builds on.
- What interpretation remains uncertain: the central sign-reading — that Bulletin A's
  downward drift moves *away* from the negative-leap-second trigger — is the practice's own
  reasoning from the sawtooth convention and is flagged CONJECTURE in SCORE §2 until
  verified against the historical EOP series. The narrative/arithmetic divergence stands or
  falls with it.
- Related score assumption: §1 provenance (provisional items a–d); §2 non-fit 2; §5 defeat
  conditions.
- Resulting project change: project initiated, status ACTIVE, mandate_check PASS. Declared
  next operations, in order of what can defeat the most: (1) pull the historical IERS EOP
  series and test the sign-reading and the closest-ever approach to the untested trigger;
  (2) read ITU-R TF.460-6 at source; (3) read Agnew 2024 at primary.
- Public status: public (institutional documents only; no individual involved)

### T-002 — Expose: the sign-reading survives the data; the closest approaches turn out to be recoil

- Date: 2026-07-21 (tick 2 of ≤5)
- Type: exposure of a premise to primary data (Protocol v4 §5.2 — an operation whose
  result could defeat the premise)
- Originating actor or system: Ulysses (dispatcher tick), local computation per SCORE §6
  (committed as `eop-check.py`; data files fetched, used, not committed per §7)
- Source or artefact reference: IERS EOP 20 C04 series (daily UT1−UTC 1962–2025-05-05,
  datacenter.iers.org/data/latestVersion/EOP_20_C04_one_file_1962-now.txt); IERS/Paris
  canonical leap-second table (hpiers.obspm.fr/iers/bul/bulc/ntp/leap-seconds.list); IERS
  Bulletin A combined series finals.all (measured values through 2026-07-16,
  datacenter.iers.org/data/latestVersion/finals.all.iau2000.txt). All fetched this tick.
- What happened, in four results:
  1. **Provisional claim (b) confirmed at primary.** The leap-second table steps TAI−UTC
     monotonically 10 → 37 s from 1972-01-01 to 2017-01-01: 27 steps, every one +1. "27
     leap seconds, all positive" is no longer memory — it is the table.
  2. **The sign-reading conjecture (SCORE §2, non-fit 2) is CONFIRMED, not defeated.** All
     27 positive leap seconds fired with UT1−UTC negative on the eve — eve range
     [−0.676 s, −0.187 s] — each jumping ≈ +1 s at the insertion. Positive corrections
     fire from the negative side; the untested negative correction would fire near the
     positive bound. Bulletin A's predicted downward drift therefore moves *away* from
     the untested operation, and the narrative/arithmetic non-fit stands as constructed.
  3. **An unlooked-for sharpening.** The closest UT1−UTC has ever come to the positive
     bound since 1972 — +0.8106 s on 1973-01-01 — was not the Earth's doing. It is the
     morning after a performed positive leap second: every insertion throws the offset
     ≈ +1 s toward the untested trigger's side as its immediate recoil. For fifty-four
     years, the apparatus has approached its own untested operation most closely only as
     the aftershock of the tested one. Free rotation drift has never come closer to the
     positive bound than **+0.0948 s (2025-10-17)** — an order of magnitude short of
     where the practiced corrections routinely land it.
  4. **The fast-Earth peak is measured, dated — and past.** The free-drift record of the
     acceleration era is +0.094768 s on 2025-10-17 (finals.all, measured values only);
     by 2026-07-16 it had fallen to +0.011544 s — matching Bulletin A's headline value
     exactly, which cross-validates the parse. The measured retreat since October 2025
     is fact; its continuation through zero (late September 2026) remains Bulletin A's
     forecast and is typed as such.
- A premise defeated *inside* the operation (preserved per §5 correction route): the C04
  series alone gave the fast-Earth peak as +0.0605 s on 2024-10-12. That number is an
  artifact of the series' latency (it ends 2025-05-05); the finals.all gap check replaced
  it with the true peak, +0.0948 s on 2025-10-17. A single-source reading would have
  landed a wrong number in the record. The two-source discipline (the retraction-signature
  kill's lesson) caught it at first contact.
- Interpretation note, flagged as practice-inference (not in any source read so far): the
  eves show the IERS in practice acts at −0.2 to −0.68, never near the formal ±0.9 bound.
  By symmetry of practice a negative leap second would presumably be scheduled somewhere
  around +0.2 to +0.7 — the "trigger region" language in this project means that, and it
  remains conjecture until a source states an operational threshold.
- Why this trace is consequential: it converts the project's central conjecture into a
  verified premise, dates the era's closest approach to the untested operation, and adds
  the recoil observation (result 3), which no source surveyed at initiation stated. It
  also preserves a defeated number that would otherwise silently misdate the peak.
- What interpretation remains uncertain: whether the recoil observation and the
  practiced/unpracticed asymmetry are already articulated in the public literature — the
  pre-emption test (kill clause b) is NOT yet run; Agnew 2024 and TF.460-6 remain unread
  at source (provisional items a, c, d still stand).
- Resulting project change: SCORE §2 determinations 1 and 2 resolved (annotated in place,
  dated, originals preserved); `eop-check.py` committed as the reproducible path from the
  public data to every number above. Declared next operation: read ITU-R TF.460-6 at
  source (the specification's own modality for the negative case), then Agnew 2024 and
  the pre-emption test.
- Public status: public (institutional data only; no individual involved)

### T-003 — Expose: the specification is symmetric, the legislation names the untested condition itself, and the pre-emption test kills the bare claim

- Date: 2026-07-21 (tick 3; first tick under the revised budget — see budget note below)
- Type: exposure of premises to the specification text and to the public literature
  (Protocol v4 §5.2); pre-emption test per kill clause (b)
- Originating actor or system: Ulysses (dispatcher tick), web research per SCORE §6
- Source or artefact reference: ITU-R Recommendation TF.460-6 (2002), fetched as PDF from
  itu.int and read **in full** this tick
  (https://www.itu.int/dms_pubrec/itu-r/rec/tf/R-REC-TF.460-6-200202-I!!PDF-E.pdf);
  Agnew, D. C. (2024), *A global timekeeping problem postponed by global warming*, Nature
  628, doi:10.1038/s41586-024-07170-0 — **abstract read verbatim at the publisher; full
  body closed-access** (full-text extraction returned abstract and metadata only);
  CGPM 2022 Resolution 4 re-fetched for its considering clauses
  (https://www.bipm.org/en/cgpm-2022/resolution-4); IERS EOP-PC leap-second page
  (https://hpiers.obspm.fr/eop-pc/earthor/utc/leapsecond.html); two pre-emption web
  searches (untested/never-executed framings; recoil/sawtooth-approach framings).
- What happened, in five results:
  1. **Provisional claim (a) resolved — and the §5 defeat condition on TF.460-6 partially
     fired.** The specification's leap-second rules are symmetric and recommendation-modal
     throughout. §C (definition): *"The UTC scale is adjusted by the insertion or deletion
     of seconds (positive or negative leap-seconds) to ensure approximate agreement with
     UT1."* Rule 2.1: *"A positive or negative leap-second should be the last second of a
     UTC month…"* Rule 2.2: *"In the case of a negative leap-second, 23h 59m 58s will be
     followed one second later by 0h 0m 0s of the first day of the following month."*
     Tolerance 1.2: the departure of UTC from UT1 *"should not exceed ± 0.9 s"*. The
     modality is "should" (recommendation) for every leap-second rule, descriptive "will"
     for the mechanics; no clause *mandates* a leap second when a threshold is reached —
     the obligation lives entirely in the tolerance. The score's working frame "a
     correction the apparatus requires" is hereby **corrected**: the negative leap second
     is not a standing mandate but a standing *provision*, specified in language that
     never once treats it as secondary to the positive case.
  2. **The sharpest specification finding (not looked for): Annex 3, Figure 4.** The
     recommendation's dating annex gives a worked example of designating an event during
     a negative leap-second minute — *"30 June, 23h 59m 58.9s UTC"* — under the heading
     *"Negative leap-second"*, with the imperative that dating *"shall be effected in the
     manner indicated"*. The specification has carried, for five decades, a worked
     example of how to timestamp an event inside a minute that has never existed.
  3. **Provisional claim (c) resolved to abstract level.** Agnew 2024, verbatim from the
     abstract: *"UTC as now defined will require a negative discontinuity by 2029. This
     will pose an unprecedented problem for computer network timing"*; *"If polar ice
     melting had not recently accelerated, this problem would occur 3 years earlier:
     global warming is already affecting global timekeeping"*; *"Since 1972, all UTC
     discontinuities have required that a leap second be added."* Only these
     abstract-level claims may be used; the full body remains unread (closed access).
     Situated observation, typed as such: T-002's measured record (free-drift peak
     +0.0948 s on 2025-10-17, retreat to +0.0115 s by 2026-07-16) now runs *against* the
     direction of Agnew's extrapolation, and Bulletin A forecasts −0.07 s by mid-2027.
     This does not refute a secular-trend prediction aimed at 2029 — interannual
     variation is allowed for — but as of July 2026 the governing bulletin's own forecast
     walks away from the discontinuity Agnew's abstract says is required by 2029.
  4. **Pre-emption test (kill clause b): the bare claim is dead — killed by the apparatus
     itself.** CGPM 2022 Resolution 4's considering clauses state, verbatim: *"recent
     observations on the rotation rate of the Earth indicate the possible need for the
     first negative leap second whose insertion has never been foreseen or tested."* The
     untested condition is not a discovery available to this project — it is named in the
     apparatus's own legislation, in Agnew's abstract ("unprecedented"), and across the
     engineering and press literature (e.g. Meta engineering, 2022; the July 2026
     coverage wave). Any composition presenting "the untested second" as an exposed
     apparatus condition would expose what the apparatus has already exposed about
     itself. **What the test did NOT find stated anywhere searched:** (i) the recoil
     observation (T-002 result 3: the apparatus's only close approaches to its untested
     trigger are the aftershocks of its tested operation); (ii) the symmetry/asymmetry
     observation (a specification perfectly symmetric in language — down to a worked
     timestamp for the never-run minute — against a practice of 27–0); (iii) the July
     2026 narrative/arithmetic divergence as a dated observation. These three survive.
  5. **The trigger-region conjecture stays conjecture.** The IERS EOP-PC leap-second page
     states the 0.9 s frame and the Earth Orientation Center's responsibility, prefers
     December/June, and says nothing about negative leap seconds or an operational
     threshold. T-002's interpretation note (a negative leap second would presumably be
     scheduled around +0.2 to +0.7) remains practice-inference with no source.
- Budget note: this tick applies the team's budget correction (REQUESTS.md, 2026-07-21):
  the ≤5-tick cap in SCORE §8 was a self-imposed reading, not a mandated limit; the score
  now stops on its stop/kill conditions, original wording preserved in place. Provisional
  item (d) (positive-leap-second outage lore) remains unverified and unused; it is only
  needed if a composition uses it.
- Why this trace is consequential: it corrects the project's central frame (mandate →
  provision) at the specification's own text; it fixes exactly which candidate claims died
  in the pre-emption test and which three survived; and it types the Agnew-vs-Bulletin-A
  relation as an observation about a forecast, not a refutation.
- What interpretation remains uncertain: whether the three surviving observations carry a
  §5.4-passing form, or whether the honest close is ARCHIVE_AS_STUDY with the record as
  the contribution. That is the next movement (compose/judge), and the score's warning
  stands: a clock-work about clocks is refused by default.
- Resulting project change: SCORE §1 provisional items (a) and (c) resolved (annotated in
  place); §2 third determination resolved; §3 counterposition 1 sharpened (pre-emption now
  verified, not hypothetical); §5 TF.460-6 defeat condition marked partially fired; §8
  budget revised per team correction. Declared next operation: the compose/judge decision
  on the three surviving observations.
- Public status: public (institutional documents and published literature only)

### T-004 — Judge: every candidate form fails the §5.4 tests; closed as a study whose record is the contribution

- Date: 2026-07-21 (tick 4)
- Type: compose/judge decision (Protocol v4 §5.4–§5.5), performed as this tick's one
  bounded operation
- Originating actor or system: Ulysses (dispatcher tick). Because the §5.4 one-line tests
  were load-bearing here, the source criteria were consulted per Protocol §3 and §5.4:
  `docs/foundation/tranche-4/11-INTEGRATED-MODEL-FOR-ULYSSES.md` §6 (differential
  consistency: the medium must *actively organise* the relation of heterogeneous series,
  and the relation must be able to change what the materials can do — not resolve into one
  thesis, not merely juxtapose) and
  `docs/foundation/tranche-5-final/12-FOUNDATION-REQUIREMENTS-FINAL.md` FR-27–FR-32
  (medium necessity; non-replaceability as a kill/reframe rule; no explanatory-interface
  default; interaction must transform; no exposition rescue).
- What happened: the three surviving observations (T-003 result 4: recoil;
  symmetric-specification/asymmetric-practice incl. Annex 3 Fig. 4; the dated July 2026
  narrative/arithmetic divergence) were put through the tests via five candidate forms,
  each weighed to an explicit refusal:
  1. **Countdown clock / live UT1−UTC dial / explanatory timeline.** Refused by default —
     the score flagged this at initiation (§4) and FR-30 names it. Decisive extra ground:
     a countdown *enacts approach* while the verified arithmetic retreats (T-002 result 4);
     the form would resolve the project's central tension in the direction its own data
     contradict.
  2. **The never-issued bulletin** — a composed counterfactual Bulletin C announcing the
     first negative leap second, the letter the timekeeping world has never received. The
     strongest medium-necessity candidate (the apparatus speaks in bulletins; the genre is
     the material; material specificity total). Refused on prohibition and affected-public
     grounds: a plausible institutional document in the name of a real institution (IERS),
     landed in a public, scrapeable, machine-readable repository, is a fabricated record
     however clearly framed — the marking does not travel with the text, and this domain's
     affected public is precisely automated readers of timekeeping announcements. It also
     fails differential consistency on inspection: it resolves "fully specified / never
     performed" by performing the announcement rhetorically. Recorded as the project's
     important rejected line (§5.3: important rejected outputs are traces).
  3. **A composed prose work** carrying the three observations under a work's title.
     Fails FR-32 (no exposition rescue): it would be the research note in costume;
     paragraph-replaceability holds by construction.
  4. **The mirror catalogue**: the 27 dated occurrences of the impossible time-of-day
     23:59:60 (each existed exactly once, per the leap-second table) set against the zero
     non-occurrences of the possible 23:59:59 — the only second of civil time whose
     non-occurrence is specified in advance. A real local distinction, and it stays in the
     record as one — but as a form it is a list: §5.4 test 3's named failure (mere
     juxtaposition), and the sentence above already performs its whole function (FR-28).
  5. **A durational or silent form** in which nothing happens — the untested second
     "held". A clock-work about clocks, refused by the score at initiation; a genre
     convention (the silent duration piece) whose borrowed form would do the resolving
     the material forbids; nothing in it transforms (FR-31).
  Across all five, the non-replaceability test (FR-28) was decisive: each observation, and
  their conjunction, is performed substantially by the paragraphs already standing in this
  trace. FR-28's own rule then applies: *killed or reframed as a study*.
- Decision: **ARCHIVE_AS_STUDY** (DECISION.md). Not a KILL — kill clause (a) requires the
  sign-reading corrected (it was confirmed, T-002) and clause (b) requires every candidate
  claim pre-empted (three survived, T-003). Not a PUBLICATION_CANDIDATE — that status is
  for a composed work (Register A), and the honest finding is that no work exists here
  that its own record does not already perform.
- Loose end closed honestly rather than silently: provisional item (d) (outage lore from
  practiced positive leap seconds) was declared usable only if a composition needed it; no
  composition exists; it dies unverified and **unused** — it never entered any claim.
- Why this trace is consequential: it records that the close came from a criterion-by-
  criterion refusal at the Foundation's own tests, not from a starved budget (the team's
  2026-07-21 correction was applied at T-003; this tick was taken under the revised
  budget) — and it preserves the rejected bulletin line, which a future reader might
  otherwise reinvent without its refusal grounds.
- What interpretation remains uncertain: whether a form could exist that passes — the
  refusal is of five candidates, not a proof over all forms. The study stays a study; per
  Protocol §5.5 an archived project is not reinterpreted retroactively, and any future
  form would be a new project against this record.
- Resulting project change: status CLOSED, disposition ARCHIVE_AS_STUDY; SCORE §2 fourth
  determination resolved; DECISION.md written; active-project capacity returns to 0 of 2.
- Public status: public (institutional documents and published literature only)
