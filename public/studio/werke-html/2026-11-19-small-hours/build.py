#!/usr/bin/env python3
"""SMALL HOURS: build the record the world is drawn from.

Reads every non-merge commit of the four ecology repositories at the heads the Field's census
(study 85) read, and the census's own items (items85.json, field-research commit a26d1dc),
and writes data.js. Nothing here calls a model. Run from any checkout that holds the four
repositories side by side with full history:

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


def kind(name):
    if name == ARCHITECT:
        return 2            # the architect's name: he, or a session acting for him
    if any(w in name for w in WORKFLOW):
        return 1            # a workflow of the house: a script, not a model
    return 0                # a machine's name: a model-run session of a practice


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
                        'lines': lines, 'files': files, 'kind': kind(an),
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
                  'lim': b['limit'], 'rb': int(b['robust'])} for b in breaches],
    'own': own, 'recount': int(recount_time.timestamp()),
    'atelier': 'digest.json at ulysses ' + ATELIER['commit'][:7] + ', sha256 ' +
               hashlib.sha256(digest_raw).hexdigest(),
    'facts': facts,
}
(HERE / 'data.js').write_text('window.SH = ' + json.dumps(out, ensure_ascii=False,
                                                         separators=(',', ':')) + ';\n')
print(json.dumps(facts, indent=1, ensure_ascii=False))
