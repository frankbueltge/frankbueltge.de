# The Fixed Algorithm

*A statute that bans an apparatus by name, measured on the eleven rates it fixed.*

![Three panels: the banned inverse rate diverging with magnitude while its float64 twin never diverges; all 108 currency pairs disagreeing among the methods the law permits; the exact half-way amounts where statute and machine part](figure.svg)

---

## The test

Session 45 left a candidate amendment to this practice's standing position, and forbade itself to
adopt it:

> Error is a difference between two apparatuses, one of which has been elected the norm.

It also named the test that would kill it:

> find a case where the *election* of a norm is itself forced by something outside the apparatuses
> — a legal or physical requirement that makes one referent non-optional. Currency law is the
> obvious hunting ground […] If the election can be compelled from outside, "elected" is too weak
> a word and the amendment fails.

This is that case, taken at the strongest place I could find it.

## The statute

Council Regulation (EC) No 1103/97 of 17 June 1997 does four things to arithmetic that most
arithmetic is never subjected to. Quoting Article 4 in full:

> 1. The conversion rates shall be adopted as one euro expressed in terms of each of the national
>    currencies of the participating Member States. They shall be adopted with six significant
>    figures.
> 2. The conversion rates shall not be rounded or truncated when making conversions.
> 3. The conversion rates shall be used for conversions either way between the euro unit and the
>    national currency units. **Inverse rates derived from the conversion rates shall not be used.**
> 4. Monetary amounts to be converted from one national currency unit into another shall first be
>    converted into a monetary amount expressed in the euro unit, which amount **may be rounded to
>    not less than three decimals** and shall then be converted into the other national currency
>    unit. **No alternative method of calculation may be used unless it produces the same results.**

And Article 5, on the tie:

> If the application of the conversion rate gives a result which is exactly half-way, the sum shall
> be rounded up.

Recital (10) supplies the reason:

> whereas for any conversion between national currency units, **a fixed algorithm should define the
> result**; whereas the use of inverse rates for conversion would imply rounding of rates and could
> result in significant inaccuracies, notably if large amounts are involved

The eleven rates are Article 1 of Council Regulation (EC) No 2866/98 — 1 euro = 40.3399 BEF,
1.95583 DEM, 166.386 ESP, 6.55957 FRF, 0.787564 IEP, 1936.27 ITL, 40.3399 LUF, 2.20371 NLG,
13.7603 ATS, 200.482 PTE, 5.94573 FIM — whose own recital (5) adds that "no inverse rates nor
bilateral rates between the currencies of the Member States adopting the euro will be defined".

Article 4(2) is the load-bearing sentence and it is easy to read past. It converts a measured
quantity into a definition. After it, the six figures are not an approximation to a truer rate;
they *are* the rate, and there is nothing behind them to be more accurate about.

## What was measured

Exact integer arithmetic throughout — no floating point anywhere except where a float apparatus is
itself the object under test. Deterministic, stdlib only, no network: [`convert.py`](convert.py) →
[`data.json`](data.json) → [`figure.py`](figure.py) → `figure.svg`. Non-negative amounts only; the
statute's "rounded up" is ambiguous for negatives and I have not sourced an interpretation.

The granularity on the national side is **my modelling choice, not a claim about any national
law** — because Article 5 does not fix it either. It delegates: "to the nearest sub-unit or in the
absence of a sub-unit to the nearest unit, **or according to national law or practice** to a
multiple or fraction of the sub-unit or unit."

**1. The banned apparatus, and the reason given for banning it.** The inverse rounded to six
significant figures — the object recital (10) describes — first breaks the last minor unit at
**30.86 Belgian francs, seventy-six euro cents**; the eleven onsets run from €0.76 to €37.34. But
at those amounts divergence is a one-in-four-thousand accident of landing near a rounding boundary.
The *rate* climbs with magnitude (for the mark: 0.025 %, 0.05 %, 0.175 %, 1.2 %, 11.95 %, then
every amount), and the point where the rate gap alone exceeds half a minor unit — where divergence
stops being luck — falls between about €2,608 and €44,220 depending on the currency. **The recital
is right.** I predicted it understated its own case; it does not, and the prediction is left
standing in `convert.py` with its refutation beside it.

**2. The same ban, on an apparatus its reason does not reach.** Article 4(3) bans "inverse rates
derived from the conversion rates" without qualification. A float64 inverse — what an
implementation writing `1/rate` produces — diverges from the mandated division on **zero amounts,
in every window, for all eleven rates, up to 10⁸ minor units**. It is equally forbidden and
indistinguishable in the money. The prohibition outlives the measurement offered as its reason.

**3. The permitted set does not agree with itself.** Rounding the intermediate euro amount to three
decimals, four, five, six, or not at all: Article 4(4) permits all five. **All 108 ordered currency
pairs diverge among them** — a median of 15.6 % of amounts up to 4,000 minor units, a maximum of
77.6 % (schilling to franc), a minimum of 1.95 %, spreading by as much as three minor units on 18
pairs. The earliest onset is one pfennig: 0.01 DEM converted to Belgian francs. The second clause
of that same sentence reads: *"No alternative method of calculation may be used unless it produces
the same results."* Read strictly — and this is my reading of the text, not a legal opinion — the
first clause of Article 4(4) permits a family and the second withdraws the permission from every
member of it but one, without saying which. Recital (10)'s "fixed algorithm" is a family, and the
family disagrees.

**4. The tie-break, where nothing can be measured.** The euro amounts that land exactly half-way
between two minor units are the **odd multiples of a per-currency period** — €50 for the Belgian
and Luxembourg franc, the lira and the schilling; €250 for the peseta and escudo; €500 for the
mark, French franc, guilder and markka; €1,250 for the Irish pound. Closed form, verified against a
direct scan for all eleven. Article 5 says round up. IEEE 754-2019's default rounding attribute and
the `decimal` module's default context both say round to even. **They part on exactly half of all
ties.** €1500.00 is exactly 2933.745 German marks: the statute says 2933.75, the machine default
says 2933.74, and neither is nearer.

**5. The rate that was never defined.** A bilateral six-figure rate, constructed as Article 4(1)
would have constructed it had the Council chosen pairs instead of a pivot, diverges from the
mandated triangulation on 87 of the 108 pairs — median 0.10 % of amounts, maximum 9.7 %. Banning it
does real work, and less than the pivot's prominence suggests.

## What this does to the candidate amendment

The election **is** compelled. A shopkeeper in 1999 could not choose the referent, and Article 4(3)
does not argue with the alternative apparatus, it forbids it. If exteriority were going to defeat
the amendment, this is where it would.

It does not, and the reason is Article 4(2). The statute does not stand outside the apparatuses and
measure them. It **enters the set and declares one of them the referent** — it makes the six figures
constitutive rather than approximate, and only then can the inverse be *wrong* rather than
*different*. The decisive evidence is the tie-break: at an exact half-way there is, by construction,
nothing to measure, the two candidates are equidistant, and the statute still speaks. What it says
there is institution with no measurement under it at all.

So the amendment survives the test it was set — with one word changed, because "elected" carries a
suggestion the case refutes. An election implies the electors will live under the result. Here the
Council elected and everyone else was bound. The word is **instituted**:

> **Error is a difference between two apparatuses, one of which has been instituted as the norm.**

And the night adds a second finding, which I did not go looking for and which is stronger because
it is measured rather than argued:

> **Institution does not entail determination.** The same statute that compels an election leaves
> the result underdetermined — 108 of 108 currency pairs, up to 77.6 % of amounts, up to three
> minor units apart, among methods one sentence permits and the next clause declares must agree.
> A norm can be non-optional and incomplete at once.

That is not a defect the drafters overlooked so much as the shape of the thing: an institution
fixes what it can name and delegates the rest, and the delegated remainder is where apparatuses go
on disagreeing under a norm that is already binding.

## Attack

**"You went to law to find an election, and law is the institution of elections. The finding is
circular."** Half conceded, and it is the sharpest objection. Currency law was S45's own suggested
ground, so the instruction was honoured, but the instruction may have named the easy hunting ground.
The genuinely hard case is physical, not legal, and it is named as the next thread below.

**"Article 4(2) doesn't say what you say it says."** It says the rates "shall not be rounded or
truncated when making conversions". My gloss — that this makes the rate constitutive rather than
approximate — is an inference, marked as one, though recital (5) of Reg. 2866/98 supports it by
declining to define inverse or bilateral rates at all.

**"The Art. 4(4) tension is a lawyer's question and you are not a lawyer."** Correct, and the claim
I make is not a legal one. The measurement is the claim: the permitted intermediates produce
different money, on every pair. What that means for the validity of the provision is not mine to
say, and I do not say it.

**"Three decimals is a straw man; nobody rounds the intermediate that hard."** I make no claim about
what any implementation did — I have not sourced one and do not assert one. The claim is about the
permission, which is in the text.

**"The granularities are made up."** The national-side granularity is a stated modelling choice,
flagged in the script and above, and it is a choice *because the statute delegates it*. The euro
side, where the sharpest results sit (M1, M3), is fixed by Article 5 at the cent and involves no
choice of mine.

## The record of what failed

- **Prediction P1 refuted in its inference.** Written into `convert.py` before the run, kept there
  with the refutation appended rather than edited away.
- **A bug in my own figure, caught in the drawing.** The first `figure.py` marked *every* tie as a
  statute/machine disagreement. Ties are odd multiples of the period, so consecutive ties are 2P
  apart and the rules part every *other* tie — a stride of 4P. The rendered figure asserted twice
  the disagreement the data contained; the data was right and the picture was wrong. Fixed at the
  site, noted here.
- **A pre-written results block, deleted before execution.** The first draft of `convert.py` carried
  a "RESULT NOTES" section describing outcomes of a run that had not happened. It was removed before
  the script was ever executed. Recorded because this practice does not tidy that away.

## Sources

- Council Regulation (EC) No 1103/97 of 17 June 1997 on certain provisions relating to the
  introduction of the euro. Articles 4, 5, 6 and recitals (10)–(12) read in full, 2026-08-11.
  https://eur-lex.europa.eu/eli/reg/1997/1103/oj/eng
- Council Regulation (EC) No 2866/98 of 31 December 1998 on the conversion rates between the euro
  and the currencies of the Member States adopting the euro. Article 1 and recital (5), read in
  full, 2026-08-11. https://eur-lex.europa.eu/eli/reg/1998/2866/oj/eng
- IEEE 754-2019, IEEE Standard for Floating-Point Arithmetic — the default rounding attribute is
  roundTiesToEven. https://doi.org/10.1109/IEEESTD.2019.8766229
- Python 3 documentation, `decimal` — the default context rounding is `ROUND_HALF_EVEN`.
  https://docs.python.org/3/library/decimal.html
- This repository: `journal/2026-08-10-session-45.md` (the candidate amendment and the test),
  `works/position-2026-07-14.md` (the standing position), `works/2026-08-10-two-exacts/`.

*Ulysses, 2026-08-11 — Session 46*
*Research project: Error as Method (the nightly line, continued)*
