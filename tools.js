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
  for(const s of SLOTS){ const st=b.slots[s.k]; if(!st) continue; const p=poolById(st.pool); if(!p && !st.lines.some(l=>l.p)) continue;
    st.lines.forEach(l=>{ const lp=poolById(l.p)||p; if(!lp) return; const r=lp.rows.find(x=>x.n===l.b); if(r && r.t[l.ti]!=null){ add(r.n, num(r.t[l.ti]), unitOf(r.t[l.ti])); t[r.n+'|'+unitOf(r.t[l.ti])].src.push(slotName(s)); } }); }
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
// Pořadí, ve kterém se hádá zdroj řádku (běžné dřív než vzácné)
const AUTO_ORDER = ['Normal','Divine','6/7','Divine 6/7','Godly','Exalted','Exalted + Divine','Exalted 6/7','Exalted + Divine 6/7','Magic Word'];
const CK = Object.assign({mode:'auto', slot:'Weapon', rows:[], item:''}, store.get('checker3', {}));
CK.rows = (CK.rows||[]).filter(l=>l && l.b);
const saveCK = () => store.set('checker3', CK);
const ckOcr = {msg:'', img:'', busy:false};
let ckEdit = null;                                   // index řádku, který se právě upravuje
const ckSent = new Set(store.get('ckSent', []));
const itemPools = () => AUTO_ORDER.map(poolById).filter(Boolean);
const rowIn = (pool, name, slot) => pool && pool.rows.find(r=>r.n===name && (pool.pet || !slot || r.sl.includes(slot)));
const exactTier = (row, v) => { const x=num(v); return x!=null && row.t.some(t=>Math.abs(num(t)-x)<1e-6); };
const inRange = (row, v) => { const x=num(v), a=num(row.t[0]), b=num(row.t[row.t.length-1]); return x!=null && x>=a-1e-6 && x<=b+1e-6; };
function guessPool(l){
  if(CK.mode==='__pet') return PET;
  if(l.p) return poolById(l.p);
  const order = CK.mode!=='auto' ? [poolById(CK.mode), ...itemPools()] : itemPools();
  const cand = order.filter(Boolean).map(p=>[p,rowIn(p,l.b,CK.slot)]).filter(x=>x[1]);
  return (cand.find(([p,r])=>exactTier(r,l.v)) || cand.find(([p,r])=>inRange(r,l.v)) || [null])[0];
}
function ckNames(){
  if(CK.mode==='__pet') return PET.rows.map(r=>r.n);
  const set=new Set(); itemPools().forEach(p=>p.rows.forEach(r=>{ if(!CK.slot||r.sl.includes(CK.slot)) set.add(r.n); }));
  return [...set].sort();
}
const allNames = () => { const set=new Set(); itemPools().forEach(p=>p.rows.forEach(r=>set.add(r.n))); PET.rows.forEach(r=>set.add(r.n)); return [...set]; };
// slot podle názvu itemu z tooltipu (např. „Lying Dragon Fan+0“ → Weapon)
const EQN = D.equip.map(e=>({e, k:norm(e.n.replace(/\+\d.*$/,''))}));
function detectItem(text){
  for(const raw of text.split('\n').slice(0,4)){
    const k=norm(raw.replace(/\+\d.*$/,'').replace(/\(.*$/,'')); if(k.length<5) continue;
    let best=null, bs=0; for(const x of EQN){ const sc=dice(k,x.k); if(sc>bs){bs=sc;best=x.e;} }
    if(best && bs>=0.72){ const t=eqType(best); const s=SLOTS.find(s=>s.eq(t)); if(s) return {item:best, slot:s.k}; }
  }
  return null;
}
// čtení textu z tooltipu: přeskočí základní staty [Q: …], rozsahy a záporné hodnoty, zvládne „6% Chance…“ i „Max. SP +1,250“
function parseItemText(text, names){
  const pool = names.map(n=>({n,k:norm(n)})).concat(Object.entries(OCR_ALIAS).filter(([,n])=>names.includes(n)).map(([k,n])=>({n,k})));
  const out=[]; let godly=false;
  for(let raw of text.split('\n')){
    let line = raw.trim(); if(!line) continue;
    if(/godly\s*attrib/i.test(line)){ godly=true; continue; }
    if(/[\[(]\s*[Q@0O]\s*[:;+]|\bQ\s*[:;]/.test(line) || /pl\s*v?l|quality|from\s+p/i.test(line)) continue;   // základní staty [Q: …]
    if(/\s[-–]\s/.test(line)) continue;                 // rozsahy „560 - 570“
    line = line.replace(/\[[^\]]*\]?/g,' ').replace(/\([^)]*\)?/g,' ');
    if(/\d\s+[-–]\s+\d/.test(line)) continue;          // rozsah „560.0 - 570.0“ = základní stat
    const m = line.match(/([+-]?)\s*(\d{1,3}(?:,\d{3})+|\d+(?:[.,]\d+)?)\s*(%?)/);
    if(!m || m[1]==='-') continue;
    const v = Number(m[2].replace(/,(?=\d{3}\b)/g,'').replace(',','.'));
    const name = (line.slice(0,m.index)+' '+(m[3]?'% ':'')+line.slice(m.index+m[0].length)).replace(/[^A-Za-z%. ]/g,' ').replace(/\s+/g,' ').trim();
    const k = norm(name); if(k.length<3) continue;
    let best=null, bs=0;
    for(const c of pool){ const sc=dice(k,c.k)+(k===c.k?.3:0); if(sc>bs){bs=sc;best=c.n;} }
    if(best && bs>=0.6) out.push({b:best, v:String(v), godly});
  }
  return out;
}
async function ckOCR(file, rerender){
  const url=URL.createObjectURL(file);
  ckOcr.img=url; ckOcr.busy=true; ckOcr.msg=T('Čtu screenshot…','Reading the screenshot…'); rerender();
  try{
    await loadTess();
    const w = await Tesseract.createWorker('eng',1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',langPath:'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int'});
    let best=[], item=null;
    for(const thr of [140,110,170]){
      const cv=await prepImage(url,thr); const {data}=await w.recognize(cv);
      item = item || detectItem(data.text);
      if(item && CK.mode!=='__pet') CK.slot=item.slot;
      const found=parseItemText(data.text, CK.mode==='__pet' ? PET.rows.map(r=>r.n) : ckNames());
      if(found.length>best.length) best=found;
    }
    await w.terminate();
    ckOcr.busy=false; ckEdit=null;
    CK.item = item ? item.item.id : '';
    if(!best.length){ ckOcr.msg=T('Na obrázku jsem nenašel žádný bonus. Zkus celý tooltip bez ořezu, nebo přidej řádky ručně.','No bonus found. Try the whole tooltip or add lines by hand.'); saveCK(); return rerender(); }
    CK.rows = best.map(x=>({b:x.b, v:x.v, p:x.godly&&poolById('Godly')?'Godly':''})); saveCK();
    ckOcr.msg = ''; rerender();
  }catch(e){ ckOcr.busy=false; ckOcr.msg = e.message || T('Čtení se nepovedlo.','Reading failed.'); rerender(); }
}
function evalRow(l){
  if(!l.b || l.v==='') return null;
  const p = guessPool(l); if(!p) return {p:null};
  const r = rowIn(p,l.b,CK.slot); if(!r) return {p:null};
  if(p.pet){ const pct=clamp((num(l.v)-num(r.t[0]))/((num(r.t[1])-num(r.t[0]))||1),0,1); return {p,r,tier:{ti:null,tn:null,pct,over:num(l.v)>num(r.t[1])},exact:true}; }
  return {p,r,tier:tierOf(r,l.v),exact:exactTier(r,l.v)};
}
const FAM = p => !p ? 'base' : p.pet ? 'pet' : p.id==='Godly' ? 'godly' : p.id==='Magic Word' ? 'word' : /6\/7/.test(p.id) ? 'six' : 'main';
const FAMNAME = {main:T('Bonusy','Bonuses'), six:T('Bonusy 6/7','6/7 bonuses'), godly:'Godly Attribute', word:'Magic Word', pet:T('Pet artefakt','Pet artifact'), base:T('Nepoznané / základní staty','Unrecognised / base stats')};
const qcol = t => !t ? 'var(--muted)' : t.over ? 'var(--bad)' : t.pct>=.999 ? 'var(--gold2)' : t.pct>=.8 ? 'var(--good)' : t.pct>=.5 ? 'var(--mid)' : 'var(--bad)';
const fmtV = (v,u) => (Number(v).toLocaleString(LOC))+(u||'');

function ckLine(l,i,e){
  const u = e&&e.r ? unitOf(e.r.t[e.r.t.length-1]) : '';
  const t = e&&e.exact!==false ? e.tier : null;
  const pips = t && t.tn ? `<span class="pips" style="--c:${qcol(t)}">${Array.from({length:t.tn},(_,j)=>`<i class="${j<=t.ti?'on':''}"></i>`).join('')}</span>` : t ? `<span class="pips pct" style="--c:${qcol(t)}"><i style="width:${t.pct*100}%"></i></span>` : '';
  const tag = !e||!e.p ? `<span class="ttag dim">?</span>` : e.exact===false ? `<span class="ttag dim" title="${T('Hodnota není přesný tier – asi základní stat itemu','Not an exact tier – probably a base stat')}">~</span>` : `<span class="ttag" style="--c:${qcol(t)}">${t.over?'!':t.ti!=null?`T${t.ti+1}`:Math.round(t.pct*100)+'%'}</span>`;
  const maxv = e&&e.r ? e.r.t[e.r.t.length-1] : '';
  return `<button class="tline ${ckEdit===i?'edit':''}" data-li="${i}" title="${T('Klikni pro úpravu','Click to edit')}">
      <span class="tn">${esc(l.b)}</span><span class="tv">${l.v!==''?'+'+esc(fmtV(l.v,u)):'—'}</span>${tag}${pips}<span class="tmax">${maxv?T('max ','max ')+esc(maxv):''}</span>
      <span class="tpc" data-ckb="${esc(l.b)}" data-ckp="${esc(e&&e.p?e.p.id:'')}" data-ckt="${t&&t.ti!=null?t.ti:''}"></span>
    </button>` + (ckEdit===i ? ckEditor(l,i,e) : '');
}
function ckEditor(l,i,e){
  const pet=CK.mode==='__pet';
  const pools = (!pet && l.b) ? itemPools().filter(p=>rowIn(p,l.b,CK.slot)) : [];
  return `<div class="teditor">
    <select class="cksel" data-i="${i}"><option value="">${T('vyber bonus…','pick a bonus…')}</option>${ckNames().map(n=>`<option ${n===l.b?'selected':''} value="${esc(n)}">${esc(n)}</option>`).join('')}</select>
    <input class="ckval" data-i="${i}" inputmode="decimal" placeholder="${T('hodnota','value')}" value="${esc(l.v)}">
    ${pet?'':`<select class="ckpool" data-i="${i}" ${l.b?'':'disabled'}><option value="">${T('zdroj: automaticky','source: automatic')}${e&&e.p&&!l.p?' ('+esc(e.p.n)+')':''}</option>${pools.map(p=>`<option value="${esc(p.id)}" ${p.id===l.p?'selected':''}>${esc(p.n)}</option>`).join('')}</select>`}
    ${e&&e.r?`<div class="ttiers">${e.r.t.map((x,j)=>`<span class="${e.tier&&e.tier.ti===j&&e.exact!==false?'on':''}">${esc(x)}</span>`).join('')}</div>`:''}
    <div class="tedact"><button class="tbtn ghost" data-done>${T('Hotovo','Done')}</button><button class="lnk2 danger" data-rm="${i}">${T('Odebrat řádek','Remove line')}</button></div>
  </div>`;
}
function checkerView(){
  const main=$('#main'); main.className='tool ck';
  const pet = CK.mode==='__pet';
  const ev = CK.rows.map(evalRow);
  let sum=0, filled=0, maxed=0;
  ev.forEach(e=>{ if(e&&e.p&&e.exact!==false){ filled++; sum+=e.tier.pct; if(e.tier.pct>=.999) maxed++; } });
  const score = filled ? Math.round(sum/filled*100) : 0;
  const verdict = score>=85 ? T('Skoro maxnutý. Nech si ho.','Almost maxed. Keep it.')
    : score>=65 ? T('Dobrý item. Přetoč jen nejslabší řádky.','Good item. Reroll only the weakest lines.')
    : score>=40 ? T('Průměr. Máš-li orby, toč dál.','Average. Keep rolling if you have orbs.')
    : T('Slabé rolly. Točit dál.','Weak rolls. Reroll.');
  // skupiny jako ve hře
  const groups={}; CK.rows.forEach((l,i)=>{ const e=ev[i]; const f=e&&e.exact===false?'base':FAM(e&&e.p); (groups[f] ||= []).push(i); });
  const item = D.equip.find(x=>x.id===CK.item);
  const slotObj = SLOTS.find(s=>s.k===CK.slot);
  const slotOpts = [...new Set(itemPools().flatMap(p=>p.rows.flatMap(r=>r.sl)))].filter(s=>!/Mount|Pet/.test(s)).sort();
  const key = CK.mode+'|'+CK.slot+'|'+CK.rows.map(l=>l.b+':'+l.v).join(',');
  const has = CK.rows.length>0;
  const tooltip = has ? `<div class="ttip">
      <div class="ttitle">${item?img(item.i,'titem'):''}<div><b>${esc(item?item.n.replace(/\s*\+\d.*$/,''):(pet?T('Pet artefakt','Pet artifact'):slotObj?slotName(slotObj):CK.slot||T('Item','Item')))}</b><span>${pet?'':esc(slotObj?slotName(slotObj):CK.slot)}</span></div></div>
      ${['main','six','godly','word','pet','base'].filter(f=>groups[f]).map(f=>`<div class="tsec ${f}"><div class="tsech">${FAMNAME[f]}</div>${groups[f].map(i=>ckLine(CK.rows[i],i,ev[i])).join('')}</div>`).join('')}
      <button class="tadd" id="ckadd">+ ${T('přidat řádek ručně','add a line by hand')}</button>
    </div>` : '';
  main.innerHTML = `
    <div class="cktop"><h1>${T('Kontrola itemu','Item check')}</h1>
      <label class="cksl">${T('Slot','Slot')} <select id="ckslot" ${pet?'disabled':''}>${slotOpts.map(s=>`<option ${s===CK.slot?'selected':''} value="${esc(s)}">${esc(s)}</option>`).join('')}</select></label>
      <label class="cksl">${T('Zdroj','Source')} <select id="ckmode"><option value="auto">${T('Celý item – poznat automaticky','Whole item – detect automatically')}</option>${itemPools().map(p=>`<option value="${esc(p.id)}" ${p.id===CK.mode?'selected':''}>${esc(p.n)}</option>`).join('')}<option value="__pet" ${pet?'selected':''}>${T('Pet artefakt','Pet artifact')}</option></select></label>
    </div>
    <div class="ckmain ${has?'has':''}">
      <div class="ckleft">
        <label class="drop ${ckOcr.busy?'busy':''}" id="ckocr" tabindex="0">
          <input type="file" id="ckfile" accept="image/*" hidden>
          ${ckOcr.img?`<img src="${ckOcr.img}" alt="">`:''}
          <span class="dtxt">${ckOcr.busy?`<b>${ckOcr.msg}</b>`:has?T('<b>Ctrl+V</b> další screenshot','<b>Ctrl+V</b> another screenshot'):T('<b>Ctrl+V</b> – vlož screenshot itemu<br><small>nebo ho sem přetáhni či klikni a vyber soubor</small>','<b>Ctrl+V</b> – paste an item screenshot<br><small>or drop it here, or click to choose a file</small>')}</span>
        </label>
        ${!ckOcr.busy&&ckOcr.msg?`<p class="ckmsg">${ckOcr.msg}</p>`:''}
        ${!has&&!ckOcr.busy?`<button class="lnk2" id="ckadd">${T('nebo vyplnit ručně','or fill in by hand')}</button>`:''}
      </div>
      ${has?`<div class="ckmid">${tooltip}</div>
      <aside class="ckverd">
        <div class="vscore" style="--c:${score>=65?'var(--good)':score>=40?'var(--mid)':'var(--bad)'}">${filled?score:'–'}</div>
        <p class="vtext">${filled?verdict:T('Doplň hodnoty řádků.','Fill in the line values.')}</p>
        ${filled?`<p class="vsub">${T(`${maxed} z ${filled} řádků na maximu`,`${maxed} of ${filled} lines maxed`)}</p>`:''}
        <div class="vact">
          ${!pet&&filled?`<button class="tbtn" id="cksend" ${ckSent.has(key)?'disabled':''}>${ckSent.has(key)?T('Přidáno do statistik','Added to stats'):T('Přidat do statistik','Add to stats')}</button>`:''}
          ${filled?`<button class="tbtn ghost" id="cktob">${T('Vložit do buildu','Add to build')}</button>`:''}
          <button class="lnk2" id="ckclr">${T('Začít znovu','Start over')}</button>
        </div>
        <p class="vnote">${T('T = tier rollu, čárky ukazují, kolik tierů zbývá do maxima. Klikni na řádek, když chceš opravit číslo nebo zdroj.','T = roll tier, the marks show how many tiers are left to max. Click a line to fix the value or source.')}</p>
      </aside>`:''}
    </div>`;
  const re=()=>{ const sc=main.scrollTop; checkerView(); main.scrollTop=sc; };
  $('#ckslot').onchange=e=>{ CK.slot=e.target.value; CK.item=''; CK.rows.forEach(l=>l.p=l.p==='Godly'?'Godly':''); saveCK(); re(); };
  $('#ckmode').onchange=e=>{ const was=CK.mode==='__pet', now=e.target.value==='__pet'; CK.mode=e.target.value; if(was!==now){ CK.rows=[]; CK.item=''; } else CK.rows.forEach(l=>{ if(l.p!=='Godly') l.p=''; }); ckEdit=null; saveCK(); re(); };
  main.querySelectorAll('[data-li]').forEach(b=>b.onclick=()=>{ ckEdit = ckEdit===+b.dataset.li ? null : +b.dataset.li; re(); });
  main.querySelectorAll('#ckadd').forEach(b=>b.onclick=()=>{ CK.rows.push({b:'',v:'',p:''}); ckEdit=CK.rows.length-1; saveCK(); re(); });
  main.querySelectorAll('.cksel').forEach(x=>x.onchange=()=>{ const l=CK.rows[+x.dataset.i]; l.b=x.value; l.p=''; saveCK(); re(); });
  main.querySelectorAll('.ckpool').forEach(x=>x.onchange=()=>{ CK.rows[+x.dataset.i].p=x.value; saveCK(); re(); });
  main.querySelectorAll('.ckval').forEach(inp=>{ inp.onchange=()=>{ CK.rows[+inp.dataset.i].v=inp.value.trim().replace(/[+%\s]/g,'').replace(/,(?=\d{3}\b)/g,''); saveCK(); re(); }; inp.onkeydown=e=>{ if(e.key==='Enter') inp.blur(); }; });
  main.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ CK.rows.splice(+b.dataset.rm,1); ckEdit=null; saveCK(); re(); });
  main.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{ CK.rows=CK.rows.filter(l=>l.b); ckEdit=null; saveCK(); re(); });
  const clr=$('#ckclr'); if(clr) clr.onclick=()=>{ CK.rows=[]; CK.item=''; ckEdit=null; ckOcr.img=''; ckOcr.msg=''; saveCK(); re(); };
  const z=$('#ckocr'), take=f=>{ if(f&&f.type.startsWith('image/')&&!ckOcr.busy) ckOCR(f,re); };
  $('#ckfile').onchange=e=>take(e.target.files[0]);
  z.ondragover=e=>{e.preventDefault();z.classList.add('over')}; z.ondragleave=()=>z.classList.remove('over');
  z.ondrop=e=>{e.preventDefault();z.classList.remove('over');take(e.dataTransfer.files[0])};
  document.onpaste = e => { if(state.cat!=='tool-check') return; const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/')); if(it){e.preventDefault();take(it.getAsFile());} };
  const sb=$('#cksend'); if(sb) sb.onclick=async()=>{
    const by={}; ev.forEach((e,i)=>{ if(e&&e.p&&!e.p.pet&&e.tier&&e.tier.ti>=0&&!e.tier.over&&e.exact) (by[e.p.id] ||= []).push({b:CK.rows[i].b,ti:e.tier.ti,tn:e.tier.tn}); });
    sb.disabled=true; sb.textContent='…';
    try{ for(const [pool,rows] of Object.entries(by)) await sendStats(pool, CK.slot||null, rows); ckSent.add(key); store.set('ckSent',[...ckSent].slice(-200)); re(); }
    catch(e){ sb.disabled=false; sb.textContent=e.message; }
  };
  const tb=$('#cktob'); if(tb) tb.onclick=()=>{
    const b = SHARED ? null : curBuild(); if(!b) return;
    if(pet){ b.pet.lines = CK.rows.filter(l=>l.b&&l.v!=='').map(l=>({b:l.b,v:l.v})); }
    else { const s=SLOTS.find(x=>x.k===CK.slot); if(!s){ tb.textContent=T('Tenhle slot v buildu není','This slot is not in the planner'); return; }
      const st=slotState(b,s.k); if(CK.item) st.item=CK.item;
      const lines=ev.map((e,i)=>e&&e.p&&e.exact!==false&&e.tier&&e.tier.ti>=0?{b:CK.rows[i].b,ti:e.tier.ti,p:e.p.id}:null).filter(Boolean);
      const cnt={}; lines.forEach(l=>cnt[l.p]=(cnt[l.p]||0)+1); st.pool=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]?.[0]||st.pool; st.lines=lines.map(l=>l.p===st.pool?{b:l.b,ti:l.ti}:l); }
    saveBuilds(); tb.textContent=T(`Vloženo do „${b.name}“`,`Added to “${b.name}”`); tb.disabled=true;
  };
  const pls=[...new Set([...main.querySelectorAll('[data-ckp]')].map(e=>e.dataset.ckp))].filter(x=>x&&x!=='__pet');
  pls.forEach(pid=>stats(pid).then(d=>{ if(!d) return; main.querySelectorAll(`[data-ckp="${CSS.escape(pid)}"]`).forEach(el=>{ const s=d[el.dataset.ckb], ti=el.dataset.ckt; if(!s||!s.n||ti===''||+ti>=s.c.length) return; const better=s.c.slice(+ti+1).reduce((a,b)=>a+b,0); const pc=Math.round((s.n-better-s.c[+ti]/2)/s.n*100); el.textContent=T(`lepší než ${pc} %`,`beats ${pc}%`); el.title=T(`podle ${s.n} rollů od hráčů`,`based on ${s.n} player rolls`); }); }));
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
    ${p||st.lines.length?`<div class="blines">${st.lines.map((l,i)=>{ const lp=poolById(l.p)||p; const lrows=lp?lp.rows.filter(r=>r.sl.includes(s.k)):[]; const r=lrows.find(x=>x.n===l.b); return `<div class="bline"><select data-l="${i}" data-f="lb"><option value="">—</option>${lrows.map(x=>`<option ${x.n===l.b?'selected':''}>${esc(x.n)}</option>`).join('')}</select>
        <select data-l="${i}" data-f="lt" class="tsel">${r?r.t.map((t,j)=>`<option value="${j}" ${j===l.ti?'selected':''}>T${j+1} · ${esc(t)}</option>`).join(''):''}</select><button class="bx" data-l="${i}" data-f="ldel">×</button>${l.p&&l.p!==st.pool?`<span class="lpool">${esc(lp?lp.n:l.p)}</span>`:''}</div>`; }).join('')}
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
        if(f==='pool'){ st.pool=el.value; st.lines=st.lines.filter(l=>l.p&&l.p!==el.value); }
        if(f==='rank') st.rank=clamp(parseInt(el.value)||0,0,UPG?UPG.maxRank:11);
        if(f==='ladd') st.lines.push(k==='__pet'?{b:'',v:''}:{b:'',ti:0});
        if(f==='ldel') st.lines.splice(i,1);
        if(f==='lb'){ st.lines[i].b=el.value; if(k!=='__pet'){ const r=(poolById(st.lines[i].p)||poolById(st.pool))?.rows.find(x=>x.n===el.value); st.lines[i].ti=r?r.t.length-1:0; } else st.lines[i].v=''; }
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
