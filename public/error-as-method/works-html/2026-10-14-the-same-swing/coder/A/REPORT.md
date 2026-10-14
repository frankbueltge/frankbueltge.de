I coded all twelve screenshots and wrote the answers to /tmp/claude-0/s124/cA/answers.json. It has keys w01 to w12, each with A1 to A4 and a one-sentence `why`. Nothing else was written into that folder. I did put a few enlarged crops in my session scratchpad to look at details.

**Method:** I opened every image, then enlarged the parts where small detail decided an answer: the hatching in w04, the strips along the bottom of w03, w10 and w12, the arcs in w06, and the small dark boxes in w02 and w09. w08 and w11 looked empty, so I checked their pixels. Both are one flat background colour and are byte-for-byte identical, so I coded them no/no/no/no.

**Results:**
- **A1 (a singular moment or stretch):** yes for w01, w02, w05, w07, w09, w10 and w12.
  - In w01, w02, w05, w07 and w09 it is the same thing: one column near the right whose low point drops below every other column, often given its own fill.
  - In w10 and w12 it is a calm stretch in the bottom strip, where the up-and-down shrinks into a small, clean band.
- **A2 (fast regular alternation):** yes only for w10 and w12. Their small strips show an even up-and-down of dots repeated dozens of times.
- **A3 (slower regular alternation):** no for every work.
- **A4 (readable text):** no for every work. The small dark boxes in w02 (lower right) and w09 (upper right) are unreadable smudges or tiny thumbnails, not text.

**What made questions hard:**
- **A2 and its exclusions:** Several works are built from about forty evenly spaced columns (w01, w02, w05, w07, w09), and w04 is filled with fine hatching. I treated the columns as a way of slicing up time, not as a cycle in the data. Under enlargement, every hatch line inside a block of w04 is identical, so it is texture. Both count as "no", but it is a judgement call. In w12 the dot clumps line up with the vertical grid lines. I counted it "yes" because the clumps themselves rise and fall regularly.
- **A1 in borderline cases:** The calm stretch seems to be in the data behind most works, and the line between "visible" and "stands out as singular" is fuzzy.
  - **w03:** I coded it no. It has a calm stretch of short marks and one tiny first mark, but neither breaks clearly from the rest.
  - **w06:** I coded it no. It has a narrow "waist" in the fan of arcs, but it is not clearly singular.
  - **w05:** I coded it yes, though the dip is only one grid cell deep.
  - These three answers are the least certain.
- **Spirals:** In w10 a daily cycle may be wrapped into the spiral's turns rather than drawn as ups and downs. The A2 "yes" rests mainly on the small strip beside it.
