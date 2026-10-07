import json
open("index.html","w").write(open("template.html").read().replace("__RESULTS__", json.dumps(json.load(open("results.json")))))
