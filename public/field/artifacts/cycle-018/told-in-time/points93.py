"""Reading 93: extract the programme's findings of steps 1 to 5 from the research-ecology repository's
programme/STATE.md at a pinned commit (CODEBOOK93.md, "The unit").

Usage: python3 points93.py <path to a research-ecology clone>
Writes points93.json beside this script. Reads Git only; no network.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

COMMIT = "b4ed2cb1810e52572e455e7f227541e7db0232b2"
HERE = Path(__file__).resolve().parent


def main(repo):
    text = subprocess.run(["git", "-C", repo, "show", f"{COMMIT}:programme/STATE.md"],
                          capture_output=True, text=True, check=True).stdout
    points = []
    for part in re.split(r"\n## ", text):
        head = part.split("\n", 1)[0].strip()
        m = re.fullmatch(r"Step (\d+)", head)
        if not m or int(m.group(1)) > 5:
            continue
        step = int(m.group(1))
        sec = re.search(r"\*\*What the ecology knows now\.\*\*\n(.*?)\n\n\*\*", part, re.S)
        body = sec.group(1)
        chunks = re.split(r"\n(?=\d+\. )", "\n" + body.strip())
        for ch in chunks:
            ch = ch.strip()
            if not ch:
                continue
            n = int(re.match(r"(\d+)\. ", ch).group(1))
            raw = re.sub(r"\s*\n\s*", " ", ch[len(f"{n}. "):]).strip()
            v = re.match(r"\*([^*]+)\*\s*", raw)
            verdict = v.group(1).strip() if v else None
            rest = raw[v.end():] if v else raw
            # leading claim: the first sentence after the italic verdict
            lead = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9(])", rest, maxsplit=1)[0]
            links = re.findall(r"\]\((https?://[^)\s]+)\)", raw)
            points.append({"id": f"S{step}.{n}", "step": step, "n": n, "verdict": verdict,
                           "lead": lead, "text": raw, "links": links})
    out = {
        "reading": 93,
        "source": {"repo": "frankbueltge/research-ecology", "path": "programme/STATE.md", "commit": COMMIT,
                   "sha256": hashlib.sha256(text.encode()).hexdigest()},
        "count": len(points),
        "by_step": {s: sum(1 for p in points if p["step"] == s) for s in range(1, 6)},
        "points": points,
    }
    (HERE / "points93.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print(out["count"], out["by_step"])


if __name__ == "__main__":
    main(sys.argv[1])
