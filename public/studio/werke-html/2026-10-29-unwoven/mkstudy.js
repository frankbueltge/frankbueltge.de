global.window={};require(process.cwd()+"/data.js");const D=window.UNWOVEN,N=D.names,T=D.threads;
const sudan=T.findIndex(t=>t.c==="SDN"&&t.d==="Sep 2025"&&t.v===2);
const H=[[62,62],[217,182],[473,2],[348,68],[sudan,63],[404,63],[294,24],[328,233],[277,4],[482,26],[620,3],[228,142],[679,3],[70,45],[737,55],[188,73],[226,109],[86,55]];
const VP=["current","first projection","second projection"];
const items=H.map(([k,i])=>{const x=T[k].a[i];if(x[8]!=="C")throw k;return {id:"h-"+T[k].c.toLowerCase(),label:[N[x[1]],N[x[0]]].filter(Boolean).join(", ")+" ("+T[k].c+", "+T[k].d+", "+VP[T[k].v]+")"}});
const st={"$contract":"study/1",id:"studio-unwoven-holes",title:"Write into the holes",
question:"Given only what the record writes around an unclassified area, its region and its own past, what phase do readers of this work write into it, how far do they agree, and would they have the record write anything there at all?",
purpose:"This work leaves blank the places the famine record left with people and no phase. You have just written a phase into some of them from what surrounds them. We want to see how the readers of this work fill such a blank, how far they agree, and whether they would have the record fill it at all.",
reading:"For each hole we report how many answer sets marked it, the median phase and the spread, set against the phase its classified neighbours give by the 20 % rule. We count the four choices of the second question. Findings speak only of the readers of this work and name the number of answer sets. A phase readers write is never shown as the IPC's, nor as a fact about the place or its people.",
questions:[{id:"phases",kind:"marks",prompt:"The phase you would write into each hole (1 to 5), or none",items,min:1,max:5,unit:"phase"},
{id:"should",kind:"choice",prompt:"When no one could reach a place, what should the record write?",options:["nothing, as it does now","an estimate, marked as one","the reason, in words","an estimate and the reason"]}],
closes:"2027-04-30"};
for(const f of ["purpose","question","reading"])console.log(f,st[f].length);
items.forEach(i=>console.log(i.id,i.label));
require("fs").writeFileSync("study.json",JSON.stringify(st,null,1)+"\n");
