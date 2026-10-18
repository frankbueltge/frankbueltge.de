"""Plate VI, Four Moments. Runs the Studio's dealt local warnings (FILED UNDER, studio@40b163d,
works/2026-10-16-filed-under/data.js, sha256 asserted) through the four moments at which,
in Trouillot's sentence, silences enter the making of history: sources, archives, narratives,
significance. For each warning and each of the three fates (heeded, ignored, never needed) it
records the first moment at which the record falls silent, and whether that silence was made
(someone could have written the source and did not) or could not be made (no source of it exists
to be written).

The rules, fixed before counting (2026-10-18):
  heeded        moment 1, unmakeable: its fact is the danger that did not come because people
                acted, a counterfactual. No source of it can be made in the world that happened.
  ignored       moment 1, made: the alert archive keeps the message sent, not who received it or
                what anyone did. A survey of the warned could make that source; none is in either
                archive.
  never needed  moment 1, made, where no disaster was declared in the warning's counties around its
                day (the Studio's window): the declarations are the only source of whether a danger
                came, and they are made only above a threshold.
                moment 2, made, where a declaration exists: the two archives are kept apart. The
                alert standard has a slot for the incident a message belongs to ('incidents'); the
                probe (plate6-probe.json) counts what keepers wrote there. No message names a
                disaster number, so no link is assembled.
                moment 3: the Studio's reader rejoins the two archives by county, day and danger
                words. Where the words name the declared danger the record now CONTRADICTS never
                needed: a voice made at retrieval. Where they do not, silent at moment 3.
                moment 4: nothing in either archive later writes a warning's fate. The keeper's own
                later word (the card's fate: silence, end-mute, update, end-clear) says whether a
                warning ended, never which column it belongs to. Nothing is BACKED.
Upstream of the 13,371 the reader also silences at moment 3, on purpose: 9,783 of 23,154 warnings
are not dealt (person rules 8,142 + 963, all-clears 678), as summary.json records.

Usage: python3 -I plate6.py STUDIO_DATA_JS          (writes plate6.js and plate6.json beside itself)
       python3 -I plate6.py STUDIO_DATA_JS --probe  (refetches the incidents probe from OpenFEMA first)
"""
import json, sys, hashlib, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
SRC = Path(sys.argv[1])
SHA = "3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef"
raw = SRC.read_bytes()
assert hashlib.sha256(raw).hexdigest() == SHA, "not the Studio's data.js at 40b163d"
s = raw.decode()

def block(name, nxt):
    i = s.index("window." + name + "=") + len(name) + 8
    j = s.index("window." + nxt + "=") if nxt else len(s)
    return json.loads(s[i:j].strip().rstrip(";"))

NAMES, SUMMARY, DECL, CARDS = block("NAMES", "SUMMARY"), block("SUMMARY", "DECL"), block("DECL", "CARDS"), block("CARDS", None)
assert len(CARDS) == SUMMARY["dealt"] == 13371

if "--probe" in sys.argv:
    import urllib.request
    vals, n = collections.Counter(), 0
    for skip in range(0, 5000, 1000):
        u = ("https://www.fema.gov/api/open/v1/IpawsArchivedAlerts?$filter=incidents%20ne%20null"
             f"&$select=incidents&$top=1000&$skip={skip}")
        rows = json.load(urllib.request.urlopen(u))["IpawsArchivedAlerts"]
        for r in rows:
            vals[str(r["incidents"]).strip()] += 1; n += 1
        if len(rows) < 1000: break
    tot = json.load(urllib.request.urlopen(
        "https://www.fema.gov/api/open/v1/IpawsArchivedAlerts?$select=id&$top=1&$count=true"))["metadata"]["count"]
    (HERE / "plate6-probe.json").write_text(json.dumps({
        "asked": dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"), "archive_messages": tot,
        "incidents_filled": n, "values": dict(vals.most_common())}, indent=1))
PROBE = json.loads((HERE / "plate6-probe.json").read_text())
PLACEHOLDER = {"", "incidents", "1234", "THIS IS ONLY A TEST", "IPAWS-0001", "CMSP-0001"}
named = {k: v for k, v in PROBE["values"].items() if k not in PLACEHOLDER}
assert not any(k.upper().startswith(("DR-", "EM-", "FM-")) for k in named), "a message names a disaster number"

# one row per warning: [minute, code, words, first place, places, decl id, decl title, never-needed moment, voice, end]
rows, M = [], collections.Counter()
for c in CARDS:
    if not c["dl"]:
        nn_m, voice, did, dtitle = 1, "silent", "", ""
    else:
        d = DECL[c["dl"][0][0]]
        did, dtitle = d[0], d[1]
        if c["nn"] == "contradicted":
            nn_m, voice = 4, "contradicts"
        else:
            nn_m, voice = 3, "silent"
    M[(nn_m, voice)] += 1
    rows.append([c["t"], c["c"], c["w"][:96], c["p"][0] if c["p"] else "", c["pn"], did, dtitle, nn_m, voice, c["f"]])

nn = SUMMARY["never_needed"]
assert M[(1, "silent")] == 10733 and M[(3, "silent")] == 234 and M[(4, "contradicts")] == nn["contradicted"] == 2404
assert SUMMARY["heeded_backed"] == SUMMARY["ignored_backed"] == SUMMARY["record_can_back_at_most"] == 0

out = {
    "source": {"repo": "frankbueltge/studio", "commit": "40b163de16fb5e6b61b69243d7ca78faa5659b1b",
               "path": "works/2026-10-16-filed-under/data.js", "sha256": SHA, "handoff": "ho-2026-10-16-studio-5"},
    "upstream": {"warnings": SUMMARY["warnings"], "dealt": SUMMARY["dealt"],
                 "not_dealt_by_reader": SUMMARY["warnings"] - SUMMARY["dealt"],
                 "person_rule": SUMMARY["withheld_not_dealt"], "wider_person_rule": SUMMARY["s176_withheld_by_wider_person_rule"],
                 "all_clears": SUMMARY["s176_allclear_not_dealt"]},
    "heeded": {"silent_at": 1, "kind": "unmakeable", "n": len(CARDS)},
    "ignored": {"silent_at": 1, "kind": "made", "n": len(CARDS)},
    "never_needed": {"silent_at_1_no_declaration": M[(1, "silent")],
                     "silent_at_2_archives_apart": M[(3, "silent")] + M[(4, "contradicts")],
                     "voice_made_at_3_contradicts": M[(4, "contradicts")],
                     "silent_at_3_words_do_not_name": M[(3, "silent")],
                     "backed_at_any_moment": 0},
    "endings_at_4": SUMMARY["fates_dealt"],
    "probe": {"archive_messages": PROBE["archive_messages"], "incidents_filled": PROBE["incidents_filled"],
              "named_an_incident": named, "named_a_disaster_number": 0, "asked": PROBE["asked"]},
}
(HERE / "plate6.json").write_text(json.dumps(out, indent=1))
(HERE / "plate6.js").write_text(
    "// generated by plate6.py from the Studio's FILED UNDER data (FEMA OpenFEMA, public domain)\n"
    "const P6=" + json.dumps(out, separators=(",", ":")) + ";\n"
    "const P6N=" + json.dumps(NAMES, separators=(",", ":")) + ";\n"
    "const P6R=" + json.dumps(rows, separators=(",", ":"), ensure_ascii=False) + ";\n")
print(json.dumps(out["never_needed"]), out["upstream"]["not_dealt_by_reader"])
