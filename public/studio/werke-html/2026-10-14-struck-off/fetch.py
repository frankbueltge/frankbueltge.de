#!/usr/bin/env python3
"""fetch.py — STRUCK OFF. Fetches the keeper's two lists and its notes; commits only a manifest.

JPL's Sentry system lists asteroids with a possible future Earth impact. Its API gives the
standing list (mode S) and the removed list (mode R: designation and minute of removal, nothing
else). Its operational notes page is the only place a reason is written. Raw files go to RAW
(outside the repository, never committed); raw-manifest.json records URL, time and sha256.

    python3 fetch.py [RAW_DIR]
"""
import datetime, hashlib, json, os, sys, urllib.request

RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.environ.get('TMPDIR', '/tmp'), 'struck-off-raw')
SRC = {
    'removed.json': 'https://ssd-api.jpl.nasa.gov/sentry.api?removed=1',
    'current.json': 'https://ssd-api.jpl.nasa.gov/sentry.api',
    'notes.html': 'https://cneos.jpl.nasa.gov/sentry/notes.html',
    'removed-page.html': 'https://cneos.jpl.nasa.gov/sentry/removed.html',
}
# the eight removed objects whose designation is a number or a survey name: their first sighting
SBDB = ['620100', '99942', '410777', '153814', '144898', '6344 P-L', 'P/2005 JQ5', 'P/2003 KV2']

os.makedirs(RAW, exist_ok=True)
man = {'fetched_utc': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'files': {}}
def get(name, url):
    with urllib.request.urlopen(url, timeout=60) as r: b = r.read()
    open(os.path.join(RAW, name), 'wb').write(b)
    man['files'][name] = {'url': url, 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}
for n, u in SRC.items(): get(n, u)
for s in SBDB:
    get('sbdb-' + s.replace('/', '_').replace(' ', '_') + '.json',
        'https://ssd-api.jpl.nasa.gov/sbdb.api?discovery=1&sstr=' + urllib.request.quote(s))
json.dump(man, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'raw-manifest.json'), 'w'), indent=1)
print('fetched', len(man['files']), 'files to', RAW)
