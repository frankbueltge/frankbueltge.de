"""Cycle 006, the Atelier's presentation: who is left to write the outcome.

Reads the rule text of every market in the Studio's ledger (works/2026-10-08-only-no/data.json,
studio repository; handoff ho-2026-10-08-studio-2) from the market platform's public API, records
which party each rule names as the writer of YES, and gathers the cycle's own numbers from
window/cycle-006-session-{1,2,3}/results.json.

Usage: python3 -I analysis.py <studio data.json> <dir of raw market JSON, fetched if absent>
The raw descriptions are third-party text and are not committed; their SHA-256 are.
"""
import hashlib, json, sys, urllib.request
from pathlib import Path

here = Path(__file__).resolve().parent
win = here.parent.parent / "window"
studio = json.loads(Path(sys.argv[1]).read_text())
raw = Path(sys.argv[2]); raw.mkdir(exist_ok=True)

# The writer of YES, as each rule states it. Read by hand from every description (2026-10-08);
# a short marked quotation is kept for each class, never the full text.
CLASSES = {
    "machine": ("names a machine as the writer of YES", [
        "4daQpzw6B6Q4dwFDi96y", "BKr7KGDSkT6U3dGlqxIk", "OYYWyf4i86yyICsOYhiG", "axwg7y0dOkNFNiosLbh3",
        "cvFAhAq2GaDDEYLaCKJT", "yWsu9mQUzNnuXKQmWkZA", "2fTX4OadswNdugqgo8zP", "Pbfcr93n0dVEHQWUn043",
        "mZoOercJWPMFPM6XxKfI", "Ide0brMftTAknwNsOSJG"]),
    "threshold": ("lowers extinction to 99 % so that a human writer remains", ["6worzd97r3"]),
    "unnamed": ("says YES, names no writer", [
        "28PoDmUrYfd2LXu88u5w", "2bdobvLrfDIiFNiQB0Ds", "4nRk5v2TZbhDxDgYqGfD", "8KYvQOQMawVikl7Xm8a5",
        "AILwnq4N1tQp5kHNSgBK", "BhKYpwF3i3HQR8oBGrkP", "CImI7JWS3X6xQjJZPKKo", "CSNobqWEv7iuKhJntAEz",
        "GtgvQ3aCW9URt6QUDNL2", "INdVRRdp08Nh8oaZNJlS", "JCPihKZBL587ssrUzeAE", "JRPIRRfzcNUOOyNY74zf",
        "JxG9JrW524awsHMm4fa4", "KTF2RkOxNLayixijFGAz", "KrygWJ6EmVct1tZXGgXF", "NQb0fMOS9vGUi8z3aMHi",
        "NXgARdD3G9DlGhXzP4K4", "OIEDsImNtQcDo4Q56HgQ", "RlGroTnJYkSvOM4QqVLy", "Swud8FP0KzyzcCm1omWR",
        "YMzwLCjaPKuS866uokEs", "aeyDLmTSug0ZidkUelFK", "hOlVgBSJVaBo69OBuUbA", "kblxaI9zP95U5lzbReaz",
        "n2nxULWSvq5QoSjaoUai", "ok28bwmkfmUCxRNEq5tw", "pCpGDhm8F9rrmte1hM7R", "sAb4iNjQG102aW9SzeSH",
        "tX13a8AhsXuxrDEpWanG", "u3HpdlsJ1EkAayqCDtCL", "x80fNXpzXabEzVvz3Yoz", "yhzkFO9m3TlNSrSGtTng"]),
    "norule": ("states no rule for either answer", [
        "4jv1mv1ms6", "k4bi0y60it", "kt318ghk5n", "n8atyid1bn", "ocgb080y89", "rdv20xsfn7", "z7cimuxvf6",
        "CLA1XdzYkejRvBk8iqb5", "mvhlaV1bm4BZ3ZqDy1uY", "Dgb0X38xF44TMcsUjgOU", "HD4xS1cBv1ITNtl9SEzc",
        "ZZl1MOJyxlY919kB2fvm", "b0LA4NAabsuId5xHAW5D", "bkf0u5WZxGghVz0FQtTj", "WjrvAvWfQMfZ8ygomWab",
        "BmSlE6p5YlTavbXly9Ow", "NxLWsWJvo1DCN6FtHZiP", "Mcsc4k1zEv2flubGVvR5", "yWaLKJoL391MwyUvWRii"]),
}
# Of the machine class: rules that also say, in advance, that a world with no writer gets no answer.
VOID = {"4daQpzw6B6Q4dwFDi96y", "BKr7KGDSkT6U3dGlqxIk", "OYYWyf4i86yyICsOYhiG", "axwg7y0dOkNFNiosLbh3",
        "Ide0brMftTAknwNsOSJG"}
BY_REFERENCE = {"Ide0brMftTAknwNsOSJG": "declared a duplicate of BKr7KGDSkT6U3dGlqxIk that resolves the same in all states of the world"}
QUOTES = {  # short quotations, marked, each from the market named
    "machine": ("BKr7KGDSkT6U3dGlqxIk", "If humanity is not around but AI(s) are then this market resolves to YES."),
    "void": ("BKr7KGDSkT6U3dGlqxIk", "If neither humanity nor AIs are around then this market does not resolve."),
    "machine_b": ("2fTX4OadswNdugqgo8zP", "Otherwise, the ai will resolve it to yes."),
    "machine_c": ("mZoOercJWPMFPM6XxKfI", "If AI has wiped out humanity, the market resolution is on them."),
    "threshold": ("6worzd97r3", "For obvious technical reasons the threshold cannot be 100%."),
    "unnamed": ("tX13a8AhsXuxrDEpWanG", "Otherwise resolves to YES."),
    "collector": ("ok28bwmkfmUCxRNEq5tw", "they won't be around to collect their winnings if humanity is wiped out"),
}

ledger = [m for m in studio["markets"] if m["class"] == "ledger"]
cls_of = {i: c for c, (_, ids) in CLASSES.items() for i in ids}
assert sorted(cls_of) == sorted(m["id"] for m in ledger), "classification must cover the ledger exactly"
assert len(cls_of) == 62

def fetch(mid):
    f = raw / f"{mid}.json"
    if not f.exists():
        with urllib.request.urlopen(f"https://api.manifold.markets/v0/market/{mid}", timeout=30) as r:
            f.write_bytes(r.read())
    return json.loads(f.read_text())

cells = []
for m in sorted(ledger, key=lambda m: m["close"]):
    api = fetch(m["id"])
    text = (api.get("textDescription") or "").strip()
    for key, (qid, q) in QUOTES.items():
        if qid == m["id"]:
            assert q in text, (key, qid)
    cells.append({
        "id": m["id"], "q": m["q"], "url": m["url"], "close": m["close"][:10], "created": m["created"][:10],
        "resolution": m["resolution"], "price": m["prob_now"], "cls": cls_of[m["id"]],
        "void": m["id"] in VOID, "by_reference": BY_REFERENCE.get(m["id"]),
        "desc_sha256": hashlib.sha256(text.encode()).hexdigest(), "desc_words": len(text.split()),
    })

def count(pred): return sum(1 for c in cells if pred(c))
worlds = {
    "humans": {"NO": count(lambda c: c["cls"] != "norule"), "silent": count(lambda c: c["cls"] == "norule")},
    "machines": {"YES": count(lambda c: c["cls"] == "machine"),
                 "YES_but_no_writer": count(lambda c: c["cls"] in ("unnamed", "threshold")),
                 "silent": count(lambda c: c["cls"] == "norule")},
    "none": {"void_declared": count(lambda c: c["void"]), "silent": count(lambda c: not c["void"])},
}
resolved = [c for c in cells if c["resolution"]]
by_cls = {c: {"n": count(lambda x, c=c: x["cls"] == c),
              "resolved_NO": count(lambda x, c=c: x["cls"] == c and x["resolution"] == "NO")} for c in CLASSES}

# The rule's own arithmetic for BKr7…: YES pays only in a world where machines remain, and a world with
# no one in it is struck from the book. If the price were read as a probability under the rule (an
# assumption; the Studio and two market makers read it as the value of holding a bet over time), it
# would be P(YES | someone resolves) = x a / (1 - x + x a), with x = P(humanity gone by 2030) and
# a = P(machines remain | humanity gone). Solved for x: x = q / (q + a (1 - q)).
q = next(c["price"] for c in cells if c["id"] == "BKr7KGDSkT6U3dGlqxIk")
implied = [{"a": a, "x": q / (q + a * (1 - q))} for a in (1.0, 0.5, 0.25, 0.1, 0.05, 0.01)]

s1 = json.loads((win / "cycle-006-session-1/results.json").read_text())
s2 = json.loads((win / "cycle-006-session-2/results.json").read_text())
s3 = json.loads((win / "cycle-006-session-3/results.json").read_text())
hq = s1["questions"]["hlmi_extremely_bad_10pct_plus"]
cycle = {
    "s1": {"share": hq["share"], "bounds": hq["by_frame"]["working_addresses"]["bounds"],
           "response_rate": hq["by_frame"]["working_addresses"]["response_rate"]},
    "s2": {"listed_today": s2["counts"]["2026-10-07"]["total"], "frame_N": s2["frame"]["N"],
           "k": s2["frame"]["k_on_list_today"], "bounds": s2["frame"]["share_bounds"]},
    "s3": {"underread": s3["P1"]["underread_factor"], "uncertain_true": s3["P2"]["mean_true_alpha"],
           "uncertain_naive": s3["P2"]["naive_beta_mean"]},
}

R = {
    "source": {"ledger": "studio: works/2026-10-08-only-no/data.json (fetched " + studio["summary"]["fetched_utc"] + ")",
               "handoff": "ho-2026-10-08-studio-2",
               "api": "https://api.manifold.markets/v0/market/<id>, read 2026-10-08"},
    "classes": {c: d for c, (d, _) in CLASSES.items()}, "by_class": by_cls, "void_declared": len(VOID),
    "quotes": QUOTES, "worlds": worlds, "resolved": len(resolved),
    "resolved_YES": count(lambda c: c["resolution"] == "YES"),
    "bkr7_price": q, "implied": implied, "cycle": cycle, "cells": cells,
}
(here / "results.json").write_text(json.dumps(R, indent=1, ensure_ascii=False) + "\n")
print(json.dumps({k: R[k] for k in ("by_class", "worlds", "resolved", "bkr7_price", "implied", "cycle")}, indent=1))
