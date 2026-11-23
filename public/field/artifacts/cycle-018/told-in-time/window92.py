"""Check 92, part C -- the house's clock by commit, and the window without the Atelier's exclusion.

Usage: python3 window92.py <clones-dir>
  <clones-dir> holds the Atelier's window.json (ulysses 33ba12f9) and both.json (ulysses b05b358d), extracted by
  `git show`, and full clones named site (frankbueltge.de), ulysses, studio, machine-attention, research-ecology and
  error-as-method.
Writes window92.json beside this script. No network, no model.

For each of the 52 deeds of house91.json (CODEBOOK92.md, part C):
  1. the earliest later trace is identified by commit: the first entry of the deed's `hands` in both.json (the first
     later commit that took out a line the deed wrote), or, where there is none, the mending (window.json `repair`);
  2. the closing commit is window.json's `closed_by`; *at* means the same commit; otherwise *before* or *after* by the
     main-line position where each commit landed (git rev-list --first-parent of the Atelier's head);
  3. the mending is placed against the closing commit the same way;
  4. hours are read from Git (committer times, from the deed's earliest commit), as window91.py reads them;
  5. the window is measured by window91.py's procedure twice: with the Atelier's exclusion (docs/decision-log.md and
     src/data/graph/graph.json), and with no excluded path.
"""
import hashlib, json, os, statistics, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
EXCLUDED = {'docs/decision-log.md', 'src/data/graph/graph.json'}
DIRS = {'frankbueltge.de': 'site', 'ulysses': 'ulysses', 'studio': 'studio', 'machine-attention': 'machine-attention',
        'research-ecology': 'research-ecology', 'error-as-method': 'error-as-method',
        'field-research': 'field-research'}
ENV = {**os.environ, 'GIT_AUTHOR_NAME': 'probe', 'GIT_AUTHOR_EMAIL': 'probe@probe.invalid',
       'GIT_COMMITTER_NAME': 'probe', 'GIT_COMMITTER_EMAIL': 'probe@probe.invalid', 'GIT_TERMINAL_PROMPT': '0'}


def run(cwd, *a, ok=(0,)):
    p = subprocess.run(['git', *a], cwd=cwd, capture_output=True, text=True, env=ENV)
    if p.returncode not in ok:
        raise RuntimeError(f'git {" ".join(a)} in {cwd}: {p.returncode} {p.stderr[:400]}')
    return p


class Repo:
    def __init__(self, clones, name, head_short):
        self.name = name
        self.git = os.path.join(clones, DIRS[name])
        self.head = run(self.git, 'rev-parse', head_short + '^{commit}').stdout.strip()
        self.line = run(self.git, 'rev-list', '--first-parent', '--reverse', self.head).stdout.split()
        self.pos = {h: i for i, h in enumerate(self.line)}
        self.wt = os.path.join(clones, 'wt92-' + DIRS[name])
        if not os.path.isdir(self.wt):
            run(self.git, 'worktree', 'add', '-q', '--detach', self.wt, self.head)
        self._t = {}

    def full(self, short):
        return run(self.git, 'rev-parse', short + '^{commit}').stdout.strip()

    def landing(self, h):
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
        if h not in self._t:
            self._t[h] = int(run(self.git, 'show', '-s', '--format=%ct', h).stdout.strip())
        return self._t[h]

    def revert_conflicts(self, at, deed, excluded):
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
            if unmerged - excluded:
                return sorted(unmerged - excluded)
            for x in unmerged:
                run(wt, 'checkout', '--ours', '--', x, ok=(0, 1))
                run(wt, 'add', '-A', '--', x)
            run(wt, 'revert', '--quit', ok=(0, 1, 128))
        return []


def measure(repo, deed, excluded):
    """window91.py's procedure, with the excluded paths as a parameter."""
    start = max(repo.landing(h) for h in deed)
    paths = set().union(*(repo.paths(h) for h in deed))
    listed = run(repo.git, 'log', '--first-parent', '--reverse', '--format=%H',
                 f'{repo.line[start]}..{repo.head}', '--', *sorted(paths)).stdout.split()
    tried, last_clean = 0, start
    for c in [repo.line[start]] + listed:
        tried += 1
        why = repo.revert_conflicts(c, deed, excluded)
        if why:
            return c, why, 'scan', tried
        last_clean = repo.pos[c]
    why = repo.revert_conflicts(repo.head, deed, excluded)
    tried += 1
    if not why:
        return None, [], 'scan', tried
    lo, hi = last_clean + 1, len(repo.line) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        tried += 1
        if repo.revert_conflicts(repo.line[mid], deed, excluded):
            hi = mid
        else:
            lo = mid + 1
    return repo.line[lo], repo.revert_conflicts(repo.line[lo], deed, excluded), 'bisection', tried + 1


def order(repo, a, b):
    """'at' if a and b are one commit; 'lands with it' if a lands in b's main-line commit; else 'before'/'after'."""
    if a == b:
        return 'at'
    la, lb = repo.landing(a), repo.landing(b)
    if la == lb:
        return 'lands with it'
    return 'before' if la < lb else 'after'


def main():
    clones = sys.argv[1]
    wraw = open(os.path.join(clones, 'window.json'), 'rb').read()
    braw = open(os.path.join(clones, 'both.json'), 'rb').read()
    window, both = json.loads(wraw), json.loads(braw)
    house = json.load(open(os.path.join(HERE, 'house91.json')))
    W = {(d['row'], d['n']): d for d in window['deeds']}
    B = {(p['row'], p['n']): p for p in both['pairs']}
    repos = {r: Repo(clones, r, window['results']['heads'][r]) for r in DIRS}
    rows = []
    for p in house['pairs']:
        key = (p['row'], p['deed'])
        w, b = W[key], B[key]
        # the window is measured in the repository of its closing commit, on the deed's commits there (two deeds
        # wrote in more than one repository); hours run from the deed's earliest commit in any repository
        repo = repos[w['closed_by'][0]]
        deed = [repo.full(s) for r, s in w['commits'] if r == w['closed_by'][0]]
        t0 = min(repos[r].time(repos[r].full(s)) for r, s in w['commits'])
        closed = repo.full(w['closed_by'][1])
        mrepo = repos[w['repair'][0]]
        mending = mrepo.full(w['repair'][1])
        hands = b.get('hands') or []
        first_is_mending = not hands
        if first_is_mending:
            first, frepo = mending, mrepo
        else:
            frepo = next(rr for rr in [repos[p['repo']]] + list(repos.values())
                         if run(rr.git, 'cat-file', '-e', hands[0]['h'] + '^{commit}', ok=(0, 1, 128)).returncode == 0)
            first = frepo.full(hands[0]['h'])
        hrs = lambda h, rr=repo: round((rr.time(h) - t0) / 3600, 2)

        def place(rr, a):
            if rr is repo:
                return order(repo, a, closed)
            return 'before' if rr.time(a) < repo.time(closed) else 'after'   # another repository: by time
        with_ex = measure(repo, deed, EXCLUDED)
        no_ex = measure(repo, deed, set())
        rows.append({
            'row': p['row'], 'deed': p['deed'], 'repo': p['repo'],
            'first_commit': first[:12], 'first_repo': frepo.name, 'first_is_mending': first_is_mending,
            'first_hours_git': hrs(first, frepo), 'first_hours_carried': p['first_hand_hours'] if p['first_hand_hours'] is not None else p['mending_hours'],
            'mending_commit': mending[:12], 'mending_repo': mrepo.name, 'mending_hours_git': hrs(mending, mrepo), 'mending_hours_carried': p['mending_hours'],
            'closed_commit': closed[:12], 'closed_hours_carried': p['closed_hours'], 'closed_hours_git': hrs(closed),
            'closed_by_mending': p['closed_by_mending'],
            'closed_repo': repo.name, 'deed_repos': sorted({r for r, _ in w['commits']}),
            'earliest_by_commit': place(frepo, first),
            'mending_by_commit': place(mrepo, mending),
            'remeasured_with_exclusion': with_ex[0][:12] if with_ex[0] else None,
            'remeasured_agree': (with_ex[0] or '')[:12] == closed[:12],
            'no_exclusion_commit': no_ex[0][:12] if no_ex[0] else None,
            'no_exclusion_hours': hrs(no_ex[0]) if no_ex[0] else None,
            'no_exclusion_paths': no_ex[1][:5],
            'no_exclusion_earlier': bool(no_ex[0]) and repo.landing(no_ex[0]) < repo.landing(closed),
            'no_exclusion_tried': no_ex[3],
        })
        print(p['row'], p['deed'], p['repo'], rows[-1]['earliest_by_commit'], rows[-1]['remeasured_agree'],
              rows[-1]['no_exclusion_hours'], p['closed_hours'], flush=True)
    out = {'what': 'Check 92, part C: the 52 deeds of the house\'s clock compared by commit, re-measured with the Atelier\'s exclusion and measured without it (window92.py; CODEBOOK92.md, part C).',
           'material': {'window.json': {'commit': 'ulysses 33ba12f9', 'sha256': hashlib.sha256(wraw).hexdigest()},
                        'both.json': {'commit': 'ulysses b05b358d', 'sha256': hashlib.sha256(braw).hexdigest()}},
           'heads': window['results']['heads'], 'rows': rows}
    json.dump(out, open(os.path.join(HERE, 'window92.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
