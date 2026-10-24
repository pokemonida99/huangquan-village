// 遊戲狀態、存讀檔、資源增減。G 是全域遊戲物件；G.state 是會存檔的部分。
window.G = { state: null, souls: [], residents: [], mobs: [], fx: [], buildings: [], time: 0 };

window.State = (function () {
  function fresh() {
    return {
      ver: 1,
      money: CFG.START_MONEY, merit: CFG.START_MERIT, popularity: 0, helped: 0, star: 0, title: 0,
      year: 1, month: 1, week: 1, weekT: 0, speed: 1, trainT: 0, day: 0,
      zones: [0],
      buildings: [],         // {uid, id, x, y, w, h, lv, visits, income, broken}
      roads: [],             // 玩家鋪的石板路 [x, y]
      residents: [],         // 存檔用（執行時在 G.residents）
      charsIn: {},           // 已入住的角色 id → 入住的 absWeek
      visiting: null,        // 正在來訪的角色 id
      gifts: {},             // 角色帶來的建築，第一間免費
      unlocked: {},          // 事件、委託解鎖的建築
      requests: {},          // id → {st: "active"|"done", base: {...}}
      stats: { reincarnated: 0, pairs: 0, dreams: 0, kills: 0, visits: 0, actions: {}, guests: 0, leftUnhappy: 0, requests: 0, bosses: 0, rescues: 0 },
      flags: {}, guests: {}, mods: [], schedule: [], tut: 0, pairsWeek: 0, monthIncome: 0, traitBonus: {}, activitiesQ: 0,
      quarter: null,         // 季初快照
      fired: {},             // 已觸發事件
      items: { incense: 2 },
      expedition: null,
      tutorial: 0,
      log: []
    };
  }

  function absWeek(s) { s = s || G.state; return (s.year - 1) * 48 + (s.month - 1) * 4 + (s.week - 1); }

  function save() {
    if (G.noSave) return false;
    var s = G.state;
    s.buildings = G.buildings.map(function (b) { return { uid: b.uid, id: b.id, x: b.x, y: b.y, w: b.w, h: b.h, lv: b.lv, visits: b.visits, income: b.income, broken: b.broken || 0, closedUntil: b.closedUntil || 0 }; });
    s.residents = G.residents.map(function (r) { return r.toSave(); });
    try { localStorage.setItem(CFG.SAVE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
  }
  function load() {
    try { var raw = localStorage.getItem(CFG.SAVE_KEY); if (!raw) return null; var s = JSON.parse(raw); if (!s || s.ver !== 1) return null; var f = fresh(); s = Object.assign(f, s); s.stats = Object.assign(fresh().stats, s.stats); s.visiting = null; return s; } catch (e) { return null; }
  }
  function wipe() { G.noSave = true; try { localStorage.removeItem(CFG.SAVE_KEY); } catch (e) { /* 私密模式 */ } }

  // ---- 資源 ----
  function addMoney(n, x, y) { G.state.money += n; if (n > 0) G.state.monthIncome = (G.state.monthIncome || 0) + n; if (x != null && n) FX.float(x, y, (n > 0 ? "+" : "") + Math.round(n), "#f3d58c"); }
  function addMerit(n, x, y) { G.state.merit += n; if (x != null && n) FX.float(x, y, (n > 0 ? "+" : "") + Math.round(n) + " 功德", "#f08a6a"); }
  function addHelped(n, why) {
    G.state.helped += n;
    G.state.popularity += n * CFG.POP_PER_HELP;
    if (why) UI.toast("🙏 " + why + "　已幫助 +" + n);
  }
  function addPop(n) { G.state.popularity = Math.max(0, G.state.popularity + n); }
  function act(name, n) { var a = G.state.stats.actions; a[name] = (a[name] || 0) + (n || 1); }

  // 街區特徵：建築特徵 × 等級加成 ＋ 緣分組合 ＋ 事件加的
  function traits() {
    var t = {};
    D.traits.forEach(function (k) { t[k] = 0; });
    G.buildings.forEach(function (b) {
      var def = b.def;
      Object.keys(def.traits).forEach(function (k) { t[k] = (t[k] || 0) + def.traits[k] * (1 + CFG.LV.traits * (b.lv - 1)); });
    });
    G.state.roads.forEach(function (r) {
      var def = D.buildings.find(function (d) { return d.cat === "road" && MapGen.roadKind(d) === r[2]; });
      if (def) Object.keys(def.traits).forEach(function (k) { t[k] = (t[k] || 0) + def.traits[k]; });
    });
    Sim.activeCombos().forEach(function (c) { var tr = (c.effect && c.effect.traits) || {}; Object.keys(tr).forEach(function (k) { t[k] = (t[k] || 0) + tr[k]; }); });
    var bonus = G.state.traitBonus || {};
    Object.keys(bonus).forEach(function (k) { t[k] = (t[k] || 0) + bonus[k]; });
    Object.keys(t).forEach(function (k) { t[k] = Math.round(t[k]); });
    return t;
  }
  // 人氣 = 累積人氣 + 建築魅力 × popFromAppeal（B 的模型）
  function pop() {
    var a = 0;
    if (CFG.POP_FROM_APPEAL) G.buildings.forEach(function (b) { a += Sim.appealOf(b); });
    return Math.round(G.state.popularity + a * CFG.POP_FROM_APPEAL);
  }
  function housing() {
    var cap = CFG.START_HOUSING;
    G.buildings.forEach(function (b) { var def = b.def; if (def.extra.capacity || def.housing) cap += (def.extra.capacity || def.housing); });
    return cap;
  }
  function residentCap() { return Math.min(housing(), CFG.GENERIC_CAP[G.state.star] || 99); }
  function plainResidents() { return G.residents.filter(function (r) { return !r.charId; }).length; }
  function hasBuilding(id) { return G.buildings.some(function (b) { return b.id === id; }); }
  // 行事曆／事件的持續效果：{ until: absWeek, mods: {...} }
  function mod(name, dflt) {
    var v = dflt, now = absWeek();
    (G.state.mods || []).forEach(function (m) {
      if (m.until < now || m.mods[name] == null) return;
      var x = m.mods[name];
      if (typeof x === "number") v = (v == null ? 1 : v) * x;
      else v = Object.assign({}, v || {}, x);
    });
    return v;
  }
  function addMods(mods, weeks) { G.state.mods.push({ until: absWeek() + (weeks || 1) - 1, mods: mods }); G.state.mods = G.state.mods.filter(function (m) { return m.until >= absWeek(); }); }

  return { fresh: fresh, save: save, load: load, wipe: wipe, absWeek: absWeek, addMoney: addMoney, addMerit: addMerit, addHelped: addHelped, addPop: addPop, act: act, traits: traits, pop: pop, housing: housing, residentCap: residentCap, plainResidents: plainResidents, hasBuilding: hasBuilding, mod: mod, addMods: addMods };
})();

// 飄字、粒子
window.FX = {
  // x, y 是正交世界座標（人物腳底）；lift 是往畫面上方抬幾 px。存成等角像素，Render 直接畫
  float: function (x, y, text, color, lift) { var p = ISO.ent(x, y); G.fx.push({ kind: "text", x: p.x, y: p.y - (lift || 0), text: text, color: color || "#fff", t: 0, life: 1.6 }); },
  spark: function (x, y, color, lift) { var p = ISO.ent(x, y); for (var i = 0; i < 10; i++) G.fx.push({ kind: "spark", x: p.x, y: p.y - (lift || 0), vx: U.rand(-20, 20), vy: U.rand(-40, -10), color: color || "#f3d58c", t: 0, life: U.rand(0.6, 1.2) }); },
  update: function (dt) {
    for (var i = G.fx.length - 1; i >= 0; i--) {
      var f = G.fx[i]; f.t += dt;
      if (f.kind === "text") f.y -= 14 * dt;
      else { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 30 * dt; }
      if (f.t > f.life) G.fx.splice(i, 1);
    }
  }
};
