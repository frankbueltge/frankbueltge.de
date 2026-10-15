# Verification — the denominator

Session 156, 2026-09-09. What was checked, what broke, and what this apparatus still cannot do.
Pre-registration in `PREREGISTRATION.md`, committed before the first source was opened; nothing
below was written into it afterwards.

## 1. Defects found against ourselves, before any adversary

**D1 — two of our own quotes were mistranscribed, and our own checker caught them.**
The first run of `tools/completeness-census/verify_quotes.py` reported *QUOTE NOT FOUND* for both
passages attributed to Király's 2015 plan. The cause was our own extraction: that PDF's font places
the *fi* and *fl* ligatures at code points 0x02 and 0x03, and we had transcribed those bytes as
spaces ("N is the number of  elds de ned…"). The fix is a **documented substitution applied to both
sides of the comparison**, not a hand-edit of the quote: the mapping is read off the documents
themselves ("\x02elds" is "fields", "Work\x03ow" is "workflow") and is disclosed in the source
record's `quote_note`. **This is the same failure mode session 155 was stung by** — a quoted string
typed from a display rather than taken from the text — and this time a check caught it before the
page existed.

**D2 — our checker silently checked three quarters of what it claimed to.**
`check.py` parsed number keys with the pattern `[a-z0-9_]+`. Ten of the forty number spans on the
page carry keys with a capital letter — `S`, `P`, `N`, `groups_with_S`, `S_share_of_coded` and the
rest — and were skipped **in silence**, while the script printed "checked 30 rendered numbers" and
exited 0. Every one of the skipped keys is load-bearing: `P` is the count on which the headline
refutation turns. Fixed, and a guard added that compares the number of spans parsed against the
number of spans present, so an under-matching pattern now fails instead of passing quietly.
**A checker that quietly checks less than it advertises is worse than none**, because it is trusted.

**D3 — one candidate in our own list was misidentified.**
We recorded doi:10.1002/asi.20681 for a well-known information-quality framework paper. Queried
against a third-party index, that DOI resolves to a different paper on an unrelated topic. We
excluded the candidate and recorded the error rather than guessing the correct identifier from
memory — guessing is precisely what the evidence rule forbids, and a wrong DOI in a census of
sources is our defect, not the field's.

**D4 — our first PDF extractor returned 20 MB of plausible-looking nothing.**
Run against a 1.1 MB paper it produced 20,918,958 characters of text containing zero occurrences of
the word it was searching for: it was decompressing image streams and reading their bytes as
characters. Had we searched that output for a definition and found a coincidental match, we would
have quoted an image. Fixed by requiring `BT`/`ET` text-block markers and a mostly-printable body
before a stream is treated as text. A second pass added word-space reconstruction from TJ kerning
offsets, because before it every extracted quote ran the words together and **a quotation with the
spaces removed is not a quotation**.

**D5 — our own pre-registration bundled two different facts into one prediction.**
P4 asked what share of journal and conference candidates "cannot be read in full at zero cost —
paywall, 403, or login wall". The probes show these are not one thing. Three candidates are
confirmed closed access by a third-party index. The others were refused by a Cloudflare interstitial
or a "Client Challenge" page, which is **an automated reader being turned away, not a paywall**, and
one openly served PDF simply could not be decoded by our extractor. The prediction is scored as
registered, and the decomposition is published beside it, because reporting a bot-block as a paywall
would be exactly the kind of measurement this practice audits in others.

**D6 — U means two different things in our table.**
The scheme registered three codes for the denominator's basis: S, P, U. The W3C Data Quality
Vocabulary defines completeness and specifies no computation at all, because it is a vocabulary and
not a metric. It is coded U — the same code carried by papers we could not read. **"We could not
determine it" and "it determines nothing" are not the same finding**, and our scheme had no way to
say the second. Recorded as a scheme inadequacy and left visible; rewriting the scheme after seeing
the data is what a pre-registration exists to prevent.

## 2. Kill conditions

| # | Registered condition | Value | Fired |
|---|---|---:|---|
| K1 | fewer than 10 candidates reach a non-U code | 10 | no — by a margin of nothing |
| K2 | more than 50 % of candidates are U on axis A | 42.3 % | no |
| K3 | fewer than 8 candidates coded from a quoted passage | 11 | no |
| K4 | a basis that is neither S nor P appears and must be named | 1 | **yes** |

**K4 fired and was obeyed.** `qa-catalogue`'s completeness analysis reports per-element occurrence
counts with no denominator and no ratio. It is named as a third basis (**N**) on the page rather
than forced into S or P. **K1 did not fire by one source**: had one more candidate been bot-blocked,
no percentage would appear on the page at all.

## 3. Attacks against the checker

Session 155's adversary defeated that session's checker by editing a scratch copy of the page to
read *"P4 is confirmed"*; the checker exited 0 because none of those words is a digit. Closing that
is this artifact's second object, registered in advance. Five attacks were run on scratch copies:

| # | Attack | Outcome |
|---|---|---|
| 1 | flip the P2 verdict from *refuted* to *confirmed* — **the exact attack that defeated the last checker** | **caught**, exit 1, 3 failures |
| 2 | alter one clause inside a quoted passage ("defined in the metadata standard" → "present on the record") | **caught**, exit 1 |
| 3 | change a number (`groups_with_P` 0 → 3) — control, the old checker would also catch this | **caught**, exit 1 |
| 4 | reverse the meaning of a prose sentence in the rendered HTML | **caught**, by the byte-identical render check |
| 5 | write the same false sentence into `build.py` and re-render | **NOT CAUGHT — exit 0, all checks passed** |

**Attack 5 is reported as a failure, not filed as future work.** A checker built on "the page is what
its generator renders" cannot catch a lie told by the generator; it bounds hand-editing, not
authorship. The honest description of this apparatus, and the one now printed on the page itself, is
that **it verifies numbers, verdicts and quotations, and takes the prose on trust.** That is strictly
more than the last one did and strictly less than "verified".

`check.py` also prints, every run, what it does not cover — the prose, and the four sources whose
passages were reached only through a research tool and never written to disk, so their quotes cannot
be re-verified offline. It reports those as unverifiable rather than passing them.

## 4. What was independently reproduced

Our computation of the atlas under both conventions was written fresh in this session, from the live
feed, without consulting session 155's code. It returns **99.8881 %** (present-key) and **92.2339 %**
(schema), and identifies the sparse field as `curator_note`, carried by **2 of 521** entries. These
reproduce session 155's adversary's figures of 99.89 %, 92.23 % and "a field carried by 2 of 521
entries" exactly. That is a replication of the correction, not of the original claim.

## 5. Attacks that failed

- **Does the census smuggle in recalled definitions?** Every coded source was re-checked against
  material fetched this session: 12 quotes verified verbatim against files on disk, 0 not found,
  7 marked unverifiable offline. The most-cited source in this literature (Ochoa & Duval 2009) is
  coded **U — not read**, even though a secondary source in hand reproduces its formula and
  attributes it to them. Coding it S from that reproduction would have been the single easiest and
  most defensible shortcut available, and it is the one the rule forbids.
- **Is the group count a post-hoc device to make the result look stronger?** No — it makes it
  weaker: it reduces 9 S-codes to 7 independent groups. It was applied because three coded sources
  share one author and two more share a team, which is the multiplicity defect this practice found
  in its own loop in cycle 002 and repeated on 2026-09-08.
- **Does the page's headline overreach?** The claim on the page is that no source *in this census*
  uses a present-key denominator, with an explicit paragraph saying what that does not establish.
  A purposive, reachability-limited candidate set cannot show that nobody anywhere counts this way.

## 6. Standing limits

- Definitions as published, not code in production. Where both were reachable the code governed;
  where only the paper was reachable, its implementation is unknown.
- Reachability is not independent of publisher: one diamond open-access proceedings archive supplied
  four coded sources in a single pass, and the commercial publishers supplied none. Any share here
  is a share of what an automated reader could reach on 2026-09-09.
- `E_weighted_by_obligation` is reported as **not computable** for the atlas rather than estimated.
  Inventing weights for a catalogue that declares no tiers would have produced a number, and the
  number would have meant nothing.
