"""Project 10, session 3: the phase grammar fixed in SESSION3.md. Tested on invented strings in test_lib3.py before any pair is parsed."""
import re

TOKEN = re.compile(r"([A-Za-z]+)\.\s*(\d+(?:\.\d+)?)\s*s\b")
PERIOD = re.compile(r"period\s+\d+(?:\.\d+)?\s*s", re.I)


def phases(characteristic):
    """Tuple of (word, seconds) after the period line, or None if no phase is stated."""
    if not characteristic:
        return None
    m = PERIOD.search(characteristic)
    if not m:
        return None
    toks = TOKEN.findall(characteristic[m.end():])
    if not toks:
        return None
    return tuple((w.lower(), float(n)) for w, n in toks)


def verdict(a, b):
    """'unstated', 'same' or 'parted' (exact)."""
    if a is None or b is None:
        return "unstated"
    return "same" if a == b else "parted"


def perceptible(a, b, tol=0.5):
    """Secondary verdict: parted only if lengths differ or some duration differs by at least tol seconds."""
    if a is None or b is None:
        return "unstated"
    if len(a) != len(b):
        return "parted"
    return "parted" if any(abs(x[1] - y[1]) >= tol - 1e-9 for x, y in zip(a, b)) else "same"
