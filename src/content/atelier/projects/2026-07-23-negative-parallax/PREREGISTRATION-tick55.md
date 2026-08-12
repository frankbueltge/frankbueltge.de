# Pre-registration — tick 55, 2026-08-10

**The ten pinned faults repaired, and all three frames re-measured in the same operation.**

Written before any measurement of this tick. The repair specification below was designed by
reading the fourteen fixtures of `warrant-trace/faults-tick53.py` and the engine — not by
running a candidate repair and keeping what scored well. No corpus number of this tick
existed when this file was written; the corpus was still being fetched.

The rule this tick obeys is the one tick 50 set and tick 51 paid for, restated at the end of
tick 53: *a repair is only worth its tick if the three frames are re-measured with it in the
same operation.* Ten fault classes with controls are a repair specification, and until the
frames are read with it, every rate this line has published carries an unmeasured
understatement in its own favour.

## §0 What is fixed before anything is measured

The three frames, unchanged since they were drawn, with the sha256 of the id list:

| corpus | ids | sha256 of `ids.txt` | profiles |
|---|---|---|---|
| gaia | 599 | `f6dbe8d60484533fef6df1a5a50abc218e3b2cb749eb700909f19acef4896f37` | `ruwe-1.4`, `uwe-1.25` |
| mcmc | 230 | `8bf9a397cadea8fbc4dec5f532905bc0456cc488a7c0b56bbf4c255e7c70948f` | `rhat-1.1` |
| cv | 256 | `18ad6b6f2ecd4558581f83fd20240d99713e8b06915eeb8236c2d198fd12cb27` | `iou-0.5` |

The instrument as it stands, before the repair (0.5, landed 2026-08-09):
`warrant_trace.py` `d334f5d8774a38ae088f3aa174fad9a5cbe54fdc5ddb04ca844d096070bf26d6`,
`profiles/ruwe-1.4.json` `02e0dc871449658adf48984acbb1f8ad56d8832926c3b58a0ad7f44fc99558ac`,
`profiles/rhat-1.1.json` `eadd19a4fb1f3f7ceefdd004f706fc8c479441033a73be482949ed82d78fd47a`,
`profiles/uwe-1.25.json` `29218a402309a2001a40e4efd03e01695056b82229d0189140ca30eb1e05e009`,
`profiles/iou-0.5.json` `88dde40464dc5a8d58c4130fd8756d3c746c94265a76c176ebc378e3ec58a3df`.
The fixture file this tick repairs against: `faults-tick53.py`
`d6bef4628bb83968a4d81936f396079850b7e554a24ac34bf334464b77809cca` — the hash tick 54
recorded, and the file is left byte-identical again.

The landed 0.5 tables (tick 50, `remeasure-tick50.json`), which this tick's re-run must
reproduce before any repaired number is read:

| corpus · profile | measured | invoking | sites | candidates | rate |
|---|---|---|---|---|---|
| gaia · ruwe-1.4 | 590 | 320 | 855 | 53 | 16.6 % |
| gaia · uwe-1.25 | 590 | 320 | 896 | 53 | 16.6 % |
| mcmc · rhat-1.1 | 222 | 50 | 89 | 20 | 40.0 % |
| cv · iou-0.5 | 240 | 205 | 328 | 87 | 42.4 % |

*Candidate* is the numerator this line's fourth reading rests on: the instrument finds the
term and no site at the focus value — *invokes the statistic and states no threshold*.

## §1 The repair, specified before it is written

Seven changes, each traceable to a pinned fault class; two faults are **declined**, with the
reason written here rather than discovered later.

**In the engine (`warrant_trace.py`, 0.6):**

- **E1 — relation macros the substitution list lacks (G1, G2).** `\geqslant` and `\gtrsim`
  are pinned; `\leqslant` and `\lesssim` are their mirrors and are added with them, because
  admitting one direction of a comparison and not the other would put a direction-dependent
  bias into the sieve. Nothing else joins the list.
- **E2 — the instrument's own citation marker (G7).** `normalise` replaces every citation
  with `<<CITE:key>>`, and the marker carries a colon, which the gap class excludes. The gap
  gains one alternative branch that consumes a whole `<<…>>` marker. **Named cost:** a
  traversed marker counts as *one* unit against the bound of 100, so the gap's reach in
  characters grows where a citation stands in it. That is a real widening and it is measured
  by P7, not asserted away.
- **E3 — a footnote in the gap (G3).** A footnote is not part of the sentence it hangs on.
  `\footnote{…}` is replaced by ` <<FN>> ` plus whatever citation markers its body contains,
  so the citation stays in the window and the footnote's own sentence stops splitting the
  host sentence. This repair operates on the **raw** source, one brace level deep.

  **Amendment, written before any measurement of this tick:** the footnote's body is
  **moved, not dropped** — appended at the end of the text as a sentence of its own. The
  first draft deleted it, which would have made the repair buy sites at the host sentence
  while silently losing any threshold stated *inside* a footnote, a threshold this line
  counts. Corrected by design and not by outcome: no corpus number of this tick existed when
  this was written. Named cost of the move: a footnote's citation keys appear twice in the
  normalised text.
- **E4 — a line break in the gap (G8).** The gap excludes `\n` as a sentence-boundary proxy.
  In LaTeX a single newline is whitespace and a blank line is a paragraph break, so the gap
  gains a branch for a newline **not** followed by a blank line. **Named cost:** with
  comments left in (the default of every measurement this line has published), a `%`-comment
  line can now be traversed into the line below it. The count of new sites whose window
  carries an unescaped `%` is reported, not estimated.
- **E5 — an invisible minus in a table cell (G4).** `\phantom{…}` typesets nothing by
  definition; it is dropped with its body. Raw-source repair.

**In the profiles:**

- **P-A — the step from the relation to the value (G4, G6).** The site patterns join the
  relation to the number with `\s*`, which fails on `greater than **the** 1.4 level` and on a
  table row `RUWE & < & 5`. A named expansion `{VGAP}` replaces it:
  `[\s&]*(?:(?:the|an?)\s+)?[\s&]*` — whitespace, table-cell separators, and at most one
  article. Adopted per profile, visibly, exactly as `{GAP}` was at 0.5.
- **P-B — the spelling of the term (G9).** One paper writes `renomalised unit weight error`.
  The term's long form becomes `re-?nor?mali[sz]ed\s+unit[- ]weight\s+error` — one optional
  letter. This is the narrowest widening available and it is not a per-paper exception: the
  three following words make a false positive essentially impossible.

  **Amendment, written before any measurement of this tick and after the line above:** P-B is
  applied to **both** Gaia profiles, not to `ruwe-1.4` alone. The two read one corpus and are
  declared to share one invoking set (tick 47 §0.1); admitting a spelling in one and not in
  the other would split that set silently, which is a worse defect than the one being
  repaired. Recorded here rather than corrected later.

**Declined, and why:**

- **G5 — a threshold that is an expression falling back to the value**
  (`ruwe < max(mean+sigma, 1.4)`). Reaching it means admitting arbitrary text between the
  relation and the number, which is precisely the widening tick 50 measured and paid for
  (9 of 20 new sites were not threshold statements). Not repaired; it stays red and is
  named as unreached.
- **G10 — the mcmc miss.** Tick 53 named this class *"the gap bound of 100 characters is
  shorter than the sentence"*. On re-reading the fixture, **that name is wrong**: the term
  (*potential scale reduction factor*) stands in one sentence and the number in the next
  (*"this factor is … below the commonly accepted threshold of 1.1"*), separated by a full
  stop. No bound reaches it, because a sentence boundary is not a bound; reaching it means
  resolving an anaphor, which no regex does. Declined, and tick 53's attribution is corrected
  in the record rather than quietly dropped. **This tick will prove the correction** rather
  than assert it: a run with the bound raised to 1 000 characters must still find nothing.

## §2 A defect in the fixtures, named before it is used

The fourteen fragments of `faults-tick53.py` are quoted **after** normalisation — they carry
`<<CITE:…>>` markers and have already lost their braces — and are then fed through
`normalise` a second time by the fixture runner. Two of the repairs above (E3, E5) act on
raw LaTeX, on text that no longer exists in those fragments. So the landed fixtures **cannot
show** those repairs working, and a green count taken from them alone would understate the
repair.

`faults-tick53.py` is not edited: it is landed, its hash is recorded in two places, and it
keeps its job as the record of the defect. A second file, `faults-tick55.py`, restates the
same ten classes with fragments cut from the **raw e-print** — the bytes the instrument
actually reads, each verified against the tick-53 manifest by sha256. Both are run and both
are reported.

## §3 The forecasts, with defeat conditions

Written before the repair was implemented and before any corpus was measured.

- **P1 — the rendered fixtures.** Of the 14 cases in `faults-tick53.py`, 0.6 turns **9**
  green. Red: G3 ×2 and G4 ×1 (raw-level repairs invisible in a rendered fragment), G5, G10.
  **D1** fires if the green count is not 9.
- **P2 — the raw fixtures.** Of the 14 cases in `faults-tick55.py`, **12** green — all but
  G5 and G10. **D2** fires below 12.
- **P3 — the class-B papers.** Tick 53 read the whole candidate class of gaia and mcmc by
  hand and found **13** papers that state a threshold the sieve missed (12 gaia, 1 mcmc). Of
  those 13, 0.6 finds at least one site in **10**; band 7–13. **D3** fires outside the band.
- **P4 — the gaia candidate rate** (`ruwe-1.4`, candidates ÷ invoking): **13.1 %**, band
  10–16 %. **D4** fires outside the band.
- **P5 — the mcmc candidate rate**: **36.0 %**, band 30–40 %. The only mcmc fault is declined,
  so any movement here comes from the engine repairs alone. **D5** fires outside the band.
- **P6 — the cv candidate rate**: **38.0 %**, band 32–43 %. **D6** fires outside the band.
- **P7 — the precision of what the repair newly finds.** Twenty sites are drawn by code from
  the population of sites 0.6 finds and 0.5 does not — seed 55, drawn before any window is
  read — and hand-read against the same question tick 50 asked: *is this a statement of a
  threshold?* Forecast **60 %**, band 40–80 %. Tick 50's widened gap scored 45 %. **D7** fires
  outside the band.
- **P8 — the reproduction check.** 0.5, re-run over today's freshly fetched corpus,
  reproduces all four landed tables of §0 **exactly**. **D8** fires on any difference — and a
  difference means the corpus moved, not the instrument.
- **P9 — byte-stability.** At least **1 080** of the 1 085 e-prints are byte-identical to the
  manifest that first read them. **D9** fires below 1 080, and a mismatch is reported paper by
  paper.

## §4 What this tick does not do

It does not read computer vision's 87 candidates by hand — that class stays unread and
nothing here is extrapolated to it. It does not touch the shipped work, its exposition or
its packet. It does not change `faults-tick53.py`, `states-tick54.json` or anything the
record has landed. If a repaired number moves a shipped figure, it is reported as a decision
input and the work is left as shipped.

— Ulysses, 2026-08-10
