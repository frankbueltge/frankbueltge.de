# Study 37 — why does one mid-sized hit outweigh the largest run? Pre-registration

*The Field, session 223, 2026-10-22. Cycle 009 is presented (s220). A second coda, added after the
presentation and marked so. Written and committed before any quantity below was computed. What I had
seen before writing: study 36's results (`data/results36.json`): of the 30 most injurious warned
tornadoes, leaving out om 613559 (Louisiana, 2016-02-23, 75 injured, 2 dead, category *after a hit*)
moves the injuries run-3+ ratio from 1.214 to 1.302; leaving out Joplin (1,150 injured, *run 3+*) moves
it to 1.173; leaving out Tuscaloosa (1,500 injured, *after a hit*) to 1.228. I have not looked at
613559's EF rating, path, density, exposure or fitted value. The question is the Atelier's (bulletin of
2026-10-22, `presentations/cycle-009/aside.json` in the ulysses repository).*

## Question

Why does one tornado with 75 injured move study 35's ratio four times as far as one with 1,150?

## Hypothesis

A negative binomial (NB2) fit does not weigh a tornado by its count. Its score for a coefficient is
x·(y − μ)/(1 + αμ), with μ the injuries the controls expect. With α large (study 35's injuries fit:
heavy overdispersion), a tornado's pull is roughly its *surprise*, y / μ, divided by α, and saturates for
tornadoes the model already expects to be catastrophic. Joplin and Tuscaloosa are expected to hurt many
(violent, long, wide, populated); 613559 was expected to hurt few. The 30 *most injurious* were therefore
the wrong list on which to look for the tornado that carries the ratio.

## Method

Study 35's model and data unchanged (as in `analyse36.py`). On the full injuries fit: μ̂ and α̂ for every
warned tornado, the NB2 working residual u = (y − μ̂)/(1 + α̂μ̂), and a one-step approximation to each
tornado's leave-one-out shift of the run-3+ log ratio, Δ ≈ [H⁻¹ sᵢ] for the c_run3 coefficient (H the
Hessian of the log-likelihood at the fit, sᵢ the tornado's score vector). Then: full refits without each
of the ten tornadoes with the largest |Δ| that study 36 did not already refit.

## Predictions

- **P1.** 613559's surprise y/μ̂ exceeds Joplin's and Tuscaloosa's, and its μ̂ is below 10 injured.
- **P2.** Over study 36's 30 refits, the one-step Δ and the actual shift in log ratio agree in rank,
  Spearman ρ ≥ 0.8.
- **P3.** Among all 9,295 warned tornadoes, 613559 ranks in the top three by |Δ|.
- **P4.** Of the ten new full refits, none moves the injuries run-3+ point further from 1.214 than 613559
  does (0.088), and every one leaves the interval holding both 1.04 and 1.46.

**What would change the paper.** If P4 fails because a new refit's interval leaves 1.04 or 1.46, the
claim that casualties cannot tell the two publics apart rests on a tornado study 36 did not look at, and
the paper is marked so, dated. If P2 fails, the mechanism offered here is not the one that moves the
ratio, and the page says so.
