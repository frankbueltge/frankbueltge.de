"""Taken back (session 186): the warnings their own writers took back in words.

Material. The Atelier's plate XI (cycle-008 exposition, offered to the Studio on 2026-10-19) names 21
messages among this desk's 13,371 that retract a warning in words, read by hand from 117 swept. This
script reads that list, sweeps the cards again by its own pattern, and pairs each retraction with the
warning it takes back.

Rules, fixed before any pair was read:
  PAIR    the retracted warning is the latest dealt card sent at most six hours before the retraction,
          sharing a county code with it, from the same sender wherever both name one, and not itself one
          of the 21 retractions. The rule proposes; every pair is then read by hand (HAND below), and a
          pair the hand rejects is shown as rejected, with the reason.
  ANSWER  a warning whose pair the hand accepts as a retraction of error is *backed* for never needed,
          by its writer's word, unless a register already joined here contradicts it (the declarations,
          Storm Events, the quake register): a danger that came outranks a word taken back. A pair the
          hand reads as narrowing rather than withdrawing does not back anything.
  RUNNING (a line, not a verdict) the declarations are asked once more, for each accepted pair, whether a
          declared incident was running in its counties at the minute it was sent (begin on or before the
          day, end on or after it). The desk's own rule reads only incidents that *begin* near a warning.
          Added after the first run, which found the pandemic's declarations (incident type Biological,
          2020-2023) running everywhere: they are left out of this line, since no warning here names them.
Run: python3 build_taken.py  (writes taken.js and taken_summary.json)
"""
import hashlib, json, re, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

PLATE = "https://raw.githubusercontent.com/frankbueltge/ulysses/main/presentations/cycle-008/exposition/plate11.json"
FEMA = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries"
E0 = datetime(1970, 1, 1, tzinfo=timezone.utc)
SWEEP = re.compile(r"disregard|in error|false alarm|no emergency|inadvertent|accidental|by mistake|erroneous|"
                   r"cancel+ed|retract|ignore (the|this|previous|last)|was a test|test message|not a real", re.I)

# Read by hand after PAIR ran: (verdict, reason). verdict: error = withdrawn as sent wrongly; narrow = the
# warning stands for a smaller place; reject = the rule's pair is not the warning taken back.
HAND = {
    64: ("error", "The retraction says a siren sounded in error; the civil emergency ten minutes earlier, from the same county office's code, is the one message on this desk that could be its word."),
    113: ("error", "Disregard the previous message: the previous message from the same sender and county, six minutes before, shows no words (nor does the one before it)."),
    664: ("error", "The ballistic missile alert of 13 January 2018 and its retraction 38 minutes later, from the same agency."),
    850: ("error", "Disregard the civil emergency message: the civil emergency 85 minutes earlier in the same county, words not shown."),
    1894: ("error", "ShakeAlert cancelled, 55 minutes after the alert to the same four counties."),
    3568: ("error", "Disregard the fire evacuation warning, sent in error: the sheriff's evacuation order 30 minutes earlier in the same county."),
    4269: ("error", "Disregard the previous alert, no new evacuations for Mora County: the Mora mandatory evacuation 56 minutes earlier."),
    4751: ("narrow", "Disregard the evacuation alert on the Bolt Creek Fire, Index only: it narrows the warning to one town, it does not withdraw it."),
    8535: ("reject", "It takes back an evacuation WARNING; the rule found an evacuation ORDER from the same sender four hours earlier. The warning it takes back is not among the cards on this desk."),
    12086: ("error", "The last message about the Coyote Fire was sent in error: the sheriff's prepare-to-evacuate warning 43 minutes earlier."),
}
# Retractions with no pair: what the hand reads them as taking back.
UNPAIRED = {
    3: "an emergency siren notification", 762: "a siren", 2278: "dam sirens", 3131: "outdoor warning sirens",
    4461: "a nuclear plant's sirens", 4462: "a nuclear plant's sirens", 5121: "a nuclear plant's siren",
    7037: "a nuclear plant's sirens", 7038: "a nuclear plant's sirens",
    6871: "an alert sent by another state", 8534: "an evacuation message sent by another agency",
}


def get(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def js(path, name):
    s = open(path).read()
    return json.loads(re.search(r"window\." + name + r"=(.*?);?\n", s, re.S).group(1))


def main():
    C = js("data.js", "CARDS")
    B = json.loads(re.search(r"window\.BELOW=(\[.*\])", open("below.js").read(), re.S).group(1))
    Q = json.loads(re.search(r"window\.QUAKE=(\{.*\})", open("quake.js").read(), re.S).group(1))
    raw = get(PLATE)
    plate = json.loads(raw)["retractions"]
    R = {r["i"]: r for r in plate["rows"]}
    # the Atelier's ids are indices into this desk's cards: their words must be the card's words
    words_agree = sum(1 for i, r in R.items() if C[i]["w"] == r["words"])
    swept = [i for i, c in enumerate(C) if SWEEP.search(c["w"])]
    taken, rows, queries = {}, [], []
    for i in sorted(R):
        r = C[i]
        g = set(r["g"])
        cand = [j for j in range(len(C)) if j not in R and r["t"] - 360 <= C[j]["t"] <= r["t"]
                and g & set(C[j]["g"]) and (not r["a"] or not C[j]["a"] or r["a"] == C[j]["a"])]
        j = cand[-1] if cand else None
        verdict, reason = HAND.get(i, (None, None))
        if j is None:
            verdict, reason = "none", "Takes back " + UNPAIRED[i] + ", which this archive does not hold."
        row = {"r": i, "w": r["w"], "sent": (E0 + timedelta(minutes=r["t"])).isoformat()[:16], "pair": j,
               "lag": None if j is None else r["t"] - C[j]["t"], "hand": verdict, "why": reason}
        taken[str(i)] = {"k": "r", "of": j if verdict in ("error", "narrow") else None, "h": verdict, "why": reason}
        if verdict in ("error", "narrow"):
            c = C[j]
            contra = (c["nn"] == "contradicted" and "declaration") or (B[j].get("s") == "met" and "storm events") \
                or (Q.get(str(j), {}).get("s") == "met" and "quake register") or None
            run = []
            day = (E0 + timedelta(minutes=c["t"])).date()
            for p in c["p"]:
                county, _, state = p.partition(", ")
                if "(whole state)" in p:
                    continue
                f = (f"incidentBeginDate le '{day}T23:59:59.000Z' and incidentEndDate ge '{day}T00:00:00.000Z' "
                     f"and designatedArea eq '{county} (County)'")
                url = FEMA + "?" + urllib.parse.urlencode({"$filter": f, "$select": "femaDeclarationString,state,designatedArea,incidentType,declarationTitle,incidentBeginDate,incidentEndDate"})
                body = get(url)
                queries.append({"url": url, "sha256": hashlib.sha256(body).hexdigest()})
                for d in json.loads(body)["DisasterDeclarationsSummaries"]:
                    if state and not state.startswith(d["state"]) and d["state"] != STATES.get(state):
                        continue
                    if d["incidentType"] == "Biological":
                        continue
                    run.append([d["femaDeclarationString"], " ".join(w.capitalize() for w in d["declarationTitle"].lower().split()), d["incidentType"],
                                d["incidentBeginDate"][:10], (d["incidentEndDate"] or "")[:10], d["designatedArea"]])
            run = sorted({tuple(x) for x in run})
            backed = verdict == "error" and not contra
            taken[str(j)] = {"k": "w", "by": i, "h": verdict, "why": reason, "lag": r["t"] - c["t"], "words": r["w"],
                             "contra": contra, "backed": backed, "run": [list(x) for x in run]}
            row.update({"pair_words": c["w"], "contra": contra, "backed": backed, "running": [list(x) for x in run]})
        rows.append(row)
    summ = {
        "source": PLATE, "plate11_sha256": hashlib.sha256(raw).hexdigest(),
        "atelier": {"swept": plate["swept"], "read": plate["read"], "retractions": len(R)},
        "words_agree": words_agree,
        "own_sweep": {"pattern": SWEEP.pattern, "hits": len(swept), "contains_all_21": set(R) <= set(swept),
                      "note": "The hits beyond the 21 were read by hand: cancellations, all-clears, tests announced in advance and narrowed areas; none takes a warning back as sent wrongly."},
        "paired_by_rule": sum(1 for x in rows if x["pair"] is not None),
        "hand": {k: sum(1 for x in rows if x["hand"] == k) for k in ("error", "narrow", "reject", "none")},
        "backed": sum(1 for x in rows if x.get("backed")),
        "contradicted_anyway": [x["pair"] for x in rows if x.get("contra")],
        "running_declaration": [x["pair"] for x in rows if x.get("running")],
        "rows": rows, "queries": queries,
    }
    open("taken_summary.json", "w").write(json.dumps(summ, indent=1, ensure_ascii=False))
    open("taken.js", "w").write("// generated by build_taken.py from the Atelier's plate XI list and this desk's cards; see taken_summary.json\n"
                                "window.TAKEN=" + json.dumps(taken, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(json.dumps({k: v for k, v in summ.items() if k not in ("rows", "queries")}, indent=1))
    for x in rows:
        print(x["r"], x["pair"], x["hand"], x.get("contra"), x.get("backed"), x.get("running"))


STATES = {"California": "CA", "New Mexico": "NM", "Kentucky": "KY", "Tennessee": "TN", "Washington": "WA",
          "Hawaii": "HI", "Texas": "TX", "North Carolina": "NC", "Ohio": "OH", "New Hampshire": "NH", "Maine": "ME"}

if __name__ == "__main__":
    main()
