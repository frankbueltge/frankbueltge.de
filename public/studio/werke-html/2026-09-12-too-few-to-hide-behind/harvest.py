#!/usr/bin/env python3
"""TOO FEW TO HIDE BEHIND — harvest.

Reads eleven Eurostat dataflows through the public dissemination API, counts the
status of every cell in them, and writes two derived files:

    counts.json    every number this work uses, derived here and nowhere else
    withheld.csv   the register: every sealed turnover cell, by country,
                   activity and year

No third-party file is committed. The downloaded tables are written to a cache
directory outside the repository (default: $TMPDIR/eurostat-cache), parsed, and
never copied into the work.

    python3 harvest.py            # download what is missing from the cache, derive
    python3 harvest.py --offline  # derive from the cache only, never touch the network

Source: Eurostat, the statistical office of the European Union. Data are
re-usable under the Commission's re-use policy (Decision 2011/833/EU, CC BY 4.0)
with the source acknowledged.
"""

import argparse
import collections
import csv
import gzip
import hashlib
import json
import os
import re
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone

API = "https://ec.europa.eu/eurostat/api/dissemination"
DATA = API + "/sdmx/2.1/data/{code}/?format=TSV&compressed=true"
CODELIST = API + "/sdmx/2.1/codelist/ESTAT/{cl}"

PRIMARY = "sbs_ovw_act"

# Ten further dataflows, chosen before any of them was counted, to ask one
# question: where does the confidentiality flag live? Two demographic, one price,
# one energy, one tourism, one waste, one cause-of-death, one education, one
# vehicle stock, one household-internet.
CENSUS = [
    ("demo_gind", "Population change - demographic balance and crude rates"),
    ("demo_pjan", "Population on 1 January by age and sex"),
    ("prc_hicp_midx", "Harmonised index of consumer prices - monthly index"),
    ("nrg_cb_e", "Supply, transformation and consumption of electricity"),
    ("tour_occ_ninat", "Nights spent at tourist accommodation establishments"),
    ("env_wasgen", "Generation of waste by economic activity"),
    ("hlth_cd_aro", "Causes of death - deaths by country of residence and occurrence"),
    ("educ_uoe_enra02", "Pupils and students enrolled by education level"),
    ("road_eqs_carage", "Passenger cars by age"),
    ("isoc_ci_ifp_iu", "Individuals - internet use"),
]

TURNOVER = "NETTUR_MEUR"
ENTERPRISES = "ENT_NR"
YEARS = ["2021", "2022", "2023", "2024"]

# status of one cell in a Eurostat TSV table
PUBLISHED, SEALED, NOT_AVAILABLE, ABSENT = "V", "C", "NA", "ABS"

CLASS = re.compile(r"^[A-Z]\d{4}$")     # NACE Rev. 2 class, the finest level
BUCKETS = [(0, "0"), (1, "1"), (2, "2"), (3, "3"), (5, "4-5"), (10, "6-10"),
           (20, "11-20"), (50, "21-50"), (100, "51-100"), (1000, "101-1000")]
LAST_BUCKET = ">1000"


def cache_dir():
    d = os.environ.get("EUROSTAT_CACHE") or os.path.join(tempfile.gettempdir(), "eurostat-cache")
    os.makedirs(d, exist_ok=True)
    return d


def fetch(url, path, offline):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return "cache"
    if offline:
        raise SystemExit("missing from cache and --offline was given: " + path)
    req = urllib.request.Request(url, headers={"User-Agent": "Ensemble/studio (research)"})
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        f.write(r.read())
    return "network"


def table(code, offline):
    """Yield (key_fields, year, cell_text) for every cell of a dataflow."""
    path = os.path.join(cache_dir(), code + ".tsv.gz")
    fetch(DATA.format(code=code), path, offline)
    with gzip.open(path, "rt", encoding="utf-8") as f:
        header = f.readline().rstrip("\r\n").split("\t")
        years = [h.strip() for h in header[1:]]
        for line in f:
            parts = line.rstrip("\r\n").split("\t")
            key = parts[0].split(",")
            for year, cell in zip(years, parts[1:]):
                yield key, year, cell.strip()


def status(cell):
    """The three states a Eurostat cell can be in.

    '@C' is the confidentiality flag (CONF_STATUS code C, 'confidential' in
    Eurostat's own code list): the value exists and may not be printed.
    A bare ':' is 'not available': there is no value.
    Anything else is a number, with or without an observation flag (b, e, p, ...).
    """
    if not cell:
        return None
    if "@C" in cell:
        return SEALED
    if cell.startswith(":"):
        return NOT_AVAILABLE
    return PUBLISHED


def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def bucket(n):
    for hi, label in BUCKETS:
        if n <= hi:
            return label
    return LAST_BUCKET


def labels(cl, offline):
    path = os.path.join(cache_dir(), "cl_%s.xml" % cl)
    fetch(CODELIST.format(cl=cl), path, offline)
    xml = open(path, encoding="utf-8").read()
    out = {}
    for m in re.finditer(r'<s:Code id="([^"]+)"[^>]*>(.*?)</s:Code>', xml, re.S):
        cid, body = m.groups()
        name = re.search(r'<c:Name xml:lang="en">(.*?)</c:Name>', body, re.S)
        if name:
            out[cid] = name.group(1).strip()
    return out


def harvest(offline):
    stat = {}            # (geo, nace, indicator, year) -> status
    firms = {}           # (geo, nace, year) -> published number of enterprises
    by_ind = collections.defaultdict(collections.Counter)
    by_geo = collections.defaultdict(collections.Counter)
    total = collections.Counter()

    for key, year, cell in table(PRIMARY, offline):
        _freq, nace, indic, geo = key
        s = status(cell)
        if s is None:
            continue
        stat[(geo, nace, indic, year)] = s
        by_ind[indic][s] += 1
        by_geo[geo][s] += 1
        total[s] += 1
        if indic == ENTERPRISES and s == PUBLISHED:
            try:
                firms[(geo, nace, year)] = int(float(cell.split()[0]))
            except ValueError:
                pass

    geos = sorted({k[0] for k in stat})
    classes = sorted({k[1] for k in stat if CLASS.match(k[1])})
    indicators = sorted(by_ind)

    # the wall: turnover, every NACE class, every country, every year
    matrix = {}
    per_geo_year = collections.defaultdict(collections.Counter)
    per_class = collections.defaultdict(collections.Counter)
    code = {PUBLISHED: "1", SEALED: "2", NOT_AVAILABLE: "3", ABSENT: "0"}
    for year in YEARS:
        rows = {}
        for geo in geos:
            line = []
            for nace in classes:
                s = stat.get((geo, nace, TURNOVER, year), ABSENT)
                line.append(code[s])
                per_geo_year[geo][s] += 1
                per_class[nace][s] += 1
            rows[geo] = "".join(line)
        matrix[year] = rows

    sealing = sorted(g for g in geos if per_geo_year[g][SEALED] > 0)

    # the ladder: does the seal follow the number of firms?
    curves = {}
    for tag, only_classes, only_sealing in (("classes_sealing", True, True),
                                            ("all_levels_sealing", False, True),
                                            ("classes_all_countries", True, False)):
        counted = collections.defaultdict(lambda: [0, 0])
        for (geo, nace, year), n in firms.items():
            if only_classes and not CLASS.match(nace):
                continue
            if only_sealing and geo not in sealing:
                continue
            s = stat.get((geo, nace, TURNOVER, year))
            if s not in (SEALED, PUBLISHED):
                continue
            b = counted[bucket(n)]
            b[0] += (s == SEALED)
            b[1] += 1
        curves[tag] = {k: v for k, v in sorted(counted.items())}

    # the cells with exactly one enterprise whose turnover is printed anyway
    single = {"sealed": 0, "published": 0, "by_geo": collections.Counter(),
              "by_nace": collections.Counter(), "largest": []}
    # counted at the wall's own level — NACE classes — so the two agree
    for (geo, nace, year), n in firms.items():
        if n != 1 or not CLASS.match(nace):
            continue
        s = stat.get((geo, nace, TURNOVER, year))
        if s == SEALED:
            single["sealed"] += 1
        elif s == PUBLISHED:
            single["published"] += 1
            single["by_geo"][geo] += 1
            single["by_nace"][nace] += 1
    # the printed values themselves, for the ten largest
    values = []
    for key, year, cell in table(PRIMARY, offline):
        _freq, nace, indic, geo = key
        if indic != TURNOVER or status(cell) != PUBLISHED:
            continue
        if firms.get((geo, nace, year)) == 1 and CLASS.match(nace):
            values.append([geo, nace, year, float(cell.split()[0])])
    values.sort(key=lambda r: -r[3])
    single["largest"] = values[:12]
    single["printed_total"] = len(values)
    single["by_geo"] = dict(single["by_geo"].most_common())
    single["by_nace"] = dict(single["by_nace"].most_common(12))

    census = []
    for code_, title in CENSUS:
        c = collections.Counter()
        for _key, _year, cell in table(code_, offline):
            s = status(cell)
            if s:
                c[s] += 1
        census.append({"dataflow": code_, "title": title, "cells": sum(c.values()),
                       "published": c[PUBLISHED], "sealed": c[SEALED],
                       "not_available": c[NOT_AVAILABLE]})

    nace_labels = labels("NACE_R2", offline)
    geo_labels = labels("GEO", offline)
    indic_labels = labels("INDIC_SBS", offline)

    files = {}
    for code_ in [PRIMARY] + [c for c, _ in CENSUS]:
        p = os.path.join(cache_dir(), code_ + ".tsv.gz")
        files[code_] = {"sha256": digest(p), "bytes": os.path.getsize(p)}

    out = {
        "harvested_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "api": API,
        "source": "Eurostat, the statistical office of the European Union",
        "reuse": "Commission Decision 2011/833/EU; CC BY 4.0 with the source acknowledged",
        "downloads": files,
        "primary": {
            "dataflow": PRIMARY,
            "title": "Structural business statistics overview by activity",
            "cells": sum(total.values()),
            "by_status": dict(total),
            "by_indicator": {k: dict(v) for k, v in sorted(by_ind.items())},
            "by_geo": {k: dict(v) for k, v in sorted(by_geo.items())},
            "indicators": indicators,
            "geos": geos,
            "sealing_geos": sealing,
            "classes": classes,
            "years": YEARS,
            "turnover_indicator": TURNOVER,
            "matrix": matrix,
            "matrix_by_geo": {g: dict(c) for g, c in sorted(per_geo_year.items())},
            "matrix_by_class": {n: dict(c) for n, c in sorted(per_class.items())},
            "curves": curves,
            "single_enterprise": single,
        },
        "census": census,
        "labels": {
            "nace": {c: nace_labels.get(c, "") for c in classes + sorted({c[0] for c in classes})},
            "geo": {g: geo_labels.get(g, "") for g in geos},
            "indic": {i: indic_labels.get(i, "") for i in indicators},
        },
    }

    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "counts.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")

    # the register itself: one row per sealed turnover cell, at class level
    rows = []
    for year in YEARS:
        for geo in geos:
            for i, nace in enumerate(classes):
                if matrix[year][geo][i] == "2":
                    rows.append([geo, nace, year, nace_labels.get(nace, ""),
                                 geo_labels.get(geo, "")])
    rows.sort(key=lambda r: (r[0], r[1], r[2]))
    with open(os.path.join(here, "withheld.csv"), "w", encoding="utf-8", newline="\n") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["geo", "nace_r2", "year", "activity", "country"])
        w.writerows(rows)

    print("cells in %s: %d" % (PRIMARY, sum(total.values())))
    print("  published %d  sealed %d  not available %d"
          % (total[PUBLISHED], total[SEALED], total[NOT_AVAILABLE]))
    print("turnover wall: %d cells, %d sealed"
          % (len(geos) * len(classes) * len(YEARS),
             sum(per_geo_year[g][SEALED] for g in geos)))
    print("register written: %d rows" % len(rows))
    for row in census:
        print("  %-18s %9d cells  sealed %7d (%.2f%%)"
              % (row["dataflow"], row["cells"], row["sealed"],
                 100.0 * row["sealed"] / max(row["cells"], 1)))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true",
                    help="derive from the cache only; never touch the network")
    harvest(ap.parse_args().offline)
