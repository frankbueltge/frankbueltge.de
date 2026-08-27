# USP assessment — Revisions (working title), 2026-08-27

Run because a site surface was asked about, and the USP duty is a test rather than an intention:
`src/lib/graph/graph.test.ts` lets nothing onto `/experiments` without a **verdict**, a **named
daylight** and **named prior art**, and `src/data/werke.currency.test.ts` goes red when a
description claims what the data refutes.

**This assessment does not ship anything.** It answers the two testable questions and then names
the one that is not testable and is the founder's.

---

## (a) Verdict

**UNIQUE (as a living instrument), with a stated boundary.**

Not unique as a subject: the threshold critique and the undercounting critique exist in political
science and are good. Unique as a **standing, dated, checkable register** of what an authoritative
record admitted to or removed from its own past, at what magnitude, and whether a reason was
published. No such register was found.

The boundary belongs in the verdict rather than beside it: the instrument can only watch keepers
who publish their own past versions, and of the candidates examined **two do** — which is itself
the finding (see the 2026-08-23 niche audit, addendum of 2026-08-27).

## (b) The machine bar — could only a machine do this?

Yes, and specifically: hold five released versions of a canonical dataset at once, diff them on a
key, locate every change inside a 167-page change document, and **prove by hash what each version
contained**. A human can do one such comparison; not five, not to the byte, not verifiably, and
not again next Monday without forgetting to.

The bar's inverse is also met, which matters more: the instrument caught **its own** two failures
only because it holds the provenance — a keeper renaming thirty-two columns, and a keeper
reformatting its change document — each of which had silently inverted a finding.

## (c) Named prior art — the neighbours

| Neighbour | What it holds | Why this is not it |
|---|---|---|
| **Mimi Ọnụọha**, *The Library of Missing Datasets* (2016 ff., ZKM, bitforms) | absence as material: datasets that should exist and do not | this watches a dataset that **does** exist and changes its own past |
| **Viégas & Wattenberg**, *History Flow* (IBM, 2003 ff., MoMA/Whitney) | revision dynamics of an **openly editable** record, visualised | change there is the medium's nature and visible by design; here it is silent and authoritative |
| **Michael Mandiberg**, *Print Wikipedia* (2015) | snapshot obsolescence as appropriation — "every knowledge claim is up for revision by anyone at any time" | same register, same openly editable source; no comparison of published versions |
| *Assessing Reporting Delays in ACLED Conflict Event Data* (arXiv 2603.25964) | the **front edge**: lag between occurrence and first inclusion, modelled | works the front edge and proposes no instrument; this works the back edge, and the two are kept apart per entry in the data |
| *Uncounted Dead* (J. Global Security Studies, 2025) · *The underreported death toll of wars* (arXiv, 2024) | statist bias and undercounting in conflict data | argue about the numbers; neither registers what a release did to an earlier release |
| **Our World in Data** | republishes UCDP where most readers meet it | surfaces **no** version changes at all — which is the reason the register has an audience |
| lakeFS, DVC and kin | data version control | version **your own** data for reproducibility; nobody in that literature watches someone else's |

## (d) The daylight, named

**A record that revises its own past, watched from outside, with the reason column shown empty.**

Concretely: across five UCDP releases, 30 of 31 changes are filed under one of the keeper's own
headings and **none carries a rationale**; EM-DAT publishes vintages and no ledger at all. Nobody
was found keeping that register, and the reason is in the addendum — almost no keeper publishes
retrievable vintages, so the question cannot be asked of them.

## (e) Currency-safe description

The currency test forbids a digit that ages. So the register's own prose states a **rule**:

> Records of the world's wars and disasters rewrite their own past. This watch holds every
> released version at once and keeps the account: what was admitted to an earlier year, what was
> removed from one, what changed size — and whether the keeper published a reason. In every
> release examined so far, the reason column has stayed empty.

No count, no year, no depth-in-years. The page derives those from the committed JSON.

---

## The question that is not testable, and is the founder's

**`/experiments` may be the wrong shelf.** It ranks *experiments* by research line. This is an
**instrument**, and the ecology v3 draft's first move is that instruments and works become
publicly distinct categories — "an instrument is presented as an instrument, never as a work" —
precisely because letting instrument output count as work was the category error it names.

So there are three placements and none of them is mine to pick:

1. **On `/experiments` now**, under COUNTER-MEASUREMENT. Passes both tests once the audit entry is
   added. Costs: it presents an instrument on the shelf of experiments, which is the blur v3 wants
   to end.
2. **Wait for v3.** If the instruments/works split is adopted, this is a clean first inhabitant of
   the instrument surface. Costs: v3 is a draft awaiting decision, and the register sits unseen
   meanwhile.
3. **Its own small surface**, outside the shelf — a page that is a register and says so. Costs: a
   new route and no precedent for it.

**What shipping would concretely require**, in whichever case: an entry in `src/data/werke.ts`
with a `line`, a route, this audit's (a)/(c)/(d) folded into `docs/audits/` so the graph test finds
a verdict, named daylight and prior art, the description above (or its successor) under the
currency test, `npm run graph:build`, and the watch workflow added to `deploy-cf.yml`'s
`workflow_run` list — which it is deliberately not in yet, because until a surface reads this data
a commit here has nothing to deploy.
