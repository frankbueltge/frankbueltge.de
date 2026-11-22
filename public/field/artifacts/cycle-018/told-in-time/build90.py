"""Study 90 -- count the coded signals and write results90.json, signals90.json and data90.js.

Usage: python3 build90.py   (reads signals90.py, house90.json, quotes90.json beside it; no network)
Every figure on the page is computed here and recounted from signals90.json by verify90.mjs.
"""
import hashlib, json, os, statistics, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from signals90 import INSTRUMENTS, SIGNALS  # noqa: E402

INST = {i["id"]: i for i in INSTRUMENTS}
EVENT = ("event short of harm", "harm")
BEFORE = ("before deployment", "schedule", "event short of harm")


def sha(p):
    return hashlib.sha256(open(os.path.join(HERE, p), "rb").read()).hexdigest()


def main():
    sig = []
    for s in SIGNALS:
        s = dict(s)
        s["binding"] = INST[s["instrument"]]["binding"]
        s["before_harm"] = s["trigger"] in BEFORE
        if s["stranger"] == "auto":
            s["stranger"] = {"public": "yes", "aggregate only": "aggregate only", "not public": "no"}[s["public"]]
        s["says_unit"] = s["unit"] in ("quantity", "defined")
        s["says_who"] = s["machine_or_person"] in ("required", "by class")
        s["all_four"] = s["says_unit"] and s["before_harm"] and s["public"] == "public" and s["says_who"]
        sig.append(s)
    law = [s for s in sig if s["binding"] == "law"]
    vol = [s for s in sig if s["binding"] == "voluntary"]

    # P146
    law_public = sum(s["public"] == "public" for s in law)
    p146 = {"law_signals": len(law), "law_public": law_public, "held": law_public < len(law) / 2}
    # P147
    req = [s["id"] for s in sig if s["machine_or_person"] == "required"]
    p147 = {"required": req, "n": len(req), "held": len(req) <= 1,
            "required_without_doubt": [s["id"] for s in sig if s["machine_or_person"] == "required" and not
                                       (s["doubt"] or "").startswith("machine or person")]}
    # P148
    ev_dl = [s for s in sig if s["trigger"] in EVENT and s["deadline_h"] is not None]
    aw = [s["id"] for s in ev_dl if s["clock"] == "awareness"]
    p148 = {"event_signals_with_deadline": [s["id"] for s in ev_dl], "n": len(ev_dl), "from_awareness": aw,
            "n_awareness": len(aw), "uninformative": len(ev_dl) < 4, "held": len(ev_dl) >= 4 and len(aw) > len(ev_dl) / 2,
            "numeric_only": {"n": sum(isinstance(s["deadline_h"], int) for s in ev_dl),
                             "awareness": sum(isinstance(s["deadline_h"], int) and s["clock"] == "awareness" for s in ev_dl)}}

    events = [s for s in sig if s["trigger"] in EVENT]
    ev_short = [s for s in events if s["trigger"] == "event short of harm"]
    numeric_ev = sorted((s["deadline_h"], s["id"]) for s in events if isinstance(s["deadline_h"], int))

    def counts(key, rows):
        return dict(Counter(s[key] for s in rows))

    house = json.load(open(os.path.join(HERE, "house90.json")))
    L = [p for p in house["pairs"] if p["join"] == "lines"]
    first = [p["first_hand_hours"] if p["first_hand_hours"] is not None else p["mending_hours"] for p in L]
    signer = Counter((p["first_hand_signer"] or p["mending_signer"]) for p in L)
    hres = {"pairs": len(L), "mending_first": sum(p["hands_before_mending"] == 0 for p in L),
            "first_hand_median_h": round(statistics.median(first), 1),
            "first_hand_within_24h": sum(h <= 24 for h in first),
            "mending_median_h": round(statistics.median(p["mending_hours"] for p in L), 1),
            "first_signer": dict(signer)}

    quotes = json.load(open(os.path.join(HERE, "quotes90.json")))
    res = {
        "study": 90, "session": 288, "date": "2026-11-22", "cycle": 18, "programme_step": 6,
        "codebook_sha256": sha("CODEBOOK90.md"), "predictions_sha256": sha("PREDICTIONS90.md"),
        "instruments": len(INSTRUMENTS), "instruments_law": sum(i["binding"] == "law" for i in INSTRUMENTS),
        "signals": len(sig), "law": len(law), "voluntary": len(vol),
        "quotes_found": quotes["found"],
        "kind": counts("kind", sig), "receiver": counts("receiver", sig), "receiver_law": counts("receiver", law),
        "public": counts("public", sig), "public_law": counts("public", law),
        "trigger": counts("trigger", sig), "before_harm": sum(s["before_harm"] for s in sig),
        "machine_or_person": counts("machine_or_person", sig), "unit": counts("unit", sig),
        "stranger": counts("stranger", sig),
        "events": len(events), "events_law": sum(s["binding"] == "law" for s in events),
        "events_short_of_harm": len(ev_short),
        "events_public": [s["id"] for s in events if s["public"] == "public"],
        "events_law_public": [s["id"] for s in events if s["binding"] == "law" and s["public"] == "public"],
        "events_law_aggregate": [s["id"] for s in events if s["binding"] == "law" and s["public"] == "aggregate only"],
        "event_deadlines_h": numeric_ev,
        "shortest_event_deadline_h": numeric_ev[0][0] if numeric_ev else None,
        "all_four": [s["id"] for s in sig if s["all_four"]],
        "says_who_and_public": [s["id"] for s in sig if s["says_who"] and s["public"] == "public"],
        "doubts": [s["id"] for s in sig if s["doubt"]],
        "P146": p146, "P147": p147, "P148": p148,
        "held": [k for k, v in (("P146", p146), ("P147", p147), ("P148", p148)) if v["held"]],
        "house": hres,
    }
    json.dump(res, open(os.path.join(HERE, "results90.json"), "w"), indent=1)
    json.dump({"what": "The 51 signals of study 90 with their codes (CODEBOOK90.md), coded by the conductor on "
                       "2026-11-22 from the texts as fetched; sources in sources90.json.",
               "instruments": INSTRUMENTS, "signals": sig}, open(os.path.join(HERE, "signals90.json"), "w"), indent=1)
    page = {"instruments": INSTRUMENTS, "signals": sig, "results": res,
            "house": [{"row": p["row"], "deed": p["deed"],
                       "first": p["first_hand_hours"] if p["first_hand_hours"] is not None else p["mending_hours"],
                       "mending": p["mending_hours"], "mending_first": p["hands_before_mending"] == 0} for p in L]}
    with open(os.path.join(HERE, "data90.js"), "w") as f:
        f.write("window.DATA90 = " + json.dumps(page, separators=(",", ":")) + ";\n")
    print(json.dumps({k: res[k] for k in ("signals", "law", "public_law", "machine_or_person", "events_law_public",
                                           "shortest_event_deadline_h", "all_four", "held", "house")}, indent=0))


if __name__ == "__main__":
    main()
