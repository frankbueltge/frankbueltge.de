# Checks the committed numbers against each other and the page against them. python3 verify.py
import json,re,math,collections,subprocess,sys
ok=0;bad=0
def c(n,cond,note=''):
    global ok,bad
    if cond: ok+=1
    else: bad+=1;print('FAIL',n,note)
d=json.load(open('all_records.json'));dr=json.load(open('draw.json'));rd=json.load(open('reading.json'));res=json.load(open('results.json'))
by={r['key']:r for r in d['rows']}
c('records fetched = rows',d['records']==d['fetched']==len(d['rows']))
c('1,528 records',len(d['rows'])==1528)
c('lots add up',res['licensed']+res['unlicensed']==len(d['rows']))
c('licensed = CC0+CC BY',res['licensed']==sum(r['licence'] in('CC0','CC-BY') for r in d['rows']))
c('draw size',dr['n']==135==len(dr['keys'])==len(set(dr['keys'])))
c('draw only from unlicensed',all(by[k]['licence'] in('CC-BY-NC','other/none') for k in dr['keys']))
import random
pool=[r for r in d['rows'] if r['licence'] in('CC-BY-NC','other/none')];random.Random(dr['seed']).shuffle(pool)
c('draw reproduces from the seed',sorted(r['key'] for r in pool[:135])==dr['keys'])
c('reading covers the draw in order',[r['key'] for r in rd['rows']]==dr['keys'])
c('every reading is alive',all(r['reading']=='alive' for r in rd['rows']))
c('three hard frames',[r['n'] for r in rd['rows'] if r['hard']]==[40,63,104])
c('notes present',all(len(r['note'])>8 for r in rd['rows']))
c('no photograph or observer name committed',not any(k in json.dumps(rd).lower() for k in ('jpg','jpeg','observer','arias')))
c('stat: drawn 0 of 135',res['drawn_non_living']['k']==0 and res['drawn_non_living']['n']==135)
z=1.959964;u=z*z/(135+z*z)
c('wilson upper for 0/135',abs(res['drawn_non_living']['wilson'][1]-u)<1e-9)
c('joined share = weighted mean',abs(res['joined_non_living']['share']-(138*5/135)/1528)<1e-9)
c('joined count 5',res['joined_non_living']['count'][1]==5)
c('joined hi >= each stratum hi weighted',res['joined_non_living']['hi']>res['joined_non_living']['share'])
c('no drawn observer also licensed',res['drawn_observers_also_licensed']==0)
c('observer count',res['drawn_observers']==len({by[k]['observer'] for k in dr['keys']}))
prev=json.load(open('../2026-10-06-every-open-one/results.json'))
c('licensed reading as before',prev['classes']['alive']==130 and prev['not_a_living_animal_in_frame']['k']==5)
c('fisher between 0 and 1',0<res['fisher_two_sided_5of135_vs_0of135']<1)
c('Fisher value',abs(res['fisher_two_sided_5of135_vs_0of135']-0.0602)<0.0005)
c('page is up to date',subprocess.run([sys.executable,'build.py','--check']).returncode==0)
h=open('index.html').read()
c('page carries no foreign script host',not re.search(r'<script[^>]+src=',h))
c('page has no img tag (nothing shown)','<img' not in h)
c('page has no photograph url',not re.search(r'inaturalist-open-data|\.jpe?g',h))
print(f'{ok} passed, {bad} failed');sys.exit(1 if bad else 0)
