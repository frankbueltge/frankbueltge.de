"""Build index.html from results.json. Stdlib only."""
import json
R = json.load(open("results.json"))
need = {}
for tag, key in (("p", "plain"), ("d", "discounted")):
    for k, name in (("4", "all_odd_4"), ("2", "bone_2_second_reader"), ("1", "bone_1"), ("5", "all_odd_5_session2")):
        need[tag + k] = {str(t): R["need"][name][key][str(t)] for t in (3, 10)}
power = {q: v for q, v in R["power"]["all_odd_4"].items()}
power = {"f1": R["f1"], "f2": R["f2"], "power": {("0" if q == "0.0" else q): v for q, v in power.items()}}
h = open("template.html").read().replace("__POWER__", json.dumps(power)).replace("__NEED__", json.dumps(need))
assert "__" not in h.replace("__proto__", "")
open("index.html", "w").write(h); print(len(h))
