// 走在地圖上的東西：亡魂（客人）、街坊、外圍的怪。
(function () {
  var T = CFG.TILE;
  var SUR = "陳林黃張李王吳劉蔡楊許鄭謝洪郭邱曾廖賴徐周葉蘇莊呂江何蕭羅高".split("");
  var GIV = ["小明", "阿華", "淑芬", "志強", "美玲", "家豪", "怡君", "俊傑", "雅婷", "建宏", "阿嬤", "阿公", "小雪", "大雄", "秀英", "文彬", "佳穎", "冠宇", "阿德", "麗珠"];
  function soulName() { return U.pick(SUR) + U.pick(GIV); }

  // ---- 共用：一格一格走 ----
  function Walker(x, y) {
    this.uid = U.uid();
    this.tx = x; this.ty = y;
    this.px = x * T + T / 2; this.py = y * T + T - 2;
    this.path = null; this.dir = 0; this.anim = 0; this.speed = CFG.SOUL_SPEED; this.hidden = false;
  }
  Walker.prototype.go = function (x, y, wild) {
    this.goal = { x: x, y: y, wild: wild };
    if (x === this.tx && y === this.ty) { this.path = []; return true; }
    var p = MapGen.path(this.tx, this.ty, x, y, { wild: wild });
    this.path = p;
    return !!p;
  };
  // 回傳 true 表示到了
  Walker.prototype.step = function (dt) {
    if (!this.path) return false;
    if (!this.path.length) { this.path = null; return true; }
    var n = this.path[0];
    if (!MapGen.walkable(n.x, n.y) && !(n.x === this.goal.x && n.y === this.goal.y)) {
      // 被新蓋的建築擋住，重新找路
      if (!this.go(this.goal.x, this.goal.y, this.goal.wild)) this.path = null;
      return false;
    }
    var gx = n.x * T + T / 2, gy = n.y * T + T - 2;
    var dx = gx - this.px, dy = gy - this.py;
    var mv = this.speed * T * dt;
    if (Math.abs(dx) > Math.abs(dy)) this.dir = dx < 0 ? 1 : 2; else if (dy) this.dir = dy < 0 ? 3 : 0;
    this.anim += dt * 4;
    if (Math.abs(dx) + Math.abs(dy) <= mv) { this.px = gx; this.py = gy; this.tx = n.x; this.ty = n.y; this.path.shift(); if (!this.path.length) { this.path = null; return true; } }
    else {
      var mx = Math.sign(dx) * Math.min(Math.abs(dx), mv);
      this.px += mx; this.py += Math.sign(dy) * Math.min(Math.abs(dy), mv - Math.abs(mx));
    }
    return false;
  };
  // ---- 動作：開心跳、出手前衝、被打閃白（用真實時間，畫面那邊依時間算位移） ----
  var HOP = 0.34;
  function now() { return performance.now() / 1000; }
  // 開心跳 n 下：心願完成、入住、升級、街上蓋了新店……
  Walker.prototype.hopAt = 0; Walker.prototype.hopUntil = 0;
  Walker.prototype.cheer = function (n, note) {
    if (this.hidden || this.away) return;
    var t = now(); if (this.hopUntil > t) return;
    this.hopAt = t; this.hopUntil = t + (n || 2) * HOP;
    if (note) FX.float(this.px, this.py, note, "#ffe38a", 34);
  };
  // 回傳跳的高度（世界座標 px）與落地壓扁量
  Walker.prototype.hop = function (t) {
    if (!(this.hopUntil > t)) return null;
    var k = (t - this.hopAt) / HOP, ph = k - Math.floor(k);
    return { h: Math.sin(ph * Math.PI) * 9, sq: ph < 0.14 || ph > 0.9 ? 0.16 : ph > 0.4 && ph < 0.6 ? -0.06 : 0 };
  };
  Walker.prototype.lunge = function () { this.lungeAt = now(); };
  Walker.prototype.hurt = function () { this.hurtAt = now(); };
  // 站著時偶爾東張西望
  Walker.prototype.fidget = function (dt) { if (Math.random() < dt * 0.3) this.dir = (Math.random() * 4) | 0; };
  Walker.prototype.near = function (o, r) { return Math.abs(o.tx - this.tx) + Math.abs(o.ty - this.ty) <= (r || 1); };

  // =====================================================================
  // 亡魂
  function wishPool() {
    var mul = State.mod("wishMul", null) || {};
    return D.wishes.filter(function (w) { return !w.final && !w.residentOnly && w.weight > 0 && Sim.cond(w.unlock); })
      .map(function (w) { return { w: w, k: w.weight * (mul[w.id] || 1) }; });
  }
  // 資質：每位亡魂天生不一樣，留下來當街坊時加在能力上（魂力的單位比較大）
  var TALENT = {
    魂力: { tag: "耐打", tip: "HP 高，巡守撐得久" }, 膽量: { tag: "膽子大", tip: "攻擊高，適合巡守打怪" },
    手藝: { tag: "手巧", tip: "攻擊次數多" }, 定力: { tag: "沉穩", tip: "防禦高，不容易受傷" },
    靈力: { tag: "靈感強", tip: "用法術攻擊" }, 福報: { tag: "好運", tip: "打怪更常掉寶箱和禮物" }
  };
  function rollApt() {
    var a = {}, keys = ["魂力", "膽量", "手藝", "定力", "靈力", "福報"];
    keys.forEach(function (k) { a[k] = U.randi(0, 3); });
    var top = U.pick(keys); a[top] += U.randi(2, 4);
    a.魂力 *= 4;
    return a;
  }
  // 資質評分 1～3 星、特長（最高的那一項）
  function aptInfo(a) {
    if (!a) return null;
    var sum = 0, best = null, bv = -1;
    Object.keys(a).forEach(function (k) { var v = k === "魂力" ? a[k] / 4 : a[k]; sum += v; if (v > bv) { bv = v; best = k; } });
    return { stars: sum >= 13 ? 3 : sum >= 9 ? 2 : 1, best: best, tag: TALENT[best].tag, tip: TALENT[best].tip };
  }
  function Soul(x, y, opts) {
    Walker.call(this, x, y);
    opts = opts || {};
    this.kind = "soul";
    this.name = soulName();
    this.skin = U.randi(1, 8);
    this.money = Math.round((CFG.WALLET_BASE + State.pop() * CFG.WALLET_PER_POP) * U.rand(0.7, 1.3));
    this.peace = opts.peace || CFG.START_PEACE;
    this.visits = 0; this.fulfilled = 0;
    this.lastB = 0;
    // 心願 1～N 個：偏好街上有人服務的，但也會有街上還沒有的（引導玩家蓋）
    var served = {};
    G.buildings.forEach(function (b) { b.def.serves.forEach(function (s) { served[s] = 1; }); });
    var pool = wishPool();
    var r = Math.random(), n = 1, acc = 0;
    for (var i = 0; i < CFG.WISH_COUNT.length; i++) { acc += CFG.WISH_COUNT[i]; if (r < acc) { n = i + 1; break; } }
    this.wishes = [];
    for (i = 0; i < n && pool.length; i++) {
      var p = U.pickWeighted(pool, function (o) { return o.k * (served[o.w.id] ? 3 : 1); });
      if (p && this.wishes.indexOf(p.w.id) < 0) this.wishes.push(p.w.id);
    }
    this.wishTotal = this.wishes.length;
    this.apt = rollApt();
    this.st = "arrive"; this.timer = 0;
    this.speed = CFG.SOUL_SPEED * U.rand(0.85, 1.15);
  }
  Soul.prototype = Object.create(Walker.prototype);
  Soul.prototype.wish = function () { return this.wishes[0]; };

  function openShops() {
    return G.buildings.filter(function (b) { return b.door && Sim.isOpen(b) && b.def.cat !== "road" && !b.def.fixed && MapGen.zoneOpen(MapGen.zone[MapGen.idx(b.door.x, b.door.y)]); });
  }
  Soul.prototype.chooseTarget = function () {
    var self = this, w = this.wish(), open = openShops();
    var cands = w ? open.filter(function (b) { return b.def.serves.indexOf(w) >= 0 && Sim.priceOf(b) <= self.money + 5; }) : [];
    if (!cands.length) {
      // 沒有對應的店：先把這個心願擱著，逛逛別家（開羅：每趟逛 4 家左右）
      if (w && Math.random() < 0.5) { this.wishes.push(this.wishes.shift()); }
      cands = open.filter(function (b) { return b.uid !== self.lastB && b.def.price > 0 && Sim.priceOf(b) <= self.money && b.def.serves.indexOf("tattoo") < 0; });
    }
    if (!cands.length) return null;
    return U.pickWeighted(cands, function (b) { return (Sim.appealOf(b) + 3) / (1 + (Math.abs(b.door.x - self.tx) + Math.abs(b.door.y - self.ty)) * 0.03); });
  };

  Soul.prototype.think = function () {
    if (!this.wishes.length || this.visits >= CFG.VISITS_MAX || this.money < 5) return this.finish();
    var b = this.chooseTarget();
    if (!b) {
      // 沒地方去：逛一下，然後走
      this.visits++;
      if (this.visits >= 2) return this.finish();
      var r = MapGen.randomWalkable(function (z) { return MapGen.zoneOpen(z); });
      if (r && this.go(r.x, r.y)) { this.st = "stroll"; return; }
      return this.finish();
    }
    this.target = b;
    if (this.go(b.door.x, b.door.y)) this.st = "walk"; else { this.lastB = b.uid; this.visits++; this.st = "idle"; this.timer = 0.5; }
  };

  Soul.prototype.enter = function (b) {
    this.st = "inside"; this.hidden = true; this.inB = b;
    this.timer = U.rand(1.5, 3);
    if (this.wish() === "tattoo" && b.def.serves.indexOf("tattoo") >= 0) {
      this.st = "pairwait"; this.timer = CFG.WEEK_SEC * 0.6;
      b.queue = b.queue || []; b.queue.push(this); Sim.tryPair(b);
    }
  };

  Soul.prototype.exit = function (b) {
    if (this.pairJoy) { this.pairJoy = false; var me = this; setTimeout(function () { me.cheer(3, "❤"); }, 30); }
    this.hidden = false; this.inB = null; this.lastB = b.uid; this.visits++;
    var def = b.def, price = Math.round(Sim.priceOf(b));
    var paid = Math.min(price, this.money);
    var dr = Sim.doorOf(b);
    if (!MapGen.walkable(this.tx, this.ty) && b.door) { this.tx = b.door.x; this.ty = b.door.y; this.px = this.tx * T + T / 2; this.py = this.ty * T + T - 2; }
    if (paid > 0) { this.money -= paid; State.addMoney(paid, dr.x * T + T / 2, dr.y * T - 4); b.income += paid; }
    b.visits++; G.state.stats.visits++;
    var w = this.wish(), qf = Sim.qf(b);
    if (w && def.serves.indexOf(w) >= 0 && w !== "tattoo") {
      this.peace += CFG.PEACE_WISH * qf;
      State.act(w); this.cheer(1);
      if (w === "dream") this.dream(b);
      this.wishes.shift(); this.fulfilled++;
    } else if (w === "tattoo" && def.serves.indexOf("tattoo") >= 0) {
      // 等不到另一半：心願放下，只得一點安心
      this.peace += CFG.PEACE_OTHER * qf; this.wishes.shift();
    } else this.peace += CFG.PEACE_OTHER * qf;
    State.addPop(CFG.POP_PER_VISIT * qf * 10 / 10);
    this.peace = Math.min(100, this.peace);
    this.st = "idle"; this.timer = U.rand(0.2, 0.8);
  };
  Soul.prototype.dream = function (b) {
    var d = b.def.extra.dream || { meritCost: CFG.DREAM_MERIT_COST, helped: 1, anshin: 30 };
    if (G.state.merit < (d.meritCost || 0)) { FX.float(this.px, this.py, "功德不夠，只拍了照", "#c9c0d6", 30); return; }
    G.state.merit -= d.meritCost || 0;
    this.peace += d.anshin || 30; G.state.stats.dreams++;
    State.addHelped(d.helped || 1);
    FX.spark(this.px, this.py, "#9fe0d8", 16);
    FX.float(this.px, this.py, "托夢成功", "#9fe0d8", 30);
    this.cheer(3);
  };

  // 離開前判定（B 的模型）：心願全滿足，且 亂數 < 安心度 → 安心了；否則帶著遺憾離開
  Soul.prototype.finish = function () {
    var content = !this.wishes.length && this.wishTotal > 0 && Math.random() * 100 < this.peace;
    if (this.peace >= 100 && !this.wishes.length) content = true;
    if (content) {
      this.peace = 100;
      // 住處不夠沒關係，留下來的人會自己蓋小屋；上限看街區評價
      var canStay = State.plainResidents() < (CFG.GENERIC_CAP[G.state.star] || 99) && UI.noticeCount() < 3;
      if (canStay && Math.random() < CFG.STAY_CHANCE) {
        this.st = "decide"; this.timer = CFG.NOTICE_TIMEOUT;
        UI.notice(this);
        return;
      }
      return this.toReincarnate();
    }
    G.state.stats.leftUnhappy++; State.addPop(CFG.POP_UNHAPPY);
    this.st = "leave";
    if (!this.go(MapGen.stationDoor.x, MapGen.stationDoor.y)) this.dead = true;
  };
  Soul.prototype.toReincarnate = function () {
    if (State.mod("blockReincarnate", null)) { this.st = "leave"; FX.float(this.px, this.py, "奈何橋封禁中…", "#c9c0d6", 30); if (!this.go(MapGen.stationDoor.x, MapGen.stationDoor.y)) this.dead = true; return; }
    var yk = G.buildings.find(function (b) { return (b.def.extra.macaron || b.def.serves.indexOf("reincarnate") >= 0) && b.door && Sim.isOpen(b); });
    if (yk && !this.ateMacaron) { this.st = "macaron"; this.target = yk; if (this.go(yk.door.x, yk.door.y)) return; }
    this.st = "reinc";
    if (!this.go(MapGen.exit.x, MapGen.exit.y)) this.reincarnateNow();
  };
  Soul.prototype.reincarnateNow = function () {
    var merit = CFG.SENDOFF_MERIT;
    if (this.ateMacaron) {
      var yk = G.buildings.find(function (b) { return b.def.extra.macaron; });
      merit = yk ? yk.def.extra.macaron.meritPerSoul : CFG.SENDOFF_MERIT * CFG.MACARON_MUL;
      if (Sim.activeCombos().some(function (c) { return c.effect && c.effect.macaronMeritPct; })) merit *= 1 + Sim.activeCombos().reduce(function (a, c) { return a + ((c.effect && c.effect.macaronMeritPct) || 0); }, 0) / 100;
    }
    State.addMerit(Math.round(merit), this.px, this.py - 20);
    G.state.stats.reincarnated++; State.act("sendoff");
    State.addHelped(1);
    FX.spark(this.px, this.py, "#f6c6b0", 12);
    this.dead = true;
  };
  Soul.prototype.stayAsResident = function () {
    var r = new Resident(this.tx, this.ty, { name: this.name, skin: this.skin, apt: this.apt });
    G.residents.push(r);
    State.addHelped(1, this.name + " 留下來當街坊");
    if (State.plainResidents() > State.housing()) {
      var home = Sim.autoHouse({ x: this.tx, y: this.ty });
      UI.toast(home ? this.name + " 在街上蓋了一間自己的小屋" : "街上沒有空地蓋小屋了，" + this.name + " 先住在茶館");
    }
    FX.spark(this.px, this.py, "#cfe3c4", 12);
    this.dead = true;
  };

  Soul.prototype.update = function (dt) {
    this.timer -= dt;
    switch (this.st) {
      case "arrive": this.think(); break;
      case "walk":
        if (this.step(dt)) { if (this.target && G.buildings.indexOf(this.target) >= 0 && Sim.isOpen(this.target)) this.enter(this.target); else this.think(); }
        else if (!this.path) this.think();
        break;
      case "stroll": if (this.step(dt) || !this.path) { this.st = "idle"; this.timer = 1; } break;
      case "inside": if (this.timer <= 0) this.exit(this.inB); break;
      case "pairwait":
        if (this.timer <= 0) { var b = this.inB; if (b.queue) { var qi = b.queue.indexOf(this); if (qi >= 0) b.queue.splice(qi, 1); } this.exit(b); }
        break;
      case "idle": this.fidget(dt); if (this.timer <= 0) this.think(); break;
      case "decide":
        this.anim += dt; this.dir = 0;
        if (Math.random() < dt * 0.9) this.cheer(1);
        if (this.timer <= 0) { UI.dropNotice(this); this.toReincarnate(); }
        break;
      case "macaron":
        if (this.step(dt) || !this.path) {
          this.ateMacaron = true; this.hidden = true; this.st = "eating"; this.timer = 1.5;
          State.act("macaron");
          var y = this.target; if (y) { var yd = Sim.doorOf(y); y.visits++; FX.float(yd.x * T + 16, yd.y * T, "遺願馬卡龍", "#f6c6b0", 8); }
        }
        break;
      case "eating": if (this.timer <= 0) { this.hidden = false; this.cheer(2, "♪"); this.st = "reinc"; if (!this.go(MapGen.exit.x, MapGen.exit.y)) this.reincarnateNow(); } break;
      case "reinc": if (this.step(dt) || !this.path) this.reincarnateNow(); break;
      case "leave": if (this.step(dt) || !this.path) this.dead = true; break;
    }
  };

  // =====================================================================
  // 街坊（屬性照 B：魂力＝HP、膽量＝攻擊、手藝＝攻擊次數、定力＝防禦、靈力＝法術、福報＝寶箱）
  var STATS = ["魂力", "膽量", "手藝", "定力", "靈力", "福報"];
  function Resident(x, y, o) {
    Walker.call(this, x, y);
    o = o || {};
    this.kind = "resident";
    if (o.uid) this.uid = o.uid;
    this.name = o.name || soulName();
    this.charId = o.charId || null;
    this.skin = o.skin || U.randi(1, 8);
    this.job = o.job || "新魂";
    this.lv = o.lv || 1; this.exp = o.exp || 0;
    this.money = o.money || 50;
    this.kills = o.kills || 0;
    // 滿足（送禮物會升、每週慢慢降，越高 EXP 越多）、勤奮度（每顧一次店 +1，越高店品質越好）
    this.joy = o.joy != null ? o.joy : 30; this.dili = o.dili || 0;
    this.apt = o.apt || null;   // 從亡魂留下來的才有資質
    this.calc();
    this.hp = o.hp != null ? Math.min(o.hp, this.maxhp) : this.maxhp;
    this.away = !!o.away; this.awayUntil = o.awayUntil || 0;
    this.st = "idle"; this.timer = U.rand(0.5, 2);
    this.speed = CFG.SOUL_SPEED * 1.1;
  }
  Resident.prototype = Object.create(Walker.prototype);
  Resident.STATS = STATS;
  Resident.prototype.jobDef = function () { return D.jobByName[this.job] || D.jobByName["新魂"]; };
  Resident.prototype.calc = function () {
    var j = this.jobDef(), s = {}, base = D.baseStats;
    var mul = this.charId ? 1.15 : 1;
    if (this.charId === "yutong") mul *= (D.titles[G.state ? G.state.title : 0] || {}).growthMul || 1;
    var apt = this.apt || {};
    STATS.forEach(function (k) { s[k] = Math.round((base[k] + (apt[k] || 0) + j.growth[k] * (this.lv - 1)) * mul); }, this);
    this.st6 = s;
    this.maxhp = s.魂力;
    this.magic = s.靈力 > s.膽量;
    this.atk = this.magic ? s.靈力 * 1.3 : s.膽量;
    this.hits = 1 + Math.floor(s.手藝 / 30);
    this.defn = s.定力;
    this.luck = s.福報;
  };
  Resident.prototype.toSave = function () { return { uid: this.uid, name: this.name, charId: this.charId, skin: this.skin, job: this.job, lv: this.lv, exp: this.exp, money: this.money, kills: this.kills, hp: Math.round(this.hp), away: this.away, awayUntil: this.awayUntil, joy: Math.round(this.joy), dili: this.dili, apt: this.apt }; };
  Resident.prototype.expNeed = function () { return Math.round(D.expCurve.base * Math.pow(this.lv, D.expCurve.pow)); };
  Resident.prototype.gainExp = function (n) {
    this.exp += Math.round(n * (1 + (this.joy || 0) / 200));
    while (this.exp >= this.expNeed() && this.lv < 99) { this.exp -= this.expNeed(); this.lv++; this.calc(); this.hp = this.maxhp; if (!this.away) { FX.float(this.px, this.py, "Lv UP!", "#9fe0d8", 30); SFX.play("levelup", 1); this.cheer(3); } }
  };
  Resident.prototype.ownBuilding = function () {
    var c = this.charId && D.charById[this.charId];
    if (!c || !c.brings) return null;
    return G.buildings.find(function (b) { return b.id === c.brings; }) || null;
  };
  Resident.prototype.busy = function () { return this.awayUntil > State.absWeek(); };

  Resident.prototype.think = function () {
    var self = this;
    this.target = null; this.foe = null;
    if (this.hp < this.maxhp * 0.45) return this.goRest();
    // 上班：主要角色顧自己的店；一般街坊找缺人的店
    var own = this.ownBuilding();
    if (own && own.door && Sim.isOpen(own) && Math.random() < 0.5) { this.target = own; if (this.go(own.door.x, own.door.y)) { this.st = "towork"; return; } }
    if (!own && Math.random() < 0.35) {
      var need = G.buildings.filter(function (b) { return b.def.work > 0 && b.door && Sim.isOpen(b) && !Sim.staffed(b) && !b.walkingStaff; });
      var wb = need.length && U.pick(need);
      if (wb && this.go(wb.door.x, wb.door.y)) { this.target = wb; wb.walkingStaff = this; this.st = "towork"; return; }
    }
    if (G.mobs.length && this.hp > this.maxhp * 0.7 && Math.random() < 0.5) {
      var best = null, bd = 1e9;
      G.mobs.forEach(function (m) { if (m.dead || m.engaged) return; var d = Math.abs(m.tx - self.tx) + Math.abs(m.ty - self.ty) + Math.max(0, m.lv - self.lv) * 4; if (d < bd) { bd = d; best = m; } });
      if (best && best.lv <= this.lv + 4 && this.go(best.tx, best.ty, true)) { this.foe = best; this.st = "hunt"; this.timer = 25; return; }
    }
    if (this.money > 30 && Math.random() < 0.3) {
      var shops = G.buildings.filter(function (b) { return b.door && b.def.price > 0 && Sim.priceOf(b) <= self.money && Sim.isOpen(b) && !b.def.fixed && b.def.serves.indexOf("tattoo") < 0; });
      var s = shops.length && U.pick(shops);
      if (s && this.go(s.door.x, s.door.y)) { this.target = s; this.st = "toshop"; return; }
    }
    var r = MapGen.randomWalkable(function (z) { return MapGen.zoneOpen(z); });
    if (r && this.go(r.x, r.y)) { this.st = "wander"; return; }
    this.st = "idle"; this.timer = 2;
  };
  Resident.prototype.goRest = function () {
    var self = this;
    var inns = G.buildings.filter(function (b) { return b.door && Sim.isOpen(b) && (b.def.extra.recover || (b.def.serves.indexOf("rest") >= 0 && b.def.cat !== "deco")); });
    var inn = inns.length ? inns.reduce(function (a, b) { return Math.abs(a.door.y - self.ty) < Math.abs(b.door.y - self.ty) ? a : b; }) : null;
    var tgt = inn ? inn.door : MapGen.stationDoor;
    this.target = inn;
    if (this.go(tgt.x, tgt.y, true)) this.st = "torest"; else { this.st = "resting"; this.hidden = true; this.timer = 4; }
  };
  Resident.prototype.update = function (dt) {
    if (this.away) return;
    this.timer -= dt;
    switch (this.st) {
      case "idle": this.fidget(dt); if (this.timer <= 0) this.think(); break;
      case "wander": if (this.step(dt) || !this.path) { this.st = "idle"; this.timer = U.rand(1, 3); } break;
      case "toshop":
        if (this.step(dt) || !this.path) {
          var tb = this.target;
          if (tb && G.buildings.indexOf(tb) >= 0 && tb.door && this.tx === tb.door.x && this.ty === tb.door.y) {
            var p = Math.round(Sim.priceOf(tb));
            if (this.money >= p) { this.money -= p; State.addMoney(p, this.px, this.py - 24); tb.income += p; tb.visits++; }
            this.hidden = true; this.st = "inshop"; this.timer = 1.5;
          } else { this.st = "idle"; this.timer = 1; }
        }
        break;
      case "inshop": if (this.timer <= 0) { this.hidden = false; this.st = "idle"; this.timer = 1; } break;
      case "towork":
        if (this.step(dt) || !this.path) {
          var wb = this.target;
          if (wb) {
            wb.walkingStaff = null; this.st = "work"; this.timer = U.rand(8, 14); wb.staffedUntil = G.time + this.timer; wb.staffer = this;
            this.dili = Math.min(99, (this.dili || 0) + 1);
            var wk = this.jobDef().work || {};
            wb.staffBonus = Object.assign({}, wk, { qualityPct: (wk.qualityPct || 0) + Math.floor(this.dili / 5) + (this.joy >= 70 ? 5 : 0) });
          }
          else { this.st = "idle"; this.timer = 0.5; }
        }
        break;
      case "work": this.dir = 0; if (this.timer <= 0) { this.st = "idle"; this.timer = 0.5; } break;
      case "hunt":
        var m = this.foe;
        if (!m || m.dead || this.timer <= 0) { this.st = "idle"; this.timer = 0.5; break; }
        if (this.near(m, 1)) { this.path = null; this.st = "fight"; this.atkT = 0.3; m.engaged = this; break; }
        if (this.step(dt) || !this.path) { if (!this.go(m.tx, m.ty, true)) { this.st = "idle"; this.timer = 1; } }
        break;
      case "fight":
        var f = this.foe;
        if (!f || f.dead) { this.st = "idle"; this.timer = 0.6; break; }
        this.dir = f.tx < this.tx ? 1 : f.tx > this.tx ? 2 : f.ty < this.ty ? 3 : 0;
        this.atkT -= dt;
        if (this.atkT <= 0) {
          this.atkT = 0.8; this.lunge(); f.hurt();
          f.dir = this.tx < f.tx ? 1 : this.tx > f.tx ? 2 : this.ty < f.ty ? 3 : 0;
          for (var h = 0; h < this.hits; h++) {
            var dmg = Math.max(1, Math.round(this.atk * U.rand(0.9, 1.1) - f.def / (this.magic ? 4 : 2)));
            f.hp -= dmg; FX.float(f.px + U.rand(-6, 6), f.py, "-" + dmg, "#ffffff", 26);
          }
          if (f.hp <= 0) { Sim.mobKilled(f, this); break; }
          var back = Math.max(1, Math.round(f.atk * U.rand(0.9, 1.1) - this.defn / 2));
          this.hp -= back; this.hurt(); f.lunge(); FX.float(this.px + U.rand(-6, 6), this.py, "-" + back, "#e0423a", 26);
          if (this.hp <= 0) { this.hp = 1; f.engaged = null; FX.float(this.px, this.py, "撤退！", "#f08a6a", 36); this.goRest(); }
        }
        break;
      case "torest":
        if (this.step(dt) || !this.path) {
          if (this.target && this.target.door) { var pr = Math.round(Sim.priceOf(this.target)); if (this.money >= pr) { this.money -= pr; State.addMoney(pr); this.target.income += pr; } this.target.visits++; }
          this.hidden = true; this.st = "resting"; this.timer = this.target ? 3 : 6;
        }
        break;
      case "resting": if (this.timer <= 0) { this.hp = this.maxhp; this.hidden = false; this.st = "idle"; this.timer = 0.5; } break;
    }
  };

  // =====================================================================
  // 外圍的怪（數值照 B 的 HQ.mobs，再依外圍深度放大）
  function lvStats(L) { return { hp: 20 + 10 * L + 0.25 * L * L, atk: 4 + 2.3 * L + 0.035 * L * L, def: 2 + 1.6 * L + 0.02 * L * L }; }
  function Mob(x, y, type, lv, zone) {
    Walker.call(this, x, y);
    this.kind = "mob"; this.type = type; this.lv = lv; this.zoneId = zone;
    this.name = type.name;
    var b0 = lvStats(type.lv || 1), b1 = lvStats(lv);
    var hp = type.hp || b0.hp, atk = type.atk || b0.atk, def = type.def != null ? type.def : b0.def;
    this.maxhp = Math.round(hp * b1.hp / b0.hp); this.hp = this.maxhp;
    this.atk = atk * b1.atk / b0.atk; this.def = def * b1.def / b0.def;
    this.exp = Math.round((type.exp || 4 + 2.2 * (type.lv || 1)) * lv / (type.lv || 1));
    this.gold = Math.round((type.gold || 10) * lv / (type.lv || 1));
    this.merit = type.merit != null ? type.merit : 1;
    this.speed = 0.9; this.timer = U.rand(1, 4);
  }
  Mob.prototype = Object.create(Walker.prototype);
  Mob.prototype.update = function (dt) {
    if (this.engaged && (this.engaged.st !== "fight" || this.engaged.foe !== this)) this.engaged = null;
    if (this.engaged) { this.path = null; return; }
    this.timer -= dt;
    if (this.path) { this.step(dt); return; }
    if (this.timer <= 0) {
      this.timer = U.rand(2, 5);
      var nx = this.tx + U.randi(-3, 3), ny = this.ty + U.randi(-3, 3);
      if (MapGen.inb(nx, ny) && MapGen.walkable(nx, ny) && MapGen.zone[MapGen.idx(nx, ny)] === this.zoneId) this.go(nx, ny, true);
    }
  };

  Soul.aptInfo = aptInfo;
  window.Soul = Soul; window.Resident = Resident; window.Mob = Mob;
})();
