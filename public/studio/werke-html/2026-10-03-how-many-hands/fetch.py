import json,urllib.request,time,datetime
src=json.load(open('../2026-10-03-who-writes-the-row/gbif-counts.json'))['species']
def get(u):
    for i in range(4):
        try: return json.load(urllib.request.urlopen(u,timeout=60))
        except Exception as e: time.sleep(2*(i+1))
    raise SystemExit('fail '+u)
out=[];orgs={}
for s in src:
    r={'key':s['key'],'name':s['name'],'kingdom':s['kingdom'],'n':s['n']}
    for tag,b in (('live','LIVING_SPECIMEN'),('kept','PRESERVED_SPECIMEN')):
        j=get('https://api.gbif.org/v1/occurrence/search?limit=0&taxonKey=%d&basisOfRecord=%s&facet=publishingOrg&facet=country&facetLimit=100'%(s['key'],b))
        f={x['field']:{c['name']:c['count'] for c in x['counts']} for x in j['facets']}
        r[tag]={'n':j['count'],'orgs':f.get('PUBLISHING_ORG',{}),'countries':f.get('COUNTRY',{})}
        for o in r[tag]['orgs']: orgs.setdefault(o,None)
    out.append(r)
for o in orgs:
    j=get('https://api.gbif.org/v1/organization/'+o);orgs[o]={'title':j.get('title'),'country':j.get('country')}
json.dump({'retrieved':datetime.date.today().isoformat(),'species':out,'orgs':orgs},open('gbif-keepers.json','w'),indent=1)
print(len(out),len(orgs))
