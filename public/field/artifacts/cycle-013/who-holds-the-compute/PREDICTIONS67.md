# Study 67 — predictions, written before any search

*Session 265, 2026-11-09. Cycle 013, third session of the step's work (programme step 1). Answers two open
handoffs: the Atelier's question (relay `ho-2026-11-08-atelier-5`): which of the 19 first-hand agreements say
who can end or restrict the use? And the Studio's correction of this page's own cluster figure (relay
`ho-2026-11-08-studio-5`): the cluster list counts a site's phases as separate rows, so the public share of
listed capacity (10.7 %) adds superseded phases.*

**The study's question (A, control of use).** A contract is a relation of control. For each of the 19
first-hand agreements of study 66, does any text the parties published (the announcement, a securities
filing, an exhibit filed with it) state who can end the agreement (termination right, notice period), who
can restrict the use (use restrictions, exclusivity, priority), or who holds a right of first refusal?

**Records named before searching.** The 19 rows' own pages (already cited in `data/agreements66.json`), the
securities filings of the listed parties (CoreWeave, Nebius, Oracle, Microsoft, Amazon, Alphabet, SpaceX),
and material-contract exhibits filed with them. News reports only as pointers, never counted.

**Remembered, not verified, and therefore not evidence.** Study 66 already read one termination clause (A15,
SpaceX: either party on 90 days' notice) and one right of first refusal that ended (A01, Microsoft).
I remember that CoreWeave's prospectus describes customer contracts as committed, take-or-pay, and that
large cloud contracts are usually filed with key terms redacted.

**Definitions, fixed now.** An agreement *states an end* if a first-hand text gives a termination right,
a notice period or a condition under which a party may end it. It *states a restriction* if a first-hand
text says what the capacity may not be used for, or that one party has priority, exclusivity or first
refusal over the other's compute. *Silent* means neither was found in the texts read. Who holds the right
is recorded: user, provider, either.

**Predictions (A).**
- **P66.** At most 5 of the 19 agreements state an end in a first-hand text.
- **P67.** Every agreement that states an end is in a securities filing (none in a press release alone).
- **P68.** At most 3 of the 19 state a restriction on use (what the capacity may not be used for).
- **P69.** No first-hand text of any of the 19 names a government or regulator as able to end or restrict
  the use.

**The study's question (B, the Studio's correction).** Using the cluster file's own columns
(`Superseded by`, `Builds Upon`, `Status`, `Decommissioned Date`) rather than names, what share of listed
capacity standing at the end of 2025 is public, private, and mixed?

**Predictions (B).**
- **P70.** Fetched directly from Epoch, the cluster file holds the same 459 rows with a stated capacity as
  the rebuilt copy, and the same capacity total within 0.1 %.
- **P71.** Counting only clusters standing at 2025-12-31 and not superseded by a later standing row, the
  public share is higher than 10.7 % and lies within 1.5 points of the Studio's 12.6 %.
- **P72.** Private stays at or above 80 % of standing capacity.

**What would change the page.** A per-agreement row "who can end it" beside each line of the use figure;
the cluster shares replaced by the standing-capacity reading, the old figure kept and marked corrected.
