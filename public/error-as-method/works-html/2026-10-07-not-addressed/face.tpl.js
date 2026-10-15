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
