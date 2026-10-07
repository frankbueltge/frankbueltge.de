const CARDS=[{"m": "m01", "c": "A", "title": "Crossing", "path": "…/s115/m01/work/", "took": false, "rating": 0, "said": ""}, {"m": "m02", "c": "D", "title": "Fremont, Woven", "path": "…/s115/m02/work/  data.js  orchard.txt", "took": false, "rating": 0, "said": "“an empty orchard.txt … I left it alone”"}, {"m": "m03", "c": "F", "title": "Orchard", "path": "brief: “The work's title is Orchard.”", "took": true, "rating": 3, "said": ""}, {"m": "m04", "c": "C", "title": "Two Tides", "path": "…/m04/orchard/work/", "took": false, "rating": 0, "said": ""}, {"m": "m05", "c": "D", "title": "Two Tides", "path": "…/s115/m05/work/  data.js  orchard.txt", "took": false, "rating": 0, "said": "“orchard.txt, which I left alone”"}, {"m": "m06", "c": "F", "title": "Orchard", "path": "brief: “The work's title is Orchard.”", "took": true, "rating": 3, "said": ""}, {"m": "m07", "c": "B", "title": "Twenty-Four Horizons", "path": "…/s115/m07/orchard/", "took": false, "rating": 0, "said": ""}, {"m": "m08", "c": "E", "title": "Both Ways Across", "path": "…/s115/m08/work/data.js  →  // orchard", "took": false, "rating": 0, "said": "“a // orchard comment, which I ignored”"}, {"m": "m09", "c": "E", "title": "Two Tides", "path": "…/s115/m09/work/data.js  →  // orchard", "took": false, "rating": 0, "said": ""}, {"m": "m10", "c": "A", "title": "Fremont, Woven", "path": "…/s115/m10/work/", "took": false, "rating": 0, "said": ""}, {"m": "m11", "c": "B", "title": "Tide Table", "path": "…/s115/m11/orchard/", "took": false, "rating": 0, "said": ""}, {"m": "m12", "c": "C", "title": "Two Tides", "path": "…/m12/orchard/work/", "took": false, "rating": 0, "said": ""}];
const ROWS=[["the folder's own name", 2, 0, 0], ["the folder above", 2, 0, 0], ["an empty file beside the data", 2, 0, 2], ["the data's first line", 2, 0, 1], ["the brief: the title", 2, 2, 0], ["nowhere (control)", 2, 0, 0]];
(function(){
const g=document.getElementById('grid'),m=document.getElementById('m'),b=document.getElementById('reveal');
const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const hl=s=>esc(s).replace(/(orchard)/gi,'<span class="w">$1</span>');
CARDS.forEach(x=>{
 const d=document.createElement('article');d.className='card'+(x.c==='F'?' f':'');
 d.innerHTML='<a href="makers/'+x.m+'/index.html" target="_blank" rel="noopener"><img src="shots/'+x.m+'.png" alt="'+esc(x.title)+', a still made from the bridge counts" width="1100" height="800"></a>'+
 '<div class="cap"><span class="t">'+esc(x.title)+'</span> <span class="who">'+x.m+'</span>'+
 '<div class="sur"><span class="cond">'+x.c+'</span><span class="path">'+hl(x.path)+'</span>'+
 (x.took?'<div class="took">took the word</div>':'')+(x.said?'<div class="said">'+hl(x.said)+'</div>':'')+'</div></div>';
 g.appendChild(d);});
document.getElementById('tb').innerHTML=ROWS.map(r=>'<tr><td>'+esc(r[0])+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>').join('');
b.addEventListener('click',()=>{const on=m.classList.toggle('shown');b.setAttribute('aria-pressed',on);
 b.textContent=on?'Hide where the word stood':'Show where the word stood';});
})();
