
// The whole of the material: the 40 x 12 grey values of record.jpg (0 = dark dot, 255 = white).
const G=[[249,255,255,254,222,194,183,182,255,247,235,255,255,228,255,255,248,235,252,255,244,252,255,253,252,255,255,255,255,255,250,244,255,255,255,255,255,245,253,255],[255,253,230,179,112,53,18,5,169,238,238,250,249,239,255,234,254,253,251,255,255,255,249,227,249,219,158,120,166,253,255,255,255,242,238,248,251,245,247,255],[75,80,79,64,41,26,24,28,79,255,255,255,250,243,255,254,255,255,220,202,244,214,140,126,130,109,50,18,96,211,221,155,255,243,209,213,235,251,255,255],[16,21,25,23,19,23,34,45,47,218,216,209,255,255,255,247,222,224,127,76,128,94,21,40,28,24,5,7,64,121,96,28,247,163,71,29,26,29,29,30],[50,48,41,31,22,19,24,29,37,86,20,85,248,255,199,149,79,106,36,0,54,37,0,41,41,21,12,23,33,32,32,39,182,110,36,12,22,30,29,28],[18,19,20,24,32,42,53,59,19,40,0,44,118,79,58,59,2,40,24,15,49,35,11,44,33,19,30,51,35,0,10,52,22,0,0,10,40,50,48,47],[36,32,28,26,26,27,26,24,19,54,44,62,26,0,0,22,24,35,40,41,40,31,23,25,4,13,33,48,41,20,13,20,46,36,36,44,37,14,0,0],[29,27,24,26,29,30,27,24,37,24,0,35,37,27,50,0,49,25,26,27,11,23,40,27,37,41,24,2,14,45,48,25,31,28,31,35,25,16,28,51],[38,12,11,38,42,21,24,49,33,21,14,23,39,46,36,24,39,9,24,44,23,21,46,53,189,165,102,75,23,7,56,23,27,25,29,33,35,68,157,245],[0,52,132,167,112,26,0,24,25,20,30,72,141,213,255,255,126,83,40,0,2,106,223,255,255,255,239,182,63,0,36,15,12,109,209,247,249,255,255,255],[43,115,210,244,179,81,40,53,27,60,121,194,252,255,255,255,255,255,206,123,96,184,255,255,239,255,255,231,127,59,79,37,75,188,255,255,255,255,255,234],[250,252,255,255,255,249,227,226,240,236,235,241,251,255,251,244,253,255,255,255,232,255,255,236,255,255,249,255,255,236,227,130,225,255,255,243,228,250,255,255]];
const W=40,H=12,HOURS=1464,PER=HOURS/W; // 36.6 hours per pixel column
const cv=document.getElementById('c'),dpr=window.devicePixelRatio||1;
cv.width=1100*dpr;cv.height=800*dpr;cv.style.width='1100px';cv.style.height='800px';
const x=cv.getContext('2d');x.scale(dpr,dpr);
x.fillStyle='#f3f0e8';x.fillRect(0,0,1100,800);
const ink=(a)=>'rgba(29,28,26,'+a.toFixed(3)+')';
function dark(col,row){col=Math.max(0,Math.min(W-1,col));row=Math.max(0,Math.min(H-1,row));return Math.max(0,1-G[row][col]/235);}
// darkness at height v (0..12, 0 = top) inside the record's column col: smoothed only vertically,
// never across columns, because the record keeps nothing finer than a column
function D(col,v){const cv2=v-0.5,r0=Math.floor(cv2),fv=cv2-r0;return dark(col,r0)*(1-fv)+dark(col,r0+1)*fv;}
const L=70,R=1030,BANDS=4,COLS=W/BANDS,HPB=HOURS/BANDS; // 366 hours per band
const top0=96,bandH=128,gap=36,step=(R-L)/HPB,SUB=96;
for(let b=0;b<BANDS;b++){
 const y0=top0+b*(bandH+gap);
 // column boundaries of the record, above the band
 x.fillStyle=ink(.45);
 for(let k=0;k<=COLS;k++){const xx=L+k*(R-L)/COLS;x.fillRect(xx-.5,y0-12,1,6);}
 // one thread per hour, laid across every height its column allows
 for(let i=0;i<HPB;i++){
  const h=b*HPB+i,u=Math.floor((h+0.5)/PER),xx=L+i*step+step*0.25,w=step*0.5;
  for(let s=0;s<SUB;s++){const v=(s+0.5)/SUB*H,d=D(u,v);if(d<0.06)continue;
   x.fillStyle=ink(Math.pow(d,1.6)*0.92);x.fillRect(xx,y0+s*bandH/SUB,w,bandH/SUB+0.3);}
 }
 // days, below the band: 61 of them, out of step with the columns
 x.fillStyle=ink(.55);
 for(let d=0;d<=61;d++){const hh=d*24-b*HPB;if(hh<0||hh>HPB)continue;const xx=L+hh*step;
  x.fillRect(xx-.5,y0+bandH+6,1,d%7==0?9:5);}
}
x.fillStyle='#1d1c1a';x.font='italic 22px Georgia, serif';x.fillText('Somewhere in Here',L,52);
x.fillStyle='#6f6a60';x.font='13px Georgia, serif';
x.fillText('1,464 hours, one thread each, drawn at every height it could have had.',L,74);
const yb=top0+BANDS*(bandH+gap)+4;
x.fillText('Marks above: the 40 columns the record was squeezed into, 36.6 hours each.  Marks below: midnights, 61 days, longer every seventh.',L,yb);
x.fillText('Inside a column the hours cannot be told apart, so each one is given the whole column.',L,yb+18);
