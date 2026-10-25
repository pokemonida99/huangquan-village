// 畫面（等角）：鏡頭（整數倍放大）、地面、建築、人物、列車、泡泡、特效、擺放預覽、點選。
// 邏輯座標仍是正交格子（ISO.p 換算）；鏡頭 cam.x / cam.y 是等角畫面上的像素。
window.Render = (function () {
  var T = CFG.TILE;
  var R = { cam: { x: 0, y: 0, z: 2 }, dirty: true, ghost: null, sel: null };
  var cv, ctx, dpr = 1, VW = 0, VH = 0;
  var hits = [];   // 這一格畫出來、可以點的東西（由後往前）

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
    R.zMin = Math.max(1, Math.floor(VW / ISO.W));
    R.zMax = Math.max(R.zMin + 1, dpr * 2);
    R.cam.z = U.clamp(R.cam.z, R.zMin, R.zMax);
    R.clamp();
  };
  // 手機：一格菱形約 32 CSS px（開羅的密度）；桌機大一點
  R.defaultZoom = function () {
    var want = window.innerWidth < 700 ? 36 : 48, best = 1;   // 一格菱形想要幾 CSS px 寬（開羅手機版約 36）
    for (var z = 1; z <= R.zMax; z++) if (Math.abs(ISO.TW * z / dpr - want) <= Math.abs(ISO.TW * best / dpr - want)) best = z;
    return U.clamp(best, R.zMin, R.zMax);
  };
  R.clamp = function () {
    var c = R.cam, vw = VW / c.z, vh = VH / c.z, mw = ISO.W, mh = ISO.H;
    var top = -70 / c.z * dpr, bot = 110 / c.z * dpr;   // 上下 UI 不擋住地圖邊
    c.x = vw >= mw ? (mw - vw) / 2 : U.clamp(c.x, 0, mw - vw);
    c.y = vh >= mh + top + bot ? (mh - vh) / 2 : U.clamp(c.y, top, mh - vh + bot);
  };
  R.centerOn = function (wx, wy) { var p = ISO.p(wx, wy); R.cam.x = p.x - VW / R.cam.z / 2; R.cam.y = p.y - VH / R.cam.z / 2; R.clamp(); };
  R.zoomAt = function (nz, sx, sy) {
    nz = U.clamp(nz, R.zMin, R.zMax);
    var c = R.cam; if (nz === c.z) return;
    var wx = c.x + sx * dpr / c.z, wy = c.y + sy * dpr / c.z;
    c.z = nz; c.x = wx - sx * dpr / nz; c.y = wy - sy * dpr / nz; R.clamp();
  };
  R.toIso = function (sx, sy) { return { x: R.cam.x + sx * dpr / R.cam.z, y: R.cam.y + sy * dpr / R.cam.z }; };
  R.toWorld = function (sx, sy) { var p = R.toIso(sx, sy); return ISO.toWorld(p.x, p.y); };

  // ---- 低階畫筆（等角像素 → 螢幕） ----
  function SX(x) { return Math.round((x - R.cam.x) * R.cam.z); }
  function SY(y) { return Math.round((y - R.cam.y) * R.cam.z); }
  function px(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(SX(x), SY(y), Math.round(w * R.cam.z), Math.round(h * R.cam.z)); }
  function blit(img, x, y) { ctx.drawImage(img, SX(x), SY(y), img.width * R.cam.z, img.height * R.cam.z); }
  function text(s, x, y, size, col, align, outline) {
    var fs = Math.round(size * dpr);
    ctx.font = "bold " + fs + "px 'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif";
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle";
    var X = SX(x), Y = SY(y);
    if (outline !== false) { ctx.lineWidth = Math.max(2, fs / 4); ctx.strokeStyle = "rgba(30,20,24,.9)"; ctx.lineJoin = "round"; ctx.strokeText(s, X, Y); }
    ctx.fillStyle = col || "#fff"; ctx.fillText(s, X, Y);
  }
  R.text = text;
  // 佔地菱形（格子座標）
  function footPath(x, y, w, h) {
    var a = ISO.g(x, y), b = ISO.g(x + w, y), c = ISO.g(x + w, y + h), d = ISO.g(x, y + h);
    ctx.beginPath(); ctx.moveTo(SX(a.x), SY(a.y)); ctx.lineTo(SX(b.x), SY(b.y)); ctx.lineTo(SX(c.x), SY(c.y)); ctx.lineTo(SX(d.x), SY(d.y)); ctx.closePath();
  }

  // ---- 顏色小工具 ----
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function shade(h, f) { var c = rgb(h); return "rgb(" + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * f))); }).join(",") + ")"; }

  // ---- 程式畫的等角方塊屋（還沒有等角美術的建築先用這個） ----
  var ROOF = { special: "#b8352f", shop: "#3f5490", food: "#a5532b", home: "#3f7f8f", fixed: "#b8352f" };
  var WALL = { special: "#f0e2c2", shop: "#ead9b4", food: "#f2dcae", home: "#e4dcc8", fixed: "#f0e2c2" };
  var spriteCache = {};
  // 像素化：透明度二值化＋1px 深色外框，讓程式畫的形狀也像點陣圖
  function crisp(cvs) {
    var g = cvs.getContext("2d"), im = g.getImageData(0, 0, cvs.width, cvs.height), d = im.data, Wd = cvs.width, Hd = cvs.height;
    var a = new Uint8Array(Wd * Hd), i, x, y;
    for (i = 0; i < Wd * Hd; i++) a[i] = d[i * 4 + 3] >= 110 ? 1 : 0;
    for (y = 0; y < Hd; y++) for (x = 0; x < Wd; x++) {
      i = y * Wd + x;
      if (a[i]) { d[i * 4 + 3] = 255; continue; }
      var edge = (x > 0 && a[i - 1]) || (x < Wd - 1 && a[i + 1]) || (y > 0 && a[i - Wd]) || (y < Hd - 1 && a[i + Wd]);
      if (edge) { d[i * 4] = 42; d[i * 4 + 1] = 28; d[i * 4 + 2] = 40; d[i * 4 + 3] = 255; } else d[i * 4 + 3] = 0;
    }
    g.putImageData(im, 0, 0);
    return cvs;
  }
  function boxSprite(def) {
    if (spriteCache[def.id]) return spriteCache[def.id];
    var w = def.size[0], h = def.size[1], cat = def.cat, m = Math.min(w, h);
    var deco = cat === "deco";
    var wallH = deco ? 0 : (def.cat === "home" && w * h === 1 ? 14 : 12 + 6 * m), roofH = deco ? 0 : 8 + 5 * m;
    var top = wallH + roofH + 8 + 2;
    var cvs = document.createElement("canvas");
    cvs.width = (w + h) * ISO.HW + 2; cvs.height = (w + h) * ISO.HH + top + 2;
    var g = cvs.getContext("2d");
    function P(u, v, z) { return [(u - v) * ISO.HW + h * ISO.HW + 1, (u + v) * ISO.HH + top - (z || 0)]; }
    function poly(pts, col) { g.fillStyle = col; g.beginPath(); pts.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.fill(); }
    function quadS(u0, u1, z0, z1, col) { poly([P(u0, h, z0), P(u1, h, z0), P(u1, h, z1), P(u0, h, z1)], col); }   // 正面（朝左下）
    function quadE(v0, v1, z0, z1, col) { poly([P(w, v0, z0), P(w, v1, z0), P(w, v1, z1), P(w, v0, z1)], col); }   // 側面（朝右下）
    if (deco) drawDeco(def, g, P, poly, w, h);
    else {
      var wall = WALL[cat] || "#ead9b4", roof = ROOF[cat] || "#3f5490", acc = def.color || "#8a5a36";
      quadS(0, w, 0, wallH, wall); quadE(0, h, 0, wallH, shade(wall, 0.78));
      // 木作腰板
      quadS(0, w, 0, 5, shade(acc, 0.9)); quadE(0, h, 0, 5, shade(acc, 0.7));
      // 窗
      var nwin = Math.max(1, w * 2 - 1);
      for (var i = 0; i < nwin; i++) {
        var uc = (i + 0.5) * w / nwin; if (Math.abs(uc - w / 2) < 0.3) continue;
        quadS(uc - 0.14, uc + 0.14, wallH * 0.42, wallH * 0.78, "#ffd56a");
      }
      for (i = 0; i < h; i++) { var vc = i + 0.5; quadE(vc - 0.14, vc + 0.14, wallH * 0.42, wallH * 0.78, "#e8b64e"); }
      // 門＋門簾
      var dh = Math.min(wallH - 3, 12);
      quadS(w / 2 - 0.2, w / 2 + 0.2, 0, dh, "#3a2418"); quadS(w / 2 - 0.22, w / 2 + 0.22, dh - 4, dh, acc);
      // 屋頂（四坡，屋脊沿長邊）
      var o = 0.16, z = wallH, NW = P(-o, -o, z), NE = P(w + o, -o, z), SE = P(w + o, h + o, z), SW = P(-o, h + o, z), r1, r2;
      if (w >= h) { r1 = P(h / 2, h / 2, z + roofH); r2 = P(w - h / 2, h / 2, z + roofH); poly([NW, NE, r2, r1], shade(roof, 1.25)); poly([NW, r1, SW], shade(roof, 1.15)); poly([NE, SE, r2], shade(roof, 0.72)); poly([SW, SE, r2, r1], roof); }
      else { r1 = P(w / 2, w / 2, z + roofH); r2 = P(w / 2, h - w / 2, z + roofH); poly([NW, SW, r2, r1], shade(roof, 1.15)); poly([NW, NE, r1], shade(roof, 1.25)); poly([NE, SE, r2, r1], shade(roof, 0.72)); poly([SW, SE, r2], roof); }
      // 屋瓦橫紋
      g.strokeStyle = shade(roof, 0.78); g.lineWidth = 1;
      for (var k = 1; k < 3; k++) { var f = k / 3, zz = z + roofH * f; var a1 = P(-o + (h / 2 + o) * f, h + o - (h / 2 + o) * f, zz), b1 = P(w + o - (h / 2 + o) * f * (w >= h ? 1 : 0), h + o - (h / 2 + o) * f, zz); if (w >= h) { g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); } }
      // 屋簷暗線
      g.strokeStyle = shade(roof, 0.5); g.beginPath(); g.moveTo(SW[0], SW[1] + 1); g.lineTo(SE[0], SE[1] + 1); g.lineTo(NE[0], NE[1] + 1); g.stroke();
      // 紅燈籠
      [0.12, w - 0.12].forEach(function (u) { var p = P(u, h + 0.05, wallH - 2); g.fillStyle = "#e0423a"; g.fillRect(Math.round(p[0]) - 2, Math.round(p[1]), 4, 5); g.fillStyle = "#ffd27a"; g.fillRect(Math.round(p[0]) - 1, Math.round(p[1]) + 1, 2, 3); });
      // 招牌
      if (cat === "special" || def.fixed) { var sp = P(w / 2, h + o, wallH + 2); g.fillStyle = "#5a3020"; g.fillRect(Math.round(sp[0]) - 8, Math.round(sp[1]) - 3, 16, 7); g.fillStyle = "#f3d58c"; g.fillRect(Math.round(sp[0]) - 7, Math.round(sp[1]) - 2, 14, 5); }
    }
    var spr = { img: crisp(cvs), w: w, h: h, ox: 1, oy: 1 };
    spriteCache[def.id] = spr;
    return spr;
  }
  function drawDeco(def, g, P, poly, w, h) {
    var c = P(w / 2, h / 2, 0), x = Math.round(c[0]), y = Math.round(c[1]);
    function r(ax, ay, aw, ah, col) { g.fillStyle = col; g.fillRect(x + ax, y + ay, aw, ah); }
    switch (def.id) {
      case "lantern": r(-1, -26, 2, 26, "#4a3020"); r(-4, -30, 8, 9, "#e0423a"); r(-2, -28, 4, 5, "#ffd27a"); r(-5, -31, 10, 2, "#2a1e28"); break;
      case "bench": poly([P(0.2, 0.35, 6), P(0.8, 0.35, 6), P(0.8, 0.65, 6), P(0.2, 0.65, 6)], "#b27a44"); poly([P(0.2, 0.35, 6), P(0.8, 0.35, 6), P(0.8, 0.35, 12), P(0.2, 0.35, 12)], "#8a5a32"); r(-8, -4, 2, 5, "#5a3a26"); r(6, -2, 2, 5, "#5a3a26"); break;
      case "swing": r(-10, -24, 2, 24, "#7a5030"); r(8, -24, 2, 24, "#7a5030"); r(-10, -26, 20, 3, "#8a5a32"); r(-5, -23, 1, 14, "#3a2a1e"); r(4, -23, 1, 14, "#3a2a1e"); r(-6, -9, 12, 3, "#c94a3a"); break;
      case "higanbana": for (var i = 0; i < 9; i++) { var a = i * 2.4, rr = 4 + (i % 3) * 3; r(Math.round(Math.cos(a) * rr * 1.6) - 1, Math.round(Math.sin(a) * rr * 0.8) - 6, 3, 3, i % 2 ? "#e23a32" : "#ff6a52"); r(Math.round(Math.cos(a) * rr * 1.6), Math.round(Math.sin(a) * rr * 0.8) - 3, 1, 4, "#3f7a34"); } break;
      case "garden": poly([P(0.3, 0.3, 0), P(1.3, 0.3, 0), P(1.3, 1.1, 0), P(0.3, 1.1, 0)], "#3ca9bd"); poly([P(0.5, 0.5, 0), P(1.1, 0.5, 0), P(1.1, 0.9, 0), P(0.5, 0.9, 0)], "#5cc3d0"); r(10, -30, 16, 16, "#3f7a34"); r(13, -34, 10, 6, "#4f963f"); r(17, -16, 3, 10, "#5a3a26"); r(-20, -6, 8, 5, "#9a96a8"); break;
      case "redbridge": poly([P(0.25, 0, 3), P(0.75, 0, 3), P(0.75, h, 3), P(0.25, h, 3)], "#c8342e"); poly([P(0.75, 0, 3), P(0.75, h, 3), P(0.75, h, 0), P(0.75, 0, 0)], "#8a1f1c"); break;
      default: r(-6, -10, 12, 10, def.color || "#4f7a3a"); r(-4, -13, 8, 4, shade(def.color || "#4f7a3a", 1.2));
    }
  }
  // 建築要畫哪張：等角美術 > 程式方塊屋
  function buildingSprite(def, broken, flip) {
    var spr = null;
    var iso = HQ.artIndex && HQ.artIndex.iso && HQ.artIndex.iso[def.id];
    // 轉向：有 GPT 重畫的轉向圖就用（佔地寬高對調）
    if (flip && iso && iso.turn && !broken) {
      var ti = Assets.get(Assets.isoTurnPath(def.id));
      if (ti) return { img: ti, w: def.size[1], h: def.size[0], ox: 0, oy: 0, art: true };
    }
    if (iso) {
      var img = (broken && iso.damaged && Assets.get("art/iso/" + def.id + "-damaged.png")) || Assets.get(Assets.isoPath(def.id));
      if (img) spr = { img: img, w: def.size[0], h: def.size[1], ox: 0, oy: 0, art: true };
    }
    if (!spr) spr = boxSprite(def);
    return flip ? flipped(spr) : spr;
  }
  // 轉向：等角圖左右鏡像，剛好就是寬高對調後的樣子
  var flipCache = new Map();
  function flipped(spr) {
    var f = flipCache.get(spr.img);
    if (!f) {
      var c = document.createElement("canvas"); c.width = spr.img.width; c.height = spr.img.height;
      var g = c.getContext("2d"); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(spr.img, 0, 0);
      f = { img: c, w: spr.h, h: spr.w, ox: spr.img.width - (spr.w + spr.h) * ISO.TW / 2 - spr.ox, oy: spr.oy, art: spr.art };
      flipCache.set(spr.img, f);
    }
    return f;
  }
  R.buildingSprite = buildingSprite;
  // 圖的左上角（等角像素）：圖寬對齊佔地菱形，底邊對齊佔地下角
  function spriteOrigin(spr, bx, by) {
    var left = ISO.footLeft(bx, by, spr.h) - spr.ox, bottom = ISO.footBottom(bx, by, spr.w, spr.h) + spr.oy;
    return { x: left, y: bottom - spr.img.height };
  }

  // ---- 人物 ----
  function hashCol(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; var P = ["#e0423a", "#4fa3a5", "#e2b65a", "#b85aa8", "#6a9a6a", "#f08a6a", "#5f5a8a", "#c08a52"]; return P[Math.abs(h) % P.length]; }
  function drawGhost(x, y, tint, band, alpha, t) {
    ctx.globalAlpha = alpha;
    y += Math.round(Math.sin(t * 3));
    px(x - 5, y - 21, 10, 8, tint); px(x - 6, y - 15, 12, 10, tint);
    var w = Math.floor(t * 4) % 2;
    for (var i = 0; i < 3; i++) px(x - 6 + i * 4 + w, y - 5, 2, 2, tint);
    px(x - 3, y - 17, 1, 2, "#221f3d"); px(x + 2, y - 17, 1, 2, "#221f3d");
    px(x - 4, y - 22, 8, 2, band || "#ffffff");
    ctx.globalAlpha = 1;
  }
  function drawMobBlob(m, x, y, t) {
    var C = { lost: "#8f86a6", miasma: "#7a2a6a", lizard: "#4f7a3a", drowner: "#2e6b73" }[m.type.id] || "#7a2a6a";
    var s = Math.sin(t * 4 + m.uid) * 1.5;
    px(x - 7, y - 12 + s, 14, 10, C); px(x - 5, y - 16 + s, 10, 4, C);
    px(x - 4, y - 11 + s, 2, 2, "#e0423a"); px(x + 2, y - 11 + s, 2, 2, "#e0423a");
  }
  // 走路圖：64×128，2 欄 × 4 列（下、左、右、上）。格子方向剛好對上等角的四個斜向
  // sq：壓扁量（落地時 >0 變矮變寬、跳到最高 <0 拉長），腳底位置不變；flash：被打閃白
  function drawSheet(img, x, y, dir, frame, sq, flash) {
    var z = R.cam.z, w = 32 * (1 + (sq || 0) * 0.6), h = 32 * (1 - (sq || 0));
    var dx = SX(x - w / 2), dy = SY(y + 2 - h);
    ctx.drawImage(img, frame * 32, dir * 32, 32, 32, dx, dy, w * z, h * z);
    if (flash) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.75; ctx.drawImage(img, frame * 32, dir * 32, 32, 32, dx, dy, w * z, h * z); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; }
  }
  function shadow(x, y, k) { k = k == null ? 1 : k; ctx.globalAlpha = 0.22 * (0.5 + k / 2); px(x - 7 * k, y - 1, 14 * k, 3, "#1a1020"); px(x - 5 * k, y - 2, 10 * k, 5, "#1a1020"); ctx.globalAlpha = 1; }
  // 每個人在路上錯開一點（同一格的人不會完全疊在一起）
  function lane(e) { var u = e.uid || 0; return { x: ((u * 7) % 5 - 2) * 2, y: ((u * 13) % 5 - 2) * 1.5 }; }
  var LUNGE = [[0, 4], [-4, 0], [4, 0], [0, -4]];   // dir → 往前衝的方向（平面座標）
  function drawWalker(e, t) {
    if (e.hidden) return;
    var ln = e.kind === "mob" ? { x: 0, y: 0 } : lane(e), ox = ln.x, oy = ln.y;
    // 出手：往面對的方向衝 0.16 秒；被打：左右抖
    var lg = e.lungeAt && t - e.lungeAt < 0.16 ? Math.sin((t - e.lungeAt) / 0.16 * Math.PI) : 0;
    if (lg) { ox += LUNGE[e.dir][0] * lg; oy += LUNGE[e.dir][1] * lg; }
    var hurt = e.hurtAt && t - e.hurtAt < 0.18;
    if (hurt) ox += Math.sin(t * 90) * 1.5;
    var p = ISO.ent(e.px + ox, e.py + oy), x = p.x, y = p.y + 3;
    var moving = !!e.path, frame = moving ? Math.floor(e.anim) % 2 : 0;
    // 走路一步一顛；站著輕輕呼吸；顧店時忙碌地小跳
    var lift = 0, sq = 0;
    if (moving) lift = Math.abs(Math.sin(e.anim * Math.PI)) * 1.5;
    else if (e.st === "work") { lift = Math.abs(Math.sin(t * 6 + e.uid)) * 1.5; frame = Math.floor(t * 3 + e.uid) % 2; }
    else if (e.kind !== "mob") sq = Math.sin(t * 2.2 + e.uid) > 0.55 ? 0.03 : 0;
    var hp = e.hop && e.hop(t);
    if (hp) { lift = hp.h; sq = hp.sq; }
    hits.push({ e: e, x0: x - 11, y0: y - 30 - lift, x1: x + 11, y1: y + 3 });
    shadow(x, y, 1 - lift / 18);
    y -= lift;
    if (e.kind === "mob") {
      var mi = Assets.get("art/chars/mob-" + e.type.id + ".png");
      if (mi) drawSheet(mi, x, y, e.dir, frame, sq, hurt); else drawMobBlob(e, x, y, t);
      return;
    }
    var spr = e.charId ? Assets.get(D.charById[e.charId] ? D.charById[e.charId].sprite : "") : Assets.get("art/chars/soul-" + e.skin + ".png");
    if (spr) { ctx.globalAlpha = e.kind === "soul" ? 0.92 : 1; drawSheet(spr, x, y, e.dir, frame, sq, hurt); ctx.globalAlpha = 1; return; }
    if (e.kind === "soul") drawGhost(x, y, "#f3ebdd", "#ffffff", 0.88, t + e.uid);
    else drawGhost(x, y, "#f3ebdd", hashCol(e.charId || e.job || "x"), 1, t + e.uid);
  }

  function drawBuilding(b) {
    if (R.ghost && R.ghost.move === b) return;   // 搬遷中：原地不畫，只畫跟著手指的預覽
    var spr = buildingSprite(b.def, b.broken, b.flip), o = spriteOrigin(spr, b.x, b.y);
    var dim = (b.broken && !(spr.art && HQ.artIndex.iso[b.def.id].damaged)) || b.closedUntil > State.absWeek();
    if (dim) ctx.filter = "brightness(55%) saturate(60%)";
    var bp = b.builtAt ? (performance.now() / 1000 - b.builtAt) / R.BUILD_SEC : 1;
    if (bp < 1) drawConstruction(b, spr, o, bp);
    else blit(spr.img, o.x, o.y);
    if (dim) ctx.filter = "none";
    hits.push({ b: b, spr: spr, x0: o.x, y0: o.y, x1: o.x + spr.img.width, y1: o.y + spr.img.height });
  }
  // 施工中：先是 GPT 畫的工地（鷹架、木料、瓦片），後半段建築從地面往上長出來、工地淡掉
  R.BUILD_SEC = 2.6;
  function siteSprite(w, h) {
    var key = "build-" + Math.max(w, h) + "x" + Math.min(w, h);
    if (!(HQ.artIndex.iso || {})[key]) key = "build-" + (w * h >= 6 ? "3x3" : w * h >= 4 ? "2x2" : w * h >= 2 ? "2x1" : "1x1");
    var img = Assets.get(Assets.isoPath(key));
    if (!img) return null;
    var spr = { img: img, w: Math.max(w, h), h: Math.min(w, h), ox: 0, oy: 0, art: true };
    return w < h ? flipped(spr) : spr;   // 直的佔地用鏡像
  }
  function drawConstruction(b, spr, o, p) {
    var site = siteSprite(b.w, b.h), so = site && spriteOrigin(site, b.x, b.y);
    var rise = Math.max(0, (p - 0.45) / 0.55), e = 1 - Math.pow(1 - rise, 2);
    // 工地：前半段完整，後半段淡掉
    if (site) { ctx.globalAlpha = rise > 0 ? Math.max(0, 1 - rise * 1.4) : 1; blit(site.img, so.x, so.y + (p < 0.12 ? Math.round((1 - p / 0.12) * 6) : 0)); ctx.globalAlpha = 1; }
    if (rise <= 0) return;
    // 建築從下往上露出來
    var img = spr.img, H = img.height, W = img.width, sy = Math.max(0, Math.floor(H * (1 - e))), sh = H - sy;
    if (sh > 0) ctx.drawImage(img, 0, sy, W, sh, SX(o.x), SY(o.y + sy), W * R.cam.z, sh * R.cam.z);
  }
  function drawStanding(s) {
    var img = Assets.get("art/props/" + s.name + ".png");
    var c = ISO.g(s.x + 0.5, s.y + 0.5);
    if (!img) { px(c.x - 6, c.y - 12, 12, 12, "#3f7a34"); return; }
    blit(img, Math.round(c.x - img.width / 2), Math.round(c.y + 5 - img.height));
  }
  function drawBuildingLabel(b) {
    if (R.ghost && R.ghost.move === b) return;
    var def = b.def, spr = buildingSprite(def, b.broken, b.flip), o = spriteOrigin(spr, b.x, b.y), cx = o.x + spr.img.width / 2;
    var showName = R.showNames && def.cat !== "deco" && def.cat !== "road" && R.cam.z >= dpr * 0.6;
    if (showName) text(def.name, cx, o.y + 6, 8.5, def.cat === "special" ? "#ffe9a8" : "#ffffff");
    if (def.maxLv > 1 && b.lv > 1 && R.cam.z >= dpr * 0.6) text("Lv" + b.lv, o.x + spr.img.width - 6, o.y + spr.img.height - 10, 7.5, "#bff3ea", "right");
    if (b.broken) text("受損", cx, o.y + 14, 8.5, "#ff9a7a");
  }

  function drawBubble(e, t) {
    if (e.hidden || e.kind !== "soul") return;
    var icon = null, key = null, col = "#fffaf0";
    if (e.st === "decide") { key = "star"; icon = "✨"; col = "#ffe38a"; }
    else if (e.st === "reinc" || e.st === "macaron") { key = "lotus"; icon = "🌸"; }
    else if (e.st === "leave") return;
    else { var w = e.wish(); if (!w) return; key = { tattoo: "heart", fun: "lantern", gear: "sword" }[w] || w; icon = (D.wishById[w] || {}).icon || "💭"; }
    var ln = lane(e), hp = e.hop && e.hop(t), p = ISO.ent(e.px + ln.x, e.py + ln.y), bx = p.x, by = p.y - 34 + Math.sin(t * 2 + e.uid) - (hp ? hp.h : 0);
    var r = e.st === "decide" ? 1 + 0.15 * Math.sin(t * 6) : 1;
    px(bx - 8 * r - 1, by - 7 * r - 1, 16 * r + 2, 13 * r + 2, "#3a2a2e");
    px(bx - 8 * r, by - 7 * r, 16 * r, 13 * r, col); px(bx - 1, by + 6 * r, 3, 2, col);
    var im = key && Icons.img(key);
    if (im) blit(im, Math.round(bx - im.width / 2), Math.round(by - im.height / 2));
    else text(icon, bx, by, 8.5 * r * R.cam.z / dpr, "#000", "center", false);
  }

  // ---- 列車：進站減速、停車、加速離站開出地圖 ----
  var TRAIN = { arrive: 1.8, dwell: 3.6, leave: 6.2, stop: 17.2, len: 2, gap: 0.12, cars: 4, v0: 0.1, v1: 0.9 };
  R.TRAIN_SEC = TRAIN.leave;
  function trainFront(t) {
    var A = TRAIN, startU = -2, endU = CFG.W + A.cars * (A.len + A.gap) + 4;
    if (t < A.arrive) { var p = t / A.arrive; return startU + (A.stop - startU) * (1 - (1 - p) * (1 - p)); }
    if (t < A.dwell) return A.stop;
    var q = Math.min(1, (t - A.dwell) / (A.leave - A.dwell)); return A.stop + (endU - A.stop) * q * q;
  }
  function trainCar(u0, i, t) {
    var A = TRAIN, u1 = u0 + A.len, v0 = A.v0, v1 = A.v1, z = 15;
    var fade = Math.min(1, Math.max(0, (u1 + 1) / 3), Math.max(0, (CFG.W + 1 - u0) / 3));
    if (fade <= 0) return;
    ctx.globalAlpha = fade;
    var art = Assets.get(i === 0 ? "art/iso/train-loco.png" : "art/iso/train-car.png");
    if (art) {
      var left = ISO.gx(u0, v1), bottom = ISO.gy(u1, v1);
      blit(art, Math.round(left), Math.round(bottom - art.height + 2));
      ctx.globalAlpha = 1; return;
    }
    var body = i === 0 ? "#2c3566" : "#a8342e", roof = i === 0 ? "#1c2246" : "#5a2a2a";
    function Q(pts, col) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(function (p, k) { var X = SX(p.x), Y = SY(p.y); if (k) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill(); }
    var g = ISO.g;
    Q([g(u0, v1, 0), g(u1, v1, 0), g(u1, v1, z), g(u0, v1, z)], body);                 // 側面（朝左下）
    Q([g(u1, v0, 0), g(u1, v1, 0), g(u1, v1, z), g(u1, v0, z)], shade(i === 0 ? "#2c3566" : "#a8342e", 0.7)); // 車頭／車尾（朝右下）
    Q([g(u0, v0, z), g(u1, v0, z), g(u1, v1, z), g(u0, v1, z)], roof);                 // 車頂
    // 窗戶
    for (var k = 0; k < 4; k++) { var a = u0 + 0.25 + k * 0.42; Q([g(a, v1, 6), g(a + 0.24, v1, 6), g(a + 0.24, v1, 11), g(a, v1, 11)], i === 0 && k < 2 ? "#6a74a8" : "#ffd56a"); }
    Q([g(u0, v1, 0), g(u1, v1, 0), g(u1, v1, 2), g(u0, v1, 2)], "#f3d58c");          // 金色腰線
    if (i === 0) {
      var cpt = g(u1 - 0.35, (v0 + v1) / 2, z);
      px(cpt.x - 2, cpt.y - 7, 5, 7, "#1c2246");
      var smoke = (t * 2) % 1;
      ctx.globalAlpha = fade * (0.6 - smoke * 0.5); px(cpt.x - 3 - smoke * 8, cpt.y - 12 - smoke * 14, 7 + smoke * 4, 5 + smoke * 3, "#e9e4f0");
      ctx.globalAlpha = fade;
      var lamp = g(u1, (v0 + v1) / 2, 6); px(lamp.x - 1, lamp.y - 2, 3, 3, "#ffe38a");
    }
    ctx.globalAlpha = 1;
  }
  function drawTrain(t) {
    var front = trainFront(t), A = TRAIN;
    // 由後往前畫（前面的車廂比較靠右下，蓋住後面）
    for (var i = A.cars - 1; i >= 0; i--) trainCar(front - A.len - i * (A.len + A.gap), i, t);
  }

  // ---- 前後排序：建築用佔地矩形比，人物用腳底格 ----
  function inFrontOf(a, b) {
    // a 的佔地在 b 的右邊或下邊 → a 比較前面
    return a.x0 >= b.x1 || a.y0 >= b.y1;
  }
  function cmp(a, b) {
    if (a.rect && b.rect) { if (inFrontOf(a, b)) return 1; if (inFrontOf(b, a)) return -1; return a.key - b.key; }
    if (a.rect && !b.rect) return (b.gx >= a.x1 || b.gy >= a.y1) ? -1 : 1;
    if (!a.rect && b.rect) return (a.gx >= b.x1 || a.gy >= b.y1) ? 1 : -1;
    return a.key - b.key;
  }

  R.draw = function () {
    var c = R.cam, t = performance.now() / 1000;
    hits = [];
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#1d2236"; ctx.fillRect(0, 0, VW, VH);
    var gl = (Math.floor(t * 1.5) % 2 && MapGen.ground2) ? MapGen.ground2 : MapGen.ground;
    var vx0 = c.x, vy0 = c.y, vx1 = c.x + VW / c.z, vy1 = c.y + VH / c.z;
    if (gl) {
      var sx = Math.max(0, Math.floor(vx0)), sy = Math.max(0, Math.floor(vy0));
      var sw = Math.min(ISO.W - sx, Math.ceil(vx1 - sx) + 1), sh = Math.min(ISO.H - sy, Math.ceil(vy1 - sy) + 1);
      if (sw > 0 && sh > 0) ctx.drawImage(gl, sx, sy, sw, sh, SX(sx), SY(sy), sw * c.z, sh * c.z);
    }
    function visible(x0, y0, x1, y1) { return x1 >= vx0 && x0 <= vx1 && y1 >= vy0 && y0 <= vy1; }

    // 奈何橋標記（還沒蓋的時候）
    var ex = MapGen.exit;
    if (!G.buildings.some(function (b) { return b.def.extra.exit; })) { var ep = ISO.g(ex.x + 0.5, ex.y + 0.5); px(ep.x - 4, ep.y - 3, 8, 3, "#e0423a"); text("奈何橋", ep.x, ep.y - 10, 8, "#ffd8c8"); }

    if (G.train) drawTrain(G.train.t);

    // 建築、樹與道具、人物一起排前後
    var list = [];
    G.buildings.forEach(function (b) {
      var spr = buildingSprite(b.def, b.broken, b.flip), o = spriteOrigin(spr, b.x, b.y);
      if (!visible(o.x, o.y, o.x + spr.img.width, o.y + spr.img.height)) return;
      list.push({ rect: true, x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h, key: b.x + b.y + b.w + b.h, b: b });
    });
    MapGen.standing.forEach(function (s) {
      var p = ISO.g(s.x + 0.5, s.y + 0.5);
      if (!visible(p.x - 24, p.y - 64, p.x + 24, p.y + 12)) return;
      list.push({ rect: true, x0: s.x, y0: s.y, x1: s.x + 1, y1: s.y + 1, key: s.x + s.y + 1, s: s });
    });
    function addE(e) {
      if (e.hidden) return;
      var p = ISO.ent(e.px, e.py);
      if (!visible(p.x - 16, p.y - 40, p.x + 16, p.y + 6)) return;
      list.push({ gx: e.px / T, gy: (e.py - 14) / T, key: ISO.entKey(e.px, e.py), e: e });
    }
    G.souls.forEach(addE);
    G.residents.forEach(function (e) { if (!e.away) addE(e); });
    G.mobs.forEach(addE);
    list.sort(cmp);
    list.forEach(function (it) { if (it.b) drawBuilding(it.b); else if (it.s) drawStanding(it.s); else drawWalker(it.e, t); });

    // 未開放區塊：一層霧
    var gx0 = 0, gx1 = CFG.W - 1;
    MapGen.zones.forEach(function (z) {
      if (MapGen.zoneOpen(z.id)) return;
      ctx.globalAlpha = z.wild ? 0.32 : 0.5;
      ctx.fillStyle = z.wild ? "#4a3a5a" : "#cfd3e6";
      for (var gy = z.y0; gy <= z.y1; gy++) {
        footPath(gx0, gy, gx1 - gx0 + 1, 1); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    // 三途川的氣氛：河面上飄著鬼火，畫面四角暗下來
    for (var wy = 0; wy < CFG.H; wy++) {
      var rx = MapGen.riverX(wy);
      for (var wx = rx - 1; wx <= rx + 1; wx++) {
        var hsh = ((wx * 73856093) ^ (wy * 19349663)) >>> 0;
        if (hsh % 7 !== 0) continue;
        var ph = (hsh % 100) / 100, gp = ISO.g(wx + 0.5, wy + 0.5);
        if (gp.x < vx0 - 10 || gp.x > vx1 + 10 || gp.y < vy0 - 30 || gp.y > vy1 + 10) continue;
        var fy = gp.y - 10 - 6 * Math.sin(t * 1.3 + ph * 6), fx = gp.x + 4 * Math.sin(t * 0.7 + ph * 9);
        var fl = 0.55 + 0.45 * Math.sin(t * 4 + ph * 20);
        ctx.globalAlpha = 0.22 * fl; px(fx - 5, fy - 6, 10, 10, "#7fe0c8");
        ctx.globalAlpha = 0.9 * fl; px(fx - 2, fy - 2, 4, 5, "#7fe0c8"); px(fx - 1, fy - 4, 2, 3, "#bff7ea"); px(fx, fy - 6, 1, 2, "#e8fff8");
        ctx.globalAlpha = 1;
      }
    }
    if (!R._vig || R._vig.w !== VW || R._vig.h !== VH) {
      var vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
      vg.addColorStop(0, "rgba(12,8,24,0)"); vg.addColorStop(1, "rgba(12,8,24,0.55)");
      R._vig = { w: VW, h: VH, g: vg };
    }
    ctx.fillStyle = R._vig.g; ctx.fillRect(0, 0, VW, VH);

    // 標籤、泡泡
    G.buildings.forEach(drawBuildingLabel);
    G.souls.forEach(function (e) { drawBubble(e, t); });
    G.residents.forEach(function (e) {
      if (e.away || e.hidden) return;
      var p = ISO.ent(e.px, e.py);
      if (e.charId && c.z >= dpr * 0.6) text(e.name, p.x, p.y + 8, 7, "#ffe9a8");
      if (e.st === "fight" || e.hp < e.maxhp) { px(p.x - 8, p.y - 32, 16, 3, "#2a1e28"); px(p.x - 7, p.y - 31, 14 * Math.max(0, e.hp / e.maxhp), 1, "#7fe05a"); }
      if (e.st === "work") { px(p.x + 7, p.y - 30, 6, 5, "#8a5a32"); px(p.x + 8, p.y - 31, 4, 1, "#5a3a26"); }
    });
    G.mobs.forEach(function (m) {
      var p = ISO.ent(m.px, m.py);
      if (m.hp < m.maxhp) { px(p.x - 8, p.y - 22, 16, 3, "#2a1e28"); px(p.x - 7, p.y - 21, 14 * Math.max(0, m.hp / m.maxhp), 1, "#ff5a4a"); }
      if (c.z >= dpr * 1.4) text(m.name + " Lv" + m.lv, p.x, p.y + 8, 6.5, "#e6defa");
    });
    // 區塊牌子
    MapGen.zones.forEach(function (z) {
      if (MapGen.zoneOpen(z.id)) return;
      // 牌子放在這一區、畫面中間那一條斜線上，才不會被切掉
      var gyc = Math.min(z.y1 + 0.5, z.y0 + 2), gxc = U.clamp(gyc + ((vx0 + vx1) / 2 - ISO.OX) / ISO.HW, 2, CFG.W - 2), p = ISO.g(gxc, gyc);
      if (z.wild) { text("荒岸（外圍）", p.x, p.y, 10, "#e6c2ff"); return; }
      var nz = Sim.nextZone(), r = Sim.expandReq(z);
      text((nz && nz.id === z.id ? "點這裡擴建：" : "未開放：") + z.name, p.x, p.y - 8, 11, "#ffffff");
      text("☆" + r.star + "・功德 " + r.merit + "（現在是外圍，會有怪）", p.x, p.y + 8, 8, "#3a3550", "center", false);
    });

    // 特效（座標已經是等角像素）
    G.fx.forEach(function (f) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
      if (f.kind === "text") text(f.text, f.x, f.y, 8, f.color);
      else if (f.kind === "ring") {
        var rr = (3 + f.t / f.life * 14) * c.z;
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2 * dpr;
        ctx.beginPath(); ctx.ellipse(SX(f.x), SY(f.y), rr, rr * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
      }
      else px(f.x, f.y, 2, 2, f.color);
      ctx.globalAlpha = 1;
    });

    // 選取中的建築：佔地描金邊、整棟發亮、頭上跳動的箭頭
    if (R.sel && G.buildings.indexOf(R.sel) >= 0) {
      var sb = R.sel, pulse = 0.5 + 0.5 * Math.sin(t * 5);
      footPath(sb.x, sb.y, sb.w, sb.h); ctx.globalAlpha = 0.25 + 0.2 * pulse; ctx.fillStyle = "#ffe38a"; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = "#ffe38a"; ctx.lineWidth = 2 * dpr; ctx.stroke();
      var ss = buildingSprite(sb.def, sb.broken, sb.flip), so = spriteOrigin(ss, sb.x, sb.y);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.18 + 0.17 * pulse; blit(ss.img, so.x, so.y);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      drawArrow(so.x + ss.img.width / 2, so.y - 6 - 3 * Math.abs(Math.sin(t * 4)));
    }

    // 擺放預覽
    var gh = R.ghost;
    if (gh && gh.def) {
      var ok = MapGen.canPlace(gh.def, gh.x, gh.y, gh.flip, gh.move), w = gh.def.size[gh.flip ? 1 : 0], h = gh.def.size[gh.flip ? 0 : 1];
      // 可蓋的格子點點
      var tl = ISO.toWorld(vx0, vy0), br = ISO.toWorld(vx1, vy1), tr = ISO.toWorld(vx1, vy0), bl = ISO.toWorld(vx0, vy1);
      var ax0 = Math.max(0, Math.floor(Math.min(tl.x, bl.x) / T)), ax1 = Math.min(CFG.W - 1, Math.ceil(Math.max(tr.x, br.x) / T));
      var ay0 = Math.max(0, Math.floor(Math.min(tl.y, tr.y) / T)), ay1 = Math.min(CFG.H - 1, Math.ceil(Math.max(bl.y, br.y) / T));
      for (var yy = ay0; yy <= ay1; yy++) for (var xx = ax0; xx <= ax1; xx++) if (MapGen.canBuildTile(xx, yy, gh.def.cat === "road")) { var dp = ISO.g(xx + 0.5, yy + 0.5); px(dp.x - 1, dp.y - 1, 2, 2, "rgba(255,255,255,.55)"); }
      // 拖曳中的建築：佔地閃爍、建築半透明浮起來、四周有箭頭，一看就知道可以拖
      var gp = 0.5 + 0.5 * Math.sin(t * 6), lift = Math.round(3 + 3 * Math.sin(t * 4));
      footPath(gh.x, gh.y, w, h); ctx.globalAlpha = 0.35 + 0.3 * gp; ctx.fillStyle = ok ? "#7fe05a" : "#ff5a4a"; ctx.fill(); ctx.globalAlpha = 1;
      ctx.setLineDash([4 * dpr, 3 * dpr]); ctx.lineDashOffset = -t * 20 * dpr;
      ctx.strokeStyle = ok ? "#ffffff" : "#ffd0c8"; ctx.lineWidth = 2 * dpr; ctx.stroke(); ctx.setLineDash([]);
      var top = 0;
      if (gh.def.cat !== "road") {
        var spr = buildingSprite(gh.def, false, gh.flip), o = spriteOrigin(spr, gh.x, gh.y);
        ctx.globalAlpha = 0.55 + 0.25 * gp; blit(spr.img, o.x, o.y - lift); ctx.globalAlpha = 1;
        top = o.y - lift;
        // 佔地框再描一次在建築上面，才看得到底下的格子
        footPath(gh.x, gh.y, w, h); ctx.setLineDash([4 * dpr, 3 * dpr]); ctx.lineDashOffset = -t * 20 * dpr;
        ctx.strokeStyle = ok ? "#7fe05a" : "#ff5a4a"; ctx.lineWidth = 3 * dpr; ctx.stroke(); ctx.setLineDash([]);
      } else top = ISO.gy(gh.x, gh.y) - 8;
      // 四個方向的箭頭（沿格子的兩條斜軸）
      var cx = ISO.g(gh.x + w / 2, gh.y + h / 2), push = 6 + 2 * gp;
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) {
        var e = ISO.g(gh.x + w / 2 + d[0] * (w / 2 + 0.55), gh.y + h / 2 + d[1] * (h / 2 + 0.55));
        var vx = e.x - cx.x, vy = e.y - cx.y, L = Math.hypot(vx, vy) || 1; vx /= L; vy /= L;
        drawChevron(e.x + vx * push * 0.3, e.y + vy * push * 0.3, vx, vy, ok);
      });
      var lp = ISO.g(gh.x + w / 2, gh.y);
      text(gh.def.name + (ok ? "" : gh.move ? "（這裡放不下）" : "（這裡不能蓋）"), (o ? o.x + spr.img.width / 2 : lp.x), top - 10, 10, ok ? "#ffffff" : "#ffd0c8");
    }
  };

  function drawArrow(x, y) {
    var c = "#ffe38a";
    px(x - 5, y - 9, 10, 2, "#3a2418"); px(x - 4, y - 8, 8, 2, c); px(x - 3, y - 6, 6, 2, c); px(x - 2, y - 4, 4, 2, c); px(x - 1, y - 2, 2, 2, c);
  }
  function drawChevron(x, y, vx, vy, ok) {
    // 小三角形箭頭，指向 (vx, vy)
    var s = 9, nx = -vy, ny = vx;
    ctx.beginPath();
    ctx.moveTo(SX(x + vx * s), SY(y + vy * s));
    ctx.lineTo(SX(x + nx * s * 0.8), SY(y + ny * s * 0.8));
    ctx.lineTo(SX(x - nx * s * 0.8), SY(y - ny * s * 0.8));
    ctx.closePath();
    ctx.fillStyle = ok ? "#ffe38a" : "#ffd0c8"; ctx.fill();
    ctx.strokeStyle = "#3a2418"; ctx.lineWidth = 2 * dpr; ctx.stroke();
  }

  // 點畫面：先找人物、建築的圖（由前往後，透明的地方不算），沒有就回傳 null
  var hitCv = null;
  function opaqueAt(spr, x, y) {
    var img = spr.img;
    if (img.getContext) return img.getContext("2d").getImageData(x, y, 1, 1).data[3] > 0;
    if (!hitCv) hitCv = document.createElement("canvas");
    hitCv.width = img.width; hitCv.height = img.height;
    var g = hitCv.getContext("2d"); g.drawImage(img, 0, 0);
    return g.getImageData(x, y, 1, 1).data[3] > 0;
  }
  R.pick = function (sx, sy) {
    var p = R.toIso(sx, sy);
    for (var i = hits.length - 1; i >= 0; i--) {
      var h = hits[i];
      if (p.x < h.x0 || p.x >= h.x1 || p.y < h.y0 || p.y >= h.y1) continue;
      if (h.e) return { e: h.e };
      if (opaqueAt(h.spr, Math.floor(p.x - h.x0), Math.floor(p.y - h.y0))) return { b: h.b };
    }
    return null;
  };

  return R;
})();
