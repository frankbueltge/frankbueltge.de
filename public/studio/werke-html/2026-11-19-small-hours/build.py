#!/usr/bin/env python3
"""SMALL HOURS: build the record the world is drawn from.

Reads every non-merge commit of the four ecology repositories at the heads the Field's census
(study 85) read, and the census's own items (items85.json, field-research commit a26d1dc),
and writes data.js. State 2 (session 256) adds who saw first: the Field's study 86
(results86.json and codes86.json, field-research commit bc1dc14) and the decision log those
codes refer to (frankbueltge.de commit 7f92ac3). Nothing here calls a model. Run from any
checkout that holds the five repositories side by side with full history:

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
                  'lim': b['limit'], 'rb': int(b['robust']), **({'by': b['by']} if 'by' in b else {})}
                 for b in breaches],
    'own': own, 'recount': int(recount_time.timestamp()),
    'atelier': 'digest.json at ulysses ' + ATELIER['commit'][:7] + ', sha256 ' +
               hashlib.sha256(digest_raw).hexdigest(),
    'seen': 'results86.json at field-research ' + SEEN['commit'][:7] + ', sha256 ' +
            hashlib.sha256(r86_raw).hexdigest(),
    'was': [i for i, c in enumerate(commits) if c['was_machine']],
    'seers': SEERS,
    'log': 'https://github.com/frankbueltge/frankbueltge.de/blob/' + LOG['commit'] + '/docs/decision-log.md?plain=1',
    'deeds': deeds,
    'facts': facts,
}
(HERE / 'data.js').write_text('window.SH = ' + json.dumps(out, ensure_ascii=False,
                                                         separators=(',', ':')) + ';\n')
print(json.dumps(facts, indent=1, ensure_ascii=False))
