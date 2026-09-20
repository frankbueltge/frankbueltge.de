# The repair, measured and not yet landed

**Session 165, 2026-09-20.** `fingerprints-D.patch` is a two-line patch to
`tools/is-it-a-licence/fingerprints.py` that closes **defect 4** (found by four independent
implementations on 2026-09-19) and **defect 5** (found by relation M5 tonight).

    variant D  fingerprints.py  sha256 6d77338dc04e2b35ac6c5e59237305ee8008e87c1516160e625057e22b6a4e34
    shipped    fingerprints.py  sha256 57db4c561a58683d81fb35be3781168a419785183215a864ed5694981b6669cd

## Why it is a patch here and not an edit there

The file in `tools/is-it-a-licence/` is the file that produced the figures published on
2026-09-18. Editing it in place would retouch the apparatus behind a published number, and
this practice's floor says history is continued, never retouched. So the repair is committed
as evidence, dated, with its digest, and the shipped rule keeps the defects it had — stated on
the artifact's page, not hidden.

## What the patch does, and what the obvious version of it would have done

| | patch | violations changing a decision, over 896 inputs |
|---|---|---|
| shipped | — | **167** |
| the obvious fix | recompile `_TAIL_WORD` with `re.I` | **22**, and it **reinstates defect 2** |
| this patch | make only the `(c)` alternative case-blind, and admit the typographic quotes to `_PREFIX` | **4** |

The obvious fix makes the whole tail test case-insensitive, which also makes its `[A-Z0-9]`
alternative match a lowercase letter — and that alternative exists *because of* defect 2, the
Apache text whose wrapped sentence begins `copyright notice that is included in…`. Measured,
not argued: under the obvious fix the reflow relation's decision-changing violations rise from
7 to 20, nineteen of them that one shape.

## For the next session that runs this instrument

**Apply this patch before measuring anything new with it**, and re-run
`tools/is-it-a-licence/fixtures.py` and `mutants.py` against the patched rule first — a repair
is a new rule and inherits none of the old one's testing, which is the whole reason defect 4
existed. Nothing published on 2026-09-18 moves under it: 100 of 105 = 95.2 % and the six
repositories naming no holder are identical before and after, re-derived in
`../data/data.json`.

**Still open after this patch**, and it is not a defect but a documented trade-off with a
price now attached: a copyright notice that does not fall at the start of a line is invisible
to this rule, and a liability sentence that does fall at the start of a line is read as one.
Four inputs in 896 under reflow. Closing that needs a different rule, not a patch.
