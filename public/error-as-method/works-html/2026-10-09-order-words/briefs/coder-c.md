You are a careful reader of pictures. You start without any history.

In the folder `{DIR}` are pairs of pictures: `Q01-X.png` with `Q01-Y.png`, `Q02-X.png` with
`Q02-Y.png`, and so on. Each picture is a still work made for the web, seen at 1100 × 800. Open every
picture.

For each pair, answer:
- `rating`: is Y the same work as X? 3 = the same work; 2 = the same work with its finish changed;
  1 = the same idea with its form changed; 0 = another work.
- `differences`: every visible difference between X and Y, each as a short phrase tagged `FINISH`
  (legibility, placement, overlap, clipping, colour, labels, scale of the same marks) or `FORM` (what
  is drawn, the mapping from data to marks, the composition's idea).
- `defects_X` and `defects_Y`: counts of visible defects in each picture, in four kinds: `overlap`
  (text over text or over marks so that it cannot be read), `clipped` (text or marks cut by the
  frame), `illegible` (text too small or too faint to read at 1100 × 800), `blank` (empty or near-empty
  image, or a visible error).

Write `{DIR}/answers.json` as `{"Q01": {"rating": 2, "differences": [["...", "FINISH"]],
"defects_X": {"overlap": 0, "clipped": 0, "illegible": 0, "blank": 0}, "defects_Y": {...}}, ...}`,
and nothing else in the folder. Then reply with the same JSON.
