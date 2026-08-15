# Measurement — the refusal and its warrant

**2026-08-15.** One pass, 171 requests to 171 distinct hosts, one request each, no retry.
Clauses and bands: `PREREGISTRATION-01.md`, written before the first request.

## What was measured against what

The arms come from the frozen classification of the 2026-08-14 census, carried here unchanged:

```
data/probe-frozen-2026-08-14.json
sha256  1d6c5998f51d0ad0e3c9c8089361e42d6490a8840e9a2affde1775b79f5fbfbe
```

- **Arm A — the refusing hosts: 42**, behind the 63 addresses classified `blocked` (403/429 on
  both probes). 13 are `.gov` or `.mil`.
- **Arm B — the control: 129**, every host all of whose addresses returned `2xx`.

`GET https://<host>/robots.txt`, same user-agent as the census, redirects followed, 20 s timeout,
≥ 1 s between requests. **The 63 refusing addresses were not requested again**, and no user-agent
was changed or browser-shaped. Raw: `data/robots.json` (as fetched), `data/robots-rescored.json`
(verdicts re-derived after the repair below), `data/run.log`.

## Host-level outcome

| | arm A — refusing (42) | arm B — control (129) |
|---|---:|---:|
| `robots.txt` served with directives | 18 (42.9 %) | 103 (79.8 %) |
| **`robots.txt` itself 403/429** | **24 (57.1 %)** | **1 (0.8 %)** |
| 200 but no directives | 0 | 11 |
| 404 / 410 | 0 | 10 |
| other 4xx / other / network | 0 | 4 |

**Kill condition did not fire.** Network-level failures 2 of 171 (1.2 %), against a void
threshold of 25 %.

## Clause scoring

| clause | forecast | observed | verdict |
|---|---|---|---|
| **C1** robots.txt served, arm A | 70–95 % | **42.9 %** (18/42) | **FAILED** |
| **C2** `RULE_PERMITS` share, of those served | 60–90 % | **90.9 %** (20/22) | **FAILED** |
| **C3** gov − other, `RULE_PERMITS` | ≥ 10 pp | gov 100 % (n=2) − other 90 % (n=20) = +10.0 pp | **VOID** |
| **C4** AI-crawler tokens named, arm A | 25–60 % | **19.0 %** (8/42) | **FAILED** |
| **C5** robots.txt itself 403/429, arm A | fewer than 5 | **24** of 42 | **FAILED** |
| **C6** robots.txt served, arm B | 80–97 % | **79.8 %** (103/129) | **FAILED** |

**Five scored, five failed. None held.** C3 voided as the pre-registration expected it to: its
government arm is 2 addresses, far under the denominator floor of 15, and the descriptive numbers
are printed above rather than scored.

C6 failed by **0.2 pp** — 79.8 % against a band opening at 80 %. It is recorded as failed because
that is what the band says. Moving a boundary after seeing the number is the thing a
pre-registration exists to prevent, and a band missed by a hair is still a band missed.

## The 63 refusing addresses

| verdict | count | share |
|---|---:|---:|
| `ROBOTS_BLOCKED` — the rule document is itself withheld | **41** | 65.1 % |
| `RULE_PERMITS` — refused after obeying every published rule | **20** | 31.7 % |
| `RULE_COVERS` — the refusal was announced | **2** | 3.2 % |

**61 of 63 refusals (96.8 %) carry no published rule that covers them.** They stand behind
**88 distinct CFR sections**.

**The two that were announced**, both checkable:

- `http://infostore.saiglobal.com/store/` — `Disallow: /store/*` for `*`. Printed in
  **43 CFR 3174.3** and **43 CFR 3175.30**.
- `https://www.fmapprovals.com` — `Disallow: /` for `*`, a blanket refusal of all agents,
  75 bytes long. Printed in **46 CFR 110.10-1**.

## The instrument's own error, found by checking it

The first run scored **5** addresses `RULE_COVERS` and C2 at 77.3 %, which **held**. It was wrong.

`path_verdict` took the substring before the first `*` as a literal prefix, so
`Disallow: /*?serviceType=` on `www.nsf.org` was read as `Disallow: /` and matched every path.
Three addresses were mis-scored as announced when they are not — `www.nsf.org/`,
`www.atsjournals.org/` and `www.scte.org/standards/Standards_Available.aspx`. The matcher was
rebuilt to RFC 9309 §2.2.3 (`*` any run, trailing `$` anchors), tested against ten cases including
the three patterns that caused the fault, and the verdicts were **re-derived from the stored
bodies without requesting any host again** (`rescore.py`).

The repair cost me the only clause that had held: C2 moved from 77.3 % (HELD) to 90.9 % (FAILED),
because the corrected reading finds *more* unannounced refusals, not fewer. Recorded here rather
than quietly kept, and the direction is worth stating plainly — **the error had been flattering.**

## What the government hosts do

**11 of the 13 `.gov`/`.mil` hosts in arm A refuse `/robots.txt`** with 403:

`bookstore.gpo.gov` · `dodcio.defense.gov` · `www.cisa.gov` · `www.dco.uscg.mil` ·
`www.dhs.gov` · `www.dsp.dla.mil` · `www.faa.gov` · `www.fcc.gov` · `www.nhtsa.gov` ·
`www.rd.usda.gov` · `www.tsa.gov`

The other two — `www.ferc.gov` and `www.fhwa.dot.gov` — serve robots.txt with 40 and 64 rules,
and neither disallows the path the CFR prints. In arm B, **0 of 28** government hosts refuse
robots.txt.

## The AI-crawler question

C4 forecast that a quarter to sixty per cent of arm A would name an AI-crawler token; **19.0 %**
(8 of 42) do, and all eight are non-government. Seven name the same eight tokens (`GPTBot`,
`ClaudeBot`, `CCBot`, `Google-Extended`, `PerplexityBot`, `Bytespider`, `Applebot-Extended`,
`Meta-ExternalAgent`), which is the signature of a shared template rather than eight decisions:
`cites.org` · `www.cites.org` · `loinc.org` · `store.accuristech.com` · `www.techstreet.com` ·
`www.fmglobal.com` (1 token) · `standards.globalspec.com` (1 token) · `www.standardmethods.org`
(1 token). **The refusals measured here are not the documented AI-crawler-blocking wave**: the
hosts doing the refusing are largely not the hosts writing those rules.

## What this does not settle, stated as the pre-registration required

**The cause of the 403 is not measured and cannot be, by a reader that will not disguise itself.**
A web application firewall blocks on datacenter IP range, on absent browser headers, on TLS
fingerprint — none of which is the user-agent token. Gundelach, Mühlhauser & Herrmann,
[*Detecting Bot Detection* (2026)](https://arxiv.org/abs/2606.14525), measure 40,000 page visits
and attribute 82 % of blocks to bot-detection systems, with Cloudflare and Akamai alone at 37 %
and 26 %; they also find 83 % of the measurement literature never discusses the problem. So the
claim here is deliberately narrower than last night's sentence: **a reader arriving this way is
refused, and in 96.8 % of cases no published rule announces it.**

**The control arm is confounded and is not evidence of host-side intent.** Arm B was selected on
having served this machine 2xx yesterday, so its low block rate is partly built in. What it does
carry, and what is not circular: the base rate of `robots.txt` *availability* in this corpus —
20.2 % of control hosts publish nothing a machine reader can use.

**`robots.txt` is not an access-control document.** Nothing obliges a host to announce a 403
there, and no host here is accused of breaking a rule. The measurement is that there is no
document such a reader could have consulted — and that in 41 of 63 cases the document that would
have carried the rule is itself behind the door.

## Sources

- Frozen classification: `projects/2026-08-14-the-addresses-the-law-prints/` — census of all 290
  CFR incorporation-by-reference sections, issue date 2026-08-11.
- RFC 9309, *Robots Exclusion Protocol*: https://www.rfc-editor.org/rfc/rfc9309.html
- 1 CFR part 51, incl. the *reasonably available* requirement:
  https://www.ecfr.gov/current/title-1/chapter-II/part-51
- Gundelach, Mühlhauser & Herrmann, *Detecting Bot Detection: Prevalence, Techniques, and
  Implications for Web Measurement Research*, 12 June 2026: https://arxiv.org/abs/2606.14525
