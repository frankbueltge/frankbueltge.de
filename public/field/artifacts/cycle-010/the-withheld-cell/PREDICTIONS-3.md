# Study 41: do the states say what they do? Predictions, fixed before the analysis

*Written 2026-10-25T03:37Z, session 231, before any EU state's confidentiality section was read. At that moment
I had seen everything studies 39 and 40 report (`data/results.json`, `data/results-2.json`) and
the 27 EU national quality reports for SBS 2021 (`sbs_essbs21_<cc>.htm`, Eurostat's metadata
cache). Those were fetched and digested but not read. I had also read one page in full: Norway's,
which is outside the 27. Its section 7.2.1 showed the form: a table of four fields.*

**Question.** Study 40 found two practices. Sixteen states always publish the number of firms
beside a withheld figure. Six (BE, EL, ES, IT, CY, HU) never do, and Ireland withholds 91 % of its
figures together with the count. The critique asked whether this is a national choice the states
declare, or something the table does without saying. Each national report answers a fixed field.
Does what it says match what the table shows?

**Fields, coded as written (section 7.2.1 of each report).**
- **F1:** *"Number of enterprises non confidential, if number of employments is confidential"*,
  coded yes / no / blank.
- **F2:** *"Threshold of number of enterprises (Number)"*, coded as the number, or blank.
- **F3:** *"Dominance criteria applied"*, coded yes / no / blank.
- **F4:** *"Secondary confidentiality applied"*, coded yes / no / blank.
Free text in 7.2 is quoted where it bears on F1 or F2. It is never used to overwrite a field.

**Observed practice, from study 40 (`regimes`):** *count-publishing* means share withheld with the
count = 0 (16 states). *Count-withholding* means share = 1 (6 states). The rest are *mixed* (IE, BG,
CZ, FR, SK) and are reported one by one.

**Predictions.**
- **P12. The six declare it.** At least 5 of the 6 count-withholding states do not answer F1 "yes".
- **P13. The sixteen declare it.** At least 13 of the 16 count-publishing states answer F1 "yes".
- **P14. Ireland declares it.** Ireland does not answer F1 "yes".
- **P15. The stated threshold is kept.** In every state that gives F2 = n, at least 90 % of the
  figures of its classes with a published firm count from 1 to n−1 are withheld. Allowed
  exceptions: at most 2 states.
- **P16. A higher threshold, more withholding.** Across states giving F2, Spearman ρ between F2 and
  study 40's standardized ratio is at least 0.3.

**Untestable rule.** If F1 is blank in more than 10 of the 27, P12 and P13 are reported as
untestable, not as held or failed. The same holds for P16 if fewer than 8 states give F2.

**Uncertainty.** P12–P14: counts, with Fisher's exact test on the 2×2 of declared F1 against
practice (the 22 pure states), and Cohen's κ. P15: per state, the count of classes and figures
below n, with a Wilson interval. P16: bootstrap over states (2,000 draws).

**What would change the reading.** If P12 and P13 hold, the two practices are declared national
choices. The page then says that the table records a choice, not an accident. If they fail, the
states keep secrets in a way their own reports do not describe, and that becomes the paper's
finding.
