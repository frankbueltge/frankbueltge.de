"""GOING OUT: build data.js from the raw files fetch.py left in RAW_DIR.

    python3 -I build.py RAW_DIR

Reports: Globe at Night naked-eye reports (ObsType GAN). A report's LimitingMag is the
magnitude chart the observer matched (0: not even the constellation; 1 to 7: stars down to
that magnitude). -9999 and -999 are reports filed with no chart; they are counted, per year,
and not drawn as skies. Places are rounded to 0.1 degree (about 11 km); the observers' free
text (SkyComment, LocationComment) is never read into the work.
The sky: every star of the Bright Star Catalogue with V <= 6.5 and a position (J2000).
The hour check: a report names the constellation it looked for, so its UT must put that
constellation's anchor star (below) more than 5 degrees above the observer's horizon. In many
years the filed UT does not (the files' own conversion from local time fails; the local times
are evening hours). A report whose UT fails is placed instead by its filed local time, shifted
by its longitude (local solar time, so the sky can stand up to an hour or two off), if that
fits, and is flagged; one that fits neither is counted as unplaceable and not drawn. Reports
filed at 0 N 0 E carry no place and are counted, not drawn.
A fixed sample of up to 320 placeable reports per year (seed 20261024) goes into the face;
the band counts every report. A report placed by local time keeps the offset of its filed UT
(minutes, filed minus placed), so the face can turn its sky from the filed hour to the placed one.
Increment 2 (session 202): a fixed sample of up to 24 reports per year of each kind that cannot
be given a sky (filed at 0 N 0 E; no hour fits) goes into the face as "lost", with what they did
file (date, chart, constellation, country), so the band's two bottom rows can be opened.
"""
import csv, gzip, json, math, random, sys, pathlib, datetime, collections

RAW = pathlib.Path(sys.argv[1]); HERE = pathlib.Path(__file__).parent
EPOCH = datetime.datetime(2000, 1, 1)
rng = random.Random(20261024)
ANCHOR = {"Orion": (88.79, 7.41), "Leo": (152.09, 11.97), "Crux": (186.65, -63.10), "Pegasus": (346.19, 15.21),
          "Cygnus": (310.36, 45.28), "Perseus": (51.08, 49.86), "Bootes": (213.92, 19.18),
          "Hercules": (247.55, 21.49), "Gemini": (116.33, 28.03), "Scorpius": (247.35, -26.43),
          "Sagittarius": (276.04, -34.38), "Grus": (332.06, -46.96), "Taurus": (68.98, 16.51),
          "Canis Major": (101.29, -16.72), "Cetus": (10.90, -17.99)}  # J2000: the brightest star of each


def alt(lat, lon, minutes, ra, de):
    d = (minutes - 720) / 1440
    h = math.radians((280.46061837 + 360.98564736629 * d + lon - ra) % 360)
    lat, de = math.radians(lat), math.radians(de)
    return math.degrees(math.asin(math.sin(de) * math.sin(lat) + math.cos(de) * math.cos(lat) * math.cos(h)))

stars = []
for line in gzip.open(RAW / "bsc5.dat.gz", "rt", encoding="latin-1"):
    line = line.ljust(200)
    try:
        ra = (int(line[75:77]) + int(line[77:79]) / 60 + float(line[79:83]) / 3600) * 15
        de = int(line[84:86]) + int(line[86:88]) / 60 + int(line[88:90]) / 3600
        v = float(line[102:107])
    except ValueError:
        continue  # the catalogue's few entries without a position (novae, removed objects)
    if line[83] == "-": de = -de
    try: bv = float(line[109:114])
    except ValueError: bv = 0.6
    if v <= 6.5: stars += [round(ra * 100), round(de * 100), round(v * 100), round(bv * 100)]

band = collections.defaultdict(lambda: collections.Counter())
pool = collections.defaultdict(list); total = 0
lostpool = collections.defaultdict(list)  # (kind, ...): 0 = no place (0 N 0 E), 1 = no hour fits
for y in range(2006, 2026):
    with open(RAW / f"GaN{y}.csv", encoding="utf-8", errors="replace") as fh:
        for r in csv.DictReader(fh):
            if r["ObsType"] != "GAN": continue
            total += 1
            m = r["LimitingMag"].strip()
            if m in ("-9999", "-999", ""):
                band[y]["none"] += 1; continue
            try:
                m = int(float(m)); lat = float(r["Latitude"]); lon = float(r["Longitude"])
                t = datetime.datetime.strptime(r["UTDate"] + " " + r["UTTime"], "%Y-%m-%d %H:%M")
                lt = datetime.datetime.strptime(r["LocalDate"] + " " + r["LocalTime"], "%Y-%m-%d %H:%M")
            except ValueError:
                band[y]["unreadable"] += 1; continue
            if not (0 <= m <= 7 and -90 <= lat <= 90 and -180 <= lon <= 180) or t.year != y:
                band[y]["unreadable"] += 1; continue
            band[y][str(m)] += 1
            mins, con, flag = int((t - EPOCH).total_seconds() // 60), r["Constellation"].strip(), 0
            lost = lambda kind: lostpool[y].append((kind, mins, m, r["Country"].strip() or "?",
                                                   con or "None", r["CloudCover"].strip() or "?", lt.hour * 60 + lt.minute,
                                                   round(lat * 10), round(lon * 10)))
            if abs(lat) < 0.05 and abs(lon) < 0.05:  # filed at 0 N 0 E: no place given
                band[y]["noplace"] += 1; lost(0); continue
            if con not in ANCHOR:
                band[y]["unplaceable"] += 1; lost(1); continue
            filed = mins
            if alt(lat, lon, mins, *ANCHOR[con]) <= 5:
                ml = int((lt - EPOCH).total_seconds() // 60 - lon * 4)
                if alt(lat, lon, ml, *ANCHOR[con]) > 5: mins, flag = ml, 1; band[y]["shifted"] += 1
                else: band[y]["unplaceable"] += 1; lost(1); continue
            pool[y].append((round(lat * 10), round(lon * 10), mins, m,
                            r["Country"].strip() or "?", r["Constellation"].strip() or "None",
                            r["CloudCover"].strip() or "?", flag, lt.hour * 60 + lt.minute, filed - mins))

names = {k: [] for k in ("country", "const", "cloud")}
def idx(kind, v):
    if v not in names[kind]: names[kind].append(v)
    return names[kind].index(v)

reports = []
for y in sorted(pool):
    for p in sorted(rng.sample(pool[y], min(320, len(pool[y]))), key=lambda p: p[2]):
        reports.append(list(p[:4]) + [idx("country", p[4]), idx("const", p[5]), idx("cloud", p[6]), p[7], p[8], p[9]])

lostrep = []  # [kind, filed UT minutes, chart, country, constellation, cloud, local h*60+m, lat*10, lon*10]
for y in sorted(lostpool):
    for kind in (0, 1):
        k = [p for p in lostpool[y] if p[0] == kind]
        for p in sorted(rng.sample(k, min(24, len(k))), key=lambda p: p[1]):
            lostrep.append([p[0], p[1], p[2], idx("country", p[3]), idx("const", p[4]), idx("cloud", p[5]), p[6], p[7], p[8]])

out = {"stars": stars, "reports": reports, "lost": lostrep, "countries": names["country"], "consts": names["const"],
       "clouds": names["cloud"], "band": {y: dict(band[y]) for y in sorted(band)}, "gan_reports": total}
(HERE / "data.js").write_text("window.GO=" + json.dumps(out, separators=(",", ":")) + ";\n")
summary = {"stars_to_6_5": len(stars) // 4, "gan_reports": total, "sampled": len(reports), "lost_sampled": len(lostrep),
           "drawable": sum(len(v) for v in pool.values()),
           "no_chart_filed": sum(b["none"] for b in band.values()),
           "unreadable": sum(b["unreadable"] for b in band.values()),
           "placed_by_local_time": sum(b["shifted"] for b in band.values()),
           "no_place_0N0E": sum(b["noplace"] for b in band.values()),
           "unplaceable": sum(b["unplaceable"] for b in band.values()),
           "by_year": {y: dict(band[y]) for y in sorted(band)}}
(HERE / "summary.json").write_text(json.dumps(summary, indent=1))
print(json.dumps({k: v for k, v in summary.items() if k != "by_year"}))
