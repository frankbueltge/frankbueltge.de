"""Study 91, part B -- the Atelier's revert window, measured a second time by this practice's own procedure.

Usage: python3 window91.py <window.json> <clones-dir> [--all]
  <window.json>  the Atelier's file (ulysses 33ba12f9, artifacts/cycle-018/until-another-hand/data/window.json)
  <clones-dir>   holds full clones named `site` (frankbueltge.de) and `ulysses`
Writes window91.json beside this script. No network, no model.

Procedure (CODEBOOK91.md, part B): for each sampled deed, the main line is `git rev-list --first-parent` of the head
the Atelier recorded. The scan starts at the main-line commit where the deed's last commit landed. At that commit and
at every later main-line commit that `git log --first-parent -- <the deed's paths>` lists, in order, a scratch working
tree is checked out and the deed's commits are reverted with a real `git revert --no-commit`, newest first. The window
is closed at the first commit where a revert stops on a conflict in a path other than the two the Atelier excludes.
If no listed commit conflicts, the head is tried; if it conflicts there, the span is bisected.
"""
import hashlib, json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
EXCLUDED = {'docs/decision-log.md', 'src/data/graph/graph.json'}
DIRS = {'frankbueltge.de': 'site', 'ulysses': 'ulysses'}
ENV = {**os.environ, 'GIT_AUTHOR_NAME': 'probe', 'GIT_AUTHOR_EMAIL': 'probe@probe.invalid',
       'GIT_COMMITTER_NAME': 'probe', 'GIT_COMMITTER_EMAIL': 'probe@probe.invalid', 'GIT_TERMINAL_PROMPT': '0'}


def run(cwd, *a, ok=(0,)):
    p = subprocess.run(['git', *a], cwd=cwd, capture_output=True, text=True, env=ENV)
    if p.returncode not in ok:
        raise RuntimeError(f'git {" ".join(a)} in {cwd}: {p.returncode} {p.stderr[:400]}')
    return p


def sample(window):
    pool = [d for d in window['deeds'] if d.get('closed_by') and d.get('commits')
            and all(r in DIRS for r, _ in d['commits'])]
    pool.sort(key=lambda d: (d['row'], d['n']))
    return pool, random.Random(91).sample(pool, 12)


class Repo:
    def __init__(self, clones, name, head_short):
        self.git = os.path.join(clones, DIRS[name])
        self.head = run(self.git, 'rev-parse', head_short + '^{commit}').stdout.strip()
        self.line = run(self.git, 'rev-list', '--first-parent', '--reverse', self.head).stdout.split()
        self.pos = {h: i for i, h in enumerate(self.line)}
        self.wt = os.path.join(clones, 'wt91-' + DIRS[name])
        if not os.path.isdir(self.wt):
            run(self.git, 'worktree', 'add', '-q', '--detach', self.wt, self.head)

    def full(self, short):
        return run(self.git, 'rev-parse', short + '^{commit}').stdout.strip()

    def landing(self, h):
        """Index of the first main-line commit that contains h."""
        if h in self.pos:
            return self.pos[h]
        lo, hi = 0, len(self.line) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if run(self.git, 'merge-base', '--is-ancestor', h, self.line[mid], ok=(0, 1)).returncode == 0:
                hi = mid
            else:
                lo = mid + 1
        return lo

    def parents(self, h):
        return run(self.git, 'rev-list', '--parents', '-n', '1', h).stdout.split()[1:]

    def paths(self, h):
        ps = self.parents(h)
        out = run(self.git, 'diff', '--name-only', ps[0], h).stdout if ps else \
            run(self.git, 'show', '--name-only', '--format=', h).stdout
        return {x for x in out.split('\n') if x}

    def time(self, h):
        return int(run(self.git, 'show', '-s', '--format=%ct', h).stdout.strip())

    def revert_conflicts(self, at, deed):
        """Check out `at`, revert the deed's commits newest first; return the conflicting paths outside EXCLUDED."""
        wt = self.wt
        run(wt, 'revert', '--quit', ok=(0, 1, 128))
        run(wt, 'reset', '-q', '--hard')
        run(wt, 'checkout', '-q', '-f', '--detach', at)
        run(wt, 'clean', '-fdq')
        for d in sorted(deed, key=self.time, reverse=True):
            args = ['revert', '--no-commit'] + (['-m', '1'] if len(self.parents(d)) > 1 else []) + [d]
            p = run(wt, *args, ok=(0, 1))
            if p.returncode == 0:
                continue
            unmerged = {x for x in run(wt, 'diff', '--name-only', '--diff-filter=U').stdout.split('\n') if x}
            if not unmerged:
                raise RuntimeError(f'revert of {d} on {at} failed without a conflict: {p.stderr[:300]}')
            if unmerged - EXCLUDED:
                return sorted(unmerged - EXCLUDED)
            for x in unmerged:   # a conflict only in an excluded path: take the state before the revert, go on
                run(wt, 'checkout', '--ours', '--', x, ok=(0, 1))
                run(wt, 'add', '-A', '--', x)
            run(wt, 'revert', '--quit', ok=(0, 1, 128))
        return []


def measure(repo, d):
    deed = [repo.full(s) for _, s in d['commits']]
    start = max(repo.landing(h) for h in deed)
    paths = set().union(*(repo.paths(h) for h in deed))
    listed = run(repo.git, 'log', '--first-parent', '--reverse', '--format=%H',
                 f'{repo.line[start]}..{repo.head}', '--', *sorted(paths)).stdout.split()
    tried, last_clean = 0, start
    for c in [repo.line[start]] + listed:
        tried += 1
        why = repo.revert_conflicts(c, deed)
        if why:
            return c, why, 'scan', tried
        last_clean = repo.pos[c]
    why = repo.revert_conflicts(repo.head, deed)
    tried += 1
    if not why:
        return None, [], 'scan', tried
    lo, hi = last_clean + 1, len(repo.line) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        tried += 1
        if repo.revert_conflicts(repo.line[mid], deed):
            hi = mid
        else:
            lo = mid + 1
    return repo.line[lo], repo.revert_conflicts(repo.line[lo], deed), 'bisection', tried + 1


def main():
    wpath, clones = sys.argv[1], sys.argv[2]
    raw = open(wpath, 'rb').read()
    window = json.loads(raw)
    pool, picked = sample(window)
    whole = '--all' in sys.argv[3:]
    if whole:   # beyond the prediction: the whole pool, reported apart from P151
        picked = pool
    repos = {r: Repo(clones, r, window['results']['heads'][r]) for r in DIRS}
    rows = []
    for d in picked:
        r = repos[d['commits'][0][0]]
        c, why, how, tried = measure(r, d)
        t0 = min(r.time(r.full(s)) for _, s in d['commits'])
        mine = c[:12] if c else None
        rows.append({'row': d['row'], 'n': d['n'], 'repo': d['commits'][0][0],
                     'deed_commits': [s for _, s in d['commits']],
                     'atelier_closed_by': d['closed_by'][1], 'atelier_closed_hours': d['closed_hours'],
                     'atelier_found_by': d['closed_found_by'],
                     'field_closed_by': mine,
                     'field_closed_hours': round((r.time(c) - t0) / 3600, 2) if c else None,
                     'field_found_by': how, 'field_commits_tried': tried, 'field_conflict_paths': why[:5],
                     'agree': mine == d['closed_by'][1]})
        print(f"row {d['row']:>3} n{d['n']}: Atelier {d['closed_by'][1]} ({d['closed_hours']} h)  "
              f"Field {mine} ({rows[-1]['field_closed_hours']} h)  {'agree' if rows[-1]['agree'] else 'DIFFER'}")
    agree = sum(r['agree'] for r in rows)
    if whole:
        json.dump({'what': 'Study 91, part B, beyond the prediction: the whole pool of the sample, re-measured by the '
                           'same procedure (window91.py --all).', 'pool': len(pool), 'agree': agree,
                   'differ': [r for r in rows if not r['agree']]},
                  open(os.path.join(HERE, 'window91-all.json'), 'w'), indent=1)
        print(f'whole pool: agree {agree} of {len(rows)}')
        return
    out = {'what': 'Study 91, part B: the Atelier\'s revert window re-measured on a seeded sample of 12 deeds by a real '
                   'git revert in a working tree (window91.py; CODEBOOK91.md, part B).',
           'material': {'file': 'ulysses 33ba12f9 artifacts/cycle-018/until-another-hand/data/window.json',
                        'sha256': hashlib.sha256(raw).hexdigest(), 'handoff': 'ho-2026-11-22-atelier-1'},
           'heads': {r: repos[r].head[:12] for r in repos},
           'pool': len(pool), 'sample_seed': 91, 'sampled': len(rows), 'agree': agree,
           'P151': {'agree': agree, 'of': len(rows), 'held': agree >= 10},
           'deeds': rows}
    json.dump(out, open(os.path.join(HERE, 'window91.json'), 'w'), indent=1)
    print(f'agree {agree} of {len(rows)} (pool {len(pool)})')


if __name__ == '__main__':
    main()
