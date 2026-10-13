"""Join the impact list, the population estimates and the Field's warning clock into data.json.
Run after fetch.py: python3 -I build_data.py"""
import datetime as dt, hashlib, json, math, re
man = json.load(open("raw-manifest.json"))
wt = open("raw/list.wikitext", encoding="utf-8").read()
def ut(s):  # '2026-5-15 13:36' or '2008-10-06 06:39'
    d, t = s.strip().split(" "); y, m, dd = map(int, d.split("-")); h, mi = map(int, t.split(":"))
    return dt.datetime(y, m, dd, h, mi, tzinfo=dt.timezone.utc)
def plain(s):
    s = re.sub(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>", "", s)
    s = re.sub(r"\{\{mpl?\|([^|}]+)\|([^}]+)\}\}", r"\1\2", s); s = re.sub(r"\{\{mpl?\|([^|}]+)\}\}", r"\1", s)
    s = re.sub(r"\[\[[^|\]]*\|([^\]]+)\]\]", r"\1", s); s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"\{\{cvt\|([^|]+)\|([^|]+)\|([^|}]+)\|[^}]*\}\}", r"\1–\3 m", s)
    return re.sub(r"\{\{[^}]*\}\}", "", s).replace("<br>", " · ").strip()
def sun_alt(t, lat, lon):  # solar altitude in degrees (NOAA low-precision formulae; ±1° is plenty here)
    n = (t - dt.datetime(2000, 1, 1, 12, tzinfo=dt.timezone.utc)).total_seconds() / 86400
    L = math.radians((280.460 + 0.9856474 * n) % 360); g = math.radians((357.528 + 0.9856003 * n) % 360)
    lam = L + math.radians(1.915) * math.sin(g) + math.radians(0.020) * math.sin(2 * g)
    eps = math.radians(23.439 - 0.0000004 * n)
    dec = math.asin(math.sin(eps) * math.sin(lam)); ra = math.atan2(math.cos(eps) * math.sin(lam), math.cos(lam))
    gmst = (18.697374558 + 24.06570982441908 * n) % 24
    ha = math.radians(gmst * 15 + lon) - ra
    la = math.radians(lat)
    return math.degrees(math.asin(math.sin(la) * math.sin(dec) + math.cos(la) * math.cos(dec) * math.cos(ha))), math.degrees(dec), (math.degrees(ra) % 360), gmst
rows = []
for m in re.finditer(r'\|-id="([^"]+)"\n(.*)', wt):
    key, row = m.group(1), m.group(2)
    cells = [c.strip() for c in row.lstrip("|").split("||")]
    des = plain(cells[0]).split(" · ")[0]
    disc_t, _, survey = cells[1].partition("<br>")
    c = re.search(r"\{\{Coord\|([\d.]+)\|([NS])\|([\d.]+)\|([EW])", cells[6])
    lat = float(c.group(1)) * (1 if c.group(2) == "N" else -1); lon = float(c.group(3)) * (1 if c.group(4) == "E" else -1)
    t0, t1 = ut(disc_t), ut(cells[5])
    pop = json.load(open(f"raw/pop_{key}.json"))
    assert pop["error"] is False, key
    alt, dec, ra, gmst = sun_alt(t1, lat, lon)
    sub = [round(dec, 2), round(((ra - gmst * 15 + 540) % 360) - 180, 2)]  # sub-solar point at impact: lat, lon
    solar = (t1.hour + t1.minute / 60 + lon / 15) % 24
    held_h = (t1 - t0).total_seconds() / 3600
    p = pop["data"]["total_population"]
    rows.append({"id": key, "des": des, "discovered_utc": t0.strftime("%Y-%m-%d %H:%M"), "survey": plain(survey),
                 "impact_utc": t1.strftime("%Y-%m-%d %H:%M"), "held_h": round(held_h, 3), "list_warning": plain(cells[2]),
                 "lat": lat, "lon": lon, "place": plain(cells[6].split("}}", 1)[1]).lstrip(" ·"),
                 "size": plain(cells[3]), "detected_by": plain(cells[8]),
                 "residents_50km": round(p), "person_hours": round(p * held_h),
                 "local_solar_time": f"{int(solar):02d}:{int(solar % 1 * 60):02d}", "sun_alt_deg": round(alt, 1),
                 "dark": alt < -6, "subsolar": sub,
                 "field_day": (t1.date() - t0.date()).days, "confirmed": "unconfirmed" not in plain(cells[8]).lower(), "pop_request_sha256": man["files"][f"raw/pop_{key}.json"]["sha256"]})
# the Field's warning clock (study 11), summed over its three size groups: close passages 2015-2025, whole days of warning
F = json.load(open("raw/field_results.json"))
clock = {}
for g, v in F["clock_close_recent"].items():
    for k, n in v.items(): clock[int(k)] = clock.get(int(k), 0) + n
out = F["clock_close_recent_outside"]
summary = {
    "impacts": len(rows), "on_land_or_coast": sum(r["residents_50km"] > 0 for r in rows),
    "residents_total": sum(r["residents_50km"] for r in rows), "person_hours_total": sum(r["person_hours"] for r in rows),
    "held_h_min": min(r["held_h"] for r in rows), "held_h_max": max(r["held_h"] for r in rows),
    "held_h_median": sorted(r["held_h"] for r in rows)[len(rows) // 2],
    "dark_at_impact": sum(r["dark"] for r in rows), "dark_and_inhabited": sum(r["dark"] and r["residents_50km"] > 0 for r in rows),
    "field_clock_total": sum(clock.values()), "field_clock_day0": clock[0],
    "field_clock_warned_ge1": sum(n for k, n in clock.items() if k >= 1),
    "impacts_field_day0": sum(r["field_day"] == 0 for r in rows), "impacts_field_day1": sum(r["field_day"] == 1 for r in rows),
    "field_clock_after": sum(n for k, n in clock.items() if k <= -1),
}
data = {"summary": summary, "rows": rows,
        "field_clock": {"days": sorted(clock), "n": [clock[k] for k in sorted(clock)], "outside": out,
                        "source": F["source"], "commit": "428a86db60125c1525d61cb30e331f730ac8e663",
                        "path": "artifacts/2026-10-13-seen-coming/data/results.json", "key": "clock_close_recent",
                        "sign": "days of warning = passage day minus the day the record first held the object; positive = held ahead"},
        "conventions": {"disc_km": 50, "pop_dataset": "WorldPop global unconstrained 2020 (wpgppop), via api.worldpop.org zonal statistics",
                        "dark": "sun more than 6 degrees below the horizon at the listed point (civil twilight over)",
                        "dot": 1000}}
json.dump(data, open("data.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(summary, indent=1))
for r in rows: print(r["des"], r["held_h"], r["residents_50km"], r["local_solar_time"], r["sun_alt_deg"], r["place"])
