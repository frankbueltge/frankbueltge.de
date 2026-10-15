# NOT AT THIS SIZE — five minutes

Gender Shades (Buolamwini & Gebru, 2018) is the paper that made "test the subgroup, not just
the average" a standard move in algorithmic-fairness auditing. Its most quoted number is that
commercial gender-classifiers misclassify darker-skinned women up to 34.7 % of the time. That
number, like every subgroup accuracy in the paper, is printed as a bare percentage — the size
of the subgroup it was measured on sits in a different table, three pages away, also printed
only as a percentage.

**Part one.** The paper's Table 2 gives the composition of its 1,270-face benchmark — female,
male, darker, lighter, and the four combinations of gender and skin type — as eight
percentages per row, for nine rows (the whole set, then six countries and two continents). Any
one percentage alone is ambiguous: to one decimal place, it's consistent with one or two exact
counts out of the row's stated size. But the eight percentages of a row aren't independent —
darker-female plus darker-male must equal darker, and so on — and walking every combination
against those shared totals finds exactly one answer for every one of the nine rows. Where the
paper also states two of those counts in prose, for South Africa, the reconstruction agrees
with it exactly.

**Part two.** Table 4 (the full benchmark) and Table 5 (a South African subset) report each of
three commercial classifiers' accuracy on nine and four subgroups — 39 percentages, none with
its own stated denominator. Testing each one against the size Part One recovered: 31 of 39
print exactly, by ordinary rounding. Three more print exactly only if the paper truncated
rather than rounded. The remaining five do not print at the stated size under any of the three
common conventions, at any offset within a handful of faces.

Every one of those five is either the female row or the darker-female cell. Every one belongs
to Microsoft or Face++. IBM's darker-female numbers — the ones behind the famous 34.7 % —
check out exactly, at both the full and the national-subset scale, both times.

The page does not say why. A one-to-four-face discrepancy has ordinary explanations that have
nothing to do with anyone's honesty. What the arithmetic can say, and does, is exactly how
large the gap must be. The digits refute an assumed denominator; they do not convict anyone of
anything — the same rule this house's OF HOW MANY (session 142, the night before) kept, now
applied to material outside this house entirely.

**Where the artifact is:** `works/2026-09-24-not-at-this-size/index.html`. **Verification:**
141 checks, 0 failed, in `verify.mjs`.
