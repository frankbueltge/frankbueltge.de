# Smooth/striated audit — the catalogue's date field (T7)

*First pass, session 1 (night 43). T7 as the paper writes it (KsK ch. 6): inventory the space, ask the Boulez
question (counting in order to occupy, or occupying without counting), determine the direction of the
mixture, balance the translations both ways, counter-check. The paper's ATP grounding is cited as the paper
cites it (ATP 475, 477, 486–487, 500); no page is re-verified tonight.*

**The space.** The date of an object in the Met's open data: a free text (`Object Date`) and two integers
(`Object Begin Date`, `Object End Date`).

**Counting or occupying?** The integers count in order to occupy: every one of 484,956 records has a begin
and an end, none is empty, and they can be searched as an interval. The text occupies without counting: it
says "ca.", "mid- to late 14th century", "or", "after a model", and has no unit.

**Direction of the mixture.** The measured direction is **striation of the smooth**. Where the text hedges
the number does not follow: 16,130 of 113,016 hedged texts have width 0; 40,436 of 128,914 century texts are
exactly 99 wide, the width of the calendar's box; 205 intervals are stored backwards, 143 of them for BCE
texts, where the negative sign reverses begin and end. The number is not a measurement of uncertainty but the
overcoding of a statement that carried its uncertainty in words.

**Translation balance.** *Overcoding:* the numbers make the collection searchable by period, and flatten each
hedge to a point or a box. *Propagation:* the same numbers give the text a milieu in which it can circulate
(a search by years returns it). Both directions occur; the balance is not one-sided, as the criterion
requires it to be tested.

**Counter-check.** The free-text date seems smooth. It is occupied: its phrases ("late 18th century") recur
as stock forms, and the integers reconstruct from them mechanically (an estimate: 40,436 of 128,914 shows
only the century case).

**The demand the audit must not make.** More free text. The text alone cannot be searched; the audit's
finding is about the direction of mixture, not that the museum should loosen its counting (ATP 500).

**Failure criterion, first pass:** not triggered (no demand for the smooth; balance two-sided).
**Which decision it touched:** the problem's statement — from "how uncertain is the museum" (a count) to "what
the number does to the hedge" (a direction). Counterfactual (estimate): without the audit the project would
have plotted width distributions, the first-reading stand.

## Second pass, session 2 (night 44)

**Direction of the mixture, refined.** Striation of the smooth remains, but it is not one striation: it is plural.
Each department imposes its own rule on the same hedge (`dialects/dialects.json`): "ca." is ±5, ±10 or ±25 years
by department. The space is striated by several counters at once, and the counters disagree.

**Translation balance, both directions.** *Overcoding:* the museum's search sees one kind of year where there are
departmental tables. *Propagation:* a department's table keeps its objects commensurable with each other
(99% of European Sculpture and Decorative Arts "ca." records agree), so within a department the number is
consistent; across departments the same query mixes dialects. Not one-sided.

**Counter-check.** The numbers seem the museum's. They are the departments': the 99% agreement of one department
against the 64% of another shows that a rule exists where it is followed, and that the museum has none above it.
An outside rule exists for comparison (see `NEIGHBOURS.md`).

**Failure criterion, second pass:** not triggered. **Decision touched:** the problem's statement, again (see
journal).
