"""Study 78 — reading sheets (session 276). Writes, OUTSIDE this repository, the texts a reader reads to code
Part A (the 37 first reports on a public body's address) and Part B (the 23 on the maker's own address) of
PREDICTIONS78.md. Report texts belong to their authors and are never committed; only the codes are
(coding78.json).

Usage: python3 -I sheet78.py <path to mongodump_full_snapshot/> <output dir>
"""
import csv, json, sys, os

csv.field_size_limit(10**9)
SNAP, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
CUT = 6000


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


os.makedirs(OUT, exist_ok=True)
for part, klass in (('A', 'public body'), ('B', 'maker')):
    out = []
    for i in sorted(inc):
        if rows75[i][2] != klass:
            continue
        r = inc[i]
        fr = first_report(json.loads(r['reports']) if r['reports'] else [])
        out.append('\n'.join([
            f'### {i}',
            f"incident date: {r['date']}   title: {r['title']}",
            f"deployer: {r['Alleged deployer of AI system']}   developer: {r['Alleged developer of AI system']}",
            f"harmed: {r['Alleged harmed or nearly harmed parties']}",
            f"first report: {fr['source_domain']}   published {fr['date_published'][:10]}   by {fr['authors']}",
            f"report title: {fr['title']}",
            '', (fr['text'] or '')[:CUT], '']))
    with open(os.path.join(OUT, f'sheet78-{part}.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print(part, klass, len(out))
