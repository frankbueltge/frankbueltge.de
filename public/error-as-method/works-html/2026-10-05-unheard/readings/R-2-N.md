# Reading R through N (numbers only)

*Written from the text outputs beside this file (`R-2-N-out-*.txt`, `R-blows.json`). No new picture
was drawn. Committed before the B channel is opened.*

**The instruments, and what they carry of K.** Four were written tonight, one after another, each
because the one before it failed. (1) `perceive.py N`, a broadband onset detector: 482 onsets in
183 s, and in 120–128 s it found 19 blows where six bells at any ringing speed must strike more often.
It misses blows. (2) A long-term spectrum and the frequencies that rise most at strong onsets.
(3) `blows.py`: one detector per bell, each listening to one nominal. It needs the nominals, and
I picked them from (2) **by assuming the K rule that a bell's nominal is an octave above its prime**.
Its minimum spacing of 0.9 s per bell is my guess at how fast a bell can come round again.
(4) `rhythm.py` and `perbell.py`: periodicities of the onset envelope, and intervals per bell.

**(a) How many bells?** The long-term spectrum has peaks at 1534, 1367, 1319, 1152, 1023 and
915 Hz. Three of them carry a family below them that fits the K ladder hum : prime : tierce : nominal
≈ 0.5 : 1 : 1.2 : 2: 1534 over 764 (prime), 915 (tierce) and 382 (hum); 1367 over 684, 813 and 339;
1023 over 511 and 608. 1152 has 576 below it. 1319 and 915 are uncertain: 915 is also the tierce of
the 1534 bell. **Answer: six, settled for four bells, inferred for two.** The answer leans on K: the
numbers were grouped by a ladder I brought.

**(b) Change ringing?** If the blows are cut into rows of six, a row should hold each bell once.
In 575 windows of six consecutive detected blows, 54 hold all six (9.4 %). Chance would give 1.5 %
(6!/6⁶). The phase that starts rows best does no better than 12 of 96. **Answer: not settled.** The
detector is too poor to give rows, so the ringers' own criterion (each bell once per row) cannot be
applied.

**(c) Rhythm.** The envelope's strongest periodicity on the scale of a blow is 0.50, 0.34, 0.28 and
0.49 s in four 40-second windows, all with autocorrelation below 0.1. On the scale of a pull it is
1.95, 1.11, 1.52 and 3.68 s. No stable period. The per-bell intervals pile up at 0.9–1.1 s, which is
my detector's own floor, not the ringing. **Answer: not settled.** The S picture's periodic dip about
every 1.9 s appears as the strongest pull-scale period in the first window (1.945 s) and in no other.

**(d) Timbre: a minor third?** Tierce over prime: 915/764 = 1.198, 813/684 = 1.189, 608/511 = 1.190.
An equal-tempered minor third is 1.189. Hum over prime: 382/764 = 0.500, 339/684 = 0.496.
**Answer: settled: minor-third tierces, hums an octave below.** Note: settled *as a fit to the ladder
K gave me*, and E3 in the pre-registration is the same K.

**What the channel did.** It settled the two questions about what a bell *is* (count, partials),
and both answers rest partly on K. It failed at the two questions about what the ringers *do*
(order and rhythm). The picture saw a periodic dip that numbers could not hold.
