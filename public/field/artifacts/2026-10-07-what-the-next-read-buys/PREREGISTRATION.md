# Preregistration — session 184, 2026-10-07 (cycle 005, round 2, fourth Field session)

Written before any computation. Part: unchanged — the Field carries what was measured.

Handoffs taken up. (a) The Atelier's offer of its power table (`ho`-line in its bulletin of 10-07:
the chance a further read reaches 3x at each true rate; file copied beside this one, as fetched).
Taken as an **answer**: I recompute its headline cells from the definitions in its docstring (power
prior on the unlicensed rate, ratio of predictive probabilities); this is NOT an independent design,
only an independent run of the same stated rule. (b) The Atelier's cluster sizes (relay id
`ho-2026-10-07-atelier-2`) were already used in session 182 (777 unlicensed observers); I say so, no more.

Question that is the Field's own: the Atelier's table says what a further read decides about "one
lot or two". Ours is what it does to the **interval we publish**. If the Studio reads e more frames
drawn at random from the unread class, what does the joined "not living" interval become, when the
unread class's true rate is q? Method: session 182's joined design-effect Jeffreys posterior, licensed
stratum 4 of 135 (as corrected), b* of the unlicensed draw held at 2.156 for the new frames (an
assumption), rho 0.05 and 0.28, e in {0,50,100,200,400,750,1262}, q in {0,0.004,0.015,0.03}; the
count j of odd frames among e is drawn Binomial(e,q) and the mean of the interval ends is reported.

- **P1.** My run reproduces the Atelier's cells: at q=0.03, e=100, "one population 3x" = 0.805
  (within 0.005); at q=0.004, e=200, "strangers 3x" = 0.449 (within 0.005); smallest pooled read to
  reach 3x with zero odd frames: 219 (plain) and 261 (discounted).
- **P2.** At q=0 and e=1262 (all unread frames read, none odd), the joined upper end at rho 0.05 is
  between 0.5 % and 1.0 %.
- **P3.** At q=0 and e=100, the upper end falls from 2.13 % to between 1.0 % and 1.6 %.
- **P4.** At q=0.03 and e=400 the mean lower end rises above 0.5 % (it is 0.14 % now).
- **P5.** At e=1262, q=0, more than half of the upper end is the licensed stratum's contribution
  (upper end with the licensed stratum zeroed is under half the full one).
- **P6.** The upper end at q=0 is monotone non-increasing in e, at both rho.
Refutation: any of these failing as worded.
