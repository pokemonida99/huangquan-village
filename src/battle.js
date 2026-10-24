// 出征（大地圖自動戰鬥）與街區保衛戰（目前是自動結算的簡化版）。
window.Battle = (function () {
  var B = {};

  B.mapOpen = function (m) {
    var o = m.open || {}, s = G.state;
    if (o.start) return true;
    if (o.month != null) return s.month === o.month;
    if (o.rank != null) return s.star >= o.rank;
    if (o.star != null) return s.star >= o.star;
    if (o.helped != null) return s.helped >= o.helped;
    if (o.map) return !!(s.cleared && s.cleared[o.map]);
    return false;
  };
  B.openText = function (m) {
    var o = m.open || {};
    if (o.month != null) return o.month + " 月限定";
    if (o.rank != null || o.star != null) return "☆" + (o.rank != null ? o.rank : o.star) + " 開放";
    if (o.helped != null) return "幫助 " + o.helped + " 人";
    if (o.map) return "先打倒前一張地圖的王";
    return "???";
  };
  B.travelCost = function (m, n) { return Math.round((m.travel || 20 + m.lv * 12) * Math.max(1, n)); };
  B.WEEKS = 2;

  function unitFromResident(r) { return { name: r.name, hp: Math.max(1, r.hp), maxhp: r.maxhp, atk: r.atk, def: r.defn, hits: r.hits, ref: r }; }
  // 敵人：HQ.enemies 有數值就用；沒有就照 B 的等級公式（王 hp×5、atk×1.25、def×1.15）
  function enemyUnit(e, lv, boss) {
    var L = e.lv || lv;
    boss = boss || !!e.boss;
    var u = e.hp ? { name: e.name, hp: e.hp, atk: e.atk, def: e.def } :
      { name: e.name, hp: Math.round((20 + 10 * L + 0.25 * L * L) * (boss ? 5 : 1)), atk: (4 + 2.3 * L + 0.035 * L * L) * (boss ? 1.25 : 1), def: (2 + 1.6 * L + 0.02 * L * L) * (boss ? 1.15 : 1) };
    u.hits = 1; u.boss = boss; u.maxhp = u.hp; u.exp = e.exp || Math.round((4 + 2.2 * L) * (boss ? 10 : 1)); u.gold = e.gold || 0; u.merit = e.merit || 0;
    return u;
  }

  // 自動戰鬥：回傳 {win, log, party}
  B.fight = function (party, enemies, maxRounds) {
    var log = [], round;
    for (round = 1; round <= (maxRounds || 40); round++) {
      var aliveP = party.filter(function (u) { return u.hp > 0; }), aliveE = enemies.filter(function (u) { return u.hp > 0; });
      if (!aliveP.length || !aliveE.length) break;
      aliveP.forEach(function (u) {
        var tgts = enemies.filter(function (e) { return e.hp > 0; });
        if (!tgts.length) return;
        var t = tgts[0];
        var dmg = 0;
        for (var h = 0; h < u.hits; h++) dmg += Math.max(1, Math.round(u.atk - t.def * 0.5 + U.rand(-2, 3)));
        t.hp -= dmg;
        if (t.hp <= 0) log.push("⚔️ " + u.name + " 打倒了 " + t.name + (t.boss ? "！！" : ""));
      });
      enemies.forEach(function (e) {
        if (e.hp <= 0) return;
        var tgts = party.filter(function (u) { return u.hp > 0; });
        if (!tgts.length) return;
        var t = U.pick(tgts);
        t.hp -= Math.max(1, Math.round(e.atk - t.def * 0.5 + U.rand(-2, 2)));
        if (t.hp <= 0) log.push("💫 " + t.name + " 被 " + e.name + " 擊倒");
      });
    }
    return { win: enemies.every(function (e) { return e.hp <= 0; }), log: log, rounds: round };
  };

  // 出征地圖劇情裡算「在場」的人：打完會搬來的、在地援手
  function scenePeople(m) {
    if (!m) return [];
    var r = m.reward && m.reward.movein ? [].concat(m.reward.movein) : [];
    (m.helpers || []).forEach(function (h) { r.push(h.id); });
    D.chars.forEach(function (c) { if (c.movein && c.movein.map === m.id) r.push(c.id); });
    return r;
  }
  B.depart = function (m, members) {
    var s = G.state, cost = B.travelCost(m, members.length);
    if (s.expedition) return "已經有隊伍在外面了";
    if (!members.length) return "至少要選一位";
    if (s.money < CFG.EXP_MIN_GOLD) return "冥紙低於 " + U.fmt(CFG.EXP_MIN_GOLD) + " 不能出征";
    if (s.money < cost) return "冥紙不夠付旅費（" + cost + "）";
    var tm = (window.HQ && HQ.travelMerit && (HQ.travelMerit[m.id] || 0)) * members.length;
    if (tm && s.merit < tm) return "功德不夠付船票（" + tm + "）";
    if (members.some(function (r) { return r.busy(); })) return "有隊員這陣子走不開";
    s.money -= cost; s.merit -= tm || 0;
    members.forEach(function (r) { r.away = true; r.hidden = true; r.path = null; r.st = "idle"; if (r.target && r.target.walkingStaff === r) r.target.walkingStaff = null; });
    s.expedition = { map: m.id, party: members.map(function (r) { return r.uid; }), back: State.absWeek() + B.WEEKS };
    State.addMods({ trainMul: (D.balance && D.balance.expeditionIncomeMul) || 0.8 }, B.WEEKS);
    UI.toast("🏮 出征「" + m.name + "」：" + members.map(function (r) { return r.name; }).join("、") + "　" + B.WEEKS + " 週後回來");
    Story.trigger("expedition", { party: members.map(function (r) { return r.charId; }).filter(Boolean) });
    var intro = Story.filterLines(m.lines || [], scenePeople(m));
    if (intro.length) UI.dialog({ title: "出征：" + m.name, lines: intro, present: scenePeople(m) });
    return "";
  };

  B.finishExpedition = function () {
    var s = G.state, ex = s.expedition;
    s.expedition = null;
    var m = D.maps.find(function (x) { return x.id === ex.map; });
    var members = G.residents.filter(function (r) { return ex.party.indexOf(r.uid) >= 0; });
    var party = members.map(unitFromResident);
    var log = ["🚩 抵達「" + (m ? m.name : ex.map) + "」"];
    var win = false, loot = { merit: 0, gold: 0, exp: 0 };
    if (m && party.length) {
      var foes = [];
      var n = Math.min(5, 2 + Math.floor(m.lv / 8));
      for (var i = 0; i < n; i++) foes.push(enemyUnit(m.enemies.length ? U.pick(m.enemies) : { name: "怨靈" }, m.lv, false));
      if (m.mid) foes.push(enemyUnit(m.mid, m.lv + 1, false));
      if (m.boss) foes.push(enemyUnit(m.boss, m.lv + 2, true));
      // 在地援手：不佔名額，條件成立才來
      (m.helpers || []).forEach(function (hp) {
        if (hp.need && !Sim.cond(hp.need)) return;
        var hl = m.lv + 2, st = { hp: 20 + 10 * hl, atk: 4 + 2.3 * hl, def: 2 + 1.6 * hl };
        party.push({ name: hp.name + "（援手）", hp: st.hp * 2, maxhp: st.hp * 2, atk: st.atk, def: st.def, hits: 1 });
        log.push("🤝 " + hp.name + " 前來助陣");
      });
      var res = B.fight(party, foes, 80);
      log = log.concat(res.log.slice(0, 16));
      win = res.win;
      foes.forEach(function (f) { if (f.hp <= 0) { loot.merit += f.merit; loot.gold += f.gold; loot.exp += f.exp; } });
    }
    var rw = [];
    members.forEach(function (r, i) {
      var u = party[i];
      r.away = false; r.hidden = false;
      var d = MapGen.stationDoor; r.tx = d.x; r.ty = d.y; r.px = d.x * CFG.TILE + 16; r.py = d.y * CFG.TILE + 30;
      r.hp = Math.max(1, Math.min(r.maxhp, u.hp));
      r.gainExp(Math.round(loot.exp / Math.max(1, members.length)) + (m ? m.lv : 3) * 3);
      r.st = "idle"; r.timer = 1.2;
      if (win) r.cheer(3);
    });
    if (loot.gold) { s.money += loot.gold; rw.push("冥紙 +" + loot.gold); }
    if (loot.merit) { s.merit += loot.merit; rw.push("功德 +" + loot.merit); }
    var after = [];
    if (win && m) {
      var first = !Sim.cleared(m.id);
      s.cleared = s.cleared || {}; s.cleared[m.id] = (s.cleared[m.id] || 0) + 1;
      if (m.boss) { s.stats.bosses++; State.act("boss"); if (first && window.HQ && HQ.medals && HQ.medals.bossFirstKill) { s.medals = (s.medals || 0) + HQ.medals.bossFirstKill; rw.push("勳章 +" + HQ.medals.bossFirstKill); } }
      if (first) rw = rw.concat(Story.applyEffect(Object.assign({}, m.reward, { movein: null })));
      State.addHelped(1, "出征打倒作亂者：" + (m.boss ? m.boss.name : m.name));
      if (first && m.unlock) rw = rw.concat(Story.applyEffect(typeof m.unlock === "string" ? { unlock: m.unlock } : m.unlock));
      if (first && m.reward && m.reward.movein) [].concat(m.reward.movein).forEach(function (id) { Story.queueMovein(id); });
      log.push("🎉 勝利！");
      if (first && m.scenes) after = (m.scenes.boss || []).concat(m.scenes.clear || []);
    } else log.push("😣 撤退了……下次再來（建議 Lv" + (m ? m.lv : "?") + "）");
    UI.battleResult({ title: (win ? "出征勝利：" : "出征失敗：") + (m ? m.name : ""), win: win, log: log, reward: rw.join("、") }, function () {
      after = Story.filterLines(after, scenePeople(m));
      if (after.length) UI.dialog({ title: m.boss ? m.boss.name : m.name, lines: after, present: scenePeople(m) });
    });
  };

  // 街區保衛戰（自動結算版）：照 C 的 HQ.defense 波次；被突破的波次，目標建築受損停業
  B.defense = function (id) {
    var s = G.state, def = D.defense;
    var party = G.residents.filter(function (r) { return !r.away; }).map(unitFromResident);
    if (!party.length) return UI.toast("街上沒有人可以應戰");
    var waves = def && def.waves ? def.waves : [1, 2, 3, 4, 5].map(function (n) { return { n: n, title: "第 " + n + " 波", enemies: [{ id: "", n: 2 + n }] }; });
    var log = ["🌀 " + (def ? def.name : "第三王國入侵") + "！穿界門在車站旁打開了！"], broken = 0, held = 0, lv = 20 + s.star * 4;
    var intro = [];
    waves.forEach(function (w, wi) {
      party.forEach(function (u) { if (u.hp > 0) u.hp = Math.min(u.maxhp, u.hp + u.maxhp * 0.35); else u.hp = u.maxhp * 0.3; });
      var foes = [];
      (w.enemies || []).forEach(function (e) {
        var src = D.enemyById[e.id] || { name: e.id ? e.id.replace(/^en-|^boss-/, "") : U.pick(["骷髏兵", "蝙蝠惡魔"]), lv: lv + wi };
        for (var i = 0; i < (e.n || 1); i++) foes.push(enemyUnit(src, lv + wi, /^boss-/.test(e.id || "")));
      });
      var r = B.fight(party, foes, 40);
      if (r.win) { held++; log.push("第 " + (w.n || wi + 1) + " 波「" + (w.title || "") + "」：守住了"); }
      else {
        var tb = G.buildings.find(function (b) { return b.id === w.target; }) || U.pick(G.buildings.filter(function (b) { return b.def.cat !== "road" && !b.broken; }));
        if (tb && !tb.broken) { tb.broken = 1; broken++; }
        log.push("第 " + (w.n || wi + 1) + " 波「" + (w.title || "") + "」：被突破" + (tb ? "，" + tb.def.name + "受損" : ""));
      }
      if (wi === 0 && w.lines) intro = D.normLines(w.lines);
    });
    G.residents.forEach(function (r) { if (!r.away) r.gainExp(lv * 8); });
    var win = held >= Math.ceil(waves.length * 0.6);
    var end = def ? (win ? def.win : def.lose) : null;
    var rw = [];
    if (end && end.effect) { var eff = Object.assign({}, end.effect); if (eff.retryInWeeks) { s.schedule.push({ defense: def.id, at: State.absWeek() + eff.retryInWeeks }); delete eff.retryInWeeks; } rw = Story.applyEffect(eff); }
    else if (win) { rw = Story.applyEffect({ merit: 100 + lv * 5 }); State.addHelped(3, "守住街區"); }
    s.fired.defenseDone = (s.fired.defenseDone || 0) + 1;
    var show = function () {
      UI.battleResult({ title: win ? "街區保衛戰：勝利" : "街區保衛戰：苦戰", win: win, log: log.concat(broken ? ["🔧 有 " + broken + " 間建築受損，點建築花冥紙修理"] : []), reward: rw.join("、") }, function () {
        if (end && end.lines) UI.dialog({ lines: D.normLines(end.lines) });
      });
    };
    if (intro.length) UI.dialog({ title: "街區保衛戰！", lines: intro }, show); else show();
  };

  return B;
})();
