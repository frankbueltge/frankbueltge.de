# Numbers of the work: the drawn stratum, the licensed stratum (from the 2026-10-06 reading), their difference, and the two strata joined.
import json,math,collections
def wilson(k,n,z=1.959964):
    p=k/n;d=1+z*z/n;c=(p+z*z/(2*n))/d;h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d
    return [max(0,c-h),min(1,c+h)]
def fisher2(a,b,c,d):  # two-sided exact, tables as extreme or more
    n=a+b+c+d;r1=a+b;c1=a+c
    pr=lambda x:math.comb(c1,x)*math.comb(n-c1,r1-x)/math.comb(n,r1)
    p0=pr(a);return sum(pr(x) for x in range(max(0,r1-(n-c1)),min(r1,c1)+1) if pr(x)<=p0*(1+1e-9))
d=json.load(open('all_records.json'));dr=json.load(open('draw.json'));rd=json.load(open('reading.json'))
by={r['key']:r for r in d['rows']}
lic=[r for r in d['rows'] if r['licence'] in('CC0','CC-BY')]
unl=[r for r in d['rows'] if r['licence'] in('CC-BY-NC','other/none')]
NA,NB=len(lic),len(unl);N=NA+NB
assert NA+NB==len(d['rows'])
cls=collections.Counter(r['reading'] for r in rd['rows']);nB=len(rd['rows']);kB=nB-cls['alive']
nA=135;kA_non=5;kA_bone=1   # the 2026-10-06 reading of the licensed 135 (../2026-10-06-every-open-one/results.json)
prev=json.load(open('../2026-10-06-every-open-one/results.json'))
assert prev['classes']=={'alive':130,'remains':1,'unclear':2,'no-animal':2}
sample=[by[k] for k in dr['keys']]
m=collections.Counter(r['observer'] for r in sample);bbar=sum(v*v for v in m.values())/sum(m.values())
licobs={r['observer'] for r in lic}
wA=wilson(kA_non,nA);wB=wilson(kB,nB);wAb=wilson(kA_bone,nA)
est=lambda pa,pb:(NA*pa+NB*pb)/N
res=dict(
 population=N,licensed=NA,unlicensed=NB,drawn=nB,seed=dr['seed'],
 classes=dict(cls),non_living=kB,
 drawn_observers=len(m),drawn_largest_observer=max(m.values()),drawn_observers_also_licensed=len(set(m)&licobs),
 drawn_year_2024_on=sum(r['year']>=2024 for r in sample),licensed_year_2024_on=sum(r['year']>=2024 for r in lic),
 drawn_licence=dict(collections.Counter(r['licence'] for r in sample)),
 design_effect={str(rho):round(1+(bbar-1)*rho,3) for rho in(0.05,0.28)},
 effective_n_rho05=round(nB/(1+(bbar-1)*0.05),1),
 drawn_non_living=dict(k=kB,n=nB,wilson=wB,rule_of_three_upper=3/nB),
 licensed_non_living=dict(k=kA_non,n=nA,wilson=wA),
 licensed_bone=dict(k=kA_bone,n=nA,wilson=wAb),
 fisher_two_sided_5of135_vs_0of135=fisher2(kA_non,nA-kA_non,kB,nB-kB),
 joined_non_living=dict(share=est(kA_non/nA,kB/nB),lo=est(wA[0],wB[0]),hi=est(wA[1],wB[1]),
   count=[round(est(wA[0],wB[0])*N),round(est(kA_non/nA,kB/nB)*N),round(est(wA[1],wB[1])*N)],
   how="stratum shares weighted by stratum size; bounds are each stratum's Wilson bound added (conservative, not a joint interval)"),
 joined_bone=dict(share=est(kA_bone/nA,0),lo=est(wAb[0],wB[0]),hi=est(wAb[1],wB[1]),
   count=[round(est(wAb[0],wB[0])*N),round(est(kA_bone/nA,0)*N),round(est(wAb[1],wB[1])*N)]),
 field_n10_interval=[0.0179,0.4042],prev_licensed_bone_interval=wAb,
 unread=NB-nB,unread_if_rate=lambda r:None)
del res['unread_if_rate']
json.dump(res,open('results.json','w'),indent=1)
print(json.dumps({k:res[k] for k in('classes','drawn_observers','drawn_observers_also_licensed','design_effect','effective_n_rho05','drawn_non_living','fisher_two_sided_5of135_vs_0of135','joined_non_living','joined_bone','drawn_year_2024_on','licensed_year_2024_on','licensed','unlicensed')},indent=1))
