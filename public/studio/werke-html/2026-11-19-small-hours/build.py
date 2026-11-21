#!/usr/bin/env python3
"""SMALL HOURS: build the record the world is drawn from.

Reads every non-merge commit of the four ecology repositories at the heads the Field's census
(study 85) read, and the census's own items (items85.json, field-research commit a26d1dc),
and writes data.js. State 2 (session 256) adds who saw first: the Field's study 86
(results86.json and codes86.json, field-research commit bc1dc14) and the decision log those
codes refer to (frankbueltge.de commit 7f92ac3). State 3 (session 257) reads the Field's check 87
(field-research ce3a5de). State 4 (session 258) reads each deed's mending from the Field's reading 88
(credit88.json, field-research 1c00dd2) and the Atelier's sort (sort.json, ulysses aa8a96e), and
times each mending from its own repository. State 5 (session 259, after the presentation) reads each join from the
deed's end: the Field's reading 89 (join89.json and heirs89.json, field-research e08ba8f) and the Atelier's state 5
(both.json, ulysses b05b358), and times each earlier hand from its own repository. Nothing here calls a model. Run from any checkout that
holds the repositories side by side with full history (the four, frankbueltge.de, machine-attention
and error-as-method):

    python3 build.py ../../..        # the folder that holds studio/, field-research/, ...

Every figure the page prints is computed here into data.js under `facts`, and check.mjs reads
the page against this file.
"""
import datetime
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '../../..').resolve()
HERE = Path(__file__).resolve().parent
BERLIN = ZoneInfo('Europe/Berlin')

# The heads study 85 read (results85.json, "heads"); the census commit itself.
HEADS = {
    'studio': '39fccb842d24128148ce91fcac50faa3d79459ee',
    'field-research': '56a4100e70dce166a2d6baf927924e45d2853488',
    'ulysses': 'd0e7a5178a4f2cf3785b690dc88f447f51f10f4a',
    'research-ecology': '639701d06ef5a1778cd43cbd1cc208b7d7f78a5d',
}
PRACTICE = {'studio': 'The Studio', 'field-research': 'The Field', 'ulysses': 'The Atelier',
            'research-ecology': 'The Middle'}
CENSUS = {'repo': 'field-research', 'commit': 'a26d1dce78ac3b10c20c93997906d6904ba855a3',
          'path': 'artifacts/cycle-017/what-the-house-did-unasked/items85.json'}
REPOS = list(HEADS)

# How a signature is read, from its name alone: that is all an outsider has.
WORKFLOW = ('Integrate', 'Snapshot', 'Schleuse', 'Steuerzentrale', 'Saat')
ARCHITECT = 'Frank Bültge'
# Names of the model families the house's sessions ran on. The record names them in a few places;
# this work counts those places and shows them redacted (it names no product in its own voice).
MODEL_NAMES = re.compile(r'\b(Claude(?: Code)?|Fable|Opus|Sonnet|Haiku)\b')


def git(repo, *args):
    return subprocess.run(['git', '-C', str(ROOT / repo), *args], capture_output=True, text=True,
                          check=True).stdout


def kind(name, repo):
    if name == ARCHITECT:
        return 2            # the architect's name: he, or a session acting for him
    if any(w in name for w in WORKFLOW) or workflow_with_a_practice_name(name, repo):
        return 1            # a workflow of the house: a script, not a model
    return 0                # a machine's name: a model-run session of a practice


def workflow_with_a_practice_name(name, repo):
    """Corrected 2026-11-20 (session 256), after the Field's correction of study 85 (results86.json,
    `correction85`): the Atelier's lander signs "Atelier", the Field's autoloop signs "Meridian (autoloop)",
    and the Field's layer-2 queue signs "Protokollführung (layer-2 runner)". All three are workflows.
    State 1 counted them as model-run sessions."""
    return (name == 'Atelier' and repo == 'ulysses') or name == 'Meridian (autoloop)' or \
        'layer-2 runner' in name


def redact(s):
    return MODEL_NAMES.sub('[a model’s name]', s)


commits = []
for repo in REPOS:
    head = HEADS[repo]
    assert git(repo, 'rev-parse', head).strip() == head, repo
    raw = git(repo, 'log', head, '--no-merges', '--numstat',
              '--format=\x1e%H\x1f%an\x1f%ae\x1f%aI\x1f%s')
    for block in raw.split('\x1e')[1:]:
        head_line, _, rest = block.partition('\n')
        h, an, ae, at, subj = head_line.split('\x1f')
        lines = files = 0
        for row in rest.strip().splitlines():
            a, d, _p = row.split('\t', 2)
            files += 1
            if a != '-':
                lines += int(a) + int(d)
        t = datetime.datetime.fromisoformat(at)
        commits.append({'repo': repo, 'h': h, 'an': an, 'ae': ae, 't': t, 'subj': subj,
                        'lines': lines, 'files': files, 'kind': kind(an, repo),
                        'was_machine': workflow_with_a_practice_name(an, repo),
                        'named': bool(MODEL_NAMES.search(an) or MODEL_NAMES.search(subj))})

commits.sort(key=lambda c: (c['t'], c['repo'], c['h']))
index = {(c['repo'], c['h']): i for i, c in enumerate(commits)}

# The census: study 85's items, read from the Field's commit, never copied by hand.
items = json.loads(subprocess.run(
    ['git', '-C', str(ROOT / CENSUS['repo']), 'show', f"{CENSUS['commit']}:{CENSUS['path']}"],
    capture_output=True, text=True, check=True).stdout)
census_raw = subprocess.run(['git', '-C', str(ROOT / CENSUS['repo']), 'show',
                             f"{CENSUS['commit']}:{CENSUS['path']}"], capture_output=True,
                            check=True).stdout
census_sha256 = hashlib.sha256(census_raw).hexdigest()
census_time = datetime.datetime.fromisoformat(
    git(CENSUS['repo'], 'log', '-1', '--format=%aI', CENSUS['commit']).strip())
rules = {}
breaches = []
bound = Counter()
for it in items:
    i = index.get((it['repo'], it['commit']))
    assert i is not None, ('census item outside this record', it['repo'], it['commit'])
    bound[i] += 1
    if it['breach']:
        breaches.append({'c': i, 'rule': it['rule'], 'path': it['path'], 'value': it['value'],
                         'robust': bool(it.get('robust'))})
assert len(items) == 8098 and len(breaches) == 171, (len(items), len(breaches))
# the limit each rule set, from the census's own rule file
rules85 = json.loads(subprocess.run(
    ['git', '-C', str(ROOT / CENSUS['repo']), 'show',
     f"{CENSUS['commit']}:artifacts/cycle-017/what-the-house-did-unasked/rules85.json"],
    capture_output=True, text=True, check=True).stdout)
LIMIT = {}
for r in rules85:
    if r['kind'] == 'limit':
        LIMIT.setdefault((r['practice'], r['rule']), r['limit'])
PRACTICE_KEY = {'studio': 'studio', 'field-research': 'field', 'ulysses': 'atelier'}
for b in breaches:
    c = commits[b['c']]
    b['limit'] = LIMIT[(PRACTICE_KEY[c['repo']], b['rule'])]

# The Atelier's recount of its own digest (On Its Own Account, state 1), read from its commit.
ATELIER = {'repo': 'ulysses', 'commit': '78dd6f7bde32f23f7e84e7adbb9e9c14a06b9794',
           'path': 'artifacts/cycle-017/on-its-own-account/data/digest.json'}
digest_raw = subprocess.run(['git', '-C', str(ROOT / ATELIER['repo']), 'show',
                             f"{ATELIER['commit']}:{ATELIER['path']}"], capture_output=True,
                            check=True).stdout
digest = json.loads(digest_raw)
recount_time = datetime.datetime.fromisoformat(
    git(ATELIER['repo'], 'log', '-1', '--format=%aI', ATELIER['commit']).strip())


def ulysses_index(short):
    full = git('ulysses', 'rev-parse', short).strip()
    return index[('ulysses', full)]


run_of = {}
for run in digest['runs']:
    for h in run['versions']:
        run_of[h] = run
own = []
for v in digest['versions']:
    if not (v['after'] and v['over']):
        continue
    run = run_of[v['h']]
    i = index[('ulysses', v['H'])]
    seen = None
    if run['status'] == 'seen':
        sb = run['seen_by'][0]
        j = ulysses_index(sb['commit'])
        seen = {'c': j, 'by': 'own'}
    missed = None
    if run.get('missed_by'):
        j = ulysses_index(run['missed_by'][0]['commit'])
        missed = {'c': j}
    own.append({'c': i, 'n': v['n'], 'run': run['k'], 'seen': seen, 'missed': missed})
assert len(own) == digest['figures']['over_after'] == 38, len(own)
assert len({o['run'] for o in own}) == digest['figures']['runs'] == 15
seen_runs = {o['run'] for o in own if o['seen']}
assert len(seen_runs) == digest['figures']['runs_seen'] == 7
run_delay = {}
for o in own:
    if o['seen']:
        d = (commits[o['seen']['c']]['t'] - commits[o['c']]['t']).total_seconds() / 3600
        run_delay[o['run']] = max(run_delay.get(o['run'], 0), d)   # from the run's first version
own_delays = sorted(run_delay.values())

# ---- state 2: who saw first (the Field, study 86, state 2), read from the Field's commit ----
SEEN = {'repo': 'field-research', 'commit': 'bc1dc14f07024fe1ed2875649c756d30fd797f7f',
        'dir': 'artifacts/cycle-017/what-the-house-did-unasked'}


def show(repo, commit, path):
    return subprocess.run(['git', '-C', str(ROOT / repo), 'show', f'{commit}:{path}'], capture_output=True,
                          check=True).stdout


r86_raw = show(SEEN['repo'], SEEN['commit'], SEEN['dir'] + '/results86.json')
r86 = json.loads(r86_raw)
codes86 = json.loads(show(SEEN['repo'], SEEN['commit'], SEEN['dir'] + '/codes86.json'))
REPO_OF = {'field': 'field-research', 'atelier': 'ulysses', 'studio': 'studio'}

# Part A: the census's breaches, each with who named it first. The same 171 as items85.json.
assert sorted((REPO_OF[i['practice']], i['commit'], i['rule'], i['path']) for i in r86['partA']['items']) == \
    sorted((commits[b['c']]['repo'], commits[b['c']]['h'], b['rule'], b['path']) for b in breaches)
selfseen = []
for it in r86['partA']['items']:
    if it['seen_by'] != 'the practice itself':
        assert it['seen_by'] == 'the census'
        continue
    i = index[(REPO_OF[it['practice']], it['commit'])]
    s = it['sighting']
    j = index[(s['repo'], s['commit'])]
    assert commits[j]['t'] == datetime.datetime.fromisoformat(s['time']) and commits[j]['t'] > commits[i]['t']
    assert REPO_OF[s['signer']] == s['repo'] == REPO_OF[it['practice']]    # the practice named its own breach
    match = [b for b in breaches if b['c'] == i and b['rule'] == it['rule'] and b['path'] == it['path']]
    assert len(match) == 1
    match[0]['by'] = j
    selfseen.append({'c': i, 'by': j, 'rule': it['rule'], 'where': s['path']})
assert len(selfseen) == r86['partA']['seen_before_census'] == 8

# Part B: the architect's decision log, every row coded by the Field; the deeds beyond or against instructions.
LOG = {'repo': 'frankbueltge.de', 'commit': '7f92ac31d892470110bb97b8ae10bc1ab164dce0', 'path': 'docs/decision-log.md'}
log_lines = show(LOG['repo'], LOG['commit'], LOG['path']).decode().split('\n')
SEERS = ['the architect', "a session at the architect's order", 'another machine of the house',
         'the acting machine itself', 'a guard, test, gate or CI', 'not stated', 'someone outside the house']
rows_on = Counter(r['date'] for r in codes86['partB'])
deeds = []
for d in r86['partB']['deeds_list']:
    assert log_lines[d['log_line'] - 1].startswith('| ' + d['date'] + ' |'), d['row']   # the row is where it says
    code = next(r for r in codes86['partB'] if r['row'] == d['row'])
    assert code['final']['deed'] == 'yes' and code['final']['deed_line'] == d['deed_line']
    # the log dates a row by its day alone: a sighting stands, at the latest, at the close of that day in Berlin
    day = datetime.date.fromisoformat(d['date'])
    close = datetime.datetime.combine(day + datetime.timedelta(days=1), datetime.time(0), tzinfo=BERLIN)
    deeds.append({'t': int(close.timestamp()), 'date': d['date'], 'row': d['row'], 'line': d['log_line'],
                  'seer': SEERS.index(d['seer']), 'git': int(d['trace'] == 'in Git'),
                  'rel': d['relation'], 'actor': d['actor'],
                  'lag': d['lag_days'], 'text': redact(d['deed_line'])})
deeds.sort(key=lambda d: (d['t'], -d['row']))       # the log runs newest first; a later row is older
assert len(deeds) == r86['partB']['deeds'] == 34
seer_count = Counter(SEERS[d['seer']] for d in deeds)
assert {k: v for k, v in seer_count.items()} == r86['partB']['seer']
assert sum(d['git'] for d in deeds) == r86['partB']['in_git'] == 31
assert len(codes86['partB']) == r86['partB']['rows'] == 200
deed_lags = sorted(d['lag'] for d in deeds if d['lag'] is not None)
deeds_by_month = Counter(d['date'][:7] for d in deeds)
assert dict(deeds_by_month) == r86['partB']['by_month']
census_seen_days = sorted((census_time - commits[b['c']]['t']).total_seconds() / 86400 for b in breaches if 'by' not in b)
selfseen_hours = sorted((commits[s['by']]['t'] - commits[s['c']]['t']).total_seconds() / 3600 for s in selfseen)


def median(xs):
    return xs[len(xs) // 2] if len(xs) % 2 else (xs[len(xs) // 2 - 1] + xs[len(xs) // 2]) / 2


# ---- facts the page prints ----
t0 = commits[0]['t']
t1 = max(c['t'] for c in commits)
n = len(commits)
by_kind = Counter(c['kind'] for c in commits)
by_repo = Counter(c['repo'] for c in commits)


def local_hour(c):
    return c['t'].astimezone(BERLIN).hour


small = [c for c in commits if 3 <= local_hour(c) < 7]
small_kind = Counter(c['kind'] for c in small)
breach_commits = sorted({b['c'] for b in breaches})
days_to_census = sorted((census_time - commits[b['c']]['t']).total_seconds() / 86400 for b in breaches)
median_days = days_to_census[len(days_to_census) // 2] if len(days_to_census) % 2 else \
    (days_to_census[len(days_to_census) // 2 - 1] + days_to_census[len(days_to_census) // 2]) / 2
signers = sorted({f"{c['an']} <{c['ae']}>" for c in commits})
named = sum(1 for c in commits if c['named'])
named_sig = sum(1 for c in commits if MODEL_NAMES.search(c['an']))

facts = {
    'commits': n,
    'machine': by_kind[0], 'workflow': by_kind[1], 'architect': by_kind[2],
    'repos': {PRACTICE[r]: by_repo[r] for r in REPOS},
    'first': t0.astimezone(datetime.timezone.utc).strftime('%-d %B %Y'),
    'last': t1.astimezone(datetime.timezone.utc).strftime('%-d %B %Y'),
    'days': (t1.astimezone(datetime.timezone.utc).date() - t0.astimezone(datetime.timezone.utc).date()).days + 1,
    'small_hours': len(small), 'small_machine': small_kind[0], 'small_workflow': small_kind[1],
    'small_architect': small_kind[2],
    'small_machine_share': round(100 * small_kind[0] / by_kind[0]),
    'bound_items': len(items), 'bound_commits': len(bound),
    'breaches': len(breaches), 'breach_commits': len(breach_commits),
    'breach_robust': sum(1 for b in breaches if b['robust']),
    'census': census_time.astimezone(datetime.timezone.utc).strftime('%-d %B %Y, %H:%M UTC'),
    'census_median_days': round(median_days),
    'census_max_days': round(days_to_census[-1]),
    'signatures': len(signers),
    'model_named': named, 'model_named_signature': named_sig,
    'own_over': len(own), 'own_runs': len({o['run'] for o in own}), 'own_seen_runs': len(seen_runs),
    'own_seen_versions': sum(1 for o in own if o['seen']),
    'own_missed_runs': len({o['run'] for o in own if o['missed']}),
    'own_seen_min_hours': round(own_delays[0]), 'own_seen_max_days': round(own_delays[-1] / 24),
    'own_census': sum(1 for b in breaches if commits[b['c']]['repo'] == 'ulysses' and b['rule'] == 'digest-words'),
    'own_recount': recount_time.astimezone(datetime.timezone.utc).strftime('%-d %B, %H:%M UTC'),
    'own_recount_after_census': round((recount_time - census_time).total_seconds() / 60),
    # state 2: the correction of state 1's reading of signatures
    'corrected_commits': sum(1 for c in commits if c['was_machine']),
    'machine_was': by_kind[0] + sum(1 for c in commits if c['was_machine']),
    'small_machine_was': small_kind[0] + sum(1 for c in small if c['was_machine']),
    # state 2: who named a breach first
    'self_seen': len(selfseen), 'census_seen': len(breaches) - len(selfseen),
    'self_seen_median_hours': round(median(selfseen_hours)),
    'self_seen_max_days': round(selfseen_hours[-1] / 24),
    'census_seen_median_days': round(median(census_seen_days)), 'census_seen_max_days': round(census_seen_days[-1]),
    # state 2: the architect's decision log
    'log_rows': len(codes86['partB']), 'deeds': len(deeds),
    'deeds_beyond': sum(1 for d in deeds if d['rel'] == 'beyond'),
    'deeds_against': sum(1 for d in deeds if d['rel'] == 'against'),
    'seer_architect': seer_count['the architect'],
    'seer_order': seer_count["a session at the architect's order"],
    'seer_machines': seer_count['another machine of the house'] + seer_count['the acting machine itself'] +
    seer_count['a guard, test, gate or CI'],
    'seer_unstated': seer_count['not stated'], 'seer_outside': seer_count['someone outside the house'],
    'seer_stated': len(deeds) - seer_count['not stated'],
    'deeds_git': sum(d['git'] for d in deeds), 'deeds_not_git': sum(1 - d['git'] for d in deeds),
    'deeds_aug': deeds_by_month['2026-08'], 'deeds_sep': deeds_by_month['2026-09'],
    'deeds_oct': deeds_by_month['2026-10'], 'deeds_nov': deeds_by_month['2026-11'],
    'deeds_lagged': len(deed_lags), 'lag_max': round(deed_lags[-1]), 'lag_median': round(median(deed_lags)),
}

# ---- state 3 (session 257, the check): the Field's check 87, read from its commit ----
# The check reads every claim a second time against its source. Two of the work's sources moved on 20 November:
# the Field withdrew 15 of the census's 171 breaches (presentation copies, and a score older than its rule), and
# coded the decision log again with five blind readers: 88 deeds where state 2 drew 34, each looked for at its commit.
CHECK = {'repo': 'field-research', 'commit': 'ce3a5de5e069d3b76265d54cfd853e71471a1408', 'dir': SEEN['dir']}
r87_raw = show(CHECK['repo'], CHECK['commit'], CHECK['dir'] + '/results87.json')
r87 = json.loads(r87_raw)
c87 = json.loads(show(CHECK['repo'], CHECK['commit'], CHECK['dir'] + '/commits87.json'))
d87 = show(CHECK['repo'], CHECK['commit'], CHECK['dir'] + '/data87.js').decode()
drop = json.loads(d87[d87.index('window.DATA87=') + len('window.DATA87='):].strip().rstrip(';'))['drop']


def withdrawn(rule, practice, commit, path):
    return any(rule == r and practice == p and commit.startswith(c) and path == q for r, p, c, q in drop)


n_drop = 0
for it in items:
    if withdrawn(it['rule'], it['practice'], it['commit'], it['path']):
        n_drop += 1
        bound[index[(it['repo'], it['commit'])]] -= 1
assert n_drop == len(drop) == r87['correction85']['removed']['bound'] == 25
for b in breaches:
    c = commits[b['c']]
    b['wd'] = withdrawn(b['rule'], PRACTICE_KEY[c['repo']], c['h'], b['path'])
standing = [b for b in breaches if not b['wd']]
now87 = r87['correction85']['census_now']
assert len(standing) == now87['breach'] == 156 and sum(b['robust'] for b in standing) == now87['robust'] == 29
assert sum(bound.values()) == now87['bound'] == 8073
assert all(not b['wd'] for b in breaches if 'by' in b)          # the 8 its own practice named all stand
st_days = sorted((census_time - commits[b['c']]['t']).total_seconds() / 86400 for b in standing)
st_census_days = sorted((census_time - commits[b['c']]['t']).total_seconds() / 86400 for b in standing if 'by' not in b)

# The deeds: results87.json's 88, each with the commits commits87.json found it at, timed from those repositories.
ARCH = lambda t: t.replace("Frank's", "the architect's").replace('Frank', 'the architect')
C87 = {(c['row'], c['deed']): c for c in c87['deeds']}
LEGIBLE = ['deed and maker', 'act only', 'nothing']
SIGNED = ["the architect's name", "a practice's persona", 'a workflow or bot', 'other']
deeds87 = []
for d in r87['deeds']:
    assert log_lines[d['log_line'] - 1].startswith('| ' + d['date'] + ' |'), d['row']
    c = C87[(d['row'], d['n'])]
    assert c['found'] == d['found'] and c['legible'] == d['legible'] and c['log_line'] == d['log_line']
    found = []
    for x in c['commits']:
        an, at = git(x['repo'], 'log', '-1', '--format=%an\x1f%aI', x['hash']).strip().split('\x1f')
        found.append({'repo': x['repo'], 'h': x['hash'], 'an': an, 't': datetime.datetime.fromisoformat(at),
                      'i': index.get((x['repo'], x['hash']))})
    day = datetime.date.fromisoformat(d['date'])
    close = datetime.datetime.combine(day + datetime.timedelta(days=1), datetime.time(0), tzinfo=BERLIN)
    first = min(found, key=lambda x: x['t']) if found else None
    at_commit = d['found'] == 'at its commit'
    lag = (close - first['t']).total_seconds() / 86400 if at_commit else None
    deeds87.append({
        't': int(close.timestamp()), 'date': d['date'], 'row': d['row'], 'n': d['n'], 'line': d['log_line'],
        'seer': SEERS.index(d['seer']), 'rel': d['relation'], 'kind': d['kind'], 'actor': d['actor'],
        'found': d['found'], 'leg': LEGIBLE.index(d['legible']), 'sig': SIGNED.index(d['signed']),
        'lag': round(lag, 3) if lag is not None else None,
        'rowlag': d['lag_days'],
        'at': [[x['repo'], x['h'][:12], redact(x['an']), int(x['t'].timestamp())] for x in found],
        'em': [x['i'] for x in found if x['i'] is not None and at_commit],
        'text': redact(ARCH(d['deed_line'])),
    })
deeds87.sort(key=lambda d: (d['t'], -d['row'], d['n']))
B87, P87 = r87['partB'], r87['partC']
assert len(deeds87) == B87['deeds'] == 88
seer87 = Counter(SEERS[d['seer']] for d in deeds87)
assert dict(seer87) == B87['seer']
assert Counter(d['found'] for d in deeds87) == Counter(P87['found'])
assert Counter(LEGIBLE[d['leg']] for d in deeds87) == Counter(P87['legible'])
assert Counter(SIGNED[d['sig']] for d in deeds87) == Counter(P87['signed'])
assert Counter(d['date'][:7] for d in deeds87) == Counter(B87['by_month'])
lags87 = sorted(d['lag'] for d in deeds87 if d['lag'] is not None)
assert len(lags87) == P87['found']['at its commit'] == 80
in_field = [d for d in deeds87 if d['em']]
first_repo = Counter(min((x for x in d['at']), key=lambda x: x[3])[0] for d in deeds87 if d['at'])
struck = r87['partA']['struck']
facts_was = {k: facts[k] for k in ('breaches', 'breach_commits', 'breach_robust', 'bound_items', 'census_seen',
                                   'census_median_days', 'deeds', 'seer_architect', 'seer_order', 'seer_machines',
                                   'seer_unstated', 'deeds_git', 'deeds_not_git')}
facts.update({f + '_was': v for f, v in facts_was.items()})
facts.update({
    # the census as the Field corrected it on 20 November
    'bound_items': sum(bound.values()), 'bound_commits': sum(1 for v in bound.values() if v > 0),
    'breaches': len(standing), 'breach_commits': len({b['c'] for b in standing}),
    'breach_robust': sum(b['robust'] for b in standing),
    'breach_reading': len(standing) - sum(b['robust'] for b in standing),
    'breaches_withdrawn': sum(b['wd'] for b in breaches),
    'census_median_days': round(median(st_days)), 'census_max_days': round(st_days[-1]),
    'census_seen': len(standing) - len(selfseen),
    'census_seen_median_days': round(median(st_census_days)), 'census_seen_max_days': round(st_census_days[-1]),
    # the struck limits the census did not count (results87, partA)
    'struck_breaches': struck['breach'], 'struck_self': struck['seen_by']['the practice itself'],
    'struck_census': struck['seen_by']['the census'],
    # the log, coded again
    'deeds': len(deeds87), 'deed_rows': B87['rows_with_deeds'],
    'blind_added': B87['agreement']['deed']['blind_only'], 'blind_missed': B87['agreement']['deed']['published_only'],
    'deeds_beyond': sum(d['rel'] == 'beyond' for d in deeds87),
    'deeds_against': sum(d['rel'] == 'against' for d in deeds87),
    'deeds_authority': sum(d['kind'] == 'authority' for d in deeds87),
    'seer_architect': seer87['the architect'], 'seer_order': seer87["a session at the architect's order"],
    'seer_machines': seer87['another machine of the house'] + seer87['the acting machine itself'] +
    seer87['a guard, test, gate or CI'],
    'seer_unstated': seer87['not stated'], 'seer_outside': seer87['someone outside the house'],
    'seer_stated': len(deeds87) - seer87['not stated'],
    'seer_person': seer87['the architect'] + seer87["a session at the architect's order"],
    'deeds_found': sum(d['found'] == 'at its commit' for d in deeds87),
    'deeds_not_git': sum(d['found'] == 'not in Git' for d in deeds87),
    'deeds_not_found': sum(d['found'] == 'not found' for d in deeds87),
    'legible_both': sum(d['leg'] == 0 for d in deeds87), 'legible_act': sum(d['leg'] == 1 for d in deeds87),
    'legible_none': sum(d['leg'] == 2 for d in deeds87),
    'signed_architect': sum(d['sig'] == 0 and d['found'] == 'at its commit' for d in deeds87),
    'signed_persona': sum(d['sig'] == 1 and d['found'] == 'at its commit' for d in deeds87),
    'signed_workflow': sum(d['sig'] == 2 and d['found'] == 'at its commit' for d in deeds87),
    'deeds_site': first_repo['frankbueltge.de'],
    'deeds_in_field': len(in_field),
    'deeds_aug': sum(d['date'].startswith('2026-08') for d in deeds87),
    'deeds_sep': sum(d['date'].startswith('2026-09') for d in deeds87),
    'deeds_oct': sum(d['date'].startswith('2026-10') for d in deeds87),
    'deeds_nov': sum(d['date'].startswith('2026-11') for d in deeds87),
    'lag87_median': round(median(lags87)), 'lag87_max': round(lags87[-1]),
    'lag87_week': sum(x > 7 for x in lags87), 'lag87_negative': sum(x < 0 for x in lags87),
})
for k in ('deeds_git', 'deeds_lagged', 'lag_max', 'lag_median'):
    facts.pop(k, None)

# ---- state 4 (session 258, the presentation): what a stranger can still check once the models are retired ----
# The coda puts out what the house's readers made (the flames, the census's reading of a word, the log's account of
# who saw, the threads) and keeps what Git alone holds: each commit, its time and name; the limits broken on every
# reading; and, for each deed the log says was mended, whether Git itself joins the mending to the deed. Two offers
# of 21 November: the Field's reading 88 (credit88.json: every deed joined to its mending, with the name Git gives
# each and the days between) and the Atelier's sort (sort.json: each mending joined to its deed by what Git shares).
MEND = {'repo': 'field-research', 'commit': '1c00dd20578f297a72b83b2e496b19e4a3f5013f',
        'path': SEEN['dir'] + '/credit88.json'}
SORT = {'repo': 'ulysses', 'commit': 'aa8a96ee5dde6175de7993773d4e8bfa3853e504',
        'path': 'artifacts/cycle-017/on-its-own-account/data/sort.json'}
cr_raw = show(MEND['repo'], MEND['commit'], MEND['path'])
so_raw = show(SORT['repo'], SORT['commit'], SORT['path'])
cr88, so = json.loads(cr_raw), json.loads(so_raw)
# the deeds of check 87 are those reading 88 and the sort read: the same 88, at the same rows
assert show(CHECK['repo'], CHECK['commit'], CHECK['dir'] + '/results87.json') == \
    show(MEND['repo'], MEND['commit'], CHECK['dir'] + '/results87.json')
CR = {(c['row'], c['deed']): c for c in cr88['deeds']}
SO = {(s['row'], s['n']): s for s in so['act']['deeds']}
assert set(CR) == set(SO) == {(d['row'], d['n']) for d in deeds87} and len(CR) == 88
JOIN = ['same', 'name', 'lines', 'file', 'log']      # the Atelier's order: what Git shares, strongest first
MSIGN = ["the architect's name", "a practice's persona"]
for d in deeds87:
    c, s = CR[(d['row'], d['n'])], SO[(d['row'], d['n'])]
    d['mj'] = None
    if not (c['in_set'] and c['repair_found']):
        assert s['join'] is None
        continue
    assert d['found'] == 'at its commit' and s['join'] in JOIN
    assert s['repair'] == [c['repair_repo'], c['repair_hash'][:12]]
    # the mending is timed from its own repository, as the deed's commits are
    an, at = git(c['repair_repo'], 'log', '-1', '--format=%an\x1f%aI', c['repair_hash']).strip().split('\x1f')
    mt = datetime.datetime.fromisoformat(at)
    assert mt == datetime.datetime.fromisoformat(c['repair_time'])
    assert (an == ARCHITECT) == (c['repair_signer'] == MSIGN[0])
    # the Field's lag runs from the earliest of the deed's commits; so does this field's place of the deed
    assert {x['hash'][:12] for x in c['deed_commits']} == {x[1] for x in d['at']}
    first = min(x[3] for x in d['at'])
    mo = int(mt.timestamp()) - first
    assert abs(mo / 86400 - c['lag_days']) < 0.051 and mo >= 0, (d['row'], mo / 86400, c['lag_days'])
    d['mj'] = JOIN.index(s['join'])
    d['mo'] = mo
    d['mr'] = [c['repair_repo'], c['repair_hash'][:12], redact(an), int(mt.timestamp())]
    d['ms'] = MSIGN.index(c['repair_signer'])
    d['ev'] = s.get('evidence') or []
mended = [d for d in deeds87 if d['mj'] is not None]
MJ = Counter(JOIN[d['mj']] for d in mended)
assert dict(MJ) == so['act']['join'] and len(mended) == so['act']['mended'] == cr88['results']['all']['deeds'] == 77
assert MJ['same'] + MJ['name'] + MJ['lines'] == so['act']['outsider'] == 60
assert sum(d['ms'] == 0 for d in mended) == cr88['results']['all']['repair_architect'] == 75
mend_lags = sorted(d['mo'] / 86400 for d in mended)
assert round(median(mend_lags), 1) == cr88['results']['all']['lag_median']
git_joined = [d for d in mended if d['mj'] <= 2]
facts.update({
    'mended': len(mended), 'unmended': len(deeds87) - len(mended),
    'unmended_in_git': sum(d['found'] == 'at its commit' and d['mj'] is None for d in deeds87),
    'join_same': MJ['same'], 'join_name': MJ['name'], 'join_lines': MJ['lines'], 'join_file': MJ['file'],
    'join_log': MJ['log'], 'joined_git': len(git_joined),
    'mend_architect': sum(d['ms'] == 0 for d in mended), 'mend_persona': sum(d['ms'] == 1 for d in mended),
    'joined_git_architect': sum(d['ms'] == 0 for d in git_joined),
    'joined_both_architect': sum(d['ms'] == 0 and d['sig'] == 0 for d in git_joined),
    'mend_lag_median': round(median(mend_lags), 1), 'mend_within_day': sum(x <= 1 for x in mend_lags),
    'mend_lag_max': round(mend_lags[-1]),
    'mend_in_field': sum(d['mr'][0] in HEADS for d in mended),
})

# ---- state 5 (session 259, after the presentation): the join read from the deed's end ----
# Both siblings read the joins again the same morning, from the other end. The Field's reading 89 (join89.json,
# heirs89.json): following a deed's lines forward, the first later commit to take one out is its mending for 15 of the 53
# pairs joined by lines; for the other 38 another hand came first (the Field's offer to this practice). The Atelier's
# state 5 (both.json) does the same by its own rule. Here: for each pair Git joins, whether a stranger holding the deed is
# led to its mending (the same commit; a mending that names the deed's hash; the first later hand to take out its lines),
# or first to another hand, with that hand's commit timed from its own repository.
AHEAD = {'repo': 'field-research', 'commit': 'e08ba8f424f9794a4c27c0711f02d90e3843d19f', 'dir': SEEN['dir']}
BOTH = {'repo': 'ulysses', 'commit': 'b05b358d94aee0868a8258b4e707f2f4cdea9c17',
        'path': 'artifacts/cycle-017/on-its-own-account/data/both.json'}
j89_raw = show(AHEAD['repo'], AHEAD['commit'], AHEAD['dir'] + '/join89.json')
h89_raw = show(AHEAD['repo'], AHEAD['commit'], AHEAD['dir'] + '/heirs89.json')
both_raw = show(BOTH['repo'], BOTH['commit'], BOTH['path'])
j89, h89, both = json.loads(j89_raw), json.loads(h89_raw), json.loads(both_raw)
# reading 89 reads the same pairs reading 88 recorded, and the Atelier's state 5 reads reading 89
assert show(AHEAD['repo'], AHEAD['commit'], MEND['path']) == cr_raw
assert both['field']['reading89'] == AHEAD['commit'] and both['field']['credit'] == MEND['commit']
J89 = {(p['row'], p['deed']): p for p in j89['pairs']}
H89 = {(h['row'], h['deed']): h for h in h89['heirs']}
assert set(J89) == {(d['row'], d['n']) for d in mended} and len(H89) == h89['results']['pairs'] == 38
HSIGN = ["the architect's name", "a practice's persona", 'a workflow or bot']
for d in deeds87:
    d['fw'] = None
    if d['mj'] is None or d['mj'] > 2:
        continue
    p = J89[(d['row'], d['n'])]
    if d['mj'] == 0:
        assert p['code'] == 'same_commit'
        d['fw'] = 0                     # the mending is one of the deed's own commits
    elif d['mj'] == 1:
        assert p['code'] == 'lines' and p['name']
        d['fw'] = 1                     # the mending names the deed's hash: a search for it finds the mending
    else:
        assert p['code'] == 'lines'
        d['fw'] = 2 if p['git_points'] else 3    # the first later hand to take out a deed's line is the mending, or not
    h = H89.get((d['row'], d['n']))
    assert (h is not None) == (p['code'] == 'lines' and p['git_points'] is False)
    if h is None:
        continue
    assert h['heir'] == p['heirs_before_hashes'][0] and h['repo'] == p['repair_repo']
    an, at = git(h['repo'], 'log', '-1', '--format=%an\x1f%aI', h['heir']).strip().split('\x1f')
    ht = int(datetime.datetime.fromisoformat(at).timestamp())
    # the Field times the hand from the deed's latest commit in the mending's repository; this field places the deed at
    # its first commit, so the hand stands where its own commit lies
    last_here = max(x[3] for x in d['at'] if x[0] == h['repo'])
    assert abs((ht - last_here) / 3600 - h['hours_after_deed']) < 0.051, (d['row'], (ht - last_here) / 3600)
    assert (an == ARCHITECT) == (h['signer'] == HSIGN[0]) and h['signer'] in HSIGN
    d['ho'] = ht - min(x[3] for x in d['at'])
    assert 0 <= d['ho'] <= d['mo']
    d['hr'] = [h['repo'], h['heir'][:12], redact(an), ht]
    d['hk'] = HSIGN.index(h['signer'])
    d['hm'] = int(h['heir_is_a_mending'])
FW = Counter(d['fw'] for d in git_joined)
heirs = [d for d in git_joined if 'hr' in d]
hours = sorted(h['hours_after_deed'] for h in h89['heirs'])
R89, AT = h89['results'], both['results']
assert FW[0] == j89['results']['all']['same_commit'] == 7 and FW[1] == 1 and FW[2] == j89['results']['all']['git_points'] == 15
assert FW[3] + FW[1] == len(heirs) == R89['pairs'] and FW[0] + FW[1] + FW[2] == 23
assert median(hours) == R89['median_hours'] and sum(h < 1 for h in hours) == R89['within_1h']
assert sum(d['hk'] == 0 for d in heirs) == R89['signers']["the architect's name"]
assert sum(d['hk'] == 2 for d in heirs) == R89['signers']['a workflow or bot']
assert sum(d['hm'] for d in heirs) == R89['heir_is_a_mending']
facts.update({
    'fw_reached': FW[0] + FW[1] + FW[2], 'fw_same': FW[0], 'fw_name': FW[1], 'fw_lines': FW[2], 'fw_caught': FW[3],
    'lines_pairs': FW[1] + FW[2] + FW[3], 'heirs': len(heirs),
    'heir_within_hour': R89['within_1h'], 'heir_within_day': R89['within_24h'], 'heir_median_hours': R89['median_hours'],
    'heir_architect': sum(d['hk'] == 0 for d in heirs), 'heir_workflow': sum(d['hk'] == 2 for d in heirs),
    'heir_mending': sum(d['hm'] for d in heirs),
    'one_way': len(git_joined) - (FW[0] + FW[1] + FW[2]),
    'at_first': AT['first'], 'at_lines': AT['lines'], 'at_lead': AT['lead_all'], 'agree_first': AT['field_agree_first'],
})

# ---- compact arrays for the page ----
sig_index = {s: i for i, s in enumerate(signers)}
out = {
    'built': 'build.py; census items85.json at field-research ' + CENSUS['commit'][:7] +
             ', sha256 ' + census_sha256,
    't0': int(t0.timestamp()), 't1': int(t1.timestamp()), 'census': int(census_time.timestamp()),
    'heads': HEADS, 'repos': REPOS, 'practices': [PRACTICE[r] for r in REPOS],
    'signers': [redact(s) for s in signers],
    'c': {
        't': [int(c['t'].timestamp()) for c in commits],
        'r': [REPOS.index(c['repo']) for c in commits],
        'k': [c['kind'] for c in commits],
        'l': [c['lines'] for c in commits],
        'f': [c['files'] for c in commits],
        'h': [c['h'][:12] for c in commits],
        'g': [sig_index[f"{c['an']} <{c['ae']}>"] for c in commits],
        's': [redact(c['subj'][:150]) + ('…' if len(c['subj']) > 150 else '') for c in commits],
        'b': [bound.get(i, 0) for i in range(n)],
    },
    'breaches': [{'c': b['c'], 'rule': b['rule'], 'path': b['path'], 'v': b['value'],
                  'lim': b['limit'], 'rb': int(b['robust']), **({'by': b['by']} if 'by' in b else {}),
                  **({'wd': 1} if b['wd'] else {})}
                 for b in breaches],
    'own': own, 'recount': int(recount_time.timestamp()),
    'atelier': 'digest.json at ulysses ' + ATELIER['commit'][:7] + ', sha256 ' +
               hashlib.sha256(digest_raw).hexdigest(),
    'seen': 'results86.json at field-research ' + SEEN['commit'][:7] + ', sha256 ' +
            hashlib.sha256(r86_raw).hexdigest(),
    'was': [i for i, c in enumerate(commits) if c['was_machine']],
    'seers': SEERS,
    'log': 'https://github.com/frankbueltge/frankbueltge.de/blob/' + LOG['commit'] + '/docs/decision-log.md?plain=1',
    'deeds': deeds87, 'legible': LEGIBLE, 'signed': SIGNED,
    'check': 'results87.json, commits87.json and data87.js at field-research ' + CHECK['commit'][:7] + ', sha256 ' +
             hashlib.sha256(r87_raw).hexdigest(),
    'joins': JOIN, 'msigned': MSIGN,
    'mending': 'credit88.json at field-research ' + MEND['commit'][:7] + ', sha256 ' +
               hashlib.sha256(cr_raw).hexdigest() + '; sort.json at ulysses ' + SORT['commit'][:7] + ', sha256 ' +
               hashlib.sha256(so_raw).hexdigest(),
    'ahead': 'join89.json and heirs89.json at field-research ' + AHEAD['commit'][:7] + ', sha256 ' +
             hashlib.sha256(j89_raw).hexdigest() + ' and ' + hashlib.sha256(h89_raw).hexdigest() +
             '; both.json at ulysses ' + BOTH['commit'][:7] + ', sha256 ' + hashlib.sha256(both_raw).hexdigest(),
    'facts': facts,
}
(HERE / 'data.js').write_text('window.SH = ' + json.dumps(out, ensure_ascii=False,
                                                         separators=(',', ':')) + ';\n')
print(json.dumps(facts, indent=1, ensure_ascii=False))
