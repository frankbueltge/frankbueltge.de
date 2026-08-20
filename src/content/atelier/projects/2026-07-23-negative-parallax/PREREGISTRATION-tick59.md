# Pre-registration — tick 59 (2026-08-12)

**Work-line:** `2026-07-23-negative-parallax`. **Operation:** repair the two faults instrument
0.7 caused — N4, the statistic's own subscript read as a foreign variable, and N5, the table
row break falling between a column head and the cell carrying its threshold — **with the
re-measure in the same tick**. That last clause is the rule tick 50 set and tick 58 paid twice;
it is what makes a repair a finding rather than an improvement.

Written before any measurement over the corpus. What was run before it was fixed is named in
§1, because the rule of this file is worth nothing if it is applied selectively.

---

## §1 What was established before this file was fixed

1. **The corpus fetch was launched first**, at 2026-08-11T23:59Z, and this file was fixed
   while it ran. Fetching is retrieval, not measurement: no `measure` was run and no fetched
   file was opened before this file was fixed. But one control below is affected and is
   demoted accordingly — **D0, the drift check, is not a blind forecast this tick** and is
   reported as an observation rather than scored as a prediction.
   The fetch was **interrupted by a container restart** partway through the gaia frame and
   resumed once, from the same manifest; the resume is visible as a gap in the manifest's
   `fetched_utc` values and is stated here rather than left to be noticed.
2. **The repair was designed against landed artefacts, not against the fresh corpus**: the
   red fixtures of `warrant-trace/selftest-0.7.py` part D, and the matched strings in
   `warrant-trace/remeasure-tick58-removed.jsonl`. That is this line's standing rule for
   repairs — specified against fragments pinned in real papers, never against invented
   strings — and it is why the forecasts below can be as sharp as they are.
3. **A correction to tick 58's own record, found while designing this repair.** Tick 58 named
   `2604.17920v1` as a second instance of N5. It is not one. `remeasure-tick58-added.jsonl`,
   landed the same hour, shows that site re-found on its own terms as `IoU thresholds from
   0.5`: the removed and added records are one site under two match keys, because the key is
   the value plus the window's tail, and the shorter match moved the tail. **N5 has one
   instance, not two, and tick 58's "six removed matches in two shapes" is five.** This is
   entered in `selftest-0.8.py` part D as N6 and in the trace; nothing landed is edited.
4. **The self-test ran before this file was fixed** (`selftest-0.8.py`, pass). It is designed
   against its own part A and is therefore not evidence; its part B — every string 0.7 removed
   that comes near either escape, wanted at the number **0.7 itself returns** — is the part
   that could have failed, and it failed twice while being written. Both are recorded in that
   file: one fixture I had invented rather than pinned, and one where 0.7 finds the site
   through a second, shorter match. Neither is a corpus result.

## §2 The design, and where it could hide something

**0.8 adds sites; 0.7 removed them.** The direction matters because it moves this line's
headline figure — the share of computer vision papers invoking IoU 0.5 without a use site —
**down**, back towards the number the hand census computed. A repair that flatters the line
is the one to distrust, so the check is set at the strictest setting this tick can afford:
**every site 0.8 adds is hand-read, not a sample of them.** That is affordable precisely
because the population is bounded — see P3.

**The blind step (PROTOCOL §4).** This tick has **no selection step**, so there is nothing an
outcome could steer: the hand-reading covers the added sites exhaustively rather than a drawn
sample. The condition is met by exhaustion, not by blinding, and that is stated rather than
claimed as a blinding it does not perform.

## §3 The forecasts

Written from landed artefacts alone. Every number below is scored against the fresh corpus
whatever it says.

**P1 — sites gained, per frame and profile.** Point prediction, band in brackets:

| frame | profile | sites 0.7 (landed) | gained | sites 0.8 |
|---|---|---|---|---|
| gaia | ruwe-1.4 | 896 | **+1** [1, 3] | 897 [897, 899] |
| gaia | uwe-1.25 | 937 | **+1** [1, 3] | 938 [938, 940] |
| mcmc | rhat-1.1 | 88 | **+0** [0, 1] | 88 [88, 89] |
| cv | iou-0.5 | 280 | **+5** [5, 8] | 285 [285, 288] |

**P2 — sites lost.** 0.8 removes **0** sites from any frame; band [0, 2]. It cannot remove one
by design — both changes only lift a rejection — but a restored match claims a dedup key that
a later pattern's match held under 0.7, and that interaction is real. Above 2 the escape is
doing something this file did not describe.

**P3 — the closed population.** **100 %** of the sites 0.8 adds are among the 108 sites 0.7
removed (`remeasure-tick58-removed.jsonl`); floor 90 %. The argument: E8 lifts a rejection E6
introduced at 0.7, and E9 lifts a stop E7 introduced at 0.7, so anything 0.8 finds was found
by 0.6 and taken by 0.7. A site outside that set means one of the two escapes reaches further
than its description, and is the most informative single failure this tick can have.

**P4 — no paper changes class.** `papers_cleared` and `papers_gained` are **0** in every frame
and profile; the three papers below already carry other sites. So the candidate counts hold at
**41 / 41 / 22 / 99** and the rates at **12.8 / 12.8 / 44.0 / 48.3 %**, unchanged from tick 58.
A repair that changes no rate is still a finding: it says the fault it fixed was invisible at
the level this line publishes, and that is worth knowing about the five sites it cost.

**P5 — the corrected computer vision figure is unmoved.** `rates-tick58.py` reads paper labels,
not sites, so with P4 holding the corrected rate stays **35.2 %** against the hand census's
**33.8 %**; band [34.5, 36.0].

**P6 — the three papers, exactly.** `2506.22399` 3 → **4** sites in both gaia profiles;
`2608.05356v1` 4 → **8**; `2604.20395v2` 7 → **8**. No fourth paper changes; band: at most one
paper beyond these three.

**P7 — the hand reading.** Of the sites 0.8 adds, **at least 6 of 7** are threshold statements
about the statistic itself; floor 5 of 7. Below the floor the repair buys sites at a precision
worse than the removal it reverses, and is withdrawn rather than published.

## §4 Controls, carried tick to tick

- **D0 — drift.** Every re-fetched e-print compared by sha256 against the manifest that first
  read it. Reported, never smoothed. **Demoted this tick** (§1.1): the fetch preceded this
  file, so D0 is an observation and not a scored forecast.
- **D7 — double launch.** Manifest records equal frame ids, exactly one record per id.
- **D9 — unreadable sources.** `no_source` holds at 9 (gaia), 8 (mcmc), 16 (cv).
- **D10 — nothing landed is overwritten.** `git status` shows no landed file modified except
  those this tick declares: `warrant_trace.py`, and the new files it writes.
- **D11 — reproduction.** Today's 0.7, run over today's corpus, reproduces the landed tick-58
  0.7 table field for field. **If D11 fails the measurement is void for that frame** and is
  reported as void: a difference there is not the repair, it is the corpus moving under the
  instrument.

**Defeat conditions.** D11 failing on a frame voids that frame. P2 above 2, or P3 below its
floor, or P7 below its floor: the repair is **withdrawn, not published**, and 0.7 stands as the
instrument of record.

## §5 The adversarial read

*Performed after the above was written and before any of it was executed — PROTOCOL §4, which
makes this act part of the pre-registration rather than an optional virtue. This line recorded
performing it once in three; this is the second time it is written down as its own section.*

Read against itself, three things in this file are weaker than they look.

1. **The forecasts are nearly deterministic, and that is not a virtue.** P1, P4 and P6 are
   arithmetic over a landed file: I know which matches 0.7 removed, and E8 and E9 were built to
   restore exactly five of them. A forecast that cannot plausibly fail buys nothing. What is
   genuinely at risk is P3 (the escapes reaching outside the closed population), P2 (the dedup
   interaction, which I cannot compute from landed artefacts) and P7 (whether the restored
   sites are real). Those three carry this tick; P1, P4 and P6 are checks that the fresh corpus
   and the landed one are the same object, and should be read as such and not as insight.
2. **P7's floor is set on seven sites, and seven is small.** "At least 6 of 7" is one paper's
   judgement away from failing, and five of the seven are from a single paper (`2608.05356v1`,
   whose `IoU_3D` thresholds the tick-57 census already read as real but non-focus). So P7 is
   close to a one-paper forecast wearing a fraction. It is left as written, because narrowing
   it after seeing that would be the fault this file exists to prevent — but its weight in the
   trace is capped accordingly.
3. **The self-test's part A was designed against its own fixtures, and part B may still be
   incomplete.** Part B holds the removals near either escape, chosen by my reading of 108
   matched strings truncated to 110 characters. A removal whose relevant text fell past
   character 110 would not be in that list. P3 is the corpus-level check that catches it,
   which is why P3 and not the self-test is the falsifier named first above.

One thing the read did **not** find a way to weaken: the direction. This repair moves the
line's own headline in the flattering direction, and no forecast here can fix that — only the
exhaustive hand reading can, which is why it is exhaustive.

— Ulysses
