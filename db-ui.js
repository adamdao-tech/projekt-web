// ============================================================
//  DATABÁZE (nihor2.com) – seznam vlevo, detail vpravo
// ============================================================
(function(){
const D = window.DB; if(!D) return;
const H = D.host;
const img = (src, cls='') => src ? `<img class="${cls}" loading="lazy" src="${H}${src}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${cls} noimg'}))">` : `<span class="${cls} noimg"></span>`;
const hl = t => esc(t).replace(/(\d[\d.,]*\s*[–-]\s*\d[\d.,]*\s*%?)/g,'<span class="rng">$1</span>').replace(/\n/g,'<br>');
const dbFav = new Set(store.get('dbfav',[]));
const saveFav = () => store.set('dbfav',[...dbFav]);
const ds = store.get('dbstate2',{});
const S = k => (ds[k] = ds[k] || {q:'',cat:'',fav:false,sort:'az',sel:null,spec:''});
const save = () => store.set('dbstate2',ds);

// nepřátelé jako kategorie itemů
D.enemies.forEach(e => D.items.push({id:e.id,n:e.n,i:e.i,c:tr('Nepřátelé','Enemies'),d:e.c==='Metins'?tr('Metin kámen','Metin stone'):'Boss',s:[]}));
// zpětný index: co z čeho padá
const contains = {};
[['items',D.items],['equip',D.equip],['emb',D.emblems]].forEach(([k,l]) => l.forEach(x => (x.s||[]).forEach(([n]) => (contains[n]=contains[n]||[]).push({k,x}))));
const findByName = n => { for(const [k,l] of [['items',D.items],['equip',D.equip],['emb',D.emblems]]){ const x=l.find(y=>y.n===n); if(x) return {k,x}; } return null; };

const SPECS = LANG==='en' ? {'Healing Shaman':'Heal Shaman','Dragon Shaman':'Dragon Shaman','Body Warrior':'Body Warrior','Mental Warrior':'Mental Warrior','Blade Ninja':'Blade Ninja','Archery Ninja':'Archer Ninja','Weaponry Sura':'Weapon Sura','Magic Sura':'Magic Sura'}
  : {'Healing Shaman':'Heal šaman','Dragon Shaman':'Dragon šaman','Body Warrior':'Body warrior','Mental Warrior':'Mental warrior','Blade Ninja':'Blade ninja','Archery Ninja':'Archer ninja','Weaponry Sura':'Weapon sura','Magic Sura':'Magic sura'};
const CAT_CZ = {'Skill Books':'Skill booky','Chests':'Truhly','Dungeon charts':'Mapy dungeonů','Portal stones':'Portal stony','Prophecies':'Proroctví','Pet & Materials':'Pet & materiály','Artifact Essences':'Esence artefaktů','Settler':'Settler','Item Ranks':'Ranky itemů',
  'Class · Skill':'Class – skill','Class · Support':'Class – support','Passive · Celestial runes':'Pasivní runy','Aura':'Aura','Spirit':'Spirit','Mount':'Kůň'};
const cz = c => LANG==='en' ? ({'Zbraně':'Weapons','Zbroje':'Armour','Helmy':'Helmets','Šperky':'Jewellery','Boty & opasky':'Shoes & belts','Štíty':'Shields','Šerpy & talismany':'Sashes & talismans','Sigily':'Sigils','Spirit stony':'Spirit stones','Gemy':'Gems','Kůň':'Horse','Boostery':'Boosters','Materiály & ostatní':'Materials & other','Vstupenky & klíče':'Tickets & keys','Nepřátelé':'Enemies'}[c] || c) : (CAT_CZ[c] || c);
const KIND = {
  items:{title:tr('Itemy','Items'), list:()=>D.items, cat:x=>x.c},
  equip:{title:tr('Vybavení','Equipment'), list:()=>D.equip, cat:x=>x.c},
  emb:{title:tr('Emblemy','Emblems'), list:()=>D.emblems, cat:x=>x.t},
};
const fk = (k,x) => k+':'+x.id;

function filtered(k){
  const st=S(k), K=KIND[k], q=st.q.trim().toLowerCase();
  let l = K.list().filter(x => (!st.cat || K.cat(x)===st.cat) && (!st.fav || dbFav.has(fk(k,x))) && (!st.spec || (x.sp||[]).includes(st.spec))
    && (!q || (x.n+' '+x.id+' '+(x.d||'')+' '+(x.s||[]).map(s=>s[0]).join(' ')).toLowerCase().includes(q)));
  if(st.sort==='az') l=[...l].sort((a,b)=>a.n.localeCompare(b.n));
  if(st.sort==='id') l=[...l].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}));
  if(k==='emb' && st.spec) l=[...l].sort((a,b)=>(a.set-b.set)||String(a.id).localeCompare(String(b.id)));
  return l;
}

function detail(k,x){
  if(!x) return `<div class="dempty">${tr('Vyber něco ze seznamu vlevo.','Pick something from the list on the left.')}</div>`;
  const cat = KIND[k].cat(x), fav = dbFav.has(fk(k,x));
  const inside = contains[x.n]||[];
  const link = (n,i) => { const t=findByName(n); return `<button class="lnk" ${t?`data-go="${t.k}|${esc(t.x.id)}"`:'disabled'}>${img(i,'li')}<span>${esc(n)}</span></button>`; };
  return `<article class="tip">
    <header>${img(x.i,'timg')}<div><h2>${esc(x.n)}</h2><p>${esc(k==='equip'&&x.t?x.t:cz(cat))}${x.l?`, ${esc(x.l)}`:''}<span class="tid">#${esc(x.id)}</span></p></div>
      <button class="favbtn ${fav?'on':''}" data-dbfav="${esc(fk(k,x))}">${fav?tr('★ V oblíbených','★ In favourites'):tr('☆ Přidat do oblíbených','☆ Add to favourites')}</button></header>
    ${k==='emb'&&x.sp?.length?`<p class="tspec">${SPECS[x.sp[0]]}, set ${esc(D.emblemSets[x.set]||'')}</p>`:''}
    ${x.v?`<p class="tval">${esc(x.v).replace(/\n/g,'<br>')}</p>`:''}
    ${k==='equip'&&x.st?.length?`<dl class="tstats">${x.st.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>`:''}
    ${x.d?`<div class="tdesc">${hl(x.d)}</div>`:''}
    ${x.s?.length?`<h3>${tr('Kde padá','Drops from')}</h3><div class="links">${x.s.map(([n,i])=>link(n,i)).join('')}</div>`:''}
    ${inside.length?`<h3>${tr('Co z toho padá','What it drops')} <span>${inside.length}</span></h3><div class="links">${inside.map(({x:y})=>link(y.n,y.i)).join('')}</div>`:''}
  </article>`;
}

function listView(k){
  const st=S(k), K=KIND[k], all=K.list(), list=filtered(k);
  const cats={}; all.forEach(x=>{const c=K.cat(x); cats[c]=(cats[c]||0)+1;});
  let sel = list.find(x=>String(x.id)===String(st.sel)) || all.find(x=>String(x.id)===String(st.sel)) || list[0];
  let lastSet=null;
  const rows = list.map(x=>{
    let head='';
    if(k==='emb' && st.spec && x.set!==lastSet){ lastSet=x.set; head=`<li class="grp">Set ${esc(D.emblemSets[x.set]||'')}</li>`; }
    return head+`<li class="row ${sel&&x===sel?'on':''}" data-sel="${esc(x.id)}">${img(x.i,'rimg')}<span class="rn">${esc(x.n)}</span>${dbFav.has(fk(k,x))?'<span class="rstar">★</span>':''}<span class="rc">${esc(cz(K.cat(x)))}</span></li>`;
  }).join('');
  return `<div class="dhead"><h1>${K.title}</h1><span class="cnt">${list.length===all.length?all.length+tr(' položek',' entries'):list.length+tr(' z ',' of ')+all.length}</span></div>
  <div class="dsplit">
    <section class="dlist">
      <div class="dfilters">
        <input id="dq" type="search" placeholder="${tr('Hledat…','Search…')}" value="${esc(st.q)}" autocomplete="off">
        <div class="frow">
          <select id="dcat"><option value="">${tr('Všechny kategorie','All categories')}</option>${Object.entries(cats).sort((a,b)=>cz(a[0]).localeCompare(cz(b[0]))).map(([c,n])=>`<option value="${esc(c)}" ${st.cat===c?'selected':''}>${esc(cz(c))} (${n})</option>`).join('')}</select>
          ${k==='emb'?`<select id="dspec"><option value="">${tr('Všechny classy','All classes')}</option>${Object.entries(SPECS).map(([s,c])=>`<option value="${s}" ${st.spec===s?'selected':''}>${c}</option>`).join('')}</select>`:''}
        </div>
        <div class="frow small">
          <label><input type="checkbox" id="dfav" ${st.fav?'checked':''}> ${tr('Jen oblíbené','Favourites only')}</label>
          <span class="sort">${tr('Řadit','Sort')}: <button class="${st.sort==='az'?'on':''}" data-sort="az">${tr('název','name')}</button> <button class="${st.sort==='id'?'on':''}" data-sort="id">ID</button></span>
        </div>
      </div>
      <ul class="rows">${rows || `<li class="none">${st.fav?tr('Žádné oblíbené. Otevři položku a klikni na „Přidat do oblíbených“.','No favourites. Open an entry and click “Add to favourites”.'):tr('Nic tomu neodpovídá.','Nothing matches.')}</li>`}</ul>
    </section>
    <section class="ddetail">${detail(k,sel)}</section>
  </div>`;
}

function bonusView(){
  const st=S('bon'), q=st.q.trim().toLowerCase();
  const list=D.bonuses.filter(b=>(!q||b.n.toLowerCase().includes(q))&&(!st.fav||dbFav.has('bon:'+b.n)));
  const sel=D.bonuses.find(b=>b.n===st.sel)||list[0];
  const pet=sel&&D.pet.find(p=>p.n===sel.n);
  const fav=sel&&dbFav.has('bon:'+sel.n);
  const pools = sel ? `<ul class="plist">${sel.p.map(p=>`<li>
      <div class="pl1">${img(p.pi,'li')}<b>${esc(p.pool)}</b><span class="pm">max ${esc(p.t[p.t.length-1]||'—')}</span></div>
      <div class="pl2">${[...new Set(p.sl)].map(esc).join(', ')}</div>
      <div class="pl3">${p.t.map((t,i)=>`<span class="${i===p.t.length-1?'last':''}">${esc(t)}</span>`).join('')}</div></li>`).join('')}</ul>` : '';
  return `<div class="dhead"><h1>${tr('Bonusy a tiery','Bonuses & tiers')}</h1><span class="cnt">${D.bonuses.length} ${tr('bonusů','bonuses')}</span></div>
  <div class="dsplit">
    <section class="dlist">
      <div class="dfilters"><input id="dq" type="search" placeholder="${tr('Hledat bonus…','Search bonus…')}" value="${esc(st.q)}" autocomplete="off">
        <div class="frow small"><label><input type="checkbox" id="dfav" ${st.fav?'checked':''}> ${tr('Jen oblíbené','Favourites only')}</label></div></div>
      <ul class="rows">${list.map(b=>`<li class="row ${sel&&b===sel?'on':''}" data-bsel="${esc(b.n)}"><span class="rn">${esc(b.n)}</span>${dbFav.has('bon:'+b.n)?'<span class="rstar">★</span>':''}</li>`).join('')||`<li class="none">${tr('Nic tomu neodpovídá.','Nothing matches.')}</li>`}</ul>
    </section>
    <section class="ddetail">${sel?`<article class="tip"><header><div><h2>${esc(sel.n)}</h2><p>${tr(`Padá z ${sel.p.length} různých zdrojů`,`Drops from ${sel.p.length} different sources`)}</p></div>
      <button class="favbtn ${fav?'on':''}" data-dbfav="${esc('bon:'+sel.n)}">${fav?tr('★ V oblíbených','★ In favourites'):tr('☆ Přidat do oblíbených','☆ Add to favourites')}</button></header>
      ${pet?`<p class="tval">${tr('Na pet artefaktu','On pet artifact')}: ${esc(pet.r)}</p>`:''}${pools}</article>`:`<div class="dempty">${tr('Vyber bonus vlevo.','Pick a bonus on the left.')}</div>`}</section>
  </div>`;
}

function classView(){
  return `<div class="dhead"><h1>${tr('Classy a skilly','Classes & skills')}</h1></div>
  <div class="cls">${D.classes.map(c=>`<section>
    <h2>${img(c.i,'cimg')}${esc(c.n)}</h2>
    ${c.specs.map(sp=>`<h3>${esc(SPECS[sp]||sp)} <button class="lnk2" data-goemb="${esc(sp)}">${tr('emblemy','emblems')} (${D.emblems.filter(e=>(e.sp||[]).includes(sp)).length})</button></h3>
      <ul>${c.skills.filter(s=>s.spec===sp).map(s=>`<li>${img(s.i,'li')}<div><b>${esc(s.n)}</b><p>${esc(s.d||'')}</p></div></li>`).join('')}</ul>`).join('')}
  </section>`).join('')}</div>`;
}

// ---------- TOČENÍ BONUSŮ: zdroj (Divine, pet, Exalted…) -> jeho bonusy a max staty ----------
const num = v => { const n=parseFloat(String(v).replace(/[\s,%]/g,'')); return isNaN(n)?null:n; };
const POOL_ORDER = ['__pet','Normal','Divine','6/7','Divine 6/7','Godly','Exalted','Exalted + Divine','Exalted 6/7','Exalted + Divine 6/7','Magic Word','Mount Equipment: Plain','Mount Equipment: Magic','Mount Equipment: Rare','Mount Equipment: Legendary'];
const POOLS = (() => {
  const m = new Map();
  D.bonuses.forEach(b => b.p.forEach(p => {
    let o = m.get(p.pool); if(!o){ o={id:p.pool,n:p.pool,pi:p.pi,rows:[]}; m.set(p.pool,o); }
    o.rows.push({n:b.n, sl:[...new Set(p.sl)], t:p.t});
  }));
  const pet = {id:'__pet', n:tr('Pet artefakt','Pet artifact'), pi:'/assets/catalog/items/299008.webp', pet:true,
    rows:D.pet.map(x=>{ const [a,b]=String(x.r).split(/\s*[–-]\s*/); return {n:x.n, sl:[], t:[a,b||a]}; })};
  const all = [pet, ...m.values()];
  const ix = id => { const i=POOL_ORDER.indexOf(id); return i<0?99:i; };
  return all.sort((a,b)=>ix(a.id)-ix(b.id) || a.n.localeCompare(b.n));
})();
const prolls = store.get('poolrolls',{});
function pgrade(r, v){
  const lo=num(r.t[0]), hi=num(r.t[r.t.length-1]), x=num(v);
  if(x==null||hi==null) return null;
  const pct = hi===lo ? 1 : Math.max(0,Math.min(1,(x-lo)/(hi-lo)));
  let label,col;
  if(x>hi){label='> max?';col='var(--bad)'} else if(x>=hi){label='MAX';col='var(--gold2)'}
  else if(pct>=.8){label='Top';col='var(--good)'} else if(pct>=.5){label='OK';col='var(--mid)'} else {label=tr('Slabé','Weak');col='var(--bad)'}
  return {pct,label,col};
}
function rollView(){
  const st=S('roll'), q=st.q.trim().toLowerCase();
  const pool = POOLS.find(p=>p.id===st.sel) || POOLS[0];
  const slots = [...new Set(pool.rows.flatMap(r=>r.sl))].sort();
  const slot = slots.includes(st.spec) ? st.spec : '';
  let rows = pool.rows.filter(r=>(!q||r.n.toLowerCase().includes(q)) && (!slot||r.sl.includes(slot)) && (!st.fav||dbFav.has('bon:'+r.n)));
  rows = [...rows].sort(st.sort==='max' ? (a,b)=>(num(b.t[b.t.length-1])||0)-(num(a.t[a.t.length-1])||0) : (a,b)=>a.n.localeCompare(b.n));
  const k = r => pool.id+'::'+r.n;
  const body = rows.map(r=>{ const g=pgrade(r,prolls[k(r)]); const fav=dbFav.has('bon:'+r.n);
    return `<tr>
      <td class="pn"><span class="fav ${fav?'on':''}" data-dbfav="${esc('bon:'+r.n)}">★</span><button class="lnk2" data-gobon="${esc(r.n)}">${esc(r.n)}</button>${!pool.pet&&!slot?`<div class="rsl">${r.sl.map(x=>`<button class="slk" data-slot="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:''}</td>
      <td><div class="pl3" style="margin:0">${r.t.map((t,i)=>`<span class="${i===r.t.length-1?'last':''}">${esc(t)}</span>`).join('')}</div></td>
      <td class="r"><span class="pm">${esc(r.t[r.t.length-1])}</span></td>
      <td><div class="chk"><input type="text" inputmode="decimal" placeholder="roll" data-pk="${esc(k(r))}" value="${esc(prolls[k(r)]??'')}">
        <span class="badge" style="${g?`color:${g.col};background:color-mix(in srgb,${g.col} 15%,transparent)`:'opacity:0'}">${g?g.label+' '+Math.round(g.pct*100)+'%':'–'}</span></div></td></tr>`; }).join('');
  return `<div class="dhead"><h1>${tr('Točení bonusů','Bonus rolls')}</h1><span class="cnt">${tr('Vyber, čím točíš, a uvidíš všechny bonusy a jejich max.','Pick what you roll with and see every bonus and its max.')}</span></div>
  <div class="dsplit">
    <section class="dlist">
      <ul class="rows">${POOLS.map(p=>`<li class="row ${p===pool?'on':''}" data-psel="${esc(p.id)}">${img(p.pi,'rimg')}<span class="rn">${esc(p.n)}</span><span class="rc">${p.rows.length}</span></li>`).join('')}</ul>
    </section>
    <section class="ddetail"><article class="tip" style="max-width:none">
      <header>${img(pool.pi,'timg')}<div><h2>${esc(pool.n)}</h2><p>${pool.rows.length} ${tr('bonusů','bonuses')}${slot?` · ${tr('na slotu','on slot')} <b>${esc(slot)}</b>: ${rows.length}`:''}</p></div></header>
      ${slots.length?`<div class="slots"><button class="gchip ${!slot?'on':''}" data-slot="">${tr('Všechny sloty','All slots')}</button>${slots.map(x=>`<button class="gchip ${x===slot?'on':''}" data-slot="${esc(x)}">${esc(x)}<span class="pgc">${pool.rows.filter(r=>r.sl.includes(x)).length}</span></button>`).join('')}</div>`:''}
      <div class="dfilters"><div class="frow">
        <input id="dq" type="search" placeholder="${tr('Hledat bonus…','Search bonus…')}" value="${esc(st.q)}" autocomplete="off">
      </div><div class="frow small">
        <label><input type="checkbox" id="dfav" ${st.fav?'checked':''}> ${tr('Jen oblíbené','Favourites only')}</label>
        <span class="sort">${tr('Řadit','Sort')}: <button class="${st.sort!=='max'?'on':''}" data-sort="az">${tr('název','name')}</button> <button class="${st.sort==='max'?'on':''}" data-sort="max">max</button></span>
      </div></div>
      ${rows.length?`<table class="ptab"><thead><tr><th>Bonus</th><th>${tr('Tiery (min → max)','Tiers (min → max)')}</th><th class="r">Max</th><th>${tr('Tvůj roll','Your roll')}</th></tr></thead><tbody>${body}</tbody></table>`:`<p class="dempty">${tr('Nic tomu neodpovídá.','Nothing matches.')}</p>`}
    </article></section>
  </div>`;
}

function favView(){
  const groups=[];
  for(const k of ['items','equip','emb']){ const l=KIND[k].list().filter(x=>dbFav.has(fk(k,x))); if(l.length) groups.push(`<h3>${KIND[k].title}</h3><div class="links">${l.map(x=>`<button class="lnk" data-go="${k}|${esc(x.id)}">${img(x.i,'li')}<span>${esc(x.n)}</span></button>`).join('')}</div>`); }
  const bl=D.bonuses.filter(b=>dbFav.has('bon:'+b.n));
  if(bl.length) groups.push(`<h3>${tr('Bonusy','Bonuses')}</h3><table class="ptab"><tbody>${bl.map(b=>`<tr><td class="pn"><button class="lnk2" data-gobon="${esc(b.n)}">${esc(b.n)}</button></td><td class="ps">${b.p.map(p=>esc(p.pool)+' <b class="pm">'+esc(p.t[p.t.length-1]||'')+'</b>').join(', ')}</td></tr>`).join('')}</tbody></table>`);
  return `<div class="dhead"><h1>${tr('Oblíbené','Favourites')}</h1></div><div class="favs">${groups.join('')||`<p class="dempty">${tr('Zatím tu nic není. Otevři libovolný item, emblem nebo bonus a klikni na „Přidat do oblíbených“.','Nothing here yet. Open any item, emblem or bonus and click “Add to favourites”.')}</p>`}</div>`;
}

window.DBNAV = [
  {id:'db-items',label:tr('Itemy','Items')},{id:'db-equip',label:tr('Vybavení','Equipment')},{id:'db-emb',label:tr('Emblemy','Emblems')},
  {id:'db-bon',label:tr('Bonusy a tiery','Bonuses & tiers')},{id:'db-roll',label:tr('Točení bonusů','Bonus rolls')},{id:'db-cls',label:tr('Classy a skilly','Classes & skills')},{id:'db-fav',label:tr('Oblíbené','Favourites')},
];

const goto = (catId, fn) => { fn(); save(); state.cat=catId; store.set('cat',catId); render(); };
window.renderDB = function(id){
  const main=$('#main'); main.className='db';
  const k={'db-items':'items','db-equip':'equip','db-emb':'emb'}[id];
  main.innerHTML = k?listView(k): id==='db-bon'?bonusView(): id==='db-roll'?rollView(): id==='db-cls'?classView(): favView();
  const st=S(k||(id==='db-roll'?'roll':'bon'));
  const re=()=>{save();const l=main.querySelector('.rows'),sc=l?l.scrollTop:0;window.renderDB(id);const l2=main.querySelector('.rows');if(l2)l2.scrollTop=sc;};
  main.querySelectorAll('[data-sel]').forEach(r=>r.onclick=()=>{st.sel=r.dataset.sel;re();});
  main.querySelectorAll('[data-psel]').forEach(r=>r.onclick=()=>{st.sel=r.dataset.psel;st.spec='';main.querySelector('.ddetail')&&(main.querySelector('.ddetail').scrollTop=0);re();});
  main.querySelectorAll('[data-slot]').forEach(b=>b.onclick=e=>{e.stopPropagation();st.spec=b.dataset.slot;re();const d=main.querySelector('.ddetail');if(d)d.scrollTop=0;});
  main.querySelectorAll('[data-pk]').forEach(inp=>inp.oninput=()=>{
    const k=inp.dataset.pk; if(inp.value==='') delete prolls[k]; else prolls[k]=inp.value; store.set('poolrolls',prolls);
    const pool=POOLS.find(p=>p.id===k.split('::')[0]), r=pool&&pool.rows.find(x=>pool.id+'::'+x.n===k), g=r&&pgrade(r,inp.value), bd=inp.nextElementSibling;
    bd.textContent=g?g.label+' '+Math.round(g.pct*100)+'%':'–'; bd.style.cssText=g?`color:${g.col};background:color-mix(in srgb,${g.col} 15%,transparent)`:'opacity:0';
  });
  main.querySelectorAll('[data-bsel]').forEach(r=>r.onclick=()=>{st.sel=r.dataset.bsel;re();});
  main.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{st.sort=b.dataset.sort;re();});
  main.querySelectorAll('[data-dbfav]').forEach(b=>b.onclick=()=>{const f=b.dataset.dbfav;dbFav.has(f)?dbFav.delete(f):dbFav.add(f);saveFav();re();});
  main.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const [kk,xid]=b.dataset.go.split('|');goto({items:'db-items',equip:'db-equip',emb:'db-emb'}[kk],()=>{const s=S(kk);s.sel=xid;s.q='';s.cat='';s.fav=false;s.spec='';});});
  main.querySelectorAll('[data-goemb]').forEach(b=>b.onclick=()=>goto('db-emb',()=>{const s=S('emb');s.spec=b.dataset.goemb;s.cat='';s.q='';s.fav=false;s.sel=null;}));
  main.querySelectorAll('[data-gobon]').forEach(b=>b.onclick=()=>goto('db-bon',()=>{const s=S('bon');s.sel=b.dataset.gobon;s.q='';s.fav=false;}));
  const c=$('#dcat'); if(c) c.onchange=()=>{st.cat=c.value;st.sel=null;re();};
  const sp=$('#dspec'); if(sp) sp.onchange=()=>{st.spec=sp.value;st.sel=null;re();};
  const f=$('#dfav'); if(f) f.onchange=()=>{st.fav=f.checked;re();};
  const q=$('#dq'); if(q){let t;q.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{st.q=q.value;if(id!=='db-roll')st.sel=null;re();const n=$('#dq');n.focus();n.setSelectionRange(n.value.length,n.value.length);},160);};}
  const on=main.querySelector('.row.on'); if(on && !on._seen) on.scrollIntoView({block:'nearest'});
};
})();
