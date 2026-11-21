#!/usr/bin/env python3
"""On Its Own Account, state 4: the presentation. It sorts the house's deeds by what decides them, and joins each
mending to its deed without the log.

Run from this folder:  python3 build4.py <dir of clones>
                       (<dir> holds blobless clones of the seven repositories the Field's reading 88 used:
                        frankbueltge.de, field-research, ulysses, studio, research-ecology, error-as-method,
                        machine-attention; e.g.  git clone --filter=blob:none --no-checkout <url> <dir>/<name>;
                        needs network for the Field's files at a pinned commit and for blobs fetched on demand)

What it does, in order:
  1. reads the Field's census (study 85, as its check 87 leaves it), the limits struck before the census (check 87,
     part A), the log's 88 deeds (check 87, part B) and each deed joined to the commit the log says mended it
     (reading 88, credit88.json), all at the Field's commit after its presentation, and asserts the Field's own figures;
  2. sorts every item into three kinds by what decides it: a rule that names what it looks for (the census's
     prohibitions and duties), a limit that names no unit (the census's limits on length; the limits struck before it
     are reported beside them, not drawn), and an act, which enters the record only as a sentence of the log;
  3. answers the Field's question of 2026-11-21 (when a mending names neither the deed nor the machine, who can still
     join them once the log's writer is gone?) by joining each mending to its deed from Git alone: the same commit; the
     mending names the deed; the mending takes out lines the deed wrote, in the same file (a stranger finds it by
     following the file); the mending changes a file the deed changed and none of its lines (a reader must judge); or
     nothing in common, so only the log's sentence joins them. Left out of the join: the decision log itself, since
     the log's row is the account, not the deed, and the house's knowledge graph, a derived file every change rebuilds.

Writes data/sort.json and data/sort.js. Nothing here asks a model; no reader codes anything.
"""
import json, os, re, subprocess, sys, urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
CLONES = sys.argv[1] if len(sys.argv) > 1 else None
FIELD = '1c00dd20578f297a72b83b2e496b19e4a3f5013f'     # field-research main after its presentation (session 286)
RAWF = 'https://raw.githubusercontent.com/frankbueltge/field-research/' + FIELD + '/artifacts/cycle-017/what-the-house-did-unasked/'
LOG = 'docs/decision-log.md'
# left out of the join: the log (its row is the account, not the deed) and the house's knowledge graph, a file derived
# from every source and rebuilt by any change of one (the site repository's standing instructions), so it joins every pair of commits
NOT_JOINED = {LOG, 'src/data/graph/graph.json'}
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def field(name):
    return json.loads(urllib.request.urlopen(RAWF + name, timeout=120).read())


def git(repo, *a):
    p = subprocess.run(['git', '-C', os.path.join(CLONES, repo), *a], capture_output=True, text=True,
                       errors='replace')
    if p.returncode:
        raise RuntimeError(f'git {repo} {a}: {p.stderr[:300]}')
    return p.stdout


def day(t):
    return datetime.fromisoformat(t).astimezone(timezone.utc).strftime('%Y-%m-%d')


# ———————————————————————————————————————— 1. the Field's files, and its own figures
items85 = field('items85.json')
rules85 = field('rules85.json')
first87 = field('first87.json')
res87 = field('results87.json')
items87 = field('items87.json')
codes87 = field('codes87.json')
commits87 = field('commits87.json')
credit = field('credit88.json')

# the census as check 87 leaves it: the presentations' copies and the scores no limit bound are set aside
# (the same rule as the Field's build87.py)
start = {r['rule']: r['start'] for r in rules85 if r['practice'] == 'atelier' and r['rule'] in ('score-lines', 'critique-lines')}
mine = [i for i in items85 if i['practice'] == 'atelier' and i['rule'] in start]
art = {(i['rule'], i['blob']) for i in mine if not i['path'].startswith('presentations/')}
drop = {(i['rule'], i['practice'], i['commit'], i['path']) for i in mine
        if (i['path'].startswith('presentations/') and (i['rule'], i['blob']) in art)
        or first87[i['path']]['time'] < start[i['rule']]}
census = [i for i in items85 if (i['rule'], i['practice'], i['commit'], i['path']) not in drop]
kind = {(r['practice'], r['rule']): r['kind'] for r in rules85}
now = res87['correction85']['census_now']
ok(len(census) == now['bound'], f'the census as the check leaves it: {len(census)} items bound (the Field: {now["bound"]})')
lim = [i for i in census if kind[(i['practice'], i['rule'])] == 'limit']
rule = [i for i in census if kind[(i['practice'], i['rule'])] in ('prohibition', 'duty')]
ok(len(lim) == now['limit']['bound'] and sum(i['breach'] for i in lim) == now['limit']['breach'],
   f'limits on length: {len(lim)} bound, {sum(i["breach"] for i in lim)} over by the census\'s reading')
ok(sum(i['breach'] and i['robust'] for i in lim) == now['robust'], f'over on every reading the Field tried: {now["robust"]}')
ok(not any(i['breach'] for i in rule), f'prohibitions and duties: {len(rule)} bound, none broken')
st = res87['partA']['struck']
ok(len(items87) == st['bound'] and sum(i['breach'] for i in items87) == st['breach']
   and sum(i['breach'] and i['robust'] for i in items87) == st['robust'],
   f'the limits struck before the census: {st["bound"]} bound, {st["breach"]} over, {st["robust"]} on every reading')

deeds87 = [dict(x, row=r['row'], log_date=r['date']) for r in codes87['partB'] for x in r['deeds']]
ok(len(deeds87) == 88 and len(credit['deeds']) == 88, 'the log holds 88 deeds')
C87 = {(c['row'], c['deed']): c for c in commits87['deeds']}
CR = {(c['row'], c['deed']): c for c in credit['deeds']}
# check 87 numbers the deeds of a row in order; codes87 lists them in that order
n_in_row = Counter()
for d in deeds87:
    n_in_row[d['row']] += 1
    d['n'] = n_in_row[d['row']]
ok(all((d['row'], d['n']) in C87 and (d['row'], d['n']) in CR for d in deeds87), 'every deed of the codes has its commits and its mending')
R88 = credit['results']
ok(R88['in_set'] == 77 and R88['self_repair'] == 7 and R88['repair_apart']['deeds'] == 70
   and R88['repair_apart']['names_deed'] == 1, 'reading 88: 77 mended, 7 by the deed\'s own commit, 70 apart, 1 of them naming the deed')


# ———————————————————————————————————————— 2. the sort, day by day
def days(lo='2026-07-12', hi='2026-11-21'):
    d0 = datetime.fromisoformat(lo)
    return [(d0 + timedelta(days=k)).strftime('%Y-%m-%d') for k in range((datetime.fromisoformat(hi) - d0).days + 1)]


# the strip runs from the earliest item or deed to the day of this reading
LO = min([day(i['time']) for i in census] + [day(x['time']) for c in credit['deeds'] for x in (c.get('deed_commits') or [])]
         + [d['log_date'] for d in deeds87])
DAYS = days(LO)
IX = {d: k for k, d in enumerate(DAYS)}


def per_day(xs, cls):
    out = defaultdict(Counter)
    for i in xs:
        out[IX[day(i['time'])]][cls(i)] += 1
    return {k: dict(v) for k, v in sorted(out.items())}


lcls = lambda i: ('every' if i['robust'] else 'one') if i['breach'] else 'kept'
sort = {
    'days': [DAYS[0], DAYS[-1]],
    'rule': {'n': len(rule), 'broken': 0, 'rules': sorted({i['rule'] for i in rule}),
             'by_day': per_day(rule, lambda i: 'kept')},
    'limit': {'n': len(lim), 'over': sum(i['breach'] for i in lim),
              'every': sum(i['breach'] and i['robust'] for i in lim),
              'rules': sorted({i['rule'] for i in lim}), 'by_day': per_day(lim, lcls)},
    # the limits struck before the census are reported, not drawn: the strip shows the rules standing on 19 November
    'struck': {'n': len(items87), 'over': st['breach'], 'every': st['robust'], 'seen_before_census': st['seen_before_census']},
}
sort['limit']['one'] = sort['limit']['over'] - sort['limit']['every']
ok(sort['limit']['n'] == 1377 and sort['limit']['over'] == 156 and sort['limit']['one'] == 127,
   f'limits that name no unit: {sort["limit"]["n"]} items, {sort["limit"]["over"]} over by the census\'s reading, {sort["limit"]["one"]} of them inside on another')


# ———————————————————————————————————————— 3. each mending joined to its deed, from Git alone
def diff(repo, h):
    """Lines added under the new path and lines removed under the old path, for one commit (first parent)."""
    out = git(repo, 'show', '--format=', '-U0', '--no-color', '--no-ext-diff', '--text', '-M',
              '--diff-merges=first-parent', h)
    add, rem, paths = defaultdict(set), defaultdict(set), set()
    old = new = None
    for ln in out.split('\n'):
        if ln.startswith('diff --git '):
            old = new = None
        elif ln.startswith('--- '):
            old = None if ln[4:] == '/dev/null' else ln[4:][2:] if ln[4:].startswith('a/') else ln[4:]
        elif ln.startswith('+++ '):
            new = None if ln[4:] == '/dev/null' else ln[4:][2:] if ln[4:].startswith('b/') else ln[4:]
            paths.update(p for p in (old, new) if p)
        elif ln.startswith('+') and new:
            s = ln[1:].strip()
            if len(s) >= 12 and re.search('[A-Za-z]', s):
                add[new].add(s)
        elif ln.startswith('-') and old:
            s = ln[1:].strip()
            if len(s) >= 12 and re.search('[A-Za-z]', s):
                rem[old].add(s)
    if not paths:   # a pure rename or mode change still names its paths
        for ln in git(repo, 'show', '--format=', '--name-only', '-M', '--diff-merges=first-parent', h).split('\n'):
            if ln.strip():
                paths.add(ln.strip())
    for p in NOT_JOINED:
        paths.discard(p)
        add.pop(p, None)
        rem.pop(p, None)
    return add, rem, paths


cache = {}


def D(repo, h):
    if (repo, h) not in cache:
        cache[(repo, h)] = diff(repo, h)
    return cache[(repo, h)]


JOIN = ['same', 'name', 'lines', 'file', 'log']
out_deeds = []
for d in sorted(deeds87, key=lambda d: (d['row'], d['n'])):
    c87, cr = C87[(d['row'], d['n'])], CR[(d['row'], d['n'])]
    times = [x['time'] for x in cr.get('deed_commits') or []]
    rec = {'row': d['row'], 'n': d['n'], 'log_line': d.get('log_line') or cr.get('log_line'), 'log_date': d['log_date'],
           'kind': d['kind'], 'relation': d['relation'], 'seer': d['seer'], 'trace': d['trace'], 'found': cr['found'],
           'deed_line': d['deed_line'].replace("Frank's", "the architect's").replace('Frank', 'the architect'),
           'deed_day': day(min(times)) if times else d['log_date'],
           'commits': [[x['repo'], x['hash'][:12]] for x in c87['commits']], 'join': None}
    if cr.get('in_set') and cr.get('repair_found'):
        rec.update({'repair': [cr['repair_repo'], cr['repair_hash'][:12]], 'repair_day': day(cr['repair_time']),
                    'lag_days': cr['lag_days'], 'repair_signer': cr['repair_signer'], 'says_machine': cr['says_machine'],
                    'names_deed': cr['names_deed']})
        same_repo = [x for x in cr['deed_commits'] if x['repo'] == cr['repair_repo']]
        if cr['self_repair']:
            rec['join'] = 'same'
        elif cr['names_deed']:
            rec['join'] = 'name'
        elif not same_repo:
            rec['join'], rec['why'] = 'log', 'the mending lies in another repository than the deed'
        else:
            radd, rrem, rpaths = D(cr['repair_repo'], cr['repair_hash'])
            lines, files = Counter(), set()
            for x in same_repo:
                dadd, drem, dpaths = D(x['repo'], x['hash'])
                files |= dpaths & rpaths
                for p, ls in dadd.items():
                    k = len(ls & rrem.get(p, set()))
                    if k:
                        lines[p] += k
            if lines:
                rec['join'] = 'lines'
                rec['evidence'] = [[p, k] for p, k in lines.most_common(3)]
            elif files:
                rec['join'] = 'file'
                rec['evidence'] = sorted(files)[:3]
            else:
                rec['join'], rec['why'] = 'log', 'the mending changes no file the deed changed'
    out_deeds.append(rec)

J = Counter(r['join'] for r in out_deeds if r['join'])
ok(sum(J.values()) == 77 and J['same'] == 7 and J['name'] == 1, f'every one of the 77 mendings joined: {dict(J)}')
neither = [r for r in out_deeds if r['join'] and r['join'] not in ('same', 'name') and not r['says_machine']]
apart_named_none = [r for r in out_deeds if r['join'] in ('lines', 'file', 'log')]
ok(len(apart_named_none) == 69, f'mendings apart that do not name the deed: {len(apart_named_none)}')
Q = Counter(r['join'] for r in neither)
machine = Counter(r['join'] for r in apart_named_none if r['says_machine'])
ok(len(neither) == 26, f'mendings that name neither the deed nor a machine: {len(neither)} ({dict(Q)})')
auth = [r for r in out_deeds if r['kind'] == 'authority']
ok(len(auth) == 6, f'acts of authority: {len(auth)}, joined {dict(Counter(r["join"] for r in auth))}')
by_kind = {k: dict(Counter(r['join'] or 'none' for r in out_deeds if r['kind'] == k)) for k in ('fault', 'authority')}
lag = {j: sorted(r['lag_days'] for r in out_deeds if r['join'] == j) for j in JOIN}
med = lambda xs: (xs[len(xs) // 2] if len(xs) % 2 else (xs[len(xs) // 2 - 1] + xs[len(xs) // 2]) / 2) if xs else None

sort['act'] = {
    'n': len(out_deeds), 'mended': sum(J.values()), 'unmended': len(out_deeds) - sum(J.values()),
    'in_git': sum(r['found'] == 'at its commit' for r in out_deeds),
    'join': dict(J), 'neither': {'n': len(neither), 'join': dict(Q)}, 'says_machine': dict(machine),
    'by_kind': by_kind, 'lag_median': {j: med(v) for j, v in lag.items()},
    'outsider': J['same'] + J['name'] + J['lines'],
    'deeds': out_deeds,
}
sort['field'] = {'commit': FIELD, 'files': ['items85.json', 'rules85.json', 'first87.json', 'results87.json',
                                            'items87.json', 'codes87.json', 'commits87.json', 'credit88.json']}
sort['heads'] = {r: git(r, 'rev-parse', 'origin/HEAD').strip()[:12] for r in
                 ('frankbueltge.de', 'field-research', 'ulysses', 'studio', 'research-ecology', 'error-as-method',
                  'machine-attention')}
print(json.dumps({k: v for k, v in sort['act'].items() if k != 'deeds'}, indent=1))

if fails:
    print(len(fails), 'FAILED')
    sys.exit(1)
json.dump(sort, open(os.path.join(HERE, 'data', 'sort.json'), 'w'), ensure_ascii=False, indent=1)
with open(os.path.join(HERE, 'data', 'sort.js'), 'w', encoding='utf-8') as f:
    f.write('window.SORT=' + json.dumps(sort, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('wrote data/sort.json and data/sort.js')
