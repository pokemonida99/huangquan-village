#!/usr/bin/env node
/* 三途川物語 — 經濟模擬器（B 線）
   直接載入 data/*.js，照 HQ.balance／HQ.review 的公式，以週為單位跑前 N 年。
   用法：node balance/sim.js [--years 3] [--seeds 20] [--seed 1 --verbose] [--json]
   找不到 node 時：balance/run.sh 會用 ChatGPT／codex 內建的 node。 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* ───────── 參數 ───────── */
const argv = process.argv.slice(2);
function arg(name, def) { const i = argv.indexOf("--" + name); return i < 0 ? def : (argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true); }
const YEARS = +arg("years", 3);
const SEEDS = +arg("seeds", 20);
const ONE_SEED = arg("seed", null);
const VERBOSE = !!arg("verbose", false);
const JSON_OUT = !!arg("json", false);
// --variant normal | lazy（不升級、不辦活動、不轉職）| greedy（蓋房子不留預備金）| nocombo（不湊緣分組合）
const VARIANT = arg("variant", "normal");

/* ───────── 載入資料 ───────── */
const ROOT = path.join(__dirname, "..");
const ctx = { Math, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["traits", "buildings", "jobs", "ranks", "chars", "requests", "maps"]) {
  if (!fs.existsSync(path.join(ROOT, "data", f + ".js"))) continue;
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data", f + ".js"), "utf8"), ctx, { filename: f + ".js" });
}
const HQ = ctx.HQ;
const BAL = HQ.balance;
const BY = {}; HQ.buildings.forEach(b => (BY[b.id] = b));

/* ───────── 入住：有 data/chars.js 就照 C 線的 movein 條件，沒有就用企劃書第 11 節的估計 ─────────
   模擬裡無法判斷的條件：request（完成某委託）→ 當作完成 8 件委託後成立；flag → 不成立；month → 外賓，不算。 */
const FALLBACK_MOVEIN = [
  { id: "yuelao", movein: { order: 1 } }, { id: "mimi", movein: { popularity: 40 } }, { id: "heitang", movein: { popularity: 80 } },
  { id: "lee", movein: { popularity: 130, helped: 8 } }, { id: "xiaoyu", movein: { resident: "lee", popularity: 180 } },
  { id: "dabao", movein: { popularity: 250, traits: { 思念: 10 } } }, { id: "baimei", movein: { popularity: 320 } },
  { id: "xiaomi", movein: { popularity: 450 } }, { id: "huji", movein: { popularity: 550 } },
  { id: "no7", movein: { popularity: 650, traits: { 美味: 40 } } }, { id: "jiuwei", movein: { popularity: 850 } },
  { id: "paofu", movein: { popularity: 1100 } }, { id: "du", movein: { helped: 200, traits: { 緣分: 40 } } },
  { id: "huatuo", movein: { popularity: 1400 } }, { id: "gongwan", movein: { popularity: 1700 } }, { id: "cat918", movein: { popularity: 2000 } }
];
const MOVEIN = (HQ.chars && HQ.chars.length ? HQ.chars.filter(c => c.kind === "resident" && !c.start && c.movein) : FALLBACK_MOVEIN)
  .map(c => ({ id: c.id, m: c.movein }));
function moveinOk(m, s) {
  if (m.month != null || m.flag) return false;
  if (m.order != null && MOVEIN.some(o => o.m.order != null && o.m.order < m.order && !s.has(o.id))) return false;
  if (m.popularity != null && s.pop < m.popularity) return false;
  if (m.rank != null && s.star < m.rank) return false;
  if (m.helped != null && s.helped < m.helped) return false;
  if (m.resident && !s.has(m.resident)) return false;
  if (m.building && !s.blds.some(x => x.id === m.building)) return false;
  if (m.map && !s.milestones["boss:" + m.map]) return false;
  if (m.request && s.reqDone < 8) return false;
  for (const t in m.traits || {}) if ((s.traits[t] || 0) < m.traits[t]) return false;
  return true;
}
// 委託：有 data/requests.js 就用它的件數與平均功德；模擬假設第 2 個月起每月完成 1 件
const REQS = HQ.requests && HQ.requests.length ? HQ.requests : null;
const REQUESTS_TOTAL = REQS ? REQS.length : 30;
const REQ_MERIT = REQS ? Math.round(REQS.reduce((n, r) => n + ((r.reward && r.reward.merit) || 0), 0) / REQS.length) : 50;
const REQ_HELPED = REQS ? REQS.reduce((n, r) => n + ((r.reward && r.reward.helped) || 0), 0) / REQS.length : 1;
const CAT_CHARS = ["mimi", "gongwan", "cat918"];

/* ───────── 建造順序（一般玩家：先吃住、再名店、再裝飾與重複的店） ───────── */
const PLAN = [
  "fries", "teahouse", "tattoo", "inn", "lantern", "incense", "paper", "catstop", "house", "dogpark",
  "costume", "flower", "lantern", "yakiniku", "higanbana", "house", "bench", "temple", "fries",
  "photo", "salon", "gecko", "house", "mala", "nightstall", "garden", "mengpo", "house", "swing",
  "teahouse", "barrier", "inn", "house", "tower", "manga", "clinic", "festival", "sawhall", "tattoo2",
  "shrine", "nightstall", "higanbana", "tower", "garden", "sushi", "mala", "tower", "yimin", "flower",
  "bench", "nightstall", "fries", "tower", "garden", "teahouse", "lantern", "lantern", "swing", "tower",
  "incense", "costume", "mala", "garden", "tower", "nightstall", "tower"
];

/* ───────── 小工具 ───────── */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const L = BAL.lv;
const lvPrice   = (b, lv) => b.price * (1 + L.price * (lv - 1));
const lvQuality = (b, lv) => b.quality * (1 + L.quality * (lv - 1));
const lvAppeal  = (b, lv) => b.appeal * (1 + L.appeal * (lv - 1));
const lvUpkeep  = (b, lv) => b.upkeep * (1 + L.upkeep * (lv - 1));
const upCost    = (b, lv) => (b.upgradeCost ? b.upgradeCost[lv] : Math.round(b.cost * L.upgradeCost * lv));
const isShop = b => b.cat === "shop" || b.cat === "food" || (b.cat === "special" && b.serves.length > 0);
const isCounted = b => b.cat === "shop" || b.cat === "food" || b.cat === "special";
const AREA_START = 110, AREA_EXPAND = [0, 150, 220, 300], ROAD_FACTOR = 1.5;

function unlocked(u, s) {
  if (!u || u.start) return true;
  if (u.never) return false;
  if (u.resident && !s.has(u.resident)) return false;
  if (u.rank != null && s.star < u.rank) return false;
  if (u.helped != null && s.helped < u.helped) return false;
  if (u.title != null && s.title < u.title) return false;
  return true;
}

/* ───────── 一次模擬 ───────── */
function simulate(seed, opts) {
  opts = opts || {};
  const R = rng(seed);
  const s = {
    week: 0, money: BAL.startMoney, merit: BAL.startMerit, popAcc: 0, pop: 0, helped: 0,
    star: 0, title: 0, medals: 0, bosses: 0, chars: new Set(["yutong"]), generic: 0,
    blds: [], area: AREA_START, expand: 0, planIdx: 0, traits: {}, minMoney: Infinity, minMoneyAt: "",
    bankrupt: false, log: [], months: [], milestones: {}, activitiesThisQ: 0,
    q: null, mapsCleared: 0, combos: [], qPopStart: 0, jobs: [], reqDone: 0
  };
  s.has = id => s.chars.has(id);
  const newQ = () => ({ sendoffs: 0, wenyin: 0, dreams: 0, bosses: 0, rescues: 0, leftUnhappy: 0, requests: 0 });
  s.q = newQ();
  HQ.traits.forEach(t => (s.traits[t] = 0));

  const housingCap = () => BAL.startHousing + s.blds.reduce((n, x) => n + ((BY[x.id].extra && BY[x.id].extra.capacity) || 0), 0);
  const residents = () => s.chars.size + s.generic;
  const count = id => s.blds.filter(x => x.id === id).length;
  const ym = () => { const m = Math.floor(s.week / BAL.weeksPerMonth); return "Y" + (Math.floor(m / 12) + 1) + "-" + String((m % 12) + 1).padStart(2, "0"); };
  const mark = (k) => { if (!s.milestones[k]) s.milestones[k] = ym(); };
  const log = (t) => { if (opts.verbose) s.log.push(ym() + " W" + ((s.week % 4) + 1) + "  " + t); };

  // 開局固定建築
  for (const b of HQ.buildings) if (b.fixed) s.blds.push({ id: b.id, lv: 1, fixed: true });

  function recompute() {
    // 緣分組合（模擬不擺位置：假設玩家把組合擺在一起）
    s.combos = VARIANT === "nocombo" ? [] : HQ.combos.filter(c => c.need.every(id => count(id) > 0));
    const comboOf = {};
    for (const c of s.combos) for (const id of c.need) (comboOf[id] = comboOf[id] || []).push(c);
    // 特徵
    HQ.traits.forEach(t => (s.traits[t] = 0));
    let appealSum = 0;
    for (const x of s.blds) {
      const b = BY[x.id];
      for (const t in b.traits) s.traits[t] += b.traits[t] * (1 + L.traits * (x.lv - 1));
      let ap = lvAppeal(b, x.lv);
      for (const c of comboOf[x.id] || []) ap += c.effect.appeal || 0;
      appealSum += ap;
      x.appeal = ap;
    }
    for (const c of s.combos) for (const t in c.effect.traits || {}) s.traits[t] += c.effect.traits[t];
    // 裝飾光環：平均分給店（模擬沒有位置）
    const shops = s.blds.filter(x => isShop(BY[x.id]));
    const aura = s.blds.reduce((n, x) => n + ((BY[x.id].extra && BY[x.id].extra.qualityAura) || 0), 0);
    const auraEach = shops.length ? Math.min(12, aura * 2 / shops.length) : 0;
    // 上班：主要角色顧自己的店，其他街坊依序補
    const special = { tattoo: "yuelao", yakiniku: "lee", photo: "dabao", salon: "baimei", mengpo: "no7", clinic: "huatuo", cityhall: "xiaomi", tattoo2: "du", manga: "nova" };
    let free = s.generic + (s.has("xiaoyu") ? 1 : 0) + (s.has("huji") ? 1 : 0);
    for (const x of s.blds) {
      const b = BY[x.id];
      let q = lvQuality(b, x.lv) + auraEach;
      for (const c of comboOf[x.id] || []) q *= 1 + c.effect.qualityPct / 100;
      const need = b.work || 0;
      let staffed = need === 0;
      if (need > 0) {
        if (special[x.id] && s.has(special[x.id])) { staffed = true; q *= 1.3; }
        else if (free >= need) { free -= need; staffed = true; q *= 1.1; }
      }
      if (!staffed) q *= BAL.unstaffedQualityMul;
      x.q = q;
    }
    s.idle = Math.max(0, free) + Math.max(0, s.chars.size - 3);
    s.pop = s.popAcc + appealSum * BAL.popFromAppeal;
  }

  function availableWishes() {
    return HQ.wishes.filter(w => w.weight > 0 && unlocked(w.unlock, s));
  }

  // 玩家會看「誰差什麼特徵才肯來」：下一位只差特徵的街坊，先蓋最便宜、能補那個特徵的一般建築
  function chaseTraits() {
    for (const m of MOVEIN) {
      if (s.has(m.id) || !m.m.traits) continue;
      const rest = Object.assign({}, m.m); delete rest.traits;
      if (!moveinOk(rest, s)) continue;
      for (const t in m.m.traits) {
        if ((s.traits[t] || 0) >= m.m.traits[t]) continue;
        const c = HQ.buildings.filter(b => !b.fixed && !b.unique && b.cat !== "road" && (b.traits[t] || 0) > 0 && unlocked(b.unlock, s))
          .sort((a, b) => a.cost / a.traits[t] - b.cost / b.traits[t])[0];
        if (!c) continue;
        const need = c.size[0] * c.size[1] * ROAD_FACTOR;
        if (usedArea() + need > s.area || s.money - c.cost < 600 + monthlyUpkeep()) return;
        s.money -= c.cost; s.blds.push({ id: c.id, lv: 1 }); s.chased = (s.chased || 0) + 1;
        log("為了 " + m.id + " 的" + t + "，蓋 " + c.name);
        recompute();
        return;
      }
    }
  }

  function tryBuild() {
    chaseTraits();
    let built = 0;
    while (s.planIdx < PLAN.length && built < 3) {
      const b = BY[PLAN[s.planIdx]];
      if (b.unique && count(b.id)) { s.planIdx++; continue; }
      if (!unlocked(b.unlock, s)) {
        // 卡住的名店不擋後面的一般建築：往後找一個能蓋的
        const j = PLAN.findIndex((id, k) => k > s.planIdx && unlocked(BY[id].unlock, s) && !(BY[id].unique && count(id)));
        if (j < 0) return;
        const [it] = PLAN.splice(j, 1); PLAN.splice(s.planIdx, 0, it);
        continue;
      }
      const reserve = VARIANT === "greedy" ? 0 : 600 + monthlyUpkeep();
      const need = b.size[0] * b.size[1] * ROAD_FACTOR;
      if (usedArea() + need > s.area) return;
      if (s.money - b.cost < reserve || s.merit < b.merit) return;
      s.money -= b.cost; s.merit -= b.merit;
      s.blds.push({ id: b.id, lv: 1 });
      s.planIdx++; built++;
      log("蓋 " + b.name + "（冥紙 " + b.cost + (b.merit ? "、功德 " + b.merit : "") + "）");
      recompute();
    }
  }
  function usedArea() { return s.blds.reduce((n, x) => n + (x.fixed ? 0 : BY[x.id].size[0] * BY[x.id].size[1] * ROAD_FACTOR), 0); }
  function monthlyUpkeep() { return s.blds.reduce((n, x) => n + lvUpkeep(BY[x.id], x.lv), 0); }

  function tryUpgrade() {
    // 計畫蓋完或卡住時，把錢拿去升級來客最多的店
    const reserve = 1500 + monthlyUpkeep() * 1.5;
    const cands = s.blds.filter(x => isShop(BY[x.id]) && x.lv < BY[x.id].maxLv).sort((a, b) => (b.uses || 0) - (a.uses || 0));
    for (const x of cands.slice(0, 3)) {
      const c = upCost(BY[x.id], x.lv), cm = BY[x.id].cat === "special" ? L.upgradeMerit * x.lv : 0;
      if (s.money - c > reserve && s.merit - cm > 80) { s.money -= c; s.merit -= cm; x.lv++; log("升級 " + BY[x.id].name + " → Lv" + x.lv + "（" + c + "）"); recompute(); }
    }
  }

  function wenyinCap() {
    let n = HQ.titles[s.title].wenyinPerWeek;
    const t = s.blds.find(x => x.id === "tattoo");
    if (!t) return 0;
    for (const lv of BY.tattoo.extra.wenyin.extraSetsAtLv) if (t.lv >= lv) n++;
    if (count("tattoo2")) n++;
    if (s.combos.some(c => c.id === "redline")) n++;
    return n;
  }

  function weekSouls(incomeMul) {
    const shops = s.blds.filter(x => isShop(BY[x.id]));
    const wishes = availableWishes();
    const wsum = wishes.reduce((n, w) => n + w.weight, 0);
    const station = s.blds.find(x => x.id === "station");
    const trains = BY.station.extra.trainsPerWeekByLv[station.lv - 1];
    let perTrain = BAL.soulsBase + s.pop / BAL.soulsPerPop;
    const cs = s.blds.find(x => x.id === "catstop");
    if (cs) perTrain += BY.catstop.extra.arrivalsPerTrain + BY.catstop.extra.perTwoLv * Math.floor((cs.lv - 1) / 2);
    perTrain += 0.08 * CAT_CHARS.filter(id => s.has(id)).length;
    perTrain = Math.min(perTrain, BAL.soulsCapPerTrain);
    let souls = 0;
    for (let t = 0; t < trains; t++) { const n = Math.floor(perTrain) + (R() < perTrain % 1 ? 1 : 0); souls += n; }
    souls = Math.min(souls, BAL.soulCap);
    const hasYaki = count("yakiniku") > 0;
    const lastMeal = s.combos.some(c => c.id === "lastmeal");
    const dog = count("dogpark") ? 1.25 : 1;
    let income = 0, tattooQ = 0, dreams = 0, sendoffs = 0, stays = 0, unhappy = 0;
    for (let i = 0; i < souls; i++) {
      let wallet = (BAL.walletBase + s.pop * BAL.walletPerPop) * (0.7 + 0.6 * R());
      let r = R(), nW = 1; if (r > BAL.wishCount[0]) nW = 2; if (r > BAL.wishCount[0] + BAL.wishCount[1]) nW = 3;
      const my = [];
      for (let k = 0; k < nW; k++) { let x = R() * wsum; for (const w of wishes) { x -= w.weight; if (x <= 0) { if (!my.includes(w.id)) my.push(w.id); break; } } }
      let peace = BAL.startPeace, ok = 0, visits = 0;
      const visited = new Set();
      for (const w of my) {
        const c = shops.filter(x => BY[x.id].serves.includes(w) && !visited.has(x));
        if (!c.length) continue;
        let tot = c.reduce((n, x) => n + x.appeal + 1, 0), pick = c[0], y = R() * tot;
        for (const x of c) { y -= x.appeal + 1; if (y <= 0) { pick = x; break; } }
        const price = lvPrice(BY[pick.id], pick.lv);
        if (wallet < price) continue;
        wallet -= price; income += price; pick.uses = (pick.uses || 0) + 1; visited.add(pick); visits++;
        const qf = clamp(pick.q / BAL.qualityRef, BAL.qfMin, BAL.qfMax);
        let gain = BAL.peaceWish * qf * dog;
        if (pick.id === "mengpo") gain *= 1.5;
        if (w === "dream" && s.merit >= HQ.meritPrices.dream) { s.merit -= HQ.meritPrices.dream; dreams++; gain += BY.photo.extra.dream.anshin; }
        if (w === "tattoo") tattooQ++;
        peace += gain; ok++;
        s.popAcc += BAL.popPerVisit * qf;
      }
      for (let k = visits; k < BAL.visitsMax; k++) {
        if (R() < 0.45 && shops.length) {
          const x = shops[Math.floor(R() * shops.length)];
          if (visited.has(x)) continue;
          const price = lvPrice(BY[x.id], x.lv);
          if (wallet < price) continue;
          wallet -= price; income += price; x.uses = (x.uses || 0) + 1; visited.add(x);
          const qf = clamp(x.q / BAL.qualityRef, BAL.qfMin, BAL.qfMax);
          peace += BAL.peaceOther * qf * dog; s.popAcc += BAL.popPerVisit * qf;
        }
      }
      if (ok === my.length && R() * BAL.peaceFull < peace) {
        if (R() < BAL.stayChance && s.generic < housingCap() && s.generic < BAL.genericCapByStar[s.star]) { s.generic++; stays++; s.jobs.push({ joined: Math.floor(s.week / BAL.weeksPerMonth), tier: 0 }); }
        else {
          sendoffs++;
          s.merit += BAL.sendoffMerit * (hasYaki ? BAL.macaronMul : 1) * (lastMeal ? 1.3 : 1);
        }
      } else unhappy++;
    }
    const pairs = Math.min(Math.floor(tattooQ / 2), wenyinCap());
    s.merit += pairs * HQ.meritPrices.wenyinArtistCut;
    const helped = sendoffs + dreams + pairs * 2;
    s.helped += helped;
    s.popAcc = Math.max(0, s.popAcc + helped * BAL.popPerHelp + unhappy * BAL.popPerUnhappy);
    s.q.sendoffs += sendoffs; s.q.dreams += dreams; s.q.wenyin += pairs; s.q.leftUnhappy += unhappy;
    income *= incomeMul;
    s.money += income;
    return { souls, income, sendoffs, dreams, pairs, stays, unhappy };
  }

  function review(month, year) {
    const W = HQ.review.weights, T = HQ.review.target;
    const traitSum = HQ.traits.reduce((n, t) => n + (t === "魔氣" ? 0 : s.traits[t]), 0);
    const score = (s.pop - s.qPopStart) * W.popGain + residents() * W.residents + s.q.sendoffs * W.sendoffs + s.q.wenyin * W.wenyin +
      s.q.dreams * W.dreams + s.q.requests * W.requests + traitSum * W.traitSum + s.q.bosses * W.bosses + s.q.rescues * W.rescues + s.q.leftUnhappy * W.leftUnhappy;
    let target = T.byStar[s.star];
    const dec = month === 12;
    if (dec) target *= T.decemberMul;
    const ratio = score / target;
    const g = HQ.review.grades.find(x => ratio >= x.ratio) || HQ.review.grades[HQ.review.grades.length - 1];
    let reward = Math.round(score * HQ.review.meritPerScore) + g.bonus;
    if (dec) reward *= HQ.review.decemberRewardMul;
    if (g.task) reward += HQ.review.taskBaseMerit * HQ.review.taskMeritMul; // 假設觀音任務完成
    s.merit += reward; s.popAcc += g.popularity;
    // ☆ 檢查
    const R2 = HQ.ranks[s.star];
    const built = s.blds.filter(x => isCounted(BY[x.id]) && !BY[x.id].fixed).length;
    const homes = s.blds.filter(x => BY[x.id].cat === "home").length;
    let upStar = false;
    if (R2 && s.pop >= R2.popularity && built >= (R2.buildings || 0) && residents() >= (R2.residents || 0) && s.helped >= (R2.helped || 0) &&
        homes >= (R2.homes || 0) && s.bosses >= (R2.bosses || 0) && s.lastIncome >= (R2.monthlyIncome || 0)) {
      s.star++; upStar = true; s.merit += R2.reward.merit || 0; s.money += R2.reward.money || 0; s.medals += R2.reward.medals || 0;
      mark("star" + s.star);
    }
    // 位階（12 月）
    let upTitle = false;
    if (dec) {
      const nt = HQ.titles[s.title + 1];
      if (nt && s.helped >= nt.helped) { s.title++; upTitle = true; s.merit += nt.reward.merit; s.medals += nt.reward.medals; mark("title" + s.title); }
      for (const m of HQ.medals.annual) if (score >= m.score) s.medals += m.medals;
    }
    const rec = { at: ym(), pop: Math.round(s.pop), score: Math.round(score), target: Math.round(target), grade: g.grade, reward, upStar, upTitle };
    s.reviews = s.reviews || []; s.reviews.push(rec);
    log("觀音評定 " + g.grade + "（" + rec.score + "/" + rec.target + "）功德 +" + reward + (upStar ? "　☆" + s.star : "") + (upTitle ? "　升為" + HQ.titles[s.title].name : ""));
    s.q = newQ(); s.activitiesThisQ = 0; s.qPopStart = s.pop;
  }

  function spendMerit(month) {
    // 擴地優先
    const ex = HQ.activities.filter(a => a.expand && a.expand === s.expand + 1 && unlockedAct(a));
    for (const a of ex) if (s.merit >= a.merit) { s.merit -= a.merit; s.expand++; s.area += AREA_EXPAND[s.expand]; log("擴地 " + s.expand); mark("expand" + s.expand); }
    // 留給下一個要功德的建築
    const next = PLAN.slice(s.planIdx, s.planIdx + 6).map(id => BY[id].merit).reduce((a, b) => Math.max(a, b), 0);
    const keep = next + 40;
    const acts = HQ.activities.filter(a => !a.expand && a.popularity > 0 && unlockedAct(a)).sort((a, b) => b.popularity / b.merit - a.popularity / a.merit);
    for (const a of acts) {
      while (s.activitiesThisQ < HQ.activityPerQuarter && s.merit - a.merit >= keep) {
        s.merit -= a.merit; s.popAcc += a.popularity; s.activitiesThisQ++;
      }
    }
  }
  function unlockedAct(a) {
    if (!a.need) return true;
    if (a.need.rank != null && s.star < a.need.rank) return false;
    if (a.need.building && !count(a.need.building)) return false;
    return true;
  }

  // 出征：隊伍平均等級估計 = 3 + 0.9 × 經過月數（外圍巡守＋道場）
  const MAP_ORDER = [["daoju", 0, "boss-laji"], ["gengyin", 0, "boss-bailaoda"], ["xinkujiang", 1, "boss-hasshaku"], ["relic", 2, "boss-eye"], ["demon2", 3, "boss-leviathan"], ["demon3", 4, "boss-satan"]];
  function expedition(monthIdx) {
    const lvl = 3 + 0.9 * monthIdx + (count("sawhall") ? 3 : 0);
    const next = MAP_ORDER[s.mapsCleared];
    if (!next || s.star < next[1]) return 1;
    const rec = HQ.mapLevels[next[0]];
    const party = Math.min(4, residents());
    const cost = HQ.travelCost[next[0]] * party;
    if (lvl < rec * 0.9 || s.money < BAL.expeditionMinGold + cost || party < 3) return 1;
    s.money -= cost;
    const boss = HQ.enemies.find(e => e.id === next[2]);
    s.merit += boss.merit; s.money += boss.gold; s.helped += 5; s.bosses++; s.q.bosses++; s.mapsCleared++; s.medals += HQ.medals.bossFirstKill;
    mark("boss:" + next[0]);
    log("出征 " + next[0] + " 打倒 " + boss.name + "（功德 +" + boss.merit + "）");
    return BAL.expeditionIncomeMul;
  }

  const totalWeeks = YEARS * 12 * BAL.weeksPerMonth;
  let mAcc = { income: 0, souls: 0, sendoffs: 0, dreams: 0, pairs: 0, unhappy: 0, meritStart: s.merit };
  let expMul = 1, expWeeks = 0;
  recompute();
  for (s.week = 0; s.week < totalWeeks; s.week++) {
    const monthIdx = Math.floor(s.week / BAL.weeksPerMonth);
    const month = (monthIdx % 12) + 1, year = Math.floor(monthIdx / 12) + 1, wk = s.week % BAL.weeksPerMonth;
    // 入住
    for (const m of MOVEIN) if (!s.has(m.id) && moveinOk(m.m, s)) { s.chars.add(m.id); log(m.id + " 入住"); mark("movein:" + m.id); recompute(); }
    tryBuild();
    if (VARIANT !== "lazy" && (s.planIdx >= PLAN.length || s.money > 6000 + monthlyUpkeep() * 3)) tryUpgrade();
    // 季中出征一次（第 2 個月第 1 週）
    if (wk === 0 && month % 3 === 2) { expMul = expedition(monthIdx); expWeeks = expMul < 1 ? 2 : 0; }
    const r = weekSouls(expWeeks > 0 ? expMul : 1);
    if (expWeeks > 0) expWeeks--;
    // 外圍巡守
    s.merit += s.idle * BAL.patrolMeritPerWeek * (0.5 + R());
    s.money += s.idle * BAL.patrolGoldPerWeek;
    if (count("gecko")) s.merit += Math.min(3, s.idle) * BY.gecko.extra.workSite.meritPerWeekPerWorker;
    for (const k in r) if (k in mAcc) mAcc[k] += r[k];
    recompute();
    if (wk === BAL.weeksPerMonth - 1) {
      // 月底：維持費、香火、稅、祭典
      const up = monthlyUpkeep();
      s.money -= up;
      for (const x of s.blds) { const inc = BY[x.id].extra && BY[x.id].extra.incense; if (inc) s.merit += (inc.meritPerMonth + inc.meritPerLv * (x.lv - 1)) * (month === 3 ? inc.qingmingMul : 1); }
      if (month === BAL.taxMonth) s.money += s.generic * 300;
      if (month === 8 && count("festival")) { s.popAcc += BY.festival.extra.annualFestival.popularity; s.merit += BY.festival.extra.annualFestival.merit; }
      s.lastIncome = mAcc.income;
      // 委託：第 2 個月起每月完成 1 件（件數、平均獎勵見 REQS）
      if (monthIdx >= 1 && monthIdx < REQUESTS_TOTAL + 1) { s.merit += REQ_MERIT; s.helped += Math.round(REQ_HELPED); s.popAcc += 3; s.q.requests++; s.reqDone++; }
      // 轉職（功德的主要出口）：入住 2 個月後轉一階、8 個月後二階、18 個月後有勳章就三階
      for (const j of s.jobs) {
        const age = monthIdx - j.joined;
        const c = j.tier === 0 && age >= 2 ? 25 : j.tier === 1 && age >= 8 ? 130 : j.tier === 2 && age >= 18 && s.medals > 0 ? 300 : 0;
        if (c && VARIANT !== "lazy" && s.merit - c >= 60) { s.merit -= c; if (j.tier === 2) s.medals--; j.tier++; s.meritOnJobs = (s.meritOnJobs || 0) + c; }
      }
      if (VARIANT !== "lazy") spendMerit(month);
      if (HQ.review.months.includes(month)) review(month, year);
      recompute();
      if (s.money < s.minMoney) { s.minMoney = s.money; s.minMoneyAt = ym(); }
      if (s.money < 0) s.bankrupt = true;
      s.months.push({ at: ym(), money: Math.round(s.money), merit: Math.round(s.merit), pop: Math.round(s.pop), star: s.star, title: s.title,
        helped: s.helped, residents: residents(), souls: mAcc.souls, income: Math.round(mAcc.income), upkeep: Math.round(up),
        buildings: s.blds.filter(x => !x.fixed && BY[x.id].cat !== "road").length, sendoffs: mAcc.sendoffs, dreams: mAcc.dreams, pairs: mAcc.pairs,
        unhappyPct: mAcc.souls ? Math.round(100 * mAcc.unhappy / mAcc.souls) : 0, meritGain: Math.round(s.merit - mAcc.meritStart) });
      mAcc = { income: 0, souls: 0, sendoffs: 0, dreams: 0, pairs: 0, unhappy: 0, meritStart: s.merit };
    }
  }
  return s;
}

/* ───────── 輸出 ───────── */
function pad(v, n) { v = String(v); return v.length >= n ? v : " ".repeat(n - v.length) + v; }
function table(months, every) {
  const head = "  月份   冥紙    功德   人氣 ☆ 位 幫助 街坊 來客  營收  維持 建築 送行 托夢 文印 不滿%";
  const rows = months.filter((m, i) => i % every === every - 1 || i === 0).map(m =>
    "  " + m.at + pad(m.money, 7) + pad(m.merit, 7) + pad(m.pop, 7) + pad(m.star, 2) + pad(m.title, 3) + pad(m.helped, 5) + pad(m.residents, 5) +
    pad(m.souls, 5) + pad(m.income, 6) + pad(m.upkeep, 6) + pad(m.buildings, 5) + pad(m.sendoffs, 5) + pad(m.dreams, 5) + pad(m.pairs, 5) + pad(m.unhappyPct, 6));
  return [head].concat(rows).join("\n");
}
function median(a) { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; }
function monthNum(at) { if (!at) return null; const m = /Y(\d+)-(\d+)/.exec(at); return (+m[1] - 1) * 12 + +m[2]; }
function fmtMonth(n) { if (n == null) return "—"; return "Y" + (Math.floor((n - 1) / 12) + 1) + "-" + String(((n - 1) % 12) + 1).padStart(2, "0"); }

if (ONE_SEED != null) {
  const s = simulate(+ONE_SEED, { verbose: VERBOSE });
  if (JSON_OUT) { console.log(JSON.stringify({ months: s.months, milestones: s.milestones, reviews: s.reviews }, null, 1)); process.exit(0); }
  if (VERBOSE) console.log(s.log.join("\n") + "\n");
  console.log(table(s.months, 1));
  console.log("\n里程碑：", s.milestones);
  console.log("最低冥紙：", Math.round(s.minMoney), "@", s.minMoneyAt, s.bankrupt ? "（破產！）" : "");
  console.log("評定：", s.reviews.map(r => r.at + " " + r.grade + " " + r.score + "/" + r.target + " +" + r.reward).join("　"));
} else {
  const runs = [];
  for (let i = 1; i <= SEEDS; i++) runs.push(simulate(i));
  const keys = ["star1", "star2", "star3", "star4", "star5", "title1", "title2", "movein:lee", "movein:dabao", "expand1", "boss:daoju", "boss:xinkujiang", "boss:relic"];
  console.log("三途川物語 經濟模擬：" + SEEDS + " 次 × " + YEARS + " 年（中位數）　玩法：" + VARIANT + "\n");
  console.log("里程碑（中位數月份，括號＝達成次數/總次數）");
  for (const k of keys) {
    const ms = runs.map(r => monthNum(r.milestones[k])).filter(x => x != null);
    console.log("  " + k.padEnd(18) + fmtMonth(median(ms)).padEnd(8) + "（" + ms.length + "/" + SEEDS + (ms.length ? "，最早 " + fmtMonth(Math.min(...ms)) + "、最晚 " + fmtMonth(Math.max(...ms)) : "") + "）");
  }
  const bk = runs.filter(r => r.bankrupt).length;
  console.log("\n破產次數：" + bk + "/" + SEEDS + "　最低冥紙中位數：" + median(runs.map(r => Math.round(r.minMoney))) + "（" + median(runs.map(r => monthNum(r.minMoneyAt))) + " 月）");
  // 中位數那一局的月表
  const order = runs.map((r, i) => [r.months[r.months.length - 1].pop, i]).sort((a, b) => a[0] - b[0]);
  const mid = runs[order[Math.floor(order.length / 2)][1]];
  console.log("\n代表局（期末人氣中位數那一局）每季：\n" + table(mid.months, 3));
  console.log("\n代表局評定：" + mid.reviews.map(r => r.at + " " + r.grade).join(" "));
}
