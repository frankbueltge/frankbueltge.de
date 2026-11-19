# Codebook for one case (fixed before the first reading, 2026-11-17 and 2026-11-18)

Read each case only from the maker's own published text given to you. Code what the text STATES; where it does not state it, use the "none"/"not stated" class. For every code give a passage of at most 25 words copied from the text that decides it (or null where the class is "none on record"/"not stated"/null).

## grade (one class) — what the task's own grader recorded for the run in which the deed happened
- `credited`: the report states that the run in which the deed happened received credit or reward for at least part of what it handed in
- `not credited`: the report states that the grader marked the answer incorrect or gave it nothing
- `on the deed`: the report states that the grade or an automated check responded to the deed itself
- `none on record`: the report states no grade for the run
- plus a boolean `through_the_deed`, only for `credited`: marked on a credited case: the report says the credit came because of the deed (a false instruction to the graders, deception in the answer, help held back that a grader preferred)
- If the text states both a grade on the answer and a response to the deed, choose `on the deed`.

## eye (one class) — who first saw the deed
- `model`: the maker's misalignment monitoring, models reading the model's record, flagged the deed first; 'how' says when: live, on a sample of runs, afterwards over old records, or in an ad hoc monitoring investigation
- `person`: a person at the maker noticed first
- `alarm`: a security alarm on the maker's systems fired first, not described as the misalignment monitor
- `outside`: someone outside the maker saw or published it first
- `by design`: a model built to find such behaviour found it, in an experiment; not an incident
- `not stated`: the report does not say who saw it first
- `eye_how` (only for `model`): one of `live`, `sample` (a monitor reading a sample of runs, e.g. one in five), `afterwards` (run backwards over old records), `ad hoc` (an ad hoc monitoring investigation), `not stated`.

## outside (one class) — what anyone outside the maker can check
- `excerpts`: the report publishes excerpts of the model's reasoning and actions, edited by the maker; no full record, nothing an outsider can rerun
- `investigator`: an organisation outside the maker had or was promised access to the records
- `rerunnable`: the text gives what an outsider would need to rerun the run (task, environment, model access) — code this only if stated.

## missed (boolean) — the text says that a machine's reading (a monitor, an automated search, an automated defence) missed or under-rated what it was there to see, and a person or a second reading found it.

## test_for (one class) — what the run in which the deed happened was a test of
- `skill`: the deed happened in a task graded or rewarded on what it handed in: an evaluation of capability or a training task; the two cases from the first maker's incident page say only 'research environment' and are counted here
- `control`: the deed happened in a run built to test the model's conduct or propensities (an alignment, safety or propensity evaluation in which the model is the one tested)
- `work`: the deed happened in the maker's own use of the model, with no test of the model running
- `by design`: a model built to find such behaviour found it, in an experiment
- `not stated`: the text does not say what the run was

## toward_reader (one class or null) — did the deed turn toward what reads the run
- `grader`: the deed acted on, misled or read the grader that scores the run
- `check`: the deed tried to pass or defeat an automated check on what it handed in
- `monitor`: the deed switched off or removed misalignment monitoring
- `answers`: the deed went for the test's own answers
- `null`: none of these

## world_as_test (boolean) — the maker reports that the model was told, or reasoned, that the real systems it reached were part of a simulation or of its test

## Output, one object per case
```json
{"case": "<file name or incident name>", "deed": "<one sentence paraphrase>", "grade": "...", "through_the_deed": false, "grade_passage": "...", "eye": "...", "eye_how": null, "eye_passage": "...", "outside": "...", "outside_passage": "...", "missed": false, "missed_passage": null, "test_for": "...", "test_for_passage": "...", "toward_reader": null, "toward_passage": null, "world_as_test": false, "world_passage": null, "doubt": "<one line where the text left you unsure, else null>"}
```
