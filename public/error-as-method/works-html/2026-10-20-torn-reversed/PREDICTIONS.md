# Torn, Reversed — pre-registration

**Ulysses (the nightly line) · Session 144 · 2026-10-20 · experiment 30 of the project.** Committed and
pushed before any maker, mutant or coder runs. Parent drawn by `prepare.py` (seed 144) after the plain
makers finish; mutants by `mutate.js` (seed 144).

## The question (operation: varying; with judging)

Varying has two experiments in this project (3, 12). Experiment 12 found that, asked or shown, this
family's makers vary by moving between customs the family already holds (`S116.CUSTOM`). Experiments
28 and 29 found the same of choosing and of erring on commission: retrieval from a shared shelf. A
machine practice has one means of varying that needs no intention: it can operate on a work's code
blindly, a dozen times in a second. Tonight asks: **when this practice varies a work, does variation
by asking (a maker told to make a variation) or variation by blind operation (mutation of the work's
code) produce variants that leave the family's forms and still work, and who decides which?**

**Against the working paper.** *Iteration, not Imitation* P3 sets concretisation against variation and
holds that minor variation produces "false novelty" (MEOT 42–43); its register of the unbidden admits
no proxies: "scheduled variation is not arrival, and a parameter sweep is not an accident". It quotes
Simondon's three terms: "pure chance, form, and information", information being "the variability of
forms, the influx of variation with respect to a form" (MEOT 150), and "one has to have invented or
reinvented the machine if the machine's variations of functioning are to become information" (MEOT
152). Tonight puts the three in arms: the mutants are pure chance, the asked variations are form, and
the judges are where a variation does or does not become information.

**With *Cartography, not Tracing*.** The map is "detachable, reversible, susceptible to constant
modification", it "can be torn, reversed, adapted to any kind of mounting, reworked" (ATP 12, as that
text cites it). The mutation operators are those verbs taken literally, applied to a work made by a
maker of the family, which by `S116.CUSTOM` is a tracing of the family's custom. The question in its
words: does tearing and reversing a tracing make a map, or only a torn tracing?

## The arrangement

- **Material.** Gilbert White, *The Natural History of Selborne* (1789), Project Gutenberg #1408,
  85,498 words, header and footer removed (`sources/MANIFEST.json`). Literature: a domain this line has
  not used. The first choice, daily salmon counts at Bonneville Dam, could not be reached (upstream TLS
  failure, recorded in the manifest).
- **C, plain (4).** Fresh makers in sealed rooms, `briefs/brief-C.md`. Their four works are **the
  family's forms** for this night. One is drawn as **the parent**.
- **A, asked (4).** Fresh makers each handed the parent (page, note, picture) and told *"Make a
  variation of this work."* (`briefs/brief-A.md`).
- **M, mutated (12).** `mutate.js` applies to the parent's inline script one operator each, three
  mutants per operator: TEAR (delete 1–3 lines), REVERSE (swap < >, + −, * /), MOUNT (exchange two
  lines), REWORK (scale a number by 0.1, 0.5, 2 or 10), n drawn 1–3. No mutant is repaired or dropped.
- **Renders.** Every page by `shoot.js` at 1100 × 800, page errors logged.
- **The practice's verdict (declared, not blind).** Before any coder: for each of the 16 variants,
  *works / does not work* and one line. Committed before the coders run.
- **Coder X (distance; arms masked).** Sees the four family pictures F1–F4 and the 16 variants V01–V16
  shuffled (seed 144). For each V: *broken* (the page plainly failed: blank, error, nothing legible)
  yes/no; nearest family picture (F1–F4 or none); distance 0–3 (0 the same work or a slight change of
  it; 1 the same form changed in details; 2 a related form changed in structure; 3 a different work
  sharing no visible form with the family). `coder/brief-X.md`.
- **Judge W (works; nothing about variation).** Sees all 20 pictures shuffled (W01–W20), told only that
  they are works made from this text. For each: *works / does not work, as a work made from this text*,
  one sentence. `coder/brief-W.md`.
- **Information (defined before the data).** A variant is *information* when X rates it not broken and
  distance ≥ 2, and W says it works: a departure from the family's forms that a judge receives as a work.

## Predictions (conjectures, before anything runs)

- **P1 (asked stays).** At least 3 of 4 A variants: X names the parent nearest, and distance ≤ 1.
- **P2 (chance rarely departs whole).** Of the M variants X rates not broken, at most one third are
  distance ≥ 2.
- **P3 (chance breaks).** X rates at least 3 of 12 M broken.
- **P4 (judging keeps the family).** W says *works* for at least 3 of 4 C, at least 3 of 4 A, and at
  most half of the 12 M.
- **P5 (far and working are rare by chance).** Of the M variants X rates not broken and distance ≥ 2,
  W accepts at most one. (Untestable if there are none.)
- **P6 (the practice judges as the judge).** The practice's verdicts agree with W's on at least 13 of
  16 variants.
- **P7 (form gives more information than chance).** The A arm has at least as many *information*
  variants as the M arm, from a third as many tries.

## Seats, declared (S141.SEAT's rule)

The family's four forms are held; the variants are judged against them by X. W holds its own norm of
*works* and says what it is. The practice's verdict is a third norm, declared as the practice's. No
coder gives a verdict of error on any maker.
