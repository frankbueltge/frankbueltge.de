"""Build the evidence for *Halley's Comet and the Clock* (cycle 008, session 1).

Input: the keeper's own timeline page, fetched 2026-10-15
  https://thebulletin.org/doomsday-clock/timeline/   (sha256 in sources.json; not committed)
Usage: python3 -I build.py <timeline.html>
Writes data.js (for the page) and results.json (every number the page states).
"""
import hashlib, html, json, math, re, sys
from pathlib import Path

here = Path(__file__).resolve().parent
src = Path(sys.argv[1]).read_bytes()
t = src.decode('utf8')

WORDS = {'TWO AND A HALF': 2.5}
def seconds(phrase):
    p = phrase.upper().replace('STILL ', '')
    m = re.match(r'IT IS (.+?) (MINUTES|SECONDS) TO MIDNIGHT', p)
    n = WORDS.get(m.group(1).replace('2 AND A HALF', 'TWO AND A HALF'))
    if n is None:
        n = float(m.group(1))
    return int(round(n * (60 if m.group(2) == 'MINUTES' else 1)))

def plain(s):
    s = re.sub(r'<(script|style)\b.*?</\1>', ' ', s, flags=re.S)
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', s)).split())

# Each setting on the page is an "IT IS [STILL] N MINUTES|SECONDS TO MIDNIGHT" panel; its year is the
# last year label before it, and its first sentence follows it.
rows = {}
for m in re.finditer(r'IT IS (STILL )?[0-9A-Z ]+? TO MIDNIGHT', t):
    years = re.findall(r'(?<![0-9])(19[4-9][0-9]|20[0-2][0-9])(?![0-9])', plain(t[max(0, m.start() - 3000):m.start()]))
    year = int(years[-1])
    after = plain(t[m.end():m.end() + 1200])
    first = re.split(r'(?<=[.!?”"])\s', after, maxsplit=1)[0] if after and not after.startswith('<') else ''
    if year == 2022 and year in rows:      # the page shows 2021 and 2022 panels both after the 2022 label
        year = 2021
    rows.setdefault(year, {'year': year, 'seconds': seconds(m.group(0)), 'still': bool(m.group(1)),
                           'first_sentence': first[:240]})
settings = [rows[y] for y in sorted(rows)]
moves = [s for s in settings if not s['still']]
for a, b in zip(moves, moves[1:]):
    b['delta'] = b['seconds'] - a['seconds']       # > 0: the hand moved back, away from midnight
back = [s for s in moves if s.get('delta', 0) > 0]
fwd = [s for s in moves if s.get('delta', 0) < 0]

# The record of the danger itself: no nuclear weapon used in war in 1947-2025 (79 whole years).
# Exact one-sided 95% upper bound on a constant yearly rate of arrival, given 0 arrivals in N years.
N = 2025 - 1947 + 1
q95 = 1 - 0.05 ** (1 / N)
# Worlds (p = yearly danger without the warning, e = share of it the heeded warning removes) are
# consistent with the quiet record exactly when p*(1-e) <= q95. Area of that set in the unit square:
area = q95 * (1 + math.log(1 / q95))
need_e = {p: 1 - q95 / p for p in (0.1, 0.25, 0.5, 0.9)}

results = {
    'source_sha256': hashlib.sha256(src).hexdigest(),
    'settings': len(settings), 'moves': len(moves), 'still': len(settings) - len(moves),
    'moves_back': len(back), 'moves_forward': len(fwd),
    'first_year': settings[0]['year'], 'last_year': settings[-1]['year'],
    'farthest': max(settings, key=lambda s: s['seconds'])['year'],
    'quiet_years': N, 'q95_upper_rate': round(q95, 5),
    'consistent_area_share': round(area, 4),
    'heeded_needs_e_at_least': {str(k): round(v, 4) for k, v in need_e.items()},
    # numbers written as a probability anywhere in the page's text (e.g. '10 percent', '5%')
    'percent_figures_on_page': len(re.findall(r'\d+(?:\.\d+)?\s*(?:%|percent)', plain(t))),
    'back_moves': [s['year'] for s in back],
    'page_1990_panel_quotes_2010': settings[[x['year'] for x in settings].index(1990)]['first_sentence'] == settings[[x['year'] for x in settings].index(2010)]['first_sentence'],
}
(here / 'results.json').write_text(json.dumps(results, indent=1) + '\n')
(here / 'data.js').write_text('// built by build.py from the keeper\'s timeline page; do not edit\n'
                              'const SETTINGS = ' + json.dumps(settings, ensure_ascii=False) + ';\n'
                              'const RESULTS = ' + json.dumps(results) + ';\n')
print(json.dumps(results, indent=1))
for s in settings:
    print(s['year'], s['seconds'], s.get('delta', ''), 'still' if s['still'] else '', s['first_sentence'][:90])
