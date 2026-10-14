// 40 columns x 12 rows of grey (0 dark .. 255 white), read from record.jpg, top row first.
const COLS=[[255,255,218,250,251,88,23,21,48,11,28,157],[234,161,39,57,50,0,27,25,16,0,72,159],[243,97,0,35,22,17,75,37,33,104,225,255],[235,91,14,43,41,30,39,4,30,206,255,235],[255,134,27,3,24,16,1,37,50,213,255,255],[255,147,60,23,50,49,10,71,5,94,211,255],[229,66,41,31,31,49,6,21,57,166,255,255],[255,37,30,27,0,52,48,27,17,238,255,228],[207,37,15,23,8,43,38,16,21,168,255,255],[249,69,36,43,24,40,28,16,37,45,180,255],[255,76,35,49,34,34,17,26,28,64,171,255],[244,56,10,31,31,29,14,42,8,220,255,228],[238,61,6,18,28,31,13,48,28,233,255,242],[255,106,36,18,29,40,14,39,67,68,167,255],[255,142,61,14,26,50,18,28,56,0,97,255],[255,148,64,1,17,56,22,24,12,47,121,212],[255,110,17,46,19,11,66,17,10,135,249,255],[244,132,26,38,26,5,42,14,55,129,230,255],[244,171,38,25,43,14,24,22,27,67,174,255],[255,206,39,2,57,33,24,37,2,53,167,255],[255,218,33,0,49,38,25,36,43,118,222,255],[251,222,57,0,34,25,24,23,41,111,210,255],[250,246,130,59,38,16,34,22,15,32,118,220],[255,255,202,128,55,18,49,32,42,0,53,190],[227,255,249,107,25,28,34,24,23,52,29,255],[255,255,215,125,52,16,15,35,21,38,18,249],[255,255,255,255,215,93,23,23,19,28,20,242],[255,242,234,212,124,31,11,36,20,35,54,251],[255,255,255,189,73,24,37,43,23,51,104,255],[235,253,244,133,0,0,35,28,24,57,138,255],[234,255,255,231,100,54,53,10,22,47,140,255],[255,238,213,140,18,0,39,40,20,33,129,255],[250,255,225,73,8,34,19,36,14,49,253,255],[255,178,85,0,12,77,35,11,57,87,228,246],[80,31,25,0,17,49,20,34,194,225,255,247],[53,6,40,47,31,21,3,47,224,255,255,250],[233,74,22,24,36,42,11,27,103,230,240,228],[171,32,16,27,15,20,16,51,84,233,249,249],[81,0,31,51,12,8,20,62,152,255,255,255],[255,71,18,26,38,68,37,8,146,253,244,253]];
const N=1464, W=40, H=12, STRIPS=4, PER=N/STRIPS; // 366 hours per strip = 10 columns
const c=document.getElementById('c'), dpr=Math.max(1,window.devicePixelRatio||1);
c.width=1100*dpr; c.height=800*dpr; c.style.width='1100px';
const g=c.getContext('2d'); g.scale(dpr,dpr);
const css=getComputedStyle(document.documentElement);
const paper=css.getPropertyValue('--paper').trim(), ink=css.getPropertyValue('--ink').trim(),
      mark=css.getPropertyValue('--mark').trim(), quiet=css.getPropertyValue('--quiet').trim();
g.fillStyle=paper; g.fillRect(0,0,1100,800);

const L=60, R=1040, top0=96, stripH=132, gapH=28, cell=stripH/H, step=(R-L)/PER, lw=Math.max(1,step*0.52);
g.fillStyle=ink;
for(let h=0;h<N;h++){
  const col=Math.floor(h*W/N), s=Math.floor(h/PER), i=h-s*PER;
  const x=L+i*step+(step-lw)/2, y0=top0+s*(stripH+gapH);
  for(let r=0;r<H;r++){
    const a=1-COLS[col][r]/255; if(a<=0.02) continue;
    g.globalAlpha=Math.min(1,a*1.05); g.fillRect(x,y0+r*cell,lw,cell+0.35);
  }
}
g.globalAlpha=1;
// day boundaries (every 24 h) below each strip; column boundaries (every 36.6 h) above
for(let s=0;s<STRIPS;s++){
  const y0=top0+s*(stripH+gapH);
  g.strokeStyle=mark; g.lineWidth=1;
  for(let d=0; d<=61; d++){ const h=d*24-s*PER; if(h<0||h>PER) continue;
    const x=L+h*step; g.beginPath(); g.moveTo(x,y0+stripH+4); g.lineTo(x,y0+stripH+(d%7===0?14:9)); g.stroke(); }
  g.strokeStyle=quiet;
  for(let k=0;k<=W;k++){ const h=k*N/W-s*PER; if(h<-1e-6||h>PER+1e-6) continue;
    const x=L+h*step; g.beginPath(); g.moveTo(x,y0-4); g.lineTo(x,y0-10); g.stroke(); }
}
g.fillStyle=ink; g.font='italic 22px Georgia, "Times New Roman", serif';
g.fillText('Thirty-Six and a Half Hours',L,52);
g.font='12px Georgia, "Times New Roman", serif'; g.fillStyle=quiet;
g.fillText('1,464 hours, each drawn as the only thing the picture kept of it: the column of grey it fell into. Forty columns, twelve rows.',L,74);
const yb=top0+STRIPS*(stripH+gapH)+6;
g.fillStyle=quiet;
g.fillText('above each strip: the edges of the forty columns, one every 36.6 hours',L,yb);
g.fillStyle=mark;
g.fillText('below each strip: a day boundary every 24 hours from the first value; the longer marks every seventh day',L,yb+18);
