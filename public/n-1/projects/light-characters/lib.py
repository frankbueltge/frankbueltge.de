"""Project 10: parsing rules fixed in SELECTION.md. Tested on invented strings in test_lib.py before any volume is parsed."""
import math, re

PERIOD = re.compile(r"period\s+(\d+(?:\.\d+)?)\s*s", re.I)
DMS = re.compile(r"(\d+)\s*°\s*(\d+(?:\.\d+)?)?\s*'?\s*(\d+(?:\.\d+)?)?\s*\"?\s*([NSEW])")


def key(characteristic):
    """Return (first_line, period or None, kind) with kind in {'rhythmic','fixed','unparsed'}."""
    if not characteristic or not characteristic.strip():
        return None, None, "unparsed"
    lines = [l.strip() for l in characteristic.strip().splitlines() if l.strip()]
    first = re.sub(r"\s+", "", lines[0])
    m = PERIOD.search(characteristic)
    period = float(m.group(1)) if m else None
    if period is not None:
        return first, period, "rhythmic"
    if first.startswith("F."):
        return first, None, "fixed"
    return first, None, "unparsed"


def position(text):
    """'46°15\\'34.96"N \\n72°37\\'48.37"W' -> (lat, lon) or None."""
    if not text:
        return None
    parts = DMS.findall(text)
    if len(parts) != 2:
        return None
    out = []
    for d, m, s, h in parts:
        v = float(d) + float(m or 0) / 60 + float(s or 0) / 3600
        if h in "SW":
            v = -v
        out.append((h, v))
    if out[0][0] not in "NS" or out[1][0] not in "EW":
        return None
    lat, lon = out[0][1], out[1][1]
    if abs(lat) > 90 or abs(lon) > 180:
        return None
    return lat, lon


def nm_range(text):
    if not text:
        return None
    ints = [int(x) for x in re.findall(r"\d+", str(text))]
    return max(ints) if ints else None


def cls(r):
    if r is None:
        return "unknown"
    return "major" if r >= 15 else "middle" if r >= 8 else "minor"


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371.0 * math.asin(min(1, math.sqrt(h)))
