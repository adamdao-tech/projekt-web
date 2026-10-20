// ============================================================
//  METIN MAX ROLLS — data
//  Každá kategorie = jedna záložka v UI.
//  Nové věci přidávej jako další objekt do pole CATEGORIES.
//  color: fire | curse | lightning | magic | poison (barva bonusu)
// ============================================================
window.LAST_UPDATE = "2026-10-20 20:35";

window.CATEGORIES = [
  {
    id: "pet-artefakty",
    name: "Pet artefakty",
    name_en: "Pet artifacts",
    icon: "🐾",
    desc: "Bonusy, které se můžou rollnout na pet artefaktech, a jejich rozsah min → max.",
    desc_en: "Bonuses that can roll on pet artifacts and their min → max range.",
    note: "Mezi „Curse Damage“ a „Def Grade Bonus“ může chybět řádek (screenshoty na sebe úplně nenavazovaly).",
    note_en: "A row may be missing between “Curse Damage” and “Def Grade Bonus” (the screenshots did not fully overlap).",
    groups: [
      { id:"utok", icon:"⚔️", name:"Útok", en:"Attack" },
      { id:"cc", icon:"🌀", name:"Šance na efekt", en:"Effect chance" },
      { id:"obrana", icon:"🛡️", name:"Obrana & sustain", en:"Defense & sustain" },
      { id:"elem", icon:"✨", name:"Elementy & magie", en:"Elements & magic" },
      { id:"farm", icon:"💰", name:"Farm & utility", en:"Farm & utility" },
      { id:"strong", icon:"🎯", name:"Strong against", en:"Strong against" }
    ],
    bonuses: [
      { name: "% Chance for EXP Bonus",           min: 1,   max: 20,   unit: "%", g: "farm", ic: "📈" },
      { name: "% Chance for piercing Hits",       min: 1,   max: 10,   unit: "%", g: "utok", ic: "🏹" },
      { name: "% increased Item-Drop",            min: 1,   max: 20,   unit: "%", g: "farm", ic: "💰" },
      { name: "Armor",                            min: 10,  max: 200,  unit: "" , g: "obrana", ic: "🛡️" },
      { name: "Attack Speed",                     min: 1,   max: 10,   unit: "%", g: "utok", ic: "⚡" },
      { name: "Attack value",                     min: 10,  max: 100,  unit: "" , g: "utok", ic: "🗡️" },
      { name: "Average Damage (AVG)",             min: 1,   max: 10,   unit: "%", g: "utok", ic: "💥" },
      { name: "Average Damage Resistance",        min: 1,   max: 5,    unit: "%", g: "obrana", ic: "🔰" },
      { name: "Burn Damage",                      min: 1,   max: 20,   unit: "%", color: "fire", g: "elem", ic: "🔥" },
      { name: "Casting Speed",                    min: 1,   max: 10,   unit: "%", g: "utok", ic: "🪄" },
      { name: "Chance of critical hit",           min: 1,   max: 10,   unit: "%", g: "utok", ic: "🎯" },
      { name: "Chance to Stun",                   min: 1,   max: 3,    unit: "%", g: "cc", ic: "💫" },
      { name: "Curse Damage",                     min: 1,   max: 20,   unit: "%", color: "curse", g: "elem", ic: "☠️" },
      { name: "Def Grade Bonus",                  min: 50,  max: 300,  unit: "" , g: "obrana", ic: "🧱" },
      { name: "HP gain on hit",                   min: 1,   max: 20,   unit: "%", g: "obrana", ic: "🩸" },
      { name: "Lightning Damage",                 min: 1,   max: 20,   unit: "%", color: "lightning", g: "elem", ic: "🌩️" },
      { name: "Lightspeed Factor",                min: 1,   max: 3,    unit: "%", g: "farm", ic: "💨" },
      { name: "Magical Power",                    min: 1,   max: 20,   unit: "%", color: "magic", g: "elem", ic: "🔮" },
      { name: "Max. HP",                          min: 100, max: 3000, unit: "" , g: "obrana", ic: "❤️" },
      { name: "Max. SP",                          min: 100, max: 3000, unit: "" , g: "obrana", ic: "💙" },
      { name: "Poison Damage",                    min: 1,   max: 20,   unit: "%", color: "poison", g: "elem", ic: "🐍" },
      { name: "Poisoning chance",                 min: 1,   max: 3,    unit: "%", g: "cc", ic: "🧪" },
      { name: "Resistance against critical hits", min: 1,   max: 10,   unit: "%", g: "obrana", ic: "🎯" },
      { name: "Resistance against piercing hits", min: 1,   max: 10,   unit: "%", g: "obrana", ic: "🏹" },
      { name: "Resistance against Skill Damage",  min: 1,   max: 5,    unit: "%", g: "obrana", ic: "🌟" },
      { name: "Resistance to Monsters",           min: 1,   max: 5,    unit: "%", g: "obrana", ic: "👹" },
      { name: "Skill Damage (SD)",                min: 1,   max: 10,   unit: "%", g: "utok", ic: "🌟" },
      { name: "Skill Speed",                      min: 1,   max: 10,   unit: "%", g: "utok", ic: "⏩" },
      { name: "Slowing chance",                   min: 1,   max: 3,    unit: "%", g: "cc", ic: "🐌" },
      { name: "SP gain on hit",                   min: 1,   max: 35,   unit: "%", g: "obrana", ic: "🔷" },
      { name: "Strong against Animal",            min: 5,   max: 20,   unit: "%", g: "strong", ic: "🐺" },
      { name: "Strong against Devils",            min: 1,   max: 15,   unit: "%", g: "strong", ic: "😈" },
      { name: "Strong against Esoteric",          min: 1,   max: 15,   unit: "%", g: "strong", ic: "🔯" },
      { name: "Strong against Half Humans",       min: 1,   max: 15,   unit: "%", g: "strong", ic: "🧝" },
      { name: "Strong against Metinstones",       min: 1,   max: 20,   unit: "%", g: "strong", ic: "🪨" },
      { name: "Strong against Monsters",          min: 1,   max: 20,   unit: "%", g: "strong", ic: "👾" },
      { name: "Strong against Orcs",              min: 1,   max: 15,   unit: "%", g: "strong", ic: "👺" },
      { name: "Strong against Portals",           min: 1,   max: 30,   unit: "%", g: "strong", ic: "🌀" },
      { name: "Strong against Undead",            min: 1,   max: 15,   unit: "%", g: "strong", ic: "💀" },
      { name: "Thorns",                           min: 50,  max: 500,  unit: "" , g: "obrana", ic: "🌵" },
      { name: "Universality",                     min: 1,   max: 15,   unit: "" , g: "strong", ic: "🌐" }
    ]
  }
];

// ============================================================
//  RANKY & UPGRADY
// ============================================================
window.UPGRADES = {
  id: "ranky-upgrady",
  name: "Ranky a upgrady",
  name_en: "Ranks & upgrades",
  icon: "📈",
  maxRank: 11,
  // Ranky vybavení – per = bonus za 1 rank (v %)
  ranks: [
    { slot:"Zbraň",                 en:"Weapon",                   item:"Golden Smithing Hammer",    id:299000, img:"icons/weapon.png", per:1, affects:"Equipment attributes",    src:["Elite Portal Stone"], icon:"🔨", col:"#e8b93c" },
    { slot:"Zbroj",                 en:"Armour",                   item:"Light Blue Smithing Hammer",id:299001, img:"icons/armour.png", per:1, affects:"Equipment attributes",    src:["Elite Portal Stone"], icon:"🔨", col:"#4aa8f0" },
    { slot:"Náramek / Náušnice / Náhrdelník", en:"Bracelet / Earrings / Necklace", item:"Crimson Smithing Hammer", id:299002, img:"icons/jewelry.png", per:1, affects:"Equipment attributes", src:["Elite Portal Stone"], icon:"🔨", col:"#e0408a" },
    { slot:"Helma",                 en:"Helmet",                   item:"Helmut's Pliers",           id:299003, img:"icons/helmet.png", per:1, affects:"Equipment attributes",    src:["Elite Portal Stone"], icon:"🗜️", col:"#e8d84a" },
    { slot:"Štít",                  en:"Shield",                   item:"Hephaestus's Folio",        id:299004, img:"icons/shield.png", per:1, affects:"Equipment attributes",    src:["Elite Portal Stone"], icon:"📕", col:"#b07a4a" },
    { slot:"Boty",                  en:"Shoes",                    item:"Magical Gunpowder",         id:299005, img:"icons/shoes.png", per:1, affects:"Equipment attributes",    src:["Elite Portal Stone"], icon:"💥", col:"#c8c8a0" },
    { slot:"Opasek",                en:"Belt",                     item:"Golden Belt Buckle",        id:299006, img:"icons/belt.png", per:1, affects:"Equipment attributes",    src:["Elite Portal Stone"], icon:"🟨", col:"#e8c03c" },
    { slot:"Ring of Blessing",      en:"Blessed Ring",             item:"Red Jewel",                 id:299007, img:"icons/blessedring.png", per:1, affects:"Equipment attributes",    src:["Elite Portal Stone"], icon:"🔴", col:"#e8503c" },
    { slot:"Pet vybavení",          en:"Pet Equipment",            item:"Pet Trophy",                id:299008, img:"icons/pettrophy.png", per:1, affects:"Pet artifact attributes", src:[], icon:"🏆", col:"#c8a05a" },
    { slot:"Sigil",                 en:"Sigil",                    item:"Soulforged Hammer",         id:299009, img:"icons/sigil.png", per:1, affects:"Original attribute value",src:[], icon:"🔨", col:"#d8a838" },
    { slot:"Skill Booster",         en:"Skill Booster",            item:"Booster Folio",             id:250100, img:"icons/booster.png", per:2, affects:"Scaling percentage values", src:[], icon:"📘", col:"#5a7ae8", note:"Používá se na Crafting Benchi", note_en:"Used at the Crafting Bench" }
  ],
  // Sockety šperků – krok 1 zpermanentnit, krok 2 rankovat
  sockets: [
    { n:1, stone:{name:"Adanos's Stone",           id:500000, img:"icons/adanos1.png", src:["Monkey God's Treasure"]},
           enigma:{name:"Simple Triangle Enigma",   id:500006, img:"icons/enigma1.png", src:["Minotaurs Chest"]} },
    { n:2, stone:{name:"Adanos's Powerful Stone",  id:500001, img:"icons/adanos2.png", src:["Chest of Platun"]},
           enigma:{name:"Reinforced Triangle Enigma",id:500007, img:"icons/enigma2.png", src:["Holy Groves Chest"]} },
    { n:3, stone:{name:"Adanos's Magical Stone",   id:500002, img:"icons/adanos3.png", src:["Nalantir's Legacy"]},
           enigma:{name:"Hardened Triangle Enigma", id:500008, img:"icons/enigma3.png", src:["Valley of Gods Treasure"]} },
    { n:4, stone:{name:"Adanos's Secret Stone",    id:500003, img:"icons/adanos4.png", src:["Treasure of Thorns","Echidna's Treasure (Heroic)","Echidna's Treasure (Mythic)"]},
           enigma:{name:"Strong Triangle Enigma",   id:500009, img:"icons/enigma4.png", src:["Valley of Gods Treasure"]} },
    { n:5, stone:{name:"Adanos's Legendary Stone", id:500004, img:"icons/adanos5.png", src:["Valley of Gods Treasure"]},
           enigma:{name:"Pure Triangle Enigma",     id:500010, img:"icons/enigma5.png", src:["Frosthain Bounty Chest"]} }
  ],
  socketStoneBonus: 50,   // +50 % base ore bonus po zpermanentnění
  socketRankPer: 10,      // +10 % za rank permanentního socketu
  quality: {
    item:"Quality Enhancer", id:19300, img:"icons/quality.png", per:1, affects:"Base equipment stats", src:["Crafting"],
    steps:[ {to:1, enh:1, yang:1}, {to:2, enh:3, yang:3}, {to:3, enh:5, yang:5} ]   // yang v kk
  },
  dragonWater: { maxGrade:11, gradeName:"Exotic" },  // krok na grade N stojí N+4
  materials: [
    { name:"Fragment of Spirit Stones", type:"Spirit Stones", id:2337786, img:"icons/spiritfrag.png",
      desc:"Surovina ze spirit stonů. Na Crafting Benchi stojí 1 pokus o infekci 100 ks.",
      desc_en:"Material from spirit stones. One infection attempt at the Crafting Bench costs 100 pcs.",
      src:["Metin Stone of Spirit Stones","Galen","Metin Stone of Asprenus","Large Portal Stone","Mystical Portal Stone","Elite Portal Stone","Map of Etelascil (Normal)","Map of Etelascil (Heroic)","Map of Etelascil (Mythic)","Map of Etelascil (Deadly)"] },
    { name:"Infected Fragment of Spiritstones", type:"Infected Spirit Stones", id:2337789, img:"icons/infectedfrag.png",
      desc:"Surovina z infikovaného spirit stonu – infekce v ní přežívá.", desc_en:"Material from an infected spirit stone – the infection survives in it.", src:[] },
    { name:"Dragon Water", type:"Ring / Belt Stones", id:86286, img:"icons/dragonwater.png",
      desc:"Zvedá grade NEinfikovaného ring/belt stonu o 1.", desc_en:"Raises the grade of a NON-infected ring/belt stone by 1.", src:[] },
    { name:"Infected Dragon Water", type:"Infected Ring / Belt Stones", id:86287, img:"icons/infdragonwater.png",
      desc:"Zvedá grade INFIKOVANÉHO ring/belt stonu o 1.", desc_en:"Raises the grade of an INFECTED ring/belt stone by 1.", src:[] }
  ]
};
