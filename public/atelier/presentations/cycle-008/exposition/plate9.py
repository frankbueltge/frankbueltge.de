"""Plate IX, The Closed World. Built on the Field's study 24 (field-research@5f149d7,
artifacts/2026-10-14-the-warnings-never-needed/s24/data/, sha256 of each input asserted), offered to
this practice in the Field's bulletin of 2026-10-18 (s209) and open in the relay as
ho-2026-10-18-field-5: below the disaster declarations, NOAA's Storm Events contradicts "never needed"
for 10.8 % of the undeclared local warnings and backs it for none, and most of the pool names a danger
no joined public record keeps. The warnings themselves are the Studio's FILED UNDER (studio@40b163d,
works/2026-10-16-filed-under/data.js, sha256 asserted), the same 13,371 as plate VI.

Nothing is rescored and the Field's classifier is not run: its per-warning classes and meetings are
read from met_24.tsv.gz as published, and this script asserts that they re-add to the Field's totals.
The question the plate asks of them is not the Field's. It reads them through Raymond Reiter,
"On Closed World Data Bases" (UBC Technical Report 77-16, October 1977; published in Gallaire and
Minker, eds., Logic and Data Bases, Plenum 1978), read in full on 2026-10-19: under the closed world
assumption a negative fact is "implicitly present provided its positive counterpart is not explicitly
present", and that "presumes total knowledge about the domain being represented" (TR p. 6).

The rules, fixed before counting (2026-10-19):
  pool        the Studio's warnings with no disaster declared in their window, sent before the Field's
              frame end (2026-04-01T00:00Z): plate VI's 10,733 silences at moment 1, cut to the frame.
  register    for each warning, the lower record that keeps its danger: Storm Events, in the Field's
              class (fire, flood, severe, winter, heat, avalanche) where met_24.tsv.gz lists it, else
              none. The declarations keep only declared disasters.
  met         the Field's: an event of the named class in the warning's counties within a day.
              placebo: the same counties and day a year earlier (the chance a contradiction is
              coincidence).
  a reading   says, for each register and each class, whether it is held CLOSED (what it does not
              record did not happen) or OPEN (what it does not record is unknown). Under a reading a
              warning is
                CONTRADICTED  if a consulted register records its danger met;
                NEVER NEEDED  if not, and every register that could speak to its danger is held
                              closed, and at least one register is held closed over it;
                UNKNOWN       otherwise.
              BACKED (a register writes, positively, that the danger did not come) is counted under
              every reading. Neither register writes such a row: both list events, not their absence.
  the four named readings
    A  the declarations, closed over every danger      (a count of false alarms from declarations)
    B  both registers, closed over every danger
    C  each register closed only over what it keeps    (Reiter's warrant, taken literally)
    D  the open world

Usage: python3 -I plate9.py STUDIO_DATA_JS FIELD_S24_DATA_DIR   (writes plate9.json, plate9.js)
"""
import json, sys, gzip, csv, hashlib, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
SRC, D = Path(sys.argv[1]), Path(sys.argv[2])
SHA_STUDIO = "3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef"
FIELD = "5f149d76db1fa0b76ee572e95f8d924d96acb37b"
SHA = {"met_24.tsv.gz": "adc8b017afed1a5a8a2ecce289562ef93f28108e25dec69bcfad2354f54917b7",
       "results_24.json": "b4baee2421a758a365c0db0432d63c686ba428e8bc842b75eef8edd26ebf06c8"}
raw = SRC.read_bytes()
assert hashlib.sha256(raw).hexdigest() == SHA_STUDIO, "not the Studio's data.js at 40b163d"
for f, h in SHA.items():
    assert hashlib.sha256((D / f).read_bytes()).hexdigest() == h, f + " is not the Field's file at 5f149d7"
s = raw.decode()
CARDS = json.loads(s[s.index("window.CARDS=") + 13:].strip().rstrip(";"))
assert len(CARDS) == 13371
R24 = json.load(open(D / "results_24.json"))

FRAME = int(dt.datetime(2026, 4, 1, tzinfo=dt.timezone.utc).timestamp() // 60)   # cards keep minutes
assert R24["frame_end"] == "2026-04-01T00:00Z"
silent1 = [i for i, c in enumerate(CARDS) if c["dn"] == 0]
assert len(silent1) == 10733                                   # plate VI, moment 1
pool = [i for i in silent1 if CARDS[i]["t"] < FRAME]
assert len(pool) == R24["undeclared_in_frame"] == 8948

CLS = ["fire", "flood", "severe", "winter", "heat", "avalanche"]
met = {}
for r in csv.DictReader(gzip.open(D / "met_24.tsv.gz", "rt"), delimiter="\t"):
    if r["group"] == "undeclared":
        met[int(r["i"])] = (CLS.index(r["primary"]), int(r["met"]), int(r["placebo"]))
assert set(met) <= set(pool)

# reproduce the Field: the covered pool, its meetings, its placebo, each class, the bound share
cov = [met[i] for i in pool if i in met]
u = R24["undeclared_covered"]
assert len(cov) == u["n"] == 3222 and sum(m for _, m, _ in cov) == u["met"] == 1216
assert sum(p for _, _, p in cov) == u["placebo"] == 253
for k, name in enumerate(CLS):
    b = R24["by_class"][name]
    assert sum(1 for c, _, _ in cov if c == k) == b["n"] and sum(m for c, m, _ in cov if c == k) == b["met"], name
assert abs(u["excess"] * u["n"] / len(pool) - R24["bound_share"]) < 1e-12

NONE = len(CLS)
rows = [(i,) + met.get(i, (NONE, 0, 0)) for i in pool]

def read(decl_closed, storm):
    """decl_closed: are the declarations held closed below their threshold? storm: None if Storm
    Events is not consulted, else the set of kinds over which it is held closed (NONE in the set
    closes it even over kinds it keeps nothing of)."""
    out = collections.Counter()
    for _, c, m, _ in rows:
        if storm is not None and m:
            out["contradicted"] += 1; continue
        closed = decl_closed or (storm is not None and c in storm)
        # an open register that keeps this kind could still hold it: the absence is unknown
        open_keeper = storm is not None and c != NONE and c not in storm
        out["never_needed" if closed and not open_keeper else "unknown"] += 1
    out["backed"] = 0                    # neither register has a row that says a danger did not come
    return {k: out[k] for k in ("never_needed", "contradicted", "unknown", "backed")}

ALL = set(range(len(CLS))) | {NONE}
readings = {"A": read(True, None), "B": read(True, ALL), "C": read(False, set(range(len(CLS)))),
            "D": read(False, set())}
assert readings["A"] == {"never_needed": 8948, "contradicted": 0, "unknown": 0, "backed": 0}
assert readings["B"]["never_needed"] == 8948 - 1216 and readings["B"]["contradicted"] == 1216
assert readings["C"]["never_needed"] == 3222 - 1216 and readings["C"]["unknown"] == 8948 - 3222
assert readings["D"]["never_needed"] == 0 and readings["D"]["unknown"] == 8948 - 1216
for r in readings.values():
    assert sum(r[k] for k in ("never_needed", "contradicted", "unknown")) == len(pool)

# cases for the warrant: evacuation orders whose words name a fire, not met in Storm Events
evac_fire = [i for i, c, m, _ in rows if c == 0 and not m and CARDS[i]["c"] == "EVI"]
by_class = {name: {"n": sum(1 for _, c, _, _ in rows if c == k),
                   "met": sum(m for _, c, m, _ in rows if c == k),
                   "placebo": sum(p for _, c, _, p in rows if c == k)} for k, name in enumerate(CLS)}
by_class["none"] = {"n": sum(1 for r in rows if r[1] == NONE), "met": 0, "placebo": 0}

out = {
    "source": {"warnings": {"repo": "frankbueltge/studio", "commit": "40b163de16fb5e6b61b69243d7ca78faa5659b1b",
                            "path": "works/2026-10-16-filed-under/data.js", "sha256": SHA_STUDIO},
               "study_24": {"repo": "frankbueltge/field-research", "commit": FIELD,
                            "path": "artifacts/2026-10-14-the-warnings-never-needed/s24/data/", "sha256": SHA},
               "handoff": "ho-2026-10-18-field-5",
               "reading": "Reiter, On Closed World Data Bases, UBC TR 77-16 (1977), p. 6"},
    "pool": len(pool), "silent_at_moment_1": len(silent1), "after_frame": len(silent1) - len(pool),
    "covered": len(cov), "met": 1216, "placebo": 253, "excess_share_of_pool": R24["bound_share"],
    "excess_ci": R24["bound_share_ci"], "by_class": by_class, "readings": readings,
    "evacuations_for_fire_unmet": len(evac_fire),
    "classes": CLS,
}
json.dump(out, open(HERE / "plate9.json", "w"), indent=1)
P9 = [[i, c, m, p] for i, c, m, p in rows]
with open(HERE / "plate9.js", "w") as f:
    f.write("// generated by plate9.py from the Field's study 24 (field-research@5f149d7) over the Studio's FILED UNDER\n")
    f.write("// rows: [index into P6R, class (0 fire,1 flood,2 severe,3 winter,4 heat,5 avalanche,6 no lower register), met, placebo]\n")
    f.write("const P9=" + json.dumps({k: v for k, v in out.items() if k != "source"}, separators=(",", ":")) + ";\n")
    f.write("const P9R=" + json.dumps(P9, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("pool", "covered", "met", "readings", "evacuations_for_fire_unmet")}, indent=1))
print(json.dumps(by_class))
