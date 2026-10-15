import json,sys,urllib.request,re
from classes import BY_KEY,CLASSES
D=json.load(open('records.json'));R=D['records'];res=json.load(open('results.json'));h=open('index.html').read()
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
keys=[r['key'] for r in R]
chk('39 records',len(R)==39==res['records'])
chk('record keys unique',len(set(keys))==len(keys))
chk('all dated 2010 or later',all((r['year'] or 0)>=2010 for r in R))
chk('all observation bases',all(r['basis'] in('HUMAN_OBSERVATION','MACHINE_OBSERVATION','OBSERVATION') for r in R))
chk('17 species',res['species']==17==len({r['species'] for r in R}))
chk('every hand-classified key is in the data',all(k in keys for k in BY_KEY))
chk('class counts sum to 39',sum(res['by_class'].values())==39)
chk('expected class counts',res['by_class']=={'A':4,'B':3,'C':1,'D':2,'E':8,'F':1,'G':6,'H':14})
dod=[r for r in R if r['species']=='Raphus cucullatus'];chk('dodo has 3 records, all with media',len(dod)==3 and all(r['media'] for r in dod))
auk=[r for r in R if r['species']=='Pinguinus impennis'];chk('great auk has 5 records',len(auk)==5)
chk('class G is one date, one place, six species',len({(r['date'],r['lat'],r['lon']) for r in R if BY_KEY.get(r['key'])=='G'})==1 and len({r['species'] for r in R if BY_KEY.get(r['key'])=='G'})==6)
chk('class H records carry no media',all(not r['media'] for r in R if r['key'] not in BY_KEY))
chk('class A-C records all carry media',all(r['media'] for r in R if BY_KEY.get(r['key']) in('A','B','C')))
chk('page states 39 and 17',' 39 observation records of 17' in h)
chk('page has 39 cards',h.count('<article')==39)
chk('every record linked',all(f'gbif.org/occurrence/{k}"' in h for k in keys))
chk('no script, no src, no stylesheet link',not re.search(r'<script|src=|<link',h))
chk('neighbours named','Paglen' in h and 'Missing Datasets' in h and 'Laura Cinti' in h)
if '--live' in sys.argv:
    import random;random.seed(4)
    for r in random.sample(R,6):
        x=json.load(urllib.request.urlopen('https://api.gbif.org/v1/occurrence/%d'%r['key'],timeout=40))
        chk(f'live {r["key"]}',x.get('year')==r['year'] and x.get('basisOfRecord')==r['basis'] and x.get('decimalLatitude')==r['lat'])
print(len(ok),'ok',len(bad),'failed',bad);sys.exit(1 if bad else 0)
