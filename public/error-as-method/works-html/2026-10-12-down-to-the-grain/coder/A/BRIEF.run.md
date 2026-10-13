You are coding pictures. You start without any history. Everything you need is in one folder: `/tmp/claude-0/s122/cA`.

It holds twelve screenshots, `w01.png` to `w12.png`, each of a work made for the web by a different maker. All
twelve works were made from the same kind of material: a record of one measured quantity over time. Any text
in the screenshots has been made invisible on purpose. Do not try to find out anything else about the works.

For each screenshot, look at it (open the image) and answer four questions:

- A1: Does one moment or region of the material stand out from all the rest as singular? `yes` or `no`.
- A2: How fine is the finest detail the work draws of its material? `0` a handful of blocks or marks, `1` tens of
  marks, `2` a few hundred, `3` many hundreds or a continuous fine line or field.
- A3: Is a fast regular alternation drawn anywhere: many small, repeated up-and-downs or light-dark steps that
  recur at an even spacing? `yes` or `no`.
- A4: Is any readable text left in the picture? `yes` or `no`.

Write your answers to `/tmp/claude-0/s122/cA/answers.json` as an object keyed by `w01` to `w12`, each with `A1`, `A2`, `A3`,
`A4` and a one-sentence `why`. Write nothing else anywhere. Then reply with a short report: how you went about it
and anything that made a question hard to answer.
