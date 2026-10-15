"""Project 9 session 2: the rules registered in SESSION2.md, as functions (tested in session2_test.py before any parsing)."""
import re
from session1 import LIFESPAN, BORN, OPEN

CREF = re.compile(r"WGSBN Bull\.\s*(\d+)\s*,\s*#\s*(\d+)\s*,\s*(\d+)")
HEAD_NEW = re.compile(r"^\s*New Names? of (?:a )?Minor Planets?\s*$", re.M)
HEAD_ERR = re.compile(r"^\s*Errat(?:a|um)\s*$", re.M)
# any other section heading the bulletins carry (counted from their tables of contents before registration)
HEAD_OTHER = re.compile(r"^\s*(Corrected Discovery Information|Recent Comet Nam\w+ (?:&|and) Numberings|Editorial Notice|"
                        r"Numbering of Minor Planet Satellites?|Statistics (?:&|and) Links|WGSBN Members|"
                        r"Standard Acronyms (?:&|and) Abbreviations|New X/ Comet Designations)\s*$", re.M)
EARLIER = re.compile(r"(MPC\s+(\d+)|Bull\.\s*(\d+)\s*,\s*#\s*(\d+)\s*,\s*(\d+))")
YEAR = re.compile(r"(?<!\d)(19[5-9]\d|20[0-2]\d)(?!\d)")


def parse_cref(cref):
    m = CREF.search(cref or "")
    return (int(m.group(1)), int(m.group(2)), int(m.group(3))) if m else None


def body(text):
    """The bulletin after its table of contents: the TOC lists every name, so entries are searched after it."""
    m = re.search(r"Table of Contents", text)
    if not m:
        return 0
    # the TOC ends where its dotted leader lines end
    last = 0
    for d in re.finditer(r"\.{6,}\s*\d+\s*$", text, re.M):
        last = d.end()
    return max(last, m.end())


def section_of(text, number):
    """Section heading nearest above the first entry for (number) after the TOC: new / erratum / other / not found.
    For an erratum, also the earliest reference cited on the erratum line(s) for that number."""
    start = body(text)
    pat = re.compile(r"\(\s*" + str(number) + r"\s*\)")
    m = pat.search(text, start)
    if not m:
        return "not found", None
    heads = []
    for kind, h in (("new", HEAD_NEW), ("erratum", HEAD_ERR), ("other", HEAD_OTHER)):
        for x in h.finditer(text, start, m.start()):
            heads.append((x.start(), kind))
    if not heads:
        return "not found", None
    kind = max(heads)[1]
    if kind != "erratum":
        return kind, None
    # the erratum's reference stands at the start of the block that ends in [(number) ...]; search back to the
    # nearest line that begins with a reference
    seg = text[:m.start()]
    lines = seg.split("\n")
    for ln in reversed(lines[-12:]):
        e = re.match(r"\s*(MPC\s+\d+|Bull\.\s*\d+\s*,\s*#\s*\d+\s*,\s*\d+)", ln)
        if e:
            return "erratum", re.sub(r"\s+", " ", e.group(1))
    return "erratum", None


def strip_own_years(text):
    """Remove the parentheses that hold a person's own years (the registered patterns), so they are not occasions."""
    for pat in (LIFESPAN, BORN, OPEN):
        text = pat.sub(" ", text)
    return text


def occasion_year(text):
    m = YEAR.search(strip_own_years(text))
    return int(m.group(1)) if m and int(m.group(1)) <= 2026 else None


def mpc_date(page, table):
    """table: list of (lo, hi, 'YYYY/MM/DD'); returns the batch date holding MPC page N."""
    for lo, hi, d in table:
        if lo <= page <= hi:
            return d
    return None
