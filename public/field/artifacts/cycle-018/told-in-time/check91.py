"""Study 91 -- check every quotation of moved91.py against the page as fetched, and ask the web archive for each trace.

Usage: python3 check91.py <fetched-dir> [--no-archive]
  <fetched-dir>  the session's fetched copies (never committed): <md5(url + newline)[:8]>.bin or .html for single
                 pages, haip/<id>.html for the G7 reports
Writes quotes91.json and archive91.json beside this script. The archive is asked through its availability service
(archive.org/wayback/available) for the capture closest to 2026-11-21; a capture after 2026-11-21 is not counted.
"""
import hashlib, html, json, os, re, subprocess, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from moved91 import TRACES, CASES  # noqa: E402

FETCHED = sys.argv[1]


def local(url):
    m = re.match(r'https://oecd\.ai/en/transparency/reports/(\d+)$', url)
    if m:
        return os.path.join(FETCHED, 'haip', m.group(1) + '.html')
    k = hashlib.md5((url + '\n').encode()).hexdigest()[:8]
    for ext in ('.bin', '.html'):
        p = os.path.join(FETCHED, k + ext)
        if os.path.exists(p):
            return p
    return None


def text(path):
    raw = open(path, 'rb').read()
    if raw[:4] == b'%PDF':
        out = subprocess.run(['pdftotext', path, '-'], capture_output=True).stdout.decode('utf-8', 'replace')
    else:
        t = raw.decode('utf-8', 'replace')
        t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
        out = html.unescape(re.sub(r'<[^>]+>', ' ', t))
    return raw, norm(out)


def norm(s):
    s = s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    s = s.replace('–', '-').replace('—', '-').replace('​', '').replace('\xa0', ' ')
    s = s.replace('ﬁ', 'fi').replace('ﬂ', 'fl')
    for z in ('⁠', '‌', '‍', '﻿'):
        s = s.replace(z, '')
    s = re.sub(r'\s+', ' ', s)
    return re.sub(r' ([,.:;])', r'\1', s).strip()


def items():
    for sid, t in TRACES.items():
        for tr in t['traces']:
            yield sid, tr['url'], tr['quote']
    for c in CASES:
        for key in ('began_src', 'ended_src'):
            yield c['id'], c[key][0], c[key][1]
        for key in ('noticed', 'first_public', 'maker_knew', 'maker_public', 'precursor', 'report_sent', 'maker_scope'):
            if isinstance(c.get(key), dict):
                yield c['id'], c[key]['src'][0], c[key]['src'][1]
        for b in c['body']:
            yield c['id'], b['src'][0], b['src'][1]


def wayback(url):
    q = 'https://archive.org/wayback/available?' + urllib.parse.urlencode({'url': url, 'timestamp': '20261121'})
    empty, err = 0, None
    for attempt in range(4):   # the service sometimes answers empty for an address it holds: an empty answer is
        try:                   # asked again, and only an answer empty every time is coded as no capture
            with urllib.request.urlopen(q, timeout=40) as r:
                d = json.loads(r.read())
            snap = d.get('archived_snapshots', {}).get('closest')
            if snap:
                ts = snap['timestamp']
                return {'captured': ts <= '20261121235959', 'closest': ts, 'snapshot': snap['url'], 'asked': attempt + 1}
            empty += 1
        except Exception as e:  # noqa: BLE001 -- a failed lookup is recorded, never guessed
            err = str(e)[:120]
        time.sleep(4 * (attempt + 1))
    if empty:
        return {'captured': False, 'closest': None, 'asked': 4, 'empty_answers': empty}
    return {'captured': None, 'error': err}


def main():
    found, rows, hashes = 0, [], {}
    for sid, url, quote in items():
        p = local(url)
        if not p:
            rows.append({'item': sid, 'url': url, 'found': False, 'why': 'no fetched copy'})
            continue
        raw, t = text(p)
        hashes[url] = hashlib.sha256(raw).hexdigest()
        ok = norm(quote) in t
        found += ok
        rows.append({'item': sid, 'url': url, 'found': ok})
    json.dump({'what': 'Every quotation of moved91.py looked up in the page as fetched on 2026-11-22 (check91.py).',
               'items': rows, 'found': found, 'of': len(rows), 'sha256': hashes},
              open(os.path.join(HERE, 'quotes91.json'), 'w'), indent=1)
    print(f'quotes found {found} of {len(rows)}')
    for r in rows:
        if not r['found']:
            print('  NOT FOUND', r['item'], r['url'])
    if '--no-archive' in sys.argv:
        return
    urls = []
    for sid, t in TRACES.items():
        urls += [(sid, tr['url']) for tr in t['traces']]
    for c in CASES:
        urls.append((c['id'], c['first_public']['src'][0]))
    arch = []
    for sid, u in urls:
        w = wayback(u)
        arch.append({'item': sid, 'url': u, **w})
        print(sid, w.get('captured'), w.get('closest'), u[:80])
        time.sleep(4)   # the service answers empty when asked too fast
    json.dump({'what': 'For every counted trace, the web archive capture closest to 2026-11-21, asked on 2026-11-22 '
                       '(check91.py); captured means a capture on or before 2026-11-21.', 'items': arch},
              open(os.path.join(HERE, 'archive91.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
