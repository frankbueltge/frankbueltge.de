import json
D="artifacts/2026-10-07-the-draw-and-the-whole/"
r=json.load(open(D+"data/results.json")); s=json.load(open(D+"data/studio-results-2026-10-07.json"))
S={"NL":r["licensed_ours"],"NU":r["other_ours"],"jn":[s["joined_non_living"][k] for k in ("lo","share","hi")],"jb":[s["joined_bone"][k] for k in ("lo","share","hi")]}
g=[{"rho":x["rho"],"non_living":x["non_living"],"bone":x["bone"]} for x in r["grid"]]
t=open(D+"template.html").read().replace("__GRID__",json.dumps(g)).replace("__STUDIO__",json.dumps(S))
open(D+"index.html","w").write(t)
