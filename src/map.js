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

  // ---- 地面圖層 ----
  // 有 E 線的 tileset（art/tiles/ground.png＋index.json）就用；沒有就程式畫色塊
  var TS = null;   // { img, cell(name) → [sx, sy] | null, has(name) }
  M.useTileset = function (img, idxJson) {
    var cols = idxJson.cols || Math.max(1, Math.floor(img.width / 32));
    var tiles = idxJson.tiles || {};
    function cell(name) {
      var v = tiles[name];
      if (!v && idxJson.alias && idxJson.alias[name]) v = tiles[idxJson.alias[name]];
      if (!v) return null;
      if (typeof v === "number") return [(v % cols) * 32, Math.floor(v / cols) * 32];
      if (v.i != null) return [(v.i % cols) * 32, Math.floor(v.i / cols) * 32];
      if (v.x != null) return [v.x, v.y];
      return null;
    }
    TS = { img: img, cell: cell };
    M.redrawGround();
  };
  M.tileset = function () { return TS; };

  function h2(x, y, k) { var n = (x * 374761393 + y * 668265263 + k * 1013904223) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
  function isWet(x, y) { if (!inb(x, y)) return false; var k = M.kind[idx(x, y)]; return k === K.WATER || k === K.BRIDGE; }

  function blit(g, name, x, y) { var c = TS.cell(name); if (!c) return false; g.drawImage(TS.img, c[0], c[1], T, T, x * T, y * T, T, T); return true; }
  function pick(g, names, x, y, salt) { for (var i = 0; i < 3; i++) { var n = names[Math.floor(h2(x, y, salt + i) * names.length)]; if (blit(g, n, x, y)) return true; } return blit(g, names[0], x, y); }
  function drawProp(g, name, x, y) {
    var img = Assets.get("art/props/" + name + ".png");
    if (!img) return false;
    g.drawImage(img, x * T + Math.round((T - img.width) / 2), (y + 1) * T - img.height - 1);
    return true;
  }

  function drawTileTS(g, x, y, frame) {
    var i = idx(x, y), k = M.kind[i];
    var water = frame ? "water_1" : "water_0";
    if (k === K.WATER) return blit(g, water, x, y);
    if (k === K.BRIDGE) {
      blit(g, water, x, y);
      var wl = inb(x - 1, y) && M.kind[idx(x - 1, y)] === K.BRIDGE, wr = inb(x + 1, y) && M.kind[idx(x + 1, y)] === K.BRIDGE;
      return blit(g, !wl ? "bridge_h_a" : !wr ? "bridge_h_b" : "bridge_h_m", x, y);
    }
    if (k === K.RAIL) { blit(g, y === 0 ? "barren_0" : "dirt_1", x, y); return false; }
    // 陸地：先判斷是不是河岸
    var n = isWet(x, y - 1), s = isWet(x, y + 1), w = isWet(x - 1, y), e = isWet(x + 1, y), bank = null;
    if (n && w) bank = "bank_nw"; else if (n && e) bank = "bank_ne"; else if (s && w) bank = "bank_sw"; else if (s && e) bank = "bank_se";
    else if (n) bank = "bank_n"; else if (s) bank = "bank_s"; else if (w) bank = "bank_w"; else if (e) bank = "bank_e";
    else if (isWet(x - 1, y - 1)) bank = "bank_inw"; else if (isWet(x + 1, y - 1)) bank = "bank_ine"; else if (isWet(x - 1, y + 1)) bank = "bank_isw"; else if (isWet(x + 1, y + 1)) bank = "bank_ise";
    var base = k === K.STONE ? ["stone_0", "stone_1"] : k === K.PATH ? ["dirt_0", "dirt_1"] : k === K.RED ? ["redline_0", "redline_1"] :
      (k === K.BARREN || (k === K.PROP && M.zone[i] === 4)) ? ["barren_0", "barren_1"] : ["grass_0", "grass_1", "grass_2", "grass_0"];
    if (bank && (k === K.GRASS || k === K.FLOWER || k === K.TREE || k === K.PROP || k === K.BARREN)) { blit(g, water, x, y); blit(g, bank, x, y); }
    else pick(g, base, x, y, 3);
    if (k === K.FLOWER) { if (!bank) blit(g, h2(x, y, 9) < 0.5 ? "grass_flower" : "grass_1", x, y); blit(g, h2(x, y, 7) < 0.5 ? "lily_a" : "lily_b", x, y); }
    else if (k === K.GRASS && !bank && h2(x, y, 11) < 0.12) blit(g, h2(x, y, 12) < 0.6 ? "grass_tuft" : "pebbles", x, y);
    return true;
  }

  // 沒有 tileset 時的程式色塊
  var PAL = {
    grass: ["#2f4a2a", "#3a5a30", "#4f7a3a"], path: ["#5a3a26", "#6e4a2e", "#8a5a36"], stone: ["#4a4470", "#5f5a8a", "#3a355c"],
    water: ["#1e4a55", "#2e6b73", "#4fa3a5"], rail: ["#221f3d", "#5a3a26", "#8f86a6"], bridge: ["#8a5a36", "#c08a52", "#5a3a26"],
    flower: ["#a8242e", "#e0423a", "#4f7a3a"], barren: ["#2c2848", "#3a355c", "#4a4470"], red: ["#6b1a22", "#a8242e", "#e0423a"]
  };
  function speckle(g, p, x, y, n) { for (var i = 0; i < n; i++) { g.fillStyle = h2(x, y, i) < 0.5 ? p[1] : p[2]; g.fillRect(x * T + ((h2(x, y, i + 30) * 15) | 0) * 2, y * T + ((h2(x, y, i + 60) * 15) | 0) * 2, 2, 2); } }
  function drawTileProc(g, kind, x, y, frame) {
    var px = x * T, py = y * T, p, i;
    switch (kind) {
      case K.GRASS: case K.TREE: case K.PROP: case K.FLOWER:
        p = M.zone[idx(x, y)] === 4 ? PAL.barren : PAL.grass; g.fillStyle = p[0]; g.fillRect(px, py, T, T); speckle(g, p, x, y, 14);
        if (kind === K.FLOWER) for (i = 0; i < 5; i++) {
          var fx = px + 3 + ((h2(x, y, i + 5) * 12) | 0) * 2, fy = py + 6 + ((h2(x, y, i + 9) * 10) | 0) * 2;
          g.fillStyle = PAL.flower[2]; g.fillRect(fx + 1, fy + 2, 1, 4);
          g.fillStyle = h2(x, y, i) < 0.5 ? PAL.flower[0] : PAL.flower[1]; g.fillRect(fx, fy, 3, 2);
        }
        if (kind === K.TREE) { g.fillStyle = "#3a2a1e"; g.fillRect(px + 14, py + 18, 4, 12); g.fillStyle = "#2f4a2a"; g.fillRect(px + 4, py + 2, 24, 18); g.fillStyle = "#16142b"; g.fillRect(px + 4, py + 16, 24, 4); }
        if (kind === K.PROP) { g.fillStyle = "#4a4470"; g.fillRect(px + 8, py + 14, 16, 12); g.fillStyle = "#5f5a8a"; g.fillRect(px + 10, py + 12, 10, 4); }
        break;
      case K.BARREN: p = PAL.barren; g.fillStyle = p[0]; g.fillRect(px, py, T, T); speckle(g, p, x, y, 10); break;
      case K.PATH: p = PAL.path; g.fillStyle = p[1]; g.fillRect(px, py, T, T); speckle(g, p, x, y, 10); break;
      case K.RED: p = PAL.red; g.fillStyle = p[0]; g.fillRect(px, py, T, T); g.fillStyle = p[2]; g.fillRect(px, py + 15, T, 2); break;
      case K.STONE:
        p = PAL.stone; g.fillStyle = p[0]; g.fillRect(px, py, T, T);
        g.fillStyle = p[2]; g.fillRect(px, py + 15, T, 2); g.fillRect(px + 15, py, 2, 15); g.fillRect(px + 7, py + 17, 2, 15); g.fillRect(px + 25, py + 17, 2, 15);
        break;
      case K.WATER:
        p = PAL.water; g.fillStyle = p[0]; g.fillRect(px, py, T, T);
        for (i = 0; i < 4; i++) { g.fillStyle = p[1]; g.fillRect(px + ((h2(x, y, i + frame) * 12) | 0) * 2, py + 4 + i * 7, 8, 2); }
        break;
      case K.RAIL:
        g.fillStyle = y === 0 ? "#16142b" : PAL.rail[0]; g.fillRect(px, py, T, T);
        break;
      case K.BRIDGE:
        drawTileProc(g, K.WATER, x, y, frame);
        p = PAL.bridge; g.fillStyle = p[0]; g.fillRect(px, py + 4, T, 24);
        g.fillStyle = p[2]; for (i = 0; i < 8; i++) g.fillRect(px + i * 4, py + 4, 1, 24);
        g.fillStyle = p[1]; g.fillRect(px, py + 3, T, 2); g.fillRect(px, py + 27, T, 2);
        break;
    }
  }
  function drawRails(g, x) {
    // 鐵軌（兩條軌道＋枕木），tileset 沒有軌道，一律程式畫
    var px = x * T, py = T;
    g.fillStyle = "#5a3a26"; for (var i = 0; i < 4; i++) g.fillRect(px + i * 8 + 1, py + 8, 4, 18);
    g.fillStyle = "#8f86a6"; g.fillRect(px, py + 11, T, 2); g.fillRect(px, py + 21, T, 2);
  }

  function drawTile(g, x, y, frame) {
    var i = idx(x, y), k = M.kind[i];
    if (!(TS && drawTileTS(g, x, y, frame))) drawTileProc(g, k, x, y, frame);
    if (k === K.RAIL && y === 1) drawRails(g, x);
  }
  // 高的點綴（樹、道具）要等整張地面畫完再由上往下疊，才不會被下一列蓋掉
  function drawTall(g) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = idx(x, y), k = M.kind[i];
      if (k === K.TREE) drawProp(g, "willow", x, y);
      else if (k === K.PROP) drawProp(g, M.prop[i], x, y);
    }
  }

  M.redrawGround = function () {
    var frames = [0, 1];
    frames.forEach(function (f) {
      var key = f ? "ground2" : "ground";
      if (!M[key]) { M[key] = document.createElement("canvas"); M[key].width = W * T; M[key].height = H * T; }
      var g = M[key].getContext("2d");
      g.imageSmoothingEnabled = false;
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) drawTile(g, x, y, f);
      drawTall(g);
    });
    if (window.Render) Render.dirty = true;
  };
  var redrawT = null;
  M.redrawSoon = function () { clearTimeout(redrawT); redrawT = setTimeout(M.redrawGround, 60); };
  M.redrawTile = function () { M.redrawSoon(); };

  return M;
})();
