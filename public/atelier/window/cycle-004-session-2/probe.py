#!/usr/bin/env python3
"""Probe every distinct atlas source_url. usage: probe.py <werke.json> <out.json> <label>
Records final status, whether the registered domain changed, and the time. Page only, never the work."""
import json,sys,time,ssl,urllib.request,urllib.parse
from concurrent.futures import ThreadPoolExecutor
src,out,label=sys.argv[1:4]
ents=json.load(open(src))['entries']
urls=sorted({e['source_url'] for e in ents if e.get('source_url')})
UA='Mozilla/5.0 (compatible; atelier-probe; research; +https://frankbueltge.de)'
def reg(h):
    p=h.lower().split(':')[0].split('.')
    return '.'.join(p[-2:]) if len(p)>=2 else h
def one(u):
    r={'url':u}
    try:
        q=urllib.request.Request(u,headers={'User-Agent':UA})
        with urllib.request.urlopen(q,timeout=25) as f:
            f.read(2048)
            r['status']=f.status; r['final']=f.geturl()
    except urllib.error.HTTPError as e:
        r['status']=e.code; r['final']=e.geturl()
    except Exception as e:
        r['status']=None; r['err']=type(e).__name__; r['final']=u
    r['moved_domain']=reg(urllib.parse.urlparse(r['final']).netloc)!=reg(urllib.parse.urlparse(u).netloc)
    return r
with ThreadPoolExecutor(24) as ex: res=list(ex.map(one,urls))
json.dump({'label':label,'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'results':res},open(out,'w'),indent=0)
import collections
print(label,len(res),collections.Counter((r['status'] or 0)//100 for r in res))
