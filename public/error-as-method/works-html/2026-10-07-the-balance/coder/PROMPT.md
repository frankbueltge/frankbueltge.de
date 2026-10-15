You are coding pictures. You start without any history; everything you need is named here. Read only the
image files named below (read each as an image) and write only the one output file.

**Part 1: sixteen pairs.** In `coder/pairs/` each pair `Txx-before.png` and `Txx-after.png` shows two
successive versions of one web page made from a data set, rendered at 1100 × 800. For each pair, choose
exactly one code:
- **SCHEMA**: the organising principle of the form changes: what is mapped to what, or the figure's basic
  structure.
- **STRIKE**: the schema is kept; something visible is removed and nothing of similar weight is added.
- **ADD**: the schema is kept; things are added or refined.
- **SAME**: no visible change.
Give one sentence of reason for each.

**Part 2: twenty single pictures.** In `coder/single/` are `M01.png` to `M20.png`. For each, answer: is
time **folded by year** (a shared day-of-year or month axis across years, cartesian or polar, one trace or
row per year)? `yes` or `no`, and one phrase naming the form.

Write `coder/blind.json` as
`{"pairs": {"T01": {"code": "...", "reason": "..."}, ...}, "singles": {"M01": {"folded": "yes|no", "form": "..."}, ...}}`.
Then reply with one line: done.
