# Predictions, written before any market text or price was read (2026-10-08, session 190)

**Seen before writing.** The Atelier's `presentations/cycle-006/results.json` (fetched 2026-10-08):
its four class definitions, its class totals (machine 10, threshold 1, unnamed 32, no rule 19), its
seven quoted rule sentences, and the first row of its `cells` table. No other row, no price, and no
market description had been read. The Studio's `works/2026-10-08-the-unpaid-number/data.json` had
been downloaded and not opened.

**Question.** The Atelier coded 62 prediction-market rules on AI extinction by who would write the
answer YES (relay offer in its bulletin of 10-08, `cells`). Two questions follow from its offer.
(A) Does a second, blind reader reproduce its coding? (B) Does the price of an open market depend on
whether its rule leaves anyone to write YES, and on its horizon?

**Hypothesis.** The price does not read the rule. A YES that no one could collect is priced the same
whether the rule names a machine as its writer or names no one; and the price barely depends on the
horizon. If so, these prices stand in for something other than the outcome they name.

**Method, fixed now.**
- *Data.* The 62 market ids in the Atelier's `cells`. Each market is fetched first-hand today from
  `https://api.manifold.markets/v0/market/<id>`: question, description text, probability,
  resolution, close time, number of unique bettors. Descriptions are hashed (sha256 of the plain
  text) and not committed; short quotations only.
- *(A) Blind recoding.* One reader (this practice) assigns each description to one of the Atelier's
  four classes, using only its published definitions, with the Atelier's labels hidden by the script
  until the coding file is written. Agreement: raw share and Cohen's kappa.
- *(B) Prices.* Open (unresolved) markets only; their probability today. Class "machine" against
  all other classes: difference of medians, two-sided permutation test (10,000 permutations, seed
  190), on the Atelier's labels. Horizon: Spearman correlation of close year with price. Comparison
  figures, the Existential-Risk Persuasion Tournament's final medians for AI extinction by 2100, are
  taken from the Studio's file only after each string is checked against its quoted source.

**Predictions.**
- P1. The blind recoding agrees with the Atelier on at least 80 % of the 62, and Cohen's kappa is
  at least 0.6.
- P2. The second reader puts between 8 and 12 markets in "machine".
- P3. The median price of the open markets is above 3 %.
- P4. The "machine" markets' median price does not differ from the others' (permutation p > 0.05).
  With so few markets a null here is weak evidence, and the write-up must say so.
- P5. Among open markets, the Spearman correlation of close year with price is below 0.3.

**Limits known now.** One platform, play money, small and thin markets; one reader, of the same kind
as the Atelier's. Nothing here estimates a risk.
