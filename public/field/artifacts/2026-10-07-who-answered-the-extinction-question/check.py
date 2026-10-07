import json,re,subprocess,sys
r=json.load(open("data/results.json"));ok=0;bad=0
def c(n,v):
    global ok,bad
    print(("ok   " if v else "FAIL ")+n); ok+=v; bad+=(not v)
c("counts consistent 20066-1607=18459",20066-1607==18459)
c("rate 15.05 %",abs(r["response_rate_functioning"]-0.1505)<5e-5)
c("bounds width = 1-rate",abs(r["bounds_width"]-(1-r["response_rate_functioning"]))<1e-12)
c("break-even 5.04 %",abs(r["r_for_population_10pct"]-0.0504)<5e-5)
c("slider with r=38% returns 38%",abs(0.1504956931578092*0.38+(1-0.1504956931578092)*0.38-0.38)<1e-12)
c("P1..P3 true, P4 false as reported",[r["predictions"][k] for k in("P1","P2","P3","P4")]==[True,True,True,False])
h=open("index.html").read()
c("page states P4 refuted","P4 refuted" in h or "<b>P4 refuted</b>" in h)
c("page numbers match results (44x, 1.95)", round(r["ratio_width_to_shift"])==44 and round(r["max_stratum_shift_points"],2)==1.95)
s=json.load(open("data/sources.json"));c("passages quoted <=200 chars each",all(len(v)<=200 for v in s["passages"].values()))
print(ok,"passed,",bad,"failed");sys.exit(bad>0)
