#!/usr/bin/env python3
"""hosts.py <rows.json> <out.json>: for the own-host pages lost on both s1 passes, resolve the host
and probe its root with the same self-identifying agent as probe.py. Page grain vs host grain."""
import json,sys,socket,urllib.request,urllib.parse,time
rows=json.load(open(sys.argv[1]))
L=[r for r in rows if r['group']=='own' and r['c1'] in('gone','silent') and r['c2'] in('gone','silent')]
UA='Mozilla/5.0 (compatible; atelier-probe; research; +https://frankbueltge.de)'
out=[]
for r in L:
    p=urllib.parse.urlparse(r['url']); h=p.netloc
    o={'url':r['url'],'host':h,'c1':r['c1'],'c2':r['c2']}
    try: o['dns']=sorted({a[4][0] for a in socket.getaddrinfo(h.split(':')[0],None)})[:2]
    except Exception as e: o['dns']=None; o['dns_err']=type(e).__name__
    root=f'{p.scheme}://{h}/'
    try:
        with urllib.request.urlopen(urllib.request.Request(root,headers={'User-Agent':UA}),timeout=25) as f:
            f.read(1024); o['root_status']=f.status; o['root_final']=f.geturl()
    except urllib.error.HTTPError as e: o['root_status']=e.code; o['root_final']=e.geturl()
    except Exception as e: o['root_status']=None; o['root_err']=type(e).__name__
    out.append(o)
json.dump({'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'hosts':out},open(sys.argv[2],'w'),indent=1)
for o in out: print(o['host'],o['c1'],o['c2'],'dns' if o['dns'] else 'NODNS',o.get('root_status'),o.get('root_err',''))
