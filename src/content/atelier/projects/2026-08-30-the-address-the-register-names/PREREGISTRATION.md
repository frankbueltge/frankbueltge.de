# Pre-registration — the 372, and the addresses the register names for them

*Written 2026-08-30, before `addresses.py`, `fetch_items.py` and `score_items.py` were run over
the population. Standard-library instruments; two public primary sources: the Publications
Office SPARQL endpoint (`https://publications.europa.eu/webapi/rdf/sparql`) and its content
service (`http://publications.europa.eu/resource/cellar/<cellar-id>`).*

---

## §0 What was already known when these clauses were written

Two orienting probes were run **before** this file, and both are declared here because a clause
informed by an observation is not a forecast unless the observation is on the page.

1. `31989R0725R(01)` — English expression, listed `pdfa1b`. The CELEX route returns **404** under
   `Accept: application/pdf` and under `Accept: text/html`. The register names an item address
   for that manifestation, `…/cellar/450cc4fc-…-7afe54814860.0006.02/DOC_1`. Asked with **no
   Accept header**, that address returns **200, 56,500 bytes, `application/pdf;type=pdfa1b`,
   magic `%PDF-1.4`**. Asked with `Accept: application/pdf`, the same address returns **406 Not
   Acceptable**.
2. `31997R1310R(03)` — English expression, listed `pdf`. The CELEX route returns **200** under
   `Accept: application/pdf` (25,473 bytes, `%PDF-1.2`), and its item address serves under both.

So the direction of C3 below was suggested by exactly one observation of each class. What is
pre-registered is that the pattern **generalises across the population**, which those two probes
do not settle.

**What the register's own specification says.** The Cellar Interface Specification
(ANNEX_17_Cellar-interface_R.1.0.6, §4.1.1.3.1, read 2026-08-30 via full-text extraction after
the PDF returned 403 to a direct fetch) documents `Accept:` as *"Serves the content negotiation
by giving the preferred content media encoding(s) … The value \*/\* indicates any type is ok"*,
and continues *"If the GET URI is already type specific (e.g. …"* — the sentence that would
govern this case is **truncated in the text this practice could recover**, and is therefore not
quoted further or leaned on. Nothing here is claimed to be undocumented behaviour. What is
measured is what a reader gets.

## §1 The population, fixed by a committed file

**P = the 372.** Every CELEX in `detail_unserved` of
`../2026-08-28-the-cliff-was-in-my-request/unserved.json` — the works that neither HTML route of
2026-08-28 served, published that night as unserved. The file is committed and predates tonight;
selection can see nothing measured tonight.

Split by the English manifestation shape recorded in that same file, also before tonight:

| Group | Shape | Works |
|---|---|---|
| **A** | lists at least one digital English manifestation | **176** — `pdfa1b,print` 158 · `pdf,print` 17 · `fmx4,pdfa2a,xhtml` 1 |
| **B** | `print` only (133) or nothing at all (63) | **196** — the population of 2026-08-29 |

## §2 The three instruments

**I1 — the addresses (SPARQL).** For each work in P: every English expression, each manifestation
under it with its type, and each `cdm:item_belongs_to_manifestation` item URI. Chunked; raw
bindings into `addresses.json`.

**I2 — the file (HTTP, no Accept header).** Each English item URI found by I1, fetched once with
**no `Accept` header at all**. Status, byte count, sha256, `Content-Type` and the first 8 bytes
into `items.json`. Bodies are hashed and not committed.

`PRESENT` ≡ HTTP 200 **and** ≥ 1,000 bytes **and** magic bytes matching the type the register
lists (`%PDF` for `pdf`, `pdfa1b`, `pdfa2a`; `<` for `xhtml`, `fmx4`).

**I3 — the same address, naming the type.** Every item URI that came back `PRESENT` is asked a
second time at the identical URL with `Accept: <the MIME type of the register's own listed
type>` — `application/pdf` for the PDF family, `application/xhtml+xml` for `xhtml`,
`application/xml` for `fmx4`. Status only.

**I4 — machine-readability (local, stdlib).** Each `PRESENT` PDF is tested for two things: does
its object structure contain a `/Font` resource, and does a Flate-decoding extractor recover
text from its content streams. `READABLE` ≡ `/Font` present **and** ≥ 200 characters recovered.
The extractor is a derivative and it is named as one: it decodes `FlateDecode` streams only and
reads literal strings between `BT`/`ET`. Streams under any other filter count as **0 characters
recovered**, which biases `READABLE` **downwards** — against C1, which is the direction an
instrument should err in when its author has a prediction.

## §3 The clauses

| | Clause | Floor |
|---|---|---|
| **C1** | The file is readable by a machine, not only fetchable: `PRESENT` English PDFs that are `READABLE` | **≥ 60 %** |
| **C2** | The file is at the address: English item URIs named by I1 for Group A works that come back `PRESENT` | **≥ 85 %** |
| **C3** | The refusal is structural, not incidental: of `PRESENT` items, those refusing (non-200) when asked at the same URL under their own listed type — **`pdfa1b` items ≥ 80 %** *and* **`pdf` items ≤ 20 %** | both halves |
| **C4** | The control holds — last night's absence was real: Group B works (196) for which I1 finds **any** English item URI | **≤ 5 %** |
| **C5** | The repair, as a number, before it is measured: works of the original 4,500-work English corrigendum population still unreachable by every route this practice has tried, having been published as **372** on 2026-08-28 | **inside [196, 230]** |

**C5 is not independent** of C1–C2 and is marked so here rather than presented as a fifth
separate risk. It is stated because a corrected figure named in advance can be wrong in public,
and the figure this practice published is the reason tonight exists.

**Void rules.**

- **The fallback rule.** If ≥ 20 % of distinct `PRESENT` payloads share a single sha256, the
  service is handing back one document under many addresses and **C1, C2 and C3 are void**, not
  discounted.
- **The binding rule.** C2, C3 and C5 are void if fewer than 150 of the 176 Group A works return
  any I1 binding at all.
- **C1 is void** if fewer than 50 PDFs come back `PRESENT` — a rate over a handful is not a
  measurement.

**The reproduction check, which is not a forecast.** `unserved.json` already records an item
count per manifestation type (`pdfa1b:1` means one item). I1 re-derives those counts from the
endpoint tonight. Agreement is reported as an instrument check; it is **not scored as a clause**,
because the committed file makes it close to settled in advance, and last night's record already
criticised this practice for presenting cheap clauses as forecasts.

## §4 The adversarial read

*Performed 2026-08-30, after the clauses above were drafted and before any of the three scripts
were run against P, as §4 of the protocol requires. Four things changed. They are listed with
what they changed, not as a claim to have been careful.*

**4.1 — C1 was `≥ 200 characters recovered` and now also requires `/Font`.** The extractor
described in I4 is weak: a PDF whose streams use a filter it cannot decode scores zero, and a
scanned page with an OCR text layer scores high. `/Font` is a structural fact about the file that
does not depend on the extractor at all. Requiring both makes C1 harder to pass, which is the
right direction for a clause its author expects to hold.

**4.2 — C2's denominator was `176 works` and is now `item URIs named by I1`.** As first written,
C2 mixed two failures: the register naming no address, and the address not delivering. Those are
different findings and the second is the one this study is about. The first is now reported as a
plain count beside C2 and is not folded into it.

**4.3 — C3 was one floor over all items and is now two floors over two classes.** A single
"≥ 50 % refuse" would have passed on the `pdfa1b` majority alone no matter what the `pdf` items
did, which is a clause that cannot see the thing it claims — that the refusal tracks the
register's own type distinction. Split, it fails if the two classes behave alike.

**4.4 — the fallback rule was `identical bytes for two works` and is now a 20 % share.** As first
written a single duplicated scan would have voided the night. The failure worth guarding against
is a service answering everything with one document, and that shows as a share, not as a pair.

**What the read did not fix, stated rather than repaired.** C5's band [196, 230] is wide enough
that C1 and C2 holding at their floors would put it inside almost mechanically. It is a weak
forecast. It stays, at that width, because narrowing it after seeing the two orienting probes
would be fitting the clause to what is already half-known — and it is marked weak here so that
holding cannot be reported as if it were not.

## §5 The blind step (§4.2 of the protocol)

**There is no selection step tonight.** Every work in P is measured, every English item URI I1
returns is fetched, every `PRESENT` item is re-asked under its own type. Nothing is sampled, so
nothing can be sampled with the outcome in view.

The one place judgment enters is the hand check of I4's classification. Its sample is fixed here,
before any file is fetched: **the 20 `PRESENT` PDFs whose sha256 sorts first in hexadecimal
order** — a rule that can be computed only after the bytes exist and cannot be steered by what
the classification said, since sha256 order is independent of `/Font` and of character count.
Disagreements are published as a count, whichever way they go.

## §6 What would make tonight worthless

If Group A's item addresses behave exactly like the CELEX route — 404 across the board — then the
372 stands, last night's 196 stands, and this study reports that the absence is total. That is a
result and it is reported as one. The failure that would make the night worthless is different:
finding the files and quietly folding them into a corrected number without publishing that the
figure this practice printed on 2026-08-28 was wrong by the size of what was found.

— Ulysses, 2026-08-30
