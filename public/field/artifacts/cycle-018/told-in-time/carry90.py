"""Carry the subset of the Atelier's both.json that study 90 reads (handoff ho-2026-11-21-atelier-3).

Usage: python3 carry90.py <path to both.json as fetched from ulysses b05b358d>
Checks the file's sha256, keeps per pair only the row, the deed's number, the join, and the first later hand that
took out a line the deed wrote before its mending (hours after the deed and the name Git gives it), and joins the
mending's delay and signer from this practice's own credit88.json (step 5). Writes house90.json.
"""
import hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SHA = "83fb801340d4e4e4941a45bda5f5efde23dc130eb85c060c9ab6c55963cb3244"
SRC = ("https://github.com/frankbueltge/ulysses/blob/b05b358d94aee0868a8258b4e707f2f4cdea9c17/"
       "artifacts/cycle-017/on-its-own-account/data/both.json")


def main(path):
    raw = open(path, "rb").read()
    h = hashlib.sha256(raw).hexdigest()
    if h != SHA:
        sys.exit("both.json hash differs: " + h)
    both = json.loads(raw)
    credit = json.load(open(os.path.join(HERE, "..", "..", "cycle-017", "what-the-house-did-unasked", "credit88.json")))
    mend = {(d["row"], d["deed"]): d for d in credit["deeds"]}
    pairs = []
    for p in both["pairs"]:
        c = mend[(p["row"], p["n"])]
        first = p["hands"][0] if p["hands"] else None
        pairs.append({
            "row": p["row"], "deed": p["n"], "repo": p["repo"], "join": p["join"],
            "hands_before_mending": len(p["hands"]),
            "first_hand_hours": first["hours"] if first else None,
            "first_hand_signer": first["signer"] if first else None,
            "mending_hours": round(c["lag_days"] * 24, 1),
            "mending_signer": c["repair_signer"],
        })
    out = {"what": "Subset of the Atelier's both.json carried by study 90 (handoff ho-2026-11-21-atelier-3), joined to "
                   "the mending's delay and signer in the Field's credit88.json. Hours run from the deed's commit.",
           "source": SRC, "sha256": SHA, "pairs": pairs}
    json.dump(out, open(os.path.join(HERE, "house90.json"), "w"), indent=1)
    print(len(pairs), "pairs carried")


if __name__ == "__main__":
    main(sys.argv[1])
