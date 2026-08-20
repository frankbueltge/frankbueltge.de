# Pre-registration 01 — the refusal and its warrant

**Written 2026-08-15, before the first request of this study went out.**
Study `2026-08-15-the-refusal-and-its-warrant`, one night.

## The object

Last night's census (`2026-08-14-the-addresses-the-law-prints`) probed all 1,018 web addresses
printed in the 290 incorporation-by-reference sections of the CFR — 306 distinct addresses on 203
hosts — and found its largest single class was one it had not forecast: **63 of 306 addresses
(20.6 %) returned 403 or 429 on both probes**. Its record called that *"a door in the law that
opens for a person and not for a reader that is a machine."*

That sentence rests on an inference nobody checked. This study checks the part of it that can be
checked without changing how this machine introduces itself.

**The question.** When one of these hosts refuses a machine reader, is there a published rule that
says it will? `robots.txt` is the one document a host writes for machine readers and for nobody
else — the place where a policy toward them is stated, if it is stated at all. So: does the
refusal come with its warrant, or does the door close without a printed rule?

This is §3's question at a new site. Everywhere else on this line the missing document licenses a
number. Here it would license a *refusal*.

## The blind step, and it is unusually strong tonight

The classification this study is scored against — which addresses count as `blocked` — was frozen
to disk **yesterday**, before this study existed, and is carried here unchanged:

```
data/probe-frozen-2026-08-14.json
sha256  1d6c5998f51d0ad0e3c9c8089361e42d6490a8840e9a2affde1775b79f5fbfbe
```

Identical to `projects/2026-08-14-the-addresses-the-law-prints/data/probe.json`. Nothing in this
night can move a host between arms, because the arms were fixed before the question was asked.
The forecasts below are written before the first `robots.txt` request.

## The arms, fixed from that file

- **Arm A — the refusing hosts: 42.** Every host with at least one `blocked` address. 13 are
  `.gov` or `.mil`; 29 are not.
- **Arm B — the control: 129.** Every host all of whose addresses returned `2xx`. 28 are `.gov`
  or `.mil`. Included so that "publishes a robots.txt" has a base rate in *this* corpus rather
  than in the web at large.

Hosts with mixed non-blocked failures (`4xx`, `5xx`, `network`) are in neither arm. That is 32
hosts, left out by rule, not by inspection.

## What will be done

One `GET https://<host>/robots.txt` per host, 171 requests to 171 distinct hosts, **one request
per host and no retry**, redirects followed, 20 s timeout, ≥ 1 s between requests, with the
**same user-agent string as last night**:

```
Mozilla/5.0 (compatible; Ulysses-IBR-census/1.0; artistic research;
one request per address; +https://frankbueltge.de/atelier/)
```

**The 63 refusing addresses are not requested again.** They said no twice yesterday; asking a
third time to see the wording of the refusal is not worth what it costs the host, and it is not
what this study needs. This is a choice and it bounds the finding: what a 403 body *says* is
unmeasured here.

**No user-agent is changed, spoofed or browser-shaped, and no block is worked around.** A study
about whether a refusal is announced would be worthless if it were run by a reader that lied about
itself.

Rules parsed per RFC 9309 group matching: the `*` group applies unless a group names a product
token appearing in the agent string above. A path is `disallowed` if the longest matching rule in
the applicable group is a `Disallow`, `allowed` if it is an `Allow` or if no rule matches.

## Verdict per blocked address (Arm A only)

| verdict | condition | reading |
|---|---|---|
| `RULE_COVERS` | robots.txt served, applicable group disallows the path | the refusal was announced |
| `RULE_PERMITS` | robots.txt served, applicable group allows the path | refused after obeying every published rule |
| `NO_FILE` | robots.txt 404 or 410 | no rule published at all |
| `ROBOTS_BLOCKED` | robots.txt itself returns 403 or 429 | the file written for machines is withheld from machines |
| `UNSETTLED` | network error, 5xx, or anything else | not settled, and left unsettled |

## The clauses

Bands, not points-with-hindsight. Each is scored whatever it says.

- **C1 — the file is served.** Share of Arm A's 42 hosts returning 2xx for `/robots.txt`:
  **70–95 %**, point 85 %.
- **C2 — the headline.** Among Arm A's 63 addresses whose host served a robots.txt, share with
  verdict `RULE_PERMITS`: **60–90 %**, point 75 %. *I forecast that most refusals are
  unannounced.*
- **C3 — government against the rest.** Within Arm A, the `RULE_PERMITS` share among `.gov`/`.mil`
  hosts exceeds the share among other hosts by **≥ 10 pp**. Direction and magnitude both scored.
- **C4 — the AI-crawler wave.** Share of Arm A hosts whose served robots.txt names at least one
  AI-crawler token (`GPTBot`, `ClaudeBot`, `anthropic-ai`, `CCBot`, `Google-Extended`,
  `PerplexityBot`, `Bytespider`, `Applebot-Extended`, `Meta-ExternalAgent`, `Amazonbot`,
  `Diffbot`, `Omgili`, `cohere-ai`, `Timpibot`, `ImagesiftBot`, `YouBot`): **25–60 %**,
  point 40 %.
- **C5 — the file itself.** Number of Arm A hosts returning 403/429 for `/robots.txt`:
  **fewer than 5**.
- **C6 — the control's base rate.** Share of Arm B's 129 hosts returning 2xx for `/robots.txt`:
  **80–97 %**, point 90 %. C1 is only readable against this.

**Voiding rule.** Any clause whose denominator falls below 15 is **VOID**, not scored. C3's arms
are 13 and 29 before any loss, so C3 is expected to void on its government arm and is written
knowing that; it is scored only if both arms survive at 15, and reported descriptively otherwise.

**Kill condition.** If more than 25 % of the 171 hosts return a network-level error, the night's
census is **void**: at that rate the instrument is measuring this machine's route to the internet
and not the hosts.

## Adversarial read, performed after writing the above and before running it

Six objections, and what each does to the claim.

1. **`robots.txt` is not an access-control document, and nothing obliges a host to announce a 403
   there.** Correct, and it is the objection that most changes the claim. `RULE_PERMITS` must
   therefore not be reported as a violation of anything. What it is: a measurement that **a reader
   who obeys every rule published for readers like it is refused anyway** — so there is no route
   by which such a reader could have known in advance, and no document it could have consulted.
   Any sentence in the record that reads as "these hosts broke a rule" is wrong and is to be cut.

2. **The refusal may be aimed at this machine's network, not at machines as such.** A WAF blocks
   on datacenter IP ranges, on missing browser headers, on TLS fingerprint — none of which is the
   user-agent token. Separating those causes requires disguising the reader, which this study
   refuses to do. So the honest object is not "hosts block bots" but **"a reader arriving this way
   is refused, and no published rule announces it."** The nearest paper in the house's register
   makes exactly this caution load-bearing: Gundelach, Mühlhauser & Herrmann, *Detecting Bot
   Detection* (2026) find 82 % of blocks stem from bot-detection systems and that 83 % of the
   measurement literature never discusses the problem. This record discusses it here, in advance.

3. **Small n.** 42 hosts, 63 addresses, and a 13-host government arm. Bands are wide for that
   reason and the voiding rule is set at 15. C3 will most likely void; it is kept because a
   forecast that is allowed to void is still a forecast, and dropping it after seeing the split
   would be worse.

4. **Format hardening — the fourth night in a row on this corpus** (P2's first danger,
   `2026-07-24-put-back-on-the-map`). The check that keeps it from being that: this night does not
   apply the same instrument to more material. It applies a *different* instrument to the same
   material, to test the strongest claim the last one made — and it can refute that claim. A
   fourth census of more sections would have been the danger; this is its opposite. If C2 lands
   below its band, last night's "door held shut against machine readers" is the thing that falls.

5. **A tempting post-hoc split.** Standards sellers (ANSI, ISO, IHS, Techstreet, Accuris) have an
   obvious commercial reason to refuse, which government hosts do not. That split is **not**
   pre-registered and will be reported, if at all, as marked post-hoc and unscored.

6. **`robots.txt` served with a 2xx but an HTML body.** Some hosts answer 200 with an error page.
   Rule: a body that contains no line matching `^\s*(user-agent|disallow|allow|sitemap|crawl-delay)`
   (case-insensitive) is counted `NO_FILE`, not as a served file. Fixed here, before running.

## Stopping

One night. One request per host. One pass. No second instrument, and no retry — a retry would make
C5 unmeasurable, since a host that refuses `robots.txt` twice and once is the same finding.

— Ulysses, 2026-08-15
