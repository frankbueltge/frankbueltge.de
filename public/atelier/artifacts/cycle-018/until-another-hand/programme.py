#!/usr/bin/env python3
"""Until Another Hand, state 2 (2026-11-22): the programme's own answers, followed through the house.

State 1 read "in time" as a window: a deed is answered in time while one revert could still undo it without undoing
anyone else's work (Prakash and Knister, CSCW 1992). This build turns the same test on the programme itself. The
programme's state (research-ecology, programme/STATE.md) records corrections: a figure or a sentence that stood in a
practice's work, found wrong, and replaced. A correction is a deed's answer. It is in time, in the sense of state 1,
while the wrong wording stands in one work only, so that one change answers it. Once another work has taken the
wording over, the correction answers only the copy it is made in.

The cases (cases.json) are every correction STATE.md records of a claim that stood in a work, where the old wording
can be found by a phrase the corrected wording does not hold. Each case carries that phrase (`key`) and a phrase the
correction writes (`marker`), both regular expressions, and the passage of STATE.md that records it. The cases that
could not be keyed are listed there too, with the reason.

For every case this build finds, in the full histories of the four repositories where the programme's works and state
are written (ulysses, studio, field-research, research-ecology):

  the first appearance: the earliest commit whose file in a work (or in the state) holds the key;
  the works that took it over: every other work, with the first commit at which one of its files held the key;
  the correction: the earliest commit at or after the first appearance whose file, in a work that held the key or in
    the state, holds the marker;
  today: for every work, whether a page a visitor meets (index.html, SUMMARY.md, paper.md, meta.json) still holds
    the key without the marker; and the same for the site's served copies of those pages (frankbueltge.de at HEAD,
    public/ and src/content/, and the programme's state mirrored under src/data/middle/).

A work is one practice's work of one cycle: its working folder and its presentation count as one (the Studio's
works/<slug> are mapped to their cycle by their meta.json). The step critiques are their own units. Records (journals,
bulletins, chronicles, the relay, predictions written before a count, process entries that are never rewritten) are
not works: an old wording in a record is the record of what was said, not a claim standing now.

The test is textual, as Git's is in state 1: an occurrence of the old wording counts as reached by the correction when
the marker stands within 600 characters of it, whatever the sentence says; a page can repeat a corrected claim in words
the key does not match. Every page that holds the old wording unreached today is read by this session and sorted in
cases.json: it asserts the claim; it quotes it (as another's, as a prediction written before the count, or to
criticise it); or it corrects it later on the same page, further than 600 characters on (a card that tells its states in
order). The site's served copies take the reading of the page they mirror.

Run from this folder:  python3 programme.py <dir of full bare clones named <repo>.git>
Writes data/programme.json and data/programme.js. Nothing here asks a model; no reader codes anything.
"""
import json, os, re, statistics, subprocess, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CLONES = sys.argv[1]
SINCE = '2026-11-08'            # the programme's start (cycle.json, programme.started)
PRACTICE = {'ulysses': 'atelier', 'studio': 'studio', 'field-research': 'field', 'research-ecology': 'middle'}
SURFACE = {'index.html', 'SUMMARY.md', 'paper.md', 'meta.json'}
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def git(repo, *a):
    p = subprocess.run(['git', '--git-dir', os.path.join(CLONES, repo + '.git'), *a], capture_output=True)
    return p.returncode, p.stdout.decode('utf-8', 'replace')


def iso(t):
    return datetime.fromtimestamp(t, timezone.utc).strftime('%Y-%m-%dT%H:%MZ')


STUDIO_CYCLE = {}


def studio_cycle(slug):
    if slug not in STUDIO_CYCLE:
        rc, out = git('studio', 'show', f'HEAD:works/{slug}/meta.json')
        STUDIO_CYCLE[slug] = json.loads(out).get('cycle') if rc == 0 else None
    return STUDIO_CYCLE[slug]


def unit(repo, path):
    """The work a file belongs to, or None for a record."""
    m = re.match(r'(artifacts|presentations)/cycle-(\d+)/(.*)$', path)
    if repo in ('ulysses', 'field-research') and m:
        cyc, rest = int(m.group(2)), m.group(3)
        if repo == 'ulysses' and re.match(r'step-\d+-critique\.md$', rest):
            return f'atelier:critique:{cyc}'
        if repo == 'field-research' and m.group(1) == 'presentations' and rest.startswith('critique'):
            return None
        return f'{PRACTICE[repo]}:work:{cyc}'
    if repo == 'studio':
        m = re.match(r'presentations/cycle-(\d+)/', path)
        if m:
            return f'studio:work:{int(m.group(1))}'
        m = re.match(r'works/([^/]+)/', path)
        if m and studio_cycle(m.group(1)):
            return f'studio:work:{studio_cycle(m.group(1))}'
        return None
    if repo == 'research-ecology' and path == 'programme/STATE.md':
        return 'middle:state:0'
    return None


RECORD_NAMES = {'PROCESS.json', 'CRITIQUE.md', 'SCORE.md'}
RECORD_RE = re.compile(r'(PREDICTIONS|CODEBOOK)\w*\.md$|journal/')


def is_record_file(path):
    return os.path.basename(path) in RECORD_NAMES or bool(RECORD_RE.search(path))


def holds(repo, rev, path, rx):
    rc, out = git(repo, 'grep', '-I', '-c', '-P', rx, rev, '--', path)
    return rc == 0 and out.strip() != ''


def history(repo, rx):
    """(time, commit, author, path) for every commit since SINCE on HEAD's line whose file holds rx after it."""
    rc, out = git(repo, 'log', 'HEAD', f'--since={SINCE}', '-P', f'-G{rx}', '--format=@%H|%ct|%an', '--name-only')
    rows, cur = [], None
    for line in out.splitlines():
        if line.startswith('@'):
            h, t, an = line[1:].split('|', 2)
            cur = (int(t), h, an)
        elif line.strip() and cur:
            if holds(repo, cur[1], line.strip(), rx):
                rows.append((cur[0], cur[1], cur[2], line.strip()))
    return rows


def site_mirror(path):
    """frankbueltge.de paths that serve a practice's or the programme's page."""
    if path == 'src/data/middle/programme/STATE.md':
        return True
    if re.match(r'public/(atelier|studio|field)/', path) or re.match(r'src/content/(atelier|studio|field)/works/', path):
        return os.path.basename(path) in SURFACE and '/journal/' not in path and '/window/' not in path
    return False


NEAR = 600      # characters: a correction counts for an occurrence of the old wording only within this distance


def near(repo, rev, path, key, marker):
    """True when every occurrence of the old wording in the file has the correction's marker within NEAR characters."""
    rc, out = git(repo, 'show', f'{rev}:{path}')
    occ = [m for m in re.finditer(key, out)]
    return bool(occ) and all(re.search(marker, out[max(0, m.start() - NEAR):m.end() + NEAR]) for m in occ)


def source_of(f):
    """The practice page a served copy mirrors, as repo:path."""
    for pre, rp in (('public/atelier/', 'ulysses:'), ('public/field/', 'field-research:'),
                    ('public/studio/presentations/', 'studio:presentations/')):
        if f.startswith(pre):
            return rp + f[len(pre):]
    m = re.match(r'(public/studio/werke-html|src/content/studio/works)/(.+)$', f)
    if m:
        return 'studio:works/' + m.group(2)
    if f == 'src/data/middle/programme/STATE.md':
        return 'research-ecology:programme/STATE.md'
    return None


cases = json.load(open(os.path.join(HERE, 'cases.json')))


def is_page(repo, path):
    """A page a visitor meets: a work's or presentation's page, summary, paper or card, a step critique, the state."""
    if repo == 'research-ecology':
        return path == 'programme/STATE.md'
    if repo == 'ulysses' and re.match(r'artifacts/cycle-\d+/step-\d+-critique\.md$', path):
        return True
    return os.path.basename(path) in SURFACE and unit(repo, path) is not None


def first_line(repo, commit, path, rx):
    rc, out = git(repo, 'show', f'{commit}:{path}')
    m = re.search(rx, out)
    if not m:
        return None
    a, b = max(0, m.start() - 150), min(len(out), m.end() + 110)
    return re.sub(r'<[^>]+>', '', re.sub(r'\s+', ' ', out[a:b])).strip()


def ctime(repo, commit):
    return int(git(repo, 'show', '-s', '--format=%ct', commit)[1].strip())


out_cases = []
for c in cases['cases']:
    key, marker = c['key'], c['marker']
    o, k = c['origin'], c['correction']
    okey = o.get('key', key)
    ok(holds(o['repo'], o['commit'], o['path'], okey), f"{c['id']}: the origin {o['repo']} {o['commit']} {o['path']} holds the old wording")
    ok(holds(k['repo'], k['commit'], k['path'], marker), f"{c['id']}: the correction {k['repo']} {k['commit']} {k['path']} holds the marker")
    ok(not holds(k['repo'], k['commit'] + '^', k['path'], marker), f"{c['id']}: the marker is new in that commit")
    t0, tc = ctime(o['repo'], o['commit']), ctime(k['repo'], k['commit'])
    ok(tc >= t0, f"{c['id']}: the correction does not come before the origin")
    origin_u = unit(o['repo'], o['path'])
    seen = {}       # unit -> earliest (time, commit, author, repo, path) on a page
    for repo in PRACTICE:
        for (t, h, an, p) in history(repo, key):
            if not is_page(repo, p):
                continue
            u = unit(repo, p) or ('atelier:critique:0' if 'critique' in p else 'middle:state:0')
            u = unit(repo, p) if unit(repo, p) else u
            if u == origin_u:
                continue
            if u not in seen or t < seen[u][0]:
                seen[u] = (t, h, an, repo, p)
    copies = []
    for u, (t, h, an, repo, p) in sorted(seen.items(), key=lambda kv: kv[1][0]):
        copies.append({'unit': u, 'first': iso(t), 'first_t': t, 'commit': h[:7], 'repo': repo, 'path': p,
                       'before_correction': t < tc, 'line': first_line(repo, h, p, key)})
    # today: every page in the house that holds the old wording
    today = []
    for repo in PRACTICE:
        rc, out = git(repo, 'grep', '-I', '-l', '-P', key, 'HEAD')
        for f in out.split():
            f = f[5:]
            if not is_page(repo, f):
                continue
            marked = near(repo, 'HEAD', f, key, marker)
            reading = c.get('readings', {}).get(f'{repo}:{f}')
            if not marked:
                ok(reading in ('asserts', 'quotes', 'later'), f"{c['id']}: an unmarked page today has a reading: {repo}:{f}")
            today.append({'repo': repo, 'path': f, 'unit': unit(repo, f) or 'middle:state:0', 'marked': marked,
                          'reading': 'corrected' if marked else reading, 'line': first_line(repo, 'HEAD', f, key)})
    rc, files = git('frankbueltge.de', 'ls-tree', '-r', '--name-only', 'HEAD')
    served = []
    for f in files.splitlines():
        if site_mirror(f) and holds('frankbueltge.de', 'HEAD', f, key):
            src = source_of(f)
            marked = near('frankbueltge.de', 'HEAD', f, key, marker)
            reading = 'corrected' if marked else c.get('readings', {}).get(src)
            if not marked and src and any(f'{x["repo"]}:{x["path"]}' == src and x['marked'] for x in today):
                reading = 'lags'    # the practice's page is corrected; the site's copy is not yet
            ok(reading is not None, f"{c['id']}: a served copy has a reading: {f}")
            served.append({'path': f, 'source': src, 'marked': marked, 'reading': reading})
    first_copy = min((x['first_t'] for x in copies), default=None)
    out_cases.append({
        'id': c['id'], 'step': c['step'], 'claim': c['claim'], 'old': c['old'], 'new': c['new'],
        'state_passage': c['state_passage'], 'key': key, 'marker': marker, 'kind': c['kind'],
        'first': iso(t0), 'first_t': t0, 'origin': origin_u, 'origin_commit': o['commit'][:7],
        'origin_repo': o['repo'], 'origin_path': o['path'], 'origin_line': first_line(o['repo'], o['commit'], o['path'], okey),
        'correction': iso(tc), 'correction_t': tc, 'correction_commit': k['commit'][:7],
        'correction_repo': k['repo'], 'correction_path': k['path'], 'correction_unit': unit(k['repo'], k['path']) or 'middle:state:0',
        'correction_line': first_line(k['repo'], k['commit'], k['path'], marker),
        'window_closed': iso(first_copy) if first_copy else None, 'window_closed_t': first_copy,
        'in_time': first_copy is None or tc <= first_copy,
        'copies': copies,
        'copies_before': sum(1 for x in copies if x['before_correction']),
        'copies_after': sum(1 for x in copies if not x['before_correction']),
        'today': today,
        'asserting_today': sum(1 for x in today if x['reading'] == 'asserts'),
        'served': served,
        'served_asserting': sum(1 for x in served if x['reading'] == 'asserts'),
        'served_lagging': sum(1 for x in served if x['reading'] == 'lags'),
    })

heads = {r: git(r, 'rev-parse', 'HEAD')[1].strip() for r in list(PRACTICE) + ['frankbueltge.de']}
n = len(out_cases)
copied = [c for c in out_cases if c['window_closed_t']]
summary = {
    'cases': n,
    'excluded': len(cases['excluded']),
    'in_time': sum(1 for c in out_cases if c['in_time']),
    'late': sum(1 for c in out_cases if not c['in_time']),
    'copies_before': sum(c['copies_before'] for c in out_cases),
    'copies_after': sum(c['copies_after'] for c in out_cases),
    'window_closed_median_h': round(statistics.median([(c['window_closed_t'] - c['first_t']) / 3600 for c in copied if not c['in_time']]), 1),
    'correction_median_h': round(statistics.median([(c['correction_t'] - c['first_t']) / 3600 for c in out_cases]), 1),
    # a page that asserts two cases is one page: counted once
    'pages_asserting_today': len({(x['repo'], x['path']) for c in out_cases for x in c['today'] if x['reading'] == 'asserts'}),
    'assertions_today': sum(c['asserting_today'] for c in out_cases),
    'cases_asserting_today': sum(1 for c in out_cases if c['asserting_today']),
    'served_asserting': len({x['path'] for c in out_cases for x in c['served'] if x['reading'] == 'asserts'}),
    'served_lagging': len({x['path'] for c in out_cases for x in c['served'] if x['reading'] == 'lags'}),
    'own_pages_corrected_today': sum(1 for c in out_cases for x in c['today'] if x['repo'] == 'ulysses' and x['marked']
                                     and 'cycle-013' in x['path']),
    'late_in_state': sum(1 for c in out_cases if not c['in_time'] and c['correction_unit'] == 'middle:state:0'),
}
for c in out_cases:
    print(f"     {c['id']}: first {c['first']} {c['origin']}; corrected {c['correction']} in {c['correction_unit']}; "
          f"{'in time' if c['in_time'] else 'late: window closed ' + str(c['window_closed'])}; copies before "
          f"{c['copies_before']}, after {c['copies_after']}; pages asserting today {c['asserting_today']}; served "
          f"asserting {c['served_asserting']}")
    for x in c['today']:
        print(f"        today {x['reading']}: {x['repo']}:{x['path']} :: {(x['line'] or '')[:230]}")
print('summary', json.dumps(summary))
summary['own_correction'] = iso(ctime('ulysses', heads['ulysses'])) if summary['own_pages_corrected_today'] else None
summary['own_correction_t'] = ctime('ulysses', heads['ulysses']) if summary['own_pages_corrected_today'] else None
summary['own_correction_commit'] = heads['ulysses'][:7]
res = {'built': datetime.now(timezone.utc).strftime('%Y-%m-%d'), 'heads': heads, 'since': SINCE,
       'surfaces': sorted(SURFACE), 'summary': summary, 'cases': out_cases, 'excluded': cases['excluded'],
       'not_cases': cases.get('not_cases', [])}
json.dump(res, open(os.path.join(HERE, 'data', 'programme.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'data', 'programme.js'), 'w').write('window.PROG=' + json.dumps(res, ensure_ascii=False) + ';\n')
print(f'{len(fails)} failures')
sys.exit(1 if fails else 0)
