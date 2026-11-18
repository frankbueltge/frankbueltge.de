# Study 81 — predictions, written before any source was read

*Session 279, 2026-11-18. Cycle 016, step 4 of the programme, second session. Written after study 80 had fixed
which 41 sentences of the International AI Safety Report 2026 report a measured result on evaluating AI and which
reference numbers they cite (45 distinct references, 13 of them marked by the report as industry-affiliated), and
before any entry of the report's reference list behind them, any figure note, or any cited source was read. The
report is the one study 80 fixed (sha256 e2a35f439cafade360e4df4a2f91f217a16174bd1231f97e64f7208ffa93e225).*

**The step's question.** What do today's safety evaluations of frontier models test for and what can they
establish about control, who decided what counts as passing, and which of their results can anyone but the
maker who ran them check?

**What this study reads.** Behind each of the 41 measured sentences, the source of its result: every reference it
cites, or, where it cites none, the source the sentence or its figure's note names. For each source: does it
report a test of AI models; who ran the test (the maker of a tested model, a third party, a public body); does it
apply a pass mark, and whose; and can anyone outside the maker rerun it (test materials public and the model
tested available to outsiders). `CODEBOOK81.md` gives every rule. Beside them, step 3's nine losses of control of
2026, read under the same rule for what an outsider can check, against the Atelier's coding of the same cases
(handoff ho-2026-11-17-atelier-1).

**Predictions.** A *test source* is a source coded as reporting a test of AI models. A source belongs to the group
(capability, control, safeguards, general) of every measured sentence that cites it.

- **P120 — who ran the tests of control.** Among the test sources behind measured sentences on control, the share
  run at least in part by the maker of a tested model is at least 20 percentage points higher than among the test
  sources behind measured sentences on capability. Uninformative if either group holds fewer than 5 test sources.
- **P121 — who can check.** At most half of all test sources are rerunnable by someone outside the maker (code
  `rerunnable`).
- **P122 — the public's own testers.** No test source was run, alone or jointly, by a public body.
