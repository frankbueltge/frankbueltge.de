#!/usr/bin/env python3
"""Reading 88 (session 286, 2026-11-21): can an outsider join each deed of the decision log to its repair from Git
alone, and whose name does the repair carry? Rules in CODEBOOK88.md, predictions in PREDICTIONS88.md.

Usage: python3 credit88.py <dir holding commit-only clones named <repo>.git>
Reads commits87.json beside this file; writes credit88.json (per deed: hashes, signers, times and codes; no commit
message is copied, so that no line of the old record is published again).
"""
import json
import re
import statistics
import subprocess
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPOS = ['frankbueltge.de', 'field-research', 'ulysses', 'studio', 'research-ecology', 'error-as-method',
         'machine-attention']
SEEN_BEFORE = {'e6558c8', '86532f4', 'd93ca69', 'd34d42a', 'c538beb'}
PERSONA = re.compile(r'^(Meridian|Ulysses|Assay|Ensemble)\b', re.I)
MACHINE_WORDS = re.compile(r'\b(session|sessions|agent|model|machine|practice|routine|Meridian|Ulysses|Assay|Ensemble)\b',
                           re.I)


def git(clones, repo, *args):
    r = subprocess.run(['git', '--git-dir', str(clones / f'{repo}.git'), *args], capture_output=True)
    return r.returncode, r.stdout.decode('utf-8', 'replace')


def commit(clones, repo, h):
    code, out = git(clones, repo, 'show', '-s', '--format=%H%x00%an%x00%ae%x00%aI%x00%B', h, '--')
    if code != 0 or not out:
        code, out = git(clones, repo, 'log', '-1', '--format=%H%x00%an%x00%ae%x00%aI%x00%B', h)
        if code != 0 or not out:
            return None
    full, an, ae, at, body = out.split('\x00', 4)
    return {'hash': full.strip(), 'repo': repo, 'author': an, 'email': ae, 'time': at, 'message': body.strip()}


def signer(an, ae):
    if an.strip() == 'Frank Bültge':
        return "the architect's name"
    if PERSONA.match(an.strip()):
        return "a practice's persona"
    if '[bot]' in an or 'bot' in ae.lower() or 'actions' in an.lower() or 'workflow' in an.lower():
        return 'a workflow or bot'
    return 'other'


def days(a, b):
    return round((datetime.fromisoformat(b) - datetime.fromisoformat(a)).total_seconds() / 86400, 1)


def main():
    clones = Path(sys.argv[1]).resolve()
    c87 = json.loads((HERE / 'commits87.json').read_text())
    out, cache = [], {}
    for d in c87['deeds']:
        rec = {'row': d['row'], 'deed': d['deed'], 'log_line': d['log_line'], 'found': d['found'],
               'repair': d.get('repair')}
        deed_commits = []
        for c in d['commits']:
            got = commit(clones, c['repo'], c['hash'])
            deed_commits.append(got and {k: got[k] for k in ('hash', 'repo', 'time')} | {
                '_subject': got['message'].split('\n', 1)[0], 'signer': signer(got['author'], got['email'])})
        rec['deed_commits'] = deed_commits
        in_set = d['found'] == 'at its commit' and bool(d.get('repair'))
        rec['in_set'] = in_set
        if in_set:
            h = d['repair']
            if h not in cache:
                cache[h] = None
                for repo in [c['repo'] for c in d['commits']] + REPOS:
                    got = commit(clones, repo, h)
                    if got:
                        cache[h] = got
                        break
            rep = cache[h]
            if rep is None:
                rec['repair_found'] = False
            else:
                msg = rep['message']
                known = [c for c in deed_commits if c]
                by_hash = any(re.search(re.escape(c['hash'][:7]), msg, re.I) for c in known)
                prs = []
                for c in known:
                    m = re.search(r'\(#(\d+)\)\s*$', c['_subject'])
                    if m:
                        prs.append(m.group(1))
                by_pr = any(re.search(r'(?<![\w#])#' + p + r'(?!\d)', msg) for p in prs)
                first = min(known, key=lambda c: c['time']) if known else None
                rec.update({
                    'repair_found': True,
                    'repair_repo': rep['repo'],
                    'repair_hash': rep['hash'],
                    'repair_time': rep['time'],
                    'repair_signer': signer(rep['author'], rep['email']),
                    'names_deed_by_hash': by_hash,
                    'names_deed_by_pr': by_pr,
                    'names_deed': by_hash or by_pr,
                    'same_signer': bool(known) and signer(rep['author'], rep['email']) == known[0]['signer'],
                    'lag_days': days(first['time'], rep['time']) if first else None,
                    'says_machine': bool(MACHINE_WORDS.search(msg)),
                    'seen_before': rep['hash'][:7] in SEEN_BEFORE,
                    # addendum after the count (CODEBOOK88.md): the repair is itself one of the deed's commits
                    'self_repair': any(c['hash'] == rep['hash'] for c in known),
                })
        for c in deed_commits:
            if c:
                c.pop('_subject', None)  # pointers only: no line of the old record is published again
        out.append(rec)

    def summary(rows):
        n = len(rows)
        lags = [r['lag_days'] for r in rows if r['lag_days'] is not None]
        named = sum(r['names_deed'] for r in rows)
        arch = sum(r['repair_signer'] == "the architect's name" for r in rows)
        med = statistics.median(lags) if lags else None
        return {'deeds': n, 'names_deed': named, 'names_by_hash': sum(r['names_deed_by_hash'] for r in rows),
                'names_by_pr': sum(r['names_deed_by_pr'] for r in rows),
                'repair_architect': arch, 'same_signer': sum(r['same_signer'] for r in rows),
                'says_machine': sum(r['says_machine'] for r in rows),
                'distinct_repairs': len({r['repair_hash'] for r in rows}),
                'lag_median': med, 'lag_n': len(lags), 'lag_negative': sum(1 for x in lags if x < 0),
                'lag_within_1': sum(1 for x in lags if 0 <= x < 1), 'lag_max': max(lags) if lags else None,
                'P141': 'held' if n and named / n <= 0.25 else 'failed',
                'P142': 'held' if n and arch / n >= 0.75 else 'failed',
                'P143': 'held' if med is not None and med >= 7 else 'failed'}

    rows = [r for r in out if r['in_set'] and r.get('repair_found')]
    fresh = [r for r in rows if not r['seen_before']]
    apart = [r for r in rows if not r['self_repair']]
    signers = {}
    for r in rows:
        signers[r['repair_signer']] = signers.get(r['repair_signer'], 0) + 1
    res = {
        'reading': 88, 'session': 286, 'date': '2026-11-21',
        'deeds': len(out),
        'in_set': sum(r['in_set'] for r in out),
        'repair_not_found': sum(1 for r in out if r['in_set'] and not r.get('repair_found')),
        'all': summary(rows), 'without_seen_before': summary(fresh),
        'repair_apart': summary(apart), 'self_repair': len(rows) - len(apart), 'repair_signers': signers,
        'authority': [r for r in out if (r['row'], r['deed']) in {(67, 1), (132, 1), (138, 1), (149, 1), (151, 1),
                                                                  (169, 1)}],
    }
    (HERE / 'credit88.json').write_text(json.dumps({'results': res, 'deeds': out}, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps({k: v for k, v in res.items() if k != 'authority'}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
