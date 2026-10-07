# Fetches the archive's all-solutions table (ps) and composite (pscomppars) into a scratch directory given as argv[1].
import sys, urllib.request, urllib.parse, hashlib, os
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
BASE = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?format=csv&query="
Q = {
 "ps": "select pl_name,hostname,default_flag,pl_refname,pl_pubdate,disc_year,"
       "pl_orbper,pl_orbpererr1,pl_orbpererr2,pl_radj,pl_radjerr1,pl_radjerr2,"
       "pl_bmassj,pl_bmassjerr1,pl_bmassjerr2,pl_bmassprov from ps",
 "pscomppars": "select pl_name,pl_orbper,pl_orbpererr1,pl_radj,pl_radjerr1,pl_bmassj,pl_bmassjerr1,pl_bmassprov from pscomppars",
}
for k, q in Q.items():
    data = urllib.request.urlopen(BASE + urllib.parse.quote(q), timeout=180).read()
    open(f"{out}/{k}.csv", "wb").write(data)
    print(k, len(data), hashlib.sha256(data).hexdigest()[:16])
