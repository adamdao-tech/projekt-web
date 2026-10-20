// ============================================================
//  WIKI – návody z Nihor2 Player Guide (CZ / EN)
//  Texty jsou ve wiki/wiki-data.js (WIKI_T.cs / WIKI_T.en).
// ============================================================
(function(){
if(!window.WIKI_T) return;
const WIMG = {emblems:'wiki/emblems.webp',pets:'wiki/pets.webp',petslots:'wiki/petslots.webp',talisman:'wiki/talisman.webp',companion:'wiki/companion.webp',pettree:'wiki/pettree.webp'};
const GROUPS = [
  ['start',  t=>t.navgStart,     ['start','glo','path','cls'], '🧭'],
  ['basics', t=>t.navg.basics,   ['at300','kit','boost'],      '📘'],
  ['combat', t=>t.navg.combat,   ['emb','bld','par'],          '⚔️'],
  ['endgame',t=>t.navg.endgame,  ['maps','mnt','por'],         '🏔️'],
  ['gear',   t=>t.navg.gearGrp,  ['gear','rob'],               '🛡️'],
  ['systems',t=>t.navg.systems,  ['pet','tal','exp','pro','exa'],'⚙️'],
  ['help',   t=>t.navg.help,     ['faq'],                      '❓']
];
const L = (window.LANG==='en') ? 'en' : 'cs';

function buildAll(){
  const t=window.WIKI_T[L], s=t.s;
  const e=(x)=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const rate=(v)=>{ if(v==='-')return '<span class="wrt na">—</span>';
    const n=parseFloat(String(v)); return `<span class="wrt ${n>=8?'hi':n>=6?'md':'lo'}">${e(v)}</span>`; };
  const head=(id,title,lead)=>`<section class="sec" id="w-${id}">
    <h2>${e(title)}</h2>${lead?`<p class="lead">${e(lead)}</p>`:''}`;
  let h='';
  /* --- start --- */
  h+=head('start',t.nav.start,s.start.lead);
  h+=`<div class="note warn"><b>${e(s.start.mountT)}</b>${e(s.start.mountD)} <a href="#mnt" style="color:var(--gold)">${e(t.mountNew)}</a></div>`;
  h+=`<div class="note info"><b>${e(s.start.emptyT)}</b>${e(s.start.emptyD)}</div>`;
  h+=`<div class="g g3">
    <div class="pnl"><h4>${e(s.start.fastT)}</h4><p style="font-size:13.5px;color:var(--text-2)">${e(s.start.fastD)}</p></div>
    <div class="pnl"><h4>${e(s.start.timeT)}</h4><p style="font-size:13.5px;color:var(--text-2)">${e(s.start.timeD)}</p></div>
    <div class="pnl"><h4>${e(s.start.gearT)}</h4><p style="font-size:13.5px;color:var(--text-2)">${e(s.start.gearD)}</p></div></div></section>`;

  /* --- glossary --- */
  h+=head('glo',t.nav.glo,s.glo.lead);
  h+=`<div class="tw"><table><thead><tr><th>${e(s.glo.h1)}</th><th>${e(s.glo.h2)}</th></tr></thead><tbody>
    ${GLO.map(k=>`<tr><td class="nm">${e(GLO_T[k])}</td><td style="color:var(--text-2)">${e(s.glo.d[k])}</td></tr>`).join('')}
    </tbody></table></div></section>`;

  /* --- path --- */
  h+=head('path',t.nav.path,s.path.lead);
  h+=`<ol class="stp">${s.path.steps.map(x=>`<li><b>${e(x[0])}</b><span>${x[1]}</span></li>`).join('')}</ol>`;
  h+=`<h3>${e(s.path.routeT)}</h3><div class="route">`
    +ROUTE.map(r=>`<div class="stop"><div class="stop-lv">Lv. ${e(r.lv)}</div>
      <div><div class="stop-n">${e(r.n)}</div><div class="stop-d">${s.path.r[r.d]}</div></div></div>`).join('')
    +`</div><div class="note"><b>${e(s.path.dieT)}</b>${e(s.path.dieD)}</div></section>`;

  /* --- classes --- */
  h+=head('cls',t.nav.cls,s.cls.lead);
  h+=`<div class="tw"><table><thead><tr>
    <th>${e(s.cls.h.cls)}</th><th>${e(s.cls.h.set)}</th><th>${e(s.cls.h.mob)}</th><th>${e(s.cls.h.st)}</th>
    <th>${e(s.cls.h.metin)}</th><th>${e(s.cls.h.spd)}</th><th>${e(s.cls.h.fun)}</th><th>${e(s.cls.h.note)}</th></tr></thead><tbody>`
    +CLASSES.map(c=>`<tr><td class="nm">${e(c[0])}</td><td class="mo">${e(c[1])}</td>
      <td class="ct">${rate(c[2])}</td><td class="ct">${rate(c[3])}</td><td class="ct">${rate(c[4])}</td>
      <td class="ct">${rate(c[5])}</td><td class="ct">${rate(c[6])}</td>
      <td style="font-size:12.5px;color:var(--text-2)">${[c[7]?e(c[7]):'',c[8]?e(s.cls.n[c[8]]):''].filter(Boolean).join(' · ')||'—'}</td></tr>`).join('')
    +`</tbody></table></div><div class="note"><b>${e(s.cls.opT)}</b>${e(s.cls.opD)}</div></section>`;

  /* --- at 300 --- */
  h+=head('at300',t.nav.at300,s.at300.lead);
  h+=`<div class="g g2"><div class="pnl"><h4>${e(s.at300.unlockT)}</h4><ul class="lst">${s.at300.unlock.map(x=>`<li>${e(x)}</li>`).join('')}</ul></div>
    <div class="pnl"><h4>${e(s.at300.dropT)}</h4><ul class="lst"><li>Shards</li><li>Energy Fragments</li><li>Stones</li><li>Dungeon Keys</li><li>Soul Stone+</li><li>${e(s.at300.pity)}</li></ul></div></div>`;
  h+=`<div class="note"><b>${e(s.at300.fisherT)}</b>${e(s.at300.fisherD)}</div>`;
  h+=`<h3>${e(s.at300.farmT)}</h3><ul class="lst">${s.at300.farm.map(x=>`<li>${x}</li>`).join('')}</ul></section>`;

  /* --- kit --- */
  h+=head('kit',t.nav.kit,s.kit.lead);
  h+=`<div class="g g2">
    <div class="pnl"><h4>${e(s.kit.utilT)}</h4><ul class="lst">
      <li>Gold Medal<em>+9</em></li><li>Violet Potion<em>+9</em></li><li>Thief's Gloves<em>+9</em></li>
      <li>Green Potion<em>+9</em></li><li>Dew of Haste<em>+9</em></li><li>Dew of Experience<em>+9</em></li>
      <li>Blue / Yellow / Red Dew<em>+9</em></li></ul></div>
    <div class="pnl"><h4>${e(s.kit.gearT)}</h4><ul class="lst">
      <li>Lv. 80 Gear<em>+0 Soul Crystal</em></li><li>Lv. 80 Weapon<em>${e(s.kit.setbonus)}</em></li>
      <li>Lv. 80 Armor<em>+0</em></li><li>Leather Belt<em>+0</em></li>
      <li>Spirit Stones<em>+12</em></li><li>${e(s.kit.emb6)}<em>${e(s.kit.anyroll)}</em></li></ul></div></div>`;
  h+=`<div class="note"><b>${e(s.kit.bigT)}</b>${s.kit.bigD}</div>`;
  h+=`<h3>${e(s.kit.switchT)}</h3><ul class="lst">${s.kit.sw.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  h+=`<h3>${e(s.kit.autoT)}</h3><ol class="stp">${s.kit.auto.map(x=>`<li><b>${e(x[0])}</b><span>${e(x[1])}</span></li>`).join('')}</ol>`;
  h+=`<h3>${e(s.kit.stoneT)}</h3><div class="note info"><b>${e(s.kit.freeT)}</b>${e(s.kit.freeD)}</div>
    <div class="g g2"><div class="pnl"><h4>${e(s.kit.offT)}</h4><ul class="lst">
    <li>Spirit Stone of Monsters</li><li>Spirit Stone of Deathblow</li><li>Spirit Stone of Cast Speed</li><li>Spirit Stone of Penetration</li></ul></div>
    <div class="pnl"><h4>${e(s.kit.defT)}</h4><ul class="lst">
    <li>Stone of Evasion</li><li>Stone of Dodging</li><li>Stone of Haste</li><li>TP / SP on Hit</li></ul></div></div>`;
  h+=`<h3>${e(s.kit.dgT)}</h3><div class="tw"><table><thead><tr><th>${e(s.kit.dgH1)}</th><th>${e(s.kit.dgH2)}</th></tr></thead><tbody>
    <tr><td class="nm">Razador &amp; Nemere</td><td class="mo">Devils + Esoteric</td></tr>
    <tr><td class="nm">Blue Death</td><td class="mo">Devils + Undead</td></tr>
    <tr><td class="nm">Jotun Thrym</td><td class="mo">Undead + Orc</td></tr></tbody></table></div></section>`;

  /* --- booster --- */
  h+=head('boost',t.nav.boost,s.boost.lead);
  h+=`<div class="note warn"><b>${e(s.boost.prioT)}</b>${e(s.boost.prioD)}</div>`;
  h+=`<div class="note info"><b>${e(t.add.boostNameT)}</b>${t.add.boostNameD}</div>`;
  h+=`<h3>${e(s.boost.ladderT)}</h3><p class="lead">${e(s.boost.ladderD)}</p>
    <div class="chips">${BOOST.map(b=>`<span class="chip${b[1]?' k':''}">${e(b[0])}${b[1]?`<em>${e(s.boost[b[1]])}</em>`:''}</span>`).join('')}</div>`;
  h+=`<div class="note"><b>${e(s.boost.whichT)}</b>${e(s.boost.whichD)}</div></section>`;

  /* --- emblems --- */
  h+=head('emb',t.nav.emb,s.emb.lead);
  h+=`<figure class="fig"><img src="${WIMG.emblems}" alt="" loading="lazy"><figcaption>${e(s.emb.cap)}</figcaption></figure>`;
  h+=`<div class="g g3">
    <div class="pnl"><h4>${e(s.emb.q1)}</h4><p style="font-size:13.4px;color:var(--text-2)">${e(s.emb.a1)}</p></div>
    <div class="pnl"><h4>${e(s.emb.q2)}</h4><p style="font-size:13.4px;color:var(--text-2)">${e(s.emb.a2)}</p></div>
    <div class="pnl"><h4>${e(s.emb.q3)}</h4><p style="font-size:13.4px;color:var(--text-2)">${e(s.emb.a3)}</p></div></div>`;
  h+=`<div class="note ok"><b>${e(t.add.spiritT)}</b>${t.add.spiritD}</div></section>`;

  /* --- builds --- */
  h+=head('bld',t.nav.bld,s.bld.lead);
  h+=`<div class="blds">${BUILDS.map(b=>`<div class="bld">
    <div class="bld-c">${e(b.c)}</div><div class="bld-n">${e(b.n)}</div>
    <ul class="emb">${b.e.map(x=>`<li>${e(x)}</li>`).join('')}</ul>
    ${b.x?`<div class="bld-x">${e(s.bld.x[b.x])}</div>`:''}</div>`).join('')}</div></section>`;

  /* --- paragon --- */
  h+=head('par',t.nav.par,s.par.lead);
  h+=`<div class="gts">${GATES.map(g=>`<div class="gt"><div class="gt-p">${e(g[0])}</div>
    <div><div class="gt-t">${e(g[1])}</div><div class="gt-d">${e(s.par.g[g[2]])}</div></div></div>`).join('')}</div>`;
  h+=`<h3>${e(s.par.lvlT)}</h3><div class="tw"><table><thead><tr><th>${e(s.par.rangeH)}</th><th>${e(s.par.methH)}</th></tr></thead><tbody>
    <tr><td class="nm mo">→ P500</td><td>Zodiac Desert</td></tr>
    <tr><td class="nm mo">P500 — P1000</td><td>${e(s.par.m1)}</td></tr>
    <tr><td class="nm mo">P1000 — P1500</td><td>${e(s.par.m2)}</td></tr>
    <tr><td class="nm mo">P1500+</td><td>${e(s.par.m3)}</td></tr>
    <tr><td class="nm mo">P1700 — P2000</td><td>${e(s.par.m4)}</td></tr></tbody></table></div>`;
  h+=`<h3>${e(s.gear.milesT)}</h3><div class="chips">${PMILES.map(p=>`<span class="chip${p>=1000?' k':''}">P${p}+</span>`).join('')}</div>`;
  h+=`<div class="note warn"><b>${e(s.par.gearT)}</b>${e(s.par.gearD)}</div></section>`;

  /* --- maps --- */
  h+=head('maps',t.nav.maps,s.maps.lead);
  h+=`<h3>${e(s.maps.levelT)}</h3><div class="chips">${MAPS_LEVEL.map(m=>`<span class="chip">${e(m)}</span>`).join('')}</div>`;
  h+=`<h3>${e(s.maps.colonyT)}</h3><p class="lead">${e(s.maps.colonyD)}</p>
    <div class="chips">${MAPS_COLONY.map(m=>`<span class="chip k">${e(m)}</span>`).join('')}</div>`;
  h+=`<h3>${e(s.maps.lateT)}</h3><p class="lead">${e(s.maps.lateD)}</p>
    <div class="chips">${MAPS_LATE.map(m=>`<span class="chip">${e(m)}</span>`).join('')}</div>`;
  h+=`<div class="note gap"><b>${e(t.add.undocT)}</b>${t.add.undocD}</div>
    <p style="font-size:12.5px;color:var(--muted)">${e(s.maps.note)}</p></section>`;

  /* --- mount companion --- */
  h+=head('mnt',t.nav.mnt,s.mnt.lead);
  h+=`<figure class="fig"><img src="${WIMG.companion}" alt="" loading="lazy"><figcaption>${e(s.mnt.cap)}</figcaption></figure>`;
  h+=`<div class="g g3">
    <div class="pnl"><h4>${e(s.mnt.costT)}</h4><p style="font-size:13.4px;color:var(--text-2)">${e(s.mnt.costD)}</p></div>
    <div class="pnl"><h4>${e(s.mnt.capT)}</h4><p style="font-size:13.4px;color:var(--text-2)">${e(s.mnt.capD)}</p></div>
    <div class="pnl"><h4>${e(s.mnt.calledT)}</h4><p style="font-size:13.4px;color:var(--text-2)">${e(s.mnt.calledD)}</p></div></div>`;
  h+=`<div class="note ok"><b>${e(t.add.serumT)}</b>${t.add.serumD}</div>`;
  h+=`<h3>${e(s.mnt.attrT)}</h3><div class="tw"><table><thead><tr>
    <th>${e(s.mnt.aH1)}</th><th>${e(s.mnt.aH2)}</th><th>${e(s.mnt.aH3)}</th><th>${e(s.mnt.aH4)}</th></tr></thead><tbody>
    ${MATTR.map(a=>`<tr><td class="nm">${e(a[0])}</td><td class="mo">${e(a[1])}</td>
    <td class="mo" style="color:var(--text)">${e(a[2])}</td><td class="mo">${e(a[3])}</td></tr>`).join('')}
    </tbody></table></div>`;
  h+=`<div class="note info"><b>${e(s.mnt.loyalT)}</b>${s.mnt.loyalD}</div>`;
  h+=`<h3>${e(s.mnt.slotT)}</h3><p class="lead">${e(s.mnt.slotD)}</p>
    <div class="tw"><table><thead><tr><th>${e(s.mnt.sH1)}</th><th>${e(s.mnt.sH2)}</th></tr></thead><tbody>
    ${MSLOT.map(x=>`<tr><td class="nm">${e(x[0])}</td><td class="mo">${x[1]?('Lv. '+x[1]):e(s.mnt.unlockStart)}</td></tr>`).join('')}
    </tbody></table></div>`;
  h+=`<div class="note ok"><b>${e(s.mnt.whyT)}</b>${e(s.mnt.whyD)}</div>
    <div class="note"><b>${e(s.mnt.tipT)}</b>${e(s.mnt.tipD)}</div></section>`;

  /* --- portals --- */
  h+=head('por',t.nav.por,s.por.lead);
  h+=`<div class="g g3">${PORTALS.map(p=>`<div class="pnl"><h4>${e(p[0])} · ${e(p[1])}</h4>
    <p style="font-size:13.3px;color:var(--text-2)">${e(s.por.p[p[2]])}</p></div>`).join('')}</div>`;
  h+=`<div class="note"><b>${e(s.por.seT)}</b>${s.por.seD}</div>`;
  h+=`<h3>${e(s.por.giveT)}</h3><div class="g g2"><div class="pnl"><ul class="lst">${s.por.give1.map(x=>`<li>${x}</li>`).join('')}</ul></div>
    <div class="pnl"><ul class="lst">${s.por.give2.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`;
  h+=`<div class="note warn"><b>${e(s.por.hardT)}</b>${s.por.hardD}</div></section>`;

  /* --- gear --- */
  h+=head('gear',t.nav.gear,s.gear.lead);
  h+=`<div class="g g3">
    <div class="pnl"><h4>${e(s.gear.wT)}</h4><ol class="lad">${LADDER.w.map(x=>`<li>${e(x)}</li>`).join('')}</ol></div>
    <div class="pnl"><h4>${e(s.gear.aT)}</h4><ol class="lad">${LADDER.a.map(x=>`<li>${e(x)}</li>`).join('')}</ol></div>
    <div class="pnl"><h4>${e(s.gear.setT)}</h4><ol class="lad">${LADDER.set.map(x=>`<li>${e(x)}</li>`).join('')}</ol></div></div>`;
  h+=`<div class="g g3" style="margin-top:13px">
    <div class="pnl"><h4>${e(s.gear.jT)}</h4><ol class="lad">${LADDER.j.map(x=>`<li>${e(x)}</li>`).join('')}</ol></div>
    <div class="pnl"><h4>${e(s.gear.bT)}</h4><ol class="lad">${LADDER.b.map(x=>`<li>${e(x)}</li>`).join('')}</ol></div>
    <div class="pnl"><h4>${e(s.gear.sT)}</h4><ol class="lad">${LADDER.s.map(x=>`<li>${e(x)}</li>`).join('')}</ol></div></div>`;
  h+=`<div class="note info"><b>${e(s.gear.exoT)}</b>${s.gear.exoD}</div>`;
  h+=`<div class="note ok"><b>${e(s.gear.orderT)}</b>${e(s.gear.orderD)}</div></section>`;

  /* --- ring of blessing --- */
  h+=head('rob',t.nav.rob,s.rob.lead);
  h+=`<h3>${e(s.rob.ladderT)}</h3><p class="lead">${e(s.rob.ladderD)}</p>
    <div class="chips">${ROB.map(r=>`<span class="chip${(r==='100%'||r==='Exotic')?' k':''}">${e(r)}</span>`).join('')}</div>`;
  h+=`<h3>${e(s.rob.dexT)}</h3><p class="lead">${e(s.rob.dexD)}</p>
    <div class="tw"><table><thead><tr><th>${e(s.rob.dH1)}</th><th>${e(s.rob.dH2)}</th></tr></thead><tbody>
    ${DEXS.map(d=>`<tr><td class="nm">${e(d[0])}</td><td class="mo">${e(d[1])}</td></tr>`).join('')}
    </tbody></table></div>`;
  h+=`<div class="note info"><b>&nbsp;</b>${e(s.rob.dexNote)}</div>
    <p style="font-size:13px;color:var(--muted)">${e(s.rob.curseNote)}</p></section>`;

  /* --- pets --- */
  h+=head('pet',t.nav.pet,s.pet.lead);
  h+=`<div class="figrow">
    <figure class="fig"><img src="${WIMG.pets}" alt="" loading="lazy"><figcaption>${e(s.pet.cap1)}</figcaption></figure>
    <figure class="fig"><img src="${WIMG.petslots}" alt="" loading="lazy"><figcaption>${e(s.pet.cap2)}</figcaption></figure></div>`;
  h+=`<h3>${e(s.pet.statT)}</h3><div class="g g2">
    <div class="tw" style="margin:0"><table style="min-width:0"><thead><tr><th>${e(s.pet.sH1)}</th><th>${e(s.pet.sH2)}</th></tr></thead><tbody>
    ${PETSTAT.map(p=>`<tr><td class="nm">${e(p[0])}</td><td class="mo">${e(p[1])}</td></tr>`).join('')}</tbody></table></div>
    <div class="tw" style="margin:0"><table style="min-width:0"><thead><tr><th>${e(s.pet.cH1)}</th><th>${e(s.pet.cH2)}</th></tr></thead><tbody>
    ${PETCLASS.map(p=>`<tr><td class="nm">${e(p[0])}</td><td class="mo">${e(p[1])}</td></tr>`).join('')}</tbody></table></div></div>`;
  h+=`<div class="note info"><b>${e(s.pet.rollT)}</b>${s.pet.rollD}</div>`;
  h+=`<h3>${e(s.pet.goodT)}</h3><div class="sts">
    <div class="st"><div class="st-k">Portal · Crit · Yang</div><div class="st-v">50%+</div></div>
    <div class="st"><div class="st-k">Average · Skill · Monster</div><div class="st-v">40%+</div></div>
    <div class="st"><div class="st-k">Magic · Curse · Thunder</div><div class="st-v">15%+</div></div>
    <div class="st"><div class="st-k">Specific Skill · Crit Dmg</div><div class="st-v">10%+</div></div></div>`;
  h+=`<h3>${e(s.pet.treeT)}</h3><div class="note warn"><b>${e(s.pet.cycT)}</b>${e(s.pet.cycD)}</div>
    <figure class="fig"><img src="${WIMG.pettree}" alt="" loading="lazy"><figcaption>${e(s.pet.cap3)}</figcaption></figure>`;
  h+=`<div class="g g2"><div class="pnl"><h4>${e(s.pet.openT)}</h4>
    <p class="mono" style="line-height:1.95">1× Pet Soul Link<br>→ 1× Dexterity Bond<br>→ 1× Combat Focus<br>→ 1× Phantom Cuts<br>→ 1× Executioner's Edge<br>→ 5× Killing Instinct</p></div>
    <div class="pnl"><h4>${e(s.pet.maxT)}</h4>
    <p class="mono" style="line-height:1.95">Pet Soul Link<br>→ Combat Focus<br>→ Strength Bond<br>→ Intelligence Bond<br>→ Ultimate Bond<br>→ Divine Bond</p></div></div></section>`;

  /* --- talismans --- */
  h+=head('tal',t.nav.tal,s.tal.lead);
  h+=`<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">
    <figure class="fig sm"><img src="${WIMG.talisman}" alt="" loading="lazy"><figcaption>${e(s.tal.cap)}</figcaption></figure>
    <div style="flex:1;min-width:270px"><div class="tw"><table><thead><tr><th>${e(s.tal.h1)}</th><th>${e(s.tal.h2)}</th><th>${e(s.tal.h3)}</th></tr></thead><tbody>
    ${TALIS.map(x=>`<tr><td class="nm">${e(x[0])}</td><td class="mo">${e(x[1])}</td><td class="mo">${e(x[2])}</td></tr>`).join('')}
    </tbody></table></div></div></div>`;
  h+=`<ul class="lst">${s.tal.facts.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  h+=`<div class="note warn"><b>${e(s.tal.coreT)}</b>${s.tal.coreD}</div>
    <div class="note ok"><b>${e(s.tal.adviceT)}</b>${e(s.tal.adviceD)}</div></section>`;

  /* --- expeditions --- */
  h+=head('exp',t.nav.exp,s.exp.lead);
  h+=`<ol class="stp">${s.exp.steps.map(x=>`<li><b>${e(x[0])}</b><span>${x[1]}</span></li>`).join('')}</ol>`;
  h+=`<h3>${e(s.exp.perkT)}</h3><div class="tw"><table><thead><tr><th>${e(s.exp.pH1)}</th><th>${e(s.exp.pH2)}</th></tr></thead><tbody>
    ${['swift','mighty','lucky','shadow','sage','divine','phoenix'].map(k=>
    `<tr><td class="nm">${e(s.exp.perkN[k])}</td><td style="color:var(--text-2)">${e(s.exp.perkD[k])}</td></tr>`).join('')}</tbody></table></div>`;
  h+=`<h3>${e(s.exp.setT)}</h3><div class="tw"><table><thead><tr><th>${e(s.exp.sH1)}</th><th>${e(s.exp.sH2)}</th><th>${e(s.exp.sH3)}</th><th>${e(s.exp.sH4)}</th></tr></thead><tbody>
    ${SETTLERS.map(x=>`<tr><td class="mo">${e(s.exp.tier[x[0].toLowerCase()])}</td>
    <td class="nm">${e(x[1])}</td><td class="mo">${x[2]==='—'?'—':e(s.exp.perkN[x[2].toLowerCase()])}</td><td class="mo">${x[3]}</td></tr>`).join('')}</tbody></table></div>`;
  h+=`<div class="note info"><b>${e(s.exp.ruleT)}</b>${s.exp.ruleD}</div></section>`;

  /* --- prophecies --- */
  h+=head('pro',t.nav.pro,s.pro.lead);
  h+=`<div class="tw"><table><thead><tr><th>${e(s.pro.h1)}</th><th>${e(s.pro.h2)}</th></tr></thead><tbody>
    ${PROPH.map(k=>`<tr><td class="nm">${e(s.pro.n[k])}</td><td style="color:var(--text-2)">${e(s.pro.d[k])}</td></tr>`).join('')}</tbody></table></div>
    <p style="font-size:12.8px;color:var(--muted)">${e(s.pro.more)}</p></section>`;

  /* --- exalted --- */
  h+=head('exa',t.nav.exa,s.exa.lead);
  h+=`<div class="g g4">${ORBS.map(k=>`<div class="pnl"><h4>${e(s.exa.orbN[k])}</h4>
    <p style="font-size:13px;color:var(--text-2)">${e(s.exa.orbD[k])}</p></div>`).join('')}</div>`;
  h+=`<p style="font-size:13.3px;color:var(--text-2);margin-top:14px">${s.exa.greater}</p>`;
  h+=`<h3>${e(s.exa.wfT)}</h3><div class="note gap"><b>${e(s.exa.unconfT)}</b>${e(s.exa.unconfD)}</div>
    <ol class="stp">${s.exa.wf.map(x=>`<li><b>${e(x[0])}</b><span>${e(x[1])}</span></li>`).join('')}</ol>`;
  h+=`<h3>${e(s.exa.newT)}</h3><div class="tgs">
    <span class="tg n">Portal Damage</span><span class="tg n">Magic Power</span><span class="tg n">Strong vs. Bosses</span>
    <span class="tg n">Crit Chance</span><span class="tg n">Crit Damage</span><span class="tg n">Burn Damage</span>
    <span class="tg n">Curse Damage</span><span class="tg c">Ignore % Resistances</span></div>
    <div class="note ok"><b>${e(s.exa.ignT)}</b>${e(s.exa.ignD)}</div>
    <div class="note warn"><b>${e(s.exa.expectT)}</b>${e(s.exa.expectD)}</div></section>`;

  /* --- faq --- */
  h+=head('faq',t.nav.faq,s.faq.lead);
  h+=`<div class="g g2">${s.faq.q.map(x=>`<div class="pnl"><h4>${e(x[0])}</h4>
    <p style="font-size:13.4px;color:var(--text-2)">${x[1]}</p></div>`).join('')}</div>`;
  h+=`<div class="foot"><b>${e(s.faq.srcT)}</b> ${e(s.faq.srcD)}<br><b>${e(s.faq.updT)}</b> 10.08.2026</div></section>`;

  const out={};
  h.replace(/<section class="sec" id="w-([a-z0-9]+)">[\s\S]*?<\/section>/g,(m,id)=>{out[id]=m;return m;});
  return out;
}
let cache=null;
const secs=()=>cache||(cache=buildAll());
const groupOf = id => GROUPS.find(g=>g[2].includes(id));

window.WIKINAV = GROUPS.map(g=>({id:'wiki-'+g[0], label:g[1](window.WIKI_T[L]), icon:g[3]}));

window.renderWiki = function(navId, jump){
  const g = GROUPS.find(x=>'wiki-'+x[0]===navId) || GROUPS[0];
  const t = window.WIKI_T[L], S = secs();
  const main = document.getElementById('main'); main.className='wiki';
  const sub = L==='en' ? 'Guide to Nihor2 · Chronicles of Jinteia. Pick a topic below.' : 'Návod k Nihor2 · Chronicles of Jinteia. Vyber si téma níže.';
  main.innerHTML = `<div class="title"><h1>${g[3]} ${esc(g[1](t))}</h1></div><p class="desc">${sub}</p>`
    + (g[2].length>1 ? `<div class="toolbar">${g[2].map(id=>`<button class="chip" data-wj="${id}">${esc(t.nav[id])}</button>`).join('')}</div>` : '')
    + `<div class="wbody">${g[2].map(id=>S[id]||'').join('')}</div>`;
  const go = id => { const el=document.getElementById('w-'+id); if(el) main.scrollTop = el.offsetTop - main.offsetTop - 10; };
  main.querySelectorAll('[data-wj]').forEach(b=>b.onclick=()=>go(b.dataset.wj));
  main.querySelectorAll('.wbody a[href^="#"]').forEach(a=>a.onclick=ev=>{
    ev.preventDefault(); const id=a.getAttribute('href').slice(1); const tg=groupOf(id); if(!tg) return;
    if('wiki-'+tg[0]===navId) return go(id);
    state.cat='wiki-'+tg[0]; store.set('cat',state.cat); render(); window.renderWiki(state.cat, id);
  });
  if(jump) go(jump); else main.scrollTop=0;
};
})();
