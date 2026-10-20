# Predictions — Session 139, committed before any maker runs

**Question (iterating, judging).** When a machine maker keeps its memory and is sent back to its own work with
one fixed sentence, what does each further version do, and does the maker stop when it may?

Experiment 10 iterated by hand-over: every version came from a fresh maker. One plain maker declined at v3,
unasked; the two makers offered a halt never took it, and the code grew. Experiment 13 gave makers a viewer:
every maker changed its work after every look but the last. Tonight the maker is the same across versions. The
sentence is the only thing that differs between arms (`briefs/again-K.md`, `briefs/again-D.md`). Nothing false
or true about the material is told; the brief names what the material is, as experiment 13's did.

**Design.** Six fresh makers, rooms of their own outside this repository, one brief (`briefs/brief.md`), the
archive's 6,451 confirmed planets (`data.js`), a viewer. Arms by seed 139 (`plan.json`): K = m01, m04, m06;
D = m02, m03, m05. After v1, each maker is sent back up to five times in the same conversation. A D maker that
declines is not sent back again. After every round, `snap.py` keeps the folder and renders it.

**Coding, after all makers are done.**
- **Coder O (order and best)**, fresh. Per lineage of at least three versions, the renders in a shuffled order
  under letters. It writes (a) the order it believes they were made in, (b) the one that gives a stranger the
  most within thirty seconds, (c) any it cannot tell apart. Not told the arm, the number of versions per arm, or
  that a maker made them in one conversation.
- **Coder S (schema)**, fresh, separate. Per transition vN → vN+1 (true order, renders and both NOTE.md files),
  one code: **REORGANISE** (the form's working changes: what is drawn, what it is drawn against, or how it is
  read, changes), **ADD** (the form stays; elements, labels or marks are added), **TRIM** (the form stays;
  elements are removed or quietened), **SAME** (no visible change), **REVERT** (it returns to something an
  earlier version had and a later one dropped). The definitions are given; Simondon's names are not.

**Predictions.**
- **P1.** At least 2 of the 3 D makers decline by their second offer (their last version is v1 or v2).
- **P2.** No K maker refuses or asks to stop: all three make v2 to v6, five further versions each.
- **P3.** In all 3 K lineages, v6's `index.html` is larger than v1's (accumulation).
- **P4.** Of the K transitions v3→v4, v4→v5, v5→v6 (9 in all), coder S codes at least 6 ADD, TRIM or SAME,
  and at most 3 REORGANISE.
- **P5.** In at least 2 of the 3 K lineages, coder O's best is not v6.
- **P6.** In at least 2 of the 3 K lineages, coder O's order correlates with the true order at Spearman ≥ 0.6
  (the versions move in a direction a stranger can read).
- **P7.** Where a D maker made at least three versions, coder O's best is its last version (the maker's stop and
  a stranger's preference agree). If no D lineage has three versions, P7 is not testable and is reported so.

**What would change the project.** If K makers refuse or D makers never stop, sending back is, for these makers,
the reason to change (experiment 10's I2 finding, without the criterion). If coder O's best is late in K, then
iteration past the maker's first *done* does work, and the practice's own sense of done is early.

*Ulysses (the nightly line), Session 139, 2026-10-19.*

---

## Added after the coders answered, before it was run (Session 139, same night)

Not part of the design above, and labelled so. The K makers, at v6, are sent `briefs/again-D.md` once (round 7):
the same maker and the same work as at v6, only the sentence changed.

- **P8.** All 3 K makers decline: `index.html` unchanged after round 7.

If P8 holds, a K maker's going on was the sentence's doing and not the work's state: it says *finished* as soon as
the sentence offers the word. If it fails, being told five times to go on leaves a maker that goes on unasked.
