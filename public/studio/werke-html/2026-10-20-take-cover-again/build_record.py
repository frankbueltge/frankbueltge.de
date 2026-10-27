"""TAKE COVER, AGAIN, increment 4: the record whole. Builds record.js / record.json for the map.

    python3 -I build_record.py PLATE3_JS

PLATE3_JS is the Atelier's plate3.js (ulysses repository, artifacts/cycle-009/the-wolfs-ledger/), fetched
beside the raw files and never committed here; its SHA-256 is written into record.json.

Conventions (fixed before reading the results):
- A county's *run* at a moment is the number of empty warnings in a row in its sequence (data.js), counted
  from its last met warning, among warnings that have *ended* by then (issue + issued minutes). The
  record's answer comes when a warning ends; a met one sets the run to zero.
- Each county is matched to the map by its UGC code: state FIPS + the three-digit county number. A code
  that has no shape on the map is counted and listed, never placed.
- The dead: every tornado of the final database that killed (toll.js). Its *run before* is read in the
  first of its listed counties whose sequence holds a warning that stood over it (toll.js `wt`): the run
  of empty warnings there directly before the first such warning. A tornado no warning stood over has no
  run (-1); one whose covering warning is in none of its listed counties is counted apart (-2).
- The Atelier's case (plate IV of The Wolf's Ledger, built from its plate III tags): a warning whose own
  words said OBSERVED (classes O, OC, CAT) and that neither the office's verification nor the final
  database fills. plate3.js keeps per-office sequences only for offices with 100 or more warnings of
  2015-2024, keyed by issue minute; a sequence row is joined to this work's warning of the same office and
  issue minute, and a key held by two warnings here is left out and counted.
"""
import json, sys, pathlib, collections, hashlib

HERE = pathlib.Path(__file__).parent
load = lambda p, pre: json.loads(pathlib.Path(p).read_text().strip()[len(pre):].rstrip(';'))
D = load(HERE / 'data.js', 'window.TCA=')
X = load(HERE / 'toll.js', 'window.TCA_TOLL=')
topo = load(HERE / 'vendor' / 'counties-10m.js', 'window.TCA_TOPO=')
P3 = load(sys.argv[1], 'window.P3=')

FIPS = dict(AL='01', AK='02', AZ='04', AR='05', CA='06', CO='08', CT='09', DE='10', DC='11', FL='12', GA='13',
            HI='15', ID='16', IL='17', IN='18', IA='19', KS='20', KY='21', LA='22', ME='23', MD='24', MA='25',
            MI='26', MN='27', MS='28', MO='29', MT='30', NE='31', NV='32', NH='33', NJ='34', NM='35', NY='36',
            NC='37', ND='38', OH='39', OK='40', OR='41', PA='42', RI='44', SC='45', SD='46', TN='47', TX='48',
            UT='49', VT='50', VA='51', WA='53', WV='54', WI='55', WY='56', PR='72', GU='66', VI='78', AS='60')
shapes = {g['id'] for g in topo['objects']['counties']['geometries']}
fips, unplaced = [], []
for ugc, name, _ in D['counties']:
    f = FIPS.get(ugc[:2], '??') + ugc[3:]
    if f in shapes:
        fips.append(f)
    else:
        fips.append(None); unplaced.append(ugc + ' ' + name)

end = [i + d for i, d in zip(D['issue'], D['dur'])]
met = D['met']
# position of each warning in each county's sequence, and the run directly before it there
pos = collections.defaultdict(dict)
run_before = {}
for c, (_, _, seq) in enumerate(D['counties']):
    r = 0
    for p, w in enumerate(seq):
        pos[c][w] = p
        run_before[(c, w)] = r
        r = 0 if met[w] else r + 1
cov = collections.defaultdict(list)        # tornado -> warnings that stood over it
for w, ks in X['wt'].items():
    for k in ks:
        cov[k].append(int(w))
dead, odd = [], 0
for k, t in enumerate(X['T']):
    if not t[5]:
        continue
    run, place = -1, (t[7][0] if t[7] else -1)
    if k in cov:
        run = -2
        for c in t[7]:
            ws = sorted((pos[c][w], w) for w in cov[k] if w in pos[c])
            if ws:
                run, place = run_before[(c, ws[0][1])], c
                break
        if run == -2:
            odd += 1
            w0 = min(cov[k], key=lambda w: (D['issue'][w], w))
            run, place = min((run_before[(c, w0)], c) for c in pos if w0 in pos[c])
    dead.append([t[0], t[5], t[1], place, run])

# the Atelier's OBSERVED warnings that no record fills
key = collections.defaultdict(list)
for i, (o, m) in enumerate(zip(D['wfo'], D['issue'])):
    key[(D['wfos'][o], m)].append(i)
obs, obs_rows, ambiguous, unmatched, disagree = [], 0, 0, 0, 0
for wfo, seq in P3['seq'].items():
    for m, code in seq:
        cls, h, l = code >> 2, (code >> 1) & 1, code & 1
        if P3['order'][cls] not in ('O', 'OC', 'CAT') or h or l:
            continue
        obs_rows += 1
        ws = key.get((wfo, m), [])
        if len(ws) != 1:
            ambiguous += len(ws) > 1; unmatched += not ws
            continue
        w = ws[0]
        disagree += bool(met[w]) or bool(X['wt'].get(str(w)))
        if not met[w] and not X['wt'].get(str(w)):
            obs.append(w)

empty_entries = sum(1 for _, _, s in D['counties'] for w in s if not met[w])
dark_minutes = sum(D['dur'][w] for _, _, s in D['counties'] for w in s if not met[w])
# the map's state: each county's warnings taken in order of their end (ties by warning index), as the page does
final_run, longest = [], []
for _, _, s in D['counties']:
    r = mx = 0
    for w in sorted(s, key=lambda w: (end[w], w)):
        r = 0 if met[w] else r + 1; mx = max(mx, r)
    final_run.append(r); longest.append(mx)
by_run = collections.Counter()
for d in dead:
    by_run['none' if d[4] == -1 else '0' if d[4] == 0 else '1-2' if d[4] <= 2 else '3-9' if d[4] <= 9 else '10+'] += d[1]
out = {
    'fips': fips, 'longest': longest, 'dead': dead, 'observed': sorted(obs),
    'summary': {
        'plate3_sha256': hashlib.sha256(pathlib.Path(sys.argv[1]).read_bytes()).hexdigest(),
        'counties': len(fips), 'unplaced': unplaced,
        'county_entries_empty': empty_entries, 'county_minutes_issued_empty': dark_minutes,
        'deadly_tornadoes': len(dead), 'dead': sum(d[1] for d in dead), 'dead_by_run_before': dict(by_run),
        'deadly_run_read_in_the_warnings_counties': odd,
        'longest_run_anywhere': max(longest),
        'longest_run_county': D['counties'][longest.index(max(longest))][1],
        'counties_in_a_run_of_3_or_more_at_the_end': sum(r >= 3 for r in final_run),
        'counties_in_a_run_of_10_or_more_at_the_end': sum(r >= 10 for r in final_run),
        'atelier_observed_rows_unbacked_in_plate3_seq': obs_rows,
        'atelier_observed_joined_unbacked_here': len(obs),
        'atelier_observed_unmatched': unmatched, 'atelier_observed_ambiguous': ambiguous,
        'atelier_observed_backed_here_though_unbacked_there': disagree,
    }}
assert len(fips) == len(D['counties']) and sum(d[1] for d in dead) == sum(t[5] for t in X['T'])
(HERE / 'record.json').write_text(json.dumps(out['summary'], indent=1) + '\n')
(HERE / 'record.js').write_text('window.TCA_RECORD=' + json.dumps(out, separators=(',', ':')) + ';\n')
print(json.dumps(out['summary'], indent=1))
