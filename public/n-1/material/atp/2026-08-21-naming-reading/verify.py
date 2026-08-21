#!/usr/bin/env python3
"""Verify the naming document's two new ATP quotations against the granted edition.

Method as at material/atp/2026-08-21-direct-reading/ (record 25): letter-only
normalization (strip everything that is not a-z, lowercase) per the material
repository's README, searched within the text of the cited page only. Pages
carrying no confirmed printed marker are located by offset from the nearest
confirmed marker AND corroborated against the printed running head the
extraction preserves; a page counts as located only where both agree (the
locator extension disclosed at record 25). No text of the edition is committed
beyond the short quoted fragments themselves, which the naming document quotes
with page references — ordinary scholarly citation per the material README and
floor rule 2 as amended.

Run beside a clone of the private material repository:
    python3 verify.py /path/to/material/atp.pages.txt
"""
import json, re, sys

QUOTES = [
    # (cited page, fragment, marker status note)
    (33, "inequalities as remainders or crossings",
     "no confirmed printed marker on this page (pdf 54); located by offset "
     "(54 - 21 = 33) and corroborated by the printed running head "
     "('1914: ONE OR SEVERAL WOLVES? / 33') - both agree"),
    (433, "a zone of recurrence that isolates itself from the remainder of the network",
     "confirmed printed marker [[ATP p. 433]]"),
    (433, "even stricter controls over its relations with that remainder",
     "confirmed printed marker [[ATP p. 433]]"),
    # added in the same session's second pass: the naming document quotes the
    # sentence as one span, so the span is verified as one fragment
    (433, "isolates itself from the remainder of the network, even if in order "
          "to do so it must exert even stricter controls over its relations "
          "with that remainder",
     "confirmed printed marker [[ATP p. 433]]"),
]

def letters(s):
    return re.sub(r'[^a-z]', '', s.lower())

def main(path):
    text = open(path, errors='replace').read()
    lines = text.splitlines()
    markers = [(i, l.strip()) for i, l in enumerate(lines) if re.match(r'\[\[ATP', l)]
    # map: page -> text of that page
    def page_text(page):
        # confirmed marker
        for k, (i, m) in enumerate(markers):
            if m == f'[[ATP p. {page}]]':
                end = markers[k+1][0] if k+1 < len(markers) else len(lines)
                return '\n'.join(lines[i+1:end])
        # unconfirmed: locate by pdf offset (front matter offset 21 or 22)
        for off in (21, 22):
            for k, (i, m) in enumerate(markers):
                if m == f'[[ATP pdf {page + off} — no printed number]]':
                    end = markers[k+1][0] if k+1 < len(markers) else len(lines)
                    body = '\n'.join(lines[i+1:end])
                    # corroborate against the printed running head
                    if str(page) in letters_digits_head(body):
                        return body
        return None
    def letters_digits_head(body):
        head = ' '.join(body.splitlines()[:4])
        return re.sub(r'[^0-9]', ' ', head)
    results = []
    for page, frag, note in QUOTES:
        body = page_text(page)
        if body is None:
            results.append({"page": page, "fragment_length": len(frag),
                            "verdict": "PAGE NOT LOCATED", "marker": note})
            continue
        found = letters(frag) in letters(body)
        results.append({"page": page, "fragment_length": len(frag),
                        "verdict": "on cited page" if found else "NOT FOUND on cited page",
                        "marker": note})
    print(json.dumps(results, indent=2))
    return results

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'atp.pages.txt')
