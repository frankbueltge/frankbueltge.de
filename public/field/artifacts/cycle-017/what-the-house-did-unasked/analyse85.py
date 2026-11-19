#!/usr/bin/env python3
"""Study 85: the house's written, script-checkable instructions read against the full Git history.

Usage:
    git clone --bare --filter=blob:limit=300k https://github.com/frankbueltge/<repo>.git <dir>/<repo>.git
    (for field-research, ulysses, studio, research-ecology)
    python3 analyse85.py <dir>

Writes rules85.json, items85.json and results85.json beside this file. Rules and counting are fixed in
CODEBOOK85.md; predictions in PREDICTIONS85.md. Standard library only. A blob the partial clone left out
(over 300 kB) is never fetched: it is counted as unread.
"""
import json, os, re, subprocess, sys, unicodedata
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CLONES = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('CLONES', '')
REPOS = {'field': 'field-research', 'atelier': 'ulysses', 'studio': 'studio'}
MIDDLE = 'research-ecology'
PERSONA = {'field': re.compile(r'^Meridian(?![-\w])'), 'atelier': re.compile(r'^(Ulysses|Assay|Atelier)(?![-\w])'),
           'studio': re.compile(r'^Ensemble(?![-\w])')}
ANY_PERSONA = re.compile(r'^(Meridian|Ulysses|Assay|Atelier|Ensemble)(?![-\w])')
ARCHITECT = re.compile(r'^Frank B(ü|ue)ltge$|^frankbueltge$', re.I)
PRODUCT = re.compile(r'\b(claude|anthropic|openai|chatgpt|gpt-?\d|gemini|copilot|cursor|devin|codex)\b', re.I)
OTHER_PERSON = 'frank@bueltge.de'   # named in the house's rules as another real person's address

# Rule patterns, read in each practice's PROTOCOL.md (whitespace and '*' normalised, case ignored).
PATTERNS = {
    'bulletin-lines': r'BULLETIN\.md`?:? ?\(?(?:at most|no more than) 40 lines',
    'bulletin-words': r'bulletin(?: has|`?:)? ?.{0,40}at most 40 lines and at most 400 words',
    'journal-lines': r'(?:note|entry) of at most 40 lines to `?journal',
    'journal-words': r'journal.{0,80}at most 150 words',
    'score-lines': r'SCORE\.md.{0,120}at most 20 lines|score of at most 20 lines',
    'critique-lines': r'at most 20 lines (?:it|the critique) says',
    'digest-words': r'at most 2,500 words',
    'subject-chars': r'commit subject.{0,80}at most 100 characters',
    'letter-words': r'letter.{0,40}at most 150 words',
    'predictions-three': r'at most three in a session',
    'process-never-rewritten': r'never rewritten',
    'foreign-scripts': r'(?:no|never) scripts? (?:from|of) (?:a )?(?:foreign|another|other|outside) host'
                       r'|scripts? (?:are|is) not loaded from foreign hosts',
    'line-file': r'never edits? (?:a|the) line files?|(?:practice|practices) (?:do|does) not edit (?:a|the) line',
    'signature': r'\.invalid>?`',
    'for-the-programme': r'For the programme:',
    'next-step': r'Next step: <',
}
KIND = {r: 'limit' for r in ['bulletin-lines', 'bulletin-words', 'journal-lines', 'journal-words', 'score-lines',
                             'critique-lines', 'digest-words', 'subject-chars', 'letter-words', 'predictions-three']}
KIND.update({r: 'prohibition' for r in ['process-never-rewritten', 'foreign-scripts', 'line-file', 'signature',
                                          'product-credit']})
KIND.update({'for-the-programme': 'duty', 'next-step': 'duty'})
LIMIT = {'bulletin-lines': 40, 'bulletin-words': 400, 'journal-lines': 40, 'journal-words': 150, 'score-lines': 20,
         'critique-lines': 20, 'digest-words': 2500, 'subject-chars': 100, 'letter-words': 150,
         'predictions-three': 3}
TEAM_RULE = ('product-credit', datetime(2026, 7, 12, tzinfo=timezone.utc),
             'frankbueltge.de CLAUDE.md, team rule of 2026-07-12 (no AI-product credits in Git)')
CODE_EXT = ('.html', '.htm', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.svelte')
WORD = re.compile(r'\S+')
ALNUM = re.compile(r'[^\W_]')


def git(repo, *args, inp=None):
    return subprocess.run(['git', '-C', os.path.join(CLONES, repo + '.git'), *args], input=inp,
                          capture_output=True, check=True).stdout


def when(s):
    return datetime.fromisoformat(s).astimezone(timezone.utc)


def words(t):
    return sum(1 for w in WORD.findall(t) if ALNUM.search(w))


ASCII_ALNUM = re.compile(r'[A-Za-z0-9]')


def ascii_words(t):
    """The Field's own digest counter (tools/nobody-read-this/digest_tokens.py) reads a letter as A-Z only.
    A second reading, added after the first count."""
    return sum(1 for w in t.split() if ASCII_ALNUM.search(w))


def lines(t):
    ls = t.split('\n')
    if ls and ls[-1] == '':
        ls = ls[:-1]
    return sum(1 for l in ls if l.strip()), len(ls)


BLOCK_START = re.compile(r'^\s*(?:[-*+]\s|\d+[.)]\s|#|\||>)')


def blocks(t):
    """Markdown blocks: a paragraph of wrapped lines is one; a list item, heading, table row or quote starts one.
    A reading added after the first count (see CODEBOOK85.md, 'Added after the first count')."""
    n, prev_blank = 0, True
    for l in t.split('\n'):
        if not l.strip():
            prev_blank = True
            continue
        if prev_blank or BLOCK_START.match(l):
            n += 1
        prev_blank = False
    return n


def added_text(old, new):
    """For a journal file changed in place: the appended lines, or None when lines were removed (an edit)."""
    import difflib
    a, b = old.split('\n'), new.split('\n')
    plus, minus = [], 0
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op in ('replace', 'delete'):
            minus += sum(1 for x in a[i1:i2] if x.strip())
        if op in ('replace', 'insert'):
            plus += b[j1:j2]
    if minus:
        return None
    return '\n'.join(plus)


def missing_blobs(repo):
    out = git(repo, 'rev-list', '--objects', '--all', '--missing=print').decode()
    return {l[1:].strip() for l in out.split('\n') if l.startswith('?')}


class Blobs:
    def __init__(self, repo):
        self.repo, self.missing, self.cache = repo, missing_blobs(repo), {}

    def get(self, oid):
        if oid in self.missing or set(oid) == {'0'}:
            return None
        if oid not in self.cache:
            self.cache[oid] = git(self.repo, 'cat-file', 'blob', oid).decode('utf-8', 'replace')
        return self.cache[oid]


def history(repo):
    """Non-merge commits reachable from main, oldest first, with raw changes (blob ids)."""
    out = git(repo, 'log', '--no-merges', '--reverse', '-M', '--raw', '--no-abbrev',
              '--format=%x1e%H%x1f%an%x1f%ae%x1f%aI%x1f%cI%x1f%B%x1d', 'HEAD').decode('utf-8', 'replace')
    commits = []
    for rec in out.split('\x1e')[1:]:
        head, _, raw = rec.partition('\x1d')
        h, an, ae, ad, cd, body = head.split('\x1f', 5)
        changes = []
        for l in raw.strip('\n').split('\n'):
            if not l.startswith(':'):
                continue
            meta, *paths = l.split('\t')
            _, _, a, b, st = meta.split(' ')
            changes.append({'status': st, 'old': a, 'new': b, 'path': paths[-1], 'from': paths[0]})
        commits.append({'h': h, 'an': an, 'ae': ae, 'ad': when(ad), 'cd': when(cd), 'body': body.strip('\n'),
                        'subject': body.strip('\n').split('\n')[0], 'changes': changes})
    return commits


def rule_spans(repo, commits, blobs):
    """Per rule: list of (start, end, start_commit) from the PROTOCOL.md versions on main."""
    first_parent = set(git(repo, 'rev-list', '--first-parent', 'HEAD').decode().split())
    spans, on = {}, {}
    sigs = []
    for c in commits:
        for ch in c['changes']:
            if ch['path'] != 'PROTOCOL.md' or ch['status'] == 'D':
                continue
            t = blobs.get(ch['new'])
            if t is None:
                continue
            t = re.sub(r'\s+', ' ', t.replace('*', ''))
            sm = re.search(r'`((?:Meridian|Ulysses|Assay|Ensemble)[^`<]*<[^>`]+\.invalid>)`', t)
            if sm and (not sigs or sigs[-1][1] != sm.group(1)):
                sigs.append((c['cd'], sm.group(1), c['h']))
            for r, rx in PATTERNS.items():
                m = bool(re.search(rx, t, re.S | re.I))
                if m and r not in on:
                    on[r] = (c['cd'], c['h'], c['h'] in first_parent)
                elif not m and r in on:
                    s = on.pop(r)
                    spans.setdefault(r, []).append({'start': s[0], 'end': c['cd'], 'commit': s[1],
                                                    'end_commit': c['h']})
    for r, s in on.items():
        spans.setdefault(r, []).append({'start': s[0], 'end': None, 'commit': s[1], 'end_commit': None})
    spans['_signatures'] = sigs
    return spans


def in_force(spans, t):
    for s in spans:
        if t >= s['start'] and (s['end'] is None or t < s['end']):
            return s
    return None


def signer(c):
    if PRODUCT.search(c['an']) or PRODUCT.search(c['ae']):
        return 'product'
    if ANY_PERSONA.search(c['an']):
        return 'practice'
    if ARCHITECT.search(c['an']):
        return 'architect-name'
    return 'other'


SCRIPT_SRC = re.compile(r'<script\b[^>]*?\bsrc\s*=\s*["\']?\s*(?:https?:)?//([^/"\'\s>]+)', re.I)
IMPORT_FROM = re.compile(r'\bimport\b[^;\'"`]{0,300}?\bfrom\s*["\'](?:https?:)?//([^/"\']+)')
IMPORT_DYN = re.compile(r'\bimport\s*\(\s*["\'](?:https?:)?//([^/"\']+)')
IMPORT_SCRIPTS = re.compile(r'\bimportScripts\s*\(\s*["\'](?:https?:)?//([^/"\']+)')


def foreign_hosts(t):
    hosts = []
    for rx in (SCRIPT_SRC, IMPORT_FROM, IMPORT_DYN, IMPORT_SCRIPTS):
        for m in rx.finditer(t):
            h = m.group(1).lower().split(':')[0]
            if not (h == 'frankbueltge.de' or h.endswith('.frankbueltge.de')):
                hosts.append(h)
    return sorted(set(hosts))


def credit_marks(body):
    marks = []
    for l in body.split('\n'):
        s = l.strip()
        if re.match(r'(?i)co-authored-by:', s) and PRODUCT.search(s):
            marks.append('co-author')
        elif re.search(r'(?i)generated (with|by)\b', s) and PRODUCT.search(s):
            marks.append('generated-with')
        elif re.search(r'(?i)claude\.(ai|com)/(code|claude-code)', s):
            marks.append('session-link')
        if '\U0001F916' in s:
            marks.append('robot')
    return sorted(set(marks))


def bad_author(c):
    reasons = []
    if PRODUCT.search(c['an']) or PRODUCT.search(c['ae']):
        reasons.append('product name')
    ae = c['ae'].lower()
    if ae.endswith('noreply.github.com'):
        local = ae.split('@')[0]
        if 'frankbueltge' not in local and '[bot]' not in local and 'github-actions' not in local:
            reasons.append('no-reply address of another account')
    if ae == OTHER_PERSON:
        reasons.append("another real person's address")
    return reasons


def process_rewrites(old, new):
    try:
        a, b = json.loads(old), json.loads(new)
    except Exception:
        return ['unreadable']
    sa = {s.get('n'): s for s in (a.get('states') or [])} if isinstance(a, dict) else {}
    sb = {s.get('n'): s for s in (b.get('states') or [])} if isinstance(b, dict) else {}
    out = []
    for n, s in sa.items():
        if n not in sb:
            out.append(f'state {n} gone')
        elif s != sb[n]:
            fields = sorted(k for k in set(s) | set(sb[n]) if s.get(k) != sb[n].get(k))
            out.append(f'state {n}: ' + ', '.join(fields))
    return out


def main():
    items, rules_out, unread, edited, signatures = [], [], {}, {}, []
    middle_commits = history(MIDDLE)
    for prac, repo in REPOS.items():
        blobs = Blobs(repo)
        commits = history(repo)
        spans = rule_spans(repo, commits, blobs)
        spans['product-credit'] = [{'start': TEAM_RULE[1], 'end': None, 'commit': None, 'end_commit': None}]
        sigs = spans.pop('_signatures')
        for r, ss in sorted(spans.items()):
            for s in ss:
                rules_out.append({'rule': r, 'practice': prac, 'kind': KIND[r], 'limit': LIMIT.get(r),
                                  'start': s['start'].isoformat(), 'end': s['end'].isoformat() if s['end'] else None,
                                  'commit': s['commit'], 'end_commit': s['end_commit'],
                                  'source': TEAM_RULE[2] if r == 'product-credit' else f'{repo}/PROTOCOL.md'})
        signatures.append({'practice': prac, 'versions': [{'from': t.isoformat(), 'signature': g, 'commit': h}
                                                          for t, g, h in sigs]})
        unread[prac] = 0
        edited[prac] = 0

        def bind(rule, c, path, value, strict, breach, detail=None, blob=None, blk=None, asc=None):
            s = in_force(spans.get(rule, []), c['ad'])
            if not s:
                return
            it = {'rule': rule, 'practice': prac, 'repo': repo, 'path': path, 'commit': c['h'],
                  'time': c['ad'].isoformat(), 'signer': signer(c), 'value': value, 'strict': strict,
                  'breach': bool(breach), 'first_day': c['ad'] < s['start'] + timedelta(hours=24),
                  'detail': detail, 'blob': blob}
            if blk is not None:
                it['blocks'] = blk
                it['blocks_breach'] = blk > LIMIT[rule]
            if asc is not None:
                it['ascii'] = asc
                it['ascii_breach'] = asc > LIMIT[rule]
            items.append(it)

        def signature_in_force(t):
            cur = None
            for f, g, h in sigs:
                if f <= t:
                    cur = g
            return cur

        for c in commits:
            # commit-level rules
            subj_len = len(unicodedata.normalize('NFC', c['subject']))
            if PERSONA[prac].search(c['an']):
                bind('subject-chars', c, None, subj_len, subj_len, subj_len > 100, c['subject'])
            ba = bad_author(c)
            bind('signature', c, None, len(ba), len(ba), bool(ba), '; '.join(ba) or None)
            if items and items[-1]['commit'] == c['h'] and items[-1]['rule'] == 'signature':
                # second reading, added after the first count: the signature exactly as the constitution writes it,
                # for every commit signed with one of this practice's names (a parenthesised role suffix is allowed)
                sig = signature_in_force(c['ad'])
                own = bool(PERSONA[prac].search(c['an']))
                actual = re.sub(r'\s*\([^)]*\)\s*$', '', c['an']).strip() + ' <' + c['ae'] + '>'
                items[-1]['own_name'] = own
                items[-1]['as_written'] = sig
                items[-1]['exact_breach'] = bool(own and sig and actual != sig)
                items[-1]['exact_detail'] = actual if own and sig and actual != sig else None
            cm = credit_marks(c['body'])
            bind('product-credit', c, None, len(cm), len(cm), bool(cm), ', '.join(cm) or None)
            # file-level rules
            for ch in c['changes']:
                st, path = ch['status'], ch['path']
                if st == 'D' or (st.startswith('R') and st[1:] == '100') or (st.startswith('C') and st[1:] == '100'):
                    continue
                base = path.rsplit('/', 1)[-1]
                needs = (path == 'BULLETIN.md' or path.startswith('journal/') or base in ('SCORE.md', 'CRITIQUE.md')
                         or path == 'STATE-OF-THE-FIELD.md' or base == 'letter.txt' or base == 'PROCESS.json'
                         or (base.startswith('PREDICTIONS') and base.endswith('.md')) or base.endswith(CODE_EXT))
                if not needs:
                    continue
                t = blobs.get(ch['new'])
                if t is None:
                    unread[prac] += 1
                    continue
                nb, al = lines(t)
                w = words(t)
                bl = ch['new']
                if path == 'BULLETIN.md':
                    bind('bulletin-lines', c, path, nb, al, nb > 40, blob=bl, blk=blocks(t))
                    bind('bulletin-words', c, path, w, w, w > 400, blob=bl, asc=ascii_words(t))
                if path.startswith('journal/'):
                    # an entry: a file added, or lines appended to one; an edit that removes lines is no new entry
                    if st.startswith('A') or st.startswith('C'):
                        e = t
                    else:
                        old = blobs.get(ch['old'])
                        e = added_text(old, t) if old is not None else None
                        if e is None or not e.strip():
                            edited[prac] += in_force(spans.get('journal-lines', []) + spans.get('journal-words', []),
                                                     c['ad']) is not None
                            e = None
                    if e is not None:
                        enb, eal = lines(e)
                        ew = words(e)
                        kind = 'file' if (st.startswith('A') or st.startswith('C')) else 'appended'
                        bind('journal-lines', c, path, enb, eal, enb > 40, kind, blob=bl, blk=blocks(e))
                        bind('journal-words', c, path, ew, ew, ew > 150, kind, blob=bl, asc=ascii_words(e))
                if base == 'SCORE.md':
                    bind('score-lines', c, path, nb, al, nb > 20, blob=bl, blk=blocks(t))
                if base == 'CRITIQUE.md':
                    bind('critique-lines', c, path, nb, al, nb > 20, blob=bl, blk=blocks(t))
                if path == 'STATE-OF-THE-FIELD.md':
                    bind('digest-words', c, path, w, w, w > 2500, blob=bl, asc=ascii_words(t))
                if base == 'letter.txt':
                    bind('letter-words', c, path, w, w, w > 150, blob=bl, asc=ascii_words(t))
                if base.startswith('PREDICTIONS') and base.endswith('.md') and st == 'A' and prac == 'field':
                    labels = sorted(set(re.findall(r'(?m)^\s*[-*]?\s*\*\*P(\d{2,4})\b', t)))
                    bind('predictions-three', c, path, len(labels), len(labels), len(labels) > 3,
                         ', '.join('P' + x for x in labels) or None, blob=bl)
                if base == 'PROCESS.json' and st.startswith(('M', 'R')):
                    old = blobs.get(ch['old'])
                    rw = process_rewrites(old, t) if old is not None else ['parent unread']
                    bind('process-never-rewritten', c, path, len(rw), len(rw), bool(rw) and rw != ['parent unread'],
                         '; '.join(rw) or None, blob=bl)
                if base.endswith(CODE_EXT):
                    fh = foreign_hosts(t)
                    bind('foreign-scripts', c, path, len(fh), len(fh), bool(fh), ', '.join(fh) or None, blob=bl)
        # the line files live in the Middle's repository; a practice's signature there breaches
        for c in middle_commits:
            if not any(ch['path'].startswith('lines/') for ch in c['changes']):
                continue
            touched = sorted({ch['path'] for ch in c['changes'] if ch['path'].startswith('lines/')})
            breach = bool(PERSONA[prac].search(c['an']))
            s = in_force(spans.get('line-file', []), c['ad'])
            if s:
                items.append({'rule': 'line-file', 'practice': prac, 'repo': MIDDLE, 'path': ', '.join(touched),
                              'commit': c['h'], 'time': c['ad'].isoformat(), 'signer': signer(c),
                              'value': int(breach), 'strict': int(breach), 'breach': breach,
                              'first_day': c['ad'] < s['start'] + timedelta(hours=24), 'detail': c['an']})
        # presentation summaries: the duties read the last version of each summary
        last = {}
        for c in commits:
            for ch in c['changes']:
                p = ch['path']
                if re.match(r'presentations/[^/]+/SUMMARY\.md$', p) and ch['status'] != 'D':
                    if p not in last:
                        last[p] = {'first': c, 'oid': ch['new'], 'last': c}
                    last[p]['oid'], last[p]['last'] = ch['new'], c
        for p, v in sorted(last.items()):
            t = blobs.get(v['oid']) or ''
            ls = [l.strip().strip('*_ ').lstrip('-').strip().strip('*_ ') for l in t.split('\n')]
            ls_nb = [l for l in ls if l]
            has_ftp = any(l.startswith('For the programme:') for l in ls_nb)
            has_ns = any(l.startswith('Next step:') for l in ls_nb)
            ends_ns = bool(ls_nb) and ls_nb[-1].startswith('Next step:')
            c = v['first']
            for rule, ok, strict_ok in (('for-the-programme', has_ftp, has_ftp), ('next-step', has_ns, ends_ns)):
                s = in_force(spans.get(rule, []), c['ad'])
                if s:
                    items.append({'rule': rule, 'practice': prac, 'repo': repo, 'path': p, 'commit': v['last']['h'],
                                  'time': c['ad'].isoformat(), 'signer': signer(c), 'value': int(not ok),
                                  'strict': int(not strict_ok), 'breach': not ok,
                                  'first_day': c['ad'] < s['start'] + timedelta(hours=24), 'detail': None})
    # the team rule binds the Middle's repository too
    rules_out.append({'rule': 'product-credit', 'practice': 'middle', 'kind': 'prohibition', 'limit': None,
                      'start': TEAM_RULE[1].isoformat(), 'end': None, 'commit': None, 'end_commit': None,
                      'source': TEAM_RULE[2]})
    for c in middle_commits:
        if c['ad'] < TEAM_RULE[1]:
            continue
        cm = credit_marks(c['body'])
        items.append({'rule': 'product-credit', 'practice': 'middle', 'repo': MIDDLE, 'path': None,
                      'commit': c['h'], 'time': c['ad'].isoformat(), 'signer': signer(c), 'value': len(cm),
                      'strict': len(cm), 'breach': bool(cm), 'first_day': c['ad'] < TEAM_RULE[1] + timedelta(hours=24),
                      'detail': ', '.join(cm) or None})
    for i in items:
        # a breach that holds in every reading: lines also as blocks, words also in A-Z, the signature also as written
        i['robust'] = bool(i['breach'] and i.get('blocks_breach', True) and i.get('ascii_breach', True))
    items.sort(key=lambda i: (i['time'], i['practice'], i['rule']))
    json.dump(rules_out, open(os.path.join(HERE, 'rules85.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump(items, open(os.path.join(HERE, 'items85.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    summary = summarise(items, rules_out, unread, edited, signatures)
    # the history read: rerun on clones reset to these heads to reproduce every count
    summary['heads'] = {r: git(r, 'rev-parse', 'HEAD').decode().strip() for r in list(REPOS.values()) + [MIDDLE]}
    json.dump(summary, open(os.path.join(HERE, 'results85.json'), 'w'), indent=1,
              ensure_ascii=False)


def summarise(items, rules_out, unread, edited, signatures):
    from collections import defaultdict
    cell = defaultdict(lambda: {'bound': 0, 'breach': 0, 'strict_breach': 0, 'max': None, 'blocks_breach': None,
                                'exact_breach': None, 'distinct': 0, 'distinct_breach': 0, 'first_day_breach': 0})
    seen = defaultdict(set)
    for i in items:
        k = (i['rule'], i['practice'])
        c = cell[k]
        c['bound'] += 1
        c['breach'] += i['breach']
        c['first_day_breach'] += i['breach'] and i['first_day']
        if 'blocks' in i:
            c['blocks_breach'] = (c['blocks_breach'] or 0) + i['blocks_breach']
        if 'exact_breach' in i:
            c['exact_breach'] = (c['exact_breach'] or 0) + i['exact_breach']
        if 'ascii' in i:
            c['ascii_breach'] = (c.get('ascii_breach') or 0) + i['ascii_breach']
        c['robust'] = c.get('robust', 0) + i.get('robust', False)
        key = i.get('blob') or (i['commit'] + (i['path'] or ''))
        if key not in seen[k]:
            seen[k].add(key)
            c['distinct'] += 1
            c['distinct_breach'] += i['breach']
        lim = LIMIT.get(i['rule'])
        c['strict_breach'] += (i['strict'] > lim) if lim is not None else bool(i['strict'])
        c['max'] = i['value'] if c['max'] is None else max(c['max'], i['value'])
    table = [{'rule': r, 'practice': p, 'kind': KIND[r], 'limit': LIMIT.get(r), **v}
             for (r, p), v in sorted(cell.items())]
    pairs = [t for t in table if t['bound'] > 0]
    breached_pairs = [t for t in pairs if t['breach'] > 0]
    by_kind = {}
    for k in ('limit', 'prohibition', 'duty'):
        b = sum(t['bound'] for t in table if t['kind'] == k)
        x = sum(t['breach'] for t in table if t['kind'] == k)
        by_kind[k] = {'bound': b, 'breach': x, 'share': x / b if b else None}
    # P134: first seven days against after, per rule and practice
    spans = defaultdict(list)
    for r in rules_out:
        spans[(r['rule'], r['practice'])].append(r)
    early = late = early_b = late_b = 0
    p134_pairs = []
    for (r, p), ss in spans.items():
        for s in ss:
            st = datetime.fromisoformat(s['start'])
            en = datetime.fromisoformat(s['end']) if s['end'] else datetime(2026, 11, 19, 23, 59, tzinfo=timezone.utc)
            if (en - st).days < 14:
                continue
            its = [i for i in items if i['rule'] == r and i['practice'] == p and st <= datetime.fromisoformat(i['time']) < en]
            e = [i for i in its if datetime.fromisoformat(i['time']) < st + timedelta(days=7)]
            l = [i for i in its if datetime.fromisoformat(i['time']) >= st + timedelta(days=7)]
            if len(e) >= 5 and len(l) >= 5:
                p134_pairs.append({'rule': r, 'practice': p, 'early': len(e), 'early_breach': sum(i['breach'] for i in e),
                                   'late': len(l), 'late_breach': sum(i['breach'] for i in l),
                                   'early_not_first_day': sum(1 for i in e if not i['first_day']),
                                   'early_breach_not_first_day': sum(i['breach'] for i in e if not i['first_day'])})
                early += len(e); late += len(l)
                early_b += sum(i['breach'] for i in e); late_b += sum(i['breach'] for i in l)
    er = early_b / early if early else None
    lr = late_b / late if late else None
    lim, pro = by_kind['limit'], by_kind['prohibition']
    if pro['bound'] < 50:
        p133 = 'uninformative'
    elif pro['breach'] == 0:
        p133 = 'held' if lim['breach'] > 0 else 'uninformative'
    else:
        p133 = 'held' if lim['share'] >= 5 * pro['share'] else 'failed'
    if early_b + late_b == 0:
        p134 = 'uninformative'
    else:
        p134 = 'held' if er <= lr else 'failed'
    signers = defaultdict(lambda: {'bound': 0, 'breach': 0})
    for i in items:
        signers[i['signer']]['bound'] += 1
        signers[i['signer']]['breach'] += i['breach']
    return {
        'study': 85, 'session': 283, 'date': '2026-11-19',
        'bound': len(items), 'breach': sum(i['breach'] for i in items),
        'by_practice': {p: {'bound': sum(1 for i in items if i['practice'] == p),
                            'breach': sum(i['breach'] for i in items if i['practice'] == p)}
                        for p in list(REPOS) + ['middle']},
        'by_kind': by_kind, 'by_signer': dict(signers), 'unread_blobs': unread,
        'journal_edits_not_counted': edited, 'signatures': signatures,
        'second_readings': {
            'note': 'Added after the first count, reported beside the codebook reading, never in place of it.',
            'blocks': {k: {'bound': sum(1 for i in items if i['rule'] == k and 'blocks' in i),
                           'breach': sum(i.get('blocks_breach', False) for i in items if i['rule'] == k)}
                       for k in ('bulletin-lines', 'journal-lines', 'score-lines', 'critique-lines')},
            'signature_as_written': {p: {'own_name': sum(1 for i in items if i['rule'] == 'signature' and i['practice'] == p and i.get('own_name')),
                                         'breach': sum(1 for i in items if i['rule'] == 'signature' and i['practice'] == p and i.get('exact_breach')),
                                         'forms': sorted({i['exact_detail'] for i in items if i['rule'] == 'signature' and i['practice'] == p and i.get('exact_breach')})}
                                     for p in REPOS},
            'ascii_words': {k: {'bound': sum(1 for i in items if i['rule'] == k and 'ascii' in i),
                                'breach': sum(i.get('ascii_breach', False) for i in items if i['rule'] == k)}
                            for k in ('bulletin-words', 'journal-words', 'digest-words', 'letter-words')},
            'robust': {'breach': sum(i['robust'] for i in items),
                       'by_rule': {k: sum(1 for i in items if i['rule'] == k and i['robust'])
                                   for k in sorted({i['rule'] for i in items if i['robust']})}},
            'without_first_day': {'bound': sum(1 for i in items if not i['first_day']),
                                  'breach': sum(1 for i in items if i['breach'] and not i['first_day'])},
        },
        'pairs_bound': len(pairs), 'pairs_breached': len(breached_pairs),
        'table': table,
        'p134': {'pairs': p134_pairs, 'early': early, 'early_breach': early_b, 'early_share': er,
                 'late': late, 'late_breach': late_b, 'late_share': lr,
                 'without_first_day': {
                     'early': sum(x['early_not_first_day'] for x in p134_pairs),
                     'early_breach': sum(x['early_breach_not_first_day'] for x in p134_pairs)}},
        'predictions': {
            'P132': {'verdict': 'held' if len(breached_pairs) * 2 >= len(pairs) else 'failed',
                     'value': f'{len(breached_pairs)} of {len(pairs)} pairs'},
            'P133': {'verdict': p133, 'value': {'limit': lim, 'prohibition': pro}},
            'P134': {'verdict': p134, 'value': {'early': er, 'late': lr}},
        },
    }


if __name__ == '__main__':
    main()
