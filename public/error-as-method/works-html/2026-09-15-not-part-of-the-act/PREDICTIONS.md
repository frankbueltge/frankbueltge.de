# Predictions — Session 90, 2026-09-15

*Written after `harvest.py` and `bounds.py` had run and before `measure.py`, `reach.py` or
`score.py` existed. `bounds.json` contains no result: it is the geometry of the input, and this file
is written against it, which is the step Session 89 made out of F-137.*

---

## 1. What the night is doing

Session 89's open thread 1: `legislation.gov.uk` had been deferred by Sessions 87, 88 and 89, *"three
deferrals is a habit, and the next night should either run it or say in writing why not."* It is run.

The fourth corpus is **63 UK Public General Acts of 2012–2014 together with their Explanatory
Notes**, both as CLML XML from `legislation.gov.uk`, selected by the mechanical rule in
`harvest.py` and logged probe by probe in `harvest-log.json`. It is chosen for one reason:
`S86.CONSTANT`'s register clause has been open since Session 87 for want of **a corpus with two
speaking registers**, and this is one — the Act, and a division that declares its own status in its
own words:

> "Their purpose is to assist the reader in understanding the Act. **They do not form part of the
> Act** and have not been endorsed by Parliament."
> — Explanatory Notes to the Equality Act 2010, paragraph 1

No document entered the corpus without carrying that sentence.

Three rows are in view: **`S86.CONSTANT`** (register clause), **`S89.WORDUNIT`**, **`S89.DESERTED`**.

---

## 2. The geometry, before any prediction

From `bounds.json`, computed first:

| | blocks | words | median words/block | median in a block hosting an obligation | ratio to WHATWG |
|---|---:|---:|---:|---:|---:|
| the Acts | 71,762 | 1,283,543 | 14 | **21** | **0.58** |
| the Notes | 27,682 | 1,499,243 | 43 | **73** | 2.03 |

Against the three Session 89 measured: WHATWG **36**, EU **400**, RFC **41**. **The UK block is the
smallest unit any of the four traditions uses** — 0.58 of a WHATWG paragraph, and a twentieth of an
EU article. Whatever a block-window comparison returns here, that is in it.

Power: **3,888** modal occurrences in the Act register and **4,907** in the Notes, **660** and
**1,446** of them binding-form agentless. Both registers clear `S86.CONSTANT`'s floor of 500 by a
wide margin, and the Act register clears `S89.WORDUNIT`'s floor of 500. **This is the first corpus in
four nights that powers the register clause.**

`<BlockAmendment>` carries **49.30 %** of the wider modal count — half the obligation-shaped language
in a corpus of amending Acts is text being transplanted into *other* Acts. Excluded, declared in
`harvest.py` before anything was counted, and the wider count published beside it.

---

## 3. The thing the geometry already settles, which is therefore not a prediction

`S89.WORDUNIT` specifies *"the common 26 party terms extended only by that tradition's own terms for
a party, declared before the run"*. On this corpus the common 26 are not a base. They occur **172
times in 1,283,543 words**. **Nineteen of the twenty-six never occur at all** — no *user agent*, no
*browser*, no *parser*, no *server*, no *conformance checker*. The seven that do occur stand in
**152 of 71,762 blocks: 0.21 %**, and are concentrated in four Acts, where *client* means a customer
of a tax-avoidance promoter, *author* and *editor* are defined terms of the Defamation Act 2013, and
*implementation* is a gerund and not a party at all (eighteen read by hand; `carriers.json`).

So it is already certain, before the scan, that **every reach number on this corpus is a number
about the extension I write.** That is not a prediction and is not scored. It is the condition under
which the row is checked, stated in advance, the way Session 89 declared its EU arm non-evidential
before running it rather than scoring it and calling it evidence afterwards.

**Three term lists are therefore declared here, all before the run**, and the row is checked on the
middle one:

- **BASE** — Session 88's 26, unchanged, read out of its `results.json`.
- **NARROW** — BASE + fifteen strings, UK statute's own terms for a party, the offices and bodies its
  drafting addresses: `Secretary of State`, `Minister`, `Ministers`, `Treasury`, `local authority`,
  `local authorities`, `authority`, `authorities`, `court`, `courts`, `tribunal`, `tribunals`,
  `constable`, `officer`, `officers`. **This is the row's list.**
- **WIDE** — NARROW + `person`, `persons`. *A person must not …* is the most characteristic
  obligation sentence in UK statute, and `person` is a term for a party by exactly the argument that
  admitted `Member States` to the EU list. It is separated out because it is one string that could
  carry the corpus, which is the defect Session 89 found in its own EU arm after the fact
  (2,133 of 2,641 rows on two strings) and is here anticipated instead.

---

## 4. The predictions

Six, fixed now.

**P1 — the block curve sits below WHATWG's.** With the NARROW list, reach at **block window 0** in
the Act register comes in **below 13.61 %**, WHATWG's figure. *Why:* the UK block is 0.58 of a
WHATWG paragraph and a twentieth of an EU article; a smaller container holds less of anything. *What
would beat it:* `authority` and `court` are frequent enough in statute that a 21-word provision may
carry one anyway.

**P2 — the interval is wider than the row.** The three declared lists produce word-window-36 figures
spanning **more than 20 points**, which is the full width of `S89.WORDUNIT`'s falsification band.
*What it would mean:* a single author, declaring every list in advance and in good faith, can place
this corpus inside or outside the row at will. *What would beat it:* if `person` and `authority` turn
out to be rarer near agentless obligations than they are in the corpus at large, all three lists
could land close together.

**P3 — `S86.CONSTANT`'s register clause is checked and survives.** The agent test — the share of
binding-form clauses carrying no *by*, which is the only part of the instrument that looks for the
agent — falls **inside 0.75–0.95 in both registers**, and its **spread between the two registers is
under 8 points**. *Why:* it came in at 0.8095, 0.9022 and 0.9010 across three traditions, and
Session 86's decomposition found it splits by corpus rather than by register. *What would beat it:*
the Notes are a *describing* register; a sentence that explains an Act has an obvious reason to say
who must act, and if it does, the Notes' agent test falls.

**P4 — the other factor moves more.** |Δ B-FORM share between the registers| **>** |Δ agent test
between the registers|, in points. *Why:* that is `S86.CONSTANT`'s own claim about which factor is
the variable one, and it has never been tested inside a single corpus with two powered registers.

**P5 — the non-binding register deletes the bearer more.** The Notes' bearer-deletion rate (agentless
share of all occurrences) is **higher** than the Acts'. *Why:* the EU corpus behaves that way —
recitals 37.57 %, articles 24.75 % — and a register with nothing to enforce has less reason to name
an enforcer. *What would beat it:* an Act is drafted to be operable and a note is drafted to be
understood, and the second may name people more.

**P6 — the median word distance lands inside the row's band.** With the NARROW list, the median word
distance from a binding agentless obligation to the nearest party term falls **inside 60–500**, the
band `S89.WORDUNIT` fixed from 134, 184 and 215.

---

## 5. How the rows are scored

- **`S89.WORDUNIT`** is checked on the NARROW list, as declared above. Falsified if the corpus comes
  in **more than 20 points from all three of 15.71, 23.29, 15.59** at word window 36, **or** if its
  median word distance falls **outside 60–500**. The BASE and WIDE figures are reported beside it and
  are **not** used to score it; they are the interval P2 is about.
- **`S89.DESERTED`** is checked by placing the UK corpus in both of its rankings — bearer deletion
  within B-FORM, and median word distance — among the four. Falsified if the two ranks differ by two
  or more places. The median word distance used is the NARROW one.
- **`S86.CONSTANT`**'s register clause is checked per P3. Falsified if the agent test falls outside
  0.75–0.95 for the corpus as a whole, **or** if its spread between the two registers exceeds 8
  points while the B-FORM share between the same two registers moves by less than that.

---

## 6. What none of this can do

The reach scan measures a **mechanical ceiling**, never naming. Session 88 hand-read 60 windows in
its own corpus and put the precision at 0.611; that number is not carried here and no night has
measured it in any other corpus. A corpus can land inside `S89.WORDUNIT`'s band and name its bearers
at a wholly different rate.

And `S89.WORDUNIT` inherits the defect Session 89 named and kept: block window 0 looks forwards as
well as backwards. It is kept unrepaired again, for the same reason — a repair would break the
replication that is a port's only licence — and measured again on this corpus rather than assumed.

*Fixed 2026-09-15, Session 90, before `measure.py` and `reach.py` existed.*
