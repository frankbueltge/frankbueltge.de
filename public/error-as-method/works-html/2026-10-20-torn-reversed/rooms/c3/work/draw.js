function letters(T){
  const t=T.replace(/\r/g,'');
  const bi=t.indexOf('LETTERS to DAINES BARRINGTON');
  const re=/^Letter [IVXL]+\s*$/gm;let m;const pos=[];
  while(m=re.exec(t))pos.push(m.index);
  const MN=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const CUM=[0,31,59,90,120,151,181,212,243,273,304,334];
  const res=[];
  pos.forEach((p,i)=>{
    const end=i+1<pos.length?pos[i+1]:t.length;
    const body=t.slice(p,end);
    const head=body.slice(0,700);
    const dm=head.match(/^[A-Za-z ,]*?\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? +(\d{1,2})(?:st|nd|rd|th)?, +(17\d\d)\.\s*$/m);
    const words=body.split(/\s+/).length;
    res.push({to:p>bi?'B':'P',words,d:dm?CUM[MN.indexOf(dm[1].toLowerCase())]+(+dm[2])-1:null,y:dm?+dm[3]:null});
  });
  return res;
}
(function(){
const W=1100,H=800,dpr=Math.max(1,window.devicePixelRatio||1);
const cv=document.getElementById('c');cv.width=W*dpr;cv.height=H*dpr;
const g=cv.getContext('2d');g.scale(dpr,dpr);
const PAPER='#f2ece0',INK='#2b2520',FAINT='rgba(43,37,32,0.28)';
const COL={bird:'#2b2520',beast:'#7a4a2a',insect:'#a07a1c',plant:'#4d6b3a',weather:'#4f6a80'};
g.fillStyle=PAPER;g.fillRect(0,0,W,H);
const cx=560,cy=402,R0=166,R1=179;
const ang=d=>(d+0.5)/365*Math.PI*2-Math.PI/2;
const obs=extract(SELBORNE), lets=letters(SELBORNE);
// calendar ring
g.strokeStyle=INK;g.lineWidth=0.7;
g.beginPath();g.arc(cx,cy,(R0+R1)/2,0,Math.PI*2);g.stroke();
const CUM=[0,31,59,90,120,151,181,212,243,273,304,334,365];
const MNAME=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
for(let i=0;i<12;i++){const a=ang(CUM[i]-0.5);
  g.beginPath();g.moveTo(cx+Math.cos(a)*(R0-2),cy+Math.sin(a)*(R0-2));g.lineTo(cx+Math.cos(a)*(R1+2),cy+Math.sin(a)*(R1+2));g.stroke();
}
// letters: inward bars
const maxW=Math.max(...lets.map(l=>l.words));
lets.forEach(l=>{if(l.d==null)return;const a=ang(l.d);const len=8+70*Math.sqrt(l.words/maxW);
  g.strokeStyle=l.to==='P'?'#8c3b2a':'#3c5a6e';g.lineWidth=1.3;
  g.beginPath();g.moveTo(cx+Math.cos(a)*(R0-3),cy+Math.sin(a)*(R0-3));g.lineTo(cx+Math.cos(a)*(R0-3-len),cy+Math.sin(a)*(R0-3-len));g.stroke();});
// observations
const FS=9.4;g.font='italic '+FS+'px Georgia, "Times New Roman", serif';
const placed=[];// {a0,a1,r0,r1}
const items=obs.slice().sort((p,q)=>p.d-q.d||p.si-q.si);
// faint ticks for dated sentences
items.forEach(o=>{const a=ang(o.d);const n=o.s.split(' ').length;const len=4+Math.min(30,n*0.45);
  g.strokeStyle=FAINT;g.lineWidth=0.6;g.beginPath();g.moveTo(cx+Math.cos(a)*(R1+3),cy+Math.sin(a)*(R1+3));g.lineTo(cx+Math.cos(a)*(R1+3+len),cy+Math.sin(a)*(R1+3+len));g.stroke();});
// labels: merge identical words within a sentence, at most five
const bound=a=>{const c=Math.cos(a),s=Math.sin(a);const bx=c>0?(W-14-cx)/c:c<0?(14-cx)/c:1e9;const by=s>0?(H-12-cy)/s:s<0?(12-cy)/s:1e9;return Math.min(bx,by);};
const fits=(a,r,total,h)=>{if(r+total>bound(a))return false;return !placed.some(p=>{const da=Math.abs(((a-p.a+Math.PI*3)%(Math.PI*2))-Math.PI);return da*Math.min(r,p.r0)<FS*1.05 && r<p.r1+4 && r+total>p.r0-4;});};
const DAY=Math.PI*2/365;
const labs=[];
items.forEach(o=>{
  const seen=new Set();let ws=o.words.filter(w=>!seen.has(w[0])&&seen.add(w[0]));
  if(ws.length>1)ws=ws.filter(w=>w[0]!=='bird'&&w[0]!=='birds');
  ws=ws.slice(0,5);if(!ws.length)return;
  const parts=ws.map(w=>({w:w[0],k:w[1],wd:g.measureText(w[0]).width}));
  const sep=g.measureText(' \u00b7 ').width;
  const total=parts.reduce((s,p)=>s+p.wd,0)+sep*(parts.length-1);
  labs.push({o,parts,sep,total,a0:ang(o.d)});
});
labs.forEach(L=>{
  let best=null;
  for(let r=R1+34;r<560&&!best;r+=3){
    for(let k=0;k<=14;k++){
      for(const sg of k?[1,-1]:[1]){const a=L.a0+sg*k*DAY*0.9;
        if(fits(a,r,L.total)){const cost=r+k*9;if(!best||cost<best.cost)best={a,r,cost};}
      }
    }
  }
  if(!best)return;
  // refine: allow larger radius with smaller offset
  L.a=best.a;L.r=best.r;placed.push({a:L.a,r0:L.r,r1:L.r+L.total});
});
labs.forEach(L=>{ if(L.r==null)return;
  const a0=L.a0,a=L.a,r=L.r;
  g.strokeStyle='rgba(43,37,32,0.42)';g.lineWidth=0.5;
  const rm=R1+22;
  g.beginPath();g.moveTo(cx+Math.cos(a0)*(R1+3),cy+Math.sin(a0)*(R1+3));g.lineTo(cx+Math.cos(a0)*rm,cy+Math.sin(a0)*rm);
  g.lineTo(cx+Math.cos(a)*(rm+10),cy+Math.sin(a)*(rm+10));g.lineTo(cx+Math.cos(a)*(r-2),cy+Math.sin(a)*(r-2));g.stroke();
  g.save();g.translate(cx,cy);
  const flip=Math.cos(a)<0;
  g.rotate(flip?a+Math.PI:a);g.textBaseline='middle';
  let x=flip?-(r+L.total):r;
  const seq=flip?L.parts.slice().reverse():L.parts;
  seq.forEach((p,i)=>{g.fillStyle=COL[p.k];g.fillText(p.w,x,0);x+=p.wd;if(i<seq.length-1){g.fillStyle=FAINT;g.fillText(' \u00b7 ',x,0);x+=L.sep;}});
  g.restore();
});
// month names
g.fillStyle=INK;g.font='10px Georgia, serif';g.textAlign='center';g.textBaseline='middle';
for(let i=0;i<12;i++){const a=ang((CUM[i]+CUM[i+1])/2);g.save();g.translate(cx+Math.cos(a)*(R0+R1)/2,cy+Math.sin(a)*(R0+R1)/2);
  g.rotate(a+Math.PI/2+(Math.sin(a)>0?Math.PI:0));g.fillStyle=PAPER;g.fillRect(-12,-5,24,10);g.fillStyle=INK;g.fillText(MNAME[i],0,0.5);g.restore();}
// center
g.textAlign='center';g.fillStyle=INK;g.font='italic 13px Georgia, serif';g.fillText('Selborne',cx,cy-6);
g.font='9px Georgia, serif';g.fillStyle='rgba(43,37,32,0.6)';g.fillText('twenty years folded into one',cx,cy+10);
// key
g.textAlign='left';g.textBaseline='alphabetic';
g.fillStyle=INK;g.font='italic 17px Georgia, serif';g.fillText('The Selborne Year',28,44);
g.font='10px Georgia, serif';g.fillStyle='rgba(43,37,32,0.7)';
['Gilbert White, The Natural History of Selborne, 1789.','Every letter and every day the letters name,','laid on a single calendar.'].forEach((t,i)=>g.fillText(t,28,62+i*14));
const ky=H-96;g.font='10px Georgia, serif';
const keyline=(y,col,w,txt)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(28,y-3);g.lineTo(48,y-3);g.stroke();g.fillStyle='rgba(43,37,32,0.75)';g.fillText(txt,56,y);};
keyline(ky,'#8c3b2a',1.4,'inward: a letter to Pennant, on the day it was dated; length, its length');
keyline(ky+14,'#3c5a6e',1.4,'inward: a letter to Barrington');
keyline(ky+28,FAINT,0.8,'outward: a sentence naming a day or month');
let x=56;g.fillStyle='rgba(43,37,32,0.75)';g.fillText('and what it names:',x,ky+42);x+=g.measureText('and what it names: ').width;
g.font='italic 10px Georgia, serif';
[['birds','bird'],['beasts','beast'],['insects','insect'],['plants','plant'],['weather','weather']].forEach(([t,k])=>{g.fillStyle=COL[k];g.fillText(t,x,ky+42);x+=g.measureText(t+'  ').width;});
console.log(JSON.stringify({lab:labs.length,placed:placed.length}));window.__stats={obs:obs.length,lab:placed.length,lets:lets.filter(l=>l.d!=null).length};
})();
