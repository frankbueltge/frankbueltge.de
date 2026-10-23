"""Coda IV, corrected (2026-10-23, sixth session, after the presentation): the office's two accounts.

Coda IV (2026-10-22) set NWS Norman's event page for 24 May 2011 (McLoud tornado D3: 1 injured, "injuring the truck
driver") against the national database (NCEI Storm Events, event 315890: 32 injured, no such clause), and called the page's
1 "the office's count". That was wrong as written. The same event page links, as "the official NWS Norman storm data
report for May 2011", the office's own Storm Data publication (oun201105.pdf, printed 2011-10-14). This script reads it,
and the Storm Prediction Center's tornado database (1950-2024 actual_tornadoes.csv), and asks of each account what it
gives for D3 (McLoud, om 315890) and B4 (Stillwater, Payne County, om 315880), the two tornadoes where the event page and
the database differ.

Nothing is refitted: coda IV's sweep (survey.json) already holds the Field's model at every count from 0 to 32. This
script only says which account gives which count, by its own text, asserted.

Usage: python3 -I accounts.py OUN_EVENT_PAGE OUN201105_PDF SPC_CSV
       (needs pdftotext on the path; writes accounts.json and accounts.js here)
"""
import csv, hashlib, html, json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).parent
SHA = {"oun_page": "6576cafeace2e1b1a90170a910549690d500bc9685abdd322a807498beddac53",  # refetched 2026-10-23; differs from coda IV's 952b74e0… of 2026-10-22, the D3 row and narrative do not (asserted below)
       "storm_data": "bd5ef021a6f68ce079555cf38b79a4defe8faa48876c7d60856cddcb381d225f",
       "spc": None}
ppage, ppdf, pspc = (Path(a) for a in sys.argv[1:4])
for k, p in (("oun_page", ppage), ("storm_data", ppdf)):
    assert hashlib.sha256(p.read_bytes()).hexdigest() == SHA[k], k
SHA["spc"] = hashlib.sha256(pspc.read_bytes()).hexdigest()
S = json.loads((HERE / "survey.json").read_text())
flat = lambda t: re.sub(r"\s+", " ", t).strip()

# ---- the event page: its D3 and B4 rows, and its pointer to the official report
t = ppage.read_text(encoding="utf-8", errors="replace")
assert 'href="/media/oun/stormdata/oun201105.pdf"' in t
t = flat(html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S))))
assert "The official NWS Norman storm data report for May 2011 is available here" in t
page = {"D3": re.search(r"D3 McLoud 1836-1839 2 50 EF2 (\d+) (\d+) Pottawat", t),
        "B4": re.search(r"B4 Stillwater 1750-1805 10 880 EF2 (\d+) (\d+) Payne", t)}
page = {k: {"killed": int(m.group(1)), "injured": int(m.group(2))} for k, m in page.items()}
assert S["mcloud"]["dropped"] in t and page["D3"]["injured"] == S["mcloud"]["oun_injured"] == 1
day_page = int(re.search(r"resulted in 11 deaths and (\d+) injuries", t).group(1))

# ---- Storm Data, May 2011, the office's official report
sd = subprocess.run(["pdftotext", "-layout", str(ppdf), "-"], capture_output=True, text=True, check=True).stdout
printed = re.search(r"Printed on:\s+(\d\d/\d\d/\d{4})", sd).group(1)
def entry(head, label):
    i = sd.index(head); blk = sd[i:i + 2600]
    inj = int(re.search(r"05/24/11 1\d:\d\d CST\s+(\d+)\s+0\s+Source: NWS Storm Survey", blk).group(1))
    j = blk.index(label); narr = flat(blk[j:blk.index("Monetary damage estimates were not available.", j) + 46])
    return {"injured": inj, "narrative": narr, "speaks_of_injury": bool(re.search(r"injur|hurt", narr, re.I))}
sdat = {"D3": entry("POTTAWATOMIE COUNTY --- 4.7 WSW DALE", "Tornado D3 (McLoud tornado.)"),
        "B4": entry("PAYNE COUNTY --- 7.5 SSE LAKE CARL BLACKWELL DAM", "This tornado was labeled B4")}
assert sdat["D3"]["injured"] == 32 and sdat["B4"]["injured"] == 18
# the database's narrative is Storm Data's, word for word (whitespace aside)
se = flat(S["mcloud"]["storm_events_narrative"])
assert sdat["D3"]["narrative"] == se, "narratives differ"
same_text = True

# ---- the Storm Prediction Center's database
spc = {r["om"]: r for r in csv.DictReader(pspc.open()) if r["date"] == "2011-05-24" and r["st"] == "OK"}
spcd = {"D3": int(spc["315890"]["inj"]), "B4": int(spc["315880"]["inj"])}
day_spc = sum(int(r["inj"]) for r in spc.values() if r["ns"] != "2" or r["sn"] == "1")
assert spcd == {"D3": 32, "B4": 18}

out = {"sources": {"oun_page": {"url": "https://www.weather.gov/oun/events-20110524", "sha256": SHA["oun_page"], "fetched": "2026-10-23"},
                   "storm_data": {"url": "https://www.weather.gov/media/oun/stormdata/oun201105.pdf", "sha256": SHA["storm_data"],
                                  "fetched": "2026-10-23", "printed": printed},
                   "spc": {"url": "https://www.spc.noaa.gov/wcm/data/1950-2024_actual_tornadoes.csv", "sha256": SHA["spc"], "fetched": "2026-10-23"}},
       "accounts": [
           {"key": "page", "name": "NWS Norman, event page", "official": False, "D3": page["D3"]["injured"], "B4": page["B4"]["injured"],
            "day_ok": day_page, "sentence": True},
           {"key": "storm_data", "name": "NWS Norman, Storm Data, May 2011", "official": True, "D3": sdat["D3"]["injured"],
            "B4": sdat["B4"]["injured"], "day_ok": None, "sentence": sdat["D3"]["speaks_of_injury"]},
           {"key": "storm_events", "name": "NCEI Storm Events Database", "official": None, "D3": S["mcloud"]["storm_events_injured"],
            # B4 as survey.py read the 2011 details file on 2026-10-22 (coda IV)
            "B4": 18, "day_ok": S["mcloud"]["storm_events_day_injuries_ok"], "sentence": False},
           {"key": "spc", "name": "Storm Prediction Center, tornado database", "official": None, "D3": spcd["D3"], "B4": spcd["B4"],
            "day_ok": day_spc, "sentence": None}],
       "storm_data_narrative_D3": sdat["D3"]["narrative"], "storm_data_narrative_B4": sdat["B4"]["narrative"],
       "storm_data_b4_speaks_of_injury": sdat["B4"]["speaks_of_injury"], "narrative_same_as_database": same_text,
       "sweep_at": {str(n): S["sweep"][n] for n in (1, 32)}}
(HERE / "accounts.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "accounts.js").write_text("window.ACCOUNTS=" + json.dumps(out, separators=(",", ":")) + ";\n")
print(printed, page, {k: v["injured"] for k, v in sdat.items()}, spcd, day_page, day_spc, same_text,
      sdat["D3"]["speaks_of_injury"], sdat["B4"]["speaks_of_injury"])
