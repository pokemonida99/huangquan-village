// 出征小動畫（開羅式）：出征期間在下方紅磚列上面多一條橫幅，隊伍一路往右走、遇到怪就開打。
// 只是畫面，輸贏還是回來那一刻才結算（Battle.finishExpedition）。
window.ExpStrip = (function () {
  var E = {}, el, cv, g, nameEl, leftEl, barEl, k = 2, AW = 0, AH = 50, t = 0;
  var scroll = 0, phase = "walk", phaseT = 0, foes = [], fx = [], lunge = {}, hitT = 0, cycle = 0;
  var THEME = {
    daoju: { sky: "#4a1f2a", far: "#6e2a32", ground: "#5a3a2e", dash: "#7d4b36", shape: "saw" },
    gengyin: { sky: "#2c3150", far: "#454b6b", ground: "#68656f", dash: "#e8d38a", shape: "city" },
    xinkujiang: { sky: "#30334a", far: "#4a4a5e", ground: "#5e5a52", dash: "#77705f", shape: "city" },
    seaside: { sky: "#3f8fb8", far: "#2f6f9a", ground: "#d8c08a", dash: "#c2a66c", shape: "sea" },
    relic: { sky: "#2c4038", far: "#3e5a4c", ground: "#5c6a4c", dash: "#6f7e5a", shape: "hill" },
    demon2: { sky: "#2a1d3f", far: "#43305e", ground: "#3a2c48", dash: "#57406a", shape: "spike" },
    demon3: { sky: "#2a1530", far: "#4a2040", ground: "#3a2034", dash: "#5a2c48", shape: "spike" },
    north: { sky: "#8fb4d8", far: "#e4eef8", ground: "#e8f0f6", dash: "#c6d6e6", shape: "hill" }
  };
  var DEF_THEME = { sky: "#3a3550", far: "#4a4470", ground: "#5a5470", dash: "#6e6888", shape: "hill" };

  E.init = function () {
    el = document.getElementById("expstrip");
    cv = el.querySelector("canvas"); g = cv.getContext("2d");
    nameEl = document.getElementById("es-name"); leftEl = document.getElementById("es-left"); barEl = document.getElementById("es-bar");
    el.addEventListener("click", function () { UI.openSheet("patrol"); });
    window.addEventListener("resize", size);
  };
  function size() {
    var dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    k = Math.max(2, Math.round(dpr * 1.5));          // 一個美術像素 = k 個裝置像素（整數倍才清楚）
    var w = el.clientWidth || window.innerWidth;
    cv.width = Math.round(w * dpr); cv.height = AH * k;
    cv.style.height = (AH * k / dpr) + "px";
    document.documentElement.style.setProperty("--exp-h", (AH * k / dpr + 6) + "px");
    AW = Math.ceil(cv.width / k);
  }

  function sheetOf(r) {
    if (r.charId) { var c = D.charById[r.charId]; return c && Assets.get(c.sprite); }
    return Assets.get("art/chars/soul-" + (r.skin || 1) + ".png");
  }
  function enemyImg(e) {
    var id = e && (e.id || e.sprite);
    if (!id) return null;
    var p = /\.png$/.test(id) ? id : "art/chars/" + id + ".png";
    Assets.load(p);
    return Assets.get(p);
  }
  function rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x) * k, Math.round(y) * k, Math.round(w) * k, Math.round(h) * k); }
  function sprite(img, row, frame, x, y, flash, alpha) {
    if (!img) { rect(x - 5, y - 14, 10, 14, "#c9c0d6"); return; }
    g.globalAlpha = alpha == null ? 1 : alpha;
    g.drawImage(img, frame * 32, row * 32, 32, 32, Math.round(x - 16) * k, Math.round(y - 30) * k, 32 * k, 32 * k);
    if (flash) { g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(img, frame * 32, row * 32, 32, 32, Math.round(x - 16) * k, Math.round(y - 30) * k, 32 * k, 32 * k); g.globalCompositeOperation = "source-over"; }
    g.globalAlpha = 1;
  }
  function text(s, x, y, col) {
    g.font = "bold " + (6 * k) + "px 'PingFang TC',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = Math.max(2, k); g.strokeStyle = "#1a1018"; g.strokeText(s, x * k, y * k); g.fillStyle = col; g.fillText(s, x * k, y * k);
  }

  function background(th) {
    rect(0, 0, AW, 28, th.sky);
    // 遠景：慢慢捲
    var off = (scroll * 0.3) % 40;
    for (var x = -40; x < AW + 40; x += 40) {
      var bx = x - off;
      if (th.shape === "saw") { for (var i = 0; i < 4; i++) rect(bx + i * 10, 20 - (i % 2) * 5, 6, 8 + (i % 2) * 5, th.far); }
      else if (th.shape === "city") { rect(bx, 14, 10, 14, th.far); rect(bx + 12, 10, 8, 18, th.far); rect(bx + 22, 17, 12, 11, th.far); rect(bx + 14, 13, 2, 2, "#ffd56a"); rect(bx + 25, 20, 2, 2, "#ffd56a"); }
      else if (th.shape === "sea") { rect(bx, 21, 40, 7, th.far); rect(bx + 6, 22, 8, 1, "#9fe0e8"); rect(bx + 24, 24, 6, 1, "#9fe0e8"); }
      else if (th.shape === "spike") { rect(bx + 4, 12, 4, 16, th.far); rect(bx + 2, 18, 8, 10, th.far); rect(bx + 22, 16, 3, 12, th.far); rect(bx + 20, 21, 7, 7, th.far); }
      else { rect(bx, 20, 40, 8, th.far); rect(bx + 8, 16, 16, 4, th.far); rect(bx + 12, 14, 8, 2, th.far); }
    }
    rect(0, 28, AW, AH - 28, th.ground);
    rect(0, 28, AW, 1, th.dash);
    var o2 = scroll % 16;
    for (var x2 = -16; x2 < AW + 16; x2 += 16) { rect(x2 - o2, 38, 6, 1, th.dash); rect(x2 - o2 + 9, 44, 4, 1, th.dash); }
  }

  function newFoes(m, boss) {
    var list = [];
    if (boss && m.boss) list.push({ e: m.boss, boss: true });
    else {
      var n = 1 + ((cycle * 7) % 3);
      for (var i = 0; i < n; i++) list.push({ e: m.enemies.length ? m.enemies[(cycle + i) % m.enemies.length] : null });
    }
    return list.map(function (f, i) { return { e: f.e, boss: f.boss, x: AW + 20 + i * 18, tx: AW - 22 - i * 17, hp: f.boss ? 6 : 3, flash: 0, dead: 0 }; });
  }

  E.update = function (real) {
    var s = G.state, ex = s && s.expedition;
    var on = !!ex;
    if (el.hidden === on) { el.hidden = !on; document.getElementById("app").classList.toggle("exp-on", on); if (on) { size(); phase = "walk"; phaseT = 0; foes = []; cycle = 0; E._bossDone = false; } }
    if (!on) return;
    var m = D.maps.find(function (x) { return x.id === ex.map; });
    if (!m) return;
    var start = ex.back - Battle.WEEKS, p = U.clamp((State.absWeek() + s.weekT - start) / Battle.WEEKS, 0, 1);
    nameEl.textContent = "出征中：" + m.name;
    leftEl.textContent = "還要 " + Math.max(1, Math.ceil((1 - p) * Battle.WEEKS * 7)) + " 天";
    barEl.style.width = (p * 100).toFixed(1) + "%";

    var dt = s.speed > 0 ? real : 0;
    t += dt; phaseT += dt;
    var party = G.residents.filter(function (r) { return ex.party.indexOf(r.uid) >= 0; });
    // 階段：走路 → 怪物出現 → 開打 → 打完繼續走（最後一段遇到王）
    if (phase === "walk") { scroll += dt * 26; if (phaseT > 3.2) { cycle++; foes = newFoes(m, p > 0.82 && !E._bossDone); phase = "meet"; phaseT = 0; } }
    else if (phase === "meet") { foes.forEach(function (f) { f.x += (f.tx - f.x) * Math.min(1, dt * 5); }); if (phaseT > 0.9) { phase = "fight"; phaseT = 0; hitT = 0; } }
    else if (phase === "fight") {
      hitT -= dt;
      if (hitT <= 0 && party.length) {
        hitT = 0.32;
        var live = foes.filter(function (f) { return f.hp > 0; });
        if (live.length) {
          var who = party[Math.floor(Math.random() * party.length)], f = live[0];
          lunge[who.uid] = 0.18; f.hp--; f.flash = 0.12;
          fx.push({ x: f.x + (Math.random() * 6 - 3), y: 16, s: "-" + (5 + Math.floor(Math.random() * 30 * (who.lv || 1) / 5)), c: "#ffffff", t: 0 });
          if (f.hp <= 0) { f.dead = 0.01; if (f.boss) E._bossDone = true; SFX.play("hit", 0.1); }
          else SFX.play("hit", 0.1);
          // 偶爾被反擊
          if (Math.random() < 0.3) { var tgt = party[Math.floor(Math.random() * party.length)]; tgt._flash = 0.12; fx.push({ x: 0, who: tgt.uid, y: 16, s: "-" + (2 + Math.floor(Math.random() * 12)), c: "#ff8a7a", t: 0 }); }
        } else { phase = "won"; phaseT = 0; }
      }
    }
    else if (phase === "won") { if (phaseT > 0.8) { phase = "walk"; phaseT = 0; foes = []; } }
    foes.forEach(function (f) { f.flash = Math.max(0, f.flash - dt); if (f.dead) f.dead += dt; });
    Object.keys(lunge).forEach(function (u) { lunge[u] -= dt; if (lunge[u] <= 0) delete lunge[u]; });
    party.forEach(function (r) { r._flash = Math.max(0, (r._flash || 0) - dt); });
    fx = fx.filter(function (f) { f.t += dt; return f.t < 0.8; });

    // ---- 畫 ----
    g.imageSmoothingEnabled = false;
    background(THEME[m.id] || DEF_THEME);
    var moving = phase === "walk";
    var n = party.length, gap = Math.min(18, Math.max(12, 70 / Math.max(1, n)));
    var pos = {};
    party.forEach(function (r, i) {
      var x = 24 + (n - 1 - i) * gap + (lunge[r.uid] ? 5 : 0), y = 46 - (i % 2) * 2;
      pos[r.uid] = x;
      rect(x - 6, y - 1, 12, 2, "rgba(0,0,0,.25)");
      sprite(sheetOf(r), 2, moving ? Math.floor(t * 6 + i) % 2 : 0, x, y, r._flash > 0);
    });
    foes.forEach(function (f, i) {
      if (f.dead > 0.45) return;
      var y = 46 - (i % 2) * 2, a = f.dead ? (Math.floor(f.dead * 20) % 2 ? 0.2 : 0.8) : 1;
      rect(f.x - 6, y - 1, 12, 2, "rgba(0,0,0,.25)");
      sprite(enemyImg(f.e), 1, Math.floor(t * 4 + i) % 2, f.x, y, f.flash > 0, a);
      if (f.boss) text("王", f.x + 12, y - 30, "#ff7a6a");
    });
    fx.forEach(function (f) { var x = f.who ? (pos[f.who] || 20) : f.x; text(f.s, x, f.y - f.t * 10, f.c); });
    if (phase === "won" && foes.some(function (f) { return f.boss; })) text("打倒了王！", AW / 2, 16, "#ffe38a");
  };
  return E;
})();
