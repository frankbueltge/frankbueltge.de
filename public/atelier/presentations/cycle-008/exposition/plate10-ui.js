// Plate X, The Copy-Text: nine versions of a forecast read as nine editions of a text (Greg 1950).
// Rows come from plate8.js (P8R: [id, mag, date, [[came, stated] x 9 lags], ...]); readings from plate10.js (P10, P10K).
(function(){
const $=id=>document.getElementById(id), N=P8R.length, L=P10.lags_h, fmt=(x,d=2)=>x.toFixed(d);
const LN=L.map(h=>h===0?'first version':h<168?'≥ '+h+' h':'≥ '+(h/24)+' days');
const QUIET=P8R.map(r=>new Set(r[3].map(c=>c[0]>0)).size===1);
let base=0, hand='w', read='copy', sel=-1;
const HANDS={w:{name:'the words',free:'the 182 quiet sequences, where whether an aftershock came is the same in every version',key:'words'},
             e:{name:'the weeks',free:'the 50 sequences whose event changes with the version',key:'weeks'},
             b:{name:'both',free:'all 232 sequences',key:'both'}};
function pickOf(){
  if(read==='copy')return new Array(N).fill(base);
  if(read==='least'||read==='most')return [...P10K['b'+(read==='least'?'l':'m')]].map(Number);
  const k=base+hand+(read==='harsh'?'h':read==='kind'?'k':'r'), s=P10K[k];
  return s?[...s].map(Number):null;
}
function sum(p){let o=0,e=0;p.forEach((k,i)=>{o+=P8R[i][3][k][0];e+=P8R[i][3][k][1]});return {o,e,r:o/e}}
function stat(){
  const ct=P10.copy_texts[base], H=ct.hands[HANDS[hand].key];
  if(read==='copy')return ct.copy_text;
  if(read==='least'||read==='most')return P10.blind_on_the_words['stated_'+read];
  if(read==='harsh')return H.harshest; if(read==='kind')return H.kindest; return null;
}
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function axis(cur){
  const svg=$('p10axis'), W=svg.clientWidth||600, a=Math.log(0.008), b=Math.log(6), x=v=>14+(W-28)*(Math.log(Math.max(v,0.008))-a)/(b-a), ns='http://www.w3.org/2000/svg';
  const el=(t,at,txt)=>{const n=document.createElementNS(ns,t);for(const k in at)n.setAttribute(k,at[k]);if(txt!=null)n.textContent=txt;svg.appendChild(n);return n};
  svg.textContent='';const F={'font-family':'system-ui,sans-serif','font-size':11};
  for(const t of [0.01,0.1,0.5,1,2,5])el('text',{x:x(t),y:146,'text-anchor':'middle',fill:css('--mute'),...F},t);
  el('line',{x1:x(1),x2:x(1),y1:16,y2:132,stroke:css('--ink'),'stroke-dasharray':'3 3'});
  el('text',{x:x(1)+4,y:14,fill:css('--ink'),...F},'right');
  const ct=P10.copy_texts[base];
  [['w',38],['e',66],['b',94]].forEach(([h,y])=>{const H=ct.hands[HANDS[h].key];
    el('line',{x1:x(H.harshest.ratio),x2:x(H.kindest.ratio),y1:y,y2:y,stroke:h==='w'?css('--amber'):h==='e'?css('--calm'):css('--grey'),'stroke-width':h===hand?7:3,'stroke-linecap':'round','data-k':'reach-'+h});
    el('text',{x:x(0.008)+2,y:y-7,fill:css('--mute'),...F},h==='w'?'choosing the words':h==='e'?'choosing the weeks':'choosing both')});
  const c=ct.copy_text; el('line',{x1:x(c.ci[0]),x2:x(c.ci[1]),y1:118,y2:118,stroke:css('--ink'),'stroke-width':1.5});
  el('rect',{x:x(c.ratio)-4,y:113,width:8,height:10,fill:css('--ink'),'data-k':'copy'});
  el('text',{x:x(c.ratio),y:134,'text-anchor':'middle',fill:css('--ink'),...F},'copy-text');
  if(cur)el('circle',{cx:x(cur.r),cy:read==='copy'?118:hand==='w'||read==='least'||read==='most'?38:hand==='e'?66:94,r:6,fill:'none',stroke:css('--accent'),'stroke-width':2.5,id:'p10now'});
}
const grid=$('p10grid');
P8R.forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.dataset.i=i;b.setAttribute('aria-label','sequence '+r[0]+(QUIET[i]?', quiet':', moving'));
  b.onclick=()=>{sel=i;draw()};grid.appendChild(b)});
function collation(p){
  if(sel<0){$('p10card').textContent='Tap a square for its collation: the copy-text and every variant of that forecast.';return}
  const r=P8R[sel], k=p[sel];
  const items=r[3].map((c,j)=>{const s=`<span${j===base?' style="text-decoration:underline"':''}>${LN[j]} ${fmt(c[1],3)}${c[0]>0?' ■':''}</span>`;return j===k?'<b>'+s+'</b>':s}).join(' · ');
  $('p10card').innerHTML=`<b>Sequence ${r[0]}</b>${r[1]?', M '+r[1]:''}${r[2]?', '+r[2]:''}. ${QUIET[sel]?'Quiet: whether an aftershock came is the same in every version; only the promise differs.':'Moving: whether an aftershock came in the warned week changes with the version.'}<br>`+
    `<span class="note">Stated chance for each version's own week (■ an aftershock came in it); copy-text underlined; read now in bold.</span><br>${items}<br>`+
    (k===base?`The copy-text stands.`:`<b>Variant admitted:</b> ${LN[base]} ${fmt(r[3][base][1],3)}] ${LN[k]} ${fmt(r[3][k][1],3)}`);
}
function draw(){
  const p=pickOf();
  [...grid.children].forEach((b,i)=>{b.className=(QUIET[i]?'q':'m')+(p&&p[i]!==base&&read!=='least'&&read!=='most'?' v':'')+((read==='least'||read==='most')&&p[i]!==base?' v':'')+(i===sel?' sel':'')});
  const ct=P10.copy_texts[base], H=ct.hands[HANDS[hand].key];
  for(let k=0;k<9;k++)$('p10-l'+k).setAttribute('aria-pressed',k===base);
  for(const h of 'web')$('p10-h'+h).setAttribute('aria-pressed',h===hand);
  for(const r of ['copy','harsh','kind','right','least','most'])$('p10-'+r).setAttribute('aria-pressed',r===read);
  if(!p){window.__p10={base,hand,read,none:true};axis(null);collation(new Array(N).fill(base));
    $('p10read').innerHTML=`From the copy-text <b>${LN[base]}</b> (${fmt(ct.copy_text.ratio)}), choosing <b>${HANDS[hand].name}</b> alone cannot bring the odds to "right": the furthest that hand reaches is ${fmt(H.kindest.ratio)}. No apparatus of variants does it.`;return}
  const s=sum(p), st=stat(), subs=p.filter(k=>k!==base).length, blind=read==='copy'||read==='least'||read==='most';
  window.__p10={base,hand,read,o:s.o,e:s.e,r:s.r,subs,blind};
  axis(s);collation(p);
  const n=`${s.o} came where ${fmt(s.e,1)} were stated (${fmt(s.r)}${st?'; 95 %: '+fmt(st.ci[0])+' to '+fmt(st.ci[1]):''})`;
  let t;
  if(read==='copy')t=`<b>The copy-text, ${LN[base]}, for every sequence.</b> ${n}. Declared before any outcome: the odds ${st.verdict==='cannot be told from right'?'cannot be told from right':'ran '+st.verdict}. <b>Mood: indicative.</b>`;
  else if(blind)t=`<b>For every sequence, the version that stated ${read}.</b> A rule about the words alone, which can be declared before anything is fetched: ${n}. The odds ${st.verdict==='cannot be told from right'?'cannot be told from right':'ran '+st.verdict}. <b>Mood: indicative.</b> ${subs} of ${N} readings differ from the copy-text ${LN[base]}.`;
  else{const verb=st&&st.verdict!=='cannot be told from right'?'would have run '+st.verdict:'could not have been told from right';
    const what=hand==='w'?'Had the warnings said this':hand==='e'?'Had these been the weeks':'Had these been the warnings and their weeks';
    t=`<i>${what}, the odds ${read==='right'?'would have reached "right"':verb}: ${n}.</i> <b>Mood: subjunctive.</b> Chosen after looking, among ${HANDS[hand].free}. <b>${subs} variant${subs===1?'':'s'} admitted</b> against the copy-text ${LN[base]}.`+
      (hand==='w'?' Whether an aftershock came is the same as in the copy-text for every one of them; only what was promised differs.':'');}
  $('p10read').innerHTML=t;
}
const lb=$('p10lags');L.forEach((h,k)=>{const b=document.createElement('button');b.id='p10-l'+k;b.textContent=LN[k];b.onclick=()=>{base=k;draw()};lb.appendChild(b)});
for(const h of 'web')$('p10-h'+h).onclick=()=>{hand=h;if(read==='least'||read==='most')read='kind';draw()};
for(const r of ['copy','harsh','kind','right','least','most'])$('p10-'+r).onclick=()=>{read=r;draw()};
const F=P10.first_hour, B=P10.blind_on_the_words;
$('p10f-ct').textContent=fmt(F.copy_text);$('p10f-w').textContent=fmt(F.words_kindest.ratio);$('p10f-e').textContent=fmt(F.weeks_kindest.ratio);
$('p10f-wr').textContent=F.words_fewest_to_right;$('p10b-l').textContent=fmt(B.stated_least.ratio);$('p10b-m').textContent=fmt(B.stated_most.ratio);
addEventListener('resize',()=>draw());
draw();
})();
