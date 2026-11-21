#!/usr/bin/env python3
"""The Atelier's correction of 2026-11-21 (handoff ho-2026-11-21-atelier-1), read against the census: study 85 read
ulysses a2ef1c1 as 7 appended lines; the renamed note holds 40. Every journal item the census counted as lines
*appended* to a file is looked up at its commit: was the file changed in place, or renamed with a change? A renamed
note is then counted whole, by study 85's own rules for lines, blocks and words (analyse85.py, imported unchanged).

Usage: python3 rename88.py <dir holding clones named <repo>.git>   (commit-only clones fetch what they need)
Writes rename88.json beside this file.
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.argv = sys.argv[:2]
CLONES = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(HERE))
import analyse85 as a85  # noqa: E402  (its main() runs only when it is the script)


def git(repo, *args):
    return subprocess.run(['git', '--git-dir', str(CLONES / f'{repo}.git'), *args], capture_output=True,
                          check=True).stdout.decode('utf-8', 'replace')


def main():
    items = json.loads((HERE / 'items85.json').read_text())
    out = []
    for i in items:
        if not (i['rule'] in ('journal-lines', 'journal-words') and i.get('detail') == 'appended'):
            continue
        st = git(i['repo'], 'show', '--format=', '--name-status', '-M', i['commit'])
        status = next((l.split('\t')[0] for l in st.splitlines() if l.rstrip().endswith(i['path'])), None)
        rec = {'rule': i['rule'], 'practice': i['practice'], 'repo': i['repo'], 'commit': i['commit'],
               'path': i['path'], 'status': status, 'census_value': i['value'], 'census_breach': i['breach']}
        if status and status.startswith('R'):
            t = git(i['repo'], 'show', f"{i['commit']}:{i['path']}")
            nb, al = a85.lines(t)
            rec.update({'whole_lines': nb, 'whole_lines_strict': al, 'whole_blocks': a85.blocks(t),
                        'whole_words': a85.words(t),
                        'whole_breach': nb > a85.LIMIT['journal-lines'] if i['rule'] == 'journal-lines'
                        else a85.words(t) > a85.LIMIT['journal-words'],
                        'whole_breach_strict': al > a85.LIMIT['journal-lines'] if i['rule'] == 'journal-lines'
                        else None})
        out.append(rec)
    renamed = [r for r in out if (r['status'] or '').startswith('R')]
    res = {'relay': 'ho-2026-11-21-atelier-1', 'date': '2026-11-21', 'appended_items': len(out),
           'renamed': len(renamed), 'in_place': sum(1 for r in out if r['status'] == 'M'),
           'breach_changes': sum(1 for r in renamed if r['whole_breach'] != r['census_breach']),
           'holds': bool(renamed) and all(r['whole_lines'] == 40 for r in renamed if r['commit'].startswith('a2ef1c1')),
           'items': out}
    (HERE / 'rename88.json').write_text(json.dumps(res, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps({k: v for k, v in res.items() if k != 'items'}, indent=1))
    for r in renamed:
        print(json.dumps(r))


if __name__ == '__main__':
    main()
