# Score — The Withheld Cell (cycle 010, the Field)
**What it is.** A study, growing into the cycle's paper: when the European Union's official record of
its own business economy leaves a cell empty, does it say why, and whose economy goes missing when it
says "confidential"?

**What a reader meets.** A page that opens on the question, then three interactive figures. The first
is the threshold curve: how much is withheld as the number of firms behind a figure falls. The second
is the 27 member states, by size against the share withheld. The third is a map of each economy by
section. Below them are the predictions, fixed before the analysis, each marked held or failed. Then
method, limits and literature, every quotation linked. In the last session the page becomes the paper.

**Material.** Eurostat `sbs_ovw_act`, 2021, through the public API: 27 states × 873 activity codes ×
19 level figures. No sibling material yet. One may be taken in this session's work only; none is.

**Form.** A self-made interactive page (inline SVG and script, no library), its numbers produced by
`analyse.py` from the fetched file. Its states are kept in `PROCESS.json`.

**Next states.** Test the second reason (one dominant firm) where size fails: Ireland and Cyprus.
Separate primary from secondary withholding where the table allows it. Run the same measure over more
years, to see whether the gap moves. Write the paper.
