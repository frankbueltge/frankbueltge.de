#!/usr/bin/env python3
"""Turn the cached year into counts.json.  No network.  Deterministic.

Two doors on the same archive: the hourly scope (1SMW) and the daily scope (1TMW),
same host, same component, same year.  Everything below is arithmetic on what those
two doors returned; nothing is imputed and nothing is inferred about causes.
"""
import gzip, json, os, sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import harvest as H

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "counts.json")
LIMIT_NO2 = 200          # Directive 2008/50/EC Annex XI: NO2 hourly limit value, ug/m3
FLAT_MIN = 3             # shortest run of identical consecutive values we record


def runs(seq, key):
    """maximal runs [(start, length, value)] over indices where key(v) holds and
       consecutive values are equal; seq is a list with None for absent."""
    out, i, n = [], 0, len(seq)
    while i < n:
        v = seq[i]
        if v is None or not key(v):
            i += 1
            continue
        j = i + 1
        while j < n and seq[j] is not None and seq[j] == v:
            j += 1
        out.append((i, j - i, v))
        i = j
    return out


def holes(arr, a, b):
    out, i = [], a
    while i <= b:
        if arr[i] is None:
            j = i
            while j <= b and arr[j] is None:
                j += 1
            out.append([i, j - i])
            i = j
        else:
            i += 1
    return out


def main():
    stations, vals, log = H.load()
    smeta = stations["data"]
    HOURS, h0 = H.HOURS, H.H0
    DAYS = HOURS // 24
    daily = {}
    dlog = []
    dpath = os.path.join(H.CACHE, "daymax.json.gz")
    if os.path.exists(dpath):
        with gzip.open(dpath, "rt") as f:
            daily = json.load(f)
        with open(os.path.join(H.CACHE, "requests_daymax.json")) as f:
            dlog = json.load(f)
    daykey = [(h0 + timedelta(days=d)).strftime("%Y-%m-%d") for d in range(DAYS)]
    hod = [(h0 + timedelta(hours=i)).hour for i in range(HOURS)]

    st_out = []
    tot_span = tot_present = tot_holes = 0
    zero_hours = 0
    flat_hours = {3: 0, 6: 0, 12: 0, 24: 0, 48: 0}
    flat_runs_all = []
    exceed_total = 0
    miss_by_hod = [0] * 24
    holes_by_day = [0] * DAYS
    flat24_by_day = [0] * DAYS
    wall_hole = [0] * HOURS      # stations with a hole in that hour
    wall_out = [0] * HOURS       # stations outside their own reporting span
    wall_flat = [0] * HOURS      # stations inside a run of >=24 identical values
    register_gap = []
    door = {
        "what": "The same archive asked a second time: scope 3 (1SMW_MAX), the daily maximum "
                "of the hourly values, one number per station per day, against the hours the "
                "first door publishes for that day.",
        "daily_average_scope": "Scope 1 (1TMW, daily average) serves nothing for NO2: the "
                               "call that returns 388 stations for PM10 returns zero for NO2, "
                               "checked 2026-09-18 for January 2024.",
        "checked": 0, "with_max": 0, "without_max": 0,
        "max_but_no_hour": 0, "hours_but_no_max": 0,
        "agree": 0, "max_above_hours": 0, "max_below_hours": 0,
        "hours_hist_with_max": [0] * 25, "hours_hist_without_max": [0] * 25,
        "min_hours_with_max": 25,
        "offset_agreement": {"-1": 0, "0": 0, "+1": 0},
        "examples_max_above": [], "examples_max_but_no_hour": [],
    }
    values_hist = {}

    for sid, arr in vals.items():
        pres = [i for i in range(HOURS) if arr[i] is not None]
        if not pres:
            continue
        a, b = pres[0], pres[-1]
        span, present = b - a + 1, len(pres)
        hl = holes(arr, a, b)
        missing = span - present

        zr = runs(arr, lambda v: v == 0)
        zero_h = sum(l for _, l, _ in zr)
        zero_hours += zero_h

        fr = [r for r in runs(arr, lambda v: True) if r[1] >= FLAT_MIN]
        for k in flat_hours:
            flat_hours[k] += sum(l for _, l, _ in fr if l >= k)
        for i in range(0, a):
            wall_out[i] += 1
        for i in range(b + 1, HOURS):
            wall_out[i] += 1
        for (s, l, v) in fr:
            if l >= 12:
                flat_runs_all.append({"station": int(sid), "start": s, "len": l, "value": v})
            if l >= 24:
                for i in range(s, s + l):
                    flat24_by_day[i // 24] += 1
                    wall_flat[i] += 1

        exc = sum(1 for i in pres if arr[i] > LIMIT_NO2)
        exceed_total += exc
        for i in pres:
            values_hist[arr[i]] = values_hist.get(arr[i], 0) + 1
        for (s, l) in hl:
            for i in range(s, s + l):
                miss_by_hod[hod[i]] += 1
                holes_by_day[i // 24] += 1
                wall_hole[i] += 1

        # ---- the second door ---------------------------------------------------
        dd = daily.get(sid, {})
        st_door = {"max_but_no_hour": 0, "hours_but_no_max": 0, "max_above_hours": 0}
        if daily:
            for d in range(a // 24, b // 24 + 1):
                hv = [arr[i] for i in range(d * 24, min(HOURS, d * 24 + 24))
                      if arr[i] is not None]
                n = len(hv)
                dmax = dd.get(daykey[d])
                door["checked"] += 1
                if dmax is None:
                    door["without_max"] += 1
                    door["hours_hist_without_max"][n] += 1
                    if n:
                        door["hours_but_no_max"] += 1
                        st_door["hours_but_no_max"] += 1
                else:
                    door["with_max"] += 1
                    door["hours_hist_with_max"][n] += 1
                    door["min_hours_with_max"] = min(door["min_hours_with_max"], n)
                    if n == 0:
                        door["max_but_no_hour"] += 1
                        st_door["max_but_no_hour"] += 1
                        if len(door["examples_max_but_no_hour"]) < 60:
                            door["examples_max_but_no_hour"].append(
                                {"station": m[1] if (m := smeta.get(sid)) else sid,
                                 "day": daykey[d], "max": dmax})
                    else:
                        hm = max(hv)
                        if abs(hm - dmax) < 1e-9:
                            door["agree"] += 1
                        elif dmax > hm:
                            door["max_above_hours"] += 1
                            st_door["max_above_hours"] += 1
                            if len(door["examples_max_above"]) < 60:
                                door["examples_max_above"].append(
                                    {"station": (smeta.get(sid) or [None, sid])[1],
                                     "day": daykey[d], "max": dmax, "highest_hour": hm,
                                     "hours": n})
                        else:
                            door["max_below_hours"] += 1
                # which day the published maximum belongs to, decided empirically
                for off, key in ((-1, "-1"), (0, "0"), (1, "+1")):
                    e = d + off
                    if 0 <= e < DAYS:
                        hv2 = [arr[i] for i in range(e * 24, min(HOURS, e * 24 + 24))
                               if arr[i] is not None]
                        if hv2 and dmax is not None and abs(max(hv2) - dmax) < 1e-9:
                            door["offset_agreement"][key] += 1

        m = smeta.get(sid)
        tenths = any(arr[i] is not None and float(arr[i]) != int(float(arr[i]))
                     for i in pres)
        first_day = (h0 + timedelta(hours=a)).date().isoformat()
        last_day = (h0 + timedelta(hours=b)).date().isoformat()
        if m:
            if m[5] and m[5] > first_day:
                register_gap.append({"code": m[1], "name": m[2], "kind": "starts_after",
                                     "register": m[5], "record": first_day,
                                     "hours_in_year": present})
            if m[6] and m[6] < last_day:
                register_gap.append({"code": m[1], "name": m[2], "kind": "ends_before",
                                     "register": m[6], "record": last_day,
                                     "hours_in_year": present})
        st_out.append({
            "id": int(sid), "code": m[1] if m else None, "name": m[2] if m else None,
            "city": m[3] if m else None,
            "lon": float(m[7]) if m and m[7] else None,
            "lat": float(m[8]) if m and m[8] else None,
            "network": m[12] if m else None, "network_name": m[13] if m else None,
            "setting": m[15] if m else None, "type": m[16] if m else None,
            "active_from": m[5] if m else None, "active_to": m[6] if m else None,
            "first_hour": a, "last_hour": b, "span": span, "present": present,
            "missing": missing, "holes": hl, "n_holes": len(hl),
            "longest_hole": max([l for _, l in hl], default=0),
            "capture_span": present / span, "capture_year": present / HOURS,
            "zero_hours": zero_h,
            "longest_zero_run": max([l for _, l, _ in zr], default=0),
            "flat_runs_ge12": [[s, l, v] for (s, l, v) in fr if l >= 12],
            "longest_flat": max([l for _, l, _ in fr], default=1),
            "longest_flat_value": max(fr, key=lambda r: r[1])[2] if fr else None,
            "hours_in_flat_ge24": sum(l for _, l, _ in fr if l >= 24),
            "exceedances": exc,
            "tenths": tenths,
            "max_value": max(arr[i] for i in pres),
            "mean_value": sum(arr[i] for i in pres) / present,
            "door": st_door,
        })
        tot_span += span
        tot_present += present
        tot_holes += missing

    st_out.sort(key=lambda s: (s["network"] or "", s["code"] or ""))
    reported = {str(s["id"]) for s in st_out}
    never = [{"id": int(k), "code": v[1], "name": v[2], "city": v[3], "type": v[16],
              "network": v[12], "active_from": v[5], "active_to": v[6]}
             for k, v in smeta.items() if k not in reported]
    never.sort(key=lambda s: (s["network"] or "", s["code"] or ""))

    rl = {}
    for s0 in st_out:
        for _, l in s0["holes"]:
            rl[l] = rl.get(l, 0) + 1
    flat_runs_all.sort(key=lambda r: -r["len"])
    caps = sorted(s["capture_span"] for s in st_out)
    capy = sorted(s["capture_year"] for s in st_out)
    hist = [0] * 21
    for c in capy:
        hist[min(20, int(c * 20))] += 1

    netres = {}
    for s0 in st_out:
        n = s0["network"]
        e = netres.setdefault(n, {"network": n, "name": s0["network_name"],
                                  "stations": 0, "with_decimals": 0,
                                  "flat_runs_ge12": 0})
        e["stations"] += 1
        e["flat_runs_ge12"] += len(s0["flat_runs_ge12"])
        if s0["tenths"]:
            e["with_decimals"] += 1

    out = {
        "_note": "Recomputed from the cache by measure.py with no network. counts.json is "
                 "the only input to build.py. Nothing here is imputed or modelled.",
        "source": {
            "api": H.BASE,
            "endpoints": ["/stations/json", "/measures/json"],
            "component": {"id": H.COMPONENT, "code": "NO2", "unit": "ug/m3",
                          "name": "Nitrogen dioxide"},
            "scopes": {"hourly": "1SMW, one hour average (scope 2)",
                       "daily": "1TMW, daily average (scope 1)"},
            "year": H.YEAR, "hours_in_year": HOURS, "days_in_year": DAYS,
            "requests_hourly": len(log), "requests_daily": len(dlog),
            "timezone": "CET throughout, as the API states for its JSON door",
            "provenance": "The API's own interface description (UBA, 17 December 2025) says "
                          "data of the current year are not finally checked and that final "
                          "data are provided in June of the following year. 2024 was "
                          "harvested on 2026-09-18 and is therefore the final series.",
            "robots": "robots.txt of luftdaten.umweltbundesamt.de was read before any data "
                      "request; /api/ is not disallowed and that host states no crawl-delay. "
                      "The www host it redirects from states crawl-delay 10; this harvester "
                      "waited 12 s between requests.",
        },
        "totals": {
            "stations_listed_active": stations["count"],
            "stations_with_no2": len(st_out),
            "stations_listed_without_no2": len(never),
            "span_hours": tot_span, "present_hours": tot_present,
            "hole_hours": tot_holes,
            "capture_span": tot_present / tot_span if tot_span else None,
            "year_hours": len(st_out) * HOURS,
            "capture_year": tot_present / (len(st_out) * HOURS) if st_out else None,
            "hole_runs": sum(s["n_holes"] for s in st_out),
            "stations_without_a_single_hole": sum(1 for s in st_out if s["missing"] == 0),
            "zero_hours": zero_hours,
            "flat_hours": flat_hours,
            "flat_runs_ge12": len(flat_runs_all),
            "exceedance_hours": exceed_total,
            "stations_over_18_exceedances": sum(1 for s in st_out if s["exceedances"] > 18),
            "stations_with_any_exceedance": sum(1 for s in st_out if s["exceedances"] > 0),
        },
        "law": {
            "instrument": "Directive 2008/50/EC of the European Parliament and of the "
                          "Council of 21 May 2008 on ambient air quality and cleaner air "
                          "for Europe",
            "annex_capture": "Annex I, Section A - Data quality objectives",
            "minimum_data_capture_fixed": "90 %",
            "footnote": "The requirements for minimum data capture and time coverage do not "
                        "include losses of data due to the regular calibration or the normal "
                        "maintenance of the instrumentation.",
            "hourly_limit_value_no2": LIMIT_NO2,
            "hourly_limit_allowance": 18,
            "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32008L0050",
            "hours_the_rule_permits": round(HOURS * 0.10, 1),
            "successor": "Directive (EU) 2024/2881, which replaces it from 11 December 2026",
        },
        "capture": {
            "histogram_bins": 20, "histogram_year": hist,
            "below_90_span": sum(1 for s in st_out if s["capture_span"] < 0.90),
            "below_90_year": sum(1 for s in st_out if s["capture_year"] < 0.90),
            "min_span": caps[0] if caps else None,
            "median_span": caps[len(caps) // 2] if caps else None,
            "min_year": capy[0] if capy else None,
            "median_year": capy[len(capy) // 2] if capy else None,
        },
        "shape": {"holes_by_hour_of_day": miss_by_hod, "holes_by_day": holes_by_day,
                  "flat24_by_day": flat24_by_day,
                  "hole_run_lengths": rl},
        "wall": {"hole": wall_hole, "outside": wall_out, "flat24": wall_flat},
        "register_vs_record": register_gap,
        "two_doors": door,
        "values_histogram": {str(k): v for k, v in sorted(values_hist.items())},
        "resolution_by_network": [netres[k] for k in sorted(netres)],
        "longest_flat_runs": flat_runs_all[:400],
        "stations": st_out,
        "stations_listed_without_no2": never,
    }
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    t = out["totals"]
    print("stations %d (+%d listed without NO2)" % (t["stations_with_no2"],
                                                    t["stations_listed_without_no2"]))
    print("span %d present %d holes %d (%d runs)  capture_span %.6f capture_year %.6f" %
          (t["span_hours"], t["present_hours"], t["hole_hours"], t["hole_runs"],
           t["capture_span"], t["capture_year"]))
    print("no hole at all: %d stations; below 90%% of the year: %d" %
          (t["stations_without_a_single_hole"], out["capture"]["below_90_year"]))
    print("zeros %d; flat hours >=3/6/12/24/48: %s; runs>=12: %d" %
          (t["zero_hours"], t["flat_hours"], t["flat_runs_ge12"]))
    print("exceedance hours %d at %d stations (%d over 18)" %
          (t["exceedance_hours"], t["stations_with_any_exceedance"],
           t["stations_over_18_exceedances"]))
    print("two doors:", {k: v for k, v in door.items() if not isinstance(v, list)})
    if flat_runs_all[:5]:
        print("longest flats:", flat_runs_all[:5])


if __name__ == "__main__":
    main()
