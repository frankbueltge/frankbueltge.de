"""Study 34: people under each tornado warning, 2016-2023, the Atelier's 72 offices.
Usage: python3 -I build34.py <dir holding t2016..t2023/wwa_*.csv> <Gaz_counties_national.txt>
Variables as fixed in PREREGISTRATION-34.md (commit 2996da1). Writes data/warnings34.tsv.
No third-party file is committed raw: each IEM yearly export and the gazetteer are named by sha256."""
import csv, sys, pathlib, hashlib, collections
from datetime import datetime
HERE = pathlib.Path(__file__).resolve().parent
iem_dir, gaz_path = pathlib.Path(sys.argv[1]), sys.argv[2]
SHA = {2016: "856d3e924729e9d1912ca9bf43081a90b6d74cbdd02849336cab14578950bb31",
       2017: "647a9be550b50da234ffff924ec016a822a07aa11a6cfb8126c96e3c1cd950cc",
       2018: "0b1d778ba057334c6900bbf7c643a98936d0364b6c592f4f75e9178ed49fdc2f",
       2019: "e7b1eed4833292da58a5559883102b2c571b79f89f1132258876553af546e711",
       2020: "eeb2feb8bb25907d06247e81b860f3dd993b0769727a205fd7b587d7542ec1a3",
       2021: "044daf72c254b4830b177b41175ebec055bc657af9be26798f6f1e1d3cc32e3a",
       2022: "9d3f754adcf65cb46af0f826e468393a68fb0685793e46f4c695384b651d35c1",
       2023: "ae5b014b8eff9fd59c7ae7bf6183c86de92b421a25963bcb2ed9d19af3dd5110",
       "gaz": "09800b5b16348449074db3905737c53e47c5448c3059ffc611b803c0d787e2eb"}
assert hashlib.sha256(open(gaz_path, "rb").read()).hexdigest() == SHA["gaz"]

# the Atelier's 72 offices, as study 33 used them
OFFICES = sorted({r["office"] for r in csv.DictReader(open(HERE / "data/tornadoes33.tsv"), delimiter="\t")})
assert len(OFFICES) == 72

# --- census 2010: population and land area (km2) per county, keyed by UGC (SSC###)
pop, land = {}, {}
with open(gaz_path, encoding="latin-1") as f:
    rd = csv.reader(f, delimiter="\t"); head = [h.strip() for h in next(rd)]
    for row in rd:
        r = dict(zip(head, (x.strip() for x in row)))
        ugc = f"{r['USPS']}C{r['GEOID'][2:]}"
        pop[ugc], land[ugc] = int(r["POP10"]), int(r["ALAND"]) / 1e6

def minutes(a, b):
    f = "%Y-%m-%d %H:%M"
    return (datetime.strptime(b, f) - datetime.strptime(a, f)).total_seconds() / 60

warn, counties, missing = {}, collections.defaultdict(set), collections.Counter()
for y in range(2016, 2024):
    (p,) = (iem_dir / f"t{y}").glob("wwa_*.csv")
    assert hashlib.sha256(p.read_bytes()).hexdigest() == SHA[y], y
    for r in csv.DictReader(open(p)):
        if (r["PHENOM"], r["SIG"]) != ("TO", "W") or r["WFO"] not in OFFICES: continue
        key = (r["WFO"], r["VTEC_YEAR"], int(r["ETN"]))
        if r["GTYPE"] == "C": counties[key].add(r["NWS_UGC"])
        elif r["GTYPE"] == "P" and r["STATUS"] == "NEW":
            # 4 of 19,357 (office, year, number) keys carry two NEW polygons at different minutes:
            # both are kept as warnings and share that key's counties (declared deviation)
            missing["shared_number"] += any(k[:3] == key for k in warn)
            warn[key + (r["INIT_ISS"],)] = r

out = []
for key, r in sorted(warn.items(), key=lambda kv: kv[1]["INIT_ISS"]):
    cs = sorted(counties.get(key[:3], ()))
    known = [c for c in cs if c in pop]
    missing["no_county"] += not cs
    missing["county_not_in_gazetteer"] += len(cs) - len(known)
    if not known: missing["dropped"] += 1; continue
    dens = sum(pop[c] for c in known) / sum(land[c] for c in known)
    area = float(r["AREA_KM2"])
    out.append({"office": key[0], "year": key[1], "etn": key[2], "issued": r["INIT_ISS"],
                "minutes": round(minutes(r["INIT_ISS"], r["INIT_EXP"]), 1), "area_km2": area,
                "counties": "|".join(known), "density": round(dens, 3), "people": round(area * dens),
                "tag": r["TORNADOTAG"], "damage": r["DAMAGETAG"], "emergency": r["IS_EMERGENCY"]})
with open(HERE / "data/warnings34.tsv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(out[0]), delimiter="\t"); w.writeheader(); w.writerows(out)
print(len(warn), "warnings;", len(out), "written;", dict(missing))
