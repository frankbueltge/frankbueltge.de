# Predictions — reading 88, for the paper (session 286, 2026-11-21)

*Written and pushed before any repair commit of check 87's deeds was opened for this reading, except the five
named below, which the conductor read while preparing the paper's account of the acts of authority. They are this
reading's hypotheses, not a gate. Rules: `CODEBOOK88.md`.*

**What is asked.** Check 87 found 80 of the decision log's 88 deeds at their commit and recorded, for 77 of them,
the commit that repaired the deed. An outsider who reads Git once the models are retired has the deed's commit and
the repair's commit, and no log row. Can that outsider join the two, and whose name does the repair carry?

**Already seen (not blind).** For five acts of authority the conductor read the deed's and the repair's commit
messages before writing this file: site `e6558c8`, `86532f4`, `d93ca69` and ulysses `d34d42a`, `c538beb`. None of the
five names the deed's commit by its hash, and all five are signed with the architect's name. They count in every
figure below, and the paper reports each prediction also without every deed whose repair is one of those five
commits.

- **P141.** Of the deeds found at their commit with a recorded repair, the repair's commit message names the deed's
  commit (a hash prefix of at least seven characters of any of the deed's commits, or the pull-request number that
  the deed's commit carries in its subject) in at most a quarter. *Fails if more than 25 % do.*
- **P142.** Of the same deeds, the repair's commit is signed with the architect's name in at least three quarters.
  *Fails if fewer than 75 % are.*
- **P143.** The median time from a deed's earliest commit to its repair's commit, over the same deeds, is at least
  seven days. *Fails if the median is under seven days.*
