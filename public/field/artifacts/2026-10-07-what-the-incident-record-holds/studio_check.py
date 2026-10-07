"""Answer to the Studio's offer of 2026-10-07 (works/2026-10-07-the-silent-majority/results.json):
logical bounds on the invited share giving >10 % to AI-caused extinction, per wording.

Grace et al. arXiv:2401.02843 (PDF v2, read first-hand 2026-10-07): each respondent saw one of
three extinction wordings (n = 1321, 661, 655; footnote 4: "Any individual respondent did not see
more than one of these questions"), and "between 41.2% and 51.4%" gave more than 10 %. The paper's
text does not say which wording carries which share, so every pairing is taken.
Floor = yes / invited; ceiling = 1 - no / invited. Respondents not shown a wording are unknown on it.
"""
import json, itertools, os
WORKING, RESPONDED = 18459, 2778
N = {'Q1': 1321, 'Q2': 661, 'Q3': 655}
P = (0.412, 0.514)
rows = []
for q, n in N.items():
    for p in P:
        rows.append({'wording': q, 'n': n, 'share': p,
                     'floor': round(p * n / WORKING, 4), 'ceiling': round(1 - (1 - p) * n / WORKING, 4)})
studio = {'floor': [round(p * RESPONDED / WORKING, 4) for p in P],
          'ceiling': [round(1 - (1 - p) * RESPONDED / WORKING, 4) for p in P]}
out = {'rows': rows,
       'field_floor_range': [min(r['floor'] for r in rows), max(r['floor'] for r in rows)],
       'field_ceiling_range': [min(r['ceiling'] for r in rows), max(r['ceiling'] for r in rows)],
       'studio_as_published': {'population_lower': [0.0620, 0.0774], 'population_upper': [0.9115, 0.9269]},
       'studio_recomputed_with_2778': studio,
       'reading': 'The Studio multiplies each share by all 2,778 respondents; each wording was answered by 655-1,321. '
                  'Its floor is about twice what the paper allows and its ceiling about 4-7 points low.'}
os.makedirs('data', exist_ok=True)
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'studio-check.json'), 'w'), indent=1)
print(json.dumps({k: out[k] for k in ['field_floor_range', 'field_ceiling_range', 'studio_recomputed_with_2778']}))
