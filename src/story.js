// 劇情面：角色入住、委託簿、事件、行事曆、教學、觀音評定、活動。
window.Story = (function () {
  var S = {};

  function L(who, text, id) { return { who: who, text: text, id: id || S.charIdByName(who) || "", ep: "" }; }
  // C：說話者是「還沒入住的街坊」的句子可以跳過
  // 對話一律過濾：還沒搬來的街坊、沒來訪的外賓不會突然開口（正在入住的那位除外）
  S.filterLines = function (lines) {
    var s = G.state;
    return lines.filter(function (l) {
      if (l.cond && l.cond.resident && !s.charsIn[l.cond.resident]) return false;
      if (l.cond && l.cond.absent && s.charsIn[l.cond.absent]) return false;
      var c = l.id && D.charById[l.id];
      if (!c || c.start || s.charsIn[c.id] || s.visiting === c.id) return true;
      if (c.kind === "resident") return false;
      return true;   // 外賓、委託人、陽間的人：出現在他們自己的事件裡
    });
  };
  S.charIdByName = function (n) { var c = D.charById[n]; return c ? c.id : null; };

  // ---------- 效果（C 線 effect 鍵） ----------
  S.applyEffect = function (eff, ctx) {
    var out = [], s = G.state;
    if (!eff) return out;
    if (typeof eff === "string") { out.push(eff); return out; }
    if (eff.ifResident) {
      var alt = null;
      Object.keys(eff.ifResident).forEach(function (id) { if (!alt && s.charsIn[id]) alt = eff.ifResident[id]; });
      if (alt) return S.applyEffect(alt, ctx);
    }
    function num(keys) { for (var i = 0; i < keys.length; i++) if (eff[keys[i]] != null) return +eff[keys[i]]; return null; }
    var v;
    if ((v = num(["money", "冥紙"])) != null) { s.money += v; out.push("冥紙 " + (v >= 0 ? "+" : "") + v); }
    if ((v = num(["merit", "功德"])) != null) { s.merit += v; out.push("功德 " + (v >= 0 ? "+" : "") + v); }
    if ((v = num(["popularity", "人氣"])) != null) { State.addPop(v); out.push("人氣 " + (v >= 0 ? "+" : "") + v); }
    if ((v = num(["helped", "幫助"])) != null) { State.addHelped(v); out.push("已幫助 +" + v); }
    if ((v = num(["medals"])) != null) { s.medals = (s.medals || 0) + v; out.push("勳章 +" + v); }
    var tr = eff.traits || eff.特徵;
    if (tr) Object.keys(tr).forEach(function (k) { s.traitBonus[k] = (s.traitBonus[k] || 0) + tr[k]; out.push(k + " " + (tr[k] >= 0 ? "+" : "") + tr[k]); });
    var un = eff.unlock || eff.building;
    if (un) [].concat(un).forEach(function (id) { if (D.bById[id]) { s.unlocked[id] = 1; out.push("解鎖「" + D.bById[id].name + "」"); } });
    if (eff.item) [].concat(eff.item).forEach(function (id) { s.items[id] = (s.items[id] || 0) + 1; out.push("得到 " + UI.itemName(id)); });
    if (eff.flag) [].concat(eff.flag).forEach(function (f) { s.flags[f] = 1; });
    if (eff.unflag) [].concat(eff.unflag).forEach(function (f) { delete s.flags[f]; });
    if (eff.movein) [].concat(eff.movein).forEach(function (id) { if (typeof id === "string") S.queueMovein(id); });
    if (eff.guest) { s.guests[eff.guest] = State.absWeek() + 4; var gc = D.charById[eff.guest]; out.push((gc ? gc.name : eff.guest) + " 來街上作客"); }
    if (eff.spawn) [].concat(eff.spawn).forEach(function (sp) {
      var type = D.mobs.find(function (m) { return m.id === sp.mob; }) || D.enemyById[sp.mob] || D.mobs[0];
      for (var i = 0; i < (sp.n || 1); i++) Sim.spawnMob(type);
      out.push((type ? type.name : "怪物") + " 出現了");
    });
    if (eff.close) { var cb = G.buildings.find(function (b) { return b.id === eff.close.building; }); if (cb) { cb.closedUntil = State.absWeek() + (typeof eff.close.weeks === "number" ? eff.close.weeks : 2); out.push(cb.def.name + " 暫停營業"); } }
    if (eff.away) { var wk = eff.away.weeks || 1; G.residents.forEach(function (r) { if (r.charId && [].concat(eff.away.chars).indexOf(r.charId) >= 0) r.awayUntil = State.absWeek() + wk; }); }
    if (eff.trainMul) State.addMods({ trainMul: eff.trainMul.mul }, eff.trainMul.weeks);
    if (eff.block) State.addMods({ blockReincarnate: true }, eff.block.weeks);
    if (eff.next) s.schedule.push({ event: eff.next.event, at: State.absWeek() + (eff.next.inWeeks || 1) });
    if (eff.defense) s.schedule.push({ defense: eff.defense.id || true, at: State.absWeek() + (eff.defense.inWeeks || 1) });
    if (eff.job) { s.unlockedJobs = s.unlockedJobs || {}; s.unlockedJobs[eff.job] = 1; }
    if (eff.text) out.push(eff.text);
    return out;
  };

  // ---------- 角色入住 ----------
  S.addCharResident = function (c, silent) {
    var s = G.state;
    if (s.charsIn[c.id]) return;
    s.charsIn[c.id] = State.absWeek() + 1;
    var d = MapGen.stationDoor;
    var r = new Resident(d.x, d.y, { name: c.name, charId: c.id, job: c.job || "新魂", lv: c.lv || (c.start ? 3 : 5) });
    G.residents.push(r);
    if (c.brings && D.bById[c.brings]) { s.gifts[c.brings] = 1; s.unlocked[c.brings] = 1; }
    if (!silent) {
      UI.toast("🏠 " + c.name + " 入住了！" + (c.brings && D.bById[c.brings] ? "　帶來「" + D.bById[c.brings].name + "」（首間免費）" : ""));
      State.addPop(10);
    }
  };
  S.moveIn = function (c) {
    if (G.state.charsIn[c.id] || G.state.visiting === c.id) return;
    G.state.visiting = c.id;
    var lines = (c.arrive && c.arrive.length ? c.arrive : c.lines.slice(0, 2)).slice();
    if (!lines.length) lines = [L(c.name, "這條街看起來不錯，我想住下來。", c.id)];
    var guest = c.kind === "guest";
    var note = c.name + (guest ? " 會在街上作客一陣子。" : " 成為街坊了。");
    if (c.brings && D.bById[c.brings]) note += "「建設」裡可以免費蓋一間「" + D.bById[c.brings].name + "」。";
    else if (c.perk) note += c.perk;
    lines.push(L("", "（" + note + "）"));
    UI.dialog({ title: (guest ? "外賓來訪：" : "新街坊：") + c.name, lines: lines }, function () {
      G.state.visiting = null; S.addCharResident(c);
      if (c.brings && D.bById[c.brings]) UI.highlight("build");
    });
  };
  S.queueMovein = function (id) { var c = D.charById[id]; if (c && !G.state.charsIn[c.id]) { G.state.pendingMovein = G.state.pendingMovein || []; if (G.state.pendingMovein.indexOf(c.id) < 0) G.state.pendingMovein.push(c.id); } };

  var LIVE_KINDS = { resident: 1, guest: 1 };
  function moveinReady(c) {
    var s = G.state, m = c.movein;
    if (!m || s.charsIn[c.id] || c.reviewer || c.start) return false;
    if (c.kind && !LIVE_KINDS[c.kind]) return false;
    if (m.request) return false; // 委託完成時才入住
    if (m.order != null) {
      // 依序：order 比較小的都入住了、上一位住滿 2 週才輪到
      var prev = D.chars.filter(function (o) { return o.movein && o.movein.order != null && o.movein.order < m.order && (!o.kind || LIVE_KINDS[o.kind]); });
      if (prev.some(function (o) { return !s.charsIn[o.id]; })) return false;
      var last = Math.max.apply(null, [0].concat(prev.map(function (o) { return s.charsIn[o.id] || 0; })));
      if (State.absWeek() + 1 - last < (m.weeks || 2)) return false;
    }
    return Sim.cond(m, { order: 1, weeks: 1 });
  }
  S.nextMovein = function () { return D.chars.filter(moveinReady).sort(function (a, b) { return ((a.movein.order != null ? a.movein.order : 50) - (b.movein.order != null ? b.movein.order : 50)); })[0] || null; };

  // ---------- 委託簿 ----------
  S.visibleRequests = function () {
    var s = G.state, out = [], active = 0;
    D.requests.forEach(function (r) {
      var st = s.requests[r.id];
      if (st && st.st === "done") { out.push(r); return; }
      if (st) { active++; out.push(r); return; }
      if (active >= 4) return;
      if (!Sim.cond(r.when)) return;
      if (r.after && !(s.requests[r.after] && s.requests[r.after].st === "done")) return;
      active++;
      s.requests[r.id] = { st: "new", base: Object.assign({}, s.stats.actions) };
      UI.badge(true);
      out.push(r);
    });
    return out;
  };
  S.acceptRequest = function (r) {
    var st = G.state.requests[r.id];
    if (!st || st.st !== "new") return;
    st.st = "active"; st.base = Object.assign({}, G.state.stats.actions);
    if (r.intro.length) UI.dialog({ title: "委託：" + r.title, lines: r.intro }, function () { UI.openSheet("requests"); });
  };
  S.needMet = function (r, n) {
    var s = G.state, st = s.requests[r.id] || { base: {} };
    if (st.st === "new") return false;
    if (n.action) {
      var a = { dream: "dream", tattoo: "tattoo", macaron: "macaron", wenyin: "tattoo", sendoff: "sendoff" }[n.action] || n.action;
      if (n.action === "comfort") return G.residents.some(function (x) { return /慰靈犬|引渡貓/.test(x.job) || x.charId === "heitang" || x.charId === "mimi"; });
      return ((s.stats.actions[a] || 0) - ((st.base || {})[a] || 0)) >= (n.count || n.n || 1);
    }
    if (n.pay != null) return s.merit >= n.pay;
    if (n.trait) return (State.traits()[n.trait] || 0) >= (n.min || 1);
    if (n.residents != null) return G.residents.length >= n.residents;
    if (n.merit != null) return s.merit >= n.merit;
    if (n.count) return S.countSince(n.count, st.base) >= (n.n || 1);
    return Sim.cond(n);
  };
  S.countSince = function (what, base) {
    var a = G.state.stats.actions, key = { sendoff: "sendoff", wenyin: "tattoo", dream: "dream", request: "request", boss: "boss", rescue: "rescue" }[what] || what;
    return (a[key] || 0) - ((base || {})[key] || 0);
  };
  S.needText = function (n) {
    if (n.text) return n.text;
    if (n.building) return "街上有「" + [].concat(n.building).map(function (id) { return D.bById[id] ? D.bById[id].name : id; }).join("、") + "」";
    if (n.combo) { var c = D.combos.find(function (x) { return x.id === n.combo; }); return "緣分組合「" + (c ? c.name + "」（" + c.need.map(function (id) { return D.bById[id] ? D.bById[id].name : id; }).join("＋") + " 相鄰）" : n.combo + "」"); }
    if (n.trait) return "街區特徵「" + n.trait + "」達 " + (n.min || 1);
    if (n.resident) { return [].concat(n.resident).map(function (id) { var c = D.charById[id]; return (c ? c.name : id); }).join("、") + " 住在街上"; }
    if (n.action) return { dream: "在托夢照相館托夢一次", tattoo: "做一組愛戀文印", macaron: "讓委託人吃遺願馬卡龍", comfort: "有慰靈犬／引渡貓能去陪", sendoff: "送行投胎" }[n.action] || ("完成「" + n.action + "」");
    if (n.pay != null) return "付 " + n.pay + " 功德";
    if (n.map) { var m = D.maps.find(function (x) { return x.id === n.map || D.MAP_ALIAS[n.map] === x.id; }); return "打倒「" + (m ? m.name : n.map) + "」的王"; }
    if (n.flag) return "事件「" + n.flag + "」";
    if (n.helped != null) return "已幫助 " + n.helped + " 人";
    if (n.popularity != null) return "人氣 " + n.popularity;
    if (n.star != null || n.rank != null) return "街區 ☆" + (n.star != null ? n.star : n.rank);
    if (n.count) return { sendoff: "送行投胎", wenyin: "愛戀文印", dream: "托夢", request: "完成委託", boss: "打倒地圖王", rescue: "救人" }[n.count] + " " + (n.n || 1) + " 次";
    return JSON.stringify(n);
  };
  S.requestReady = function (r) { return r.need.every(function (n) { return S.needMet(r, n); }); };
  S.completeRequest = function (r) {
    var s = G.state;
    if (!S.requestReady(r) || s.requests[r.id].st === "done") return;
    r.need.forEach(function (n) { if (n.pay) s.merit -= n.pay; });
    s.requests[r.id].st = "done"; s.stats.requests++; State.act("request");
    var lines = r.lines.length ? r.lines : [L(r.name, "謝謝你們。", r.char)];
    UI.dialog({ title: "委託完成！" + r.title, lines: lines }, function () {
      var rw = r.reward || {};
      var got = S.applyEffect({ merit: rw.merit, money: rw.money, popularity: rw.popularity, item: rw.item, unlock: rw.unlock, traits: rw.traits, flag: rw.flag, job: rw.job });
      State.addHelped(rw.helped != null ? rw.helped : 1, "委託完成：" + r.name);
      var mv = typeof rw.movein === "string" ? rw.movein : rw.movein ? r.char : null;
      if (mv && D.charById[mv]) S.moveIn(D.charById[mv]);
      D.chars.forEach(function (o) { if (o.movein && o.movein.request === r.id && o.id !== mv) S.moveIn(o); });
      if (got.length) UI.toast("🎁 " + got.join("、"));
    });
  };

  // ---------- 事件 ----------
  S.playEvent = function (e, titlePrefix) {
    var s = G.state;
    if (e.once) s.fired["once-" + e.id] = 1;
    s.fired["ev-" + e.id] = (s.fired["ev-" + e.id] || 0) + 1;
    var title = (titlePrefix || "事件發生！") + (e.title || "");
    var lines = e.lines.length ? e.lines : [L("", e.title || "……")];
    UI.dialog({ title: title, lines: lines }, function () {
      if (e.mods) State.addMods(e.mods, e.weeks || 1);
      if (e.choice && e.choice.length) return S.choose(e);
      var g = S.applyEffect(e.effect);
      if (g.length) UI.toast("✨ " + (e.title ? e.title + "：" : "") + g.join("、"));
    });
  };
  S.choose = function (e) {
    var h = "<div class='mbox'><h3>" + U.esc(e.title || "要怎麼做？") + "</h3><div class='btns col'>" + e.choice.map(function (c, i) {
      var cost = c.cost && c.cost.merit ? "（功德 " + c.cost.merit + "）" : "";
      var dis = c.cost && c.cost.merit && G.state.merit < c.cost.merit;
      return "<button class='" + (i === 0 ? "go" : "") + "' data-ch='" + i + "'" + (dis ? " disabled" : "") + ">" + U.esc(c.label || "好") + cost + "</button>";
    }).join("") + "</div></div>";
    UI.modal(h, function (m) {
      m.querySelectorAll("[data-ch]").forEach(function (b) {
        b.onclick = function () {
          var c = e.choice[+b.dataset.ch];
          UI.closeModal();
          if (c.cost && c.cost.merit) G.state.merit -= c.cost.merit;
          if (c.cost && c.cost.money) G.state.money -= c.cost.money;
          var go = function () { var g = S.applyEffect(c.effect); if (g.length) UI.toast("✨ " + g.join("、")); };
          if (c.lines && c.lines.length) UI.dialog({ lines: c.lines }, go); else go();
        };
      });
    });
  };
  function eventOk(e) {
    var s = G.state, w = e.when || {};
    if (S.tutorialGoal()) return false;   // 教學還沒走完，先不插隨機事件
    if (w.chain || w.trigger) return false;
    if (e.once && s.fired["once-" + e.id]) return false;
    if (w.month != null && s.fired["ev-" + e.id + "-" + s.year]) return false;
    if (!Sim.cond(w, { random: 1 })) return false;
    if (w.random != null) {
      var p = w.random;
      if (/^offering/.test(e.id)) p *= State.mod("offeringMul", 1);
      return Math.random() < p;
    }
    // 沒寫 random：條件一成立就發生，但只發生一次
    return !s.fired["ev-" + e.id];
  }
  S.onBuilt = function (b) {
    D.events.forEach(function (e) {
      var w = e.when || {};
      if (w.trigger === "built" && w.building === b.id && !(e.once && G.state.fired["once-" + e.id]) && Sim.cond(w, { trigger: 1, building: 1, random: 1 })) S.playEvent(e, "");
    });
    S.tutorialTick();
  };
  S.onPair = function () { S.tutorialTick(); };
  S.trigger = function (name, ctx) {
    D.events.forEach(function (e) {
      var w = e.when || {};
      if (w.trigger !== name || (e.once && G.state.fired["once-" + e.id])) return;
      if (w.party && !(ctx && ctx.party && ctx.party.indexOf(w.party) >= 0)) return;
      if (Sim.cond(w, { trigger: 1, party: 1, random: 1 })) S.playEvent(e);
    });
  };

  // ---------- 每週 ----------
  S.onWeek = function () {
    var s = G.state, now = State.absWeek(), shown = false;
    // 排程中的事件／保衛戰
    s.schedule = s.schedule.filter(function (x) {
      if (x.at > now) return true;
      if (x.event && D.eventById[x.event]) { S.playEvent(D.eventById[x.event]); shown = true; }
      if (x.defense) Battle.defense(x.defense);
      return false;
    });
    // 行事曆
    D.calendar.forEach(function (e) {
      var key = "cal-" + s.year + "-" + e.id;
      if (s.month === e.month && s.week === (e.week || 1) && !s.fired[key] && Sim.cond(e.when, { random: 1 })) {
        if (e.once && s.fired["once-" + e.id]) return;
        s.fired[key] = 1; shown = true;
        S.playEvent(e, "📅 ");
      }
    });
    // 觀音評定：3、6、9、12 月最後一週
    var months = (D.review && D.review.months) || [3, 6, 9, 12];
    if (s.week === 4 && months.indexOf(s.month) >= 0) { S.review(); shown = true; }
    // 角色入住（一週最多一位）
    if (s.pendingMovein && s.pendingMovein.length) { var pc = D.charById[s.pendingMovein.shift()]; if (pc) { S.moveIn(pc); shown = true; } }
    else { var next = S.nextMovein(); if (next) { S.moveIn(next); shown = true; } }
    // 隨機事件（一週最多一件，跟入住、評定錯開）
    if (!shown) {
      var cands = D.events.filter(eventOk);
      if (cands.length) {
        var e = U.pick(cands);
        if (e.when.month != null) s.fired["ev-" + e.id + "-" + s.year] = 1;
        S.playEvent(e);
      }
    }
    // 外賓離開
    Object.keys(s.guests).forEach(function (g) { if (s.guests[g] < now) delete s.guests[g]; });
    S.visibleRequests();
    S.tutorialTick();
  };

  // ---------- 教學（C 線 HQ.tutorial：依序播，達成 goal 才進下一段） ----------
  S.tutorialTick = function () {
    var s = G.state;
    if (UI.dialogOpen()) return;
    if (!D.tutorial.length) {
      if (s.tut === 0) {
        s.tut = 1;
        UI.dialog({ title: "三途川物語", lines: [
          L("語彤", "這裡就是三途川岸邊……亡魂每天早晚搭列車到車站。", "yutong"),
          L("語彤", "他們頭上的泡泡是心願。蓋對的店、讓他們安心，就能送他們好好投胎。", "yutong"),
          L("語彤", "我是實習月老，目標是幫助更多人！先按下面的「建設」蓋幾間店吧。", "yutong")
        ] }, function () { UI.highlight("build"); });
      }
      return;
    }
    var step = D.tutorial[s.tut];
    if (!step) return;
    var prev = D.tutorial[s.tut - 1];
    if (prev && prev.goal && !goalMet(prev.goal)) return;
    s.tut++;
    // join：這段劇情的角色直接加入街坊（先加入，台詞才不會被「還沒搬來」過濾掉）
    (step.join || []).forEach(function (id) { var c = D.charById[id]; if (c) S.addCharResident(c, true); });
    UI.dialog({ title: step.title, lines: step.lines }, function () {
      if (step.goal && step.goal.build) UI.highlight("build");
      setTimeout(S.tutorialTick, 300);
    });
  };
  function goalMet(g) {
    var s = G.state;
    if (g.build) return State.hasBuilding(g.build);
    if (g.guests != null) return s.stats.guests >= g.guests;
    if (g.wenyin != null) return s.stats.pairs >= g.wenyin;
    return Sim.cond(g);
  }
  S.tutorialGoal = function () {
    var s = G.state, prev = D.tutorial[s.tut - 1];
    if (!prev || !prev.goal || goalMet(prev.goal)) return null;
    var g = prev.goal;
    if (g.resident) { var c = D.charById[g.resident]; return "等 " + (c ? c.name : g.resident) + " 入住"; }
    if (g.build) return "蓋「" + (D.bById[g.build] ? D.bById[g.build].name : g.build) + "」";
    if (g.guests != null) return "迎接 " + g.guests + " 位亡魂（" + s.stats.guests + "）";
    if (g.wenyin != null) return "完成第一組文印";
    if (g.helped != null) return "幫助 " + g.helped + " 人";
    return null;
  };

  // ---------- 觀音評定（B 的公式＋C 的台詞） ----------
  S.review = function () {
    var s = G.state, st = s.stats, R = D.review;
    var q = s.quarter || { pop: 0, sendoff: 0, pairs: 0, dreams: 0, requests: 0, bosses: 0, rescues: 0, unhappy: 0, helped: 0, actions: {} };
    var tr = State.traits(), traitSum = 0;
    Object.keys(tr).forEach(function (k) { if (k !== "魔氣") traitSum += tr[k]; });
    var d = {
      popGain: State.pop() - (q.pop || 0), residents: G.residents.length, sendoffs: st.reincarnated - (q.sendoff || 0), wenyin: st.pairs - (q.pairs || 0),
      dreams: st.dreams - (q.dreams || 0), requests: st.requests - (q.requests || 0), traitSum: traitSum, bosses: st.bosses - (q.bosses || 0),
      rescues: st.rescues - (q.rescues || 0), leftUnhappy: st.leftUnhappy - (q.unhappy || 0)
    };
    var annual = s.month === 12;
    var score = 0, target = 1, grade = null, merit = 0, popBonus = 0;
    if (R) {
      Object.keys(R.weights).forEach(function (k) { score += (d[k] || 0) * R.weights[k]; });
      target = (R.target.byStar[s.star] || 100) * (annual ? R.target.decemberMul || 1 : 1);
      var ratio = score / target;
      grade = R.grades.find(function (g) { return ratio >= g.ratio; }) || R.grades[R.grades.length - 1];
      merit = Math.round(Math.max(0, score) * (R.meritPerScore || 0.2)) + (grade.bonus || 0);
      if (annual) merit *= R.decemberRewardMul || 1;
      popBonus = grade.popularity || 0;
    } else {
      score = (s.helped - (q.helped || 0)) * 3 + d.wenyin * 4 + G.residents.length * 5;
      grade = { grade: score > 60 ? "A" : score > 25 ? "B" : "D", line: "", task: score <= 25 };
      merit = 20 + Math.round(score * 0.8);
    }
    merit = Math.round(merit);
    var notes = [], extraLines = [];
    // 上一季的觀音任務
    if (s.guanyinTask) {
      var t = s.guanyinTask, done = t.need.every(function (n) { return n.count ? S.countSince(n.count, t.base) >= (n.n || 1) : S.needMet({ id: "__task" }, n); });
      if (done) { merit *= (R && R.taskMeritMul) || 3; notes.push("完成觀音交付的任務「" + t.title + "」：功德 ×3！"); if (D.reviewScenes) extraLines = extraLines.concat(D.normLines(D.reviewScenes.taskDone)); }
      else notes.push("觀音交付的任務「" + t.title + "」沒有完成……");
      s.guanyinTask = null;
    }
    // 升星：B 的 ranks 條件全部達成，一次升 1 星
    var starUp = false, rk = D.ranks[s.star], missing = [];
    if (rk) {
      missing = rankMissing(rk);
      if (!missing.length) { s.star++; starUp = true; if (rk.reward) S.applyEffect(rk.reward); }
    }
    var unlocks = [];
    if (starUp) {
      D.buildings.forEach(function (b) { var u = b.unlock || {}; if ((u.rank === s.star || u.star === s.star) && !b.fixed) unlocks.push(b.name); });
      D.maps.forEach(function (m) { if (m.open && (m.open.rank === s.star || m.open.star === s.star)) unlocks.push("巡守地：" + m.name); });
      var nz = Sim.nextZone(); if (nz && Sim.expandReq(nz).star <= s.star) unlocks.push("可擴建：" + nz.name);
      if (rk.reward) unlocks.push(Object.keys(rk.reward).map(function (k) { return ({ merit: "功德", money: "冥紙", medals: "勳章" }[k] || k) + " +" + rk.reward[k]; }).join("、"));
    }
    var titleUp = false;
    if (annual) {
      var nt = D.titles[s.title + 1];
      if (nt && s.helped >= nt.helped) { s.title++; titleUp = true; if (nt.reward) S.applyEffect(nt.reward); G.residents.forEach(function (r) { if (r.charId === "yutong") r.calc(); }); }
      var med = 0;
      ((window.HQ && HQ.medals && HQ.medals.annual) || [{ score: 0, medals: 1 }]).forEach(function (m) { if (score >= m.score) med += m.medals; });
      if (med) { s.medals = (s.medals || 0) + med; notes.push("頒發勳章 ×" + med); }
    }
    // 第一次巡察還是新街區：D 不派任務，換一句鼓勵
    var firstReview = !s.reviewed;
    s.reviewed = (s.reviewed || 0) + 1;
    if (firstReview && grade && grade.task) grade = Object.assign({}, grade, { grade: "C", task: false, first: true });
    // D：指派任務
    if (grade && grade.task) {
      var doable = D.reviewTasks.filter(taskDoable);
      var task = doable.length ? U.pick(doable) : { id: "task", title: "幫助更多人", need: [{ count: "sendoff", n: 6 }], lines: [] };
      s.guanyinTask = { id: task.id, title: task.title, need: task.need, base: Object.assign({}, st.actions) };
      notes.push("觀音交付任務：「" + task.title + "」— " + task.need.map(S.needText).join("、") + "（下一季完成功德 ×3）");
      extraLines = extraLines.concat(D.normLines(task.lines || []));
    }
    s.merit += merit;
    s.activitiesQ = 0;
    State.addPop(popBonus);
    s.quarter = { pop: State.pop(), sendoff: st.reincarnated, pairs: st.pairs, dreams: st.dreams, requests: st.requests, bosses: st.bosses, rescues: st.rescues, unhappy: st.leftUnhappy, helped: s.helped };
    var season = ["", "冬", "春", "春", "春", "夏", "夏", "夏", "秋", "秋", "秋", "冬", "冬"][s.month] || "";
    var top = Object.keys(tr).sort(function (a, b) { return tr[b] - tr[a]; }).filter(function (k) { return tr[k] > 0 && k !== "魔氣"; }).slice(0, 2);
    var data = {
      title: (annual ? "觀音年度評定" : "觀音季度評定") + "　第" + s.year + "年 " + season,
      rows: [["💗", "人氣", U.fmt(State.pop())], ["🏠", "街坊", G.residents.length + " 人"], ["🔥", "投胎送行", d.sendoffs + " 位"], ["📜", "文印", d.wenyin + " 組"], ["🙏", "已幫助", U.fmt(s.helped) + " 人"]],
      traits: top.map(function (k) { return k + " " + tr[k]; }).join("・") || "還看不出特色",
      grade: grade ? grade.grade : "", score: Math.round(score) + " / " + Math.round(target),
      starUp: starUp ? s.star : 0, titleUp: titleUp ? D.titles[s.title].name : "", annual: annual,
      reward: "功德 +" + merit + (popBonus ? "、人氣 " + (popBonus > 0 ? "+" : "") + popBonus : "") + (unlocks.length ? "、" + unlocks.join("、") : ""),
      notes: notes.concat(!starUp && rk ? ["下一顆星還差：" + missing.join("、")] : []),
      comment: grade && grade.line ? grade.line : "亡魂們還在等妳。"
    };
    // 開場台詞 → 評定表 → 等第台詞、升星、升階
    var sc = D.reviewScenes;
    var pre = sc ? D.normLines(sc.arrive) : [L("觀音", "我來看看這條街。", "guanyin")];
    var post = [];
    if (grade && grade.first) post.push(L("觀音菩薩", "才剛開始嘛。下一季，再讓我看看這條河岸。", "guanyin"));
    else if (sc && grade && sc.grade && sc.grade[grade.grade]) post = post.concat(D.normLines(sc.grade[grade.grade]));
    if (starUp && sc && sc.rankUp) post = post.concat(D.normLines(sc.rankUp));
    if (titleUp && sc && sc.promote && sc.promote[s.title]) post = post.concat(D.normLines(sc.promote[s.title]));
    post = post.concat(extraLines);
    UI.dialog({ title: data.title, lines: pre }, function () {
      UI.review(data, function () { if (post.length) UI.dialog({ lines: post }); });
    });
    State.save();
  };
  // 觀音交付的任務要街上做得到：需要的街坊已入住、需要的店已經有了
  function taskDoable(t) {
    var serves = {};
    G.buildings.forEach(function (b) { b.def.serves.forEach(function (w) { serves[w] = 1; }); });
    return t.need.every(function (n) {
      if (n.resident) return !!G.state.charsIn[n.resident];
      if (n.count === "wenyin") return !!serves.tattoo;
      if (n.count === "dream") return !!serves.dream;
      return true;
    });
  }
  function rankMissing(rk) {
    var s = G.state, m = [];
    var shops = G.buildings.filter(function (b) { return (b.def.cat === "shop" || b.def.cat === "food" || b.def.cat === "special") && !b.def.fixed; }).length;
    var homes = G.buildings.filter(function (b) { return b.def.cat === "home"; }).length;
    if (rk.popularity != null && State.pop() < rk.popularity) m.push("人氣 " + U.fmt(State.pop()) + "/" + rk.popularity);
    if (rk.buildings != null && shops < rk.buildings) m.push("店家 " + shops + "/" + rk.buildings);
    if (rk.residents != null && G.residents.length < rk.residents) m.push("街坊 " + G.residents.length + "/" + rk.residents);
    if (rk.helped != null && s.helped < rk.helped) m.push("幫助 " + s.helped + "/" + rk.helped);
    if (rk.monthlyIncome != null && ((s.lastMonth && s.lastMonth.income) || 0) < rk.monthlyIncome) m.push("月營業額 " + U.fmt((s.lastMonth && s.lastMonth.income) || 0) + "/" + U.fmt(rk.monthlyIncome));
    if (rk.homes != null && homes < rk.homes) m.push("住宅 " + homes + "/" + rk.homes);
    if (rk.bosses != null && s.stats.bosses < rk.bosses) m.push("打倒王 " + s.stats.bosses + "/" + rk.bosses);
    return m;
  }
  S.rankMissing = function () { var rk = D.ranks[G.state.star]; return rk ? rankMissing(rk) : []; };

  // ---------- 主動活動（B 的 HQ.activities，擴建另外走地圖牌子） ----------
  S.activities = function () { return D.activities.filter(function (a) { return !a.expand; }); };
  S.canActivity = function (a) {
    var s = G.state;
    if (a.need && !Sim.cond(a.need)) return "需要 " + Sim.condText(a.need);
    if (s.merit < a.merit) return "功德不夠";
    if ((s.activitiesQ || 0) >= ((window.HQ && HQ.activityPerQuarter) || 7)) return "這一季的活動次數用完了";
    return "";
  };
  S.doActivity = function (a) {
    var why = S.canActivity(a);
    if (why) return why;
    var s = G.state;
    s.merit -= a.merit; s.activitiesQ = (s.activitiesQ || 0) + 1;
    var g = S.applyEffect({ popularity: a.popularity || 0, money: a.money, traits: a.traits });
    UI.toast("🎉 辦了「" + a.name + "」：" + g.join("、"));
    return "";
  };

  return S;
})();
