#!/usr/bin/env python3
"""On Its Own Account, state 5 (2026-11-21, after the presentation): the join read from both ends.

State 4 found that Git joins 60 of the log's 77 mendings to their deed without the log, 52 because the mending takes out
lines the deed wrote, and wrote that anyone with Git who follows the file forward from the deed comes to the mending.
The Field's reading 89 (field-research e08ba8f) then followed the deed's lines forward and found the mending the first
commit to take one out in only 15 of 53 pairs. This build reads that figure again by this work's own rule and asks the
question it leaves open: from either end, is the log's pair the one Git points to, or one strand among several?

  Forward, from the deed: every commit between the deed and its mending that takes out a line the deed wrote and that
    still stood (a "hand" on the deed's lines). The deed's lines are tracked as they survive: a line taken out once is
    gone, and the same text written again later is somebody else's.
  Backward, from the mending: whose lines the mending took out, by `git blame` at the mending's parent: how many
    commits wrote them, and whether the deed wrote the most.

Run from this folder:  python3 build5.py <dir of bare clones named <repo>.git>
   (full bare clones: git clone --bare https://github.com/frankbueltge/<repo>.git <dir>/<repo>.git, for
    frankbueltge.de, ulysses, machine-attention, research-ecology, studio, error-as-method; nothing is fetched while it
    runs, and a path whose blob is missing is reported unread, never guessed)

Writes data/both.json and data/both.js. Nothing here asks a model; no reader codes anything.
"""
import json, os, re, statistics, subprocess, sys, urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CLONES = sys.argv[1]
F88 = '1c00dd20578f297a72b83b2e496b19e4a3f5013f'   # field-research after its presentation: credit88.json (state 4's source)
F89 = 'e08ba8f424f9794a4c27c0711f02d90e3843d19f'   # field-research state 5: reading 89
RAW = 'https://raw.githubusercontent.com/frankbueltge/field-research/{}/artifacts/cycle-017/what-the-house-did-unasked/'
NOT_JOINED = {'docs/decision-log.md', 'src/data/graph/graph.json'}   # as state 4: the log's row and the derived graph
ENV = {**os.environ, 'GIT_NO_LAZY_FETCH': '1'}
EMPTY = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
HUNK = re.compile(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@')
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def field(commit, name):
    return json.loads(urllib.request.urlopen(RAW.format(commit) + name, timeout=120).read())


def git(repo, *a):
    p = subprocess.run(['git', '--git-dir', os.path.join(CLONES, repo + '.git'), *a], capture_output=True, env=ENV)
    return p.returncode, p.stdout.decode('utf-8', 'replace')


def keep(s):
    """This work's rule for a line that can carry a join (state 4): at least 12 characters, at least one letter."""
    return len(s) >= 12 and re.search('[A-Za-z]', s)


def parents(repo, h):
    code, out = git(repo, 'rev-list', '--parents', '-n', '1', h)
    return out.split()[1:] if code == 0 and out.strip() else None


def ctime(repo, h):
    code, out = git(repo, 'show', '-s', '--format=%ct', h)
    return int(out.strip()) if code == 0 and out.strip() else None


def author(repo, h):
    return git(repo, 'show', '-s', '--format=%an', h)[1].strip()


def signer(an):   # the Field's classes (heirs89.py), so the two readings name the same people
    if an == 'Frank Bültge':
        return "the architect's name"
    if an.split(' ')[0] in ('Meridian', 'Ulysses', 'Assay', 'Ensemble'):
        return "a practice's persona"
    return 'a workflow or bot'


UNREAD = set()


def diff(repo, h, paths=None):
    """One commit against its first parent: removed texts (Counter per old path), removed line numbers (per old path),
    added texts (Counter per new path), renames. A path whose blob the clone lacks is tried alone and, failing, unread."""
    ps = parents(repo, h)
    if ps is None:
        return None
    base = ps[0] if ps else EMPTY

    def run(sel):
        args = ['diff', '-U0', '--no-color', '--no-ext-diff', '--text', '-M', base, h]
        if sel:
            args += ['--', *sel]
        return git(repo, *args)

    code, out = run(paths)
    if code != 0:
        parts = []
        sel = paths or [p for p in git(repo, 'diff', '--name-only', '--no-renames', base, h)[1].split('\n') if p]
        for p in sel:
            c, o = run([p])
            if c == 0:
                parts.append(o)
            else:
                UNREAD.add((repo, p))
        out = '\n'.join(parts)
    rem, remn, add, ren = defaultdict(Counter), defaultdict(list), defaultdict(Counter), []
    old = new = None
    rf, hunk, o_at = None, False, 0
    for ln in out.split('\n'):
        if ln.startswith('diff --git '):
            old = new = None
            hunk = False
        elif not hunk and ln.startswith('rename from '):
            rf = ln[12:]
        elif not hunk and ln.startswith('rename to '):
            ren.append((rf, ln[10:]))
        elif not hunk and ln.startswith('--- '):
            v = ln[4:]
            old = None if v == '/dev/null' else v[2:] if v.startswith('a/') else v
        elif not hunk and ln.startswith('+++ '):
            v = ln[4:]
            new = None if v == '/dev/null' else v[2:] if v.startswith('b/') else v
        elif ln.startswith('@@'):
            m = HUNK.match(ln)
            o_at = int(m.group(1)) if m else 0
            hunk = True
        elif ln.startswith('+') and new:
            s = ln[1:].strip()
            if keep(s):
                add[new][s] += 1
        elif ln.startswith('-') and old:
            s = ln[1:].strip()
            if keep(s):
                rem[old][s] += 1
                remn[old].append(o_at)
            o_at += 1
    for p in NOT_JOINED:
        for d in (rem, remn, add):
            d.pop(p, None)
    return {'rem': rem, 'remn': remn, 'add': add, 'ren': ren, 'base': base}


def blame_origins(repo, m, d):
    """Whose lines the mending took out: blame at its first parent of every removed line this work's rule keeps."""
    org = Counter()
    for path, nums in d['remn'].items():
        if not nums:
            continue
        rng, a = [], None
        for n in sorted(set(nums)):
            if a is None:
                a = b = n
            elif n == b + 1:
                b = n
            else:
                rng.append((a, b)); a = b = n
        rng.append((a, b))
        args = ['blame', '-l', '-s', '--no-progress']
        for a, b in rng:
            args += ['-L', f'{a},{b}']
        args += [d['base'], '--', path]
        code, out = git(repo, *args)
        if code != 0:
            UNREAD.add((repo, path))
            continue
        for ln in out.split('\n'):
            if ln.strip():
                org[ln.split()[0].lstrip('^')] += 1
    return org


# ———————————————————————————————————————— 1. what state 4 and the Field's reading 89 hold
S4 = json.load(open(os.path.join(HERE, 'data', 'sort.json')))
A4 = S4['act']
ok(A4['join'] == {'lines': 52, 'log': 6, 'same': 7, 'file': 11, 'name': 1}, f'state 4\'s joins: {A4["join"]}')
credit = field(F88, 'credit88.json')
CR = {(c['row'], c['deed']): c for c in credit['deeds']}
j89 = field(F89, 'join89.json')
h89 = field(F89, 'heirs89.json')
a89 = field(F89, 'agree89.json')
R = j89['results']['all']
ok(R['pairs'] == 77 and R['class_joined'] == 60 and R['lines'] == 53 and R['same_commit'] == 7 and R['file'] == 11
   and R['log_only'] == 6, 'the Field\'s reading 89: 60 of 77 joined (7 the same commit, 53 by lines), 11 a file, 6 nothing')
ok(R['git_points'] == 15 and R['points_decided'] == 53, 'the Field: from the deed forward, the mending comes first in 15 of 53')
H = h89['results']
ok(H['pairs'] == 38 and H['median_hours'] == 1.0 and H['signers'] == {"the architect's name": 30, 'a workflow or bot': 8}
   and H['heir_is_a_mending'] == 7, 'the Field: for 38 another commit first, a median 1.0 hour after, 30 under the architect\'s name')
ok(R['git_points'] + R['same_commit'] + 1 == 23, 'the Field\'s 23 of 77: 15 first by lines, 7 the deed\'s own commit, 1 naming its hash')
FC = {'same_commit': 'same', 'lines': 'lines', 'name': 'name', 'file': 'file', 'log_only': 'log'}
diffcode = [(f'{p["row"]}|{p["deed"]}', FC[p['code']], d['join']) for p in j89['pairs'] for d in A4['deeds']
            if (d['row'], d['n']) == (p['row'], p['deed']) and FC[p['code']] != d['join']]
ok(diffcode == [('180|2', 'lines', 'name')] and a89['results']['code_table'].get('lines|name') == 1,
   f'the one pair coded otherwise: {diffcode} (state 4 ranks a mending that names its deed before its lines)')
F89P = {(p['row'], p['deed']): p for p in j89['pairs']}
HEIR = {(r['row'], r['deed']): r for r in h89['heirs']}
mendings = {(c['repair_repo'], c['repair_hash']) for c in credit['deeds'] if c.get('repair_found')}

# ———————————————————————————————————————— 2. both ends, for every pair whose mending is apart from the deed in its repository
# Forward, a line is counted by its copies in the file: a commit "wrote" a text where the file holds more copies of it
# after the commit than before, and "took it out" where it holds fewer. A line moved within its file is neither.
NULL = '0' * 40


class Blobs:
    def __init__(self):
        self.p = {}

    def read(self, repo, oid):
        if oid == NULL:
            return ''
        if repo not in self.p:
            self.p[repo] = subprocess.Popen(['git', '--git-dir', os.path.join(CLONES, repo + '.git'), 'cat-file', '--batch'],
                                            stdin=subprocess.PIPE, stdout=subprocess.PIPE, env=ENV)
        pr = self.p[repo]
        try:
            pr.stdin.write((oid + '\n').encode()); pr.stdin.flush()
            hdr = pr.stdout.readline().decode()
        except BrokenPipeError:
            hdr = ''
        if not hdr:   # a blob the clone lacks (over 2 MB): cat-file stops rather than fetch it; start it again
            del self.p[repo]
            return None
        if hdr.strip().endswith('missing'):
            return None
        size = int(hdr.split()[2])
        data = pr.stdout.read(size); pr.stdout.read(1)
        return data.decode('utf-8', 'replace')


BL = Blobs()


def copies(text):
    return Counter(s for s in (ln.strip() for ln in text.split('\n')) if keep(s))


def raw(repo, h, paths=None):
    """(old path, new path, old blob, new blob, status) for one commit against its first parent."""
    ps = parents(repo, h)
    base = ps[0] if ps else EMPTY
    args = ['diff', '--raw', '--no-abbrev', '-z', '-M', base, h]
    if paths:
        args += ['--', *paths]
    code, out = git(repo, *args)
    if code != 0:   # rename detection needs a blob the clone lacks: read the tree without it
        args.remove('-M')
        code, out = git(repo, *args)
        UNREAD.add((repo, 'renames in ' + h[:12]))
    f = out.split('\0')
    res, i = [], 0
    while i < len(f) - 1:
        meta = f[i].lstrip(':').split()
        if len(meta) < 5:
            i += 1
            continue
        st = meta[4]
        if st[0] in 'RC':
            res.append((f[i + 1], f[i + 2], meta[2], meta[3], st[0])); i += 3
        else:
            res.append((f[i + 1], f[i + 1], meta[2], meta[3], st[0])); i += 2
    return [r for r in res if r[0] not in NOT_JOINED and r[1] not in NOT_JOINED]


def change(repo, entry):
    """Texts whose copies rose (written) and fell (taken out) in one changed path; None if a blob is missing."""
    o, n = BL.read(repo, entry[2]), BL.read(repo, entry[3])
    if o is None or n is None:
        UNREAD.add((repo, entry[0] if o is None else entry[1]))
        return None
    co, cn = copies(o), copies(n)
    return cn - co, co - cn


rows = []
for d in A4['deeds']:
    if d['join'] not in ('lines', 'name'):
        continue
    c = CR[(d['row'], d['n'])]
    repo, m = c['repair_repo'], c['repair_hash']
    deed = [x for x in c['deed_commits'] if x['repo'] == repo]
    dh = {x['hash'] for x in deed}
    surv = defaultdict(Counter)
    for x in sorted(deed, key=lambda x: x['time']):
        for e in raw(repo, x['hash']):
            ch = change(repo, e)
            if ch:
                if e[0] in surv and e[0] != e[1]:
                    surv[e[1]].update(+surv.pop(e[0]))
                surv[e[1]].update(ch[0])
    paths = sorted(p for p, v in surv.items() if +v)
    start = sum(sum(v.values()) for v in surv.values())
    latest = max(deed, key=lambda x: x['time'])['hash']
    deed_t = max(int(datetime.fromisoformat(x['time']).timestamp()) for x in deed)
    mp = parents(repo, m)[0]
    anc = subprocess.run(['git', '--git-dir', os.path.join(CLONES, repo + '.git'), 'merge-base', '--is-ancestor', latest, mp],
                         env=ENV).returncode == 0

    def take(h):
        hit = 0
        live = sorted(p for p, v in surv.items() if +v)
        if not live:
            return 0
        for e in raw(repo, h, live):
            if e[0] not in surv:
                continue
            ch = change(repo, e)
            if ch:
                for t, k in ch[1].items():
                    q = min(k, surv[e[0]][t])
                    if q:
                        surv[e[0]][t] -= q
                        hit += q
            if e[4] == 'R' and e[0] in surv:
                surv[e[1]].update(+surv.pop(e[0]))
        return hit

    hands, cands = [], None
    if anc and paths:
        revs = git(repo, 'rev-list', '--no-merges', '--reverse', '--topo-order', f'{latest}..{mp}', '--', *paths)[1].split()
        cands = [h for h in revs if h not in dh]
        for h in cands:
            hit = take(h)
            if hit:
                t = ctime(repo, h)
                hands.append({'h': h[:12], 'day': datetime.fromtimestamp(t, timezone.utc).strftime('%Y-%m-%d'),
                              'hours': round((t - deed_t) / 3600, 1), 'signer': signer(author(repo, h)), 'lines': hit,
                              'mends_another': (repo, h) in mendings})
    left = sum(x for v in surv.values() for x in v.values() if x > 0)
    m_surv = take(m)
    md = diff(repo, m)
    org = blame_origins(repo, m, md)
    mine = lambda h: any(h.startswith(x) or x.startswith(h) for x in dh)
    deed_lines = sum(v for h, v in org.items() if mine(h))
    others = {h: v for h, v in org.items() if not mine(h)}
    rank = 1 + sum(v > deed_lines for v in others.values())
    top = max(others.items(), key=lambda kv: kv[1], default=None)
    rows.append({'row': d['row'], 'n': d['n'], 'repo': repo, 'join': d['join'], 'deed_wrote': start,
                 'left_at_mending': left, 'candidates': len(cands) if cands is not None else None, 'hands': hands,
                 'mending_takes': m_surv,
                 'back': {'writers': len(others) + (1 if deed_lines else 0), 'lines': sum(org.values()),
                          'deed': deed_lines, 'deed_rank': rank if deed_lines else None,
                          'top_other': [top[0][:12], top[1]] if top else None}})
    print(d['row'], d['n'], repo, d['join'], 'cands', rows[-1]['candidates'], 'hands', len(hands), 'left', left,
          'mending takes', m_surv, 'writers', rows[-1]['back']['writers'], 'deed', deed_lines, 'of', sum(org.values()),
          'rank', rank, flush=True)

# ———————————————————————————————————————— 3. figures, and the Field's read again
L = [r for r in rows if r['join'] == 'lines']
ok(len(rows) == 53 and len(L) == 52, f'pairs read from both ends: {len(rows)} ({len(L)} joined by lines, 1 naming its deed)')
first = [r for r in L if not r['hands']]
agree_first, disagree = 0, []
for r in rows:
    f = F89P[(r['row'], r['n'])]
    if f['code'] != 'lines':
        continue
    mine = r['hands'][0]['h'] if r['hands'] else None
    theirs = f['heirs_before_hashes'][0][:12] if f['heirs_before_hashes'] else None
    if mine == theirs:
        agree_first += 1
    else:
        disagree.append([r['row'], r['n'], mine, theirs])
nh = [len(r['hands']) for r in L]
res = {
    'pairs': len(rows), 'lines': len(L),
    'first': len(first),
    'hands_median': statistics.median(nh), 'hands_max': max(nh), 'hands_total': sum(nh),
    'hands_median_any': statistics.median([k for k in nh if k]) if any(nh) else 0,
    'hands_dist': dict(sorted(Counter(min(k, 5) for k in nh).items())),
    'two_or_more': sum(k >= 2 for k in nh),
    'hand_signers': dict(Counter(h['signer'] for r in L for h in r['hands'])),
    'sig_arch': sum(h['signer'] == "the architect's name" for r in L for h in r['hands']),
    'sig_bot': sum(h['signer'] == 'a workflow or bot' for r in L for h in r['hands']),
    'hands_mending_another': sum(h['mends_another'] for r in L for h in r['hands']),
    'first_hand_hours_median': statistics.median([r['hands'][0]['hours'] for r in L if r['hands']]) if len(first) < len(L) else None,
    'field_agree_first': agree_first, 'field_disagree': disagree,
    'mending_takes_nothing_left': sum(r['mending_takes'] == 0 for r in L),
    'back_writers_median': statistics.median([r['back']['writers'] for r in L]),
    'back_one_writer': sum(r['back']['writers'] == 1 for r in L),
    'back_deed_most': sum(r['back']['deed_rank'] == 1 for r in L),
    'back_deed_absent': sum(r['back']['deed'] == 0 for r in L),
    'lead_all': len(first) + A4['join']['same'] + A4['join']['name'],
    'self': A4['join']['same'] + A4['join']['name'], 'later': len(L) - len(first),
    'unread': sorted({f'{a}:{b}' for a, b in UNREAD}),
}
ok(res['first'] == 18 and res['lead_all'] == 26 and res['hands_total'] == 235 and res['back_deed_most'] == 35
   and res['field_agree_first'] == 43 and not res['unread'],
   f"from the deed's end the mending is the first hand in {res['first']} of {res['lines']}; Git leads to {res['lead_all']} of 77; "
   f"{res['hands_total']} hands before; from the mending's end the deed wrote the most in {res['back_deed_most']}; "
   f"first hands named alike with the Field in {res['field_agree_first']} of 53; nothing unread")
print(json.dumps({k: v for k, v in res.items() if k != 'field_disagree'}, indent=1))
print('disagree with the Field on the first hand:', disagree)
out = {'field': {'credit': F88, 'reading89': F89}, 'results': res, 'pairs': rows}
json.dump(out, open(os.path.join(HERE, 'data', 'both.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'data', 'both.js'), 'w').write('window.BOTH=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('FAILS:', fails if fails else 'none')
sys.exit(1 if fails else 0)
