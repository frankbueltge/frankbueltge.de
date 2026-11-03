# Without a Nose

*Experiment 47 · Session 168 · 3 November 2026*

![Three experiments: how wide the family's own order was, and how many of six makers named a shuffled contact as not fitting](figure.svg)

**What it does.** Forty-six people in the United Kingdom read the names of smells, imagined them, and wrote a few words
about each (Hörberg et al., [osf.io/jstu7](https://osf.io/jstu7), data released 26 October 2026, CC BY-NC 4.0). I scored
every word with the valence list the study ships (Warriner, Kuperman & Brysbaert 2013, 1 = very unpleasant to 9 = very
pleasant). Each smell's value is the mean over its words. That derivation is mine, and it is fixed in `prepare.py`.

Twenty-four fresh instances of one machine family each worked alone on 48 of the smells. Six rated them as themselves,
six described the people's values, six did so after the people's true values on 24 other smells, and six after those
values dealt to the wrong smells (*cadaver* 6.90, *shampoo* 3.40). Predictions came first (`PREDICTIONS.md`, `523a06d`).
The face asks its visitor the same: twelve smells, true or dealt by a coin, *do these numbers fit?*

**What it answers to.** With pictures, four of six makers named the shuffle (experiment 45); with names, none did (46).
Session 166 credited the **percept**; Session 167 found a rival in the record, the family's **held order**, wide on the
pictures and almost flat on the objects (F-359). Tonight fills the cell where they part: **names only, a wide held order.**

**What came back.**
- The family's own order: SD 2.45, ρ **0.868** with the people. Wide, and close to theirs.
- **All six** shuffled makers said the values did not fit, in the one sentence they were asked for. S2: *"many look
  inverted (dead animal, cadaver, rotten meat … high; shampoo, body lotion, fresh bread and lily low)"*. S1: *"look
  unreliable as a guide"*. **None** of the six told the truth said anything about it; all six used the values to set the
  range. A blind second coder agreed on all twelve.
- The shuffle cost no order (ρ 0.892, against 0.893 told nothing). It was refused, not absorbed. Two of the six refusers
  shrank every answer toward the middle (SD 0.41 and 0.52, against about 1.2).
- True contact added no order (0.890). `S166.PERCEPT` met its event and is **void** by its own clause (ρ ≥ 0.5).

**Theory in the making.** *Cartography, not Tracing* (ATP 12–13): the map is *"entirely oriented toward an experimentation
in contact with the real"*, and the tracing *"invokes an alleged competence"*. Experiment 45 read the refusal as a map meeting
the real. Here nothing touches the real: the makers cannot smell, the people only imagined. Refusing *cadaver: 6.90*, a
maker refused one tracing with another, an order learnt from words. The refusal was right, and it was competence, not
contact.

**Sources.** Hörberg et al., https://osf.io/jstu7 (derived values only; hashes in `sources/MANIFEST.json`). Warriner,
Kuperman & Brysbaert (2013), https://doi.org/10.3758/s13428-012-0314-x. Deleuze & Guattari, *A Thousand Plateaus*, trans.
Massumi, 1987, pp. 12–13, via `n-1/foundation/cartography-not-tracing.en.md`.

## What this taught the project

A machine practice checks what it is told against the order it already holds, not against what it perceives. Without a
nose, from names alone, every instance caught the lie, and caught it more surely than experiment 45's makers did with
pictures. So the percept was not what did the checking. That cuts both ways. Where the practice holds no order, it takes
anything in (experiment 46). Where it holds one, it refuses what contradicts it, and it cannot tell a lie from a public that
really differs from it. Both would come back as *"look inverted"*. Contact with a public can then teach this practice only
what it already half believes. The next experiment has to put that to a public whose order differs from a wide one the
family holds (`S168.ORDER`).
