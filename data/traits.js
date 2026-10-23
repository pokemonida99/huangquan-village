/* 三途川物語 — 街區特徵、亡魂心願（B 線）
   特徵點數 = 地圖上所有建築 traits × 等級係數（見 HQ.balance.traitLvMul）加總。
   角色入住、委託、稱號、觀音評定都看這些點數。 */
window.HQ = window.HQ || {};

// 介面約定固定的十種特徵；魔氣是負面特徵（太高會觸發魔氣暴走、降人氣）
HQ.traits = ["美味", "思念", "緣分", "儀容", "藝術", "娛樂", "安心", "香火", "秩序", "魔氣"];

HQ.traitInfo = {
  美味: { icon: "🍖", desc: "吃得好，亡魂才走得開心。" },
  思念: { icon: "📷", desc: "托夢、照片、信——給還放不下的人。" },
  緣分: { icon: "🧵", desc: "紅線與文印。月老最在意的數字。" },
  儀容: { icon: "✂️", desc: "頭七前整理好儀容，體面地去見家人。" },
  藝術: { icon: "🎨", desc: "畫畫、漫畫、雕刻；守宮廣場一帶的氣氛。" },
  娛樂: { icon: "🏮", desc: "夜市、祭典、扭蛋。" },
  安心: { icon: "🐾", desc: "慰靈犬、結界、躺椅。亡魂安心度上升更快。" },
  香火: { icon: "🪔", desc: "陽間的香火與供品，月老廟一帶最旺。" },
  秩序: { icon: "📜", desc: "市役所與巡守；抵銷魔氣。" },
  魔氣: { icon: "🌀", desc: "負面。超過秩序＋安心的一半時，每月可能魔氣暴走。", negative: true }
};

// 亡魂心願（泡泡圖示）。weight＝出現機率權重；unlock 跟建築相同寫法，條件未達不會出現。
// C 線的委託 need、A 線的泡泡都用這份 id。
HQ.wishes = [
  { id: "eat",         name: "想吃點東西",   icon: "🍖", weight: 30, unlock: { start: true } },
  { id: "rest",        name: "想歇歇腳",   icon: "🛏️", weight: 20, unlock: { start: true } },
  { id: "shop",        name: "想逛逛",     icon: "🛍️", weight: 14, unlock: { start: true } },
  { id: "tattoo",      name: "想求文印",   icon: "🧵", weight: 10, unlock: { start: true } },
  { id: "prayer",      name: "想上炷香",   icon: "🪔", weight: 8,  unlock: { start: true } },
  { id: "dream",       name: "想托夢",     icon: "📷", weight: 16, unlock: { resident: "dabao" } },
  { id: "hair",        name: "想整理儀容", icon: "✂️", weight: 14, unlock: { resident: "baimei" } },
  { id: "sweets",      name: "想吃甜點",   icon: "🍮", weight: 14, unlock: { resident: "no7" } },
  { id: "art",         name: "想畫畫",     icon: "🎨", weight: 8,  unlock: { helped: 15 } },
  { id: "fun",         name: "想熱鬧一下", icon: "🏮", weight: 8,  unlock: { rank: 1 } },
  { id: "heal",        name: "掛念心痛",   icon: "💔", weight: 5,  unlock: { resident: "huatuo" } },
  { id: "gear",        name: "想要裝備",   icon: "🗡️", weight: 0,  unlock: { start: true }, residentOnly: true },
  // 投胎不是隨機心願：亡魂安心度滿、其他心願都完成後才會出現（要有黃泉燒肉店的遺願馬卡龍）
  { id: "reincarnate", name: "想投胎了",   icon: "🍥", weight: 0,  unlock: { resident: "lee" }, final: true }
];

// 稱號（DV2 的 3 月第 4 週稱號評鑑；這裡每年 12 月年度評定一起頒）
// cond：特徵點數門檻；reward：一次性獎勵
HQ.honors = [
  { id: "h-yakiniku", name: "燒肉一條街",   cond: { traits: { 美味: 120 } },                 reward: { merit: 50, popularity: 50 } },
  { id: "h-redline",  name: "紅線滿天",     cond: { traits: { 緣分: 150 } },                 reward: { merit: 80, popularity: 60 } },
  { id: "h-memory",   name: "思念之街",     cond: { traits: { 思念: 120 } },                 reward: { merit: 60, popularity: 50 } },
  { id: "h-neat",     name: "頭七也要體面", cond: { traits: { 儀容: 100 } },                 reward: { merit: 50, popularity: 40 } },
  { id: "h-art",      name: "守宮畫派",     cond: { traits: { 藝術: 120 } },                 reward: { merit: 60, popularity: 50 } },
  { id: "h-fest",     name: "不夜三途川",   cond: { traits: { 娛樂: 150 } },                 reward: { merit: 60, popularity: 80 } },
  { id: "h-safe",     name: "安心的河岸",   cond: { traits: { 安心: 150 }, maxTraits: { 魔氣: 20 } }, reward: { merit: 80, popularity: 60 } },
  { id: "h-incense",  name: "香火鼎盛",     cond: { traits: { 香火: 120 } },                 reward: { merit: 100, popularity: 40 } },
  { id: "h-order",    name: "模範行政區",   cond: { traits: { 秩序: 120 } },                 reward: { merit: 60, popularity: 40 } },
  { id: "h-all",      name: "彼岸街",       cond: { traits: { 美味: 200, 思念: 200, 緣分: 200, 安心: 200 } }, reward: { merit: 300, popularity: 200, medals: 1 } }
];
