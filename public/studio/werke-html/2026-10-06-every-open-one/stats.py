# Intervals and the field check, from census.json + reading.json -> results.json. Wilson 95 % (the Field's method, for comparability) and Clopper-Pearson.
import json,math,collections
c=json.load(open('census.json')); rd=json.load(open('reading.json'))
def wilson(k,n,z=1.959964):
    p=k/n; d=1+z*z/n; m=(p+z*z/(2*n))/d; h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d; return m-h,m+h
def cdf(k,n,p): return sum(math.comb(n,i)*p**i*(1-p)**(n-i) for i in range(k+1))
def cp(k,n,a=0.05):
    def solve(f):
        lo,hi=0.0,1.0
        for _ in range(80):
            mid=(lo+hi)/2
            if f(mid): lo=mid
            else: hi=mid
        return (lo+hi)/2
    L=0.0 if k==0 else solve(lambda p:1-cdf(k-1,n,p)<a/2)
    U=1.0 if k==n else solve(lambda p:cdf(k,n,p)>a/2)
    return L,U
n=len(c['rows']); cls=collections.Counter(v['reading'] for v in rd.values())
N=c['records']
def block(k,n):
    w=wilson(k,n); q=cp(k,n)
    return dict(k=k,n=n,share=k/n,wilson=w,clopper_pearson=q,records_of_all_wilson=[round(w[0]*N),round(w[1]*N)],records_of_all_cp=[round(q[0]*N),round(q[1]*N)])
res=dict(population=N,licensed_census=n,by_licence=c['by_licence'],classes=dict(cls),
  field_n10=block(1,10),remains_in_census=block(cls['remains'],n),
  not_a_living_animal_in_frame=block(n-cls['alive'],n))
# fields: how many living records share each odd record's field profile?
F=('state','dataset','verification','has_remarks','has_coords')
prof=lambda r:tuple(r[f] for f in F)
living=[r for r in c['rows'] if rd[str(r['key'])]['reading']=='alive']
odd=[r for r in c['rows'] if rd[str(r['key'])]['reading']!='alive']
res['fields_checked']=list(F)
res['odd_profiles']=[dict(key=r['key'],reading=rd[str(r['key'])]['reading'],living_sharing_all_five=sum(prof(x)==prof(r) for x in living)) for r in odd]
# best single-field cell purity for the 5 odd ones: share of the cell that is odd, per field, odd records' cells
res['odd_cells']={f:[dict(key=r['key'],cell=r[f],cell_size=sum(x[f]==r[f] for x in c['rows']),cell_odd=sum(x[f]==r[f] and rd[str(x['key'])]['reading']!='alive' for x in c['rows'])) for r in odd] for f in F}
res['majority_rule']=dict(says='always living',correct=cls['alive'],of=n)
json.dump(res,open('results.json','w'),indent=1)
for k in ('field_n10','remains_in_census','not_a_living_animal_in_frame'):print(k,{a:b for a,b in res[k].items()})
print(res['odd_profiles']);print(res['majority_rule'])
