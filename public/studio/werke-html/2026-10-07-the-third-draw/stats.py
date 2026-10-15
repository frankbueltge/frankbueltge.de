# Counts and intervals for the third draw, the three draws pooled, and the Atelier's ratio (analysis.py of its session 5, same power prior) applied to the new counts.
# ratio = predictive(separate lots) / predictive(shared lot); below 1 favours one population. Stdlib only. Writes results.json.
import json,math,collections
from math import comb,lgamma as lg
U='../2026-10-07-the-unshown/';R2='../2026-10-07-the-rest-read-blind/'
rows={r['key']:r for r in json.load(open(U+'all_records.json'))['rows']}
k3=json.load(open('draw.json'))['keys']
obs3=[rows[k]['observer'] for k in k3]
def wilson(k,n,z=1.96):
    p=k/n;d=1+z*z/n;c=(p+z*z/2/n)/d;h=z*math.sqrt(p*(1-p)/n+z*z/4/n/n)/d;return [c-h,c+h]
def fisher(a,n1,b,n2):
    N=n1+n2;K=a+b;tot=comb(N,K);pr=lambda x:comb(n1,x)*comb(n2,K-x)/tot
    p0=pr(a);return sum(pr(x) for x in range(max(0,K-n2),min(n1,K)+1) if pr(x)<=p0*(1+1e-9))
lb=lambda a,b:lg(a)+lg(b)-lg(a+b)
def lpred(k1,n1,a0,j,m):
    a=.5+a0*k1;b=.5+a0*(n1-k1);return lb(a+j,b+m-j)-lb(a,b)
ratio=lambda k1,n1,j,m:math.exp(lpred(k1,n1,0,j,m)-lpred(k1,n1,1,j,m))
bstar=lambda o:sum(v*v for v in collections.Counter(o).values())/len(o)
rd=json.load(open('reading.json'));odd3=len(rd['odd'])
f2=json.load(open(R2+'frames.json'))['frames'];allobs=[f['obs'] for f in f2]+obs3
res=dict(n=len(k3),odd=odd3,observers=len(set(obs3)),bstar_draw3=bstar(obs3),wilson_draw3=wilson(odd3,90),
 pooled=dict(n=315,odd_settled=3,wilson=wilson(3,315),wilson_if_unclear_shell_odd=wilson(4,315),observers=len(set(allobs)),bstar=bstar(allobs)),
 licensed=dict(odd=[4,135],wilson=wilson(4,135)),
 fisher=dict(lic4of135_v_pooled3of315=fisher(4,135,3,315),lic4of135_v_draw3_0of90=fisher(4,135,0,90),draw2_3of90_v_draw3_0of90=fisher(3,90,0,90),draws_1_2_3_homogeneity_note='0/135, 3/90, 0/90'),
 ratio=dict(draw1_alone=ratio(4,135,0,135),draw2_alone=ratio(4,135,3,90),draw3_alone=ratio(4,135,0,90),pooled_315=ratio(4,135,3,315),pooled_315_unclear_odd=ratio(4,135,4,315),pooled_225_session157=ratio(4,135,3,225)),
 zero_odd_extra={str(x):ratio(4,135,3,315+x) for x in (0,100,300,600,1000)})
# Field's price table: ceiling of the joint interval if every unread frame were living, read counts as in the Field's grid (rho 0.05 not re-run here; Wilson on pooled counts only)
res['unread_pool']=1165-90
json.dump(res,open('results.json','w'),indent=1);print(json.dumps(res,indent=1))

# ---- the Field's joined interval (method of field-research artifacts/2026-10-07-what-the-next-read-buys/analyse.py, re-implemented, same inputs:
# NL=138 licensed and NU=1397 other records, observer design factors bL=6.05 (licensed) and bU of the unlicensed frames read, rho=0.05, Beta(.5,.5) posterior, 6000 draws).
import random
NL,NU=138,1397;bL=6.05;rho=0.05
def joined(kL,kU,nU,bU,seed=1,sims=6000):
    r=random.Random(seed);eL=135/(1+(bL-1)*rho);eU=nU/(1+(bU-1)*rho)
    bd=lambda k,n:r.betavariate(.5+k,.5+n-k)
    out=sorted((NL*bd(kL*eL/135,eL)+NU*bd(kU*eU/nU,eU))/(NL+NU) for _ in range(sims))
    return [out[int(.025*sims)],out[sims//2],out[int(.975*sims)-1]]
b1=bstar([rows[k]['observer'] for k in json.load(open(U+'draw.json'))['keys']])
b2=bstar([rows[k]['observer'] for k in json.load(open(R2+'draw.json'))['keys']])
b12=bstar([rows[k]['observer'] for k in json.load(open(U+'draw.json'))['keys']+json.load(open(R2+'draw.json'))['keys']])
J=dict(
 check_first_draw_only=dict(inputs='4 of 135 licensed; 0 of 135 unlicensed; bU=%.4f'%b1,interval=joined(4,0,135,b1)),
 two_draws=dict(inputs='4 of 135; 3 of 225; bU=%.4f'%b12,interval=joined(4,3,225,b12)),
 three_draws=dict(inputs='4 of 135; 3 of 315; bU=%.4f'%res['pooled']['bstar'],interval=joined(4,3,315,res['pooled']['bstar'])),
 three_draws_unclear_odd=dict(inputs='4 of 135; 4 of 315',interval=joined(4,4,315,res['pooled']['bstar'])),
 note='Same method and inputs as the Field; simulation noise about 0.1 point. The unlicensed class is treated as one population with the licensed weights NL, NU of the Field.')
res['joined']=J
json.dump(res,open('results.json','w'),indent=1);print(json.dumps(J,indent=1))
