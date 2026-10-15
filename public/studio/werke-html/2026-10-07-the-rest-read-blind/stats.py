# Counts, Wilson intervals, Fisher exact test, observer clustering for the further read, and the two lots. Writes results.json.
import json,math,itertools
from math import comb
U='../2026-10-07-the-unshown/'
rows={r['key']:r for r in json.load(open(U+'all_records.json'))['rows']}
k1=json.load(open(U+'draw.json'))['keys'];k2=json.load(open('draw.json'))['keys']
rd=json.load(open('reading.json'))['odd']
def wilson(k,n,z=1.96):
    p=k/n;d=1+z*z/n;c=(p+z*z/2/n)/d;h=z*math.sqrt(p*(1-p)/n+z*z/4/n/n)/d;return [c-h,c+h]
def fisher(a,n1,b,n2):
    N=n1+n2;K=a+b;tot=comb(N,K);pr=lambda x:comb(n1,x)*comb(n2,K-x)/tot
    p0=pr(a);return sum(pr(x) for x in range(max(0,K-n2),min(n1,K)+1) if pr(x)<=p0*(1+1e-9))
frames=[]
for i,k in enumerate(k1): frames.append(dict(lot='A',i=i,key=k,obs=rows[k]['observer'],cls='living'))
for i,k in enumerate(k2):
    o=rd.get(str(i));frames.append(dict(lot='B',i=i,key=k,obs=rows[k]['observer'],cls=o['class'] if o else 'living'))
# session 155 reading: all 135 living (three hard frames flagged, called living)
n=len(frames);B=[f for f in frames if f['lot']=='B']
odd_s=sum(f['cls'] in('remains','no_animal') for f in frames);unc=sum(f['cls']=='unclear' for f in frames)
res=dict(n_first=135,n_further=90,n_all=n,odd_settled=odd_s,unclear=unc,bone=sum(f['cls']=='remains' for f in frames),
 observers_further=len({f['obs'] for f in B}),observers_all=len({f['obs'] for f in frames}),
 further_alone=dict(odd=[3,90],wilson=wilson(3,90),wilson_incl_unclear=wilson(4,90)),
 all_unlicensed=dict(odd=[3,225],wilson=wilson(3,225),wilson_incl_unclear=wilson(4,225)),
 licensed=dict(odd=[4,135],wilson=wilson(4,135),bone=[1,135],wilson_bone=wilson(1,135)),
 fisher=dict(lic4_v_unlic3_of225=fisher(4,135,3,225),lic4_v_unlic4_of225=fisher(4,135,4,225),lic4_v_further3_of90=fisher(4,135,3,90),lic4_v_first0_of135=fisher(4,135,0,135),first0_of135_v_further3_of90=fisher(0,135,3,90),first0_of135_v_further4_of90=fisher(0,135,4,90)),
 ratio=dict(point=(4/135)/(3/225),point_incl_unclear=(4/135)/(4/225)))
json.dump(res,open('results.json','w'),indent=1)
json.dump(dict(frames=frames),open('frames.json','w'))
print(json.dumps(res,indent=1))
