#!/usr/bin/env python3
"""On Its Own Account: build the work's data from this repository's own history and assert every figure.

Run from this folder:  python3 build.py            (needs git, node, network for the pinned outside files)
                       python3 build.py --offline  (skips the outside files and the reach-outside text)

Writes data/texts.json (every committed version of STATE-OF-THE-FIELD.md), data/digest.json (counts, self-reports,
sightings, runs over the cap, figures), data/deeds.json (three deeds, every check run) and checks sources.json.
Nothing here asks a model. Every number on the page comes from these files; check_page.mjs reads it back.
"""
import difflib, hashlib, json, os, re, subprocess, sys, tempfile, urllib.request
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(['git', '-C', HERE, 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip()
OFFLINE = '--offline' in sys.argv
CAP = 2500
DECLARED = '63a84ebd8f16dca2997346edebbe72ef939676be'   # 2026-09-19: the counting rule declared at the head of the digest
DIGEST = 'STATE-OF-THE-FIELD.md'
UPTO = 'd0e7a5178a4f2cf3785b690dc88f447f51f10f4a'      # main as the session of 2026-11-19 that made state 1 found it
RAW = {'frankbueltge.de': 'https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/{c}/{f}',
       'field-research': 'https://raw.githubusercontent.com/frankbueltge/field-research/{c}/{f}'}
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def git(*a):
    r = subprocess.run(['git', '-C', REPO, *a], capture_output=True, text=True)
    return r.stdout


def full(h):
    return git('rev-parse', h).strip()


def flat(t):
    return re.sub(r'\s+', ' ', t)


_cache = {}


def fetch(url):
    if url not in _cache:
        with urllib.request.urlopen(url, timeout=60) as r:
            _cache[url] = r.read()
    return _cache[url]


def read(repo, commit, file):
    if repo == 'ulysses':
        if file == '@message':
            return git('show', '-s', '--format=%B', commit)
        return git('show', f'{commit}:{file}')
    if OFFLINE:
        return None
    return fetch(RAW[repo].format(c=commit, f=file)).decode('utf-8')


def quote_in(repo, commit, file, quote, label):
    t = read(repo, commit, file)
    if t is None:
        print(f'skip {label} (offline)')
        return
    ok(flat(quote) in flat(t), f'{label}: quote found in {repo}:{commit[:7]}:{file}')


# ———————————————————————————————————————————— 1. every version of the digest, counted by the declared rule
log = [l.split(' ', 2) for l in git('log', '--reverse', '--format=%H %aI %an', UPTO, '--', DIGEST).strip().split('\n')]
texts = {}
for H, d, a in log:
    texts[H[:7]] = git('show', f'{H}:{DIGEST}')
with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as tf:
    json.dump(texts, tf)
out = json.loads(subprocess.run(['node', os.path.join(HERE, 'count.mjs'), tf.name], capture_output=True, text=True).stdout)
os.unlink(tf.name)
order = [H for H, _, _ in log]
i_decl = order.index(DECLARED)
versions = []
for i, (H, d, a) in enumerate(log):
    h = H[:7]
    n = out['counts'][h]
    versions.append({'i': i, 'h': h, 'H': H, 'date': datetime.fromisoformat(d).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M'),
                     'author': a, 'n': n, 'ws': len(texts[h].split()), 'after': i >= i_decl, 'over': n > CAP})
V = {v['h']: v for v in versions}
ok(len(versions) == len(texts) and len(set(texts)) == len(versions), f'{len(versions)} versions of the digest, short hashes unique')
ok(V[DECLARED[:7]]['n'] <= CAP, f'the declaring version itself counts {V[DECLARED[:7]]["n"]}, inside its cap')

# ———————————————————————————————————————————— 1b. the same call inside a browser engine
with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as tf:
    json.dump(texts, tf)
br = subprocess.run(['node', os.path.join(HERE, 'count_browser.mjs'), tf.name], capture_output=True, text=True)
os.unlink(tf.name)
ok(br.returncode == 0, 'the declared call ran in a browser engine' + ('' if br.returncode == 0 else ': ' + br.stderr.strip()[-200:]))
BR = json.loads(br.stdout)
for v in versions:
    v['nb'] = BR['counts'][v['h']]
ok(all(v['nb'] >= v['n'] for v in versions), f'{BR["browser"]} never counts fewer words than this runtime')
# every word the two split differently is joined by a full stop or a colon between letters (UAX #29, WB6 and WB7)
JOINT = re.compile(r'^\w+([.:]\w+)+$')
ok(BR['split'] and all(JOINT.match(t) for t, _ in BR['split']), f'all {len(BR["split"])} words the browser splits are joined by "." or ":" between letters: ' + ', '.join(t for t, _ in BR['split'][:6]))
extra = sum(times * (t.count('.') + t.count(':')) for t, times in BR['split'])
ok(sum(v['nb'] - v['n'] for v in versions) == extra, f'the browser\'s extra words ({extra}) are exactly those joints, split')

# ———————————————————————————————————————————— 2. what the sessions said of their own count
R = json.load(open(os.path.join(HERE, 'reports.json')))
reports = []
for r in R['reports']:
    c = full(r['commit'])
    quote_in('ulysses', c, r['file'], r['quote'], r['id'])
    if r['kind'] == 'end':
        about = git('log', '-1', '--format=%H', c, '--', DIGEST).strip()[:7]
    else:
        about = r['about']
    v = V[about]
    says = r.get('says') or ('over' if r['figure'] > CAP else 'under')
    rule = 'over' if v['n'] > CAP else 'under'
    reports.append({**r, 'commit': c[:7], 'C': c, 'about': about, 'n': v['n'], 'says': says, 'rule': rule,
                    'agree': says == rule, 'exact': r['figure'] == v['n'],
                    'date': datetime.fromisoformat(git('show', '-s', '--format=%aI', c).strip()).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M')})
    ok(v['after'] or r['kind'] == 'open', f'{r["id"]} speaks of a version after the declaration')
# the six sightings at open that give a figure by the declared rule must match this build's count exactly
for r in reports:
    if r['kind'] == 'open' and r['method'] == 'declared' and r['figure']:
        ok(r['exact'], f'{r["id"]}: the session at open counted {r["figure"]}, this build counts {r["n"]} for {r["about"]}')

# ———————————————————————————————————————————— 3. runs over the cap since the declaration, and who saw them
after = [v for v in versions if v['after']]
runs, cur = [], None
for v in after:
    if v['over']:
        if cur is None:
            cur = {'versions': []}
            runs.append(cur)
        cur['versions'].append(v['h'])
    else:
        cur = None
for k, run in enumerate(runs, 1):
    run['k'] = k
    vs = [V[h] for h in run['versions']]
    run['max'] = max(v['n'] for v in vs)
    run['from'], run['to'] = vs[0]['date'], vs[-1]['date']
    nxt = versions[vs[-1]['i'] + 1] if vs[-1]['i'] + 1 < len(versions) else None
    run['back_under'] = nxt['h'] if nxt else None
    run['back_date'] = nxt['date'] if nxt else None
    seen = [r for r in reports if r['kind'] == 'open' and r['about'] in run['versions']]
    saw = [r for r in seen if r['says'] == 'over']
    missed = [r for r in seen if r['says'] == 'under']
    run['seen_by'] = [{'id': r['id'], 'commit': r['commit'], 'date': r['date'], 'quote': r['quote'], 'file': r['file']} for r in saw]
    run['missed_by'] = [{'id': r['id'], 'commit': r['commit'], 'date': r['date'], 'quote': r['quote'], 'file': r['file']} for r in missed]
    run['outside'] = [o['id'] for o in R['outside'] if o['about'] in run['versions']]
    run['status'] = 'seen' if saw else ('missed' if missed else 'unseen')
    # a seen run is seen by the session that brought it back under
    if saw:
        ok(saw[0]['commit'] == run['back_under'] or saw[0]['date'] >= run['to'], f'run {k}: first sighting comes after the run')

# ———————————————————————————————————————————— 4. the outside sighting: the Field's census
outside = []
for o in R['outside']:
    if OFFLINE:
        print('skip outside sighting (offline)')
        continue
    items = json.loads(fetch(o['url']))
    hit = [i for i in items if i['rule'] == o['rule'] and i['practice'] == 'atelier' and i['commit'].startswith(o['about'])]
    ok(len(hit) == 1 and hit[0]['breach'] is True, f'{o["id"]}: the census marks {o["about"]} over the cap')
    br = [i for i in items if i['rule'] == o['rule'] and i['practice'] == 'atelier' and i['breach']]
    ok(len(br) == 1, f'{o["id"]}: it is the only version of this practice\'s digest the census marks over ({len(br)})')
    outside.append({**o, 'field_value': hit[0]['value'], 'n': V[o['about']]['n'], 'field_over_versions': len(br)})

# ———————————————————————————————————————————— 5. the figures
end = [r for r in reports if r['kind'] == 'end']
opn = [r for r in reports if r['kind'] == 'open']
by_method = {m: [r for r in end if r['method'] == m] for m in ('declared', 'stand-in', 'unstated')}
off = [r for r in end if not r['agree']]
F = {
    'versions': len(versions), 'versions_after': len(after), 'over_after': sum(v['over'] for v in after),
    'over_before': sum(v['over'] for v in versions if not v['after']), 'versions_before': len(versions) - len(after),
    'max_after': max(v['n'] for v in after), 'runs': len(runs),
    'runs_seen': sum(r['status'] == 'seen' for r in runs), 'runs_unseen': sum(r['status'] == 'unseen' for r in runs),
    'runs_missed': sum(r['status'] == 'missed' for r in runs),
    'runs_back_under': sum(1 for r in runs if r['back_under']),
    'end_reports': len(end), 'open_reports': len(opn),
    'end_declared': len(by_method['declared']), 'end_standin': len(by_method['stand-in']), 'end_unstated': len(by_method['unstated']),
    'declared_exact': sum(r['exact'] for r in by_method['declared'] if r['figure']),
    'declared_with_figure': sum(1 for r in by_method['declared'] if r['figure']),
    'off_side': len(off), 'off_standin': sum(r['method'] == 'stand-in' for r in off),
    'off_unstated': sum(r['method'] == 'unstated' for r in off), 'off_declared': sum(r['method'] == 'declared' for r in off),
    'off_said_under': sum(r['says'] == 'under' for r in off),
    'off_max_gap': max(r['n'] - r['figure'] for r in off) if off else 0,
    'off_min_gap': min(r['n'] - r['figure'] for r in off) if off else 0,
    'open_declared_exact': sum(1 for r in opn if r['method'] == 'declared' and r['figure'] and r['exact']),
    'field_over': outside[0]['field_over_versions'] if outside else None,
    'field_value': outside[0]['field_value'] if outside else None,
    'field_n': outside[0]['n'] if outside else None,
    'icu': out['icu'], 'unicode': out['unicode'],
    'reports_versions': len({r['about'] for r in end}),
    'silent_over_versions': sum(1 for v in after if v['over'] and not any(r['about'] == v['h'] for r in reports)),
    'b_differ': sum(v['nb'] != v['n'] for v in versions), 'b_max_diff': max(v['nb'] - v['n'] for v in versions),
    'b_over_after': sum(v['nb'] > CAP for v in after), 'b_side': sum((v['nb'] > CAP) != v['over'] for v in after),
    'b_split_words': len(BR['split']), 'b_min_diff': min(v['nb'] - v['n'] for v in versions),
    'b_side_lo': min((v['n'] for v in after if (v['nb'] > CAP) != v['over']), default=None),
    'b_side_hi': max((v['n'] for v in after if (v['nb'] > CAP) != v['over']), default=None),
}
ok(F['runs_seen'] + F['runs_unseen'] + F['runs_missed'] == F['runs'], f'runs: {F["runs_seen"]} seen + {F["runs_unseen"]} unseen + {F["runs_missed"]} missed = {F["runs"]}')
ok(F['runs_back_under'] == F['runs'], f'every run came back under the cap ({F["runs_back_under"]} of {F["runs"]})')
ok(F['off_declared'] == 0, 'no report that names the declared rule is on the wrong side of the cap')
ok(F['off_said_under'] == F['off_side'], 'every report on the wrong side said under')
ok(F['declared_exact'] == F['declared_with_figure'], f'every declared-rule figure is exact ({F["declared_exact"]} of {F["declared_with_figure"]})')
for k, v in F.items():
    print(f'     {k} = {v}')

# ———————————————————————————————————————————— 6. the three deeds, every check run
D = json.load(open(os.path.join(HERE, 'deeds.json')))
for d in D['deeds']:
    if 'deed_quote' in d:
        q = d['deed_quote']; quote_in(q['repo'], q['commit'], q['file'], q['quote'], f'{d["id"]} deed')
    for j, q in enumerate(d['own']):
        quote_in(q['repo'], q['commit'], q['file'], q['quote'], f'{d["id"]} own {j + 1}')
    s = d['sighting']
    for j, q in enumerate(s['quotes']):
        quote_in(s['repo'], s['commit'], s['file'], q, f'{d["id"]} sighting {j + 1}')
    if 'writer' in d:
        q = d['writer']; quote_in(q['repo'], q['commit'], q['file'], q['quote'], f'{d["id"]} writer')
        ok(q['quote'] in git('show', f'HEAD:{q["file"]}'), f'{d["id"]} writer: the line still stands today')
    if s['repo'] == 'ulysses':
        s['time'] = git('show', '-s', '--format=%aI', s['commit']).strip()
    for c in d['checks']:
        if 'count_of' in c:
            n = read(c['repo'], c['commit'], c['file']).lower().count(c['count_of'])
            c['result'] = n; ok(n == c['expect'], f'{d["id"]}: "{c["count_of"]}" occurs {n} times in {c["file"]}')
        elif 'quote' in c:
            quote_in(c['repo'], c['commit'], c['file'], c['quote'], f'{d["id"]} check')
            c['result'] = 'found'
            c['author'] = git('show', '-s', '--format=%an', c['commit']).strip()
            c['date'] = git('show', '-s', '--format=%aI', c['commit']).strip()[:10]
        elif c.get('times_of') == 'ticks':
            ts = [datetime.fromisoformat(git('show', '-s', '--format=%aI', t).strip()).astimezone(timezone.utc) for t in d['ticks']]
            subj = [git('show', '-s', '--format=%s', t).strip() for t in d['ticks']]
            span = (max(ts) - min(ts)).total_seconds() / 60
            c['result'] = {'times': [t.strftime('%Y-%m-%dT%H:%M:%S') for t in ts], 'span_minutes': round(span), 'subjects': subj}
            ok(len({t.date() for t in ts}) == 1 and span <= c['expect_span_max_minutes'], f'{d["id"]}: three ticks on one day, {round(span)} minutes apart')
            ok(all('empty tick' in x for x in subj), f'{d["id"]}: each tick names itself empty in its subject')
            d['tick_times'] = ts
        elif 'after_tick_minutes_max' in c:
            if OFFLINE:
                print('skip decision-log time (offline)'); continue
            # the commit time of the house's log entry, from the public commit page of the pinned commit
            api = json.loads(fetch(f'https://api.github.com/repos/frankbueltge/frankbueltge.de/commits/{c["commit"]}'))
            t = datetime.fromisoformat(api['commit']['author']['date'].replace('Z', '+00:00'))
            gap = (t - max(d['tick_times'])).total_seconds() / 60
            c['result'] = {'log_time': t.strftime('%Y-%m-%dT%H:%M:%S'), 'minutes_after_third_tick': round(gap)}
            ok(0 < gap <= c['after_tick_minutes_max'], f'{d["id"]}: the log entry was committed {round(gap)} minutes after the third tick')
        elif c.get('field_signature'):
            if OFFLINE:
                print('skip census signatures (offline)'); continue
            items = json.loads(fetch(RAW['field-research'].format(c=s['commit'], f=s['file'])))
            sig = [i for i in items if i['rule'] == 'signature' and i['practice'] == 'atelier' and i.get('exact_breach')]
            c['result'] = len(sig); d['census_commits'] = [i['commit'] for i in sig]
            ok(len(sig) == c['expect'], f'{d["id"]}: the census marks {len(sig)} of this practice\'s commits broken as written')
            ok({i['exact_detail'] for i in sig} == {'Atelier <ulysses@ulysses.invalid>'}, f'{d["id"]}: all under one written name')
        elif c.get('gate_commits'):
            cs = d.get('census_commits', [])
            rows = [git('show', '-s', '--format=%an <%ae>|%s|%aI', x).strip().split('|') for x in cs]
            gate = [r for r in rows if r[0] == 'Atelier <ulysses@ulysses.invalid>' and r[1].startswith('feedback: auto-land refusals')]
            c['result'] = len(gate)
            c['first'] = min(r[2] for r in rows)[:10] if rows else None
            c['last'] = max(r[2] for r in rows)[:10] if rows else None
            ok(OFFLINE or len(gate) == c['expect'], f'{d["id"]}: {len(gate)} of them are the gate\'s daily notes of refusals')
    d.pop('tick_times', None)

# ———————————————————————————————————————————— 7. the texts read from outside this house
S = json.load(open(os.path.join(HERE, 'sources.json')))
if not OFFLINE:
    for s in S['sources']:
        if s.get('kind') == 'pdf':
            b = fetch(s['url'])
            ok(hashlib.sha256(b).hexdigest() == s['sha256'], f'{s["id"]}: the fetched PDF matches its recorded hash')
            with tempfile.TemporaryDirectory() as td:
                p = os.path.join(td, 'f.pdf'); open(p, 'wb').write(b)
                subprocess.run(['pdftotext', p, os.path.join(td, 'f.txt')], check=True)
                raw = open(os.path.join(td, 'f.txt'), encoding='utf-8', errors='replace').read()
            # the scan is two columns read through OCR, which interleaves them line by line; match each passage on its
            # letters: the share of the passage found, in order, in runs of four letters or more, within a window three
            # times its length (a decoy of the same build, with its nouns changed, scored 0.62 on 2026-11-19)
            hay = re.sub(r'[^a-z]', '', raw.lower())
            for q in s['passages']:
                needle = re.sub(r'[^a-z]', '', q['text'].lower())
                L, best = len(needle), 0.0
                for i0 in range(0, max(1, len(hay) - L), max(1, L // 8)):
                    sm = difflib.SequenceMatcher(None, needle, hay[i0:i0 + 3 * L], autojunk=False)
                    best = max(best, sum(b.size for b in sm.get_matching_blocks() if b.size >= 4) / L)
                q['ocr_match'] = round(best, 3)
                ok(best >= q['min_match'], f'{s["id"]}: passage "{q["text"][:40]}…" found in the scan (match {best:.2f})')
        elif s.get('kind') == 'page':
            import html as _html
            page = _html.unescape(re.sub(r'<[^>]+>', ' ', fetch(s['url']).decode('utf-8', 'replace')))
            for q in s['passages']:
                ok(flat(q['text']) in flat(page), f'{s["id"]}: "{q["text"][:40]}…" on the page')
        elif s.get('kind') == 'arxiv':
            xml = fetch(f'https://export.arxiv.org/api/query?id_list={s["arxiv"]}').decode('utf-8')
            for q in s['passages']:
                ok(flat(q['text']) in flat(xml), f'{s["id"]}: "{q["text"][:40]}…" in the abstract')

# ———————————————————————————————————————————— 8. write
os.makedirs(os.path.join(HERE, 'data'), exist_ok=True)
DG = {'cap': CAP, 'declared': DECLARED[:7], 'counter': {'icu': out['icu'], 'unicode': out['unicode'], 'call': "Intl.Segmenter('en', {granularity: 'word'}), segments with isWordLike"},
      'browser': {'name': BR['browser'], 'split': BR['split']},
      'figures': F, 'versions': [{k: v[k] for k in ('i', 'h', 'H', 'date', 'author', 'n', 'nb', 'ws', 'after', 'over')} for v in versions],
      'reports': reports, 'runs': runs, 'outside': outside}
json.dump(DG, open(os.path.join(HERE, 'data', 'digest.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(D, open(os.path.join(HERE, 'data', 'deeds.json'), 'w'), ensure_ascii=False, indent=1)
# the page loads the same data as scripts, so that it opens from a file as well as from the site
for name, obj in (('DIGEST', DG), ('DEEDS', D), ('TEXTS', texts)):
    with open(os.path.join(HERE, 'data', name.lower() + '.js'), 'w', encoding='utf-8') as f:
        f.write(f'window.{name}=' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + ';\n')
if not OFFLINE:
    json.dump(S, open(os.path.join(HERE, 'sources.json'), 'w'), ensure_ascii=False, indent=1)
print(f'\n{len(fails)} failed' if fails else '\nall checks passed')
sys.exit(1 if fails else 0)
