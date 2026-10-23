"""Coda II (session 194, 2026-10-22): the people under each warning.

Takes up the Field's handoff ho-2026-10-21-field-4: warnings34.tsv from field-research at
b20450c (artifacts/cycle-009/after-the-empty-warnings/data/), 18,403 tornado warnings 2016-2023 in
the Atelier's 72 offices, with the people under each estimated by the Field as the polygon's area
times its counties' 2010 density (study 34). An estimate, and the page says so.

Join: the Field's office and issue minute (UTC) against this work's wfo and issue minute. Where two of
this work's warnings share both, the one whose minutes lie nearest the Field's is taken; a tie is
left unjoined. Nothing else is fitted.

  python3 -I build_people.py <warnings34.tsv>
writes people.js (window.TCA_PEOPLE: the warning index and the people, rounded to the nearest 10)
and people.json (the counts and the person-hours, for the page and the record).
"""
import json, sys, datetime as dt, os

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'data.js')).read()
D = json.loads(src[src.index('{'):src.rindex('}') + 1])
t0 = dt.datetime(2008, 1, 1, tzinfo=dt.timezone.utc)

key = {}
for i, (iss, w) in enumerate(zip(D['issue'], D['wfo'])):
    key.setdefault((D['wfos'][w], iss), []).append(i)

rows = [l.rstrip('\n').split('\t') for l in open(sys.argv[1])]
head, rows = rows[0], rows[1:]
c = {h: k for k, h in enumerate(head)}
idx, ppl = [], []
seen = set()
unjoined = tie = 0
for r in rows:
    t = dt.datetime.strptime(r[c['issued']], '%Y-%m-%d %H:%M').replace(tzinfo=dt.timezone.utc)
    m = int((t - t0).total_seconds() // 60)
    g = key.get((r[c['office']], m))
    if not g:
        unjoined += 1; continue
    mins = float(r[c['minutes']])
    g = sorted(g, key=lambda i: abs(D['dur'][i] - mins))
    if len(g) > 1 and abs(D['dur'][g[0]] - mins) == abs(D['dur'][g[1]] - mins):
        tie += 1; continue
    i = g[0]
    if i in seen:  # two of the Field's polygons on one of ours (its declared deviation): keep the first
        continue
    seen.add(i)
    idx.append(i); ppl.append(int(float(r[c['people']]) / 10 + 0.5) * 10)  # half up, as the page's second path rounds

order = sorted(range(len(idx)), key=lambda k: idx[k])
idx = [idx[k] for k in order]; ppl = [ppl[k] for k in order]
P = dict(zip(idx, ppl))
empty = [i for i in idx if not D['met'][i]]
met = [i for i in idx if D['met'][i]]
ph = lambda L: sum(P[i] * D['dur'][i] for i in L) / 60
srt = sorted(ppl)
out = {
    'source': 'field-research b20450c1be0d650334f389000322c374c0d83d1e, artifacts/cycle-009/after-the-empty-warnings/data/warnings34.tsv (study 34; people = polygon area x its counties\' 2010 density, an estimate)',
    'field_rows': len(rows), 'joined': len(idx), 'unjoined': unjoined, 'ties_left_out': tie,
    'years': '2016-2023', 'offices': len({D['wfos'][D['wfo'][i]] for i in idx}),
    'empty': len(empty), 'met': len(met),
    'median_people': srt[len(srt) // 2],
    'people_warned_empty': sum(P[i] for i in empty),
    'person_hours_empty': round(ph(empty)),
    'person_hours_met': round(ph(met)),
    'person_hours_empty_share': round(ph(empty) / (ph(empty) + ph(met)), 4),
}
json.dump(out, open(os.path.join(here, 'people.json'), 'w'), indent=1)
open(os.path.join(here, 'people.js'), 'w').write(
    'window.TCA_PEOPLE=' + json.dumps({'i': idx, 'p': ppl, 'sum': out}, separators=(',', ':')) + ';\n')
print(json.dumps(out, indent=1))
