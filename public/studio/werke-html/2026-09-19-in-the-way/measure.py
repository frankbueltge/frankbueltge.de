#!/usr/bin/env python3
"""IN THE WAY — the measurement.

Reads the cached catalogues (never the network) and writes `counts.json`:
every number the page prints, the profiles it draws, and the two projected
mark sets the page carries as pictures.  No source table is written here and
none is committed; the marks are positions rounded to the paper's grid.

    python3 measure.py            # write counts.json
    python3 measure.py --report   # print the measurements, write nothing
"""
import argparse, csv, json, math, os, pathlib, statistics

HERE = pathlib.Path(__file__).resolve().parent
CACHE = pathlib.Path(os.environ.get("ENSEMBLE_CACHE",
                                    pathlib.Path.home() / ".cache" / "ensemble" / "in-the-way"))
SKY = 41252.96124941928          # square degrees of the whole sphere
R2 = math.sqrt(2.0)
SCALE = 280.0                     # paper units per projection unit
CX, CY = 800.0, 400.0             # centre of the 1600 x 800 sheet

# The two structures named on the page, with the primary sources the positions
# come from.  Positions are approximate centres as those papers give them.
STRUCTURES = [
    {"name": "Norma cluster (Abell 3627), the core of the Great Attractor",
     "l": 325.2555, "b": -7.1281, "radius": 5.0,
     "source": "position from SIMBAD, object ACO 3627, read 2026-09-19 "
               "(galactic 325.2555, -07.1281); the cluster and the Great Attractor "
               "Wall are named in the HIZOA-S paper cited below"},
    {"name": "Vela supercluster",
     "l": 272.5, "b": 0.0, "radius": 10.0,
     "source": "position and extent as stated by Hatamkhani, Kraan-Korteweg, Blyth, "
               "Said & Elagali, 'Galaxy clusters in the Vela supercluster - I. Deep "
               "NIR catalogues', MNRAS 522 (2023) 2223 (arXiv:2304.07208): "
               "l = 272.5 +/- 20 deg, b = +/- 10 deg, cz about 18 000 km/s"},
]


def wrap180(x):
    return (x + 180.0) % 360.0 - 180.0


def hammer(lon_deg, lat_deg):
    """Hammer's equal-area projection.  Longitude runs to the left, as sky
    charts run: an observer looks out, not down."""
    lam = math.radians(-wrap180(lon_deg))
    phi = math.radians(lat_deg)
    d = math.sqrt(1.0 + math.cos(phi) * math.cos(lam / 2.0))
    x = 2.0 * R2 * math.cos(phi) * math.sin(lam / 2.0) / d
    y = R2 * math.sin(phi) / d
    return CX + x * SCALE, CY - y * SCALE


def marks(points):
    """Project and round to the paper's own grid — one unit of a sheet 1600
    across.  Two galaxies that land on the same point of paper are one point of
    ink, and the page says how many marks that leaves."""
    seen = {}
    for lon, lat in points:
        x, y = hammer(lon, lat)
        key = (round(x), round(y))
        seen[key] = seen.get(key, 0) + 1
    out = sorted(seen, key=lambda p: (p[1], p[0]))
    return out, len(points), max(seen.values())


def to_galactic(ra_deg, dec_deg):
    """J2000 equatorial to galactic (north pole 192.85948, +27.12825;
    longitude of the north celestial pole 122.93192)."""
    ra, dec = math.radians(ra_deg), math.radians(dec_deg)
    rap, decp = math.radians(192.85948), math.radians(27.12825)
    lncp = math.radians(122.93192)
    b = math.asin(math.sin(decp) * math.sin(dec)
                  + math.cos(decp) * math.cos(dec) * math.cos(ra - rap))
    l = lncp - math.atan2(
        math.cos(dec) * math.sin(ra - rap),
        math.cos(decp) * math.sin(dec) - math.sin(decp) * math.cos(dec) * math.cos(ra - rap))
    return math.degrees(l) % 360.0, math.degrees(b)


def in_zone(l, b):
    """The ground the 2MRS input catalogue excludes by its own definition:
    |b| < 5 deg everywhere, |b| < 8 deg toward the bulge (|l| < 30 deg)."""
    if abs(b) < 5.0:
        return True
    return abs(b) < 8.0 and (l < 30.0 or l >= 330.0)


ZONE_FRACTION = (math.sin(math.radians(5.0))
                 + (60.0 / 360.0) * (math.sin(math.radians(8.0)) - math.sin(math.radians(5.0))))


def angsep(ra1, de1, ra2, de2):
    a1, d1, a2, d2 = map(math.radians, (ra1, de1, ra2, de2))
    v = (math.sin(d1) * math.sin(d2)
         + math.cos(d1) * math.cos(d2) * math.cos(a1 - a2))
    return math.degrees(math.acos(max(-1.0, min(1.0, v))))


def load():
    t = list(csv.DictReader(open(CACHE / "t2mrs.csv")))
    hs = list(csv.DictReader(open(CACHE / "hizoa_s.csv")))
    hn = list(csv.DictReader(open(CACHE / "hizoa_n.csv")))
    opt = [{"ra": float(r["RAJ2000"]), "dec": float(r["DEJ2000"]),
            "l": float(r["GLON"]) % 360.0, "b": float(r["GLAT"]),
            "ebv": float(r["EBV"]) if r["EBV"] else None,
            "cz": int(r["cz"]) if r["cz"] else None,
            "k": float(r["Kcmag"]) if r["Kcmag"] else None} for r in t]
    radio = []
    for r in hs:
        radio.append({"name": r["HIZOA"].strip(), "ra": float(r["RAJ2000"]),
                      "dec": float(r["DEJ2000"]), "l": float(r["GLON"]) % 360.0,
                      "b": float(r["GLAT"]),
                      "ebv": float(r["EBV"]) if r["EBV"] else None, "survey": "HIZOA-S"})
    for r in hn:
        l, b = to_galactic(float(r["RAJ2000"]), float(r["DEJ2000"]))
        radio.append({"name": r["HIZOA"].strip(), "ra": float(r["RAJ2000"]),
                      "dec": float(r["DEJ2000"]), "l": l, "b": b,
                      "ebv": None, "survey": "HIZOA-N"})
    return opt, radio


def measure():
    opt, radio = load()
    out = {}
    out["n_optical"] = len(opt)
    out["n_radio_south"] = sum(1 for r in radio if r["survey"] == "HIZOA-S")
    out["n_radio_north"] = sum(1 for r in radio if r["survey"] == "HIZOA-N")
    out["n_radio"] = len(radio)

    # --- the record's own edge, read off its entries ------------------------
    out["min_abs_b"] = min(abs(g["b"]) for g in opt)
    edge = {}
    for g in opt:
        k = int(g["l"] // 10) * 10
        edge[k] = min(edge.get(k, 90.0), abs(g["b"]))
    out["edge_by_longitude"] = [{"l": k, "min_abs_b": round(edge[k], 3)} for k in sorted(edge)]
    out["edge_bulge"] = round(min(v for k, v in edge.items() if k < 30 or k >= 330), 3)
    out["edge_elsewhere"] = round(min(v for k, v in edge.items() if 30 <= k < 330), 3)

    # --- the zone -----------------------------------------------------------
    out["zone_fraction"] = ZONE_FRACTION
    out["zone_area_deg2"] = ZONE_FRACTION * SKY
    out["covered_area_deg2"] = (1.0 - ZONE_FRACTION) * SKY
    out["optical_inside_zone"] = sum(1 for g in opt if in_zone(g["l"], g["b"]))

    # --- equal-area cells (120 in longitude x 60 in sin b) ------------------
    NL, NS = 120, 60
    cells = {}
    for g in opt:
        i = min(int(g["l"] / 360.0 * NL), NL - 1)
        j = min(int((math.sin(math.radians(g["b"])) + 1.0) / 2.0 * NS), NS - 1)
        cells[(i, j)] = cells.get((i, j), 0) + 1
    empty_in, empty_out = 0, 0
    for i in range(NL):
        for j in range(NS):
            if (i, j) in cells:
                continue
            l = (i + 0.5) / NL * 360.0
            b = math.degrees(math.asin((j + 0.5) / NS * 2.0 - 1.0))
            if in_zone(l, b):
                empty_in += 1
            else:
                empty_out += 1
    out["cells"] = {"n": NL * NS, "area_deg2": SKY / (NL * NS),
                    "occupied": len(cells), "empty": NL * NS - len(cells),
                    "empty_in_zone": empty_in, "empty_outside_zone": empty_out,
                    "fullest": max(cells.values())}

    # --- surface density and dust, by equal-area band in sin|b| -------------
    NB = 50
    band_n = [0] * NB
    band_ebv = [[] for _ in range(NB)]
    for g in opt:
        j = min(int(abs(math.sin(math.radians(g["b"]))) * NB), NB - 1)
        band_n[j] += 1
        if g["ebv"] is not None:
            band_ebv[j].append(g["ebv"])
    bands = []
    for j in range(NB):
        s1, s2 = j / NB, (j + 1) / NB
        area = SKY * (s2 - s1)
        bands.append({"sin_lo": s1, "sin_hi": s2,
                      "b_lo": math.degrees(math.asin(s1)), "b_hi": math.degrees(math.asin(s2)),
                      "n": band_n[j], "area_deg2": area, "density": band_n[j] / area,
                      "ebv_median": statistics.median(band_ebv[j]) if band_ebv[j] else None})
    out["bands"] = bands
    hi = [g for g in opt if abs(g["b"]) >= 15.0]
    area_hi = SKY * (1.0 - math.sin(math.radians(15.0)))
    plateau = len(hi) / area_hi
    out["plateau"] = {"cut_deg": 15.0, "n": len(hi), "area_deg2": area_hi, "density": plateau}
    out["zone_expected"] = plateau * out["zone_area_deg2"]
    belt = [g for g in opt if abs(g["b"]) < 15.0 and not in_zone(g["l"], g["b"])]
    area_belt = SKY * math.sin(math.radians(15.0)) - out["zone_area_deg2"]
    out["belt"] = {"n": len(belt), "area_deg2": area_belt, "density": len(belt) / area_belt,
                   "expected": plateau * area_belt,
                   "deficit": plateau * area_belt - len(belt),
                   "shortfall_share": 1.0 - (len(belt) / area_belt) / plateau}
    out["ebv_poles"] = statistics.median([g["ebv"] for g in opt
                                          if g["ebv"] is not None and abs(g["b"]) >= 75.0])
    out["ebv_edge"] = statistics.median([g["ebv"] for g in opt
                                         if g["ebv"] is not None and abs(g["b"]) < 6.0])

    # --- the holes inside the record ---------------------------------------
    nocz = [g for g in opt if g["cz"] is None]
    out["no_velocity"] = len(nocz)
    rows = []
    for k in range(0, 90, 10):
        tot = sum(1 for g in opt if k <= abs(g["b"]) < k + 10)
        mis = sum(1 for g in nocz if k <= abs(g["b"]) < k + 10)
        rows.append({"b_lo": k, "b_hi": k + 10, "n": tot, "no_cz": mis,
                     "share": mis / tot if tot else None})
    out["no_velocity_by_band"] = rows

    # --- the one column the two records share -------------------------------
    e_opt = sorted(g["ebv"] for g in opt if g["ebv"] is not None)
    e_rad = sorted(r["ebv"] for r in radio if r["ebv"] is not None)
    out["ebv"] = {
        "optical": {"n": len(e_opt), "median": statistics.median(e_opt),
                    "p99": e_opt[int(0.99 * len(e_opt))], "max": e_opt[-1]},
        "radio": {"n": len(e_rad), "median": statistics.median(e_rad),
                  "min": e_rad[0], "max": e_rad[-1]},
        "optical_above_radio_median": sum(1 for v in e_opt if v >= statistics.median(e_rad)),
        "radio_above_optical_max": sum(1 for v in e_rad if v > e_opt[-1]),
    }
    edges = [i * 0.1 for i in range(0, 26)]
    hist = {"edges": edges, "optical": [0] * 25, "radio": [0] * 25,
            "optical_over": 0, "radio_over": 0}
    for v in e_opt:
        k = int(v / 0.1)
        if k >= 25:
            hist["optical_over"] += 1
        else:
            hist["optical"][k] += 1
    for v in e_rad:
        k = int(v / 0.1)
        if k >= 25:
            hist["radio_over"] += 1
        else:
            hist["radio"][k] += 1
    out["ebv_hist"] = hist

    # --- what the two records have in common --------------------------------
    by_dec = sorted(range(len(opt)), key=lambda i: opt[i]["dec"])
    decs = [opt[i]["dec"] for i in by_dec]
    import bisect
    TOL = 2.0 / 60.0                      # two arcminutes
    matched = []
    for r in radio:
        lo = bisect.bisect_left(decs, r["dec"] - TOL)
        hi_ = bisect.bisect_right(decs, r["dec"] + TOL)
        best = None
        for k in range(lo, hi_):
            g = opt[by_dec[k]]
            s = angsep(r["ra"], r["dec"], g["ra"], g["dec"])
            if s <= TOL and (best is None or s < best[0]):
                best = (s, g)
        if best:
            matched.append({"name": r["name"], "survey": r["survey"],
                            "l": round(r["l"], 3), "b": round(r["b"], 3),
                            "sep_arcsec": round(best[0] * 3600.0, 1),
                            "ebv": r["ebv"]})
    out["match_tolerance_arcmin"] = 2.0
    out["radio_with_optical_entry"] = len(matched)
    out["radio_matches"] = sorted(matched, key=lambda m: m["name"])
    out["radio_inside_zone"] = sum(1 for r in radio if in_zone(r["l"], r["b"]))
    out["radio_outside_zone"] = len(radio) - out["radio_inside_zone"]
    out["radio_max_abs_b"] = max(abs(r["b"]) for r in radio)

    # --- what the listening actually covered ------------------------------
    # HIZOA-S: 212 < l < 36 deg, |b| < 5 (Staveley-Smith et al. 2016);
    # HIZOA-N: l = 36-52 and 196-212 deg, |b| <= 5 (Donley et al. 2005).
    s_lon, n_lon = 184.0, 32.0
    strip = math.sin(math.radians(5.0)) * SKY / 360.0
    out["radio_footprint"] = {
        "south_deg2": s_lon * strip, "north_deg2": n_lon * strip,
        "total_deg2": (s_lon + n_lon) * strip,
        "share_of_zone": (s_lon + n_lon) * strip / out["zone_area_deg2"],
        "note": "the two surveys' stated longitude ranges at |b| < 5 degrees"}

    # --- the two named structures -------------------------------------------
    st = []
    for s in STRUCTURES:
        # cap of the given radius around the given direction
        cap = SKY * (1.0 - math.cos(math.radians(s["radius"]))) / 2.0
        n = 0
        for g in opt:
            dl = wrap180(g["l"] - s["l"])
            db = g["b"] - s["b"]
            # small-angle separation is enough at these radii
            if math.hypot(dl * math.cos(math.radians(g["b"])), db) <= s["radius"]:
                n += 1
        # what share of that circle is ground the catalogue excludes by rule
        inside = total = 0
        steps = 200
        for a in range(steps):
            for c in range(steps):
                u = (a + 0.5) / steps * 2.0 - 1.0          # sin of the offset
                v = (c + 0.5) / steps * 2.0 - 1.0
                if u * u + v * v > 1.0:
                    continue
                bb = s["b"] + v * s["radius"]
                ll = (s["l"] + u * s["radius"] / max(0.05, math.cos(math.radians(bb)))) % 360.0
                total += 1
                if in_zone(ll, bb):
                    inside += 1
        st.append({**s, "cap_deg2": cap, "zone_share_of_cap": inside / total,
                   "n_optical": n, "expected": plateau * cap,
                   "n_radio": sum(1 for r in radio
                                  if math.hypot(wrap180(r["l"] - s["l"])
                                                * math.cos(math.radians(r["b"])),
                                                r["b"] - s["b"]) <= s["radius"])})
    out["structures"] = st

    # --- the pictures --------------------------------------------------------
    gal_o, n_o, dup_o = marks([(g["l"], g["b"]) for g in opt])
    equ_o, _, _ = marks([(g["ra"] - 180.0, g["dec"]) for g in opt])
    gal_r, _, _ = marks([(r["l"], r["b"]) for r in radio])
    equ_r, _, _ = marks([(r["ra"] - 180.0, r["dec"]) for r in radio])
    out["paper"] = {"width": 1600, "height": 800, "scale": SCALE,
                    "projection": "Hammer equal-area, longitude running left",
                    "unit": "one paper unit; the sheet is 1600 across",
                    "optical_marks": len(gal_o), "radio_marks": len(gal_r),
                    "busiest_mark": dup_o}
    def flat(ps):
        return [v for p in ps for v in p]
    out["marks"] = {"galactic_optical": flat(gal_o),
                    "equatorial_optical": flat(equ_o),
                    "galactic_radio": flat(gal_r),
                    "equatorial_radio": flat(equ_r)}
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", action="store_true")
    a = ap.parse_args()
    m = measure()
    if a.report:
        for k, v in m.items():
            if k in ("marks", "bands", "no_velocity_by_band", "edge_by_longitude",
                     "ebv_hist", "radio_matches"):
                print(f"{k}: [{len(v) if isinstance(v, list) else 'table'}]")
            else:
                print(f"{k}: {v}")
    else:
        marks = m.pop("marks")
        body = json.dumps(m, indent=1, sort_keys=False)
        rows = ",\n  ".join(f'"{k}": {json.dumps(v, separators=(",", ":"))}'
                            for k, v in marks.items())
        (HERE / "counts.json").write_text(body[:-2] + ',\n "marks": {\n  ' + rows + "\n }\n}\n")
        print("counts.json written")
