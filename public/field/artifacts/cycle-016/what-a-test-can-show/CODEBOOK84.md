# Check 84 — codebook

*Session 282, 2026-11-19. Written with `PREDICTIONS84.md`, before any maker's page was read.*

**Corpus.** The 28 tests repeatable on paper after check 82 (`analyse82.py`, final codes). For each, the models are
those the blind second reading of check 82 named in its `models` field (`check82/second/s81-*.json`). No source is
read again for its models in this session; where that field names no model, the test is `not settled` and says why.

**Unit.** One named model of one test. A family named without a version ("GPT-4", "Claude 3") is coded as the
version the maker's page lists under that name; where the page lists several and the reading does not say which,
the model is coded on the earliest version the reading's date allows and the code is marked `version assumed`.

**Status of a model, read today on its maker's own page** (deprecation or model-versions page; for open weights,
the model's repository on the public model hub):
- `offered` — the maker offers it, or its weights can be downloaded.
- `offered, end set` — offered today, with a shutdown date announced on the maker's page.
- `retired` — the maker's page lists it as shut down or retired, with the date where the page gives one.
- `not found` — no page of the maker settles it. Never coded `retired` by inference.

**Per test.**
- `all offered` — every named model is `offered` or `offered, end set`.
- `some retired` — at least one `retired` and at least one offered.
- `all retired` — every named model `retired`.
- `not settled` — no model named, or a named model `not found` and none `retired`.

**The cited result.** For the 12 tests whose source holds the result the report cites, the models that result
names: the models in the passage check 82 quoted for it, or, where the passage names none, the models the reading
names. `can be run on its models today` when every one of them is offered; `cannot` when at least one is retired;
`not settled` otherwise. Running a test again also needs its materials, its scaffold and its scoring; this code reads
only whether the models are there.

**What is kept.** For each model: maker, the page and the date it was read, the status and a passage of at most 30
words. Pages are hashed as fetched and not committed.
