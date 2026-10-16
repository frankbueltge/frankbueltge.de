"""Project 10, session 2: arc grammar fixed in SESSION2.md. Tested on invented strings in test_lib2.py before any pair is parsed."""
import re
import numpy as np

BINS = 720  # 0.5 degree
DEG = r"(\d{1,3})\s*°\s*(?:(\d{1,2}(?:\.\d+)?)\s*[`'´])?"
RANGE = re.compile(DEG + r"\s*-\s*" + DEG)
COL = r"(?:W|R|G|Y|Bu|Vi|Or)\.(?:\s*\([^()°]*\))?"  # session 2 correction: any parenthesis, e.g. W.(10M), not only (unintensified)
SECTOR_START = re.compile(r"(?<![A-Za-z])" + COL + r"\s+" + DEG + r"\s*-\s*" + DEG)
SECTOR_NEXT = re.compile(r"^\s*,\s*" + COL + r"\s*-\s*" + DEG)
SECTOR_NEXT_FULL = re.compile(r"^\s*,\s*" + COL + r"\s+" + DEG + r"\s*-\s*" + DEG)
VISIBLE = re.compile(r"\bVisible\s+" + DEG + r"\s*-\s*" + DEG, re.I)
MORE = re.compile(r"^\s*(?:,|and)\s*" + DEG + r"\s*-\s*" + DEG)
OBSCURED = re.compile(r"\bobscured\s+" + DEG + r"\s*-\s*" + DEG, re.I)


def deg(d, m):
    return (float(d) + (float(m) / 60 if m else 0.0)) % 360


def arc_mask(a, b):
    """Clockwise arc from a to b (degrees) as a boolean mask of BINS bins (bin centres)."""
    c = (np.arange(BINS) + 0.5) * 360 / BINS
    if a <= b:
        return (c >= a) & (c <= b)
    return (c >= a) | (c <= b)


def arcs(remarks):
    """Return (mask, status). status: 'allround' (no degree sign), 'restricted', 'unparsed' (degree sign, nothing parsed;
    mask all round), 'intensified-only' (only no-restriction phrases with degrees; mask all round)."""
    full = np.ones(BINS, bool)
    if not remarks or "°" not in remarks:
        return full, "allround"
    text = remarks.replace("\n", " ")
    vis = np.zeros(BINS, bool)
    found_vis = False
    for m in VISIBLE.finditer(text):
        found_vis = True
        vis |= arc_mask(deg(*m.group(1, 2)), deg(*m.group(3, 4)))
        rest = text[m.end():]
        while True:
            n = MORE.match(rest)
            if not n:
                break
            vis |= arc_mask(deg(*n.group(1, 2)), deg(*n.group(3, 4)))
            rest = rest[n.end():]
    pos = 0
    while True:
        m = SECTOR_START.search(text, pos)
        if not m:
            break
        found_vis = True
        start, end = deg(*m.group(1, 2)), deg(*m.group(3, 4))
        vis |= arc_mask(start, end)
        rest = text[m.end():]
        while True:
            n = SECTOR_NEXT_FULL.match(rest)
            if n:
                start, end = deg(*n.group(1, 2)), deg(*n.group(3, 4))
                vis |= arc_mask(start, end)
                rest = rest[n.end():]
                continue
            n = SECTOR_NEXT.match(rest)
            if not n:
                break
            nxt = deg(*n.group(1, 2))
            vis |= arc_mask(end, nxt)
            end = nxt
            rest = rest[n.end():]
        pos = len(text) - len(rest)
    mask = vis if found_vis else full.copy()
    found_obs = False
    for m in OBSCURED.finditer(text):
        found_obs = True
        mask &= ~arc_mask(deg(*m.group(1, 2)), deg(*m.group(3, 4)))
    if found_vis or found_obs:
        return mask, "restricted"
    if re.search(r"\bIntensified\s+" + DEG, text, re.I):
        return full, "intensified-only"
    return full, "unparsed"


def sees(mask, bearing_deg):
    """bearing_deg: array of true bearings from observer to light."""
    b = ((np.asarray(bearing_deg) % 360) * BINS / 360).astype(int) % BINS
    return mask[b]
