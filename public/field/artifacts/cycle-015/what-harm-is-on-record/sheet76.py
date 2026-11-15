"""Study 76 — reading sheets (session 274). Writes, OUTSIDE this repository, the texts a person reads to code
Part A and Part B of PREDICTIONS76.md. Report texts belong to their authors and are never committed; only the
codes are (coding76.json).

Usage: python3 -I sheet76.py <path to mongodump_full_snapshot/> <output dir>
"""
import csv, json, sys, os, re

csv.field_size_limit(10**9)
SNAP, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


inc = {int(r['incident_id']): r for r in rows('incidents.csv')}
rep = {}
for r in rows('reports.csv'):
    try:
        rep[int(r['report_number'])] = r
    except ValueError:
        pass
D = json.loads(open(os.path.join(HERE, 'data75.js')).read().split('=', 1)[1].rstrip(';\n'))
rows75 = {x[0]: x for x in D['rows']}


def first_report(nums):
    cand = [rep[n] for n in nums if n in rep]
    def key(r):
        try:
            e = float(r['epoch_date_published'])
        except ValueError:
            e = None
        return (e is None, e if e is not None else 0, int(r['report_number']))
    return sorted(cand, key=key)[0] if cand else None


def clean(t, n):
    t = re.sub(r'\s+', ' ', t or '').strip()
    return t[:n]


a, b = [], []
for i, r in sorted(inc.items()):
    nums = json.loads(r['reports']) if r['reports'] else []
    harmed = r.get('Alleged harmed or nearly harmed parties') or '[]'
    if rows75.get(i) and rows75[i][2] == 'self-published':
        fr = first_report(nums)
        a.append(f"### {i} | report {fr['report_number']} | {fr['source_domain']} | authors {fr['authors']}\n"
                 f"INCIDENT: {r['title']}\nHARMED: {harmed}\nTITLE: {fr['title']}\nTEXT: {clean(fr['text'], 1400)}\n")
    resp = [rep[n] for n in nums if n in rep and 'response' in (rep[n]['tags'] or '')]
    if resp:
        lines = [f"### {i} | MIT domain {rows75[i][3]} | {r['title']}\nDEPLOYER {r['Alleged deployer of AI system']} "
                 f"DEVELOPER {r['Alleged developer of AI system']}"]
        for x in resp:
            lines.append(f"  - [{x['report_number']}] {x['source_domain']} | {x['date_published'][:10]} | {x['title']}\n"
                         f"    {clean(x["text"], 200)}")
        b.append('\n'.join(lines) + '\n')
open(os.path.join(OUT, 'sheetA.txt'), 'w').write('\n'.join(a))
open(os.path.join(OUT, 'sheetB.txt'), 'w').write('\n'.join(b))
print(len(a), 'self-published first reports;', len(b), 'incidents with a response report')
