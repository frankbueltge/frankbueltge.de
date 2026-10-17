"""Project 10, session 3: exploratory, NOT registered (REFRAIN.md entries 15-16). Usage: python3 explore3.py SCRATCHDIR
(1) phases compared up to a cyclic rotation of (flash, eclipse) steps: a cycle listed from another starting flash is the same rhythm;
(2) the remainder split by whether either light's name or remarks says it belongs to a leading line (range, front, rear, leading,
synchronized), a word test, not a reading; (3) one state per pair. Writes explore3.json."""
import json, re, sys
from lib3 import phases

WORDS = re.compile(r"\b(range|front|rear|leading|synchroni[sz]ed)\b", re.I)
STATES = ["arcs", "phase", "oneway", "leading", "nothing"]


def rot_same(a, b):
    if a is None or b is None or len(a) != len(b) or len(a) % 2:
        return False
    steps = len(a) // 2
    return any(a[2 * s:] + a[:2 * s] == b for s in range(steps))


def state(p):
    """One state per pair, in this order of precedence: 0 arcs, 1 phase, 2 one-way reach, 3 a leading line by the word test, 4 nothing."""
    A, B = p["A_light"], p["B_light"]
    if not p["shared"]:
        return 0
    if p["phase"] == "parted" and not rot_same(phases(A["ch"]), phases(B["ch"])):
        return 1
    if not p["mutual"]:
        return 2
    if any(WORDS.search(x or "") for x in (A["name"], B["name"], A["remarks"], B["remarks"])):
        return 3
    return 4


def main(scratch):
    full = json.load(open(f"{scratch}/pairs3_full.json"))
    out = {"parted": 0, "parted_rotation_only": 0, "remainder_rot": 0, "remainder_rot_words": 0, "remainder_rot_no_words": 0,
           "remainder_rot_no_words_same_phase": 0}
    nw = []
    part = dict.fromkeys(STATES, 0)
    for p in full:
        A, B = p["A_light"], p["B_light"]
        rot = p["phase"] == "parted" and rot_same(phases(A["ch"]), phases(B["ch"]))
        out["parted"] += p["phase"] == "parted"
        out["parted_rotation_only"] += rot
        part[STATES[state(p)]] += 1
        if p["shared"] and p["mutual"] and (p["phase"] != "parted" or rot):
            out["remainder_rot"] += 1
            if state(p) == 3:
                out["remainder_rot_words"] += 1
            else:
                out["remainder_rot_no_words"] += 1
                out["remainder_rot_no_words_same_phase"] += p["phase"] in ("same", "parted")
                nw.append(p["km"])
    nw.sort()
    out["remainder_rot_no_words_median_km"] = nw[len(nw) // 2] if nw else None
    out["remainder_rot_no_words_over_10km"] = sum(k > 10 for k in nw)
    out["partition"] = part
    json.dump(out, open("explore3.json", "w"), indent=1)
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
