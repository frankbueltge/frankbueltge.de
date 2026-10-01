"""Derive tonight's figures from the committed PEGELONLINE files (DL-DE->Zero-2.0).

Inputs: elbe-stations.json (all ELBE stations, current W and characteristic
values), w-DRESDEN-P31D.json, w-SCHÖNA-P31D.json. Output: derived.txt.
Readings are the service's raw data ("Rohdaten"), unchecked by the provider.
"""
import json
from collections import Counter

st = json.load(open("elbe-stations.json"))
out = []
rows = []
for s in st:
    w = [t for t in s.get("timeseries", []) if t["shortname"] == "W"]
    if not w:
        continue
    t = w[0]
    cv = {c["shortname"]: c for c in t.get("characteristicValues", [])}
    cm = t.get("currentMeasurement") or {}
    if "MNW" not in cv or "value" not in cm:
        continue
    rows.append((s["longname"], s.get("km"), cm["timestamp"], cm["value"],
                 cv["MNW"]["value"], cv.get("NNW", {}).get("value"),
                 cv.get("NNW", {}).get("occurrences", []),
                 cv["MNW"].get("timespanStart"), cv["MNW"].get("timespanEnd")))

out.append("Gauges on the Elbe with a current W reading and an MNW value: %d" % len(rows))
below = [r for r in rows if r[3] < r[4]]
out.append("Of these, reading below MNW (mean of annual low waters) tonight: %d" % len(below))
out.append("")
out.append("%-24s %8s  %-25s %6s %6s %6s  %s" % ("gauge", "km", "timestamp", "W", "MNW", "NNW", "NNW occurred"))
for r in rows:
    mark = "  <MNW" if r[3] < r[4] else ""
    out.append("%-24s %8s  %-25s %6.0f %6.0f %6s  %s%s" % (
        r[0], r[1], r[2], r[3], r[4], "" if r[5] is None else "%.0f" % r[5],
        ",".join(r[6]), mark))
out.append("")
spans = Counter((r[7], r[8]) for r in rows)
out.append("MNW reference periods: %s" % dict(spans))
years = Counter(o[:4] for r in rows for o in r[6])
out.append("Years in which a gauge's lowest recorded level (NNW) occurred, count of gauges: %s"
           % dict(sorted(years.items())))
out.append("")
for name, mnw in (("DRESDEN", 67.0), ("SCHÖNA", 82.0)):
    m = json.load(open("w-%s-P31D.json" % name))
    v = [x["value"] for x in m]
    n_below = sum(1 for x in v if x < mnw)
    out.append("%s, last 31 days: %d readings (15-min), %s to %s; min %.0f, max %.0f; "
               "%d of %d readings (%.1f %%) below MNW %.0f"
               % (name, len(m), m[0]["timestamp"], m[-1]["timestamp"], min(v), max(v),
                  n_below, len(v), 100.0 * n_below / len(v), mnw))
open("derived.txt", "w").write("\n".join(out) + "\n")
print("\n".join(out))
