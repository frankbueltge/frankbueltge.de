"""Check 92 -- look up every quoted passage of a trace the check added, word for word, in the page as fetched.

Usage: python3 check92.py <fetched-dir>
  <fetched-dir> holds the pages as fetched on 2026-11-23: ec-panel.html (the Commission's page), assembly.pdf and
  govops.pdf, each with the text pdftotext made of it (assembly.txt without -layout, the slides being in
  columns; govops.txt with -layout).
Writes quotes92.json beside this script, with each file's sha256. No network, no model.
"""
import hashlib, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build92 import NEW_TRACES  # noqa: E402

FILES = {'EU4': ('ec-panel.html', 'ec-panel.html'), 'apcp.assembly': ('assembly.pdf', 'assembly.txt'),
         'govops': ('govops.pdf', 'govops.txt')}


def norm(s):
    s = s.replace('’', "'").replace('“', '"').replace('”', '"').replace(' ', ' ')
    return re.sub(r'\s+', ' ', s).strip()


def text(path):
    t = open(path, encoding='utf-8', errors='replace').read()
    if path.endswith('.html'):
        t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
        t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
    return norm(t)


def main():
    d = sys.argv[1]
    items = []
    for t in NEW_TRACES:
        key = 'EU4' if t['signal'] == 'EU4' else ('apcp.assembly' if 'assembly' in t['url'] else 'govops')
        raw, txt = FILES[key]
        found = norm(t['quote']) in text(os.path.join(d, txt))
        items.append({'signal': t['signal'], 'url': t['url'], 'quote': t['quote'], 'found': found, 'file': raw,
                      'sha256': hashlib.sha256(open(os.path.join(d, raw), 'rb').read()).hexdigest()})
        print(t['signal'], found, t['url'][:80])
    json.dump({'what': 'Check 92: every quoted passage of a trace the check added, looked up word for word in the '
                       'page as fetched on 2026-11-23 (check92.py).', 'items': items},
              open(os.path.join(HERE, 'quotes92.json'), 'w'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
