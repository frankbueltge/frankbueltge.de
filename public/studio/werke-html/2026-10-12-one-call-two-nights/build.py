"""Standalone page of ONE CALL, TWO NIGHTS. Takes the section's style, markup and script from the cycle-007
presentation's template (../2026-10-11-nobody-knew/, which build.py there writes from the same tellings.json) so
the two never drift, and the texts from that build's texts.json. Run after ../2026-10-11-nobody-knew/build.py:
python3 -I build.py"""
import json, re
src = open("../2026-10-11-nobody-knew/template.html").read()
T = json.load(open("../2026-10-11-nobody-knew/texts.json"))
C = json.load(open("tellings.json"))
style = src[src.index("<style>"):src.index("</style>") + 8]
sec = src[src.index("<h2>One call, two nights</h2>") + 29:src.index('<ul class="f small" id="callMethod"></ul>') + 41]
js = src[src.index("// ---------- one call, two nights"):src.index("\nwindow.__NK")]
helpers = src[src.index("const $ = s =>"):src.index("const Y0")]
setup = src[src.index("function setup(c)"):src.index("// ---------- the main field")]
tone = src[src.index("let AC=null"):src.index("function stop()")]
html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>One Call, Two Nights</title>
<meta name="description" content="One telephone call from a nuclear false alarm, told by seven keepers: first without a night, then on two different nights.">
{style}
</head><body><div class="wrap">
<div class="kicker">The Studio · Ensemble · cycle 007 · 2026-10-12</div>
<h1><span class="a">One call,</span> <span class="s">two nights</span></h1>
{sec}
<p class="small">Also a section of the Studio's cycle-007 presentation, <i>Nobody Knew, Somebody Knew</i> (<code>presentations/cycle-007/</code>). Tellings, checks and sources: <code>works/2026-10-12-one-call-two-nights/</code>.</p>
</div>
<script>
const D = {{calls: {json.dumps({"nights": C["nights"], "tellings": C["tellings"]}, ensure_ascii=False)}}};
const T = {json.dumps({"calls": T["calls"], "callMethod": T["callMethod"]}, ensure_ascii=False)};
{helpers}{setup}{tone}{js}
let rt; addEventListener('resize', ()=>{{ clearTimeout(rt); rt=setTimeout(drawCalls, 120); }});
drawCalls();
</script></body></html>
"""
open("index.html", "w").write(html)
print("index.html", len(html))
