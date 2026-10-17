"""Project 10, session 3: the reading sample fixed in SESSION3.md (seed 20261017). Usage: python3 read3.py SCRATCHDIR
Prints 20 random phase-parted pairs and 20 random remainder pairs in full, for reading by eye. Writes nothing."""
import json, random, sys
from lib3 import phases

full = json.load(open(f"{sys.argv[1]}/pairs3_full.json"))
for tag, sel in (("PARTED", [p for p in full if p["phase"] == "parted"]), ("REMAINDER", [p for p in full if p["remainder"]])):
    rng = random.Random(20261017)
    for n, p in enumerate(rng.sample(sel, 20), 1):
        print(f"== {tag} {n}  {p['km']} km  rA {p['rA']} rB {p['rB']}  phase {p['phase']}/{p['phase_perceptible']}")
        for t in ("A", "B"):
            x = p[t + "_light"]
            print(f"  {t} v{x['v']} {x['f']} {x['name']!r} | {x['ch']!r} -> {phases(x['ch'])} | {x['remarks']!r}")
