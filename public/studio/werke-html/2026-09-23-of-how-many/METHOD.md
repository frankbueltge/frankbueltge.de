# OF HOW MANY — method, and what it does not support

## 1. What is computed

A **printed percentage** is the string a report carries: a number with nought, one or two
decimal places. A **pair** is the two integers behind it, *k* of *n*. The census asks, for
every printed percentage and every *n* up to 2 000, which *k* — if any — would print it.

Three rounding rules are implemented, from their definitions:

| rule | a ratio exactly on a boundary |
|---|---|
| round half away from zero | goes to the larger digit |
| round half to even | goes to the neighbour whose last digit is even |
| truncate | the tail is discarded, boundary or not |

Everything is **exact integer arithmetic**. A printed value is `100·k·10^d` divided by `n`
with remainder, and twice the remainder is compared with `n` to settle the last digit. No
floating-point number appears in the census. This is not fastidiousness: a binary double
rounds by a fourth rule of its own, and that rule is a different subject from this one.

## 2. The floor, computed two ways

The **floor** of a printed value is the smallest `n` for which some `k` prints it.

1. **Brute force.** Walk every pair up to n = 2 000 and record the first `n` that reaches
   each value. Complete for nought and one decimal places; at two decimals it reaches
   9 987 of the 10 001 values, the other 14 having floors beyond 2 000.
2. **Continued fraction.** The set of ratios that print a given value is an interval. The
   fraction with the smallest denominator inside an interval is found by a Stern-Brocot
   descent — take the integer part off, invert, recurse — which searches nothing.

The two agree on **every value the brute force reaches**: 101 of 101, 1 001 of 1 001,
9 987 of 9 987. `verify.mjs` then recomputes all three by brute force in another language
and carries the two-decimal walk out to n = 10 000, which closes the remaining 14.

## 3. The interval, which is the whole subtlety

For truncation the interval is `[v, v+1)` over the scale. For a rounding rule it is
`(v−½, v+½)` with the endpoints settled by the rule:

- **half away from zero:** the lower endpoint belongs to the value, the upper does not.
- **half to even:** *both* endpoints belong to the value when its last digit is even, and
  *neither* when it is odd. A boundary below an even value rounds up into it; a boundary
  above an even value rounds down into it.

## 4. The four denominators

At `d` decimal places a ratio lands exactly on a boundary when `2·100·10^d·k / n` is an odd
whole number. Reduce `k/n` first. Then `n` must divide `2·100·10^d` and leave an odd
quotient — which means `n` must carry every factor of two in it. At one decimal place
`2·100·10 = 2000 = 2⁴·5³`, so `n` must be a multiple of 16 that divides 2000:
**16, 80, 400, 2000**, and there are no others. At nought decimals: 8, 40, 200. At two:
32, 160, 800, 4000, 20000.

The census does not take this on trust. It enumerates every boundary pair up to n = 2 000 at
each precision and compares the set of reduced denominators found with the set predicted;
they are equal at all three precisions, and `verify.mjs` checks the divisibility claim
itself for the four names and for nine denominators that are *not* among them.

## 5. A repair, kept on the record

The first version of the interval rule for round-half-to-even closed one endpoint and opened
the other — it treated the tie as belonging to a side rather than to a digit. It is wrong,
and the brute force caught it immediately: **5 floors differed at nought decimals, 14 at one,
46 at two**. The correct rule is in section 3, the fix is in `census.py` with the finding
written beside it, and the crosscheck that found it now runs on every build. The wrong
version is described here rather than deleted, which is this house's standing practice.

Two things follow that are worth stating. The disagreement was small — 65 of 11 103 floors —
and it was entirely in the values whose floor sits on a boundary, which are exactly the
values this work is about. And it was found by having two methods, not by inspection: the
second method was built to be a check, and it immediately was one.

## 6. What the page's picture is

A PNG 1 001 wide and 2 000 deep, two bits per pixel, four palette entries, written by hand
with the standard library's compressor — no imaging library is used, and none is needed.
Across: every one-decimal percentage. Down: every study size. Each cell is one of

- **dark** — impossible: no `k` at that `n` prints that value;
- **paper** — exactly one `k` prints it;
- **pale** — two or more do, so the numerator is unrecoverable;
- **red** — the rounding rule decides whether it is printed at all.

Red is painted over the other three, so the dark count in the picture (498 900) is the
impossible count (499 500) less the 600 impossible cells that are also boundary cells. Both
numbers are in `counts.json`, the page says which is which, and the verifier checks the
decomposition rather than the totals.

`verify.mjs` decodes the picture out of the page's own base64, inflates it, walks the
scanlines and compares **all 2 002 000 cells** against its own census. Zero disagree.

## 7. What the work does not support

- **It convicts nobody.** The arithmetic can say *this printed value cannot have come from a
  study of that size*. It cannot say *this number is wrong*, and section four of the page
  gives the reason in its own arithmetic: two honest people using different rounding rules
  disagree on 49.61 % of all possible reports.
- **The floor is a lower bound, not a recovery.** Where a floor and a real study coincide —
  as 4 of 9 may or may not do for the 44.44 % on the page — the page says the sentence does
  not tell us, and does not claim it.
- **The eight sentences are not a sample of anything.** They are percentages this house
  printed this week, chosen because a reader can check them against the bulletins they came
  from, plus two values chosen for being extreme. No inference about published literature is
  drawn from eight numbers.
- **The census stops at n = 2 000.** Every count of the form "how many study sizes remain
  possible" is a count up to 2 000 and is labelled as such on the page. The floors are not
  affected by the cutoff at nought and one decimal places; at two, fourteen of them lie
  beyond it and were computed by the other method and checked out to 10 000.

## 8. Reproducing it

```
python3 census.py     # the census → counts.json, data.json, fan.bin  (~7 s)
python3 build.py      # the page   → index.html
python3 build.py --check
node verify.mjs       # 183 checks
```

`fan.bin` is the raw class map, 2 MB, regenerated by `census.py` and not committed; its
digest is in `counts.json`, as is the digest of the PNG built from it.
