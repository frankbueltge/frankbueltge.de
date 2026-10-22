// Plate XI, The Warranted Closure: the visitor declares the domain a seismic catalogue is held closed over
// (a floor, a radius, a window), and the page writes what that closure makes of 155 earthquake messages:
// met, never needed with a warrant, never needed without one. Rows of P11R carry v[domain] = [verdict, met a year earlier].
(function(){
const $=id=>document.getElementById(id), N=P11R.length, f=n=>n.toLocaleString('en-US');
const FL=P11.floors, RA=P11.radii, WI=P11.windows;
const FLN=x=>x==='any'?'any size':'M'+(x===4.5?'4.5':x.toFixed(0))+'+';
const WIN={strict:'its own minutes (10 min before to its end)',day:'a day either side'};
let fi=3, ri=2, wi=1, sel=-1;
const FK=x=>x==='any'?'any':x.toFixed(1);   // the grid's keys are written as plate11.py writes floats
const key=()=>FK(FL[fi])+'|'+RA[ri]+'|'+WI[wi];
const ORD=P11R.map((r,i)=>i).sort((a,b)=>P11R[a].t<P11R[b].t?-1:P11R[a].t>P11R[b].t?1:a-b);
const grid=$('p11grid');
ORD.forEach(j=>{const b=document.createElement('button');b.type='button';b.dataset.i=j;
  b.setAttribute('aria-label','message '+P11R[j].i+', '+P11R[j].t.slice(0,10));b.onclick=()=>{sel=j;draw()};grid.appendChild(b)});
function mk(id,labels,set){const box=$(id);labels.forEach((l,k)=>{const b=document.createElement('button');b.type='button';b.id=id+'-'+k;b.textContent=l;b.onclick=()=>{set(k);draw()};box.appendChild(b)})}
mk('p11fl',FL.map(FLN),k=>fi=k);
mk('p11ra',RA.map(r=>r+' km'),k=>ri=k);
mk('p11wi',WI.map(w=>w==='strict'?'its own minutes':'a day either side'),k=>wi=k);
$('p11-field').onclick=()=>{fi=FL.indexOf(3);ri=RA.indexOf(100);wi=WI.indexOf('day');draw()};
$('p11-quiet').onclick=()=>{const q=P11.quiet_domains.most[0].split('|');fi=FL.findIndex(x=>FK(x)===q[0]);ri=RA.indexOf(+q[1]);wi=WI.indexOf(q[2]);draw()};
$('p11-wide').onclick=()=>{const q=S.least[0].split('|');fi=FL.findIndex(x=>FK(x)===q[0]);ri=RA.indexOf(+q[1]);wi=WI.indexOf(q[2]);draw()};
$('p11-fine').onclick=()=>{fi=FL.indexOf(1);ri=RA.indexOf(100);wi=WI.indexOf('strict');draw()};
const VERD=['met by an earthquake the catalogue keeps','never needed, and the catalogue warrants it','never needed only by a closure the catalogue cannot warrant'];
function card(j){const r=P11R[j],v=r.v[key()],e=r.near_strict,d=r.near_day;
  const ev=x=>x?'M'+x.mag.toFixed(2)+' '+x.place+', '+x.km.toFixed(0)+' km from the nearest named county, '+(x.lag_min<0?f(-x.lag_min)+' min before':f(x.lag_min)+' min after'):'none';
  return '<b>'+r.t.replace('T',' ').slice(0,16)+' UTC · '+r.code+' · '+r.places.join('; ')+'</b><br>“'+r.words.replace(/</g,'&lt;')+'”<br>'+
    'Under this domain: <b>'+VERD[v[0]]+'</b>'+(v[1]?'; the same domain, a year earlier, is “met” too':'')+'.<br>'+
    'Completeness here, from the 30 days before: '+(r.mc==null?'<b>untested</b> ('+r.n_prior+' events within 300 km; too few to estimate)':'about <b>M'+r.mc.toFixed(1)+'</b> ('+f(r.n_prior)+' events within 300 km)')+'.<br>'+
    'Nearest event in its own minutes: '+ev(e)+'. Nearest within a day either side: '+ev(d)+'.'}
function draw(){
  const k=key(), g=P11.grid[k], quiet=g.placebo<=0.05*N&&FL[fi]!=='any';
  grid.querySelectorAll('button').forEach(b=>{const j=+b.dataset.i,v=P11R[j].v[k];b.className='mwu'[v[0]]+(v[1]?' p':'')+(j===sel?' sel':'')});
  $('p11read').innerHTML='<b>Held closed over: earthquakes of '+FLN(FL[fi])+', within '+RA[ri]+' km of a named county, in '+WIN[WI[wi]]+'.</b> '+
    'Met: <b id="p11m">'+g.met+'</b>. Never needed, with the catalogue’s warrant: <b id="p11w">'+g.warranted+'</b>. Never needed, without it: <b id="p11u">'+g.unwarranted+'</b>. '+
    'The same domain “meets” <b id="p11p">'+g.placebo+'</b> of '+N+' a year earlier'+(quiet?', so coincidence is held low here.':(g.placebo>0.05*N?', so much of what it meets could be chance.':'.'))+
    (FL[fi]==='any'?' With no floor, no closure is warranted: every catalogue is incomplete for the smallest earthquakes.':'')+
    ' Backed by a row that says no earthquake came: <b>0</b>. Every “never needed” here is a closure; the warrant says only that the catalogue keeps this domain whole.';
  FL.forEach((_,i)=>$('p11fl-'+i).setAttribute('aria-pressed',String(i===fi)));RA.forEach((_,i)=>$('p11ra-'+i).setAttribute('aria-pressed',String(i===ri)));WI.forEach((_,i)=>$('p11wi-'+i).setAttribute('aria-pressed',String(i===wi)));
  // the matrix: every floor and radius for the current window
  let h='<thead><tr><th>floor \\ radius</th>'+RA.map(r=>'<th>'+r+' km</th>').join('')+'</tr></thead><tbody>';
  FL.forEach((x,a)=>{h+='<tr><th>'+FLN(x)+'</th>';RA.forEach((r,b)=>{const c=P11.grid[FK(x)+'|'+r+'|'+WI[wi]];
    h+='<td'+(a===fi&&b===ri?' class="cur"':'')+'><button type="button" data-f="'+a+'" data-r="'+b+'" aria-label="'+FLN(x)+', '+r+' km">'+
      '<b>'+c.warranted+'</b><span>'+c.placebo+'</span></button></td>'});h+='</tr>'});
  $('p11mat').innerHTML=h+'</tbody>';
  $('p11mat').querySelectorAll('button').forEach(b=>b.onclick=()=>{fi=+b.dataset.f;ri=+b.dataset.r;draw()});
  $('p11card').innerHTML=sel<0?'Tap a square to read its message and what the catalogue holds around it.':card(sel);
  window.__p11={key:k,met:g.met,w:g.warranted,u:g.unwarranted,pl:g.placebo,shown:grid.querySelectorAll('button.w').length};
}
// the figures in the prose
// corrected 2026-10-20: the quiet domains decided over 364 year-earlier days (plate11b.py), not one
const S=Object.assign({},P11.quiet_domains,typeof P11B!=='undefined'?{least:P11B.least,most:P11B.most,n_domains:P11B.quiet_after.length}:{}), sp=k=>k.split('|');
const put=(id,v)=>{const e=$(id);if(e)e.textContent=v};
put('p11f-n',N);put('p11f-cl',P11.clusters);put('p11f-qn',S.n_domains);put('p11f-of',S.of);
put('p11f-lo',S.least[1].warranted);put('p11f-hi',S.most[1].warranted);
put('p11f-lod',FLN(+sp(S.least[0])[0])+', '+sp(S.least[0])[1]+' km, its own minutes');put('p11f-hid',FLN(+sp(S.most[0])[0])+', '+sp(S.most[0])[1]+' km, its own minutes');
put('p11f-mc',P11.mc.min.toFixed(1)+' to '+P11.mc.max.toFixed(1));put('p11f-mcm',P11.mc.median.toFixed(1));
put('p11f-fw',P11.grid['3.0|100|day'].warranted);put('p11f-fs',P11.grid['3.0|100|strict'].warranted);
put('p11f-rob',P11.robust.length);put('p11f-robs',P11.robust_strict.length);
const R=P11.retractions;put('p11f-ret',R.retractions);put('p11f-ret2',R.retractions);put('p11f-swept',R.swept);put('p11f-cards',f(R.of_cards));
const KIND={siren:'a siren or alert set off by mistake',place:'sent to the wrong place, or by the wrong sender',error:'the message sent in error',missile:'a missile alert',shakealert:'an earthquake alert'};
$('p11ret').innerHTML=R.rows.map(r=>'<li data-kind="'+r.kind+'"><span class="note">'+r.t.slice(0,10)+' · '+r.code+' · '+KIND[r.kind]+(r.declared?' · in a declared disaster':'')+'</span><br>“'+r.words.replace(/</g,'&lt;')+'”</li>').join('');
draw();
})();
