#!/usr/bin/env node
/* 三途川物語 — 戰鬥數值檢查（B 線）
   每張出征地圖：4 人隊伍（1 位主要角色＋3 位一般街坊）以推薦等級去打「3 隻雜兵 → 王」，
   照 data/jobs.js 檔尾的戰鬥公式，用期望值（不擲骰）算：要幾回合、隊伍剩多少血。
   用法：balance/run-combat.sh 或 node balance/combat.js */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ctx = { Math, console }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ["traits", "buildings", "jobs", "ranks"]) vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "data", f + ".js"), "utf8"), ctx);
const HQ = ctx.HQ;
const JOB = {}; HQ.jobs.forEach(j => (JOB[j.id] = j));

function unit(jobIds, lv) {
  // 新魂 Lv1→5，轉一階到 10，再轉二階；簡化成：前 5 級新魂、5～10 一階、之後最後一個職業
  const st = Object.assign({}, HQ.baseStats);
  for (let l = 2; l <= lv; l++) {
    const j = JOB[l <= 5 ? jobIds[0] : l <= 10 ? jobIds[1] || jobIds[0] : jobIds[jobIds.length - 1]];
    for (const a of HQ.attrs) st[a] += j.growth[a];
  }
  return { hp: st.魂力, atk: st.膽量, hits: 1 + Math.floor(st.手藝 / 30), def: st.定力, mag: st.靈力 };
}
function fight(party, foes) {
  // 回合制期望值：隊伍集火第一隻；敵人每隻每回合打隊伍（平均分攤）
  let hp = party.reduce((n, u) => n + u.hp, 0), maxHp = hp, turns = 0;
  const avgDef = party.reduce((n, u) => n + u.def, 0) / party.length;
  foes = foes.map(f => Object.assign({}, f));
  while (foes.length && hp > 0 && turns < 200) {
    turns++;
    let dmg = 0;
    for (const u of party) {
      const phys = Math.max(1, u.atk - foes[0].def / 2) * u.hits;
      const magic = u.mag > u.atk ? Math.max(1, u.mag * 1.3 - foes[0].def / 4) / 2 : 0;
      dmg += phys + magic;
    }
    foes[0].hp -= dmg;
    if (foes[0].hp <= 0) foes.shift();
    for (const f of foes) hp -= Math.max(1, f.atk - avgDef / 2);
  }
  return { turns, left: Math.max(0, Math.round(100 * hp / maxHp)), win: foes.length === 0 };
}

const LINES = [["newsoul", "sawtrainee", "sawman"], ["newsoul", "cat", "seniorcat"], ["newsoul", "shikigami", "mediapp"]];
const MAPS = [
  ["daoju", ["en-sawghost", "en-sinner", "en-sawghost"], "boss-laji", "lee"],
  ["gengyin", ["en-baizhu", "en-shushi", "en-gu"], "boss-bailaoda", "huji"],
  ["seaside", ["en-drowned", "en-drowned", "en-drowned"], "boss-tide", "dabao"],
  ["xinkujiang", ["en-raincoat", "en-raincoat", "en-raincoat"], "boss-hasshaku", "huji"],
  ["relic", ["en-relic", "en-relic", "en-relic"], "boss-eye", "lee"],
  ["demon2", ["en-narwhal", "en-rat", "en-narwhal"], "boss-leviathan", "jiuwei"],
  ["demon3", ["en-skeleton", "en-bat", "en-gu-teacher"], "boss-plague", "lee"],
  ["demon3", ["en-skeleton", "en-bat", "en-bat"], "boss-satan", "lee"],
  ["north", ["en-north", "en-north", "en-north"], "boss-evilgod", "lee"]
];
const SPECIAL = { lee: "yakiniku-master", huji: "parttimer", dabao: "photographer", jiuwei: "barrier-master" };
const E = {}; HQ.enemies.forEach(e => (E[e.id] = e));

console.log("地圖          推薦Lv  雜兵戰(回合/剩血%)   王戰(回合/剩血%)   判定");
for (const [map, mobs, boss, star] of MAPS) {
  const lv = HQ.mapLevels[map];
  for (const off of [-3, 0]) {
    const L = lv + off;
    const party = [unit(["newsoul", SPECIAL[star]], L)].concat(LINES.map(l => unit(l, L)));
    // 主要角色不是新魂出身：直接用專屬職業從 Lv1 長
    party[0] = unit([SPECIAL[star], SPECIAL[star]], L);
    const a = fight(party, mobs.map(id => E[id]));
    const b = fight(party, [E[boss]]);
    const ok = a.win && b.win ? (off < 0 ? "低 3 級也過" : "OK") : (off < 0 ? "低 3 級打不過（正常）" : "推薦等級打不過！");
    console.log((map + (off ? " (Lv" + L + ")" : "")).padEnd(16) + String(lv).padStart(4) + "    " +
      (a.turns + "/" + a.left + (a.win ? "" : "敗")).padEnd(18) + (b.turns + "/" + b.left + (b.win ? "" : "敗")).padEnd(18) + ok);
  }
}
