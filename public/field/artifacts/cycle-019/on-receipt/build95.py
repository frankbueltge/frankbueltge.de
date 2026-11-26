"""Study 95 -- count what the receivers did in the two cases of step 6, from cases95.json.

Writes results95.json (every count the page states, and the predictions P161 to P163) and data95.js (what the page
draws). Reads check95.json (the quote check) and receivers94.json (study 94's codes, for the doors it names).
Usage: python3 build95.py
"""
import datetime as dt
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(os.path.join(HERE, "cases95.json")))
Q = json.load(open(os.path.join(HERE, "check95.json")))
R94 = {r["id"]: r for r in json.load(open(os.path.join(HERE, "receivers94.json")))["receivers"]}
SRC = json.load(open(os.path.join(HERE, "sources95.json")))["sources"]

CODES = ["acknowledge", "investigate", "order", "pass_on", "tell_public", "reason_not", "proceed"]
FORCE = {"investigate", "order", "proceed"}
OWED_LETTER = {"receiver duty", "sender duty", "other law"}
OWED_DUTY = {"receiver duty", "sender duty"}
# A public body is named by an instrument of step 6 when study 94 lists it as the receiver of an event signal.
NAMED_PB = {"W-EC", "E-EC", "E-OES", "E-FBI", "E-CAAG"}


def d(s):
    return dt.date.fromisoformat(s) if s else None


def days(a, b):
    return (d(b) - d(a)).days


def main():
    cases = {c["id"]: c for c in C["cases"]}
    doors = C["doors"]
    for door in doors:
        assert door["consequence"] in ("none", "sanction", "binding order", "finding"), door["id"]
        for k in door["named_in_94"]:
            assert k in R94, (door["id"], k)
        for a in door["acts"]:
            assert a["code"] in CODES, a
            assert a["src"] in SRC, a
    acts = [dict(a, door=door["id"], case=door["case"], kind=door["kind"]) for door in doors for a in door["acts"]]
    n = len(acts)
    by_code = {c: sum(a["code"] == c for a in acts) for c in CODES}
    by_owed = {}
    for a in acts:
        by_owed[a["owed"]] = by_owed.get(a["owed"], 0) + 1

    # P161: at most a quarter owed
    def share(pred, rows):
        k = sum(pred(a) for a in rows)
        return {"owed": k, "of": len(rows), "share": round(k / len(rows), 3)}
    no_proceed = [a for a in acts if a["code"] != "proceed"]
    p161 = {
        "letter": share(lambda a: a["owed"] in OWED_LETTER, acts),
        "letter_without_proceed": share(lambda a: a["owed"] in OWED_LETTER, no_proceed),
        "duty_only": share(lambda a: a["owed"] in OWED_DUTY, acts),
        "duty_only_without_proceed": share(lambda a: a["owed"] in OWED_DUTY, no_proceed),
        "owed_ids": [a["door"] + ":" + a["code"] for a in acts if a["owed"] in OWED_LETTER],
        "duty_with_doubt": sum(1 for a in acts if a["owed"] in OWED_DUTY and a.get("doubt")),
        "duty_without_doubt": [a["door"] + ":" + a["code"] for a in acts if a["owed"] in OWED_DUTY and not a.get("doubt")],
        "other_law_all_powers": all(a.get("power") for a in acts if a["owed"] == "other law"),
    }
    p161["out_letter"] = "held" if p161["letter"]["share"] <= 0.25 else "failed"
    p161["out_duty_only"] = "held" if p161["duty_only"]["share"] <= 0.25 else "failed"
    p161["out_letter_without_proceed"] = "held" if p161["letter_without_proceed"]["share"] <= 0.25 else "failed"
    p161["out"] = p161["out_letter"]

    # P162: every public body's first dated act after the case's first public account
    def firsts(kinds):
        out = []
        for door in doors:
            if door["kind"] not in kinds:
                continue
            dated = sorted(a["date"] for a in door["acts"] if a["date"])
            fp = cases[door["case"]]["first_public"]
            out.append({"door": door["id"], "case": door["case"], "name": door["name"],
                        "first_act": dated[0] if dated else None,
                        "days_after_public": days(fp, dated[0]) if dated else None,
                        "received": door["received"]["date"], "named": door["id"] in NAMED_PB})
        return out
    pb_first = firsts({"public body"})
    leg_first = firsts({"legislature"})
    before = [x for x in pb_first + leg_first if x["first_act"] and x["days_after_public"] <= 0]
    p162 = {"public_bodies": pb_first, "legislatures": leg_first, "before_or_on_public": before,
            "out": "held" if not before else "failed",
            "no_act": [x["door"] for x in pb_first if not x["first_act"]],
            "earliest_after": {c: min(x["days_after_public"] for x in pb_first if x["case"] == c and x["first_act"])
                               for c in cases}}

    # P163: no sanction, binding order or formal finding
    p163 = {"consequences": sum(door["consequence"] != "none" for door in doors), "proceedings": [a["door"] + ":" + a["date"] for a in acts if a["code"] == "proceed"],
            "subpoenas": [a["door"] + ":" + a["date"] for a in acts if a["code"] == "investigate" and "subpoena" in a["quote"].lower()
                          or (a["code"] == "investigate" and a["src"] == "al_sub")],
            "demands_to_stop": [a["door"] + ":" + a["date"] for a in acts if a["code"] == "order" and a["kind"] == "public body"],
            "lag_days": {door["id"]: door["lag_days"] for door in doors}}
    p163["out"] = "held" if p163["consequences"] == 0 else "failed"

    # the doors
    kinds = {}
    for door in doors:
        kinds[door["kind"]] = kinds.get(door["kind"], 0) + 1
    pb = [x for x in doors if x["kind"] == "public body"]
    named = [x for x in pb if x["id"] in NAMED_PB]
    unnamed = [x for x in pb if x["id"] not in NAMED_PB]

    def force(ds, ai_only=False):
        return [a for x in ds for a in x["acts"] if a["code"] in FORCE]
    named_force = force(named)
    named_force_under_ai = [a for a in named_force if a["owed"] in {"power", "receiver duty"}]
    unnamed_force = force(unnamed)
    legislature_force = force([x for x in doors if x["kind"] == "legislature"])
    deadlines = [{"door": x["id"], "set_on": a["date"], "due": a["deadline_set"], "days": days(a["date"], a["deadline_set"])}
                 for x in doors for a in x["acts"] if a.get("deadline_set")]
    reasons = [{"door": x["id"], "date": a["date"], "quote": a["quote"]} for x in doors for a in x["acts"]
               if a["code"] == "reason_not"]

    # lags: received -> first act, kept only where the day of receipt is known ("on"), not bounded ("by");
    # maker: first word -> first public word
    lags = []
    for x in doors:
        dated = sorted(a["date"] for a in x["acts"] if a["date"])
        if x["received"]["date"] and dated and x["received"].get("bound") == "on":
            lags.append({"door": x["id"], "received": x["received"]["date"], "first_act": dated[0],
                         "days": days(x["received"]["date"], dated[0]), "bound": x["received"].get("bound")})
    maker = {}
    for x in doors:
        if x["kind"] != "maker":
            continue
        tp = sorted(a["date"] for a in x["acts"] if a["code"] == "tell_public" and a["date"])
        fp = cases[x["case"]]["first_public"]
        maker[x["case"]] = {"received": x["received"]["date"], "first_public_word": tp[0],
                            "days_from_receipt": days(x["received"]["date"], tp[0]),
                            "days_after_first_public": days(fp, tp[0]), "received_doubt": x["received"].get("doubt")}

    res = {
        "what": "Study 95 (session 293): what the receivers did in the two cases of step 6, counted from cases95.json.",
        "doors": len(doors), "doors_by_kind": kinds, "doors_with_acts": sum(bool(x["acts"]) for x in doors),
        "acts": n, "by_code": by_code, "by_owed": by_owed,
        "per_case": {c: {"doors": sum(x["case"] == c for x in doors), "acts": sum(a["case"] == c for a in acts),
                         "first_public": cases[c]["first_public"]} for c in cases},
        "public_bodies": len(pb), "named_public_bodies": [x["id"] for x in named],
        "unnamed_public_bodies": [x["id"] for x in unnamed],
        "named_force": len(named_force), "named_force_under_ai": len(named_force_under_ai),
        "unnamed_force": len(unnamed_force), "legislature_force": len(legislature_force),
        "deadlines_set": deadlines, "reasons_not": reasons, "lags": lags, "maker": maker,
        "P161": p161, "P162": p162, "P163": p163,
        "predictions_held": sum(p["out"] == "held" for p in (p161, p162, p163)),
        "quotes": {"n": Q["passages"], "found": Q["found"], "extraction": Q["via_extraction_service"]},
        "searched_not_doors": len(C["searched_not_doors"]),
    }
    json.dump(res, open(os.path.join(HERE, "results95.json"), "w"), indent=1, ensure_ascii=False)
    data = {"res": res, "cases": C["cases"], "doors": doors, "rulings": C["rulings"],
            "searched": C["searched_not_doors"],
            "sources": {k: {"url": v["url"], "what": v["what"], "via": v["via"]} for k, v in SRC.items()},
            "named": sorted(NAMED_PB)}
    with open(os.path.join(HERE, "data95.js"), "w") as f:
        f.write("window.D95=" + json.dumps(data, ensure_ascii=False) + ";\n")
    print(json.dumps({k: res[k] for k in ("doors", "doors_by_kind", "acts", "by_code", "by_owed", "named_force",
                                          "named_force_under_ai", "unnamed_force", "legislature_force",
                                          "predictions_held")}, ensure_ascii=False))
    print("P161", p161["letter"], p161["duty_only"], p161["out_letter"], p161["out_duty_only"], p161["duty_without_doubt"])
    print("P162", p162["out"], p162["earliest_after"], p162["no_act"])
    print("P163", p163)
    print("deadlines", deadlines)
    print("maker", maker)
    print("lags", lags)


if __name__ == "__main__":
    main()
