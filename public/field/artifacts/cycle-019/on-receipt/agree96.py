"""Check 96 (session 294): agreement between the first codes of studies 94 and 95 and the blind second codes.

Reads the blind readers' files (blind96-A1.json, blind96-A2.json, blind96-B1.json, blind96-B2.json, blind96-D.json),
the first codes (receivers94.json, cases95.json), the conductor's pairing of acts (pairs96.json) and the Atelier's
reasons (atelier-reasons96.json, copied from its cases.json at the commit named there). Writes agree96.json.
Standard library only. Cohen's kappa is computed on the items both readers coded.
"""
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
ACTS = ["acknowledge", "investigate", "order", "pass_on", "tell_public", "tell_public_aggregate"]


def kappa(pairs):
    """Cohen's kappa and raw agreement over a list of (a, b) labels."""
    n = len(pairs)
    if n == 0:
        return {"n": 0, "agree": 0, "raw": None, "kappa": None}
    agree = sum(1 for a, b in pairs if a == b)
    po = agree / n
    ca = Counter(a for a, _ in pairs)
    cb = Counter(b for _, b in pairs)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / (n * n)
    k = None if pe == 1 else (po - pe) / (1 - pe)
    return {"n": n, "agree": agree, "raw": round(po, 3), "kappa": None if k is None else round(k, 3), "kappa_exact": k}


def norm_act(v):
    v = (v or "none").lower()
    return "none" if v.startswith("reco") else v


def norm_dl(v):
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return str(int(v))
    return str(v).lower()


def part_a():
    first = {r["id"]: r for r in json.loads((HERE / "receivers94.json").read_text())["receivers"]}
    blind = {}
    for f in ("blind96-A1.json", "blind96-A2.json"):
        for s in json.loads((HERE / f).read_text())["signals"]:
            blind[s["id"]] = s
    assert set(blind) == set(first), sorted(set(first) ^ set(blind))
    cells, per_act, dls, diffs = [], {a: [] for a in ACTS}, [], []
    sf, rf, party = [], [], []
    for sid in sorted(first):
        o, b = first[sid], blind[sid]
        for a in ACTS:
            x, y = norm_act(o["acts"][a]["v"]), norm_act((b["acts"].get(a) or {}).get("v"))
            cells.append((x, y))
            per_act[a].append((x, y))
            if x != y:
                diffs.append({"signal": sid, "code": a, "first": x, "blind": y,
                              "blind_quote": (b["acts"].get(a) or {}).get("quote")})
            if x != "none" and y != "none":
                dx, dy = norm_dl(o["acts"][a]["deadline_h"]), norm_dl((b["acts"].get(a) or {}).get("deadline_h"))
                dls.append((dx, dy))
                if dx != dy:
                    diffs.append({"signal": sid, "code": a + ".deadline_h", "first": dx, "blind": dy,
                                  "blind_doubt": (b["acts"].get(a) or {}).get("doubt")})
        x, y = o["sender_failure"]["v"], (b.get("sender_failure") or {}).get("v")
        sf.append((x, y or "none"))
        if x != (y or "none"):
            diffs.append({"signal": sid, "code": "sender_failure", "first": x, "blind": y})
        x, y = o["receiver_failure"]["v"], (b.get("receiver_failure") or {}).get("v")
        rf.append((x, y or "none"))
        if x != (y or "none"):
            diffs.append({"signal": sid, "code": "receiver_failure", "first": x, "blind": y})
        party.append((o["receiver_party"], b.get("receiver_party")))
        if o["receiver_party"] != b.get("receiver_party"):
            diffs.append({"signal": sid, "code": "receiver_party", "first": o["receiver_party"],
                          "blind": b.get("receiver_party")})
    return {
        "receivers": len(first),
        "act_cells_pooled": kappa(cells),
        "per_act": {a: kappa(p) for a, p in per_act.items()},
        "deadline_on_cells_both_coded": kappa(dls),
        "sender_failure": kappa(sf),
        "receiver_failure": kappa(rf),
        "receiver_party": kappa(party),
        "disagreements": diffs,
        "P164": "held" if kappa(cells)["kappa"] is not None and kappa(cells)["kappa"] >= 0.60 else "failed",
    }


def part_b():
    first = json.loads((HERE / "cases95.json").read_text())
    pairs = json.loads((HERE / "pairs96.json").read_text())
    blind_doors = {}
    for f in ("blind96-B1.json", "blind96-B2.json"):
        for d in json.loads((HERE / f).read_text())["doors"]:
            blind_doors[d["id"]] = d
    first_acts = {}
    for d in first["doors"]:
        for i, a in enumerate(d["acts"]):
            first_acts[f"{d['id']}#{i}"] = a
    blind_acts = {}
    for did, d in blind_doors.items():
        for i, a in enumerate(d.get("acts") or []):
            blind_acts[f"{did}#{i}"] = a
    paired = pairs["pairs"]
    pf = {p["first"] for p in paired}
    pb = {p["blind"] for p in paired}
    assert pf <= set(first_acts) and pb <= set(blind_acts)
    assert len(pf) == len(paired) and len(pb) == len(paired), "an act is paired twice"
    only_first = sorted(set(first_acts) - pf)
    only_blind = sorted(set(blind_acts) - pb)
    for k in only_first:
        assert k in pairs["only_first"], f"unexplained first-only act {k}"
    for k in only_blind:
        assert k in pairs["only_blind"], f"unexplained blind-only act {k}"

    def owed2(v):
        return "owed" if v in ("receiver duty", "sender duty", "other law") else "not owed"

    cls, owed5, own = [], [], []
    for p in paired:
        a, b = first_acts[p["first"]], blind_acts[p["blind"]]
        cls.append((a["code"], b.get("code")))
        owed5.append((a["owed"], b.get("owed")))
        own.append((owed2(a["owed"]), owed2(b.get("owed"))))
    union = len(paired) + len(only_first) + len(only_blind)
    # receipts: the first receipt of each door, by date
    rec = []
    rec_rows = []
    for d in first["doors"]:
        b = blind_doors.get(d["id"])
        bdates = sorted([r.get("date") for r in (b.get("received") or []) if r.get("date")]) if b else []
        bdate = bdates[0] if bdates else None
        fdate = d["received"].get("date")
        rec.append((fdate or "null", bdate or "null"))
        rec_rows.append({"door": d["id"], "first": fdate, "blind_earliest": bdate, "same": (fdate or None) == bdate})
    return {
        "acts_first": len(first_acts), "acts_blind": len(blind_acts), "paired": len(paired),
        "only_first": len(only_first), "only_blind": len(only_blind),
        "unitising_agreement": round(len(paired) / union, 3),
        "class_on_pairs": kappa(cls), "owed5_on_pairs": kappa(owed5), "owed2_on_pairs": kappa(own),
        "receipt_date": kappa(rec), "receipts": rec_rows,
    }


def part_d():
    blind = {x["item"]: x["code"] for x in json.loads((HERE / "blind96-D.json").read_text())["items"]}
    at = json.loads((HERE / "atelier-reasons96.json").read_text())
    rows = []
    for i, r in enumerate(at["reasons"]):
        item = f"R{i + 1}"
        atelier = "circumstance" if r.get("circumstance") else "class"
        rows.append({"item": item, "passage": r["passage"], "atelier": atelier, "blind": blind[item],
                     "same": atelier == blind[item]})
    return {"reasons": len(rows), "same": sum(r["same"] for r in rows), "rows": rows}


if __name__ == "__main__":
    out = {"what": "Check 96: agreement of the blind second codes with studies 94 and 95 (agree96.py).",
           "A": part_a()}
    if (HERE / "pairs96.json").exists():
        out["B"] = part_b()
    if (HERE / "atelier-reasons96.json").exists():
        out["D"] = part_d()
    (HERE / "agree96.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    a = out["A"]
    print("A pooled", a["act_cells_pooled"], "P164", a["P164"])
    print("A sender", a["sender_failure"], "receiver", a["receiver_failure"], "deadline", a["deadline_on_cells_both_coded"])
    for d in a["disagreements"]:
        print("  diff", d)
    if "B" in out:
        print("B", {k: v for k, v in out["B"].items() if k != "receipts"})
    if "D" in out:
        print("D", out["D"]["same"], "of", out["D"]["reasons"])
