"""Study 24, step 1 (predictor side only; no outcome is read here).

Reads the Studio's dealt local warnings (FILED UNDER, studio@40b163d,
works/2026-10-16-filed-under/data.js, sha256 asserted) and assigns each warning the hazard
classes its event code and words name, by the fixed rules below, written before any storm
record was fetched. Rules v2: revised once, after a hand reading of 60 classified messages (seed 24) and before
any storm record was fetched; v1 and the reading are recorded in PREREGISTRATION-24.md.
A class is COVERED when a public record below the declaration threshold
(NOAA NCEI Storm Events) keeps events of that kind by county or forecast zone.

Usage: python3 -I classify_24.py STUDIO_DATA_JS   (writes data/warnings_24.tsv.gz, data/coverage_24.json)
"""
import json, sys, re, gzip, hashlib, collections
from pathlib import Path

HERE = Path(__file__).parent
SHA = "3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef"
raw = Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(raw).hexdigest() == SHA, "not the Studio's data.js at 40b163d"
s = raw.decode()
CARDS = json.loads(s[s.index("window.CARDS=") + 13:].strip().rstrip(";"))
assert len(CARDS) == 13371

# Storm Events event types per class (names as NCEI writes them).
TYPES = {
    "fire": ["Wildfire", "Dense Smoke"],
    "flood": ["Flash Flood", "Flood", "Coastal Flood", "Lakeshore Flood", "Debris Flow", "Heavy Rain"],
    "winter": ["Winter Storm", "Heavy Snow", "Blizzard", "Ice Storm", "Winter Weather", "Lake-Effect Snow",
               "Extreme Cold/Wind Chill", "Cold/Wind Chill", "Frost/Freeze", "Freezing Fog", "Sleet"],
    "heat": ["Heat", "Excessive Heat"],
    "severe": ["Tornado", "Thunderstorm Wind", "Hail", "High Wind", "Strong Wind", "Hurricane", "Hurricane (Typhoon)",
               "Tropical Storm", "Tropical Depression", "Storm Surge/Tide", "Lightning", "Funnel Cloud", "Dust Storm"],
    "avalanche": ["Avalanche"],
}
NOT_FIRE = re.compile(r"burn ban|fireworks?|firearms?|fire hydrant|fire danger|red flag|fire (dept|department|station|chief|marshal)|fire weather|fire restrictions?|prevent fires")
RULES = [
    ("fire", re.compile(r"\b(wild ?fires?|brush ?fires?|grass ?fires?|forest ?fires?|fires?|blaze)\b|[a-z]fire\b|\bcalfire|fire[a-z]*\.(org|com|gov|info)")),
    ("flood", re.compile(r"\b(flood\w*|levee|dam (failure|breach|break)|debris flow|mud ?slides?|high water|rising water|swift water|higher? ground)\b")),
    ("winter", re.compile(r"\b(snow\w*|blizzard|ice storm|icy|winter storm|freezing|wind chill|extreme cold)\b")),
    ("heat", re.compile(r"\b(heat|cooling (center|centre)s?)\b")),
    ("severe", re.compile(r"\b(tornado\w*|thunderstorms?|hurricane|tropical storm|storm surge|high winds?|damaging winds?|hail|severe (weather|storms?))\b")),
    ("avalanche", re.compile(r"\bavalanche\b")),
]
UNJOINED = re.compile(r"\b(earthquake|tsunami)\b")

def classes(c):
    w = c["w"].lower()
    out = []
    for name, rx in RULES:
        if name == "fire":
            if c["c"] == "FRW" or (rx.search(NOT_FIRE.sub(" ", w))):
                out.append(name)
        elif rx.search(w) or (name == "avalanche" and c["c"] == "AVW"):
            out.append(name)
    unj = bool(c["c"] == "EQW" or UNJOINED.search(w))
    return out, unj

rows, cov = [], collections.Counter()
for i, c in enumerate(CARDS):
    cl, unj = classes(c)
    group = "declared" if c["dl"] else "undeclared"
    status = "covered" if cl else ("register_unjoined" if unj else "uncovered")
    primary = cl[0] if cl else status
    cov[(group, status)] += 1
    cov[(group, "primary:" + primary)] += 1
    rows.append([i, c["t"], c["lt"], c["c"], ",".join(c["g"]), group, c["nn"], ",".join(cl), status, primary])

(HERE / "data").mkdir(exist_ok=True)
with gzip.open(HERE / "data" / "warnings_24.tsv.gz", "wt") as f:
    f.write("i\tt_min\tlife_min\tcode\tcounties\tgroup\tnn\tclasses\tstatus\tprimary\n")
    for r in rows:
        f.write("\t".join(map(str, r)) + "\n")
out = {"types": TYPES, "counts": {f"{g}|{k}": v for (g, k), v in sorted(cov.items())}}
(HERE / "data" / "coverage_24.json").write_text(json.dumps(out, indent=1))
for (g, k), v in sorted(cov.items()):
    print(g, k, v)
