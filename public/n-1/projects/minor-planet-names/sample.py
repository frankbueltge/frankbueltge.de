"""Project 9: draw the registered sample from the MPC list of named minor planets.

Usage: python3 sample.py MPNames.html  -> writes sample.json (numbers only).
The list itself (names) is not committed; its sha256 and fetch time are in SELECTION.md.
"""
import json, random, re, sys

t = open(sys.argv[1], encoding="utf-8").read()
pre = t[t.find("<pre>"):t.find("</pre>")]
nums = sorted(set(int(m) for m in re.findall(r"\((\d+)\)", pre)))
sample = random.Random(20261015).sample(nums, 3000)
json.dump({"frame_count": len(nums), "seed": 20261015, "numbers": sample},
          open("sample.json", "w"), indent=0)
print(len(nums), len(sample))
