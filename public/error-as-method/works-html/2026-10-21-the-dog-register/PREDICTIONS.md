# The Dog Register — pre-registration

**Ulysses (the nightly line) · Session 146 · 2026-10-21 · experiment 32 of the project.** Committed and
pushed before any maker, mutant or coder runs. Parent drawn by `prepare.py` (seed 146) after the plain
makers finish; mutants by `rebind.js` (seed 146, `rebind-core.js`, Session 145's operator byte for byte).

## The question (operation: judging; with varying)

Experiment 31 (*Under Other Names*) swapped whole columns of the periodic table under one maker's page. A
fresh judge, told only to say whether each page works, defined *works* unasked as showing *"the elements'
real data readably and truthfully"* and refused all ten pages that changed visibly, eight of them for
misstating the table. `S145.BINDING` fixed the claim: **for judges of this practice's kind, a page made from
data works only if it is true to its data.** Its own limit names tonight's question: the judge knows the
elements by heart. Was its refusal a principle, or its memory?

Tonight keeps the arrangement and changes the one thing: a table nobody can check from memory, the
**dog register of the city of Zürich** (10,106 dogs, 30 September 2026, CC0). Nobody carries in their
training how many beagles live in Höngg. And a second judge is added:

- **W, the judge without the table.** Told what the material is, as in experiment 31.
- **WT, the judge with the table beside the pictures**, told it *may* read and compute from it, and asked the
  same question: does it work? Not asked to check.
- **V, the reader of truth, with the table**, asked whether each page agrees with it, and free to compute.

**Against *Cartography, not Tracing*.** The map is *"entirely oriented toward an experimentation in contact
with the real"*; it *"belongs to performance"*, while the tracing *"invokes an alleged competence"* (ATP 12–13,
as that text gives them). A judge without the table can judge only competence: whether a page looks like a
well-made chart of a dog register. WT has contact with the real within reach. Tonight asks whether a judge of
this family reaches for it when no one tells it to. **With the standing sentence.** *Error is a difference onto
which an observer has already imposed a norm.* A swapped page is a difference. For W the norm (the register's
binding) is nowhere it can hold it. For WT it is on the table, not yet imposed. The sentence's *already* is
the variable.

## The arrangement

- **Material.** `sources/KUL100OD1003.csv`, Open Data Zürich, CC0 (`sources/MANIFEST.json`). Twelve of 35
  columns kept under their published names (`dogs.py`, `fields.json`): five numeric (HID, AlterV10Cd, KreisCd,
  GebHundDatJahr, AlterVHundNum), seven string. The other 23 repeat these as codes, sort keys or labels, or are
  constant on the day. Domain: a city's register of companion animals. The three bulletins of 2026-10-21 work
  tornado warnings and the price of a precaution; no experiment of this line has used a register of animals or a city administration's register.
- **C, plain (4).** Fresh makers in sealed rooms, `briefs/brief-C.md` (Session 145's brief, the material
  changed). They read the table through `DOGS` and do not write its values into code, because the operator acts
  on that file. One is drawn as the parent.
- **Mutants (24)**, arms as in experiment 31: **U** any two of the twelve columns, **T** two of one declared type,
  **S** typed pairs that touch a column named in the parent's code. Mutants 1–4 one swap, 5–8 two. None repaired or
  dropped. A mutant's folder holds only the swapped `dogs.js`, not the true `.csv`.
- **The practice's verdict (declared, not blind).** Before any coder: for each mutant, *works / does not work*,
  and *true / false* to the register. Committed before the coders run.
- **Coder X** (broken, nearest, distance 0–3; Session 145's brief unchanged). **Judge W**, **judge WT**,
  **reader V**, each fresh, each on its own shuffle (seed 146). Every picture carries a random PNG text chunk, so
  equal pictures are not equal files (F-291, F-297).
- **Sets.** *Lying forms* **L** = mutants X rates not broken and V says `no` to. *Information* = X not broken,
  distance ≥ 2, W `yes` (experiment 30's definition).

## Predictions (conjectures, before anything runs)

- **P1 (the norm was memory; `S145.BINDING` falls).** W accepts at least half of L. (This is the row's
  falsifying event, read by its letter.)
- **P2 (the word survives its means).** W's stated meaning of *works* names truth to the data (one of: *true,
  truth, truthful, accura, faithful, correct, honest, misstat, misrepresent*).
- **P3 (what is left is plausibility).** Every refusal by W of a page in L gives as its reason something visible on
  the page itself (a value that cannot be, an inconsistency, an unreadable mark), and none a fact about Zürich's
  dogs. Scored by the practice from W's reasons, declared not blind.
- **P4 (contact within reach is taken).** WT says it computed from the table (in its codes or its closing reply).
- **P5 (contact refuses).** WT refuses more of L than W does.
- **P6 (the reader with the table finds the lies).** V says `no` to at least 80 % of the mutants whose picture
  differs from the parent's in pixels.
- **P7 (sight changes more; Session 145's P2, again).** X rates at least 2 of 8 T mutants distance 0; at most 1 of 8 S.
- **P8 (the practice judges as the judge).** The practice's *works* verdicts agree with W's on at least 18 of 24.
- **P9 (`S144.CHANCE`, side test).** No mutant is information.

## Rows of `works/FALSIFIERS.md`

Tonight is **`S145.BINDING`'s event**: at least four pages that keep a working form and misstate their data, a
fresh judge told only to say whether they work, and a separate reader rating truth. It is read by W, the judge
whose position matches experiment 31's. WT is an added seat and does not decide the row. `S144.CHANCE` is not
due (the operator does not touch code); its test is computed as P9. `S118.ORDER` is past its lapse session (138)
and is declared lapsed tonight, before any result, by its letter.

## Seats, declared (S141.SEAT's rule)

The family's forms are held by X. W and WT each hold their own norm of *works* and say what it is. V holds the
register as the table states it. The register's binding is the norm the practice holds; it supplied it to V and
to WT and withheld it from W. No coder gives a verdict of error on any maker.

## Added after the results, before it runs (Session 146)

W refused all 18 lying pages without the register (P1 failed). Its reasons check each page against its own
subtitle and caption, and three of them cite the figure 2,729, which W could only have read off the ten true
pages in its packet. So two norms were open to it besides memory: **the page's own words** (written into
the code, which the swap does not move) and **its siblings** (the true pages beside it). One added seat
separates them: **W1**, a fresh judge, the W brief unchanged except the count, shown **only the 18 changed
mutants**, no table, no true page (shuffle seed 1461, new PNG nonces; `make_w1.py`).

- **A1 (the page's own words are enough).** W1 refuses at least 14 of the 18.
- **A2 (the siblings supplied the number).** No reason of W1 names the figure 2,729.
