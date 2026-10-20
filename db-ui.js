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
D.enemies.forEach(e => D.items.push({id:e.id,n:e.n,i:e.i,c:'Nepřátelé',d:e.c==='Metins'?'Metin kámen':'Boss',s:[]}));
// zpětný index: co z čeho padá
const contains = {};
[['items',D.items],['equip',D.equip],['emb',D.emblems]].forEach(([k,l]) => l.forEach(x => (x.s||[]).forEach(([n]) => (contains[n]=contains[n]||[]).push({k,x}))));
const findByName = n => { for(const [k,l] of [['items',D.items],['equip',D.equip],['emb',D.emblems]]){ const x=l.find(y=>y.n===n); if(x) return {k,x}; } return null; };

const SPECS = {'Healing Shaman':'Heal šaman','Dragon Shaman':'Dragon šaman','Body Warrior':'Body warrior','Mental Warrior':'Mental warrior','Blade Ninja':'Blade ninja','Archery Ninja':'Archer ninja','Weaponry Sura':'Weapon sura','Magic Sura':'Magic sura'};
const CAT_CZ = {'Skill Books':'Skill booky','Chests':'Truhly','Dungeon charts':'Mapy dungeonů','Portal stones':'Portal stony','Prophecies':'Proroctví','Pet & Materials':'Pet & materiály','Artifact Essences':'Esence artefaktů','Settler':'Settler','Item Ranks':'Ranky itemů',
  'Class · Skill':'Class – skill','Class · Support':'Class – support','Passive · Celestial runes':'Pasivní runy','Aura':'Aura','Spirit':'Spirit','Mount':'Kůň'};
const cz = c => CAT_CZ[c] || c;
const KIND = {
  items:{title:'Itemy', list:()=>D.items, cat:x=>x.c},
  equip:{title:'Vybavení', list:()=>D.equip, cat:x=>x.c},
  emb:{title:'Emblemy', list:()=>D.emblems, cat:x=>x.t},
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
  if(!x) return `<div class="dempty">Vyber něco ze seznamu vlevo.</div>`;
  const cat = KIND[k].cat(x), fav = dbFav.has(fk(k,x));
  const inside = contains[x.n]||[];
  const link = (n,i) => { const t=findByName(n); return `<button class="lnk" ${t?`data-go="${t.k}|${esc(t.x.id)}"`:'disabled'}>${img(i,'li')}<span>${esc(n)}</span></button>`; };
  return `<article class="tip">
    <header>${img(x.i,'timg')}<div><h2>${esc(x.n)}</h2><p>${esc(k==='equip'&&x.t?x.t:cz(cat))}${x.l?`, ${esc(x.l)}`:''}<span class="tid">#${esc(x.id)}</span></p></div>
      <button class="favbtn ${fav?'on':''}" data-dbfav="${esc(fk(k,x))}">${fav?'★ V oblíbených':'☆ Přidat do oblíbených'}</button></header>
    ${k==='emb'&&x.sp?.length?`<p class="tspec">${SPECS[x.sp[0]]}, set ${esc(D.emblemSets[x.set]||'')}</p>`:''}
    ${x.v?`<p class="tval">${esc(x.v).replace(/\n/g,'<br>')}</p>`:''}
    ${k==='equip'&&x.st?.length?`<dl class="tstats">${x.st.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>`:''}
    ${x.d?`<div class="tdesc">${hl(x.d)}</div>`:''}
    ${x.s?.length?`<h3>Kde padá</h3><div class="links">${x.s.map(([n,i])=>link(n,i)).join('')}</div>`:''}
    ${inside.length?`<h3>Co z toho padá <span>${inside.length}</span></h3><div class="links">${inside.map(({x:y})=>link(y.n,y.i)).join('')}</div>`:''}
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
  return `<div class="dhead"><h1>${K.title}</h1><span class="cnt">${list.length===all.length?all.length+' položek':list.length+' z '+all.length}</span></div>
  <div class="dsplit">
    <section class="dlist">
      <div class="dfilters">
        <input id="dq" type="search" placeholder="Hledat…" value="${esc(st.q)}" autocomplete="off">
        <div class="frow">
          <select id="dcat"><option value="">Všechny kategorie</option>${Object.entries(cats).sort((a,b)=>cz(a[0]).localeCompare(cz(b[0]))).map(([c,n])=>`<option value="${esc(c)}" ${st.cat===c?'selected':''}>${esc(cz(c))} (${n})</option>`).join('')}</select>
          ${k==='emb'?`<select id="dspec"><option value="">Všechny classy</option>${Object.entries(SPECS).map(([s,c])=>`<option value="${s}" ${st.spec===s?'selected':''}>${c}</option>`).join('')}</select>`:''}
        </div>
        <div class="frow small">
          <label><input type="checkbox" id="dfav" ${st.fav?'checked':''}> Jen oblíbené</label>
          <span class="sort">Řadit: <button class="${st.sort==='az'?'on':''}" data-sort="az">název</button> <button class="${st.sort==='id'?'on':''}" data-sort="id">ID</button></span>
        </div>
      </div>
      <ul class="rows">${rows || `<li class="none">${st.fav?'Žádné oblíbené. Otevři položku a klikni na „Přidat do oblíbených“.':'Nic tomu neodpovídá.'}</li>`}</ul>
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
  return `<div class="dhead"><h1>Bonusy a tiery</h1><span class="cnt">${D.bonuses.length} bonusů</span></div>
  <div class="dsplit">
    <section class="dlist">
      <div class="dfilters"><input id="dq" type="search" placeholder="Hledat bonus…" value="${esc(st.q)}" autocomplete="off">
        <div class="frow small"><label><input type="checkbox" id="dfav" ${st.fav?'checked':''}> Jen oblíbené</label></div></div>
      <ul class="rows">${list.map(b=>`<li class="row ${sel&&b===sel?'on':''}" data-bsel="${esc(b.n)}"><span class="rn">${esc(b.n)}</span>${dbFav.has('bon:'+b.n)?'<span class="rstar">★</span>':''}</li>`).join('')||'<li class="none">Nic tomu neodpovídá.</li>'}</ul>
    </section>
    <section class="ddetail">${sel?`<article class="tip"><header><div><h2>${esc(sel.n)}</h2><p>Padá z ${sel.p.length} různých zdrojů</p></div>
      <button class="favbtn ${fav?'on':''}" data-dbfav="${esc('bon:'+sel.n)}">${fav?'★ V oblíbených':'☆ Přidat do oblíbených'}</button></header>
      ${pet?`<p class="tval">Na pet artefaktu: ${esc(pet.r)}</p>`:''}${pools}</article>`:'<div class="dempty">Vyber bonus vlevo.</div>'}</section>
  </div>`;
}

function classView(){
  return `<div class="dhead"><h1>Classy a skilly</h1></div>
  <div class="cls">${D.classes.map(c=>`<section>
    <h2>${img(c.i,'cimg')}${esc(c.n)}</h2>
    ${c.specs.map(sp=>`<h3>${esc(SPECS[sp]||sp)} <button class="lnk2" data-goemb="${esc(sp)}">emblemy (${D.emblems.filter(e=>(e.sp||[]).includes(sp)).length})</button></h3>
      <ul>${c.skills.filter(s=>s.spec===sp).map(s=>`<li>${img(s.i,'li')}<div><b>${esc(s.n)}</b><p>${esc(s.d||'')}</p></div></li>`).join('')}</ul>`).join('')}
  </section>`).join('')}</div>`;
}

function favView(){
  const groups=[];
  for(const k of ['items','equip','emb']){ const l=KIND[k].list().filter(x=>dbFav.has(fk(k,x))); if(l.length) groups.push(`<h3>${KIND[k].title}</h3><div class="links">${l.map(x=>`<button class="lnk" data-go="${k}|${esc(x.id)}">${img(x.i,'li')}<span>${esc(x.n)}</span></button>`).join('')}</div>`); }
  const bl=D.bonuses.filter(b=>dbFav.has('bon:'+b.n));
  if(bl.length) groups.push(`<h3>Bonusy</h3><table class="ptab"><tbody>${bl.map(b=>`<tr><td class="pn"><button class="lnk2" data-gobon="${esc(b.n)}">${esc(b.n)}</button></td><td class="ps">${b.p.map(p=>esc(p.pool)+' <b class="pm">'+esc(p.t[p.t.length-1]||'')+'</b>').join(', ')}</td></tr>`).join('')}</tbody></table>`);
  return `<div class="dhead"><h1>Oblíbené</h1></div><div class="favs">${groups.join('')||'<p class="dempty">Zatím tu nic není. Otevři libovolný item, emblem nebo bonus a klikni na „Přidat do oblíbených“.</p>'}</div>`;
}

window.DBNAV = [
  {id:'db-items',label:'Itemy'},{id:'db-equip',label:'Vybavení'},{id:'db-emb',label:'Emblemy'},
  {id:'db-bon',label:'Bonusy a tiery'},{id:'db-cls',label:'Classy a skilly'},{id:'db-fav',label:'Oblíbené'},
];

const goto = (catId, fn) => { fn(); save(); state.cat=catId; store.set('cat',catId); render(); };
window.renderDB = function(id){
  const main=$('#main'); main.className='db';
  const k={'db-items':'items','db-equip':'equip','db-emb':'emb'}[id];
  main.innerHTML = k?listView(k): id==='db-bon'?bonusView(): id==='db-cls'?classView(): favView();
  const st=S(k||'bon');
  const re=()=>{save();const l=main.querySelector('.rows'),sc=l?l.scrollTop:0;window.renderDB(id);const l2=main.querySelector('.rows');if(l2)l2.scrollTop=sc;};
  main.querySelectorAll('[data-sel]').forEach(r=>r.onclick=()=>{st.sel=r.dataset.sel;re();});
  main.querySelectorAll('[data-bsel]').forEach(r=>r.onclick=()=>{st.sel=r.dataset.bsel;re();});
  main.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{st.sort=b.dataset.sort;re();});
  main.querySelectorAll('[data-dbfav]').forEach(b=>b.onclick=()=>{const f=b.dataset.dbfav;dbFav.has(f)?dbFav.delete(f):dbFav.add(f);saveFav();re();});
  main.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const [kk,xid]=b.dataset.go.split('|');goto({items:'db-items',equip:'db-equip',emb:'db-emb'}[kk],()=>{const s=S(kk);s.sel=xid;s.q='';s.cat='';s.fav=false;s.spec='';});});
  main.querySelectorAll('[data-goemb]').forEach(b=>b.onclick=()=>goto('db-emb',()=>{const s=S('emb');s.spec=b.dataset.goemb;s.cat='';s.q='';s.fav=false;s.sel=null;}));
  main.querySelectorAll('[data-gobon]').forEach(b=>b.onclick=()=>goto('db-bon',()=>{const s=S('bon');s.sel=b.dataset.gobon;s.q='';s.fav=false;}));
  const c=$('#dcat'); if(c) c.onchange=()=>{st.cat=c.value;st.sel=null;re();};
  const sp=$('#dspec'); if(sp) sp.onchange=()=>{st.spec=sp.value;st.sel=null;re();};
  const f=$('#dfav'); if(f) f.onchange=()=>{st.fav=f.checked;re();};
  const q=$('#dq'); if(q){let t;q.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{st.q=q.value;st.sel=null;re();const n=$('#dq');n.focus();n.setSelectionRange(n.value.length,n.value.length);},160);};}
  const on=main.querySelector('.row.on'); if(on && !on._seen) on.scrollIntoView({block:'nearest'});
};
})();
