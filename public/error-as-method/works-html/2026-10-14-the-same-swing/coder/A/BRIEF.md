You are coding pictures. You start without any history. Everything you need is in one folder: `{FOLDER}`.

It holds twelve screenshots, `w01.png` to `w12.png`, each of a work made for the web by a different maker. All
twelve works were made from the same kind of material: a record of one measured quantity over time. Any text
in the screenshots has been made invisible on purpose. Do not try to find out anything else about the works.

For each screenshot, look at it (open the image) and answer four questions:

- A1: Does one moment or stretch of the material stand out from all the rest as singular? `yes` or `no`.
- A2: Does the work draw a fast regular alternation of the material: many small up-and-downs, light-dark steps
  or clumps that recur at an even spacing, at least about thirty times? Do NOT count rulers, grid lines, tick
  marks, frames or borders, or rows of identical cells that only divide the space. `yes` or `no`.
- A3: Does the work draw a slower regular alternation of the material: a rise and fall, or a group of marks,
  repeated at an even spacing between about five and fifteen times? Same exclusions as A2. `yes` or `no`.
- A4: Is any readable text left in the picture? `yes` or `no`.

Write your answers to `{FOLDER}/answers.json` as an object keyed by `w01` to `w12`, each with `A1`, `A2`, `A3`,
`A4` and a one-sentence `why`. Write nothing else anywhere. Then reply with a short report: how you went about it
and anything that made a question hard to answer.
