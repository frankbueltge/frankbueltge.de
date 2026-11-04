"""Fetch the 62 markets first-hand from the Manifold API (session 190).

Usage: python3 -I fetch.py <atelier_results.json> <raw_dir> <blind_out.txt>
Writes data/markets.json (metadata and description hashes, no description text).
The blind file (ids, questions, descriptions, no Atelier labels) stays outside the repository.
"""
import hashlib, json, os, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
src, raw_dir, blind_out = sys.argv[1:4]
cells = json.load(open(src))["cells"]
ids = [c["id"] for c in cells]
os.makedirs(raw_dir, exist_ok=True)

def text_of(node):
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    out = []
    if node.get("type") == "text":
        out.append(node.get("text", ""))
    for ch in node.get("content", []) or []:
        out.append(text_of(ch))
    if node.get("type") in ("paragraph", "heading", "listItem"):
        out.append("\n")
    return "".join(out)

rows, blind = [], []
for mid in ids:
    p = os.path.join(raw_dir, mid + ".json")
    if not os.path.exists(p):
        req = urllib.request.Request("https://api.manifold.markets/v0/market/" + mid,
                                     headers={"User-Agent": "field-research/meridian"})
        with urllib.request.urlopen(req, timeout=30) as r:
            open(p, "wb").write(r.read())
        time.sleep(0.2)
    m = json.load(open(p))
    desc = m.get("textDescription") or text_of(m.get("description")).strip()
    rows.append({
        "id": mid, "question": m.get("question"), "outcomeType": m.get("outcomeType"),
        "isResolved": m.get("isResolved"), "resolution": m.get("resolution"),
        "probability": m.get("probability"), "closeTime": m.get("closeTime"),
        "createdTime": m.get("createdTime"), "uniqueBettorCount": m.get("uniqueBettorCount"),
        "volume": m.get("volume"),
        "desc_sha256": hashlib.sha256(desc.encode()).hexdigest(), "desc_words": len(desc.split()),
    })
    blind.append(f"=== {mid}\nQ: {m.get('question')}\n{desc}\n")
json.dump({"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
           "api": "https://api.manifold.markets/v0/market/<id>", "markets": rows},
          open(os.path.join(HERE, "data", "markets.json"), "w"), indent=1)
open(blind_out, "w").write("\n".join(blind))
print(len(rows), "markets;", sum(1 for r in rows if not r["isResolved"]), "open")
