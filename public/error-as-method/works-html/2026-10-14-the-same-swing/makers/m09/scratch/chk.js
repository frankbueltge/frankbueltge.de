
// The 480 grey values of record.jpg, column by column (left to right), top to bottom.
var P=[[249,255,75,16,50,18,36,29,38,0,43,250],[255,253,80,21,48,19,32,27,12,52,115,252],[255,230,79,25,41,20,28,24,11,132,210,255],[254,179,64,23,31,24,26,26,38,167,244,255],[222,112,41,19,22,32,26,29,42,112,179,255],[194,53,26,23,19,42,27,30,21,26,81,249],[183,18,24,34,24,53,26,27,24,0,40,227],[182,5,28,45,29,59,24,24,49,24,53,226],[255,169,79,47,37,19,19,37,33,25,27,240],[247,238,255,218,86,40,54,24,21,20,60,236],[235,238,255,216,20,0,44,0,14,30,121,235],[255,250,255,209,85,44,62,35,23,72,194,241],[255,249,250,255,248,118,26,37,39,141,252,251],[228,239,243,255,255,79,0,27,46,213,255,255],[255,255,255,255,199,58,0,50,36,255,255,251],[255,234,254,247,149,59,22,0,24,255,255,244],[248,254,255,222,79,2,24,49,39,126,255,253],[235,253,255,224,106,40,35,25,9,83,255,255],[252,251,220,127,36,24,40,26,24,40,206,255],[255,255,202,76,0,15,41,27,44,0,123,255],[244,255,244,128,54,49,40,11,23,2,96,232],[252,255,214,94,37,35,31,23,21,106,184,255],[255,249,140,21,0,11,23,40,46,223,255,255],[253,227,126,40,41,44,25,27,53,255,255,236],[252,249,130,28,41,33,4,37,189,255,239,255],[255,219,109,24,21,19,13,41,165,255,255,255],[255,158,50,5,12,30,33,24,102,239,255,249],[255,120,18,7,23,51,48,2,75,182,231,255],[255,166,96,64,33,35,41,14,23,63,127,255],[255,253,211,121,32,0,20,45,7,0,59,236],[250,255,221,96,32,10,13,48,56,36,79,227],[244,255,155,28,39,52,20,25,23,15,37,130],[255,255,255,247,182,22,46,31,27,12,75,225],[255,242,243,163,110,0,36,28,25,109,188,255],[255,238,209,71,36,0,36,31,29,209,255,255],[255,248,213,29,12,10,44,35,33,247,255,243],[255,251,235,26,22,40,37,25,35,249,255,228],[245,245,251,29,30,50,14,16,68,255,255,250],[253,247,255,29,29,48,0,28,157,255,255,255],[255,255,255,30,28,47,0,51,245,255,234,255]];
var c=document.getElementById('c'),x=c.getContext('2d');
var dpr=window.devicePixelRatio||1;c.width=1100*dpr;c.height=800*dpr;c.style.width='1100px';c.style.height='800px';x.scale(dpr,dpr);
x.fillStyle='#f4f1ea';x.fillRect(0,0,1100,800);
var L=70,T=118,CW=20,G=4,CH=46,N=40,R=12;
function cx(i){return L+i*(CW+G);}
// JPEG 8x8 blocks: faint ground where the compressor made its decisions
x.fillStyle='rgba(120,110,95,0.06)';
for(var bx=0;bx<5;bx++)for(var by=0;by<2;by++){if((bx+by)%2)continue;
  var x0=cx(bx*8)-G/2,x1=cx(Math.min(bx*8+8,N))-G/2,y0=T+by*8*CH,y1=T+Math.min(by*8+8,R)*CH;
  x.fillRect(x0,y0-6,x1-x0,y1-y0+12);}
// the material itself: every pixel, as found
for(var i=0;i<N;i++)for(var j=0;j<R;j++){var v=P[i][j];
  x.fillStyle='rgb('+v+','+v+','+v+')';
  if(v>=246)continue; // white stays the page
  x.fillRect(cx(i),T+j*CH,CW,CH-1);}
// envelope: where each column turns dark (threshold 128, sub-pixel by partial darkness)
function edges(col){var t=null,b=null;
  for(var j=0;j<R;j++)if(col[j]<128){t=j-(j>0?(255-col[j-1])/255:0);break;}
  for(var j=R-1;j>=0;j--)if(col[j]<128){b=j+1+(j<R-1?(255-col[j+1])/255:0);break;}
  return [t,b];}
var E=P.map(edges);
x.strokeStyle='#c2391b';x.lineWidth=1.25;
[0,1].forEach(function(k){x.beginPath();
  for(var i=0;i<N;i++){var y=T+E[i][k]*CH;x.moveTo(cx(i)-1,y);x.lineTo(cx(i)+CW+1,y);
    if(i<N-1){var y2=T+E[i+1][k]*CH;x.moveTo(cx(i)+CW+1,y);x.lineTo(cx(i+1)-1,y2);}}
  x.stroke();});
// width of the swing, column by column, as a quiet bar row beneath
var B=T+R*CH+40;
for(var i=0;i<N;i++){var wv=E[i][1]-E[i][0];x.fillStyle='#c2391b';
  x.fillRect(cx(i)+CW/2-1,B,2,wv*5);}
// words
x.fillStyle='#2a2622';x.font='600 22px Georgia, "Times New Roman", serif';
x.fillText('Forty Widths',L,62);
x.fillStyle='#6d665c';x.font='italic 14px Georgia, "Times New Roman", serif';
x.fillText('A record too dense for its picture: each of the 40 columns holds many values, and only their reach survives.',L,86);
x.font='12px Georgia, serif';
x.fillText('grey: the 480 pixels of the file, as found      red: where each column turns dark',L,B+68);
x.fillText('below: how far each column swings',L+640,B+68);
