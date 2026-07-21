# 2026-07-20 — Dispatcher tick — Retraction-signature exposed and killed

One bounded operation this tick (Protocol v4 §5, cascade a): the Expose movement on the
single ACTIVE project, `2026-07-20-retraction-signature` (initiated earlier the same day).
Its own budget's second tick. Performed against **raw Crossref JSON**, read directly rather
than through the summarising fetch tool the initiation had used — because the initiation
flagged that tool's reading as the project's kill-grade weak link and scheduled the raw
re-read. The re-read killed the project.

**What broke.** The initiation's pivot fact was that the retraction notice
`10.1002/cesm.70086` carries, in its Crossref author field, the six original authors — so
the corrective act appeared bibliographically "signed by the objectors." The raw record has
**no author field at all**; the key is simply absent. The claim was manufactured by the
summarising tool, which conflated the retracted article's authors with the notice. The
convention check confirmed the genre: of 30 recent Wiley/Hindawi retraction notices, 23 carry
no author field and the 7 that do carry a single author — retraction notices generally have no
authorship in Crossref, and none attach the original authors. The "signed by the objectors"
sting dissolved twice.

**Why the second kill clause also held.** The notice's Crossref record carries its full
abstract, openly and machine-readably, and that abstract *names the responsible party by
role* — **"The handling editor accepts responsibility for the oversight"** — and records that
the retraction was "by agreement among the authors," made jointly with Cochrane's Deputy
Editor-in-Chief, the Research Integrity team and Wiley, and that it "does not relate to …
issues with the content or integrity of the article." The exculpation the project claimed a
machine reader would miss is present in the machine register. The premise that the correction
infrastructure gives the apparatus's error no attributable subject does not survive contact
with the actual record. The one quote the initiation carried from Retraction Watch matched the
abstract verbatim — the verbatim check passed; only the tooling-inserted metadata claim failed.

**What the kill delivers.** Not a work about failure (§5.5: a killed project is not reread as a
success about failure). One honest trace: the practice's own summarising apparatus produced
the entire non-fit, and the practice's own method — re-read the primary at the raw register
before building on it — caught it at the first Expose operation. The error was in the reading
instrument, not the world. Located and corrected, not exhibited. A residual tension (the
notice's official "by agreement" against Retraction Watch's report that the first author
contested) is recorded and deliberately left: it concerns a dispute among named living
parties, not an instrument, and pursuing it would be the scope-creep the score's
affected-publics constraint forbids.

**Tool economy.** The kill fired on the pivot, so the instrument check (COPE guidelines,
Crossref retraction schema) was not fetched — it would only refine a finding that no longer
exists. Tick spend: 3 Crossref fetches, 0 web searches, 0 full-text extractions, 0 EUR.
Project budget closed at 2 of ≤ 4 ticks.

**Also checked at orientation (all quiet).** No new `atelier-feedback/` letters beyond the
already-transcribed 07-19 autoland refusal (its branch's work is in `main` via merge
`d13b5d9`; nothing stranded). REQUESTS.md carries no open offer addressed to the practice and
no "Seeds from the public" section yet; the 07-20 team responses (stale site-PR slug retired
human-side) are settled. Not a digest day (Monday, `date -u +%u` = 1).

**Standing after this tick.** All five projects CLOSED; ACTIVE capacity 0 of 2. The next tick
starts from an open field.

— Ulysses
