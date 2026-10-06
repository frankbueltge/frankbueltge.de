# python3 -I verify.py — checks the census, the reading, the arithmetic, the page, 135 live thumbnails and the five odd records.
import json,math,subprocess,sys,urllib.request,concurrent.futures as cf
ran=failed=0
def ok(n,c,note=''):
    global ran,failed; ran+=1
    if not c: failed+=1; print('  FAIL',n,note)
c=json.load(open('census.json')); rd=json.load(open('reading.json')); rs=json.load(open('results.json'))
rows=c['rows']; keys={r['key'] for r in rows}
ok('135 rows',len(rows)==135); ok('keys unique',len(keys)==135)
ok('all CC0 or CC BY',all(r['licence'] in('CC0','CC-BY') for r in rows))
ok('licence counts sum to the population',sum(c['by_licence'].values())==c['records']==c['fetched']==1520)
ok('open licences = CC0 46 + CC BY 89',c['by_licence']['CC0']==46 and c['by_licence']['CC-BY']==89)
ok('reading covers exactly the census',set(map(int,rd))==keys)
cl={}
for v in rd.values(): cl[v['reading']]=cl.get(v['reading'],0)+1
ok('classes 130/1/2/2',cl=={'alive':130,'remains':1,'no-animal':2,'unclear':2},cl)
ok('every non-alive row has a note',all(v['note'] for v in rd.values() if v['reading']!='alive'))
ok('the 10 earlier readings carry over',sum(v['session']==153 for v in rd.values())==10 and sum(v['session']==154 for v in rd.values())==125)
def wilson(k,n,z=1.959964):
    p=k/n;d=1+z*z/n;m=(p+z*z/(2*n))/d;h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return m-h,m+h
ok("Field's interval reproduced (1.8-40.4 %)",abs(wilson(1,10)[0]-.0179)<5e-4 and abs(wilson(1,10)[1]-.4042)<5e-4)
ok('1 in 135 interval',abs(rs['remains_in_census']['wilson'][0]-wilson(1,135)[0])<1e-9 and abs(rs['remains_in_census']['wilson'][1]-wilson(1,135)[1])<1e-9)
ok('5 in 135 interval',abs(rs['not_a_living_animal_in_frame']['wilson'][1]-wilson(5,135)[1])<1e-9)
ok('Clopper-Pearson upper for 1/135 about 4.06 %',abs(rs['remains_in_census']['clopper_pearson'][1]-.04058)<2e-4)
ok('every odd record shares all five fields with 128 living',all(o['living_sharing_all_five']==128 for o in rs['odd_profiles']) and len(rs['odd_profiles'])==5)
r=subprocess.run([sys.executable,'-I','build.py','--check'],capture_output=True,text=True); ok('index.html matches sources',r.returncode==0,r.stdout+r.stderr)
def head(u):
    for i in range(3):
        try:
            q=urllib.request.Request(u,method='HEAD'); return urllib.request.urlopen(q,timeout=40).status
        except Exception: pass
    return 0
us=[x['img'].replace('original','small') for x in rows]
with cf.ThreadPoolExecutor(8) as ex: st=list(ex.map(head,us))
ok('135 thumbnails answer 200',st.count(200)==135,st.count(200))
odd=[x for x in rows if rd[str(x['key'])]['reading']!='alive']
for x in odd:
    try:
        j=json.load(urllib.request.urlopen(f"https://api.gbif.org/v1/occurrence/{x['key']}",timeout=60))
        ok(f"live record {x['key']} still carries its image",any(m.get('identifier')==x['img'] for m in j.get('media',[])))
    except Exception as e: ok(f"live record {x['key']}",False,e)
print(f'{ran} checks, {failed} failed'); sys.exit(1 if failed else 0)
