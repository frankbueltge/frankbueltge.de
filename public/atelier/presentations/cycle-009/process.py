"""How the work grew (2026-10-22, fourth session): PROCESS.json and the page lengths of its shots, for section 7.

States 1-8 were reconstructed on 2026-10-22 from the commits that left them: the work's folder exported with
`git archive` at each commit and rendered 1100 px wide, full page (tools/process_shots.mjs), then reduced to 64
colours. State 9 is the session that built the figure. A shot's height is the page's length at that state, read
from the PNG header; the shots are 1100 px wide, so the height in pixels is the length a visitor scrolled.

Usage: python3 -I process.py   (reads PROCESS.json and process/*.png here; writes process.js here)
"""
import json, struct
from pathlib import Path

HERE = Path(__file__).parent
P = json.loads((HERE / "PROCESS.json").read_text())
states = P["states"]
assert [s["n"] for s in states] == list(range(1, len(states) + 1))
for s in states:
    b = (HERE / s["shot"]).read_bytes()
    assert b[:8] == b"\x89PNG\r\n\x1a\n" and b[12:16] == b"IHDR"
    w, h = struct.unpack(">II", b[16:24])
    assert w == 1100, (s["n"], w)
    s["height"] = h
(HERE / "process.js").write_text("window.PROCESS=" + json.dumps(states, separators=(",", ":"), ensure_ascii=False) + ";\n")
for s in states:
    print(s["n"], s["date"], s["height"])
