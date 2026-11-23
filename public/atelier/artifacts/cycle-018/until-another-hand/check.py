#!/usr/bin/env python3
"""Until Another Hand, state 3 (2026-11-23): the check of section I and II, with definitions of its own.

The check starts nothing new. It reads two of the work's claims a second time, at the heads state 1 recorded
(data/window.json, results.heads), and without the first build's code:

  "another hand": for every window a later commit closed, is the closing commit's Git name and address one of the
    deed's own? Read from `git log`, not from build.py's signer classes.
  "never reverted": the first build counted the sentence Git writes into a revert ("This reverts commit"). This check
    counts the act: a later commit whose change, file by file, is exactly the deed's change backwards (each path the
    earlier commit changed from blob a to blob b is changed by the later one from b to a, and nothing else changes),
    read from `git log --raw` blob ids. It is a floor: a revert that also changes anything else, or undoes part of a
    commit, is not counted, and is reported only where it undoes all of an earlier commit among other changes.

And it carries the Field's question of 2026-11-22 (ho-2026-11-22-field-4): how often the earliest later trace the
Field counts (field-research 562ae704, house91.json) is the commit that closes the window, and what that trace is.

Run from this folder:  python3 check.py <dir of bare clones named <repo>.git>
   (a clone made with --filter=blob:none is enough: only commits and trees are read)
Writes data/check.json and data/check.js. Nothing here asks a model; no reader codes anything.
"""
import json, os, statistics, subprocess, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
CLONES = sys.argv[1]
ENV = {**os.environ, 'GIT_NO_LAZY_FETCH': '1'}
W = json.load(open(os.path.join(HERE, 'data', 'window.json')))
HEADS = W['results']['heads']
FIELD_AT = '562ae7043fc4043c3bed92cc8845d187e8a9645a'   # field-research: Told in Time, state 2 (house91.json)
DRAWN = {'mended inside the window', 'mended after the window closed', 'unmended, window open at head',
         'unmended, window closed'}
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def git(repo, *a):
    p = subprocess.run(['git', '-c', 'log.mailmap=false', '-c', 'mailmap.blob=', '--git-dir', os.path.join(CLONES, repo + '.git'),
                        *a], capture_output=True, env=ENV)
    if p.returncode != 0:
        raise RuntimeError(f'{repo}: git {" ".join(a)}: {p.stderr.decode()[:300]}')
    return p.stdout.decode('utf-8', 'replace')


def who(repo, h):
    n, e, t = git(repo, 'log', '-1', '--no-mailmap', '--format=%an%x00%ae%x00%ct', h).strip().split('\x00')
    return n, e.lower(), int(t)


# ---------------------------------------------------------------- 1. who closed each window
deeds = [d for d in W['deeds'] if d['state'] in DRAWN]
closed = [d for d in deeds if d.get('closed_hours') is not None]
ok(len(deeds) == W['results']['measured'] and len(closed) == W['results']['closed'],
   f"the population is state 1's: {len(deeds)} deeds drawn, {len(closed)} windows closed")
rows = []
for d in closed:
    signers = {who(r, h)[:2] for r, h in d['commits']}
    cr, ch = d['closed_by']
    cn, ce, ct = who(cr, ch)
    same = (cn, ce) in signers
    rows.append({'row': d['row'], 'n': d['n'], 'closed_by': d['closed_by'], 'closed_hours': d['closed_hours'],
                 'by_mending': d['closed_by_mending'], 'deed_names': sorted({s[0] for s in signers}),
                 'closer_name': cn, 'same_signer': same})
others = [r for r in rows if not r['by_mending']]
same = [r for r in others if r['same_signer']]
diff = [r for r in others if not r['same_signer']]
names_same = Counter(r['closer_name'] for r in same)
names_diff = Counter((tuple(r['deed_names']), r['closer_name']) for r in diff)
signer = {
    'closed': len(rows), 'by_mending': len(rows) - len(others), 'by_a_later_commit': len(others),
    'same_signer': len(same), 'other_signer': len(diff),
    'same_within_1h': sum(r['closed_hours'] <= 1 for r in same),
    'same_median_h': round(statistics.median(r['closed_hours'] for r in same), 2) if same else None,
    'other_median_h': round(statistics.median(r['closed_hours'] for r in diff), 2) if diff else None,
    'same_by_name': dict(names_same),
    'other_pairs': [{'deed': list(k[0]), 'closer': k[1], 'n': v} for k, v in names_diff.items()],
    'same_architect': sum(r['closer_name'] == 'Frank Bültge' for r in same),
}
print('signers', json.dumps(signer, ensure_ascii=False))

# ---------------------------------------------------------------- 2. reverts in act, across the house
acts, partial, total, sentence = [], [], 0, 0
for repo, head in HEADS.items():
    head = git(repo, 'rev-parse', head + '^{commit}').strip()
    total += int(git(repo, 'rev-list', '--count', head).strip())
    out = git(repo, 'log', '--no-merges', '--reverse', '--raw', '--no-renames', '--no-abbrev',
              '--format=@@%H%x00%ct%x00%an%x00%B%x01', head)
    commits, cur = [], None
    for block in out.split('@@')[1:]:
        meta, _, raw = block.partition('\x01')
        h, t, an, body = meta.split('\x00', 3)
        ch = set()
        for line in raw.splitlines():
            if line.startswith(':'):
                left, path = line.split('\t', 1)
                f = left.split()
                ch.add((path, f[2], f[3]))
        commits.append((h, int(t), an, body, frozenset(ch)))
    sentence += sum('This reverts commit' in c[3] for c in commits)
    by_fwd = defaultdict(list)
    for i, (h, t, an, body, ch) in enumerate(commits):
        if ch:
            by_fwd[ch].append(i)
    for j, (h, t, an, body, ch) in enumerate(commits):
        if not ch:
            continue
        back = frozenset((p, b, a) for p, a, b in ch)
        for i in by_fwd.get(back, []):
            if i < j:
                a = commits[i]
                acts.append({'repo': repo, 'deed': a[0][:12], 'deed_subject': a[3].split('\n')[0][:120],
                             'deed_name': a[2], 'undo': h[:12], 'undo_subject': body.split('\n')[0][:120],
                             'undo_name': an, 'minutes': round((t - a[1]) / 60, 1),
                             'paths': len(ch), 'says_revert': 'This reverts commit' in body,
                             'subject_says': 'revert' in body.split('\n')[0].lower()})
                break
print('house commits', total, 'sentence', sentence, 'acts', len(acts))
ok(total == W['results']['house_commits'], f"the house holds {total} commits at state 1's heads, as state 1 counted")
ok(sentence == W['results']['house_reverts'], f"Git's sentence stands {sentence} times, as state 1 counted")
kinds = Counter()
for a in acts:
    kinds['subject says revert' if a['subject_says'] else 'subject silent'] += 1
for a in sorted(acts, key=lambda a: (a['repo'], a['minutes'])):
    print(f"   {a['repo']} {a['deed']} -> {a['undo']} {a['minutes']} min, {a['paths']} paths, {a['deed_name']} / "
          f"{a['undo_name']} :: {a['deed_subject'][:60]} || {a['undo_subject'][:70]}")
ok(any(a['undo'].startswith('808a7bfa8') for a in acts), 'the revert the critique found (808a7bfa8) is among the acts')

# ---------------------------------------------------------------- 3. the Field's question
H = json.loads(subprocess.run(['git', '--git-dir', os.path.join(CLONES, 'field-research.git'), 'show',
                               f'{FIELD_AT}:artifacts/cycle-018/told-in-time/house91.json'],
                              capture_output=True).stdout)['pairs']
SORT_AT = W['sort_at']
BOTH = json.loads(subprocess.run(['git', '--git-dir', os.path.join(CLONES, 'ulysses.git'), 'show',
                                  f'{SORT_AT}:artifacts/cycle-017/on-its-own-account/data/both.json'],
                                 capture_output=True).stdout)['pairs']
first = {(b['row'], b['n']): (b['hands'][0]['h'] if b['hands'] else None) for b in BOTH}
WD = {(d['row'], d['n']): d for d in W['deeds']}
q, zeros = Counter(), 0
for p in H:      # compared by commit, not by hours: is the first later hand the commit that closed the window?
    d = WD[(p['row'], p['deed'])]
    fh, cl = first.get((p['row'], p['deed'])), d['closed_by'][1]
    zeros += len(d['commits']) > 1 and min(who(r, h)[2] for r, h in d['commits']) != max(who(r, h)[2] for r, h in d['commits'])
    if fh is None:
        q['the mending, which closed the window' if p['closed_by_mending'] else
          ('the mending, inside the window' if p['state'] == 'mended inside the window' else 'the mending, after it')] += 1
    elif fh[:12] == cl[:12]:
        q['a later write over the deed\u2019s lines, which closed the window'] += 1
    elif who(p['repo'], fh)[2] <= who(d['closed_by'][0], cl)[2]:   # commit times, not hours from two zeros
        q['a later write over the deed\u2019s lines, the window still open'] += 1
    else:
        q['the window closed first, at a commit that rewrote none of the deed\u2019s lines'] += 1
def field_rule(p):   # the Field's own classification by hours (build91.py), to reproduce the figure it asked about
    if p['first_hand_hours'] is None:
        return 'at' if p['closed_by_mending'] else ('before' if p['state'] == 'mended inside the window' else 'after')
    a, b = p['first_hand_hours'], p['closed_hours']
    return 'before' if a + 0.05 < b else ('after' if a - 0.05 > b else 'at')
fr = Counter(field_rule(p) for p in H)
ok(fr['at'] == 25, f"the Field's rule by hours gives its 25 at the closing commit ({fr['at']})")
field = {'pairs': len(H), 'at': FIELD_AT, 'classes': dict(q), 'two_zeros': zeros, 'field_hours': dict(fr),
         'field_hours_at': fr['at'],
         'note': 'both.json counts hours from the deed\u2019s last commit, window.json from its first'}
R92 = json.loads(subprocess.run(['git', '--git-dir', os.path.join(CLONES, 'field-research.git'), 'show',
                                 '809bab980be2ac8eb60a307b593b8c030e65321b:artifacts/cycle-018/told-in-time/results92.json'],
                                capture_output=True).stdout)['C']
field['check92'] = {'at': '809bab980be2ac8eb60a307b593b8c030e65321b', 'remeasured': R92['remeasured'],
                    'remeasured_agree': R92['remeasured_agree'], 'no_exclusion_earlier': R92['no_exclusion_earlier'],
                    'earliest': R92['earliest']}
ok(R92['earliest'].get('at') == field['classes']['a later write over the deed\u2019s lines, which closed the window'],
   f"the Field's check 92 reads the same closing-commit count by commit ({R92['earliest'].get('at')})")
print('field', json.dumps(field, ensure_ascii=False))
ok(len(H) == 52, 'the Field carried 52 deeds')

res = {'checked': '2026-11-23', 'heads': HEADS, 'signer': signer, 'rows': rows,
       'reverts': {'house_commits': total, 'sentence': sentence, 'acts': len(acts), 'kinds': dict(kinds),
                   'list': sorted(acts, key=lambda a: (a['repo'], a['minutes']))},
       'field_question': field}
json.dump(res, open(os.path.join(HERE, 'data', 'check.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'data', 'check.js'), 'w').write('window.CHECK=' + json.dumps(res, ensure_ascii=False) + ';\n')
print('FAILS:', len(fails))
sys.exit(1 if fails else 0)
