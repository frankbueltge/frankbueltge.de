#!/usr/bin/env python3
"""Check 87, part A: the limits the census did not read, counted by study 85's rules, and the sightings of every
breach, old and new, searched again with the site's decision log as a fifth record.

Usage:
    git clone --bare https://github.com/frankbueltge/<repo>.git <dir>/<repo>.git
    (field-research, ulysses, studio, research-ecology; and frankbueltge.de, which may be cloned --filter=blob:none)
    python3 check87.py <dir> <out.jsonl>

Reads each history at the heads study 85 read (results85.json), so later commits change nothing. Writes every
candidate line with its text to <out.jsonl> (a working file, not committed), and beside this file items87.json (the
new items), candidates87.json (pointers only) and partA87.json (the counts before coding). Codes are added by reading
(codes87.json); scores87.py joins them. Standard library only.
"""
import json, os, re, subprocess, sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import analyse85 as A   # noqa: E402  (helpers only; its main() is not run)
import seen86 as S      # noqa: E402

CLONES, OUT = sys.argv[1], sys.argv[2]
A.CLONES = CLONES
HEADS = json.load(open(os.path.join(HERE, 'results85.json')))['heads']
SITE, SITE_HEAD = 'frankbueltge.de', '7f92ac31d892470110bb97b8ae10bc1ab164dce0'   # the log study 86 coded
CENSUS = S.CENSUS
REPOS = {'field': 'field-research', 'atelier': 'ulysses', 'studio': 'studio'}
PERSONA = A.PERSONA

# The limits written with a number that study 85 did not read (CODEBOOK87.md, part A).
PATTERNS = {
    'journal-words-400': r'journal[^≤]{0,300}≤ ?400 words',
    'foundation-4000': r'FOUNDATION-REQUIREMENTS-FINAL\.md`?,? together under 4,000 words',
    'score-lines-60': r'SCORE\.md`?, at most 60 lines',
    'line-chars-160': r'`Line: new — <why no line fits>`, at most 160 characters',
    'process-record-3000': r'process record[^.]{0,80}?(?:under|<) ?3,000 words',
}
LIMIT = {'journal-words-400': 400, 'foundation-4000': 4000, 'score-lines-60': 60, 'line-chars-160': 160,
         'process-record-3000': 3000}
DECIDABLE = ['journal-words-400', 'foundation-4000', 'score-lines-60', 'line-chars-160']
# An amendment that rewrites a limit without deleting its old wording ends the old limit (the Studio, 2026-10-22).
ENDS = {'score-lines-60': r'score of .{0,3}at most 60 lines.{0,3} now reads .{0,3}at most 20 lines'}
FOUNDATION = ('11-FINAL-RESEARCH-FOUNDATION-SYNTHESIS.md', '12-FOUNDATION-REQUIREMENTS-FINAL.md')
LINE_LINE = re.compile(r'^\s*(?:[-*+]\s+)?(?:\*\*|__)?`?Line:', re.M)


def git(repo, *a):
    return subprocess.run(['git', '-C', os.path.join(CLONES, repo + '.git')] + list(a), capture_output=True,
                          check=True).stdout


def history(repo, head):
    out = git(repo, 'log', '--no-merges', '--reverse', '-M', '--raw', '--no-abbrev',
              '--format=%x1e%H%x1f%an%x1f%ae%x1f%aI%x1f%cI%x1f%B%x1d', head).decode('utf-8', 'replace')
    commits = []
    for rec in out.split('\x1e')[1:]:
        head_, _, raw = rec.partition('\x1d')
        h, an, ae, ad, cd, body = head_.split('\x1f', 5)
        changes = []
        for l in raw.strip('\n').split('\n'):
            if not l.startswith(':'):
                continue
            meta, *paths = l.split('\t')
            _, _, a, b, st = meta.split(' ')
            changes.append({'status': st, 'old': a, 'new': b, 'path': paths[-1], 'from': paths[0]})
        commits.append({'h': h, 'an': an, 'ae': ae, 'ad': A.when(ad), 'cd': A.when(cd), 'body': body.strip('\n'),
                        'subject': body.strip('\n').split('\n')[0], 'changes': changes})
    return commits


def spans_of(repo, commits, blobs):
    on, spans = {}, {}
    for c in commits:
        for ch in c['changes']:
            if ch['path'] != 'PROTOCOL.md' or ch['status'] == 'D':
                continue
            t = blobs.get(ch['new'])
            if t is None:
                continue
            t = re.sub(r'\s+', ' ', t.replace('*', ''))
            for r, rx in PATTERNS.items():
                m = bool(re.search(rx, t, re.I)) and not (r in ENDS and re.search(ENDS[r], t, re.I))
                if m and r not in on:
                    on[r] = (c['cd'], c['h'])
                elif not m and r in on:
                    s = on.pop(r)
                    spans.setdefault(r, []).append({'start': s[0], 'end': c['cd'], 'commit': s[1], 'end_commit': c['h']})
    for r, s in on.items():
        spans.setdefault(r, []).append({'start': s[0], 'end': None, 'commit': s[1], 'end_commit': None})
    return spans


def main():
    items, rules_out = [], []
    for prac, repo in REPOS.items():
        blobs = A.Blobs(repo)
        commits = history(repo, HEADS[repo])
        spans = spans_of(repo, commits, blobs)
        for r, ss in sorted(spans.items()):
            for s in ss:
                rules_out.append({'rule': r, 'practice': prac, 'limit': LIMIT[r],
                                  'decidable': r in DECIDABLE, 'start': s['start'].isoformat(),
                                  'end': s['end'].isoformat() if s['end'] else None,
                                  'commit': s['commit'], 'end_commit': s['end_commit']})

        def bind(rule, c, path, value, breach, **extra):
            s = A.in_force(spans.get(rule, []), c['ad'])
            if not s:
                return
            items.append({'rule': rule, 'practice': prac, 'repo': repo, 'path': path, 'commit': c['h'],
                          'time': c['ad'].isoformat(), 'signer': A.signer(c), 'author': c['an'], 'value': value,
                          'breach': bool(breach), 'first_day': c['ad'] < s['start'] + timedelta(hours=24), **extra})

        found = {}
        for c in commits:
            for ch in c['changes']:
                st, path = ch['status'], ch['path']
                if st == 'D' or (st[:1] in 'RC' and st[1:] == '100'):
                    continue
                base = path.rsplit('/', 1)[-1]
                if base in FOUNDATION:
                    found[base] = path
                if not (path.startswith('journal/') or base == 'SCORE.md' or path == 'BULLETIN.md'
                        or base in FOUNDATION):
                    continue
                t = blobs.get(ch['new'])
                if t is None:
                    continue
                if path.startswith('journal/'):
                    if st.startswith('A') or st.startswith('C'):
                        e, kind = t, 'file'
                    else:
                        old = blobs.get(ch['old'])
                        e = A.added_text(old, t) if old is not None else None
                        kind = 'appended'
                    if e is not None and e.strip():
                        w = A.words(e)
                        bind('journal-words-400', c, path, w, w > 400, kind=kind, ascii=A.ascii_words(e),
                             ascii_breach=A.ascii_words(e) > 400, blob=ch['new'])
                if base == 'SCORE.md':
                    nb, al = A.lines(t)
                    blk = A.blocks(t)
                    bind('score-lines-60', c, path, nb, nb > 60, strict=al, blocks=blk, blocks_breach=blk > 60,
                         blob=ch['new'])
                if path == 'BULLETIN.md':
                    for m in LINE_LINE.finditer(t):
                        ln = t[m.start():].split('\n', 1)[0].strip()
                        ln = re.sub(r'^[-*+]\s+', '', ln)
                        bind('line-chars-160', c, path, len(ln), len(ln) > 160, blob=ch['new'])
                if base in FOUNDATION:
                    # both files' words at this commit
                    tot, parts = 0, {}
                    for f in FOUNDATION:
                        p = found.get(f)
                        if p is None:
                            continue
                        try:
                            ft = git(repo, 'show', f'{c["h"]}:{p}').decode('utf-8', 'replace')
                        except subprocess.CalledProcessError:
                            continue
                        parts[f] = A.words(ft)
                        tot += parts[f]
                    bind('foundation-4000', c, path, tot, tot > 4000, detail=parts)
    for i in items:
        i['robust'] = bool(i['breach'] and i.get('blocks_breach', True) and i.get('ascii_breach', True))
    items.sort(key=lambda i: (i['time'], i['practice'], i['rule']))
    json.dump(rules_out, open(os.path.join(HERE, 'rules87.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump(items, open(os.path.join(HERE, 'items87.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

    # ---- sightings: seen86's rule, with the new kind words, over the four repositories and the decision log
    S.RULES.update({'journal-words-400': ('journal', 400, 'words'), 'foundation-4000': ('foundation', 4000, 'words'),
                    'score-lines-60': ('score', 60, 'lines'), 'line-chars-160': ('line', 160, 'characters')})
    S.KIND.update({'foundation': re.compile(r'foundation|synthesis', re.I),
                   'line': re.compile(r'\bLine:|line of the proposal|`Line', re.I)})
    old = [i for i in json.load(open(os.path.join(HERE, 'items85.json'))) if i['breach']]
    first = min(datetime.fromisoformat(i['time']) for i in old + [i for i in items if i['breach']])
    cands, full = [], open(OUT, 'w', encoding='utf-8')
    sources = [(r, p, HEADS[r], '*.md') for r, p in S.REPOS.items()] + [(SITE, 'site', SITE_HEAD, 'docs/decision-log.md')]
    for repo, prac, head, spec in sources:
        log = git(repo, 'log', '--no-merges', '--format=%x1e%H%x1f%an%x1f%aI%x1f%B', head).decode('utf-8', 'replace')
        meta = {}
        for rec in log.split('\x1e')[1:]:
            h, an, ad, body = rec.split('\x1f', 3)
            t = datetime.fromisoformat(ad)
            meta[h] = (an, ad)
            if repo == SITE or not (first <= t <= CENSUS):
                continue
            m = S.match(body)
            if m:
                cands.append({'repo': repo, 'commit': h, 'author': an, 'signer': S.signer(repo, an), 'time': ad,
                              'path': '(commit message)', 'n': 0, 'rules': m, 'text': body.strip()})
        raw = git(repo, 'log', '--no-merges', '-p', '-U0', '--no-color', '--format=%x1e%H', head, '--', spec)
        h, path, n = None, None, 0
        for line in raw.decode('utf-8', 'replace').split('\n'):
            if line.startswith('\x1e'):
                h, path = line[1:].strip(), None
                continue
            if line.startswith('+++ '):
                path = line[6:] if line.startswith('+++ b/') else None
                n = 0
                continue
            if line.startswith('@@'):
                mm = re.search(r'\+(\d+)', line)
                n = int(mm.group(1)) - 1 if mm else 0
                continue
            if not line.startswith('+') or line.startswith('+++') or path is None or h not in meta:
                continue
            n += 1
            an, ad = meta[h]
            t = datetime.fromisoformat(ad)
            if not (first <= t <= CENSUS):
                continue
            m = S.match(line[1:])
            if m:
                signer = "the architect's name (decision log)" if repo == SITE else S.signer(repo, an)
                cands.append({'repo': repo, 'commit': h, 'author': an, 'signer': signer, 'time': ad, 'path': path,
                              'n': n, 'rules': m, 'text': line[1:]})
    cands.sort(key=lambda c: (c['time'], c['repo'], c['path'], c['n']))
    for k, c in enumerate(cands):
        c['id'] = k + 1
        full.write(json.dumps(c, ensure_ascii=False) + '\n')
    json.dump({'check': 87, 'census': CENSUS.isoformat(),
               'candidates': [{k: v for k, v in c.items() if k != 'text'} for c in cands]},
              open(os.path.join(HERE, 'candidates87.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    from collections import Counter
    summary = {
        'rules': rules_out,
        'items': {r: {'bound': sum(1 for i in items if i['rule'] == r),
                      'breach': sum(i['breach'] for i in items if i['rule'] == r),
                      'robust': sum(i['robust'] for i in items if i['rule'] == r),
                      'by_practice': {p: [sum(1 for i in items if i['rule'] == r and i['practice'] == p),
                                          sum(i['breach'] for i in items if i['rule'] == r and i['practice'] == p)]
                                      for p in REPOS}}
                  for r in sorted({i['rule'] for i in items})},
        'candidates': len(cands), 'candidates_by_repo': dict(Counter(c['repo'] for c in cands)),
    }
    json.dump(summary, open(os.path.join(HERE, 'partA87.json'), 'w'), indent=1, ensure_ascii=False, default=str)
    print(json.dumps(summary['items'], indent=1), len(cands), summary['candidates_by_repo'])


if __name__ == '__main__':
    main()
