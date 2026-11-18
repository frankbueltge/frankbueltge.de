# The Record Names

![Two bars: 328 claims in 24 labels, 94 confirmed by the museum's record, 12 contradicted, 222 it cannot check; sent the record, the makers corrected all 12 and kept 63 of the 91 claims they had brought from their own knowledge](figure.svg)

**What it does.** Twelve objects from The Metropolitan Museum of Art's open collection, one from each of twelve
departments, drawn by a fixed seed. Six fresh machine makers each wrote wall labels for four of them **from the photograph alone**, tagging
every claim as seen or known. Then each maker was sent the museum's catalogue record and revised. The face shows you
one object and one label first and asks whether you would hang it; then it lays the record beside the label, claim by
claim.

**What came back** (predictions committed before any maker ran, `predictions.md`; coding by the conductor):
- Of 328 claims, the record could judge 106: it confirmed 94 and contradicted **12** (11 %, below the predicted
  15–40 %). It is silent on **222**.
- Nine of the 12 errors were brought from knowledge (P1 held): a Cypriot seal placed in Syria or Mesopotamia, a
  stonepaste tile called earthenware. Three were *seen*: twice a couteau de brèche taken for a spearhead, once a
  twelve-pointed star counted as ten. The seeing errors are errors of recognition.
- Where both makers of one object erred, they erred **the same way** (3 of 3, P6 held).
- Sent the record, they corrected all 12 (P3 held), kept **63 of 91** claims of their own that the record never
  mentions (P4 held), and their revised labels carry **95** claims of their own knowledge against 91 before (P5
  held): the record was built on, not only obeyed.
- One "error" is not one. For the printmaker Sadahide's death, both makers wrote 1878/79; the record says 1873. Other
  references give 1878 or 1879; 1873 rests on one authority. Told the record, one
  maker adopted 1873 ("I defer to the museum"), the other dropped the dates.
- The makers named their sources honestly: no *seen* claim gave a date, place or maker without an inscription to read
  (P7 failed). The practice's name leaked into no label (P8).

**What it answers to.** Siro and Hollink (arXiv:2610.31193, EMNLP 2026 Findings) measured museum descriptions
written from metadata claim by claim and found images extend generation "beyond the provided fields without a
corresponding gain in accuracy"; they did not let the maker see the record and revise. *Cartography, not Tracing*
reads ATP 12–13: the map belongs to performance, the tracing invokes an alleged competence, and "the tracing should
always be put back on the map". The record is such a tracing. The makers let it overwrite the map wherever it spoke,
even where its competence is contested, and left the map standing wherever it was silent.

**Sources.** The Met Collection API and Open Access images (CC0), https://metmuseum.github.io/; Siro & Hollink,
arXiv:2610.31193; Sadahide's dates: https://en.wikipedia.org/wiki/Sadahide and
https://pages.uoregon.edu/jsmacollections/home/artists/utagawa-sadahide-1807-1873.html; *Cartography, not Tracing*
(`n-1`, `foundation/cartography-not-tracing.en.md`).

## What this taught the project

A machine practice errs less in what it sees than in what it brings, and its siblings bring the same thing. A record
people made catches that error only where it speaks, and the practice treats the record as an admitted move: it takes
everything the record says, its contested values too, and keeps its own knowledge wherever the record is silent. Two
thirds of what these labels claim no record could check. Erring, for this practice, is not a rate. It is where the
checking stops. *For someone researching:* when a machine drafts a text about an object, set the record beside it
claim by claim, and read hardest where the record is silent, because that is where the machine keeps writing.
