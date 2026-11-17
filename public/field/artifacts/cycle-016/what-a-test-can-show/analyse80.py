"""Study 80: count the first coding of the report's sentences on evaluation and test P117-P119.

Usage: python3 -I analyse80.py <report.pdf>
Reads sentences80.json, coding80.json, PREDICTIONS80.md; writes results80.json and data80.js (the page's data).
The report is read again only to check the in-text asterisks against its reference list.
"""
import hashlib
import json
import math
import re
import subprocess
import sys
from collections import Counter

PDF = sys.argv[1]
S = json.load(open('sentences80.json'))
C = {r['id']: r for r in json.load(open('coding80.json'))['rows']}
sents = S['sentences']
cand = [s for s in sents if s['candidate']]
assert set(C) == {s['id'] for s in cand}, 'every candidate coded once'


def ind(ref):
    return ref.endswith('*')


def wilson(k, n, z=1.96):
    if n == 0:
        return [None, None]
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [round(100 * (c - h), 1), round(100 * (c + h), 1)]


def newcombe(k1, n1, k2, n2):
    """95 % interval for p1 - p2 (Newcombe's hybrid score method), in percentage points."""
    l1, u1 = [x / 100 for x in wilson(k1, n1)]
    l2, u2 = [x / 100 for x in wilson(k2, n2)]
    p1, p2 = k1 / n1, k2 / n2
    d = p1 - p2
    lo = d - math.sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2)
    hi = d + math.sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2)
    return [round(100 * lo, 1), round(100 * hi, 1)]


E = [s for s in cand if C[s['id']]['about']]
E_ids = {s['id'] for s in E}
rest = [s for s in sents if s['id'] not in E_ids]

# --- P117: who the evidence comes from (the report's own asterisk) ---
e_cited = [s for s in E if s['refs']]
r_cited = [s for s in rest if s['refs']]
e_ind = sum(1 for s in e_cited if any(ind(r) for r in s['refs']))
r_ind = sum(1 for s in r_cited if any(ind(r) for r in s['refs']))
e_share = 100 * e_ind / len(e_cited)
r_share = 100 * r_ind / len(r_cited)
diff = e_share - r_share
p117 = diff >= 10

refs_e = {r.rstrip('*'): ind(r) for s in E for r in s['refs']}
refs_r = {r.rstrip('*'): ind(r) for s in rest for r in s['refs']}
refs_all = {r.rstrip('*'): ind(r) for s in sents for r in s['refs']}

# --- the reference list, read again, to check the in-text asterisks ---
text = subprocess.run(['pdftotext', PDF, '-'], capture_output=True, check=True).stdout.decode('utf-8')
assert hashlib.sha256(open(PDF, 'rb').read()).hexdigest() == S['report_sha256']
listed, twice = {}, []
for line in text[text.index('An asterisk (*) denotes'):].split('\n'):  # the list's columns come out of order
    m = re.match(r'(\d{1,4})(\*?) \S', line)
    if m and 1 <= int(m.group(1)) <= 1451:
        if m.group(1) in listed:
            twice.append(int(m.group(1)))
            continue
        listed[m.group(1)] = m.group(2) == '*'
mismatch = sorted(int(n) for n, star in refs_all.items() if n in listed and listed[n] != star)
unlisted = sorted(int(n) for n in refs_all if n not in listed)

# --- grades, what is tested, pass marks ---
grade = Counter(C[s['id']]['grade'] for s in E)
tests = Counter(C[s['id']]['tests'] for s in E)
cross = {t: dict(Counter(C[s['id']]['grade'] for s in E if C[s['id']]['tests'] == t)) for t in tests}


def open_share(t):
    grp = [s for s in E if C[s['id']]['tests'] == t]
    k = sum(1 for s in grp if C[s['id']]['grade'] == 'open')
    return k, len(grp)


oc, nc = open_share('control')
op_, np_ = open_share('capability')
p118_informative = nc >= 10 and np_ >= 10
p118 = (oc / nc) >= 2 * (op_ / np_) if p118_informative else None

passes = [s for s in E if C[s['id']]['pass']]
setters = Counter(C[s['id']]['setter'] for s in passes)
p119_informative = len(passes) >= 5
p119 = (setters['developer'] >= 2 * len(passes) / 3 and setters['public body'] == 0) if p119_informative else None


# --- the footing of the measured sentences ---
def footing(s):
    if not s['refs']:
        return 'no citation'
    k = sum(ind(r) for r in s['refs'])
    return 'industry only' if k == len(s['refs']) else ('none industry' if k == 0 else 'mixed')


measured = [s for s in E if C[s['id']]['grade'] == 'measured']
foot_measured = Counter(footing(s) for s in measured)
foot_all = Counter(footing(s) for s in E)
by_grade_foot = {g: dict(Counter(footing(s) for s in E if C[s['id']]['grade'] == g)) for g in grade}
sections = {}
for s in E:
    sec = sections.setdefault(s['section'], Counter())
    sec[C[s['id']]['grade']] += 1
sections = {k: dict(v) for k, v in sections.items()}

pred_sha = hashlib.sha256(open('PREDICTIONS80.md', 'rb').read()).hexdigest()
R = {
    'study': 80, 'session': 278, 'date': '2026-11-17', 'cycle': 16, 'programme_step': 4,
    'report': {'title': 'International AI Safety Report 2026', 'sha256': S['report_sha256'], 'pages': 220,
               'body_pages': '14-146', 'licence': 'Open Government Licence v3.0',
               'url': 'https://internationalaisafetyreport.org/sites/default/files/2026-02/international-ai-safety-report-2026_1.pdf'},
    'predictions_file_sha256': pred_sha,
    'body_sentences': len(sents), 'candidates': len(cand), 'on_evaluation': len(E),
    'not_on_evaluation': len(cand) - len(E),
    'cited': {'evaluation': len(e_cited), 'evaluation_industry': e_ind, 'evaluation_share': round(e_share, 1),
              'evaluation_ci': wilson(e_ind, len(e_cited)),
              'rest': len(r_cited), 'rest_industry': r_ind, 'rest_share': round(r_share, 1),
              'rest_ci': wilson(r_ind, len(r_cited)),
              'difference_pp': round(diff, 1), 'difference_ci': newcombe(e_ind, len(e_cited), r_ind, len(r_cited))},
    'references': {'evaluation_distinct': len(refs_e), 'evaluation_industry': sum(refs_e.values()),
                   'evaluation_industry_share': round(100 * sum(refs_e.values()) / len(refs_e), 1),
                   'rest_distinct': len(refs_r), 'rest_industry': sum(refs_r.values()),
                   'rest_industry_share': round(100 * sum(refs_r.values()) / len(refs_r), 1),
                   'all_distinct': len(refs_all), 'all_industry': sum(refs_all.values()),
                   'list_entries_read': len(listed), 'list_numbers_seen_twice': sorted(twice), 'list_missing': sorted(set(range(1, 1452)) - {int(n) for n in listed}), 'list_industry': sum(listed.values()),
                   'asterisk_mismatch_text_vs_list': mismatch, 'cited_not_found_in_list': unlisted},
    'grade': dict(grade), 'tests': dict(tests), 'grade_by_tests': cross,
    'open_share': {'control': [oc, nc, round(100 * oc / nc, 1)], 'capability': [op_, np_, round(100 * op_ / np_, 1)]},
    'pass_marks': {'n': len(passes), 'setters': dict(setters), 'ids': [s['id'] for s in passes]},
    'footing_measured': dict(foot_measured), 'footing_all': dict(foot_all), 'footing_by_grade': by_grade_foot,
    'by_section': sections,
    'predictions': {'P117': p117, 'P118': p118, 'P119': p119},
}
R['predictions_held'] = sum(1 for v in R['predictions'].values() if v is True)
R['predictions_informative'] = sum(1 for v in R['predictions'].values() if v is not None)
json.dump(R, open('results80.json', 'w'), indent=1)

rows = []
for s in E:
    c = C[s['id']]
    rows.append({'id': s['id'], 'page': s['page'], 'section': s['section'], 'text': s['text'], 'refs': s['refs'],
                 'grade': c['grade'], 'tests': c['tests'], 'pass': c['pass'], 'setter': c.get('setter'),
                 'footing': footing(s), 'note': c.get('note')})
cut = [{'id': s['id'], 'page': s['page'], 'text': s['text'], 'note': C[s['id']].get('note')}
       for s in cand if not C[s['id']]['about']]
# every body sentence as a mark of the strip: page, on evaluation or not, cited, industry-cited
strip = [[s['page'], 1 if s['id'] in E_ids else 0, 1 if s['refs'] else 0,
          1 if any(ind(r) for r in s['refs']) else 0] for s in sents]
open('data80.js', 'w').write('window.D80=' + json.dumps({'R': R, 'rows': rows, 'cut': cut, 'strip': strip},
                                                        ensure_ascii=False) + ';\n')
print(json.dumps({k: R[k] for k in ['body_sentences', 'candidates', 'on_evaluation', 'cited', 'grade', 'tests',
                                     'open_share', 'pass_marks', 'footing_measured', 'predictions']}, indent=1))
print('refs', R['references'])
