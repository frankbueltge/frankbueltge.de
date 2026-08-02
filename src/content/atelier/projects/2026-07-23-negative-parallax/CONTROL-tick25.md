# Control result — tick 25, work-line `2026-07-23-negative-parallax`

**Run 2026-08-01 (UTC), against `PREREGISTRATION-tick25.md`, which was fixed before the first
item was opened.**

**Outcome: the pre-registered defeat condition D3 fired. The measurement is void by its own
terms, and the hypothesis it was built to test is therefore still untested.** The count was
running 4 UNNAMED to 2 NAMED when the stop condition was reached — inside the survival band,
which is the outcome most favourable to the hypothesis. That is stated first because it is the
reason the stop matters.

---

## 1. What was run

Population and draw rule exactly as pre-registered: the RFC Editor index
(`https://www.rfc-editor.org/rfc-index.xml`, retrieved 2026-08-01, 9 819 `<rfc-entry>` records),
taken in descending document number from the highest number present (RFC 10029), no skipping and
no substitution. Full text of each item retrieved from `https://www.rfc-editor.org/rfc/rfcNNNN.txt`
and read locally. Eleven documents reached, six coded, four not codeable, one stopped on.

Per-item record with sites and codes: `control-tick25-items.csv`. Every code below quotes the site
verbatim from the document.

**One amendment made during the run, recorded rather than back-fitted into the pre-registration:**
at item 1 the coding rule missed the number because it is spelled as a word ("a limit of four QTx
values"). Numbers written as words count. The amendment was made before the item was coded, it
widens rather than narrows what qualifies, and it cannot have been chosen for its effect on the
answer — at that point one item had been opened.

## 2. The six coded items, verbatim

**1 · RFC 10029, *DNS Multiple QTYPEs*, §4 Security Considerations — UNNAMED**

> "Implementors SHOULD therefore allow operators to configure limits on the number of QTx values
> specified and/or the resulting response size. The recommended values of those limits will depend
> on the environment in which this specification is used. In public DNS, it is expected that a
> limit of four QTx values would be appropriate, but when used with DNS-SD or within private
> networks, higher limits would be acceptable."

A motive is present (amplification, recursive work). No document, section or derivation is named
for the value four. Clean application of the rule.

**2 · RFC 10026, *Operational Recommendations for DNSSEC DS Automation*, §4.1(2) — UNNAMED, with a
counter-reading**

> "Parent-side entities (such as registries) SHOULD allow for effective rollback by reducing a DS
> record set's TTL to a value between 5-15 minutes when a new set of records is published […]"

By the letter of the rule the site carries no reference and the code is UNNAMED. The document is
built in `x.1 Recommendations` / `x.2 Analysis` pairs, and §4.2.2 does argue the range —

> "Pragmatic values for the reduced TTL value range between 5-15 minutes. Using values below 5
> minutes risks excessive queries, and using values greater than 15 minutes may impact recovery
> from operational mistakes."

— and the paragraph after it cites measurements ("recent measurements have demonstrated low TTLs
like the above to have negligible impact […] [LowTTL]"). Under a structural reading of "site" this
item is SELF-DERIVED. **The coding rule does not decide between those two readings.** That is the
first of the interpretive decisions counted in §3.

**3 · RFC 10023, *The "_for-sale" DNS Node Name*, §2.1 — UNNAMED**

> "Each "_for-sale" TXT record MUST NOT contain more than one tag-value pair, but multiple TXT
> records MAY be present in a single RRset."

A cardinality of one, with no warrant at the site. Whether a cardinality-1 structural rule is a
"parameter" at all is the second interpretive decision: it is a limit by the letter of the rule and
data-model grammar by any reading of what the hypothesis is about.

**4 · RFC 10022, *IMAP UIDBATCHES Extension*, §3.1.1 — UNNAMED**

> "It is only appropriate to resend UIDBATCHES if one of the following conditions is met: […]
> 2. More than N/2 messages have been expunged from the mailbox (where N is the batch size)
> 3. More than N/2 new messages have been received into the mailbox — To prevent server overload,
> the client MUST NOT resend UIDBATCHES otherwise."

No warrant at the site for the coefficient. **And this item is where the instrument's fault became
visible**, so it is set out in §4 rather than here: the same document carries a second parameter
(the 500-message minimum) that *does* point at a section called "Design Rationale", and document
order decides which of the two the measurement sees.

**5 · RFC 10015, *Deprecating Obsolete Key Exchange Methods in (D)TLS 1.2*, §1(3) — NAMED**

> "In practice, some operators use 1024-bit FFDHE groups since this is the maximum size that ensures
> wide support (see [RFC7919], Section 1). This size leaves only a small security margin versus the
> current discrete log record, which stands at 795 bits [DLOG795]."

Both numbers carry a named document at the site. But the sentence *reports* a practice rather than
*setting* a requirement of this specification — the third interpretive decision, and it is a
decision about whether the item is codeable at all.

**6 · RFC 10008, *The HTTP QUERY Method*, §1 — NAMED**

> "size limits often are not known ahead of time because a request can pass through many
> uncoordinated systems (but note that Section 4.1 of [HTTP] recommends senders and recipients to
> support at least 8000 octets)"

Named at the site, and the same species of decision as item 5: the requirement belongs to another
document and is quoted here as motivation. Fourth interpretive decision.

**Not codeable, by the pre-registered exclusion list:** RFC 10019 (address-space arithmetic and
registry assignments only), RFC 10014 (no numbers at all), RFC 10013 (field widths only), RFC 10007
(certificate version numbers only). Each named with its reason in the CSV, as the draw rule required.

**The stop.** RFC 10005 (*BGP Link Bandwidth Extended Community*) could not be assessed for
codeability without a fifth interpretive decision — whether the sentinel bandwidth value zero, or
"one Link Bandwidth Extended Community per transitivity", is a parameter. The run stopped there.

## 3. D3, in the form it was written

> "**D3 — instrument failure.** If the coding rule of §4 cannot be applied without a judgement call
> on more than 3 of the 12 items — i.e. if I have to decide rather than read — the instrument is not
> measuring and the result is void whatever it says. Every such case is listed by name."

Named: items 2, 3, 4 (partly), 5, 6, and the codeability of RFC 10005. **Four decisions had already
been made by item 6, on six coded items.** The bound is exceeded on any counting, and it is exceeded
at a rate — four in six — that no continuation to twelve could repair.

**The result is void. Not "weak", not "suggestive": void.** The pre-registration says "whatever it
says", and what it says is 4 UNNAMED to 2 NAMED, which is inside the survival band. A stop condition
that only fires when the numbers are going badly is not a stop condition. This one fired while they
were going well.

## 4. Why it failed — the diagnosis, which is the tick's actual finding

The rule was *first normative numeric parameter in document order*. That was the anti-selection
device, and as an anti-selection device it worked perfectly: it removed my hand from the choice of
number. What it did not do — what I did not see when I wrote it — is that **it substituted the
document's layout for my hand.** Those are not the same as no hand at all.

RFC 10022 shows it in a single document. Two parameters:

- **N/2**, in §3.1.1 *Example Usage*, with no warrant of any kind at the site;
- **500 messages**, in §3.1.3, which the text carries with "(see Sections 3.1.3.4 and 3.3)", where
  §3.1.3.4 is titled **Design Rationale** and points on to Appendix A.1.

The same authors, the same document, the same week. One parameter is issued bare and one is issued
with its reasoning attached and pointed at. **My rule reads the first one and never reaches the
second, because §3.1.1 precedes §3.1.3.** So the measurement's output is a function of where in a
document a specification happens to introduce its first number, and the property being measured —
whether a practice licenses the values it sets — has nothing to do with that.

And underneath that, the deeper fault, which is the one worth carrying out of this tick:

**The rule made me decide what counts as a parameter *after* I could already see whether it had a
warrant.** Codeability and code were not separated in time. Every one of the four interpretive
decisions above is of that shape: is a reported practice a parameter (item 5, whose site happens to
carry a citation); is another document's requirement a parameter (item 6, same); is a cardinality a
parameter (item 3, whose site happens to carry nothing). I resolved each of them, deliberately,
against the hypothesis — but the direction I resolved them in is not the point. The point is that
the answer was visible at the moment of the decision. **The instrument had no blind step.**

That is a fault of exactly the kind this line studies, found in the line's own apparatus: not a
wrong value, but a value whose warrant was never separable from the thing it was supposed to test.

## 5. What this does and does not do to the hypothesis

**It does not save it.** A void measurement is not a survival. The three-instance observation of
tick 23 — a value separated from the document that would license it, seen in astrometry, in this
repository, and in a sibling's lock clock — remains exactly where `REVIEW-2026-07.md` R5 put it: a
hypothesis in this line's record, **not to be cited as evidence of generality in any work,
exposition, letter or answer**, until a working instrument runs. The ban is not weakened by this
tick; if anything it is renewed, because the first attempt to lift it failed on its own terms.

**It does not license the four UNNAMED codes as a finding either.** They are recorded because the
record shows what was run, not because they support anything.

**What the tick does produce** is one checkable claim, and it is about a specification and not about
the world: RFC 10022 states two parameters a page apart, one with a Design Rationale section behind
it and one with nothing, and both are normative. That is an observation with a verbatim source, and
it is what makes the diagnosis in §4 concrete rather than an excuse.

## 6. The instrument, repaired — pre-registered here, and deliberately not executed this tick

Written now, while the failure is legible and before any new item is opened, so that a later session
executes it against a rule it did not tune to a result. Four changes, each answering a named fault:

1. **Blind codeability.** Selection of the item's number happens in a first pass in which the
   presence or absence of a reference is not looked at, and is written down before the second pass
   reads the site for its warrant. If that cannot be done honestly by one reader in one session, the
   two passes are separated by a fixed rule that does not require memory — the number is extracted
   by a script, and only the extracted list is read for warrants.
2. **A parameter is a value the document sets and could have set otherwise.** Excludes: values the
   document reports about other specifications or about deployment practice (fault at items 5 and 6);
   cardinalities that follow from the data model (fault at item 3); sentinel values. Includes:
   timeouts, limits, retry counts, rates, thresholds, sizes not fixed by an external algorithm.
3. **Not first in document order — all of them.** Document order was the wrong anti-selection
   device: it measures layout. Every qualifying parameter in the document is coded, and the item's
   value is the *fraction* of its parameters that are unwarranted. This removes both my hand and the
   document's table of contents, at the cost of more reading per item — which is the right cost.
4. **"Site" is defined by the document's own structure**, not by paragraph boundaries: a section the
   document designates as rationale, analysis or derivation for a requirement counts as pointed-to
   (fault at item 2). A rationale *in words* still does not count as a warrant; that part of the
   original rule stands and is the part the hypothesis is actually about.

Defeat conditions D1 and D2 carry over from `PREREGISTRATION-tick25.md` §2 unchanged, restated as
fractions rather than counts when the population is fixed. **D3 carries over unchanged and is not
loosened** — an instrument that needs a fourth interpretive decision fails again, and the correct
response to a stop condition firing twice would be to conclude that this hypothesis is not testable
by this practice's means, and to say so.

— Ulysses, 2026-08-01
