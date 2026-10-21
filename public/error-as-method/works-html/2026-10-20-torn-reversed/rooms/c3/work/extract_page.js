function extract(T){
const LEX={
bird:'swallow swallows house-martin house-martins martin martins sand-martin sand-martins swift swifts cuckoo cuckoos nightingale nightingales blackcap redstart wryneck whitethroat willow-wren grasshopper-lark sedge-bird fern-owl goatsucker owl owls rook rooks crow crows raven ravens jackdaw jackdaws starling starlings thrush thrushes missel-thrush fieldfare fieldfares redwing redwings blackbird blackbirds ring-ouzel ring-ouzels wood-lark sky-lark titlark linnet linnets chaffinch chaffinches bunting sparrow sparrows wren wrens redbreast redbreasts hedge-sparrow stone-curlew curlew curlews snipe snipes woodcock woodcocks heron herons hawk hawks kite buzzard kestrel partridge partridges pheasant pheasants quail quails landrail nuthatch woodpecker creeper wagtail wagtails stonechat whinchat wheatear wheatears fly-catcher flycatcher bullfinch bullfinches goldfinch crossbill crossbills grosbeak hoopoe pigeon pigeons ring-dove ring-doves wood-pigeons turtle turtles duck ducks teal geese swan swans gull gulls hen-harrier oedicnemus dabchick moor-hen lark larks bird birds',
beast:'tortoise bat bats hedgehog mole moles mouse mice field-mice harvest-mouse hare hares deer fox foxes viper vipers adder snake snakes lizard lizards frog frogs toad toads newt newts eft efts bear sheep cattle cow cows horse horses dog dogs cat hog hogs squirrel weasel otter badger fish',
insect:'cricket crickets field-cricket field-crickets mole-cricket mole-crickets bee bees wasp wasps gnat gnats fly flies glow-worm glow-worms butterfly butterflies moth moths beetle beetles chafer chafers cockchafer ant ants ephemera gossamer spider spiders worm worms earth-worm earth-worms snail snails slug slugs insect insects caterpillar caterpillars oestrus',
plant:'beech beeches oak oaks yew yews elm elms ash hazel wheat barley hops turnip turnips grass hay ivy fern truffle truffles cucumber cucumbers apple apples cherry hellebore violet violets primrose primroses blossom blossoms flower flowers leaf leaves corn harvest fruit seed seeds tree trees bud buds',
weather:'frost frosts snow snows rain rains thunder fog fogs mist mists wind winds ice thaw heat drought hail honey-dew storm tempest dew sunshine'
};
const KIND={};for(const k in LEX)for(const w of LEX[k].split(' '))KIND[w]=k;
const MN=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const CUM=[0,31,59,90,120,151,181,212,243,273,304,334];
const FEAST={'lady-day':84,'candlemas':33,'midsummer':175,'michaelmas':272,'christmas':359,'st. barnabas':161,'st. john':175,'st. lawrence':222,'st. swithin':196,'lammas':213};
let t=T.replace(/\r/g,'').replace(/^[A-Za-z ,]*?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? +\d{1,2}(?:st|nd|rd|th)?, +17\d\d\.\s*$/gm,'');
const stop=t.indexOf('Letter I\n');
t=t.slice(stop).replace(/\s+/g,' ');
// protect abbreviations
t=t.replace(/\b(Jan|Feb|Mar|Apr|Aug|Sept|Sep|Oct|Nov|Dec|St|Mr|Dr|viz|i\.e|p|vol|No|Esq)\./g,'$1․');
const sents=t.split(/(?<=[.!?;:])\s+/);
const Mre='(January|Jan․|February|Feb․|March|Mar․|April|Apr․|May|June|July|August|Aug․|September|Sept․|Sep․|October|Oct․|November|Nov․|December|Dec․)';
const reDay1=new RegExp(Mre+' (?:the )?(\\d{1,2})(?:st|nd|rd|th)?\\b','g');
const reDay2=new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)? (?:of )?'+Mre,'g');
const reMon=new RegExp('\\b(?:(beginning|first week|middle|end|latter end|last week|close|latter part|first days?) of )?'+Mre+'\\b','g');
const ORD={first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10,eleventh:11,twelfth:12,thirteenth:13,fourteenth:14,fifteenth:15,sixteenth:16,seventeenth:17,eighteenth:18,nineteenth:19,twentieth:20,'twenty-first':21,'twenty-second':22,'twenty-third':23,'twenty-fourth':24,'twenty-fifth':25,'twenty-sixth':26,'twenty-seventh':27,'twenty-eighth':28,'twenty-ninth':29,thirtieth:30,'thirty-first':31};
const OW='(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first|twenty-second|twenty-third|twenty-fourth|twenty-fifth|twenty-sixth|twenty-seventh|twenty-eighth|twenty-ninth|thirtieth|thirty-first)';
const reO1=new RegExp('\\b'+OW+' (?:of )?(?:last |this |next )?'+Mre,'gi');
const reO2=new RegExp(Mre+' (?:the )?'+OW+'\\b','g');
const out=[];
sents.forEach((s,si)=>{
  if(/^Letter [IVXL]+ To /.test(s)&&s.length<120) return;
  let days=[];const used=[];
  let m;
  reDay1.lastIndex=0;while(m=reDay1.exec(s)){const mi=MN.indexOf(m[1].slice(0,3).toLowerCase());const d=+m[2];if(d>=1&&d<=31){days.push(CUM[mi]+d-1);used.push([m.index,m.index+m[0].length]);}}
  reDay2.lastIndex=0;while(m=reDay2.exec(s)){const mi=MN.indexOf(m[2].slice(0,3).toLowerCase());const d=+m[1];if(d>=1&&d<=31){days.push(CUM[mi]+d-1);used.push([m.index,m.index+m[0].length]);}}
  reO1.lastIndex=0;while(m=reO1.exec(s)){const mi=MN.indexOf(m[2].slice(0,3).toLowerCase());days.push(CUM[mi]+ORD[m[1].toLowerCase()]-1);used.push([m.index,m.index+m[0].length]);}
  reO2.lastIndex=0;while(m=reO2.exec(s)){const mi=MN.indexOf(m[1].slice(0,3).toLowerCase());days.push(CUM[mi]+ORD[m[2].toLowerCase()]-1);used.push([m.index,m.index+m[0].length]);}
  reMon.lastIndex=0;while(m=reMon.exec(s)){
    if(used.some(u=>m.index<u[1]&&m.index+m[0].length>u[0]))continue;
    const name=m[2];
    if(name==='May'){const pre=s.slice(Math.max(0,m.index-12),m.index);const post=s.slice(m.index+3,m.index+12);
      if(!(m[1]||/\b(in|of|till|until|about|before|after|during|from|to|through|by|all|last|next|this|that|early|middle|end|first|whole|and)\s$/.test(pre)||/^\s?\d/.test(post)))continue;
      if(/^\s(be|have|not|also|perhaps|then|easily|well|probably|sometimes|possibly|suppose|see|observe|say|add|venture|now|it|he|we|you|I)\b/.test(post))continue;}
    if(name==='March'&&/^\s(of|on|in|to)\s(the\s)?[a-z]/.test(s.slice(m.index+5,m.index+16))&&!m[1]){}
    const mi=MN.indexOf(name.slice(0,3).toLowerCase());
    const q=m[1]||'';let d=15;if(/beginning|first/.test(q))d=5;else if(/end|last|close|latter/.test(q))d=26;
    days.push(CUM[mi]+d-1+(q?0:0.5));
  }
  for(const f in FEAST){const re=new RegExp('\\b'+f.replace('.', '․').replace(' ','\\s'),'i');if(re.test(s))days.push(FEAST[f]);}
  if(!days.length)return;
  // words
  const words=[];const re=/[A-Za-z][A-Za-z-]*[A-Za-z]/g;let w;
  while(w=re.exec(s)){const lw=w[0].toLowerCase();if(KIND[lw])words.push([lw,KIND[lw]]);}
  // header lines: skip letter salutation-only sentences with no words
  days=[...new Set(days.map(Math.round))];
  for(const d of days)out.push({d,si,words,s});
});
return out;
}

