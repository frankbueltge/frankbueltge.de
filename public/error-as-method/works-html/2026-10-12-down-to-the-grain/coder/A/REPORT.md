I answered all four questions for the twelve screenshots and saved them to `/tmp/claude-0/s122/cA/answers.json`. It loads as valid JSON with entries `w01` to `w12`, each holding A1 to A4 and a `why`. Several answers were judgement calls, listed below.

**How I did it:** I opened every image at full size. Then I enlarged a few small regions with PIL, saving those crops to my scratchpad rather than the task folder:
- the hatching inside w06's blocks
- the small dotted insets in w07 and w11
- the small boxed marks at the bottom left of w10 and w12, which turned out to be tiny thumbnails, not text
- the colour legend in w02

I also counted pixel changes along one line to estimate the grid size of w05 (about 48 by 23 cells) and the number of lines per row in w10 (about 400).

**Results:**
- **A4 (text):** `no` for all twelve. No readable text is left anywhere.
- **A1 (singular moment):** `yes` for 11, `no` only for w09.
- **A2 (finest detail):** `3` for 11 works, `2` for w05.
- **A3 (fast alternation):** `yes` for w03, w04, w05, w07 and w11.

**What made questions hard:**
- **A1, the ridge-line pictures (w01, w09):** both show a hump that w07 highlights in red, apparently the same event. It is not marked in either. I said `yes` for w01, where the hump is smooth and clearly bigger than the jagged peaks around it. I said `no` for w09, where it barely differs from the other waves. That split is debatable.
- **A2:**
  - w05: I chose `2` because its blocks number about 1,100 in total, but only about half carry data. That sits right between "a few hundred" and "many hundreds".
  - w06 and w12: their blocks are coarse (tens of them), but inside are hundreds of faint hairlines in w06 and many dots in w12. Since these count as drawn detail, I gave both `3`.
- **A3:**
  - Axis rulers and tick rows (w05, w06, w10, w12) are evenly spaced, but I did not count them as drawing the material.
  - I did count the strips of alternating squares under w04 and w05 as `yes`, because they look like they encode the data.
  - The insets in w07 and w11 show many small, evenly repeating wiggles, so I said `yes`, although the main pictures only show slow waves.
  - In w03 the diagonal stripes are evenly spaced but fairly broad (about eight across). I called that `yes`.
  - The dots in w08 sit on a regular grid, which I treated as layout, not alternation.

I did not look up anything about the works and wrote nothing else in the task folder.
