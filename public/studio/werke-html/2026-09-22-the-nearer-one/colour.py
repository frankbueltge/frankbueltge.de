"""Colour difference, written once here and a second time in verify.mjs.

Five answers to one question — which of two colours is nearer to a third.
Nothing here is imported from a library; every formula is transcribed from its
published definition and the sources are listed in sources.json.

Convention throughout: a distance is written d(reference, sample). Two of the
five formulas care about the order of those two arguments. That is the point of
one of the panels, so the argument order is never quietly normalised.
"""
import math

# ---------------------------------------------------------------- the palette

STEPS = (0, 51, 102, 153, 204, 255)


def palette():
    """The 216 colours of the web-safe palette, generated, never copied.

    Six levels per channel, 0x00 0x33 0x66 0x99 0xCC 0xFF. Ordered R, then G,
    then B, so index = 36*r + 6*g + b over the level indices.
    """
    out = []
    for r in STEPS:
        for g in STEPS:
            for b in STEPS:
                out.append((r, g, b))
    return out


def hexof(c):
    return "#%02x%02x%02x" % c


# ------------------------------------------------------------- sRGB -> CIELAB

# sRGB (IEC 61966-2-1) linearisation.
def _lin(v):
    v = v / 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


# sRGB D65 primaries, the matrix given in IEC 61966-2-1 Annex A.
M = (
    (0.4124564, 0.3575761, 0.1804375),
    (0.2126729, 0.7151522, 0.0721750),
    (0.0193339, 0.1191920, 0.9503041),
)

# The white point is taken from the matrix itself — the colour (255,255,255)
# run through it — so that white lands on L*=100, a*=0, b*=0 exactly. Using a
# rounded D65 from a table instead would put white a hundredth off its own
# origin, and every difference in this work would carry that offset.
WHITE = tuple(sum(row) for row in M)

_D = (6.0 / 29.0) ** 3
_K = (29.0 / 6.0) ** 2 / 3.0


def _f(t):
    return t ** (1.0 / 3.0) if t > _D else _K * t + 4.0 / 29.0


def lab(c):
    r, g, b = (_lin(v) for v in c)
    xyz = [M[i][0] * r + M[i][1] * g + M[i][2] * b for i in range(3)]
    fx, fy, fz = (_f(xyz[i] / WHITE[i]) for i in range(3))
    return (116.0 * fy - 16.0, 500.0 * (fx - fy), 200.0 * (fy - fz))


# ----------------------------------------------------------- the five answers

def d_rgb(p, q):
    """Euclidean distance in sRGB. Not a standard of anything; the thing a
    program does when nobody decided what it should do."""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p, q)))


def d_cie76(p, q):
    """CIE 1976 dE*ab — Euclidean distance in CIELAB."""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p, q)))


def d_cie94(p, q, kL=1.0, kC=1.0, kH=1.0, K1=0.045, K2=0.015):
    """CIE94 dE*94, graphic-arts parameters. p is the reference: S_C and S_H
    are built from the reference's chroma alone, so d(p,q) != d(q,p)."""
    L1, a1, b1 = p
    L2, a2, b2 = q
    dL = L1 - L2
    C1 = math.hypot(a1, b1)
    C2 = math.hypot(a2, b2)
    dC = C1 - C2
    da, db = a1 - a2, b1 - b2
    dH2 = da * da + db * db - dC * dC
    if dH2 < 0.0:
        dH2 = 0.0
    SL, SC, SH = 1.0, 1.0 + K1 * C1, 1.0 + K2 * C1
    return math.sqrt((dL / (kL * SL)) ** 2 + (dC / (kC * SC)) ** 2 + dH2 / (kH * SH) ** 2)


def d_cmc(p, q, l=2.0, c=1.0):
    """CMC(l:c), the Colour Measurement Committee's 1984 formula, at 2:1 —
    the acceptability setting. p is the reference, and every weight is
    computed from it, so this one is asymmetric too."""
    L1, a1, b1 = p
    L2, a2, b2 = q
    dL = L1 - L2
    C1 = math.hypot(a1, b1)
    C2 = math.hypot(a2, b2)
    dC = C1 - C2
    da, db = a1 - a2, b1 - b2
    dH2 = da * da + db * db - dC * dC
    if dH2 < 0.0:
        dH2 = 0.0
    SL = 0.511 if L1 < 16.0 else (0.040975 * L1) / (1.0 + 0.01765 * L1)
    SC = (0.0638 * C1) / (1.0 + 0.0131 * C1) + 0.638
    H1 = math.degrees(math.atan2(b1, a1)) % 360.0
    if 164.0 <= H1 <= 345.0:
        T = 0.56 + abs(0.2 * math.cos(math.radians(H1 + 168.0)))
    else:
        T = 0.36 + abs(0.4 * math.cos(math.radians(H1 + 35.0)))
    C1_4 = C1 ** 4
    F = math.sqrt(C1_4 / (C1_4 + 1900.0))
    SH = SC * (F * T + 1.0 - F)
    return math.sqrt((dL / (l * SL)) ** 2 + (dC / (c * SC)) ** 2 + dH2 / (SH * SH))


_P25_7 = 25.0 ** 7


def d_ciede2000(p, q, kL=1.0, kC=1.0, kH=1.0):
    """CIEDE2000 dE00, in the notation of Sharma, Wu & Dalal (2005).
    Symmetric in its two arguments — which this work checks rather than
    assumes — and, as this work also finds, not a distance."""
    L1, a1, b1 = p
    L2, a2, b2 = q
    C1 = math.hypot(a1, b1)
    C2 = math.hypot(a2, b2)
    Cbar = 0.5 * (C1 + C2)
    Cbar7 = Cbar ** 7
    G = 0.5 * (1.0 - math.sqrt(Cbar7 / (Cbar7 + _P25_7)))
    a1p, a2p = (1.0 + G) * a1, (1.0 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = 0.0 if (b1 == 0.0 and a1p == 0.0) else math.degrees(math.atan2(b1, a1p)) % 360.0
    h2p = 0.0 if (b2 == 0.0 and a2p == 0.0) else math.degrees(math.atan2(b2, a2p)) % 360.0
    dLp = L2 - L1
    dCp = C2p - C1p
    if C1p * C2p == 0.0:
        dhp = 0.0
    else:
        dhp = h2p - h1p
        if dhp > 180.0:
            dhp -= 360.0
        elif dhp < -180.0:
            dhp += 360.0
    dHp = 2.0 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp) / 2.0)
    Lbar = 0.5 * (L1 + L2)
    Cbarp = 0.5 * (C1p + C2p)
    if C1p * C2p == 0.0:
        hbar = h1p + h2p
    elif abs(h1p - h2p) <= 180.0:
        hbar = 0.5 * (h1p + h2p)
    elif h1p + h2p < 360.0:
        hbar = 0.5 * (h1p + h2p + 360.0)
    else:
        hbar = 0.5 * (h1p + h2p - 360.0)
    T = (1.0
         - 0.17 * math.cos(math.radians(hbar - 30.0))
         + 0.24 * math.cos(math.radians(2.0 * hbar))
         + 0.32 * math.cos(math.radians(3.0 * hbar + 6.0))
         - 0.20 * math.cos(math.radians(4.0 * hbar - 63.0)))
    dTheta = 30.0 * math.exp(-(((hbar - 275.0) / 25.0) ** 2))
    Cbarp7 = Cbarp ** 7
    RC = 2.0 * math.sqrt(Cbarp7 / (Cbarp7 + _P25_7))
    SL = 1.0 + (0.015 * (Lbar - 50.0) ** 2) / math.sqrt(20.0 + (Lbar - 50.0) ** 2)
    SC = 1.0 + 0.045 * Cbarp
    SH = 1.0 + 0.015 * Cbarp * T
    RT = -math.sin(math.radians(2.0 * dTheta)) * RC
    tL, tC, tH = dLp / (kL * SL), dCp / (kC * SC), dHp / (kH * SH)
    return math.sqrt(tL * tL + tC * tC + tH * tH + RT * tC * tH)


# The five, in the order they were published.
MEASURES = ("rgb", "cie76", "cie94", "cmc", "de2000")

LABELS = {
    "rgb":    "sRGB Euclidean",
    "cie76":  "CIE76  ΔE*ab",
    "cie94":  "CIE94  ΔE*94",
    "cmc":    "CMC(2:1)",
    "de2000": "CIEDE2000  ΔE00",
}

SYMMETRIC = {"rgb": True, "cie76": True, "cie94": False, "cmc": False, "de2000": True}


def distance(name, i, j, RGB, LAB):
    if name == "rgb":
        return d_rgb(RGB[i], RGB[j])
    if name == "cie76":
        return d_cie76(LAB[i], LAB[j])
    if name == "cie94":
        return d_cie94(LAB[i], LAB[j])
    if name == "cmc":
        return d_cmc(LAB[i], LAB[j])
    if name == "de2000":
        return d_ciede2000(LAB[i], LAB[j])
    raise KeyError(name)
