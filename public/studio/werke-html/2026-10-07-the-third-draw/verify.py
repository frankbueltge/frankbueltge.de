# Checks the committed data and the page's inputs against the earlier works and the sibling inputs. Stdlib only.
import json,re,math
R=json.load(open('results.json'));D=json.load(open('data.json'));P=open('index.html').read()
O='../2026-10-07-the-rest-read-blind/'
ok=0;bad=0
def t(n,c):
    global ok,bad
    if c: ok+=1
    else: bad+=1
    print('ok  ' if c else 'FAIL',n)
dr=json.load(open('draw.json'));prev=set(json.load(open('../2026-10-07-the-unshown/draw.json'))['keys'])|set(json.load(open(O+'draw.json'))['keys'])
t('draw: 90 keys, unique',len(dr['keys'])==90==len(set(dr['keys'])))
t('draw disjoint from both earlier draws',not set(dr['keys'])&prev)
rows={r['key']:r for r in json.load(open('../2026-10-07-the-unshown/all_records.json'))['rows']}
t('all drawn keys are unlicensed (forbidden to show)',all(rows[k]['licence'] in('CC-BY-NC','other/none') for k in dr['keys']))
t('pool size 1,165',dr['pool']==1165)
t('seed recorded',dr['seed']==20261007158)
t('reading: 0 odd, 0 unclear',R['odd']==0)
t('observers 74',R['observers']==74)
t('licensed lot 135, 4 odd',sum(r['c']!='alive' for r in D['lic'])==4 and len(D['lic'])==135)
t('lot B: 3 odd, 1 unclear, 90',sum(r['c'] in('none','remains') for r in D['B'])==3 and sum(r['c']=='unclear' for r in D['B'])==1 and len(D['B'])==90)
t('lots A, C all alive',all(r['c']=='alive' for r in D['A']+D['C']) and len(D['A'])==135 and len(D['C'])==90)
t('every licensed row has image and source',all(r['img'].startswith('https://') and r['src'].startswith('https://') for r in D['lic']))
t('Atelier ratio, pooled 225, equals its published 0.1498',abs(R['ratio']['pooled_225_session157']-0.14980907)<1e-6)
t("Atelier ratio, 4/135 v 3/90, equals its published 0.1077",abs(R['ratio']['draw2_alone']-0.10773318)<1e-6)
t('Field joined interval, first draw, reproduces 0.14 to 2.13 %',abs(R['joined']['check_first_draw_only']['interval'][0]-0.0014)<0.0003 and abs(R['joined']['check_first_draw_only']['interval'][2]-0.0213)<0.0005)
t('refutation test: the three draws are not all on one side of 1 by 3x',not all(R['ratio'][k]<1/3 for k in('draw1_alone','draw2_alone','draw3_alone')))
import subprocess
t('page is data-consistent (build --check)',subprocess.run(['python3','build.py','--check'],capture_output=True).returncode==0)
t('page has no external script',not re.search(r'<script[^>]+src=',P))
t('page has no unfilled placeholder','__DATA__' not in P)
print(ok,'passed,',bad,'failed');raise SystemExit(bad)
