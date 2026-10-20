// ============================================================
//  NÁSTROJE: Kontrola itemu · Plánovač buildu · Náklady · Komunitní statistiky
// ============================================================
(function(){
const X = window.DBX; if(!X) return;
const { D, img, POOLS, num } = X;
const UPG = window.UPGRADES;
const T = (cs,en) => tr(cs,en);
const uid = () => Math.random().toString(36).slice(2,9);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));

// ---------- sloty ----------
const SLOTS = [
  {k:'Weapon',  cz:'Zbraň',      eq:t=>t==='Weapon',          up:'Weapon'},
  {k:'Armor',   cz:'Zbroj',      eq:t=>/Armor$/.test(t),      up:'Armour'},
  {k:'Helmet',  cz:'Helma',      eq:t=>/Helmet$/.test(t),     up:'Helmet'},
  {k:'Shield',  cz:'Štít',       eq:t=>t==='Shield',          up:'Shield'},
  {k:'Shoes',   cz:'Boty',       eq:t=>t==='Shoes',           up:'Shoes'},
  {k:'Bracelet',cz:'Náramek',    eq:t=>t==='Bracelet',        up:'Bracelet / Earrings / Necklace'},
  {k:'Necklace',cz:'Náhrdelník', eq:t=>t==='Necklace',        up:'Bracelet / Earrings / Necklace'},
  {k:'Earrings',cz:'Náušnice',   eq:t=>t==='Earring',         up:'Bracelet / Earrings / Necklace'},
  {k:'Belt',    cz:'Opasek',     eq:t=>t==='Belt',            up:'Belt'},
  {k:'Sash',    cz:'Šerpa',      eq:t=>t==='Sash'},
  {k:'Amulet',  cz:'Amulet',     eq:t=>t==='Amulet'},
  {k:'Blessed / Fire / Ice Ring', cz:'Prsten', eq:t=>t==='Ring', up:'Blessed Ring'},
];
const slotName = s => LANG==='en' ? (s.k==='Blessed / Fire / Ice Ring'?'Ring':s.k) : s.cz;
const eqType = e => (e.t||'').split(' / ').pop();
const poolsFor = slotKey => POOLS.filter(p=>!p.pet && p.rows.some(r=>r.sl.includes(slotKey)));
const poolById = id => POOLS.find(p=>p.id===id);
const PET = POOLS.find(p=>p.pet);
const upFor = s => s.up && UPG ? UPG.ranks.find(r=>r.en===s.up) : null;
const PET_UP = UPG ? UPG.ranks.find(r=>r.en==='Pet Equipment') : null;
const unitOf = s => String(s).includes('%') ? '%' : '';
const fmtN = v => (Math.round(v*100)/100).toLocaleString(LOC);
// tier podle hodnoty: nejvyšší tier ≤ hodnota
function tierOf(row, v){
  const x=num(v); if(x==null) return null;
  const vals=row.t.map(num); let ti=-1;
  vals.forEach((t,i)=>{ if(t!=null && x>=t-1e-9) ti=i; });
  return {ti, tn:vals.length, over:x>vals[vals.length-1]+1e-9, pct: vals.length>1 ? clamp((x-vals[0])/((vals[vals.length-1]-vals[0])||1),0,1) : 1};
}

// ---------- ceny (yang) ----------
let PRICES = store.get('prices', {});
const parseYang = s => { const m=String(s).trim().toLowerCase().replace(/\s/g,'').replace(',', '.').match(/^([\d.]+)(k*)$/); if(!m) return null; return Math.round(parseFloat(m[1])*Math.pow(1000,m[2].length)); };
const fmtYang = v => { if(!v) return '0'; const a=Math.abs(v); if(a>=1e9) return fmtN(v/1e9)+' kkk'; if(a>=1e6) return fmtN(v/1e6)+' kk'; if(a>=1e3) return fmtN(v/1e3)+' k'; return fmtN(v); };

// ---------- buildy ----------
const emptyBuild = () => ({id:uid(), name:T('Můj build','My build'), spec:'', emb:['','','','','',''], slots:{}, pet:{rank:0,target:0,lines:[]}, extra:[]});
let BUILDS = store.get('builds', {});
let CUR = store.get('buildCur', null);
let SHARED = null;                                   // build otevřený ze sdíleného odkazu
const saveBuilds = () => { store.set('builds', BUILDS); store.set('buildCur', CUR); };
function curBuild(){
  if(SHARED) return SHARED;
  if(!CUR || !BUILDS[CUR]){ const b=emptyBuild(); BUILDS[b.id]=b; CUR=b.id; saveBuilds(); }
  return BUILDS[CUR];
}
const slotState = (b,k) => b.slots[k] ||= {item:'', pool:'', rank:0, target:0, lines:[]};
const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))));
function compact(b){ // menší odkaz: jen vyplněné sloty
  const slots={}; for(const [k,v] of Object.entries(b.slots)) if(v.item||v.pool||v.rank||v.lines.length) slots[k]=v;
  return {n:b.name, s:b.spec, e:b.emb, sl:slots, p:b.pet};
}
function expand(o){ const b=emptyBuild(); b.name=o.n||b.name; b.spec=o.s||''; b.emb=(o.e||[]).concat(['','','','','','']).slice(0,6); b.slots=o.sl||{}; b.pet=o.p||b.pet; return b; }

// ---------- součet statů buildu ----------
function totals(b){
  const t={};
  const add=(name,v,u)=>{ if(v==null) return; const k=name+'|'+u; (t[k] ||= {name,u,v:0,src:[]}).v+=v; };
  for(const s of SLOTS){ const st=b.slots[s.k]; if(!st) continue; const p=poolById(st.pool); if(!p) continue;
    st.lines.forEach(l=>{ const r=p.rows.find(x=>x.n===l.b); if(r && r.t[l.ti]!=null){ add(r.n, num(r.t[l.ti]), unitOf(r.t[l.ti])); t[r.n+'|'+unitOf(r.t[l.ti])].src.push(slotName(s)); } }); }
  (b.pet.lines||[]).forEach(l=>{ const r=PET.rows.find(x=>x.n===l.b); if(r && l.v!==''){ const u=unitOf(r.t[1]); add(r.n, num(l.v), u); t[r.n+'|'+u].src.push(T('Pet','Pet')); } });
  return Object.values(t).sort((a,b)=>a.name.localeCompare(b.name));
}

// =====================================================================
//  KOMUNITNÍ STATISTIKY
// =====================================================================
const statCache = {};
async function stats(pool){
  const c=statCache[pool]; if(c && Date.now()-c.t<60000) return c.d;
  try{ const r=await fetch('/api/stats?pool='+encodeURIComponent(pool)); if(!r.ok) throw 0; const d=await r.json(); statCache[pool]={t:Date.now(),d}; return d; }catch(e){ return null; }
}
const hist = (s,mark) => { const mx=Math.max(1,...s.c); return `<span class="hist" title="${s.c.map((c,i)=>`T${i+1}: ${c}`).join(' · ')}">${s.c.map((c,i)=>`<i class="${i===mark?'me':''}" style="height:${Math.max(8,c/mx*100)}%"></i>`).join('')}</span>`; };
window.fillCommunity = async function(main, pool){
  if(!pool || pool.pet) return;
  const d = await stats(pool.id); if(!d) return;
  main.querySelectorAll('[data-cst]').forEach(td=>{ const s=d[td.dataset.cst]; td.innerHTML = s&&s.n ? `${hist(s)}<small>${s.n}×</small>` : '<small class="mut">–</small>'; });
};
async function sendStats(pool, slot, rows){
  const r=await fetch('/api/roll',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pool,slot,rows})});
  const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.error||r.statusText); delete statCache[pool]; return j;
}

// =====================================================================
//  KONTROLA ITEMU
// =====================================================================
const CK = store.get('checker', {pool:'Divine', slot:'Weapon', rows:Array.from({length:7},()=>({b:'',v:''}))});
const ckOcr = {msg:'', img:''};
const ckSent = new Set(store.get('ckSent', []));
function ckPool(){ return poolById(CK.pool) || POOLS.find(p=>!p.pet); }
function ckRows(p){ return p.pet ? p.rows : p.rows.filter(r=>!CK.slot || r.sl.includes(CK.slot)); }
async function ckOCR(file, rerender){
  const p=ckPool(), url=URL.createObjectURL(file);
  ckOcr.img=url; ckOcr.msg=T('Čtu text ze screenshotu…','Reading the screenshot…'); rerender();
  try{
    await loadTess();
    const w = await Tesseract.createWorker('eng',1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',langPath:'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int'});
    let text=''; for(const thr of [140,200]){ const cv=await prepImage(url,thr); const {data}=await w.recognize(cv); text+=data.text+'\n'; }
    await w.terminate();
    const bon = ckRows(p).map(r=>({name:r.n, min:num(r.t[0]), max:num(r.t[r.t.length-1]), unit:unitOf(r.t[r.t.length-1])}));
    const {found} = parseLines(text, bon);
    if(!found.length){ ckOcr.msg=T('Nenašel jsem žádný bonus z tohohle zdroje. Zkontroluj, že máš vybraný správný zdroj a slot, nebo vyplň řádky ručně.','No bonus from this source found. Check the source and slot, or fill the rows by hand.'); return rerender(); }
    CK.rows = Array.from({length:7},(_,i)=>found[i]||{b:'',v:''}); store.set('checker',CK);
    ckOcr.msg = T(`Našel jsem ${found.length} řádků. Zkontroluj prosím čísla.`,`Found ${found.length} lines. Please check the numbers.`); rerender();
  }catch(e){ ckOcr.msg = e.message || T('Čtení se nepovedlo.','Reading failed.'); rerender(); }
}
function checkerView(){
  const main=$('#main'); main.className='tool';
  const p=ckPool(), rows=ckRows(p);
  const slots = p.pet ? [] : [...new Set(p.rows.flatMap(r=>r.sl))].sort();
  if(!p.pet && CK.slot && !slots.includes(CK.slot)) CK.slot='';
  const byName=Object.fromEntries(p.rows.map(r=>[r.n,r]));
  let sum=0, filled=0, maxed=0;
  const res = CK.rows.map((l,i)=>{
    const r=byName[l.b]; let out='', tier=null;
    if(r && l.v!==''){ tier = p.pet ? {ti:null,tn:null,pct:clamp((num(l.v)-num(r.t[0]))/((num(r.t[1])-num(r.t[0]))||1),0,1),over:num(l.v)>num(r.t[1])} : tierOf(r,l.v);
      if(tier){ filled++; sum+=tier.pct; if(tier.pct>=.999) maxed++; } }
    const col = !tier ? '' : tier.over ? 'var(--bad)' : tier.pct>=.999 ? 'var(--gold2)' : tier.pct>=.8 ? 'var(--good)' : tier.pct>=.5 ? 'var(--mid)' : 'var(--bad)';
    if(tier) out = `<span class="tbadge" style="--c:${col}">${tier.over?'> max?':tier.ti!=null?`T${tier.ti+1}/${tier.tn}`:Math.round(tier.pct*100)+' %'}</span><span class="tbar"><i style="width:${tier.pct*100}%;background:${col}"></i></span><span class="cpc" data-ckb="${esc(l.b)}" data-ckt="${tier.ti??''}"></span>`;
    return `<div class="ckrow"><span class="cn">${i+1}.</span>
      <select class="cksel" data-i="${i}"><option value="">${T('vyber bonus…','pick a bonus…')}</option>${rows.map(x=>`<option ${x.n===l.b?'selected':''} value="${esc(x.n)}">${esc(x.n)}</option>`).join('')}</select>
      <input class="ckval" data-i="${i}" inputmode="decimal" placeholder="${r?esc(r.t[0])+' – '+esc(r.t[r.t.length-1]):T('hodnota','value')}" value="${esc(l.v)}">
      <div class="ckres">${out}</div>${r?`<div class="cktiers">${r.t.map((t,j)=>`<span class="${tier&&tier.ti===j?'on':''}">${esc(t)}</span>`).join('')}</div>`:''}</div>`;
  }).join('');
  const score = filled ? Math.round(sum/filled*100) : 0;
  const verdict = !filled ? T('Vyber zdroj a slot, vlož screenshot nebo vyplň řádky.','Pick source and slot, paste a screenshot or fill the rows.')
    : score>=85 ? T('Skoro maxnutý item. Nech si ho, tohle se netočí.','Almost maxed. Keep it.')
    : score>=65 ? T('Dobrý item. Přetáčej jen nejslabší řádky.','Good item. Only reroll the weakest lines.')
    : score>=40 ? T('Průměr. Pokud máš orby, točil bych dál.','Average. If you have orbs, keep rolling.')
    : T('Slabé rolly. Točit dál.','Weak rolls. Reroll.');
  const key = CK.pool+'|'+CK.slot+'|'+CK.rows.map(l=>l.b+':'+l.v).join(',');
  main.innerHTML = `<div class="em-top"><h1>${T('Kontrola itemu','Item check')}</h1><span class="tsub">${T('Vlož screenshot itemu a uvidíš tier každého řádku a jestli se vyplatí točit dál.','Paste an item screenshot to see each line\'s tier and whether to keep rolling.')}</span></div>
    <div class="tl">${T('Čím je to točené','Rolled with')}</div>
    <div class="tchips">${POOLS.filter(x=>!/^Mount/.test(x.id)).map(x=>`<button class="gchip ${x===p?'on':''}" data-ckp="${esc(x.id)}">${img(x.pi,'gi')}${esc(x.n)}</button>`).join('')}</div>
    ${slots.length?`<div class="tl">${T('Slot','Slot')}</div><div class="tchips">${slots.map(s=>`<button class="gchip ${s===CK.slot?'on':''}" data-cks="${esc(s)}">${esc(s)}</button>`).join('')}</div>`:''}
    <div class="ckgrid">
      <div>
        <div class="ocr" id="ckocr" tabindex="0"><div class="ocrtxt"><p>${T('<b>Vlož screenshot</b> přes Ctrl+V, přetáhni ho sem, nebo','<b>Paste a screenshot</b> with Ctrl+V, drop it here, or')} <label class="lnk2">${T('vyber soubor','choose a file')}<input type="file" id="ckfile" accept="image/*" hidden></label>.</p>
          <p class="smut">${T('Stačí výřez tooltipu s bonusy.','A crop of the tooltip is enough.')}</p></div><div class="ocrstat">${ckOcr.msg||''}</div>${ckOcr.img?`<img class="ocrimg" src="${ckOcr.img}" alt="">`:''}</div>
        <div class="ckrows">${res}</div>
      </div>
      <aside class="card ckside">
        <div class="snum ${score>=65?'top':score>=40?'ok':'bad'}">${filled?score:'–'}<small>/100</small></div>
        <p class="sverd">${verdict}</p>
        ${filled?`<p class="smut">${T(`${maxed} z ${filled} řádků je na maximu. Skóre = jak blízko maxu jsou rolly v průměru.`,`${maxed} of ${filled} lines are maxed. Score = how close the rolls are to max on average.`)}</p>`:''}
        <div class="ckact">
          ${!p.pet&&filled?`<button class="tbtn" id="cksend" ${ckSent.has(key)?'disabled':''}>${ckSent.has(key)?T('✓ Posláno do statistik','✓ Sent'):T('📊 Přispět do statistik','📊 Contribute to stats')}</button>`:''}
          ${filled?`<button class="tbtn ghost" id="cktob">${T('➕ Vložit do buildu','➕ Add to build')}</button>`:''}
          <button class="lnk2" id="ckclr">${T('Vymazat','Clear')}</button>
        </div>
        ${!p.pet?`<p class="smut" style="margin-top:12px">${T('Statistiky jsou anonymní – posílá se jen zdroj, slot, bonus a tier. Díky nim ostatní uvidí, jak vzácné rolly jsou.','Stats are anonymous – only source, slot, bonus and tier are sent.')}</p>`:''}
      </aside>
    </div>`;
  const re=()=>{ const sc=main.scrollTop; checkerView(); main.scrollTop=sc; };
  main.querySelectorAll('[data-ckp]').forEach(b=>b.onclick=()=>{ CK.pool=b.dataset.ckp; CK.rows=CK.rows.map(()=>({b:'',v:''})); store.set('checker',CK); re(); });
  main.querySelectorAll('[data-cks]').forEach(b=>b.onclick=()=>{ CK.slot=b.dataset.cks; store.set('checker',CK); re(); });
  main.querySelectorAll('.cksel').forEach(s=>s.onchange=()=>{ CK.rows[+s.dataset.i]={b:s.value,v:''}; store.set('checker',CK); re(); });
  main.querySelectorAll('.ckval').forEach(inp=>{ inp.onchange=()=>{ CK.rows[+inp.dataset.i].v=inp.value.trim(); store.set('checker',CK); re(); }; inp.onkeydown=e=>{ if(e.key==='Enter') inp.blur(); }; });
  $('#ckclr').onclick=()=>{ CK.rows=CK.rows.map(()=>({b:'',v:''})); ckOcr.img=''; ckOcr.msg=''; store.set('checker',CK); re(); };
  const z=$('#ckocr'), take=f=>{ if(f&&f.type.startsWith('image/')) ckOCR(f,re); };
  $('#ckfile').onchange=e=>take(e.target.files[0]);
  z.ondragover=e=>{e.preventDefault();z.classList.add('over')}; z.ondragleave=()=>z.classList.remove('over');
  z.ondrop=e=>{e.preventDefault();z.classList.remove('over');take(e.dataTransfer.files[0])};
  document.onpaste = e => { if(state.cat!=='tool-check') return; const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/')); if(it){e.preventDefault();take(it.getAsFile());} };
  const sb=$('#cksend'); if(sb) sb.onclick=async()=>{
    const rowsOut = CK.rows.map(l=>{ const r=byName[l.b]; const t=r&&l.v!==''?tierOf(r,l.v):null; return t&&t.ti>=0&&!t.over?{b:l.b,ti:t.ti,tn:t.tn}:null; }).filter(Boolean);
    sb.disabled=true; sb.textContent='…';
    try{ await sendStats(p.id, CK.slot||null, rowsOut); ckSent.add(key); store.set('ckSent',[...ckSent].slice(-200)); re(); }
    catch(e){ sb.disabled=false; sb.textContent=e.message; }
  };
  const tb=$('#cktob'); if(tb) tb.onclick=()=>{
    const b = SHARED ? null : curBuild(); if(!b) return;
    if(p.pet){ b.pet.lines = CK.rows.filter(l=>l.b&&l.v!=='').map(l=>({b:l.b,v:l.v})); }
    else { const s=SLOTS.find(x=>x.k===CK.slot); if(!s){ tb.textContent=T('Nejdřív vyber slot','Pick a slot first'); return; }
      const st=slotState(b,s.k); st.pool=p.id; st.lines=CK.rows.map(l=>{ const r=byName[l.b]; const t=r&&l.v!==''?tierOf(r,l.v):null; return t&&t.ti>=0?{b:l.b,ti:t.ti}:null; }).filter(Boolean); }
    saveBuilds(); tb.textContent=T(`✓ Vloženo do „${b.name}“`,`✓ Added to “${b.name}”`); tb.disabled=true;
  };
  // komunitní percentil u řádků
  if(!p.pet) stats(p.id).then(d=>{ if(!d) return; main.querySelectorAll('[data-ckb]').forEach(el=>{ const s=d[el.dataset.ckb], ti=el.dataset.ckt; if(!s||!s.n||ti==='') return; const better=s.c.slice(+ti+1).reduce((a,b)=>a+b,0); el.innerHTML=`${hist(s,+ti)}<small>${T(`lepší než ${Math.round((s.n-better-s.c[+ti]/2)/s.n*100)} %`,`beats ${Math.round((s.n-better-s.c[+ti]/2)/s.n*100)}%`)} · ${s.n}×</small>`; }); });
}

// =====================================================================
//  PLÁNOVAČ BUILDU
// =====================================================================
let BTAB = store.get('btab','build');
function emblemOptions(spec, sel){
  const groups={};
  D.emblems.forEach(e=>{ const forSpec = e.sp&&e.sp.length; if(forSpec && (!spec || !e.sp.includes(spec))) return; const g = forSpec ? T('Emblemy classy','Class emblems')+(e.set!=null&&D.emblemSets[e.set]?' · '+D.emblemSets[e.set]:'') : e.t; (groups[g] ||= []).push(e); });
  return `<option value="">${T('— prázdné —','— empty —')}</option>`+Object.entries(groups).map(([g,l])=>`<optgroup label="${esc(g)}">${l.map(e=>`<option value="${esc(e.id)}" ${e.id===sel?'selected':''}>${esc(e.n)}</option>`).join('')}</optgroup>`).join('');
}
function slotCard(b, s){
  const st=slotState(b,s.k), pools=poolsFor(s.k), p=poolById(st.pool);
  const items=D.equip.filter(e=>s.eq(eqType(e)));
  const it=items.find(e=>e.id===st.item);
  const rows = p ? p.rows.filter(r=>r.sl.includes(s.k)) : [];
  const up=upFor(s), maxR=UPG?UPG.maxRank:11;
  return `<div class="bcard" data-slot="${esc(s.k)}">
    <div class="bch">${it?img(it.i,'bimg'):`<span class="bimg ph">${esc(slotName(s).slice(0,2))}</span>`}<div class="bct"><b>${esc(slotName(s))}</b>
      <select class="bsel" data-f="item"><option value="">${T('— item —','— item —')}</option>${items.map(e=>`<option value="${esc(e.id)}" ${e.id===st.item?'selected':''}>${esc(e.n)}</option>`).join('')}</select></div>
      ${up?`<label class="brank" title="${esc(up.item)}">R<input type="number" min="0" max="${maxR}" data-f="rank" value="${st.rank||0}"></label>`:''}</div>
    <select class="bsel full" data-f="pool"><option value="">${T('— čím točené —','— rolled with —')}</option>${pools.map(x=>`<option value="${esc(x.id)}" ${x.id===st.pool?'selected':''}>${esc(x.n)}</option>`).join('')}</select>
    ${p?`<div class="blines">${st.lines.map((l,i)=>{ const r=rows.find(x=>x.n===l.b); return `<div class="bline"><select data-l="${i}" data-f="lb"><option value="">—</option>${rows.map(x=>`<option ${x.n===l.b?'selected':''}>${esc(x.n)}</option>`).join('')}</select>
        <select data-l="${i}" data-f="lt" class="tsel">${r?r.t.map((t,j)=>`<option value="${j}" ${j===l.ti?'selected':''}>T${j+1} · ${esc(t)}</option>`).join(''):''}</select><button class="bx" data-l="${i}" data-f="ldel">×</button></div>`; }).join('')}
      ${st.lines.length<7?`<button class="badd" data-f="ladd">+ ${T('řádek','line')}</button>`:''}</div>`:''}
  </div>`;
}
function petCard(b){
  const st=b.pet, maxR=UPG?UPG.maxRank:11;
  return `<div class="bcard pet" data-slot="__pet"><div class="bch"><span class="bimg ph">🐾</span><div class="bct"><b>${T('Pet artefakt','Pet artifact')}</b><span class="smut">${T('hodnoty rollů','roll values')}</span></div>
    ${PET_UP?`<label class="brank" title="${esc(PET_UP.item)}">R<input type="number" min="0" max="${maxR}" data-f="rank" value="${st.rank||0}"></label>`:''}</div>
    <div class="blines">${st.lines.map((l,i)=>{ const r=PET.rows.find(x=>x.n===l.b); return `<div class="bline"><select data-l="${i}" data-f="lb"><option value="">—</option>${PET.rows.map(x=>`<option ${x.n===l.b?'selected':''}>${esc(x.n)}</option>`).join('')}</select>
      <input data-l="${i}" data-f="lv" class="tsel" inputmode="decimal" value="${esc(l.v??'')}" placeholder="${r?esc(r.t[0]+' – '+r.t[1]):''}"><button class="bx" data-l="${i}" data-f="ldel">×</button></div>`; }).join('')}
      ${st.lines.length<7?`<button class="badd" data-f="ladd">+ ${T('řádek','line')}</button>`:''}</div></div>`;
}
function costView(b){
  const rowsH=[]; let total=0, missing=0;
  const line=(key,label,qty,note)=>{ const pr=PRICES[key]; const sum=pr!=null?pr*qty:null; if(sum!=null) total+=sum; else if(qty) missing++;
    rowsH.push(`<tr><td>${label}${note?`<div class="smut">${note}</div>`:''}</td><td class="num">${fmtN(qty)}×</td><td><input class="price" data-price="${esc(key)}" value="${pr!=null?fmtYang(pr):''}" placeholder="${T('cena/ks','price/pc')}"></td><td class="num ${sum!=null?'gold':''}">${sum!=null?fmtYang(sum):'–'}</td></tr>`); };
  const per = s => (store.get('perRank',{})[s]??1);
  SLOTS.forEach(s=>{ const st=b.slots[s.k], up=upFor(s); if(!st||!up) return; const tgt=st.target||0, cur=st.rank||0; if(tgt<=cur) return;
    line(up.item, `${esc(up.item)} <span class="smut">· ${esc(slotName(s))} R${cur}→R${tgt}</span>`, (tgt-cur)*per(up.item), ''); });
  if(PET_UP && b.pet.target>(b.pet.rank||0)) line(PET_UP.item, `${esc(PET_UP.item)} <span class="smut">· Pet R${b.pet.rank||0}→R${b.pet.target}</span>`, (b.pet.target-(b.pet.rank||0))*per(PET_UP.item), '');
  b.extra.forEach((x,i)=>{ if(x.n) line(x.n, `${esc(x.n)} <button class="bx" data-xdel="${i}">×</button>`, Number(x.q)||0, ''); });
  const slotTargets = SLOTS.filter(s=>upFor(s)).map(s=>{ const st=slotState(b,s.k); return `<label class="tg"><span>${esc(slotName(s))}</span><b>R${st.rank||0}</b>→<input type="number" min="0" max="${UPG.maxRank}" data-tg="${esc(s.k)}" value="${st.target||0}"></label>`; }).join('')
    + (PET_UP?`<label class="tg"><span>${T('Pet','Pet')}</span><b>R${b.pet.rank||0}</b>→<input type="number" min="0" max="${UPG.maxRank}" data-tg="__pet" value="${b.pet.target||0}"></label>`:'');
  const upItems=[...new Set(UPG.ranks.map(r=>r.item))];
  return `<div class="cgrid">
    <div>
      <h3 class="sh">${T('Cílové ranky','Target ranks')}</h3><div class="tgs">${slotTargets}</div>
      <h3 class="sh">${T('Další nákupy','Other purchases')}</h3>
      <div class="xadd"><input list="itemlist" id="xn" placeholder="${T('item, např. Divine Orb','item, e.g. Divine Orb')}"><input id="xq" type="number" min="1" value="10"><button class="tbtn" id="xok">${T('Přidat','Add')}</button></div>
      <datalist id="itemlist">${[...new Set(D.items.map(i=>i.n))].map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
      <h3 class="sh">${T('Kolik kusů na 1 rank','Pieces per rank')}</h3><p class="smut">${T('Nastav podle toho, kolik upgrade itemů reálně stojí jeden rank (výchozí 1).','Set how many upgrade items one rank really takes (default 1).')}</p>
      <div class="tgs">${upItems.map(n=>`<label class="tg"><span>${esc(n)}</span><input type="number" min="1" data-per="${esc(n)}" value="${store.get('perRank',{})[n]??1}"></label>`).join('')}</div>
    </div>
    <div class="card">
      <h3 class="sh" style="margin-top:0">${T('Nákupní seznam','Shopping list')}</h3>
      ${rowsH.length?`<table class="ptab ctab"><thead><tr><th>Item</th><th class="r">${T('Ks','Qty')}</th><th>${T('Cena/ks','Price/pc')}</th><th class="r">${T('Celkem','Total')}</th></tr></thead><tbody>${rowsH.join('')}</tbody></table>
      <div class="ctotal"><span>${T('Celkem','Total')}</span><b>${fmtYang(total)} Yang</b></div>${missing?`<p class="smut">${T(`U ${missing} položek chybí cena – doplň ji a spočítá se to.`,`${missing} items have no price yet.`)}</p>`:''}`
      :`<p class="smut">${T('Nastav cílové ranky vlevo nebo přidej nákup (třeba Divine Orby) a tady uvidíš, kolik tě to vyjde.','Set target ranks or add purchases to see the total cost.')}</p>`}
      <p class="smut">${T('Ceny piš jako 1500000, 1.5kk nebo 300k. Ukládají se a platí pro všechny buildy.','Enter prices like 1500000, 1.5kk or 300k. They are saved for all builds.')}</p>
    </div></div>`;
}
function buildView(){
  const main=$('#main'); main.className='tool';
  const b=curBuild(), tot=totals(b);
  const specs=Object.entries(X.SPECS);
  const emb = b.emb.map((id,i)=>{ const e=D.emblems.find(x=>x.id===id); return `<div class="emslot ${e?'on':''}">${e?img(e.i,'eimg'):`<span class="eimg ph">${i+1}</span>`}<select data-emb="${i}">${emblemOptions(b.spec,id)}</select></div>`; }).join('');
  const myList = Object.values(BUILDS);
  main.innerHTML = `<div class="em-top"><h1>${T('Plánovač buildu','Build planner')}</h1>
      <div class="btabs"><button class="btab ${BTAB==='build'?'on':''}" data-bt="build">${T('Build','Build')}</button><button class="btab ${BTAB==='cost'?'on':''}" data-bt="cost">${T('Náklady','Costs')}</button></div></div>
    ${SHARED?`<div class="shared">🔗 ${T('Prohlížíš sdílený build','You are viewing a shared build')} <b>${esc(b.name)}</b><button class="tbtn" id="bkeep">${T('Uložit k sobě','Save to my builds')}</button><button class="lnk2" id="bclose">${T('Zavřít','Close')}</button></div>`
    :`<div class="bbar"><input id="bname" value="${esc(b.name)}" maxlength="60"><select id="bpick">${myList.map(x=>`<option value="${x.id}" ${x.id===b.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>
      <button class="tbtn ghost" id="bnew">${T('+ Nový','+ New')}</button><button class="tbtn ghost" id="bdup">${T('Duplikovat','Duplicate')}</button><button class="tbtn" id="bshare">🔗 ${T('Sdílet odkaz','Share link')}</button><button class="lnk2" id="bdel">${T('Smazat','Delete')}</button></div>`}
    ${BTAB==='cost' ? costView(b) : `<div class="bgrid">
      <div>
        <div class="tl">${T('Classa','Class')}</div>
        <select id="bspec" class="bsel full" style="max-width:320px"><option value="">${T('— vyber classu —','— pick a class —')}</option>${specs.map(([k,v])=>`<option value="${esc(k)}" ${k===b.spec?'selected':''}>${esc(v)}</option>`).join('')}</select>
        <div class="tl">${T('Emblemy','Emblems')}</div><div class="emgrid">${emb}</div>
        <div class="tl">${T('Vybavení','Equipment')}</div><div class="bcards">${SLOTS.map(s=>slotCard(b,s)).join('')}${petCard(b)}</div>
      </div>
      <aside class="card bsum"><h3 class="sh" style="margin-top:0">${T('Celkové bonusy','Total bonuses')}</h3>
        ${tot.length?`<table class="ptab"><tbody>${tot.map(t=>`<tr title="${esc(t.src.join(', '))}"><td>${esc(t.name)}</td><td class="r pm" style="font-size:14px">${fmtN(t.v)}${t.u}</td></tr>`).join('')}</tbody></table>`:`<p class="smut">${T('Vyber u slotů, čím jsou točené, a přidej řádky bonusů. Tady se sečtou.','Pick how slots are rolled and add bonus lines. They add up here.')}</p>`}
        <p class="smut">${T('Součet řádků bonusů (bez základních statů itemů a bez vlivu ranků).','Sum of bonus lines (without base item stats or rank effects).')}</p>
      </aside></div>`}`;
  const re=()=>{ const sc=main.scrollTop; buildView(); main.scrollTop=sc; };
  const persist=()=>{ if(!SHARED) saveBuilds(); };
  main.querySelectorAll('[data-bt]').forEach(x=>x.onclick=()=>{ BTAB=x.dataset.bt; store.set('btab',BTAB); re(); });
  if(SHARED){
    $('#bkeep').onclick=()=>{ const nb={...SHARED,id:uid()}; BUILDS[nb.id]=nb; CUR=nb.id; SHARED=null; saveBuilds(); re(); };
    $('#bclose').onclick=()=>{ SHARED=null; re(); };
  } else {
    $('#bname').onchange=e=>{ b.name=e.target.value.trim()||b.name; persist(); re(); };
    $('#bpick').onchange=e=>{ CUR=e.target.value; persist(); re(); };
    $('#bnew').onclick=()=>{ const nb=emptyBuild(); nb.name=T('Build ','Build ')+(Object.keys(BUILDS).length+1); BUILDS[nb.id]=nb; CUR=nb.id; persist(); re(); };
    $('#bdup').onclick=()=>{ const nb=JSON.parse(JSON.stringify(b)); nb.id=uid(); nb.name=b.name+T(' (kopie)',' (copy)'); BUILDS[nb.id]=nb; CUR=nb.id; persist(); re(); };
    $('#bdel').onclick=()=>{ if(!confirm(T(`Smazat build „${b.name}“?`,`Delete build “${b.name}”?`))) return; delete BUILDS[b.id]; CUR=Object.keys(BUILDS)[0]||null; persist(); re(); };
    $('#bshare').onclick=()=>{ const url=location.origin+location.pathname+'#build='+enc(compact(b)); navigator.clipboard?.writeText(url); $('#bshare').textContent=T('✓ Odkaz zkopírován','✓ Link copied'); setTimeout(()=>{const x=$('#bshare'); if(x) x.textContent='🔗 '+T('Sdílet odkaz','Share link');},1800); };
  }
  if(BTAB==='cost'){
    main.querySelectorAll('[data-tg]').forEach(inp=>inp.onchange=()=>{ const v=clamp(parseInt(inp.value)||0,0,UPG.maxRank); if(inp.dataset.tg==='__pet') b.pet.target=v; else slotState(b,inp.dataset.tg).target=v; persist(); re(); });
    main.querySelectorAll('[data-per]').forEach(inp=>inp.onchange=()=>{ const m=store.get('perRank',{}); m[inp.dataset.per]=Math.max(1,parseInt(inp.value)||1); store.set('perRank',m); re(); });
    main.querySelectorAll('[data-price]').forEach(inp=>inp.onchange=()=>{ const v=parseYang(inp.value); if(inp.value.trim()==='') delete PRICES[inp.dataset.price]; else if(v!=null) PRICES[inp.dataset.price]=v; store.set('prices',PRICES); re(); });
    main.querySelectorAll('[data-xdel]').forEach(x=>x.onclick=()=>{ b.extra.splice(+x.dataset.xdel,1); persist(); re(); });
    $('#xok').onclick=()=>{ const n=$('#xn').value.trim(), q=Math.max(1,parseInt($('#xq').value)||1); if(!n) return; const ex=b.extra.find(x=>x.n===n); if(ex) ex.q=(Number(ex.q)||0)+q; else b.extra.push({n,q}); persist(); re(); };
    return;
  }
  $('#bspec').onchange=e=>{ b.spec=e.target.value; persist(); re(); };
  main.querySelectorAll('[data-emb]').forEach(s=>s.onchange=()=>{ b.emb[+s.dataset.emb]=s.value; persist(); re(); });
  main.querySelectorAll('.bcard').forEach(card=>{
    const k=card.dataset.slot, st = k==='__pet' ? b.pet : slotState(b,k);
    card.querySelectorAll('[data-f]').forEach(el=>{
      const f=el.dataset.f, i=+el.dataset.l;
      const ev = el.tagName==='BUTTON' ? 'onclick' : 'onchange';
      el[ev]=()=>{
        if(f==='item') st.item=el.value;
        if(f==='pool'){ st.pool=el.value; st.lines=[]; }
        if(f==='rank') st.rank=clamp(parseInt(el.value)||0,0,UPG?UPG.maxRank:11);
        if(f==='ladd') st.lines.push(k==='__pet'?{b:'',v:''}:{b:'',ti:0});
        if(f==='ldel') st.lines.splice(i,1);
        if(f==='lb'){ st.lines[i].b=el.value; if(k!=='__pet'){ const r=poolById(st.pool)?.rows.find(x=>x.n===el.value); st.lines[i].ti=r?r.t.length-1:0; } else st.lines[i].v=''; }
        if(f==='lt') st.lines[i].ti=+el.value;
        if(f==='lv') st.lines[i].v=el.value.trim();
        persist(); re();
      };
    });
  });
}

// ---------- napojení na navigaci ----------
window.TOOLNAV = [
  {id:'tool-check', label:T('Kontrola itemu','Item check')},
  {id:'tool-build', label:T('Plánovač buildu','Build planner')},
];
window.renderTool = id => id==='tool-build' ? buildView() : checkerView();

// sdílený build z odkazu
if(location.hash.startsWith('#build=')){
  try{ SHARED=expand(dec(location.hash.slice(7))); state.cat='tool-build'; BTAB='build'; }catch(e){}
  history.replaceState(null,'',location.pathname+location.search);
}
})();
