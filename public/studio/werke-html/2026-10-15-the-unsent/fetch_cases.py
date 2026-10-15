"""Fetch the weather service's own alerts to Kerr County, Texas, in the night of 4 July 2025, from FEMA's
IPAWS archive (public domain), so the page can set the local keepers' silence beside them.
Writes cases.json (a short extract: time, type, event and the phone text only)."""
import json, urllib.request, urllib.parse
BASE = "https://www.fema.gov/api/open/v1/IpawsArchivedAlerts"
q = urllib.parse.urlencode({"$filter": "sender eq 'w-nws.webmaster@noaa.gov' and sent ge '2025-07-04T05:00:00.000Z'"
                            " and sent le '2025-07-04T11:00:00.000Z'", "$select": "id,sent,msgType,info",
                            "$top": 1000}, safe="$,'")
rows = json.load(urllib.request.urlopen(BASE + "?" + q, timeout=300))["IpawsArchivedAlerts"]
L = lambda i, a, b: (i.get(a) or []) + (i.get(b) or [])
out = []
for r in sorted(rows, key=lambda r: r["sent"]):
    for i in r["info"] or []:
        if "048265" in {g["value"] for a in L(i, "areas", "area") for g in a.get("geocode") or [] if g["name"] == "SAME"}:
            wea = [p.get("value") for p in L(i, "parameters", "parameter") if p["name"] == "CMAMtext"]
            out.append({"id": r["id"], "sent": r["sent"], "type": r["msgType"], "event": i.get("event"),
                        "phone_text": wea[0] if wea else None})
            break
assert len(out) == 4, len(out)
json.dump({"kerr_county_tx_2025_07_04_nws": out}, open("cases.json", "w"), indent=1)
print(json.dumps(out, indent=1))
