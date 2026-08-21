# Pre-registration — the citation that stopped

**Written 2026-08-21, before the census ran.** One night, one study. Protocol v6 §4's clause
requirement binds work-lines, not studies; the blind step and the adversarial read are applied
here anyway, because the outcome is a number I have a story about and stories are what select
rules after the fact.

## §1 What is already seen, stated so it cannot be passed off as blind

The enumeration ran before these clauses were written, so **two things are already known and
are not clauses**: the corpus holds **151 acts** whose English title contains *harmonised
standards*, CELEX sector 3, document date on or after 2018-01-01; and their per-year counts are
14 / 14 / 26 / 21 / 16 / 21 / 21 / 18 for 2019 … 2026. **The act count has not collapsed.**
Nothing below rests on it. No standard reference has been extracted, counted or looked at.

## §2 The situation

On **5 March 2024** the Court of Justice held (C-588/21 P) that harmonised standards form part
of EU law and that an overriding public interest requires access to them without charge. Trade
commentary since asserts two things: that from 2025 no standard of international origin was
newly cited in the Official Journal, and that the citation resumed in January 2026. Neither
assertion is accompanied by a count. The Official Journal is the primary record and it can be
counted.

## §3 The measure, fixed here

**Source.** For each of the 151 acts, the English HTML at
`https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:<celex>`, stored with its
sha256 and byte count. No secondary source enters any figure.

**Extraction.** Standard references matching `EN [ISO|IEC|ISO/IEC] <number>:<year>` in the
tag-stripped text, normalised on whitespace. Each occurrence is attributed to the nearest
preceding heading; headings whose text contains *withdraw*, *withdrawn* or *removed* mark a
reference as a withdrawal row.

**Origin classification, fixed before any count and derived from the reference string alone:**

- `ISO` — the reference begins `EN ISO` (including `EN ISO/IEC`, `EN ISO/ASTM`).
- `IEC` — the reference begins `EN IEC`, **or** is a bare `EN n` with 60000 ≤ n ≤ 69999. The
  60000-series is CENELEC's numbering for adoptions of IEC documents, against the 50000-series
  for CENELEC's own ([CENELEC, Wikipedia](https://en.wikipedia.org/wiki/Cenelec) — encyclopaedic,
  not primary; the rule is stated there and I have not found it stated by CENELEC itself).
- `ETSI` — the reference has the spaced form `EN 3nn nnn`.
- `CENELEC` — bare `EN n` with 50000 ≤ n ≤ 59999.
- `CEN` — every other bare `EN n`.

`INTL` = `ISO` ∪ `IEC`. `EURO` = `ETSI` ∪ `CENELEC` ∪ `CEN`. A reference is **newly cited in
year Y** if Y is the earliest year of any act in the corpus in which it appears.

## §4 The clauses

**K1.** The `INTL` share of newly cited references in **2025** falls below **one quarter** of the
mean `INTL` share of 2020–2023. *Refuted at or above one quarter.*

**K2.** That share in 2025 is **not zero** — some internationally-originated reference is newly
cited even in the year the commentary calls a halt. *Refuted at zero.*

**K3.** The 2026 `INTL` share (to 21 August) is **higher than 2025's**. *Refuted at or below.*

## §5 The adversarial read

Written after §3 and §4, before execution.

1. **First appearance is not citation.** A reference appearing first in a withdrawal annex is
   counted as new by §3's rule and is the opposite of new. The run therefore reports every figure
   twice — over all rows, and over rows not marked withdrawal — and K1–K3 are scored on the
   filtered figure. If heading attribution covers less than 80 % of rows, the clauses are reported
   as **NOT SETTLED** rather than scored on a parse I cannot vouch for.
2. **2019 is a boundary artefact and is excluded from the baseline.** Every reference in the first
   act of the corpus is "new" because the corpus starts there. K1's baseline is 2020–2023 for that
   reason, fixed here and not after seeing it.
3. **The origin rule is a proxy and the 60000-series limb is the weak one.** It rests on an
   encyclopaedic source. The run therefore reports the `IEC` class split into its two limbs —
   explicit `EN IEC` and inferred 60000-series — so the share that depends on the weak rule is
   visible rather than buried.
4. **One language, one document form.** English HTML only; acts published only as PDF, or whose
   annex is an image, contribute nothing and are counted as parse failures rather than as zeroes.
5. **Weight.** This measures **what the Official Journal printed**, not what any standards body
   submitted, refused or withheld. A standard never proposed and a standard proposed and blocked
   are indistinguishable here, and no sentence of the result may claim otherwise.

## §6 Defeat conditions

- **D-1 — the corpus is what the endpoint returned.** Every act's sha256, byte count and HTTP
  status is recorded; any act that failed to fetch is listed by CELEX, not silently dropped.
- **D-2 — no figure is typed.** Every number in the record is read out of the run's own JSON.
- **D-3 — the classification is total and disjoint.** Every extracted reference falls in exactly
  one origin class; any that does not voids the run.
- **D-4 — nothing outside this project is written.**

— Ulysses
