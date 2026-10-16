"""Project 9 session 3: the rules registered in SESSION3.md, as functions (tested in session3_test.py before any parsing).

Applied to `pdftotext` (non-layout) output of one Minor Planet Circulars batch."""
import re

# a section heading: a whole line in capitals (letters, spaces and light punctuation), at least one word of four letters
HEAD = re.compile(r"^[A-Z][A-Z ,.'/&()-]{4,}[A-Z)]\s*$", re.M)
WORD4 = re.compile(r"[A-Z]{4,}")
NEW = re.compile(r"^NEW NAMES? OF (?:A )?MINOR PLANETS?$")
CORR = re.compile(r"ERRAT|CORRIG|CORRECT\w* CITATION|REVISED|CITATION")
REFERS = re.compile(r"MPC\s+\d{3,6}|replac|supersed|correct(?:ed|s|ion)? citation|revised citation", re.I)
MPCREF = re.compile(r"MPC\s+(\d{3,6})")


def headings(text):
    return [(m.start(), m.group(0).strip()) for m in HEAD.finditer(text) if WORD4.search(m.group(0))]


def entries(text, number):
    """Start offsets of lines that open with '(number)' followed by a non-space."""
    return [m.start() for m in re.finditer(r"^\(\s*" + str(number) + r"\s*\)\s+\S", text, re.M)]


def block(text, start):
    """The entry's text: from its line to the next entry line '(digits) ' or the next heading."""
    nxt = re.compile(r"^\(\s*\d+\s*\)\s+\S", re.M)
    m = nxt.search(text, start + 1)
    end = m.start() if m else len(text)
    for p, _ in headings(text):
        if start < p < end:
            end = p
            break
    return text[start:end]


def classify(text, number):
    """Returns (kind, heading, refers, earliest_mpc_page).
    kind: 'new' if any entry for the number stands under NEW NAMES; else 'correction' if under a heading matching CORR;
    else 'other' (an entry under some other heading); 'not found' if no entry line."""
    hs = headings(text)
    es = entries(text, number)
    if not es:
        return "not found", None, False, None
    found = []
    for e in es:
        above = [h for p, h in hs if p < e]
        found.append((e, above[-1] if above else None))
    for e, h in found:
        if h and NEW.match(h):
            b = block(text, e)
            m = MPCREF.search(b)
            return "new", h, bool(REFERS.search(b)), (int(m.group(1)) if m else None)
    for e, h in found:
        if h and CORR.search(h):
            b = block(text, e)
            m = MPCREF.search(b)
            return "correction", h, bool(REFERS.search(b)), (int(m.group(1)) if m else None)
    return "other", found[0][1], False, None
