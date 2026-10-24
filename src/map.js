// 地圖：格子、三途川、區塊（可擴建）、佔地、尋路、地面圖層。
window.K = { GRASS: 0, PATH: 1, STONE: 2, WATER: 3, FLOWER: 5, RAIL: 6, BRIDGE: 7, TREE: 8, RED: 9, BARREN: 10, PROP: 11 };

window.MapGen = (function () {
  var W = CFG.W, H = CFG.H, T = CFG.TILE;
  var M = {
    kind: new Uint8Array(W * H),
    zone: new Uint8Array(W * H),
    occ: new Int32Array(W * H),     // 建築 uid
    prop: {},                       // idx → 點綴名稱（art/props）
    ground: null, ground2: null,    // 地面圖層（兩格水波動畫）
    exit: { x: 0, y: 0 },           // 投胎出口（奈何橋門口）
    stationDoor: { x: 14, y: 4 },
    // 區塊：0 起始街區；1～3 可擴建；4 荒岸（永遠是外圍，越下游越強）
    zones: [
      { id: 0, name: "業鏡街", y0: 2, y1: 19 },
      { id: 1, name: "返魂坂", y0: 20, y1: 29 },
      { id: 2, name: "守宮河堤", y0: 30, y1: 39 },
      { id: 3, name: "彼岸渡口", y0: 40, y1: 44 },
      { id: 4, name: "荒岸", y0: 45, y1: 47, wild: true }
    ],
    // 開局固定建築的位置（B 的 fixed: true）
    FIXED_POS: { station: [13, 2], cityhall: [5, 8], naihe: [19, 14] }
  };
  M.W = W; M.H = H;

  function idx(x, y) { return y * W + x; }
  function inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
  function riverX(y) { return Math.round(22 + 3 * Math.sin(y / 5.5)); }
  M.idx = idx; M.inb = inb; M.riverX = riverX;

  // 固定亂數，讓每次開新局地圖長一樣（存檔不必存地形，只存蓋過的路）
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  M.generate = function () {
    seed = 7;
    M.prop = {};
    var x, y, i;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      i = idx(x, y);
      M.kind[i] = K.GRASS; M.occ[i] = 0;
      var z = 4;
      for (var zi = 0; zi < M.zones.length; zi++) if (y >= M.zones[zi].y0 && y <= M.zones[zi].y1) z = zi;
      if (y < 2) z = 0;
      M.zone[i] = z;
      if (z === 4) M.kind[i] = K.BARREN;
    }
    for (y = 0; y < H; y++) { var cx = riverX(y); for (x = cx - 1; x <= cx + 1; x++) if (inb(x, y)) M.kind[idx(x, y)] = K.WATER; }
    for (x = 0; x < W; x++) { M.kind[idx(x, 0)] = K.RAIL; M.kind[idx(x, 1)] = K.RAIL; }
    // 主街：車站往下的石板路，接土路
    for (y = 4; y < H - 1; y++) { M.kind[idx(14, y)] = y < 20 ? K.STONE : K.PATH; if (y < 20) M.kind[idx(15, y)] = K.STONE; }
    function cross(y, k) { for (x = 3; x < W - 2; x++) { var i2 = idx(x, y); M.kind[i2] = M.kind[i2] === K.WATER ? K.BRIDGE : k; } }
    cross(10, K.STONE); cross(17, K.PATH); cross(25, K.PATH); cross(35, K.PATH); cross(42, K.PATH);
    M.exit = { x: riverX(17), y: 17 };
    function putProp(x, y, name) { var i3 = idx(x, y); M.kind[i3] = K.PROP; M.prop[i3] = name; }
    // 點綴
    for (y = 2; y < H; y++) for (x = 0; x < W; x++) {
      i = idx(x, y);
      var k = M.kind[i];
      if (k !== K.GRASS && k !== K.BARREN) continue;
      var nearWater = (inb(x - 1, y) && M.kind[idx(x - 1, y)] === K.WATER) || (inb(x + 1, y) && M.kind[idx(x + 1, y)] === K.WATER);
      var edge = x === 0 || x === W - 1 || y === H - 1;
      if (M.zone[i] === 4) {
        if (rnd() < 0.16) putProp(x, y, nearWater ? U_pick(["reeds", "brokenboat", "reeds"]) : U_pick(["deadwillow", "graves", "rocks", "stump", "talismanpost", "brokentoro", "miasma", "brokenfence"]));
      } else if (edge && rnd() < 0.6) M.kind[i] = K.TREE;
      else if (M.zone[i] > 0 && rnd() < 0.05) putProp(x, y, U_pick(["rocks", "reeds", "stump", "brokenfence"]));
      else if (nearWater && rnd() < 0.3) M.kind[i] = K.FLOWER;
      else if (rnd() < 0.04) M.kind[i] = K.FLOWER;
    }
    putProp(12, 3, "toro"); putProp(16, 3, "toro"); putProp(17, 2, "noticeboard"); putProp(18, 18, "jizo");
    M.stationDoor = { x: 14, y: 4 };
  };
  function U_pick(a) { return a[Math.floor(rnd() * a.length)]; }

  // ---- 查詢 ----
  M.walkable = function (x, y) {
    if (!inb(x, y)) return false;
    var i = idx(x, y), k = M.kind[i];
    if (k === K.WATER || k === K.RAIL || k === K.TREE || k === K.PROP) return false;
    return M.occ[i] === 0;
  };
  M.zoneOpen = function (z) { return z === 0 || (G.state && G.state.zones.indexOf(z) >= 0); };
  M.tileOpen = function (x, y) { return inb(x, y) && M.zoneOpen(M.zone[idx(x, y)]); };
  M.canBuildTile = function (x, y, isRoad) {
    if (!inb(x, y) || y < 2) return false;
    var i = idx(x, y), k = M.kind[i];
    if (!M.zoneOpen(M.zone[i]) || M.occ[i]) return false;
    if (isRoad) return k === K.GRASS || k === K.FLOWER || k === K.PATH || k === K.STONE || k === K.RED;
    return k === K.GRASS || k === K.FLOWER;
  };
  M.canPlace = function (def, x, y) {
    var isRoad = def.cat === "road";
    for (var dy = 0; dy < def.size[1]; dy++) for (var dx = 0; dx < def.size[0]; dx++) if (!M.canBuildTile(x + dx, y + dy, isRoad)) return false;
    if (isRoad) return M.kind[idx(x, y)] !== M.roadKind(def);
    return !!M.doorFor({ x: x, y: y, w: def.size[0], h: def.size[1] });
  };
  M.roadKind = function (def) { return def.tile === "dirt" ? K.PATH : def.tile === "redline" ? K.RED : K.STONE; };
  M.setOcc = function (b, v) {
    for (var dy = 0; dy < b.h; dy++) for (var dx = 0; dx < b.w; dx++) if (inb(b.x + dx, b.y + dy)) M.occ[idx(b.x + dx, b.y + dy)] = v;
  };
  // 門口：佔地下方中間優先，再找四周可走的格
  M.doorFor = function (b) {
    var cands = [], x, y;
    var mid = b.x + Math.floor((b.w - 1) / 2);
    cands.push([mid, b.y + b.h]);
    for (x = b.x; x < b.x + b.w; x++) cands.push([x, b.y + b.h]);
    for (y = b.y + b.h - 1; y >= b.y; y--) { cands.push([b.x - 1, y]); cands.push([b.x + b.w, y]); }
    for (x = b.x; x < b.x + b.w; x++) cands.push([x, b.y - 1]);
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (!inb(c[0], c[1]) || c[1] < 2) continue;
      if (M.walkable(c[0], c[1])) return { x: c[0], y: c[1] };
    }
    return null;
  };

  // ---- 尋路（BFS，地圖小，夠快） ----
  var prev = new Int32Array(W * H), seen = new Uint32Array(W * H), stamp = 0, queue = new Int32Array(W * H);
  // opts.wild: 可以走進還沒開放的區塊（街坊巡守用）
  M.path = function (sx, sy, tx, ty, opts) {
    if (!inb(sx, sy) || !inb(tx, ty)) return null;
    var wild = opts && opts.wild;
    stamp++;
    var s = idx(sx, sy), t = idx(tx, ty), qh = 0, qt = 0;
    queue[qt++] = s; seen[s] = stamp; prev[s] = -1;
    var DIRS = [1, 0, -1, 0, 0, 1, 0, -1];
    while (qh < qt) {
      var c = queue[qh++];
      if (c === t) break;
      var cx = c % W, cy = (c / W) | 0;
      for (var d = 0; d < 8; d += 2) {
        var nx = cx + DIRS[d], ny = cy + DIRS[d + 1];
        if (!inb(nx, ny)) continue;
        var n = idx(nx, ny);
        if (seen[n] === stamp) continue;
        if (n !== t && !M.walkable(nx, ny)) continue;
        if (!wild && n !== t && !M.zoneOpen(M.zone[n]) && ny >= 2) continue;
        seen[n] = stamp; prev[n] = c; queue[qt++] = n;
      }
    }
    if (seen[t] !== stamp) return null;
    var out = [], p = t;
    while (p !== -1 && p !== s) { out.push({ x: p % W, y: (p / W) | 0 }); p = prev[p]; }
    out.reverse();
    return out;
  };

  M.randomWalkable = function (zoneFilter) {
    for (var tries = 0; tries < 200; tries++) {
      var x = (Math.random() * W) | 0, y = 2 + ((Math.random() * (H - 2)) | 0);
      if (!M.walkable(x, y)) continue;
      if (zoneFilter && !zoneFilter(M.zone[idx(x, y)])) continue;
      return { x: x, y: y };
    }
    return null;
  };

  // ---- 地面圖層（等角） ----
  // 程式畫 48×24 的菱形地磚，整張地面先畫進一張大畫布（水波兩格動畫各一張）。
  // 樹、道具這些站著的東西不畫進地面，交給 Render 跟人物一起依前後排序。
  var TS = null;
  M.useTileset = function (img, idxJson) { TS = { img: img, idx: idxJson }; };   // 舊的正交 tileset，等角版不用
  M.tileset = function () { return null; };

  function h2(x, y, k) { var n = (x * 374761393 + y * 668265263 + k * 1013904223) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
  function isWet(x, y) { if (!inb(x, y)) return false; var k = M.kind[idx(x, y)]; return k === K.WATER || k === K.BRIDGE; }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }

  // 開羅式明亮配色，帶一點黃泉的暮色
  var C = {
    grass: ["#5ea84a", "#4f963f", "#72bd58", "#86cc66"], dark: ["#4a8a3c", "#3f7a34"],
    dirt: ["#d8b06c", "#c69d58", "#e6c68a"], stone: ["#aaa6c0", "#8f8aa8", "#c3bfd6", "#7a7594"],
    red: ["#cf4d45", "#b23c36", "#e56b5e"], barren: ["#958a72", "#7e7460", "#5f574a", "#a89c80"],
    water: ["#3ca9bd", "#3297ad", "#8fdde2", "#2a8299"], bank: ["#dcc48e", "#b99c66"],
    rail: ["#8b8174", "#6e655a", "#a39a8c"], plank: ["#b27a44", "#8a5a32", "#cf9a5e"],
    flower: ["#d8342f", "#f15c4b", "#9a1f24"], soil: ["#8a6440", "#6c4c30", "#5a3e27", "#4a8a3c"]
  };
  Object.keys(C).forEach(function (k) { C[k] = C[k].map(hex); });

  // 菱形遮罩：第 y 列的左右範圍
  var TW = ISO.TW, TH = ISO.TH;
  function rowSpan(y) { var hw = y < TH / 2 ? 2 * (y + 1) : 2 * (TH - y); return [TW / 2 - hw, TW / 2 + hw]; }
  // 到四個邊的距離（0 = 在邊上）：ul 左上鄰 (x-1)、ur 右上鄰 (y-1)、lr 右下鄰 (x+1)、ll 左下鄰 (y+1)
  function edgeDist(px, py) {
    var u = (px + 0.5) / (TW / 2) - 1, v = (py + 0.5) / (TH / 2) - 1;
    return { ul: 1 + u + v, ur: 1 - u + v, lr: 1 - u - v, ll: 1 + u - v };
  }

  function tileColor(x, y, k, px, py, frame) {
    var n = h2(x * 64 + px, y * 64 + py, 1), n2 = h2(x * 64 + px, y * 64 + py, 2);
    var zone4 = M.zone[idx(x, y)] === 4;
    switch (k) {
      case K.WATER: case K.BRIDGE: {
        var e = edgeDist(px, py);
        // 鄰格是陸地的那一邊畫沙岸
        var land = [["ul", x - 1, y], ["ur", x, y - 1], ["lr", x + 1, y], ["ll", x, y + 1]];
        for (var i = 0; i < 4; i++) {
          var L = land[i]; if (!inb(L[1], L[2]) || isWet(L[1], L[2])) continue;
          var d = e[L[0]];
          if (d < 0.16) return d < 0.08 ? C.bank[0] : C.bank[1];
          if (d < 0.3) return C.water[3];
        }
        if (k === K.BRIDGE) {
          var along = isWet(x - 1, y) && M.kind[idx(x - 1, y)] === K.BRIDGE || isWet(x + 1, y) && M.kind[idx(x + 1, y)] === K.BRIDGE;
          var e2 = edgeDist(px, py), side = along ? Math.min(e2.ur, e2.ll) : Math.min(e2.ul, e2.lr);
          if (side > 0.18) { var plank = along ? ((px + 2 * py) >> 2) % 3 : ((px - 2 * py + 96) >> 2) % 3; return plank === 0 ? C.plank[1] : (n < 0.15 ? C.plank[2] : C.plank[0]); }
        }
        var wave = ((px + y * 7 + (frame ? 6 : 0)) % 16 < 3) && ((py + x * 5) % 6 === 0);
        return wave ? C.water[2] : n < 0.5 ? C.water[0] : C.water[1];
      }
      case K.PATH: return n < 0.12 ? C.dirt[1] : n > 0.92 ? C.dirt[2] : C.dirt[0];
      case K.STONE: {
        // 石板：斜向縫線
        var a = (px + 2 * py) % 24, b = (px - 2 * py + 96) % 24;
        if (a === 0 || b === 0) return C.stone[1];
        return n < 0.1 ? C.stone[3] : n > 0.9 ? C.stone[2] : C.stone[0];
      }
      case K.RED: {
        var e3 = edgeDist(px, py);
        if (Math.min(e3.ul, e3.ur, e3.lr, e3.ll) < 0.12) return C.stone[1];
        return n < 0.15 ? C.red[1] : n > 0.9 ? C.red[2] : C.red[0];
      }
      case K.RAIL: return n < 0.3 ? C.rail[1] : n > 0.85 ? C.rail[2] : C.rail[0];
      case K.BARREN: return n < 0.12 ? C.barren[1] : n > 0.95 ? C.barren[2] : n > 0.88 ? C.barren[3] : C.barren[0];
      default: {
        if (zone4) return n < 0.12 ? C.barren[1] : n > 0.93 ? C.barren[3] : C.barren[0];
        // 草：雜點＋小草叢
        if (k === K.FLOWER && n2 < 0.05) return n < 0.5 ? C.flower[0] : C.flower[1];
        if (k === K.FLOWER && n2 < 0.07) return C.flower[2];
        var tuft = h2(x, y, 5) < 0.35 && Math.abs(px - 12 - ((h2(x, y, 6) * 24) | 0)) < 2 && Math.abs(py - 8 - ((h2(x, y, 7) * 8) | 0)) < 2;
        if (tuft) return py % 2 ? C.grass[3] : C.dark[0];
        return n < 0.1 ? C.grass[1] : n > 0.93 ? C.grass[2] : C.grass[0];
      }
    }
  }

  function drawTile(img, x, y, frame) {
    var k = M.kind[idx(x, y)];
    var ox = ISO.gx(x, y) - TW / 2, oy = ISO.gy(x, y), Wd = img.width, data = img.data;
    for (var py = 0; py < TH; py++) {
      var sp = rowSpan(py), yy = oy + py;
      for (var px = sp[0]; px < sp[1]; px++) {
        var c = tileColor(x, y, k, px, py, frame), o = (yy * Wd + ox + px) * 4;
        data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255;
      }
    }
    // 鐵軌：枕木＋兩條軌道（沿 x 方向）
    if (k === K.RAIL && y === 0) for (py = 0; py < TH; py++) {
      sp = rowSpan(py); yy = oy + py;
      for (px = sp[0]; px < sp[1]; px++) {
        var e = edgeDist(px, py), across = e.ll;   // 0 在下緣（y+1 那邊）
        var col = null;
        if (Math.abs(across - 0.55) < 0.05 || Math.abs(across - 1.35) < 0.05) col = [196, 190, 205];
        else if (across > 0.4 && across < 1.5 && (((px + 2 * py) >> 1) % 6 === 0)) col = [110, 74, 46];
        if (col) { o = (yy * Wd + ox + px) * 4; data[o] = col[0]; data[o + 1] = col[1]; data[o + 2] = col[2]; }
      }
    }
  }
  // 地圖邊緣的土台側面（左下、右下兩面）
  function drawSlab(img, x, y, face) {
    var Wd = img.width, data = img.data, S = ISO.SLAB, wet = isWet(x, y);
    var bx = ISO.gx(x, y), by = ISO.gy(x, y);
    for (var i = 0; i < TW / 2; i++) {
      var X = face === "ll" ? bx - TW / 2 + i : bx + i;
      var top = face === "ll" ? by + TH / 2 + (i >> 1) : by + TH - (i >> 1) - 1;
      for (var j = 1; j <= S; j++) {
        var c;
        if (wet) c = j < 3 ? C.water[2] : C.water[3];
        else c = j <= 2 ? C.soil[3] : (j + (h2(x * 32 + i, y, j) < 0.2 ? 1 : 0)) % 6 === 0 ? C.soil[2] : C.soil[face === "ll" ? 0 : 1];
        if (face === "lr" && !wet) c = c.map(function (v) { return v * 0.85; });
        var o = ((top + j) * Wd + X) * 4;
        data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255;
      }
    }
  }

  // 站著的點綴（樹、道具），Render 每格依前後排序畫
  M.standing = [];
  M.redrawGround = function () {
    M.standing = [];
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = idx(x, y), k = M.kind[i];
      if (k === K.TREE) M.standing.push({ x: x, y: y, name: "willow" });
      else if (k === K.PROP) M.standing.push({ x: x, y: y, name: M.prop[i] });
    }
    [0, 1].forEach(function (f) {
      var key = f ? "ground2" : "ground";
      if (!M[key]) { M[key] = document.createElement("canvas"); M[key].width = ISO.W; M[key].height = ISO.H; }
      var g = M[key].getContext("2d");
      var img = g.createImageData(ISO.W, ISO.H);
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) drawTile(img, x, y, f);
      for (x = 0; x < W; x++) drawSlab(img, x, H - 1, "ll");
      for (y = 0; y < H; y++) drawSlab(img, W - 1, y, "lr");
      g.putImageData(img, 0, 0);
    });
    if (window.Render) Render.dirty = true;
  };
  var redrawT = null;
  M.redrawSoon = function () { clearTimeout(redrawT); redrawT = setTimeout(M.redrawGround, 60); };
  M.redrawTile = function () { M.redrawSoon(); };

  return M;
})();
