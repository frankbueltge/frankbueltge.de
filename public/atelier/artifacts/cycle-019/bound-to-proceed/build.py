#!/usr/bin/env python3
"""Bound to Proceed: build the log the page draws.

Reads, at pinned commits, the Field's study 94 (field-research 3dcd20b, receivers94.json) and the
Middle's relay (research-ecology e6daa26, relay/relay.json), both from local clones; reads the
outside passages from sources.json (written by sources.py); writes data/log.json and data/log.js.
Every count the page states is computed here and asserted.

Usage: python3 build.py <path to field-research clone> <path to research-ecology clone>
"""
import json, os, re, statistics, subprocess, sys
from collections import Counter
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
FIELD_COMMIT = "3dcd20be555d36c58bebdead061dc7d3dd0c33a2"
RELAY_COMMIT = "e6daa26b049741f901612f2bac1c39066cffc97e"
COLS = ["say", "look", "act", "pass", "public", "when", "why", "silent", "who"]


def git_show(repo, commit, path):
    return subprocess.run(["git", "-C", repo, "show", f"{commit}:{path}"], check=True,
                          capture_output=True, text=True).stdout


def q(qid):
    for rec in SRC["quotes"]:
        if rec["id"] == qid:
            assert rec["found"] in ("exact", "ocr"), qid
            return {"id": qid, "text": rec["quote"], "source": rec["source"]}
    raise KeyError(qid)


def cell(v, label, quotes=(), ref=None, note=None):
    return {"v": v, "label": label, "quotes": [q(x) for x in quotes], "ref": ref, "note": note}


NONE = {"v": "none", "label": "", "quotes": [], "ref": None, "note": None}


def sea_rows():
    rows = []
    rows.append({"id": "SEA-MASTER", "band": "sea", "name": "The master of a ship placed to assist",
                 "trigger": "information from any source that persons are in distress",
                 "source_label": "SOLAS ch. V, reg. 33.1 (2014 text); UNCLOS art. 98",
                 "cells": {
                     "say": cell("duty", "must, if possible", ["solas-bound"], "SOLAS V/33.1", "Informing them or the search and rescue service that the ship is proceeding."),
                     "look": NONE,
                     "act": cell("duty", "must go", ["solas-bound", "unclos-98"], "SOLAS V/33.1; UNCLOS 98(1)(b)", "Bound to proceed with all speed; UNCLOS: in so far as it may reasonably be expected and without serious danger to the ship."),
                     "pass": cell("recommended", "should, if not going", ["solas-log"], "SOLAS V/33.1", "Informing the search and rescue service, as the Organization recommends, when the ship does not proceed."),
                     "public": NONE,
                     "when": cell("duty", "all speed", ["solas-bound"], "SOLAS V/33.1", "No hours: the clock is the speed of the ship, from the moment of receipt."),
                     "why": cell("duty", "must write why", ["solas-log"], "SOLAS V/33.1", "The reason for failing to proceed, in the ship's own logbook."),
                     "silent": cell("duty", "flag State law", ["unclos-98-req"], "UNCLOS 98(1)", "Every State must require it of its masters; the penalty is national law, not read here."),
                     "who": cell("duty", "the master", ["circ-master", "m541-manual"], "MSC.1/Circ.1657/Rev.1 §4; ITU-R M.541-11 A1-3.3", "A person: acknowledgements only with the master's permission, initiated by hand."),
                 }})
    rows.append({"id": "SEA-SHIP", "band": "sea", "name": "A ship that hears a distress alert by radio",
                 "trigger": "a digital selective call (DSC) distress alert from another ship",
                 "source_label": "IMO MSC.1/Circ.1657/Rev.1 (2026); ITU-R M.541-11 (2023)",
                 "cells": {
                     "say": cell("recommended", "should, by voice", ["m541-ship"], "ITU-R M.541-11 A1-3.3.4", "If able to assist: by radiotelephony to the ship in distress, after a short interval so a coast station can answer first."),
                     "look": NONE,
                     "act": cell("recommended", "should, if able", [], "MSC.1/Circ.1657/Rev.1, flow diagram 1", "The flow diagram asks: is own vessel able to assist?"),
                     "pass": cell("recommended", "should tell the coast", [], "MSC.1/Circ.1657/Rev.1, flow diagram 1, note 1", "Inform a coast station or rescue coordination centre."),
                     "public": NONE,
                     "when": cell("recommended", "listen 5 min", [], "MSC.1/Circ.1657/Rev.1, flow diagram 1", "Listen on the voice channel for five minutes before answering."),
                     "why": cell("recommended", "should log", ["circ-log"], "MSC.1/Circ.1657/Rev.1, flow diagram 2, note 1", "Every path of both flow diagrams ends in an entry in the log."),
                     "silent": NONE,
                     "who": cell("duty", "the master", ["circ-master"], "MSC.1/Circ.1657/Rev.1 §4", "A person: only with the master's permission."),
                 }})
    rows.append({"id": "SEA-COAST", "band": "sea", "name": "A coast station that receives the alert",
                 "trigger": "a DSC distress alert on MF or HF",
                 "source_label": "ITU-R M.541-11 (2023), A1-3.3",
                 "cells": {
                     "say": cell("recommended", "should answer", ["m541-cs"], "ITU-R M.541-11 A1-3.3.2", "Alerts are normally acknowledged by DSC only by coast stations."),
                     "look": NONE, "act": NONE, "pass": NONE, "public": NONE,
                     "when": cell("recommended", "1 to 2⅓ min", ["m541-cs"], "ITU-R M.541-11 A1-3.3.2", "A minimum of 1 minute after receipt and normally a maximum of 2⅓; on VHF as soon as practicable."),
                     "why": NONE, "silent": NONE,
                     "who": cell("recommended", "by hand", ["m541-manual"], "ITU-R M.541-11 A1-3.3", "Acknowledgements should be initiated manually."),
                 }})
    rows.append({"id": "SEA-FLAG", "band": "sea", "name": "The flag State that receives a report",
                 "trigger": "a report that jurisdiction and control over its ship were not exercised",
                 "source_label": "UNCLOS art. 94(6)",
                 "cells": {
                     "say": NONE,
                     "look": cell("duty", "must investigate", ["unclos-94-6"], "UNCLOS 94(6)", None),
                     "act": cell("duty", "must remedy, if appropriate", ["unclos-94-6"], "UNCLOS 94(6)", None),
                     "pass": NONE, "public": NONE, "when": NONE, "why": NONE, "silent": NONE, "who": NONE,
                 }})
    return rows


def ai_rows(R):
    rows = []
    for r in R:
        a = r["acts"]

        def fc(act, label_duty="must", label_power="may", label_rec="should"):
            x = a[act]
            v = x["v"]
            if v == "none":
                return NONE
            lab = {"duty": label_duty, "power": label_power, "recommended": label_rec}[v]
            return {"v": v, "label": lab, "quotes": [{"id": None, "text": t, "source": "field94"} for t in x["quotes"]],
                    "ref": x["ref"], "note": x["note"], "doubt": x["doubt"]}
        public = fc("tell_public")
        if public["v"] == "none" and a["tell_public_aggregate"]["v"] != "none":
            public = fc("tell_public_aggregate", "yearly total only")
        when = NONE
        for act in ("acknowledge", "investigate", "order", "pass_on"):
            d = a[act]["deadline_h"]
            if d is not None:
                lab = f"{d} h" if isinstance(d, (int, float)) else ("monthly" if r["id"] == "CA8" else str(d))
                when = {"v": a[act]["v"], "label": lab, "quotes": [{"id": None, "text": t, "source": "field94"} for t in a[act]["quotes"]],
                        "ref": a[act]["ref"], "note": f"The deadline belongs to '{act.replace('_', ' ')}'.", "doubt": None}
        rf = r["receiver_failure"]
        silent = NONE if rf["v"] == "none" else {"v": "duty", "label": "named", "quotes": [{"id": None, "text": t, "source": "field94"} for t in rf["quotes"]],
                                                  "ref": rf["ref"], "note": rf["note"], "doubt": rf["doubt"]}
        sf = r["sender_failure"]
        rows.append({"id": r["id"], "band": "ai", "name": r["receiver_name"], "kind": r["receiver"],
                     "instrument": r["instrument_short"], "binding": r["binding"], "what": r["what"],
                     "sender": r["sender"], "sender_deadline_h": r["sender_deadline_h"], "sender_clock": r["sender_clock"],
                     "sender_failure": sf["v"], "sender_failure_ref": sf.get("ref"), "sender_failure_quotes": sf.get("quotes", []),
                     "source_label": f"{r['instrument_short']}, {r['ref']} (Field study 94)",
                     "cells": {"say": fc("acknowledge"), "look": fc("investigate"), "act": fc("order"), "pass": fc("pass_on"),
                               "public": public, "when": when, "why": NONE, "silent": silent, "who": NONE}})
    return rows


def house_rows():
    proto = open(os.path.join(HERE, "..", "..", "..", "PROTOCOL.md"), encoding="utf-8").read()
    p62 = [
        "Every session takes up at least one open handoff addressed to this practice, and takes it up with weight.",
        "A correction of this practice's own claim is never declined.",
        "A session that takes none up says why in one line, and the reason is a fact, not a preference.",
        "is declined in one line and is closed.",
    ]
    flat = re.sub(r"\s+", " ", proto.replace("**", ""))
    for s in p62:
        assert s in flat, s
    pq = [{"id": f"p62-{i}", "text": s, "source": "protocol"} for i, s in enumerate(p62)]
    return [
        {"id": "HOUSE-PRACTICE", "band": "house", "name": "A practice that is offered a handoff",
         "trigger": "an offer or a correction in a sibling's bulletin, listed open in the relay",
         "source_label": "PROTOCOL.md 6.2 (the same in all three constitutions)",
         "cells": {
             "say": {"v": "duty", "label": "must, in one line", "quotes": [pq[2]], "ref": "6.2, 6.3", "note": "Taken up, Declined, or Taken up: none with the reason, in the bulletin."},
             "look": {"v": "duty", "label": "a correction: must check", "quotes": [pq[1]], "ref": "6.2", "note": None},
             "act": {"v": "duty", "label": "must take one up", "quotes": [pq[0]], "ref": "6.2", "note": None},
             "pass": NONE,
             "public": {"v": "duty", "label": "in a public file", "quotes": [], "ref": "4.2", "note": "The bulletin is overwritten every session in a public repository; the relay reads it."},
             "when": {"v": "duty", "label": "every session", "quotes": [pq[0]], "ref": "6.2", "note": "In practice the next session, which is daily."},
             "why": {"v": "duty", "label": "must write why", "quotes": [pq[3], pq[2]], "ref": "6.2", "note": "A decline in one line, with its reason."},
             "silent": {"v": "power", "label": "marked lapsed", "quotes": [], "ref": "relay/README.md", "note": "The relay marks an offer lapsed 21 days after it was made; no consequence follows."},
             "who": {"v": "duty", "label": "a machine, named", "quotes": [], "ref": "relay.json", "note": "The relay names the practice that took up or declined; each practice signs as its machine persona."},
         }},
        {"id": "HOUSE-ARCHITECT", "band": "house", "name": "The architect, who is offered a request",
         "trigger": "a request in the channel REQUESTS.md",
         "source_label": "REQUESTS.md, standing rule of 2026-07-17; PROTOCOL.md 9",
         "cells": {
             "say": NONE, "look": NONE, "act": NONE, "pass": NONE, "public": NONE, "when": NONE, "why": NONE,
             "silent": {"v": "silence", "label": "silence is read as an answer", "quotes": [], "ref": "REQUESTS.md, standing rule",
                        "note": "His standing rule (paraphrased): a request to him never blocks; silence past its deadline, or through the practice's next session, means the practice decides itself. The rule exists so that no request stalls an unattended practice."},
             "who": {"v": "duty", "label": "a person, when he answers", "quotes": [], "ref": "REQUESTS.md", "note": None},
         }},
    ]


def night():
    S = [
        (0, "23:00", "a steamer's light approaching from the east", "the Master and the wireless operator", "eye; wireless", ["i12-evans"], "Evans 8962, 8988"),
        (30, "23:30", "the only wireless operator turns in; nobody listens on the wireless", "—", "wireless closed", ["i12-turnedin"], "Evans 9022"),
        (40, "23:40", "the steamer stops; her lights seem to go out", "Groves, third officer", "eye", [], "Groves 8217"),
        (95, "after 00:30", "two rockets, seen by the donkeyman", "Gill", "eye; told to no one in the record", [], "Gill 18156-61"),
        (130, "01:10", "five white rockets, reported to the Master", "Stone to the Master", "voice pipe", ["i12-voicepipe", "i12-company", "i12-morsing"], "Stone 7870, 7879"),
        (150, "01:10-01:40", "three more rockets; the Morse lamp gets no reply", "Stone and Gibson", "eye; Morse lamp", ["i12-nothing"], "Gibson 7479, 7529"),
        (185, "02:05", "eight rockets in all, reported to the Master", "Gibson to the Master", "messenger at the chart-room door", ["i12-gibson", "i12-norecollection"], "Gibson 7553; Lord 6859"),
        (220, "02:40", "the ship from which the rockets came has disappeared", "Stone to the Master", "voice pipe", ["i12-disappeared"], "Stone 7976"),
        (330, "04:30", "rockets in the middle watch, reported again", "Stewart to the Master", "in person", ["i12-iknow"], "Stewart 8615, 8619"),
        (420, "about 06:00", "the wireless operator is called; word from the Virginian; full speed for the position", "the Master", "wireless", ["i12-virginian"], "Lord 7002"),
    ]
    out = []
    for m, t, what, who, means, quotes, mins in S:
        master = "the Master" in who and "to the Master" in who
        out.append({"min": m, "time": t, "what": what, "who": who, "means": means, "quotes": [q(x) for x in quotes],
                    "minutes": mins, "master_receives": master})
    return out


def house_log(relay):
    hs = relay["handoffs"]
    pts = []
    for h in hs:
        t = h.get("taken_by") or h.get("declined_by")
        days = (date.fromisoformat(t["date"]) - date.fromisoformat(h["offered_on"])).days if t else None
        pts.append({"id": h["id"], "on": h["offered_on"], "status": h["status"], "days": days,
                    "to": h["to"], "giver": h["giver"], "correction": h["offer"].lower().startswith("a correction"),
                    "by": (t or {}).get("practice")})
    st = Counter(p["status"] for p in pts)
    answered = [p for p in pts if p["days"] is not None]
    cor = [p for p in pts if p["correction"]]
    ds = [p["days"] for p in answered]
    counts = {"handoffs": len(pts), "taken": st["taken"], "declined": st["declined"], "lapsed": st["lapsed"], "open": st["open"],
              "answered": len(answered), "median_days": statistics.median(ds), "same_day": sum(1 for d in ds if d == 0),
              "next_day": sum(1 for d in ds if d == 1), "max_days": max(ds),
              "corrections": len(cor), "corrections_taken": sum(1 for p in cor if p["status"] == "taken"),
              "first": min(p["on"] for p in pts), "last": max(p["on"] for p in pts),
              "receivers": sorted({x for p in pts for x in p["to"]}),
              "generated_at": relay["generated_at"]}
    return pts, counts


def main(field_repo, eco_repo):
    global SRC
    SRC = json.load(open(os.path.join(HERE, "sources.json"), encoding="utf-8"))
    R = json.loads(git_show(field_repo, FIELD_COMMIT, "artifacts/cycle-019/on-receipt/receivers94.json"))["receivers"]
    relay = json.loads(git_show(eco_repo, RELAY_COMMIT, "relay/relay.json"))
    rows = sea_rows() + ai_rows(R) + house_rows()
    ai = [r for r in rows if r["band"] == "ai"]
    pb = [r for r in ai if r["kind"] == "public body"]

    # the AI receivers, counted from the Field's codes
    passages = [t for r in R for x in list(r["acts"].values()) + [r["receiver_failure"]] for t in x["quotes"]]
    reason_words = re.compile(r"\b(reason|reasons|justif\w*|explain\w*|log|logbook)\b", re.I)
    who_words = re.compile(r"\b(human|person|natural person|automated|machine|manually)\b", re.I)
    c = {
        "receivers": len(ai), "public_bodies": len(pb),
        "say_duty": sum(1 for r in ai if r["cells"]["say"]["v"] == "duty"),
        "say_duty_public": sum(1 for r in pb if r["cells"]["say"]["v"] == "duty"),
        "public_single": sum(1 for r in R if r["acts"]["tell_public"]["v"] != "none"),
        "public_total": sum(1 for r in R if r["acts"]["tell_public_aggregate"]["v"] == "duty"),
        "when_any": sum(1 for r in ai if r["cells"]["when"]["v"] != "none"),
        "when_public": sum(1 for r in pb if r["cells"]["when"]["v"] != "none"),
        "why": sum(1 for r in ai if r["cells"]["why"]["v"] != "none"),
        "silent_named": sum(1 for r in ai if r["cells"]["silent"]["v"] != "none"),
        "silent_named_public": sum(1 for r in pb if r["cells"]["silent"]["v"] != "none"),
        "law_reports": sum(1 for r in R if r["binding"] == "law" and r["sender_failure"]["v"] != "n/a"),
        "law_reports_fined": sum(1 for r in R if r["binding"] == "law" and r["sender_failure"]["v"] == "penalty"),
        "sender_clock_awareness": sum(1 for r in R if r["sender_clock"] == "awareness"),
        "passages": len(passages),
        "passages_reason_word": sum(1 for t in passages if reason_words.search(t)),
        "passages_who_word": sum(1 for t in passages if who_words.search(t)),
    }
    # what the Field's bulletin of 2026-11-25 says, asserted against its own codes
    assert c["receivers"] == 19 and c["public_bodies"] == 11, c
    assert c["say_duty"] == 1 and c["say_duty_public"] == 0, c
    assert c["public_single"] == 0 and c["public_total"] == 5, c
    assert c["when_public"] == 0, c
    assert c["silent_named_public"] == 0 and c["silent_named"] == 1, c
    assert c["law_reports"] == 5 and c["law_reports_fined"] == 5, c
    assert c["why"] == 0, c

    sea = [r for r in rows if r["band"] == "sea"]
    house = [r for r in rows if r["band"] == "house"]
    ruled = lambda rs: sum(1 for r in rs if r["cells"]["why"]["v"] != "none")
    c["sea_rows"], c["sea_why"] = len(sea), ruled(sea)
    c["house_rows"], c["house_why"] = len(house), ruled(house)
    assert (c["sea_rows"], c["sea_why"], c["house_rows"], c["house_why"]) == (4, 2, 2, 1), c

    pts, hc = house_log(relay)
    assert hc["handoffs"] == hc["taken"] + hc["declined"] + hc["lapsed"] + hc["open"]
    assert hc["corrections"] == hc["corrections_taken"], hc
    n = night()
    c["night_master_receipts"] = sum(1 for s in n if s["master_receives"])
    assert c["night_master_receipts"] == 4, c

    out = {"what": "Bound to Proceed, state 1 (2026-11-25): who must answer on receipt, ruled as one log for the sea, the AI instruments of the Field's study 94, and this house.",
           "columns": COLS, "rows": rows, "counts": c, "night": n, "house": {"points": pts, "counts": hc},
           "pins": {"field94": f"field-research@{FIELD_COMMIT[:7]}/artifacts/cycle-019/on-receipt/receivers94.json",
                    "relay": f"research-ecology@{RELAY_COMMIT[:7]}/relay/relay.json"},
           "sources": SRC["sources"]}
    os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
    s = json.dumps(out, ensure_ascii=False, indent=1)
    open(os.path.join(HERE, "data", "log.json"), "w", encoding="utf-8").write(s + "\n")
    open(os.path.join(HERE, "data", "log.js"), "w", encoding="utf-8").write("window.LOG = " + s + ";\n")
    print(json.dumps(c)); print(json.dumps({k: v for k, v in hc.items() if k != "receivers"}))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
