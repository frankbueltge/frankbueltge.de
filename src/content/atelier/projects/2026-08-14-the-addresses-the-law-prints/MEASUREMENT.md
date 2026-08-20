# Measurement — the addresses the law prints

Every number here is produced by the three scripts in this directory from the stored inputs.
Rules E1–E6, P1–P5 and clauses D1–D5 are fixed in `PREREGISTRATION-01.md`, written before any of
this ran.

## The corpus

- **Enumeration.** eCFR versioner structure API, all 50 CFR titles, issue date **2026-08-11**,
  walked 2026-08-14. Sections whose `label_description` contains *incorporation by reference*:
  **290**, in **30 of the 50 titles**. No title unreachable.
- **Distribution.** 46 CFR 129 · 40 CFR 31 · 33 CFR 17 · 49 CFR 14 · 47 CFR 13 · 14 CFR 11 ·
  16 CFR 9 · 17 CFR 7 · 24 CFR 7 · 29 CFR 6 · 21 CFR 5 · 43 CFR 5 · 15 CFR 4 · 23 CFR 4 ·
  38 CFR 3 · 45 CFR 3 · the rest 1–2 each.
- `sections.json` — sha256 `f30f021fd0d58979dad64d040e8cc2f4b0a6a8d9bdfd15e9f8d83432ced87e62`.

## The freeze (the blind step)

Section text fetched for **290/290** sections (per-section sha256 and byte length in
`data/urls.json` → `manifest`). Extraction, normalisation and host classification ran on that text
and were written to disk **before any request was made to any host in the corpus**:

- `data/urls.json` — sha256 `36ce90adbfab360f9f07c3d132c6064b7f607fa19b32d27e4ce7add1452bf07f`
- **1,018 printed occurrences**, **306 distinct** addresses (E4), on **203 distinct hosts**
- Host class (E5, hostname alone): **104 federal** (`.gov`/`.mil`) · **202 other**
- **250 of 290 sections print at least one address**; 40 print none.

Both arms of D3 cleared the ≥ 30 minimum before any probe result existed.

## The probe

Run 2026-08-14 from one network. Every non-2xx address probed twice (P2, ≥ 60 s apart); the host
root of every failure probed as well (P5). Full per-URL record with both probes:
`data/probe.json`.

| outcome | distinct URLs | share of 306 |
|---|---:|---:|
| `2xx` | 206 | 67.3 % |
| `blocked` (403/429 twice) | 63 | 20.6 % |
| `4xx` | 14 | 4.6 % |
| `5xx` | 4 | 1.3 % |
| `network` | 19 | 6.2 % |

**42 of 290 sections** print at least one address that failed. The 37 failures stand behind **72**
printed occurrences; the 63 blocked addresses stand behind **197**.

## Clause scoring

| clause | forecast | observed | verdict |
|---|---|---|---|
| **D1** distinct URLs | 250–1000 (point 550) | **306** | **HELD** |
| **D2** resolve, excl. blocked | 75–92 % (point 85 %) | **206/243 = 84.8 %** | **HELD** |
| **D3** other − federal ≥ 10 pp | ≥ 10 pp | other 86.96 % (n=161) − federal 80.49 % (n=82) = **6.5 pp** | **FAILED** |
| **D4** network-level host failures | fewer than 5 | **18** by the pre-registered rule; **13** confirmed independently | **FAILED** |
| **D5** failing URLs whose host root is 2xx | ≥ 75 % | **17/37 = 45.9 %** | **FAILED** |

No clause was VOID: D2's denominator is 243, D3's arms 82 and 161, D5's 37 — all ≥ 30. **Two
held, three failed.**

D3's direction was right and its size was not; the forecast was a magnitude and it is scored as
one. D5's sensitivity, marked post-hoc: counting a host root that answers 403/429 as a living host
too raises it to 19/37 = 51.4 %, still far below the forecast.

## Post-hoc: is `network` real, or is it my own network?

Not pre-registered, and it does not change a score. Nineteen addresses failed at the network
level, and this machine reaches the internet through a proxy — a proxy failure and a dead host
look alike in a curl exit code. So each of the 18 hosts was resolved **independently of the
proxy**, three times, with live and nonsense controls (`www.astm.org` → resolves,
`this-host-does-not-exist-9tq.example` → does not):

- **13 hosts have no address record at all**, on every attempt, carrying **14** of the 19 URLs:
  `assist.daps.dla.mil` · `fedspecs.gsa.gov` · `healthit.hhs.gov` · `techstreet.com` ·
  `ulstandards.ul.com` · `unp.un.org` · `www.abyinc.org` · `www.global.ihs.com` · `www.hitsp.org` ·
  `www.ntl.bts.gov` · `www.ph.d.sc.org` · `www.policy.energy.gov` · `www.standardsinfo.net`.
  **Five are federal.**
- **4 hosts resolve.** `shop.csa.ca`, `www.aitc-glulam.org` and `www.radcoinc.com` fail at the
  connection or TLS layer — alive host, unreachable service, from here today. `www.usace.army.mil`
  resolves cleanly, so both of its probe failures were this machine's resolver and not the site:
  **one false failure in my own instrument, found by checking it.**
- **1 is not settled**: `www.nssn.org` returns a temporary-failure code on every attempt while its
  parent `nssn.org` resolves. Unresolved and left unresolved.

Verdicts, controls and raw codes: `data/dns.json`, produced by `check_dns.py`.

D4 fails under every one of these readings: 18, 15, or 13 is not "fewer than 5".

## Particulars worth the record

Each verified against the section's own stored text on 2026-08-14.

- **The government's own backstop, missed four times.** Four sections point at the National
  Archives' list of the places where incorporated material may be read free of charge — the
  literal answer to *"reasonably available"* — and all four miss it:
  `.../federal_register/code_of_federal_regulations/ibr_zlocations.html` (46 CFR 162.060-5) ·
  `.../federal-register/crf/ibr-locations` (40 CFR 282.2) ·
  `.../federal-regster/cfr/ibr-locations.html` (16 CFR 1450.3) ·
  `.../federal-register/cfr/ibrlocations.html` (47 CFR 90.384). All four return 404;
  `https://www.archives.gov/federal-register/cfr/ibr-locations.html` returns 200.
- **`www.Ph.D.sc.org/`** — printed in **45 CFR 170.299** as the website of the Public Health Data
  Standards Consortium. Neither that host nor `phdsc.org` resolves. A hostname containing "Ph.D."
  is in the Code of Federal Regulations.
- **`healthit.hhs.gov`** — no address record. It is printed in 45 CFR 170.299 as the *"available
  at"* route to two incorporated specifications, in the same section that elsewhere uses the live
  `healthit.gov`.
- **`techstreet.com`** — printed bare in four OSHA sections (29 CFR 1910.6, 1917.3, 1918.3,
  1926.6); no address record. `www.techstreet.com` resolves, redirects to
  `store.accuristech.com` and answers 403.
- **Five federal hosts with no address record** are printed in binding regulation:
  `assist.daps.dla.mil` (33 CFR 183.5) · `fedspecs.gsa.gov` (46 CFR 160.171-3) ·
  `healthit.hhs.gov` (45 CFR 170.299) · `www.ntl.bts.gov` (23 CFR 650.317) ·
  `www.policy.energy.gov` (10 CFR 300.13).
- **The known one.** NERC's `EOP-002-3` in 40 CFR 60.17, found 404 post-hoc on 2026-08-13, is one
  row of this corpus and is claimed as no discovery here. It returned 404 again.

## Sources

- eCFR versioner API, issue date 2026-08-11: `https://www.ecfr.gov/api/versioner/v1/`
- 1 CFR part 51 (the incorporation-by-reference rules, incl. *reasonably available*):
  `https://www.ecfr.gov/current/title-1/chapter-II/part-51`
- Office of the Federal Register, IBR locations:
  `https://www.archives.gov/federal-register/cfr/ibr-locations.html`
- NIST, Standards Incorporated by Reference database:
  `https://www.nist.gov/standardsgov/standards-incorporated-reference`
