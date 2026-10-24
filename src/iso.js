// 等角投影（開羅《冒險村物語 2》的角度）：格子邏輯不變，只有畫面換成 2:1 菱形。
// 「正交世界座標」= 遊戲邏輯用的 px（一格 CFG.TILE=32）；「等角座標」= 畫面上的像素（一格菱形 48×24）。
window.ISO = (function () {
  var T = CFG.TILE, HW = 24, HH = 12;
  var I = { TW: HW * 2, TH: HH * 2, HW: HW, HH: HH, SLAB: 16, OY: 120 };
  I.OX = CFG.H * HW + 8;
  I.W = (CFG.W + CFG.H) * HW + 16;
  I.H = (CFG.W + CFG.H) * HH + I.OY + I.SLAB + 24;

  // 格子座標（可帶小數）→ 等角像素。高度 z 往上。
  I.gx = function (gx, gy) { return (gx - gy) * HW + I.OX; };
  I.gy = function (gx, gy, z) { return (gx + gy) * HH + I.OY - (z || 0); };
  I.g = function (gx, gy, z) { return { x: I.gx(gx, gy), y: I.gy(gx, gy, z) }; };
  // 正交世界座標（地面上的點）→ 等角
  I.p = function (wx, wy) { return I.g(wx / T, wy / T); };
  // 人物：邏輯上腳底在格子偏下（y*32+30），畫面上改站在菱形中心
  I.ent = function (px, py) { return I.g(px / T, (py - 14) / T); };
  I.entKey = function (px, py) { return px / T + (py - 14) / T; };
  // 等角像素 → 正交世界座標（點地面用）
  I.toWorld = function (X, Y) {
    var a = (X - I.OX) / HW, b = (Y - I.OY) / HH;
    return { x: (a + b) / 2 * T, y: (b - a) / 2 * T };
  };
  // 建築佔地 w×h 的圖寬與底邊：圖的左緣對齊佔地左角，底邊對齊佔地下角
  I.footW = function (w, h) { return (w + h) * HW; };
  I.footLeft = function (x, y, h) { return I.gx(x, y + h); };
  I.footBottom = function (x, y, w, h) { return I.gy(x + w, y + h); };
  return I;
})();
