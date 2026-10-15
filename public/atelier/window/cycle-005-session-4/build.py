"""Build index.html from results.json. Stdlib only."""
import json
R = json.load(open("results.json"))
ORDER = ["both alive", "mud none, B15 alive", "mud alive, B15 none", "both none", "mud a bone, B15 none"]  # the Field's order
calls = [{"name": n, "k": R["field"][n]["k"], "bone": R["field"][n]["bone"], "interval": R["field"][n]["interval"]} for n in ORDER]
calls.append({"name": "bone alone, the Studio's call", "k": 1, "bone": 1, "interval": None})
calls.append({"name": "bone alone, the second reader's call", "k": 2, "bone": 2, "interval": None})
data = {"calls": calls, "k": R["k"]}
h = open("template.html").read().replace("__DATA__", json.dumps(data))
assert "__DATA__" not in h
open("index.html", "w").write(h); print(len(h))
