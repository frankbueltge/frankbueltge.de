#!/usr/bin/env python3
"""Study 86, part A: candidate sightings of study 85's breaches, retrieved by the rule fixed in CODEBOOK86.md.

Usage:
    git clone https://github.com/frankbueltge/<repo>.git <dir>/<repo>   (field-research, ulysses, studio, research-ecology)
    python3 seen86.py <dir> <out.jsonl>

Writes every candidate line, with its full text, to <out.jsonl> (a working file, not committed: old lines of the house's
record are not republished here), and candidates86.json beside this file: one record per candidate, with its commit,
path, signer, time, the rules it is a candidate for and the matched words, but not the line itself. Codes are added by
reading (codes86.json); scores86.py joins them. Standard library only.
"""
import json, os, re, subprocess, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CLONES, OUT = sys.argv[1], sys.argv[2]
REPOS = {'field-research': 'field', 'ulysses': 'atelier', 'studio': 'studio', 'research-ecology': 'middle'}
CENSUS = datetime(2026, 11, 19, 22, 29, 21, tzinfo=timezone.utc)   # field-research a26d1dce, study 85 published

KIND = {
    'bulletin': re.compile(r'bulletin', re.I),
    'journal': re.compile(r'journal', re.I),
    'score': re.compile(r'\bscore\b|SCORE\.md', re.I),
    'critique': re.compile(r'critique|CRITIQUE\.md', re.I),
    'digest': re.compile(r'digest|STATE-OF-THE-FIELD|state of the field', re.I),
    'subject': re.compile(r'subject|commit message', re.I),
}
RULES = {  # rule -> (kind word, limit, unit)
    'bulletin-lines': ('bulletin', 40, 'lines'), 'bulletin-words': ('bulletin', 400, 'words'),
    'journal-lines': ('journal', 40, 'lines'), 'journal-words': ('journal', 150, 'words'),
    'score-lines': ('score', 20, 'lines'), 'critique-lines': ('critique', 20, 'lines'),
    'digest-words': ('digest', 2500, 'words'), 'subject-chars': ('subject', 100, 'characters'),
}
NUM_UNIT = re.compile(r'\b(\d{1,3}(?:,\d{3})+|\d+)\s+(lines?|words?|characters?|chars?)\b', re.I)
OVER = re.compile(r'\bover\s+(?:\S+\s+){0,2}?(?:cap|limit|ceiling|maximum)s?\b|\bexceed\w*|\bbeyond\s+(?:its|the|their)\s+'
                  r'(?:cap|limit)\b|\btoo long\b|\blonger than\b|\btrim\w*|\bcut\s+(?:to|down)\b|\bshorten\w*|\bbreach\w*',
                  re.I)
UNIT = {'line': 'lines', 'lines': 'lines', 'word': 'words', 'words': 'words', 'character': 'characters',
        'characters': 'characters', 'char': 'characters', 'chars': 'characters'}


def git(repo, *a):
    return subprocess.run(['git', '-C', os.path.join(CLONES, repo)] + list(a), capture_output=True, check=True).stdout


def signer(repo, an):
    if re.match(r'^Frank B(ü|ue)ltge$', an):
        return 'architect-name'
    if an == 'Atelier' and repo == 'ulysses':
        return 'workflow'          # the Atelier's lander (research-auto-land.yml), study 86's correction of 85
    if re.match(r'^Meridian \(autoloop\)$', an):
        return 'workflow'          # field-research autoloop.yml
    if re.match(r'^(Meridian|Ulysses|Assay|Ensemble)(?![-\w])', an):
        return {'field-research': 'field', 'ulysses': 'atelier', 'studio': 'studio'}.get(repo, 'practice-elsewhere')
    if an in ('Middle Relay', 'Middle Scribe'):
        return 'middle'
    return 'workflow'


def match(text):
    """Rules this text is a candidate for, with the words that matched."""
    out = {}
    over = [m.group(0) for m in OVER.finditer(text)]
    nums = [(int(m.group(1).replace(',', '')), UNIT[m.group(2).lower()], m.group(0)) for m in NUM_UNIT.finditer(text)]
    for rule, (kind, lim, unit) in RULES.items():
        if not KIND[kind].search(text):
            continue
        hits = [s for n, u, s in nums if u == unit and n > lim] + over
        if hits:
            out[rule] = hits[:6]
    return out


def main():
    first = min(datetime.fromisoformat(i['time']) for i in json.load(open(os.path.join(HERE, 'items85.json')))
                if i['breach'])
    cands, full = [], open(OUT, 'w', encoding='utf-8')
    for repo, prac in REPOS.items():
        # commit messages
        log = git(repo, 'log', '--no-merges', '--format=%x1e%H%x1f%an%x1f%aI%x1f%B').decode('utf-8', 'replace')
        meta = {}
        for rec in log.split('\x1e')[1:]:
            h, an, ad, body = rec.split('\x1f', 3)
            t = datetime.fromisoformat(ad)
            meta[h] = (an, ad)
            if not (first <= t <= CENSUS):
                continue
            m = match(body)
            if m:
                cands.append({'repo': repo, 'commit': h, 'author': an, 'signer': signer(repo, an), 'time': ad,
                              'path': '(commit message)', 'n': 0, 'rules': m, 'text': body.strip()})
        # added lines of Markdown files
        raw = git(repo, 'log', '--no-merges', '-p', '-U0', '--no-color', '--format=%x1e%H', '--', '*.md')
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
            text = line[1:]
            m = match(text)
            if m:
                cands.append({'repo': repo, 'commit': h, 'author': an, 'signer': signer(repo, an), 'time': ad,
                              'path': path, 'n': n, 'rules': m, 'text': text})
    cands.sort(key=lambda c: (c['time'], c['repo'], c['path'], c['n']))
    for i, c in enumerate(cands):
        c['id'] = i + 1
        full.write(json.dumps(c, ensure_ascii=False) + '\n')
    pub = [{k: v for k, v in c.items() if k != 'text'} for c in cands]
    json.dump({'study': 86, 'census': CENSUS.isoformat(), 'candidates': pub},
              open(os.path.join(HERE, 'candidates86.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {}
    for c in cands:
        for r in c['rules']:
            by[r] = by.get(r, 0) + 1
    print(len(cands), 'candidate lines;', by)


if __name__ == '__main__':
    main()
