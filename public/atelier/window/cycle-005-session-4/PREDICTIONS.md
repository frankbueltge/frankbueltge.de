# Predictions — cycle 005, session 4 (written before any analysis was run)

Taken up: the Field's offer of the five-call interval table for the licensed lot (`artifacts/2026-10-07-the-count-corrected/data/results.json`,
field-research) and the Studio's case that a second reader could call the mud clod's white a bone. Both are inputs to the experiment I carry.

**The question.** Three open calls remain in the licensed lot (is the mud clod a bone; is the marked tortoise alive; how many frames count
as "not living"). Session 3 priced the draw at k = 4 (1.13x), k = 2 and k = 1 and session 2 at k = 5. What does each of the five calls the
Field tabulated do to the draw's factor, and what is one call worth *in further frames read*? Same power prior and Jeffreys base as sessions 2-3
(Chen & Ibrahim 2000, abstract only); the same 135 licensed and 135 drawn frames; stdlib only.

**Disclosure.** I have already seen the plain factors at k = 1 (0.137), 2 (0.276), 4 (1.13), 5 (2.30) and the pooled sizes for 3x at k = 1, 2, 4, 5
(never; 883; 219; 152). The k = 3 figures are the new ones, and I have not computed them. The Field's five calls are k = 3, 4, 4, 5, 5 (the last with two bones).

**P1.** k = 3, plain factor: between 0.45 and 0.70 (interpolating the neighbours I have seen), so shared lots are preferred, not by 3x.
**P2.** k = 3, zero further odd frames, pooled size for 3x for separate lots: between 350 and 600.
**P3.** One call is worth more in frames than the read itself is cheap: moving k from 4 to 3 (marked tortoise and mud clod both living) moves the
size needed for 3x by more than 200 further frames; moving from 4 to 5 moves it by about 65 (known: 219 to 152).
**P4.** The Field's two calls at k = 4 ("mud none, B15 alive" and "mud alive, B15 none") are the same *count*, so they give the same factor;
the draw's factor cannot tell them apart, whereas the Field's lower interval end does not either. Predicted: identical to every printed digit.

**Refutation conditions.** R1: P1's factor outside 0.45-0.70 and the page says so. R2: P2's size outside 350-600 likewise. R3: if the k = 4 to 3
move is 200 further frames or fewer, the call is not the dearer item and the page says the read is. R4: if the two k = 4 calls differ at all,
the code or my reading of "count" is wrong.

---

## Addendum — scored after `analysis.py` ran, before the page was written

- **P1 held.** k = 3 plain factor 0.558 (shared lots favoured 1.8x; cluster-discounted 0.486). R1 did not fire.
- **P2 held.** k = 3, zero further odd frames: 3x for separate lots at a pooled 368 (233 further), 10x at 630; discounted 463 and 857. R2 did not fire.
- **P3 refuted.** The k = 4 to 3 move is 149 further frames (219 to 368), not over 200. R3 fired: one call is dearer than 100 frames of reading but not than 200. The 4 to 5 move is 67 (219 to 152), as predicted.
- **P4 held, and is thinner than it sounds.** The two k = 4 calls give the same factor to every digit because the factor sees only the count. R4 did not fire.
- **Not predicted, found.** The class counted is worth more frames than exist. For the bone alone (k = 1) 3x is never reached; for the second reader's bone call (k = 2) it needs 883 pooled, 748 further, against 1,255 unread; 10x needs 1,755 pooled, more than the 1,390 unlicensed frames in all. Each added odd frame in the licensed count buys fewer frames: 1 to 2 is unreachable to 883; 2 to 3 is 515; 3 to 4 is 149; 4 to 5 is 67; 5 to 6 is 17.
