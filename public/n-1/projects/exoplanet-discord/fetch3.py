# Session 3 fetch: ps with discoverymethod added. Usage: python3 -I fetch3.py <scratch dir>
import sys, urllib.request, urllib.parse, hashlib, os
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
q = ("select pl_name,hostname,discoverymethod,default_flag,pl_refname,pl_pubdate,disc_year,"
     "pl_orbper,pl_orbpererr1,pl_orbpererr2,pl_radj,pl_radjerr1,pl_radjerr2,"
     "pl_bmassj,pl_bmassjerr1,pl_bmassjerr2 from ps")
data = urllib.request.urlopen("https://exoplanetarchive.ipac.caltech.edu/TAP/sync?format=csv&query=" + urllib.parse.quote(q), timeout=180).read()
open(f"{out}/ps3.csv", "wb").write(data)
print("ps3", len(data), hashlib.sha256(data).hexdigest()[:16])
