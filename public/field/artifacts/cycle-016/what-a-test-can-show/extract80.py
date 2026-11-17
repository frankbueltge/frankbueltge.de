"""Study 80: split the body of the International AI Safety Report 2026 into sentences, find their citations,
and select the candidate sentences on evaluation (CODEBOOK80.md, sections Text and Selection).

Usage: python3 -I extract80.py <report.pdf> <out-dir>
Writes <out-dir>/sentences80.json: the candidates with their text (short quotations, Open Government Licence
v3.0) and, for every other body sentence, only its page and citations (no text), so that the report itself is
not copied.
"""
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter

PDF, OUT = sys.argv[1], sys.argv[2]
SHA = 'e2a35f439cafade360e4df4a2f91f217a16174bd1231f97e64f7208ffa93e225'
BODY = range(14, 147)  # PDF pages 14..146: Introduction to Conclusion (the PDF's page n is printed page n)
SECTIONS = [  # start page, label (table of contents)
    (14, 'Introduction'), (16, '1. Background'), (17, '1.1 What is general-purpose AI?'),
    (26, '1.2 Current capabilities'), (32, '1.3 Capabilities by 2030'), (44, '2. Risks'),
    (45, '2.1.1 AI-generated content and criminal activity'), (50, '2.1.2 Influence and manipulation'),
    (57, '2.1.3 Cyberattacks'), (64, '2.1.4 Biological and chemical risks'), (71, '2.2.1 Reliability challenges'),
    (76, '2.2.2 Loss of control'), (84, '2.3.1 Labour market impacts'), (89, '2.3.2 Risks to human autonomy'),
    (96, '3. Risk management'), (97, '3.1 Technical and institutional challenges'),
    (105, '3.2 Risk management practices'), (120, '3.3 Technical safeguards and monitoring'),
    (132, '3.4 Open-weight models'), (138, '3.5 Building societal resilience'), (146, 'Conclusion')]
LIG = {'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl', '­': '', '﻿': ''}
ABBR = ('e.g.', 'i.e.', 'et al.', 'vs.', 'cf.', 'Fig.', 'No.', 'U.S.', 'U.K.', 'approx.', 'Dr.', 'Prof.', 'etc.')
CAND = re.compile(r'evaluat|benchmark|red[- ]?team|uplift (?:stud|trial)|'
                  r'(?:safety|pre-?deployment|third-?party|capability|dangerous[- ]?capability|model) test',
                  re.I)
CITE = re.compile(r'\((\s*\d{1,4}\*?(?:\s*[,;]\s*\d{1,4}\*?)*\s*)\)')
N_REFS = 1451  # the reference list runs from 1 to 1451 (checked in analyse80.py)
END = re.compile(r'[.?!:]["”’)\]]*$')


def section(page):
    lab = SECTIONS[0][1]
    for start, name in SECTIONS:
        if page >= start:
            lab = name
    return lab


def main():
    raw = open(PDF, 'rb').read()
    assert hashlib.sha256(raw).hexdigest() == SHA, 'not the report this study fixed'
    text = subprocess.run(['pdftotext', PDF, '-'], capture_output=True, check=True).stdout.decode('utf-8')
    for a, b in LIG.items():
        text = text.replace(a, b)
    pages = text.split('\f')
    firsts = Counter()
    for p in pages:
        lines = [l.strip() for l in p.split('\n') if l.strip()]
        if lines:
            firsts[lines[0]] += 1
    heads = {l for l, n in firsts.items() if n >= 3}
    # 1. the body as one flow of lines, each with its page; running heads, footers and page numbers out
    flow = []
    for pno in BODY:
        lines = [l.rstrip() for l in pages[pno - 1].split('\n')]
        while lines and not lines[0].strip():
            lines.pop(0)
        if lines and lines[0].strip() in heads:
            lines.pop(0)
        for l in lines:
            if l.strip() == 'International AI Safety Report 2026' or re.fullmatch(r'\s*\d{1,3}\s*', l):
                l = ''
            flow.append((pno, l.strip()))
        flow.append((pno, ''))
    # 2. blocks: text between blank lines; a bullet line ("— ", "• ") opens a block of its own
    blocks, cur = [], []
    for pno, l in flow:
        if not l or re.match(r'[\u2014\u2022] ', l):
            if cur:
                blocks.append(cur); cur = []
            if l:
                cur.append((pno, l[2:].strip()))
            continue
        cur.append((pno, l))
    if cur:
        blocks.append(cur)
    blocks = [(b[0][0], ' '.join(t for _, t in b)) for b in blocks]
    # 3. headings out; a block cut by a column or page end joins the block that continues it
    paras, headings, i = [], 0, 0
    while i < len(blocks):
        pno, t = blocks[i]
        while not END.search(t) and i + 1 < len(blocks) and re.match(r'[a-z(\[,;]', blocks[i + 1][1]):
            i += 1
            t = t + ' ' + blocks[i][1]
        if not END.search(t) and len(t.split()) <= 25:
            headings += 1
        else:
            paras.append((pno, t))
        i += 1
    sentences = []
    for pno, body in paras:
        body = re.sub(r'(\w)- (\w)', lambda m: m.group(1) + '-' + m.group(2), body)  # keep hyphenated words whole
        parts, start = [], 0
        for m in re.finditer(r'[.?!]["\u201d\u2019)\]]*\s+(?=[A-Z0-9"\u201c\u2018(\[])', body):
            chunk = body[start:m.end()]
            if any(chunk.rstrip().endswith(a) for a in ABBR) or re.search(r'\u00a7\s?[\d.]+$', chunk.rstrip()):
                continue
            parts.append(chunk.strip()); start = m.end()
        if body[start:].strip():
            parts.append(body[start:].strip())
        for s in parts:
            words = s.split()
            if len(words) < 6 or sum(1 for w in words if re.fullmatch(r'[a-z][a-z\'-]*[.,;:]?', w)) < 3:
                continue
            refs = []
            for m in CITE.finditer(s):
                g = m.group(1).strip()
                if re.fullmatch(r'\d', g) and re.match(r'\s+[A-Za-z]', s[m.end():]):
                    continue  # an enumeration, "(1) Risks from misuse ... (2) ...", is no citation
                for tok in re.split(r'[,;]', m.group(1)):
                    tok = tok.strip()
                    if tok and int(tok.rstrip('*')) <= N_REFS:  # a year in brackets, e.g. (2026), is no reference
                        refs.append({'n': int(tok.rstrip('*')), 'industry': tok.endswith('*')})
            sentences.append({'page': pno, 'section': section(pno), 'text': s, 'refs': refs,
                              'candidate': bool(CAND.search(s))})
    out = []
    for i, s in enumerate(sentences, 1):
        row = {'id': i, 'page': s['page'], 'section': s['section'], 'candidate': s['candidate'],
               'refs': [f"{r['n']}{'*' if r['industry'] else ''}" for r in s['refs']]}
        if s['candidate']:
            row['text'] = s['text']
        out.append(row)
    res = {
        'what': 'Study 80: body sentences of the International AI Safety Report 2026 (PDF pages 14-146). Candidates '
                'carry their text (Open Government Licence v3.0, (c) Crown owned 2026, attribution: International AI '
                'Safety Report 2026, DSIT 2026/001); other sentences carry only page and citations. A reference with * '
                'is industry-affiliated by the report\'s own mark.',
        'report_sha256': SHA,
        'headings_dropped': headings,
        'running_heads_dropped': sorted(heads),
        'n_sentences': len(out), 'n_candidates': sum(r['candidate'] for r in out),
        'sentences': out,
    }
    json.dump(res, open(f'{OUT}/sentences80.json', 'w'), indent=1, ensure_ascii=False)
    print(res['n_sentences'], 'sentences;', res['n_candidates'], 'candidates;', headings, 'headings dropped')


main()
