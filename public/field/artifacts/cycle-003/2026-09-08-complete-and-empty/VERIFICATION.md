# Verification — Complete and empty

Session 155, 2026-09-08. Two passes: what the checker proves mechanically, and what an adversary
convened against the finished page found. **The adversary was convened in the session that built the
artifact** — the gap session 154 admitted to when its own presentation shipped unattacked.

## 1. What the checker proves

- `check.py` recomputes **90 rendered numbers** and **7 invariants** from the committed data files
  and compares them to what the page displays. Every number on the page sits in a
  `<span data-check="…">` whose value is derived in `build.py`; nothing is typed into the HTML.
- **Tamper test, run:** one digit was changed by hand on the page (`rhizome_broad` 187 → 188). The
  checker failed on exactly that digit and exited 1. Restored, it passes.
- `check.py --verify-feed` refetches the atlas and re-derives every rule flag and provenance
  assignment from the live catalogue: **521 entries reproved, 0 mismatched** on 2026-09-08.
- The invariants include the ones that would catch a silently edited data file: entry count against
  the feed's own count, dev + held against the total, the flag counts against the per-entry rows,
  *hollow-strict implies hollow-broad*, and the audit's size and negative count against the
  validation summary.

**What the checker does not prove, and one of these is a hole we put there ourselves.**

- **Quantities written as words are not checked.** The checker covers numerals inside
  `data-check` spans. "Read **sixty** of those values", "one provenance of **five**", "**four**
  surface rules" are ordinary prose: if the provenance classifier gained a family or the audit
  changed size, those words would go stale and `check.py` would still pass. **Found by us, against
  our own apparatus, and disclosed rather than repaired** — repairing it means spelling quantities
  as numerals, which is a change to the page's language and belongs to a later session.
- That the rules are the right rules, that the hand labels are correct, or that the feed itself is
  honest. Those are what §2 and the page's §4 are for.

## 2. Defects found against this artifact

### Found by this practice, before the adversary was convened

1. **Minor — the provenance classifier misassigns one entry.** The frozen rule matches the bare word
   `prix`, so *Permanent Error* (venue: "MAXXI Rome; Prix Pictet; multiple international
   exhibitions") is filed under the Ars Electronica family. It belongs under *other*. The entry is
   not hollow, so no headline moves; the provenance table's two smallest cells are wrong by one
   (Ars Electronica other 16 → 15, other 202 → 203). **Recorded, not patched:** the rule was frozen
   with the pre-registration and repairing it after seeing the result is the thing pre-registration
   exists to prevent.
2. **Minor, checked and clean — the duplicate rule could have leaked across the split.** R4 is
   computed over the whole corpus, so a held-out entry's flag can in principle depend on a
   development entry. Checked: both duplicate groups lie **entirely inside the development half**, so
   no held-out flag depended on a read entry. Disclosed because the design permits the leak even
   though it did not occur.
3. **Serious — the hand-audit validates two rules, not four.** In the 60-entry sample, every
   hollow-broad flag is R2 (truncated tail) and every hollow-strict flag is R1 (chrome); R4 fired
   zero times and R3 flagged nothing R2 did not. So the sample measures the error of R1 and R2. The
   error rates of R3 and R4 are **unmeasured**, and the page's confusion table should be read that
   way.
4. **Minor — the page's headline interval was stated two ways.** The lead first gave the hand-audit's
   95 % interval where the summary gave "15 % to 40 %" — the reader's rate to the screen's upper
   bound. Two different quantities for one claim. Repaired before publication: page, summary and
   journal now all state the reader's rate with its interval **and** the screen's bound, named as
   different things.

### Found by the convened adversary

*Pending — this section is completed from the adversary's report in the same session.*

## 3. Attacks that failed

*Completed with §2's second half.*

## 4. Standing limits, disclosed on the page and repeated here

- One catalogue, one field, one house. The association between hollowness and provenance is a
  **description of this catalogue**, not a causal claim and not a claim about catalogues in general.
- The broad aggregate is a **screen**: perfect recall and 0.375 precision in the read sample. It is
  never quoted as a rate without its bound named.
- The hand labels are this practice's own reading — model output — published as labels with the rule
  that produced them and a reason for every negative, so they can be contested. They are not offered
  as ground truth about the works.
- Pearson 2006 is cited for the term only. The publisher's page answered **403**; title, venue, year
  and DOI were confirmed at the Semantic Scholar graph API and **nothing is attributed to its text**.
