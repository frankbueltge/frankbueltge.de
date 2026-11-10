#!/usr/bin/env python3
"""NO ROAD IN — build data.js from the Field's study 69 and the land of NO PUBLIC LAND.

Usage (repo root):  python3 -I etudes/no-road-in/build.py [path/to/results69.json]
Without a path the Field's file is fetched from its repository at the pinned commit.
Every count the page states is asserted here; a failed assertion writes nothing.
"""
import hashlib, json, sys, urllib.request, pathlib

HERE = pathlib.Path(__file__).resolve().parent
FIELD_COMMIT = "000c9197555a037dd8bf67898906030587b0bbc6"
FIELD_PATH = "artifacts/after-cycle-013/what-reaches-the-kept-share/results69.json"
FIELD_URL = f"https://raw.githubusercontent.com/frankbueltge/field-research/{FIELD_COMMIT}/{FIELD_PATH}"
FIELD_SHA = "680cfadd042049563133e851b6b7d480a67ed1929e2136bb9520e3c9edd4e20a"
LAND = HERE.parent.parent / "works" / "2026-11-08-no-public-land" / "data.js"
QUARTER = "2025-12-31"

raw = pathlib.Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else urllib.request.urlopen(FIELD_URL).read()
assert hashlib.sha256(raw).hexdigest() == FIELD_SHA, "the Field's file is not the pinned one"
F = json.loads(raw)

# --- the roads: one per text the Field read -------------------------------------------------
ORDER = ["eu-ai-act", "eu-guidelines", "ca-sb53", "ny-raise", "ny-s10731", "paris-call",
         "us-eo14110", "us-bis-rule", "us-ear"]
# Standing is this étude's reading of the Field's fields `in_force`, `kind` and `since`; five kinds.
STANDING = {"eu-ai-act": "force", "ca-sb53": "force", "us-ear": "force",
            "ny-raise": "pending",            # enacted, takes effect 2027-01-01
            "ny-s10731": "proposed",          # a bill
            "eu-guidelines": "nonbinding", "paris-call": "nonbinding",
            "us-eo14110": "revoked", "us-bis-rule": "revoked"}
SHORT = {"eu-ai-act": "EU AI Act", "eu-guidelines": "EU guidelines", "ca-sb53": "California SB 53",
         "ny-raise": "New York RAISE", "ny-s10731": "New York S10731", "paris-call": "Paris Call",
         "us-eo14110": "US Order 14110", "us-bis-rule": "US reporting rule", "us-ear": "US export controls"}
by_id = {i["id"]: i for i in F["instruments"]}
assert sorted(by_id) == sorted(ORDER) and len(ORDER) == 9
roads = []
for k in ORDER:
    i = by_id[k]
    assert (STANDING[k] == "force") == bool(i["in_force"]), k
    ends = "land" if i["holder"] else ("coast" if i["transfer_only"] else "trainer")
    assert ends != "trainer" or i["developer"], k
    roads.append({"id": k, "name": i["name"], "short": SHORT[k], "where": i["where"], "kind": i["kind"],
                  "since": i["since"], "standing": STANDING[k], "ends": ends,
                  "trainer": bool(i["developer"]), "internal": i["internal"],
                  "stock": bool(i["stock_stated"]), "threshold": i["threshold"], "note": i["note"],
                  "q": i["q"]})

# --- the milestones: every passage the Field quotes -------------------------------------------
docs = F["documents"]
stones = {}
for pid, p in F["passages"].items():
    assert p["found"] in (True, None), pid    # None: California's text, reached only through a page-fetch service
    d = docs[p["doc"]]
    stones[pid] = {"quote": p["quote"], "what": d["what"], "url": d["url"], "checked": p["found"] is True}
on_roads = [q for r in roads for q in r["q"]]
assert len(stones) == 35 and len(on_roads) == 33 and len(set(on_roads)) == 33
off = sorted(set(stones) - set(on_roads))
assert off == ["c1", "c2"]                    # the code of practice's list of signatories
unchecked = sorted(k for k, v in stones.items() if not v["checked"])
assert unchecked == ["s1", "s2", "s3", "s4", "s5"] and by_id["ca-sb53"]["q"] == unchecked

# --- the land: the last full survey of NO PUBLIC LAND ----------------------------------------
s = LAND.read_text()
N = json.loads(s[s.index("{"): s.rindex("}") + 1])
q = next(x for x in N["quarters"] if x["q"] == QUARTER)
total = q["total"]
assert total == sum(o["m"] for o in q["owners"].values()) == 20926382
KEPT = ["Google", "Meta", "xAI"]
REST = ["Microsoft", "Amazon", "Oracle", "CoreWeave", "Other", "China"]
SHOAL = "China (smuggled)"
assert sorted(KEPT + REST + [SHOAL]) == sorted(q["owners"])
pct = lambda name: round(100 * q["owners"][name]["m"] / total, 2)
parcels = [{"owner": n, "pct": pct(n), "kept": n in KEPT} for n in KEPT + REST]
shoal = {"owner": SHOAL, "pct": pct(SHOAL)}
for n in KEPT:
    assert pct(n) == F["kept_share"]["by_holder_pct"][n], n
kept_pct = round(sum(pct(n) for n in KEPT), 2)
assert kept_pct == F["kept_share"]["total_pct"] == 37.78
signed = F["named_in_scope"]["eu_code_signatories"]
assert signed == {"Google": True, "Meta": False, "xAI": True}
signed_pct = round(sum(pct(n) for n in KEPT if signed[n]), 2)
assert signed_pct == F["kept_share_named_pct"]["eu_code_signatories"] == 26.78
assert F["named_in_scope"]["paris_call_companies"] == {"Google": False, "Meta": False, "xAI": False}

# --- the counts the page states -----------------------------------------------------------------
def count(rs):
    return {"roads": len(rs), "trainer": sum(r["trainer"] for r in rs),
            "coast": sum(r["ends"] == "coast" for r in rs), "land": sum(r["ends"] == "land" for r in rs),
            "internal": sum(r["internal"] is True for r in rs),
            "recital": sum(r["internal"] == "by recital" for r in rs),
            "stock": sum(r["stock"] for r in rs), "stones": sum(len(r["q"]) for r in rs)}
allc, forcec = count(roads), count([r for r in roads if r["standing"] == "force"])
assert allc == {"roads": 9, "trainer": 8, "coast": 1, "land": 2, "internal": 7, "recital": 1, "stock": 3, "stones": 33}, allc
assert forcec == {"roads": 3, "trainer": 2, "coast": 1, "land": 0, "internal": 1, "recital": 1, "stock": 0, "stones": 16}, forcec
C = F["counts"]
assert C["in_force"] == 3 and C["in_force_addressing_holder"] == 0 and C["in_force_stating_stock"] == 0
assert sorted(C["addressing_holder_any_status"]) == sorted(r["id"] for r in roads if r["ends"] == "land")
assert sorted(C["stating_stock_any_status"]) == sorted(r["id"] for r in roads if r["stock"])
assert sorted(C["in_force_reaching_internal_use"]) == ["ca-sb53", "eu-ai-act"]

out = {"source": {"field_commit": FIELD_COMMIT, "field_path": FIELD_PATH, "field_sha256": FIELD_SHA,
                  "land": "works/2026-11-08-no-public-land/data.js", "quarter": QUARTER, "total_h100e": total},
       "roads": roads, "stones": stones, "code": {"Google": "c2", "xAI": "c1"},
       "parcels": parcels, "shoal": shoal, "kept_pct": kept_pct, "signed_pct": signed_pct,
       "counts": {"all": allc, "force": forcec, "stones": 35, "checked": 30}}
(HERE / "data.js").write_text("// Built by build.py from the Field's study 69 (field-research@" + FIELD_COMMIT[:7] +
                              ") and works/2026-11-08-no-public-land/data.js. Do not edit.\nwindow.NRI = " +
                              json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("data.js written:", allc, forcec, "kept", kept_pct, "signed", signed_pct)
