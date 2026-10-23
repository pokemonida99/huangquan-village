// 畫面：鏡頭（整數倍放大）、地面、建築、人物、泡泡、特效、擺放預覽。
window.Render = (function () {
  var T = CFG.TILE;
  var R = { cam: { x: 0, y: 0, z: 2 }, dirty: true, ghost: null, sel: null };
  var cv, ctx, dpr = 1, VW = 0, VH = 0;

  R.init = function () {
    try { R.showNames = !!localStorage.getItem("hq-village-names"); } catch (e) { R.showNames = false; }
    cv = document.getElementById("view");
    ctx = cv.getContext("2d");
    R.resize();
    window.addEventListener("resize", R.resize);
  };
  R.resize = function () {
    dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    VW = cv.width = Math.round(window.innerWidth * dpr);
    VH = cv.height = Math.round(window.innerHeight * dpr);
    cv.style.width = window.innerWidth + "px"; cv.style.height = window.innerHeight + "px";
    R.dpr = dpr;
    R.zMin = Math.max(1, Math.ceil(Math.min(VW / (CFG.W * T), VH / (CFG.H * T)) * 0.999)); // 至少整張寬或高塞滿
    R.zMin = Math.max(1, Math.floor(VW / (CFG.W * T)) || 1);
    R.zMax = Math.max(R.zMin + 1, dpr * 4);
    R.cam.z = U.clamp(R.cam.z, R.zMin, R.zMax);
    R.clamp();
  };
  R.defaultZoom = function () { return U.clamp(Math.round(dpr * (window.innerWidth < 700 ? 1 : 1.5)), R.zMin, R.zMax); };
  R.clamp = function () {
    var c = R.cam, vw = VW / c.z, vh = VH / c.z, mw = CFG.W * T, mh = CFG.H * T;
    var top = -60 / c.z * dpr, bot = 90 / c.z * dpr;   // 讓上下 UI 不擋住地圖邊
    c.x = vw >= mw ? (mw - vw) / 2 : U.clamp(c.x, 0, mw - vw);
    c.y = vh >= mh + top + bot ? (mh - vh) / 2 : U.clamp(c.y, top, mh - vh + bot);
  };
  R.centerOn = function (wx, wy) { R.cam.x = wx - VW / R.cam.z / 2; R.cam.y = wy - VH / R.cam.z / 2; R.clamp(); };
  // 以螢幕某點為中心縮放
  R.zoomAt = function (nz, sx, sy) {
    nz = U.clamp(nz, R.zMin, R.zMax);
    var c = R.cam; if (nz === c.z) return;
    var wx = c.x + sx * dpr / c.z, wy = c.y + sy * dpr / c.z;
    c.z = nz; c.x = wx - sx * dpr / nz; c.y = wy - sy * dpr / nz; R.clamp();
  };
  R.toWorld = function (sx, sy) { return { x: R.cam.x + sx * dpr / R.cam.z, y: R.cam.y + sy * dpr / R.cam.z }; };

  // ---- 低階畫筆（世界座標 → 螢幕） ----
  function SX(wx) { return Math.round((wx - R.cam.x) * R.cam.z); }
  function SY(wy) { return Math.round((wy - R.cam.y) * R.cam.z); }
  function px(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(SX(x), SY(y), Math.round(w * R.cam.z), Math.round(h * R.cam.z)); }
  function text(s, wx, wy, size, col, align, outline) {
    var fs = Math.round(size * dpr);
    ctx.font = "bold " + fs + "px 'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif";
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle";
    var x = SX(wx), y = SY(wy);
    if (outline !== false) { ctx.lineWidth = Math.max(2, fs / 4); ctx.strokeStyle = "rgba(13,11,26,.9)"; ctx.strokeText(s, x, y); }
    ctx.fillStyle = col || "#fff"; ctx.fillText(s, x, y);
  }
  R.text = text;

  // ---- 角色配色（沒有像素圖時的替身） ----
  var LOOK = {
    yutong: { hair: "#0d0b1a", cloth: "#cfe3c4", trim: "#6a9a6a" },
    yuelao: { hair: "#8a5a36", cloth: "#f3ebdd", trim: "#a8242e" },
    lee: { hair: "#16142b", cloth: "#16142b", trim: "#a8242e", hat: true },
    mimi: { animal: "#c08a52", ear: "#f3d58c" },
    heitang: { animal: "#5a3a26", ear: "#3a2a1e" },
    xiaoyu: { hair: "#3a355c", cloth: "#e0423a", trim: "#f3ebdd" },
    dabao: { hair: "#16142b", cloth: "#e2b65a", trim: "#8a5a36" },
    baimei: { hair: "#f3ebdd", cloth: "#b85aa8", trim: "#7a2a6a" },
    huji: { hair: "#e2b65a", cloth: "#a8242e", trim: "#f3d58c" },
    jiuwei: { hair: "#f3ebdd", cloth: "#4a4470", trim: "#9fe0d8" },
    guanyin: { hair: "#c9c0d6", cloth: "#f3ebdd", trim: "#b85aa8" }
  };
  function hashCol(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; var P = ["#e0423a", "#4fa3a5", "#e2b65a", "#b85aa8", "#6a9a6a", "#f08a6a", "#5f5a8a", "#c08a52"]; return P[Math.abs(h) % P.length]; }

  function drawGhost(x, y, tint, band, alpha, t) {
    ctx.globalAlpha = alpha;
    var bob = Math.round(Math.sin(t * 3) * 1);
    y += bob;
    px(x - 5, y - 21, 10, 8, tint);
    px(x - 6, y - 15, 12, 10, tint);
    var w = Math.floor(t * 4) % 2;
    for (var i = 0; i < 3; i++) px(x - 6 + i * 4 + w, y - 5, 2, 2, tint);
    px(x - 3, y - 17, 1, 2, "#221f3d"); px(x + 2, y - 17, 1, 2, "#221f3d");
    px(x - 4, y - 22, 8, 2, band || "#ffffff"); px(x - 1, y - 24, 2, 2, band || "#ffffff");
    ctx.globalAlpha = 1;
  }
  function drawPerson(x, y, look, t, moving) {
    if (look.animal) {
      px(x - 6, y - 10, 12, 8, look.animal); px(x - 5, y - 16, 10, 7, look.animal);
      px(x - 5, y - 18, 3, 3, look.ear); px(x + 2, y - 18, 3, 3, look.ear);
      px(x - 3, y - 14, 1, 2, "#0d0b1a"); px(x + 2, y - 14, 1, 2, "#0d0b1a");
      var l = moving ? Math.floor(t * 6) % 2 : 0;
      px(x - 5 + l, y - 2, 2, 2, look.animal); px(x + 3 - l, y - 2, 2, 2, look.animal);
      px(x + 6, y - 9, 3, 2, look.animal);
      return;
    }
    var leg = moving ? Math.floor(t * 6) % 2 : 0;
    px(x - 4, y - 4, 3, 4 - leg, "#3a2a1e"); px(x + 1, y - 4, 3, 3 + leg, "#3a2a1e");
    px(x - 5, y - 14, 10, 11, look.cloth); px(x - 1, y - 14, 2, 11, look.trim);
    px(x - 4, y - 21, 8, 7, "#f6c6b0");
    px(x - 5, y - 25, 10, 5, look.hair); px(x - 5, y - 21, 2, 5, look.hair); px(x + 3, y - 21, 2, 5, look.hair);
    px(x - 2, y - 18, 1, 2, "#0d0b1a"); px(x + 1, y - 18, 1, 2, "#0d0b1a");
    if (look.hat) { px(x - 6, y - 26, 12, 2, "#0d0b1a"); px(x - 4, y - 32, 8, 6, "#0d0b1a"); px(x - 4, y - 28, 8, 1, "#a8242e"); }
  }
  function drawMobBlob(m, t) {
    var C = { lost: "#8f86a6", miasma: "#7a2a6a", lizard: "#4f7a3a", drowner: "#2e6b73" }[m.type.id] || "#7a2a6a";
    var x = m.px, y = m.py, s = Math.sin(t * 4 + m.uid) * 1.5;
    px(x - 7, y - 12 + s, 14, 10, C); px(x - 5, y - 16 + s, 10, 4, C); px(x - 8, y - 6, 16, 3, "rgba(13,11,26,.4)");
    px(x - 4, y - 11 + s, 2, 2, "#e0423a"); px(x + 2, y - 11 + s, 2, 2, "#e0423a");
  }

  // 走路圖：64×128，2 欄 × 4 列（下、左、右、上）
  function drawSheet(img, x, y, dir, frame) {
    var z = R.cam.z;
    ctx.drawImage(img, frame * 32, dir * 32, 32, 32, SX(x - 16), SY(y - 30), 32 * z, 32 * z);
  }

  function drawWalker(e, t) {
    if (e.hidden) return;
    var moving = !!e.path, frame = moving ? Math.floor(e.anim) % 2 : 0;
    if (e.kind === "mob") {
      var mi = Assets.get("art/chars/mob-" + e.type.id + ".png");
      if (mi) drawSheet(mi, e.px, e.py, e.dir, frame); else drawMobBlob(e, t);
      return;
    }
    var spr = e.charId ? Assets.get(D.charById[e.charId] ? D.charById[e.charId].sprite : "") : Assets.get("art/chars/soul-" + e.skin + ".png");
    if (spr) { ctx.globalAlpha = e.kind === "soul" ? 0.92 : 1; drawSheet(spr, e.px, e.py, e.dir, frame); ctx.globalAlpha = 1; return; }
    if (e.kind === "soul") drawGhost(e.px, e.py, ["#f3ebdd", "#c9c0d6", "#ffffff", "#cfe3c4", "#f6c6b0", "#c9c0d6", "#9fe0d8", "#f3ebdd"][e.skin - 1], "#ffffff", 0.88, t + e.uid);
    else if (e.charId) drawPerson(e.px, e.py, LOOK[e.charId] || { hair: "#16142b", cloth: hashCol(e.charId), trim: "#f3ebdd" }, t, moving);
    else drawGhost(e.px, e.py, "#f3ebdd", hashCol(e.job), 1, t + e.uid);
  }

  function drawBuilding(b) {
    var def = b.def, x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T;
    var img = (b.broken && def.damaged && Assets.get(def.damaged)) || Assets.get(def.sprite);
    if (img) {
      ctx.drawImage(img, SX(x), SY(y + h - img.height), img.width * R.cam.z, img.height * R.cam.z);
    } else {
      var lift = def.cat === "deco" ? 0 : 12;
      var col = def.color;
      if (def.cat === "deco") {
        if (def.id === "lantern") { px(x + 14, y + 8, 4, 22, "#3a2a1e"); px(x + 10, y + 2, 12, 10, "#e0423a"); px(x + 12, y + 4, 8, 6, "#f3d58c"); }
        else if (def.id === "bench") { px(x + 3, y + 16, 26, 6, "#8a5a36"); px(x + 3, y + 22, 3, 6, "#5a3a26"); px(x + 26, y + 22, 3, 6, "#5a3a26"); }
        else { px(x + 2, y + 2, w - 4, h - 4, "#2f4a2a"); for (var i = 0; i < b.w * b.h * 4; i++) px(x + 4 + (i * 7) % (w - 8), y + 4 + ((i * 11) % (h - 8)), 3, 3, i % 2 ? "#e0423a" : "#a8242e"); }
      } else {
        px(x + 1, y + 4 - lift, w - 2, h - 4 + lift, "#3a2a1e");
        px(x + 2, y + 10 - lift, w - 4, h - 12 + lift, col);
        px(x - 1, y - lift, w + 2, 12, "#221f3d"); px(x - 1, y + 10 - lift, w + 2, 2, "#5f5a8a");
        var dx = (b.door ? b.door.x * T : x + w / 2 - 6);
        if (b.door && b.door.y === b.y + b.h) px(Math.max(x + 3, Math.min(x + w - 13, dx + 10)), y + h - 12, 10, 12, "#16142b");
        // 燈籠
        px(x + 3, y + 12 - lift, 4, 6, "#e0423a"); px(x + w - 7, y + 12 - lift, 4, 6, "#e0423a");
        px(x + 4, y + 13 - lift, 2, 3, "#f3d58c"); px(x + w - 6, y + 13 - lift, 2, 3, "#f3d58c");
      }
    }
    if ((b.broken && !(def.damaged && Assets.get(def.damaged))) || b.closedUntil > State.absWeek()) { ctx.globalAlpha = 0.5; px(x, y, w, h, "#0d0b1a"); ctx.globalAlpha = 1; }
  }
  function drawBuildingLabel(b) {
    var def = b.def, x = b.x * T, w = b.w * T, y = b.y * T;
    var img = Assets.get(def.sprite);
    var showName = (!img && def.cat !== "deco" && R.cam.z >= dpr) || (R.showNames && def.cat !== "deco" && def.cat !== "road" && R.cam.z >= dpr);
    if (showName) text(def.name, x + w / 2, y + b.h * T / 2 + 2, def.cat === "fixed" ? 11 : 9, def.cat === "special" ? "#f3d58c" : "#f3ebdd");
    if (def.maxLv > 1 && b.lv > 1 && R.cam.z >= dpr) text("Lv" + b.lv, x + w - 2, y - (img ? 0 : 6), 8, "#9fe0d8", "right");
    if (b.broken) text("🔧 受損", x + w / 2, y + 8, 9, "#f08a6a");
  }

  function drawBubble(e, t) {
    if (e.hidden || e.kind !== "soul") return;
    var icon = null, col = "#f3ebdd";
    if (e.st === "decide") { icon = "✨"; col = "#f3d58c"; }
    else if (e.st === "reinc" || e.st === "macaron") icon = "🌸";
    else if (e.st === "leave") return;
    else { var w = e.wish(); if (!w) return; icon = (D.wishById[w] || {}).icon || "💭"; }
    var bx = e.px, by = e.py - 34 + Math.sin(t * 2 + e.uid) * 1;
    var r = e.st === "decide" ? 1 + 0.15 * Math.sin(t * 6) : 1;
    px(bx - 8 * r, by - 7 * r, 16 * r, 13 * r, col); px(bx - 1, by + 6 * r, 3, 2, col);
    text(icon, bx, by, 8.5 * r * R.cam.z / dpr, "#000", "center", false);
  }

  R.draw = function () {
    var c = R.cam, t = performance.now() / 1000;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0d0b1a"; ctx.fillRect(0, 0, VW, VH);
    var gl = (Math.floor(t * 2) % 2 && MapGen.ground2) ? MapGen.ground2 : MapGen.ground;
    if (gl) {
      var sx = Math.max(0, c.x), sy = Math.max(0, c.y);
      var sw = Math.min(CFG.W * T - sx, VW / c.z), sh = Math.min(CFG.H * T - sy, VH / c.z);
      if (sw > 0 && sh > 0) ctx.drawImage(gl, sx, sy, sw, sh, SX(sx), SY(sy), sw * c.z, sh * c.z);
    }
    var x0 = Math.max(0, Math.floor(c.x / T)), y0 = Math.max(0, Math.floor(c.y / T));
    var x1 = Math.min(CFG.W - 1, Math.ceil((c.x + VW / c.z) / T)), y1 = Math.min(CFG.H - 1, Math.ceil((c.y + VH / c.z) / T));
    // 河面流光（往下流）
    var x, y;
    if (!MapGen.tileset()) for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      if (MapGen.kind[MapGen.idx(x, y)] !== K.WATER) continue;
      var o = ((t * 10 + x * 7 + y * 13) % 32) | 0;
      px(x * T + ((x * 11 + y * 5) % 20), y * T + o, 6, 1, "rgba(159,224,216,.45)");
      if ((x + y) % 3 === 0) px(x * T + 20, y * T + ((o + 16) % 32), 4, 1, "rgba(159,224,216,.3)");
    }
    // 奈何橋標記
    var ex = MapGen.exit;
    if (!G.buildings.some(function (b) { return b.def.extra.exit; })) { px(ex.x * T + 12, ex.y * T - 6, 8, 3, "#e0423a"); if (c.z >= dpr) text("奈何橋", ex.x * T + 16, ex.y * T - 10, 8, "#f6c6b0"); }

    // 列車
    if (G.train) {
      var tt = G.train.t, trainX;
      if (tt < 1.2) trainX = -220 + (1 - Math.pow(1 - tt / 1.2, 2)) * (13 * T + 220);
      else if (tt < 2.2) trainX = 13 * T;
      else trainX = 13 * T + Math.pow((tt - 2.2), 2) * 500;
      for (var car = 0; car < 4; car++) {
        var cx = trainX - car * 50;
        px(cx, 22, 46, 20, car === 0 ? "#16142b" : "#6b1a22"); px(cx + 4, 26, 38, 6, "#f3d58c"); px(cx, 40, 46, 3, "#0d0b1a");
        if (car === 0) { px(cx + 30, 14, 8, 8, "#16142b"); px(cx + 31, 6 - (tt * 20 % 6), 6, 6, "rgba(201,192,214,.5)"); }
      }
    }

    // 建築＋人物，依腳底 y 排序
    var list = [];
    G.buildings.forEach(function (b) { list.push({ y: (b.y + b.h) * T - 1, b: b }); });
    G.souls.forEach(function (e) { list.push({ y: e.py, e: e }); });
    G.residents.forEach(function (e) { if (!e.away) list.push({ y: e.py, e: e }); });
    G.mobs.forEach(function (e) { list.push({ y: e.py, e: e }); });
    list.sort(function (a, b) { return a.y - b.y; });
    list.forEach(function (it) { if (it.b) drawBuilding(it.b); else drawWalker(it.e, t); });

    // 未開放區塊：有 tileset 就疊霧，沒有就壓暗
    var TS = MapGen.tileset();
    MapGen.zones.forEach(function (z) {
      if (MapGen.zoneOpen(z.id)) return;
      var zy = z.y0 * T, zh = (z.y1 - z.y0 + 1) * T;
      if (TS && TS.cell("fog_0")) {
        ctx.globalAlpha = z.wild ? 0.45 : 0.8;
        for (var fy = Math.max(z.y0, y0); fy <= Math.min(z.y1, y1); fy++) for (var fx = x0; fx <= x1; fx++) {
          var fc = TS.cell((fx + fy) % 3 ? "fog_0" : "fog_1");
          ctx.drawImage(TS.img, fc[0], fc[1], T, T, SX(fx * T), SY(fy * T), T * c.z, T * c.z);
        }
        ctx.globalAlpha = 1;
        var ec = TS.cell("fog_edge_s");
        if (ec && MapGen.zoneOpen(z.id - 1) && z.y0 - 1 >= y0 && z.y0 - 1 <= y1) for (var ex2 = x0; ex2 <= x1; ex2++) ctx.drawImage(TS.img, ec[0], ec[1], T, T, SX(ex2 * T), SY((z.y0 - 1) * T), T * c.z, T * c.z);
      } else {
        ctx.globalAlpha = z.wild ? 0.35 : 0.5; px(0, zy, CFG.W * T, zh, "#0d0b1a"); ctx.globalAlpha = 1;
        for (var i = 0; i < CFG.W; i += 2) px(i * T, zy, T, 2, "rgba(122,42,106,.6)");
      }
    });

    // 標籤、泡泡
    G.buildings.forEach(drawBuildingLabel);
    G.souls.forEach(function (e) { drawBubble(e, t); });
    G.residents.forEach(function (e) {
      if (e.away || e.hidden) return;
      if (e.charId && c.z >= dpr) text(e.name, e.px, e.py + 5, 7.5, "#f3d58c");
      if (e.st === "fight" || e.hp < e.maxhp) { px(e.px - 8, e.py - 30, 16, 2, "#0d0b1a"); px(e.px - 8, e.py - 30, 16 * Math.max(0, e.hp / e.maxhp), 2, "#8fb85a"); }
      if (e.st === "work") text("💼", e.px + 9, e.py - 26, 7, "#fff", "center", false);
    });
    G.mobs.forEach(function (m) {
      if (m.hp < m.maxhp) { px(m.px - 8, m.py - 20, 16, 2, "#0d0b1a"); px(m.px - 8, m.py - 20, 16 * Math.max(0, m.hp / m.maxhp), 2, "#e0423a"); }
      if (c.z >= dpr * 2) text(m.name + " Lv" + m.lv, m.px, m.py + 5, 6.5, "#c9c0d6");
    });
    // 區塊牌子
    MapGen.zones.forEach(function (z) {
      if (MapGen.zoneOpen(z.id)) return;
      var cy = (z.y0 + z.y1 + 1) / 2 * T, cx = 8 * T;
      if (z.wild) { text("荒岸（外圍）", cx, cy, 10, "#b85aa8"); return; }
      var nz = Sim.nextZone(), r = Sim.expandReq(z);
      text((nz && nz.id === z.id ? "🔒 點這裡擴建：" : "🔒 ") + z.name, cx, cy - 8, 11, "#f3ebdd");
      text("☆" + r.star + "・功德 " + r.merit + "　（現在是外圍，會有怪）", cx, cy + 8, 8, "#c9c0d6");
    });

    // 特效
    G.fx.forEach(function (f) {
      var a = 1 - f.t / f.life;
      ctx.globalAlpha = Math.max(0, a);
      if (f.kind === "text") text(f.text, f.x, f.y, 8, f.color);
      else px(f.x, f.y, 2, 2, f.color);
      ctx.globalAlpha = 1;
    });

    // 選取中的建築
    if (R.sel) { ctx.strokeStyle = "#f3d58c"; ctx.lineWidth = 2 * dpr; ctx.strokeRect(SX(R.sel.x * T), SY(R.sel.y * T), R.sel.w * T * c.z, R.sel.h * T * c.z); }

    // 擺放預覽
    var g = R.ghost;
    if (g && g.def) {
      var ok = MapGen.canPlace(g.def, g.x, g.y);
      ctx.globalAlpha = 0.55;
      px(g.x * T, g.y * T, g.def.size[0] * T, g.def.size[1] * T, ok ? "#8fb85a" : "#e0423a");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ok ? "#cfe3c4" : "#f08a6a"; ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(SX(g.x * T), SY(g.y * T), g.def.size[0] * T * c.z, g.def.size[1] * T * c.z);
      text(g.def.name, (g.x + g.def.size[0] / 2) * T, g.y * T - 8, 10, ok ? "#cfe3c4" : "#f08a6a");
      // 可蓋的格子提示
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) if (MapGen.canBuildTile(x, y, g.def.cat === "road")) px(x * T + 15, y * T + 15, 2, 2, "rgba(207,227,196,.35)");
    }
  };

  return R;
})();
