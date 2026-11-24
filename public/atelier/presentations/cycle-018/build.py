#!/usr/bin/env python3
"""Until Another Hand, state 1 (2026-11-22): the window in which a deed could still be undone.

Step 6 of the programme asks which signals would tell *in time* whether control is kept or lost. This work reads
"in time" as a window, not a deadline: a deed is answered in time while it can still be undone without undoing anyone
else's work. Prakash and Knister (CSCW 1992) state the condition for a selective undo: "an operation cannot be undone
if it conflicts with a later operation, unless the later operation is undone first". Git carries the same test: a
revert of a commit applies cleanly on top of a later state, or it conflicts.

For every deed of the house's decision log that public Git holds (the 88 deeds of the Field's study 85, as this
practice's On Its Own Account sorted them, data/sort.json at ulysses b05b358), this build finds:

  the window: the first later commit on the repository's main line at which reverting the deed's commits (newest
    first, as `git revert` does) no longer applies cleanly; that commit's time, its Git name, whether it is the
    mending itself;
  at the mending: whether one revert of the deed would still have applied cleanly on the state the mending changed;
  the house's own knowing: the day the log wrote the deed down (its only dated record of becoming aware);
  the mending's time, as Git holds it.

And, across every commit of the seven repositories: how many reverts the house ever made (a revert's message is the
only join from an answer to its deed that the tool itself writes).

The test is Git's, not the meaning's: a revert conflicts where a later change touches the same or adjacent lines. A
later change can depend on the deed without touching its lines (then the revert applies and still breaks), and can
touch its lines without depending on it. Conflicts only in the log's own file and in the derived graph are not
counted, as in On Its Own Account (state 4): undoing a deed is not unwriting its record.

Run from this folder:  python3 build.py <dir of full bare clones named <repo>.git>
   (git clone --bare https://github.com/frankbueltge/<repo>.git <dir>/<repo>.git, for frankbueltge.de, ulysses,
    studio, field-research, machine-attention, error-as-method, research-ecology; nothing is fetched while it runs)

Writes data/window.json and data/window.js. Nothing here asks a model; no reader codes anything.
"""
import json, os, statistics, subprocess, sys
from collections import Counter
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CLONES = sys.argv[1]
SORT_AT = 'b05b358d94aee0868a8258b4e707f2f4cdea9c17'   # ulysses: On Its Own Account, state 5
SORT_PATH = 'artifacts/cycle-017/on-its-own-account/data/sort.json'
BOTH_PATH = 'artifacts/cycle-017/on-its-own-account/data/both.json'
REPOS = ['frankbueltge.de', 'ulysses', 'studio', 'field-research', 'machine-attention', 'error-as-method',
         'research-ecology']
NOT_JOINED = {'docs/decision-log.md', 'src/data/graph/graph.json'}
ENV = {**os.environ, 'GIT_NO_LAZY_FETCH': '1', 'GIT_AUTHOR_NAME': 'probe', 'GIT_AUTHOR_EMAIL': 'probe@probe.invalid',
       'GIT_COMMITTER_NAME': 'probe', 'GIT_COMMITTER_EMAIL': 'probe@probe.invalid',
       'GIT_AUTHOR_DATE': '2000-01-01T00:00:00Z', 'GIT_COMMITTER_DATE': '2000-01-01T00:00:00Z'}
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def git(repo, *a, check=False):
    p = subprocess.run(['git', '--git-dir', os.path.join(CLONES, repo + '.git'), *a], capture_output=True, env=ENV)
    if check and p.returncode != 0:
        raise RuntimeError(f'{repo}: git {" ".join(a)}: {p.stderr.decode()[:300]}')
    return p.returncode, p.stdout.decode('utf-8', 'replace')


def signer(an):   # the Field's classes (heirs89.py), as On Its Own Account state 5 used them
    if an == 'Frank Bültge':
        return "the architect's name"
    if an.split(' ')[0] in ('Meridian', 'Ulysses', 'Assay', 'Ensemble'):
        return "a practice's persona"
    return 'a workflow or bot'


def iso(t):
    return datetime.fromtimestamp(t, timezone.utc).strftime('%Y-%m-%dT%H:%MZ')


def day_start(day):
    return int(datetime.strptime(day, '%Y-%m-%d').replace(tzinfo=timezone.utc).timestamp())


# ---------------------------------------------------------------- the main lines, with the paths each step changes
class Line:
    def __init__(self, repo):
        self.repo = repo
        _, out = git(repo, 'log', '--first-parent', '-m', '--reverse', '--no-renames', '--name-only',
                     '--format=@@%H %ct %an', 'HEAD', check=True)
        self.order, self.paths, self.time, self.name = [], {}, {}, {}
        cur = None
        for line in out.split('\n'):
            if line.startswith('@@'):
                h, t, an = line[2:].split(' ', 2)
                cur = h
                self.order.append(h)
                self.paths[h] = set()
                self.time[h] = int(t)
                self.name[h] = an
            elif line.strip() and cur:
                self.paths[cur].add(line.strip())
        self.index = {h: i for i, h in enumerate(self.order)}
        self.head = self.order[-1]

    def landing(self, h):
        """The first main-line commit that contains h (h itself when h is on the main line)."""
        if h in self.index:
            return self.index[h]
        lo, hi = 0, len(self.order) - 1
        if git(self.repo, 'merge-base', '--is-ancestor', h, self.head)[0] != 0:
            return None
        while lo < hi:   # containment is monotone along the main line
            mid = (lo + hi) // 2
            if git(self.repo, 'merge-base', '--is-ancestor', h, self.order[mid])[0] == 0:
                hi = mid
            else:
                lo = mid + 1
        return lo


LINES = {r: Line(r) for r in REPOS}


def full(repo, short):
    code, out = git(repo, 'rev-parse', '--verify', '--quiet', short + '^{commit}')
    return out.strip() if code == 0 else None


def ctime(repo, h):
    return int(git(repo, 'show', '-s', '--format=%ct', h, check=True)[1].strip())


ROOT_STAND_IN = {}


def first_parent(repo, h):
    """The first parent; for a root commit, a commit of the empty tree, so that its revert takes out what it wrote."""
    out = git(repo, 'rev-list', '--parents', '-n', '1', h, check=True)[1].split()
    if len(out) > 1:
        return out[1]
    if repo not in ROOT_STAND_IN:
        empty = subprocess.run(['git', '--git-dir', os.path.join(CLONES, repo + '.git'), 'hash-object', '-t', 'tree',
                                '-w', '--stdin'], input=b'', capture_output=True, env=ENV).stdout.decode().strip()
        ROOT_STAND_IN[repo] = git(repo, 'commit-tree', empty, '-m', 'empty', check=True)[1].strip()
    return ROOT_STAND_IN[repo]


def touched(repo, h):
    p = first_parent(repo, h)
    return set(x for x in git(repo, 'diff', '--no-renames', '--name-only', p, h, check=True)[1].split('\n') if x)


def first_conflict(repo, hs, start, end, paths):
    """The first main-line index in [start, end] at which the revert conflicts, or None; and how it was found.
    Only commits that change one of the deed's paths can close the window, so those are tried in order; a closing
    the scan cannot see (a path renamed later) is caught by testing `end` itself, then bisecting."""
    L = LINES[repo]
    last_clean = start
    for i in [start] + [i for i in range(start + 1, end + 1) if L.paths[L.order[i]] & paths]:
        good, why = revert_clean(repo, hs, L.order[i])
        if not good:
            return i, why, 'scan'
        last_clean = i
    good, why = revert_clean(repo, hs, L.order[end])
    if good:
        return None, [], 'scan'
    lo, hi = last_clean + 1, end   # clean at last_clean, conflicting at end
    while lo < hi:
        mid = (lo + hi) // 2
        if revert_clean(repo, hs, L.order[mid])[0]:
            lo = mid + 1
        else:
            hi = mid
    return lo, revert_clean(repo, hs, L.order[lo])[1], 'bisection'


def revert_clean(repo, deed_commits, on):
    """Would `git revert` of deed_commits (newest first) apply on top of `on` without a conflict outside NOT_JOINED?"""
    cur = on
    for d in sorted(deed_commits, key=lambda h: ctime(repo, h), reverse=True):
        p = first_parent(repo, d)
        code, out = git(repo, 'merge-tree', '--write-tree', '--name-only', '--no-messages', f'--merge-base={d}', cur, p)
        lines = out.split('\n')
        tree = lines[0].strip()
        if code == 1:
            conflicted = set(x for x in lines[1:] if x.strip())
            if not conflicted <= NOT_JOINED:
                return False, sorted(conflicted - NOT_JOINED)
        elif code != 0:
            raise RuntimeError(f'merge-tree failed in {repo} on {on} for {d}')
        _, c = git(repo, 'commit-tree', tree, '-p', cur, '-m', 'probe', check=True)
        cur = c.strip()
    return True, []


# ---------------------------------------------------------------- the deeds
def show(path):
    return json.loads(git('ulysses', 'show', f'{SORT_AT}:{path}', check=True)[1])


SORT = show(SORT_PATH)
BOTH = show(BOTH_PATH)
DEEDS = SORT['act']['deeds']
ok(len(DEEDS) == 88, f'the log holds 88 deeds ({len(DEEDS)})')
first_hand = {(p['row'], p['n']): p['hands'][0]['hours'] if p['hands'] else None for p in BOTH['pairs']}

out = []
for d in DEEDS:
    rec = {'row': d['row'], 'n': d['n'], 'kind': d['kind'], 'relation': d['relation'], 'seer': d['seer'],
           'deed_line': d['deed_line'], 'log_date': d['log_date'], 'join': d['join'],
           'repair_signer': d.get('repair_signer'), 'says_machine': d.get('says_machine')}
    if d['found'] != 'at its commit':   # the population of On Its Own Account, state 4: 80 deeds at a commit in Git
        rec['state'] = 'not at a commit in Git'
        out.append(rec)
        continue
    rep = None
    if d.get('repair'):
        rr, rs = d['repair']
        rh = full(rr, rs)
        if rh:
            rep = (rr, rh, ctime(rr, rh))
    parts = {}
    for repo, short in d['commits']:
        h = full(repo, short)
        if h is None:
            rec.setdefault('unresolved', []).append([repo, short])
            continue
        if rep and (h == rep[1] or ctime(repo, h) > rep[2]):
            rec.setdefault('left_out', []).append([repo, short])   # the mending itself, or a commit after it
            continue
        parts.setdefault(repo, []).append(h)
    if not parts:
        rec['state'] = 'deed and mending one commit' if rep else 'not at a commit in Git'
        out.append(rec)
        continue
    t0 = min(ctime(r, h) for r, hs in parts.items() for h in hs)
    rec['deed_time'] = iso(t0)
    rec['commits'] = [[r, h[:12]] for r, hs in parts.items() for h in hs]
    if rep:
        rec['repair'] = [rep[0], rep[1][:12]]
        rec['repair_hours'] = round((rep[2] - t0) / 3600, 2)
    rec['log_hours'] = [round((day_start(d['log_date']) - t0) / 3600, 2),
                        round((day_start(d['log_date']) + 86400 - t0) / 3600, 2)]
    rec['first_hand_hours'] = first_hand.get((d['row'], d['n']))

    closes = []   # (time, repo, commit, name, conflicted paths)
    clean_at_mend = True
    off_line = False
    for repo, hs in parts.items():
        L = LINES[repo]
        idx = [L.landing(h) for h in hs]
        if None in idx:
            off_line = True
            continue
        start = max(idx)
        if rep and rep[0] == repo and rep[1] in L.index and start > L.index[rep[1]]:
            rec['landed_after_mending'] = True   # a deed commit reached the main line only after its mending did
        paths = set().union(*(touched(repo, h) for h in hs)) - NOT_JOINED
        i, why, how = first_conflict(repo, hs, start, len(L.order) - 1, paths)
        if rep:   # the state the mending changed: its own parent in its repository; elsewhere the main line before it
            if rep[0] == repo:
                at = first_parent(repo, rep[1])
            else:
                later = [j for j in range(start, len(L.order)) if L.time[L.order[j]] >= rep[2]]
                at = L.order[max(start, later[0] - 1)] if later else L.head
            clean_at_mend = clean_at_mend and revert_clean(repo, hs, at)[0]
        if i is not None:
            c = L.order[i]
            closes.append((L.time[c], repo, c, L.name[c], why, how))
    if off_line and not closes:
        rec['state'] = 'off the main line'
        out.append(rec)
        continue
    if closes:
        t, repo, c, an, why, how = min(closes)
        rec['closed_found_by'] = how
        rec['closed_hours'] = round((t - t0) / 3600, 2)
        rec['closed_by'] = [repo, c[:12]]
        rec['closed_signer'] = signer(an)
        rec['closed_paths'] = why[:5]
        rec['closed_by_mending'] = bool(rep and c == rep[1])
    else:
        rec['closed_hours'] = None
    if rep and rec.get('landed_after_mending'):
        rec['state'] = 'deed landed after its mending'
    elif rep:
        rec['clean_at_mending'] = clean_at_mend
        rec['state'] = 'mended inside the window' if clean_at_mend else 'mended after the window closed'
    else:
        rec['state'] = 'unmended, window open at head' if not closes else 'unmended, window closed'
    out.append(rec)
    print(f"row {d['row']:>3} n{d['n']} {rec['state']:<32} closed {rec.get('closed_hours')} h, mended "
          f"{rec.get('repair_hours')} h")

# ---------------------------------------------------------------- the reverts of the whole house
reverts, total = [], 0
for repo in REPOS:
    _, n = git(repo, 'rev-list', '--count', 'HEAD', check=True)
    total += int(n)
    _, msgs = git(repo, 'log', '--format=%H%x00%B%x01', 'HEAD', check=True)
    for m in msgs.split('\x01'):
        if '\x00' not in m:
            continue
        h, body = m.split('\x00', 1)
        if 'This reverts commit' in body:
            reverts.append([repo, h.strip()[:12]])

# ---------------------------------------------------------------- results
in_git = [r for r in out if 'deed_time' in r and r['state'] not in ('off the main line', 'deed landed after its mending')]
mended = [r for r in in_git if 'repair_hours' in r]
inside = [r for r in mended if r['clean_at_mending']]
after = [r for r in mended if not r['clean_at_mending']]
closed = [r for r in in_git if r.get('closed_hours') is not None]
same_day = [r for r in mended if r['log_hours'][0] <= r['repair_hours'] < r['log_hours'][1]]
closed_before_log = [r for r in closed if r['closed_hours'] < r['log_hours'][0]]
res = {
    'deeds': len(out), 'at_commit': len(in_git) + sum(r['state'] == 'deed and mending one commit' for r in out),
    'measured': len(in_git), 'one_commit': sum(r['state'] == 'deed and mending one commit' for r in out),
    'not_at_commit': sum(r['state'] == 'not at a commit in Git' for r in out),
    'off_line': sum(r['state'] == 'off the main line' for r in out),
    'landed_after': sum(r['state'] == 'deed landed after its mending' for r in out),
    'mended': len(mended), 'inside': len(inside), 'after': len(after),
    'closed': len(closed),
    'closed_median_h': round(statistics.median(r['closed_hours'] for r in closed), 2) if closed else None,
    'closed_within_24h': sum(r['closed_hours'] <= 24 for r in closed),
    'closed_at_deed': sum(r['closed_hours'] <= 0 for r in closed),
    'closed_by_mending': sum(bool(r.get('closed_by_mending')) for r in closed),
    'closed_signer': dict(Counter(r['closed_signer'] for r in closed if not r.get('closed_by_mending'))),
    'mending_median_h': round(statistics.median(r['repair_hours'] for r in mended), 2),
    'log_same_day_as_mending': len(same_day),
    'closed_before_log_day': len(closed_before_log),
    'unmended_open': sum(r['state'] == 'unmended, window open at head' for r in out),
    'unmended_closed': sum(r['state'] == 'unmended, window closed' for r in out),
    'house_commits': total, 'house_reverts': len(reverts), 'reverts': reverts,
    'heads': {r: LINES[r].head[:12] for r in REPOS},
}
for k, v in res.items():
    if k not in ('reverts',):
        print(k, v)
res['at_commit'] += res['landed_after']
ok(res['at_commit'] == 80, f"80 deeds at a commit in Git, as On Its Own Account state 4 ({res['at_commit']})")
ok(res['inside'] + res['after'] == res['mended'], 'every mending is inside or after the window')
ok(all(r['repair_hours'] >= 0 for r in mended), 'no mending before its deed')

doc = {'what': 'Until Another Hand, state 1: for each deed of the house log that Git holds, the window in which one '
               'revert could still undo it, the day the log wrote it down, and its mending; and every revert of the '
               'house.', 'sort_at': SORT_AT, 'results': res, 'deeds': out}
with open(os.path.join(HERE, 'data', 'window.json'), 'w') as f:
    json.dump(doc, f, indent=1, ensure_ascii=False)
with open(os.path.join(HERE, 'data', 'window.js'), 'w') as f:
    f.write('window.WINDOW = ' + json.dumps(doc, ensure_ascii=False) + ';\n')
print('FAILS:', len(fails))
sys.exit(1 if fails else 0)
