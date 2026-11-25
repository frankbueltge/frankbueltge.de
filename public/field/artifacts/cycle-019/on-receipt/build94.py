"""Study 94 -- build the data of the page from receivers94.py, study 90's signals and check 92's final codes.

Writes receivers94.json (the coding, whole), results94.json (every count the page states, and the predictions) and
data94.js (what the page draws). Usage: python3 build94.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from receivers94 import RECEIVERS, ACTS, SEARCHED  # noqa: E402

S6 = os.path.join(HERE, "..", "..", "cycle-018", "told-in-time")
SIG = {s["id"]: s for s in json.load(open(os.path.join(S6, "signals90.json")))["signals"]}
FIN = {s["id"]: s for s in json.load(open(os.path.join(S6, "codes92.json")))["signals"]}
INST = {i["id"]: i for i in json.load(open(os.path.join(S6, "signals90.json")))["instruments"]}
NAMES = json.load(open(os.path.join(HERE, "names94.json")))
Q = json.load(open(os.path.join(HERE, "quotes94.json")))

EVENT = {"event short of harm", "harm"}
FIVE = ["acknowledge", "investigate", "order", "pass_on", "tell_public"]


def main():
    ev = [s for s in FIN.values() if s["trigger"] in EVENT]
    ids = {s["id"] for s in ev}
    assert ids == {r["id"] for r in RECEIVERS}, "the coded receivers are not the 19 event signals of check 92"
    rows = []
    for r in RECEIVERS:
        f, s = FIN[r["id"]], SIG[r["id"]]
        assert f["receiver"] == r["receiver"], r["id"]
        rows.append(dict(r, what=s["what"], ref=s["ref"], binding=INST[r["instrument"]]["binding"],
                         instrument_short=INST[r["instrument"]]["short"], trigger=f["trigger"],
                         sender_deadline_h=f["deadline_h"], sender_clock=f["clock"],
                         sender_deadline_max_h=s.get("deadline_max_h")))
    law = [r for r in rows if r["binding"] == "law"]
    pb = [r for r in rows if r["receiver"] == "public body"]
    own = [r for r in rows if r["receiver"] == "own record"]

    def duty_rows(rs, with_rec=False):
        ok = {"duty", "recommended"} if with_rec else {"duty"}
        return [r["id"] for r in rs if any(r["acts"][a]["v"] in ok for a in FIVE)]

    def clocked(rs):
        return [(r["id"], a) for r in rs for a in ACTS
                if r["acts"][a]["v"] in ("duty", "power") and isinstance(r["acts"][a]["deadline_h"], (int, float))]

    obliged_senders = [r for r in law if r["sender_failure"]["v"] != "n/a"]
    res = {
        "what": "Study 94 (session 292, 2026-11-25): what the receivers of the 19 event signals of step 6 owe on receipt, "
                "by when, and what follows for a silent sender or a silent receiver; every count the page states.",
        "signals": len(rows),
        "receiver": {k: sum(r["receiver"] == k for r in rows) for k in ("public body", "own record", "other party", "public")},
        "law": len(law),
        "receiver_party_no": sum(r["receiver_party"] == "no" for r in rows),
        "acts": {a: {v: [r["id"] for r in rows if r["acts"][a]["v"] == v] for v in ("duty", "power", "recommended")} for a in ACTS},
        "public_body": {
            "n": len(pb),
            "acts": {a: {v: [r["id"] for r in pb if r["acts"][a]["v"] == v] for v in ("duty", "power")} for a in ACTS},
            "any_duty_five": duty_rows(pb),
            "clocked": clocked(pb),
            "receiver_failure_named": [r["id"] for r in pb if r["receiver_failure"]["v"] == "named"],
            "party_no": [r["id"] for r in pb if r["receiver_party"] == "no"],
        },
        "own_record": {
            "n": len(own),
            "any_duty_five": duty_rows(own),
            "clocked": clocked(own),
            "receiver_failure_named": [r["id"] for r in own if r["receiver_failure"]["v"] == "named"],
        },
        "senders": {
            "law_obliged": [r["id"] for r in obliged_senders],
            "law_obliged_penalty": [r["id"] for r in obliged_senders if r["sender_failure"]["v"] in ("penalty", "enforcement")],
            "sender_clock_numeric": [r["id"] for r in rows if isinstance(r["sender_deadline_h"], (int, float))],
            "max_fine_usd": max(r["sender_failure"]["max"] or 0 for r in law if r["instrument"] in ("sb53", "raise")),
            "max_fine_eur": max(r["sender_failure"]["max"] or 0 for r in law if r["instrument"] == "eu-act"),
        },
        "predictions": {},
        "doubts": sum(bool(r["acts"][a]["doubt"]) for r in rows for a in ACTS)
                  + sum(bool(r[k]["doubt"]) for r in rows for k in ("sender_failure", "receiver_failure")),
        "quotes": {"n": Q["quotes"], "found": Q["found"], "distinct": Q["distinct"]},
    }
    p158 = duty_rows(rows)
    p159 = clocked(rows)
    rf = [r["id"] for r in rows if r["receiver_failure"]["v"] == "named"]
    limb1 = len(res["senders"]["law_obliged_penalty"]) == len(obliged_senders)
    res["predictions"] = {
        "P158": {"rows_with_duty": p158, "n": len(p158), "with_recommended": len(duty_rows(rows, True)),
                 "held": len(p158) <= 3},
        "P159": {"clocked": p159, "n": len(p159), "held": len(p159) == 0},
        "P160": {"law_obliged": len(obliged_senders), "law_obliged_penalty": len(res["senders"]["law_obliged_penalty"]),
                 "receiver_failure_named": rf, "held": limb1 and not rf},
    }
    res["predictions_held"] = sum(p["held"] for p in res["predictions"].values())
    res["names"] = {k: NAMES[k] for k in ("deeds", "commits", "architect_only", "with_architect", "persona_only",
                                          "says_machine_in_message", "architect_only_through_forge")}
    res["names"]["atelier_rows_agreeing"] = NAMES["atelier"]["rows_agreeing"]
    res["names"]["control_site_session_link"] = NAMES["control"]["frankbueltge.de"]["session_link"]
    res["names"]["control_site_coauthor"] = NAMES["control"]["frankbueltge.de"]["coauthor_trailer"]

    json.dump({"what": "Study 94, part A: the coding of the 19 receivers (receivers94.py), joined to study 90 and check 92.",
               "searched": SEARCHED, "receivers": rows}, open(os.path.join(HERE, "receivers94.json"), "w"),
              indent=1, ensure_ascii=False)
    json.dump(res, open(os.path.join(HERE, "results94.json"), "w"), indent=1, ensure_ascii=False)
    data = {"rows": rows, "res": res, "instruments": INST}
    open(os.path.join(HERE, "data94.js"), "w").write("window.D94 = " + json.dumps(data, ensure_ascii=False) + ";\n")
    print(json.dumps(res["predictions"], indent=1))
    print("public bodies", res["public_body"]["n"], "any duty", res["public_body"]["any_duty_five"],
          "clocked", res["public_body"]["clocked"], "receiver failure", res["public_body"]["receiver_failure_named"])
    print("own record", res["own_record"])
    print("senders", res["senders"])
    print("doubts", res["doubts"], "quotes", res["quotes"])


if __name__ == "__main__":
    main()
