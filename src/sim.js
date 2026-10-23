// 模擬：時間、列車、建造、等級與組合、怪物、結算、擴建。
window.Sim = (function () {
  var T = CFG.TILE;
  var S = {};
  var mobT = 0;
  G.train = null;

  // ---------- 條件（建築 unlock、角色 movein、委託 when/need、事件 when 共用） ----------
  S.cond = function (c, skip) {
    if (!c) return true;
    var s = G.state, ok = true;
    skip = skip || {};
    Object.keys(c).forEach(function (k) {
      if (!ok || skip[k]) return;
      var v = c[k];
      switch (k) {
        case "start": break;
        case "never": ok = false; break;
        case "rank": case "star": ok = s.star >= v; break;
        case "helped": ok = s.helped >= v; break;
        case "popularity": ok = State.pop() >= v; break;
        case "title": ok = s.title >= v; break;
        case "resident": ok = [].concat(v).every(function (id) { return !!s.charsIn[id]; }); break;
        case "noresident": ok = ![].concat(v).some(function (id) { return !!s.charsIn[id]; }); break;
        case "request": ok = [].concat(v).every(function (id) { return s.requests[id] && s.requests[id].st === "done"; }); break;
        case "map": ok = [].concat(v).every(function (id) { return S.cleared(id); }); break;
        case "flag": ok = [].concat(v).every(function (f) { return !!s.flags[f]; }); break;
        case "noflag": ok = ![].concat(v).some(function (f) { return !!s.flags[f]; }); break;
        case "building": ok = [].concat(v).every(function (id) { return State.hasBuilding(id); }); break;
        case "combo": ok = [].concat(v).every(function (id) { return S.activeCombos().some(function (x) { return x.id === id; }); }); break;
        case "month": ok = [].concat(v).indexOf(s.month) >= 0; break;
        case "week": ok = [].concat(v).indexOf(s.week) >= 0; break;
        case "traits": var tr = State.traits(); Object.keys(v).forEach(function (t) { if ((tr[t] || 0) < v[t]) ok = false; }); break;
        case "guests": ok = s.stats.guests >= v; break;
        case "wenyin": ok = s.stats.pairs >= v; break;
        case "guest": ok = !!(s.guests && s.guests[v]); break;
        default: break; // order、random、once… 由呼叫端處理
      }
    });
    return ok;
  };
  S.condText = function (u) {
    var t = [];
    if (!u) return "";
    if (u.rank != null || u.star != null) t.push("街區 ☆" + (u.rank != null ? u.rank : u.star));
    if (u.helped != null) t.push("已幫助 " + u.helped + " 人");
    if (u.popularity != null) t.push("人氣 " + u.popularity);
    if (u.resident) t.push([].concat(u.resident).map(function (id) { var c = D.charById[id]; return (c ? c.name : id) + " 入住"; }).join("、"));
    if (u.request) t.push("完成委託");
    if (u.map) t.push("打倒出征地的王");
    if (u.building) t.push("蓋「" + [].concat(u.building).map(function (id) { return D.bById[id] ? D.bById[id].name : id; }).join("、") + "」");
    if (u.title != null) t.push("位階「" + ((D.titles[u.title] || {}).name || "升階") + "」");
    if (u.traits) t.push(Object.keys(u.traits).map(function (k) { return k + " " + u.traits[k]; }).join("、"));
    return t.join("、") || "尚未開放";
  };
  S.cleared = function (id) { var c = G.state.cleared || {}; if (c[id]) return true; for (var k in D.MAP_ALIAS) { if (D.MAP_ALIAS[k] === id && c[k]) return true; if (k === id && c[D.MAP_ALIAS[k]]) return true; } return false; };

  // ---------- 建築 ----------
  S.isUnlocked = function (def) {
    var s = G.state;
    if (def.fixed) return false;
    if (s.unlocked[def.id] || s.gifts[def.id]) return true;
    return S.cond(def.unlock || {});
  };
  S.unlockText = function (def) { return S.condText(def.unlock); };
  S.costOf = function (def) { return G.state.gifts[def.id] ? 0 : def.cost; };
  var L = function () { return CFG.LV; };
  S.priceOf = function (b) { var p = b.def.price * (1 + (b.lv - 1) * L().price); if (S.staffed(b) && b.staffBonus) p *= 1 + (b.staffBonus.pricePct || 0) / 100; return p; };
  S.upkeepOf = function (b) { return b.def.upkeep * (1 + (b.lv - 1) * L().upkeep); };
  S.staffed = function (b) { return b.staffedUntil > G.time; };
  S.qualityOf = function (b) {
    var q = b.def.quality * (1 + (b.lv - 1) * L().quality) + (b.aura || 0);
    if (b.def.work > 0) q *= S.staffed(b) ? 1 + ((b.staffBonus && b.staffBonus.qualityPct) || 0) / 100 : CFG.UNSTAFFED;
    q *= 1 + (b.comboPct || 0) / 100;
    return q;
  };
  S.appealOf = function (b) { return b.def.appeal * (1 + (b.lv - 1) * L().appeal) + (b.comboAppeal || 0); };
  S.qf = function (b) { return U.clamp(S.qualityOf(b) / CFG.QREF, CFG.QF_MIN, CFG.QF_MAX); };
  S.upgradeCost = function (b) { var a = b.def.upgradeCost; if (Array.isArray(a) && a[b.lv] != null) return a[b.lv]; return Math.round(b.def.cost * L().upgradeCost * b.lv); };
  S.upgradeMerit = function (b) { return b.def.cat === "special" && L().upgradeMerit ? L().upgradeMerit * b.lv : 0; };
  S.count = function (id) { return G.buildings.filter(function (b) { return b.id === id; }).length; };
  S.canBuild = function (def) {
    if (!S.isUnlocked(def)) return "未解鎖：" + S.unlockText(def);
    if (def.unique && S.count(def.id) > 0) return "已經蓋了";
    if (G.state.money < S.costOf(def)) return "冥紙不夠";
    if (G.state.merit < (def.merit || 0)) return "功德不夠";
    return "";
  };

  function makeB(o) {
    var def = D.bById[o.id];
    var b = { uid: o.uid || U.uid(), id: o.id, x: o.x, y: o.y, w: def.size[0], h: def.size[1], lv: o.lv || 1, visits: o.visits || 0, income: o.income || 0, broken: o.broken || 0, closedUntil: o.closedUntil || 0, def: def, door: null, queue: [], staffedUntil: 0 };
    MapGen.setOcc(b, b.uid);
    G.buildings.push(b);
    return b;
  }
  S.refreshDoors = function () {
    G.buildings.forEach(function (b) { b.door = MapGen.doorFor(b); });
    var ex = G.buildings.find(function (b) { return b.def.extra.exit && b.door; });
    if (ex) MapGen.exit = { x: ex.door.x, y: ex.door.y };
    S.recalc();
  };
  // 組合、裝飾光環：蓋／拆／升級後重算
  S.recalc = function () {
    G.buildings.forEach(function (b) { b.comboPct = 0; b.comboAppeal = 0; b.aura = 0; b.combos = []; });
    function dist(a, b) {
      var dx = Math.max(0, a.x - (b.x + b.w - 1), b.x - (a.x + a.w - 1)), dy = Math.max(0, a.y - (b.y + b.h - 1), b.y - (a.y + a.h - 1));
      return Math.max(dx, dy);
    }
    S._combos = [];
    D.combos.forEach(function (c) {
      var members = c.need.map(function (id) { return G.buildings.filter(function (b) { return b.id === id; }); });
      if (members.some(function (m) { return !m.length; })) return;
      var pick = members.map(function (m) { return m[0]; });
      var ok = pick.every(function (a) { return pick.every(function (b) { return a === b || dist(a, b) <= (c.range || 1); }); });
      if (!ok) return;
      S._combos.push(c);
      var e = c.effect || {};
      pick.forEach(function (b) { b.comboPct += e.qualityPct || 0; b.comboAppeal += e.appeal || 0; b.combos.push(c.name); });
    });
    G.buildings.forEach(function (d) {
      var a = d.def.extra.qualityAura; if (!a) return;
      G.buildings.forEach(function (b) {
        if (b === d || b.def.cat === "deco" || b.def.cat === "road") return;
        if (b.x - 1 <= d.x + d.w - 1 && d.x <= b.x + b.w && b.y - 1 <= d.y + d.h - 1 && d.y <= b.y + b.h) b.aura += a;
      });
    });
  };
  S.activeCombos = function () { return S._combos || []; };

  S.place = function (def, x, y) {
    var why = S.canBuild(def);
    if (why) return why;
    if (!MapGen.canPlace(def, x, y)) return "這裡不能蓋";
    var cost = S.costOf(def);
    G.state.money -= cost; G.state.merit -= def.merit || 0;
    if (G.state.gifts[def.id]) delete G.state.gifts[def.id];
    if (def.cat === "road") {
      var i = MapGen.idx(x, y);
      MapGen.kind[i] = MapGen.roadKind(def);
      G.state.roads = G.state.roads.filter(function (r) { return r[0] !== x || r[1] !== y; });
      G.state.roads.push([x, y, MapGen.kind[i]]); MapGen.redrawTile(x, y);
      return "";
    }
    var b = makeB({ id: def.id, x: x, y: y });
    // 不能把別間店的門口全部堵死
    var blocked = G.buildings.filter(function (o) { return o !== b && o.door && (o.def.cat !== "deco" || o.def.serves.length) && !MapGen.doorFor(o); });
    if (blocked.length || !MapGen.doorFor(b)) {
      MapGen.setOcc(b, 0); G.buildings.pop();
      G.state.money += cost; G.state.merit += def.merit || 0;
      return blocked.length ? "會擋住「" + blocked[0].def.name + "」的門口" : "這裡不能蓋";
    }
    S.refreshDoors();
    FX.spark((x + b.w / 2) * T, (y + b.h) * T - 10, "#f3d58c");
    Story.onBuilt(b);
    return "";
  };
  S.remove = function (b) {
    if (b.def.fixed) return;
    MapGen.setOcc(b, 0);
    G.buildings.splice(G.buildings.indexOf(b), 1);
    G.souls.forEach(function (s) {
      if (s.inB === b) { s.hidden = false; s.inB = null; s.st = "idle"; s.timer = 0.2; }
      if (s.target === b) s.target = null;
    });
    G.residents.forEach(function (r) { if (r.target === b) { r.target = null; r.hidden = false; r.st = "idle"; } });
    S.refreshDoors();
  };
  S.upgrade = function (b) {
    var c = S.upgradeCost(b), m = S.upgradeMerit(b);
    if (b.lv >= b.def.maxLv) return "已經是最高等級";
    if (G.state.money < c) return "冥紙不夠";
    if (G.state.merit < m) return "功德不夠（要 " + m + "）";
    G.state.money -= c; G.state.merit -= m; b.lv++;
    FX.float((b.x + b.w / 2) * T, b.y * T, "Lv" + b.lv, "#9fe0d8");
    S.recalc();
    return "";
  };
  S.repair = function (b) {
    var c = Math.round(b.def.cost * 0.3);
    if (G.state.money < c) return "冥紙不夠";
    G.state.money -= c; b.broken = 0; return "";
  };
  // 門口被擋住時的備案：佔地正下方
  S.doorOf = function (b) { return b.door || { x: b.x + Math.floor((b.w - 1) / 2), y: Math.min(CFG.H - 1, b.y + b.h) }; };
  S.isOpen = function (b) { return !b.broken && !(b.closedUntil > State.absWeek()); };

  // ---------- 開局／讀檔 ----------
  function placeFixed(def) {
    var p = MapGen.FIXED_POS[def.id];
    if (p) return makeB({ id: def.id, x: p[0], y: p[1] });
    // 沒指定位置的固定建築：在起始街區找空地
    for (var y = 4; y < 19; y++) for (var x = 2; x < 28; x++) if (MapGen.canPlace(def, x, y)) return makeB({ id: def.id, x: x, y: y });
    return null;
  }
  S.setup = function (saved) {
    MapGen.generate();
    G.buildings = []; G.souls = []; G.residents = []; G.mobs = []; G.fx = [];
    var s = G.state;
    s.roads.forEach(function (r) { MapGen.kind[MapGen.idx(r[0], r[1])] = r[2] != null ? r[2] : K.STONE; });
    if (!saved) {
      D.buildings.filter(function (d) { return d.fixed; }).forEach(placeFixed);
      // 開局送一間茶館，讓第一班亡魂有地方坐
      var tea = D.bById.teahouse || D.buildings.find(function (b) { return b.cat === "food" && !b.fixed; });
      if (tea) makeB({ id: tea.id, x: 10, y: 6 });
    } else {
      s.buildings.forEach(function (o) { if (D.bById[o.id]) makeB(o); });
      D.buildings.filter(function (d) { return d.fixed && !G.buildings.some(function (b) { return b.id === d.id; }); }).forEach(placeFixed);
    }
    var maxUid = 0;
    G.buildings.forEach(function (b) { maxUid = Math.max(maxUid, b.uid); });
    (s.residents || []).forEach(function (o) { maxUid = Math.max(maxUid, o.uid || 0); });
    U.setUidFloor(maxUid + 1);
    S.refreshDoors();
    MapGen.redrawGround();
    (s.residents || []).forEach(function (o) {
      var p = MapGen.randomWalkable(function (z) { return z === 0; }) || MapGen.stationDoor;
      G.residents.push(new Resident(p.x, p.y, o));
    });
    if (!saved) {
      var yt = D.chars.find(function (c) { return c.start; }) || { id: "yutong", name: "語彤", job: "實習月老" };
      Story.addCharResident(yt, true);
    }
  };

  // ---------- 時間 ----------
  S.update = function (dt) {
    var s = G.state;
    G.time += dt;
    s.weekT += dt / CFG.WEEK_SEC;
    if (s.weekT >= 1) { s.weekT -= 1; S.nextWeek(); }

    s.trainT += dt;
    var iv = CFG.WEEK_SEC / S.trainsPerWeek();
    if (s.trainT >= iv) { s.trainT -= iv; S.train(); }
    if (G.train) { G.train.t += dt; if (G.train.t > 3.2) G.train = null; }

    mobT -= dt;
    if (mobT <= 0) { mobT = 2.5; S.spawnMob(); }

    var i;
    for (i = G.souls.length - 1; i >= 0; i--) { G.souls[i].update(dt); if (G.souls[i].dead) G.souls.splice(i, 1); }
    for (i = 0; i < G.residents.length; i++) G.residents[i].update(dt);
    for (i = G.mobs.length - 1; i >= 0; i--) { G.mobs[i].update(dt); if (G.mobs[i].dead) G.mobs.splice(i, 1); }
  };

  S.trainsPerWeek = function () {
    var st = G.buildings.find(function (b) { return b.def.extra.arrivals; });
    var tab = st && st.def.extra.trainsPerWeekByLv;
    return (tab && tab[st.lv - 1]) || CFG.TRAINS_PER_WEEK;
  };
  S.soulsPerTrain = function () {
    var s = G.state, lam = CFG.SOULS_BASE + State.pop() / CFG.SOULS_PER_POP;
    G.buildings.forEach(function (b) { var a = b.def.extra.arrivalsPerTrain; if (a) lam += a + (b.def.extra.perTwoLv || 0) * Math.floor((b.lv - 1) / 2); });
    G.residents.forEach(function (r) { if (r.job === "引渡貓" || r.charId === "mimi") lam += 0.08; });
    lam *= State.mod("trainMul", 1);
    return Math.min(lam, CFG.SOULS_CAP_TRAIN);
  };
  S.train = function () {
    G.train = { t: 0 };
    var lam = S.soulsPerTrain() + (G.state.bonusSouls || 0);
    G.state.bonusSouls = 0;
    var n = Math.floor(lam) + (Math.random() < lam % 1 ? 1 : 0);
    n = Math.min(n, CFG.SOUL_CAP - G.souls.length);
    var d = MapGen.stationDoor;
    for (var i = 0; i < n; i++) {
      var so = new Soul(d.x, d.y);
      so.px += U.rand(-8, 8);
      so.timer = 0.6 + i * 0.4; so.st = "idle";
      G.souls.push(so);
      G.state.stats.guests++;
    }
  };

  S.nextWeek = function () {
    var s = G.state;
    s.week++;
    s.pairsWeek = 0;
    if (s.week > 4) { s.week = 1; S.monthEnd(); s.month++; if (s.month > 12) { s.month = 1; s.year++; } }
    if (s.expedition && State.absWeek() >= s.expedition.back) Battle.finishExpedition();
    G.buildings.forEach(function (b) { if (b.queue && b.queue.length >= 2) S.tryPair(b); });
    Story.onWeek();
    State.save();
  };
  S.monthEnd = function () {
    var s = G.state, up = 0, merit = 0;
    G.buildings.forEach(function (b) {
      up += S.upkeepOf(b);
      var inc = b.def.extra.incense;
      if (inc) merit += (inc.meritPerMonth + (inc.meritPerLv || 0) * (b.lv - 1)) * State.mod("incenseMul", 1);
    });
    up = Math.round(up); merit = Math.round(merit);
    s.money -= up; s.merit += merit;
    s.lastMonth = { upkeep: up, merit: merit, income: s.monthIncome || 0 };
    s.monthIncome = 0;
    UI.toast("📅 月底結算：維持費 -" + U.fmt(up) + " 冥紙" + (merit ? "，香火功德 +" + merit : "") + "　上月營業額 " + U.fmt(s.lastMonth.income));
    // 4 月收住宅稅
    if (s.month === ((D.balance && D.balance.taxMonth) || 4)) {
      var tax = 0;
      G.buildings.forEach(function (b) { var e = b.def.extra; if (e.taxPerYear) tax += e.taxPerYear * Math.min(e.capacity || 1, State.plainResidents()); });
      if (tax) { s.money += tax; UI.toast("🏠 街坊繳稅 +" + U.fmt(tax) + " 冥紙"); }
    }
  };

  // ---------- 文印 ----------
  S.wenyinPerWeek = function () {
    var s = G.state, n = 0, base = (D.titles[s.title] || {}).wenyinPerWeek || 1;
    G.buildings.forEach(function (b) {
      var w = b.def.extra.wenyin; if (!w) return;
      if (w.setsPerWeek) n += w.setsPerWeek;
      else { n += base; (w.extraSetsAtLv || []).forEach(function (lv) { if (b.lv >= lv) n++; }); }
    });
    S.activeCombos().forEach(function (c) { n += (c.effect && c.effect.wenyinPerWeek) || 0; });
    if (!G.buildings.some(function (b) { return b.def.extra.wenyin; }) && G.buildings.some(function (b) { return b.def.serves.indexOf("tattoo") >= 0; })) n = base;
    return n;
  };
  S.tryPair = function (b) {
    var s = G.state;
    while (b.queue.length >= 2 && s.pairsWeek < S.wenyinPerWeek()) {
      var a = b.queue.shift(), c = b.queue.shift();
      [a, c].forEach(function (x) { x.wishes.shift(); x.peace = 100; x.st = "inside"; x.timer = 0.8; x.fulfilled++; });
      s.pairsWeek++; s.stats.pairs++; State.act("tattoo");
      var w = b.def.extra.wenyin || {};
      var dd = S.doorOf(b), X = dd.x * T + T / 2, Y = dd.y * T - 10;
      State.addMerit(Math.round((w.meritPerSet || CFG.PAIR_MERIT) * State.mod("wenyinMul", 1)), X, Y - 10);
      FX.spark(X, Y, "#e0423a"); FX.float(X, Y - 26, "❤ 緣分 UP", "#e0423a");
      State.addHelped(w.helpedPerSet || 2, "愛戀文印：" + a.name + " ✕ " + c.name);
      Story.onPair(a, c);
    }
  };

  // ---------- 外圍怪物 ----------
  S.lockedZones = function () { return MapGen.zones.filter(function (z) { return !MapGen.zoneOpen(z.id); }); };
  S.spawnMob = function (forceType, forceZone) {
    var cap = Math.round(CFG.MOB_CAP * State.mod("mobCap", 1));
    if (!forceType && G.mobs.length >= cap) return;
    var locked = S.lockedZones();
    if (!locked.length) return;
    var z = forceZone || U.pickWeighted(locked, function (z) { return 1 / (1 + locked.indexOf(z)); });
    var p = MapGen.randomWalkable(function (zz) { return zz === z.id; });
    if (!p) return;
    var depth = Math.max(1, locked.indexOf(z) + 1 + (z.wild ? 0 : 0));
    var type = forceType || U.pickWeighted(D.mobs, function (m) { var mm = State.mod("mobMul", null); return (mm && mm[m.id]) || 1; });
    var mul = D.zoneMul[Math.min(D.zoneMul.length - 1, depth - 1)] || 1;
    var lv = Math.max(1, Math.round((type.lv || depth * 2) * mul));
    G.mobs.push(new Mob(p.x, p.y, type, lv, z.id));
  };
  S.mobKilled = function (m, r) {
    m.dead = true;
    G.state.stats.kills++; r.kills++;
    r.gainExp(m.exp);
    r.money += m.gold;
    if (m.merit) State.addMerit(m.merit, m.px, m.py - 20);
    var chest = Math.min(0.6, 0.1 + r.luck / 500) / 3;
    if (Math.random() < chest) {
      var it = U.pick(["incense", "paper", "candy"]);
      G.state.items[it] = (G.state.items[it] || 0) + 1;
      FX.float(m.px, m.py - 34, "🎁 " + UI.itemName(it), "#f3d58c");
    }
    if ((m.type.become === "soul" || m.type.toSoul) && G.souls.length < CFG.SOUL_CAP) {
      var so = new Soul(m.tx, m.ty, { peace: 30 });
      so.st = "idle"; so.timer = 0.5;
      G.souls.push(so);
      FX.float(m.px, m.py - 40, "迷途魂醒過來了", "#c9c0d6");
    }
    r.st = "idle"; r.timer = 0.5;
  };

  // ---------- 擴建 ----------
  S.nextZone = function () { return MapGen.zones.find(function (z) { return !z.wild && !MapGen.zoneOpen(z.id); }) || null; };
  S.expandReq = function (z) {
    var a = D.activities.find(function (x) { return x.expand === z.id; });
    if (a) return { star: (a.need && (a.need.rank || a.need.star)) || 0, merit: a.merit };
    return CFG.EXPAND[z.id] || { star: 5, merit: 999 };
  };
  S.expand = function (z) {
    var r = S.expandReq(z);
    if (G.state.star < r.star) return "需要街區 ☆" + r.star;
    if (G.state.merit < r.merit) return "功德不夠（要 " + r.merit + "）";
    G.state.merit -= r.merit;
    G.state.zones.push(z.id);
    G.mobs.forEach(function (m) { if (m.zoneId === z.id) m.dead = true; });
    G.residents.forEach(function (rr) { if (rr.foe && rr.foe.dead) { rr.st = "idle"; rr.foe = null; } });
    S.refreshDoors();
    State.addPop(30);
    UI.toast("🗺️ 擴建完成：" + z.name + " 開放了！");
    return "";
  };

  return S;
})();
