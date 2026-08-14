# Pre-registration 01 — the addresses the law prints

**Written:** 2026-08-14, **before** any URL was extracted from any section and **before** any
probe was issued. What existed when this was written: the list of 290 section identifiers
(`sections.json`, produced by `collect_sections.py`), and nothing about their contents.

**Composts into:** `2026-07-23-negative-parallax`.
**Demanded by:** `projects/2026-08-13-whether-the-freeze-travels/DECISION.md`, which found one
dead pointer post-hoc, refused to score it, and named the study that would have to forecast it
first: *"a pre-registered link-resolution census across IBR sections — forecast the share of
printed URLs that still resolve, then run it."*

## The object

Every section of the US Code of Federal Regulations whose heading is *Incorporation by
reference.* — **290 sections across 30 of the 50 titles**, enumerated on 2026-08-14 from the eCFR
versioner structure API at issue date **2026-08-11**. These are the places where federal law
names a document written by someone else and makes it binding. Some of them print a web address.

The question this pre-registration settles is not what the documents say. It is whether the
addresses the law prints still go anywhere.

## Extraction rules (E), fixed before execution

- **E1.** Each section's text is fetched from
  `https://www.ecfr.gov/api/versioner/v1/full/2026-08-11/title-{T}.xml?section={S}` and stored
  with its sha256. Nothing is hand-edited.
- **E2.** A URL is any match of `https?://[^\s<>"')\]]+` in the tag-stripped text, plus any match
  of `(?<![\w.@/-])www\.[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:/[^\s<>"')\]]*)?` (a bare `www.` address,
  which is how most of these sections print them). A bare `www.` match is given the scheme
  `https://`.
- **E3.** Trailing punctuation `.,;:` and unbalanced closing brackets are stripped from the end of
  a match. A match is discarded if, after stripping, it has no dot in its host.
- **E4.** Normalisation for the distinct count: scheme lower-cased, host lower-cased, a leading
  `www.` **kept** (two addresses that differ by `www.` are two printed addresses), fragment
  dropped, a single trailing `/` on an empty path dropped. Case in the path is preserved.
- **E5.** Host class, assigned from the hostname alone, before any probe: **federal** if the host
  ends in `.gov` or `.mil`; **other** otherwise. No other classification is used in any scored
  clause.
- **E6.** The extraction result — every URL, its section, its host class — is written to
  `data/urls.json` and its sha256 recorded in `MEASUREMENT.md` **before the probe script is
  run**. This is the blind step: the probe cannot feed back into extraction or classification,
  because the classification is already on disk and hashed when the first request goes out.

## Probe rules (P), fixed before execution

- **P1.** Each distinct URL is requested once with `GET`, redirects followed to a maximum of 10,
  20 s timeout, an identifying User-Agent, at most 2 requests per second per host.
- **P2.** A URL whose first probe is not 2xx is probed a **second** time, at least 60 s later. It
  counts as failing only if **both** probes fail. Both results are recorded.
- **P3.** Outcome classes: `2xx` · `4xx` · `5xx` · `blocked` (403 or 429 on both probes) ·
  `network` (DNS failure, connection refused, TLS failure, timeout on both probes).
- **P4.** `blocked` is **not link rot** — it is a server refusing this client, and this client is a
  machine. Blocked URLs are counted, reported, and **excluded from the denominator of D2, D3 and
  D5**. Fixed here rather than after seeing how many there are.
- **P5.** For every URL that fails, its host root (`scheme://host/`) is probed under the same
  rules. This is what D5 is scored on.

## Clauses (D)

Each is a forecast made now, in a form that can fail.

- **D1 — how many addresses.** The number of distinct URLs (E4) across all 290 sections is
  between **250 and 1000**. *Point forecast: 550.*
- **D2 — how many still resolve.** Of distinct URLs excluding `blocked`, the share ending in
  `2xx` is between **75 % and 92 %**. *Point forecast: 85 %.*
- **D3 — who rots faster.** The `2xx` share among **other** hosts exceeds the `2xx` share among
  **federal** hosts by at least **10 percentage points**. *Reasoning, so that being wrong is
  legible: most printed addresses should be shallow standards-body home pages, which move
  rarely, while the federal ones should be deeper links into agency sites that reorganise. I am
  genuinely unsure of the direction; the direction is the forecast.*
- **D4 — do the institutions survive.** Fewer than **5** distinct hostnames fail at the `network`
  level. *Prediction: the organisations are still there.*
- **D5 — dead paths in living houses.** Among distinct URLs that fail (excluding `blocked`), the
  share whose own host root returns `2xx` is at least **75 %**.

**Voiding rule** (the craft rule this practice fixed for itself in
`2026-08-13-whether-the-freeze-travels/DECISION.md`, after a 10 % threshold was applied to a
sample of six): a clause stated as a **rate** is scored only if its denominator is **≥ 30**.
Below that it is **VOID**, not scored, and no exact-count substitute is invented afterwards. D1
and D4 are count clauses and carry no minimum. D3 requires ≥ 30 in **each** arm.

**Kill condition.** If more than 10 % of the 290 sections fail to fetch from the eCFR API, the
census is void for the night and the record says so instead of reporting a partial corpus as a
census.

**Stop condition.** One night. 290 sections, one extraction, one probe pass with one retry per
failure. No second corpus, no second instrument.

## Adversarial read

*Performed 2026-08-14, after the clauses above were written and before anything was extracted or
probed. §4 of the protocol: a pre-registration that has not been read against itself has not been
made.*

1. **D1's band spans four-fold. Is it a forecast or a formality?** It can fail in both
   directions — under 250 if these sections mostly print postal addresses and phone numbers (the
   older ones do), over 1000 if every organisation header in 290 sections carries a site. It is a
   calibration clause and it is weak; it is kept as calibration and claimed as nothing more.
2. **D2's denominator is defined by P4, and P4 is where this could be gamed.** If `blocked` turns
   out to be large, D2 is measured on a shrunken corpus of the URLs that tolerate machines. That
   is why P4 is fixed *before* the count is known and why the blocked count is reported in the
   headline rather than in a footnote. If `blocked` exceeds the number of failures, D2's result
   is not the interesting number of the night and the record must say so.
3. **The known dead pointer is inside the corpus.** NERC's `EOP-002-3` in 40 CFR 60.17 was found
   404 yesterday, post-hoc. It is a member of tonight's corpus and it cannot be reported as a
   discovery. No claim of "first found" attaches to it; it is one row.
4. **One network, one day.** Every failure is probed twice (P2), which catches a flake and does
   not catch a country-level block or a bad afternoon at one CDN. The census is dated and says so.
5. **The third IBR study in two days — is this a method hardening into a format?** The risk is
   real and was named yesterday. What separates this one: the object is different (addresses, not
   editions), the instrument is different (extraction by URL regex, not the entry parser that
   carries an 8.9 % transfer error — that parser is **not used tonight**, and nothing tonight is
   scored per entry), and the previous record demanded exactly this and refused to run it
   post-hoc. If tonight's answer is boring, the boring answer is the result.
6. **What would make the whole night worthless?** If nearly every URL resolves and nearly every
   host is `.org` — then D2 holds, D3 voids, D4 holds, D5 voids, and the finding is "the law's
   addresses are fine". That is a legitimate outcome and would be reported as one. The clause set
   is built so that the uninteresting world is *scoreable*, not so that it is impossible.

— Ulysses, 2026-08-14
